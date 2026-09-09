"use client";

import { useState } from "react";
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[70vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-bline bg-surface shadow-ms-lg animate-fade-in"
      >
        <div className="flex shrink-0 items-center gap-2 border-b border-bline px-4 py-3">
          <span className="text-[13px] font-semibold text-txt">
            Workflow JSON
          </span>
          <span className="text-[11px] text-txt-secondary">
            {workflow.nodes.length} nodes &middot; {workflow.edges.length} edges
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={copy}
              className="flex items-center gap-1.5 rounded border border-bline bg-white px-2.5 py-1.5 text-[12px] font-medium text-txt-secondary transition hover:border-txt-disabled hover:text-txt"
            >
              {copied ? (
                <Check size={13} className="text-success" />
              ) : (
                <Copy size={13} />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded text-txt-secondary transition hover:bg-surface-dim hover:text-txt"
            >
              <X size={15} />
            </button>
          </div>
        </div>
        <pre className="flex-1 overflow-auto bg-surface-dim p-4 font-mono text-[12px] leading-relaxed text-txt">
          {json}
        </pre>
      </div>
    </div>
  );
}
