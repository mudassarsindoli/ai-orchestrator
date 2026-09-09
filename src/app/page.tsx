"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import NodeLibrary from "@/components/NodeLibrary";
import NodeDetailsModal from "@/components/NodeDetailsModal";
import ExecutionPanel from "@/components/ExecutionPanel";
import TemplatesModal from "@/components/TemplatesModal";
import SettingsModal from "@/components/SettingsModal";
import { useWorkflowStore } from "@/hooks/useWorkflowStore";
import { Plus, LayoutTemplate } from "lucide-react";

const FlowCanvas = dynamic(() => import("@/components/flow/FlowCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-txt-secondary">
      Loading canvas...
    </div>
  ),
});

export default function Page() {
  const store = useWorkflowStore();
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState("workflows");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNodeClick = useCallback(
    (id: string) => store.setSelection({ nodeId: id }),
    [store.setSelection]
  );

  const handleNodeDoubleClick = useCallback(
    (id: string) => store.openNodeDetails(id),
    [store.openNodeDetails]
  );

  const handlePaneClick = useCallback(
    () => store.setSelection(null),
    [store.setSelection]
  );

  const handleTestNode = useCallback(() => {
    store.closeNodeDetails();
    store.run();
  }, [store.closeNodeDetails, store.run]);

  const handleRename = useCallback(
    (name: string) => store.updateMeta({ name }),
    [store.updateMeta]
  );

  const handleToggleStatus = useCallback(() => {
    store.updateMeta({
      status: store.workflow.meta.status === "ready" ? "draft" : "ready",
    });
  }, [store.updateMeta, store.workflow.meta.status]);

  const flowProps = useMemo(
    () => ({
      nodes: store.nodes,
      edges: store.edges,
      results: store.workflow.results,
      executionState: store.executionState,
      selectedNodeId: store.selection?.nodeId ?? null,
      onNodesChange: store.onNodesChange,
      onEdgesChange: store.onEdgesChange,
      onConnect: store.onConnect,
      isValidConnection: store.isValidConnection,
      onAddNode: store.addNode,
      onDuplicate: store.duplicateNode,
      onDelete: store.deleteNode,
    }),
    [
      store.nodes,
      store.edges,
      store.workflow.results,
      store.executionState,
      store.selection?.nodeId,
      store.onNodesChange,
      store.onEdgesChange,
      store.onConnect,
      store.isValidConnection,
      store.addNode,
      store.duplicateNode,
      store.deleteNode,
    ]
  );

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-canvas text-txt-secondary">
        Loading workspace...
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-canvas">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
        activeTab={sidebarTab}
        onTabChange={(tab) => {
          setSidebarTab(tab);
          if (tab === "templates") setShowTemplates(true);
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          workflow={store.workflow}
          isRunning={store.runnerActive}
          onRun={store.run}
          onReset={store.resetExecution}
          onRename={handleRename}
          onToggleStatus={handleToggleStatus}
          onOpenTemplates={() => setShowTemplates(true)}
        />

        <div className="relative min-h-0 flex-1">
          <button
            onClick={() => store.setNodeLibraryOpen(true)}
            className="absolute left-3 top-3 z-10 flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-[12px] font-medium text-txt shadow-sm transition hover:bg-gray-50"
          >
            <Plus size={15} />
            Add node
          </button>

          <FlowCanvas
            {...flowProps}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            onPaneClick={handlePaneClick}
          />

          {store.workflow.nodes.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-xl border border-gray-200 bg-white px-10 py-8 text-center shadow-lg">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-ms-blue-50">
                  <LayoutTemplate size={26} className="text-ms-blue" />
                </div>
                <h2 className="mb-1 text-[16px] font-semibold text-txt">
                  Build your first workflow
                </h2>
                <p className="max-w-sm text-[13px] leading-relaxed text-txt-secondary">
                  Add nodes to the canvas and connect them to create automated workflows.
                  Start with a trigger, then add actions and logic.
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    onClick={() => store.setNodeLibraryOpen(true)}
                    className="pointer-events-auto rounded-lg bg-ms-blue px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-ms-blue-hover"
                  >
                    Add first step
                  </button>
                  <button
                    onClick={() => setShowTemplates(true)}
                    className="pointer-events-auto rounded-lg border border-gray-200 bg-white px-4 py-2 text-[13px] font-medium text-txt transition hover:bg-gray-50"
                  >
                    Browse templates
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <ExecutionPanel
          workflow={store.workflow}
          nodes={store.nodes}
          isRunning={store.runnerActive}
          executionState={store.executionState}
          onReset={store.resetExecution}
          onClearLogs={store.clearLogs}
        />
      </div>

      <NodeLibrary
        open={store.nodeLibraryOpen}
        onClose={() => store.setNodeLibraryOpen(false)}
        onAdd={store.addNode}
      />

      <NodeDetailsModal
        open={store.nodeDetailsOpen}
        node={store.nodeDetailsNode}
        upstreamNodes={store.upstreamNodes}
        results={store.workflow.results}
        onClose={store.closeNodeDetails}
        onUpdate={store.updateNodeConfig}
        onRename={store.renameNode}
        onDelete={store.deleteNode}
        onTestNode={handleTestNode}
      />

      <TemplatesModal
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onUse={store.loadTemplate}
      />
      <SettingsModal
        open={showSettings}
        workflow={store.workflow}
        onClose={() => setShowSettings(false)}
        onNew={store.newWorkflow}
      />
    </div>
  );
}
