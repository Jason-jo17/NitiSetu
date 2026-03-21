from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from enum import Enum

class DocumentType(str, Enum):
    CLINICAL_TRIAL = "clinical_trial"
    SAE_REPORT = "sae_report"
    MEDICAL_DEVICE = "medical_device"
    DRUG_APPLICATION = "drug_application"
    INSPECTION_REPORT = "inspection_report"
    MEETING_TRANSCRIPT = "meeting_transcript"
    AUDIO_FILE = "audio_file"
    UNKNOWN = "unknown"

class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class SAESeverity(str, Enum):
    DEATH = "death"
    LIFE_THREATENING = "life_threatening"
    HOSPITALIZATION = "hospitalization"
    DISABILITY = "disability"
    CONGENITAL_ANOMALY = "congenital_anomaly"
    OTHER = "other_medically_important"

class FieldStatus(str, Enum):
    PRESENT = "present"
    MISSING = "missing"
    INCONSISTENT = "inconsistent"
    INCOMPLETE = "incomplete"

# --- Request/Response models ---

class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    doc_type: DocumentType
    storage_path: str
    size_bytes: int
    created_at: datetime

class JobResponse(BaseModel):
    job_id: str
    document_id: str
    feature: str
    status: JobStatus
    progress: int = 0
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

class AnonymizationRequest(BaseModel):
    document_id: str
    entities_to_detect: List[str] = []  # Empty = all
    anonymization_mode: Literal["pseudonymize", "irreversible", "both"] = "both"
    k_anonymity_target: int = Field(default=10, ge=2, le=100)

class AnonymizationResult(BaseModel):
    job_id: str
    document_id: str
    entities_found: List[Dict[str, Any]]
    anonymized_text: str
    pii_count: int
    entity_breakdown: Dict[str, int]
    k_anonymity_score: float
    l_diversity_score: float
    t_closeness_score: float
    compliance_flags: List[str]
    processing_time_ms: int

class SummarizationRequest(BaseModel):
    document_id: str
    source_type: Literal["sugam_checklist", "sae_narration", "meeting_transcript"]
    max_length_words: int = 500
    include_action_items: bool = True

class SummarizationResult(BaseModel):
    job_id: str
    document_id: str
    source_type: str
    executive_summary: str
    key_findings: List[str]
    action_items: List[str]
    regulatory_implications: List[str]
    guided_inquiry_questions: List[str]  # Bridge Layer AI Socratic output
    rouge_1: Optional[float] = None
    rouge_2: Optional[float] = None
    rouge_l: Optional[float] = None
    bert_score: Optional[float] = None

class CompletenessRequest(BaseModel):
    document_id: str
    form_type: Literal["CT_04", "CT_06", "SAE_CIOMS", "MD_DEVICE", "CUSTOM"]
    checklist_id: Optional[str] = None

class CompletenessResult(BaseModel):
    job_id: str
    document_id: str
    form_type: str
    overall_completeness_pct: float
    total_mandatory_fields: int
    present_count: int
    missing_count: int
    inconsistent_count: int
    field_results: List[Dict[str, Any]]
    guided_questions: List[str]  # Socratic follow-ups for missing fields
    recommendations: List[str]

class ClassificationResult(BaseModel):
    job_id: str
    document_id: str
    severity: SAESeverity
    severity_confidence: float
    is_duplicate: bool
    duplicate_of: Optional[str] = None
    duplicate_similarity_score: Optional[float] = None
    priority_score: int  # 1-10
    meddra_pt: Optional[str] = None
    meddra_soc: Optional[str] = None
    extracted_entities: Dict[str, Any]
    macro_f1: Optional[float] = None
    mcc: Optional[float] = None

class ComparisonResult(BaseModel):
    job_id: str
    document_id_v1: str
    document_id_v2: str
    total_changes: int
    substantive_changes: List[Dict[str, Any]]
    formatting_changes: int
    administrative_changes: int
    change_summary: str
    semantic_similarity_score: float
    diff_html: str  # HTML diff for frontend rendering

class InspectionResult(BaseModel):
    job_id: str
    document_id: str
    extracted_observations: List[Dict[str, Any]]
    formatted_report_markdown: str
    formatted_report_html: str
    cer_score: Optional[float] = None
    sections: Dict[str, Any]  # CDSCO template sections
