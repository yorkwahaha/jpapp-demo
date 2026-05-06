Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

# JPAPP Project-Specific Instructions

This repository is JPAPP, a Japanese particle-learning RPG.

Follow these project-specific rules before making changes. Prefer minimal, safe, and verifiable edits. Avoid unnecessary refactors, excessive commits, broad formatting changes, and changes that could break existing gameplay flows.

## Instruction priority

When instructions conflict, follow this priority order:

1. The user's latest explicit request
2. JPAPP project-specific instructions in this file
3. Relevant Codex Skills
4. General coding guidelines in this file
5. Existing project style and conventions

If a requested change conflicts with safety, save-data integrity, or audio lifecycle stability, explain the risk briefly and choose the safest minimal implementation.

## Clarification policy for JPAPP

For JPAPP tasks, do not stop for clarification when the ambiguity is low-risk and the existing project pattern provides a safe default.

Make a conservative assumption and proceed when the change is limited, reversible, and easy to verify.

Ask for clarification only when the choice could significantly affect architecture, audio lifecycle, save data, battle logic, data schema, user-facing learning behavior, or asset naming conventions.

## Git policy

Do not commit or push unless the user explicitly asks for it in the current task.

It is acceptable to suggest that the current state is safe to commit after verification, but do not run `git commit` or `git push` proactively.

Do not treat unrelated untracked assets as errors. Briefly report them only when they affect the requested task or commit readiness.

## Codex Skills usage

Use relevant JPAPP Codex Skills when they match the task.

Common mappings:

- General bug fix or small feature: `jpapp-safe-patch`
- Audio, BGM, TTS, iOS Safari: `jpapp-audio-ios-safari`
- Version/changelog update: `jpapp-version-changelog`
- Pre-commit verification: `jpapp-precommit-verify`
- UI/RWD polish: `jpapp-ui-mobile-rwd`
- JSON/data edits: `jpapp-data-json-safe-edit`
- Save data/localStorage changes: `jpapp-localstorage-save-migration`
- Level-up/EXP/HP/SP changes: `jpapp-level-up-system`
- Question pool review: `jpapp-question-pool-audit`
- Selene/dialogue writing: `jpapp-mentor-dialogue-writing`

## Efficiency and Correctness

Prioritize completing the requested task correctly and cleanly.

Be efficient with tokens, edits, and explanations where reasonable, but do not over-optimize for token savings if doing so increases the risk of incorrect changes, missed context, repeated debugging, or rework.

Prefer the shortest safe path, not the shortest possible response.

## Core priorities

1. Question-bank correctness
2. Learning immersion
3. Game retention
4. Visual impact
5. Audio effects
6. Other polish

Do not optimize for flashy visuals at the expense of grammar correctness, beginner clarity, or save-data safety.

## General working style

- Prefer minimal, safe, targeted patches.
- Do not do broad refactors unless explicitly requested.
- Do not reformat whole files.
- Do not rename large groups of functions, keys, CSS classes, or data IDs unless the task requires it.
- Do not clean unrelated unused code during bug-fix tasks.
- Do not commit automatically unless explicitly requested.
- Do not ask the user to paste diffs unless necessary for diagnosing an error.
- If the working tree has unrelated untracked assets or user-edited files, do not assume they are mistakes. Report them briefly if relevant.
- Keep reports concise: changed files, what changed, checks run, remaining risks.

## Current architectural caution

- `assets/js/game.js` is still a sensitive main runtime file. Avoid unnecessary slimming/refactoring.
- Prefer adding narrow guards, data-driven fields, and small helper functions over moving large code blocks.
- If a task is visual/RWD-only, prefer CSS or narrow template changes.
- If a task affects audio, save data, battle loop, localStorage, or async state, treat it as high risk.

## Common project files

- `index.html`
- `assets/js/game.js`
- `assets/js/game-constants.js`
- `assets/css/styles.css`
- `assets/data/changelog.json`
- `assets/data/levels.v1.json`
- `assets/data/enemies.v1.json`
- `assets/data/spirits.v1.json`
- `assets/data/mentor-dialogues.v1.json`
- `assets/data/earlyGamePools.v1.js`
- `assets/data/map-chapters.json`

## Versioning

When asked to update version/changelog:

- Update `window.APP_VERSION` in `index.html`.
- Update script/style cache query parameters where applicable.
- Update fallback `APP_VERSION` in `assets/js/game.js` if present.
- Add a new top entry in `assets/data/changelog.json`.
- Changelog copy should be player-facing, concise, and easy to understand.

## Validation defaults

Run relevant checks after code/data changes.

Common checks:

```powershell
node --check assets/js/game.js
node --check assets/js/game-constants.js
python -m json.tool assets/data/changelog.json
git diff --check
git status --short
```

For JSON files, validate every edited JSON file with `python -m json.tool`.

For JavaScript data files such as `earlyGamePools.v1.js`, run `node --check` on the edited file.

## Audio caution

Audio/BGM/TTS is high risk, especially on iOS Safari.

- Do not redesign the audio system unless explicitly requested.
- Use token/state guards for async mentor audio, TTS, BGM, and SFX interactions.
- Avoid allowing stale audio from an old page/dialogue to play after the user moves forward.
- If official mp3 is configured but unavailable, fallback behavior must be intentional and guarded.
- When leaving result/map/battle states, explicitly stop or fade the relevant audio source.

## Save-data caution

Do not break existing player progress.

Known save/settings keys include:

- `jpapp_progression_v1`
- `jpRpgSettingsV1`
- `stageBestRecords`
- `skillMastery`

When adding new save fields:

- Provide fallback defaults.
- Avoid migrations that erase old fields.
- Keep old saves loadable.
- Report any affected localStorage fields.

## JPAPP terminology

Use the established world terms consistently:

- Player: 喚語者 / 言霊の呼び手 / 呼び手
- Mentor: 月語導師 Selene / 月詠みの導師 セレネ
- Spirit: 小助靈 / 助の子 / 助詞の精
- World law: 語言之理 / 言ノ理
- Temple: 語言神殿 / 言ノ葉神殿
- Answer options: 共鳴位 / 共鳴輪

Selene tone:

- Warm, mature, caring, mentor-like
- Natural and easy to record
- Not arrogant
- Not oily or over-flirtatious
- Not overly chuuni
- Prefer invitation and companionship over commanding the player

## Model selection guidance for handoff prompts

When preparing prompts for the user to paste into an Agent, include a recommended model.

Defaults:

- Simple CSS/text/UI copy: Gemini Flash
- General JPAPP coding/debug: Codex GPT-5.5 medium or equivalent
- Repeatedly failing RWD/CSS state conflicts: upgrade to GPT-5.5 high
- Audio, iOS Safari lifecycle, save-data migration, battle-loop bugs: Codex GPT-5.5 medium/high
- Avoid GPT-5.5 high unless the task is high-risk or has failed repeatedly.

