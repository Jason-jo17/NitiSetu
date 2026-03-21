"use client";
import { User, Bell } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="h-16 border-b flex flex-shrink-0 items-center justify-between px-6"
      style={{ background: 'var(--bg-void)', borderColor: 'var(--border-subtle)' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: '#E2E8F0' }}>
          Regulatory Intelligence Overview
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="w-8 h-8 rounded flex items-center justify-center transition-colors"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
          <Bell size={14} style={{ color: '#94A3B8' }} />
        </button>
        <div className="flex items-center gap-2 pl-4 border-l" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center">
            <User size={14} color="#000" />
          </div>
          <div className="text-xs">
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#E2E8F0' }}>Dr. A. Sharma</div>
            <div style={{ color: '#64748B' }}>CDSCO Reviewer</div>
          </div>
        </div>
      </div>
    </header>
  );
}
