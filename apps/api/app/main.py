from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import init_db
from app.routers import (
    anonymization,
    summarization,
    completeness,
    classification,
    comparison,
    inspection,
    documents,
    jobs,
    health
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("NitiSetu API starting up...")
    await init_db()
    yield
    logger.info("NitiSetu API shutting down...")

app = FastAPI(
    title="NitiSetu API",
    description="CDSCO Regulatory Intelligence Platform by Acolyte AI",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Mount all routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(anonymization.router, prefix="/api/anonymize", tags=["anonymization"])
app.include_router(summarization.router, prefix="/api/summarize", tags=["summarization"])
app.include_router(completeness.router, prefix="/api/completeness", tags=["completeness"])
app.include_router(classification.router, prefix="/api/classify", tags=["classification"])
app.include_router(comparison.router, prefix="/api/compare", tags=["comparison"])
app.include_router(inspection.router, prefix="/api/inspect", tags=["inspection"])
