# jpapp-agent-handoff

Use this skill to create a compact handoff prompt for a new Codex/Agent conversation.

## Goal

Produce a paste-ready prompt that lets the next Agent continue JPAPP work without redoing completed tasks.

## Required sections

1. Recommended model
2. Current stable baseline
3. Task goal
4. Do not redo / do not refactor list
5. Files likely involved
6. Implementation constraints
7. Validation commands
8. Expected final report

## Model recommendation rules

- Simple CSS/text/UI copy: Gemini Flash
- General JPAPP coding/debug: Codex GPT-5.5 medium or equivalent
- Repeated RWD/CSS failures or selector conflicts: Codex GPT-5.5 high
- Audio, iOS Safari lifecycle, save migration, battle-loop bugs: Codex GPT-5.5 medium/high
- Avoid GPT-5.5 high unless task risk justifies it.

## Tone

- Direct and operational.
- No long theory.
- No excessive background.
- Explicitly tell the Agent not to commit unless asked.
- Explicitly tell the Agent not to refactor unrelated code.

## Template

```text
建議模型：Codex GPT-5.5 中

請承接目前 JPAPP 穩定基線，不要回頭重做已完成項目。

目前基線：
- ...

本輪目標：
1. ...

限制：
- 最小安全修改。
- 不做大型 refactor。
- 不整理 unrelated unused code。
- 不主動 commit。
- 若遇到未追蹤素材，不要擅自刪除，簡短回報即可。

可能相關檔案：
- ...

請完成後執行：
```powershell
node --check assets/js/game.js
git diff --check
git status --short
```

回報格式：
- 修改檔案
- 修改重點
- 驗證結果
- 是否未 commit
```
