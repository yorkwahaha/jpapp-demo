// ================= [ TTS AUDIO — MODULE-LEVEL SETUP ] =================
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
