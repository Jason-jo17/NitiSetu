from fastapi import APIRouter, Request
from pydantic import BaseModel
from app.core.database import get_supabase
from app.workers.tasks import process_classification
from app.core.limiter import limiter
import uuid

router = APIRouter()

class ClassifyRequest(BaseModel):
    document_id: str

@router.post("/process")
@limiter.limit("2/minute")
async def process(request: Request, req: ClassifyRequest):
    sb = get_supabase()
    job_id = str(uuid.uuid4())
    sb.table("processing_jobs").insert({
        "id": job_id,
        "document_id": req.document_id,
        "feature_type": "classification",
        "status": "pending",
        "progress": 0
    }).execute()
    
    process_classification.delay(job_id, req.document_id)
    return {"job_id": job_id}
