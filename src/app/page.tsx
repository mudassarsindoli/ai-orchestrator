"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import TopBar from "@/components/TopBar";
import NodeLibrary from "@/components/NodeLibrary";
import ConfigPanel from "@/components/ConfigPanel";
import ExecutionPanel from "@/components/ExecutionPanel";
import TemplatesModal from "@/components/TemplatesModal";
import JsonModal from "@/components/JsonModal";
import SettingsModal from "@/components/SettingsModal";
import { useWorkflowStore } from "@/hooks/useWorkflowStore";
import { cn } from "@/lib/utils";
import { PanelRight, ChevronRight } from "lucide-react";

const FlowCanvas = dynamic(() => import("@/components/flow/FlowCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-slate-500">
      Loading canvas…
    </div>
  ),
});

export default function Page() {
  const store = useWorkflowStore();
  const [showTemplates, setShowTemplates] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [configOpen, setConfigOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { workflow } = store;

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-canvas text-slate-500">
        Loading workspace…
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-canvas text-slate-200">
      <TopBar
        workflow={workflow}
        isRunning={store.runnerActive}
        onRun={store.run}
        onReset={store.resetExecution}
        onRename={(name) => store.updateMeta({ name })}
        onToggleStatus={() =>
          store.updateMeta({
            status: workflow.meta.status === "ready" ? "draft" : "ready",
          })
        }
        onOpenJson={() => setShowJson(true)}
        onOpenTemplates={() => setShowTemplates(true)}
        onToggleSettings={() => setShowSettings(true)}
      />

      <div className="flex min-h-0 flex-1">
        {/* left library */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 264, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 overflow-hidden border-r border-panel-line"
            >
              <NodeLibrary onAdd={store.addNode} />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* toggle collapsers */}
        <div className="flex w-6 shrink-0 flex-col items-center justify-start gap-1 border-r border-panel-line bg-canvas-deep py-2">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            title="Toggle node library"
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-panel hover:text-white",
              !sidebarOpen && "rotate-180"
            )}
          >
            <ChevronRight size={13} />
          </button>
          <div className="h-px w-4 bg-panel-line" />
          <button
            onClick={() => setConfigOpen((o) => !o)}
            title="Toggle inspector"
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md text-slate-400 transition hover:bg-panel hover:text-white",
              !configOpen && "rotate-180"
            )}
          >
            <PanelRight size={13} />
          </button>
        </div>

        {/* center canvas */}
        <div className="relative min-w-0 flex-1">
          <FlowCanvas
            nodes={store.nodes}
            edges={store.edges}
            results={workflow.results}
            executionState={store.executionState}
            selectedNodeId={store.selection?.nodeId ?? null}
            onNodesChange={store.onNodesChange}
            onEdgesChange={store.onEdgesChange}
            onConnect={store.onConnect}
            onNodeClick={(id) => {
              store.setSelection({ nodeId: id });
              if (!configOpen) setConfigOpen(true);
            }}
            onPaneClick={() => store.setSelection(null)}
            onAddNode={store.addNode}
            onDuplicate={store.duplicateNode}
            onDelete={store.deleteNode}
          />

          {/* empty state hint */}
          {workflow.nodes.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-xl border border-panel-line bg-canvas-deep/80 px-6 py-5 text-center backdrop-blur">
                <div className="mb-2 text-[13px] font-semibold text-slate-300">
                  Your canvas is empty
                </div>
                <p className="max-w-xs text-[12px] leading-relaxed text-slate-500">
                  Drag nodes from the library onto the canvas, or load a
                  template to get started quickly.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* right config panel */}
        <AnimatePresence initial={false}>
          {configOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 overflow-hidden border-l border-panel-line"
            >
              <ConfigPanel
                node={store.selectedNode}
                onUpdate={store.updateNodeConfig}
                onRename={store.renameNode}
                onDuplicate={store.duplicateNode}
                onDelete={store.deleteNode}
                onClose={() => {
                  setConfigOpen(false);
                  store.setSelection(null);
                }}
                executionState={store.executionState}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <ExecutionPanel
        workflow={workflow}
        nodes={store.nodes}
        isRunning={store.runnerActive}
        executionState={store.executionState}
        onReset={store.resetExecution}
        onClearLogs={store.clearLogs}
      />

      <TemplatesModal
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onUse={store.loadTemplate}
      />
      <JsonModal
        open={showJson}
        workflow={workflow}
        onClose={() => setShowJson(false)}
      />
      <SettingsModal
        open={showSettings}
        workflow={workflow}
        onClose={() => setShowSettings(false)}
        onNew={store.newWorkflow}
      />
    </div>
  );
}
