import { readFileSync } from 'node:fs';

const css = readFileSync('site/_next/static/chunks/0kv4a-p~1zj9b.catkod.1bb0b6dd.css', 'utf8');

// Find all CSS rules (including @media queries) mentioning .home-
const mediaRegex = /@media[^{]+\{(?:[^{}]*\{[^{}]*\})*\}/g;
// Or let's parse rules cleanly:
console.log('--- CSS HOME RULES ---');

// Split by closing brace or extract rules
const rules = css.match(/[^\{\}]+?\{[^\{\}]+\}/g) || [];
for (const r of rules) {
  if (r.includes('.home-') || r.includes('.stage--home')) {
    console.log(r.trim());
  }
}
