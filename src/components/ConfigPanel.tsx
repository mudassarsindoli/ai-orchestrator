"use client";

import { useEffect, useState } from "react";
import {
  Copy,
  Trash2,
  X,
  Check,
  Loader2,
  CircleAlert,
} from "lucide-react";
import type { ConfigField, NodeResult, WorkflowNode } from "@/lib/types";
import { getNodeConfig } from "@/lib/nodes";
import { formatDuration, cn } from "@/lib/utils";

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
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center text-txt-secondary">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-dim">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a19f9d" strokeWidth="1.5">
            <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </div>
        <p className="text-[13px] leading-relaxed">
          Select a node on the canvas to view and edit its configuration.
        </p>
        <div className="space-y-1.5 rounded border border-bline bg-surface-dim px-3 py-2.5 text-[11px] text-left text-txt-secondary">
          <div className="font-medium text-txt">Shortcuts</div>
          <div className="flex items-center justify-between gap-6">
            <span>Duplicate</span>
            <kbd className="rounded border border-bline bg-white px-1.5 py-0.5 font-mono text-[10px]">
              Cmd+D
            </kbd>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span>Delete</span>
            <kbd className="rounded border border-bline bg-white px-1.5 py-0.5 font-mono text-[10px]">
              Del
            </kbd>
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
            style={{ background: val ? "#0078d4" : "#d2d0ce" }}
          >
            <span
              className="absolute h-4 w-4 rounded-full bg-white shadow-sm transition-all"
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
            onChange={(e) =>
              update(
                field.key,
                field.type === "number" ? Number(e.target.value) : e.target.value
              )
            }
            placeholder={field.placeholder}
            className="w-full rounded border border-bline bg-white px-2.5 py-1.5 font-mono text-[12px] text-txt outline-none transition focus:border-ms-blue focus:ring-1 focus:ring-ms-blue/30"
          />
        );
      case "textarea":
        return (
          <textarea
            value={String(val ?? "")}
            onChange={(e) => update(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full resize-y rounded border border-bline bg-white px-2.5 py-1.5 font-mono text-[11.5px] leading-relaxed text-txt outline-none transition focus:border-ms-blue focus:ring-1 focus:ring-ms-blue/30"
          />
        );
      case "select":
        return (
          <select
            value={String(val ?? "")}
            onChange={(e) => update(field.key, e.target.value)}
            className="w-full rounded border border-bline bg-white px-2.5 py-1.5 text-[12px] text-txt outline-none transition focus:border-ms-blue focus:ring-1 focus:ring-ms-blue/30"
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
                    "flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-medium transition",
                    on
                      ? "border-ms-blue/40 bg-ms-blue-50 text-ms-blue"
                      : "border-bline bg-white text-txt-secondary hover:text-txt"
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
            className="w-full rounded border border-bline bg-white px-2.5 py-1.5 font-mono text-[12px] text-txt outline-none"
          />
        );
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-surface">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 border-b border-bline px-3 py-2.5">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-md"
          style={{ background: `${cfg.accent}14`, color: cfg.accent }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-semibold text-txt">
            {cfg.label}
          </div>
          <div className="truncate text-[10.5px] text-txt-disabled">
            {node.id}
          </div>
        </div>
        <button
          onClick={() => onDuplicate(node.id)}
          title="Duplicate"
          className="flex h-7 w-7 items-center justify-center rounded text-txt-secondary transition hover:bg-surface-dim hover:text-txt"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={() => onDelete(node.id)}
          title="Delete"
          className="flex h-7 w-7 items-center justify-center rounded text-txt-secondary transition hover:bg-error/10 hover:text-error"
        >
          <Trash2 size={14} />
        </button>
        <button
          onClick={onClose}
          title="Close"
          className="flex h-7 w-7 items-center justify-center rounded text-txt-secondary transition hover:bg-surface-dim hover:text-txt"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-txt-secondary">
            Name
          </label>
          <input
            value={node.data.label}
            onChange={(e) => onRename(node.id, e.target.value)}
            className="w-full rounded border border-bline bg-white px-2.5 py-1.5 text-[12.5px] font-medium text-txt outline-none focus:border-ms-blue focus:ring-1 focus:ring-ms-blue/30"
          />
        </div>

        {/* Description */}
        <p className="rounded border border-bline bg-surface-dim px-2.5 py-2 text-[11.5px] leading-relaxed text-txt-secondary">
          {cfg.description}
        </p>

        {/* Fields */}
        <div className="space-y-3">
          {genres.map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-[11px] font-medium text-txt-secondary">
                {field.label}
                {field.required && <span className="ml-1 text-error">*</span>}
              </label>
              {renderField(field)}
              {field.help && (
                <p className="text-[10.5px] text-txt-disabled">{field.help}</p>
              )}
            </div>
          ))}
        </div>

        {/* Execution result */}
        {result && result.state !== "idle" && (
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-medium text-txt-secondary">
              Execution Output
            </label>
            <div
              className={cn(
                "flex items-center gap-2 rounded border px-2.5 py-2 text-[12px]",
                status === "success" &&
                  "border-success/30 bg-success/5 text-success",
                status === "error" &&
                  "border-error/30 bg-error/5 text-error",
                status === "running" &&
                  "border-ms-blue/30 bg-ms-blue-50 text-ms-blue"
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
                  ? "Executing..."
                  : status === "success"
                    ? result.duration > 0
                      ? `Completed in ${formatDuration(result.duration)}`
                      : "Completed"
                    : result.error ?? "Failed"}
              </span>
            </div>
            {result.output !== undefined && status === "success" && (
              <pre className="max-h-40 overflow-auto rounded border border-bline bg-surface-dim p-2 font-mono text-[10.5px] leading-relaxed text-txt-secondary">
                {JSON.stringify(result.output, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
