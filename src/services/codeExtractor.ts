// Multi-file extractor for RAINCAST AI responses.
// Parses fenced code blocks of the form:
//   ```jsx src/App.jsx
//   ...code...
//   ```
// Plus a special meta block:
//   ```raincast-meta
//   { "type": "webapp", "entry": "src/App.jsx" }
//   ```

export type ProjectType =
  | "website"
  | "webapp"
  | "game"
  | "mobile-app"
  | "os/desktop"
  | "ecommerce"
  | "api/fullstack"
  | "unknown";

export interface ExtractedFiles {
  files: Record<string, string>;
  entry: string;
  type: ProjectType;
}

const CODE_LANGS = new Set([
  "jsx",
  "tsx",
  "js",
  "javascript",
  "ts",
  "typescript",
  "css",
  "html",
  "json",
  "md",
]);

function extToLang(path: string): string {
  if (path.endsWith(".tsx")) return "tsx";
  if (path.endsWith(".jsx")) return "jsx";
  if (path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".js")) return "javascript";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".md")) return "markdown";
  return "javascript";
}

export function langForPath(path: string): string {
  return extToLang(path);
}

/**
 * Parse a (possibly partial / streaming) AI response into a file map.
 * Recognizes fenced blocks where the fence line includes a path token.
 * Always returns at least an empty map. Open (unclosed) blocks at the end
 * are still included with their partial content — useful for streaming UI.
 */
export function extractFiles(raw: string): ExtractedFiles {
  const result: ExtractedFiles = {
    files: {},
    entry: "src/App.jsx",
    type: "unknown",
  };
  if (!raw) return result;

  // Tokenize by fences.
  // Regex matches: ```<lang>[ <path>]\n<body>(```|EOF)
  // Horizontal whitespace only between lang and path so we don't swallow
  // the fence-line newline and accidentally treat the first body line as path.
  const re = /```([a-zA-Z0-9_+-]+)?[ \t]*([^\n`]*)\n([\s\S]*?)(?:```|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    const lang = (m[1] || "").trim().toLowerCase();
    const rest = (m[2] || "").trim();
    const body = m[3] ?? "";

    if (lang === "raincast-meta") {
      try {
        const meta = JSON.parse(body.trim());
        if (typeof meta.type === "string") result.type = meta.type as ProjectType;
        if (typeof meta.entry === "string") result.entry = meta.entry;
      } catch {
        /* partial json — ignore */
      }
      continue;
    }

    if (!CODE_LANGS.has(lang)) continue;

    // Path priority:
    //   1. fence line:  ```jsx src/App.jsx
    //   2. body first line comment:  // src/App.jsx   or   /* src/App.jsx */
    //   3. legacy fallback: src/App.jsx
    let path = rest;
    let bodyContent = body;

    if (!path) {
      const firstLineEnd = body.indexOf("\n");
      const firstLine = (
        firstLineEnd === -1 ? body : body.slice(0, firstLineEnd)
      ).trim();
      const lineComment = firstLine.match(
        /^\/\/\s*([\w./@-]+\.(?:jsx?|tsx?|css|html|json|md))\s*$/,
      );
      const blockComment = firstLine.match(
        /^\/\*\s*([\w./@-]+\.(?:jsx?|tsx?|css|html|json|md))\s*\*\/$/,
      );
      const hashComment = firstLine.match(
        /^#\s*([\w./@-]+\.(?:jsx?|tsx?|css|html|json|md))\s*$/,
      );
      const match = lineComment ?? blockComment ?? hashComment;
      if (match) {
        path = match[1];
        bodyContent = firstLineEnd === -1 ? "" : body.slice(firstLineEnd + 1);
      }
    }

    if (!path) {
      // Legacy single-file mode default.
      path = "src/App.jsx";
    }
    // Sanitize path
    path = path.replace(/^["'`]|["'`]$/g, "").trim();
    if (!path) path = "src/App.jsx";

    // If a path collides, only overwrite if new content is longer
    // (later fences during streaming usually contain the full file).
    const existing = result.files[path];
    const next = bodyContent.trimEnd();
    if (existing === undefined || next.length >= existing.length) {
      result.files[path] = next;
    }
  }

  // If no entry was specified but we have an obvious one, use it.
  if (!result.files[result.entry]) {
    const candidate = Object.keys(result.files).find(
      (p) => /(^|\/)App\.(jsx|tsx|js)$/.test(p) || /index\.(jsx|tsx|js)$/.test(p),
    );
    if (candidate) result.entry = candidate;
  }

  return result;
}

/** Backwards-compat: returns the entry file content from a parsed response. */
export function extractCode(raw: string): string {
  const { files, entry } = extractFiles(raw);
  if (files[entry]) return files[entry];
  // Fallback: first file or generic fenced block
  const first = Object.values(files)[0];
  if (first) return first;
  const generic = raw.match(/```[a-zA-Z]*\s*([\s\S]*?)```/);
  return generic && generic[1] ? generic[1].trim() : "";
}

/** Streaming partial extractor — returns the entry file content so far. */
export function extractPartialCode(raw: string): string | null {
  const { files, entry } = extractFiles(raw);
  if (files[entry]) return files[entry];
  const first = Object.values(files)[0];
  return first ?? null;
}
