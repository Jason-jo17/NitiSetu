from typing import Dict, Any, List, Optional
from rapidfuzz import fuzz
from app.ai.claude_client import bridge_ai
from app.features.documents.service import document_service
from app.core.database import get_supabase
import logging

logger = logging.getLogger(__name__)

class ClassificationService:
    
    SEVERITY_SYSTEM = """You are an SAE (Serious Adverse Event) classification engine for CDSCO.
Classify the adverse event by severity per CDSCO/ICH E2A guidelines and NDCTR 2019.

Severity categories:
1. death - Event resulted in patient death
2. life_threatening - Patient was at risk of death at time of event
3. hospitalization - Required/prolonged inpatient hospitalization
4. disability - Resulted in significant, persistent, or permanent disability/incapacity
5. congenital_anomaly - Resulted in congenital anomaly/birth defect
6. other_medically_important - Does not fit above but may jeopardize patient or require medical/surgical intervention

Also extract: drug name, indication, patient age/sex, event term (MedDRA PT), onset date, causality.

Return JSON:
{
    "severity": "death|life_threatening|hospitalization|disability|congenital_anomaly|other_medically_important",
    "severity_confidence": 0.0-1.0,
    "severity_rationale": "string",
    "drug_name": "string",
    "patient_demographics": {"age": "string", "sex": "string"},
    "event_term": "string",
    "meddra_pt": "string",
    "meddra_soc": "string",
    "onset_date": "string",
    "causality": "related|not_related|unknown",
    "priority_score": 1-10
}"""
    
    async def classify_sae(self, document_id: str) -> Dict[str, Any]:
        text = await document_service.get_document_text(document_id)
        
        result = await bridge_ai.complete_json(
            system=self.SEVERITY_SYSTEM,
            user=f"Classify this SAE report:\n\n{text[:50000]}"
        )
        
        # Duplicate detection
        is_duplicate, dup_of, dup_score = await self._check_duplicate(
            document_id=document_id,
            event_term=result.get("meddra_pt", ""),
            drug_name=result.get("drug_name", ""),
            patient_info=str(result.get("patient_demographics", {}))
        )
        
        return {
            "severity": result.get("severity", "other_medically_important"),
            "severity_confidence": result.get("severity_confidence", 0.5),
            "is_duplicate": is_duplicate,
            "duplicate_of": dup_of,
            "duplicate_similarity_score": dup_score,
            "priority_score": result.get("priority_score", 5),
            "meddra_pt": result.get("meddra_pt"),
            "meddra_soc": result.get("meddra_soc"),
            "extracted_entities": result
        }
    
    async def _check_duplicate(
        self, document_id: str, event_term: str, drug_name: str, patient_info: str
    ) -> tuple[bool, Optional[str], Optional[float]]:
        
        supabase = get_supabase()
        existing = supabase.table("sae_reports").select("*").neq(
            "document_id", document_id
        ).execute()
        
        if not existing.data:
            return False, None, None
        
        # Create fingerprint
        fingerprint = f"{drug_name.lower()}|{event_term.lower()}|{patient_info.lower()}"
        
        best_score = 0
        best_id = None
        
        for rec in existing.data:
            existing_fingerprint = f"{rec.get('drug_name','').lower()}|{rec.get('event_term','').lower()}|{rec.get('patient_info','').lower()}"
            score = fuzz.token_sort_ratio(fingerprint, existing_fingerprint) / 100.0
            if score > best_score:
                best_score = score
                best_id = rec["document_id"]
        
        is_dup = best_score > 0.85
        return is_dup, (best_id if is_dup else None), (best_score if is_dup else None)

classification_service = ClassificationService()
