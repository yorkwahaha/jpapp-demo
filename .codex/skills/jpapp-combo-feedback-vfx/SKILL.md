# jpapp-combo-feedback-vfx

Use this skill for JPAPP combo feedback, popup text, hit effects, battle visual feedback, and boss/special VFX.

## Visual direction

The user prefers starting bolder/more exaggerated, then toning down if needed.

## Rules

- Make feedback visible and satisfying.
- Do not obscure questions/options for too long.
- Use clamp limits for scale, distance, opacity, and duration.
- Prefer CSS animations plus small JS state updates.
- Avoid heavy animation loops that hurt mobile performance.
- Do not rewrite the battle loop unless necessary.
- Do not change damage/balance unless requested.

## Combo feedback

Combo is a major retention/pleasure feature.

Recommended behavior:

- Move combo feedback closer to the visual center or battle focus area.
- Popup like damage text.
- Font size/scale grows with combo count.
- Clamp maximum size.
- Use short duration.
- Avoid covering answer options.

## Hit/VFX patterns

- Strong first version is acceptable.
- Use separate class names for specific effects.
- Keep boss-specific effects special-cased only where requested.
- Do not apply hidden boss VFX to all bosses unless requested.
- For knockback, use direction from actual TAP/Flick input where available.
- Add return timing/hold timing carefully.

## Recommended checks

```powershell
node --check assets/js/game.js
git diff --check
git status --short
```

For CSS-only changes:

```powershell
git diff --check
git status --short
```

## Report format

```text
戰鬥回饋/VFX 調整完成。

修改檔案：
- ...

效果：
- ...

保護：
- 有 clamp
- 未改戰鬥數值
- 未大改 battle loop

驗證：
- ...

未 commit。
```
