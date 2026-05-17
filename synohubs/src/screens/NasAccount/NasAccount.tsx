import React from 'react';
import {
  CircleUserRound, Server, HardDrive, User, Wifi
} from 'lucide-react';
import { useNasStore, useAuthStore } from '../../stores';
import { APP_VERSION } from '../../utils/version';
import './NasAccount.css';

/**
 * NAS Account Screen — Shows the current NAS user's connection info.
 * Accessible from the sidebar bottom button.
 */
const NasAccount: React.FC = () => {
  const { activeNas, connections } = useNasStore();
  const { user } = useAuthStore();

  return (
    <div className="nas-account">
      <div className="nas-account__header">
        <CircleUserRound size={20} />
        <h2>NAS Account</h2>
      </div>

      {activeNas ? (
        <div className="nas-account__grid">
          {/* Connection Info */}
          <div className="nas-acc-card">
            <div className="nas-acc-card__title">
              <Wifi size={16} /> Connection
            </div>
            <div className="nas-acc-card__body">
              <div className="nas-acc-row">
                <span className="nas-acc-label">Status</span>
                <span className={`nas-acc-badge ${activeNas.status === 'online' ? 'online' : 'offline'}`}>
                  {activeNas.status === 'online' ? '● Online' : '○ Offline'}
                </span>
              </div>
              <div className="nas-acc-row">
                <span className="nas-acc-label">Host</span>
                <span className="nas-acc-value nas-acc-value--mono">{activeNas.host}:{activeNas.port}</span>
              </div>
              <div className="nas-acc-row">
                <span className="nas-acc-label">Protocol</span>
                <span className="nas-acc-value">{activeNas.protocol?.toUpperCase() || 'HTTPS'}</span>
              </div>
              <div className="nas-acc-row">
                <span className="nas-acc-label">Device Name</span>
                <span className="nas-acc-value">{activeNas.name}</span>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="nas-acc-card">
            <div className="nas-acc-card__title">
              <User size={16} /> User
            </div>
            <div className="nas-acc-card__body">
              <div className="nas-acc-row">
                <span className="nas-acc-label">Username</span>
                <span className="nas-acc-value nas-acc-value--accent">{activeNas.username}</span>
              </div>
              <div className="nas-acc-row">
                <span className="nas-acc-label">Role</span>
                <span className={`nas-acc-badge ${activeNas.is_admin ? 'admin' : 'user'}`}>
                  {activeNas.is_admin ? '🛡 Admin' : '👤 User'}
                </span>
              </div>
              <div className="nas-acc-row">
                <span className="nas-acc-label">App Account</span>
                <span className="nas-acc-value nas-acc-value--dim">{user?.email || '—'}</span>
              </div>
              <div className="nas-acc-row">
                <span className="nas-acc-label">App Tier</span>
                <span className={`nas-acc-badge ${user?.tier === 'vip' ? 'vip' : 'free'}`}>
                  {user?.tier === 'vip' ? '⭐ VIP' : 'Free'}
                </span>
              </div>
            </div>
          </div>

          {/* Device Info */}
          <div className="nas-acc-card">
            <div className="nas-acc-card__title">
              <Server size={16} /> Device
            </div>
            <div className="nas-acc-card__body">
              <div className="nas-acc-row">
                <span className="nas-acc-label">Model</span>
                <span className="nas-acc-value">{activeNas.model || '—'}</span>
              </div>
              <div className="nas-acc-row">
                <span className="nas-acc-label">DSM Version</span>
                <span className="nas-acc-value">{activeNas.dsm_version || '—'}</span>
              </div>
              <div className="nas-acc-row">
                <span className="nas-acc-label">Serial</span>
                <span className="nas-acc-value nas-acc-value--mono">{activeNas.serial || '—'}</span>
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="nas-acc-card">
            <div className="nas-acc-card__title">
              <HardDrive size={16} /> Overview
            </div>
            <div className="nas-acc-card__body">
              <div className="nas-acc-row">
                <span className="nas-acc-label">Total NAS Devices</span>
                <span className="nas-acc-value">{connections.length}</span>
              </div>
              <div className="nas-acc-row">
                <span className="nas-acc-label">App Version</span>
                <span className="nas-acc-value nas-acc-value--accent">{APP_VERSION}</span>
              </div>
              <div className="nas-acc-row">
                <span className="nas-acc-label">Platform</span>
                <span className="nas-acc-value">Desktop (Tauri)</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="nas-account__empty">
          <Server size={48} strokeWidth={1} />
          <h3>No NAS Connected</h3>
          <p>Connect to a NAS device to view account details.</p>
        </div>
      )}
    </div>
  );
};

export default NasAccount;
