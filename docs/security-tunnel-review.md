# Security and tunnel review

## Current review summary

### Implemented in this change

- Remove the hardcoded trust relationship with `https://kaida-palooza.github.io/ccpoke`.
- Only allow browser CORS access from:
  - the active tunnel origin, or
  - a self-hosted mini app origin configured through `CCPOKE_MINI_APP_BASE_URL`.
- Keep Cloudflare Quick Tunnel optional and disabled by default.
- Keep notification/chat control working without any public tunnel.
- Only attach response-view links when a public tunnel URL actually exists.

## Recommendation

For this project, Cloudflare Quick Tunnel is a convenience feature, not a core requirement.

- **Good fit for:** remote "View Details" links, quick demos, and temporary remote access without deploying infrastructure.
- **Not needed for:** Telegram/Discord/Slack messaging, two-way chat, permission handling, or direct control of Claude Code / OpenCode / Codex sessions.
- **Security trade-off:** when enabled, the tunnel exposes the local HTTP server to the internet through a random Cloudflare URL. That includes `/api/responses/:id`, `/hook/*`, and `/health`.

Recommended default:

1. Keep tunnel **off** for normal bot/chat usage.
2. Turn it **on explicitly** only when remote response viewing is needed.
3. Prefer a self-hosted reverse proxy or managed tunnel later if stable public access becomes a product requirement.

### Remaining follow-up work

The current tunnel and response model is workable, but there are still several security and operability improvements worth tracking as separate issues.

## Issue-ready implementation plans

### 1. Add first-class config for a self-hosted mini app URL

**Why**

The new environment variable removes the hardcoded domain, but it is still operationally awkward because users must manage it outside `ccpoke setup`.

**Scope**

- Add `mini_app_base_url` to `~/.ccpoke/config.json`.
- Validate it in `ConfigManager`.
- Surface it in `ccpoke setup` and `ccpoke update`.
- Prefer config over environment variables, while still allowing an env override for automation.

**Acceptance criteria**

- Users can set a viewer URL without editing shell startup files.
- Invalid URLs are rejected during setup and config validation.
- Response links and CORS both use the configured origin.

### 2. Make the bundled web app deployment-friendly for forks and custom domains

**Why**

The Astro site configuration still assumes the original GitHub Pages host and base path, which makes secure self-hosting harder for forks.

**Scope**

- Replace hardcoded `site` and `base` values in `web/astro.config.mjs` with environment-driven values.
- Document build examples for GitHub Pages, Cloudflare Pages, and custom domains.
- Verify `/response/` works correctly for non-`/ccpoke/` base paths.

**Acceptance criteria**

- A fork can build the web app without embedding the original author domain.
- Canonical URLs and generated routes match the deploy target.
- The response viewer works on both root and subpath deployments.

### 3. Add explicit response endpoint hardening and observability

**Why**

The response endpoint relies on unguessable IDs and CORS, but it has no rate limiting or audit trail for repeated access attempts.

**Scope**

- Add lightweight rate limiting for `/api/responses/:id`.
- Log repeated misses or suspicious access patterns at a warning level.
- Distinguish cache-friendly CORS behavior from rate-limit responses in logs and docs.

**Acceptance criteria**

- Excessive response fetch attempts are throttled.
- Operators can distinguish normal expiration from suspicious probing.
- CORS behavior stays deterministic behind caches and proxies.

### 4. Support an optional self-hosted tunnel or reverse proxy mode

**Why**

Cloudflare Quick Tunnel is convenient, but some users want to avoid third-party tunnel routing entirely or use infrastructure they already control.

**Scope**

- Allow users to disable auto-started Quick Tunnel cleanly.
- Support an explicit public API base URL for trusted reverse proxies or managed tunnels.
- Reuse the same origin validation logic for that public URL.

**Acceptance criteria**

- Users can run ccpoke behind their own tunnel or proxy without patching code.
- Response links, CORS, and bot messages use the configured public endpoint.
- Quick Tunnel remains opt-in, and a custom public endpoint can replace it cleanly.
