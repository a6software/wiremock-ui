package uk.co.a6software.wiremock_frontend.config

import org.springframework.boot.context.properties.ConfigurationProperties
import java.time.Duration

@ConfigurationProperties(prefix = "wiremock")
data class WireMockFrontendProperties(
    val baseUrl: String = "http://wiremock:8080",
    val connectTimeout: Duration = Duration.ofSeconds(2),
    val readTimeout: Duration = Duration.ofSeconds(5)
)
