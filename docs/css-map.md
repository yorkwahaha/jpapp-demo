# JPAPP styles.css Code Map

This document maps `assets/css/styles.css` and proposes a safe CSS split plan. Line numbers are approximate and should be refreshed before each move because the file is actively changing.

## Current CSS Load Order

`index.html` currently loads CSS in this order:

1. `assets/css/styles.css?v=26050801`
2. `assets/css/home.css?v=26050801`
3. `assets/css/settings.css?v=26050801`
4. `assets/css/mentor.css?v=26050801`
5. `assets/css/battle.css?v=26050801`
6. `assets/css/battle-vfx.css?v=26050801`
7. `assets/css/codex.css?v=26050801`
8. `assets/css/result-mistakes.css?v=26050801`
9. `assets/css/escape.css?v=26050801`

Future split files should preserve cascade intent by keeping broad/base rules first, feature rules next, RWD overrides late, and `escape.css` last unless its scope is audited separately.

Recommended future order:

1. `assets/css/styles.css` - temporary main entry, base variables, legacy leftovers
2. `assets/css/layout.css` - common layout, modal primitives, shared HUD/base panels
3. `assets/css/home.css` - home cover/title/menu/start screen and home-only keyframes
4. `assets/css/settings.css` - settings, system menu, shared modal controls
5. `assets/css/mentor.css` - mentor overlays, dialogue, prologue/portrait presentation
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
| L1751-L1841 | Corner menu mobile | Mobile corner menu and in-battle menu states | Medium | `settings.css` | No for now | Duplicates later forced-hide rules and is tied to battle/menu fallback behavior. Do not move until corner-menu ownership is decided. |
| L1851-L2038 | Modal/question responsive tweaks | Question text responsive sizing, modal panel text, desktop/mobile adjustments | Medium | `layout.css` / `rwd.css` | No | Crosses battle question and modal primitives. Needs split by selector group. |
| L2044-L2458 | Battle polish package and audio debug UI | Battle log, monster entrance/breathing, question stone slots, flick option styling, audio debug overlay | High | `battle.css` + `battle-vfx.css` / maybe `dev-tools.css` later | No | Crosses core battle UI, Flick/TAP, VFX, and audio diagnostics. Audio debug selectors are isolated but audio-related, so freeze in Phase 1 closeout. |
| L2278-L2897 | Mentor overlay and portrait system | Mentor tutorial/dialogue overlay, portrait/video clipping, map mentor portrait responsive rules | Medium | `mentor.css` | Partial: Phase 1-B | Moved pure `.mentor-*`, `.is-prologue-mentor*`, mentor dialogue text, mentor portrait video, and mentor mobile-only selector rules to `mentor.css`. Kept `.map-mentor-portrait-stage` and non-mentor mobile `#hud` / question / TAP rules in `styles.css`. |
| L2898-L6458 | Boss/battle VFX | Boss attacks, boss death, hidden boss, monster death, aura, special attack effects | Medium | `battle-vfx.css` | Yes, in chunks | Large but selector namespace is mostly `boss-*`, `monster-*`, and VFX classes. Move by sub-block with visual checks. |
| L6459-L6759 | Result and mistakes UI | Result screen, result stats, mistakes modal responsiveness | Low-Medium | `result-mistakes.css` | Done: Phase 1-D | Moved result modal, result stats, mistakes header, stage log cards, and local mistakes mobile rules. Kept stage confirm in `styles.css`. |
| L6761-L6945 | Stage confirm modal | Stage confirm panel, mentor entry button, stage best record display | Medium | `map.css` / `mentor.css` | No | Bridges map stage selection and mentor entry. Phase 1-D kept `.stage-confirm-*` in `styles.css`. |
| L6946-L7290 | Home page and mobile battle leftovers | Home cover, title, CTA, mobile home and battle polish fixes | Medium | `home.css` + `styles.css` leftovers | Done: Phase 1-E | Moved `.home-*` and direct home keyframes to `home.css`. Kept mobile battle fixes (`#battleLog`, `#heroAvatar`, `.tap-mode-controls`) in `styles.css`. |
| L7293-L7379 | HUD stabilization and desktop layout polish | HUD row stabilization, question card glass, mode toggle, desktop HUD/modal/mentor positioning | High | `layout.css` / `battle.css` / `rwd.css` | No | Crosses HUD, modal, mentor, desktop RWD. Keep until RWD is isolated. |
| L7380-L8949 | Map screen and map ambience | Map container, map HUD, dropdown, nodes, viewport, chapter ambience and animations | Medium | `map.css` | Yes, in two passes | Good candidate, but split structural map UI from ambient chapter effects to reduce risk. |
| L8955-L9779 | Knowledge card and spirit unlock / stage records | Spirit unlock presentation, knowledge card animation, absorption, stage records modal | Low-Medium | `codex.css` / `result-mistakes.css` | Done: Phase 1-C / 1-D | Moved knowledge card unlock overlay, spirit unlock presentation, card particles, absorption particles, and related keyframes to `codex.css`. Moved `.stage-records-*` and `.stage-record-*` modal rules to `result-mistakes.css`. |
| L9781-L11280 | Codex/book UI | Codex book, tabs, pages, cards, monster codex panel and responsive rules | Low-Medium | `codex.css` | Done: Phase 1-C | Moved `.codex-*`, `.monster-codex-*`, spirit reward portrait rules, Codex-local mobile rules, and related Codex keyframes to `codex.css`. Kept later four-mode monster codex overrides in `styles.css`. |
| L11280-L12020 | Spirit display variants and effects | Spirit-specific display/animation rules such as true resonance and individual spirit VFX | Medium | `codex.css` / `battle-vfx.css` | Maybe | Some rules are display-only, some are battle resonance adjacent. Requires selector grouping. |
| L12021-L12086 | Modal utilities and settings controls | Extracted modal buttons, section cards, settings labels, volume label | Low | `settings.css` / `layout.css` | Done: Phase 1-A | Moved `.modal-close-btn`, `.modal-header-row`, `.modal-section-card`, `.settings-section-label`, `.volume-control-label` to `settings.css`. Kept `.modal-caption` in `styles.css` because it was outside this pass. |
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

1. `index.html` loads split CSS in the documented order: `styles.css`, `home.css`, `settings.css`, `mentor.css`, `battle.css`, `battle-vfx.css`, `codex.css`, `result-mistakes.css`, then `escape.css`, all with `v=26050801`.
2. High-risk selectors remain in `styles.css`: `#hud`, `.battle-hud-*`, `#heroAvatar`, `.resonance-*`, `#flickLayer`, `.hud-tap-mode`, and the four-mode RWD override blocks.
3. Split files do not contain the prohibited battle HUD / resonance / flick / TAP selectors.
4. Extracted selector families are not duplicated as base definitions across split files and `styles.css`. Remaining intersections are intentional retained overrides: `.mentor-overlay` / `.mentor-panel` desktop polish in `styles.css`, and `.monster-codex-*` rules inside the four-mode RWD blocks.
5. Extracted animation references have matching `@keyframes`; no missing keyframes were found in the CSS set.
6. `assets/js/game.js` has an empty content diff. `git status --short` may still report it as modified because of stat metadata; `git update-index --refresh assets/js/game.js` can clear that when the environment permits writing Git index/object metadata.

Phase 1-D smoke check:

1. `result-mistakes.css` is loaded after `styles.css` and before `escape.css`, with `v=26050801`.
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

`styles.css` still owns these major areas after Phase 1-D:

1. Global/base rules and early battle primitives: body, slots, HP/SP, stage, question area, modal base, hero status, action bar, scrollbars.
2. Legacy mobile battle overrides: nested `#hud`, question, Flick projectile, TAP/Flick controls, and mobile battle spacing.
3. Corner menu fallback and forced-hide rules: mobile corner menu definitions plus later v3 HUD forced-hide override.
4. Audio debug overlay: `.audio-debug-*` diagnostics UI. Isolated by selector but audio-related; leave frozen.
5. Stage confirm modal: `.stage-confirm-*`, including best record and mentor entry presentation.
6. Home/title/CTA cover leftovers: only mobile battle leftovers in the former home region remain (`#battleLog`, `#heroAvatar`, `.tap-mode-controls`) because they are battle-owned.
7. HUD stabilization and desktop layout polish: `.hud-interactive-rows`, `.question-card`, `#hud`, `.modal-overlay`, mentor desktop positioning.
8. Map screen and map ambience: `.map-*`, `.stage-node-*`, `.node-*`, `.map-ambient-*`, map HUD, dropdown, viewport, and chapter ambience keyframes.
9. Changelog text polish and `.modal-caption`: modal/changelog utility selectors that may later belong in `settings.css`.
10. Resonance wheel, battle HUD v2, four-mode RWD overrides, spirit breathing, and Bond MAX resonance state.

No new CSS module should be split from this inventory until the next task chooses one bounded candidate and defines its smoke checks.

### Phase 2 - Feature Blocks With Visual QA

1. Move mentor overlay/portrait rules to `mentor.css`.
2. Done partially: move codex/book and monster codex rules to `codex.css`; four-mode overrides remain in `styles.css`.
3. Move map structural UI to `map.css`; move map ambience after structural map is stable.
4. Move result/mistakes/stage confirm after deciding whether each belongs to `battle.css`, `map.css`, or `layout.css`.

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
- `mentor.css`: prologue, mentor modal paging, skip behavior, portrait/video clipping.
- `rwd.css`: iPhone portrait, iPad portrait, iPad landscape, desktop.

## Notes

- Prefer moving complete selector families rather than partial physical chunks.
- Preserve stylesheet load order with query parameters updated only in a version/changelog task.
- Do not delete original CSS in the same pass as adding a new file unless a targeted visual check is run.
- If a selector mixes battle/map/codex/settings in one rule group, mark it "暫不搬" and split it in a dedicated follow-up.
