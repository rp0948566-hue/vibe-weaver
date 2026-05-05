// Strips ES module syntax so generated code can run inside a Babel Standalone
// <script type="text/babel"> block where every file is concatenated as one
// global script. Imports become no-ops (deps are loaded as globals); exports
// become bare top-level declarations.

// Multi-line `import x from "y"` (covers default, named, namespace, type,
// and any combination across multiple lines).
const MULTI_IMPORT_RE = /^[ \t]*import\b[\s\S]*?from\s*["'`][^"'`]+["'`]\s*;?[ \t]*$/gm;

// Side-effect imports: `import "./styles.css";`
const SIDE_IMPORT_RE = /^[ \t]*import\s*["'`][^"'`]+["'`]\s*;?[ \t]*$/gm;

// Re-exports: `export { foo } from "./bar"`  →  drop entirely (deps are global)
const REEXPORT_RE = /^[ \t]*export\s*\{[^}]*\}\s*from\s*["'`][^"'`]+["'`]\s*;?[ \t]*$/gm;

// Local exports: `export { a, b }` → drop
const LOCAL_REEXPORT_RE = /^[ \t]*export\s*\{[^}]*\}\s*;?[ \t]*$/gm;

// `export default SomeName;` — bare identifier re-export → drop entire line
// (the variable is already declared; iframeBuilder always mounts App by name)
const DEFAULT_EXPORT_IDENT_RE = /^[ \t]*export\s+default\s+[A-Za-z_$][A-Za-z0-9_$]*\s*;?[ \t]*$/gm;

// `export default` on inline declarations → drop the keyword, keep the declaration
const DEFAULT_EXPORT_RE = /\bexport\s+default\s+/g;

// `export const|let|var|function|class|async function` → drop the `export`
const NAMED_EXPORT_RE =
  /^[ \t]*export\s+(const|let|var|function|class|async\s+function)\s+/gm;

// `export * from "./bar"` → drop (deps already in scope as globals)
const STAR_REEXPORT_RE = /^[ \t]*export\s*\*\s*from\s*["'`][^"'`]+["'`]\s*;?[ \t]*$/gm;

// `require('some-package')` calls — npm not available in Babel Standalone.
// Matches: const x = require('y'), require('y'), var x = require("y")
const REQUIRE_CALL_RE = /\bconst\s+\w[\w$]*\s*=\s*require\s*\(['"`][^'"`]+['"`]\)\s*;?/g;
const BARE_REQUIRE_RE = /^[ \t]*require\s*\(['"`][^'"`]+['"`]\)\s*;?[ \t]*$/gm;

// node_modules in src attributes — e.g. src="../node_modules/pkg/img.png"
const NODE_MODULES_SRC_RE = /(?:src|href)=["'][^"']*node_modules[^"']*["']/g;

// `const { useState, useEffect, ... } = React;` — AI-generated hook destructuring.
// REACT_PREAMBLE already declares all hooks globally; duplicate const → SyntaxError.
// Matches single-line and multi-line variants.
const REACT_DESTRUCTURE_RE = /^[ \t]*const\s*\{[\s\S]*?\}\s*=\s*React\s*;?[ \t]*$/gm;

// TypeScript: interface declarations — drop entire block
// e.g. `interface Foo { ... }` or `export interface Foo { ... }`
const TS_INTERFACE_RE = /^[ \t]*(?:export\s+)?interface\s+\w[^{]*\{[^}]*\}/gm;

// TypeScript: type alias declarations
// e.g. `type Foo = string | number;` or `export type Foo = ...;`
const TS_TYPE_ALIAS_RE = /^[ \t]*(?:export\s+)?type\s+\w[^=\n]*=[^\n;]+;?[ \t]*$/gm;

// TypeScript: `as SomeType` casts → strip (tight match to avoid eating JSX)
// Only matches `as Identifier` or `as Identifier<...>` followed by punctuation.
const TS_AS_CAST_RE = /\s+as\s+[A-Za-z_$][A-Za-z0-9_$]*(?:<[^>]*>)?(?=\s*[),;\]|&?:{}\n])/g;

// TypeScript: simple inline parameter/variable type annotations
// e.g. `: string`, `: number`, `: boolean`, `: void`, `: any`, `: never`
const TS_PRIMITIVE_TYPE_RE = /:\s*(?:string|number|boolean|void|any|never|unknown|null|undefined|object)(?:\[\])?(?=\s*[,)=;\n{])/g;

export function cleanModuleCode(code: string): string {
  return code
    .replace(MULTI_IMPORT_RE, "")
    .replace(SIDE_IMPORT_RE, "")
    .replace(STAR_REEXPORT_RE, "")
    .replace(REEXPORT_RE, "")
    .replace(LOCAL_REEXPORT_RE, "")
    .replace(DEFAULT_EXPORT_IDENT_RE, "")
    .replace(DEFAULT_EXPORT_RE, "")
    .replace(NAMED_EXPORT_RE, "$1 ")
    .replace(REACT_DESTRUCTURE_RE, "")
    .replace(TS_INTERFACE_RE, "")
    .replace(TS_TYPE_ALIAS_RE, "")
    .replace(TS_AS_CAST_RE, "")
    .replace(TS_PRIMITIVE_TYPE_RE, "")
    .replace(REQUIRE_CALL_RE, "")
    .replace(BARE_REQUIRE_RE, "")
    .replace(NODE_MODULES_SRC_RE, 'src=""');
}

export function bundleFiles(
  files: Record<string, string>,
  entry: string,
): string {
  const ordered: string[] = [];

  // Non-entry files first — each surrounded by clear comment delimiters so a
  // malformed JSX return in one file cannot bleed into the next file's
  // top-level declarations (which would cause Babel to see `const` where it
  // expects `,` and throw "Unexpected token").
  for (const [path, content] of Object.entries(files)) {
    if (path === entry) continue;
    if (!/\.(jsx?|tsx?)$/.test(path)) continue;
    const cleaned = cleanModuleCode(content);
    ordered.push(
      `/* ===== ${path} ===== */\n${cleaned}\n/* ===== /${path} ===== */`,
    );
  }

  // Entry file last — App must be declared before ReactDOM.createRoot mounts it.
  if (files[entry]) {
    const cleaned = cleanModuleCode(files[entry]);
    ordered.push(
      `/* ===== ${entry} (entry) ===== */\n${cleaned}\n/* ===== /${entry} ===== */`,
    );
  }

  return ordered.join("\n\n");
}
