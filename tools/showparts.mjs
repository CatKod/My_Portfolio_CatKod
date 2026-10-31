import { readFileSync } from 'node:fs';
import { splitFile } from './flight.mjs';

const parts = splitFile(readFileSync(process.argv[2], 'utf8'));
parts.forEach((p, i) => {
  console.log(i, p.kind, JSON.stringify(p.text.slice(0, 120)));
});
