"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import type {
  ExecutionState,
  Workflow,
  WorkflowNode,
} from "@/lib/types";
import { getNodeConfig } from "@/lib/nodes";
import { formatDuration, formatTimestamp, cn } from "@/lib/utils";

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
    if (executionState === "running") return "#0078d4";
    if (executionState === "success") return "#107c10";
    if (executionState === "failed") return "#d13438";
    return "#a19f9d";
  }, [executionState]);

  const fmt = (ms: number) => (ms > 0 ? formatDuration(ms) : "--");

  return (
    <div
      className="relative z-30 flex shrink-0 flex-col border-t border-bline bg-surface"
      style={{ height: open ? 220 : 36 }}
    >
      {/* Header */}
      <div className="flex h-9 shrink-0 items-center gap-2 px-3">
        <div
          className="flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-medium"
          style={{ background: `${statusColor}12`, color: statusColor }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: statusColor }}
          />
          {executionState === "idle" && "Ready"}
          {executionState === "running" && "Running"}
          {executionState === "success" && "Completed"}
          {executionState === "failed" && "Failed"}
        </div>

        <div className="flex h-6 items-center gap-0 overflow-hidden rounded border border-bline">
          <button
            onClick={() => setTab("logs")}
            className={cn(
              "flex h-full items-center gap-1 px-2 text-[11px] font-medium transition",
              tab === "logs"
                ? "bg-surface-dim text-txt"
                : "text-txt-secondary hover:text-txt"
            )}
          >
            <Terminal size={11} />
            Logs
            {logs.length > 0 && (
              <span className="rounded bg-bline px-1 text-[9px] text-txt-secondary">
                {logs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("nodes")}
            className={cn(
              "flex h-full items-center gap-1 px-2 text-[11px] font-medium transition",
              tab === "nodes"
                ? "bg-surface-dim text-txt"
                : "text-txt-secondary hover:text-txt"
            )}
          >
            <List size={11} />
            Nodes
            {nodes.length > 0 && (
              <span className="rounded bg-bline px-1 text-[9px] text-txt-secondary">
                {nodes.length}
              </span>
            )}
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1 text-[11px] text-txt-secondary">
          {execution.duration > 0 && (
            <span className="flex items-center gap-1 font-mono">
              <Timer size={11} />
              {fmt(execution.duration)}
            </span>
          )}
          <button
            onClick={onReset}
            title="Reset"
            className="flex h-6 w-6 items-center justify-center rounded text-txt-secondary transition hover:bg-surface-dim hover:text-txt"
          >
            <RotateCcw size={12} />
          </button>
          <button
            onClick={onClearLogs}
            title="Clear logs"
            className="flex h-6 w-6 items-center justify-center rounded text-txt-secondary transition hover:bg-surface-dim hover:text-txt"
          >
            <Trash2 size={12} />
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            title={open ? "Collapse" : "Expand"}
            className="flex h-6 w-6 items-center justify-center rounded text-txt-secondary transition hover:bg-surface-dim hover:text-txt"
          >
            {open ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
          {open && (
            <button
              onClick={() => setOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded text-txt-secondary transition hover:bg-surface-dim hover:text-txt"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="h-[calc(100%-36px)] flex-1 overflow-hidden border-t border-bline">
          {tab === "logs" ? (
            logs.length === 0 ? (
              <div className="flex h-full items-center justify-center text-[12px] text-txt-disabled">
                Run the workflow to see execution logs.
              </div>
            ) : (
              <div
                ref={logRef}
                className="h-full overflow-y-auto px-3 py-2 font-mono text-[11.5px] leading-relaxed"
              >
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 py-0.5">
                    <span className="shrink-0 text-txt-disabled">
                      {formatTimestamp(log.timestamp)}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 px-1 text-[10px] font-semibold uppercase",
                        log.level === "success" && "text-success",
                        log.level === "error" && "text-error",
                        log.level === "warn" && "text-warning",
                        log.level === "info" && "text-ms-blue"
                      )}
                    >
                      {log.level}
                    </span>
                    <span className="shrink-0 text-txt-secondary">
                      {log.source}
                    </span>
                    <span className="break-words text-txt">{log.message}</span>
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
                      className="flex items-center gap-2 rounded border border-bline bg-white px-2.5 py-2"
                    >
                      <div
                        className="h-5 w-1 shrink-0 rounded"
                        style={{ background: cfg.accent }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[11.5px] font-medium text-txt">
                          {n.data.label}
                        </div>
                        <div className="truncate text-[10px] text-txt-secondary">
                          {cfg.label}
                        </div>
                      </div>
                      {st === "running" && (
                        <Loader2
                          size={13}
                          className="animate-spin text-ms-blue"
                        />
                      )}
                      {st === "success" && (
                        <CheckCircle2 size={13} className="text-success" />
                      )}
                      {st === "error" && (
                        <XCircle size={13} className="text-error" />
                      )}
                      {st === "idle" && (
                        <span className="text-[10px] text-txt-disabled">--</span>
                      )}
                      {r?.duration ? (
                        <span className="font-mono text-[10px] text-txt-secondary">
                          {formatDuration(r.duration)}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
