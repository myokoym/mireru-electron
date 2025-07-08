// 日本語文字コード検出・変換ライブラリ
// Shift_JIS、EUC-JP、ISO-2022-JP、UTF-8の検出と変換

class EncodingDetector {
  constructor() {
    // 文字コード検出の優先順位
    this.encodings = ['UTF-8', 'Shift_JIS', 'EUC-JP', 'ISO-2022-JP'];
  }

  // バイト配列から文字コードを検出
  detectEncoding(bytes) {
    // 1. UTF-8 BOM チェック
    if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
      return 'UTF-8';
    }

    // 2. ISO-2022-JP エスケープシーケンス検出
    if (this.hasISO2022JPSequence(bytes)) {
      return 'ISO-2022-JP';
    }

    // 3. UTF-8 有効性チェック
    if (this.isValidUTF8(bytes)) {
      return 'UTF-8';
    }

    // 4. Shift_JIS と EUC-JP の判定
    const shiftJISScore = this.calculateShiftJISScore(bytes);
    const eucJPScore = this.calculateEUCJPScore(bytes);

    if (shiftJISScore > eucJPScore && shiftJISScore > 0.5) {
      return 'Shift_JIS';
    } else if (eucJPScore > 0.5) {
      return 'EUC-JP';
    }

    // 5. デフォルト
    return 'UTF-8';
  }

  // ISO-2022-JP エスケープシーケンスの検出
  hasISO2022JPSequence(bytes) {
    const sequences = [
      [0x1B, 0x24, 0x42], // ESC $ B (JIS X 0208)
      [0x1B, 0x24, 0x40], // ESC $ @ (JIS X 0208-1978)
      [0x1B, 0x28, 0x42], // ESC ( B (ASCII)
      [0x1B, 0x28, 0x4A], // ESC ( J (JIS X 0201 Roman)
      [0x1B, 0x28, 0x49]  // ESC ( I (JIS X 0201 Katakana)
    ];

    for (let i = 0; i < bytes.length - 2; i++) {
      for (const seq of sequences) {
        if (seq.every((byte, index) => bytes[i + index] === byte)) {
          return true;
        }
      }
    }
    return false;
  }

  // UTF-8 有効性チェック
  isValidUTF8(bytes) {
    let i = 0;
    while (i < bytes.length) {
      const byte = bytes[i];
      
      if (byte < 0x80) {
        // ASCII
        i++;
      } else if ((byte & 0xE0) === 0xC0) {
        // 2バイト文字
        if (i + 1 >= bytes.length || (bytes[i + 1] & 0xC0) !== 0x80) {
          return false;
        }
        i += 2;
      } else if ((byte & 0xF0) === 0xE0) {
        // 3バイト文字
        if (i + 2 >= bytes.length || 
            (bytes[i + 1] & 0xC0) !== 0x80 || 
            (bytes[i + 2] & 0xC0) !== 0x80) {
          return false;
        }
        i += 3;
      } else if ((byte & 0xF8) === 0xF0) {
        // 4バイト文字
        if (i + 3 >= bytes.length || 
            (bytes[i + 1] & 0xC0) !== 0x80 || 
            (bytes[i + 2] & 0xC0) !== 0x80 || 
            (bytes[i + 3] & 0xC0) !== 0x80) {
          return false;
        }
        i += 4;
      } else {
        return false;
      }
    }
    return true;
  }

  // Shift_JIS スコア計算
  calculateShiftJISScore(bytes) {
    let score = 0;
    let total = 0;
    
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      total++;
      
      if (byte >= 0x81 && byte <= 0x9F) {
        // 第1バイト範囲1
        if (i + 1 < bytes.length) {
          const next = bytes[i + 1];
          if ((next >= 0x40 && next <= 0x7E) || (next >= 0x80 && next <= 0xFC)) {
            score += 2;
            i++; // 次のバイトをスキップ
          }
        }
      } else if (byte >= 0xE0 && byte <= 0xEF) {
        // 第1バイト範囲2
        if (i + 1 < bytes.length) {
          const next = bytes[i + 1];
          if ((next >= 0x40 && next <= 0x7E) || (next >= 0x80 && next <= 0xFC)) {
            score += 2;
            i++; // 次のバイトをスキップ
          }
        }
      } else if (byte >= 0xA1 && byte <= 0xDF) {
        // 半角カナ
        score += 1;
      } else if (byte < 0x80) {
        // ASCII
        score += 0.5;
      }
    }
    
    return total > 0 ? score / total : 0;
  }

  // EUC-JP スコア計算
  calculateEUCJPScore(bytes) {
    let score = 0;
    let total = 0;
    
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      total++;
      
      if (byte >= 0xA1 && byte <= 0xFE) {
        // 第1バイト
        if (i + 1 < bytes.length) {
          const next = bytes[i + 1];
          if (next >= 0xA1 && next <= 0xFE) {
            score += 2;
            i++; // 次のバイトをスキップ
          }
        }
      } else if (byte === 0x8E) {
        // 半角カナ
        if (i + 1 < bytes.length) {
          const next = bytes[i + 1];
          if (next >= 0xA1 && next <= 0xDF) {
            score += 2;
            i++; // 次のバイトをスキップ
          }
        }
      } else if (byte === 0x8F) {
        // 3バイト文字
        if (i + 2 < bytes.length) {
          const next1 = bytes[i + 1];
          const next2 = bytes[i + 2];
          if (next1 >= 0xA1 && next1 <= 0xFE && next2 >= 0xA1 && next2 <= 0xFE) {
            score += 3;
            i += 2; // 次の2バイトをスキップ
          }
        }
      } else if (byte < 0x80) {
        // ASCII
        score += 0.5;
      }
    }
    
    return total > 0 ? score / total : 0;
  }

  // バイト配列をTextDecoderでデコード
  decodeBytes(bytes, encoding) {
    try {
      // TextDecoder でサポートされている文字コード名に変換
      const encodingMap = {
        'UTF-8': 'utf-8',
        'Shift_JIS': 'shift_jis',
        'EUC-JP': 'euc-jp',
        'ISO-2022-JP': 'iso-2022-jp'
      };

      const normalizedEncoding = encodingMap[encoding] || 'utf-8';
      const decoder = new TextDecoder(normalizedEncoding, { fatal: false });
      return decoder.decode(bytes);
    } catch (error) {
      console.warn(`Failed to decode with ${encoding}, falling back to UTF-8:`, error);
      // フォールバック: UTF-8で強制デコード
      const decoder = new TextDecoder('utf-8', { fatal: false });
      return decoder.decode(bytes);
    }
  }

  // ファイルから文字コードを検出してテキストを取得
  async decodeFileContent(file) {
    // ファイルの最初の数KB をサンプルとして読み取り
    const sampleSize = Math.min(8192, file.size);
    const sampleBuffer = await file.slice(0, sampleSize).arrayBuffer();
    const sampleBytes = new Uint8Array(sampleBuffer);
    
    // 文字コードを検出
    const detectedEncoding = this.detectEncoding(sampleBytes);
    
    // ファイル全体を読み取り
    const fullBuffer = await file.arrayBuffer();
    const fullBytes = new Uint8Array(fullBuffer);
    
    // デコード
    const decodedText = this.decodeBytes(fullBytes, detectedEncoding);
    
    return {
      text: decodedText,
      encoding: detectedEncoding,
      confidence: this.getConfidence(detectedEncoding, sampleBytes)
    };
  }

  // 検出信頼度を取得
  getConfidence(encoding, bytes) {
    switch (encoding) {
      case 'UTF-8':
        return this.isValidUTF8(bytes) ? 0.9 : 0.1;
      case 'ISO-2022-JP':
        return this.hasISO2022JPSequence(bytes) ? 0.95 : 0.0;
      case 'Shift_JIS':
        return this.calculateShiftJISScore(bytes);
      case 'EUC-JP':
        return this.calculateEUCJPScore(bytes);
      default:
        return 0.5;
    }
  }
}

// グローバルに公開
window.EncodingDetector = EncodingDetector;