(function (global) {
    'use strict';

    const paginateMentorDialogue = (dialogues) => {
        const pages = [];
        const emotions = [];

        if (!Array.isArray(dialogues)) return { pages, emotions };

        dialogues.forEach(item => {
            const text = item.text || "";
            const emotion = item.emotion || 'gentle';
            const sentences = text.match(/[^。！？]+[。！？]?[」』"']?/g) || [text];
            let currentPage = "";
            let sentenceCount = 0;

            sentences.forEach(s => {
                if (sentenceCount >= 3 || (currentPage.length + s.length > 85)) {
                    if (currentPage) {
                        pages.push(currentPage.trim());
                        emotions.push(emotion);
                    }
                    currentPage = s;
                    sentenceCount = 1;
                } else {
                    currentPage += s;
                    sentenceCount++;
                }
            });

            if (currentPage) {
                pages.push(currentPage.trim());
                emotions.push(emotion);
            }
        });

        return { pages, emotions };
    };

    global.JPAPPMentorDialogueHelpers = { paginateMentorDialogue };
})(window);
