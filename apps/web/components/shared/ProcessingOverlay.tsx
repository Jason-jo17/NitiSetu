"use client";
import { motion, AnimatePresence } from "framer-motion";

interface ProcessingOverlayProps {
  isVisible: boolean;
  title: string;
  progress: number;
  statusMessage: string;
  color?: "amber" | "info" | "emerald" | "cyan" | "violet" | "rose";
  engine?: string;
}

const colorMap = {
  amber: {
    border: "border-amber-500",
    borderMuted: "border-amber-500/20",
    bg: "bg-amber-500"
  },
  info: {
    border: "border-info",
    borderMuted: "border-info/20",
    bg: "bg-info"
  },
  emerald: {
    border: "border-emerald-500",
    borderMuted: "border-emerald-500/20",
    bg: "bg-emerald-500"
  },
  cyan: {
    border: "border-cyan-500",
    borderMuted: "border-cyan-500/20",
    bg: "bg-cyan-500"
  },
  violet: {
    border: "border-violet-500",
    borderMuted: "border-violet-500/20",
    bg: "bg-violet-500"
  },
  rose: {
    border: "border-rose-500",
    borderMuted: "border-rose-500/20",
    bg: "bg-rose-500"
  }
};

export function ProcessingOverlay({
  isVisible,
  title,
  progress,
  statusMessage,
  color = "info",
  engine = "CLAUDE-3.5-SONNET"
}: ProcessingOverlayProps) {
  const styles = colorMap[color] || colorMap.info;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div 
                className={`w-16 h-16 border-4 ${styles.borderMuted} border-t-current rounded-full animate-spin`} 
                style={{ color: `var(--${color === 'info' ? 'info' : color + '-500'})` }}
              />
              <div className="space-y-1">
                <h3 className="text-white font-bold font-mono text-sm uppercase">{title}</h3>
                <p className="text-slate-400 text-[10px] font-mono tracking-widest uppercase">
                  {statusMessage}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={`h-full ${styles.bg}`}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>{engine}</span>
                <span>{progress}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
