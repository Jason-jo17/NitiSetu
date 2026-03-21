"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, FileSearch, CheckSquare, Tags, GitCompare,
  ClipboardList, Upload, Activity, ChevronLeft, ChevronRight,
  Zap, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: Activity, label: "Overview", short: "OVR" },
  { href: "/dashboard/upload", icon: Upload, label: "Upload Documents", short: "UPL" },
  { href: "/dashboard/anonymize", icon: Shield, label: "Anonymisation", short: "ANO" },
  { href: "/dashboard/summarize", icon: FileSearch, label: "Summarisation", short: "SUM" },
  { href: "/dashboard/completeness", icon: CheckSquare, label: "Completeness", short: "CPL" },
  { href: "/dashboard/classify", icon: Tags, label: "SAE Classification", short: "CLS" },
  { href: "/dashboard/compare", icon: GitCompare, label: "Doc Comparison", short: "CMP" },
  { href: "/dashboard/inspect", icon: ClipboardList, label: "Inspection Report", short: "INS" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-void)' }}>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex-shrink-0 flex flex-col overflow-hidden border-r"
        style={{ 
          background: 'var(--bg-base)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent-muted)', border: '1px solid var(--accent-border)' }}>
              <Zap size={14} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: '#F1F5F9' }}>
                    नीतिSetu
                  </div>
                  <div style={{ fontSize: 10, color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                    ACOLYTE AI × CDSCO
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "group flex items-center gap-3 mx-2 my-0.5 px-3 py-2.5 rounded-md transition-all cursor-pointer",
                  active ? "text-white" : "text-slate-500 hover:text-slate-300"
                )}
                  style={{
                    background: active ? 'var(--bg-elevated)' : 'transparent',
                    borderLeft: active ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  }}>
                  <item.icon 
                    size={16} 
                    style={{ color: active ? 'var(--accent-primary)' : 'inherit', flexShrink: 0 }} 
                  />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ 
                          fontFamily: 'var(--font-mono)', 
                          fontSize: 12,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {collapsed && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#475569', position: 'absolute', left: 68 }}>
                      {item.short}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 rounded-md transition-colors text-slate-600 hover:text-slate-400"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
