# Example Demo

This folder is a small end-to-end sandbox for seeing the UI against a real WireMock container.

It is intentionally separated from the main Spring Boot build.

## What it starts

- `wiremock` on `http://localhost:9091`
- `wiremock-frontend` on `http://localhost:8783`

WireMock is seeded from the shared fixture at `../src/test/resources/wiremock-mappings.json`.

The demo UI highlights a few stable routes from that shared mapping set:

- `POST /demo/users/DEMO_USER`
- `GET /directory/users/DEMO_USER/email`
- `GET /directory/users/DEMO_USER/roles`

## Run the example

From this folder:

```bash
npm install
npm run compose:up
npm run test:e2e
```

If `example-wiremock-frontend:latest` is not already present locally, build it once from the repo root:

```bash
docker build -t example-wiremock-frontend:latest ..
```

When finished:

```bash
npm run compose:down
```

## Run against `bootRun`

To use the example WireMock container with the app started from source, start only WireMock from this folder:

```bash
docker compose -f docker-compose.yml up wiremock
```

Then start the Spring Boot app from the repo root:

```bash
WIREMOCK_BASE_URL=http://localhost:9091 PORT=8783 ./gradlew bootRun
```

Open the UI at `http://localhost:8783`.

For Playwright, run the test directly from this folder:

```bash
npx playwright test
```

Do not use `npm run test:e2e` for this mode. Its `pretest:e2e` script builds the image and starts the full Docker Compose stack, including the frontend container.

## Notes

- The frontend container uses the local `example-wiremock-frontend:latest` image.
- Use `WIREMOCK_BASE_URL=http://localhost:9091` when the UI runs directly on your host with `bootRun`.
- The example reuses the main test fixture instead of maintaining a separate mapping copy.
- The Playwright test hits the running UI at `http://127.0.0.1:8783`.
- This folder is only for demo and smoke-test purposes.
