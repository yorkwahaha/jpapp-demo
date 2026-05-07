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

    const resolveMentorEmotionImage = (emotion, imagePaths, failedPaths) => {
        const paths = imagePaths || {};
        const failed = failedPaths || {};
        const key = emotion || 'gentle';
        const gentlePath = paths.gentle;
        const path = paths[key] || gentlePath;
        if (!failed[path]) return path;
        if (path !== gentlePath && !failed[gentlePath]) return gentlePath;
        return null;
    };

    const isLastMentorLine = (pageCount, pageIndex) => {
        if (!Number.isFinite(pageCount) || pageCount <= 0) return true;
        return pageIndex >= pageCount - 1;
    };

    global.JPAPPMentorDialogueHelpers = {
        paginateMentorDialogue,
        resolveMentorEmotionImage,
        isLastMentorLine
    };
})(window);
