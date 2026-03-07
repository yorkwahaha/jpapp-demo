(function () {
    'use strict';

    const MAX_LINES = 25;
    const LOG_COLORS = { log: '#7fff7f', warn: '#ffd700', error: '#ff6b6b' };
    const FOCUS_KEYWORDS = ['[BGM]', '[AZURE]', '[PRAISE]'];
    window.__DEBUG_OVERLAY_MODE = 'focus';
    let _lines = [];
    let _el = null;
    let _enabled = false;

    function _ts() {
        const d = new Date();
        return String(d.getMinutes()).padStart(2, '0') + ':' +
            String(d.getSeconds()).padStart(2, '0') + '.' +
            String(d.getMilliseconds()).padStart(3, '0');
    }

    function _createOverlay() {
        if (_el) return;
        _el = document.createElement('div');
        _el.id = 'debugOverlay';
        Object.assign(_el.style, {
            position: 'fixed', top: '8px', right: '8px', zIndex: '9999999',
            background: 'rgba(0,0,0,0.72)', color: '#7fff7f',
            font: '11px/1.45 monospace', padding: '6px 8px', borderRadius: '8px',
            maxHeight: '35vh', width: 'min(90vw, 420px)', overflowY: 'hidden',
            whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            pointerEvents: 'none', display: 'none',
            boxShadow: '0 2px 12px rgba(0,0,0,.5)',
            opacity: '0.92'
        });
        document.body.appendChild(_el);
    }

    function _render() {
        if (!_el) return;
        _el.innerHTML = _lines.slice(-MAX_LINES).join('\n');
        _el.scrollTop = _el.scrollHeight;
    }

    function _push(level, args) {
        if (!_enabled) return;
        const msg = args.map(a => {
            if (typeof a === 'string') return a;
            try { return JSON.stringify(a); } catch { return String(a); }
        }).join(' ');

        if (window.__DEBUG_OVERLAY_MODE === 'focus' && level === 'log') {
            const isFocus = FOCUS_KEYWORDS.some(k => msg.includes(k));
            if (!isFocus) return;
        }

        if (!_el) _createOverlay();
        const color = LOG_COLORS[level] || '#7fff7f';
        const prefix = level === 'warn' ? '⚠ ' : level === 'error' ? '✖ ' : '';
        _lines.push(`<span style="color:${color}">[${_ts()}] ${prefix}${_escHtml(msg)}</span>`);
        if (_lines.length > MAX_LINES * 2) _lines = _lines.slice(-MAX_LINES);
        _render();
    }

    function _escHtml(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    const _orig = { log: console.log, warn: console.warn, error: console.error };
    ['log', 'warn', 'error'].forEach(lvl => {
        console[lvl] = function (...args) {
            _orig[lvl].apply(console, args);
            _push(lvl, args);
        };
    });

    function _enable() {
        if (_enabled) return;
        _enabled = true;
        window.__AUDIO_DEBUG = true;
        if (!_el) _createOverlay();
        _el.style.display = 'block';
        console.log('[DebugOverlay] ON — listening');
    }

    function _disable() {
        _enabled = false;
        if (_el) _el.style.display = 'none';
        _orig.log.call(console, '[DebugOverlay] OFF');
    }

    window.__overlayPush = (tag, msg) => {
        if (!_enabled) return;
        if (window.__DEBUG_OVERLAY_MODE === 'focus') {
            const isFocus = FOCUS_KEYWORDS.some(k => tag.includes(k) || msg.includes(k));
            if (!isFocus) return;
        }
        if (!_el) _createOverlay();
        const color = LOG_COLORS['log'] || '#7fff7f';
        _lines.push(`<span style="color:${color}">[${_ts()}] ${_escHtml(tag + ' ' + msg)}</span>`);
        if (_lines.length > MAX_LINES * 2) _lines = _lines.slice(-MAX_LINES);
        _render();
    };

    window.__debugOverlayOn = _enable;
    window.__debugOverlayOff = _disable;
    Object.defineProperty(window, '__DEBUG_OVERLAY', {
        get() { return _enabled; },
        set(v) { v ? _enable() : _disable(); },
        configurable: true
    });

    if (location.hash === '#debug' || new URLSearchParams(location.search).has('debug')) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', _enable, { once: true });
        } else {
            _enable();
        }
    }

    let _lpTimer = null;
    let _lpTimer4s = null;
    document.addEventListener('pointerdown', function (e) {
        const t = e.target.closest('#menuBtn, [data-debug-toggle], button');
        if (!t) return;
        const txt = (t.id + ' ' + t.textContent + ' ' + (t.getAttribute('aria-label') || '')).toLowerCase();
        if (!txt.includes('menu') && !txt.includes('系統') && !txt.includes('system') && t.id !== 'menuBtn') return;

        _lpTimer = setTimeout(() => {
            _enabled ? _disable() : _enable();
            t.style.outline = '2px solid #0f0';
            setTimeout(() => { t.style.outline = ''; }, 600);
        }, 2000);

        _lpTimer4s = setTimeout(() => {
            window.__DEBUG_OVERLAY_MODE = window.__DEBUG_OVERLAY_MODE === 'focus' ? 'all' : 'focus';
            t.style.outline = '2px solid #f0f';
            setTimeout(() => { t.style.outline = ''; }, 600);
            _orig.log.call(console, `[Overlay] mode=${window.__DEBUG_OVERLAY_MODE}`);
            _push('log', [`[Overlay] mode=${window.__DEBUG_OVERLAY_MODE}`]);
        }, 4000);
    }, true);

    const _clearLp = () => {
        if (_lpTimer) { clearTimeout(_lpTimer); _lpTimer = null; }
        if (_lpTimer4s) { clearTimeout(_lpTimer4s); _lpTimer4s = null; }
    };
    document.addEventListener('pointerup', _clearLp, true);
    document.addEventListener('pointerleave', _clearLp, true);
    document.addEventListener('pointermove', _clearLp, true);
})();

const { createApp, ref, reactive, computed, watch, onMounted, nextTick } = Vue;

const TTS_AUDIO_BASE = "assets/audio/tts/";
const ttsExistCache = new Map();
let currentTtsAudio = null;
const sharedTtsAudio = new Audio();
const primeAudio = new Audio();
let isTtsPrimed = false;

window.primeVoiceOnGesture = () => {
    try {
        const a = primeAudio;
        if (!a.src || a.src === window.location.href) {
            a.src = "data:audio/mp3;base64,//OlkAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAFAAAH8AADBQQOExUaHh8lJygqMTIzNzo9P0JFREQv";
        }
        a.volume = 0;
        const p = a.play();
        if (p !== undefined) {
            p.then(() => {
                a.pause();
                a.volume = 1;
                if (!isTtsPrimed) {
                    isTtsPrimed = true;
                    console.log('[PRAISE] flick-gesture prime ok');
                }
            }).catch(() => { });
        }
    } catch (e) { }
};

function ttsKeyToFile(key) {
    return key.replace(/\./g, "_") + ".mp3";
}

async function audioFileExists(url) {
    if (ttsExistCache.has(url)) return ttsExistCache.get(url);
    try {
        const res = await fetch(url, { method: "HEAD", cache: "no-store" });
        const ok = res.ok;
        ttsExistCache.set(url, ok);
        return ok;
    } catch {
        ttsExistCache.set(url, false);
        return false;
    }
}

function stopTtsAudio() {
    if (currentTtsAudio) {
        try {
            currentTtsAudio.pause();
            currentTtsAudio.currentTime = 0;
        } catch { }
        currentTtsAudio = null;
    }
}

function stopWebSpeech() {
    if ("speechSynthesis" in window) {
        try { window.speechSynthesis.cancel(); } catch { }
    }
}

function getPreferredTtsVoice() {
    try {
        const raw = localStorage.getItem('jpRpgSettingsV1');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.ttsVoice && ['ja-JP-NanamiNeural', 'ja-JP-MayuNeural', 'ja-JP-NaokiNeural'].includes(parsed.ttsVoice)) {
                return parsed.ttsVoice;
            }
        }
    } catch (e) { }
    return "ja-JP-MayuNeural";
}

async function playTtsKey(key, fallbackText, azureVoiceName = null) {
    if (!azureVoiceName) azureVoiceName = getPreferredTtsVoice();
    stopWebSpeech();
    stopTtsAudio();

    const url = TTS_AUDIO_BASE + ttsKeyToFile(key);

    if (await audioFileExists(url)) {
        console.log(`[FALLBACK] audio file exists: ${url}`);
        const a = sharedTtsAudio;
        a.src = url;
        a.preload = "auto";
        currentTtsAudio = a;
        try {
            await a.play();
            console.log(`[FALLBACK] audio play ok`);
            return { used: "audio", key, url };
        } catch (e) {
            console.warn(`[FALLBACK] audio play error:`, e?.message || e);
        }
    }

    if (fallbackText) {
        const azureSuccess = await speakAzure(fallbackText, azureVoiceName);
        if (azureSuccess) {
            return { used: "azure", key };
        }
    }

    if (fallbackText && "speechSynthesis" in window) {
        console.log('[SPEECH] start (WebSpeech fallback)', fallbackText.slice(0, 20));
        try {
            const u = new SpeechSynthesisUtterance(fallbackText);
            u.lang = "ja-JP";
            u.rate = 1.0;
            u.pitch = 1.0;

            u.onend = () => console.log('[SPEECH] end');
            u.onerror = (e) => console.warn('[SPEECH] error', e?.error || "unknown");

            window.speechSynthesis.speak(u);
            return { used: "webspeech", key };
        } catch (e) {
            console.warn('[SPEECH] error', e?.message || e);
        }
    }

    console.warn('[FALLBACK] All methods failed for:', key);
    return { used: "none", key };
}

function getAzureSpeechKey() {
    try {
        if (window.__AZURE_SPEECH_KEY) return window.__AZURE_SPEECH_KEY;
        const m = document.querySelector('meta[name="azure-speech-key"]');
        if (m && m.content) return m.content;
    } catch { }
    return null;
}

function getAzureSpeechRegion() {
    try {
        if (window.__AZURE_SPEECH_REGION) return window.__AZURE_SPEECH_REGION;
        const m = document.querySelector('meta[name="azure-speech-region"]');
        if (m && m.content) return m.content;
    } catch { }
    return "japaneast";
}

const TTS_PROXY_URL = "https://jpapp-tts-proxy.yorkwahaha.workers.dev/tts";
const TTS_SESSION_URL = "https://jpapp-tts-proxy.yorkwahaha.workers.dev/session";

let sessionTokenData = null;

async function getSessionToken() {
    if (sessionTokenData && sessionTokenData.exp > Date.now() + 5000) {
        return sessionTokenData.token;
    }

    try {
        const res = await fetch(TTS_SESSION_URL);
        if (!res.ok) {
            console.warn('[SESSION] fetch fail', res.status);
            return null;
        }
        const data = await res.json();
        sessionTokenData = data;
        return data.token;
    } catch (e) {
        console.warn('[SESSION] fetch error', e?.message || e);
        return null;
    }
}

// 🌟 解鎖語速與語調控制的 speakAzure
async function speakAzure(text, voiceShortName = null) {
    // 讀取自訂語速與語調 (預設為 1.0)
    let customRate = "1.0";
    let customPitch = "default";
    try {
        const raw = localStorage.getItem('jpRpgSettingsV1');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.ttsVoice && !voiceShortName) voiceShortName = parsed.ttsVoice;
            if (parsed.ttsRate) customRate = String(parsed.ttsRate);
            if (parsed.ttsPitch) customPitch = String(parsed.ttsPitch);
        }
    } catch (e) { }
    if (!voiceShortName) voiceShortName = getPreferredTtsVoice();

    const key = getAzureSpeechKey();
    const region = getAzureSpeechRegion();
    const endpoint = region ? `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1` : null;

    if (!text) return false;
    stopWebSpeech();
    stopTtsAudio();

    let res;

    if (key) {
        // 使用 prosody 標籤將語速與音調注入
        const ssml =
            `<speak version="1.0" xml:lang="ja-JP">
  <voice name="${voiceShortName}">
    <prosody rate="${customRate}" pitch="${customPitch}">
      ${text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;")}
    </prosody>
  </voice>
</speak>`;
        try {
            res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Ocp-Apim-Subscription-Key": key,
                    "Content-Type": "application/ssml+xml",
                    "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3"
                },
                body: ssml
            });
        } catch (e) { return false; }
    } else {
        let retryCount = 0;
        let success = false;
        while (retryCount < 2 && !success) {
            const token = await getSessionToken();
            if (!token) return false;
            try {
                res = await fetch(TTS_PROXY_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Session-Token": token
                    },
                    body: JSON.stringify({
                        text: text,
                        voice: voiceShortName,
                        rate: customRate,   // 🌟 傳遞自訂語速
                        pitch: customPitch  // 🌟 傳遞自訂語調
                    })
                });
                if (res.status === 401) { sessionTokenData = null; retryCount++; continue; }
                success = true;
            } catch (e) { return false; }
        }
    }

    if (!res || !res.ok) return false;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = sharedTtsAudio;
    a.src = url;
    currentTtsAudio = a;
    try {
        await a.play();
        a.onended = () => { try { URL.revokeObjectURL(url); } catch { } };
        return true;
    } catch (e) {
        try { URL.revokeObjectURL(url); } catch { }
        return false;
    }
}

function getCurrentQuestionTtsKey() {
    try {
        if (typeof currentQuestionId !== "undefined" && currentQuestionId) return "question." + currentQuestionId;
        if (typeof questionId !== "undefined" && questionId) return "question." + questionId;
        if (typeof qId !== "undefined" && qId) return "question." + qId;
        if (typeof questionKey !== "undefined" && questionKey) return "question." + questionKey;
        if (typeof skillId !== "undefined" && skillId) return "question.skill_" + skillId;
    } catch { }
    return "question.dynamic";
}

const battleLogs = [];
function pushBattleLog(text, type = "info") {
    battleLogs.unshift({ text, type, _isNew: true });
    if (battleLogs.length > 5) {
        battleLogs.pop();
    }
    renderBattleLog();
    flashBattleLog();
}

function renderBattleLog() {
    const container = document.getElementById('battleLog');
    if (!container) return;

    container.innerHTML = '';
    if (battleLogs.length > 0) {
        const log = battleLogs[0];
        const div = document.createElement('div');
        div.className = `log-item type-${log.type}`;
        div.textContent = log.text;

        if (log._isNew) {
            div.style.animation = 'fadeInLog 0.3s ease-out forwards';
            log._isNew = false;
        }

        container.appendChild(div);
    }
}

function flashBattleLog() {
    const el = document.getElementById("battleLog");
    if (!el) return;
    el.classList.remove("flash");
    void el.offsetWidth;
    el.classList.add("flash");
    window.setTimeout(() => el.classList.remove("flash"), 220);
}

function formatBattleMsg({ actor, action, value, extra }) {
    let msg = "";
    if (actor) msg += actor;
    if (action) msg += action;
    if (value) msg += " " + value;
    if (extra) msg += " (" + extra + ")";
    return msg.trim();
}

function setHeroAvatar(state) {
    const el = document.getElementById('heroAvatar');
    if (!el) return;
    el.dataset.state = state;
    if (state === 'neutral') el.src = 'assets/images/hero/hero_neutral.png';
    else if (state === 'hit') el.src = 'assets/images/hero/hero_hit.png';
    else if (state === 'lose') el.src = 'assets/images/hero/hero_lose.png';
    else if (state === 'win') el.src = 'assets/images/hero/hero_win.png';
    else if (state === 'scary') el.src = 'assets/images/hero/hero_scary.png';
    else if (state === 'ase') el.src = 'assets/images/hero/hero_ase.png';
}

function flashHeroHit(hpPct = 1.0, ms = 1000) {
    const el = document.getElementById('heroAvatar');
    if (!el) return;
    if (el.dataset.state === 'lose' || el.dataset.state === 'win') return;
    setHeroAvatar('hit');
    setTimeout(() => {
        if (el && el.dataset.state !== 'lose' && el.dataset.state !== 'win') {
            if (hpPct <= 0.4) {
                setHeroAvatar('scary');
            } else if (hpPct < 0.8) {
                setHeroAvatar('ase');
            } else {
                setHeroAvatar('neutral');
            }
        }
    }, ms);
}

const heroStatusTimers = { speedUntil: 0, evadeUntil: 0 };
const heroBuffs = { enemyAtbMult: 1.0, enemyDmgMult: 1.0, odoodoTurns: 0, wakuwakuTurns: 0, monsterSleep: false };

function setSpeedStatus(ms) {
    heroStatusTimers.speedUntil = Date.now() + ms;
    showStatusToast('💨 加速・閃避', { bg: 'rgba(56,189,248,0.92)', border: '#7dd3fc', color: '#0c4a6e' });
    updateHeroStatusBar();
    window.setTimeout(updateHeroStatusBar, ms + 50);
}

let _toastTimer = null;
function showStatusToast(label, { bg = 'rgba(251,191,36,0.92)', border = '#fbbf24', color = '#1c1400' } = {}) {
    const existing = document.getElementById('statusToast');
    if (existing) existing.remove();
    if (_toastTimer) { clearTimeout(_toastTimer); _toastTimer = null; }

    const el = document.createElement('div');
    el.id = 'statusToast';
    el.className = 'status-toast';
    el.style.cssText = `background:${bg}; border:2px solid ${border}; color:${color};`;
    el.textContent = label;
    document.body.appendChild(el);

    _toastTimer = setTimeout(() => {
        if (el.parentNode) {
            el.classList.add('out');
            setTimeout(() => el.remove(), 260);
        }
        _toastTimer = null;
    }, 1200);
}

function clearSpeedStatus() {
    heroStatusTimers.speedUntil = 0;
    updateHeroStatusBar();
}

function getHeroHpRatioBestEffort() {
    try {
        if (typeof heroHP !== "undefined" && typeof heroMaxHP !== "undefined" && heroMaxHP) return heroHP / heroMaxHP;
    } catch { }
    try {
        const hpText = document.querySelector(".hero-hp-text, [data-hero-hp]")?.textContent;
    } catch { }
    return null;
}

function hasSpeedOrEvadeBuffBestEffort() {
    if (Date.now() < heroStatusTimers.speedUntil) return true;
    try {
        if (typeof isEvadeBuff !== "undefined" && isEvadeBuff) return true;
        if (typeof isSpeedBuff !== "undefined" && isSpeedBuff) return true;
        if (typeof speedMultiplier !== "undefined" && speedMultiplier > 1.01) return true;
    } catch { }
    return false;
}

function updateHeroStatusBar() {
    const bar = document.getElementById("heroStatusBar");
    if (!bar) return;

    const hasSpeed = hasSpeedOrEvadeBuffBestEffort();

    const existing = bar.querySelector('.pill-speed');
    if (hasSpeed && !existing) {
        const span = document.createElement('span');
        span.className = 'hero-status-pill speed pill-speed';
        span.title = '加速／閃避';
        span.textContent = '速';
        bar.appendChild(span);
    } else if (!hasSpeed && existing) {
        existing.remove();
    }

    if (window.updateSpUI) window.updateSpUI();
}

function updateMonsterStatusBar() {
    const bar = document.getElementById("monsterStatusBar");
    if (!bar) return;

    const wantOdoodo = heroBuffs.odoodoTurns > 0;
    const wantWakuwaku = heroBuffs.wakuwakuTurns > 0;
    const wantSleep = !!heroBuffs.monsterSleep;

    const pillOdoodo = bar.querySelector('.pill-ododo');
    const pillWakuwaku = bar.querySelector('.pill-wakuwaku');
    const pillSleep = bar.querySelector('.pill-sleep');

    if (wantOdoodo && !pillOdoodo) {
        const span = document.createElement('span');
        span.className = 'hero-status-pill speed pill-ododo';
        span.title = `緩速 (${heroBuffs.odoodoTurns} 回合)`;
        span.textContent = '遲';
        bar.appendChild(span);
    } else if (wantOdoodo && pillOdoodo) {
        pillOdoodo.title = `緩速 (${heroBuffs.odoodoTurns} 回合)`;
    } else if (!wantOdoodo && pillOdoodo) {
        pillOdoodo.remove();
    }

    if (wantWakuwaku && !pillWakuwaku) {
        const span = document.createElement('span');
        span.className = 'hero-status-pill speed pill-wakuwaku';
        span.title = `減傷 (${heroBuffs.wakuwakuTurns} 回合)`;
        span.textContent = '衰';
        bar.appendChild(span);
    } else if (wantWakuwaku && pillWakuwaku) {
        pillWakuwaku.title = `減傷 (${heroBuffs.wakuwakuTurns} 回合)`;
    } else if (!wantWakuwaku && pillWakuwaku) {
        pillWakuwaku.remove();
    }

    if (wantSleep && !pillSleep) {
        const span = document.createElement('span');
        span.className = 'hero-status-pill speed pill-sleep';
        span.title = '睡眠';
        span.textContent = '眠';
        bar.appendChild(span);
    } else if (!wantSleep && pillSleep) {
        pillSleep.remove();
    }
}

window.__sp = { cur: 20, max: 20 };

window.updateSpUI = function () {
    const fill = document.getElementById("spFill");
    const text = document.getElementById("spText");
    if (fill && text) {
        text.textContent = `${window.__sp.cur}/${window.__sp.max}`;
        const pct = Math.max(0, Math.min(100, (window.__sp.cur / window.__sp.max) * 100));
        fill.style.width = `${pct}%`;
    }
};

console.log('Vue版本:', Vue);
console.log('開始創建應用...');
createApp({
    setup() {
        onMounted(() => {
            const h = location.hostname;
            const isLocal = h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0'
                || /^192\.168\./.test(h) || /^10\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h);
            if (!isLocal) return;

            const path = 'config.local.js';
            const script = document.createElement('script');
            script.src = path;
            script.onload = () => console.log(`[AZURE] config.local.js loaded`);
            script.onerror = () => { };
            document.head.appendChild(script);
        });

        const db = {
            places: [{ j: "部屋", r: "へや", t: "房間" }, { j: "学校", r: "がっこう", t: "學校" }, { j: "図書館", r: "としょかん", t: "圖書館" }, { j: "庭", r: "にわ", t: "院子" }, { j: "教室", r: "きょうしつ", t: "教室" }],
            objects: [
                { j: "本", r: "ほん", t: "書", type: "read", exists: true },
                { j: "料理", r: "りょうり", t: "料理", type: "eat", exists: true },
                { j: "音楽", r: "おんがく", t: "音樂", type: "hear", exists: false },
                { j: "手紙", r: "てがみ", t: "信", type: "write", exists: true },
                { j: "日記", r: "にっき", t: "日記", type: "write", exists: true },
                { j: "パン", r: "ぱん", t: "麵包", type: "eat", exists: true },
                { j: "プレゼント", r: "ぷれぜんと", t: "禮物", type: "give", exists: true }
            ],
            people: [{ j: "友達", r: "ともだち", t: "朋友" }, { j: "先生", r: "せんせい", t: "老師" }, { j: "母", r: "はは", t: "媽媽" }],
            tools: [{ j: "ペン", r: "ぺん", t: "筆" }, { j: "スマホ", r: "すまほ", t: "手機" }, { j: "はし", r: "はし", t: "筷子" }],
            grammarTips: {
                move: "「へ」或「に」表示移動的目標、方向，接在場所後表示「往～去」。",
                placeAction: "「で」表示動作發生的場所；「を」表示動作的受詞（讀什麼、吃什麼）。",
                existence: "「に」表示物品存在的場所；「が」表示主語（有什麼）。",
                accompany: "「と」表示一起做事的對象（和誰）；「を」表示動作的受詞。",
                tool: "「で」表示使用的工具或手段（用什麼）；「を」表示動作的受詞。",
                give: "「に」表示給予的對象（給誰）；「を」表示給予的物品。"
            }
        };

        const fallbackLevels = {
            1: { blanks: 1, types: [0, 1, 2], title: '森林' },
            2: { blanks: 1, types: [0, 1, 2, 3, 4, 5], title: '洞窟' },
            3: { blanks: 2, types: [0, 1, 2, 3, 4, 5], title: '魔王城' }
        };
        const LEVEL_CONFIG = ref(fallbackLevels);
        const SKILLS = ref([]);
        const VOCAB = ref(null);

        const APP_VERSION = "26030702"
        const appVersion = ref(APP_VERSION);
        const VFX_ENHANCED = true;

        const SETTINGS_KEY = 'jpRpgSettingsV1';
        const settings = reactive({
            autoReadOnWrong: true,
            correctAdvanceDelayMs: null,
            wrongAdvanceDelayMs: null,
            enemyAttackMode: 'atb',
            feedbackStyle: 'combat',
            ttsVoice: 'ja-JP-MayuNeural'
        });
        const VALID_TTS_VOICES = ['ja-JP-NanamiNeural', 'ja-JP-MayuNeural', 'ja-JP-NaokiNeural'];
        const DEFAULT_TTS_VOICE = 'ja-JP-MayuNeural';
        const _settingsDefaults = { autoReadOnWrong: true, correctAdvanceDelayMs: null, wrongAdvanceDelayMs: null, enemyAttackMode: 'atb', feedbackStyle: 'combat', ttsVoice: DEFAULT_TTS_VOICE };
        const loadSettings = () => {
            try {
                const raw = localStorage.getItem(SETTINGS_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    Object.keys(_settingsDefaults).forEach(k => {
                        if (parsed[k] !== undefined) settings[k] = parsed[k];
                    });
                }
                if (!settings.ttsVoice || !VALID_TTS_VOICES.includes(settings.ttsVoice)) {
                    settings.ttsVoice = DEFAULT_TTS_VOICE;
                }
            } catch (e) { console.warn('[Settings] load error', e); }
        };
        const saveSettings = () => {
            try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings })); } catch (e) { }
        };
        loadSettings();
        watch(settings, saveSettings, { deep: true });

        const isChangelogOpen = ref(false);
        const uiMenuOpen = ref(false);
        const answerMode = ref('tap');
        const flickState = reactive({
            activeOpt: null,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            isArmed: false,
            successOpt: null,
            capturedEl: null
        });
        const changelogData = ref([]);
        const changelogError = ref(false);
        const openChangelog = async () => {
            isChangelogOpen.value = true;
            if (changelogData.value.length === 0 && !changelogError.value) {
                try {
                    const res = await fetch(`assets/data/changelog.json?v=${APP_VERSION}`);
                    if (res.ok) {
                        changelogData.value = await res.json();
                        changelogError.value = false;
                    } else {
                        changelogError.value = true;
                    }
                } catch (e) {
                    changelogError.value = true;
                }
            }
        };

        const skillsAll = ref({});
        const skillUnlockMap = ref({});
        const unlockedSkillIds = ref([]);
        const newlyUnlocked = ref([]);
        const isSkillUnlockModalOpen = ref(false);
        const isCodexOpen = ref(false);
        const expandedSkillId = ref(null);

        const skillsWithUnlockLevel = computed(() => {
            const unlocked = [];
            const locked = [];
            SKILLS.value.forEach(s => {
                if (unlockedSkillIds.value.includes(s.id)) unlocked.push(s);
                else locked.push(s);
            });
            unlocked.sort((a, b) => {
                if (a.particle !== b.particle) return (a.particle || '').localeCompare(b.particle || '', 'ja');
                return (a.rank || 0) - (b.rank || 0);
            });
            locked.sort((a, b) => {
                const lA = skillUnlockMap.value[a.id] || 999;
                const lB = skillUnlockMap.value[b.id] || 999;
                if (lA !== lB) return lA - lB;
                if (a.particle !== b.particle) return (a.particle || '').localeCompare(b.particle || '', 'ja');
                return (a.rank || 0) - (b.rank || 0);
            });
            return [...unlocked, ...locked].map(s => ({
                ...s,
                unlockLevel: skillUnlockMap.value[s.id]
            }));
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isCodexOpen.value) {
                isCodexOpen.value = false;
                resumeBattle();
            }
        });

        const loadGameData = async () => {
            try {
                const res = await fetch(`assets/data/skills.v1.json?v=${appVersion.value}`);
                if (res.ok) {
                    SKILLS.value = await res.json();
                    const skillsMap = {};
                    SKILLS.value.forEach(s => skillsMap[s.id] = s);
                    skillsAll.value = skillsMap;
                }
            } catch (e) { }

            try {
                const res = await fetch(`assets/data/levels.v1.json?v=${appVersion.value}`);
                if (res.ok) {
                    const data = await res.json();
                    const mappedLevels = {};
                    data.forEach((lvl, idx) => {
                        const lvNum = idx + 1;
                        mappedLevels[lvNum] = {
                            ...lvl,
                            title: lvl.name || fallbackLevels[lvNum]?.title,
                            blanks: fallbackLevels[lvNum]?.blanks || 1,
                            types: fallbackLevels[lvNum]?.types || [0, 1, 2, 3, 4, 5]
                        };
                    });
                    LEVEL_CONFIG.value = mappedLevels;

                    const tempMap = {};
                    Object.keys(LEVEL_CONFIG.value).forEach(lvStr => {
                        const lvNum = parseInt(lvStr);
                        const unlocks = LEVEL_CONFIG.value[lvStr].unlockSkills || [];
                        unlocks.forEach(id => {
                            if (!tempMap[id]) tempMap[id] = lvNum;
                        });
                    });
                    skillUnlockMap.value = tempMap;
                }
            } catch (e) { }

            try {
                const res = await fetch(`assets/data/vocab.v1.json?v=${appVersion.value}`);
                if (res.ok) {
                    VOCAB.value = await res.json();
                }
            } catch (e) { }
        };

        const skillList = ref([]);
        const isSkillOpen = ref(false);
        const abilitiesMap = {};

        fetch(`assets/data/abilities.v1.json?v=${appVersion.value}&t=${Date.now()}`)
            .then(res => res.json())
            .then(data => {
                skillList.value = data;
                data.forEach(s => abilitiesMap[s.id] = s);
            })
            .catch(err => console.error("Failed to load skills", err));

        function openSkillOverlay() { isSkillOpen.value = true; }
        function closeSkillOverlay() { isSkillOpen.value = false; }

        const applyTurnLogic = () => {
            if (heroBuffs.odoodoTurns > 0) {
                heroBuffs.odoodoTurns--;
                if (heroBuffs.odoodoTurns <= 0) {
                    heroBuffs.enemyAtbMult = 1.0;
                    pushBattleLog("オドオド 效果結束（怪物速度恢復）", 'info');
                }
            }
            if (heroBuffs.wakuwakuTurns > 0) {
                heroBuffs.wakuwakuTurns--;
                if (heroBuffs.wakuwakuTurns <= 0) {
                    heroBuffs.enemyDmgMult = 1.0;
                    pushBattleLog("ワクワク 效果結束（怪物攻擊力恢復）", 'info');
                }
            }

            updateHeroStatusBar();
            if (typeof updateMonsterStatusBar === 'function') updateMonsterStatusBar();
        };

        // 1. 補回遺失的「技能專屬音效播放器」
        const playSkillSfx = (url) => {
            if (isMuted.value) return;
            try {
                let a = audioPool.get(url);
                if (!a) {
                    a = new Audio(url);
                    a.crossOrigin = "anonymous";
                    audioPool.set(url, a);
                }
                if (audioCtx.value && !a._connected) {
                    try {
                        const source = audioCtx.value.createMediaElementSource(a);
                        source.connect(sfxGain.value);
                        a._connected = true;
                    } catch (e) { }
                }
                a.currentTime = 0;
                a.play().catch(e => console.warn('[SFX] 技能音效播放失敗:', e));
            } catch (e) { }
        };

        // 2. 原本的技能施放邏輯 (完整保留)
        const castAbility = (id) => {
            const skill = abilitiesMap[id];
            if (!skill || window.__sp.cur < skill.cost || (typeof playerDead !== 'undefined' && (playerDead.value || monsterDead.value))) return;

            // 扣除 SP
            window.__sp.cur -= skill.cost;
            if (window.updateSpUI) window.updateSpUI();

            // 播放專屬音效 (第一段與第二段)
            const sfxBase = `assets/audio/skill/${id.toLowerCase()}`;
            playSkillSfx(`${sfxBase}.mp3`);
            setTimeout(() => playSkillSfx(`${sfxBase}2.mp3`), 1000);

            // 觸發技能效果與 UI 提示
            if (id === 'ODOODO') {
                heroBuffs.enemyAtbMult = 1.3;
                heroBuffs.odoodoTurns = 3;
                showStatusToast('🐌 怪物遲緩！×3回合', { bg: 'rgba(163,230,53,0.92)', border: '#84cc16', color: '#1a2e05' });
                if (typeof pushBattleLog !== 'undefined') {
                    pushBattleLog(`使用了技能：${skill.name}！怪物減速三回合！`, 'buff');
                }
            } else if (id === 'WAKUWAKU') {
                heroBuffs.enemyDmgMult = 0.6;
                heroBuffs.wakuwakuTurns = 2;
                showStatusToast('🛡️ 怪物衰弱！×2回合', { bg: 'rgba(251,146,60,0.92)', border: '#f97316', color: '#431407' });
                if (typeof pushBattleLog !== 'undefined') {
                    pushBattleLog(`使用了技能：${skill.name}！怪物攻擊減傷兩回合！`, 'buff');
                }
            } else if (id === 'UTOUTO') {
                heroBuffs.monsterSleep = true;
                showStatusToast('💤 怪物睡著了！', { bg: 'rgba(168,85,247,0.92)', border: '#c084fc', color: '#1e0a2e' });
                if (typeof pushBattleLog !== 'undefined') {
                    pushBattleLog(`使用了技能：${skill.name}！怪物睡著了！`, 'buff');
                }
            } else {
                if (typeof pushBattleLog !== 'undefined') {
                    pushBattleLog(`使用了技能：${skill.name}！`, 'buff');
                }
            }

            // 更新畫面狀態
            updateHeroStatusBar();
            if (typeof updateMonsterStatusBar === 'function') updateMonsterStatusBar();
            closeSkillOverlay();
            if (typeof resumeBattle !== 'undefined') resumeBattle();
        };

        onMounted(() => {
            loadGameData();

            // --- 手機版右下角選單 (Corner Menu) 恢復 ---
            if (!document.getElementById('cornerMenu')) {
                const cornerMenu = document.createElement('div');
                cornerMenu.id = 'cornerMenu';
                cornerMenu.innerHTML = `
                    <div class="corner-menu-items">
                        <button class="corner-menu-btn" data-target="技能"><span style="font-size:18px;">📖</span><span>技能</span></button>
                        <button class="corner-menu-btn" data-target="回復藥水"><span style="font-size:18px;">🧪</span><span>道具</span></button>
                        <button class="corner-menu-btn" data-target="背包"><span style="font-size:18px;">🎒</span><span>背包</span></button>
                        <button class="corner-menu-btn" data-target="系統"><span style="font-size:18px;">⚙️</span><span>系統</span></button>
                    </div>
                    <button id="cornerMenuToggle" class="corner-menu-toggle">☰</button>
                `;
                document.body.appendChild(cornerMenu);

                const toggleBtn = cornerMenu.querySelector('#cornerMenuToggle');
                toggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    cornerMenu.classList.toggle('open');
                    toggleBtn.innerHTML = cornerMenu.classList.contains('open') ? '▼' : '☰';
                });

                const btns = cornerMenu.querySelectorAll('.corner-menu-items button');
                btns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const targetTitle = btn.dataset.target;
                        const originalBtn = document.querySelector(`.left-actionbar button[title="${targetTitle}"]`);
                        if (originalBtn && !originalBtn.disabled) originalBtn.click();
                        cornerMenu.classList.remove('open');
                        toggleBtn.innerHTML = '☰';
                    });
                });

                document.addEventListener('click', (e) => {
                    if (cornerMenu.classList.contains('open') && !cornerMenu.contains(e.target)) {
                        cornerMenu.classList.remove('open');
                        toggleBtn.innerHTML = '☰';
                    }
                });

                // 根據戰鬥狀態控制顯示隱藏
                watch([showLevelSelect, isFinished], ([showLvl, finished]) => {
                    if (!showLvl && !finished) {
                        cornerMenu.classList.add('is-in-battle');
                    } else {
                        cornerMenu.classList.remove('is-in-battle');
                        cornerMenu.classList.remove('open');
                        toggleBtn.innerHTML = '☰';
                    }
                }, { immediate: true });
            }
        });

        const MONSTER_NAMES = { 1: '助詞怪', 2: '助詞妖', 3: '助詞魔王' };
        const MONSTER_HP = 100;
        const GOLD_PER_HIT = 10;
        const EXP_PER_HIT = 15;
        const POTION_HP = 30;
        const INITIAL_POTIONS = 3;
        const COMBO_PERFECT = 3;
        const PASS_SCORE = 0;

        const MONSTERS = [
            { id: 1, name: '助詞怪', sprite: 'assets/images/monsters/slime.png', hpMax: 100, attack: 20, trait: '普通型' },
            { id: 2, name: '助詞妖', sprite: 'assets/images/monsters/slime.png', hpMax: 120, attack: 25, trait: '會閃避' },
            { id: 3, name: '助詞魔', sprite: 'assets/images/monsters/slime.png', hpMax: 140, attack: 30, trait: '攻擊高' },
            { id: 4, name: '助詞龍', sprite: 'assets/images/monsters/slime.png', hpMax: 160, attack: 35, trait: '火焰吐息' },
            { id: 5, name: '助詞鬼', sprite: 'assets/images/monsters/slime.png', hpMax: 180, attack: 40, trait: '無形' },
            { id: 6, name: '助詞王', sprite: 'assets/images/monsters/slime.png', hpMax: 200, attack: 50, trait: '王者氣息' }
        ];

        const showLevelSelect = ref(true);
        const showGrammarDetail = ref(false);
        const runAwayPressTimer = ref(null);
        const isRunAwayPressing = ref(false);
        const isMenuOpen = ref(false);
        const isMistakesOpen = ref(false);
        const isInventoryOpen = ref(false);
        const player = ref({ hp: 100, maxHp: 100, gold: 0, exp: 0 });
        const monster = ref({ hp: MONSTER_HP, maxHp: MONSTER_HP, name: '助詞怪' });
        const inventory = ref({ potions: INITIAL_POTIONS, speedPotions: 3 });
        const spState = window.__sp;
        const evasionBuffAttacksLeft = ref(0);
        const monsterShake = ref(false);
        const playerBlink = ref(false);
        const hpBarDanger = ref(false);
        const goldDoubleNext = ref(false);
        const difficulty = ref('easy');
        const currentBg = ref('assets/images/bg_01.jpg');

        const questions = ref([]);
        const currentIndex = ref(0);
        const userAnswers = ref([]);
        const slotFeedbacks = ref({});
        const hasSubmitted = ref(false);
        const totalScore = ref(0);
        const comboCount = ref(0);
        const maxComboCount = ref(0);
        const currentLevel = ref(1);
        const isFinished = ref(false);
        const isCurrentCorrect = ref(false);
        const timeLeft = ref(10);
        const timeUp = ref(false);
        const wrongAnswerPause = ref(false);
        const wrongAnswerPauseCountdown = ref(0);
        const mistakes = ref([]);
        const totalQuestionsAnswered = ref(0);
        const correctAnswersAmount = ref(0);
        const earnedExp = ref(0);
        const earnedGold = ref(0);
        const monsterHit = ref(false);
        const screenShake = ref(false);
        const flashOverlay = ref(false);
        const isPlayerDodging = ref(false);
        const voicePlayedForCurrentQuestion = ref(false);

        const audioInited = ref(false);
        const isPreloading = ref(false);
        const bgmAudio = ref(null);
        const gameOverAudio = ref(null);

        const audioCtx = ref(null);
        const masterGain = ref(null);
        const bgmGain = ref(null);
        const sfxGain = ref(null);

        const bgmVolume = ref(0.35);
        const sfxVolume = ref(1.0);
        const masterVolume = ref(1.0);
        const isMuted = ref(false);
        const audioPool = new Map();
        const bufferPool = new Map();
        const bgmEnabled = ref(true);
        const needsUserGestureToResumeBgm = ref(false);
        const audioSettingsKey = 'jpRpgAudioV1';
        let timerId = null;
        let pauseTimerId = null;
        let questionStartTime = 0;
        let evasionBuffTimerId = null;

        let _sfxDuckTimer = null;
        let _voiceLockUntil = 0;
        let wasTimerRunning = false;
        let wasPauseTimerRunning = false;

        const startSfxDuck = (durationMs = 1800) => {
            if (!sfxGain.value || !audioCtx.value) return;
            clearTimeout(_sfxDuckTimer);
            sfxGain.value.gain.setTargetAtTime(sfxVolume.value * 0.15, audioCtx.value.currentTime, 0.05);
            _voiceLockUntil = Date.now() + durationMs;
            _sfxDuckTimer = setTimeout(() => {
                if (sfxGain.value && audioCtx.value) {
                    sfxGain.value.gain.setTargetAtTime(sfxVolume.value, audioCtx.value.currentTime, 0.2);
                }
                _voiceLockUntil = 0;
            }, durationMs);
        };

        const pauseBattle = () => {
            wasTimerRunning = wasTimerRunning || !!timerId;
            wasPauseTimerRunning = wasPauseTimerRunning || !!pauseTimerId;
            if (timerId) { clearInterval(timerId); timerId = null; }
            if (pauseTimerId) { clearInterval(pauseTimerId); pauseTimerId = null; }
        };

        const resumeBattle = () => {
            if (isMenuOpen.value || isCodexOpen.value || isSkillUnlockModalOpen.value || isMistakesOpen.value || isInventoryOpen.value) return;
            if (wasTimerRunning && !timerId) timerId = setInterval(runTimerLogic, 100);
            if (wasPauseTimerRunning && !pauseTimerId) pauseTimerId = setInterval(runPauseTimerLogic, 1000);
            wasTimerRunning = false;
            wasPauseTimerRunning = false;
        };

        const openCodexTo = (skillId) => {
            isSkillUnlockModalOpen.value = false;
            expandedSkillId.value = skillId;
            isCodexOpen.value = true;
            pauseBattle();
            setTimeout(() => {
                const el = document.getElementById('skill-card-' + skillId);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const card = el.querySelector('.bg-\\[\\#3e2723\\]\\/60') || el.firstElementChild;
                    if (card) {
                        card.classList.add('flash-card');
                        setTimeout(() => card.classList.remove('flash-card'), 800);
                    }
                }
            }, 100);
        };

        const loadAudioSettings = () => {
            try {
                const raw = localStorage.getItem(audioSettingsKey);
                if (raw) {
                    const obj = JSON.parse(raw);
                    bgmVolume.value = obj.bgmVolume ?? bgmVolume.value;
                    sfxVolume.value = obj.sfxVolume ?? sfxVolume.value;
                    masterVolume.value = obj.masterVolume ?? masterVolume.value;
                    isMuted.value = obj.isMuted ?? isMuted.value;
                }
            } catch (_) { }
        };

        const saveAudioSettings = () => {
            try {
                localStorage.setItem(audioSettingsKey, JSON.stringify({
                    bgmVolume: bgmVolume.value,
                    sfxVolume: sfxVolume.value,
                    masterVolume: masterVolume.value,
                    isMuted: isMuted.value
                }));
            } catch (_) { }
        };

        const BGM_BASE = 'assets/audio/bgm/';
        const currentBattleBgmPick = ref(BGM_BASE + 'BGM_1.mp3');

        const pickBattleBgm = (level) => {
            const lv = Number(level) || parseInt(level, 10) || 1;
            if (lv === 2) currentBattleBgmPick.value = BGM_BASE + 'BGM_2.mp3';
            else if (lv === 3) currentBattleBgmPick.value = BGM_BASE + 'BGM_3.mp3';
            else currentBattleBgmPick.value = BGM_BASE + 'BGM_1.mp3';
        };

        const preloadAllAudio = async () => {
            if (isPreloading.value) return;
            isPreloading.value = true;

            const sfxPaths = {
                hit: 'assets/audio/sfx_hit.mp3',
                miss: 'assets/audio/mmiss.mp3',
                potion: 'assets/audio/sfx_potion.mp3',
                click: 'assets/audio/sfx_click.mp3',
                damage: 'assets/audio/damage.mp3',
                fanfare: 'assets/audio/fanfare.mp3',
                pop: 'assets/audio/pop.mp3',
                win: 'assets/audio/win.mp3',
                gameover: 'assets/audio/sfx_gameover.mp3'
            };

            const criticalAssets = [BGM_BASE + 'BGM_1.mp3', BGM_BASE + 'BGM_2.mp3', BGM_BASE + 'BGM_3.mp3', BGM_BASE + 'BGM_4.mp3', sfxPaths.click, sfxPaths.pop];
            const promises = [];

            const loadAsset = (url) => {
                if (audioPool.has(url)) return Promise.resolve();
                return new Promise((res) => {
                    const a = new Audio();
                    a.addEventListener('canplaythrough', () => res(), { once: true });
                    a.addEventListener('error', () => res(), { once: true });
                    a.src = url;
                    a.load();
                    audioPool.set(url, a);
                });
            };

            for (const url of criticalAssets) promises.push(loadAsset(url));
            for (const key in sfxPaths) promises.push(loadAsset(sfxPaths[key]));
            promises.push(loadAsset(TTS_AUDIO_BASE + 'ui_correct.mp3'));
            promises.push(loadAsset(TTS_AUDIO_BASE + 'ui_wrong.mp3'));

            try {
                const res = await fetch('assets/audio/tts/lines.json');
                if (res.ok) {
                    const lines = await res.json();
                    lines.forEach(l => {
                        const url = TTS_AUDIO_BASE + ttsKeyToFile(l.key);
                        promises.push(loadAsset(url));
                    });
                }
            } catch (e) { }

            const abilityIds = ['ODOODO', 'WAKUWAKU', 'UTOUTO'];
            for (const sid of abilityIds) {
                promises.push(loadAsset(`assets/audio/skill/${sid.toLowerCase()}.mp3`));
                promises.push(loadAsset(`assets/audio/skill/${sid.toLowerCase()}2.mp3`));
            }

            const shortSfxPaths = {
                hit: 'assets/audio/sfx_hit.mp3',
                miss: 'assets/audio/mmiss.mp3',
                potion: 'assets/audio/sfx_potion.mp3',
                click: 'assets/audio/sfx_click.mp3',
                damage: 'assets/audio/damage.mp3',
                pop: 'assets/audio/pop.mp3',
            };
            const decodePromises = Object.entries(shortSfxPaths).map(async ([key, url]) => {
                try {
                    const resp = await fetch(url);
                    if (!resp.ok) return;
                    const arrayBuf = await resp.arrayBuffer();
                    bufferPool.set(url, arrayBuf);
                } catch (_) { }
            });
            await Promise.allSettled(decodePromises);

            isPreloading.value = false;

            const tryPreConnect = () => {
                if (!audioCtx.value || !sfxGain.value) return;
                audioPool.forEach((a, url) => {
                    if (url.includes('/bgm')) return;
                    if (!a._connected) {
                        try {
                            a.crossOrigin = 'anonymous';
                            const src = audioCtx.value.createMediaElementSource(a);
                            src.connect(sfxGain.value);
                            a._connected = true;
                        } catch (_) { }
                    }
                });
            };
            if (audioCtx.value && sfxGain.value) {
                tryPreConnect();
            } else {
                window._preConnectRetry = setTimeout(tryPreConnect, 2000);
            }
        };

        const initAudioCtx = async () => {
            if (audioCtx.value && audioCtx.value.state === 'running') return;
            try {
                if (!audioCtx.value) {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    audioCtx.value = new AudioContext();
                    masterGain.value = audioCtx.value.createGain();
                    bgmGain.value = audioCtx.value.createGain();
                    sfxGain.value = audioCtx.value.createGain();
                    bgmGain.value.connect(masterGain.value);
                    sfxGain.value.connect(masterGain.value);
                    masterGain.value.connect(audioCtx.value.destination);
                    updateGainVolumes();
                }
                if (audioCtx.value.state === 'suspended' || audioCtx.value.state === 'interrupted') {
                    await audioCtx.value.resume();
                }
            } catch (e) { }
        };

        const updateGainVolumes = () => {
            if (!masterGain.value) return;
            const m = isMuted.value ? 0 : masterVolume.value;
            masterGain.value.gain.setTargetAtTime(m, audioCtx.value.currentTime, 0.1);

            const b = bgmVolume.value;
            const bScale = (isMenuOpen.value || isCodexOpen.value || isSkillUnlockModalOpen.value || isMistakesOpen.value) ? 0.5 : 1.0;
            bgmGain.value.gain.setTargetAtTime(b * bScale, audioCtx.value.currentTime, 0.1);
            sfxGain.value.gain.setTargetAtTime(sfxVolume.value, audioCtx.value.currentTime, 0.1);
        };

        const initAudio = async () => {
            if (audioInited.value) return;
            audioInited.value = true;
            await initAudioCtx();
            try {
                let bgm = audioPool.get(BGM_BASE + 'BGM_1.mp3');
                if (!bgm) {
                    bgm = new Audio(BGM_BASE + 'BGM_1.mp3');
                    bgm.crossOrigin = "anonymous";
                    bgm.preload = "auto";
                    audioPool.set(BGM_BASE + 'BGM_1.mp3', bgm);
                    bgm.load();
                }
                bgmAudio.value = bgm;
                bgmAudio.value.loop = true;

                if (audioCtx.value && !bgm._connected) {
                    const source = audioCtx.value.createMediaElementSource(bgm);
                    source.connect(bgmGain.value);
                    bgm._connected = true;
                }
            } catch (_) { }
        };

        const stopAllAudio = () => {
            try {
                if (bgmGain.value && audioCtx.value) {
                    bgmGain.value.gain.cancelScheduledValues(audioCtx.value.currentTime);
                    bgmGain.value.gain.setValueAtTime(0, audioCtx.value.currentTime);
                }
                if (bgmAudio.value) {
                    bgmAudio.value.pause();
                    try { bgmAudio.value.currentTime = 0; } catch (_) { }
                }
                audioPool.forEach((a, url) => {
                    if (typeof url === 'string' && url.indexOf(BGM_BASE) === 0) {
                        try { a.pause(); a.currentTime = 0; } catch (_) { }
                    }
                });
            } catch (_) { }
            try {
                if (gameOverAudio.value) {
                    gameOverAudio.value.pause();
                    try { gameOverAudio.value.currentTime = 0; } catch (_) { }
                    gameOverAudio.value = null;
                }
            } catch (_) { }
        };

        const handleGameOver = () => {
            setHeroAvatar('lose');
            try { if (bgmAudio.value) { bgmAudio.value.pause(); try { bgmAudio.value.currentTime = 0; } catch (_) { } } } catch (_) { }
            playSfx('gameover');
        };

        const runAway = () => {
            clearTimer(); if (pauseTimerId) { clearInterval(pauseTimerId); pauseTimerId = null; }
            if (runAwayPressTimer.value) clearTimeout(runAwayPressTimer.value);
            runAwayPressTimer.value = null;
            isRunAwayPressing.value = false;
            stopAllAudio();
            pushBattleLog('你逃跑了！', 'info');
            hasSubmitted.value = false;
            isFinished.value = false;
            userAnswers.value = [];
            slotFeedbacks.value = {};
            isMenuOpen.value = false;
            setTimeout(() => { showLevelSelect.value = true; }, 900);
        };

        const startRunAwayPress = () => {
            if (hasSubmitted.value) return;
            isRunAwayPressing.value = true;
            runAwayPressTimer.value = setTimeout(() => { playSfx('click'); runAway(); }, 3000);
        };
        const cancelRunAwayPress = () => {
            isRunAwayPressing.value = false;
            if (runAwayPressTimer.value) { clearTimeout(runAwayPressTimer.value); runAwayPressTimer.value = null; }
        };
        const setBattleMessage = (text, ttlMs = 5200) => {
            pushBattleLog(text, 'info');
        };

        const playBgm = async () => {
            await initAudioCtx();
            if (!audioInited.value) await initAudio();
            if (audioCtx.value && audioCtx.value.state === 'suspended') await audioCtx.value.resume();
            updateGainVolumes();

            const expectedUrl = currentBattleBgmPick.value || (BGM_BASE + 'BGM_1.mp3');
            const expectedAbs = new URL(expectedUrl, window.location.href).href;
            const curSrc = bgmAudio.value?.src || '';

            if (bgmAudio.value && curSrc !== expectedAbs) {
                bgmAudio.value.pause();
                bgmAudio.value.src = expectedAbs;
                bgmAudio.value.currentTime = 0;
                bgmAudio.value.load();
            }

            if (bgmAudio.value && bgmAudio.value.paused) {
                bgmAudio.value.play().catch(e => console.warn('[BGM] play failed', e.name, e.message));
            }
        };

        const ensureBattleBgmApplied = (forcePlay) => { playBgm(); };

        const resumeBattleBgm = (resumeAbs) => {
            if (!bgmEnabled.value || isMuted.value || bgmVolume.value <= 0) return;
            if (!bgmAudio.value) return;
            bgmAudio.value.pause();
            const curSrc = bgmAudio.value.src || '';
            if (curSrc !== resumeAbs) {
                bgmAudio.value.src = resumeAbs;
                bgmAudio.value.load();
            }
            bgmAudio.value.currentTime = 0;
            bgmAudio.value.play().catch(e => {
                needsUserGestureToResumeBgm.value = true;
            });
        };

        watch([isMenuOpen, isCodexOpen, isSkillUnlockModalOpen, isMistakesOpen, bgmVolume, masterVolume, isMuted, sfxVolume], () => {
            updateGainVolumes();
        });

        watch(isMuted, (newVal, oldVal) => {
            if (newVal === false && oldVal === true) {
                const inBattle = !showLevelSelect.value && !isFinished.value && currentLevel.value > 0;
                if (inBattle && bgmAudio.value) {
                    const isPlaying = !bgmAudio.value.paused && bgmAudio.value.currentTime > 0;
                    if (!isPlaying) playBgm();
                }
            }
        });

        const handleVisibilityChange = () => {
            if (document.hidden) return;
            const inBattle = !showLevelSelect.value && !isFinished.value && currentLevel.value > 0;
            if (inBattle && bgmAudio.value && !isMuted.value && bgmVolume.value > 0) {
                const isPlaying = !bgmAudio.value.paused && bgmAudio.value.currentTime > 0;
                if (!isPlaying) playBgm();
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleVisibilityChange);

        watch(() => player.value.hp, (newHp) => {
            const el = document.getElementById('heroAvatar');
            const ratio = newHp / player.value.maxHp;
            if (el && el.dataset.state !== 'hit' && el.dataset.state !== 'lose' && el.dataset.state !== 'win') {
                setHeroAvatar(ratio <= 0.4 ? 'scary' : 'neutral');
            }
            window.heroHP = newHp;
            window.heroMaxHP = player.value.maxHp;
            updateHeroStatusBar();
        });

        const ensureBgmPlaying = (reason) => {
            if (!audioInited.value) initAudio();
            if (!bgmEnabled.value || isMuted.value || bgmVolume.value <= 0) return;
            if (bgmAudio.value && bgmAudio.value.paused) {
                const expectedUrl = currentBattleBgmPick.value || (BGM_BASE + 'BGM_1.mp3');
                const expectedAbs = new URL(expectedUrl, window.location.href).href;
                const curSrc = bgmAudio.value.src || '';
                if (curSrc !== expectedAbs) {
                    bgmAudio.value.src = expectedAbs;
                    bgmAudio.value.load();
                }
                bgmAudio.value.play().catch(() => {
                    needsUserGestureToResumeBgm.value = true;
                });
            }
        };
        const pauseBgm = () => {
            if (bgmAudio.value && !bgmAudio.value.paused) bgmAudio.value.pause();
        };

        const _isMobileSfx = /iPad|iPhone|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 2);
        const POLY = 4;
        const _uiSfxSrcMap = {
            hit: 'assets/audio/sfx_hit.mp3',
            miss: 'assets/audio/mmiss.mp3',
            potion: 'assets/audio/sfx_potion.mp3',
            click: 'assets/audio/sfx_click.mp3',
            damage: 'assets/audio/damage.mp3',
            fanfare: 'assets/audio/fanfare.mp3',
            pop: 'assets/audio/pop.mp3',
            win: 'assets/audio/win.mp3',
            gameover: 'assets/audio/sfx_gameover.mp3',
        };
        const _polyPool = new Map();
        const _getOrCreatePoly = (name) => {
            if (_polyPool.has(name)) return _polyPool.get(name);
            const src = _uiSfxSrcMap[name];
            if (!src) return null;
            const els = Array.from({ length: POLY }, () => {
                const a = new Audio(src);
                a.preload = 'auto';
                if ('playsInline' in a) a.playsInline = true;
                return a;
            });
            const entry = { els, idx: 0 };
            _polyPool.set(name, entry);
            return entry;
        };
        const playUiSfx = (name) => {
            if (isMuted.value) return;
            if (_voiceLockUntil > Date.now() && (name === 'damage' || name === 'miss')) return;
            const entry = _getOrCreatePoly(name);
            if (!entry) return;
            const a = entry.els[entry.idx % POLY];
            entry.idx++;
            a.pause();
            a.currentTime = 0;
            a.play().catch(e => { });
        };

        const _prewarmUiSfx = () => { _getOrCreatePoly('hit'); _getOrCreatePoly('miss'); };
        document.addEventListener('pointerdown', _prewarmUiSfx, { once: true, capture: true });
        document.addEventListener('touchstart', _prewarmUiSfx, { once: true, capture: true, passive: true });

        const playSfx = (name) => {
            if (!audioInited.value) {
                initAudioCtx().then(() => { initAudio().then(() => playSfx(name)); });
                return;
            }
            if (_voiceLockUntil > Date.now() && (name === 'damage' || name === 'miss')) return;

            const src = _uiSfxSrcMap[name];
            if (!src) return;

            if (bgmGain.value && !isMuted.value && name !== 'click' && name !== 'pop') {
                const b = bgmVolume.value;
                const bScale = (isMenuOpen.value || isCodexOpen.value || isSkillUnlockModalOpen.value || isMistakesOpen.value) ? 0.5 : 1.0;
                clearTimeout(window._bgmDuckTimer);
                window._bgmDuckTimer = setTimeout(() => {
                    if (bgmGain.value && !isMuted.value) {
                        bgmGain.value.gain.setTargetAtTime(b * bScale * 0.3, audioCtx.value.currentTime, 0.15);
                        setTimeout(() => {
                            if (bgmGain.value && !isMuted.value) {
                                const vs = (isMenuOpen.value || isCodexOpen.value || isSkillUnlockModalOpen.value || isMistakesOpen.value) ? 0.5 : 1.0;
                                bgmGain.value.gain.setTargetAtTime(b * vs, audioCtx.value.currentTime, 0.4);
                            }
                        }, 1200);
                    }
                }, 80);
            }

            const rawBuf = bufferPool.get(src);
            if (rawBuf && audioCtx.value) {
                const doPlay = () => {
                    const playDecoded = (decoded) => {
                        try {
                            const bsn = audioCtx.value.createBufferSource();
                            bsn.buffer = decoded;
                            bsn.connect(sfxGain.value || masterGain.value);
                            bsn.start(0);
                        } catch (e) { }
                    };
                    if (rawBuf instanceof AudioBuffer) {
                        playDecoded(rawBuf);
                    } else {
                        audioCtx.value.decodeAudioData(rawBuf.slice(0)).then(decoded => {
                            bufferPool.set(src, decoded);
                            playDecoded(decoded);
                        }).catch(e => { });
                    }
                };

                if (audioCtx.value.state !== 'running') {
                    audioCtx.value.resume().then(doPlay).catch(doPlay);
                } else {
                    doPlay();
                }
                return;
            }

            try {
                let a = audioPool.get(src);
                if (!a) {
                    a = new Audio(src);
                    a.crossOrigin = "anonymous";
                    audioPool.set(src, a);
                }
                if (audioCtx.value && !a._connected) {
                    const source = audioCtx.value.createMediaElementSource(a);
                    source.connect(sfxGain.value);
                    a._connected = true;
                }
                a.currentTime = 0;
                a.play().catch(e => { });
                return a;
            } catch (e) { return null; }
        };

        const clearTimer = () => {
            if (timerId) { clearInterval(timerId); timerId = null; }
        };

        const handleRuneClick = (opt, isFromFlick = false) => {
            if (!isFromFlick) return;
            if (answerMode.value !== 'flick' || monsterDead.value || playerDead.value || isFinished.value || hasSubmitted.value) return;
            selectChoice(opt);
            checkAnswer();

            flickState.successOpt = opt;
            setTimeout(() => { flickState.successOpt = null; }, 400);
        };

        function rectCenter(el) {
            if (!el || !el.getBoundingClientRect) return null;
            const r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }

        const safeNum = (n, fallback) => Number.isFinite(n) ? n : fallback;
        const getCenterOrFallback = (originEl, fallbackX, fallbackY) => {
            const center = rectCenter(originEl);
            if (center) {
                return { x: safeNum(center.x, fallbackX), y: safeNum(center.y, fallbackY) };
            }
            return { x: fallbackX, y: fallbackY };
        };

        // 0. 建立全域特效畫布 (解決炸歪與閃爍問題)
        const getVfxLayer = () => {
            let layer = document.getElementById('global-vfx-layer');
            if (!layer) {
                layer = document.createElement('div');
                layer.id = 'global-vfx-layer';
                document.body.appendChild(layer);
            }
            // 強制釘死在螢幕左上角，座標 100% 絕對吻合
            layer.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; pointer-events:none; z-index:999999; overflow:hidden; margin:0; padding:0;';
            return layer;
        };

        // 1. 純 JS 拖尾星屑特效
        const spawnTrailParticle = (layer, x, y) => {
            const p = document.createElement('div');
            const size = Math.random() * 8 + 6;
            p.style.cssText = `
                position: absolute; width: ${size}px; height: ${size}px;
                background: ${Math.random() > 0.3 ? '#fde047' : '#ffffff'};
                box-shadow: 0 0 10px #f59e0b; border-radius: 50%;
                left: ${x - size / 2}px; top: ${y - size / 2}px;
                pointer-events: none; z-index: 10;
            `;
            layer.appendChild(p);

            const dur = Math.random() * 400 + 200;
            const driftX = (Math.random() - 0.5) * 30;
            p.animate([
                { opacity: 0.8, transform: 'scale(1) translate(0, 0)' },
                { opacity: 0, transform: `scale(0.1) translate(${driftX}px, 20px)` }
            ], { duration: dur, easing: 'ease-out', fill: 'forwards' });

            setTimeout(() => { if (p.isConnected) p.remove(); }, dur);
        };

        // 2. 擊中爆炸特效 (絕對精準座標)
        const spawnHitVfx = (x, y) => {
            const layer = getVfxLayer();

            // 螢幕震動
            const stage = document.getElementById('stage');
            if (stage && settings.screenShake !== false) {
                stage.style.transform = `translate(${(Math.random() - 0.5) * 15}px, ${(Math.random() - 0.5) * 15}px)`;
                setTimeout(() => { stage.style.transform = ''; }, 50);
                setTimeout(() => { stage.style.transform = `translate(${(Math.random() - 0.5) * 15}px, ${(Math.random() - 0.5) * 15}px)`; }, 100);
                setTimeout(() => { stage.style.transform = ''; }, 150);
            }

            // A. 擴散爆破光圈
            const ring = document.createElement('div');
            ring.style.cssText = `
                position: absolute; width: 100px; height: 100px;
                border: 4px solid #fde047; border-radius: 50%;
                left: ${x - 50}px; top: ${y - 50}px;
                box-shadow: 0 0 20px #f59e0b, inset 0 0 20px #f59e0b;
                pointer-events: none; z-index: 15;
            `;
            layer.appendChild(ring);
            ring.animate([
                { transform: 'scale(0)', opacity: 1 },
                { transform: 'scale(1.5)', opacity: 0 }
            ], { duration: 350, easing: 'ease-out', fill: 'forwards' });
            setTimeout(() => { if (ring.isConnected) ring.remove(); }, 350);

            // B. 放射狀火花
            const sparksCount = 16;
            for (let i = 0; i < sparksCount; i++) {
                const spark = document.createElement('div');
                spark.style.cssText = `
                    position: absolute; width: 6px; height: 20px;
                    background: #ffffff; box-shadow: 0 0 8px #fde047, 0 0 15px #f59e0b;
                    border-radius: 4px; left: ${x - 3}px; top: ${y - 10}px;
                    pointer-events: none; z-index: 20;
                `;
                layer.appendChild(spark);

                const angle = (Math.PI * 2 / sparksCount) * i + (Math.random() - 0.5);
                const dist = Math.random() * 80 + 40;
                const dur = Math.random() * 250 + 150;

                spark.animate([
                    { transform: `rotate(${angle + Math.PI / 2}rad) translate(0, 0) scale(1)`, opacity: 1 },
                    { transform: `rotate(${angle + Math.PI / 2}rad) translate(0, -${dist}px) scale(0.2)`, opacity: 0 }
                ], { duration: dur, easing: 'ease-out', fill: 'forwards' });

                setTimeout(() => { if (spark.isConnected) spark.remove(); }, dur);
            }
        };

        // 3. 發射彗星本體
        const spawnProjectile = (fromX, fromY, toX, toY, textOpt) => {
            const vfxLayer = getVfxLayer();
            const ttl = 400; // 🌟 400ms 飛行時間，等一下音效會完全配合這個時間！
            const projectile = document.createElement('div');

            projectile.style.cssText = `
                position: absolute; left: ${fromX - 20}px; top: ${fromY - 20}px;
                width: 40px; height: 40px; display: flex; justify-content: center; align-items: center;
                pointer-events: none; z-index: 99999;
            `;

            const core = document.createElement('div');
            core.style.cssText = `
                position: absolute; width: 28px; height: 28px; border-radius: 50%;
                background: #ffffff; box-shadow: 0 0 20px #ffffff, 0 0 40px #fde047, 0 0 60px #f59e0b; z-index: 10;
            `;
            projectile.appendChild(core);
            vfxLayer.appendChild(projectile);

            const dx = toX - fromX;
            const dy = toY - fromY;
            let startTime = null;

            const animateTrail = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / ttl, 1);

                if (progress < 1 && projectile.isConnected) {
                    const easeProgress = 1 - Math.pow(1 - progress, 3);
                    const currentX = fromX + dx * easeProgress;
                    const currentY = fromY + dy * easeProgress;

                    const particlesThisFrame = Math.floor(Math.random() * 3) + 3;
                    for (let i = 0; i < particlesThisFrame; i++) {
                        const offsetX = (Math.random() - 0.5) * 20;
                        const offsetY = (Math.random() - 0.5) * 20;
                        spawnTrailParticle(vfxLayer, currentX + offsetX, currentY + offsetY);
                    }
                    requestAnimationFrame(animateTrail);
                } else {
                    spawnHitVfx(toX, toY);
                }
            };
            requestAnimationFrame(animateTrail);

            projectile.animate([
                { transform: `translate(0px, 0px) scale(1)`, opacity: 1 },
                { transform: `translate(${dx}px, ${dy}px) scale(0.5)`, opacity: 0.5 }
            ], { duration: ttl, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'forwards' });

            setTimeout(() => { if (projectile.isConnected) projectile.remove(); }, ttl + 50);
        };

        const isMobileOrIOS = () => {
            return /iPad|iPhone|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
        };

        const startFlick = (e, opt) => {
            if (answerMode.value !== 'flick' || monsterDead.value || playerDead.value || isFinished.value || hasSubmitted.value) return;
            initAudioCtx();
            if (!audioInited.value) initAudio();

            const el = e.currentTarget;
            el.setPointerCapture(e.pointerId);

            flickState.activeOpt = opt;
            flickState.startX = e.clientX;
            flickState.startY = e.clientY;
            flickState.currentX = e.clientX;
            flickState.currentY = e.clientY;
            flickState.isArmed = true;
            flickState.capturedEl = el;
        };

        const moveFlick = (e) => {
            if (!flickState.isArmed) return;
            flickState.currentX = e.clientX;
            flickState.currentY = e.clientY;
        };

        const endFlick = (e) => {
            if (!flickState.isArmed) return;
            if (window.primeVoiceOnGesture) window.primeVoiceOnGesture();

            const dx = e.clientX - flickState.startX;
            const dy = e.clientY - flickState.startY;
            const opt = flickState.activeOpt;
            const originEl = flickState.capturedEl;

            if (dy <= -25 && Math.abs(dx) < 120) {
                if (e.cancelable) e.preventDefault();

                const startPoint = getCenterOrFallback(originEl, flickState.startX, flickState.startY);
                let toX = e.clientX;
                let toY = e.clientY;

                const monsterEl = document.querySelector('img[alt="monster"]') || document.querySelector('.w-28.h-28.rounded-full');
                const monsterCenter = rectCenter(monsterEl);
                if (monsterCenter && monsterCenter.x !== undefined && monsterCenter.y !== undefined) {
                    toX = monsterCenter.x;
                    toY = monsterCenter.y;
                } else {
                    toY = startPoint.y - 200;
                    toX = startPoint.x;
                }

                spawnProjectile(startPoint.x, startPoint.y, toX, toY, opt);
                handleRuneClick(opt, true);
            }

            flickState.isArmed = false;
            flickState.activeOpt = null;
            if (flickState.capturedEl) {
                flickState.capturedEl.releasePointerCapture(e.pointerId);
                flickState.capturedEl = null;
            }
        };

        const runTimerLogic = () => {
            if (isFinished.value || monsterDead.value || playerDead.value || showLevelSelect.value) {
                if (showLevelSelect.value || isFinished.value) {
                    clearTimer();
                }
                return;
            }
            if (heroBuffs.monsterSleep) {
                return;
            }
            timeLeft.value -= (0.1 / heroBuffs.enemyAtbMult);
            if (timeLeft.value <= 0) {
                applyMonsterAttack();
                timeLeft.value = 10;
            }
        };

        const startTimer = () => {
            clearTimer();
            timeUp.value = false;
            if (isFinished.value) return;
            timeLeft.value = 10;
            questionStartTime = Date.now();

            if (isMenuOpen.value || isCodexOpen.value || isSkillUnlockModalOpen.value) {
                wasTimerRunning = true;
            } else {
                timerId = setInterval(runTimerLogic, 100);
            }
        };

        const runPauseTimerLogic = () => {
            wrongAnswerPauseCountdown.value--;
            if (wrongAnswerPauseCountdown.value <= 0) {
                if (pauseTimerId) { clearInterval(pauseTimerId); pauseTimerId = null; }
                wrongAnswerPause.value = false;
                const isHard = difficulty.value === 'hard';
                if (isHard && !playerDead.value) nextQuestion();
            }
        };

        const applyMonsterAttack = () => {
            let isMiss = Math.random() < 0.05;

            if (evasionBuffAttacksLeft.value > 0) {
                isMiss = Math.random() < 0.50;
                evasionBuffAttacksLeft.value--;
                if (evasionBuffAttacksLeft.value <= 0) {
                    if (evasionBuffTimerId) { clearTimeout(evasionBuffTimerId); evasionBuffTimerId = null; }
                    clearSpeedStatus();
                }
            }

            screenShake.value = true;
            setTimeout(() => { screenShake.value = false; }, 400);

            if (isMiss) {
                isPlayerDodging.value = true;
                setTimeout(() => { isPlayerDodging.value = false; }, 300);
                playSfx('miss');
                pushBattleLog(`怪物攻擊失誤！勇者閃開了！`, 'info');
            } else {
                playerBlink.value = true;
                flashOverlay.value = true;
                setTimeout(() => { playerBlink.value = false; }, 500);
                setTimeout(() => { flashOverlay.value = false; }, 300);

                playSfx('damage');
                let dmg = Math.floor(Math.random() * 11) + 10;
                dmg = Math.max(1, Math.floor(dmg * heroBuffs.enemyDmgMult));
                player.value.hp = Math.max(0, player.value.hp - dmg);
                pushBattleLog(`怪物攻擊 -${dmg} HP`, 'dmg');
                flashHeroHit(player.value.hp / player.value.maxHp);
                if (player.value.hp <= 0) handleGameOver();
                hpBarDanger.value = true;
                setTimeout(() => { hpBarDanger.value = false; }, 500);
            }

            wrongAnswerPause.value = true;
            wrongAnswerPauseCountdown.value = difficulty.value === 'hard' ? 3 : 2;
            if (pauseTimerId) clearInterval(pauseTimerId);
            pauseTimerId = setInterval(runPauseTimerLogic, 1000);
        };

        const loadMistakes = () => {
            try {
                const data = JSON.parse(localStorage.getItem('jpRpgMistakesV1') || '[]');
                mistakes.value = data;
            } catch (_) { }
        };
        const saveMistakes = () => {
            try { localStorage.setItem('jpRpgMistakesV1', JSON.stringify(mistakes.value)); } catch (_) { }
        };

        const addMistake = () => {
            const q = currentQuestion.value;
            let displayJp = '';
            let sentenceTextBuilder = '';

            // 1. 重組句子，並把答案的位置加上 HTML 高亮底線
            (q.segments || []).forEach(s => {
                if (s.isBlank) {
                    let ans = q.answers[s.blankIndex];
                    if (Array.isArray(ans)) ans = ans[0];
                    displayJp += `<span class="text-amber-400 font-bold underline">${ans}</span>`;
                    sentenceTextBuilder += ans;
                } else {
                    displayJp += s.text;
                    sentenceTextBuilder += s.text;
                }
            });

            // 2. 清理要給語音朗讀用的純文字
            let cleanSentenceText = sentenceTextBuilder.replace(/[_ ]/g, '').replace(/（[^）]*）|\([^)]*\)/g, '');

            // 3. 存入符合新版 HTML 排版的四個屬性
            const entry = {
                displayJp: displayJp,
                sentenceText: cleanSentenceText,
                prompt: q.chinese || "",
                correct: Array.isArray(q.answers[0]) ? q.answers[0][0] : q.answers[0],
                grammarTip: q.tip || q.grammar || q.grammarTip || "",
                timestamp: new Date().toISOString(),
                levelId: currentLevel.value
            };

            mistakes.value.unshift(entry);
            saveMistakes();
        };

        const playMistakeVoice = async (m) => {
            if (!m.sentenceText) return;
            initAudio();
            await speakAzure(m.sentenceText);
        };
        const clearMistakes = () => { mistakes.value = []; saveMistakes(); };

        const ALL_PARTICLES = ['は', 'が', 'を', 'に', 'で', 'へ', 'と'];
        const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
        const makeChoices = (correct) => {
            const correctArr = Array.isArray(correct) ? correct : [correct];
            const wrong = ALL_PARTICLES.filter(p => !correctArr.includes(p));
            const picked = [correctArr[0], ...shuffle(wrong).slice(0, 3)];
            return shuffle(picked);
        };

        const onUserGesture = () => {
            if (!audioInited.value) initAudio();
            initAudioCtx().then(() => {
                if (audioCtx.value && audioCtx.value.state === 'running') {
                    try {
                        const silentBuf = audioCtx.value.createBuffer(1, 128, audioCtx.value.sampleRate);
                        const silentSrc = audioCtx.value.createBufferSource();
                        silentSrc.buffer = silentBuf;
                        silentSrc.connect(masterGain.value);
                        silentSrc.start(0);
                    } catch (_) { }

                    if (!window._audioWarmedUp) {
                        window._audioWarmedUp = true;
                        try {
                            const dummyAudio = new Audio("data:audio/mp3;base64,//OlkAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAFAAAH8AADBQQOExUaHh8lJygqMTIzNzo9P0JFREQv");
                            dummyAudio.muted = true;
                            dummyAudio.play().then(() => {
                                dummyAudio.pause();
                                dummyAudio.muted = false;
                            }).catch(() => { });
                        } catch (e) { }
                    }

                    if (window._preConnectRetry) {
                        clearTimeout(window._preConnectRetry);
                        window._preConnectRetry = null;
                    }
                    if (sfxGain.value) {
                        audioPool.forEach((a, url) => {
                            if (url.includes('/bgm')) return;
                            if (!a._connected) {
                                try {
                                    a.crossOrigin = 'anonymous';
                                    const src = audioCtx.value.createMediaElementSource(a);
                                    src.connect(sfxGain.value);
                                    a._connected = true;
                                } catch (_) { }
                            }
                        });
                    }
                }
            });
            if (needsUserGestureToResumeBgm.value) {
                ensureBgmPlaying('gesture');
                needsUserGestureToResumeBgm.value = false;
            }
        };

        const levelConfig = computed(() => LEVEL_CONFIG.value[currentLevel.value] || LEVEL_CONFIG.value[1] || {});
        const levelTitle = computed(() => levelConfig.value.title || '');
        const isChoiceMode = computed(() => levelConfig.value.blanks === 1);

        const playBeep = (frequency, duration, type) => {
            try {
                if (!audioCtx.value) initAudioCtx();
                const ctx = audioCtx.value;
                if (ctx.state === 'suspended') ctx.resume();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = frequency;
                osc.type = type || 'sine';
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + duration);
            } catch (_) { }
        };
        const playCorrectBeep = () => { playBeep(523, 0.15); playBeep(659, 0.15, 'sine'); };
        const playWrongBeep = () => { playBeep(200, 0.25, 'sawtooth'); };

        const ensureBgmElementSync = () => {
            let bgm = audioPool.get(BGM_BASE + 'BGM_1.mp3');
            if (!bgm) {
                bgm = new Audio(BGM_BASE + 'BGM_1.mp3');
                bgm.crossOrigin = 'anonymous';
                bgm.loop = true;
                audioPool.set(BGM_BASE + 'BGM_1.mp3', bgm);
            }
            bgmAudio.value = bgm;
            bgmAudio.value.loop = true;
        };

        const applyBattleBgmNow = (lv) => {
            const srcRel = currentBattleBgmPick.value || (BGM_BASE + 'BGM_1.mp3');
            const srcAbs = new URL(srcRel, window.location.href).href;
            if (!bgmAudio.value) return;
            bgmAudio.value.pause();
            bgmAudio.value.src = srcAbs;
            bgmAudio.value.load();
            bgmAudio.value.play().catch(e => {
                needsUserGestureToResumeBgm.value = true;
            });
        };

        const startLevel = async (level) => {
            const lv = Number(level) || parseInt(level, 10) || 1;
            initAudioCtx();
            stopAllAudio();
            pickBattleBgm(lv);
            ensureBgmElementSync();
            applyBattleBgmNow(lv);
            preloadAllAudio();

            playSfx('click');
            showLevelSelect.value = false;
            currentLevel.value = lv;
            initGame(lv);
            needsUserGestureToResumeBgm.value = false;
        };

        const usePotion = () => {
            initAudioCtx();
            if (!audioInited.value) initAudio();
            if (needsUserGestureToResumeBgm.value) { ensureBgmPlaying('potion'); needsUserGestureToResumeBgm.value = false; }
            playSfx('potion');
            if (inventory.value.potions <= 0 || player.value.hp >= player.value.maxHp) return;
            inventory.value.potions--;
            player.value.hp = Math.min(player.value.maxHp, player.value.hp + POTION_HP);
            pushBattleLog(`喝了藥水，回復 ${POTION_HP} 點 HP！`, 'heal');
        };

        const useSpeedPotion = () => {
            initAudioCtx();
            if (!audioInited.value) initAudio();
            if (needsUserGestureToResumeBgm.value) { ensureBgmPlaying('potion'); needsUserGestureToResumeBgm.value = false; }
            playSfx('potion');
            if (inventory.value.speedPotions <= 0 || evasionBuffAttacksLeft.value > 0 || playerDead.value || monsterDead.value) return;
            inventory.value.speedPotions--;
            evasionBuffAttacksLeft.value = 6;
            setSpeedStatus(60000);
            pushBattleLog(`使用了神速藥水！接下來 6 次閃避率提昇`, 'buff');

            if (evasionBuffTimerId) clearTimeout(evasionBuffTimerId);
            evasionBuffTimerId = setTimeout(() => {
                if (evasionBuffAttacksLeft.value > 0) {
                    evasionBuffAttacksLeft.value = 0;
                    pushBattleLog(`神速藥水的藥效退去了。`, 'info');
                }
                clearSpeedStatus();
                evasionBuffTimerId = null;
            }, 60000);
        };

        const pickSkillForNormalLevel = (levelId) => {
            const configUnlock = LEVEL_CONFIG.value[levelId]?.unlockSkills || [];
            const newSkills = configUnlock.filter(id => unlockedSkillIds.value.includes(id));
            const oldSkills = unlockedSkillIds.value.filter(id => !newSkills.includes(id));

            let poolToUse = [];
            if (newSkills.length > 0 && oldSkills.length > 0) {
                poolToUse = Math.random() < 0.75 ? newSkills : oldSkills;
            } else if (newSkills.length > 0) {
                poolToUse = newSkills;
            } else if (oldSkills.length > 0) {
                poolToUse = oldSkills;
            } else {
                return null;
            }
            return poolToUse[Math.floor(Math.random() * poolToUse.length)];
        };

        let bossSkillQueue = [];
        const startBossQueue = (unlockedIds) => {
            bossSkillQueue = [...unlockedIds].sort(() => Math.random() - 0.5);
        };

        const pickSkillForBoss = () => {
            if (bossSkillQueue.length === 0) return null;
            const skill = bossSkillQueue.shift();
            bossSkillQueue.push(skill);
            return skill;
        };

        const isBossLevel = (levelId) => {
            if (levelId % 5 === 0) return true;
            if (LEVEL_CONFIG.value[levelId]?.isBoss) return true;
            return false;
        };

        const pickSkillIdForNextQuestion = (levelId) => {
            const isBoss = isBossLevel(levelId);
            if (isBoss) {
                if (bossSkillQueue.length === 0) startBossQueue(unlockedSkillIds.value);
                return pickSkillForBoss();
            }
            return pickSkillForNormalLevel(levelId);
        };

        const pickOne = (arr) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;
        const pickMany = (arr, n, exclude) => {
            const result = [];
            const pool = [...(arr || [])].filter(x => !exclude || exclude !== x);
            while (result.length < n && pool.length > 0) {
                const idx = Math.floor(Math.random() * pool.length);
                result.push(pool.splice(idx, 1)[0]);
            }
            return result;
        };

        const safeFallbackQuestion = (skillId) => {
            const skillDef = skillsAll.value[skillId];
            if (!skillDef) return null;
            const ex = (skillDef.examples && skillDef.examples.length > 0) ? pickOne(skillDef.examples) : "川のそば";
            const q = {
                chinese: `[安全備用]`,
                segments: [{ text: ex, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: "[安全備用]", isBlank: false }],
                answers: [[skillDef.particle || "の"]],
                grammarTip: (skillDef.meaning || '') + (skillDef.rule ? ' / ' + skillDef.rule : ''),
                skillId: skillId,
                choices: pickMany(skillDef.choiceSet || ["の", "は", "が", "を", "に", "へ", "で", "と"], 4)
            };
            return q;
        };

        const gaExistRecentSentences = [];
        const gaExistRecentTemplates = [];
        const gaExistRecentCategories = [];

        const generateQuestionBySkill = (skillId, blanks, db, vocab) => {
            const skillDef = skillsAll.value[skillId];
            if (!skillDef || !skillDef.id) return null;

            const tipText = (skillDef.meaning || '') + (skillDef.rule ? ' / ' + skillDef.rule : '');
            const safeVocab = vocab || {};

            const getChoices = (defaultChoices) => {
                const arr = [...(skillDef.choiceSet || defaultChoices)];
                return arr.sort(() => Math.random() - 0.5).slice(0, 4);
            };

            let q = null;
            if (skillDef.id === 'NO_POSSESS') {
                const isPersonA = Math.random() < 0.5;
                let personPool = [...(db?.people || []), ...(safeVocab.people || [])];
                let placePool = [...(db?.places || []), ...(safeVocab.places || []), ...(safeVocab.nature || []).filter(x => x.kind === 'landform')];
                let objPool = [...(db?.objects || []), ...(safeVocab.objects || [])];

                let ownableObjPool = objPool.filter(o => o.ownable !== false);
                let placeableObjPool = objPool.filter(o => o.placeable !== false);

                if (currentLevel.value === 1) {
                    const l1People = ["母", "友達", "私", "あなた", "先生"];
                    personPool = personPool.filter(p => l1People.includes(p.j));

                    const l1Places = ["家", "学校", "教室", "図書館", "病院", "駅", "公園", "庭", "部屋", "会社", "デパート"];
                    placePool = placePool.filter(p => l1Places.includes(p.j));

                    ownableObjPool = objPool.filter(o => {
                        const hasTag = o.tags ? o.tags.some(t => ['food', 'drink', 'media'].includes(t)) : false;
                        return ((o.tags && o.tags.includes('owned')) || o.ownable === true) && !hasTag;
                    });
                    placeableObjPool = objPool.filter(o => {
                        const hasTag = o.tags ? o.tags.some(t => ['food', 'drink', 'media'].includes(t)) : false;
                        return ((o.tags && o.tags.includes('inplace')) || o.placeable === true) && !hasTag;
                    });
                }

                let a, b, validObj = false, attempts = 0;

                while (!validObj && attempts < 20) {
                    if (isPersonA) {
                        a = pickOne(personPool);
                        b = pickOne(ownableObjPool);
                        if (!a || !b) { validObj = false; break; }
                        validObj = true;
                        if (currentLevel.value > 1 && b.ownable === false) validObj = false;
                    } else {
                        a = pickOne(placePool);
                        b = pickOne(placeableObjPool);
                        if (!a || !b) { validObj = false; break; }
                        validObj = true;
                        if (currentLevel.value > 1 && b.placeable === false) validObj = false;
                        else if (b.domain && !b.domain.includes(a.id) && !b.domain.includes("general")) validObj = false;
                    }
                    attempts++;
                }

                if (!validObj || !a || !b) return safeFallbackQuestion(skillDef.id);

                q = {
                    chinese: `${a.t || a.zh || '…'}的${b.t || b.zh || '…'}`,
                    segments: [
                        { text: a.j, ruby: a.r, isBlank: false },
                        { isBlank: true, blankIndex: 0 },
                        { text: b.j, ruby: b.r, isBlank: false }
                    ],
                    answers: [["の"]],
                    grammarTip: tipText,
                    skillId: skillDef.id
                };
                if (blanks === 1) q.choices = getChoices(["の", "は", "が", "を"]);
            }
            else if (skillDef.id === 'WA_TOPIC') {
                const isIdentity = Math.random() < 0.5;
                let x, y, validObj = false, attempts = 0;

                const peoplePool = [...(safeVocab.people || []), { j: "私", r: "わたし", t: "我", tags: ["person"] }, { j: "あなた", r: "あなた", t: "你", tags: ["person"] }];
                const timePool = [{ j: "今日", r: "きょう", t: "今天", tags: ["time"] }, { j: "明日", r: "あした", t: "明天", tags: ["time"] }, { j: "週末", r: "しゅうまつ", t: "週末", tags: ["time"] }];
                const identityPool = [...(safeVocab.people || []).filter(p => (p.tags || []).includes("role")), { j: "学生", r: "がくせい", t: "學生", tags: ["role"] }, { j: "医者", r: "いしゃ", t: "醫生", tags: ["role"] }, { j: "先生", r: "せんせい", t: "老師", tags: ["role"] }];
                const statePool = [{ j: "休み", r: "やすみ", t: "休息", tags: ["state"] }, { j: "雨", r: "あめ", t: "雨", tags: ["state"] }, { j: "いい天気", r: "いいてんき", t: "好天氣", tags: ["state"] }];

                if (isIdentity) {
                    while (attempts < 20 && !validObj) {
                        x = pickOne(peoplePool);
                        y = pickOne(identityPool);
                        const xIsRole = x && x.tags && x.tags.includes("role");
                        const _xIsTeacher = x && x.j === "先生";
                        if (x && y && x.j !== y.j) {
                            if (xIsRole && !_xIsTeacher) validObj = false;
                            else validObj = true;
                        }
                        attempts++;
                    }
                } else {
                    x = pickOne(timePool);
                    y = pickOne(statePool);
                    validObj = true;
                }

                if (!validObj) return safeFallbackQuestion(skillDef.id);

                q = {
                    chinese: `${x.t || x.zh || '…'}是${y.t || y.zh || '…'}`,
                    segments: [
                        { text: x.j, ruby: x.r, isBlank: false },
                        { isBlank: true, blankIndex: 0 },
                        { text: y.j + "です", ruby: y.r + "です", isBlank: false }
                    ],
                    answers: [["は"]],
                    grammarTip: tipText,
                    skillId: skillDef.id
                };
                if (blanks === 1) q.choices = getChoices(["は", "が", "を", "に"]);
            }
            else if (skillDef.id === 'GA_EXIST') {
                const poolNature = safeVocab.nature || [{ j: "雨", r: "あめ", t: "雨", kind: "precip" }];
                const poolVerbsNature = safeVocab.verbs_nature || [{ j: "降る", r: "ふる", t: "下（雨雪）", kinds: ["precip"] }];
                const poolPhenomena = safeVocab.phenomena || [];
                const poolVerbsPhenomena = safeVocab.verbs_phenomena || [];

                const allNouns = [...poolNature, ...poolPhenomena];
                const allVerbs = [...poolVerbsNature, ...poolVerbsPhenomena];

                const catNature = allNouns.filter(n => n.kind === 'precip' || n.kind === 'wind' || n.kind === 'sky' || n.kind === 'flower' || (n.tags && n.tags.includes('phenomenon')));
                const catState = allNouns.filter(n => n.tags && (n.tags.includes('state') || n.tags.includes('feeling')));
                const catEvent = allNouns.filter(n => n.tags && n.tags.includes('event'));

                let n = null, v = null, attempt = 0, valid = false;

                while (!valid && attempt < 50) {
                    let targetCategory = 'nature';
                    let roll = Math.random() * 100;
                    let wNature = 40, wState = 35, wEvent = 25;

                    if (gaExistRecentCategories.length >= 2) {
                        const last1 = gaExistRecentCategories[gaExistRecentCategories.length - 1];
                        const last2 = gaExistRecentCategories[gaExistRecentCategories.length - 2];
                        if (last1 === last2) {
                            if (last1 === 'nature') { wNature = 0; roll = Math.random() * 60; }
                            else if (last1 === 'state') { wState = 0; roll = Math.random() * 65; }
                            else if (last1 === 'event') { wEvent = 0; roll = Math.random() * 75; }
                        }
                    }

                    if (roll < wNature) targetCategory = 'nature';
                    else if (roll < wNature + wState) targetCategory = 'state';
                    else targetCategory = 'event';

                    let selectedPool;
                    if (targetCategory === 'nature' && catNature.length > 0) selectedPool = catNature;
                    else if (targetCategory === 'state' && catState.length > 0) selectedPool = catState;
                    else if (targetCategory === 'event' && catEvent.length > 0) selectedPool = catEvent;
                    else selectedPool = allNouns;

                    n = pickOne(selectedPool);
                    let candidates = allVerbs.filter(verb => (verb.kinds || []).includes(n.kind));

                    if (candidates.length === 0) { attempt++; continue; }

                    v = pickOne(candidates);
                    const sentenceKey = `${n.j}_${v.j}`;
                    const templateKey = n.kind;

                    if (gaExistRecentSentences.includes(sentenceKey) || gaExistRecentTemplates.includes(templateKey)) {
                        attempt++; continue;
                    }

                    valid = true;
                    gaExistRecentCategories.push(targetCategory);
                    if (gaExistRecentCategories.length > 3) gaExistRecentCategories.shift();
                    gaExistRecentSentences.push(sentenceKey);
                    if (gaExistRecentSentences.length > 5) gaExistRecentSentences.shift();
                    gaExistRecentTemplates.push(templateKey);
                    if (gaExistRecentTemplates.length > 3) gaExistRecentTemplates.shift();
                }

                if (!valid) {
                    const fallbackCombos = [
                        { n: { j: "雨", r: "あめ", t: "雨", kind: "precip" }, v: { j: "降る", r: "ふる", t: "下（雨雪）", kinds: ["precip"] } },
                        { n: { j: "雪", r: "ゆき", t: "雪", kind: "precip" }, v: { j: "降る", r: "ふる", t: "下（雨雪）", kinds: ["precip"] } }
                    ];
                    const safe = pickOne(fallbackCombos);
                    n = safe.n; v = safe.v;
                }

                q = {
                    chinese: `${v.t || v.zh || '…'}${n.t || n.zh || '…'}`,
                    segments: [
                        { text: n.j, ruby: n.r, isBlank: false },
                        { isBlank: true, blankIndex: 0 },
                        { text: v.j, ruby: v.r, isBlank: false }
                    ],
                    answers: [["が"]],
                    grammarTip: tipText,
                    skillId: skillDef.id
                };
                if (blanks === 1) q.choices = getChoices(["が", "を", "に", "で", "は", "へ", "と", "の"]);
            }
            else if (skillDef.id === 'WO_OBJECT') {
                const vList = (safeVocab.verbs_do || []).filter(v => v.vt === true);
                const v = pickOne(vList) || { j: "読む", r: "よむ", t: "讀", kind: "read" };

                let oPool = safeVocab.objects || db?.objects || [];
                if (v.kind === "eat") oPool = oPool.filter(o => ["ご飯", "りんご", "肉", "魚", "野菜", "パン", "料理"].includes(o.j));
                else if (v.kind === "drink") oPool = oPool.filter(o => ["水", "牛乳", "お茶", "コーヒー"].includes(o.j));
                else if (v.kind === "listen") oPool = oPool.filter(o => ["音楽", "ラジオ"].includes(o.j));
                else if (v.kind === "read") oPool = oPool.filter(o => ["本", "新聞", "雑誌", "手紙"].includes(o.j));

                if (!oPool || oPool.length === 0) oPool = safeVocab.objects || db?.objects || [];
                const o = pickOne(oPool) || { j: "本", r: "ほん", t: "書" };

                q = {
                    chinese: `${v.t || v.zh || '…'}${o.t || o.zh || '…'}`,
                    segments: [
                        { text: o.j, ruby: o.r, isBlank: false },
                        { isBlank: true, blankIndex: 0 },
                        { text: v.j, ruby: v.r, isBlank: false }
                    ],
                    answers: [["を"]],
                    grammarTip: tipText,
                    skillId: skillDef.id
                };
                if (blanks === 1) q.choices = getChoices(["を", "に", "が", "で", "は", "へ", "と", "の"]);
            }
            else if (skillDef.id === 'NI_TIME') {
                const tList = safeVocab.times || [{ j: "明日", r: "あした", t: "明天" }, { j: "今日", r: "きょう", t: "今天" }];
                const time = pickOne(tList);
                const vList = safeVocab.verbs_move || [{ j: "行く", r: "いく", t: "去" }];
                const v = pickOne(vList);
                let vj = v.j, vr = v.r;
                if (vj === "行きます") { vj = "行く"; vr = "い"; }
                else if (vj === "帰ります") { vj = "帰る"; vr = "かえ"; }
                else if (vj === "来ます") { vj = "来る"; vr = "く"; }

                q = {
                    chinese: `${time.t || time.zh || '…'}${v.t || v.zh || '…'}`,
                    segments: [
                        { text: time.j, ruby: time.r, isBlank: false },
                        { isBlank: true, blankIndex: 0 },
                        { text: vj, ruby: vr, isBlank: false }
                    ],
                    answers: [["に"]],
                    grammarTip: tipText,
                    skillId: skillDef.id
                };
                if (blanks === 1) q.choices = getChoices(["に", "で", "へ", "を", "は", "が", "と", "の"]);
            }
            else if (skillDef.id === 'HE_DEST') {
                const pList = safeVocab.places || [{ j: "学校", r: "がっこう", t: "學校" }];
                const vList = safeVocab.verbs_move || [{ j: "行く", r: "いく", t: "去" }];
                const p = pickOne(pList);
                const v = pickOne(vList);
                let vj = v.j, vr = v.r;
                if (vj === "行きます") { vj = "行く"; vr = "い"; }
                else if (vj === "帰ります") { vj = "帰る"; vr = "かえ"; }
                else if (vj === "来ます") { vj = "来る"; vr = "く"; }
                q = {
                    chinese: `${v.t || v.zh || '…'}${p.t || p.zh || '…'}`,
                    segments: [
                        { text: p.j, ruby: p.r, isBlank: false },
                        { isBlank: true, blankIndex: 0 },
                        { text: vj, ruby: vr, isBlank: false }
                    ],
                    answers: [["へ"]],
                    grammarTip: tipText,
                    skillId: skillDef.id
                };
                if (blanks === 1) q.choices = getChoices(["へ", "に", "で", "を", "は", "が", "と", "の"]);
            }
            return q;
        };

        const initGame = (level) => {
            const ratio = player.value.hp / player.value.maxHp;
            let startState = 'neutral';
            if (ratio <= 0.4) startState = 'scary';
            else if (ratio < 0.8) startState = 'ase';

            setHeroAvatar(startState);
            window.heroHP = player.value.hp;
            window.heroMaxHP = player.value.maxHp;
            clearSpeedStatus();

            heroBuffs.enemyAtbMult = 1.0;
            heroBuffs.enemyDmgMult = 1.0;
            heroBuffs.odoodoTurns = 0;
            heroBuffs.wakuwakuTurns = 0;
            heroBuffs.monsterSleep = false;
            evasionBuffAttacksLeft.value = 0;
            updateHeroStatusBar();

            isMistakesOpen.value = false;
            isMenuOpen.value = false;
            const lv = level ?? currentLevel.value;
            currentLevel.value = lv;
            const config = LEVEL_CONFIG.value[lv] || LEVEL_CONFIG.value[1] || { types: [0, 1, 2], blanks: 1 };

            if (config.unlockSkills && config.unlockSkills.length > 0) {
                const newUnlocks = [];
                config.unlockSkills.forEach(skillId => {
                    if (!unlockedSkillIds.value.includes(skillId)) {
                        unlockedSkillIds.value.push(skillId);
                        newUnlocks.push(skillId);
                    }
                });
                if (newUnlocks.length > 0) {
                    newlyUnlocked.value = newUnlocks.map(id => skillsAll.value[id]).filter(Boolean);
                    isSkillUnlockModalOpen.value = true;
                }
            }

            const typePool = config.types;
            const blanks = config.blanks;
            const qList = [];
            let reviewCycle = { remainingReview: 1, remainingL2: 3, lastWasReview: false };
            const allowSkills = ['WA_TOPIC', 'NO_POSSESS'];

            for (let i = 0; i < 100; i++) {
                let q = null;
                let skillId = null;
                let isReview = false;

                if (lv === 1) {
                    skillId = Math.random() < 0.5 ? allowSkills[0] : allowSkills[1];
                } else if (unlockedSkillIds.value.length > 0) {
                    if (lv === 2) {
                        if (reviewCycle.remainingReview === 0 && reviewCycle.remainingL2 === 0) {
                            reviewCycle.remainingReview = 1;
                            reviewCycle.remainingL2 = 3;
                        }
                        if (reviewCycle.lastWasReview) isReview = false;
                        else if (reviewCycle.remainingReview === 0) isReview = false;
                        else if (reviewCycle.remainingL2 === 0) isReview = true;
                        else isReview = Math.random() < (reviewCycle.remainingReview / (reviewCycle.remainingReview + reviewCycle.remainingL2));

                        if (isReview) {
                            reviewCycle.remainingReview--;
                            skillId = Math.random() < 0.5 ? allowSkills[0] : allowSkills[1];
                        } else {
                            reviewCycle.remainingL2--;
                            skillId = pickSkillIdForNextQuestion(lv);
                        }
                        reviewCycle.lastWasReview = isReview;
                    } else {
                        skillId = pickSkillIdForNextQuestion(lv);
                    }
                }

                let generatedFromSkill = false;
                let attempts = 0;

                while (attempts < 10 && skillId && !generatedFromSkill) {
                    const originalLevel = currentLevel.value;
                    if (isReview) currentLevel.value = 1;
                    q = generateQuestionBySkill(skillId, blanks, db, VOCAB.value);
                    if (isReview) {
                        currentLevel.value = originalLevel;
                        if (q) { q.meta = q.meta || {}; q.meta.review = true; }
                    }

                    if (q) {
                        const ansStr = Array.isArray(q.answers[0]) ? q.answers[0][0] : q.answers[0];
                        let valid = true;
                        if (skillId === 'NO_POSSESS' && ansStr !== 'の') valid = false;
                        if (skillId === 'WA_TOPIC' && ansStr !== 'は') valid = false;
                        if (skillId === 'GA_EXIST' && ansStr !== 'が') valid = false;
                        if (skillId === 'WO_OBJECT' && ansStr !== 'を') valid = false;
                        if (skillId === 'NI_TIME' && ansStr !== 'に') valid = false;
                        if (skillId === 'HE_DEST' && ansStr !== 'へ') valid = false;

                        if (valid) generatedFromSkill = true;
                        else q = null;
                    }
                    attempts++;
                }

                if (!generatedFromSkill && skillId) {
                    q = safeFallbackQuestion(skillId);
                    if (q) generatedFromSkill = true;
                }

                if (!generatedFromSkill) {
                    const type = typePool[Math.floor(Math.random() * typePool.length)];
                    switch (type) {
                        case 0:
                            const p0 = rand(db.places);
                            q = { chinese: `去${p0.t}`, segments: [{ text: p0.j, ruby: p0.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: "行く", ruby: "い", isBlank: false }], answers: [["へ", "に"]], grammarTip: db.grammarTips.move };
                            if (blanks === 1) q.choices = makeChoices(["へ", "に"]);
                            break;
                        case 1: {
                            const verbTypes = [
                                { type: "read", v: { j: "読む", r: "よ", full: "よむ" }, ch: "讀" },
                                { type: "eat", v: { j: "食べる", r: "た", full: "たべる" }, ch: "吃" },
                                { type: "hear", v: { j: "聞く", r: "き", full: "きく" }, ch: "聽" },
                                { type: "write", v: { j: "書く", r: "か", full: "かく" }, ch: "寫" }
                            ];
                            const vt = rand(verbTypes);
                            const pool1 = db.objects.filter(x => x.type === vt.type);
                            const o1 = rand(pool1);
                            const p1 = rand(db.places);
                            if (blanks === 1) {
                                const vReading = vt.v.full || vt.v.r + "む";
                                q = { chinese: `在${p1.t}${vt.ch}${o1.t}`, segments: [{ text: p1.j, ruby: p1.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: o1.j + "を" + vt.v.j, ruby: o1.r + "を" + vReading, isBlank: false }], answers: ["で"], grammarTip: db.grammarTips.placeAction };
                                q.choices = makeChoices("で");
                            } else {
                                q = { chinese: `在${p1.t}${vt.ch}${o1.t}`, segments: [{ text: p1.j, ruby: p1.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: o1.j, ruby: o1.r, isBlank: false }, { isBlank: true, blankIndex: 1 }, { text: vt.v.j, ruby: vt.v.r, isBlank: false }], answers: ["で", "を"], grammarTip: db.grammarTips.placeAction };
                            }
                            break;
                        }
                        case 2: {
                            const p2 = rand(db.places);
                            const pool2 = db.objects.filter(x => x.exists !== false);
                            const o2 = rand(pool2);
                            if (blanks === 1) {
                                q = { chinese: `${p2.t}有${o2.t}`, segments: [{ text: p2.j, ruby: p2.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: o2.j + "が" + "ある", ruby: o2.r + "がある", isBlank: false }], answers: ["に"], grammarTip: db.grammarTips.existence };
                                q.choices = makeChoices("に");
                            } else {
                                q = { chinese: `${p2.t}有${o2.t}`, segments: [{ text: p2.j, ruby: p2.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: o2.j, ruby: o2.r, isBlank: false }, { isBlank: true, blankIndex: 1 }, { text: "ある", isBlank: false }], answers: ["に", "が"], grammarTip: db.grammarTips.existence };
                            }
                            break;
                        }
                        case 3: {
                            const pe3 = rand(db.people); const o3 = db.objects.filter(x => x.type === 'read').random();
                            const v3 = { j: "読む", r: "よ", full: "よむ" };
                            if (blanks === 1) {
                                q = { chinese: `和${pe3.t}一起讀${o3.t}`, segments: [{ text: pe3.j, ruby: pe3.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: o3.j + "を" + v3.j, ruby: o3.r + "を" + v3.full, isBlank: false }], answers: ["と"], grammarTip: db.grammarTips.accompany };
                                q.choices = makeChoices("と");
                            } else {
                                q = { chinese: `和${pe3.t}一起讀${o3.t}`, segments: [{ text: pe3.j, ruby: pe3.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: o3.j, ruby: o3.r, isBlank: false }, { isBlank: true, blankIndex: 1 }, { text: "読む", ruby: "よ", isBlank: false }], answers: ["と", "を"], grammarTip: db.grammarTips.accompany };
                            }
                            break;
                        }
                        case 4: {
                            const useRead = Math.random() < 0.5;
                            const t4 = useRead ? db.tools.find(x => x.j === "スマホ") : db.tools.find(x => x.j === "ペン");
                            const pool4 = db.objects.filter(x => x.type === (useRead ? "read" : "write"));
                            const o4 = rand(pool4);
                            const verb4 = useRead ? { j: "読む", r: "よ", full: "よむ", ch: "看" } : { j: "書く", r: "か", full: "かく", ch: "寫" };
                            if (blanks === 1) {
                                q = { chinese: `用${t4.t}${verb4.ch}${o4.t}`, segments: [{ text: t4.j, ruby: t4.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: o4.j + "を" + verb4.j, ruby: o4.r + "を" + verb4.full, isBlank: false }], answers: ["で"], grammarTip: db.grammarTips.tool };
                                q.choices = makeChoices("で");
                            } else {
                                q = { chinese: `用${t4.t}${verb4.ch}${o4.t}`, segments: [{ text: t4.j, ruby: t4.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: o4.j, ruby: o4.r, isBlank: false }, { isBlank: true, blankIndex: 1 }, { text: verb4.j, ruby: verb4.r, isBlank: false }], answers: ["で", "を"], grammarTip: db.grammarTips.tool };
                            }
                            break;
                        }
                        case 5: {
                            const pe5 = rand(db.people); const o5 = rand(db.objects);
                            if (blanks === 1) {
                                q = { chinese: `給${pe5.t}${o5.t}`, segments: [{ text: pe5.j, ruby: pe5.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: o5.j + "をあげる", ruby: o5.r + "をあげる", isBlank: false }], answers: ["に"], grammarTip: db.grammarTips.give };
                                q.choices = makeChoices("に");
                            } else {
                                q = { chinese: `給${pe5.t}${o5.t}`, segments: [{ text: pe5.j, ruby: pe5.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: o5.j, ruby: o5.r, isBlank: false }, { isBlank: true, blankIndex: 1 }, { text: "あげる", isBlank: false }], answers: ["に", "を"], grammarTip: db.grammarTips.give };
                            }
                            break;
                        }
                    }
                    q.skillId = 'FALLBACK';
                }
                qList.push(q);
            }

            questions.value = qList;
            currentIndex.value = 0;
            comboCount.value = 0;
            maxComboCount.value = 0;
            totalQuestionsAnswered.value = 0;
            correctAnswersAmount.value = 0;
            earnedExp.value = 0;
            earnedGold.value = 0;
            isFinished.value = false;
            userAnswers.value = [];
            slotFeedbacks.value = {};
            hasSubmitted.value = false;
            timeUp.value = false;

            const mdef = MONSTERS[(lv - 1) % MONSTERS.length] || MONSTERS[0];
            monster.value = { hp: mdef.hpMax, maxHp: mdef.hpMax, name: mdef.name, sprite: mdef.sprite, trait: mdef.trait };
            const bgIdx = Math.floor(Math.random() * 6) + 1;
            currentBg.value = `assets/images/bg_0${bgIdx}.jpg`;
            pushBattleLog(monster.value.name + ' 出現了！', 'info');
            hpBarDanger.value = false;
            clearTimer();
            startTimer();
            playSfx('pop');

            voicePlayedForCurrentQuestion.value = false;
            window.skillId = currentQuestion.value?.skillId;
        };

        const currentQuestion = computed(() => questions.value[currentIndex.value] || { chinese: '', segments: [] });

        const getFormattedAnswer = () => {
            return currentQuestion.value.answers.map(ans => {
                const parsed = parseAcceptableAnswers(ans);
                return parsed.join('/');
            }).join(' 、 ');
        };

        let JA_VOICE = null;
        const initJapaneseVoice = () => {
            if (!window.speechSynthesis) return;
            const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('ja'));
            if (voices.length === 0) return;
            JA_VOICE = voices.find(v => v.name.includes('Neural') || v.name.includes('Natural')) ||
                voices.find(v => v.name.includes('Microsoft')) ||
                voices.find(v => v.name.includes('Google')) || voices[0];
        };

        if (window.speechSynthesis) {
            initJapaneseVoice();
            window.speechSynthesis.onvoiceschanged = initJapaneseVoice;
        }

        const playQuestionVoice = async () => {
            let azureTextBuilder = '';
            currentQuestion.value.segments.forEach(s => {
                if (s.isBlank) {
                    let ans = currentQuestion.value.answers[s.blankIndex];
                    if (Array.isArray(ans)) ans = ans[0];
                    azureTextBuilder += ans;
                } else {
                    azureTextBuilder += s.text;
                }
            });
            let cleanQuestionText = azureTextBuilder.replace(/[_ ]/g, '').replace(/（[^）]*）|\([^)]*\)/g, '');
            if (!cleanQuestionText) cleanQuestionText = azureTextBuilder.replace(/[_ ]/g, '') || '';
            if (!cleanQuestionText) return;

            voicePlayedForCurrentQuestion.value = true;
            await speakAzure(cleanQuestionText);
        };

        const parseAcceptableAnswers = (ans) => {
            if (typeof ans === 'string') return ans.split(/[/、,]/g).map(s => s.trim()).filter(s => s);
            return Array.isArray(ans) ? ans : [ans];
        };

        let lastPraiseTime = 0;
        let lastPraiseText = '';
        const ONEESAN_PRAISES = ['せいかい！', 'ナイス！', 'いいね！', 'すごい！', 'えぐっ！', 'まじか！', '天才か！'];

        const praiseToast = ref({ show: false, text: '' });
        let praiseToastTimer = null;
        const showPraiseToast = (text, ms = 900) => {
            praiseToast.value.text = text;
            praiseToast.value.show = true;
            if (praiseToastTimer) clearTimeout(praiseToastTimer);
            praiseToastTimer = setTimeout(() => { praiseToast.value.show = false; }, ms);
        };

        const playCorrectFeedback = (combo) => {
            initAudio();
            const style = settings.feedbackStyle || 'combat';

            // ⚠️ 移除了這裡過早觸發的 playSfx('hit')，將它移到 checkAnswer 裡的延遲區塊中

            if (style === 'combat') {
                if ([3, 5, 7, 10, 15, 20].includes(combo)) {
                    if (_isMobileSfx) playUiSfx('pop'); else playSfx('pop');
                }
            } else if (style === 'oneesan') {
                let praiseIndex = 0;
                if (combo >= 20) praiseIndex = 6;
                else if (combo >= 15) praiseIndex = 5;
                else if (combo >= 10) praiseIndex = 4;
                else if (combo >= 7) praiseIndex = 3;
                else if (combo >= 5) praiseIndex = 2;
                else if (combo >= 3) praiseIndex = 1;

                const text = ONEESAN_PRAISES[praiseIndex];
                showPraiseToast(text);

                const milestones = [3, 5, 7, 10, 15, 20];
                if (milestones.includes(combo)) {
                    const now = Date.now();
                    if (now - lastPraiseTime >= 1500 && lastPraiseText !== text) {
                        lastPraiseTime = now;
                        lastPraiseText = text;
                        playTtsKey(`ui.praise_${praiseIndex}`, text);
                    }
                }
            }
        };

        const checkAnswer = () => {
            if (hasSubmitted.value) return;
            hasSubmitted.value = true;

            if (heroBuffs.monsterSleep) {
                heroBuffs.monsterSleep = false;
                pushBattleLog('因為你的攻擊，怪物驚醒了！', 'info');
            }

            hpBarDanger.value = false;
            const blanks = levelConfig.value.blanks;
            totalQuestionsAnswered.value++;

            let allCorrect = true;
            currentQuestion.value.answers.slice(0, blanks).forEach((ans, i) => {
                const userIn = (userAnswers.value[i] || "").trim();
                const acceptableAnswers = parseAcceptableAnswers(ans);
                const isCorrect = acceptableAnswers.includes(userIn);
                if (!isCorrect) allCorrect = false;

                // 第一時間讓選項格子變色，給玩家即時反饋
                slotFeedbacks.value[i] = isCorrect ? 'is-correct' : 'is-wrong';
                setTimeout(() => {
                    if (slotFeedbacks.value[i] === (isCorrect ? 'is-correct' : 'is-wrong')) {
                        slotFeedbacks.value[i] = '';
                    }
                }, isCorrect ? 600 : 400);
            });
            isCurrentCorrect.value = allCorrect;

            // 🌟 判定延遲時間：彈射模式等子彈飛 400ms，點選模式可以同步或無延遲 (此處統一使用 400ms 營造打擊節奏)
            const isFlick = answerMode.value === 'flick';
            const impactDelay = isFlick ? 400 : 0;

            setTimeout(() => {
                if (isCurrentCorrect.value) {
                    correctAnswersAmount.value++;
                    playCorrectFeedback(comboCount.value + 1);

                    const isPlayerMiss = Math.random() < 0.05;
                    if (isPlayerMiss) {
                        if (_isMobileSfx) playUiSfx('miss'); else playSfx('miss');
                        pushBattleLog(`攻擊被閃避了！沒造成傷害！`, 'info');
                    } else {
                        monsterHit.value = true;
                        setTimeout(() => { monsterHit.value = false; }, 250);

                        // 🌟 子彈抵達瞬間！完美同步播放打擊音效
                        if (_isMobileSfx) playUiSfx('hit'); else playSfx('hit');

                        // 💡 點選(Tap)模式原本沒有子彈，這裡幫它補上命中爆炸特效
                        if (!isFlick) {
                            const monsterEl = document.querySelector('img[alt="monster"]') || document.querySelector('.w-28.h-28.rounded-full');
                            const center = rectCenter(monsterEl);
                            if (center) spawnHitVfx(center.x, center.y);
                        }

                        comboCount.value++;
                        if (comboCount.value > maxComboCount.value) maxComboCount.value = comboCount.value;

                        if (window.__sp.cur < window.__sp.max) {
                            window.__sp.cur++;
                            if (window.updateSpUI) window.updateSpUI();
                        }

                        const timeTaken = (Date.now() - questionStartTime) / 1000;
                        let dmg = 20;
                        if (timeTaken <= 2) dmg = 20;
                        else if (timeTaken >= 10) dmg = 5;
                        else dmg = Math.round(20 - ((timeTaken - 2) / 8) * 15);

                        if (voicePlayedForCurrentQuestion.value) {
                            dmg = Math.max(2, Math.floor(dmg / 2));
                            pushBattleLog('偷聽：傷害減半', 'buff');
                        }

                        monster.value.hp = Math.max(0, monster.value.hp - dmg);
                        pushBattleLog(`造成 ${dmg} 點傷害！`, 'info');

                        if (monster.value.hp <= 0) grantRewards();
                    }
                } else {
                    comboCount.value = 0;
                    addMistake();

                    initAudio();
                    if (_isMobileSfx) playUiSfx('miss'); else playSfx('miss');
                    pushBattleLog(`攻擊失敗！`, 'info');

                    if (window.__TTS_ON_WRONG_TIMEOUT) { clearTimeout(window.__TTS_ON_WRONG_TIMEOUT); window.__TTS_ON_WRONG_TIMEOUT = null; }
                    if (window.__FLICK_ADVANCE_TIMEOUT) { clearTimeout(window.__FLICK_ADVANCE_TIMEOUT); window.__FLICK_ADVANCE_TIMEOUT = null; }

                    if (settings.autoReadOnWrong) {
                        let azureTextBuilder = '';
                        currentQuestion.value.segments.forEach(s => {
                            if (s.isBlank) {
                                let ans = currentQuestion.value.answers[s.blankIndex];
                                if (Array.isArray(ans)) ans = ans[0];
                                azureTextBuilder += ans;
                            } else {
                                azureTextBuilder += s.text;
                            }
                        });
                        let cleanQuestionText = azureTextBuilder.replace(/[_ ]/g, '').replace(/（[^）]*）|\([^)]*\)/g, '');
                        if (!cleanQuestionText) cleanQuestionText = azureTextBuilder.replace(/[_ ]/g, '') || '';

                        const ttsQuestionIdx = currentIndex.value;

                        if (cleanQuestionText) {
                            startSfxDuck(1800);
                            window.__TTS_ON_WRONG_TIMEOUT = setTimeout(() => {
                                if (currentIndex.value === ttsQuestionIdx && hasSubmitted.value && !isCurrentCorrect.value && !monsterDead.value && !playerDead.value && !isFinished.value && !showLevelSelect.value) {
                                    speakAzure(cleanQuestionText);
                                }
                            }, 220);
                        }
                    }
                }

                if (window.__AUTO_ADVANCE_TIMEOUT) { clearTimeout(window.__AUTO_ADVANCE_TIMEOUT); window.__AUTO_ADVANCE_TIMEOUT = null; }

                let delayMs = isCurrentCorrect.value
                    ? (settings.correctAdvanceDelayMs !== null && typeof settings.correctAdvanceDelayMs === 'number' ? settings.correctAdvanceDelayMs : 1000)
                    : (settings.wrongAdvanceDelayMs !== null && typeof settings.wrongAdvanceDelayMs === 'number' ? settings.wrongAdvanceDelayMs : 3000);

                if (delayMs > 0) {
                    window.__AUTO_ADVANCE_TIMEOUT = setTimeout(() => {
                        if (!isFinished.value && !monsterDead.value && !playerDead.value && !showLevelSelect.value) {
                            if (window.__TTS_ON_WRONG_TIMEOUT) { clearTimeout(window.__TTS_ON_WRONG_TIMEOUT); window.__TTS_ON_WRONG_TIMEOUT = null; }
                            nextQuestion();
                        }
                    }, delayMs);
                }
            }, impactDelay); // 🌟 結束 400ms 延遲包覆
        };

        const nextQuestion = () => {
            showGrammarDetail.value = false;
            if (window.__TTS_ON_WRONG_TIMEOUT) { clearTimeout(window.__TTS_ON_WRONG_TIMEOUT); window.__TTS_ON_WRONG_TIMEOUT = null; }
            if (window.__FLICK_ADVANCE_TIMEOUT) { clearTimeout(window.__FLICK_ADVANCE_TIMEOUT); window.__FLICK_ADVANCE_TIMEOUT = null; }
            if (window.__AUTO_ADVANCE_TIMEOUT) { clearTimeout(window.__AUTO_ADVANCE_TIMEOUT); window.__AUTO_ADVANCE_TIMEOUT = null; }
            initAudio();
            if (needsUserGestureToResumeBgm.value) { ensureBgmPlaying('nextQuestion'); needsUserGestureToResumeBgm.value = false; }
            playSfx('click');

            if (currentIndex.value < 49) {
                currentIndex.value++;
                if (currentIndex.value >= questions.value.length) currentIndex.value = 0;
            } else {
                currentIndex.value = 0;
            }

            userAnswers.value = [];
            slotFeedbacks.value = {};
            hasSubmitted.value = false;
            applyTurnLogic();

            if (answerMode.value === 'flick') {
                flickState.isArmed = false;
                flickState.activeOpt = null;
            }
            const vfxLayer = document.getElementById('flickVfxLayer');
            if (vfxLayer) vfxLayer.innerHTML = '';

            questionStartTime = Date.now();
            voicePlayedForCurrentQuestion.value = false;
        };

        const grantRewards = () => {
            const lv = currentLevel.value;
            const baseExp = 50 + (lv * 20);
            const baseGold = 30 + (lv * 15);
            const comboBonus = maxComboCount.value * 5;
            earnedExp.value = baseExp;
            earnedGold.value = baseGold + comboBonus;
            player.value.exp += earnedExp.value;
            player.value.gold += earnedGold.value;
            pushBattleLog(`擊敗怪物！獲得 ${earnedExp.value} EXP 與 ${earnedGold.value} 金幣！`, 'buff');
            clearTimer();

            stopAllAudio();
            playSfx('win');
            setHeroAvatar('win');
            setTimeout(() => { playSfx('fanfare'); }, 2000);
        };

        const getInputStyle = (idx) => {
            if (!hasSubmitted.value) return '';
            return slotFeedbacks.value[idx] || '';
        };

        const displaySegments = computed(() => {
            const q = currentQuestion.value;
            const blanks = levelConfig.value.blanks;
            return (q.segments || []).map(seg => {
                if (!seg.isBlank) return { ...seg, showInput: false };
                return { ...seg, showInput: seg.blankIndex < blanks };
            });
        });

        const getAnswerForDisplay = (blankIndex) => {
            const ans = currentQuestion.value.answers[blankIndex];
            return Array.isArray(ans) ? ans[0] : ans;
        };

        const selectChoice = (opt) => {
            initAudioCtx();
            if (!audioInited.value) initAudio();
            if (needsUserGestureToResumeBgm.value) { ensureBgmPlaying('selectChoice'); needsUserGestureToResumeBgm.value = false; }
            playSfx('click');
            if (hasSubmitted.value) return;
            userAnswers.value[0] = opt;
        };

        const getChoiceBtnClass = (opt) => {
            if (!hasSubmitted.value) {
                return (userAnswers.value[0] === opt) ? 'is-selected' : 'is-idle';
            }
            const correct = Array.isArray(currentQuestion.value.answers[0]) ? currentQuestion.value.answers[0] : [currentQuestion.value.answers[0]];
            const isCorrectOpt = correct.includes(opt);
            const isSelected = userAnswers.value[0] === opt;

            if (isCorrectOpt) return 'is-correct';
            if (isSelected) return 'is-wrong';
            return 'is-disabled';
        };

        const monsterDead = computed(() => monster.value.hp <= 0);
        const playerDead = computed(() => player.value.hp <= 0);
        const levelPassed = computed(() => monsterDead.value);

        const goNextLevel = () => {
            needsUserGestureToResumeBgm.value = false;
            stopAllAudio();

            if (difficulty.value === 'easy') {
                player.value.hp = 100;
                inventory.value.potions = INITIAL_POTIONS;
            } else {
                player.value.hp = Math.min(100, player.value.hp + 50);
            }

            window.__sp.cur = window.__sp.max;
            if (window.updateSpUI) window.updateSpUI();

            currentLevel.value++;
            initGame(currentLevel.value);
            pickBattleBgm(currentLevel.value);
            playBgm();
        };

        const retryLevel = () => { needsUserGestureToResumeBgm.value = false; stopAllAudio(); initGame(currentLevel.value); };

        const startOver = () => {
            setHeroAvatar('neutral');
            clearSpeedStatus();
            window.heroHP = 100;
            window.heroMaxHP = 100;
            updateHeroStatusBar();
            isMistakesOpen.value = false;
            isMenuOpen.value = false;
            stopAllAudio();
            clearTimer();
            if (pauseTimerId) { clearInterval(pauseTimerId); pauseTimerId = null; }
            needsUserGestureToResumeBgm.value = false;
            showLevelSelect.value = true;
            inventory.value.potions = INITIAL_POTIONS;
            window.__sp.cur = window.__sp.max;
            if (window.updateSpUI) window.updateSpUI();
        };

        const revive = () => {
            setHeroAvatar('neutral');
            clearSpeedStatus();
            window.heroHP = 100;
            window.heroMaxHP = 100;
            updateHeroStatusBar();
            isMistakesOpen.value = false;
            isMenuOpen.value = false;
            stopAllAudio();
            clearTimer();
            if (pauseTimerId) { clearInterval(pauseTimerId); pauseTimerId = null; }
            needsUserGestureToResumeBgm.value = false;
            player.value = { hp: 100, maxHp: 100, gold: 0, exp: 0 };
            inventory.value.potions = INITIAL_POTIONS;
            window.__sp.cur = window.__sp.max;
            if (window.updateSpUI) window.updateSpUI();
            showLevelSelect.value = true;
        };

        const accuracyPct = computed(() => {
            if (totalQuestionsAnswered.value === 0) return 0;
            return Math.round((correctAnswersAmount.value / totalQuestionsAnswered.value) * 100);
        });

        const calculatedGrade = computed(() => {
            if (playerDead.value) return '-';
            const acc = accuracyPct.value;
            if (acc === 100) return 'S';
            if (acc >= 90) return 'A';
            if (acc >= 80) return 'B';
            if (acc >= 60) return 'C';
            if (acc >= 40) return 'D';
            return 'E';
        });

        const getGradeColor = (grade) => {
            const colors = {
                'S': 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]',
                'A': 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]',
                'B': 'text-blue-400',
                'C': 'text-amber-400',
                'D': 'text-orange-400',
                'E': 'text-rose-500',
                '-': 'text-slate-500'
            };
            return colors[grade] || 'text-slate-400';
        };

        const getHpColorClass = (hp, maxHp) => {
            const ratio = hp / maxHp;
            if (ratio <= 0.4) return 'bg-rose-500';
            if (ratio <= 0.79) return 'bg-amber-400';
            return 'bg-emerald-500';
        };

        const formatCorrect = (ans) => {
            if (Array.isArray(ans)) return ans.join('/');
            return ans;
        };

        if (!Array.prototype.random) {
            Array.prototype.random = function () { return this[Math.floor(Math.random() * this.length)]; };
        }

        const handleReload = () => {
            window.location.reload();
        };

        onMounted(() => {
            const unlockAudioOnce = () => {
                initAudioCtx().then(() => {
                    if (!audioInited.value) initAudio();
                });
            };
            document.addEventListener('pointerdown', unlockAudioOnce, { once: true, capture: true });
            document.addEventListener('touchstart', unlockAudioOnce, { once: true, capture: true, passive: true });

            const injectTapChoicesClass = () => {
                const el = document.querySelector('#question-area ~ .flex.flex-wrap.justify-center.gap-3');
                if (el && !el.classList.contains('jp-tap-choices')) {
                    el.classList.add('jp-tap-choices');
                }
            };
            const tapChoicesObserver = new MutationObserver(injectTapChoicesClass);
            tapChoicesObserver.observe(document.body, { childList: true, subtree: true });
            watch([answerMode, hasSubmitted], () => {
                nextTick(injectTapChoicesClass);
            });
            injectTapChoicesClass();

            if (!document.getElementById('cornerMenu')) {
                const cornerMenu = document.createElement('div');
                cornerMenu.id = 'cornerMenu';
                cornerMenu.innerHTML = `
                    <div class="corner-menu-items">
                        <button class="corner-menu-btn" data-target="技能">
                            <span style="font-size:18px;">📖</span><span>技能</span>
                        </button>
                        <button class="corner-menu-btn" data-target="回復藥水">
                            <span style="font-size:18px;">🧪</span><span>道具</span>
                        </button>
                        <button class="corner-menu-btn" data-target="背包">
                            <span style="font-size:18px;">🎒</span><span>背包</span>
                        </button>
                        <button class="corner-menu-btn" data-target="系統">
                            <span style="font-size:18px;">⚙️</span><span>系統</span>
                        </button>
                    </div>
                    <button id="cornerMenuToggle" class="corner-menu-toggle">☰</button>
                `;
                document.body.appendChild(cornerMenu);

                const toggleBtn = cornerMenu.querySelector('#cornerMenuToggle');

                toggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    cornerMenu.classList.toggle('open');
                    toggleBtn.innerHTML = cornerMenu.classList.contains('open') ? '▼' : '☰';
                });

                const btns = cornerMenu.querySelectorAll('.corner-menu-items button');
                btns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const targetTitle = btn.dataset.target;
                        const originalBtn = document.querySelector(`.left-actionbar button[title="${targetTitle}"]`);
                        if (originalBtn) {
                            if (!originalBtn.disabled) {
                                originalBtn.click();
                            }
                        }
                        cornerMenu.classList.remove('open');
                        toggleBtn.innerHTML = '☰';
                    });
                });

                document.addEventListener('click', (e) => {
                    if (cornerMenu.classList.contains('open') && !cornerMenu.contains(e.target)) {
                        cornerMenu.classList.remove('open');
                        toggleBtn.innerHTML = '☰';
                    }
                });

                watch([showLevelSelect, isFinished], ([showLvl, finished]) => {
                    if (!showLvl && !finished) {
                        cornerMenu.style.display = 'flex';
                    } else {
                        cornerMenu.style.display = 'none';
                        cornerMenu.classList.remove('open');
                        toggleBtn.innerHTML = '☰';
                    }
                }, { immediate: true });
            }

            const isMobileOrIOS = /iPad|iPhone|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
            let scrollYPos = 0;
            let touchStartY = 0;

            const handleTouchStart = (e) => {
                touchStartY = e.touches[0].clientY;
            };

            const handleTouchMove = (e) => {
                if (!document.body.classList.contains('lock-scroll') || e.touches.length > 1) return;
                const currentY = e.touches[0].clientY;
                if (!e.target.closest('#flickLayer')) {
                    return;
                }
                if (currentY - touchStartY > 0) {
                    e.preventDefault();
                }
            };

            const lockPageScroll = () => {
                if (document.body.classList.contains('lock-scroll')) return;
                scrollYPos = window.scrollY;
                document.body.style.top = `-${scrollYPos}px`;
                document.body.classList.add('lock-scroll');

                document.addEventListener('touchstart', handleTouchStart, { passive: false });
                document.addEventListener('touchmove', handleTouchMove, { passive: false });
            };
            const unlockPageScroll = () => {
                if (!document.body.classList.contains('lock-scroll')) return;
                document.body.classList.remove('lock-scroll');
                document.body.style.top = '';
                window.scrollTo(0, scrollYPos);

                document.removeEventListener('touchstart', handleTouchStart);
                document.removeEventListener('touchmove', handleTouchMove);
            };

            if (isMobileOrIOS) {
                watch(showLevelSelect, (showLvl) => {
                    if (showLvl) {
                        unlockPageScroll();
                    } else {
                        lockPageScroll();
                    }
                }, { immediate: true });
            }

            let meta = document.querySelector('meta[name="viewport"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.name = "viewport";
                document.head.appendChild(meta);
            }
            meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";

            let lastTouchEnd = 0;
            document.addEventListener('touchend', (e) => {
                const now = Date.now();
                if (now - lastTouchEnd <= 300) {
                    if (e.target.closest('button') || e.target.closest('.action-btn')) {
                        if (e.target.closest('#flickLayer')) {
                            e.preventDefault();
                        }
                    }
                }
                lastTouchEnd = now;
            }, { passive: false });
        });

        const shouldShowNextButton = computed(() => {
            if (!hasSubmitted.value) return false;
            if (isCurrentCorrect.value && settings.correctAdvanceDelayMs === 0) return true;
            if (!isCurrentCorrect.value && settings.wrongAdvanceDelayMs === 0) return true;
            return false;
        });

        // 補回被誤刪的 L2 Debug 變數
        const showL2DebugPanel = ref(false);
        const l2DebugQuestions = ref([]);
        const generateL2Debug = () => { };
        const copyL2Debug = () => { };

        loadAudioSettings();

        // 這裡將被刪除的變數加回 return 中
        return { uiMenuOpen, answerMode, flickState, handleRuneClick, startFlick, moveFlick, endFlick, appVersion, isChangelogOpen, changelogData, changelogError, openChangelog, questions, currentIndex, currentQuestion, userAnswers, slotFeedbacks, hasSubmitted, totalScore, comboCount, maxComboCount, currentLevel, levelConfig, levelTitle, isChoiceMode, showLevelSelect, showGrammarDetail, difficulty, player, monster, inventory, monsterShake, playerBlink, hpBarDanger, goldDoubleNext, isFinished, isCurrentCorrect, timeLeft, timeUp, wrongAnswerPause, wrongAnswerPauseCountdown, mistakes, isMenuOpen, isMistakesOpen, isInventoryOpen, formatCorrect, monsterHit, screenShake, flashOverlay, bgmVolume, sfxVolume, masterVolume, isMuted, isPreloading, needsUserGestureToResumeBgm, monsterDead, playerDead, levelPassed, displaySegments, getAnswerForDisplay, selectChoice, getChoiceBtnClass, checkAnswer, nextQuestion, getInputStyle, playQuestionVoice, initGame, getFormattedAnswer, goNextLevel, retryLevel, startOver, revive, startLevel, usePotion, useSpeedPotion, evasionBuffAttacksLeft, clearMistakes, playBgm, pauseBgm, playSfx, playMistakeVoice, loadAudioSettings, saveAudioSettings, handleGameOver, stopAllAudio, runAway, startRunAwayPress, cancelRunAwayPress, isRunAwayPressing, setBattleMessage, ensureBgmPlaying, onUserGesture, currentBg, accuracyPct, calculatedGrade, getGradeColor, earnedExp, earnedGold, getHpColorClass, SKILLS, skillsAll, skillsWithUnlockLevel, unlockedSkillIds, newlyUnlocked, isSkillUnlockModalOpen, isCodexOpen, expandedSkillId, pauseBattle, resumeBattle, openCodexTo, isPlayerDodging, isSkillOpen, openSkillOverlay, closeSkillOverlay, skillList, castAbility, spState, showL2DebugPanel, l2DebugQuestions, generateL2Debug, copyL2Debug, handleReload, settings, shouldShowNextButton, praiseToast };
    }
}).mount('#app');

window.addEventListener('error', (e) => {
    console.error('全局錯誤:', e.error);
});

window.addEventListener("keydown", (e) => {
    if ((e.shiftKey || e.ctrlKey) && e.key === "2") {
        const appInstance = document.querySelector('#app').__vue_app__.config.globalProperties;
    }
    if (e.key && e.key.toLowerCase() === "t") {
        playTtsKey("narration.support_001", "がんばって～あなたは一番だ！");
    }
    if (e.key && e.key.toLowerCase() === "p") {
        const currentQuestionNode = document.querySelector('#question-area');
        const cqt = currentQuestionNode ? currentQuestionNode.textContent.trim().replace(/[_ ]/g, '').replace(/（.*?）|\(.*?\)/g, '') : "質問が見つかりません";
        speakAzure(cqt);
    }
    if (e.key && e.key.toLowerCase() === "o") {
        playTtsKey("narration.support_001", "かっこいいよ！大好き！愛してる。", "ja-JP-MayuNeural");
    }
});