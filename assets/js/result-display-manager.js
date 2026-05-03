/**
 * JPAPP — Result / stage record / ranking display (read + format only).
 */
(function (global) {
    'use strict';

    var DEFAULT_STAR_TIME_LIMIT_SECONDS = 90;

    function isBossStageForStarRules(levelId, LEVEL_CONFIG) {
        var cfg = LEVEL_CONFIG && LEVEL_CONFIG[Number(levelId)];
        return !!(cfg && cfg.boss) || Number(levelId) % 5 === 0 || Number(levelId) === 36;
    }

    function calculateStageStars(snapshot, ctx) {
        ctx = ctx || {};
        var LEVEL_CONFIG = ctx.LEVEL_CONFIG || {};
        var limitBase = ctx.starTimeLimitSeconds != null ? ctx.starTimeLimitSeconds : DEFAULT_STAR_TIME_LIMIT_SECONDS;
        var s = snapshot || {};
        var totalCount = Math.max(0, Number(s.total) || 0);
        if (totalCount <= 0) return 1;
        var correctCount = Math.max(0, Number(s.correct) || 0);
        var wrong = Math.max(0, totalCount - correctCount);
        var elapsed = Number(s.elapsedSeconds);
        var levelId = s.levelId;
        var limit = Number(LEVEL_CONFIG[Number(levelId)] && LEVEL_CONFIG[Number(levelId)].starTimeLimitSeconds) || limitBase;
        var isBossStage = isBossStageForStarRules(levelId, LEVEL_CONFIG);
        if (isBossStage) {
            /* boss pacing hook — parity with game.js */
        }
        if (wrong === 0 && Number.isFinite(elapsed) && elapsed <= limit) return 3;
        if (wrong <= 2 || Math.round((correctCount / totalCount) * 100) >= 80) return 2;
        return 1;
    }

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

    function buildStageRecordTableRows(snapshot) {
        var sm = global.JPAPPSettingsManager;
        var total = Math.max(0, Number(snapshot.total) || 0);
        var LEVEL_CONFIG = snapshot.LEVEL_CONFIG || {};
        var skillsAll = snapshot.skillsAll || {};
        var clearedLevels = snapshot.clearedLevels || [];
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
            rows.push({
                stageNumber: stageNumber,
                title: config.title || config.name || ('Stage ' + String(stageNumber).padStart(2, '0')),
                focusParticle: sm.computeStageFocusParticleDisplay(stageNumber, LEVEL_CONFIG, skillsAll),
                focusLabel: sm.computeStageFocusLabelDisplay(stageNumber, LEVEL_CONFIG, skillsAll),
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
        var bestGrades = deps.bestGrades;
        var stageBestRecords = deps.stageBestRecords;
        var normalizeStageBestRecord = deps.normalizeStageBestRecord;
        var maxRankCountStages = deps.maxRankCountStages || 35;

        var accuracyPct = computed(function () {
            if (totalQuestionsAnswered.value === 0) return 0;
            return Math.round((correctAnswersAmount.value / totalQuestionsAnswered.value) * 100);
        });

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
                bestGrades: bestGrades.value,
                stageBestRecords: stageBestRecords.value,
                normalizeStageBestRecord: normalizeStageBestRecord,
                formatStageClearTime: formatStageClearTime
            });
        });

        var sRankCount = computed(function () {
            var count = 0;
            for (var i = 1; i <= maxRankCountStages; i++) {
                if (bestGrades.value[i] === 'S') count++;
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
        DEFAULT_STAR_TIME_LIMIT_SECONDS: DEFAULT_STAR_TIME_LIMIT_SECONDS,
        createVueBindings: createVueBindings,
        calculateStageStars: calculateStageStars,
        isBossStageForStarRules: isBossStageForStarRules,
        formatStageStarsRow: formatStageStarsRow,
        pickNormalizedStageBestRecord: pickNormalizedStageBestRecord,
        formatStageBestStarsDisplay: formatStageBestStarsDisplay,
        formatStageBestTimeDisplay: formatStageBestTimeDisplay,
        buildStageRecordTableRows: buildStageRecordTableRows,
        buildCurrentStageRecordPayload: buildCurrentStageRecordPayload,
        isAllStagesSRank: isAllStagesSRank,
        shouldUpdateBestGrade: shouldUpdateBestGrade
    };
})(typeof window !== 'undefined' ? window : globalThis);
