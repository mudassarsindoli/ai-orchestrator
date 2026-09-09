"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import * as icons from "lucide-react";
import {
  Check,
  Loader2,
  X,
  Circle,
} from "lucide-react";
import type { RunStatus, WorkflowNode } from "@/lib/types";
import { getNodeConfig } from "@/lib/nodes";

type IconComponent = React.ComponentType<{
  size?: number | string;
  className?: string;
  strokeWidth?: number | string;
}>;

function resolveIcon(name: string): IconComponent {
  const Comp = icons[name as keyof typeof icons] as IconComponent | undefined;
  return Comp ?? Circle;
}

function StatusIndicator({ status }: { status: RunStatus }) {
  if (status === "idle") return null;
  return (
    <div className="absolute -top-1.5 -right-1.5 z-20">
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow-sm ${
          status === "running"
            ? "bg-ms-blue"
            : status === "success"
              ? "bg-success"
              : "bg-error"
        }`}
      >
        {status === "running" && (
          <Loader2 className="h-3 w-3 animate-spin text-white" strokeWidth={3} />
        )}
        {status === "success" && (
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        )}
        {status === "error" && (
          <X className="h-3 w-3 text-white" strokeWidth={3} />
        )}
      </div>
    </div>
  );
}

function NodeHandle({
  id,
  position,
  type,
  color,
}: {
  id: string;
  position: Position;
  type: "source" | "target";
  color: string;
}) {
  const isSource = type === "source";
  return (
    <Handle
      id={id}
      type={type}
      position={position}
      className="!h-3 !w-3 !rounded-full !border-2 !border-white !shadow-sm"
      style={{
        background: color,
        zIndex: 10,
      }}
    />
  );
}

function BaseNodeInner({ data, selected }: { data: WorkflowNode["data"]; selected?: boolean }) {
  const cfg = getNodeConfig(data.type);
  const color = cfg.color;
  const Icon = resolveIcon(cfg.icon);
  const status: RunStatus = data.result?.state ?? "idle";

  return (
    <div
      className="workflow-node relative w-[220px] select-none rounded-lg border bg-white text-left transition-shadow"
      style={{
        borderColor: selected ? "#0078d4" : "#e5e7eb",
        boxShadow: selected
          ? "0 0 0 1px #0078d4, 0 2px 8px rgba(0,120,212,0.15)"
          : "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <StatusIndicator status={status} />

      {/* Colored header */}
      <div
        className="flex items-center gap-2.5 rounded-t-lg px-3 py-2.5 workflow-node-drag cursor-grab"
        style={{ background: `${color}14` }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ background: color }}
        >
          <Icon size={18} className="text-white" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold leading-tight text-txt">
            {data.label}
          </div>
          <div className="truncate text-[11px] text-txt-secondary">
            {cfg.service}
          </div>
        </div>
      </div>

      {/* Body accent line */}
      <div
        className="h-[2px]"
        style={{ background: color }}
      />

      {/* Handles - input on left, output on right */}
      {cfg.inputs.map((input) => (
        <NodeHandle
          key={`in-${input}`}
          id={input}
          position={Position.Left}
          type="target"
          color={color}
        />
      ))}
      {cfg.outputs.map((output) => (
        <NodeHandle
          key={`out-${output}`}
          id={output}
          position={Position.Right}
          type="source"
          color={color}
        />
      ))}
    </div>
  );
}

const WorkflowNodeView = memo(function WorkflowNodeView(props: NodeProps) {
  return (
    <BaseNodeInner
      data={props.data as unknown as WorkflowNode["data"]}
      selected={props.selected}
    />
  );
});

export default WorkflowNodeView;
