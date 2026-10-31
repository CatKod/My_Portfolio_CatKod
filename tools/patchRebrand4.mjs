import { readFileSync, writeFileSync } from 'node:fs';

const f = 'tools/rebrand.mjs';
let t = readFileSync(f, 'utf8');

// các lời gọi replaceFlightArray dùng key đã có dấu quote -> bỏ quote
t = t.split(`replaceFlightArray(parts, '"weeks"', calendar.weeks)`).join(
  `replaceFlightArray(parts, 'weeks', calendar.weeks)`,
);
t = t.split(`replaceFlightArray(parts, '"projects"', projects.map(projectPayload))`).join(
  `replaceFlightArray(parts, 'projects', projects.map(projectPayload))`,
);

writeFileSync(f, t, 'utf8');
console.log('ok');
