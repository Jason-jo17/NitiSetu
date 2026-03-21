import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg-void)' }}>
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
          style={{ background: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }}>
          <AlertTriangle size={24} style={{ color: 'var(--accent-primary)' }} />
        </div>
        
        <div className="space-y-2">
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: '#E2E8F0' }}>
            Resource Not Found
          </h1>
          <p style={{ fontSize: 13, color: '#94A3B8' }}>
            The requested page or document could not be located in the NitiSetu registry.
          </p>
        </div>

        <Link href="/dashboard" 
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg transition-colors font-medium text-sm"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', color: '#CBD5E1' }}>
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
