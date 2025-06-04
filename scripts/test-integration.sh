#!/bin/bash
# 統合テスト（GUI含む）を実行

echo "Running integration tests..."
npx jest src/__tests__/App.test.tsx --verbose