from fastapi import APIRouter, HTTPException
from app.core.database import get_supabase

router = APIRouter()

@router.get("/{job_id}")
async def get_job(job_id: str):
    supabase = get_supabase()
    result = supabase.table("processing_jobs").select("*").eq("id", job_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return result.data[0]

@router.get("/")
async def list_jobs(limit: int = 20, offset: int = 0):
    supabase = get_supabase()
    result = supabase.table("processing_jobs")\
        .select("*, documents(filename, doc_type)")\
        .order("created_at", desc=True)\
        .limit(limit)\
        .offset(offset)\
        .execute()
    return {"jobs": result.data, "total": len(result.data)}
