from fastapi import APIRouter
from pydantic import BaseModel
from app.core.database import get_supabase
from app.workers.tasks import process_completeness
import uuid

router = APIRouter()

class CompletenessRequest(BaseModel):
    document_id: str
    template_type: str

@router.post("/process")
async def process(req: CompletenessRequest):
    sb = get_supabase()
    job_id = str(uuid.uuid4())
    sb.table("processing_jobs").insert({
        "id": job_id,
        "document_id": req.document_id,
        "type": "completeness",
        "status": "pending"
    }).execute()
    
    process_completeness.delay(job_id, req.document_id, req.template_type)
    return {"job_id": job_id}
