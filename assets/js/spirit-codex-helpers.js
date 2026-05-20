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

    global.JPAPPSpiritCodexHelpers = {
        getSpiritForSkillId,
        getSpiritForSkill,
        getSpiritForKnowledgeCard,
        decorateSkillWithSpirit,
        buildSkillsWithUnlockLevel,
        getCodexBaseSkills,
        normalizeMasteryPercent,
        getMasteryStyle,
        isMasteryMax
    };
})(window);
