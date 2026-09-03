"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Copy,
  Trash2,
  GripVertical,
  X,
  Check,
  Loader2,
  CircleAlert,
} from "lucide-react";
import type { ConfigField, NodeResult, WorkflowNode } from "@/lib/types";
import { getNodeConfig } from "@/lib/nodes";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ConfigPanelProps {
  node: WorkflowNode | null;
  onUpdate: (nodeId: string, key: string, value: unknown) => void;
  onRename: (nodeId: string, name: string) => void;
  onDuplicate: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
  executionState: string;
}

export default function ConfigPanel({
  node,
  onUpdate,
  onRename,
  onDuplicate,
  onDelete,
  onClose,
  executionState,
}: ConfigPanelProps) {
  const [value, setValue] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setValue(node?.data.config ?? {});
  }, [node?.id, node?.data.config]);

  if (!node) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-500">
        <GripVertical size={20} className="opacity-30" />
        <p className="text-[13px] leading-relaxed">
          No node selected. Click a node on the canvas to view and edit its
          configuration, execution output and connections.
        </p>
        <div className="space-y-1.5 rounded-lg border border-panel-line bg-panel px-3 py-2.5 text-[11px] text-left text-slate-400">
          <div className="font-semibold text-slate-300">Shortcuts</div>
          <div className="flex items-center justify-between gap-6">
            <span>Duplicate node</span>
            <kbd className="rounded border border-panel-line bg-canvas-deep px-1.5 py-0.5 font-mono">⌘D</kbd>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span>Delete node</span>
            <kbd className="rounded border border-panel-line bg-canvas-deep px-1.5 py-0.5 font-mono">⌫</kbd>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span>Pan canvas</span>
            <kbd className="rounded border border-panel-line bg-canvas-deep px-1.5 py-0.5 font-mono">Scroll</kbd>
          </div>
        </div>
      </div>
    );
  }

  const cfg = getNodeConfig(node.data.type);
  const genres = cfg.fields;
  const result: NodeResult | undefined = node.data.result as NodeResult | undefined;
  const status = result?.state ?? "idle";

  const update = (key: string, v: unknown) => onUpdate(node.id, key, v);

  const renderField = (field: ConfigField) => {
    const val = value[field.key];
    switch (field.type) {
      case "toggle":
        return (
          <button
            onClick={() => update(field.key, !val)}
            className="relative flex h-5 w-9 items-center rounded-full transition"
            style={{ background: val ? "#6d7bff" : "#2b3240" }}
          >
            <span
              className="absolute h-4 w-4 rounded-full bg-white shadow transition-all"
              style={{ left: val ? "calc(100% - 18px)" : "2px" }}
            />
          </button>
        );
      case "text":
      case "number":
        return (
          <input
            type={field.type === "number" ? "number" : "text"}
            value={String(val ?? "")}
            onChange={(e) => update(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)}
            placeholder={field.placeholder}
            className="w-full rounded-md border border-panel-line bg-canvas-deep px-2.5 py-1.5 font-mono text-[12px] text-slate-200 outline-none transition focus:border-accent/50"
          />
        );
      case "textarea":
        return (
          <textarea
            value={String(val ?? "")}
            onChange={(e) => update(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full resize-y rounded-md border border-panel-line bg-canvas-deep px-2.5 py-1.5 font-mono text-[11.5px] leading-relaxed text-slate-200 outline-none transition focus:border-accent/50"
          />
        );
      case "select":
        return (
          <select
            value={String(val ?? "")}
            onChange={(e) => update(field.key, e.target.value)}
            className="w-full rounded-md border border-panel-line bg-canvas-deep px-2.5 py-1.5 text-[12px] text-slate-200 outline-none transition focus:border-accent/50"
          >
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        );
      case "select-multi": {
        const arr = Array.isArray(val) ? (val as string[]) : [];
        return (
          <div className="flex flex-wrap gap-1.5">
            {field.options?.map((o) => {
              const on = arr.includes(o.value);
              return (
                <button
                  key={o.value}
                  onClick={() =>
                    update(
                      field.key,
                      on ? arr.filter((v) => v !== o.value) : [...arr, o.value]
                    )
                  }
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                    on
                      ? "border-accent/50 bg-accent/15 text-accent-soft"
                      : "border-panel-line bg-panel text-slate-400 hover:text-slate-200"
                  )}
                >
                  {on && <Check size={11} />}
                  {o.label}
                </button>
              );
            })}
          </div>
        );
      }
      default:
        return (
          <input
            value={String(val ?? "")}
            onChange={(e) => update(field.key, e.target.value)}
            className="w-full rounded-md border border-panel-line bg-canvas-deep px-2.5 py-1.5 font-mono text-[12px] text-slate-200 outline-none"
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.2 }}
      className="flex h-full w-full flex-col bg-canvas-deep/90"
    >
      {/* header */}
      <div className="flex shrink-0 items-center gap-2 border-b border-panel-line px-3 py-2.5">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: `${cfg.accent}1a`, color: cfg.accent }}
        >
          <GripVertical size={15} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-semibold text-slate-100">
            {cfg.label}
          </div>
          <div className="truncate text-[10.5px] text-slate-500">
            node {node.id}
          </div>
        </div>
        <button
          onClick={() => onDuplicate(node.id)}
          title="Duplicate"
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-panel hover:text-white"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={() => onDelete(node.id)}
          title="Delete"
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-rose-500/15 hover:text-rose-400"
        >
          <Trash2 size={14} />
        </button>
        <button
          onClick={onClose}
          title="Close"
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-panel hover:text-white"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        {/* name */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Name
          </label>
          <input
            value={node.data.label}
            onChange={(e) => onRename(node.id, e.target.value)}
            className="w-full rounded-md border border-panel-line bg-panel px-2.5 py-1.5 text-[12.5px] font-medium text-slate-100 outline-none focus:border-accent/50"
          />
        </div>

        {/* description */}
        <p className="rounded-lg border border-panel-line bg-panel px-2.5 py-2 text-[11.5px] leading-relaxed text-slate-400">
          {cfg.description}
        </p>

        {/* fields */}
        <div className="space-y-3">
          {genres.map((field) => (
            <div key={field.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-rose-400">*</span>
                  )}
                </label>
              </div>
              {renderField(field)}
              {field.help && (
                <p className="text-[10.5px] text-slate-600">{field.help}</p>
              )}
            </div>
          ))}
        </div>

        {/* execution result */}
        {result && result.state !== "idle" && (
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Execution Output
            </label>
            <div
              className={cn(
                "flex items-center gap-2 rounded-md border px-2.5 py-2 text-[12px]",
                status === "success" &&
                  "border-emerald-500/30 bg-emerald-500/5 text-emerald-300",
                status === "error" &&
                  "border-rose-500/30 bg-rose-500/5 text-rose-300",
                status === "running" &&
                  "border-accent/30 bg-accent/5 text-accent-soft"
              )}
            >
              {status === "running" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : status === "success" ? (
                <Check size={13} />
              ) : (
                <CircleAlert size={13} />
              )}
              <span className="flex-1 truncate">
                {status === "running"
                  ? "Executing…"
                  : status === "success"
                    ? result.duration > 0
                      ? `Completed in ${formatDuration(result.duration)}`
                      : "Completed"
                    : result.error ?? "Failed"}
              </span>
            </div>
            {result.output !== undefined && status === "success" && (
              <pre className="max-h-40 overflow-auto rounded-md border border-panel-line bg-canvas-deep p-2 font-mono text-[10.5px] leading-relaxed text-slate-400">
                {JSON.stringify(result.output, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
