export function PriorityScore({ score }: { score: number }) {
  const isHigh = score >= 8;
  const isMed = score >= 5 && score < 8;
  
  const color = isHigh ? 'var(--danger)' : isMed ? 'var(--warning)' : 'var(--success)';

  return (
    <div className="text-center w-16">
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-14 h-14 transform -rotate-90">
          <circle
            cx="28" cy="28" r="24"
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="4"
          />
          <circle
            cx="28" cy="28" r="24"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={`${(score / 10) * 150} 150`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center flex-col">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: '#F1F5F9', lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontSize: 8, color: '#64748B' }}>/10</span>
        </div>
      </div>
      <div style={{ fontSize: 9, color: '#94A3B8', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Priority
      </div>
    </div>
  );
}
