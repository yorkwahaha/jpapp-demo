window.JPAPPStatsDisplay = (() => {
    'use strict';

    const isBossSkill = (skill) => {
        const p = skill.particle ?? '';
        return p === '複習' || p === '極限' || p.startsWith('複習');
    };

    function computeFamilyStats({ spirits, skillMastery }) {
        if (!Array.isArray(spirits) || !spirits.length) return [];
        const familyMap = {};
        for (const spirit of spirits) {
            const f = spirit.family || spirit.particle;
            if (!familyMap[f]) familyMap[f] = { family: f, total: 0, resonated: 0 };
            familyMap[f].total++;
            if ((skillMastery[spirit.skillId] ?? 0) > 0) familyMap[f].resonated++;
        }
        return Object.values(familyMap)
            .filter(f => f.total >= 2)
            .sort((a, b) => b.total - a.total || a.family.localeCompare(b.family));
    }

    function computeStats({ skills, spirits, skillMastery, stageBestRecords, bestGrades, mistakes }) {
        if (!Array.isArray(skills) || !skills.length) {
            return { particleStats: [], overallMastery: 0, weakest3: [], clearedCount: 0, sRankCount: 0, mistakeCount: 0, familyStats: [] };
        }

        const nonBoss = skills.filter(s => !isBossSkill(s));

        // Per-particle average mastery, sorted descending
        const particleMap = {};
        for (const skill of nonBoss) {
            const p = skill.particle;
            if (!particleMap[p]) particleMap[p] = { total: 0, count: 0 };
            particleMap[p].total += (skillMastery[skill.id] ?? 0);
            particleMap[p].count++;
        }
        const particleStats = Object.entries(particleMap)
            .map(([particle, { total, count }]) => ({
                particle,
                avg: Math.round(total / count),
            }))
            .sort((a, b) => b.avg - a.avg);

        // Overall mastery across all non-boss skills
        const overallMastery = nonBoss.length
            ? Math.round(nonBoss.reduce((s, sk) => s + (skillMastery[sk.id] ?? 0), 0) / nonBoss.length)
            : 0;

        // Weakest 3 skills, ascending by mastery
        const weakest3 = [...nonBoss]
            .sort((a, b) => (skillMastery[a.id] ?? 0) - (skillMastery[b.id] ?? 0))
            .slice(0, 3)
            .map(s => ({ name: s.name, mastery: skillMastery[s.id] ?? 0 }));

        const clearedCount = Object.keys(stageBestRecords ?? {}).length;
        const sRankCount = Object.values(bestGrades ?? {}).filter(g => g === 'S').length;
        const mistakeCount = (mistakes ?? []).length;

        const familyStats = computeFamilyStats({ spirits: spirits ?? [], skillMastery });

        return { particleStats, overallMastery, weakest3, clearedCount, sRankCount, mistakeCount, familyStats };
    }

    return { computeStats };
})();
