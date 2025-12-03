// src/extensions/SlashMenu.ts
import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";

/**
 * Lightweight typed shapes used in the suggestion callbacks.
 * We intentionally keep them small and permissive so they work across
 * Tiptap versions without needing deep library types.
 */
type SuggestionRange = { from: number; to: number };

type SuggestionCommandProps = {
  editor: any; // runtime Editor instance from Tiptap
  range: SuggestionRange;
  props: any;
};

type ItemsContext = {
  query: string;
};

/**
 * SlashMenu extension using @tiptap/suggestion
 *
 * The command callback receives an object like { editor, range, props }.
 * The items callback receives { query } and should return an array of items.
 *
 * Each returned item should contain enough data for your `command` to use.
 */
export const SlashMenu = Extension.create({
  name: "slash-menu",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: false,

        // `command` will be called when user selects an item
        // typed signature: ({ editor, range, props }) => void
        command: ({ editor, range, props }: SuggestionCommandProps) => {
          // Example: delete the typed slash+query and insert a node/block
          // props.item can be a node name or a more complex object
          // We support both simple string node types and objects with type/attrs
          const item = props.item;

          editor.chain().focus().deleteRange(range);

          if (typeof item === "string") {
            // setNode accepts node name or other commands depending on type
            editor.chain().focus().setNode(item).run();
            return;
          }

          if (typeof item === "object" && item !== null) {
            // item may be an object like { type: "heading", attrs: { level: 2 } }
            const { type, attrs } = item;
            // Use chain to set the appropriate node
            if (type === "heading") {
              editor.chain().focus().toggleHeading(attrs).run();
            } else if (type === "callout") {
              // custom callout extension should exist in your schema
              editor.chain().focus().setNode("callout", attrs || {}).run();
            } else if (type === "taskList") {
              editor.chain().focus().toggleTaskList().run();
            } else if (type === "bulletList") {
              editor.chain().focus().toggleBulletList().run();
            } else if (type === "orderedList") {
              editor.chain().focus().toggleOrderedList().run();
            } else if (type === "codeBlock") {
              editor.chain().focus().toggleCodeBlock().run();
            } else if (type === "horizontalRule") {
              editor.chain().focus().setHorizontalRule().run();
            } else {
              // fallback: try setNode with type & attrs
              editor.chain().focus().setNode(type, attrs || {}).run();
            }
          }
        },

        // `items` returns a filtered list based on the query
        items: ({ query }: ItemsContext) => {
          const list = [
            { title: "Paragraph", item: "paragraph" },
            { title: "Heading 1", item: { type: "heading", attrs: { level: 1 } } },
            { title: "Heading 2", item: { type: "heading", attrs: { level: 2 } } },
            { title: "Checklist", item: { type: "taskList" } },
            { title: "Bullet List", item: { type: "bulletList" } },
            { title: "Numbered List", item: { type: "orderedList" } },
            { title: "Code Block", item: { type: "codeBlock" } },
            { title: "Divider", item: { type: "horizontalRule" } },
            { title: "Callout", item: { type: "callout", attrs: { emoji: "💡" } } },
            { title: "Table (3×3)", item: { type: "insertTable", attrs: { rows: 3, cols: 3 } } },
            { title: "Image (URL)", item: { type: "image" } },
          ];

          if (!query) return list;
          return list.filter((it) => it.title.toLowerCase().includes(query.toLowerCase()));
        },

        // optional: startOfLine, allowWhitespace, etc. can be added if needed
      },
    };
  },

  addProseMirrorPlugins() {
    // The Suggestion() helper returned by @tiptap/suggestion expects these options.
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
