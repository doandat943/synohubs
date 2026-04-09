import { useState, useEffect, useRef } from 'react';
import { Menu, X, Globe, ChevronDown, Github } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

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
            <Github size={20} />
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
