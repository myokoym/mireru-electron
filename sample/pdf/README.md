# PDF Samples

This directory is for testing PDF file preview functionality.

## Creating Sample PDF

Due to PDF generation tool limitations in WSL, you can create a sample PDF manually:

### Option 1: Browser Print to PDF
1. Open `sample.html` in a browser
2. Print → Save as PDF → `sample-document.pdf`

### Option 2: Copy existing PDF
```bash
cp /path/to/any.pdf ./sample-document.pdf
```

### Option 3: Online PDF converter
1. Upload `sample.html` to online HTML-to-PDF converter
2. Download as `sample-document.pdf`

## Expected Behavior

- Display "PDF Preview Placeholder" message
- Show file metadata in sidebar  
- Recommend external viewer for full functionality
- File type detection as "PDF Document"