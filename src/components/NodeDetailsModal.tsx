"use client";

import { useEffect, useState } from "react";
import {
  X,
  Play,
  ArrowLeft,
  FileJson,
  Table,
  Settings,
  Key,
  Loader2,
  Check,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import * as icons from "lucide-react";
import type { ConfigField, NodeResult, WorkflowNode } from "@/lib/types";
import { getNodeConfig } from "@/lib/nodes";
import { formatDuration, cn } from "@/lib/utils";

interface NodeDetailsModalProps {
  open: boolean;
  node: WorkflowNode | null;
  upstreamNodes: WorkflowNode[];
  results: Record<string, any>;
  onClose: () => void;
  onUpdate: (nodeId: string, key: string, value: unknown) => void;
  onRename: (nodeId: string, name: string) => void;
  onDelete: (nodeId: string) => void;
  onTestNode: (nodeId: string) => void;
}

export default function NodeDetailsModal({
  open,
  node,
  upstreamNodes,
  results,
  onClose,
  onUpdate,
  onRename,
  onDelete,
  onTestNode,
}: NodeDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"parameters" | "settings">("parameters");
  const [inputView, setInputView] = useState<"table" | "json">("table");
  const [outputView, setOutputView] = useState<"table" | "json">("json");
  const [config, setConfig] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setConfig(node?.data.config ?? {});
  }, [node?.id, node?.data.config]);

  useEffect(() => {
    setActiveTab("parameters");
  }, [node?.id]);

  if (!open || !node) return null;

  const cfg = getNodeConfig(node.data.type);
  const result: NodeResult | undefined = node.data.result as NodeResult | undefined;
  const status = result?.state ?? "idle";

  // Get upstream data
  const upstreamData = upstreamNodes.length > 0
    ? upstreamNodes.map((un) => {
        const ur = results[un.id];
        return {
          node: un.data.label,
          type: getNodeConfig(un.data.type).service,
          output: ur?.output ?? null,
        };
      })
    : [];

  const update = (key: string, v: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: v }));
    onUpdate(node.id, key, v);
  };

  const renderField = (field: ConfigField) => {
    const val = config[field.key];
    switch (field.type) {
      case "toggle":
        return (
          <button
            onClick={() => update(field.key, !val)}
            className="relative flex h-6 w-11 items-center rounded-full transition-colors"
            style={{ background: val ? "#0078d4" : "#d1d5db" }}
          >
            <span
              className="absolute h-5 w-5 rounded-full bg-white shadow-sm transition-all"
              style={{ left: val ? "calc(100% - 22px)" : "2px" }}
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
              update(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)
            }
            placeholder={field.placeholder}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px] text-txt outline-none transition focus:border-ms-blue focus:ring-1 focus:ring-ms-blue/20"
          />
        );
      case "textarea":
        return (
          <textarea
            value={String(val ?? "")}
            onChange={(e) => update(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className="w-full resize-y rounded-md border border-gray-200 bg-white px-3 py-2 font-mono text-[12px] leading-relaxed text-txt outline-none transition focus:border-ms-blue focus:ring-1 focus:ring-ms-blue/20"
          />
        );
      case "select":
        return (
          <select
            value={String(val ?? "")}
            onChange={(e) => update(field.key, e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px] text-txt outline-none transition focus:border-ms-blue focus:ring-1 focus:ring-ms-blue/20"
          >
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
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
                    update(field.key, on ? arr.filter((v) => v !== o.value) : [...arr, o.value])
                  }
                  className={cn(
                    "flex items-center gap-1 rounded-md border px-2.5 py-1 text-[12px] font-medium transition",
                    on
                      ? "border-ms-blue/30 bg-ms-blue-50 text-ms-blue"
                      : "border-gray-200 bg-white text-txt-secondary hover:text-txt"
                  )}
                >
                  {on && <Check size={12} />}
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
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 font-mono text-[12px] text-txt outline-none"
          />
        );
    }
  };

  const renderDataTable = (data: any) => {
    if (!data || typeof data !== "object") {
      return <div className="p-4 text-[13px] text-txt-secondary">No data available</div>;
    }
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) {
      return <div className="p-4 text-[13px] text-txt-secondary">Empty result</div>;
    }
    const keys = Object.keys(items[0]);
    return (
      <div className="overflow-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-gray-100">
              {keys.map((k) => (
                <th key={k} className="px-3 py-2 text-left font-medium text-txt-secondary">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 20).map((item, i) => (
              <tr key={i} className="border-b border-gray-50">
                {keys.map((k) => (
                  <td key={k} className="px-3 py-2 text-txt max-w-[200px] truncate">
                    {typeof item[k] === "object" ? JSON.stringify(item[k]) : String(item[k] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-[85vh] w-full max-w-[1200px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl animate-fade-in"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-gray-200 px-4 py-3">
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-txt-secondary transition hover:bg-gray-100 hover:text-txt"
            title="Back to canvas"
          >
            <ArrowLeft size={16} />
          </button>

          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: cfg.color }}
          >
            {(() => {
              const Icon = resolveIcon(cfg.icon);
              return <Icon size={16} className="text-white" />;
            })()}
          </div>

          <div className="min-w-0 flex-1">
            <input
              value={node.data.label}
              onChange={(e) => onRename(node.id, e.target.value)}
              className="w-full border-none bg-transparent text-[15px] font-semibold text-txt outline-none placeholder:text-txt-disabled focus:ring-0"
              placeholder="Node name"
            />
            <div className="text-[11px] text-txt-secondary">{cfg.service} &middot; {cfg.headline}</div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status */}
            {status !== "idle" && (
              <div className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
                status === "running" && "bg-ms-blue-50 text-ms-blue",
                status === "success" && "bg-green-50 text-success",
                status === "error" && "bg-red-50 text-error",
              )}>
                {status === "running" && <Loader2 size={12} className="animate-spin" />}
                {status === "success" && <Check size={12} />}
                {status === "error" && <AlertCircle size={12} />}
                {status === "running" ? "Running" : status === "success" ? `Done ${result?.duration ? formatDuration(result.duration) : ""}` : "Failed"}
              </div>
            )}

            <button
              onClick={() => onDelete(node.id)}
              className="flex h-8 items-center gap-1.5 rounded-md border border-gray-200 px-2.5 text-[12px] font-medium text-txt-secondary transition hover:border-error/30 hover:bg-red-50 hover:text-error"
            >
              Delete
            </button>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-txt-secondary transition hover:bg-gray-100 hover:text-txt"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 3-Panel Body */}
        <div className="flex min-h-0 flex-1">
          {/* Left: Input Data */}
          <div className="w-[300px] shrink-0 border-r border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
              <span className="text-[12px] font-semibold text-txt">Input</span>
              <div className="flex gap-0.5 rounded-md border border-gray-200 bg-white p-0.5">
                <button
                  onClick={() => setInputView("table")}
                  className={cn(
                    "rounded p-1 transition",
                    inputView === "table" ? "bg-gray-100 text-txt" : "text-txt-secondary hover:text-txt"
                  )}
                >
                  <Table size={12} />
                </button>
                <button
                  onClick={() => setInputView("json")}
                  className={cn(
                    "rounded p-1 transition",
                    inputView === "json" ? "bg-gray-100 text-txt" : "text-txt-secondary hover:text-txt"
                  )}
                >
                  <FileJson size={12} />
                </button>
              </div>
            </div>
            <div className="h-[calc(100%-36px)] overflow-y-auto">
              {upstreamData.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                  <div className="mb-2 rounded-full bg-gray-100 p-2">
                    <ArrowLeft size={16} className="text-txt-disabled" />
                  </div>
                  <p className="text-[12px] text-txt-secondary">
                    No input data yet.
                  </p>
                  <p className="mt-1 text-[11px] text-txt-disabled">
                    Connect a node upstream and execute it.
                  </p>
                </div>
              ) : (
                upstreamData.map((ud, i) => (
                  <div key={i} className="border-b border-gray-100 p-3">
                    <div className="mb-2 text-[11px] font-medium text-txt-secondary">
                      {ud.node} ({ud.type})
                    </div>
                    {inputView === "json" ? (
                      <pre className="max-h-48 overflow-auto rounded-md bg-white p-2 font-mono text-[11px] text-txt border border-gray-100">
                        {JSON.stringify(ud.output, null, 2)}
                      </pre>
                    ) : (
                      renderDataTable(ud.output)
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Center: Parameters */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("parameters")}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-[13px] font-medium transition",
                  activeTab === "parameters"
                    ? "border-ms-blue text-ms-blue"
                    : "border-transparent text-txt-secondary hover:text-txt"
                )}
              >
                <Settings size={14} />
                Parameters
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-[13px] font-medium transition",
                  activeTab === "settings"
                    ? "border-ms-blue text-ms-blue"
                    : "border-transparent text-txt-secondary hover:text-txt"
                )}
              >
                <Key size={14} />
                Credentials
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === "parameters" ? (
                <div className="space-y-4">
                  {cfg.fields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="flex items-center gap-1 text-[12px] font-medium text-txt">
                        {field.label}
                        {field.required && <span className="text-error">*</span>}
                      </label>
                      {renderField(field)}
                      {field.help && (
                        <p className="text-[11px] text-txt-disabled">{field.help}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-3 rounded-full bg-gray-100 p-3">
                    <Key size={20} className="text-txt-disabled" />
                  </div>
                  <p className="text-[13px] font-medium text-txt">Credentials</p>
                  <p className="mt-1 max-w-xs text-[12px] text-txt-secondary">
                    Connect your {cfg.service} account to authenticate this node.
                  </p>
                  <button className="mt-4 rounded-md bg-ms-blue px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-ms-blue-hover">
                    Connect {cfg.service}
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-gray-200 px-4 py-3">
              <div className="text-[11px] text-txt-disabled">
                {cfg.inputs.length > 0 && `Inputs: ${cfg.inputs.join(", ")}`}
                {cfg.inputs.length > 0 && cfg.outputs.length > 0 && " | "}
                {cfg.outputs.length > 0 && `Outputs: ${cfg.outputs.join(", ")}`}
              </div>
              <button
                onClick={() => onTestNode(node.id)}
                className="flex items-center gap-1.5 rounded-md bg-ms-blue px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-ms-blue-hover"
              >
                <Play size={13} fill="currentColor" />
                Test Step
              </button>
            </div>
          </div>

          {/* Right: Output Data */}
          <div className="w-[300px] shrink-0 border-l border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
              <span className="text-[12px] font-semibold text-txt">Output</span>
              <div className="flex gap-0.5 rounded-md border border-gray-200 bg-white p-0.5">
                <button
                  onClick={() => setOutputView("table")}
                  className={cn(
                    "rounded p-1 transition",
                    outputView === "table" ? "bg-gray-100 text-txt" : "text-txt-secondary hover:text-txt"
                  )}
                >
                  <Table size={12} />
                </button>
                <button
                  onClick={() => setOutputView("json")}
                  className={cn(
                    "rounded p-1 transition",
                    outputView === "json" ? "bg-gray-100 text-txt" : "text-txt-secondary hover:text-txt"
                  )}
                >
                  <FileJson size={12} />
                </button>
              </div>
            </div>
            <div className="h-[calc(100%-36px)] overflow-y-auto">
              {!result || result.state === "idle" ? (
                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                  <div className="mb-2 rounded-full bg-gray-100 p-2">
                    <Play size={16} className="text-txt-disabled" />
                  </div>
                  <p className="text-[12px] text-txt-secondary">
                    No output yet.
                  </p>
                  <p className="mt-1 text-[11px] text-txt-disabled">
                    Click &quot;Test Step&quot; to execute this node.
                  </p>
                </div>
              ) : result.state === "running" ? (
                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                  <Loader2 size={24} className="mb-2 animate-spin text-ms-blue" />
                  <p className="text-[12px] text-txt-secondary">Executing...</p>
                </div>
              ) : result.state === "error" ? (
                <div className="m-3 rounded-md border border-error/20 bg-red-50 p-3">
                  <div className="flex items-center gap-2 text-[12px] font-medium text-error">
                    <AlertCircle size={14} />
                    Execution Failed
                  </div>
                  <p className="mt-1 text-[11px] text-error/80">{result.error}</p>
                </div>
              ) : (
                <div className="p-3">
                  <div className="mb-2 text-[11px] text-txt-secondary">
                    Completed in {formatDuration(result.duration)}
                  </div>
                  {outputView === "json" ? (
                    <pre className="max-h-96 overflow-auto rounded-md bg-white p-3 font-mono text-[11px] text-txt border border-gray-100">
                      {JSON.stringify(result.output, null, 2)}
                    </pre>
                  ) : (
                    renderDataTable(result.output)
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function resolveIcon(name: string) {
  const Comp = (icons[name as keyof typeof icons] as any) ?? icons.Circle;
  return Comp;
}
