import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';
import '../services/audio_service.dart';
import '../services/session_manager.dart';
import '../l10n/app_localizations.dart';

/// Music sub-tab inside MediaHub.
/// Manages its own scan state, folder picker, search, and 3 views (All/Artists/Albums).
class MusicTabView extends StatefulWidget {
  const MusicTabView({super.key});

  @override
  State<MusicTabView> createState() => _MusicTabViewState();
}

class _MusicTabViewState extends State<MusicTabView> {
  // ── State ──
  List<AudioTrack> _tracks = [];
  List<String> _folders = [];
  bool _scanning = false;
  String _scanStatus = '';
  int _scanCount = 0;
  bool _loaded = false;

  // Sub-view: 0=All, 1=Artists, 2=Albums
  int _viewMode = 0;
  String _search = '';
  final _searchController = TextEditingController();

  // Folder picker
  List<_FolderEntry> _shares = [];
  bool _sharesLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCachedLibrary();
    _loadShares();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  // ── Load cached library ──
  Future<void> _loadCachedLibrary() async {
    final nasId = _getNasId();
    final lib = await AudioService.loadLibrary(nasId);
    if (mounted) {
      setState(() {
        _tracks = lib.tracks;
        _folders = lib.folders;
        _loaded = true;
      });
    }
  }

  String _getNasId() {
    // Use the session URL as unique NAS identifier
    final api = SessionManager.instance.api;
    return api?.baseUrl.hashCode.toString() ?? 'default';
  }

  // ── Load shares for folder picker ──
  Future<void> _loadShares() async {
    final api = SessionManager.instance.api;
    if (api == null) return;
    try {
      final resp = await api.listSharedFolders();
      if (resp['success'] == true) {
        final shares = (resp['data']?['shares'] as List? ?? []);
        if (mounted) {
          setState(() {
            _shares = shares.map((s) {
              final m = s as Map<String, dynamic>;
              return _FolderEntry(
                path: m['path'] as String? ?? '/${m['name']}',
                name: m['name'] as String? ?? '',
              );
            }).toList();
            _sharesLoading = false;
          });
        }
      } else {
        if (mounted) setState(() => _sharesLoading = false);
      }
    } catch (_) {
      if (mounted) setState(() => _sharesLoading = false);
    }
  }

  // ── Scan ──
  Future<void> _startScan(String folderPath, String folderName) async {
    setState(() {
      _scanning = true;
      _scanStatus = 'Starting...';
      _scanCount = 0;
    });

    final tracks = await AudioService.scanFolder(
      rootPath: folderPath,
      rootName: folderName,
      onProgress: (status, count) {
        if (mounted) {
          setState(() {
            _scanStatus = status;
            _scanCount = count;
          });
        }
      },
    );

    if (mounted) {
      setState(() {
        _tracks = tracks;
        _folders = [folderPath];
        _scanning = false;
      });
      // Persist
      await AudioService.saveLibrary(_getNasId(), tracks, [folderPath]);
    }
  }

  // ── Filtered & grouped data ──
  List<AudioTrack> get _filtered {
    if (_search.isEmpty) return _tracks;
    final q = _search.toLowerCase();
    return _tracks.where((t) =>
        t.title.toLowerCase().contains(q) ||
        t.artist.toLowerCase().contains(q) ||
        t.album.toLowerCase().contains(q) ||
        t.name.toLowerCase().contains(q)).toList();
  }

  Map<String, List<AudioTrack>> get _artistGroups {
    final map = <String, List<AudioTrack>>{};
    for (final t in _filtered) {
      map.putIfAbsent(t.artist, () => []).add(t);
    }
    return Map.fromEntries(
      map.entries.toList()..sort((a, b) => a.key.compareTo(b.key)),
    );
  }

  Map<String, List<AudioTrack>> get _albumGroups {
    final map = <String, List<AudioTrack>>{};
    for (final t in _filtered) {
      final key = '${t.artist} — ${t.album}';
      map.putIfAbsent(key, () => []).add(t);
    }
    return Map.fromEntries(
      map.entries.toList()..sort((a, b) => a.key.compareTo(b.key)),
    );
  }

  // ── Build ──
  @override
  Widget build(BuildContext context) {
    if (!_loaded) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }

    if (_scanning) return _buildScanning();
    if (_tracks.isEmpty) return _buildEmpty();
    return _buildLibrary();
  }

  // ── Scanning state ──
  Widget _buildScanning() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(
            width: 48,
            height: 48,
            child: CircularProgressIndicator(
              color: AppColors.primary,
              strokeWidth: 3,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Scanning Audio Files',
            style: GoogleFonts.manrope(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _scanStatus,
            style: GoogleFonts.inter(
              fontSize: 13,
              color: AppColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            '$_scanCount tracks found',
            style: GoogleFonts.inter(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }

  // ── Empty state ──
  Widget _buildEmpty() {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 60, 20, 32),
      child: Column(
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(
              Icons.music_note,
              size: 36,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Music Library',
            style: GoogleFonts.manrope(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: AppColors.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Select a folder on your NAS that contains audio files',
            style: GoogleFonts.inter(
              fontSize: 14,
              color: AppColors.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 28),
          _buildFolderPickerButton(),
        ],
      ),
    );
  }

  Widget _buildFolderPickerButton() {
    return GestureDetector(
      onTap: _showFolderPicker,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [AppColors.primary, AppColors.primaryContainer],
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.3),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.folder_open, color: AppColors.onPrimary, size: 20),
            const SizedBox(width: 10),
            Text(
              'Choose Folder',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                color: AppColors.onPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Main library ──
  Widget _buildLibrary() {
    final filtered = _filtered;
    final artists = _artistGroups;
    final albums = _albumGroups;

    return Column(
      children: [
        // ── Header: view toggle + search + rescan ──
        _buildHeader(filtered, artists, albums),

        // ── Stats bar ──
        _buildStatsBar(filtered, artists, albums),

        // ── Content ──
        Expanded(
          child: _viewMode == 0
              ? _buildAllTracksView(filtered)
              : _viewMode == 1
                  ? _buildArtistsView(artists)
                  : _buildAlbumsView(albums),
        ),
      ],
    );
  }

  Widget _buildHeader(
    List<AudioTrack> filtered,
    Map<String, List<AudioTrack>> artists,
    Map<String, List<AudioTrack>> albums,
  ) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 12, 0),
      child: Column(
        children: [
          // View toggle
          Row(
            children: [
              _viewToggle('♫ All', 0),
              const SizedBox(width: 6),
              _viewToggle('👤 Artists', 1),
              const SizedBox(width: 6),
              _viewToggle('💿 Albums', 2),
              const Spacer(),
              // Rescan button
              GestureDetector(
                onTap: _showFolderPicker,
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceContainerHigh,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.refresh,
                    size: 18,
                    color: AppColors.onSurfaceVariant,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Search bar
          Container(
            height: 38,
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerLow,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: AppColors.outlineVariant.withValues(alpha: 0.12),
              ),
            ),
            child: Row(
              children: [
                const SizedBox(width: 10),
                const Icon(Icons.search, size: 16, color: AppColors.onSurfaceVariant),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    onChanged: (v) => setState(() => _search = v),
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: AppColors.onSurface,
                    ),
                    decoration: InputDecoration(
                      hintText: 'Search music...',
                      hintStyle: GoogleFonts.inter(
                        fontSize: 13,
                        color: AppColors.onSurfaceVariant.withValues(alpha: 0.5),
                      ),
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.zero,
                    ),
                  ),
                ),
                if (_search.isNotEmpty)
                  GestureDetector(
                    onTap: () {
                      _searchController.clear();
                      setState(() => _search = '');
                    },
                    child: const Padding(
                      padding: EdgeInsets.all(8),
                      child: Icon(Icons.close, size: 14, color: AppColors.onSurfaceVariant),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _viewToggle(String label, int mode) {
    final active = _viewMode == mode;
    return GestureDetector(
      onTap: () => setState(() => _viewMode = mode),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: active
              ? AppColors.primary.withValues(alpha: 0.15)
              : AppColors.surfaceContainerLow,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: active
                ? AppColors.primary.withValues(alpha: 0.3)
                : AppColors.outlineVariant.withValues(alpha: 0.1),
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12,
            fontWeight: active ? FontWeight.w700 : FontWeight.w500,
            color: active ? AppColors.primary : AppColors.onSurfaceVariant,
          ),
        ),
      ),
    );
  }

  Widget _buildStatsBar(
    List<AudioTrack> filtered,
    Map<String, List<AudioTrack>> artists,
    Map<String, List<AudioTrack>> albums,
  ) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 6),
      child: Row(
        children: [
          Text(
            '${filtered.length} tracks',
            style: GoogleFonts.inter(fontSize: 11, color: AppColors.onSurfaceVariant),
          ),
          _dot(),
          Text(
            '${artists.length} artists',
            style: GoogleFonts.inter(fontSize: 11, color: AppColors.onSurfaceVariant),
          ),
          _dot(),
          Text(
            '${albums.length} albums',
            style: GoogleFonts.inter(fontSize: 11, color: AppColors.onSurfaceVariant),
          ),
          const Spacer(),
          if (filtered.isNotEmpty)
            GestureDetector(
              onTap: () => AudioService.instance.playAll(filtered),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.play_arrow, size: 14, color: AppColors.primary),
                    const SizedBox(width: 4),
                    Text(
                      'Play All',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _dot() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6),
      child: Container(
        width: 3,
        height: 3,
        decoration: const BoxDecoration(
          shape: BoxShape.circle,
          color: AppColors.outlineVariant,
        ),
      ),
    );
  }

  // ── All Tracks View ──
  Widget _buildAllTracksView(List<AudioTrack> tracks) {
    return ListenableBuilder(
      listenable: AudioService.instance,
      builder: (context, _) {
        final audio = AudioService.instance;
        return ListView.builder(
          padding: const EdgeInsets.only(bottom: 80),
          itemCount: tracks.length,
          itemBuilder: (ctx, i) {
            final track = tracks[i];
            final isCurrent = audio.currentTrack?.id == track.id;
            final isPlaying = isCurrent && audio.isPlaying;

            return _SongRow(
              track: track,
              index: i + 1,
              isCurrent: isCurrent,
              isPlaying: isPlaying,
              onTap: () => audio.playTrack(track, queue: tracks),
            );
          },
        );
      },
    );
  }

  // ── Artists View ──
  Widget _buildArtistsView(Map<String, List<AudioTrack>> artists) {
    final entries = artists.entries.toList();
    return ListenableBuilder(
      listenable: AudioService.instance,
      builder: (context, _) {
        return ListView.builder(
          padding: const EdgeInsets.only(bottom: 80),
          itemCount: entries.length,
          itemBuilder: (ctx, i) {
            return _GroupSection(
              icon: Icons.person,
              iconColor: AppColors.secondary,
              name: entries[i].key,
              tracks: entries[i].value,
            );
          },
        );
      },
    );
  }

  // ── Albums View ──
  Widget _buildAlbumsView(Map<String, List<AudioTrack>> albums) {
    final entries = albums.entries.toList();
    return ListenableBuilder(
      listenable: AudioService.instance,
      builder: (context, _) {
        return ListView.builder(
          padding: const EdgeInsets.only(bottom: 80),
          itemCount: entries.length,
          itemBuilder: (ctx, i) {
            return _GroupSection(
              icon: Icons.album,
              iconColor: AppColors.tertiary,
              name: entries[i].key,
              tracks: entries[i].value,
            );
          },
        );
      },
    );
  }

  // ── Folder picker ──
  void _showFolderPicker() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surfaceContainer,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => _MusicFolderPickerSheet(
        shares: _shares,
        isLoading: _sharesLoading,
        onSelect: (path, name) {
          Navigator.of(ctx).pop();
          _startScan(path, name);
        },
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// ── Song Row ──
// ═══════════════════════════════════════════════════════════════

class _SongRow extends StatelessWidget {
  final AudioTrack track;
  final int index;
  final bool isCurrent;
  final bool isPlaying;
  final VoidCallback onTap;

  const _SongRow({
    required this.track,
    required this.index,
    required this.isCurrent,
    required this.isPlaying,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        color: isCurrent
            ? AppColors.primary.withValues(alpha: 0.06)
            : Colors.transparent,
        child: Row(
          children: [
            // Index / equalizer
            SizedBox(
              width: 28,
              child: isPlaying
                  ? _MiniEq()
                  : Text(
                      '$index',
                      style: GoogleFonts.jetBrainsMono(
                        fontSize: 12,
                        color: isCurrent
                            ? AppColors.primary
                            : AppColors.onSurfaceVariant,
                      ),
                    ),
            ),
            const SizedBox(width: 10),

            // Track info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    track.title,
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      fontWeight: isCurrent ? FontWeight.w700 : FontWeight.w500,
                      color: isCurrent ? AppColors.primary : AppColors.onSurface,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          track.artist,
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: AppColors.onSurfaceVariant,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (track.album != 'Unknown Album') ...[
                        Text(
                          ' · ',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: AppColors.outlineVariant,
                          ),
                        ),
                        Flexible(
                          child: Text(
                            track.album,
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              color: AppColors.onSurfaceVariant.withValues(alpha: 0.7),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),

            // Format badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                track.ext.toUpperCase(),
                style: GoogleFonts.jetBrainsMono(
                  fontSize: 9,
                  fontWeight: FontWeight.w600,
                  color: AppColors.onSurfaceVariant,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// ── Group Section (Artist/Album) ──
// ═══════════════════════════════════════════════════════════════

class _GroupSection extends StatefulWidget {
  final IconData icon;
  final Color iconColor;
  final String name;
  final List<AudioTrack> tracks;

  const _GroupSection({
    required this.icon,
    required this.iconColor,
    required this.name,
    required this.tracks,
  });

  @override
  State<_GroupSection> createState() => _GroupSectionState();
}

class _GroupSectionState extends State<_GroupSection> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final audio = AudioService.instance;

    return Column(
      children: [
        // Header
        GestureDetector(
          onTap: () => setState(() => _expanded = !_expanded),
          behavior: HitTestBehavior.opaque,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: widget.iconColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(widget.icon, size: 18, color: widget.iconColor),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.name,
                        style: GoogleFonts.inter(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.onSurface,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        '${widget.tracks.length} tracks',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          color: AppColors.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                // Play all button
                GestureDetector(
                  onTap: () => audio.playAll(widget.tracks),
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.play_arrow,
                      size: 16,
                      color: AppColors.primary,
                    ),
                  ),
                ),
                const SizedBox(width: 4),
                Icon(
                  _expanded ? Icons.expand_less : Icons.expand_more,
                  size: 20,
                  color: AppColors.onSurfaceVariant,
                ),
              ],
            ),
          ),
        ),

        // Expanded tracks
        if (_expanded)
          ...widget.tracks.asMap().entries.map((entry) {
            final i = entry.key;
            final t = entry.value;
            final isCurrent = audio.currentTrack?.id == t.id;
            return _SongRow(
              track: t,
              index: i + 1,
              isCurrent: isCurrent,
              isPlaying: isCurrent && audio.isPlaying,
              onTap: () => audio.playTrack(t, queue: widget.tracks),
            );
          }),

        // Divider
        Divider(
          height: 1,
          color: AppColors.outlineVariant.withValues(alpha: 0.08),
        ),
      ],
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// ── Mini Equalizer (inline) ──
// ═══════════════════════════════════════════════════════════════

class _MiniEq extends StatefulWidget {
  @override
  State<_MiniEq> createState() => _MiniEqState();
}

class _MiniEqState extends State<_MiniEq> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (_, __) => Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: List.generate(4, (i) {
          final phase = (i * 0.25 + _ctrl.value) % 1.0;
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 0.5),
            width: 2,
            height: 3 + phase * 8,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(1),
            ),
          );
        }),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// ── Music Folder Picker Sheet ──
// ═══════════════════════════════════════════════════════════════

class _FolderEntry {
  final String path;
  final String name;
  const _FolderEntry({required this.path, required this.name});
}

class _MusicFolderPickerSheet extends StatefulWidget {
  final List<_FolderEntry> shares;
  final bool isLoading;
  final void Function(String path, String name) onSelect;

  const _MusicFolderPickerSheet({
    required this.shares,
    required this.isLoading,
    required this.onSelect,
  });

  @override
  State<_MusicFolderPickerSheet> createState() => _MusicFolderPickerSheetState();
}

class _MusicFolderPickerSheetState extends State<_MusicFolderPickerSheet> {
  String _currentPath = '';
  String _currentName = 'Root';
  List<_FolderEntry> _folders = [];
  bool _loading = false;
  final List<({String path, String name})> _breadcrumbs = [];

  @override
  void initState() {
    super.initState();
    _folders = widget.shares;
  }

  Future<void> _navigateTo(String path, String name) async {
    setState(() => _loading = true);
    _breadcrumbs.add((path: _currentPath, name: _currentName));
    _currentPath = path;
    _currentName = name;

    final api = SessionManager.instance.api;
    if (api == null) return;

    try {
      final resp = await api.listFiles(folderPath: path, limit: 500);
      if (resp['success'] == true) {
        final files = (resp['data']?['files'] as List? ?? []);
        if (mounted) {
          setState(() {
            _folders = files
                .where((f) => (f as Map)['isdir'] == true)
                .map((f) {
                  final m = f as Map<String, dynamic>;
                  return _FolderEntry(
                    path: m['path'] as String? ?? '',
                    name: m['name'] as String? ?? '',
                  );
                })
                .toList();
            _loading = false;
          });
        }
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _goBack() {
    if (_breadcrumbs.isEmpty) return;
    final prev = _breadcrumbs.removeLast();
    if (prev.path.isEmpty) {
      setState(() {
        _currentPath = '';
        _currentName = 'Root';
        _folders = widget.shares;
      });
    } else {
      _currentPath = prev.path;
      _currentName = prev.name;
      _navigateTo(prev.path, prev.name);
      _breadcrumbs.removeLast(); // undo the push from navigateTo
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.55,
      padding: const EdgeInsets.only(top: 16),
      child: Column(
        children: [
          // Handle
          Container(
            width: 36,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.outlineVariant.withValues(alpha: 0.4),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 16),

          // Title
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                const Icon(Icons.music_note, size: 22, color: AppColors.primary),
                const SizedBox(width: 8),
                Text(
                  'Select Music Folder',
                  style: GoogleFonts.manrope(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: AppColors.onSurface,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Breadcrumb
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                if (_currentPath.isNotEmpty)
                  GestureDetector(
                    onTap: _goBack,
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceContainerHigh,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.arrow_back, size: 16, color: AppColors.onSurface),
                    ),
                  ),
                if (_currentPath.isNotEmpty) const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _currentPath.isEmpty ? '/' : _currentPath,
                    style: GoogleFonts.jetBrainsMono(
                      fontSize: 12,
                      color: AppColors.onSurfaceVariant,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (_currentPath.isNotEmpty)
                  GestureDetector(
                    onTap: () => widget.onSelect(_currentPath, _currentName),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppColors.primary, AppColors.primaryContainer],
                        ),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'Scan Here',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.onPrimary,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          const Divider(height: 1),

          // Folder list
          Expanded(
            child: _loading || widget.isLoading
                ? const Center(
                    child: CircularProgressIndicator(
                      color: AppColors.primary,
                      strokeWidth: 2,
                    ),
                  )
                : ListView.builder(
                    itemCount: _folders.length,
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    itemBuilder: (_, i) {
                      final f = _folders[i];
                      return ListTile(
                        leading: Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(
                            Icons.folder,
                            size: 20,
                            color: AppColors.primary,
                          ),
                        ),
                        title: Text(
                          f.name,
                          style: GoogleFonts.inter(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: AppColors.onSurface,
                          ),
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            GestureDetector(
                              onTap: () => widget.onSelect(f.path, f.name),
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  'Scan',
                                  style: GoogleFonts.inter(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 4),
                            const Icon(
                              Icons.chevron_right,
                              size: 18,
                              color: AppColors.onSurfaceVariant,
                            ),
                          ],
                        ),
                        onTap: () => _navigateTo(f.path, f.name),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
