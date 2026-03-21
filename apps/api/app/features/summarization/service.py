from app.ai.claude_client import bridge_ai
from app.features.documents.service import document_service
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class SummarizationService:
    
    async def summarize(
        self, 
        document_id: str,
        source_type: str,
        max_length_words: int = 500,
        include_action_items: bool = True
    ) -> Dict[str, Any]:
        
        # Get document text
        text = await document_service.get_document_text(document_id)
        
        system = bridge_ai.SUMMARIZATION_SYSTEMS.get(
            source_type, 
            bridge_ai.SUMMARIZATION_SYSTEMS["sugam_checklist"]
        )
        
        user_prompt = f"""
Please analyze and summarize the following regulatory document.
Document type: {source_type}
Maximum summary length: {max_length_words} words
Include action items: {include_action_items}

Return a JSON object with these exact keys:
{{
    "executive_summary": "string",
    "key_findings": ["string", ...],
    "action_items": ["string", ...],
    "regulatory_implications": ["string", ...],
    "guided_inquiry_questions": ["string", ...]
}}

DOCUMENT:
{text[:150000]}
"""
        
        result = await bridge_ai.complete_json(system=system, user=user_prompt, max_tokens=4096)
        
        # Compute ROUGE scores against extracted key sentences as reference
        rouge_scores = self._compute_rouge(
            hypothesis=result.get("executive_summary", ""),
            reference=" ".join(result.get("key_findings", []))
        )
        
        return {
            **result,
            "source_type": source_type,
            "original_length": len(text.split()),
            **rouge_scores
        }
    
    def _compute_rouge(self, hypothesis: str, reference: str) -> Dict[str, float]:
        try:
            from rouge_score import rouge_scorer
            scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
            scores = scorer.score(reference, hypothesis)
            return {
                "rouge_1": round(scores['rouge1'].fmeasure, 4),
                "rouge_2": round(scores['rouge2'].fmeasure, 4),
                "rouge_l": round(scores['rougeL'].fmeasure, 4),
                "bert_score": None  # Computed separately in evaluation pipeline
            }
        except Exception as e:
            logger.warning(f"ROUGE computation failed: {e}")
            return {"rouge_1": None, "rouge_2": None, "rouge_l": None, "bert_score": None}

summarization_service = SummarizationService()
