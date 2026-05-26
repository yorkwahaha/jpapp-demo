# `game.js` Quick Search Expansion + Safe Extraction Proposal

> M4 scope: proposal only. Do not implement extraction from this document.
> No runtime files were changed for this proposal.

## Current Branch State

- Branch: `experiment/game-js-goal-map`
- Working tree before this proposal: clean.
- Latest local commits:
  - `0d7e18a docs: inventory game js legacy cleanup candidates`
  - `e676657 docs: add game js mapping goal spec`
  - `bbb9d40 docs(game): add game js navigation anchors`
  - `afd59c8 docs: sync game js map and ownership entries`
  - `26c5216 chore: release 26052601 codex resonance layout`
- Current mapping baseline remains release `26052601`.
- This proposal assumes the M3 inventory at `docs/cleanup-candidates/game-js-legacy-candidates.md` is the active legacy/dead-code reference.

## Quick Search Table

Use these searches before opening broad line ranges. Prefer opening only the relevant symbol block after `rg` returns the current line.

| Task | Start with `rg` | Open first | Avoid |
|------|------------------|------------|-------|
| Review dev jump/debug attach | `rg -n "debugJumpToLevel|__attachDebugTools|window\\.debugJumpToLevel" assets/js/game.js assets/js/debug.js` | `assets/js/game.js` near `debugJumpToLevel`; `assets/js/debug.js` near `__attachDebugTools` | Battle entry changes unless explicitly approved |
| Review question mix debug hook | `rg -n "__debugQMix" assets/js/game.js docs` | Docs first, then `game.js` only if a debug task is approved | Question generation implementation |
| Review save-slot display formatting | `rg -n "formatSaveSlotTime|calculateSaveSlotResonanceText|saveSlotCards" assets/js/game.js assets/js/game-utils.js docs` | `assets/js/game-utils.js`; `game.js` computed only for binding context | Save migration, `saveProgression`, `loadProgression` |
| Review monster codex display helpers | `rg -n "monsterCodexEntries|buildMonsterCodexEntries|formatMonsterCodexValue" assets/js/game.js assets/js/codex-display-utils.js docs` | `assets/js/codex-display-utils.js`; `game.js` computed wrapper | Codex wheel runtime, drag/RAF, battle overlay state |
| Review spirit codex pure helpers | `rg -n "orderCodexWheelSkillsForResonance|SPIRIT_RESONANCE_VISUAL_ORDER|getMastery|affinity" assets/js/spirit-codex-helpers.js assets/js/game.js docs` | `assets/js/spirit-codex-helpers.js` | `setCodexWheelPhase`, drag, inertia, RAF |
| Review mentor helper isolation | `rg -n "paginateMentorDialogue|resolveMentorEmotionImage|isLastMentorLine|setupMentorDialogue|getMentorAudioPath" assets/js/game.js assets/js/mentor-dialogue-helpers.js docs/mentor-dialogue-map.md` | `assets/js/mentor-dialogue-helpers.js`; docs before `game.js` | Mentor audio, video playback, typing/audio tokens |
| Review existing low-risk extraction notes | `rg -n "Phase 1|已外移|未來可外移|DO NOT TOUCH" docs/game-js-map.md docs/mentor-dialogue-map.md docs/code-ownership-map.md` | Docs only | Runtime files |

## Candidate Extraction Areas

All candidates below are proposal-only. Implementation is not recommended now.

### 1. Dev jump wrapper and debug attachment surface

- **Current location / symbols:** `assets/js/game.js` near `debugJumpToLevel`, `window.debugJumpToLevel`, `window.__attachDebugTools?.(...)`; `assets/js/debug.js` `window.__attachDebugTools`.
- **Why it might be extractable later:** This is dev-only surface area and already has a separate `debug.js` attachment point.
- **Required dependencies:** Vue refs passed from `game.js`, level config, current player/monster state, mentor refs, debug panel state, and any level-jump side effects currently performed by `debugJumpToLevel`.
- **Risk level:** Medium.
- **What must not be touched:** `startLevel`, `initGame`, battle entry behavior, save/load core, mentor audio/runtime, question generation, and reward/EXP behavior.
- **Validation needed if implemented later:** `node --check assets/js/game.js`; `node --check assets/js/debug.js`; manual dev-tools smoke test for level jump, home jump, mentor debug dialogue, and normal app boot.
- **Implementation recommended now:** No.

### 2. Dev-only feedback trace flag

- **Current location / symbols:** `assets/js/game.js` `window.JPAPP_DEBUG_FEEDBACK` guard around feedback trace logging.
- **Why it might be extractable later:** The flag is only used for debug logging and could eventually be documented or centralized with other dev flags.
- **Required dependencies:** Current feedback event payload shape and any console/debug expectations.
- **Risk level:** Low.
- **What must not be touched:** Feedback playback, correct/incorrect voice behavior, `checkAnswer`, combo timing, and reward triggers.
- **Validation needed if implemented later:** `node --check assets/js/game.js`; run with `window.JPAPP_DEBUG_FEEDBACK = true` and verify only logging behavior changes.
- **Implementation recommended now:** No.

### 3. Save-slot display formatting fallbacks

- **Current location / symbols:** `assets/js/game.js` fallback destructuring for `formatSaveSlotTime`, `calculateSaveSlotResonanceText`; primary implementations in `assets/js/game-utils.js`.
- **Why it might be extractable later:** Primary display helpers are already isolated in `game-utils.js`; remaining inline versions are boot fallbacks.
- **Required dependencies:** `window.__JPAPP_UTILS`, `slotProgressionKey(slotId)`, save-slot metadata, and `saveSlotCards` computed binding.
- **Risk level:** Medium.
- **What must not be touched:** `PROGRESSION_KEY`, slot migration, `saveProgression`, `loadProgression`, `clearSaveSlotStorage`, `confirmDeleteSaveSlot`, and active-slot selection.
- **Validation needed if implemented later:** `node --check assets/js/game.js`; smoke test empty slots, populated slots, invalid timestamps, resonance text, and old save metadata.
- **Implementation recommended now:** No.

### 4. Monster codex display computed wrapper

- **Current location / symbols:** `assets/js/game.js` `monsterCodexEntries`, `selectedMonsterCodexEntry`, `openMonsterCodex`, `selectMonsterCodexEntry`; helper module `assets/js/codex-display-utils.js`.
- **Why it might be extractable later:** Entry building and formatting are already in `codex-display-utils.js`; `game.js` mostly holds Vue state and thin wrappers for the monster index.
- **Required dependencies:** `ENEMIES`, unlock/progress state, selected monster id, image fallback handling, and `JPAPPCodexDisplayUtils`.
- **Risk level:** Low to medium.
- **What must not be touched:** Codex wheel runtime, wheel sorting/phase/drag/RAF, battle overlay pausing, active spirit codex state, and map HUD entry points.
- **Validation needed if implemented later:** `node --check assets/js/game.js`; `node --check assets/js/codex-display-utils.js`; open monster codex from map and battle contexts; verify locked/unlocked entries and image fallback.
- **Implementation recommended now:** No.

### 5. Spirit codex non-runtime display helpers

- **Current location / symbols:** `assets/js/spirit-codex-helpers.js` helper exports; `assets/js/game.js` calls around `codexWheelSkills`, `getCodexSkillDisplayName`, mastery/affinity display.
- **Why it might be extractable later:** Pure ordering and display helpers are already partially isolated, and future display-only helpers should prefer this module.
- **Required dependencies:** `skillsAll`, unlocked skill ids, `skillMastery`, current display labels, and helper boot availability.
- **Risk level:** Medium.
- **What must not be touched:** `codexWheelPhase`, `setCodexWheelPhase`, drag/inertia timers, `openCodexDetail`, close/pause behavior, animation state, and codex wheel RAF.
- **Validation needed if implemented later:** `node --check assets/js/game.js`; `node --check assets/js/spirit-codex-helpers.js`; open codex, rotate wheel, open/close detail, verify resonance order and mastery labels.
- **Implementation recommended now:** No.

### 6. Already-isolated mentor pure helpers

- **Current location / symbols:** `assets/js/mentor-dialogue-helpers.js` `paginateMentorDialogue`, `resolveMentorEmotionImage`, `isLastMentorLine`; `assets/js/game.js` computed/wrapper usage near mentor state.
- **Why it might be extractable later:** The pure helper layer already exists. A future pass may only document or lightly tighten wrapper boundaries if needed.
- **Required dependencies:** `mentor-dialogues.v1.json`, mentor page emotion arrays, failed image path set, scene image path constants, and Vue computed state.
- **Risk level:** Medium.
- **What must not be touched:** `setupMentorDialogue`, `finishMentorDialogue`, `_resumeAfterMentor`, mentor audio, video playback, typing timers, `getMentorAudioPath`, BGM/SFX/TTS, and map flow.
- **Validation needed if implemented later:** `node --check assets/js/game.js`; `node --check assets/js/mentor-dialogue-helpers.js`; map-only mentor smoke test for prologue, stage confirm guidance, skip/next paging, and image fallback.
- **Implementation recommended now:** No.

## Do Not Extract Yet

These areas remain out of scope unless a future task explicitly approves a dedicated implementation pass:

- Audio / TTS / BGM / fanfare / iOS gesture resume.
- Question generation, including `generateQuestionBySkill`, `getChoices`, `safeFallbackQuestion`, boss queues, and question mix selection.
- `checkAnswer`, answer judgment, damage, combo, feedback timing, and `nextQuestion`.
- `grantRewards`, EXP, unlocks, result fanfare trigger, save writes, and reward animation.
- Timer / ATB, including `runTimerLogic`, `startTimer`, timeout behavior, and pause/resume timing.
- Save migration and save/load core, including progression keys, slot migration, and destructive slot actions.
- Battle core, battle entry, damage, projectile timing, potions, skills, revive, run-away, and battle state reset.
- Codex wheel runtime, including phase state, drag/inertia, RAF, detail open/close timing, and wheel animation.

## Recommended Next Milestone

M5 should remain review-only unless explicitly approved. Recommended M5 focus: frozen-zone audit and documentation clarification only, especially around the boundaries that future agents must not cross when working near debug helpers, display helpers, mentor wrappers, codex display helpers, and save-slot display.
