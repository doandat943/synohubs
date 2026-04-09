import { Download, ArrowRight, Shield, Globe, Lock, Zap } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

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
        <div className="hero-actions">
          <a href="#download" className="btn btn-primary">
            <Download size={18} /> {t.hero.downloadBtn}
          </a>
          <a href="#features" className="btn btn-outline">
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
