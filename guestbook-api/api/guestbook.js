/**
 * Backend của bảng tin khách (guestbook).
 *
 * Chạy trên Vercel Serverless Function, lưu dữ liệu trong Vercel Blob.
 * Site tĩnh trên GitHub Pages không có API nên mọi lời ghi phải đi qua đây.
 *
 * Hợp đồng API (khớp với client bundle `0y7k_s2ee1078.js`):
 *   GET  /api/guestbook?limit=10&offset=0
 *        -> { messages: Message[], total: number, replyCount: number }
 *   POST /api/guestbook
 *        body: { action, name?, message?, id?, reply?, website? }
 *        -> { statusKey: string, messages: Message[], total, replyCount }
 *
 * `statusKey` là mã kết quả để client hiện thông báo đúng:
 *   sent | invalid | replied | reply-invalid
 *   | admin-required | message-deleted | reply-deleted
 */
import { get, put } from '@vercel/blob';

export const config = {
  runtime: 'nodejs',
};

/** Đường dẫn file chứa toàn bộ bảng tin trong Blob. */
const BLOB_PATH = 'guestbook.json';

/**
 * Đường dẫn file chứa khoá admin trong Blob.
 *
 * Vì sao không dùng biến môi trường `ADMIN_KEY`?
 *
 * Lý do kỹ thuật: khoá admin cần được đặt trong Vercel Dashboard, và mỗi lần
 * đổi khoá là phải sửa hạ tầng (deploy lại, xoá cache function...). Lưu khoá
 * trong Blob cho phép đổi khoá chỉ bằng cách ghi lại file, không cần deploy.
 *
 * Lý do bảo mật: file trong store `private` của Vercel Blob KHÔNG truy cập
 * được từ bên ngoài — cần đúng `BLOB_READ_WRITE_TOKEN` mới đọc được. Khoá
 * admin cũng được so sánh bằng thời gian hằng số (timing-safe) để không lộ
 * thông tin qua thời gian phản hồi.
 */
const ADMIN_KEY_PATH = 'admin-key.json';

/** Số lời ghi tối đa cho một trang. */
const PAGE_LIMIT = 100;

/**
 * Danh sách origin được phép gọi API.
 *
 * Site tĩnh nằm ở `catkod.github.io` còn API ở `*.vercel.app` nên khác
 * origin — trình duyệt bắt buộc phải có header CORS mới cho `fetch` chạy.
 *
 * Danh sách được khai báo tường minh (không dùng `*`) vì API có cả các
 * hành động admin: nếu để `*` thì bất kỳ trang nào cũng gọi được, và
 * request của trang khác sẽ mang theo cookie/header của họ.
 */
const ALLOWED_ORIGINS = [
  'https://catkod.github.io',
  'http://localhost:9310',
  'http://127.0.0.1:9310',
];

/**
 * Gắn header CORS cho response.
 *
 * `Vary: Origin` rất quan trọng: nếu không có, cache của CDN có thể trả
 * header CORS của origin đầu tiên cho mọi người khác, khiến request từ
 * origin lạ bị chặn oan.
 */
function withCors(request) {
  const origin = request.headers.get('origin');
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : null;

  const headers = {
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  };
  if (allowed) {
    headers['Access-Control-Allow-Origin'] = allowed;
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, X-Admin-Key';
    headers['Access-Control-Max-Age'] = '86400';
  }
  return headers;
}

/**
 * Chuẩn hoá lời ghi cho đúng khuôn dữ liệu client mong đợi.
 *
 * Client đọc `reply` và `repliedAt`; nếu `reply` là chuỗi rỗng thì React
 * vẫn render khối trả lời (vì điều kiện là `e.reply ? ... : null` — chuỗi rỗng
 * là falsy nên ổn, nhưng `null` rõ hơn và khớp với dữ liệu gốc).
 */
function normalizeMessage(raw) {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ''),
    message: String(raw.message ?? ''),
    reply: raw.reply ? String(raw.reply) : null,
    status: raw.status === 'hidden' ? 'hidden' : 'published',
    createdAt: String(raw.createdAt),
    repliedAt: raw.repliedAt ? String(raw.repliedAt) : null,
  };
}

/**
 * Đọc toàn bộ bảng tin từ Blob.
 *
 * Trả về `null` nếu chưa có dữ liệu (lần chạy đầu tiên, trước khi seed).
 * Không tự ghi file rỗng: nếu lỡ ghi file rỗng rồi mất, lời ghi cũ sẽ không
 * bao giờ quay lại được.
 */
async function readStore() {
  const blob = await get(BLOB_PATH, { access: 'private' }).catch(() => null);
  if (!blob) return null;

  const text = await blob.stream.text();
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed?.messages)) return null;

  return {
    messages: parsed.messages.map(normalizeMessage),
    updatedAt: parsed.updatedAt ?? null,
  };
}

/** Ghi toàn bộ bảng tin xuống Blob (ghi đè file cũ). */
async function writeStore(messages) {
  const payload = {
    updatedAt: new Date().toISOString(),
    messages: messages.map(normalizeMessage),
  };
  await put(BLOB_PATH, JSON.stringify(payload, null, 2), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

/** Lọc các lời ghi đang công khai. */
function publicMessages(messages) {
  return messages.filter((m) => m.status === 'published');
}

/** Đếm số lời ghi có phần trả lời. */
function countReplies(messages) {
  return messages.filter((m) => m.reply).length;
}

/**
 * Kiểm tra quyền admin.
 *
 * Admin mode là để Hoàng Kim Vĩnh tự trả lời / xoá lời ghi. Khoá nằm trong
 * Blob (private), client gửi kèm qua header `x-admin-key`.
 */
async function isAdmin(request) {
  const provided = request.headers.get('x-admin-key');
  if (!provided) return false;

  const blob = await get(ADMIN_KEY_PATH, { access: 'private' }).catch(() => null);
  if (!blob) return false;

  const parsed = JSON.parse(await blob.stream.text()).catch(() => null);
  const expected = parsed?.key;
  if (typeof expected !== 'string' || !expected) return false;

  // So sánh thời gian hằng số: tránh lộ khoá qua thời gian phản hồi.
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Rate limit đơn giản theo IP, dùng bộ nhớ của instance.
 *
 * Đủ để chặn script spam cơ bản. Vercel có thể khởi động lại instance giữa các
 * request nên đây KHÔNG phải rate limit chắc chắn — nhưng cộng thêm honeypot
 * và giới hạn độ dài thì chặn được phần lơn spam tự động.
 */
const RATE_LIMIT = { windowMs: 60_000, max: 5 };
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  list.push(now);
  hits.set(ip, list);

  // Dọn bản ghi cũ để bản đồ không phình vô hạn.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < RATE_LIMIT.windowMs)) hits.delete(key);
    }
  }
  return list.length > RATE_LIMIT.max;
}

/** Chuẩn hoá và kiểm tra nội dung lời ghi mới. */
function validateCreate(body) {
  const name = String(body?.name ?? '').trim();
  const message = String(body?.message ?? '').trim();

  // Giới hạn khớp với `maxLength` của input trong client (name 56, message 680).
  if (!name || !message) return { error: 'invalid' };
  if (name.length > 56) return { error: 'invalid' };
  if (message.length > 680) return { error: 'invalid' };

  return { name, message };
}

/** Trả về phản hồi đúng khuôn client mong đợi. */
function respond(statusKey, messages) {
  const published = publicMessages(messages);
  return {
    statusKey,
    messages: published,
    total: published.length,
    replyCount: countReplies(published),
  };
}

export default async function handler(request) {
  const cors = withCors(request);

  // Preflight: trình duyệt gửi OPTIONS trước khi POST có body.
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const limit = Math.min(
        PAGE_LIMIT,
        Math.max(1, Number(url.searchParams.get('limit')) || 10),
      );
      const offset = Math.max(0, Number(url.searchParams.get('offset')) || 0);

      const store = await readStore();
      // Chưa seed: trả rỗng. Bản static của site vẫn có 16 lời ghi nên người
      // xem vẫn thấy nội dung cho tới khi seed xong.
      if (!store) {
        return Response.json(
          { messages: [], total: 0, replyCount: 0 },
          { headers: cors },
        );
      }

      const published = publicMessages(store.messages);
      return Response.json(
        {
          messages: published.slice(offset, offset + limit),
          total: published.length,
          replyCount: countReplies(published),
        },
        { headers: cors },
      );
    }

    if (request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      const action = String(body?.action ?? '');

      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';

      if (action === 'create') {
        // Honeypot: field "website" bị ẩn, bot thường điền vào. Trả về thành
        // công như thành công để bot không biết mình đã bị phát hiện.
        if (String(body?.website ?? '').trim()) {
          const store = (await readStore()) ?? { messages: [] };
          return Response.json(respond('sent', store.messages), { headers: cors });
        }

        if (rateLimited(ip)) {
          const store = (await readStore()) ?? { messages: [] };
          return Response.json(respond('invalid', store.messages), { headers: cors });
        }

        const { error, name, message } = validateCreate(body);
        if (error) {
          const store = (await readStore()) ?? { messages: [] };
          return Response.json(respond('invalid', store.messages), { headers: cors });
        }

        const store = (await readStore()) ?? { messages: [] };
        const entry = normalizeMessage({
          id: crypto.randomUUID(),
          name,
          message,
          reply: null,
          status: 'published',
          createdAt: new Date().toISOString(),
          repliedAt: null,
        });

        // Lời ghi mới đặt lên đầu danh sách (mới nhất trước), giống upstream.
        store.messages.unshift(entry);
        await writeStore(store.messages);

        return Response.json(respond('sent', store.messages), { headers: cors });
      }

      // --- Các hành động của admin ---

      if (action === 'reply') {
        const store = await readStore();
        if (!(await isAdmin(request))) {
          return Response.json(
            respond('admin-required', store?.messages ?? []),
            { headers: cors },
          );
        }

        const id = String(body?.id ?? '');
        const reply = String(body?.reply ?? '').trim();
        if (!reply || reply.length > 680) {
          return Response.json(
            respond('reply-invalid', store?.messages ?? []),
            { headers: cors },
          );
        }

        const target = store.messages.find((m) => m.id === id);
        if (!target) {
          return Response.json(respond('reply-invalid', store.messages), { headers: cors });
        }

        target.reply = reply;
        target.repliedAt = new Date().toISOString();
        await writeStore(store.messages);

        return Response.json(respond('replied', store.messages), { headers: cors });
      }

      if (action === 'delete-reply') {
        const store = await readStore();
        if (!(await isAdmin(request))) {
          return Response.json(
            respond('admin-required', store?.messages ?? []),
            { headers: cors },
          );
        }

        const id = String(body?.id ?? '');
        const target = store.messages.find((m) => m.id === id);
        if (!target) {
          return Response.json(
            respond('reply-deleted', store?.messages ?? []),
            { headers: cors },
          );
        }

        target.reply = null;
        target.repliedAt = null;
        await writeStore(store.messages);

        return Response.json(respond('reply-deleted', store.messages), { headers: cors });
      }

      if (action === 'delete-message') {
        const store = await readStore();
        if (!(await isAdmin(request))) {
          return Response.json(
            respond('admin-required', store?.messages ?? []),
            { headers: cors },
          );
        }

        const id = String(body?.id ?? '');
        const before = store.messages.length;
        store.messages = store.messages.filter((m) => m.id !== id);
        if (store.messages.length === before) {
          return Response.json(respond('message-deleted', store.messages), { headers: cors });
        }
        await writeStore(store.messages);

        return Response.json(respond('message-deleted', store.messages), { headers: cors });
      }

      const store = await readStore();
      return Response.json(respond('invalid', store?.messages ?? []), { headers: cors });
    }

    return new Response('Method Not Allowed', { status: 405, headers: cors });
  } catch (e) {
    console.error('guestbook api loi:', e);
    return new Response('Internal Server Error', { status: 500, headers: cors });
  }
}
