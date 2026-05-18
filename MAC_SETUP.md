# 🍎 SynoHubs — Mac Mini M4 Setup Guide
# Dành cho Antigravity tự động thực hiện

> **CHÚ Ý**: File này là hướng dẫn dành cho Antigravity (AI assistant) đọc và thực thi.
> Sau khi giải nén project, mở folder trong VS Code với Antigravity extension,
> rồi yêu cầu: "Đọc file MAC_SETUP.md và thực hiện setup theo hướng dẫn"

---

## Thông Tin Project

- **Monorepo**: ~/Synology/
  - `synohubs/` — Desktop app (Tauri v2 + React + TypeScript)
  - `synohubs_mobile/` — Mobile app (Flutter/Dart)
  - `synohubs.com/` — Landing page (Vite + React)
  - `.agent/skills/` — Antigravity skills (ship, ui-ux-pro-max)
- **GitHub**: https://github.com/duconmang/synohubs
- **Website**: https://synohubs.com (Cloudflare Pages)
- **Current Version**: 1.3.2

---

## Bước 1: Kiểm Tra và Cài Đặt Prerequisites

Chạy từng lệnh dưới đây. Nếu lệnh nào báo "not found" → cài theo hướng dẫn kèm.

### 1.1 Homebrew
```bash
brew --version
# Nếu chưa có:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### 1.2 Git
```bash
git --version
# Nếu chưa có:
brew install git
git config --global user.name "duconmang"
git config --global user.email "duconmang@gmail.com"
```

### 1.3 GitHub CLI
```bash
gh --version
# Nếu chưa có:
brew install gh
gh auth login
# Chọn: GitHub.com → HTTPS → Login with web browser
```

### 1.4 Node.js (v20+)
```bash
node --version
# Nếu chưa có:
brew install node
```

### 1.5 Rust
```bash
rustc --version
# Nếu chưa có:
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# Chọn option 1 (default)
source "$HOME/.cargo/env"
```

### 1.6 Flutter
```bash
flutter --version
# Nếu chưa có:
brew install --cask flutter
```

### 1.7 Android SDK (cho Flutter APK build)
```bash
echo $ANDROID_HOME
# Nếu chưa có:
brew install --cask android-studio
# Mở Android Studio → Setup Wizard → cài Android SDK
# Sau đó thêm vào ~/.zprofile:
echo 'export ANDROID_HOME="$HOME/Library/Android/sdk"' >> ~/.zprofile
echo 'export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools"' >> ~/.zprofile
source ~/.zprofile
```

### 1.8 Xcode Command Line Tools
```bash
xcode-select -p
# Nếu chưa có:
xcode-select --install
```

### 1.9 Wrangler (Cloudflare CLI)
```bash
wrangler --version
# Nếu chưa có:
npm install -g wrangler
wrangler login
```

---

## Bước 2: Giải Nén Project

Project đã được archive thành `SynoHubs_MacSetup.tar` với các exclusions:
- `node_modules/` (cài lại bằng npm install)
- `.dart_tool/` (tự generate bởi Flutter)
- `build/` (Flutter build output)
- `src-tauri/target/` (Rust build output ~17GB)
- `dist/` (Vite build output)
- `.gradle/` (Android build cache)
- `.git/` (sẽ clone fresh từ GitHub)
- `.exe/.msi` installers (build lại khi cần)

```bash
# Tạo thư mục nếu chưa có
mkdir -p ~/Synology

# Giải nén (từ USB/NAS/AirDrop — file tar nằm ở đâu thì chỉnh path)
cd ~/Synology
tar -xf /path/to/SynoHubs_MacSetup.tar

# Verify structure
ls -la ~/Synology/
# Expected: .agent/ .github/ design-system/ mockups/ synohubs/ synohubs.com/ synohubs_mobile/
```

---

## Bước 3: Khởi Tạo Git Repository

```bash
cd ~/Synology

# Init git và kết nối GitHub
git init
git remote add origin https://github.com/duconmang/synohubs.git
git fetch origin
git checkout -b main origin/main

# Verify
git log -1 --oneline
# Phải thấy commit mới nhất: v1.3.2: ...
```

---

## Bước 4: Cài Dependencies

### 4.1 Desktop App (Tauri + React)
```bash
cd ~/Synology/synohubs
npm install
```

### 4.2 Website (Vite + React)
```bash
cd ~/Synology/synohubs.com
npm install
```

### 4.3 Mobile App (Flutter)
```bash
cd ~/Synology/synohubs_mobile
flutter pub get
```

### 4.4 Verify Flutter
```bash
flutter doctor
# Android toolchain phải ✅
# Chrome phải ✅ (cho web dev)
# Xcode có thể ✗ nếu không cài — OK, không cần cho APK
```

---

## Bước 5: Test Build Từng Project

### 5.1 Desktop App — Dev Mode
```bash
cd ~/Synology/synohubs
npm run tauri dev
# Phải mở được cửa sổ SynoHubs desktop app
# Ctrl+C để tắt
```

### 5.2 Desktop App — Production Build (macOS .dmg!)
```bash
cd ~/Synology/synohubs
npm run tauri build
# Output: src-tauri/target/release/bundle/dmg/SynoHubs_1.3.2_aarch64.dmg
# ĐÂY LÀ BUILD macOS NATIVE — chỉ có thể tạo trên Mac!
```

### 5.3 Website — Dev Server
```bash
cd ~/Synology/synohubs.com
npm run dev
# Mở browser → http://localhost:5173
# Ctrl+C để tắt
```

### 5.4 Mobile App — APK Build
```bash
cd ~/Synology/synohubs_mobile
flutter build apk --release --split-per-abi
# Output: build/app/outputs/flutter-apk/app-arm64-v8a-release.apk
```

---

## Bước 6: Cấu Hình Deploy (Cloudflare)

File `.env.cloudflare` đã có sẵn trong archive tại:
```
~/Synology/synohubs.com/.env.cloudflare
```

Verify:
```bash
cat ~/Synology/synohubs.com/.env.cloudflare
# Phải thấy:
# CF_ZONE_ID=...
# CF_API_TOKEN=...
```

Test deploy (không cần deploy thật — chỉ verify wrangler hoạt động):
```bash
cd ~/Synology/synohubs.com
wrangler whoami
# Phải thấy account info
```

---

## Bước 7: Setup Git Aliases (Tiện Lợi)

```bash
cat >> ~/.zshrc << 'EOF'

# SynoHubs shortcuts
alias sync="cd ~/Synology && git pull origin main --rebase"
alias ship-commit="cd ~/Synology && git add -A && git commit -m"
alias push="cd ~/Synology && git push origin main"
alias dev-desktop="cd ~/Synology/synohubs && npm run tauri dev"
alias dev-web="cd ~/Synology/synohubs.com && npm run dev"
EOF

source ~/.zshrc
```

---

## Bước 8: Checklist Xác Nhận

Chạy script kiểm tra tổng hợp:

```bash
echo "=== SynoHubs Mac Setup Verification ==="
echo ""

echo "1. Git:"
git -C ~/Synology log -1 --oneline

echo ""
echo "2. Node:"
node --version

echo ""
echo "3. Rust:"
rustc --version

echo ""
echo "4. Flutter:"
flutter --version | head -1

echo ""
echo "5. GitHub CLI:"
gh auth status 2>&1 | head -2

echo ""
echo "6. Project folders:"
ls ~/Synology/ | grep -E "synohubs|\.agent"

echo ""
echo "7. Cloudflare config:"
test -f ~/Synology/synohubs.com/.env.cloudflare && echo "✅ .env.cloudflare exists" || echo "❌ MISSING"

echo ""
echo "=== Setup Complete ==="
```

---

## Lưu Ý Quan Trọng

### Làm việc song song Windows + Mac
```
TRƯỚC KHI CODE: git pull origin main --rebase
SAU KHI CODE:   git add -A && git commit -m "message" && git push origin main
```

### SSD 256GB — Quản lý dung lượng
```bash
# Xóa build artifacts khi cần
cd ~/Synology/synohubs && rm -rf src-tauri/target
cd ~/Synology/synohubs_mobile && flutter clean
cd ~/Synology/synohubs.com && rm -rf dist
```

### Ship commands trên Mac
Ship skill (`.agent/skills/ship/`) hoạt động tương tự — chỉ khác:
- `/ship windows` → **KHÔNG chạy trên Mac** (chỉ build được .dmg, không .exe/.msi)
- `/ship apk` → Chạy bình thường
- macOS .dmg build → Chạy `npm run tauri build` trực tiếp
