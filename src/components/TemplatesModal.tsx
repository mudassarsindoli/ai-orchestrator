"use client";

import { useState } from "react";
import {
  X,
  ArrowRight,
  Workflow as WorkflowIcon,
} from "lucide-react";
import * as icons from "lucide-react";
import { TEMPLATES } from "@/lib/templates";
import { cn } from "@/lib/utils";

type IconComponent = React.ComponentType<{
  size?: number;
  className?: string;
}>;

function Icon({ name }: { name: string }) {
  const Comp =
    (icons[name as keyof typeof icons] as IconComponent | undefined) ??
    WorkflowIcon;
  return <Comp size={18} />;
}

interface TemplatesModalProps {
  open: boolean;
  onClose: () => void;
  onUse: (build: () => import("@/lib/types").Workflow) => void;
}

export default function TemplatesModal({
  open,
  onClose,
  onUse,
}: TemplatesModalProps) {
  const [confirming, setConfirming] = useState<string | null>(null);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[82vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-bline bg-surface shadow-ms-lg animate-fade-in"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-bline px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ms-blue-50 text-ms-blue">
            <WorkflowIcon size={18} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-txt">
              Workflow Templates
            </h2>
            <p className="text-[12px] text-txt-secondary">
              Start with a pre-built workflow and customize it.
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded text-txt-secondary transition hover:bg-surface-dim hover:text-txt"
          >
            <X size={16} />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-3 overflow-y-auto p-5 sm:grid-cols-2">
          {TEMPLATES.map((tpl) => {
            const conf = confirming === tpl.id;
            return (
              <div
                key={tpl.id}
                className="group flex flex-col overflow-hidden rounded-lg border border-bline bg-white transition hover:border-ms-blue/40"
              >
                {/* Pipeline preview */}
                <div className="flex items-center gap-1 overflow-x-auto bg-surface-dim px-4 py-3">
                  {tpl.steps.slice(0, 5).map((step, i) => (
                    <div key={i} className="flex shrink-0 items-center gap-1">
                      <div className="flex items-center gap-1.5 rounded border border-bline bg-white px-2 py-1">
                        <div
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: tpl.accent }}
                        />
                        <span className="text-[10px] font-medium text-txt">
                          {step.split(" ")[0]}
                        </span>
                      </div>
                      {i < tpl.steps.length - 1 && (
                        <ArrowRight size={12} className="shrink-0 text-txt-disabled" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${tpl.accent}14`, color: tpl.accent }}
                    >
                      <Icon name={tpl.icon} />
                    </div>
                    <div>
                      <div className="text-[13.5px] font-semibold text-txt">
                        {tpl.name}
                      </div>
                      <div
                        className="text-[11px]"
                        style={{ color: tpl.accent }}
                      >
                        {tpl.tagline}
                      </div>
                    </div>
                    <span className="ml-auto shrink-0 rounded border border-bline bg-surface-dim px-2 py-0.5 text-[10px] text-txt-secondary">
                      {tpl.nodeCount} nodes
                    </span>
                  </div>

                  <p className="mt-3 flex-1 text-[12px] leading-relaxed text-txt-secondary">
                    {tpl.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2 border-t border-bline pt-3">
                    <span className="text-[10px] font-medium text-txt-disabled">
                      {tpl.category}
                    </span>
                    <button
                      onClick={() => {
                        if (conf) {
                          onUse(tpl.build);
                          onClose();
                        } else {
                          setConfirming(tpl.id);
                        }
                      }}
                      className={cn(
                        "ml-auto flex items-center gap-1.5 rounded px-3 py-1.5 text-[12px] font-semibold transition",
                        conf
                          ? "bg-success text-white hover:bg-success/90"
                          : "bg-ms-blue text-white hover:bg-ms-blue-hover"
                      )}
                    >
                      {conf ? (
                        <>
                          <WorkflowIcon size={13} /> Confirm
                        </>
                      ) : (
                        "Use Template"
                      )}
                    </button>
                  </div>
                  {conf && (
                    <div className="mt-2 text-right text-[10.5px] text-txt-secondary">
                      This will replace the current canvas.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
