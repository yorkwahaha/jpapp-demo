# JPAPP Code Ownership Map

> **Purpose:** 跨檔責任邊界與 `index.html` 載入順序，搭配 [`game-js-map.md`](./game-js-map.md) 使用。  
> **Last updated:** 2026-05-24
> **Doc sync:** 2026-05-24 — `skillCorrectCounts` 已自 runtime 清除；現役為 `skillMastery`

## Script 載入順序（`index.html` → `game.js` 前）

較早載入的模組會掛到 `window.*`；`game.js` 內多處使用 `window.JPAPP*` 與 fallback stub。

| Order (approx.) | File | `window` export | Consumed by game.js for |
|-----------------|------|-----------------|-------------------------|
| early | `game-constants.js` | `JPAPP_CONSTANTS` | 路徑、等級、語音、圖片常數 |
| early | `game-utils.js` | `JPAPP_UTILS`, `__JPAPP_UTILS` | 紀錄正規化、`pickOne`, `parseAcceptableAnswers` |
| early | `skill-vfx.js` | VFX spawn fns | 技能啟動特效 |
| early | `vfx-helpers.js` | `JPAPPVfxHelpers`, `JPAPP_VFX` | 投射物、浮字、圖層 |
| early | `hero-status.js` | `heroBuffs`, DOM pills | 擬聲詞 buff UI |
| early | `battle-log.js` | `pushBattleLog` (global) | 戰鬥訊息列 |
| early | `audio-tts.js` | TTS / `playTtsKey` | 題目朗讀、WebSpeech |
| before game | `settings-manager.js` | `JPAPPSettingsManager` | 設定、地圖 UI、音量曲線 |
| before game | `storage-manager.js` | `JPAPPStorageManager` | mentor seen、mistakes、audio debug pos |
| before game | `codex-display-utils.js` | `JPAPPCodexDisplayUtils` | 圖鑑格式化、圖片 fallback |
| before game | `spirit-codex-helpers.js` | `JPAPPSpiritCodexHelpers` | 共鳴輪排序、mastery 樣式 |
| before game | `audio-debug-manager.js` | `JPAPPAudioDebugManager` | 音訊診斷 overlay |
| before game | `dev-tools.js` | `JPAPPDevToolsManager` | DevTools / FPS |
| before game | `mentor-dialogue-helpers.js` | `JPAPPMentorDialogueHelpers` | 導師分頁、emotion 圖 |
| before game | `changelog-manager.js` | `JPAPPChangelogManager` | changelog modal |
| before game | `result-display-manager.js` | `JPAPPResultDisplayManager` | 結算 UI、關卡紀錄列 |
| **last** | **`game.js`** | Vue app、`debugJumpToLevel`, `__debugQMix` | 主 runtime |
| after | `global-hooks.js` | — | 全域 error / keydown |
| parallel | `debug.js` | `jpDebug` | 開發者 console API（需 game mount 後） |

**Data（非 script，由 game 內 fetch）：**

| File | Loaded via | Risk |
|------|------------|------|
| `assets/data/earlyGamePools.v1.js` | `index.html` → `window.EARLY_GAME_POOLS` | 題庫內容 — 高（凍結時只改此檔） |
| `assets/data/levels.v1.json` | `loadGameData` | 關卡設定 |
| `assets/data/skills.v1.json` | `loadGameData` | 技能 meta |
| `assets/data/spirits.v1.json` | `loadGameData` | 小助靈 |
| `assets/data/enemies.v1.json` | `loadGameData` | 怪物圖鑑 |
| `assets/data/mentor-dialogues.v1.json` | `loadGameData` | 導師台詞 / audio map |
| `assets/data/abilities.v1.json` | fetch in setup | 擬聲詞技能 |
| `assets/data/changelog.json` | changelog manager | 低 |
| `assets/data/map-chapters.json` | `onMounted` fetch | 地圖章節 |

## 所有權矩陣（誰擁有什麼）

| Domain | Owner file(s) | game.js role | Edit policy |
|--------|---------------|--------------|-------------|
| **Vue UI template** | `index.html` | 提供 `setup()` return 綁定 | UI 文案/結構改 HTML；邏輯改 game.js |
| **Global SP** | `game.js` L61–97 | 唯一實作 | defer 外移 |
| **Save / slots** | `game.js` + `storage-manager`（部分 key） | 主邏輯 | high-risk |
| **Spirit affinity (`skillMastery`)** | `game.js` #5, `addSkillMasteryProgress` | `jpapp_progression_v1` 欄位 `skillMastery`；codex 顯示經 `spirit-codex-helpers` | high-risk（規則）；欄位已精簡 |
| **Map progression** | `game.js` + `settings-manager` | 整合 | high-risk |
| **Mentor** | `game.js` + `mentor-dialogue-helpers` + data JSON | runtime | DO NOT TOUCH |
| **Codex wheel** | `game.js` + `spirit-codex-helpers` + `codex.css` | UI 狀態 + 動畫 | wheel 可拆；template 在 HTML |
| **Monster codex** | `game.js` computed + `enemies.v1.json` | 列表組裝 | 易拆 helper |
| **Battle loop** | `game.js` | 唯一實作 | DO NOT TOUCH |
| **Question content** | `earlyGamePools.v1.js` | 消費 pool | 改 data，不改 gen 除非允許 |
| **Question generation** | `game.js` L7961+ | 唯一實作 | DO NOT TOUCH |
| **Audio playback** | `game.js` L4435+ + `audio-tts.js` | 主體在 game.js | DO NOT TOUCH |
| **Audio debug UI** | `audio-debug-manager.js` + game 接線 | 薄整合 | Phase 1 可外移接線 |
| **Result screen** | `result-display-manager.js` + game `grantRewards` | 分工 | 動畫改 manager；流程改 game 需小心 |
| **VFX** | `vfx-helpers.js`, `skill-vfx.js`, game 內 boss VFX | 混合 | 新特效優先放 helpers |
| **Hero buff pills** | `hero-status.js` | 讀 `heroBuffs` | 改顯示改 hero-status |
| **Dev tools** | `dev-tools.js`, `debug.js`, game L11674+ | 注入 refs | dev-only |
| **Styles** | `assets/css/*.css` | class 名由 HTML/game 使用 | 見 `css-map.md` |

## `window` 匯出（除錯用）

| Export | Set in | Used by |
|--------|--------|---------|
| `window.__sp` | game.js | SP HUD、技能扣點 |
| `window.heroHP` / `heroMaxHP` | game.js | legacy HUD / debug |
| `window.spawnFloatingDamage` 等 | skill-vfx / vfx-helpers / game shim | 戰鬥數字 |
| `window._resumeAfterMentor` | game.js | 導師結束回調 |
| `window._afterKnowledgeCards` | game.js | 知識卡結束 → tally |
| `window.debugJumpToLevel` | game.js | dev 關卡跳轉 |
| `window.__debugQMix` | game.js | 題庫分布 debug |
| `window.skillId` | game.js (battle) | debug / 外部 hook |
| `window.JPAPP_DEBUG_AUDIO` | flags | 抑制 SFX error log |
| `window.JPAPP_DEBUG_FEEDBACK` | flags | feedback voice trace |

## 存檔欄位 — 親密度（`jpapp_progression_v1`）

| 欄位 | 狀態 | 說明 |
|------|------|------|
| `skillMastery` | **現役** | 小助靈親密度 0–100；答對一題 +1（`addSkillMasteryProgress`）；共鳴輪 UI 讀取。 |
| `skillCorrectCounts` | **已退役**（2026-05-24） | 舊雙次制累計答對次數殘留；已自 `game.js` 移除。舊存檔若仍含此 key：**載入時忽略**，**不再寫回**；不影響 `skillMastery`。 |

## Freeze 對照（專案級）

以下 domain **預設禁止** Agent 修改，除非使用者任務明示：

1. Audio lifecycle / TTS / BGM / fanfare / iOS resume  
2. Battle timing / TAP·Flick / projectile / combo / damage  
3. Save/load core (`saveProgression`, slot migration)  
4. Mentor dialogue runtime  
5. Question generation / choices / fallback（`game.js`）  
6. Boss / final / hidden boss question selection  
7. Question-bank **data**（`earlyGamePools.v1.js` 等）  
8. CSS/RWD（未要求時）

## 建議 Agent 工作流程

```
任務進入
  → 讀 code-ownership-map（本檔）確認該改哪個檔
  → 讀 game-js-map 定位行號區塊
  → 若只改 data：earlyGamePools / levels / skills / mentor-dialogues
  → 若改 UI：index.html + 對應 css-map 區塊
  → 若改 codex 顯示：優先 codex-display-utils / spirit-codex-helpers
  → 驗證：node --check <touched.js>；必要時 manual-test-checklist
```

## 與其他 docs 的關係

| Doc | Scope |
|-----|--------|
| `game-js-map.md` | `game.js` 內部 section |
| `mentor-dialogue-map.md` | 導師子系統細表 |
| `css-map.md` | 樣式拆分 |
| `manual-test-checklist.md` | 發版前手測 |
