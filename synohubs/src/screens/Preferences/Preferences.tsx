import React from 'react';
import {
  SlidersHorizontal, Info, Globe, Bell, Monitor, ExternalLink
} from 'lucide-react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { APP_VERSION } from '../../utils/version';
import { useAuthStore, useNasStore } from '../../stores';
import './Preferences.css';

/**
 * Preferences Screen — App-level settings.
 * Displays general info, links, and user context.
 */
const Preferences: React.FC = () => {
  const { user } = useAuthStore();
  const { connections } = useNasStore();

  const openExternal = (url: string) => {
    openUrl(url).catch(() => window.open(url, '_blank'));
  };

  return (
    <div className="preferences">
      <div className="preferences__header">
        <SlidersHorizontal size={20} />
        <h2>Preferences</h2>
      </div>

      <div className="preferences__grid">
        {/* About */}
        <div className="pref-card">
          <div className="pref-card__title">
            <Info size={16} /> About SynoHubs
          </div>
          <div className="pref-card__body">
            <div className="pref-row">
              <span className="pref-label">Version</span>
              <span className="pref-value pref-value--accent">{APP_VERSION}</span>
            </div>
            <div className="pref-row">
              <span className="pref-label">Platform</span>
              <span className="pref-value">Desktop (Tauri)</span>
            </div>
            <div className="pref-row">
              <span className="pref-label">License</span>
              <span className="pref-value">Open Source</span>
            </div>
            <div className="pref-row">
              <span className="pref-label">Account</span>
              <span className="pref-value">{user?.email || '—'}</span>
            </div>
            <div className="pref-row">
              <span className="pref-label">Tier</span>
              <span className={`pref-badge pref-badge--${user?.tier || 'free'}`}>
                {user?.tier === 'vip' ? '⭐ VIP' : 'Free'}
              </span>
            </div>
            <div className="pref-row">
              <span className="pref-label">NAS Devices</span>
              <span className="pref-value">{connections.length}</span>
            </div>
          </div>
        </div>

        {/* General */}
        <div className="pref-card">
          <div className="pref-card__title">
            <Monitor size={16} /> General
          </div>
          <div className="pref-card__body">
            <div className="pref-row">
              <span className="pref-label">Theme</span>
              <span className="pref-value">Dark</span>
            </div>
            <div className="pref-row">
              <span className="pref-label">Language</span>
              <span className="pref-value">English</span>
            </div>
            <div className="pref-row">
              <span className="pref-label">Auto-connect</span>
              <span className="pref-value">On startup</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="pref-card">
          <div className="pref-card__title">
            <Bell size={16} /> Notifications
          </div>
          <div className="pref-card__body">
            <div className="pref-row">
              <span className="pref-label">NAS Status</span>
              <span className="pref-value">Enabled</span>
            </div>
            <div className="pref-row">
              <span className="pref-label">Update Alerts</span>
              <span className="pref-value">Enabled</span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="pref-card">
          <div className="pref-card__title">
            <Globe size={16} /> Links
          </div>
          <div className="pref-card__body pref-card__body--links">
            <button className="pref-link" onClick={() => openExternal('https://synohubs.com')}>
              <ExternalLink size={13} /> synohubs.com
            </button>
            <button className="pref-link" onClick={() => openExternal('https://github.com/duconmang/synohubs')}>
              <ExternalLink size={13} /> GitHub Repository
            </button>
            <button className="pref-link" onClick={() => openExternal('https://synohubs.com/privacy')}>
              <ExternalLink size={13} /> Privacy Policy
            </button>
            <button className="pref-link" onClick={() => openExternal('https://synohubs.com/terms')}>
              <ExternalLink size={13} /> Terms of Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
