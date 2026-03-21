from fastapi import APIRouter
from pydantic import BaseModel
from app.core.database import get_supabase
from app.workers.tasks import process_summarization
import uuid

router = APIRouter()

class SummarizeRequest(BaseModel):
    document_id: str
    source_type: str

@router.post("/process")
async def process(req: SummarizeRequest):
    sb = get_supabase()
    job_id = str(uuid.uuid4())
    sb.table("processing_jobs").insert({
        "id": job_id,
        "document_id": req.document_id,
        "type": "summarization",
        "status": "pending"
    }).execute()
    
    process_summarization.delay(job_id, req.document_id, req.source_type)
    return {"job_id": job_id}
