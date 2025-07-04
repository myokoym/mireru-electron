#!/bin/bash

# PDFプレビュー機能の自動テストスクリプト

echo "🔍 Mireru PDF Preview Test Script"
echo "================================"

# 1. プロセスの確認とクリーンアップ
echo "1️⃣ Cleaning up existing processes..."
pkill -f "electron|webpack|mireru" || true
sleep 2

# 2. 環境変数でPDFディレクトリを指定して起動
echo "2️⃣ Starting Mireru with PDF sample directory..."
export MIRERU_DEV_PATH=./sample/pdf

# バックグラウンドで起動
npm start > mireru.log 2>&1 &
NPM_PID=$!

echo "   Waiting for app to start (30 seconds)..."
sleep 30

# 3. プロセス確認
echo "3️⃣ Checking if Mireru is running..."
if ps -p $NPM_PID > /dev/null; then
    echo "   ✅ Mireru is running (PID: $NPM_PID)"
else
    echo "   ❌ Mireru failed to start"
    echo "   Last 20 lines of log:"
    tail -20 mireru.log
    exit 1
fi

# 4. ログ確認
echo "4️⃣ Checking logs for PDF environment..."
if grep -q "Using development environment variable: ./sample/pdf" mireru.log; then
    echo "   ✅ PDF directory loaded correctly"
else
    echo "   ❌ PDF directory not loaded"
fi

# 5. エラーチェック
echo "5️⃣ Checking for errors..."
ERROR_COUNT=$(grep -c "ERROR" mireru.log | tail -10 || echo "0")
if [ "$ERROR_COUNT" -gt "5" ]; then
    echo "   ⚠️  Found $ERROR_COUNT errors (some are expected in dev)"
fi

# 6. アクセス可能性確認
echo "6️⃣ Checking if web server is accessible..."
if curl -s http://localhost:1212 > /dev/null; then
    echo "   ✅ Web server is running on port 1212"
else
    echo "   ❌ Web server is not accessible"
fi

echo ""
echo "📊 Test Summary:"
echo "   - App URL: http://localhost:1212"
echo "   - Log file: mireru.log"
echo "   - Process ID: $NPM_PID"
echo ""
echo "📌 Manual steps:"
echo "   1. Open Electron window"
echo "   2. Select 'sample-document.pdf' "
echo "   3. Check console for detailed debug messages:"
echo "      - Look for \"=== PDF Preview Debug Info ===\" "
echo "      - Check for \"📄 PDF load started\""
echo "      - Watch for \"✅ PDF loaded successfully\" or \"❌ PDF load error\""
echo "   4. Test zoom (+/-) and page navigation if PDF loads"
echo ""
echo "🛑 To stop: pkill -f 'electron|webpack|mireru'"
echo ""
echo "🔍 Debug checklist:"
echo "   - Check DevTools console for detailed error messages"
echo "   - Verify react-pdf worker URL accessibility"
echo "   - Confirm file path format in WSL2 environment"
echo "   - Look for security/CORS related errors"

# ログの最後の部分を表示
echo ""
echo "📋 Recent logs:"
tail -30 mireru.log | grep -E "(DEBUG|PDF|ERROR|WARN|✅|❌|📄|📊)" || echo "No PDF-related logs found"