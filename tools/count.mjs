import { readFileSync } from 'node:fs';

const h = readFileSync(process.argv[2], 'utf8');
const counts = {};
for (const c of ['project-focus', 'project-copy', 'project-index-button', 'project-gallery', 'project-meta-card', 'project-shot-main', 'project-description', 'project-impact', 'project-actions', 'project-flow-grid', 'project-stack-loop']) {
  counts[c] = (h.match(new RegExp('class="[^"]*' + c + '[^"]*"', 'g')) || []).length;
}
console.log(counts);
// which project titles appear in DOM
const titles = [...h.matchAll(/<strong>([^<]{3,60})<\/strong>/g)].map(m => m[1]);
console.log('strong texts:', JSON.stringify(titles.slice(0, 60)));
