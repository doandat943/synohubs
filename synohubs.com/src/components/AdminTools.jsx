import { Activity, HardDrive, FileText, Users } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

const ICONS = [
  <Activity key="a" size={22} />,
  <HardDrive key="h" size={22} />,
  <FileText key="f" size={22} />,
  <Users key="u" size={22} />,
];

export default function AdminTools() {
  const { t } = useI18n();

  return (
    <section className="section">
      <div className="container">
        <div className="text-center">
          <span className="section-badge purple">{t.admin.badge}</span>
          <h2 className="section-title">{t.admin.title}</h2>
          <p className="section-subtitle">{t.admin.subtitle}</p>
        </div>

        <div className="admin-grid">
          {t.admin.tools.map((tool, i) => (
            <div className="admin-card" key={i}>
              <div className="icon-wrap">{ICONS[i]}</div>
              <h3>{tool.title}</h3>
              <p>{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
