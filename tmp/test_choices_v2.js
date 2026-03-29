
const getChoiceCountForLevel = (lv) => (lv % 5 === 0 || lv >= 31) ? 4 : 3;
const currentLevel = { value: 20 };
const validParticles = ['は', 'の', 'が', 'を', 'に', 'へ', 'も', 'で', 'と', 'から', 'まで', 'や', 'より'];

const simulateGetChoices = (skillDef, defaultChoices, correctAns) => {
    const targetCount = getChoiceCountForLevel(currentLevel.value);
    
    // Identify if this is a strict particle-based skill
    const isParticleSkill = skillDef.particle && validParticles.includes(skillDef.particle);
    const rawPool = [...(skillDef.choiceSet || defaultChoices)];

    let safePool = rawPool.filter(p => {
        if (!p || typeof p !== 'string') return false;
        if (isParticleSkill) {
            // Strict mode for particle-based skills
            return validParticles.includes(p);
        } else {
            // General safety for non-particle skills
            if (p.length === 0) return false;
            if (p.length > 12) return false;
            const isChinese = /[\u4e00-\u9fa5]/.test(p);
            const ansIsJapanese = !/[\u4e00-\u9fa5]/.test(correctAns || '');
            if (isChinese && ansIsJapanese) return false;
            return true;
        }
    });

    const filteredOut = rawPool.filter(p => !safePool.includes(p) && p !== correctAns);
    if (filteredOut.length > 0) {
        console.log(`[ChoiceFilter] Skill:${skillDef.id} Filtered:`, filteredOut);
    }

    if (correctAns && !safePool.includes(correctAns)) {
        safePool.push(correctAns);
    }

    if (safePool.length < targetCount && isParticleSkill) {
        const fallback = ['は', 'の', 'が', 'を', 'に', 'で', 'と'].filter(p => !safePool.includes(p));
        while (safePool.length < targetCount && fallback.length > 0) {
            safePool.push(fallback.shift());
        }
    }

    return safePool.slice(0, targetCount); // Simplified for test
};

// Test Cases
console.log("--- TEST 1: Particle Skill (NI_EXIST_PLACE) with '下' ---");
console.log(simulateGetChoices(
    { id: 'NI_EXIST_PLACE', particle: 'に' },
    ['に', '下', 'を', 'で'],
    'に'
));

console.log("\n--- TEST 2: Non-Particle Skill (Future Vocab) with Chinese ---");
console.log(simulateGetChoices(
    { id: 'VOCAB_FOOD', particle: 'food' },
    ['すし', '天ぷら', '拉麵', 'verylongstringthatshouldbefilteredout'],
    'すし'
));

console.log("\n--- TEST 3: Non-Particle Skill with planned Kanji answer ---");
console.log(simulateGetChoices(
    { id: 'KANJI_TEST', particle: 'kanji' },
    ['學生', '先生', '醫者', 'は'],
    '學生'
));
