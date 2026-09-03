import type {
  ExecutionSummary,
  LogEntry,
  NodeResult,
  Workflow,
  WorkflowEdge,
  WorkflowNode,
} from "./types";
import { getNodeConfig } from "./nodes";
import { uid } from "./utils";

const MAX_OPEN_LINKS = 50;

interface Step {
  nodeId: string;
  latency: number;
  log: string;
  output: unknown;
  status: "success" | "error";
  edgeLabel?: string;
  shouldFail?: boolean;
}

export interface EngineEvents {
  onNodeStart?: (nodeId: string) => void;
  onNodeComplete?: (nodeId: string, result: NodeResult) => void;
  onEdgeActive?: (edgeId: string) => void;
  onLog?: (entry: LogEntry) => void;
  onProgress?: (summary: ExecutionSummary) => void;
}

export interface EngineConfig {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  seedFail?: boolean;
  retryDisabled?: boolean;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function buildSteps(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  seedFail: boolean
): { steps: Step[]; edgesById: Map<string, WorkflowEdge> } {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const edgesById = new Map(edges.map((e) => [e.id, e]));
  const edgeMap = new Map<string, WorkflowEdge[]>();
  for (const e of edges) {
    const list = edgeMap.get(e.source) ?? [];
    list.push(e);
    edgeMap.set(e.source, list);
  }

  interface Pending {
    nodeId: string;
    viaEdge?: WorkflowEdge;
    depth: number;
    refs: number;
  }

  const steps: Step[] = [];
  const done = new Set<string>();
  const startNodes = nodes.filter((n) => !edges.some((e) => e.target === n.id));
  const triggers = startNodes;

  const pendingQueue: Pending[] = startNodes.map((n) => ({
    nodeId: n.id,
    depth: 0,
    refs: 0,
  }));

  let outgoingCount = 0;

  const enqueue = (pending: Pending) => {
    const nodeId = pending.nodeId;
    const cfg = getNodeConfig(byId.get(nodeId)?.data.type ?? "unknown");
    const latency = 120 + Math.random() * 380 + pending.depth * 60;

    let status: "success" | "error" = "success";
    let log = `Executed ${cfg.label} — returned ${pending.viaEdge?.label ?? cfg.outputs[0] ?? "output"}`;
    let output: unknown = { ok: true };

    if (cfg.type === "condition") {
      const takeTrue = Math.random() > 0.5;
      const chosen = takeTrue ? "true" : "false";
      status = "success";
      output = { branch: chosen };
      log = `Condition evaluated → routed to "${chosen}" branch`;
      pending.viaEdge = edgeMap.get(nodeId)?.find((e) => e.sourceHandle === chosen);
    } else if (cfg.type === "switch") {
      const n = 1 + Math.floor(Math.random() * 4);
      const chosen =
        n === 4 ? "default" : `case${n}`;
      output = { branch: chosen };
      log = `Switch routed to "${chosen}"`;
      pending.viaEdge = edgeMap.get(nodeId)?.find((e) => e.sourceHandle === chosen);
    } else if (cfg.type === "delay") {
      log = `Delayed for ${cfg.fields.find((f) => f.key === "seconds")?.default ?? 2}s`;
    }

    // inject seeded failure into a downstream step (not the trigger)
    if (seedFail && !triggers.some((t) => t.id === nodeId) && Math.random() < 0.06) {
      status = "error";
      log = `${cfg.label} failed — upstream input did not match schema`;
      output = { ok: false, error: "EVAL_ERROR_INPUT" };
    }

    const nextEdges = pending.viaEdge ? [pending.viaEdge] : (edgeMap.get(nodeId) ?? []);
    for (const ne of nextEdges) {
      if (!done.has(ne.target) && byId.has(ne.target)) {
        pendingQueue.push({
          nodeId: ne.target,
          viaEdge: ne,
          depth: pending.depth + 1,
          refs: 0,
        });
      }
    }

    done.add(nodeId);
    steps.push({
      nodeId,
      latency,
      log,
      output,
      status,
      edgeLabel:
        typeof pending.viaEdge?.label === "string"
          ? pending.viaEdge.label
          : undefined,
    });
  };

  while (pendingQueue.length) {
    // sort by depth for deterministic-ish ordering
    pendingQueue.sort((a, b) => a.depth - b.depth);
    const next = pendingQueue.shift()!;
    enqueue(next);
    outgoingCount++;
    if (outgoingCount > MAX_OPEN_LINKS) break;
  }

  // Include any orphan nodes not reached by traversal (e.g., disconnected)
  for (const n of nodes) {
    if (!done.has(n.id)) {
      const cfg = getNodeConfig(n.data.type);
      steps.push({
        nodeId: n.id,
        latency: 100,
        log: `Skipped ${cfg.label} (no inbound edge)`,
        output: { ok: true, skipped: true },
        status: "success",
      });
    }
  }

  return { steps, edgesById };
}

export async function runEngine(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  events: EngineEvents,
  opts: { seedFail?: boolean } = {}
): Promise<{ summary: ExecutionSummary; results: Record<string, NodeResult>; logs: LogEntry[] }> {
  const startedAt = Date.now();
  const results: Record<string, NodeResult> = {};
  const logs: LogEntry[] = [];
  const totalNodes = nodes.length;

  const pushLog = (
    level: LogEntry["level"],
    source: string,
    message: string
  ) => {
    const entry: LogEntry = {
      id: uid("log"),
      timestamp: Date.now(),
      level,
      source,
      message,
    };
    logs.push(entry);
    if (logs.length > 500) logs.splice(0, logs.length - 500);
    events.onLog?.(entry);
  };

  pushLog(
    "info",
    "engine",
    `Starting workflow run on ${nodes.length} node${nodes.length === 1 ? "" : "s"}`
  );

  const { steps } = buildSteps(nodes, edges, !!opts.seedFail);

  // Pre-register idle results
  for (const n of nodes) {
    results[n.id] = {
      state: "idle",
      startedAt: null,
      finishedAt: null,
      duration: 0,
      output: undefined,
    };
  }

  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  const updateProgress = () => {
    const summary: ExecutionSummary = {
      state: "running",
      startedAt,
      finishedAt: null,
      duration: Date.now() - startedAt,
      totalNodes,
      succeeded,
      failed,
      skipped,
    };
    events.onProgress?.(summary);
  };

  updateProgress();

  for (const step of steps) {
    events.onNodeStart?.(step.nodeId);
    results[step.nodeId] = {
      state: "running",
      startedAt: Date.now(),
      finishedAt: null,
      duration: 0,
      output: undefined,
    };
    events.onNodeComplete?.(step.nodeId, results[step.nodeId]);

    await sleep(step.latency);

    const finishedAt = Date.now();
    const result: NodeResult = {
      state: step.status === "success" ? "success" : "error",
      startedAt: results[step.nodeId].startedAt,
      finishedAt,
      duration: finishedAt - (results[step.nodeId].startedAt ?? finishedAt),
      output: step.output,
      ...(step.status === "error" ? { error: String((step.output as any)?.error ?? "Step failed") } : {}),
    };
    results[step.nodeId] = result;

    const cfg = getNodeConfig(nodes.find((n) => n.id === step.nodeId)?.data.type ?? "");
    if (step.status === "success") {
      if (String((step.output as any)?.skipped)) {
        skipped++;
        pushLog("warn", cfg.label, step.log);
      } else {
        succeeded++;
        pushLog("success", cfg.label, step.log);
      }
    } else {
      failed++;
      pushLog("error", cfg.label, step.log);
    }

    events.onNodeComplete?.(step.nodeId, result);
    updateProgress();
  }

  const finishedAt = Date.now();
  const summary: ExecutionSummary = {
    state: failed > 0 ? "failed" : "success",
    startedAt,
    finishedAt,
    duration: finishedAt - startedAt,
    totalNodes,
    succeeded,
    failed,
    skipped,
  };

  pushLog(
    failed > 0 ? "error" : "success",
    "engine",
    failed > 0
      ? `Workflow finished with ${failed} failed step${failed === 1 ? "" : "s"} in ${summary.duration}ms`
      : `Workflow completed successfully in ${summary.duration}ms`
  );
  events.onProgress?.(summary);

  return { summary, results, logs };
}
