"use client";
import { Shield, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const STAT_CONFIG = [
  { key: "docs_processed", label: "Docs Processed", icon: FileText, color: "var(--info)", trend: "+12%" },
  { key: "pii_detected", label: "PII Entities Detected", icon: Shield, color: "var(--accent-primary)", trend: "this week" },
  { key: "completeness_avg", label: "Avg Completeness", icon: CheckCircle, color: "var(--success)", suffix: "%" },
  { key: "saes_classified", label: "SAEs Classified", icon: AlertTriangle, color: "var(--danger)", trend: "pending review" },
];

export function StatsGrid() {
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: () => api.get("/api/health/stats"),
    refetchInterval: 30000
  });

  return (
    <div className="grid grid-cols-4 gap-4">
      {STAT_CONFIG.map((stat, i) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-xl p-5 border"
          style={{ 
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${stat.color}20` }}>
              <stat.icon size={16} style={{ color: stat.color }} />
            </div>
            {stat.trend && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#475569' }}>
                {stat.trend}
              </span>
            )}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 600, color: '#F1F5F9' }}>
            {stats?.[stat.key] ?? "—"}{stat.suffix || ""}
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
