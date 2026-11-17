@echo off
cd /d "%~dp0"
echo Open http://127.0.0.1:4173 in your browser.
start "" "http://127.0.0.1:4173"
python preview_server.py
pause
