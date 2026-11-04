import { readFileSync } from 'node:fs';

const css = readFileSync('site/_next/static/chunks/0kv4a-p~1zj9b.catkod.1bb0b6dd.css', 'utf8');

// We want to find each block in the CSS and what media query wraps it
let pos = 0;
while (pos < css.length) {
  const mediaIdx = css.indexOf('@media', pos);
  if (mediaIdx === -1) break;
  // find the { after @media
  const braceOpen = css.indexOf('{', mediaIdx);
  const mediaCondition = css.slice(mediaIdx, braceOpen).trim();
  
  // now find matching brace for the media query
  let depth = 1;
  let i = braceOpen + 1;
  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') depth--;
    i++;
  }
  const mediaContent = css.slice(braceOpen + 1, i - 1);
  pos = i;

  if (mediaContent.includes('.home-') || mediaContent.includes('.stage--home')) {
    console.log('\n=============================================');
    console.log(mediaCondition);
    console.log('=============================================');
    // print rules inside that contain home-
    const subrules = mediaContent.match(/[^\{\}]+?\{[^\{\}]+\}/g) || [];
    for (const r of subrules) {
      if (r.includes('.home-') || r.includes('.stage--home')) {
        console.log('  ', r.trim());
      }
    }
  }
}
