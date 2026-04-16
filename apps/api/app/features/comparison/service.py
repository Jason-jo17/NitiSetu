from app.ai.claude_client import bridge_ai
from app.features.documents.service import document_service
from typing import Dict, Any
import difflib
import re
import logging

logger = logging.getLogger(__name__)

_model = None

def get_similarity_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        logger.info("Loading SentenceTransformer model (all-MiniLM-L6-v2)...")
        _model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    return _model

class ComparisonService:
    
    COMPARISON_SYSTEM = """You are NitiSetu's document comparison engine.
Analyze the structural and substantive differences between two versions of a regulatory filing.
Categorize changes as:
- "substantive": Changes that affect regulatory meaning, data, conclusions, or commitments
- "formatting": Layout/style changes with no regulatory impact
- "administrative": Changes to dates, page numbers, reference numbers, signatory names

Focus on what CDSCO reviewers need to know: what changed, why it matters, is it acceptable.

Return JSON with change_summary and categorized changes."""
    
    async def compare(
        self, 
        document_id_v1: str,
        document_id_v2: str
    ) -> Dict[str, Any]:
        
        text_v1 = await document_service.get_document_text(document_id_v1)
        text_v2 = await document_service.get_document_text(document_id_v2)
        
        # Layer 1: Structural diff (difflib)
        diff_html = self._generate_diff_html(text_v1, text_v2)
        
        # Layer 2: Semantic similarity
        semantic_score = self._compute_semantic_similarity(text_v1, text_v2)
        
        # Layer 3: Claude change analysis
        analysis = await bridge_ai.complete_json(
            system=self.COMPARISON_SYSTEM,
            user=f"""Compare these two document versions and identify regulatory-significant changes.

VERSION 1 (first 30K chars):
{text_v1[:30000]}

VERSION 2 (first 30K chars):
{text_v2[:30000]}

Return JSON:
{{
    "change_summary": "string",
    "substantive_changes": [
        {{"section": "string", "description": "string", "regulatory_impact": "string", "severity": "high|medium|low"}}
    ],
    "formatting_changes_count": 0,
    "administrative_changes_count": 0,
    "total_changes": 0,
    "recommendation": "string"
}}"""
        )
        
        return {
            "document_id_v1": document_id_v1,
            "document_id_v2": document_id_v2,
            "total_changes": analysis.get("total_changes", 0),
            "substantive_changes": analysis.get("substantive_changes", []),
            "formatting_changes": analysis.get("formatting_changes_count", 0),
            "administrative_changes": analysis.get("administrative_changes_count", 0),
            "change_summary": analysis.get("change_summary", ""),
            "semantic_similarity_score": semantic_score,
            "diff_html": diff_html
        }
    
    def _generate_diff_html(self, text_v1: str, text_v2: str) -> str:
        lines_v1 = text_v1.splitlines()
        lines_v2 = text_v2.splitlines()
        differ = difflib.HtmlDiff(wrapcolumn=80)
        return differ.make_file(lines_v1, lines_v2, fromdesc="Version 1", todesc="Version 2")
    
    def _compute_semantic_similarity(self, text_v1: str, text_v2: str) -> float:
        try:
            import numpy as np
            
            model = get_similarity_model()
            emb1 = model.encode([text_v1[:5000]])
            emb2 = model.encode([text_v2[:5000]])
            
            # Manual cosine similarity: dot(A, B) / (norm(A) * norm(B))
            A = emb1[0]
            B = emb2[0]
            
            norm_a = np.linalg.norm(A)
            norm_b = np.linalg.norm(B)
            
            if norm_a == 0 or norm_b == 0:
                return 0.0
                
            score = np.dot(A, B) / (norm_a * norm_b)
            return round(float(score), 4)
        except Exception as e:
            logger.warning(f"Semantic similarity failed: {e}")
            return 0.0

comparison_service = ComparisonService()
