import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';
import '../widgets/glass_card.dart';
import '../services/session_manager.dart';

/// User Permissions Management Screen.
/// Shows 3 tabs matching DSM Control Panel: Permissions, Applications, Quota.
class UserPermissionsScreen extends StatefulWidget {
  final String userName;
  const UserPermissionsScreen({super.key, required this.userName});

  @override
  State<UserPermissionsScreen> createState() => _UserPermissionsScreenState();
}

class _UserPermissionsScreenState extends State<UserPermissionsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _loading = true;
  String? _error;

  // Tab 1: Share Permissions
  List<Map<String, dynamic>> _sharePerms = [];

  // Tab 2: App Privileges
  List<Map<String, dynamic>> _apps = [];
  Map<String, List<Map<String, dynamic>>> _appRules = {};

  // Tab 3: Quota
  List<Map<String, dynamic>> _quotas = [];
  List<Map<String, dynamic>> _shareList = []; // all shares for volume display

  // Admin group members (to check if user is admin)
  List<String> _adminMembers = [];

  // Saving state
  String? _savingKey;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadAll();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadAll() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    final api = SessionManager.instance.api;
    if (api == null) {
      setState(() {
        _error = 'Not connected';
        _loading = false;
      });
      return;
    }

    // Ensure DSM admin session
    final sm = SessionManager.instance;
    if (sm.account.isNotEmpty && sm.password.isNotEmpty) {
      try {
        await api.ensureDsmSession(sm.account, sm.password);
      } catch (_) {}
    }

    try {
      // Load all data in parallel
      final futures = await Future.wait([
        api.getSharePermissionsByUser(widget.userName),
        api.listAppPrivApps(),
        api.getDsmUserQuota(widget.userName),
        api.listGroupMembers('administrators'),
        api.listDsmSharedFolders(),
      ]);

      // Parse share permissions
      final permResp = futures[0];
      if (permResp['success'] == true) {
        _sharePerms = List<Map<String, dynamic>>.from(
          permResp['data']?['shares'] as List? ?? [],
        );
      }

      // Parse apps
      final appResp = futures[1];
      if (appResp['success'] == true) {
        _apps = List<Map<String, dynamic>>.from(
          appResp['data']?['applications'] as List? ?? [],
        );
        // Batch load all app rules
        if (_apps.isNotEmpty) {
          final appIds =
              _apps.map((a) => a['app_id'] as String).toList();
          _appRules = await api.getAllAppPrivRules(appIds);
        }
      }

      // Parse quota
      final quotaResp = futures[2];
      if (quotaResp['success'] == true) {
        _quotas = List<Map<String, dynamic>>.from(
          quotaResp['data']?['user_quota'] as List? ?? [],
        );
      }

      // Parse admin members
      final adminResp = futures[3];
      if (adminResp['success'] == true) {
        final users = adminResp['data']?['users'] as List? ?? [];
        _adminMembers = users
            .map((u) => (u as Map)['name'] as String? ?? '')
            .where((n) => n.isNotEmpty)
            .toList();
      }

      // Parse share list (for quota volume display)
      final shareResp = futures[4];
      if (shareResp['success'] == true) {
        _shareList = List<Map<String, dynamic>>.from(
          shareResp['data']?['shares'] as List? ?? [],
        );
      }
    } catch (e) {
      _error = e.toString();
    }

    if (mounted) setState(() => _loading = false);
  }

  bool get _isUserAdmin => _adminMembers.contains(widget.userName);

  // ── Write Actions ──

  Future<void> _setSharePerm(String shareName, String perm) async {
    final api = SessionManager.instance.api;
    if (api == null) return;
    setState(() => _savingKey = 'share-$shareName');
    try {
      final ok = await api.setSharePermissionDsm(
        shareName: shareName,
        userName: widget.userName,
        perm: perm,
      );
      if (ok) {
        final resp = await api.getSharePermissionsByUser(widget.userName);
        if (resp['success'] == true && mounted) {
          setState(() {
            _sharePerms = List<Map<String, dynamic>>.from(
              resp['data']?['shares'] as List? ?? [],
            );
          });
        }
      }
    } catch (_) {}
    if (mounted) setState(() => _savingKey = null);
  }

  Future<void> _setAppPriv(String appId, String action) async {
    final api = SessionManager.instance.api;
    if (api == null) return;
    setState(() => _savingKey = 'app-$appId');
    try {
      final ok = await api.setAppPrivForUser(
        appId: appId,
        userName: widget.userName,
        action: action,
      );
      if (ok && _apps.isNotEmpty) {
        final appIds = _apps.map((a) => a['app_id'] as String).toList();
        final newRules = await api.getAllAppPrivRules(appIds);
        if (mounted) setState(() => _appRules = newRules);
      }
    } catch (_) {}
    if (mounted) setState(() => _savingKey = null);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: AppColors.surfaceContainer,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.onSurface),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primaryContainer.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.admin_panel_settings,
                  color: AppColors.primaryContainer, size: 18),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                widget.userName,
                style: GoogleFonts.manrope(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: AppColors.onSurface,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primaryContainer,
          unselectedLabelColor: AppColors.onSurfaceVariant,
          indicatorColor: AppColors.primaryContainer,
          indicatorWeight: 2.5,
          labelStyle: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600),
          tabs: const [
            Tab(text: 'Permissions'),
            Tab(text: 'Applications'),
            Tab(text: 'Quota'),
          ],
        ),
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary))
          : _error != null
              ? _buildError()
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildPermissionsTab(),
                    _buildApplicationsTab(),
                    _buildQuotaTab(),
                  ],
                ),
    );
  }

  Widget _buildError() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.error_outline, color: AppColors.error, size: 48),
          const SizedBox(height: 12),
          Text(_error!, style: GoogleFonts.inter(color: AppColors.onSurfaceVariant)),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: _loadAll, child: const Text('Retry')),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // TAB 1: Shared Folder Permissions (EDITABLE)
  // ═══════════════════════════════════════════════════════════════
  Widget _buildPermissionsTab() {
    if (_sharePerms.isEmpty) {
      return _emptyState('No shared folders', Icons.folder_off_outlined);
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: _loadAll,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        itemCount: _sharePerms.length,
        itemBuilder: (ctx, i) => _buildSharePermRow(_sharePerms[i]),
      ),
    );
  }

  Widget _buildSharePermRow(Map<String, dynamic> share) {
    final name = share['name'] as String? ?? '';
    final isWritable = share['is_writable'] == true;
    final isReadonly = share['is_readonly'] == true;
    final isDeny = share['is_deny'] == true;
    final current = isDeny ? 'deny' : isWritable ? 'rw' : isReadonly ? 'ro' : 'none';
    final isSaving = _savingKey == 'share-$name';

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: GlassCard(
        borderRadius: 12,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Row(
          children: [
            Icon(Icons.folder, size: 18,
                color: AppColors.primaryContainer.withValues(alpha: 0.7)),
            const SizedBox(width: 8),
            Expanded(
              child: Text(name,
                  style: GoogleFonts.manrope(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.onSurface),
                  overflow: TextOverflow.ellipsis),
            ),
            if (isSaving)
              const SizedBox(
                width: 16, height: 16,
                child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
              )
            else ...[
              _permButton('R/W', current == 'rw',
                  current == 'rw' ? AppColors.secondary : null,
                  () => _setSharePerm(name, current == 'rw' ? 'none' : 'rw')),
              const SizedBox(width: 4),
              _permButton('RO', current == 'ro',
                  current == 'ro' ? AppColors.tertiary : null,
                  () => _setSharePerm(name, current == 'ro' ? 'none' : 'ro')),
              const SizedBox(width: 4),
              _permIconButton(Icons.lock, current == 'deny',
                  current == 'deny' ? AppColors.error : null,
                  () => _setSharePerm(name, current == 'deny' ? 'none' : 'deny')),
            ],
          ],
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // TAB 2: Application Privileges (EDITABLE)
  // ═══════════════════════════════════════════════════════════════
  Widget _buildApplicationsTab() {
    if (_apps.isEmpty) {
      return _emptyState('No applications', Icons.apps_outlined);
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: _loadAll,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        itemCount: _apps.length,
        itemBuilder: (ctx, i) => _buildAppRow(_apps[i]),
      ),
    );
  }

  Widget _buildAppRow(Map<String, dynamic> app) {
    final appId = app['app_id'] as String? ?? '';
    final appName = app['name'] as String? ?? appId;
    final rules = _appRules[appId] ?? [];

    // Find user's rule
    final userRule = rules.where((r) => r['entity_name'] == widget.userName && r['entity_type'] == 'user').toList();
    final everyoneRule = rules.where((r) => r['entity_type'] == 'everyone').toList();

    String currentAction = 'none';
    if (userRule.isNotEmpty) {
      final denyIp = userRule.first['deny_ip'] as List? ?? [];
      final allowIp = userRule.first['allow_ip'] as List? ?? [];
      if (denyIp.isNotEmpty) {
        currentAction = 'deny';
      } else if (allowIp.isNotEmpty) {
        currentAction = 'allow';
      }
    } else if (everyoneRule.isNotEmpty) {
      currentAction = 'group';
    }

    final isSaving = _savingKey == 'app-$appId';

    // App icon
    IconData appIcon;
    if (appName.contains('File Station')) {
      appIcon = Icons.folder_open;
    } else if (appName.contains('DSM')) {
      appIcon = Icons.dashboard;
    } else if (appName.contains('Audio')) {
      appIcon = Icons.music_note;
    } else if (appName.contains('FTP') || appName.contains('SFTP')) {
      appIcon = Icons.swap_vert;
    } else if (appName.contains('AFP') || appName.contains('SMB')) {
      appIcon = Icons.share;
    } else if (appName.contains('Search')) {
      appIcon = Icons.search;
    } else if (appName.contains('rsync')) {
      appIcon = Icons.sync;
    } else {
      appIcon = Icons.apps;
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: GlassCard(
        borderRadius: 12,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppColors.primaryContainer.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(appIcon, size: 16, color: AppColors.primaryContainer),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(appName,
                      style: GoogleFonts.manrope(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.onSurface),
                      overflow: TextOverflow.ellipsis),
                  if (currentAction == 'group')
                    Text('Inherited (Group)',
                        style: GoogleFonts.inter(
                            fontSize: 9, color: AppColors.secondary.withValues(alpha: 0.7))),
                ],
              ),
            ),
            if (isSaving)
              const SizedBox(
                width: 16, height: 16,
                child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
              )
            else ...[
              _permIconButton(Icons.lock_open, currentAction == 'allow',
                  currentAction == 'allow' ? AppColors.secondary : null,
                  () => _setAppPriv(appId, currentAction == 'allow' ? 'remove' : 'allow')),
              const SizedBox(width: 4),
              _permIconButton(Icons.lock, currentAction == 'deny',
                  currentAction == 'deny' ? AppColors.error : null,
                  () => _setAppPriv(appId, currentAction == 'deny' ? 'remove' : 'deny')),
            ],
          ],
        ),
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // TAB 3: Quota
  // ═══════════════════════════════════════════════════════════════
  Widget _buildQuotaTab() {
    // Build volume list from shares
    final volumes = _shareList.isNotEmpty
        ? _shareList.map((s) => s['vol_path'] as String? ?? '').where((v) => v.isNotEmpty).toSet().toList()
        : _quotas.map((q) => (q['volume'] ?? q['share_name'] ?? '') as String).where((v) => v.isNotEmpty).toSet().toList();

    if (volumes.isEmpty) {
      if (_isUserAdmin) {
        return Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64, height: 64,
                decoration: BoxDecoration(
                  color: AppColors.secondary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.all_inclusive, size: 32, color: AppColors.secondary),
              ),
              const SizedBox(height: 16),
              Text('Unlimited',
                  style: GoogleFonts.manrope(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
              const SizedBox(height: 6),
              Text('Admin users are not subject to quotas.',
                  style: GoogleFonts.inter(fontSize: 12, color: AppColors.onSurfaceVariant)),
            ],
          ),
        );
      }
      return _emptyState('No volumes found', Icons.storage_outlined);
    }

    final quotaMap = <String, Map<String, dynamic>>{};
    for (final q in _quotas) {
      final key = (q['volume'] ?? q['share_name'] ?? '') as String;
      if (key.isNotEmpty) quotaMap[key] = q;
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: _loadAll,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: volumes.length,
        itemBuilder: (ctx, i) {
          final vol = volumes[i];
          final q = quotaMap[vol];
          final used = (q?['used_size'] as num?)?.toDouble() ?? 0;
          final quota = (q?['quota_value'] as num?)?.toDouble() ?? 0;
          final pct = quota > 0 ? (used / quota).clamp(0.0, 1.0) : 0.0;

          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: GlassCard(
              borderRadius: 14,
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.storage, size: 18, color: AppColors.primaryContainer),
                      const SizedBox(width: 8),
                      Text(vol,
                          style: GoogleFonts.manrope(
                              fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
                      const Spacer(),
                      Text(
                        '${_formatBytes(used)} / ${quota > 0 ? _formatBytes(quota) : 'Unlimited'}',
                        style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.onSurfaceVariant),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: pct,
                      backgroundColor: AppColors.outlineVariant.withValues(alpha: 0.2),
                      color: pct > 0.9
                          ? AppColors.error
                          : pct > 0.7
                              ? AppColors.tertiary
                              : AppColors.secondary,
                      minHeight: 6,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    quota > 0 ? '${(pct * 100).toStringAsFixed(1)}% used' : 'No quota set',
                    style: GoogleFonts.inter(fontSize: 10, color: AppColors.onSurfaceVariant),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // Shared Widgets
  // ═══════════════════════════════════════════════════════════════

  /// Small text toggle button (R/W, RO)
  Widget _permButton(String label, bool active, Color? activeColor, VoidCallback onTap) {
    final color = active ? (activeColor ?? AppColors.primary) : AppColors.onSurfaceVariant;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: active ? color.withValues(alpha: 0.15) : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: active ? color.withValues(alpha: 0.4) : AppColors.outlineVariant.withValues(alpha: 0.3),
          ),
        ),
        child: Text(label,
            style: GoogleFonts.inter(
                fontSize: 9,
                fontWeight: FontWeight.w700,
                color: color)),
      ),
    );
  }

  /// Small icon toggle button (lock, unlock)
  Widget _permIconButton(IconData icon, bool active, Color? activeColor, VoidCallback onTap) {
    final color = active ? (activeColor ?? AppColors.primary) : AppColors.onSurfaceVariant;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 28, height: 28,
        decoration: BoxDecoration(
          color: active ? color.withValues(alpha: 0.15) : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: active ? color.withValues(alpha: 0.4) : AppColors.outlineVariant.withValues(alpha: 0.3),
          ),
        ),
        child: Icon(icon, size: 13, color: color),
      ),
    );
  }

  Widget _emptyState(String msg, IconData icon) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 48, color: AppColors.onSurfaceVariant.withValues(alpha: 0.4)),
          const SizedBox(height: 12),
          Text(msg,
              style: GoogleFonts.inter(
                  fontSize: 14, color: AppColors.onSurfaceVariant)),
        ],
      ),
    );
  }

  String _formatBytes(double bytes) {
    if (bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    int idx = 0;
    double val = bytes;
    while (val >= 1024 && idx < units.length - 1) {
      val /= 1024;
      idx++;
    }
    return '${val.toStringAsFixed(val < 10 ? 2 : 1)} ${units[idx]}';
  }
}
