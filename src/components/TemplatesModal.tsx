"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ArrowRight,
  Sparkles,
  Workflow as WorkflowIcon,
} from "lucide-react";
import * as icons from "lucide-react";
import { TEMPLATES } from "@/lib/templates";
import { cn } from "@/lib/utils";

type IconComponent = React.ComponentType<{ size?: number; className?: string }>;

function Icon({ name }: { name: string }) {
  const Comp = (icons[name as keyof typeof icons] as IconComponent | undefined) ?? WorkflowIcon;
  return <Comp size={18} />;
}

interface TemplatesModalProps {
  open: boolean;
  onClose: () => void;
  onUse: (build: () => import("@/lib/types").Workflow) => void;
}

export default function TemplatesModal({ open, onClose, onUse }: TemplatesModalProps) {
  const [confirming, setConfirming] = useState<string | null>(null);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[82vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-panel-line bg-[#0e1117] shadow-2xl"
          >
            {/* header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-panel-line px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-slate-100">
                  Workflow Templates
                </h2>
                <p className="text-[12px] text-slate-500">
                  One-click business workflows you can customize before running.
                </p>
              </div>
              <button
                onClick={onClose}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-panel hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* grid */}
            <div className="grid grid-cols-1 gap-3 overflow-y-auto p-5 sm:grid-cols-2">
              {TEMPLATES.map((tpl, idx) => {
                const conf = confirming === tpl.id;
                return (
                  <motion.div
                    key={tpl.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="group flex flex-col overflow-hidden rounded-xl border border-panel-line bg-panel transition hover:border-accent/40"
                  >
                    {/* preview pipeline */}
                    <div
                      className="flex items-center gap-1 overflow-x-auto px-4 py-4"
                      style={{ background: "linear-gradient(180deg,#141824,#10131a)" }}
                    >
                      {tpl.steps.slice(0, 5).map((step, i) => (
                        <div key={i} className="flex shrink-0 items-center gap-1">
                          <div className="flex items-center gap-1.5 rounded-lg border border-panel-line bg-canvas-deep px-2 py-1.5">
                            <div
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: tpl.accent }}
                            />
                            <span className="text-[10px] font-medium text-slate-300">
                              {step.split(" ")[0]}
                            </span>
                          </div>
                          {i < tpl.steps.length - 1 && (
                            <ArrowRight size={12} className="shrink-0 text-slate-600" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* body */}
                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: `${tpl.accent}1a`, color: tpl.accent }}
                        >
                          <Icon name={tpl.icon} />
                        </div>
                        <div>
                          <div className="text-[13.5px] font-semibold text-slate-100">
                            {tpl.name}
                          </div>
                          <div className="text-[11px]" style={{ color: tpl.accent }}>
                            {tpl.tagline}
                          </div>
                        </div>
                        <span className="ml-auto shrink-0 rounded-full border border-panel-line bg-canvas-deep px-2 py-0.5 text-[10px] text-slate-500">
                          {tpl.nodeCount} nodes
                        </span>
                      </div>

                      <p className="mt-3 flex-1 text-[12px] leading-relaxed text-slate-400">
                        {tpl.description}
                      </p>

                      <div className="mt-4 flex items-center gap-2 border-t border-panel-line pt-3">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
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
                            "ml-auto flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold shadow-md transition",
                            conf
                              ? "bg-emerald-500 text-white hover:bg-emerald-400"
                              : "bg-accent text-white hover:bg-accent-soft"
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
                        <div className="mt-2 text-right text-[10.5px] text-slate-500">
                          Loading will replace the current canvas.
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
