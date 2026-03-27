package uk.co.a6software.wiremock_frontend.controller

import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.ui.ExtendedModelMap
import uk.co.a6software.wiremock_frontend.model.MappingDashboardView
import uk.co.a6software.wiremock_frontend.model.MappingRouteView
import uk.co.a6software.wiremock_frontend.service.WireMockMappingsService
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class HomeControllerTest {
    private val mappingsService: WireMockMappingsService = mock()

    @Test
    fun `home adds dashboard to model when service succeeds`() {
        val dashboard = MappingDashboardView(
            mappings = listOf(
                MappingRouteView(
                    id = "abc-123",
                    method = "GET",
                    matcherType = "Exact URL",
                    route = "/demo/users/DEMO_USER",
                    status = 200,
                    contentType = "application/json",
                    bodyPreview = """{ "username": "DEMO_USER" }""",
                    searchText = "get /demo/users/demo_user"
                )
            ),
            totalMappings = 1,
            methodBreakdown = sortedMapOf("GET" to 1),
            sourceUrl = "http://wiremock:8080/__admin/mappings"
        )
        whenever(mappingsService.loadDashboard()).thenReturn(dashboard)

        val model = ExtendedModelMap()
        val controller = HomeController(mappingsService)

        assertEquals("index", controller.home(model))
        assertEquals(dashboard, model["dashboard"])
        assertNull(model["fetchError"])
        verify(mappingsService).loadDashboard()
    }

    @Test
    fun `home adds error to model when service fails`() {
        whenever(mappingsService.loadDashboard()).thenThrow(RuntimeException("Connection refused"))

        val model = ExtendedModelMap()
        val controller = HomeController(mappingsService)

        assertEquals("index", controller.home(model))
        assertEquals("Connection refused", model["fetchError"])
        assertEquals(null, model["dashboard"])
        verify(mappingsService).loadDashboard()
    }
}
