import { ShieldCheck, Wifi, Globe, Fingerprint, Layers, CloudUpload, Languages, BadgeCheck, Zap } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

const ICONS = [
  <Layers key="l" size={20} />,
  <CloudUpload key="c" size={20} />,
  <Languages key="la" size={20} />,
  <Fingerprint key="f" size={20} />,
  <Zap key="z" size={20} />,
];

export default function WhySynoHub() {
  const { t } = useI18n();
  const w = t.whySynoHub;

  return (
    <section className="section why-section">
      <div className="container">
        <div className="text-center">
          <span className="section-badge purple">{w.badge}</span>
          <h2 className="section-title">{w.title}</h2>
          <p className="section-subtitle">{w.subtitle}</p>
        </div>

        {/* 3 pillars */}
        <div className="why-pillars">
          {w.pillars.map((p, i) => (
            <div className="why-pillar" key={i}>
              <div className="why-pillar-icon">
                {[<ShieldCheck key="s" size={28} />, <Wifi key="w" size={28} />, <BadgeCheck key="b" size={28} />][i]}
              </div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Unique features */}
        <div className="why-unique">
          <h3 className="why-unique-title">{w.uniqueTitle}</h3>
          <div className="why-unique-grid">
            {w.uniqueItems.map((item, i) => (
              <div className="why-unique-card" key={i}>
                <div className="why-unique-icon">{ICONS[i]}</div>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="why-tagline">{w.tagline}</p>
      </div>
    </section>
  );
}
