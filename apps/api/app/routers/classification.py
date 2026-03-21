from fastapi import APIRouter
from pydantic import BaseModel
from app.core.database import get_supabase
from app.workers.tasks import process_classification
import uuid

router = APIRouter()

class ClassifyRequest(BaseModel):
    document_id: str

@router.post("/process")
async def process(req: ClassifyRequest):
    sb = get_supabase()
    job_id = str(uuid.uuid4())
    sb.table("processing_jobs").insert({
        "id": job_id,
        "document_id": req.document_id,
        "type": "classification",
        "status": "pending"
    }).execute()
    
    process_classification.delay(job_id, req.document_id)
    return {"job_id": job_id}
