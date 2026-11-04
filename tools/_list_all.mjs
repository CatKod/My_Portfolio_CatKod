import fs from 'fs';
import path from 'path';

const inventory = fs.readFileSync('tools/_inventory.txt', 'utf8')
  .trim().split(/\r?\n/).map(s => s.trim()).filter(Boolean);

console.log('Total files:', inventory.length);

// Let's print all 373 files
console.log(JSON.stringify(inventory, null, 2));
