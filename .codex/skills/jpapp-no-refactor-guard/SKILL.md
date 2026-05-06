# jpapp-no-refactor-guard

Use this skill as a protective overlay when the task must not expand into refactoring.

## Goal

Prevent scope creep.

## Hard rules

Unless the user explicitly asks for refactoring:

- Do not split files.
- Do not move large code blocks.
- Do not rename functions.
- Do not reorganize modules.
- Do not convert patterns/frameworks.
- Do not clean unrelated dead code.
- Do not reformat whole files.
- Do not update dependencies.
- Do not change build setup.
- Do not perform broad lint cleanup.

## Allowed changes

- Small targeted bug fixes.
- Narrow guards.
- Small helper functions near the affected code.
- Scoped CSS rules.
- Specific data-field edits.
- Minimal fallback handling.
- Focused validation.

## If you find unrelated problems

Do not fix them automatically. Report as:

```text
另外發現但未處理：
- ...
```

## Report format

```text
已完成最小修正，未進行重構。

修改檔案：
- ...

只處理：
- ...

刻意未處理：
- 未拆檔
- 未清 dead code
- 未格式化全檔
- 未 commit

驗證：
- ...
```
