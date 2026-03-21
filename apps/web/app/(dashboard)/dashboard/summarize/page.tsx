"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FileSearch, AlignLeft, Info } from "lucide-react";
import { api } from "@/lib/api";
import { DocumentSelector } from "@/components/shared/DocumentSelector";
import { toast } from "sonner";

export default function SummarizationPage() {
  const [docId, setDocId] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<string>("sae_narrative");
  const [result, setResult] = useState<any>(null);

  const summarizeMutation = useMutation({
    mutationFn: () => api.post("/api/summarization/process", { document_id: docId, source_type: sourceType }),
    onSuccess: (data) => {
      if (data.job_id) {
        pollJob(data.job_id);
      } else {
        setResult(data);
      }
    },
    onError: () => toast.error("Summarization failed")
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
          Document Summarisation
        </h1>
        <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
          Generate regulatory-focused summaries utilizing Anthropic's Claude. Extract key findings, safety signals, and action items.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="space-y-4 pr-2">
          <div className="rounded-xl p-5 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
              SELECT DOCUMENT
            </h3>
            <DocumentSelector value={docId} onChange={setDocId} />
          </div>

          <div className="rounded-xl p-5 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
              SOURCE TYPE
            </h3>
            <select 
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="w-full bg-black/50 border rounded-lg p-3 text-sm text-slate-200 outline-none"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <option value="sae_narrative">SAE Narrative</option>
              <option value="clinical_trial_protocol">Clinical Trial Protocol</option>
              <option value="inspection_report">Inspection Report</option>
              <option value="general">General Regulatory Document</option>
            </select>
          </div>

          <button
            onClick={() => summarizeMutation.mutate()}
            disabled={!docId || summarizeMutation.isPending}
            className="w-full py-3 rounded-lg font-medium transition-all"
            style={{
              background: 'var(--info)',
              color: '#fff',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              opacity: (!docId || summarizeMutation.isPending) ? 0.5 : 1
            }}
          >
            {summarizeMutation.isPending ? "Generating..." : "Generate Summary"}
          </button>
          
          {result && result.quality_metrics && (
              <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-strong)'}}>
                  <div className="flex items-center gap-2 mb-2">
                      <Info size={14} style={{ color: 'var(--info)' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>Summary Metrics</span>
                  </div>
                  <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-400">
                          <span>ROUGE-L Score</span>
                          <span className="font-mono">{result.quality_metrics.rouge_l}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                          <span>Original Words</span>
                          <span className="font-mono">{result.quality_metrics.original_word_count}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                          <span>Summary Words</span>
                          <span className="font-mono">{result.quality_metrics.summary_word_count}</span>
                      </div>
                  </div>
              </div>
          )}
        </div>

        <div className="col-span-2 min-h-0 flex flex-col">
          {result ? (
            <div className="flex-1 rounded-xl border flex flex-col overflow-hidden"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
                <AlignLeft size={16} className="text-slate-400" />
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>
                  Generated Summary
                </h3>
              </div>
              <div className="p-6 overflow-y-auto">
                  <div 
                    className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed custom-markdown"
                    dangerouslySetInnerHTML={{ __html: result.summary_html }}
                  />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center rounded-xl border"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="text-center">
                <FileSearch size={48} style={{ color: '#1E293B', margin: '0 auto 16px' }} />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#334155' }}>
                  Select a document and source type to summarize
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
