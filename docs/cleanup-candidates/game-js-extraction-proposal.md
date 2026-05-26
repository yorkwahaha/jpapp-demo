# `game.js` Quick Search Expansion + Safe Extraction Proposal

> M4 scope: proposal only. Do not implement extraction from this document.
> No runtime files were changed for this proposal.

## Current Branch State

- Branch: `main` (local; verify before editing).
- Mapping baseline: release `26052601`.
- Recent mapping / cleanup commits (newest first):
  - `694993d` refactor: harden monster codex display utils (`codex-display-utils.js` only)
  - `ff39938` docs: clarify game js mapping safety guidance
  - `5a3b27c` docs: propose game js extraction candidates
- M3 inventory: `docs/cleanup-candidates/game-js-legacy-candidates.md`.
- Long-running workflow: `docs/agent-goals/game-js-map-goal.md`.


## Plain-Language Decision Summary

- **Primary direction:** `game.js` **mapping / navigation / ownership docs** — not line-count slimming or broad modularization.
- **Dead-code cleanup:** inventory only (`game-js-legacy-candidates.md`); delete only with explicit approval and evidence.
- **Monster codex (2026-05-26):** M5 audit done; display utils hardened in `694993d` (`getDefaultMonsterSprite`, `isMonsterCodexUnlocked`, NaN guards). `game.js` keeps thin Vue glue (~35 lines). **Do not** pursue a glue factory unless a future task explicitly approves it.
- **Dev-only feedback trace:** **暫緩** — see §2 audit note; adjacent to `checkAnswer` / feedback voice; not the next cleanup target.
- **Do not rush module extraction.** Future work stays small, bounded, and user-approved per `game-js-map-goal.md` Implementation Approval Gate.
- **Never start with:** audio, question generation, `checkAnswer`, `grantRewards`, timer/ATB, save migration, battle core, or codex wheel runtime.

## Implementation Readiness Ranking

### 1. Completed small pass (do not re-open without new scope)

#### Monster codex display computed wrapper

- **Status (2026-05-26):** M5 audit complete; utils-only hardening landed in `694993d`. Entry build/formatting lives in `codex-display-utils.js`; `game.js` retains Vue refs + thin computed/handlers only.
- **Glue factory:** **Not recommended** — diminishing returns; adjacency to shared codex `keydown` / BGM duck ref.
- **Further display tweaks:** Prefer `codex-display-utils.js` and `enemies.v1.json` (data); avoid `game.js` unless glue wiring is unavoidable.
- **Smoke test (if touching utils again):** map HUD monster codex — locked/unlocked cards, detail stats, portrait `@error` fallback.

### 2. Possible later, after more audit

#### Dev-only feedback trace flag

- **Why it might be possible:** It appears to be debug logging only.
- **Why it still needs caution:** It is near feedback / answer-result behavior, so it must not change voice, combo, timing, or `checkAnswer` behavior.
- **Implementation recommended now:** No. **Status: 暫緩** (audit 2026-05-26 — see §2 audit note).

#### Save-slot display formatting fallbacks

- **Why it might be possible:** Primary helpers already exist in `assets/js/game-utils.js`.
- **Why it still needs caution:** The remaining inline code may be a boot fallback. Removing it without proving load order could break save-slot display.
- **Implementation recommended now:** No.

#### Spirit codex non-runtime display helpers

- **Why it might be possible:** Some pure helper code already lives in `assets/js/spirit-codex-helpers.js`.
- **Why it still needs caution:** It is close to the active resonance wheel, so any task must avoid drag, inertia, phase, detail, and animation logic.
- **Implementation recommended now:** No.

### 3. Defer

#### Dev jump wrapper and debug attachment surface

- **Reason:** It is dev-only, but it touches level jump and battle entry surfaces. Leave it for later.
- **Implementation recommended now:** No.

#### Already-isolated mentor pure helpers

- **Reason:** The helper module already exists, but mentor audio, typing, video, and map-flow behavior are sensitive. Use docs-only improvements for now.
- **Implementation recommended now:** No.

### 4. Do not touch

Do not implement extraction in these areas in the near future:

- Audio / TTS / BGM / fanfare.
- Question generation / choices / fallback questions.
- `checkAnswer`.
- `grantRewards`.
- Timer / ATB.
- Save migration.
- Battle core.
- Codex wheel runtime, drag, inertia, RAF, detail timing, and animation.

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
- **Audit note 2026-05-26:** `traceFeedbackDebug` is defined in `assets/js/game.js` near L9937 and guarded by `window.JPAPP_DEBUG_FEEDBACK`; `docs/code-ownership-map.md` lists the flag as a feedback voice trace flag. The guard is dev-only in normal use because it only emits `console.debug` when manually enabled, but its call sites sit inside feedback voice and answer-resolution flow (`playFeedbackVoice` / `playCorrectFeedback` near L10035-L10124, `checkAnswer` trace calls near L10401 and L10504). A runtime cleanup here could affect production if it changes call ordering, payload evaluation, audio timing, combo timing, or answer judgment. It crosses hard-limit areas for this milestone: audio/feedback voice and `checkAnswer`; it is adjacent to combo and battle flow. **Next step recommendation:** 暫緩; do not choose this as the next lowest-risk cleanup candidate unless a later task is explicitly logging-only and avoids editing feedback playback or answer judgment.

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
- **Validation if utils touched again:** `node --check assets/js/codex-display-utils.js`; map HUD monster codex smoke (locked/unlocked, detail, image fallback).
- **Implementation recommended now:** No further work unless a new scoped task; utils pass done (`694993d`).
- **Audit note 2026-05-26 (M5, review-only):**
  - **Locations checked:** `assets/js/game.js` L1573–1574 (`isMonsterCodexOpen`, `selectedMonsterCodexId` refs inside `[ CODEX - STATE ]`), L2939–2971 (computed + handlers), L3004–3006 (shared `keydown` Escape branch), L4544 / L5557 (`isMonsterCodexOpen` in BGM UI duck scale); `assets/js/codex-display-utils.js` L100–237 (`formatMonster*` / `buildMonsterCodexEntry` / `buildMonsterCodexEntries`); `index.html` L257–274 (boot stub), L2402/L2526 (`openMonsterCodex` map HUD only), L2859–2917 (modal template); `assets/data/enemies.v1.json` via `ENEMIES` ref (`loadGameData` ~L3119).
  - **Display vs wrapper:** Entry assembly and stat formatting are **already** in `codex-display-utils.js` (2026-05-24 extraction). `game.js` retains a **thin** `monsterCodexEntries` computed (~10 lines) that passes `ENEMIES`, `clearedLevels`, `LEVEL_CONFIG`, and `DEFAULT_IMAGE_PATHS.monsterSprite` into `buildMonsterCodexEntries`, plus `selectedMonsterCodexEntry`, `openMonsterCodex`, `selectMonsterCodexEntry`, and `handleMonsterCodexImageError`. This is display/UI glue, not question/battle logic.
  - **Codex wheel runtime:** No calls to `setCodexWheelPhase`, drag/inertia, RAF, or `openCodexDetail`. **Physical adjacency risk only:** monster block sits immediately before spirit-codex `watch(isCodexOpen, …)` / wheel sync (~L2974+) and shares one `keydown` listener with `closeCodex()` + `resumeBattle()` for the **spirit** codex branch—do not edit those branches when touching monster codex.
  - **Battle core / rewards / save core:** Does **not** call `checkAnswer`, `grantRewards`, `generateQuestionBySkill`, timer/ATB, or `saveProgression`. Unlock display reads `clearedLevels` (loaded/saved elsewhere); `isUnlocked` is computed in utils as `spawnLevels.some(lv => clearedLevels.includes(lv))`—changing that formula would affect locked cards but not battle damage. `openMonsterCodex` does **not** call `pauseBattle`; `resumeBattle` (~L4204) does **not** gate on `isMonsterCodexOpen`. Entry points are **map HUD only** (`index.html`); proposal “battle context” smoke test is optional safety, not a current UI path.
  - **Production impact:** **Low–medium, UI-only** if scope stays formatting/display or moving Vue glue: wrong lock state, empty list, portrait fallback, or SFX on open/click. **Indirect audio:** `getBgmUiDuckScale` ducks BGM while `isMonsterCodexOpen`—any extraction must keep that ref wired; do not treat as “audio-free” (read-only coupling, not TTS/fanfare lifecycle).
  - **Remaining work if implemented later:** Mostly optional factory/composable to shrink `game.js` (~35 lines), or utils-only tweaks (labels, sort, `enemies.v1.json` fields)—**not** a large new extraction. Further thinning of the computed itself has diminishing returns.
  - **Next step recommendation:** **可實作** as the next **small, bounded** cleanup/extraction task **after** an explicit implementation milestone (not M5); prefer edits in `codex-display-utils.js` + `enemies.v1.json` for display data, and treat `game.js` changes as glue-only with map monster-codex smoke test (locked/unlocked, detail stats, image `@error`). **Do not** bundle with spirit codex wheel, feedback trace, or BGM lifecycle refactors. Safer than dev-only feedback trace; not zero risk due to `clearedLevels` semantics and shared codex `keydown` block.
  - **Implementation note 2026-05-26 (display utils only):** `codex-display-utils.js` — added `getDefaultMonsterSprite` / `isMonsterCodexUnlocked` (centralized sprite fallback + unlock rule); NaN guards on `formatMonsterEvasion` / `formatMonsterAttackInterval`. No `game.js` / `index.html` / wheel / audio changes. Valid `enemies.v1.json` rows should render identically; corrupt numeric fields show `未記錄` instead of `NaN%` / `NaN 秒`.

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

- **M5 (monster codex audit):** **Done** (review-only audit + utils hardening `694993d`; no glue factory).
- **M6 (optional):** Comment-only navigation anchors in `game.js` per `game-js-map-goal.md` — only if docs still show findability gaps.
- **Default next agent work:** **Docs / navigation consistency** and symbol tables in `game-js-map.md` + `code-ownership-map.md` — not runtime extraction or `game.js` slimming.
- **Do not** pick dev-only feedback trace, codex wheel runtime, or save-slot fallback removal without a dedicated approved task.
