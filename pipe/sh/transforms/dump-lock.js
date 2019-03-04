const { read, write } = require('../utils/fsutil');
const fs = require('fs');
const path = require('path');
const hash = require('object-hash');

const TYPES_PATH = path.join(__dirname, '../build/lib/sh.types.json');
const LOCK_PATH = path.join(__dirname, '../types.lock');

// Only interested in function types
const functions = JSON.parse(read('', TYPES_PATH)).funcs;
const lockHash = hash(functions, {
  algorithm: 'sha1',
  unorderedArrays: true,
  unorderedObjects: true,
  excludeKeys(key) {
    return key === 'doc';
  }
});

if (fs.existsSync(LOCK_PATH)) {
  const prevLockHash = read('', LOCK_PATH);
  if (prevLockHash.trim() !== lockHash) {
    throw Error('Lock hash has changed');
  }
}

write('', LOCK_PATH, lockHash);
