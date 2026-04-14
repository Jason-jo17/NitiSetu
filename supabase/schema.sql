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
ALTER TABLE sae_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;

-- Documents: Users can only see and insert their own uploads
CREATE POLICY "Users can only see their own docs" ON documents 
FOR SELECT USING (auth.uid()::text = uploaded_by);

CREATE POLICY "Users can only insert their own docs" ON documents 
FOR INSERT WITH CHECK (auth.uid()::text = uploaded_by);


CREATE POLICY "Users can only delete their own docs" ON documents 
FOR DELETE USING (auth.uid()::text = uploaded_by);

-- Processing Jobs: Users can only see jobs for their docs
CREATE POLICY "Users can only see jobs for their docs" ON processing_jobs
FOR ALL USING (
  document_id IN (
    SELECT id FROM documents WHERE auth.uid()::text = uploaded_by
  )
);

-- SAE Reports: Users can only see reports for their docs
CREATE POLICY "Users can only see reports for their docs" ON sae_reports
FOR ALL USING (
  document_id IN (
    SELECT id FROM documents WHERE auth.uid()::text = uploaded_by
  )
);

-- Checklist Templates: Authenticated users can read only
CREATE POLICY "Authenticated users can read templates" ON checklist_templates
FOR SELECT TO authenticated USING (true);

-- Token Vault: No policy defined (Default Deny for Client-side, Service Role only)
-- Audit Log: Administrative read only (or per-user if logged)
CREATE POLICY "Users can see their own audit logs" ON audit_log
FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own audit logs" ON audit_log
FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id IS NULL);

-- Profiles table for RBAC
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'reviewer' CHECK (role IN ('admin', 'reviewer', 'inspector', 'readonly')),
    designation TEXT,
    zone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own profile" ON profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);

-- Trigger to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'reviewer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Semantic Search Function
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  filename TEXT,
  original_filename TEXT,
  doc_type TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.filename,
    documents.original_filename,
    documents.doc_type,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
