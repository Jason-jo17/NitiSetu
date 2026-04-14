from fastapi import APIRouter, Request
from pydantic import BaseModel
from app.core.database import get_supabase
from app.features.documents.service import document_service
from app.features.anonymization.service import anonymization_service
from app.core.limiter import limiter
import uuid

router = APIRouter()

class AnonymizeRequest(BaseModel):
    document_id: str
    mode: str

@router.post("/process")
@limiter.limit("2/minute")
async def process(request: Request, req: AnonymizeRequest):
    sb = get_supabase()
    job_id = str(uuid.uuid4())
    sb.table("processing_jobs").insert({
        "id": job_id,
        "document_id": req.document_id,
        "feature_type": "anonymization",
        "status": "pending",
        "progress": 0
    }).execute()
    
    from app.workers.tasks import process_anonymization
    process_anonymization.delay(job_id, req.document_id, req.mode)
    return {"job_id": job_id}

@router.get("/preview/{document_id}")
async def get_preview(document_id: str):
    text = await document_service.get_document_text(document_id)
    preview = await anonymization_service.get_pii_preview(text)
    return preview
