import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const src =
  'C:/Users/kimvi/.cursor/projects/d-GitHub-My-Portfolio-CatKod/assets/c__Users_kimvi_AppData_Roaming_Cursor_User_workspaceStorage_854f6971d3356585d10defa7398d6fe0_images_image-e819aa44-6ef4-4e85-b2aa-1707d5202935.png';

const out = 'D:/GitHub/My_Portfolio_CatKod/shots/gemini/';

await sharp(src).metadata().then((m) => console.log('kích thước gốc:', m.width, 'x', m.height));

// Cắt 4 góc phóng to
const regions = [
  { name: 'user-left-top', left: 0, top: 0, width: 560, height: 320 },
  { name: 'user-right-top', left: 480, top: 0, width: 544, height: 320 },
  { name: 'user-right-mid', left: 480, top: 180, width: 544, height: 300 },
  { name: 'user-right-bot', left: 480, top: 300, width: 544, height: 275 },
];

for (const r of regions) {
  await sharp(src)
    .extract({ left: r.left, top: r.top, width: r.width, height: r.height })
    .resize({ width: r.width * 2, kernel: 'lanczos3' })
    .png()
    .toFile(out + r.name + '.png');
  console.log('đã cắt:', r.name);
}

// Bản phóng toàn bộ 2x
await sharp(src).resize({ width: 2048, kernel: 'lanczos3' }).png().toFile(out + 'user-full-2x.png');
console.log('đã tạo bản 2x toàn ảnh');
