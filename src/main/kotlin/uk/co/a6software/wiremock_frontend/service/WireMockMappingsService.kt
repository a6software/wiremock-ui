package uk.co.a6software.wiremock_frontend.service

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.stereotype.Service
import uk.co.a6software.wiremock_frontend.config.WireMockFrontendProperties
import uk.co.a6software.wiremock_frontend.model.MappingDashboardView
import uk.co.a6software.wiremock_frontend.model.MappingRouteView
import uk.co.a6software.wiremock_frontend.model.WireMockMapping
import java.util.Locale

@Service
class WireMockMappingsService(
    private val client: WireMockAdminClient,
    private val properties: WireMockFrontendProperties,
    private val objectMapper: ObjectMapper
) {
    fun loadDashboard(): MappingDashboardView {
        val response = client.fetchMappings()
        val mappings = response.mappings
            .map(::toRouteView)

        return MappingDashboardView(
            mappings = mappings,
            totalMappings = response.meta?.total ?: mappings.size,
            methodBreakdown = mappings.groupingBy { it.method }.eachCount().toSortedMap(),
            sourceUrl = "${properties.baseUrl.trimEnd('/')}/__admin/mappings"
        )
    }

    internal fun toRouteView(mapping: WireMockMapping): MappingRouteView {
        val route = mapping.request.url ?: mapping.request.urlPattern ?: "(no route configured)"
        val matcherType = when {
            mapping.request.url != null -> "Exact URL"
            mapping.request.urlPattern != null -> "URL Pattern"
            else -> "Unknown"
        }
        val method = mapping.request.method?.uppercase(Locale.getDefault()) ?: "ANY"
        val status = mapping.response.status ?: 200
        val contentType = mapping.response.headers.entries
            .firstOrNull { it.key.equals("Content-Type", ignoreCase = true) }
            ?.value
            ?: if (mapping.response.jsonBody != null) "application/json" else "Not set"
        val preview = buildBodyPreview(mapping.response.jsonBody, mapping.response.body)
        val id = mapping.uuid ?: mapping.id ?: "${method.lowercase(Locale.getDefault())}:${route}"
        val searchText = listOf(id, method, route, matcherType, status.toString(), contentType, preview)
            .joinToString(" ")
            .lowercase(Locale.getDefault())

        return MappingRouteView(
            id = id,
            method = method,
            matcherType = matcherType,
            route = route,
            status = status,
            contentType = contentType,
            bodyPreview = preview,
            searchText = searchText
        )
    }

    private fun buildBodyPreview(jsonBody: JsonNode?, rawBody: String?): String {
        val source = when {
            jsonBody != null -> objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonBody)
            !rawBody.isNullOrBlank() -> rawBody
            else -> "No response body"
        }.trim()

        return if (source.length <= 800) source else source.take(797) + "..."
    }
}
