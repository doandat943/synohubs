import { Check, Crown, Sparkles } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

export default function Premium() {
  const { t } = useI18n();
  const { free, vip } = t.premium;

  return (
    <section id="premium" className="section">
      <div className="container">
        <div className="text-center">
          <span className="section-badge gold">{t.premium.badge}</span>
          <h2 className="section-title">{t.premium.title}</h2>
          <p className="section-subtitle">{t.premium.subtitle}</p>
        </div>

        <div className="pricing-grid">
          {/* Free Plan */}
          <div className="pricing-card">
            <div className="plan-name">{free.title}</div>
            <div className="plan-price">{free.price}</div>
            <div className="plan-period">{free.period}</div>
            <ul className="pricing-features">
              {free.features.map((f, i) => (
                <li key={i}>
                  <Check size={16} className="check-icon" />
                  {f}
                </li>
              ))}
            </ul>
            <a href="#download" className="btn btn-outline">{free.cta}</a>
          </div>

          {/* VIP Plan */}
          <div className="pricing-card featured">
            <span className="pricing-popular">
              <Crown size={12} /> {vip.popular}
            </span>
            <div className="plan-name" style={{ color: '#fbbf24' }}>
              <Sparkles size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> {vip.title}
            </div>
            <div className="plan-price" style={{ color: '#fbbf24' }}>{vip.price}</div>
            <div className="plan-period">{vip.period}</div>
            <ul className="pricing-features">
              {vip.features.map((f, i) => (
                <li key={i}>
                  <Check size={16} className="check-icon gold" />
                  {f}
                </li>
              ))}
            </ul>
            <a href="#download" className="btn btn-gold">{vip.cta}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
