# yet-another-ics-proxy

A simple, lightweight, and stateless ICS proxy that converts Outlook-style ICS files into Google Calendar-compatible ICS content.

## Overview

`yet-another-ics-proxy` fetches an `.ics` file from a remote URL, translates Microsoft timezone identifiers to IANA timezones, removes proprietary Microsoft `X-` properties, and returns a cleaned ICS file for Google Calendar import.

## Features

- Stateless HTTP proxy
- Converts Windows timezone IDs to IANA timezones
- Strips Microsoft-specific `X-MICROSOFT-*` properties
- Supports simple health/status check
- Configurable via environment variables

## Environment Variables

- `PORT` — port where the proxy listens (default: `3000`)
- `ALLOWED_HOSTS` — comma-separated list of allowed target hostnames; only requests to these hosts are permitted
- `ENABLE_HTTP` — set to `true` to allow `http://` URLs; otherwise only `https://` is accepted

## Endpoints

- `GET /?uri=<remote_ics_url>`
  - Fetches and translates the ICS file from the provided `uri` query parameter
  - Returns `text/calendar; charset=utf-8` with `Content-Disposition: attachment; filename="calendar.ics"`
- `GET /status`
  - Returns plain text status: `yet-another-ics-proxy is running`

## Usage

1. Build the project:
   ```bash
   npm install
   npm run build
   ```
2. Run locally:
   ```bash
   PORT=3000 ALLOWED_HOSTS=outlook.office365.com npm start
   ```
3. Example request:
   ```bash
   curl "http://localhost:3000/?uri=https://example.com/calendar.ics"
   ```

## Docker

### Build image

```bash
docker build -t yet-another-ics-proxy .
```

### Run container

```bash
docker run -p 3000:3000 --name yet-another-ics-proxy yet-another-ics-proxy
```

## Docker Compose sample

```yaml
services:
  ics-proxy:
    container_name: yet-another-ics-proxy
    image: ghcr.io/lugieda/yet-another-ics-proxy:latest
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - ALLOWED_HOSTS=outlook.office365.com
      - ENABLE_HTTP=false
    restart: unless-stopped
```

## Project structure

- `src/server.ts` — HTTP server bootstrap
- `src/modules/request-handler.ts` — request routing and proxy logic
- `src/modules/ics-translator.ts` — ICS translation logic
- `src/modules/environment.ts` — environment variable parsing and defaults
- `Dockerfile` — multi-stage Docker image build

## Requirements

- Node.js 26+

## Notes

- The proxy is intentionally lightweight and stateless: it does not cache or store remote ICS files.
- `ALLOWED_HOSTS` must include the hostname of the remote ICS source.
- If `ENABLE_HTTP` is not set to `true`, only `https://` sources are allowed.
- Use a valid, publicly reachable ICS URL for the `uri` parameter.
