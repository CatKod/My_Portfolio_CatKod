const url = process.argv[2] || 'http://localhost:9311/';
const res = await fetch(url);
const t = await res.text();
const m = t.match(/<title>([\s\S]*?)<\/title>/);
console.log('status', res.status);
console.log('title:', m ? JSON.stringify(m[1]) : '(none)');
console.log('h1:', (t.match(/<h1[^>]*>([\s\S]{0,120}?)<\/h1>/) || [])[1]?.replace(/<[^>]+>/g, '').trim());
console.log('len', t.length);
