# jpapp-audio-ios-safari

Use this skill for JPAPP audio, BGM, SFX, mentor voice, TTS fallback, and iOS Safari lifecycle bugs.

## Risk level

High. Prefer Codex GPT-5.5 medium/high or equivalent.

## Goal

Fix audio behavior safely without redesigning the audio system.

## Common problem types

- BGM resumes after iOS Safari goes background.
- Result fanfare overlaps with map BGM.
- Mentor official mp3 loses race and stale Chinese Google TTS plays.
- Fast "next dialogue" taps trigger old audio.
- BGM/SFX/TTS collide.
- Audio resumes without user returning to the game.

## Rules

- Do not rewrite the whole audio system.
- Do not change fanfare/BGM mappings unless requested.
- Do not replace official mp3 behavior with TTS unless requested.
- Do not remove existing token guards.
- Prefer adding or tightening token/state guards.
- Prefer explicit stop/fade on state transition.
- Avoid stale async callbacks playing audio after the active page/state has changed.
- PC BGM should not be ducked for ordinary SFX unless existing behavior says so.
- TTS fallback must be intentional, guarded, and not triggered by stale pages.

## Important lifecycle events

Inspect relevant handlers before editing:

- `visibilitychange`
- `pagehide`
- `pageshow`
- `blur`
- `focus`
- `pointerdown`
- `touchstart`
- `click`

## Safe patterns

### Token guard pattern

When starting async audio:

1. Create or increment a token.
2. Capture the expected state/page/key.
3. Before playing, verify the current token and state still match.
4. If not matching, abort silently.

### Result fanfare to map BGM transition

For the specific result-to-map overlap issue:

- Fade active result fanfare out over roughly 350–700ms.
- Fade map BGM in over roughly 500–900ms.
- Only target result fanfare → map BGM transition.
- Do not redesign the whole audio manager.
- Do not change fanfare mapping.

### Official mp3 + TTS fallback

- If configured mp3 path is missing/unavailable, fallback may use zh-TW Google TTS only if this is current dialogue state.
- If HEAD is OK but decode/play fails, prefer warning/silent fail over stale fallback unless existing behavior explicitly requires fallback.
- Fast page changes must not trigger old TTS.

## Recommended checks

```powershell
node --check assets/js/game.js
git diff --check
git status --short
```

If constants/audio maps were edited:

```powershell
node --check assets/js/game-constants.js
```

## Report format

```text
已完成音訊修正。

修改檔案：
- ...

修正重點：
- ...

保護措施：
- token/state guard ...
- fade/stop timing ...

驗證：
- ...

未處理：
- 未進行大型音訊系統重構。
- 未 commit。
```
