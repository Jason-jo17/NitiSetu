# NitiSetu API Documentation

Base URL: `http://localhost:8000/api`

## Authentication
All endpoints require JWT authentication via Supabase.
Include header: `Authorization: Bearer <supabase_access_token>`

---

## Feature Endpoints

### 1. Data Anonymisation

#### POST /anonymize/process
Queue document anonymization job.

**Request:**
```json
{
  "document_id": "uuid",
  "mode": "both|pseudonymize|irreversible"
}
```

**Response:**
```json
{
  "job_id": "uuid",
  "status": "pending"
}
```

#### GET /anonymize/preview/{document_id}
Preview PII entities without anonymizing.

---

### 2. Document Summarisation

#### POST /summarize/process
Queue document summarization job.

**Request:**
```json
{
  "document_id": "uuid",
  "source_type": "sugam_checklist|sae_narration|meeting_transcript"
}
```

---

### 3. Completeness Assessment

#### POST /completeness/process
Queue completeness assessment job.

**Request:**
```json
{
  "document_id": "uuid",
  "form_type": "CT_04|CT_06|SAE_CIOMS|MD_DEVICE"
}
```

---

### 4. SAE Classification

#### POST /classify/process
Queue SAE classification job.

**Request:**
```json
{
  "document_id": "uuid"
}
```

---

### 5. Document Comparison

#### POST /compare/process
Queue document comparison job.

**Request:**
```json
{
  "document_id_v1": "uuid",
  "document_id_v2": "uuid"
}
```

---

### 6. Inspection Report Generation

#### POST /inspect/process
Queue inspection report generation job.

**Request:**
```json
{
  "document_id": "uuid"
}
```

---

## Common Endpoints

### GET /jobs/{job_id}
Get job status and results.

**Response:**
```json
{
  "id": "uuid",
  "status": "pending|processing|completed|failed",
  "progress": 0-100,
  "result_json": {...},
  "error": null
}
```

### POST /documents/upload
Upload a document for processing.

**Request:** multipart/form-data with `file` field

### GET /health
Health check endpoint.
