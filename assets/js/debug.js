// ================= [ JPAPP DEBUG TOOLS ] =================
window.__attachDebugTools = function (refs) {

    const {
        maxLevel, currentLevel, questions, userAnswers, selectedAnswers,
        currentQuestionIndex, questionIndex, hasSubmitted, isCorrect, showResult,
        showLevelSelect, showHome, isFinished, levelConfig, LEVEL_CONFIG,
        levelTitle, player, monster, currentQuestion,
        startLevel, retryLevel, initGame, goHome, generateQuestionBySkill,
        mentorTutorialSeen, saveMentorState, skillsAll, setupMentorDialogue,
        pauseBattle, db, VOCAB
    } = refs || {};


            function safeMaxLevel() {

                try {

                    if (typeof maxLevel !== "undefined") {

                        const v = Number(

                            typeof maxLevel?.value !== "undefined" ? maxLevel.value : maxLevel

                        );

                        if (Number.isFinite(v) && v > 0) return v;

                    }



                    if (typeof LEVEL_CONFIG !== "undefined" && LEVEL_CONFIG?.value) {

                        const keys = Object.keys(LEVEL_CONFIG.value)

                            .map(Number)

                            .filter(Number.isFinite);

                        if (keys.length) return Math.max(...keys);

                    }

                } catch (err) {

                    console.warn("[jpDebug.safeMaxLevel] failed:", err);

                }

                return 1;

            }



            function clampLevel(level) {

                const lv = Number(level);

                const max = safeMaxLevel();

                if (!Number.isFinite(lv)) return 1;

                if (lv < 1) return 1;

                if (lv > max) return max;

                return lv;

            }



            function ensureStartedToLevel(level) {

                const lv = clampLevel(level);

                try {

                    if (typeof startLevel === "function") {

                        startLevel(lv);

                    } else {

                        currentLevel.value = lv;

                        showLevelSelect.value = false;

                        showHome.value = false;

                        isFinished.value = false;

                        if (typeof initGame === "function") initGame(lv);

                    }

                    console.log(`[jpDebug] jumped to level ${lv}`);

                    return lv;

                } catch (err) {

                    console.error("[jpDebug.goLevel] failed:", err);

                    throw err;

                }

            }



            function makeOneSkillQuestion(skillId) {

                if (!skillId) {

                    console.warn("[jpDebug.skill] missing skillId");

                    return null;

                }



                // --- Alias Handle for L16-20 ---

                let targetId = skillId;

                if (skillId === 'KARA_START') targetId = 'KARA_SOURCE_START';

                if (skillId === 'MADE_END') targetId = 'MADE_LIMIT_END';

                if (skillId === 'TO_WITH_PERSON' || skillId === 'TO_WITH') targetId = 'TO_COMPANION';

                if (skillId === 'DE_MEANS_METHOD' || skillId === 'DE_TOOLS') targetId = 'DE_TOOL_MEANS';

                if (skillId === 'BOSS_4') targetId = 'BOSS_REVIEW_04';

                if (skillId === 'NI_EXISTENCE') targetId = 'NI_EXIST_PLACE';

                if (skillId === 'NI_INFO_RECEIVER') targetId = 'NI_TARGET';

                if (skillId === 'BOSS_5') targetId = 'BOSS_REVIEW_05';

                if (skillId === 'BOSS_6') targetId = 'BOSS_REVIEW_06';

                if (skillId === 'BOSS_7') targetId = 'FINAL_BOSS_35';

                if (skillId === 'BOSS_HIDDEN') targetId = 'HIDDEN_BOSS_36';



                if (typeof generateQuestionBySkill !== "function") {

                    console.warn("[jpDebug.skill] generateQuestionBySkill not found");

                    return null;

                }



                try {

                    const debugBlanks =

                        (typeof levelConfig !== "undefined" && levelConfig?.value?.blanks != null)

                            ? levelConfig.value.blanks

                            : ((typeof LEVEL_CONFIG !== "undefined" && LEVEL_CONFIG?.value?.[currentLevel?.value]?.blanks != null)

                                ? LEVEL_CONFIG.value[currentLevel.value].blanks

                                : 1);



                    const q = generateQuestionBySkill(targetId, debugBlanks, db?.value || db, VOCAB?.value || VOCAB);

                    if (!q) {

                        console.warn("[jpDebug.skill] no question generated for:", targetId);

                        return null;

                    }



                    // 盡量只重置與當前題目相關的狀態，不強制重開整關

                    if (typeof questions !== "undefined") questions.value = [q];

                    if (typeof currentQuestionIndex !== "undefined") currentQuestionIndex.value = 0;

                    if (typeof questionIndex !== "undefined") questionIndex.value = 0;

                    if (typeof userAnswers !== "undefined") userAnswers.value = [];

                    if (typeof selectedAnswers !== "undefined") selectedAnswers.value = [];

                    if (typeof hasSubmitted !== "undefined") hasSubmitted.value = false;

                    if (typeof isCorrect !== "undefined") isCorrect.value = null;

                    if (typeof showResult !== "undefined") showResult.value = false;

                    if (typeof showLevelSelect !== "undefined") showLevelSelect.value = false;

                    if (typeof showHome !== "undefined") showHome.value = false;

                    if (typeof isFinished !== "undefined") isFinished.value = false;



                    console.log(`[jpDebug] generated skill question: ${targetId}`, q);

                    return q;

                } catch (err) {

                    console.error("[jpDebug.skill] failed:", err);

                    throw err;

                }

            }



            function getState() {

                return {

                    currentLevel:

                        typeof currentLevel !== "undefined" ? currentLevel.value : undefined,

                    maxLevel: safeMaxLevel(),

                    showHome:

                        typeof showHome !== "undefined" ? showHome.value : undefined,

                    showLevelSelect:

                        typeof showLevelSelect !== "undefined"

                            ? showLevelSelect.value

                            : undefined,

                    isFinished:

                        typeof isFinished !== "undefined" ? isFinished.value : undefined,

                    levelTitle:

                        typeof levelTitle !== "undefined" ? levelTitle.value : undefined,

                    playerHp:

                        typeof player !== "undefined" ? player?.value?.hp : undefined,

                    monsterHp:

                        typeof monster !== "undefined" ? monster?.value?.hp : undefined,

                    currentQuestion:

                        typeof currentQuestion !== "undefined"

                            ? currentQuestion.value

                            : undefined,

                    questionCount:

                        typeof questions !== "undefined" && Array.isArray(questions?.value)

                            ? questions.value.length

                            : undefined

                };

            }



            function listLevels() {

                try {

                    if (typeof LEVEL_CONFIG === "undefined" || !LEVEL_CONFIG?.value) {

                        console.warn("[jpDebug.levels] LEVEL_CONFIG not ready");

                        return [];

                    }

                    const rows = Object.entries(LEVEL_CONFIG.value)

                        .map(([k, v]) => ({

                            level: Number(k),

                            title: v?.title || "",

                            skillId: v?.skillId || "",

                            skillIds: v?.skillIds || [],

                            questionCount: v?.questionCount ?? v?.questions ?? undefined

                        }))

                        .sort((a, b) => a.level - b.level);



                    console.table(rows);

                    return rows;

                } catch (err) {

                    console.error("[jpDebug.levels] failed:", err);

                    return [];

                }

            }



            const debugApi = {

                goLevel(level) {

                    return ensureStartedToLevel(level);

                },



                retry() {

                    try {

                        if (typeof retryLevel === "function") {

                            retryLevel();

                            console.log("[jpDebug] retry current level");

                        } else if (typeof initGame === "function") {

                            initGame(currentLevel.value);

                            console.log("[jpDebug] retry current level via initGame");

                        } else {

                            console.warn("[jpDebug.retry] retryLevel/initGame not found");

                        }

                    } catch (err) {

                        console.error("[jpDebug.retry] failed:", err);

                        throw err;

                    }

                },



                next() {

                    try {

                        const nextLevel = clampLevel(

                            (typeof currentLevel !== "undefined" ? currentLevel.value : 1) + 1

                        );

                        return ensureStartedToLevel(nextLevel);

                    } catch (err) {

                        console.error("[jpDebug.next] failed:", err);

                        throw err;

                    }

                },



                prev() {

                    try {

                        const prevLevel = clampLevel(

                            (typeof currentLevel !== "undefined" ? currentLevel.value : 1) - 1

                        );

                        return ensureStartedToLevel(prevLevel);

                    } catch (err) {

                        console.error("[jpDebug.prev] failed:", err);

                        throw err;

                    }

                },



                resetMentorTutorials() {

                    mentorTutorialSeen.value = [];

                    saveMentorState();

                    console.log("[jpDebug] Mentor tutorials reset.");

                },



                replayMentor(skillId) {

                    const skill = skillsAll.value[skillId];

                    if (!skill) {

                        console.warn(`[jpDebug] Skill ID "${skillId}" not found.`);

                        return;

                    }

                    if (!skill.mentorDialogue) {

                        console.warn(`[jpDebug] Skill "${skillId}" has no mentor dialogue.`);

                        return;

                    }

                    setupMentorDialogue(skill);

                    pauseBattle();

                    console.log(`[jpDebug] Replaying mentor dialogue for: ${skillId}`);

                },



                skill(skillId) {

                    return makeOneSkillQuestion(skillId);

                },



                skillMany(skillId, n = 20) {

                    const results = [];

                    const stats = { uniqueCount: 0, duplicateCount: 0, freq: {} };

                    let lastSig = null;



                    for (let i = 0; i < n; i++) {

                        let q = null;

                        let retry = 0;

                        while (retry < 10) {

                            q = this.skill(skillId);

                            if (!q) break;

                            const left = q.leftText || (q.segments?.[0]?.j) || '';

                            const right = q.rightText || (q.segments?.[2]?.j) || '';

                            const ansStr = q.answers?.[0]?.[0] || q.answer || '';

                            const sig = `${q.chinese}|${left}|${ansStr}|${right}`;

                            if (sig !== lastSig) {

                                lastSig = sig;

                                break;

                            }

                            retry++;

                        }

                        if (q) {

                            const ansStr = q.answers?.[0]?.join('/') || q.answer || '';

                            const left = q.leftText || (q.segments?.[0]?.j) || '';

                            const right = q.rightText || (q.segments?.[2]?.j) || '';

                            results.push({

                                i: i + 1,

                                skill: q.skillId,

                                chinese: q.chinese,

                                left: left,

                                answer: ansStr,

                                right: right,

                                choices: q.choices?.join(', ')

                            });

                            stats.freq[q.chinese] = (stats.freq[q.chinese] || 0) + 1;

                        }

                    }



                    if (results.length > 0) {

                        console.table(results);

                        const uniqueKeys = Object.keys(stats.freq);

                        stats.uniqueCount = uniqueKeys.length;

                        stats.duplicateCount = n - stats.uniqueCount;

                        console.log(`[jpDebug.skillMany] Results for ${skillId}:`, {

                            total: results.length,

                            unique: stats.uniqueCount,

                            duplicates: stats.duplicateCount,

                            frequency: stats.freq

                        });

                    }

                    return results;

                },



                skillLines(skillId, n = 20) {

                    let lastSig = null;

                    const lines = [];

                    for (let i = 0; i < n; i++) {

                        let q = null;

                        let retry = 0;

                        while (retry < 10) {

                            q = this.skill(skillId);

                            if (!q) break;

                            const left = q.leftText || (q.segments?.[0]?.j) || '';

                            const right = q.rightText || (q.segments?.[2]?.j) || '';

                            const ansStr = q.answers?.[0]?.[0] || q.answer || '';

                            const sig = `${q.chinese}|${left}|${ansStr}|${right}`;

                            if (sig !== lastSig) {

                                lastSig = sig;

                                break;

                            }

                            retry++;

                        }

                        if (q) {

                            const ansStr = q.answers?.[0]?.join('/') || q.answer || '';

                            const num = String(i + 1).padStart(2, '0');

                            const left = q.leftText || (q.segments?.[0]?.j) || '';

                            const right = q.rightText || (q.segments?.[2]?.j) || '';

                            lines.push(`${num}. ${left}【${ansStr}】${right} ｜ ${q.chinese}`);

                        }

                    }

                    if (lines.length > 0) {

                        console.log(`[jpDebug.skillLines] ${skillId} (${n} questions):\n` + lines.join('\n'));

                    }

                    return lines;

                },



                state() {

                    const s = getState();

                    console.log("[jpDebug.state]", s);

                    return s;

                },



                home() {

                    try {

                        if (typeof goHome === "function") {

                            goHome();

                        } else {

                            if (typeof showLevelSelect !== "undefined") showLevelSelect.value = true;

                            if (typeof showLevelSelect !== "undefined") {

                                // Already setting showLevelSelect to true above

                            }

                            if (typeof isFinished !== "undefined") isFinished.value = false;

                        }

                        console.log("[jpDebug] go home");

                    } catch (err) {

                        console.error("[jpDebug.home] failed:", err);

                        throw err;

                    }

                },



                levels() {

                    return listLevels();

                },



                help() {

                    const msg = `

jpDebug commands:

- goLevel(4)

- jpDebug.goLevel(4)

- jpDebug.retry()

- jpDebug.next()

- jpDebug.prev()

- jpDebug.skill('MO_ALSO_BASIC')

- jpDebug.skillLines('KARA_SOURCE_START', 20)

- jpDebug.skillLines('MADE_LIMIT_END', 20)

- jpDebug.skillLines('TO_COMPANION', 20)

- jpDebug.skillLines('DE_TOOL_MEANS', 20)

- jpDebug.skillLines('BOSS_REVIEW_04', 20)

- jpDebug.skillLines('NI_TIME', 20)

- jpDebug.skillLines('NI_TARGET', 20)

- jpDebug.skillLines('NI_EXIST_PLACE', 20)

- jpDebug.skillLines('HE_DIRECTION', 20)

- jpDebug.skillLines('BOSS_REVIEW_05', 20)

- jpDebug.skillLines('YA_AND_OTHERS', 20)

- jpDebug.skillLines('DE_SCOPE', 20)

- jpDebug.skillLines('NI_PURPOSE', 20)

- jpDebug.skillLines('TO_QUOTE', 20)

- jpDebug.skillLines('BOSS_REVIEW_06', 20)

- jpDebug.skillLines('KARA_REASON', 20)

- jpDebug.skillLines('YORI_COMPARE', 20)

- jpDebug.skillLines('NI_FREQUENCY', 20)

- jpDebug.skillLines('DE_MATERIAL', 20)

- jpDebug.skillLines('FINAL_BOSS_35', 20)

- jpDebug.skillLines('HIDDEN_BOSS_36', 20)

- jpDebug.state()

- jpDebug.home()

- jpDebug.levels()

- jpDebug.resetMentorTutorials()

- jpDebug.replayMentor('WA_TOPIC_BASIC')

      `.trim();

                    console.log(msg);

                    return msg;

                }

            };



            // 正式命名空間

            window.jpDebug = debugApi;



            // 短版捷徑

            window.goLevel = (lv) => debugApi.goLevel(lv);

            window.retryLevelDebug = () => debugApi.retry();

            window.nextLevelDebug = () => debugApi.next();

            window.prevLevelDebug = () => debugApi.prev();

            window.testSkill = (skillId) => debugApi.skill(skillId);

            window.testSkillMany = (skillId, n) => debugApi.skillMany(skillId, n);

            window.testSkillLines = (skillId, n) => debugApi.skillLines(skillId, n);



            console.log("[jpDebug] ready. Try: goLevel(4), jpDebug.help()");


};