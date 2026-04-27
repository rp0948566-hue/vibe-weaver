// Wraps generated JSX in a standalone HTML document for the preview iframe.

export function buildIframeHtml(userCode: string): string {
  // Strip any stray import/export statements — Babel Standalone doesn't handle them.
  const cleaned = userCode
    .replace(/^\s*import\s+[^;]+;?\s*$/gm, "")
    .replace(/export\s+default\s+/g, "")
    .replace(/export\s+\{[^}]*\}\s*;?/g, "");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html, body { margin: 0; padding: 0; font-family: Inter, system-ui, sans-serif; background: #ffffff; }
    #root { min-height: 100vh; }
    .__raincast_err { padding: 24px; font-family: JetBrains Mono, monospace; color: #ef4444; background: #0a0a0f; min-height: 100vh; white-space: pre-wrap; font-size: 13px; line-height: 1.5; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    window.addEventListener('error', (e) => {
      parent.postMessage({ type: 'preview-error', message: e.message, stack: e.error && e.error.stack }, '*');
      const root = document.getElementById('root');
      if (root) {
        root.innerHTML = '<div class="__raincast_err">Runtime error:\\n' + (e.message || 'Unknown error') + '</div>';
      }
    });
    window.addEventListener('unhandledrejection', (e) => {
      parent.postMessage({ type: 'preview-error', message: String(e.reason) }, '*');
    });
  </script>
  <script type="text/babel" data-presets="react">
    try {
      ${cleaned}
      const __root = ReactDOM.createRoot(document.getElementById('root'));
      __root.render(React.createElement(App));
      parent.postMessage({ type: 'preview-ready' }, '*');
    } catch (err) {
      parent.postMessage({ type: 'preview-error', message: err.message, stack: err.stack }, '*');
      document.getElementById('root').innerHTML = '<div class="__raincast_err">Compile error:\\n' + err.message + '</div>';
    }
  </script>
</body>
</html>`;
}
