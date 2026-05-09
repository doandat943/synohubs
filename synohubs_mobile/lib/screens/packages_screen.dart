import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';
import '../widgets/glass_card.dart';
import '../services/session_manager.dart';
import '../l10n/app_localizations.dart';

class PackagesScreen extends StatefulWidget {
  const PackagesScreen({super.key});

  @override
  State<PackagesScreen> createState() => _PackagesScreenState();
}

class _PackagesScreenState extends State<PackagesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Installed
  List<_PackageItem> _installed = [];
  bool _loadingInstalled = true;
  String? _errorInstalled;

  // Server (All Packages)
  List<_ServerPackage> _serverPkgs = [];
  bool _loadingServer = true;
  String? _errorServer;

  String _search = '';
  String? _actionLoading;
  String _selectedCategory = 'all';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _fetchInstalled();
    _fetchServer();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  // ── Fetch installed packages ──
  Future<void> _fetchInstalled() async {
    final api = SessionManager.instance.api;
    if (api == null) return;

    setState(() => _loadingInstalled = true);
    try {
      final result = await api.getPackages();
      debugPrint('[Packages] Installed response success=${result['success']}');
      if (result['success'] == true) {
        final data = result['data'] as Map<String, dynamic>? ?? {};
        final rawList = data['packages'] as List? ?? [];
        _installed = rawList.map((p) {
          final m = p as Map<String, dynamic>;
          final additional = m['additional'] as Map<String, dynamic>? ?? {};
          final status = additional['status']?.toString() ?? '';
          final isRunning = status == 'running';
          final startable = additional['startable'] == true;
          final installType = additional['install_type']?.toString() ?? '';
          final ctlUninstall = additional['ctl_uninstall'] == true;
          final isSystem = installType == 'system' && !ctlUninstall;
          return _PackageItem(
            id: m['id']?.toString() ?? m['name']?.toString() ?? '',
            name: m['dname']?.toString() ?? m['name']?.toString() ?? m['id']?.toString() ?? '',
            version: m['version']?.toString() ?? '',
            desc: additional['description']?.toString() ?? m['desc']?.toString() ?? '',
            isRunning: isRunning,
            startable: startable,
            isSystem: isSystem,
          );
        }).toList();
        _errorInstalled = null;
      } else {
        _errorInstalled = 'API returned success=false';
      }
    } catch (e) {
      debugPrint('[Packages] Error: $e');
      _errorInstalled = e.toString();
    }
    _loadingInstalled = false;
    if (mounted) setState(() {});
  }

  // ── Fetch server (all available) packages ──
  Future<void> _fetchServer() async {
    final api = SessionManager.instance.api;
    if (api == null) return;

    setState(() => _loadingServer = true);
    try {
      final result = await api.packageListServer();
      if (result['success'] == true) {
        final data = result['data'] as Map<String, dynamic>? ?? {};
        final rawList = data['packages'] as List? ?? [];
        _serverPkgs = rawList.map((p) {
          final m = p as Map<String, dynamic>;
          return _ServerPackage(
            id: m['id']?.toString() ?? '',
            dname: m['dname']?.toString() ?? m['id']?.toString() ?? '',
            desc: m['desc']?.toString() ?? '',
            version: m['version']?.toString() ?? '',
            link: m['link']?.toString() ?? '',
            size: (m['size'] as num?)?.toInt() ?? 0,
            md5: m['md5']?.toString() ?? '',
            category: m['category']?.toString() ?? '',
          );
        }).toList();
        _errorServer = null;
      } else {
        _errorServer = 'Failed to load packages';
      }
    } catch (e) {
      _errorServer = e.toString();
    }
    _loadingServer = false;
    if (mounted) setState(() {});
  }

  // ── Actions ──
  Future<void> _handleStartStop(String id, bool currentlyRunning) async {
    setState(() => _actionLoading = id);
    final api = SessionManager.instance.api;
    if (api == null) return;

    try {
      if (currentlyRunning) {
        await api.packageStop(id);
      } else {
        await api.packageStart(id);
      }
      await Future.delayed(const Duration(milliseconds: 1500));
      await _fetchInstalled();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed: $e'), backgroundColor: AppColors.error),
        );
      }
    }
    _actionLoading = null;
    if (mounted) setState(() {});
  }

  Future<void> _handleUninstall(String id, String name) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surfaceContainer,
        title: Text('Uninstall $name?',
            style: GoogleFonts.manrope(fontWeight: FontWeight.w700, color: AppColors.onSurface)),
        content: Text(
          'The package and its configuration may be removed. This action cannot be undone.',
          style: GoogleFonts.inter(fontSize: 13, color: AppColors.onSurfaceVariant),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Cancel', style: GoogleFonts.inter(color: AppColors.onSurfaceVariant)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text('Uninstall',
                style: GoogleFonts.inter(color: AppColors.error, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    setState(() => _actionLoading = id);
    final api = SessionManager.instance.api;
    if (api == null) return;

    try {
      await api.packageUninstall(id);
      await Future.delayed(const Duration(milliseconds: 2000));
      await _fetchInstalled();
      await _fetchServer();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('$name has been uninstalled'), backgroundColor: AppColors.secondary),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Uninstall failed: $e'), backgroundColor: AppColors.error),
        );
      }
    }
    _actionLoading = null;
    if (mounted) setState(() {});
  }

  Future<void> _handleInstall(_ServerPackage pkg) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.surfaceContainer,
        title: Text('Install ${pkg.dname}?',
            style: GoogleFonts.manrope(fontWeight: FontWeight.w700, color: AppColors.onSurface)),
        content: Text(
          'v${pkg.version} • ${(pkg.size / 1024 / 1024).toStringAsFixed(1)} MB',
          style: GoogleFonts.inter(fontSize: 13, color: AppColors.onSurfaceVariant),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Cancel', style: GoogleFonts.inter(color: AppColors.onSurfaceVariant)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text('Install',
                style: GoogleFonts.inter(color: AppColors.secondary, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    setState(() => _actionLoading = pkg.id);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Installing ${pkg.dname}... This may take a minute.'),
          backgroundColor: AppColors.primaryContainer,
          duration: const Duration(seconds: 5),
        ),
      );
    }

    final api = SessionManager.instance.api;
    if (api == null) return;

    try {
      // Step 1: Download
      final dlResult = await api.packageInstallDownload(pkg.link, pkg.size, pkg.md5);
      debugPrint('[Packages] Download result: $dlResult');

      // Step 2: Poll for download completion (up to 60s)
      String? taskId = dlResult['data']?['taskid']?.toString();
      if (taskId != null) {
        for (int i = 0; i < 30; i++) {
          await Future.delayed(const Duration(seconds: 2));
          final status = await api.packageInstallStatus(taskId);
          final finished = status['data']?['finished'] == true;
          if (finished) break;
        }
      }

      // Step 3: Install
      await api.packageInstallInstall(pkg.id);
      await Future.delayed(const Duration(milliseconds: 2000));
      await _fetchInstalled();
      await _fetchServer();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${pkg.dname} installed successfully!'), backgroundColor: AppColors.secondary),
        );
      }
    } catch (e) {
      debugPrint('[Packages] Install error: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Install failed: $e'), backgroundColor: AppColors.error),
        );
      }
    }
    _actionLoading = null;
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context)!;
    final installedIds = _installed.map((p) => p.id).toSet();

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
                color: AppColors.secondary.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.apps, color: AppColors.secondary, size: 18),
            ),
            const SizedBox(width: 10),
            Text(l.installedPackages,
                style: GoogleFonts.manrope(fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.onSurface)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.onSurfaceVariant, size: 20),
            onPressed: () {
              _fetchInstalled();
              _fetchServer();
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.secondary,
          unselectedLabelColor: AppColors.onSurfaceVariant,
          indicatorColor: AppColors.secondary,
          indicatorSize: TabBarIndicatorSize.label,
          labelStyle: GoogleFonts.manrope(fontSize: 12, fontWeight: FontWeight.w700),
          tabs: [
            Tab(text: 'Installed (${_installed.length})'),
            Tab(text: 'All Packages (${_serverPkgs.length})'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildInstalledTab(),
          _buildAllTab(installedIds),
        ],
      ),
    );
  }

  // ── INSTALLED TAB ──
  Widget _buildInstalledTab() {
    if (_loadingInstalled) {
      return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    }

    final q = _search.toLowerCase();
    final filtered = _installed.where((p) {
      return p.name.toLowerCase().contains(q) || p.id.toLowerCase().contains(q);
    }).toList();
    final running = filtered.where((p) => p.isRunning).toList();
    final stopped = filtered.where((p) => !p.isRunning).toList();
    final runCount = _installed.where((p) => p.isRunning).length;
    final stopCount = _installed.length - runCount;

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: _buildSearchBar(),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: Row(
            children: [
              _statBadge('${_installed.length}', 'Total', AppColors.primaryContainer),
              const SizedBox(width: 8),
              _statBadge('$runCount', 'Running', AppColors.secondary),
              const SizedBox(width: 8),
              _statBadge('$stopCount', 'Stopped', AppColors.onSurfaceVariant),
            ],
          ),
        ),
        if (_errorInstalled != null)
          _errorBanner(_errorInstalled!, () => setState(() => _errorInstalled = null)),
        Expanded(
          child: filtered.isEmpty
              ? _buildEmpty('No packages installed')
              : ListView(
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                  children: [
                    if (running.isNotEmpty) ...[
                      _sectionLabel('Running (${running.length})'),
                      ...running.map(_buildInstalledCard),
                    ],
                    if (stopped.isNotEmpty) ...[
                      _sectionLabel('Stopped (${stopped.length})'),
                      ...stopped.map(_buildInstalledCard),
                    ],
                  ],
                ),
        ),
      ],
    );
  }

  // ── ALL PACKAGES TAB ──
  Widget _buildAllTab(Set<String> installedIds) {
    if (_loadingServer) {
      return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    }

    final q = _search.toLowerCase();
    final filtered = _serverPkgs.where((p) {
      final matchSearch = p.dname.toLowerCase().contains(q) || p.id.toLowerCase().contains(q);
      return matchSearch;
    }).toList();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: _buildSearchBar(),
        ),
        if (_errorServer != null)
          _errorBanner(_errorServer!, () => setState(() => _errorServer = null)),
        Expanded(
          child: filtered.isEmpty
              ? _buildEmpty('No packages found')
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                  itemCount: filtered.length,
                  itemBuilder: (ctx, i) {
                    final pkg = filtered[i];
                    final isInstalled = installedIds.contains(pkg.id);
                    return _buildServerCard(pkg, isInstalled);
                  },
                ),
        ),
      ],
    );
  }

  // ── Shared UI ──
  Widget _buildSearchBar() {
    return GlassCard(
      borderRadius: 12,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      child: Row(
        children: [
          const Icon(Icons.search, size: 18, color: AppColors.onSurfaceVariant),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              onChanged: (v) => setState(() => _search = v),
              style: GoogleFonts.inter(fontSize: 13, color: AppColors.onSurface),
              decoration: InputDecoration(
                hintText: 'Search packages...',
                hintStyle: GoogleFonts.inter(fontSize: 13, color: AppColors.onSurfaceVariant.withValues(alpha: 0.4)),
                border: InputBorder.none,
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 8),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _statBadge(String value, String label, Color color) {
    return Expanded(
      child: GlassCard(
        borderRadius: 12,
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Column(
          children: [
            Text(value, style: GoogleFonts.manrope(fontSize: 20, fontWeight: FontWeight.w800, color: color)),
            const SizedBox(height: 2),
            Text(label, style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w600, letterSpacing: 1, color: AppColors.onSurfaceVariant)),
          ],
        ),
      ),
    );
  }

  Widget _sectionLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(top: 8, bottom: 6),
      child: Text(text, style: GoogleFonts.manrope(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.onSurfaceVariant)),
    );
  }

  Widget _errorBanner(String msg, VoidCallback onClose) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: GlassCard(
        borderRadius: 10,
        padding: const EdgeInsets.all(10),
        child: Row(
          children: [
            const Icon(Icons.error_outline, size: 16, color: AppColors.error),
            const SizedBox(width: 8),
            Expanded(child: Text(msg, style: GoogleFonts.inter(fontSize: 11, color: AppColors.error))),
            GestureDetector(onTap: onClose, child: const Icon(Icons.close, size: 14, color: AppColors.onSurfaceVariant)),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty(String text) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.apps, size: 48, color: AppColors.onSurfaceVariant.withValues(alpha: 0.3)),
          const SizedBox(height: 12),
          Text(text, style: GoogleFonts.inter(fontSize: 13, color: AppColors.onSurfaceVariant)),
        ],
      ),
    );
  }

  // ── Installed Card ──
  Widget _buildInstalledCard(_PackageItem pkg) {
    final isPending = _actionLoading == pkg.id;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: GlassCard(
        borderRadius: 16,
        borderColor: pkg.isRunning ? AppColors.secondary : null,
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            _pkgIcon(pkg.id, pkg.isRunning),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(pkg.name, style: GoogleFonts.manrope(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.onSurface), maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 2),
                  Text('v${pkg.version}', style: GoogleFonts.inter(fontSize: 10, color: AppColors.onSurfaceVariant)),
                  if (pkg.desc.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(pkg.desc, style: GoogleFonts.inter(fontSize: 10, color: AppColors.onSurfaceVariant.withValues(alpha: 0.7)), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ],
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                _statusBadge(pkg.isRunning),
                const SizedBox(height: 6),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (pkg.startable)
                      _actionBtn(
                        isPending: isPending,
                        icon: pkg.isRunning ? Icons.stop_circle : Icons.play_circle,
                        color: pkg.isRunning ? AppColors.error : AppColors.secondary,
                        onTap: () => _handleStartStop(pkg.id, pkg.isRunning),
                      ),
                    if (!pkg.isSystem) ...[
                      const SizedBox(width: 6),
                      _actionBtn(
                        isPending: isPending,
                        icon: Icons.delete_outline,
                        color: AppColors.error,
                        onTap: () => _handleUninstall(pkg.id, pkg.name),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ── Server Package Card ──
  Widget _buildServerCard(_ServerPackage pkg, bool isInstalled) {
    final isPending = _actionLoading == pkg.id;
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: GlassCard(
        borderRadius: 16,
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            _pkgIcon(pkg.id, false),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(pkg.dname, style: GoogleFonts.manrope(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.onSurface), maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 2),
                  Text('v${pkg.version}', style: GoogleFonts.inter(fontSize: 10, color: AppColors.onSurfaceVariant)),
                  if (pkg.desc.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(pkg.desc, style: GoogleFonts.inter(fontSize: 10, color: AppColors.onSurfaceVariant.withValues(alpha: 0.7)), maxLines: 2, overflow: TextOverflow.ellipsis),
                  ],
                ],
              ),
            ),
            const SizedBox(width: 8),
            isInstalled
                ? Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.secondary.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text('Installed', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.secondary)),
                  )
                : GestureDetector(
                    onTap: isPending ? null : () => _handleInstall(pkg),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.primaryContainer.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: isPending
                          ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primaryContainer))
                          : Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.download, size: 12, color: AppColors.primaryContainer),
                                const SizedBox(width: 4),
                                Text('Install', style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.primaryContainer)),
                              ],
                            ),
                    ),
                  ),
          ],
        ),
      ),
    );
  }

  // ── Helpers ──
  Widget _pkgIcon(String id, bool running) {
    return Container(
      width: 40, height: 40,
      decoration: BoxDecoration(
        color: (running ? AppColors.secondary : AppColors.onSurfaceVariant).withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(_iconFor(id), size: 20, color: running ? AppColors.secondary : AppColors.onSurfaceVariant),
    );
  }

  Widget _statusBadge(bool running) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: (running ? AppColors.secondary : AppColors.onSurfaceVariant).withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(running ? Icons.play_arrow : Icons.stop, size: 10, color: running ? AppColors.secondary : AppColors.onSurfaceVariant),
          const SizedBox(width: 3),
          Text(running ? 'Running' : 'Stopped', style: GoogleFonts.inter(fontSize: 9, fontWeight: FontWeight.w700, color: running ? AppColors.secondary : AppColors.onSurfaceVariant)),
        ],
      ),
    );
  }

  Widget _actionBtn({required bool isPending, required IconData icon, required Color color, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: isPending ? null : onTap,
      child: Container(
        width: 32, height: 32,
        decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
        child: isPending
            ? Center(child: SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: color)))
            : Icon(icon, size: 16, color: color),
      ),
    );
  }

  IconData _iconFor(String id) {
    final l = id.toLowerCase();
    if (l.contains('docker') || l.contains('container')) return Icons.cloud;
    if (l.contains('plex') || l.contains('media')) return Icons.play_circle_fill;
    if (l.contains('download')) return Icons.download;
    if (l.contains('surveillance') || l.contains('camera')) return Icons.videocam;
    if (l.contains('photo')) return Icons.photo;
    if (l.contains('audio') || l.contains('music')) return Icons.music_note;
    if (l.contains('drive')) return Icons.folder;
    if (l.contains('note')) return Icons.note;
    if (l.contains('hyper') || l.contains('backup')) return Icons.backup;
    if (l.contains('antivirus') || l.contains('security')) return Icons.security;
    if (l.contains('text') || l.contains('editor')) return Icons.edit;
    if (l.contains('mail')) return Icons.mail;
    if (l.contains('web') || l.contains('station')) return Icons.web;
    if (l.contains('dns')) return Icons.dns;
    if (l.contains('vpn')) return Icons.vpn_key;
    if (l.contains('log')) return Icons.receipt_long;
    return Icons.extension;
  }
}

class _PackageItem {
  final String id, name, version, desc;
  final bool isRunning, startable, isSystem;

  _PackageItem({
    required this.id, required this.name, required this.version,
    this.desc = '', this.isRunning = false, this.startable = true, this.isSystem = false,
  });
}

class _ServerPackage {
  final String id, dname, desc, version, link, md5, category;
  final int size;

  _ServerPackage({
    required this.id, required this.dname, required this.desc,
    required this.version, required this.link, this.size = 0,
    this.md5 = '', this.category = '',
  });
}
