# JPAPP `game.js` Code Map

> **Last audited:** 2026-05-24 (release `26052401` context)
> **Doc sync:** 2026-05-24 — §結算畫面責任地圖；§想改星等…速查；manager 內 `stageRecordRows` / `calculatedGrade` 邊界註解
> **File:** `assets/js/game.js` — **~11,693 lines** (1-indexed；外移後略減)
> **Purpose:** 讓 Agent 用最小搜尋範圍定位區塊；**本文件不取代** `node --check` 或手動測試。
> **Companion:** [`code-ownership-map.md`](./code-ownership-map.md)（跨檔依賴與 script 載入順序）

## 使用方式

1. 用 **Section name** 或 **Keywords** 在 `game.js` 內 `rg`（例：`rg "saveProgression" assets/js/game.js`）。
2. 對照 **Risk** 與 **Safe to edit?**；高風險區除非任務明確要求，否則不動。
3. 題庫內容只改 `assets/data/*.js|json`，不要改出題核心（§A #31, L7880+）除非任務允許。
4. 行號會隨編輯漂移；以區塊註解（見文末 [Section header 建議](#f-section-header-建議草案)）為準。
5. **檔案順序 ≠ 邏輯邊界**：例如 `formatAudioDebugValue` / `onUserGesture` 實體位置在 L8165+（§A #32），落在出題區 **之後**，語意仍屬音訊 lifecycle。

## 核心原則

- **穩定優先**：Vue `setup()` 是整合點，大塊外移需分 phase。
- **已外移模組勿還原**：見 `code-ownership-map.md`。
- **Freeze（專案級）**：audio lifecycle、battle timing、save/load、mentor runtime、question gen、boss/L36 選題、CSS/RWD（未要求時）。

---

## A. 大區塊地圖

> 行號區間**互不重疊**（2026-05-24 以 `rg` 對 `game.js` 實測）。邏輯上相關但檔案順序交錯者，見各列 **Notes**。

| # | Section name | Lines (approx.) | Responsibility | Risk | Keywords (rg) | Related files | Safe? | Validation |
|---|--------------|-----------------|----------------|------|---------------|---------------|-------|------------|
| 1 | **Global — VFX shims** | 1–59 | `rectCenter`, `getVfxLayer`, `spawnProjectile` 開機 fallback | Med | `rectCenter`, `getVfxLayer` | `vfx-helpers.js`, `skill-vfx.js` | defer | 戰鬥投射物、滿絆特效 |
| 2 | **Global — SP HUD** | 61–97 | `window.__sp`, `updateSpUI`, `canAffordSP` | Med | `__sp`, `spendSP`, `regenSP` | `index.html` `#spFill` | defer | 施放技能扣 SP、答對回 SP |
| 3 | **Vue bootstrap** | 99–159 | `createApp`, `setup` 開頭、首個 `onMounted` 載入 `map-chapters` | Med | `mapChapters`, `createApp` | `map-chapters.json` | defer | 進地圖章節是否載入 |
| 4 | **Setup — data refs** | 160–183 | `EARLY_GAME_POOLS`、`LEVEL_CONFIG`、`SKILLS` 等 ref 宣告 | Low | `EARLY_GAME_POOLS`, `LEVEL_CONFIG` | `earlyGamePools.v1.js` | defer | 開局前 ref 存在 |
| 5 | **Save slots — storage & metadata** | 184–351 | keys、migration、metadata 讀寫、`setActiveSaveSlotId`、`isSlotProgressionReadable` | **High** | `PROGRESSION_KEY`, `ensureSaveSlotMigration`, `writeSaveSlotsMetadata` | `storage-manager.js` | **no** | 切槽、migration、metadata |
| 5b | **Home — saveSlotCards display** | 352–366 | `saveSlotCards` computed；共鳴率經 `__JPAPP_UTILS`（**非** save/load 寫入） | Low–Med | `saveSlotCards`, `calculateSaveSlotResonanceText` | `game-utils.js`, `index.html`, `home.css` | **yes**（顯示） | 見 §首頁存檔卡 |
| 6 | **Map / progression state** | 392–553 | `showMap`、`unlockedLevels`、知識卡佇列、spirit 薄封裝、**`skillMastery`** | **High** | `unlockedLevels`, `skillMastery`, `pendingKnowledgeCards` | `spirit-codex-helpers.js` | **no** | 地圖節點、親密度 |
| 7 | **Player leveling & save I/O** | 554–715 | `processLevelUp`、`saveProgression`、`loadProgression`、開局 `loadProgression()` | **High** | `saveProgression`, `loadProgression`, `playerStats` | `levels.v1.json` | **no** | 升級、EXP、存檔欄位 |
| 8 | **Prologue & map open** | 716–898 | `checkPrologueTrigger`、`openMap`、序章／結局場景回調 | **High** | `checkPrologueTrigger`, `openMap`, `_resumeAfterMentor` | `mentor-dialogues.v1.json` | **no** | 首次進地圖序章 |
| 9 | **Home — save slot actions** | 900–1029 | 面板開關、選槽、新開局、刪槽確認（流程） | **High** | `openSaveSlotPanel`, `selectSaveSlot`, `confirmDeleteSaveSlot` | `index.html` `showLevelSelect` | **no** | 選槽／刪檔／新開局；卡面資料改 #5b |
| 10 | **Map — stage pick & HUD helpers** | 1030–1091 | `scrollToStage`、`selectStageFromMap` 前置、地圖 tab | **High** | `handleMapTabClick`, `jumpToMapSegment` | `settings-manager.js` | **no** | 地圖導覽、鎖關提示 |
| 11 | **Map — battle confirm & endings** | 1092–1255 | `selectStageFromMap`、`confirmAndStartBattle`、L35/L36 結局 | **High** | `checkGlobalEndingTriggers`, `playMainEndingFinale` | `mentor-dialogue-map.md` | **no** | 關卡說明、結局觸發 |
| 12 | **Map — return & knowledge cards** | 1257–1409 | `returnToMap`、result fanfare、`triggerNextKnowledgeCard` | **High** | `returnToMap`, `triggerNextKnowledgeCard`, `_afterKnowledgeCards` | `index.html` knowledge overlay | **no** | 破關回地圖、知識卡 |
| 13 | **Home — version, settings, changelog** | 1411–1524 | `APP_VERSION`、`appVersion`、`openChangelog`、`versionImageAsset`、settings、devTools | Low | `appVersion`, `openChangelog`, `isDevToolsVisible` | `changelog-manager.js`, `home.css`, `index.html` | **yes** | 首頁版本字、changelog、設定 |
| 14 | **Codex — wheel state (RAF vars)** | 1526–1572 | 共鳴輪 phase、拖曳、RAF 常數（非 ref） | Low | `codexWheelPhase`, `CODEX_WHEEL_` | `spirit-codex-helpers.js` | defer | 開共鳴輪不卡頓 |
| 15 | **Mentor — state & fallbacks** | 1574–1841 | mentor refs、inline `mentorDialogueHelpers` fallback、`loadMentorState` | **High** | `mentorTutorialSeen`, `isMentorModalOpen` | `mentor-dialogue-helpers.js` | **no** | — |
| 16 | **Mentor — dialogue runtime** | 1842–2198 | `setupMentorDialogue`、typing、skip、video、audio page | **DO NOT TOUCH** | `setupMentorDialogue`, `playMentorAudioForCurrentPage`, `finishMentorDialogue` | `audio-tts.js`, `mentor-dialogue-map.md` | **no** | 導師全流程、iOS 音訊 |
| 17 | **Codex — wheel logic & UI** | 2200–3005 | `codexWheelSkills`（排序經 helper）、拖曳／動畫、`openCodexDetail` | Low–Med | `codexWheelSkills`, `setCodexWheelPhase`, `openCodexDetail` | `spirit-codex-helpers.js`, `codex.css` | defer | 共鳴輪旋轉、詳情 |
| 18 | **Codex — monster index** | 3045–3077 | `monsterCodexEntries` computed（薄）、開關／選取 | Low | `monsterCodexEntries`, `openMonsterCodex` | `codex-display-utils.js`, `enemies.v1.json` | **yes** | 怪物圖鑑列表/詳情 |
| 19 | **Codex — watches & Escape** | 3080–3114 | codex watch、`Escape` 關閉共鳴輪／怪物圖鑑 | Low | `isCodexOpen`, `keydown` | — | **yes** | Esc 關閉、開輪同步 |
| 20 | **Data load & abilities** | 3116–3414 | `loadGameData`、`abilities` fetch、`applyTurnLogic` 前段 | Low–Med | `loadGameData`, `skillsAll` | `skills.v1.json`, `abilities.v1.json` | defer | 開局資料齊全 |
| 21 | **Battle — onomatope skills** | 3416–3614 | `castAbility`、`playSkillSfx`、技能 overlay；含 `onMounted(loadGameData)` | Med | `castAbility`, `heroBuffs` | `hero-status.js`, `abilities.v1.json` | defer | 擬聲詞施放 |
| 22 | **Battle — core refs & combo UI** | 3616–3888 | 戰鬥常數、`showLevelSelect`（首頁旗標）、`player`/`monster` refs | Med | `showLevelSelect`, `currentLevel`, `comboPopup` | `index.html` battle/home | defer | 首頁↔戰鬥切換 |
| 23 | **Battle — boss death VFX** | 3889–4106 | `bossDeathVfxActive`、`spawnBossDeathBurst` 序列 | Med | `bossDeathVfxActive`, `spawnBossDeathBurst` | `vfx-helpers.js`, `battle.css` | defer | 魔王死亡演出 |
| 24 | **Audio — refs & debug wiring** | 4108–4294 | `bgmAudio`、`audioCtx`、`JPAPPAudioDebugManager` 接線 | **High** | `audioDebug`, `bgmAudio`, `audioCtx` | `audio-debug-manager.js` | **no** | `?audioDebug=1` |
| 25 | **Battle — pause / resume** | 4296–4318 | `pauseBattle`、`resumeBattle`（開圖鑑／導師時） | Med | `pauseBattle`, `resumeBattle` | — | defer | 開圖鑑不推進 ATB |
| 26 | **Audio — core (init / BGM / SFX)** | 4320–6731 | `initAudioCtx`、`initAudio`、`playBgm`、`playSfx`、pool、duck | **DO NOT TOUCH** | `initAudio`, `playBgm`, `stopAllAudio`, `playSfx` | `audio-tts.js`, `game-constants.js` | **no** | iOS 手勢、BGM 切換 |
| 27 | **Battle — Flick engine** | 6733–7034 | `handleRuneClick`、`startFlick`、`resolveFlickShot` | **High** | `flickState`, `FLICK_MIN`, `resolveFlickShot` | `vfx-helpers.js` | **no** | Flick 命中/擦過 |
| 28 | **Battle — ATB & monster attack** | 7036–7112 | `runTimerLogic`（含 pause timer 呼叫鏈開頭） | **High** | `runTimerLogic`, `timeLeft` | `hero-status.js` | **no** | 倒數、超時 |
| 29 | **Battle — boss attack VFX** | 7114–7601 | `playBossVineAttackVfx`、`playBossSmashAttackVfx` 等 | Low | `playBossVineAttackVfx`, `playBossSmashAttackVfx` | `battle.css` | **yes** | Boss 特殊攻擊畫面 |
| 30 | **Battle — applyMonsterAttack & mistakes** | 7603–7878 | `applyMonsterAttack`、`playMistakeVoice`、`clearMistakes` | **High** | `applyMonsterAttack`, `playMistakeVoice` | — | **no** | 怪物攻擊、錯題本 |
| 31 | **Question generation** | 7880–9339 | `QUESTION_MIX_CONFIG`、`pickSkillForNormalLevel`、`generateQuestionBySkill`、`getChoices` | **DO NOT TOUCH** | `generateQuestionBySkill`, `startBossQueue`, `__debugQMix` | `earlyGamePools.v1.js`, `levels.v1.json` | **no** | 關卡題型分布 |
| 32 | **Audio — debug format & gesture tail** *(file-order)* | 8165–8687 | `formatAudioDebugValue`、`onUserGesture`、`ensureBgmElementSync` | **DO NOT TOUCH** | `onUserGesture`, `formatAudioDebugValue` | `audio-debug-manager.js` | **no** | 實體在 #31 之後；語意屬音訊 |
| 33 | **Battle — startLevel & initGame** | 8689–10207 | `startLevel`、`initGame`、題庫組裝、戰鬥 mentor 分支 | **High** | `initGame`, `startLevel`, `questions` | — | **no** | 開戰、教學關 |
| 34 | **Battle — feedback voice** | 10209–10517 | `playFeedbackVoice`、`playCorrectFeedback` | **High** | `playFeedbackVoice`, `playCorrectFeedback` | `FEEDBACK_VOICE_PATHS` | **no** | 稱讚語音 |
| 35 | **Battle — checkAnswer & nextQuestion** | 10519–10913 | 判定、傷害、combo、`nextQuestion` | **DO NOT TOUCH** | `checkAnswer`, `nextQuestion`, `addSkillMasteryProgress` | — | **no** | 答對/答錯全流程 |
| 36 | **Victory — grantRewards** *(core)* | 10877–11162 | EXP 發放、`processLevelUp`、勝利流程、EXP 條動畫、`playResultFanfare` 觸發 | **DO NOT TOUCH** | `grantRewards`, `processLevelUp`, `animateRewards` | `result-display-manager.js`（讀取用） | **no** | 獎勵／升級／結束流程；見 §結算畫面 |
| 36b | **Result — UI state & timers** | 3745–3817 | `animatedExp`、`displayedResult*`、通關計時、`resultUnlockedMilestones` 顯示狀態 | Low–Med | `monsterResultShown`, `stageClearElapsedSeconds` | `index.html` result modal | defer | 改 ref 預設值需小心 |
| 37 | **Handlers — retry / revive / potion** | 11415–11468 | `retryLevel`、`revive`、`usePotion` | Med | `retryLevel`, `revive`, `usePotion` | — | defer | 重試關、喝藥 |
| 38 | **Result — display bindings** | 11432–11494 | `createVueBindings`、`updateStageBestRecord` | Med | `accuracyPct`, `calculatedGrade`, `stageRecordRows` | `result-display-manager.js` | **yes**（顯示） | 評價／星等／紀錄表；見 §結算畫面 |
| 39 | **Boot hooks (2nd onMounted)** | 11539–11570 | changelog 版本 policy、音訊 unlock、`installTapChoicesLayoutHooks` | Med | `applyVersionStoragePolicy`, `unlockAudioOnce` | `changelog-manager.js` | defer | 首屏手勢後音訊 |
| 40 | **Debug — level jump** | 11584–11655 | `debugJumpToLevel`、`window.debugJumpToLevel` | Low | `debugJumpToLevel`, `isLevelJumpOpen` | `debug.js` | **yes** (dev) | Dev 關卡跳轉 |
| 41 | **Vue return & mount** | 11683–11731 | `return {…}`、`__attachDebugTools`、`_jpApp.mount` | Low–Med | `return {`, `_jpApp.mount` | `debug.js`, `index.html` | defer | 啟動不報錯 |

**區塊數量：** 41（含 #32 檔案順序備註列）
**High-risk / DO NOT TOUCH 區塊：** #5–12, #15–16, #24, #26–28, #30–32, #35–36

### 首頁／存檔入口（跨檔）

| 玩家看到的 | 主要 `game.js` | 主要其他檔 |
|------------|----------------|------------|
| 封面／開始／版本字 `v{{ appVersion }}` | #13 `appVersion`；#22 `showLevelSelect` | `index.html`（`v-if="showLevelSelect"`）、`assets/css/home.css` |
| 三槽存檔面板（流程） | #9 | `index.html` L2102–2148 |
| 存檔卡四行摘要 | #5b `saveSlotCards` | 見 §首頁存檔卡 |
| 進地圖（非首頁） | #8 `openMap`；#22 `showMap` | `settings-manager.js` 地圖節點樣式 |

### 首頁存檔卡（`saveSlotCards`）責任地圖

> **邊界：** 本節只涵蓋「卡上顯示什麼、怎麼排版」。**勿**改 `saveProgression` / `loadProgression` / migration / `clearSaveSlotStorage` / `confirmDeleteSaveSlot`（#5、#7、#9）。

| 層 | 位置 | 責任 | 可改？ |
|----|------|------|--------|
| **Vue computed** | `game.js` L352–366 `saveSlotCards` | 合併 metadata + 顯示欄位：`statusText`, `playerLevelText`, `highestUnlockedText`, `resonanceText`, `lastPlayedText`, `isEmpty`, `isActive` | 文案/欄位名可改；`isEmpty` 依 #5 `isSlotProgressionReadable`（慎改） |
| **顯示 helper** | `game-utils.js` `calculateSaveSlotResonanceText(isEmpty, progressionStorageKey)` | 讀槽內 progression **僅供**共鳴率字串；key 由 `game.js` `slotProgressionKey(slotId)` 傳入（不寫入） | 可改公式/文案；**勿**改 `PROGRESSION_KEY` / migration |
| **時間格式** | `game-utils.js` `formatSaveSlotTime` | `lastPlayedAt` → `zh-TW` 日期時間 | **yes** |
| **metadata 來源** | `game.js` L198–213 `buildEmptySaveSlotsMetadata` 等 | `playerLevel`, `highestUnlockedLevel`, `lastPlayedAt` 由 `updateActiveSaveSlotMetadata` 寫入 | **no**（屬 #5 核心） |
| **模板** | `index.html` L2102–2149 | `v-for="slot in saveSlotCards"`、四欄摘要（`sr-only` 標籤 + `<strong>`）、刪除鈕 | **yes**（結構/文案/a11y） |
| **樣式** | `assets/css/home.css` L257–617（RWD L674+） | `.save-slot-*` 面板、格線、卡面、刪除確認 | **yes**；見 `css-map.md` Phase 1-E |

**`saveSlotCards` 各欄位 → 模板綁定：**

| 欄位 | 空槽 | 有進度 | 資料來源 |
|------|------|--------|----------|
| `statusText` | `空存檔` | `已有進度` | computed（模板 active 時改顯示「目前選擇中」） |
| `playerLevelText` | `-` | `Lv.N` | metadata `playerLevel` |
| `highestUnlockedText` | `-` | `第 N 關` | metadata `highestUnlockedLevel` |
| `resonanceText` | `--% 共鳴率` | 依 progression 計算 | `calculateSaveSlotResonanceText` |
| `lastPlayedText` | `尚未遊玩` | 時間字串 | `formatSaveSlotTime(lastPlayedAt)` |

**與 save/load 核心的分界（DO NOT TOUCH 除非任務明示）：**

| 區塊 | 符號（`rg`） |
|------|----------------|
| 寫入 progression | `saveProgression`, `loadProgression` |
| 槽 metadata 持久化 | `writeSaveSlotsMetadata`, `updateActiveSaveSlotMetadata` |
| Migration | `ensureSaveSlotMigration`, `copyStorageValue` |
| 刪槽 | `clearSaveSlotStorage`, `confirmDeleteSaveSlot` |
| 選槽／新開局 | `selectSaveSlot`, `startNewGameFromSlot`, `setActiveSaveSlotId` |

### 結算畫面（Result display）責任地圖

> **邊界：** 本節涵蓋破關後 `monsterResultShown` 結算 modal、關卡紀錄表、等級獎勵浮層。**勿**改 `grantRewards` 內 EXP／`processLevelUp`／進度寫入／知識卡排程／`playResultFanfare` 時序（#36）。

| 層 | 位置 | 責任 | 可改？ |
|----|------|------|--------|
| **顯示格式化（優先改這裡）** | `assets/js/result-display-manager.js` | `accuracyPct`、`calculatedGrade`（S–E）、`stageStarRating` / `stageStarDisplay`（★☆）、`stageClearTimeText`、`stageRecordRows`、`formatStageBest*`、`buildCurrentStageRecordPayload` | **yes**（評價規則、星等、表格列） |
| **時間字串** | `game-utils.js` `formatStageClearTime` | 通關秒數 → `X.XX 秒` | **yes** |
| **等級獎勵卡片文案** | `result-display-manager.js` `RESULT_LEVEL_MILESTONE_REWARDS` | Lv5/10/20/25/30 浮層 `type` / `name` / `desc` | **yes** |
| **Vue 注入** | `game.js` L11432–11494 | `createVueBindings` 接線、`updateStageBestRecord` | 紀錄比較：**defer** |
| **結算 UI state** | `game.js` L3745–3817 | `animatedExp`、`displayedResult*`、`scheduleResultMilestoneRewards` | 動畫 state / 排程：**no**／defer |
| **結算模板** | `index.html` L3884–3970 | `v-if="monsterResultShown"` 內評價、EXP、按鈕 | **yes** |
| **等級獎勵浮層** | `index.html` L3984–4002 | `resultUnlockedMilestones` | **yes** |
| **關卡紀錄 modal** | `index.html` L3198+、L4618+ | `stageRecordRows` | **yes** |
| **樣式** | `result-mistakes.css` | `.result-*`、`.stage-record-*`、`.mistakes-*` | 見 `css-map.md` |

**`createVueBindings` → 結算 modal 常用綁定：** `calculatedGrade`、`accuracyPct`、`stageStarDisplay`、`stageClearTimeText`；EXP 動畫欄位（`animatedExp`、`displayedResult*`）由 **#36** 驅動。

**DO NOT TOUCH（結算相關）：** `grantRewards`、`processLevelUp`（#36 內）、`playResultFanfare`（#12/#36）、`checkAnswer` 勝利鏈、`saveProgression`（#36 內）。

### 想改星等／成績／最佳紀錄／等級獎勵浮層 — 速查

| 想改什麼 | 先看（優先順序） | 模板／樣式 | 勿碰 |
|----------|------------------|------------|------|
| **本場通關星等規則**（幾題錯、幾秒內 ★★★） | `result-display-manager.js` → `calculateStageStars`、`getDefaultStageStarTimeLimitSeconds`；關卡覆寫 `LEVEL_CONFIG[].starTimeLimitSeconds` | 結算 `index.html` L3898–3905（`stageStarRating` / `stageStarDisplay`） | `grantRewards` 內 EXP／升級 |
| **★/☆ 字串長相** | `formatStageStarsRow`（同上檔） | 同上 + 選關確認 `getStageBestStarsDisplay` | — |
| **本場 S–E 評價門檻** | `createVueBindings` → `calculatedGrade`（註解內門檻表） | 結算 L3910–3912；評價色 `game-utils.js` `getGradeColor` | `grantRewards` 內 `bestGrades` 寫入邏輯（除非連動測存檔） |
| **本場正確率數字** | `accuracyPct`（同上 `createVueBindings`） | 結算 L3914–3916 | — |
| **通關時間字串** | `game-utils.js` `formatStageClearTime`；`stageClearTimeText` computed | 結算 L3902–3905 | `stageClearElapsedSeconds` 計時起點在 `game.js` #36b |
| **歷史最佳星／時間（單關）** | `formatStageBestStarsDisplay`、`formatStageBestTimeDisplay`、`getStageBest*` | 選關確認 L2565–2570；全關卡表 L3233–3237 | `updateStageBestRecord`、`isStageRecordBetter`（#38，`game.js`） |
| **全關卡成績表列文案** | `buildStageRecordTableRows` → `stageRecordRows` | `index.html` L3198–3244、L4618+（地圖／戰鬥各一份 modal） | `bestGrades` 寫入（`grantRewards`）；`clearedLevels` 解鎖 |
| **全關卡表「S Rank N 關」** | `sRankCount`（掃 `stageRecordRows[].rank === 'S'`） | 摘要 L3215–3217 | — |
| **等級獎勵浮層卡片**（技能名／描述） | `RESULT_LEVEL_MILESTONE_REWARDS` | 浮層 L3984–4002；標題「等級獎勵解放」在 HTML | `grantRewards` 內 `resultUnlockedMilestones` **篩選**（哪幾級出現） |
| **浮層「學會新技能／解放新被動」標題** | — | `index.html` L3996 `reward.type` 分支 | — |
| **NEW BEST 標籤** | — | 結算 L3899（`stageResultIsNewBest` 由 `updateStageBestRecord` 設） | `updateStageBestRecord` 比較邏輯 |

**符號對照：** `stageRecordRows` = 全關卡表列資料；`formatStageStarsRow` = 僅星等字串；`calculatedGrade` / `accuracyPct` = 本場結算卡；`bestGrades` = 各關歷史最佳字母（表內 `row.rank`）。

---

## B. Before modifying — search here first

> 進入任務後**先** `rg` 符號名，再對照 §A 行號。只改 data 時不要打開 battle/audio 區。

| 任務類型 | 第一個 `rg` 目標 | §A 區塊 | 優先改檔 |
|----------|------------------|---------|----------|
| 首頁／封面／版本字 | `showLevelSelect`, `appVersion` | #13, #22 | `index.html`, `home.css` |
| 存檔卡顯示（四行摘要、共鳴率文案） | `saveSlotCards`, `calculateSaveSlotResonanceText` | **#5b** | `index.html`, `home.css`, `game-utils.js` |
| 存檔槽流程／新開局／刪檔 | `openSaveSlotPanel`, `selectSaveSlot` | #5, #7, #9 | `game.js`（高風險） |
| 設定／changelog | `openChangelog`, `createChangelogState` | #13 | `changelog-manager.js` |
| 地圖／選關 | `selectStageFromMap`, `openMap` | #8–11 | `map-chapters.json`, `settings-manager.js` |
| 共鳴輪圖鑑 | `codexWheelSkills`, `setCodexWheelPhase` | #14, #17–19 | `spirit-codex-helpers.js`, `codex.css` |
| 怪物圖鑑 | `monsterCodexEntries`, `buildMonsterCodexEntries` | #18 | `codex-display-utils.js` |
| 結算卡文案（評價、星等、時間字串） | `calculatedGrade`, `stageStarDisplay`, `formatStageClearTime` | **#38**, `result-display-manager.js` | `result-display-manager.js`, `game-utils.js` |
| 結算卡版面／按鈕 | `monsterResultShown`, `accuracyPct` | **#36b**, template | `index.html` L3884–3970, `result-mistakes.css` |
| 等級獎勵浮層文案 | `resultUnlockedMilestones`, `RESULT_LEVEL_MILESTONE_REWARDS` | manager + **#36b** | `result-display-manager.js` |
| EXP 動畫／發獎／升級 | `grantRewards`, `animatedExp` | **#36** | **DO NOT TOUCH**（除非任務明示） |
| 戰鬥出題 | `generateQuestionBySkill` | #31 | **僅** `earlyGamePools.v1.js`（內容） |
| 答題判定 | `checkAnswer` | #35 | **DO NOT TOUCH** |
| 音訊／BGM／TTS | `initAudio`, `playBgm`, `onUserGesture` | #24, #26, #32 | `audio-tts.js`；**DO NOT TOUCH** |
| 導師 | `setupMentorDialogue` | #15–16 | `mentor-dialogues.v1.json`（文案）；runtime **DO NOT TOUCH** |
| Dev 關卡跳轉 | `debugJumpToLevel` | #40 | `debug.js` |

## C. 未來 Agent 查找指南（依功能）

| 任務 | 先看 game.js 區塊 | 也看 | 風險備註 |
|------|-------------------|------|----------|
| 首頁 UI／版本顯示 | #13, #22 | `index.html`, `home.css`, `changelog-manager.js` | 低風險；勿動 `showLevelSelect` 切換邏輯除非任務要求 |
| 存檔卡顯示格式 | #5b | `game-utils.js`, `home.css` | 勿碰 #5/#9 寫入與刪槽 |
| 存檔 / 多槽 / 新開局（流程） | #5, #7, #9 | `storage-manager.js` | **high-risk** |
| 地圖 / 選關 / 回地圖 | #8–11 | `map-chapters.json`, `settings-manager.js` | 導師觸發鏈結 |
| 知識卡 / 解鎖演出 | #12 | `index.html` overlay | 與 `grantRewards` 串接 |
| 共鳴輪（小助靈圖鑑） | #14, #17–19 | `spirit-codex-helpers.js` | 輪上技能順序：`orderCodexWheelSkillsForResonance`（已外移） |
| 怪物圖鑑 | #18 | `codex-display-utils.js`, `enemies.v1.json` | 顯示優先 utils |
| 結算畫面顯示（評價／星等／紀錄表） | #38, `result-display-manager.js` | `index.html`, `result-mistakes.css` | **勿**改 `grantRewards` 內 EXP 計算 |
| 結算 EXP 動畫／發獎 | #36 | — | **DO NOT TOUCH** |
| 錯題本（mistakes） | #30, `mistakes` ref | `index.html` mistakes modal | 與結算 modal 不同 DOM |
| 技能（擬聲詞）施放 | #21 | `abilities.v1.json`, `hero-status.js` | buff 與 ATB 互動 |
| 藥水 / 重試 / 復活 | #37 | — | 會動到 `initGame` / `stopAllAudio` |
| 戰鬥特效（一般命中） | #27, #23 | `vfx-helpers.js`, `skill-vfx.js` | 勿改投射物時序 |
| Boss 專屬攻擊特效 | #29 | `battle.css` | 相對安全 |
| 出題 / 選項 / 干擾項 | #31 | **`earlyGamePools.v1.js`**（內容） | **game.js DO NOT TOUCH** |
| Boss / L36 題序 | #31 `startBossQueue` | pool data | 凍結 |
| 親密度 / `skillMastery` | #6, #35 | `addSkillMasteryProgress`；勿與已退役 `skillCorrectCounts` 混淆 | 存檔相容 |
| 導師對話 runtime | #15–16 | `mentor-dialogue-helpers.js`, `mentor-dialogues.v1.json` | **DO NOT TOUCH**（音訊） |
| 音訊 / BGM / TTS / 手勢恢復 | #24–26, #32 | `audio-tts.js`, `audio-debug-manager.js` | **DO NOT TOUCH**；#32 行號在出題區之後 |
| Changelog / 版本 reload | #13, #39 | `changelog-manager.js`, `index.html` `APP_VERSION` | 低風險 |
| Dev / debug | #13, #40, #41 | `debug.js`, `dev-tools.js` | 僅 dev |
| 題庫文案 / 正解 | —（**不要**先改 game.js） | `earlyGamePools.v1.js` 等 | 凍結時只改 data |

---

## D. 可拆檔候選 Roadmap

> 沿用 2026-05-24 盤查；**本 roadmap 僅文件**，不表示已排程實作。

### Phase 1 — 低風險 helper / formatter / computed

| Item | game.js lines | Proposed file | Est. lines | Depends on |
|------|---------------|---------------|------------|------------|
| ~~移除未使用 codex format 薄封裝~~ | — | — | — | **已完成**（2026-05-24） |
| ~~Monster codex entries builder~~ | — | `codex-display-utils.js` | ~75 | **已完成**（2026-05-24）：`buildMonsterCodexEntries` / `buildMonsterCodexEntry` / `formatMonsterSpawnStageText`；game.js 保留 Vue computed + UI handlers |
| ~~Codex wheel 排序純函式~~ | — | `spirit-codex-helpers.js` | ~40 | **已完成**（2026-05-24）：`orderCodexWheelSkillsForResonance` + `SPIRIT_RESONANCE_VISUAL_ORDER` |
| ~~`formatSaveSlotTime`~~ | — | `game-utils.js` | ~15 | **已完成**（2026-05-24）：首頁存檔卡時間字串；`game.js` 經 `__JPAPP_UTILS` |
| ~~`calculateSaveSlotResonanceText`~~ | — | `game-utils.js` | ~30 | **已完成**（2026-05-24）：`game.js` 傳 `slotProgressionKey`；`isSlotProgressionReadable` 仍留 #5 |
| `formatAudioDebugValue` + debug state | 8165–8190 | 擴 `audio-debug-manager.js` | ~30 | 接線已在 L4223；**不**動 `playBgm`/`playSfx` |

### Phase 2 — Codex wheel / result helper

| Item | game.js lines | Proposed file | Est. lines |
|------|---------------|---------------|------------|
| ~~`RESULT_LEVEL_MILESTONE_REWARDS` 文案表~~ | — | `result-display-manager.js` | ~6 | **已完成**（2026-05-24） |
| `resultLevelUpStatText` 字串組裝 | #36 內 | `result-display-manager.js` | ~15 | 仍耦合 `getDerivedMax*`；需與 #36 一併規劃 |
| 共鳴輪動畫 / 拖曳 / RAF | 2250–3043 | `codex-wheel-controller.js` | 500–650 |
| Boss death VFX 序列 | 3889–4106 | `boss-death-vfx.js` 或 `vfx-helpers.js` | ~220 |
| Boss 攻擊 VFX | 7114–7601 | `boss-attack-vfx.js` | ~490 |

### Phase 3 — Save / debug manager

| Item | game.js lines | Proposed file | Est. lines |
|------|---------------|---------------|------------|
| Save slot migration & metadata | 184–390, 900–1029 | `save-slot-manager.js` | ~220 |
| Global SP 模組 | 1–97 | `sp-manager.js` | ~97 |

### Phase 4 — 僅列出，暫不建議

| Item | game.js lines | Note |
|------|---------------|------|
| Question engine | 7880–9339 | 題庫 wrap-up 凍結；拆檔需專項 + 回歸 |
| Audio core | 4108–6731, 8165–8687 | iOS Safari 高風險；含檔案順序交錯的 gesture tail |
| Mentor manager | 1842–2198 | 與 TTS/BGM lifecycle 綁死 |
| Battle judgment | 10519–10913 | 與 `initGame`、教學流程耦合 |
| Vue `setup()` 主體 | 103–11681 | 最終整合層，不拆 |

---

## E. Dead Code 清理候選（僅文件）

### 已完成（runtime 已移除）

| Symbol / area | 完成日 | 歷史註記 |
|---------------|--------|----------|
| `skillCorrectCounts` / `normalizeSkillCorrectCountsMap` | 2026-05-24 | 舊「累計答對次數／雙次制」（normalize `% 2`）殘留；現役親密度僅 **`skillMastery`**（答對 +1，`addSkillMasteryProgress`）。舊存檔 JSON 若含 `skillCorrectCounts`：**load 時忽略**，**save 不再寫回**。 |
| `orderCodexWheelSkillsForResonance` + `SPIRIT_RESONANCE_VISUAL_ORDER` | 2026-05-24 | 外移至 `spirit-codex-helpers.js`；`game.js` `codexWheelSkills` computed 改呼叫 helper；boot fallback 為 identity 陣列。 |
| `formatSaveSlotTime` | 2026-05-24 | 外移至 `game-utils.js`；`saveSlotCards.lastPlayedText` 仍經 `__JPAPP_UTILS` + setup fallback。 |
| `calculateSaveSlotResonanceText` | 2026-05-24 | 外移至 `game-utils.js`；`saveSlotCards` 傳 `isEmpty` + `slotProgressionKey(slotId)`；setup fallback 占位 `--% 共鳴率`。 |
| `resultLevelMilestoneRewards` 常數表 | 2026-05-24 | 外移至 `result-display-manager.js` `RESULT_LEVEL_MILESTONE_REWARDS`；`game.js` 保留 boot fallback。 |
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
| Monster codex inline map/sort | 2026-05-24 | `monsterCodexEntries` 內 ~35 行組裝邏輯外移；`game.js` computed 改呼叫 `JPAPPCodexDisplayUtils.buildMonsterCodexEntries`。 |
| `game.js` changelog inline fallback | 2026-05-24 | 與 `changelog-manager.js` 重複的 `createChangelogState` 副本已刪；與 `settings-manager` 相同，假設 script 已載入。 |
| `changelog-manager.js` `Array.prototype.random` | 2026-05-24 | 全 repo 無 `.random()` 陣列呼叫；與 changelog 無關。 |
| `versionImageAsset` inline 實作 | 2026-05-24 | 改薄封裝 `JPAPPChangelogManager.appendVersionQuery`（導師圖等仍經 `versionImageAsset` 別名）。 |

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

## F. Section header 建議草案

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
- **親密度存檔：** 僅 `skillMastery`；`skillCorrectCounts` 已退役（見 §E 已完成）。
- **行號校正：** `rg -n "const saveProgression|const generateQuestionBySkill|const checkAnswer|_jpApp.mount" assets/js/game.js`
