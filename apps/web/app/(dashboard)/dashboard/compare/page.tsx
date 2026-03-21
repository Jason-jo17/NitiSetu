"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { GitCompare, FileDiff } from "lucide-react";
import { api } from "@/lib/api";
import { DocumentSelector } from "@/components/shared/DocumentSelector";
import { ChangesSummary } from "@/components/compare/ChangesSummary";
import { DiffViewer } from "@/components/compare/DiffViewer";
import { toast } from "sonner";

export default function ComparePage() {
  const [docV1, setDocV1] = useState<string | null>(null);
  const [docV2, setDocV2] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const compareMutation = useMutation({
    mutationFn: () => api.post("/api/comparison/compare", { document_id_v1: docV1, document_id_v2: docV2 }),
    onSuccess: (data) => {
      if (data.job_id) {
        pollJob(data.job_id);
      } else {
        setResult(data);
      }
    },
    onError: () => toast.error("Comparison failed")
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
    <div className="p-8 h-full flex flex-col">
      <div className="mb-8 flex-shrink-0">
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, color: '#F1F5F9' }}>
          Document Comparison (V-Sync)
        </h1>
        <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
          Semantic & structural comparison of protocol amendments, IB updates, and ICF changes.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6 flex-1 min-h-0">
        <div className="space-y-4 overflow-y-auto pr-2">
          <div className="rounded-xl p-5 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
              VERSION 1 (PREVIOUS)
            </h3>
            <DocumentSelector value={docV1} onChange={setDocV1} />
          </div>

          <div className="rounded-xl p-5 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
              VERSION 2 (CURRENT)
            </h3>
            <DocumentSelector value={docV2} onChange={setDocV2} />
          </div>

          <button
            onClick={() => compareMutation.mutate()}
            disabled={!docV1 || !docV2 || compareMutation.isPending}
            className="w-full py-3 rounded-lg font-medium transition-all"
            style={{
              background: 'var(--info)',
              color: '#fff',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              opacity: (!docV1 || !docV2 || compareMutation.isPending) ? 0.5 : 1
            }}
          >
            {compareMutation.isPending ? "Comparing..." : "Compare Versions"}
          </button>
          
          {result && (
            <div className="rounded-xl p-5 flex items-center justify-between border"
              style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>Semantic Similarity</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600, color: 'var(--accent-primary)' }}>
                    {(result.semantic_similarity_score * 100).toFixed(1)}%
                  </div>
                </div>
                <GitCompare size={24} style={{ color: 'var(--accent-primary)', opacity: 0.5 }} />
            </div>
          )}
        </div>

        <div className="col-span-3 flex flex-col min-h-0 space-y-4">
          {result ? (
            <>
              <ChangesSummary result={result} />
              <div className="flex-1 min-h-0 rounded-xl border overflow-hidden flex flex-col" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="p-3 border-b flex items-center gap-2" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                      <FileDiff size={14} style={{ color: '#94A3B8' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#94A3B8' }}>STRUCTURAL DIFF VIEWER</span>
                  </div>
                  <div className="flex-1 overflow-auto bg-white p-4">
                      {/* Difflib outputs standard HTML diff tables */}
                      <div dangerouslySetInnerHTML={{ __html: result.diff_html }} className="text-black text-sm custom-diff" />
                  </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center rounded-xl border"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="text-center">
                <GitCompare size={48} style={{ color: '#1E293B', margin: '0 auto 16px' }} />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#334155' }}>
                  Select two documents to compare changes
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
