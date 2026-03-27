package uk.co.a6software.wiremock_frontend.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.JsonNode

@JsonIgnoreProperties(ignoreUnknown = true)
data class WireMockMappingsResponse(
    val mappings: List<WireMockMapping> = emptyList(),
    val meta: WireMockMeta? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class WireMockMeta(
    val total: Int? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class WireMockMapping(
    val id: String? = null,
    val uuid: String? = null,
    val request: WireMockRequest = WireMockRequest(),
    val response: WireMockResponse = WireMockResponse()
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class WireMockRequest(
    val url: String? = null,
    val urlPattern: String? = null,
    val method: String? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class WireMockResponse(
    val status: Int? = null,
    val jsonBody: JsonNode? = null,
    val body: String? = null,
    val headers: Map<String, String> = emptyMap()
)

data class MappingRouteView(
    val id: String,
    val method: String,
    val matcherType: String,
    val route: String,
    val status: Int,
    val contentType: String,
    val bodyPreview: String,
    val searchText: String
)

data class MappingDashboardView(
    val mappings: List<MappingRouteView>,
    val totalMappings: Int,
    val methodBreakdown: Map<String, Int>,
    val sourceUrl: String
)
