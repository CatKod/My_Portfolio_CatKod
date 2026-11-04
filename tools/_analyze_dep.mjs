import fs from 'fs';
import path from 'path';

const inventory = fs.readFileSync('tools/_inventory.txt', 'utf8')
  .trim().split(/\r?\n/).map(s => s.trim()).filter(Boolean);

// For each file in inventory, find:
// 1. files it imports via import ... from './...' or dynamic import('./...')
// 2. files it executes or mentions
const importsMap = new Map();
const rawMentionsMap = new Map();

for (const f of inventory) {
  const content = fs.readFileSync(path.join('tools', f), 'utf8');
  
  // imports
  const imports = [];
  const impRe = /(?:import|export)\s+.*?from\s+['"](?:\.\/)?([a-zA-Z0-9_\-~]+\.mjs)['"]/g;
  let m;
  while ((m = impRe.exec(content)) !== null) {
    imports.push(m[1]);
  }
  const dynRe = /import\s*\(\s*['"](?:\.\/)?([a-zA-Z0-9_\-~]+\.mjs)['"]\s*\)/g;
  while ((m = dynRe.exec(content)) !== null) {
    imports.push(m[1]);
  }
  importsMap.set(f, [...new Set(imports)]);

  // any mention of *.mjs
  const mentions = [];
  const menRe = /['"`](?:\.\/|tools\/)?([a-zA-Z0-9_\-~]+\.mjs)['"`]/g;
  while ((m = menRe.exec(content)) !== null) {
    if (m[1] !== f && inventory.includes(m[1])) {
      mentions.push(m[1]);
    }
  }
  rawMentionsMap.set(f, [...new Set(mentions)]);
}

// 1. KEEP_PIPELINE: invoked by buildSite.mjs / deployPages.mjs / package.json scripts
// What does package.json have?
// "build": "node tools/buildSite.mjs"
// "serve": "java -jar build/libs/portfolio-kt.jar --port=9310 --root=site"
// "check": "node tools/parityCheck.mjs"
// "check:icons": "node tools/iconmapdiff.mjs"

console.log('--- Checking pipeline invoked files ---');
console.log('buildSite mentions:', rawMentionsMap.get('buildSite.mjs'));
console.log('deployPages mentions:', rawMentionsMap.get('deployPages.mjs'));
