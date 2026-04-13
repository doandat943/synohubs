import { Download as DownloadIcon, Smartphone, Monitor, ArrowDownCircle } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';
import { useState, useEffect } from 'react';

const VERSION_JSON_URL = '/releases/version.json';

/* ── SVG Icons ── */
const AndroidIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.523 2.277l1.538-2.662a.4.4 0 00-.7-.392L16.8 1.9a8.65 8.65 0 00-4.8-1.4 8.65 8.65 0 00-4.8 1.4L5.64-.777a.4.4 0 00-.7.392l1.538 2.662A8.42 8.42 0 002.5 9.5h19a8.42 8.42 0 00-3.977-7.223zM7 7a1 1 0 110-2 1 1 0 010 2zm10 0a1 1 0 110-2 1 1 0 010 2zM2.5 10.5v8A1.5 1.5 0 004 20h1v3.5a1.5 1.5 0 003 0V20h4v3.5a1.5 1.5 0 003 0V20h1a1.5 1.5 0 001.5-1.5v-8h-15zm-3 0a1.5 1.5 0 00-1.5 1.5v5a1.5 1.5 0 003 0v-5a1.5 1.5 0 00-1.5-1.5zm21 0a1.5 1.5 0 00-1.5 1.5v5a1.5 1.5 0 003 0v-5a1.5 1.5 0 00-1.5-1.5z" transform="translate(0,0) scale(0.85)"/>
  </svg>
);

const WindowsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.852"/>
  </svg>
);

export default function Download() {
  const { t } = useI18n();
  const dl = t.download;
  const [apkUrl, setApkUrl] = useState('#');
  const [version, setVersion] = useState('');

  useEffect(() => {
    fetch(VERSION_JSON_URL)
      .then(r => r.json())
      .then(data => {
        setApkUrl(data.apkUrl || '#');
        setVersion(data.version || '');
      })
      .catch(() => {});
  }, []);

  return (
    <section id="download" className="section download-section">
      <div className="container">
        <div className="text-center">
          <span className="section-badge">{dl.badge}</span>
          <h2 className="section-title">{dl.title}</h2>
          <p className="section-subtitle">{dl.subtitle}</p>
        </div>

        <div className="dl-platforms">
          {/* ── Android Card ── */}
          <div className="dl-card dl-card--android">
            <div className="dl-card__icon dl-card__icon--android">
              <AndroidIcon />
            </div>
            <div className="dl-card__info">
              <h3 className="dl-card__platform">Android</h3>
              <p className="dl-card__desc">APK • Android 5.0+</p>
            </div>
            <a href={apkUrl} className="dl-card__btn dl-card__btn--primary" rel="noopener noreferrer">
              <DownloadIcon size={15} />
              {dl.androidBtn || 'Download APK'}
            </a>
          </div>

          {/* ── Windows Card ── */}
          <div className="dl-card dl-card--windows">
            <div className="dl-card__icon dl-card__icon--windows">
              <WindowsIcon />
            </div>
            <div className="dl-card__info">
              <h3 className="dl-card__platform">Windows</h3>
              <p className="dl-card__desc">Windows 10+ • 64-bit</p>
            </div>
            <div className="dl-card__actions">
              <a href="/downloads/SynoHubs_0.1.0_x64-setup.exe" className="dl-card__btn dl-card__btn--windows" rel="noopener noreferrer">
                <DownloadIcon size={14} />
                .exe Installer
              </a>
              <a href="/downloads/SynoHubs_0.1.0_x64_en-US.msi" className="dl-card__btn dl-card__btn--windows-alt" rel="noopener noreferrer">
                <DownloadIcon size={14} />
                .msi Package
              </a>
            </div>
          </div>
        </div>

        {/* Version info */}
        <div className="dl-version">
          {version && <span className="dl-version__tag">v{version}</span>}
          <span className="dl-version__text">{dl.requirement}</span>
        </div>

        {/* QR Code */}
        <div className="download-qr-section">
          <p className="qr-label">{dl.qrLabel}</p>
          <div className="qr-code-box">
            <img
              src={'https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=https%3A%2F%2Fsynohubs.com%2F%23download&bgcolor=ffffff&color=0a0e1a&format=svg'}
              alt="QR Code - synohubs.com"
              width="140"
              height="140"
              style={{ borderRadius: 8 }}
            />
          </div>
          <p style={{ fontSize: '.8rem', color: 'var(--text-dim)', marginTop: 8 }}>synohubs.com</p>
        </div>
      </div>
    </section>
  );
}
