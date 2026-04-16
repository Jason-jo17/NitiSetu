from app.ai.claude_client import bridge_ai
from app.features.documents.service import document_service
from app.core.database import get_supabase
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

# CDSCO Form CT-04 mandatory fields (Second Schedule, NDCTR 2019)
CT04_CHECKLIST = {
    "administrative": [
        {"field": "covering_letter", "mandatory": True, "regulation": "NDCTR 2019 Schedule Y"},
        {"field": "power_of_attorney", "mandatory": True, "regulation": "NDCTR 2019 Sch 1"},
        {"field": "fee_receipt", "mandatory": True, "regulation": "NDCTR 2019"},
        {"field": "ctri_registration", "mandatory": True, "regulation": "ICMR Guidelines 2017"},
        {"field": "ethics_committee_approval", "mandatory": True, "regulation": "Schedule Y, CDSCO"},
        {"field": "investigator_undertaking", "mandatory": True, "regulation": "Form CT-03"},
        {"field": "protocol_version_date", "mandatory": True, "regulation": "ICH E6(R3)"},
        {"field": "sponsor_details", "mandatory": True, "regulation": "Schedule Y"},
    ],
    "cmc": [
        {"field": "drug_substance_specifications", "mandatory": True, "regulation": "ICH Q6A"},
        {"field": "analytical_methods", "mandatory": True, "regulation": "ICH Q2(R2)"},
        {"field": "stability_data", "mandatory": True, "regulation": "ICH Q1A(R2)"},
        {"field": "certificate_of_analysis", "mandatory": True, "regulation": "USP/IP"},
        {"field": "manufacturing_process", "mandatory": True, "regulation": "ICH Q10"},
        {"field": "gmp_certificate", "mandatory": True, "regulation": "WHO GMP"},
    ],
    "clinical": [
        {"field": "study_protocol", "mandatory": True, "regulation": "ICH E6(R3)"},
        {"field": "sample_size_justification", "mandatory": True, "regulation": "ICH E9"},
        {"field": "investigational_brochure", "mandatory": True, "regulation": "ICH E6(R3)"},
        {"field": "informed_consent_form", "mandatory": True, "regulation": "Schedule Y, ICMR"},
        {"field": "patient_information_sheet", "mandatory": True, "regulation": "ICH E6"},
        {"field": "insurance_certificate", "mandatory": True, "regulation": "CDSCO 2013 order"},
        {"field": "compensation_plan", "mandatory": True, "regulation": "CDSCO circular 2013"},
        {"field": "principal_investigator_cv", "mandatory": True, "regulation": "Schedule Y"},
    ],
    "non_clinical": [
        {"field": "toxicology_studies", "mandatory": True, "regulation": "ICH S1A-S1C"},
        {"field": "glp_accreditation", "mandatory": False, "regulation": "OECD GLP"},
        {"field": "pharmacology_data", "mandatory": True, "regulation": "ICH S7A"},
    ]
}

# CDSCO Form CT-06 (Clinical Trial Amendment) mandatory fields
CT06_CHECKLIST = {
    "administrative": [
        {"field": "amendment_number", "mandatory": True, "regulation": "NDCTR 2019"},
        {"field": "original_approval_reference", "mandatory": True, "regulation": "CDSCO Portal"},
        {"field": "ctri_registration", "mandatory": True, "regulation": "ICMR Guidelines 2017"},
        {"field": "ethics_committee_approval_amendment", "mandatory": True, "regulation": "Schedule Y"},
        {"field": "protocol_version_changes", "mandatory": True, "regulation": "ICH E6(R3)"},
    ],
    "amendment_details": [
        {"field": "nature_of_amendment", "mandatory": True, "regulation": "NDCTR 2019 Rule 14"},
        {"field": "justification_for_changes", "mandatory": True, "regulation": "ICH E6(R3)"},
        {"field": "impact_on_subject_safety", "mandatory": True, "regulation": "CDSCO Guidelines"},
        {"field": "impact_on_study_integrity", "mandatory": True, "regulation": "ICH E6(R3)"},
        {"field": "revised_informed_consent", "mandatory": False, "regulation": "Schedule Y"},
    ],
    "regulatory": [
        {"field": "updated_investigator_brochure", "mandatory": False, "regulation": "ICH E6(R3)"},
        {"field": "updated_protocol_synopsis", "mandatory": True, "regulation": "CDSCO"},
        {"field": "comparison_document", "mandatory": True, "regulation": "CDSCO"},
    ]
}

# MD Online (Medical Device Application) mandatory fields
MD_DEVICE_CHECKLIST = {
    "administrative": [
        {"field": "application_form_md_01", "mandatory": True, "regulation": "MDR 2017"},
        {"field": "manufacturing_license", "mandatory": True, "regulation": "MDR 2017 Rule 8"},
        {"field": "free_sale_certificate", "mandatory": True, "regulation": "MDR 2017"},
        {"field": "gmp_certificate", "mandatory": True, "regulation": "ISO 13485"},
        {"field": "ce_marking_certificate", "mandatory": False, "regulation": "EU MDR"},
        {"field": "declaration_of_conformity", "mandatory": True, "regulation": "MDR 2017"},
    ],
    "technical": [
        {"field": "device_master_file", "mandatory": True, "regulation": "MDR 2017 Rule 6"},
        {"field": "risk_analysis_iso_14971", "mandatory": True, "regulation": "ISO 14971"},
        {"field": "clinical_evaluation_report", "mandatory": True, "regulation": "MEDDEV 2.7/1"},
        {"field": "biocompatibility_test_reports", "mandatory": True, "regulation": "ISO 10993"},
        {"field": "electromagnetic_compatibility", "mandatory": False, "regulation": "IEC 60601"},
        {"field": "software_documentation", "mandatory": False, "regulation": "IEC 62304"},
        {"field": "labeling_and_ifu", "mandatory": True, "regulation": "MDR 2017 Rule 18"},
    ],
    "clinical": [
        {"field": "clinical_investigation_plan", "mandatory": False, "regulation": "ISO 14155"},
        {"field": "ethics_committee_approval", "mandatory": False, "regulation": "ICMR"},
        {"field": "informed_consent_form", "mandatory": False, "regulation": "Schedule Y"},
    ],
    "quality": [
        {"field": "quality_management_system", "mandatory": True, "regulation": "ISO 13485"},
        {"field": "post_market_surveillance_plan", "mandatory": True, "regulation": "MDR 2017 Rule 17"},
        {"field": "vigilance_reporting_procedure", "mandatory": True, "regulation": "MDR 2017 Rule 16"},
    ]
}

SAE_CIOMS_CHECKLIST = {
    "patient": [
        {"field": "patient_initials", "mandatory": True, "regulation": "CIOMS Form I"},
        {"field": "date_of_birth_or_age", "mandatory": True, "regulation": "CIOMS Form I"},
        {"field": "sex", "mandatory": True, "regulation": "CIOMS Form I"},
        {"field": "weight_kg", "mandatory": False, "regulation": "CIOMS Form I"},
    ],
    "event": [
        {"field": "suspect_drug_name", "mandatory": True, "regulation": "CIOMS/MedDRA"},
        {"field": "indication", "mandatory": True, "regulation": "CIOMS Form I"},
        {"field": "dose_and_route", "mandatory": True, "regulation": "CIOMS Form I"},
        {"field": "onset_date", "mandatory": True, "regulation": "CDSCO SAE Guidelines 2022"},
        {"field": "event_description", "mandatory": True, "regulation": "CIOMS Form I"},
        {"field": "seriousness_criteria", "mandatory": True, "regulation": "ICH E2A"},
        {"field": "causality_assessment", "mandatory": True, "regulation": "WHO-UMC/Naranjo"},
        {"field": "outcome", "mandatory": True, "regulation": "CIOMS Form I"},
        {"field": "action_taken", "mandatory": True, "regulation": "CDSCO 2022"},
    ],
    "reporter": [
        {"field": "reporter_name", "mandatory": True, "regulation": "CIOMS Form I"},
        {"field": "country", "mandatory": True, "regulation": "CIOMS Form I"},
        {"field": "report_date", "mandatory": True, "regulation": "CDSCO: 24hr initial report"},
    ]
}

CHECKLISTS = {
    "CT_04": CT04_CHECKLIST,
    "CT_06": CT06_CHECKLIST,
    "SAE_CIOMS": SAE_CIOMS_CHECKLIST,
    "MD_DEVICE": MD_DEVICE_CHECKLIST,
}


class CompletenessService:
    
    async def assess(
        self,
        document_id: str,
        form_type: str
    ) -> Dict[str, Any]:
        
        text = await document_service.get_document_text(document_id)
        checklist = CHECKLISTS.get(form_type, CT04_CHECKLIST)
        
        # Build field list for Claude
        all_fields = []
        for section, fields in checklist.items():
            for field in fields:
                all_fields.append({
                    "section": section,
                    "field": field["field"],
                    "mandatory": field["mandatory"],
                    "regulation": field["regulation"]
                })
        
        system = bridge_ai.COMPLETENESS_SYSTEM
        user_prompt = f"""
You are performing a COMPLETENESS ASSESSMENT of a {form_type} regulatory submission for CDSCO.

CHECKLIST FIELDS TO VERIFY:
{all_fields}

For each field, determine if it is:
- "present": clearly present and complete
- "missing": not found in the document
- "incomplete": partially present but lacks required detail
- "inconsistent": present but conflicts with other information

Also generate "guided_questions" — Socratic questions for each missing/incomplete mandatory field.
Reference the specific regulation that mandates each field.

Return JSON:
{{
    "field_results": [
        {{
            "section": "string",
            "field": "string",
            "status": "present|missing|incomplete|inconsistent",
            "confidence": 0.0-1.0,
            "ai_note": "string",
            "regulation": "string"
        }}
    ],
    "guided_questions": ["question1", "question2", ...],
    "recommendations": ["recommendation1", ...]
}}

DOCUMENT TEXT (first 100K chars):
{text[:100000]}
"""
        
        result = await bridge_ai.complete_json(system=system, user=user_prompt, max_tokens=6000)
        
        field_results = result.get("field_results", [])
        mandatory_fields = [f for f in field_results if any(
            cf["field"] == f["field"] and cf["mandatory"] 
            for s in checklist.values() for cf in s
        )]
        
        present = sum(1 for f in field_results if f["status"] == "present")
        missing = sum(1 for f in field_results if f["status"] == "missing")
        inconsistent = sum(1 for f in field_results if f["status"] == "inconsistent")
        
        pct = (present / len(field_results) * 100) if field_results else 0
        
        return {
            "form_type": form_type,
            "overall_completeness_pct": round(pct, 1),
            "total_mandatory_fields": len(mandatory_fields),
            "present_count": present,
            "missing_count": missing,
            "inconsistent_count": inconsistent,
            "field_results": field_results,
            "guided_questions": result.get("guided_questions", []),
            "recommendations": result.get("recommendations", [])
        }

completeness_service = CompletenessService()
