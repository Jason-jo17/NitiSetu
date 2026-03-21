from fastapi import APIRouter
from pydantic import BaseModel
from app.core.database import get_supabase
from app.workers.tasks import process_anonymization
import uuid

router = APIRouter()

class AnonymizeRequest(BaseModel):
    document_id: str
    intensity: str

@router.post("/process")
async def process(req: AnonymizeRequest):
    sb = get_supabase()
    job_id = str(uuid.uuid4())
    sb.table("processing_jobs").insert({
        "id": job_id,
        "document_id": req.document_id,
        "type": "anonymization",
        "status": "pending",
        "progress": 0
    }).execute()
    
    process_anonymization.delay(job_id, req.document_id, req.intensity)
    return {"job_id": job_id}
