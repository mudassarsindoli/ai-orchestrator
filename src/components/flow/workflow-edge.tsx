"use client";

import { memo } from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";
import type { WorkflowEdge } from "@/lib/types";

function WorkflowEdgeInner(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, label, selected } =
    props;

  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    curvature: 0.3,
  });

  const status = (data as any)?.status as string | undefined;
  const animated = (data as any)?.animated as boolean | undefined;

  let color = "#394152";
  if (status === "success") color = "#22c55e";
  else if (status === "error") color = "#ef4444";
  else if (status === "running") color = "#6d7bff";

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: color,
          strokeWidth: selected ? 2.2 : 1.6,
          strokeDasharray: animated ? "6 6" : "none",
          animation: animated ? "dash-flow 0.9s linear infinite" : "none",
        }}
      />
      {label ? (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            className="nodrag nopan pointer-events-none absolute select-none rounded-md border border-[#232936] bg-[#0d1016] px-1.5 py-0.5 text-[10px] font-semibold"
          >
            <span style={{ color }}>{label}</span>
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export default memo(WorkflowEdgeInner);
