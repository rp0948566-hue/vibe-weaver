export interface FigmaFill {
  type: string;
  color?: { r: number; g: number; b: number; a: number };
}

export interface FigmaTextStyle {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  lineHeightPx?: number;
  letterSpacing?: number;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
  backgroundColor?: { r: number; g: number; b: number; a: number };
  fills?: FigmaFill[];
  style?: FigmaTextStyle;
  children?: FigmaNode[];
  cornerRadius?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  layoutMode?: string;
}

export interface DesignTokens {
  colors: string[];
  fontSizes: number[];
  fontFamilies: string[];
  borderRadii: number[];
  components: string[];
  rawDocument?: FigmaNode;
}

function rgbaToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, "0");
  return "#" + toHex(r) + toHex(g) + toHex(b);
}

export function isFigmaUrl(text: string): boolean {
  return /figma\.com\/(file|design)\/[a-zA-Z0-9]+/.test(text);
}

export function parseFigmaUrl(url: string): { fileKey: string; nodeId: string | null } {
  const match = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
  const nodeMatch = url.match(/node-id=([^&\s]+)/);
  return {
    fileKey: match?.[1] ?? "",
    nodeId: nodeMatch ? decodeURIComponent(nodeMatch[1]) : null,
  };
}

function walkNode(node: FigmaNode, acc: {
  colors: Set<string>;
  fontSizes: Set<number>;
  fontFamilies: Set<string>;
  borderRadii: Set<number>;
  components: string[];
}) {
  if (node.fills) {
    for (const fill of node.fills) {
      if (fill.type === "SOLID" && fill.color) {
        acc.colors.add(rgbaToHex(fill.color.r, fill.color.g, fill.color.b));
      }
    }
  }
  if (node.style?.fontSize) acc.fontSizes.add(node.style.fontSize);
  if (node.style?.fontFamily) acc.fontFamilies.add(node.style.fontFamily);
  if (node.cornerRadius) acc.borderRadii.add(node.cornerRadius);
  if (node.type === "COMPONENT" || node.type === "COMPONENT_SET") acc.components.push(node.name);
  if (node.children) node.children.forEach((child) => walkNode(child, acc));
}

export async function extractDesignTokens(fileKey: string, token: string): Promise<DesignTokens> {
  const resp = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
    headers: { "X-Figma-Token": token },
  });
  if (!resp.ok) throw new Error(`Figma API error: ${resp.status}`);
  const data = await resp.json() as { document: FigmaNode };

  const acc = {
    colors: new Set<string>(),
    fontSizes: new Set<number>(),
    fontFamilies: new Set<string>(),
    borderRadii: new Set<number>(),
    components: [] as string[],
  };
  walkNode(data.document, acc);

  return {
    colors: Array.from(acc.colors),
    fontSizes: Array.from(acc.fontSizes).sort((a, b) => a - b),
    fontFamilies: Array.from(acc.fontFamilies),
    borderRadii: Array.from(acc.borderRadii),
    components: [...new Set(acc.components)],
    rawDocument: data.document,
  };
}

export async function getFigmaFrameImage(
  fileKey: string,
  nodeId: string,
  token: string,
): Promise<string> {
  const id = nodeId.replace("-", ":");
  const resp = await fetch(
    `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(id)}&format=png&scale=2`,
    { headers: { "X-Figma-Token": token } },
  );
  if (!resp.ok) throw new Error(`Figma images API error: ${resp.status}`);
  const data = await resp.json() as { images: Record<string, string> };
  const imageUrl = data.images?.[id] ?? data.images?.[nodeId] ?? "";
  return imageUrl;
}

export function buildFigmaToCodePrompt(tokens: DesignTokens): string {
  return `You are building a pixel-perfect React implementation of a Figma design.

EXTRACTED DESIGN TOKENS:
Colors: ${tokens.colors.join(", ")}
Font Sizes: ${tokens.fontSizes.map((s) => s + "px").join(", ")}
Font Families: ${tokens.fontFamilies.join(", ")}
Border Radii: ${tokens.borderRadii.map((r) => r + "px").join(", ")}
Components detected: ${tokens.components.join(", ")}

The design image is attached. Build a PIXEL-PERFECT implementation:
- Use the EXACT colors extracted above — not approximations
- Match font sizes and families exactly
- Match border radius values exactly
- Match spacing and layout exactly
- Every component visible in the design must be built
- Result must look identical to the Figma design`;
}
