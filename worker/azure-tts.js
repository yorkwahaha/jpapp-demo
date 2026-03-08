const ALLOWED_ORIGINS = [
    "https://yorkwahaha.github.io",
    "http://localhost:8001",
    "http://192.168.50.107:8001"
];

const ALLOWED_VOICES = [
    "ja-JP-NanamiNeural",
    "ja-JP-MayuNeural",
    "ja-JP-NaokiNeural"
];

const MAX_REQUESTS_PER_MINUTE_TTS = 30;
const MAX_REQUESTS_PER_MINUTE_SESSION = 10;
const SESSION_TTL_SECONDS = 600;

function getCorsHeaders(requestOrigin) {
    const isAllowed = ALLOWED_ORIGINS.includes(requestOrigin);
    return {
        "Access-Control-Allow-Origin": isAllowed ? requestOrigin : ALLOWED_ORIGINS[0],
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Client-Token, X-Session-Token",
        "Access-Control-Max-Age": "86400",
        // Prevent Cloudflare edge caching — every request must reach the Worker + DO
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
        "Vary": "Origin",
    };
}

// Durable Object class for strict rate limiting
export class RateLimiter {
    constructor(state, env) {
        this.state = state;
        // In-memory buckets: { minuteTimestamp: count }
        this.buckets = new Map();
    }

    async fetch(request) {
        const url = new URL(request.url);
        if (url.pathname !== "/check") {
            return new Response("Not found", { status: 404 });
        }

        const maxRequests = parseInt(url.searchParams.get("limit") || "30", 10);

        const now = Date.now();
        const currentMinute = Math.floor(now / 60000);

        // Clean up old buckets
        for (const [minute, _] of this.buckets.entries()) {
            if (minute < currentMinute) {
                this.buckets.delete(minute);
            }
        }

        let currentCount = this.buckets.get(currentMinute) || 0;

        if (currentCount >= maxRequests) {
            const nextMinuteDate = new Date((currentMinute + 1) * 60000);
            const retryAfterSec = Math.ceil((nextMinuteDate.getTime() - now) / 1000);
            return new Response(JSON.stringify({ allowed: false, retryAfterSec, currentCount }), {
                status: 429,
                headers: { "Content-Type": "application/json" }
            });
        }

        currentCount += 1;
        this.buckets.set(currentMinute, currentCount);

        return new Response(JSON.stringify({ allowed: true, remaining: maxRequests - currentCount, currentCount }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    }
}

export default {
    async fetch(request, env, ctx) {
        const origin = request.headers.get("Origin") || "";
        let corsHeaders = getCorsHeaders(origin);

        // 1. Preflight (OPTIONS)
        if (request.method === "OPTIONS") {
            if (!ALLOWED_ORIGINS.includes(origin)) {
                return new Response(null, { status: 403, headers: corsHeaders });
            }
            return new Response(null, { headers: corsHeaders });
        }

        // 2. Strict Origin Check
        if (!ALLOWED_ORIGINS.includes(origin)) {
            return new Response("Forbidden: Invalid Origin", { status: 403, headers: corsHeaders });
        }

        // 3. Handle GET /session
        const url = new URL(request.url);
        if (request.method === "GET" && url.pathname === "/session") {
            const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "unknown";
            let rlHeaders = new Headers(corsHeaders);

            if (env.RATE_LIMITER) {
                const id = env.RATE_LIMITER.idFromName(`sess_${ip}`);
                const limiterObj = env.RATE_LIMITER.get(id);

                const rlReq = new Request(`http://internal/check?limit=${MAX_REQUESTS_PER_MINUTE_SESSION}`, { method: "POST" });
                const rlRes = await limiterObj.fetch(rlReq);
                const rlData = await rlRes.json();

                if (!rlData.allowed) {
                    rlHeaders.set("Retry-After", rlData.retryAfterSec.toString());
                    return new Response("Too Many Requests", { status: 429, headers: rlHeaders });
                }
            }

            const token = crypto.randomUUID();
            const expMillis = Date.now() + (SESSION_TTL_SECONDS * 1000);

            if (env.RATE_LIMIT_KV) {
                const kvKey = `sess:${origin}:${ip}:${token}`;
                await env.RATE_LIMIT_KV.put(kvKey, "1", { expirationTtl: SESSION_TTL_SECONDS });
            } else {
                return new Response("Internal Server Error: KV not configured", { status: 500, headers: rlHeaders });
            }

            return new Response(JSON.stringify({ token, exp: expMillis }), {
                status: 200,
                headers: {
                    ...Object.fromEntries(rlHeaders.entries()),
                    "Content-Type": "application/json"
                }
            });
        }

        // 4. Method Check for /tts
        if (request.method !== "POST" || url.pathname !== "/tts") {
            return new Response("Not found or method not allowed", { status: 404, headers: corsHeaders });
        }

        try {
            // 5. Auth Token Check
            const ip = request.headers.get("CF-Connecting-IP") || request.headers.get("x-forwarded-for") || "unknown";
            const clientTokenString = request.headers.get("X-Client-Token");
            const sessionToken = request.headers.get("X-Session-Token");
            const allowLegacyToken = (env.ALLOW_LEGACY_TOKEN || "false").toLowerCase() === "true";

            let isAuthorized = false;

            if (sessionToken) {
                if (env.RATE_LIMIT_KV) {
                    const kvKey = `sess:${origin}:${ip}:${sessionToken}`;
                    const isValid = await env.RATE_LIMIT_KV.get(kvKey);
                    if (isValid) {
                        isAuthorized = true;
                    }
                }
            } else if (allowLegacyToken && clientTokenString && env.CLIENT_TOKEN && clientTokenString === env.CLIENT_TOKEN) {
                // Fallback to legacy client token only if no session token is provided and ALLOW_LEGACY_TOKEN is true
                isAuthorized = true;
            }

            if (!isAuthorized) {
                return new Response("Unauthorized", { status: 401, headers: corsHeaders });
            }

            // 6. Rate Limiting via Durable Object
            let rlHeaders = new Headers(corsHeaders);

            if (env.RATE_LIMITER) {
                const id = env.RATE_LIMITER.idFromName(ip);
                const limiterObj = env.RATE_LIMITER.get(id);

                // Call the DO
                const rlReq = new Request(`http://internal/check?limit=${MAX_REQUESTS_PER_MINUTE_TTS}`, { method: "POST" });
                const rlRes = await limiterObj.fetch(rlReq);
                const rlData = await rlRes.json();

                // Debug headers (only attached for valid origins)
                rlHeaders.set("X-RL-IP", ip);
                rlHeaders.set("X-RL-KEY", ip); // In idFromName(ip), the input string is the key
                rlHeaders.set("X-RL-COUNT", rlData.currentCount !== undefined ? rlData.currentCount.toString() : "0");

                if (!rlData.allowed) {
                    rlHeaders.set("Retry-After", rlData.retryAfterSec.toString());
                    return new Response("Too Many Requests", { status: 429, headers: rlHeaders });
                }
            }

            // Replace corsHeaders with the enriched rlHeaders downstream
            corsHeaders = rlHeaders;

            // 6. Content-Type Check
            const contentType = request.headers.get("Content-Type") || "";
            if (!contentType.includes("application/json")) {
                return new Response("Bad Request: Invalid Content-Type", { status: 400, headers: corsHeaders });
            }

            // 7. Input Validation & Parsing
            let body;
            try {
                const rawText = await request.text();
                body = JSON.parse(rawText);
            } catch (err) {
                return new Response("Bad Request: Invalid JSON", { status: 400, headers: corsHeaders });
            }

            const text = body.text;
            const voice = body.voice || "ja-JP-MayuNeural";

            if (!text || typeof text !== "string" || text.trim().length === 0 || text.length > 200) {
                return new Response("Bad Request: Invalid text", { status: 400, headers: corsHeaders });
            }

            if (!ALLOWED_VOICES.includes(voice)) {
                return new Response("Bad Request: Invalid voice", { status: 400, headers: corsHeaders });
            }

            // (Cache intentionally disabled — rate limiting requires every request to hit the Worker)

            // 9. Azure API Call
            if (!env.AZURE_KEY || !env.AZURE_REGION) {
                return new Response("Internal Server Error", { status: 500, headers: corsHeaders });
            }

            const azureUrl = `https://${env.AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
            const safeText = text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&apos;");

            const ssml = `<speak version="1.0" xml:lang="ja-JP"><voice name="${voice}">${safeText}</voice></speak>`;

            const azureResponse = await fetch(azureUrl, {
                method: "POST",
                headers: {
                    "Ocp-Apim-Subscription-Key": env.AZURE_KEY,
                    "Content-Type": "application/ssml+xml",
                    "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3",
                    "User-Agent": "JPAPP-TTSProxy-V2"
                },
                body: ssml
            });

            if (!azureResponse.ok) {
                // Obscure internal Azure details
                return new Response("Upstream Error", { status: 502, headers: corsHeaders });
            }

            // 10. Respond (no edge cache)
            const audioBuffer = await azureResponse.arrayBuffer();
            const resHeaders = new Headers(corsHeaders);
            resHeaders.set("Content-Type", "audio/mpeg");

            return new Response(audioBuffer, { status: 200, headers: resHeaders });

        } catch (err) {
            // Obscure internal worker exceptions
            return new Response("Internal Server Error", { status: 500, headers: corsHeaders });
        }
    }
};
