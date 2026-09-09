"use client";

import {
  Workflow,
  LayoutTemplate,
  History,
  KeyRound,
  Brain,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type IconComponent = React.ComponentType<{
  size?: number;
  className?: string;
  strokeWidth?: number;
}>;

interface NavItem {
  icon: IconComponent;
  label: string;
  key: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: Workflow, label: "Workflows", key: "workflows" },
  { icon: LayoutTemplate, label: "Templates", key: "templates" },
  { icon: History, label: "Executions", key: "executions" },
  { icon: KeyRound, label: "Credentials", key: "credentials" },
  { icon: Brain, label: "AI Models", key: "ai-models" },
  { icon: Settings, label: "Settings", key: "settings" },
];

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({
  open,
  onToggle,
  activeTab,
  onTabChange,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-bline bg-surface transition-[width] duration-200",
        open ? "w-[240px]" : "w-[48px]"
      )}
    >
      {/* Brand */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-bline px-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-ms-blue">
          <Workflow size={14} className="text-white" strokeWidth={2.5} />
        </div>
        {open && (
          <div className="flex flex-col">
            <span className="truncate text-[13px] font-bold text-txt leading-tight">
              Orchestrate
            </span>
            <span className="text-[9px] font-medium text-txt-disabled uppercase tracking-wider leading-none">
              AI Workflow Builder
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={cn(
                "group flex w-full items-center gap-2.5 px-3 py-2 text-[13px] transition",
                open ? "mx-1 w-[calc(100%-8px)] rounded" : "justify-center",
                active
                  ? "bg-ms-blue-50 font-medium text-ms-blue"
                  : "text-txt-secondary hover:bg-surface-dim hover:text-txt"
              )}
              title={item.label}
            >
              <Icon
                size={18}
                className={cn(
                  "shrink-0",
                  active ? "text-ms-blue" : "text-txt-secondary group-hover:text-txt"
                )}
              />
              {open && <span className="truncate">{item.label}</span>}
              {active && open && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-ms-blue" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="shrink-0 border-t border-bline p-2">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded py-1.5 text-[12px] text-txt-secondary transition hover:bg-surface-dim hover:text-txt"
          title={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          {open ? (
            <>
              <ChevronsLeft size={15} />
              <span>Collapse</span>
            </>
          ) : (
            <ChevronsRight size={15} />
          )}
        </button>
      </div>
    </aside>
  );
}
