/**
 * Đọc nội dung file trong Vercel Blob.
 *
 * Vì sao cần helper này?
 *
 * `@vercel/blob` v2 trả về object có `stream` là `ReadableStream` (Web) khi
 * chạy trong Node, và `blob.stream` KHÔNG phải `Blob` của DOM — nên
 * `blob.stream.text()` (cách dùng ở Edge/Worker) không tồn tại và sẽ ném
 * `TypeError: blob.stream.text is not a function`.
 *
 * Cách đúng cho cả hai môi trường: đọc qua reader của `ReadableStream` rồi
 * ghép lại thành `Buffer`.
 */
export async function readBlobText(blob) {
  if (!blob) return '';

  // Trường hợp đã là `Blob`/`Response` thật thì `.text()` có sẵn.
  if (typeof blob.text === 'function') return blob.text();

  const stream = blob.stream;
  if (!stream) return '';

  if (typeof stream.getReader === 'function') {
    const reader = stream.getReader();
    const chunks = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks).toString('utf8');
  }

  // Node stream cũ (nếu có).
  const chunks = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}
