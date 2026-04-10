import { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nProvider';

export default function LiveVisitors() {
  const { t } = useI18n();
  // Random initial viewers between 3 and 12
  const [viewers, setViewers] = useState(() => Math.floor(Math.random() * 10) + 3);

  useEffect(() => {
    // Randomly change the count every 4-8 seconds
    const interval = setInterval(() => {
      setViewers(prev => {
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const next = prev + change;
        if (next < 2) return 2; // Keep at least 2 people
        if (next > 25) return 25; // Cap at 25 so it looks realistic
        return next;
      });
    }, Math.random() * 4000 + 4000); // 4000ms - 8000ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="live-visitors-wrapper fade-in-up">
      <div className="live-visitors-pill">
        <div className="visitor-avatars">
          <div className="avatar avatar-1"></div>
          <div className="avatar avatar-2"></div>
          <div className="avatar avatar-3"></div>
        </div>
        <span className="visitor-text">
          <strong>{viewers}</strong> {t.liveVisitors?.text || 'người đang đọc cùng bạn'}
        </span>
      </div>
    </div>
  );
}