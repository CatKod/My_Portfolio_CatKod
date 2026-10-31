package catkod.portfolio

import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpServer
import java.io.IOException
import java.net.InetSocketAddress
import java.nio.file.Files
import java.util.concurrent.Executors

/**
 * HTTP server của trang portfolio.
 *
 * Luồng xử lý:
 *  1. Yêu cầu RSC của Next.js (`?_rsc=...`, header `RSC: 1`) được phục vụ từ
 *     payload flight trích sẵn trong các tệp HTML của `site/`. Bản dựng lại đã
 *     đổi nội dung nên payload phải đến từ bản local — chuyển tiếp lên site gốc
 *     sẽ khiến React so DOM với cây component của bản gốc và báo hydration
 *     mismatch (`Minified React error #418`).
 *  2. Tài nguyên tĩnh trong `site/` được phục vụ trực tiếp.
 *  3. Mọi yêu cầu còn lại được chuyển tiếp về site gốc (fallback), giữ nguyên
 *     header + query + body.
 */
class SiteServer(
    private val staticFiles: StaticFiles,
    private val proxy: UpstreamProxy,
    private val livePages: LivePages,
    private val rscPayloads: RscPayloads,
    private val options: Options,
) {
    private lateinit var server: HttpServer

    fun start() {
        server = HttpServer.create(InetSocketAddress(options.host, options.port), 0)
        server.executor = Executors.newFixedThreadPool(32)
        server.createContext("/", ::handle)
        server.start()
    }

    fun stop(delaySeconds: Int) {
        if (::server.isInitialized) server.stop(delaySeconds)
    }

    private fun handle(exchange: HttpExchange) {
        try {
            val method = exchange.requestMethod
            val rawPath = exchange.requestURI.rawPath ?: "/"
            val query = exchange.requestURI.rawQuery

            if (method == "GET" || method == "HEAD") {
                if (isRscRequest(exchange, query)) {
                    if (serveRscPayload(exchange, rawPath)) return
                } else {
                    val live = serveLivePage(exchange, rawPath, query)
                    if (live) return

                    val file = staticFiles.resolve(rawPath)
                    if (file != null) {
                        serveFile(exchange, file)
                        return
                    }
                }
            }

            val body = readBody(exchange)
            val upstream = proxy.forward(
                method = method,
                rawPath = rawPath,
                query = query,
                headers = exchange.requestHeaders,
                body = body,
                timeoutMs = 30_000,
            )
            writeResponse(exchange, upstream.status, upstream.headers, upstream.body)
        } catch (e: IOException) {
            runCatching { exchange.sendResponseHeaders(500, -1) }
        } finally {
            exchange.close()
        }
    }

    /**
     * Phục vụ payload flight của route từ tệp HTML tĩnh cục bộ.
     * Trả về true nếu tìm thấy payload.
     */
    private fun serveRscPayload(exchange: HttpExchange, rawPath: String): Boolean {
        val payload = rscPayloads.payload(rawPath) ?: return false
        exchange.responseHeaders.set("Content-Type", "text/x-component")
        exchange.responseHeaders.set("Vary", "RSC, Next-Router-State-Tree, Next-Router-Prefetch")
        exchange.responseHeaders.set("Cache-Control", "no-store")
        if (exchange.requestMethod == "HEAD") {
            exchange.sendResponseHeaders(200, -1)
            return true
        }
        exchange.sendResponseHeaders(200, payload.size.toLong())
        exchange.responseBody.use { it.write(payload) }
        return true
    }

    /**
     * Phục vụ các trang có dữ liệu sống bằng cách lấy từ site gốc.
     * Trả về true nếu yêu cầu đã được xử lý.
     */
    private fun serveLivePage(exchange: HttpExchange, rawPath: String, query: String?): Boolean {
        if (!livePages.isLive(rawPath)) return false

        // Yêu cầu RSC mang dữ liệu động, không được phục vụ từ cache HTML.
        val isRsc = query != null && (query.contains("_rsc=") || query.contains("__flight"))
        if (!isRsc) {
            val cached = livePages.cached(rawPath, options.liveCacheMillis)
            if (cached != null) {
                writeRaw(exchange, 200, cached.contentType, cached.body, noCache = true)
                return true
            }
        }

        val upstream = proxy.forward(
            method = exchange.requestMethod,
            rawPath = rawPath,
            query = query,
            headers = exchange.requestHeaders,
            body = ByteArray(0),
            timeoutMs = 30_000,
        )
        if (upstream.status == 200 && !isRsc) {
            val contentType = upstream.headers.entries
                .firstOrNull { it.key.equals("Content-Type", ignoreCase = true) }
                ?.value?.firstOrNull() ?: "text/html; charset=utf-8"
            livePages.store(rawPath, upstream.body, contentType)
        }
        writeResponse(exchange, upstream.status, upstream.headers, upstream.body)
        return true
    }

    /**
     * Nhận diện yêu cầu RSC của Next.js App Router.
     */
    private fun isRscRequest(exchange: HttpExchange, query: String?): Boolean {
        if (query != null && (query.contains("_rsc=") || query.contains("__flight"))) return true
        val headers = exchange.requestHeaders
        if (headers.getFirst("RSC") != null) return true
        if (headers.getFirst("Next-Router-State-Tree") != null) return true
        if (headers.getFirst("Next-Router-Prefetch") != null) return true
        if (headers.getFirst("Next-Url") != null) return true
        return false
    }

    private fun serveFile(exchange: HttpExchange, file: StaticFile) {
        val bytes = Files.readAllBytes(file.path)
        val isHtml = file.contentType.startsWith("text/html")

        val headers = exchange.responseHeaders
        headers.set("Content-Type", file.contentType)
        headers.set("Cache-Control", if (isHtml) "no-cache" else "public, max-age=31536000, immutable")
        headers.set("X-Content-Type-Options", "nosniff")
        if (isHtml) {
            headers.set("X-Matched-Path", exchange.requestURI.rawPath ?: "/")
        }

        if (exchange.requestMethod == "HEAD") {
            headers.set("Content-Length", bytes.size.toString())
            exchange.sendResponseHeaders(200, -1)
            return
        }
        exchange.sendResponseHeaders(200, bytes.size.toLong())
        exchange.responseBody.use { it.write(bytes) }
    }

    private fun readBody(exchange: HttpExchange): ByteArray {
        return exchange.requestBody.use { it.readBytes() }
    }

    private fun writeRaw(
        exchange: HttpExchange,
        status: Int,
        contentType: String,
        body: ByteArray,
        noCache: Boolean,
    ) {
        exchange.responseHeaders.set("Content-Type", contentType)
        if (noCache) exchange.responseHeaders.set("Cache-Control", "no-cache")
        if (exchange.requestMethod == "HEAD") {
            exchange.responseHeaders.set("Content-Length", body.size.toString())
            exchange.sendResponseHeaders(status, -1)
            return
        }
        exchange.sendResponseHeaders(status, body.size.toLong())
        exchange.responseBody.use { it.write(body) }
    }

    private fun writeResponse(
        exchange: HttpExchange,
        status: Int,
        headers: Map<String, List<String>>,
        body: ByteArray,
    ) {
        val out = exchange.responseHeaders
        headers.forEach { (name, values) ->
            val lower = name.lowercase()
            if (lower in SKIP_RESPONSE_HEADERS) return@forEach
            if (!isValidHeaderName(name)) return@forEach
            values.forEach { out.add(name, it) }
        }
        if (exchange.requestMethod == "HEAD") {
            exchange.sendResponseHeaders(status, -1)
            return
        }
        exchange.sendResponseHeaders(status, body.size.toLong())
        exchange.responseBody.use { it.write(body) }
    }

    /** Bộ đệm HTTP chỉ chấp nhận tên header là ASCII in hoa/thường/số và dấu gạch ngang. */
    private fun isValidHeaderName(name: String): Boolean {
        if (name.isEmpty()) return false
        return name.all { it.code in 33..126 && it != ':' }
    }

    private companion object {
        val SKIP_RESPONSE_HEADERS = setOf("content-length", "transfer-encoding", "connection", "content-encoding")
    }
}
