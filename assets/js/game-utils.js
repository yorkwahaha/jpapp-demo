(function () {
    const utils = {};

    utils.normalizeStageBestRecord = (record) => {
        if (!record || typeof record !== 'object') return null;
        const bestStars = Math.max(1, Math.min(3, Math.floor(Number(record.bestStars) || 0)));
        if (!bestStars) return null;

        const rawTimeMs = Number(record.bestTimeMs);
        const rawTimeSeconds = Number(record.bestTimeSeconds);
        const bestTimeMs = Number.isFinite(rawTimeMs)
            ? Math.max(0, Math.round(rawTimeMs))
            : (Number.isFinite(rawTimeSeconds) ? Math.max(0, Math.round(rawTimeSeconds * 1000)) : 0);
        const bestTimeSeconds = bestTimeMs / 1000;
        const bestCorrectRate = Math.max(0, Math.min(100, Math.round(Number(record.bestCorrectRate) || 0)));
        const bestMaxCombo = Math.max(0, Math.floor(Number(record.bestMaxCombo) || 0));

        return {
            bestStars,
            bestTimeMs,
            bestTimeSeconds,
            bestCorrectRate,
            bestMaxCombo,
            updatedAt: record.updatedAt || record.clearedAt || new Date().toISOString()
        };
    };

    utils.normalizeStageBestRecords = (source = {}) => {
        return Object.entries(source || {}).reduce((acc, [stageId, record]) => {
            const normalized = utils.normalizeStageBestRecord(record);
            if (normalized) acc[stageId] = normalized;
            return acc;
        }, {});
    };

    utils.parseAcceptableAnswers = (ans) => {
        if (typeof ans === 'string') return ans.split(/[/、,]/g).map(s => s.trim()).filter(s => s);
        return Array.isArray(ans) ? ans : [ans];
    };

    utils.formatStageClearTime = (seconds) => {
        const safeSeconds = Number(seconds);
        if (!Number.isFinite(safeSeconds) || safeSeconds < 0) return '--.-- 秒';
        return `${safeSeconds.toFixed(2)} 秒`;
    };

    utils.getGradeColor = (grade) => {
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

    utils.pickOne = (arr) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

    utils.pickMany = (arr, n, exclude) => {
        const result = [];
        const pool = [...(arr || [])].filter(x => !exclude || exclude !== x);
        while (result.length < n && pool.length > 0) {
            const idx = Math.floor(Math.random() * pool.length);
            result.push(pool.splice(idx, 1)[0]);
        }
        return result;
    };

    utils.getStageRecordTimeMs = (record) => {
        const rawTimeMs = Number(record?.bestTimeMs);
        if (Number.isFinite(rawTimeMs)) return Math.max(0, rawTimeMs);
        const rawTimeSeconds = Number(record?.bestTimeSeconds);
        return Number.isFinite(rawTimeSeconds) ? Math.max(0, rawTimeSeconds * 1000) : Infinity;
    };

    utils.isStageRecordBetter = (nextRecord, currentRecord) => {
        if (!currentRecord) return true;
        if ((nextRecord.bestStars || 0) > (currentRecord.bestStars || 0)) return true;
        if ((nextRecord.bestStars || 0) < (currentRecord.bestStars || 0)) return false;
        const nextTime = utils.getStageRecordTimeMs(nextRecord);
        const currentTime = utils.getStageRecordTimeMs(currentRecord);
        return nextTime < currentTime;
    };

    window.JPAPP_UTILS = utils;
    window.__JPAPP_UTILS = utils;
})();
