# Mireru Firefox Add-on

Keyboard-friendly file explorer with vim-like navigation for Firefox.

## Features

- 🎯 **Vim-style Navigation**: Use `j/k` for up/down, `Enter` to open files/folders
- 🖼️ **Rich Preview**: Images, videos, text files with syntax highlighting, PDFs, and more
- 🔍 **Quick Search**: Press `/` to search files instantly
- 📊 **CSV Support**: Spreadsheet-style table view for CSV files
- 🎨 **Modern UI**: GitHub-inspired clean design

## Installation

### Temporary Installation (for Development)

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" 
3. Click "Load Temporary Add-on..."
4. Navigate to the `src/firefox-addon` folder
5. Select the `manifest.json` file

### Permanent Installation

1. Package the add-on:
   ```bash
   cd src/firefox-addon
   zip -r mireru-firefox.zip * -x "*.md" -x ".*"
   ```

2. Submit to [AMO (addons.mozilla.org)](https://addons.mozilla.org/) for signing

## Development

### Prerequisites

- Firefox Developer Edition (recommended)
- web-ext tool: `npm install -g web-ext`

### Running in Development

```bash
cd src/firefox-addon
web-ext run
```

### Building

```bash
web-ext build
```

## Browser Compatibility

This add-on requires:
- Firefox 109.0 or later
- Support for File System Access API

## Differences from Chrome Extension

- Uses WebExtension Polyfill for API compatibility
- Supports both `chrome.*` and `browser.*` APIs
- Background scripts instead of service workers
- Firefox-specific manifest settings

## License

Same as the main Mireru project - see root LICENSE file.