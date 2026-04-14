# नीतिSetu (NitiSetu)
### Institutional Regulatory Intelligence Platform for CDSCO

**NitiSetu** is a next-generation intelligence layer designed to streamline regulatory oversight at the Central Drugs Standard Control Organisation (CDSCO). It leverages hybrid AI (LLMs + NLP) to automate the most labor-intensive aspects of clinical trial monitoring and pharmaceutical compliance.

---

## 🚀 Vision
To bridge the gap between unstructured regulatory data (handwritten notes, complex PDF filings) and actionable compliance insights, ensuring patient safety and accelerating the approval of life-saving medicines in India.

## ✨ Core Features

### 1. Data Anonymisation (DPDP 2023 Compliant)
- **Hybrid Detection**: Combines Spacy/Transformers with custom Indian-market PII recognizers (Aadhaar, PAN, ABHA).
- **Persistent Pseudonymisation**: Deterministic token vault ensures the same entity always receives the same token across multi-document trials.
- **Irreversible Anonymisation**: Compliance with the Digital Personal Data Protection Act 2023 for final data publication.

### 2. SAE Intelligence & De-duplication
- **Duplicate Detection**: Cosine similarity engine identifies redundant Serious Adverse Event reports.
- **Smart Scoring**: Priority scoring based on severity markers (Death, Life-Threatening, Hospitalization).
- **Automation**: Automatic mapping to medical entity standards.

### 3. GCP Inspection Reporting
- **OCR Integration**: Processes scanned or handwritten inspector notes.
- **Formalisation**: Converts unstructured observations into formal CDSCO CT-04/SAE reporting templates.
- **Compliance Rating**: AI-assisted assessment of site readiness.

### 4. Semantic Document Comparison
- **Regulatory Diff**: Highlights substantive changes in filings (e.g., dosage tweaks) while ignoring administrative noise.
- **High Performance**: Optimized via model-singleton architecture for sub-5s processing.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React Query, Framer Motion, Tailwind CSS.
- **Backend**: FastAPI (Python 3.12+), Celery (Background Worker), Redis.
- **Database**: Supabase (PostgreSQL + pgvector).
- **AI Stack**: Claude 3.5 Sonnet, Microsoft Presidio, SentenceTransformers, PaddleOCR.

---

## 📦 Getting Started

### Prerequisites
- Docker & Docker Compose
- Supabase Project (URL + Service Key)
- Anthropic API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Jason-jo17/NitiSetu.git
   cd nitisetu
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your keys
   ```

3. Launch the platform:
   ```bash
   docker-compose up --build
   ```

4. Access the Gateway:
   - UI: `http://localhost:3000`
   - API Docs: `http://localhost:8000/docs`

---

## 🏛 Architecture
Refer to [ARCHITECTURE.md](./ARCHITECTURE.md) for a deep dive into the system design and AI processing pipelines.

## 🧠 AI Model Specs
Refer to [MODEL_CARD.md](./MODEL_CARD.md) for details on the models, datasets, and ethical considerations.

---

**Developed for the Digital transformation of Indian Regulatory Oversight.**
*Acolyte AI × CDSCO Partnership*
