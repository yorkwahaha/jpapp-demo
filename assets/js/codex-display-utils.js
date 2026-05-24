/**
 * JPAPP Codex & Spirit Display Utilities
 * Pure helper functions for formatting and path generation.
 * Version: 26050305
 */
(function() {
    const JPAPPCodexDisplayUtils = {
        /**
         * Get Spirit Icon key from particle option
         * @param {string} opt 
         * @returns {string}
         */
        getSpiritIconKey: function(opt) {
            const particleToIconMap = window.JPAPP_CONSTANTS?.PARTICLE_TO_ICON_MAP || {};
            const normalized = String(opt || '').trim();
            return particleToIconMap[normalized] || '';
        },

        /**
         * Get Spirit Icon WebP path
         * @param {string} opt 
         * @returns {string}
         */
        getSpiritIconPath: function(opt) {
            const base = window.JPAPP_CONSTANTS?.SPIRIT_ICON_BASE_PATH || '';
            const key = this.getSpiritIconKey(opt);
            if (!key) return '';
            return `${base}${key}.webp`;
        },

        /**
         * Get Spirit Image source (WebP)
         * @param {Object} spirit 
         * @param {boolean} isWheel
         * @param {boolean} isLocked
         * @returns {string}
         */
        getSpiritImageSrc: function(spirit, isWheel = false, isLocked = false) {
            const placeholder = window.JPAPP_CONSTANTS?.SPIRIT_IMAGE_PLACEHOLDER || '';
            if (!spirit?.implemented || !spirit.imageBase) return placeholder;
            if (isWheel) {
                if (isLocked) {
                    const lockedBase = spirit.imageBase.replace('/display/', '/wheel-locked/');
                    return `${lockedBase}.webp`;
                }
                const wheelBase = spirit.imageBase.replace('/display/', '/wheel/');
                return `${wheelBase}.webp`;
            }
            return `${spirit.imageBase}.webp`;
        },

        /**
         * Handle Spirit Image Error (WebP -> PNG fallback or placeholder)
         * @param {Event} event 
         * @param {Object} spirit 
         * @param {boolean} isWheel
         * @param {boolean} isLocked
         */
        handleSpiritImageError: function(event, spirit, isWheel = false, isLocked = false) {
            const img = event?.target;
            const placeholder = window.JPAPP_CONSTANTS?.SPIRIT_IMAGE_PLACEHOLDER || '';
            if (!img) return;
            if (spirit?.implemented && spirit.imageBase) {
                if (isWheel) {
                    if (isLocked) {
                        img.onerror = function() {
                            img.onerror = null;
                            img.src = placeholder;
                        };
                        const lockedBase = spirit.imageBase.replace('/display/', '/wheel-locked/');
                        img.src = `${lockedBase}.png`;
                        return;
                    }
                    img.onerror = function() {
                        img.onerror = function() {
                            img.onerror = null;
                            img.src = placeholder;
                        };
                        img.src = `${spirit.imageBase}.png`;
                    };
                    img.src = `${spirit.imageBase}.webp`;
                    return;
                }
                if (img.src.includes('.webp')) {
                    img.onerror = null;
                    img.src = `${spirit.imageBase}.png`;
                    return;
                }
            }
            img.onerror = null;
            img.src = placeholder;
        },

        /**
         * Format Monster Codex Value
         * @param {any} value 
         * @param {string} suffix 
         * @returns {string}
         */
        formatMonsterCodexValue: function(value, suffix = '') {
            if (value === null || value === undefined || value === '') return '未記錄';
            return `${value}${suffix}`;
        },

        /**
         * Format Monster Evasion Rate
         * @param {number|null} evasionRate 
         * @returns {string}
         */
        formatMonsterEvasion: function(evasionRate) {
            if (evasionRate === null || evasionRate === undefined) return '未記錄';
            return `${Math.round(Number(evasionRate) * 100)}%`;
        },

        /**
         * Format Monster Attack Interval
         * @param {number|null} attackIntervalMs 
         * @returns {string}
         */
        formatMonsterAttackInterval: function(attackIntervalMs) {
            if (attackIntervalMs === null || attackIntervalMs === undefined) return '未記錄';
            return `${(Number(attackIntervalMs) / 1000).toFixed(1)} 秒`;
        },

        /**
         * Format Monster Damage Range
         * @param {number|null} min 
         * @param {number|null} max 
         * @returns {string}
         */
        formatMonsterDamageRange: function(min, max) {
            if (min === null && max === null) return '未記錄';
            const minText = this.formatMonsterCodexValue(min);
            const maxText = this.formatMonsterCodexValue(max);
            if (min === max && min !== null) return minText;
            return `${minText} - ${maxText}`;
        },

        /**
         * Handle Monster Image Error
         * @param {Event} event 
         * @param {string} fallbackSrc 
         */
        handleMonsterImageError: function(event, fallbackSrc) {
            const img = event?.target;
            if (!img || img.dataset.fallbackApplied === 'true') return;
            img.dataset.fallbackApplied = 'true';
            img.src = fallbackSrc || window.JPAPP_CONSTANTS?.DEFAULT_IMAGE_PATHS?.monsterSprite || '';
        },

        /**
         * Format Monster Name with fallback
         * @param {string} name 
         * @returns {string}
         */
        formatMonsterName: function(name) {
            return name || '未記錄';
        },

        /**
         * Format Monster Trait/Description with fallback
         * @param {string} trait 
         * @param {string} description 
         * @returns {string}
         */
        formatMonsterTrait: function(trait, description) {
            return description || trait || '未記錄';
        },

        /**
         * Format monster spawn stage line for codex detail.
         * @param {number[]} spawnLevels
         * @param {Object} levelConfig keyed by stage number
         * @returns {string}
         */
        formatMonsterSpawnStageText: function(spawnLevels, levelConfig) {
            const levels = Array.isArray(spawnLevels) ? spawnLevels : [];
            if (!levels.length) return '出現關卡：未記錄';
            const configMap = levelConfig && typeof levelConfig === 'object' ? levelConfig : {};
            return `出現關卡：${levels.map(lv => {
                const config = configMap[Number(lv)];
                const label = config?.levelName || config?.name || `Stage ${lv}`;
                return `Lv.${lv} ${label}`;
            }).join(' / ')}`;
        },

        /**
         * Build one monster codex list/detail entry (pure; no Vue).
         * @param {Object} enemy
         * @param {number} idx
         * @param {{ clearedLevels?: number[], levelConfig?: Object, defaultMonsterSprite?: string }} options
         * @returns {Object}
         */
        buildMonsterCodexEntry: function(enemy, idx, options = {}) {
            const {
                clearedLevels = [],
                levelConfig = {},
                defaultMonsterSprite = window.JPAPP_CONSTANTS?.DEFAULT_IMAGE_PATHS?.monsterSprite || ''
            } = options;
            const spawnLevels = Array.isArray(enemy?.spawnLevels) ? enemy.spawnLevels : [];
            const enemyStats = enemy?.enemyStats || {};
            const damage = enemyStats.damage || {};
            const hp = enemyStats.hp ?? enemy?.hpMax ?? null;
            const damageMin = typeof damage === 'number' ? damage : (damage.min ?? enemy?.attackDamageMin ?? null);
            const damageMax = typeof damage === 'number' ? damage : (damage.max ?? enemy?.attackDamageMax ?? null);
            const attackIntervalMs = enemyStats.attackIntervalMs ?? enemy?.attackIntervalMs ?? null;
            const evasionRate = enemyStats.evasionRate ?? enemy?.evasionRate ?? null;
            const cleared = Array.isArray(clearedLevels) ? clearedLevels : [];
            const isUnlocked = spawnLevels.some(lv => cleared.includes(Number(lv)));

            return {
                id: enemy?.id || `monster-${idx}`,
                sortLevel: spawnLevels[0] ?? 999,
                isUnlocked,
                name: this.formatMonsterName(enemy?.name),
                image: enemy?.image || defaultMonsterSprite,
                spawnLevels,
                stageText: this.formatMonsterSpawnStageText(spawnLevels, levelConfig),
                traitText: this.formatMonsterTrait(enemy?.trait, enemy?.description),
                hpText: this.formatMonsterCodexValue(hp),
                damageText: this.formatMonsterDamageRange(damageMin, damageMax),
                evasionText: this.formatMonsterEvasion(evasionRate),
                intervalText: this.formatMonsterAttackInterval(attackIntervalMs)
            };
        },

        /**
         * Build sorted monster codex entries for the map HUD modal.
         * @param {Object[]} enemies
         * @param {{ clearedLevels?: number[], levelConfig?: Object, defaultMonsterSprite?: string }} options
         * @returns {Object[]}
         */
        buildMonsterCodexEntries: function(enemies, options = {}) {
            return (Array.isArray(enemies) ? enemies : [])
                .map((enemy, idx) => this.buildMonsterCodexEntry(enemy, idx, options))
                .sort((a, b) => a.sortLevel - b.sortLevel || a.name.localeCompare(b.name, 'zh-Hant'));
        },

        /**
         * Get Skill Type Label
         * @param {string} type 
         * @returns {string}
         */
        getSkillTypeLabel: function(type) {
            const labels = window.JPAPP_CONSTANTS?.SKILL_TYPE_LABELS || {};
            return labels[type] || 'BUFF';
        }
    };

    window.JPAPPCodexDisplayUtils = JPAPPCodexDisplayUtils;
})();
