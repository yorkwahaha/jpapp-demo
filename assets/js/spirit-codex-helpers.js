(function (global) {
    'use strict';

    const CODEX_LOCKED_SORT_LEVEL = 999;

    const getSpiritForSkillId = (spiritsBySkillId, skillId) => {
        if (!skillId || typeof skillId !== 'string') return null;
        return spiritsBySkillId?.[skillId] || null;
    };

    const getSpiritForSkill = (spiritsBySkillId, skill) => getSpiritForSkillId(spiritsBySkillId, skill?.id);

    const getSpiritForKnowledgeCard = (spiritsBySkillId, card) => card?.spirit || getSpiritForSkill(spiritsBySkillId, card);

    const decorateSkillWithSpirit = (spiritsBySkillId, skill) => {
        if (!skill) return null;
        const spirit = getSpiritForSkillId(spiritsBySkillId, skill.id);
        return spirit ? { ...skill, spirit } : skill;
    };

    const sortUnlockedCodexSkills = (a, b) => {
        if (a.particle !== b.particle) return (a.particle || '').localeCompare(b.particle || '', 'ja');
        return (a.rank || 0) - (b.rank || 0);
    };

    const sortLockedCodexSkills = (skillUnlockMap, a, b) => {
        const lA = skillUnlockMap?.[a.id] || CODEX_LOCKED_SORT_LEVEL;
        const lB = skillUnlockMap?.[b.id] || CODEX_LOCKED_SORT_LEVEL;
        if (lA !== lB) return lA - lB;
        return sortUnlockedCodexSkills(a, b);
    };

    const buildSkillsWithUnlockLevel = (skills, unlockedSkillIds, skillUnlockMap) => {
        const unlocked = [];
        const locked = [];
        const unlockedIds = Array.isArray(unlockedSkillIds) ? unlockedSkillIds : [];

        (Array.isArray(skills) ? skills : []).forEach(skill => {
            if (unlockedIds.includes(skill.id)) unlocked.push(skill);
            else locked.push(skill);
        });

        unlocked.sort(sortUnlockedCodexSkills);
        locked.sort((a, b) => sortLockedCodexSkills(skillUnlockMap, a, b));

        return [...unlocked, ...locked].map(skill => ({
            ...skill,
            unlockLevel: skillUnlockMap?.[skill.id]
        }));
    };

    const getCodexBaseSkills = (skillsWithUnlockLevel) => {
        return (Array.isArray(skillsWithUnlockLevel) ? skillsWithUnlockLevel : []).filter(skill =>
            skill.particle &&
            !skill.particle.startsWith('複習') &&
            skill.particle !== '極限' &&
            skill.id !== 'TO_COMPANION'
        );
    };

    const normalizeMasteryPercent = (value) => {
        const n = Number(value ?? 0);
        return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.floor(n))) : 0;
    };

    const getMasteryStyle = (value) => ({
        width: `${normalizeMasteryPercent(value)}%`
    });

    const isMasteryMax = (value) => normalizeMasteryPercent(value) >= 100;

    const SPIRIT_RESONANCE_VISUAL_ORDER = Object.freeze([
        'WA_TOPIC_BASIC',
        'NI_TIME',
        'KARA_SOURCE_START',
        'GA_EXIST_SUBJECT',
        'TO_AND',
        'DE_ACTION_PLACE',
        'NO_POSSESSIVE',
        'NI_EXIST_PLACE',
        'MADE_LIMIT_END',
        'MO_ALSO_BASIC',
        'DE_TOOL_MEANS',
        'TO_WITH',
        'GA_INTRANSITIVE',
        'NI_DESTINATION',
        'YORI_COMPARE',
        'YA_AND_OTHERS',
        'WO_OBJECT_BASIC',
        'NI_TARGET',
        'KARA_REASON',
        'GA_BUT',
        'DE_SCOPE',
        'TO_QUOTE',
        'HE_DIRECTION',
        'NI_PURPOSE',
        'MO_COMPLETE_NEGATION',
        'TO_CONDITIONAL',
        'NI_FREQUENCY',
        'DE_MATERIAL'
    ]);

    const orderCodexWheelSkillsForResonance = (skills) => {
        const skillList = Array.isArray(skills) ? skills : [];
        const byId = new Map(skillList.map(skill => [skill.id, skill]));
        const ordered = SPIRIT_RESONANCE_VISUAL_ORDER
            .map(id => byId.get(id))
            .filter(Boolean);
        const orderedIds = new Set(ordered.map(skill => skill.id));
        return ordered.concat(skillList.filter(skill => !orderedIds.has(skill.id)));
    };

    global.JPAPPSpiritCodexHelpers = {
        getSpiritForSkillId,
        getSpiritForSkill,
        getSpiritForKnowledgeCard,
        decorateSkillWithSpirit,
        buildSkillsWithUnlockLevel,
        getCodexBaseSkills,
        normalizeMasteryPercent,
        getMasteryStyle,
        isMasteryMax,
        orderCodexWheelSkillsForResonance
    };
})(window);
