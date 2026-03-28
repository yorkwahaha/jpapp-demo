// ================= [ JPAPP DEBUG TOOLS ] =================
window.__attachDebugTools = function (refs) {

    const {
        maxLevel, currentLevel, questions, userAnswers, selectedAnswers,
        currentQuestionIndex, questionIndex, hasSubmitted, isCorrect, showResult,
        showLevelSelect, showHome, isFinished, levelConfig, LEVEL_CONFIG,
        levelTitle, player, monster, currentQuestion,
        startLevel, retryLevel, initGame, goHome, generateQuestionBySkill,
        mentorTutorialSeen, saveMentorState, skillsAll, setupMentorDialogue,
        pauseBattle, db, VOCAB, unlockedSkillIds
    } = refs || {};

    // --- Audit State ---
    let auditData = {
        isRunning: false,
        counts: {},
        samples: [],
        startTime: null
    };
    let _originalGenerate = null;


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

                // --- Audit Tools ---

                auditStart() {
                    if (auditData.isRunning) {
                        console.warn("[jpDebug.audit] Audit is already running.");
                        return;
                    }
                    auditData.isRunning = true;
                    auditData.startTime = new Date();
                    console.log("[jpDebug.audit] Audit started. Recording questions...");
                },

                auditRecord(skillId, questionObj) {
                    if (!auditData.isRunning) return;
                    auditData.counts[skillId] = (auditData.counts[skillId] || 0) + 1;
                    auditData.samples.push({
                        time: new Date().toLocaleTimeString(),
                        skillId,
                        chinese: questionObj?.chinese || '?'
                    });
                    if (auditData.samples.length > 100) auditData.samples.shift();
                },

                auditReport() {
                    const total = Object.values(auditData.counts).reduce((a, b) => a + b, 0);
                    if (total === 0) {
                        console.log("[jpDebug.audit] No data recorded yet.");
                        return;
                    }

                    const levelId = currentLevel.value;
                    const config = LEVEL_CONFIG.value[levelId] || {};
                    const newSkills = config.unlockSkills || [];
                    
                    const getHistArr = (lv) => {
                        const h = new Set();
                        for(let i=1; i<lv; i++) {
                            const c = LEVEL_CONFIG.value[i];
                            if(c?.unlockSkills) c.unlockSkills.forEach(s => {
                                if(s && !s.startsWith('BOSS_REVIEW') && !s.startsWith('FINAL') && !s.startsWith('HIDDEN')) h.add(s);
                            });
                        }
                        return Array.from(h);
                    };
                    const histSet = new Set(getHistArr(levelId));

                    const rows = Object.entries(auditData.counts).map(([id, count]) => {
                        let type = "Unexpected";
                        if (newSkills.includes(id)) type = "New";
                        else if (histSet.has(id)) type = "Historical";
                        else if (id.startsWith('BOSS_REVIEW')) type = "BossPool";

                        return {
                            Skill: id,
                            Type: type,
                            Count: count,
                            Percent: ((count / total) * 100).toFixed(1) + "%"
                        };
                    }).sort((a, b) => b.Count - a.Count);

                    console.log(`[jpDebug.audit] Report for Level ${levelId} (Total: ${total})`);
                    console.table(rows);
                    console.log("[jpDebug.audit] Recent Samples:", auditData.samples.slice(-5));
                    return rows;
                },

                auditStop() {
                    if (!auditData.isRunning) return;
                    this.auditReport();
                    auditData.isRunning = false;
                    console.log("[jpDebug.audit] Audit stopped.");
                },

                auditReset() {
                    auditData.counts = {};
                    auditData.samples = [];
                    console.log("[jpDebug.audit] Audit data reset.");
                },

                async auditLevelSkills(levelId, sampleCount = 100) {
                    console.log(`[jpDebug.audit] Sampling Level ${levelId} for ${sampleCount} questions...`);
                    const config = LEVEL_CONFIG.value[levelId];
                    if (!config) {
                        console.error("[jpDebug.audit] Invalid Level ID");
                        return;
                    }

                    const counts = {};
                    const isBoss = levelId % 5 === 0 || config.isBoss;

                    const getHistArr = (lv) => {
                        const h = new Set();
                        for(let i=1; i<lv; i++) {
                            const c = LEVEL_CONFIG.value[i];
                            if(c?.unlockSkills) c.unlockSkills.forEach(s => {
                                if(s && !s.startsWith('BOSS_REVIEW') && !s.startsWith('FINAL') && !s.startsWith('HIDDEN')) h.add(s);
                            });
                        }
                        return Array.from(h);
                    };

                    const newSkills = (config.unlockSkills || []).filter(id => {
                        const s = skillsAll.value[id];
                        return s && s.particle !== '複習';
                    });
                    const oldSkills = getHistArr(levelId);
                    const weight = config.skillMix?.newSkillWeight ?? 0.5;

                    if (isBoss) {
                        if (levelId === 5) {
                            const pool = ['WA_TOPIC_BASIC', 'NO_POSSESSIVE', 'GA_INTRANSITIVE', 'WO_OBJECT_BASIC'];
                            for(let i=0; i<sampleCount; i++) {
                                const sid = pool[Math.floor(Math.random()*pool.length)];
                                counts[sid] = (counts[sid] || 0) + 1;
                            }
                        } else {
                            const curMap = [];
                            for(let i=levelId-4; i<levelId; i++) if(LEVEL_CONFIG.value[i]?.unlockSkills) curMap.push(...LEVEL_CONFIG.value[i].unlockSkills);
                            const hist = getHistArr(levelId - 4);
                            for(let i=0; i<sampleCount; i++) {
                                let sid;
                                if (Math.random() < 0.8 && curMap.length > 0) sid = curMap[Math.floor(Math.random()*curMap.length)];
                                else if (hist.length > 0) sid = hist[Math.floor(Math.random()*hist.length)];
                                else sid = 'WA_TOPIC_BASIC';
                                counts[sid] = (counts[sid] || 0) + 1;
                            }
                        }
                    } else {
                        for (let i = 0; i < sampleCount; i++) {
                            let sid;
                            if (newSkills.length > 0 && oldSkills.length > 0) sid = (Math.random() < weight) ? newSkills[Math.floor(Math.random()*newSkills.length)] : oldSkills[Math.floor(Math.random()*oldSkills.length)];
                            else if (newSkills.length > 0) sid = newSkills[Math.floor(Math.random()*newSkills.length)];
                            else sid = oldSkills[Math.floor(Math.random()*oldSkills.length)] || 'WA_TOPIC_BASIC';
                            counts[sid] = (counts[sid] || 0) + 1;
                        }
                    }

                    const histSet = new Set(getHistArr(levelId));
                    const rows = Object.entries(counts).map(([id, count]) => {
                        let type = "Unexpected/Future";
                        if (newSkills.includes(id)) type = "New (Target)";
                        else if (histSet.has(id)) type = "Historical (Old)";
                        else if (id.startsWith('BOSS_REVIEW')) type = "BossPool";
                        return { Skill: id, Type: type, Count: count, Percent: ((count / sampleCount) * 100).toFixed(1) + "%" };
                    }).sort((a, b) => b.Count - a.Count);
                    console.log(`[jpDebug.audit] Sample Analysis for Level ${levelId} (N=${sampleCount})`);
                    console.table(rows);
                    return rows;
                },



                skill(skillId) {
                    const q = makeOneSkillQuestion(skillId);
                    if (q && auditData.isRunning) this.auditRecord(skillId, q);
                    return q;
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
- jpDebug.retry() / next() / prev()
- jpDebug.skill('MO_ALSO_BASIC')
- jpDebug.skillLines('NI_TIME', 20)
- jpDebug.state() / home() / levels()

Audit Tools (Question Distribution):
- jpDebug.auditLevelSkills(6, 100) : Simulate Level 6, sample 100 times.
- jpDebug.auditStart() : Start recording current play sessions.
- jpDebug.auditReport() : Show stats for current play session.
- jpDebug.auditStop() : Stop recording and show report.
- jpDebug.auditReset() : Clear data.

Mentor/Tutorial:
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