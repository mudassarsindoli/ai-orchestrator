"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import * as icons from "lucide-react";
import { motion } from "framer-motion";
import {
  Check,
  Loader2,
  X,
  Settings,
  Circle,
} from "lucide-react";
import type { RunStatus, WorkflowNode } from "@/lib/types";
import { getNodeConfig } from "@/lib/nodes";
import { cn } from "@/lib/utils";

type IconComponent = React.ComponentType<{ size?: number | string; className?: string; strokeWidth?: number | string }>;

function resolveIcon(name: string): IconComponent {
  const Comp = icons[name as keyof typeof icons] as IconComponent | undefined;
  return Comp ?? Circle;
}

function StatusBadge({ status, color }: { status: RunStatus; color: string }) {
  return (
    <div className="absolute -top-2 -right-2 z-20">
      <motion.div
        key={status}
        initial={status === "running" ? { opacity: 0, scale: 0.6 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border shadow-md",
          status === "running" && "border-transparent",
          status === "success" && "border-emerald-500/60 bg-emerald-500",
          status === "error" && "border-rose-500/60 bg-rose-500",
          status === "idle" && "border-transparent bg-transparent"
        )}
        style={
          status === "running"
            ? { background: color, boxShadow: `0 0 12px ${color}` }
            : undefined
        }
      >
        {status === "running" && <Loader2 className="h-3 w-3 animate-spin text-white" strokeWidth={3} />}
        {status === "success" && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
        {status === "error" && <X className="h-3 w-3 text-white" strokeWidth={3} />}
      </motion.div>
    </div>
  );
}

function ConnectHandle({
  id,
  position,
  color,
  kind,
}: {
  id?: string;
  position: Position;
  color: string;
  kind: "source" | "target";
}) {
  return (
    <Handle
      id={id}
      type={kind}
      position={position}
      className="!h-2.5 !w-2.5"
      style={{
        background: "#0b0d12",
        border: `2px solid ${color}`,
        boxShadow: `0 0 6px ${color}66`,
      }}
    />
  );
}

function BaseNodeInner({ data, selected }: { data: WorkflowNode["data"]; selected?: boolean }) {
  const cfg = getNodeConfig(data.type);
  const color = cfg.accent;  const Icon = resolveIcon(cfg.icon);
  const status: RunStatus = data.result?.state ?? "idle";

  return (
    <div
      className="workflow-node relative w-[210px] select-none rounded-xl border bg-gradient-to-b from-[#1a1f2b] to-[#12151f] text-left shadow-[0_6px_20px_-6px_rgba(0,0,0,0.6)]"
      style={
        {
          "--node-accent": color,
          borderColor: selected ? color : "#2a3140",
        } as React.CSSProperties
      }
    >
      {/* top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-[2px] rounded-t-xl"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      <StatusBadge status={status} color={color} />

      <div className="flex items-center gap-2.5 p-2.5 pl-3 workflow-node-drag cursor-grab">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${color}1f`, color }}
        >
          <Icon size={17} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <div
            className="truncate text-[12.5px] font-semibold leading-tight"
            style={{ color: "#eef1f7" }}
          >
            {data.label}
          </div>
          <div className="truncate text-[10.5px] uppercase tracking-wide" style={{ color: "#8a93a6" }}>
            {cfg.label}
          </div>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1 text-[#5b6577]">
          <Settings size={12} className="opacity-70" />
        </div>
      </div>

      {/* handles */}
      {cfg.inputs.map((input, i) => (
        <ConnectHandle
          key={`in-${input}`}
          id={input}
          position={Position.Left}
          color={color}
          kind="target"
        />
      ))}
      {cfg.outputs.map((output, i) => (
        <ConnectHandle
          key={`out-${output}`}
          id={output}
          position={Position.Right}
          color={color}
          kind="source"
        />
      ))}
    </div>
  );
}

const WorkflowNodeView = memo(function WorkflowNodeView(props: NodeProps) {
  return (
    <BaseNodeInner data={props.data as unknown as WorkflowNode["data"]} selected={props.selected} />
  );
});

export default WorkflowNodeView;
