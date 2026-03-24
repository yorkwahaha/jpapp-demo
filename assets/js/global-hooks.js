// ================= [ GLOBAL HOOKS ] =================
window.addEventListener('error', (e) => {

    console.error('全局錯誤:', e.error);

});



window.addEventListener("keydown", (e) => {

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
