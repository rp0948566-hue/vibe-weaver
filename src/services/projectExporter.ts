import JSZip from "jszip";

interface ExportArgs {
  files: Record<string, string>;
  entry: string;
  previewHtml: string;
  projectTitle: string;
}

const README = (title: string, entry: string) => `# ${title}

Exported from Raincast.

## Run

This is a static React project that runs in a browser via Babel Standalone.
Open \`preview.html\` directly in a browser to see the live build, or wire
\`${entry}\` into a Vite/CRA project of your own.

## Files

- \`preview.html\` — standalone runnable preview (no build step)
- \`src/\` — generated source files
`;

const VITE_PACKAGE_JSON = (title: string) => `{
  "name": "${slugify(title)}",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0"
  }
}
`;

const VITE_CONFIG = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
`;

const VITE_INDEX_HTML = (entry: string) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Raincast Export</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/${entry}"></script>
  </body>
</html>
`;

const VITE_MAIN = (entry: string) => `import React from "react";
import ReactDOM from "react-dom/client";
import App from "/${entry.replace(/^src\//, "./")}";

ReactDOM.createRoot(document.getElementById("root")!).render(
  React.createElement(React.StrictMode, null, React.createElement(App))
);
`;

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "raincast-project"
  );
}

export async function exportProjectAsZip({
  files,
  entry,
  previewHtml,
  projectTitle,
}: ExportArgs): Promise<Blob> {
  const zip = new JSZip();

  for (const [path, content] of Object.entries(files)) {
    zip.file(path, content);
  }

  if (previewHtml) {
    zip.file("preview.html", previewHtml);
  }

  zip.file("README.md", README(projectTitle, entry));
  zip.file("package.json", VITE_PACKAGE_JSON(projectTitle));
  zip.file("vite.config.ts", VITE_CONFIG);
  if (!files["index.html"]) {
    zip.file("index.html", VITE_INDEX_HTML(entry));
  }
  if (!files["src/main.jsx"] && !files["src/main.tsx"]) {
    zip.file("src/main.jsx", VITE_MAIN(entry));
  }

  return zip.generateAsync({ type: "blob" });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportAndDownload(args: ExportArgs): Promise<void> {
  const blob = await exportProjectAsZip(args);
  downloadBlob(blob, `${slugify(args.projectTitle)}.zip`);
}
