"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Terminal,
  List,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  Timer,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Trash2,
} from "lucide-react";
import type { ExecutionState, LogEntry, Workflow, WorkflowNode } from "@/lib/types";
import { getNodeConfig } from "@/lib/nodes";
import { formatDuration, formatTimestamp } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ExecutionPanelProps {
  workflow: Workflow;
  nodes: WorkflowNode[];
  isRunning: boolean;
  executionState: ExecutionState;
  onReset: () => void;
  onClearLogs: () => void;
}

export default function ExecutionPanel({
  workflow,
  nodes,
  isRunning,
  executionState,
  onReset,
  onClearLogs,
}: ExecutionPanelProps) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<"logs" | "nodes">("logs");
  const logRef = useRef<HTMLDivElement>(null);
  const { logs, execution } = workflow;

  useEffect(() => {
    if (tab === "logs" && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs, tab]);

  const statusColor = useMemo(() => {
    if (executionState === "running") return "#6d7bff";
    if (executionState === "success") return "#22c55e";
    if (executionState === "failed") return "#ef4444";
    return "#3f4757";
  }, [executionState]);

  const fmt = (ms: number) => (ms > 0 ? formatDuration(ms) : "—");

  return (
    <div
      className="relative z-30 flex shrink-0 flex-col border-t border-panel-line bg-canvas-deep/95 backdrop-blur"
      style={{ height: open ? 220 : 40 }}
    >
      {/* header */}
      <div className="flex h-10 shrink-0 items-center gap-2 px-3">
        <div
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium"
          style={{ background: `${statusColor}18`, color: statusColor }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }}
          />
          {executionState === "idle" && "Idle"}
          {executionState === "running" && "Running"}
          {executionState === "success" && "Success"}
          {executionState === "failed" && "Failed"}
        </div>

        <div className="flex h-6 items-center gap-1 overflow-hidden rounded-md border border-panel-line">
          <button
            onClick={() => setTab("logs")}
            className={cn(
              "flex h-full items-center gap-1 px-2 text-[11px] font-medium transition",
              tab === "logs" ? "bg-panel text-slate-100" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Terminal size={11} />
            Logs
            {logs.length > 0 && (
              <span className="rounded bg-panel-line px-1 text-[9px] text-slate-400">
                {logs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("nodes")}
            className={cn(
              "flex h-full items-center gap-1 px-2 text-[11px] font-medium transition",
              tab === "nodes" ? "bg-panel text-slate-100" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <List size={11} />
            Nodes
            {nodes.length > 0 && (
              <span className="rounded bg-panel-line px-1 text-[9px] text-slate-400">
                {nodes.length}
              </span>
            )}
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-500">
          {execution.duration > 0 && (
            <span className="flex items-center gap-1 font-mono">
              <Timer size={11} />
              {fmt(execution.duration)}
            </span>
          )}
          <button
            onClick={onReset}
            title="Reset execution"
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-panel hover:text-white"
          >
            <RotateCcw size={12} />
          </button>
          <button
            onClick={onClearLogs}
            title="Clear logs"
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-panel hover:text-white"
          >
            <Trash2 size={12} />
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            title={open ? "Collapse" : "Expand"}
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-panel hover:text-white"
          >
            {open ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-panel hover:text-white"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-[calc(100%-40px)] flex-1 overflow-hidden border-t border-panel-line/60"
          >
            {tab === "logs" ? (
              logs.length === 0 ? (
                <div className="flex h-full items-center justify-center text-[12px] text-slate-600">
                  Run the workflow to see execution logs.
                </div>
              ) : (
                <div ref={logRef} className="h-full overflow-y-auto px-3 py-2 font-mono text-[11.5px] leading-relaxed">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 py-0.5">
                      <span className="shrink-0 text-slate-600">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 px-1.5 py-px text-[10px] font-semibold uppercase",
                          log.level === "success" && "text-emerald-400",
                          log.level === "error" && "text-rose-400",
                          log.level === "warn" && "text-amber-400",
                          log.level === "info" && "text-sky-400"
                        )}
                      >
                        {log.level}
                      </span>
                      <span className="shrink-0 text-accent-soft">{log.source}</span>
                      <span className="break-words text-slate-300">{log.message}</span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="h-full overflow-y-auto px-3 py-2">
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {nodes.map((n) => {
                    const cfg = getNodeConfig(n.data.type);
                    const r = workflow.results[n.id];
                    const st = r?.state ?? "idle";
                    return (
                      <div
                        key={n.id}
                        className="flex items-center gap-2 rounded-lg border border-panel-line bg-panel px-2.5 py-2"
                      >
                        <div
                          className="h-5 w-1 rounded"
                          style={{ background: cfg.accent }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[11.5px] font-medium text-slate-200">
                            {n.data.label}
                          </div>
                          <div className="truncate text-[10px] text-slate-500">
                            {cfg.label}
                          </div>
                        </div>
                        {st === "running" && <Loader2 size={13} className="animate-spin text-accent" />}
                        {st === "success" && <CheckCircle2 size={13} className="text-emerald-400" />}
                        {st === "error" && <XCircle size={13} className="text-rose-400" />}
                        {st === "idle" && (
                          <span className="text-[10px] text-slate-600">—</span>
                        )}
                        {r?.duration ? (
                          <span className="font-mono text-[10px] text-slate-500">
                            {formatDuration(r.duration)}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
