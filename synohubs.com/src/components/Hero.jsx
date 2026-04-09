import { Download, ArrowRight, Shield, Globe, Lock, Zap } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

const GithubIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" />
  </svg>
);

export default function Hero() {
  const { t } = useI18n();
  const stats = t.hero.stats;
  const statIcons = [
    <Globe key="g" size={16} />,
    <Lock key="l" size={16} />,
    <Shield key="s" size={16} />,
    <Zap key="z" size={16} />,
  ];
  const statEntries = Object.values(stats);

  return (
    <section className="hero-section">
      <div className="container hero-content">
        <span className="section-badge">{t.hero.badge}</span>
        <h1 className="hero-title">
          {t.hero.title1}<br />
          <span className="gradient">{t.hero.title2}</span>
        </h1>
        <p className="hero-subtitle">{t.hero.subtitle}</p>
        <div className="hero-actions" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="#download" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> {t.hero.downloadBtn}
          </a>
          <a href="https://github.com/duconmang/synohubs" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GithubIcon size={18} /> Open Source
          </a>
          <a href="#features" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {t.hero.learnMore} <ArrowRight size={18} />
          </a>
        </div>
        <div className="hero-stats">
          {statEntries.map((value, i) => (
            <div className="hero-stat" key={i}>
              <div className="value">{statIcons[i]} {value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
