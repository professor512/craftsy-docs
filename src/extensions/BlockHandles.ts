// src/extensions/BlockHandles.ts
import { Extension } from "@tiptap/core";
import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

/**
 * BlockHandles extension (ESM + TypeScript)
 * - Adds a small draggable widget before each block node.
 * - Widget sets dataTransfer 'application/x-prosemirror-nodepos' on dragstart.
 * - Click focuses the editor.
 */
export const BlockHandles = Extension.create({
  name: "block-handles",

  addProseMirrorPlugins() {
    const plugin = new Plugin({
      props: {
        decorations(state) {
          const decos: Decoration[] = [];

          state.doc.descendants((node, pos) => {
            if (node.isBlock) {
              const widget = document.createElement("div");
              widget.className = "block-handle";
              widget.textContent = "⋮⋮";
              widget.draggable = true;

              // set dataTransfer on dragstart so drop handler can move the node
              widget.addEventListener("dragstart", (event: DragEvent) => {
                try {
                  event.dataTransfer?.setData("application/x-prosemirror-nodepos", String(pos));
                  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
                } catch {
                  // ignore browser restrictions
                }
              });

              // click focuses the editor DOM (ProseMirror root)
              widget.addEventListener("click", (e) => {
                e.stopPropagation();
                const pm = document.querySelector<HTMLElement>(".ProseMirror");
                pm?.focus();
              });

              // place widget before the node's content
              decos.push(Decoration.widget(pos + 1, widget, { side: -1 }));
            }
            return true;
          });

          return DecorationSet.create(state.doc, decos);
        },
      },
    });

    return [plugin];
  },
});
