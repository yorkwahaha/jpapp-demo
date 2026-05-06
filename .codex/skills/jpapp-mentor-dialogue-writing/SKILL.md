# jpapp-mentor-dialogue-writing

Use this skill for JPAPP Selene mentor dialogue, story copy, unlock text, teaching guidance, and voice-friendly lines.

## Selene character

- 中文：月語導師 Selene / 瑟蕾涅
- 日文：月詠みの導師 セレネ
- Mature, warm, reliable, caring mentor
- Gentle older-sister feeling
- Patient and companion-like
- Not arrogant
- Not oily
- Not overly chuuni

## World terms

- Player: 喚語者 / 言霊の呼び手 / 呼び手
- Spirit: 小助靈 / 助の子 / 助詞の精
- World law: 語言之理 / 言ノ理
- Temple: 語言神殿 / 言ノ葉神殿
- Answer options: 共鳴位 / 共鳴輪

## Story principles

- The beginning should not assume the player already accepted a mission.
- Use surprise, confirmation, and gentle invitation.
- Prefer: "如果你願意，請幫助這個世界。"
- Same particle with different usages should feel like members of the same spirit family, not one creature randomly changing.
- At the start, only は and の remain near Selene.
- From stage 3 onward, the player begins hearing other scattered 小助靈.

## Writing rules

- Think first in natural, voice-recordable Japanese line rhythm, then produce natural Chinese if Chinese is requested.
- Keep lines short enough for TTS/audio.
- Avoid long lore dumps.
- Avoid stiff textbook explanations.
- Keep teaching lines encouraging and clear.
- Do not overuse `言ノ理` or fantasy terms in every line.

## Dialogue format caution

- Preserve existing keys and structure in `mentor-dialogues.v1.json`.
- Do not remove emotion metadata unless requested.
- Preserve audio path fields unless asked.
- If audio strings are intentionally empty, do not fill fake paths.

## Recommended checks

```powershell
python -m json.tool assets/data/mentor-dialogues.v1.json
git diff --check
git status --short
```

If JS was edited:

```powershell
node --check assets/js/game.js
```

## Report format

```text
導師文案修改完成。

修改檔案：
- ...

調整範圍：
- ...

語氣確認：
- 溫柔成熟
- 好錄音
- 不過度中二

驗證：
- ...

未 commit。
```
