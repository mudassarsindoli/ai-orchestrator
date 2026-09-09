"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import * as icons from "lucide-react";
import { CATEGORIES, NODE_CATALOG, NODE_ORDER } from "@/lib/nodes";
import type { NodeCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

type IconComponent = React.ComponentType<{
  size?: number;
  className?: string;
  strokeWidth?: number;
}>;

function Icon({ name }: { name: string }) {
  const Comp =
    (icons[name as keyof typeof icons] as IconComponent | undefined) ?? icons.Boxes;
  return <Comp size={16} />;
}

interface NodeLibraryProps {
  open: boolean;
  onClose: () => void;
  onAdd: (type: string, position: { x: number; y: number }) => void;
}

export default function NodeLibrary({ open, onClose, onAdd }: NodeLibraryProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<NodeCategory | "All">("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NODE_ORDER.filter((type) => {
      const c = NODE_CATALOG[type];
      if (activeCategory !== "All" && c.category !== activeCategory) return false;
      if (!q) return true;
      return (
        c.label.toLowerCase().includes(q) ||
        c.service.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    });
  }, [query, activeCategory]);

  const onDragStart = (event: React.DragEvent, type: string) => {
    event.dataTransfer.setData("application/workflow-node", type);
    event.dataTransfer.effectAllowed = "move";
  };

  const addCentered = (type: string) => {
    onAdd(type, {
      x: 300 + Math.round(Math.random() * 200),
      y: 200 + Math.round(Math.random() * 200),
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex justify-end bg-black/20"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-[360px] flex-col border-l border-gray-200 bg-white shadow-xl animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-[14px] font-semibold text-txt">Add Node</h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-txt-secondary transition hover:bg-gray-100 hover:text-txt"
          >
            <X size={15} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-txt-disabled"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search nodes..."
              autoFocus
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-3 pl-8 text-[13px] text-txt outline-none transition placeholder:text-txt-disabled focus:border-ms-blue focus:bg-white focus:ring-1 focus:ring-ms-blue/20"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex shrink-0 gap-1 overflow-x-auto px-4 pt-3 pb-1">
          {(["All", ...CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition",
                activeCategory === cat
                  ? "bg-txt text-white"
                  : "bg-gray-100 text-txt-secondary hover:bg-gray-200 hover:text-txt"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Node list */}
        <div className="mt-2 flex-1 overflow-y-auto px-3 pb-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center text-txt-secondary">
              <Search size={24} className="opacity-30" />
              <p className="text-[13px]">No nodes found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((type) => {
                const c = NODE_CATALOG[type];
                return (
                  <div
                    key={type}
                    draggable
                    onDragStart={(e) => onDragStart(e, type)}
                    onClick={() => addCentered(type)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent p-2.5 transition hover:border-gray-200 hover:bg-gray-50 active:scale-[0.98]"
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: c.color }}
                    >
                      <Icon name={c.icon} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium text-txt">
                        {c.label}
                      </div>
                      <div className="truncate text-[11px] text-txt-secondary">
                        {c.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-200 px-4 py-2.5 text-[11px] text-txt-disabled">
          Click or drag to add to canvas
        </div>
      </div>
    </div>
  );
}
