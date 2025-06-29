# Sample Files for Mireru Demo

This directory contains sample files for testing and demonstrating Mireru's features.

## Directory Structure

```
sample/
├── README.md          # This file
├── text/             # Plain text and markdown files
├── code/             # Programming language files  
├── images/           # Image files (various formats)
├── videos/           # Video files
├── data/             # Data files (JSON, YAML, XML)
├── binary/           # Binary files for hex viewer
└── large-files/      # Large files for performance testing
```

## File Categories

### Text Files (`text/`)
- Plain text files (.txt)
- Markdown files (.md)
- Log files (.log)

### Code Files (`code/`)
- JavaScript (.js)
- TypeScript (.ts)
- Python (.py)
- Ruby (.rb)
- Java (.java)
- C/C++ (.c, .cpp, .h)
- Shell scripts (.sh)
- CSS (.css)
- HTML (.html)

### Image Files (`images/`)
- PNG images
- JPEG images
- GIF animations
- SVG graphics
- WebP images

### Video Files (`videos/`)
- MP4 videos
- WebM videos

### Data Files (`data/`)
- JSON files
- YAML configuration
- XML documents

### Binary Files (`binary/`)
- Executable samples
- Compressed files
- Binary data

### Large Files (`large-files/`)
- Large text files (>1MB)
- Files to test performance optimizations

## Usage

Start Mireru with the sample directory:

```bash
# Development
npm start sample/

# Production (AppImage)
./release/build/Mireru-*.AppImage sample/
```

Navigate through the directories to test different file types and features!