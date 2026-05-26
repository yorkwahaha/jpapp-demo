# Long-Running Goal: `game.js` Mapping

> **Scope:** Documentation-first navigation and ownership mapping for `assets/js/game.js`.
> **Current baseline:** release `26052601`; latest map sync commits `afd59c8` and `bbb9d40`.
> **Primary rule:** Do not modularize, refactor, delete, or change runtime behavior unless a later task explicitly changes this goal.

## Objective

Build and maintain a reliable, current map of `assets/js/game.js` so future agents can find code quickly, avoid frozen zones, and make smaller patches. This goal is self-managed by the agent across small milestone batches.

## Roles

### Implementer

- Read the current docs before editing:
  - `docs/game-js-map.md`
  - `docs/code-ownership-map.md`
  - any referenced subsystem map relevant to the batch
- Use `rg` first for code search.
- Make the smallest patch that advances the current milestone.
- Prefer docs-only patches. If comments in `game.js` are needed, add only standalone section anchors.
- Never move functions, rename symbols, reflow large blocks, or clean unrelated code.

### Supervisor

- Classify every intended change before editing:
  - `docs-only`
  - `comment-only`
  - `runtime-affecting`
- Stop immediately if a proposed change is runtime-affecting and the milestone is documentation/comment-only.
- Check that no forbidden zones are edited.
- Require visible Supervisor Checks before and after each patch batch.
- Treat uncertain risk as a stop condition, not an invitation to guess.

## Visible Supervisor Check

Before each patch batch, report:

```text
Supervisor Check Before:
- Planned files:
- Change class: docs-only / comment-only / runtime-affecting
- Runtime behavior change: yes/no
- Forbidden zones touched: yes/no
- Validation plan:
- Stop condition if risk appears:
```

After each patch batch, report:

```text
Supervisor Check After:
- Files changed:
- Actual change class:
- Runtime behavior change: yes/no
- Forbidden zones touched: yes/no
- Validation run:
- Uncertainty / human confirmation needed:
```

## Milestone Ladder

### Milestone 1: Baseline Docs Sync

- Sync `docs/game-js-map.md` with current `assets/js/game.js`.
- Sync `docs/code-ownership-map.md` ownership notes and quick entry points.
- Record line count, audit date, key symbols, and high-risk freeze zones.
- Validation: `git diff --check`.

### Milestone 2: Comment-Only Navigation Anchors

- Add at most 1-2 standalone section anchors in `assets/js/game.js`.
- Preferred anchors:
  - `[ VICTORY — GRANT REWARDS ]`
  - `[ VUE RETURN & BINDINGS ]`
- No logic edits.
- Validation:
  - `node --check assets/js/game.js`
  - `node --check assets/js/debug.js`
  - `git diff --check`

### Milestone 3: Cross-Doc Consistency Pass

- Verify `game-js-map.md`, `code-ownership-map.md`, `mentor-dialogue-map.md`, and `css-map.md` do not contradict current `game.js` entry points.
- Patch only docs unless explicitly approved.
- Validation: `git diff --check`.

### Milestone 4: Quick Search Expansion

- Add or refine task-to-`rg` tables for common agent tasks.
- Prefer symbol names over line numbers.
- Mark which files to open first and which files to avoid.
- Validation: `git diff --check`.

### Milestone 5: Frozen-Zone Audit

- Re-audit high-risk zones against current code.
- Update docs with clearer "do not touch" boundaries.
- No runtime edits.
- Validation: `git diff --check`.

### Milestone 6: Optional Comment Anchor Cleanup

- Only if docs prove navigation still needs anchors.
- Add or adjust comment-only section headers.
- Never add comments inside fragile logic branches.
- Validation:
  - `node --check assets/js/game.js`
  - `node --check assets/js/debug.js`
  - `git diff --check`

## Hard Restrictions

Do not modify these areas unless the user explicitly asks in the current task:

- Audio / TTS / BGM / fanfare / iOS gesture resume
- `generateQuestionBySkill`
- `getChoices`
- `safeFallbackQuestion`
- `checkAnswer`
- `grantRewards` logic
- Timer / ATB
- Save migration or save/load core
- Battle core, damage, combo, projectile, reward, EXP, or unlock behavior
- Codex wheel runtime logic
- Mobile HUD
- Battle question layout
- Map HUD
- CSS/RWD
- Module extraction
- Dead code deletion
- Broad formatting

## Validation Matrix

| Touched files | Required validation |
|---------------|---------------------|
| Markdown docs only | `git diff --check` |
| `assets/js/game.js` comments only | `node --check assets/js/game.js`; `node --check assets/js/debug.js`; `git diff --check` |
| Other JS docs-adjacent comments | `node --check <touched.js>`; `git diff --check` |
| JSON docs/data mapping files | `python -m json.tool <touched.json>`; `git diff --check` |
| CSS | Stop unless milestone explicitly allows CSS |
| Runtime logic | Stop unless user explicitly changes scope |

## Stop Conditions

Stop and report if any of these occur:

- A change would alter runtime behavior.
- A requested edit requires touching a forbidden zone.
- The patch begins to look like refactor, cleanup, deletion, or module extraction.
- A line-range or symbol mapping cannot be verified with `rg`.
- Validation fails twice for the same reason.
- Three consecutive tool or command errors occur.
- The working tree contains unexpected changes that overlap the planned files.
- The task starts requiring product/design decisions outside mapping.

## Report Format

Use this format at the end of each milestone:

```text
Milestone:
Files changed:
Change class:
Runtime behavior change:
Forbidden zones touched:
Validation:
Uncertainty / manual confirmation:
Commit recommendation:
Next recommended milestone:
```

## Commit Policy

- Do not commit unless the user explicitly asks.
- Do not push unless the user explicitly asks.
- If a milestone is safe to commit, say so in the report.
