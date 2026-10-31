/**
 * Dựng lại các khối DOM cho nội dung mới, dùng nguyên cấu trúc gốc.
 */
import { iconUrl } from './icons.mjs';
import { esc } from './dom.mjs';

/** Một item logo-loop (icon + tên). */
export function logoLoopItem(name) {
  const src = iconUrl(name);
  const mark = src
    ? `<img alt="" aria-hidden="true" loading="lazy" width="18" height="18" decoding="async" data-nimg="1" style="color:transparent" src="${src}"/>`
    : '';
  return `<span class="logo-loop-item" title="${esc(name)}"><span class="logo-loop-mark">${mark}</span><span class="logo-loop-name">${esc(name)}</span></span>`;
}

/**
 * Vòng logo đầy đủ: LogoLoop render l*n bản sao với l = f(count)
 * (count<=2 -> 16, <=4 -> 12, <=6 -> 8, else 6).
 */
export function logoLoop(items, opts = {}) {
  const { reverse = false, speed = 18 } = opts;
  const list = items.filter(n => n && n.trim().length > 0);
  if (!list.length) return '';
  const l = list.length <= 2 ? 16 : list.length <= 4 ? 12 : list.length <= 6 ? 8 : 6;
  const cls = reverse ? 'logo-loop logo-loop--reverse' : 'logo-loop';
  const groupItems = () => list.map(name => logoLoopItem(name)).join('');
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

/** Lưới thông tin dự án (project-flow-grid). */
export function flowGrid(type, year, tech, status) {
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
