/**
 * Logo monogram "CK" (CatKod) — thay logo chữ "IS" của bản gốc.
 *
 * Giữ nguyên viewBox "0 0 304.95 285.2" và các lớp `h-8 w-8` / `h-9 w-9`
 * để bố cục (layout) không đổi 1 pixel so với bản gốc.
 */

export const LOGO_VIEWBOX = '0 0 304.95 285.2';

/** Bộ phần tử SVG của monogram CK (dùng chung cho DOM, flight và bundle JS). */
export const CK_PARTS = [
  ['rect', { x: '0', y: '20', width: '140', height: '55' }],
  ['rect', { x: '0', y: '20', width: '55', height: '245' }],
  ['rect', { x: '0', y: '210', width: '140', height: '55' }],
  ['rect', { x: '170', y: '20', width: '58', height: '245' }],
  ['polygon', { points: '228,142 304.95,20 304.95,72 245,142' }],
  ['polygon', { points: '245,142 304.95,213 304.95,265 228,142' }],
];

/** Logo gốc (chữ "IS") — giữ nguyên để đối chiếu byte-for-byte. */
export const ORIGINAL_LOGO_PARTS = [
  ['polygon', { points: '0 69.06 168.67 69.06 167.76 116.08 49.29 116.08 49.74 142.64 104 142.64 104.46 187.53 48.84 187.53 49.29 285.2 0 285.2 0 69.06' }],
  ['path', { d: 'M120.28,188.89l.45-46.12,28.49-.12s33.46-8.47,37.53-37.86.94,12.53.24-17.25-40.03-39.27-40.03-39.27l-89.99-.83V0l94.96.32s70.99,1.81,87.27,77.32-61.05,104-61.05,104l73.25,103.55h-60.59' }],
  ['polygon', { points: '78.03 284.3 125.28 211.04 153.32 247.67 127.32 284.3 78.03 284.3' }],
  ['polygon', { points: '304.95 204.88 258.44 278.61 230.04 242.27 255.67 205.38 304.95 204.88' }],
  ['rect', { width: '41.15', height: '47.35' }],
];

function attrsToHtml(attrs) {
  return Object.entries(attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
}

/** SVG DOM của logo CK (dùng cho header `h-8 w-8` và mobile menu `h-9 w-9`). */
export function ckSvgDom(className) {
  const body = CK_PARTS.map(([tag, attrs]) => `<${tag} fill="currentColor" ${attrsToHtml(attrs)}></${tag}>`).join('');
  return `<svg aria-hidden="true" class="${className}" viewBox="${LOGO_VIEWBOX}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}

/** Mảng children JSON của logo CK (dùng trong flight payload). */
export function ckChildrenFlight() {
  const kids = CK_PARTS.map(([tag, attrs]) => ['$', tag, null, { fill: 'currentColor', ...attrs }]);
  return JSON.stringify(kids);
}

/** Biểu thức `jsx` của logo CK (dùng trong client bundle). */
export function ckChildrenJs(jsx) {
  return CK_PARTS.map(([tag, attrs]) => {
    const a = Object.entries(attrs)
      .map(([k, v]) => `${k}:"${v}"`)
      .join(',');
    return `${jsx}("${tag}",{fill:"currentColor",${a}})`;
  }).join(',');
}

/** Biểu thức `jsx` của logo gốc (dùng để đối chiếu trong client bundle). */
export function originalLogoChildrenJs(jsx) {
  return ORIGINAL_LOGO_PARTS.map(([tag, attrs]) => {
    const a = Object.entries(attrs)
      .map(([k, v]) => `${k}:"${v}"`)
      .join(',');
    return `${jsx}("${tag}",{fill:"currentColor",${a}})`;
  }).join(',');
}

/** Regex nhận diện node svg logo trong DOM (bất kể h-8 hay h-9). */
export const LOGO_SVG_DOM_RE =
  /<svg aria-hidden="true" class="h-\d w-\d" viewBox="0 0 304\.95 285\.2"[\s\S]*?<\/svg>/g;

/** Marker node svg logo trong flight payload (đã decode). */
export const LOGO_SVG_FLIGHT_MARKER =
  '["$","svg",null,{"aria-hidden":"true","className":"h-8 w-8","viewBox":"0 0 304.95 285.2","xmlns":"http://www.w3.org/2000/svg","children":[';
