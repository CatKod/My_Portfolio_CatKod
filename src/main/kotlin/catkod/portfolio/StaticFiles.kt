package catkod.portfolio

import java.nio.file.Files
import java.nio.file.Path

/**
 * Phục vụ nội dung tĩnh từ thư mục `site/`.
 *
 * Quy tắc phân giải đường dẫn (khớp với hành vi của site gốc):
 *  - `/`            -> `index.html`
 *  - `/about`       -> `about` (tệp) hoặc `about/index.html`
 *  - `/_next/...`   -> `/_next/...`
 */
class StaticFiles(private val root: Path) {

    /** Trả về nội dung tệp tương ứng với đường dẫn yêu cầu, hoặc null nếu không có. */
    fun resolve(rawPath: String): StaticFile? {
        val decoded = decode(rawPath)
        val candidates = buildList {
            if (decoded == "/" || decoded.isEmpty()) {
                add(root.resolve("index.html"))
            } else {
                val relative = decoded.trimStart('/')
                add(root.resolve(relative))
                add(root.resolve(relative).resolve("index.html"))
            }
        }
        for (candidate in candidates) {
            if (!candidate.startsWith(root)) continue
            if (!Files.isRegularFile(candidate)) continue
            return StaticFile(candidate, contentType(candidate))
        }
        return null
    }

    private fun decode(path: String): String {
        return try {
            java.net.URLDecoder.decode(path, Charsets.UTF_8)
        } catch (e: IllegalArgumentException) {
            path
        }
    }

    /**
     * Xác định Content-Type. Tệp không có đuôi (route kiểu `/about`) là HTML,
     * còn tệp có đuôi thì dùng bảng ánh xạ theo đuôi.
     */
    private fun contentType(path: Path): String {
        val name = path.fileName.toString()
        val dot = name.lastIndexOf('.')
        if (dot <= 0) return HTML_TYPE
        val ext = name.substring(dot).lowercase()
        return when (ext) {
            ".html", ".htm" -> HTML_TYPE
            ".css" -> "text/css; charset=utf-8"
            ".js", ".mjs" -> "text/javascript; charset=utf-8"
            ".json" -> "application/json; charset=utf-8"
            ".txt" -> "text/plain; charset=utf-8"
            ".xml" -> "application/xml; charset=utf-8"
            ".svg" -> "image/svg+xml"
            ".png" -> "image/png"
            ".webp" -> "image/webp"
            ".jpg", ".jpeg" -> "image/jpeg"
            ".gif" -> "image/gif"
            ".ico" -> "image/x-icon"
            ".woff2" -> "font/woff2"
            ".woff" -> "font/woff"
            ".ttf" -> "font/ttf"
            ".otf" -> "font/otf"
            ".eot" -> "application/vnd.ms-fontobject"
            ".map" -> "application/json; charset=utf-8"
            ".webmanifest" -> "application/manifest+json"
            else -> "application/octet-stream"
        }
    }

    private companion object {
        const val HTML_TYPE = "text/html; charset=utf-8"
    }
}

data class StaticFile(val path: Path, val contentType: String)
