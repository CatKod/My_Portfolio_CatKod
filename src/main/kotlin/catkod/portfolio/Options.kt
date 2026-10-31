package catkod.portfolio

/**
 * Tuỳ chọn dòng lệnh cho server.
 *
 * ```
 * --port=8080       Cổng lắng nghe
 * --host=0.0.0.0    Địa chỉ bind
 * --root=./site     Thư mục chứa nội dung tĩnh
 * --upstream=URL    Site gốc dùng làm fallback cho yêu cầu động
 * --live=/about     Trang có dữ liệu sống (lấy trực tiếp từ site gốc), phân tách bằng dấu phẩy
 * --live-cache=60000 Thời gian cache (ms) cho các trang dữ liệu sống
 * ```
 */
data class Options(
    val port: Int = 8080,
    val host: String = "0.0.0.0",
    val siteRoot: String = "site",
    val upstream: String = "https://irfansabrian.vercel.app",
    val livePaths: Set<String> = emptySet(),
    val liveCacheMillis: Long = 60_000,
    val verbose: Boolean = false,
) {
    companion object {
        fun parse(args: Array<String>): Options {
            var options = Options()
            for (arg in args) {
                when {
                    arg.startsWith("--port=") -> options = options.copy(port = arg.substringAfter('=').toInt())
                    arg.startsWith("--host=") -> options = options.copy(host = arg.substringAfter('='))
                    arg.startsWith("--root=") -> options = options.copy(siteRoot = arg.substringAfter('='))
                    arg.startsWith("--upstream=") -> options = options.copy(upstream = arg.substringAfter('='))
                    arg.startsWith("--live=") -> options = options.copy(
                        livePaths = arg.substringAfter('=').split(',').map { it.trim() }.filter { it.isNotEmpty() }.toSet(),
                    )
                    arg.startsWith("--live-cache=") -> options = options.copy(liveCacheMillis = arg.substringAfter('=').toLong())
                    arg == "--verbose" -> options = options.copy(verbose = true)
                }
            }
            return options
        }
    }
}
