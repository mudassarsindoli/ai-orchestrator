import type { Node, Edge } from "@xyflow/react";

export type NodeCategory =
  | "Triggers"
  | "AI"
  | "Data"
  | "Logic"
  | "Integrations"
  | "Actions";

export type RunStatus = "idle" | "running" | "success" | "error";

export type ExecutionState = "idle" | "running" | "success" | "failed";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "toggle"
  | "select-multi";

export interface ConfigField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { value: string; label: string }[];
  default?: string | number | boolean | string[];
  required?: boolean;
  help?: string;
}

export interface NodeConfig {
  type: string;
  label: string;
  category: NodeCategory;
  icon: string;
  accent: string;
  description: string;
  headline: string;
  fields: ConfigField[];
  inputs: string[];
  outputs: string[];
}

export interface NodeResult {
  state: RunStatus;
  startedAt: number | null;
  finishedAt: number | null;
  duration: number;
  output: unknown;
  error?: string;
}

export interface NodeData {
  type: string;
  label: string;
  config: Record<string, unknown>;
  result?: Partial<NodeResult>;
  executing?: boolean;
  [key: string]: unknown;
}

export type WorkflowNode = Node<NodeData>;
export type WorkflowEdge = Edge;

export interface LogEntry {
  id: string;
  timestamp: number;
  level: "info" | "success" | "warn" | "error";
  source: string;
  message: string;
}

export interface ExecutionSummary {
  state: ExecutionState;
  startedAt: number | null;
  finishedAt: number | null;
  duration: number;
  totalNodes: number;
  succeeded: number;
  failed: number;
  skipped: number;
}

export interface WorkflowMeta {
  version: 1;
  id: string;
  name: string;
  status: "draft" | "ready";
  updatedAt: number;
  createdAt: number;
}

export interface Workflow {
  meta: WorkflowMeta;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  nodeConfigs: Record<string, Record<string, unknown>>;
  results: Record<string, NodeResult>;
  execution: ExecutionSummary;
  logs: LogEntry[];
}

export type EditorSelection = {
  nodeId: string;
} | null;
