"use client";

import { useState } from "react";
import { X, Workflow as WorkflowIcon } from "lucide-react";
import { isAutosaveEnabled, setAutosaveEnabled } from "@/lib/session";
import type { Workflow } from "@/lib/types";

interface SettingsModalProps {
  open: boolean;
  workflow: Workflow;
  onClose: () => void;
  onNew: () => void;
}

export default function SettingsModal({
  open,
  workflow,
  onClose,
  onNew,
}: SettingsModalProps) {
  const [autosave, setAutosave] = useState(() => isAutosaveEnabled());
  const [confirmReset, setConfirmReset] = useState(false);

  if (!open) return null;

  const toggleAutosave = () => {
    const next = !autosave;
    setAutosave(next);
    setAutosaveEnabled(next);
  };

  const row =
    "flex items-center justify-between gap-4 rounded border border-bline bg-white px-4 py-3";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-lg border border-bline bg-surface shadow-ms-lg animate-fade-in"
      >
        <div className="flex items-center gap-2 border-b border-bline px-4 py-3">
          <WorkflowIcon size={15} className="text-ms-blue" />
          <span className="text-[13px] font-semibold text-txt">
            Workspace Settings
          </span>
          <button
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded text-txt-secondary transition hover:bg-surface-dim hover:text-txt"
          >
            <X size={15} />
          </button>
        </div>

        <div className="space-y-2 overflow-y-auto p-4">
          <div className={row}>
            <div>
              <div className="text-[13px] font-medium text-txt">
                Session Auto-save
              </div>
              <div className="text-[11px] text-txt-secondary">
                Persist workflow to browser session storage.
              </div>
            </div>
            <button
              onClick={toggleAutosave}
              className="relative flex h-5 w-9 shrink-0 items-center rounded-full transition"
              style={{ background: autosave ? "#0078d4" : "#d2d0ce" }}
            >
              <span
                className="absolute h-4 w-4 rounded-full bg-white shadow-sm transition-all"
                style={{ left: autosave ? "calc(100% - 18px)" : "2px" }}
              />
            </button>
          </div>

          <div className={row}>
            <div>
              <div className="text-[13px] font-medium text-txt">
                Run Failures
              </div>
              <div className="text-[11px] text-txt-secondary">
                Simulated engine occasionally injects a failing step.
              </div>
            </div>
            <div className="text-[11px] text-success">Enabled</div>
          </div>

          <div className={row}>
            <div>
              <div className="text-[13px] font-medium text-txt">
                Persistence
              </div>
              <div className="text-[11px] text-txt-secondary">
                sessionStorage only.
              </div>
            </div>
            <div className="text-[11px] text-txt-secondary">
              sessionStorage
            </div>
          </div>

          <div className="border-t border-bline pt-3">
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
              className="flex w-full items-center justify-center gap-2 rounded border border-error/30 bg-error/5 px-4 py-2.5 text-[12.5px] font-semibold text-error transition hover:bg-error/10"
            >
              {confirmReset
                ? "Click again to confirm"
                : "Start a new workflow"}
            </button>
          </div>
        </div>

        <div className="shrink-0 border-t border-bline px-4 py-2.5 text-[10.5px] text-txt-disabled">
          FlowForge v0.1.0 &middot; Workflow {workflow.meta.id}
        </div>
      </div>
    </div>
  );
}
