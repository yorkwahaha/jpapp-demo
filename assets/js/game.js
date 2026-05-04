

window.__sp = { cur: 20, max: 20 };

const spawnFloatingDamage = window.__JPAPP_VFX?.spawnFloatingDamage || function () {};
window.spawnFloatingDamage = spawnFloatingDamage;

// window.spawnSkillActivationVfx — 已移至 assets/js/skill-vfx.js (載入順序在本檔之前)

const spawnGiraGiraHitVfx = window.__JPAPP_VFX?.spawnGiraGiraHitVfx || function () {};
window.spawnGiraGiraHitVfx = spawnGiraGiraHitVfx;
const spawnGiraGiraBurstVfx = window.__JPAPP_VFX?.spawnGiraGiraBurstVfx || function () {};
window.spawnGiraGiraBurstVfx = spawnGiraGiraBurstVfx;

window.updateSpUI = function () {

    const fill = document.getElementById("spFill");

    const text = document.getElementById("spText");

    if (fill && text) {

        text.textContent = `${window.__sp.cur}/${window.__sp.max}`;

        const pct = Math.max(0, Math.min(100, (window.__sp.cur / window.__sp.max) * 100));

        fill.style.width = `${pct}%`;

    }

};

// ---- [ SP 統一操作函式 ] ----
function canAffordSP(cost) { return window.__sp.cur >= cost; }

function spendSP(cost) {
    window.__sp.cur -= cost;
    if (window.updateSpUI) window.updateSpUI();
}

function regenSP() {
    if (window.__sp.cur < window.__sp.max) {
        window.__sp.cur++;
        if (window.updateSpUI) window.updateSpUI();
    }
}

function resetSP() {
    window.__sp.cur = window.__sp.max;
    if (window.updateSpUI) window.updateSpUI();
}

// ================= [ VUE APP — MAIN COMPONENT ] =================
const { ref, reactive, computed, watch, onMounted, nextTick } = Vue;
const _jpApp = Vue.createApp({

    setup() {
        const GAME_CONSTANTS = window.JPAPP_CONSTANTS || {}, SCENE_IMAGE_PATHS = GAME_CONSTANTS.SCENE_IMAGE_PATHS || {}, DEFAULT_IMAGE_PATHS = GAME_CONSTANTS.DEFAULT_IMAGE_PATHS || {};
        const {
            VALID_TTS_VOICES,
            ONEESAN_PRAISES,
            COMBO_FEEDBACK_MILESTONES,
            FEEDBACK_VOICE_PATHS,
            GRADE_RANK
        } = GAME_CONSTANTS;

        const {
            normalizeStageBestRecord = (r) => r,
            normalizeStageBestRecords = (s) => s,
            parseAcceptableAnswers = (a) => (Array.isArray(a) ? a : [a]),
            formatStageClearTime = (s) => (s + 's'),
            getGradeColor = () => '',
            pickOne = (a) => (a ? a[0] : null),
            pickMany = (a, n) => (a ? a.slice(0, n) : []),
            getStageRecordTimeMs = () => Infinity,
            isStageRecordBetter = () => false
        } = window.__JPAPP_UTILS || {};

        // ---- [ NEW: ONE-TIME SCENE CONSTANTS ] ----
        const PROLOGUE_BGM = ''; // Add path here if needed
        const MAIN_ENDING_BGM = ''; // Add path here if needed

        onMounted(async () => {
            // Load Map Chapter Data (Ensuring this runs on all environments)
            try {
                const mapDataVersion = window.APP_VERSION || Date.now();
                const mapDataSource = 'assets/data/map-chapters.json?v=' + mapDataVersion;
                const resp = await fetch(mapDataSource, { cache: 'no-store' });
                if (resp.ok) {
                    mapChapters.value = await resp.json();
                    window.__JPAPP_MAP_CHAPTERS_SOURCE = {
                        url: mapDataSource,
                        version: String(mapDataVersion),
                        loadedAt: new Date().toISOString()
                    };
                    if (window.__DEBUG__) console.log('[MapData] chapters loaded');
                }
            } catch (e) {
                console.warn('[MapData] fetch error', e);
            }

            const h = location.hostname;
            const isLocal = h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0'
                || /^192\.168\./.test(h) || /^10\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h);
            if (!isLocal) return;

            const path = 'config.local.js';
            const script = document.createElement('script');
            script.src = path;
            script.onload = () => { if (window.__DEBUG__) console.log(`[AZURE] config.local.js loaded`); };
            script.onerror = () => { };
            document.head.appendChild(script);
        });

        // ================= [ CONFIG & STATE — VUE REACTIVE SETUP ] =================
        // --- 資料抽離：讀取全域早期關卡資料庫 ---

        const pool = window.EARLY_GAME_POOLS || { skills: {} };

        const LEVEL_CONFIG = ref({});

        const SKILLS = ref([]);

        const SPIRITS = ref([]);

        const spiritsBySkillId = ref({});

        const ENEMIES = ref([]);

        const MENTOR_AUDIO_MAP = ref({});

        const isMonsterImageError = ref(false);

        const maxLevel = ref(35);

        // --- Stage Map / Progression State ---

        const PROGRESSION_KEY = 'jpapp_progression_v1';

        const showMap = ref(false);

        const unlockedLevels = ref([1]);

        const lastClearedLevel = ref(null);

        const newUnlockLv = ref(null);

        const bestGrades = ref({}); // { stageNumber: 'S' }
        const stageBestRecords = ref({}); // { stageNumber: { bestStars, bestTimeMs, bestTimeSeconds, bestCorrectRate, bestMaxCombo, updatedAt } }

        const clearedLevels = ref([]);

        const mapChapters = ref({});

        const activeChapter = ref('chapter1');

        const selectedSegmentIdx = ref(0);

        const selectedStageToConfirm = ref(null);

        const isBattleConfirmOpen = ref(false);
        const stageConfirmSuspendedForMentor = ref(false);
        const isSpecialSceneActive = ref(false);
        const specialSceneBg = ref('');

        // --- Knowledge Card Unlock State ---
        const pendingKnowledgeCards = ref([]);
        const activeKnowledgeCard = ref(null);
        const isKnowledgeCardShowing = ref(false);
        const isKnowledgeCardAbsorbing = ref(false);
        const resultSpirit = ref(null);

        // --- NEW: Spirit Icon Fallback Mechanism ---
        const failedSpiritIcons = ref({});
        const getSpiritIconPath = (opt) => window.JPAPPCodexDisplayUtils.getSpiritIconPath(opt);

        const shouldShowSpiritIcon = (opt) => {
            return Boolean(getSpiritIconPath(opt)) && !failedSpiritIcons.value[opt];
        };

        const handleSpiritIconError = (opt) => {
            if (!opt) return;
            failedSpiritIcons.value = { ...failedSpiritIcons.value, [opt]: true };
        };

        const getSpiritForSkillId = (skillId) => {
            if (!skillId || typeof skillId !== 'string') return null;
            return spiritsBySkillId.value[skillId] || null;
        };

        const getSpiritForSkill = (skill) => getSpiritForSkillId(skill?.id);

        const getSpiritForKnowledgeCard = (card) => card?.spirit || getSpiritForSkill(card);

        const decorateSkillWithSpirit = (skill) => {
            if (!skill) return null;
            const spirit = getSpiritForSkillId(skill.id);
            return spirit ? { ...skill, spirit } : skill;
        };

        const getSpiritImageSrc = (spirit) => window.JPAPPCodexDisplayUtils.getSpiritImageSrc(spirit);
        const handleSpiritImageError = (event, spirit) => window.JPAPPCodexDisplayUtils.handleSpiritImageError(event, spirit);

        const getResultSpiritForLevel = (levelId) => {
            const pendingSpirit = pendingKnowledgeCards.value
                .map(card => getSpiritForKnowledgeCard(card))
                .find(Boolean);
            if (pendingSpirit) return pendingSpirit;

            const config = LEVEL_CONFIG.value?.[Number(levelId)];
            const stageSkillIds = [
                ...(Array.isArray(config?.unlockSkills) ? config.unlockSkills : []),
                config?.skillId,
                currentQuestion.value?.skillId
            ].filter(Boolean);

            for (const skillId of stageSkillIds) {
                const spirit = getSpiritForSkillId(skillId);
                if (spirit) return spirit;
            }

            return null;
        };

        // --- オノマトペ Skills (unlocked on boss clear) ---
        const unlockedOnomatopeIds = ref([]);

        const MASTERY_PARTICLES = GAME_CONSTANTS.MASTERY_PARTICLES;
        const createParticleProgressMap = (initialValue = 0) => {
            return MASTERY_PARTICLES.reduce((acc, particle) => {
                acc[particle] = initialValue;
                return acc;
            }, {});
        };
        const normalizeParticleMasteryMap = (source = {}) => {
            const base = createParticleProgressMap(0);
            MASTERY_PARTICLES.forEach(particle => {
                const value = Number(source?.[particle] ?? 0);
                base[particle] = Number.isFinite(value) ? Math.min(100, Math.max(0, Math.floor(value))) : 0;
            });
            return base;
        };
        const normalizeParticleCorrectCountsMap = (source = {}) => {
            const base = createParticleProgressMap(0);
            MASTERY_PARTICLES.forEach(particle => {
                const value = Number(source?.[particle] ?? 0);
                base[particle] = Number.isFinite(value) ? Math.max(0, Math.floor(value)) % 2 : 0;
            });
            return base;
        };
        const normalizeSkillMasteryMap = (source = {}) => {
            return Object.entries(source || {}).reduce((acc, [skillId, rawValue]) => {
                if (!skillId || typeof skillId !== 'string') return acc;
                const value = Number(rawValue ?? 0);
                acc[skillId] = Number.isFinite(value) ? Math.min(100, Math.max(0, Math.floor(value))) : 0;
                return acc;
            }, {});
        };
        const normalizeSkillCorrectCountsMap = (source = {}) => {
            return Object.entries(source || {}).reduce((acc, [skillId, rawValue]) => {
                if (!skillId || typeof skillId !== 'string') return acc;
                const value = Number(rawValue ?? 0);
                acc[skillId] = Number.isFinite(value) ? Math.max(0, Math.floor(value)) % 2 : 0;
                return acc;
            }, {});
        };
        const particleMastery = ref(createParticleProgressMap(0));
        const particleCorrectCounts = ref(createParticleProgressMap(0));
        const skillMastery = ref({});
        const skillCorrectCounts = ref({});

        // --- Hero Visual Data Configuration ---
        // battle.marginBottom: CSS string applied to #heroAvatar margin-bottom (e.g. '24px' or 'clamp(135px,18dvh,160px)')
        // map.src: image path for .map-hud-avatar-img elements
        // thresholds: hp-based steady-state expression; hpPct is lower bound (>= value uses expression)
        const HERO_VISUAL_CONFIG = GAME_CONSTANTS.HERO_VISUAL_CONFIG;

        const activeSegment = computed(() => {
            const ch = mapChapters.value[activeChapter.value];
            if (!ch || !ch.segments) return null;
            return ch.segments[selectedSegmentIdx.value] || null;
        });

        const currentMapBgm = computed(() => {
            return activeSegment.value?.mapBgm || 'assets/audio/bgm_m4a/map.m4a';
        });

        const autoSelectSegment = () => window.JPAPPSettingsManager.runAutoSelectMapSegmentIndex(unlockedLevels.value, selectedSegmentIdx);

        const isSegmentUnlocked = (idx) => window.JPAPPSettingsManager.isMapSegmentIndexUnlocked(idx, {
            clearedLevels: clearedLevels.value,
            unlockedLevels: unlockedLevels.value
        });

        const getMapNodeStyle = (node) => window.JPAPPSettingsManager.getMapNodePositionStyle(node);

        let _pendingAbilityIds = null;

        const saveProgression = () => {

            try {

                const data = {

                    unlockedLevels: unlockedLevels.value,

                    clearedLevels: clearedLevels.value,

                    bestGrades: bestGrades.value,

                    stageBestRecords: stageBestRecords.value,

                    unlockedAbilityIds: unlockedAbilityIds.value,

                    unlockedOnomatopeIds: unlockedOnomatopeIds.value,

                    particleMastery: particleMastery.value,

                    particleCorrectCounts: particleCorrectCounts.value,

                    skillMastery: skillMastery.value,

                    skillCorrectCounts: skillCorrectCounts.value,

                    lastViewedMap: { chapter: activeChapter.value, segment: selectedSegmentIdx.value }

                };

                localStorage.setItem(PROGRESSION_KEY, JSON.stringify(data));

            } catch (e) {

                console.warn('[Progression] save error', e);

            }

        };

        const loadProgression = () => {

            try {

                const raw = localStorage.getItem(PROGRESSION_KEY);

                if (raw) {

                    const parsed = JSON.parse(raw);

                    if (parsed.unlockedLevels) unlockedLevels.value = parsed.unlockedLevels;

                    if (parsed.clearedLevels) clearedLevels.value = parsed.clearedLevels;

                    if (parsed.bestGrades) bestGrades.value = parsed.bestGrades;

                    if (parsed.stageBestRecords) stageBestRecords.value = normalizeStageBestRecords(parsed.stageBestRecords);

                    if (parsed.unlockedAbilityIds) _pendingAbilityIds = parsed.unlockedAbilityIds;

                    if (parsed.unlockedOnomatopeIds) unlockedOnomatopeIds.value = parsed.unlockedOnomatopeIds;

                    if (parsed.particleMastery) particleMastery.value = normalizeParticleMasteryMap(parsed.particleMastery);

                    if (parsed.particleCorrectCounts) particleCorrectCounts.value = normalizeParticleCorrectCountsMap(parsed.particleCorrectCounts);

                    if (parsed.skillMastery) skillMastery.value = normalizeSkillMasteryMap(parsed.skillMastery);

                    if (parsed.skillCorrectCounts) skillCorrectCounts.value = normalizeSkillCorrectCountsMap(parsed.skillCorrectCounts);

                    if (parsed.lastViewedMap && isSegmentUnlocked(parsed.lastViewedMap.segment)) {
                        activeChapter.value = parsed.lastViewedMap.chapter || 'chapter1';
                        selectedSegmentIdx.value = parsed.lastViewedMap.segment;
                    } else {
                        autoSelectSegment();
                    }

                }

            } catch (e) {

                console.warn('[Progression] load error', e);

            }

        };

        loadProgression();

        // ---- [ NEW: PROLOGUE TRIGGER ] ----
        const checkPrologueTrigger = () => {
            if (!localStorage.getItem('jpapp_seen_prologue_opening')) {
                // Determine background
                const bg = SCENE_IMAGE_PATHS.prologueBg || SCENE_IMAGE_PATHS.prologueFallbackBg;

                // Initialize Scene
                isSpecialSceneActive.value = true;
                specialSceneBg.value = bg;
                showMap.value = true;
                showLevelSelect.value = false;

                // Stop any home screen audio
                stopAllAudio();

                window._resumeAfterMentor = () => {
                    isSpecialSceneActive.value = false;
                    localStorage.setItem('jpapp_seen_prologue_opening', 'true');

                    // Proceed to normal map BGM
                    Vue.nextTick(() => {
                        if (typeof MapAmbient !== 'undefined') {
                            MapAmbient.activate(activeChapter.value, selectedSegmentIdx.value, activeSegment.value?.themeKey);
                        }
                        ensureBgmPlaying(currentMapBgm.value);
                    });
                };

                // Trigger dialogue (Wait for MENTOR_AUDIO_MAP to be ready)
                const trigger = () => {
                    if (MENTOR_AUDIO_MAP.value && MENTOR_AUDIO_MAP.value['PROLOGUE_OPENING']) {
                        setupMentorDialogue({
                            id: 'PROLOGUE_OPENING',
                            name: 'Selene姐姐',
                            mentorDialogue: MENTOR_AUDIO_MAP.value['PROLOGUE_OPENING'].dialogue
                        });
                        // Play BGM if set
                        if (PROLOGUE_BGM && bgmAudio.value) {
                            bgmAudio.value.src = PROLOGUE_BGM;
                            bgmAudio.value.play().catch(() => { });
                        }
                    } else {
                        setTimeout(trigger, 100);
                    }
                };
                trigger();
                return true; // Triggered
            }
            return false; // Already seen
        };

        const openMap = () => {
            resetBattleOutcomePresentation();
            clearDefeatBgmSuppression();
            // Check for first-time prologue BEFORE entering normal map
            if (checkPrologueTrigger()) return;

            // 在能確定屬於 user gesture 的 handler 中先解鎖並首播 map BGM (第二版修正)

            try {

                if (typeof unlockAudioOnce === 'function') unlockAudioOnce();

                if (typeof bgmAudio !== 'undefined') {

                    const expectedAbs = new URL('assets/audio/bgm_m4a/map.m4a', window.location.href).href;

                    if (!bgmAudio.value) {

                        bgmAudio.value = new Audio();

                        bgmAudio.value.crossOrigin = "anonymous";

                        bgmAudio.value.preload = "auto";

                        bgmAudio.value.loop = true;

                        if (typeof audioPool !== 'undefined') {

                            audioPool.set(BGM_BASE + 'BGM_1.m4a', bgmAudio.value);

                        }

                    }

                    if (bgmAudio.value.src !== expectedAbs) {

                        bgmAudio.value.src = expectedAbs;

                        bgmAudio.value.load();

                    }

                    if (!isMuted.value && bgmVolume.value > 0) {

                        const playPromise = bgmAudio.value.play();

                        if (playPromise !== undefined) {
                            playPromise.catch(e => {
                                if (e.name === 'AbortError') return;
                                console.warn('[BGM] openMap sync play failed', e.name, e.message);
                                if (typeof needsUserGestureToResumeBgm !== 'undefined') {
                                    needsUserGestureToResumeBgm.value = true;
                                }
                            });
                        }

                    }

                }

            } catch (e) {

                console.warn('[BGM] openMap audio prep failed', e);

            }

            // 然後再切換 UI / showMap

            showLevelSelect.value = false;

            const maxUnlocked = Math.max(...unlockedLevels.value, 1);
            const latestSegIdx = Math.floor((maxUnlocked - 1) / 5);

            if (newUnlockLv.value) {
                const justUnlockedSegIdx = Math.floor((newUnlockLv.value - 1) / 5);
                if (justUnlockedSegIdx > selectedSegmentIdx.value && selectedSegmentIdx.value === latestSegIdx - 1) {
                    selectedSegmentIdx.value = justUnlockedSegIdx;
                    activeChapter.value = 'chapter1';
                }
            } else if (!isSegmentUnlocked(selectedSegmentIdx.value)) {
                autoSelectSegment();
            }

            saveProgression();

            showMap.value = true;

            // Reset battle UI states

            monsterResultShown.value = false;

            monsterTrulyDead.value = false;

            monsterIsDying.value = false;

            isNextBtnVisible.value = false;

            const vfxLayer = document.getElementById('global-vfx-layer');

            if (vfxLayer) vfxLayer.innerHTML = '';

            // Auto scroll to target

            const target = newUnlockLv.value || lastClearedLevel.value || 1;

            scrollToStage(target);

            // Stop battle music and play map music

            stopAllAudio();

            playBgm();

            checkGlobalEndingTriggers();

            // ── Ambient animation ──
            if (typeof MapAmbient !== 'undefined') {
                Vue.nextTick(() => MapAmbient.activate(activeChapter.value, selectedSegmentIdx.value, activeSegment.value?.themeKey));
            }

        };

        const scrollToStage = (n) => window.JPAPPSettingsManager.scrollStageNodeIntoView(n, Vue.nextTick);

        const isLevelUnlocked = (n) => unlockedLevels.value.includes(Number(n));

        const isLevelCleared = (n) => clearedLevels.value.includes(Number(n));

        const getStageNodeClass = (n) => window.JPAPPSettingsManager.getStageNodeClassForMap(
            n,
            unlockedLevels.value,
            clearedLevels.value
        );

        const getLevelTitle = (n) => window.JPAPPSettingsManager.getLevelTitleForConfig(n, LEVEL_CONFIG.value);

        const getStageFocusParticle = (n) => window.JPAPPSettingsManager.computeStageFocusParticleDisplay(
            n,
            LEVEL_CONFIG.value,
            skillsAll.value
        );

        const getStageFocusLabel = (n) => window.JPAPPSettingsManager.computeStageFocusLabelDisplay(
            n,
            LEVEL_CONFIG.value,
            skillsAll.value
        );

        const hasMentor = (n) => window.JPAPPSettingsManager.stageConfigHasMentorSkillPath(n, LEVEL_CONFIG.value);

        const handleMapTabClick = (idx) => {
            if (!isSegmentUnlocked(idx)) {
                if (typeof showStatusToast === 'function') showStatusToast('🔒 區域尚未解鎖', { bg: 'rgba(0,0,0,0.7)', border: '#555', color: '#fff' });
                return;
            }
            const segment = mapChapters.value[activeChapter.value]?.segments[idx];
            if (!segment || !segment.background) {
                if (typeof showStatusToast === 'function') showStatusToast('🚧 區域開發中，敬請期待！', { bg: 'rgba(30,41,59,0.9)', border: '#475569', color: '#f8fafc' });
                return;
            }
            selectedSegmentIdx.value = idx;
            saveProgression();
            playBgm();
        };

        const jumpToMapSegment = (chapKey, segIdx) => {
            isMapDropdownOpen.value = false;
            if (chapKey !== activeChapter.value) {
                activeChapter.value = chapKey;
            }
            handleMapTabClick(segIdx);

            saveProgression();

            // Refresh ambient for new chapter
            if (typeof MapAmbient !== 'undefined') {
                Vue.nextTick(() => MapAmbient.activate(activeChapter.value, selectedSegmentIdx.value, activeSegment.value?.themeKey));
            }
        };

        const selectStageFromMap = (n) => {
            const lvNum = Number(n);
            if (!isLevelUnlocked(lvNum)) {
                if (typeof showStatusToast === 'function') showStatusToast('🔒 關卡尚未解鎖', { bg: 'rgba(0,0,0,0.7)', border: '#555', color: '#fff' });
                return;
            }

            // [Auto-Mentor] First-time interaction trigger
            const stageKey = `STAGE_INTRO_${lvNum}`;
            const isManualReview = (lvNum === 36); // Special case for hidden stage
            const tutorialKey = isManualReview ? 'L36_FIRST_ENTRY' : stageKey;

            if (!mentorTutorialSeen.value.includes(tutorialKey) && hasMentor(lvNum)) {
                const config = LEVEL_CONFIG.value[lvNum];
                const skillId = config.skillId || (config.unlockSkills && config.unlockSkills[0]);
                const skill = skillsAll.value[skillId];

                if (skill || isManualReview) {
                    // Mark as seen immediately (even if they skip) to prevent re-triggering every click
                    mentorTutorialSeen.value.push(tutorialKey);
                    saveMentorState();

                    // Carry out the original intent (open confirm modal) after mentor finishes
                    window._resumeAfterMentor = () => {
                        playSfx('uiPop'); // Added feedback for battle confirm
                        selectedStageToConfirm.value = lvNum;
                        isBattleConfirmOpen.value = true;
                    };

                    if (isManualReview) {
                        setupMentorDialogue({ id: "L36_FIRST_ENTRY", name: "導師・優依" });
                    } else {
                        setupMentorDialogue(skill);
                    }
                    return; // Intercept: Wait for mentor
                }
            }

            // Normal flow: Straight to battle confirmation
            selectedStageToConfirm.value = lvNum;
            playSfx('uiPop'); // Added for stage selection from map
            isBattleConfirmOpen.value = true;
        };

        const confirmAndStartBattle = () => {
            if (selectedStageToConfirm.value !== null) {
                const lv = selectedStageToConfirm.value;
                isBattleConfirmOpen.value = false;
                if (typeof MapAmbient !== 'undefined') MapAmbient.deactivate();
                startLevel(lv, false);
            }
        };

        const startStageWithExplanation = (n) => {
            const lvNum = Number(n);
            if (!isLevelUnlocked(lvNum)) return;
            const config = LEVEL_CONFIG.value[lvNum];
            const openStageMentor = (skill) => {
                if (!skill) return;
                stageConfirmSuspendedForMentor.value = true;
                setupMentorDialogue(skill);
            };

            if (config && config.skillId) {
                const skill = skillsAll.value[config.skillId];
                openStageMentor(skill);
            } else if (config && config.unlockSkills && config.unlockSkills.length > 0) {
                const skill = skillsAll.value[config.unlockSkills[0]];
                openStageMentor(skill);
            }
        };

        if (unlockedLevels.value.includes(36) && !window.JPAPPResultDisplayManager.isAllStagesSRank(bestGrades.value, 35)) {
            unlockedLevels.value = unlockedLevels.value.filter(lv => lv !== 36);
            localStorage.removeItem('jpRpgL36Unlocked');
        }

        const checkGlobalEndingTriggers = () => {
            // ---- [ NEW: MAIN ENDING FINALE ] ----
            // Trigger immediately after defeating Level 36 for the first time
            if (clearedLevels.value.includes(36) && currentLevel.value === 36) {
                const hasSeenFinale = localStorage.getItem('jpapp_seen_main_ending_finale');
                if (!hasSeenFinale) {
                    // Set Scene
                    isSpecialSceneActive.value = true;
                    specialSceneBg.value = SCENE_IMAGE_PATHS.mainEndingBg;
                    showMap.value = true;
                    showLevelSelect.value = false; // Hide home screen if debug-triggered from home

                    // Stop ongoing audio
                    stopAllAudio();

                    // BGM override if set
                    if (MAIN_ENDING_BGM && bgmAudio.value) {
                        bgmAudio.value.src = MAIN_ENDING_BGM;
                        bgmAudio.value.play().catch(() => { });
                    }

                    setTimeout(() => {
                        setupMentorDialogue({
                            id: 'MAIN_ENDING_FINALE',
                            name: 'Selene姐姐',
                            mentorDialogue: MENTOR_AUDIO_MAP.value['MAIN_ENDING_FINALE']?.dialogue || []
                        });
                        window._resumeAfterMentor = () => {
                            isSpecialSceneActive.value = false;
                            localStorage.setItem('jpapp_seen_main_ending_finale', 'true');
                            localStorage.setItem('jpRpgTrueEndingSeen', 'true');
                            openMap();
                        };
                    }, 800);
                    return;
                }
            }

            if (clearedLevels.value.includes(36) && currentLevel.value === 36) {
                const hasSeenTrueEnding = localStorage.getItem('jpRpgTrueEndingSeen');
                if (!hasSeenTrueEnding) {
                    localStorage.setItem('jpRpgTrueEndingSeen', 'true');
                    setTimeout(() => setupMentorDialogue({
                        id: 'MAIN_ENDING_FINALE',
                        name: 'Selene姐姐'
                    }), 800);
                }
                return;
            }
            if (!clearedLevels.value.includes(35)) return;
            const isAllS = window.JPAPPResultDisplayManager.isAllStagesSRank(bestGrades.value, 35);
            const hasSeenAllS = localStorage.getItem('jpRpgL36Unlocked');
            const hasSeenNormal = localStorage.getItem('jpRpgL35EndingSeen');
            const openL35EndingDialogue = (id) => {
                setupMentorDialogue({
                    id,
                    name: 'Selene姐姐',
                    mentorDialogue: MENTOR_AUDIO_MAP.value[id]?.dialogue || []
                });
            };
            if (isAllS && !hasSeenAllS) {
                localStorage.setItem('jpRpgL36Unlocked', 'true');
                if (!unlockedLevels.value.includes(36)) unlockedLevels.value.push(36);
                saveProgression();
                const endingId = currentLevel.value === 35 ? 'ENDING_L35_ALL_S_AT_35' : 'ENDING_L35_ALL_S';
                setTimeout(() => openL35EndingDialogue(endingId), 800);
            } else if (!isAllS && !hasSeenNormal && currentLevel.value === 35) {
                localStorage.setItem('jpRpgL35EndingSeen', 'true');
                setTimeout(() => openL35EndingDialogue('ENDING_L35_NORMAL'), 800);
            }
        };

        const playPrologueOpening = () => {
            localStorage.removeItem('jpapp_seen_prologue_opening');
            checkPrologueTrigger();
        };

        const playMainEndingFinale = () => {
            stopAllAudio();
            localStorage.removeItem('jpapp_seen_main_ending_finale');
            // Force state to satisfy trigger conditions
            if (!clearedLevels.value.includes(36)) clearedLevels.value.push(36);
            currentLevel.value = 36;
            checkGlobalEndingTriggers();
        };

        const returnToMap = () => {
            resetBattleOutcomePresentation();
            resetStageClearMetrics();
            isFinished.value = true;
            showLevelSelect.value = false;

            const maxUnlocked = Math.max(...unlockedLevels.value, 1);
            const latestSegIdx = Math.floor((maxUnlocked - 1) / 5);

            if (newUnlockLv.value) {
                const justUnlockedSegIdx = Math.floor((newUnlockLv.value - 1) / 5);
                if (justUnlockedSegIdx > selectedSegmentIdx.value && selectedSegmentIdx.value === latestSegIdx - 1) {
                    selectedSegmentIdx.value = justUnlockedSegIdx;
                    activeChapter.value = 'chapter1';
                }
            } else if (!isSegmentUnlocked(selectedSegmentIdx.value)) {
                autoSelectSegment();
            }

            saveProgression();

            showMap.value = true;
            monsterResultShown.value = false;
            monsterTrulyDead.value = false;
            monsterIsDying.value = false;
            isNextBtnVisible.value = false;
            const vfxLayer = document.getElementById('global-vfx-layer');
            if (vfxLayer) vfxLayer.innerHTML = '';
            const target = newUnlockLv.value || lastClearedLevel.value || 1;
            scrollToStage(target);
            stopAllAudio();
            playBgm();
            checkGlobalEndingTriggers();

            // [Knowledge Card Refined] Moved to grantRewards (victory moment)
            // ── Ambient animation ──
            if (typeof MapAmbient !== 'undefined') {
                Vue.nextTick(() => MapAmbient.activate(activeChapter.value, selectedSegmentIdx.value, activeSegment.value?.themeKey));
            }
        };

        const triggerNextKnowledgeCard = () => {
            if (pendingKnowledgeCards.value.length === 0) {
                isKnowledgeCardShowing.value = false;

                // If there's a callback (e.g. from grantRewards), execute it
                if (window._afterKnowledgeCards) {
                    const cb = window._afterKnowledgeCards;
                    window._afterKnowledgeCards = null;
                    cb();
                    return;
                }

                // Resume map ambient if triggered from map (legacy support or safety)
                if (typeof MapAmbient !== 'undefined' && showMap.value) {
                    Vue.nextTick(() => MapAmbient.activate(activeChapter.value, selectedSegmentIdx.value, activeSegment.value?.themeKey));
                }
                return;
            }
            activeKnowledgeCard.value = pendingKnowledgeCards.value.shift();
            isKnowledgeCardShowing.value = true;
            isKnowledgeCardAbsorbing.value = false;
            playSfx('skillpop'); // Play card pop sound
        };

        const closeKnowledgeCard = () => {
            if (isKnowledgeCardAbsorbing.value) return;
            isKnowledgeCardAbsorbing.value = true;
            playSfx('skillget');

            // Wait for absorption animation to finish (matching CSS duration)
            setTimeout(() => {
                isKnowledgeCardShowing.value = false;
                triggerNextKnowledgeCard();
            }, 1200);
        };

        // ---- [ CONSTANTS & SETTINGS ] ----
        const APP_VERSION = window.APP_VERSION || "26050306";

        const appVersion = ref(APP_VERSION);

        const DEFAULT_TTS_VOICE = 'ja-JP-Neural2-B';

        const { settings, loadSettings, saveSettings } = window.JPAPPSettingsManager.createVueBoundGeneralSettings(
            { reactive },
            { VALID_TTS_VOICES, DEFAULT_TTS_VOICE }
        );

        loadSettings();

        watch(settings, saveSettings, { deep: true });

        window.__initVfxHelpers?.(settings);

        const { isChangelogOpen, changelogData, changelogError, openChangelog } = window.JPAPPChangelogManager.createChangelogState({
            ref,
            APP_VERSION
        });

        const answerMode = ref('tap');

        const getDefaultAttackMode = () => settings.defaultAttackMode === 'flick' ? 'flick' : 'tap';

        const flickState = reactive({

            activeOpt: null,

            startX: 0,

            startY: 0,

            currentX: 0,

            currentY: 0,

            lastValidX: 0,

            lastValidY: 0,

            hasValidMove: false,

            isArmed: false,

            successOpt: null,

            capturedEl: null,

            pendingDirectionalMiss: false,

            /** 最近一次彈道的單位方向（checkAnswer GIRAGIRA knockback 取用後清除） */

            lastShotDirNx: 0,

            lastShotDirNy: -1,

            lastShotDirStored: false

        });

        // ---- [ STATE — SKILLS & CODEX ] ----
        const skillsAll = ref({});

        const skillUnlockMap = ref({});

        const unlockedSkillIds = ref([]);

        // [ CODEX - STATE ]
        const isCodexOpen = ref(false);
        const codexPage = ref(0);
        const codexChapter = ref('all');
        const flippedCardId = ref(null);
        const isMonsterCodexOpen = ref(false);
        const selectedMonsterCodexId = ref(null);
        // [ /CODEX - STATE ]

        const mentorTutorialSeen = ref([]);

        const isMentorModalOpen = ref(false);

        const isLevelJumpOpen = ref(false);

        const currentMentorSkill = ref(null);

        const isMapMentorOpen = ref(false);

        const mentorPages = ref([]); // 平鋪後的文字分頁

        const mentorPageEmotions = ref([]);

        const mentorDialogueIndex = ref(0); // 指向目前的 Page

        const displayedMentorText = ref("");

        const isTypingMentor = ref(false);

        const isMentorPortraitError = ref(false);

        const mentorPortraitVideo = ref(null);

        const mentorVideoEl = ref(null);

        const isMentorVideoError = ref(false);

        const failedMentorImagePaths = ref({});

        const isMentorSkipPressing = ref(false);

        const mentorSkipPressTimer = ref(null);

        let typingTimerMentor = null;

        let currentMentorAudio = null;

        let mentorAudioPlayToken = 0;

        // 分頁輔助：將多行對話切碎

        const fragmentMentorDialogue = (dialogues) => {
            mentorPageEmotions.value = [];
            if (!Array.isArray(dialogues)) return [];
            const pages = [];
            dialogues.forEach(item => {
                const text = item.text || "";
                const emotion = item.emotion || 'gentle';

                // 以標點符號初步斷句

                const sentences = text.match(/[^。！？]+[。！？]?[」』"']?/g) || [text];

                let currentPage = "";

                let sentenceCount = 0;

                sentences.forEach(s => {

                    // 若加進去會超過 2 句，或單句極長，就強迫入下一頁

                    if (sentenceCount >= 3 || (currentPage.length + s.length > 85)) {

                        if (currentPage) {
                            pages.push(currentPage.trim());
                            mentorPageEmotions.value.push(emotion);
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
                    mentorPageEmotions.value.push(emotion);
                }

            });

            return pages;

        };

        const currentMentorLine = computed(() => {

            if (mentorPages.value.length === 0) return null;

            return mentorPages.value[mentorDialogueIndex.value];

        });

        const MENTOR_FALLBACK_SCENE_IMAGE = 'assets/images/ui/mentor-cover-fullbody.png';
        const MENTOR_EMOTION_IMAGE_PATHS = Object.freeze(GAME_CONSTANTS.MENTOR_EMOTION_IMAGE_PATHS || {});
        const MENTOR_DEFAULT_MODAL_IMAGE = MENTOR_EMOTION_IMAGE_PATHS.gentle;

        const currentMentorDialogueItem = computed(() => ({
            text: currentMentorLine.value || '',
            emotion: mentorPageEmotions.value[mentorDialogueIndex.value] || 'gentle'
        }));

        const getMentorEmotionImage = (emotion) => {
            const key = emotion || 'gentle';
            const path = MENTOR_EMOTION_IMAGE_PATHS[key] || MENTOR_EMOTION_IMAGE_PATHS.gentle;
            if (!failedMentorImagePaths.value[path]) return path;
            if (path !== MENTOR_EMOTION_IMAGE_PATHS.gentle && !failedMentorImagePaths.value[MENTOR_EMOTION_IMAGE_PATHS.gentle]) {
                return MENTOR_EMOTION_IMAGE_PATHS.gentle;
            }
            return null;
        };

        const currentMentorSceneImage = computed(() => getMentorEmotionImage(currentMentorDialogueItem.value.emotion) || MENTOR_FALLBACK_SCENE_IMAGE);
        const currentMentorModalImage = computed(() => getMentorEmotionImage(currentMentorDialogueItem.value.emotion) || MENTOR_DEFAULT_MODAL_IMAGE);

        const handleMentorImageError = (event, fallbackPath = MENTOR_DEFAULT_MODAL_IMAGE) => {
            const failedPath = event?.target?.getAttribute('src') || '';
            if (failedPath && failedPath !== fallbackPath) {
                failedMentorImagePaths.value = { ...failedMentorImagePaths.value, [failedPath]: true };
                if (event?.target) {
                    const gentlePath = MENTOR_EMOTION_IMAGE_PATHS.gentle;
                    event.target.src = failedPath !== gentlePath && !failedMentorImagePaths.value[gentlePath]
                        ? gentlePath
                        : fallbackPath;
                }
                return;
            }
            isMentorPortraitError.value = true;
        };

        const handleMentorSceneImageError = (event) => handleMentorImageError(event, MENTOR_FALLBACK_SCENE_IMAGE);
        const handleMentorModalImageError = (event) => handleMentorImageError(event, MENTOR_DEFAULT_MODAL_IMAGE);

        const isLastMentorLine = computed(() => {

            if (mentorPages.value.length === 0) return true;

            return mentorDialogueIndex.value >= mentorPages.value.length - 1;

        });

        const mentorVideoSources = computed(() => {

            const config = mentorPortraitVideo.value;

            if (!config) return [];

            const supportsVideo = typeof document !== 'undefined' && !!document.createElement('video').canPlayType;

            if (!supportsVideo) return [];

            const sources = [];

            if (config.webm) sources.push({ src: config.webm, type: 'video/webm' });

            if (config.mp4) sources.push({ src: config.mp4, type: 'video/mp4' });

            if (config.src) sources.push({ src: config.src, type: config.type || undefined });

            return sources;

        });

        const shouldUseMentorVideo = computed(() => mentorVideoSources.value.length > 0 && !isMentorVideoError.value);

        const mentorVideoPoster = computed(() => mentorPortraitVideo.value?.poster || 'assets/images/ui/mentor-cover-fullbody.png');

        const shouldMuteMentorVideo = computed(() => currentMentorSkill.value?.id !== 'PROLOGUE_OPENING');

        const getMentorVideoElement = () => {
            const videoRef = mentorVideoEl.value;
            if (Array.isArray(videoRef)) {
                return videoRef.find(video => video && typeof video.play === 'function') || null;
            }
            return videoRef && typeof videoRef.play === 'function' ? videoRef : null;
        };

        const stopMentorVideo = () => {

            const video = getMentorVideoElement();

            if (!video) return;

            try {

                video.pause();

                video.currentTime = 0;

            } catch (e) { }

        };

        const playMentorVideo = async () => {

            if (!shouldUseMentorVideo.value) return;

            await nextTick();

            const video = getMentorVideoElement();

            if (!video) return;

            try {

                const shouldMute = shouldMuteMentorVideo.value;

                video.muted = shouldMute;

                video.defaultMuted = shouldMute;

                video.playsInline = true;

                if (!shouldMute) {
                    stopAllAudio();
                    video.volume = Math.min(1, Math.max(0, masterVolume.value));
                }

                const playPromise = video.play();

                if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => { });

            } catch (e) { }

        };

        const handleMentorVideoError = () => {

            isMentorVideoError.value = true;

            stopMentorVideo();

        };

        const loadMentorState = () => {
            try {
                mentorTutorialSeen.value = window.JPAPPStorageManager.loadMentorSeen();
            } catch (e) { }
        };

        const saveMentorState = () => {
            window.JPAPPStorageManager.saveMentorSeen(mentorTutorialSeen.value);
        };

        loadMentorState();

        // ================= [ MENTOR DIALOGUE ] =================
        const setupMentorDialogue = (skill) => {
            currentMentorSkill.value = skill;

            // 優先讀取集中化 JSON 內的對話資料，保留原有 skill 內的作為 fallback
            const centralizedData = MENTOR_AUDIO_MAP.value?.[skill.id];
            const dialogueSource = centralizedData?.dialogue || skill.mentorDialogue || [];
            mentorPortraitVideo.value = skill.id === 'PROLOGUE_OPENING' ? null : (centralizedData?.portraitVideo || skill.portraitVideo || null);

            mentorPages.value = fragmentMentorDialogue(dialogueSource);

            mentorDialogueIndex.value = 0;

            if (showMap.value) {

                isMapMentorOpen.value = true;

                isMentorModalOpen.value = false;

            } else {
                playSfx('uiPop'); // Added sound for mentor modal
                isMentorModalOpen.value = true;
                isMapMentorOpen.value = false;
            }

            isMentorPortraitError.value = false;

            isMentorVideoError.value = false;

            startMentorTyping(currentMentorLine.value || "");

            playMentorAudioForCurrentPage();

            playMentorVideo();

        };

        const triggerMentorDialogue = (skillId, force = false) => {

            const skill = skillsAll.value[skillId];

            if (!skill || !skill.mentorDialogue) return false;

            // If NOT forced, check if already seen

            if (!force && mentorTutorialSeen.value.includes(skillId)) {

                return false;

            }

            setupMentorDialogue(skill);

            return true;

        };

        const startMentorTyping = (text) => {

            if (typingTimerMentor) clearTimeout(typingTimerMentor);

            displayedMentorText.value = "";

            isTypingMentor.value = true;

            let i = 0;

            const type = () => {

                if (i < text.length) {

                    displayedMentorText.value += text.charAt(i);

                    i++;

                    typingTimerMentor = setTimeout(type, 50);

                } else {

                    isTypingMentor.value = false;

                    typingTimerMentor = null;

                }

            };

            type();

        };

        const getMentorAudioPath = (skillId, pageIndex) => {

            const entry = MENTOR_AUDIO_MAP.value?.[skillId];

            if (entry?.audio) return entry.audio[pageIndex] ?? null;

            // legacy fallback

            if (skillId !== 'WA_TOPIC_BASIC') return null;

            const pNum = String(pageIndex + 1).padStart(2, '0');

            return `assets/audio/mentor_m4a/wa-topic-basic-p${pNum}.m4a`;

        };

        const stopMentorAudio = () => {
            mentorAudioPlayToken++;

            // Also stop TTS background audios
            if (typeof stopTtsAudio === 'function') stopTtsAudio();
            if (typeof stopWebSpeech === 'function') stopWebSpeech();

            if (currentMentorAudio) {
                try {
                    currentMentorAudio.onended = null;
                    currentMentorAudio.onerror = null;
                    currentMentorAudio.pause();
                    currentMentorAudio.currentTime = 0;
                } catch (e) { }
                currentMentorAudio = null;
            }

            if (typeof restoreMapBgmAfterVoice === 'function') restoreMapBgmAfterVoice();
        };

        const playMentorAudioForCurrentPage = async () => {
            stopMentorAudio();

            if (!currentMentorSkill.value) return;

            const token = ++mentorAudioPlayToken;
            const expectedSkillId = currentMentorSkill.value.id;
            const expectedPageIndex = mentorDialogueIndex.value;
            const path = getMentorAudioPath(expectedSkillId, expectedPageIndex);

            const isCurrentMentorAudioRequest = () => (
                token === mentorAudioPlayToken &&
                currentMentorSkill.value?.id === expectedSkillId &&
                mentorDialogueIndex.value === expectedPageIndex
            );

            const warnIfStale = (stage) => {
                if (!isCurrentMentorAudioRequest()) {
                    console.warn('[mentor-audio] stale playback ignored', {
                        stage,
                        skillId: expectedSkillId,
                        pageIndex: expectedPageIndex
                    });
                }
            };

            if (!path) {
                console.warn('[mentor-audio] official mp3 path missing; showing text only', {
                    skillId: expectedSkillId,
                    pageIndex: expectedPageIndex
                });
                return;
            }

            // Check if local file exists before playing (to avoid 404 console spam)
            try {
                const res = await fetch(path, { method: 'HEAD', cache: 'no-store' });
                if (!isCurrentMentorAudioRequest()) {
                    warnIfStale('head');
                    return;
                }
                if (!res.ok) {
                    console.warn('[mentor-audio] official mp3 unavailable; showing text only', res.status, path);
                    return;
                }

                const audio = new Audio(path);
                // 導師語音應保持高音量，不應被 bgmVolume (預設 0.35) 的窄閾值限制
                audio.volume = masterVolume.value * 0.95;
                currentMentorAudio = audio;

                audio.onended = () => {
                    if (!isCurrentMentorAudioRequest()) {
                        warnIfStale('ended');
                        return;
                    }
                    if (typeof restoreMapBgmAfterVoice === 'function') restoreMapBgmAfterVoice();
                };

                audio.onerror = () => {
                    if (!isCurrentMentorAudioRequest()) {
                        warnIfStale('error');
                        return;
                    }
                    console.warn('[mentor-audio] mp3 playback failed; showing text only', path);
                    if (typeof restoreMapBgmAfterVoice === 'function') restoreMapBgmAfterVoice();
                };

                audio.play().then(() => {
                    if (!isCurrentMentorAudioRequest()) {
                        warnIfStale('play');
                        return;
                    }
                    if (typeof duckMapBgmForVoice === 'function') duckMapBgmForVoice();
                }).catch(err => {
                    if (!isCurrentMentorAudioRequest()) {
                        warnIfStale('play-catch');
                        return;
                    }
                    console.warn('[mentor-audio] mp3 play blocked; showing text only', path, err);
                    if (typeof restoreMapBgmAfterVoice === 'function') restoreMapBgmAfterVoice();
                });
            } catch (e) {
                // Fetch failed or other error
                if (!isCurrentMentorAudioRequest()) {
                    warnIfStale('catch');
                    return;
                }
                console.warn('[mentor-audio] official mp3 check failed; showing text only', path, e);
                return;
            }
        };

        const completeMentorLine = () => {

            if (typingTimerMentor) {

                clearTimeout(typingTimerMentor);

                typingTimerMentor = null;

            }

            displayedMentorText.value = currentMentorLine.value || "";

            isTypingMentor.value = false;

        };

        const restartMentorDialogue = () => {

            mentorDialogueIndex.value = 0;

            stopMentorVideo();

            startMentorTyping(currentMentorLine.value || "");

            playMentorAudioForCurrentPage();

            playMentorVideo();

        };

        const nextMentorLine = () => {

            if (isTypingMentor.value) {

                completeMentorLine();

                return;

            }

            if (mentorDialogueIndex.value >= mentorPages.value.length - 1) {

                finishMentorDialogue();

            } else {

                mentorDialogueIndex.value++;

                startMentorTyping(currentMentorLine.value || "");

                playMentorAudioForCurrentPage();

            }

        };

        const finishMentorDialogue = () => {

            if (typingTimerMentor) {

                clearTimeout(typingTimerMentor);

                typingTimerMentor = null;

            }

            if (currentMentorSkill.value) {

                if (!mentorTutorialSeen.value.includes(currentMentorSkill.value.id)) {

                    mentorTutorialSeen.value.push(currentMentorSkill.value.id);

                    saveMentorState();

                }

            }

            stopMentorAudio();

            stopMentorVideo();

            isMentorModalOpen.value = false;

            isMapMentorOpen.value = false;

            if (stageConfirmSuspendedForMentor.value) {
                stageConfirmSuspendedForMentor.value = false;
            }

            // 立即刷新音量 (因 isMentorModalOpen 已設為 false)

            updateGainVolumes();

            if (window._resumeAfterMentor) {

                const callback = window._resumeAfterMentor;

                window._resumeAfterMentor = null;

                callback();

            }

        };

        const startMentorSkipPress = () => {

            isMentorSkipPressing.value = true;

            if (mentorSkipPressTimer.value) clearTimeout(mentorSkipPressTimer.value);

            mentorSkipPressTimer.value = setTimeout(() => {

                isMentorSkipPressing.value = false;

                playSfx('click');

                finishMentorDialogue();

            }, 3000);

        };

        const cancelMentorSkipPress = () => {

            isMentorSkipPressing.value = false;

            if (mentorSkipPressTimer.value) {

                clearTimeout(mentorSkipPressTimer.value);

                mentorSkipPressTimer.value = null;

            }

        };

        // [ CODEX - COMPUTED ]
        const skillsWithUnlockLevel = computed(() => {
            const unlocked = [];
            const locked = [];
            SKILLS.value.forEach(s => {
                if (unlockedSkillIds.value.includes(s.id)) unlocked.push(s);
                else locked.push(s);
            });
            unlocked.sort((a, b) => {
                if (a.particle !== b.particle) return (a.particle || '').localeCompare(b.particle || '', 'ja');
                return (a.rank || 0) - (b.rank || 0);
            });
            locked.sort((a, b) => {
                const lA = skillUnlockMap.value[a.id] || 999;
                const lB = skillUnlockMap.value[b.id] || 999;
                if (lA !== lB) return lA - lB;
                if (a.particle !== b.particle) return (a.particle || '').localeCompare(b.particle || '', 'ja');
                return (a.rank || 0) - (b.rank || 0);
            });
            return [...unlocked, ...locked].map(s => ({
                ...s,
                unlockLevel: skillUnlockMap.value[s.id]
            }));
        });

        const CODEX_PER_PAGE = 1;

        const codexBaseSkills = computed(() =>
            skillsWithUnlockLevel.value.filter(s =>
                s.particle && !s.particle.startsWith('複習') && s.particle !== '極限' && s.id !== 'TO_COMPANION'
            )
        );

        const codexChapterList = computed(() => {
            const seen = new Set();
            const list = [{ key: 'all', label: '全部' }];
            codexBaseSkills.value.forEach(s => {
                const p = s.particle || '技';
                if (!seen.has(p)) { seen.add(p); list.push({ key: p, label: p }); }
            });
            return list;
        });

        const codexFilteredSkills = computed(() => {
            if (codexChapter.value === 'all') return codexBaseSkills.value;
            return codexBaseSkills.value.filter(s => (s.particle || '技') === codexChapter.value);
        });

        const codexTotalPages = computed(() =>
            Math.max(1, Math.ceil(codexFilteredSkills.value.length / CODEX_PER_PAGE))
        );

        const codexPageSkills = computed(() => {
            const start = codexPage.value * CODEX_PER_PAGE;
            return codexFilteredSkills.value.slice(start, start + CODEX_PER_PAGE);
        });

        const codexNextSkill = computed(() =>
            codexFilteredSkills.value[codexPage.value + 1] || null
        );

        const getParticleMastery = (particle) => {
            if (!MASTERY_PARTICLES.includes(particle)) return 0;
            const value = Number(particleMastery.value[particle] ?? 0);
            return Number.isFinite(value) ? Math.min(100, Math.max(0, Math.floor(value))) : 0;
        };

        const getParticleMasteryStyle = (particle) => ({
            width: `${getParticleMastery(particle)}%`
        });

        const getSkillMastery = (skillId) => {
            if (!skillId || typeof skillId !== 'string') return 0;
            const value = Number(skillMastery.value[skillId] ?? 0);
            return Number.isFinite(value) ? Math.min(100, Math.max(0, Math.floor(value))) : 0;
        };

        const getSkillMasteryStyle = (skillId) => ({
            width: `${getSkillMastery(skillId)}%`
        });

        const formatMonsterCodexValue = (v, s) => window.JPAPPCodexDisplayUtils.formatMonsterCodexValue(v, s);

        const getMonsterStageText = (levels = []) => {
            if (!Array.isArray(levels) || !levels.length) return '出現關卡：未記錄';
            return `出現關卡：${levels.map(lv => {
                const config = LEVEL_CONFIG.value?.[Number(lv)];
                const label = config?.levelName || config?.name || `Stage ${lv}`;
                return `Lv.${lv} ${label}`;
            }).join(' / ')}`;
        };

        const monsterCodexEntries = computed(() => {
            return (ENEMIES.value || []).map((enemy, idx) => {
                const spawnLevels = Array.isArray(enemy.spawnLevels) ? enemy.spawnLevels : [];
                const enemyStats = enemy.enemyStats || {};
                const damage = enemyStats.damage || {};
                const hp = enemyStats.hp ?? enemy.hpMax ?? null;
                const damageMin = typeof damage === 'number' ? damage : (damage.min ?? enemy.attackDamageMin ?? null);
                const damageMax = typeof damage === 'number' ? damage : (damage.max ?? enemy.attackDamageMax ?? null);
                const attackIntervalMs = enemyStats.attackIntervalMs ?? enemy.attackIntervalMs ?? null;
                const evasionRate = enemyStats.evasionRate ?? enemy.evasionRate ?? null;
                const isUnlocked = spawnLevels.some(lv =>
                    clearedLevels.value.includes(Number(lv))
                );

                return {
                    id: enemy.id || `monster-${idx}`,
                    sortLevel: spawnLevels[0] ?? 999,
                    isUnlocked,
                    name: window.JPAPPCodexDisplayUtils.formatMonsterName(enemy.name),
                    image: enemy.image || DEFAULT_IMAGE_PATHS.monsterSprite,
                    spawnLevels,
                    stageText: getMonsterStageText(spawnLevels),
                    traitText: window.JPAPPCodexDisplayUtils.formatMonsterTrait(enemy.trait, enemy.description),
                    hpText: formatMonsterCodexValue(hp),
                    damageText: window.JPAPPCodexDisplayUtils.formatMonsterDamageRange(damageMin, damageMax),
                    evasionText: window.JPAPPCodexDisplayUtils.formatMonsterEvasion(evasionRate),
                    intervalText: window.JPAPPCodexDisplayUtils.formatMonsterAttackInterval(attackIntervalMs)
                };
            }).sort((a, b) => a.sortLevel - b.sortLevel || a.name.localeCompare(b.name, 'zh-Hant'));
        });

        const selectedMonsterCodexEntry = computed(() => {
            if (!monsterCodexEntries.value.length) return null;
            return monsterCodexEntries.value.find(entry => entry.id === selectedMonsterCodexId.value) || monsterCodexEntries.value[0];
        });

        const openMonsterCodex = () => {
            if (!selectedMonsterCodexId.value && monsterCodexEntries.value[0]) {
                selectedMonsterCodexId.value = monsterCodexEntries.value[0].id;
            }
            isMonsterCodexOpen.value = true;
            playSfx('uiPop');
        };

        const selectMonsterCodexEntry = (entry) => {
            if (!entry) return;
            selectedMonsterCodexId.value = entry.id;
            playSfx('click');
        };

        const handleMonsterCodexImageError = (event) => {
            window.JPAPPCodexDisplayUtils.handleMonsterImageError(event, DEFAULT_IMAGE_PATHS.monsterSprite);
        };
        // [ /CODEX - COMPUTED ]

        // [ CODEX - GLOBAL EVENTS ]
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isCodexOpen.value) {
                isCodexOpen.value = false;
                resumeBattle();
            }
            if (e.key === 'Escape' && isMonsterCodexOpen.value) {
                isMonsterCodexOpen.value = false;
            }
        });
        // [ /CODEX - GLOBAL EVENTS ]

        const loadGameData = async () => {

            try {

                const res = await fetch(`assets/data/skills.v1.json?v=${appVersion.value}`);

                if (res.ok) {

                    SKILLS.value = await res.json();

                    const skillsMap = {};

                    SKILLS.value.forEach(s => skillsMap[s.id] = s);

                    skillsAll.value = skillsMap;

                }

            } catch (e) { }

            try {

                const res = await fetch(`assets/data/spirits.v1.json?v=${appVersion.value}`);

                if (res.ok) {

                    SPIRITS.value = await res.json();

                    const spiritMap = {};

                    SPIRITS.value.forEach(spirit => {
                        if (spirit?.skillId) spiritMap[spirit.skillId] = spirit;
                    });

                    spiritsBySkillId.value = spiritMap;

                }

            } catch (e) {
                SPIRITS.value = [];
                spiritsBySkillId.value = {};
            }

            try {

                const res = await fetch(`assets/data/levels.v1.json?v=${appVersion.value}`);

                if (res.ok) {

                    const data = await res.json();

                    const mappedLevels = {};

                    data.forEach((lvl, idx) => {

                        const lvNum = idx + 1;

                        const config = {

                            ...lvl,

                            title: lvl.name,

                            blanks: lvl.blanks ?? 1

                        };

                        mappedLevels[lvNum] = config;

                    });

                    LEVEL_CONFIG.value = mappedLevels;

                    maxLevel.value = data.length;

                    const tempMap = {};

                    Object.keys(LEVEL_CONFIG.value).forEach(lvStr => {

                        const lvNum = parseInt(lvStr);

                        const unlocks = LEVEL_CONFIG.value[lvStr].unlockSkills || [];

                        unlocks.forEach(id => {

                            if (!tempMap[id]) tempMap[id] = lvNum;

                        });

                    });

                    skillUnlockMap.value = tempMap;

                    // Codex 修復：從 clearedLevels 重建 unlockedSkillIds
                    // 確保重新整頁後 Codex 仍正確顯示已解鎖條目（而非全部 🔒 未習得）
                    unlockedSkillIds.value = [];
                    clearedLevels.value.forEach(lv => {
                        const cfg = LEVEL_CONFIG.value[lv];
                        if (cfg?.unlockSkills) {
                            cfg.unlockSkills.forEach(id => {
                                if (!unlockedSkillIds.value.includes(id)) {
                                    unlockedSkillIds.value.push(id);
                                }
                            });
                        }
                    });

                }

            } catch (e) { }

            try {

                const res = await fetch(`assets/data/enemies.v1.json?v=${appVersion.value}`);

                if (res.ok) {

                    ENEMIES.value = await res.json();

                }

            } catch (e) { }

            try {
                const res = await fetch(`assets/data/mentor-dialogues.v1.json?v=${appVersion.value}`);
                if (res.ok) {
                    MENTOR_AUDIO_MAP.value = await res.json();
                }
            } catch (e) { }

        };

        loadGameData();

        const unlockedAbilityIds = ref(_pendingAbilityIds || []);

        _pendingAbilityIds = null;

        const spState = reactive(window.__sp);
        window.__sp = spState;

        const allAbilities = ref([]);

        const skillList = computed(() =>

            allAbilities.value.filter(a => unlockedAbilityIds.value.includes(a.id))

        );

        const getSkillTypeLabel = (type) => window.JPAPPCodexDisplayUtils.getSkillTypeLabel(type);
        const formatParticleBadge = (p) => window.JPAPPCodexDisplayUtils.formatParticleBadge(p);
        const formatSkillSpiritName = (s, sp) => window.JPAPPCodexDisplayUtils.formatSkillSpiritName(s, sp);
        const formatSkillMeaning = (m) => window.JPAPPCodexDisplayUtils.formatSkillMeaning(m);
        const formatSkillRule = (r) => window.JPAPPCodexDisplayUtils.formatSkillRule(r);
        const formatUnlockLevel = (l) => window.JPAPPCodexDisplayUtils.formatUnlockLevel(l);

        const isSkillOpen = ref(false);

        const pendingLevelUpAbility = ref(null);

        const isAbilityUnlockModalOpen = ref(false);

        const queuedNextLevel = ref(null);

        const abilitiesMap = {};

        fetch(`assets/data/abilities.v1.json?v=${appVersion.value}&t=${Date.now()}`)

            .then(res => res.json())

            .then(data => {

                allAbilities.value = data;

                data.forEach(s => abilitiesMap[s.id] = s);

            })

            .catch(err => console.error("Failed to load abilities", err));

        function openSkillOverlay() {
            playSfx('uiPop'); // Added feedback for skill reveal
            isSkillOpen.value = true;
        }

        function closeSkillOverlay() {
            playSfx('click');
            isSkillOpen.value = false;
        }

        const applyTurnLogic = () => {

            // Turn-based logic (JIWAJIWA, MORIMORI remain here; WAKUWAKU is consumed only by enemy attack attempts)

            // MORIMORI：SP 每回合恢復
            if (heroBuffs.morimoriTurns > 0) {
                heroBuffs.morimoriTurns--;
                if (window.regenSP) {
                    window.regenSP();
                    // 視覺回饋：藍色 +1
                    if (typeof window.spawnFloatingDamage === 'function') {
                        window.spawnFloatingDamage('player', 1, 'sp');
                    }
                }
                if (heroBuffs.morimoriTurns <= 0) {
                    heroBuffs.morimoriTurns = 0;
                    if (typeof pushBattleLog === 'function') {
                        pushBattleLog("モリモリ 效果結束（SP 恢復停止）", 'info');
                    }
                }
            }

            // JIWAJIWA：HP 每回合恢復
            if (heroBuffs.jiwajiwaTurns > 0) {
                heroBuffs.jiwajiwaTurns--;
                const healAmt = 6;
                const oldHp = player.value.hp;
                player.value.hp = Math.min(player.value.maxHp, player.value.hp + healAmt);
                const actualHeal = player.value.hp - oldHp;
                if (actualHeal > 0) {
                    pushBattleLog(`ジワジワ：恢復了 ${actualHeal} 點 HP！`, 'buff');
                    if (typeof window.spawnFloatingDamage === 'function') {
                        window.spawnFloatingDamage('player', -actualHeal);
                    }
                }
                if (heroBuffs.jiwajiwaTurns <= 0) {
                    heroBuffs.jiwajiwaTurns = 0;
                    pushBattleLog("ジワジワ 效果結束（再生停止）", 'info');
                }
            }

            updateHeroStatusBar();

            if (typeof updateMonsterStatusBar === 'function') updateMonsterStatusBar();

        };

        const grantAbilityReward = (abilityId) => {

            if (!abilityId) return null;

            if (!abilitiesMap[abilityId]) return null;

            if (unlockedAbilityIds.value.includes(abilityId)) return null;

            unlockedAbilityIds.value.push(abilityId);

            return abilitiesMap[abilityId];

        };

        // 1. 補回遺失的「技能專屬音效播放器」

        const playSkillSfx = (url) => {
            if (isMuted.value) return;
            try {
                // Skills are relatively infrequent, so we can use a fresh Audio instance per call.
                // This is more stable than MediaElementSource on clones for some browsers.
                const a = new Audio(url);
                a.crossOrigin = "anonymous";
                a.volume = sfxVolume.value * masterVolume.value;

                // If we can use the Web Audio path, connect it to the sfxGain node
                if (audioCtx.value && sfxGain.value) {
                    try {
                        const source = audioCtx.value.createMediaElementSource(a);
                        source.connect(sfxGain.value);
                    } catch (_) {
                        // Fallback to simple element playback volume
                    }
                }

                a.play().catch(e => { });
                a.onended = () => { a.src = ""; a.remove(); };
            } catch (e) { }
        };

        // 2. 原本的技能施放邏輯 (完整保留)

        const castAbility = (id) => {

            const skill = abilitiesMap[id];

            if (!skill || !canAffordSP(skill.cost) || (typeof playerDead !== 'undefined' && (playerDead.value || monsterDead.value))) return;

            // 扣除 SP

            spendSP(skill.cost);

            // 播放專屬音效 (第一段與第二段)

            const sfxBase = `assets/audio/skill/${id.toLowerCase()}`;

            playSkillSfx(`${sfxBase}.mp3`);

            setTimeout(() => playSkillSfx(`${sfxBase}2.mp3`), 1000);

            if (typeof window.spawnSkillActivationVfx === 'function') window.spawnSkillActivationVfx(id);

            // 觸發技能效果與 UI 提示

            if (id === 'ODOODO') {

                heroBuffs.enemyAtbMult = 1.3;

                heroBuffs.odoodoTurns = 3;

                showStatusToast('🐌 怪物遲緩！×3次攻擊', {

                    bg: 'rgba(163,230,53,0.92)',

                    border: '#84cc16',

                    color: '#1a2e05'

                });

                if (typeof pushBattleLog === 'function') {

                    pushBattleLog(`使用了技能：${skill.name}！怪物減速（持續 3 次攻擊）！`, 'buff');

                }

            } else if (id === 'GACHIGACHI') {

                heroBuffs.enemyDmgMult = 0.6;

                heroBuffs.gachigachiTurns = 3;

                showStatusToast('🛡️ 身體硬化！×3次攻擊', {

                    bg: 'rgba(148,163,184,0.92)',

                    border: '#94a3b8',

                    color: '#0f172a'

                });

                if (typeof pushBattleLog === 'function') {

                    pushBattleLog(`使用了技能：${skill.name}！你進入硬化狀態（抵禦 3 次攻擊）！`, 'buff');

                }

            } else if (id === 'UTOUTO') {

                heroBuffs.monsterSleep = true;

                showStatusToast('💤 怪物睡著了！', {

                    bg: 'rgba(168,85,247,0.92)',

                    border: '#c084fc',

                    color: '#1e0a2e'

                });

                if (typeof pushBattleLog === 'function') {

                    pushBattleLog(`使用了技能：${skill.name}！怪物睡著了（玩家攻擊必定命中）！`, 'buff');

                }

            } else if (id === 'GIRAGIRA') {
                heroBuffs.giragiraTurns = 3;

                if (typeof updateHeroStatusBar === 'function') updateHeroStatusBar();
                showStatusToast('✨ 鋒芒畢露！傷害提高 50%！', {
                    bg: 'rgba(251,191,36,0.92)',
                    border: '#f59e0b',
                    color: '#451a03'
                });
                if (typeof pushBattleLog === 'function') {
                    pushBattleLog("使用了 ギラギラ：3 次攻擊內傷害 +50% 且必定命中！", 'buff');
                }
            } else if (id === 'MORIMORI') {
                heroBuffs.morimoriTurns = 8;
                if (typeof updateHeroStatusBar === 'function') updateHeroStatusBar();
                showStatusToast('🍊 活力十足！SP持續恢復 ×8回合', {
                    bg: 'rgba(251,146,60,0.92)',
                    border: '#f97316',
                    color: '#431407'
                });
                if (typeof pushBattleLog === 'function') {
                    pushBattleLog(`使用了 ${skill.name}：8 回合內每回合恢復 SP +1！`, 'buff');
                }
            } else if (id === 'JIWAJIWA') {
                heroBuffs.jiwajiwaTurns = 6;
                if (typeof updateHeroStatusBar === 'function') updateHeroStatusBar();
                showStatusToast('🍃 慢慢康復！HP持續恢復 ×6回合', {
                    bg: 'rgba(34,197,94,0.92)',
                    border: '#22c55e',
                    color: '#052e16'
                });
                if (typeof pushBattleLog === 'function') {
                    pushBattleLog(`使用了 ${skill.name}：6 回合內每回合恢復 HP +6！`, 'buff');
                }
            } else if (id === 'WAKUWAKU') {
                // Refreshes to 6 enemy attack attempts; does not stack.
                refreshWakuwakuCounter(6);
                if (typeof setSpeedStatus === 'function') setSpeedStatus(25000);
                showStatusToast('⚡ 感覺輕盈！ (閃避上升)', {
                    bg: 'rgba(8,145,178,0.92)',
                    border: '#0891b2',
                    color: '#083344'
                });
                if (typeof pushBattleLog === 'function') {
                    pushBattleLog(`使用了 ${skill.name}：接下來 6 次敵方攻擊，閃避率提升到 50%！`, 'buff');
                }
            } else {

                if (typeof pushBattleLog === 'function') {

                    pushBattleLog(`使用了技能：${skill.name}！`, 'buff');

                }

            }

            // 更新畫面狀態

            updateHeroStatusBar();

            if (typeof updateMonsterStatusBar === 'function') updateMonsterStatusBar();

            if (typeof setBattleMessage === 'function') setBattleMessage(skill.name, 1600);
            if (typeof closeSkillOverlay === 'function') closeSkillOverlay();
            if (typeof resumeBattle === 'function') resumeBattle();
        };

        onMounted(() => {

            loadGameData();

            window.__initCornerMenu?.(watch, showLevelSelect, isFinished);

            // Apply HERO_VISUAL_CONFIG.map.src to map avatar images
            nextTick(() => {
                document.querySelectorAll('.map-hud-avatar-img').forEach(img => {
                    img.src = HERO_VISUAL_CONFIG.map.src;
                });
            });

        });

        // --- 遊戲核心常數 ---
        const MONSTER_HP = 100;
        const POTION_HP = 30;
        const INITIAL_POTIONS = 3;

        const BASE_MAX_DAMAGE = 20;
        const COMBO_DAMAGE_START = 5;
        const COMBO_DAMAGE_BONUS_PER_STACK = 1;
        const BOSS_PLAYER_DAMAGE_POPUP_DELAY_MS = 1200;

        const getComboMaxDamage = (combo) => {
            return BASE_MAX_DAMAGE + Math.max(0, combo - (COMBO_DAMAGE_START - 1)) * COMBO_DAMAGE_BONUS_PER_STACK;
        };

        const showLevelSelect = ref(true);

        const runAwayPressTimer = ref(null);

        const isRunAwayPressing = ref(false);

        const isMenuOpen = ref(false);

        const isAdvancedSettingsOpen = ref(false);

        const isStageRecordsOpen = ref(false);

        const isMapDropdownOpen = ref(false);

        const isMistakesOpen = ref(false);

        const isEscaping = ref(false);
        const escapeOverlayVisible = ref(false);
        const escapeOverlayOpacity = ref(0);

        // ---- [ STATE — GAME BATTLE CORE ] ----
        const player = ref({ hp: 100, maxHp: 100, exp: 0 });

        const monster = ref({ hp: MONSTER_HP, maxHp: MONSTER_HP, name: '助詞怪', size: 1 });

        const inventory = ref({ potions: INITIAL_POTIONS });

        const evasionBuffAttacksLeft = ref(0);

        const refreshWakuwakuCounter = (count = 6) => {
            const next = Math.max(0, Number(count) || 0);
            heroBuffs.wakuwakuTurns = next;
            heroBuffs.wakuwakuStacks = 0;
            evasionBuffAttacksLeft.value = next;
        };

        const consumeWakuwakuOnEnemyAttackAttempt = () => {
            if (heroBuffs.wakuwakuTurns <= 0) {
                evasionBuffAttacksLeft.value = 0;
                return false;
            }

            heroBuffs.wakuwakuTurns = Math.max(0, heroBuffs.wakuwakuTurns - 1);
            evasionBuffAttacksLeft.value = heroBuffs.wakuwakuTurns;

            if (heroBuffs.wakuwakuTurns <= 0) {
                heroBuffs.wakuwakuStacks = 0;
                if (typeof clearSpeedStatus === 'function') clearSpeedStatus();
                if (typeof pushBattleLog === 'function') pushBattleLog("ワクワク 效果結束（鬥志冷卻）", 'info');
            } else if (typeof updateHeroStatusBar === 'function') {
                updateHeroStatusBar();
            }

            return true;
        };

        const playerBlink = ref(false);

        const hpBarDanger = ref(false);

        const difficulty = ref('easy');

        const currentBg = ref(DEFAULT_IMAGE_PATHS.battleBg);

        const questions = ref([]);

        const currentIndex = ref(0);

        const userAnswers = ref([]);

        const slotFeedbacks = ref({});

        const hasSubmitted = ref(false);

        const comboCount = ref(0);

        const maxComboCount = ref(0);

        const comboPopup = ref({
            show: false,
            value: 0,
            tier: 'good',
            key: 0,
            leftPct: 72,
            topPct: 52,
        });

        let comboPopupTimer = null;

        const COMBO_POPUP_DURATION_MS = 1350;

        const getComboTier = (combo) => {
            if (combo >= 20) return 'max';
            if (combo >= 10) return 'amazing';
            if (combo >= 5) return 'great';
            return 'good';
        };

        const randomComboPopupPosition = () => {
            const isPhonePortrait =
                typeof window !== 'undefined'
                && window.matchMedia?.('(max-width: 640px) and (orientation: portrait)').matches;

            const leftSide = Math.random() < 0.5;
            const rnd = (a, b) => a + Math.random() * (b - a);
            const leftPct = leftSide ? rnd(25, 38) : rnd(62, 75);
            const topPct = isPhonePortrait ? rnd(44, 62) : rnd(42, 58);
            return { leftPct, topPct };
        };

        const showComboPopup = (combo) => {
            if (combo < 2) return;
            const { leftPct, topPct } = randomComboPopupPosition();
            comboPopup.value = {
                show: true,
                value: combo,
                tier: getComboTier(combo),
                key: Date.now(),
                leftPct,
                topPct,
            };
            if (comboPopupTimer) clearTimeout(comboPopupTimer);
            comboPopupTimer = setTimeout(() => {
                comboPopup.value = { ...comboPopup.value, show: false };
            }, COMBO_POPUP_DURATION_MS);
        };

        const currentLevel = ref(1);

        const isFinished = ref(false);

        const isDefeated = ref(false);

        const isNextBtnVisible = ref(false);

        const isCurrentCorrect = ref(false);

        const timeLeft = ref(10);

        const timeUp = ref(false);
        const battleMessage = ref('');
        let battleMessageTimer = null;

        const wrongAnswerPause = ref(false);

        const wrongAnswerPauseCountdown = ref(0);

        const mistakes = ref([]);

        const stageLog = ref([]);

        const totalQuestionsAnswered = ref(0);

        const correctAnswersAmount = ref(0);

        const earnedExp = ref(0);

        const animatedExp = ref(0);

        const battleStartedAtMs = ref(null);

        const stageClearElapsedSeconds = ref(null);

        const stageResultIsNewBest = ref(false);

        const resetStageClearMetrics = () => {
            battleStartedAtMs.value = null;
            stageClearElapsedSeconds.value = null;
            stageResultIsNewBest.value = false;
        };

        const startStageClearTimer = () => {
            battleStartedAtMs.value = Date.now();
            stageClearElapsedSeconds.value = null;
            stageResultIsNewBest.value = false;
        };

        const finishStageClearTimer = () => {
            if (!battleStartedAtMs.value) {
                stageClearElapsedSeconds.value = null;
                return null;
            }

            const elapsedMs = Math.max(0, Date.now() - battleStartedAtMs.value);
            const elapsed = elapsedMs / 1000;
            stageClearElapsedSeconds.value = Number.isFinite(elapsed) ? elapsed : null;
            return stageClearElapsedSeconds.value;
        };

        const monsterHit = ref(false);
        const monsterHitGiragira = ref(false);
        const monsterGiraKnockActive = ref(false);
        const monsterGiraKnockStyle = ref({});
        let giraKnockReleaseTimeoutId = null;
        const monsterDodge = ref(false);

        const cancelMonsterGiraKnockbackTimers = () => {

            if (giraKnockReleaseTimeoutId) {

                clearTimeout(giraKnockReleaseTimeoutId);

                giraKnockReleaseTimeoutId = null;

            }

            monsterGiraKnockActive.value = false;

            monsterGiraKnockStyle.value = {};

        };
        const monsterAttackLunge = ref(false);

        const monsterStunSeconds = ref(0); // 怪物處於受擊僵直的時間 (秒)

        const monsterHitImageFailed = ref(false); // 標記目前怪物是否缺乏 *2 受擊圖

        const monsterIsEntering = ref(false); // 正在進場
        const monsterIsDying = ref(false); // 正在播放死亡動畫

        const monsterTrulyDead = ref(false); // 動畫結束，真正從畫面移除

        const monsterResultShown = ref(false); // 結算視窗是否顯示
        const bossDeathVfxActive = ref(false); // Boss 專屬死亡演出 overlay
        const bossDeathStage = ref(0); // 1~4 對應四段演出

        const screenShake = ref(false);

        const bossScreenShake = ref(false);

        const flashOverlay = ref(false);

        const isPlayerDodging = ref(false);

        const voicePlayedForCurrentQuestion = ref(false);
        const battleFlowTimeouts = new Set();
        let bossDeathSequenceToken = 0;

        const scheduleBattleFlowTimeout = (callback, delayMs) => {
            const timeoutId = setTimeout(() => {
                battleFlowTimeouts.delete(timeoutId);
                callback();
            }, delayMs);
            battleFlowTimeouts.add(timeoutId);
            return timeoutId;
        };

        const clearBattleFlowTimeouts = () => {
            battleFlowTimeouts.forEach(clearTimeout);
            battleFlowTimeouts.clear();
            monsterHitGiragira.value = false;
            cancelMonsterGiraKnockbackTimers();
        };

        const MONSTER_DEATH_CRY_SFX_PATH = 'assets/audio/sfx/monster_death_cry.mp3';
        const BOSS_DEATH_CRY_SFX_PATH = 'assets/audio/sfx/boss_death_cry.mp3';
        const BOSS_DEATH_EXPLOSION_SFX_PATH = 'assets/audio/sfx/boss_explosion.mp3';
        const optionalSfxAvailability = new Map();

        const clearBossDeathVfxNodes = () => {
            const vfxLayer = (typeof window.getVfxLayer === 'function')
                ? window.getVfxLayer()
                : document.getElementById('global-vfx-layer');
            if (!vfxLayer) return;
            vfxLayer.querySelectorAll('[data-boss-death-vfx="1"]').forEach((node) => node.remove());
        };

        const cleanupBossDeathSequence = () => {
            bossDeathSequenceToken++;
            bossDeathVfxActive.value = false;
            bossDeathStage.value = 0;
            clearBossDeathVfxNodes();
        };

        const resetBattleOutcomePresentation = () => {
            clearBattleFlowTimeouts();
            cleanupBossDeathSequence();
        };

        const getBossDeathBurstOrigin = () => {
            const bossImageEl = document.querySelector('.monster-img-boss');
            if (bossImageEl) {
                const rect = bossImageEl.getBoundingClientRect();
                return {
                    x: rect.left + (rect.width / 2),
                    y: rect.top + (rect.height / 2),
                    width: rect.width,
                    height: rect.height
                };
            }

            const targetEl = document.querySelector('.monster-container-boss')
                || document.querySelector('.monster-breath')
                || document.getElementById('monsterStatusBar');
            if (!targetEl) {
                return { x: window.innerWidth / 2, y: window.innerHeight * 0.38, width: 220, height: 220 };
            }

            const rect = targetEl.getBoundingClientRect();
            return {
                x: rect.left + (rect.width / 2),
                y: rect.top + (rect.height * 0.52),
                width: rect.width,
                height: rect.height
            };
        };

        const playOptionalSfxIfAvailable = (name, path) => {
            if (optionalSfxAvailability.get(path) === false) return;
            if (optionalSfxAvailability.get(path) === true) {
                playSfx(name);
                return;
            }

            optionalSfxAvailability.set(path, false);
            fetch(path, { method: 'HEAD' })
                .then((res) => {
                    if (!res.ok) return;
                    optionalSfxAvailability.set(path, true);
                    playSfx(name);
                })
                .catch(() => { });
        };

        const playMonsterDeathCrySfx = () => {
            playOptionalSfxIfAvailable('monsterDeathCry', MONSTER_DEATH_CRY_SFX_PATH);
        };

        const playBossDeathCrySfx = () => {
            playSfx('bossDeathCry');
        };

        const playBossDeathExplosionSfx = () => {
            playSfx('bossExplosion');
        };

        const spawnBossDeathBurst = (burstIndex = 0) => {
            const vfxLayer = (typeof window.getVfxLayer === 'function')
                ? window.getVfxLayer()
                : document.getElementById('global-vfx-layer');
            if (!vfxLayer) return;

            const origin = getBossDeathBurstOrigin();
            const burstProfiles = [
                { spreadX: 0.035, spreadY: 0.045, sizeMin: 34, sizeMax: 44, lifeMs: 680, sparkCount: 3, ringScale: 1, coreScale: 1, sparkScale: 1, sparkDistanceMin: 14, sparkDistanceMax: 16 },
                { spreadX: 0.05, spreadY: 0.06, sizeMin: 42, sizeMax: 54, lifeMs: 760, sparkCount: 4, ringScale: 1.1, coreScale: 1.08, sparkScale: 1.05, sparkDistanceMin: 16, sparkDistanceMax: 18 },
                { spreadX: 0.04, spreadY: 0.05, sizeMin: 176, sizeMax: 216, lifeMs: 980, sparkCount: 6, ringScale: 1.72, coreScale: 2.35, sparkScale: 1.18, sparkDistanceMin: 18, sparkDistanceMax: 22 }
            ];
            const profile = burstProfiles[burstIndex % burstProfiles.length];
            const spreadX = Math.max(origin.width * profile.spreadX, 6);
            const spreadY = Math.max(origin.height * profile.spreadY, 6);
            const x = origin.x + ((Math.random() - 0.5) * spreadX * 2);
            const y = origin.y + ((Math.random() - 0.5) * spreadY * 2);
            const burst = document.createElement('div');
            const size = profile.sizeMin + Math.random() * (profile.sizeMax - profile.sizeMin);

            burst.className = currentLevel.value === 36
                ? 'boss-death-burst boss-death-burst--hidden'
                : 'boss-death-burst';
            burst.dataset.bossDeathVfx = '1';
            burst.style.left = `${x}px`;
            burst.style.top = `${y}px`;
            burst.style.width = `${size}px`;
            burst.style.height = `${size}px`;
            burst.style.setProperty('--burst-life', `${profile.lifeMs}ms`);
            burst.style.setProperty('--burst-ring-scale', `${profile.ringScale || 1}`);
            burst.style.setProperty('--burst-core-scale', `${profile.coreScale || 1}`);
            burst.style.setProperty('--burst-spark-scale', `${profile.sparkScale || 1}`);

            const ring = document.createElement('div');
            ring.className = 'boss-death-burst-ring';
            burst.appendChild(ring);

            const core = document.createElement('div');
            core.className = 'boss-death-burst-core';
            burst.appendChild(core);

            const sparkCount = profile.sparkCount;
            for (let i = 0; i < sparkCount; i++) {
                const spark = document.createElement('span');
                spark.className = 'boss-death-burst-spark';
                spark.style.setProperty('--spark-angle', `${i * (360 / sparkCount) + Math.random() * 18}deg`);
                spark.style.setProperty('--spark-distance', `${(profile.sparkDistanceMin || 14) + Math.random() * (profile.sparkDistanceMax || 16)}px`);
                spark.style.setProperty('--spark-delay', `${Math.random() * 120}ms`);
                burst.appendChild(spark);
            }

            vfxLayer.appendChild(burst);
            let removed = false;
            const removeBurst = () => {
                if (removed) return;
                removed = true;
                burst.remove();
            };
            burst.addEventListener('animationend', removeBurst, { once: true });
            scheduleBattleFlowTimeout(() => {
                removeBurst();
            }, profile.lifeMs + 220);
        };

        const startBossDeathSequence = (onComplete) => {
            cleanupBossDeathSequence();

            const sequenceToken = ++bossDeathSequenceToken;
            bossDeathVfxActive.value = true;
            bossDeathStage.value = 1;

            [6840, 7760, 8720].forEach((delayMs, index) => {
                scheduleBattleFlowTimeout(() => {
                    if (sequenceToken !== bossDeathSequenceToken) return;
                    spawnBossDeathBurst(index);
                }, delayMs);
            });

            scheduleBattleFlowTimeout(() => {
                if (sequenceToken !== bossDeathSequenceToken) return;
                playBossDeathExplosionSfx();
            }, 8720);

            scheduleBattleFlowTimeout(() => {
                if (sequenceToken !== bossDeathSequenceToken) return;
                bossDeathStage.value = 2;
            }, 1800);

            scheduleBattleFlowTimeout(() => {
                if (sequenceToken !== bossDeathSequenceToken) return;
                bossDeathStage.value = 3;
            }, 4000);

            scheduleBattleFlowTimeout(() => {
                if (sequenceToken !== bossDeathSequenceToken) return;
                bossDeathStage.value = 4;
            }, 7000);

            scheduleBattleFlowTimeout(() => {
                if (sequenceToken !== bossDeathSequenceToken) return;
                onComplete();
            }, 10000);
        };

        // ---- [ STATE — AUDIO REFS ] ----
        const audioInited = ref(false);

        const isPreloading = ref(false);

        const bgmAudio = ref(null);

        const gameOverAudio = ref(null);

        const audioCtx = ref(null);

        const masterGain = ref(null);
        const bgmGain = ref(null);
        const sfxGain = ref(null);

        const bgmVolume = ref(0.35);

        const sfxVolume = ref(1.0);

        const masterVolume = ref(1.0);

        const isMuted = ref(false);

        const audioPool = new Map();

        const bufferPool = new Map();

        const needsUserGestureToResumeBgm = ref(false);
        const isBgmSuppressed = ref(false);
        let _sfxNeedsGestureRecovery = false;
        const HTML_BGM_FALLBACK_SCALE = 0.85;
        const MOBILE_HTML_BGM_FALLBACK_SCALE = 0.4;
        const HTML_BGM_FALLBACK_CURVE = 1.6;
        const HTML_SFX_FALLBACK_BOOST = 1.35;
        const HTML_SFX_FALLBACK_CURVE = 1.2;

        let audioDebugCoreActions = {};
        const audioDebugTick = ref(0);
        const lastAudioLifecycleEvent = ref('none');
        const lastAudioGestureEvent = ref('none');
        const lastAudioContextResumeResult = ref('not run');
        const lastAudioContextResumeError = ref('');
        const lastBgmPlayResult = ref('not run');
        const lastBgmPlayError = ref('');
        const lastSfxTestResult = ref('not run');
        const lastRawAudioResult = ref('not run');
        const lastSfxRoute = ref('none');
        const lastSfxResult = ref('not run');
        const lastSfxError = ref('');
        const useHtmlAudioBgmFallback = ref(false);
        const useHtmlAudioSfxFallback = ref(false);
        const autoFallbackEnabled = ref(false);
        const autoFallbackReason = ref('none');
        const autoFallbackTime = ref('');
        const iosReturnedFromBackground = ref(false);
        const htmlBgmAudio = ref(null);
        const htmlSfxFallbackActive = new Set();
        const fallbackAudioCtx = ref(null);
        const fallbackGainNode = ref(null);
        const fallbackMediaSource = ref(null);
        const fallbackMediaSourceAudio = ref(null);
        const useFallbackGain = ref(false);
        const fallbackCtxNeedsGestureResume = ref(false);
        const lastHtmlBgmFallbackResult = ref('not run');
        const lastHtmlBgmFallbackError = ref('');
        const lastHtmlSfxFallbackResult = ref('not run');
        const lastHtmlSfxFallbackError = ref('');
        const lastFallbackGainResult = ref('not run');
        const lastFallbackGainError = ref('');
        const lastFallbackCtxLifecycleEvent = ref('none');
        const lastFallbackCtxResumeResult = ref('not run');
        const lastFallbackCtxResumeError = ref('');
        const lastOriginalHtmlBgmUrl = ref('none');
        const lastResolvedHtmlBgmUrl = ref('none');
        const lastMobileLowBgmResult = ref('not used');
        const mobileLowBgmApplied = ref(false);
        const mobileLowBgmFallbackToOriginal = ref(false);
        if (typeof window.JPAPPAudioDebugManager?.createAudioDebugManager !== 'function') {
            window.JPAPPAudioDebugManager = {
                createAudioDebugManager: ({ vue }) => {
                    const fallbackRef = vue?.ref || ((v) => ({ value: v }));
                    const fallbackComputed = vue?.computed || ((getter) => ({ get value() { return getter(); } }));
                    const noop = () => {};
                    return {
                        isAudioDebugEnabled: fallbackRef(false),
                        isAudioDebugOpen: fallbackRef(false),
                        isAudioDebugDragging: fallbackRef(false),
                        audioDebugOverlayStyle: fallbackComputed(() => ({})),
                        audioDebugSections: fallbackComputed(() => []),
                        refreshAudioDebugState: noop,
                        startAudioDebugDrag: noop,
                        markAudioDebugEvent: noop,
                        debugResumeAudioContext: noop,
                        debugTestSfx: noop,
                        debugTestBgmPlay: noop,
                        debugPauseBgm: noop,
                        debugTestRawAudio: noop,
                        debugEnableHtmlAudioFallback: noop,
                        debugDisableHtmlAudioFallback: noop,
                        debugEnableFallbackAudioContextV2: noop,
                        debugDisableFallbackAudioContextV2: noop,
                        debugResumeFallbackAudioContext: noop,
                        debugTestFallbackContextBgm: noop,
                        debugTestFallbackBgm: noop,
                        debugTestFallbackSfx: noop,
                        debugShowAudioState: noop
                    };
                }
            };
        }
        const audioDebug = window.JPAPPAudioDebugManager.createAudioDebugManager({
            vue: { ref, computed, watch, onMounted, nextTick },
            storageManager: window.JPAPPStorageManager,
            formatAudioDebugValue: (value) => formatAudioDebugValue(value),
            getAudioDebugState: () => getAudioDebugState(),
            getActions: () => audioDebugCoreActions
        });
        const {
            isAudioDebugEnabled,
            isAudioDebugOpen,
            isAudioDebugDragging,
            audioDebugOverlayStyle,
            audioDebugSections,
            refreshAudioDebugState,
            startAudioDebugDrag,
            markAudioDebugEvent,
            debugResumeAudioContext,
            debugTestSfx,
            debugTestBgmPlay,
            debugPauseBgm,
            debugTestRawAudio,
            debugEnableHtmlAudioFallback,
            debugDisableHtmlAudioFallback,
            debugEnableFallbackAudioContextV2,
            debugDisableFallbackAudioContextV2,
            debugResumeFallbackAudioContext,
            debugTestFallbackContextBgm,
            debugTestFallbackBgm,
            debugTestFallbackSfx,
            debugShowAudioState
        } = audioDebug;
        const audioOutputFallbackMode = computed(() => (
            useFallbackGain.value ? 'fallback-audioctx-v2' :
                (useHtmlAudioBgmFallback.value || useHtmlAudioSfxFallback.value ? 'html-audio' : 'none')
        ));

        let timerId = null;

        let pauseTimerId = null;

        let questionStartTime = 0;

        let _sfxDuckTimer = null;

        let _voiceLockUntil = 0;

        let wasTimerRunning = false;

        let wasPauseTimerRunning = false;

        const startSfxDuck = (durationMs = 1800) => {

            if (!sfxGain.value || !audioCtx.value) return;

            clearTimeout(_sfxDuckTimer);

            sfxGain.value.gain.setTargetAtTime(sfxVolume.value * 0.15, audioCtx.value.currentTime, 0.05);

            _voiceLockUntil = Date.now() + durationMs;

            _sfxDuckTimer = setTimeout(() => {

                if (sfxGain.value && audioCtx.value) {

                    sfxGain.value.gain.setTargetAtTime(sfxVolume.value, audioCtx.value.currentTime, 0.2);

                }

                _voiceLockUntil = 0;

            }, durationMs);

        };

        // ---- [ BATTLE CONTROL — PAUSE / RESUME ] ----
        const pauseBattle = () => {

            wasTimerRunning = wasTimerRunning || !!timerId;

            wasPauseTimerRunning = wasPauseTimerRunning || !!pauseTimerId;

            if (timerId) { clearInterval(timerId); timerId = null; }

            if (pauseTimerId) { clearInterval(pauseTimerId); pauseTimerId = null; }

        };

        const resumeBattle = () => {

            if (isMenuOpen.value || isCodexOpen.value || isMentorModalOpen.value || isMistakesOpen.value) return;

            // NEW: Ensure battle starts if logically in battle but timer not running (e.g. after mentor/skill tutorial)

            const inBattle = !showLevelSelect.value && !isFinished.value && currentLevel.value > 0;

            if (inBattle && !timerId && !wrongAnswerPause.value && !playerDead.value && !monsterDead.value) {

                // Play pop exactly once when battle formally starts

                if (!window._battlePopPlayed) {

                    playSfx('battlePop');

                    window._battlePopPlayed = true;

                }

                timerId = setInterval(runTimerLogic, 100);

                wasTimerRunning = false;

            }

            if (wasTimerRunning && !timerId) timerId = setInterval(runTimerLogic, 100);

            if (wasPauseTimerRunning && !pauseTimerId) pauseTimerId = setInterval(runPauseTimerLogic, 1000);

            wasTimerRunning = false;

            wasPauseTimerRunning = false;

        };

        const closeCodex = () => {
            isCodexOpen.value = false;
            flippedCardId.value = null;
        };

        // ================= [ AUDIO & TTS ] =================
        const loadAudioSettings = () => {
            try {
                const obj = window.JPAPPSettingsManager.loadAudioSettings();
                if (obj && typeof obj === 'object') {
                    bgmVolume.value = obj.bgmVolume ?? bgmVolume.value;
                    sfxVolume.value = obj.sfxVolume ?? sfxVolume.value;
                    masterVolume.value = obj.masterVolume ?? masterVolume.value;
                    isMuted.value = obj.isMuted ?? isMuted.value;
                }
            } catch (e) { console.warn('[AudioSettings] load error', e); }
        };

        const saveAudioSettings = () => {
            try {
                window.JPAPPSettingsManager.saveAudioSettings({
                    bgmVolume: bgmVolume.value,
                    sfxVolume: sfxVolume.value,
                    masterVolume: masterVolume.value,
                    isMuted: isMuted.value,
                    updatedAt: new Date().toISOString()
                });
            } catch (e) { }
            updateGainVolumes();
        };

        const BGM_BASE = 'assets/audio/bgm_m4a/';

        const currentBattleBgmPick = ref(BGM_BASE + 'BGM_1.m4a');

        let lastNormalBgm = null;

        const pickBattleBgm = (level) => {

            const lv = Number(level) || parseInt(level, 10) || 1;

            const configBgm = LEVEL_CONFIG.value?.[lv]?.bgm;

            if (configBgm) {

                currentBattleBgmPick.value = BGM_BASE + configBgm;

                if (configBgm === 'BGM_boss.m4a') lastNormalBgm = null;

                return;

            }

            if (lv % 5 === 0) {

                currentBattleBgmPick.value = BGM_BASE + 'BGM_boss.m4a';

                lastNormalBgm = null;

            } else {

                const normalBgms = ['BGM_1.m4a', 'BGM_2.m4a', 'BGM_3.m4a', 'BGM_4.m4a'];

                const pool = lastNormalBgm ? normalBgms.filter(b => b !== lastNormalBgm) : normalBgms;

                const pick = pool[Math.floor(Math.random() * pool.length)];

                lastNormalBgm = pick;

            }

        };

        const preloadAllAudio = async () => {

            if (isPreloading.value) return;

            isPreloading.value = true;

            const sfxPaths = { ...(GAME_CONSTANTS.PRELOAD_SFX_PATHS || {}) };

            const criticalAssets = [BGM_BASE + 'BGM_1.m4a', BGM_BASE + 'BGM_2.m4a', BGM_BASE + 'BGM_3.m4a', BGM_BASE + 'BGM_4.m4a', BGM_BASE + 'BGM_boss.m4a', 'assets/audio/bgm_m4a/map.m4a', sfxPaths.click, sfxPaths.uiPop, sfxPaths.battlePop];

            const promises = [];

            const loadAsset = (url) => {

                if (audioPool.has(url)) return Promise.resolve();

                return new Promise((res) => {

                    const a = new Audio();

                    a.addEventListener('canplaythrough', () => res(), { once: true });

                    a.addEventListener('error', () => res(), { once: true });

                    a.src = url;

                    a.load();

                    audioPool.set(url, a);

                });

            };

            for (const url of criticalAssets) promises.push(loadAsset(url));

            for (const key in sfxPaths) promises.push(loadAsset(sfxPaths[key]));

            promises.push(loadAsset(TTS_AUDIO_BASE + 'ui_correct.mp3'));

            promises.push(loadAsset(TTS_AUDIO_BASE + 'ui_wrong.mp3'));

            try {

                const res = await fetch('assets/audio/tts/lines.json');

                if (res.ok) {

                    const lines = await res.json();

                    lines.forEach(l => {

                        const url = TTS_AUDIO_BASE + ttsKeyToFile(l.key);

                        promises.push(loadAsset(url));

                    });

                }

            } catch (e) { }

            const abilityIds = ['ODOODO', 'GACHIGACHI', 'UTOUTO', 'WAKUWAKU'];

            for (const sid of abilityIds) {

                promises.push(loadAsset(`assets/audio/skill/${sid.toLowerCase()}.mp3`));

                promises.push(loadAsset(`assets/audio/skill/${sid.toLowerCase()}2.mp3`));

            }

            const shortSfxPaths = { ...(GAME_CONSTANTS.SHORT_SFX_PATHS || {}) };

            const decodePromises = Object.entries(shortSfxPaths).map(async ([key, url]) => {

                try {

                    const resp = await fetch(url);

                    if (!resp.ok) return;

                    const arrayBuf = await resp.arrayBuffer();

                    bufferPool.set(url, arrayBuf);

                } catch (_) { }

            });

            await Promise.allSettled(decodePromises);

            isPreloading.value = false;

            const tryPreConnect = () => {

                if (!audioCtx.value || !sfxGain.value) return;

                audioPool.forEach((a, url) => {

                    if (url.includes('/bgm')) return;

                    if (!a._connected) {

                        try {

                            a.crossOrigin = 'anonymous';

                            const src = audioCtx.value.createMediaElementSource(a);

                            src.connect(sfxGain.value);

                            a._connected = true;

                        } catch (_) { }

                    }

                });

            };

            if (audioCtx.value && sfxGain.value) {

                tryPreConnect();

            } else {

                window._preConnectRetry = setTimeout(tryPreConnect, 2000);

            }

        };

        const initAudioCtx = async () => {

            if (audioCtx.value && audioCtx.value.state === 'running') return;

            try {

                if (!audioCtx.value) {

                    const AudioContext = window.AudioContext || window.webkitAudioContext;

                    audioCtx.value = new AudioContext();

                    masterGain.value = audioCtx.value.createGain();

                    bgmGain.value = audioCtx.value.createGain();

                    sfxGain.value = audioCtx.value.createGain();

                    bgmGain.value.connect(masterGain.value);

                    sfxGain.value.connect(masterGain.value);

                    masterGain.value.connect(audioCtx.value.destination);

                    updateGainVolumes();

                }

                if (audioCtx.value.state === 'suspended' || audioCtx.value.state === 'interrupted') {

                    const isUserActive = window._audioWarmedUp || (navigator.userActivation && navigator.userActivation.hasBeenActive);

                    if (isUserActive) {

                        await audioCtx.value.resume();

                    }

                }

            } catch (e) { }

        };

        const isMentorVoicePlaying = ref(false);

        let mentorVoiceRestoreTimer = null;

        const duckMapBgmForVoice = () => {

            if (mentorVoiceRestoreTimer) {

                clearTimeout(mentorVoiceRestoreTimer);

                mentorVoiceRestoreTimer = null;

            }

            isMentorVoicePlaying.value = true;

            updateGainVolumes();

        };

        const restoreMapBgmAfterVoice = () => {

            if (mentorVoiceRestoreTimer) return;

            mentorVoiceRestoreTimer = setTimeout(() => {

                isMentorVoicePlaying.value = false;

                updateGainVolumes();

                mentorVoiceRestoreTimer = null;

            }, 600);

        };

        const clampAudioVolume = (value) => window.JPAPPSettingsManager.clampVolume(value);

        const normalizeVolumeValue = (value) => window.JPAPPSettingsManager.normalizeVolumeValue(value);

        const curveVolumeValue = (value, exponent) => window.JPAPPSettingsManager.curveVolumeValue(value, exponent);

        const getNormalizedMasterVolume = () => normalizeVolumeValue(masterVolume.value);

        const getNormalizedBgmVolume = () => normalizeVolumeValue(bgmVolume.value);

        const getNormalizedSfxVolume = () => normalizeVolumeValue(sfxVolume.value);

        const getBgmUiDuckScale = () => {
            let scale = (isMenuOpen.value || isCodexOpen.value || isMonsterCodexOpen.value || isMentorModalOpen.value || isMistakesOpen.value) ? 0.35 : 1.0;

            if (isMentorVoicePlaying.value) {
                scale = (scale === 1.0) ? 0.25 : 0.15;
            }

            return scale;
        };

        const isMobileOrTabletAudioDevice = () => {
            return /iPad|iPhone|iPod|Android/i.test(navigator.userAgent) ||
                (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);
        };

        const shouldUseMobileHtmlBgmFallbackScale = () => {
            return useHtmlAudioBgmFallback.value &&
                !useFallbackGain.value &&
                isMobileOrTabletAudioDevice();
        };

        const getHtmlBgmFallbackScale = () => {
            return HTML_BGM_FALLBACK_SCALE *
                (shouldUseMobileHtmlBgmFallbackScale() ? MOBILE_HTML_BGM_FALLBACK_SCALE : 1);
        };

        const getMobileLowBgmUrl = (url) => {
            if (!url || !/\.m4a(?:$|[?#])/i.test(url)) return url;
            return url.replace(/\.m4a(?=($|[?#]))/i, '_mobile_low.m4a');
        };

        const shouldUseMobileLowBgmFile = () => {
            return useHtmlAudioBgmFallback.value &&
                !useFallbackGain.value &&
                isMobileOrTabletAudioDevice();
        };

        const resolveHtmlFallbackBgmUrl = (url) => {
            const originalUrl = url || '';
            const resolvedUrl = shouldUseMobileLowBgmFile() ? getMobileLowBgmUrl(originalUrl) : originalUrl;

            lastOriginalHtmlBgmUrl.value = originalUrl || 'none';
            lastResolvedHtmlBgmUrl.value = resolvedUrl || 'none';
            mobileLowBgmApplied.value = resolvedUrl !== originalUrl;
            if (mobileLowBgmApplied.value) {
                mobileLowBgmFallbackToOriginal.value = false;
                lastMobileLowBgmResult.value = `using mobile low @ ${new Date().toLocaleTimeString()}`;
            } else {
                lastMobileLowBgmResult.value = 'not used';
            }

            return { originalUrl, resolvedUrl };
        };

        const getOrCreateHtmlBgmAudio = () => {
            if (htmlBgmAudio.value) return htmlBgmAudio.value;

            const audio = new Audio();
            audio.preload = 'auto';
            audio.loop = true;
            audio.crossOrigin = 'anonymous';
            if ('playsInline' in audio) audio.playsInline = true;
            htmlBgmAudio.value = audio;
            applyHtmlBgmFallbackVolume(audio);
            return audio;
        };

        const getHtmlBgmFallbackVolume = () => {
            return clampAudioVolume(
                getNormalizedMasterVolume() *
                curveVolumeValue(bgmVolume.value, HTML_BGM_FALLBACK_CURVE) *
                getBgmUiDuckScale() *
                getHtmlBgmFallbackScale()
            );
        };

        const getHtmlSfxFallbackVolume = (name) => {
            return clampAudioVolume(
                getNormalizedMasterVolume() *
                curveVolumeValue(sfxVolume.value, HTML_SFX_FALLBACK_CURVE) *
                (SFX_SCALES[name] ?? 1.0) *
                HTML_SFX_FALLBACK_BOOST
            );
        };

        const applyFallbackGainVolume = () => {
            const gain = fallbackGainNode.value;
            const bgmFallbackVolume = isMuted.value ? 0 : getHtmlBgmFallbackVolume();
            if (gain?.gain) {
                gain.gain.value = bgmFallbackVolume;
            }
            return bgmFallbackVolume;
        };

        const applyHtmlBgmFallbackVolume = (audio = htmlBgmAudio.value) => {
            if (!audio) return 0;

            const bgmFallbackVolume = getHtmlBgmFallbackVolume();
            if (useFallbackGain.value && fallbackGainNode.value) {
                applyFallbackGainVolume();
                audio.volume = 1;
                audio.muted = false;
            } else {
                audio.volume = bgmFallbackVolume;
                audio.muted = isMuted.value || bgmFallbackVolume <= 0;
            }
            audio.loop = true;
            return bgmFallbackVolume;
        };

        const syncHtmlAudioFallbackVolumes = () => {
            const bgm = htmlBgmAudio.value;
            if (bgm) {
                applyHtmlBgmFallbackVolume(bgm);
            }

            if (useFallbackGain.value) {
                applyFallbackGainVolume();
            }

            htmlSfxFallbackActive.forEach((audio) => {
                try {
                    const sfxName = audio.dataset?.sfxName || '';
                    audio.volume = isMuted.value ? 0 : getHtmlSfxFallbackVolume(sfxName);
                    audio.muted = isMuted.value || audio.volume <= 0;
                } catch (_) { }
            });
        };

        const syncHtmlBgmFallbackVolume = () => {
            syncHtmlAudioFallbackVolumes();
        };

        const markFallbackCtxNeedsGestureResume = (reason = 'background') => {
            if (!useFallbackGain.value) return;

            fallbackCtxNeedsGestureResume.value = true;
            lastFallbackCtxLifecycleEvent.value = `${reason}:needs gesture resume @ ${new Date().toLocaleTimeString()}`;
            lastFallbackGainResult.value = 'needs-resume-after-background';
            refreshAudioDebugState();
        };

        const getFallbackAudioContextConstructor = () => window.AudioContext || window.webkitAudioContext;

        const tryConnectFallbackGain = async (audio = getOrCreateHtmlBgmAudio()) => {
            if (!audio) return false;

            try {
                const AudioContextCtor = getFallbackAudioContextConstructor();
                if (!AudioContextCtor) throw new Error('AudioContext is not available');

                if (fallbackMediaSource.value && fallbackMediaSourceAudio.value !== audio) {
                    throw new Error('fallback MediaElementSource is already bound to another audio element');
                }

                const ctx = fallbackAudioCtx.value || new AudioContextCtor();
                fallbackAudioCtx.value = ctx;

                const gain = fallbackGainNode.value || ctx.createGain();
                fallbackGainNode.value = gain;

                if (!fallbackGainNode.value._jpappConnected) {
                    gain.connect(ctx.destination);
                    gain._jpappConnected = true;
                }

                if (!fallbackMediaSource.value) {
                    const source = ctx.createMediaElementSource(audio);
                    source.connect(gain);
                    fallbackMediaSource.value = source;
                    fallbackMediaSourceAudio.value = audio;
                }

                useFallbackGain.value = true;
                fallbackCtxNeedsGestureResume.value = false;
                applyFallbackGainVolume();

                if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
                    await ctx.resume();
                }

                lastFallbackGainResult.value = `enabled: ${ctx.state} @ ${new Date().toLocaleTimeString()}`;
                lastFallbackGainError.value = '';
                return true;
            } catch (e) {
                const failureMessage = e?.name || e?.message || String(e);
                useFallbackGain.value = false;
                lastFallbackGainResult.value = `failed @ ${new Date().toLocaleTimeString()}`;
                lastFallbackGainError.value = failureMessage;
                if (fallbackAudioCtx.value || fallbackGainNode.value || fallbackMediaSource.value) {
                    disableFallbackGainMode(true);
                    lastFallbackGainResult.value = `failed, returned to v1 @ ${new Date().toLocaleTimeString()}`;
                    lastFallbackGainError.value = failureMessage;
                }
                applyHtmlBgmFallbackVolume(htmlBgmAudio.value || audio);
                return false;
            } finally {
                refreshAudioDebugState();
            }
        };

        const disableFallbackGainMode = (shouldRecreateHtmlAudio = true) => {
            const oldAudio = htmlBgmAudio.value;
            const oldSrc = oldAudio?.src || '';
            const oldWasPlaying = !!oldAudio && !oldAudio.paused;

            useFallbackGain.value = false;
            fallbackCtxNeedsGestureResume.value = false;

            try { fallbackMediaSource.value?.disconnect?.(); } catch (_) { }
            try { fallbackGainNode.value?.disconnect?.(); } catch (_) { }
            try { fallbackAudioCtx.value?.close?.(); } catch (_) { }

            fallbackMediaSource.value = null;
            fallbackMediaSourceAudio.value = null;
            fallbackGainNode.value = null;
            fallbackAudioCtx.value = null;

            if (shouldRecreateHtmlAudio && oldAudio) {
                try { oldAudio.pause(); } catch (_) { }
                htmlBgmAudio.value = null;

                if (oldSrc) {
                    const freshAudio = getOrCreateHtmlBgmAudio();
                    freshAudio.src = oldSrc;
                    freshAudio.loop = true;
                    applyHtmlBgmFallbackVolume(freshAudio);
                    if (oldWasPlaying && useHtmlAudioBgmFallback.value && isPageAudioAllowed()) {
                        freshAudio.play().catch(e => {
                            lastHtmlBgmFallbackError.value = e?.name || e?.message || String(e);
                        });
                    }
                }
            } else {
                applyHtmlBgmFallbackVolume(oldAudio);
            }

            lastFallbackGainResult.value = `disabled @ ${new Date().toLocaleTimeString()}`;
            lastFallbackGainError.value = '';
            refreshAudioDebugState();
        };

        const pauseHtmlBgmFallback = () => {
            try {
                if (htmlBgmAudio.value && !htmlBgmAudio.value.paused) {
                    htmlBgmAudio.value.pause();
                }
            } catch (_) { }
        };

        const playHtmlBgmFallback = async (expectedUrl, reason = 'html-bgm-fallback') => {
            if (!expectedUrl || isMuted.value || bgmVolume.value <= 0 || !isPageAudioAllowed()) {
                needsUserGestureToResumeBgm.value = !isPageAudioAllowed();
                return false;
            }

            const audio = getOrCreateHtmlBgmAudio();
            const { originalUrl, resolvedUrl } = resolveHtmlFallbackBgmUrl(expectedUrl);
            const expectedAbs = new URL(resolvedUrl, window.location.href).href;
            const originalAbs = new URL(originalUrl, window.location.href).href;

            try {
                if (bgmAudio.value && !bgmAudio.value.paused) {
                    bgmAudio.value.pause();
                }

                if (audio.src !== expectedAbs) {
                    audio.pause();
                    audio.src = expectedAbs;
                    audio.load();
                }

                applyHtmlBgmFallbackVolume(audio);
                await audio.play();
                applyHtmlBgmFallbackVolume(audio);
                lastHtmlBgmFallbackResult.value = `resolved ${reason} @ ${new Date().toLocaleTimeString()}`;
                lastHtmlBgmFallbackError.value = '';
                if (mobileLowBgmApplied.value) {
                    lastMobileLowBgmResult.value = `resolved mobile low @ ${new Date().toLocaleTimeString()}`;
                }
                needsUserGestureToResumeBgm.value = false;
                pageLoopAudioWasInterrupted = false;
                refreshAudioDebugState();
                return true;
            } catch (e) {
                if (mobileLowBgmApplied.value && audio.src !== originalAbs) {
                    try {
                        mobileLowBgmFallbackToOriginal.value = true;
                        lastMobileLowBgmResult.value = `mobile low failed, fallback original @ ${new Date().toLocaleTimeString()}`;
                        lastResolvedHtmlBgmUrl.value = originalUrl || 'none';
                        audio.pause();
                        audio.src = originalAbs;
                        audio.load();
                        applyHtmlBgmFallbackVolume(audio);
                        await audio.play();
                        applyHtmlBgmFallbackVolume(audio);
                        lastHtmlBgmFallbackResult.value = `resolved ${reason}: original fallback @ ${new Date().toLocaleTimeString()}`;
                        lastHtmlBgmFallbackError.value = '';
                        needsUserGestureToResumeBgm.value = false;
                        pageLoopAudioWasInterrupted = false;
                        refreshAudioDebugState();
                        return true;
                    } catch (fallbackError) {
                        lastMobileLowBgmResult.value = `original fallback failed @ ${new Date().toLocaleTimeString()}`;
                        lastHtmlBgmFallbackError.value = fallbackError?.name || fallbackError?.message || String(fallbackError);
                    }
                }
                lastHtmlBgmFallbackResult.value = `rejected ${reason} @ ${new Date().toLocaleTimeString()}`;
                lastHtmlBgmFallbackError.value = lastHtmlBgmFallbackError.value || e?.name || e?.message || String(e);
                needsUserGestureToResumeBgm.value = true;
                refreshAudioDebugState();
                return false;
            }
        };

        const syncHtmlBgmFallbackToExpected = async (reason = 'sync-html-bgm-fallback') => {
            if (!useHtmlAudioBgmFallback.value) return false;

            if (!isPageAudioAllowed()) {
                needsUserGestureToResumeBgm.value = true;
                return false;
            }

            const expectedUrl = getExpectedLoopBgmForCurrentState();
            if (!expectedUrl) {
                pauseHtmlBgmFallback();
                lastHtmlBgmFallbackResult.value = `paused ${reason}: no expected BGM @ ${new Date().toLocaleTimeString()}`;
                lastHtmlBgmFallbackError.value = '';
                refreshAudioDebugState();
                return false;
            }

            return playHtmlBgmFallback(expectedUrl, reason);
        };

        const resumeFallbackCtxOnGesture = async (reason = 'fallback-v2-gesture-resume') => {
            if (!useFallbackGain.value || !fallbackCtxNeedsGestureResume.value) return false;

            try {
                const ctx = fallbackAudioCtx.value;
                if (!ctx) throw new Error('fallbackAudioCtx is not available');

                if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
                    await ctx.resume();
                }

                applyFallbackGainVolume();
                fallbackCtxNeedsGestureResume.value = false;
                lastFallbackCtxResumeResult.value = `resumed-after-background: ${ctx.state} @ ${new Date().toLocaleTimeString()}`;
                lastFallbackCtxResumeError.value = '';
                lastFallbackGainResult.value = lastFallbackCtxResumeResult.value;
                lastFallbackGainError.value = '';

                await syncHtmlBgmFallbackToExpected(reason);
                refreshAudioDebugState();
                return true;
            } catch (e) {
                const errorMessage = e?.name || e?.message || String(e);
                fallbackCtxNeedsGestureResume.value = false;
                lastFallbackCtxResumeResult.value = `resume failed @ ${new Date().toLocaleTimeString()}`;
                lastFallbackCtxResumeError.value = errorMessage;

                useHtmlAudioBgmFallback.value = true;
                useHtmlAudioSfxFallback.value = false;
                disableFallbackGainMode(true);
                lastFallbackGainResult.value = `v2 resume failed, returned to v1 @ ${new Date().toLocaleTimeString()}`;
                lastFallbackGainError.value = errorMessage;
                await syncHtmlBgmFallbackToExpected('fallback-v2-resume-failed-return-v1');
                refreshAudioDebugState();
                return false;
            }
        };

        const enableHtmlAudioFallback = async (reason = 'enable-html-fallback', options = {}) => {
            useHtmlAudioBgmFallback.value = true;
            useHtmlAudioSfxFallback.value = options.enableSfxFallback === true;
            try { bgmAudio.value?.pause(); } catch (_) { }

            const v1Started = await syncHtmlBgmFallbackToExpected(`${reason}:html-v1`);

            if (!options.preferFallbackGain) {
                refreshAudioDebugState();
                return v1Started;
            }

            const connected = await tryConnectFallbackGain(getOrCreateHtmlBgmAudio());
            if (!connected) {
                useHtmlAudioBgmFallback.value = true;
                useHtmlAudioSfxFallback.value = options.enableSfxFallback === true;
                await syncHtmlBgmFallbackToExpected(`${reason}:gain-v2-failed-html-v1`);
                refreshAudioDebugState();
                return v1Started;
            }

            await syncHtmlBgmFallbackToExpected(`${reason}:gain-v2`);
            refreshAudioDebugState();
            return true;
        };

        const updateGainVolumes = () => {

            syncHtmlBgmFallbackVolume();

            if (!masterGain.value || !audioCtx.value) return;

            const cTime = audioCtx.value.currentTime || 0;

            const m = isMuted.value ? 0 : masterVolume.value;

            if (isFinite(cTime)) {

                masterGain.value.gain.setTargetAtTime(m, cTime, 0.1);

            }

            const b = bgmVolume.value;

            let bScale = getBgmUiDuckScale();

            if (isFinite(cTime)) {

                bgmGain.value.gain.setTargetAtTime(b * bScale, cTime, 0.1);

                sfxGain.value.gain.setTargetAtTime(sfxVolume.value, cTime, 0.1);

            }

        };

        /** 初始化音效池：preload SFX / BGM，建立 AudioContext 並注入 gain nodes */
        const initAudio = async () => {

            if (audioInited.value) return;

            audioInited.value = true;

            await initAudioCtx();

            try {

                let bgm = audioPool.get(BGM_BASE + 'BGM_1.m4a');

                if (!bgm) {

                    bgm = new Audio(BGM_BASE + 'BGM_1.m4a');

                    bgm.crossOrigin = "anonymous";

                    bgm.preload = "auto";

                    audioPool.set(BGM_BASE + 'BGM_1.m4a', bgm);

                    bgm.load();

                }

                bgmAudio.value = bgm;

                bgmAudio.value.loop = true;

                if (audioCtx.value && !bgm._connected) {

                    const source = audioCtx.value.createMediaElementSource(bgm);

                    source.connect(bgmGain.value);

                    bgm._connected = true;

                }

            } catch (_) { }

        };

        const stopAllAudio = () => {

            try {

                if (bgmGain.value && audioCtx.value) {

                    bgmGain.value.gain.cancelScheduledValues(audioCtx.value.currentTime);

                    bgmGain.value.gain.setValueAtTime(0, audioCtx.value.currentTime);

                }

                if (bgmAudio.value) {

                    bgmAudio.value.pause();

                    try { bgmAudio.value.currentTime = 0; } catch (_) { }

                }

                if (htmlBgmAudio.value) {

                    htmlBgmAudio.value.pause();

                    try { htmlBgmAudio.value.currentTime = 0; } catch (_) { }

                }

                htmlSfxFallbackActive.forEach((audio) => {

                    try { audio.pause(); audio.src = ''; } catch (_) { }

                });

                htmlSfxFallbackActive.clear();

                audioPool.forEach((a, url) => {

                    if (typeof url === 'string' && url.indexOf(BGM_BASE) === 0) {

                        try { a.pause(); a.currentTime = 0; } catch (_) { }

                    }

                });

            } catch (_) { }

            try {

                if (gameOverAudio.value) {

                    gameOverAudio.value.pause();

                    try { gameOverAudio.value.currentTime = 0; } catch (_) { }

                    gameOverAudio.value = null;

                }

            } catch (_) { }

        };

        const stopLoopBgmAudio = () => {

            try {

                if (bgmGain.value && audioCtx.value) {

                    bgmGain.value.gain.cancelScheduledValues(audioCtx.value.currentTime);

                    bgmGain.value.gain.setValueAtTime(0, audioCtx.value.currentTime);

                }

                if (bgmAudio.value) {

                    bgmAudio.value.pause();

                    try { bgmAudio.value.currentTime = 0; } catch (_) { }

                }

                pauseHtmlBgmFallback();

                if (htmlBgmAudio.value) {

                    try { htmlBgmAudio.value.currentTime = 0; } catch (_) { }

                }

                audioPool.forEach((a, url) => {

                    if (typeof url === 'string' && url.indexOf(BGM_BASE) === 0) {

                        try { a.pause(); a.currentTime = 0; } catch (_) { }

                    }

                });

            } catch (_) { }

        };

        const clearDefeatBgmSuppression = () => {

            if (!isDefeated.value && !isBgmSuppressed.value) return;

            isDefeated.value = false;

            isBgmSuppressed.value = false;

            needsUserGestureToResumeBgm.value = false;

            updateGainVolumes();

        };

        const defeatReturn = () => {
            const sc = document.getElementById('battleScene');
            if (sc) sc.classList.remove('grayscale-filter');
            const ov = document.getElementById('defeatOverlay');
            if (ov) ov.classList.add('hidden');
            player.value.hp = player.value.maxHp;
            resetSP();
            setHeroAvatar('neutral');
            clearSpeedStatus();
            resetStageClearMetrics();
            stopAllAudio();
            clearDefeatBgmSuppression();
            showLevelSelect.value = true;
        };

        const handleGameOver = () => {
            isDefeated.value = true;
            isBgmSuppressed.value = true; // Lock BGM after death
            needsUserGestureToResumeBgm.value = false;
            setHeroAvatar('lose');

            // 🌚 Apply grayscale filter to battle scene
            const scene = document.getElementById('battleScene');
            if (scene) scene.classList.add('grayscale-filter');

            // 💀 Show defeat overlay with manual return button
            const overlay = document.getElementById('defeatOverlay');
            if (overlay) overlay.classList.remove('hidden');

            stopLoopBgmAudio();
            clearTimer();
            if (pauseTimerId) { clearInterval(pauseTimerId); pauseTimerId = null; }
            playSfx('gameover');
        };

        const handleEscapeToMap = () => {
            if (isEscaping.value) return;
            isEscaping.value = true;

            playSfx('escape');
            escapeOverlayVisible.value = true;
            // Allow browser to perform layout with opacity:0 before transitioning to 1
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    escapeOverlayOpacity.value = 1;
                });
            });

            // Phase 1: 1s fade to black, stay 2s
            setTimeout(() => {
                // Phase 2: Middle of darkness, reset everything
                stopAllAudio();
                isMenuOpen.value = false;
                isAdvancedSettingsOpen.value = false;
                hasSubmitted.value = false;
                userAnswers.value = [];
                slotFeedbacks.value = {};

                // 🟢 FIX: Reset combat state to prevent HP carry-over
                player.value.hp = player.value.maxHp;
                resetSP();
                setHeroAvatar('neutral');
                clearSpeedStatus();

                // Return to map via standard map transition pipeline
                returnToMap();
            }, 1000 + 1000); // 1s fade + 1s buffer

            // Phase 3: Start fade back after 3s total (1s fade + 2s black)
            setTimeout(() => {
                escapeOverlayOpacity.value = 0;
            }, 3000);

            // Phase 4: Full cleanup after 4s total
            setTimeout(() => {
                escapeOverlayVisible.value = false;
                isEscaping.value = false;
            }, 4000);
        };

        const startRunAwayPress = () => {

            if (hasSubmitted.value) return;

            isRunAwayPressing.value = true;

            runAwayPressTimer.value = setTimeout(() => { playSfx('click'); handleReload(); }, 3000);

        };

        const cancelRunAwayPress = () => {

            isRunAwayPressing.value = false;

            if (runAwayPressTimer.value) { clearTimeout(runAwayPressTimer.value); runAwayPressTimer.value = null; }

        };

        const setBattleMessage = (text, ttlMs = 2000) => {
            battleMessage.value = text;
            pushBattleLog(text, 'info');

            if (battleMessageTimer) clearTimeout(battleMessageTimer);
            battleMessageTimer = setTimeout(() => {
                battleMessage.value = '';
                battleMessageTimer = null;
            }, ttlMs);
        };

        // ── iOS Safari Background Audio Guard ──
        const isIosDevice = () => {
            return /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        };

        // Returns true only when the page is visible and audio is allowed to play.
        // All BGM play/resume entry points must call this before playing.
        const isPageAudioAllowed = () => {
            return document.visibilityState === 'visible' && !document.hidden;
        };

        const warnAudioResumeState = (reason, extra = {}) => {
            console.warn('[audio resume]', {
                reason,
                visible: document.visibilityState,
                hidden: document.hidden,
                ctx: audioCtx.value?.state,
                needsBgm: needsUserGestureToResumeBgm.value,
                bgmPaused: bgmAudio.value?.paused,
                bgmMuted: bgmAudio.value?.muted,
                bgmVolume: bgmAudio.value?.volume,
                ...extra
            });
        };

        const playBgm = async () => {

            if (isBgmSuppressed.value || isDefeated.value) {
                stopLoopBgmAudio();
                return;
            }

            // Never play BGM when page is in background (iOS Safari fix)
            if (!isPageAudioAllowed()) {
                needsUserGestureToResumeBgm.value = true;
                return;
            }

            let expectedUrl = "";

            if (showMap.value && !showLevelSelect.value) {

                expectedUrl = currentMapBgm.value;

            } else {

                expectedUrl = currentBattleBgmPick.value || (BGM_BASE + 'BGM_1.m4a');

            }

            if (useHtmlAudioBgmFallback.value) {
                try { if (bgmAudio.value && !bgmAudio.value.paused) bgmAudio.value.pause(); } catch (_) { }
                await syncHtmlBgmFallbackToExpected('playBgm');
                return;
            }

            await initAudioCtx();

            if (!audioInited.value) await initAudio();

            if (audioCtx.value && (audioCtx.value.state === 'suspended' || audioCtx.value.state === 'interrupted')) await audioCtx.value.resume();

            updateGainVolumes();

            const expectedAbs = new URL(expectedUrl, window.location.href).href;

            const curSrc = bgmAudio.value?.src || '';

            if (bgmAudio.value && curSrc !== expectedAbs) {

                bgmAudio.value.pause();

                bgmAudio.value.src = expectedAbs;

                bgmAudio.value.currentTime = 0;

                bgmAudio.value.load();

            }

            if (bgmAudio.value && bgmAudio.value.paused) {

                bgmAudio.value.play().catch(e => {

                    warnAudioResumeState('bgm-play-blocked', { error: e?.name || e?.message || e });

                    needsUserGestureToResumeBgm.value = true;

                });

            }

        };

        watch(showMap, (val) => {

            if (val) playBgm();

        });

        const resumeBattleBgm = (resumeAbs) => {

            if (isBgmSuppressed.value || isDefeated.value) {
                stopLoopBgmAudio();
                return;
            }

            if (isMuted.value || bgmVolume.value <= 0) return;

            // Never resume in background (iOS Safari fix)
            if (!isPageAudioAllowed()) {
                needsUserGestureToResumeBgm.value = true;
                return;
            }

            if (useHtmlAudioBgmFallback.value) {
                syncHtmlBgmFallbackToExpected('resumeBattleBgm');
                return;
            }

            if (!bgmAudio.value) return;

            bgmAudio.value.pause();

            const curSrc = bgmAudio.value.src || '';

            if (curSrc !== resumeAbs) {

                bgmAudio.value.src = resumeAbs;

                bgmAudio.value.load();

            }

            bgmAudio.value.currentTime = 0;

            bgmAudio.value.play().catch(e => {

                warnAudioResumeState('resume-battle-bgm-blocked', { error: e?.name || e?.message || e });

                needsUserGestureToResumeBgm.value = true;

            });

        };

        watch([isMenuOpen, isCodexOpen, isMonsterCodexOpen, isMentorModalOpen, isMistakesOpen, bgmVolume, masterVolume, isMuted, sfxVolume], () => {

            updateGainVolumes();

        });

        watch(isMuted, (newVal, oldVal) => {

            if (newVal === false && oldVal === true) {

                const inBattle = !showLevelSelect.value && !isFinished.value && currentLevel.value > 0;

                if (inBattle && bgmAudio.value) {

                    const isPlaying = !bgmAudio.value.paused && bgmAudio.value.currentTime > 0;

                    if (!isPlaying) playBgm();

                }

            }

        });

        watch(() => player.value.hp, (newHp) => {
            const el = document.getElementById('heroAvatar');
            const ratio = newHp / player.value.maxHp;

            if (el && el.dataset.state !== 'hit' && el.dataset.state !== 'lose' && el.dataset.state !== 'win') {
                // Use data-driven thresholds
                let targetExpression = 'neutral';
                for (const t of HERO_VISUAL_CONFIG.thresholds) {
                    if (ratio >= t.hpPct) {
                        targetExpression = t.expression;
                        break;
                    }
                    targetExpression = t.expression; // Fallback to lower threshold
                }
                setHeroAvatar(targetExpression);
            }

            window.heroHP = newHp;
            window.heroMaxHP = player.value.maxHp;
            updateHeroStatusBar();
        });

        const isUnlockOrResultOverlayActive = () => {
            return isKnowledgeCardShowing.value ||
                !!window._afterKnowledgeCards ||
                isAbilityUnlockModalOpen.value;
        };

        const isBattleResolutionActive = () => {
            return isUnlockOrResultOverlayActive() ||
                monsterIsDying.value ||
                monsterTrulyDead.value ||
                monsterResultShown.value ||
                bossDeathVfxActive.value ||
                isNextBtnVisible.value ||
                (monster.value?.hp ?? 1) <= 0;
        };

        const getExpectedLoopBgmForCurrentState = () => {
            if (isMuted.value || bgmVolume.value <= 0 || isBgmSuppressed.value) return null;

            if (showMap.value && !showLevelSelect.value) {
                if (isUnlockOrResultOverlayActive()) return null;
                return currentMapBgm.value;
            }

            if (isBattleResolutionActive()) return null;

            const isBattleActive = !showLevelSelect.value &&
                !showMap.value &&
                !isFinished.value &&
                currentLevel.value > 0 &&
                !playerDead.value;

            if (!isBattleActive) return null;

            return currentBattleBgmPick.value || (BGM_BASE + 'BGM_1.m4a');
        };

        const shouldResumeBgmForCurrentView = () => {
            return !!getExpectedLoopBgmForCurrentState();
        };

        let lastLoopBgmResumeDiagnosticAt = 0;

        const warnLoopBgmResumeDiagnostic = (reason, extra = {}) => {
            const now = Date.now();
            if (now - lastLoopBgmResumeDiagnosticAt < 2000) return;
            lastLoopBgmResumeDiagnosticAt = now;

            warnAudioResumeState('loop-bgm-resume-diagnostic', {
                reason,
                expectedBgm: extra.expectedBgm ?? getExpectedLoopBgmForCurrentState(),
                currentBgmKey: bgmAudio.value?.src || '',
                bgmEnded: bgmAudio.value?.ended,
                bgmReadyState: bgmAudio.value?.readyState,
                unlockOrResultOverlayActive: isUnlockOrResultOverlayActive(),
                battleResolutionActive: isBattleResolutionActive(),
                pendingKnowledgeCards: pendingKnowledgeCards.value.length,
                showingKnowledgeCard: isKnowledgeCardShowing.value,
                afterKnowledgeCards: !!window._afterKnowledgeCards,
                monsterIsDying: monsterIsDying.value,
                monsterResultShown: monsterResultShown.value,
                isNextBtnVisible: isNextBtnVisible.value,
                showMap: showMap.value,
                showLevelSelect: showLevelSelect.value,
                isFinished: isFinished.value,
                currentLevel: currentLevel.value,
                monsterHp: monster.value?.hp,
                ...extra
            });
        };

        let lastBgmPlayRejectWarningAt = 0;

        const ensureBgmPlaying = async (reason, options = {}) => {

            if (!isPageAudioAllowed()) {
                needsUserGestureToResumeBgm.value = true;
                return false;
            }

            const expectedUrl = options.expectedUrl || getExpectedLoopBgmForCurrentState();

            if (!expectedUrl) return false;

            if (useHtmlAudioBgmFallback.value) {
                return syncHtmlBgmFallbackToExpected(reason);
            }

            if (!audioInited.value) await initAudio();

            if (bgmAudio.value && (bgmAudio.value.paused || options.force)) {

                const expectedAbs = new URL(expectedUrl, window.location.href).href;

                const curSrc = bgmAudio.value.src || '';

                if (curSrc !== expectedAbs) {

                    if (options.allowSourceSwitch === false) {
                        needsUserGestureToResumeBgm.value = true;
                        return false;
                    }

                    bgmAudio.value.pause();

                    bgmAudio.value.src = expectedAbs;

                    bgmAudio.value.load();

                }

                if (options.force && !bgmAudio.value.paused) {
                    bgmAudio.value.pause();
                }

                updateGainVolumes();

                try {

                    await bgmAudio.value.play();

                    needsUserGestureToResumeBgm.value = false;

                    return true;

                } catch (e) {

                    const now = Date.now();
                    if (options.warnOnBlock !== false && now - lastBgmPlayRejectWarningAt > 5000) {
                        lastBgmPlayRejectWarningAt = now;
                        warnAudioResumeState('ensure-bgm-play-blocked', {
                            reason,
                            expectedBgm: expectedUrl,
                            currentBgmKey: bgmAudio.value?.src || '',
                            bgmEnded: bgmAudio.value?.ended,
                            bgmReadyState: bgmAudio.value?.readyState,
                            error: e?.name || e?.message || e
                        });
                    }

                    needsUserGestureToResumeBgm.value = true;

                    return false;

                }

            }

            needsUserGestureToResumeBgm.value = false;

            return true;

        };

        let pageAudioResumeTimer = null;
        let pageLoopAudioWasInterrupted = false;
        let pageLoopAudioResumeGeneration = 0;

        const pausePageLoopAudio = () => {
            pageLoopAudioResumeGeneration += 1;

            if (pageAudioResumeTimer) {
                clearTimeout(pageAudioResumeTimer);
                pageAudioResumeTimer = null;
            }

            if (bgmAudio.value && !bgmAudio.value.paused) {
                bgmAudio.value.pause();
            }

            pauseHtmlBgmFallback();
            markFallbackCtxNeedsGestureResume('background');

            pageLoopAudioWasInterrupted = true;
            needsUserGestureToResumeBgm.value = true;
            _sfxNeedsGestureRecovery = true;
        };

        const tryResumePageLoopAudio = async (reason, options = {}) => {
            if (!isPageAudioAllowed()) return false;

            try {
                await initAudioCtx();

                if (audioCtx.value && (audioCtx.value.state === 'suspended' || audioCtx.value.state === 'interrupted')) {
                    await audioCtx.value.resume();
                }

                updateGainVolumes();
            } catch (e) {
                if (options.warnOnContextBlock !== false) {
                    warnAudioResumeState(`${reason}:ctx-resume-failed`, { error: e?.name || e?.message || e });
                }
            }

            const expectedBgm = getExpectedLoopBgmForCurrentState();

            if (!expectedBgm) {
                if (options.warnOnSkip && needsUserGestureToResumeBgm.value) {
                    warnLoopBgmResumeDiagnostic(`${reason}:no-expected-bgm`, { expectedBgm });
                }
                return false;
            }

            return ensureBgmPlaying(`${reason}:bgm`, {
                force: options.force === true,
                warnOnBlock: options.warnOnBlock !== false,
                allowSourceSwitch: options.allowSourceSwitch !== false,
                expectedUrl: expectedBgm
            });
        };

        const schedulePageLoopAudioResume = (reason) => {
            if (pageAudioResumeTimer) clearTimeout(pageAudioResumeTimer);
            pageAudioResumeTimer = null;
            pageLoopAudioResumeGeneration += 1;
            markAudioDebugEvent(lastAudioLifecycleEvent, `${reason}:foreground`);

            if (isIosDevice()) {
                iosReturnedFromBackground.value = true;
            }

            if (useFallbackGain.value && fallbackCtxNeedsGestureResume.value) {
                lastFallbackCtxLifecycleEvent.value = `${reason}:foreground waiting for gesture @ ${new Date().toLocaleTimeString()}`;
                refreshAudioDebugState();
            }

            if (isPageAudioAllowed() && shouldResumeBgmForCurrentView()) {
                pageLoopAudioWasInterrupted = true;
                needsUserGestureToResumeBgm.value = true;
            }
        };

        const handlePageAudioVisibilityChange = () => {
            markAudioDebugEvent(lastAudioLifecycleEvent, `visibilitychange:${document.visibilityState}`);
            if (document.hidden) {
                pausePageLoopAudio();
                return;
            }

            schedulePageLoopAudioResume('visibilitychange');
        };

        const createSfxAudioElement = (src, name) => {
            const a = new Audio(src);
            a.preload = 'auto';
            if ('playsInline' in a) a.playsInline = true;
            a.dataset.sfxName = name || '';

            // Diagnostic markers
            a._sfxKey = name || '';
            a._sfxSrc = src || '';
            a._fromSfxPool = false; // Default, will be overridden by poolers

            // Only use anonymous for remote assets if needed. For local assets on same-origin,
            // omitting it can avoid unnecessary CORS preflights which may fail on simple dev servers.
            // a.crossOrigin = "anonymous";

            a.addEventListener('error', () => {
                const errorCode = a.error?.code || 'unknown';
                // Only warn once per source to avoid flooding the debug overlay
                const warnKey = name || src || 'unknown';
                if (!a._hasWarned && !_sfxErrorLoggedKeys.has(warnKey)) {
                    _sfxErrorLoggedKeys.add(warnKey);
                    warnSfxPlayback('sfx-audio-error', {
                        sfx: name || a._sfxKey,
                        src: src || a._sfxSrc,
                        fromPool: !!a._fromSfxPool,
                        errorCode,
                        readyState: a.readyState,
                        networkState: a.networkState,
                        currentSrc: a.currentSrc || 'none'
                    });
                    a._hasWarned = true;
                }
            });
            return a;
        };

        const warmupSfx = () => {
            const warmed = [];
            WARMUP_SFX_KEYS.forEach(key => {
                const src = _uiSfxSrcMap[key];
                if (!src) return;
                const entry = ensureSfxPool(key, src);
                if (entry?.els?.length) warmed.push(`${key}:${entry.els.length}`);
            });
            window.__JPAPP_SFX_WARMUP_STATE = {
                ranAt: new Date().toISOString(),
                defaultPoolSize: SFX_POOL_SIZE,
                warmed,
                pools: Object.fromEntries(Array.from(sfxAudioPools.entries()).map(([key, entry]) => [
                    key,
                    {
                        src: entry.src,
                        count: entry.els.length,
                        readyStates: entry.els.map(audio => audio.readyState),
                        networkStates: entry.els.map(audio => audio.networkState)
                    }
                ]))
            };
            if (!window.__JPAPP_SFX_WARMUP_LOGGED) {
                window.__JPAPP_SFX_WARMUP_LOGGED = true;
                console.debug('[sfx-warmup]', window.__JPAPP_SFX_WARMUP_STATE);
            }
        };

        const markSfxElementWarmupState = (audio, state) => {
            audio._warmupState = state;
            audio._warmupStateAt = Date.now();
        };

        const loadSfxPoolElement = (audio) => {
            if (!audio || audio._warmupLoadStarted) return;
            audio._warmupLoadStarted = true;
            audio.addEventListener('loadeddata', () => markSfxElementWarmupState(audio, 'loadeddata'), { once: true });
            audio.addEventListener('canplaythrough', () => markSfxElementWarmupState(audio, 'canplaythrough'), { once: true });
            audio.addEventListener('error', () => markSfxElementWarmupState(audio, 'error'), { once: true });
            try { audio.load(); } catch (_) { }
        };

        const ensureSfxPool = (name, src = _uiSfxSrcMap[name]) => {
            if (!src) return null;
            const targetSize = getSfxPoolSize(name);
            const existing = sfxAudioPools.get(name);
            if (existing?.src === src && existing.els?.length === targetSize) return existing;

            const els = Array.from({ length: targetSize }, (_, i) => {
                const audio = createSfxAudioElement(src, name);
                audio._fromSfxPool = true;
                audio._sfxPoolKey = name;
                audio._sfxKey = name;
                audio._sfxSrc = src;
                audio.volume = clampAudioVolume(masterVolume.value * sfxVolume.value * (SFX_SCALES[name] ?? 1.0));
                // Only load the first element immediately to reduce simultaneous network requests
                if (i === 0) loadSfxPoolElement(audio);
                return audio;
            });

            const entry = { src, els, idx: 0 };
            sfxAudioPools.set(name, entry);
            audioPool.set(src, els[0]);
            return entry;
        };

        const replaceSfxPoolChannel = (entry, index, name) => {
            if (!entry?.src || !Array.isArray(entry.els)) return null;
            const next = createSfxAudioElement(entry.src, name);
            next._fromSfxPool = true;
            next._sfxPoolKey = name;
            next._sfxKey = name;
            next._sfxSrc = entry.src;
            next.volume = clampAudioVolume(masterVolume.value * sfxVolume.value * (SFX_SCALES[name] ?? 1.0));
            loadSfxPoolElement(next);
            entry.els[index] = next;
            if (index === 0) audioPool.set(entry.src, next);
            return next;
        };

        const getSfxPoolChannel = (name, src = _uiSfxSrcMap[name]) => {
            const entry = ensureSfxPool(name, src);
            if (!entry?.els?.length) return null;

            const channelIndex = entry.idx % entry.els.length;
            entry.idx = (entry.idx + 1) % entry.els.length;

            let audio = entry.els[channelIndex];
            if (audio && !audio._warmupLoadStarted) {
                // Load on demand if not already loaded
                loadSfxPoolElement(audio);
            }
            if (!audio || audio.error) {
                audio = replaceSfxPoolChannel(entry, channelIndex, name);
            }
            return audio ? { audio, entry, channelIndex } : null;
        };

        document.addEventListener("visibilitychange", handlePageAudioVisibilityChange);
        window.addEventListener('pagehide', () => {
            markAudioDebugEvent(lastAudioLifecycleEvent, 'pagehide');
            pausePageLoopAudio();
        });
        window.addEventListener('blur', () => {
            markAudioDebugEvent(lastAudioLifecycleEvent, 'blur');
            pausePageLoopAudio();
        });
        window.addEventListener('pageshow', () => schedulePageLoopAudioResume('pageshow'));
        window.addEventListener('focus', () => schedulePageLoopAudioResume('focus'));

        const _isMobileSfx = /iPad|iPhone|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 2);

        const POLY = 4;

        const _uiSfxSrcMap = { ...(GAME_CONSTANTS.UI_SFX_SRC_MAP || {}) };

        const _polyPool = new Map();

        const _sfxWarnLastAt = new Map();

        const _sfxErrorLoggedKeys = new Set();

        const SFX_POOL_SIZE = 4;

        const WARMUP_SFX_KEYS = ['click', 'uiPop', 'battlePop', 'hit', 'damage', 'damage1', 'skillpop', 'skillget'];

        const POOLED_SFX_KEYS = new Set([
            ...WARMUP_SFX_KEYS,
            'hit2', 'miss', 'potion', 'fanfare', 'monsterDeathCry', 'bossDeathCry',
            'bossExplosion', 'win', 'gameover', 'escape', 'bossClear',
            'damage2', 'damage3', 'damage4', 'damage5', 'damage6', 'damage7', 'damage8'
        ]);

        const getSfxPoolSize = (key) => {
            // Pool Size 1: Long sounds or low-frequency sounds that don't need overlapping playback
            const size1Keys = [
                'monsterDeathCry', 'bossDeathCry', 'bossExplosion', 'win', 'gameover',
                'escape', 'bossClear', 'skillget', 'fanfare', 'potion'
            ];
            if (size1Keys.includes(key)) return 1;
            return 4; // Default for repetitive sounds (hit, damage, click, etc.)
        };

        const sfxAudioPools = new Map();

        const warnSfxPlayback = (tag, payload = {}, intervalMs = 5000) => {
            const key = `${tag}:${payload.sfx || payload.src || 'global'}`;
            const now = Date.now();
            if ((now - (_sfxWarnLastAt.get(key) || 0)) < intervalMs) return;
            _sfxWarnLastAt.set(key, now);
            // Pool warmup/preload can emit transient HTMLAudio error events even when
            // actual user-triggered playback succeeds. Keep them out of warn/error lanes
            // unless explicit audio debug is enabled.
            if (tag === 'sfx-audio-error' && payload?.fromPool && !window.JPAPP_DEBUG_AUDIO) {
                return;
            }
            console.warn(`[${tag}]`, payload);
        };

        const markSfxPlaybackState = (route, result, error = '') => {
            lastSfxRoute.value = route;
            lastSfxResult.value = `${result} @ ${new Date().toLocaleTimeString()}`;
            lastSfxError.value = error || '';
            refreshAudioDebugState();
        };

        const _getOrCreatePoly = (name) => {

            if (_polyPool.has(name)) return _polyPool.get(name);

            const src = _uiSfxSrcMap[name];

            if (!src) {
                warnSfxPlayback('sfx-play-failed', { sfx: name, reason: 'missing-src' });
                return null;
            }

            const targetSize = getSfxPoolSize(name);
            const els = Array.from({ length: targetSize }, () => {
                const audio = createSfxAudioElement(src, name);
                audio._fromSfxPool = true;
                audio._sfxPoolKey = name;
                audio._sfxKey = name;
                audio._sfxSrc = src;
                loadSfxPoolElement(audio);
                return audio;
            });

            const entry = { els, idx: 0, src };

            _polyPool.set(name, entry);
            audioPool.set(src, els[0]);

            return entry;

        };

        const replacePolyChannel = (entry, index, name) => {
            if (!entry?.src || !Array.isArray(entry.els)) return null;
            const next = createSfxAudioElement(entry.src, name);
            next._fromSfxPool = true;
            next._sfxPoolKey = name;
            next._sfxKey = name;
            next._sfxSrc = entry.src;
            loadSfxPoolElement(next);
            entry.els[index] = next;
            if (index === 0) audioPool.set(entry.src, next);
            return next;
        };

        const canAttemptWebAudioSfx = (src) => {
            return !!src && !!audioCtx.value && !!bufferPool.get(src);
        };

        const playUiSfx = (name) => {

            if (!isPageAudioAllowed()) {
                needsUserGestureToResumeBgm.value = true;
                return;
            }

            if (isMuted.value) return;

            if (_voiceLockUntil > Date.now() && (name === 'damage' || name === 'miss')) return;

            const src = _uiSfxSrcMap[name];

            // After background→foreground on iOS, bypass WebAudio and poly pool (both may be broken).
            if (_sfxNeedsGestureRecovery && src) {
                playHtmlSfxFallback(name, src);
                return;
            }

            if (canAttemptWebAudioSfx(src)) {
                playSfx(name);
                return;
            }

            if (useHtmlAudioSfxFallback.value) {
                if (!src) {
                    warnSfxPlayback('sfx-play-failed', { sfx: name, reason: 'missing-src' });
                    return;
                }
                playHtmlSfxFallback(name, src);
                return;
            }

            const entry = _getOrCreatePoly(name);

            if (!entry || !entry.els?.length) {
                warnSfxPlayback('sfx-play-failed', { sfx: name, reason: 'no-available-channel' });
                return;
            }

            const channelIndex = entry.idx % entry.els.length;
            entry.idx = (entry.idx + 1) % entry.els.length;

            let a = entry.els[channelIndex];

            if (!a || a.error) {
                a = replacePolyChannel(entry, channelIndex, name);
            }

            if (!a) {
                warnSfxPlayback('sfx-play-failed', { sfx: name, reason: 'channel-create-failed' });
                return;
            }

            a.pause();

            a.currentTime = 0;

            a.volume = clampAudioVolume(masterVolume.value * sfxVolume.value * (SFX_SCALES[name] ?? 1.0));

            if (isMuted.value || a.volume <= 0) {
                warnSfxPlayback('sfx-play-failed', { sfx: name, reason: isMuted.value ? 'muted' : 'zero-volume' });
                return;
            }

            a.play().catch(e => {
                const errorMessage = e?.name || e?.message || String(e);
                warnSfxPlayback('sfx-play-failed', {
                    sfx: name,
                    src: entry.src,
                    fromPool: true,
                    readyState: a.readyState,
                    networkState: a.networkState,
                    currentSrc: a.currentSrc || 'none',
                    error: errorMessage
                });
                markSfxPlaybackState('html-poly', `rejected ${name}`, errorMessage);
                replacePolyChannel(entry, channelIndex, name);
                playHtmlSfxFallback(name, entry.src);
            });

        };

        const _prewarmUiSfx = () => { _getOrCreatePoly('hit'); _getOrCreatePoly('hit2'); _getOrCreatePoly('miss'); };

        document.addEventListener('pointerdown', _prewarmUiSfx, { once: true, capture: true });

        document.addEventListener('touchstart', _prewarmUiSfx, { once: true, capture: true, passive: true });

        const SFX_SCALES = GAME_CONSTANTS.SFX_SCALES || {};

        const playHtmlSfxFallback = (name, src) => {
            if (!src) {
                warnSfxPlayback('sfx-play-failed', { sfx: name, reason: 'missing-src' });
                return;
            }
            if (!isPageAudioAllowed()) return;
            if (isMuted.value) {
                warnSfxPlayback('sfx-play-failed', { sfx: name, reason: 'muted' });
                return;
            }

            try {
                let audio;
                const usePool = POOLED_SFX_KEYS.has(name);
                if (usePool) {
                    const pooled = getSfxPoolChannel(name, src);
                    audio = pooled?.audio;
                }

                if (!audio) {
                    audio = createSfxAudioElement(src, name);
                    audio.crossOrigin = 'anonymous';
                }
                audio.volume = getHtmlSfxFallbackVolume(name);
                audio.muted = isMuted.value || audio.volume <= 0;
                if (audio.muted || audio.volume <= 0) {
                    warnSfxPlayback('sfx-play-failed', { sfx: name, reason: 'zero-volume' });
                    return;
                }
                htmlSfxFallbackActive.add(audio);
                try {
                    audio.pause();
                    audio.currentTime = 0;
                } catch (_) { }
                audio.play().then(() => {
                    lastHtmlSfxFallbackResult.value = `resolved ${name} @ ${new Date().toLocaleTimeString()}`;
                    lastHtmlSfxFallbackError.value = '';
                    markSfxPlaybackState('html-fallback', `resolved ${name}`);
                    refreshAudioDebugState();
                }).catch(e => {
                    lastHtmlSfxFallbackResult.value = `rejected ${name} @ ${new Date().toLocaleTimeString()}`;
                    lastHtmlSfxFallbackError.value = e?.name || e?.message || String(e);
                    warnSfxPlayback('sfx-play-failed', { sfx: name, src, error: lastHtmlSfxFallbackError.value });
                    markSfxPlaybackState('html-fallback', `rejected ${name}`, lastHtmlSfxFallbackError.value);
                    htmlSfxFallbackActive.delete(audio);
                    refreshAudioDebugState();
                });
                audio.onended = () => {
                    htmlSfxFallbackActive.delete(audio);
                    // Do not clear src for pooled elements to allow reuse
                    if (!audio._fromSfxPool) {
                        audio.src = '';
                    }
                };
            } catch (e) {
                lastHtmlSfxFallbackResult.value = `failed ${name} @ ${new Date().toLocaleTimeString()}`;
                lastHtmlSfxFallbackError.value = e?.name || e?.message || String(e);
                warnSfxPlayback('sfx-play-failed', { sfx: name, src, error: lastHtmlSfxFallbackError.value });
                markSfxPlaybackState('html-fallback', `failed ${name}`, lastHtmlSfxFallbackError.value);
                refreshAudioDebugState();
            }
        };

        const playSfx = (name) => {
            if (!isPageAudioAllowed()) {
                needsUserGestureToResumeBgm.value = true;
                return;
            }

            if (_voiceLockUntil > Date.now() && (name === 'damage' || name === 'miss')) return;

            const src = _uiSfxSrcMap[name];
            if (!src) {
                warnSfxPlayback('sfx-play-failed', { sfx: name, reason: 'missing-src' });
                return;
            }

            if (isMuted.value || masterVolume.value <= 0 || sfxVolume.value <= 0) {
                warnSfxPlayback('sfx-play-failed', { sfx: name, reason: isMuted.value ? 'muted' : 'zero-volume' });
                return;
            }

            if (!audioInited.value) {
                initAudioCtx().then(() => { initAudio().then(() => playSfx(name)); });
                return;
            }

            // General SFX should not duck BGM. Voice/TTS paths handle BGM ducking separately.

            // After iOS Safari background→foreground, the WebAudio pipeline may be broken even if
            // AudioContext.state reads 'running'. Route through HTML Audio until the next user gesture
            // successfully resumes the context.
            if (_sfxNeedsGestureRecovery) {
                playHtmlSfxFallback(name, src);
                return;
            }

            const rawBuf = bufferPool.get(src);
            if (rawBuf && audioCtx.value) {
                const doPlay = () => {
                    const playDecoded = (decoded) => {
                        try {
                            const bsn = audioCtx.value.createBufferSource();
                            bsn.buffer = decoded;

                            // Normalization / Scaling
                            const scale = SFX_SCALES[name] ?? 1.0;
                            if (scale !== 1.0) {
                                const tempGain = audioCtx.value.createGain();
                                tempGain.gain.value = scale;
                                bsn.connect(tempGain);
                                tempGain.connect(sfxGain.value || masterGain.value);
                            } else {
                                bsn.connect(sfxGain.value || masterGain.value);
                            }

                            bsn.start(0);
                            markSfxPlaybackState('webaudio', `started ${name}`);
                        } catch (e) {
                            const errorMessage = e?.name || e?.message || String(e);
                            warnSfxPlayback('sfx-play-failed', { sfx: name, src, error: errorMessage });
                            markSfxPlaybackState('webaudio', `failed ${name}`, errorMessage);
                            playHtmlSfxFallback(name, src);
                        }
                    };

                    if (rawBuf instanceof AudioBuffer) {

                        playDecoded(rawBuf);

                    } else {

                        audioCtx.value.decodeAudioData(rawBuf.slice(0)).then(decoded => {

                            bufferPool.set(src, decoded);

                            playDecoded(decoded);

                        }).catch(e => {
                            const errorMessage = e?.name || e?.message || String(e);
                            warnSfxPlayback('sfx-play-failed', { sfx: name, src, reason: 'decode-failed', error: errorMessage });
                            markSfxPlaybackState('webaudio', `decode failed ${name}`, errorMessage);
                            playHtmlSfxFallback(name, src);
                        });

                    }

                };

                if (audioCtx.value.state !== 'running') {

                    audioCtx.value.resume().then(doPlay).catch((e) => {
                        const errorMessage = e?.name || e?.message || String(e);
                        warnSfxPlayback('sfx-context-not-running', { sfx: name, state: audioCtx.value?.state || 'none', error: errorMessage });
                        markSfxPlaybackState('webaudio', `ctx resume failed ${name}`, errorMessage);
                        playHtmlSfxFallback(name, src);
                    });

                } else {

                    doPlay();

                }

                return;

            }

            if (useHtmlAudioSfxFallback.value) {
                playHtmlSfxFallback(name, src);
                return;
            }

            try {
                const usePool = POOLED_SFX_KEYS.has(name);
                const pooledChannel = usePool ? getSfxPoolChannel(name, src) : null;
                const poolEntry = pooledChannel?.entry || null;
                let a = pooledChannel?.audio || audioPool.get(src);
                if (!a || a.error) {
                    if (a?.error) {
                        warnSfxPlayback('sfx-audio-error', {
                            sfx: name,
                            src,
                            fromPool: !!a._fromSfxPool,
                            errorCode: a.error.code,
                            readyState: a.readyState,
                            networkState: a.networkState,
                            currentSrc: a.currentSrc || 'none'
                        });
                    }
                    if (poolEntry) {
                        a = replaceSfxPoolChannel(poolEntry, pooledChannel.channelIndex, name);
                    } else {
                        a = createSfxAudioElement(src, name);
                        a.crossOrigin = "anonymous";
                        audioPool.set(src, a);
                    }
                }

                if (!a) return null;

                if (audioCtx.value && audioCtx.value.state !== 'running') {
                    audioCtx.value.resume().catch(e => {
                        warnSfxPlayback('sfx-context-not-running', { sfx: name, state: audioCtx.value?.state || 'none', error: e?.name || e?.message || e });
                    });
                }

                if (audioCtx.value) {
                    try {
                        if (!a._connected) {
                            const source = audioCtx.value.createMediaElementSource(a);
                            source.connect(sfxGain.value);
                            a._connected = true;
                        }
                    } catch (_) {
                        a.volume = clampAudioVolume(masterVolume.value * sfxVolume.value * (SFX_SCALES[name] ?? 1.0));
                    }
                } else {
                    a.volume = clampAudioVolume(masterVolume.value * sfxVolume.value * (SFX_SCALES[name] ?? 1.0));
                }

                a.volume = clampAudioVolume(masterVolume.value * sfxVolume.value * (SFX_SCALES[name] ?? 1.0));
                try {
                    a.pause();
                    a.currentTime = 0;
                } catch (_) { }

                a.play().then(() => {
                    markSfxPlaybackState(usePool ? 'html-pool' : 'html-audio', `started ${name}`);
                }).catch(e => {
                    const errorMessage = e?.name || e?.message || String(e);
                    warnSfxPlayback('sfx-play-failed', {
                        sfx: name,
                        src,
                        fromPool: !!a._fromSfxPool,
                        readyState: a.readyState,
                        networkState: a.networkState,
                        currentSrc: a.currentSrc || 'none',
                        error: errorMessage
                    });
                    if (poolEntry) {
                        replaceSfxPoolChannel(poolEntry, pooledChannel.channelIndex, name);
                    } else {
                        audioPool.delete(src);
                    }
                    markSfxPlaybackState(usePool ? 'html-pool' : 'html-audio', `rejected ${name}`, errorMessage);
                    playHtmlSfxFallback(name, src);
                });

                return a;
            } catch (e) { return null; }

        };

        const clearTimer = () => {

            if (timerId) { clearInterval(timerId); timerId = null; }

        };

        const handleRuneClick = (opt, isFromFlick = false) => {

            if (!isFromFlick) return;

            if (answerMode.value !== 'flick' || monsterDead.value || playerDead.value || isFinished.value || hasSubmitted.value) return;

            selectChoice(opt);

            checkAnswer();

            flickState.successOpt = opt;

            setTimeout(() => { flickState.successOpt = null; }, 400);

        };

        const FLICK_MIN_DISTANCE = 42;
        const FLICK_MIN_UPWARD_RATIO = 0.18;
        const FLICK_PROJECTILE_TRAVEL = 440;

        const getFlickClientPoint = (e) => {
            const touch = e?.changedTouches?.[0] || e?.touches?.[0];
            const x = Number.isFinite(e?.clientX) ? e.clientX : touch?.clientX;
            const y = Number.isFinite(e?.clientY) ? e.clientY : touch?.clientY;
            if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
            if (x === 0 && y === 0 && Math.hypot(flickState.startX, flickState.startY) > FLICK_MIN_DISTANCE) return false;
            return { x, y };
        };

        const updateFlickCurrentPoint = (e, isMove = false) => {
            const point = getFlickClientPoint(e);
            if (!point) return false;
            flickState.currentX = point.x;
            flickState.currentY = point.y;
            flickState.lastValidX = point.x;
            flickState.lastValidY = point.y;
            if (isMove) flickState.hasValidMove = true;
            return true;
        };

        const getFlickVisualImpactRect = (rect) => {
            const insetX = rect.width * 0.12;
            const insetY = rect.height * 0.08;
            return {
                left: rect.left + insetX,
                right: rect.right - insetX,
                top: rect.top + insetY,
                bottom: rect.bottom - insetY,
                width: Math.max(1, rect.width - (insetX * 2)),
                height: Math.max(1, rect.height - (insetY * 2))
            };
        };

        const getFlickRayRectImpact = (startPoint, dirX, dirY, rect) => {
            const expanded = {
                left: rect.left,
                right: rect.right,
                top: rect.top,
                bottom: rect.bottom
            };

            let tMin = -Infinity;
            let tMax = Infinity;

            const clipAxis = (start, dir, min, max) => {
                if (Math.abs(dir) < 0.0001) return start >= min && start <= max;
                const t1 = (min - start) / dir;
                const t2 = (max - start) / dir;
                tMin = Math.max(tMin, Math.min(t1, t2));
                tMax = Math.min(tMax, Math.max(t1, t2));
                return tMin <= tMax;
            };

            if (!clipAxis(startPoint.x, dirX, expanded.left, expanded.right)) return null;
            if (!clipAxis(startPoint.y, dirY, expanded.top, expanded.bottom)) return null;
            if (tMax < 0) return null;

            const impactT = Math.max(tMin, 0);
            return {
                x: startPoint.x + (dirX * impactT),
                y: startPoint.y + (dirY * impactT)
            };
        };

        const getFlickMonsterTarget = () => {
            const monsterEl = document.querySelector('.monster-img-boss')
                || document.querySelector('.monster-img-normal')
                || document.querySelector('img[alt="monster"]')
                || document.querySelector('.monster-breath');
            if (!monsterEl || !monsterEl.getBoundingClientRect) return null;
            const rect = monsterEl.getBoundingClientRect();
            return {
                rect,
                center: rectCenter(monsterEl)
            };
        };

        const resolveFlickShot = (startPoint, dx, dy) => {
            const distance = Math.hypot(dx, dy);
            if (distance < FLICK_MIN_DISTANCE) return null;

            const dirX = dx / distance;
            const dirY = dy / distance;
            if (dirY > -FLICK_MIN_UPWARD_RATIO) return null;

            const travel = Math.max(distance * 3.2, FLICK_PROJECTILE_TRAVEL);
            const missTargetX = Math.min(window.innerWidth - 24, Math.max(24, startPoint.x + (dirX * travel)));
            const missTargetY = Math.min(window.innerHeight - 24, Math.max(24, startPoint.y + (dirY * travel)));

            const monsterTarget = getFlickMonsterTarget();
            if (!monsterTarget?.center) return { targetX: missTargetX, targetY: missTargetY, hitsMonster: false };

            const toMonsterX = monsterTarget.center.x - startPoint.x;
            const toMonsterY = monsterTarget.center.y - startPoint.y;
            const projection = (toMonsterX * dirX) + (toMonsterY * dirY);
            if (projection <= 0) return { targetX: missTargetX, targetY: missTargetY, hitsMonster: false };

            const closestX = startPoint.x + (dirX * projection);
            const closestY = startPoint.y + (dirY * projection);
            const closestDistance = Math.hypot(monsterTarget.center.x - closestX, monsterTarget.center.y - closestY);
            const hitRadius = (Math.max(monsterTarget.rect.width, monsterTarget.rect.height) * 0.42) + 18;
            const hitsMonster = closestDistance <= hitRadius;
            if (!hitsMonster) return { targetX: missTargetX, targetY: missTargetY, hitsMonster: false };

            const impactRect = getFlickVisualImpactRect(monsterTarget.rect);
            const impactPoint = getFlickRayRectImpact(startPoint, dirX, dirY, impactRect) || {
                x: Math.min(impactRect.right, Math.max(impactRect.left, closestX)),
                y: Math.min(impactRect.bottom, Math.max(impactRect.top, closestY))
            };

            return { targetX: impactPoint.x, targetY: impactPoint.y, hitsMonster: true };
        };

        const startFlick = (e, opt) => {

            if (answerMode.value !== 'flick' || monsterDead.value || playerDead.value || isFinished.value || hasSubmitted.value) return;

            initAudioCtx();

            if (!audioInited.value) initAudio();

            resumePageAudioOnGesture();

            const startPoint = getFlickClientPoint(e);
            if (!startPoint) return;

            const el = e.currentTarget;

            el.setPointerCapture(e.pointerId);

            flickState.activeOpt = opt;

            flickState.startX = startPoint.x;

            flickState.startY = startPoint.y;

            flickState.currentX = startPoint.x;

            flickState.currentY = startPoint.y;

            flickState.lastValidX = startPoint.x;

            flickState.lastValidY = startPoint.y;

            flickState.hasValidMove = false;

            flickState.isArmed = true;

            flickState.capturedEl = el;

        };

        const moveFlick = (e) => {

            if (!flickState.isArmed) return;

            updateFlickCurrentPoint(e, true);

        };

        const endFlick = (e) => {

            if (!flickState.isArmed) return;

            if (window.primeVoiceOnGesture) window.primeVoiceOnGesture();

            let shot = null;

            if (e.type !== 'pointercancel' && e.type !== 'pointerleave') {

                const usedEventPoint = updateFlickCurrentPoint(e);
                if (!usedEventPoint) {
                    flickState.currentX = flickState.lastValidX;
                    flickState.currentY = flickState.lastValidY;
                }

                const dx = flickState.currentX - flickState.startX;

                const dy = flickState.currentY - flickState.startY;

                const opt = flickState.activeOpt;

                const originEl = flickState.capturedEl;

                const startPoint = getCenterOrFallback(originEl, flickState.startX, flickState.startY);
                shot = resolveFlickShot(startPoint, dx, dy);

                if (shot) {

                    if (e.cancelable) e.preventDefault();

                    flickState.pendingDirectionalMiss = !shot.hitsMonster;
                    const vx = shot.targetX - startPoint.x;

                    const vy = shot.targetY - startPoint.y;

                    const vlen = Math.hypot(vx, vy) || 1;

                    flickState.lastShotDirNx = vx / vlen;

                    flickState.lastShotDirNy = vy / vlen;

                    flickState.lastShotDirStored = true;

                    spawnProjectile(startPoint.x, startPoint.y, shot.targetX, shot.targetY, opt);

                    handleRuneClick(opt, true);

                }

            }

            flickState.isArmed = false;

            flickState.activeOpt = null;
            if (!shot) flickState.pendingDirectionalMiss = false;

            if (flickState.capturedEl) {

                flickState.capturedEl.releasePointerCapture(e.pointerId);

                flickState.capturedEl = null;

            }

        };

        const runTimerLogic = () => {

            if (isMentorModalOpen.value) return;

            if (isFinished.value || monsterDead.value || playerDead.value || showLevelSelect.value) {

                if (showLevelSelect.value || isFinished.value) {

                    clearTimer();

                }

                return;

            }

            if (heroBuffs.monsterSleep) {

                return;

            }

            let speedMult = 1;

            if (currentLevel.value === 36) speedMult = 1.15;

            if (monsterStunSeconds.value > 0) {
                // 每 100ms 扣除 0.1s
                monsterStunSeconds.value = Math.max(0, monsterStunSeconds.value - 0.1);
                return;
            }

            // 恢復被誤刪的 ATB 累進邏輯 (26032702)
            timeLeft.value -= (0.1 / heroBuffs.enemyAtbMult) * speedMult;

            if (timeLeft.value <= 0) {

                applyMonsterAttack();

                timeLeft.value = (monster.value?.attackIntervalMs || 10000) / 1000;

            }

        };

        // ---- [ TIMER ] ----
        const startTimer = () => {

            clearTimer();

            timeUp.value = false;

            if (isFinished.value) return;

            timeLeft.value = (monster.value?.attackIntervalMs || 10000) / 1000;

            if (!battleStartedAtMs.value && !monsterResultShown.value && !playerDead.value) {
                startStageClearTimer();
            }

            questionStartTime = Date.now();

            if (isMenuOpen.value || isCodexOpen.value) {

                wasTimerRunning = true;

            } else {

                timerId = setInterval(runTimerLogic, 100);

            }

        };

        // 預防 Boss 特殊攻擊重複播出的鎖定狀態

        let _isBossSpecialAttackPlaying = false;

        const playBossVineAttackVfx = () => {

            if (_isBossSpecialAttackPlaying) return;

            _isBossSpecialAttackPlaying = true;

            const vfxLayer = getVfxLayer();

            if (!vfxLayer) {

                _isBossSpecialAttackPlaying = false;

                return;

            }

            // 隨機分布藤蔓位置與方向

            const group = document.createElement('div');

            group.className = 'boss-vine-group';

            // 垂直藤蔓

            [20, 40, 60, 80].forEach((pos, i) => {

                const vine = document.createElement('div');

                vine.className = `boss-vfx-vine boss-vine-whip-${(i % 3) + 1}`;

                vine.style.left = `${pos}%`;

                const vw = 8 + Math.floor(Math.random() * 7);
                vine.style.width = `${vw}px`;
                const hue = Math.round(Math.random() * 16 - 6);
                if (hue !== 0) vine.style.filter = `drop-shadow(0 0 4px rgba(0,0,0,0.7)) hue-rotate(${hue}deg)`;

                group.appendChild(vine);

            });

            // 橫向藤蔓 (左右交錯)

            [30, 70].forEach((top, i) => {

                const vine = document.createElement('div');

                vine.className = `boss-vfx-vine ${i % 2 === 0 ? 'boss-vine-whip-side-left' : 'boss-vine-whip-side-right'}`;

                vine.style.top = `${top}%`;

                vine.style.left = i % 2 === 0 ? '-10%' : '110%';

                const sw = 7 + Math.floor(Math.random() * 5);
                vine.style.width = `${sw}px`;

                group.appendChild(vine);

            });

            vfxLayer.appendChild(group);

            // 震動與閃光放在藤蔓出現後一點點

            setTimeout(() => {

                bossScreenShake.value = true;

                setTimeout(() => { bossScreenShake.value = false; }, 400);

                const flash = document.createElement('div');

                flash.className = 'boss-vfx-flash';

                vfxLayer.appendChild(flash);

                setTimeout(() => { if (vfxLayer.contains(flash)) vfxLayer.removeChild(flash); }, 800);

            }, 100);

            setTimeout(() => {

                if (vfxLayer.contains(group)) vfxLayer.removeChild(group);

                _isBossSpecialAttackPlaying = false;

            }, 1200);

        };

        const playBossSmashAttackVfx = () => {

            if (_isBossSpecialAttackPlaying) return;

            _isBossSpecialAttackPlaying = true;

            const vfxLayer = getVfxLayer();

            if (!vfxLayer) {

                _isBossSpecialAttackPlaying = false;

                return;

            }

            // 修正：使用 group 容器確保特效置中，而非相對於全螢幕左上角

            const group = document.createElement('div');

            group.className = 'boss-smash-group';

            vfxLayer.appendChild(group);

            // 1. 預備動作 (Anticipation)：畫面變暗

            const anti = document.createElement('div');

            anti.className = 'boss-vfx-anticipation';

            vfxLayer.appendChild(anti);

            // 2. 延遲 400ms 後發動重擊

            setTimeout(() => {

                if (vfxLayer.contains(anti)) vfxLayer.removeChild(anti);

                // 強力震動

                bossScreenShake.value = true;

                setTimeout(() => { bossScreenShake.value = false; }, 600);

                // 核心視覺特效 - 改為加在 group 內

                const flash = document.createElement('div');

                flash.className = 'boss-vfx-flash-heavy';

                group.appendChild(flash);

                const crack = document.createElement('div');

                crack.className = 'boss-vfx-crack';

                group.appendChild(crack);

                const shockwave = document.createElement('div');

                shockwave.className = 'boss-vfx-shockwave';

                group.appendChild(shockwave);

                // 3. 餘震 (Aftershock)

                const residual = document.createElement('div');

                residual.className = 'boss-vfx-residual';

                group.appendChild(residual);

                setTimeout(() => {

                    if (vfxLayer.contains(group)) vfxLayer.removeChild(group);

                    _isBossSpecialAttackPlaying = false;

                }, 1000);

            }, 400);

        };

        const playMonsterClawAttackVfx = () => {

            if (_isBossSpecialAttackPlaying) return;

            _isBossSpecialAttackPlaying = true;

            bossScreenShake.value = true;

            setTimeout(() => { bossScreenShake.value = false; }, 400);

            const vfxLayer = getVfxLayer();

            if (!vfxLayer) {

                _isBossSpecialAttackPlaying = false;

                return;

            }

            // 1. 背景分量：亮紅閃光與衝擊白閃

            const flash = document.createElement('div');

            flash.className = 'boss-vfx-flash';

            vfxLayer.appendChild(flash);

            const impact = document.createElement('div');

            impact.className = 'boss-vfx-impact-flash';

            vfxLayer.appendChild(impact);

            // 2. 1.2 版核心：建立統一的「爪痕群組」容器

            const group = document.createElement('div');

            group.className = 'boss-claw-group';

            // 三道爪痕的相對配置 (中間為主，左右各偏移)

            const clawConfigs = [

                { offset: -65, scale: 0.85, type: 'is-side' },

                { offset: 0, scale: 1.0, type: 'is-middle' },

                { offset: 65, scale: 0.85, type: 'is-side' }

            ];

            clawConfigs.forEach(cfg => {

                const slash = document.createElement('div');

                slash.className = `boss-vfx-slash-mark ${cfg.type}`;

                // 使用相對位移，不再隨機，維持群組整齊感

                slash.style.left = `calc(50% + ${cfg.offset}px)`;

                slash.style.transform = `scale(${cfg.scale})`;

                group.appendChild(slash);

            });

            vfxLayer.appendChild(group);

            // 3. 清理：1.2 版動畫時間約 1.0s，保留一點 buffer 以確保淡出完全

            setTimeout(() => {

                if (vfxLayer.contains(flash)) vfxLayer.removeChild(flash);

                if (vfxLayer.contains(impact)) vfxLayer.removeChild(impact);

                if (vfxLayer.contains(group)) vfxLayer.removeChild(group);

                _isBossSpecialAttackPlaying = false;

            }, 1200);

        };

        // L20 ruin-guardian: 巨大石拳斜上鉤拳
        const playBossStoneFistUppercutVfx = () => {

            if (_isBossSpecialAttackPlaying) return;
            _isBossSpecialAttackPlaying = true;

            const vfxLayer = getVfxLayer();
            if (!vfxLayer) { _isBossSpecialAttackPlaying = false; return; }

            const group = document.createElement('div');
            group.className = 'boss-stone-fist-group';
            vfxLayer.appendChild(group);

            const fist = document.createElement('div');
            fist.className = 'boss-vfx-stone-fist is-attacking';

            // 目標定位在勇者區域 (畫面中下)
            fist.style.left = '50%';
            fist.style.bottom = '10%';

            group.appendChild(fist);

            // 在動畫進行到約 0.55s 時觸發命中震動 (總長 0.85s)
            setTimeout(() => {
                bossScreenShake.value = true;
                setTimeout(() => { bossScreenShake.value = false; }, 400);
            }, 550);

            setTimeout(() => {
                if (vfxLayer.contains(group)) vfxLayer.removeChild(group);
                _isBossSpecialAttackPlaying = false;
            }, 1200);

        };

        // L25 dark-knight: 虛空X字斬
        const playBossVoidCrossSlashVfx = () => {

            if (_isBossSpecialAttackPlaying) return;
            _isBossSpecialAttackPlaying = true;

            const vfxLayer = getVfxLayer();
            if (!vfxLayer) { _isBossSpecialAttackPlaying = false; return; }

            const group = document.createElement('div');
            group.className = 'boss-cross-group';
            vfxLayer.appendChild(group);

            // 前搖：黑紫 vignette
            const vignette = document.createElement('div');
            vignette.className = 'boss-vfx-void-vignette';
            group.appendChild(vignette);

            setTimeout(() => {
                // 第一刀：左上→右下 (rotate 45deg)
                const slash1 = document.createElement('div');
                slash1.className = 'boss-vfx-xslash-a';
                group.appendChild(slash1);

                // 第二刀：右上→左下 (rotate -45deg)，略延遲
                setTimeout(() => {
                    const slash2 = document.createElement('div');
                    slash2.className = 'boss-vfx-xslash-b';
                    group.appendChild(slash2);

                    // 交叉完成：震動 + 小型交點火花
                    bossScreenShake.value = true;
                    setTimeout(() => { bossScreenShake.value = false; }, 350);

                    setTimeout(() => {
                        const spark = document.createElement('div');
                        spark.className = 'boss-vfx-xslash-spark';
                        group.appendChild(spark);
                    }, 80);

                }, 130);

            }, 300);

            setTimeout(() => {
                if (vfxLayer.contains(group)) vfxLayer.removeChild(group);
                _isBossSpecialAttackPlaying = false;
            }, 1450);

        };

        // L30 crimson-throne-lord: 星辰崩壞
        const playBossStarCollapseVfx = () => {
            if (_isBossSpecialAttackPlaying) return;
            _isBossSpecialAttackPlaying = true;
            const vfxLayer = getVfxLayer();
            if (!vfxLayer) { _isBossSpecialAttackPlaying = false; return; }

            const group = document.createElement('div');
            group.className = 'boss-starcollapse-group';
            vfxLayer.appendChild(group);

            const vig = document.createElement('div');
            vig.className = 'boss-vfx-arcane-vignette';
            group.appendChild(vig);

            const ring1 = document.createElement('div');
            ring1.className = 'boss-vfx-magic-ring boss-magic-ring-outer';
            group.appendChild(ring1);

            const ring2 = document.createElement('div');
            ring2.className = 'boss-vfx-magic-ring boss-magic-ring-inner';
            group.appendChild(ring2);

            setTimeout(() => {
                bossScreenShake.value = true;
                setTimeout(() => { bossScreenShake.value = false; }, 380);

                const flash = document.createElement('div');
                flash.className = 'boss-vfx-star-flash';
                group.appendChild(flash);

                const scatter = document.createElement('div');
                scatter.className = 'boss-vfx-star-scatter';
                group.appendChild(scatter);
            }, 900);

            setTimeout(() => {
                if (vfxLayer.contains(group)) vfxLayer.removeChild(group);
                _isBossSpecialAttackPlaying = false;
            }, 1550);
        };

        // L35 celestial-throne-arbiter: 審判羽刑
        const playBossDualJudgementVfx = () => {
            if (_isBossSpecialAttackPlaying) return;
            _isBossSpecialAttackPlaying = true;
            const vfxLayer = getVfxLayer();
            if (!vfxLayer) { _isBossSpecialAttackPlaying = false; return; }

            const group = document.createElement('div');
            group.className = 'boss-featherjudge-group';
            vfxLayer.appendChild(group);

            // 上方壓迫光暈
            const vig = document.createElement('div');
            vig.className = 'boss-vfx-featherjudge-vignette';
            group.appendChild(vig);

            // 黑白雙翼展開剪影
            const wings = document.createElement('div');
            wings.className = 'boss-vfx-judge-wings';
            group.appendChild(wings);

            // 前搖後羽刃落下
            setTimeout(() => {
                const feathers = [
                    { cls: 'feather-white', delay: 0.00, x: '18%', rot: 10 },
                    { cls: 'feather-dark', delay: 0.07, x: '32%', rot: -7 },
                    { cls: 'feather-white', delay: 0.13, x: '48%', rot: 5 },
                    { cls: 'feather-dark', delay: 0.04, x: '62%', rot: -12 },
                    { cls: 'feather-white', delay: 0.10, x: '76%', rot: 8 },
                    { cls: 'feather-dark', delay: 0.02, x: '26%', rot: -5 },
                    { cls: 'feather-white', delay: 0.16, x: '56%', rot: 11 },
                ];
                feathers.forEach(fd => {
                    const f = document.createElement('div');
                    f.className = 'boss-vfx-feather ' + fd.cls;
                    f.style.left = fd.x;
                    f.style.animationDelay = fd.delay + 's';
                    f.style.setProperty('--frot', fd.rot + 'deg');
                    group.appendChild(f);
                });

                // 命中：短暫裁決閃光 + shake
                setTimeout(() => {
                    bossScreenShake.value = true;
                    setTimeout(() => { bossScreenShake.value = false; }, 320);

                    const flash = document.createElement('div');
                    flash.className = 'boss-vfx-featherjudge-flash';
                    group.appendChild(flash);
                }, 420);

            }, 280);

            setTimeout(() => {
                if (vfxLayer.contains(group)) vfxLayer.removeChild(group);
                _isBossSpecialAttackPlaying = false;
            }, 1550);
        };

        // L36 void-throne-lord: 虛無侵蝕
        const playBossVoidErosionVfx = () => {

            if (_isBossSpecialAttackPlaying) return;
            _isBossSpecialAttackPlaying = true;
            const vfxLayer = getVfxLayer();
            if (!vfxLayer) { _isBossSpecialAttackPlaying = false; return; }

            const group = document.createElement('div');
            group.className = 'boss-void-erosion-group';
            vfxLayer.appendChild(group);

            const erosion = document.createElement('div');
            erosion.className = 'boss-vfx-void-erosion';
            group.appendChild(erosion);

            const tendrils = document.createElement('div');
            tendrils.className = 'boss-vfx-void-tendrils';
            group.appendChild(tendrils);

            setTimeout(() => {
                const blackout = document.createElement('div');
                blackout.className = 'boss-vfx-void-blackout';
                group.appendChild(blackout);
            }, 500);

            // 雙段不穩震動
            setTimeout(() => {
                bossScreenShake.value = true;
                setTimeout(() => { bossScreenShake.value = false; }, 160);
                setTimeout(() => {
                    bossScreenShake.value = true;
                    setTimeout(() => { bossScreenShake.value = false; }, 280);
                }, 230);
            }, 520);

            setTimeout(() => {
                if (vfxLayer.contains(group)) vfxLayer.removeChild(group);
                _isBossSpecialAttackPlaying = false;
            }, 1600);
        };

        const runPauseTimerLogic = () => {

            wrongAnswerPauseCountdown.value--;

            if (wrongAnswerPauseCountdown.value <= 0) {

                if (pauseTimerId) { clearInterval(pauseTimerId); pauseTimerId = null; }

                wrongAnswerPause.value = false;

                const isHard = difficulty.value === 'hard';

                if (isHard && !playerDead.value) nextQuestion();

            }

        };

        const applyMonsterAttack = () => {
            monsterAttackLunge.value = true;
            setTimeout(() => { monsterAttackLunge.value = false; }, 300);

            // Buff counters based on monster attacks (State updates stay immediate)
            if (heroBuffs.odoodoTurns > 0) {
                heroBuffs.odoodoTurns--;
                if (heroBuffs.odoodoTurns <= 0) {
                    heroBuffs.odoodoTurns = 0;
                    heroBuffs.enemyAtbMult = 1.0;
                    if (typeof pushBattleLog === 'function') pushBattleLog("オドオド 效果結束（怪物速度恢復）", 'info');
                }
            }
            if (heroBuffs.gachigachiTurns > 0) {
                heroBuffs.gachigachiTurns--;
                if (heroBuffs.gachigachiTurns <= 0) {
                    heroBuffs.gachigachiTurns = 0;
                    heroBuffs.enemyDmgMult = 1.0;
                    if (typeof pushBattleLog === 'function') pushBattleLog("ガチガチ 效果結束（硬化解除）", 'info');
                }
            }

            let isMiss = Math.random() < 0.05;
            if (heroBuffs.wakuwakuTurns > 0) {
                isMiss = Math.random() < 0.50;
                consumeWakuwakuOnEnemyAttackAttempt();
            }

            // --- IMPACT SYNC: Delay damage/sfx to match lunge bottom ---
            setTimeout(() => {
                screenShake.value = true;
                setTimeout(() => { screenShake.value = false; }, 400);

                if (isMiss) {
                    isPlayerDodging.value = true;
                    setTimeout(() => { isPlayerDodging.value = false; }, 300);
                    playSfx('miss');
                    pushBattleLog(`怪物攻擊失誤！勇者閃開了！`, 'info');
                } else {
                    const isBoss = (currentLevel.value % 5 === 0) || currentLevel.value === 36;
                    if (isBoss) {
                        const mid = monster.value.id;
                        let _attackType = 'claw-default';
                        if (mid === 'man-eater-bloom') {
                            _attackType = 'vine';
                            playBossVineAttackVfx();
                            playSfx('damage1');
                        } else if (mid === 'orc-warlord') {
                            _attackType = 'smash';
                            playBossSmashAttackVfx();
                            playSfx('damage2');
                        } else if (mid === 'frost-roc') {
                            _attackType = 'claw-roc';
                            playMonsterClawAttackVfx();
                            playSfx('damage3');
                        } else if (mid === 'ruin-guardian') {
                            _attackType = 'stone-fist-uppercut';
                            playBossStoneFistUppercutVfx();
                            playSfx('damage4');
                        } else if (mid === 'dark-knight') {
                            _attackType = 'void-cross-slash';
                            playBossVoidCrossSlashVfx();
                            playSfx('damage5');
                        } else if (mid === 'crimson_throne_lord') {
                            _attackType = 'star-collapse';
                            playBossStarCollapseVfx();
                            playSfx('damage6');
                        } else if (mid === 'celestial-throne-arbiter') {
                            _attackType = 'dual-judgement';
                            playBossDualJudgementVfx();
                            playSfx('damage7');
                        } else if (mid === 'void-throne-lord') {
                            _attackType = 'void-erosion';
                            playBossVoidErosionVfx();
                            playSfx('damage8');
                        } else {
                            _attackType = 'claw-default';
                            playMonsterClawAttackVfx();
                            playSfx('damage2');
                        }
                    } else {
                        playerBlink.value = true;
                        setTimeout(() => { playerBlink.value = false; }, 500);
                        playSfx('damage');
                    }

                    let dMin = monster.value?.attackDamageMin;
                    let dMax = monster.value?.attackDamageMax;
                    if (dMin === undefined && dMax === undefined) { dMin = 10; dMax = 20; }
                    else if (dMin === undefined) dMin = dMax;
                    else if (dMax === undefined) dMax = dMin;
                    if (dMin > dMax) [dMin, dMax] = [dMax, dMin];
                    let dmg = Math.floor(Math.random() * (dMax - dMin + 1)) + dMin;
                    dmg = Math.max(1, Math.floor(dmg * heroBuffs.enemyDmgMult));

                    const applyPlayerDamageVisual = () => {
                        flashOverlay.value = true;
                        setTimeout(() => { flashOverlay.value = false; }, 300);

                        player.value.hp = Math.max(0, player.value.hp - dmg);
                        window.spawnFloatingDamage('player', dmg);
                        flashHeroHit(player.value.hp / player.value.maxHp);
                        if (player.value.hp <= 0) handleGameOver();

                        hpBarDanger.value = true;
                        setTimeout(() => { hpBarDanger.value = false; }, 500);
                    };

                    const playerDamageDelayMs = isBoss ? BOSS_PLAYER_DAMAGE_POPUP_DELAY_MS : 0;
                    if (playerDamageDelayMs > 0) {
                        setTimeout(applyPlayerDamageVisual, playerDamageDelayMs);
                    } else {
                        applyPlayerDamageVisual();
                    }
                }

                wrongAnswerPause.value = true;
                wrongAnswerPauseCountdown.value = difficulty.value === 'hard' ? 3 : 2;
                if (pauseTimerId) clearInterval(pauseTimerId);
                pauseTimerId = setInterval(runPauseTimerLogic, 1000);
            }, 100);
        };

        const loadMistakes = () => {
            mistakes.value = window.JPAPPStorageManager.loadMistakes();
        };

        const saveMistakes = () => {
            window.JPAPPStorageManager.saveMistakes(mistakes.value);
        };

        const buildQuestionLogText = (q) => {

            let displayJp = '';

            let sentenceTextBuilder = '';

            let kanaTextBuilder = '';

            (q?.segments || []).forEach(s => {

                if (s.isBlank) {

                    let ans = q.answers[s.blankIndex];

                    if (Array.isArray(ans)) ans = ans[0];

                    displayJp += `<span class="text-amber-400 font-bold underline">${ans}</span>`;

                    sentenceTextBuilder += ans;

                    kanaTextBuilder += ans;

                } else {

                    displayJp += s.text;

                    sentenceTextBuilder += s.text;

                    kanaTextBuilder += s.ruby || s.text;

                }

            });

            const cleanSentenceText = sentenceTextBuilder.replace(/[_ ]/g, '').replace(/（[^）]*）|\([^)]*\)/g, '');
            const cleanKanaText = kanaTextBuilder.replace(/[_ ]/g, '').replace(/（[^）]*）|\([^)]*\)/g, '');

            return {
                displayJp,
                sentenceText: cleanSentenceText,
                kanaText: cleanKanaText || cleanSentenceText
            };

        };

        const addMistake = () => {

            const q = currentQuestion.value;

            const questionText = buildQuestionLogText(q);

            // 3. 存入符合新版 HTML 排版的四個屬性

            const entry = {

                displayJp: questionText.displayJp,

                sentenceText: questionText.sentenceText,

                kanaText: questionText.kanaText,

                prompt: q.chinese || "",

                correct: Array.isArray(q.answers[0]) ? q.answers[0][0] : q.answers[0],

                grammarTip: q.tip || q.grammar || q.grammarTip || "",

                timestamp: new Date().toISOString(),

                levelId: currentLevel.value

            };

            mistakes.value.unshift(entry);

            saveMistakes();

        };

        const logStageQuestion = (isCorrect) => {

            const q = currentQuestion.value;

            if (!q) return;

            const questionText = buildQuestionLogText(q);

            const entry = {

                displayJp: questionText.displayJp,

                sentenceText: questionText.sentenceText,

                kanaText: questionText.kanaText,

                prompt: q.chinese || "",

                correct: Array.isArray(q.answers[0]) ? q.answers[0][0] : q.answers[0],

                grammarTip: q.tip || q.grammar || q.grammarTip || "",

                isCorrect: isCorrect,

                timestamp: new Date().toISOString(),

                order: stageLog.value.length + 1

            };

            stageLog.value.push(entry);

        };

        const playMistakeVoice = async (m) => {

            if (!m.sentenceText) return;

            initAudio();

            await speakCloudTts(m.sentenceText);

        };

        const clearMistakes = () => { mistakes.value = []; saveMistakes(); };

        // ================= [ QUESTION GENERATION ] =================
        const ALL_PARTICLES = ['は', 'が', 'を', 'に', 'で', 'へ', 'と'];

        // --- 出題比例資料化設定 ---
        // normal.newRatio: 一般關新技能題比例 (0~1)，其餘為舊題
        // boss.sameMapRatio: 魔王關同張地圖題比例，其餘為前地圖歷史題
        // hiddenBoss.tierWeights: L36 各層難度比例 [tier3, tier2, tier1]
        const QUESTION_MIX_CONFIG = {
            normal: { newRatio: 0.5 },
            boss: { sameMapRatio: 0.8 },
            hiddenBoss: { tierWeights: [0.5, 0.3, 0.2] }
        };

        // cycleFill(arr, n): 用無放回循環補齊 n 個元素（每輪內不重複）
        const cycleFill = (arr, n) => {
            if (!arr || arr.length === 0) return [];
            let res = [];
            while (res.length < n) {
                const block = [...arr].sort(() => Math.random() - 0.5);
                res.push(...block);
            }
            return res.slice(0, n);
        };

        // buildSlotBag(newRatio, total): 產生確定性比例的 'new'/'old' 序列並 shuffle
        const buildSlotBag = (newRatio, total) => {
            const newCount = Math.round(newRatio * total);
            const oldCount = total - newCount;
            const bag = [...Array(newCount).fill('new'), ...Array(oldCount).fill('old')];
            for (let i = bag.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [bag[i], bag[j]] = [bag[j], bag[i]];
            }
            return bag;
        };

        // _normalSlotBag: 每次 initGame 重新建立，pickSkillForNormalLevel 消費
        let _normalSlotBag = [];
        // _normalSlotRetrySkill: dedup retry 時保存 skillId，避免重複消費 slot bag
        let _normalSlotRetrySkill = null;
        // _forceOldNext: new skill combo 枯竭時，強制下次 pickSkillForNormalLevel 從 old pool 補位
        let _forceOldNext = false;

        const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

        const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

        // debug: window.__debugQMix() 在戰鬥中呼叫，依關卡模式輸出正確欄位
        window.__debugQMix = () => {
            const qs = questions?.value;
            if (!qs || qs.length === 0) { console.warn('[QMix] 尚無題庫'); return; }
            const lv = currentLevel?.value || 0;
            const cfg = LEVEL_CONFIG.value[lv] || {};
            const total = qs.length;

            // skill 分布（所有模式共用）
            const skillCount = {};
            qs.forEach(q => {
                const sid = q.skillId || 'FALLBACK';
                skillCount[sid] = (skillCount[sid] || 0) + 1;
            });

            // 題面重複偵測（所有模式共用）
            const fps = qs.map(q => q.segments?.map(s => s.isBlank ? '□' : s.text).join('') || '');
            const dupCount = fps.length - new Set(fps).size;

            const pct = (n) => `${n}(${(n / total * 100).toFixed(1)}%)`;

            const isL36 = cfg.skillId === 'HIDDEN_BOSS_36';
            const isBoss = !isL36 && isBossLevel(lv);

            if (isL36) {
                // L36 隱藏魔王：按 tier 歸類（與 startBossQueue 同步）
                const tier3 = new Set(['KARA_REASON', 'YORI_COMPARE', 'NI_FREQUENCY', 'DE_MATERIAL', 'TO_QUOTE', 'NI_PURPOSE', 'GA_BUT', 'TO_CONDITIONAL']);
                const tier2 = new Set(['KARA_SOURCE_START', 'MADE_LIMIT_END', 'TO_WITH', 'DE_TOOL_MEANS', 'HE_DIRECTION', 'NI_TARGET', 'NI_DESTINATION', 'MO_COMPLETE_NEGATION', 'TO_AND', 'DE_SCOPE']);
                const tier1 = new Set(['NI_TIME', 'NI_EXIST_PLACE', 'YA_AND_OTHERS', 'WA_TOPIC_BASIC', 'NO_POSSESSIVE', 'GA_INTRANSITIVE', 'WO_OBJECT_BASIC', 'DE_ACTION_PLACE', 'GA_EXIST_SUBJECT', 'MO_ALSO_BASIC']);
                let nT3 = 0, nT2 = 0, nT1 = 0, nOther = 0;
                qs.forEach(q => {
                    const sid = q.skillId || '';
                    if (tier3.has(sid)) nT3++;
                    else if (tier2.has(sid)) nT2++;
                    else if (tier1.has(sid)) nT1++;
                    else nOther++;
                });
                if (window.__DEBUG__) {
                    console.log(`[QMix] L36 (HiddenBoss) | Total:${total} Tier3:${pct(nT3)} Tier2:${pct(nT2)} Tier1:${pct(nT1)} Other:${nOther} | Dup:${dupCount}`);
                }

            } else if (isBoss) {
                // 魔王關：sameMap (lv-4 ~ lv-1) vs previousMap
                const sameMapIds = new Set();
                for (let i = lv - 4; i < lv; i++) {
                    (LEVEL_CONFIG.value[i]?.unlockSkills || []).forEach(id => sameMapIds.add(id));
                }
                let nSame = 0, nPrev = 0, nFallback = 0;
                qs.forEach(q => {
                    const sid = q.skillId || 'FALLBACK';
                    if (sid === 'FALLBACK') nFallback++;
                    else if (sameMapIds.has(sid)) nSame++;
                    else nPrev++;
                });
                if (window.__DEBUG__) {
                    console.log(`[QMix] L${lv} (Boss) | Total:${total} SameMap:${pct(nSame)} PrevMap:${pct(nPrev)} Fallback:${nFallback} | Dup:${dupCount}`);
                }

            } else {
                // 一般關：new (本關 unlockSkills) vs old
                const newIds = new Set(cfg.unlockSkills || []);
                let nNew = 0, nOld = 0, nFallback = 0;
                qs.forEach(q => {
                    const sid = q.skillId || 'FALLBACK';
                    if (sid === 'FALLBACK') nFallback++;
                    else if (newIds.has(sid)) nNew++;
                    else nOld++;
                });
                if (window.__DEBUG__) {
                    console.log(`[QMix] L${lv} (Normal) | Total:${total} New:${pct(nNew)} Old:${pct(nOld)} Fallback:${nFallback} | Dup:${dupCount}`);
                }
            }

            if (window.__DEBUG__) console.table(skillCount);
        };

        const getChoiceCountForLevel = (lv) => {
            if (lv === 1 || lv === 2) return 2;
            return (lv % 5 === 0 || lv >= 36) ? 4 : 3;
        };

        const makeChoices = (correct) => {

            const lv = currentLevel.value;
            const targetCount = getChoiceCountForLevel(lv);

            const correctArr = Array.isArray(correct) ? correct : [correct];

            let pool = ALL_PARTICLES;
            if (lv === 1 || lv === 2) {
                pool = ['は', 'の'];
            } else if (lv === 3) {
                pool = ['は', 'の', 'が'];
            } else if (lv === 4 || lv === 5) {
                pool = ['は', 'の', 'が', 'を'];
            } else if (lv === 6) {
                pool = ['は', 'の', 'が', 'を', 'へ'];
            } else if (lv === 7) {
                pool = ['は', 'の', 'が', 'を', 'へ', 'も'];
            } else if (lv === 8) {
                pool = ['は', 'の', 'が', 'を', 'へ', 'も', 'に'];
            } else if (lv === 9 || lv === 10) {
                pool = ['は', 'の', 'が', 'を', 'へ', 'も', 'に', 'と'];
            } else if (lv >= 11 && lv <= 15) {
                pool = ['は', 'の', 'が', 'を', 'へ', 'も', 'に', 'と', 'で'];
            } else if (lv === 16) {
                pool = ['は', 'の', 'が', 'を', 'へ', 'も', 'に', 'と', 'で', 'から'];
            } else if (lv >= 17 && lv <= 25) {
                pool = ['は', 'の', 'が', 'を', 'へ', 'も', 'に', 'と', 'で', 'から', 'まで'];
            } else if (lv >= 26 && lv <= 31) {
                pool = ['は', 'の', 'が', 'を', 'へ', 'も', 'に', 'と', 'で', 'から', 'まで', 'や'];
            } else if (lv >= 32 && lv <= 35) {
                pool = ['は', 'の', 'が', 'を', 'へ', 'も', 'に', 'と', 'で', 'から', 'まで', 'や', 'より'];
            }

            let wrongCandidates = pool.filter(p => !correctArr.includes(p));

            let pickedWrong = [];
            let needed = targetCount - 1;

            if (lv >= 6 && lv <= 34 && needed > 0) {
                let focusParticle = '';
                if (lv === 6) focusParticle = 'へ';
                else if (lv === 7) focusParticle = 'も';
                else if (lv === 8) focusParticle = 'に';
                else if (lv === 9) focusParticle = 'と';
                else if (lv === 11) focusParticle = 'で';
                else if (lv === 12) focusParticle = 'に';
                else if (lv === 13) focusParticle = 'が';
                else if (lv === 14) focusParticle = 'と';
                else if (lv === 16) focusParticle = 'から';
                else if (lv === 17) focusParticle = 'まで';
                else if (lv === 18) focusParticle = 'に';
                else if (lv === 19) focusParticle = 'で';
                else if (lv === 21) focusParticle = 'に';
                else if (lv === 22) focusParticle = 'が';
                else if (lv === 23) focusParticle = 'も';
                else if (lv === 24) focusParticle = 'と';
                else if (lv === 26) focusParticle = 'や';
                else if (lv === 27) focusParticle = 'で';
                else if (lv === 28) focusParticle = 'に';
                else if (lv === 29) focusParticle = 'と';
                else if (lv === 31) focusParticle = 'から';
                else if (lv === 32) focusParticle = 'より';
                else if (lv === 33) focusParticle = 'に';
                else if (lv === 34) focusParticle = 'で';

                if (focusParticle && wrongCandidates.includes(focusParticle)) {
                    // 55% chance to forcefully inject the new focus particle as a distractor
                    if (Math.random() < 0.55) {
                        pickedWrong.push(focusParticle);
                        wrongCandidates = wrongCandidates.filter(x => x !== focusParticle);
                        needed--;
                    }
                }
            }

            pickedWrong = pickedWrong.concat(shuffle(wrongCandidates).slice(0, needed));

            const picked = [correctArr[0], ...pickedWrong];

            return shuffle(picked);

        };

        const _audioUnlockTried = ref(false);

        // ── One-time AudioContext warmup (runs only on first user gesture) ──
        const unlockAudioOnce = () => {
            if (_audioUnlockTried.value) return;
            _audioUnlockTried.value = true;

            // Warm up critical SFX to reduce first-play latency
            try { warmupSfx(); } catch(e) {}

            try {
                if (!audioCtx.value) {

                    const AudioContext = window.AudioContext || window.webkitAudioContext;

                    audioCtx.value = new AudioContext();

                    masterGain.value = audioCtx.value.createGain();

                    bgmGain.value = audioCtx.value.createGain();

                    sfxGain.value = audioCtx.value.createGain();

                    bgmGain.value.connect(masterGain.value);

                    sfxGain.value.connect(masterGain.value);

                    masterGain.value.connect(audioCtx.value.destination);

                    updateGainVolumes();

                }

                if (audioCtx.value.state === 'suspended' || audioCtx.value.state === 'interrupted') {

                    audioCtx.value.resume().catch(() => { });

                }

            } catch (e) { }

            if (!window._audioWarmedUp) {

                window._audioWarmedUp = true;

                try {

                    const silentBuf = audioCtx.value.createBuffer(1, 128, audioCtx.value.sampleRate);

                    const silentSrc = audioCtx.value.createBufferSource();

                    silentSrc.buffer = silentBuf;

                    silentSrc.connect(masterGain.value);

                    silentSrc.start(0);

                } catch (_) { }

                try {

                    const dummyAudio = new Audio("data:audio/mp3;base64,//OlkAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAFAAAH8AADBQQOExUaHh8lJygqMTIzNzo9P0JFREQv");

                    dummyAudio.muted = true;

                    dummyAudio.play().then(() => { dummyAudio.pause(); dummyAudio.muted = false; }).catch(() => { });

                } catch (e) { }

            }

        };

        const formatAudioDebugValue = (value) => {
            if (value === null || value === undefined) return 'null';
            if (typeof value === 'number') return Number.isFinite(value) ? value.toFixed(3).replace(/\.?0+$/, '') : String(value);
            if (typeof value === 'boolean') return value ? 'true' : 'false';
            return String(value);
        };

        const getAudioDebugState = () => {
            audioDebugTick.value;
            const ctx = audioCtx.value;
            const bgm = bgmAudio.value;
            const htmlBgm = htmlBgmAudio.value;
            const fallbackCtx = fallbackAudioCtx.value;
            const fallbackGain = fallbackGainNode.value;
            const expectedBgm = getExpectedLoopBgmForCurrentState();
            const isBattleActive = !showLevelSelect.value &&
                !showMap.value &&
                !isFinished.value &&
                currentLevel.value > 0 &&
                !playerDead.value &&
                !isBattleResolutionActive();

            return {
                page: {
                    hidden: document.hidden,
                    visibilityState: document.visibilityState,
                    hasFocus: typeof document.hasFocus === 'function' ? document.hasFocus() : 'n/a',
                    lastLifecycle: lastAudioLifecycleEvent.value,
                    lastGesture: lastAudioGestureEvent.value,
                    needsUserGestureToResumeBgm: needsUserGestureToResumeBgm.value,
                    pageLoopAudioWasInterrupted,
                    expectedLoopBgm: expectedBgm || 'none'
                },
                context: {
                    exists: !!ctx,
                    state: ctx?.state || 'none',
                    sampleRate: ctx?.sampleRate ?? 'n/a',
                    currentTime: ctx?.currentTime ?? 'n/a',
                    baseLatency: ctx?.baseLatency ?? 'n/a',
                    outputLatency: ctx?.outputLatency ?? 'n/a',
                    lastResumeResult: lastAudioContextResumeResult.value,
                    lastResumeError: lastAudioContextResumeError.value || 'none'
                },
                bgm: {
                    exists: !!bgm,
                    src: bgm?.src || 'none',
                    currentSrc: bgm?.currentSrc || 'none',
                    paused: bgm?.paused ?? 'n/a',
                    ended: bgm?.ended ?? 'n/a',
                    readyState: bgm?.readyState ?? 'n/a',
                    networkState: bgm?.networkState ?? 'n/a',
                    currentTime: bgm?.currentTime ?? 'n/a',
                    duration: bgm?.duration ?? 'n/a',
                    playbackRate: bgm?.playbackRate ?? 'n/a',
                    muted: bgm?.muted ?? 'n/a',
                    volume: bgm?.volume ?? 'n/a',
                    loop: bgm?.loop ?? 'n/a',
                    errorCode: bgm?.error?.code || 'none',
                    currentBgmKey: bgm?.src || 'none',
                    currentMapBgm: currentMapBgm.value || 'none',
                    currentBattleBgmPick: currentBattleBgmPick.value || 'none',
                    expectedBgm: expectedBgm || 'none',
                    lastPlayResult: lastBgmPlayResult.value,
                    lastPlayError: lastBgmPlayError.value || 'none'
                },
                graph: {
                    masterGain: masterGain.value?.gain?.value ?? 'n/a',
                    bgmGain: bgmGain.value?.gain?.value ?? 'n/a',
                    sfxGain: sfxGain.value?.gain?.value ?? 'n/a',
                    bgmMediaElementSourceConnected: !!bgm?._connected,
                    bgmElementHasConnectedFlag: Object.prototype.hasOwnProperty.call(bgm || {}, '_connected'),
                    duplicateSourceGuard: bgm?._connected ? 'guarded by _connected' : 'not connected / unknown'
                },
                fallback: {
                    autoFallbackEnabled: autoFallbackEnabled.value,
                    autoFallbackReason: autoFallbackReason.value,
                    autoFallbackTime: autoFallbackTime.value,
                    currentFallbackMode: useFallbackGain.value ? 'gain-v2' : ((useHtmlAudioBgmFallback.value || useHtmlAudioSfxFallback.value) ? 'html-v1' : 'none'),
                    audioOutputFallbackMode: audioOutputFallbackMode.value,
                    useHtmlAudioBgmFallback: useHtmlAudioBgmFallback.value,
                    useHtmlAudioSfxFallback: useHtmlAudioSfxFallback.value,
                    useFallbackGain: useFallbackGain.value,
                    fallbackV2Active: useFallbackGain.value,
                    fallbackV2Available: !!getFallbackAudioContextConstructor(),
                    fallbackV2FailedReason: lastFallbackGainError.value || 'none',
                    fallbackCtxNeedsGestureResume: fallbackCtxNeedsGestureResume.value,
                    fallbackAudioCtxExists: !!fallbackCtx,
                    fallbackAudioCtxState: fallbackCtx?.state || 'none',
                    fallbackAudioCtxSampleRate: fallbackCtx?.sampleRate ?? 'n/a',
                    fallbackAudioCtxCurrentTime: fallbackCtx?.currentTime ?? 'n/a',
                    fallbackGainValue: fallbackGain?.gain?.value ?? 'n/a',
                    fallbackMediaSourceExists: !!fallbackMediaSource.value,
                    fallbackMediaSourceBoundToHtmlBgm: fallbackMediaSourceAudio.value === htmlBgm,
                    lastFallbackCtxLifecycleEvent: lastFallbackCtxLifecycleEvent.value,
                    lastFallbackCtxResumeResult: lastFallbackCtxResumeResult.value,
                    lastFallbackCtxResumeError: lastFallbackCtxResumeError.value || 'none',
                    lastFallbackGainResult: lastFallbackGainResult.value,
                    lastFallbackGainError: lastFallbackGainError.value || 'none',
                    rawMasterVolume: masterVolume.value,
                    rawBgmVolume: bgmVolume.value,
                    rawSfxVolume: sfxVolume.value,
                    normalizedMasterVolume: getNormalizedMasterVolume(),
                    normalizedBgmVolume: getNormalizedBgmVolume(),
                    normalizedSfxVolume: getNormalizedSfxVolume(),
                    effectiveHtmlBgmSliderVolume: curveVolumeValue(bgmVolume.value, HTML_BGM_FALLBACK_CURVE),
                    effectiveHtmlSfxSliderVolume: curveVolumeValue(sfxVolume.value, HTML_SFX_FALLBACK_CURVE),
                    computedHtmlBgmVolume: getHtmlBgmFallbackVolume(),
                    computedHtmlHitSfxVolume: getHtmlSfxFallbackVolume('hit'),
                    finalHtmlBgmAudioVolume: htmlBgm?.volume ?? 'n/a',
                    htmlBgmScale: HTML_BGM_FALLBACK_SCALE,
                    mobileHtmlBgmFallbackScaleApplied: shouldUseMobileHtmlBgmFallbackScale(),
                    mobileFallbackBgmScale: MOBILE_HTML_BGM_FALLBACK_SCALE,
                    effectiveHtmlBgmScale: getHtmlBgmFallbackScale(),
                    mobileLowBgmApplied: mobileLowBgmApplied.value,
                    originalHtmlBgmUrl: lastOriginalHtmlBgmUrl.value,
                    resolvedHtmlBgmUrl: lastResolvedHtmlBgmUrl.value,
                    mobileLowBgmFallbackToOriginal: mobileLowBgmFallbackToOriginal.value,
                    mobileLowBgmLoadFailed: mobileLowBgmFallbackToOriginal.value,
                    mobileLowBgmResult: lastMobileLowBgmResult.value,
                    htmlBgmCurve: HTML_BGM_FALLBACK_CURVE,
                    htmlSfxBoost: HTML_SFX_FALLBACK_BOOST,
                    htmlSfxCurve: HTML_SFX_FALLBACK_CURVE,
                    currentSfxRoute: useHtmlAudioSfxFallback.value ? 'html-fallback-enabled' : 'webaudio-preferred',
                    lastSfxRoute: lastSfxRoute.value,
                    lastSfxResult: lastSfxResult.value,
                    lastSfxError: lastSfxError.value || 'none',
                    htmlBgmExists: !!htmlBgm,
                    htmlBgmSrc: htmlBgm?.src || 'none',
                    htmlBgmCurrentSrc: htmlBgm?.currentSrc || 'none',
                    htmlBgmPaused: htmlBgm?.paused ?? 'n/a',
                    htmlBgmReadyState: htmlBgm?.readyState ?? 'n/a',
                    htmlBgmNetworkState: htmlBgm?.networkState ?? 'n/a',
                    htmlBgmCurrentTime: htmlBgm?.currentTime ?? 'n/a',
                    htmlBgmDuration: htmlBgm?.duration ?? 'n/a',
                    htmlBgmMuted: htmlBgm?.muted ?? 'n/a',
                    htmlBgmVolume: htmlBgm?.volume ?? 'n/a',
                    htmlBgmLoop: htmlBgm?.loop ?? 'n/a',
                    htmlBgmErrorCode: htmlBgm?.error?.code || 'none',
                    lastHtmlBgmResult: lastHtmlBgmFallbackResult.value,
                    lastHtmlBgmError: lastHtmlBgmFallbackError.value || 'none',
                    lastHtmlSfxResult: lastHtmlSfxFallbackResult.value,
                    lastHtmlSfxError: lastHtmlSfxFallbackError.value || 'none'
                },
                game: {
                    view: showLevelSelect.value ? 'home' : (showMap.value ? 'map' : (monsterResultShown.value ? 'result' : 'battle')),
                    inBattle: isBattleActive,
                    map: showMap.value && !showLevelSelect.value,
                    result: monsterResultShown.value,
                    unlockOrResultOverlay: isUnlockOrResultOverlayActive(),
                    knowledgeCard: isKnowledgeCardShowing.value,
                    abilityUnlock: isAbilityUnlockModalOpen.value,
                    battleResolution: isBattleResolutionActive(),
                    currentLevel: currentLevel.value,
                    enemyHp: monster.value?.hp ?? 'n/a',
                    enemyAlive: (monster.value?.hp ?? 0) > 0,
                    playerDead: playerDead.value,
                    muted: isMuted.value,
                    bgmVolume: bgmVolume.value,
                    sfxVolume: sfxVolume.value,
                    expectedLoopBgm: expectedBgm || 'none'
                },
                tests: {
                    testSfx: lastSfxTestResult.value,
                    testRawAudio: lastRawAudioResult.value,
                    fallbackBgm: lastHtmlBgmFallbackResult.value,
                    fallbackSfx: lastHtmlSfxFallbackResult.value
                }
            };
        };

        audioDebugCoreActions = {
            debugResumeAudioContext: async () => {
                try {
                    await initAudioCtx();
                    if (audioCtx.value && (audioCtx.value.state === 'suspended' || audioCtx.value.state === 'interrupted')) {
                        await audioCtx.value.resume();
                    }
                    lastAudioContextResumeResult.value = `ok: ${audioCtx.value?.state || 'none'} @ ${new Date().toLocaleTimeString()}`;
                    lastAudioContextResumeError.value = '';
                } catch (e) {
                    lastAudioContextResumeResult.value = 'failed';
                    lastAudioContextResumeError.value = e?.name || e?.message || String(e);
                }
            },
            debugTestSfx: () => {
                try {
                    playSfx('click');
                    lastSfxTestResult.value = `triggered click @ ${new Date().toLocaleTimeString()}`;
                } catch (e) {
                    lastSfxTestResult.value = `failed: ${e?.name || e?.message || e}`;
                }
            },
            debugTestBgmPlay: async () => {
                const bgm = bgmAudio.value;
                if (!bgm) {
                    lastBgmPlayResult.value = 'failed: no bgmAudio';
                    return;
                }
                try {
                    updateGainVolumes();
                    await bgm.play();
                    lastBgmPlayResult.value = `resolved @ ${new Date().toLocaleTimeString()}`;
                    lastBgmPlayError.value = '';
                    needsUserGestureToResumeBgm.value = false;
                    pageLoopAudioWasInterrupted = false;
                } catch (e) {
                    lastBgmPlayResult.value = 'rejected';
                    lastBgmPlayError.value = e?.name || e?.message || String(e);
                }
            },
            debugPauseBgm: () => {
                try {
                    bgmAudio.value?.pause();
                    pauseHtmlBgmFallback();
                    lastBgmPlayResult.value = `paused @ ${new Date().toLocaleTimeString()}`;
                    lastHtmlBgmFallbackResult.value = `paused @ ${new Date().toLocaleTimeString()}`;
                } catch (e) {
                    lastBgmPlayResult.value = `pause failed: ${e?.name || e?.message || e}`;
                }
            },
            debugTestRawAudio: async () => {
                try {
                    const raw = new Audio('assets/audio/sfx/sfx_click.mp3');
                    raw.volume = Math.max(0, Math.min(1, sfxVolume.value * masterVolume.value));
                    await raw.play();
                    lastRawAudioResult.value = `resolved @ ${new Date().toLocaleTimeString()}`;
                } catch (e) {
                    lastRawAudioResult.value = `rejected: ${e?.name || e?.message || e}`;
                }
            },
            debugEnableHtmlAudioFallback: async () => {
                await enableHtmlAudioFallback('debug-enable-html-fallback');
            },
            debugDisableHtmlAudioFallback: () => {
                useHtmlAudioBgmFallback.value = false;
                useHtmlAudioSfxFallback.value = false;
                if (useFallbackGain.value || fallbackAudioCtx.value || fallbackMediaSource.value) {
                    disableFallbackGainMode(true);
                }
                pauseHtmlBgmFallback();
                lastHtmlBgmFallbackResult.value = `disabled @ ${new Date().toLocaleTimeString()}`;
                lastHtmlSfxFallbackResult.value = `disabled @ ${new Date().toLocaleTimeString()}`;
            },
            debugEnableFallbackAudioContextV2: async () => {
                await enableHtmlAudioFallback('debug-enable-fallback-audioctx-v2', { preferFallbackGain: true });
            },
            debugDisableFallbackAudioContextV2: () => {
                disableFallbackGainMode(true);
            },
            debugResumeFallbackAudioContext: async () => {
                try {
                    if (!fallbackAudioCtx.value) {
                        await tryConnectFallbackGain(getOrCreateHtmlBgmAudio());
                    }
                    if (fallbackAudioCtx.value && (fallbackAudioCtx.value.state === 'suspended' || fallbackAudioCtx.value.state === 'interrupted')) {
                        await fallbackAudioCtx.value.resume();
                    }
                    applyFallbackGainVolume();
                    fallbackCtxNeedsGestureResume.value = false;
                    lastFallbackCtxResumeResult.value = `manual resume: ${fallbackAudioCtx.value?.state || 'none'} @ ${new Date().toLocaleTimeString()}`;
                    lastFallbackCtxResumeError.value = '';
                    lastFallbackGainResult.value = `resume: ${fallbackAudioCtx.value?.state || 'none'} @ ${new Date().toLocaleTimeString()}`;
                    lastFallbackGainError.value = '';
                } catch (e) {
                    lastFallbackGainResult.value = `resume failed @ ${new Date().toLocaleTimeString()}`;
                    lastFallbackGainError.value = e?.name || e?.message || String(e);
                }
            },
            debugTestFallbackContextBgm: async () => {
                useHtmlAudioBgmFallback.value = true;
                const audio = getOrCreateHtmlBgmAudio();
                const connected = await tryConnectFallbackGain(audio);
                const expectedBgm = getExpectedLoopBgmForCurrentState() ||
                    currentBattleBgmPick.value ||
                    currentMapBgm.value ||
                    (BGM_BASE + 'BGM_1.m4a');
                if (connected) {
                    await playHtmlBgmFallback(expectedBgm, 'debug-test-fallback-audioctx-v2-bgm');
                } else {
                    await playHtmlBgmFallback(expectedBgm, 'debug-test-fallback-audioctx-v2-v1-fallback');
                }
            },
            debugTestFallbackBgm: async () => {
                const expectedBgm = getExpectedLoopBgmForCurrentState() ||
                    currentBattleBgmPick.value ||
                    currentMapBgm.value ||
                    (BGM_BASE + 'BGM_1.m4a');
                await playHtmlBgmFallback(expectedBgm, 'debug-test-fallback-bgm');
            },
            debugTestFallbackSfx: () => {
                playHtmlSfxFallback('click', _uiSfxSrcMap.click);
            },
            debugShowAudioState: () => {
                if (isAudioDebugEnabled.value) {
                    console.log('[audio debug state]', getAudioDebugState());
                }
            }
        };

        // ── Per-gesture AudioContext resume + conservative BGM play ──
        // iOS Safari can corrupt the media pipeline if page resume reloads BGM.
        // This path only resumes AudioContext and attempts a plain play on the existing BGM element.
        const resumePageAudioOnGesture = async (reason = 'gesture') => {

            // Never auto-play if page is still in background
            if (!isPageAudioAllowed()) return;

            if (useFallbackGain.value && fallbackCtxNeedsGestureResume.value) {
                await resumeFallbackCtxOnGesture(`${reason}:fallback-v2-gesture-resume`);
                // Also resume primary AudioContext for SFX
                try {
                    await initAudioCtx();
                    if (audioCtx.value && (audioCtx.value.state === 'suspended' || audioCtx.value.state === 'interrupted')) {
                        await audioCtx.value.resume();
                    }
                } catch (_) { }
                return;
            }

            if (iosReturnedFromBackground.value && !autoFallbackEnabled.value) {
                autoFallbackEnabled.value = true;
                autoFallbackReason.value = `ios-returned-from-background-${reason}`;
                autoFallbackTime.value = new Date().toLocaleTimeString();
                await enableHtmlAudioFallback('auto-fallback-gesture');
                refreshAudioDebugState();
            }
            iosReturnedFromBackground.value = false;

            // Always try to resume the primary AudioContext for SFX,
            // even when BGM is handled by HTML fallback.
            try {
                await initAudioCtx();
                if (audioCtx.value && (audioCtx.value.state === 'suspended' || audioCtx.value.state === 'interrupted')) {
                    await audioCtx.value.resume();
                }
            } catch (_) { }

            if (useHtmlAudioBgmFallback.value) {
                await syncHtmlBgmFallbackToExpected(`${reason}:fallback-sync`);
                return;
            }

            try {
                await initAudioCtx();

                if (audioCtx.value && (audioCtx.value.state === 'suspended' || audioCtx.value.state === 'interrupted')) {
                    await audioCtx.value.resume();
                }

                updateGainVolumes();

            } catch (e) {
                warnAudioResumeState(`${reason}:ctx-resume-failed`, { error: e?.name || e?.message || e });
            }

            const shouldTryBgmPlay = needsUserGestureToResumeBgm.value || pageLoopAudioWasInterrupted;

            if (!shouldTryBgmPlay) return;

            if (pageAudioResumeTimer) {
                clearTimeout(pageAudioResumeTimer);
                pageAudioResumeTimer = null;
                pageLoopAudioResumeGeneration += 1;
            }

            const resumed = await tryResumePageLoopAudio(reason, {
                force: false,
                allowSourceSwitch: false,
                warnOnBlock: true,
                warnOnContextBlock: true,
                warnOnSkip: false
            });

            if (resumed) {
                pageLoopAudioWasInterrupted = false;
            }

        };

        const handlePageAudioGesture = (event) => {

            if (!isPageAudioAllowed()) return;

            markAudioDebugEvent(lastAudioGestureEvent, event.type);
            resumePageAudioOnGesture(`global-${event.type}`);

        };

        window.addEventListener('pointerdown', handlePageAudioGesture, { capture: true, passive: true });
        window.addEventListener('touchstart', handlePageAudioGesture, { capture: true, passive: true });
        window.addEventListener('click', handlePageAudioGesture, { capture: true, passive: true });

        const onUserGesture = () => {

            unlockAudioOnce();

            // Re-resume AudioContext + BGM on every gesture (handles iOS Safari post-background silence)
            resumePageAudioOnGesture();

            if (!audioInited.value) initAudio();

            if (window._preConnectRetry) {

                clearTimeout(window._preConnectRetry);

                window._preConnectRetry = null;

            }

            if (sfxGain.value && audioCtx.value) {

                audioPool.forEach((a, url) => {

                    if (url.includes('/bgm')) return;

                    if (!a._connected) {

                        try {

                            a.crossOrigin = 'anonymous';

                            const src = audioCtx.value.createMediaElementSource(a);

                            src.connect(sfxGain.value);

                            a._connected = true;

                        } catch (_) { }

                    }

                });

            }

        };

        const levelConfig = computed(() => LEVEL_CONFIG.value[currentLevel.value] || LEVEL_CONFIG.value[1] || {});

        const levelTitle = computed(() => levelConfig.value.title || '');

        const isChoiceMode = computed(() => levelConfig.value.blanks === 1);

        const playBeep = (frequency, duration, type) => {

            try {

                if (!audioCtx.value) initAudioCtx();

                const ctx = audioCtx.value;

                if (ctx.state === 'suspended') ctx.resume();

                const osc = ctx.createOscillator();

                const gain = ctx.createGain();

                osc.connect(gain);

                gain.connect(ctx.destination);

                osc.frequency.value = frequency;

                osc.type = type || 'sine';

                gain.gain.setValueAtTime(0.15, ctx.currentTime);

                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

                osc.start(ctx.currentTime);

                osc.stop(ctx.currentTime + duration);

            } catch (_) { }

        };

        const ensureBgmElementSync = () => {

            let bgm = audioPool.get(BGM_BASE + 'BGM_1.m4a');

            if (!bgm) {

                bgm = new Audio(BGM_BASE + 'BGM_1.m4a');

                bgm.crossOrigin = "anonymous";

                bgm.loop = true;

                audioPool.set(BGM_BASE + 'BGM_1.m4a', bgm);

            }

            bgmAudio.value = bgm;

            bgmAudio.value.loop = true;

        };

        /** 載入並啟動指定關卡：停止舊音效、選播 BGM、呼叫 initGame。withMentor=true 時由導師圖示觸發。 */
        const startLevel = async (level, withMentor = false) => {

            const lv = Number(level) || parseInt(level, 10) || 1;

            initAudioCtx();

            stopAllAudio();

            pickBattleBgm(lv);

            ensureBgmElementSync();

            preloadAllAudio();

            playSfx('click');

            showLevelSelect.value = false;

            showMap.value = false; // CRITICAL: Hide map to show battle HUD

            currentLevel.value = lv;

            // withMentor = true means user clicked the "Mentor Icon" -> forceMentor = true

            // withMentor = false means user clicked the "Stage Card" -> skipMentor = true

            initGame(lv, !withMentor, withMentor);

            playBgm();

        };

        const usePotion = () => {

            initAudioCtx();

            if (!audioInited.value) initAudio();

            resumePageAudioOnGesture();

            if (inventory.value.potions <= 0 || player.value.hp >= player.value.maxHp) return;

            playSfx('potion');

            inventory.value.potions--;

            player.value.hp = Math.min(player.value.maxHp, player.value.hp + POTION_HP);

            pushBattleLog(`喝了藥水，回復 ${POTION_HP} 點 HP！`, 'heal');

        };

        const getHistoricalSkills = (upToLevel) => {
            const historical = new Set();
            for (let i = 1; i < upToLevel; i++) {
                const cfg = LEVEL_CONFIG.value[i];
                if (cfg && cfg.unlockSkills) {
                    cfg.unlockSkills.forEach(s => {
                        // 排除魔王複習 ID 或特殊的非教學 ID
                        if (s && !s.startsWith('BOSS_REVIEW') && !s.startsWith('FINAL') && !s.startsWith('HIDDEN')) {
                            historical.add(s);
                        }
                    });
                }
            }
            return Array.from(historical);
        };

        const pickSkillForNormalLevel = (levelId) => {
            // dedup retry：直接回傳前一題的 skillId，不重複消費 slot bag
            if (_normalSlotRetrySkill !== null) {
                const sid = _normalSlotRetrySkill;
                _normalSlotRetrySkill = null;
                return sid;
            }
            // new skill combo 枯竭：不消費 bag slot，直接從 old pool 隨機補位
            if (_forceOldNext) {
                _forceOldNext = false;
                const oldPool = getHistoricalSkills(levelId);
                if (oldPool.length > 0) return oldPool[Math.floor(Math.random() * oldPool.length)];
                const all = unlockedSkillIds.value;
                return all.length > 0 ? all[Math.floor(Math.random() * all.length)] : 'WA_TOPIC_BASIC';
            }

            const config = LEVEL_CONFIG.value[levelId] || {};
            const newSkills = (config.unlockSkills || []).filter(id => {
                const s = skillsAll.value[id];
                return s && s.particle !== '複習'; // 排除純複習 ID 作為新技能
            });

            // 舊技能池：嚴格限制為「本關卡之前」已教過的技能
            const oldSkills = getHistoricalSkills(levelId);

            let poolToUse = [];

            // 消費 slot bag（確定性比例）；若 bag 已空則退回 Bernoulli 試驗
            let useNew;
            if (_normalSlotBag.length > 0) {
                useNew = _normalSlotBag.shift() === 'new';
            } else {
                const r = config.skillMix?.newSkillWeight ?? QUESTION_MIX_CONFIG.normal.newRatio;
                useNew = Math.random() < r;
            }

            if (newSkills.length > 0 && oldSkills.length > 0) {
                poolToUse = useNew ? newSkills : oldSkills;
            } else if (newSkills.length > 0) {
                poolToUse = newSkills;
            } else if (oldSkills.length > 0) {
                poolToUse = oldSkills;
            } else {
                // Fallback: 如果連歷史都沒有，只好從全域已解鎖中撈 (極端防呆)
                poolToUse = unlockedSkillIds.value.length > 0 ? unlockedSkillIds.value : ['WA_TOPIC_BASIC'];
            }

            return poolToUse[Math.floor(Math.random() * poolToUse.length)];
        };

        let bossSkillQueue = [];
        let bossQuestionQueue = []; // L36 專用：不重複題目的完整對列

        const startBossQueue = (unlockedIds, levelOverride) => {

            const lv = levelOverride || currentLevel.value;

            const config = LEVEL_CONFIG.value[lv] || {};

            // 第五關固定複習池：は / の / が / を

            const level5Pool = ['WA_TOPIC_BASIC', 'NO_POSSESSIVE', 'GA_INTRANSITIVE', 'WO_OBJECT_BASIC'];

            if (lv === 5) {
                let fullQueue = [];
                for (let i = 0; i < 5; i++) {
                    const block = [...level5Pool].sort(() => Math.random() - 0.5);
                    fullQueue = fullQueue.concat(block);
                }
                bossSkillQueue = fullQueue;
            } else if (lv % 5 === 0 && lv > 5 && config.skillId !== 'HIDDEN_BOSS_36') {
                // 第 10, 15, 20... 關魔王：確定性比例 sameMap / prevMap
                const currentMapSkills = [];
                for (let i = lv - 4; i < lv; i++) {
                    const c = LEVEL_CONFIG.value[i];
                    if (c && c.unlockSkills) currentMapSkills.push(...c.unlockSkills);
                }
                const historicalSkills = getHistoricalSkills(lv - 4); // 排除當前地圖

                const total = 20;
                const sameMapCount = Math.round(QUESTION_MIX_CONFIG.boss.sameMapRatio * total);
                const prevMapCount = total - sameMapCount;
                const prevPool = historicalSkills.length > 0 ? historicalSkills : currentMapSkills;
                const sameMapSlots = cycleFill(currentMapSkills, sameMapCount);
                const prevMapSlots = cycleFill(prevPool, prevMapCount);
                bossSkillQueue = [...sameMapSlots, ...prevMapSlots].sort(() => Math.random() - 0.5);
            } else if (config.skillId && config.skillId === 'HIDDEN_BOSS_36') {
                // L36 隱藏魔王：完整句子級別的不重複題池
                const collectL36Questions = () => {
                    const tier3 = ['KARA_REASON', 'YORI_COMPARE', 'NI_FREQUENCY', 'DE_MATERIAL', 'TO_QUOTE', 'NI_PURPOSE', 'GA_BUT', 'TO_CONDITIONAL'];
                    const tier2 = ['KARA_SOURCE_START', 'MADE_LIMIT_END', 'TO_WITH', 'DE_TOOL_MEANS', 'HE_DIRECTION', 'NI_TARGET', 'NI_DESTINATION', 'MO_COMPLETE_NEGATION', 'TO_AND', 'DE_SCOPE'];
                    const tier1 = ['NI_TIME', 'NI_EXIST_PLACE', 'YA_AND_OTHERS', 'WA_TOPIC_BASIC', 'NO_POSSESSIVE', 'GA_INTRANSITIVE', 'WO_OBJECT_BASIC', 'DE_ACTION_PLACE', 'GA_EXIST_SUBJECT', 'MO_ALSO_BASIC'];

                    const masterPool = [];
                    const seenKeys = new Set();
                    const allSkills = [...tier3, ...tier2, ...tier1];
                    const poolStats = {}; // 診斷用：紀錄每種技能最後進入大池的題數

                    // 隨機化處理順序，避免固定順序導致某些技能（如 Tier 3）永遠「佔住」 overlap 句子
                    const shuffledSkills = [...allSkills].sort(() => Math.random() - 0.5);

                    shuffledSkills.forEach(skillId => {
                        const skillPool = EARLY_GAME_POOLS.skills[skillId] || {};
                        const combos = skillPool.safeCombos || [];

                        combos.forEach(combo => {
                            const originalCombos = skillPool.safeCombos;
                            skillPool.safeCombos = [combo];

                            const q = generateQuestionBySkill(skillId, 1);
                            if (q) {
                                const key = q.chinese + "|" + (q.segments ? q.segments.map(s => s.text).join('') : '');
                                if (!seenKeys.has(key)) {
                                    seenKeys.add(key);
                                    q._sentenceKey = key;
                                    masterPool.push(q);
                                    poolStats[skillId] = (poolStats[skillId] || 0) + 1;
                                }
                            }

                            skillPool.safeCombos = originalCombos;
                        });
                    });

                    if (window.__DEBUG__) {
                        console.log(`[L36 Pool] Generated ${masterPool.length} unique questions.`);
                        console.table(Object.entries(poolStats).map(([id, count]) => ({ Skill: id, Count: count })).sort((a, b) => b.Count - a.Count));
                    }
                    return masterPool.sort(() => Math.random() - 0.5);
                };
                bossQuestionQueue = collectL36Questions();
                bossSkillQueue = ['HIDDEN_BOSS_36_POOL']; // 用作標記
            } else if (config.skillId && (config.skillId.startsWith('BOSS_REVIEW') || config.skillId === 'FINAL_BOSS_35')) {
                bossSkillQueue = [config.skillId];
            } else {
                bossSkillQueue = [...unlockedIds].sort(() => Math.random() - 0.5);
            }

        };

        const pickSkillForBoss = () => {

            if (bossSkillQueue.length === 0) return null;

            if (bossSkillQueue[0] === 'HIDDEN_BOSS_36_POOL') return 'HIDDEN_BOSS_36_QUEUE';

            const skill = bossSkillQueue.shift();

            bossSkillQueue.push(skill);

            return skill;

        };

        const isBossLevel = (levelId) => {

            if (levelId % 5 === 0) return true;

            if (LEVEL_CONFIG.value[levelId]?.isBoss) return true;

            return false;

        };

        const pickSkillIdForNextQuestion = (levelId) => {

            const isBoss = isBossLevel(levelId);

            if (isBoss) {

                if (bossSkillQueue.length === 0) startBossQueue(unlockedSkillIds.value);

                return pickSkillForBoss();

            }

            return pickSkillForNormalLevel(levelId);

        };

        const safeFallbackQuestion = (skillId) => {

            const skillDef = skillsAll.value[skillId];

            if (!skillDef) return null;

            const ex = (skillDef.examples && skillDef.examples.length > 0) ? pickOne(skillDef.examples) : "川のそば";

            const q = {

                chinese: `[安全備用]`,

                segments: [{ text: ex, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: "[安全備用]", isBlank: false }],

                answers: [[skillDef.particle || "の"]],

                grammarTip: (skillDef.meaning || '') + (skillDef.rule ? ' / ' + skillDef.rule : ''),

                skillId: skillId,

                choices: pickMany(skillDef.choiceSet || ["の", "は", "が", "を", "に", "へ", "で", "と"], 4)

            };

            return q;

        };

        /** 依 skillId 生成單道助詞題（包含所有 if/else 助詞都合邏輯分支）。回傳 question object 或 null。 */
        const generateQuestionBySkill = (skillId, blanks, forceTargetCount = null) => {
            // L36 專用：不重複題目的抽題邏輯
            if (skillId === 'HIDDEN_BOSS_36_QUEUE') {
                if (bossQuestionQueue.length === 0) {
                    // 若耗盡則自動重新裝彈洗牌（Indefinite trial）
                    startBossQueue(unlockedSkillIds.value);
                }
                const q = bossQuestionQueue.shift();
                return q;
            }

            // 向下相容 MO_ALSO_BASIC

            if (skillId === 'MO_ALSO') skillId = 'MO_ALSO_BASIC';

            const skillDef = skillsAll.value[skillId];

            if (!skillDef || !skillDef.id) return null;

            const tipText = (skillDef.meaning || '') + (skillDef.rule ? ' / ' + skillDef.rule : '');

            const seg = (text, ruby = '') => ({

                text,

                ruby,

                isBlank: false

            });

            const makeParticleQuestion = ({

                chinese,

                leftText,

                leftRuby,

                rightText,

                rightRuby,

                answer,

                skillId,

                grammarTip,

                choices

            }) => {
                // Diagnostic tracing for choice counts
                if ((skillId === 'HE_DEST' || skillId === 'HE_DIRECTION') && window.__DEBUG__) {
                    console.debug(`[ChoiceTrace-FINAL] ${skillId}: length=${choices ? choices.length : 0}`, {
                        prompt: chinese,
                        sentence: `${leftText}【${answer}】${rightText}`,
                        choices: choices
                    });
                }

                return {

                    chinese,

                    leftText,   // For debug tools

                    rightText,  // For debug tools

                    segments: [

                        seg(leftText, leftRuby),

                        { isBlank: true, blankIndex: 0 },

                        seg(rightText, rightRuby)

                    ],

                    answers: [[answer]],

                    grammarTip,

                    skillId,

                    choices

                };
            };

            const getAllowedEarlyParticles = (lv) => {
                if (lv === 1 || lv === 2) return ['は', 'の'];
                if (lv === 3) return ['は', 'の', 'が'];
                if (lv === 4 || lv === 5) return ['は', 'の', 'が', 'を'];
                if (lv === 6) return ['は', 'の', 'が', 'を', 'へ'];
                if (lv === 7) return ['は', 'の', 'が', 'を', 'へ', 'も'];
                if (lv === 8) return ['は', 'の', 'が', 'を', 'へ', 'も', 'に'];
                if (lv === 9 || lv === 10) return ['は', 'の', 'が', 'を', 'へ', 'も', 'に', 'と'];
                if (lv >= 11 && lv <= 15) return ['は', 'の', 'が', 'を', 'へ', 'も', 'に', 'と', 'で'];
                if (lv === 16) return ['は', 'の', 'が', 'を', 'へ', 'も', 'に', 'と', 'で', 'から'];
                if (lv >= 17 && lv <= 25) return ['は', 'の', 'が', 'を', 'へ', 'も', 'に', 'と', 'で', 'から', 'まで'];
                if (lv >= 26 && lv <= 31) return ['は', 'の', 'が', 'を', 'へ', 'も', 'に', 'と', 'で', 'から', 'まで', 'や'];
                return ['は', 'の', 'が', 'を', 'へ', 'も', 'に', 'と', 'で', 'から', 'まで', 'や', 'より'];
            };

            const getChoices = (defaultChoices, correctAns) => {
                const targetCount = getChoiceCountForLevel(currentLevel.value);
                const validParticles = ['は', 'の', 'が', 'を', 'に', 'へ', 'も', 'で', 'と', 'から', 'まで', 'や', 'より'];

                const lv = currentLevel.value;
                const isGatedPool = lv <= 35;
                let allowedEarlyParticles = getAllowedEarlyParticles(lv);

                // [Refined Safety Patch] Context-aware filtering
                const isParticleSkill = skillDef.particle && validParticles.includes(skillDef.particle);
                let rawPool = [...(skillDef.choiceSet || defaultChoices)];

                if (isGatedPool && isParticleSkill) {
                    // Override local skill choiceSets with the global chapter-allowed pool
                    // This allows new particles to effectively act as distractors for old questions!
                    rawPool = [...allowedEarlyParticles];
                } else if (!isGatedPool && isParticleSkill) {
                    // Level 36+ : Fully unrestricted randomness. Completely overrides old skill-bound constraints.
                    rawPool = [...validParticles];
                }

                let safePool = rawPool.filter(p => {
                    if (!p || typeof p !== 'string') return false;

                    if (isGatedPool && isParticleSkill) {
                        return allowedEarlyParticles.includes(p);
                    }

                    if (isParticleSkill) {
                        // Strict mode for particle-based skills
                        return validParticles.includes(p);
                    } else {
                        // General safety for non-particle skills.
                        if (p.length === 0) return false;
                        if (p.length > 12) return false;
                        // Exclude Kanji/Chinese if the correct answer is a pure Kana particle
                        const isChinese = /[\u4e00-\u9fa5]/.test(p);
                        const ansIsJapanese = !/[\u4e00-\u9fa5]/.test(correctAns || '');
                        if (isChinese && ansIsJapanese) return false;
                        return true;
                    }
                });

                // Logging filtered items (low-noise debug)
                const filteredOut = rawPool.filter(p => !safePool.includes(p) && p !== correctAns);
                if (filteredOut.length > 0) {

                }

                if (correctAns && !safePool.includes(correctAns)) {
                    safePool.push(correctAns);
                }

                // Backfill logic (Only for particle skills)
                if (safePool.length < targetCount && isParticleSkill) {
                    let sourcePool = ['は', 'の', 'が', 'を', 'に', 'で', 'と'];
                    if (isGatedPool) sourcePool = allowedEarlyParticles;

                    const fallback = sourcePool.filter(p => !safePool.includes(p));
                    while (safePool.length < targetCount && fallback.length > 0) {
                        safePool.push(fallback.shift());
                    }
                }

                safePool = safePool.sort(() => Math.random() - 0.5);
                let selected = [];

                if (correctAns) {
                    selected.push(correctAns);
                    safePool = safePool.filter(x => x !== correctAns);
                }

                let needed = targetCount - selected.length;

                if (lv >= 6 && lv <= 34 && isParticleSkill && needed > 0) {
                    let focusParticle = '';
                    if (lv === 6) focusParticle = 'へ';
                    else if (lv === 7) focusParticle = 'も';
                    else if (lv === 8) focusParticle = 'に';
                    else if (lv === 9) focusParticle = 'と';
                    else if (lv === 11) focusParticle = 'で';
                    else if (lv === 12) focusParticle = 'に';
                    else if (lv === 13) focusParticle = 'が';
                    else if (lv === 14) focusParticle = 'と';
                    else if (lv === 16) focusParticle = 'から';
                    else if (lv === 17) focusParticle = 'まで';
                    else if (lv === 18) focusParticle = 'に';
                    else if (lv === 19) focusParticle = 'で';
                    else if (lv === 21) focusParticle = 'に';
                    else if (lv === 22) focusParticle = 'が';
                    else if (lv === 23) focusParticle = 'も';
                    else if (lv === 24) focusParticle = 'と';
                    else if (lv === 26) focusParticle = 'や';
                    else if (lv === 27) focusParticle = 'で';
                    else if (lv === 28) focusParticle = 'に';
                    else if (lv === 29) focusParticle = 'と';
                    else if (lv === 31) focusParticle = 'から';
                    else if (lv === 32) focusParticle = 'より';
                    else if (lv === 33) focusParticle = 'に';
                    else if (lv === 34) focusParticle = 'で';

                    if (focusParticle && safePool.includes(focusParticle)) {
                        // 55% chance to forcefully inject the new focus particle as a distractor
                        if (Math.random() < 0.55) {
                            selected.push(focusParticle);
                            safePool = safePool.filter(x => x !== focusParticle);
                            needed--;
                        }
                    }
                }

                if (safePool.length >= needed) {
                    selected = selected.concat(safePool.slice(0, needed));
                } else {
                    selected = selected.concat(safePool);
                }

                return selected.sort(() => Math.random() - 0.5);
            };

            let q = null;

            // --- Shuffle Bag Injection ---
            const tipTextObj = (skillDef.meaning || '') + (skillDef.rule ? ' / ' + skillDef.rule : '');
            let tryCombos = undefined;
            if (pool.skills && pool.skills[skillDef.id]) {
                const sPool = pool.skills[skillDef.id];
                tryCombos = sPool.safeCombos;
            }
            if (tryCombos && Array.isArray(tryCombos) && tryCombos.length > 0 && tryCombos[0].left !== undefined) {
                window._skillQuestionBags = window._skillQuestionBags || {};
                window._lastQuestionBySkill = window._lastQuestionBySkill || {};

                if (!window._skillQuestionBags[skillId] || window._skillQuestionBags[skillId].length === 0) {
                    let newBag = [...tryCombos].sort(() => Math.random() - 0.5);
                    const lastQ = window._lastQuestionBySkill[skillId];
                    if (lastQ && newBag.length > 1 && newBag[newBag.length - 1].j === lastQ.j) {
                        const temp = newBag[newBag.length - 1];
                        newBag[newBag.length - 1] = newBag[0];
                        newBag[0] = temp;
                    }
                    window._skillQuestionBags[skillId] = newBag;
                }

                const picked = window._skillQuestionBags[skillId].pop();
                window._lastQuestionBySkill[skillId] = picked;

                const particleAns = skillDef.particle || "の";
                const choicesOptions = skillDef.choiceSet || ["の", "は", "が", "を", "に", "へ", "で", "と", "も", "から", "まで", "や", "より"];

                let excludeChoices = [];
                if (skillId === 'HE_DEST' || skillId === 'HE_DIRECTION') excludeChoices = ['に'];

                let finalChoices = undefined;
                if (Number(blanks ?? 1) === 1) {
                    // For HE_DIRECTION/HE_DEST, allow forceTargetCount to override level default
                    const targetCount = forceTargetCount ?? getChoiceCountForLevel(currentLevel.value);

                    finalChoices = getChoices(choicesOptions, particleAns);
                    if (excludeChoices.length > 0) {
                        finalChoices = finalChoices.filter(c => !excludeChoices.includes(c));
                    }

                    // Redundant fill to ensure targetCount is met
                    if (finalChoices.length < targetCount) {
                        const currentSet = new Set(finalChoices);
                        let fallbackPool = choicesOptions;
                        if (currentLevel.value <= 35 && skillDef.particle) {
                            fallbackPool = getAllowedEarlyParticles(currentLevel.value);
                        }
                        const candidates = fallbackPool.filter(p => !excludeChoices.includes(p) && !currentSet.has(p));
                        while (finalChoices.length < targetCount && candidates.length > 0) {
                            finalChoices.push(candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0]);
                        }
                    }

                    // [Failsafe] HE_DIRECTION final hardfill
                    if ((skillId === 'HE_DEST' || skillId === 'HE_DIRECTION') && finalChoices.length < targetCount) {
                        let emgPool = ["は", "が", "の", "も", "と", "で", "を", "へ"];
                        if (currentLevel.value <= 35) {
                            emgPool = getAllowedEarlyParticles(currentLevel.value);
                        }
                        const currentSet = new Set(finalChoices);
                        for (const p of emgPool) {
                            if (finalChoices.length >= targetCount) break;
                            if (p !== 'に' && !currentSet.has(p)) {
                                finalChoices.push(p);
                                currentSet.add(p);
                            }
                        }
                    }

                    if ((skillId === 'HE_DEST' || skillId === 'HE_DIRECTION') && window.__DEBUG__) {
                        console.debug(`[ChoiceTrace-BRANCH-BAG] ${skillId} generated with ${finalChoices.length} choices`, {
                            sentence: (picked.left || '') + '【へ】' + (picked.right || ''),
                            choices: finalChoices
                        });
                    }
                }

                return makeParticleQuestion({
                    chinese: picked.zh,
                    leftText: picked.left || picked.j,
                    leftRuby: picked.leftRuby || picked.r,
                    rightText: picked.right || picked.v,
                    rightRuby: picked.rightRuby || picked.vr || picked.v,
                    answer: particleAns,
                    skillId: skillId,
                    grammarTip: tipTextObj,
                    choices: finalChoices
                });
            }

            else if (skillDef.id === 'BOSS_REVIEW_01') {
                const reviewSkills = ['WA_TOPIC_BASIC', 'NO_POSSESSIVE', 'GA_INTRANSITIVE', 'WO_OBJECT_BASIC'];
                const chosenSkillId = pickOne(reviewSkills);
                return generateQuestionBySkill(chosenSkillId, blanks, forceTargetCount);
            }
            else if (skillDef.id === 'BOSS_REVIEW_02') {
                const reviewSkills = ['HE_DIRECTION', 'MO_ALSO_BASIC', 'NI_TIME', 'TO_AND'];
                const chosenSkillId = pickOne(reviewSkills);
                return generateQuestionBySkill(chosenSkillId, blanks, forceTargetCount);
            }
            else if (skillDef.id === 'BOSS_REVIEW_03') {
                const reviewSkills = ['DE_ACTION_PLACE', 'NI_EXIST_PLACE', 'GA_EXIST_SUBJECT', 'TO_WITH'];
                const chosenSkillId = pickOne(reviewSkills);
                return generateQuestionBySkill(chosenSkillId, blanks, forceTargetCount);
            }
            else if (skillDef.id === 'BOSS_REVIEW_04') {
                // Mixed review of から, まで, に(落點), で(工具)
                const reviewSkills = ['KARA_SOURCE_START', 'MADE_LIMIT_END', 'NI_DESTINATION', 'DE_TOOL_MEANS'];
                const chosenSkillId = pickOne(reviewSkills);
                return generateQuestionBySkill(chosenSkillId, blanks, forceTargetCount);
            }
            else if (skillDef.id === 'BOSS_REVIEW_05') {
                const reviewSkills = ['NI_TARGET', 'GA_BUT', 'MO_COMPLETE_NEGATION', 'TO_CONDITIONAL'];
                const chosenSkillId = pickOne(reviewSkills);
                return generateQuestionBySkill(chosenSkillId, blanks, forceTargetCount);
            }
            else if (skillDef.id === 'BOSS_REVIEW_06') {
                const reviewSkills = ['YA_AND_OTHERS', 'DE_SCOPE', 'NI_PURPOSE', 'TO_QUOTE'];
                const chosenSkillId = pickOne(reviewSkills);
                return generateQuestionBySkill(chosenSkillId, blanks, forceTargetCount);
            }
            else if (skillDef.id === 'FINAL_BOSS_35') {
                const reviewSkills = ['KARA_REASON', 'YORI_COMPARE', 'NI_FREQUENCY', 'DE_MATERIAL'];
                const chosenSkillId = pickOne(reviewSkills);
                return generateQuestionBySkill(chosenSkillId, blanks, forceTargetCount);
            }

            else if (skillDef.id === 'HIDDEN_BOSS_36') {

                if (bossSkillQueue.length === 0) startBossQueue(unlockedSkillIds.value, 36);

                const chosenSkillId = pickSkillForBoss();

                return generateQuestionBySkill(chosenSkillId, blanks, forceTargetCount);

            }

            return q;

        };

        // ================= [ BATTLE INIT ] =================
        /** 主戰鬥初始化：依關卡 ID 生成題庫、配置怪物、重置所有 battle state、啟動計時器。 */
        let _mentorResumeToken = 0;
        const initGame = (level, skipMentor = false, forceMentor = false) => {

            const _myMentorToken = ++_mentorResumeToken;

            isBgmSuppressed.value = false;

            window._battlePopPlayed = false;

            if (window.__AUTO_ADVANCE_TIMEOUT) { clearTimeout(window.__AUTO_ADVANCE_TIMEOUT); window.__AUTO_ADVANCE_TIMEOUT = null; }

            let triggeredMentor = false;

            answerMode.value = getDefaultAttackMode();
            flickState.isArmed = false;
            flickState.activeOpt = null;
            flickState.successOpt = null;
            flickState.pendingDirectionalMiss = false;
            flickState.lastShotDirStored = false;
            flickState.lastShotDirNx = 0;
            flickState.lastShotDirNy = -1;
            if (flickState.capturedEl) {
                try { flickState.capturedEl.releasePointerCapture?.(1); } catch (e) { }
                flickState.capturedEl = null;
            }

            const ratio = player.value.hp / player.value.maxHp;

            let startState = 'neutral';

            if (ratio <= 0.4) startState = 'scary';

            else if (ratio < 0.8) startState = 'ase';

            setHeroAvatar(startState);

            window.heroHP = player.value.hp;

            window.heroMaxHP = player.value.maxHp;

            inventory.value.potions = INITIAL_POTIONS;

            clearSpeedStatus();

            heroBuffs.enemyAtbMult = 1.0;

            heroBuffs.enemyDmgMult = 1.0;

            heroBuffs.odoodoTurns = 0;

            heroBuffs.gachigachiTurns = 0;
            heroBuffs.giragiraTurns = 0;
            heroBuffs.morimoriTurns = 0;
            heroBuffs.jiwajiwaTurns = 0;
            heroBuffs.wakuwakuTurns = 0;
            heroBuffs.wakuwakuStacks = 0;
            heroBuffs.monsterSleep = false;

            evasionBuffAttacksLeft.value = 0;

            updateHeroStatusBar();

            // Comprehensive Reset for Battle/Timer State (Fix ATB Carryover)

            timeLeft.value = 10;

            timeUp.value = false;

            wrongAnswerPause.value = false;

            wrongAnswerPauseCountdown.value = 0;

            wasTimerRunning = false;

            wasPauseTimerRunning = false;

            _voiceLockUntil = 0;

            if (timerId) { clearInterval(timerId); timerId = null; }

            if (pauseTimerId) { clearInterval(pauseTimerId); pauseTimerId = null; }

            resetBattleOutcomePresentation();
            resetStageClearMetrics();

            isMonsterImageError.value = false;

            monsterHitImageFailed.value = false;

            monsterIsEntering.value = true;
            setTimeout(() => { monsterIsEntering.value = false; }, 800);

            monsterIsDying.value = false;

            monsterTrulyDead.value = false;

            monsterResultShown.value = false;

            isDefeated.value = false;
            const _sc = document.getElementById('battleScene');
            if (_sc) _sc.classList.remove('grayscale-filter');
            const _ov = document.getElementById('defeatOverlay');
            if (_ov) _ov.classList.add('hidden');

            const globalVfxLayer = document.getElementById('global-vfx-layer');
            if (globalVfxLayer) globalVfxLayer.innerHTML = '';

            isMistakesOpen.value = false;

            isMenuOpen.value = false;

            isChangelogOpen.value = false;

            stageLog.value = [];

            const lv = level ?? currentLevel.value;

            currentLevel.value = lv;

            const config = LEVEL_CONFIG.value[lv] || LEVEL_CONFIG.value[1] || { blanks: 1 };

            if (config.unlockSkills && config.unlockSkills.length > 0) {

                const newUnlocks = [];

                config.unlockSkills.forEach(skillId => {

                    if (!unlockedSkillIds.value.includes(skillId)) {

                        unlockedSkillIds.value.push(skillId);

                        newUnlocks.push(skillId);

                    }

                });

                if (newUnlocks.length > 0) {

                    if (window._disableMentorAutoTrigger || skipMentor) {

                        // Skip mentor and popup for debug jump or direct map card entry

                    } else {

                        const firstNewSkillId = newUnlocks[0];

                        if (triggerMentorDialogue(firstNewSkillId, forceMentor)) {

                            triggeredMentor = true;

                            // Pause and wait for mentor to finish

                            window._resumeAfterMentor = () => {
                                if (_mentorResumeToken !== _myMentorToken) return;
                            };

                        } else {
                        }

                    }

                    // [Knowledge Card 1.0] Stage these for post-battle reward (複習類對戰卡不顯示)
                    pendingKnowledgeCards.value.push(...newUnlocks.map(id => decorateSkillWithSpirit(skillsAll.value[id])).filter(s => s && s.particle !== '複習'));

                }

            }

            // Instruction mentor logic

            if (!skipMentor && !triggeredMentor && config.skillId && !window._disableMentorAutoTrigger) {

                if (triggerMentorDialogue(config.skillId, forceMentor)) {

                    triggeredMentor = true;

                    // Ensure battle starts after mentor

                    if (window._resumeAfterMentor) console.warn('[initGame] _resumeAfterMentor already set before instruction mentor; overwriting.');
                    window._resumeAfterMentor = () => {

                        if (_mentorResumeToken !== _myMentorToken) return;

                        if (!window._battlePopPlayed) {

                            playSfx('uiPop');

                            window._battlePopPlayed = true;

                        }

                        startTimer();

                    };

                }

            }

            const blanks = config.blanks;

            const qList = [];

            // 一般關：預建確定性比例 slot bag（L1/L2/boss 關不使用）
            const _isBossOrSpecial = isBossLevel(lv) || lv === 1 || lv === 2;
            _normalSlotBag = _isBossOrSpecial ? [] : buildSlotBag(QUESTION_MIX_CONFIG.normal.newRatio, 100);
            _normalSlotRetrySkill = null;
            _forceOldNext = false;
            // boss 關每次進入都重建 queue，避免舊關卡的 stale 技能汙染（e.g. L10 → L36）
            if (isBossLevel(lv)) {
                bossSkillQueue = [];
                startBossQueue(unlockedSkillIds.value, lv);
            }

            // 題面去重：同一輪內不出現相同句子
            const _seenSentences = new Set();
            let _deupRetries = 0;
            const _MAX_DEDUP_RETRIES = 60;
            let _currentSlotRetries = 0; // per-slot 計數，枯竭時轉 old pool

            let reviewCycle = { remainingReview: 1, remainingL2: 3, lastWasReview: false };

            const allowSkills = ['WA_TOPIC_BASIC', 'NO_POSSESSIVE'];

            // L5 固定 review pool（不依賴 unlockedSkillIds，確保 refresh/skip level 時仍完整）

            const L5_REVIEW_POOL = ['WA_TOPIC_BASIC', 'NO_POSSESSIVE', 'GA_INTRANSITIVE', 'WO_OBJECT_BASIC'];

            // L10 固定 review pool（L6-9 的 skill）

            const L10_REVIEW_POOL = ['HE_DIRECTION', 'MO_ALSO_BASIC', 'NI_TIME', 'TO_AND'];

            const L15_REVIEW_POOL = ['DE_ACTION_PLACE', 'NI_EXIST_PLACE', 'GA_EXIST_SUBJECT', 'TO_WITH'];

            // 預先為 L5/L10/L15 建立 review 排程 queue：每 4 題一組，各 skill 各出一次再 shuffle

            const l5Queue = [];

            const l10Queue = [];

            const l15Queue = [];

            if (lv === 5) {

                for (let b = 0; b < Math.ceil(100 / 4); b++) {

                    const block = [...L5_REVIEW_POOL].sort(() => Math.random() - 0.5);

                    l5Queue.push(...block);

                }

            }

            if (lv === 10) {

                for (let b = 0; b < Math.ceil(100 / 4); b++) {

                    const block = [...L10_REVIEW_POOL].sort(() => Math.random() - 0.5);

                    l10Queue.push(...block);

                }

            }

            if (lv === 15) {

                for (let b = 0; b < Math.ceil(100 / 4); b++) {

                    const block = [...L15_REVIEW_POOL].sort(() => Math.random() - 0.5);

                    l15Queue.push(...block);

                }

            }

            const _totalQ = (config.skillId === 'HIDDEN_BOSS_36') ? bossQuestionQueue.length : 100;
            for (let i = 0; i < _totalQ; i++) {

                let q = null;

                let skillId = null;

                let isReview = false;

                if (lv === 1) {

                    skillId = Math.random() < 0.5 ? allowSkills[0] : allowSkills[1];

                } else if (lv === 5) {

                    // L5 Boss Review：從預排 queue 依序取，保證平均分布

                    skillId = l5Queue[i % l5Queue.length];

                    isReview = false;

                } else if (lv === 10) {

                    // L10 Boss Review：複習 L6-9 的 4 個 skill，預排 queue 確保平均

                    skillId = l10Queue[i % l10Queue.length];

                    isReview = false;

                } else if (lv === 15) {

                    // L15 Boss Review：複習 L11-14 的 4 個 skill，預排 queue 確保平均

                    skillId = l15Queue[i % l15Queue.length];

                    isReview = false;

                } else if (unlockedSkillIds.value.length > 0) {

                    if (lv === 2) {

                        if (reviewCycle.remainingReview === 0 && reviewCycle.remainingL2 === 0) {

                            reviewCycle.remainingReview = 1;

                            reviewCycle.remainingL2 = 3;

                        }

                        if (reviewCycle.lastWasReview) isReview = false;

                        else if (reviewCycle.remainingReview === 0) isReview = false;

                        else if (reviewCycle.remainingL2 === 0) isReview = true;

                        else isReview = Math.random() < (reviewCycle.remainingReview / (reviewCycle.remainingReview + reviewCycle.remainingL2));

                        if (isReview) {

                            reviewCycle.remainingReview--;

                            skillId = Math.random() < 0.5 ? allowSkills[0] : allowSkills[1];

                        } else {

                            reviewCycle.remainingL2--;

                            skillId = pickSkillIdForNextQuestion(lv);

                        }

                        reviewCycle.lastWasReview = isReview;

                    } else {

                        skillId = pickSkillIdForNextQuestion(lv);

                    }

                }

                let generatedFromSkill = false;

                let attempts = 0;

                let originalSkillId = skillId;

                while (attempts < 10 && skillId && !generatedFromSkill) {

                    const originalLevel = currentLevel.value;

                    if (isReview) currentLevel.value = 1;

                    // Pass forceTargetCount=4 if this is a Boss Level context (lv 5, 10, 15, 20...)
                    const forceTC = (lv % 5 === 0) ? 4 : null;
                    q = generateQuestionBySkill(skillId, blanks, forceTC);

                    if (isReview) {

                        currentLevel.value = originalLevel;

                        if (q) { q.meta = q.meta || {}; q.meta.review = true; }

                    }

                    // Goal 2: L5 Boss distractor pool restriction

                    if (q && lv === 5) {

                        const l5Choices = ["は", "の", "が", "を"].sort(() => Math.random() - 0.5);

                        q.choices = l5Choices;

                    }

                    if (q) {

                        const ansStr = Array.isArray(q.answers[0]) ? q.answers[0][0] : q.answers[0];

                        let valid = true;

                        if (skillId === 'NO_POSSESSIVE' && ansStr !== 'の') valid = false;

                        if (skillId === 'WA_TOPIC_BASIC' && ansStr !== 'は') valid = false;

                        if ((skillId === 'GA_INTRANSITIVE' || skillId === 'GA_EXIST_SUBJECT') && ansStr !== 'が') valid = false;

                        if ((skillId === 'WO_OBJECT' || skillId === 'WO_OBJECT_BASIC') && ansStr !== 'を') valid = false;

                        if ((skillId === 'NI_TIME' || skillId === 'NI_EXIST_PLACE') && ansStr !== 'に') valid = false;

                        if ((skillId === 'HE_DEST' || skillId === 'HE_DIRECTION') && ansStr !== 'へ') valid = false;

                        if (skillId === 'MO_ALSO_BASIC' && ansStr !== 'も') valid = false;

                        if (skillId === 'DE_ACTION_PLACE' && ansStr !== 'で') valid = false;

                        if ((skillId === 'TO_WITH' || skillId === 'TO_AND') && ansStr !== 'と') valid = false;

                        // 最終攔截：HE_DIRECTION 自然度與選項避讓

                        if (valid && (skillId === 'HE_DEST' || skillId === 'HE_DIRECTION')) {

                            const left = q.segments[0].text;

                            const right = q.segments[2].text;

                            // Naturalness guard: 阻攔明顯不自然的搭配

                            if (left === '外' && right === '曲がる') {

                                valid = false;

                                if (window.DEBUG_Q_GEN) console.warn(`[NATURALNESS REJECT] HE_DIRECTION: 拒絕「外 x 曲がる」`);

                            }

                            // Choice guard: 確保「に」絕對不會作為干擾項出現（避免移動動詞雙解爭議）

                            if (valid && q.choices && q.choices.includes('に')) {

                                valid = false;

                                if (window.DEBUG_Q_GEN) console.warn(`[CHOICE REJECT] HE_DIRECTION: 檢測到干擾項包含「に」，攔截以確保單一正解`);

                            }

                        }

                        // Removed restrictive MO_ALSO_BASIC guard to allow Action branch (AもVます)

                        if (valid && lv <= 15) {

                            let fullText = "";

                            let blankIndexChar = -1;

                            q.segments.forEach(s => {

                                if (s.isBlank) {

                                    blankIndexChar = fullText.length;

                                    fullText += "___";

                                } else {

                                    fullText += s.text;

                                }

                            });

                            const particles = ['は', 'が', 'を', 'に', 'で', 'へ', 'と', 'も', 'の', 'や'];

                            let failReason = null;

                            if (blankIndexChar > 0) {

                                const prevChar = fullText.substring(blankIndexChar - 1, blankIndexChar);

                                if (particles.includes(prevChar)) failReason = `連續助詞(前): ${prevChar}`;

                            }

                            if (blankIndexChar !== -1 && blankIndexChar + 3 < fullText.length) {

                                const nextChar = fullText.substring(blankIndexChar + 3, blankIndexChar + 4);

                                if (particles.includes(nextChar)) failReason = `連續助詞(後): ${nextChar}`;

                            }

                            if (failReason) {

                                valid = false;

                                if (window.DEBUG_Q_GEN) {

                                    console.warn(`[Q-GEN FAIL] ${skillId} | ${q.chinese} | ${fullText} | ${failReason}`);

                                }

                            } else {

                                if (window.DEBUG_Q_GEN) {

                                    console.log(`[Q-GEN OK] ${skillId} | ${q.chinese} | ${fullText} | Ans: ${ansStr} | Choices: ${q.choices ? q.choices.join(',') : ''}`);

                                }

                            }

                        }

                        if (valid) {

                            generatedFromSkill = true;

                        } else {

                            q = null;

                        }

                    }

                    if (!generatedFromSkill) {

                        attempts++;

                    }

                }

                if (!generatedFromSkill && skillId) {

                    q = safeFallbackQuestion(skillId);

                    if (q) generatedFromSkill = true;

                }

                const REVIEW_FALLBACK_POOLS = { 5: L5_REVIEW_POOL, 10: L10_REVIEW_POOL };
                if (!generatedFromSkill && REVIEW_FALLBACK_POOLS[lv]) {
                    const pool = REVIEW_FALLBACK_POOLS[lv];
                    const fallbackSkillId = pool.find(s => s !== skillId) || pool[0];
                    q = safeFallbackQuestion(fallbackSkillId) || safeFallbackQuestion(pool[0]);
                    if (q) { q.skillId = fallbackSkillId; }
                }

                // 題面去重：若已出現過相同句子，且還有重試額度，退回重抽
                if (q) {
                    const fp = q.segments?.map(s => s.isBlank ? '□' : s.text).join('') || '';
                    if (fp && _seenSentences.has(fp) && _deupRetries < _MAX_DEDUP_RETRIES) {
                        _deupRetries++;
                        if (!_isBossOrSpecial) {
                            _currentSlotRetries++;
                            if (_currentSlotRetries >= 15) {
                                // new skill combo 枯竭：轉向 old pool 補位，保持 Dup:0
                                _normalSlotRetrySkill = null;
                                _forceOldNext = true;
                                _currentSlotRetries = 0;
                            } else {
                                _normalSlotRetrySkill = skillId;
                            }
                        }
                        i--; // 退回此 slot，重新生成
                        continue;
                    }
                    if (fp) _seenSentences.add(fp);
                }
                _normalSlotRetrySkill = null;
                _currentSlotRetries = 0; // 成功 push，重置 per-slot retry 計數
                qList.push(q);

            }

            questions.value = qList;

            currentIndex.value = 0;

            comboCount.value = 0;

            maxComboCount.value = 0;

            totalQuestionsAnswered.value = 0;

            correctAnswersAmount.value = 0;

            earnedExp.value = 0;

            isFinished.value = false;

            userAnswers.value = [];

            slotFeedbacks.value = {};

            hasSubmitted.value = false;

            timeUp.value = false;

            isNextBtnVisible.value = false;

            animatedExp.value = 0;

            // 安全 fallback：全關卡已有 enemies.v1.json；若未比對則用預設屬性
            const mdef = { hpMax: MONSTER_HP, name: '助詞怪', sprite: DEFAULT_IMAGE_PATHS.monsterSprite, trait: '普通型' };

            // 挑選符合目前關卡的怪物資料 (從 enemies.v1.json)

            const enemyMatch = (ENEMIES.value || []).find(e => e.spawnLevels && e.spawnLevels.includes(lv));

            const _isBossLv = (lv % 5 === 0);

            if (enemyMatch) {

                const enemyStats = enemyMatch.enemyStats || {};
                const enemyDamage = enemyStats.damage || {};
                const resolvedHp = enemyStats.hp ?? enemyMatch.hpMax ?? mdef.hpMax;
                const resolvedDamageMin = typeof enemyDamage === 'number'
                    ? enemyDamage
                    : (enemyDamage.min ?? enemyMatch.attackDamageMin ?? 10);
                const resolvedDamageMax = typeof enemyDamage === 'number'
                    ? enemyDamage
                    : (enemyDamage.max ?? enemyMatch.attackDamageMax ?? 20);

                monster.value = {

                    id: enemyMatch.id,

                    hp: resolvedHp,

                    maxHp: resolvedHp,

                    name: enemyMatch.name,

                    sprite: enemyMatch.image,

                    spriteHit: enemyMatch.imageHit || null,

                    trait: enemyMatch.trait,

                    size: enemyMatch.size || (_isBossLv ? 1.2 : 1),

                    posX: enemyMatch.posX ?? null,

                    posY: enemyMatch.posY ?? null,

                    infoOffsetY: enemyMatch.infoOffsetY ?? 0,

                    attackIntervalMs: enemyStats.attackIntervalMs ?? enemyMatch.attackIntervalMs ?? 10000,

                    attackDamageMin: resolvedDamageMin,

                    attackDamageMax: resolvedDamageMax,

                    evasionRate: enemyStats.evasionRate ?? enemyMatch.evasionRate ?? 0.05,

                    attackRingScale: enemyMatch.attackRingScale || 1.0

                };

            } else {

                monster.value = {

                    hp: mdef.hpMax,

                    maxHp: mdef.hpMax,

                    name: mdef.name,

                    sprite: mdef.sprite,

                    spriteHit: null,

                    trait: mdef.trait,

                    size: _isBossLv ? 1.2 : 1,

                    posX: null,

                    posY: null,

                    infoOffsetY: 0,

                    attackIntervalMs: 10000,

                    attackDamageMin: 10,

                    attackDamageMax: 20,

                    evasionRate: 0.05,

                    attackRingScale: 1.0

                };

            }

            // --- Background Assignment ---
            if (config.bgImage && typeof config.bgImage === 'string' && config.bgImage.trim() !== '') {
                currentBg.value = config.bgImage;
            } else {
                currentBg.value = '';
            }

            pushBattleLog(monster.value.name + ' 出現了！', 'info');

            hpBarDanger.value = false;

            if (!triggeredMentor) {

                if (!window._battlePopPlayed) {

                    playSfx('battlePop');

                    window._battlePopPlayed = true;

                }

                startTimer();

            }

            voicePlayedForCurrentQuestion.value = false;

            window.skillId = currentQuestion.value?.skillId;

        };

        const currentQuestion = computed(() => questions.value[currentIndex.value] || { chinese: '', segments: [] });

        let JA_VOICE = null;

        const initJapaneseVoice = () => {

            if (!window.speechSynthesis) return;

            const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('ja'));

            if (voices.length === 0) return;

            JA_VOICE = voices.find(v => v.name.includes('Neural') || v.name.includes('Natural')) ||

                voices.find(v => v.name.includes('Microsoft')) ||

                voices.find(v => v.name.includes('Google')) || voices[0];

        };

        if (window.speechSynthesis) {

            initJapaneseVoice();

            window.speechSynthesis.onvoiceschanged = initJapaneseVoice;

        }

        const praiseToast = ref({ show: false, text: '' });

        let praiseToastTimer = null;

        const FEEDBACK_VOICE_BASE = 'assets/audio/feedback_m4a/';

        const feedbackVoiceWarnedPaths = new Set();

        /** Combo 語音僅在剛達門檻當下播放一次；非門檻不播（16+ 暫無）。 */

        const pickComboTierFeedbackKey = (comboCount) => COMBO_FEEDBACK_MILESTONES[comboCount] || null;

        const playOptionalAudio = (path, options = {}) => {
            if (!path || isMuted.value || sfxVolume.value <= 0 || masterVolume.value <= 0) return;
            try {
                const audio = new Audio(path);
                audio.preload = 'auto';
                audio.volume = Math.max(0, Math.min(1, (options.volume ?? 0.9) * sfxVolume.value * masterVolume.value));
                const warnOnce = (err) => {
                    if (feedbackVoiceWarnedPaths.has(path)) return;
                    feedbackVoiceWarnedPaths.add(path);
                    console.warn('[feedback-voice] optional local file unavailable; skipped', path, err?.name || err?.message || err || '');
                };
                audio.addEventListener('error', () => warnOnce('error'), { once: true });
                const playPromise = audio.play();
                if (playPromise?.catch) playPromise.catch(warnOnce);
            } catch (err) {
                if (!feedbackVoiceWarnedPaths.has(path)) {
                    feedbackVoiceWarnedPaths.add(path);
                    console.warn('[feedback-voice] optional local file unavailable; skipped', path, err?.name || err?.message || err || '');
                }
            }
        };

        const playFeedbackVoice = (categoryOrId) => {
            const files = FEEDBACK_VOICE_PATHS[categoryOrId];
            if (!files || files.length === 0) return;
            const file = files[Math.floor(Math.random() * files.length)];
            playOptionalAudio(FEEDBACK_VOICE_BASE + file);
        };

        let comboFeedbackPlayToken = 0;

        const playComboTierFeedbackVoice = (combo) => {
            const key = pickComboTierFeedbackKey(combo);
            if (!key) return;

            const expectedLevel = currentLevel.value;
            const currentToken = ++comboFeedbackPlayToken;

            setTimeout(() => {
                // 若被新語音蓋過，舊的不播
                if (currentToken !== comboFeedbackPlayToken) return;

                // 檢查是否仍在戰鬥狀態 (同關卡且未結算)
                const inBattle = !showLevelSelect.value && !isFinished.value && currentLevel.value > 0;
                if (!inBattle || currentLevel.value !== expectedLevel) return;

                // 檢查 combo 是否中斷 (允許 combo 繼續增加)
                if (comboCount.value < combo) return;

                playFeedbackVoice(key);
            }, 1000);
        };

        const showPraiseToast = (text, ms = 900) => {

            praiseToast.value.text = text;

            praiseToast.value.show = true;

            if (praiseToastTimer) clearTimeout(praiseToastTimer);

            praiseToastTimer = setTimeout(() => { praiseToast.value.show = false; }, ms);

        };

        const playCorrectFeedback = (combo) => {

            initAudio();

            const style = settings.feedbackStyle || 'oneesan';

            // ⚠️ 移除了這裡過早觸發的 playSfx('hit')，將它移到 checkAnswer 裡的延遲區塊中

            if (style === 'combat') {

                if ([3, 5, 7, 10, 15, 20].includes(combo)) {
                    if (_isMobileSfx) playUiSfx('battlePop'); else playSfx('battlePop');
                }

            } else if (style === 'oneesan') {

                let praiseIndex = 0;

                if (combo >= 20) praiseIndex = 6;

                else if (combo >= 15) praiseIndex = 5;

                else if (combo >= 10) praiseIndex = 4;

                else if (combo >= 7) praiseIndex = 3;

                else if (combo >= 5) praiseIndex = 2;

                else if (combo >= 3) praiseIndex = 1;

                const text = ONEESAN_PRAISES[praiseIndex];

                showPraiseToast(text);

            }

        };

        // ================= [ BATTLE LOGIC ] =================
        const getMasteryParticlesForCurrentQuestion = () => {
            const q = currentQuestion.value;
            if (!q || !Array.isArray(q.answers)) return [];
            const particles = [];
            const blanks = levelConfig.value?.blanks || q.answers.length;
            q.answers.slice(0, blanks).forEach(answerSet => {
                const answer = Array.isArray(answerSet) ? answerSet[0] : answerSet;
                if (MASTERY_PARTICLES.includes(answer) && !particles.includes(answer)) {
                    particles.push(answer);
                }
            });
            return particles;
        };

        const addParticleMasteryProgress = () => {
            getMasteryParticlesForCurrentQuestion().forEach(particle => {
                if (getParticleMastery(particle) >= 100) return;
                const nextCount = (Number(particleCorrectCounts.value[particle] || 0) + 1);
                if (nextCount >= 2) {
                    particleCorrectCounts.value[particle] = nextCount - 2;
                    particleMastery.value[particle] = Math.min(100, getParticleMastery(particle) + 1);
                } else {
                    particleCorrectCounts.value[particle] = nextCount;
                }
            });
            saveProgression();
        };

        const addSkillMasteryProgress = () => {
            const skillId = currentQuestion.value?.skillId;
            if (!skillId || typeof skillId !== 'string') return;
            if (getSkillMastery(skillId) >= 100) return;
            const nextCount = (Number(skillCorrectCounts.value[skillId] || 0) + 1);
            if (nextCount >= 2) {
                skillCorrectCounts.value[skillId] = nextCount - 2;
                skillMastery.value[skillId] = Math.min(100, getSkillMastery(skillId) + 1);
            } else {
                skillCorrectCounts.value[skillId] = nextCount;
            }
            saveProgression();
        };

        const KB_GIRA_RETURN_MS = 2080;

        const clampGiraKb = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

        const computeStrikeGiraKnockVector = (isFlickMode) => {

            let nx = 0;

            let ny = -1;

            const cq = currentQuestion.value;

            const choices = Array.isArray(cq?.choices) ? cq.choices : [];

            const ua = userAnswers.value[0];

            let idx = choices.indexOf(ua);

            const nChoose = choices.length;

            const isBossFight = currentLevel.value % 5 === 0;

            const tierMagBase = isBossFight ? 36 : 66;

            const wMag = (((comboCount.value * 31) + (idx >= 0 ? idx * 17 : comboCount.value * 5)) % 17) - 8;

            const magPx = clampGiraKb(

                tierMagBase + (isBossFight ? wMag * 0.7 : wMag * 1.7),

                isBossFight ? 24 : 48,

                isBossFight ? 48 : 84

            );

            if (isFlickMode && flickState.lastShotDirStored) {

                nx = flickState.lastShotDirNx;

                ny = flickState.lastShotDirNy;

                flickState.lastShotDirStored = false;

            } else {

                flickState.lastShotDirStored = false;

                const slotEl = document.querySelector('.resonance-wheel.tap-mode .resonance-slot.is-correct')

                    || document.querySelector('.tap-mode .resonance-slot.is-selected');

                const monstEl = document.querySelector('img[alt="monster"]');

                const sr = slotEl?.getBoundingClientRect?.();

                const mr = monstEl?.getBoundingClientRect?.();

                if (sr && mr) {

                    const mx = mr.left + mr.width / 2;

                    const my = mr.top + mr.height * 0.52;

                    const sx = sr.left + sr.width / 2;

                    const sy = sr.top + sr.height / 2;

                    const dx = mx - sx;

                    const dy = my - sy;

                    const h = Math.hypot(dx, dy) || 1;

                    nx = dx / h;

                    ny = dy / h;

                } else {

                    const maxI = Math.max(nChoose - 1, 0);

                    const safeIdx = idx >= 0 ? idx : clampGiraKb(Math.floor(maxI / 2), 0, maxI);

                    const leftPick = safeIdx === 0;

                    const rightPick = safeIdx >= maxI || (nChoose === 4 && safeIdx >= 3);

                    if (leftPick && nChoose >= 2) {

                        nx = 0.55;

                        ny = -0.84;

                    } else if (rightPick && nChoose >= 2) {

                        nx = -0.55;

                        ny = -0.84;

                    } else if (safeIdx === 1 && nChoose >= 3) {

                        nx = 0.08;

                        ny = -0.887;

                    } else {

                        const midBump = (((safeIdx % 3) === 1) ? 0.07 : -0.06);

                        nx = midBump;

                        ny = -0.88;

                    }

                    const nh = Math.hypot(nx, ny) || 1;

                    nx /= nh;

                    ny /= nh;

                }

            }

            const seed = (((idx >= 0 ? idx : comboCount.value) + comboCount.value * 2) % 9) - 4;

            const rotDeg = clampGiraKb(seed * 1.05, -5.25, 5.25);

            return { nx, ny, magPx, rotDeg };

        };

        const armStrikeGiraKnockbackMotion = (plan) => {

            if (!plan || !Number.isFinite(plan.nx) || !Number.isFinite(plan.ny)) return;

            cancelMonsterGiraKnockbackTimers();

            monsterGiraKnockActive.value = false;

            const vars = {

                '--giragira-knock-max-x': `${plan.nx * plan.magPx}px`,

                '--giragira-knock-max-y': `${plan.ny * plan.magPx}px`,

                '--giragira-knock-rot': `${plan.rotDeg}deg`

            };

            monsterGiraKnockStyle.value = {};

            nextTick(() => {

                monsterGiraKnockStyle.value = vars;

                monsterGiraKnockActive.value = true;

                giraKnockReleaseTimeoutId = setTimeout(() => {

                    monsterGiraKnockActive.value = false;

                    monsterGiraKnockStyle.value = {};

                    giraKnockReleaseTimeoutId = null;

                }, KB_GIRA_RETURN_MS);

            });

        };

        /** 答案判定入口：計算是否正確、處理傘害 / combo 計數、觸發自動推進郏輯。 */
        const checkAnswer = () => {

            if (hasSubmitted.value) return;

            hasSubmitted.value = true;

            if (heroBuffs.monsterSleep) {

                heroBuffs.monsterSleep = false;

                pushBattleLog('因為你的攻擊，怪物驚醒了！', 'info');

            }

            hpBarDanger.value = false;

            const blanks = levelConfig.value.blanks;

            totalQuestionsAnswered.value++;

            let allCorrect = true;

            currentQuestion.value.answers.slice(0, blanks).forEach((ans, i) => {

                const userIn = (userAnswers.value[i] || "").trim();

                const acceptableAnswers = parseAcceptableAnswers(ans);

                const isCorrect = acceptableAnswers.includes(userIn);

                if (!isCorrect) allCorrect = false;

                // 第一時間讓選項格子變色，給玩家即時反饋

                slotFeedbacks.value[i] = isCorrect ? 'is-correct' : 'is-wrong';

                setTimeout(() => {

                    if (slotFeedbacks.value[i] === (isCorrect ? 'is-correct' : 'is-wrong')) {

                        slotFeedbacks.value[i] = '';

                    }

                }, isCorrect ? 600 : 400);

            });

            const flickDirectionalMiss = answerMode.value === 'flick' && flickState.pendingDirectionalMiss;
            if (flickDirectionalMiss) allCorrect = false;
            flickState.pendingDirectionalMiss = false;

            isCurrentCorrect.value = allCorrect;

            logStageQuestion(allCorrect);

            // 🌟 判定延遲時間：彈射模式等子彈飛 400ms，點選模式可以同步或無延遲 (此處統一使用 400ms 營造打擊節奏)

            const isFlick = answerMode.value === 'flick';

            const impactDelay = isFlick ? 400 : 0;

            setTimeout(() => {

                if (!isCurrentCorrect.value) {

                    flickState.lastShotDirStored = false;

                }

                if (isCurrentCorrect.value) {

                    correctAnswersAmount.value++;

                    addSkillMasteryProgress();

                    playCorrectFeedback(comboCount.value + 1);

                    // 🔋 SP Reward: +1 on correct answer
                    regenSP();

                    const isPlayerMiss = (heroBuffs.giragiraTurns > 0 || heroBuffs.monsterSleep) ? false : (Math.random() < (monster.value?.evasionRate ?? 0.05));

                    if (isPlayerMiss) {

                        if (_isMobileSfx) playUiSfx('miss'); else playSfx('miss');

                        pushBattleLog(`攻擊被閃避了！沒造成傷害！`, 'info');

                        monsterDodge.value = true;
                        setTimeout(() => { monsterDodge.value = false; }, 800);

                    } else {

                        const strikeIsGira = heroBuffs.giragiraTurns > 0;

                        monsterHit.value = true;

                        setTimeout(() => { monsterHit.value = false; }, 500); // 延長至 0.5s

                        if (strikeIsGira) {
                            monsterHitGiragira.value = true;
                            scheduleBattleFlowTimeout(() => { monsterHitGiragira.value = false; }, 430);
                        }

                        // 正式版：只有怪物將在 2 秒內出手時，命中才追加 1 秒硬直

                        if (timeLeft.value < 2.0) {

                            timeLeft.value += 1.0;

                        }

                        // 新增邏輯：當敵方速度極快時（enemyAtbMult < 0.2），命中時獲得額外時間獎勵

                        if (10 * heroBuffs.enemyAtbMult < 2.0) {

                            timeLeft.value += 1.0 / heroBuffs.enemyAtbMult;

                        }

                        // 🌟 子彈抵達瞬間！完美同步播放打擊音效
                        const currentHitSfx = (heroBuffs.giragiraTurns > 0) ? 'hit2' : 'hit';
                        if (_isMobileSfx) playUiSfx(currentHitSfx); else playSfx(currentHitSfx);

                        // 💡 點選(Tap)模式：一般攻擊補命中爆炸；GIRAGIRA 改由專用斬擊 VFX 主導，避免與黃圈疊成「普通感」

                        if (!isFlick && !strikeIsGira) {

                            const monsterEl = document.querySelector('img[alt="monster"]') || document.querySelector('.w-28.h-28.rounded-full');

                            const center = rectCenter(monsterEl);

                            if (center) spawnHitVfx(center.x, center.y);

                        }

                        // GIRAGIRA 強化命中特效（斬光 + 爆裂層）
                        if (strikeIsGira && typeof window.spawnGiraGiraHitVfx === 'function') {
                            const giraEl = document.querySelector('img[alt="monster"]') || document.querySelector('.w-28.h-28.rounded-full');
                            const giraCenter = rectCenter(giraEl);
                            if (giraCenter) {
                                const giraDelay = isFlick ? 380 : 0;
                                setTimeout(() => {
                                    if (typeof window.spawnGiraGiraHitVfx === 'function') window.spawnGiraGiraHitVfx(giraCenter.x, giraCenter.y);
                                    if (typeof window.spawnGiraGiraBurstVfx === 'function') window.spawnGiraGiraBurstVfx(giraCenter.x, giraCenter.y);
                                }, giraDelay);
                            }
                        }

                        comboCount.value++;

                        const giraKbPlan = strikeIsGira ? computeStrikeGiraKnockVector(isFlick) : null;

                        playComboTierFeedbackVoice(comboCount.value);

                        showComboPopup(comboCount.value);

                        if (comboCount.value > maxComboCount.value) maxComboCount.value = comboCount.value;

                        const timeTaken = (Date.now() - questionStartTime) / 1000;
                        const maxDamage = getComboMaxDamage(comboCount.value);
                        let baseDmg = maxDamage;
                        if (timeTaken <= 2) baseDmg = maxDamage;
                        else if (timeTaken >= 10) baseDmg = 5;
                        else baseDmg = Math.round(maxDamage - ((timeTaken - 2) / 8) * (maxDamage - 5));

                        // 加入 ±1 隨機浮動
                        const jitter = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
                        let dmg = Math.min(maxDamage, baseDmg + jitter);
                        // GIRAGIRA Bonus & Cap Bypass
                        if (heroBuffs.giragiraTurns > 0) {
                            dmg = Math.round(baseDmg * 1.5);
                            heroBuffs.giragiraTurns--;

                            // UI Update Trigger
                            if (typeof updateHeroStatusBar === 'function') updateHeroStatusBar();

                            pushBattleLog(`ギラギラ：鋒芒畢露！造成 ${dmg} 點必命中傷害！`, 'buff');

                            if (heroBuffs.giragiraTurns <= 0) {
                                heroBuffs.giragiraTurns = 0;
                                if (typeof updateHeroStatusBar === 'function') updateHeroStatusBar();
                                if (typeof pushBattleLog === 'function') {
                                    pushBattleLog("ギラギラ 效果結束（鋒芒收斂）", 'info');
                                }
                            }
                        }

                        if (voicePlayedForCurrentQuestion.value) {

                            dmg = Math.max(2, Math.floor(dmg / 2));

                            pushBattleLog('偷聽：傷害減半', 'buff');

                        }

                        monster.value.hp = Math.max(0, monster.value.hp - dmg);

                        // Trigger hit feedback: sprite / anim / stun
                        monsterHit.value = true;
                        monsterHitImageFailed.value = false;
                        monsterStunSeconds.value = 0.8; // 0.8s hit-stun
                        setTimeout(() => { monsterHit.value = false; }, 400);

                        window.spawnFloatingDamage('monster', dmg, 'hp', strikeIsGira ? { giraStrike: true } : null);

                        if (giraKbPlan && monster.value.hp > 0 && !monsterIsDying.value && !bossDeathVfxActive.value) {

                            armStrikeGiraKnockbackMotion(giraKbPlan);

                        }

                        if (monster.value.hp <= 0) {
                            if (window.__AUTO_ADVANCE_TIMEOUT) { clearTimeout(window.__AUTO_ADVANCE_TIMEOUT); window.__AUTO_ADVANCE_TIMEOUT = null; }
                            grantRewards();
                        }

                    }

                } else {

                    comboCount.value = 0;

                    addMistake();

                    initAudio();

                    if (_isMobileSfx) playUiSfx('miss'); else playSfx('miss');

                    playFeedbackVoice('wrong');

                    pushBattleLog(`攻擊失敗！`, 'info');

                    if (window.__TTS_ON_WRONG_TIMEOUT) { clearTimeout(window.__TTS_ON_WRONG_TIMEOUT); window.__TTS_ON_WRONG_TIMEOUT = null; }

                    if (settings.autoReadOnWrong) {

                        let azureTextBuilder = '';

                        currentQuestion.value.segments.forEach(s => {

                            if (s.isBlank) {

                                let ans = currentQuestion.value.answers[s.blankIndex];

                                if (Array.isArray(ans)) ans = ans[0];

                                azureTextBuilder += ans;

                            } else {

                                azureTextBuilder += s.text;

                            }

                        });

                        let cleanQuestionText = azureTextBuilder.replace(/[_ ]/g, '').replace(/（[^）]*）|\([^)]*\)/g, '');

                        if (!cleanQuestionText) cleanQuestionText = azureTextBuilder.replace(/[_ ]/g, '') || '';

                        const ttsQuestionIdx = currentIndex.value;

                        if (cleanQuestionText) {

                            startSfxDuck(1800);

                            window.__TTS_ON_WRONG_TIMEOUT = setTimeout(() => {

                                if (currentIndex.value === ttsQuestionIdx && hasSubmitted.value && !isCurrentCorrect.value && !monsterDead.value && !playerDead.value && !isFinished.value && !showLevelSelect.value) {

                                    speakCloudTts(cleanQuestionText);

                                }

                            }, 220);

                        }

                    }

                }

                if (window.__AUTO_ADVANCE_TIMEOUT) { clearTimeout(window.__AUTO_ADVANCE_TIMEOUT); window.__AUTO_ADVANCE_TIMEOUT = null; }

                let delayMs = isCurrentCorrect.value

                    ? (settings.correctAdvanceDelayMs !== null && typeof settings.correctAdvanceDelayMs === 'number' ? settings.correctAdvanceDelayMs : 1000)

                    : (settings.wrongAdvanceDelayMs !== null && typeof settings.wrongAdvanceDelayMs === 'number' ? settings.wrongAdvanceDelayMs : 3000);

                if (delayMs > 0 && !monsterDead.value) {

                    window.__AUTO_ADVANCE_TIMEOUT = setTimeout(() => {

                        if (!isFinished.value && !monsterDead.value && !playerDead.value && !showLevelSelect.value) {

                            if (window.__TTS_ON_WRONG_TIMEOUT) { clearTimeout(window.__TTS_ON_WRONG_TIMEOUT); window.__TTS_ON_WRONG_TIMEOUT = null; }

                            nextQuestion();

                        }

                    }, delayMs);

                }

            }, impactDelay); // 🌟 結束 400ms 延遲包覆

        };

        const nextQuestion = () => {

            if (window.__TTS_ON_WRONG_TIMEOUT) { clearTimeout(window.__TTS_ON_WRONG_TIMEOUT); window.__TTS_ON_WRONG_TIMEOUT = null; }

            if (window.__AUTO_ADVANCE_TIMEOUT) { clearTimeout(window.__AUTO_ADVANCE_TIMEOUT); window.__AUTO_ADVANCE_TIMEOUT = null; }

            initAudio();

            resumePageAudioOnGesture();

            playSfx('click');

            currentIndex.value++;

            if (currentIndex.value >= questions.value.length) currentIndex.value = 0;

            userAnswers.value = [];

            slotFeedbacks.value = {};

            hasSubmitted.value = false;

            applyTurnLogic();

            if (answerMode.value === 'flick') {

                flickState.isArmed = false;

                flickState.activeOpt = null;
                flickState.pendingDirectionalMiss = false;

            }

            const vfxLayer = document.getElementById('flickVfxLayer');

            if (vfxLayer) vfxLayer.innerHTML = '';

            questionStartTime = Date.now();

            voicePlayedForCurrentQuestion.value = false;

        };

        const grantRewards = () => {
            if (monsterIsDying.value || monsterTrulyDead.value || monsterResultShown.value) return;

            finishStageClearTimer();

            resetBattleOutcomePresentation();

            const lv = currentLevel.value;
            resultSpirit.value = getResultSpiritForLevel(lv);

            const baseExp = 50 + (lv * 20);

            earnedExp.value = baseExp;

            player.value.exp += earnedExp.value;

            // Unconditional HP/SP Reset on Victory
            player.value.hp = player.value.maxHp;
            resetSP();

            pushBattleLog(`擊敗怪物！獲得 ${earnedExp.value} EXP`, 'buff');

            clearTimer();

            const isBossStandard = currentLevel.value % 5 === 0;
            const useBossDeathPresentation = isBossStandard || currentLevel.value === 36;
            if (isBossStandard) {
                playBossDeathCrySfx();
            } else {
                playMonsterDeathCrySfx();
            }
            monsterIsDying.value = true;
            const finalizeVictoryFlow = () => {
                cleanupBossDeathSequence();

                monsterTrulyDead.value = true;

                monsterResultShown.value = true;

                // Update progression

                lastClearedLevel.value = currentLevel.value;

                if (!clearedLevels.value.includes(currentLevel.value)) {

                    clearedLevels.value.push(currentLevel.value);

                }

                // Update best grade

                const currentG = calculatedGrade.value;

                const oldG = bestGrades.value[currentLevel.value];

                if (window.JPAPPResultDisplayManager.shouldUpdateBestGrade(currentG, oldG, GRADE_RANK)) {

                    bestGrades.value[currentLevel.value] = currentG;

                }

                updateStageBestRecord();

                const nextLv = currentLevel.value + 1;

                if (nextLv < maxLevel.value && !unlockedLevels.value.includes(nextLv)) {

                    unlockedLevels.value.push(nextLv);

                    newUnlockLv.value = nextLv; // Mark for highlight and scroll

                } else {

                    newUnlockLv.value = null;

                }

                // Boss ability rewards are now handled in the tally sequence via rewardAbilityId

                saveProgression();

                stopAllAudio();

                if (isBossStandard) {

                    playSfx('bossClear');

                } else {

                    playSfx('win');

                }

                setHeroAvatar('win');

                // 🌟 第二階段：死亡演出結束後，檢查是否有新技能知識卡需要播放
                // 如果有卡片，播放完畢後才進入數字遞增環節
                scheduleBattleFlowTimeout(() => {

                    const proceedToTally = () => {
                        playSfx('fanfare');
                        startTallySequence();
                    };

                    if (pendingKnowledgeCards.value.length > 0) {
                        window._afterKnowledgeCards = proceedToTally;
                        triggerNextKnowledgeCard();
                    } else {
                        proceedToTally();
                    }

                }, 800);

            };

            if (useBossDeathPresentation) {
                startBossDeathSequence(finalizeVictoryFlow);
            } else {
                scheduleBattleFlowTimeout(finalizeVictoryFlow, 2000);
            }

            // 拆分出數字遞增邏輯，確保在正確時機點火

            const startTallySequence = () => {

                const expTarget = earnedExp.value;

                const maxUnits = expTarget;

                let calculatedDuration = (maxUnits / 30) * 1000;

                const duration = Math.min(Math.max(calculatedDuration, 800), 2000);

                const startTime = Date.now();

                const animateRewards = () => {

                    const elapsed = Date.now() - startTime;

                    const progress = Math.min(elapsed / duration, 1);

                    animatedExp.value = Math.floor(expTarget * progress);

                    if (progress < 1) {

                        requestAnimationFrame(animateRewards);

                    } else {

                        // 🌟 第三階段：遞增完成後，才顯示 Next 鈕

                        animatedExp.value = expTarget;

                        scheduleBattleFlowTimeout(() => {

                            const clearedLevelConfig = LEVEL_CONFIG.value[currentLevel.value];

                            if (clearedLevelConfig?.rewardAbilityId) {

                                const rewardedSkill = grantAbilityReward(clearedLevelConfig.rewardAbilityId);

                                if (rewardedSkill) {

                                    pendingLevelUpAbility.value = rewardedSkill;

                                    saveProgression();

                                    isAbilityUnlockModalOpen.value = true;

                                    return;

                                }

                            }

                            isNextBtnVisible.value = true;

                        }, 300);

                    }

                };

                requestAnimationFrame(animateRewards);

            };

        };

        const getInputStyle = (idx) => {

            if (!hasSubmitted.value) return '';

            return slotFeedbacks.value[idx] || '';

        };

        const displaySegments = computed(() => {

            const q = currentQuestion.value;

            const blanks = levelConfig.value.blanks;

            return (q.segments || []).map(seg => {

                if (!seg.isBlank) return { ...seg, showInput: false };

                return { ...seg, showInput: seg.blankIndex < blanks };

            });

        });

        const handleMonsterImageError = () => {

            // 如果是在嘗試播放受擊圖 (*2) 時出錯，則標記該怪物不支援受擊圖並恢復原圖

            if (monsterHit.value && !monsterHitImageFailed.value) {

                monsterHitImageFailed.value = true;

                return;

            }

            isMonsterImageError.value = true;

        };

        const handleMapImageError = (e) => {

            console.warn('[MapImage] Load failed, falling back to chapter1.png');

            e.target.src = DEFAULT_IMAGE_PATHS.mapFallback;

        };

        const getAnswerForDisplay = (blankIndex) => {

            const ans = currentQuestion.value.answers[blankIndex];

            return Array.isArray(ans) ? ans[0] : ans;

        };

        const currentMonsterSprite = computed(() => {

            if (!monster.value || !monster.value.sprite) return '👹';

            if (isMonsterImageError.value) return DEFAULT_IMAGE_PATHS.monsterSprite;

            // 只有在受擊中、非錯誤狀態、且該怪物尚未被標記為缺乏 *2 圖時，嘗試切換

            if (monsterHit.value && !monsterHitImageFailed.value) {
                if (monster.value.spriteHit) return monster.value.spriteHit;
            }

            return monster.value.sprite;

        });

        const monsterPositionStyle = computed(() => {

            const x = monster.value?.posX;

            const y = monster.value?.posY;

            if (x == null && y == null) return {};

            return { transform: `translateX(${x ?? 0}%) translateY(${y ?? 0}%)` };

        });

        const selectChoice = (opt) => {

            initAudioCtx();

            if (!audioInited.value) initAudio();

            resumePageAudioOnGesture();

            playSfx('click');

            if (hasSubmitted.value) return;

            userAnswers.value[0] = opt;

        };

        const getChoiceBtnClass = (opt) => {

            if (!hasSubmitted.value) {

                return (userAnswers.value[0] === opt) ? 'is-selected' : 'is-idle';

            }

            const correct = Array.isArray(currentQuestion.value.answers[0]) ? currentQuestion.value.answers[0] : [currentQuestion.value.answers[0]];

            const isCorrectOpt = correct.includes(opt);

            const isSelected = userAnswers.value[0] === opt;

            if (isCorrectOpt) return 'is-correct';

            if (isSelected) return 'is-wrong';

            return 'is-disabled';

        };

        const monsterDead = computed(() => monster.value.hp <= 0);

        const playerDead = computed(() => player.value.hp <= 0);

        const proceedToNextLevel = () => {

            currentLevel.value++;

            if (currentLevel.value > maxLevel.value) {

                isFinished.value = true;

                return;

            }

            initGame(currentLevel.value);

            pickBattleBgm(currentLevel.value);

            playBgm();

        };

        // ================= [ PROGRESSION & REWARDS ] =================

        const confirmAbilityUnlockAndContinue = () => {

            isAbilityUnlockModalOpen.value = false;

            pendingLevelUpAbility.value = null;

            if (queuedNextLevel.value !== null) {

                // 原本 goNextLevel 流程已經把 currentLevel.value++ 放在 proceedToNextLevel 裡了

                // 這裡我們直接呼叫 proceedToNextLevel 即可

                proceedToNextLevel();

                queuedNextLevel.value = null;

            } else {

                // 來自結算後即時發放路徑：只需顯示 Next 鈕

                isNextBtnVisible.value = true;

            }

            resumeBattle();

        };

        const retryLevel = () => {
            needsUserGestureToResumeBgm.value = false;
            isBgmSuppressed.value = false; // Explicitly unlock on retry
            resetStageClearMetrics();
            stopAllAudio();
            initGame(currentLevel.value);
        };

        const revive = () => {

            isDefeated.value = false;
            isBgmSuppressed.value = false; // Unlock on revive
            resetStageClearMetrics();
            const _sc = document.getElementById('battleScene');
            if (_sc) _sc.classList.remove('grayscale-filter');
            const _ov = document.getElementById('defeatOverlay');
            if (_ov) _ov.classList.add('hidden');

            setHeroAvatar('neutral');

            clearSpeedStatus();

            window.heroHP = 100;

            window.heroMaxHP = 100;

            updateHeroStatusBar();

            isMistakesOpen.value = false;

            isMenuOpen.value = false;

            stopAllAudio();

            clearTimer();

            if (pauseTimerId) { clearInterval(pauseTimerId); pauseTimerId = null; }

            needsUserGestureToResumeBgm.value = false;

            player.value = { hp: 100, maxHp: 100, exp: 0 };

            inventory.value.potions = INITIAL_POTIONS;

            resetSP();

            showLevelSelect.value = true;

        };

        const {
            accuracyPct,
            calculatedGrade,
            stageClearTimeText,
            stageStarRating,
            stageStarDisplay,
            getStageBestRecord,
            getStageBestStarsDisplay,
            getStageBestTimeText,
            stageRecordRows,
            sRankCount
        } = window.JPAPPResultDisplayManager.createVueBindings(
            { computed },
            {
                totalQuestionsAnswered,
                correctAnswersAmount,
                stageClearElapsedSeconds,
                currentLevel,
                monsterDead,
                playerDead,
                LEVEL_CONFIG,
                formatStageClearTime,
                maxLevel,
                skillsAll,
                clearedLevels,
                bestGrades,
                stageBestRecords,
                normalizeStageBestRecord,
                maxRankCountStages: 35
            }
        );

        const buildCurrentStageRecord = () => window.JPAPPResultDisplayManager.buildCurrentStageRecordPayload({
            totalQuestionsAnswered: totalQuestionsAnswered.value,
            correctAnswersAmount: correctAnswersAmount.value,
            stageClearElapsedSeconds: stageClearElapsedSeconds.value,
            currentLevelId: currentLevel.value,
            maxComboCount: maxComboCount.value,
            stageStarRatingValue: stageStarRating.value,
            LEVEL_CONFIG: LEVEL_CONFIG.value
        });

        const updateStageBestRecord = () => {
            if (!monsterDead.value || playerDead.value) {
                stageResultIsNewBest.value = false;
                return false;
            }

            const stageId = String(currentLevel.value);
            const nextRecord = buildCurrentStageRecord();
            const currentRecord = normalizeStageBestRecord(stageBestRecords.value[stageId]);

            if (!isStageRecordBetter(nextRecord, currentRecord)) {
                stageResultIsNewBest.value = false;
                return false;
            }

            stageBestRecords.value = {
                ...stageBestRecords.value,
                [stageId]: nextRecord
            };
            stageResultIsNewBest.value = true;
            return true;
        };

        const handleReload = () => {
            isMenuOpen.value = false;
            window.JPAPPSettingsManager.scheduleReloadClearingJpRpgAppVersionFlag();
        };

        onMounted(() => {

            window.JPAPPChangelogManager.applyVersionStoragePolicy(APP_VERSION);

            const unlockAudioOnce = () => {
                // Warm up critical SFX
                try { warmupSfx(); } catch(e) {}

                initAudioCtx().then(() => {

                    if (!audioInited.value) initAudio();

                });

            };

            document.addEventListener('pointerdown', unlockAudioOnce, { once: true, capture: true });

            document.addEventListener('touchstart', unlockAudioOnce, { once: true, capture: true, passive: true });

            window.JPAPPSettingsManager.installTapChoicesLayoutHooks({
                watch, nextTick, answerMode, hasSubmitted
            });
            window.JPAPPSettingsManager.installQuestionAreaCompactLayoutHooks({
                watch, nextTick, displaySegments, hasSubmitted, userAnswers
            });

            window.__initCornerMenu?.(watch, showLevelSelect, isFinished);

            window.__initViewportHooks?.(watch, showLevelSelect);

        });

        const shouldShowNextButton = computed(() => {

            if (!hasSubmitted.value) return false;

            if (isCurrentCorrect.value && settings.correctAdvanceDelayMs === 0) return true;

            if (!isCurrentCorrect.value && settings.wrongAdvanceDelayMs === 0) return true;

            return false;

        });

        // ================= [ DEBUG TOOLS — LEVEL JUMP ] =================
        const debugJumpToLevel = (level) => {
            resetBattleOutcomePresentation();

            const lv = Math.max(1, Math.min(level, maxLevel.value || 99));

            initAudioCtx();

            if (audioCtx.value && audioCtx.value.state === 'suspended') {

                audioCtx.value.resume().catch(() => { });

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
            grantRewards, playerDead, monsterIsDying, monsterTrulyDead, monsterResultShown
        });

        return {
            isNextBtnVisible,
            animatedExp,
            isAudioDebugEnabled, isAudioDebugOpen, isAudioDebugDragging, audioDebugOverlayStyle, audioDebugSections, refreshAudioDebugState, startAudioDebugDrag, debugResumeAudioContext, debugTestSfx, debugTestBgmPlay, debugPauseBgm, debugTestRawAudio, debugEnableHtmlAudioFallback, debugDisableHtmlAudioFallback, debugEnableFallbackAudioContextV2, debugDisableFallbackAudioContextV2, debugResumeFallbackAudioContext, debugTestFallbackContextBgm, debugTestFallbackBgm, debugTestFallbackSfx, debugShowAudioState,
            answerMode, flickState, handleRuneClick, startFlick, moveFlick, endFlick, appVersion, isChangelogOpen, changelogData, changelogError, openChangelog, questions, currentIndex, currentQuestion, userAnswers, hasSubmitted, comboCount, maxComboCount, currentLevel, maxLevel, LEVEL_CONFIG, levelConfig, levelTitle, isChoiceMode, showLevelSelect, difficulty, player, monster, inventory, playerBlink, hpBarDanger, isFinished, isCurrentCorrect, timeLeft, timeUp, battleMessage, mistakes, stageLog, isMenuOpen, isMistakesOpen, monsterHit, monsterHitGiragira, monsterGiraKnockActive, monsterGiraKnockStyle, screenShake, bossScreenShake, flashOverlay, bgmVolume, sfxVolume, isMuted, isPreloading, monsterDead, playerDead, displaySegments, getAnswerForDisplay, selectChoice, getChoiceBtnClass, checkAnswer, nextQuestion, getInputStyle, initGame, retryLevel, revive, startLevel, usePotion, clearMistakes, playBgm, playSfx, playMistakeVoice, saveAudioSettings, startRunAwayPress, cancelRunAwayPress, isRunAwayPressing, onUserGesture, currentBg, accuracyPct, calculatedGrade, stageStarRating, stageStarDisplay, stageClearTimeText, stageResultIsNewBest, getStageBestRecord, getStageBestStarsDisplay, getStageBestTimeText, resultSpirit, skillsAll, unlockedSkillIds, isCodexOpen, codexPage, codexChapter, flippedCardId, codexChapterList, codexFilteredSkills, codexTotalPages, codexPageSkills, codexNextSkill, closeCodex, pauseBattle, resumeBattle, isPlayerDodging, isSkillOpen, openSkillOverlay, closeSkillOverlay,
            handleEscapeToMap, escapeOverlayVisible, escapeOverlayOpacity, isEscaping,
            heroBuffs,
            skillList, castAbility, spState, settings, shouldShowNextButton, praiseToast, comboPopup, monsterDodge, isDefeated, defeatReturn, HERO_VISUAL_CONFIG, getSkillTypeLabel,
            formatParticleBadge, formatSkillSpiritName, formatSkillMeaning, formatSkillRule, formatUnlockLevel,
            particleMastery, particleCorrectCounts, skillMastery, skillCorrectCounts, getParticleMastery, getParticleMasteryStyle, getSkillMastery, getSkillMasteryStyle,
            isMonsterCodexOpen, openMonsterCodex, monsterCodexEntries, selectedMonsterCodexEntry, selectMonsterCodexEntry, handleMonsterCodexImageError,
            pendingLevelUpAbility, isAbilityUnlockModalOpen, confirmAbilityUnlockAndContinue,
            isMentorModalOpen, isLevelJumpOpen, isAdvancedSettingsOpen, isStageRecordsOpen, stageRecordRows, debugJumpToLevel, mentorTutorialSeen, currentMentorSkill, mentorDialogueIndex, currentMentorLine, isLastMentorLine, nextMentorLine,
            displayedMentorText, isTypingMentor, restartMentorDialogue, finishMentorDialogue, isMentorPortraitError, mentorPages,
            currentMentorDialogueItem, currentMentorSceneImage, currentMentorModalImage, handleMentorSceneImageError, handleMentorModalImageError,
            mentorVideoEl, mentorVideoSources, shouldUseMentorVideo, shouldMuteMentorVideo, mentorVideoPoster, handleMentorVideoError,
            playPrologueOpening, playMainEndingFinale,
            handleSpiritIconError, getSpiritIconPath, shouldShowSpiritIcon, failedSpiritIcons,
            isMentorSkipPressing, startMentorSkipPress, cancelMentorSkipPress,
            isMonsterImageError, handleMonsterImageError, handleMapImageError, currentMonsterSprite, monsterPositionStyle, monsterIsEntering, monsterIsDying, monsterTrulyDead, monsterResultShown, bossDeathVfxActive, bossDeathStage, monsterAttackLunge,
            showMap, unlockedLevels, clearedLevels,
            openMap, isLevelUnlocked, isLevelCleared, getStageNodeClass, getLevelTitle, getStageFocusParticle, getStageFocusLabel, hasMentor,

            selectStageFromMap, startStageWithExplanation, returnToMap,

            newUnlockLv, bestGrades, stageBestRecords, getGradeColor, sRankCount,

            mapChapters, activeChapter, getMapNodeStyle, selectedSegmentIdx, isSegmentUnlocked, handleMapTabClick, jumpToMapSegment, isMapDropdownOpen,

            isBattleConfirmOpen, selectedStageToConfirm, stageConfirmSuspendedForMentor, confirmAndStartBattle,

            isMapMentorOpen,

            pendingKnowledgeCards, activeKnowledgeCard, isKnowledgeCardShowing, isKnowledgeCardAbsorbing, triggerNextKnowledgeCard, closeKnowledgeCard,
            getSpiritForSkill, getSpiritForKnowledgeCard, getSpiritImageSrc, handleSpiritImageError,
            isSpecialSceneActive, specialSceneBg,
        };

    }

});
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => _jpApp.mount('#app'));
} else {
    _jpApp.mount('#app');
}
