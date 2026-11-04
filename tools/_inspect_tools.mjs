import fs from 'fs';
import path from 'path';

const inventory = fs.readFileSync('tools/_inventory.txt', 'utf8')
  .trim().split(/\r?\n/).map(s => s.trim()).filter(Boolean);

const checkVerifyFiles = inventory.filter(f => {
  const lower = f.toLowerCase();
  return lower.startsWith('check') ||
         lower.startsWith('verify') ||
         lower.includes('parity') ||
         lower.includes('liveverify') ||
         lower.includes('assetcheck') ||
         lower.endsWith('check.mjs') ||
         lower.endsWith('verify.mjs');
});

console.log('Files matching check* / verify* / parity* / liveverify / *check / *verify:');
console.log(checkVerifyFiles);

// Print their line count and description
for (const f of checkVerifyFiles) {
  const content = fs.readFileSync(path.join('tools', f), 'utf8');
  const lines = content.split('\n').length;
  let desc = '';
  const m = content.match(/\/\*\*?([\s\S]*?)\*\//) || content.match(/\/\/(.*)/);
  if (m) desc = m[1].replace(/\r?\n/g, ' ').replace(/\*/g, '').trim().slice(0, 100);
  console.log(`- ${f.padEnd(25)} [${lines} lines] ${desc}`);
}
