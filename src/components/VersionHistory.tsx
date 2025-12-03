// src/components/VersionHistory.tsx
import React from "react";
import type { Editor } from "@tiptap/react";
import { v4 as uuidv4 } from "uuid";
import type { Snapshot } from "../utils/history";
import { loadHistory, saveSnapshot, deleteSnapshot } from "../utils/history";
import {
  PlusCircle,
  RotateCw,
  Trash2,
  ChevronRight,
  FileText,
} from "lucide-react";
import "../styles/version-history.css";

type Props = { editor: Editor | null };

const formatTs = (ts: number) => new Date(ts).toLocaleString();

const VersionHistory: React.FC<Props> = ({ editor }) => {
  const [list, setList] = React.useState<Snapshot[]>([]);

  // load once
  React.useEffect(() => {
    setList(loadHistory());
  }, []);

  // refresh on global event (RightPanel fallback deletion dispatches this)
  React.useEffect(() => {
    const handler = () => setList(loadHistory());
    window.addEventListener("snapshotsCleared", handler);
    return () => window.removeEventListener("snapshotsCleared", handler);
  }, []);

  const createSnapshot = () => {
    if (!editor) return;
    const snapshot: Snapshot = {
      id: uuidv4(),
      ts: Date.now(),
      title: `Snapshot ${new Date().toLocaleString()}`,
      content: editor.getJSON(),
    };
    saveSnapshot(snapshot);
    setList(loadHistory());
    alert("Snapshot saved");
  };

  const restore = (s: Snapshot) => {
    if (!editor) return;
    if (!confirm(`Restore snapshot from ${formatTs(s.ts)}? This will replace current content.`)) return;
    editor.chain().focus().setContent(s.content).run();
    alert("Restored snapshot");
  };

  const remove = (id: string) => {
    if (!confirm("Delete this snapshot?")) return;
    deleteSnapshot(id);
    setList(loadHistory());
  };

  const clearAll = () => {
    if (!confirm("Clear all snapshots? This will remove all saved snapshots.")) return;
    localStorage.removeItem("craftsy-doc-history");
    setList([]);
    window.dispatchEvent(new Event("snapshotsCleared"));
  };

  if (!editor) return null;

  return (
    <div className="vh-card">
      <div className="vh-header">
        <div>
          <h4 className="vh-title">History</h4>
          <div className="vh-sub">Saved snapshots</div>
        </div>

        <div className="vh-actions">
          <button className="vh-btn primary" onClick={createSnapshot} title="Save snapshot">
            <PlusCircle size={14} />
            <span>Save</span>
          </button>

          <button className="vh-btn ghost" onClick={() => setList(loadHistory())} title="Refresh list">
            <RotateCw size={14} />
          </button>

          <button className="vh-btn outline-ghost" onClick={clearAll} title="Clear all">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="vh-list">
        {list.length === 0 ? (
          <div className="vh-empty">
            <FileText size={20} />
            <div className="vh-empty-text">No snapshots</div>
            <div className="vh-empty-sub">Click Save to create your first snapshot.</div>
          </div>
        ) : (
          list.map((s) => (
            <div key={s.id} className="vh-item">
              <div className="vh-item-main">
                <div className="vh-item-title">{s.title}</div>
                <div className="vh-item-ts">{formatTs(s.ts)}</div>
              </div>

              <div className="vh-item-actions">
                <button className="vh-icon-btn" title="Restore" onClick={() => restore(s)}>
                  <ChevronRight size={14} />
                </button>

                <button className="vh-icon-btn danger" title="Delete" onClick={() => remove(s.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VersionHistory;
