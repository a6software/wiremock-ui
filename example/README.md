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

## Notes

- The frontend container uses the local `example-wiremock-frontend:latest` image.
- The example reuses the main test fixture instead of maintaining a separate mapping copy.
- The Playwright test hits the running UI at `http://127.0.0.1:8783`.
- This folder is only for demo and smoke-test purposes.
