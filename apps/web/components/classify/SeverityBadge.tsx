export function SeverityBadge({ severity }: { severity: string }) {
  const normalized = severity.toLowerCase().replace(/_/g, '-');
  
  let colorVar = "var(--severity-other)";
  if (normalized === "death") colorVar = "var(--severity-death)";
  else if (normalized === "life-threatening") colorVar = "var(--severity-life-threatening)";
  else if (normalized === "hospitalization") colorVar = "var(--severity-hospitalization)";
  else if (normalized === "disability") colorVar = "var(--severity-disability)";
  else if (normalized === "congenital-anomaly") colorVar = "var(--severity-congenital)";

  return (
    <div 
      className="inline-flex items-center px-3 py-1.5 rounded-full"
      style={{
        background: `color-mix(in srgb, ${colorVar} 15%, transparent)`,
        border: `1px solid ${colorVar}`,
        color: colorVar,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'uppercase'
      }}
    >
      <div className="w-2 h-2 rounded-full mr-2" style={{ background: colorVar }} />
      {severity.replace(/_/g, ' ')}
    </div>
  );
}
