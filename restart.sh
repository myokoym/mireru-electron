#!/bin/bash
set -e  # エラーで終了

# Mireru Electron 再起動スクリプト

echo "Stopping existing Electron processes..."
pkill -f electron || true

echo "Waiting for processes to stop..."
sleep 2

echo "Starting Mireru Electron..."
npm start &

echo "Mireru Electron started in background"