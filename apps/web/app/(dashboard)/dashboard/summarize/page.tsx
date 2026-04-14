"use client";
import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { FileSearch, AlignLeft, Info } from "lucide-react";
import { api } from "@/lib/api";
import { DocumentSelector } from "@/components/shared/DocumentSelector";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import { ProcessingOverlay } from "@/components/shared/ProcessingOverlay";

export default function SummarizationPage() {
  const [docId, setDocId] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<string>("sae_narration");
  const [result, setResult] = useState<any>(null);
  const [jobStatus, setJobStatus] = useState<string>("idle");
  const [jobProgress, setJobProgress] = useState<number>(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const summarizeMutation = useMutation({
    mutationFn: () => api.post("/api/summarize/process", { 
      document_id: docId, 
      source_type: sourceType 
    }),
    onSuccess: (data) => {
      if (data.job_id) {
        setJobStatus("pending");
        pollJob(data.job_id);
      } else {
        setResult(data);
      }
    },
    onError: () => toast.error("Summarization failed")
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
          toast.success("Summary generated");
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
    <div className="p-8 h-full flex flex-col">
      <ProcessingOverlay 
        isVisible={jobStatus === "processing" || jobStatus === "pending"}
        title="Summarising Case..."
        progress={jobProgress}
        statusMessage={jobProgress < 30 ? "Initializing AI Engine" : jobProgress < 80 ? "Extracting Context" : "Synthesizing Regulatory Findings"}
        color="info"
      />
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
              <option value="sae_narration">SAE Narration</option>
              <option value="sugam_checklist">SUGAM Checklist</option>
              <option value="meeting_transcript">Meeting Transcript</option>
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
              <div className="p-6 overflow-y-auto space-y-8">
                  {/* Executive Summary */}
                  <section>
                    <h4 className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[10px] uppercase tracking-widest w-fit">
                      <AlignLeft size={12} />
                      Executive Summary
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {result.executive_summary}
                    </p>
                  </section>

                  {/* Key Findings */}
                  <div className="grid grid-cols-2 gap-8">
                    <section>
                      <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-4">Key Findings</h4>
                      <ul className="space-y-3">
                        {result.key_findings?.map((item: string, i: number) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-1.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section>
                      <h4 className="text-[10px] uppercase tracking-widest text-amber-500/80 font-mono mb-4">Action Items</h4>
                      <ul className="space-y-3">
                        {result.action_items?.map((item: string, i: number) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/40 mt-1.5 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>

                  {/* Regulatory & Inquiry */}
                  <div className="grid grid-cols-2 gap-8">
                    <section className="bg-slate-900/40 rounded-xl p-5 border border-white/5">
                      <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-4">Regulatory Implications</h4>
                      <ul className="space-y-3">
                        {result.regulatory_implications?.map((item: string, i: number) => (
                          <li key={i} className="text-sm text-slate-400 italic leading-relaxed">
                            "{item}"
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="bg-purple-500/5 rounded-xl p-5 border border-purple-500/10">
                      <h4 className="text-[10px] uppercase tracking-widest text-purple-400 font-mono mb-4">Guided Inquiry</h4>
                      <ul className="space-y-3">
                        {result.guided_inquiry_questions?.map((item: string, i: number) => (
                          <li key={i} className="text-sm text-slate-300 font-medium">
                            <span className="text-purple-500 mr-2">Q.</span> {item}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
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
