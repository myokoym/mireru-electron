// 修正版 軽量シンタックスハイライター
// 正規表現の干渉を回避する安全な実装

class SyntaxHighlighter {
  constructor() {
    // 言語定義 - より安全なパターンに修正
    this.languages = {
      javascript: {
        patterns: [
          { type: 'comment', regex: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm },
          { type: 'string', regex: /(["'`])(?:(?=(\\?))\2.)*?\1/g },
          { type: 'keyword', regex: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|this|super|class|extends|export|import|default|async|await|yield|typeof|instanceof|in|of|delete|void|null|undefined|true|false)\b/g },
          { type: 'number', regex: /\b\d+(\.\d+)?\b/g },
          { type: 'function', regex: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g }
        ]
      },
      typescript: {
        patterns: [
          { type: 'comment', regex: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm },
          { type: 'string', regex: /(["'`])(?:(?=(\\?))\2.)*?\1/g },
          { type: 'keyword', regex: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|this|super|class|extends|export|import|default|async|await|yield|typeof|instanceof|in|of|delete|void|null|undefined|true|false|interface|type|enum|namespace|module|declare|abstract|private|protected|public|static|readonly|implements|any|boolean|number|string|object|never|unknown)\b/g },
          { type: 'number', regex: /\b\d+(\.\d+)?\b/g },
          { type: 'function', regex: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g }
        ]
      },
      python: {
        patterns: [
          { type: 'comment', regex: /(#.*$)/gm },
          { type: 'string', regex: /(["'])(?:(?=(\\?))\2.)*?\1|"""[\s\S]*?"""|'''[\s\S]*?'''/g },
          { type: 'keyword', regex: /\b(and|as|assert|break|class|continue|def|del|elif|else|except|False|finally|for|from|global|if|import|in|is|lambda|None|nonlocal|not|or|pass|raise|return|True|try|while|with|yield|async|await)\b/g },
          { type: 'number', regex: /\b\d+(\.\d+)?\b/g },
          { type: 'function', regex: /\b(def\s+)([a-zA-Z_][a-zA-Z0-9_]*)/g }
        ]
      },
      java: {
        patterns: [
          { type: 'comment', regex: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm },
          { type: 'string', regex: /(["'])(?:(?=(\\?))\2.)*?\1/g },
          { type: 'keyword', regex: /\b(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)\b/g },
          { type: 'number', regex: /\b\d+(\.\d+)?[fFlLdD]?\b/g }
        ]
      },
      html: {
        patterns: [
          { type: 'comment', regex: /<!--[\s\S]*?-->/g },
          { type: 'tag', regex: /<\/?[a-zA-Z][a-zA-Z0-9-]*(?:\s+[a-zA-Z][a-zA-Z0-9-]*(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s*\/?>/g },
          { type: 'string', regex: /(?:=\s*)(["'])(?:(?=(\\?))\2.)*?\1/g }
        ]
      },
      css: {
        patterns: [
          { type: 'comment', regex: /\/\*[\s\S]*?\*\//g },
          { type: 'selector', regex: /([.#]?[a-zA-Z][a-zA-Z0-9-_]*|\*|::[a-zA-Z-]+|:[a-zA-Z-]+)(?=\s*\{)/g },
          { type: 'attribute', regex: /([a-zA-Z-]+)(?=\s*:)/g },
          { type: 'string', regex: /(["'])(?:(?=(\\?))\2.)*?\1/g },
          { type: 'number', regex: /\b\d+(\.\d+)?(px|em|rem|%|vh|vw|pt|cm|mm|in|pc|ex|ch|deg|rad|turn|s|ms)?\b/g }
        ]
      },
      json: {
        patterns: [
          { type: 'string', regex: /"(?:[^"\\]|\\.)*"/g },
          { type: 'number', regex: /-?\b\d+(\.\d+)?([eE][+-]?\d+)?\b/g },
          { type: 'keyword', regex: /\b(true|false|null)\b/g },
          { type: 'punctuation', regex: /[{}[\],]/g }
        ]
      },
      markdown: {
        patterns: [
          { type: 'section', regex: /^#{1,6}\s+.+$/gm },
          { type: 'code', regex: /`[^`]+`|```[\s\S]*?```/g },
          { type: 'string', regex: /\*\*[^*]+\*\*|__[^_]+__|_[^_]+_|\*[^*]+\*/g },
          { type: 'function', regex: /\[([^\]]+)\]\(([^)]+)\)/g }
        ]
      }
    };
  }

  // ファイル拡張子から言語を判定
  detectLanguage(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const langMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'mjs': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'html': 'html',
      'htm': 'html',
      'css': 'css',
      'scss': 'css',
      'sass': 'css',
      'json': 'json',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'markdown': 'markdown'
    };
    return langMap[ext] || null;
  }

  // HTMLエスケープ
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 安全なシンタックスハイライト処理
  highlight(code, language) {
    if (!language || !this.languages[language]) {
      return this.escapeHtml(code);
    }

    // まずHTMLエスケープ
    let highlighted = this.escapeHtml(code);
    const patterns = this.languages[language].patterns;

    // マッチした部分の位置を記録
    const matches = [];
    
    // 全パターンのマッチを収集
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      let match;
      while ((match = regex.exec(highlighted)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          type: pattern.type,
          priority: this.getTypePriority(pattern.type)
        });
        // 無限ループ防止
        if (!pattern.regex.global) break;
      }
    });

    // 位置順にソートし、重複を除去
    matches.sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      return b.priority - a.priority; // 優先度の高いものを優先
    });

    // 重複するマッチを除去
    const filteredMatches = [];
    matches.forEach(match => {
      const hasOverlap = filteredMatches.some(existing => 
        (match.start < existing.end && match.end > existing.start)
      );
      if (!hasOverlap) {
        filteredMatches.push(match);
      }
    });

    // 後ろから前に向かって置換（インデックスがずれないように）
    filteredMatches.reverse().forEach(match => {
      const before = highlighted.substring(0, match.start);
      const after = highlighted.substring(match.end);
      const replacement = `<span class="hljs-${match.type}">${match.text}</span>`;
      highlighted = before + replacement + after;
    });

    return highlighted;
  }

  // タイプの優先度を定義
  getTypePriority(type) {
    const priorities = {
      'comment': 10,
      'string': 9,
      'keyword': 8,
      'function': 7,
      'number': 6,
      'tag': 5,
      'selector': 4,
      'attribute': 3,
      'section': 2,
      'punctuation': 1
    };
    return priorities[type] || 0;
  }

  // 行番号付きでハイライト
  highlightWithLineNumbers(code, language, startLine = 1) {
    const lines = code.split('\n');
    const highlightedLines = lines.map((line, index) => {
      const lineNumber = startLine + index;
      const highlightedLine = this.highlight(line, language);
      return `<tr><td class="hljs-line-number" data-line-number="${lineNumber}"></td><td class="hljs-line-code">${highlightedLine}</td></tr>`;
    });

    return `<table class="hljs-code-table"><tbody>${highlightedLines.join('')}</tbody></table>`;
  }
}

// グローバルに公開
window.SyntaxHighlighter = SyntaxHighlighter;