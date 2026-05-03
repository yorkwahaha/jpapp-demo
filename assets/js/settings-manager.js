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
        }
    };

    // Expose to window
    window.JPAPPSettingsManager = JPAPPSettingsManager;
})();
