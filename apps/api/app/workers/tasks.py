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


@celery_app.task(bind=True, name="app.workers.tasks.process_anonymization", max_retries=3, default_retry_delay=5)
def process_anonymization(self, job_id: str, document_id: str, mode: str):
    import asyncio
    from app.features.anonymization.service import anonymization_service
    from app.features.documents.service import document_service
    
    try:
        update_job(job_id, "processing", 10)
        text = asyncio.run(
            document_service.get_document_text(document_id)
        )
        update_job(job_id, "processing", 30)
        
        result = asyncio.run(
            anonymization_service.anonymize(text=text, mode=mode)
        )
        update_job(job_id, "processing", 80)
        
        update_job(job_id, "completed", 100, result=result)
        
    except Exception as e:
        logger.error(f"Anonymization task {job_id} failed: {e}")
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)
        update_job(job_id, "failed", 0, error=str(e))


@celery_app.task(bind=True, name="app.workers.tasks.process_summarization", max_retries=3)
def process_summarization(self, job_id: str, document_id: str, source_type: str):
    import asyncio
    from app.features.summarization.service import summarization_service
    try:
        update_job(job_id, "processing", 20)
        # Mocking progress points as service doesn't have internal hooks
        update_job(job_id, "processing", 50)
        result = asyncio.run(
            summarization_service.summarize(document_id=document_id, source_type=source_type)
        )
        update_job(job_id, "processing", 90)
        update_job(job_id, "completed", 100, result=result)
    except Exception as e:
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)
        update_job(job_id, "failed", 0, error=str(e))


@celery_app.task(bind=True, name="app.workers.tasks.process_completeness", max_retries=3)
def process_completeness(self, job_id: str, document_id: str, form_type: str):
    import asyncio
    from app.features.completeness.service import completeness_service
    try:
        update_job(job_id, "processing", 20)
        update_job(job_id, "processing", 60)
        result = asyncio.run(
            completeness_service.assess(document_id=document_id, form_type=form_type)
        )
        update_job(job_id, "completed", 100, result=result)
    except Exception as e:
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)
        update_job(job_id, "failed", 0, error=str(e))


@celery_app.task(bind=True, name="app.workers.tasks.process_classification", max_retries=3)
def process_classification(self, job_id: str, document_id: str):
    import asyncio
    from app.features.classification.service import classification_service
    try:
        update_job(job_id, "processing", 30)
        update_job(job_id, "processing", 70)
        result = asyncio.run(
            classification_service.classify_sae(document_id=document_id)
        )
        update_job(job_id, "completed", 100, result=result)
    except Exception as e:
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)
        update_job(job_id, "failed", 0, error=str(e))


@celery_app.task(bind=True, name="app.workers.tasks.process_comparison", max_retries=3)
def process_comparison(self, job_id: str, doc_id_v1: str, doc_id_v2: str):
    import asyncio
    from app.features.comparison.service import comparison_service
    try:
        update_job(job_id, "processing", 30)
        update_job(job_id, "processing", 60)
        result = asyncio.run(
            comparison_service.compare(document_id_v1=doc_id_v1, document_id_v2=doc_id_v2)
        )
        update_job(job_id, "completed", 100, result=result)
    except Exception as e:
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)
        update_job(job_id, "failed", 0, error=str(e))


@celery_app.task(bind=True, name="app.workers.tasks.process_inspection", max_retries=3)
def process_inspection(self, job_id: str, document_id: str):
    import asyncio
    from app.features.inspection.service import inspection_service
    try:
        update_job(job_id, "processing", 20)
        update_job(job_id, "processing", 50)
        result = asyncio.run(
            inspection_service.process_inspection(document_id=document_id)
        )
        update_job(job_id, "processing", 90)
        update_job(job_id, "completed", 100, result=result)
    except Exception as e:
        logger.error(f"Inspection task {job_id} failed: {e}")
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e)
        update_job(job_id, "failed", 0, error=str(e))
