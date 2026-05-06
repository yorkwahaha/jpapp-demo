/**
 * JPAPP Settings Manager
 * Manages localStorage for general settings and audio settings.
 * Version: 26050305
 */
(function() {
    const SETTINGS_KEY = 'jpRpgSettingsV1';
    const AUDIO_SETTINGS_KEY = 'jpRpgAudioV1';

    const JPAPPSettingsManager = {
        // KEYS
        KEYS: {
            GENERAL: SETTINGS_KEY,
            AUDIO: AUDIO_SETTINGS_KEY
        },

        // --- General Settings ---

        /**
         * Load general settings from localStorage
         * @returns {Object} Parsed settings or empty object
         */
        loadGeneralSettings: function() {
            try {
                const raw = localStorage.getItem(SETTINGS_KEY);
                return raw ? JSON.parse(raw) : {};
            } catch (e) {
                console.warn('[SettingsManager] loadGeneralSettings error', e);
                return {};
            }
        },

        /**
         * Save general settings to localStorage
         * @param {Object} settings 
         */
        saveGeneralSettings: function(settings) {
            try {
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            } catch (e) {
                console.warn('[SettingsManager] saveGeneralSettings error', e);
            }
        },

        // --- Audio Settings ---

        /**
         * Load audio settings from localStorage
         * @returns {Object} Parsed audio settings or empty object
         */
        loadAudioSettings: function() {
            try {
                const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);
                return raw ? JSON.parse(raw) : {};
            } catch (e) {
                console.warn('[SettingsManager] loadAudioSettings error', e);
                return {};
            }
        },

        /**
         * Save audio settings to localStorage
         * @param {Object} audioSettings 
         */
        saveAudioSettings: function(audioSettings) {
            try {
                localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(audioSettings));
            } catch (e) {
                console.warn('[SettingsManager] saveAudioSettings error', e);
            }
        },

        // --- Volume Helpers ---

        /**
         * Clamp value between 0 and 1
         */
        clampVolume: function(value) {
            return Math.max(0, Math.min(1, Number(value) || 0));
        },

        /**
         * Normalize volume value (handles 0-100 range if detected)
         */
        normalizeVolumeValue: function(value) {
            const numeric = Number(value) || 0;
            return this.clampVolume(numeric > 1 ? numeric / 100 : numeric);
        },

        /**
         * Apply exponential curve to volume
         */
        curveVolumeValue: function(value, exponent) {
            const normalized = this.normalizeVolumeValue(value);
            return this.clampVolume(Math.pow(normalized, exponent));
        },

        // --- Vue-bound general settings (localStorage jpRpgSettingsV1) ---

        createVueBoundGeneralSettings: function(vueApis, deps) {
            const reactive = vueApis.reactive;
            const settingsDefaults = {
                autoReadOnWrong: true,
                correctAdvanceDelayMs: null,
                wrongAdvanceDelayMs: null,
                enemyAttackMode: 'atb',
                feedbackStyle: 'oneesan',
                feedbackVoiceMode: 'combo',
                defaultAttackMode: 'tap',
                ttsVoice: deps.DEFAULT_TTS_VOICE
            };
            const settings = reactive({ ...settingsDefaults });
            const VALID_TTS_VOICES = deps.VALID_TTS_VOICES || [];
            const DEFAULT_TTS_VOICE = deps.DEFAULT_TTS_VOICE;

            const loadSettings = () => {
                try {
                    const parsed = JPAPPSettingsManager.loadGeneralSettings();
                    if (parsed && typeof parsed === 'object') {
                        Object.keys(settingsDefaults).forEach(function(k) {
                            if (parsed[k] !== undefined) settings[k] = parsed[k];
                        });
                    }
                    if (!settings.ttsVoice || !VALID_TTS_VOICES.includes(settings.ttsVoice)) {
                        settings.ttsVoice = DEFAULT_TTS_VOICE;
                    }
                    if (!['tap', 'flick'].includes(settings.defaultAttackMode)) {
                        settings.defaultAttackMode = 'tap';
                    }
                    if (settings.enemyAttackMode !== 'atb') {
                        settings.enemyAttackMode = 'atb';
                    }
                    if (!['combo', 'correct'].includes(settings.feedbackVoiceMode)) {
                        settings.feedbackVoiceMode = 'combo';
                    }
                } catch (e) { console.warn('[Settings] load error', e); }
            };

            const saveSettings = () => {
                JPAPPSettingsManager.saveGeneralSettings({ ...settings });
            };

            return { settings, loadSettings, saveSettings };
        },

        scheduleReloadClearingJpRpgAppVersionFlag: function() {
            setTimeout(function() {
                try {
                    localStorage.removeItem('jpRpgAppVersion');
                } catch (_) { /* noop */ }
                window.location.reload(true);
            }, 100);
        },

        // --- Map / stage-list UI helpers (pure; Vue passes snapshots / refs where needed) ---

        getMapNodePositionStyle: function(node) {
            if (!node) return {};
            var x = node.x;
            var y = node.y;
            if (node.desktopX !== undefined) x = node.desktopX;
            if (node.desktopY !== undefined) y = node.desktopY;
            return {
                left: x + '%',
                bottom: y + '%',
                position: 'absolute',
                transform: 'translate(-50%, 50%)'
            };
        },

        isMapSegmentIndexUnlocked: function(idx, snapshot) {
            var clearedLevels = snapshot.clearedLevels || [];
            var unlockedLevels = snapshot.unlockedLevels || [];
            if (idx === 0) return true;
            if (idx === 7) return clearedLevels.indexOf(35) !== -1;
            var maxUnlocked = Math.max.apply(null, unlockedLevels.concat([1]));
            return maxUnlocked >= (idx * 5) + 1;
        },

        /** @param {Array} unlockedLevelsValue @param {{ value: number }} segmentIdxRef */
        runAutoSelectMapSegmentIndex: function(unlockedLevelsValue, segmentIdxRef) {
            var maxUnlocked = Math.max.apply(null, (unlockedLevelsValue || []).concat([1]));
            segmentIdxRef.value = Math.floor((maxUnlocked - 1) / 5);
        },

        computeStageFocusParticleDisplay: function(n, LEVEL_CONFIG, skillsAll) {
            var nm = Number(n);
            var conf = LEVEL_CONFIG[nm];
            if (!conf) return '?';
            if (conf.focusParticle) return conf.focusParticle === 'Boss' ? '魔' : conf.focusParticle;
            var skillId = conf.skillId || (conf.unlockSkills && conf.unlockSkills[0]);
            var skill = skillsAll[skillId];
            return skill && skill.particle ? skill.particle : '?';
        },

        computeStageFocusLabelDisplay: function(n, LEVEL_CONFIG, skillsAll) {
            var nm = Number(n);
            var conf = LEVEL_CONFIG[nm];
            if (!conf) return '';
            if (conf.boss || conf.focusParticle === 'Boss') return '共鳴試煉';
            if (conf.focusLabel) return conf.focusLabel;
            var skillId = conf.skillId || (conf.unlockSkills && conf.unlockSkills[0]);
            var skill = skillsAll[skillId];
            if (!skill) return '';
            return skill.meaning || skill.name || '';
        },

        getLevelTitleForConfig: function(n, LEVEL_CONFIG) {
            var conf = LEVEL_CONFIG[n];
            return conf ? conf.title : ('Level ' + n);
        },

        getStageNodeClassForMap: function(n, unlockedLevels, clearedLevels) {
            var lvNum = Number(n);
            var unlocked = unlockedLevels.indexOf(lvNum) !== -1;
            if (!unlocked) return 'is-locked';
            if (clearedLevels.indexOf(lvNum) !== -1) return 'is-cleared';
            var unlockedTargets = unlockedLevels.filter(function(lv) {
                return clearedLevels.indexOf(lv) === -1;
            });
            var currentTarget = Math.min.apply(null, unlockedTargets);
            return lvNum === currentTarget ? 'is-current' : '';
        },

        scrollStageNodeIntoView: function(stageNumber, nextTickFn) {
            nextTickFn(function() {
                var el = document.querySelector('[data-stage-node="' + stageNumber + '"]');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        },

        stageConfigHasMentorSkillPath: function(n, LEVEL_CONFIG) {
            var conf = LEVEL_CONFIG[Number(n)];
            if (!conf) return false;
            return !!(conf.skillId || (conf.unlockSkills && conf.unlockSkills.length > 0));
        },

        /** DOM: tap choices helper row class + MutationObserver */
        installTapChoicesLayoutHooks: function(opts) {
            var watch = opts.watch;
            var nextTick = opts.nextTick;
            var answerMode = opts.answerMode;
            var hasSubmitted = opts.hasSubmitted;
            var injectTapChoicesClass = function() {
                var el = document.querySelector('#question-area ~ .flex.flex-wrap.justify-center.gap-3');
                if (el && !el.classList.contains('jp-tap-choices')) {
                    el.classList.add('jp-tap-choices');
                }
            };
            var tapChoicesObserver = new MutationObserver(injectTapChoicesClass);
            tapChoicesObserver.observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
            watch([answerMode, hasSubmitted], function() {
                nextTick(injectTapChoicesClass);
            });
            injectTapChoicesClass();
        },

        installQuestionAreaCompactLayoutHooks: function(opts) {
            var watch = opts.watch;
            var nextTick = opts.nextTick;
            var displaySegments = opts.displaySegments;
            var hasSubmitted = opts.hasSubmitted;
            var userAnswers = opts.userAnswers;
            var checkQuestionCompact = function() {
                var area = document.getElementById('question-area');
                if (!area) return;
                var row = area.firstElementChild;
                if (!row) return;
                area.classList.remove('question-compact', 'question-ultra-compact');
                if (row.scrollWidth <= area.offsetWidth + 4) return;
                area.classList.add('question-compact');
                if (row.scrollWidth <= area.offsetWidth + 4) return;
                area.classList.remove('question-compact');
                area.classList.add('question-ultra-compact');
            };
            watch(displaySegments, function() { nextTick(checkQuestionCompact); });
            watch([hasSubmitted, userAnswers], function() { nextTick(checkQuestionCompact); }, { deep: true });
            nextTick(checkQuestionCompact);
        }
    };

    // Expose to window
    window.JPAPPSettingsManager = JPAPPSettingsManager;
})();
