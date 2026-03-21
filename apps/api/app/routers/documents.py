from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.database import get_supabase
from app.core.config import settings
from datetime import datetime
import uuid, os, aiofiles

router = APIRouter()

ALLOWED_MIME = {
    "application/pdf", "image/jpeg", "image/png", "image/tiff",
    "audio/mpeg", "audio/wav", "audio/mp4",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
}

def classify_doc_type(filename: str, text: str) -> str:
    # Basic heuristic
    lower_text = text.lower()
    lower_name = filename.lower()
    if "sae" in lower_name or "adverse event" in lower_text:
        return "sae_report"
    if "inspection" in lower_name or "gcp" in lower_text:
        return "inspection_report"
    if "ct" in lower_name or "clinical trial" in lower_text:
        return "clinical_trial"
    return "unknown"

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")
    
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large")
    
    doc_id = str(uuid.uuid4())
    supabase = get_supabase()
    
    # Upload to Supabase Storage
    storage_path = f"documents/{doc_id}/{file.filename}"
    supabase.storage.from_("nitisetu").upload(storage_path, content)
    
    # Extract text (fast path for PDF)
    extracted_text = None
    if file.content_type == "application/pdf":
        try:
            import pdfplumber, io
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                extracted_text = "\n".join([p.extract_text() or "" for p in pdf.pages[:50]])
        except:
            pass
    
    # Classify document type
    doc_type = classify_doc_type(file.filename, extracted_text or "")
    
    # Save to DB
    supabase.table("documents").insert({
        "id": doc_id,
        "filename": f"{doc_id}_{file.filename}",
        "original_filename": file.filename,
        "mime_type": file.content_type,
        "storage_path": storage_path,
        "doc_type": doc_type,
        "file_size_bytes": len(content),
        "extracted_text": extracted_text
    }).execute()
    
    return {
        "document_id": doc_id,
        "filename": file.filename,
        "doc_type": doc_type,
        "storage_path": storage_path,
        "size_bytes": len(content),
        "created_at": datetime.utcnow().isoformat()
    }
