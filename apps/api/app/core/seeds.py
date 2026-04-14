import logging
from supabase import Client

logger = logging.getLogger(__name__)

async def seed_checklists(supabase: Client):
    """Seed CDSCO checklist templates if not present."""
    try:
        # Check if already seeded
        existing = supabase.table("checklist_templates").select("id", count="exact").limit(1).execute()
        if existing.count and existing.count > 0:
            logger.info("Checklist templates already seeded.")
            return

        logger.info("Seeding CDSCO checklist templates...")
        
        checklists = []
        
        # CT-04 (Clinical Trial Application) - NDCTR 2019
        sections = {
            "administrative": ["covering_letter", "power_of_attorney", "fee_receipt", "ctri_registration", "ethics_committee_approval"],
            "cmc": ["drug_substance_specifications", "analytical_methods", "stability_data", "certificate_of_analysis"],
            "clinical": ["study_protocol", "sample_size_justification", "investigational_brochure", "informed_consent_form"],
            "non_clinical": ["toxicology_studies", "pharmacology_data"]
        }
        
        for section, fields in sections.items():
            for field in fields:
                checklists.append({
                    "form_type": "CT_04",
                    "section": section,
                    "field_name": field,
                    "is_mandatory": True,
                    "regulation_reference": "NDCTR 2019"
                })

        # SAE (Serious Adverse Event) - CIOMS I
        sae_sections = {
            "patient": ["patient_initials", "date_of_birth_or_age", "sex"],
            "event": ["suspect_drug_name", "indication", "onset_date", "event_description", "seriousness_criteria", "causality_assessment"],
            "reporter": ["reporter_name", "report_date"]
        }
        
        for section, fields in sae_sections.items():
            for field in fields:
                checklists.append({
                    "form_type": "SAE_CIOMS",
                    "section": section,
                    "field_name": field,
                    "is_mandatory": True,
                    "regulation_reference": "CIOMS Form I / CDSCO 2022"
                })

        if checklists:
            supabase.table("checklist_templates").insert(checklists).execute()
            logger.info(f"Successfully seeded {len(checklists)} checklist templates.")
            
    except Exception as e:
        logger.error(f"Failed to seed checklists: {e}")
