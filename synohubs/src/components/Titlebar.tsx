import React, { useState, useRef, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { ArrowUp, ArrowDown, Bell, SlidersHorizontal, X, ExternalLink, Info } from 'lucide-react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { useNasStore, useAuthStore } from '../stores';
import { APP_VERSION } from '../utils/version';

/**
 * Titlebar — Custom macOS-style traffic light buttons
 * Replaces native Windows title bar with premium circular buttons
 */
const Titlebar: React.FC = () => {
  const { activeNas } = useNasStore();
  const { user } = useAuthStore();
  const [isMaximized, setIsMaximized] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [showPrefsPopover, setShowPrefsPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const appWindow = getCurrentWindow();

  const handleMinimize = () => appWindow.minimize();
  const handleMaximize = async () => {
    const maximized = await appWindow.isMaximized();
    if (maximized) {
      await appWindow.unmaximize();
      setIsMaximized(false);
    } else {
      await appWindow.maximize();
      setIsMaximized(true);
    }
  };
  const handleClose = () => appWindow.close();

  const openExternal = (url: string) => {
    openUrl(url).catch(() => window.open(url, '_blank'));
  };

  // Close popover on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPrefsPopover(false);
      }
    };
    if (showPrefsPopover) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPrefsPopover]);

  return (
    <div className="titlebar" data-tauri-drag-region>
      {/* macOS-style Traffic Light Buttons */}
      <div
        className="titlebar__traffic-lights"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <button
          className="titlebar__light titlebar__light--close"
          onClick={handleClose}
          title="Close"
        >
          {hovering && (
            <svg width="8" height="8" viewBox="0 0 8 8">
              <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          )}
        </button>
        <button
          className="titlebar__light titlebar__light--minimize"
          onClick={handleMinimize}
          title="Minimize"
        >
          {hovering && (
            <svg width="8" height="8" viewBox="0 0 8 8">
              <path d="M1 4H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          )}
        </button>
        <button
          className="titlebar__light titlebar__light--maximize"
          onClick={handleMaximize}
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {hovering && (
            isMaximized ? (
              <svg width="8" height="8" viewBox="0 0 8 8">
                <path d="M1 2.5L4 0.5L7 2.5M1 5.5L4 7.5L7 5.5" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            ) : (
              <svg width="8" height="8" viewBox="0 0 8 8">
                <path d="M1 5.5L4 0.5L7 5.5" stroke="currentColor" strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            )
          )}
        </button>
      </div>

      <div className="titlebar__spacer" />

      {/* Network stats */}
      {activeNas && (
        <div className="titlebar__stats">
          <div className="titlebar__stat">
            <ArrowUp size={10} className="up" />
            <span>52 B/s</span>
          </div>
          <div className="titlebar__stat">
            <ArrowDown size={10} className="down" />
            <span>36 B/s</span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="titlebar__actions">
        <button className="titlebar__action" title="Notifications">
          <Bell size={14} />
        </button>
        <div style={{ position: 'relative' }} ref={popoverRef}>
          <button
            className={`titlebar__action ${showPrefsPopover ? 'active' : ''}`}
            title="App Preferences"
            onClick={() => setShowPrefsPopover(!showPrefsPopover)}
          >
            <SlidersHorizontal size={14} />
          </button>

          {/* App Preferences Popover */}
          {showPrefsPopover && (
            <div className="nas-account-popover">
              <div className="nas-account-popover__header">
                <span>App Preferences</span>
                <button className="nas-account-popover__close" onClick={() => setShowPrefsPopover(false)}>
                  <X size={12} />
                </button>
              </div>
              <div className="nas-account-popover__body">
                <div className="nas-account-popover__row">
                  <Info size={13} />
                  <span className="nas-account-popover__label">Version</span>
                  <span className="nas-account-popover__value" style={{ color: 'var(--color-accent)' }}>{APP_VERSION}</span>
                </div>
                <div className="nas-account-popover__row">
                  <span style={{ width: 13 }} />
                  <span className="nas-account-popover__label">Account</span>
                  <span className="nas-account-popover__value nas-account-popover__value--dim">{user?.email || '—'}</span>
                </div>
                <div className="nas-account-popover__row">
                  <span style={{ width: 13 }} />
                  <span className="nas-account-popover__label">Tier</span>
                  <span className={`nas-account-popover__badge ${user?.tier === 'vip' ? 'admin' : 'user'}`}>
                    {user?.tier === 'vip' ? '⭐ VIP' : 'Free'}
                  </span>
                </div>
                <div className="nas-account-popover__row">
                  <span style={{ width: 13 }} />
                  <span className="nas-account-popover__label">Platform</span>
                  <span className="nas-account-popover__value">Desktop</span>
                </div>
              </div>
              <div className="nas-account-popover__links">
                <button className="nas-account-popover__link" onClick={() => openExternal('https://synohubs.com')}>
                  <ExternalLink size={11} /> synohubs.com
                </button>
                <button className="nas-account-popover__link" onClick={() => openExternal('https://github.com/duconmang/synohubs')}>
                  <ExternalLink size={11} /> GitHub
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Titlebar;
