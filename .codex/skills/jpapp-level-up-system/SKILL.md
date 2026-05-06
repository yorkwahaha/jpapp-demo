# jpapp-level-up-system

Use this skill for implementing or adjusting JPAPP player level, EXP, HP, and SP progression.

## Design baseline

- Level-up should increase HP and SP.
- Do not increase attack power.
- The game should remain a Japanese particle learning game, not a pure stat-grinding RPG.
- EXP should connect naturally to stage result/clear flow.
- UI should be simple and readable.
- Existing saves must remain compatible.

## Rules

- Use `jpapp-localstorage-save-migration` rules for save data.
- Keep level formulas simple.
- Avoid large balance systems unless requested.
- Do not change enemy stats unless requested.
- Do not change damage formula unless requested.
- Do not add gacha/equipment/complex RPG systems in this skill.

## Suggested data fields

Use actual existing structure if different, but keep the concept:

```js
playerLevel
playerExp
playerExpToNext
hpBonusFromLevel
spBonusFromLevel
```

or nested under existing player/progression object if the project already has one.

## Result screen integration

When adding level-up feedback:

- Show gained EXP.
- Show level-up only when it happens.
- Keep animation simple for first version.
- Do not delay result flow excessively.
- Do not overlap with existing fanfare/BGM fixes.

## Recommended checks

```powershell
node --check assets/js/game.js
git diff --check
git status --short
```

If changelog/version update requested:

```powershell
python -m json.tool assets/data/changelog.json
```

## Report format

```text
升級系統修改完成。

新增/調整：
- EXP:
- 等級：
- HP/SP 成長：
- 結算畫面：

存檔相容性：
- ...

驗證：
- ...

未 commit。
```
