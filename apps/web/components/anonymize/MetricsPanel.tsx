export function MetricsPanel({ result }: { result: any }) {
  if (!result || !result.metrics) return null;
  const { metrics } = result;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>Entities Redacted</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>
          {metrics.total_entities_found}
        </div>
      </div>
      <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>Data Yield</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--info)' }}>
          {(metrics.data_yield * 100).toFixed(1)}%
        </div>
      </div>
      <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>Processing Time</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: 'var(--accent-primary)' }}>
          {metrics.processing_time_ms}ms
        </div>
      </div>
    </div>
  );
}
