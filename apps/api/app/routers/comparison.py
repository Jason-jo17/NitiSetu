from fastapi import APIRouter
from pydantic import BaseModel
from app.core.database import get_supabase
from app.workers.tasks import process_comparison
import uuid

router = APIRouter()

class CompareRequest(BaseModel):
    source_doc_id: str
    target_doc_id: str

@router.post("/process")
async def process(req: CompareRequest):
    sb = get_supabase()
    job_id = str(uuid.uuid4())
    sb.table("processing_jobs").insert({
        "id": job_id,
        "document_id": req.source_doc_id,
        "type": "comparison",
        "status": "pending"
    }).execute()
    
    process_comparison.delay(job_id, req.source_doc_id, req.target_doc_id)
    return {"job_id": job_id}
