from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "nitisetu",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.workers.tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_expires=3600,
    task_track_started=True,
    task_routes={
        "app.workers.tasks.process_ocr": {"queue": "ocr"},
        "app.workers.tasks.process_anonymization": {"queue": "priority"},
        "app.workers.tasks.*": {"queue": "default"},
    },
    worker_max_tasks_per_child=50,
    task_soft_time_limit=300,
    task_time_limit=600,
)
