import { describe, it, expect } from "vitest";
import { cleanModuleCode, bundleFiles } from "@/services/codeCleaner";

describe("cleanModuleCode", () => {
  it("strips single-line default import", () => {
    const out = cleanModuleCode(`import React from "react";\nconst x = 1;`);
    expect(out).not.toContain("import");
    expect(out).toContain("const x = 1;");
  });

  it("strips named imports", () => {
    const out = cleanModuleCode(
      `import { useState, useEffect } from "react";\nfunction A(){}`,
    );
    expect(out).not.toContain("import");
    expect(out).toContain("function A()");
  });

  it("strips multi-line named imports", () => {
    const code = [
      "import {",
      "  useState,",
      "  useEffect,",
      '} from "react";',
      "function A() {}",
    ].join("\n");
    const out = cleanModuleCode(code);
    expect(out).not.toMatch(/^import/m);
    expect(out).toContain("function A()");
  });

  it("strips namespace and side-effect imports", () => {
    const code = [
      'import * as THREE from "three";',
      'import "./styles.css";',
      "const a = 1;",
    ].join("\n");
    const out = cleanModuleCode(code);
    expect(out).not.toContain("import");
    expect(out).toContain("const a = 1;");
  });

  it("strips type imports", () => {
    const code = `import type { Foo } from "./types";\nconst a = 1;`;
    expect(cleanModuleCode(code)).not.toContain("import");
  });

  it("converts default export to bare expression", () => {
    const code = `export default function App() { return null; }`;
    expect(cleanModuleCode(code)).toBe(`function App() { return null; }`);
  });

  it("strips named export keyword on declarations", () => {
    const code = `export const Hero = () => null;\nexport function Foo() {}`;
    const out = cleanModuleCode(code);
    expect(out).toContain("const Hero = () => null;");
    expect(out).toContain("function Foo()");
    expect(out).not.toMatch(/^export\s/m);
  });

  it("drops re-export blocks entirely", () => {
    const code = [
      'export { Hero } from "./Hero";',
      'export * from "./util";',
      "export { A, B };",
      "const x = 1;",
    ].join("\n");
    const out = cleanModuleCode(code);
    expect(out).not.toMatch(/^export/m);
    expect(out).toContain("const x = 1;");
  });

  it("handles async function default export", () => {
    const code = `export default async function App() { return null; }`;
    const out = cleanModuleCode(code);
    expect(out).toContain("async function App()");
    expect(out).not.toContain("export default");
  });

  it("strips single-line React hook destructuring", () => {
    const code = `const { useState, useEffect } = React;\nfunction App() {}`;
    const out = cleanModuleCode(code);
    expect(out).not.toContain("const { useState");
    expect(out).toContain("function App()");
  });

  it("strips multi-line React hook destructuring", () => {
    const code = [
      "const {",
      "  useState,",
      "  useEffect,",
      "  useRef,",
      "} = React;",
      "function App() {}",
    ].join("\n");
    const out = cleanModuleCode(code);
    expect(out).not.toMatch(/const\s*\{[\s\S]*?\}\s*=\s*React/);
    expect(out).toContain("function App()");
  });
});

describe("bundleFiles", () => {
  it("emits non-entry files first, entry last, with banners", () => {
    const files = {
      "src/App.jsx": `function App() { return <Hero />; }`,
      "src/Hero.jsx": `function Hero() { return null; }`,
    };
    const out = bundleFiles(files, "src/App.jsx");
    const heroIdx = out.indexOf("src/Hero.jsx");
    const appIdx = out.indexOf("src/App.jsx (entry)");
    expect(heroIdx).toBeGreaterThan(-1);
    expect(appIdx).toBeGreaterThan(-1);
    expect(heroIdx).toBeLessThan(appIdx);
  });

  it("ignores non-script files (css/json/md)", () => {
    const files = {
      "src/App.jsx": `function App() {}`,
      "src/styles.css": `body { margin: 0; }`,
      "src/data.json": `{}`,
    };
    const out = bundleFiles(files, "src/App.jsx");
    expect(out).not.toContain("body { margin: 0; }");
    expect(out).not.toContain("data.json");
  });
});
