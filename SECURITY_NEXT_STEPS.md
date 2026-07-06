# ZERINIX Security Next Steps

This checklist covers the next production hardening layer for Cloudflare, Vercel, Supabase, and the ZERINIX application. It is a plan only; do not apply changes without testing them in preview first.

## Cloudflare WAF Rules

- Enable Cloudflare Managed Ruleset with OWASP Core Ruleset in `Log` mode first, then move high-confidence rules to `Block`.
- Enable rules for SQL injection, command injection, path traversal, SSRF, XSS, and malicious file upload attempts.
- Add a custom WAF rule to challenge requests with suspicious user agents, empty user agents, or known scanner signatures.
- Add a custom WAF rule to block requests targeting common exploit paths such as `/wp-admin`, `/xmlrpc.php`, `/phpmyadmin`, `/.env`, and `/.git`.
- Add a WAF rule to challenge or block requests with unusually large query strings or request bodies outside known upload flows.
- Keep `/api/plan`, `/api/market-analysis`, Supabase auth callbacks, and login/register routes observable with Cloudflare Security Events.

## Bot Protection Strategy

- Enable Cloudflare Bot Fight Mode or Super Bot Fight Mode if available.
- Use Managed Challenge for suspicious traffic instead of hard blocking during the first rollout.
- Never challenge critical Supabase auth callback URLs unless tested end to end.
- Allow verified bots only when they are useful for public pages; authenticated planner and API routes do not need crawler access.
- Monitor bot score, challenge solve rate, false positives, and 401/403 spikes after each rule change.
- Consider Turnstile only for abusive public forms such as waitlist submission or repeated login attempts.

## Rate Limit Rules

### Public Pages

- Landing page `/`: high threshold, for example `300 requests / 5 minutes / IP`.
- Login `/login`: stricter threshold, for example `20 requests / 10 minutes / IP`.
- Register `/register`: stricter threshold, for example `10 requests / 10 minutes / IP`.
- Waitlist form endpoint, if added later: `5 submissions / hour / IP` plus optional Turnstile.

### API Routes

- `/api/plan`: strict edge rate limit by IP, for example `20 requests / minute / IP`, with application-level authenticated user limits remaining authoritative.
- `/api/market-analysis`: stricter edge rate limit by IP, for example `10 requests / minute / IP`, because it can trigger web research and premium AI calls.
- Auth-sensitive server actions should keep app-layer rate limiting and may also get Cloudflare WAF/challenge protection.
- Return `429 Too Many Requests` for rate-limit failures and avoid revealing internal quota details.
- Keep durable app-layer rate limits in Supabase/Redis/Vercel KV for authenticated users; Cloudflare IP rules are only the edge shield.

## SSL/TLS Settings

- Set Cloudflare SSL/TLS mode to `Full (strict)`.
- Enable Always Use HTTPS.
- Enable Automatic HTTPS Rewrites.
- Enable HSTS only after confirming all subdomains support HTTPS.
- Recommended HSTS once ready: `max-age=31536000`, include subdomains only when every subdomain is ready.
- Keep TLS 1.3 enabled.
- Set minimum TLS version to 1.2.
- Use Cloudflare Origin Certificates or Vercel-managed certificates; avoid flexible SSL.

## Cache Rules

### Safe To Cache

- Cache the public landing page `/` only.
- Cache static assets under `/_next/static/*`, fonts, images, and public immutable assets.
- Use conservative landing-page TTL first, for example `5-15 minutes`, until launch content stabilizes.

### Must Not Be Cached

- Do not cache authenticated `/plan`.
- Do not cache `/dashboard`, `/dashboard/*`, or any report detail page.
- Do not cache `/login`, `/register`, auth callback routes, or Supabase session-related responses.
- Do not cache `/api/plan`.
- Do not cache `/api/market-analysis`.
- Do not cache any API response that depends on cookies, Authorization headers, Supabase session, user id, workspace id, report id, or AI quota.
- Do not cache streaming responses unless the response is explicitly public and user-independent.

## Vercel Production Safety Checks

- Ensure production uses the intended Supabase project, not staging.
- Confirm `OPENAI_API_KEY` is set only as a server-side environment variable.
- Confirm Supabase service role keys are not exposed to client code and are not prefixed with `NEXT_PUBLIC_`.
- Keep preview and production environment variables separated.
- Keep production branch deployment locked to `main`.
- Enable Vercel deployment protection for preview deployments if sensitive data can appear there.
- Review build logs for accidental env output after every environment change.
- Add uptime and error monitoring for `/`, `/login`, `/plan`, `/api/plan`, and `/api/market-analysis`.
- Keep security headers active in `next.config.ts` and validate them after deployment.

## Supabase Security Checks

- Confirm Row Level Security is enabled on every user-owned table.
- Verify policies for `reports`, `report_workspaces`, `ai_conversations`, `ai_messages`, `ai_usage_events`, and `ai_response_cache`.
- Confirm users can only read/write rows where `auth.uid()` owns the resource.
- Review SECURITY DEFINER functions and make sure they do not expose cross-user private content.
- Confirm global AI cache entries do not store secrets, access tokens, or private user data.
- Keep anon key usage limited to RLS-protected operations.
- Never use service role keys in client components or browser-accessible code.
- Add migration review for every future table, policy, RPC, and trigger.
- Enable Supabase auth protections such as email confirmation, strong password policy, and rate limits where available.

## OpenAI Cost Protection Checks

- Keep `/api/plan` and `/api/market-analysis` behind Supabase authentication and private beta authorization.
- Keep per-user daily limits active: Free, Pro, and Business tiers.
- Keep edge IP rate limits as a first shield and app-level authenticated limits as the source of truth.
- Confirm `ai_usage_events` records every AI request, cache hit, failure, and rate-limited request.
- Confirm cache hits do not call OpenAI.
- Monitor cache hit ratio, total tokens, estimated cost, average response time, and 429 rate.
- Route simple requests to cheaper models and report generation to premium models only when needed.
- Keep max token limits tight per section.
- Add alerts for unusual token spikes, repeated market-analysis calls, and high-cost users.
- Consider moving long-running report generation to a queue before opening public access.

## Rollout Order

1. Enable Cloudflare Managed WAF in log mode.
2. Add public-page and API edge rate limits with conservative thresholds.
3. Add cache rules for public landing page and static assets only.
4. Confirm authenticated routes and AI APIs are never cached.
5. Review Supabase RLS and RPC functions.
6. Add monitoring alerts for auth failures, 429s, AI spend, and 5xx errors.
7. Move WAF rules from log/challenge to block only after false positives are understood.
