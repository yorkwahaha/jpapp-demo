# JPAPP game.js Code Map

本文檔整理了 `assets/js/game.js` 的主要功能區塊索引，旨在為未來的模組化與維護提供參考。

## 核心設計原則
- **穩定優先**：對於高度耦合的 Vue Setup 與核心戰鬥判定，採取保守策略。
- **分階段外移**：優先處理低風險、高獨立性的 UI/Debug 區塊。
- **音訊隔離**：Simple Audio v2 雖然龐大，但因其對 iOS Safari 的高度敏感性，需在單獨任務中謹慎處理。

---

## 區塊索引清單

| 行號範圍 | 區塊名稱 | 主要用途 | 風險等級 | 是否建議外移 | 建議外移檔名 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| L1 – L52 | **SP System State** | 全域 SP 狀態與 UI 響應定義 | 中 | 是 | `sp-manager.js` |
| L53 – L777 | **Vue Central State** | Vue `setup()` 的數據核心與響應式定義 | **高** | 否 | N/A |
| L778 – L1040 | **Vue Lifecycle** | 掛載、計時器重置、全域 Watcher | 中 | 否 | N/A |
| L1041 – L1620 | **Mentor System** | 導師對話、Typing 效果、影片同步；純分頁與部分純 lookup 已外移至 `mentor-dialogue-helpers.js` | **高** | 是 | `mentor-manager.js` |
| L1621 – L2000 | **Codex & Skills** | 助詞圖鑑、怪物圖鑑、技能列表渲染 | **低** | 是 | `codex-manager.js` |
| L2001 – L2312 | **Skill Casting** | 技能施放邏輯、Buff 管理 | 中 | 是 | `skill-logic.js` |
| L2313 – L2546 | **Battle Loop** | ATB 計時器、回合轉換邏輯 | **高** | 是 | `battle-core.js` |
| L2547 – L2731 | **Boss Death VFX** | 魔王死亡特殊演出與特效 Helpers | **低** | 是 | `vfx-helpers.js` |
| L2732 – L3200 | **Audio Manager Init** | Simple Audio v2 初始化與 Context 管理 | **高** | 是 | `audio-manager.js` |
| L3201 – L4400 | **Audio Core** | BGM 切換、SFX 播放、音量曲線控制 | **高** | 是 | `audio-manager.js` |
| L4401 – L4862 | **Audio Fallback** | iOS Safari HTML5 Audio 備援機制 | **高** | 是 | `audio-fallback.js` |
| L4863 – L5122 | **SFX Pooling** | 音效池化管理與重複播放優化 | 中 | 是 | `audio-manager.js` |
| L5131 – L5432 | **Flick Engine** | 彈射物理計算、碰撞偵測 | 中 | 是 | `flick-engine.js` |
| L5433 – L6000 | **Battle VFX** | 怪物攻擊動畫、螢幕震動、閃光特效 | **低** | 是 | `vfx-manager.js` |
| L6001 – L6274 | **Battle Log** | 戰鬥訊息顯示、錯誤紀錄、歷史紀錄 | 中 | 是 | `battle-logger.js` |
| L6275 – L6485 | **Question Gen** | 基礎出題邏輯、干擾項生成 | 中 | 是 | `question-engine.js` |
| L6486 – L7019 | **Audio Debug** | 音訊診斷面板、手動測試控制項 | **低** | 是 | `debug-tools.js` |
| L7020 – L7200 | **Stage Init** | 關卡初始化、技能選取混合比例 | 中 | 是 | `stage-manager.js` |
| L7201 – L7330 | **Boss Queue** | 魔王戰專用題庫排程與洗牌 | 中 | 是 | `question-engine.js` |
| L7331 – L7728 | **Question Detail** | 助詞邏輯避讓、特殊規則出題 | **高** | 是 | `question-engine.js` |
| L7729 – L8465 | **initGame** | 戰鬥場景初始化、怪物屬性加載 | **高** | 否 | N/A |
| L8466 – L8729 | **TTS & Feedback** | 語音合成回饋、Combo 稱讚語音 | **高** | 是 | `voice-manager.js` |
| L8730 – L8800 | **Mastery System** | 熟練度計算與存檔同步 | 中 | 是 | `progression-manager.js` |
| L8801 – L8946 | **Knockback Physics** | GiraGira 命中時的位移物理模擬 | **低** | 是 | `vfx-manager.js` |
| L8947 – L9296 | **Battle Judgment** | 答案判定核心、傷害計算、SP 獎勵 | **高** | 是 | `battle-core.js` |
| L9297 – L9340 | **Flow Control** | 下一題切換、自動推進邏輯 | 中 | 是 | `battle-core.js` |
| L9341 – L9528 | **Victory Flow** | 勝利結算動畫、EXP 跑表、等級提升 | 中 | 是 | `result-manager.js` |
| L9529 – L9600 | **Sprite Rendering** | 怪物受擊圖切換、位置計算 | **低** | 是 | `ui-renderer.js` |
| L9601 – L9883 | **Interaction** | 存檔按鈕、復活、重試等點擊處理 | 中 | 是 | `ui-handlers.js` |
| L9884 – L10022 | **Jump & Export** | Level Jump 調試工具與 Vue 掛載 | **低** | 否 | N/A |

---

## 未來維護指引

### 1. 第一優先外移目標 (低風險)
- **Debug Tools (L6486 - L7019)**：完全獨立，最適合測試模組化流程。
- **Codex & Skills (L1621 - L2000)**：純 UI 展示類邏輯。
- **VFX Helpers (L2547 - L2731, L5433 - L6000)**：視覺效果邏輯。

### 2. 高風險區塊警告 (暫不變動)
- **Audio Core**：涉及複雜的 `AudioContext` 狀態管理與 iOS Safari 特殊手勢鎖定，外移極易導致斷音。
- **Vue Setup**：數據響應式的根基，外移難度極高，建議留在 `game.js` 作為最終整合點。
- **Battle Judgment**：與 `initGame` 高度耦合，影響教學流程。

### 3. 注意事項
- 任何外移操作必須配合 `precommit-verify` 檢查 `node --check`。
- 修改後須在 iPad Safari 上驗證 Audio 恢復邏輯。
