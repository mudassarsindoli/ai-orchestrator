"use client";

import { useState } from "react";
import {
  Play,
  RotateCcw,
  Save,
  ChevronRight,
  Square,
} from "lucide-react";
import type { Workflow } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TopBarProps {
  workflow: Workflow;
  isRunning: boolean;
  onRun: () => void;
  onReset: () => void;
  onRename: (name: string) => void;
  onToggleStatus: () => void;
  onOpenTemplates: () => void;
  saveStatus?: "saved" | "unsaved" | "saving";
}

export default function TopBar({
  workflow,
  isRunning,
  onRun,
  onReset,
  onRename,
  onToggleStatus,
  onOpenTemplates,
  saveStatus = "saved",
}: TopBarProps) {
  const [editingName, setEditingName] = useState(false);

  return (
    <header className="relative z-40 flex h-12 shrink-0 items-center border-b border-bline bg-surface px-3">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-txt-secondary">
        <span className="font-medium text-txt">Workflows</span>
        <ChevronRight size={12} className="text-txt-disabled" />
      </div>

      {/* Editable name */}
      <div className="ml-1 flex min-w-0 items-center">
        {editingName ? (
          <input
            autoFocus
            defaultValue={workflow.meta.name}
            onBlur={(e) => {
              onRename(e.target.value.trim() || "Untitled Workflow");
              setEditingName(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") setEditingName(false);
            }}
            className="w-52 rounded border border-ms-blue bg-white px-2 py-1 text-[13px] font-semibold text-txt outline-none focus-ring"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            title="Rename workflow"
            className="group max-w-[220px] truncate rounded px-2 py-1 text-[13px] font-semibold text-txt transition hover:bg-surface-dim"
          >
            {workflow.meta.name}
          </button>
        )}
      </div>

      {/* Save status */}
      <div className="ml-3 flex items-center gap-1.5 text-[11px] text-txt-secondary">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            saveStatus === "saved" && "bg-success",
            saveStatus === "unsaved" && "bg-warning",
            saveStatus === "saving" && "bg-ms-blue"
          )}
        />
        {saveStatus === "saved" && "Saved"}
        {saveStatus === "unsaved" && "Unsaved"}
        {saveStatus === "saving" && "Saving..."}
      </div>

      <div className="flex-1" />

      {/* Status toggle */}
      <button
        onClick={onToggleStatus}
        className={cn(
          "flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition",
          workflow.meta.status === "ready"
            ? "border-success/30 bg-success/10 text-success"
            : "border-bline bg-surface-dim text-txt-secondary"
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            workflow.meta.status === "ready" ? "bg-success" : "bg-txt-disabled"
          )}
        />
        {workflow.meta.status === "ready" ? "Active" : "Draft"}
      </button>

      <div className="mx-2 h-5 w-px bg-bline" />

      <button
        onClick={onOpenTemplates}
        className="flex h-8 items-center gap-1.5 rounded border border-bline px-2.5 text-[12px] font-medium text-txt-secondary transition hover:border-txt-disabled hover:text-txt"
      >
        Templates
      </button>

      <button
        onClick={onReset}
        className="flex h-8 w-8 items-center justify-center rounded border border-bline text-txt-secondary transition hover:border-txt-disabled hover:text-txt"
        title="Reset execution"
      >
        <RotateCcw size={14} />
      </button>

      <div className="mx-2 h-5 w-px bg-bline" />

      {/* Test button */}
      <button
        onClick={onRun}
        disabled={isRunning || workflow.nodes.length === 0}
        className={cn(
          "flex h-8 items-center gap-1.5 rounded border px-3 text-[12px] font-medium transition",
          isRunning
            ? "border-error/40 bg-error/10 text-error"
            : workflow.nodes.length === 0
              ? "cursor-not-allowed border-bline bg-surface-dim text-txt-disabled"
              : "border-ms-blue text-ms-blue hover:bg-ms-blue-50"
        )}
        title={isRunning ? "Stop" : "Test workflow"}
      >
        {isRunning ? (
          <>
            <Square size={12} fill="currentColor" />
            Stop
          </>
        ) : (
          <>
            <Play size={12} fill="currentColor" />
            Test Workflow
          </>
        )}
      </button>

      {/* Save button */}
      <button
        className="ml-1.5 flex h-8 items-center gap-1.5 rounded bg-ms-blue px-3 text-[12px] font-semibold text-white transition hover:bg-ms-blue-hover"
        title="Save workflow"
      >
        <Save size={13} />
        Save
      </button>
    </header>
  );
}
