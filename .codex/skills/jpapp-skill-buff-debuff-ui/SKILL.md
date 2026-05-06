# jpapp-skill-buff-debuff-ui

Use this skill for JPAPP skill page classification, buff/debuff labels, concise skill descriptions, and status-type UI.

## Goal

Make skill effects easier to understand while keeping the page clean.

## Classification baseline

Possible categories:

- Attack
- Buff self
- Debuff enemy
- Heal/recover
- Passive/special
- Utility

Use existing data fields if available. If not, add minimal metadata in a data-driven way.

## Rules

- Keep copy concise.
- Avoid cluttering the skill cards.
- Prefer small badges, icon border colors, or compact labels.
- Do not add long explanations to every skill card.
- Do not hardcode too much UI logic in templates if metadata can drive it.
- Do not change skill balance unless requested.
- Do not rename skill IDs.

## Visual suggestions

- Buff self: compact "BUFF" or "強化" badge.
- Debuff enemy: compact "DEBUFF" or "弱化" badge.
- Attack: subtle attack marker.
- Heal/recover: recovery marker.
- Use border/accent only if it remains readable on mobile.

## Copy style

Prefer:

- `降低敵方速度`
- `提升自身迴避`
- `恢復 SP`
- `造成傷害並附加弱化`

Avoid:

- Long mechanical paragraphs
- Excessively RPG-heavy wording
- Ambiguous status wording

## Recommended checks

```powershell
node --check assets/js/game.js
git diff --check
git status --short
```

If data JSON edited:

```powershell
python -m json.tool assets/data/<file>.json
```

## Report format

```text
技能分類 UI 調整完成。

修改檔案：
- ...

分類方式：
- buff:
- debuff:
- other:

文案調整：
- ...

驗證：
- ...

未 commit。
```
