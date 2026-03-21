"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ClipboardList, FileCheck } from "lucide-react";
import { api } from "@/lib/api";
import { DocumentSelector } from "@/components/shared/DocumentSelector";
import { InspectionReportViewer } from "@/components/inspect/InspectionReportViewer";
import { toast } from "sonner";

export default function InspectPage() {
  const [docId, setDocId] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const inspectMutation = useMutation({
    mutationFn: () => api.post("/api/inspection/process", { document_id: docId }),
    onSuccess: (data) => {
      if (data.job_id) {
        pollJob(data.job_id);
      } else {
        setResult(data);
      }
    },
    onError: () => toast.error("Inspection processing failed")
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
          GCP Inspection Report Generator
        </h1>
        <p style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
          Convert handwritten notes and unstructured inspector observations into formal CDSCO compliance reports.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6 flex-1 min-h-0">
        <div className="space-y-4 pr-2">
          <div className="rounded-xl p-5 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
              INSPECTION NOTES/SCAN
            </h3>
            <DocumentSelector value={docId} onChange={setDocId} />
          </div>

          <button
            onClick={() => inspectMutation.mutate()}
            disabled={!docId || inspectMutation.isPending}
            className="w-full py-3 rounded-lg font-medium transition-all"
            style={{
              background: 'var(--success)',
              color: '#000',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              opacity: (!docId || inspectMutation.isPending) ? 0.5 : 1
            }}
          >
            {inspectMutation.isPending ? "Processing..." : "Generate Report"}
          </button>

          {result && (
            <div className="mt-4 p-4 rounded-xl border border-dashed" style={{ borderColor: 'var(--border-strong)', background: 'var(--success-muted)' }}>
                <div className="flex items-center gap-2 mb-2">
                    <FileCheck size={16} style={{ color: 'var(--success)' }}/>
                    <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>Report Generated</span>
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>
                    Rating: <strong className="uppercase" style={{ color: '#E2E8F0' }}>{result.compliance_rating}</strong>
                </div>
            </div>
          )}
        </div>

        <div className="col-span-3 min-h-0">
          {result ? (
            <InspectionReportViewer htmlContent={result.formatted_report_html} />
          ) : (
            <div className="h-full flex items-center justify-center rounded-xl border"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
              <div className="text-center">
                <ClipboardList size={48} style={{ color: '#1E293B', margin: '0 auto 16px' }} />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#334155' }}>
                  Select inspector notes to generate a structured report
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
