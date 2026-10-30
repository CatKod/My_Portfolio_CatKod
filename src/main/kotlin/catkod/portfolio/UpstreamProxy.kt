package catkod.portfolio

import java.io.IOException
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

/**
 * Chuyển tiếp yêu cầu động về site gốc.
 *
 * Site gốc là ứng dụng Next.js App Router: ngoài HTML tĩnh còn có các yêu cầu
 * RSC (`?_rsc=`, `RSC: 1` header) và các route API. Những yêu cầu đó không thể
 * phục vụ từ file tĩnh, nên server chuyển tiếp nguyên vẹn header + body + query
 * xuống bản gốc để hành vi runtime khớp hoàn toàn.
 */
class UpstreamProxy(private val upstream: String) {
    private val client: HttpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .build()

    fun forward(
        method: String,
        rawPath: String,
        query: String?,
        headers: Map<String, List<String>>,
        body: ByteArray,
        timeoutMs: Int,
    ): ProxyResponse {
        val target = URI.create(upstream + rawPath + (query?.let { "?$it" } ?: ""))
        val builder = HttpRequest.newBuilder(target).timeout(Duration.ofMillis(timeoutMs.toLong()))
        headers.forEach { (name, values) ->
            val lower = name.lowercase()
            if (lower in SKIP_HEADERS) return@forEach
            values.forEach { builder.header(name, it) }
        }
        val publisher = when {
            method.equals("GET", true) || method.equals("HEAD", true) -> HttpRequest.BodyPublishers.noBody()
            else -> HttpRequest.BodyPublishers.ofByteArray(body)
        }
        builder.method(method.uppercase(), publisher)

        return try {
            val response = client.send(builder.build(), HttpResponse.BodyHandlers.ofByteArray())
            ProxyResponse(
                status = response.statusCode(),
                headers = toPlainMap(response.headers()),
                body = response.body(),
            )
        } catch (e: IOException) {
            ProxyResponse(502, emptyMap(), "Upstream unreachable: ${e.message}".toByteArray())
        } catch (e: InterruptedException) {
            Thread.currentThread().interrupt()
            ProxyResponse(504, emptyMap(), "Upstream timeout".toByteArray())
        }
    }

    private companion object {
        fun toPlainMap(headers: java.net.http.HttpHeaders): Map<String, List<String>> =
            headers.map().entries.associate { it.key to it.value.toList() }

        val SKIP_HEADERS = setOf(
            "host", "connection", "content-length", "transfer-encoding",
            "keep-alive", "upgrade", "expect", "accept-encoding",
        )
    }
}

data class ProxyResponse(
    val status: Int,
    val headers: Map<String, List<String>>,
    val body: ByteArray,
)
