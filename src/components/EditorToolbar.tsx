// src/components/EditorToolbar.tsx
import React from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Code,
  Link as LinkIcon,
  Image as IconImage,
  Undo2,
  Redo2,
  Table,
  Plus,
  Minus,
  UploadCloud,
  CheckSquare,
  Minus as DividerIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MessageSquare,
} from "lucide-react";

type Props = { editor: Editor | null };

const EditorToolbar: React.FC<Props> = ({ editor }) => {
  if (!editor) return null;

  const btnClass = (active = false) =>
    active ? "toolbar-button active" : "toolbar-button";

  const insertLink = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("Enter URL:");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertImageURL = () => {
    const url = window.prompt("Enter image URL:");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        editor.chain().focus().setImage({ src: reader.result as string }).run();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <div className="toolbar">

      {/* GROUP 1 — Formatting */}
      <button
        className={btnClass(editor.isActive("bold"))}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <Bold size={18} />
      </button>

      <button
        className={btnClass(editor.isActive("italic"))}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <Italic size={18} />
      </button>

      <button
        className={btnClass(editor.isActive("heading", { level: 1 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Heading 1"
      >
        <Heading1 size={18} />
      </button>

      <button
        className={btnClass(editor.isActive("heading", { level: 2 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        <Heading2 size={18} />
      </button>

      {/* GROUP 2 — Lists */}
      <button
        className={btnClass(editor.isActive("bulletList"))}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        <List size={18} />
      </button>

      <button
        className={btnClass(editor.isActive("orderedList"))}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered List"
      >
        <ListOrdered size={18} />
      </button>

      {/* GROUP 3 — Code & link */}
      <button
        className={btnClass(editor.isActive("codeBlock"))}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        title="Code Block"
      >
        <Code size={18} />
      </button>

      <button
        className={btnClass(editor.isActive("link"))}
        onClick={insertLink}
        title="Insert Link"
      >
        <LinkIcon size={18} />
      </button>

      {/* GROUP 4 — Images */}
      <button className="toolbar-button" onClick={insertImageURL} title="Insert Image URL">
        <IconImage size={18} />
      </button>

      <button className="toolbar-button" onClick={handleUpload} title="Upload Image">
        <UploadCloud size={18} />
      </button>

      {/* GROUP 5 — Undo / Redo */}
      <button className="toolbar-button" onClick={() => editor.chain().focus().undo().run()} title="Undo">
        <Undo2 size={18} />
      </button>

      <button className="toolbar-button" onClick={() => editor.chain().focus().redo().run()} title="Redo">
        <Redo2 size={18} />
      </button>

      {/* GROUP 6 — Tables */}
      <button
        className="toolbar-button"
        title="Insert Table"
        onClick={() =>
          (editor as any).chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      >
        <Table size={18} />
      </button>

      <button className="toolbar-button" onClick={() => (editor as any).chain().focus().addColumnAfter().run()} title="Add Column">
        <Plus size={18} />
      </button>

      <button className="toolbar-button" onClick={() => (editor as any).chain().focus().addRowAfter().run()} title="Add Row">
        <Plus size={18} />
      </button>

      <button className="toolbar-button" onClick={() => (editor as any).chain().focus().deleteColumn().run()} title="Delete Column">
        <Minus size={18} />
      </button>

      <button className="toolbar-button" onClick={() => (editor as any).chain().focus().deleteRow().run()} title="Delete Row">
        <Minus size={18} />
      </button>

      <button className="toolbar-button" onClick={() => (editor as any).chain().focus().deleteTable().run()} title="Delete Table">
        <Minus size={18} />
      </button>

      {/* GROUP 7 — Checklist & Divider */}
      <button
        className={btnClass(editor.isActive("taskList"))}
        onClick={() => (editor as any).chain().focus().toggleTaskList().run()}
        title="Checklist"
      >
        <CheckSquare size={18} />
      </button>

      <button className="toolbar-button" onClick={() => (editor as any).chain().focus().setHorizontalRule().run()} title="Divider">
        <DividerIcon size={18} />
      </button>

      {/* GROUP 8 — Alignment */}
      <button
        className={btnClass(editor.isActive("textAlign", { align: "left" }))}
        onClick={() => (editor as any).chain().focus().setTextAlign("left").run()}
        title="Align Left"
      >
        <AlignLeft size={18} />
      </button>

      <button
        className={btnClass(editor.isActive("textAlign", { align: "center" }))}
        onClick={() => (editor as any).chain().focus().setTextAlign("center").run()}
        title="Align Center"
      >
        <AlignCenter size={18} />
      </button>

      <button
        className={btnClass(editor.isActive("textAlign", { align: "right" }))}
        onClick={() => (editor as any).chain().focus().setTextAlign("right").run()}
        title="Align Right"
      >
        <AlignRight size={18} />
      </button>

      {/* GROUP 9 — Callout */}
      <button
        className="toolbar-button"
        onClick={() => (editor as any).chain().focus().setNode("callout", { emoji: "💡" }).run()}
        title="Callout"
      >
        <MessageSquare size={18} />
      </button>
    </div>
  );
};

export default EditorToolbar;
