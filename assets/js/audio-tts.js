// ================= [ TTS AUDIO — MODULE-LEVEL SETUP ] =================
const TTS_AUDIO_BASE = "assets/audio/tts/";

const ttsExistCache = new Map();

let currentTtsAudio = null;

const sharedTtsAudio = new Audio();

const primeAudio = new Audio();

let isTtsPrimed = false;

let currentTtsSessionId = 0;



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

                    if (window.__DEBUG__) console.log('[PRAISE] flick-gesture prime ok');

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
    currentTtsSessionId++;
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

window.resetTtsSessionForBattle = () => {
    stopTtsAudio();
    stopWebSpeech();
    try {
        sharedTtsAudio.onended = null;
        sharedTtsAudio.onerror = null;
        sharedTtsAudio.removeAttribute('src');
        sharedTtsAudio.load();
    } catch { }
    currentTtsAudio = null;
};



const GOOGLE_TTS_WHITELIST = [
    'ja-JP-Standard-A', 'ja-JP-Wavenet-A', 'ja-JP-Neural2-B', 'ja-JP-Wavenet-D',
    'zh-TW-Neural2-B', 'zh-TW-Wavenet-B', 'zh-CN-Neural2-A', 'zh-CN-Wavenet-A'
];

function migrateVoice(voice) {
    if (!voice) return "ja-JP-Neural2-B";
    if (GOOGLE_TTS_WHITELIST.includes(voice)) return voice;
    
    // Allow existing zh-TW/zh-CN voices to pass through
    if (voice.startsWith('zh-TW') || voice.startsWith('zh-CN')) return voice;

    // 處理舊 Azure 聲線遷移
    if (voice.includes('MayuNeural') || voice.includes('NanamiNeural') || voice.includes('NaokiNeural')) {
        if (window.__DEBUG__) console.log(`[TTS] Migrating legacy Azure voice: ${voice} -> ja-JP-Neural2-B`);
        return "ja-JP-Neural2-B";
    }
    return "ja-JP-Neural2-B";
}

function getPreferredTtsVoice() {
    try {
        const raw = localStorage.getItem('jpRpgSettingsV1');
        if (raw) {
            const parsed = JSON.parse(raw);
            const originalVoice = parsed.ttsVoice;
            const migratedVoice = migrateVoice(originalVoice);
            
            // 如果發生遷移且跟原值不同，寫回 localStorage 一勞永逸
            if (originalVoice !== migratedVoice) {
                parsed.ttsVoice = migratedVoice;
                localStorage.setItem('jpRpgSettingsV1', JSON.stringify(parsed));
                if (window.__DEBUG__) console.log(`[TTS] Settings migrated & saved: ${migratedVoice}`);
            }
            return migratedVoice;
        }
    } catch (e) { }
    return "ja-JP-Neural2-B";
}



async function playTtsKey(key, fallbackText, ttsVoiceName = null) {
    if (!ttsVoiceName) ttsVoiceName = getPreferredTtsVoice();

    stopWebSpeech();

    stopTtsAudio();

    const playbackSessionId = currentTtsSessionId;

    const url = TTS_AUDIO_BASE + ttsKeyToFile(key);



    if (await audioFileExists(url)) {

        if (playbackSessionId !== currentTtsSessionId) return { used: "none", key };

        if (window.__DEBUG__) console.log(`[FALLBACK] audio file exists: ${url}`);

        const a = sharedTtsAudio;

        a.src = url;

        a.preload = "auto";

        currentTtsAudio = a;

        if (playbackSessionId !== currentTtsSessionId) return { used: "none", key };

        try {

            await a.play();

            if (window.__DEBUG__) console.log(`[FALLBACK] audio play ok`);

            return { used: "audio", key, url };

        } catch (e) {

            console.warn(`[FALLBACK] audio play error:`, e?.message || e);
            if (currentTtsAudio === a) currentTtsAudio = null;

        }

    }



    if (fallbackText) {
        if (playbackSessionId !== currentTtsSessionId) return { used: "none", key };
        const cloudTtsSuccess = await speakCloudTts(fallbackText, ttsVoiceName);
        if (cloudTtsSuccess) {
            return { used: "cloud", key };
        }
    }



    if (fallbackText && "speechSynthesis" in window) {

        if (window.__DEBUG__) console.log('[SPEECH] start (WebSpeech fallback)', fallbackText.slice(0, 20));

        try {

            const u = new SpeechSynthesisUtterance(fallbackText);

            u.lang = "ja-JP";

            u.rate = 1.0;

            u.pitch = 1.0;



            u.onend = () => { if (window.__DEBUG__) console.log('[SPEECH] end'); };

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

window.playTtsKey = playTtsKey;



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



// ================= [ AZURE TTS — PROXY & SPEAK ] =================
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



// ================= [ CLOUD TTS — GOOGLE/AZURE PROXY ] =================
async function speakCloudTts(text, voiceShortName = null) {

    // 讀取自訂語速與語調 (預設為 1.0)

    let customRate = "1.0";

    let customPitch = "default";

    try {

        const raw = localStorage.getItem('jpRpgSettingsV1');

        if (raw) {

            const parsed = JSON.parse(raw);

            if (parsed.ttsVoice && !voiceShortName) {
                const migrated = migrateVoice(parsed.ttsVoice);
                if (migrated !== parsed.ttsVoice) {
                    parsed.ttsVoice = migrated;
                    localStorage.setItem('jpRpgSettingsV1', JSON.stringify(parsed));
                    if (window.__DEBUG__) console.log(`[TTS] Session settings migrated & saved: ${migrated}`);
                }
                voiceShortName = migrated;
            }
            if (parsed.ttsRate) customRate = String(parsed.ttsRate);
            if (parsed.ttsPitch) customPitch = String(parsed.ttsPitch);
        }
    } catch (e) { }

    if (!voiceShortName) voiceShortName = getPreferredTtsVoice();
    voiceShortName = migrateVoice(voiceShortName);



    // Strip HTML tags for TTS (minimal safe)
    const cleanText = text.replace(/<[^>]*>/g, '').trim();

    if (!cleanText) return false;
    stopWebSpeech();
    stopTtsAudio();

    const playbackSessionId = currentTtsSessionId;



    let res;
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
                    text: cleanText,
                    voice: voiceShortName,
                    rate: customRate,
                    pitch: customPitch
                })
            });
            if (res.status === 401) { sessionTokenData = null; retryCount++; continue; }
            success = true;
        } catch (e) { return false; }
    }



    if (!res || !res.ok) {
        const errorMsg = res ? await res.text() : "No response from worker";
        console.error('[CLOUD TTS] server error:', res ? res.status : "unknown", errorMsg);
        return false;
    }

    if (playbackSessionId !== currentTtsSessionId) return false;

    const blob = await res.blob();

    const url = URL.createObjectURL(blob);

    if (playbackSessionId !== currentTtsSessionId) {
        try { URL.revokeObjectURL(url); } catch { }
        return false;
    }

    const a = sharedTtsAudio;

    a.src = url;

    currentTtsAudio = a;

    try {

        await a.play();

        a.onended = () => { try { URL.revokeObjectURL(url); } catch { } };

        return true;

    } catch (e) {

        try { URL.revokeObjectURL(url); } catch { }
        if (currentTtsAudio === a) currentTtsAudio = null;

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
