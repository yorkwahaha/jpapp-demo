# jpapp-question-pool-audit

Use this skill when auditing JPAPP question pools and grammar examples.

## Core priority

Question-bank correctness is the highest priority.

## Goals

- Ensure Japanese is natural and beginner-appropriate.
- Ensure the intended particle answer is not ambiguous.
- Ensure Chinese prompts are clear.
- Preserve learning progression.
- Prefer daily-life/common examples.

## Rules

- Do not replace many sentences blindly.
- For each change, explain the reason briefly.
- Avoid niche scenarios or unnatural filler sentences.
- Prefer N5 vocabulary first.
- Use N4 vocabulary only when it improves clarity and is acceptable.
- Do not introduce grammar beyond the level unless requested.
- Avoid sentences where multiple particles are equally natural.
- Keep distractors fair, not misleading due to bad wording.

## Common files

- `assets/data/earlyGamePools.v1.js`
- `assets/data/levels.v1.json`

## Review checklist

For each sentence:

1. Is the Japanese sentence natural?
2. Is the Chinese prompt natural?
3. Is the target particle clearly required?
4. Could another option also be accepted?
5. Is vocabulary appropriate for this stage?
6. Does it match the level's learning point?
7. Is the situation common enough for beginners?

## Replacement style

Prefer simple and daily examples:

- 学校へ行きます。
- 図書館で勉強します。
- 友だちと話します。
- 日本語を勉強します。
- 机の上に本があります。

Avoid strange/filler examples unless the stage needs fantasy flavor.

## Recommended checks

```powershell
node --check assets/data/earlyGamePools.v1.js
node --check assets/js/game.js
git diff --check
git status --short
```

## Report format

```text
題庫審核完成。

修改檔案：
- ...

調整池：
- ...

修正類型：
- 自然度：
- 助詞歧義：
- 難度：
- 中文提示：

驗證：
- ...

未 commit。
```
