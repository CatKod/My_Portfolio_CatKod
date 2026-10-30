package catkod.portfolio

/**
 * Các trang có dữ liệu sống được render phía server của site gốc.
 *
 * Ví dụ `/about` chứa biểu đồ hoạt động GitHub: màu từng ô và tổng số đóng góp
 * thay đổi theo thời gian thực. Nếu phục vụ từ bản tĩnh, trang sẽ "đứng hình"
 * và khác bản gốc. Vì vậy các route này được lấy trực tiếp từ site gốc.
 *
 * Lưu ý: chỉ HTML mới được cache. Các yêu cầu RSC (`?_rsc=`) luôn phải tới
 * upstream để dữ liệu động không bị stale.
 */
class LivePages(private val paths: Set<String>) {

    private val cache = HashMap<String, Entry>()

    private data class Entry(val body: ByteArray, val contentType: String, val fetchedAt: Long)

    /** Trả về true nếu đường dẫn cần được lấy trực tiếp từ site gốc. */
    fun isLive(path: String): Boolean = paths.contains(normalize(path))

    /** Trả về nội dung cache còn hợp lệ, hoặc null nếu cần tải lại. */
    fun cached(path: String, ttlMillis: Long): LiveContent? {
        val entry = cache[normalize(path)] ?: return null
        if (System.currentTimeMillis() - entry.fetchedAt > ttlMillis) return null
        return LiveContent(entry.body, entry.contentType)
    }

    fun store(path: String, body: ByteArray, contentType: String) {
        cache[normalize(path)] = Entry(body, contentType, System.currentTimeMillis())
    }

    private fun normalize(path: String): String {
        if (path.isEmpty()) return "/"
        return if (path.length > 1 && path.endsWith('/')) path.dropLast(1) else path
    }
}

data class LiveContent(val body: ByteArray, val contentType: String)
