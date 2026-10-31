/**
 * Sinh lại markup DOM cho các khối có nội dung động.
 * Mục tiêu: byte-for-byte giống cấu trúc React của site gốc, để SSR HTML
 * và RSC flight payload luôn khớp nhau (không hydration mismatch).
 */
import { iconUrl } from './icons.mjs';
import { esc } from './dom.mjs';

/* ------------------------------------------------------------------ */
/* Logo loop                                                           */
/* ------------------------------------------------------------------ */

/**
 * Tên viết tắt hiển thị khi icon không có trên CDN.
 * React: `name.split(/[\s.+-]+/).filter(Boolean).slice(0,2).map(e => e[0]).join("").toUpperCase()`
 */
export function iconAbbrev(name) {
  return name
    .split(/[\s.+-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

/** Icon nào cần nền sáng (biểu tượng OpenAI). */
const LIGHT_LOGO = new Set(['OpenAI']);

/** Một item logo-loop (icon + tên). */
export function logoLoopItem(name) {
  const src = iconUrl(name);
  // React: nếu có icon thì render <img>, ngược lại render chữ viết tắt.
  const mark = src
    ? `<img alt="" aria-hidden="true" loading="lazy" width="18" height="18" decoding="async" data-nimg="1" style="color:transparent" src="${src}"/>`
    : iconAbbrev(name);
  const cls = LIGHT_LOGO.has(name) ? 'logo-loop-item logo-loop-item--light-logo' : 'logo-loop-item';
  return `<span class="${cls}" title="${esc(name)}"><span class="logo-loop-mark">${mark}</span><span class="logo-loop-name">${esc(name)}</span></span>`;
}

/**
 * Vòng logo đầy đủ: LogoLoop render l*n bản sao với l = f(count)
 * (count<=2 -> 16, <=4 -> 12, <=6 -> 8, else 6).
 */
export function logoLoop(items, opts = {}) {
  const { reverse = false, speed = 18 } = opts;
  const list = items.filter((n) => n && n.trim().length > 0);
  if (!list.length) return '';
  const l = list.length <= 2 ? 16 : list.length <= 4 ? 12 : list.length <= 6 ? 8 : 6;
  const cls = reverse ? 'logo-loop logo-loop--reverse' : 'logo-loop';
  const groupItems = () => list.map((name) => logoLoopItem(name)).join('');
  let sets = '';
  for (let i = 0; i < 2; i++) {
    const groups = [];
    for (let o = 0; o < l; o++) {
      const aria = i > 0 || o > 0 ? ' aria-hidden="true"' : '';
      groups.push(`<div${aria} class="logo-loop-group">${groupItems()}</div>`);
    }
    const setAria = i > 0 ? ' aria-hidden="true"' : '';
    sets += `<div${setAria} class="logo-loop-set">${groups.join('')}</div>`;
  }
  return `<div class="${cls}" style="--logo-loop-duration:${speed * l}s"><div class="logo-loop-track">${sets}</div></div>`;
}

/* ------------------------------------------------------------------ */
/* Skill / tool                                                        */
/* ------------------------------------------------------------------ */

/** Một pill công cụ (skill-tool-pill). */
export function toolPill(name) {
  const src = iconUrl(name);
  const img = src
    ? `<img alt="" aria-hidden="true" loading="lazy" width="14" height="14" decoding="async" data-nimg="1" style="color:transparent" src="${src}"/>`
    : '';
  return `<span class="skill-tool-pill" title="${esc(name)}">${img}${esc(name)}</span>`;
}

/** Một thẻ kỹ năng (skill-index-card). */
export function skillCard(title, body, items, opts = {}) {
  const { reverse = false, speed = 18 } = opts;
  const tools = logoLoop(items, { reverse, speed });
  return (
    `<article class="skill-index-card"><div><h2>${esc(title)}</h2><p>${esc(body)}</p>` +
    `<div class="skill-index-tools" aria-label="${esc(title)} tools">${tools}</div></div></article>`
  );
}

/** Một nhóm công cụ (skill-tool-group). */
export function toolGroup(title, items) {
  return `<article class="skill-tool-group"><h2>${esc(title)}</h2><div>${items.map(toolPill).join('')}</div></article>`;
}

/* ------------------------------------------------------------------ */
/* Project                                                             */
/* ------------------------------------------------------------------ */

/** Lưới thông tin dự án (project-flow-grid). */
export function flowGrid(pr) {
  const type = pr.category;
  const year = pr.year;
  // React: `c.stack.slice(0,2).join(" + ") || "Web"`
  const tech = pr.stack.slice(0, 2).join(' + ') || 'Web';
  const status = pr.status;
  return (
    `<div class="project-flow-grid" aria-label="Project info">` +
    `<span><small>Type</small><strong>${esc(type)}</strong></span>` +
    `<span><small>Year</small><strong>${esc(year)}</strong></span>` +
    `<span><small>Tech</small><strong>${esc(tech)}</strong></span>` +
    `<span><small>Status</small><strong>${esc(status)}</strong></span>` +
    `</div>`
  );
}

/** Nút trong danh sách dự án (project-index-button). */
export function indexButton(project, index) {
  const aria = index === 0 ? ' aria-current="true"' : '';
  return (
    `<button${aria} class="project-index-button" type="button">` +
    `<span class="project-index-meta"><span>${esc(project.year)}</span><span>${esc(project.category)}</span></span>` +
    `<strong>${esc(project.title)}</strong><em>${esc(project.status)}</em></button>`
  );
}

/* ------------------------------------------------------------------ */
/* Project focus (khối lớn của ProjectDeck)                            */
/* ------------------------------------------------------------------ */

const SVG = {
  images:
    '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-images"><path d="M18 22H4a2 2 0 0 1-2-2V6"></path><path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"></path><circle cx="12" cy="8" r="2"></circle><rect width="16" height="16" x="6" y="2" rx="2"></rect></svg>',
  arrowUpRight:
    '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-right"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>',
  arrowUpRightLg:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-right"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>',
  arrowLeft:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>',
  arrowRight:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>',
  lock:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock-keyhole"><circle cx="12" cy="16" r="1"></circle><rect x="3" y="10" width="18" height="12" rx="2"></rect><path d="M7 10V7a5 5 0 0 1 10 0v3"></path></svg>',
  github:
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>',
};

/**
 * Khối "project-actions" (dùng ở cả project-copy và meta-card).
 * React: `<a href={githubUrl} target="_blank" rel="noreferrer"><Github size={16}/>{repo}</a>`
 * hoặc `<span><Lock size={16}/>{privateRepo}</span>`.
 */
function actionBlock(pr) {
  if (pr.githubUrl) {
    return (
      `<a href="${pr.githubUrl}" target="_blank" rel="noreferrer">` +
      `${SVG.github}Repo</a>`
    );
  }
  return `<span>${SVG.lock}Private repo</span>`;
}

/**
 * Dựng lại khối "project-focus" cho một dự án.
 * `index`/`total` là vị trí hiện tại trong bộ sưu tập.
 */
export function buildFocus(pr, index, total) {
  const gallery = pr.images.length
    ? `<button aria-label="Open ${esc(pr.title)} screenshot album" class="project-shot-main" type="button">` +
      `<img alt="${esc(pr.images[0].label)}" decoding="async" data-nimg="fill" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" src="${pr.images[0].src}"/>` +
      `<span class="project-shot-label">${SVG.images}${pr.images.length}<!-- --> image<!-- -->${pr.images.length > 1 ? 's' : ''}</span>` +
      `<span class="project-shot-open">Open${SVG.arrowUpRight}</span>` +
      (pr.images.length > 1 ? '<span aria-hidden="true" class="project-shot-stack"></span>' : '') +
      '</button>'
    : '<div class="project-shot-empty">' + SVG.images + '<span>Screenshot slot</span>' +
      `<strong>${esc(pr.title)}</strong></div>`;

  const info = flowGrid(pr);

  return (
    '<article class="project-focus" data-switch-direction="select">' +
    '<header class="project-focus-top">' +
    '<p class="mono-label">Project dossier</p>' +
    '<div class="project-focus-tools">' +
    `<span>${esc(pr.status)}</span>` +
    `<span>${pr.isPrivate ? 'Private' : 'Public'}</span>` +
    '<div class="deck-controls">' +
    `<button aria-label="Previous project" type="button">${SVG.arrowLeft}</button>` +
    `<span>Project <!-- -->${index + 1}<!-- --> of <!-- -->${total}</span>` +
    `<button aria-label="Next project" type="button">${SVG.arrowRight}</button>` +
    '</div></div></header>' +
    '<div class="project-focus-body">' +
    '<section class="project-copy">' +
    `<p class="mono-label">${esc(pr.year)}<!-- --> / <!-- -->${esc(pr.category)}</p>` +
    `<h2>${esc(pr.title)}</h2>` +
    `<section class="project-gallery" aria-label="${esc(pr.title)} screenshots">` +
    '<div class="project-gallery-head"><span class="mono-label">Screenshots</span>' +
    `<strong>${pr.images.length > 0 ? `${pr.images.length} image${pr.images.length > 1 ? 's' : ''}` : 'Waiting'}</strong></div>` +
    gallery +
    '</section>' +
    `<p class="project-description">${esc(pr.description)}</p>` +
    `<p class="project-impact">${esc(pr.impact)}</p>` +
    '<div class="project-actions project-inline-actions">' + actionBlock(pr) + '</div>' +
    '<section class="project-info-inline" aria-label="Project info">' +
    '<span class="mono-label">Project info</span>' + info +
    '</section></section>' +
    '<aside class="project-meta-panel">' +
    '<div class="project-meta-card project-status-card"><span>Progress</span>' +
    `<strong>${esc(pr.status)}</strong><small>${pr.featured ? 'Current portfolio focus' : 'Archive project'}</small></div>` +
    '<div class="project-meta-card project-meta-scope"><span>Project info</span>' + info + '</div>' +
    '<div class="project-meta-card"><span>Stack</span>' +
    `<div class="project-stack-loop">${logoLoop(pr.stack.slice(0, 12), { reverse: false, speed: 18 })}</div>` +
    '</div>' +
    '<div class="project-meta-card project-meta-card--actions"><span>Access</span>' +
    `<div class="project-actions">${actionBlock(pr)}</div></div>` +
    '</aside></div></article>'
  );
}
