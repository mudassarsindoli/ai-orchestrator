"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
  Controls,
  useReactFlow,
  useKeyPress,
  type ConnectionMode,
  type OnSelectionChangeParams,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import WorkflowNodeView from "./workflow-node";
import WorkflowEdgeView from "./workflow-edge";
import type { WorkflowNode, WorkflowEdge, NodeResult } from "@/lib/types";

const nodeTypes = { workflow: WorkflowNodeView } as const;
const edgeTypes = { workflow: WorkflowEdgeView } as const;
const defaultEdgeOptions = { type: "workflow" } as const;

interface FlowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  results: Record<string, Partial<NodeResult> | undefined>;
  executionState: string;
  selectedNodeId: string | null;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  onNodeClick: (nodeId: string) => void;
  onPaneClick: () => void;
  onAddNode: (type: string, position: { x: number; y: number }) => void;
  onDuplicate: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
}

function FlowCanvasInner({
  nodes,
  edges,
  results,
  executionState,
  selectedNodeId,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
  onAddNode,
  onDuplicate,
  onDelete,
}: FlowCanvasProps) {
  const { screenToFlowPosition } = useReactFlow();
  const isRunning = executionState === "running";
  const duplicateKey = useKeyPress("Meta+d");
  const deleteKey = useKeyPress(["Delete", "Backspace"]);

  const enrichedNodes: WorkflowNode[] = useMemo(() => {
    return nodes.map((n) => {
      const result = results[n.id];
      const status = result?.state ?? "idle";
      return {
        ...n,
        type: "workflow",
        data: { ...n.data, result: { ...(n.data.result ?? {}), state: status } },
      };
    });
  }, [nodes, results]);

  const enrichedEdges: WorkflowEdge[] = useMemo(() => {
    return edges.map((e) => {
      const src = results[e.source];
      const active = src ? src.state === "running" || src.state === "success" : false;
      return {
        ...e,
        type: "workflow",
        data: {
          ...(e.data ?? {}),
          animated: isRunning && active,
          status: src?.state ?? "idle",
        },
      };
    });
  }, [edges, results, isRunning]);

  // keyboard: duplicate/delete selected node
  const editing = useCallback(() => {
    const el = document.activeElement;
    return !!el?.closest("input, textarea, select, [contenteditable]");
  }, []);

  useEffect(() => {
    if (duplicateKey && !editing() && selectedNodeId) onDuplicate(selectedNodeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duplicateKey]);

  useEffect(() => {
    if (deleteKey && !editing() && selectedNodeId) onDelete(selectedNodeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteKey]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/workflow-node");
      if (!type) return;
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      onAddNode(type, position);
    },
    [screenToFlowPosition, onAddNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      const node = params.nodes[0];
      if (node) onNodeClick(node.id as string);
      else onPaneClick();
    },
    [onNodeClick, onPaneClick]
  );

  const getStatusColor = (id: string) => {
    const s = results[id]?.state;
    if (s === "running") return "#6d7bff";
    if (s === "success") return "#22c55e";
    if (s === "error") return "#ef4444";
    return "#3f4757";
  };

  return (
    <div
      className="h-full w-full"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <ReactFlow
        nodes={enrichedNodes as any}
        edges={enrichedEdges as any}
        onNodesChange={onNodesChange as any}
        onEdgesChange={onEdgesChange as any}
        onConnect={onConnect as any}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onSelectionChange={onSelectionChange}
        onNodeDoubleClick={(_, node) => onNodeClick(node.id)}
        onPaneClick={onPaneClick}
        fitView
        minZoom={0.2}
        maxZoom={2}
        connectionMode={"strict" as ConnectionMode}
        panOnScroll
        zoomOnDoubleClick={false}
        deleteKeyCode={null}
        selectionOnDrag
        snapToGrid
        snapGrid={[12, 12]}
        defaultEdgeOptions={defaultEdgeOptions}
        style={{ backgroundColor: "transparent" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.3}
          color="#242b38"
        />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => getStatusColor(n.id)}
          nodeStrokeWidth={0}
          maskColor="rgba(8,9,13,0.75)"
          bgColor="#0d1016"
          nodeBorderRadius={4}
          style={{ width: 180, height: 110 }}
        />
      </ReactFlow>
    </div>
  );
}

export default function FlowCanvas(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
