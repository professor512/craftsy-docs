// src/utils/export.ts
export function downloadFile(filename: string, content: Blob | string, mime = "application/octet-stream") {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Build a simple A4 HTML wrapper (styles inline)
export function buildA4Html(title: string, html: string, headerHtml = "", footerHtml = "") {
  const style = `
    <style>
      @page { size: A4; margin: 20mm; }
      body { font-family: Arial, sans-serif; -webkit-print-color-adjust: exact; color: #111827; }
      .header { margin-bottom: 8px; font-size: 12px; color: #6b7280; }
      .footer { margin-top: 12px; font-size: 12px; color: #6b7280; position: fixed; bottom: 20mm; width: calc(100% - 40mm); }
      .content { width: calc(100% - 40mm); }
      pre { white-space: pre-wrap; word-wrap: break-word; }
    </style>
  `;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>${style}</head><body>
    <div class="header">${headerHtml}</div>
    <div class="content">${html}</div>
    <div class="footer">${footerHtml}</div>
  </body></html>`;
}
