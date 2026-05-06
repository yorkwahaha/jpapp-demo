# jpapp-precommit-verify

Use this skill before committing JPAPP changes.

## Goal

Check whether the current working tree is safe to commit without making additional broad changes.

## Rules

- Do not commit unless explicitly requested.
- Do not automatically stage files unless explicitly requested.
- Do not delete untracked files unless explicitly requested.
- Do not ask the user to paste diffs unless needed.
- Report unrelated/untracked files briefly.
- Do not turn verification into a refactor.

## Workflow

1. Inspect status.
2. Run syntax and format checks relevant to modified files.
3. Validate JSON files if edited.
4. Summarize whether it is safe to commit.
5. If unsafe, provide the minimum fix needed.

## Recommended checks

```powershell
git status --short
git diff --check
node --check assets/js/game.js
node --check assets/js/*.js
```

If JSON edited:

```powershell
python -m json.tool assets/data/changelog.json
python -m json.tool assets/data/enemies.v1.json
python -m json.tool assets/data/spirits.v1.json
python -m json.tool assets/data/levels.v1.json
python -m json.tool assets/data/mentor-dialogues.v1.json
```

If JS data edited:

```powershell
node --check assets/data/earlyGamePools.v1.js
```

## Report format

```text
提交前檢查完成。

狀態：
- 可 commit / 暫不建議 commit

檢查結果：
- ...

目前變更：
- ...

未追蹤檔案：
- ...

建議 commit message：
- ...
```

Only include a suggested commit message if the user is likely preparing to commit.
