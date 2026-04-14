from typing import Optional, Dict, Any
from app.core.database import get_supabase
import logging

logger = logging.getLogger(__name__)

class DocumentService:
    async def get_document(self, document_id: str) -> Dict[str, Any]:
        """Fetch document metadata from Supabase."""
        supabase = get_supabase()
        result = supabase.table("documents").select("*").eq("id", document_id).execute()
        if not result.data:
            raise ValueError(f"Document {document_id} not found")
        return result.data[0]

    async def get_document_text(self, document_id: str) -> str:
        """Fetch extracted text for a document."""
        doc = await self.get_document(document_id)
        text = doc.get("extracted_text")
        if not text:
            # In a real environment, this might trigger OCR if the text is missing
            # For now, we return empty string or raise if critical
            logger.warning(f"No extracted text found for document {document_id}")
            return ""
        return text

    async def update_document(self, document_id: str, updates: Dict[str, Any]):
        """Update document metadata."""
        supabase = get_supabase()
        supabase.table("documents").update(updates).eq("id", document_id).execute()

document_service = DocumentService()
