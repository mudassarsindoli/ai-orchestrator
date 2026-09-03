"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Workflow as WorkflowIcon } from "lucide-react";
import { isAutosaveEnabled, setAutosaveEnabled } from "@/lib/session";
import type { Workflow } from "@/lib/types";

interface SettingsModalProps {
  open: boolean;
  workflow: Workflow;
  onClose: () => void;
  onNew: () => void;
}

export default function SettingsModal({ open, workflow, onClose, onNew }: SettingsModalProps) {
  const [autosave, setAutosave] = useState(() => isAutosaveEnabled());
  const [confirmReset, setConfirmReset] = useState(false);

  if (!open) return null;

  const toggleAutosave = () => {
    const next = !autosave;
    setAutosave(next);
    setAutosaveEnabled(next);
  };

  const row = "flex items-center justify-between gap-4 rounded-xl border border-panel-line bg-panel px-4 py-3";

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
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-panel-line bg-[#0e1117] shadow-2xl"
        >
          <div className="flex items-center gap-2 border-b border-panel-line px-4 py-3">
            <WorkflowIcon size={15} className="text-accent" />
            <span className="text-[13px] font-semibold text-slate-100">Workspace Settings</span>
            <button
              onClick={onClose}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-panel hover:text-white"
            >
              <X size={15} />
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto p-4">
            <div className={row}>
              <div>
                <div className="text-[13px] font-medium text-slate-100">Session Auto-save</div>
                <div className="text-[11px] text-slate-500">
                  Persist workflow to browser session storage.
                </div>
              </div>
              <button
                onClick={toggleAutosave}
                className="relative flex h-5 w-9 shrink-0 items-center rounded-full transition"
                style={{ background: autosave ? "#6d7bff" : "#2b3240" }}
              >
                <span
                  className="absolute h-4 w-4 rounded-full bg-white shadow transition-all"
                  style={{ left: autosave ? "calc(100% - 18px)" : "2px" }}
                />
              </button>
            </div>

            <div className={row}>
              <div>
                <div className="text-[13px] font-medium text-slate-100">Run Failures</div>
                <div className="text-[11px] text-slate-500">
                  Simulated engine occasionally injects a failing step to demonstrate error handling.
                </div>
              </div>
              <div className="text-[11px] text-emerald-400">Enabled</div>
            </div>

            <div className={row}>
              <div>
                <div className="text-[13px] font-medium text-slate-100">Persistence</div>
                <div className="text-[11px] text-slate-500">
                  sessionStorage only — cleared when the tab closes.
                </div>
              </div>
              <div className="text-[11px] text-slate-400">sessionStorage</div>
            </div>

            <div className="border-t border-panel-line pt-3">
              <button
                onClick={() => {
                  if (confirmReset) {
                    onNew();
                    onClose();
                    setConfirmReset(false);
                  } else {
                    setConfirmReset(true);
                    setTimeout(() => setConfirmReset(false), 3000);
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-[12.5px] font-semibold text-rose-300 transition hover:bg-rose-500/20"
              >
                {confirmReset ? "Click again to confirm new workflow" : "Start a new (empty) workflow"}
              </button>
            </div>
          </div>

          <div className="shrink-0 border-t border-panel-line px-4 py-2.5 text-[10.5px] text-slate-600">
            Orchestrate v0.1.0 · AI Workflow Orchestration Builder ·
            workflow {workflow.meta.id}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
