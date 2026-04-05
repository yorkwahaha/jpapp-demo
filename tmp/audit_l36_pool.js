// Audit script: find duplicate final sentences in L36 source pool
// Run with: node tmp/audit_l36_pool.js

// Minimal shim so the file can be require()'d
global.window = {};
require('../assets/data/earlyGamePools.v1.js');
const EARLY_GAME_POOLS = global.window.EARLY_GAME_POOLS;

const L36_SKILLS = [
    // tier3
    'KARA_REASON', 'YORI_COMPARE', 'NI_FREQUENCY', 'DE_MATERIAL',
    'TO_QUOTE', 'NI_PURPOSE', 'GA_BUT', 'TO_CONDITIONAL',
    // tier2
    'KARA_SOURCE_START', 'MADE_LIMIT_END', 'TO_WITH', 'DE_TOOL_MEANS',
    'HE_DIRECTION', 'NI_TARGET', 'NI_DESTINATION', 'MO_COMPLETE_NEGATION',
    'TO_AND', 'DE_SCOPE',
    // tier1
    'NI_TIME', 'NI_EXIST_PLACE', 'YA_AND_OTHERS', 'WA_TOPIC_BASIC',
    'NO_POSSESSIVE', 'GA_INTRANSITIVE', 'WO_OBJECT_BASIC',
    'DE_ACTION_PLACE', 'GA_EXIST_SUBJECT', 'MO_ALSO_BASIC'
];

// Collect all combos across all L36 skills
const allEntries = []; // { skill, j, zh, key }
let totalRows = 0;

for (const skillId of L36_SKILLS) {
    const skillPool = EARLY_GAME_POOLS.skills[skillId] || {};
    const combos = skillPool.safeCombos || [];
    for (const combo of combos) {
        totalRows++;
        const j = (combo.j || '').trim();
        const zh = (combo.zh || '').trim();
        // Key used by collectL36Questions: zh + "|" + segments text
        // For the source pool, the "j" field IS the final Japanese sentence
        // (the blank is replaced at generation time from this template)
        // So we use "j" as the canonical sentence identifier for data-level dedup check
        allEntries.push({ skillId, j, zh, key: j + '|' + zh });
    }
}

// --- Analysis 1: deduplicate by "j" (Japanese sentence string) ---
const jMap = new Map(); // j → [{skillId, zh}]
for (const e of allEntries) {
    if (!jMap.has(e.j)) jMap.set(e.j, []);
    jMap.get(e.j).push({ skillId: e.skillId, zh: e.zh });
}

const uniqueJ = jMap.size;

// --- Analysis 2: deduplicate by "j + zh" (same sentence + same Chinese) ---
const fullKeyMap = new Map(); // key → [{skillId}]
for (const e of allEntries) {
    if (!fullKeyMap.has(e.key)) fullKeyMap.set(e.key, []);
    fullKeyMap.get(e.key).push(e.skillId);
}
const uniqueFull = fullKeyMap.size;

// --- Find duplicates ---
const jDuplicates = [];
for (const [j, entries] of jMap) {
    if (entries.length > 1) {
        jDuplicates.push({ j, count: entries.length, entries });
    }
}
jDuplicates.sort((a, b) => b.count - a.count);

const fullDuplicates = [];
for (const [key, skills] of fullKeyMap) {
    if (skills.length > 1) {
        const [j, zh] = key.split('|');
        fullDuplicates.push({ j, zh, count: skills.length, skills });
    }
}
fullDuplicates.sort((a, b) => b.count - a.count);

// --- Per-skill combo counts ---
const skillCounts = {};
for (const skillId of L36_SKILLS) {
    skillCounts[skillId] = (EARLY_GAME_POOLS.skills[skillId]?.safeCombos || []).length;
}

// --- Output ---
console.log('=== L36 Source Pool Audit ===\n');
console.log(`Total source rows (all combos across 28 skills): ${totalRows}`);
console.log(`Unique by Japanese sentence (j field):           ${uniqueJ}`);
console.log(`Unique by j + zh combined key:                   ${uniqueFull}`);
console.log(`\nData-level duplicates (same "j" in multiple skills): ${jDuplicates.length}`);
console.log(`Data-level duplicates (same "j"+"zh" key):            ${fullDuplicates.length}\n`);

if (jDuplicates.length > 0) {
    console.log('--- Duplicate Groups (by Japanese sentence) ---');
    for (const dup of jDuplicates) {
        console.log(`\n  j: "${dup.j}"  (appears ${dup.count}x)`);
        for (const e of dup.entries) {
            console.log(`    skill: ${e.skillId}  zh: "${e.zh}"`);
        }
    }
} else {
    console.log('No duplicate Japanese sentences found across skills.');
}

console.log('\n--- Per-skill combo counts ---');
for (const [id, count] of Object.entries(skillCounts)) {
    console.log(`  ${id.padEnd(24)} ${count} combos`);
}
