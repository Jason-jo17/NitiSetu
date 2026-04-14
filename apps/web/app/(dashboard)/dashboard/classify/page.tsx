"use client";
import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Tag, Clock, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { DocumentSelector } from "@/components/shared/DocumentSelector";
import { toast } from "sonner";
import { ProcessingOverlay } from "@/components/shared/ProcessingOverlay";
import { SeverityBadge } from "@/components/classify/SeverityBadge";
import { PriorityScore } from "@/components/classify/PriorityScore";

export default function ClassifyPage() {
  const [docId, setDocId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [jobStatus, setJobStatus] = useState<string>("idle");
  const [jobProgress, setJobProgress] = useState<number>(0);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const classifyMutation = useMutation({
    mutationFn: () => api.post("/api/classify/process", { document_id: docId }),
    onSuccess: (data) => {
      if (data.job_id) {
        setJobStatus("pending");
        pollJob(data.job_id);
      } else {
        setResult(data);
      }
    },
    onError: () => toast.error("Classification failed")
  });

  const pollJob = (jobId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    pollingRef.current = setInterval(async () => {
      try {
        const job = await api.get(`/api/jobs/${jobId}`);
        setJobStatus(job.status);
        setJobProgress(job.progress || 0);

        if (job.status === "completed") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setResult(job.result);
          toast.success("Classification complete");
        } else if (job.status === "failed") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          toast.error(job.error || "Processing failed");
        }
      } catch (err) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        toast.error("Lost connection to processing engine");
      }
    }, 2000);
  };

  return (
    <div className="p-8">
      <ProcessingOverlay 
        isVisible={jobStatus === "processing" || jobStatus === "pending"}
        title="Classifying SAE..."
        progress={jobProgress}
        statusMessage={jobProgress < 30 ? "Analyzing Severity & Causality" : jobProgress < 80 ? "Triaging Medical Data" : "Finalizing Priority Scoring"}
        color="violet"
        engine="SAFETY-ORCHESTRATOR"
      />
      <div className="mb-8">
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, color: '#F1F5F9' }}>
          SAE Classification & Triaging
        </h1>
        <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
          Auto-classify Serious Adverse Events per CDSCO/ICH E2A guidelines.
          Detects duplicates, extracts MedDRA PTs, and assigns priority scores.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="rounded-xl p-5 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
              SAE DOCUMENT
            </h3>
            <DocumentSelector value={docId} onChange={setDocId} />
          </div>

          <button
            onClick={() => classifyMutation.mutate()}
            disabled={!docId || classifyMutation.isPending}
            className="w-full py-3 rounded-lg font-medium transition-all"
            style={{
              background: 'var(--danger)',
              color: '#000',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              opacity: (!docId || classifyMutation.isPending) ? 0.5 : 1
            }}
          >
            {classifyMutation.isPending ? "Classifying..." : "Run Classification"}
          </button>
        </div>

        <div className="col-span-2 space-y-4">
          {result ? (
            <>
              {/* Top Metrics Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl p-5 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
                    SEVERITY & PRIORITY
                  </h3>
                  <div className="flex items-start justify-between">
                    <div>
                      <SeverityBadge severity={result.severity} />
                      <p style={{ fontSize: 11, color: '#64748B', marginTop: 8 }}>
                        Confidence: {(result.severity_confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                    <PriorityScore score={result.priority_score} />
                  </div>
                </div>

                <div className="rounded-xl p-5 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
                    DUPLICATE DETECTION
                  </h3>
                  {result.is_duplicate ? (
                    <div className="flex items-start gap-3">
                      <AlertTriangle style={{ color: 'var(--warning)', marginTop: 2, flexShrink: 0 }} size={16} />
                      <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--warning)' }}>
                          Potential Duplicate
                        </div>
                        <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                          Similarity: {(result.duplicate_similarity_score * 100).toFixed(1)}%<br/>
                          Matches ID: {result.duplicate_of?.slice(0,8)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle style={{ color: 'var(--success)' }} size={16} />
                      <span style={{ fontSize: 13, color: '#94A3B8' }}>No duplicates found</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Extracted Entities */}
              <div className="rounded-xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                <div className="p-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94A3B8' }}>
                    EXTRACTED MEDICAL ENTITIES
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  {[
                    { label: "MedDRA PT", value: result.meddra_pt },
                    { label: "Drug Name", value: result.extracted_entities?.drug_name },
                    { label: "Causality", value: result.extracted_entities?.causality },
                    { label: "Onset Date", value: result.extracted_entities?.onset_date },
                  ].map(e => (
                    <div key={e.label} className="p-3 rounded bg-black/20 border" style={{ borderColor: 'var(--border-subtle)' }}>
                      <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4 }}>{e.label}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#E2E8F0' }}>{e.value || "—"}</div>
                    </div>
                  ))}
                  <div className="col-span-2 p-3 rounded bg-black/20 border" style={{ borderColor: 'var(--border-subtle)' }}>
                      <div style={{ fontSize: 10, color: '#64748B', marginBottom: 4 }}>Severity Rationale</div>
                      <div style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.5 }}>
                        {result.extracted_entities?.severity_rationale}
                      </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
             <div className="h-full flex items-center justify-center rounded-xl border"
              style={{ minHeight: 400, background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="text-center">
                <Tag size={48} style={{ color: '#1E293B', margin: '0 auto 16px' }} />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#334155' }}>
                  Select an SAE report to classify
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
