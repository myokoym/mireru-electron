#!/usr/bin/env python3
"""
Python Demo for Mireru
Demonstrates syntax highlighting for Python code
"""

import os
import json
from datetime import datetime
from typing import List, Dict, Optional


class FileManager:
    """A simple file manager class for demonstration."""
    
    def __init__(self, base_path: str = "."):
        self.base_path = os.path.abspath(base_path)
        self.file_cache: Dict[str, dict] = {}
        
    def list_files(self, path: Optional[str] = None) -> List[Dict[str, any]]:
        """List all files in the given directory."""
        target_path = path or self.base_path
        files = []
        
        try:
            for item in os.listdir(target_path):
                item_path = os.path.join(target_path, item)
                stat = os.stat(item_path)
                
                files.append({
                    'name': item,
                    'path': item_path,
                    'size': stat.st_size,
                    'modified': datetime.fromtimestamp(stat.st_mtime),
                    'is_directory': os.path.isdir(item_path)
                })
        except PermissionError as e:
            print(f"Permission denied: {e}")
            
        return sorted(files, key=lambda x: (not x['is_directory'], x['name']))
    
    def read_file(self, file_path: str, encoding: str = 'utf-8') -> str:
        """Read and return file content."""
        if file_path in self.file_cache:
            return self.file_cache[file_path]['content']
            
        try:
            with open(file_path, 'r', encoding=encoding) as f:
                content = f.read()
                self.file_cache[file_path] = {
                    'content': content,
                    'cached_at': datetime.now()
                }
                return content
        except Exception as e:
            return f"Error reading file: {str(e)}"
    
    def get_file_info(self, file_path: str) -> dict:
        """Get detailed information about a file."""
        try:
            stat = os.stat(file_path)
            return {
                'path': file_path,
                'name': os.path.basename(file_path),
                'size': self._format_size(stat.st_size),
                'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                'extension': os.path.splitext(file_path)[1],
                'permissions': oct(stat.st_mode)[-3:]
            }
        except OSError as e:
            return {'error': str(e)}
    
    @staticmethod
    def _format_size(size: int) -> str:
        """Format file size in human-readable format."""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"


# Example usage
if __name__ == "__main__":
    # Create file manager instance
    fm = FileManager()
    
    # List files in current directory
    print("Files in current directory:")
    for file in fm.list_files()[:5]:  # Show first 5 files
        print(f"  {'📁' if file['is_directory'] else '📄'} {file['name']:<30} {file['size']:>10} bytes")
    
    # Read this file
    this_file = __file__
    print(f"\nReading {this_file}...")
    content = fm.read_file(this_file)
    print(f"File has {len(content)} characters and {content.count('\\n')} lines")
    
    # Get file info
    info = fm.get_file_info(this_file)
    print(f"\nFile info: {json.dumps(info, indent=2)}")