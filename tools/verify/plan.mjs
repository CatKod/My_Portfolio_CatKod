/**
 * Sinh nội dung mới cho từng trang, dựa trên DOM gốc làm mẫu.
 * Mỗi hàm trả về mảng các cặp [mẫuCũ, mới] để áp dụng lên cả DOM và flight.
 */

/** Thay thế text node đầu tiên bên trong phần tử có class. */
function innerText(el, cls, newText) {
  const re = new RegExp('(<' + cls + '[^>]*>)([^<]*)(</)');
  return el.replace(re, (m, open, _old, close) => open + newText + close);
}

/**
 * Trang chủ: hero, capability map.
 */
export function homePlan() {
  const plan = [];

  // Hero: label
  plan.push([
    '<p class="mono-label">Portfolio 2026 / web + automation + AI + GIS</p>',
    '<p class="mono-label">Portfolio 2026 / firmware + IoT + edge AI</p>',
  ]);
  // Hero: tên
  plan.push(['<h1>Irfan Sabrian</h1>', '<h1>Hoàng Kim Vĩnh</h1>']);
  // Hero: rotating words
  plan.push([
    '["full-stack web apps","automation systems","AI workflows","GIS platforms"]',
    '["production firmware","CAN bus systems","state machines","edge AI on MCU"]',
  ]);
  // Hero: câu giới thiệu
  plan.push([
    'I build full-stack web products from interface to database, then add automation, AI, data, or GIS when needed.',
    'I write production firmware for commercial DC fast-charging stations — CAN bus, MISRA C compliance, non-blocking state machines on STM32H7 — and build complete IoT products from PCB to mobile app.',
  ]);

  // Capability map: 4 thẻ
  plan.push([
    '<article class="home-capability-card"><span class="home-capability-card">Web core</span>',
    '<article class="home-capability-card"><span>Firmware core</span>',
  ]);

  return plan;
}
