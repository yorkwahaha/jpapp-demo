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
         * @returns {string}
         */
        getSpiritImageSrc: function(spirit) {
            const placeholder = window.JPAPP_CONSTANTS?.SPIRIT_IMAGE_PLACEHOLDER || '';
            if (!spirit?.implemented || !spirit.imageBase) return placeholder;
            return `${spirit.imageBase}.webp`;
        },

        /**
         * Handle Spirit Image Error (WebP -> PNG fallback or placeholder)
         * @param {Event} event 
         * @param {Object} spirit 
         */
        handleSpiritImageError: function(event, spirit) {
            const img = event?.target;
            const placeholder = window.JPAPP_CONSTANTS?.SPIRIT_IMAGE_PLACEHOLDER || '';
            if (!img) return;
            if (spirit?.implemented && spirit.imageBase && img.src.includes('.webp')) {
                img.src = `${spirit.imageBase}.png`;
                return;
            }
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
         * Get Skill Type Label
         * @param {string} type 
         * @returns {string}
         */
        getSkillTypeLabel: function(type) {
            const labels = window.JPAPP_CONSTANTS?.SKILL_TYPE_LABELS || {};
            return labels[type] || 'BUFF';
        },

        /**
         * Format Particle Badge text (max 3 chars or '技')
         * @param {string} particle 
         * @returns {string}
         */
        formatParticleBadge: function(particle) {
            const p = particle || '技';
            return p.length <= 3 ? p : '技';
        },

        /**
         * Format Skill/Spirit name with fallback
         * @param {Object} skill 
         * @param {Object} spirit 
         * @returns {string}
         */
        formatSkillSpiritName: function(skill, spirit) {
            if (spirit?.nameJa) return spirit.nameJa;
            if (!skill) return '未命名';
            const name = skill.name || '';
            return name.split('：')[1] || name || '未命名';
        },

        /**
         * Format Skill Meaning with fallback
         * @param {string} meaning 
         * @returns {string}
         */
        formatSkillMeaning: function(meaning) {
            return meaning || '—';
        },

        /**
         * Format Skill Rule with fallback
         * @param {string} rule 
         * @returns {string}
         */
        formatSkillRule: function(rule) {
            return rule || '—';
        },

        /**
         * Format Unlock Level text
         * @param {number|null} level 
         * @returns {string}
         */
        formatUnlockLevel: function(level) {
            return level ? `第 ${level} 關解鎖` : '探索中';
        }
    };

    window.JPAPPCodexDisplayUtils = JPAPPCodexDisplayUtils;
})();
