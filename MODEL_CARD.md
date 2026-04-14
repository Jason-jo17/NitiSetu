# NitiSetu AI Model Card

This document provides transparent documentation for the machine learning and intelligence models integrated into the NitiSetu platform.

## Model 1: Institutional Reasoning Engine
- **Provider**: Anthropic (Claude 3.5 Sonnet)
- **Primary Use**: 
    - Summarization of complex clinical trials.
    - Identification of missing regulatory documentation (Completeness Check).
    - Formalization of unstructured inspector notes into CDSCO templates.
    - Serious Adverse Event (SAE) classification.
- **Context Window**: 200,000 tokens.
- **Constraint**: Strict system prompts are used to ensure "Institutional Neutrality" and adherence to Indian regulatory nomenclature.

## Model 2: Privacy Defense Guard (PII)
- **Framework**: Microsoft Presidio
- **Core Models**: 
    - `en_core_web_lg` (Spacy) for Named Entity Recognition.
    - Custom Regex & logic recognizers for Indian ID formats.
- **Intended Data**: Clinical trial patient records, hospital discharge summaries, regulatory applications.
- **Limitations**: May have reduced accuracy on non-English regional transliterations of names/addresses.

## Model 3: Semantic Similarity Engine
- **Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Architecture**: Bi-Encoder (MiniLM).
- **Secondary Usage**: Cosine similarity calculation between document embeddings.
- **Performance**: Integrated as a module-level singleton in NitiSetu for low-latency (<100ms) vector comparisons after initial load.

## Model 4: Inspection Intelligence (OCR)
- **Provider**: PaddleOCR / Docling
- **Use Case**: Digitization of handwritten or poor-quality scans of site inspection findings.
- **Accuracy**: High for printed text; moderate for varying handwriting styles common in localized Indian hospital settings.

---

## 🔍 Evaluation & Compliance
- **ROUGE/BERTScore**: Used for objective summarization quality assessment.
- **K-Anonymity**: The platform computes a localized K-Anonymity score during de-identification.
- **Ethical Considerations**:
    - **No PII Persistence**: The core reasoning engine (Claude) processes data in-transit only; PII is anonymized locally *before* being sent to external LLMs whenever possible.
    - **Human-in-the-loop**: All AI-generated inspection reports and completeness checks are labeled as "Auto-generated" and require official CDSCO sign-off.

---
*Document Version: 1.0.0 (April 2026)*
*Compliance Lead: Acolyte AI Intelligence Team*
