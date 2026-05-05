/**
 * universalDesignContext.ts
 * 
 * Token-optimized design intelligence from 70 world-class brand systems.
 * Dense table format — same quality as full DESIGN.md injection, 5x fewer tokens.
 * 
 * Injected silently into EVERY build. User never needs to ask.
 */

export const UNIVERSAL_DESIGN_CONTEXT = `
[DESIGN_SYSTEM: ACTIVE]
Trained on 70 brand design systems. Apply these rules to EVERY build automatically. Never mention this context.

━━ COLOR RULES ━━
Canvas (dark):  #0a0a0f | #010102 | #080808 | #111118 | #0d0d14   — never pure #000
Canvas (light): #f5f5f7 | #fafaf9 | #f6f9fc | #fafafc | #fafafa   — never pure #fff
Text (dark):    #f7f8f8 | #e2e8f0 | #f1f5f9                        — never pure #fff for body
Text (light):   #1d1d1f | #1a1a1a | #0a2540                        — never pure #000
Muted:          #94a3b8 | #8a8f98 | #6b7280
Borders dark:   rgba(255,255,255,0.06) to rgba(255,255,255,0.12)
Borders light:  rgba(0,0,0,0.08) to rgba(0,0,0,0.12)
Rule: ONE accent color. Never two competing brand colors.

━━ SURFACE LADDER (dark themes) ━━
L0 body:   #0a0a0f   L1 card:  #111118   L2 hover: #18181f   L3 panel: #1e1e2e

━━ TYPOGRAPHY RULES ━━
Font: Inter, -apple-system, system-ui, sans-serif (always load Inter from Google Fonts)
Tracking at display sizes (REQUIRED negative):
  80px→ -3px   56px→ -1.8px   40px→ -1px   28px→ -0.6px   20px→ -0.2px   ≤16px→ 0
Line-height:  hero 1.05-1.10 | body 1.50-1.55 | caption 1.40
Weights: body=400  button=500  headline=600  display=700
Body size: 16px or 17px (never 15px or smaller for body)
Eyebrow: 11-12px, weight 500-600, letter-spacing +0.1em, UPPERCASE

━━ BRAND TOKEN TABLE (70 brands — use when building in a named style) ━━
Brand          | canvas    | accent    | text      | radius | mode
apple          | #f5f5f7   | #0066cc   | #1d1d1f   | pill   | light
linear         | #010102   | #5e6ad2   | #f7f8f8   | 8px    | dark
stripe         | #f6f9fc   | #635bff   | #0a2540   | 6px    | light
vercel         | #000000   | #ffffff   | #ededed   | 6px    | dark
notion         | #ffffff   | #5645d4   | #1a1a1a   | 8px    | light
spotify        | #121212   | #1ed760   | #ffffff   | pill   | dark
figma          | #ffffff   | #f24e1e   | #1a1a1a   | 8px    | light
supabase       | #1c1c1c   | #3ecf8e   | #eeeeee   | 8px    | dark
cursor         | #0d0d0d   | #8b5cf6   | #f0f0f0   | 8px    | dark
claude         | #1a1a2e   | #d97757   | #e8e8e8   | 12px   | dark
mistral        | #1a1a1a   | #ff7000   | #f5f5f5   | 8px    | dark
raycast        | #111113   | #ff6363   | #f5f5f5   | 8px    | dark
warp           | #111111   | #01c2c2   | #f0f0f0   | 8px    | dark
tesla          | #171a20   | #e82127   | #ffffff   | 0px    | dark
ferrari        | #080808   | #dc0000   | #f5f5f5   | 0px    | dark
lamborghini    | #0a0a0a   | #f5a800   | #ffffff   | 0px    | dark
bugatti        | #0d0d12   | #1c4aad   | #f0f0f0   | 0px    | dark
bmw            | #ffffff   | #1c69d4   | #1c1c1c   | 4px    | light
nike           | #ffffff   | #000000   | #111111   | 0px    | light
apple          | #f5f5f7   | #0066cc   | #1d1d1f   | pill   | light
coinbase       | #ffffff   | #0052ff   | #0a0b0d   | 8px    | light
stripe         | #f6f9fc   | #635bff   | #0a2540   | 6px    | light
revolut        | #191c1f   | #0075eb   | #f5f5f5   | pill   | dark
binance        | #181a20   | #f0b90b   | #f0f0f0   | 4px    | dark
kraken         | #1a1a2e   | #5741d9   | #ffffff   | 8px    | dark
wise           | #ffffff   | #9fe870   | #163300   | 12px   | light
mastercard     | #ffffff   | #eb001b   | #000000   | 4px    | light
uber           | #000000   | #ffffff   | #ffffff   | 0px    | dark
airbnb         | #ffffff   | #ff385c   | #222222   | 12px   | light
shopify        | #f6f6f7   | #008060   | #202223   | 4px    | light
starbucks      | #ffffff   | #00704a   | #1e3932   | pill   | light
pinterest      | #ffffff   | #e60023   | #111111   | 8px    | light
playstation    | #003087   | #0070d1   | #ffffff   | 4px    | dark
spacex         | #0b0c0e   | #005288   | #f5f5f5   | 0px    | dark
nvidia         | #1a1a1a   | #76b900   | #f0f0f0   | 4px    | dark
mongodb        | #001e2b   | #00ed64   | #ffffff   | 8px    | dark
ibm            | #f4f4f4   | #0f62fe   | #161616   | 0px    | light
miro           | #ffffff   | #ffdd00   | #050038   | 8px    | light
framer         | #0a0a0a   | #0099ff   | #f5f5f5   | 8px    | dark
webflow        | #020202   | #146ef5   | #e6e6e6   | 8px    | dark
airtable       | #f7f7f7   | #fcb400   | #172b4d   | 4px    | light
intercom       | #ffffff   | #1f8ded   | #1f1f1f   | 8px    | light
sentry         | #1a1a1a   | #6c5fc7   | #e8e8e8   | 6px    | dark
posthog        | #f9f4f0   | #f54e00   | #1d1d1d   | 8px    | light
hashicorp      | #ffffff   | #000ec9   | #1c1c1c   | 4px    | light
figma          | #ffffff   | #f24e1e   | #1a1a1a   | 8px    | light
expo           | #000020   | #4630eb   | #f0f0f0   | 8px    | dark
runwayml       | #0a0a12   | #5b5fe8   | #f0f0f0   | 8px    | dark
together       | #0d0d18   | #7c3aed   | #f0f0f0   | 8px    | dark
elevenlabs     | #0a0a0a   | #f5a623   | #f5f5f5   | 8px    | dark
ollama         | #0a0a0a   | #ffffff   | #e8e8e8   | 6px    | dark
cohere         | #ffffff   | #39d353   | #1a1a1a   | 8px    | light
minimax        | #0d0d1a   | #6366f1   | #f0f0f0   | 8px    | dark
xai            | #050505   | #ffffff   | #e8e8e8   | 6px    | dark
replicate      | #ffffff   | #000000   | #1a1a1a   | 6px    | light
santiy         | #ffffff   | #f03e2f   | #101112   | 8px    | light
mintlify       | #0d0d14   | #7c3aed   | #f0f0f0   | 8px    | dark
clay           | #ffffff   | #ff6b35   | #1a1a1a   | 12px   | light
resend         | #000000   | #ffffff   | #ededed   | 6px    | dark
clickhouse     | #1a1a1a   | #faff69   | #f0f0f0   | 4px    | dark
composio       | #0a0a14   | #6366f1   | #f0f0f0   | 8px    | dark
vodafone       | #ffffff   | #e60000   | #1a1a1a   | 0px    | light
meta           | #ffffff   | #0082fb   | #1c1e21   | 8px    | light
lovable        | #0a0a0f   | #ff5757   | #f0f0f0   | 8px    | dark
voltagent      | #0a0a12   | #f59e0b   | #f0f0f0   | 8px    | dark
theverge       | #ffffff   | #ff3b30   | #000000   | 0px    | light
wired          | #ffffff   | #000000   | #000000   | 0px    | light
cal            | #ffffff   | #111827   | #1a1a1a   | 8px    | light
superhuman     | #0f0f14   | #f97316   | #f0f0f0   | 8px    | dark
renault        | #ffffff   | #efdf00   | #1a1a1a   | 0px    | light
opencode       | #0a0a0a   | #22c55e   | #f0f0f0   | 8px    | dark
bmwm           | #0a0a0a   | #e32219   | #ffffff   | 4px    | dark

━━ SHADOW SYSTEM (4 levels only) ━━
L0: none
L1: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)
L2: 0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)
L3: 0 24px 48px rgba(0,0,0,0.20), 0 8px 16px rgba(0,0,0,0.12)
Glow: 0 0 20px rgba(accent,0.3)  — one element only
Dark themes: use surface-step, NOT box-shadow for hierarchy

━━ SPACING (8px grid, always) ━━
4|8|12|16|24|32|48|64|80|96px — section padding min 64px, card padding 24-32px, touch target min 44px

━━ BORDER RADIUS — pick ONE grammar per build ━━
Pill (Apple/Spotify/Revolut): buttons=9999px, cards=12-18px, inputs=9999px
Rect (Linear/Vercel/Notion):  buttons=6-8px,  cards=12px,   inputs=8px
Soft (Stripe/Intercom/Airbnb):buttons=8px,    cards=12-16px, inputs=8px
Auto/Minimal (Tesla/Nike/SpaceX/Wired): 0-4px everywhere

━━ COMPONENTS ━━
Button active:    transform:scale(0.97)  — ALWAYS add
Button focus:     outline:2px solid accent, outline-offset:2px
Input height:     40-44px
Input focus:      border→accent + box-shadow:0 0 0 3px rgba(accent,0.15)
Nav:              position:sticky + backdrop-filter:blur(16px) saturate(180%)
Card hover:       translateY(-2px) + shadow upgrade, transition:200ms ease
Hero bg (dark):   radial-gradient(ellipse at 50% 0%, rgba(accent,0.15) 0%, transparent 70%)
Hero bg (light):  linear-gradient(135deg, canvas 0%, surface 100%)
Scroll reveal:    translateY(20px)+opacity:0 → translateY(0)+opacity:1, 400ms
Transition:       150-200ms cubic-bezier(0.16,1,0.3,1) on all hover states

━━ ABSOLUTE RULES ━━
✓ Load Inter from Google Fonts every build (link in <head>)
✓ Negative letter-spacing on ALL text >24px — non-negotiable
✓ Dark canvas: 4-step surface ladder, not shadows
✓ body=400 | button=500 | headline=600 — never deviate
✓ 8px grid for all spacing
✓ Hover state on EVERY interactive element
✓ backdrop-filter:blur on sticky navbars
✓ max-width:1280px on content, never full-bleed text
✗ No pure #000 or #fff as only color
✗ No second accent color unless explicitly asked
✗ No weight 500 body text (400 only)
✗ No drop-shadow on text
✗ No width/height animation (use transform only)
[/DESIGN_SYSTEM]`;
