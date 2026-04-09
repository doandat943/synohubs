import { Cloud, Wifi, CloudCog, Eye } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

const ICONS = [
  <Cloud key="c" size={22} />,
  <Wifi key="w" size={22} />,
  <CloudCog key="cg" size={22} />,
  <Eye key="e" size={22} />,
];

export default function Security() {
  const { t } = useI18n();

  return (
    <section className="section">
      <div className="container">
        <div className="text-center">
          <span className="section-badge" style={{ background: 'rgba(52,211,153,.15)', color: '#34d399' }}>
            {t.security.badge}
          </span>
          <h2 className="section-title">{t.security.title}</h2>
          <p className="section-subtitle">{t.security.subtitle}</p>
        </div>

        <div className="security-grid">
          {t.security.items.map((item, i) => (
            <div className="security-card" key={i}>
              <div className="icon-wrap">{ICONS[i]}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
