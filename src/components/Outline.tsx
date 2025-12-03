// src/components/Outline.tsx
import React from "react";
import type { Editor } from "@tiptap/react";

type Props = { editor: Editor | null };

const Outline: React.FC<Props> = ({ editor }) => {
    const [items, setItems] = React.useState<
        { level: number; text: string; pos: number }[]
    >([]);

    React.useEffect(() => {
        if (!editor) {
            setItems([]);
            return;
        }

        const update = () => {
            const headings: { level: number; text: string; pos: number }[] = [];

            // Walk the doc and collect heading nodes
            editor.state.doc.descendants((node, pos) => {
                if (node.type.name === "heading") {
                    headings.push({
                        level: node.attrs.level ?? 1,
                        text: node.textContent ?? "",
                        pos,
                    });
                }
                return true; // continue walking
            });

            setItems(headings);
        };

        // initial collect
        update();

        // subscribe to editor updates
        editor.on("update", update);

        // cleanup: unsubscribe
        return () => {
            editor.off("update", update);
        };
    }, [editor]);

    if (!editor) return null;

    return (
        <aside className="outline">
            <h4 className="outline-title">Outline</h4>

            {items.length === 0 ? (
                <div className="outline-empty">No headings yet</div>
            ) : (
                items.map((item, idx) => (
                    <div
                        key={`${item.pos}-${idx}`}
                        className={`outline-item level-${item.level}`}
                        onClick={() => {
                            try {
                                // set selection to the heading position and focus the editor
                                editor.chain().focus().setTextSelection(item.pos).run();

                                // try to scroll the editor view to the heading position
                                const coords = editor.view?.coordsAtPos(item.pos);
                                if (coords) {
                                    window.scrollTo({ top: coords.top - 80, behavior: "smooth" });
                                    editor.view?.focus();
                                } else {
                                    // fallback: ensure DOM focus
                                    editor.view?.focus();
                                }
                            } catch {
                                // fallback: use coordsAtPos if chain selection fails
                                const coords = editor.view?.coordsAtPos(item.pos);
                                if (coords) {
                                    window.scrollTo({ top: coords.top - 80, behavior: "smooth" });
                                    editor.view?.focus();
                                }
                            }
                        }}

                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                editor.chain().focus().setTextSelection(item.pos).run();
                            }
                        }}
                    >
                        <span className="outline-text">{item.text || "(empty heading)"}</span>
                    </div>
                ))
            )}
        </aside>
    );
};

export default Outline;
