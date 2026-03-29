
const getChoiceCountForLevel = (lv) => (lv % 5 === 0 || lv >= 31) ? 4 : 3;
const currentLevel = { value: 20 };
const skillDef = { choiceSet: ['に', '下', 'を', 'で'] };

const getChoices = (defaultChoices, correctAns) => {
    const targetCount = getChoiceCountForLevel(currentLevel.value);
    const validParticles = ['は', 'の', 'が', 'を', 'に', 'へ', 'も', 'で', 'と', 'から', 'まで', 'や', 'より'];

    // [Audit Patch] Ensure results only contain valid particles to prevent fragments like "下"
    let safePool = [...(skillDef.choiceSet || defaultChoices)].filter(p => validParticles.includes(p));

    if (correctAns && !safePool.includes(correctAns)) {
        safePool.push(correctAns);
    }

    // If filtered pool is too small, backfill with safe common particles
    if (safePool.length < targetCount) {
        const fallback = ['は', 'の', 'が', 'を', 'に', 'で', 'と'].filter(p => !safePool.includes(p));
        while (safePool.length < targetCount && fallback.length > 0) {
            safePool.push(fallback.shift());
        }
    }

    safePool = safePool.sort(() => Math.random() - 0.5);
    let selected = [];

    if (correctAns) {
        selected.push(correctAns);
        safePool = safePool.filter(x => x !== correctAns);
    }

    const needed = targetCount - selected.length;
    if (safePool.length >= needed) {
        selected = selected.concat(safePool.slice(0, needed));
    } else {
        selected = selected.concat(safePool);
    }

    return selected.sort(() => Math.random() - 0.5);
};

// Test 1: Pollution with '下'
console.log("Test 1 (Dirty Pool):", getChoices(['に', '下', 'を', 'で'], 'に'));

// Test 2: Clean Pool
console.log("Test 2 (Clean Pool):", getChoices(['は', 'が', 'を'], 'は'));

// Test 3: Short Pool (Backfill)
console.log("Test 3 (Short Pool):", getChoices(['に'], 'に'));
