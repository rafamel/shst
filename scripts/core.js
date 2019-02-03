const fs = require('fs');
const path = require('path');

const CORE_DIR = path.join(__dirname, '../src/core');

function write(dest, str) {
  return fs.writeFileSync(path.join(CORE_DIR, dest), str);
}

// Provide any types for core/sh
// write('sh/index.d.ts', 'declare const sh: any;\nexport default sh;');
