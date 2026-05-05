import JSZip from "jszip";

export interface ScannedComponent {
  name: string;
  importPath: string;
  propsSignature: string;
  description: string;
  code: string;
}

const LS_COMPONENTS = "raincast_component_library";

const COMPONENT_NAME_RE = /export\s+(?:default\s+)?function\s+([A-Z][a-zA-Z0-9]*)|export\s+const\s+([A-Z][a-zA-Z0-9]*)\s*=/g;
const PROPS_RE = /function\s+\w+\s*\(\s*\{([^}]*)\}/;
const ARROW_PROPS_RE = /const\s+\w+\s*=\s*\(\s*\{([^}]*)\}/;

function extractComponentInfo(code: string, filePath: string): ScannedComponent | null {
  const nameMatch = [...code.matchAll(COMPONENT_NAME_RE)];
  if (!nameMatch.length) return null;
  const name = nameMatch[0][1] ?? nameMatch[0][2];
  if (!name) return null;

  const propsMatch = PROPS_RE.exec(code) ?? ARROW_PROPS_RE.exec(code);
  const propsSignature = propsMatch
    ? propsMatch[1].replace(/\s+/g, " ").trim()
    : "props";

  // Infer description from component name + code content
  const hasForms = /form|input|select|textarea/i.test(code);
  const hasNav = /nav|link|menu|sidebar/i.test(code);
  const hasCard = /card|tile|grid/i.test(code);
  const hasModal = /modal|dialog|overlay/i.test(code);
  const description = hasForms
    ? `Form component: ${name}`
    : hasNav
      ? `Navigation component: ${name}`
      : hasCard
        ? `Card/display component: ${name}`
        : hasModal
          ? `Modal/dialog component: ${name}`
          : `UI component: ${name}`;

  return {
    name,
    importPath: filePath.replace(/\.(tsx?|jsx?)$/, ""),
    propsSignature,
    description,
    code: code.slice(0, 500),
  };
}

export async function scanZipFile(file: File): Promise<ScannedComponent[]> {
  const zip = new JSZip();
  const loaded = await zip.loadAsync(file);
  const components: ScannedComponent[] = [];

  const scriptFiles = Object.entries(loaded.files).filter(
    ([path]) => /\.(tsx?|jsx?)$/.test(path) && !path.includes("node_modules"),
  );

  for (const [path, zipFile] of scriptFiles) {
    const code = await zipFile.async("string");
    const comp = extractComponentInfo(code, path);
    if (comp) components.push(comp);
  }

  return components;
}

export function buildComponentLibraryPrompt(components: ScannedComponent[]): string {
  if (!components.length) return "";
  return `USER'S EXISTING COMPONENT LIBRARY:
${components
  .map(
    (c) => `Component: ${c.name}
Props: { ${c.propsSignature} }
Description: ${c.description}
Import: import { ${c.name} } from '${c.importPath}'`,
  )
  .join("\n\n")}

REUSE these components wherever appropriate in the build.
Match their existing style and patterns exactly.
Do NOT reinvent components that already exist in their library.`;
}

export function saveScannedComponents(components: ScannedComponent[]): void {
  try { localStorage.setItem(LS_COMPONENTS, JSON.stringify(components)); } catch { /* ignore */ }
}

export function loadScannedComponents(): ScannedComponent[] {
  try {
    const raw = localStorage.getItem(LS_COMPONENTS);
    return raw ? (JSON.parse(raw) as ScannedComponent[]) : [];
  } catch { return []; }
}
