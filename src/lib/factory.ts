import type { XYPosition } from "@xyflow/react";
import type {
  NodeConfig,
  Workflow,
  WorkflowEdge,
  WorkflowNode,
} from "./types";
import { getNodeConfig } from "./nodes";
import { uid } from "./utils";

export function initialConfigFor(type: string): Record<string, unknown> {
  const cfg = getNodeConfig(type);
  const config: Record<string, unknown> = {};
  for (const field of cfg.fields) {
    if (field.default !== undefined) config[field.key] = field.default;
  }
  if (cfg.fields.some((f) => f.key === "label")) {
    config.label = defaultLabel(type);
  }
  return config;
}

export function defaultLabel(type: string): string {
  const cfg = getNodeConfig(type);
  const nth = Math.floor(Math.random() * 1000);
  return `${cfg.label} ${nth}`;
}

interface BuildNodeInput {
  type: string;
  position: XYPosition;
  id?: string;
  config?: Record<string, unknown>;
}

export function buildNode(input: BuildNodeInput): WorkflowNode {
  const cfg = getNodeConfig(input.type);
  const config = {
    ...initialConfigFor(input.type),
    ...(input.config ?? {}),
  };
  const label = (config.label as string) ?? defaultLabel(input.type);
  return {
    id: input.id ?? uid("n"),
    type: cfg.type,
    position: input.position,
    data: {
      type: cfg.type,
      label,
      config,
    },
    selected: false,
  };
}

export function emptyWorkflow(name = "Untitled Workflow"): Workflow {
  const now = Date.now();
  return {
    meta: {
      version: 1,
      id: uid("wf"),
      name,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    },
    nodes: [],
    edges: [],
    nodeConfigs: {},
    results: {},
    execution: {
      state: "idle",
      startedAt: null,
      finishedAt: null,
      duration: 0,
      totalNodes: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
    },
    logs: [],
  };
}

export interface EdgeLink {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export function linkEdges(links: EdgeLink[], naturalSet: Set<string>): WorkflowEdge[] {
  return links.map((link) => {
    return {
      id: `e-${uid()}`,
      source: link.source,
      target: link.target,
      ...(link.sourceHandle ? { sourceHandle: link.sourceHandle } : {}),
      ...(link.targetHandle ? { targetHandle: link.targetHandle } : {}),
      type: "workflow",
    };
  });
}

export function renumberNodes(nodes: WorkflowNode[], ids: string[]): WorkflowNode[] {
  return nodes.map((n) => {
    const idx = ids.indexOf(n.id);
    if (idx < 0) return n;
    return {
      ...n,
      data: { ...n.data },
      position: { x: n.position.x, y: n.position.y },
    };
  });
}
