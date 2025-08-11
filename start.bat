@echo off
echo 🧬 Starting SongDNA Search...
echo.

echo 📡 Starting Python backend...
start /B python python/app.py

echo ⏳ Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo 🖥️ Starting Electron frontend...
npm start

echo.
echo 🛑 Shutting down...
taskkill /F /IM python.exe /T >nul 2>&1
pause

