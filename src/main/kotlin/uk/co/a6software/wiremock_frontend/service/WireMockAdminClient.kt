package uk.co.a6software.wiremock_frontend.service

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.stereotype.Component
import uk.co.a6software.wiremock_frontend.config.WireMockFrontendProperties
import uk.co.a6software.wiremock_frontend.model.WireMockMappingsResponse
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

@Component
class WireMockAdminClient(
    private val properties: WireMockFrontendProperties,
    private val objectMapper: ObjectMapper
) {
    private val client: HttpClient = HttpClient.newBuilder()
        .connectTimeout(properties.connectTimeout)
        .build()

    fun fetchMappings(): WireMockMappingsResponse {
        val request = HttpRequest.newBuilder()
            .uri(URI.create("${properties.baseUrl.trimEnd('/')}/__admin/mappings"))
            .timeout(properties.readTimeout)
            .header("Accept", "application/json")
            .GET()
            .build()

        val response = client.send(request, HttpResponse.BodyHandlers.ofString())
        if (response.statusCode() !in 200..299) {
            throw IllegalStateException("WireMock admin request failed with status ${response.statusCode()}")
        }

        return objectMapper.readValue(response.body(), WireMockMappingsResponse::class.java)
    }
}
