-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    doc_type TEXT NOT NULL DEFAULT 'unknown',
    file_size_bytes INTEGER,
    extracted_text TEXT,
    embedding vector(384),
    uploaded_by TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Processing Jobs
CREATE TABLE processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id),
    feature_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    result_json JSONB,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Token Vault (pseudonymization)
CREATE TABLE token_vault (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_hash TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    pseudonym TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(original_hash, entity_type)
);

-- CDSCO Checklist Templates
CREATE TABLE checklist_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_type TEXT NOT NULL,
    section TEXT NOT NULL,
    field_name TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    validation_rule TEXT,
    regulation_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SAE Reports (for duplicate detection)
CREATE TABLE sae_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id),
    severity TEXT,
    drug_name TEXT,
    event_term TEXT,
    patient_info TEXT,
    priority_score INTEGER,
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_of UUID REFERENCES sae_reports(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details JSONB,
    ip_address TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_documents_doc_type ON documents(doc_type);
CREATE INDEX idx_processing_jobs_document ON processing_jobs(document_id);
CREATE INDEX idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX idx_token_vault_hash ON token_vault(original_hash);
CREATE INDEX idx_sae_event_drug ON sae_reports(event_term, drug_name);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
