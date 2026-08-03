$ErrorActionPreference='Stop'
powershell -ExecutionPolicy Bypass -File scripts/test.ps1
if (-not (Get-Command godot -ErrorAction SilentlyContinue)) { throw 'Godot 4.6 is required' }
godot --headless --path game --export-release 'Windows Desktop' ../dist/windows/MARKOVMADE_RECODE.exe
