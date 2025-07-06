// Chrome Extension initialization script
// HTML内のinlineスクリプトをCSP準拠で外部化

// Hide loading screen
function hideLoading() {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.display = 'none';
  }
}

// Show welcome message
function showWelcomeMessage() {
  const message = document.getElementById('welcome-message');
  if (message && !localStorage.getItem('mireru-welcome-dismissed')) {
    message.style.display = 'block';
    // Auto hide after 8 seconds
    setTimeout(() => {
      message.style.display = 'none';
      localStorage.setItem('mireru-welcome-dismissed', 'true');
    }, 8000);
  }
}

// Check browser compatibility
function checkCompatibility() {
  if (!('showDirectoryPicker' in window)) {
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="max-width: 600px; margin: 50px auto; padding: 40px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
          <h1 style="color: #d73027; margin-bottom: 20px;">🚫 Browser Not Supported</h1>
          <p>Mireru requires the <strong>File System Access API</strong> which is currently only supported in:</p>
          <ul style="text-align: left; max-width: 300px; margin: 20px auto;">
            <li>Google Chrome 86+</li>
            <li>Microsoft Edge 86+</li>
            <li>Brave Browser (experimental)</li>
          </ul>
          <p>Please use one of these browsers for full functionality.</p>
        </div>
      `;
    }
    hideLoading();
    return false;
  }
  return true;
}

// Initialize application
function initializeExtension() {
  // Welcome message close button
  const welcomeMessage = document.getElementById('welcome-message');
  if (welcomeMessage) {
    const closeBtn = welcomeMessage.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        welcomeMessage.style.display = 'none';
        localStorage.setItem('mireru-welcome-dismissed', 'true');
      });
    }
  }

  // Check compatibility and initialize
  if (checkCompatibility()) {
    // Load filesystem API first
    const script = document.createElement('script');
    script.src = 'filesystem-api.js';
    script.onload = () => {
      console.log('filesystem-api.js loaded successfully');
      // Then load main app
      const appScript = document.createElement('script');
      appScript.src = 'app.js';
      appScript.onload = () => {
        console.log('app.js loaded successfully');
      };
      appScript.onerror = (error) => {
        console.error('Failed to load app.js:', error);
        hideLoading();
      };
      document.head.appendChild(appScript);
    };
    script.onerror = (error) => {
      console.error('Failed to load filesystem-api.js:', error);
      hideLoading();
    };
    document.head.appendChild(script);
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}