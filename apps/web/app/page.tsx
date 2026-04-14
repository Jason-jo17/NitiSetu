"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { 
  Shield, Zap, FileSpreadsheet, Lock, 
  ArrowRight, Activity, Building2, Globe,
  GitCompare, CheckCircle, Search, Server
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, [router]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-amber-500/30 overflow-x-hidden">
      {/* Aurora Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[40%] -left-[10%] w-[70%] h-[70%] bg-amber-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-slate-400/5 blur-[100px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 h-20 border-b border-white/5 backdrop-blur-md bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
            <Zap className="text-amber-500 w-5 h-5" />
          </div>
          <div>
            <div className="font-serif font-bold text-lg tracking-tight text-white leading-none">नीतिSetu</div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500 mt-1 font-mono">Institutional Intelligence</div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest font-bold text-slate-400">
          <a href="#features" className="hover:text-amber-500 transition-colors">Framework</a>
          <a href="#security" className="hover:text-amber-500 transition-colors">Security</a>
          <a href="#compliance" className="hover:text-amber-500 transition-colors">Compliance</a>
        </div>
        <button 
          onClick={() => router.push("/auth/login")}
          className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold transition-all"
        >
          Officer Login
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-8 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase tracking-widest font-black mb-6"
        >
          <Activity size={12} className="animate-pulse" />
          Live Platform: CDSCO Digital Transformation
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-serif font-bold text-white max-w-4xl leading-[1.1] mb-8"
        >
          The Intelligence Layer for <span className="bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent italic">Regulatory Oversight.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-lg max-w-2xl leading-relaxed mb-12"
        >
          Automating clinical trial monitoring, SAE classification, and PII anonymization 
          for the Central Drugs Standard Control Organisation.
        </motion.p>

        <motion.div 
          initial={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto px-8 relative mt-24"
        >
          <button 
            onClick={() => router.push("/auth/login")}
            className="group px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl transition-all flex items-center gap-3 shadow-[0_0_30px_-5px_rgba(245,158,11,0.5)]"
          >
            <span>Enter Gateway</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 bg-slate-900 border border-white/5 hover:border-white/10 text-white font-bold rounded-2xl transition-all">
            Technical Specs
          </button>
        </motion.div>

        {/* Dashboard Preview Mockup */}
        <motion.div 
          initial={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto px-8 relative mt-24"
        >
          <div className="relative rounded-[2rem] border border-white/10 bg-slate-900/80 backdrop-blur-3xl overflow-hidden aspect-[16/10] shadow-2xl">
            {/* Fake Header */}
            <div className="h-12 border-b border-white/5 bg-white/[0.02] flex items-center px-6 justify-between">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              </div>
              <div className="px-3 py-1 rounded bg-white/5 text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
                dashboard.nitisetu.gov.in/overview
              </div>
              <div className="w-12" />
            </div>

            {/* Fake Layout - TOTAL HIGH FIDELITY */}
            <div className="flex h-full">
              {/* Fake Sidebar */}
              <div className="w-48 border-r border-white/5 p-4 space-y-3 opacity-80">
                {[Activity, Shield, Lock, FileSpreadsheet, Server].map((Icon, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.03]">
                    <Icon size={12} className={i === 0 ? "text-amber-500" : "text-slate-500"} />
                    <div className={cn("h-1.5 rounded-full bg-white/10 w-16", i === 0 && "bg-amber-500/40")} />
                  </div>
                ))}
              </div>

              {/* Mockup Body Content - Vibrant & Filled */}
              <div className="flex-1 p-8 space-y-8 overflow-hidden bg-slate-900/40">
                <div className="grid grid-cols-4 gap-6">
                    {[
                      { l: "Docs Processed", v: "1,428", c: "#3B82F6", t: "↑ 12%" },
                      { l: "PII Detected", v: "42,150", c: "#F59E0B", t: "↑ 8%" },
                      { l: "Avg Completeness", v: "94.2%", c: "#10B981", t: "↑ 0.4%" },
                      { l: "Critical SAEs", v: "156", c: "#EF4444", t: "↓ 2%" }
                    ].map((s, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 shadow-lg">
                          <div className="flex justify-between items-start mb-2">
                              <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">{s.l}</div>
                              <div className="text-[8px] font-mono text-emerald-500 font-bold">{s.t}</div>
                          </div>
                          <div className="text-2xl font-black text-white font-mono tracking-tighter">{s.v}</div>
                      </div>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-6 h-full pb-20">
                     <div className="col-span-2 bg-slate-950/80 rounded-3xl border border-white/10 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <div className="text-[10px] font-black text-white uppercase tracking-[0.1em]">Live Protocol Ingestion Chain</div>
                        </div>
                        <div className="space-y-3">
                            {[
                                { t: "Protocol_v2_Ph3.pdf", s: "Ingestion Verified", d: "Document verified via MD5 Checksum" },
                                { t: "PII_Masking_Protocol", s: "Extraction Active", d: "Processing: 142 Entities Detected" },
                                { t: "MedDRA_Mapping", s: "Awaiting Data", d: "Standardizing medical terminology" }
                            ].map((step, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex gap-4">
                                     <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                        <Search size={14} className="text-amber-500" />
                                     </div>
                                     <div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-bold text-white tracking-tight">{step.t}</span>
                                            <span className="text-[8px] font-black uppercase text-amber-500/80">{step.s}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">{step.d}</div>
                                     </div>
                                </div>
                            ))}
                        </div>
                     </div>
                     <div className="bg-slate-950/80 rounded-3xl border border-white/10 p-6">
                         <div className="text-[10px] font-black text-white uppercase mb-6 tracking-widest">Model Confidence</div>
                         <div className="space-y-6">
                            {[72, 94, 88].map((v, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500/50 rounded-full" style={{ width: `${v}%` }} />
                                    </div>
                                    <div className="h-1 rounded-full bg-white/5 w-1/2" />
                                </div>
                            ))}
                         </div>
                     </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Institutional Extraction Matrix - NEW SECTION */}
      <section className="py-32 px-8 bg-slate-900/40 border-y border-white/5 relative">
        <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-20 items-center">
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase tracking-widest font-black">
                        Data Ingestion Layer
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">High-Fidelity <span className="text-amber-500 italic">Field Extraction.</span></h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        NitiSetu's ingestion engine decodes unstructured clinical narratives into structured institutional intelligence 
                        across 120+ specialized regulatory data points.
                    </p>
                    <div className="grid gap-4">
                        {[
                            { f: "Investigator Mapping", d: "Automated identification of Lead PIs and medical officers." },
                            { f: "Clinical Signal Logic", d: "Extraction of severity, causality, and onset intervals." },
                            { f: "Regulatory Checklist", d: "Real-time verification of mandatory document components." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-5 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/20 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                                    <Search className="text-amber-500" size={20} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white mb-1 uppercase tracking-wider">{item.f}</div>
                                    <div className="text-slate-500 text-xs leading-relaxed">{item.d}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Visual Extraction Matrix Rendering */}
                <div className="relative group">
                    <div className="absolute -inset-2 bg-amber-500/10 rounded-[3rem] blur-3xl opacity-50" />
                    <div className="relative bg-slate-950 rounded-[2.5rem] border border-white/10 p-10 shadow-3xl">
                        <div className="flex justify-between items-center mb-10">
                             <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                             </div>
                             <div className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-[9px] text-slate-500 uppercase tracking-widest">
                                Processing: SAE_CT_04.pdf
                             </div>
                        </div>

                        <div className="space-y-5 font-mono">
                            {[
                                { k: "PI Name", v: "DR. ARJUN REDDY", c: "text-amber-500", b: true },
                                { k: "Phase Type", v: "PHASE III (MC)", c: "text-blue-400" },
                                { k: "Adverse Event", v: "PULMONARY EDEMA", c: "text-red-500" },
                                { k: "Regulatory Code", v: "MED-2024-X4", c: "text-slate-400" }
                            ].map((field, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center group/field overflow-hidden relative">
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{field.k}</span>
                                    <span className={cn("text-xs font-bold transition-all duration-500", field.c, field.b && "blur-[3px] group-hover/field:blur-0")}>
                                        {field.v}
                                    </span>
                                    <motion.div 
                                        initial={{ x: "-100%" }}
                                        animate={{ x: "100%" }}
                                        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent pointer-events-none"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 pt-10 border-t border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Model Confidence</span>
                                <span className="text-[10px] text-emerald-500 font-black">98.4%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: "98.4%" }}
                                    transition={{ duration: 1.5, delay: 0.5 }}
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500/50 to-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>
      <section id="features" className="py-32 px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center mb-20 text-center">
             <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase tracking-widest font-black mb-4">
                Core Capabilities
             </div>
             <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Built for Institutional <span className="text-amber-500 italic">Rigor.</span></h2>
             <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">
                NitiSetu is engineered to handle the complexity of CDSCO regulatory workflows, 
                from raw document ingestion to formal institutional reporting.
             </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              { 
                icon: Shield, 
                title: "PII Anonymisation", 
                features: ["DPDP Act 2023 Compliant", "Persistent Pseudonymization", "Global Entity Masking"],
                desc: "Secure de-identification of patient identities across clinical protocols and SAE reports."
              },
              { 
                icon: FileSpreadsheet, 
                title: "SAE Intelligence", 
                features: ["Automated Priority Scoring", "Duplicate Signal Detection", "Causality Extraction"],
                desc: "Rapid classification of Serious Adverse Events for immediate regulatory intervention."
              },
              { 
                icon: GitCompare, 
                title: "Document Comparison", 
                features: ["Diff-Level Inspection", "Version Control History", "Amendment Tracking"],
                desc: "High-precision analysis of protocol amendments and regulatory filing changes."
              },
              { 
                icon: CheckCircle, 
                title: "Completeness Review", 
                features: ["Checklist Automation", "Missing Field Detection", "Zone-Specific Scrutiny"],
                desc: "Standardized verification of application completeness against CDSCO guidelines."
              },
              { 
                icon: Building2, 
                title: "Inspection Engine", 
                features: ["Site Audit Automation", "Evidence Mapping", "Report Provisioning"],
                desc: "Formal generation of site inspection reports with evidence-backed intelligence."
              },
              { 
                icon: Zap, 
                title: "Summarisation", 
                features: ["Executive Summary Gen", "Key Takeaway Extraction", "Multilingual Support"],
                desc: "AI-driven distillation of massive clinical datasets into actionable executive briefings."
              }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-slate-900/40 border border-white/5 hover:border-amber-500/30 transition-all group"
              >
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <f.icon className="text-amber-500" size={24} />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white mb-4">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">{f.desc}</p>
                <ul className="space-y-3">
                    {f.features.map((feat, fi) => (
                        <li key={fi} className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                            <div className="w-1 h-1 rounded-full bg-amber-500" />
                            {feat}
                        </li>
                    ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline Visualization */}
      <section className="py-24 px-8 border-y border-white/5 bg-slate-900/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">The Intelligence <span className="text-amber-500 italic">Pipeline.</span></h2>
                <div className="space-y-8">
                    {[
                        { s: "01", t: "Ingestion", d: "Raw document ingestion across multiple formats (PDF, DICOM, DOCX)." },
                        { s: "02", t: "Neural Analysis", d: "LLM-powered entity extraction and regulatory cross-referencing." },
                        { s: "03", t: "Oversight", d: "Human-in-the-loop verification and official institutional sign-off." }
                    ].map((step, i) => (
                        <div key={i} className="flex gap-6">
                            <div className="text-3xl font-black text-amber-500/20 font-mono">{step.s}</div>
                            <div>
                                <div className="text-lg font-bold text-white mb-1">{step.t}</div>
                                <div className="text-slate-500 text-sm leading-relaxed">{step.d}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-1 w-full aspect-square rounded-[3rem] bg-gradient-to-br from-amber-500/20 to-blue-500/10 border border-white/5 flex items-center justify-center p-12">
                <div className="w-full h-full rounded-[2rem] bg-slate-900 shadow-2xl flex items-center justify-center relative overflow-hidden">
                    <Activity className="text-amber-500/20 w-32 h-32 absolute animate-pulse" />
                    <div className="relative z-10 text-center space-y-4">
                        <div className="px-4 py-2 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-widest">Processing Layer</div>
                        <div className="font-mono text-2xl text-white font-bold">NITI-MODEL-V2</div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-20 bg-black/40">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
            <div className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold mb-12 items-center flex gap-4">
                <div className="h-px w-8 bg-slate-800" /> 
                Institutional Compliance Standards
                <div className="h-px w-8 bg-slate-800" />
            </div>
            <div className="flex flex-wrap justify-center gap-12 grayscale opacity-40">
                <div className="flex items-center gap-2 font-black text-xl italic font-serif">CDSCO</div>
                <div className="flex items-center gap-2 font-black text-xl italic font-serif">Ministry of Health</div>
                <div className="flex items-center gap-2 font-black text-xl italic font-serif">ICMR</div>
                <div className="flex items-center gap-2 font-black text-xl italic font-serif">NDHM</div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 text-center bg-slate-950 border-t border-white/5">
        <p className="text-slate-600 text-[10px] uppercase tracking-widest leading-loose">
          Authorized Personnel Only. System access is monitored by the Acolyte AI Intelligence Layer.<br/>
          Copyright © 2026 NitiSetu Gateway. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
