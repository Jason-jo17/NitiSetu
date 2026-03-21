import { ShieldCheck, AlertTriangle } from "lucide-react";

export function ComplianceFlags({ flags }: { flags: string[] }) {
  if (!flags || flags.length === 0) return null;

  return (
    <div className="rounded-xl border p-4" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
      <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
        COMPLIANCE FLAGS
      </h3>
      <div className="space-y-2">
        {flags.map((flag, idx) => {
          const isWarning = flag.toLowerCase().includes("warning") || flag.toLowerCase().includes("failed");
          return (
            <div key={idx} className="flex items-start gap-2 p-2 rounded bg-black/20" style={{ border: '1px solid var(--border-subtle)' }}>
              {isWarning ? (
                <AlertTriangle size={14} style={{ color: 'var(--warning)', marginTop: 1, flexShrink: 0 }} />
              ) : (
                <ShieldCheck size={14} style={{ color: 'var(--success)', marginTop: 1, flexShrink: 0 }} />
              )}
              <span style={{ fontSize: 12, color: '#CBD5E1' }}>{flag}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
