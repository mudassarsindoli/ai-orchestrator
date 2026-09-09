"use client";

import { memo } from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";

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

  let color = "#d2d0ce";
  if (status === "success") color = "#107c10";
  else if (status === "error") color = "#d13438";
  else if (status === "running") color = "#0078d4";

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: color,
          strokeWidth: selected ? 2 : 1.5,
          strokeDasharray: animated ? "6 4" : "none",
          animation: animated ? "dash-flow 0.9s linear infinite" : "none",
        }}
      />
      {label ? (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
            className="nodrag nopan pointer-events-none absolute select-none rounded border border-bline bg-white px-1.5 py-0.5 text-[10px] font-medium text-txt-secondary"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export default memo(WorkflowEdgeInner);
