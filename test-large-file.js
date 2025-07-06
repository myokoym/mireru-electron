// This is a test file to verify delayed syntax highlighting
// The file needs to be over 50KB or 1000 lines to trigger the feature

function generateLargeContent() {
  const lines = [];
  
  // Generate over 1000 lines of JavaScript code
  for (let i = 0; i < 1200; i++) {
    lines.push(`// Line ${i + 1}: This is a comment`);
    lines.push(`const variable${i} = {`);
    lines.push(`  id: ${i},`);
    lines.push(`  name: "Item ${i}",`);
    lines.push(`  description: "This is description for item ${i}",`);
    lines.push(`  active: ${i % 2 === 0 ? 'true' : 'false'},`);
    lines.push(`  timestamp: new Date().toISOString(),`);
    lines.push(`  data: [`);
    for (let j = 0; j < 10; j++) {
      lines.push(`    "${j}",`);
    }
    lines.push(`  ]`);
    lines.push(`};`);
    lines.push(``);
    
    lines.push(`function processItem${i}(item) {`);
    lines.push(`  if (!item) {`);
    lines.push(`    throw new Error("Item is required");`);
    lines.push(`  }`);
    lines.push(`  `);
    lines.push(`  return {`);
    lines.push(`    ...item,`);
    lines.push(`    processed: true,`);
    lines.push(`    processedAt: Date.now()`);
    lines.push(`  };`);
    lines.push(`}`);
    lines.push(``);
  }
  
  return lines.join('\n');
}

// Export for use
module.exports = { generateLargeContent };

// Generate the actual content
const content = generateLargeContent();
console.log(`Generated ${content.split('\n').length} lines of code`);
console.log(`Total size: ${content.length} characters`);