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

from app.core.limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

app = FastAPI(
    title="NitiSetu API",
    description="CDSCO Regulatory Intelligence Platform by Acolyte AI",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    redirect_slashes=True
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

from starlette.responses import JSONResponse
from starlette.requests import Request

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"GLOBAL CRASH: {exc}")
    origin = request.headers.get("origin", "*")
    response = JSONResponse(
        status_code=500,
        content={"detail": "NitiSetu Internal Platform Error", "msg": str(exc), "synthetic_fallback": True}
    )
    # FORCE CORS HEADERS ON EXCEPTIONS
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, apikey, x-client-info"
    return response

@app.middleware("http")
async def custom_cors_middleware(request: Request, call_next):
    # Standard request flow
    try:
        if request.method == "OPTIONS":
            from starlette.responses import Response
            response = Response()
        else:
            response = await call_next(request)
    except Exception as e:
        # This fallback is for errors inside the middleware chain itself
        logger.error(f"Middleware internal crash: {e}")
        response = JSONResponse(
            status_code=500,
            content={"detail": "Middleware Error", "msg": str(e)}
        )
    
    origin = request.headers.get("origin", "*")
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, apikey, x-client-info"
        
    return response

app.add_middleware(GZipMiddleware, minimum_size=1000)

from app.core.auth import get_current_user
from fastapi import Depends

# Mount all routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"], dependencies=[Depends(get_current_user)])
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"], dependencies=[Depends(get_current_user)])
app.include_router(anonymization.router, prefix="/api/anonymize", tags=["anonymization"], dependencies=[Depends(get_current_user)])
app.include_router(summarization.router, prefix="/api/summarize", tags=["summarization"], dependencies=[Depends(get_current_user)])
app.include_router(completeness.router, prefix="/api/completeness", tags=["completeness"], dependencies=[Depends(get_current_user)])
app.include_router(classification.router, prefix="/api/classify", tags=["classification"], dependencies=[Depends(get_current_user)])
app.include_router(comparison.router, prefix="/api/compare", tags=["comparison"], dependencies=[Depends(get_current_user)])
app.include_router(inspection.router, prefix="/api/inspect", tags=["inspection"], dependencies=[Depends(get_current_user)])
