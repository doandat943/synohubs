import { Download as DownloadIcon, Smartphone, Monitor, Cpu } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

const APK_LINKS = {
  arm64: {
    label: 'ARM64 (v8a)',
    url: 'https://drive.google.com/uc?export=download&id=1Ei7fGRxvlRriAZUpwkr020tc3quqWvjd',
  },
  armv7: {
    label: 'ARMv7 (armeabi)',
    url: 'https://drive.google.com/uc?export=download&id=1I14nsdTwqOe2GrbiVk0N7fCSM6hVS9ws',
  },
  x86: {
    label: 'x86_64',
    url: 'https://drive.google.com/uc?export=download&id=1LlmkbyvikMZ-TRaf0w5YHc73c2qitvdC',
  },
};

export default function Download() {
  const { t } = useI18n();
  const dl = t.download;

  return (
    <section id="download" className="section download-section">
      <div className="container">
        <div className="text-center">
          <span className="section-badge">{dl.badge}</span>
          <h2 className="section-title">{dl.title}</h2>
          <p className="section-subtitle">{dl.subtitle}</p>
        </div>

        <div className="download-box">
          <Smartphone size={48} style={{ color: '#22d3ee', marginBottom: 24 }} />

          {/* Primary download */}
          <a href={APK_LINKS.arm64.url} className="btn btn-primary" style={{ marginBottom: 12 }} rel="noopener noreferrer">
            <DownloadIcon size={18} /> {dl.androidBtn}
          </a>
          <p style={{ fontSize: '.85rem', color: 'var(--text-dim)', marginBottom: 24 }}>{dl.recommended}</p>

          {/* Architecture variants */}
          <div className="download-variants">
            {Object.entries(APK_LINKS).map(([key, apk]) => (
              <a key={key} href={apk.url} className="download-variant" rel="noopener noreferrer">
                <div className="variant-icon">
                  {key === 'arm64' ? <Smartphone size={16} /> : key === 'armv7' ? <Cpu size={16} /> : <Monitor size={16} />}
                </div>
                <div className="variant-info">
                  <div className="variant-label">{apk.label}</div>
                  <div className="variant-desc">{dl.archDesc?.[key] || apk.label}</div>
                </div>
                <DownloadIcon size={14} style={{ color: 'var(--cyan)', opacity: .6 }} />
              </a>
            ))}
          </div>

          <div className="version-info">
            <span>{dl.requirement}</span>
            <span>•</span>
            <span>{dl.version}</span>
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
      </div>
    </section>
  );
}
