@echo off

echo ========================================
echo  JELLO Installation
echo ========================================

node --version >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is NOT installed!
  echo Please download from https://nodejs.org/
  start https://nodejs.org/
  pause
  exit /b 1
)

echo Node.js detected.
echo Installing dependencies...
npm install

if errorlevel 1 (
  echo ERROR: npm install failed!
  pause
  exit /b 1
)

npm list electron-builder >nul 2>&1
if errorlevel 1 (
  echo Installing electron-builder...
  npm install --save-dev electron-builder
)

echo ========================================
echo  JELLO Installation Complete!
echo ========================================
echo.
echo To run: RUN.bat
echo To build installer: BUILD-INSTALLER.bat
pause
