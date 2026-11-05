/**
 * Dựng markup DOM cho bảng tin khách (guestbook).
 *
 * Phải khớp CHÍNH XÁC với những gì React SSR sinh ra, nếu không React sẽ báo
 * hydration mismatch. Vì vậy:
 *   - giữ nguyên cấu trúc thẻ và thứ tự thuộc tính của bản gốc;
 *   - `<time>` dùng đúng định dạng của client: `Intl.DateTimeFormat("en-GB",
 *     { day: "2-digit", hour: "2-digit", hour12: false, minute: "2-digit",
 *     month: "short", timeZone: "Asia/Bangkok", year: "numeric" })`;
 *   - `<strong>{total}<!-- --> messages</strong>` — React chèn `<!-- -->` giữa
 *     hai child liền kề, phải giữ dấu này.
 *
 * Nội dung lời ghi nằm trong `tools/data/guestbook.mjs`.
 */
import { escText } from './dom.mjs';
import { profile } from '../data/profile.mjs';
import { guestbookMessages, guestbookReplyCount, guestbookTotal } from '../data/guestbook.mjs';

const ICON_MESSAGE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';

const ICON_REPLY =
  '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-reply"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>';

/** Định dạng thời gian — phải giống hệt client. */
export function formatGuestbookDate(iso) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: 'short',
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
  }).format(new Date(iso));
}

/** Một thẻ lời ghi, kèm phần trả lời nếu có. */
export function guestbookArticle(m) {
  const head =
    '<div class="guestbook-message-head">' +
    '<div class="guestbook-message-author">' +
    `<span>${escText(m.name)}</span>` +
    `<time dateTime="${m.createdAt}">${formatGuestbookDate(m.createdAt)}</time>` +
    '</div>' +
    `<div class="guestbook-message-tools">${ICON_MESSAGE}</div>` +
    '</div>';

  const reply = m.reply
    ? '<div class="guestbook-reply">' +
      ICON_REPLY +
      '<div>' +
      '<div class="guestbook-reply-meta">' +
      `<span>${escText(profile.name)} replied</span>` +
      (m.repliedAt ? `<time dateTime="${m.repliedAt}">${formatGuestbookDate(m.repliedAt)}</time>` : '') +
      '</div>' +
      `<p>${escText(m.reply)}</p>` +
      '</div>' +
      '</div>'
    : '';

  return (
    `<article class="guestbook-message" id="message-${m.id}">` +
    head +
    `<p>${escText(m.message)}</p>` +
    reply +
    '</article>'
  );
}

/**
 * Khối cuối bảng.
 *
 * Client tính `hasMore = messages.length < total`:
 *   - có thêm lời ghi  -> "Scroll to load more"
 *   - đã hết          -> "End of messages"
 * Site tĩnh không có API `/api/guestbook`, nên `total` luôn bằng số lời ghi
 * đang hiển thị và bảng kết thúc bằng "End of messages" — không gọi API nào.
 */
export function guestbookListHtml() {
  const hasMore = guestbookMessages.length < guestbookTotal;
  const tail = hasMore
    ? '<span class="mono-label">Scroll to load more</span>'
    : '<span class="mono-label">End of messages</span>';
  return (
    '<div class="guestbook-list" id="messages">' +
    guestbookMessages.map(guestbookArticle).join('') +
    '<div aria-live="polite" class="guestbook-load-more">' +
    tail +
    '</div>' +
    '</div>'
  );
}

/** Đầu bảng: số lời ghi và số phần trả lời. */
export function guestbookFeedHeadHtml() {
  return (
    '<header class="guestbook-feed-head">' +
    '<div>' +
    '<span class="mono-label">Message board</span>' +
    `<strong>${guestbookTotal}<!-- --> messages</strong>` +
    '</div>' +
    '<div>' +
    '<span class="mono-label">Replies</span>' +
    `<strong>${guestbookReplyCount}</strong>` +
    '</div>' +
    '</header>'
  );
}
