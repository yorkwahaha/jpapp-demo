# jpapp-ui-mobile-rwd

Use this skill for JPAPP mobile, tablet, landscape/portrait, and responsive UI fixes.

## Goal

Improve layout/readability without breaking desktop or other screens.

## Rules

- Prefer narrow CSS patches.
- Avoid global selectors unless necessary.
- Do not rewrite the whole layout.
- Do not change unrelated page styles.
- Preserve the JPAPP 2.0 transparent/glass visual direction unless asked otherwise.
- If fixing one overlay/page, scope selectors to that overlay/page.
- Use media queries carefully and test mobile/tablet/desktop reasoning.
- Keep UI clean and readable.

## Common targets

- Battle HUD
- Result overlay
- Codex / 小助靈圖鑑
- Skill page
- Settings/system menu
- Stage confirm modal
- Mentor dialogue overlay
- Combo popups
- Resonance wheel

## Responsive principles

- Mobile: reduce horizontal crowding, preserve tap target size.
- Tablet landscape: avoid excessive empty space and awkward vertical clipping.
- Desktop: do not shrink elements unnecessarily.
- Text: prefer readable line-height and concise copy.
- Overlays: avoid blocking core questions/options for too long.

## Risk warnings

Escalate if:

- Multiple CSS selectors are fighting each other.
- JS state/classes are required.
- Layout has failed repeatedly under Auto/Flash.
- The change affects battle interaction hitboxes.

## Recommended checks

```powershell
git diff --check
git status --short
```

If JS was edited:

```powershell
node --check assets/js/game.js
```

## Report format

```text
RWD/UI 修正完成。

修改檔案：
- ...

調整重點：
- 手機：
- 平板：
- 桌機：

驗證：
- ...

未 commit。
```
