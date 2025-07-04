#!/bin/bash

# Mireru Electron バージョンアップスクリプト
# 使用方法: ./scripts/update-version.sh <new-version>

set -e

# 引数チェック
if [ $# -ne 1 ]; then
    echo "❌ エラー: バージョン番号を指定してください"
    echo "使用方法: $0 <new-version>"
    echo "例: $0 0.3.0"
    exit 1
fi

NEW_VERSION=$1

# バージョン形式チェック (x.y.z)
if ! [[ $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "❌ エラー: バージョン形式が正しくありません (例: 0.3.0)"
    exit 1
fi

echo "🔄 Mireru Electron バージョンアップ: v$NEW_VERSION"
echo "================================"

# 現在のバージョンを取得
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📌 現在のバージョン: v$CURRENT_VERSION"
echo "📌 新しいバージョン: v$NEW_VERSION"
echo ""

# 更新対象ファイル
FILES_TO_UPDATE=(
    "package.json"
    "release/app/package.json"
)

# 各ファイルのバージョンを更新
for file in "${FILES_TO_UPDATE[@]}"; do
    if [ -f "$file" ]; then
        echo "✏️  更新: $file"
        # macOS/Linux 両対応のsed
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$file"
        else
            # Linux/WSL
            sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$file"
        fi
    else
        echo "⚠️  警告: $file が見つかりません"
    fi
done

# package-lock.json の更新
if [ -f "package-lock.json" ]; then
    echo "✏️  更新: package-lock.json"
    npm install --package-lock-only > /dev/null 2>&1
fi

echo ""
echo "✅ バージョン更新完了!"
echo ""
echo "📋 次のステップ:"
echo "1. CHANGELOG.md を更新"
echo "2. 変更をコミット:"
echo "   git add -A"
echo "   git commit -m \"Release v$NEW_VERSION - [機能説明]\""
echo "3. タグを作成:"
echo "   git tag v$NEW_VERSION"
echo "4. プッシュ:"
echo "   git push origin main"
echo "   git push origin v$NEW_VERSION"
echo ""

# 更新されたバージョンを表示
echo "📦 更新されたファイル:"
for file in "${FILES_TO_UPDATE[@]}"; do
    if [ -f "$file" ]; then
        VERSION=$(node -p "require('./$file').version" 2>/dev/null || echo "読み取り失敗")
        echo "   $file: v$VERSION"
    fi
done