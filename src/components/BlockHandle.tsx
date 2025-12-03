import React from "react";
import { Editor } from "@tiptap/react";

type Props = {
  editor: Editor;
  nodePos: number;
};

const BlockHandle: React.FC<Props> = ({ editor, nodePos }) => {
  return (
    <div
      className="block-handle"
      onClick={(e) => {
        e.stopPropagation();
        editor.chain().focus().setNodeSelection(nodePos).run();
      }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/x-prosemirror-nodepos", String(nodePos));
      }}
    >
      ⋮⋮
    </div>
  );
};

export default BlockHandle;
