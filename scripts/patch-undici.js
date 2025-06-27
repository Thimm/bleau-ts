const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'node_modules', 'undici', 'lib', 'web', 'fetch', 'util.js');

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    // Don't fail if the file doesn't exist, it might not be installed yet.
    if (err.code === 'ENOENT') {
      console.log('undici fetch util not found, skipping patch.');
      return;
    }
    console.error('Error reading undici fetch util file:', err);
    return;
  }

  // Replace the problematic private-in syntax with a workaround
  const originalCode = 'if (typeof this !== "object" || this === null || !(#target in this)) {';
  const patchedCode = 'if (typeof this !== "object" || this === null || !this.target) {';
  
  if (data.includes(originalCode)) {
    const result = data.replace(originalCode, patchedCode);
    fs.writeFile(filePath, result, 'utf8', (err) => {
      if (err) {
        console.error('Error writing patched undici fetch util file:', err);
      } else {
        console.log('Successfully patched undici for build compatibility.');
      }
    });
  } else {
    console.log('undici patch already applied or not needed.');
  }
});
