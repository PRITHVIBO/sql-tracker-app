@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "QueryQuest Server" /min cmd /c "py -m http.server 8000"
  timeout /t 2 >nul
  start "" "http://localhost:8000"
  echo QueryQuest is running at http://localhost:8000
  echo Close the separate server window to stop it.
) else (
  start "" "%~dp0index.html"
  echo Opened QueryQuest directly in your browser.
)
endlocal
