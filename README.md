# Mireru Electron - File Explorer

A keyboard-friendly file explorer with VS Code-like UI, built with Electron and React.

## Concept

- **気軽に使えるexplorer**: Intuitive and efficient file management with vim-style keybindings
- **VS Code-like detailed view**: Developer-friendly UI/UX with rich file information and metadata

## Features

- 📁 **Multi-file support**: Text, images, videos, PDFs, and binary files
- ⌨️ **Vim-style navigation**: Fast keyboard controls (n/p, hjkl, /, etc.)
- 🔍 **Instant search**: Real-time file filtering with search-focused UI
- 📋 **Rich previews**: Syntax highlighting, image zoom, video playback
- 🏠 **Smart navigation**: Command-line arguments, home button to startup directory
- 📊 **File details**: Size, modification dates, and metadata display

## Development

### WSL2 Development (Windows)

For Windows users developing in WSL2, you'll need to install Electron with Windows platform support:

```bash
# Install Electron for Windows platform
npm install --save-dev electron --platform=win32

# Start development server for Windows
npm run start:win32
```

### Standard Development

```bash
# Install dependencies
npm install

# Start development server
npm start
```

## Building

### Windows Build (from WSL2)

```bash
# Build Windows installer and portable
npm run build:win32

# Build Windows portable only
npm run package:win32
```

### Standard Build

```bash
# Build for current platform
npm run build
```

## Keyboard Shortcuts

### Navigation
- `n/p` or `↑/↓` - Navigate next/previous file
- `G` - Go to last item
- `Ctrl+g` - Go to first item
- `Enter/e` - Open folder or preview file
- `Space` - Preview file only
- `Backspace` - Go up one level
- `Home` - Go to startup directory

### Search
- `/` - Focus search box
- `Escape` - Exit search (keep text)
- `Shift+Escape` - Clear search

### Preview & File Operations
- `+/-` - Zoom in/out (images)
- `Ctrl++/-` - Text size up/down
- `Ctrl+0` - Reset text size
- `f` - Fit to window
- `o` - Original size
- `hjkl` - Scroll preview (vim-style)
- `HJKL` - Scroll preview (large steps)
- `r` - Reload current file
- `i/F1` - Toggle metadata sidebar
- `Ctrl+Shift+C` - Copy file path

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/myokoym/mireru-electron.git
cd mireru-electron
npm install
```

## License

MIT © [Mireru Project](https://github.com/myokoym/mireru-electron)
