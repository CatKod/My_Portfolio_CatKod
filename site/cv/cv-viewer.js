/**
 * Trình xem CV của Hoàng Kim Vĩnh — chạy độc lập, không phụ thuộc React.
 *
 * VÌ SAO VIẾT RIÊNG BẰNG VANILLA JS?
 *   Client bundle của Next.js đã minify, vá tay rất dễ sinh lỗi cú pháp.
 *   Một lỗi cú pháp trong chunk làm HỎNG CẢ TRANG (React không hydrate được,
 *   loader không tắt, mọi nút bị chặn). Vì vậy ta chỉ vá ĐÚNG MỘT đoạn nhỏ
 *   trong bundle (nút "Open CV" bắn event), phần còn lại do file này đảm nhiệm.
 *
 * CÁCH HOẠT ĐỘNG
 *   1. `patchCvModal.mjs` đổi `onClick:()=>o(!0)` thành
 *      `onClick:()=>{window.dispatchEvent(new CustomEvent("catkod:cv-open"))}`.
 *      => React không bao giờ mở modal PDF.js nữa (state `isOpen` không đổi).
 *   2. File này nghe event `catkod:cv-open` và tự dựng modal.
 *
 * CHỌN BẢN CV THEO NGÔN NGỮ
 *   - `vi` -> bản tiếng Việt
 *   - `ja` -> bản tiếng Nhật
 *   - ngôn ngữ khác -> bản tiếng Anh (site dùng Google Translate cho các ngôn
 *     ngữ còn lại, nên CV tiếng Anh là hợp lý nhất).
 *
 *   Ngôn ngữ đang chọn của site được lưu ở localStorage key
 *   `catkod-portfolio-google-language` và cookie `googtrans=/en/<mã>`.
 *   Ta đọc cả hai, và lắng nghe event `portfolio:language-change` để bám theo.
 */
(function () {
  'use strict';

  var LANG_STORAGE_KEY = 'catkod-portfolio-google-language';
  var STYLE_STORAGE_KEY = 'catkod-cv-style';
  var OPEN_EVENT = 'catkod:cv-open';
  var LANG_CHANGE_EVENT = 'portfolio:language-change';

  var STYLES = ['classic', 'modern'];
  var STYLE_LABELS = { classic: 'Classic', modern: 'Modern' };
  var LANGS = ['en', 'vi', 'ja'];
  var LANG_LABELS = { en: 'EN', vi: 'VI', ja: 'JA' };

  /** Chiều rộng/cao của trang A4 ở 96dpi — dùng để tính tỉ lệ thu nhỏ. */
  var A_WIDTH = 794;
  var A_HEIGHT = 1123;

  var state = {
    style: 'classic',
    lang: 'en',
    open: false,
  };

  // ---------------------------------------------------------------------
  // Đọc ngôn ngữ / kiểu đang chọn
  // ---------------------------------------------------------------------

  function normalizeLang(code) {
    if (!code) return 'en';
    var base = String(code).toLowerCase().split(/[-_]/)[0];
    return LANGS.indexOf(base) !== -1 ? base : 'en';
  }

  /** Ngôn ngữ từ cookie `googtrans=/en/<mã>` (nguồn sự thật khi Google Translate chạy). */
  function langFromCookie() {
    var parts = document.cookie.split('; ');
    for (var i = 0; i < parts.length; i++) {
      if (parts[i].indexOf('googtrans=') === 0) {
        var value = parts[i].slice('googtrans='.length);
        var segments = decodeURIComponent(value).split('/');
        var last = segments[segments.length - 1];
        if (last && last !== 'en') return normalizeLang(last);
        return null;
      }
    }
    return null;
  }

  function readLang() {
    var fromCookie = langFromCookie();
    if (fromCookie) return fromCookie;
    try {
      var stored = window.localStorage.getItem(LANG_STORAGE_KEY);
      if (stored) return normalizeLang(stored);
    } catch (e) {
      /* localStorage bị chặn (private mode) -> dùng mặc định */
    }
    return 'en';
  }

  function readStyle() {
    try {
      var stored = window.localStorage.getItem(STYLE_STORAGE_KEY);
      if (stored && STYLES.indexOf(stored) !== -1) return stored;
    } catch (e) {
      /* bỏ qua */
    }
    return 'classic';
  }

  function persistStyle(style) {
    try {
      window.localStorage.setItem(STYLE_STORAGE_KEY, style);
    } catch (e) {
      /* bỏ qua */
    }
  }

  // ---------------------------------------------------------------------
  // DOM
  // ---------------------------------------------------------------------

  var el = {};

  function buildModal() {
    var backdrop = document.createElement('div');
    backdrop.className = 'cv-modal-backdrop cv-viewer-backdrop';
    backdrop.setAttribute('role', 'presentation');
    backdrop.hidden = true;

    var dialog = document.createElement('section');
    dialog.className = 'cv-modal cv-viewer-modal';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', 'CV Preview');

    var head = document.createElement('header');
    head.className = 'cv-modal-head cv-viewer-head';

    var titles = document.createElement('div');
    var label = document.createElement('span');
    label.className = 'mono-label';
    label.textContent = 'CV Preview';
    var title = document.createElement('h2');
    title.textContent = 'Hoàng Kim Vĩnh';
    titles.appendChild(label);
    titles.appendChild(title);

    var toolbar = document.createElement('div');
    toolbar.className = 'cv-viewer-toolbar';
    toolbar.setAttribute('aria-label', 'CV options');

    var styleSwitch = document.createElement('div');
    styleSwitch.className = 'cv-style-switch';
    styleSwitch.setAttribute('role', 'group');
    styleSwitch.setAttribute('aria-label', 'CV layout');
    STYLES.forEach(function (style) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'cv-style-btn';
      button.textContent = STYLE_LABELS[style];
      button.dataset.style = style;
      button.addEventListener('click', function () {
        setStyle(style);
      });
      styleSwitch.appendChild(button);
    });

    var langBadge = document.createElement('span');
    langBadge.className = 'cv-lang-badge';

    toolbar.appendChild(styleSwitch);
    toolbar.appendChild(langBadge);

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'cv-modal-close';
    close.setAttribute('aria-label', 'Close CV preview');
    close.textContent = '\u00d7';

    head.appendChild(titles);
    head.appendChild(toolbar);
    head.appendChild(close);

    var frame = document.createElement('div');
    frame.className = 'cv-modal-frame cv-viewer-frame';

    // Bọc iframe trong một hộp có chiều cao = chiều cao thật × tỉ lệ thu
    // nhỏ. Nhờ vậy iframe (đã scale) vẫn chiếm đúng vùng, không đè lên
    // nhau và modal cuộn đúng vùng.
    var stage = document.createElement('div');
    stage.className = 'cv-viewer-stage';

    var doc = document.createElement('iframe');
    doc.className = 'cv-viewer-doc';
    doc.setAttribute('title', 'CV preview');
    doc.setAttribute('scrolling', 'auto');
    stage.appendChild(doc);
    frame.appendChild(stage);

    var actions = document.createElement('footer');
    actions.className = 'cv-modal-actions';
    var download = document.createElement('a');
    download.className = 'cv-download-btn';
    download.setAttribute('download', '');
    actions.appendChild(download);

    dialog.appendChild(head);
    dialog.appendChild(frame);
    dialog.appendChild(actions);
    backdrop.appendChild(dialog);

    backdrop.addEventListener('mousedown', function (event) {
      if (event.target === backdrop) closeModal();
    });
    close.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && state.open) closeModal();
    });

    document.body.appendChild(backdrop);

    el.backdrop = backdrop;
    el.frame = frame;
    el.stage = stage;
    el.doc = doc;
    el.download = download;
    el.langBadge = langBadge;
    el.styleButtons = styleSwitch.querySelectorAll('.cv-style-btn');
  }

  // ---------------------------------------------------------------------
  // Cập nhật nội dung theo kiểu + ngôn ngữ
  // ---------------------------------------------------------------------

  function variant() {
    return state.style + '-' + state.lang;
  }

  /** Thu nhỏ CV cho vừa khung modal (trang A4 rộng 794px ở 96dpi). */
  function fit() {
    if (!el.frame || !el.doc || !el.stage) return;
    var available = el.frame.clientWidth - 24;
    if (available <= 0) return;
    var scale = Math.min(1, Math.max(0.3, available / A_WIDTH));
    // iframe giữ nguyên kích thước thật, chỉ bị transform: scale.
    el.doc.style.width = A_WIDTH + 'px';
    el.doc.style.height = A_HEIGHT + 'px';
    el.doc.style.transform = 'scale(' + scale + ')';
    el.doc.style.transformOrigin = 'top left';
    // Hộp bọc có chiều rộng/cao = kích thước thật × tỉ lệ => canh giữa
    // được và modal cuộn đúng vùng.
    el.stage.style.width = Math.round(A_WIDTH * scale) + 'px';
    el.stage.style.height = Math.round(A_HEIGHT * scale) + 'px';
  }

  function render() {
    // Modal chưa được dựng (sự kiện đổi ngôn ngữ xảy ra trước lần mở đầu
    // tiên) => chỉ cập nhật state, lần sau sẽ render lại.
    if (!el.doc) return;

    var v = variant();
    el.doc.src = '/cv/cv-' + v + '.html';
    el.download.href = '/cv/' + v + '.pdf';
    el.download.textContent = 'Download ' + state.style.toUpperCase() + ' (' + state.lang.toUpperCase() + ')';
    el.langBadge.textContent = LANG_LABELS[state.lang] || 'EN';
    Array.prototype.forEach.call(el.styleButtons, function (button) {
      var active = button.dataset.style === state.style;
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    // Đợi iframe có kích thước rồi tính lại tỉ lệ thu nhỏ.
    window.setTimeout(fit, 60);
  }

  function setStyle(style) {
    if (STYLES.indexOf(style) === -1 || style === state.style) return;
    state.style = style;
    persistStyle(style);
    render();
  }

  function setLang(lang) {
    var next = normalizeLang(lang);
    if (next === state.lang) return;
    state.lang = next;
    render();
  }

  // ---------------------------------------------------------------------
  // Mở / đóng
  // ---------------------------------------------------------------------

  function openModal() {
    if (!el.backdrop) buildModal();
    state.open = true;
    el.backdrop.hidden = false;
    el.backdrop.classList.add('is-open');
    document.body.classList.add('cv-viewer-open');
    render();
  }

  function closeModal() {
    if (!el.backdrop) return;
    state.open = false;
    el.backdrop.classList.remove('is-open');
    el.backdrop.hidden = true;
    document.body.classList.remove('cv-viewer-open');
  }

  // ---------------------------------------------------------------------
  // Khởi động
  // ---------------------------------------------------------------------

  function init() {
    state.style = readStyle();
    state.lang = readLang();

    window.addEventListener(OPEN_EVENT, openModal);
    window.addEventListener(LANG_CHANGE_EVENT, function (event) {
      if (event && event.detail && event.detail.language) setLang(event.detail.language);
    });
    window.addEventListener('resize', fit);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
