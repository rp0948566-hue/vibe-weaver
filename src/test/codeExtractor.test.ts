import { describe, it, expect } from "vitest";
import { extractFiles } from "@/services/codeExtractor";

describe("extractFiles", () => {
  it("parses raincast-meta block for type and entry", () => {
    const raw = [
      "```raincast-meta",
      '{ "type": "website", "entry": "src/App.jsx" }',
      "```",
      "",
      "```jsx src/App.jsx",
      "function App() { return <div>hi</div>; }",
      "```",
    ].join("\n");
    const out = extractFiles(raw);
    expect(out.type).toBe("website");
    expect(out.entry).toBe("src/App.jsx");
    expect(out.files["src/App.jsx"]).toContain("function App()");
  });

  it("reads path from first-line // comment when fence has no path (ELITE format)", () => {
    const raw = [
      "```jsx",
      "// src/components/Hero.jsx",
      "export function Hero() { return null; }",
      "```",
    ].join("\n");
    const out = extractFiles(raw);
    expect(out.files["src/components/Hero.jsx"]).toContain("Hero");
    expect(out.files["src/components/Hero.jsx"]).not.toContain(
      "// src/components/Hero.jsx",
    );
  });

  it("reads path from first-line block comment", () => {
    const raw = ["```css", "/* src/styles.css */", "body { margin: 0; }", "```"].join(
      "\n",
    );
    const out = extractFiles(raw);
    expect(out.files["src/styles.css"]).toContain("body { margin: 0; }");
  });

  it("does NOT clobber multiple files when each uses // path comment", () => {
    const raw = [
      "```jsx",
      "// src/App.jsx",
      "function App() { return <Hero />; }",
      "```",
      "",
      "```jsx",
      "// src/components/Hero.jsx",
      "export function Hero() { return <h1>Hero</h1>; }",
      "```",
      "",
      "```jsx",
      "// src/components/Footer.jsx",
      "export function Footer() { return <footer />; }",
      "```",
    ].join("\n");
    const out = extractFiles(raw);
    expect(Object.keys(out.files).sort()).toEqual([
      "src/App.jsx",
      "src/components/Footer.jsx",
      "src/components/Hero.jsx",
    ]);
  });

  it("falls back to src/App.jsx when no path is provided anywhere", () => {
    const raw = ["```jsx", "function App() { return null; }", "```"].join("\n");
    const out = extractFiles(raw);
    expect(out.files["src/App.jsx"]).toContain("function App()");
  });

  it("ignores fenced blocks with non-code languages", () => {
    const raw = ["```text", "just notes", "```"].join("\n");
    const out = extractFiles(raw);
    expect(Object.keys(out.files)).toHaveLength(0);
  });

  it("handles streaming partial fence (open block at EOF)", () => {
    const raw = [
      "```jsx src/App.jsx",
      "function App() { return <div>partial",
    ].join("\n");
    const out = extractFiles(raw);
    expect(out.files["src/App.jsx"]).toContain("partial");
  });

  it("auto-detects entry when meta missing but App.jsx exists", () => {
    const raw = ["```jsx src/App.jsx", "function App() {}", "```"].join("\n");
    const out = extractFiles(raw);
    expect(out.entry).toBe("src/App.jsx");
  });
});
