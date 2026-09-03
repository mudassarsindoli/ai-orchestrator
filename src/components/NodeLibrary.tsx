"use client";

import { useMemo, useState } from "react";
import { Search, Plus, Boxes, X } from "lucide-react";
import * as icons from "lucide-react";
import { CATEGORIES, NODE_CATALOG, NODE_ORDER } from "@/lib/nodes";
import type { NodeCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

type IconComponent = React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

function Icon({ name }: { name: string }) {
  const Comp = (icons[name as keyof typeof icons] as IconComponent | undefined) ?? Boxes;
  return <Comp size={15} />;
}

interface NodeLibraryProps {
  onAdd: (type: string, position: { x: number; y: number }) => void;
}

export default function NodeLibrary({ onAdd }: NodeLibraryProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<NodeCategory | "All">(
    "All"
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NODE_ORDER.filter((type) => {
      const c = NODE_CATALOG[type];
      if (activeCategory !== "All" && c.category !== activeCategory) return false;
      if (!q) return true;
      return (
        c.label.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
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
      x: Math.round(300 + Math.random() * 120),
      y: Math.round(200 + Math.random() * 120),
    });
  };

  return (
    <div className="flex h-full w-full flex-col bg-canvas-deep/80">
      <div className="shrink-0 px-3 pt-3">
        <div className="relative">
          <Search
            size={13}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-slate-500"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes…"
            className="w-full rounded-lg border border-panel-line bg-panel py-1.5 pr-7 pl-8 text-[12.5px] text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-accent/50"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* categories */}
      <div className="mt-2 flex shrink-0 flex-wrap gap-1 px-3">
        {(["All", ...CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium transition",
              activeCategory === cat
                ? "bg-accent/20 text-accent-soft"
                : "text-slate-400 hover:bg-panel hover:text-slate-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* list */}
      <div className="mt-2 flex-1 overflow-y-auto px-2 pb-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center text-slate-500">
            <Boxes size={22} className="opacity-40" />
            <p className="text-[12px]">No nodes match “{query}”.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((type, i) => {
              const c = NODE_CATALOG[type];
              return (
                <div
                  key={type}
                  draggable
                  onDragStart={(e) => onDragStart(e, type)}
                  onDoubleClick={() => addCentered(type)}
                  style={{ transitionDelay: `${Math.min(i * 12, 200)}ms` }}
                  className="group animate-fade-in cursor-grab rounded-xl border border-transparent bg-transparent p-2 transition hover:border-panel-line hover:bg-panel active:cursor-grabbing"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${c.accent}1a`, color: c.accent }}
                    >
                      <Icon name={c.icon} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-medium text-slate-100">
                        {c.label}
                      </div>
                      <div className="truncate text-[10.5px] text-slate-500">
                        {c.category}
                      </div>
                    </div>
                    <button
                      onClick={() => addCentered(type)}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-accent/15 hover:text-accent-soft"
                      title={`Add ${c.label}`}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-panel-line px-3 py-2 text-[10.5px] text-slate-500">
        <span className="font-medium text-slate-400">{filtered.length}</span>{" "}
        nodes · Drag onto canvas or double-click
      </div>
    </div>
  );
}
