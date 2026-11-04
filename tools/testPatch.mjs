import { readFileSync, writeFileSync, readdirSync, cpSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

console.log('--- RESETTING CHUNKS FROM site.orig.bak ---');
const src = 'site.orig.bak/_next/static/chunks';
const dst = 'site/_next/static/chunks';
for (const f of readdirSync(dst)) rmSync(join(dst, f));
cpSync(src, dst, { recursive: true, force: true });

console.log('--- RUNNING rebrand, patchCredLink, synciconmap, patchCss ---');
execFileSync('node', ['tools/rebrand.mjs'], { stdio: 'inherit' });
execFileSync('node', ['tools/patchCredLink.mjs'], { stdio: 'inherit' });
execFileSync('node', ['tools/synciconmap.mjs'], { stdio: 'inherit' });
execFileSync('node', ['tools/patchCss.mjs'], { stdio: 'inherit' });

console.log('--- NOW APPLYING PROPOSED patchCssHome.mjs ---');
const files = readdirSync(dst).filter(f => f.endsWith('.css'));

const PATCHES = [
  // 1. Grid rows & gap: Row 2 uses minmax(min-content, 1fr) so it never squishes intro
  [
    '.home-scene{grid-template-rows:min-content minmax(0,1fr) min-content;grid-template-columns:minmax(0,1fr);gap:clamp(14px,2.2vw,28px);display:grid;position:relative;overflow:hidden}',
    '.home-scene{grid-template-rows:min-content minmax(min-content,1fr) min-content;grid-template-columns:minmax(0,1fr);gap:clamp(10px,1.5vh,20px);display:grid;position:relative;overflow:hidden;height:100%}',
  ],

  // 2. Base .home-intro padding-top reduced
  [
    '.home-intro{z-index:2;grid-area:2/1;align-self:start;width:100%;max-width:none;margin-inline:0;padding-top:clamp(24px,4vh,48px);padding-bottom:2px;position:relative}',
    '.home-intro{z-index:2;grid-area:2/1;align-self:start;width:100%;max-width:none;margin-inline:0;padding-top:clamp(6px,1.2vh,16px);padding-bottom:2px;position:relative}',
  ],

  // 3. Base .home-title padding-top reduced
  [
    '.home-title{z-index:2;grid-area:1/1;width:100%;max-width:none;margin-inline:0;padding-top:clamp(56px,8.5vh,88px);position:relative}',
    '.home-title{z-index:2;grid-area:1/1;width:100%;max-width:none;margin-inline:0;padding-top:clamp(16px,3vh,42px);position:relative}',
  ],

  // 4. Desktop media query: extend down to 1024px, reduce huge 92px padding-top, fit heading
  [
    '@media (min-width:1180px){.home-scene{z-index:2;grid-template-columns:minmax(0,.72fr) minmax(350px,.48fr);position:relative}.stage.stage--home .home-title{padding-top:clamp(92px,12vh,132px)}.stage.stage--home .home-line-art{width:min(88vw,1040px);height:min(132vh,1080px);display:block;inset:clamp(-270px,-22vh,-132px) clamp(-210px,-12vw,-84px) auto auto}.home-signal{justify-self:end;width:min(100%,520px);display:grid}}',
    '@media (min-width:1024px){.home-scene{z-index:2;grid-template-columns:minmax(0,.72fr) minmax(350px,.48fr);position:relative}.stage.stage--home .home-title{padding-top:clamp(16px,2.5vh,48px)}.stage.stage--home .home-title h1{font-size:clamp(2.4rem,4.2vw,5.2rem);line-height:.95}.stage.stage--home .home-line-art{width:min(88vw,1040px);height:min(132vh,1080px);display:block;inset:clamp(-270px,-22vh,-132px) clamp(-210px,-12vw,-84px) auto auto}.home-signal{justify-self:end;width:min(100%,520px);display:grid}}',
  ],

  // 4b. Adjust tablet media query max-width from 1100px to 1023px so 1024px gets desktop
  [
    '@media (max-width:1100px) and (min-width:721px)',
    '@media (max-width:1023px) and (min-width:721px)',
  ],

  // 5. Capability card min-height made responsive
  [
    '.home-capability-card{border-right:1px solid var(--line);min-height:132px;color:inherit;cursor:default;isolation:isolate;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);background:radial-gradient(circle at 92% 12%,#11111113,#0000 28%),',
    '.home-capability-card{border-right:1px solid var(--line);min-height:clamp(74px,9.5vh,118px);color:inherit;cursor:default;isolation:isolate;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);background:radial-gradient(circle at 92% 12%,#11111113,#0000 28%),',
  ],

  // 6. Capability head padding tightened
  [
    '.home-system-head{border-right:1px solid var(--line);background:linear-gradient(#e8e9e69e,#d9dad77a),repeating-linear-gradient(135deg,#11111108 0 1px,#0000 1px 14px);align-content:space-between;gap:18px;padding:16px 18px;display:grid}',
    '.home-system-head{border-right:1px solid var(--line);background:linear-gradient(#e8e9e69e,#d9dad77a),repeating-linear-gradient(135deg,#11111108 0 1px,#0000 1px 14px);align-content:space-between;gap:8px;padding:10px 14px;display:grid}',
  ],

  // 7. Tablet media query: minmax(min-content, 1fr) for row 2, 4 columns for capability cards so height stays 1 row
  [
    '.home-scene{grid-template-rows:auto minmax(0,1fr) min-content;grid-template-columns:minmax(0,1fr);gap:22px}',
    '.home-scene{grid-template-rows:auto minmax(min-content,1fr) min-content;grid-template-columns:minmax(0,1fr);gap:clamp(10px,1.5vh,18px)}',
  ],
  [
    '.home-capability-grid{grid-template-columns:repeat(2,minmax(0,1fr))}',
    '.home-capability-grid{grid-template-columns:repeat(4,minmax(0,1fr))}',
  ],
  [
    '.home-capability-card:nth-child(2n){border-right:0}.home-capability-card:nth-child(-n+2){border-bottom:1px solid var(--line)}',
    '.home-capability-card:nth-child(2n){border-right:1px solid var(--line)}.home-capability-card:last-child{border-right:0}.home-capability-card:nth-child(-n+2){border-bottom:0}',
  ],

  // 8. Compact height rule: minmax(min-content, 1fr)
  [
    '.home-scene{grid-template-rows:auto minmax(0,1fr) min-content;grid-template-columns:minmax(0,1fr);align-content:space-between;gap:16px;height:100%;min-height:0;overflow:hidden}',
    '.home-scene{grid-template-rows:auto minmax(min-content,1fr) min-content;grid-template-columns:minmax(0,1fr);align-content:space-between;gap:10px;height:100%;min-height:0;overflow:hidden}',
  ],

  // 9. Reduce title font size in 721-1100px so "Hoàng Kim Vĩnh" doesn't explode vertically
  [
    '.home-title h1{font-size:clamp(4.2rem,8vw,5.6rem)}',
    '.home-title h1{font-size:clamp(2.4rem,4.4vw,4.2rem)}',
  ]
];

for (const f of files) {
  const p = join(dst, f);
  let content = readFileSync(p, 'utf8');
  if (!content.includes('.credentials-board{')) continue;
  for (const [from, to] of PATCHES) {
    if (!content.includes(from)) {
      console.log('MISS:', from.slice(0, 50));
      continue;
    }
    content = content.replace(from, to);
    console.log('REPLACED:', from.slice(0, 40));
  }
  writeFileSync(p, content, 'utf8');
  console.log('Wrote patched CSS to', f);
}
