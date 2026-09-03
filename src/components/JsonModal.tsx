"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check } from "lucide-react";
import type { Workflow } from "@/lib/types";

interface JsonModalProps {
  open: boolean;
  workflow: Workflow;
  onClose: () => void;
}

export default function JsonModal({ open, workflow, onClose }: JsonModalProps) {
  const [copied, setCopied] = useState(false);
  if (!open) return null;
  const json = JSON.stringify(workflow, null, 2);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          onClick={(e) => e.stopPropagation()}
          className="flex h-[70vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-panel-line bg-[#0e1117] shadow-2xl"
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-panel-line px-4 py-3">
            <span className="text-[13px] font-semibold text-slate-100">
              Workflow JSON
            </span>
            <span className="text-[11px] text-slate-500">
              {workflow.nodes.length} nodes · {workflow.edges.length} edges
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={copy}
                className="flex items-center gap-1.5 rounded-md border border-panel-line bg-panel px-2.5 py-1.5 text-[12px] font-medium text-slate-300 transition hover:border-accent/40 hover:text-white"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-panel hover:text-white"
              >
                <X size={15} />
              </button>
            </div>
          </div>
          <pre className="flex-1 overflow-auto bg-canvas-deep p-4 font-mono text-[12px] leading-relaxed text-slate-300">
            {json}
          </pre>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
