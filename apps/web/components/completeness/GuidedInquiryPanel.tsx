import { HelpCircle, Lightbulb } from "lucide-react";

export function GuidedInquiryPanel({ questions, recommendations }: { questions: string[], recommendations: string[] }) {
  if (!questions?.length && !recommendations?.length) return null;

  return (
    <div className="rounded-xl border border-glow" style={{ background: 'var(--bg-base)', borderColor: 'var(--border-strong)' }}>
      <div className="p-4 border-b bg-black/40" style={{ borderColor: 'var(--border-subtle)' }}>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <HelpCircle size={14} />
          AI GUIDED INQUIRY ENGINE
        </h3>
      </div>
      <div className="p-5 space-y-6">
        
        {questions?.length > 0 && (
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 12, textTransform: 'uppercase' }}>
              Socratic Questions for Sponsor
            </h4>
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={i} className="flex gap-3 text-sm p-3 rounded-lg border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-surface)' }}>
                  <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-amber-500/10 text-amber-500 font-mono text-[10px]">
                    Q{i+1}
                  </div>
                  <div style={{ color: '#CBD5E1', lineHeight: 1.5 }}>{q}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recommendations?.length > 0 && (
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 12, textTransform: 'uppercase' }}>
              Reviewer Recommendations
            </h4>
            <div className="space-y-2">
              {recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <Lightbulb size={12} style={{ color: 'var(--info)', marginTop: 2, flexShrink: 0 }} />
                  <span style={{ color: '#94A3B8' }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
