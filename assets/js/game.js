


window.__sp = { cur: 20, max: 20 };

window.spawnFloatingDamage = function(target, amount) {
    const vfxLayer = document.getElementById('global-vfx-layer');
    if (!vfxLayer) return;

    let targetEl;
    if (target === 'player') {
        targetEl = document.querySelector('#playerStatusBar') || document.querySelector('.hero-avatar') || document.querySelector('.hud-bg');
    } else {
        targetEl = document.querySelector('#monsterStatusBar') || document.querySelector('.monster-img-boss') || document.querySelector('.monster-img-normal') || document.querySelector('.monster-breath');
    }

    let x, y;
    if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        if (target === 'monster') {
            x = rect.left + rect.width / 2;
            y = rect.top + rect.height * 0.65;
        } else {
            x = rect.left + rect.width * 0.85;
            y = rect.top - 10;
        }
    } else {
        x = window.innerWidth / 2;
        y = target === 'player' ? window.innerHeight - 150 : window.innerHeight / 2 - 50;
    }

    const el = document.createElement('div');
    el.className = `floating-dmg-ui floating-dmg-${target}`;
    
    let fontSize = 14 + (amount * 0.9);
    fontSize = Math.min(Math.max(fontSize, 14), 48);
    
    const dir = Math.random() > 0.5 ? 1 : -1;
    const dx = (Math.random() * 45 + 35) * dir;
    const dy = (Math.random() * -15 - 5);
    const bounce1 = Math.random() * 15 + 10;
    const rot = (Math.random() * 20 - 10);

    el.style.setProperty('--dx', `${dx}px`);
    el.style.setProperty('--dy', `${dy}px`);
    el.style.setProperty('--bounce1', `${bounce1}px`);
    el.style.setProperty('--rot', `${rot}deg`);

    const ox = (Math.random() - 0.5) * 20;
    const oy = (Math.random() - 0.5) * 10;

    el.style.left = `${x + ox}px`;
    el.style.top = `${y + oy}px`;
    el.style.fontSize = `${fontSize}px`;
    el.innerHTML = `-${amount}`;

    vfxLayer.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 1200);
};



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

        onMounted(async () => {
            // Load Map Chapter Data (Ensuring this runs on all environments)
            try {
                const resp = await fetch('assets/data/map-chapters.json?v=' + (window.APP_VERSION || Date.now()));
                if (resp.ok) {
                    mapChapters.value = await resp.json();
                    console.log('[MapData] chapters loaded');
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
            script.onload = () => console.log(`[AZURE] config.local.js loaded`);
            script.onerror = () => { };
            document.head.appendChild(script);
        });



        // ================= [ CONFIG & STATE — VUE REACTIVE SETUP ] =================
        // --- 資料抽離：讀取全域早期關卡資料庫 ---

        const pool = window.EARLY_GAME_POOLS || { config: {}, legacyDb: {}, skills: {} };

        const db = pool.legacyDb || {};

        const fallbackLevels = pool.config?.fallbackLevels || {};

        const LEVEL_CONFIG = ref(fallbackLevels);

        const SKILLS = ref([]);

        const ENEMIES = ref([]);

        const MENTOR_AUDIO_MAP = ref({});

        const isMonsterImageError = ref(false);

        const VOCAB = ref(null);

        const maxLevel = ref(35);



        // --- Stage Map / Progression State ---

        const PROGRESSION_KEY = 'jpapp_progression_v1';

        const showMap = ref(false);

        const unlockedLevels = ref([1]);

        const totalGold = ref(0);

        const lastClearedLevel = ref(null);

        const newUnlockLv = ref(null);

        const bestGrades = ref({}); // { stageNumber: 'S' }

        const clearedLevels = ref([]);

        const showMentorChoice = ref(false);

        const selectedMapLevel = ref(null);



        const mapChapters = ref({});

        const activeChapter = ref('chapter1');

        const selectedSegmentIdx = ref(0);

        const selectedStageToConfirm = ref(null);

        const isBattleConfirmOpen = ref(false);

        // --- Knowledge Card Unlock State ---
        const pendingKnowledgeCards = ref([]);
        const activeKnowledgeCard = ref(null);
        const isKnowledgeCardShowing = ref(false);
        const isKnowledgeCardAbsorbing = ref(false);

        const activeSegment = computed(() => {
            const ch = mapChapters.value[activeChapter.value];
            if (!ch || !ch.segments) return null;
            return ch.segments[selectedSegmentIdx.value] || null;
        });

        const currentMapBgm = computed(() => {
            return activeSegment.value?.mapBgm || 'assets/audio/bgm/map.mp3';
        });



        const autoSelectSegment = () => {

            const maxUnlocked = Math.max(...unlockedLevels.value, 1);

            // Dynamic selection: 1-5 -> 0, 6-10 -> 1, 11-15 -> 2, etc.

            selectedSegmentIdx.value = Math.floor((maxUnlocked - 1) / 5);
        };

        const isSegmentUnlocked = (idx) => {

            if (idx === 0) return true;

            // Chapter 8 (segment 7) becomes accessible once L35 is cleared so the
            // player can see the locked Stage 36 and its S-rank seal progress.
            if (idx === 7) return clearedLevels.value.includes(35);

            const maxUnlocked = Math.max(...unlockedLevels.value, 1);

            // A segment is unlocked if the first level of that segment is unlocked

            return maxUnlocked >= (idx * 5) + 1;

        };

        const getMapNodeStyle = (node) => {

            if (!node) return {};

            

            const isDesktop = window.innerWidth >= 1024;

            let x = node.x;

            let y = node.y;



            if (isDesktop) {

                if (node.desktopX !== undefined) x = node.desktopX;

                if (node.desktopY !== undefined) y = node.desktopY;

            } else {

                if (node.mobileX !== undefined) x = node.mobileX;

                if (node.mobileY !== undefined) y = node.mobileY;

            }



            return {

                left: x + '%',

                bottom: y + '%',

                position: 'absolute',

                transform: 'translate(-50%, 50%)' // Center the anchor

            };

        };







        let _pendingAbilityIds = null;

        const saveProgression = () => {

            try {

                const data = {

                    unlockedLevels: unlockedLevels.value,

                    clearedLevels: clearedLevels.value,

                    bestGrades: bestGrades.value,

                    unlockedAbilityIds: unlockedAbilityIds.value,

                    gold: totalGold.value,

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

                    if (parsed.unlockedAbilityIds) _pendingAbilityIds = parsed.unlockedAbilityIds;

                    if (typeof parsed.gold === 'number') totalGold.value = parsed.gold;

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



        const openMap = () => {

            // 在能確定屬於 user gesture 的 handler 中先解鎖並首播 map BGM (第二版修正)

            try {

                if (typeof unlockAudioOnce === 'function') unlockAudioOnce();

                

                if (typeof bgmAudio !== 'undefined') {

                    const expectedAbs = new URL('assets/audio/bgm/map.mp3', window.location.href).href;

                    if (!bgmAudio.value) {

                        bgmAudio.value = new Audio();

                        bgmAudio.value.crossOrigin = "anonymous";

                        bgmAudio.value.preload = "auto";

                        bgmAudio.value.loop = true;

                        if (typeof audioPool !== 'undefined') {

                            audioPool.set(BGM_BASE + 'BGM_1.mp3', bgmAudio.value); 

                        }

                    }

                    if (bgmAudio.value.src !== expectedAbs) {

                        bgmAudio.value.src = expectedAbs;

                        bgmAudio.value.load();

                    }

                    if (bgmEnabled.value && !isMuted.value && bgmVolume.value > 0) {

                        const playPromise = bgmAudio.value.play();

                        if (playPromise !== undefined) {

                            playPromise.catch(e => {

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



        const scrollToStage = (n) => {

            Vue.nextTick(() => {

                const el = document.querySelector(`[data-stage-node="${n}"]`);

                if (el) {

                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

                }

            });

        };



        const isLevelUnlocked = (n) => unlockedLevels.value.includes(Number(n));

        const isLevelCleared = (n) => clearedLevels.value.includes(Number(n));

        const getStageNodeClass = (n) => {
            const lvNum = Number(n);
            if (!isLevelUnlocked(lvNum)) return 'is-locked';
            if (isLevelCleared(lvNum)) return 'is-cleared';
            const currentTarget = Math.min(...unlockedLevels.value.filter(lv => !clearedLevels.value.includes(lv)));
            if (lvNum === currentTarget) return 'is-current';
            return '';
        };

        const getLevelTitle = (n) => {
            const conf = LEVEL_CONFIG.value[n];
            return conf ? conf.title : `Level ${n}`;
        };

        const hasMentor = (n) => {
            const conf = LEVEL_CONFIG.value[Number(n)];
            if (!conf) return false;
            return !!(conf.skillId || (conf.unlockSkills && conf.unlockSkills.length > 0));
        };

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
            selectedMapLevel.value = lvNum;
            const config = LEVEL_CONFIG.value[lvNum];
            if (config && config.skillId) {
                const skill = skillsAll.value[config.skillId];
                if (skill) setupMentorDialogue(skill);
            } else if (config && config.unlockSkills && config.unlockSkills.length > 0) {
                const skill = skillsAll.value[config.unlockSkills[0]];
                if (skill) setupMentorDialogue(skill);
            }
        };

        const checkAllSRank = () => {
            for (let i = 1; i <= 35; i++) {
                if (bestGrades.value[i] !== 'S') return false;
            }
            return true;
        };

        const sRankCount = computed(() => {
            let count = 0;
            for (let i = 1; i <= 35; i++) {
                if (bestGrades.value[i] === 'S') count++;
            }
            return count;
        });

        if (unlockedLevels.value.includes(36) && !checkAllSRank()) {
            unlockedLevels.value = unlockedLevels.value.filter(lv => lv !== 36);
            localStorage.removeItem('jpRpgL36Unlocked');
        }

        const checkGlobalEndingTriggers = () => {
            if (clearedLevels.value.includes(36) && currentLevel.value === 36) {
                const hasSeenTrueEnding = localStorage.getItem('jpRpgTrueEndingSeen');
                if (!hasSeenTrueEnding) {
                    localStorage.setItem('jpRpgTrueEndingSeen', 'true');
                    setTimeout(() => setupMentorDialogue(window.ENDING_DIALOGUES.TRUE_ENDING), 800);
                }
                return;
            }
            if (!clearedLevels.value.includes(35)) return;
            const isAllS = checkAllSRank();
            const hasSeenAllS = localStorage.getItem('jpRpgL36Unlocked');
            const hasSeenNormal = localStorage.getItem('jpRpgL35EndingSeen');
            if (isAllS && !hasSeenAllS) {
                localStorage.setItem('jpRpgL36Unlocked', 'true');
                if (!unlockedLevels.value.includes(36)) unlockedLevels.value.push(36);
                saveProgression();
                const endingDialogue = { ...window.ENDING_DIALOGUES.ENDING_L35_ALL_S };
                if (currentLevel.value === 35) endingDialogue.mentorDialogue = window.ENDING_DIALOGUES.ENDING_L35_ALL_S_AT_35;
                setTimeout(() => setupMentorDialogue(endingDialogue), 800);
            } else if (!isAllS && !hasSeenNormal && currentLevel.value === 35) {
                localStorage.setItem('jpRpgL35EndingSeen', 'true');
                setTimeout(() => setupMentorDialogue(window.ENDING_DIALOGUES.ENDING_L35_NORMAL), 800);
            }
        };

        const returnToMap = () => {
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
        const APP_VERSION = window.APP_VERSION || "26032801";

        const appVersion = ref(APP_VERSION);

        const VFX_ENHANCED = true;





        const SETTINGS_KEY = 'jpRpgSettingsV1';

        const settings = reactive({

            autoReadOnWrong: true,

            correctAdvanceDelayMs: null,

            wrongAdvanceDelayMs: null,

            enemyAttackMode: 'atb',

            feedbackStyle: 'oneesan',

            ttsVoice: 'ja-JP-Neural2-B'

        });

        const VALID_TTS_VOICES = ['ja-JP-Standard-A', 'ja-JP-Wavenet-A', 'ja-JP-Neural2-B', 'ja-JP-Wavenet-D'];

        const DEFAULT_TTS_VOICE = 'ja-JP-Neural2-B';

        const _settingsDefaults = { autoReadOnWrong: true, correctAdvanceDelayMs: null, wrongAdvanceDelayMs: null, enemyAttackMode: 'atb', feedbackStyle: 'oneesan', ttsVoice: DEFAULT_TTS_VOICE };

        const loadSettings = () => {

            try {

                const raw = localStorage.getItem(SETTINGS_KEY);

                if (raw) {

                    const parsed = JSON.parse(raw);

                    Object.keys(_settingsDefaults).forEach(k => {

                        if (parsed[k] !== undefined) settings[k] = parsed[k];

                    });

                }

                if (!settings.ttsVoice || !VALID_TTS_VOICES.includes(settings.ttsVoice)) {

                    settings.ttsVoice = DEFAULT_TTS_VOICE;

                }

            } catch (e) { console.warn('[Settings] load error', e); }

        };

        const saveSettings = () => {

            try { localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings })); } catch (e) { }

        };

        loadSettings();

        watch(settings, saveSettings, { deep: true });

        window.__initVfxHelpers?.(settings);



        const isChangelogOpen = ref(false);

        const uiMenuOpen = ref(false);

        const answerMode = ref('tap');

        const flickState = reactive({

            activeOpt: null,

            startX: 0,

            startY: 0,

            currentX: 0,

            currentY: 0,

            isArmed: false,

            successOpt: null,

            capturedEl: null

        });

        const changelogData = ref([]);

        const changelogError = ref(false);

        const openChangelog = async () => {

            isChangelogOpen.value = true;

            if (changelogData.value.length === 0 && !changelogError.value) {

                try {

                    const res = await fetch(`assets/data/changelog.json?v=${APP_VERSION}`);

                    if (res.ok) {

                        changelogData.value = await res.json();

                        changelogError.value = false;

                    } else {

                        changelogError.value = true;

                    }

                } catch (e) {

                    changelogError.value = true;

                }

            }

        };



        // ---- [ STATE — SKILLS & CODEX ] ----
        const skillsAll = ref({});

        const skillUnlockMap = ref({});

        const unlockedSkillIds = ref([]);

        const newlyUnlocked = ref([]);

        const isSkillUnlockModalOpen = ref(false);

        // [ CODEX - STATE ]
        const isCodexOpen = ref(false);
        const expandedSkillId = ref(null);
        // [ /CODEX - STATE ]

        const MENTOR_SEEN_KEY = 'jpRpgMentorSeenV1';

        const mentorTutorialSeen = ref([]);

        const isMentorModalOpen = ref(false);

        const isMentorReplayOpen = ref(false);

        const isLevelJumpOpen = ref(false);

        const currentMentorSkill = ref(null);

        const isMapMentorOpen = ref(false);

        const mentorPages = ref([]); // 平鋪後的文字分頁

        const mentorDialogueIndex = ref(0); // 指向目前的 Page

        const displayedMentorText = ref("");

        const isTypingMentor = ref(false);

        const isMentorPortraitError = ref(false);

        const isMentorSkipPressing = ref(false);

        const mentorSkipPressTimer = ref(null);

        let typingTimerMentor = null;

        let currentMentorAudio = null;



        // 分頁輔助：將多行對話切碎

        const fragmentMentorDialogue = (dialogues) => {
            if (!Array.isArray(dialogues)) return [];
            const pages = [];
            dialogues.forEach(item => {
                const text = item.text || "";

                // 以標點符號初步斷句

                const sentences = text.match(/[^。！？]+[。！？]?[」』"']?/g) || [text];



                let currentPage = "";

                let sentenceCount = 0;



                sentences.forEach(s => {

                    // 若加進去會超過 2 句，或單句極長，就強迫入下一頁

                    if (sentenceCount >= 3 || (currentPage.length + s.length > 85)) {

                        if (currentPage) pages.push(currentPage.trim());

                        currentPage = s;

                        sentenceCount = 1;

                    } else {

                        currentPage += s;

                        sentenceCount++;

                    }

                });

                if (currentPage) pages.push(currentPage.trim());

            });

            return pages;

        };



        const currentMentorLine = computed(() => {

            if (mentorPages.value.length === 0) return null;

            return mentorPages.value[mentorDialogueIndex.value];

        });



        const isLastMentorLine = computed(() => {

            if (mentorPages.value.length === 0) return true;

            return mentorDialogueIndex.value >= mentorPages.value.length - 1;

        });



        const loadMentorState = () => {

            try {

                const raw = localStorage.getItem(MENTOR_SEEN_KEY);

                if (raw) mentorTutorialSeen.value = JSON.parse(raw);

            } catch (e) { }

        };

        const saveMentorState = () => {

            try { localStorage.setItem(MENTOR_SEEN_KEY, JSON.stringify(mentorTutorialSeen.value)); } catch (e) { }

        };

        loadMentorState();



        // ================= [ MENTOR DIALOGUE ] =================
        const setupMentorDialogue = (skill) => {
            currentMentorSkill.value = skill;

            // 優先讀取集中化 JSON 內的對話資料，保留原有 skill 內的作為 fallback
            const centralizedData = MENTOR_AUDIO_MAP.value?.[skill.id];
            const dialogueSource = centralizedData?.dialogue || skill.mentorDialogue || [];

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

            startMentorTyping(currentMentorLine.value || "");

            playMentorAudioForCurrentPage();

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

            return `assets/audio/mentor/wa-topic-basic-p${pNum}.mp3`;

        };



        const stopMentorAudio = () => {

            if (currentMentorAudio) {

                try {

                    currentMentorAudio.pause();

                    currentMentorAudio.currentTime = 0;

                } catch (e) { }

                currentMentorAudio = null;

            }

            if (typeof restoreMapBgmAfterVoice === 'function') restoreMapBgmAfterVoice();

        };



        const playMentorAudioForCurrentPage = () => {

            stopMentorAudio();

            if (!currentMentorSkill.value) return;

            const path = getMentorAudioPath(currentMentorSkill.value.id, mentorDialogueIndex.value);

            if (!path) return;



            const audio = new Audio(path);

            audio.volume = masterVolume.value * Math.max(0.1, bgmVolume.value); // Mentor audio follows BGM/Master volume

            currentMentorAudio = audio;



            audio.addEventListener('ended', () => {

                if (typeof restoreMapBgmAfterVoice === 'function') restoreMapBgmAfterVoice();

            });



            audio.play().then(() => {

                if (typeof duckMapBgmForVoice === 'function') duckMapBgmForVoice();

            }).catch(err => {

                console.warn("[MentorAudio] Play failed or file missing:", path);

                currentMentorAudio = null;

                if (typeof restoreMapBgmAfterVoice === 'function') restoreMapBgmAfterVoice();

            });

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

            startMentorTyping(currentMentorLine.value || "");

            playMentorAudioForCurrentPage();

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

            isMentorModalOpen.value = false;

            isMapMentorOpen.value = false;



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
        // [ /CODEX - COMPUTED ]



        // [ CODEX - GLOBAL EVENTS ]
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isCodexOpen.value) {
                isCodexOpen.value = false;
                resumeBattle();
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

                const res = await fetch(`assets/data/levels.v1.json?v=${appVersion.value}`);

                if (res.ok) {

                    const data = await res.json();

                    const mappedLevels = {};

                    data.forEach((lvl, idx) => {

                        const lvNum = idx + 1;

                        const config = {

                            ...lvl,

                            title: lvl.name || fallbackLevels[lvNum]?.title,

                            blanks: fallbackLevels[lvNum]?.blanks || 1,

                            types: fallbackLevels[lvNum]?.types || [0, 1, 2, 3, 4, 5]

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

                }

            } catch (e) { }



            try {

                const res = await fetch(`assets/data/vocab.v1.json?v=${appVersion.value}`);

                if (res.ok) {

                    VOCAB.value = await res.json();

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

        const spState = window.__sp;

        const allAbilities = ref([]);

        const skillList = computed(() =>

            allAbilities.value.filter(a => unlockedAbilityIds.value.includes(a.id))

        );

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

            // ODODO：怪物減速

            if (heroBuffs.odoodoTurns > 0) {

                heroBuffs.odoodoTurns--;



                if (heroBuffs.odoodoTurns <= 0) {

                    heroBuffs.odoodoTurns = 0;

                    heroBuffs.enemyAtbMult = 1.0;



                    if (typeof pushBattleLog === 'function') {

                        pushBattleLog("オドオド 效果結束（怪物速度恢復）", 'info');

                    }

                }

            }



            // GACHIGACHI：玩家硬化減傷

            if (heroBuffs.gachigachiTurns > 0) {

                heroBuffs.gachigachiTurns--;



                if (heroBuffs.gachigachiTurns <= 0) {

                    heroBuffs.gachigachiTurns = 0;

                    heroBuffs.enemyDmgMult = 1.0;



                    if (typeof pushBattleLog === 'function') {

                        pushBattleLog("ガチガチ 效果結束（你的硬化狀態解除）", 'info');

                    }

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

                let a = audioPool.get(url);

                if (!a) {

                    a = new Audio(url);

                    a.crossOrigin = "anonymous";

                    audioPool.set(url, a);

                }

                if (audioCtx.value && !a._connected) {

                    const source = audioCtx.value.createMediaElementSource(a);

                    source.connect(sfxGain.value);

                    a._connected = true;

                }

                a.currentTime = 0;

                a.play().catch(e => console.warn('[SFX] 技能音效播放失敗:', e));

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



            // 觸發技能效果與 UI 提示

            if (id === 'ODOODO') {

                heroBuffs.enemyAtbMult = 1.3;

                heroBuffs.odoodoTurns = 3;

                showStatusToast('🐌 怪物遲緩！×3回合', {

                    bg: 'rgba(163,230,53,0.92)',

                    border: '#84cc16',

                    color: '#1a2e05'

                });

                if (typeof pushBattleLog === 'function') {

                    pushBattleLog(`使用了技能：${skill.name}！怪物減速三回合！`, 'buff');

                }

            } else if (id === 'GACHIGACHI') {

                heroBuffs.enemyDmgMult = 0.6;

                heroBuffs.gachigachiTurns = 2;

                showStatusToast('🛡️ 身體硬化！×2回合', {

                    bg: 'rgba(148,163,184,0.92)',

                    border: '#94a3b8',

                    color: '#0f172a'

                });

                if (typeof pushBattleLog === 'function') {

                    pushBattleLog(`使用了技能：${skill.name}！你進入硬化狀態，受到的傷害減少兩回合！`, 'buff');

                }

            } else if (id === 'UTOUTO') {

                heroBuffs.monsterSleep = true;

                showStatusToast('💤 怪物睡著了！', {

                    bg: 'rgba(168,85,247,0.92)',

                    border: '#c084fc',

                    color: '#1e0a2e'

                });

                if (typeof pushBattleLog === 'function') {

                    pushBattleLog(`使用了技能：${skill.name}！怪物睡著了！`, 'buff');

                }

            } else {

                if (typeof pushBattleLog === 'function') {

                    pushBattleLog(`使用了技能：${skill.name}！`, 'buff');

                }

            }



            // 更新畫面狀態

            updateHeroStatusBar();

            if (typeof updateMonsterStatusBar === 'function') updateMonsterStatusBar();



            if (typeof closeSkillOverlay === 'function') closeSkillOverlay();

            if (typeof resumeBattle === 'function') resumeBattle();

        };



        onMounted(() => {

            loadGameData();

            window.__initCornerMenu?.(watch, showLevelSelect, isFinished);

        });



        // --- 抽離遊戲常數 ---

        const {
            MONSTER_HP, POTION_HP, INITIAL_POTIONS, MONSTERS
        } = pool.config || {};



        const showLevelSelect = ref(true);

        const showGrammarDetail = ref(false);

        const runAwayPressTimer = ref(null);

        const isRunAwayPressing = ref(false);

        const isMenuOpen = ref(false);

        const isAdvancedSettingsOpen = ref(false);

        const isMapDropdownOpen = ref(false);

        const isMistakesOpen = ref(false);

        const isInventoryOpen = ref(false);

        // ---- [ STATE — GAME BATTLE CORE ] ----
        const player = ref({ hp: 100, maxHp: 100, gold: 0, exp: 0 });

        const monster = ref({ hp: MONSTER_HP, maxHp: MONSTER_HP, name: '助詞怪', size: 1 });

        const inventory = ref({ potions: INITIAL_POTIONS, speedPotions: 3 });

        const evasionBuffAttacksLeft = ref(0);

        const monsterShake = ref(false);

        const playerBlink = ref(false);

        const hpBarDanger = ref(false);

        const goldDoubleNext = ref(false);

        const difficulty = ref('easy');

        const currentBg = ref('assets/images/bg_01.jpg');



        const questions = ref([]);

        const currentIndex = ref(0);

        const userAnswers = ref([]);

        const slotFeedbacks = ref({});

        const hasSubmitted = ref(false);

        const totalScore = ref(0);

        const comboCount = ref(0);

        const maxComboCount = ref(0);

        const currentLevel = ref(1);

        const isFinished = ref(false);

        const isNextBtnVisible = ref(false);

        const isCurrentCorrect = ref(false);

        const timeLeft = ref(10);

        const timeUp = ref(false);

        const wrongAnswerPause = ref(false);

        const wrongAnswerPauseCountdown = ref(0);

        const mistakes = ref([]);

        const stageLog = ref([]);

        const totalQuestionsAnswered = ref(0);

        const correctAnswersAmount = ref(0);

        const earnedExp = ref(0);

        const earnedGold = ref(0);

        const animatedExp = ref(0);

        const animatedGold = ref(0);

        const monsterHit = ref(false);

        const monsterStunSeconds = ref(0); // 怪物處於受擊僵直的時間 (秒)

        const monsterHitImageFailed = ref(false); // 標記目前怪物是否缺乏 *2 受擊圖

        const monsterIsEntering = ref(false); // 正在進場
        const monsterIsDying = ref(false); // 正在播放死亡動畫

        const monsterTrulyDead = ref(false); // 動畫結束，真正從畫面移除

        const monsterResultShown = ref(false); // 結算視窗是否顯示

        const screenShake = ref(false);

        const bossScreenShake = ref(false);

        const flashOverlay = ref(false);

        const isPlayerDodging = ref(false);

        const voicePlayedForCurrentQuestion = ref(false);



        // ---- [ STATE — AUDIO REFS ] ----
        const audioInited = ref(false);

        const isPreloading = ref(false);

        const bgmAudio = ref(null);

        const gameOverAudio = ref(null);



        const audioCtx = ref(null);

        const masterGain = ref(null);
        const bgmGain = ref(null);
        const sfxGain = ref(null);
        // [ FUTURE - NARRATOR / TTS ]
        // const narratorGain = ref(null); // Suggest adding this for sister's voice
        // [ /FUTURE ]



        const bgmVolume = ref(0.35);

        const sfxVolume = ref(1.0);

        const masterVolume = ref(1.0);

        const isMuted = ref(false);

        const audioPool = new Map();

        const bufferPool = new Map();

        const bgmEnabled = ref(true);

        const needsUserGestureToResumeBgm = ref(false);

        const audioSettingsKey = 'jpRpgAudioV1';

        let timerId = null;

        let pauseTimerId = null;

        let questionStartTime = 0;

        let evasionBuffTimerId = null;



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

            if (isMenuOpen.value || isCodexOpen.value || isSkillUnlockModalOpen.value || isMentorModalOpen.value || isMistakesOpen.value || isInventoryOpen.value) return;



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



        const openCodexTo = (skillId) => {

            isSkillUnlockModalOpen.value = false;
            expandedSkillId.value = skillId;
            playSfx('uiPop'); // Added sound for codex
            isCodexOpen.value = true;
            pauseBattle();

            setTimeout(() => {

                const el = document.getElementById('skill-card-' + skillId);

                if (el) {

                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    const card = el.querySelector('.bg-\\[\\#3e2723\\]\\/60') || el.firstElementChild;

                    if (card) {

                        card.classList.add('flash-card');

                        setTimeout(() => card.classList.remove('flash-card'), 800);

                    }

                }

            }, 100);

        };



        // ================= [ AUDIO & TTS ] =================
        const loadAudioSettings = () => {

            try {

                const raw = localStorage.getItem(audioSettingsKey);

                if (raw) {

                    const obj = JSON.parse(raw);

                    bgmVolume.value = obj.bgmVolume ?? bgmVolume.value;

                    sfxVolume.value = obj.sfxVolume ?? sfxVolume.value;

                    masterVolume.value = obj.masterVolume ?? masterVolume.value;

                    isMuted.value = obj.isMuted ?? isMuted.value;

                }

            } catch (_) { }

        };



        const saveAudioSettings = () => {

            try {

                localStorage.setItem(audioSettingsKey, JSON.stringify({

                    bgmVolume: bgmVolume.value,

                    sfxVolume: sfxVolume.value,

                    masterVolume: masterVolume.value,

                    isMuted: isMuted.value

                }));

            } catch (_) { }

        };



        const BGM_BASE = 'assets/audio/bgm/';

        const currentBattleBgmPick = ref(BGM_BASE + 'BGM_1.mp3');

        let lastNormalBgm = null;



        const pickBattleBgm = (level) => {

            const lv = Number(level) || parseInt(level, 10) || 1;

            const configBgm = LEVEL_CONFIG.value?.[lv]?.bgm;

            if (configBgm) {

                currentBattleBgmPick.value = BGM_BASE + configBgm;

                if (configBgm === 'BGM_boss.mp3') lastNormalBgm = null;

                return;

            }

            if (lv % 5 === 0) {

                currentBattleBgmPick.value = BGM_BASE + 'BGM_boss.mp3';

                lastNormalBgm = null;

            } else {

                const normalBgms = ['BGM_1.mp3', 'BGM_2.mp3', 'BGM_3.mp3', 'BGM_4.mp3'];

                const pool = lastNormalBgm ? normalBgms.filter(b => b !== lastNormalBgm) : normalBgms;

                const pick = pool[Math.floor(Math.random() * pool.length)];

                lastNormalBgm = pick;

                currentBattleBgmPick.value = BGM_BASE + pick;

            }

        };



        const preloadAllAudio = async () => {

            if (isPreloading.value) return;

            isPreloading.value = true;



            const sfxPaths = {

                hit: 'assets/audio/sfx_hit.mp3',

                miss: 'assets/audio/mmiss.mp3',

                potion: 'assets/audio/sfx_potion.mp3',

                click: 'assets/audio/sfx_click.mp3',

                damage: 'assets/audio/damage.mp3',

                fanfare: 'assets/audio/fanfare.mp3',
                uiPop: 'assets/audio/pop.mp3',       // Lightweight for menus
                battlePop: 'assets/audio/pop2.mp3', // Heavy for monsters/combat
                win: 'assets/audio/win.mp3',

                gameover: 'assets/audio/sfx_gameover.mp3'

            };



            const criticalAssets = [BGM_BASE + 'BGM_1.mp3', BGM_BASE + 'BGM_2.mp3', BGM_BASE + 'BGM_3.mp3', BGM_BASE + 'BGM_4.mp3', BGM_BASE + 'BGM_boss.mp3', 'assets/audio/bgm/map.mp3', sfxPaths.click, sfxPaths.uiPop, sfxPaths.battlePop];

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



            const shortSfxPaths = {
                hit: 'assets/audio/sfx_hit.mp3',
                miss: 'assets/audio/mmiss.mp3',
                potion: 'assets/audio/sfx_potion.mp3',
                click: 'assets/audio/sfx_click.mp3',
                damage: 'assets/audio/damage.mp3',
                damage2: 'assets/audio/damage2.mp3',
                damage3: 'assets/audio/damage3.mp3',
                damage4: 'assets/audio/damage4.mp3',
                fanfare: 'assets/audio/fanfare.mp3',
                pop: 'assets/audio/pop.mp3',
                win: 'assets/audio/win.mp3',
                gameover: 'assets/audio/sfx_gameover.mp3',
                skillpop: 'assets/audio/sfx/skillpop.mp3',
                skillget: 'assets/audio/sfx/skillget.mp3',
            };

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



        const updateGainVolumes = () => {

            if (!masterGain.value || !audioCtx.value) return;

            const cTime = audioCtx.value.currentTime || 0;

            const m = isMuted.value ? 0 : masterVolume.value;

            if (isFinite(cTime)) {

                masterGain.value.gain.setTargetAtTime(m, cTime, 0.1);

            }



            const b = bgmVolume.value;

            let bScale = (isMenuOpen.value || isCodexOpen.value || isSkillUnlockModalOpen.value || isMentorModalOpen.value || isMistakesOpen.value) ? 0.35 : 1.0;

            

            if (isMentorVoicePlaying.value) {

                bScale = (bScale === 1.0) ? 0.5 : 0.35;

            }



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

                let bgm = audioPool.get(BGM_BASE + 'BGM_1.mp3');

                if (!bgm) {

                    bgm = new Audio(BGM_BASE + 'BGM_1.mp3');

                    bgm.crossOrigin = "anonymous";

                    bgm.preload = "auto";

                    audioPool.set(BGM_BASE + 'BGM_1.mp3', bgm);

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



        const handleGameOver = () => {

            setHeroAvatar('lose');

            try { if (bgmAudio.value) { bgmAudio.value.pause(); try { bgmAudio.value.currentTime = 0; } catch (_) { } } } catch (_) { }

            playSfx('gameover');

        };



        const runAway = () => {

            clearTimer(); if (pauseTimerId) { clearInterval(pauseTimerId); pauseTimerId = null; }

            if (runAwayPressTimer.value) clearTimeout(runAwayPressTimer.value);

            runAwayPressTimer.value = null;

            isRunAwayPressing.value = false;

            stopAllAudio();

            pushBattleLog('你逃跑了！', 'info');

            hasSubmitted.value = false;

            isFinished.value = false;

            userAnswers.value = [];

            slotFeedbacks.value = {};

            isMenuOpen.value = false;

            setTimeout(() => { showLevelSelect.value = true; }, 900);

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

        const setBattleMessage = (text, ttlMs = 5200) => {

            pushBattleLog(text, 'info');

        };



        const playBgm = async () => {

            await initAudioCtx();

            if (!audioInited.value) await initAudio();

            if (audioCtx.value && audioCtx.value.state === 'suspended') await audioCtx.value.resume();

            updateGainVolumes();



            let expectedUrl = "";

            if (showMap.value && !showLevelSelect.value) {

                expectedUrl = currentMapBgm.value;

            } else {

                expectedUrl = currentBattleBgmPick.value || (BGM_BASE + 'BGM_1.mp3');

            }



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

                    console.warn('[BGM] play failed', e.name, e.message);

                    needsUserGestureToResumeBgm.value = true;

                });

            }

        };



        watch(showMap, (val) => {

            if (val) playBgm();

        });



        const ensureBattleBgmApplied = (forcePlay) => { playBgm(); };



        const resumeBattleBgm = (resumeAbs) => {

            if (!bgmEnabled.value || isMuted.value || bgmVolume.value <= 0) return;

            if (!bgmAudio.value) return;

            bgmAudio.value.pause();

            const curSrc = bgmAudio.value.src || '';

            if (curSrc !== resumeAbs) {

                bgmAudio.value.src = resumeAbs;

                bgmAudio.value.load();

            }

            bgmAudio.value.currentTime = 0;

            bgmAudio.value.play().catch(e => {

                needsUserGestureToResumeBgm.value = true;

            });

        };



        watch([isMenuOpen, isCodexOpen, isSkillUnlockModalOpen, isMentorModalOpen, isInventoryOpen, isMistakesOpen, bgmVolume, masterVolume, isMuted, sfxVolume], () => {

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



        const handleVisibilityChange = () => {

            if (document.hidden) return;

            const inBattle = !showLevelSelect.value && !isFinished.value && currentLevel.value > 0;

            if (inBattle && bgmAudio.value && !isMuted.value && bgmVolume.value > 0) {

                const isPlaying = !bgmAudio.value.paused && bgmAudio.value.currentTime > 0;

                if (!isPlaying) playBgm();

            }

        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        window.addEventListener("focus", handleVisibilityChange);



        watch(() => player.value.hp, (newHp) => {

            const el = document.getElementById('heroAvatar');

            const ratio = newHp / player.value.maxHp;

            if (el && el.dataset.state !== 'hit' && el.dataset.state !== 'lose' && el.dataset.state !== 'win') {

                setHeroAvatar(ratio <= 0.4 ? 'scary' : 'neutral');

            }

            window.heroHP = newHp;

            window.heroMaxHP = player.value.maxHp;

            updateHeroStatusBar();

        });



        const ensureBgmPlaying = (reason) => {

            if (!audioInited.value) initAudio();

            if (!bgmEnabled.value || isMuted.value || bgmVolume.value <= 0) return;

            if (bgmAudio.value && bgmAudio.value.paused) {

                const expectedUrl = (showMap.value && !showLevelSelect.value) ? currentMapBgm.value : (currentBattleBgmPick.value || (BGM_BASE + 'BGM_1.mp3'));

                const expectedAbs = new URL(expectedUrl, window.location.href).href;

                const curSrc = bgmAudio.value.src || '';

                if (curSrc !== expectedAbs) {

                    bgmAudio.value.src = expectedAbs;

                    bgmAudio.value.load();

                }

                bgmAudio.value.play().catch(() => {

                    needsUserGestureToResumeBgm.value = true;

                });

            }

        };

        const pauseBgm = () => {

            if (bgmAudio.value && !bgmAudio.value.paused) bgmAudio.value.pause();

        };



        const _isMobileSfx = /iPad|iPhone|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 2);

        const POLY = 4;

        const _uiSfxSrcMap = {
            hit: 'assets/audio/sfx_hit.mp3',
            miss: 'assets/audio/sfx_miss.mp3', // Standardized from mmiss.mp3
            potion: 'assets/audio/sfx_potion.mp3',
            click: 'assets/audio/sfx_click.mp3',
            damage: 'assets/audio/damage.mp3',
            damage2: 'assets/audio/damage2.mp3',
            damage3: 'assets/audio/damage3.mp3',
            damage4: 'assets/audio/damage4.mp3',
            fanfare: 'assets/audio/fanfare.mp3',
            bossClear: 'assets/audio/fanfare.mp3', // Map missing bossClear to fanfare
            uiPop: 'assets/audio/pop.mp3',
            battlePop: 'assets/audio/pop2.mp3',
            win: 'assets/audio/win.mp3',
            gameover: 'assets/audio/sfx_gameover.mp3',
            skillpop: 'assets/audio/sfx/skillpop.mp3',
            skillget: 'assets/audio/sfx/skillget.mp3',
        };


        const _polyPool = new Map();

        const _getOrCreatePoly = (name) => {

            if (_polyPool.has(name)) return _polyPool.get(name);

            const src = _uiSfxSrcMap[name];

            if (!src) return null;

            const els = Array.from({ length: POLY }, () => {

                const a = new Audio(src);

                a.preload = 'auto';

                if ('playsInline' in a) a.playsInline = true;

                return a;

            });

            const entry = { els, idx: 0 };

            _polyPool.set(name, entry);

            return entry;

        };

        const playUiSfx = (name) => {

            if (isMuted.value) return;

            if (_voiceLockUntil > Date.now() && (name === 'damage' || name === 'miss')) return;

            const entry = _getOrCreatePoly(name);

            if (!entry) return;

            const a = entry.els[entry.idx % POLY];

            entry.idx++;

            a.pause();

            a.currentTime = 0;

            a.play().catch(e => { });

        };



        const _prewarmUiSfx = () => { _getOrCreatePoly('hit'); _getOrCreatePoly('miss'); };

        document.addEventListener('pointerdown', _prewarmUiSfx, { once: true, capture: true });

        document.addEventListener('touchstart', _prewarmUiSfx, { once: true, capture: true, passive: true });



        const SFX_SCALES = {
            fanfare: 0.6,    // Refined lower for comfort
            bossClear: 0.6,
            win: 0.7,        // Refined lower for comfort
            gameover: 0.8,
            skillget: 0.8,
            uiPop: 1.0,      // Default for UI
            battlePop: 0.9,  // Slightly lower for heavy assets
            hit: 0.9,
            damage: 0.95
        };

        const playSfx = (name) => {
            if (!audioInited.value) {
                initAudioCtx().then(() => { initAudio().then(() => playSfx(name)); });
                return;
            }
            if (_voiceLockUntil > Date.now() && (name === 'damage' || name === 'miss')) return;

            const src = _uiSfxSrcMap[name];
            if (!src) return;

            // BGM Ducking logic
            if (bgmGain.value && !isMuted.value && name !== 'click' && name !== 'uiPop' && name !== 'battlePop') {
                const b = bgmVolume.value;
                const bScale = (isMenuOpen.value || isCodexOpen.value || isSkillUnlockModalOpen.value || isMentorModalOpen.value || isMistakesOpen.value) ? 0.35 : 1.0;
                clearTimeout(window._bgmDuckTimer);
                window._bgmDuckTimer = setTimeout(() => {
                    if (bgmGain.value && !isMuted.value) {
                        bgmGain.value.gain.setTargetAtTime(b * bScale * 0.3, audioCtx.value.currentTime, 0.15);
                        setTimeout(() => {
                            if (bgmGain.value && !isMuted.value) {
                                const vs = (isMenuOpen.value || isCodexOpen.value || isSkillUnlockModalOpen.value || isMentorModalOpen.value || isMistakesOpen.value) ? 0.35 : 1.0;
                                bgmGain.value.gain.setTargetAtTime(b * vs, audioCtx.value.currentTime, 0.4);
                            }
                        }, 1200);
                    }
                }, 80);
            }

            const rawBuf = bufferPool.get(src);
            if (rawBuf && audioCtx.value) {
                const doPlay = () => {
                    const playDecoded = (decoded) => {
                        try {
                            const bsn = audioCtx.value.createBufferSource();
                            bsn.buffer = decoded;
                            
                            // Normalization / Scaling
                            const scale = SFX_SCALES[name] || 1.0;
                            if (scale !== 1.0) {
                                const tempGain = audioCtx.value.createGain();
                                tempGain.gain.value = scale;
                                bsn.connect(tempGain);
                                tempGain.connect(sfxGain.value || masterGain.value);
                            } else {
                                bsn.connect(sfxGain.value || masterGain.value);
                            }
                            
                            bsn.start(0);
                        } catch (e) { }
                    };

                    if (rawBuf instanceof AudioBuffer) {

                        playDecoded(rawBuf);

                    } else {

                        audioCtx.value.decodeAudioData(rawBuf.slice(0)).then(decoded => {

                            bufferPool.set(src, decoded);

                            playDecoded(decoded);

                        }).catch(e => { });

                    }

                };



                if (audioCtx.value.state !== 'running') {

                    audioCtx.value.resume().then(doPlay).catch(doPlay);

                } else {

                    doPlay();

                }

                return;

            }



            try {

                let a = audioPool.get(src);

                if (!a) {

                    a = new Audio(src);

                    a.crossOrigin = "anonymous";

                    audioPool.set(src, a);

                }

                if (audioCtx.value && !a._connected) {

                    const source = audioCtx.value.createMediaElementSource(a);

                    source.connect(sfxGain.value);

                    a._connected = true;

                }

                a.currentTime = 0;

                a.play().catch(e => { });

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


        const isMobileOrIOS = () => {

            return /iPad|iPhone|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);

        };



        const startFlick = (e, opt) => {

            if (answerMode.value !== 'flick' || monsterDead.value || playerDead.value || isFinished.value || hasSubmitted.value) return;

            initAudioCtx();

            if (!audioInited.value) initAudio();



            const el = e.currentTarget;

            el.setPointerCapture(e.pointerId);



            flickState.activeOpt = opt;

            flickState.startX = e.clientX;

            flickState.startY = e.clientY;

            flickState.currentX = e.clientX;

            flickState.currentY = e.clientY;

            flickState.isArmed = true;

            flickState.capturedEl = el;

        };



        const moveFlick = (e) => {

            if (!flickState.isArmed) return;

            flickState.currentX = e.clientX;

            flickState.currentY = e.clientY;

        };



        const endFlick = (e) => {

            if (!flickState.isArmed) return;

            if (window.primeVoiceOnGesture) window.primeVoiceOnGesture();



            const dx = e.clientX - flickState.startX;

            const dy = e.clientY - flickState.startY;

            const opt = flickState.activeOpt;

            const originEl = flickState.capturedEl;



            if (dy <= -25 && Math.abs(dx) < 120) {

                if (e.cancelable) e.preventDefault();



                const startPoint = getCenterOrFallback(originEl, flickState.startX, flickState.startY);

                let toX = e.clientX;

                let toY = e.clientY;



                const monsterEl = document.querySelector('img[alt="monster"]') || document.querySelector('.w-28.h-28.rounded-full');

                const monsterCenter = rectCenter(monsterEl);

                if (monsterCenter && monsterCenter.x !== undefined && monsterCenter.y !== undefined) {

                    toX = monsterCenter.x;

                    toY = monsterCenter.y;

                } else {

                    toY = startPoint.y - 200;

                    toX = startPoint.x;

                }



                spawnProjectile(startPoint.x, startPoint.y, toX, toY, opt);

                handleRuneClick(opt, true);

            }



            flickState.isArmed = false;

            flickState.activeOpt = null;

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

                timeLeft.value = 10;

            }

        };



        // ---- [ TIMER ] ----
        const startTimer = () => {

            clearTimer();

            timeUp.value = false;

            if (isFinished.value) return;

            timeLeft.value = 10;

            questionStartTime = Date.now();



            if (isMenuOpen.value || isCodexOpen.value || isSkillUnlockModalOpen.value) {

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

                group.appendChild(vine);

            });



            // 橫向藤蔓 (左右交錯)

            [30, 70].forEach((top, i) => {

                const vine = document.createElement('div');

                vine.className = `boss-vfx-vine ${i % 2 === 0 ? 'boss-vine-whip-side-left' : 'boss-vine-whip-side-right'}`;

                vine.style.top = `${top}%`;

                vine.style.left = i % 2 === 0 ? '-10%' : '110%';

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

            let isMiss = Math.random() < 0.05;



            if (evasionBuffAttacksLeft.value > 0) {

                isMiss = Math.random() < 0.50;

                evasionBuffAttacksLeft.value--;

                if (evasionBuffAttacksLeft.value <= 0) {

                    if (evasionBuffTimerId) { clearTimeout(evasionBuffTimerId); evasionBuffTimerId = null; }

                    clearSpeedStatus();

                }

            }



            screenShake.value = true;

            setTimeout(() => { screenShake.value = false; }, 400);



            if (isMiss) {

                isPlayerDodging.value = true;

                setTimeout(() => { isPlayerDodging.value = false; }, 300);

                playSfx('miss');

                pushBattleLog(`怪物攻擊失誤！勇者閃開了！`, 'info');

            } else {

                const isBoss = (currentLevel.value % 5 === 0);

                if (isBoss) {

                    const mid = monster.value.id;

                    if (mid === 'man-eater-bloom') {

                        playBossVineAttackVfx();

                        playSfx('damage4');

                    } else if (mid === 'orc-warlord') {

                        playBossSmashAttackVfx();

                        playSfx('damage3');

                    } else if (mid === 'frost-roc' || mid === 'ice-bird') {

                        playMonsterClawAttackVfx();

                        playSfx('damage2');

                    } else {

                        // Default for other bosses

                        playMonsterClawAttackVfx();

                        playSfx('damage2');

                    }

                } else {

                    playerBlink.value = true;

                    setTimeout(() => { playerBlink.value = false; }, 500);

                    playSfx('damage');

                }



                flashOverlay.value = true;

                setTimeout(() => { flashOverlay.value = false; }, 300);

                let dmg = Math.floor(Math.random() * 11) + 10;

                dmg = Math.max(1, Math.floor(dmg * heroBuffs.enemyDmgMult));

                player.value.hp = Math.max(0, player.value.hp - dmg);

                window.spawnFloatingDamage('player', dmg);

                flashHeroHit(player.value.hp / player.value.maxHp);

                if (player.value.hp <= 0) handleGameOver();

                hpBarDanger.value = true;

                setTimeout(() => { hpBarDanger.value = false; }, 500);

            }



            wrongAnswerPause.value = true;

            wrongAnswerPauseCountdown.value = difficulty.value === 'hard' ? 3 : 2;

            if (pauseTimerId) clearInterval(pauseTimerId);

            pauseTimerId = setInterval(runPauseTimerLogic, 1000);

        };



        const loadMistakes = () => {

            try {

                const data = JSON.parse(localStorage.getItem('jpRpgMistakesV1') || '[]');

                mistakes.value = data;

            } catch (_) { }

        };

        const saveMistakes = () => {

            try { localStorage.setItem('jpRpgMistakesV1', JSON.stringify(mistakes.value)); } catch (_) { }

        };



        const addMistake = () => {

            const q = currentQuestion.value;

            let displayJp = '';

            let sentenceTextBuilder = '';



            // 1. 重組句子，並把答案的位置加上 HTML 高亮底線

            (q.segments || []).forEach(s => {

                if (s.isBlank) {

                    let ans = q.answers[s.blankIndex];

                    if (Array.isArray(ans)) ans = ans[0];

                    displayJp += `<span class="text-amber-400 font-bold underline">${ans}</span>`;

                    sentenceTextBuilder += ans;

                } else {

                    displayJp += s.text;

                    sentenceTextBuilder += s.text;

                }

            });





            // 2. 清理要給語音朗讀用的純文字

            let cleanSentenceText = sentenceTextBuilder.replace(/[_ ]/g, '').replace(/（[^）]*）|\([^)]*\)/g, '');



            // 3. 存入符合新版 HTML 排版的四個屬性

            const entry = {

                displayJp: displayJp,

                sentenceText: cleanSentenceText,

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

            let displayJp = '';

            let sentenceTextBuilder = '';



            (q.segments || []).forEach(s => {

                if (s.isBlank) {

                    let ans = q.answers[s.blankIndex];

                    if (Array.isArray(ans)) ans = ans[0];

                    displayJp += `<span class="text-amber-400 font-bold underline">${ans}</span>`;

                    sentenceTextBuilder += ans;

                } else {

                    displayJp += s.text;

                    sentenceTextBuilder += s.text;

                }

            });





            const cleanSentenceText = sentenceTextBuilder.replace(/[_ ]/g, '').replace(/（[^）]*）|\([^)]*\)/g, '');



            const entry = {

                displayJp: displayJp,

                sentenceText: cleanSentenceText,

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

        const DEFAULT_NEW_SKILL_RATIO = 0.6;

        const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

        const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);



        const getChoiceCountForLevel = (lv) => (lv % 5 === 0 || lv >= 31) ? 4 : 3;



        const makeChoices = (correct) => {

            const targetCount = getChoiceCountForLevel(currentLevel.value);

            const correctArr = Array.isArray(correct) ? correct : [correct];

            const wrong = ALL_PARTICLES.filter(p => !correctArr.includes(p));

            const picked = [correctArr[0], ...shuffle(wrong).slice(0, targetCount - 1)];

            return shuffle(picked);

        };



        const _audioUnlockTried = ref(false);

        const unlockAudioOnce = () => {

            if (_audioUnlockTried.value) return;

            _audioUnlockTried.value = true;

            

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

                    audioCtx.value.resume().catch(()=>{});

                }

            } catch (e) {}



            if (!window._audioWarmedUp) {

                window._audioWarmedUp = true;

                try {

                    const silentBuf = audioCtx.value.createBuffer(1, 128, audioCtx.value.sampleRate);

                    const silentSrc = audioCtx.value.createBufferSource();

                    silentSrc.buffer = silentBuf;

                    silentSrc.connect(masterGain.value);

                    silentSrc.start(0);

                } catch (_) {}



                try {

                    const dummyAudio = new Audio("data:audio/mp3;base64,//OlkAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAFAAAH8AADBQQOExUaHh8lJygqMTIzNzo9P0JFREQv");

                    dummyAudio.muted = true;

                    dummyAudio.play().then(() => { dummyAudio.pause(); dummyAudio.muted = false; }).catch(() => {});

                } catch (e) {}

            }



            if (needsUserGestureToResumeBgm.value) {

                needsUserGestureToResumeBgm.value = false;

                if (showMap.value && !showLevelSelect.value) {

                    if (bgmAudio.value && bgmAudio.value.paused) {

                        bgmAudio.value.play().catch(()=>{});

                    } else {

                        ensureBgmPlaying('unlocked');

                    }

                } else {

                    ensureBgmPlaying('unlocked');

                }

            }

        };



        const onUserGesture = () => {

            unlockAudioOnce();

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

            let bgm = audioPool.get(BGM_BASE + 'BGM_1.mp3');

            if (!bgm) {

                bgm = new Audio(BGM_BASE + 'BGM_1.mp3');

                bgm.crossOrigin = "anonymous";

                bgm.loop = true;

                audioPool.set(BGM_BASE + 'BGM_1.mp3', bgm);

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

            playBgm();

            preloadAllAudio();



            playSfx('click');

            showLevelSelect.value = false;

            showMap.value = false; // CRITICAL: Hide map to show battle HUD

            currentLevel.value = lv;

            

            // withMentor = true means user clicked the "Mentor Icon" -> forceMentor = true

            // withMentor = false means user clicked the "Stage Card" -> skipMentor = true

            initGame(lv, !withMentor, withMentor); 

        };



        const usePotion = () => {

            initAudioCtx();

            if (!audioInited.value) initAudio();

            if (needsUserGestureToResumeBgm.value) { ensureBgmPlaying('potion'); needsUserGestureToResumeBgm.value = false; }

            

            if (inventory.value.potions <= 0 || player.value.hp >= player.value.maxHp) return;

            

            playSfx('potion');

            inventory.value.potions--;

            player.value.hp = Math.min(player.value.maxHp, player.value.hp + POTION_HP);

            pushBattleLog(`喝了藥水，回復 ${POTION_HP} 點 HP！`, 'heal');

        };



        const useSpeedPotion = () => {

            initAudioCtx();

            if (!audioInited.value) initAudio();

            if (needsUserGestureToResumeBgm.value) { ensureBgmPlaying('potion'); needsUserGestureToResumeBgm.value = false; }

            

            if (inventory.value.speedPotions <= 0 || evasionBuffAttacksLeft.value > 0 || playerDead.value || monsterDead.value) return;

            

            playSfx('potion');

            inventory.value.speedPotions--;

            evasionBuffAttacksLeft.value = 6;

            setSpeedStatus(60000);

            pushBattleLog(`使用了神速藥水！接下來 6 次閃避率提昇`, 'buff');



            if (evasionBuffTimerId) clearTimeout(evasionBuffTimerId);

            evasionBuffTimerId = setTimeout(() => {

                if (evasionBuffAttacksLeft.value > 0) {

                    evasionBuffAttacksLeft.value = 0;

                    pushBattleLog(`神速藥水的藥效退去了。`, 'info');

                }

                clearSpeedStatus();

                evasionBuffTimerId = null;

            }, 60000);

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
            const config = LEVEL_CONFIG.value[levelId] || {};
            const newSkills = (config.unlockSkills || []).filter(id => {
                const s = skillsAll.value[id];
                return s && s.particle !== '複習'; // 排除純複習 ID 作為新技能
            });

            // 舊技能池：嚴格限制為「本關卡之前」已教過的技能
            const oldSkills = getHistoricalSkills(levelId);

            let poolToUse = [];
            const newSkillWeight = config.skillMix?.newSkillWeight ?? DEFAULT_NEW_SKILL_RATIO;

            if (newSkills.length > 0 && oldSkills.length > 0) {
                poolToUse = Math.random() < newSkillWeight ? newSkills : oldSkills;
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
                // 第 10, 15, 20... 關魔王：80% 當前地圖 + 20% 歷史舊題
                const currentMapSkills = [];
                for (let i = lv - 4; i < lv; i++) {
                    const c = LEVEL_CONFIG.value[i];
                    if (c && c.unlockSkills) currentMapSkills.push(...c.unlockSkills);
                }
                const historicalSkills = getHistoricalSkills(lv - 4); // 排除當前地圖

                let fullQueue = [];
                // 產生 20 題的循環 (確保 15 題戰鬥需求)
                for (let i = 0; i < 20; i++) {
                    if (Math.random() < 0.8 && currentMapSkills.length > 0) {
                        fullQueue.push(currentMapSkills[Math.floor(Math.random() * currentMapSkills.length)]);
                    } else if (historicalSkills.length > 0) {
                        fullQueue.push(historicalSkills[Math.floor(Math.random() * historicalSkills.length)]);
                    } else {
                        // 防呆 fallback
                        fullQueue.push(currentMapSkills[0] || 'WA_TOPIC_BASIC');
                    }
                }
                bossSkillQueue = fullQueue;
            } else if (config.skillId && config.skillId === 'HIDDEN_BOSS_36') {
                const generateTieredSkillQueue = () => {
                    const tier3 = ['KARA_REASON', 'YORI_COMPARE', 'NI_FREQUENCY', 'DE_MATERIAL', 'TO_QUOTE', 'NI_PURPOSE'];
                    const tier2 = ['KARA_SOURCE_START', 'MADE_LIMIT_END', 'TO_COMPANION', 'DE_TOOL_MEANS', 'HE_DIRECTION', 'NI_TARGET'];
                    const tier1 = ['NI_TIME', 'NI_EXIST_PLACE', 'YA_AND_OTHERS', 'WA_TOPIC_BASIC', 'NO_POSSESSIVE', 'GA_INTRANSITIVE'];

                    const pickN = (arr, n) => {
                        let res = [];
                        for(let i=0; i<n; i++) res.push(arr[Math.floor(Math.random() * arr.length)]);
                        return res;
                    };
                    const mix = [...pickN(tier3, 15), ...pickN(tier2, 9), ...pickN(tier1, 6)];
                    return mix.sort(() => Math.random() - 0.5);
                };
                bossSkillQueue = generateTieredSkillQueue();
            } else if (config.skillId && (config.skillId.startsWith('BOSS_REVIEW') || config.skillId === 'FINAL_BOSS_35')) {
                bossSkillQueue = [config.skillId];
            } else {
                bossSkillQueue = [...unlockedIds].sort(() => Math.random() - 0.5);
            }

        };



        const pickSkillForBoss = () => {

            if (bossSkillQueue.length === 0) return null;

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



        const pickOne = (arr) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

        const pickMany = (arr, n, exclude) => {

            const result = [];

            const pool = [...(arr || [])].filter(x => !exclude || exclude !== x);

            while (result.length < n && pool.length > 0) {

                const idx = Math.floor(Math.random() * pool.length);

                result.push(pool.splice(idx, 1)[0]);

            }

            return result;

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
        const generateQuestionBySkill = (skillId, blanks, db, vocab) => {

            // 向下相容 MO_ALSO_BASIC

            if (skillId === 'MO_ALSO') skillId = 'MO_ALSO_BASIC';



            const skillDef = skillsAll.value[skillId];

            if (!skillDef || !skillDef.id) return null;



            const tipText = (skillDef.meaning || '') + (skillDef.rule ? ' / ' + skillDef.rule : '');

            const safeVocab = vocab || {};



            const zhOf = (obj) => obj?.zh || obj?.t || obj?.label || '…';



            const seg = (text, ruby = '') => ({

                text,

                ruby,

                isBlank: false

            });



            const combineDesu = (text, ruby) => ({

                text: `${text}です`,

                ruby: `${ruby}です`

            });



            const buildIntransitiveChinese = (noun, verb) => {

                const nounZh = zhOf(noun);

                const kind = noun?.kind || '';

                const verbJ = verb?.j || '';



                if (kind === 'precip') {

                    if (noun?.j === '雨') return '下雨';

                    if (noun?.j === '雪') return '下雪';

                    return `${nounZh}下`;

                }



                if (kind === 'sky') {

                    if (verbJ === '曇る') return `${nounZh}轉陰`;

                    return `${nounZh}${zhOf(verb)}`;

                }



                if (kind === 'wind') {

                    if (verbJ === '吹く') return `${nounZh}吹`;

                    return `${nounZh}${zhOf(verb)}`;

                }



                if (kind === 'flower') {

                    if (verbJ === '咲く') return `${nounZh}開了`;

                    return `${nounZh}${zhOf(verb)}`;

                }



                if (kind === 'door') {

                    if (verbJ === '開く') return `${nounZh}開了`;

                    if (verbJ === '閉まる') return `${nounZh}關了`;

                }



                if (kind === 'light') {

                    if (verbJ === '消える') return `${nounZh}熄了`;

                }



                if (kind === 'event' || (noun?.tags || []).includes('event')) {

                    if (verbJ === '起きる') return `${nounZh}發生`;

                }



                return `${nounZh}${zhOf(verb)}`;

            };



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

            }) => ({

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

            });



            const getChoices = (defaultChoices, correctAns) => {

                const targetCount = getChoiceCountForLevel(currentLevel.value);

                let safePool = [...(skillDef.choiceSet || defaultChoices)];



                if (correctAns && !safePool.includes(correctAns)) {

                    safePool.push(correctAns);

                }



                safePool = safePool.sort(() => Math.random() - 0.5);

                let selected = [];



                if (correctAns) {

                    selected.push(correctAns);

                    safePool = safePool.filter(x => x !== correctAns);

                }



                const needed = targetCount - selected.length;

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
                    finalChoices = getChoices(choicesOptions, particleAns);
                    if (excludeChoices.length > 0) {
                        finalChoices = finalChoices.filter(c => !excludeChoices.includes(c));
                        const currentSet = new Set(finalChoices);
                        const candidates = choicesOptions.filter(p => !excludeChoices.includes(p) && !currentSet.has(p));
                        while (finalChoices.length < getChoiceCountForLevel(currentLevel.value) && candidates.length > 0) {
                            finalChoices.push(candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0]);
                        }
                    }
                }

                return makeParticleQuestion({
                    chinese: picked.zh,
                    leftText: picked.left,
                    leftRuby: picked.leftRuby,
                    rightText: picked.right,
                    rightRuby: picked.rightRuby,
                    answer: particleAns,
                    skillId: skillId,
                    grammarTip: tipTextObj,
                    choices: finalChoices
                });
            }

            if (skillDef.id === 'NO_POSSESS' || skillDef.id === 'NO_POSSESSIVE') {

                const lv = Number(currentLevel.value || 1);



                const skillPool = (pool.skills?.NO_POSSESSIVE) || {};

                const safePeople = skillPool.safePeople || [];

                const safePlaces = skillPool.safePlaces || [];

                const safeOwnedObjects = skillPool.safeOwnedObjects || [];

                const safePlacedObjects = skillPool.safePlacedObjects || [];

                const safeTemplates = skillPool.safeTemplates || [];



                if (lv <= 2) {

                    const personTemplates = [

                        { a: safePeople[0], b: safeOwnedObjects[0] },

                        { a: safePeople[1], b: safeOwnedObjects[4] },

                        { a: safePeople[2], b: safeOwnedObjects[1] },

                        { a: safePeople[3], b: safeOwnedObjects[2] },

                        { a: safePeople[4], b: safeOwnedObjects[3] }

                    ];



                    const placeTemplates = [

                        { a: safePlaces[0], b: safePlacedObjects[0] },

                        { a: safePlaces[2], b: safePlacedObjects[1] },

                        { a: safePlaces[4], b: safePlacedObjects[2] },

                        { a: safePlaces[1], b: safePlacedObjects[3] },

                        { a: safePlaces[3], b: safePlacedObjects[0] }

                    ];



                    const tpl = Math.random() < 0.5 ? pickOne(personTemplates) : pickOne(placeTemplates);

                    const finalTpl = tpl || safeTemplates[0];



                    q = makeParticleQuestion({

                        chinese: `${zhOf(finalTpl.a)}的${zhOf(finalTpl.b)}`,

                        leftText: finalTpl.a.j,

                        leftRuby: finalTpl.a.r,

                        rightText: finalTpl.b.j,

                        rightRuby: finalTpl.b.r,

                        answer: 'の',

                        skillId: skillDef.id,

                        grammarTip: tipText,

                        choices: (Number(blanks ?? 1) === 1) ? getChoices(["の", "は", "が", "を"], 'の') : undefined

                    });

                } else {

                    let personPool = [...(db?.people || []), ...(safeVocab.people || []), ...safePeople];

                    let placePool = [...(db?.places || []), ...(safeVocab.places || []), ...safePlaces];

                    let objPool = [...(db?.objects || []), ...(safeVocab.objects || []), ...safeOwnedObjects, ...safePlacedObjects];



                    let ownableObjPool = objPool.filter(o => o && o.ownable !== false);

                    let placeableObjPool = objPool.filter(o => o && o.placeable !== false);



                    if (!personPool.length) personPool = safePeople;

                    if (!placePool.length) placePool = safePlaces;

                    if (!ownableObjPool.length) ownableObjPool = safeOwnedObjects;

                    if (!placeableObjPool.length) placeableObjPool = safePlacedObjects;



                    const isPersonA = Math.random() < 0.5;

                    let a, b, validObj = false, attempts = 0;



                    while (!validObj && attempts < 20) {

                        if (isPersonA) {

                            a = pickOne(personPool);

                            b = pickOne(ownableObjPool);

                            validObj = !!(a && b);

                        } else {

                            a = pickOne(placePool);

                            b = pickOne(placeableObjPool);

                            validObj = !!(a && b);



                            if (validObj && Array.isArray(b.domain) && b.domain.length > 0) {

                                const placeKey = a?.id || a?.key || a?.slug || a?.j || null;

                                if (placeKey && !b.domain.includes(placeKey) && !b.domain.includes("general")) {

                                    validObj = false;

                                }

                            }

                        }

                        attempts++;

                    }



                    if (!validObj || !a || !b) {

                        const tpl = pickOne(safeTemplates);

                        a = tpl.a;

                        b = tpl.b;

                    }



                    q = makeParticleQuestion({

                        chinese: `${zhOf(a)}的${zhOf(b)}`,

                        leftText: a.j,

                        leftRuby: a.r,

                        rightText: b.j,

                        rightRuby: b.r,

                        answer: 'の',

                        skillId: skillDef.id,

                        grammarTip: tipText,

                        choices: (Number(blanks ?? 1) === 1) ? getChoices(["の", "は", "が", "を"], 'の') : undefined

                    });

                }

            }

            else if (skillDef.id === 'WA_TOPIC' || skillDef.id === 'WA_TOPIC_BASIC') {

                const lv = Number(currentLevel.value || 1);



                const skillPool = (pool.skills?.WA_TOPIC_BASIC) || {};

                const safePeople = skillPool.safePeople || [];

                const timePool = skillPool.timePool || [];

                const identityPool = skillPool.identityPool || [];

                const statePool = skillPool.statePool || [];



                // 前幾關偏向時間/狀態句（例如：今天是晴天），較自然

                const useIdentity = lv >= 3 ? Math.random() < 0.45 : Math.random() < 0.15;



                let x, y, zhPrompt;

                if (useIdentity) {

                    x = pickOne(safePeople);

                    y = pickOne(identityPool.filter(r => r.j !== x.j)) || identityPool[0];

                    zhPrompt = `${zhOf(x)}是${zhOf(y)}`;

                } else {

                    x = pickOne(timePool);

                    y = pickOne(statePool);

                    zhPrompt = `${zhOf(x)}是${zhOf(y)}`;

                }



                const right = combineDesu(y.j, y.r);

                q = makeParticleQuestion({

                    chinese: zhPrompt,

                    leftText: x.j,

                    leftRuby: x.r,

                    rightText: right.text,

                    rightRuby: right.ruby,

                    answer: 'は',

                    skillId: skillDef.id,

                    grammarTip: tipText,

                    choices: (Number(blanks ?? 1) === 1) ? getChoices(["は", "が", "を", "に"], 'は') : undefined

                });

            }

            else if (skillDef.id === 'GA_EXIST' || skillDef.id === 'GA_INTRANSITIVE') {

                const lv = Number(currentLevel.value || 1);



                const skillPool = (pool.skills?.GA_INTRANSITIVE) || {};

                const safeCombos = skillPool.safeCombos || [];



                let picked = null;



                // 前 1~4 關直接用自然安全句

                if (lv <= 4) {

                    picked = pickOne(safeCombos);

                } else {

                    const poolNature = safeVocab.nature || [];

                    const poolVerbsNature = safeVocab.verbs_nature || [];

                    const poolPhenomena = safeVocab.phenomena || [];

                    const poolVerbsPhenomena = safeVocab.verbs_phenomena || [];



                    const allNouns = [...poolNature, ...poolPhenomena];

                    const allVerbs = [...poolVerbsNature, ...poolVerbsPhenomena];



                    let n = null, v = null, attempt = 0, valid = false;

                    while (!valid && attempt < 30) {

                        n = pickOne(allNouns);

                        if (!n) { attempt++; continue; }

                        const candidates = allVerbs.filter(verb => (verb.kinds || []).includes(n.kind));

                        if (!candidates.length) { attempt++; continue; }

                        v = pickOne(candidates);

                        if (n && v) valid = true;

                        attempt++;

                    }



                    picked = valid ? { n, v } : pickOne(safeCombos);

                }



                q = makeParticleQuestion({

                    chinese: buildIntransitiveChinese(picked.n, picked.v),

                    leftText: picked.n.j,

                    leftRuby: picked.n.r,

                    rightText: picked.v.j,

                    rightRuby: picked.v.r,

                    answer: 'が',

                    skillId: skillDef.id,

                    grammarTip: tipText,

                    choices: (Number(blanks ?? 1) === 1) ? getChoices(["が", "を", "に", "で", "は", "へ", "と", "の"], 'が') : undefined

                });

            }

            else if (skillDef.id === 'WO_OBJECT' || skillDef.id === 'WO_OBJECT_BASIC') {

                const skillPool = (pool.skills?.WO_OBJECT_BASIC) || {};

                const basicCombos = skillPool.basicCombos || [];



                // BASIC 直接走安全自然搭配，避免 verbs_do 偏科

                const picked = pickOne(basicCombos);



                q = makeParticleQuestion({

                    chinese: `${zhOf(picked.v)}${zhOf(picked.o)}`,

                    leftText: picked.o.j,

                    leftRuby: picked.o.r,

                    rightText: picked.v.j,

                    rightRuby: picked.v.r,

                    answer: 'を',

                    skillId: skillDef.id,

                    grammarTip: tipText,

                    choices: (Number(blanks ?? 1) === 1) ? getChoices(["を", "に", "が", "で"], 'を') : undefined

                });

            }



            else if (skillDef.id === 'HE_DEST' || skillDef.id === 'HE_DIRECTION') {

                const skillPool = (pool.skills?.HE_DIRECTION) || {};

                const safeCombos = skillPool.safeCombos || [];

                const picked = pickOne(safeCombos);



                if (picked) {

                    // 支援全句格式 (j 有 へ) 或 舊版格式 (j/v 分開)

                    let left = picked.j, leftR = picked.r, right = picked.v, rightR = picked.vr || picked.v;

                    if (!right && picked.j.includes('へ')) {

                        const parts = picked.j.split('へ');

                        left = parts[0];

                        right = parts[1];

                        const rParts = (picked.r || picked.j).split('へ');

                        leftR = rParts[0];

                        rightR = rParts[1];

                    }



                    // Choice generation: explicitly exclude 'に' but maintain count

                    const targetCount = getChoiceCountForLevel(currentLevel.value);

                    const allSafeParticles = ["へ", "を", "は", "が", "の", "も", "と"];

                    let finalChoices = getChoices(allSafeParticles, 'へ').filter(c => c !== 'に');



                    // If filtering 'に' made us short, fill back up

                    if (finalChoices.length < targetCount) {

                        const currentSet = new Set(finalChoices);

                        const candidates = allSafeParticles.filter(p => p !== 'に' && !currentSet.has(p));

                        while (finalChoices.length < targetCount && candidates.length > 0) {

                            const extra = candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0];

                            finalChoices.push(extra);

                        }

                    }



                    q = makeParticleQuestion({

                        chinese: picked.zh,

                        leftText: left,

                        leftRuby: leftR,

                        rightText: right,

                        rightRuby: rightR,

                        answer: 'へ',

                        skillId: skillDef.id,

                        grammarTip: tipText,

                        choices: finalChoices.sort(() => Math.random() - 0.5)

                    });

                }

            }

            else if (skillDef.id === 'MO_ALSO' || skillDef.id === 'MO_ALSO_BASIC') {

                const skillPool = (pool.skills?.MO_ALSO_BASIC) || {};

                const pList = skillPool.personPool || [];

                const iList = skillPool.identityPool || [];

                const vList = skillPool.verbPool || [];



                const p = pickOne(pList);



                // 50/50 branch: Identity (AもBです) vs Action (AもVます)

                const isAction = vList.length > 0 && Math.random() < 0.5;



                if (isAction) {

                    const v = pickOne(vList);

                    q = makeParticleQuestion({

                        chinese: `${zhOf(p)}也要${v.zh}`,

                        leftText: p.j,

                        leftRuby: p.r,

                        rightText: v.polite,

                        rightRuby: v.politer || v.polite,

                        answer: 'も',

                        skillId: skillDef.id,

                        grammarTip: tipText,

                        choices: getChoices(["も", "は", "が", "を"], 'も')

                    });

                } else {

                    const i = pickOne(iList);

                    q = makeParticleQuestion({

                        chinese: `${zhOf(p)}也是${zhOf(i)}`,

                        leftText: p.j,

                        leftRuby: p.r,

                        rightText: `${i.j}です`,

                        rightRuby: `${i.r}です`,

                        answer: 'も',

                        skillId: skillDef.id,

                        grammarTip: tipText,

                        choices: getChoices(["も", "は", "が", "を"], 'も')

                    });

                }

            }

            else if (skillDef.id === 'DE_LOC' || skillDef.id === 'DE_ACTION_PLACE') {

                const skillPool = (pool.skills?.DE_ACTION_PLACE) || {};

                const safeCombos = (skillPool.safeCombos && skillPool.safeCombos.length > 0) ? skillPool.safeCombos : [
                    { p: { j: "教室", r: "きょうしつ", zh: "教室" }, v: { j: "勉強する", r: "べんきょうする", zh: "讀書" } }
                ];

                const combo = pickOne(safeCombos) || safeCombos[0];
                const p = combo.p;
                const v = combo.v;



                q = makeParticleQuestion({

                    chinese: `在${zhOf(p)}${zhOf(v)}`,

                    leftText: p.j,

                    leftRuby: p.r,

                    rightText: v.j,

                    rightRuby: v.r,

                    answer: 'で',

                    skillId: skillDef.id,

                    grammarTip: tipText,

                    choices: getChoices(["で", "に", "へ", "を"], 'で')

                });

            }

            else if (skillDef.id === 'TO_AND') {

                const skillPool = (pool.skills?.TO_AND) || {};

                const safeCombos = (skillPool.safeCombos && skillPool.safeCombos.length > 0) ? skillPool.safeCombos : [
                    { a: { j: "犬", r: "いぬ", zh: "狗" }, b: { j: "猫", r: "ねこ", zh: "貓" } },
                    { a: { j: "パン", r: "ぱん", zh: "麵包" }, b: { j: "牛乳", r: "ぎゅうにゅう", zh: "牛奶" } },
                    { a: { j: "本", r: "ほん", zh: "書" }, b: { j: "ペン", r: "ぺん", zh: "筆" } }
                ];

                const combo = pickOne(safeCombos) || safeCombos[0];
                const a = combo.a;
                const b = combo.b;



                q = makeParticleQuestion({

                    chinese: `${zhOf(a)}和${zhOf(b)}`,

                    leftText: a.j,

                    leftRuby: a.r,

                    rightText: b.j,

                    rightRuby: b.r,

                    answer: 'と',

                    skillId: skillDef.id,

                    grammarTip: tipText,

                    choices: getChoices(["と", "は", "が", "の", "へ", "も", "を"], 'と')

                });

            }

            else if (skillDef.id === 'TO_WITH') {

                const skillPool = (pool.skills?.TO_WITH) || {};

                const xList = (skillPool.people && skillPool.people.length > 0) ? skillPool.people : [{ j: "友達", r: "ともだち", zh: "朋友" }];
                const vList = (skillPool.actions && skillPool.actions.length > 0) ? skillPool.actions : [{ j: "話す", r: "はなす", zh: "說話" }];

                const x = pickOne(xList) || xList[0];
                const v = pickOne(vList) || vList[0];



                q = makeParticleQuestion({

                    chinese: `和${zhOf(x)}${zhOf(v)}`,

                    leftText: x.j,

                    leftRuby: x.r,

                    rightText: v.j,

                    rightRuby: v.r,

                    answer: 'と',

                    skillId: skillDef.id,

                    grammarTip: tipText,

                    choices: getChoices(["と", "に", "で", "へ"], 'と')

                });

            }



            else if (skillDef.id === 'GA_EXIST_SUBJECT') {

                const skillPool = (pool.skills?.GA_EXIST_SUBJECT) || {};

                const nounList = skillPool.nouns || [{ j: "猫", r: "ねこ", zh: "貓", existType: 'person' }];



                let n = pickOne(nounList);

                const verb = n.existType === 'person'

                    ? { j: "いる", r: "いる", zh: "有" }

                    : { j: "ある", r: "ある", zh: "有" };



                q = makeParticleQuestion({

                    chinese: `有${zhOf(n)}`,

                    leftText: n.j,

                    leftRuby: n.r,

                    rightText: verb.j,

                    rightRuby: verb.r,

                    answer: 'が',

                    skillId: skillDef.id,

                    grammarTip: tipText,

                    choices: getChoices(["が", "は", "に", "で"], 'が')

                });

            }

            else if (skillDef.id === 'KARA_FROM') {

                const skillPool = (pool.skills?.KARA_FROM) || {};

                const useTime = Math.random() < 0.5;



                if (useTime) {

                    const tList = skillPool.timePool || [{ j: "明日", r: "あした", zh: "明天" }];

                    const time = pickOne(tList);

                    const vList = [

                        { j: "始まる", r: "はじまる", zh: "開始" },

                        { j: "終わる", r: "おわる", zh: "結束" }

                    ];

                    const v = pickOne(vList);



                    q = makeParticleQuestion({

                        chinese: `從${zhOf(time)}${zhOf(v)}`,

                        leftText: time.j,

                        leftRuby: time.r,

                        rightText: v.j,

                        rightRuby: v.r,

                        answer: 'から',

                        skillId: skillDef.id,

                        grammarTip: tipText,

                        choices: getChoices(["から", "まで", "へ", "に"], 'から')

                    });

                } else {

                    const pList = skillPool.placePool || [{ j: "家", r: "いえ", zh: "家" }];

                    const p = pickOne(pList);

                    const moveList = skillPool.movePool || [

                        { j: "来る", r: "くる", zh: "來" },

                        { j: "行く", r: "いく", zh: "去" }

                    ];

                    const v = pickOne(moveList);



                    q = makeParticleQuestion({

                        chinese: `從${zhOf(p)}${zhOf(v)}`,

                        leftText: p.j,

                        leftRuby: p.r,

                        rightText: v.j,

                        rightRuby: v.r,

                        answer: 'から',

                        skillId: skillDef.id,

                        grammarTip: tipText,

                        choices: getChoices(["から", "まで", "へ", "に"], 'から')

                    });

                }

            }

            else if (skillDef.id === 'KARA_SOURCE_START') {

                const skillPool = (pool.skills?.KARA_SOURCE_START) || {};

                const list = Math.random() < 0.5 ? (skillPool.timeCombos || []) : (skillPool.placeCombos || []);

                const combo = pickOne(list);

                if (combo) {

                    const parts = combo.j.split('から');

                    q = makeParticleQuestion({

                        chinese: combo.zh,

                        leftText: parts[0],

                        leftRuby: combo.r?.split('から')[0] || parts[0],

                        rightText: parts[1],

                        rightRuby: combo.r?.split('から')[1] || parts[1],

                        answer: 'から',

                        skillId: skillDef.id,

                        grammarTip: tipText,

                        choices: getChoices(["から", "まで", "へ", "に"], 'から')

                    });

                }

            }

            else if (skillDef.id === 'MADE_LIMIT_END') {

                const skillPool = (pool.skills?.MADE_LIMIT_END) || {};

                const list = Math.random() < 0.5 ? (skillPool.timeCombos || []) : (skillPool.placeCombos || []);

                const combo = pickOne(list);

                if (combo) {

                    const parts = combo.j.split('まで');

                    q = makeParticleQuestion({

                        chinese: combo.zh,

                        leftText: parts[0],

                        leftRuby: combo.r?.split('まで')[0] || parts[0],

                        rightText: parts[1],

                        rightRuby: combo.r?.split('まで')[1] || parts[1],

                        answer: 'まで',

                        skillId: skillDef.id,

                        grammarTip: tipText,

                        choices: getChoices(["まで", "から", "へ", "に"], 'まで')

                    });

                }

            }

            else if (skillDef.id === 'TO_COMPANION') {

                const skillPool = (pool.skills?.TO_COMPANION) || {};

                const list = skillPool.safeCombos || [];

                const combo = pickOne(list);

                if (combo) {

                    const parts = combo.j.split('と');

                    q = makeParticleQuestion({

                        chinese: combo.zh,

                        leftText: parts[0],

                        leftRuby: combo.r?.split('と')[0] || parts[0],

                        rightText: parts[1],

                        rightRuby: combo.r?.split('と')[1] || parts[1],

                        answer: 'と',

                        skillId: skillDef.id,

                        grammarTip: tipText,

                        choices: getChoices(["と", "に", "で", "を"], 'と')

                    });

                }

            }

            else if (skillDef.id === 'DE_TOOL_MEANS') {

                const skillPool = (pool.skills?.DE_TOOL_MEANS) || {};

                const r = Math.random();

                let list;

                if (r < 0.33) list = skillPool.toolCombos || [];

                else if (r < 0.66) list = skillPool.languageCombos || [];

                else list = skillPool.transportCombos || [];

                

                const combo = pickOne(list);

                if (combo) {

                    const parts = combo.j.split('で');

                    q = makeParticleQuestion({

                        chinese: combo.zh,

                        leftText: parts[0],

                        leftRuby: combo.r?.split('で')[0] || parts[0],

                        rightText: parts[1],

                        rightRuby: combo.r?.split('で')[1] || parts[1],

                        answer: 'で',

                        skillId: skillDef.id,

                        grammarTip: tipText,

                        choices: getChoices(["で", "に", "と", "へ"], 'で')

                    });

                }

            }

            else if (skillDef.id === 'BOSS_REVIEW_01') {
                const reviewSkills = ['WA_TOPIC_BASIC', 'NO_POSSESSIVE', 'GA_INTRANSITIVE', 'WO_OBJECT_BASIC'];
                const chosenSkillId = pickOne(reviewSkills);
                return generateQuestionBySkill(chosenSkillId, blanks, db, vocab);
            }
            else if (skillDef.id === 'BOSS_REVIEW_02') {
                const reviewSkills = ['HE_DIRECTION', 'MO_ALSO_BASIC', 'NI_TIME', 'TO_AND'];
                const chosenSkillId = pickOne(reviewSkills);
                return generateQuestionBySkill(chosenSkillId, blanks, db, vocab);
            }
            else if (skillDef.id === 'BOSS_REVIEW_03') {
                const reviewSkills = ['DE_ACTION_PLACE', 'NI_EXIST_PLACE', 'GA_EXIST_SUBJECT', 'TO_WITH'];
                const chosenSkillId = pickOne(reviewSkills);
                return generateQuestionBySkill(chosenSkillId, blanks, db, vocab);
            }
            else if (skillDef.id === 'BOSS_REVIEW_04') {
                // Mixed review of から, まで, に(落點), で(工具)
                const reviewSkills = ['KARA_SOURCE_START', 'MADE_LIMIT_END', 'NI_DESTINATION', 'DE_TOOL_MEANS'];
                const chosenSkillId = pickOne(reviewSkills);
                return generateQuestionBySkill(chosenSkillId, blanks, db, vocab);
            }
            else if (skillDef.id === 'BOSS_REVIEW_05') {
                const reviewSkills = ['NI_TARGET', 'GA_BUT', 'MO_COMPLETE_NEGATION', 'TO_CONDITIONAL'];
                const chosenSkillId = pickOne(reviewSkills);
                return generateQuestionBySkill(chosenSkillId, blanks, db, vocab);
            }
            else if (skillDef.id === 'BOSS_REVIEW_06') {
                const reviewSkills = ['YA_AND_OTHERS', 'DE_SCOPE', 'NI_PURPOSE', 'TO_QUOTE'];
                const chosenSkillId = pickOne(reviewSkills);
                return generateQuestionBySkill(chosenSkillId, blanks, db, vocab);
            }
            else if (skillDef.id === 'FINAL_BOSS_35') {
                const reviewSkills = ['KARA_REASON', 'YORI_COMPARE', 'NI_FREQUENCY', 'DE_MATERIAL'];
                const chosenSkillId = pickOne(reviewSkills);
                return generateQuestionBySkill(chosenSkillId, blanks, db, vocab);
            }

            else if (skillDef.id === 'HIDDEN_BOSS_36') {

                if (bossSkillQueue.length === 0) startBossQueue(unlockedSkillIds.value, 36);

                const chosenSkillId = pickSkillForBoss();

                return generateQuestionBySkill(chosenSkillId, blanks, db, vocab);

            }

            return q;

        };



        // ================= [ BATTLE INIT ] =================
        /** 主戰鬥初始化：依關卡 ID 生成題庫、配置怪物、重置所有 battle state、啟動計時器。 */
        const initGame = (level, skipMentor = false, forceMentor = false) => {

            window._battlePopPlayed = false;

            let triggeredMentor = false;

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



            isMonsterImageError.value = false;

            monsterHitImageFailed.value = false;

            monsterIsEntering.value = true;
            setTimeout(() => { monsterIsEntering.value = false; }, 800);

            monsterIsDying.value = false;

            monsterTrulyDead.value = false;

            monsterResultShown.value = false;

            isMistakesOpen.value = false;

            isMenuOpen.value = false;

            stageLog.value = [];

            const lv = level ?? currentLevel.value;

            currentLevel.value = lv;

            const config = LEVEL_CONFIG.value[lv] || LEVEL_CONFIG.value[1] || { types: [0, 1, 2], blanks: 1 };



            if (config.unlockSkills && config.unlockSkills.length > 0) {

                const newUnlocks = [];

                config.unlockSkills.forEach(skillId => {

                    if (!unlockedSkillIds.value.includes(skillId)) {

                        unlockedSkillIds.value.push(skillId);

                        newUnlocks.push(skillId);

                    }

                });

                if (newUnlocks.length > 0) {

                    newlyUnlocked.value = newUnlocks.map(id => skillsAll.value[id]).filter(Boolean);



                    if (window._disableMentorAutoTrigger || skipMentor) {

                        // Skip mentor and popup for debug jump or direct map card entry

                    } else {

                        const firstNewSkillId = newUnlocks[0];

                        if (triggerMentorDialogue(firstNewSkillId, forceMentor)) {

                            triggeredMentor = true;

                            // Pause and wait for mentor to finish

                            window._resumeAfterMentor = () => {
                                // [Knowledge Card 1.0] Do not open old modal, it will show as Knowledge Card later
                                // isSkillUnlockModalOpen.value = true;
                            };

                        } else {
                            // isSkillUnlockModalOpen.value = true;
                        }

                    }

                    // [Knowledge Card 1.0] Stage these for post-battle reward
                    pendingKnowledgeCards.value.push(...newUnlocks.map(id => skillsAll.value[id]).filter(Boolean));

                }

            }



            // Instruction mentor logic

            if (!skipMentor && !triggeredMentor && config.skillId && !window._disableMentorAutoTrigger) {

                if (triggerMentorDialogue(config.skillId, forceMentor)) {

                    triggeredMentor = true;

                    // Ensure battle starts after mentor

                    window._resumeAfterMentor = () => {

                        if (!window._battlePopPlayed) {

                            playSfx('uiPop');

                            window._battlePopPlayed = true;

                        }

                        startTimer();

                    };

                }

            }





            const typePool = config.types;

            const blanks = config.blanks;

            const qList = [];

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



            for (let i = 0; i < 100; i++) {

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

                let isFallback = false;



                while (attempts < 10 && skillId && !generatedFromSkill) {

                    const originalLevel = currentLevel.value;

                    if (isReview) currentLevel.value = 1;

                    q = generateQuestionBySkill(skillId, blanks, db, VOCAB.value);

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

                        if ((skillId === 'NO_POSSESS' || skillId === 'NO_POSSESSIVE') && ansStr !== 'の') valid = false;

                        if ((skillId === 'WA_TOPIC' || skillId === 'WA_TOPIC_BASIC') && ansStr !== 'は') valid = false;

                        if ((skillId === 'GA_EXIST' || skillId === 'GA_INTRANSITIVE' || skillId === 'GA_EXIST_SUBJECT') && ansStr !== 'が') valid = false;

                        if ((skillId === 'WO_OBJECT' || skillId === 'WO_OBJECT_BASIC') && ansStr !== 'を') valid = false;

                        if ((skillId === 'NI_TIME' || skillId === 'NI_EXIST_PLACE') && ansStr !== 'に') valid = false;

                        if ((skillId === 'HE_DEST' || skillId === 'HE_DIRECTION') && ansStr !== 'へ') valid = false;

                        if ((skillId === 'MO_ALSO' || skillId === 'MO_ALSO_BASIC') && ansStr !== 'も') valid = false;

                        if ((skillId === 'DE_LOC' || skillId === 'DE_ACTION_PLACE') && ansStr !== 'で') valid = false;

                        if ((skillId === 'TO_WITH' || skillId === 'TO_AND') && ansStr !== 'と') valid = false;

                        if (skillId === 'KARA_FROM' && ansStr !== 'から') valid = false;



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

                        // Level 5 特殊重試與補位邏輯

                        if (lv === 5) {

                            if (attempts % 3 === 0 && attempts < 10) {

                                isFallback = true;

                                const level5Pool = ['WA_TOPIC_BASIC', 'NO_POSSESSIVE', 'GA_INTRANSITIVE', 'WO_OBJECT_BASIC'];

                                const blockStart = Math.floor(qList.length / 4) * 4;

                                const usedInBlock = qList.slice(blockStart).map(qq => qq.skillId);

                                const candidates = level5Pool.filter(s => s !== originalSkillId && !usedInBlock.includes(s));



                                // 優先換成缺少的，若都沒缺就隨機換一個

                                if (candidates.length > 0) {

                                    skillId = candidates[0];

                                } else {

                                    skillId = level5Pool.filter(s => s !== skillId)[0] || level5Pool[0];

                                }

                            }

                        }

                    }

                }



                if (!generatedFromSkill && skillId) {

                    q = safeFallbackQuestion(skillId);

                    if (q) generatedFromSkill = true;

                }



                if (!generatedFromSkill && lv === 5) {

                    // L5 完全封閉在 review pool，禁止進入全域 fallback switch（emergency only）

                    const fallbackSkillId = L5_REVIEW_POOL.find(s => s !== skillId) || L5_REVIEW_POOL[0];

                    q = safeFallbackQuestion(fallbackSkillId) || safeFallbackQuestion(L5_REVIEW_POOL[0]);

                    if (q) { q.skillId = fallbackSkillId; }

                } else if (!generatedFromSkill && lv === 10) {

                    // L10 同樣完全封閉在 L6-9 review pool，禁止進入全域 fallback switch（emergency only）

                    const fallbackSkillId = L10_REVIEW_POOL.find(s => s !== skillId) || L10_REVIEW_POOL[0];

                    q = safeFallbackQuestion(fallbackSkillId) || safeFallbackQuestion(L10_REVIEW_POOL[0]);

                    if (q) { q.skillId = fallbackSkillId; }

                } else if (!generatedFromSkill) {

                    switch (type) {

                        case 0:

                            const p0 = rand(db.places);

                            q = { chinese: `去${p0.t}`, segments: [{ text: p0.j, ruby: p0.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: "行く", ruby: "い", isBlank: false }], answers: [["へ", "に"]], grammarTip: db.grammarTips.move };

                            if (blanks === 1) q.choices = makeChoices(["へ", "に"]);

                            break;

                        case 1: {

                            const verbTypes = [

                                { type: "read", v: { j: "読む", r: "よ", full: "よむ" }, ch: "讀" },

                                { type: "eat", v: { j: "食べる", r: "た", full: "たべる" }, ch: "吃" },

                                { type: "hear", v: { j: "聞く", r: "き", full: "きく" }, ch: "聽" },

                                { type: "write", v: { j: "書く", r: "か", full: "かく" }, ch: "寫" }

                            ];

                            const vt = rand(verbTypes);

                            const pool1 = db.objects.filter(x => x.type === vt.type);

                            const o1 = rand(pool1);

                            const p1 = rand(db.places);

                            if (blanks === 1) {

                                const vReading = vt.v.full || vt.v.r + "む";

                                q = { chinese: `在${p1.t}${vt.ch}${o1.t}`, segments: [{ text: p1.j, ruby: p1.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: o1.j + "を" + vt.v.j, ruby: o1.r + "を" + vReading, isBlank: false }], answers: ["で"], grammarTip: db.grammarTips.placeAction };

                                q.choices = makeChoices("で");

                            } else {

                                q = { chinese: `在${p1.t}${vt.ch}${o1.t}`, segments: [{ text: p1.j, ruby: p1.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: o1.j, ruby: o1.r, isBlank: false }, { isBlank: true, blankIndex: 1 }, { text: vt.v.j, ruby: vt.v.r, isBlank: false }], answers: ["で", "を"], grammarTip: db.grammarTips.placeAction };

                            }

                            break;

                        }

                        case 2: {

                            const p2 = rand(db.places);

                            const pool2 = db.objects.filter(x => x.exists !== false);

                            const o2 = rand(pool2);

                            if (blanks === 1) {

                                q = { chinese: `${p2.t}有${o2.t}`, segments: [{ text: p2.j, ruby: p2.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: o2.j + "が" + "ある", ruby: o2.r + "がある", isBlank: false }], answers: ["に"], grammarTip: db.grammarTips.existence };

                                q.choices = makeChoices("に");

                            } else {

                                q = { chinese: `${p2.t}有${o2.t}`, segments: [{ text: p2.j, ruby: p2.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: o2.j, ruby: o2.r, isBlank: false }, { isBlank: true, blankIndex: 1 }, { text: "ある", isBlank: false }], answers: ["に", "が"], grammarTip: db.grammarTips.existence };

                            }

                            break;

                        }

                        case 3: {

                            const pe3 = rand(db.people); const o3 = db.objects.filter(x => x.type === 'read').random();

                            const v3 = { j: "読む", r: "よ", full: "よむ" };

                            if (blanks === 1) {

                                q = { chinese: `和${pe3.t}一起讀${o3.t}`, segments: [{ text: pe3.j, ruby: pe3.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: o3.j + "を" + v3.j, ruby: o3.r + "を" + v3.full, isBlank: false }], answers: ["と"], grammarTip: db.grammarTips.accompany };

                                q.choices = makeChoices("と");

                            } else {

                                q = { chinese: `和${pe3.t}一起讀${o3.t}`, segments: [{ text: pe3.j, ruby: pe3.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: o3.j, ruby: o3.r, isBlank: false }, { isBlank: true, blankIndex: 1 }, { text: "読む", ruby: "よ", isBlank: false }], answers: ["と", "を"], grammarTip: db.grammarTips.accompany };

                            }

                            break;

                        }

                        case 4: {

                            const useRead = Math.random() < 0.5;

                            const t4 = useRead ? db.tools.find(x => x.j === "スマホ") : db.tools.find(x => x.j === "ペン");

                            const pool4 = db.objects.filter(x => x.type === (useRead ? "read" : "write"));

                            const o4 = rand(pool4);

                            const verb4 = useRead ? { j: "読む", r: "よ", full: "よむ", ch: "看" } : { j: "書く", r: "か", full: "かく", ch: "寫" };

                            if (blanks === 1) {

                                q = { chinese: `用${t4.t}${verb4.ch}${o4.t}`, segments: [{ text: t4.j, ruby: t4.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: o4.j + "を" + verb4.j, ruby: o4.r + "を" + verb4.full, isBlank: false }], answers: ["で"], grammarTip: db.grammarTips.tool };

                                q.choices = makeChoices("で");

                            } else {

                                q = { chinese: `用${t4.t}${verb4.ch}${o4.t}`, segments: [{ text: t4.j, ruby: t4.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: o4.j, ruby: o4.r, isBlank: false }, { isBlank: true, blankIndex: 1 }, { text: verb4.j, ruby: verb4.r, isBlank: false }], answers: ["で", "を"], grammarTip: db.grammarTips.tool };

                            }

                            break;

                        }

                        case 5: {

                            const pe5 = rand(db.people); const o5 = rand(db.objects);

                            if (blanks === 1) {

                                q = { chinese: `給${pe5.t}${o5.t}`, segments: [{ text: pe5.j, ruby: pe5.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: o5.j + "をあげる", ruby: o5.r + "をあげる", isBlank: false }], answers: ["に"], grammarTip: db.grammarTips.give };

                                q.choices = makeChoices("に");

                            } else {

                                q = { chinese: `給${pe5.t}${o5.t}`, segments: [{ text: pe5.j, ruby: pe5.r, isBlank: false }, { isBlank: true, blankIndex: 0 }, { text: o5.j, ruby: o5.r, isBlank: false }, { isBlank: true, blankIndex: 1 }, { text: "あげる", isBlank: false }], answers: ["に", "を"], grammarTip: db.grammarTips.give };

                            }

                            break;

                        }

                    }

                    q.skillId = 'FALLBACK';

                } // end of else (non-L5 global fallback)



                qList.push(q);

            }



            questions.value = qList;

            currentIndex.value = 0;

            comboCount.value = 0;

            maxComboCount.value = 0;

            totalQuestionsAnswered.value = 0;

            correctAnswersAmount.value = 0;

            earnedExp.value = 0;

            earnedGold.value = 0;

            isFinished.value = false;

            userAnswers.value = [];

            slotFeedbacks.value = {};

            hasSubmitted.value = false;

            timeUp.value = false;

            isNextBtnVisible.value = false;

            animatedExp.value = 0;

            animatedGold.value = 0;



            const mdef = MONSTERS[(lv - 1) % MONSTERS.length] || MONSTERS[0];



            // 挑選符合目前關卡的怪物資料 (從 enemies.v1.json)

            const enemyMatch = (ENEMIES.value || []).find(e => e.spawnLevels && e.spawnLevels.includes(lv));



            const isBossLevel = (lv % 5 === 0);

            if (enemyMatch) {

                // 優先讀取 enemies.v1.json 的 hpMax，fallback 到舊 MONSTERS 表

                const resolvedHp = enemyMatch.hpMax ?? mdef.hpMax;

                monster.value = {

                    id: enemyMatch.id,

                    hp: resolvedHp,

                    maxHp: resolvedHp,

                    name: enemyMatch.name,

                    sprite: enemyMatch.image,

                    spriteHit: enemyMatch.imageHit || null,

                    trait: enemyMatch.trait,

                    size: enemyMatch.size || (isBossLevel ? 1.2 : 1),

                    posX: enemyMatch.posX ?? null,

                    posY: enemyMatch.posY ?? null

                };

            } else {

                monster.value = { 

                    hp: mdef.hpMax, 

                    maxHp: mdef.hpMax, 

                    name: mdef.name, 

                    sprite: mdef.sprite, 

                    spriteHit: null,

                    trait: mdef.trait,

                    size: isBossLevel ? 1.2 : 1,

                    posX: null,

                    posY: null

                };

            }

            // --- Background Assignment ---
            if (config.bgImage && typeof config.bgImage === 'string' && config.bgImage.trim() !== '') {
                currentBg.value = config.bgImage;
            } else {
                const bgIdx = Math.floor(Math.random() * 6) + 1;
                currentBg.value = `assets/images/bg_0${bgIdx}.jpg`;
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



        const getFormattedAnswer = () => {

            return currentQuestion.value.answers.map(ans => {

                const parsed = parseAcceptableAnswers(ans);

                return parsed.join('/');

            }).join(' 、 ');

        };



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



        const playQuestionVoice = async () => {

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



            voicePlayedForCurrentQuestion.value = true;

            await speakCloudTts(cleanQuestionText);

        };



        const parseAcceptableAnswers = (ans) => {

            if (typeof ans === 'string') return ans.split(/[/、,]/g).map(s => s.trim()).filter(s => s);

            return Array.isArray(ans) ? ans : [ans];

        };



        let lastPraiseTime = 0;

        let lastPraiseText = '';

        const ONEESAN_PRAISES = ['せいかい！', 'ナイス！', 'いいね！', 'すごい！', 'えぐっ！', 'まじか！', '天才か！'];



        const praiseToast = ref({ show: false, text: '' });

        let praiseToastTimer = null;

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



                const milestones = [3, 5, 7, 10, 15, 20];

                if (milestones.includes(combo)) {

                    const now = Date.now();

                    if (now - lastPraiseTime >= 1500 && lastPraiseText !== text) {

                        lastPraiseTime = now;

                        lastPraiseText = text;

                        if (praiseIndex <= 0) {
                            playTtsKey(`ui.praise_${praiseIndex}`, text);
                        } else {
                            // 3回以上 combo 時直接走雲端/WebSpeech，避免 404 噪音
                            speakCloudTts(text);
                        }

                    }

                }

            }

        };



        // ================= [ BATTLE LOGIC ] =================
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

            isCurrentCorrect.value = allCorrect;

            logStageQuestion(allCorrect);



            // 🌟 判定延遲時間：彈射模式等子彈飛 400ms，點選模式可以同步或無延遲 (此處統一使用 400ms 營造打擊節奏)

            const isFlick = answerMode.value === 'flick';

            const impactDelay = isFlick ? 400 : 0;



            setTimeout(() => {

                if (isCurrentCorrect.value) {

                    correctAnswersAmount.value++;

                    playCorrectFeedback(comboCount.value + 1);



                    const isPlayerMiss = Math.random() < 0.05;

                    if (isPlayerMiss) {

                        if (_isMobileSfx) playUiSfx('miss'); else playSfx('miss');

                        pushBattleLog(`攻擊被閃避了！沒造成傷害！`, 'info');

                    } else {

                        monsterHit.value = true;

                        setTimeout(() => { monsterHit.value = false; }, 500); // 延長至 0.5s



                        // 正式版：只有怪物將在 2 秒內出手時，命中才追加 1 秒硬直

                        if (timeLeft.value < 2.0) {

                            timeLeft.value += 1.0;

                        }



                        // 新增邏輯：當敵方速度極快時（enemyAtbMult < 0.2），命中時獲得額外時間獎勵

                        if (10 * heroBuffs.enemyAtbMult < 2.0) {

                            timeLeft.value += 1.0 / heroBuffs.enemyAtbMult;

                        }



                        // 🌟 子彈抵達瞬間！完美同步播放打擊音效

                        if (_isMobileSfx) playUiSfx('hit'); else playSfx('hit');



                        // 💡 點選(Tap)模式原本沒有子彈，這裡幫它補上命中爆炸特效

                        if (!isFlick) {

                            const monsterEl = document.querySelector('img[alt="monster"]') || document.querySelector('.w-28.h-28.rounded-full');

                            const center = rectCenter(monsterEl);

                            if (center) spawnHitVfx(center.x, center.y);

                        }



                        comboCount.value++;

                        if (comboCount.value > maxComboCount.value) maxComboCount.value = comboCount.value;

                        regenSP();



                        const timeTaken = (Date.now() - questionStartTime) / 1000;

                        let dmg = 20;

                        if (timeTaken <= 2) dmg = 20;

                        else if (timeTaken >= 10) dmg = 5;

                        else dmg = Math.round(20 - ((timeTaken - 2) / 8) * 15);



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

                        window.spawnFloatingDamage('monster', dmg);



                        if (monster.value.hp <= 0) grantRewards();

                    }

                } else {

                    comboCount.value = 0;

                    addMistake();



                    initAudio();

                    if (_isMobileSfx) playUiSfx('miss'); else playSfx('miss');

                    pushBattleLog(`攻擊失敗！`, 'info');



                    if (window.__TTS_ON_WRONG_TIMEOUT) { clearTimeout(window.__TTS_ON_WRONG_TIMEOUT); window.__TTS_ON_WRONG_TIMEOUT = null; }

                    if (window.__FLICK_ADVANCE_TIMEOUT) { clearTimeout(window.__FLICK_ADVANCE_TIMEOUT); window.__FLICK_ADVANCE_TIMEOUT = null; }



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



                if (delayMs > 0) {

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

            showGrammarDetail.value = false;

            if (window.__TTS_ON_WRONG_TIMEOUT) { clearTimeout(window.__TTS_ON_WRONG_TIMEOUT); window.__TTS_ON_WRONG_TIMEOUT = null; }

            if (window.__FLICK_ADVANCE_TIMEOUT) { clearTimeout(window.__FLICK_ADVANCE_TIMEOUT); window.__FLICK_ADVANCE_TIMEOUT = null; }

            if (window.__AUTO_ADVANCE_TIMEOUT) { clearTimeout(window.__AUTO_ADVANCE_TIMEOUT); window.__AUTO_ADVANCE_TIMEOUT = null; }

            initAudio();

            if (needsUserGestureToResumeBgm.value) { ensureBgmPlaying('nextQuestion'); needsUserGestureToResumeBgm.value = false; }

            playSfx('click');



            if (currentIndex.value < 49) {

                currentIndex.value++;

                if (currentIndex.value >= questions.value.length) currentIndex.value = 0;

            } else {

                currentIndex.value = 0;

            }



            userAnswers.value = [];

            slotFeedbacks.value = {};

            hasSubmitted.value = false;

            applyTurnLogic();



            if (answerMode.value === 'flick') {

                flickState.isArmed = false;

                flickState.activeOpt = null;

            }

            const vfxLayer = document.getElementById('flickVfxLayer');

            if (vfxLayer) vfxLayer.innerHTML = '';



            questionStartTime = Date.now();

            voicePlayedForCurrentQuestion.value = false;

        };



        const grantRewards = () => {

            const lv = currentLevel.value;

            const baseExp = 50 + (lv * 20);

            const baseGold = 30 + (lv * 15);

            const comboBonus = maxComboCount.value * 5;

            earnedExp.value = baseExp;

            earnedGold.value = baseGold + comboBonus;

            player.value.exp += earnedExp.value;

            player.value.gold += earnedGold.value;

            totalGold.value += earnedGold.value; // <--- Accumulate totalGold

            // Unconditional HP/SP Reset on Victory
            player.value.hp = player.value.maxHp;
            resetSP();

            pushBattleLog(`擊敗怪物！獲得 ${earnedExp.value} EXP`, 'buff');

            clearTimer();



            const isBoss = currentLevel.value % 5 === 0;

            // 🟢 26031301 Optimized: 死亡演出長度 (Boss 5.5s / 一般固定 2.0s)

            const deathDuration = isBoss ? 5500 : 2000; 



            monsterIsDying.value = true;

            

            // 🌟 第一階段：等待死亡演出完整播完

            setTimeout(() => {

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

                const GRADE_RANK = { 'S': 6, 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, '-': 0 };

                const isGradeBetter = (newG, oldG) => (GRADE_RANK[newG] || 0) > (GRADE_RANK[oldG] || 0);

                

                if (!oldG || isGradeBetter(currentG, oldG)) {

                    bestGrades.value[currentLevel.value] = currentG;

                }



                const nextLv = currentLevel.value + 1;

                if (nextLv < maxLevel.value && !unlockedLevels.value.includes(nextLv)) {

                    unlockedLevels.value.push(nextLv);

                    newUnlockLv.value = nextLv; // Mark for highlight and scroll

                } else {

                    newUnlockLv.value = null;

                }

                saveProgression();



                stopAllAudio();

                if (isBoss) {

                    playSfx('bossClear');

                } else {

                    playSfx('win');

                }

                setHeroAvatar('win');

                

                // 🌟 第二階段：死亡演出結束後，檢查是否有新技能知識卡需要播放
                // 如果有卡片，播放完畢後才進入數字遞增環節
                setTimeout(() => { 

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



            }, deathDuration);



            // 拆分出數字遞增邏輯，確保在正確時機點火

            const startTallySequence = () => {

                const expTarget = earnedExp.value;

                const goldTarget = earnedGold.value;

                const maxUnits = Math.max(expTarget, goldTarget);

                let calculatedDuration = (maxUnits / 30) * 1000;

                const duration = Math.min(Math.max(calculatedDuration, 800), 2000);

                

                const startTime = Date.now();



                const animateRewards = () => {

                    const elapsed = Date.now() - startTime;

                    const progress = Math.min(elapsed / duration, 1);

                    animatedExp.value = Math.floor(expTarget * progress);

                    animatedGold.value = Math.floor(goldTarget * progress);

                    

                    if (progress < 1) {

                        requestAnimationFrame(animateRewards);

                    } else {

                        // 🌟 第三階段：遞增完成後，才顯示 Next 鈕

                        animatedExp.value = expTarget;

                        animatedGold.value = goldTarget;

                        setTimeout(() => {

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

            e.target.src = 'assets/images/maps/chapter1.png';

        };



        const getAnswerForDisplay = (blankIndex) => {

            const ans = currentQuestion.value.answers[blankIndex];

            return Array.isArray(ans) ? ans[0] : ans;

        };



        const currentMonsterSprite = computed(() => {

            if (!monster.value || !monster.value.sprite) return '👹';

            if (isMonsterImageError.value) return 'assets/images/monsters/slime.png';

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

            if (needsUserGestureToResumeBgm.value) { ensureBgmPlaying('selectChoice'); needsUserGestureToResumeBgm.value = false; }

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

        const levelPassed = computed(() => monsterDead.value);







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
        /** 關卡推進入口：發放 Boss 能力獎勵 Modal，完成後呼叫 proceedToNextLevel。 */
        const goNextLevel = () => {

            needsUserGestureToResumeBgm.value = false;

            stopAllAudio();



            // 檢查本關 Boss 獎勵

            const clearedLevelConfig = LEVEL_CONFIG.value[currentLevel.value];

            if (clearedLevelConfig?.rewardAbilityId) {

                const rewardedSkill = grantAbilityReward(clearedLevelConfig.rewardAbilityId);

                if (rewardedSkill) {

                    // 如果是新習得，則跳出 Modal

                    pendingLevelUpAbility.value = rewardedSkill;
                    playSfx('uiPop'); // Added for boss ability unlock
                    isAbilityUnlockModalOpen.value = true;

                    // 暫存下一關資訊，等玩家按確認

                    queuedNextLevel.value = currentLevel.value + 1;

                    pauseBattle(); // 確保計時器等狀態暫停

                    return; // 中斷原本的 goNextLevel 流程

                }

            }

            proceedToNextLevel();

        };



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



        const retryLevel = () => { needsUserGestureToResumeBgm.value = false; stopAllAudio(); initGame(currentLevel.value); };



        const startOver = () => {

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

            showLevelSelect.value = true;

            inventory.value.potions = INITIAL_POTIONS;

            resetSP();

        };



        const revive = () => {

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

            player.value = { hp: 100, maxHp: 100, gold: 0, exp: 0 };

            inventory.value.potions = INITIAL_POTIONS;

            resetSP();

            showLevelSelect.value = true;

        };



        const accuracyPct = computed(() => {

            if (totalQuestionsAnswered.value === 0) return 0;

            return Math.round((correctAnswersAmount.value / totalQuestionsAnswered.value) * 100);

        });



        const calculatedGrade = computed(() => {

            if (playerDead.value) return '-';

            const acc = accuracyPct.value;

            if (acc === 100) return 'S';

            if (acc >= 90) return 'A';

            if (acc >= 80) return 'B';

            if (acc >= 60) return 'C';

            if (acc >= 40) return 'D';

            return 'E';

        });



        const getGradeColor = (grade) => {

            const colors = {

                'S': 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)] [text-shadow:0_0_2px_#000,0_0_4px_#000]',

                'A': 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]',

                'B': 'text-slate-300 drop-shadow-[0_0_6px_rgba(148,163,184,0.7)] [text-shadow:0_0_2px_#000,0_0_4px_rgba(0,0,0,0.7)]',

                'C': 'text-amber-400',

                'D': 'text-orange-400',

                'E': 'text-rose-500',

                '-': 'text-slate-500'

            };

            return colors[grade] || 'text-slate-400';

        };



        const getHpColorClass = (hp, maxHp) => {

            const ratio = hp / maxHp;

            if (ratio <= 0.4) return 'bg-rose-500';

            if (ratio <= 0.79) return 'bg-amber-400';

            return 'bg-emerald-500';

        };



        const formatCorrect = (ans) => {

            if (Array.isArray(ans)) return ans.join('/');

            return ans;

        };



        if (!Array.prototype.random) {

            Array.prototype.random = function () { return this[Math.floor(Math.random() * this.length)]; };

        }



        const handleReload = () => {

            isMenuOpen.value = false;

            setTimeout(() => {

                localStorage.removeItem('jpRpgAppVersion');

                window.location.reload(true);

            }, 100); // 確保選單已關閉後再執行

        };



        onMounted(() => {

            const savedVersion = localStorage.getItem('jpRpgAppVersion');

            if (!savedVersion) {

                // First load -> initialize safely

                localStorage.setItem('jpRpgAppVersion', APP_VERSION);

            } else if (savedVersion !== APP_VERSION) {

                // Update detected -> set and reload

                localStorage.setItem('jpRpgAppVersion', APP_VERSION);

                alert('遊戲已更新，將重新載入最新版');

                window.location.reload(true);

            }



            const unlockAudioOnce = () => {

                initAudioCtx().then(() => {

                    if (!audioInited.value) initAudio();

                });

            };

            document.addEventListener('pointerdown', unlockAudioOnce, { once: true, capture: true });

            document.addEventListener('touchstart', unlockAudioOnce, { once: true, capture: true, passive: true });



            const injectTapChoicesClass = () => {

                const el = document.querySelector('#question-area ~ .flex.flex-wrap.justify-center.gap-3');

                if (el && !el.classList.contains('jp-tap-choices')) {

                    el.classList.add('jp-tap-choices');

                }

            };

            const tapChoicesObserver = new MutationObserver(injectTapChoicesClass);

            tapChoicesObserver.observe(document.body, { childList: true, subtree: true });

            watch([answerMode, hasSubmitted], () => {

                nextTick(injectTapChoicesClass);

            });

            injectTapChoicesClass();


            window.__initCornerMenu?.(watch, showLevelSelect, isFinished);



            window.__initViewportHooks?.(watch, showLevelSelect);

        });



        const shouldShowNextButton = computed(() => {

            if (!hasSubmitted.value) return false;

            if (isCurrentCorrect.value && settings.correctAdvanceDelayMs === 0) return true;

            if (!isCurrentCorrect.value && settings.wrongAdvanceDelayMs === 0) return true;

            return false;

        });



        const replaySpecificMentor = (skillId) => {

            isMenuOpen.value = false;

            isMentorReplayOpen.value = false;

            const skill = skillsAll.value[skillId];

            if (!skill || !skill.mentorDialogue) return;



            // 暫停戰鬥

            pauseBattle();



            // 設定關閉後的回呼：僅恢復戰鬥，不誤走首進流程 (如 Reveal Modal)

            window._resumeAfterMentor = () => {

                resumeBattle();

            };



            stopMentorAudio();

            setupMentorDialogue(skill);

        };



        // ================= [ DEBUG TOOLS — LEVEL JUMP ] =================
        const debugJumpToLevel = (level) => {

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

            if (flickState.capturedEl) {

                try { flickState.capturedEl.releasePointerCapture(1); } catch (e) { }

                flickState.capturedEl = null;

            }



            isMenuOpen.value = false;

            isMentorModalOpen.value = false;

            isMentorReplayOpen.value = false;

            isLevelJumpOpen.value = false;

            praiseToast.value.show = false;

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
            showLevelSelect, isFinished, levelConfig, LEVEL_CONFIG,
            levelTitle, player, monster, currentQuestion,
            startLevel, retryLevel, initGame, generateQuestionBySkill,
            mentorTutorialSeen, saveMentorState, skillsAll, setupMentorDialogue,
            pauseBattle, db, VOCAB
        });

        return {
            isNextBtnVisible,
            animatedExp, animatedGold,
            uiMenuOpen, answerMode, flickState, handleRuneClick, startFlick, moveFlick, endFlick, appVersion, isChangelogOpen, changelogData, changelogError, openChangelog, questions, currentIndex, currentQuestion, userAnswers, slotFeedbacks, hasSubmitted, totalScore, comboCount, maxComboCount, currentLevel, maxLevel, LEVEL_CONFIG, levelConfig, levelTitle, isChoiceMode, showLevelSelect, showGrammarDetail, difficulty, player, monster, inventory, monsterShake, playerBlink, hpBarDanger, goldDoubleNext, isFinished, isCurrentCorrect, timeLeft, timeUp, wrongAnswerPause, wrongAnswerPauseCountdown, mistakes, stageLog, isMenuOpen, isMistakesOpen, isInventoryOpen, formatCorrect, monsterHit, screenShake, bossScreenShake, flashOverlay, bgmVolume, sfxVolume, masterVolume, isMuted, isPreloading, needsUserGestureToResumeBgm, monsterDead, playerDead, levelPassed, displaySegments, getAnswerForDisplay, selectChoice, getChoiceBtnClass, checkAnswer, nextQuestion, getInputStyle, playQuestionVoice, initGame, getFormattedAnswer, goNextLevel, retryLevel, startOver, revive, startLevel, usePotion, useSpeedPotion, evasionBuffAttacksLeft, clearMistakes, playBgm, pauseBgm, playSfx, playMistakeVoice, loadAudioSettings, saveAudioSettings, handleGameOver, stopAllAudio, runAway, startRunAwayPress, cancelRunAwayPress, isRunAwayPressing, setBattleMessage, ensureBgmPlaying, onUserGesture, currentBg, accuracyPct, calculatedGrade, getGradeColor, earnedExp, earnedGold, getHpColorClass, SKILLS, skillsAll, skillsWithUnlockLevel, unlockedSkillIds, newlyUnlocked, isSkillUnlockModalOpen, isCodexOpen, expandedSkillId, pauseBattle, resumeBattle, openCodexTo, isPlayerDodging, isSkillOpen, openSkillOverlay, closeSkillOverlay,
            allAbilities, unlockedAbilityIds, skillList, castAbility, spState, handleReload, settings, shouldShowNextButton, praiseToast,
            pendingLevelUpAbility, isAbilityUnlockModalOpen, confirmAbilityUnlockAndContinue,
            isMentorModalOpen, isMentorReplayOpen, isLevelJumpOpen, isAdvancedSettingsOpen, replaySpecificMentor, debugJumpToLevel, mentorTutorialSeen, currentMentorSkill, mentorDialogueIndex, currentMentorLine, isLastMentorLine, nextMentorLine,
            displayedMentorText, isTypingMentor, restartMentorDialogue, finishMentorDialogue, isMentorPortraitError, mentorPages,
            isMentorSkipPressing, startMentorSkipPress, cancelMentorSkipPress,
            isMonsterImageError, handleMonsterImageError, handleMapImageError, currentMonsterSprite, monsterPositionStyle, monsterIsEntering, monsterIsDying, monsterTrulyDead, monsterResultShown,
            showMap, unlockedLevels, clearedLevels, showMentorChoice, selectedMapLevel,
            openMap, isLevelUnlocked, isLevelCleared, getStageNodeClass, getLevelTitle, hasMentor,

            selectStageFromMap, startStageWithExplanation, returnToMap,

            scrollToStage, lastClearedLevel, newUnlockLv, bestGrades, getGradeColor, sRankCount, totalGold,

            mapChapters, activeChapter, getMapNodeStyle, selectedSegmentIdx, isSegmentUnlocked, handleMapTabClick, jumpToMapSegment, isMapDropdownOpen,

            isBattleConfirmOpen, selectedStageToConfirm, confirmAndStartBattle,

            isMapMentorOpen, mentorPages, mentorDialogueIndex, displayedMentorText, isTypingMentor, nextMentorLine, finishMentorDialogue,

            pendingKnowledgeCards, activeKnowledgeCard, isKnowledgeCardShowing, isKnowledgeCardAbsorbing, triggerNextKnowledgeCard, closeKnowledgeCard

        };



    }

});
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => _jpApp.mount('#app'));
} else {
    _jpApp.mount('#app');
}