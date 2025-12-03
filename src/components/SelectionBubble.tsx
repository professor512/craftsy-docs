// src/components/SelectionBubble.tsx
import React from "react";
import type { Editor } from "@tiptap/react";
import "./../styles/bubble.css";

type Props = { editor: Editor | null };

const SelectionBubble: React.FC<Props> = ({ editor }) => {
  const [visible, setVisible] = React.useState(false);
  const [coords, setCoords] = React.useState<{ left: number; top: number }>({ left: 0, top: 0 });

  React.useEffect(() => {
    if (!editor) return;

    const update = () => {
      const { state, view } = editor;
      const { from, to } = state.selection;

      // if no text selected, hide
      if (from === to) {
        setVisible(false);
        return;
      }

      try {
        // coords of the start and end of selection
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);

        // position the bubble roughly centered above the selection
        const left = Math.round((start.left + end.left) / 2);
        // place above the top-most of the two coords, with a small offset
        const top = Math.round(Math.min(start.top, end.top) - 46);

        setCoords({ left, top });
        setVisible(true);
      } catch (e) {
        // fallback: hide if any error occurs
        setVisible(false);
      }
    };

    // initial update
    update();

    // Tiptap editor emits "selectionUpdate" when selection changes
    editor.on("selectionUpdate", update);
    // Also listen to updates in general (content/scroll) to reposition
    editor.on("transaction", update);

    // reposition on window scroll/resize so bubble stays in place
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [editor]);

  if (!editor) return null;

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();

  const onLinkClick = () => {
    const prev = editor.isActive("link");
    if (prev) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("Enter URL");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  // render the bubble as a fixed-position element
  return visible ? (
    <div
      className="bubble-menu"
      style={{
        position: "fixed",
        left: coords.left,
        top: coords.top,
        transform: "translateX(-50%)",
        zIndex: 9999,
        pointerEvents: "auto",
      }}
      aria-hidden={!visible}
    >
      <button
        type="button"
        className={editor.isActive("bold") ? "toolbar-button active" : "toolbar-button"}
        onClick={toggleBold}
        title="Bold"
      >
        B
      </button>

      <button
        type="button"
        className={editor.isActive("italic") ? "toolbar-button active" : "toolbar-button"}
        onClick={toggleItalic}
        title="Italic"
      >
        I
      </button>

      <button
        type="button"
        className={editor.isActive("link") ? "toolbar-button active" : "toolbar-button"}
        onClick={onLinkClick}
        title="Link"
      >
        Link
      </button>
    </div>
  ) : null;
};

export default SelectionBubble;
