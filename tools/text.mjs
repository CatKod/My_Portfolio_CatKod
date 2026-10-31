import { readFileSync } from 'node:fs';

const f = process.argv[2];
const h = readFileSync(f, 'utf8');
const body = h
  .replace(/<script[\s\S]*?<\/script>/g, '\n')
  .replace(/<style[\s\S]*?<\/style>/g, '\n')
  .replace(/<\/(p|div|section|li|h1|h2|h3|h4|tr|td|th|span|a|button)>/g, '\n')
  .replace(/<br\s*\/?>/g, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'")
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .split('\n').map(s => s.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');
console.log(body);
