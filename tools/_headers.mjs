/**
 * Trích xuất header comment của mỗi file trong tools/ để phân loại.
 * Dùng: node tools/_headers.mjs > tools/_headers.txt
 */
import { readFileSync, readdirSync } from 'node:fs';

const dir = 'tools';
const files = readdirSync(dir).filter((f) => f.endsWith('.mjs')).sort();

for (const f of files) {
  const src = readFileSync(dir + '/' + f, 'utf8');
  // phần comment đầu tiên liên tiếp (/** ... */ hoặc // ...)
  let header = '';
  const block = src.match(/^\s*\/\*\*([\s\S]*?)\*\//);
  if (block) {
    header = block[1]
      .split('\n')
      .map((l) => l.replace(/^\s*\*ing?/, '').replace(/^\s*\*\s?/, '').trim())
      .filter(Boolean)
      .slice(0, 3)
      .join(' | ');
  } else {
    const lines = src.split('\n');
    header = lines
      .slice(0, 4)
      .filter((l) => l.trim().startsWith('//'))
      .map((l) => l.replace(/^\s*\/\/\s?/, '').trim())
      .join(' | ')
      .slice(0, 220);
  }
  console.log(`${f}\t${header}`);
}
