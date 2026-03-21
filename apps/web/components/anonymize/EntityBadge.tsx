export function EntityBadge({ type, count }: { type: string, count: number }) {
  const isHighRisk = ['AADHAAR', 'PAN', 'PASSPORT', 'CREDIT_CARD', 'PERSON'].includes(type);
  
  return (
    <div 
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md mb-1"
      style={{ 
        background: isHighRisk ? 'var(--danger-muted)' : 'var(--info-muted)',
        border: `1px solid ${isHighRisk ? 'var(--danger)' : 'var(--info)'}30`
      }}
    >
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: isHighRisk ? 'var(--danger)' : 'var(--info)' }}>
        {type}
      </span>
      <span style={{ fontSize: 10, color: '#94A3B8', background: 'rgba(0,0,0,0.2)', padding: '0 4px', borderRadius: 4 }}>
        {count}
      </span>
    </div>
  );
}
