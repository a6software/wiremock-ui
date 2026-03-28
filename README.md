# WireMock Frontend

Small Kotlin/Spring Boot + Thymeleaf UI for browsing live WireMock mappings.

![Wiremock mappings screenshot](docs/images/readme-screenshot.png)

The app fetches the current admin payload from `WIREMOCK_BASE_URL/__admin/mappings` on each page refresh and renders:

- route and matcher type
- HTTP method
- response status
- content type
- response payload preview
- client-side search and method filtering

## Run locally

```bash
./gradlew bootRun
```

Defaults:

- app port: `8782`
- WireMock admin base URL: `http://wiremock:8080`

Override for a host-run WireMock on port `9091`:

```bash
WIREMOCK_BASE_URL=http://localhost:9091 ./gradlew bootRun
```

## Docker

Build:

```bash
docker build -t wiremock-frontend .
```

Run against a WireMock container on the same Docker network:

```bash
docker run --rm \
  --name wiremock-frontend \
  -p 8782:8782 \
  -e WIREMOCK_BASE_URL=http://wiremock:8080 \
  wiremock-frontend
```

Then open `http://localhost:8782`.

Published image on `main`:

```bash
docker pull ghcr.io/a6software/wiremock-ui:main
```

Tagged releases publish semantic version Docker tags such as:

```bash
docker pull ghcr.io/a6software/wiremock-ui:1.2.3
docker pull ghcr.io/a6software/wiremock-ui:1.2
docker pull ghcr.io/a6software/wiremock-ui:1
docker pull ghcr.io/a6software/wiremock-ui:latest
```

## Example compose service

```yaml
  wiremock-frontend:
    image: ghcr.io/a6software/wiremock-ui:latest
    container_name: wiremock-frontend
    restart: always
    ports:
      - "8782:8782"
    environment:
      - WIREMOCK_BASE_URL=http://wiremock:8080
```

## Test

```bash
./gradlew test
```

## Release

Use the `Create Release Tag` GitHub Action and choose `patch`, `minor`, or `major`.

That action creates and pushes the next `vX.Y.Z` git tag. The `Publish Docker Image`
workflow then publishes matching Docker tags:

- `1.2.3`
- `1.2`
- `1`
- `latest`
