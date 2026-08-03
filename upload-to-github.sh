#!/usr/bin/env bash
set -euo pipefail
if [[ $# -ne 1 ]]; then
  echo "Usage: ./upload-to-github.sh https://github.com/USERNAME/REPOSITORY.git" >&2
  exit 64
fi
command -v git >/dev/null || { echo "Install Git first." >&2; exit 1; }
if [[ ! -d .git ]]; then git init; fi
git branch -M main
git add .
if ! git diff --cached --quiet; then git commit -m "Initial MARKOVMADE RECODE import"; fi
if git remote get-url origin >/dev/null 2>&1; then git remote set-url origin "$1"; else git remote add origin "$1"; fi
git push -u origin main
