/**
 * Bảng thay thế dùng chung cho mọi trang.
 * Áp dụng cho cả HTML render sẵn (DOM) và RSC flight payload.
 */

/** Ánh xạ chuỗi cũ -> mới, dùng cho cả hai lớp dữ liệu. */
export const commonReplacements = [
  // --- tên và thương hiệu ---
  ['https://irfansabrian.vercel.app', 'https://catkod.github.io/'],
  ['https://www.linkedin.com/in/irfan-sabrian-b1a320372/', 'https://www.linkedin.com/in/kim-v%C4%A9nh-ho%C3%A0ng-9a306935a/'],
  ['https://github.com/IrfanSabrian', 'https://github.com/CatKod'],
  ['https://instagram.com/irf.shyonn', 'https://web.facebook.com/HoangKiVinh'],
  ['https://discord.com/users/441643149899595797', 'https://discord.com/users/708991627003166743'],
  ['mailto:irfansabrian34@gmail.com', 'mailto:kimvinhh6@gmail.com'],
  ['irfansabrian34@gmail.com', 'kimvinhh6@gmail.com'],
  ['tel:+6289508669156', 'tel:+84337951905'],
  ['+6289508669156', '+84337951905'],
  ['https://maps.google.com/?q=Pontianak%2C%20Kalimantan%20Barat', 'https://maps.google.com/?q=Hanoi%2C%20Vietnam'],
  ['Pontianak, Kalimantan Barat, Indonesia', 'Hanoi, Vietnam'],
  ['Pontianak, Kalimantan Barat', 'Hanoi, Vietnam'],
  ['/irfan.svg?v=20260521-dark', '/catkod.svg'],
  ['/irfan.svg', '/catkod.svg'],

  // --- metadata ---
  ['Irfan Sabrian | Portfolio 2026', 'Hoàng Kim Vĩnh | Portfolio 2026'],
  ['Irfan Sabrian Portfolio 2026 preview', 'Hoàng Kim Vĩnh Portfolio 2026 preview'],
  ['Irfan Sabrian Portfolio', 'Hoàng Kim Vĩnh Portfolio'],
  [
    'Portfolio 2026 for Irfan Sabrian, a full-stack web developer building websites, web apps, automation workflows, AI-assisted systems, and GIS products.',
    'Portfolio 2026 for Hoàng Kim Vĩnh, an embedded firmware engineer building STM32H7 firmware, CAN bus systems, industrial IoT products, and edge AI on MCU.',
  ],
  [
    'Full-stack web developer for web systems, automation, AI workflows, and GIS products.',
    'Embedded firmware engineer for industrial EV charging, IoT products, and edge AI on MCU.',
  ],
  ['Irfan Sabrian', 'Hoàng Kim Vĩnh'],
  ['Irfan', 'Hoàng Kim Vĩnh'],
  ['@irfansabrian', '@CatKod'],
  ['Irfan portfolio home', 'Hoàng Kim Vĩnh portfolio home'],
  ['Loading Irfan Sabrian portfolio', 'Loading Hoàng Kim Vĩnh portfolio'],
  ['Irfan replied', 'Hoàng Kim Vĩnh replied'],

  // --- footer ---
  ['full-stack web developer', 'embedded firmware engineer'],
  ['automation / ai / gis', 'can / misra / iot'],

  // --- loader / brand ---
  ['Irfan Sabrian / 2026', 'Hoàng Kim Vĩnh / 2026'],
  ['Irfan / 2026', 'Hoàng Kim Vĩnh / 2026'],
];

/** Chuỗi trong JS chunk (loader key, brand text). */
export const chunkReplacements = [
  ['irfan-portfolio-google-language', 'catkod-portfolio-google-language'],
  ['irfan-portfolio-loader-complete-v7', 'catkod-portfolio-loader-complete-v7'],
  ['Loading Irfan Sabrian portfolio', 'Loading Hoàng Kim Vĩnh portfolio'],
  ['Irfan Sabrian / 2026', 'Hoàng Kim Vĩnh / 2026'],
  ['Irfan Sabrian', 'Hoàng Kim Vĩnh'],
];

/**
 * Với RSC flight payload, tên có dấu phải được escape theo JSON.
 * Hàm này thay thế trên chuỗi đã decode (payload thô) nên dùng trực tiếp.
 */
export function applyReplacements(text, table = commonReplacements) {
  let out = text;
  for (const [from, to] of table) {
    if (!from) continue;
    out = out.split(from).join(to);
  }
  return out;
}
