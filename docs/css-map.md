# JPAPP styles.css Code Map

This document maps `assets/css/styles.css` and proposes a safe CSS split plan. Line numbers are approximate and should be refreshed before each move because the file is actively changing.

## Current CSS Load Order

`index.html` currently loads CSS in this order:

1. `assets/css/styles.css?v=26050901`
2. `assets/css/home.css?v=26050901`
3. `assets/css/settings.css?v=26050901`
4. `assets/css/mentor.css?v=26050901`
5. `assets/css/battle.css?v=26050901`
6. `assets/css/battle-vfx.css?v=26050901`
7. `assets/css/codex.css?v=26050901`
8. `assets/css/result-mistakes.css?v=26050901`
9. `assets/css/escape.css?v=26050901`

Future split files should preserve cascade intent by keeping broad/base rules first, feature rules next, RWD overrides late, and `escape.css` last unless its scope is audited separately. **逃跑回地圖：** `.escape-fade-overlay`（`index.html` ~L5181+）由 `handleEscapeToMap` → `returnToMap`；流程見 `game-js-map.md` §地圖流程。

Recommended future order:

1. `assets/css/styles.css` - temporary main entry, base variables, legacy leftovers
2. `assets/css/layout.css` - common layout, modal primitives, shared HUD/base panels
3. `assets/css/home.css` - home cover/title/menu/start screen and home-only keyframes
4. `assets/css/settings.css` - settings, system menu, shared modal controls
5. `assets/css/mentor.css` - **map** mentor overlay helpers (prologue iOS, `.mentor-scene-video`); battle `.mentor-overlay` removed 2026-05-24
6. `assets/css/map.css` - map screen, map HUD, nodes, map ambience
7. `assets/css/battle.css` - battle screen base, HUD, HP/SP, question, options, resonance wheel
8. `assets/css/battle-vfx.css` - battle animations, boss death, hit, projectile, skill VFX
9. `assets/css/codex.css` - monster codex, spirit codex/book UI, unlock cards
10. `assets/css/result-mistakes.css` - result modal, mistakes/stage log, stage records modal
11. `assets/css/rwd.css` - four-mode RWD overrides: iPhone, iPad portrait, iPad landscape, desktop
12. `assets/css/escape.css` - keep last until escape UI dependency is audited

## Section Map

| Approx. Lines | Section | Purpose | Risk | Target CSS | First Batch? | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| L1-L90 | Global/base + hero HP restore | Body defaults, scrollbar/viewport fixes, HP bar restoration | Medium | `styles.css` / `layout.css` | No | Early globals can affect every screen. Keep in legacy until variables/base strategy is defined. |
| L91-L748 | Early battle primitives and effects | Monster shake/hit, stage sizing, HUD base, question text, modal base, hero status pills | High | `battle.css` + `layout.css` + `battle-vfx.css` | No | Mixed battle layout, VFX, modal, and hero state. Needs second audit before moving. |
| L749-L930 | Hero avatar/status positioning | Data-driven `#heroAvatar`, status bar, toast/praise animation | High | `battle.css` | No | Coupled to JS inline style and battle buff overlay positioning. |
| L942-L1749 | Legacy mobile battle overrides | Mobile/tablet battle question, HUD structure, flick/projectile VFX, damage popups | High | `rwd.css` + `battle-vfx.css` | No | Contains structural Tailwind overrides and nested HUD selectors. Do not move until selector ownership is clearer. |
| ~~L1751-L1841~~ | ~~Corner menu mobile~~ | **Removed 2026-05-24** — legacy `#cornerMenu` FAB retired; battle actions use `#hud` `.battle-hud-actions`. | — | — | — | Was duplicate of V3 HUD; `corner-menu.js` deleted. |
| L1851-L2038 | Modal/question responsive tweaks | Question text responsive sizing, modal panel text, desktop/mobile adjustments | Medium | `layout.css` / `rwd.css` | No | Crosses battle question and modal primitives. Needs split by selector group. |
| L2044-L2458 | Battle polish package and audio debug UI | Battle log, monster entrance/breathing, question stone slots, flick option styling, audio debug overlay | High | `battle.css` + `battle-vfx.css`; keep `.audio-debug-*` in `styles.css` for now | No | Crosses core battle UI, Flick/TAP, VFX, and audio diagnostics. In current CSS, dev-tools selectors are effectively `.audio-debug-*`; non-audio dev-tools styles are not isolated in `styles.css`. |
| L2278-L2897 | Map mentor portrait / dialogue presentation | **Map** mentor overlay (`.map-mentor-*`), portrait/video clipping, prologue iOS tweaks; **not** battle `.mentor-overlay` (removed) | Medium | `mentor.css` | Partial: Phase 1-B | Map-facing `.mentor-*` / `.is-prologue-mentor*` in `mentor.css`; `.map-mentor-portrait-stage` in `styles.css`. |
| L2898-L6458 | Boss/battle VFX | Boss attacks, boss death, hidden boss, monster death, aura, special attack effects | Medium | `battle-vfx.css` | Yes, in chunks | Large but selector namespace is mostly `boss-*`, `monster-*`, and VFX classes. Move by sub-block with visual checks. |
| L6459-L6759 | Result and mistakes UI | Result screen, result stats, mistakes modal responsiveness | Low-Medium | `result-mistakes.css` | Done: Phase 1-D | Moved result modal, result stats, mistakes header, stage log cards, and local mistakes mobile rules. Kept stage confirm in `styles.css`. |
| `result-mistakes.css` L1–370+ | Battle result modal (`monsterResultShown`) | `.result-modal-glass`, `.result-stat-*`, `.result-action-*`, spirit hero | Low–Med | `result-mistakes.css` | — | 模板 `index.html` L3884–3970；評價色 class 來自 `game-utils.js` `getGradeColor`（非本 CSS 檔） |
| `result-mistakes.css` + `index.html` | Stage records + mistakes modals | `.stage-record-*`（L3198+ / L4618+）；`.mistakes-*`（~L4936+） | Low–Med | `result-mistakes.css` | — | 列資料 `stageRecordRows`（manager）；星點亮用 `getStageBestRecord`；見 `game-js-map.md` §想改星等…速查 |
| `result-mistakes.css` | Level milestone float | `.result-milestone-*`（`index.html` L3984–4002） | Low–Med | `result-mistakes.css` | — | 卡片 `type`/`name`/`desc` → `RESULT_LEVEL_MILESTONE_REWARDS`；浮層標題在 HTML |
| L6761-L6945 | Stage confirm modal | Stage confirm panel, mentor entry button, stage best record display | Medium | `map.css` / `mentor.css` | No | 模板 `index.html` L2548–2633；「姐姐引導」→ `startStageWithExplanation`（[`mentor-dialogue-map.md`](./mentor-dialogue-map.md)）；開戰 `confirmAndStartBattle` **勿當 display 改** |
| L6946-L7290 | Home page and mobile battle leftovers | Home cover, title, CTA, mobile home and battle polish fixes | Medium | `home.css` + `styles.css` leftovers | Done: Phase 1-E | Moved `.home-*` and direct home keyframes to `home.css`. Kept mobile battle fixes (`#battleLog`, `#heroAvatar`, `.tap-mode-controls`) in `styles.css`. |
| `home.css` ~L257–810 | Save slot panel (home overlay) | `.save-slot-overlay` … `.save-slot-delete-*`；資料來自 `saveSlotCards` | Low–Med | `home.css` | — | 摘要列仍用 `.save-slot-summary span/strong`；`index.html` 加 `.save-slot-stat` + `sr-only` 語意標籤（不改 grid 視覺）；共鳴率公式見 `game-utils.js` |
| L7293-L7379 | HUD stabilization and desktop layout polish | HUD row stabilization, question card glass, mode toggle, desktop HUD/modal/mentor positioning | High | `layout.css` / `battle.css` / `rwd.css` | No | Crosses HUD, modal, mentor, desktop RWD. Keep until RWD is isolated. |
| L7380-L8949 | Map screen and map ambience | Map container, map HUD, dropdown, nodes, viewport, chapter ambience and animations | Medium | `map.css` | Yes, in two passes | 結構／節點樣式亦見 `index.html` 內嵌 `.map-*`（~L348+）；背景 URL 來自 `map-chapters.json`；HUD 綁定 `game-js-map.md` §想改地圖…速查 |
| L8955-L9779 | Knowledge card and spirit unlock / stage records | Spirit unlock presentation, knowledge card animation, absorption, stage records modal | Low-Medium | `codex.css` / `result-mistakes.css` | Done: Phase 1-C / 1-D | Moved knowledge card unlock overlay, spirit unlock presentation, card particles, absorption particles, and related keyframes to `codex.css`. Moved `.stage-records-*` and `.stage-record-*` modal rules to `result-mistakes.css`. |
| L9781-L11280 | Codex/book UI | Codex book, tabs, pages, cards, monster codex panel and responsive rules | Low-Medium | `codex.css` | Done: Phase 1-C | Moved `.codex-*`, `.monster-codex-*`, spirit reward portrait rules, Codex-local mobile rules, and related Codex keyframes to `codex.css`. Kept later four-mode monster codex overrides in `styles.css`. |
| L11280-L12020 | Spirit display variants and effects | Spirit-specific display/animation rules such as true resonance and individual spirit VFX | Medium | `codex.css` / `battle-vfx.css` | Maybe | Some rules are display-only, some are battle resonance adjacent. Requires selector grouping. |
| L12021-L12086 | Modal utilities and settings controls | Extracted modal buttons, section cards, settings labels, volume label | Low | `settings.css` / `layout.css` | Done: Phase 1-A + 1-F | Moved `.modal-close-btn`, `.modal-header-row`, `.modal-section-card`, `.settings-section-label`, `.volume-control-label` to `settings.css`. Phase 1-F additionally moved `.modal-caption` and changelog text polish selectors to `settings.css`. |
| L12087-L12790 | L36 abyss debris and background VFX | Hidden boss/L36 debris, rocks, rift glow, motion keyframes | Low-Medium | `battle-vfx.css` | Done: Phase 1-A | Moved `.l36-debris-container`, `.debris`, `.rift-*`, `.rock-*`, and related keyframes to `battle-vfx.css`. |
| L12854-L13748 | Resonance wheel and battle HUD v2 | Battle HUD root, resonance wheel, true resonance, TAP/Flick options, status/feedback glows | High | `battle.css` + `battle-vfx.css` | No | Central battle surface. Recent RWD work depends on these selectors. Freeze until RWD map is stable. |
| L13749-L14680 | RWD overrides | iPhone, desktop, iPad landscape, iPad portrait, map/codex/battle responsive overrides | High | `rwd.css` | No for first extraction | High-risk because it intentionally overrides many feature files. Move only after feature files exist and visual checkpoints are defined. |
| L14681-L14932 | Spirit breathing and Bond MAX resonance state | Resonance icon breathing, bond max ring/aura/effects, reduced motion | Medium | `battle.css` / `battle-vfx.css` | Maybe | Battle resonance visual state. Move with resonance wheel, not separately in first pass. |
| L14933-end | Skill UI v2 badges | Skill type badges and hero debuff pill | Low | `battle.css` / `settings.css` | Done: Phase 1-A | Moved `.skill-type-badge`, `.skill-card--* .skill-type-badge`, and `.hero-status-pill.debuff` to `battle.css`. |

## Cross-Domain / Do Not Move Yet

These areas should be marked "temporary legacy" until a second audit:

- `#hud`, `.battle-hud-*`, `#heroAvatar`, `.battle-status-*`: high cascade sensitivity and JS inline style coupling.
- `.resonance-*`, `#flickLayer`, `.hud-tap-mode`: recent iPhone/iPad/desktop RWD fixes depend on exact override order.
- `map.css`: defer despite selector grouping; map structure, map HUD, map mentor overlay, chapter ambience, and later four-mode map overrides still need visual QA boundaries.
- RWD blocks from L13749 onward: contain battle, map, codex, and desktop hover rules in one cascade layer.
- Audio/TTS/BGM/fanfare/iOS resume and `.audio-debug-*`: freeze during CSS Phase 1 closeout even when selectors are visually isolated.
- Map mentor rules inside mentor/map sections: split only after deciding whether ownership is map or mentor. Phase 1-B kept `.map-mentor-portrait-stage`, `.map-mentor-overlay`, `.stage-confirm-mentor-*`, and `.home-mentor-*` in `styles.css`.
- Codex/map mixed rules: Phase 1-C kept `.map-hud-btn--monster-codex` in `styles.css` because it belongs to map HUD, not the Codex modal. Four-mode `.monster-codex-*` overrides remain in `styles.css`.
- Modal primitives mixed with battle/result/settings: move by selector namespace, not by physical location.

## Proposed Split Strategy

### Phase 0 - Documentation Only

Completed. Keep CSS behavior unchanged during planning passes. Maintain this file as the working migration guide.

### Phase 1 - Lowest-Risk Extractions

Phase 1-A completed: the first three extraction items below have been moved without changing CSS values or version query parameters.

1. Done: Move Skill UI badges (`.skill-type-badge`, `.skill-card--*`) to `battle.css`; `.hero-status-pill.debuff` moved with the same low-risk badge group.
2. Done: Move modal utility classes (`.modal-close-btn`, `.modal-header-row`, `.modal-section-card`, `.settings-section-label`, `.volume-control-label`) to `settings.css`.
3. Done: Move isolated L36 debris VFX (`.l36-debris-container`, `.debris`, `.rift-*`, `.rock-*`, related keyframes) to `battle-vfx.css`.
4. Move spirit unlock / knowledge card overlay to `codex.css` after z-index smoke test.

These are preferred because they are namespaced, isolated, and unlikely to alter core battle layout or RWD cascade.

This pass did not move RWD, battle core, resonance, TAP/Flick, projectile, audio, settings schema, question data, or mentor data selectors. The next low-risk split candidates are a dedicated `mentor.css` pass or a dedicated `codex.css` pass.

Phase 1-B completed as a partial mentor extraction:

1. Added `assets/css/mentor.css` after `settings.css` and before `battle.css`.
2. Moved pure mentor overlay, panel, dialogue text, portrait container/image/video, prologue touch fallback, buttons, skip button/progress, page indicator, footer, and mentor-specific mobile rules.
3. Kept `.map-mentor-portrait-stage`, `.map-mentor-overlay`, `.stage-confirm-mentor-*`, and `.home-mentor-*` in `styles.css` because they are map/stage/home ownership or desktop/map override rules.
4. Kept non-mentor mobile `#hud`, `#question-area`, `.tap-mode-controls`, and `.tap-attack-btn` rules in `styles.css`.
5. This pass did not move four-mode RWD, battle core, resonance, TAP/Flick/projectile logic, audio, JS, settings schema, question data, or mentor data.
6. Next recommended extraction: `codex.css` or `map.css`; keep `rwd.css` frozen until feature files are more complete.

Phase 1-C completed as a partial Codex extraction:

1. Added `assets/css/codex.css` after `battle-vfx.css` and before `escape.css`.
2. Moved knowledge card unlock overlay, spirit unlock presentation, generic card particles used only by the unlock card, absorption particles, and related keyframes.
3. Moved Codex book shell, tabs, spread/pages, flip cards, mastery panel, monster codex panel, spirit reward portrait, spirit detail cards, Codex affinity/full-bond display, Codex true-resonance display blocks, Codex-local mobile rules, labels, locked/empty states, navigation, and related Codex keyframes.
4. Kept `.map-hud-btn--monster-codex` in `styles.css` because it belongs to map HUD controls.
5. Kept later four-mode `.monster-codex-*` overrides in `styles.css` because they are mixed into the iPhone/iPad/desktop RWD block.
6. This pass did not move four-mode RWD, battle core, resonance wheel, TAP/Flick/projectile logic, audio, JS, settings schema, question data, or mentor data.
7. Result/mistakes UI is now extracted in Phase 1-D. Phase 1 closeout recommends documentation-only follow-up before any additional split.

Phase 1-D completed as a result/mistakes extraction:

1. Added `assets/css/result-mistakes.css` after `codex.css` and before `escape.css`.
2. Moved result screen backdrop, result modal glass, result spirit hero/trophy, star/time/stat rows, `result-spirit-float`, and the landscape tablet result compression rules.
3. Moved mistakes modal header/voice hint, stage log list/card/text/tip rules, and the local max-width 640px mistakes/stage-log rules.
4. Moved stage records modal/list/row/score/close rules and the local max-width 420px stage-record rules.
5. Kept `.stage-confirm-*` in `styles.css` because it is map/stage-confirm ownership and overlaps mentor entry flow.
6. This pass did not move `rwd.css`, four-mode RWD overrides, battle core, resonance wheel, HUD/TAP/Flick selectors, audio/TTS/BGM/fanfare selectors, or JS behavior.

### Phase 1 Smoke Check

Smoke check completed after Phase 1-A, 1-B, and 1-C. No new CSS split files or selector moves were made during this check.

Confirmed:

1. `index.html` loads split CSS in the documented order: `styles.css`, `home.css`, `settings.css`, `mentor.css`, `battle.css`, `battle-vfx.css`, `codex.css`, `result-mistakes.css`, then `escape.css`, all with `v=26050901`.
2. High-risk selectors remain in `styles.css`: `#hud`, `.battle-hud-*`, `#heroAvatar`, `.resonance-*`, `#flickLayer`, `.hud-tap-mode`, and the four-mode RWD override blocks.
3. Split files do not contain the prohibited battle HUD / resonance / flick / TAP selectors.
4. Extracted selector families are not duplicated as base definitions across split files and `styles.css`. Remaining intersections: `.monster-codex-*` in four-mode RWD blocks. Legacy battle `.mentor-overlay` desktop polish removed 2026-05-24.
5. Extracted animation references have matching `@keyframes`; no missing keyframes were found in the CSS set.
6. `assets/js/game.js` has an empty content diff. `git status --short` may still report it as modified because of stat metadata; `git update-index --refresh assets/js/game.js` can clear that when the environment permits writing Git index/object metadata.

Phase 1-D smoke check:

1. `result-mistakes.css` is loaded after `styles.css` and before `escape.css`, with `v=26050901`.
2. Result/mistakes/stage-record selector families now resolve only in `result-mistakes.css`.
3. `.stage-confirm-*` selectors remain in `styles.css`.
4. No JS files were edited.

Do not continue into `rwd.css` yet. Current next candidates:

1. Done in Phase 1-E: `home.css` now owns `.home-*` and direct home keyframes (`bg-slow-zoom`, `mentor-fade-in`, `fade-down`, `fade-in`, `fade-up`). Trailing mobile battle fixes remain in `styles.css`.
2. `dev-tools.css`: possible small future split for `.audio-debug-*`, but not during audio freeze. Requires confirming debug overlay load/cascade expectations.
3. Stage confirm: keep in `styles.css` for now because `.stage-confirm-*` crosses map selection, best record display, and mentor entry.
4. `map.css`: do not split in Phase 1 closeout; it is medium risk and needs a dedicated visual QA pass for map HUD, nodes, dropdown, mentor overlay, and ambience.
5. Battle core, resonance wheel, HUD/Flick/TAP, audio/TTS/BGM/fanfare/iOS resume, and `rwd.css`: keep frozen.

### Phase 1 Closeout Inventory

`styles.css` still owns these major areas after Phase 1-E:

1. Global/base rules and early battle primitives: body, slots, HP/SP, stage, question area, modal base, hero status, scrollbars (legacy `.left-actionbar` **removed 2026-05-24**).
2. Legacy mobile battle overrides: nested `#hud`, question, Flick projectile, TAP/Flick controls, and mobile battle spacing.
3. ~~Corner menu fallback and forced-hide rules~~ **removed 2026-05-24** (V3 `#hud` `.battle-hud-actions` is canonical).
4. Audio debug overlay: `.audio-debug-*` diagnostics UI. Isolated by selector but audio-related; leave frozen.
5. Stage confirm modal: `.stage-confirm-*`, including best record and mentor entry presentation.
6. Home/title/CTA cover leftovers: only mobile battle leftovers in the former home region remain (`#battleLog`, `#heroAvatar`, `.tap-mode-controls`) because they are battle-owned.
7. HUD stabilization and desktop layout polish: `.hud-interactive-rows`, `.question-card`, `#hud`, `.modal-overlay`, mentor desktop positioning.
8. Map screen and map ambience: `.map-*`, `.stage-node-*`, `.node-*`, `.map-ambient-*`, map HUD, dropdown, viewport, and chapter ambience keyframes.
9. Changelog text polish and `.modal-caption`: moved to `settings.css` in Phase 1-F.
10. Resonance wheel, battle HUD v2, four-mode RWD overrides, spirit breathing, and Bond MAX resonance state.

No new CSS module should be split from this inventory until the next task chooses one bounded candidate and defines its smoke checks.

## Remaining styles.css classification

Classification key:

- A. Can split directly: clear selector boundary, no battle/map/RWD/audio dependency, no core cascade reliance, mechanical move should be enough.
- B. Can split after ownership decision: selector family is bounded, but the target module is ambiguous or cross-domain.
- C. Frozen for now: map, RWD/four-mode overrides, battle core, resonance wheel, HUD/Flick/TAP, audio/TTS/BGM/fanfare/iOS resume, and `.audio-debug-*`.
- D. Keep in `styles.css`: base reset, shared primitives, typography/base utilities, and generic styles with no clear module ownership.

| Remaining block | Approx. current lines | Classification | Recommended ownership | Notes |
| --- | --- | --- | --- | --- |
| Global/base, simple form/card utilities, HP bar fallback | L1-L116 | D | `styles.css` | Body defaults, typography, shared cards, and HP fallback are broad primitives. Keep until a base/layout strategy exists. |
| Early battle primitives and stage/question/modal base | L117-L748 | C/D mixed | `styles.css` until battle/layout audit | Contains battle VFX keyframes, `#stage`, `#hud`, `#question-area`, `.modal-overlay`, `.modal-panel`, slots, and hero status. Too cross-cutting for a mechanical move. |
| Legacy mobile battle overrides | L942-L1749 | C | Frozen | Nested `#hud`, battle question, Flick projectile, and mobile battle layout. Do not move before `rwd.css` and battle ownership are defined. |
| ~~Corner menu fallback~~ | — | — | **Removed 2026-05-24** | `corner-menu.js` and both `#cornerMenu` CSS blocks removed from `styles.css`. |
| ~~Legacy `.left-actionbar` / drawer~~ | ~~L937–978, L999–1001, L1388–1459~~ | — | **Removed 2026-05-24** | Orphan pre–V3 HUD bottom bar; battle uses `.battle-hud-actions` / `.hud-tool-btn`. |
| `body.lock-scroll` | L1842-L1849 | D | `styles.css` or future `layout.css` | Shared modal/page locking primitive. Keep in main legacy file for now. |
| Modal/question responsive tweaks and praise/projectile leftovers | L1851-L2038 | C/D mixed | Frozen / `styles.css` | Crosses mobile question typography, modal text, desktop modal positioning, praise animation, and Flick VFX. Needs selector-by-selector split later. |
| Battle log, rune/Flick option polish | L2043-L2277 | C | Frozen | Battle core/TAP/Flick adjacent; keep with battle audit. |
| Audio debug overlay | L2278-L2458 | C | Frozen | `.audio-debug-*` is selector-isolated but audio-related; freeze with audio/TTS/BGM/iOS resume work. No separate non-audio dev-tools CSS block was found in this region. |
| Grade badge visual override | L2419-L2433 | B | likely `result-mistakes.css` after ownership decision | Bounded selector but class is Tailwind utility based, not semantic. Needs usage audit before moving. |
| Map mentor portrait stage | L2459-L2541 | B | likely `map.css` or `mentor.css` after ownership decision | Crosses map and mentor presentation. Keep until map/mentor boundary is explicit. |
| Boss/battle VFX leftovers | L2542-L6099 | C | Frozen / later `battle-vfx.css` pass | Large battle VFX surface with boss, monster, death, aura, and shared glass selectors. Move only in bounded VFX batches with visual QA. |
| `question-card` late override | L6099-L6102 | C/D mixed | `styles.css` until battle/layout audit | Single shared override, but battle question card cascade-sensitive. |
| Stage confirm modal | L6103-L6287 | B | recommended future owner: `map.css` or dedicated `stage-flow.css`; not `result-mistakes.css` | Triggered from stage selection, contains best record display, and includes mentor entry. It belongs to map/stage flow, not pure result, settings, or mentor. |
| Disabled rune pointer-events | L6288+ (approx.) | C | `styles.css` | Rune disabled behavior is battle/TAP/Flick adjacent. Legacy corner FAB force-hide **removed 2026-05-24** with corner menu cleanup. |
| Home leftovers after Phase 1-E | L6315-L6341 | C | Frozen | Phase 1-E moved `.home-*`; remaining local block is mobile battle fixes such as `#battleLog`, `#heroAvatar`, `.tap-mode-controls`. |
| HUD stabilization and desktop modal polish | L6342-L6424 | C/B mixed | Frozen / layout audit | Includes `.hud-interactive-rows`, `#hud`, `.modal-overlay`, `.modal-panel`. Legacy battle `.mentor-overlay` removed 2026-05-24. |
| Map structure, map HUD, nodes, ambience | L6435-L7986 | C | Frozen | `map.css` remains deferred. It needs dedicated visual QA for map HUD, dropdown, nodes, mentor overlay, chapter ambience, and later four-mode map overrides. |
| Battle HUD utility buttons, floating damage, buffs/debuffs/defeat | L7987-L8685 | C | Frozen | Battle HUD and battle state VFX. Keep with battle/HUD audit. |
| `.modal-caption` and changelog text polish | L8686-L8812 | Done (Phase 1-F) | `settings.css` | Mechanically moved to `settings.css` after ownership decision. No battle/map/RWD/audio selectors were moved with this block. |
| Resonance wheel, battle HUD v2, TAP/Flick arc positioning | L8813-L9726 | C | Frozen | Central battle surface; depends on exact cascade and RWD. |
| Four-mode RWD override blocks | L9727-L10658 | C | Frozen | iPhone, desktop, iPad landscape, and iPad portrait overrides intentionally cover battle/map/codex together. |
| Spirit breathing and Bond MAX resonance state | L10659-end | C | Frozen | Resonance-adjacent visual state. Move only with resonance wheel/battle HUD ownership. |

Current A candidates: none. The remaining obvious small candidates either have ambiguous ownership (B) or fall inside frozen surfaces (C).

`.modal-caption` plus the changelog text polish block has been completed in Phase 1-F and is now owned by `settings.css`.

### Corner Menu Evaluation (Phase 1-F follow-up) — **closed / removed**

**Policy (2026-05-24):** Legacy mobile corner FAB menu **removed**. V3 battle HUD (`.battle-hud-actions` inside `#hud`) owns skill / potion / settings entry points.

**Removed from repo:**

- `assets/js/corner-menu.js` (`window.__initCornerMenu`)
- `index.html` dynamic script load for corner-menu
- `game.js` `__initCornerMenu` calls (both `onMounted` hooks)
- `styles.css`: mobile `#cornerMenu` block and V3 force-hide override block
- `styles.css`: legacy `.left-actionbar`, `.drawer-toggle-btn`, `.drawer-item` blocks (no HTML/JS since V3 HUD)
- `viewport-hooks.js`: `touchend` handler no longer references `.action-btn` (2026-05-24)

### Dev-Tools Evaluation (Phase 1-F follow-up)

Scope discovered in `styles.css`:

1. Dev-tools related selectors found in CSS are concentrated in `L2278-L2458` and all use the `.audio-debug-*` namespace.
2. Nearby rules before this block are battle Flick/TAP polish (`.flick-opt*`), and after this block are map mentor selectors.
3. No standalone `.dev-tools-*`, `.fps-*`, or generic debug overlay selector family was found in `styles.css`.

Classification split:

1. Pure dev tools UI (non-audio): **none found in current `styles.css`**.
2. `.audio-debug-*` / audio debug related: present and fully namespaced (`.audio-debug-overlay`, header/body/rows/actions, mobile overrides).
3. FPS/debug overlay related: no dedicated CSS selectors in `styles.css`; FPS overlay appears JS-inline styled (see `fps-debug.js`), not a CSS block to extract.

Coupling check:

- Map selectors: not mixed inside `.audio-debug-*` rules.
- Stage record/settings modal selectors: not mixed inside `.audio-debug-*` rules.
- RWD/four-mode override blocks: not in four-mode region; only local max-width override for audio debug panel.
- Battle/HUD/Flick/TAP: adjacent to battle selectors physically, but `.audio-debug-*` block itself is selector-isolated.
- Audio/iOS resume: directly audio diagnostics domain, therefore frozen by policy.

Recommendation:

1. **Next-round dev-tools non-audio CSS move is not recommended** (no isolated non-audio dev-tools selector family currently exists in `styles.css`).
2. `.audio-debug-*` must remain excluded and frozen in `styles.css` until audio/TTS/BGM/fanfare/iOS resume work is explicitly opened.
3. If future work needs `dev-tools.css`, scope should come from newly introduced non-audio debug selectors (or by moving FPS inline styles to CSS in a dedicated task), not from the current `.audio-debug-*` block.

### Phase 2 - Candidate Evaluation (Documentation Only)

Preferred candidates (proposal only, no implementation in this phase):

1. Stage confirm packaging (`.stage-confirm-*`) as a dedicated bounded task:
   - Candidate target: `map.css` or `layout.css` after ownership decision.
   - Why plausible: selector family is mostly namespaced and already isolated in the inventory.
   - Risk to manage: it still bridges map stage selection, best record display, and mentor entry flow.
2. Dev-tools non-audio-debug micro split:
   - Candidate target: `dev-tools.css` but strictly non-audio diagnostics only.
   - Current status: blocked for now; no isolated non-audio dev-tools selector family is present in `styles.css`.
   - Hard boundary: keep `.audio-debug-*` in `styles.css` during audio freeze.

Not recommended in Phase 2 (keep frozen):

1. `map.css` full extraction (map structure + ambience + map mentor + map RWD intersections).
2. `rwd.css` and four-mode RWD override blocks.
3. Battle core surface and shared HUD foundation.
4. Resonance wheel and resonance-adjacent state styles.
5. HUD/Flick/TAP selectors and related mobile battle leftovers.
6. Audio/TTS/BGM/fanfare/iOS resume related styles.
7. `.audio-debug-*` selector family.

### Phase 3 - High-Risk Battle and RWD

1. Move battle base/HUD/resonance to `battle.css`.
2. Move boss/hit/projectile/skill effects to `battle-vfx.css`.
3. Move four-mode responsive overrides to `rwd.css` last.

Do not move RWD before feature files exist. `rwd.css` should remain last among split feature files so iPhone/iPad/Desktop overrides retain priority.

## Verification Matrix For Future Moves

Minimum command checks after every extraction:

```powershell
node --check assets/js/game.js
git diff --check
git status --short
```

Manual visual checks by extraction type:

- `map.css`: map load, chapter dropdown, node positions, map HUD, mentor map portrait.
- `battle.css`: TAP and Flick modes, HP/SP, hero avatar, resonance wheel, attack row, answer feedback.
- `battle-vfx.css`: monster hit, boss attacks, boss death, GIRAGIRA, full bond attack.
- `codex.css`: monster codex, spirit codex, book tabs, unlock overlay.
- `settings.css`: system menu, settings modal, changelog, volume controls.
- `mentor.css`: map prologue iOS tweaks, `.mentor-scene-video` clipping (legacy battle modal rules removed 2026-05-24).
- `rwd.css`: iPhone portrait, iPad portrait, iPad landscape, desktop.

## Notes

- Prefer moving complete selector families rather than partial physical chunks.
- Preserve stylesheet load order with query parameters updated only in a version/changelog task.
- Do not delete original CSS in the same pass as adding a new file unless a targeted visual check is run.
- If a selector mixes battle/map/codex/settings in one rule group, mark it "暫不搬" and split it in a dedicated follow-up.
