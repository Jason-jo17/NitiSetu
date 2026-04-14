"use client";
import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an institutional audit log in the future
    console.error("Dashboard Segment Error:", error);
  }, [error]);

  return (
    <div className="h-full w-full flex items-center justify-center p-8 bg-slate-950">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle className="text-red-500" size={32} />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white font-mono">Segment Recovery Triggered</h2>
          <p className="text-slate-400 text-sm">
            An unexpected error occurred in this dashboard view. Your session is secure, 
            but the current view needs to be re-initialised.
          </p>
        </div>

        {error.digest && (
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
            <code className="text-[10px] text-slate-500 font-mono">Digest: {error.digest}</code>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors font-mono text-sm"
          >
            <RotateCcw size={16} />
            Attempt Recovery
          </button>
          
          <Link href="/dashboard" className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 text-slate-300 font-bold rounded-lg hover:bg-slate-700 transition-colors font-mono text-sm">
            <Home size={16} />
            Return to Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
