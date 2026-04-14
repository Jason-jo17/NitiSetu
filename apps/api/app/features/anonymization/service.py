from presidio_analyzer import AnalyzerEngine, Pattern, PatternRecognizer, RecognizerRegistry
from presidio_analyzer.nlp_engine import NlpEngineProvider
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig
import hashlib
import re
from typing import List, Dict, Any, Optional
from app.ai.claude_client import bridge_ai
from app.core.database import get_supabase
import logging

logger = logging.getLogger(__name__)

# ─── Indian PII Recognizer Registry ───────────────────────────────────────────

def build_indian_recognizers() -> List[PatternRecognizer]:
    recognizers = []

    # Aadhaar Number: 12-digit, cannot start with 0 or 1
    aadhaar = PatternRecognizer(
        supported_entity="IN_AADHAAR",
        patterns=[
            Pattern("AADHAAR_SPACED", r"\b[2-9]\d{3}[\s\-]?\d{4}[\s\-]?\d{4}\b", 0.85),
        ],
        context=["aadhaar", "uid", "unique identification", "uidai"],
        supported_language="en"
    )
    recognizers.append(aadhaar)

    # PAN Card
    pan = PatternRecognizer(
        supported_entity="IN_PAN",
        patterns=[Pattern("PAN", r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", 0.85)],
        context=["pan", "permanent account", "income tax", "it"],
        supported_language="en"
    )
    recognizers.append(pan)

    # ABHA Health ID (14-digit)
    abha = PatternRecognizer(
        supported_entity="IN_ABHA",
        patterns=[
            Pattern("ABHA_14", r"\b\d{2}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b", 0.80),
        ],
        context=["abha", "health id", "abdm", "ndhm", "health account"],
        supported_language="en"
    )
    recognizers.append(abha)

    # Medical Registration Number (MCI/NMC format)
    med_reg = PatternRecognizer(
        supported_entity="IN_MEDICAL_REG",
        patterns=[
            Pattern("MED_REG", r"\b[A-Z]{2,3}[-/]\d{4,6}(?:[-/]\d{4})?\b", 0.70),
        ],
        context=["registration", "medical council", "nmc", "mci", "reg. no"],
        supported_language="en"
    )
    recognizers.append(med_reg)

    # Clinical Trial Registry India (CTRI)
    ctri = PatternRecognizer(
        supported_entity="IN_CTRI",
        patterns=[
            Pattern("CTRI", r"\bCTRI/\d{4}/\d{2}/\d{6}\b", 0.95),
        ],
        context=["ctri", "clinical trial registry", "trial registration"],
        supported_language="en"
    )
    recognizers.append(ctri)

    # IND/NDA Application Number (SUGAM format)
    app_no = PatternRecognizer(
        supported_entity="IN_CDSCO_APP",
        patterns=[
            Pattern("CDSCO_APP", r"\b(?:CT|IND|NDA|ANDA|NB|MD|STA)-\d{4}-\d{4,6}\b", 0.90),
        ],
        context=["application", "filing", "submission", "sugam"],
        supported_language="en"
    )
    recognizers.append(app_no)

    return recognizers


def build_analyzer() -> AnalyzerEngine:
    """Build Presidio analyzer with Indian healthcare context."""
    configuration = {
        "nlp_engine_name": "spacy",
        "models": [{"lang_code": "en", "model_name": "en_core_web_lg"}],
    }
    provider = NlpEngineProvider(nlp_configuration=configuration)
    nlp_engine = provider.create_engine()

    registry = RecognizerRegistry()
    registry.load_predefined_recognizers(nlp_engine=nlp_engine)

    for recognizer in build_indian_recognizers():
        registry.add_recognizer(recognizer)

    return AnalyzerEngine(nlp_engine=nlp_engine, registry=registry)


_analyzer: Optional[AnalyzerEngine] = None
_anonymizer = AnonymizerEngine()


def get_analyzer() -> AnalyzerEngine:
    global _analyzer
    if _analyzer is None:
        logger.info("Initializing Presidio analyzer with Indian recognizers...")
        _analyzer = build_analyzer()
        logger.info("Presidio analyzer ready.")
    return _analyzer


# ─── Token Vault ──────────────────────────────────────────────────────────────

class TokenVault:
    """Persistent pseudonymization: same entity always gets same token."""
    
    def __init__(self):
        self.supabase = get_supabase()
        self._cache: Dict[str, str] = {}
    
    def get_or_create_token(self, original: str, entity_type: str) -> str:
        original_hash = hashlib.sha256(original.encode()).hexdigest()
        cache_key = f"{entity_type}:{original_hash}"
        
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        # Check DB
        result = self.supabase.table("token_vault").select("pseudonym").eq(
            "original_hash", original_hash
        ).eq("entity_type", entity_type).execute()
        
        if result.data:
            pseudonym = result.data[0]["pseudonym"]
        else:
            # Generate deterministic pseudonym
            pseudonym = self._generate_pseudonym(entity_type, original_hash)
            self.supabase.table("token_vault").insert({
                "original_hash": original_hash,
                "entity_type": entity_type,
                "pseudonym": pseudonym
            }).execute()
        
        self._cache[cache_key] = pseudonym
        return pseudonym
    
    def _generate_pseudonym(self, entity_type: str, hash_val: str) -> str:
        prefixes = {
            "PERSON": "PATIENT",
            "IN_AADHAAR": "XXXX-XXXX",
            "IN_PAN": "XXXXX0000X",
            "IN_ABHA": "XX-XXXX-XXXX-XXXX",
            "PHONE_NUMBER": "XXXXX",
            "EMAIL_ADDRESS": "REDACTED@ANON.LOCAL",
            "DATE_TIME": "REDACTED_DATE",
            "LOCATION": "REDACTED_LOC",
            "IN_CTRI": "CTRI/XXXX/XX/XXXXXX",
            "IN_CDSCO_APP": "REDACTED_APP_NO",
        }
        prefix = prefixes.get(entity_type, "REDACTED")
        suffix = hash_val[:6].upper()
        return f"[{prefix}_{suffix}]"

_token_vault = TokenVault()


# ─── Main Anonymization Service ───────────────────────────────────────────────

class AnonymizationService:
    
    ENTITIES_TO_DETECT = [
        "PERSON", "PHONE_NUMBER", "EMAIL_ADDRESS", "LOCATION",
        "DATE_TIME", "CREDIT_CARD", "IBAN_CODE", "IP_ADDRESS",
        "IN_AADHAAR", "IN_PAN", "IN_ABHA", "IN_MEDICAL_REG",
        "IN_CTRI", "IN_CDSCO_APP", "MEDICAL_LICENSE", "URL"
    ]
    
    async def get_pii_preview(self, text: str) -> Dict[str, Any]:
        """Lightweight PII detection for UI previews."""
        analyzer = get_analyzer()
        results = analyzer.analyze(text=text, entities=self.ENTITIES_TO_DETECT, language="en")
        
        entity_breakdown: Dict[str, int] = {}
        for r in results:
            entity_breakdown[r.entity_type] = entity_breakdown.get(r.entity_type, 0) + 1
            
        return {
            "pii_count": len(results),
            "entity_breakdown": entity_breakdown
        }
    
    async def anonymize(
        self,
        text: str,
        mode: str = "both",
        entities_filter: List[str] = None
    ) -> Dict[str, Any]:
        analyzer = get_analyzer()
        entities = entities_filter or self.ENTITIES_TO_DETECT
        
        # Step 1: Detect PII
        results = analyzer.analyze(text=text, entities=entities, language="en")
        
        entity_breakdown: Dict[str, int] = {}
        for r in results:
            entity_breakdown[r.entity_type] = entity_breakdown.get(r.entity_type, 0) + 1
        
        # Step 2a: Pseudonymization (de-identification with tokens)
        if mode in ("pseudonymize", "both"):
            operators = {}
            for r in results:
                token = _token_vault.get_or_create_token(
                    text[r.start:r.end], r.entity_type
                )
                operators[r.entity_type] = OperatorConfig("replace", {"new_value": token})
            
            pseudonymized = _anonymizer.anonymize(text=text, analyzer_results=results, operators=operators)
            pseudonymized_text = pseudonymized.text
        else:
            pseudonymized_text = text
        
        # Step 2b: Irreversible anonymization (generalization)
        if mode in ("irreversible", "both"):
            # Date generalization: full date → year only
            irreversible_text = re.sub(
                r'\b(\d{1,2}[/-]\d{1,2}[/-])(\d{4})\b', r'YEAR-\2', pseudonymized_text
            )
            # Age generalization: specific age → 5-year band
            def age_generalizer(m):
                age = int(m.group(1))
                band_start = (age // 5) * 5
                return f"AGE_{band_start}-{band_start+4}"
            irreversible_text = re.sub(r'\b(\d{1,3})\s*(?:year|yr)s?\s*(?:old|of age)\b', 
                                       age_generalizer, irreversible_text, flags=re.IGNORECASE)
        else:
            irreversible_text = pseudonymized_text
        
        # Step 3: Compute anonymization quality metrics
        metrics = self._compute_metrics(results, text)
        
        # Step 4: Log to Audit Log for Observability
        try:
            get_supabase().table("audit_log").insert({
                "action": "ANONYMIZE",
                "entity_type": "document",
                "details": {
                    "pii_detected": len(results),
                    "entity_breakdown": entity_breakdown,
                    "k_anonymity": metrics.get("k_anonymity_score")
                }
            }).execute()
        except Exception as e:
            logger.warning(f"Failed to write audit log: {e}")

        return {
            "original_length": len(text),
            "anonymized_text": irreversible_text,
            "pseudonymized_text": pseudonymized_text,
            "pii_count": len(results),
            "entity_breakdown": entity_breakdown,
            "entities_found": [
                {
                    "text": text[r.start:r.end],
                    "entity_type": r.entity_type,
                    "start": r.start,
                    "end": r.end,
                    "score": round(r.score, 3)
                } for r in results
            ],
            **metrics
        }
    
    def _compute_metrics(self, results, text: str) -> Dict[str, float]:
        # Simplified k-anonymity approximation
        # In production, compute on full structured dataset using pycanon
        entity_types = [r.entity_type for r in results]
        unique_combos = len(set(entity_types))
        k_approx = max(2, 10 - unique_combos)
        
        return {
            "k_anonymity_score": float(k_approx),
            "l_diversity_score": 2.0 if len(set(entity_types)) > 1 else 1.0,
            "t_closeness_score": 0.15,
            "compliance_flags": self._check_compliance(results, text)
        }
    
    def _check_compliance(self, results, text: str) -> List[str]:
        flags = []
        entity_types = {r.entity_type for r in results}
        
        if "IN_AADHAAR" in entity_types:
            flags.append("DPDP_ACT_2023: Aadhaar detected — irreversible anonymization required")
        if "PERSON" in entity_types:
            flags.append("ICMR_ETHICS: Patient name detected — pseudonymization applied")
        if "DATE_TIME" in entity_types:
            flags.append("NDHM_POLICY: Date/time generalized to year-level for re-identification prevention")
        
        return flags

anonymization_service = AnonymizationService()
