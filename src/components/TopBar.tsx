"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  RotateCcw,
  Braces,
  Settings,
  Workflow as WorkflowIcon,
  ChevronDown,
  PanelRight,
  Square,
} from "lucide-react";
import type { Workflow } from "@/lib/types";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TopBarProps {
  workflow: Workflow;
  isRunning: boolean;
  onRun: () => void;
  onReset: () => void;
  onRename: (name: string) => void;
  onToggleStatus: () => void;
  onOpenJson: () => void;
  onOpenTemplates: () => void;
  onToggleSettings: () => void;
}

export default function TopBar({
  workflow,
  isRunning,
  onRun,
  onReset,
  onRename,
  onToggleStatus,
  onOpenJson,
  onOpenTemplates,
  onToggleSettings,
}: TopBarProps) {
  const [editingName, setEditingName] = useState(false);
  const running = isRunning;

  return (
    <div className="relative z-40 flex h-12 shrink-0 items-center gap-2 border-b border-panel-line bg-canvas-deep/95 px-3 backdrop-blur">
      {/* logo */}
      <div className="flex items-center gap-2 pr-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent glow-text">
          <WorkflowIcon size={15} />
        </div>
        <span className="hidden text-[13px] font-semibold tracking-tight text-slate-100 md:block">
          Orchestrate
        </span>
        <span className="hidden rounded-md border border-panel-line bg-panel px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-widest text-slate-500 md:block">
          Workflow Builder
        </span>
      </div>

      <div className="h-6 w-px bg-panel-line" />

      {/* editable name */}
      <div className="flex min-w-0 items-center">
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
            className="w-48 rounded-md border border-accent/50 bg-panel px-2 py-1 text-[13px] font-semibold text-slate-100 outline-none"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            title="Rename workflow"
            className="group flex max-w-[220px] items-center gap-1 rounded-md px-2 py-1 text-[13px] font-semibold text-slate-100 transition hover:bg-panel"
          >
            <span className="truncate">{workflow.meta.name}</span>
            <span className="text-slate-500 opacity-0 transition group-hover:opacity-100">
              <Settings size={11} />
            </span>
          </button>
        )}
      </div>

      {/* status pill */}
      <button
        onClick={onToggleStatus}
        className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition"
        style={
          workflow.meta.status === "ready"
            ? { borderColor: "#22c55e44", background: "#22c55e14", color: "#4ade80" }
            : { borderColor: "#f59e0b44", background: "#f59e0b14", color: "#fbbf24" }
        }
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background:
              workflow.meta.status === "ready" ? "#22c55e" : "#f59e0b",
            boxShadow:
              workflow.meta.status === "ready"
                ? "0 0 6px #22c55e"
                : "0 0 6px #f59e0b",
          }}
        />
        {workflow.meta.status === "ready" ? "Ready" : "Draft"}
        <ChevronDown size={11} className="opacity-60" />
      </button>

      {/* recent execution chip */}
      {workflow.execution.duration > 0 && !running && (
        <div className="hidden items-center gap-1.5 rounded-md border border-panel-line bg-panel px-2 py-1 text-[11px] text-slate-400 lg:flex">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              workflow.execution.state === "success" && "bg-emerald-400",
              workflow.execution.state === "failed" && "bg-rose-400"
            )}
          />
          <span className="font-mono">
            {formatDuration(workflow.execution.duration)}
          </span>
        </div>
      )}

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={onOpenTemplates}
          className="hidden items-center gap-1.5 rounded-md border border-panel-line bg-panel px-2.5 py-1.5 text-[12px] font-medium text-slate-300 transition hover:border-accent/40 hover:text-white sm:flex"
        >
          Templates
        </button>

        <button
          onClick={onOpenJson}
          className="flex h-8 items-center gap-1.5 rounded-md border border-panel-line bg-panel px-2.5 text-[12px] font-medium text-slate-300 transition hover:border-accent/40 hover:text-white"
        >
          <Braces size={14} />
          <span className="hidden md:inline">JSON</span>
        </button>

        <button
          onClick={onToggleSettings}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-panel-line bg-panel text-slate-300 transition hover:border-accent/40 hover:text-white"
          title="Settings"
        >
          <PanelRight size={14} />
        </button>

        <div className="mx-1 h-6 w-px bg-panel-line" />

        <button
          onClick={onReset}
          className="flex h-8 items-center gap-1.5 rounded-md border border-panel-line bg-panel px-2.5 text-[12px] font-medium text-slate-300 transition hover:border-panel-line hover:text-white"
          title="Reset execution"
        >
          <RotateCcw size={13} />
        </button>

        <motion.button
          onClick={onRun}
          disabled={running || workflow.nodes.length === 0}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "relative flex h-8 items-center gap-1.5 overflow-hidden rounded-md px-4 text-[12.5px] font-semibold shadow-md transition",
            running
              ? "bg-rose-500/90 text-white"
              : workflow.nodes.length === 0
                ? "cursor-not-allowed bg-panel text-slate-500"
                : "bg-accent text-white hover:bg-accent-soft"
          )}
          title={running ? "Stop (not supported) — running" : "Run workflow"}
        >
          {running ? (
            <Square size={13} fill="currentColor" />
          ) : (
            <Play size={13} fill="currentColor" />
          )}
          {running ? "Running…" : "Run"}
        </motion.button>
      </div>
    </div>
  );
}
