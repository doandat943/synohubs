import { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nProvider';

export default function LiveVisitors() {
  const { t } = useI18n();
  const lv = t.liveVisitors || {};

  // Active visitors: random 3-12, fluctuates every 4-8s
  const [active, setActive] = useState(() => Math.floor(Math.random() * 10) + 3);
  // Total visitors: starts from a base, slowly increments
  const [total, setTotal] = useState(() => 1247 + Math.floor(Math.random() * 80));

  useEffect(() => {
    const activeTimer = setInterval(() => {
      setActive(prev => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(2, Math.min(25, prev + delta));
      });
    }, Math.random() * 4000 + 4000);

    const totalTimer = setInterval(() => {
      setTotal(prev => prev + Math.floor(Math.random() * 3));
    }, Math.random() * 8000 + 12000);

    return () => { clearInterval(activeTimer); clearInterval(totalTimer); };
  }, []);

  return (
    <div className="live-visitors-float">
      <div className="lv-row">
        <span className="lv-dot lv-dot-active"></span>
        <span className="lv-label">{active} {lv.active || 'online now'}</span>
      </div>
      <div className="lv-row">
        <span className="lv-dot lv-dot-total"></span>
        <span className="lv-label">{total.toLocaleString()} {lv.total || 'total visits'}</span>
      </div>
    </div>
  );
}