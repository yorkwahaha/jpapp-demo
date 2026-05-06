# jpapp-localstorage-save-migration

Use this skill for JPAPP save data, settings, records, mastery, level, EXP, and localStorage changes.

## Risk level

High. Existing player saves must remain loadable.

## Known keys

- `jpapp_progression_v1`
- `jpRpgSettingsV1`
- `stageBestRecords`
- `skillMastery`

## Rules

- Do not erase old save fields.
- Do not rename localStorage keys unless explicitly required.
- Add fallback defaults for missing fields.
- Treat undefined/null old values safely.
- Avoid destructive migrations.
- New fields should be optional and backward-compatible.
- Report every affected save/settings field.

## Workflow

1. Locate current load/save functions.
2. Identify exact data shape.
3. Add new field with fallback.
4. Ensure old saves do not crash.
5. Ensure new saves persist correctly.
6. Run syntax checks.
7. Report migration impact.

## Safe migration pattern

```js
const save = loadSave() || {};
const player = save.player || {};
const level = Number.isFinite(player.level) ? player.level : 1;
```

Avoid assuming nested objects exist.

## Recommended checks

```powershell
node --check assets/js/game.js
git diff --check
git status --short
```

If data defaults are in JSON:

```powershell
python -m json.tool assets/data/<file>.json
```

## Report format

```text
存檔/設定相容性修改完成。

修改檔案：
- ...

影響欄位：
- localStorage key:
- 新增/讀取欄位：

相容性：
- 舊存檔缺欄位時 ...
- 不會清除 ...

驗證：
- ...

未 commit。
```
