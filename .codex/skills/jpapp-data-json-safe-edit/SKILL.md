# jpapp-data-json-safe-edit

Use this skill for safe edits to JPAPP data files.

## Common files

- `assets/data/enemies.v1.json`
- `assets/data/spirits.v1.json`
- `assets/data/levels.v1.json`
- `assets/data/mentor-dialogues.v1.json`
- `assets/data/changelog.json`
- `assets/data/map-chapters.json`
- `assets/data/earlyGamePools.v1.js`

## Rules

- Only edit requested fields.
- Do not change IDs, keys, structure, numeric balance, image paths, or spawn data unless requested.
- Preserve ordering unless the task requires reordering.
- Validate JSON after editing.
- For `.js` data files, run `node --check`.
- Avoid broad rewrite when a small field update is enough.

## Writing rules

For monster descriptions:

- Avoid forcing `言ノ理` into every description.
- Use enemy positioning such as hostility, disruption, noise, broken sentences, hiding/pressuring spirits.
- Keep descriptions concise and world-consistent.

For spirit text:

- Keep 小助靈 personality clear.
- Use warm fantasy-learning tone.
- Avoid overly chuuni copy.
- Keep `flavorText` and `unlockText` distinct.

For mentor dialogue:

- Selene is warm, mature, caring, and natural.
- Lines should be easy to record.
- Avoid arrogant or over-flirtatious tone.

For question pools:

- Prioritize natural beginner Japanese.
- Avoid ambiguous particle answers.
- Prefer daily-life/common situations.
- N5 vocabulary first; N4 only if justified.

## Recommended checks

```powershell
python -m json.tool assets/data/enemies.v1.json
python -m json.tool assets/data/spirits.v1.json
python -m json.tool assets/data/levels.v1.json
python -m json.tool assets/data/mentor-dialogues.v1.json
python -m json.tool assets/data/changelog.json
node --check assets/data/earlyGamePools.v1.js
git diff --check
git status --short
```

Run only the checks relevant to edited files plus `git diff --check`.

## Report format

```text
資料檔修改完成。

修改檔案：
- ...

修改範圍：
- 只改 ...
- 未改 ...

驗證：
- ...

未 commit。
```
