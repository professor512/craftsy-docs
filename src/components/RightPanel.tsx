// src/components/RightPanel.tsx
import React from "react";
import ReactDOM from "react-dom";
import type { Editor } from "@tiptap/react";
import {
  Save,
  FilePlus,
  DownloadCloud,
  UploadCloud,
  Trash2,
  Clock,
  ChevronDown,
  X as IconX,
} from "lucide-react";
import VersionHistory from "./VersionHistory";
import "../styles/right-panel.css";

type Props = {
  editor: Editor | null;
  handleSave: () => void;
  handleInsertTemplate: () => void;
  handleExportMD: () => void;
  handleExportHTML: () => void;
  handlePrintPdf: () => void;
  handleExportDocx: () => void;
  handleImportMD: () => void;
  handleDeleteAllSnapshots?: () => void;
};

/* Portal Modal (renders into document.body) */
const Modal: React.FC<{
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, open, onClose, children }) => {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return ReactDOM.createPortal(
    <div className="rp-modal-overlay" onMouseDown={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div
        className="rp-modal"
        onMouseDown={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="rp-modal-header">
          <div className="rp-modal-title">{title}</div>
          <button className="rp-modal-close" onClick={onClose} aria-label="Close">
            <IconX size={16} />
          </button>
        </div>

        <div className="rp-modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
};

const RightPanel: React.FC<Props> = ({
  editor,
  handleSave,
  handleInsertTemplate,
  handleExportMD,
  handleExportHTML,
  handlePrintPdf,
  handleExportDocx,
  handleImportMD,
  handleDeleteAllSnapshots,
}) => {
  const [exportOpen, setExportOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [showSnapshots, setShowSnapshots] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const node = panelRef.current;
      if (!node) return;
      if (!node.contains(e.target as Node)) {
        setExportOpen(false);
        setImportOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const deleteAllSnapshots = () => {
    const ok = window.confirm("Delete all snapshots? This action cannot be undone. Are you sure?");
    if (!ok) return;

    if (typeof handleDeleteAllSnapshots === "function") {
      try {
        handleDeleteAllSnapshots();
        window.alert("Snapshots deleted.");
      } catch (err) {
        console.error("handleDeleteAllSnapshots failed:", err);
        window.alert("Delete failed — see console.");
      }
      return;
    }

    try {
      const maybeKeys = ["craftsy-doc-auto", "craftsy-doc-1", "craftsy-doc-snapshots", "craftsy-doc"];
      let removed = 0;
      maybeKeys.forEach((k) => {
        if (localStorage.getItem(k) !== null) {
          localStorage.removeItem(k);
          removed++;
        }
      });
      window.dispatchEvent(new Event("snapshotsCleared"));
      window.alert(`Deleted ${removed} local snapshot keys (best-effort).`);
    } catch (err) {
      console.error("Fallback delete failed:", err);
      window.alert("Delete failed — see console.");
    }
  };

  return (
    <>
      <aside className="right-panel" ref={panelRef} aria-label="Actions and version history">
        {/* Actions card */}
        <div className="panel-card">
          <div className="panel-card-header">
            <div className="panel-title">Actions</div>
            <div className="panel-sub">Quick tools</div>
          </div>

          <div className="panel-controls">
            <button className="action-btn primary" onClick={handleSave} aria-label="Save document" title="Save document">
              <Save size={16} />
              <span>Save</span>
            </button>

            <button className="action-btn" onClick={handleInsertTemplate} aria-label="Insert template" title="Insert Template">
              <FilePlus size={16} />
              <span>Template</span>
            </button>

            <div className="action-sep" />

            <button
              className="action-btn ghost"
              onClick={() => setExportOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={exportOpen}
              title="Export document"
            >
              <DownloadCloud size={16} />
              <span>Export</span>
              <ChevronDown size={14} className="chevron"/>
            </button>

            <button
              className="action-btn ghost"
              onClick={() => setImportOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={importOpen}
              title="Import document"
            >
              <UploadCloud size={16} />
              <span>Import</span>
              <ChevronDown size={14} className="chevron"/>
            </button>
          </div>
        </div>

        {/* Version history card */}
        <div className="panel-card">
          <div className="panel-card-header">
            <div>
              <div className="panel-title">Version History</div>
              <div className="panel-sub">Saved snapshots & timeline</div>
            </div>
            <div className="panel-actions-inline">
              <button
                className={`chip ${showSnapshots ? "chip-on" : ""}`}
                onClick={() => setShowSnapshots((s) => !s)}
                aria-pressed={showSnapshots}
                title={showSnapshots ? "Hide snapshots" : "View snapshots"}
              >
                <Clock size={14} />
                <span>{showSnapshots ? "Showing" : "View"}</span>
              </button>

              <button
                className="icon-btn"
                onClick={deleteAllSnapshots}
                title="Delete all snapshots"
                aria-label="Delete all snapshots"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className={`snapshots ${showSnapshots ? "visible" : "hidden"}`}>
            {showSnapshots ? (
              <div className="version-history-wrapper">
                <VersionHistory editor={editor} />
              </div>
            ) : (
              <div className="snapshots-empty">
                Snapshots are hidden. Click <strong>View</strong> to show saved versions.
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Export Modal */}
      <Modal title="Export document" open={exportOpen} onClose={() => setExportOpen(false)}>
        <div className="modal-actions">
          <button className="modal-action" onClick={() => { handleExportMD(); setExportOpen(false); }}>
            <DownloadCloud size={16} /> Export Markdown (MD)
          </button>

          <button className="modal-action" onClick={() => { handleExportHTML(); setExportOpen(false); }}>
            <DownloadCloud size={16} /> Export HTML
          </button>

          <button className="modal-action" onClick={() => { handlePrintPdf(); setExportOpen(false); }}>
            <DownloadCloud size={16} /> Print / Export PDF
          </button>

          <button className="modal-action" onClick={() => { handleExportDocx(); setExportOpen(false); }}>
            <DownloadCloud size={16} /> Export DOCX
          </button>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal title="Import document" open={importOpen} onClose={() => setImportOpen(false)}>
        <div className="modal-actions">
          <button className="modal-action" onClick={() => { handleImportMD(); setImportOpen(false); }}>
            <UploadCloud size={16} /> Import Markdown (MD)
          </button>
        </div>
      </Modal>
    </>
  );
};

export default RightPanel;
