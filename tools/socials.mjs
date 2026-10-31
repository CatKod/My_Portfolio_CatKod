/**
 * Đổi nút mạng xã hội Instagram (bản gốc) thành Facebook.
 *
 * Yêu cầu bất di bất dịch: SSR DOM và RSC flight payload phải mô tả cùng
 * một cây component, nên mọi biến thể markup đều phải được thay ở CẢ hai bên.
 */

const FB_PATH = 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z';
const FB_KEY = 'fbd1cz';

const DOM_SVG_18 =
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>';

const DOM_SVG_17 =
  '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>';

function domSvg(size) {
  const attrs = size === 17 ? 'width="17" height="17"' : 'width="18" height="18"';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ${attrs} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-facebook"><path d="${FB_PATH}"></path></svg>`
  );
}

const FLIGHT_CHILDREN_OLD =
  '[["$","rect","2e1cvw",{"width":"20","height":"20","x":"2","y":"2","rx":"5","ry":"5"}],["$","path","9exkf1",{"d":"M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"}],["$","line","r4j83e",{"x1":"17.5","x2":"17.51","y1":"6.5","y2":"6.5"}],"$undefined"]';

const FLIGHT_CHILDREN_NEW =
  `[["$","path","${FB_KEY}",{"d":"${FB_PATH}"}],"$undefined"]`;

export const SOCIALS = [
  [DOM_SVG_18, domSvg(18)],
  [DOM_SVG_17, domSvg(17)],
  ['aria-label="Instagram"', 'aria-label="Facebook"'],
  ['>Instagram</a>', '>Facebook</a>'],

  [FLIGHT_CHILDREN_OLD, FLIGHT_CHILDREN_NEW],
  ['"className":"lucide lucide-instagram"', '"className":"lucide lucide-facebook"'],
  ['"aria-label":"Instagram"', '"aria-label":"Facebook"'],
  ['"Instagram"]}]', '"Facebook"]}]'],

  ['"instagram":"', '"facebook":"'],
];

export const SOCIALS_JS = [
  [
    'let i=(0,n.default)("Instagram",[["rect",{width:"20",height:"20",x:"2",y:"2",rx:"5",ry:"5",key:"2e1cvw"}],["path",{d:"M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z",key:"9exkf1"}],["line",{x1:"17.5",x2:"17.51",y1:"6.5",y2:"6.5",key:"r4j83e"}]])',
    `let i=(0,n.default)("Facebook",[["path",{d:"${FB_PATH}",key:"${FB_KEY}"}]])`,
  ],
  ['"aria-label":"Instagram"', '"aria-label":"Facebook"'],
  ['instagram:h,linkedin:f', 'facebook:h,linkedin:f'],
];
