# RAINCAST — AI Vibe Coding Platform

A three-panel IDE where users describe an app in natural language and instantly see a working React app rendered live in a sandboxed iframe, with the generated code visible side-by-side.

## Platform adjustments

- **Web app** (React 19 + Vite + TypeScript + Tailwind), structured so it can later be wrapped in Tauri externally. No Tauri APIs used in-app.
- **AI routing**: Claude Sonnet via your Anthropic API key (through a secure edge function) + Gemini/GPT‑5 via Lovable AI. Model selector exposes all three. No keys on the client.
- **Persistence**: Lovable Cloud with email/password + Google auth. Projects, chat history, and generated code saved per-user.
- Monaco replaces in-browser Shiki for the code viewer; Shiki can be added later for static highlighting if needed.

## Three-panel IDE layout

```text
┌───────────────────────────────────────────────────────────────┐
│ TOPBAR: Logo · Model selector · New · Projects · Settings     │
├──────────────┬────────────────────────┬───────────────────────┤
│  CHAT        │  CODE (Monaco)         │  LIVE PREVIEW         │
│  25%         │  40%                   │  35%                  │
│  history     │  file tabs             │  iframe sandbox       │
│  input box   │  syntax highlight      │  device toggle        │
│  status dot  │  copy · download .zip  │  reload · errors      │
└──────────────┴────────────────────────┴───────────────────────┘
```

Resizable via `react-resizable-panels`. Below 1200px, panels stack into tabs (Chat / Code / Preview).

## User flow

1. User lands on empty state with prompt suggestions ("todo app", "pricing page", "pomodoro timer").
2. Types a prompt → hits send (or Cmd+Enter).
3. Chat shows streaming assistant tokens with typing dots.
4. As the full response arrives, code is extracted (```jsx / ```tsx / ```html fallback) and:
   - shown in Monaco with syntax highlighting
   - wrapped in the iframe HTML template (React UMD + Babel Standalone + Tailwind CDN) and rendered live
5. User can follow up with "add priority labels" → AI patches the existing code and preview updates.
6. Regenerate, Copy Code, Download .zip available on every build.
7. Projects auto-save to the user's account; accessible from a Projects drawer.

## P0 — Core build (ship first)

- Auth (email/password + Google)
- Zustand store (`messages`, `currentCode`, `isBuilding`, `selectedModel`, `previewHtml`, `activeProjectId`)
- Chat panel: message history, streaming bubbles, typing dots, input with Cmd+Enter
- AI pipeline: system prompt enforces single-file default-exported `App` component, no external imports, Tailwind CDN ok
- Code extractor (regex for fenced blocks, fallback to full response)
- Iframe builder: injects user code into the React+Babel+Tailwind HTML template, rendered via `srcdoc` with `sandbox="allow-scripts"`
- Monaco code viewer (read-only, JetBrains Mono, dark theme)
- Preview panel with error overlay (captures iframe errors via `postMessage`) and reload button
- Model selector: Claude Sonnet, Gemini 2.5 Pro, GPT‑5
- Copy Code + Regenerate

## P1 — High value

- File explorer sidebar (single-file today, multi-file ready)
- Project list + auto-save to Cloud; resume any prior build
- Follow-up edits that patch existing code (sends prior code as context)
- Device toggle: desktop / tablet / mobile frames
- Download as .zip (JSZip)

## P2 — Polish

- Empty-state prompt suggestions
- Toasts (sonner): build success, error, copied, saved
- Cmd+Enter to send, Cmd+K to focus chat
- Animated gradient border on preview while building
- 150ms ease transitions everywhere

## Visual design

- Dark-only theme. Background `#0a0a0f`, panels `#111118`, borders `#1e1e2e`.
- Accent electric blue `#4f8ef7`.
- Inter for UI, JetBrains Mono for code.
- User bubbles: blue pill, right-aligned. Assistant: dark card, left-aligned, markdown rendered.
- Preview panel has inner shadow (device-screen feel) and animated gradient border during builds.

## Error handling

- Non-JSX / broken AI output → error overlay in preview with "Try Again".
- API failures → toast, keep last working preview.
- Iframe runtime errors → captured via `window.onerror` + `postMessage` and shown in overlay.
- Rate limit (429) / credits (402) from Lovable AI → friendly toast explaining the cause.

## Technical details

**Stack**: React 19 + Vite + TypeScript, Tailwind, Zustand, `react-resizable-panels`, `@monaco-editor/react`, `framer-motion`, `lucide-react`, `jszip`, `react-markdown`, `sonner`. Lovable Cloud (auth + Postgres) and edge functions for all AI calls.

**Edge functions**:
- `ai-build-claude` — streams from Anthropic using your `ANTHROPIC_API_KEY` (secret). SSE passthrough.
- `ai-build-gateway` — streams from Lovable AI gateway for Gemini / GPT‑5 models.
- `aiRouter` on the client picks the function based on `selectedModel`.

**Secrets required**: `ANTHROPIC_API_KEY` (you provide). `LOVABLE_API_KEY` auto-provisioned.

**Database schema** (RLS: owner-only):
- `profiles (id, display_name, created_at)`
- `projects (id, user_id, title, created_at, updated_at)`
- `messages (id, project_id, role, content, created_at)`
- `builds (id, project_id, code, model, created_at)` — latest build cached for fast reload

**Iframe template**: exactly the HTML you specified (React 18 UMD + Babel Standalone + Tailwind CDN), injected via `srcdoc`, `sandbox="allow-scripts"`. Errors bubble to parent via `postMessage({type:'preview-error', message})`.

**System prompt** (sent to every model): requires a single self-contained default-exported `App` component, no external imports beyond React, Tailwind CDN classes allowed, return code only — no markdown or prose. Follow-up edits send `[previous code] + [user instruction]` and instruct the model to return the full updated file.

**Code extraction**: try ```jsx → ```tsx → ```html → ```js → full response, stripping any leading/trailing prose.

**File layout** matches your spec under `src/components/{layout,chat,code,preview}`, `src/services/ai`, `src/store`, `src/hooks`.

## Out of scope (for this build)

- Tauri desktop packaging (structure is ready; you'd wrap externally).
- `@rain/editkit` and `@rain/webtools` private packages — swapped for Monaco + standard web APIs. Can be added later via Workspace Build Secrets + `.npmrc` if you want them.
- Multi-file project generation (single-file today; file explorer UI is ready for it).
