@echo off
setlocal
if "%~1"=="" (
  echo Usage: upload-to-github.bat https://github.com/USERNAME/REPOSITORY.git
  exit /b 64
)
where git >nul 2>nul || (
  echo Install Git first.
  exit /b 1
)
if not exist .git git init
git branch -M main
git add .
git diff --cached --quiet || git commit -m "Initial MARKOVMADE RECODE import"
git remote get-url origin >nul 2>nul
if errorlevel 1 (git remote add origin %~1) else (git remote set-url origin %~1)
git push -u origin main
