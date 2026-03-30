// 【導師語音策略】
// 1. 本地導師音檔優先（assets/audio/tutor/）
// 2. 本地音檔不存在或播放失敗時，fallback 到此 Cloud TTS Worker
// 3. 中文導師台詞（zh-TW-Neural2-B / zh-TW-Wavenet-B）由此 Worker
//    透過 VOICE_REMAP 轉換為 Google 真正可用的 cmn-TW-Wavenet-* 送出
// 4. 日文台詞直接送 ja-JP-* voice，不需 remap
// 5. TTS 為保底機制，正式體驗建議以本地錄音為主
// 6. azure-tts.js 保留備用，wrangler.toml main 請維持 google-tts.js

const ALLOWED_ORIGINS = [
    "https://yorkwahaha.github.io",
    "http://localhost:8001",
    "http://192.168.50.107:8001"
];

const ALLOWED_VOICES = [
    "ja-JP-Standard-A",
    "ja-JP-Wavenet-A",
    "ja-JP-Neural2-B",
    "ja-JP-Wavenet-D",
    "zh-TW-Neural2-B",
    "zh-TW-Wavenet-B"
];

const VOICE_REMAP = {
    "zh-TW-Neural2-B": "cmn-TW-Wavenet-A",
    "zh-TW-Wavenet-B": "cmn-TW-Wavenet-B"
};

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
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
        "Vary": "Origin",
    };
}

// Durable Object class for strict rate limiting (Identical to Azure version)
export class RateLimiter {
    constructor(state, env) {
        this.state = state;
        this.buckets = new Map();
    }

    async fetch(request) {
        const url = new URL(request.url);
        if (url.pathname !== "/check") return new Response("Not found", { status: 404 });
        const maxRequests = parseInt(url.searchParams.get("limit") || "30", 10);
        const now = Date.now();
        const currentMinute = Math.floor(now / 60000);

        for (const [minute, _] of this.buckets.entries()) {
            if (minute < currentMinute) this.buckets.delete(minute);
        }
        let currentCount = this.buckets.get(currentMinute) || 0;
        if (currentCount >= maxRequests) {
            const nextMinuteDate = new Date((currentMinute + 1) * 60000);
            const retryAfterSec = Math.ceil((nextMinuteDate.getTime() - now) / 1000);
            return new Response(JSON.stringify({ allowed: false, retryAfterSec, currentCount }), {
                status: 429, headers: { "Content-Type": "application/json" }
            });
        }
        currentCount += 1;
        this.buckets.set(currentMinute, currentCount);
        return new Response(JSON.stringify({ allowed: true, remaining: maxRequests - currentCount, currentCount }), {
            status: 200, headers: { "Content-Type": "application/json" }
        });
    }
}

export default {
    async fetch(request, env, ctx) {
        const origin = request.headers.get("Origin") || "";
        console.error(`[TTS-ENTRY] method=${request.method} path=${new URL(request.url).pathname} origin=${origin}`);
        let corsHeaders = getCorsHeaders(origin);

        if (request.method === "OPTIONS") {
            console.error(`[TTS-OPTIONS] origin_allowed=${ALLOWED_ORIGINS.includes(origin)}`);
            if (!ALLOWED_ORIGINS.includes(origin)) return new Response(null, { status: 403, headers: corsHeaders });
            return new Response(null, { headers: corsHeaders });
        }

        if (!ALLOWED_ORIGINS.includes(origin)) {
            console.error(`[TTS-FORBIDDEN] origin=${origin}`);
            return new Response("Forbidden", { status: 403, headers: corsHeaders });
        }

        const url = new URL(request.url);

        // 1. Session Token Generation
        if (request.method === "GET" && url.pathname === "/session") {
            console.error("[TTS-SESSION] entered");
            const ip = request.headers.get("CF-Connecting-IP") || "unknown";
            let rlHeaders = new Headers(corsHeaders);
            if (env.RATE_LIMITER) {
                const id = env.RATE_LIMITER.idFromName(`sess_${ip}`);
                const limiterObj = env.RATE_LIMITER.get(id);
                const rlRes = await limiterObj.fetch(new Request(`http://internal/check?limit=${MAX_REQUESTS_PER_MINUTE_SESSION}`, { method: "POST" }));
                const rlData = await rlRes.json();
                if (!rlData.allowed) {
                    rlHeaders.set("Retry-After", rlData.retryAfterSec.toString());
                    return new Response("Too Many Requests", { status: 429, headers: rlHeaders });
                }
            }
            const token = crypto.randomUUID();
            const expMillis = Date.now() + (SESSION_TTL_SECONDS * 1000);
            if (env.RATE_LIMIT_KV) {
                await env.RATE_LIMIT_KV.put(`sess:${origin}:${ip}:${token}`, "1", { expirationTtl: SESSION_TTL_SECONDS });
            } else return new Response("KV missing", { status: 500, headers: rlHeaders });

            return new Response(JSON.stringify({ token, exp: expMillis }), {
                status: 200, headers: { ...Object.fromEntries(rlHeaders.entries()), "Content-Type": "application/json" }
            });
        }

        if (request.method !== "POST" || url.pathname !== "/tts") {
            console.error(`[TTS-NOT-FOUND] method=${request.method} path=${url.pathname}`);
            return new Response("Not found", { status: 404, headers: corsHeaders });
        }

        console.error("[TTS-POST] entered");
        try {
            // 2. Authorization
            const ip = request.headers.get("CF-Connecting-IP") || "unknown";
            const sessionToken = request.headers.get("X-Session-Token");
            let isAuthorized = false;
            if (sessionToken && env.RATE_LIMIT_KV) {
                const isValid = await env.RATE_LIMIT_KV.get(`sess:${origin}:${ip}:${sessionToken}`);
                if (isValid) isAuthorized = true;
            }
            console.error(`[TTS-AUTH] sessionToken=${!!sessionToken} isAuthorized=${isAuthorized}`);
            if (!isAuthorized) {
                console.error("[TTS-401] unauthorized - returning early");
                return new Response("Unauthorized", { status: 401, headers: corsHeaders });
            }

            // 3. Rate Limiting
            if (env.RATE_LIMITER) {
                const id = env.RATE_LIMITER.idFromName(ip);
                const rlRes = await env.RATE_LIMITER.get(id).fetch(new Request(`http://internal/check?limit=${MAX_REQUESTS_PER_MINUTE_TTS}`, { method: "POST" }));
                const rlData = await rlRes.json();
                if (!rlData.allowed) {
                    const h = new Headers(corsHeaders);
                    h.set("Retry-After", rlData.retryAfterSec.toString());
                    return new Response("Too Many Requests", { status: 429, headers: h });
                }
            }

            // 4. Input Parsing
            console.error("[TTS-BEFORE-BODY] about to parse JSON");
            let body;
            try {
                body = await request.json();
            } catch (e) {
                console.error("Worker Payload Parse Error:", e);
                return new Response(`Invalid JSON body: ${e.message}`, { status: 400, headers: corsHeaders });
            }

            console.error(`[TTS-AFTER-BODY] voice=${JSON.stringify(body.voice)} text_prefix=${String(body.text||"").slice(0,20)}`);
            console.error("[TTS] body.voice raw:", JSON.stringify(body.voice));
            console.error("[TTS] body.text prefix:", String(body.text || "").slice(0, 20));

            const text = body.text;
            const voice = body.voice || "ja-JP-Neural2-B";
            const rate = parseFloat(body.rate) || 1.0;
            const pitch = parseFloat(body.pitch) || 0.0; // Google pitch is semitones, Azure is percentage. 

            console.error(`[TTS-VOICE-CHECK] incoming=${voice} inList=${ALLOWED_VOICES.includes(voice)}`);

            if (!text) return new Response("Missing 'text' field", { status: 400, headers: corsHeaders });
            if (text.length > 1000) return new Response(`Text too long: ${text.length} chars (Limit 1000)`, { status: 400, headers: corsHeaders });
            if (!ALLOWED_VOICES.includes(voice)) {
                const msg = `Invalid voice: incoming=${voice} allowed=${ALLOWED_VOICES.join(',')}`;
                console.error(`[TTS-400-HIT] reason=voice_not_in_list incoming=${voice}`);
                return new Response(msg, { status: 400, headers: corsHeaders });
            }
            console.error(`[TTS-VOICE-OK] passed whitelist voice=${voice}`);

            // 5. Google Cloud TTS Upstream
            if (!env.GOOGLE_API_KEY) return new Response("Config missing", { status: 500, headers: corsHeaders });

            const resolvedVoice = VOICE_REMAP[voice] || voice;
            const remapped = resolvedVoice !== voice;
            const langCode = resolvedVoice.startsWith("cmn-TW") ? "cmn-TW" : "ja-JP";
            console.error(`[TTS-REMAP] hit=${remapped} incoming=${voice} resolved=${resolvedVoice} lang=${langCode}`);

            const googleVoicePayload = { languageCode: langCode, name: resolvedVoice };
            console.error("[TTS-GOOGLE-PAYLOAD]", JSON.stringify(googleVoicePayload));

            const googleUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GOOGLE_API_KEY}`;
            const googleResponse = await fetch(googleUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    input: { text },
                    voice: googleVoicePayload,
                    audioConfig: {
                        audioEncoding: "MP3",
                        speakingRate: Math.max(0.25, Math.min(4.0, rate)),
                        pitch: isNaN(pitch) ? 0.0 : Math.max(-20.0, Math.min(20.0, pitch))
                    }
                })
            });

            if (!googleResponse.ok) {
                const errorText = await googleResponse.text();
                console.error(`[TTS] Google API Error: status=${googleResponse.status} incoming=${voice} resolved=${resolvedVoice} lang=${langCode} body=${errorText}`);
                return new Response(`Google API Error: ${googleResponse.status} incoming=${voice} resolved=${resolvedVoice} lang=${langCode} ${errorText}`, { status: 502, headers: corsHeaders });
            }

            const data = await googleResponse.json();
            if (!data.audioContent) {
                console.error("Google API Response missing audioContent:", data);
                return new Response("No audio content from Google", { status: 500, headers: corsHeaders });
            }

            // 6. Return binary MP3
            const binaryString = atob(data.audioContent);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

            const resHeaders = new Headers(corsHeaders);
            resHeaders.set("Content-Type", "audio/mpeg");
            return new Response(bytes.buffer, { status: 200, headers: resHeaders });

        } catch (err) {
            console.error("Worker Internal Error:", err);
            return new Response(`Internal Error: ${err.message}`, { status: 500, headers: corsHeaders });
        }
    }
};
