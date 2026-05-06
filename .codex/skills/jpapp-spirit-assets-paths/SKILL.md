# jpapp-spirit-assets-paths

Use this skill for 小助靈 display/icon asset paths, fallback behavior, and Codex/圖鑑 image connections.

## Asset conventions

Display art:

```text
assets/images/spirits/display/{spiritId}.webp
assets/images/spirits/display/{spiritId}.png
```

Icon art:

```text
assets/images/spirits/icons/{key}.webp
assets/images/spirits/icons/{key}.png
```

Prefer WebP first, then PNG fallback, then existing placeholder/original UI fallback.

## Rules

- Do not assume every spirit asset exists.
- Missing images must not break UI.
- Preserve existing display image behavior.
- If adding icon support, connect it as optional/fallback-safe.
- Do not replace existing buttons with broken image slots.
- Do not hardcode 28 separate branches if data-driven mapping exists.
- Avoid changing spirit IDs unless requested.

## Common files

- `assets/data/spirits.v1.json`
- `assets/js/game.js`
- `assets/js/game-constants.js`
- `assets/css/styles.css`
- `index.html`

## Image size guidance

When asked for recommended sizes, provide sizes separately for display and icons.

Suggested baseline:

- Display art: 1024x1024 or 1536x1536 transparent PNG/WebP source, exported WebP for runtime.
- Codex/detail display: can render down from display art.
- Icons: 256x256 or 512x512 transparent WebP/PNG.
- Small UI icons: prepare from 512x512 master; runtime can render at 48–96px.

## Recommended checks

```powershell
node --check assets/js/game.js
node --check assets/js/game-constants.js
python -m json.tool assets/data/spirits.v1.json
git diff --check
git status --short
```

Run only checks relevant to edited files.

## Report format

```text
小助靈素材路徑接線完成。

修改檔案：
- ...

接線規則：
- WebP 優先
- PNG fallback
- placeholder/original fallback

素材需求：
- ...

驗證：
- ...

未 commit。
```
