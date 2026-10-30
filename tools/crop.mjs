// Crop a region from a PNG and save as new PNG.
import { readPng, writePng } from './pngdiff.mjs';

const [src, out, x, y, w, h, scale = '1'] = process.argv.slice(2);
const img = readPng(src);
const X = Number(x), Y = Number(y), W = Number(w), H = Number(h);
const S = Number(scale);
const ow = W * S, oh = H * S;
const outBuf = Buffer.alloc(ow * oh * 4);
for (let j = 0; j < oh; j++) {
  for (let i = 0; i < ow; i++) {
    const sx = Math.min(img.width - 1, X + Math.floor(i / S));
    const sy = Math.min(img.height - 1, Y + Math.floor(j / S));
    const si = (sy * img.width + sx) * 4, di = (j * ow + i) * 4;
    outBuf[di] = img.data[si]; outBuf[di + 1] = img.data[si + 1];
    outBuf[di + 2] = img.data[si + 2]; outBuf[di + 3] = 255;
  }
}
writePng(out, ow, oh, outBuf);
console.log('wrote', out, ow, oh);
