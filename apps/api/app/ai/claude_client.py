import anthropic
from typing import Optional, AsyncGenerator
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class BridgeLayerAI:
    """
    Acolyte AI's Bridge Layer AI framework.
    """
    
    def __init__(self):
        self.client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.CLAUDE_MODEL
        
    async def complete(
        self, 
        system: str, 
        user: str, 
        max_tokens: int = 4096,
        temperature: float = 0.1,
        prefill: str = None
    ) -> str:
        """Single completion with structured regulatory prompting."""
        messages = [{"role": "user", "content": user}]
        if prefill:
            messages.append({"role": "assistant", "content": prefill})
            
        response = await self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system,
            messages=messages
        )
        return response.content[0].text
    
    async def complete_json(self, system: str, user: str, max_tokens: int = 4096) -> dict:
        """Complete and parse JSON output using optimal Anthropic prefill."""
        import json
        
        json_system = system + "\n\nYou MUST respond with valid JSON only. Output exactly the raw JSON data."
        text = await self.complete(json_system, user, max_tokens, prefill="{")
        
        # Add the prefill back
        text = "{" + text
        
        # Cleanup any trailing markdown that Claude might still append
        text = text.strip()
        if text.endswith("```"):
            text = text[:-3].strip()
            
        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {e}\nRaw: {text[:500]}")
            raise
    
    # --- Bridge Layer Prompts ---
    
    SUMMARIZATION_SYSTEMS = {
        "sugam_checklist": """You are NitiSetu's regulatory summarization engine, part of Acolyte AI's Bridge Layer AI framework.
You bridge between complex pharmaceutical regulatory submissions and the concise information CDSCO reviewers need.

Your task: Summarize SUGAM portal regulatory application checklists.
Output requirements:
- executive_summary: 2-3 sentences capturing the application's essence and regulatory pathway
- key_findings: List of 5-10 critical findings about the submission's content
- action_items: Specific items requiring reviewer attention or applicant response
- regulatory_implications: How this submission relates to CDSCO guidelines and Indian regulatory requirements
- guided_inquiry_questions: 3-5 Socratic questions that probe potential gaps or require clarification (this is the Guided Inquiry Engine — ask the questions a seasoned CDSCO reviewer would ask)

All output as JSON matching the specified schema.""",

        "sae_narration": """You are NitiSetu's SAE (Serious Adverse Event) summarization engine.
You bridge between complex clinical adverse event narratives and actionable regulatory assessments.

Your task: Extract and synthesize critical information from SAE case narratives (CIOMS format).
Focus on: patient demographics, suspect drug, event description, onset timeline, causality assessment, outcome, actions taken.
Output: concise case summary enabling efficient case-resolution by CDSCO officers.
Apply CDSCO 2022 Guidelines for SAE reporting standards.""",

        "meeting_transcript": """You are NitiSetu's meeting intelligence engine.
Your task: Synthesize key decisions, action items, and next steps from CDSCO meeting transcripts or audio transcription output.
Structure: executive summary → decisions taken → action items (owner, deadline, description) → open questions → follow-up required."""
    }
    
    COMPLETENESS_SYSTEM = """You are NitiSetu's regulatory completeness assessment engine — the Guided Inquiry Engine.
You verify the completeness, consistency, and accuracy of CDSCO regulatory submissions.

When you detect gaps, you don't just flag — you ask the precise questions a CDSCO Subject Expert Committee member would ask.
This is Acolyte AI's Bridge Layer AI in action: translating between what was submitted and what CDSCO requires.

Be precise about: which regulation/schedule/guideline mandates each field.
Output as JSON with field-level assessment and Socratic follow-up questions."""

    INSPECTION_SYSTEM = """You are NitiSetu's inspection report generation engine.
Convert unstructured/handwritten site inspection observations into formal CDSCO-compliant inspection reports.

Follow CDSCO GCP Inspection Report format:
- Section A: Investigator site details
- Section B: Subject records and informed consent
- Section C: Source documents and CRFs
- Section D: Investigational product accountability
- Section E: Ethics committee compliance
- Section F: Sponsor oversight
- Section G: Critical/Major/Minor findings classification
- Section H: Corrective Action Required

Use regulatory language. Categorize each finding by severity (Critical/Major/Minor/Observation)."""

# Singleton instance
bridge_ai = BridgeLayerAI()
