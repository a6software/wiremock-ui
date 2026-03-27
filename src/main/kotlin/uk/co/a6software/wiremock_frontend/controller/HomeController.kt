package uk.co.a6software.wiremock_frontend.controller

import org.springframework.stereotype.Controller
import org.springframework.ui.Model
import org.springframework.web.bind.annotation.GetMapping
import uk.co.a6software.wiremock_frontend.service.WireMockMappingsService

@Controller
class HomeController(
    private val mappingsService: WireMockMappingsService
) {
    @GetMapping("/")
    fun home(model: Model): String {
        return try {
            val dashboard = mappingsService.loadDashboard()
            model.addAttribute("dashboard", dashboard)
            model.addAttribute("fetchError", null)
            "index"
        } catch (ex: Exception) {
            model.addAttribute("dashboard", null)
            model.addAttribute("fetchError", ex.message ?: "Unable to reach WireMock")
            "index"
        }
    }
}
