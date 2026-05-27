/**
 * JPAPP — Result / stage record / ranking display (read + format only).
 *
 * 責任邊界（本檔）：
 * - 星等字串、S–E 評價、正確率、通關時間字串、全關卡成績表列、歷史最佳星/時間「顯示」
 * - 等級獎勵浮層卡片文案表 RESULT_LEVEL_MILESTONE_REWARDS（非解鎖邏輯）
 * - buildCurrentStageRecordPayload / shouldUpdateBestGrade（純資料形狀與比較；寫入在 game.js）
 *
 * 不在本檔：grantRewards、EXP、processLevelUp、animateRewards、playResultFanfare、updateStageBestRecord 寫入時機
 */
(function (global) {
    'use strict';

    /** 結算浮層「等級獎勵解放」卡片的顯示文案（非解鎖邏輯；篩選在 game.js `grantRewards`）。 */
    var RESULT_LEVEL_MILESTONE_REWARDS = [
        { level: 5, type: 'NEW SKILL', name: 'すっきり / 清爽恢復', desc: '消耗 SP，回復 20 HP' },
        { level: 10, type: 'NEW SKILL', name: 'ぴったり / 完美對上', desc: '此題只留下正確答案，每場一次' },
        { level: 20, type: 'NEW PASSIVE', name: 'しっかり / 穩住節奏', desc: '每場一次，答錯也不會中斷 Combo' },
        { level: 25, type: 'NEW PASSIVE', name: 'がっちり / 牢牢撐住', desc: '每場一次，受到致命傷時 HP 保留 1' },
        { level: 30, type: 'NEW PASSIVE', name: 'ばっちり / 完美反擊', desc: '受擊後反擊同等傷害，每場最多 3 次' }
    ];

    var DEFAULT_STAR_TIME_LIMIT_SECONDS = 60;

    function getDefaultStageStarTimeLimitSeconds(levelId) {
        var stage = Number(levelId);
        if (stage === 36) return 300;
        if (stage === 35) return 180;
        if (stage === 25 || stage === 30) return 150;
        if (stage === 15 || stage === 20) return 120;
        if (stage === 5 || stage === 10) return 90;
        return DEFAULT_STAR_TIME_LIMIT_SECONDS;
    }

    function isBossStageForStarRules(levelId, LEVEL_CONFIG) {
        var cfg = LEVEL_CONFIG && LEVEL_CONFIG[Number(levelId)];
        return !!(cfg && cfg.boss) || Number(levelId) % 5 === 0 || Number(levelId) === 36;
    }

    /** 本場通關星等 1–3（錯題數 + 時間上限）；結算卡 stageStarRating 與 buildCurrentStageRecordPayload 共用。 */
    function calculateStageStars(snapshot, ctx) {
        ctx = ctx || {};
        var LEVEL_CONFIG = ctx.LEVEL_CONFIG || {};
        var s = snapshot || {};
        var totalCount = Math.max(0, Number(s.total) || 0);
        if (totalCount <= 0) return 1;
        var correctCount = Math.max(0, Number(s.correct) || 0);
        var wrong = Math.max(0, totalCount - correctCount);
        var elapsed = Number(s.elapsedSeconds);
        var levelId = s.levelId;
        var limitBase = ctx.starTimeLimitSeconds != null ? ctx.starTimeLimitSeconds : getDefaultStageStarTimeLimitSeconds(levelId);
        var configuredLimit = Number(LEVEL_CONFIG[Number(levelId)] && LEVEL_CONFIG[Number(levelId)].starTimeLimitSeconds);
        var limit = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : limitBase;
        var isBossStage = isBossStageForStarRules(levelId, LEVEL_CONFIG);
        if (isBossStage) {
            /* boss pacing hook — parity with game.js */
        }
        if (wrong === 0 && Number.isFinite(elapsed) && elapsed <= limit) return 3;
        if (wrong <= 2 || Math.round((correctCount / totalCount) * 100) >= 80) return 2;
        return 1;
    }

    /** 將 0–3 星數轉成「★/☆」字串。不讀存檔、不組表格列；結算卡與 formatStageBest* 共用。 */
    function formatStageStarsRow(stars) {
        var rating = Math.max(0, Math.min(3, Math.floor(Number(stars) || 0)));
        return '\u2605'.repeat(rating) + '\u2606'.repeat(3 - rating);
    }

    function pickNormalizedStageBestRecord(levelId, stageBestRecords, normalizeStageBestRecord) {
        var norm = normalizeStageBestRecord || function (r) { return r; };
        var record = norm(stageBestRecords[String(levelId)]);
        return record || null;
    }

    function formatStageBestStarsDisplay(levelId, stageBestRecords, normalizeStageBestRecord) {
        var record = pickNormalizedStageBestRecord(levelId, stageBestRecords, normalizeStageBestRecord);
        return record ? formatStageStarsRow(record.bestStars) : '\u2606\u2606\u2606';
    }

    function formatStageBestTimeDisplay(levelId, stageBestRecords, normalizeStageBestRecord, formatStageClearTime) {
        var record = pickNormalizedStageBestRecord(levelId, stageBestRecords, normalizeStageBestRecord);
        return record ? formatStageClearTime(record.bestTimeSeconds) : '--.-- \u79d2';
    }

    var HIDDEN_STAGE_SCORE_NAME = '？？？';

    /**
     * 全關卡成績表：是否顯示關卡主題名（助詞／焦點標籤）。
     * 已通關、或有 stageBest 紀錄、或目前在 unlockedLevels 內 → reveal；其餘未來關 → hide。
     */
    function shouldRevealScoreStageName(stageNumber, snapshot) {
        var n = Number(stageNumber);
        if (!Number.isFinite(n) || n < 1) return false;
        snapshot = snapshot || {};
        var clearedLevels = snapshot.clearedLevels || [];
        var unlockedLevels = snapshot.unlockedLevels || [];
        var stageBestRecords = snapshot.stageBestRecords || {};
        var normalizeStageBestRecord = snapshot.normalizeStageBestRecord || function (r) { return r; };
        var record = pickNormalizedStageBestRecord(n, stageBestRecords, normalizeStageBestRecord);
        if (clearedLevels.indexOf(n) !== -1 || !!record) return true;
        for (var i = 0; i < unlockedLevels.length; i++) {
            if (Number(unlockedLevels[i]) === n) return true;
        }
        return false;
    }

    /** 全關卡成績表：主標題列字串（焦點 label；未 reveal 時為「？？？」）。 */
    function getScoreStageDisplayName(stageNumber, snapshot) {
        return getScoreStageDisplayFields(stageNumber, snapshot).focusLabel;
    }

    function getScoreStageDisplayFields(stageNumber, snapshot) {
        snapshot = snapshot || {};
        var sm = global.JPAPPSettingsManager;
        var LEVEL_CONFIG = snapshot.LEVEL_CONFIG || {};
        var skillsAll = snapshot.skillsAll || {};
        if (!shouldRevealScoreStageName(stageNumber, snapshot)) {
            return { focusParticle: '', focusLabel: HIDDEN_STAGE_SCORE_NAME };
        }
        return {
            focusParticle: sm.computeStageFocusParticleDisplay(stageNumber, LEVEL_CONFIG, skillsAll),
            focusLabel: sm.computeStageFocusLabelDisplay(stageNumber, LEVEL_CONFIG, skillsAll)
        };
    }

    /**
     * 全關卡成績 modal 的列資料（stageRecordRows computed 的來源）。
     * 每列：關卡標題、焦點助詞、歷史 S–E（bestGrades）、最佳時間字串、通關狀態。
     * 列內「★ 是否點亮」由模板 + getStageBestRecord / getStageBestStarsDisplay，非本函式字串。
     * 星等規則與結算卡共用 calculateStageStars；寫入 stageBestRecords / bestGrades 在 game.js grantRewards 鏈。
     */
    function buildStageRecordTableRows(snapshot) {
        var total = Math.max(0, Number(snapshot.total) || 0);
        var LEVEL_CONFIG = snapshot.LEVEL_CONFIG || {};
        var skillsAll = snapshot.skillsAll || {};
        var clearedLevels = snapshot.clearedLevels || [];
        var unlockedLevels = snapshot.unlockedLevels || [];
        var bestGrades = snapshot.bestGrades || {};
        var stageBestRecords = snapshot.stageBestRecords || {};
        var normalizeStageBestRecord = snapshot.normalizeStageBestRecord || function (r) { return r; };
        var formatStageClearTime = snapshot.formatStageClearTime || function (s) { return s + 's'; };
        var rows = [];
        for (var index = 0; index < total; index++) {
            var stageNumber = index + 1;
            var config = LEVEL_CONFIG[stageNumber] || {};
            var record = pickNormalizedStageBestRecord(stageNumber, stageBestRecords, normalizeStageBestRecord);
            var isCleared = clearedLevels.indexOf(stageNumber) !== -1 || !!record;
            var rank = isCleared ? (bestGrades[stageNumber] || '—') : '—';
            var bestTimeText = record ? formatStageClearTime(record.bestTimeSeconds) : '—';
            var rowSnapshot = {
                clearedLevels: clearedLevels,
                unlockedLevels: unlockedLevels,
                stageBestRecords: stageBestRecords,
                normalizeStageBestRecord: normalizeStageBestRecord,
                LEVEL_CONFIG: LEVEL_CONFIG,
                skillsAll: skillsAll
            };
            var displayFields = getScoreStageDisplayFields(stageNumber, rowSnapshot);
            rows.push({
                stageNumber: stageNumber,
                title: config.title || config.name || ('Stage ' + String(stageNumber).padStart(2, '0')),
                focusParticle: displayFields.focusParticle,
                focusLabel: displayFields.focusLabel,
                rank: rank,
                bestTimeText: bestTimeText,
                isCleared: isCleared,
                statusText: isCleared ? '已通關' : '未通關'
            });
        }
        return rows;
    }

    function buildCurrentStageRecordPayload(values) {
        var total = Math.max(0, Number(values.totalQuestionsAnswered) || 0);
        var correct = Math.max(0, Number(values.correctAnswersAmount) || 0);
        var elapsed = Number(values.stageClearElapsedSeconds);
        var elapsedMs = Number.isFinite(elapsed) ? Math.max(0, Math.round(elapsed * 1000)) : 0;
        var levelId = values.currentLevelId;
        var LEVEL_CONFIG = values.LEVEL_CONFIG || {};
        var stars = values.stageStarRatingValue || calculateStageStars({
            total: total,
            correct: correct,
            elapsedSeconds: elapsed,
            levelId: levelId
        }, { LEVEL_CONFIG: LEVEL_CONFIG, starTimeLimitSeconds: values.starTimeLimitSeconds });
        return {
            bestStars: stars,
            bestTimeMs: elapsedMs,
            bestTimeSeconds: elapsedMs / 1000,
            bestCorrectRate: total > 0 ? Math.round((correct / total) * 100) : 0,
            bestMaxCombo: Math.max(0, Number(values.maxComboCount) || 0),
            updatedAt: new Date().toISOString()
        };
    }

    function isAllStagesSRank(bestGrades, maxStage) {
        var ms = maxStage || 35;
        for (var i = 1; i <= ms; i++) {
            if (bestGrades[i] !== 'S') return false;
        }
        return true;
    }

    function shouldUpdateBestGrade(currentG, oldG, gradeRankMap) {
        if (!oldG) return true;
        return (gradeRankMap[currentG] || 0) > (gradeRankMap[oldG] || 0);
    }

    function createVueBindings(vueApis, deps) {
        var computed = vueApis.computed;
        var totalQuestionsAnswered = deps.totalQuestionsAnswered;
        var correctAnswersAmount = deps.correctAnswersAmount;
        var stageClearElapsedSeconds = deps.stageClearElapsedSeconds;
        var currentLevel = deps.currentLevel;
        var monsterDead = deps.monsterDead;
        var playerDead = deps.playerDead;
        var LEVEL_CONFIG = deps.LEVEL_CONFIG;
        var formatStageClearTime = deps.formatStageClearTime;
        var maxLevel = deps.maxLevel;
        var skillsAll = deps.skillsAll;
        var clearedLevels = deps.clearedLevels;
        var unlockedLevels = deps.unlockedLevels;
        var bestGrades = deps.bestGrades;
        var stageBestRecords = deps.stageBestRecords;
        var normalizeStageBestRecord = deps.normalizeStageBestRecord;
        /** 本場正確率（%）；僅顯示用，結算 modal「正確率」列。 */
        var accuracyPct = computed(function () {
            if (totalQuestionsAnswered.value === 0) return 0;
            return Math.round((correctAnswersAmount.value / totalQuestionsAnswered.value) * 100);
        });

        /**
         * 本場 S–E 評價（依 accuracyPct 門檻）；結算 modal「評價」列。
         * 門檻：100→S，≥90→A，≥80→B，≥60→C，≥40→D，否則 E；戰敗為 '-'。
         * bestGrades 持久化在 game.js grantRewards（shouldUpdateBestGrade + GRADE_RANK）；改門檻須一併手測存檔與全關卡表。
         */
        var calculatedGrade = computed(function () {
            if (playerDead.value) return '-';
            var acc = accuracyPct.value;
            if (acc === 100) return 'S';
            if (acc >= 90) return 'A';
            if (acc >= 80) return 'B';
            if (acc >= 60) return 'C';
            if (acc >= 40) return 'D';
            return 'E';
        });

        var stageClearTimeText = computed(function () {
            if (stageClearElapsedSeconds.value === null) return '--.-- \u79d2';
            return formatStageClearTime(stageClearElapsedSeconds.value);
        });

        var stageStarRating = computed(function () {
            if (!monsterDead.value || playerDead.value) return 0;
            return calculateStageStars({
                total: totalQuestionsAnswered.value,
                correct: correctAnswersAmount.value,
                elapsedSeconds: stageClearElapsedSeconds.value,
                levelId: currentLevel.value
            }, { LEVEL_CONFIG: LEVEL_CONFIG.value });
        });

        var stageStarDisplay = computed(function () {
            return formatStageStarsRow(stageStarRating.value || 0);
        });

        function getStageBestRecord(levelId) {
            return pickNormalizedStageBestRecord(levelId, stageBestRecords.value, normalizeStageBestRecord);
        }

        function getStageBestStarsDisplay(levelId) {
            return formatStageBestStarsDisplay(levelId, stageBestRecords.value, normalizeStageBestRecord);
        }

        function getStageBestTimeText(levelId) {
            return formatStageBestTimeDisplay(levelId, stageBestRecords.value, normalizeStageBestRecord, formatStageClearTime);
        }

        var stageRecordRows = computed(function () {
            return buildStageRecordTableRows({
                total: maxLevel.value,
                LEVEL_CONFIG: LEVEL_CONFIG.value,
                skillsAll: skillsAll.value,
                clearedLevels: clearedLevels.value,
                unlockedLevels: unlockedLevels.value,
                bestGrades: bestGrades.value,
                stageBestRecords: stageBestRecords.value,
                normalizeStageBestRecord: normalizeStageBestRecord,
                formatStageClearTime: formatStageClearTime
            });
        });

        var sRankCount = computed(function () {
            var count = 0;
            var rows = stageRecordRows.value || [];
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].rank === 'S') count++;
            }
            return count;
        });

        return {
            accuracyPct: accuracyPct,
            calculatedGrade: calculatedGrade,
            stageClearTimeText: stageClearTimeText,
            stageStarRating: stageStarRating,
            stageStarDisplay: stageStarDisplay,
            getStageBestRecord: getStageBestRecord,
            getStageBestStarsDisplay: getStageBestStarsDisplay,
            getStageBestTimeText: getStageBestTimeText,
            stageRecordRows: stageRecordRows,
            sRankCount: sRankCount
        };
    }

    global.JPAPPResultDisplayManager = {
        RESULT_LEVEL_MILESTONE_REWARDS: RESULT_LEVEL_MILESTONE_REWARDS,
        DEFAULT_STAR_TIME_LIMIT_SECONDS: DEFAULT_STAR_TIME_LIMIT_SECONDS,
        getDefaultStageStarTimeLimitSeconds: getDefaultStageStarTimeLimitSeconds,
        createVueBindings: createVueBindings,
        calculateStageStars: calculateStageStars,
        isBossStageForStarRules: isBossStageForStarRules,
        formatStageStarsRow: formatStageStarsRow,
        pickNormalizedStageBestRecord: pickNormalizedStageBestRecord,
        formatStageBestStarsDisplay: formatStageBestStarsDisplay,
        formatStageBestTimeDisplay: formatStageBestTimeDisplay,
        HIDDEN_STAGE_SCORE_NAME: HIDDEN_STAGE_SCORE_NAME,
        shouldRevealScoreStageName: shouldRevealScoreStageName,
        getScoreStageDisplayName: getScoreStageDisplayName,
        getScoreStageDisplayFields: getScoreStageDisplayFields,
        buildStageRecordTableRows: buildStageRecordTableRows,
        buildCurrentStageRecordPayload: buildCurrentStageRecordPayload,
        isAllStagesSRank: isAllStagesSRank,
        shouldUpdateBestGrade: shouldUpdateBestGrade
    };
})(typeof window !== 'undefined' ? window : globalThis);
