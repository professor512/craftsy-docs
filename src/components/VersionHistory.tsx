// src/components/VersionHistory.tsx
import React from "react";
import type { Editor } from "@tiptap/react";
import { v4 as uuidv4 } from "uuid";
import type { Snapshot } from "../utils/history";
import { loadHistory, saveSnapshot, deleteSnapshot } from "../utils/history";


type Props = { editor: Editor | null };

const formatTs = (ts: number) => new Date(ts).toLocaleString();

const VersionHistory: React.FC<Props> = ({ editor }) => {
  const [list, setList] = React.useState<Snapshot[]>([]);

  React.useEffect(() => {
    setList(loadHistory());
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

  if (!editor) return null;

  return (
    <div className="version-history">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h4 style={{ margin: 0 }}>History</h4>
        <div>
          <button onClick={createSnapshot} className="save-button" style={{ marginRight: 8 }}>
            Save Snapshot
          </button>
          <button
            className="save-button"
            onClick={() => {
              if (!confirm("Clear all snapshots?")) return;
              localStorage.removeItem("craftsy-doc-history");
              setList([]);
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        {list.length === 0 ? (
          <div style={{ color: "#6b7280" }}>No snapshots</div>
        ) : (
          list.map((s) => (
            <div key={s.id} style={{ padding: 8, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{formatTs(s.ts)}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => restore(s)} className="toolbar-button">Restore</button>
                <button onClick={() => remove(s.id)} className="toolbar-button">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VersionHistory;
