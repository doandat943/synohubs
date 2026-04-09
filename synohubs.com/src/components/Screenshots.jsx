import { useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';

function DashboardScreen() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
      {[
        { label: 'CPU', value: '23%', color: '#22d3ee' },
        { label: 'RAM', value: '4.2 / 8 GB', color: '#a78bfa' },
        { label: 'SSD', value: '67°C', color: '#f87171' },
      ].map((s) => (
        <div key={s.label} style={{ background: '#1e293b', borderRadius: 10, padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: '.75rem', color: '#64748b', marginBottom: 8 }}>{s.label}</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color, fontFamily: 'JetBrains Mono' }}>{s.value}</div>
        </div>
      ))}
      <div style={{ gridColumn: 'span 3', background: '#1e293b', borderRadius: 10, padding: 16, height: 120 }}>
        <div style={{ fontSize: '.75rem', color: '#64748b', marginBottom: 8 }}>Network I/O</div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 70 }}>
          {[30,45,55,35,60,75,65,50,40,70,85,60,45,55,80,65,50,75,90,70].map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h}%`, background: `rgba(34,211,238,${0.3 + (h / 150)})`, borderRadius: 2 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FilesScreen() {
  const files = [
    { icon: '📁', name: '/volume1/homes', size: '2.4 TB', type: 'folder' },
    { icon: '📁', name: '/volume1/music', size: '340 GB', type: 'folder' },
    { icon: '🎬', name: 'Interstellar.mkv', size: '24.3 GB', type: 'video' },
    { icon: '📄', name: 'backup_2024.tar.gz', size: '8.1 GB', type: 'archive' },
    { icon: '🖼️', name: 'wallpaper.png', size: '4.2 MB', type: 'image' },
  ];
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['Name', 'Size', 'Modified'].map((h) => (
          <div key={h} style={{ flex: h === 'Name' ? 2 : 1, fontSize: '.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>{h}</div>
        ))}
      </div>
      {files.map((f) => (
        <div key={f.name} style={{ display: 'flex', gap: 8, padding: '10px 0', borderBottom: '1px solid rgba(148,163,184,.08)', alignItems: 'center' }}>
          <div style={{ flex: 2, display: 'flex', gap: 8, alignItems: 'center', fontSize: '.9rem' }}>
            <span>{f.icon}</span> {f.name}
          </div>
          <div style={{ flex: 1, fontSize: '.85rem', color: '#94a3b8', fontFamily: 'JetBrains Mono' }}>{f.size}</div>
          <div style={{ flex: 1, fontSize: '.8rem', color: '#64748b' }}>2024-12-15</div>
        </div>
      ))}
    </div>
  );
}

const SS_MEDIA_HERO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmKniKZczMmjqjcQn-T1oRxxU0Ftl7KPke7dUNen5OOnXiLe5QTpMGLdwdSDu2UW_RtrBqfE1DVEZISfqoHzXVOk7DcqNUDOwngsYMSq6ux9pvs9yTs11GMZsALHeQ9tg-JxGiz2nRRN7a0J_lgDN83cbI-XODllTangJaVYE5_G-J9Q0R1-xuA1-FtDq1q3OaSpeZ4CDqklMo1MMH0GZYd-EdrzCofU7ZGKryExCcgxarYDOCWSf6vHY9o29QFuJN3875o3wsppHt';
const SS_MOVIES = [
  { title: 'Interstellar Drift', genre: 'Adventure', rating: '8.4', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCrBDW4Z3rMuZx56n7AZFVkFUVB2ce2OYqlOXcaQm3HPxAPhKmocsWzv4DHtlNs2T2wFpibUlfkYuAzAnnZKXr92FZ_pmvZV8nPrLJTUo2ba3Qdhrs4FHwd5YbeWP6W5dEw21Nv2lE8w_bNIxD_wwWo1rS1rYnUrpEcidfvNRs8XT-_H8ah0pnhFDyqJoKldUICglhtVYzf3DpS6IADz1ELixOvsX6XH3V_hl9mDYQGEAvYKHodO7MJJPQND6sW9CAUfSAeHEqpVzKL' },
  { title: 'The Last Frames', genre: 'Drama', rating: '7.9', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPLl8nVOr5Ep_VXgQb-3qJSk7vDo9aI5KV0oPLMi-BalFJHb9p8AqdH65LjWokU3VAjC20QaSmWUIRVvyiRCf2FKND_RsX0y5jUE0MnvxbIpgetffo3cI7eGtJKXxw4WSW_85YNTz3Qn4rlupRTzT_2ExTI7yKGMEXfOuMCO53DUX2YxqNQIDInulZHiNV-tRP4H-URwmMaj4nT1TL1hol7atwLCq04t59FoaDjINAgErNaNXqJToaj1j0HteJ_h6ohAos1RW9sSoo' },
  { title: 'Vertigo Nexus', genre: 'Thriller', rating: '9.1', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAV99rC2p8h1c-CRaPVwyeWbO7EnEarkaN1zS_m-sM1KJXS_XJDigqU6TstVOSaITv5HjqCC_fXb5kEhoXDVnLNrNQKdjKcQCiUBPy1U5zPHML3SOI_y_jBYHiednSkx8JQISPSBgnW7NzMLlP77bkY4UtKPwVK6DEUmJnrLYbzaGcJdkKK4gizhygJs_xfKNsrRjv8GNKzsing3ZO-UK2bkE_NVX4mQVkq_nhfCdguRm9ciDXy_kCiiW8QiChD2XanTH7b3Y6Tyaf0' },
];
const SS_POPULAR = [
  { title: 'Neon Runners', views: '8.2M Views', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAN6CgHqG_9FF8Jrd0sgcCVVS2GYjSCXOhmfB9pQIjcT8tVKW5FjR3LZxzdFLXibE6aPEtHwRgj7qLRHkpLDlAGg5v_mw67F230lq42fQJmNH5_ZaBeE7-OTqFi5Fnn_JAFn8xWxycbZU2bvkZ9gfv4oDDsyS30Z9d4geo3FXf8vAXX7dnGqWnbxApUdGKX-ciAqnwfz7mu5JXWRC-C6XxVskiTf76P9PIyrwWIZJHIY_MXXlk3uh25fr5P1Kd9gBlhzutoo6zHlDym' },
  { title: 'The Frost', views: '5.7M Views', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6uKwIjvl4zfZPerCXhkK5MC_GcjKfdvoYpgbZ-SUy47wtVMZleb8TBGCsE5Ggl-E9MnuGWSrGgHnjnqVTfp2trtFvCxspSBysrSLj0D2tnRq2mc7t2P5OmXXxNkhgfbe_IKz3ibNnmne70qVRftpxC6CJcuM-e0vAEqhR5eEnnnP-1ct2B49Om4D1WMw7W7p2H4qqEauLoDTpB70HVgYa08PNFS2t1yp0QfV3J4HQsjAjodq86csBJuBmeWzoSxadqKUPn3tiWtbp' },
];

function MediaScreen() {
  return (
    <div>
      {/* Hero */}
      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 16, height: 180 }}>
        <img src={SS_MEDIA_HERO} alt="Featured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,14,26,.95) 5%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: 14, left: 16 }}>
          <div style={{ fontSize: '.6rem', color: '#fbbf24', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>★ Trending Now</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.5px' }}>CYBERPUNK RECKONING</div>
          <div style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: 2 }}>2024 • Sci-Fi • 2h 15m</div>
        </div>
      </div>
      {/* Recently Added */}
      <div style={{ fontSize: '.8rem', fontWeight: 700, marginBottom: 10 }}>Recently Added</div>
      <div style={{ display: 'flex', gap: 10, overflow: 'hidden' }}>
        {SS_MOVIES.map((m) => (
          <div key={m.title} style={{ flex: '0 0 90px' }}>
            <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '2/3' }}>
              <img src={m.img} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span style={{ position: 'absolute', top: 4, right: 6, fontSize: '.6rem', color: '#fbbf24', fontWeight: 700, background: 'rgba(10,14,26,.7)', padding: '2px 5px', borderRadius: 4 }}>★ {m.rating}</span>
            </div>
            <div style={{ fontSize: '.75rem', fontWeight: 600, marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</div>
            <div style={{ fontSize: '.65rem', color: '#64748b' }}>{m.genre}</div>
          </div>
        ))}
      </div>
      {/* Popular */}
      <div style={{ fontSize: '.8rem', fontWeight: 700, margin: '16px 0 10px' }}>Popular</div>
      <div style={{ display: 'flex', gap: 10 }}>
        {SS_POPULAR.map((p) => (
          <div key={p.title} style={{ flex: 1, position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '16/9' }}>
            <img src={p.img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,14,26,.9) 5%, transparent 60%)' }} />
            <div style={{ position: 'absolute', bottom: 8, left: 10 }}>
              <div style={{ fontSize: '.8rem', fontWeight: 700 }}>{p.title}</div>
              <div style={{ fontSize: '.6rem', color: '#22d3ee' }}>{p.views}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SS_PHOTOS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCVjqSkGu29p8CJpicUchb-dTXM6zNS897eOtb85nGnzw3zLixdlgdYiWElColvSakA1Gr9oljHSsh7Cjb5Ali9c99lnFG7AIyYazo0_udGGy0KoNiiES7yMMXYaSQus_Jd1bZxjuOKYgqdP5b_KOQBOpoe7tQdTw0F99Qd_tbTPWZ4RjDOFAewc49VXGSyYidPbAoTf42zZNCb8P4lKnZJhTEDDYnq7KqDpPtN6Rn-MlUmaFjuTav-Y0r4BBc6c1lHRktUUjeHhVfn',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD4LzxiBWAGfGb2d8M_7-WaIFYYCHgLzXtUYgS-271-4nK5ZG5f-TqQkN8y5EzZam8r8KnWDfdi3zyHCItNSLhgVAiFcwW9vNCZYU5pVB00LAtoGkVEs4ZqGhzBm3PJESPBFQ9m6QtcCA6W1i7Dgx3eP3EeIh2G50gmhxUl6v9g7GMnVDkKa3luS0qi-Yd8z83BtKdxgXi3vpw7EICQVQP96fBsKmapiObWhNHvNp0S79uFjplEkYWApkguROYvZz7KXC7STtDZMO6J',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC5zm2n0bF4pMOapgW5OEWuJiGFfXSUbyqIXj-Ucf4hiN031bnvxy8OP_r7KJMrkdFSr__Dzd8jnsddmpjGvt67Fu4TOKNWcTORCbQcbEk80HOzHK7tzSnfsgTjkYWSENyR7jMzdshYTlsAuorbpG9O2v-ckgeln6-bBMXIxw6WgdOrAqGHA-RgXb5I9icjlxErVzFqt2vNBPBtcccjmTpbSkmYgLiYUTLVV7je2PC-djeHQq1Ns-5PToLFJiZdaYLtHZGFV1jaEXMt',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBw8x0yaH9FsZg47R3PJ6cQx-CFBYyh5EimkDz7FkI8WqKawCxUtwsnKWc6mEYOZNu4dKHtWodd9XdL8Pdz6qr8OpxHLtcV9FUW2zkI6YuboRB4-Vrpa21zNluj7jZZzCqybE4D8Ez_0lt6P7ls4kWNK4UEb7Q4VLE6gxAyZqD9rsTm-m4J7gukp1ym8cFkgzOMwGe_OHVUY32GAqX1JzvoMRY2Wv5YQZwKB0QSQCMPfJzhyFtk2P5g19vc_fHj3iNj7B8QhAAaTO0F',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBitMl4SjUjxmubkQmQ1EQdkGzLEw8tNzg-48Ai_zKNX6Vvk8HuhegjfNZ5O8OYrxiTCCsADGPtIT9ZbDg3kOMs6_F3D4SXkji9X59UjXq6sY3YlKc9QqRCXMkYaEsZvDRkL4D6YFQ6lkA3ZBF6hMK-hz-5_PUSJxqCU5i2daKB53xgqVQzRBpJ2Qht8bfvBL2aka5DCKLodUihF5qjbndCdFIsGytyYSiLIqqaOdWSk3at8VGptOdJoi8ktYlNvY3Dt_cc8tLbiWFr',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCE40Tkqr3YW6Wh1aiO98i5ydMqWIDLByRTCjTbZ37VF9lqVx7zsKq7dkqmohPBEjWFWaMPk4yRtcpWS6TdLBTJGZ_3j9NA9RxYhcSbHTQnNKwjmZWPVr3j41Qj-KpAjSXnSVt7IpF7cGNu6_8pvlosfAP5KhUUd344lVb9h-NeegbgbNAEOCjAIVWQ2QAlEmZkGVnQAmWaECFuyYyrBb-ImJBKJrrVZ6KGN6qW3htghoB50UuG_8bsRL4LOXyDMizbCZigNNIZChMy',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDCGCviHrFfC8lkVZ2lz95gsB9-nyaiWvRW-G4TmtcttWO2oi2c5FeL1UrOVifSKiIix7M1nujCdw6qTTM59eaNIt4OIKmMGHJGZUVSPMRus1GUUIshA92qc1SSBQg2yAXMEadOVC9zLoaxlNmgpL_9QvST_XMOFWJHsnV6o-LLVfVCruIc8aBIqRfjyPgsk5J604FnFfCYuJJu8kZImOfNeJVU8mrC3nZmKc-E_DPpJSRZFcRs4RwK-UudnFLOzrdT1JDqeiVCSuZ_',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCyC2rMJCGalJajF9eIDxw6G0rS37jxYGEre-y6f3ug66GIEcYdP3oO57TwKgbjaXGQR_ZZnz7xnS-rsNtOlGbQDLgmWEurXVm_BrCs7Vy6hg3bLXjWST9JJzs8sIVNPY0mvou6XeymF5qqemkR0HvNQGe4RNpCkrUDOXPOBj8yF7eJOkNf_XHYrviUJTC7p8xhmHomsFQSHaovr8s3goXRFBdJGcmgej7KLE6jtWFGzDdW9nSafLapj8LmChxgfHnw-75sTg4S8vES',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAqpUYWU4mAZsAIdeW1VNQGH79wBSNRt20pp7hl1rMyLaY51TtqdHsKEjcllvjZ8WJ1mMf-TNh5_CxYfY3KMbFowEiDc7TROYNaso4nuECxvzkANICRHTliNwTbxzjiSKzzYFjR_kX2PPOB8usV6MvyUyCYNFAtatoJOKPFcv-HhwjbJvOoxJy4kQica7HLcZhPzKPAJuYsxukvsk8sinMEPNHvS3Az_w-R0-2-SfC_fK-8qerY9PhCLsJfvjW1fhBTOOHKOTpn76Gu',
];

function PhotosScreen() {
  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {['All Photos', 'Favorites', 'Recent', 'Hidden'].map((f, i) => (
          <span key={f} style={{ padding: '4px 14px', borderRadius: 100, fontSize: '.75rem', fontWeight: 500, background: i === 0 ? 'rgba(34,211,238,.1)' : '#1e293b', color: i === 0 ? '#22d3ee' : '#94a3b8', border: i === 0 ? '1px solid rgba(34,211,238,.2)' : '1px solid rgba(148,163,184,.08)' }}>{f}</span>
        ))}
      </div>
      {/* Gallery Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
        {SS_PHOTOS.map((src, i) => (
          <div key={i} style={{ aspectRatio: '1', overflow: 'hidden', borderRadius: 4, gridColumn: i === 0 ? 'span 2' : undefined, gridRow: i === 0 ? 'span 2' : undefined }}>
            <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

const SCREENS = { dashboard: DashboardScreen, files: FilesScreen, media: MediaScreen, photos: PhotosScreen };

export default function Screenshots() {
  const { t } = useI18n();
  const tabs = t.screenshots.tabs;
  const [active, setActive] = useState('dashboard');

  const Screen = SCREENS[active];

  return (
    <section id="screenshots" className="section">
      <div className="container">
        <div className="text-center">
          <span className="section-badge">{t.screenshots.badge}</span>
          <h2 className="section-title">{t.screenshots.title}</h2>
          <p className="section-subtitle">{t.screenshots.subtitle}</p>
        </div>

        <div className="screenshot-tabs">
          {Object.entries(tabs).map(([key, label]) => (
            <button key={key} className={`screenshot-tab ${active === key ? 'active' : ''}`} onClick={() => setActive(key)}>
              {label}
            </button>
          ))}
        </div>

        <div className="screenshot-frame">
          <div className="frame-bar">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
            <span className="frame-title">SynoHub — {tabs[active]}</span>
          </div>
          <div className="frame-content">
            <Screen />
          </div>
        </div>
      </div>
    </section>
  );
}
