import { readFileSync } from 'node:fs';
const c = JSON.parse(readFileSync('calendar.json', 'utf8'));
console.log(Object.keys(c));
console.log('login', c.login, 'total', c.totalContributions, 'from', c.from, 'to', c.to, 'gen', c.generatedAt);
console.log('week0', JSON.stringify(c.weeks[0]));
console.log('weekday values:', [...new Set(c.weeks.flatMap(w => w.contributionDays.map(d => d.weekday)))].sort());
console.log('colors:', [...new Set(c.weeks.flatMap(w => w.contributionDays.map(d => d.color)))]);
console.log('days per week set:', [...new Set(c.weeks.map(w => w.contributionDays.length))]);
