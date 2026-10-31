import { readFileSync } from 'node:fs';
import { elementsByClass } from './dom.mjs';
import { logoLoop, toolPill } from './build.mjs';

const html = readFileSync('site.orig.bak/skills', 'utf8');
const cards = elementsByClass(html, 'skill-index-card');
const orig = cards[0];
const m = /<div class="skill-index-tools" aria-label="[^"]*">([\s\S]*?)<\/div><\/div><\/article>/.exec(orig);
const origLoop = m[1];
const gen = logoLoop(
  ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Nuxt', 'Vue', 'Hugo', 'JavaScript', 'HTML', 'CSS'],
  { reverse: false, speed: 18 },
);
console.log('orig len', origLoop.length, 'gen len', gen.length);
console.log('MATCH:', origLoop === gen);
if (origLoop !== gen) {
  for (let i = 0; i < Math.min(origLoop.length, gen.length); i++) {
    if (origLoop[i] !== gen[i]) {
      console.log('diff at', i);
      console.log('ORIG:', JSON.stringify(origLoop.slice(i - 150, i + 200)));
      console.log('GEN :', JSON.stringify(gen.slice(i - 150, i + 200)));
      break;
    }
  }
}

// tool pill
const grp = elementsByClass(html, 'skill-tool-group')[0];
const pills = /<div>([\s\S]*?)<\/div><\/article>/.exec(grp)[1];
const genPills = ['Figma', 'Canva', 'CorelDRAW', 'Adobe Photoshop', 'Adobe Illustrator']
  .map(toolPill)
  .join('');
console.log('PILL MATCH:', pills === genPills);
if (pills !== genPills) {
  console.log('ORIG:', JSON.stringify(pills.slice(0, 400)));
  console.log('GEN :', JSON.stringify(genPills.slice(0, 400)));
}
