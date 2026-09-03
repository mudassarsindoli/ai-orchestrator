import type { Workflow } from "./types";

export const STORAGE_KEY = "workflow.current.v1";
export const AUTO_SAVE_KEY = "workflow.autosave.v1";

export function loadSession(key: string): unknown | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

export function saveSession(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

export function removeSession(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function isAutosaveEnabled(): boolean {
  const raw = loadSession(AUTO_SAVE_KEY);
  return raw === null ? true : raw === true;
}

export function setAutosaveEnabled(enabled: boolean): void {
  saveSession(AUTO_SAVE_KEY, enabled);
}

export function loadWorkflow(): Workflow | null {
  return loadSession(STORAGE_KEY) as Workflow | null;
}

export function saveWorkflow(workflow: Workflow): void {
  saveSession(STORAGE_KEY, workflow);
}

export function clearWorkflow(): void {
  removeSession(STORAGE_KEY);
}
