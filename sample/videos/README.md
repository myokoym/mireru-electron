# Video Samples

This directory would contain sample videos for testing Mireru's video preview features.

## Note

Due to file size limitations, actual video files are not included in this demo.
For testing video functionality, you can:

1. Copy small MP4/WebM videos to this directory
2. Use sample videos from your system
3. Create test videos using:
   ```bash
   ffmpeg -f lavfi -i testsrc=duration=5:size=320x240:rate=30 -pix_fmt yuv420p test.mp4
   ```

## Expected Features

- HTML5 video player with controls
- Support for MP4, WebM, AVI, MOV formats
- File size optimization (no base64 encoding)
- Error handling for unsupported formats