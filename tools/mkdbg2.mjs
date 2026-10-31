import { readFileSync, writeFileSync } from 'node:fs';

const s = readFileSync('site/credentials', 'utf8');
// xóa các script push rỗng: <script>self.__next_f.push([1,"\n"])</script>
const out = s.replace(/<script>self\.__next_f\.push\(\[1,"\\n"\]\)<\/script>/g, '');
console.log('removed', (s.length - out.length) / 40, 'bytes');
writeFileSync('site/credentials-dbg', out);
