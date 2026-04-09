import { Heart } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-brand">SynoHub</div>
        <p className="footer-tagline">{t.footer.tagline}</p>
        <div className="footer-links">
          <a href="/privacy.html">{t.footer.links.privacy}</a>
          <a href="/terms.html">{t.footer.links.terms}</a>
          <a href="mailto:support@synohubs.com">{t.footer.links.contact}</a>
        </div>
        <p className="footer-copy">
          {t.footer.madeWith} <Heart size={14} style={{ color: '#f87171', verticalAlign: 'middle' }} /> {t.footer.by} &copy; {new Date().getFullYear()} {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
