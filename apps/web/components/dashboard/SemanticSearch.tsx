"use client";
import { useState, useCallback } from "react";
import { Search, FileText, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import debounce from "lodash/debounce";

export function SemanticSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const performSearch = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.get(`/api/documents/search?query=${encodeURIComponent(q)}`);
      setResults(data.results || []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((q: string) => performSearch(q), 500),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    debouncedSearch(val);
  };

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18} />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Semantic Search Documents (e.g. 'cardiac adverse events'...)"
          className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all font-mono text-sm text-slate-200 placeholder:text-slate-600 shadow-inner"
        />
        {isLoading ? (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500 animate-spin" size={16} />
        ) : query && (
          <button onClick={() => { setQuery(""); setResults([]); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
            <X size={16} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-[60] overflow-hidden"
          >
            <div className="p-2 max-h-[400px] overflow-y-auto">
              {!isLoading && results.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs font-mono italic">
                  No conceptual matches found.
                </div>
              )}
              {results.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center gap-4 p-3 hover:bg-slate-800/50 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-colors">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-200 truncate">{res.original_filename}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter bg-slate-800 px-1.5 py-0.5 rounded">
                        {res.doc_type}
                      </span>
                      <span className="text-[10px] font-mono text-amber-500/70">
                        {Math.round(res.similarity * 100)}% Match
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 bg-slate-950/50 border-t border-slate-800 text-[9px] font-mono text-slate-600 flex justify-between uppercase tracking-widest">
              <span>Acolyte Semantic Search Engine</span>
              <span>pgvector v0.5.1</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
