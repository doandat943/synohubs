import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ScrollText, Wifi, AlertTriangle, Info, XCircle, RefreshCw } from 'lucide-react';
import './LogCenter.css';

interface LogEntry {
  [key: string]: any;
}

type TabId = 'overview' | 'logs' | 'connections';

const LogCenter: React.FC = () => {
  const [tab, setTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connections, setConnections] = useState<LogEntry[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalConn, setTotalConn] = useState(0);
  const [rawLogs, setRawLogs] = useState<any>(null);
  const [rawConn, setRawConn] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsResp, connResp] = await Promise.all([
        invoke<any>('nas_get_logs', { offset: 0, limit: 200, logtype: '' }),
        invoke<any>('nas_get_connections', { offset: 0, limit: 50 }),
      ]);

      console.log('[LogCenter] Logs response:', logsResp);
      console.log('[LogCenter] Connections response:', connResp);
      setRawLogs(logsResp);
      setRawConn(connResp);

      // Parse logs
      if (logsResp?.success && logsResp?.data) {
        const d = logsResp.data;
        const items = d.items || d.logs || d.result || d.data || [];
        setLogs(Array.isArray(items) ? items : []);
        setTotalLogs(d.total ?? items.length ?? 0);
      }

      // Parse connections
      if (connResp?.success && connResp?.data) {
        const d = connResp.data;
        const items = d.items || d.data || [];
        setConnections(Array.isArray(items) ? items : []);
        setTotalConn(d.total ?? items.length ?? 0);
      }
    } catch (err) {
      console.error('[LogCenter] Error:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // ── Helpers ──────────────────────────────────────
  const getLevel = (log: LogEntry): string => {
    return (log.level || log.log_level || log.severity || 'info').toString().toLowerCase();
  };

  const getLevelClass = (level: string): string => {
    if (level.includes('warn')) return 'log-badge--warn';
    if (level.includes('err') || level.includes('crit')) return 'log-badge--error';
    return 'log-badge--info';
  };

  const getLevelLabel = (level: string): string => {
    if (level.includes('warn')) return 'Warning';
    if (level.includes('err')) return 'Error';
    if (level.includes('crit')) return 'Critical';
    return 'Info';
  };

  const getTime = (log: LogEntry): string => {
    if (log.time) return String(log.time);
    if (log.timestamp) return String(log.timestamp);
    if (log.date) return String(log.date);
    const epoch = log.time_epoch || log.ut || 0;
    if (epoch > 0) {
      const dt = new Date(epoch * 1000);
      return dt.toLocaleString();
    }
    return '';
  };

  const getUser = (log: LogEntry): string =>
    log.user || log.username || log.who || '';

  const getEvent = (log: LogEntry): string =>
    log.descr || log.msg || log.event || log.message || log.desc || '';

  // ── Count levels ──────────────────────────────
  let infoCount = 0, warnCount = 0, errCount = 0;
  logs.forEach(log => {
    const level = getLevel(log);
    if (level.includes('warn')) warnCount++;
    else if (level.includes('err') || level.includes('crit')) errCount++;
    else infoCount++;
  });

  // ── Render ──────────────────────────────────────
  return (
    <div className="log-center">
      {/* Header */}
      <div className="log-center__header">
        <div className="log-center__icon">
          <ScrollText size={18} />
        </div>
        <h1 className="log-center__title">Log Center</h1>
        <div style={{ flex: 1 }} />
        <button
          onClick={fetchData}
          style={{
            background: 'rgba(99,102,241,0.12)',
            border: 'none',
            borderRadius: 8,
            padding: '6px 12px',
            color: '#818cf8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="log-center__tabs">
        {(['overview', 'logs', 'connections'] as TabId[]).map(t => (
          <button
            key={t}
            className={`log-center__tab ${tab === t ? 'log-center__tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'overview' ? 'Overview' : t === 'logs' ? 'System Logs' : 'Connections'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="log-center__loading">
          <RefreshCw size={20} className="spin" /> Loading...
        </div>
      ) : (
        <>
          {/* ── OVERVIEW TAB ── */}
          {tab === 'overview' && (
            <>
              <div className="log-center__summary">
                <div className="log-center__stat-card">
                  <div className="log-center__stat-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                    <ScrollText size={16} />
                  </div>
                  <div className="log-center__stat-value" style={{ color: '#818cf8' }}>{totalLogs}</div>
                  <div className="log-center__stat-label">Total Logs</div>
                </div>
                <div className="log-center__stat-card">
                  <div className="log-center__stat-icon" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
                    <Wifi size={16} />
                  </div>
                  <div className="log-center__stat-value" style={{ color: '#22c55e' }}>{totalConn}</div>
                  <div className="log-center__stat-label">Connections</div>
                </div>
                <div className="log-center__stat-card">
                  <div className="log-center__stat-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                    <Info size={16} />
                  </div>
                  <div className="log-center__stat-value" style={{ color: '#818cf8' }}>{infoCount}</div>
                  <div className="log-center__stat-label">Info</div>
                </div>
                <div className="log-center__stat-card">
                  <div className="log-center__stat-icon" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>
                    <AlertTriangle size={16} />
                  </div>
                  <div className="log-center__stat-value" style={{ color: '#fbbf24' }}>{warnCount}</div>
                  <div className="log-center__stat-label">Warnings</div>
                </div>
                <div className="log-center__stat-card">
                  <div className="log-center__stat-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                    <XCircle size={16} />
                  </div>
                  <div className="log-center__stat-value" style={{ color: '#ef4444' }}>{errCount}</div>
                  <div className="log-center__stat-label">Errors</div>
                </div>
              </div>

              {/* Recent logs preview */}
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-dim)' }}>
                Recent Logs ({Math.min(logs.length, 20)})
              </div>
              {logs.length > 0 ? (
                <div className="log-center__table-wrap">
                  <table className="log-center__table">
                    <thead>
                      <tr>
                        <th style={{ width: 70 }}>Level</th>
                        <th style={{ width: 150 }}>Time</th>
                        <th style={{ width: 100 }}>User</th>
                        <th>Event</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.slice(0, 20).map((log, i) => {
                        const level = getLevel(log);
                        return (
                          <tr key={i}>
                            <td><span className={`log-badge ${getLevelClass(level)}`}>{getLevelLabel(level)}</span></td>
                            <td style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{getTime(log)}</td>
                            <td style={{ fontWeight: 600 }}>{getUser(log)}</td>
                            <td title={getEvent(log)}>{getEvent(log)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="log-center__empty">
                  <div className="log-center__empty-icon">📋</div>
                  <p>No logs found</p>
                </div>
              )}

              {/* Debug: raw response */}
              <details>
                <summary style={{ cursor: 'pointer', fontSize: 11, color: 'var(--color-text-dim)' }}>
                  🔍 Debug: Raw API Response
                </summary>
                <div className="log-center__debug">
                  {JSON.stringify(rawLogs, null, 2)}
                </div>
              </details>
            </>
          )}

          {/* ── LOGS TAB ── */}
          {tab === 'logs' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>System Logs</span>
                <span style={{
                  background: 'rgba(99,102,241,0.12)',
                  color: '#818cf8',
                  padding: '2px 8px',
                  borderRadius: 8,
                  fontSize: 10,
                  fontWeight: 700,
                }}>{totalLogs} items</span>
              </div>
              {logs.length > 0 ? (
                <div className="log-center__table-wrap">
                  <table className="log-center__table">
                    <thead>
                      <tr>
                        <th style={{ width: 70 }}>Level</th>
                        <th style={{ width: 150 }}>Time</th>
                        <th style={{ width: 100 }}>User</th>
                        <th>Event</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, i) => {
                        const level = getLevel(log);
                        return (
                          <tr key={i}>
                            <td><span className={`log-badge ${getLevelClass(level)}`}>{getLevelLabel(level)}</span></td>
                            <td style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{getTime(log)}</td>
                            <td style={{ fontWeight: 600 }}>{getUser(log)}</td>
                            <td title={getEvent(log)}>{getEvent(log)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="log-center__empty">
                  <div className="log-center__empty-icon">📋</div>
                  <p>No logs found</p>
                  <details>
                    <summary style={{ cursor: 'pointer', fontSize: 11 }}>Debug Response</summary>
                    <div className="log-center__debug">{JSON.stringify(rawLogs, null, 2)}</div>
                  </details>
                </div>
              )}
            </>
          )}

          {/* ── CONNECTIONS TAB ── */}
          {tab === 'connections' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>Active Connections</span>
                <span style={{
                  background: 'rgba(34,197,94,0.12)',
                  color: '#22c55e',
                  padding: '2px 8px',
                  borderRadius: 8,
                  fontSize: 10,
                  fontWeight: 700,
                }}>{totalConn} active</span>
              </div>
              {connections.length > 0 ? (
                <div className="log-center__conn-grid">
                  {connections.map((conn, i) => {
                    const user = conn.who || conn.user || conn.username || 'Unknown';
                    const from = conn.from || conn.ip || conn.ipaddr || '';
                    const time = conn.time || conn.timestamp || '';
                    const type = conn.type || '';
                    return (
                      <div key={i} className="log-center__conn-card">
                        <div className="log-center__conn-avatar">
                          {user.charAt(0).toUpperCase()}
                        </div>
                        <div className="log-center__conn-info">
                          <div className="log-center__conn-user">{user}</div>
                          <div className="log-center__conn-detail">
                            {from && <span>🌐 {from}</span>}
                            {type && <span> · {type}</span>}
                          </div>
                        </div>
                        <div className="log-center__conn-time">{time}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="log-center__empty">
                  <div className="log-center__empty-icon">🔌</div>
                  <p>No active connections</p>
                  <details>
                    <summary style={{ cursor: 'pointer', fontSize: 11 }}>Debug Response</summary>
                    <div className="log-center__debug">{JSON.stringify(rawConn, null, 2)}</div>
                  </details>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default LogCenter;
