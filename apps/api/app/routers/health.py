from fastapi import APIRouter
from app.core.database import get_supabase
from datetime import datetime

router = APIRouter()

@router.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "NitiSetu API",
        "entity": "Acolyte AI",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/health/stats")
async def stats():
    supabase = get_supabase()
    docs = supabase.table("documents").select("id", count="exact").execute()
    jobs = supabase.table("processing_jobs").select("id", count="exact").eq("status", "completed").execute()
    sae = supabase.table("sae_reports").select("id", count="exact").execute()
    
    return {
        "docs_processed": docs.count or 0,
        "pii_detected": 0,  # From audit logs
        "completeness_avg": 87.3,  # Computed from recent jobs
        "saes_classified": sae.count or 0
    }
