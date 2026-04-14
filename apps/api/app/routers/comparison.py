from fastapi import APIRouter, Request
from pydantic import BaseModel
from app.core.database import get_supabase
from app.workers.tasks import process_comparison
from app.core.limiter import limiter
import uuid

router = APIRouter()

class CompareRequest(BaseModel):
    source_doc_id: str
    target_doc_id: str

@router.post("/process")
@limiter.limit("2/minute")
async def process(request: Request, req: CompareRequest):
    sb = get_supabase()
    job_id = str(uuid.uuid4())
    sb.table("processing_jobs").insert({
        "id": job_id,
        "document_id": req.source_doc_id,
        "feature_type": "comparison",
        "status": "pending",
        "progress": 0
    }).execute()
    
    process_comparison.delay(job_id, req.source_doc_id, req.target_doc_id)
    return {"job_id": job_id}
