// ================= [ GLOBAL HOOKS ] =================
window.addEventListener('error', (e) => {

    const isExternalSesNullError = isExternalNullErrorNoise(e?.error, e?.message, e?.filename);

    if (isExternalSesNullError) {
        e.preventDefault();
        return;
    }

    console.error('全局錯誤:', e.error);

});

window.addEventListener('unhandledrejection', (e) => {

    if (isExternalNullErrorNoise(e?.reason)) {
        e.preventDefault();
    }

});

function isExternalNullErrorNoise(error, message = '', source = '') {

    const msg = String(message || '');
    const src = String(source || '');

    return error == null &&
        (
            msg === '' ||
            msg === 'null' ||
            msg.includes('SES_UNCAUGHT_EXCEPTION') ||
            src.includes('lockdown-install.js')
        );

}



window.addEventListener("keydown", (e) => {

    if (e.key && e.key.toLowerCase() === "t") {

        playTtsKey("narration.support_001", "がんばって～あなたは一番だ！");

    }

    if (e.key && e.key.toLowerCase() === "p") {

        const currentQuestionNode = document.querySelector('#question-area');

        const cqt = currentQuestionNode ? currentQuestionNode.textContent.trim().replace(/[_ ]/g, '').replace(/（.*?）|\(.*?\)/g, '') : "質問が見つかりません";

        speakCloudTts(cqt);

    }

    if (e.key && e.key.toLowerCase() === "o") {

        playTtsKey("narration.support_001", "かっこいいよ！大好き！愛してる。", "ja-JP-Neural2-B");

    }

});
