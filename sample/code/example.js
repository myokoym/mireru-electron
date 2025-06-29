// JavaScript Example for Mireru Demo
// This file demonstrates syntax highlighting for JavaScript

class FileExplorer {
    constructor(name) {
        this.name = name;
        this.files = [];
        this.currentIndex = 0;
    }

    addFile(file) {
        this.files.push(file);
        console.log(`Added file: ${file.name}`);
    }

    navigate(direction) {
        if (direction === 'next') {
            this.currentIndex = Math.min(this.currentIndex + 1, this.files.length - 1);
        } else if (direction === 'prev') {
            this.currentIndex = Math.max(this.currentIndex - 1, 0);
        }
        return this.getCurrentFile();
    }

    getCurrentFile() {
        return this.files[this.currentIndex] || null;
    }

    async previewFile(file) {
        try {
            const content = await this.readFile(file.path);
            return {
                type: this.getFileType(file),
                content: content,
                size: file.size
            };
        } catch (error) {
            console.error('Failed to preview file:', error);
            return null;
        }
    }

    getFileType(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        const typeMap = {
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'rb': 'ruby',
            'java': 'java'
        };
        return typeMap[ext] || 'text';
    }

    async readFile(path) {
        // Simulated file reading
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(`Content of ${path}`);
            }, 100);
        });
    }
}

// Example usage
const explorer = new FileExplorer('Mireru');

// Add some files
explorer.addFile({ name: 'index.js', path: '/src/index.js', size: 1024 });
explorer.addFile({ name: 'styles.css', path: '/src/styles.css', size: 512 });
explorer.addFile({ name: 'README.md', path: '/README.md', size: 2048 });

// Navigate and preview
const currentFile = explorer.navigate('next');
if (currentFile) {
    explorer.previewFile(currentFile).then(preview => {
        console.log('Preview:', preview);
    });
}

// Export for use in other modules
export default FileExplorer;