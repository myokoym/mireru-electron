// PDF Preview Interactive Test Script
// This script automatically tests PDF preview functionality

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Mireru PDF Preview Interactive Test');
console.log('=====================================\n');

// Test configuration
const PDF_PATH = path.join(__dirname, 'sample/pdf/sample-document.pdf');
const TIMEOUT = 60000; // 1 minute timeout

// Check if PDF exists
if (!fs.existsSync(PDF_PATH)) {
  console.error('❌ PDF sample file not found:', PDF_PATH);
  process.exit(1);
}
console.log('✅ PDF sample file found:', PDF_PATH);

// Function to run command and capture output
function runCommand(command, args = [], env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: { ...process.env, ...env },
      shell: true
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write(data);
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
      process.stderr.write(data);
    });
    
    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
    
    child.on('error', reject);
    
    // Set timeout
    setTimeout(() => {
      child.kill();
      reject(new Error('Command timed out'));
    }, TIMEOUT);
  });
}

// Main test function
async function runTests() {
  console.log('\n1️⃣ Cleaning up existing processes...');
  await runCommand('pkill', ['-f', 'electron|webpack|mireru']);
  
  console.log('\n2️⃣ Starting Mireru with PDF directory...');
  const env = { MIRERU_DEV_PATH: './sample/pdf' };
  
  // Start in background
  const npmProcess = spawn('npm', ['start'], {
    env: { ...process.env, ...env },
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  console.log(`   Started with PID: ${npmProcess.pid}`);
  
  // Collect logs
  const logs = [];
  npmProcess.stdout.on('data', (data) => {
    const text = data.toString();
    logs.push(text);
    
    // Check for important messages
    if (text.includes('Using development environment variable')) {
      console.log('   ✅ PDF directory loaded');
    }
    if (text.includes('webpack compiled successfully')) {
      console.log('   ✅ Webpack compiled successfully');
    }
  });
  
  npmProcess.stderr.on('data', (data) => {
    logs.push(data.toString());
  });
  
  // Wait for app to start
  console.log('\n3️⃣ Waiting for app to start (30 seconds)...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  console.log('\n4️⃣ Test Results:');
  
  // Check if PDF environment was loaded
  const pdfLoaded = logs.some(log => 
    log.includes('Using development environment variable: ./sample/pdf')
  );
  console.log(`   PDF Directory: ${pdfLoaded ? '✅ Loaded' : '❌ Not loaded'}`);
  
  // Check for compilation errors
  const hasErrors = logs.some(log => 
    log.includes('ERROR in') || log.includes('Module parse failed')
  );
  console.log(`   Compilation: ${hasErrors ? '❌ Has errors' : '✅ No errors'}`);
  
  // Save logs
  fs.writeFileSync('test-results.log', logs.join('\n'));
  console.log('\n📋 Full logs saved to: test-results.log');
  
  console.log('\n📌 Manual verification steps:');
  console.log('   1. Check Electron window');
  console.log('   2. Click on "sample-document.pdf"');
  console.log('   3. Verify PDF preview appears');
  console.log('   4. Test zoom controls (+/-)');
  console.log('   5. Test page navigation (if multi-page)');
  
  console.log('\n🛑 To stop: pkill -f "electron|webpack|mireru"');
  
  // Keep script running
  console.log('\nPress Ctrl+C to exit...');
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
});