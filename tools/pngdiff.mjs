// Minimal PNG reader/writer + pixel diff (no external deps).
import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync, deflateSync } from 'node:zlib';

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = c ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

export function readPng(path) {
  const buf = readFileSync(path);
  let off = 8, width = 0, height = 0, depth = 0, color = 0, interlace = 0;
  const idat = [];
  let palette = null, trns = null;
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      depth = data[8]; color = data[9]; interlace = data[12];
    } else if (type === 'PLTE') palette = Buffer.from(data);
    else if (type === 'tRNS') trns = Buffer.from(data);
    else if (type === 'IDAT') idat.push(Buffer.from(data));
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (depth !== 8) throw new Error('only 8-bit supported, got ' + depth);
  if (interlace) throw new Error('interlaced not supported');
  const raw = inflateSync(Buffer.concat(idat));
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[color];
  const bpp = channels;
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const line = raw.subarray(pos, pos + stride); pos += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      switch (filter) {
        case 1: v = v + a; break;
        case 2: v = v + b; break;
        case 3: v = v + ((a + b) >> 1); break;
        case 4: {
          const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
      }
      cur[x] = v & 0xff;
    }
  }
  // normalise to RGBA
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0, n = width * height; i < n; i++) {
    let r, g, b, a = 255;
    if (color === 0) { r = g = b = out[i]; }
    else if (color === 2) { r = out[i * 3]; g = out[i * 3 + 1]; b = out[i * 3 + 2]; }
    else if (color === 3) {
      const idx = out[i];
      r = palette[idx * 3]; g = palette[idx * 3 + 1]; b = palette[idx * 3 + 2];
      if (trns && idx < trns.length) a = trns[idx];
    } else if (color === 4) { r = g = b = out[i * 2]; a = out[i * 2 + 1]; }
    else { r = out[i * 4]; g = out[i * 4 + 1]; b = out[i * 4 + 2]; a = out[i * 4 + 3]; }
    rgba[i * 4] = r; rgba[i * 4 + 1] = g; rgba[i * 4 + 2] = b; rgba[i * 4 + 3] = a;
  }
  return { width, height, data: rgba };
}

export function writePng(path, width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 6 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  writeFileSync(path, png);
}

export function diffImages(aPath, bPath, outPath, threshold = 0) {
  const A = readPng(aPath), B = readPng(bPath);
  const W = Math.min(A.width, B.width), H = Math.min(A.height, B.height);
  const out = Buffer.alloc(W * H * 4);
  let changed = 0, minX = W, minY = H, maxX = -1, maxY = -1, maxDelta = 0;
  const rows = new Map();
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const dr = Math.abs(A.data[i] - B.data[i]);
      const dg = Math.abs(A.data[i + 1] - B.data[i + 1]);
      const db = Math.abs(A.data[i + 2] - B.data[i + 2]);
      const da = Math.abs(A.data[i + 3] - B.data[i + 3]);
      const d = Math.max(dr, dg, db, da);
      if (d > threshold) {
        changed++;
        if (d > maxDelta) maxDelta = d;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        rows.set(y, (rows.get(y) || 0) + 1);
        out[i] = 255; out[i + 1] = 0; out[i + 2] = 0; out[i + 3] = 255;
      } else {
        const g = ((A.data[i] * 0.3 + A.data[i + 1] * 0.59 + A.data[i + 2] * 0.11) * 0.35 + 160) | 0;
        out[i] = out[i + 1] = out[i + 2] = g; out[i + 3] = 255;
      }
    }
  }
  if (outPath) writePng(outPath, W, H, out);
  return {
    width: W, height: H,
    sizeA: [A.width, A.height], sizeB: [B.width, B.height],
    changed, total: W * H,
    ratio: changed / (W * H),
    maxDelta,
    bbox: maxX < 0 ? null : { minX, minY, maxX, maxY },
    hotRows: [...rows.entries()].sort((p, q) => q[1] - p[1]).slice(0, 15),
  };
}

if (process.argv[1] && process.argv[1].endsWith('pixdiff.mjs')) {
  const [a, b, o, t] = process.argv.slice(2);
  console.log(JSON.stringify(diffImages(a, b, o, t ? Number(t) : 0), null, 2));
}
