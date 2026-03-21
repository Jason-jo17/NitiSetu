from app.workers.celery_app import celery_app
from app.core.database import get_supabase
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def update_job(job_id: str, status: str, progress: int, result=None, error=None):
    supabase = get_supabase()
    update = {"status": status, "progress": progress}
    if result:
        update["result_json"] = result
    if error:
        update["error"] = error
    if status == "completed":
        update["completed_at"] = datetime.utcnow().isoformat()
    supabase.table("processing_jobs").update(update).eq("id", job_id).execute()


@celery_app.task(bind=True, name="app.workers.tasks.process_anonymization")
def process_anonymization(self, job_id: str, document_id: str, mode: str):
    import asyncio
    from app.features.anonymization.service import anonymization_service
    from app.features.documents.service import document_service
    
    try:
        update_job(job_id, "processing", 10)
        text = asyncio.get_event_loop().run_until_complete(
            document_service.get_document_text(document_id)
        )
        update_job(job_id, "processing", 40)
        
        result = asyncio.get_event_loop().run_until_complete(
            anonymization_service.anonymize(text=text, mode=mode)
        )
        update_job(job_id, "completed", 100, result=result)
        
    except Exception as e:
        logger.error(f"Anonymization task {job_id} failed: {e}")
        update_job(job_id, "failed", 0, error=str(e))


@celery_app.task(bind=True, name="app.workers.tasks.process_summarization")
def process_summarization(self, job_id: str, document_id: str, source_type: str):
    import asyncio
    from app.features.summarization.service import summarization_service
    try:
        update_job(job_id, "processing", 20)
        result = asyncio.get_event_loop().run_until_complete(
            summarization_service.summarize(document_id=document_id, source_type=source_type)
        )
        update_job(job_id, "completed", 100, result=result)
    except Exception as e:
        update_job(job_id, "failed", 0, error=str(e))


@celery_app.task(bind=True, name="app.workers.tasks.process_completeness")
def process_completeness(self, job_id: str, document_id: str, form_type: str):
    import asyncio
    from app.features.completeness.service import completeness_service
    try:
        update_job(job_id, "processing", 20)
        result = asyncio.get_event_loop().run_until_complete(
            completeness_service.assess(document_id=document_id, form_type=form_type)
        )
        update_job(job_id, "completed", 100, result=result)
    except Exception as e:
        update_job(job_id, "failed", 0, error=str(e))


@celery_app.task(bind=True, name="app.workers.tasks.process_classification")
def process_classification(self, job_id: str, document_id: str):
    import asyncio
    from app.features.classification.service import classification_service
    try:
        update_job(job_id, "processing", 30)
        result = asyncio.get_event_loop().run_until_complete(
            classification_service.classify_sae(document_id=document_id)
        )
        update_job(job_id, "completed", 100, result=result)
    except Exception as e:
        update_job(job_id, "failed", 0, error=str(e))


@celery_app.task(bind=True, name="app.workers.tasks.process_comparison")
def process_comparison(self, job_id: str, doc_id_v1: str, doc_id_v2: str):
    import asyncio
    from app.features.comparison.service import comparison_service
    try:
        update_job(job_id, "processing", 30)
        result = asyncio.get_event_loop().run_until_complete(
            comparison_service.compare(document_id_v1=doc_id_v1, document_id_v2=doc_id_v2)
        )
        update_job(job_id, "completed", 100, result=result)
    except Exception as e:
        update_job(job_id, "failed", 0, error=str(e))


@celery_app.task(bind=True, name="app.workers.tasks.process_inspection")
def process_inspection(self, job_id: str, document_id: str):
    import asyncio
    from app.features.inspection.service import inspection_service
    try:
        update_job(job_id, "processing", 30)
        result = asyncio.get_event_loop().run_until_complete(
            inspection_service.process_inspection(document_id=document_id)
        )
        update_job(job_id, "completed", 100, result=result)
    except Exception as e:
        update_job(job_id, "failed", 0, error=str(e))
