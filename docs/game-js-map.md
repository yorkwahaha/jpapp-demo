# JPAPP `game.js` Code Map

> **Last audited:** 2026-05-27 (M24a+b data load + combat constants)
> **Doc sync:** 2026-05-27 — M24：`[ DATA — LOAD GAME DATA ]` ~L3032；`[ BATTLE — COMBAT CONSTANTS ]` ~L3528（**非** `[ STATE — GAME BATTLE CORE ]`）。M23b boss attack VFX；M23a boss death。
> **File:** `assets/js/game.js` — **~11,656 lines** (1-indexed；M10 後以 `rg` 錨點為準)
> **Purpose:** 讓 Agent 用最小搜尋範圍定位區塊；**本文件不取代** `node --check` 或手動測試。
> **Companion:** [`code-ownership-map.md`](./code-ownership-map.md)（跨檔依賴與 script 載入順序）

## 使用方式

1. 用 **Section name** 或 **Keywords** 在 `game.js` 內 `rg`（例：`rg "saveProgression" assets/js/game.js`）。
2. 對照 **Risk** 與 **Safe to edit?**；高風險區除非任務明確要求，否則不動。
3. 題庫內容只改 `assets/data/*.js|json`，不要改出題核心（§A #31，`rg generateQuestionBySkill`）除非任務允許。
4. **行號僅供粗定位**；編輯後優先 `rg` 表中 **Keywords (rg)** 錨點，勿只依行號切割區塊。區塊註解見文末 [Section header 建議](#f-section-header-建議草案)。
5. **檔案順序 ≠ 邏輯邊界**：例如 `formatAudioDebugValue` / `onUserGesture` 實體在 §A #32（約 L8057+），落在出題區 **之後**，語意仍屬音訊 lifecycle。

## 核心原則

- **穩定優先**：Vue `setup()` 是整合點，大塊外移需分 phase。
- **地圖化優先**：本文件與 `code-ownership-map.md` 供 Agent **查找與邊界**；主軸不是 `game.js` 減肥或急於模組化。
- **Dead code**：僅列候選（見 `cleanup-candidates/game-js-legacy-candidates.md`）；預設不刪。
- **已外移模組勿還原**：見 `code-ownership-map.md`。
- **Freeze（專案級）**：audio lifecycle、battle timing、save/load、mentor runtime、question gen、boss/L36 選題、CSS/RWD（未要求時）。

---

## A. 大區塊地圖

> 行號區間以**主要入口**定位（2026-05-26 `rg` 對 `game.js` 實測；檔案 11,651 行）。#31/#32/#33、#36b、#37 等為**檔案順序**與邏輯區塊交錯者，見 **Notes**／**Keywords**。
>
> **Mentor 現況：** 僅 **map** overlay（`isMapMentorOpen`、`.map-mentor-overlay`）；**無** battle mentor modal。詳見 [`mentor-dialogue-map.md`](./mentor-dialogue-map.md) §導師 UI 現況。
>
> **親密度存檔：** 現役僅 **`skillMastery`**；`skillCorrectCounts` 已退役（§E 已完成），勿當現役欄位。

| # | Section name | Lines (approx.) | Responsibility | Risk | Keywords (rg) | Related files | Safe? | Validation |
|---|--------------|-----------------|----------------|------|---------------|---------------|-------|------------|
| 1 | **Global — VFX shims** | 1–60 | `[ GLOBAL — VFX SHIMS ]`：`rectCenter`, `getVfxLayer`, `spawnProjectile` 開機 fallback | Med | `GLOBAL — VFX SHIMS`, `rectCenter`, `getVfxLayer` | `vfx-helpers.js`, `skill-vfx.js` | defer | 戰鬥投射物、滿絆特效 |
| 2 | **Global — SP HUD** | 1–2, 63–100 | `[ GLOBAL — SP HUD SHIMS ]`：`window.__sp`, `updateSpUI`, `canAffordSP`（`__sp` 在 umbrella 下、VFX 子區之前） | Med | `GLOBAL — SP HUD SHIMS`, `__sp`, `spendSP`, `regenSP` | Vue `spState` + `.hud-bar-sp-fill`（`updateSpUI`/`#spFill` 為 legacy no-op DOM path，DOM 已移除） | defer | 施放技能扣 SP、答對回 SP |
| 3 | **App — bootstrap** | 101–178 | `[ APP — BOOTSTRAP ]`：`createApp`、`[ APP — SETUP ROOT ]`、`[ APP — SETUP INIT ]`（1st onMounted 載入 `map-chapters`） | Med | `APP — BOOTSTRAP`, `APP — SETUP ROOT`, `mapChapters`, `createApp` | `map-chapters.json` | defer | 進地圖章節是否載入 |
| 4 | **Setup — data refs** | 179–199 | `[ SETUP — DATA REFS ]`：`pool` / `EARLY_GAME_POOLS`、`LEVEL_CONFIG`、`SKILLS`、`SPIRITS`、`ENEMIES` 等 ref（**非** `[ PROGRESSION / SAVE SLOTS ]`） | Low | `SETUP — DATA REFS`, `EARLY_GAME_POOLS`, `LEVEL_CONFIG` | `earlyGamePools.v1.js` | defer | 開局前 ref 存在；save keys 見 #5 |
| 5 | **Save slots — storage & metadata** | 198–353 | keys、migration、metadata 讀寫、`setActiveSaveSlotId`、`isSlotProgressionReadable`（**save core**；display 見 #5b） | **High** | `PROGRESSION_KEY`, `ensureSaveSlotMigration`, `writeSaveSlotsMetadata` | `storage-manager.js` | **no** | 切槽、migration、metadata |
| 5b | **Home — save slot display** | 355–373 | `[ HOME — SAVE SLOT DISPLAY ]`：`saveSlotCards` computed；共鳴率／時間經 `__JPAPP_UTILS`（**非** save/load 寫入） | Low–Med | `saveSlotCards`, `calculateSaveSlotResonanceText`, `formatSaveSlotTime` | `game-utils.js`, `index.html`, `home.css` | **yes**（顯示） | 見 §首頁存檔卡；選槽流程見 #9 |
| 6 | **Map / progression state** | 375–487 | `showMap`、`unlockedLevels`、知識卡佇列、spirit 薄封裝、**`skillMastery`**（非 `skillCorrectCounts`） | **High** | `unlockedLevels`, `skillMastery`, `pendingKnowledgeCards` | `spirit-codex-helpers.js` | **no** | 地圖進度、親密度 |
| 6a | **Map — display helpers** | 449–505 | `[ MAP — DISPLAY HELPERS ]`：`activeSegment`、`currentMapBgm`、`getMapNodeStyle`、`scrollToStage`、`getStageFocus*`、`activateMapAmbient` / `activateMapAmbientSync` | Low | `activateMapAmbient`, `getMapNodeStyle`, `scrollToStage`, `getStageFocusLabel` | `settings-manager.js`, `map-ambient.js` | **yes**（顯示） | 地圖節點/HUD 薄封裝；**勿**改流程函式 |
| 7 | **Player leveling & save I/O** | 542–735 | `processLevelUp`、`saveProgression`、`loadProgression`、開局 `loadProgression()` | **High** | `saveProgression`, `loadProgression`, `playerStats` | `levels.v1.json` | **no** | 升級、EXP、存檔欄位 |
| 8 | **Prologue & map open** | 736–892 | `[ MAP FLOW & MENTOR TRIGGERS ]` umbrella 內：`checkPrologueTrigger`、`openMap`、序章／結局（**導航子錨前段**） | **High** | `MAP FLOW & MENTOR TRIGGERS`, `checkPrologueTrigger`, `openMap` | `mentor-dialogues.v1.json`, `mentor-dialogue-map.md` | **no** | 首次進地圖序章 |
| 9 | **Home — save slot actions** | 893–1058 | `[ MAP FLOW — SAVE SLOT ACTIONS ]`：`openSaveSlotPanel`、`selectSaveSlot`、刪槽（**導航 only**） | **High** | `MAP FLOW — SAVE SLOT ACTIONS`, `openSaveSlotPanel`, `confirmDeleteSaveSlot` | `index.html` `showLevelSelect` | **no** | 選槽／刪檔／新開局；卡面資料改 #5b |
| 10 | **Map — stage pick & tab flow** | 893–1058, 1059+ | `handleMapTabClick`、`jumpToMapSegment`（與 #9 同 umbrella；display glue 見 #6a） | **High** | `handleMapTabClick`, `jumpToMapSegment` | `settings-manager.js` | **no** | 地圖 tab／區段切換、BGM 觸發 |
| 11 | **Map — battle confirm & endings** | 1059–1287 | `[ MAP FLOW — STAGE PICK & CONFIRM ]`：`selectStageFromMap`、`confirmAndStartBattle`、L35/L36 結局（**導航 only**） | **High** | `MAP FLOW — STAGE PICK & CONFIRM`, `selectStageFromMap`, `confirmAndStartBattle` | `mentor-dialogue-map.md` | **no** | 關卡確認、結局 mentor |
| 12 | **Map — return & knowledge cards** | 1288–1380 | `[ MAP FLOW — RETURN & KNOWLEDGE CARDS ]`：`returnToMap`、`triggerNextKnowledgeCard`（**導航 only**） | **High** | `MAP FLOW — RETURN & KNOWLEDGE CARDS`, `returnToMap`, `triggerNextKnowledgeCard` | `index.html` knowledge overlay | **no** | 破關回地圖、知識卡 |
| 13 | **Home — version & changelog display** | 1374–1391 | `[ HOME — VERSION & CHANGELOG DISPLAY ]`：`APP_VERSION`、`appVersion`、`versionImageAsset`、`createChangelogState`（`isChangelogOpen` / `changelogData` / `openChangelog`） | Low | `appVersion`, `openChangelog`, `versionImageAsset` | `changelog-manager.js`, `index.html`, `home.css` | **yes**（顯示） | 勿改 `APP_VERSION`／`changelog.json`；`versionImageAsset` 亦供導師圖 |
| 13b | **Settings & dev tools** *(file-order)* | 1398–1478 | `[ SETTINGS — UI & DEV TOOLS ]`：`settings`、`devToolsState`、`answerMode`、`flickState`（**非** #13 changelog；UI/dev state only） | Low | `SETTINGS — UI & DEV TOOLS`, `settings`, `isDevToolsVisible`, `loadSettings` | `settings-manager.js`, `dev-tools.js` | defer | `devToolsState` 子錨見 #40b |
| 14 | **Codex — state refs** | 1503–1548 | `[ CODEX — STATE REFS ]`：`isCodexOpen`、wheel RAF 常數／非 ref spin vars（**非** runtime 函式） | Low | `CODEX — STATE REFS`, `codexWheelPhase`, `CODEX_WHEEL_` | `spirit-codex-helpers.js` | defer | 開共鳴輪不卡頓；wheel runtime 見 #17 **DO NOT TOUCH** |
| 15 | **Mentor — state & fallbacks** | 1575–1834 | map mentor refs、`isMapMentorOpen`、helpers fallback、`loadMentorState` | **High** | `mentorTutorialSeen`, `isMapMentorOpen` | `mentor-dialogue-helpers.js`, `mentor-dialogue-map.md` | **no** | map-only；無 battle modal |
| 16 | **Mentor — dialogue runtime** | 1835–2139 | `setupMentorDialogue`（**`showMap` 必須**）、typing、video、mentor audio | **DO NOT TOUCH** | `setupMentorDialogue`, `playMentorAudioForCurrentPage`, `finishMentorDialogue` | `audio-tts.js`, `mentor-dialogue-map.md` | **no** | 地圖／確認窗導師；iOS 音訊 |
| 17 | **Codex — wheel logic & UI** *(runtime)* | 2126–2836 | `[ CODEX — COMPUTED ]` 起：`codexWheelSkills` computed 後接共鳴輪 phase、拖曳／動畫、`openCodexDetail`（**runtime — DO NOT TOUCH**；display glue 見 #17b） | Low–Med | `CODEX — COMPUTED`, `setCodexWheelPhase`, `endCodexDrag` | `spirit-codex-helpers.js`, `codex.css` | defer | **勿**改 RAF/detent/inertia |
| 17a | **Codex — spirit helpers boot** | 2106–2124 | `[ CODEX — SPIRIT HELPERS BOOT ]`：`spiritCodexHelpers` fallback + spirit 薄封裝（须在 #17 computed 前） | Low | `CODEX — SPIRIT HELPERS BOOT`, `spiritCodexHelpers` | `spirit-codex-helpers.js` | defer | boot glue only |
| 17b | **Codex — display glue** | 2823–2906 | `[ CODEX — DISPLAY GLUE ]`：spirit 圖示、mastery 顯示、wheel item class、怪物圖鑑、技能類型標籤 | Low | `getCodexSkillDisplayName`, `monsterCodexEntries`, `getSkillTypeLabel`, `getSkillMastery` | `codex-display-utils.js`, `spirit-codex-helpers.js` | **yes**（顯示） | **非** wheel runtime |
| 18 | **Codex — monster index** | 2870–2902 *(in #17b)* | `monsterCodexEntries` computed（薄）、開關／選取 | Low | `monsterCodexEntries`, `openMonsterCodex` | `codex-display-utils.js`, `enemies.v1.json` | **yes** | 怪物圖鑑列表/詳情 |
| 19 | **Codex — open sync watch** *(file-order)* | 2980–2998 | 開共鳴輪時 `codexPage`／phase 同步（**runtime 接線**；**非** Escape） | Low–Med | `watch([isCodexOpen, codexWheelSkills` | — | defer | 勿併入 #19b；勿改 RAF/detent |
| 19b | **Codex — escape watches** | 3003–3018 | `[ CODEX — ESCAPE WATCHES ]`：`Escape` 關閉共鳴輪／怪物圖鑑；關閉時 `forceStopAllCodexWheelMotion` | Low | `keydown`, `watch(isCodexOpen` | — | **yes** | `closeCodex` 定義見 #25；Esc 行為勿改 |
| 20 | **Data load & abilities** | 3032–3231 | `[ DATA — LOAD GAME DATA ]`：`loadGameData`、`loadGameData()` boot 呼叫、skills/spirits/levels fetch（**navigation-only**；**DO NOT TOUCH** fetch／unlock 推導） | Low–Med | `DATA — LOAD GAME DATA`, `loadGameData`, `skillsAll` | `skills.v1.json`, `abilities.v1.json` | defer | 開局資料；abilities `.json` fetch 仍在檔內同段後續 |
| 21 | **Battle — onomatope skills** | 3310–3526 | `castAbility`、`playSkillSfx`、技能 overlay（**無錨**；M24c **略過**／較高風險） | Med | `castAbility`, `heroBuffs` | `hero-status.js`, `abilities.v1.json` | defer | 擬聲詞；勿與 #20 混改 |
| 22 | **Battle — core refs & combo UI** | 3528–3697 | `[ BATTLE — COMBAT CONSTANTS ]` ~3528–3562：`MONSTER_HP`、`getComboMaxDamage`；`[ STATE — GAME BATTLE CORE ]` ~3563+：`player`/`monster`、combo、mistakes（**不含** #36b） | Med | `BATTLE — COMBAT CONSTANTS`, `STATE — GAME BATTLE CORE`, `comboPopup` | `index.html` battle/home | defer | 常數子錨 **勿**更名 battle core |
| 36b | **Result — display state** | 3689–3759, 3798 | `[ RESULT — DISPLAY STATE ]`：`animatedExp`、`displayedResult*`、`stageClearElapsedSeconds`、`monsterResultShown` | Low–Med | `animatedExp`, `monsterResultShown`, `stageResultIsNewBest` | `index.html` result modal | defer | `resetBattleOutcomePresentation` ~L3849；計時起點耦合 #36 |
| 23 | **Battle — boss death VFX** | 3810–4025 | `[ BATTLE — BOSS DEATH VFX ]`：`bossDeathVfxActive`、`resetBattleOutcomePresentation`、`spawnBossDeathBurst`、`startBossDeathSequence`（**navigation-only**；**DO NOT TOUCH** 函式本體／timing／SFX／token） | Med | `BATTLE — BOSS DEATH VFX`, `bossDeathVfxActive`, `spawnBossDeathBurst` | `vfx-helpers.js`, `battle.css` | defer | 魔王死亡演出；見 #23a presentation |
| 23a | **Battle — monster presentation refs** | 3775–3808 | `[ BATTLE — MONSTER PRESENTATION REFS ]`：`monsterHit`、進場／死亡狀態 refs（**不含** `monsterResultShown`；見 #36b） | Low–Med | `BATTLE — MONSTER PRESENTATION REFS`, `monsterIsDying` | `battle.css` | defer | **M23a**；presentation only |
| 24 | **Audio — refs & debug wiring** | 4006–4189 | `bgmAudio`、`audioCtx`、`JPAPPAudioDebugManager` 接線 | **High** | `audioDebug`, `bgmAudio`, `audioCtx` | `audio-debug-manager.js` | **no** | `?audioDebug=1` |
| 25 | **Battle — pause / resume** | 4190–4246 | `pauseBattle`、`resumeBattle`（開圖鑑／**map** mentor 時） | Med | `pauseBattle`, `resumeBattle`, `closeCodex` | — | defer | 開圖鑑不推進 ATB |
| 26 | **Audio — core (init / BGM / SFX)** | 4247–6626 | `initAudioCtx`、`initAudio`、`playBgm`、`playSfx`、pool、duck | **DO NOT TOUCH** | `initAudio`, `playBgm`, `stopAllAudio`, `playSfx` | `audio-tts.js`, `game-constants.js` | **no** | iOS 手勢、BGM 切換 |
| 27 | **Battle — Flick engine** | 6627–6929 | `handleRuneClick`、`startFlick`、`resolveFlickShot` | **High** | `flickState`, `FLICK_MIN`, `resolveFlickShot` | `vfx-helpers.js` | **no** | Flick 命中/擦過 |
| 28 | **Battle — ATB & timer** | 6957–7028 | `[ BATTLE — ATB TIMER ]` / `[ TIMER ]`：`runTimerLogic`、`startTimer`（**DO NOT TOUCH**；上界 **#29** 前） | **High** | `BATTLE — ATB TIMER`, `runTimerLogic`, `startTimer` | `hero-status.js` | **no** | 倒數、超時；`runTimerLogic` 會呼叫 `applyMonsterAttack` |
| 29 | **Battle — boss attack VFX** | 7034–7523 | `[ BATTLE — BOSS ATTACK VFX ]`：`_isBossSpecialAttackPlaying`、`playBoss*Vfx`、`playMonsterClawAttackVfx`（boss 分支 dispatch + 共用鎖；**navigation-only**；**DO NOT TOUCH** 函式／setTimeout／shake） | Med | `BATTLE — BOSS ATTACK VFX`, `playBossVineAttackVfx` | `battle.css` | defer | Boss 特殊攻擊畫面；抽取見 §F Phase 2（**非**本 patch） |
| 30 | **Battle — applyMonsterAttack & mistakes** | 7525–7790 | `applyMonsterAttack`、`playMistakeVoice`、`clearMistakes`（**DO NOT TOUCH**；下界緊接 **#29**） | **High** | `applyMonsterAttack`, `playMistakeVoice` | — | **no** | 怪物攻擊、傷害、SFX 編排、錯題本 |
| 31 | **Question generation** | 7769–9231 | `QUESTION_MIX_CONFIG`、`generateQuestionBySkill`、`getChoices`、`startBossQueue`；後段與 `startLevel` helper 交錯 | **DO NOT TOUCH** | `generateQuestionBySkill`, `startBossQueue` | `earlyGamePools.v1.js`, `levels.v1.json` | **no** | 關卡題型分布 |
| 32 | **Audio — debug format & gesture tail** *(file-order)* | 8080–8581 | `formatAudioDebugValue`、`onUserGesture`、`ensureBgmElementSync` | **DO NOT TOUCH** | `onUserGesture`, `formatAudioDebugValue` | `audio-debug-manager.js` | **no** | 實體在 #31 之後；語意屬音訊 |
| 33 | **Battle — startLevel & initGame** | 8582–10033 | `startLevel`、`initGame`、題庫組裝、knowledge card 佇列（**無** battle mentor） | **High** | `startLevel`, `initGame`, `questions` | `mentor-dialogue-map.md` §initGame | **no** | 開戰 → knowledge card → `startTimer` |
| 34 | **Battle — feedback voice** | 10034–10343 | `playFeedbackVoice`、`playCorrectFeedback` | **High** | `playFeedbackVoice`, `playCorrectFeedback` | `FEEDBACK_VOICE_PATHS` | **no** | 稱讚語音 |
| 35 | **Battle — checkAnswer & nextQuestion** | 10344–10741 | 判定、傷害、combo、`nextQuestion`、`addSkillMasteryProgress` | **DO NOT TOUCH** | `checkAnswer`, `nextQuestion`, `addSkillMasteryProgress` | — | **no** | 答對/答錯全流程 |
| 36 | **Victory — grantRewards** *(core)* | 10742–11227 | EXP 發放、勝利流程、EXP 條 `animateRewards`、`playResultFanfare` 觸發；錨點 `[ VICTORY — GRANT REWARDS ]`（§F） | **DO NOT TOUCH** | `grantRewards`, `animateRewards`, `playResultFanfare` | `result-display-manager.js`（讀取用） | **no** | 獎勵／升級；見 §結算畫面 |
| 37 | **Handlers — retry / revive / potion** *(file-order)* | 8613, 11198–11247 | `usePotion`（音訊區）、`retryLevel`、`revive`（`[ PROGRESSION & REWARDS ]` 區） | Med | `retryLevel`, `revive`, `usePotion` | — | defer | 重試關、喝藥 |
| 38 | **Result — display bindings** | 11252–11318 | `[ RESULT — DISPLAY BINDINGS ]`：`createVueBindings`、`buildCurrentStageRecord`、`updateStageBestRecord` | Low–Med | `calculatedGrade`, `updateStageBestRecord`, `stageRecordRows` | `result-display-manager.js` | **yes**（顯示） | 寫入 `stageBestRecords`；EXP 動畫仍在 #36 |
| 39 | **Boot hooks (2nd onMounted)** | 11413–11446 | `[ APP — SETUP INIT (boot onMounted) ]`：changelog 版本 policy、音訊 unlock、`installTapChoicesLayoutHooks` | Med | `APP — SETUP INIT (boot onMounted)`, `applyVersionStoragePolicy`, `unlockAudioOnce` | `changelog-manager.js` | defer | 首屏手勢後音訊 |
| 40 | **Debug — dev helpers & level jump** | 11458–11607 | `[ APP — GLOBAL EXPOSES ]` 下：`[ DEBUG — DEV HELPERS ]` ~L11460：`window.__debugQMix`；`[ DEBUG TOOLS — LEVEL JUMP ]` ~L11539：`debugJumpToLevel`、`__attachDebugTools`、URL `?level=` | Low | `APP — GLOBAL EXPOSES`, `__debugQMix`, `debugJumpToLevel`, `__attachDebugTools` | `debug.js`, `dev-tools.js` | **yes** (dev) | Console `__debugQMix`；Dev 關卡跳轉 |
| 40b | **Debug — early boot state** *(file-order)* | 1415–1433 | `[ SETTINGS — DEV TOOLS STATE ]`：`devToolsState`、`debugControls`（`heroBuffs` fallback） | Low | `SETTINGS — DEV TOOLS STATE`, `isDevToolsVisible`, `debugControls` | `dev-tools.js` | defer | **未搬**（audio notice computed 需早期存在）；late debug 見 #40 |
| 41 | **App — mount & return** | 11633–11690 | `[ VUE RETURN & BINDINGS ]` ~L11633（含 M17 子錨，見 §F）；`[ APP — MOUNT / INIT ]` ~L11684 | Low–Med | `VUE RETURN`, `RETURN — CORE STATE`, `RETURN — MAP / HOME`, `_jpApp.mount` | `debug.js`, `index.html` | defer | 啟動不報錯；**勿**重排 `return {…}` |

**區塊數量：** 41（含 #32 檔案順序備註列）
**High-risk / DO NOT TOUCH 區塊：** #5–12, #15–16, #24, #26–28, #30–32, #35–36

### 首頁／存檔入口（跨檔）

| 玩家看到的 | 主要 `game.js` | 主要其他檔 |
|------------|----------------|------------|
| 封面／開始／版本字 `v{{ appVersion }}` | **#13** `appVersion`；#22 `showLevelSelect` | `index.html`（`v-if="showLevelSelect"`）、`assets/css/home.css` |
| 三槽存檔面板（流程） | #9 | `index.html` L2102–2148 |
| 存檔卡四行摘要 | #5b `saveSlotCards` | 見 §首頁存檔卡 |
| 進地圖（非首頁） | #8 `openMap`；#22 `showMap` | `settings-manager.js` 地圖節點樣式 |

### 首頁存檔卡（`saveSlotCards`）責任地圖

> **邊界：** 本節只涵蓋「卡上顯示什麼、怎麼排版」。**勿**改 `saveProgression` / `loadProgression` / migration / `clearSaveSlotStorage` / `confirmDeleteSaveSlot`（#5、#7、#9）。

| 層 | 位置 | 責任 | 可改？ |
|----|------|------|--------|
| **Vue computed** | `game.js` **`[ HOME — SAVE SLOT DISPLAY ]`** ~L355–373 `saveSlotCards` | 合併 metadata + 顯示欄位：`statusText`, `playerLevelText`, `highestUnlockedText`, `resonanceText`, `lastPlayedText`, `isEmpty`, `isActive` | 文案/欄位名可改；`isEmpty` 依 #5 `isSlotProgressionReadable`（慎改） |
| **顯示 helper** | `game-utils.js` `calculateSaveSlotResonanceText(isEmpty, progressionStorageKey)` | 讀槽內 progression **僅供**共鳴率字串；key 由 `game.js` `slotProgressionKey(slotId)` 傳入（不寫入） | 可改公式/文案；**勿**改 `PROGRESSION_KEY` / migration |
| **時間格式** | `game-utils.js` `formatSaveSlotTime`；setup 解構 ~L113–136（**未搬**入 #5b 區） | `lastPlayedAt` → `zh-TW` 日期時間 | **yes** |
| **metadata 來源** | `game.js` L212+ `buildEmptySaveSlotsMetadata` 等 | `playerLevel`, `highestUnlockedLevel`, `lastPlayedAt` 由 `updateActiveSaveSlotMetadata` 寫入 | **no**（屬 #5 核心） |
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

### 地圖顯示層（Map display / HUD / stage confirm）

> **邊界：** 本節涵蓋 `showMap` 畫面、章節背景、節點外觀、地圖 HUD、關卡確認視窗的**顯示與文案**。**勿**把顯示任務擴散到 `confirmAndStartBattle` → `startLevel`（#33）、`initGame`、BGM lifecycle（`openMap` / `playBgm`）、`saveProgression` 寫入、導師 runtime（#16）。

| 層 | 位置 | 責任 | 可改？ |
|----|------|------|--------|
| **章節／區段資料** | `assets/data/map-chapters.json` | 各 `segment.background`、`title`、`nodes` 座標、`landmark`、`themeKey`、`mapBgm` 路徑 | **yes**（資料） |
| **關卡 meta（焦點文案來源）** | `levels.v1.json` + `skills.v1.json` | `focusParticle` / `focusLabel` / boss 旗標；供確認窗與節點顯示 | **yes**（data） |
| **地圖顯示 helper（優先改這裡）** | `settings-manager.js` | `getMapNodePositionStyle`、`getStageNodeClassForMap`、`computeStageFocus*Display`、`isMapSegmentIndexUnlocked`、`scrollStageNodeIntoView` | **yes**（節點 class、焦點字、座標樣式） |
| **歷史最佳（確認窗）** | `result-display-manager.js` | `getStageBestRecord`、`getStageBestStarsDisplay`、`getStageBestTimeText` | **yes**（顯示）；寫入在 `updateStageBestRecord`（#38） |
| **Vue 薄封裝** | `game.js` **`[ MAP — DISPLAY HELPERS ]`** ~L444–500（M7 集中） | `getMapNodeStyle`、`getStageNodeClass`、`getStageFocus*`、`scrollToStage`、`activeSegment`、`activateMapAmbient` | **yes**（接線）；勿順手改 `#8`/`#10`/`#12` 流程函式 |
| **地圖 UI state** | `game.js` #6 refs | `showMap`、`mapChapters`、`activeChapter`、`selectedSegmentIdx`、`isBattleConfirmOpen`、`selectedStageToConfirm` | 顯示綁定 **defer**；進度 ref **no** |
| **地圖模板** | `index.html` `v-else-if="showMap"` ~L2178+ | 背景圖、節點、`map-hud-*`、章節下拉、行動版 HUD | **yes**（結構／文案／a11y） |
| **關卡確認窗模板** | `index.html` `isBattleConfirmOpen` ~L2548–2633 | STAGE 標題、焦點助詞、最佳紀錄、取消／出發 | **yes**（文案／a11y）；「出發」仍綁 `confirmAndStartBattle` |
| **氛圍動畫** | `assets/js/map-ambient.js` + `game.js` #6a `activateMapAmbient` | `MapAmbient.activate/deactivate`（背景 sway class）；game.js 薄 wrapper | defer（與章節切換耦合）；wrapper **yes** |
| **樣式** | `index.html` 內嵌 `.map-*`（~L348+）+ `styles.css` `.map-*` / `.stage-confirm-*` | 節點、HUD、確認窗玻璃態 | 見 `css-map.md`；本輪不改視覺 |

**畫面切換（非純 display，僅對照）：**

| 旗標 | 玩家看到 | 常見進入點 |
|------|----------|------------|
| `showLevelSelect` | 首頁／封面 | 預設、戰敗、部分設定返回 |
| `showMap` | 世界地圖 | `openMap`（#8）、破關 `returnToMap`（#12）、選槽後 `startActiveSaveSlot` 鏈 |
| 戰鬥中 | 戰鬥 HUD | `!showLevelSelect && !showMap && currentLevel > 0`；技能／藥水／設定入口為 `#hud` `.battle-hud-actions`（legacy `corner-menu.js` / `#cornerMenu` **removed 2026-05-24**） |

**顯示 vs 進關流程（符號分界）：**

| 符號 | 類型 | 說明 |
|------|------|------|
| `selectStageFromMap` | 流程＋顯示觸發 | 點節點 → 可能插導師 → 開 `isBattleConfirmOpen`；**不開戰** |
| `closeBattleConfirm` | 純 UI | 關確認窗 |
| `confirmAndStartBattle` | **進關入口** | `startLevel`；顯示任務 **DO NOT TOUCH** |
| `handleMapTabClick` / `jumpToMapSegment` | 流程 | 切區段 + `saveProgression` + `playBgm`；非純 display |
| `openMap` | 流程＋BGM | 進地圖；含 map BGM 首播（#8） |

### 想改地圖背景／HUD／關卡確認／首頁進地圖 — 速查

| 想改什麼 | 先看（優先順序） | 模板／樣式 | 勿碰 |
|----------|------------------|------------|------|
| **區段背景圖** | `map-chapters.json` → `segments[].background` | `index.html` `.map-base-img` `:src` | `openMap` BGM 邏輯 |
| **節點座標／地標字** | `map-chapters.json` → `nodes`（`desktopX/Y`、`landmark`） | 節點 `getMapNodeStyle(node)` | — |
| **節點鎖／當前／已通關 class** | `settings-manager.js` `getStageNodeClassForMap`；模板亦用 `state-unopened/opened/current` | `.map-stage-node.*`（`index.html` 內嵌 + `styles.css`） | `unlockedLevels` 寫入（#6／`grantRewards`） |
| **節點上 S 評價徽章** | `bestGrades` + `getGradeColor`（`game-utils.js`） | 節點 `grade-badge` L2231+ | `bestGrades` 寫入（#36） |
| **L36 封印字樣** | — | `index.html` `sRankCount/35 封印` | `isAllStagesSRank` 解鎖邏輯 |
| **章節下拉標題／鎖定文案** | `map-chapters.json` `segments[].title` | `.map-dropdown-*` L2314+ | `jumpToMapSegment` 內 `saveProgression` |
| **地圖 HUD（HP/SP/等級/按鈕）** | `index.html` `.map-hud-*`（desktop L2369+、mobile L2434+） | 同上 + `styles.css` | 戰鬥 HUD `#hud` |
| **戰鬥 HUD 技能／藥水／設定** | `index.html` `#hud` `.battle-hud-actions`（`.hud-tool-btn`） | `styles.css` / `battle.css` | `grantRewards`、題目生成、計時；勿恢復 corner menu |
| **關卡確認窗標題／焦點助詞** | `settings-manager.js` `computeStageFocus*`；`levels.v1.json` | `.stage-confirm-*` L2556+ | `startStageWithExplanation` 導師鏈 |
| **確認窗歷史最佳星／時間** | `result-display-manager.js` `getStageBest*` | `.stage-confirm-record` | `updateStageBestRecord` |
| **確認窗按鈕文案** | — | 「取消」/`closeBattleConfirm`；「出發！」/`confirmAndStartBattle` | **`confirmAndStartBattle` 本體** |
| **首頁按鈕進地圖** | `index.html` `startActiveSaveSlot`（L2088） | `home.css` `.home-start-btn` | `selectSaveSlot` / `openMap` 流程（#9/#8） |
| **破關回地圖捲動** | `scrollToStage` → `settings-manager` `scrollStageNodeIntoView` | — | `returnToMap` 全鏈（#12） |
| **地圖首次點關卡導師** | `selectStageFromMap` + `mentorTutorialSeen` | — | [`mentor-dialogue-map.md`](./mentor-dialogue-map.md) §地圖觸發點 |
| **關卡確認「姐姐引導」** | `startStageWithExplanation` | `.stage-confirm-mentor-*` | mentor runtime **DO NOT TOUCH** |
| **序章（首次 openMap）** | `checkPrologueTrigger` | `.map-mentor-overlay` | 同 mentor 文件；含 BGM 邊界 |

### Mentor × 地圖／關卡確認（交叉參照）

> **邊界：** 改地圖**顯示**（節點、HUD、確認窗文案）見 §地圖顯示層；改導師**何時出現、說什麼、音訊**見 [`mentor-dialogue-map.md`](./mentor-dialogue-map.md)。本節只列交會點，**不重複** runtime 細節。

| 交會 | `game.js`（約） | 地圖／UI | Mentor | 文件 |
|------|----------------|----------|--------|------|
| 進地圖序章 | #8 `openMap` → `checkPrologueTrigger` | `showMap` + special scene | `PROLOGUE_OPENING` | mentor §序章列 |
| 點節點 | #10 `selectStageFromMap` | → `isBattleConfirmOpen` | 首次 `STAGE_INTRO_*` / `L36_FIRST_ENTRY` | mentor §地圖點關卡 |
| 確認窗引導 | #11 `startStageWithExplanation` | 確認窗暫藏（mentor open） | `setupMentorDialogue(skill)` | mentor §姐姐引導 |
| 開戰 | `confirmAndStartBattle` | 關確認窗 | — | **無導師**；#33 |
| 回地圖 | #12 `returnToMap` | `showMap` | — | **無導師**；§地圖流程 |
| Overlay | `setupMentorDialogue` #16 | `isMapMentorOpen` only if `showMap` | 否則 warn + `false` | mentor §setupMentorDialogue |

**DO NOT TOUCH（mentor×map）：** `setupMentorDialogue`、`finishMentorDialogue`、`playMentorAudioForCurrentPage`、`mentor-dialogues.v1.json`、`_resumeAfterMentor` 回調內容。

**完整導師入口／結局／initGame／result 對照：** [`mentor-dialogue-map.md`](./mentor-dialogue-map.md) §觸發路由總表、§Ending／initGame／Result、§台詞資料來源、§已確認。

**2026-05-24：** battle mentor 已移除；`setupMentorDialogue` map-only；`initGame` 不播導師。

### 地圖流程（Map flow / return-to-map）

> **邊界：** 本節說明「如何從首頁／戰鬥／結算／逃跑進到地圖」以及三個主旗標的分工。**文件化 only**；改流程需任務明示且手測音訊＋存檔。與 §地圖顯示層（節點／HUD 長相）分開查。
>
> **M21 子錨（導航 only）：** `rg "MAP FLOW —"` 可定位 `#9`／`#11`／`#12` 起點；**勿**因錨點存在而修改 `openMap`／`returnToMap`／`saveProgression`／BGM／fanfare 函式本體。

#### 主畫面旗標（`game.js`）

| 旗標 | 預設 | 為 true 時玩家看到 | 常見設為 true |
|------|------|-------------------|---------------|
| `showLevelSelect` | `true`（#22） | 首頁／封面／存檔入口 | 啟動、`defeatReturn`、`debugJumpToLevel` 回封面 |
| `showMap` | `false`（#6） | 世界地圖（`index.html` `v-else-if="showMap"`） | `openMap`、`returnToMap` |
| `isFinished` | `false`（#22） | 隱藏戰鬥主舞台（`v-else-if="!isFinished"` 的 `#stageWrap`） | **`returnToMap` 會設 `true`**；`openMap` **不**改此旗標 |
| `monsterResultShown` | `false` | 結算 modal（#36b） | `grantRewards` 勝利鏈；`returnToMap`／`openMap` 會清掉 |

**互斥關係（簡化）：** 首頁 = `showLevelSelect`；地圖 = `showMap && !showLevelSelect`；結算 = `monsterResultShown`（戰鬥 DOM 可能仍在底下）；戰鬥進行 ≈ `!showLevelSelect && !showMap && !isFinished`（另看 `currentLevel`）。音訊 debug 面板區段見 §A #32（`rg formatAudioDebugValue`）。

#### `openMap`（#8，~L767+）

| 項目 | 說明 |
|------|------|
| **責任** | 序章攔截 → **map BGM 首播**（user gesture 內）→ `showLevelSelect=false` → 區段選擇／`saveProgression` → `showMap=true` → 清結算殘留 → `scrollToStage` → `stopAllAudio` + `playBgm` → 結局檢查 → `MapAmbient` |
| **典型呼叫** | `startActiveSaveSlot`（#9）、`selectSaveSlot` 有進度時、`checkPrologueTrigger` 結束回調、debug 進地圖 |
| **與 `returnToMap` 差異** | 含 **手勢內** map.m4a 同步 `play()`；**不**設 `isFinished`；**不**處理結算 fanfare 延遲 |
| **文件任務可改？** | **no**（BGM／存檔／旗標） |

#### `returnToMap`（#12，~L1316+）

| 項目 | 說明 |
|------|------|
| **責任** | 關共鳴輪 → `resetBattleOutcomePresentation` → **`isFinished=true`** → `showLevelSelect=false` → 區段／`saveProgression` → `showMap=true` → 清結算／VFX → `scrollToStage` → `stopAllAudio` → **若結算 fanfare 尚在則延遲 500ms 再 `playBgm`**（`returnToMapAudioToken`）→ 結局檢查 → `MapAmbient` |
| **典型呼叫** | 結算 modal「返回地圖」（`index.html` `@click="returnToMap"`）；**逃跑** `handleEscapeToMap`（#35 區，fade 後呼叫） |
| **不重複做** | 不播 `bossClear`／不跑 `grantRewards`；知識卡已在勝利當下排程（註：#12 `triggerNextKnowledgeCards` 註解） |
| **文件任務可改？** | **no** |

#### 音訊／fanfare 邊界（僅對照，#12 + #26 + #36）

| 符號 | 區塊 | 與回地圖的關係 |
|------|------|----------------|
| `playResultFanfare` | #11 ~L1291 | **`grantRewards` 勝利後**（知識卡後）播放；`returnToMap` 可 `stopResultFanfare` 並延遲 map BGM |
| `bossClear` / `win` | #36 `grantRewards` | 魔王／一般勝利 SFX；**在回地圖之前**；不是 map BGM |
| `playBgm` | #26 | 地圖／戰鬥 BGM 切換；`openMap`／`returnToMap`／`handleMapTabClick` 都會觸及 |
| `stopAllAudio` | #26 | `openMap`／`returnToMap`／逃跑中段都會呼叫 |
| `handleEscapeToMap` | ~L5173 | `playSfx('escape')` + `.escape-fade-overlay`（`escape.css`）→ **`returnToMap()`** |
| `defeatReturn` | ~L5190 | 戰敗 overlay → **`showLevelSelect=true`**（回首頁，**不是**地圖） |

#### `saveProgression` 觸點（回地圖路徑上，#7 — **勿改**）

`openMap`、`returnToMap`、`handleMapTabClick`、`jumpToMapSegment` 內皆有 `saveProgression()`；勝利寫入在 **`grantRewards`**（#36）先於玩家按「返回地圖」。

### 想改回地圖路徑 — 速查

| 玩家路徑 | 入口 UI | 第一個 `rg` 目標 | 實際進地圖函式 | 勿當 display 改 |
|----------|---------|------------------|----------------|-----------------|
| **首頁開始／繼續** | `startActiveSaveSlot` | `startActiveSaveSlot` → `openMap` | `openMap` | `loadProgression`、`openMap` BGM |
| **選槽有進度** | `selectSaveSlot` | `selectSaveSlot` | `openMap` | #9 全流程 |
| **破關後回地圖** | 結算「返回地圖」`returnToMap` | `returnToMap` | `returnToMap` | `grantRewards`、`playResultFanfare` 時序 |
| **戰鬥中逃跑** | 設定／選單 `handleEscapeToMap` | `handleEscapeToMap` | `returnToMap`（經 fade） | `escape.css` 動畫、`isEscaping` |
| **戰敗回封面** | 戰敗 overlay `defeatReturn` | `defeatReturn` | **無**（`showLevelSelect=true`） | `handleGameOver` |
| **魔王／Boss 通關音效** | （自動，結算前） | `bossClear`、`grantRewards` | 仍要玩家按返回才 `returnToMap` | #36 全鏈 |
| **破關捲到剛解鎖關** | 地圖節點 `new-unlock-glow` | `newUnlockLv`、`scrollToStage` | `openMap` 或 `returnToMap` 內 | `unlockedLevels.push` 在 #36 |

### 結算畫面（Result display）責任地圖

> **邊界：** 本節涵蓋破關後 `monsterResultShown` 結算 modal、關卡紀錄表、等級獎勵浮層。**勿**改 `grantRewards` 內 EXP／`processLevelUp`／進度寫入／知識卡排程／`playResultFanfare` 時序（#36）。

| 層 | 位置 | 責任 | 可改？ |
|----|------|------|--------|
| **顯示格式化（優先改這裡）** | `assets/js/result-display-manager.js` | `accuracyPct`、`calculatedGrade`（S–E）、`stageStarRating` / `stageStarDisplay`（★☆）、`stageClearTimeText`、`stageRecordRows`、`formatStageBest*`、`buildCurrentStageRecordPayload` | **yes**（評價規則、星等、表格列） |
| **時間字串** | `game-utils.js` `formatStageClearTime` | 通關秒數 → `X.XX 秒` | **yes** |
| **等級獎勵卡片文案** | `result-display-manager.js` `RESULT_LEVEL_MILESTONE_REWARDS` | Lv5/10/20/25/30 浮層 `type` / `name` / `desc` | **yes** |
| **Vue 注入** | `game.js` **`[ RESULT — DISPLAY BINDINGS ]`** ~L11252–11318 | `createVueBindings` 接線、`updateStageBestRecord` | 紀錄比較：**defer** |
| **結算 UI state** | `game.js` **`[ RESULT — DISPLAY STATE ]`** ~L3689–3759、3798 | `animatedExp`、`displayedResult*`、`scheduleResultMilestoneRewards`、`monsterResultShown` | 動畫 state / 排程：**no**／defer |
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
| **歷史最佳星／時間（單關）** | `formatStageBestStarsDisplay`、`formatStageBestTimeDisplay`、`getStageBest*` | 選關確認 L2565–2570；全關卡表 L3233–3237 | `updateStageBestRecord`、`isStageRecordBetter`（**#38**，`[ RESULT — DISPLAY BINDINGS ]`） |
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
| 設定／changelog | `openChangelog`, `createChangelogState` | **#13**, #13b（settings） | `changelog-manager.js` |
| 地圖 UI／HUD／確認窗文案 | `activateMapAmbient`, `getStageFocusLabel`, `getMapNodeStyle`, `map-chapters.json` | **#6a**, **§地圖顯示層** | `settings-manager.js`, `index.html`, `map-chapters.json` |
| 回地圖／首頁↔地圖流程 | `returnToMap`, `openMap`, `handleEscapeToMap` | **§地圖流程** | **DO NOT TOUCH**（BGM／fanfare／旗標） |
| 地圖／確認窗導師出現時機 | `checkPrologueTrigger`, `selectStageFromMap`, `startStageWithExplanation` | **mentor-dialogue-map** §地圖觸發點 | mentor runtime／JSON／audio **DO NOT TOUCH** |
| 地圖／選關（流程） | `selectStageFromMap`, `confirmAndStartBattle` | #8–11 | **DO NOT TOUCH** 除非任務明示進關 |
| 共鳴輪圖鑑 | `setCodexWheelPhase`, `openCodexDetail` | #14, **#17**（runtime）, **#17b**（display glue） | `spirit-codex-helpers.js`, `codex.css` |
| 怪物圖鑑 | `monsterCodexEntries`, `buildMonsterCodexEntries` | **#17b**, #18 | `codex-display-utils.js` |
| 結算卡文案（評價、星等、時間字串） | `calculatedGrade`, `stageStarDisplay`, `formatStageClearTime` | **#38**, `result-display-manager.js` | `result-display-manager.js`, `game-utils.js` |
| 結算卡版面／按鈕 | `monsterResultShown`, `accuracyPct` | **#36b**, template | `index.html` L3884–3970, `result-mistakes.css` |
| 等級獎勵浮層文案 | `resultUnlockedMilestones`, `RESULT_LEVEL_MILESTONE_REWARDS` | manager + **#36b** | `result-display-manager.js` |
| EXP 動畫／發獎／升級 | `grantRewards`, `animatedExp` | **#36** | **DO NOT TOUCH**（除非任務明示） |
| 戰鬥出題 | `generateQuestionBySkill` | #31 | **僅** `earlyGamePools.v1.js`（內容） |
| 答題判定 | `checkAnswer` | #35 | **DO NOT TOUCH** |
| 音訊／BGM／TTS | `initAudio`, `playBgm`, `onUserGesture` | #24, #26, #32 | `audio-tts.js`；**DO NOT TOUCH** |
| 導師 | `setupMentorDialogue` | #15–16 | `mentor-dialogues.v1.json`（文案）；runtime **DO NOT TOUCH** |
| Dev 關卡跳轉 / 題庫分布 debug | `debugJumpToLevel`, `__debugQMix` | **#40** | `debug.js` |

### Symbol quick table（2026-05-26）

| Symbol / anchor | Current line | Risk | Notes |
|-----------------|--------------|------|-------|
| `saveProgression` | ~556 | **High** | Save/load core; do not edit for display-only tasks |
| `openMap` | ~769 | **High** | Home/map transition, BGM, mentor prologue |
| `returnToMap` | ~1318 | **High** | Result/map transition, fanfare/BGM timing |
| `setupMentorDialogue` | ~1837 | **DO NOT TOUCH** | map-only mentor runtime and audio |
| `codexWheelSkills` | ~2142 | Low–Med runtime, high caution | Codex resonance UI/layout release `26052601` mostly CSS; wheel runtime remains frozen |
| `playBgm` | ~5436 | **DO NOT TOUCH** | Audio lifecycle / iOS gesture path |
| `startLevel` | ~8582 | **High** | Battle entry and question setup |
| `generateQuestionBySkill` | ~8861 | **DO NOT TOUCH** | Question engine / choices / fallback |
| `initGame` | ~9234 | **High** | Battle initialization |
| `checkAnswer` | ~10346 | **DO NOT TOUCH** | Judgment, damage, combo, rewards trigger |
| `grantRewards` | ~10743 | **DO NOT TOUCH** | Anchor `[ VICTORY — GRANT REWARDS ]` ~L10742 |
| `createVueBindings` | ~11325 | Med | Result-display manager integration; before `[ PROGRESSION & REWARDS ]` |
| `debugJumpToLevel` / `__debugQMix` / dev tools | ~11435–11607 | Low | Anchor `[ DEBUG — DEV HELPERS ]` ~L11435；`__debugQMix` moved from #31 (M8) |
| `return {` / `_jpApp.mount` | ~11608 / ~11653 | Low–Med | Anchor `[ VUE RETURN & BINDINGS ]` ~L11608 |

## C. 未來 Agent 查找指南（依功能）

| 任務 | 先看 game.js 區塊 | 也看 | 風險備註 |
|------|-------------------|------|----------|
| 首頁 UI／版本顯示 | **#13**, #22 | `index.html`, `home.css`, `changelog-manager.js` | 低風險；勿動 `showLevelSelect` 切換邏輯除非任務要求 |
| 存檔卡顯示格式 | #5b | `game-utils.js`, `home.css` | 勿碰 #5/#9 寫入與刪槽 |
| 存檔 / 多槽 / 新開局（流程） | #5, #7, #9 | `storage-manager.js` | **high-risk** |
| 地圖顯示（背景／節點／HUD／確認窗） | §地圖顯示層 | `map-chapters.json`, `settings-manager.js`, `index.html` | 勿改 `confirmAndStartBattle` / `startLevel` |
| 回地圖路徑（結算／逃跑／首頁） | §地圖流程 | `index.html` 返回地圖鈕、`escape.css` | **DO NOT TOUCH** `returnToMap`／`openMap` 除非明示 |
| 地圖 / 選關（流程） | #8–11 | `map-chapters.json`, `mentor-dialogues` | 導師／進關 — **high-risk** |
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
| Changelog / 版本 reload | **#13**, #39 | `changelog-manager.js`, `index.html` `APP_VERSION` | #39 `applyVersionStoragePolicy` 在 onMounted；勿與 #13 混淆 |
| Dev / debug | #13, **#40**, #40b, #41 | `debug.js`, `dev-tools.js` | 僅 dev；`__debugQMix` 見 #40 |
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
| `formatAudioDebugValue` + debug state | 8057–8580（§A #32） | 擴 `audio-debug-manager.js` | ~30 | 接線 ~L4116；**不**動 `playBgm`/`playSfx` |

### Phase 2 — Codex wheel / result helper

| Item | game.js lines | Proposed file | Est. lines |
|------|---------------|---------------|------------|
| ~~`RESULT_LEVEL_MILESTONE_REWARDS` 文案表~~ | — | `result-display-manager.js` | ~6 | **已完成**（2026-05-24） |
| `resultLevelUpStatText` 字串組裝 | #36 內 | `result-display-manager.js` | ~15 | 仍耦合 `getDerivedMax*`；需與 #36 一併規劃 |
| 共鳴輪動畫 / 拖曳 / RAF | 2140–2936 | `codex-wheel-controller.js` | 500–650 |
| Boss death VFX 序列 | 3784–4005 | `boss-death-vfx.js` 或 `vfx-helpers.js` | ~220 |
| Boss 攻擊 VFX | 7006–7512 | `boss-attack-vfx.js` | ~490 |

### Phase 3 — Save / debug manager

| Item | game.js lines | Proposed file | Est. lines |
|------|---------------|---------------|------------|
| Save slot migration & metadata | 184–390, 900–1029 | `save-slot-manager.js` | ~220 |
| Global SP 模組 | 1–97 | `sp-manager.js` | ~97 |

### Phase 4 — 僅列出，暫不建議

| Item | game.js lines | Note |
|------|---------------|------|
| Question engine | 7773–9231（§A #31） | 題庫 wrap-up 凍結；拆檔需專項 + 回歸 |
| Audio core | 4006–6626, 8080–8581（§A #24–26, #32） | iOS Safari 高風險；含檔案順序交錯的 gesture tail |
| Mentor manager | 1835–2139 | map-only；與 TTS/BGM lifecycle 綁死 |
| Battle judgment | 10344–10741 | 與 `initGame`、knowledge card 耦合 |
| Vue `setup()` 主體 | 103–11603 | 最終整合層，不拆 |

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
| `DEFAULT_IMAGE_PATHS.mapFallback` | 2026-05-24 | **已自 `game-constants.js` 移除**；`handleMapImageError` 已刪。地圖背景走 `map-chapters.json`。**非**待清理項。 |
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
| Legacy UI — corner menu | 2026-05-24 | `corner-menu.js`、`__initCornerMenu`、index 載入、`#cornerMenu` CSS 已移除；現役 `.battle-hud-actions`。 |
| Legacy UI — `.left-actionbar` / drawer CSS | 2026-05-24 | `styles.css` orphan 區塊已刪；無 HTML/JS。 |
| Legacy UI — `viewport-hooks` `.action-btn` | 2026-05-24 | `touchend` 雙擊防護僅 `button` + `#flickLayer`；`.action-btn` 死路徑已刪。 |
| Legacy UI — `debug-overlay` `#menuBtn` / `[data-debug-toggle]` | 2026-05-24 | 長按手勢改 `closest('button')` + 系統選單文字過濾；無 DOM。 |
| Legacy UI — `#hud>.w-64` / `#hud>.flex-1.border-2` mobile CSS | 2026-05-24 | `styles.css` `@media (max-width: 900px)` orphan 已刪；現役 V3 `.battle-hud-*` / `.hud-tool-btn`。 |
| Battle mentor modal | 2026-05-24 | `.mentor-overlay`、`isMentorModalOpen`、`triggerMentorDialogue` 等已移除；見 `mentor-dialogue-map.md`。 |

### SAFE

| Symbol / area | Location | Evidence |
|---------------|----------|----------|

### LIKELY SAFE

| Symbol / area | Location | Evidence |
|---------------|----------|----------|
| game.js L1–59 VFX shim 冗餘 | 1–59 | `vfx-helpers.js` 已載入；boot 保險 |
| Inline module fallbacks | ~113–136, ~1443–1460, ~1655–1714, ~4086–4114 | 正式 script 已載入；防 boot 失敗 |
| `window.__debugQMix` | ~11510（#40） | 僅 dev console；自 #31 移出（M8） |

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

## F. Section header（`game.js` 內錨點）

> **用途：** `rg "\[ .* \]" assets/js/game.js` 或下表 **Keywords** 定位；行號會漂移，以註解文字為準。
> **2026-05-27（M22）：** `[ CODEX — STATE REFS ]` ~L1503；`SPIRIT HELPERS BOOT` ~L2106；`COMPUTED` ~L2126（wheel **runtime** 仍在同段、**DO NOT TOUCH**）。M21：map flow 子錨。

| Header 文字（`rg`） | 約略行 | §A 對照 | 備註 |
|--------------------|--------|---------|------|
| `[ GLOBAL — VFX / SP HUD SHIMS ]` | ~1 | #1–2 | **2026-05-27 M15**；檔首 umbrella；`window.__sp` 緊接其下 |
| `[ GLOBAL — VFX SHIMS ]` | ~4 | #1 | **2026-05-27 M15**；`spawnFloatingDamage` / `rectCenter` / `getVfxLayer` |
| `[ GLOBAL — SP HUD SHIMS ]` | ~63 | #2 | **2026-05-27 M15**；`updateSpUI`；`canAffordSP` 等見下行 `SP 統一操作函式` |
| `[ APP — BOOTSTRAP ]` | ~101 | #3 | **2026-05-27 M16**；`Vue.createApp`；取代舊 `[ VUE APP — MAIN COMPONENT ]` |
| `[ APP — SETUP ROOT ]` | ~105 | #3 | **2026-05-27 M16**；`setup()` 入口 |
| `[ APP — SETUP INIT ]` | ~145 | #3 | **2026-05-27 M16**；1st `onMounted`（map-chapters + local config） |
| `[ CONFIG & STATE — VUE REACTIVE SETUP ]` | ~178 | #4 | **既有**；umbrella |
| `[ SETUP — DATA REFS ]` | ~179 | **#4** | **2026-05-27 M19**；`pool` / `LEVEL_CONFIG` / `SKILLS`；下一區 `[ PROGRESSION / SAVE SLOTS ]` 為 save core |
| `[ PROGRESSION / SAVE SLOTS ]` | ~201 | #5, #7 | **2026-05-24 L2 新增**；save core only（`saveSlotCards` 見下行） |
| `[ HOME — SAVE SLOT DISPLAY ]` | ~355 | **#5b** | **2026-05-27 M11**；`saveSlotCards`；utils 解構仍在 setup 頂 |
| `[ HOME — VERSION & CHANGELOG DISPLAY ]` | ~1379 | **#13** | **2026-05-27 M13**；`appVersion` / changelog modal；policy 見 #39 |
| `[ SETTINGS — UI & DEV TOOLS ]` | ~1398 | **#13b** | **2026-05-27 M20**；`settings` / `answerMode` / `flickState`；**非** changelog |
| `[ SETTINGS — DEV TOOLS STATE ]` | ~1415 | **#13b, #40b** | **2026-05-27 M20**；`devToolsState` / `debugControls` |
| `[ MAP — DISPLAY HELPERS ]` | ~449 | **#6a** | **2026-05-27 M7 新增**；display glue only |
| `[ MAP FLOW & MENTOR TRIGGERS ]` | ~705 | #8–12 | **2026-05-24 L2 新增**；umbrella |
| `[ MAP FLOW — SAVE SLOT ACTIONS ]` | ~893 | **#9** | **2026-05-27 M21**；`openSaveSlotPanel`；**DO NOT TOUCH** 函式本體 |
| `[ MAP FLOW — STAGE PICK & CONFIRM ]` | ~1060 | **#10–11** | **2026-05-27 M21**；`selectStageFromMap` / 確認窗；**DO NOT TOUCH** 進關 |
| `[ MAP FLOW — RETURN & KNOWLEDGE CARDS ]` | ~1288 | **#12** | **2026-05-27 M21**；`returnToMap` / 知識卡；**DO NOT TOUCH** BGM 時序 |
| `[ STATE — SKILLS & CODEX ]` | ~1483 | #14–19 | **既有**；skills + codex umbrella |
| `[ CODEX — STATE REFS ]` | ~1503 | **#14** | **2026-05-27 M22**；`isCodexOpen` / RAF 常數；**非** runtime |
| `[ MENTOR DIALOGUE ]` | ~1809 | #16 | **既有**（`setupMentorDialogue` 前；map-only） |
| `[ CODEX — SPIRIT HELPERS BOOT ]` | ~2106 | **#17a** | **2026-05-27 M22**；`spiritCodexHelpers` boot；须在 computed 前 |
| `[ CODEX — COMPUTED ]` | ~2126 | **#17** | **2026-05-27 M22**；computed 入口；其後 wheel runtime **DO NOT TOUCH** |
| `[ CODEX — DISPLAY GLUE ]` | ~2839 | **#17b** | **2026-05-27 M9**；非 runtime 顯示 helper |
| `[ CODEX — ESCAPE WATCHES ]` | ~3003 | **#19b** | **2026-05-27 M12**；Escape／關閉 watch；`closeCodex` 見 #25 |
| `[ DATA — LOAD GAME DATA ]` | ~3032 | **#20** | **2026-05-27 M24a**；`loadGameData`；**DO NOT TOUCH** fetch／unlock |
| `[ BATTLE — COMBAT CONSTANTS ]` | ~3528 | **#22** | **2026-05-27 M24b**；ends before `[ STATE — GAME BATTLE CORE ]` |
| `[ STATE — GAME BATTLE CORE ]` | ~3563 | #22 | **既有**；**勿**更名 |
| `[ RESULT — DISPLAY STATE ]` | ~3689 | **#36b** | **2026-05-27 M14**；結算 UI refs；`monsterResultShown` ~3808 |
| `[ BATTLE — MONSTER PRESENTATION REFS ]` | ~3774 | **#23a** | **2026-05-27 M23a**；`monsterHit`～`monsterTrulyDead`；**非** boss death |
| `[ BATTLE — BOSS DEATH VFX ]` | ~3809 | **#23** | **2026-05-27 M23a**；ends before `[ STATE — AUDIO REFS ]`；**DO NOT TOUCH** 函式／timing／SFX／token |
| `[ STATE — AUDIO REFS ]` | ~4027 | #24 | **既有** |
| `[ BATTLE — PAUSE / RESUME ]` | ~4191 | #25 | **2026-05-24 L2 新增**（取代舊 `BATTLE CONTROL` 一行註解） |
| `[ AUDIO & TTS ]` | ~4247 | #26 | **既有**；audio freeze |
| `[ BATTLE — ATB TIMER ]` | ~6957 | #28 | **2026-05-24 L2 新增**（`runTimerLogic` 前）；**DO NOT TOUCH** |
| `[ TIMER ]` | ~7001 | #28 | **既有** inner timer anchor；ends ~7028；**非** #29 |
| `[ BATTLE — BOSS ATTACK VFX ]` | ~7030 | **#29** | **2026-05-27 M23b**；ends before `runPauseTimerLogic` / **#30** `applyMonsterAttack`；**DO NOT TOUCH** bodies/timing/shake |
| `[ QUESTION GENERATION ]` | ~7775 | #31 | **既有** |
| `[ BATTLE INIT ]` | ~9232 | #33 | **既有** |
| `[ BATTLE LOGIC ]` | ~10161 | #34–35 | **既有** |
| `[ BATTLE — CHECK ANSWER ]` | ~10346 | #35 | **2026-05-24 L2 新增**；DO NOT REFACTOR CASUALLY |
| `[ VICTORY — GRANT REWARDS ]` | ~10742 | #36 | **2026-05-24 M2**；`grantRewards` 前；DO NOT TOUCH |
| `[ PROGRESSION & REWARDS ]` | ~11168 | #37 | **既有**；retry/revive；result bindings 見下行 |
| `[ RESULT — DISPLAY BINDINGS ]` | ~11252 | **#38** | **2026-05-27 M14** |
| `[ APP — SETUP INIT (boot onMounted) ]` | ~11413 | **#39** | **2026-05-27 M16**；changelog policy、音訊 unlock、layout hooks |
| `[ APP — GLOBAL EXPOSES ]` | ~11458 | **#40** | **2026-05-27 M16**；`window.__debugQMix`、`__attachDebugTools` 等 |
| `[ DEBUG — DEV HELPERS ]` | ~11460 | **#40** | **2026-05-27 M8**；`window.__debugQMix` |
| `[ DEBUG TOOLS — LEVEL JUMP ]` | ~11539 | #40 | **既有**；`debugJumpToLevel`；dev-only |
| `[ VUE RETURN & BINDINGS ]` | ~11633 | #41 | **2026-05-24 M2**；`return {…}` 前；M17 子錨見下行 |
| `[ RETURN — RESULT BINDINGS ]` | ~11635 | #41 | **2026-05-27 M17**；結算 EXP／`playerStats` |
| `[ RETURN — SETTINGS / DEBUG BINDINGS ]` | ~11638, ~11678 | #41 | **2026-05-27 M17**；音訊 debug + dev/FPS（檔內兩段） |
| `[ RETURN — CORE STATE ]` | ~11640 | #41 | **2026-05-27 M17**；首頁／戰鬥／共鳴輪主 template 行（**未拆行**） |
| `[ RETURN — BATTLE BINDINGS ]` | ~11642 | #41 | **2026-05-27 M17**；逃跑／技能／buff |
| `[ RETURN — CODEX BINDINGS ]` | ~11647 | #41 | **2026-05-27 M17**；`skillMastery`、怪物圖鑑、導師 export |
| `[ RETURN — MAP / HOME BINDINGS ]` | ~11658 | #41 | **2026-05-27 M17**；地圖／存檔槽／知識卡 |
| `[ APP — MOUNT / INIT ]` | ~11684 | **#41** | **2026-05-27 M16**；`_jpApp.mount('#app')` |

**下一批候選（尚未插入）：** `[ CODEX — RESONANCE WHEEL ]`（wheel runtime；**DO NOT TOUCH**）。`[ BATTLE — ONOMATOPE ABILITIES ]`（#21／M24c **略過**，音訊相鄰）。Boss attack VFX **抽取**（§F Phase 2）為高風險未來項，**非** navigation patch。

```javascript
// ================= [ GLOBAL — VFX / SP HUD SHIMS ] =================
// ---- [ GLOBAL — VFX SHIMS ] ----
// ---- [ GLOBAL — SP HUD SHIMS ] ----
// ================= [ APP — BOOTSTRAP ] =================
// ---- [ APP — SETUP ROOT ] ----
// ---- [ APP — SETUP INIT ] ----
// ================= [ CONFIG & STATE — VUE REACTIVE SETUP ] =================
// ---- [ SETUP — DATA REFS ] ----
// ================= [ PROGRESSION / SAVE SLOTS ] =================
// ================= [ HOME — SAVE SLOT DISPLAY ] =================
// ================= [ HOME — VERSION & CHANGELOG DISPLAY ] =================
// ================= [ SETTINGS — UI & DEV TOOLS ] =================
// ---- [ SETTINGS — DEV TOOLS STATE ] ----
// ================= [ MAP — DISPLAY HELPERS ] =================
// ================= [ MAP FLOW & MENTOR TRIGGERS ] =================
// ---- [ MAP FLOW — SAVE SLOT ACTIONS ] ----
// ---- [ MAP FLOW — STAGE PICK & CONFIRM ] ----
// ---- [ MAP FLOW — RETURN & KNOWLEDGE CARDS ] ----
// ---- [ STATE — SKILLS & CODEX ] ----
// ---- [ CODEX — STATE REFS ] ----
// ---- [ CODEX — SPIRIT HELPERS BOOT ] ----
// ---- [ CODEX — COMPUTED ] ----
// ================= [ CODEX — DISPLAY GLUE ] =================
// ================= [ CODEX — ESCAPE WATCHES ] =================
// ================= [ DATA — LOAD GAME DATA ] =================   // navigation-only; DO NOT TOUCH loadGameData/fetch
// ---- [ BATTLE — COMBAT CONSTANTS ] ----                            // file-order: before [ RESULT — DISPLAY STATE ]
// ================= [ RESULT — DISPLAY STATE ] =================
// ---- [ BATTLE — MONSTER PRESENTATION REFS ] ----
// ================= [ BATTLE — BOSS DEATH VFX ] =================   // navigation-only; DO NOT TOUCH bodies/timing/SFX
// ================= [ RESULT — DISPLAY BINDINGS ] =================
// ================= [ MENTOR DIALOGUE — RUNTIME ] =================   // 檔內為 [ MENTOR DIALOGUE ]
// ================= [ BATTLE — PAUSE / RESUME ] =================
// ================= [ BATTLE — ATB TIMER ] =================
// ---- [ TIMER ] ----
// ================= [ BATTLE — BOSS ATTACK VFX ] =================   // navigation-only; DO NOT TOUCH bodies/timing/shake
// ================= [ QUESTION GENERATION ] =================           // DO NOT REFACTOR CASUALLY
// ================= [ BATTLE — CHECK ANSWER ] =================         // DO NOT REFACTOR CASUALLY
// ================= [ VICTORY — GRANT REWARDS ] =================       // DO NOT TOUCH
// ================= [ PROGRESSION & REWARDS ] =================
// ---- [ APP — GLOBAL EXPOSES ] ----
// ================= [ DEBUG — DEV HELPERS ] =================
// ================= [ DEBUG TOOLS — LEVEL JUMP ] =================
// ================= [ VUE RETURN & BINDINGS ] =================
// ---- [ RETURN — RESULT BINDINGS ] ----
// ---- [ RETURN — SETTINGS / DEBUG BINDINGS ] ----
// ---- [ RETURN — CORE STATE ] ----
// ---- [ RETURN — BATTLE BINDINGS ] ----
// ---- [ RETURN — CODEX BINDINGS ] ----
// ---- [ RETURN — MAP / HOME BINDINGS ] ----
// ================= [ APP — MOUNT / INIT ] =================
```

---

## 相關文件

- [`mentor-dialogue-map.md`](./mentor-dialogue-map.md) — 導師區塊細部風險
- [`manual-test-checklist.md`](./manual-test-checklist.md) — 手動驗證清單
- [`css-map.md`](./css-map.md) — 樣式區塊（與 UI 任務搭配）

## 維護備註

- 外移、release sync、或大量刪除後：更新本表行號、`Last audited` 日期、總行數。
- 驗證預設：`node --check assets/js/game.js`；音訊/iOS 變更需實機。
- `docs/game-js-map.md` 舊版行號（~L10000 / ~11,549 時代）已作廢，請以本版為準。
- **親密度存檔：** 僅 `skillMastery`；`skillCorrectCounts` 已退役（見 §E 已完成）。
- **行號校正：** `rg -n "const saveProgression|setupMentorDialogue|const generateQuestionBySkill|const checkAnswer|const grantRewards|_jpApp.mount" assets/js/game.js`
