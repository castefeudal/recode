@echo off
setlocal
cd /d "%~dp0web_app"
where node >nul 2>nul || (
  echo Install Node.js 22.16 or newer first.
  exit /b 1
)
if not exist node_modules (
  call npm ci --no-audit --no-fund || exit /b 1
)
call npm run dev
