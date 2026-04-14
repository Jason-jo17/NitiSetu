"use client";
import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckSquare, AlertCircle, XCircle, CheckCircle, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { DocumentSelector } from "@/components/shared/DocumentSelector";
import { GuidedInquiryPanel } from "@/components/completeness/GuidedInquiryPanel";
import { FieldStatusTable } from "@/components/completeness/FieldStatusTable";
import { toast } from "sonner";
import { ProcessingOverlay } from "@/components/shared/ProcessingOverlay";

const FORM_TYPES = [
  { value: "CT_04", label: "Form CT-04", desc: "Clinical Trial New Drug Application" },
  { value: "CT_06", label: "Form CT-06", desc: "Clinical Trial Amendment" },
  { value: "SAE_CIOMS", label: "SAE CIOMS-I", desc: "Serious Adverse Event Report" },
  { value: "MD_DEVICE", label: "MD Online", desc: "Medical Device Application" },
];

const STATUS_ICONS = {
  present: { icon: CheckCircle, color: 'var(--success)' },
  missing: { icon: XCircle, color: 'var(--danger)' },
  incomplete: { icon: AlertCircle, color: 'var(--warning)' },
  inconsistent: { icon: HelpCircle, color: 'var(--info)' },
};

export default function CompletenessPage() {
  const [docId, setDocId] = useState<string | null>(null);
  const [formType, setFormType] = useState("CT_04");
  const [result, setResult] = useState<any>(null);
  const [jobStatus, setJobStatus] = useState<string>("idle");
  const [jobProgress, setJobProgress] = useState<number>(0);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const assessMutation = useMutation({
    mutationFn: () => api.post("/api/completeness/process", {
      document_id: docId,
      form_type: formType
    }),
    onSuccess: (data) => {
      if (data.job_id) {
        setJobStatus("pending");
        pollJob(data.job_id);
      } else {
        setResult(data);
      }
    },
    onError: () => toast.error("Completeness assessment failed")
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
          toast.success("Assessment complete");
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

  const completenessColor = result 
    ? result.overall_completeness_pct >= 90 ? 'var(--success)'
    : result.overall_completeness_pct >= 70 ? 'var(--warning)'
    : 'var(--danger)'
    : 'var(--accent-primary)';

  return (
    <div className="p-8">
      <ProcessingOverlay 
        isVisible={jobStatus === "processing" || jobStatus === "pending"}
        title="Assessing Compliance..."
        progress={jobProgress}
        statusMessage={jobProgress < 30 ? "Verifying Filing Structure" : jobProgress < 80 ? "Auditing Mandatory Fields" : "Generating Gap Analysis Report"}
        color="emerald"
        engine="CDSCO-RULES-2019"
      />
      <div className="mb-8">
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 600, color: '#F1F5F9' }}>
          Completeness Assessment
        </h1>
        <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
          Verify regulatory submission completeness against CDSCO mandatory fields.
          Powered by Bridge Layer AI Guided Inquiry Engine.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Controls Column */}
        <div className="space-y-4">
          <div className="rounded-xl p-5 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
              DOCUMENT
            </h3>
            <DocumentSelector value={docId} onChange={setDocId} />
          </div>

          <div className="rounded-xl p-5 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
              FORM TYPE
            </h3>
            <div className="space-y-2">
              {FORM_TYPES.map(ft => (
                <button
                  key={ft.value}
                  onClick={() => setFormType(ft.value)}
                  className="w-full text-left p-3 rounded-lg border transition-all"
                  style={{
                    borderColor: formType === ft.value ? 'var(--accent-border)' : 'var(--border-subtle)',
                    background: formType === ft.value ? 'var(--accent-muted)' : 'transparent',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12,
                    color: formType === ft.value ? 'var(--accent-primary)' : '#CBD5E1' }}>
                    {ft.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{ft.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {result && (
            <div className="rounded-xl p-5 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
                COMPLETENESS SCORE
              </h3>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 700, color: completenessColor }}>
                {result.overall_completeness_pct}%
              </div>
              <div className="mt-2 space-y-1">
                {[
                  { label: "Present", val: result.present_count, color: 'var(--success)' },
                  { label: "Missing", val: result.missing_count, color: 'var(--danger)' },
                  { label: "Inconsistent", val: result.inconsistent_count, color: 'var(--warning)' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span style={{ fontSize: 11, color: '#64748B' }}>{s.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: s.color }}>{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => assessMutation.mutate()}
            disabled={!docId || assessMutation.isPending}
            className="w-full py-3 rounded-lg font-medium transition-all"
            style={{
              background: 'var(--accent-primary)',
              color: '#000',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              opacity: (!docId || assessMutation.isPending) ? 0.5 : 1
            }}
          >
            {assessMutation.isPending ? "Assessing..." : "Run Assessment"}
          </button>
        </div>

        {/* Results: 3 columns */}
        <div className="col-span-3 space-y-4">
          {result ? (
            <>
              <FieldStatusTable fieldResults={result.field_results} />
              <GuidedInquiryPanel 
                questions={result.guided_questions}
                recommendations={result.recommendations}
              />
            </>
          ) : (
            <div className="h-full flex items-center justify-center rounded-xl border"
              style={{ minHeight: 500, background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="text-center">
                <CheckSquare size={48} style={{ color: '#1E293B', margin: '0 auto 16px' }} />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#334155' }}>
                  Select a document to assess completeness
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
