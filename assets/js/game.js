


window.__sp = { cur: 20, max: 20 };

window.spawnFloatingDamage = function (target, amount, type = 'hp') {
    const vfxLayer = (typeof window.getVfxLayer === 'function') ? window.getVfxLayer() : document.getElementById('global-vfx-layer');
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

    // Type-based styling
    if (type === 'sp') {
        el.classList.add('floating-dmg-sp');
        el.style.color = '#60a5fa'; // Blue-400
        el.style.textShadow = '0 0 15px rgba(59, 130, 246, 0.6), 0 2px 4px rgba(0,0,0,0.8)';
    } else if (amount < 0) {
        el.classList.add('floating-dmg-heal');
        el.style.color = '#4ade80'; // Emerald-400
        el.style.textShadow = '0 0 15px rgba(16, 185, 129, 0.6), 0 2px 4px rgba(0,0,0,0.8)';
    } else if (target === 'player') {
        // Red color for hero damage
        el.style.color = '#ef4444'; // Red-500
        el.style.textShadow = '0 0 10px rgba(239, 68, 68, 0.5), 0 2px 4px rgba(0,0,0,0.8)';
    }

    let fontSize = 14 + (Math.abs(amount) * 0.9);
    if (type === 'sp' || amount < 0) fontSize = Math.max(fontSize, 28);
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

    let ox = (Math.random() - 0.5) * 20;
    const oy = (Math.random() - 0.5) * 10;
    if (type === 'sp') ox = 22;
    else if (amount < 0) ox = -22;

    el.style.left = `${x + ox}px`;
    el.style.top = `${y + oy}px`;
    el.style.fontSize = `${fontSize}px`;

    // Display value
    if (type === 'sp') {
        el.innerHTML = `+${Math.abs(amount)}`;
    } else if (amount < 0) {
        el.innerHTML = `+${Math.abs(amount)}`;
    } else {
        el.innerHTML = `-${amount}`;
    }

    vfxLayer.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 1200);
};



// window.spawnSkillActivationVfx — 已移至 assets/js/skill-vfx.js (載入順序在本檔之前)



window.spawnGiraGiraHitVfx = function (x, y) {
    const vfxLayer = (typeof window.getVfxLayer === 'function') ? window.getVfxLayer() : document.getElementById('global-vfx-layer');
    if (!vfxLayer) return;

    const spawn = (css, dur, frames, easing, delayMs = 0) => {
        const run = () => {
            const el = document.createElement('div');
            el.style.cssText = css;
            vfxLayer.appendChild(el);
            el.animate(frames, { duration: dur, easing: easing || 'ease-out', fill: 'forwards' });
            setTimeout(() => { if (el.isConnected) el.remove(); }, dur + 100);
        };
        if (delayMs > 0) setTimeout(run, delayMs);
        else run();
    };

    const tImpact = 82;

    // 前搖：聚光收束（與主爆分開，讀感更像「斬落前一瞬」）
    spawn(
        `position:absolute;width:118px;height:118px;left:${x - 59}px;top:${y - 59}px;z-index:20;pointer-events:none;` +
        `border-radius:50%;` +
        `background:radial-gradient(circle,rgba(255,252,245,0.58) 0%,rgba(254,243,199,0.38) 38%,rgba(251,191,36,0.24) 58%,transparent 74%);` +
        `box-shadow:0 0 26px rgba(251,191,36,0.38),0 0 40px rgba(255,255,255,0.1),inset 0 0 16px rgba(255,255,255,0.08);`,
        110,
        [
            { opacity: 0.55, transform: 'scale(1.22)' },
            { opacity: 1, transform: 'scale(0.74)' },
            { opacity: 0, transform: 'scale(0.58)' }
        ],
        'cubic-bezier(0.32, 0, 0.15, 1)',
        0
    );
    [[-31, 1], [31, -1]].forEach(([rot, dir]) => {
        spawn(
            `position:absolute;width:2px;height:108px;left:${x - 1}px;top:${y - 54}px;z-index:21;pointer-events:none;` +
            `transform-origin:center center;mix-blend-mode:screen;` +
            `background:linear-gradient(to bottom,transparent 10%,rgba(255,250,230,0.55) 42%,rgba(253,224,71,0.75) 52%,transparent 90%);` +
            `box-shadow:0 0 8px rgba(255,255,255,0.45);`,
            105,
            [
                { opacity: 0.2, transform: `rotate(${rot}deg) scaleY(0.14)` },
                { opacity: 0.95, transform: `rotate(${rot + dir * 5}deg) scaleY(0.52)` },
                { opacity: 0, transform: `rotate(${rot + dir * 8}deg) scaleY(0.62)` }
            ],
            'cubic-bezier(0.28, 0.82, 0.32, 1)',
            0
        );
    });

    // 命中核：金白集中爆閃（輪廓收緊、減少中心霧白，亮度仍高）
    spawn(
        `position:absolute;width:38px;height:38px;left:${x - 19}px;top:${y - 19}px;z-index:26;pointer-events:none;mix-blend-mode:screen;` +
        `border-radius:50%;` +
        `background:radial-gradient(circle,rgba(255,255,255,1) 0%,rgba(255,252,240,0.94) 9%,rgba(253,224,71,0.88) 26%,rgba(251,191,36,0.55) 46%,transparent 72%);` +
        `box-shadow:0 0 1px #fff,0 0 10px rgba(255,255,255,0.82),0 0 24px rgba(254,240,138,0.58),0 0 36px rgba(251,191,36,0.32);`,
        62,
        [
            { opacity: 0, transform: 'scale(0.28)' },
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0.72, transform: 'scale(1.04)' },
            { opacity: 0, transform: 'scale(1.16)' }
        ],
        'cubic-bezier(0.12, 0.62, 0.2, 1)',
        tImpact
    );
    spawn(
        `position:absolute;width:50px;height:50px;left:${x - 25}px;top:${y - 25}px;z-index:25;pointer-events:none;` +
        `border-radius:50%;border:1.5px solid rgba(255,248,230,0.95);` +
        `box-shadow:0 0 8px rgba(255,255,255,0.72),0 0 22px rgba(251,191,36,0.58),inset 0 0 6px rgba(255,255,255,0.22);`,
        205,
        [
            { opacity: 0, transform: 'scale(0.18)' },
            { opacity: 1, transform: 'scale(0.52)' },
            { opacity: 0.38, transform: 'scale(1.12)' },
            { opacity: 0, transform: 'scale(1.92)' }
        ],
        'cubic-bezier(0.06, 0.88, 0.22, 1)',
        tImpact
    );
    spawn(
        `position:absolute;width:92px;height:92px;left:${x - 46}px;top:${y - 46}px;z-index:23;pointer-events:none;` +
        `border-radius:50%;` +
        `background:radial-gradient(circle,rgba(255,253,245,0.9) 0%,rgba(253,224,71,0.7) 38%,rgba(251,191,36,0.46) 54%,rgba(234,88,12,0.1) 68%,transparent 78%);` +
        `box-shadow:0 0 32px rgba(254,215,102,0.42),0 0 48px rgba(251,146,60,0.16);`,
        275,
        [{ opacity: 1, transform: 'scale(0.14)' }, { opacity: 0, transform: 'scale(2.72)' }],
        'cubic-bezier(0.05, 0.9, 0.18, 1)',
        tImpact
    );

    // 刺入軸 + 極細短促斬線（高光芯、讀成「切進去」而非光團）
    spawn(
        `position:absolute;width:1.5px;height:96px;left:${x - 0.75}px;top:${y - 48}px;z-index:29;pointer-events:none;transform-origin:center center;mix-blend-mode:screen;` +
        `background:linear-gradient(to bottom,transparent 6%,rgba(255,255,255,0.98) 44%,rgba(255,255,255,1) 50%,rgba(255,250,220,0.95) 56%,transparent 94%);` +
        `box-shadow:0 0 6px rgba(255,255,255,0.95),0 0 3px rgba(253,224,71,0.9);border-radius:1px;`,
        58,
        [
            { opacity: 0, transform: 'scaleY(0.12)' },
            { opacity: 1, transform: 'scaleY(1)' },
            { opacity: 0, transform: 'scaleY(1.06)' }
        ],
        'cubic-bezier(0.18, 0.75, 0.2, 1)',
        tImpact
    );
    [[-9, 1], [9, -1], [-83, 1], [83, -1]].forEach(([rot, dir], si) => {
        spawn(
            `position:absolute;width:1px;height:84px;left:${x - 0.5}px;top:${y - 42}px;z-index:29;pointer-events:none;transform-origin:center center;mix-blend-mode:screen;` +
            `background:linear-gradient(to bottom,transparent 8%,rgba(255,255,255,1) 42%,rgba(254,249,232,0.98) 50%,rgba(253,224,71,0.75) 62%,transparent 92%);` +
            `box-shadow:0 0 5px rgba(255,255,255,0.88);border-radius:1px;`,
            72 + si * 6,
            [
                { opacity: 0, transform: `rotate(${rot}deg) scaleY(0.08)` },
                { opacity: 1, transform: `rotate(${rot + dir * 6}deg) scaleY(1)` },
                { opacity: 0, transform: `rotate(${rot + dir * 10}deg) scaleY(1.12)` }
            ],
            'cubic-bezier(0.12, 0.88, 0.22, 1)',
            tImpact + 2
        );
    });

    // 斬擊刃：兩主兩副交叉（略收體積、刃緣更硬）
    const slashes = [
        [-54, 1, 4.5, 198, 0],
        [54, -1, 4.5, 198, 0],
        [-17, -1, 2.8, 158, 14],
        [17, 1, 2.8, 158, 14]
    ];
    slashes.forEach(([rot, dir, sw, sh, extraDelay]) => {
        const halfW = sw / 2;
        const halfH = sh / 2;
        spawn(
            `position:absolute;width:${sw}px;height:${sh}px;left:${x - halfW}px;top:${y - halfH}px;z-index:28;pointer-events:none;` +
            `transform-origin:center center;mix-blend-mode:screen;` +
            `background:linear-gradient(to bottom,transparent 2%,rgba(255,255,255,0.98) 24%,rgba(255,248,220,0.96) 46%,rgba(251,191,36,1) 56%,rgba(249,115,22,0.5) 66%,transparent 97%);` +
            `border-radius:1px;box-shadow:0 0 8px rgba(255,255,255,0.68),0 0 6px rgba(251,191,36,0.75);`,
            242,
            [
                { opacity: 1, transform: `rotate(${rot}deg) scaleY(0.05)` },
                { opacity: 1, transform: `rotate(${rot + dir * 12}deg) scaleY(1.32)` },
                { opacity: 0, transform: `rotate(${rot + dir * 19}deg) scaleY(1.48)` }
            ],
            'cubic-bezier(0.05, 0.93, 0.16, 1)',
            tImpact + extraDelay
        );
    });

    // 星芒火花：貼近命中點的崩裂碎光（非外向煙火）
    for (let i = 0; i < 8; i++) {
        const ang = (Math.PI * 2 / 8) * i + (i % 2 ? 0.07 : -0.05);
        const dist = 22 + Math.random() * 20;
        const len = 5 + Math.random() * 7;
        spawn(
            `position:absolute;width:3px;height:${len}px;left:${x - 1.5}px;top:${y - len / 2}px;z-index:27;pointer-events:none;mix-blend-mode:screen;` +
            `border-radius:1px;` +
            `background:linear-gradient(to top,transparent,rgba(255,255,255,0.96),#fef08a,rgba(251,191,36,0.92));` +
            `box-shadow:0 0 6px rgba(255,255,255,0.75),0 0 5px rgba(251,191,36,0.65);`,
            118 + Math.random() * 42,
            [
                { opacity: 1, transform: `rotate(${ang + Math.PI / 2}rad) translate(0,0) scaleY(0.35)` },
                { opacity: 0.9, transform: `rotate(${ang + Math.PI / 2}rad) translate(0,-${dist * 0.32}px) scaleY(1)` },
                { opacity: 0, transform: `rotate(${ang + Math.PI / 2}rad) translate(0,-${dist}px) scaleY(0.08)` }
            ],
            'cubic-bezier(0.2, 0.82, 0.32, 1)',
            tImpact + Math.floor(Math.random() * 14)
        );
    }
    for (let i = 0; i < 4; i++) {
        const r = i * 45;
        spawn(
            `position:absolute;width:16px;height:1.5px;left:${x - 8}px;top:${y - 0.75}px;z-index:28;pointer-events:none;mix-blend-mode:screen;` +
            `border-radius:1px;` +
            `background:linear-gradient(90deg,transparent,rgba(255,255,255,1),rgba(255,250,220,0.92),transparent);` +
            `box-shadow:0 0 6px rgba(255,255,255,0.88),0 0 3px rgba(251,191,36,0.65);`,
            98,
            [
                { opacity: 0, transform: `rotate(${r}deg) scaleX(0.12)` },
                { opacity: 1, transform: `rotate(${r}deg) scaleX(1)` },
                { opacity: 0, transform: `rotate(${r}deg) scaleX(0.42)` }
            ],
            'ease-out',
            tImpact + 5 + i * 6
        );
    }

    // 極短殘光：斬過一瞬熱痕
    spawn(
        `position:absolute;width:98px;height:98px;left:${x - 49}px;top:${y - 49}px;z-index:19;pointer-events:none;` +
        `border-radius:50%;` +
        `background:radial-gradient(circle,transparent 0%,rgba(255,237,200,0.2) 38%,rgba(251,191,36,0.12) 58%,transparent 76%);`,
        108,
        [{ opacity: 0.55, transform: 'scale(0.92)' }, { opacity: 0, transform: 'scale(1.22)' }],
        'ease-out',
        tImpact + 68
    );
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
        // ---- [ NEW: ONE-TIME SCENE CONSTANTS ] ----
        const PROLOGUE_BG = ''; // Add path here if needed
        const PROLOGUE_BGM = ''; // Add path here if needed
        const MAIN_ENDING_BG = 'assets/images/levels/bg_lv1.webp';
        const MAIN_ENDING_BGM = ''; // Add path here if needed

        onMounted(async () => {
            // Load Map Chapter Data (Ensuring this runs on all environments)
            try {
                const resp = await fetch('assets/data/map-chapters.json?v=' + (window.APP_VERSION || Date.now()));
                if (resp.ok) {
                    mapChapters.value = await resp.json();
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


        const lastClearedLevel = ref(null);

        const newUnlockLv = ref(null);

        const bestGrades = ref({}); // { stageNumber: 'S' }

        const clearedLevels = ref([]);





        const mapChapters = ref({});

        const activeChapter = ref('chapter1');

        const selectedSegmentIdx = ref(0);

        const selectedStageToConfirm = ref(null);

        const isBattleConfirmOpen = ref(false);
        const isSpecialSceneActive = ref(false);
        const specialSceneBg = ref('');

        // --- Knowledge Card Unlock State ---
        const pendingKnowledgeCards = ref([]);
        const activeKnowledgeCard = ref(null);
        const isKnowledgeCardShowing = ref(false);
        const isKnowledgeCardAbsorbing = ref(false);

        // --- オノマトペ Skills (unlocked on boss clear) ---
        const unlockedOnomatopeIds = ref([]);

        // --- Hero Visual Data Configuration ---
        // battle.marginBottom: CSS string applied to #heroAvatar margin-bottom (e.g. '24px' or 'clamp(135px,18dvh,160px)')
        // map.src: image path for .map-hud-avatar-img elements
        // thresholds: hp-based steady-state expression; hpPct is lower bound (>= value uses expression)
        const HERO_VISUAL_CONFIG = {
            battle: {
                marginBottom: '150px',
                width: 'clamp(110px, 7vw, 160px)',
                height: 'clamp(110px, 7vw, 160px)',
                leftMobile: '1rem',
                leftDesktop: '50%',
                desktopOffsetX: '-180px'
            },
            map: {
                src: 'assets/images/hero/hero_001.png'
            },
            thresholds: [
                { hpPct: 0.8, expression: 'neutral' },
                { hpPct: 0.4, expression: 'ase' },
                { hpPct: 0.0, expression: 'lose' }
            ]
        };

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

                    unlockedOnomatopeIds: unlockedOnomatopeIds.value,


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

                    if (parsed.unlockedOnomatopeIds) unlockedOnomatopeIds.value = parsed.unlockedOnomatopeIds;


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
                const bg = PROLOGUE_BG || 'assets/images/bg_home_painterly.png';

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
            // Check for first-time prologue BEFORE entering normal map
            if (checkPrologueTrigger()) return;

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
            // ---- [ NEW: MAIN ENDING FINALE ] ----
            // Trigger immediately after defeating Level 36 for the first time
            if (clearedLevels.value.includes(36) && currentLevel.value === 36) {
                const hasSeenFinale = localStorage.getItem('jpapp_seen_main_ending_finale');
                if (!hasSeenFinale) {
                    // Set Scene
                    isSpecialSceneActive.value = true;
                    specialSceneBg.value = MAIN_ENDING_BG;
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
        const APP_VERSION = window.APP_VERSION || "26040903";

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


        // [ CODEX - STATE ]
        const isCodexOpen = ref(false);
        const expandedSkillId = ref(null);
        const codexPage = ref(0);
        const codexChapter = ref('all');
        const flippedCardId = ref(null);
        // [ /CODEX - STATE ]

        const MENTOR_SEEN_KEY = 'jpRpgMentorSeenV1';

        const mentorTutorialSeen = ref([]);

        const isMentorModalOpen = ref(false);

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
            // Also stop TTS background audios
            if (typeof stopTtsAudio === 'function') stopTtsAudio();
            if (typeof stopWebSpeech === 'function') stopWebSpeech();

            if (currentMentorAudio) {
                try {
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

            const text = currentMentorLine.value || "";
            const path = getMentorAudioPath(currentMentorSkill.value.id, mentorDialogueIndex.value);

            // Inner helper for TTS fallback
            const playTtsFallback = () => {
                if (typeof speakCloudTts === 'function' && text) {
                    // 導師說明頁固定使用中文 TTS，避免因內文包含日文例句而被誤判為全頁日文語音。
                    // 未來若需處理中日混讀，可再於 TTS Worker 層面處理。
                    speakCloudTts(text, 'zh-TW-Neural2-B');
                }
            };

            if (!path) {
                playTtsFallback();
                return;
            }

            // Check if local file exists before playing (to avoid 404 console spam)
            try {
                const res = await fetch(path, { method: 'HEAD' });
                if (!res.ok) {
                    playTtsFallback();
                    return;
                }

                const audio = new Audio(path);
                // 導師語音應保持高音量，不應被 bgmVolume (預設 0.35) 的窄閾值限制
                audio.volume = masterVolume.value * 0.95;
                currentMentorAudio = audio;

                audio.addEventListener('ended', () => {
                    if (typeof restoreMapBgmAfterVoice === 'function') restoreMapBgmAfterVoice();
                });

                audio.play().then(() => {
                    if (typeof duckMapBgmForVoice === 'function') duckMapBgmForVoice();
                }).catch(err => {
                    console.warn("[MentorAudio] Play failed (possibly blocked):", path);
                    playTtsFallback();
                });
            } catch (e) {
                // Fetch failed or other error
                playTtsFallback();
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

        const spState = reactive(window.__sp);
        window.__sp = spState;

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

            // Turn-based logic (JIWAJIWA, MORIMORI, WAKUWAKU remain here)

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

            // WAKUWAKU：回合遞減 (增強邏輯在 checkAnswer)
            if (heroBuffs.wakuwakuTurns > 0) {
                heroBuffs.wakuwakuTurns--;
                if (heroBuffs.wakuwakuTurns <= 0) {
                    heroBuffs.wakuwakuTurns = 0;
                    heroBuffs.wakuwakuStacks = 0;
                    pushBattleLog("ワクワク 效果結束（鬥志冷卻）", 'info');
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
                // Grants 50% evasion for next 6 attacks
                evasionBuffAttacksLeft.value = 6;
                heroBuffs.wakuwakuTurns = 6;
                if (typeof setSpeedStatus === 'function') setSpeedStatus(25000);
                showStatusToast('⚡ 感覺輕盈！ (閃避上升)', {
                    bg: 'rgba(8,145,178,0.92)',
                    border: '#0891b2',
                    color: '#083344'
                });
                if (typeof pushBattleLog === 'function') {
                    pushBattleLog(`使用了 ${skill.name}：接下來 6 次攻擊期間自身閃避率提升到 50%！`, 'buff');
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



        // --- 抽離遊戲常數 ---

        const {
            MONSTER_HP, POTION_HP, INITIAL_POTIONS, MONSTERS
        } = pool.config || {};



        const showLevelSelect = ref(true);

        const runAwayPressTimer = ref(null);

        const isRunAwayPressing = ref(false);

        const isMenuOpen = ref(false);

        const isAdvancedSettingsOpen = ref(false);

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



        const playerBlink = ref(false);

        const hpBarDanger = ref(false);


        const difficulty = ref('easy');

        const currentBg = ref('assets/images/bg_01.jpg');



        const questions = ref([]);

        const currentIndex = ref(0);

        const userAnswers = ref([]);

        const slotFeedbacks = ref({});

        const hasSubmitted = ref(false);

        const comboCount = ref(0);

        const maxComboCount = ref(0);

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


        const monsterHit = ref(false);
        const monsterDodge = ref(false);
        const monsterAttackLunge = ref(false);

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


        const needsUserGestureToResumeBgm = ref(false);
        const isBgmSuppressed = ref(false);

        const audioSettingsKey = 'jpRpgAudioV1';

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
                damage1: 'assets/audio/damage1.mp3',
                damage2: 'assets/audio/damage2.mp3',
                damage3: 'assets/audio/damage3.mp3',
                damage4: 'assets/audio/damage4.mp3',
                damage5: 'assets/audio/damage5.mp3',
                damage6: 'assets/audio/damage6.mp3',
                damage7: 'assets/audio/damage7.mp3',
                damage8: 'assets/audio/damage8.mp3',
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

            let bScale = (isMenuOpen.value || isCodexOpen.value || isMentorModalOpen.value || isMistakesOpen.value) ? 0.35 : 1.0;



            if (isMentorVoicePlaying.value) {
                // 加強對對話期間 BGM 的減壓力度，使語音更清晰 (從原先的 0.5 改為 0.25)
                bScale = (bScale === 1.0) ? 0.25 : 0.15;
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



        const defeatReturn = () => {
            const sc = document.getElementById('battleScene');
            if (sc) sc.classList.remove('grayscale-filter');
            const ov = document.getElementById('defeatOverlay');
            if (ov) ov.classList.add('hidden');
            player.value.hp = player.value.maxHp;
            resetSP();
            setHeroAvatar('neutral');
            clearSpeedStatus();
            stopAllAudio();
            isDefeated.value = false;
            showLevelSelect.value = true;
        };

        const handleGameOver = () => {
            isDefeated.value = true;
            isBgmSuppressed.value = true; // Lock BGM after death
            setHeroAvatar('lose');

            // 🌚 Apply grayscale filter to battle scene
            const scene = document.getElementById('battleScene');
            if (scene) scene.classList.add('grayscale-filter');

            // 💀 Show defeat overlay with manual return button
            const overlay = document.getElementById('defeatOverlay');
            if (overlay) overlay.classList.remove('hidden');

            try { if (bgmAudio.value) { bgmAudio.value.pause(); try { bgmAudio.value.currentTime = 0; } catch (_) { } } } catch (_) { }
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






        const resumeBattleBgm = (resumeAbs) => {

            if (isMuted.value || bgmVolume.value <= 0) return;

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



        watch([isMenuOpen, isCodexOpen, isMentorModalOpen, isMistakesOpen, bgmVolume, masterVolume, isMuted, sfxVolume], () => {

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
            if (isBgmSuppressed.value) return; // Prevent BGM resume if suppressed

            const inBattle = !showLevelSelect.value && !isFinished.value && currentLevel.value > 0 && !isDefeated.value && !levelPassed.value;

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



        const ensureBgmPlaying = (reason) => {

            if (!audioInited.value) initAudio();

            if (isMuted.value || bgmVolume.value <= 0 || isBgmSuppressed.value) return;

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




        const _isMobileSfx = /iPad|iPhone|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 2);

        const POLY = 4;

        const _uiSfxSrcMap = {
            hit: 'assets/audio/sfx_hit.mp3',
            hit2: 'assets/audio/sfx_hit2.mp3',
            miss: 'assets/audio/sfx_miss.mp3', // Standardized from mmiss.mp3
            potion: 'assets/audio/sfx_potion.mp3',
            click: 'assets/audio/sfx_click.mp3',
            damage: 'assets/audio/damage.mp3',
            damage1: 'assets/audio/damage1.mp3',
            damage2: 'assets/audio/damage2.mp3',
            damage3: 'assets/audio/damage3.mp3',
            damage4: 'assets/audio/damage4.mp3',
            damage5: 'assets/audio/damage5.mp3',
            damage6: 'assets/audio/damage6.mp3',
            damage7: 'assets/audio/damage7.mp3',
            damage8: 'assets/audio/damage8.mp3',
            fanfare: 'assets/audio/fanfare.mp3',
            bossClear: '', // Map missing bossClear to fanfare
            uiPop: 'assets/audio/pop.mp3',
            battlePop: 'assets/audio/pop2.mp3',
            win: 'assets/audio/win.mp3',
            gameover: 'assets/audio/sfx_gameover.mp3',
            skillpop: 'assets/audio/sfx/skillpop.mp3',
            skillget: 'assets/audio/sfx/skillget.mp3',
            cardFlip: 'assets/audio/sfx/card-flip.mp3',
            escape: 'assets/audio/sfx_escape.mp3',
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



        const _prewarmUiSfx = () => { _getOrCreatePoly('hit'); _getOrCreatePoly('hit2'); _getOrCreatePoly('miss'); };

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
            hit2: 0.9,
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
                const bScale = (isMenuOpen.value || isCodexOpen.value || isMentorModalOpen.value || isMistakesOpen.value) ? 0.35 : 1.0;
                clearTimeout(window._bgmDuckTimer);
                window._bgmDuckTimer = setTimeout(() => {
                    if (bgmGain.value && !isMuted.value) {
                        bgmGain.value.gain.setTargetAtTime(b * bScale * 0.3, audioCtx.value.currentTime, 0.15);
                        setTimeout(() => {
                            if (bgmGain.value && !isMuted.value) {
                                const vs = (isMenuOpen.value || isCodexOpen.value || isMentorModalOpen.value || isMistakesOpen.value) ? 0.35 : 1.0;
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
                const isFrequent = ['hit', 'hit2', 'click', 'damage', 'uiPop', 'battlePop'].includes(name);
                let a = audioPool.get(src);
                if (!a) {
                    a = new Audio(src);
                    a.crossOrigin = "anonymous";
                    audioPool.set(src, a);
                } else if (isFrequent) {
                    // 對於高頻次音效，使用 CloneNode 實現複音，避免 currentTime=0 造成的切音
                    a = a.cloneNode(true);
                }

                if (audioCtx.value) {
                    try {
                        const source = audioCtx.value.createMediaElementSource(a);
                        source.connect(sfxGain.value);
                    } catch (_) {
                        a.volume = sfxVolume.value * (SFX_SCALES[name] || 1.0);
                    }
                } else {
                    a.volume = sfxVolume.value * (SFX_SCALES[name] || 1.0);
                }

                a.currentTime = 0;
                a.play().catch(e => { });

                // 如果是 Clone，結束後釋放資源
                if (isFrequent && a !== audioPool.get(src)) {
                    a.onended = () => { a.src = ""; a.remove(); };
                }

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

            if (needsUserGestureToResumeBgm.value) { ensureBgmPlaying('startFlick'); needsUserGestureToResumeBgm.value = false; }



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

                timeLeft.value = (monster.value?.attackIntervalMs || 10000) / 1000;

            }

        };



        // ---- [ TIMER ] ----
        const startTimer = () => {

            clearTimer();

            timeUp.value = false;

            if (isFinished.value) return;

            timeLeft.value = (monster.value?.attackIntervalMs || 10000) / 1000;

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
            if (evasionBuffAttacksLeft.value > 0) {
                isMiss = Math.random() < 0.50;
                evasionBuffAttacksLeft.value--;
                heroBuffs.wakuwakuTurns = evasionBuffAttacksLeft.value;
                if (typeof updateHeroStatusBar === 'function') updateHeroStatusBar();
                if (evasionBuffAttacksLeft.value <= 0) {
                    clearSpeedStatus();
                }
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

                    flashOverlay.value = true;
                    setTimeout(() => { flashOverlay.value = false; }, 300);

                    let dMin = monster.value?.attackDamageMin;
                    let dMax = monster.value?.attackDamageMax;
                    if (dMin === undefined && dMax === undefined) { dMin = 10; dMax = 20; }
                    else if (dMin === undefined) dMin = dMax;
                    else if (dMax === undefined) dMax = dMin;
                    if (dMin > dMax) [dMin, dMax] = [dMax, dMin];
                    let dmg = Math.floor(Math.random() * (dMax - dMin + 1)) + dMin;
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
            }, 100);
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



            if (needsUserGestureToResumeBgm.value) {

                needsUserGestureToResumeBgm.value = false;

                if (showMap.value && !showLevelSelect.value) {

                    if (bgmAudio.value && bgmAudio.value.paused) {

                        bgmAudio.value.play().catch(() => { });

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

                            const q = generateQuestionBySkill(skillId, 1, EARLY_GAME_POOLS, VOCAB.value);
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
        const generateQuestionBySkill = (skillId, blanks, db, vocab, forceTargetCount = null) => {
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



            const getChoices = (defaultChoices, correctAns) => {
                const targetCount = getChoiceCountForLevel(currentLevel.value);
                const validParticles = ['は', 'の', 'が', 'を', 'に', 'へ', 'も', 'で', 'と', 'から', 'まで', 'や', 'より'];

                const lv = currentLevel.value;
                const isGatedPool = lv <= 35;
                let allowedEarlyParticles = [];
                if (lv === 1 || lv === 2) allowedEarlyParticles = ['は', 'の'];
                else if (lv === 3) allowedEarlyParticles = ['は', 'の', 'が'];
                else if (lv === 4 || lv === 5) allowedEarlyParticles = ['は', 'の', 'が', 'を'];
                else if (lv === 6) allowedEarlyParticles = ['は', 'の', 'が', 'を', 'へ'];
                else if (lv === 7) allowedEarlyParticles = ['は', 'の', 'が', 'を', 'へ', 'も'];
                else if (lv === 8) allowedEarlyParticles = ['は', 'の', 'が', 'を', 'へ', 'も', 'に'];
                else if (lv === 9 || lv === 10) allowedEarlyParticles = ['は', 'の', 'が', 'を', 'へ', 'も', 'に', 'と'];
                else if (lv >= 11 && lv <= 15) allowedEarlyParticles = ['は', 'の', 'が', 'を', 'へ', 'も', 'に', 'と', 'で'];
                else if (lv === 16) allowedEarlyParticles = ['は', 'の', 'が', 'を', 'へ', 'も', 'に', 'と', 'で', 'から'];
                else if (lv >= 17 && lv <= 25) allowedEarlyParticles = ['は', 'の', 'が', 'を', 'へ', 'も', 'に', 'と', 'で', 'から', 'まで'];
                else if (lv >= 26 && lv <= 31) allowedEarlyParticles = ['は', 'の', 'が', 'を', 'へ', 'も', 'に', 'と', 'で', 'から', 'まで', 'や'];
                else if (lv >= 32 && lv <= 35) allowedEarlyParticles = ['は', 'の', 'が', 'を', 'へ', 'も', 'に', 'と', 'で', 'から', 'まで', 'や', 'より'];

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
                        // General safety for non-particle skills (Vocabulary/Conjugation etc.)
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
                        const candidates = choicesOptions.filter(p => !excludeChoices.includes(p) && !currentSet.has(p));
                        while (finalChoices.length < targetCount && candidates.length > 0) {
                            finalChoices.push(candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0]);
                        }
                    }

                    // [Failsafe] HE_DIRECTION final hardfill
                    if ((skillId === 'HE_DEST' || skillId === 'HE_DIRECTION') && finalChoices.length < targetCount) {
                        const emgPool = ["は", "が", "の", "も", "と", "で", "を", "へ"];
                        const currentSet = new Set(finalChoices);
                        for (const p of emgPool) {
                            if (finalChoices.length >= 4) break;
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
                return generateQuestionBySkill(chosenSkillId, blanks, db, vocab, forceTargetCount);
            }
            else if (skillDef.id === 'BOSS_REVIEW_02') {
                const reviewSkills = ['HE_DIRECTION', 'MO_ALSO_BASIC', 'NI_TIME', 'TO_AND'];
                const chosenSkillId = pickOne(reviewSkills);
                return generateQuestionBySkill(chosenSkillId, blanks, db, vocab, forceTargetCount);
            }
            else if (skillDef.id === 'BOSS_REVIEW_03') {
                const reviewSkills = ['DE_ACTION_PLACE', 'NI_EXIST_PLACE', 'GA_EXIST_SUBJECT', 'TO_WITH'];
                const chosenSkillId = pickOne(reviewSkills);
                return generateQuestionBySkill(chosenSkillId, blanks, db, vocab, forceTargetCount);
            }
            else if (skillDef.id === 'BOSS_REVIEW_04') {
                // Mixed review of から, まで, に(落點), で(工具)
                const reviewSkills = ['KARA_SOURCE_START', 'MADE_LIMIT_END', 'NI_DESTINATION', 'DE_TOOL_MEANS'];
                const chosenSkillId = pickOne(reviewSkills);
                return generateQuestionBySkill(chosenSkillId, blanks, db, vocab, forceTargetCount);
            }
            else if (skillDef.id === 'BOSS_REVIEW_05') {
                const reviewSkills = ['NI_TARGET', 'GA_BUT', 'MO_COMPLETE_NEGATION', 'TO_CONDITIONAL'];
                const chosenSkillId = pickOne(reviewSkills);
                return generateQuestionBySkill(chosenSkillId, blanks, db, vocab, forceTargetCount);
            }
            else if (skillDef.id === 'BOSS_REVIEW_06') {
                const reviewSkills = ['YA_AND_OTHERS', 'DE_SCOPE', 'NI_PURPOSE', 'TO_QUOTE'];
                const chosenSkillId = pickOne(reviewSkills);
                return generateQuestionBySkill(chosenSkillId, blanks, db, vocab, forceTargetCount);
            }
            else if (skillDef.id === 'FINAL_BOSS_35') {
                const reviewSkills = ['KARA_REASON', 'YORI_COMPARE', 'NI_FREQUENCY', 'DE_MATERIAL'];
                const chosenSkillId = pickOne(reviewSkills);
                return generateQuestionBySkill(chosenSkillId, blanks, db, vocab, forceTargetCount);
            }

            else if (skillDef.id === 'HIDDEN_BOSS_36') {

                if (bossSkillQueue.length === 0) startBossQueue(unlockedSkillIds.value, 36);

                const chosenSkillId = pickSkillForBoss();

                return generateQuestionBySkill(chosenSkillId, blanks, db, vocab, forceTargetCount);

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

            isMistakesOpen.value = false;

            isMenuOpen.value = false;

            isChangelogOpen.value = false;

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
                    pendingKnowledgeCards.value.push(...newUnlocks.map(id => skillsAll.value[id]).filter(s => s && s.particle !== '複習'));

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

                let isFallback = false;



                while (attempts < 10 && skillId && !generatedFromSkill) {

                    const originalLevel = currentLevel.value;

                    if (isReview) currentLevel.value = 1;

                    // Pass forceTargetCount=4 if this is a Boss Level context (lv 5, 10, 15, 20...)
                    const forceTC = (lv % 5 === 0) ? 4 : null;
                    q = generateQuestionBySkill(skillId, blanks, db, VOCAB.value, forceTC);

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
                    console.warn(`[DEAD_CODE_TRAP] Reached switch(type) fallback loop for skill: ${skillId}! Type: ${typeof type !== 'undefined' ? type : 'undefined'}`);
                    // Safety: if reached, return null to let safeFallbackQuestion handle it or skip loop
                    q = null;
                    continue;

                } // end of else (non-L5 global fallback)



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




            const mdef = MONSTERS[(lv - 1) % MONSTERS.length] || MONSTERS[0];



            // 挑選符合目前關卡的怪物資料 (從 enemies.v1.json)

            const enemyMatch = (ENEMIES.value || []).find(e => e.spawnLevels && e.spawnLevels.includes(lv));



            const _isBossLv = (lv % 5 === 0);

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

                    size: enemyMatch.size || (_isBossLv ? 1.2 : 1),

                    posX: enemyMatch.posX ?? null,

                    posY: enemyMatch.posY ?? null,

                    infoOffsetY: enemyMatch.infoOffsetY ?? 0,

                    attackIntervalMs: enemyMatch.attackIntervalMs || 10000,

                    attackDamageMin: enemyMatch.attackDamageMin ?? 10,

                    attackDamageMax: enemyMatch.attackDamageMax ?? 20,

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





        const parseAcceptableAnswers = (ans) => {

            if (typeof ans === 'string') return ans.split(/[/、,]/g).map(s => s.trim()).filter(s => s);

            return Array.isArray(ans) ? ans : [ans];

        };



        let lastPraiseTime = 0;

        let lastPraiseText = '';

        const ONEESAN_PRAISES = ['せいかい！', 'ナイス！', 'いいね！', 'すごい！', 'かっこいい！', 'まじか！', 'さいこう！'];



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

                    // 🔋 SP Reward: +1 on correct answer
                    regenSP();



                    const isPlayerMiss = (heroBuffs.giragiraTurns > 0 || heroBuffs.monsterSleep) ? false : (Math.random() < 0.05);

                    if (isPlayerMiss) {

                        if (_isMobileSfx) playUiSfx('miss'); else playSfx('miss');

                        pushBattleLog(`攻擊被閃避了！沒造成傷害！`, 'info');

                        monsterDodge.value = true;
                        setTimeout(() => { monsterDodge.value = false; }, 800);

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
                        const currentHitSfx = (heroBuffs.giragiraTurns > 0) ? 'hit2' : 'hit';
                        if (_isMobileSfx) playUiSfx(currentHitSfx); else playSfx(currentHitSfx);



                        // 💡 點選(Tap)模式原本沒有子彈，這裡幫它補上命中爆炸特效

                        if (!isFlick) {

                            const monsterEl = document.querySelector('img[alt="monster"]') || document.querySelector('.w-28.h-28.rounded-full');

                            const center = rectCenter(monsterEl);

                            if (center) spawnHitVfx(center.x, center.y);

                        }

                        // GIRAGIRA 強化命中特效
                        if (heroBuffs.giragiraTurns > 0 && typeof window.spawnGiraGiraHitVfx === 'function') {
                            const giraEl = document.querySelector('img[alt="monster"]') || document.querySelector('.w-28.h-28.rounded-full');
                            const giraCenter = rectCenter(giraEl);
                            if (giraCenter) {
                                const giraDelay = isFlick ? 380 : 0;
                                setTimeout(() => { if (typeof window.spawnGiraGiraHitVfx === 'function') window.spawnGiraGiraHitVfx(giraCenter.x, giraCenter.y); }, giraDelay);
                            }
                        }

                        comboCount.value++;

                        if (comboCount.value > maxComboCount.value) maxComboCount.value = comboCount.value;

                        const timeTaken = (Date.now() - questionStartTime) / 1000;
                        let baseDmg = 20;
                        if (timeTaken <= 2) baseDmg = 20;
                        else if (timeTaken >= 10) baseDmg = 5;
                        else baseDmg = Math.round(20 - ((timeTaken - 2) / 8) * 15);

                        // 加入 ±1 隨機浮動
                        const jitter = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
                        let dmg = baseDmg + jitter;
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

                        window.spawnFloatingDamage('monster', dmg);



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

            if (needsUserGestureToResumeBgm.value) { ensureBgmPlaying('nextQuestion'); needsUserGestureToResumeBgm.value = false; }

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

            }

            const vfxLayer = document.getElementById('flickVfxLayer');

            if (vfxLayer) vfxLayer.innerHTML = '';



            questionStartTime = Date.now();

            voicePlayedForCurrentQuestion.value = false;

        };



        const grantRewards = () => {

            const lv = currentLevel.value;

            const baseExp = 50 + (lv * 20);



            earnedExp.value = baseExp;


            player.value.exp += earnedExp.value;



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

                // Boss ability rewards are now handled in the tally sequence via rewardAbilityId

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
            stopAllAudio();
            initGame(currentLevel.value);
        };





        const revive = () => {

            isDefeated.value = false;
            isBgmSuppressed.value = false; // Unlock on revive
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

            const checkQuestionCompact = () => {
                const area = document.getElementById('question-area');
                if (!area) return;
                const row = area.firstElementChild;
                if (!row) return;
                area.classList.remove('question-compact', 'question-ultra-compact');
                if (row.scrollWidth <= area.offsetWidth + 4) return;
                area.classList.add('question-compact');
                if (row.scrollWidth <= area.offsetWidth + 4) return;
                area.classList.remove('question-compact');
                area.classList.add('question-ultra-compact');
            };
            watch(displaySegments, () => { nextTick(checkQuestionCompact); });
            watch([hasSubmitted, userAnswers], () => { nextTick(checkQuestionCompact); }, { deep: true });
            nextTick(checkQuestionCompact);


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
            pauseBattle, db, VOCAB, startBossQueue, unlockedSkillIds,
            playPrologueOpening, playMainEndingFinale
        });

        return {
            isNextBtnVisible,
            animatedExp,
            answerMode, flickState, handleRuneClick, startFlick, moveFlick, endFlick, appVersion, isChangelogOpen, changelogData, changelogError, openChangelog, questions, currentIndex, currentQuestion, userAnswers, hasSubmitted, comboCount, maxComboCount, currentLevel, maxLevel, LEVEL_CONFIG, levelConfig, levelTitle, isChoiceMode, showLevelSelect, difficulty, player, monster, inventory, playerBlink, hpBarDanger, isFinished, isCurrentCorrect, timeLeft, timeUp, battleMessage, mistakes, stageLog, isMenuOpen, isMistakesOpen, monsterHit, screenShake, bossScreenShake, flashOverlay, bgmVolume, sfxVolume, isMuted, isPreloading, monsterDead, playerDead, displaySegments, getAnswerForDisplay, selectChoice, getChoiceBtnClass, checkAnswer, nextQuestion, getInputStyle, initGame, retryLevel, revive, startLevel, usePotion, clearMistakes, playBgm, playSfx, playMistakeVoice, saveAudioSettings, startRunAwayPress, cancelRunAwayPress, isRunAwayPressing, onUserGesture, currentBg, accuracyPct, calculatedGrade, skillsAll, unlockedSkillIds, isCodexOpen, expandedSkillId, codexPage, codexChapter, flippedCardId, codexChapterList, codexFilteredSkills, codexTotalPages, codexPageSkills, codexNextSkill, closeCodex, pauseBattle, resumeBattle, isPlayerDodging, isSkillOpen, openSkillOverlay, closeSkillOverlay,
            handleEscapeToMap, escapeOverlayVisible, escapeOverlayOpacity, isEscaping,
            heroBuffs,
            skillList, castAbility, spState, settings, shouldShowNextButton, praiseToast, monsterDodge, isDefeated, defeatReturn, HERO_VISUAL_CONFIG,
            pendingLevelUpAbility, isAbilityUnlockModalOpen, confirmAbilityUnlockAndContinue,
            isMentorModalOpen, isLevelJumpOpen, isAdvancedSettingsOpen, debugJumpToLevel, mentorTutorialSeen, currentMentorSkill, mentorDialogueIndex, currentMentorLine, isLastMentorLine, nextMentorLine,
            displayedMentorText, isTypingMentor, restartMentorDialogue, finishMentorDialogue, isMentorPortraitError, mentorPages,
            playPrologueOpening, playMainEndingFinale,
            isMentorSkipPressing, startMentorSkipPress, cancelMentorSkipPress,
            isMonsterImageError, handleMonsterImageError, handleMapImageError, currentMonsterSprite, monsterPositionStyle, monsterIsEntering, monsterIsDying, monsterTrulyDead, monsterResultShown, monsterAttackLunge,
            showMap, unlockedLevels, clearedLevels,
            openMap, isLevelUnlocked, isLevelCleared, getStageNodeClass, getLevelTitle, hasMentor,

            selectStageFromMap, startStageWithExplanation, returnToMap,

            newUnlockLv, bestGrades, getGradeColor, sRankCount,

            mapChapters, activeChapter, getMapNodeStyle, selectedSegmentIdx, isSegmentUnlocked, handleMapTabClick, jumpToMapSegment, isMapDropdownOpen,

            isBattleConfirmOpen, selectedStageToConfirm, confirmAndStartBattle,

            isMapMentorOpen,

            pendingKnowledgeCards, activeKnowledgeCard, isKnowledgeCardShowing, isKnowledgeCardAbsorbing, triggerNextKnowledgeCard, closeKnowledgeCard,
            isSpecialSceneActive, specialSceneBg,
            playCardFlip: () => playSfx('cardFlip'),

        };



    }

});
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => _jpApp.mount('#app'));
} else {
    _jpApp.mount('#app');
}