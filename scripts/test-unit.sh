#!/bin/bash
# 単体テストのみを高速実行

echo "Running unit tests only..."
npx jest src/__tests__/argument-parser.test.ts --verbose