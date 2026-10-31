/**
 * Sinh flight payload (RSC) cho các khối nội dung động của trang Skills.
 *
 * Nguyên tắc: flight payload và SSR DOM phải mô tả cùng một cây component.
 * Vì vậy mọi khối ở đây được sinh từ CÙNG nguồn dữ liệu với `build.mjs`.
 */
import { iconUrl } from './icons.mjs';

/** Danh sách item cho LogoLoop (client tự fallback về chữ viết tắt nếu null). */
function loopItems(items) {
  return items.map((name) => ({ name, src: iconUrl(name) ?? null }));
}

/** Node flight cho một pill công cụ (skill-tool-pill). */
function pillNode(name) {
  const src = iconUrl(name);
  const children = src
    ? [
        [
          '$',
          '$L2d',
          null,
          {
            alt: '',
            'aria-hidden': 'true',
            height: 14,
            src,
            unoptimized: true,
            width: 14,
          },
        ],
        name,
      ]
    : [name];
  return ['$', 'span', name, { className: 'skill-tool-pill', title: name, children }];
}

/** Node flight cho một thẻ kỹ năng (skill-index-card). */
export function skillCardFlight(group, reverse) {
  return [
    '$',
    'article',
    group.title,
    {
      className: 'skill-index-card',
      children: [
        '$',
        'div',
        null,
        {
          children: [
            ['$', 'h2', null, { children: group.title }],
            ['$', 'p', null, { children: group.body }],
            [
              '$',
              'div',
              null,
              {
                className: 'skill-index-tools',
                'aria-label': `${group.title} tools`,
                children: [
                  '$',
                  '$L23',
                  null,
                  { items: loopItems(group.items), reverse, speed: 18 },
                ],
              },
            ],
          ],
        },
      ],
    },
  ];
}

/** Node flight cho một nhóm công cụ (skill-tool-group). */
export function toolGroupFlight(group) {
  return [
    '$',
    'article',
    group.title,
    {
      className: 'skill-tool-group',
      children: [
        ['$', 'h2', null, { children: group.title }],
        ['$', 'div', null, { children: group.items.map(pillNode) }],
      ],
    },
  ];
}

/** Children của proof grid. */
export function proofGridChildren(proof) {
  return proof.map((p) => [
    '$',
    'span',
    p.label,
    {
      children: [
        ['$', 'small', null, { children: p.label }],
        ['$', 'strong', null, { children: p.value }],
      ],
    },
  ]);
}
