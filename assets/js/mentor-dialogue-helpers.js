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

    const SAFE_EMOTION_KEY_RE = /^[a-z0-9_-]+$/;
    const resolveMentorEmotionImage = (emotion, imagePaths, failedPaths) => {
        const paths = imagePaths || {};
        const failed = failedPaths || {};
        const key = emotion || 'gentle';
        const gentlePath = paths.gentle;
        // 1. Fixed mapping takes priority
        if (paths[key] !== undefined) {
            const path = paths[key];
            if (!failed[path]) return path;
            if (path !== gentlePath && !failed[gentlePath]) return gentlePath;
            return null;
        }
        // 2. Safe dynamic fallback: try selene_${key}.webp if key is safe
        if (SAFE_EMOTION_KEY_RE.test(key)) {
            const dynamicPath = `assets/images/mentor/selene_${key}.webp`;
            if (!failed[dynamicPath]) return dynamicPath;
        }
        // 3. Fall back to gentle
        if (!failed[gentlePath]) return gentlePath;
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
