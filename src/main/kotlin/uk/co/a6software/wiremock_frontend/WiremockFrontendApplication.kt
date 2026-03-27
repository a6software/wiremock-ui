package uk.co.a6software.wiremock_frontend

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication

@SpringBootApplication
@ConfigurationPropertiesScan
class WiremockFrontendApplication

fun main(args: Array<String>) {
    runApplication<WiremockFrontendApplication>(*args)
}
