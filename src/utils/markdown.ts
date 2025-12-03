import MarkdownIt from "markdown-it";
import TurndownService from "turndown";

// Convert editor HTML → Markdown string
export const htmlToMarkdown = (html: string): string => {
  const turndown = new TurndownService();
  return turndown.turndown(html);
};

// Convert Markdown string → HTML
export const markdownToHtml = (md: string): string => {
  const parser = new MarkdownIt();
  return parser.render(md);
};
