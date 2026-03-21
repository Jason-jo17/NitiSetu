from app.ai.claude_client import bridge_ai
from app.core.database import get_supabase
from typing import Dict, Any, List
import base64
import logging

logger = logging.getLogger(__name__)

class InspectionService:
    
    CDSCO_INSPECTION_TEMPLATE = {
        "section_a": "Investigator site identification and general information",
        "section_b": "Subjects: Records, Informed Consent, Screening/Enrollment",
        "section_c": "Source documents, CRFs, adverse event recording",
        "section_d": "Investigational product accountability and storage",
        "section_e": "Ethics committee (IEC) compliance and oversight",
        "section_f": "Sponsor/CRO obligations and monitoring",
        "section_g": "Finding classification and CAPA requirements",
        "section_h": "Corrective and Preventive Action requirements"
    }
    
    async def process_inspection(
        self,
        document_id: str,
        image_paths: List[str] = None
    ) -> Dict[str, Any]:
        
        # Get OCR text if document is image/scan
        ocr_text = await self._extract_with_paddle(document_id, image_paths)
        
        # Generate formal CDSCO report using Bridge Layer AI
        system = bridge_ai.INSPECTION_SYSTEM
        
        user_prompt = f"""
Convert these unstructured inspection observations into a formal CDSCO GCP Inspection Report.

TEMPLATE SECTIONS TO FILL:
{self.CDSCO_INSPECTION_TEMPLATE}

For each finding, classify as:
- CRITICAL: Likely to have caused serious harm or poses immediate risk
- MAJOR: Significant departure from GCP, may affect integrity of data/subject safety  
- MINOR: Minor departure from GCP, unlikely to cause significant harm
- OBSERVATION: Best practice recommendation

Return JSON:
{{
    "site_name": "string",
    "inspection_date": "string",
    "inspector_name": "string",
    "sections": {{
        "section_a": {{"content": "string", "findings": []}},
        "section_b": {{"content": "string", "findings": []}},
        ...
    }},
    "findings_summary": {{
        "critical": [],
        "major": [],
        "minor": [],
        "observations": []
    }},
    "overall_compliance_rating": "satisfactory|conditional|unsatisfactory",
    "capa_required": true|false,
    "capa_items": []
}}

RAW INSPECTION OBSERVATIONS:
{ocr_text}
"""
        
        result = await bridge_ai.complete_json(system=system, user=user_prompt, max_tokens=6000)
        
        # Generate markdown report
        markdown = self._to_markdown(result)
        
        return {
            "extracted_observations": [result.get("findings_summary", {})],
            "formatted_report_markdown": markdown,
            "formatted_report_html": self._md_to_html(markdown),
            "sections": result.get("sections", {}),
            "compliance_rating": result.get("overall_compliance_rating", "conditional")
        }
    
    async def _extract_with_paddle(self, document_id: str, image_paths: List[str] = None) -> str:
        """Use PaddleOCR for handwritten/scanned inspection forms."""
        try:
            from paddleocr import PaddleOCR
            ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
            
            from app.features.documents.service import document_service
            text = await document_service.get_document_text(document_id)
            
            if image_paths:
                all_text = [text]
                for img_path in image_paths:
                    result = ocr.ocr(img_path, cls=True)
                    if result and result[0]:
                        page_text = "\n".join([line[1][0] for line in result[0]])
                        all_text.append(page_text)
                return "\n\n".join(all_text)
            
            return text
        except Exception as e:
            logger.warning(f"PaddleOCR failed, using text extraction: {e}")
            from app.features.documents.service import document_service
            return await document_service.get_document_text(document_id)
    
    def _to_markdown(self, data: dict) -> str:
        lines = [
            f"# CDSCO GCP Inspection Report",
            f"\n**Site:** {data.get('site_name', 'N/A')}",
            f"**Inspection Date:** {data.get('inspection_date', 'N/A')}",
            f"**Inspector:** {data.get('inspector_name', 'N/A')}",
            f"**Overall Rating:** {data.get('overall_compliance_rating', 'N/A').upper()}",
            "\n---\n"
        ]
        
        sections = data.get("sections", {})
        for sec_id, sec_data in sections.items():
            sec_label = self.CDSCO_INSPECTION_TEMPLATE.get(sec_id, sec_id.upper())
            lines.append(f"\n## {sec_label}\n")
            lines.append(sec_data.get("content", ""))
            for finding in sec_data.get("findings", []):
                lines.append(f"\n- **{finding.get('severity', 'OBS')}**: {finding.get('description', '')}")
        
        summary = data.get("findings_summary", {})
        lines.append("\n## Findings Summary\n")
        for severity in ["critical", "major", "minor", "observations"]:
            items = summary.get(severity, [])
            if items:
                lines.append(f"\n### {severity.upper()} ({len(items)})\n")
                for item in items:
                    lines.append(f"- {item}")
        
        return "\n".join(lines)
    
    def _md_to_html(self, md: str) -> str:
        try:
            import markdown
            return markdown.markdown(md, extensions=['tables', 'fenced_code'])
        except:
            return f"<pre>{md}</pre>"

inspection_service = InspectionService()
