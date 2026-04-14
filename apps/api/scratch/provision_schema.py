import psycopg2
import os
from urllib.parse import urlparse

DATABASE_URL = "postgresql://postgres.mihqafnkzjoiziwegmih:vY2%40Y%23f%23S8L_76H@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"

def provision():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # 1. Enable pgvector
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        
        # 2. Create documents table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS public.documents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                filename TEXT NOT NULL,
                original_filename TEXT NOT NULL,
                mime_type TEXT,
                storage_path TEXT,
                doc_type TEXT,
                file_size_bytes BIGINT,
                extracted_text TEXT,
                embedding VECTOR(1536),
                uploaded_by UUID,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)

        # 3. Create checklist_templates table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS public.checklist_templates (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                form_type TEXT NOT NULL,
                section TEXT NOT NULL,
                field_name TEXT NOT NULL,
                is_mandatory BOOLEAN DEFAULT TRUE,
                regulation_reference TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)

        # 4. Create processing_jobs table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS public.processing_jobs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                document_id UUID REFERENCES public.documents(id),
                feature_type TEXT NOT NULL,
                status TEXT NOT NULL,
                progress INTEGER DEFAULT 0,
                error TEXT,
                result_json JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)

        # 5. Create sae_reports table (Indian CDSCO/NDCTR format)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS public.sae_reports (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                document_id UUID REFERENCES public.documents(id),
                patient_initials TEXT,
                age INTEGER,
                sex TEXT,
                suspect_drug TEXT,
                event_description TEXT,
                severity TEXT,
                priority_score INTEGER DEFAULT 0,
                casuality TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)

        # 6. Create audit_log table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS public.audit_log (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID,
                action TEXT NOT NULL,
                details JSONB,
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)
        
        # 7. Create search function
        cur.execute("""
            CREATE OR REPLACE FUNCTION match_documents (
              query_embedding VECTOR(1536),
              match_threshold FLOAT,
              match_count INT
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
              ORDER BY similarity DESC
              LIMIT match_count;
            END;
            $$;
        """)
        
        conn.commit()
        print("Database schema provisioned successfully.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error provisioning database: {e}")

if __name__ == "__main__":
    provision()
