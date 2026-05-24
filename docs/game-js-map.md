# JPAPP `game.js` Code Map

> **Last audited:** 2026-05-24 (release `26052401` context)
> **Doc sync:** 2026-05-24 — `mapFallback` 常數已自 `game-constants.js` 移除
> **File:** `assets/js/game.js` — **~11,803 lines** (1-indexed；隨 cleanup 略減)
> **Purpose:** 讓 Agent 用最小搜尋範圍定位區塊；**本文件不取代** `node --check` 或手動測試。
> **Companion:** [`code-ownership-map.md`](./code-ownership-map.md)（跨檔依賴與 script 載入順序）

## 使用方式

1. 用 **Section name** 或 **Keywords** 在 `game.js` 內 `rg`（例：`rg "saveProgression" assets/js/game.js`）。
2. 對照 **Risk** 與 **Safe to edit?**；高風險區除非任務明確要求，否則不動。
3. 題庫內容只改 `assets/data/*.js|json`，不要改出題核心（L7961+）除非任務允許。
4. 行號會隨編輯漂移；以區塊註解（見文末 [Section header 建議](#e-section-header-建議草案)）為準。

## 核心原則

- **穩定優先**：Vue `setup()` 是整合點，大塊外移需分 phase。
- **已外移模組勿還原**：見 `code-ownership-map.md`。
- **Freeze（專案級）**：audio lifecycle、battle timing、save/load、mentor runtime、question gen、boss/L36 選題、CSS/RWD（未要求時）。

---

## A. 大區塊地圖

| # | Section name | Lines (approx.) | Responsibility | Risk | Keywords (rg) | Related files | Safe? | Validation |
|---|--------------|-----------------|----------------|------|---------------|---------------|-------|------------|
| 1 | **Global — VFX shims** | 1–59 | `rectCenter`, `getVfxLayer`, `spawnProjectile` 開機 fallback | Med | `rectCenter`, `getVfxLayer` | `vfx-helpers.js`, `skill-vfx.js` | defer | 戰鬥投射物、滿絆特效 |
| 2 | **Global — SP HUD** | 61–97 | `window.__sp`, `updateSpUI`, `canAffordSP` | Med | `__sp`, `spendSP`, `regenSP` | `index.html` `#spFill` | defer | 施放技能扣 SP、答對回 SP |
| 3 | **Vue bootstrap** | 99–160 | `createApp`, `setup` 開頭、`onMounted` 載入 map-chapters | Med | `mapChapters`, `APP_VERSION` | `map-chapters.json`, `settings-manager.js` | defer | 進地圖章節是否載入 |
| 4 | **Save slots & story flags** | 161–408 | 三槽存檔、migration、`slotScopedKey` | **High** | `saveProgression`, `PROGRESSION_KEY`, `ensureSaveSlotMigration` | `storage-manager.js` | **no** | 切槽、新開局、舊存檔 |
| 5 | **Map / progression state** | 409–555 | 解鎖關卡、成績、spirit 薄封裝、**`skillMastery`（親密度）** | **High** | `unlockedLevels`, `skillMastery`, `bestGrades` | `spirit-codex-helpers.js`, `codex-display-utils.js` | **no** | 地圖節點、親密度顯示 |
| 6 | **Player leveling (derived stats)** | 556–721 | `getDerivedMaxHp`, `processLevelUp`, `loadProgression` | **High** | `playerStats`, `getExpRequiredForNextLevel` | `levels.v1.json` | **no** | 升級、EXP 條 |
| 7 | **Prologue & map open** | 722–906 | `checkPrologueTrigger`, `openMap`, BGM 切換 | **High** | `checkPrologueTrigger`, `_resumeAfterMentor` | `mentor-dialogues.v1.json` | **no** | 首次進地圖序章 |
| 8 | **Save slot UI** | 907–1040 | 選槽、刪槽、`startNewGameFromSlot` | **High** | `selectSaveSlot`, `confirmDeleteSaveSlot` | — | **no** | 存檔面板全流程 |
| 9 | **Map stage pick & endings** | 1041–1274 | `selectStageFromMap`, L35/L36 結局 | **High** | `checkGlobalEndingTriggers`, `playMainEndingFinale` | `mentor-dialogue-map.md` | **no** | 關卡說明、結局觸發 |
| 10 | **Result fanfare & knowledge cards** | 1275–1424 | 結算 fanfare、知識卡佇列 | **High** | `triggerNextKnowledgeCard`, `_afterKnowledgeCards` | `index.html` knowledge overlay | **no** | 破關後卡冊、接回 tally |
| 11 | **Settings & changelog** | 1425–1546 | 版本、`JPAPPChangelogManager`、settings、devTools | Low | `openChangelog`, `isDevToolsVisible` | `changelog-manager.js`, `dev-tools.js` | **yes** | 設定頁、changelog 彈窗 |
| 12 | **Codex — wheel state** | 1547–1613 | 共鳴輪 phase、拖曳、RAF 常數 | Low | `codexWheelPhase`, `CODEX_WHEEL_` | `spirit-codex-helpers.js` | defer | 開共鳴輪不卡頓 |
| 13 | **Mentor — state & fallbacks** | 1614–1882 | mentor refs、inline `mentorDialogueHelpers` fallback | **High** | `mentorTutorialSeen`, `isMentorModalOpen` | `mentor-dialogue-helpers.js` | **no** | — |
| 14 | **Mentor — dialogue runtime** | 1883–2239 | setup/play/stop、typing、skip、video | **DO NOT TOUCH** | `setupMentorDialogue`, `playMentorAudioForCurrentPage`, `finishMentorDialogue` | `audio-tts.js`, `mentor-dialogue-map.md` | **no** | 導師全流程、iOS 音訊 |
| 15 | **Codex — wheel logic & UI** | 2240–3086 | computed、動畫、拖曳、detail 頁 | Low–Med | `codexWheelSkills`, `setCodexWheelPhase`, `openCodexDetail` | `codex.css`, `index.html` codex modal | defer | 共鳴輪旋轉、詳情、鎖定 |
| 16 | **Codex — monster index** | 3087–3154 | `monsterCodexEntries`、選取 | Low | `monsterCodexEntries`, `openMonsterCodex` | `enemies.v1.json`, `codex-display-utils.js` | **yes** | 怪物圖鑑列表/詳情 |
| 17 | **Codex — global keys** | 3180–3190 | Escape 關閉 codex | Low | `isCodexOpen`, `keydown` | — | **yes** | Esc 關閉 |
| 18 | **Data load & abilities** | 3192–3399 | `loadGameData`、abilities fetch、codex format 薄封裝 | Low–Med | `loadGameData`, `skillsAll`, `formatSkill` | `skills.v1.json`, `abilities.v1.json` | defer | 開局資料齊全 |
| 19 | **Battle skills (onomatope)** | 3400–3730 | `castAbility`, turn buffs、`applyTurnLogic` | Med | `castAbility`, `heroBuffs`, `pittariActive` | `hero-status.js`, `abilities.v1.json` | defer | 技能施放、buff 回合 |
| 20 | **Battle — core refs & boss death VFX** | 3731–4188 | player/monster state、boss 死亡序列 | Med | `bossDeathVfxActive`, `spawnBossDeathBurst` | `vfx-helpers.js`, `battle.css` | defer | 魔王死亡演出 |
| 21 | **Battle — pause / resume** | 4377–4434 | `pauseBattle`, `resumeBattle`, codex 時暫停 | Med | `pauseBattle`, `stageConfirmSuspendedForMentor` | — | defer | 開圖鑑不推進 ATB |
| 22 | **Audio — refs & debug wiring** | 4189–4434 | audio refs、`JPAPPAudioDebugManager` 接線 | **High** | `audioDebug`, `bgmAudio`, `audioCtx` | `audio-debug-manager.js` | **no** | `?audioDebug=1` |
| 23 | **Audio — core (Simple Audio v2)** | 4435–6616 | init、BGM、SFX pool、HTML fallback、duck | **DO NOT TOUCH** | `initAudio`, `playBgm`, `stopAllAudio`, `duckMapBgmForVoice` | `audio-tts.js`, `game-constants.js` | **no** | iOS 手勢、BGM 切換 |
| 24 | **Audio — playSfx & lifecycle** | 6617–7115 | `playSfx`、pagehide、warmup | **DO NOT TOUCH** | `playSfx`, `onUserGesture`, `visibilitychange` | — | **no** | SFX、背景回前景 |
| 25 | **Battle — Flick engine** | 6814–7115 | `startFlick`, `resolveFlickShot`, `handleRuneClick` | **High** | `flickState`, `FLICK_MIN`, `spawnProjectile` | `vfx-helpers.js` | **no** | Flick 命中/擦過 |
| 26 | **Battle — ATB timer** | 7117–7700 | `runTimerLogic`, `applyMonsterAttack` | **High** | `timeLeft`, `runTimerLogic`, `applyMonsterAttack` | `hero-status.js` | **no** | 倒數、怪物攻擊 |
| 27 | **Battle — boss attack VFX** | 7195–7682 | 藤蔓/重擊特效 | Low | `playBossVineAttackVfx`, `playBossSmashAttackVfx` | `battle.css` | **yes** | Boss 特殊攻擊畫面 |
| 28 | **Question generation** | 7961–9423 | 出題、混合比例、boss queue、L36 | **DO NOT TOUCH** | `generateQuestionBySkill`, `pickSkillForNormalLevel`, `startBossQueue`, `__debugQMix` | `earlyGamePools.v1.js`, `levels.v1.json` | **no** | 關卡題型分布 |
| 29 | **Battle — initGame** | 9424–10415 | 戰鬥初始化、題庫、mentor 分支 | **High** | `initGame`, `questions`, `pickBattleBgm` | — | **no** | 開戰、教學關 |
| 30 | **Battle — feedback voice** | 10180–10373 | combo/correct 語音 | **High** | `playFeedbackVoice`, `playCorrectFeedback` | `FEEDBACK_VOICE_PATHS` | **no** | 稱讚語音 |
| 31 | **Battle — checkAnswer & flow** | 10416–10996 | 判定、傷害、combo、下一題 | **DO NOT TOUCH** | `checkAnswer`, `nextQuestion`, `addSkillMasteryProgress` | — | **no** | 答對/答錯全流程 |
| 32 | **Victory — grantRewards** | 10997–11474 | 結算 EXP、升級、知識卡排程 | Med–High | `grantRewards`, `proceedToTally` | `result-display-manager.js` | defer | 破關結算 |
| 33 | **Handlers — retry/revive/potion** | 11475–11673 | 重試、復活、藥水、能力解鎖 | Med | `retryLevel`, `revive`, `usePotion` | — | defer | 重試關、喝藥 |
| 34 | **Result display bindings** | 11559–11630 | `JPAPPResultDisplayManager.createVueBindings` | Med | `animatedExp`, `stageRecordRows` | `result-display-manager.js` | defer | 結算動畫、紀錄 |
| 35 | **Debug — level jump** | 11674–11747 | `debugJumpToLevel` | Low | `debugJumpToLevel`, `isLevelJumpOpen` | `debug.js` | **yes** (dev) | Dev 關卡跳轉 |
| 36 | **Vue return & mount** | 11748–11824 | `return {…}`、`jpDebug` 注入、`_jpApp.mount` | Low–Med | `return {`, `debugJumpToLevel` | `debug.js`, `index.html` | defer | 啟動不報錯 |

**區塊數量：** 36
**High-risk / DO NOT TOUCH 區塊：** 18（#4–10, #13–14, #22–26, #28–31）

---

## B. 未來 Agent 查找指南

| 任務 | 先看 game.js 區塊 | 也看 | 風險備註 |
|------|-------------------|------|----------|
| 戰鬥特效（一般命中、震動） | #25 Flick、#20 boss death | `vfx-helpers.js`, `skill-vfx.js` | 勿改投射物時序 |
| Boss 專屬攻擊特效 | #27 | `battle.css` | 相對安全 |
| 共鳴輪（小助靈圖鑑） | #12, #15–17 | `spirit-codex-helpers.js`, `codex-display-utils.js` | 動畫 RAF 勿隨意改 |
| 怪物圖鑑 | #16 | `enemies.v1.json` | 資料驅動，邏輯可拆 |
| 結果畫面 / EXP 動畫 | #32, #34 | `result-display-manager.js` | 與 `grantRewards` 耦合 |
| 地圖 / 選關 | #7–9 | `map-chapters.json`, `settings-manager.js` | 導師觸發鏈結 |
| 知識卡 / 解鎖演出 | #10 | `index.html` overlay | 與 victory 串接 |
| 技能（擬聲詞）施放 | #19 | `abilities.v1.json`, `hero-status.js` | buff 與 ATB 互動 |
| 藥水 / 重試 / 復活 | #33 | — | 會動到 `initGame` / audio stop |
| 出題 / 選項 / 干擾項 | #28 | **`earlyGamePools.v1.js` only**（內容） | **game.js 核心 DO NOT TOUCH** |
| Boss / L36 題序 | #28 `startBossQueue`, `pickSkillForBoss` | pool data | 凍結 |
| 存檔 / 多槽 | #4–6, #8 | `storage-manager.js` | **high-risk** |
| 親密度 / `skillMastery` | #5, #31 | save key `skillMastery`；答對 +1 見 `addSkillMasteryProgress` | 存檔相容；**勿**與已移除的 `skillCorrectCounts` 混淆 |
| 導師對話 | #13–14 | `mentor-dialogue-helpers.js`, `mentor-dialogues.v1.json` | **DO NOT TOUCH**（音訊） |
| 音訊 / BGM / TTS | #22–24 | `audio-tts.js`, `audio-debug-manager.js` | **DO NOT TOUCH** 除非任務明示 |
| Changelog / 版本 | #11 | `changelog-manager.js`, `index.html` `APP_VERSION` | 低風險 |
| Dev / debug | #11, #35, #36 | `debug.js`, `dev-tools.js` | 僅 dev 環境 |
| 題庫文案 / 正解 | —（**不要**先改 game.js） | `assets/data/earlyGamePools.v1.js` 等 | 題庫凍結時只改 data |

---

## C. 可拆檔候選 Roadmap

> 沿用 2026-05-24 盤查；**本 roadmap 僅文件**，不表示已排程實作。

### Phase 1 — 低風險 helper / formatter / computed

| Item | game.js lines | Proposed file | Est. lines | Depends on |
|------|---------------|---------------|------------|------------|
| ~~移除未使用 codex format 薄封裝~~ | — | — | — | **已完成**（2026-05-24） |
| Monster codex computed | 3087–3154 | `monster-codex-helpers.js` | ~70 | `ENEMIES`, `LEVEL_CONFIG`, `clearedLevels` |
| Codex wheel 排序純函式 | 2281–2318 | 併入 `spirit-codex-helpers.js` | ~40 | skills 陣列 |
| `formatAudioDebugValue` + debug actions | 8246–8571 | 擴 `audio-debug-manager.js` | ~150 | audio refs（**不**動播放核心） |

### Phase 2 — Codex wheel / result helper

| Item | game.js lines | Proposed file | Est. lines |
|------|---------------|---------------|------------|
| 共鳴輪動畫 / 拖曳 / RAF | 2240–3086 | `codex-wheel-controller.js` | 500–650 |
| Boss death VFX 序列 | 4008–4185 | `boss-death-vfx.js` 或 `vfx-helpers.js` | ~180 |
| Boss 攻擊 VFX | 7195–7682 | `boss-attack-vfx.js` | ~200 |

### Phase 3 — Save / debug manager

| Item | game.js lines | Proposed file | Est. lines |
|------|---------------|---------------|------------|
| Save slot migration & metadata | 185–408, 907–1040 | `save-slot-manager.js` | ~220 |
| Global SP 模組 | 1–97 | `sp-manager.js` | ~97 |

### Phase 4 — 僅列出，暫不建議

| Item | game.js lines | Note |
|------|---------------|------|
| Question engine | 7961–9423 | 題庫 wrap-up 凍結；拆檔需專項 + 回歸 |
| Audio core | 4435–7115 | iOS Safari 高風險 |
| Mentor manager | 1883–2239 | 與 TTS/BGM lifecycle 綁死 |
| Battle judgment | 10416–10996 | 與 `initGame`、教學流程耦合 |
| Vue `setup()` 主體 | 161–11817 | 最終整合層，不拆 |

---

## D. Dead Code 清理候選（僅文件）

### 已完成（runtime 已移除）

| Symbol / area | 完成日 | 歷史註記 |
|---------------|--------|----------|
| `skillCorrectCounts` / `normalizeSkillCorrectCountsMap` | 2026-05-24 | 舊「累計答對次數／雙次制」（normalize `% 2`）殘留；現役親密度僅 **`skillMastery`**（答對 +1，`addSkillMasteryProgress`）。舊存檔 JSON 若含 `skillCorrectCounts`：**load 時忽略**，**save 不再寫回**。 |
| Unused codex format Vue exports（`formatSkillMeaning` 等） | 2026-05-24 | 薄包裝已刪；模板改直接綁 `codexSelectedSkill.*`；保留 `getSkillTypeLabel`。 |
| `hero-status.js` `isSpeedBuff` 分支 | 2026-05-24 | speed potion / speed buff 已退役；unreachable 分支已移除（全 repo 無 `isSpeedBuff` 定義）。`hasSpeedOrEvadeBuffBestEffort()` 現役仍檢查：`heroStatusTimers.speedUntil`、`isEvadeBuff` best-effort、`speedMultiplier > 1.01` best-effort。 |
| `getStageRecordTimeMs` 解構（game.js） | 2026-05-24 | setup 未使用；`game-utils.js` 內實作保留。 |
| Codex skill formatters（`formatParticleBadge` 等五項） | 2026-05-24 | 自 `codex-display-utils.js` 與 `index.html` boot stub 移除；UI 改 `codexSelectedSkill.*` / `getCodexSkillDisplayName`；`formatMonsterCodexValue` 等怪物圖鑑 helper 保留。 |
| Vue `return` → `debugControls` | 2026-05-24 | 模板未引用；`debugControls` 常數仍作 `heroBuffs` fallback。 |
| `handleMapImageError` | 2026-05-24 | 無 `index.html` `@error` 綁定；函式與 Vue export 已刪。 |
| `DEFAULT_IMAGE_PATHS.mapFallback` | 2026-05-24 | 僅 `game-constants.js` 定義；`handleMapImageError` 移除後無 runtime 引用；地圖背景走 `map-chapters.json`。 |
| `formatMonsterCodexValue` setup 別名 | 2026-05-24 | 單次使用；`monsterCodexEntries` 改直接呼叫 `JPAPPCodexDisplayUtils.formatMonsterCodexValue`。 |
| Vue `return` → `currentQuestionBondMax` | 2026-05-24 | `index.html` 無引用；戰鬥滿絆仍用內部 `isCurrentQuestionBondMax()`。 |
| Vue `return` → `codexPage` / `setCodexSelectedIndex` / `shiftCodexWheel` | 2026-05-24 | `index.html` 無引用；共鳴輪仍用內部 ref／函式。 |
| `getMonsterStageText` local helper | 2026-05-24 | 僅 `monsterCodexEntries` 單次使用；改 inline IIFE。 |
| `getLevelTitle` setup 薄封裝 | 2026-05-24 | 全 repo 無呼叫；函式與 Vue export 已刪。 |
| Vue `return` → `handleMapTabClick` | 2026-05-24 | `index.html` 無引用；`jumpToMapSegment` 仍內部呼叫。 |
| Vue `return` → `praiseToast` / `openMap` / `levelTitle` | 2026-05-24 | 模板無綁定；`praiseToast`/`openMap`/`levelTitle` 本體與內部流程保留；`levelTitle` 仍經 `__attachDebugTools` 直傳。 |
| `requestNewGame` | 2026-05-24 | 舊「新遊戲」入口；僅 `openSaveSlotPanel('new')`，無 template/debug 綁定。現役新開局：面板點空槽 → `selectSaveSlot` → `startNewGameFromSlot`。 |
| Vue `return` → `stageBestRecords` | 2026-05-24 | 模板用 `stageRecordRows` / `getStageBest*`；ref 與 `result-display-manager` 注入保留。 |
| Vue `return` → `stageConfirmSuspendedForMentor` | 2026-05-24 | 關卡說明導師流程內部使用；模板未綁定。 |
| `saveSlotCards.clearedCountText` | 2026-05-24 | computed 欄位全 repo 無讀；存檔卡 UI 未顯示。 |
| `debug.js` `showHome` / `goHome` refs | 2026-05-24 | `game.js` 從未傳入；`jpDebug.home()` 改僅用 `showLevelSelect` / `isFinished` fallback。 |
| `debug.js` 舊 skill reset refs | 2026-05-24 | 移除 `selectedAnswers`、`currentQuestionIndex`、`questionIndex`、`isCorrect`、`showResult` 解構與 no-op 重置；現役為 `userAnswers` / `hasSubmitted` / `questions`。 |

### SAFE

| Symbol / area | Location | Evidence |
|---------------|----------|----------|

### LIKELY SAFE

| Symbol / area | Location | Evidence |
|---------------|----------|----------|
| game.js L1–59 VFX shim 冗餘 | 1–59 | `vfx-helpers.js` 已載入；boot 保險 |
| Inline module fallbacks | 441–446, 1433–1460, 1655–1714, 4271–4302 | 正式 script 已載入；防 boot 失敗 |
| `window.__debugQMix` | ~8009 | 僅 dev console |

### RISKY

| Symbol / area | Note |
|---------------|------|
| Knowledge card 佇列 | 活躍功能，非舊 card flip |
| `skillMastery` | 存檔 + codex UI |
| Audio ducking 全族 | mentor / SFX 使用 |
| `index.html` 重複 codex modal（地圖/戰鬥兩份） | RWD 意圖，非 game.js 死碼 |

### DO NOT TOUCH

| Area | Note |
|------|------|
| Question gen / boss queue / L36 | 凍結 |
| `checkAnswer` / damage / combo timing | 凍結 |
| Audio / TTS / mentor audio | 凍結 |
| `saveProgression` / `loadProgression` | 凍結 |
| `earlyGamePools.v1.js` 內容 | 題庫資料（任務未允許不改） |

---

## E. Section header 建議草案

> **本輪不插入 `game.js`**。之後小步加入時，優先補在已有註解稀疏的邊界。

```javascript
// ================= [ GLOBAL — VFX SHIMS ] =================
// ================= [ GLOBAL — SP ] =================
// ================= [ VUE SETUP — SAVE SLOTS ] =================
// ================= [ VUE SETUP — MAP & PROGRESSION ] =================
// ================= [ VUE SETUP — MENTOR STATE ] =================
// ================= [ MENTOR DIALOGUE — RUNTIME ] =================   // DO NOT REFACTOR CASUALLY
// ================= [ CODEX — RESONANCE WHEEL ] =================
// ================= [ CODEX — MONSTER INDEX ] =================
// ================= [ DATA LOAD — SKILLS / SPIRITS / LEVELS ] =================
// ================= [ BATTLE — ONOMATOPE SKILLS ] =================
// ================= [ BATTLE — STATE & BOSS DEATH VFX ] =================
// ================= [ BATTLE — PAUSE RESUME ] =================
// ================= [ AUDIO — CORE ] =================                 // DO NOT REFACTOR CASUALLY
// ================= [ BATTLE — FLICK ] =================
// ================= [ BATTLE — ATB TIMER ] =================
// ================= [ BATTLE — BOSS ATTACK VFX ] =================
// ================= [ QUESTION GENERATION ] =================           // DO NOT REFACTOR CASUALLY
// ================= [ BATTLE — INIT ] =================
// ================= [ BATTLE — CHECK ANSWER ] =================         // DO NOT REFACTOR CASUALLY
// ================= [ VICTORY — GRANT REWARDS ] =================
// ================= [ VUE RETURN ] =================
```

---

## 相關文件

- [`mentor-dialogue-map.md`](./mentor-dialogue-map.md) — 導師區塊細部風險
- [`manual-test-checklist.md`](./manual-test-checklist.md) — 手動驗證清單
- [`css-map.md`](./css-map.md) — 樣式區塊（與 UI 任務搭配）

## 維護備註

- 外移或大量刪除後：更新本表行號、`Last audited` 日期。
- 驗證預設：`node --check assets/js/game.js`；音訊/iOS 變更需實機。
- `docs/game-js-map.md` 舊版行號（~L10000 時代）已作廢，請以本版為準。
- **親密度存檔：** 僅 `skillMastery`；`skillCorrectCounts` 已退役（見 §D 已完成）。
