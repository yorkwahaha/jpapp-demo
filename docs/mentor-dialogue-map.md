# Mentor Dialogue Map

本文件盤點 `assets/js/game.js` 內導師對話相關區塊，作為未來模組化前的風險邊界。此輪不做正式外移，不改玩家可見行為，不碰音訊、TTS、mentor audio、BGM/SFX/fanfare/iOS resume。

> **Doc sync:** 2026-05-24 — §地圖／關卡確認觸發點（交叉 `game-js-map.md` §地圖流程／§地圖顯示層）
> **行號：** 下列 `game.js` 行號以 `rg` 當次盤查為準，會漂移；改動前請再 `rg "setupMentorDialogue|checkPrologueTrigger"`。

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

## 地圖／關卡確認相關觸發點（已知入口）

> **UI 對照：** 地圖上導師用 `isMapMentorOpen` + `index.html` `.map-mentor-overlay`（~L2645+）；關卡確認窗「姐姐引導」用 `startStageWithExplanation`；首頁封面僅靜態立繪（`.home-mentor-keyart`），**不**走 `setupMentorDialogue`。

| 玩家情境 | 觸發函式 | `game.js`（約） | 對話／seen key | 結束後 `_resumeAfterMentor` | 交叉文件 |
|----------|----------|----------------|---------------|---------------------------|----------|
| **首次進地圖（序章）** | `openMap` → `checkPrologueTrigger` | L763–767、L697+ | `PROLOGUE_OPENING`（資料 fallback `PROLOGUE`） | 關 special scene → map BGM／`MapAmbient` | `game-js-map` §地圖流程 `openMap` |
| **地圖點關卡（首次）** | `selectStageFromMap` Auto-Mentor | L1082–1117 | `STAGE_INTRO_{n}` 或 L36：`L36_FIRST_ENTRY` | 開 `isBattleConfirmOpen` | `game-js-map` §地圖顯示層 確認窗 |
| **關卡確認窗「姐姐引導」** | `startStageWithExplanation` | L1137–1154 | 關卡 `skillId` / `unlockSkills[0]` → `setupMentorDialogue(skill)` | （無固定 resume；`stageConfirmSuspendedForMentor`） | `index.html` `.stage-confirm-mentor-*` |
| **L35/L36 結局／特殊場景** | `checkGlobalEndingTriggers` 等 | L1161+ | `MAIN_ENDING_FINALE` 等 | 可能 `openMap` | 見下表 ending 列；**待確認**細部分支 |
| **戰鬥開局教學** | `initGame` 內 instruction mentor | ~L9468+ | 依關卡／unlock | 開 timer／下一題 | **非地圖**；見下表 `initGame` |
| **破關回地圖** | `returnToMap` | ~L1308+ | — | — | **不播導師**；見 `game-js-map` §想改回地圖路徑 |

**`setupMentorDialogue` 選 overlay（~L1850）：** `showMap.value === true` → `isMapMentorOpen`（地圖）；否則 `isMentorModalOpen`。關卡確認窗在導師播放時會 `opacity-0`（`isMapMentorOpen \|\| isMentorModalOpen`）。

**文案／台詞資料（只讀對照，本輪不改 JSON）：**

| 用途 | 優先讀取 | 備註 |
|------|----------|------|
| 序章、L36 專用、集中化台詞 | `assets/data/mentor-dialogues.v1.json` | `getMentorDialogueEntry`；`PROLOGUE_OPENING` 可 fallback `PROLOGUE` |
| 一般關卡 stage intro | `skills.v1.json` 內 skill 的 `mentorDialogue` | `selectStageFromMap` 傳入 `setupMentorDialogue(skill)` |
| 是否再播 | `mentorTutorialSeen` + `saveMentorState` | key 見上表；存於 `storage-manager` / slot-scoped seen |

**待確認（勿猜測實作）：** `checkGlobalEndingTriggers` 內各分支與 `playMainEndingFinale` 的完整 mentor id 列表；`triggerMentorDialogue` 是否仍有地圖外入口。改動前請 `rg setupMentorDialogue` 全檔。

## 關聯入口與綁定

| 位置 | 區塊 | 用途 | 類型 | 風險 | 備註 |
| --- | --- | --- | --- | --- | --- |
| `game.js` ~L697+ | `checkPrologueTrigger` | 首次進地圖時開啟序章 special scene、設定 `_resumeAfterMentor`、呼叫 `setupMentorDialogue`、可選 prologue BGM。 | C/D | 高 | 由 `openMap` 呼叫；見 §地圖／關卡確認觸發點。 |
| `game.js` ~L1082–1117 | `selectStageFromMap` stage intro | 首次點關卡時 `STAGE_INTRO_n` / `L36_FIRST_ENTRY`，寫入 seen，導師結束後開 battle confirm。 | B/D | 高 | 與 `confirmAndStartBattle` 分離；勿在 display 任務改邏輯。 |
| `game.js` ~L1137–1154 | `startStageWithExplanation` | 關卡確認窗「姐姐引導」；`stageConfirmSuspendedForMentor`。 | B/D | 高 | 模板 `index.html` L2596+。 |
| `game.js` ~L1161+ | ending dialogue triggers | L35/L36 結局、special scene、BGM override、呼叫 `setupMentorDialogue`。 | C/D | 高 | 與 `returnToMap`／`openMap` 交錯；細節待確認。 |
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
