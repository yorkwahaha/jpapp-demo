// ================= [ JPAPP DEBUG TOOLS ] =================
window.__attachDebugTools = function (refs) {

    const {
        maxLevel, currentLevel, questions, userAnswers, selectedAnswers,
        currentQuestionIndex, questionIndex, hasSubmitted, isCorrect, showResult,
        showLevelSelect, showHome, isFinished, levelConfig, LEVEL_CONFIG,
        levelTitle, player, monster, currentQuestion,
        startLevel, retryLevel, initGame, goHome, generateQuestionBySkill,
        mentorTutorialSeen, saveMentorState, skillsAll, setupMentorDialogue,
        pauseBattle, unlockedSkillIds, startBossQueue,
        playPrologueOpening, playMainEndingFinale,
        mapChapters, activeChapter, selectedSegmentIdx, getMapNodeStyle,
        MENTOR_AUDIO_MAP
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

            function clearMapNodeLabels() {

                document.querySelectorAll('.jp-debug-map-node-label').forEach(el => el.remove());

            }



            function mapNodeRows(options = {}) {

                const chapters = mapChapters?.value || mapChapters || {};

                const chapterKey = activeChapter?.value || activeChapter || 'chapter1';

                const segmentIdx = Number(selectedSegmentIdx?.value ?? selectedSegmentIdx ?? 0);

                const segment = chapters?.[chapterKey]?.segments?.[segmentIdx];

                if (!segment || !segment.nodes) {

                    console.warn('[jpDebug.mapNodes] no active map segment found', { chapterKey, segmentIdx });

                    return [];

                }



                const viewport = {

                    width: window.innerWidth,

                    height: window.innerHeight,

                    isMobile: window.innerWidth < 1024

                };

                const container = document.querySelector('.map-nodes-container');

                const image = document.querySelector('.map-base-img');

                const containerRect = container?.getBoundingClientRect();

                const imageRect = image?.getBoundingClientRect();

                const rows = Object.entries(segment.nodes).map(([level, node]) => {

                    const style = typeof getMapNodeStyle === 'function' ? getMapNodeStyle(node) : {};

                    const usedX = node.desktopX !== undefined ? node.desktopX : node.x;

                    const usedY = node.desktopY !== undefined ? node.desktopY : node.y;

                    const marker = document.querySelector(`[data-stage-node="${level}"]`);

                    const markerRect = marker?.getBoundingClientRect();

                    const markerCenterX = markerRect ? markerRect.left + (markerRect.width / 2) : null;

                    const markerCenterY = markerRect ? markerRect.top + (markerRect.height / 2) : null;

                    return {

                        level,

                        title: node.landmark || LEVEL_CONFIG?.[level]?.title || '',

                        desktopX: node.desktopX,

                        desktopY: node.desktopY,

                        mobileX: node.mobileX,

                        mobileY: node.mobileY,

                        actuallyUsedX: usedX,

                        actuallyUsedY: usedY,

                        cssLeft: style.left,

                        cssBottom: style.bottom,

                        viewportWidth: viewport.width,

                        viewportHeight: viewport.height,

                        isMobile: viewport.isMobile,

                        markerCenterX: markerCenterX == null ? null : Math.round(markerCenterX),

                        markerCenterY: markerCenterY == null ? null : Math.round(markerCenterY),

                        markerCenterPctX: markerCenterX == null || !containerRect?.width ? null : Number((((markerCenterX - containerRect.left) / containerRect.width) * 100).toFixed(2)),

                        markerCenterPctYFromTop: markerCenterY == null || !containerRect?.height ? null : Number((((markerCenterY - containerRect.top) / containerRect.height) * 100).toFixed(2))

                    };

                });



                if (options.labels) {

                    clearMapNodeLabels();

                    rows.forEach(row => {

                        const marker = document.querySelector(`[data-stage-node="${row.level}"]`);

                        const wrap = marker?.closest('.stage-node-wrap');

                        if (!wrap) return;

                        const label = document.createElement('div');

                        label.className = 'jp-debug-map-node-label';

                        label.textContent = `L${row.level} ${row.actuallyUsedX},${row.actuallyUsedY}`;

                        label.style.cssText = [

                            'position:absolute',

                            'left:50%',

                            'top:0',

                            'transform:translate(-50%,-100%)',

                            'z-index:9999',

                            'padding:2px 5px',

                            'border:1px solid rgba(251,191,36,.95)',

                            'border-radius:4px',

                            'background:rgba(15,23,42,.92)',

                            'color:#fde68a',

                            'font:700 11px/1.2 monospace',

                            'white-space:nowrap',

                            'pointer-events:none'

                        ].join(';');

                        wrap.appendChild(label);

                    });

                }



                console.log('[jpDebug.mapNodes]', {

                    chapterKey,

                    segmentIdx,

                    segmentId: segment.id,

                    title: segment.title,

                    background: segment.background,

                    mapDataSource: window.__JPAPP_MAP_CHAPTERS_SOURCE || null,

                    viewport,

                    containerRect: containerRect ? {

                        width: Math.round(containerRect.width),

                        height: Math.round(containerRect.height),

                        left: Math.round(containerRect.left),

                        top: Math.round(containerRect.top)

                    } : null,

                    imageRect: imageRect ? {

                        width: Math.round(imageRect.width),

                        height: Math.round(imageRect.height),

                        left: Math.round(imageRect.left),

                        top: Math.round(imageRect.top)

                    } : null

                });

                console.table(rows);

                return rows;

            }



            function mentorKeyInfo(level) {

                const lv = clampLevel(level ?? currentLevel?.value ?? 1);

                const config = LEVEL_CONFIG?.value?.[lv] || LEVEL_CONFIG?.[lv] || null;

                const key = config?.skillId || config?.unlockSkills?.[0] || null;

                const skill = key ? (skillsAll?.value?.[key] || skillsAll?.[key] || null) : null;

                const centralized = key ? (MENTOR_AUDIO_MAP?.value?.[key] || MENTOR_AUDIO_MAP?.[key] || null) : null;

                const tutorialKey = lv === 36 ? 'L36_FIRST_ENTRY' : `STAGE_INTRO_${lv}`;

                const seen = Array.isArray(mentorTutorialSeen?.value)

                    ? mentorTutorialSeen.value.includes(tutorialKey)

                    : false;

                const info = {

                    level: lv,

                    levelId: config?.id || null,

                    title: config?.title || config?.name || null,

                    isBoss: !!(config?.boss || config?.isBoss || lv % 5 === 0),

                    skillId: config?.skillId || null,

                    firstUnlockSkill: config?.unlockSkills?.[0] || null,

                    attemptedKey: key,

                    hasSkill: !!skill,

                    hasCentralizedDialogue: !!centralized?.dialogue?.length,

                    centralizedDialogueLines: centralized?.dialogue?.length || 0,

                    hasCentralizedAudio: !!centralized?.audio?.length,

                    centralizedAudioLines: centralized?.audio?.length || 0,

                    stageIntroSeenKey: tutorialKey,

                    stageIntroSeen: seen

                };

                console.table([info]);

                return info;

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



                    const q = generateQuestionBySkill(targetId, debugBlanks);

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

                playMentor(id) {
                    const key = String(id || '').trim();
                    const mentorMap = MENTOR_AUDIO_MAP?.value || {};
                    if (!key || !mentorMap[key]) {
                        console.warn(`[jpDebug.playMentor] mentor dialogue key not found: "${key}"`, Object.keys(mentorMap).sort());
                        return false;
                    }
                    setupMentorDialogue({ id: key, name: '導師・優依' });
                    if (typeof pauseBattle === 'function') pauseBattle();
                    console.log(`[jpDebug] Playing mentor dialogue: ${key}`);
                    return true;
                },
                
                playPrologueOpening() {
                    if (typeof playPrologueOpening === 'function') {
                        playPrologueOpening();
                        console.log("[jpDebug] Playing Prologue Opening...");
                    } else {
                        console.warn("[jpDebug] playPrologueOpening function not found in refs");
                    }
                },

                playMainEndingFinale() {
                    if (typeof playMainEndingFinale === 'function') {
                        playMainEndingFinale();
                        console.log("[jpDebug] Playing Main Ending Finale...");
                    } else {
                        console.warn("[jpDebug] playMainEndingFinale function not found in refs");
                    }
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

                    if (levelId === 36) {
                        // L36 隱藏魔王：實測模式，直接呼叫 game 引擎的產題路徑
                        console.log("[jpDebug.audit] L36 detected. Using REAL generation (Dry-run mode)...");
                        // 使用 startBossQueue 僅初始化數值對列，避免 initGame 帶來的音效、觸發動畫與轉場副作用
                        if (typeof startBossQueue === 'function') startBossQueue(unlockedSkillIds?.value || [], 36);
                        
                        for (let i = 0; i < sampleCount; i++) {
                            const q = generateQuestionBySkill('HIDDEN_BOSS_36_QUEUE', 1);
                            if (q) {
                                const sid = q.skillId || 'UNKNOWN';
                                counts[sid] = (counts[sid] || 0) + 1;
                            }
                        }
                    } else if (isBoss) {
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

                auditChoices(levelId, n = 20) {
                    const config = LEVEL_CONFIG.value[levelId];
                    if (!config) {
                        console.error("[jpDebug.auditChoices] Invalid Level ID");
                        return;
                    }

                    const results = [];
                    const validParticles = ['は', 'の', 'が', 'を', 'に', 'へ', 'も', 'で', 'と', 'から', 'まで', 'や', 'より'];

                    const originalLevel = currentLevel.value;
                    currentLevel.value = levelId;

                    try {
                        for (let i = 0; i < n; i++) {
                            // Use existing logic to pick a skill for this level
                            const newSkills = config.unlockSkills || [];
                            const getHistArr = (lv) => {
                                const h = new Set();
                                for(let j=1; j<lv; j++) {
                                    const c = LEVEL_CONFIG.value[j];
                                    if(c?.unlockSkills) c.unlockSkills.forEach(s => {
                                        if(s && !s.startsWith('BOSS_REVIEW') && !s.startsWith('FINAL') && !s.startsWith('HIDDEN')) h.add(s);
                                    });
                                }
                                return Array.from(h);
                            };
                            const oldSkills = getHistArr(levelId);
                            
                            const isBoss = levelId % 5 === 0 || config.isBoss;
                            let sid;
                            if (isBoss) {
                                if (levelId === 5) {
                                    const pool = ['WA_TOPIC_BASIC', 'NO_POSSESSIVE', 'GA_INTRANSITIVE', 'WO_OBJECT_BASIC'];
                                    sid = pool[Math.floor(Math.random()*pool.length)];
                                } else {
                                    const curMap = [];
                                    for(let j=levelId-4; j<levelId; j++) if(LEVEL_CONFIG.value[j]?.unlockSkills) curMap.push(...LEVEL_CONFIG.value[j].unlockSkills);
                                    const hist = getHistArr(Math.max(1, levelId - 4));
                                    if (Math.random() < 0.8 && curMap.length > 0) sid = curMap[Math.floor(Math.random()*curMap.length)];
                                    else if (hist.length > 0) sid = hist[Math.floor(Math.random()*hist.length)];
                                    else sid = 'WA_TOPIC_BASIC';
                                }
                            } else {
                                const weight = config.skillMix?.newSkillWeight ?? 0.5;
                                if (newSkills.length > 0 && oldSkills.length > 0) sid = (Math.random() < weight) ? newSkills[Math.floor(Math.random()*newSkills.length)] : oldSkills[Math.floor(Math.random()*oldSkills.length)];
                                else if (newSkills.length > 0) sid = newSkills[Math.floor(Math.random()*newSkills.length)];
                                else sid = oldSkills[Math.floor(Math.random()*oldSkills.length)] || 'WA_TOPIC_BASIC';
                            }

                            const q = makeOneSkillQuestion(sid);
                            if (!q) continue;

                            const warnings = [];
                            const choices = q.choices || [];
                            const ans = q.answer || '';
                            const isParticleQ = validParticles.includes(ans);

                            if (choices.length === 0) warnings.push("EMPTY choices");
                            choices.forEach(c => {
                                if (!c || String(c).trim() === "") warnings.push(`Empty string in choices`);
                                if (String(c).length > 12) warnings.push(`Fragment? (len:${c.length}): "${c}"`);
                                if (isParticleQ && !validParticles.includes(c)) warnings.push(`Non-particle distractor: "${c}"`);
                                if (ans.length <= 2 && !/[\u4e00-\u9fa5]/.test(ans) && /[\u4e00-\u9fa5]/.test(c)) {
                                    warnings.push(`Kanji in particle choice: "${c}"`);
                                }
                            });

                            results.push({
                                i: i + 1,
                                skill: sid,
                                prompt: q.chinese || '?',
                                sentence: `${q.leftText || ''}【${ans}】${q.rightText || ''}`,
                                answer: ans,
                                choices: choices.join(' / '),
                                warning: warnings.length > 0 ? warnings.join(', ') : '-'
                            });
                        }
                    } finally {
                        currentLevel.value = originalLevel;
                    }

                    console.log(`[jpDebug.auditChoices] Simulation for Level ${levelId} (N=${results.length})`);
                    console.table(results);
                    return results;
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



                mapNodes(options = {}) {

                    return mapNodeRows(options);

                },



                mapPositions(options = {}) {

                    return mapNodeRows(options);

                },



                clearMapNodeLabels() {

                    clearMapNodeLabels();

                },



                mentorKey(level) {

                    return mentorKeyInfo(level);

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
- jpDebug.mapNodes() : Console-table current map marker data.
- jpDebug.mapNodes({ labels: true }) : Add temporary labels above visible markers.
- jpDebug.clearMapNodeLabels() : Remove temporary map marker labels.
- jpDebug.mentorKey(25) : Inspect the mentor dialogue key and seen state for a level.

Audit Tools (Question Distribution):
- jpDebug.auditLevelSkills(6, 100) : Simulate Level 6, sample 100 times.
- jpDebug.auditStart() : Start recording current play sessions.
- jpDebug.auditReport() : Show stats for current play session.
- jpDebug.auditStop() : Stop recording and show report.
- jpDebug.auditReset() : Clear data.

Mentor/Tutorial:
- jpDebug.resetMentorTutorials()
- jpDebug.replayMentor('WA_TOPIC_BASIC')
- jpDebug.playMentor('ENDING_L35_NORMAL')
- jpDebug.playPrologueOpening()
- jpDebug.playMainEndingFinale()
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
