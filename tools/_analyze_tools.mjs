import fs from 'fs';
import path from 'path';

const inventory = fs.readFileSync('tools/_inventory.txt', 'utf8')
  .trim().split(/\r?\n/).map(s => s.trim()).filter(Boolean);

// Filter out KEEP_PIPELINE and KEEP_LIBRARY
const pipeline = new Set([
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
  'syncLegacyChunks.mjs'
]);

const library = new Set([
  'build.mjs',
  'calendarDom.mjs',
  'common.mjs',
  'cv.mjs',
  'dom.mjs',
  'flight.mjs',
  'flightNode.mjs',
  'icons.mjs',
  'logo.mjs',
  'profile.mjs',
  'skillsFlight.mjs',
  'socials.mjs',
  'writeSafe.mjs'
]);

const remaining = inventory.filter(f => !pipeline.has(f) && !library.has(f));
console.log('Remaining files to classify:', remaining.length); // 373 - 13 - 13 = 347

// Let's analyze all remaining files:
// - line count
// - comment at top
// - whether it uses playwright / puppeteer / fetch / http
// - whether it has 'verify', 'check', 'diff', 'parity', 'test', 'compare', 'inspect', 'dump', 'probe'
const analysis = remaining.map(f => {
  const content = fs.readFileSync(path.join('tools', f), 'utf8');
  const lines = content.split('\n');
  const size = content.length;
  const isPlaywright = content.includes('playwright');
  const isFetch = content.includes('fetch(') || content.includes('http://') || content.includes('https://');
  let comment = '';
  const m = content.match(/\/\*\*?([\s\S]*?)\*\//) || content.match(/\/\/(.*)/);
  if (m) comment = m[1].replace(/\r?\n/g, ' ').replace(/\*/g, '').trim().slice(0, 80);
  return { f, lines: lines.length, size, isPlaywright, isFetch, comment };
});

// Let's find all files with verification intent
const verifiers = analysis.filter(a => {
  const name = a.f.toLowerCase();
  return name.startsWith('check') ||
         name.startsWith('verify') ||
         name.includes('parity') ||
         name.includes('liveverify') ||
         name.includes('diff') ||
         name.includes('compare') ||
         name.endsWith('check.mjs') ||
         name.endsWith('verify.mjs');
});

console.log('Verifiers count:', verifiers.length);
verifiers.forEach(v => {
  console.log(`${v.f.padEnd(28)} [${String(v.lines).padStart(3)}L] [PW:${v.isPlaywright?'Y':'N'} Net:${v.isFetch?'Y':'N'}] ${v.comment}`);
});
