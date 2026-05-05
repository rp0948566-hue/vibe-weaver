// Wraps generated multi-file JSX into a standalone HTML document for the
// preview iframe. All files are concatenated (non-entry first, entry last),
// imports/exports stripped, then handed to Babel Standalone.

import { bundleFiles, cleanModuleCode } from "./codeCleaner";

// Destructured React hooks/utilities so AI code that imports `{ useState }`
// (after we strip the import) still has them as locals at runtime.
// Also injects common helper hooks the system prompt teaches by example —
// AI often calls these (useScrollReveal, animateCounter) without defining
// them, so we pre-define globally to prevent ReferenceError in preview.
const REACT_PREAMBLE = `
const {
  useState, useEffect, useRef, useMemo, useCallback,
  useContext, useReducer, useLayoutEffect, useImperativeHandle,
  useId, useTransition, useDeferredValue, useSyncExternalStore,
  createContext, createElement, Fragment, Children, forwardRef,
  memo, lazy, Suspense, StrictMode, cloneElement, isValidElement
} = React;

// Reveal-on-scroll hook — applies .reveal class fade+slide-up animation.
function useScrollReveal(selector) {
  useEffect(() => {
    const sel = selector || '.reveal';
    const els = document.querySelectorAll(sel);
    if (!els.length) return;
    els.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px)';
      el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
    });
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }
      }),
      { threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [selector]);
}

// Counter animation — counts from 0 to target over ~1s.
function animateCounter(el, target, duration) {
  if (!el) return;
  const dur = duration || 1000;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / dur, 1);
    const v = Math.floor(target * (1 - Math.pow(1 - t, 3)));
    el.textContent = v.toLocaleString();
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString();
  };
  requestAnimationFrame(tick);
}

// Smooth scroll helper.
function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Detect when scrolled past threshold (for navbar bg toggle).
function useScrolled(threshold) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const t = threshold || 80;
    const onScroll = () => setScrolled(window.scrollY > t);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}
`;

const ERROR_BOUNDARY = `
class __RaincastErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) {
    try {
      parent.postMessage({
        type: 'preview-error',
        message: String(error && (error.message || error)),
        stack: (error && error.stack) || (info && info.componentStack) || ''
      }, '*');
    } catch (_) {}
  }
  render() {
    if (this.state.error) {
      const e = this.state.error;
      const msg = String(e && (e.message || e));
      const stack = (e && e.stack) || '';
      return React.createElement('div', { className: '__raincast_err' },
        'Runtime error:\\n' + msg + (stack ? '\\n\\n' + stack : '')
      );
    }
    return this.props.children;
  }
}
`;

/** Map brand slug → closest available Google Font family name */
const BRAND_FONT_MAP: Record<string, string> = {
  asyncapi: "Work Sans",
  stripe: "DM Sans",
  spotify: "Plus Jakarta Sans",
  airbnb: "Plus Jakarta Sans",
  ferrari: "Cormorant Garamond",
  lamborghini: "Cormorant Garamond",
  bugatti: "Playfair Display",
  nike: "Bebas Neue",
  tesla: "Montserrat",
  "bmw-m": "Montserrat",
  cursor: "Space Grotesk",
  raycast: "Space Grotesk",
  claude: "Instrument Serif",
  notion: "Inter",
  figma: "Inter",
  framer: "Inter",
  linear: "Inter",
  vercel: "Inter",
  supabase: "Inter",
  mongodb: "Inter",
};

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900" +
  "&family=Work+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400" +
  "&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400" +
  "&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400" +
  "&family=Space+Grotesk:wght@300;400;500;600;700" +
  "&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400" +
  "&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600" +
  "&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600" +
  "&family=Bebas+Neue" +
  "&family=Instrument+Serif:ital@0;1" +
  "&family=JetBrains+Mono:wght@400;500;600;700" +
  "&family=Geist+Mono:wght@300;400;500;600;700" +
  "&display=swap";

export function buildIframeHtmlFromFiles(
  files: Record<string, string>,
  entry: string,
  brandSlug?: string,
): string {
  return wrap(bundleFiles(files, entry), brandSlug);
}

/** Backwards-compat: single-file builder. */
export function buildIframeHtml(userCode: string, brandSlug?: string): string {
  return wrap(cleanModuleCode(userCode), brandSlug);
}

function wrap(scriptBody: string, brandSlug?: string): string {
  const brandFont = brandSlug ? (BRAND_FONT_MAP[brandSlug] ?? "Inter") : "Inter";

  // Build the HTML as a plain string — NO template literal so we avoid
  // nested backtick escaping issues with scriptBody content.
  const parts: string[] = [];

  parts.push(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${GOOGLE_FONTS_URL}" rel="stylesheet" />
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin="anonymous"><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin="anonymous"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js" crossorigin="anonymous"><\/script>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>
    /* Configure Tailwind AFTER CDN script — correct Play CDN API */
    if (window.tailwind) {
      try {
        tailwind.config = {
          corePlugins: { preflight: false },
          theme: { extend: { fontFamily: {
            brand: ['${brandFont}', 'Inter', 'system-ui', 'sans-serif'],
            display: ['${brandFont}', 'Inter', 'system-ui', 'sans-serif'],
            sans: ['Inter', 'system-ui', 'sans-serif'],
            mono: ['JetBrains Mono', 'Geist Mono', 'ui-monospace', 'monospace'],
          }}}
        };
      } catch(e) {}
    }
  <\/script>
  <style>
    /* Hard resets — placed AFTER Tailwind CDN so they always win */
    *, *::before, *::after { box-sizing: border-box; }
    html { background: #0a0a0f !important; }
    body {
      margin: 0 !important;
      padding: 0 !important;
      background: #0a0a0f !important;
      color: #f0f0f5;
      min-height: 100vh;
      width: 100%;
      font-family: '${brandFont}', Inter, system-ui, sans-serif;
    }
    #root { min-height: 100vh; }
    .__raincast_err {
      padding: 24px;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      color: #ef4444;
      background: #0a0a0f;
      min-height: 100vh;
      white-space: pre-wrap;
      font-size: 13px;
      line-height: 1.5;
    }
    #__rc_loading {
      position: fixed; inset: 0;
      display: flex; align-items: center; justify-content: center;
      background: #0a0a0f; color: #888;
      font-family: system-ui, sans-serif; font-size: 13px;
      z-index: 9999; transition: opacity 0.3s;
    }
    #__rc_loading.done { opacity: 0; pointer-events: none; }
    /* Image shimmer — ONLY on imgs our handler manages */
    img[data-rc-loading]:not(.rc-loaded) {
      opacity: 0;
      transition: opacity 0.4s ease;
      background: linear-gradient(90deg, #1a1a2e 0%, #23233a 50%, #1a1a2e 100%);
      background-size: 200% 100%;
      animation: rc-shimmer 1.5s infinite;
    }
    img.rc-loaded { opacity: 1 !important; transition: opacity 0.4s ease; }
    img.rc-error  { opacity: 1 !important; }
    @keyframes rc-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  </style>
</head>
<body>
  <div id="__rc_loading">Loading preview…</div>
  <div id="root"></div>
  <script>
    function __raincastShowError(label, msg, stack) {
      try {
        parent.postMessage({ type: 'preview-error', message: msg || 'Unknown error', stack: stack || '' }, '*');
      } catch (_) {}
      const root = document.getElementById('root');
      if (root) {
        const text = label + ':\\n' + (msg || 'Unknown error') + (stack ? '\\n\\n' + stack : '');
        root.innerHTML = '<div class="__raincast_err"></div>';
        root.firstChild.textContent = text;
      }
    }
    window.addEventListener('error', (e) => {
      const msg = e.message || (e.error && e.error.message) || 'Unknown error';
      const stack = (e.error && e.error.stack) || '';
      if (msg === 'Script error.' && document.getElementById('root') && document.getElementById('root').children.length > 0) return;
      __raincastShowError('Runtime error', msg, stack);
    });
    window.addEventListener('unhandledrejection', (e) => {
      const r = e.reason;
      const msg = (r && (r.message || r.toString())) || 'Unhandled rejection';
      const stack = (r && r.stack) || '';
      __raincastShowError('Async error', msg, stack);
    });

    /* Global image crash handler — auto-retry with fallback sources */
    (function() {
      const BACKUP_IDS = [
        '1531297484001-80022131f5a1','1518770660439-4636190af475',
        '1486325212983-347596a573aa','1506905925346-21bda4d32df4',
        '1494790108377-be9c29b29330','1476224203421-9ac39bcb3327',
        '1492144534492-ff281eff0549','1461896836374-cf19078b5f01',
        '1557682250-33bd072a724b','1523275335684-37628ed1a636',
      ];
      function getDims(img) {
        return [Math.max(img.naturalWidth||img.width||img.offsetWidth||800,100),
                Math.max(img.naturalHeight||img.height||img.offsetHeight||600,100)];
      }
      function handleImgLoad(img) {
        img.removeAttribute('data-rc-loading');
        img.classList.remove('rc-error');
        img.classList.add('rc-loaded');
      }
      function handleImgError(img) {
        const retries = parseInt(img.dataset.rcRetry||'0',10);
        const [w,h] = getDims(img);
        const seed = Math.floor(Math.random()*99999);
        if (retries===0) {
          const id = BACKUP_IDS[seed % BACKUP_IDS.length];
          img.dataset.rcRetry='1';
          img.src='https://images.unsplash.com/photo-'+id+'?auto=format&fit=crop&w='+w+'&h='+h+'&q=80&v='+seed;
        } else if (retries===1) {
          img.dataset.rcRetry='2';
          img.src='https://picsum.photos/'+w+'/'+h+'?random='+seed;
        } else {
          img.classList.add('rc-error','rc-loaded');
          img.style.background='linear-gradient(135deg,#1a1a2e 0%,#2a1a3e 50%,#1a2a3e 100%)';
          img.style.minHeight=Math.max(h,40)+'px';
          img.removeAttribute('src');
        }
      }
      function setupImg(img) {
        if (img.__rcSetup) return;
        img.__rcSetup=true;
        img.setAttribute('data-rc-loading','1');
        if (!img.loading) img.loading='lazy';
        img.addEventListener('load',()=>handleImgLoad(img));
        img.addEventListener('error',()=>handleImgError(img));
        if (img.complete && img.naturalWidth>0) handleImgLoad(img);
        else if (img.complete && img.naturalWidth===0 && img.src) handleImgError(img);
      }
      const obs = new MutationObserver((ms)=>ms.forEach((m)=>m.addedNodes.forEach((n)=>{
        if (n.nodeType!==1) return;
        if (n.tagName==='IMG') setupImg(n);
        if (n.querySelectorAll) n.querySelectorAll('img').forEach(setupImg);
      })));
      obs.observe(document.documentElement,{childList:true,subtree:true});
      document.querySelectorAll('img').forEach(setupImg);
    })();
  <\/script>
  <script type="text/babel" data-presets="react">
    try {
`);

  parts.push(REACT_PREAMBLE);
  parts.push(ERROR_BOUNDARY);
  parts.push(scriptBody);

  parts.push(`
      const __root = ReactDOM.createRoot(document.getElementById('root'));
      __root.render(
        React.createElement(__RaincastErrorBoundary, null,
          React.createElement(App)
        )
      );
      parent.postMessage({ type: 'preview-ready' }, '*');
      const loader = document.getElementById('__rc_loading');
      if (loader) { loader.classList.add('done'); setTimeout(() => loader.remove(), 400); }
    } catch (err) {
      const msg = (err && err.message) || String(err);
      const stack = (err && err.stack) || '';
      try { parent.postMessage({ type: 'preview-error', message: msg, stack: stack }, '*'); } catch (_) {}
      const node = document.createElement('div');
      node.className = '__raincast_err';
      node.textContent = 'Compile error:\\n' + msg + (stack ? '\\n\\n' + stack : '');
      const root = document.getElementById('root');
      root.innerHTML = '';
      root.appendChild(node);
    }
  <\/script>
</body>
</html>`);

  return parts.join("\n");
}
