/**
 * JPAPP Storage Manager
 * Low-risk localStorage helpers for Mentor status, etc.
 * Version: 26050305
 */
(function() {
    const MENTOR_SEEN_KEY = 'jpRpgMentorSeenV1';
    const MISTAKES_KEY = 'jpRpgMistakesV1';
    const AUDIO_DEBUG_KEY = 'jpapp_audio_debug';
    const AUDIO_DEBUG_POS_KEY = 'jpapp_audio_debug_pos';
    const SAVE_SLOTS_KEY = 'jpapp_save_slots_v1';
    const ACTIVE_SAVE_SLOT_KEY = 'jpapp_active_save_slot_v1';
    const VALID_SAVE_SLOTS = [1, 2, 3];

    const getActiveSaveSlotId = function() {
        try {
            const rawMetadata = localStorage.getItem(SAVE_SLOTS_KEY);
            if (rawMetadata) {
                const metadata = JSON.parse(rawMetadata);
                const metadataSlotId = Number(metadata?.activeSlot);
                if (VALID_SAVE_SLOTS.includes(metadataSlotId)) return metadataSlotId;
            }
            const slotId = Number(localStorage.getItem(ACTIVE_SAVE_SLOT_KEY));
            return VALID_SAVE_SLOTS.includes(slotId) ? slotId : 1;
        } catch (_) {
            return 1;
        }
    };

    const getSlotScopedKey = function(baseKey) {
        return baseKey + '_slot_' + getActiveSaveSlotId();
    };

    const JPAPPStorageManager = {
        KEYS: {
            MENTOR_SEEN: MENTOR_SEEN_KEY,
            MISTAKES: MISTAKES_KEY,
            AUDIO_DEBUG: AUDIO_DEBUG_KEY,
            AUDIO_DEBUG_POS: AUDIO_DEBUG_POS_KEY
        },

        // --- Mentor State ---

        /**
         * Load Mentor Seen status from localStorage
         * @returns {Array} List of seen tutorial keys
         */
        loadMentorSeen: function() {
            try {
                const raw = localStorage.getItem(getSlotScopedKey(MENTOR_SEEN_KEY));
                return raw ? JSON.parse(raw) : [];
            } catch (e) {
                console.warn('[StorageManager] loadMentorSeen error', e);
                return [];
            }
        },

        /**
         * Save Mentor Seen status to localStorage
         * @param {Array} seenList 
         */
        saveMentorSeen: function(seenList) {
            try {
                localStorage.setItem(getSlotScopedKey(MENTOR_SEEN_KEY), JSON.stringify(seenList || []));
            } catch (e) {
                console.warn('[StorageManager] saveMentorSeen error', e);
            }
        },

        // --- Mistakes / Wrong Answers ---

        /**
         * Load Mistakes from localStorage
         * @returns {Array} List of mistake entries
         */
        loadMistakes: function() {
            try {
                const raw = localStorage.getItem(getSlotScopedKey(MISTAKES_KEY));
                return raw ? JSON.parse(raw) : [];
            } catch (e) {
                console.warn('[StorageManager] loadMistakes error', e);
                return [];
            }
        },

        /**
         * Save Mistakes to localStorage
         * @param {Array} mistakes 
         */
        saveMistakes: function(mistakes) {
            try {
                localStorage.setItem(getSlotScopedKey(MISTAKES_KEY), JSON.stringify(mistakes || []));
            } catch (e) {
                console.warn('[StorageManager] saveMistakes error', e);
            }
        },

        // --- Debug Settings ---

        /**
         * Load Audio Debug Enabled status
         * @returns {boolean}
         */
        loadAudioDebugEnabled: function() {
            try {
                return localStorage.getItem(AUDIO_DEBUG_KEY) === '1';
            } catch (e) {
                return false;
            }
        },

        /**
         * Load Audio Debug Overlay position
         * @returns {Object|null} {left, top}
         */
        loadAudioDebugPosition: function() {
            try {
                const raw = localStorage.getItem(AUDIO_DEBUG_POS_KEY);
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                const left = Number(parsed?.left);
                const top = Number(parsed?.top);
                if (!Number.isFinite(left) || !Number.isFinite(top)) return null;
                return { left, top };
            } catch (e) {
                return null;
            }
        },

        /**
         * Save Audio Debug Overlay position
         * @param {Object} position {left, top}
         */
        saveAudioDebugPosition: function(position) {
            try {
                if (!position) return;
                localStorage.setItem(AUDIO_DEBUG_POS_KEY, JSON.stringify(position));
            } catch (e) {
                console.warn('[StorageManager] saveAudioDebugPosition error', e);
            }
        }
    };

    window.JPAPPStorageManager = JPAPPStorageManager;
})();
