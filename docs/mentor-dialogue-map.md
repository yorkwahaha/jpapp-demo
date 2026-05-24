# Mentor Dialogue Map

本文件盤點 `assets/js/game.js` 內導師對話相關區塊，作為未來模組化前的風險邊界。此輪不做正式外移，不改玩家可見行為，不碰音訊、TTS、mentor audio、BGM/SFX/fanfare/iOS resume。

> **Doc sync:** 2026-05-24 — §觸發路由總表、§台詞資料來源、ending／initGame／result 分支（`rg setupMentorDialogue` 實測）
> **實證排查：** 2026-05-24 — §已確認（`triggerMentorDialogue` 死路徑，**未修**）
> **L36 真結局：** 2026-05-24 — **已修正**：`getMentorDialogueEntry('MAIN_ENDING_FINALE')` alias → `FINAL_ENDING`（`game.js`，未改 JSON）
> **行號：** 下列 `game.js` 行號以當次 `rg` 為準，會漂移；改動前請再 `rg "setupMentorDialogue|finishMentorDialogue"`。

## 參考基準

- [`game-js-map.md`](./game-js-map.md) §A #15–16（導師 state／runtime）、#8 `openMap`、#10–11 `selectStageFromMap`、§地圖流程、§地圖顯示層。
- [`code-ownership-map.md`](./code-ownership-map.md) — Mentor **DO NOT TOUCH**；地圖顯示 vs 地圖流程分列。
- 目前低風險 helper 外移已完成：`dev-tools.js`、`spirit-codex-helpers.js`、`vfx-helpers.js`、`mentor-dialogue-helpers.js`。本盤點不還原既有外移。

## 區塊盤點

| 位置 | 區塊 | 用途 | 類型 | 風險 | 外移判斷 |
| --- | --- | --- | --- | --- | --- |
| `game.js` ~L1569+ | Mentor reactive state | `mentorTutorialSeen`、modal/map overlay 狀態、頁面 index、typing 狀態、portrait/video/audio token 等。 | B/C | 中-高 | 不建議低風險輪外移。這些是 Vue state 與 audio token 的根。 |
| `game.js` L1056-L1106 | `fragmentMentorDialogue` | 將集中化對話資料切成顯示頁，並同步建立 `mentorPageEmotions`。 | A | 低-中 | 純分頁計算已外移為 `paginateMentorDialogue`；`game.js` 保留寫入 Vue emotion state 的薄整合層。 |
| `game.js` L1108-L1154 | current line / emotion image helpers | 取得目前文字、emotion、modal/scene image fallback，處理圖片載入失敗。 | A/B | 低-中 | 純 path lookup 已外移為 `resolveMentorEmotionImage`；computed 與 error handler 仍留在 `game.js`，因為會讀寫 Vue state 與 DOM event target。 |
| `game.js` L1156-L1162 | `isLastMentorLine` | 判斷目前是否最後一頁。 | A | 低 | 純判斷已外移為 `isLastMentorLine`；Vue computed wrapper 留在 `game.js`。 |
| `game.js` L1164-L1255 | mentor video helpers | video source 解析、元素取得、播放/停止、錯誤處理，包含 `stopAllAudio()` 與 `masterVolume`。 | C | 高 | 不可在低風險整理輪碰；需等 audio/video lifecycle 專輪。 |
| `game.js` L1257-L1267 | mentor seen state persistence | 載入與儲存 `mentorTutorialSeen`。 | B | 中 | 綁 `JPAPPStorageManager` 與首次觀看邏輯，暫不外移。 |
| `game.js` ~L1838+ | `setupMentorDialogue` | 設定目前導師資料、讀 `MENTOR_AUDIO_MAP` fallback、依 `showMap` 開 map/modal overlay、typing、mentor audio、mentor video。 | B/C/D | 高 | 不可在低風險整理輪碰；見 §地圖／關卡確認觸發點。 |
| `game.js` L1306-L1324 | `triggerMentorDialogue` | 依 skillId 找 skill、檢查 seen state、啟動導師對話。 | B/D | 中-高 | 未來可抽出 lookup/check 的純部分；不能在低風險輪移動觸發流程。 |
| `game.js` L1326-L1358 | `startMentorTyping` | 打字機效果與 timer。 | B | 中 | 可讀性上獨立，但涉及 UI timing 與 skip 行為，需謹慎。 |
| `game.js` L1360-L1374 | `getMentorAudioPath` | 從 `MENTOR_AUDIO_MAP` 取 page audio path，保留 `WA_TOPIC_BASIC` legacy fallback。 | C | 高 | 雖像純 lookup，但屬 mentor audio 合約，不可在本輪碰。 |
| `game.js` L1376-L1487 | `stopMentorAudio` / `playMentorAudioForCurrentPage` | 停止 TTS/WebSpeech、停止目前 mentor audio、HEAD 檢查 mp3、播放、duck/restore map BGM、stale token guard。 | C | 高 | 明確不可在低風險整理輪碰；需 audio lifecycle 專輪。 |
| `game.js` L1489-L1543 | `completeMentorLine` / `restartMentorDialogue` / `nextMentorLine` | 完成當前頁、重播對話、下一頁或結束，並觸發 page audio/video。 | B/C | 中-高 | paging 狀態可分析，但因每頁切換會播放 mentor audio，不在本輪外移。 |
| `game.js` ~L2113+ | `finishMentorDialogue` | 寫入 seen state、停止 mentor audio/video、關閉 overlay、解除 stage suspend、更新音量、執行 `_resumeAfterMentor`。 | B/C/D | 高 | 不可在低風險整理輪碰；地圖／確認窗 resume 入口。 |
| `game.js` L1595-L1625 | long-press skip helpers | 長按 skip 狀態、timer、SFX、呼叫 `finishMentorDialogue`。 | B/C | 中-高 | UI 行為與結束 lifecycle 相連，暫不外移。 |

## `setupMentorDialogue` 入口總表（2026-05-24 `rg`）

> **單一實作：** `game.js` ~L1840+。參數為 **skill 物件**（含 `id`、`name`、可選 `mentorDialogue`）。台詞解析見 §台詞資料來源。

| # | 呼叫鏈 | `game.js`（約） | 傳入 `id` / 物件 | `_resumeAfterMentor` |
|---|--------|----------------|------------------|----------------------|
| 1 | `openMap` → `checkPrologueTrigger` | L729、L741 | `PROLOGUE_OPENING`（物件）；fallback 內嵌 3 行 | 關 special scene → map BGM |
| 2 | `selectStageFromMap` Auto-Mentor | L1113–L1115 | `L36_FIRST_ENTRY` 或 **skill**（`config.skillId`） | 開 `isBattleConfirmOpen` |
| 3 | `startStageWithExplanation` | L1146 | **skill** | 通常無（確認窗 `stageConfirmSuspendedForMentor`） |
| 4 | `checkGlobalEndingTriggers` L36 首通 | L1185–L1188 | `MAIN_ENDING_FINALE` + 內聯 `mentorDialogue` | `openMap` |
| 5 | 同上 L36 已通關分支 | L1205–L1208 | `MAIN_ENDING_FINALE`（僅 id／name） | **無**（`return` 前設 flag） |
| 6 | `checkGlobalEndingTriggers` L35 全 S | L1227–L1228 | `ENDING_L35_ALL_S` 或 `ENDING_L35_ALL_S_AT_35` | **無** |
| 7 | 同上 L35 一般結局 | L1231 | `ENDING_L35_NORMAL` | **無** |
| 8 | `triggerMentorDialogue` → `setupMentorDialogue` | L1890 | **skill**（`skillsAll[skillId]`） | 由 `initGame` 設定（見下表） |
| 9 | `playMainEndingFinale`（dev／debug） | L1240–L1246 | 間接 #4 | 同 #4 |

**未呼叫 `setupMentorDialogue`（對照）：** `grantRewards`／結算 tally（僅 `triggerNextKnowledgeCard`、`playResultFanfare`）、`returnToMap`、`handleEscapeToMap`、`confirmAndStartBattle`。

## `finishMentorDialogue` 結束後分流（~L2115+）

| 步驟 | 行為 |
|------|------|
| 1 | 清除打字 timer |
| 2 | 若 `currentMentorSkill.id` 不在 `mentorTutorialSeen` → `push` + `saveMentorState()` |
| 3 | `stopMentorAudio` / `stopMentorVideo` |
| 4 | `isMentorModalOpen` / `isMapMentorOpen` → false |
| 5 | `stageConfirmSuspendedForMentor` → false |
| 6 | `updateGainVolumes()` |
| 7 | 若有 `window._resumeAfterMentor` → 執行後清空 |

**誰會呼叫 `finishMentorDialogue`：** `nextMentorLine` 最後一頁（~L2101）；長按 skip 3 秒（~L2177）。UI：`nextMentorLine` 綁定地圖 overlay 點擊等（`index.html` `.map-mentor-overlay`）。

**seen key 注意：** 地圖 Auto-Mentor 在進入前已 `push` `STAGE_INTRO_n`／`L36_FIRST_ENTRY`（~L1101）；`finishMentorDialogue` 另可能 `push` **`currentMentorSkill.id`**（skill id，如 `WA_TOPIC_BASIC`）。兩者 key 不同屬**現行設計**；改 seen 邏輯前需手測重播。

## 台詞資料來源對照（勿改 JSON 本輪）

`setupMentorDialogue` 內解析順序（~L1844）：

```text
centralizedData = getMentorDialogueEntry(skill.id)  // → MENTOR_AUDIO_MAP（fetch mentor-dialogues.v1.json）
dialogueSource = centralizedData?.dialogue || skill.mentorDialogue || []
```

| 類型 | 來源檔 | 查詢 key | 用於 |
|------|--------|----------|------|
| **A. 集中化 JSON** | `assets/data/mentor-dialogues.v1.json` | 頂層 key = `skill.id` 或結局 id | 序章、關卡 intro、結局、L36；`getMentorDialogueEntry` alias：`PROLOGUE_OPENING`→`PROLOGUE`、`MAIN_ENDING_FINALE`→`FINAL_ENDING` |
| **B. 呼叫端內聯** | — | — | `checkPrologueTrigger` fallback 三行；L36 首通內聯 `getMentorDialogueEntry('MAIN_ENDING_FINALE')?.dialogue` |
| **C. skill 物件欄位** | 理論上 `skills.v1.json` | `skill.mentorDialogue` | `triggerMentorDialogue` **進入條件**要求此欄；**已確認** `skills.v1.json` 無此欄且 `loadGameData` 不 merge → `initGame` 內 `triggerMentorDialogue` **永不觸發**（見 §已確認） |
| **D. 程式組裝 id** | — | `STAGE_INTRO_{n}` 僅用於 **seen**，非 JSON key | 地圖首次點關；台詞仍走 A（skill.id） |

**JSON 頂層 key 一覽（2026-05-24，`rg '^  \"[A-Z]' mentor-dialogues`）：**
`PROLOGUE`、`WA_TOPIC_BASIC` … 各關技能 id、`BOSS_REVIEW_*`、`FINAL_BOSS_35`、`ENDING_L35_NORMAL`、`ENDING_L35_ALL_S`、`ENDING_L35_ALL_S_AT_35`、`L36_FIRST_ENTRY`、`HIDDEN_BOSS_36`、`FINAL_ENDING`。

**程式 id 與 JSON 不一致（修資料／runtime 時對照）：**

| 程式使用的 id | JSON 現有 key | 備註 |
|---------------|---------------|------|
| `PROLOGUE_OPENING` | `PROLOGUE`（+ `getMentorDialogueEntry` fallback） | 有序章 fallback 內嵌；**非 bug** |
| `MAIN_ENDING_FINALE` | `FINAL_ENDING`（JSON 無 `MAIN_ENDING_FINALE` key） | **已修正**：程式 id 仍為 `MAIN_ENDING_FINALE`；`getMentorDialogueEntry` alias → `FINAL_ENDING`（台詞＋`getMentorAudioPath`） |

## 已確認／已修正（2026-05-24）

| 項目 | 狀態 | 備註 |
|------|------|------|
| **`MAIN_ENDING_FINALE` vs `FINAL_ENDING`** | **已修正** | `getMentorDialogueEntry`：`MAIN_ENDING_FINALE` → `mentorMap.FINAL_ENDING`；L36 首通內聯改 `getMentorDialogueEntry('MAIN_ENDING_FINALE')?.dialogue`。`setupMentorDialogue`／`getMentorAudioPath` 沿用程式 id `MAIN_ENDING_FINALE`，資料來自 JSON `FINAL_ENDING`。 |
| **`triggerMentorDialogue` + `skills.v1.json`** | **已確認，未修** | 另開任務；見下表建議 **C**。 |
| **仍會播導師的 `initGame` 外路徑** | 不變 | 地圖 Auto-Mentor、`startStageWithExplanation`、L35/L36 結局等直接 `setupMentorDialogue`。 |

**待辦修法（僅 `triggerMentorDialogue`，未實作）：**

| 方案 | 作法 | 風險 |
|------|------|------|
| **C（`triggerMentorDialogue`）** | 進入條件改為 `getMentorDialogueEntry(skillId)?.dialogue?.length`（或移除 `skill.mentorDialogue` 硬性要求） | 中；影響 `initGame` 開戰前是否彈導師；需手測 seen／timer |

## Ending／Boss／`initGame`／Result 觸發表

### `checkGlobalEndingTriggers`（~L1163；由 `openMap`／`returnToMap`／`playMainEndingFinale` 呼叫）

| 條件 | `setupMentorDialogue` id | 資料來源 | 結束後 |
|------|------------------------|----------|--------|
| 首次通關 L36（`currentLevel===36`） | `MAIN_ENDING_FINALE` | A：alias → JSON `FINAL_ENDING`（內聯＋`setupMentorDialogue`） | `_resumeAfterMentor` → `openMap` |
| 已通關 L36 且未設 `jpRpgTrueEndingSeen` | `MAIN_ENDING_FINALE` | A：同上（僅 id／name 時靠 `getMentorDialogueEntry`） | **無** `_resumeAfterMentor`（函式 `return`） |
| L35 全關 S rank、首次 | `ENDING_L35_ALL_S` 或 `ENDING_L35_ALL_S_AT_35` | A：JSON | **無** |
| L35 通關、非全 S、首次 | `ENDING_L35_NORMAL` | A：JSON | **無** |

**Boss 戰鬥中：** `grantRewards` 內 `playSfx('bossClear')`（魔王）／`win` — **非** mentor dialogue。

### `initGame`（~L9437+；開戰前）

| 分支 | 條件 | 機制 | `_resumeAfterMentor` |
|------|------|------|----------------------|
| 新 unlock 技能 | `config.unlockSkills` 新增 | `triggerMentorDialogue(firstNewSkillId)` | 設了 token 但 callback **空**（~L9470）**待確認** 是否刻意 |
| 關卡 instruction | `config.skillId`、未 skip | `triggerMentorDialogue(config.skillId)` | `startTimer()` + `uiPop`（~L9497） |
| 跳過 | `_disableMentorAutoTrigger`／`skipMentor` | 不呼叫 | — |

同關 **knowledge card**（非 mentor overlay）：`pendingKnowledgeCards` → 勝利後 `grantRewards` → `triggerNextKnowledgeCard`（獨立流程）。

### Result／破關（`grantRewards` #36）

| 項目 | 是否 mentor dialogue |
|------|---------------------|
| `playResultFanfare` / `bossClear` / `win` | 否（音訊 only） |
| `triggerNextKnowledgeCard` | 否（知識卡 overlay） |
| `monsterResultShown` 結算 UI | 否 |
| 玩家按「返回地圖」 | `returnToMap`；無 `setupMentorDialogue` |

## 地圖／關卡確認相關觸發點（已知入口）

> **UI 對照：** 地圖上導師用 `isMapMentorOpen` + `index.html` `.map-mentor-overlay`（~L2645+）；關卡確認窗「姐姐引導」用 `startStageWithExplanation`；首頁封面僅靜態立繪（`.home-mentor-keyart`），**不**走 `setupMentorDialogue`。

| 玩家情境 | 觸發函式 | `game.js`（約） | 對話／seen key | 結束後 `_resumeAfterMentor` | 交叉文件 |
|----------|----------|----------------|---------------|---------------------------|----------|
| **首次進地圖（序章）** | `openMap` → `checkPrologueTrigger` | L763–767、L697+ | `PROLOGUE_OPENING`（資料 fallback `PROLOGUE`） | 關 special scene → map BGM／`MapAmbient` | `game-js-map` §地圖流程 `openMap` |
| **地圖點關卡（首次）** | `selectStageFromMap` Auto-Mentor | L1082–1117 | `STAGE_INTRO_{n}` 或 L36：`L36_FIRST_ENTRY` | 開 `isBattleConfirmOpen` | `game-js-map` §地圖顯示層 確認窗 |
| **關卡確認窗「姐姐引導」** | `startStageWithExplanation` | L1137–1154 | 關卡 `skillId` / `unlockSkills[0]` → `setupMentorDialogue(skill)` | （無固定 resume；`stageConfirmSuspendedForMentor`） | `index.html` `.stage-confirm-mentor-*` |
| **L35/L36 結局** | `checkGlobalEndingTriggers` | L1163+ | 見 §Ending 表 | 部分分支 `openMap` | §觸發路由 #4–7 |
| **戰鬥開局** | `initGame` → `triggerMentorDialogue` | ~L9464、L9490 | skill id | `startTimer` 等 | §`initGame` 表 |
| **破關回地圖** | `returnToMap` | ~L1308+ | — | — | **不播導師** |

**`setupMentorDialogue` 選 overlay（~L1852）：** `showMap` → `isMapMentorOpen`；否則 `isMentorModalOpen`。詳見 §台詞資料來源。

## 關聯入口與綁定

| 位置 | 區塊 | 用途 | 類型 | 風險 | 備註 |
| --- | --- | --- | --- | --- | --- |
| `game.js` ~L697+ | `checkPrologueTrigger` | 首次進地圖時開啟序章 special scene、設定 `_resumeAfterMentor`、呼叫 `setupMentorDialogue`、可選 prologue BGM。 | C/D | 高 | 由 `openMap` 呼叫；見 §地圖／關卡確認觸發點。 |
| `game.js` ~L1082–1117 | `selectStageFromMap` stage intro | 首次點關卡時 `STAGE_INTRO_n` / `L36_FIRST_ENTRY`，寫入 seen，導師結束後開 battle confirm。 | B/D | 高 | 與 `confirmAndStartBattle` 分離；勿在 display 任務改邏輯。 |
| `game.js` ~L1137–1154 | `startStageWithExplanation` | 關卡確認窗「姐姐引導」；`stageConfirmSuspendedForMentor`。 | B/D | 高 | 模板 `index.html` L2596+。 |
| `game.js` ~L1161+ | ending dialogue triggers | L35/L36 結局、special scene、BGM override、呼叫 `setupMentorDialogue`。 | C/D | 高 | L35 走 JSON id 正常；L36 alias **已修正** §已確認／已修正。 |
| `game.js` L168-L172, L899-L933, L9370-L9384 | knowledge card queue | 新技能 knowledge card 排程、顯示、吸收動畫、接回結算 tally。 | D | 高 | 與 unlock reward/victory flow 綁定，不在 mentor 低風險輪處理。 |
| `game.js` L7666-L7864 | `initGame` mentor/unlock branch | 新技能 unlock 時嘗試導師、pending knowledge card、instruction mentor、`_resumeAfterMentor` 後啟動 timer。 | D | 高 | 不可在低風險整理輪碰；會影響 battle start、unlock flow、stage intro。 |
| `game.js` L8395-L8663 | TTS / feedback voice | Web Speech、feedback mp3、combo/correct praise voice。 | C | 高 | 明確不可在低風險整理輪碰；屬 TTS/voice/audio。 |
| `game.js` L9768-L9868 | mounted audio unlock and debug jump cleanup | user gesture audio unlock、debug jump 時清 typing timer 與 mentor audio、關 overlay。 | C | 高 | 不可在低風險整理輪碰；與 iOS resume/audio lifecycle 相關。 |

## 未來可外移候選

低風險候選只限純 lookup 或 format helper，且建議先以小步驗證：

1. 已外移：純文字分頁計算 `paginateMentorDialogue(dialogues)`，回傳 `{ pages, emotions }`。
2. 已外移：emotion image path lookup `resolveMentorEmotionImage(emotion, imagePaths, failedPaths)`，error handler 與 Vue state 寫入仍在 `game.js`。
3. 已外移：最後一頁判斷 `isLastMentorLine(pageCount, pageIndex)`，Vue computed wrapper 仍在 `game.js`。
4. 未來候選：`triggerMentorDialogue` 的純 lookup/check 片段，只可抽「skill 是否存在、是否已 seen」判斷；實際 `setupMentorDialogue` 呼叫仍留在整合層。

## 不可在低風險整理輪碰

- `stopMentorAudio`、`playMentorAudioForCurrentPage`、`getMentorAudioPath`，以及任何 mentor mp3 fallback、HEAD 檢查、stale token guard。
- `stopTtsAudio`、`stopWebSpeech`、`window.playTtsKey`、feedback voice、combo voice、correct voice。
- `duckMapBgmForVoice`、`restoreMapBgmAfterVoice`、`stopAllAudio`、`playBgm`、`playSfx`、fanfare、iOS gesture resume。
- `setupMentorDialogue`、`finishMentorDialogue`、`nextMentorLine` 中會觸發 audio/video/lifecycle 的行為。
- `checkPrologueTrigger`、`checkGlobalEndingTriggers`、`selectStageFromMap`、`startStageWithExplanation`、`initGame` 的 unlock/instruction mentor branch。
- knowledge card queue 與 victory tally 接續流程。

## 建議下一輪

下一輪若繼續整理，範圍仍應只限「無播放、無 Vue state 寫入、無 `_resumeAfterMentor`、無 localStorage 寫入」的函式。可評估 `triggerMentorDialogue` 的純 lookup/check 片段，但實際觸發、overlay、audio/video、seen-state 與 lifecycle 仍不應放進低風險整理輪。

## 相關文件

| 文件 | 用途 |
|------|------|
| [`game-js-map.md`](./game-js-map.md) | §Mentor×地圖交叉、§地圖流程、§想改地圖…速查 |
| [`code-ownership-map.md`](./code-ownership-map.md) | §想改導師在地圖／確認窗出現 |
| [`css-map.md`](./css-map.md) | `.map-mentor-overlay`、`.stage-confirm-mentor-*` 視覺歸屬 |
