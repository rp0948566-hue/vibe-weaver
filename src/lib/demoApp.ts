// Prebuilt "AVANT S" luxury EV landing page.
// Loaded as the initial preview so the IDE opens with a stunning example.

export const DEMO_APP_CODE = `const { useState, useEffect, useMemo } = React;

function App() {
  useEffect(() => {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(l);
  }, []);

  const colors = [
    { id: 'obsidian', name: 'Obsidian',   hex: '#0B0B0D' },
    { id: 'pearl',    name: 'Pearl',      hex: '#E8E4DA' },
    { id: 'oxide',    name: 'Copper Oxide', hex: '#9A6B4E' },
    { id: 'jade',     name: 'Deep Jade',  hex: '#1F3B36' },
  ];
  const [color, setColor] = useState(colors[0]);
  const [trim, setTrim]   = useState('Signature');

  const stats = useMemo(() => ([
    { k: '0–60 mph',   v: '2.1s' },
    { k: 'Range',      v: '412 mi' },
    { k: 'Top Speed',  v: '205 mph' },
    { k: 'Peak Power', v: '1,020 hp' },
  ]), []);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }} className="min-h-screen bg-[#0A0A0B] text-white selection:bg-white/20">
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-black/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-sm bg-gradient-to-br from-white to-white/40 rotate-45" />
            <span style={{ fontFamily: 'Instrument Serif, serif' }} className="text-xl tracking-tight">AVANT</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a className="hover:text-white transition-colors">Model S</a>
            <a className="hover:text-white transition-colors">Performance</a>
            <a className="hover:text-white transition-colors">Interior</a>
            <a className="hover:text-white transition-colors">Configure</a>
          </nav>
          <button className="text-sm px-4 py-2 rounded-full bg-white text-black hover:bg-white/90 transition-colors">
            Reserve
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: "radial-gradient(1200px 500px at 50% 0%, rgba(255,255,255,0.12), transparent 60%)"
        }} />
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-10 relative">
          <p className="text-xs tracking-[0.3em] text-white/50 uppercase mb-6">New · 2026</p>
          <h1 style={{ fontFamily: 'Instrument Serif, serif' }} className="text-[64px] md:text-[112px] leading-[0.95] tracking-tight">
            AVANT <span className="italic text-white/70">S</span>
          </h1>
          <p className="mt-6 max-w-xl text-white/60 text-lg leading-relaxed">
            A thousand horsepower of quiet. Designed in Milano, engineered to vanish into the horizon.
          </p>

          <div className="mt-10 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
            <img
              alt="AVANT S"
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80"
              className="w-full h-[420px] object-cover"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px mt-10 bg-white/5 rounded-xl overflow-hidden border border-white/5">
            {stats.map((s) => (
              <div key={s.k} className="bg-[#0A0A0B] p-6">
                <div className="text-xs text-white/50 tracking-widest uppercase">{s.k}</div>
                <div style={{ fontFamily: 'Instrument Serif, serif' }} className="text-4xl mt-2">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Configurator */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] text-white/40 uppercase mb-2">Configure</p>
            <h2 style={{ fontFamily: 'Instrument Serif, serif' }} className="text-5xl tracking-tight">Make it yours.</h2>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/40 uppercase tracking-widest">From</div>
            <div style={{ fontFamily: 'Instrument Serif, serif' }} className="text-3xl">$186,000</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div className="rounded-2xl overflow-hidden border border-white/10 aspect-[4/3] relative" style={{ background: color.hex }}>
            <div className="absolute inset-0 mix-blend-overlay opacity-60" style={{
              backgroundImage: "radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.5), transparent 60%)"
            }} />
            <div className="absolute bottom-5 left-5 text-xs tracking-widest uppercase" style={{ color: color.id === 'pearl' ? '#0A0A0B' : '#fff' }}>
              {color.name}
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <div className="text-xs text-white/40 uppercase tracking-widest mb-3">Exterior</div>
              <div className="flex gap-3">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColor(c)}
                    aria-label={c.name}
                    className={"w-11 h-11 rounded-full border transition-all " + (color.id === c.id ? 'border-white scale-110' : 'border-white/20 hover:border-white/50')}
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
              <div className="mt-3 text-sm text-white/60">{color.name}</div>
            </div>

            <div>
              <div className="text-xs text-white/40 uppercase tracking-widest mb-3">Trim</div>
              <div className="grid grid-cols-2 gap-3">
                {['Signature', 'Performance'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTrim(t)}
                    className={"px-5 py-4 rounded-xl text-left border transition-colors " + (trim === t ? 'border-white bg-white/5' : 'border-white/10 hover:border-white/30')}
                  >
                    <div className="text-sm">{t}</div>
                    <div className="text-xs text-white/50 mt-1">
                      {t === 'Signature' ? 'Balanced luxury · 620 hp' : 'Track-tuned · 1,020 hp'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full py-4 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors">
              Reserve — $2,500 refundable
            </button>
          </div>
        </div>
      </section>

      {/* Interior */}
      <section className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
          <img
            alt="Interior"
            src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1600&q=80"
            className="rounded-2xl w-full h-[420px] object-cover border border-white/10"
          />
          <div>
            <p className="text-xs tracking-[0.3em] text-white/40 uppercase mb-3">Interior</p>
            <h3 style={{ fontFamily: 'Instrument Serif, serif' }} className="text-5xl tracking-tight leading-[1.05]">
              A cabin carved from <span className="italic text-white/70">silence.</span>
            </h3>
            <p className="mt-5 text-white/60 leading-relaxed">
              Hand-stitched leather, brushed aluminium, and a 19-speaker spatial audio system tuned in an anechoic chamber outside Turin.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <div>© 2026 AVANT Motors · Milano</div>
          <div className="flex gap-6">
            <a className="hover:text-white/70">Press</a>
            <a className="hover:text-white/70">Careers</a>
            <a className="hover:text-white/70">Legal</a>
          </div>
        </div>
      </footer>
    </div>
  );
}`;
