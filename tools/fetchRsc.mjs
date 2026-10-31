import https from 'node:https';

const path = process.argv[2] || '/about';
const tree = process.argv[3] || '';

const headers = {
  RSC: '1',
  'Next-Router-State-Tree': tree,
  'Next-Url': path,
};

https
  .request('https://irfansabrian.vercel.app' + path, { method: 'GET', headers }, (res) => {
    let d = '';
    res.on('data', (c) => (d += c));
    res.on('end', () => {
      console.log('status', res.statusCode, 'len', d.length);
      console.log(d.slice(0, Number(process.argv[4] || 600)));
    });
  })
  .on('error', (e) => console.log('ERR', e.message))
  .end();
