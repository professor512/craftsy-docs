// src/components/DocumentEditor.tsx
import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";

import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

import CodeBlock from "@tiptap/extension-code-block";

import DOMPurify from "dompurify";

import EditorToolbar from "./EditorToolbar";
import SelectionBubble from "./SelectionBubble";

import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import TextAlign from "@tiptap/extension-text-align";

import { Callout } from "../extensions/Callout";
import { SlashMenu } from "../extensions/SlashMenu";

import Outline from "./Outline";
// optionally import templates if you use Insert Template button
import { templates } from "../templates";

import { htmlToMarkdown, markdownToHtml } from "../utils/markdown";
import { BlockHandles } from "../extensions/BlockHandles";

import VersionHistory from "./VersionHistory";
import { saveSnapshot } from "../utils/history"; // <-- Make sure this import exists

import { downloadFile, buildA4Html } from "../utils/export";


const STORAGE_KEY = "craftsy-doc-1";

const DocumentEditor: React.FC = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,

      // Tables
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,

      // Links & images
      Link.configure({ openOnClick: true }),
      Image,

      // Code block
      CodeBlock,

      // UX
      Dropcursor,
      Gapcursor,
      BlockHandles,

      // Placeholder
      Placeholder.configure({
        placeholder: "Start typing your document…",
      }),

      // Tasks / checklist
      TaskList,
      TaskItem.configure({ nested: true }),

      HorizontalRule,

      TextAlign.configure({ types: ["heading", "paragraph"] }),

      Callout,
      SlashMenu,
    ],

    editorProps: {
      handleDOMEvents: {
        drop: (view, event) => {
          const pos = event.dataTransfer?.getData("application/x-prosemirror-nodepos");
          if (pos) {
            const insertAt = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
            if (!insertAt) return false;

            const tr = view.state.tr;
            const nodePos = parseInt(pos);
            const node = view.state.doc.nodeAt(nodePos);

            if (node) {
              tr.delete(nodePos, nodePos + node.nodeSize);
              tr.insert(insertAt, node);
              view.dispatch(tr);
            }

            event.preventDefault();
            return true;
          }
          return false;
        },
      },
    },

    content: "<p>Start writing your document…</p>",
    autofocus: "end",
  });

  // Load saved content once editor is ready
  React.useEffect(() => {
    if (!editor) return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) {
        editor.commands.setContent(parsed);
      }
    } catch (e) {
      // ignore parse errors
    }
  }, [editor]);

  // Autosave every 1.5s
  React.useEffect(() => {
    if (!editor) return;
    const interval = setInterval(() => {
      const json = editor.getJSON();
      const saved = localStorage.getItem("craftsy-doc-auto");
      if (saved !== JSON.stringify(json)) {
        localStorage.setItem("craftsy-doc-auto", JSON.stringify(json));
        // console.log("Auto-saved");
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [editor]);

  const handleSave = React.useCallback(() => {
    if (!editor) return;

    // 1. Save main doc
    const json = editor.getJSON();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(json));

    // 2. Create a snapshot for Version History
    saveSnapshot({
      id: Date.now().toString(),
      ts: Date.now(),
      title: `Manual Save – ${new Date().toLocaleString()}`,
      content: json,
    });

    alert("Saved + Snapshot Created");
  }, [editor]);


  if (!editor) return null;

  // topbar MD handlers and template insert
  const handleExportMD = async () => {
    const html = editor.getHTML();
    const md = htmlToMarkdown(html);
    try {
      await navigator.clipboard.writeText(md);
      alert("Markdown copied!");
    } catch {
      // fallback: open new tab with markdown
      const w = window.open("", "_blank");
      if (w) {
        w.document.write("<pre>" + md.replace(/</g, "&lt;") + "</pre>");
      } else {
        alert("Copy failed. Use the clipboard manually.");
      }
    }
  };

  const handleImportMD = () => {
    const md = prompt("Paste Markdown here:");
    if (!md) return;
    const html = markdownToHtml(md);
    editor.chain().focus().setContent(html).run();
  };

  const handleInsertTemplate = () => {
    const name = prompt("Template (Meeting Notes / Blog Article):");
    if (!name) return;
    // safe access: templates is Record<string,string> if you used that fix
    const tpl = (templates as any)[name];
    if (!tpl) {
      alert("Template not found.");
      return;
    }
    editor.chain().focus().setContent(tpl).run();
  };



  const [headerHtml, setHeaderHtml] = React.useState<string>("<strong>Header</strong>");
  const [footerHtml, setFooterHtml] = React.useState<string>("Page footer");


  const handleExportHTML = () => {
    const html = editor.getHTML();
    const doc = buildA4Html("Document export", html, "<strong>Header</strong>", "Page footer");
    downloadFile("document.html", doc, "text/html");
  };

  const handlePrintPdf = () => {
    const html = editor.getHTML();
    const doc = buildA4Html("Document print", html, "<strong>Header</strong>", "Page footer");
    const win = window.open("", "_blank");
    if (!win) {
      alert("Unable to open print window. Try allowing popups.");
      return;
    }
    win.document.write(doc);
    win.document.close();
    // give time to render
    setTimeout(() => {
      win.print();
    }, 400);
  };

// replace handleExportDocx in DocumentEditor.tsx
const handleExportDocx = async () => {
  if (!editor) return;
  const html = editor.getHTML();

  // Build a full HTML wrapper (similar to buildA4Html)
  const docHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Document</title></head><body>${headerHtml}${html}${footerHtml}</body></html>`;

  // Download as .doc (Word can open HTML content saved with .doc)
  const blob = new Blob([docHtml], { type: "application/msword" });
  downloadFile("document.doc", blob, "application/msword");
};



  return (
    <div style={{ display: "flex" }}>
      {/* Left: Outline Sidebar */}
      <Outline editor={editor} />

      {/* Center: Main Editor Area */}
      <div className="editor-container" style={{ flex: 1 }}>
        {/* Topbar — paste this in place of your current .editor-topbar block */}
<div className="editor-topbar">
  <h3 className="editor-title">Craftsy — Document Editor</h3>

  <div className="editor-actions" aria-label="Editor actions">

    <button className="save-button" onClick={handleSave} aria-label="Save document">
      Save
    </button>

    <button className="save-button secondary" onClick={handleInsertTemplate} aria-label="Insert template">
      Insert Template
    </button>

    {/* Header / Footer inputs */}
    <div className="hf-group" aria-label="Header and footer">
      <input
        value={headerHtml}
        onChange={(e) => setHeaderHtml(e.target.value)}
        placeholder="Header HTML"
        className="hf-input"
      />
      <input
        value={footerHtml}
        onChange={(e) => setFooterHtml(e.target.value)}
        placeholder="Footer HTML"
        className="hf-input"
      />
    </div>

    {/* Export dropdown (hover / focus) */}
    <div className="dropdown export-dropdown" tabIndex={0} aria-haspopup="true" aria-label="Export options">
      <button className="save-button outline" aria-expanded="false">Export ▾</button>

      <div className="dropdown-menu" role="menu" aria-label="Export menu">
        <button className="menu-item" onClick={handleExportMD} role="menuitem">Export MD</button>
        <button className="menu-item" onClick={handleExportHTML} role="menuitem">Export HTML</button>
        <button className="menu-item" onClick={handlePrintPdf} role="menuitem">Print / Export PDF</button>
        <button className="menu-item" onClick={handleExportDocx} role="menuitem">Export DOCX</button>
      </div>
    </div>

    {/* Import dropdown */}
    <div className="dropdown import-dropdown" tabIndex={0} aria-haspopup="true" aria-label="Import options">
      <button className="save-button outline" aria-expanded="false">Import ▾</button>

      <div className="dropdown-menu" role="menu" aria-label="Import menu">
        <button className="menu-item" onClick={handleImportMD} role="menuitem">Import MD</button>
        {/* add more import items here if needed */}
      </div>
    </div>

  </div>
</div>


        <EditorToolbar editor={editor} />
        <SelectionBubble editor={editor} />

        <div className="editor-area">
          <EditorContent
            editor={editor}
            className="editor-content"
            onPaste={(event) => {
              if (!editor) return;
              const html = event.clipboardData?.getData("text/html");
              if (html) {
                const clean = DOMPurify.sanitize(html, { WHOLE_DOCUMENT: false });
                editor.chain().focus().insertContent(clean).run();
                event.preventDefault();
              }
            }}
          />
        </div>
      </div>

      {/* Right: Version History */}
      <VersionHistory editor={editor} />
    </div>
  );

};

export default DocumentEditor;
