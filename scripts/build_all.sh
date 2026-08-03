#!/usr/bin/env bash
set -euo pipefail
bash scripts/test.sh
if ! command -v godot >/dev/null 2>&1; then echo "Godot 4.6 is required for binary exports"; exit 2; fi
mkdir -p dist/windows dist/linux dist/android dist/macos dist/ios
godot --headless --path game --export-release "Windows Desktop" ../dist/windows/MARKOVMADE_RECODE.exe
godot --headless --path game --export-release "Linux" ../dist/linux/MARKOVMADE_RECODE.x86_64
godot --headless --path game --export-debug "Android" ../dist/android/MARKOVMADE_RECODE.apk
