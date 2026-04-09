import { useState } from 'react';
import { LayoutDashboard, FolderOpen, Film, Image, Check } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

const TABS = ['dashboard', 'fileManager', 'mediaHub', 'photos'];
const ICONS = {
  dashboard: <LayoutDashboard size={18} />,
  fileManager: <FolderOpen size={18} />,
  mediaHub: <Film size={18} />,
  photos: <Image size={18} />,
};

function DashboardMockup() {
  return (
    <div className="mock-dashboard">
      <div className="mock-card">
        <span className="mock-label">CPU</span>
        <span className="mock-value cyan">23%</span>
        <div className="mock-bar"><div className="mock-bar-fill cyan" style={{ width: '23%' }} /></div>
      </div>
      <div className="mock-card">
        <span className="mock-label">RAM</span>
        <span className="mock-value purple">67%</span>
        <div className="mock-bar"><div className="mock-bar-fill purple" style={{ width: '67%' }} /></div>
      </div>
      <div className="mock-card">
        <span className="mock-label">Storage</span>
        <span className="mock-value gold">4.2 TB</span>
        <div className="mock-bar"><div className="mock-bar-fill gold" style={{ width: '52%' }} /></div>
      </div>
      <div className="mock-card">
        <span className="mock-label">Network</span>
        <span className="mock-value green">128 MB/s</span>
        <div className="mock-bar"><div className="mock-bar-fill cyan" style={{ width: '40%' }} /></div>
      </div>
    </div>
  );
}

function FilesMockup() {
  const files = [
    { icon: 'folder', name: 'Documents', size: '2.4 GB' },
    { icon: 'folder', name: 'Media', size: '1.8 TB' },
    { icon: 'video', name: 'vacation_2024.mp4', size: '4.2 GB' },
    { icon: 'image', name: 'photo_001.jpg', size: '8.4 MB' },
    { icon: 'doc', name: 'report.pdf', size: '2.1 MB' },
  ];
  return (
    <div className="mock-files">
      <div className="mock-breadcrumb">/volume1/homes/user/</div>
      {files.map((f) => (
        <div className="mock-file-row" key={f.name}>
          <div className={`mock-file-icon ${f.icon}`}>{f.icon === 'folder' ? '📁' : f.icon === 'video' ? '🎬' : f.icon === 'image' ? '🖼️' : '📄'}</div>
          <span className="mock-file-name">{f.name}</span>
          <span className="mock-file-size">{f.size}</span>
        </div>
      ))}
    </div>
  );
}

const MEDIA_HERO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmKniKZczMmjqjcQn-T1oRxxU0Ftl7KPke7dUNen5OOnXiLe5QTpMGLdwdSDu2UW_RtrBqfE1DVEZISfqoHzXVOk7DcqNUDOwngsYMSq6ux9pvs9yTs11GMZsALHeQ9tg-JxGiz2nRRN7a0J_lgDN83cbI-XODllTangJaVYE5_G-J9Q0R1-xuA1-FtDq1q3OaSpeZ4CDqklMo1MMH0GZYd-EdrzCofU7ZGKryExCcgxarYDOCWSf6vHY9o29QFuJN3875o3wsppHt';
const MEDIA_MOVIES = [
  { title: 'Interstellar Drift', genre: 'Adventure', rating: '8.4', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrBDW4Z3rMuZx56n7AZFVkFUVB2ce2OYqlOXcaQm3HPxAPhKmocsWzv4DHtlNs2T2wFpibUlfkYuAzAnnZKXr92FZ_pmvZV8nPrLJTUo2ba3Qdhrs4FHwd5YbeWP6W5dEw21Nv2lE8w_bNIxD_wwWo1rS1rYnUrpEcidfvNRs8XT-_H8ah0pnhFDyqJoKldUICglhtVYzf3DpS6IADz1ELixOvsX6XH3V_hl9mDYQGEAvYKHodO7MJJPQND6sW9CAUfSAeHEqpVzKL' },
  { title: 'The Last Frames', genre: 'Drama', rating: '7.9', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPLl8nVOr5Ep_VXgQb-3qJSk7vDo9aI5KV0oPLMi-BalFJHb9p8AqdH65LjWokU3VAjC20QaSmWUIRVvyiRCf2FKND_RsX0y5jUE0MnvxbIpgetffo3cI7eGtJKXxw4WSW_85YNTz3Qn4rlupRTzT_2ExTI7yKGMEXfOuMCO53DUX2YxqNQIDInulZHiNV-tRP4H-URwmMaj4nT1TL1hol7atwLCq04t59FoaDjINAgErNaNXqJToaj1j0HteJ_h6ohAos1RW9sSoo' },
  { title: 'Vertigo Nexus', genre: 'Thriller', rating: '9.1', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAV99rC2p8h1c-CRaPVwyeWbO7EnEarkaN1zS_m-sM1KJXS_XJDigqU6TstVOSaITv5HjqCC_fXb5kEhoXDVnLNrNQKdjKcQCiUBPy1U5zPHML3SOI_y_jBYHiednSkx8JQISPSBgnW7NzMLlP77bkY4UtKPwVK6DEUmJnrLYbzaGcJdkKK4gizhygJs_xfKNsrRjv8GNKzsing3ZO-UK2bkE_NVX4mQVkq_nhfCdguRm9ciDXy_kCiiW8QiChD2XanTH7b3Y6Tyaf0' },
];

function MediaMockup() {
  return (
    <div className="mock-media">
      <div className="mock-hero-poster" style={{ backgroundImage: `url(${MEDIA_HERO})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,14,26,.9) 10%, transparent 60%)' }} />
        <div className="overlay">
          <div style={{ fontSize: '.65rem', color: '#fbbf24', fontWeight: 600, letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 4 }}>★ Trending Now</div>
          <div className="movie-title">CYBERPUNK RECKONING</div>
          <div className="movie-meta">2024 • Sci-Fi • 2h 15m</div>
        </div>
      </div>
      <div className="mock-media-row">
        {MEDIA_MOVIES.map((m) => (
          <div className="mock-thumb" key={m.title} style={{ backgroundImage: `url(${m.img})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
            <span style={{ position: 'absolute', top: 2, right: 3, fontSize: '.5rem', color: '#fbbf24', fontWeight: 700 }}>★ {m.rating}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PHOTOS = [
  { label: 'Alpine Reflection', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCVjqSkGu29p8CJpicUchb-dTXM6zNS897eOtb85nGnzw3zLixdlgdYiWElColvSakA1Gr9oljHSsh7Cjb5Ali9c99lnFG7AIyYazo0_udGGy0KoNiiES7yMMXYaSQus_Jd1bZxjuOKYgqdP5b_KOQBOpoe7tQdTw0F99Qd_tbTPWZ4RjDOFAewc49VXGSyYidPbAoTf42zZNCb8P4lKnZJhTEDDYnq7KqDpPtN6Rn-MlUmaFjuTav-Y0r4BBc6c1lHRktUUjeHhVfn' },
  { label: 'Pine Forest', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBw8x0yaH9FsZg47R3PJ6cQx-CFBYyh5EimkDz7FkI8WqKawCxUtwsnKWc6mEYOZNu4dKHtWodd9XdL8Pdz6qr8OpxHLtcV9FUW2zkI6YuboRB4-Vrpa21zNluj7jZZzCqybE4D8Ez_0lt6P7ls4kWNK4UEb7Q4VLE6gxAyZqD9rsTm-m4J7gukp1ym8cFkgzOMwGe_OHVUY32GAqX1JzvoMRY2Wv5YQZwKB0QSQCMPfJzhyFtk2P5g19vc_fHj3iNj7B8QhAAaTO0F' },
  { label: 'Mountain Range', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBitMl4SjUjxmubkQmQ1EQdkGzLEw8tNzg-48Ai_zKNX6Vvk8HuhegjfNZ5O8OYrxiTCCsADGPtIT9ZbDg3kOMs6_F3D4SXkji9X59UjXq6sY3YlKc9QqRCXMkYaEsZvDRkL4D6YFQ6lkA3ZBF6hMK-hz-5_PUSJxqCU5i2daKB53xgqVQzRBpJ2Qht8bfvBL2aka5DCKLodUihF5qjbndCdFIsGytyYSiLIqqaOdWSk3at8VGptOdJoi8ktYlNvY3Dt_cc8tLbiWFr' },
  { label: 'Wheat Field', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCE40Tkqr3YW6Wh1aiO98i5ydMqWIDLByRTCjTbZ37VF9lqVx7zsKq7dkqmohPBEjWFWaMPk4yRtcpWS6TdLBTJGZ_3j9NA9RxYhcSbHTQnNKwjmZWPVr3j41Qj-KpAjSXnSVt7IpF7cGNu6_8pvlosfAP5KhUUd344lVb9h-NeegbgbNAEOCjAIVWQ2QAlEmZkGVnQAmWaECFuyYyrBb-ImJBKJrrVZ6KGN6qW3htghoB50UuG_8bsRL4LOXyDMizbCZigNNIZChMy' },
  { label: 'Forest Bridge', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyC2rMJCGalJajF9eIDxw6G0rS37jxYGEre-y6f3ug66GIEcYdP3oO57TwKgbjaXGQR_ZZnz7xnS-rsNtOlGbQDLgmWEurXVm_BrCs7Vy6hg3bLXjWST9JJzs8sIVNPY0mvou6XeymF5qqemkR0HvNQGe4RNpCkrUDOXPOBj8yF7eJOkNf_XHYrviUJTC7p8xhmHomsFQSHaovr8s3goXRFBdJGcmgej7KLE6jtWFGzDdW9nSafLapj8LmChxgfHnw-75sTg4S8vES' },
];

function PhotosMockup() {
  return (
    <div className="mock-photos">
      <div className="mock-photo large"><div className="mock-photo-inner" style={{ backgroundImage: `url(${PHOTOS[0].img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} /></div>
      {PHOTOS.slice(1).map((p, i) => (
        <div className="mock-photo" key={i}><div className="mock-photo-inner" style={{ backgroundImage: `url(${p.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} /></div>
      ))}
    </div>
  );
}

const MOCKUPS = { dashboard: DashboardMockup, fileManager: FilesMockup, mediaHub: MediaMockup, photos: PhotosMockup };

export default function Features() {
  const { t } = useI18n();
  const [active, setActive] = useState('dashboard');
  const feat = t.features[active];
  const Mockup = MOCKUPS[active];

  return (
    <section id="features" className="section">
      <div className="container">
        <div className="text-center">
          <span className="section-badge">{t.features.badge}</span>
          <h2 className="section-title">{t.features.title}</h2>
          <p className="section-subtitle">{t.features.subtitle}</p>
        </div>

        <div className="feature-tabs">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`feature-tab ${active === tab ? 'active' : ''}`}
              onClick={() => setActive(tab)}
            >
              {ICONS[tab]} {t.features[tab].title}
            </button>
          ))}
        </div>

        <div className="feature-detail">
          <div className="info">
            <h3>{feat.title}</h3>
            <p>{feat.desc}</p>
            <ul className="feature-list">
              {feat.items.map((item, i) => (
                <li key={i}>
                  <span className="check"><Check size={12} /></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="feature-mockup">
            <Mockup />
          </div>
        </div>
      </div>
    </section>
  );
}
