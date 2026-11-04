import fs from 'fs';
import path from 'path';

const inventory = fs.readFileSync('tools/_inventory.txt', 'utf8')
  .trim().split(/\r?\n/).map(s => s.trim()).filter(Boolean);

// Let's inspect the files
const fileInfo = inventory.map(file => {
  const p = path.join('tools', file);
  const content = fs.readFileSync(p, 'utf8');
  const lines = content.split('\n');
  const size = fs.statSync(p).size;
  // Get first comment or docstring
  let desc = '';
  const commentMatch = content.match(/\/\*\*?([\s\S]*?)\*\//) || content.match(/\/\/(.*)/);
  if (commentMatch) {
    desc = commentMatch[1].replace(/\r?\n/g, ' ').replace(/\*/g, '').trim().slice(0, 100);
  }
  return { file, lines: lines.length, size, desc };
});

// Group by name prefix or pattern
console.log('Sample file descriptions:');
fileInfo.slice(0, 30).forEach(f => console.log(`${f.file.padEnd(25)} [${f.lines} lines] ${f.desc}`));
