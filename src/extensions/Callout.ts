import { Node, mergeAttributes } from "@tiptap/core";

export const Callout = Node.create({
  name: "callout",

  group: "block",

  content: "inline*",

  draggable: true,

  addAttributes() {
    return {
      emoji: {
        default: "💡",
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='callout']" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "callout",
        class: "callout-box",
      }),
      ["span", { class: "callout-emoji" }, node.attrs.emoji],
      ["div", { class: "callout-content" }, 0],
    ];
  },
});
