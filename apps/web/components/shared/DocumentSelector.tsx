"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FileText, Loader2 } from "lucide-react";

export function DocumentSelector({ value, onChange }: { value: string | null, onChange: (val: string) => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: () => api.get("/api/documents"),
  });

  const docs = data?.documents || [];

  if (isLoading) return <div className="text-slate-500 text-xs flex items-center gap-2"><Loader2 size={12} className="animate-spin" /> Loading docs...</div>;
  if (!docs.length) return <div className="text-slate-500 text-xs">No documents available. Upload one first.</div>;

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
      {docs.map((doc: any) => (
        <label
          key={doc.id}
          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            value === doc.id 
              ? 'bg-amber-500/10 border-amber-500/30' 
              : 'bg-black/20 border-white/5 hover:border-white/10'
          }`}
        >
          <input 
            type="radio" 
            name="document_selection" 
            value={doc.id} 
            checked={value === doc.id}
            onChange={() => onChange(doc.id)}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-200 truncate">{doc.filename}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">{doc.doc_type}</div>
          </div>
        </label>
      ))}
    </div>
  );
}
