import { readFileSync, writeFileSync } from 'node:fs';

const s = readFileSync('site/credentials', 'utf8');
const inject =
  '<script>(function(){var L=[];' +
  'window.addEventListener("error",function(e){L.push("ERR: "+(e.error&&e.error.stack||e.message)+" @"+(e.filename||"")+":"+e.lineno)},true);' +
  'window.addEventListener("unhandledrejection",function(e){var r=e.reason;L.push("REJ: "+(r&&(r.stack||r.message)||r))});' +
  'var _ce=console.error;console.error=function(){L.push("CE: "+Array.prototype.map.call(arguments,String).join(" ").slice(0,700));return _ce.apply(console,arguments)};' +
  'setInterval(function(){try{sessionStorage.setItem("__dbg",JSON.stringify(L))}catch(e){}},50);' +
  '})();<\/script>';
writeFileSync('site/credentials-dbg', s.replace('<head>', '<head>' + inject));
console.log('ok');
