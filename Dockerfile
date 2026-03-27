FROM eclipse-temurin:21-jdk AS builder

WORKDIR /build

COPY gradle gradle
COPY gradlew .
COPY gradlew.bat .
COPY build.gradle.kts .
COPY settings.gradle.kts .
COPY src src

RUN ./gradlew --no-daemon test bootJar

FROM eclipse-temurin:21-jre-alpine

RUN addgroup -g 1001 -S appuser && adduser -u 1001 -S appuser -G appuser

WORKDIR /app

COPY --from=builder --chown=appuser:appuser /build/build/libs/*.jar /app/app.jar

USER appuser

EXPOSE 8782

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
