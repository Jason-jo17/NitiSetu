"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Lock } from "lucide-react";
import { motion } from "framer-motion";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Successfully authenticated");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background grain/aurora effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ background: 'radial-gradient(circle at 50% 50%, #f59e0b22 0%, transparent 70%)' }} />
      <div className="absolute inset-0 opacity-10 pointer-events-none grayscale" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/asfalt-dark.png")' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck className="text-amber-500 w-8 h-8" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-tight">NitiSetu Intelligence</h1>
            <p className="text-slate-500 text-sm mt-1">Regulatory Intelligence Gateway</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Official Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-mono text-sm"
                placeholder="officer@cdsco.gov.in"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all font-mono text-sm"
                  placeholder="••••••••"
                />
                <Lock className="absolute right-4 top-3.5 text-slate-600 w-4 h-4" />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-slate-950 font-bold rounded-xl py-4 transition-all flex items-center justify-center gap-2 mt-2 shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Initialize Gateway</span>
                  <div className="w-1.5 h-1.5 bg-slate-950 rounded-full animate-pulse" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-slate-600 uppercase tracking-tighter">
              Authorized Personnel Only. System Access is Audited.
            </p>
          </div>
        </div>

        <p className="text-center text-slate-700 text-[10px] mt-8 uppercase tracking-[0.2em]">
          Powered by Acolyte AI Intelligence Layer
        </p>
      </motion.div>
    </div>
  );
}
