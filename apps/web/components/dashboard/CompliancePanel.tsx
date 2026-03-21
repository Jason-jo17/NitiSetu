"use client";
import { ShieldAlert, Info } from "lucide-react";

export function CompliancePanel() {
  return (
    <div className="rounded-xl border h-full" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
      <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
        <ShieldAlert size={16} style={{ color: 'var(--accent-primary)' }} />
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>
          Compliance Alerts
        </h3>
      </div>
      <div className="p-4 space-y-3">
        {/* Placeholder alerts that would typically come from an API */}
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Info size={14} className="text-red-400 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-red-400">Critical SAE Pending</div>
              <div className="text-[11px] text-slate-400 mt-1">1 "Death" classification SAE requires immediate review (within 24h SLA).</div>
            </div>
          </div>
        </div>
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Info size={14} className="text-amber-400 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-amber-400">CT-04 Incomplete</div>
              <div className="text-[11px] text-slate-400 mt-1">Application AP-2023-99 lacks mandatory GLP accreditation certificate.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
