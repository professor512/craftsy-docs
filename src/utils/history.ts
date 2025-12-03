// src/utils/history.ts
export type Snapshot = {
  id: string; // uuid or timestamp
  ts: number;
  title?: string;
  content: any; // ProseMirror JSON
};

const KEY = "craftsy-doc-history";

export const loadHistory = (): Snapshot[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Snapshot[];
  } catch {
    return [];
  }
};

export const saveSnapshot = (snapshot: Snapshot) => {
  const list = loadHistory();
  list.unshift(snapshot); // newest first
  // keep last 50 snapshots
  const sliced = list.slice(0, 50);
  localStorage.setItem(KEY, JSON.stringify(sliced));
};

export const clearHistory = () => {
  localStorage.removeItem(KEY);
};

export const deleteSnapshot = (id: string) => {
  const list = loadHistory().filter((s) => s.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
};
