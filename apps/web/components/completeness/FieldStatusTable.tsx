import { CheckCircle, XCircle, AlertCircle, HelpCircle } from "lucide-react";

const STATUS_ICONS = {
  present: { icon: CheckCircle, color: 'var(--success)' },
  missing: { icon: XCircle, color: 'var(--danger)' },
  incomplete: { icon: AlertCircle, color: 'var(--warning)' },
  inconsistent: { icon: HelpCircle, color: 'var(--info)' },
};

export function FieldStatusTable({ fieldResults }: { fieldResults: any[] }) {
  if (!fieldResults) return null;

  // Group by section
  const grouped = fieldResults.reduce((acc: any, field: any) => {
    if (!acc[field.section]) acc[field.section] = [];
    acc[field.section].push(field);
    return acc;
  }, {});

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
      <div className="p-4 border-b bg-black/20" style={{ borderColor: 'var(--border-subtle)' }}>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94A3B8' }}>FIELD STATUS GRID</h3>
      </div>
      <div className="max-h-[500px] overflow-y-auto p-0">
        <table className="w-full text-left text-sm">
          <tbody>
            {Object.entries(grouped).map(([section, fields]: [string, any]) => (
              <React.Fragment key={section}>
                <tr style={{ background: 'var(--bg-elevated)' }}>
                  <td colSpan={3} className="px-4 py-2 font-mono text-[10px] text-slate-400 uppercase tracking-wider border-y" style={{ borderColor: 'var(--border-subtle)' }}>
                    {section.replace(/_/g, ' ')}
                  </td>
                </tr>
                {fields.map((field: any, idx: number) => {
                  const StatusIcon = STATUS_ICONS[field.status as keyof typeof STATUS_ICONS]?.icon || HelpCircle;
                  const color = STATUS_ICONS[field.status as keyof typeof STATUS_ICONS]?.color || 'white';
                  
                  return (
                    <tr key={idx} className="border-b last:border-0" style={{ borderColor: 'var(--border-subtle)' }}>
                      <td className="px-4 py-3 w-8">
                        <StatusIcon size={16} style={{ color }} />
                      </td>
                      <td className="px-4 py-3">
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#E2E8F0' }}>
                          {field.field.replace(/_/g, ' ')}
                        </div>
                        <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>{field.regulation}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span style={{ fontSize: 11, color: '#94A3B8' }}>
                          Conf: {(field.confidence * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import React from 'react';
