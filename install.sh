#!/bin/bash

echo "========================================"
echo "  JELLO Installation"
echo "========================================"

if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js not installed!"
  echo "Download from https://nodejs.org/"
  open https://nodejs.org/
  exit 1
fi

echo "Node.js: $(node --version)"
echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
  echo "ERROR: npm install failed!"
  exit 1
fi

if ! npm list electron-builder > /dev/null 2>&1; then
  echo "Installing electron-builder..."
  npm install --save-dev electron-builder
fi

echo "========================================"
echo "  JELLO Installation Complete!"
echo "========================================"
echo ""
echo "To run: ./run.sh"
echo "To build installer: ./build-installer.sh"
