'use strict';
window.JPAPPSrsHelpers = (() => {
    const BASE_KEY = 'jpRpgSrsWeightsV1';

    function _slotKey() {
        const slot = window.JPAPPStorageManager?.getActiveSaveSlotId?.() ?? 1;
        return `${BASE_KEY}_slot_${slot}`;
    }

    function _load() {
        try { return JSON.parse(localStorage.getItem(_slotKey())) || {}; }
        catch { return {}; }
    }

    function _save(w) {
        try { localStorage.setItem(_slotKey(), JSON.stringify(w)); } catch {}
    }

    // Reduce SRS weight for a skill answered correctly
    function recordCorrect(skillId) {
        if (!skillId) return;
        const w = _load();
        if ((w[skillId] || 0) > 0) w[skillId] = Math.max(0, (w[skillId] || 0) - 1);
        _save(w);
    }

    // Raise SRS weight for a skill answered wrong
    function recordWrong(skillId) {
        if (!skillId) return;
        const w = _load();
        w[skillId] = (w[skillId] || 0) + 2;
        _save(w);
    }

    function clearSlotWeights() {
        try { localStorage.removeItem(_slotKey()); } catch {}
    }

    // Build weighted skill queue: mistake count + SRS persistent weights + low mastery bonus
    function buildSrsSkillQueue(mistakes, skillMastery, unlockedSkillIds) {
        const unlocked = new Set(unlockedSkillIds || []);
        const srsW = _load();
        const scores = {};

        (mistakes || []).forEach(m => {
            if (m.skillId && unlocked.has(m.skillId))
                scores[m.skillId] = (scores[m.skillId] || 0) + 3;
        });

        Object.entries(srsW).forEach(([id, w]) => {
            if (w > 0 && unlocked.has(id))
                scores[id] = (scores[id] || 0) + w;
        });

        unlocked.forEach(id => {
            const mastery = Number(skillMastery?.[id] ?? 0);
            if (mastery < 50) {
                const bonus = Math.floor((50 - mastery) / 10);
                if (bonus > 0) scores[id] = (scores[id] || 0) + bonus;
            }
        });

        const entries = Object.entries(scores).filter(([id]) => unlocked.has(id));
        if (!entries.length) {
            // Fallback: all unlocked skills equally weighted
            const all = [...unlocked];
            return all.sort(() => Math.random() - 0.5).slice(0, 10);
        }

        entries.sort((a, b) => b[1] - a[1]);
        const top = entries.slice(0, 8);
        const total = top.reduce((s, [, sc]) => s + sc, 0);

        const pool = [];
        top.forEach(([id, sc]) => {
            const slots = Math.max(1, Math.round((sc / total) * 20));
            for (let i = 0; i < slots; i++) pool.push(id);
        });

        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        return pool;
    }

    function hasSrsContent(mistakes, skillMastery, unlockedSkillIds) {
        if ((mistakes || []).length > 0) return true;
        return (unlockedSkillIds || []).some(id => Number(skillMastery?.[id] ?? 0) < 50);
    }

    return { buildSrsSkillQueue, recordCorrect, recordWrong, clearSlotWeights, hasSrsContent };
})();
