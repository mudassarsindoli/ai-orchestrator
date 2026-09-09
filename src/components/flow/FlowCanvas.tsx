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
  isValidConnection: (connection: any) => boolean;
  onNodeClick: (nodeId: string) => void;
  onNodeDoubleClick: (nodeId: string) => void;
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
  isValidConnection,
  onNodeClick,
  onNodeDoubleClick,
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

  const editing = useCallback(() => {
    const el = document.activeElement;
    return !!el?.closest("input, textarea, select, [contenteditable]");
  }, []);

  useEffect(() => {
    if (duplicateKey && !editing() && selectedNodeId) onDuplicate(selectedNodeId);
  }, [duplicateKey]);

  useEffect(() => {
    if (deleteKey && !editing() && selectedNodeId) onDelete(selectedNodeId);
  }, [deleteKey]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: any) => onNodeClick(node.id),
    [onNodeClick]
  );

  const handleNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: any) => onNodeDoubleClick(node.id),
    [onNodeDoubleClick]
  );

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

  const getStatusColor = (id: string) => {
    const s = results[id]?.state;
    if (s === "running") return "#0078d4";
    if (s === "success") return "#107c10";
    if (s === "error") return "#d13438";
    return "#d2d0ce";
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
        isValidConnection={isValidConnection as any}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onPaneClick={onPaneClick}
        fitView
        minZoom={0.2}
        maxZoom={2}
        connectionMode={"loose" as ConnectionMode}
        panOnScroll
        zoomOnDoubleClick={false}
        deleteKeyCode={null}
        selectionOnDrag
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={defaultEdgeOptions}
        style={{ backgroundColor: "#fafafa" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#e8e5e3"
        />
        <Controls
          showInteractive={false}
          position="bottom-center"
          style={{
            display: "flex",
            gap: 0,
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid #edebe9",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => getStatusColor(n.id)}
          nodeStrokeWidth={0}
          maskColor="rgba(250,250,250,0.85)"
          bgColor="#ffffff"
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
