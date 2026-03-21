from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Depends
from app.core.schemas import AnonymizationRequest, AnonymizationResult, JobStatus
from app.features.anonymization.service import anonymization_service
from app.features.documents.service import document_service
from app.workers.tasks import process_anonymization
import uuid
from datetime import datetime

router = APIRouter()

@router.post("/text", response_model=AnonymizationResult)
async def anonymize_text(text: str, mode: str = "both"):
    """Quick anonymization of raw text input."""
    result = await anonymization_service.anonymize(text=text, mode=mode)
    return AnonymizationResult(
        job_id=str(uuid.uuid4()),
        document_id="inline",
        **result,
        processing_time_ms=0
    )

@router.post("/document", response_model=dict)
async def anonymize_document(
    request: AnonymizationRequest,
    background_tasks: BackgroundTasks
):
    """Queue document anonymization job."""
    job_id = str(uuid.uuid4())
    
    # Create job record
    from app.core.database import get_supabase
    supabase = get_supabase()
    supabase.table("processing_jobs").insert({
        "id": job_id,
        "document_id": request.document_id,
        "feature_type": "anonymization",
        "status": "pending",
        "progress": 0
    }).execute()
    
    # Queue Celery task
    process_anonymization.delay(job_id, request.document_id, request.anonymization_mode)
    
    return {"job_id": job_id, "status": "pending", "message": "Anonymization queued"}

@router.get("/preview/{document_id}")
async def preview_pii(document_id: str):
    """Preview PII entities found in document without anonymizing."""
    doc = await document_service.get_document_text(document_id)
    result = await anonymization_service.anonymize(text=doc[:5000], mode="pseudonymize")
    return {
        "preview_char_limit": 5000,
        "entities_found": result["entities_found"],
        "pii_count": result["pii_count"],
        "entity_breakdown": result["entity_breakdown"]
    }
