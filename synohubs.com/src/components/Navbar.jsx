import { useState, useEffect, useRef } from 'react';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

const GithubIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" />
  </svg>
);

export default function Navbar() {
  const { t, lang, changeLang, languages } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const currentLang = languages.find((l) => l.code === lang);

  const navItems = [
    { href: '#features', label: t.nav.features },
    { href: '#premium', label: t.nav.premium },
    { href: '#screenshots', label: t.nav.screenshots },
    { href: '#download', label: t.nav.download },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <a href="#" className="nav-brand">
          <span className="logo-icon">S</span>
          SynoHub
        </a>

        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navItems.map((item) => (
            <li key={item.href}>
              <a href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
            </li>
          ))}
        </ul>

        <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="https://github.com/duconmang/synohubs" target="_blank" rel="noopener noreferrer" className="github-link" style={{ color: 'var(--text)', opacity: 0.8, display: 'flex', alignItems: 'center' }}>
            <GithubIcon size={20} />
          </a>
          <div className={`lang-dropdown ${langOpen ? 'open' : ''}`} ref={dropdownRef}>
            <button className="lang-btn" onClick={() => setLangOpen(!langOpen)}>
              <Globe size={16} />
              <span>{currentLang?.flag} {currentLang?.name}</span>
              <ChevronDown size={14} />
            </button>
            <div className="lang-menu">
              {languages.map((l) => (
                <button
                  key={l.code}
                  className={`lang-option ${l.code === lang ? 'active' : ''}`}
                  onClick={() => { changeLang(l.code); setLangOpen(false); }}
                >
                  <span>{l.flag}</span>
                  <span>{l.name}</span>
                </button>
              ))}
            </div>
          </div>
          <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
