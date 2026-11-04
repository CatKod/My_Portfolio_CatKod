import fs from 'fs';
import path from 'path';

const inventory = fs.readFileSync('tools/_inventory.txt', 'utf8')
  .trim().split(/\r?\n/).map(s => s.trim()).filter(Boolean);

// Find all imports in each file
const importMap = new Map();

for (const file of inventory) {
  const content = fs.readFileSync(path.join('tools', file), 'utf8');
  const imports = [];
  // Match: import ... from './x.mjs' or export ... from './x.mjs' or import('./x.mjs')
  const re = /(?:import|export)\s+(?:[\w*\s{},]*from\s+)?['"](?:\.\/)([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    let target = m[1];
    if (!target.endsWith('.mjs')) target += '.mjs';
    imports.push(target);
  }
  const reDyn = /import\s*\(\s*['"](?:\.\/)([^'"]+)['"]\s*\)/g;
  while ((m = reDyn.exec(content)) !== null) {
    let target = m[1];
    if (!target.endsWith('.mjs')) target += '.mjs';
    imports.push(target);
  }
  importMap.set(file, [...new Set(imports)]);
}

// Pipeline candidates:
// buildSite.mjs, deployPages.mjs, and their invoked scripts
const pipeline = [
  'buildSite.mjs',
  'deployPages.mjs',
  'rebrand.mjs',
  'patchCredLink.mjs',
  'synciconmap.mjs',
  'patchCss.mjs',
  'renameChunks.mjs',
  'pruneChunks.mjs',
  'refcheck.mjs',
  'buildCv.mjs',
  'prepareDeploy.mjs',
  'syncPages.mjs',
  'syncLegacyChunks.mjs',
];

console.log('Pipeline files:', pipeline);

// Trace transitive imports
const keepLibrary = new Set();
const queue = [...pipeline];
const visited = new Set(pipeline);

while (queue.length > 0) {
  const curr = queue.shift();
  const imps = importMap.get(curr) || [];
  for (const imp of imps) {
    if (!pipeline.includes(imp)) {
      keepLibrary.add(imp);
      if (!visited.has(imp)) {
        visited.add(imp);
        queue.push(imp);
      }
    }
  }
}

console.log('\nTransitive library imports from KEEP_PIPELINE:');
console.log(Array.from(keepLibrary).sort());

// Check each library file's imports
for (const lib of keepLibrary) {
  console.log(`  ${lib} imports:`, importMap.get(lib));
}
