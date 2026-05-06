# jpapp-version-changelog

Use this skill when updating JPAPP version numbers and `assets/data/changelog.json`.

## Goal

Synchronize the app version and add a player-facing changelog entry.

## Files commonly edited

- `index.html`
- `assets/js/game.js`
- `assets/data/changelog.json`

## Rules

- Keep version numbers consistent.
- Do not alter unrelated changelog history.
- New changelog entry should be near the top if the file is newest-first.
- Changelog copy should be player-facing and concise.
- Avoid developer-only jargon unless the changelog is clearly technical.
- Do not commit unless explicitly requested.

## Workflow

1. Identify current version number.
2. Determine next version number from user request or existing convention.
3. Update:
   - `window.APP_VERSION` in `index.html`
   - CSS/JS cache query parameters in `index.html`
   - fallback `APP_VERSION` in `assets/js/game.js` if present
   - `assets/data/changelog.json`
4. Validate edited files.
5. Report exact new version.

## Recommended checks

```powershell
node --check assets/js/game.js
python -m json.tool assets/data/changelog.json
git diff --check
git status --short
```

## Changelog style

Prefer:

```json
{
  "version": "26050501",
  "title": "音訊與遊戲體驗調整",
  "items": [
    "改善結算畫面返回地圖時的音樂銜接。",
    "優化部分戰鬥回饋顯示。",
    "修正若干介面細節。"
  ]
}
```

Avoid:

- Excessive internal file names
- Long implementation details
- Overclaiming untested behavior

## Report format

```text
版本收尾完成。

新版本號：
- ...

修改檔案：
- ...

changelog 摘要：
- ...

驗證：
- ...

未 commit。
```
