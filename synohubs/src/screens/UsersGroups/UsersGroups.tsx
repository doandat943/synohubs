import React, { useEffect, useState, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  Users, UserPlus, UserMinus, ShieldCheck, ShieldOff,
  Search, RefreshCw, AlertCircle, Loader,
  Eye, EyeOff, X, User, Edit3, Crown, MoreHorizontal,
  Mail, Key, Clock, Database, FolderLock, AppWindow, HardDrive, Lock, Unlock, Check
} from 'lucide-react';
import { useConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { useNasStore } from '../../stores';
import './UsersGroups.css';

// ── Types ──

interface SynoUser {
  name: string;
  uid?: number;
  description?: string;
  email?: string;
  expired?: string;
}

interface SynoGroup {
  name: string;
  gid?: number;
  description?: string;
}

interface UserDetail {
  name: string;
  uid?: number;
  description?: string;
  email?: string;
  expired?: string;
  password_last_change?: number;
  groups?: string[];
}

interface QuotaItem {
  share: string;
  share_quota: number;
  share_used: number;
  user_quota: number;
  user_used: number;
  volume: string;
}

interface ContextMenu { x: number; y: number; userName: string; }

// ── Avatar helpers ──
const AVATAR_COLORS = [
  '#4ade80', '#38bdf8', '#a78bfa', '#f472b6', '#fbbf24',
  '#34d399', '#22d3ee', '#818cf8', '#fb923c', '#e879f9',
  '#2dd4bf', '#60a5fa', '#c084fc', '#f87171', '#a3e635',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  const parts = name.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i < 2 ? 0 : 2)} ${units[i]}`;
}

function formatDate(ts: number): string {
  if (!ts) return 'N/A';
  return new Date(ts * 1000).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ── Component ──

const UsersGroups: React.FC = () => {
  const activeNas = useNasStore(s => s.activeNas);
  const currentUsername = activeNas?.username || '';
  const isCurrentAdmin = activeNas?.is_admin ?? false;

  const [users, setUsers] = useState<SynoUser[]>([]);
  const [groups, setGroups] = useState<SynoGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [adminNames, setAdminNames] = useState<Set<string>>(new Set(['admin', 'root']));


  // Profile panel
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [userQuota, setUserQuota] = useState<QuotaItem[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Context menu
  const [ctxMenu, setCtxMenu] = useState<ContextMenu | null>(null);

  // Create user modal
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [creating, setCreating] = useState(false);

  // Permissions panel
  const [permTab, setPermTab] = useState<'perms' | 'apps' | 'quota'>('perms');
  const [sharePerms, setSharePerms] = useState<any[]>([]);
  const [appList, setAppList] = useState<any[]>([]);
  const [appRules, setAppRules] = useState<Record<string, any[]>>({});
  const [dsmQuota, setDsmQuota] = useState<any[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [showPermsPanel, setShowPermsPanel] = useState(false);
  const [savingPerm, setSavingPerm] = useState<string | null>(null);
  const [editQuota, setEditQuota] = useState<{ volume: string; mb: string } | null>(null);
  const [shareListData, setShareListData] = useState<any[]>([]);

  // Edit user modal
  const [editUser, setEditUser] = useState<SynoUser | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const { showDialog, DialogComponent } = useConfirmDialog();

  useEffect(() => {
    const handler = () => setCtxMenu(null);
    if (ctxMenu) window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [ctxMenu]);

  // ── Fetch ──

  const fetchUsers = async () => {
    try {
      const result: any = await invoke('user_list');
      setUsers(result?.data?.users || []);
    } catch (err: any) { setError(err?.toString()); }
  };

  const fetchGroups = async () => {
    try {
      const result: any = await invoke('group_list');
      const list: SynoGroup[] = result?.data?.groups || [];
      setGroups(list);
    } catch (err: any) { setError(err?.toString()); }
  };

  const fetchAdminMembers = async () => {
    const names = new Set<string>(['admin', 'root']);
    // Current NAS login user is admin? Always include them
    if (isCurrentAdmin && currentUsername) {
      names.add(currentUsername);
    }
    try {
      const result: any = await invoke('group_member_list', { group: 'administrators' });
      const members = result?.data?.members || result?.data?.users || [];
      members.forEach((m: any) => {
        const n = typeof m === 'string' ? m : m.name;
        if (n) names.add(n);
      });
    } catch (err) {
      console.warn('[UsersGroups] Failed to fetch administrators group members:', err);
    }
    setAdminNames(names);
  };

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchUsers(), fetchGroups(), fetchAdminMembers()]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Profile Panel ──

  const openProfile = async (userName: string) => {
    // Determine what level of info to show
    const canSeeAll = isCurrentAdmin || userName === currentUsername;
    setSelectedUser(userName);
    setLoadingProfile(true);
    setUserDetail(null);
    setUserQuota([]);

    try {
      if (canSeeAll) {
        const [detailRes, quotaRes]: any[] = await Promise.all([
          invoke('user_get', { name: userName }),
          invoke('user_quota', { name: userName }).catch(() => null),
        ]);
        const userData = detailRes?.data?.users?.[0] || detailRes?.data || {};
        setUserDetail({
          name: userData.name || userName,
          uid: userData.uid,
          description: userData.description,
          email: userData.email,
          expired: userData.expired,
          password_last_change: userData.password_last_change,
          groups: userData.groups || [],
        });
        // Quota
        const quotaData = quotaRes?.data?.shares || quotaRes?.data?.volumes || quotaRes?.data || [];
        if (Array.isArray(quotaData)) setUserQuota(quotaData);
      } else {
        // Non-admin viewing other user: just show basic info from user list
        const u = users.find(u => u.name === userName);
        setUserDetail({
          name: userName,
          description: u?.description,
        });
      }
    } catch {
      const u = users.find(u => u.name === userName);
      setUserDetail({ name: userName, description: u?.description });
    } finally {
      setLoadingProfile(false);
    }
  };

  const closeProfile = () => {
    setSelectedUser(null);
    setUserDetail(null);
    setUserQuota([]);
    setShowPermsPanel(false);
  };

  const loadPermissions = async (userName: string) => {
    setShowPermsPanel(true);
    setPermTab('perms');
    setLoadingPerms(true);
    setSharePerms([]); setAppList([]); setAppRules({}); setDsmQuota([]); setShareListData([]);
    try {
      const [permRes, appRes, quotaRes, shareRes]: any[] = await Promise.all([
        invoke('share_permissions_by_user', { name: userName }).catch(() => null),
        invoke('app_priv_list').catch(() => null),
        invoke('user_quota_dsm', { name: userName }).catch(() => null),
        invoke('share_list').catch(() => null),
      ]);
      if (permRes?.success) setSharePerms(permRes.data?.shares || []);
      if (shareRes?.success) setShareListData(shareRes.data?.shares || []);
      if (appRes?.success) {
        const apps = appRes.data?.applications || [];
        setAppList(apps);
        if (apps.length > 0) {
          const ids = apps.map((a: any) => a.app_id);
          const rulesRes: any = await invoke('app_priv_rules_batch', { appIds: ids }).catch(() => null);
          if (rulesRes?.success) setAppRules(rulesRes.data || {});
        }
      }
      if (quotaRes?.success) setDsmQuota(quotaRes.data?.user_quota || []);
    } catch (err) {
      console.warn('[Permissions] Load error:', err);
    } finally {
      setLoadingPerms(false);
    }
  };

  const handleSetSharePerm = async (shareName: string, perm: string) => {
    if (!userDetail) return;
    setSavingPerm('share-' + shareName);
    try {
      const res: any = await invoke('share_permission_set', {
        shareName, userName: userDetail.name, perm,
      });
      if (res?.success) {
        // Reload permissions
        const permRes: any = await invoke('share_permissions_by_user', { name: userDetail.name }).catch(() => null);
        if (permRes?.success) setSharePerms(permRes.data?.shares || []);
      }
    } catch (err) {
      console.warn('[SharePerm] Set error:', err);
    } finally {
      setSavingPerm(null);
    }
  };

  const handleSetAppPriv = async (appId: string, action: string) => {
    if (!userDetail) return;
    setSavingPerm(appId);
    try {
      const res: any = await invoke('app_priv_set_rule', {
        appId, userName: userDetail.name, action,
      });
      if (res?.success) {
        // Reload rules for this app
        const ids = appList.map((a: any) => a.app_id);
        const rulesRes: any = await invoke('app_priv_rules_batch', { appIds: ids }).catch(() => null);
        if (rulesRes?.success) setAppRules(rulesRes.data || {});
      }
    } catch (err) {
      console.warn('[AppPriv] Set error:', err);
    } finally {
      setSavingPerm(null);
    }
  };

  const handleSetQuota = async (volume: string, quotaMb: number) => {
    if (!userDetail) return;
    setSavingPerm('quota-' + volume);
    try {
      const res: any = await invoke('user_quota_set', {
        userName: userDetail.name, volume, quotaMb: quotaMb,
      });
      if (res?.success) {
        // Reload quota
        const quotaRes: any = await invoke('user_quota_dsm', { name: userDetail.name }).catch(() => null);
        if (quotaRes?.success) setDsmQuota(quotaRes.data?.user_quota || []);
      }
    } catch (err) {
      console.warn('[Quota] Set error:', err);
    } finally {
      setSavingPerm(null);
      setEditQuota(null);
    }
  };

  // ── Actions ──

  const handleToggleUser = async (userName: string) => {
    const user = users.find(u => u.name === userName);
    if (!user) return;
    const isDisabled = user.expired === 'true';
    const confirmed = await showDialog({
      title: `${isDisabled ? 'Enable' : 'Disable'} "${user.name}"?`,
      message: isDisabled ? 'This user will be able to access the NAS again.' : 'This user will no longer be able to log in.',
      variant: isDisabled ? 'info' : 'warning',
      confirmText: isDisabled ? 'Enable' : 'Disable',
    });
    if (!confirmed) return;
    try {
      await invoke('user_set_enabled', { name: user.name, enabled: isDisabled });
      await fetchUsers();
    } catch (err: any) { setError(err?.toString()); }
  };

  const handleDeleteUser = async (userName: string) => {
    const confirmed = await showDialog({
      title: `Delete "${userName}"?`,
      message: 'This will permanently remove this user account. This cannot be undone.',
      variant: 'danger', confirmText: 'Delete User',
    });
    if (!confirmed) return;
    try {
      await invoke('user_delete', { name: userName });
      await fetchUsers();
      if (selectedUser === userName) closeProfile();
    } catch (err: any) { setError(err?.toString()); }
  };

  const handleEditUser = (user: SynoUser) => {
    setEditUser(user);
    setEditEmail(user.email || '');
    setEditDesc(user.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const result: any = await invoke('user_edit', {
        name: editUser.name, email: editEmail || null, description: editDesc || null,
      });
      if (result?.success) { setEditUser(null); await fetchUsers(); if (selectedUser === editUser.name) openProfile(editUser.name); }
      else { await showDialog({ title: 'Update Failed', message: JSON.stringify(result?.error) || 'Unknown', variant: 'danger', showCancel: false, confirmText: 'OK' }); }
    } catch (err: any) {
      await showDialog({ title: 'Error', message: err?.toString(), variant: 'danger', showCancel: false, confirmText: 'OK' });
    } finally { setSaving(false); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPassword.trim()) return;
    setCreating(true);
    try {
      const result: any = await invoke('user_create', {
        name: newName.trim(), password: newPassword, email: newEmail.trim(), description: newDesc.trim(),
      });
      if (result?.success) {
        setShowCreate(false); setNewName(''); setNewPassword(''); setNewEmail(''); setNewDesc('');
        await fetchUsers();
      } else {
        const code = result?.error?.code;
        let msg = JSON.stringify(result?.error) || 'Unknown';
        if (code === 3121) msg = 'Password does not meet complexity requirements (min 8 chars, mixed case + number + special).';
        if (code === 3100) msg = 'User already exists.';
        await showDialog({ title: 'Failed to Create User', message: msg, variant: 'danger', showCancel: false, confirmText: 'OK' });
      }
    } catch (err: any) {
      await showDialog({ title: 'Error', message: err?.toString(), variant: 'danger', showCancel: false, confirmText: 'OK' });
    } finally { setCreating(false); }
  };

  const openCtxMenu = (e: React.MouseEvent, userName: string) => {
    e.preventDefault(); e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY, userName });
  };

  const isAdminUser = (name: string) => adminNames.has(name);
  const isSystemUser = (name: string) => name === 'admin' || name === 'root';

  // ── Derived ──

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u =>
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.description || '').toLowerCase().includes(q)
    );
  }, [users, search]);

  const adminUsersList = filteredUsers.filter(u => adminNames.has(u.name));
  const normalUsersList = filteredUsers.filter(u => !adminNames.has(u.name));
  const enabledCount = users.filter(u => u.expired !== 'true').length;
  const disabledCount = users.filter(u => u.expired === 'true').length;

  if (loading) {
    return (
      <div className="ug">
        <div className="ug__loading"><Loader size={20} className="animate-spin" /> Loading Users & Groups...</div>
      </div>
    );
  }

  const canSeeProfile = (userName: string) => isCurrentAdmin || userName === currentUsername;

  return (
    <div className="ug">
      {/* ── Header ── */}
      <div className="ug__header">
        <div className="ug__title-area">
          <h1 className="ug__title"><Users size={18} /> Users & Groups</h1>
          <div className="ug__stats-inline">
            <span className="ug__stat-chip">{users.length} users</span>
            <span className="ug__stat-chip ug__stat-chip--green">{enabledCount} active</span>
            {disabledCount > 0 && <span className="ug__stat-chip ug__stat-chip--red">{disabledCount} disabled</span>}
            <span className="ug__stat-chip ug__stat-chip--blue">{groups.length} groups</span>
          </div>
        </div>
        <div className="ug__header-actions">
          <div className="ug__search">
            <Search size={13} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." />
          </div>
          {isCurrentAdmin && (
            <button className="ug__create-btn" onClick={() => setShowCreate(true)}>
              <UserPlus size={13} /> Create User
            </button>
          )}
          <button className="btn btn-ghost btn-icon" onClick={fetchAll} title="Refresh">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {error && (
        <div className="ug__error">
          <AlertCircle size={14} /> {error}
          <button onClick={() => setError(null)} className="ug__error-close">✕</button>
        </div>
      )}

      <div className="ug__body">
        {/* ── USER LIST ── */}
        <div className={`ug__content ${selectedUser ? 'ug__content--with-panel' : ''}`}>
          {/* Administrators */}
          {adminUsersList.length > 0 && (
            <div className="ug__admin-card">
              <div className="ug__admin-header">
                <Crown size={16} className="ug__admin-crown" />
                <span className="ug__admin-title">Administrators</span>
                <span className="ug__badge ug__badge--gold">{adminUsersList.length}</span>
              </div>
              <div className="ug__admin-grid">
                {adminUsersList.map(u => (
                  <MemberChip key={u.name} user={u} variant="admin"
                    isSelected={selectedUser === u.name}
                    onClick={() => openProfile(u.name)}
                    onContextMenu={e => openCtxMenu(e, u.name)} />
                ))}
              </div>
            </div>
          )}

          {/* Normal Users */}
          {normalUsersList.length > 0 && (
            <div className="ug__users-section">
              <div className="ug__section-header">
                <User size={14} />
                <span>Users</span>
                <span className="ug__badge ug__badge--green">{normalUsersList.length}</span>
              </div>
              <div className="ug__users-grid">
                {normalUsersList.map(u => (
                  <MemberChip key={u.name} user={u} variant="user"
                    disabled={u.expired === 'true'}
                    isSelected={selectedUser === u.name}
                    onClick={() => openProfile(u.name)}
                    onContextMenu={e => openCtxMenu(e, u.name)} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── PROFILE PANEL (slide-in) ── */}
        {selectedUser && (
          <div className="ug__panel">
            <div className="ug__panel-header">
              <span className="ug__panel-title">Personal</span>
              <button className="ug__panel-close" onClick={closeProfile}><X size={14} /></button>
            </div>

            {loadingProfile ? (
              <div className="ug__panel-loading"><Loader size={16} className="animate-spin" /> Loading...</div>
            ) : userDetail ? (
              <div className="ug__panel-body">
                {/* Avatar + Name */}
                <div className="ug__profile-top">
                  <div className="ug__profile-avatar" style={{ background: `${getAvatarColor(userDetail.name)}20`, color: getAvatarColor(userDetail.name), borderColor: `${getAvatarColor(userDetail.name)}40` }}>
                    {getInitials(userDetail.name)}
                  </div>
                  <div className="ug__profile-name">{userDetail.name}</div>
                  {userDetail.description && <div className="ug__profile-desc">{userDetail.description}</div>}
                  {userDetail.expired === 'true' && <span className="ug__profile-status ug__profile-status--disabled">Disabled</span>}
                  {isAdminUser(userDetail.name) && <span className="ug__profile-status ug__profile-status--admin">Admin</span>}
                </div>

                {/* Full info (admin or self) */}
                {canSeeProfile(userDetail.name) && (
                  <>
                    {/* Account Info */}
                    <div className="ug__profile-section">
                      <div className="ug__profile-section-title">Account</div>
                      <div className="ug__profile-row">
                        <User size={12} /> <span className="ug__profile-label">Username</span>
                        <span className="ug__profile-value">{userDetail.name}</span>
                      </div>
                      {userDetail.email && (
                        <div className="ug__profile-row">
                          <Mail size={12} /> <span className="ug__profile-label">Email</span>
                          <span className="ug__profile-value">{userDetail.email}</span>
                        </div>
                      )}
                      {userDetail.uid !== undefined && (
                        <div className="ug__profile-row">
                          <Key size={12} /> <span className="ug__profile-label">UID</span>
                          <span className="ug__profile-value">{userDetail.uid}</span>
                        </div>
                      )}
                      {userDetail.password_last_change !== undefined && (
                        <div className="ug__profile-row">
                          <Clock size={12} /> <span className="ug__profile-label">Password Changed</span>
                          <span className="ug__profile-value">{formatDate(userDetail.password_last_change)}</span>
                        </div>
                      )}
                    </div>

                    {/* Groups */}
                    {userDetail.groups && userDetail.groups.length > 0 && (
                      <div className="ug__profile-section">
                        <div className="ug__profile-section-title">Groups</div>
                        <div className="ug__profile-groups">
                          {userDetail.groups.map(g => (
                            <span key={g} className="ug__profile-group-chip">{g}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quota */}
                    {userQuota.length > 0 && (
                      <div className="ug__profile-section">
                        <div className="ug__profile-section-title"><Database size={12} /> Storage Quota</div>
                        <div className="ug__profile-quota">
                          {userQuota.map((q, i) => (
                            <div key={i} className="ug__quota-row">
                              <span className="ug__quota-share">{q.share || q.volume || `Volume ${i + 1}`}</span>
                              <div className="ug__quota-bar-wrap">
                                <div className="ug__quota-bar"
                                  style={{ width: `${q.share_quota > 0 ? Math.min(100, (q.share_used / q.share_quota) * 100) : (q.user_quota > 0 ? Math.min(100, (q.user_used / q.user_quota) * 100) : 0)}%` }} />
                              </div>
                              <span className="ug__quota-text">
                                {formatBytes(q.share_used || q.user_used || 0)} / {(q.share_quota || q.user_quota) > 0 ? formatBytes(q.share_quota || q.user_quota) : 'No Limit'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Permissions Button */}
                    {isCurrentAdmin && (
                      <div className="ug__profile-section">
                        <button className="ug__profile-action-btn ug__profile-action-btn--perm" onClick={() => loadPermissions(userDetail.name)}>
                          <FolderLock size={12} /> View Permissions
                        </button>
                      </div>
                    )}

                    {/* Permissions Panel (inline) */}
                    {showPermsPanel && (
                      <div className="ug__profile-section">
                        <div className="ug__perm-tabs">
                          <button className={`ug__perm-tab ${permTab === 'perms' ? 'ug__perm-tab--active' : ''}`} onClick={() => setPermTab('perms')}>
                            <FolderLock size={11} /> Folders
                          </button>
                          <button className={`ug__perm-tab ${permTab === 'apps' ? 'ug__perm-tab--active' : ''}`} onClick={() => setPermTab('apps')}>
                            <AppWindow size={11} /> Apps
                          </button>
                          <button className={`ug__perm-tab ${permTab === 'quota' ? 'ug__perm-tab--active' : ''}`} onClick={() => setPermTab('quota')}>
                            <HardDrive size={11} /> Quota
                          </button>
                        </div>

                        {loadingPerms ? (
                          <div className="ug__panel-loading"><Loader size={14} className="animate-spin" /> Loading...</div>
                        ) : permTab === 'perms' ? (
                          <div className="ug__perm-list">
                            {sharePerms.length === 0 ? <div className="ug__perm-empty">No shared folders</div> : sharePerms.map((s: any) => {
                              const isDeny = s.is_deny === true;
                              const isRW = s.is_writable === true;
                              const isRO = s.is_readonly === true;
                              const current = isDeny ? 'deny' : isRW ? 'rw' : isRO ? 'ro' : 'none';
                              const isSaving = savingPerm === 'share-' + s.name;
                              return (
                                <div key={s.name} className="ug__perm-row ug__perm-row--folder">
                                  <span className="ug__perm-folder">{s.name}</span>
                                  <div className="ug__perm-actions">
                                    {isSaving ? <Loader size={12} className="animate-spin" /> : (
                                      <>
                                        <button
                                          className={`ug__perm-action-btn ug__perm-action-btn--sm ${current === 'rw' ? 'ug__perm-action-btn--active-allow' : ''}`}
                                          onClick={() => handleSetSharePerm(s.name, current === 'rw' ? 'none' : 'rw')}
                                          title="Read/Write"
                                        >R/W</button>
                                        <button
                                          className={`ug__perm-action-btn ug__perm-action-btn--sm ${current === 'ro' ? 'ug__perm-action-btn--active-warn' : ''}`}
                                          onClick={() => handleSetSharePerm(s.name, current === 'ro' ? 'none' : 'ro')}
                                          title="Read Only"
                                        >RO</button>
                                        <button
                                          className={`ug__perm-action-btn ug__perm-action-btn--sm ${current === 'deny' ? 'ug__perm-action-btn--active-deny' : ''}`}
                                          onClick={() => handleSetSharePerm(s.name, current === 'deny' ? 'none' : 'deny')}
                                          title="No Access"
                                        ><Lock size={9} /></button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : permTab === 'apps' ? (
                          <div className="ug__perm-list">
                            {appList.length === 0 ? <div className="ug__perm-empty">No applications</div> : appList.map((app: any) => {
                              const rules = appRules[app.app_id] || [];
                              const userRule = rules.find((r: any) => r.entity_name === userDetail.name && r.entity_type === 'user');
                              const everyoneRule = rules.find((r: any) => r.entity_type === 'everyone');
                              let currentAction = 'none';
                              if (userRule) {
                                const deny = (userRule.deny_ip || []).length > 0;
                                const allow = (userRule.allow_ip || []).length > 0;
                                if (deny) currentAction = 'deny';
                                else if (allow) currentAction = 'allow';
                              } else if (everyoneRule) {
                                currentAction = 'group';
                              }
                              const isSaving = savingPerm === app.app_id;
                              return (
                                <div key={app.app_id} className="ug__perm-row ug__perm-row--app">
                                  <span className="ug__perm-folder">{app.name}</span>
                                  <div className="ug__perm-actions">
                                    {isSaving ? <Loader size={12} className="animate-spin" /> : (
                                      <>
                                        <button
                                          className={`ug__perm-action-btn ${currentAction === 'allow' ? 'ug__perm-action-btn--active-allow' : ''}`}
                                          onClick={() => handleSetAppPriv(app.app_id, currentAction === 'allow' ? 'remove' : 'allow')}
                                          title="Allow"
                                        ><Unlock size={10} /></button>
                                        <button
                                          className={`ug__perm-action-btn ${currentAction === 'deny' ? 'ug__perm-action-btn--active-deny' : ''}`}
                                          onClick={() => handleSetAppPriv(app.app_id, currentAction === 'deny' ? 'remove' : 'deny')}
                                          title="Deny"
                                        ><Lock size={10} /></button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="ug__perm-list">
                            {(() => {
                              // Build quota rows: merge DSM quota data with share list
                              const quotaMap = new Map(dsmQuota.map((q: any) => [q.volume || q.share_name, q]));
                              const volumes = shareListData.length > 0
                                ? [...new Set(shareListData.map((s: any) => s.vol_path))].filter(Boolean) as string[]
                                : [...quotaMap.keys()];
                              
                              if (volumes.length === 0) {
                                return (
                                  <div className="ug__perm-empty">
                                    {adminNames.has(userDetail.name) ? '\u221e Unlimited (Admin)' : 'No volumes found'}
                                  </div>
                                );
                              }
                              
                              return volumes.map((vol: string) => {
                                const q = quotaMap.get(vol);
                                const used = q?.used_size || 0;
                                const quota = q?.quota_value || 0;
                                const pct = quota > 0 ? Math.min(100, (used / quota) * 100) : 0;
                                const isEditing = editQuota?.volume === vol;
                                const isSaving = savingPerm === 'quota-' + vol;
                                return (
                                  <div key={vol} className="ug__quota-row">
                                    <div className="ug__quota-header">
                                      <span className="ug__quota-share">{vol}</span>
                                      {isSaving ? <Loader size={10} className="animate-spin" /> : (
                                        <button className="ug__quota-edit-btn" onClick={() => {
                                          if (isEditing) { setEditQuota(null); }
                                          else { setEditQuota({ volume: vol, mb: String(quota > 0 ? Math.round(quota / 1024 / 1024) : 0) }); }
                                        }} title="Edit quota">
                                          <Edit3 size={9} />
                                        </button>
                                      )}
                                    </div>
                                    <div className="ug__quota-bar-wrap"><div className="ug__quota-bar" style={{ width: `${pct}%` }} /></div>
                                    <span className="ug__quota-text">{formatBytes(used)} / {quota > 0 ? formatBytes(quota) : 'Unlimited'}</span>
                                    {isEditing && (
                                      <div className="ug__quota-edit">
                                        <input
                                          type="number"
                                          value={editQuota!.mb}
                                          onChange={e => setEditQuota({ volume: editQuota!.volume, mb: e.target.value })}
                                          placeholder="MB (0=unlimited)"
                                          className="ug__quota-input"
                                          autoFocus
                                        />
                                        <span className="ug__quota-unit">MB</span>
                                        <button className="ug__quota-save" onClick={() => handleSetQuota(vol, parseInt(editQuota!.mb) || 0)}>
                                          <Check size={10} /> Set
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    {isCurrentAdmin && (
                      <div className="ug__profile-actions">
                        <button className="ug__profile-action-btn" onClick={() => {
                          handleEditUser(users.find(u => u.name === userDetail.name) || { name: userDetail.name });
                        }}><Edit3 size={12} /> Edit</button>
                        {!isSystemUser(userDetail.name) && (
                          <>
                            <button className="ug__profile-action-btn" onClick={() => handleToggleUser(userDetail.name)}>
                              {userDetail.expired === 'true' ? <><ShieldCheck size={12} /> Enable</> : <><ShieldOff size={12} /> Disable</>}
                            </button>
                            <button className="ug__profile-action-btn ug__profile-action-btn--danger" onClick={() => handleDeleteUser(userDetail.name)}>
                              <UserMinus size={12} /> Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* ── CONTEXT MENU ── */}
      {ctxMenu && (
        <div className="ug__ctx" style={{ left: ctxMenu.x, top: ctxMenu.y }}>
          <button onClick={() => { openProfile(ctxMenu.userName); setCtxMenu(null); }}>
            <User size={12} /> View Profile
          </button>
          {isCurrentAdmin && (
            <>
              <button onClick={() => { handleEditUser(users.find(u => u.name === ctxMenu.userName) || { name: ctxMenu.userName }); setCtxMenu(null); }}>
                <Edit3 size={12} /> Edit User
              </button>
              {!isSystemUser(ctxMenu.userName) && (
                <>
                  <button onClick={() => { handleToggleUser(ctxMenu.userName); setCtxMenu(null); }}>
                    {users.find(u => u.name === ctxMenu.userName)?.expired === 'true'
                      ? <><ShieldCheck size={12} /> Enable</>
                      : <><ShieldOff size={12} /> Disable</>}
                  </button>
                  <div className="ug__ctx-divider" />
                  <button className="ug__ctx--danger" onClick={() => { handleDeleteUser(ctxMenu.userName); setCtxMenu(null); }}>
                    <UserMinus size={12} /> Delete User
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── CREATE MODAL ── */}
      {showCreate && (
        <div className="ug__modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="ug__modal" onClick={e => e.stopPropagation()}>
            <div className="ug__modal-header">
              <h3><UserPlus size={16} /> Create New User</h3>
              <button className="ug__modal-close" onClick={() => setShowCreate(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreateUser} className="ug__modal-form">
              <div className="ug__field"><label>Username *</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="username" required autoFocus /></div>
              <div className="ug__field"><label>Password *</label>
                <div className="ug__pwd-wrap">
                  <input type={showPwd ? 'text' : 'password'} value={newPassword}
                    onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 chars, mixed case + number" required />
                  <button type="button" className="ug__pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div></div>
              <div className="ug__field"><label>Email</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="user@example.com" /></div>
              <div className="ug__field"><label>Description</label>
                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Full name or description" /></div>
              <div className="ug__modal-actions">
                <button type="button" className="ug__btn-cancel" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="ug__btn-primary" disabled={creating || !newName.trim() || !newPassword.trim()}>
                  {creating ? <Loader size={12} className="animate-spin" /> : <UserPlus size={13} />}
                  {creating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {editUser && (
        <div className="ug__modal-overlay" onClick={() => setEditUser(null)}>
          <div className="ug__modal" onClick={e => e.stopPropagation()}>
            <div className="ug__modal-header">
              <h3><Edit3 size={16} /> Edit — {editUser.name}</h3>
              <button className="ug__modal-close" onClick={() => setEditUser(null)}><X size={16} /></button>
            </div>
            <div className="ug__modal-form">
              <div className="ug__field"><label>Email</label>
                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="user@example.com" autoFocus /></div>
              <div className="ug__field"><label>Description</label>
                <input value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Full name or description" /></div>
              <div className="ug__modal-actions">
                <button type="button" className="ug__btn-cancel" onClick={() => setEditUser(null)}>Cancel</button>
                <button type="button" className="ug__btn-primary" onClick={handleSaveEdit} disabled={saving}>
                  {saving ? <Loader size={12} className="animate-spin" /> : <Edit3 size={13} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {DialogComponent}
    </div>
  );
};

// ── MemberChip ──

const MemberChip: React.FC<{
  user: SynoUser;
  variant: 'admin' | 'user' | 'compact';
  disabled?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}> = ({ user, variant, disabled, isSelected, onClick, onContextMenu }) => {
  const color = getAvatarColor(user.name);
  const initials = getInitials(user.name);
  const desc = user.description || user.email || '';

  return (
    <div className={`mc mc--${variant} ${disabled ? 'mc--disabled' : ''} ${isSelected ? 'mc--selected' : ''}`}
      onClick={onClick}
      onContextMenu={onContextMenu}>
      <div className="mc__avatar" style={{ background: `${color}20`, color, borderColor: `${color}40` }}>
        {initials}
      </div>
      <div className="mc__info">
        <div className="mc__name">{user.name}</div>
        {desc && <div className="mc__desc">{desc}</div>}
      </div>
      <button className="mc__more" onClick={e => { e.stopPropagation(); onContextMenu(e); }} title="Actions">
        <MoreHorizontal size={14} />
      </button>
    </div>
  );
};

export default UsersGroups;
