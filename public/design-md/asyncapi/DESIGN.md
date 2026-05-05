# Design System — AsyncAPI (Brand Master)

## 1. Visual Theme & Atmosphere

AsyncAPI uses a bold, developer-friendly design system anchored by deep purple and electric gradient accents. The design combines a dark near-black canvas (`#1B1130`) with a rich purple primary (`#875AE2`) and vivid supplemental colors (cyan, pink, yellow). The system reads as technical yet approachable — built for open-source developers who appreciate precision. The signature element is the brand gradient: a four-layer composition blending cyan (`#2DCCFD`) through purple (`#AD20E2`) that appears in logos, backgrounds, and accent blobs.

**Key Characteristics:**
- Dark canvas `#1B1130` for immersive dark-mode sections; `#FFFFFF` / `#F7F9FA` for light surfaces
- Primary brand purple `#875AE2` — used for CTAs, highlights, interactive elements
- Signature gradient: cyan → purple (`linear-gradient(225deg, #2DCCFD 9.35%, #AD20E2 88.41%)`)
- "Work Sans" (700/600) for all headings — bold, geometric, developer-grade
- "Inter" for all body text — readable, neutral, technical
- Negative letter-spacing on headings: `-0.03em`
- Purple + blue + yellow + pink four-color system (never random; each has a semantic role)

## 2. Color Palette & Roles

### Primary Purple
| Token | Hex | Use |
|-------|-----|-----|
| `primary-600` | `#461E96` | Hover states, dark accents |
| `primary-500` | `#875AE2` | **Main brand accent — CTAs, links, highlights** |
| `primary-400` | `#A87EFC` | Active/selected elements |
| `primary-300` | `#CAB0FC` | Subtle tints, borders |
| `primary-200` | `#E0D1FC` | Background tints |
| `primary-100` | `#F4EFFC` | Very light purple surfaces |

### Secondary Blue
| Token | Hex | Use |
|-------|-----|-----|
| `secondary-600` | `#0B81C3` | Hover blue |
| `secondary-500` | `#47BCEE` | Info, links, secondary CTAs |
| `secondary-400` | `#80D9FF` | Gradient endpoint (cyan side) |
| `secondary-100` | `#EDFAFF` | Blue-tinted surface |

### Tertiary Yellow
| Token | Hex | Use |
|-------|-----|-----|
| `yellow-600` | `#FFB700` | Warnings, highlights |
| `yellow-500` | `#FFD23F` | Sun Burst gradient anchor |
| `yellow-100` | `#FFFDF5` | Very light yellow surface |

### Tertiary Pink
| Token | Hex | Use |
|-------|-----|-----|
| `pink-600` | `#AB006F` | Dark pink hover |
| `pink-500` | `#E50E99` | Sun Burst gradient anchor, accent |
| `pink-400` | `#F06EC2` | Lighter pink accent |
| `pink-100` | `#FFF5FB` | Very light pink surface |

### Neutrals / Gray
| Token | Hex | Use |
|-------|-----|-----|
| `gray-900` | `#242929` | Darkest text |
| `gray-800` | `#364042` | Secondary headings |
| `gray-700` | `#556061` | Body text on light |
| `gray-600` | `#8B9394` | Muted / captions |
| `gray-300` | `#D7DFE0` | Borders, dividers |
| `gray-100` | `#F0F4F5` | Light background |
| `gray-50`  | `#F7F9FA` | Page background (light mode) |

### Base Colors
| Token | Hex | Use |
|-------|-----|-----|
| `white` | `#FFFFFF` | Light surfaces, card backgrounds |
| `black` | `#000000` | Rarely used — prefer `dark` |
| `dark` | `#1B1130` | **Dark canvas, immersive sections** |

### Gradients
| Name | Value |
|------|-------|
| Star Dust (primary) | `linear-gradient(225deg, #2DCCFD 9.35%, #AD20E2 88.41%)` |
| Sun Burst | `linear-gradient(225deg, #FFD23F 9.35%, #E50E99 88.41%)` |
| Full brand gradient | `linear-gradient(225deg, rgba(39,205,252,0.81) 9.36%, rgba(78,156,244,0.7) 25.42%, rgba(110,115,238,0.49) 43.35%, rgba(135,83,233,0.32) 57.58%, rgba(153,60,229,0.2) 70.23%, rgba(164,46,227,0.13) 80.51%, rgba(168,41,226,0.1) 88.42%)` |

## 3. Typography Rules

### Font Families
- **Headings**: `"Work Sans"`, sans-serif — weight 700 (Bold) or 600 (SemiBold)
- **Body**: `"Inter"`, sans-serif — weight 400 (Regular)

### Hierarchy
| Role | Family | Size | Weight | Letter-spacing | Line-height | Color |
|------|--------|------|--------|----------------|-------------|-------|
| Display H1 | Work Sans | 64px | 700 | -0.03em | 1.125em | `#1B1130` (light) / `#FFFFFF` (dark) |
| H2 Subheading | Work Sans | 36px | 700 | -0.03em | 1.125em | `#1B1130` / `gray-300` on dark |
| H3 Section | Work Sans | 28px | 600 | -0.03em | 1.125em | `#1B1130` |
| H4 Card title | Work Sans | 22px | 600 | -0.02em | 1.2em | `#1B1130` |
| Body large | Inter | 18px | 400 | -0.01em | 1.625em | `gray-700` |
| Body | Inter | 16px | 400 | -0.01em | 1.625em | `gray-700` |
| Caption | Inter | 14px | 400 | normal | 1.5em | `gray-600` |
| Button label | Work Sans | 16px | 600 | 0em | 1em | white on purple |

### Principles
- Work Sans for headings only — never for body text
- Inter for all body, captions, labels, UI text
- Negative tracking on headings is non-negotiable
- Body text never below 14px
- Heading color: `#1B1130` on light, `#FFFFFF` on dark
- Body color: `gray-700` (#556061) on light, `gray-300` (#D7DFE0) on dark

## 4. Component Stylings

### Buttons

**Primary Purple**
- Background: `#875AE2`
- Text: `#FFFFFF`
- Padding: 12px 24px
- Radius: 8px
- Font: Work Sans 16px weight 600
- Hover: `#461E96`

**Gradient CTA**
- Background: `linear-gradient(225deg, #2DCCFD 9.35%, #AD20E2 88.41%)`
- Text: `#FFFFFF`
- Padding: 12px 24px
- Radius: 8px
- Font: Work Sans 16px weight 600
- Use: Primary hero CTAs

**Outlined**
- Background: transparent
- Text: `#875AE2`
- Border: `2px solid #875AE2`
- Padding: 10px 24px
- Radius: 8px
- Hover: bg `#F4EFFC`

**Sun Burst (secondary CTA)**
- Background: `linear-gradient(225deg, #FFD23F 9.35%, #E50E99 88.41%)`
- Text: `#FFFFFF`
- Radius: 8px
- Use: Promotional / secondary actions

### Cards & Containers
- Background: `#FFFFFF` (light) / `rgba(255,255,255,0.06)` (dark)
- Border: `1px solid #D7DFE0` (light) / `1px solid rgba(255,255,255,0.1)` (dark)
- Radius: 12px
- Shadow: `0 4px 24px rgba(135,90,226,0.08), 0 1px 3px rgba(0,0,0,0.06)`
- Hover: shadow intensifies, slight translateY(-2px)

### Navigation
- Light mode: `#FFFFFF` bg, sticky, backdrop-blur
- Dark mode: `#1B1130` bg with gradient border-bottom
- Logo: AsyncAPI gradient mark + Work Sans logotype
- Links: Inter 16px weight 400, `gray-700` → `#875AE2` on hover
- CTA: gradient button right-aligned

### Code Blocks / Technical elements
- Background: `#1B1130` or `#242929`
- Font: `JetBrains Mono` or `ui-monospace`
- Color: `#47BCEE` (secondary blue) for keywords
- Accent: `#875AE2` for highlights

## 5. Layout Principles

### Spacing (8px grid)
- XS: 4px | S: 8px | M: 16px | L: 24px | XL: 32px | 2XL: 48px | 3XL: 64px | 4XL: 96px

### Grid & Container
- Max-width: 1280px, centered
- Hero: full-width with gradient background blob, centered content
- Feature grid: 3-column on desktop, 2 on tablet, 1 on mobile
- Section padding: 96px top/bottom on desktop, 64px on mobile

### Dark sections
- Background: `#1B1130`
- Place after light sections for visual rhythm
- Gradient blobs: position at 0% and 100% of section
- Text: white headings, `gray-300` body

## 6. Depth & Elevation

| Level | Shadow | Use |
|-------|--------|-----|
| Flat | none | Body background |
| Soft | `0 1px 3px rgba(0,0,0,0.06)` | Inline elements |
| Card | `0 4px 24px rgba(135,90,226,0.08), 0 1px 3px rgba(0,0,0,0.06)` | Cards, containers |
| Elevated | `0 12px 40px rgba(135,90,226,0.15), 0 4px 8px rgba(0,0,0,0.08)` | Modals, dropdowns |
| Gradient glow | `0 0 40px rgba(135,90,226,0.3)` | Hero elements, gradient blobs |

## 7. Do's and Don'ts

### Do
- Use `#875AE2` purple as primary interactive/CTA color
- Use Work Sans 700 for all headings with `-0.03em` letter-spacing
- Use Inter for all body text
- Apply the Star Dust gradient (`#2DCCFD → #AD20E2`) for primary gradient CTAs and hero accents
- Use `#1B1130` dark canvas for immersive sections (not pure black)
- Use purple-tinted shadows (`rgba(135,90,226,...)`) on cards
- Keep border-radius at 8px for buttons, 12px for cards
- Load both Work Sans and Inter from Google Fonts

### Don't
- Don't use pure `#000000` for backgrounds — use `#1B1130` dark
- Don't use pure `#FFFFFF` as only text color on dark — use `#F7F9FA`
- Don't use orange or red as primary colors — they're outside the palette
- Don't skip Work Sans on headings — Inter headings break the brand voice
- Don't use pink or yellow as primary/CTA colors — they are accent/secondary only
- Don't use radius over 16px or full pill shapes (not part of AsyncAPI language)
- Don't use more than 2 gradient directions on the same page

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Changes |
|------|-------|---------|
| Mobile | <640px | Single column, 40px section padding |
| Tablet | 640–1024px | 2-column grid, 64px padding |
| Desktop | >1024px | Full 3-column, 96px padding |

### Collapsing
- H1: 64px → 40px on mobile
- H2: 36px → 28px on mobile
- Feature grid: 3 → 2 → 1 column
- Nav: full links → hamburger

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary CTA: `#875AE2` (purple-500)
- Primary CTA hover: `#461E96` (purple-600)
- Gradient CTA: `linear-gradient(225deg, #2DCCFD 9.35%, #AD20E2 88.41%)`
- Page background (light): `#F7F9FA` / `#FFFFFF`
- Page background (dark): `#1B1130`
- Heading color (light bg): `#1B1130`
- Heading color (dark bg): `#FFFFFF`
- Body text (light bg): `#556061` (gray-700)
- Body text (dark bg): `#D7DFE0` (gray-300)
- Border (light): `#D7DFE0`
- Accent secondary: `#47BCEE` (blue)
- Accent yellow: `#FFD23F`
- Accent pink: `#E50E99`

### Example Component Prompts
- Hero: "White/gray-50 background with gradient blob `linear-gradient(225deg, #2DCCFD, #AD20E2)` at top-right, 20% opacity. H1 64px Work Sans 700 color #1B1130 tracking -0.03em. Subtitle 18px Inter 400 gray-700. Two buttons: gradient CTA + outlined purple."
- Card: "White bg, 12px radius, border 1px solid #D7DFE0, shadow 0 4px 24px rgba(135,90,226,0.08). Title Work Sans 22px 600 #1B1130. Body Inter 16px gray-700. Hover: translateY(-2px) + stronger purple shadow."
- Dark section: "#1B1130 bg, white Work Sans heading 36px 700. Inter body gray-300. Gradient blob decoration. Purple CTA button."
- Navigation: "White sticky header, backdrop-blur. AsyncAPI gradient logo mark. Inter 16px links, gray-700. Purple gradient CTA button right-aligned."
- Code block: "#1B1130 bg, JetBrains Mono, blue (#47BCEE) keywords, purple (#875AE2) highlights, 12px radius."
- Badge/tag: "purple-100 (#F4EFFC) bg, purple-600 (#461E96) text, 6px radius, Inter 13px 500, no border."

### Iteration Guide
1. Start with white or gray-50 canvas — light is the default mode
2. Use `#875AE2` for every interactive element (buttons, links, active states)
3. Apply Star Dust gradient sparingly — hero CTAs, section accents, illustration backgrounds
4. Work Sans 700 on ALL headings, Inter 400 on ALL body. Never swap.
5. Letter-spacing: -0.03em on headings, -0.01em on body — always negative
6. Dark sections use `#1B1130` — contrast with light sections for rhythm
7. Purple-tinted shadows only — `rgba(135,90,226,...)` not neutral gray
8. 8px grid: every spacing value must be a multiple of 4 or 8
