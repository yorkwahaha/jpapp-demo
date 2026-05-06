# jpapp-safe-patch

Use this skill for ordinary JPAPP bug fixes, small feature adjustments, UI tweaks, and low-risk code changes.

## Goal

Make the smallest safe change that satisfies the request without expanding scope.

## Rules

- Do not do broad refactors.
- Do not reformat whole files.
- Do not rename unrelated functions, variables, CSS classes, keys, or data IDs.
- Do not clean unrelated dead code.
- Do not change assets, data schemas, save keys, or audio behavior unless the task asks for it.
- Do not commit unless explicitly requested.
- If the task can be solved with a narrow CSS/data/guard change, prefer that over larger JS changes.

## Workflow

1. Identify the minimum affected file set.
2. Inspect nearby code before editing.
3. Patch only the relevant section.
4. Run focused checks.
5. Report concisely.

## Recommended checks

Use checks that match the edited files.

```powershell
node --check assets/js/game.js
node --check assets/js/*.js
python -m json.tool assets/data/changelog.json
git diff --check
git status --short
```

For edited JSON files:

```powershell
python -m json.tool assets/data/<file>.json
```

For edited JS data files:

```powershell
node --check assets/data/<file>.js
```

## Report format

Use this structure:

```text
已完成。

修改檔案：
- ...

修改內容：
- ...

驗證：
- ...

注意事項：
- 未 commit。
- 若有未追蹤素材，僅列出，不要擅自處理。
```

## Escalation

If the bug appears to require audio lifecycle, save migration, battle-loop rewriting, or large state changes, stop broadening the patch and explicitly report the risk.
