# Mentor Dialogue Map

本文件盤點 `assets/js/game.js` 內導師對話相關區塊，作為未來模組化前的風險邊界。此輪不做正式外移，不改玩家可見行為，不碰音訊、TTS、mentor audio、BGM/SFX/fanfare/iOS resume。

## 參考基準

- `docs/game-js-map.md` 將 Mentor System 粗略標在 `game.js` L1041-L1620，並將 TTS/Feedback、Audio Core、initGame、Victory Flow 等列為高風險或中高耦合區塊。
- 目前低風險 helper 外移已完成：`assets/js/dev-tools.js`、`assets/js/spirit-codex-helpers.js`、`assets/js/vfx-helpers.js`、`assets/js/mentor-dialogue-helpers.js`。本盤點不還原既有外移。

## 區塊盤點

| 位置 | 區塊 | 用途 | 類型 | 風險 | 外移判斷 |
| --- | --- | --- | --- | --- | --- |
| `game.js` L1014-L1052 | Mentor reactive state | `mentorTutorialSeen`、modal/map overlay 狀態、頁面 index、typing 狀態、portrait/video/audio token 等。 | B/C | 中-高 | 不建議低風險輪外移。這些是 Vue state 與 audio token 的根。 |
| `game.js` L1056-L1106 | `fragmentMentorDialogue` | 將集中化對話資料切成顯示頁，並同步建立 `mentorPageEmotions`。 | A | 低-中 | 純分頁計算已外移為 `paginateMentorDialogue`；`game.js` 保留寫入 Vue emotion state 的薄整合層。 |
| `game.js` L1108-L1154 | current line / emotion image helpers | 取得目前文字、emotion、modal/scene image fallback，處理圖片載入失敗。 | A/B | 低-中 | 純 path lookup 已外移為 `resolveMentorEmotionImage`；computed 與 error handler 仍留在 `game.js`，因為會讀寫 Vue state 與 DOM event target。 |
| `game.js` L1156-L1162 | `isLastMentorLine` | 判斷目前是否最後一頁。 | A | 低 | 純判斷已外移為 `isLastMentorLine`；Vue computed wrapper 留在 `game.js`。 |
| `game.js` L1164-L1255 | mentor video helpers | video source 解析、元素取得、播放/停止、錯誤處理，包含 `stopAllAudio()` 與 `masterVolume`。 | C | 高 | 不可在低風險整理輪碰；需等 audio/video lifecycle 專輪。 |
| `game.js` L1257-L1267 | mentor seen state persistence | 載入與儲存 `mentorTutorialSeen`。 | B | 中 | 綁 `JPAPPStorageManager` 與首次觀看邏輯，暫不外移。 |
| `game.js` L1270-L1304 | `setupMentorDialogue` | 設定目前導師資料、讀 `MENTOR_AUDIO_MAP` fallback、開 map/modal overlay、啟動 typing、mentor audio、mentor video。 | B/C/D | 高 | 不可在低風險整理輪碰；同時碰 overlay、audio、video、資料 fallback。 |
| `game.js` L1306-L1324 | `triggerMentorDialogue` | 依 skillId 找 skill、檢查 seen state、啟動導師對話。 | B/D | 中-高 | 未來可抽出 lookup/check 的純部分；不能在低風險輪移動觸發流程。 |
| `game.js` L1326-L1358 | `startMentorTyping` | 打字機效果與 timer。 | B | 中 | 可讀性上獨立，但涉及 UI timing 與 skip 行為，需謹慎。 |
| `game.js` L1360-L1374 | `getMentorAudioPath` | 從 `MENTOR_AUDIO_MAP` 取 page audio path，保留 `WA_TOPIC_BASIC` legacy fallback。 | C | 高 | 雖像純 lookup，但屬 mentor audio 合約，不可在本輪碰。 |
| `game.js` L1376-L1487 | `stopMentorAudio` / `playMentorAudioForCurrentPage` | 停止 TTS/WebSpeech、停止目前 mentor audio、HEAD 檢查 mp3、播放、duck/restore map BGM、stale token guard。 | C | 高 | 明確不可在低風險整理輪碰；需 audio lifecycle 專輪。 |
| `game.js` L1489-L1543 | `completeMentorLine` / `restartMentorDialogue` / `nextMentorLine` | 完成當前頁、重播對話、下一頁或結束，並觸發 page audio/video。 | B/C | 中-高 | paging 狀態可分析，但因每頁切換會播放 mentor audio，不在本輪外移。 |
| `game.js` L1545-L1593 | `finishMentorDialogue` | 寫入 seen state、停止 mentor audio/video、關閉 overlay、解除 stage suspend、更新音量、執行 `_resumeAfterMentor`。 | B/C/D | 高 | 不可在低風險整理輪碰；它是導師對話 lifecycle 收束點。 |
| `game.js` L1595-L1625 | long-press skip helpers | 長按 skip 狀態、timer、SFX、呼叫 `finishMentorDialogue`。 | B/C | 中-高 | UI 行為與結束 lifecycle 相連，暫不外移。 |

## 關聯入口與綁定

| 位置 | 區塊 | 用途 | 類型 | 風險 | 備註 |
| --- | --- | --- | --- | --- | --- |
| `game.js` L390-L439 | `checkPrologueTrigger` | 首次進地圖時開啟序章 special scene、設定 `_resumeAfterMentor`、呼叫 `setupMentorDialogue`、播放 prologue BGM。 | C/D | 高 | 不可在低風險整理輪碰；同時牽涉 special scene、BGM、mentor dialogue。 |
| `game.js` L621-L663 | `selectStageFromMap` stage intro | 首次點關卡時判斷 `STAGE_INTRO_n` / L36，寫入 seen state，導師結束後開 battle confirm。 | B/D | 高 | 不可在低風險整理輪碰；改動會影響 stage intro 玩家流程。 |
| `game.js` L674-L691 | `startStageWithExplanation` | 由導師圖示強制開啟關卡說明，設定 `stageConfirmSuspendedForMentor`。 | B/D | 高 | 不可在低風險整理輪碰。 |
| `game.js` L698-L765 | ending dialogue triggers | L35/L36 結局、special scene、BGM override、unlock L36、呼叫 `setupMentorDialogue`。 | C/D | 高 | 不可在低風險整理輪碰。 |
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
