"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import type {
  EditorSelection,
  ExecutionState,
  LogEntry,
  NodeResult,
  Workflow,
  WorkflowEdge,
  WorkflowNode,
} from "@/lib/types";
import {
  emptyWorkflow,
  buildNode,
  linkEdges,
  initialConfigFor,
} from "@/lib/factory";
import { getNodeConfig } from "@/lib/nodes";
import { runEngine, type EngineEvents } from "@/lib/execution";
import {
  loadWorkflow,
  saveWorkflow,
  clearWorkflow,
  isAutosaveEnabled,
} from "@/lib/session";
import { uid } from "@/lib/utils";

const SAMPLE_STARTER = true;

export function useWorkflowStore() {
  const [workflow, setWorkflow] = useState<Workflow>(() => {
    const loaded = loadWorkflow();
    if (loaded && loaded.nodes && loaded.meta) return loaded;
    const wf = emptyWorkflow("Untitled Workflow");
    if (SAMPLE_STARTER) {
      const trigger = buildNode({
        id: "starter-manual",
        type: "manual",
        position: { x: 320, y: 240 },
      });
      const hello = buildNode({
        id: "starter-llm",
        type: "llm",
        position: { x: 620, y: 240 },
      });
      wf.nodes = [trigger, hello];
      wf.edges = linkEdges(
        [{ source: "starter-manual", target: "starter-llm" }],
        new Set()
      );
    }
    return wf;
  });

  const [selection, setSelection] = useState<EditorSelection>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [runnerActive, setRunnerActive] = useState(false);
  const [activeEdgeIds, setActiveEdgeIds] = useState<Set<string>>(new Set());
  const abortRef = useRef<AbortController | null>(null);
  const workflowRef = useRef(workflow);
  workflowRef.current = workflow;

  // ── Persistence ────────────────────────────────────────────
  const autosave = useMemo(() => {
    if (typeof window === "undefined") return true;
    return isAutosaveEnabled();
  }, []);

  useEffect(() => {
    if (!autosave) return;
    saveWorkflow(workflow);
  }, [workflow, autosave]);

  // ── Derived node/edge arrays for React Flow ────────────────
  const nodes = workflow.nodes;
  const edges = workflow.edges;

  const onNodesChange = useCallback(
    (changes: NodeChange<WorkflowNode>[]) => {
      const next = applyNodeChanges(changes, workflowRef.current.nodes);
      setWorkflow((wf) => ({ ...wf, nodes: next }));
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<WorkflowEdge>[]) => {
      const next = applyEdgeChanges(changes, workflowRef.current.edges);
      setWorkflow((wf) => ({ ...wf, edges: next }));
    },
    []
  );

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return;
    setWorkflow((wf) => {
      // reject duplicate or self connections
      const exists = wf.edges.some(
        (e) =>
          e.source === connection.source &&
          e.target === connection.target &&
          ((connection.sourceHandle && e.sourceHandle === connection.sourceHandle) ||
            !connection.sourceHandle) &&
          ((connection.targetHandle && e.targetHandle === connection.targetHandle) ||
            !connection.targetHandle)
      );
      if (exists || connection.source === connection.target) return wf;
      const cfg = getNodeConfig(
        wf.nodes.find((n) => n.id === connection.source)?.data.type ?? ""
      );
      const label =
        connection.sourceHandle && connection.sourceHandle !== "out" &&
        connection.sourceHandle !== "run" &&
        connection.sourceHandle !== "tick"
          ? connection.sourceHandle
          : undefined;
      const edge = {
        ...connection,
        id: `e-${uid()}`,
        type: "workflow",
        ...(label ? { label } : {}),
      };
      return { ...wf, edges: addEdge(edge as any, wf.edges as any) };
    });
  }, []);

  // ── Node config updates (right panel edits) ───────────────
  const updateNodeConfig = useCallback(
    (nodeId: string, key: string, value: unknown) => {
      setWorkflow((wf) => ({
        ...wf,
        nodes: wf.nodes.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, config: { ...n.data.config, [key]: value } } }
            : n
        ),
      }));
    },
    []
  );

  const renameNode = useCallback((nodeId: string, label: string) => {
    setWorkflow((wf) => ({
      ...wf,
      nodes: wf.nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                label,
                config: { ...n.data.config, label },
              },
            }
          : n
      ),
    }));
  }, []);

  // ── Add node from library ─────────────────────────────────
  const addNode = useCallback(
    (type: string, position: { x: number; y: number }) => {
      const node = buildNode({ type, position });
      setWorkflow((wf) => ({ ...wf, nodes: [...wf.nodes, node] }));
      setSelection({ nodeId: node.id });
      return node.id;
    },
    []
  );

  // ── Duplicate ─────────────────────────────────────────────
  const duplicateNode = useCallback((nodeId: string) => {
    setWorkflow((wf) => {
      const src = wf.nodes.find((n) => n.id === nodeId);
      if (!src) return wf;
      const copy = buildNode({
        type: src.data.type,
        position: { x: src.position.x + 60, y: src.position.y + 60 },
        config: src.data.config,
      });
      copy.data.label = `${src.data.label} (copy)`;
      copy.data.config = { ...src.data.config, label: copy.data.label };
      const newEdges = wf.edges.map((e) =>
        e.source === nodeId
          ? { ...e, id: `e-${uid()}`, source: copy.id }
          : e
      );
      return { ...wf, nodes: [...wf.nodes, copy], edges: newEdges };
    });
  }, []);

  // ── Delete ────────────────────────────────────────────────
  const deleteNode = useCallback((nodeId: string) => {
    setWorkflow((wf) => {
      const edges = wf.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      );
      return { ...wf, nodes: wf.nodes.filter((n) => n.id !== nodeId), edges };
    });
    setSelection(null);
  }, []);

  // ── Template load ─────────────────────────────────────────
  const loadTemplate = useCallback((build: () => Workflow) => {
    if (abortRef.current) abortRef.current.abort();
    const tpl = build();
    tpl.execution = emptyWorkflow().execution;
    tpl.logs = [];
    tpl.results = {};
    tpl.meta.id = uid("wf");
    setWorkflow(tpl);
    setSelection(null);
    setActiveEdgeIds(new Set());
    setRunnerActive(false);
    setRunId(null);
  }, []);

  // ── Reset canvas (new) ────────────────────────────────────
  const newWorkflow = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setWorkflow(emptyWorkflow("Untitled Workflow"));
    setSelection(null);
    setActiveEdgeIds(new Set());
    setRunnerActive(false);
    setRunId(null);
    clearWorkflow();
  }, []);

  const updateMeta = useCallback(
    (patch: Partial<Workflow["meta"]>) => {
      setWorkflow((wf) => ({
        ...wf,
        meta: { ...wf.meta, ...patch, updatedAt: Date.now() },
      }));
    },
    []
  );

  // ── Run ───────────────────────────────────────────────────
  const run = useCallback(
    async (opts: { seedFail?: boolean } = {}) => {
      if (runnerActive) return;
      if (workflowRef.current.nodes.length === 0) return;
      if (abortRef.current) abortRef.current.abort();

      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const runKey = uid("run");
      setRunId(runKey);
      setRunnerActive(true);
      setActiveEdgeIds(new Set());

      // reset old results
      setWorkflow((wf) => ({
        ...wf,
        results: {},
        logs: [],
        execution: {
          state: "running",
          startedAt: Date.now(),
          finishedAt: null,
          duration: 0,
          totalNodes: wf.nodes.length,
          succeeded: 0,
          failed: 0,
          skipped: 0,
        },
      }));

      const snapshot = {
        nodes: workflowRef.current.nodes,
        edges: workflowRef.current.edges,
      };

      const events: EngineEvents = {
        onNodeStart: (nodeId: string) => {
          if (ctrl.signal.aborted) return;
          setWorkflow((wf) => ({
            ...wf,
            results: {
              ...wf.results,
              [nodeId]: {
                ...(wf.results[nodeId] ?? {}),
                state: "running",
                startedAt: Date.now(),
              },
            },
          }));
        },
        onNodeComplete: (nodeId: string, result: NodeResult) => {
          if (ctrl.signal.aborted) return;
          setWorkflow((wf) => ({ ...wf, results: { ...wf.results, [nodeId]: result } }));
        },
        onLog: (entry: LogEntry) => {
          if (ctrl.signal.aborted) return;
          setWorkflow((wf) => ({
            ...wf,
            logs: [...wf.logs, entry].slice(-400),
          }));
        },
        onProgress: (summary) => {
          if (ctrl.signal.aborted) return;
          setWorkflow((wf) => ({ ...wf, execution: summary }));
        },
      };

      try {
        const { summary } = await runEngine(
          snapshot.nodes,
          snapshot.edges,
          events,
          opts
        );
        setActiveEdgeIds(new Set());
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setWorkflow((wf) => ({
          ...wf,
          execution: { ...wf.execution, state: "failed" },
        }));
      } finally {
        if (!ctrl.signal.aborted) setRunnerActive(false);
        abortRef.current = null;
      }
    },
    [runnerActive]
  );

  const resetExecution = useCallback(() => {
    setWorkflow((wf) => ({
      ...wf,
      results: {},
      logs: [],
      execution: emptyWorkflow().execution,
    }));
    setActiveEdgeIds(new Set());
  }, []);

  const clearLogs = useCallback(() => {
    setWorkflow((wf) => ({ ...wf, logs: [] }));
  }, []);

  const executionState: ExecutionState =
    !runnerActive && workflow.execution.state === "running"
      ? "idle"
      : workflow.execution.state;

  const selectedNode = selection
    ? workflow.nodes.find((n) => n.id === selection.nodeId) ?? null
    : null;

  return {
    workflow,
    nodes,
    edges,
    selection,
    selectedNode,
    setSelection,
    onNodesChange,
    onEdgesChange,
    onConnect,
    updateNodeConfig,
    renameNode,
    addNode,
    duplicateNode,
    deleteNode,
    loadTemplate,
    newWorkflow,
    updateMeta,
    run,
    resetExecution,
    clearLogs,
    runnerActive,
    executionState,
    runId,
  };
}
