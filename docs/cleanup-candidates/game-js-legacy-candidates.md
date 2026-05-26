# `game.js` Legacy / Dead-Code Candidate Inventory

> M3 scope: inventory only. Do not delete, move, extract, or refactor from this report.
> Hard exclusions honored: audio/TTS/BGM/fanfare, question generation, choices, `checkAnswer`, rewards, timer/ATB, save migration, battle core, codex wheel runtime, mobile HUD, battle question layout, map HUD, and active player-facing logic.

## Summary

This inventory records cleanup candidates and stale references that may deserve a later, separately approved cleanup pass. Most candidates are not safe to delete now because they are boot fallbacks, public `window` contracts, debug hooks, or adjacent to frozen runtime zones.


## Plain-Language Decision Summary

Use this file as a **warning list**, not as a deletion plan. None of the 12 candidates should be deleted now.

### Safest docs-only cleanup candidates

These can be reviewed later as documentation cleanup only:

- **#1 Docs-only stale battle mentor modal references** — consolidate docs wording, but do not touch mentor runtime.
- **#10 `clearedCountText` historical docs note** — likely docs-only history cleanup.
- **#11 Old codex/book/card naming residue in docs** — terminology cleanup only; do not touch active `knowledge-card-*` code.
- **#12 Completed-cleanup table in `game-js-map.md`** — decide whether to archive old history elsewhere.

### Needs more evidence before any code change

- **#2 VFX boot shims** — may be boot insurance.
- **#3 moved-code comment** — low risk, but not important.
- **#4 SP legacy DOM update path** — SP gameplay is active; separate DOM no-op from active helpers first.
- **#5 inline `game-utils` fallbacks** — may be required if helper loading fails.
- **#6 `debugControls` / `heroBuffs` fallback** — may protect debug/buff display.
- **#8 `debugJumpToLevel`** — dev-only, but touches battle entry surfaces.
- **#9 praise toast residue** — may affect feedback timing or presentation.

### Do not touch in the near future

- **#7 `window.__debugQMix`** — it is inside question-generation territory. Treat as frozen.

### Default rule

If a future cleanup task cannot prove that a candidate is docs-only or comment-only, stop and ask for explicit approval.

## Candidates

### 1. Docs-only stale references to removed battle mentor modal

- **Symbol / keyword / approximate location:** `.mentor-overlay`, `isMentorModalOpen`, `triggerMentorDialogue`, `skipMentor`, `withMentor`, `forceMentor`, `_disableMentorAutoTrigger`, `isMentorPortraitError`; docs around `docs/mentor-dialogue-map.md`, `docs/game-js-map.md`, `docs/css-map.md`.
- **Evidence from `rg` / search:**
  - `rg -n "isMentorModalOpen|triggerMentorDialogue|skipMentor|withMentor|forceMentor|_disableMentorAutoTrigger|isMentorPortraitError|mentor-overlay|mentor modal|battle mentor" ...`
  - Hits are documentation notes and active map mentor selectors: `docs/mentor-dialogue-map.md:15`, `docs/mentor-dialogue-map.md:112`, `docs/game-js-map.md:459`, `docs/css-map.md:27`, `assets/css/mentor.css:1`, `index.html:2638` for `.map-mentor-overlay`.
  - No `assets/js/game.js` hit for the removed battle modal symbols in that search.
- **Why it may be legacy or cleanup-worthy:** The modal symbols are documented as removed. The docs still carry repeated historical notes that may be useful now, but could become stale noise after enough releases.
- **Risk level:** Low for docs-only consolidation; high for runtime changes because mentor runtime is frozen.
- **Safe to delete now:** No.
- **Validation required before deletion:** Re-run the mentor-modal symbol search across `assets/js/game.js`, `index.html`, `assets/css`, and docs; verify map mentor docs still clearly warn not to restore battle mentor; run `git diff --check`.
- **Related freeze zone:** Mentor runtime / mentor audio / map flow.

### 2. `game.js` VFX boot shims after helper extraction

- **Symbol / keyword / approximate location:** `spawnFloatingDamage`, `spawnGiraGiraHitVfx`, `spawnGiraGiraBurstVfx`, `rectCenter`, `getCenterOrFallback`, `getVfxLayer`, `spawnProjectile`; `assets/js/game.js` lines ~1-60.
- **Evidence from `rg` / search:**
  - `rg -n "rectCenter|getVfxLayer|spawnProjectile|spawnFloatingDamage|spawnGiraGiraHitVfx|spawnGiraGiraBurstVfx|spawnSkillActivationVfx" ...`
  - `assets/js/vfx-helpers.js:891-910` exports and assigns the same helper family to `window`.
  - `assets/js/game.js:4-59` keeps local fallbacks and `window.*` assignments.
  - `docs/game-js-map.md:35` calls this section "Global - VFX shims"; `docs/game-js-map.md:502` notes no formal header and suggests `rg rectCenter`.
- **Why it may be legacy or cleanup-worthy:** The helper implementation now lives in `vfx-helpers.js`, so the top-of-file copies are mostly boot insurance and compatibility shims.
- **Risk level:** Medium.
- **Safe to delete now:** No.
- **Validation required before deletion:** Confirm script load order in `index.html`; verify every call site still resolves through `window.JPAPPVfxHelpers` / `window.*`; run `node --check assets/js/game.js`; perform battle VFX smoke tests for damage numbers, projectiles, boss VFX, and skill activation VFX.
- **Related freeze zone:** Battle VFX adjacent; avoid battle core and projectile behavior changes.

### 3. `window.spawnSkillActivationVfx` moved-code comment

- **Symbol / keyword / approximate location:** `// window.spawnSkillActivationVfx - moved to assets/js/skill-vfx.js`; `assets/js/game.js` line ~7.
- **Evidence from `rg` / search:**
  - `assets/js/game.js:7` contains the moved-code comment.
  - `assets/js/skill-vfx.js:12-15` declares the `window.spawnSkillActivationVfx` runtime path.
  - `assets/js/game.js:3330` still calls `window.spawnSkillActivationVfx(id)`.
- **Why it may be legacy or cleanup-worthy:** The comment documents a past extraction and may eventually be unnecessary once the map docs and load order are trusted.
- **Risk level:** Low.
- **Safe to delete now:** No.
- **Validation required before deletion:** Verify `skill-vfx.js` load order and `game-js-map.md` still documents ownership; run `git diff --check`. If any runtime file is touched in a later pass, also run `node --check assets/js/game.js`.
- **Related freeze zone:** Skill VFX / battle display, but not battle logic.

### 4. SP legacy DOM update path

- **Symbol / keyword / approximate location:** `window.updateSpUI`, `#spFill`, `#spText`; `assets/js/game.js` lines ~61-100.
- **Evidence from `rg` / search:**
  - `rg -n "#spFill|spFill|spText|updateSpUI|window\\.__sp|regenSP\\(|spendSP\\(|canAffordSP\\(" ...`
  - `assets/js/game.js:61-96` defines `updateSpUI`, `canAffordSP`, `spendSP`, `regenSP`, and `resetSP`.
  - `assets/js/game.js:3143-3144` wraps `window.__sp` in Vue reactivity.
  - `assets/js/game.js:3316`, `assets/js/game.js:3320`, `assets/js/game.js:10435` show active SP gameplay use.
  - `docs/game-js-map.md:36` marks `updateSpUI` / `#spFill` as a legacy no-op DOM path because the DOM was removed.
- **Why it may be legacy or cleanup-worthy:** The direct DOM update path appears superseded by Vue `spState`, while SP itself remains active.
- **Risk level:** Medium.
- **Safe to delete now:** No.
- **Validation required before deletion:** Prove `#spFill` / `#spText` have no active HTML binding; separate the DOM no-op path from active SP helpers; run `node --check assets/js/game.js`; smoke test skill spend, SP regen, level-up max SP, and visible SP HUD.
- **Related freeze zone:** Battle HUD / SP gameplay adjacent.

### 5. Inline `game-utils` fallback destructuring

- **Symbol / keyword / approximate location:** `formatSaveSlotTime`, `calculateSaveSlotResonanceText`, `normalizeStageBestRecord`, `pickOne`, `pickMany`; `assets/js/game.js` lines ~113-136.
- **Evidence from `rg` / search:**
  - `rg -n "formatSaveSlotTime =|calculateSaveSlotResonanceText =|window\\.__JPAPP_UTILS|JPAPP_UTILS" ...`
  - `assets/js/game-utils.js:52` and `assets/js/game-utils.js:80` define the extracted save-slot display helpers.
  - `assets/js/game-utils.js:135-136` publishes `window.JPAPP_UTILS` / `window.__JPAPP_UTILS`.
  - `assets/js/game.js:118-136` still defines inline fallback implementations.
  - `docs/game-js-map.md:386-387` says these helpers were moved to `game-utils.js`; `docs/game-js-map.md:427-428` says setup fallbacks remain.
- **Why it may be legacy or cleanup-worthy:** The inline implementations are fallback copies after extraction.
- **Risk level:** Medium.
- **Safe to delete now:** No.
- **Validation required before deletion:** Verify `game-utils.js` always loads before `game.js`; test save-slot cards with empty, populated, corrupt, and old metadata; run `node --check assets/js/game.js` and `git diff --check`.
- **Related freeze zone:** Save-slot display boundary; avoid save migration and save/load core.

### 6. `debugControls` / `heroBuffs` fallback object

- **Symbol / keyword / approximate location:** `debugControls`, `heroBuffs`; `assets/js/game.js` lines ~1451-1460 and Vue return line ~11612.
- **Evidence from `rg` / search:**
  - `rg -n "__debugQMix|debugJumpToLevel|JPAPP_DEBUG_FEEDBACK|debug helper|debug tools|debugControls|__attachDebugTools" ...`
  - `assets/js/game.js:1451` defines `debugControls` as a fallback when `heroBuffs` is unavailable.
  - `assets/js/game.js:11612` returns `heroBuffs: ... ? heroBuffs : debugControls`.
  - `docs/game-js-map.md:434` notes the Vue return for `debugControls` was removed, while the constant remains as a `heroBuffs` fallback.
- **Why it may be legacy or cleanup-worthy:** It appears to be a compatibility/debug fallback for an otherwise active internal state object.
- **Risk level:** Medium.
- **Safe to delete now:** No.
- **Validation required before deletion:** Confirm `heroBuffs` is always defined before Vue return in all battle paths and debug tooling; run `node --check assets/js/game.js`; smoke test dev tools and buff/debuff displays.
- **Related freeze zone:** Dev tools / battle status display; avoid battle core.

### 7. Dev-only `window.__debugQMix`

- **Symbol / keyword / approximate location:** `window.__debugQMix`; `assets/js/game.js` lines ~7820-7865.
- **Evidence from `rg` / search:**
  - `assets/js/game.js:7820-7821` documents and assigns `window.__debugQMix`.
  - `docs/code-ownership-map.md:130` lists `window.__debugQMix` as question-pool distribution debug.
  - `docs/game-js-map.md:472` says it is dev console only.
- **Why it may be legacy or cleanup-worthy:** It is a global debug helper, not direct player UI.
- **Risk level:** High for this milestone because it sits inside frozen question generation territory.
- **Safe to delete now:** No.
- **Validation required before deletion:** Only in an explicitly approved question-pool/debug milestone. Confirm no docs or QA scripts rely on it; run `node --check assets/js/game.js`; validate question-pool debugging alternative.
- **Related freeze zone:** Question generation / question mix.

### 8. Dev-only `window.debugJumpToLevel`

- **Symbol / keyword / approximate location:** `debugJumpToLevel`, `window.debugJumpToLevel`, `__attachDebugTools`; `assets/js/game.js` lines ~11513-11585.
- **Evidence from `rg` / search:**
  - `assets/js/game.js:11513` defines `debugJumpToLevel`.
  - `assets/js/game.js:11563` assigns `window.debugJumpToLevel`.
  - `assets/js/game.js:11581` passes refs to `window.__attachDebugTools`.
  - `assets/js/debug.js:2` defines `window.__attachDebugTools`.
  - `docs/code-ownership-map.md:117` marks this as dev-only.
- **Why it may be legacy or cleanup-worthy:** It is developer tooling in the main runtime file and may later be a candidate for stronger isolation.
- **Risk level:** Medium.
- **Safe to delete now:** No.
- **Validation required before deletion:** Confirm no current manual QA flow depends on level jump; verify `debug.js` behavior; run `node --check assets/js/game.js` and `node --check assets/js/debug.js`; smoke test normal launch.
- **Related freeze zone:** Dev/bootstrap caution; may touch battle entry if changed.

### 9. Praise toast residue after central UI removal

- **Symbol / keyword / approximate location:** `praiseToast`, `showPraise`; `assets/js/game.js` lines ~9925-10115, `index.html` line ~3523.
- **Evidence from `rg` / search:**
  - `rg -n "requestNewGame|clearedCountText|praiseToast|levelTitle|stageConfirmSuspendedForMentor|codexPage|setCodexSelectedIndex|shiftCodexWheel|currentQuestionBondMax|stageBestRecords" ...`
  - `index.html:3523` comments that the central praise toast layer is disabled while `game.js` `praiseToast` / `showPraise` remain.
  - `assets/js/game.js:9925-10115` still defines and updates `praiseToast`.
  - `docs/game-js-map.md:443` says the Vue return was removed but the body remains.
- **Why it may be legacy or cleanup-worthy:** UI binding appears disabled, leaving state/timer logic that may not currently render.
- **Risk level:** Medium.
- **Safe to delete now:** No.
- **Validation required before deletion:** Search for all `showPraise` call sites; verify no feedback voice or result flow depends on the timer; run `node --check assets/js/game.js`; smoke test correct-answer feedback and combo feedback.
- **Related freeze zone:** Feedback presentation adjacent; avoid `checkAnswer` and battle logic.

### 10. `saveSlotCards.clearedCountText` historical docs note

- **Symbol / keyword / approximate location:** `clearedCountText`; docs only, especially `docs/game-js-map.md:447`.
- **Evidence from `rg` / search:**
  - `rg -n "requestNewGame|clearedCountText|..." ...`
  - Only `docs/game-js-map.md:447` appeared for `clearedCountText` in that search.
- **Why it may be legacy or cleanup-worthy:** The docs still carry a completed-removal note for a field that no longer appears in runtime.
- **Risk level:** Low.
- **Safe to delete now:** No.
- **Validation required before deletion:** Re-run a focused `rg -n "clearedCountText"` across the repo; confirm historical cleanup table policy allows pruning; run `git diff --check`.
- **Related freeze zone:** None for docs-only cleanup; save-slot display boundary if runtime is touched.

### 11. Old codex/book/card naming residue in docs

- **Symbol / keyword / approximate location:** "Codex book", "knowledge card", "card" naming; `docs/css-map.md`, `docs/game-js-map.md`, `index.html`, `assets/css/codex.css`.
- **Evidence from `rg` / search:**
  - `rg -n "codex book|Codex book|book UI|knowledge card|knowledge-card|card naming|monster codex|spirit codex|codexDetailMode|isCodexOpen|openCodexDetail" ...`
  - `docs/css-map.md:59` labels a section "Codex/book UI".
  - `assets/css/codex.css:3-31` and `index.html:4070-4100` use active `knowledge-card-*` selectors.
  - `docs/game-js-map.md:475` warns knowledge card queue is active and not old card-flip dead code.
- **Why it may be legacy or cleanup-worthy:** Some "book/card" terms are historical UI names and can be confused with active knowledge-card runtime.
- **Risk level:** Low for docs-only terminology tightening; high for runtime deletion because knowledge cards and codex UI are active.
- **Safe to delete now:** No.
- **Validation required before deletion:** Keep active `knowledge-card-*` and codex modal terms intact; update only stale prose if a docs cleanup is approved; run `git diff --check`.
- **Related freeze zone:** Codex wheel runtime; knowledge-card unlock/result flow.

### 12. Completed-cleanup table in `game-js-map.md`

- **Symbol / keyword / approximate location:** `docs/game-js-map.md` section "已完成（runtime 已移除）", lines ~420-459.
- **Evidence from `rg` / search:**
  - `docs/game-js-map.md:425-459` lists many completed removals such as `skillCorrectCounts`, `requestNewGame`, `debug.js` old refs, legacy corner menu, and battle mentor modal.
  - Related searches for `clearedCountText`, battle mentor symbols, and old debug refs show those are docs/history entries rather than current `game.js` code.
- **Why it may be legacy or cleanup-worthy:** The table is useful history, but it may eventually become stale-reference noise in a navigation map.
- **Risk level:** Low for docs-only archival; medium if removed without preserving migration context.
- **Safe to delete now:** No.
- **Validation required before deletion:** Decide whether completed history should move to this cleanup-candidates folder or remain in the main map; re-run targeted `rg` for each historical symbol before pruning; run `git diff --check`.
- **Related freeze zone:** Depends on symbol; includes save, mentor, codex, debug, and CSS history.

## Explicit Non-Candidates

- Audio, TTS, BGM, fanfare, audio debug, and mentor audio fallback paths.
- Question generation, `getChoices`, `safeFallbackQuestion`, `checkAnswer`, `grantRewards`, timers, ATB, battle core, save migration, and codex wheel runtime.
- Active `knowledge-card-*` selectors and queue logic.
- Active map mentor overlay (`isMapMentorOpen`, `.map-mentor-overlay`) and stage-confirm mentor flow.
- Active SP gameplay helpers (`canAffordSP`, `spendSP`, `regenSP`) unless a future task isolates only the legacy DOM no-op path.
