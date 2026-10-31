/**
 * Bảng thay thế dùng chung cho mọi trang.
 * Áp dụng đồng thời lên DOM (HTML render sẵn) và flight payload (RSC).
 */
import { profile } from './profile.mjs';

const META_DESCRIPTION =
  'Portfolio 2026 for Hoàng Kim Vĩnh, an embedded firmware engineer building STM32H7 firmware, CAN bus systems, industrial IoT products, and edge AI on MCU.';
const META_SHORT =
  'Embedded firmware engineer for industrial EV charging, IoT products, and edge AI on MCU.';

export const COMMON = [
  // --- đường dẫn tài liệu (đặt trước mọi thay thế tên) ---
  ['/pdf/CV_Irfan-Sabrian_2026.pdf', profile.cvPath],

  // --- tên / thương hiệu ---
  ['https://irfansabrian.vercel.app', profile.links.website],
  [
    'https://www.linkedin.com/in/irfan-sabrian-b1a320372/',
    profile.links.linkedin,
  ],
  ['https://github.com/IrfanSabrian', profile.links.github],
  ['https://instagram.com/irf.shyonn', profile.links.facebook],
  [
    'https://discord.com/users/441643149899595797',
    profile.links.discord,
  ],
  // props socials truyền từ server -> client (chỉ có id, không có URL)
  ['"discord":"441643149899595797"', '"discord":"708991627003166743"'],
  ['mailto:irfansabrian34@gmail.com', `mailto:${profile.email}`],
  ['irfansabrian34@gmail.com', profile.email],
  ['tel:+6289508669156', `tel:${profile.phone}`],
  ['+6289508669156', profile.phone],
  [
    'https://maps.google.com/?q=Pontianak%2C%20Kalimantan%20Barat',
    'https://maps.google.com/?q=Hanoi%2C%20Vietnam',
  ],
  ['Pontianak, Kalimantan Barat, Indonesia', 'Hanoi, Vietnam'],
  ['Pontianak, Kalimantan Barat', 'Hanoi, Vietnam'],
  ['/irfan.svg?v=20260521-dark', profile.favicon],
  ['/irfan.svg', profile.favicon],

  // --- metadata ---
  ['Irfan Sabrian | Portfolio 2026', `${profile.name} | Portfolio 2026`],
  [
    'Portfolio 2026 for Irfan Sabrian, a full-stack web developer building websites, web apps, automation workflows, AI-assisted systems, and GIS products.',
    META_DESCRIPTION,
  ],
  [
    'Full-stack web developer for web systems, automation, AI workflows, and GIS products.',
    META_SHORT,
  ],
  [
    'Irfan Sabrian Portfolio 2026 preview',
    `${profile.name} Portfolio 2026 preview`,
  ],
  ['Irfan Sabrian Portfolio', `${profile.name} Portfolio`],
  ['Irfan Sabrian', profile.name],
  ['Irfan', profile.name],
  ['@irfansabrian', `@${profile.handle}`],
  ['Irfan portfolio home', `${profile.name} portfolio home`],
  ['Loading Irfan Sabrian portfolio', `Loading ${profile.name} portfolio`],
  ['Irfan replied', `${profile.name} replied`],

  // --- footer ---
  ['full-stack web developer', profile.roleShort],
  ['automation / ai / gis', 'can / misra / iot'],

  // --- loader / brand ---
  ['Irfan Sabrian / 2026', `${profile.name} / 2026`],
  ['Irfan / 2026', `${profile.name} / 2026`],

  // --- ngôn ngữ Google Translate ---
  // Danh sách ngôn ngữ ở client bundle và ở SSR DOM phải giống nhau, nếu không
  // React sẽ báo hydration mismatch (error #418). Bản gốc đã có sẵn "Vietnam"
  // (vi) nên ta chỉ cần bỏ "Indonesia" (id) ở CẢ hai nơi.
  ['<option value="id">Indonesia</option>', ''],
];

/**
 * Thay thế riêng cho các chunk JS (client bundle).
 * Thứ tự quan trọng: các chuỗi dài trước, chuỗi ngắn sau.
 */
export const COMMON_JS = [
  ['Loading Irfan Sabrian portfolio', `Loading ${profile.name} portfolio`],
  ['Irfan Sabrian / 2026', `${profile.name} / 2026`],
  ['Irfan replied', `${profile.name} replied`],
  ['irfan-portfolio-google-language', 'catkod-portfolio-google-language'],
  ['irfan-portfolio-loader-complete-v7', 'catkod-portfolio-loader-complete-v7'],
  ['title:"Irfan Sabrian"', `title:"${profile.name}"`],
  ['Irfan Sabrian', profile.name],
];

/**
 * Ngôn ngữ Google Translate: bỏ "Indonesia" trong danh sách ngôn ngữ ở client
 * bundle, khớp với DOM tĩnh (đã bỏ option "id").
 */
export const JS_INDONESIA = [['{code:"id",label:"Indonesia"},', '']];
