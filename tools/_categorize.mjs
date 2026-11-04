import fs from 'fs';
import path from 'path';

const inventory = fs.readFileSync('tools/_inventory.txt', 'utf8')
  .trim().split(/\r?\n/).map(s => s.trim()).filter(Boolean);

// Let's inspect all files, their contents, imports, size, etc.
const records = inventory.map(file => {
  const p = path.join('tools', file);
  const content = fs.readFileSync(p, 'utf8');
  const lines = content.split('\n');
  const lineCount = lines.length;
  const size = content.length;
  
  // comment
  let comment = '';
  const m = content.match(/\/\*\*?([\s\S]*?)\*\//) || content.match(/\/\/(.*)/);
  if (m) comment = m[1].replace(/\r?\n/g, ' ').replace(/\*/g, '').trim().slice(0, 100);

  return { file, lineCount, size, comment, content };
});

// Let's find files that are very short (e.g. <= 15 lines) or obvious scratch/dumps
const veryShort = records.filter(r => r.lineCount <= 15);
console.log('Very short files (<= 15 lines):', veryShort.length);

// Let's see some samples of very short files
console.log('Sample very short files:');
veryShort.slice(0, 20).forEach(r => {
  console.log(`${r.file.padEnd(20)} [${r.lineCount}L] ${r.comment}`);
});
