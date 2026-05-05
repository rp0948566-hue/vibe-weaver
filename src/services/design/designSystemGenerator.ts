const TRIGGERS = [
  "generate a design system",
  "create a design system",
  "build a design system",
  "make a design system",
  "design system for",
  "generate design system",
  "create design tokens",
  "generate tokens",
  "design system tokens",
  "component library",
  "ui kit",
];

export function isDesignSystemRequest(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  return TRIGGERS.some((t) => lower.includes(t));
}

export function buildDesignSystemPrompt(userPrompt: string): string {
  return `${userPrompt}

BUILD A COMPLETE DESIGN SYSTEM as a visual style guide app.

The output must include ALL of these in src/App.jsx (single file style guide):

1. COLOR SYSTEM — full palette with 9 shades (50→950) for each color:
   - primary, neutral, success, warning, danger, info
   - Show each shade as a color swatch with hex value

2. TYPOGRAPHY SCALE — show all type sizes with live text:
   - Display: 72px, 60px, 48px
   - Heading: 36px, 30px, 24px, 20px
   - Body: 16px, 14px, 12px
   - Each with weight variants (400, 500, 600, 700)

3. SPACING SCALE — visual ruler showing 4px grid:
   - 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128px

4. BORDER RADII — visual preview:
   - none, sm (4px), md (8px), lg (16px), xl (24px), full (9999px)

5. SHADOWS — layered shadow system:
   - xs, sm, md, lg, xl, 2xl with live preview cards

6. COMPONENT SHOWCASE — fully interactive:
   - Buttons: primary, secondary, ghost, destructive, outline × sizes (sm/md/lg)
   - Inputs: default, focus, error, disabled states
   - Badges: all variants + colors
   - Cards: default, elevated, bordered variants
   - Avatars: sizes + fallback initials
   - Toggles/Switches: on/off states
   - Progress bars: animated fill
   - Skeleton loaders: animated shimmer

7. ANIMATION TOKENS — show live previews:
   - Duration: 100ms, 200ms, 300ms, 500ms, 700ms
   - Easing: linear, ease-in, ease-out, ease-in-out, spring
   - Effects: fade, slide-up, scale, bounce, shake

Style guide must look like Radix UI Colors / Shadcn / Vercel design system.
Dark background (#0a0a0f). Clean, minimal, world-class presentation.
Every component must be LIVE and INTERACTIVE — no static mockups.`;
}
