const fs = require('fs');
const path = 'assets/js/game.js';
let content = fs.readFileSync(path, 'utf8');

const searchStr = `            if (!simpleAudioV2Enabled.value && audioCtx.value && audioCtx.value.state === 'suspended') {
                window.history.replaceState({}, document.title, window.location.pathname);
                debugJumpToLevel(forceLv);
            }
            playPrologueOpening, playMainEndingFinale,
            mapChapters, activeChapter, selectedSegmentIdx, getMapNodeStyle,
            MENTOR_AUDIO_MAP,
            grantRewards, playerDead, monsterIsDying, monsterTrulyDead, monsterResultShown,
            skillMastery, saveProgression, SPIRITS
        });`;

const replacement = `                audioCtx.value.resume().catch(() => { });

            }

            if (window._bgmDuckTimer) clearTimeout(window._bgmDuckTimer);

            if (typingTimerMentor) clearTimeout(typingTimerMentor);

            stopMentorAudio();

            const vfxLayer = document.getElementById('global-vfx-layer');

            if (vfxLayer) vfxLayer.innerHTML = '';

            flickState.isArmed = false;

            flickState.activeOpt = null;

            flickState.pendingDirectionalMiss = false;

            if (flickState.capturedEl) {

                try { flickState.capturedEl.releasePointerCapture(1); } catch (e) { }

                flickState.capturedEl = null;

            }

            isMenuOpen.value = false;

            isMentorModalOpen.value = false;

            isLevelJumpOpen.value = false;

            praiseToast.value.show = false;
            comboPopup.value.show = false;

            window._disableMentorAutoTrigger = true;

            startLevel(lv).then(() => {

                window._disableMentorAutoTrigger = false;

            });

        };

        window.debugJumpToLevel = debugJumpToLevel;

        setTimeout(() => {

            const params = new URLSearchParams(window.location.search);

            const forceLv = parseInt(params.get('level'), 10);

            if (forceLv && forceLv >= 1 && (maxLevel.value ? forceLv <= maxLevel.value : true)) {
                window.history.replaceState({}, document.title, window.location.pathname);
                debugJumpToLevel(forceLv);
            }

        }, 100);

        loadAudioSettings();

        // ---- [ DEBUG TOOLS : jpDebug ] ----
        window.__attachDebugTools?.({
            maxLevel, currentLevel, questions, userAnswers,
            hasSubmitted,
            showLevelSelect, showMap, isFinished, levelConfig, LEVEL_CONFIG,
            levelTitle, player, monster, currentQuestion,
            startLevel, retryLevel, initGame, generateQuestionBySkill,
            mentorTutorialSeen, saveMentorState, skillsAll, setupMentorDialogue,
            pauseBattle, startBossQueue, unlockedSkillIds,
            playPrologueOpening, playMainEndingFinale,
            mapChapters, activeChapter, selectedSegmentIdx, getMapNodeStyle,
            MENTOR_AUDIO_MAP,
            grantRewards, playerDead, monsterIsDying, monsterTrulyDead, monsterResultShown,
            skillMastery, saveProgression, SPIRITS
        });`;

// Use a more robust matching if exact fails
if (!content.includes(searchStr)) {
    console.log("Exact match failed, trying normalized match...");
    // Try to find the block by a unique subset
    const pivot = "playPrologueOpening, playMainEndingFinale,";
    if (content.includes(pivot)) {
        // Find the block around it
        const startIdx = content.indexOf("if (!simpleAudioV2Enabled.value && audioCtx.value && audioCtx.value.state === 'suspended') {");
        const endIdx = content.indexOf("SPIRITS", startIdx) + 15; // enough to cover "SPIRITS\n        });"
        if (startIdx !== -1 && endIdx > startIdx) {
            const actualBlock = content.substring(startIdx, endIdx);
            console.log("Found block to replace");
            content = content.replace(actualBlock, replacement);
        } else {
             console.error("Could not find block boundaries");
             process.exit(1);
        }
    } else {
        console.error("Could not find pivot string");
        process.exit(1);
    }
} else {
    content = content.replace(searchStr, replacement);
}

// Also add toggleSimpleAudioV2 to return object if missing
if (!content.includes("toggleSimpleAudioV2,")) {
    content = content.replace("isSpecialSceneActive, specialSceneBg,", "isSpecialSceneActive, specialSceneBg,\n            toggleSimpleAudioV2,");
}

fs.writeFileSync(path, content);
console.log("Successfully fixed game.js");
