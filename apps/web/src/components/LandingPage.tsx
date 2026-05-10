import { useState, useEffect } from 'react';
import { navigate } from '../router';
import { Icon } from './Icon';

export function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStart = () => {
    navigate({ kind: 'build' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStart();
    }
  };

  return (
    <div className="landing-wrapper">
      {/* Fixed Header */}
      <header className={`landing-header fixed ${scrolled ? 'scrolled' : ''}`}>
        <div className="landing-logo">
          <span className="logo-text">Kairo AI</span>
          <div className="logo-icon-small" style={{ borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
        </div>
        <div className="header-right">
          <button className="upgrade-pill">
            <span style={{ fontSize: '18px', marginRight: '4px' }}>+</span>
            <span>Upgrade Plan</span>
          </button>
          <button className="gift-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12v10H4V12" />
              <path d="M2 7h20v5H2z" />
              <path d="M12 22V7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </button>
          <div className="user-avatar">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky" alt="avatar" />
          </div>
        </div>
      </header>

      {/* Section 1: Hero */}
      <section className="hero-section" style={{ paddingTop: '60px' }}>
        <div className="landing-bg-nature" />
        <div className="hero-content">
          <div className="templates-tag" style={{ marginBottom: '10px' }}>
            <span style={{ color: '#2563eb' }}>Templates</span>
            <span style={{ color: '#94a3b8', margin: '0 4px' }}>Are</span>
            <span style={{ color: '#db2777' }}>Free</span>
            <div className="arrow-circle-black" style={{ background: 'black', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </div>
          </div>
          
          <h1 className="hero-main-title">Idea to website</h1>

          <div className="hero-prompt-container">
            <div className="glass-prompt-box">
              <textarea
                placeholder="Build a landing page for my ecommerce skincare brand that drives sales"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ height: '80px', fontSize: '24px' }}
              />
              <div className="prompt-actions-row">
                <button className="enhance-chip">
                  <Icon name="sparkles" size={16} strokeWidth={2.5} />
                  <span>Enhance prompt</span>
                </button>
                <div className="actions-right" style={{ gap: '24px' }}>
                  <button className="ghost-icon-btn"><Icon name="plus" size={28} /></button>
                  <button className="ghost-icon-btn"><Icon name="mic" size={28} /></button>
                  <button className="blue-send-btn" onClick={handleStart}>
                    <Icon name="arrow-up" size={28} strokeWidth={3.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-templates-preview">
            <div className="preview-grid">
              <TemplatePreviewCard 
                img="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800" 
                title="HVAC" 
              />
              <TemplatePreviewCard 
                img="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800" 
                title="Web Agency" 
                isDark 
              />
              <TemplatePreviewCard 
                img="https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=800" 
                title="Landscaping" 
              />
              <TemplatePreviewCard 
                img="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800" 
                title="Luxury Travel Agency" 
                overlay="Luxuria"
              />
            </div>
            <div className="preview-footer">
              <button className="white-pill-btn">
                <span>View All Templates</span>
                <div className="arrow-in-circle" style={{ background: '#f1f5f9', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </div>
              </button>
              <div className="mini-nav">
                <button className="nav-circ"><Icon name="chevron-left" size={20} strokeWidth={3} /></button>
                <button className="nav-circ"><Icon name="chevron-right" size={20} strokeWidth={3} /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Templates Explorer */}
      <section className="explorer-section">
        <div className="explorer-header">
          <h2>
            Start with a <span className="w-logo-box">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span> Template in seconds
          </h2>
          <p className="subtext">Browse our collection of professionally designed templates</p>
          <div className="search-bar-container">
            <div className="search-bar">
              <Icon name="search" size={20} />
              <input type="text" placeholder="Search templates..." />
            </div>
          </div>
        </div>

        <div className="full-template-grid">
          <TemplateFullCard 
            img="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800" 
            title="HVAC" 
            desc="Your Comfort Is Our Priority" 
            color="#eff6ff"
          />
          <TemplateFullCard 
            img="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800" 
            title="Web Agency" 
            desc="We Build Digital Experiences" 
            isDark
            color="#f1f5f9"
          />
          <TemplateFullCard 
            img="https://images.unsplash.com/photo-1595113316349-9fa4eb24f884?q=80&w=800" 
            title="Landscaping" 
            desc="Transform Your Outdoor Space" 
            color="#f0fdf4"
          />
          <TemplateFullCard 
            img="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800" 
            title="Luxury Travel Agency" 
            desc="Experience the world's most extraordinary destinations" 
            overlay="Luxuria"
            color="#eff6ff"
          />
          <TemplateFullCard 
            img="https://images.unsplash.com/photo-1631217816660-ad3535d9d771?q=80&w=800" 
            title="Roofing" 
            desc="Your Roof. Our Reputation." 
            color="#fff7ed"
          />
          <TemplateFullCard 
            img="https://images.unsplash.com/photo-1512418490979-92798cccf340?q=80&w=800" 
            title="Skincare" 
            desc="Pure, natural skincare formulated for radiant, healthy skin" 
            overlay="Luminé"
            color="#f9fafb"
          />
          <TemplateFullCard 
            img="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800" 
            title="Personal Trainer" 
            desc="Transform Your Body, Transform Your Life" 
            color="#fef2f2"
          />
          <TemplateFullCard 
            img="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800" 
            title="Dentist" 
            desc="California's Premier Luxury Dental Practice" 
            color="#f0f9ff"
          />
          <TemplateFullCard 
            img="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800" 
            title="Skincare Luxury" 
            desc="A Fragrance That Lingers Long After You Leave" 
            color="#fdf2f8"
          />
        </div>

        <div className="explorer-footer">
          <button className="see-more-btn">See More</button>
          <div className="pagination">
            <button className="pag-btn disabled"><Icon name="chevrons-left" size={18} /></button>
            <button className="pag-btn disabled"><Icon name="chevron-left" size={18} /></button>
            <div className="pag-numbers">
              <span className="active">1</span>
              <span className="sep">of</span>
              <span>2</span>
            </div>
            <button className="pag-btn"><Icon name="chevron-right" size={18} /></button>
            <button className="pag-btn"><Icon name="chevrons-right" size={18} /></button>
          </div>
        </div>
      </section>

      {/* Section 3: Giant Footer */}
      <footer className="giant-footer">
        <div className="footer-brand">
          <h1 className="footer-logo-text">Kairo AI</h1>
        </div>
        <div className="footer-links-container">
          <div className="footer-col">
            <a href="#"><Icon name="chevron-right" size={16} /> Templates</a>
            <a href="#"><Icon name="chevron-right" size={16} /> My Projects</a>
            <a href="#"><Icon name="chevron-right" size={16} /> Pricing</a>
            <a href="#"><Icon name="chevron-right" size={16} /> Documentation</a>
          </div>
          <div className="footer-col">
            <a href="#"><Icon name="chevron-right" size={16} /> X (Twitter)</a>
            <a href="#"><Icon name="chevron-right" size={16} /> LinkedIn</a>
            <a href="#"><Icon name="chevron-right" size={16} /> Instagram</a>
            <a href="#"><Icon name="chevron-right" size={16} /> Discord</a>
          </div>
          <div className="footer-col">
            <a href="#"><Icon name="chevron-right" size={16} /> Privacy Policy</a>
            <a href="#"><Icon name="chevron-right" size={16} /> Terms of Service</a>
            <a href="#"><Icon name="chevron-right" size={16} /> Cookie Policy</a>
            <a href="#"><Icon name="chevron-right" size={16} /> Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TemplatePreviewCard({ img, title, isDark, overlay }: any) {
  return (
    <div className={`preview-card ${isDark ? 'dark' : ''}`}>
      <div className="card-img-wrap">
        <img src={img} alt={title} />
        {overlay && <div className="card-overlay-text">{overlay}</div>}
      </div>
      <div className="card-label">{title}</div>
    </div>
  );
}

function TemplateFullCard({ img, title, desc, isDark, overlay, color }: any) {
  return (
    <div className="full-template-card">
      <div className="full-card-top" style={{ background: color || '#f8fafc' }}>
        <div className={`full-card-inner ${isDark ? 'dark' : ''}`}>
          <img src={img} alt={title} />
          {overlay && <div className="full-card-overlay">{overlay}</div>}
        </div>
      </div>
      <div className="full-card-info">
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </div>
  );
}
