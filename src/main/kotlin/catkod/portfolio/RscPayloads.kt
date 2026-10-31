package catkod.portfolio

import java.io.ByteArrayOutputStream
import java.nio.charset.StandardCharsets
import java.nio.file.Files
import java.nio.file.Path

/**
 * Trích payload RSC (Flight) từ file HTML tĩnh đã export.
 *
 * File HTML của Next.js export chứa các script:
 *   <script>self.__next_f.push([1,"<id>:<payload>\n..."])</script>
 *
 * Yêu cầu RSC của client (`?_rsc=...` hoặc header `RSC: 1`) cần đúng chuỗi
 * payload đó. Vì bản dựng lại đã đổi nội dung (DOM + flight phải khớp nhau),
 * ta phải trả payload từ file tĩnh cục bộ — nếu chuyển tiếp lên site gốc thì
 * client sẽ nhận cây component của bản gốc và báo hydration mismatch.
 */
class RscPayloads(private val root: Path) {

    private val cache = HashMap<String, ByteArray>()

    /** Đường dẫn route -> tên tệp tĩnh tương ứng. */
    private val routeFiles = mapOf(
        "/" to "index.html",
        "/about" to "about",
        "/work" to "work",
        "/skills" to "skills",
        "/credentials" to "credentials",
        "/guestbook" to "guestbook",
        "/contact" to "contact",
    )

    /**
     * Trả về payload flight cho route, hoặc null nếu không có tệp tương ứng.
     */
    fun payload(path: String): ByteArray? {
        val key = normalize(path)
        cache[key]?.let { return it }
        val name = routeFiles[key] ?: return null
        val file = root.resolve(name)
        if (!Files.isRegularFile(file)) return null
        val html = Files.readString(file, StandardCharsets.UTF_8)
        val payload = extract(html)
        cache[key] = payload
        return payload
    }

    /**
     * Gom mọi đoạn payload flight trong HTML thành một chuỗi.
     *
     * Mỗi đoạn nằm trong `self.__next_f.push([1,"<escaped>"])`. Chuỗi `<escaped>`
     * là JSON string, nên cần giải mã đúng một lần để lấy payload thô.
     */
    private fun extract(html: String): ByteArray {
        val out = ByteArrayOutputStream()
        var i = 0
        while (true) {
            val start = html.indexOf(PUSH_PREFIX, i)
            if (start < 0) break
            val quoteStart = start + PUSH_PREFIX.length
            val sb = StringBuilder()
            var j = quoteStart + 1
            var closed = false
            while (j < html.length) {
                val c = html[j]
                if (c == '\\') {
                    sb.append(c)
                    if (j + 1 < html.length) {
                        sb.append(html[j + 1])
                        j += 2
                        continue
                    }
                    j++
                    continue
                }
                if (c == '"') {
                    closed = true
                    j++
                    break
                }
                sb.append(c)
                j++
            }
            if (!closed) break
            i = j
            val decoded = unescapeJsonString(sb.toString())
            out.write(decoded.toByteArray(StandardCharsets.UTF_8))
        }
        return out.toByteArray()
    }

    /** Giải mã chuỗi JSON (đã escape) thành chuỗi thô. */
    private fun unescapeJsonString(escaped: String): String {
        val sb = StringBuilder(escaped.length)
        var i = 0
        while (i < escaped.length) {
            val c = escaped[i]
            if (c != '\\') {
                sb.append(c)
                i++
                continue
            }
            if (i + 1 >= escaped.length) break
            when (val n = escaped[i + 1]) {
                'n' -> sb.append('\n')
                'r' -> sb.append('\r')
                't' -> sb.append('\t')
                'b' -> sb.append('\b')
                'f' -> sb.append('')
                'u' -> {
                    if (i + 5 < escaped.length) {
                        val hex = escaped.substring(i + 2, i + 6)
                        val code = hex.toIntOrNull(16)
                        if (code != null) {
                            sb.append(code.toChar())
                            i += 6
                            continue
                        }
                    }
                    sb.append(n)
                    i += 1
                    continue
                }
                else -> sb.append(n)
            }
            i += 2
        }
        return sb.toString()
    }

    private fun normalize(path: String): String {
        if (path.isEmpty()) return "/"
        return if (path.length > 1 && path.endsWith('/')) path.dropLast(1) else path
    }

    private companion object {
        const val PUSH_PREFIX = "self.__next_f.push([1,\""
    }
}
