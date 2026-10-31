package catkod.portfolio

import java.nio.file.Path
import kotlin.system.exitProcess

/**
 * Ứng dụng phục vụ bản dựng lại (rebuild) của trang portfolio.
 *
 * Kiến trúc:
 *  - [StaticFiles] phục vụ nội dung tĩnh đã đối chiếu byte-for-byte với bản gốc.
 *  - [RscPayloads] trích payload flight từ các tệp HTML của `site/` để phục vụ
 *    yêu cầu RSC, giữ cho DOM và cây component khớp nhau (không hydration mismatch).
 *  - [LivePages] đánh dấu các trang có dữ liệu sống (biểu đồ GitHub) để lấy
 *    trực tiếp từ site gốc.
 *  - [UpstreamProxy] chuyển tiếp các yêu cầu động (prefetch, API) về bản gốc.
 *
 * Mọi logic nằm bằng Kotlin thuần, chỉ dùng JDK (com.sun.net.httpserver + java.net.http).
 */
fun main(args: Array<String>) {
    val options = Options.parse(args)

    val siteRoot: Path = java.io.File(options.siteRoot).toPath().toAbsolutePath().normalize()
    if (!siteRoot.toFile().isDirectory) {
        System.err.println("[portfolio] Không tìm thấy thư mục nội dung: $siteRoot")
        exitProcess(1)
    }

    val staticFiles = StaticFiles(siteRoot)
    val proxy = UpstreamProxy(options.upstream)
    val livePages = LivePages(options.livePaths)
    val rscPayloads = RscPayloads(siteRoot)
    val server = SiteServer(staticFiles, proxy, livePages, rscPayloads, options)

    Runtime.getRuntime().addShutdownHook(Thread { server.stop(0) })
    server.start()
    println("[portfolio] Đang phục vụ http://${options.host}:${options.port} (nội dung: $siteRoot)")
    println("[portfolio] Fallback upstream: ${options.upstream}")
    println("[portfolio] Trang dữ liệu sống: ${options.livePaths.joinToString(", ")}")
}
