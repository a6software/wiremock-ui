package uk.co.a6software.wiremock_frontend.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import uk.co.a6software.wiremock_frontend.config.WireMockFrontendProperties
import uk.co.a6software.wiremock_frontend.model.WireMockMappingsResponse
import java.nio.file.Files
import java.nio.file.Path
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class WireMockMappingsServiceTest {
    private val objectMapper = ObjectMapper().registerKotlinModule()
    private val client: WireMockAdminClient = mock()
    private val properties = WireMockFrontendProperties(baseUrl = "http://wiremock:8080")
    private val service = WireMockMappingsService(client, properties, objectMapper)

    @Test
    fun `load dashboard converts mappings into searchable route cards`() {
        val payload = Files.readString(Path.of("src/test/resources/wiremock-mappings.json"))
        val response = objectMapper.readValue(payload, WireMockMappingsResponse::class.java)
        whenever(client.fetchMappings()).thenReturn(response)

        val dashboard = service.loadDashboard()

        assertEquals(20, dashboard.totalMappings)
        assertEquals(4, dashboard.methodBreakdown["POST"])
        assertEquals("http://wiremock:8080/__admin/mappings", dashboard.sourceUrl)

        val otherUserRoute = dashboard.mappings.first { it.route == "/demo/users/OTHER_USER" && it.method == "GET" }
        assertEquals("Exact URL", otherUserRoute.matcherType)
        assertEquals(200, otherUserRoute.status)
        assertEquals("application/json;charset=UTF-8", otherUserRoute.contentType)
        assertTrue(otherUserRoute.bodyPreview.contains("\"roleName\" : \"tester\""))
        assertTrue(otherUserRoute.searchText.contains("developer"))

        val patternRoute = dashboard.mappings.first { it.route == "/auth/logout.*" }
        assertEquals("URL Pattern", patternRoute.matcherType)
        assertTrue(patternRoute.bodyPreview.contains("Login page"))
    }
}
