"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { api } from "@/lib/api";
import { DocumentSelector } from "@/components/shared/DocumentSelector";
import { EntityBadge } from "@/components/anonymize/EntityBadge";
import { MetricsPanel } from "@/components/anonymize/MetricsPanel";
import { ComplianceFlags } from "@/components/anonymize/ComplianceFlags";
import { toast } from "sonner";

export default function AnonymizePage() {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [mode, setMode] = useState<"both" | "pseudonymize" | "irreversible">("both");
  const [result, setResult] = useState<any>(null);
  const [showOriginal, setShowOriginal] = useState(false);

  const previewQuery = useQuery({
    queryKey: ["pii-preview", selectedDocId],
    queryFn: () => api.get(`/api/anonymize/preview/${selectedDocId}`),
    enabled: !!selectedDocId
  });

  const anonymizeMutation = useMutation({
    mutationFn: () => api.post("/api/anonymize/document", {
      document_id: selectedDocId,
      anonymization_mode: mode
    }),
    onSuccess: (data) => {
      toast.success("Document anonymization queued");
      // Poll for job completion
      pollJob(data.job_id);
    }
  });

  const pollJob = async (jobId: string) => {
    const poll = setInterval(async () => {
      const job = await api.get(`/api/jobs/${jobId}`);
      if (job.status === "completed") {
        clearInterval(poll);
        setResult(job.result);
      } else if (job.status === "failed") {
        clearInterval(poll);
        toast.error(job.error);
      }
    }, 2000);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, color: '#F1F5F9' }}>
          Data Anonymisation
        </h1>
        <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
          Detect and anonymize PII/PHI using hybrid rule-based + NLP approach.
          Compliant with DPDP Act 2023, NDHM, ICMR, and CDSCO guidelines.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Controls */}
        <div className="space-y-4">
          {/* Document Selector */}
          <div className="rounded-xl p-5 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
              SELECT DOCUMENT
            </h3>
            <DocumentSelector value={selectedDocId} onChange={setSelectedDocId} />
          </div>

          {/* Mode Selection */}
          <div className="rounded-xl p-5 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
              ANONYMISATION MODE
            </h3>
            <div className="space-y-2">
              {[
                { value: "both", label: "Full Pipeline", desc: "Pseudonymise then irreversibly anonymise" },
                { value: "pseudonymize", label: "Pseudonymise Only", desc: "Replace with consistent tokens (reversible)" },
                { value: "irreversible", label: "Irreversible Only", desc: "Generalise and normalise all PII" },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setMode(opt.value as any)}
                  className="w-full text-left p-3 rounded-lg border transition-all"
                  style={{
                    borderColor: mode === opt.value ? 'var(--accent-border)' : 'var(--border-subtle)',
                    background: mode === opt.value ? 'var(--accent-muted)' : 'transparent',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, 
                    color: mode === opt.value ? 'var(--accent-primary)' : '#CBD5E1' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* PII Preview */}
          {previewQuery.data && (
            <div className="rounded-xl p-5 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
                PII DETECTED (PREVIEW)
              </h3>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--accent-primary)' }}>
                {previewQuery.data.pii_count}
              </div>
              <div style={{ fontSize: 11, color: '#64748B' }}>entities found</div>
              <div className="mt-3 flex flex-wrap gap-1">
                {Object.entries(previewQuery.data.entity_breakdown || {}).map(([type, count]: any) => (
                  <EntityBadge key={type} type={type} count={count} />
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => anonymizeMutation.mutate()}
            disabled={!selectedDocId || anonymizeMutation.isPending}
            className="w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            style={{
              background: 'var(--accent-primary)',
              color: '#000',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              opacity: (!selectedDocId || anonymizeMutation.isPending) ? 0.5 : 1
            }}
          >
            <Shield size={14} />
            {anonymizeMutation.isPending ? "Processing..." : "Anonymise Document"}
          </button>
        </div>

        {/* Right: Results (2 cols) */}
        <div className="col-span-2 space-y-4">
          {result ? (
            <>
              <MetricsPanel result={result} />
              
              {/* Text comparison */}
              <div className="rounded-xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center justify-between p-4 border-b" 
                  style={{ borderColor: 'var(--border-subtle)' }}>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94A3B8' }}>
                    ANONYMISED OUTPUT
                  </h3>
                  <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="flex items-center gap-2 text-xs"
                    style={{ fontFamily: 'var(--font-mono)', color: '#64748B' }}
                  >
                    {showOriginal ? <EyeOff size={12} /> : <Eye size={12} />}
                    {showOriginal ? "Hide original" : "Compare original"}
                  </button>
                </div>
                <div className="p-4">
                  <pre style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: '#CBD5E1',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: 1.6,
                    maxHeight: 400,
                    overflow: 'auto'
                  }}>
                    {result.anonymized_text?.slice(0, 3000)}
                  </pre>
                </div>
              </div>

              <ComplianceFlags flags={result.compliance_flags || []} />
            </>
          ) : (
            <div className="h-full flex items-center justify-center" style={{ minHeight: 400 }}>
              <div className="text-center">
                <Shield size={48} style={{ color: '#1E293B', margin: '0 auto 16px' }} />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#334155' }}>
                  Select a document and run anonymisation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
