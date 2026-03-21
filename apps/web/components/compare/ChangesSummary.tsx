export function ChangesSummary({ result }: { result: any }) {
  if (!result) return null;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        <div style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>Total Changes</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600, color: '#F1F5F9' }}>{result.total_changes}</div>
      </div>
      <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        <div style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>Substantive</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600, color: 'var(--danger)' }}>{result.substantive_changes?.length || 0}</div>
      </div>
      <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        <div style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>Administrative</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600, color: 'var(--warning)' }}>{result.administrative_changes || 0}</div>
      </div>
      <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        <div style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', marginBottom: 4 }}>Formatting</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 600, color: 'var(--info)' }}>{result.formatting_changes || 0}</div>
      </div>
      
      {result.change_summary && (
          <div className="col-span-4 rounded-xl p-4 border bg-amber-500/5" style={{ borderColor: 'var(--accent-border)' }}>
              <h4 style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-primary)', marginBottom: 8, textTransform: 'uppercase' }}>
                AI Summary of Substantive Changes
              </h4>
              <p style={{ fontSize: 12, color: '#CBD5E1', lineHeight: 1.5 }}>
                  {result.change_summary}
              </p>
          </div>
      )}
    </div>
  );
}
