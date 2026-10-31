/**
 * Rebrand site tĩnh (export từ Next.js) từ Irfan Sabrian sang Hoàng Kim Vĩnh.
 *
 * Nguyên tắc bất di bất dịch: HTML render sẵn (SSR DOM) và RSC flight payload
 * phải mô tả CÙNG một cây component. Nếu chỉ sửa một bên, React sẽ báo
 * hydration mismatch. Vì vậy mọi khối nội dung động đều được sinh từ cùng
 * một nguồn dữ liệu trong `profile.mjs`.
 *
 * Script luôn đọc từ `site.orig.bak/` nên chạy lại nhiều lần cho kết quả
 * giống nhau.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join as joinPath } from 'node:path';
import { writeFileSafe } from './writeSafe.mjs';
import { splitFile, joinFile } from './flight.mjs';
import { replaceNodeChildren, spanOfArray } from './flightNode.mjs';
import { elementsByClass, esc } from './dom.mjs';
import { logoLoop, skillCard, toolGroup, flowGrid, indexButton, buildFocus } from './build.mjs';
import { skillCardFlight, toolGroupFlight, proofGridChildren } from './skillsFlight.mjs';
import { buildPanel } from './calendarDom.mjs';
import { COMMON } from './common.mjs';
import { SOCIALS, SOCIALS_JS } from './socials.mjs';
import {
  LOGO_VIEWBOX, ckSvgDom, ckChildrenFlight, ckChildrenJs, originalLogoChildrenJs,
  LOGO_SVG_DOM_RE, LOGO_SVG_FLIGHT_MARKER,
} from './logo.mjs';
import {
  profile, hero, capabilities, about, aboutHeading, workHistory, education,
  projects, skillGroups, skillTools, skillsHero, credentials, credentialStats,
  credentialHeading, credentialRoles, contact,
} from './profile.mjs';

/** Đường dẫn nguồn (bản gốc) và đích (site phục vụ). */
const ROUTES = {
  '/': ['site.orig.bak/index.html', 'site/index.html'],
  '/about': ['site.orig.bak/about', 'site/about'],
  '/work': ['site.orig.bak/work', 'site/work'],
  '/skills': ['site.orig.bak/skills', 'site/skills'],
  '/credentials': ['site.orig.bak/credentials', 'site/credentials'],
  '/guestbook': ['site.orig.bak/guestbook', 'site/guestbook'],
  '/contact': ['site.orig.bak/contact', 'site/contact'],
};

/* ------------------------------------------------------------------ */
/* Tiện ích                                                            */
/* ------------------------------------------------------------------ */

/** Thay chuỗi trong mọi part (DOM và flight). */
function replaceAll(parts, table) {
  return parts.map((p) => {
    let t = p.text;
    for (const [from, to] of table) {
      if (from) t = t.split(from).join(to);
    }
    return { ...p, text: t };
  });
}

/**
 * Thay phần tử DOM theo class.
 * `build(el, index)` trả về HTML mới (null = giữ nguyên).
 */
function replaceByClass(parts, className, build) {
  return parts.map((p) => {
    if (p.kind !== 'raw') return p;
    const els = elementsByClass(p.text, className);
    if (!els.length) return p;
    let text = p.text;
    // thay từ cuối về đầu để chỉ số không đổi
    for (let i = els.length - 1; i >= 0; i--) {
      const next = build(els[i], i);
      if (next != null) text = text.replace(els[i], next);
    }
    return { ...p, text };
  });
}

/**
 * Thay mảng JSON trong flight (tìm theo key kèm dấu `":[`).
 * `key` là tên thuộc tính, ví dụ `'projects'` -> needle `"projects":[`.
 */
function replaceFlightArray(parts, key, value) {
  const needle = `"${key}":[`;
  return parts.map((p) => {
    if (p.kind === 'raw') return p;
    const i = p.text.indexOf(needle);
    if (i < 0) return p;
    const span = spanOfArray(p.text, i + needle.length - 1);
    if (!span) return p;
    const arr = JSON.stringify(value);
    return { ...p, text: p.text.slice(0, span.start) + arr + p.text.slice(span.end) };
  });
}

/**
 * Thay một tham chiếu flight (ví dụ `"$L26"`) bằng chuỗi khác.
 */
function replaceFlightRefs(parts, ref, replacement) {
  return parts.map((p) => {
    if (p.kind === 'raw') return p;
    return { ...p, text: p.text.split(ref).join(replacement) };
  });
}

/**
 * Bỏ một phần tử mảng flight (ví dụ `"$L26"`) kèm dấu phẩy đi kèm.
 */
function dropFlightElement(parts, ref) {
  return parts.map((p) => {
    if (p.kind === 'raw') return p;
    let t = p.text;
    // dạng [.. ,"$L26",..] -> bỏ ",$L26"
    t = t.split(',' + ref).join('');
    // dạng ["$L26",..] -> bỏ "$L26", ; nếu đứng cuối thì bỏ ",$L26"
    t = t.split(ref + ',').join('');
    t = t.split(ref).join('');
    return { ...p, text: t };
  });
}

/**
 * Xoá các dòng flight có id thoả điều kiện.
 */
function dropFlightLines(parts, predicate) {
  const out = [];
  for (const p of parts) {
    if (p.kind !== 'flight') {
      out.push(p);
      continue;
    }
    const lines = p.text.split('\n');
    const kept = lines.filter((ln) => {
      if (ln === '') return false;
      const ci = ln.indexOf(':');
      if (ci < 0) return true;
      return !predicate(ln.slice(0, ci));
    });
    if (kept.length === 0) {
      // Block rỗng sẽ thành push([1,"\n"]) -> React báo "Connection closed."
      // -> đánh dấu để bước ghi file loại luôn cả thẻ <script> bao quanh.
      out.push({ ...p, text: '', dropEmpty: true });
      continue;
    }
    const trailing = p.text.endsWith('\n');
    out.push({ ...p, text: kept.join('\n') + (trailing ? '\n' : '') });
  }
  return out;
}

/** Thay `children` của mọi node có `className` khớp trong flight. */
function replaceFlightChildren(parts, className, build) {
  return replaceNodeChildren(parts, className, build);
}

/**
 * Gộp parts ra HTML, loại bỏ các block flight rỗng kèm thẻ `<script>`.
 *
 * HTML xen kẽ `<script>self.__next_f.push([1,"..."])</script>`. Khi một block
 * flight bị xoá hết dòng, nếu chỉ thay payload mà giữ thẻ script thì sẽ còn
 * `self.__next_f.push([1,"\n"])`. React đọc đó là payload bị cắt dở và ném lỗi
 * "Connection closed." khiến cả trang trắng. Vì vậy phải bỏ trọn thẻ script.
 */
function joinParts(parts) {
  let out = '';
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p.kind === 'raw') {
      out += p.text;
      continue;
    }
    if (p.dropEmpty || p.text.trim() === '') {
      out = out.replace(/<script>\s*$/, '');
      const next = parts[i + 1];
      if (next && next.kind === 'raw' && next.text.startsWith('</script>')) {
        next.text = next.text.slice('</script>'.length);
      }
      continue;
    }
    out += 'self.__next_f.push([1,' + JSON.stringify(p.text) + '])';
  }
  return out;
}

/**
 * Thay logo "IS" (bản gốc) bằng monogram "CK".
 *
 * Logo xuất hiện ở 3 nơi, mỗi nơi một dạng markup khác nhau:
 *  - DOM header:   <svg aria-hidden="true" class="h-8 w-8" viewBox="0 0 304.95 285.2">
 *  - DOM mobile:   <svg aria-hidden="true" class="h-9 w-9" viewBox="0 0 304.95 285.2">
 *  - Flight:       node ["$","svg",null,{"aria-hidden":"true","className":"h-8 w-8",...
 *  - Client bundle: function l({className:e}){...}
 */
function replaceLogo(parts) {
  // --- DOM ---
  parts = parts.map((p) => {
    if (p.kind !== 'raw') return p;
    return {
      ...p,
      text: p.text.replace(LOGO_SVG_DOM_RE, (m) => {
        const cls = /class="([^"]+)"/.exec(m)[1];
        return ckSvgDom(cls);
      }),
    };
  });

  // --- flight ---
  parts = parts.map((p) => {
    if (p.kind !== 'flight') return p;
    let t = p.text;
    let from = 0;
    while (true) {
      const i = t.indexOf(LOGO_SVG_FLIGHT_MARKER, from);
      if (i < 0) break;
      const open = i + LOGO_SVG_FLIGHT_MARKER.length - 1;
      const span = spanOfArray(t, open);
      if (!span) break;
      const newChildren = ckChildrenFlight();
      t = t.slice(0, span.start) + newChildren + t.slice(span.end);
      from = span.start + newChildren.length;
    }
    return { ...p, text: t };
  });

  return parts;
}

/**
 * Thay nút mạng xã hội Instagram (bản gốc) bằng Facebook.
 * Áp dụng đồng thời cho DOM và flight để hai bên luôn khớp nhau.
 */
function replaceSocials(parts) {
  return replaceAll(parts, SOCIALS);
}

/** Icon SVG dạng node flight (dùng cho các node render server-side). */
function flightIcon(kind) {
  const spec = {
    ruler: {
      cls: 'lucide lucide-ruler',
      size: 17,
      nodes: [
        ['path', 'M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z'],
        ['path', 'm14.5 12.5 2-2'],
        ['path', 'm11.5 9.5 2-2'],
        ['path', 'm8.5 6.5 2-2'],
        ['path', 'm17.5 15.5 2-2'],
      ],
    },
    mapPinned: {
      cls: 'lucide lucide-map-pinned',
      size: 17,
      nodes: [
        ['path', 'M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0'],
        ['circle', 'M12 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0'],
        ['path', 'M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712'],
      ],
    },
  };
  const s = spec[kind] || spec.ruler;
  const children = s.nodes.map(([tag, attrs], i) => {
    if (tag === 'circle') return ['$', 'circle', `cat${i}`, { cx: '12', cy: '8', r: '2' }];
    return ['$', 'path', `cat${i}`, { d: attrs }];
  });
  return [
    '$',
    'svg',
    null,
    {
      ref: '$undefined',
      xmlns: 'http://www.w3.org/2000/svg',
      width: s.size,
      height: s.size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      className: s.cls,
      children: [...children, '$undefined'],
    },
  ];
}

/** Icon SVG lớn dạng node flight (18px) cho trang contact. */
function flightIconBig(kind) {
  const spec = {
    mail: {
      cls: 'lucide lucide-mail',
      nodes: [
        ['rect', 'r1', { width: '20', height: '16', x: '2', y: '4', rx: '2' }],
        ['path', 'r2', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' }],
      ],
    },
    phone: {
      cls: 'lucide lucide-phone',
      nodes: [
        [
          'path',
          'r1',
          {
            d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
          },
        ],
      ],
    },
    mapPinned: {
      cls: 'lucide lucide-map-pinned',
      nodes: [
        [
          'path',
          'r1',
          {
            d: 'M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0',
          },
        ],
        ['circle', 'r2', { cx: '12', cy: '8', r: '2' }],
        [
          'path',
          'r3',
          {
            d: 'M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712',
          },
        ],
      ],
    },
  };
  const s = spec[kind] || spec.mail;
  const children = s.nodes.map(([tag, key, attrs]) => ['$', tag, key, attrs]);
  return [
    '$',
    'svg',
    null,
    {
      ref: '$undefined',
      xmlns: 'http://www.w3.org/2000/svg',
      width: 18,
      height: 18,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      className: s.cls,
      children: [...children, '$undefined'],
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Trang chủ                                                           */
/* ------------------------------------------------------------------ */

function doHome(parts) {
  parts = replaceAll(parts, COMMON);

  // Tiêu đề + nhãn + từ khóa xoay
  parts = replaceAll(parts, [
    ['Portfolio 2026 / web + automation + AI + GIS', hero.label],
    [
      '["full-stack web apps","automation systems","AI workflows","GIS platforms"]',
      JSON.stringify(hero.rotatingWords),
    ],
    [
      'I build full-stack web products from interface to database, then add automation, AI, data, or GIS when needed.',
      hero.copy,
    ],
  ]);

  // Bốn thẻ capability (DOM)
  parts = replaceByClass(parts, 'home-capability-card', (el, i) => {
    const n = capabilities[i];
    if (!n) return null;
    return (
      '<article class="home-capability-card">' +
      `<span>${esc(n.kicker)}</span>` +
      `<h2>${esc(n.title)}</h2>` +
      `<p>${esc(n.body)}</p>` +
      '</article>'
    );
  });

  // Từ khoá xoay: DOM render sẵn có aria-label + các từ rời rạc,
  // trong khi flight chỉ truyền mảng "words". Cả hai phải cùng dữ liệu.
  const firstPhrase = hero.rotatingWords[0];
  const wordSpans = firstPhrase
    .split(' ')
    .map((w) => `<span class="rotating-text-word" data-rotating-word="true">${esc(w)}</span>`)
    .join('');
  parts = replaceByClass(parts, 'rotating-text', () =>
    '<span aria-label="' + esc(firstPhrase) + '" class="rotating-text" role="text">' +
    '<span class="rotating-text-window"><span class="rotating-text-phrase">' +
    wordSpans +
    '</span></span></span>',
  );

  // Bốn thẻ capability (flight)
  const oldCards = [
    ['Web core', 'Full-stack products', 'Interfaces, backend logic, databases, dashboards, admin flows, and deployment.'],
    ['Automation', 'Workflow systems', 'Manual routines become document flows, data sync, integrations, and local tools.'],
    ['AI layer', 'Assisted pipelines', 'Parsing, drafting, search, agents, and checks around real project data.'],
    ['GIS layer', 'Map-based systems', 'Maps, spatial data, GeoJSON/PostGIS flows, and location-based dashboards.'],
  ];
  for (let i = 0; i < capabilities.length; i++) {
    const n = capabilities[i];
    const o = oldCards[i];
    parts = replaceAll(parts, [
      [`"children":"${o[0]}"`, `"children":"${n.kicker}"`],
      [`"children":"${o[1]}"`, `"children":"${n.title}"`],
      [`"children":"${o[2]}"`, `"children":"${n.body}"`],
    ]);
  }

  // Đường dẫn CV đã được xử lý trong COMMON (đứng trước thay thế tên).

  return parts;
}

/* ------------------------------------------------------------------ */
/* Trang About                                                          */
/* ------------------------------------------------------------------ */

function doAbout(parts, calendar) {
  // Calendar GitHub: thay TRƯỚC khi áp COMMON, vì COMMON sẽ đổi "Irfan" ->
  // tên và làm mất các chuỗi gốc cần khớp ("login", "profileUrl").
  if (calendar) {
    parts = replaceAll(parts, [
      ['"login":"IrfanSabrian"', `"login":"${profile.handle}"`],
      [`"totalContributions":885`, `"totalContributions":${calendar.totalContributions}`],
      ['"profileUrl":"https://github.com/IrfanSabrian"', `"profileUrl":"${profile.links.github}"`],
    ]);
    parts = replaceFlightArray(parts, 'weeks', calendar.weeks);
    parts = replaceByClass(parts, 'contribution-panel', () => buildPanel(calendar));
  }

  parts = replaceAll(parts, COMMON);

  parts = replaceAll(parts, [
    ['Full-stack web products, automation, AI workflows, and GIS systems.', aboutHeading],
    ['Full-stack web developer.', about.direction],
    [
      'I build full-stack web products from interface to database, then add automation, AI, data, or GIS when needed.',
      about.copy,
    ],
  ]);

  // Lịch sử công việc + học vấn (DOM): 2 cột history-list
  parts = replaceByClass(parts, 'history-list', (el, listIndex) => {
    const items = listIndex === 0 ? workHistory : education;
    const old = [...el.matchAll(/<article data-history-item="true">[\s\S]*?<\/article>/g)];
    if (!old.length) return null;
    const arts = items.map(
      (n) =>
        '<article data-history-item="true">' +
        `<span>${esc(n.year)}</span>` +
        `<h2>${esc(n.title)}</h2>` +
        `<strong>${esc(n.org)}</strong>` +
        `<p>${esc(n.body)}</p>` +
        '</article>',
    );
    // Thay từ cuối về đầu; mục cũ dư thì xoá hẳn, mục mới dư thì chèn vào.
    let out = el;
    for (let i = old.length - 1; i >= 0; i--) {
      const art = arts[i];
      out = art ? out.replace(old[i][0], art) : out.replace(old[i][0], '');
    }
    if (arts.length > old.length) {
      const extra = arts.slice(old.length).join('');
      out = out.replace('</div></div></div>', `${extra}</div></div></div>`);
    }
    return out;
  });

  // Lịch sử (flight): thay children của từng node "history-list"
  parts = replaceFlightChildren(parts, 'history-list', (i) => {
    const items = i === 0 ? workHistory : education;
    return JSON.stringify(
      items.map((n) => [
        '$',
        'article',
        `${n.year}-${n.title}`,
        {
          'data-history-item': true,
          children: [
            ['$', 'span', null, { children: n.year }],
            ['$', 'h2', null, { children: n.title }],
            ['$', 'strong', null, { children: n.org }],
            ['$', 'p', null, { children: n.body }],
          ],
        },
      ]),
    );
  });

  return parts;
}

/* ------------------------------------------------------------------ */
/* Trang Work                                                           */
/* ------------------------------------------------------------------ */

function doWork(parts) {
  parts = replaceAll(parts, COMMON);

  // Danh sách dự án (DOM)
  parts = replaceByClass(parts, 'project-index-list', () =>
    `<div class="project-index-list">${projects.map((pr, i) => indexButton(pr, i)).join('')}</div>`,
  );
  parts = replaceByClass(parts, 'project-index-head', (el) =>
    el.replace(/<strong>[^<]*<\/strong>/, `<strong>${projects.length} projects</strong>`),
  );

  // Focus của dự án đầu tiên (DOM) — khớp ProjectDeck client component
  parts = replaceByClass(parts, 'project-focus', () =>
    buildFocus(projects[0], 0, projects.length),
  );

  // Flight: thay mảng projects
  parts = replaceFlightArray(parts, 'projects', projects.map(projectPayload));
  parts = replaceAll(parts, [['"17 projects"', `"${projects.length} projects"`]]);

  return parts;
}

/** Payload flight của một dự án (đúng key của ProjectDeck). */
function projectPayload(pr) {
  return {
    slug: pr.slug,
    title: pr.title,
    year: pr.year,
    category: pr.category,
    description: pr.description,
    impact: pr.impact,
    stack: pr.stack,
    status: pr.status,
    githubUrl: pr.githubUrl,
    liveUrl: pr.liveUrl,
    image: null,
    images: pr.images,
    isPrivate: pr.isPrivate,
    featured: pr.featured,
  };
}

/* ------------------------------------------------------------------ */
/* Trang Skills                                                         */
/* ------------------------------------------------------------------ */

function doSkills(parts) {
  parts = replaceAll(parts, COMMON);

  // Hero
  parts = replaceAll(parts, [
    [
      'Full-stack web developer for web systems, automation, AI workflows, GIS, and data products.',
      skillsHero.heading,
    ],
    [
      'I build the technical product first, then support it with clear visuals, cost documents, planning, and handoff materials when the project needs them.',
      skillsHero.copy,
    ],
  ]);

  // Proof grid
  parts = replaceByClass(parts, 'skill-proof-grid', () => {
    const spans = skillsHero.proof
      .map((p) => `<span><small>${esc(p.label)}</small><strong>${esc(p.value)}</strong></span>`)
      .join('');
    return `<div class="skill-proof-grid" aria-label="Skill evidence">${spans}</div>`;
  });

  // Sáu thẻ kỹ năng
  parts = replaceByClass(parts, 'skill-index-card', (el, i) => {
    const g = skillGroups[i];
    if (!g) return null;
    return skillCard(g.title, g.body, g.items, { reverse: i % 2 === 1, speed: 18 });
  });

  // Bốn nhóm công cụ
  parts = replaceByClass(parts, 'skill-tool-group', (el, i) => {
    const g = skillTools[i];
    if (!g) return null;
    return toolGroup(g.title, g.items);
  });

  // Flight: dựng lại cây component cho từng khối để khớp với DOM.
  //
  // Bản gốc tách phần lớn nội dung ra các dòng flight riêng ($L24..$L28,
  // $L2f) và dùng chúng làm `children` của các node. Ta dựng thẳng cây đầy
  // đủ để DOM và flight cùng mô tả một component tree, rồi bỏ các dòng
  // không còn được tham chiếu.
  parts = replaceFlightChildren(parts, 'skill-tool-panel', () =>
    JSON.stringify([
      [
        '$',
        'div',
        null,
        {
          className: 'skill-tool-head',
          children: [
            ['$', 'span', null, { className: 'mono-label', children: 'Project delivery' }],
            ['$', 'strong', null, { children: 'Design / docs / costing' }],
          ],
        },
      ],
      [
        '$',
        'div',
        null,
        {
          className: 'skill-tool-groups',
          children: skillTools.map((g) => toolGroupFlight(g)),
        },
      ],
    ]),
  );

  parts = replaceFlightChildren(parts, 'skill-index-panel', () =>
    JSON.stringify(
      skillGroups.map((g, i) => skillCardFlight(g, i % 2 === 1)),
    ),
  );

  parts = replaceFlightChildren(parts, 'skill-proof-grid', () =>
    JSON.stringify(proofGridChildren(skillsHero.proof)),
  );

  // Các dòng flight cũ (nội dung web stack) không còn được tham chiếu.
  parts = dropFlightLines(parts, (id) =>
    ['24', '25', '26', '27', '28', '2f'].includes(id),
  );

  return parts;
}

/* ------------------------------------------------------------------ */
/* Trang Credentials                                                    */
/* ------------------------------------------------------------------ */

const ICON_FILE_SEARCH =
  '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-search"><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M4.268 21a2 2 0 0 0 1.727 1H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3"></path><path d="m9 18-1.5-1.5"></path><circle cx="5" cy="14" r="3"></circle></svg>';

const ICON_RULER =
  '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ruler"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"></path><path d="m14.5 12.5 2-2"></path><path d="m11.5 9.5 2-2"></path><path d="m8.5 6.5 2-2"></path><path d="m17.5 15.5 2-2"></path></svg>';

const ICON_MAP_PINNED =
  '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pinned"><path d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0"></path><circle cx="12" cy="8" r="2"></circle><path d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712"></path></svg>';

function doCredentials(parts) {
  parts = replaceAll(parts, COMMON);

  parts = replaceAll(parts, [
    ['Credentials / PDF archive', credentialHeading.label],
    ['Credentials, certificates, and field records.', credentialHeading.title],
    ['Study, competence, internship, and field records.', credentialHeading.setTitle],
    [
      'A selected archive of certificates, competence records, and SK selesai kerja from CV Karya Profesional Nusantara.',
      credentialHeading.setCopy,
    ],
  ]);

  // Thống kê (DOM)
  parts = replaceByClass(parts, 'credential-stat-grid', () => {
    const spans = credentialStats
      .map((s) => `<span><small>${esc(s.label)}</small><strong>${esc(s.value)}</strong></span>`)
      .join('');
    return `<div class="credential-stat-grid" aria-label="Credential summary">${spans}</div>`;
  });

  // Bốn chứng chỉ (DOM) — khớp đúng cấu trúc của component CredentialPreviewCard.
  //
  // Bản gốc mở modal PDF.js. Hoàng Kim Vĩnh không có file PDF chứng chỉ, chỉ có
  // link verify công khai, nên card render thành thẻ <a> mở link ra ngoài.
  // Client bundle (tools/patchCredLink.mjs) được patch theo đúng nhánh này.
  parts = replaceByClass(parts, 'credential-certificate-list', () => {
    const cards = credentials
      .map(
        (c) =>
          `<a aria-label="Open credential: ${esc(c.title)}" class="credential-preview-card credential-certificate-card" href="${esc(c.href)}" rel="noreferrer" target="_blank">` +
          `<div class="credential-card-topline"><span>${esc(c.code)}</span><small>Open credential${ICON_FILE_SEARCH}</small></div>` +
          `<div class="credential-thumb" aria-hidden="true"><img alt="" loading="lazy" decoding="async" data-nimg="fill" style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" src="${c.image}"/></div>` +
          `<div class="credential-card-copy"><span>${esc(c.label)}</span><strong>${esc(c.title)}</strong><p>${esc(c.issuer)}</p></div>` +
          '</a>',
      )
      .join('');
    return `<div class="credential-certificate-list">${cards}</div>`;
  });

  // Vai trò (DOM)
  parts = replaceByClass(parts, 'credential-role-grid', () => {
    const icons = [ICON_RULER, ICON_MAP_PINNED];
    const arts = credentialRoles
      .map(
        (r, i) =>
          `<article><span>${icons[i] || icons[0]}${esc(r.label)}</span><h2>${esc(r.title)}</h2><p>${esc(r.body)}</p></article>`,
      )
      .join('');
    return `<div class="credential-role-grid">${arts}</div>`;
  });

  // Bỏ panel "SK selesai kerja" (DOM)
  parts = replaceByClass(parts, 'credential-letter-panel', () => '');

  // Flight: thống kê
  parts = replaceFlightChildren(parts, 'credential-stat-grid', () =>
    JSON.stringify(
      credentialStats.map((s) => [
        '$',
        'span',
        s.label,
        {
          children: [
            ['$', 'small', null, { children: s.label }],
            ['$', 'strong', null, { children: s.value }],
          ],
        },
      ]),
    ),
  );

  // Flight: danh sách chứng chỉ
  parts = replaceFlightChildren(parts, 'credential-certificate-list', () =>
    JSON.stringify(
      credentials.map((c) => [
        '$',
        '$L23',
        c.code,
        {
          record: {
            code: c.code,
            label: c.label,
            title: c.title,
            issuer: c.issuer,
            summary: c.summary,
            href: c.href,
            image: c.image,
          },
        },
      ]),
    ),
  );

  // Flight: vai trò
  parts = replaceFlightChildren(parts, 'credential-role-grid', () =>
    JSON.stringify(
      credentialRoles.map((r, i) => [
        '$',
        'article',
        r.title,
        {
          children: [
            ['$', 'span', null, { children: [flightIcon(i === 0 ? 'ruler' : 'mapPinned'), r.label] }],
            ['$', 'h2', null, { children: r.title }],
            ['$', 'p', null, { children: r.body }],
          ],
        },
      ]),
    ),
  );

  // Flight: xoá panel "SK selesai kerja" (node cha + chunk định nghĩa)
  parts = replaceFlightChildren(parts, 'credential-letter-panel', () => '[]');
  parts = dropFlightElement(parts, '"$L26"');
  // các chunk định nghĩa cho chứng chỉ / thư hoàn thành công việc không còn
  // được tham chiếu -> phải xoá luôn để không dư nội dung cũ
  parts = dropFlightLines(parts, (id) =>
    ['26', '24', '2a', '2b', '2c', '2d'].includes(id),
  );

  return parts;
}

/* ------------------------------------------------------------------ */
/* Trang Guestbook                                                      */
/* ------------------------------------------------------------------ */

function doGuestbook(parts) {
  parts = replaceAll(parts, COMMON);
  return parts;
}

/* ------------------------------------------------------------------ */
/* Trang Contact                                                        */
/* ------------------------------------------------------------------ */

const ICON_MAIL =
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>';

const ICON_PHONE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>';

const ICON_MAP_PINNED_LG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pinned"><path d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0"></path><circle cx="12" cy="8" r="2"></circle><path d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712"></path></svg>';

function doContact(parts) {
  parts = replaceAll(parts, COMMON);

  // Tiêu đề
  parts = replaceAll(parts, [["Let's build something sharper.", contact.title]]);

  // Lưu ý: khối `contact-panel` của bản gốc chứa 3 liên hệ + `contact-socials`
  // (GitHub / LinkedIn / Facebook / Discord). Giá trị bên trong đã được COMMON
  // thay sẵn (email, tel, maps, địa điểm) nên không cần dựng lại markup —
  // dựng lại sẽ làm mất `contact-socials` và gây lệch với flight payload.

  return parts;
}

/* ------------------------------------------------------------------ */
/* Client bundles (JS)                                                  */
/* ------------------------------------------------------------------ */

/**
 * Thay thế chuỗi trong các chunk JS của Next.js.
 * Nội dung này chạy ở client nên phải khớp với DOM/flight đã đổi.
 */
function rebrandChunks() {
  const dir = 'site/_next/static/chunks';
  if (!existsSync(dir)) return;
  const files = readdirSync(dir).filter((f) => f.endsWith('.js'));
  const table = [
    ['Loading Irfan Sabrian portfolio', `Loading ${profile.name} portfolio`],
    ['Irfan Sabrian / 2026', `${profile.name} / 2026`],
    ['Irfan replied', `${profile.name} replied`],
    ['title:"Irfan Sabrian"', `title:"${profile.name}"`],
    ['irfan-portfolio-google-language', 'catkod-portfolio-google-language'],
    ['irfan-portfolio-loader-complete-v7', 'catkod-portfolio-loader-complete-v7'],
    // Ngôn ngữ: bỏ "Indonesia" khỏi danh sách Google Translate
    ['{code:"id",label:"Indonesia"},', ''],
    ['Irfan Sabrian', profile.name],
    ['Irfan', profile.name],
    // Logo "IS" -> monogram "CK"
    [
      `function l({className:e}){return(0,t.jsxs)("svg",{"aria-hidden":"true",className:e,viewBox:"${LOGO_VIEWBOX}",xmlns:"http://www.w3.org/2000/svg",children:[${originalLogoChildrenJs('(0,t.jsx)')}]})}`,
      `function l({className:e}){return(0,t.jsxs)("svg",{"aria-hidden":"true",className:e,viewBox:"${LOGO_VIEWBOX}",xmlns:"http://www.w3.org/2000/svg",children:[${ckChildrenJs('(0,t.jsx)')}]})}`,
    ],
    // Nút mạng xã hội Instagram -> Facebook
    ...SOCIALS_JS,
  ];
  for (const file of files) {
    const p = joinPath(dir, file);
    const src = readFileSync(p, 'utf8');
    let out = src;
    for (const [from, to] of table) {
      if (from) out = out.split(from).join(to);
    }
    if (out !== src) {
      writeFileSafe(p, out);
      console.log('chunk', file, src.length, '->', out.length);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Chạy                                                                 */
/* ------------------------------------------------------------------ */

const calendarJson = process.argv[2]
  ? JSON.parse(readFileSync(process.argv[2], 'utf8'))
  : null;

const handlers = {
  '/': doHome,
  '/about': (p) => doAbout(p, calendarJson),
  '/work': doWork,
  '/skills': doSkills,
  '/credentials': doCredentials,
  '/guestbook': doGuestbook,
  '/contact': doContact,
};

rebrandChunks();

for (const [route, [src, dst]] of Object.entries(ROUTES)) {
  const before = readFileSync(src, 'utf8').length;
  let parts = handlers[route](splitFile(readFileSync(src, 'utf8')));
  // Logo + nút mạng xã hội: giống nhau trên mọi trang
  parts = replaceSocials(parts);
  parts = replaceLogo(parts);
  const out = joinParts(parts);
  writeFileSafe(dst, out);
  console.log(route.padEnd(13), before, '->', out.length);
}
