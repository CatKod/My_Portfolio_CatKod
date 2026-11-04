import fs from 'fs';
import path from 'path';

const inventory = fs.readFileSync('tools/_inventory.txt', 'utf8')
  .trim().split(/\r?\n/).map(s => s.trim()).filter(Boolean);

const pipeline = new Set([
  'buildSite.mjs', 'deployPages.mjs', 'rebrand.mjs', 'patchCredLink.mjs',
  'synciconmap.mjs', 'patchCss.mjs', 'renameChunks.mjs', 'pruneChunks.mjs',
  'refcheck.mjs', 'buildCv.mjs', 'prepareDeploy.mjs', 'syncPages.mjs',
  'syncLegacyChunks.mjs'
]);

const library = new Set([
  'build.mjs', 'calendarDom.mjs', 'common.mjs', 'cv.mjs', 'dom.mjs',
  'flight.mjs', 'flightNode.mjs', 'icons.mjs', 'logo.mjs', 'profile.mjs',
  'skillsFlight.mjs', 'socials.mjs', 'writeSafe.mjs'
]);

// Inspect all files starting with check, verify, parity, diff, or ending with check/verify
const candidates = inventory.filter(f => !pipeline.has(f) && !library.has(f)).filter(f => {
  const l = f.toLowerCase();
  return l.startsWith('check') || l.startsWith('verify') || l.includes('parity') ||
         l.includes('liveverify') || l.includes('diff') || l.endsWith('check.mjs') ||
         l.endsWith('verify.mjs') || l.startsWith('test') || l.includes('compare');
});

for (const f of candidates) {
  const content = fs.readFileSync(path.join('tools', f), 'utf8');
  console.log(`\n=== ${f} (${content.split('\n').length} lines) ===`);
  const lines = content.split('\n').slice(0, 15).join('\n');
  console.log(lines);
}
