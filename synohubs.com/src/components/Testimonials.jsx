import { Star, MessageSquareQuote } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

export default function Testimonials() {
  const { t } = useI18n();
  const s = t.testimonials;

  return (
    <section className="section testimonials-section">
      <div className="container">
        <div className="text-center">
          <span className="section-badge">{s.badge}</span>
          <h2 className="section-title">{s.title}</h2>
          <p className="section-subtitle">{s.subtitle}</p>
        </div>

        <div className="testimonials-grid">
          {s.items.map((item, i) => (
            <div className="testimonial-card glass" key={i}>
              <div className="testimonial-stars">
                {Array.from({ length: item.stars }).map((_, j) => (
                  <Star key={j} size={14} fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>
              <MessageSquareQuote size={20} className="quote-icon" />
              <p className="testimonial-text">&ldquo;{item.text}&rdquo;</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{item.name[0]}</div>
                <div>
                  <div className="testimonial-name">{item.name}</div>
                  <div className="testimonial-role">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
