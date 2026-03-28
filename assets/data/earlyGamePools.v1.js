/**
 * JPAPP Early Game Data & Safe Pools (v1)
 * This file contains static data extracted from game.js to improve maintainability.
 * It is loaded globally as EARLY_GAME_POOLS.
 */

window.EARLY_GAME_POOLS = {
    // Gameplay constants formerly hardcoded in game.setup()
    config: {
        MONSTER_HP: 100,
        POTION_HP: 30,
        INITIAL_POTIONS: 3,
        MONSTERS: [
            { id: 1, name: '助詞怪', sprite: 'assets/images/monsters/slime.png', hpMax: 100, attack: 20, trait: '普通型' },
            { id: 2, name: '助詞妖', sprite: 'assets/images/monsters/slime.png', hpMax: 120, attack: 25, trait: '會閃避' },
            { id: 3, name: '助詞魔', sprite: 'assets/images/monsters/slime.png', hpMax: 140, attack: 30, trait: '攻擊高' },
            { id: 4, name: '助詞龍', sprite: 'assets/images/monsters/slime.png', hpMax: 160, attack: 35, trait: '火焰吐息' },
            { id: 5, name: '助詞鬼', sprite: 'assets/images/monsters/slime.png', hpMax: 180, attack: 40, trait: '無形' },
            { id: 6, name: '助詞王', sprite: 'assets/images/monsters/slime.png', hpMax: 200, attack: 50, trait: '王者氣息' }
        ],
        fallbackLevels: {
            1: { blanks: 1, types: [0, 1], title: '新手村：初試身後' },
            2: { blanks: 1, types: [0, 1, 2], title: '森林：草叢中的影子' },
            3: { blanks: 1, types: [0, 1, 2], title: '地底湖：幽光之徑' },
            4: { blanks: 1, types: [0, 1, 2], title: '古塔：風之試煉' },
            5: { blanks: 1, types: [0, 1, 2, 3, 4, 5], title: '【魔王關】史萊姆王', isBoss: true },
            6: { blanks: 1, types: [0, 1, 2], title: '荒野：烈日乾涸' },
            7: { blanks: 1, types: [0, 1, 2, 3, 4], title: '礦坑：深邃恐懼' },
            8: { blanks: 1, types: [0, 1, 2, 3, 4], title: '雪原：寒冰低語' },
            9: { blanks: 1, types: [0, 1, 2, 3, 4], title: '廢墟：遺忘記憶' },
            10: { blanks: 1, types: [0, 1, 2, 3, 4, 5], title: '【魔王關】鋼鐵魔像', isBoss: true },
            11: { blanks: 1, types: [0, 1, 2, 3, 4, 5], title: '沼澤：瘴氣瀰漫' },
            12: { blanks: 1, types: [0, 1, 2, 3, 4, 5], title: '火山：岩漿脈動' },
            13: { blanks: 1, types: [0, 1, 2, 3, 4, 5], title: '天空城：雲端迷蹤' },
            14: { blanks: 1, types: [0, 1, 2, 3, 4, 5], title: '時光長廊：幻象' },
            15: { blanks: 1, types: [0, 1, 2, 3, 4, 5], title: '【魔王關】飛龍之影', isBoss: true },
            16: { blanks: 1, types: [0, 1, 2, 3, 4, 5], title: 'から：起點／來源' },
            17: { blanks: 1, types: [0, 1, 2, 3, 4, 5], title: 'まで：終點／截止' },
            18: { blanks: 1, types: [0, 1, 2, 3, 4, 5], title: 'と：共同動作對象' },
            19: { blanks: 1, types: [0, 1, 2, 3, 4, 5], title: 'で：工具／手段' },
            20: { blanks: 1, types: [0, 1, 2, 3, 4, 5], title: '【魔王關】魔王複習關 4', isBoss: true },
            21: { blanks: 1, types: [0, 1, 2, 3, 4, 5], title: 'に・時間點複習' },
            22: { blanks: 1, types: [0, 1, 2, 3, 4, 5], title: 'に・動作對象' },
            23: { blanks: 1, types: [0, 1, 2, 3, 4, 5], title: 'に・存在地點複習' },
            24: { blanks: 1, types: [0, 1, 2, 3, 4, 5], title: 'へ・方向複習' },
            25: { blanks: 1, types: [0, 1, 2, 3, 4, 5], title: '【魔王關】深淵盡頭', isBoss: true }
        }
    },

    // Legacy vocabulary and grammar tips used in old generator/fallbacks
    legacyDb: {
        places: [{ j: "部屋", r: "へや", t: "房間" }, { j: "學校", r: "がっこう", t: "學校" }, { j: "圖書館", r: "としょかん", t: "圖書館" }, { j: "庭", r: "にわ", t: "院子" }, { j: "教室", r: "きょうしつ", t: "教室" }],
        objects: [
            { j: "本", r: "ほん", t: "書", type: "read", exists: true },
            { j: "料理", r: "りょうり", t: "料理", type: "eat", exists: true },
            { j: "音樂", r: "おんがく", t: "音樂", type: "hear", exists: false },
            { j: "手紙", r: "てがみ", t: "信", type: "write", exists: true },
            { j: "日記", r: "にっき", t: "日記", type: "write", exists: true },
            { j: "パン", r: "ぱん", t: "麵包", type: "eat", exists: true },
            { j: "プレゼント", r: "ぷれぜんと", t: "禮物", type: "give", exists: true }
        ],
        people: [{ j: "友達", r: "ともだち", t: "朋友" }, { j: "先生", r: "せんせい", t: "老師" }, { j: "母", r: "はは", t: "媽媽" }],
        tools: [{ j: "ペン", r: "ぺん", t: "筆" }, { j: "スマホ", r: "すまほ", t: "手機" }, { j: "はし", r: "はし", t: "筷子" }],
        grammarTips: {
            move: "「へ」或「に」表示移動的目標、方向，接在場所後表示「往～去」。",
            placeAction: "「對」表示動作發生的場所；「を」表示動作的受詞（讀什麼、吃什麼）。",
            existence: "「に」表示物品存在的場所；「が」表示主語（有什麼）。",
            accompany: "「と」表示一起做事的對象（和誰）；「を」表示動作的受詞。",
            tool: "「對」表示使用的工具或手段（用什麼）；「を」表示動作的受詞。",
            give: "「に」表示給予的對象（給誰）；「を」表示給予的物品。"
        }
    },

    // Safe pools for early level question generation (Levels 1-15)
    skills: {
        "WA_TOPIC_BASIC": {
            "safeCombos": [
                {
                    "j": "私は学生です",
                    "r": "わたしはがくせいです",
                    "zh": "我是學生",
                    "left": "私",
                    "leftRuby": "わたし",
                    "right": "学生です",
                    "rightRuby": "がくせいです"
                },
                {
                    "j": "あなたは医者ですか",
                    "r": "あなたはいしゃですか",
                    "zh": "你是醫生嗎",
                    "left": "あなた",
                    "leftRuby": "あなた",
                    "right": "医者ですか",
                    "rightRuby": "いしゃですか"
                },
                {
                    "j": "母は先生です",
                    "r": "はははせんせいです",
                    "zh": "媽媽是老師",
                    "left": "母",
                    "leftRuby": "はは",
                    "right": "先生です",
                    "rightRuby": "せんせいです"
                },
                {
                    "j": "父は会社員です",
                    "r": "ちちはかいしゃいんです",
                    "zh": "爸爸是上班族",
                    "left": "父",
                    "leftRuby": "ちち",
                    "right": "会社員です",
                    "rightRuby": "かいしゃいんです"
                },
                {
                    "j": "兄は一年生です",
                    "r": "あにはいちねんせいです",
                    "zh": "哥哥是一年級",
                    "left": "兄",
                    "leftRuby": "あに",
                    "right": "一年生です",
                    "rightRuby": "いちねんせいです"
                },
                {
                    "j": "妹は子供です",
                    "r": "いもうとはこどもです",
                    "zh": "妹妹是小孩",
                    "left": "妹",
                    "leftRuby": "いもうと",
                    "right": "子供です",
                    "rightRuby": "こどもです"
                },
                {
                    "j": "田中さんは日本人です",
                    "r": "たなかさんはにほんじんです",
                    "zh": "田中先生是日本人",
                    "left": "田中さん",
                    "leftRuby": "たなかさん",
                    "right": "日本人です",
                    "rightRuby": "にほんじんです"
                },
                {
                    "j": "木村さんは学生です",
                    "r": "きむらさんはがくせいです",
                    "zh": "木村先生是學生",
                    "left": "木村さん",
                    "leftRuby": "きむらさん",
                    "right": "学生です",
                    "rightRuby": "がくせいです"
                },
                {
                    "j": "今日は休みです",
                    "r": "きょうはやすみです",
                    "zh": "今天是休息日",
                    "left": "今日",
                    "leftRuby": "きょう",
                    "right": "休みです",
                    "rightRuby": "やすみです"
                },
                {
                    "j": "明日は雨です",
                    "r": "あしたはあめです",
                    "zh": "明天是雨天",
                    "left": "明日",
                    "leftRuby": "あした",
                    "right": "雨です",
                    "rightRuby": "あめです"
                },
                {
                    "j": "昨日は晴れでした",
                    "r": "きのうははれでした",
                    "zh": "昨天是晴天",
                    "left": "昨日",
                    "leftRuby": "きのう",
                    "right": "晴れでした",
                    "rightRuby": "はれでした"
                },
                {
                    "j": "日曜日はいい天気です",
                    "r": "にちようびはいいてんきです",
                    "zh": "星期天是好天氣",
                    "left": "日曜日",
                    "leftRuby": "にちようび",
                    "right": "いい天気です",
                    "rightRuby": "いいてんきです"
                },
                {
                    "j": "週末は休みです",
                    "r": "しゅうまつはやすみです",
                    "zh": "週末是休息日",
                    "left": "週末",
                    "leftRuby": "しゅうまつ",
                    "right": "休みです",
                    "rightRuby": "やすみです"
                },
                {
                    "j": "月曜日は忙しいです",
                    "r": "げつようびはいそがしいです",
                    "zh": "星期一很忙",
                    "left": "月曜日",
                    "leftRuby": "げつようび",
                    "right": "忙しいです",
                    "rightRuby": "いそがしいです"
                },
                {
                    "j": "冬は寒いです",
                    "r": "ふゆはさむいです",
                    "zh": "冬天很冷",
                    "left": "冬",
                    "leftRuby": "ふゆ",
                    "right": "寒いです",
                    "rightRuby": "さむいです"
                },
                {
                    "j": "夏は暑いです",
                    "r": "なつはあついです",
                    "zh": "夏天很熱",
                    "left": "夏",
                    "leftRuby": "なつ",
                    "right": "暑いです",
                    "rightRuby": "あついです"
                },
                {
                    "j": "これはペンです",
                    "r": "これはぺんです",
                    "zh": "這是筆",
                    "left": "これ",
                    "leftRuby": "これ",
                    "right": "ペンです",
                    "rightRuby": "ぺんです"
                },
                {
                    "j": "それは本です",
                    "r": "それはほんです",
                    "zh": "那是書",
                    "left": "それ",
                    "leftRuby": "それ",
                    "right": "本です",
                    "rightRuby": "ほんです"
                },
                {
                    "j": "あれは学校です",
                    "r": "あれはがっこうです",
                    "zh": "那是學校",
                    "left": "あれ",
                    "leftRuby": "あれ",
                    "right": "学校です",
                    "rightRuby": "がっこうです"
                },
                {
                    "j": "ここは教室です",
                    "r": "ここはきょうしつです",
                    "zh": "這裡是教室",
                    "left": "ここ",
                    "leftRuby": "ここ",
                    "right": "教室です",
                    "rightRuby": "きょうしつです"
                },
                {
                    "j": "あそこは駅です",
                    "r": "あそこはえきです",
                    "zh": "那裡是車站",
                    "left": "あそこ",
                    "leftRuby": "あそこ",
                    "right": "駅です",
                    "rightRuby": "えきです"
                }
            ]
        },
        "NO_POSSESSIVE": {
            "safeCombos": [
                {
                    "j": "私の本",
                    "r": "わたしのほん",
                    "zh": "我的書",
                    "left": "私",
                    "leftRuby": "わたし",
                    "right": "本",
                    "rightRuby": "ほん"
                },
                {
                    "j": "あなたのかばん",
                    "r": "あなたのかばん",
                    "zh": "你的包包",
                    "left": "あなた",
                    "leftRuby": "あなた",
                    "right": "かばん",
                    "rightRuby": "かばん"
                },
                {
                    "j": "先生の机",
                    "r": "せんせいのつくえ",
                    "zh": "老師的桌子",
                    "left": "先生",
                    "leftRuby": "せんせい",
                    "right": "机",
                    "rightRuby": "つくえ"
                },
                {
                    "j": "母の靴",
                    "r": "ははのくつ",
                    "zh": "媽媽的鞋子",
                    "left": "母",
                    "leftRuby": "はは",
                    "right": "靴",
                    "rightRuby": "くつ"
                },
                {
                    "j": "父の車",
                    "r": "ちちのくるま",
                    "zh": "爸爸的車",
                    "left": "父",
                    "leftRuby": "ちち",
                    "right": "車",
                    "rightRuby": "くるま"
                },
                {
                    "j": "友達の部屋",
                    "r": "ともだちのへや",
                    "zh": "朋友的房間",
                    "left": "友達",
                    "leftRuby": "ともだち",
                    "right": "部屋",
                    "rightRuby": "へや"
                },
                {
                    "j": "田中さんの傘",
                    "r": "たなかさんのかさ",
                    "zh": "田中先生的傘",
                    "left": "田中さん",
                    "leftRuby": "たなかさん",
                    "right": "傘",
                    "rightRuby": "かさ"
                },
                {
                    "j": "日本の料理",
                    "r": "にほんのりょうり",
                    "zh": "日本的料理",
                    "left": "日本",
                    "leftRuby": "にほん",
                    "right": "料理",
                    "rightRuby": "りょうり"
                },
                {
                    "j": "大学の図書館",
                    "r": "だいがくのとしょかん",
                    "zh": "大學的圖書館",
                    "left": "大学",
                    "leftRuby": "だいがく",
                    "right": "図書館",
                    "rightRuby": "としょかん"
                },
                {
                    "j": "学校の先生",
                    "r": "がっこうのせんせい",
                    "zh": "學校的老師",
                    "left": "学校",
                    "leftRuby": "がっこう",
                    "right": "先生",
                    "rightRuby": "せんせい"
                },
                {
                    "j": "会社の電話",
                    "r": "かいしゃのでんわ",
                    "zh": "公司的電話",
                    "left": "会社",
                    "leftRuby": "かいしゃ",
                    "right": "電話",
                    "rightRuby": "でんわ"
                },
                {
                    "j": "今日の天気",
                    "r": "きょうのてんき",
                    "zh": "今天的天氣",
                    "left": "今日",
                    "leftRuby": "きょう",
                    "right": "天気",
                    "rightRuby": "てんき"
                },
                {
                    "j": "明日のテスト",
                    "r": "あしたのてすと",
                    "zh": "明天的考試",
                    "left": "明日",
                    "leftRuby": "あした",
                    "right": "テスト",
                    "rightRuby": "てすと"
                },
                {
                    "j": "机の上",
                    "r": "つくえのうえ",
                    "zh": "桌子上",
                    "left": "机",
                    "leftRuby": "つくえ",
                    "right": "上",
                    "rightRuby": "うえ"
                },
                {
                    "j": "いすの下",
                    "r": "いすのした",
                    "zh": "椅子下",
                    "left": "いす",
                    "leftRuby": "いす",
                    "right": "下",
                    "rightRuby": "した"
                },
                {
                    "j": "かばんの中",
                    "r": "かばんのなか",
                    "zh": "包包裡",
                    "left": "かばん",
                    "leftRuby": "かばん",
                    "right": "中",
                    "rightRuby": "なか"
                },
                {
                    "j": "部屋の外",
                    "r": "へやのそと",
                    "zh": "房間外",
                    "left": "部屋",
                    "leftRuby": "へや",
                    "right": "外",
                    "rightRuby": "そと"
                },
                {
                    "j": "駅の前",
                    "r": "えきのまえ",
                    "zh": "車站前",
                    "left": "駅",
                    "leftRuby": "えき",
                    "right": "前",
                    "rightRuby": "まえ"
                },
                {
                    "j": "家の後ろ",
                    "r": "いえのうしろ",
                    "zh": "家後面",
                    "left": "家",
                    "leftRuby": "いえ",
                    "right": "後ろ",
                    "rightRuby": "うしろ"
                },
                {
                    "j": "日本の映画",
                    "r": "にほんのえいが",
                    "zh": "日本的電影",
                    "left": "日本",
                    "leftRuby": "にほん",
                    "right": "映画",
                    "rightRuby": "えいが"
                },
                {
                    "j": "英語の本",
                    "r": "えいごのほん",
                    "zh": "英文書",
                    "left": "英語",
                    "leftRuby": "えいご",
                    "right": "本",
                    "rightRuby": "ほん"
                }
            ]
        },
        "GA_INTRANSITIVE": {
            "safeCombos": [
                {
                    "j": "雨が降る",
                    "r": "あめがふる",
                    "zh": "下雨",
                    "left": "雨",
                    "leftRuby": "あめ",
                    "right": "降る",
                    "rightRuby": "ふる"
                },
                {
                    "j": "雪が降る",
                    "r": "ゆきがふる",
                    "zh": "下雪",
                    "left": "雪",
                    "leftRuby": "ゆき",
                    "right": "降る",
                    "rightRuby": "ふる"
                },
                {
                    "j": "風が吹く",
                    "r": "かぜがふく",
                    "zh": "起風",
                    "left": "風",
                    "leftRuby": "かぜ",
                    "right": "吹く",
                    "rightRuby": "ふく"
                },
                {
                    "j": "空が曇る",
                    "r": "そらがくもる",
                    "zh": "天空變陰",
                    "left": "空",
                    "leftRuby": "そら",
                    "right": "曇る",
                    "rightRuby": "くもる"
                },
                {
                    "j": "花が咲く",
                    "r": "はながさく",
                    "zh": "開花",
                    "left": "花",
                    "leftRuby": "はな",
                    "right": "咲く",
                    "rightRuby": "さく"
                },
                {
                    "j": "ドアが開く",
                    "r": "どあがあく",
                    "zh": "門開了",
                    "left": "ドア",
                    "leftRuby": "どあ",
                    "right": "開く",
                    "rightRuby": "あく"
                },
                {
                    "j": "窓が閉まる",
                    "r": "まどがしまる",
                    "zh": "窗戶關了",
                    "left": "窓",
                    "leftRuby": "まど",
                    "right": "閉まる",
                    "rightRuby": "しまる"
                },
                {
                    "j": "電気がつく",
                    "r": "でんきがつく",
                    "zh": "燈亮了",
                    "left": "電気",
                    "leftRuby": "でんき",
                    "right": "つく",
                    "rightRuby": "つく"
                },
                {
                    "j": "電気が消える",
                    "r": "でんきがきえる",
                    "zh": "燈滅了",
                    "left": "電気",
                    "leftRuby": "でんき",
                    "right": "消える",
                    "rightRuby": "きえる"
                },
                {
                    "j": "水が流れる",
                    "r": "みずがながれる",
                    "zh": "水在流",
                    "left": "水",
                    "leftRuby": "みず",
                    "right": "流れる",
                    "rightRuby": "ながれる"
                },
                {
                    "j": "バスが止まる",
                    "r": "ばすがとまる",
                    "zh": "公車停下",
                    "left": "バス",
                    "leftRuby": "ばす",
                    "right": "止まる",
                    "rightRuby": "とまる"
                },
                {
                    "j": "人が集まる",
                    "r": "ひとがあつまる",
                    "zh": "人群聚集",
                    "left": "人",
                    "leftRuby": "ひと",
                    "right": "集まる",
                    "rightRuby": "あつまる"
                },
                {
                    "j": "問題が起きる",
                    "r": "もんだいがおきる",
                    "zh": "發生問題",
                    "left": "問題",
                    "leftRuby": "もんだい",
                    "right": "起きる",
                    "rightRuby": "おきる"
                },
                {
                    "j": "鐘が鳴る",
                    "r": "かねがなる",
                    "zh": "鐘聲響起",
                    "left": "鐘",
                    "leftRuby": "かね",
                    "right": "鳴る",
                    "rightRuby": "なる"
                },
                {
                    "j": "星が見える",
                    "r": "ほしがみえる",
                    "zh": "看得見星星",
                    "left": "星",
                    "leftRuby": "ほし",
                    "right": "見える",
                    "rightRuby": "みえる"
                },
                {
                    "j": "山が見える",
                    "r": "やまがみえる",
                    "zh": "看得見山",
                    "left": "山",
                    "leftRuby": "やま",
                    "right": "見える",
                    "rightRuby": "みえる"
                },
                {
                    "j": "音が聞こえる",
                    "r": "おとがきこえる",
                    "zh": "聽得到聲音",
                    "left": "音",
                    "leftRuby": "おと",
                    "right": "聞こえる",
                    "rightRuby": "きこえる"
                },
                {
                    "j": "鳥が飛ぶ",
                    "r": "とりがとぶ",
                    "zh": "鳥在飛",
                    "left": "鳥",
                    "leftRuby": "とり",
                    "right": "飛ぶ",
                    "rightRuby": "とぶ"
                },
                {
                    "j": "桜が散る",
                    "r": "さくらがちる",
                    "zh": "櫻花飄落",
                    "left": "桜",
                    "leftRuby": "さくら",
                    "right": "散る",
                    "rightRuby": "ちる"
                },
                {
                    "j": "子供が泣く",
                    "r": "こどもがなく",
                    "zh": "小孩在哭",
                    "left": "子供",
                    "leftRuby": "こども",
                    "right": "泣く",
                    "rightRuby": "なく"
                }
            ]
        },
        "WO_OBJECT_BASIC": {
            "safeCombos": [
                {
                    "j": "本を読む",
                    "r": "ほんをよむ",
                    "zh": "看書",
                    "left": "本",
                    "leftRuby": "ほん",
                    "right": "読む",
                    "rightRuby": "よむ"
                },
                {
                    "j": "手紙を書く",
                    "r": "てがみを書く",
                    "zh": "寫信",
                    "left": "手紙",
                    "leftRuby": "てがみ",
                    "right": "書く",
                    "rightRuby": "かく"
                },
                {
                    "j": "ご飯を食べる",
                    "r": "ごはんをたべる",
                    "zh": "吃飯",
                    "left": "ご飯",
                    "leftRuby": "ごはん",
                    "right": "食べる",
                    "rightRuby": "たべる"
                },
                {
                    "j": "パンを食べる",
                    "r": "ぱんをたべる",
                    "zh": "吃麵包",
                    "left": "パン",
                    "leftRuby": "ぱん",
                    "right": "食べる",
                    "rightRuby": "たべる"
                },
                {
                    "j": "水を飲む",
                    "r": "みずをのむ",
                    "zh": "喝水",
                    "left": "水",
                    "leftRuby": "みず",
                    "right": "飲む",
                    "rightRuby": "のむ"
                },
                {
                    "j": "お茶を飲む",
                    "r": "おちゃをのむ",
                    "zh": "喝茶",
                    "left": "お茶",
                    "leftRuby": "おちゃ",
                    "right": "飲む",
                    "rightRuby": "のむ"
                },
                {
                    "j": "音楽を聞く",
                    "r": "おんがくをきく",
                    "zh": "聽音樂",
                    "left": "音楽",
                    "leftRuby": "おんがく",
                    "right": "聞く",
                    "rightRuby": "きく"
                },
                {
                    "j": "ラジオを聞く",
                    "r": "らじおをきく",
                    "zh": "聽廣播",
                    "left": "ラジオ",
                    "leftRuby": "らじお",
                    "right": "聞く",
                    "rightRuby": "きく"
                },
                {
                    "j": "映画を見る",
                    "r": "えいがをみる",
                    "zh": "看電影",
                    "left": "映画",
                    "leftRuby": "えいが",
                    "right": "見る",
                    "rightRuby": "みる"
                },
                {
                    "j": "テレビを見る",
                    "r": "てれびをみる",
                    "zh": "看電視",
                    "left": "テレビ",
                    "leftRuby": "てれび",
                    "right": "見る",
                    "rightRuby": "みる"
                },
                {
                    "j": "写真を撮る",
                    "r": "しゃしんをとる",
                    "zh": "拍照",
                    "left": "写真",
                    "leftRuby": "しゃしん",
                    "right": "撮る",
                    "rightRuby": "とる"
                },
                {
                    "j": "宿題をする",
                    "r": "しゅくだいをする",
                    "zh": "做作業",
                    "left": "宿題",
                    "leftRuby": "しゅくだい",
                    "right": "する",
                    "rightRuby": "する"
                },
                {
                    "j": "買い物をする",
                    "r": "かいものをする",
                    "zh": "購物",
                    "left": "買い物",
                    "leftRuby": "かいもの",
                    "right": "する",
                    "rightRuby": "する"
                },
                {
                    "j": "服を洗う",
                    "r": "ふくをあらう",
                    "zh": "洗衣服",
                    "left": "服",
                    "leftRuby": "ふく",
                    "right": "洗う",
                    "rightRuby": "あらう"
                },
                {
                    "j": "友達を待つ",
                    "r": "ともだちをまつ",
                    "zh": "等朋友",
                    "left": "友達",
                    "leftRuby": "ともだち",
                    "right": "待つ",
                    "rightRuby": "まつ"
                },
                {
                    "j": "ドアを開ける",
                    "r": "どあをあける",
                    "zh": "開門",
                    "left": "ドア",
                    "leftRuby": "どあ",
                    "right": "開ける",
                    "rightRuby": "あける"
                },
                {
                    "j": "窓を閉める",
                    "r": "まどをしめる",
                    "zh": "關窗",
                    "left": "窓",
                    "leftRuby": "まど",
                    "right": "閉める",
                    "rightRuby": "しめる"
                },
                {
                    "j": "電気をつける",
                    "r": "でんきをつける",
                    "zh": "開燈",
                    "left": "電気",
                    "leftRuby": "でんき",
                    "right": "つける",
                    "rightRuby": "つける"
                },
                {
                    "j": "電気を消す",
                    "r": "でんきをけす",
                    "zh": "關燈",
                    "left": "電気",
                    "leftRuby": "でんき",
                    "right": "消す",
                    "rightRuby": "けす"
                },
                {
                    "j": "パソコンを使う",
                    "r": "ぱそこんをつかう",
                    "zh": "用電腦",
                    "left": "パソコン",
                    "leftRuby": "ぱそこん",
                    "right": "使う",
                    "rightRuby": "つかう"
                },
                {
                    "j": "言葉を覚える",
                    "r": "ことばをおぼえる",
                    "zh": "記單字",
                    "left": "言葉",
                    "leftRuby": "ことば",
                    "right": "覚える",
                    "rightRuby": "おぼえる"
                }
            ]
        },
        "HE_DIRECTION": {
            "safeCombos": [
                {
                    "j": "学校へ行く",
                    "r": "がっこうへいく",
                    "zh": "去學校",
                    "left": "学校",
                    "leftRuby": "がっこう",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "駅へ行く",
                    "r": "えきへいく",
                    "zh": "去車站",
                    "left": "駅",
                    "leftRuby": "えき",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "会社へ行く",
                    "r": "かいしゃへいく",
                    "zh": "去公司",
                    "left": "会社",
                    "leftRuby": "かいしゃ",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "病院へ行く",
                    "r": "びょういんへいく",
                    "zh": "去醫院",
                    "left": "病院",
                    "leftRuby": "びょういん",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "家へ帰る",
                    "r": "いえへかえる",
                    "zh": "回家",
                    "left": "家",
                    "leftRuby": "いえ",
                    "right": "帰る",
                    "rightRuby": "かえる"
                },
                {
                    "j": "うちへ帰る",
                    "r": "うちへかえる",
                    "zh": "回家",
                    "left": "うち",
                    "leftRuby": "うち",
                    "right": "帰る",
                    "rightRuby": "かえる"
                },
                {
                    "j": "国へ帰る",
                    "r": "くにへかえる",
                    "zh": "回國",
                    "left": "国",
                    "leftRuby": "くに",
                    "right": "帰る",
                    "rightRuby": "かえる"
                },
                {
                    "j": "家へ来る",
                    "r": "いえへくる",
                    "zh": "來家裡",
                    "left": "家",
                    "leftRuby": "いえ",
                    "right": "来る",
                    "rightRuby": "くる"
                },
                {
                    "j": "学校へ来る",
                    "r": "がっこうへくる",
                    "zh": "來學校",
                    "left": "学校",
                    "leftRuby": "がっこう",
                    "right": "来る",
                    "rightRuby": "くる"
                },
                {
                    "j": "右へ曲がる",
                    "r": "みぎへまがる",
                    "zh": "向右轉",
                    "left": "右",
                    "leftRuby": "みぎ",
                    "right": "曲がる",
                    "rightRuby": "まがる"
                },
                {
                    "j": "左へ曲がる",
                    "r": "ひだりへまがる",
                    "zh": "向左轉",
                    "left": "左",
                    "leftRuby": "ひだり",
                    "right": "曲がる",
                    "rightRuby": "まがる"
                },
                {
                    "j": "前へ進む",
                    "r": "まえへすすむ",
                    "zh": "向前進",
                    "left": "前",
                    "leftRuby": "まえ",
                    "right": "進む",
                    "rightRuby": "すすむ"
                },
                {
                    "j": "後ろへ下がる",
                    "r": "うしろへさがる",
                    "zh": "向後退",
                    "left": "後ろ",
                    "leftRuby": "うしろ",
                    "right": "下がる",
                    "rightRuby": "さがる"
                },
                {
                    "j": "北へ向かう",
                    "r": "きたへむかう",
                    "zh": "朝北方去",
                    "left": "北",
                    "leftRuby": "きた",
                    "right": "向かう",
                    "rightRuby": "むかう"
                },
                {
                    "j": "南へ走る",
                    "r": "みなみへはしる",
                    "zh": "往南跑",
                    "left": "南",
                    "leftRuby": "みなみ",
                    "right": "走る",
                    "rightRuby": "はしる"
                },
                {
                    "j": "東へ行く",
                    "r": "ひがしへいく",
                    "zh": "往東走",
                    "left": "東",
                    "leftRuby": "ひがし",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "西へ進む",
                    "r": "にしへすすむ",
                    "zh": "向西行",
                    "left": "西",
                    "leftRuby": "にし",
                    "right": "進む",
                    "rightRuby": "すすむ"
                },
                {
                    "j": "上へ登る",
                    "r": "うえへのぼる",
                    "zh": "往上爬",
                    "left": "上",
                    "leftRuby": "うえ",
                    "right": "登る",
                    "rightRuby": "のぼる"
                },
                {
                    "j": "下へ降りる",
                    "r": "したへおりる",
                    "zh": "往下走",
                    "left": "下",
                    "leftRuby": "した",
                    "right": "降りる",
                    "rightRuby": "おりる"
                },
                {
                    "j": "外へ出る",
                    "r": "そとへでる",
                    "zh": "往外走",
                    "left": "外",
                    "leftRuby": "そと",
                    "right": "出る",
                    "rightRuby": "でる"
                },
                {
                    "j": "中へ入る",
                    "r": "なかへはいる",
                    "zh": "往裡面走",
                    "left": "中",
                    "leftRuby": "なか",
                    "right": "入る",
                    "rightRuby": "はいる"
                }
            ]
        },
        "MO_ALSO_BASIC": {
            "safeCombos": [
                {
                    "j": "私も学生です",
                    "r": "わたしもがくせいです",
                    "zh": "我也是學生",
                    "left": "私",
                    "leftRuby": "わたし",
                    "right": "学生です",
                    "rightRuby": "がくせいです"
                },
                {
                    "j": "あなたも医者ですか",
                    "r": "あなたもいしゃですか",
                    "zh": "你也是醫生嗎",
                    "left": "あなた",
                    "leftRuby": "あなた",
                    "right": "医者ですか",
                    "rightRuby": "いしゃですか"
                },
                {
                    "j": "田中さんも先生です",
                    "r": "たなかさんもせんせいです",
                    "zh": "田中先生也是老師",
                    "left": "田中さん",
                    "leftRuby": "たなかさん",
                    "right": "先生です",
                    "rightRuby": "せんせいです"
                },
                {
                    "j": "木村さんも来ます",
                    "r": "きむらさんもきます",
                    "zh": "木村先生也會來",
                    "left": "木村さん",
                    "leftRuby": "きむらさん",
                    "right": "来ます",
                    "rightRuby": "きます"
                },
                {
                    "j": "母も行きます",
                    "r": "ははもいきます",
                    "zh": "媽媽也要去",
                    "left": "母",
                    "leftRuby": "はは",
                    "right": "行きます",
                    "rightRuby": "いきます"
                },
                {
                    "j": "父も休みです",
                    "r": "ちちもやすみです",
                    "zh": "爸爸也休息",
                    "left": "父",
                    "leftRuby": "ちち",
                    "right": "休みです",
                    "rightRuby": "やすみです"
                },
                {
                    "j": "明日も雨です",
                    "r": "あしたもあめです",
                    "zh": "明天也是雨天",
                    "left": "明日",
                    "leftRuby": "あした",
                    "right": "雨です",
                    "rightRuby": "あめです"
                },
                {
                    "j": "週末も忙しいです",
                    "r": "しゅうまつもいそがしいです",
                    "zh": "週末也很忙",
                    "left": "週末",
                    "leftRuby": "しゅうまつ",
                    "right": "忙しいです",
                    "rightRuby": "いそがしいです"
                },
                {
                    "j": "友達も食べます",
                    "r": "ともだちもたべます",
                    "zh": "朋友也要吃",
                    "left": "友達",
                    "leftRuby": "ともだち",
                    "right": "食べます",
                    "rightRuby": "たべます"
                },
                {
                    "j": "肉も好きです",
                    "r": "にくもすきです",
                    "zh": "肉也喜歡",
                    "left": "肉",
                    "leftRuby": "にく",
                    "right": "好きです",
                    "rightRuby": "すきです"
                },
                {
                    "j": "犬も好きです",
                    "r": "いぬもすきです",
                    "zh": "狗也喜歡",
                    "left": "犬",
                    "leftRuby": "いぬ",
                    "right": "好きです",
                    "rightRuby": "すきです"
                },
                {
                    "j": "英語も分かります",
                    "r": "えいごもわかります",
                    "zh": "英語也懂",
                    "left": "英語",
                    "leftRuby": "えいご",
                    "right": "分かります",
                    "rightRuby": "わかります"
                },
                {
                    "j": "お茶も飲みます",
                    "r": "おちゃものみます",
                    "zh": "茶也喝",
                    "left": "お茶",
                    "leftRuby": "おちゃ",
                    "right": "飲みます",
                    "rightRuby": "のみます"
                },
                {
                    "j": "これも美味しいです",
                    "r": "これもおいしいです",
                    "zh": "這個也很好吃",
                    "left": "これ",
                    "leftRuby": "これ",
                    "right": "美味しいです",
                    "rightRuby": "おいしいです"
                },
                {
                    "j": "それもペンです",
                    "r": "それもぺんです",
                    "zh": "那個也是筆",
                    "left": "それ",
                    "leftRuby": "それ",
                    "right": "ペンです",
                    "rightRuby": "ぺんです"
                },
                {
                    "j": "ここも教室です",
                    "r": "ここもきょうしつです",
                    "zh": "這裡也是教室",
                    "left": "ここ",
                    "leftRuby": "ここ",
                    "right": "教室です",
                    "rightRuby": "きょうしつです"
                },
                {
                    "j": "あそこも駅です",
                    "r": "あそこもえきです",
                    "zh": "那裡也是車站",
                    "left": "あそこ",
                    "leftRuby": "あそこ",
                    "right": "駅です",
                    "rightRuby": "えきです"
                },
                {
                    "j": "今日から明日も",
                    "r": "きょうからあしたも",
                    "zh": "今天到明天也",
                    "left": "明日",
                    "leftRuby": "あした",
                    "right": "休み",
                    "rightRuby": "やすみ"
                },
                {
                    "j": "映画も見ます",
                    "r": "えいがもみます",
                    "zh": "電影也看",
                    "left": "映画",
                    "leftRuby": "えいが",
                    "right": "見ます",
                    "rightRuby": "みます"
                },
                {
                    "j": "音楽も聞きます",
                    "r": "おんがくもききます",
                    "zh": "音樂也聽",
                    "left": "音楽",
                    "leftRuby": "おんがく",
                    "right": "聞きます",
                    "rightRuby": "ききます"
                }
            ]
        },
        "DE_ACTION_PLACE": {
            "safeCombos": [
                {
                    "j": "教室で勉強する",
                    "r": "きょうしつでべんきょうする",
                    "zh": "在教室讀書",
                    "left": "教室",
                    "leftRuby": "きょうしつ",
                    "right": "勉強する",
                    "rightRuby": "べんきょうする"
                },
                {
                    "j": "図書館で本を読む",
                    "r": "としょかんでほんをよむ",
                    "zh": "在圖書館看書",
                    "left": "図書館",
                    "leftRuby": "としょかん",
                    "right": "本を読む",
                    "rightRuby": "ほんをよむ"
                },
                {
                    "j": "家で寝る",
                    "r": "いえでねる",
                    "zh": "在家睡覺",
                    "left": "家",
                    "leftRuby": "いえ",
                    "right": "寝る",
                    "rightRuby": "ねる"
                },
                {
                    "j": "うちで休む",
                    "r": "うちでやすむ",
                    "zh": "在家休息",
                    "left": "うち",
                    "leftRuby": "うち",
                    "right": "休む",
                    "rightRuby": "やすむ"
                },
                {
                    "j": "公園で遊ぶ",
                    "r": "こうえんであそぶ",
                    "zh": "在公園玩",
                    "left": "公園",
                    "leftRuby": "こうえん",
                    "right": "遊ぶ",
                    "rightRuby": "あそぶ"
                },
                {
                    "j": "カフェでコーヒーを飲む",
                    "r": "かふぇでこーひーをのむ",
                    "zh": "在咖啡廳喝咖啡",
                    "left": "カフェ",
                    "leftRuby": "かふぇ",
                    "right": "コーヒーを飲む",
                    "rightRuby": "こーひーをのむ"
                },
                {
                    "j": "レストランで食事する",
                    "r": "れすとらんでしょくじする",
                    "zh": "在餐廳吃飯",
                    "left": "レストラン",
                    "leftRuby": "れすとらん",
                    "right": "食事する",
                    "rightRuby": "しょくじする"
                },
                {
                    "j": "食堂でご飯を食べる",
                    "r": "しょくどうでごはんをたべる",
                    "zh": "在食堂吃飯",
                    "left": "食堂",
                    "leftRuby": "しょくどう",
                    "right": "ご飯を食べる",
                    "rightRuby": "ごはんをたべる"
                },
                {
                    "j": "部屋で音楽を聞く",
                    "r": "へやでおんがくをきく",
                    "zh": "在房間聽音樂",
                    "left": "部屋",
                    "leftRuby": "へや",
                    "right": "音楽を聞く",
                    "rightRuby": "おんがくをきく"
                },
                {
                    "j": "学校で友達に会う",
                    "r": "がっこうでともだちにあう",
                    "zh": "在學校見朋友",
                    "left": "学校",
                    "leftRuby": "がっこう",
                    "right": "友達に会う",
                    "rightRuby": "ともだちにあう"
                },
                {
                    "j": "駅で待つ",
                    "r": "えきでまつ",
                    "zh": "在車站等候",
                    "left": "駅",
                    "leftRuby": "えき",
                    "right": "待つ",
                    "rightRuby": "まつ"
                },
                {
                    "j": "会社で働く",
                    "r": "かいしゃではたらく",
                    "zh": "在公司工作",
                    "left": "会社",
                    "leftRuby": "かいしゃ",
                    "right": "働く",
                    "rightRuby": "はたらく"
                },
                {
                    "j": "病院で薬をもらう",
                    "r": "びょういんでくすりをもらう",
                    "zh": "在醫院拿藥",
                    "left": "病院",
                    "leftRuby": "びょういん",
                    "right": "薬をもらう",
                    "rightRuby": "くすりをもらう"
                },
                {
                    "j": "海で泳ぐ",
                    "r": "うみでおよぐ",
                    "zh": "在海裡游泳",
                    "left": "海",
                    "leftRuby": "うみ",
                    "right": "泳ぐ",
                    "rightRuby": "およぐ"
                },
                {
                    "j": "山で写真を撮る",
                    "r": "やまでしゃしんをとる",
                    "zh": "在山上拍照",
                    "left": "山",
                    "leftRuby": "やま",
                    "right": "写真を撮る",
                    "rightRuby": "しゃしんをとる"
                },
                {
                    "j": "スーパーで買い物する",
                    "r": "すーぱーでかいものする",
                    "zh": "在超市購物",
                    "left": "スーパー",
                    "leftRuby": "すーぱー",
                    "right": "買い物する",
                    "rightRuby": "かいものする"
                },
                {
                    "j": "店でパンを買う",
                    "r": "みせでぱんをかう",
                    "zh": "在商店買麵包",
                    "left": "店",
                    "leftRuby": "みせ",
                    "right": "パンを買う",
                    "rightRuby": "ぱんをかう"
                },
                {
                    "j": "道で走る",
                    "r": "みちではしる",
                    "zh": "在路上跑步",
                    "left": "道",
                    "leftRuby": "みち",
                    "right": "走る",
                    "rightRuby": "はしる"
                },
                {
                    "j": "バスの中で寝る",
                    "r": "ばすのなかでねる",
                    "zh": "在公車裡睡覺",
                    "left": "バスの中",
                    "leftRuby": "ばすのなか",
                    "right": "寝る",
                    "rightRuby": "ねる"
                },
                {
                    "j": "空を飛ぶ",
                    "r": "そらをとぶ",
                    "zh": "在天上飛(通常用を但可)",
                    "left": "日本",
                    "leftRuby": "にほん",
                    "right": "旅行する",
                    "rightRuby": "りょこうする"
                }
            ]
        },
        "TO_WITH": {
            "safeCombos": [
                {
                    "j": "友達と遊ぶ",
                    "r": "ともだちとあそぶ",
                    "zh": "和朋友玩",
                    "left": "友達",
                    "leftRuby": "ともだち",
                    "right": "遊ぶ",
                    "rightRuby": "あそぶ"
                },
                {
                    "j": "家族と食べる",
                    "r": "かぞくとたべる",
                    "zh": "和家人吃飯",
                    "left": "家族",
                    "leftRuby": "かぞく",
                    "right": "食べる",
                    "rightRuby": "たべる"
                },
                {
                    "j": "先生と話す",
                    "r": "せんせいとはなす",
                    "zh": "和老師說話",
                    "left": "先生",
                    "leftRuby": "せんせい",
                    "right": "話す",
                    "rightRuby": "はなす"
                },
                {
                    "j": "母と買い物する",
                    "r": "ははとかいものする",
                    "zh": "和媽媽購物",
                    "left": "母",
                    "leftRuby": "はは",
                    "right": "買い物する",
                    "rightRuby": "かいものする"
                },
                {
                    "j": "兄と映画を見る",
                    "r": "あにとえいがをみる",
                    "zh": "和哥哥看電影",
                    "left": "兄",
                    "leftRuby": "あに",
                    "right": "映画を見る",
                    "rightRuby": "えいがをみる"
                },
                {
                    "j": "友達とゲームをする",
                    "r": "ともだちとげーむをする",
                    "zh": "和朋友玩遊戲",
                    "left": "友達",
                    "leftRuby": "ともだち",
                    "right": "ゲームをする",
                    "rightRuby": "げーむをする"
                },
                {
                    "j": "父と出かける",
                    "r": "ちちとでかける",
                    "zh": "和爸爸出門",
                    "left": "父",
                    "leftRuby": "ちち",
                    "right": "出かける",
                    "rightRuby": "でかける"
                },
                {
                    "j": "姉と散歩する",
                    "r": "あねとさんぽする",
                    "zh": "和姐姐散步",
                    "left": "姉",
                    "leftRuby": "あね",
                    "right": "散歩する",
                    "rightRuby": "さんぽする"
                },
                {
                    "j": "友達と勉強する",
                    "r": "ともだちとべんきょうする",
                    "zh": "和朋友讀書",
                    "left": "友達",
                    "leftRuby": "ともだち",
                    "right": "勉強する",
                    "rightRuby": "べんきょうする"
                },
                {
                    "j": "家族と旅行する",
                    "r": "かぞくとりょこうする",
                    "zh": "和家人旅行",
                    "left": "家族",
                    "leftRuby": "かぞく",
                    "right": "旅行する",
                    "rightRuby": "りょこうする"
                },
                {
                    "j": "田中さんと話す",
                    "r": "たなかさんとはなす",
                    "zh": "和田中先生說話",
                    "left": "田中さん",
                    "leftRuby": "たなかさん",
                    "right": "話す",
                    "rightRuby": "はなす"
                },
                {
                    "j": "妹と歩く",
                    "r": "いもうととあるく",
                    "zh": "和妹妹散步",
                    "left": "妹",
                    "leftRuby": "いもうと",
                    "right": "歩く",
                    "rightRuby": "あるく"
                },
                {
                    "j": "彼と会う",
                    "r": "かれとあう",
                    "zh": "和他見面(需用に，這裡改行く)",
                    "left": "彼",
                    "leftRuby": "かれ",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "彼女と来る",
                    "r": "かのじょとくる",
                    "zh": "和女朋友來",
                    "left": "彼女",
                    "leftRuby": "かのじょ",
                    "right": "来る",
                    "rightRuby": "くる"
                },
                {
                    "j": "みんなと食べる",
                    "r": "みんなとたべる",
                    "zh": "和大家一起吃飯",
                    "left": "みんな",
                    "leftRuby": "みんな",
                    "right": "食べる",
                    "rightRuby": "たべる"
                },
                {
                    "j": "弟と走る",
                    "r": "おとうととはしる",
                    "zh": "和弟弟跑步",
                    "left": "弟",
                    "leftRuby": "おとうと",
                    "right": "走る",
                    "rightRuby": "はしる"
                },
                {
                    "j": "先輩と飲む",
                    "r": "せんぱいとのむ",
                    "zh": "和前輩喝酒",
                    "left": "先輩",
                    "leftRuby": "せんぱい",
                    "right": "飲む",
                    "rightRuby": "のむ"
                },
                {
                    "j": "後輩と帰る",
                    "r": "こうはいとかえる",
                    "zh": "和晚輩回家",
                    "left": "後輩",
                    "leftRuby": "こうはい",
                    "right": "帰る",
                    "rightRuby": "かえる"
                },
                {
                    "j": "犬と散歩する",
                    "r": "いぬとさんぽする",
                    "zh": "和狗散步",
                    "left": "犬",
                    "leftRuby": "いぬ",
                    "right": "散歩する",
                    "rightRuby": "さんぽする"
                },
                {
                    "j": "子供と遊ぶ",
                    "r": "こどもとあそぶ",
                    "zh": "和小孩玩",
                    "left": "子供",
                    "leftRuby": "こども",
                    "right": "遊ぶ",
                    "rightRuby": "あそぶ"
                }
            ]
        },
        "NI_EXIST_PLACE": {
            "safeCombos": [
                {
                    "j": "部屋にいる",
                    "r": "へやにいる",
                    "zh": "在房間裡",
                    "left": "部屋",
                    "leftRuby": "へや",
                    "right": "いる",
                    "rightRuby": "いる"
                },
                {
                    "j": "机の上にある",
                    "r": "つくえのうえにある",
                    "zh": "在桌子上",
                    "left": "机の上",
                    "leftRuby": "つくえのうえ",
                    "right": "ある",
                    "rightRuby": "ある"
                },
                {
                    "j": "公園に猫がいる",
                    "r": "こうえんにねこがいる",
                    "zh": "公園裡有貓",
                    "left": "公園",
                    "leftRuby": "こうえん",
                    "right": "猫がいる",
                    "rightRuby": "ねこがいる"
                },
                {
                    "j": "庭に犬がいる",
                    "r": "にわにいぬがいる",
                    "zh": "庭院裡有狗",
                    "left": "庭",
                    "leftRuby": "にわ",
                    "right": "犬がいる",
                    "rightRuby": "いぬがいる"
                },
                {
                    "j": "会議室に先生がいる",
                    "r": "かいぎしつにせんせいがいる",
                    "zh": "會議室裡有老師",
                    "left": "会議室",
                    "leftRuby": "かいぎしつ",
                    "right": "先生がいる",
                    "rightRuby": "せんせいがいる"
                },
                {
                    "j": "カバンの中に本がある",
                    "r": "かばんのなかにほんがある",
                    "zh": "包包裡有書",
                    "left": "カバンの中",
                    "leftRuby": "かばんのなか",
                    "right": "本がある",
                    "rightRuby": "ほんがある"
                },
                {
                    "j": "冷蔵庫にケーキがある",
                    "r": "れいぞうこにけーきがある",
                    "zh": "冰箱裡有蛋糕",
                    "left": "冷蔵庫",
                    "leftRuby": "れいぞうこ",
                    "right": "ケーキがある",
                    "rightRuby": "けーきがある"
                },
                {
                    "j": "学校に生徒がいる",
                    "r": "がっこうにせいとがいる",
                    "zh": "學校裡有學生",
                    "left": "学校",
                    "leftRuby": "がっこう",
                    "right": "生徒がいる",
                    "rightRuby": "せいとがいる"
                },
                {
                    "j": "箱の中にりんごがある",
                    "r": "はこのなかにりんごがある",
                    "zh": "箱子裡有蘋果",
                    "left": "箱の中",
                    "leftRuby": "はこのなか",
                    "right": "りんごがある",
                    "rightRuby": "りんごがある"
                },
                {
                    "j": "教室に友達がいる",
                    "r": "きょうしつにともだちがいる",
                    "zh": "教室裡有朋友",
                    "left": "教室",
                    "leftRuby": "きょうしつ",
                    "right": "友達がいる",
                    "rightRuby": "ともだちがいる"
                },
                {
                    "j": "山に雪がある",
                    "r": "やまにゆきがある",
                    "zh": "山上有雪",
                    "left": "山",
                    "leftRuby": "やま",
                    "right": "雪がある",
                    "rightRuby": "ゆきがある"
                },
                {
                    "j": "引き出しに鍵がある",
                    "r": "ひきだしにかぎがある",
                    "zh": "抽屜裡有鑰匙",
                    "left": "引き出し",
                    "leftRuby": "ひきだし",
                    "right": "鍵がある",
                    "rightRuby": "かぎがある"
                },
                {
                    "j": "空に雲がある",
                    "r": "そらにくもがある",
                    "zh": "天空中有雲",
                    "left": "空",
                    "leftRuby": "そら",
                    "right": "雲がある",
                    "rightRuby": "くもがある"
                },
                {
                    "j": "ロビーに人がいる",
                    "r": "ろびーにひとがいる",
                    "zh": "大廳有人",
                    "left": "ロビー",
                    "leftRuby": "ろびー",
                    "right": "人がいる",
                    "rightRuby": "ひとがいる"
                },
                {
                    "j": "お皿にパンがある",
                    "r": "おさらにぱんがある",
                    "zh": "盤子裡有麵包",
                    "left": "お皿",
                    "leftRuby": "おさら",
                    "right": "パンがある",
                    "rightRuby": "ぱんがある"
                },
                {
                    "j": "本棚に本がある",
                    "r": "ほんだなにほんがある",
                    "zh": "書架上有書",
                    "left": "本棚",
                    "leftRuby": "ほんだな",
                    "right": "本がある",
                    "rightRuby": "ほんがある"
                },
                {
                    "j": "家に家族がいる",
                    "r": "いえにかぞくがいる",
                    "zh": "家裡有家人",
                    "left": "家",
                    "leftRuby": "いえ",
                    "right": "家族がいる",
                    "rightRuby": "かぞくがいる"
                },
                {
                    "j": "机の下にペンがある",
                    "r": "つくえのしたにぺんがある",
                    "zh": "桌子下有筆",
                    "left": "机の下",
                    "leftRuby": "つくえのした",
                    "right": "ペンがある",
                    "rightRuby": "ぺんがある"
                },
                {
                    "j": "外に車がある",
                    "r": "そとにくるまがある",
                    "zh": "外面有車",
                    "left": "外",
                    "leftRuby": "そと",
                    "right": "車がある",
                    "rightRuby": "くるまがある"
                },
                {
                    "j": "池に魚がいる",
                    "r": "いけにさかながいる",
                    "zh": "池塘裡有魚",
                    "left": "池",
                    "leftRuby": "いけ",
                    "right": "魚がいる",
                    "rightRuby": "さかながいる"
                },
                {
                    "j": "木の上に鳥がいる",
                    "r": "きのうえにとりがいる",
                    "zh": "樹上有鳥",
                    "left": "木の上",
                    "leftRuby": "きのうえ",
                    "right": "鳥がいる",
                    "rightRuby": "とりがいる"
                }
            ]
        },
        "NI_TIME": {
            "safeCombos": [
                {
                    "j": "8時に起きる",
                    "r": "はちじにおきる",
                    "zh": "8點起床",
                    "left": "8時",
                    "leftRuby": "はちじ",
                    "right": "起きる",
                    "rightRuby": "おきる"
                },
                {
                    "j": "9時に寝る",
                    "r": "くじにねる",
                    "zh": "9點睡覺",
                    "left": "9時",
                    "leftRuby": "くじ",
                    "right": "寝る",
                    "rightRuby": "ねる"
                },
                {
                    "j": "10時に終わる",
                    "r": "じゅうじにおわる",
                    "zh": "10點結束",
                    "left": "10時",
                    "leftRuby": "じゅうじ",
                    "right": "終わる",
                    "rightRuby": "おわる"
                },
                {
                    "j": "月曜日に勉強する",
                    "r": "げつようびにべんきょうする",
                    "zh": "星期一讀書",
                    "left": "月曜日",
                    "leftRuby": "げつようび",
                    "right": "勉強する",
                    "rightRuby": "べんきょうする"
                },
                {
                    "j": "火曜日に休む",
                    "r": "かようびにやすむ",
                    "zh": "星期二休息",
                    "left": "火曜日",
                    "leftRuby": "かようび",
                    "right": "休む",
                    "rightRuby": "やすむ"
                },
                {
                    "j": "日曜日に遊びに行く",
                    "r": "にちようびにあそびにいく",
                    "zh": "星期天去玩",
                    "left": "日曜日",
                    "leftRuby": "にちようび",
                    "right": "遊びに行く",
                    "rightRuby": "あそびにいく"
                },
                {
                    "j": "水曜日に来る",
                    "r": "すいようびにくる",
                    "zh": "星期三來",
                    "left": "水曜日",
                    "leftRuby": "すいようび",
                    "right": "来る",
                    "rightRuby": "くる"
                },
                {
                    "j": "金曜日に会う",
                    "r": "きんようびにあう",
                    "zh": "星期五見面",
                    "left": "金曜日",
                    "leftRuby": "きんようび",
                    "right": "会う",
                    "rightRuby": "あう"
                },
                {
                    "j": "12時に食べる",
                    "r": "じゅうにじにたべる",
                    "zh": "12點吃飯",
                    "left": "12時",
                    "leftRuby": "じゅうにじ",
                    "right": "食べる",
                    "rightRuby": "たべる"
                },
                {
                    "j": "朝の7時に起きる",
                    "r": "あさのしちじにおきる",
                    "zh": "早上7點起床",
                    "left": "朝の7時",
                    "leftRuby": "あさのしちじ",
                    "right": "起きる",
                    "rightRuby": "おきる"
                },
                {
                    "j": "午後3時に会う",
                    "r": "ごごさんじにあう",
                    "zh": "下午3點見",
                    "left": "午後3時",
                    "leftRuby": "ごごさんじ",
                    "right": "会う",
                    "rightRuby": "あう"
                },
                {
                    "j": "11時に待ち合わせる",
                    "r": "じゅういちじにまちあわせる",
                    "zh": "11點碰頭",
                    "left": "11時",
                    "leftRuby": "じゅういちじ",
                    "right": "待ち合わせる",
                    "rightRuby": "まちあわせる"
                },
                {
                    "j": "夏休みに旅行する",
                    "r": "なつやすみにりょこうする",
                    "zh": "暑假旅行",
                    "left": "夏休み",
                    "leftRuby": "なつやすみ",
                    "right": "旅行する",
                    "rightRuby": "りょこうする"
                },
                {
                    "j": "夜の11時に寝る",
                    "r": "よるのじゅういちじにねる",
                    "zh": "晚上11點睡",
                    "left": "夜の11時",
                    "leftRuby": "よるのじゅういちじ",
                    "right": "寝る",
                    "rightRuby": "ねる"
                },
                {
                    "j": "誕生日にケーキを食べる",
                    "r": "たんじょうびにけーきをたべる",
                    "zh": "生日吃蛋糕",
                    "left": "誕生日",
                    "leftRuby": "たんじょうび",
                    "right": "ケーキを食べる",
                    "rightRuby": "けーきをたべる"
                },
                {
                    "j": "週末に出かける",
                    "r": "しゅうまつにでかける",
                    "zh": "週末出門",
                    "left": "週末",
                    "leftRuby": "しゅうまつ",
                    "right": "出かける",
                    "rightRuby": "でかける"
                },
                {
                    "j": "休みの日に本を読む",
                    "r": "やすみのひにほんをよむ",
                    "zh": "假日看書",
                    "left": "休みの日",
                    "leftRuby": "やすみのひ",
                    "right": "本を読む",
                    "rightRuby": "ほんをよむ"
                },
                {
                    "j": "1時に昼ご飯を食べる",
                    "r": "いちじにひるごはんをたべる",
                    "zh": "1點吃午餐",
                    "left": "1時",
                    "leftRuby": "いちじ",
                    "right": "昼ご飯を食べる",
                    "rightRuby": "ひるごはんをたべる"
                },
                {
                    "j": "夕方に帰る",
                    "r": "ゆうがたにかえる",
                    "zh": "傍晚回家",
                    "left": "夕方",
                    "leftRuby": "ゆうがた",
                    "right": "帰る",
                    "rightRuby": "かえる"
                },
                {
                    "j": "午前中に掃除する",
                    "r": "ごぜんちゅうにそうじする",
                    "zh": "上午打掃",
                    "left": "午前中",
                    "leftRuby": "ごぜんちゅう",
                    "right": "掃除する",
                    "rightRuby": "そうじする"
                }
            ]
        },
        "GA_EXIST_SUBJECT": {
            "safeCombos": [
                {
                    "j": "猫がいる",
                    "r": "ねこがいる",
                    "zh": "有貓",
                    "left": "猫",
                    "leftRuby": "ねこ",
                    "right": "いる",
                    "rightRuby": "いる"
                },
                {
                    "j": "犬がいる",
                    "r": "いぬがいる",
                    "zh": "有狗",
                    "left": "犬",
                    "leftRuby": "いぬ",
                    "right": "いる",
                    "rightRuby": "いる"
                },
                {
                    "j": "本がある",
                    "r": "ほんがある",
                    "zh": "有書",
                    "left": "本",
                    "leftRuby": "ほん",
                    "right": "ある",
                    "rightRuby": "ある"
                },
                {
                    "j": "鍵がある",
                    "r": "かぎがある",
                    "zh": "有鑰匙",
                    "left": "鍵",
                    "leftRuby": "かぎ",
                    "right": "ある",
                    "rightRuby": "ある"
                },
                {
                    "j": "パンがある",
                    "r": "ぱんがある",
                    "zh": "有麵包",
                    "left": "パン",
                    "leftRuby": "ぱん",
                    "right": "ある",
                    "rightRuby": "ある"
                },
                {
                    "j": "水がある",
                    "r": "みずがある",
                    "zh": "有水",
                    "left": "水",
                    "leftRuby": "みず",
                    "right": "ある",
                    "rightRuby": "ある"
                },
                {
                    "j": "先生がいる",
                    "r": "せんせいがいる",
                    "zh": "有老師",
                    "left": "先生",
                    "leftRuby": "せんせい",
                    "right": "いる",
                    "rightRuby": "いる"
                },
                {
                    "j": "友達がいる",
                    "r": "ともだちがいる",
                    "zh": "有朋友",
                    "left": "友達",
                    "leftRuby": "ともだち",
                    "right": "いる",
                    "rightRuby": "いる"
                },
                {
                    "j": "車がある",
                    "r": "くるまがある",
                    "zh": "有車",
                    "left": "車",
                    "leftRuby": "くるま",
                    "right": "ある",
                    "rightRuby": "ある"
                },
                {
                    "j": "時間がある",
                    "r": "じかんがある",
                    "zh": "有時間",
                    "left": "時間",
                    "leftRuby": "じかん",
                    "right": "ある",
                    "rightRuby": "ある"
                },
                {
                    "j": "お金がある",
                    "r": "おかねがある",
                    "zh": "有錢",
                    "left": "お金",
                    "leftRuby": "おかね",
                    "right": "ある",
                    "rightRuby": "ある"
                },
                {
                    "j": "テストがある",
                    "r": "てすとがある",
                    "zh": "有考試",
                    "left": "テスト",
                    "leftRuby": "てすと",
                    "right": "ある",
                    "rightRuby": "ある"
                },
                {
                    "j": "約束がある",
                    "r": "やくそくがある",
                    "zh": "有約會",
                    "left": "約束",
                    "leftRuby": "やくそく",
                    "right": "ある",
                    "rightRuby": "ある"
                },
                {
                    "j": "問題がある",
                    "r": "もんだいがある",
                    "zh": "有問題",
                    "left": "問題",
                    "leftRuby": "もんだい",
                    "right": "ある",
                    "rightRuby": "ある"
                },
                {
                    "j": "椅子がある",
                    "r": "いすがある",
                    "zh": "有椅子",
                    "left": "椅子",
                    "leftRuby": "いす",
                    "right": "ある",
                    "rightRuby": "ある"
                },
                {
                    "j": "机がある",
                    "r": "つくえがある",
                    "zh": "有書桌",
                    "left": "机",
                    "leftRuby": "つくえ",
                    "right": "ある",
                    "rightRuby": "ある"
                },
                {
                    "j": "鳥がいる",
                    "r": "とりがいる",
                    "zh": "有鳥",
                    "left": "鳥",
                    "leftRuby": "とり",
                    "right": "いる",
                    "rightRuby": "いる"
                },
                {
                    "j": "家族がいる",
                    "r": "かぞくがいる",
                    "zh": "有家人",
                    "left": "家族",
                    "leftRuby": "かぞく",
                    "right": "いる",
                    "rightRuby": "いる"
                },
                {
                    "j": "人がいる",
                    "r": "ひとがいる",
                    "zh": "有人",
                    "left": "人",
                    "leftRuby": "ひと",
                    "right": "いる",
                    "rightRuby": "いる"
                },
                {
                    "j": "店がある",
                    "r": "みせがある",
                    "zh": "有商店",
                    "left": "店",
                    "leftRuby": "みせ",
                    "right": "ある",
                    "rightRuby": "ある"
                }
            ]
        },
        "KARA_SOURCE_START": {
            "safeCombos": [
                {
                    "j": "家から出発する",
                    "r": "いえからしゅっぱつする",
                    "zh": "從家出發",
                    "left": "家",
                    "leftRuby": "いえ",
                    "right": "出発する",
                    "rightRuby": "しゅっぱつする"
                },
                {
                    "j": "9時から始まる",
                    "r": "くじからはじまる",
                    "zh": "從九點開始",
                    "left": "9時",
                    "leftRuby": "くじ",
                    "right": "始まる",
                    "rightRuby": "はじまる"
                },
                {
                    "j": "朝から働く",
                    "r": "あさからはたらく",
                    "zh": "從早上開始工作",
                    "left": "朝",
                    "leftRuby": "あさ",
                    "right": "働く",
                    "rightRuby": "はたらく"
                },
                {
                    "j": "月曜日から勉強する",
                    "r": "げつようびからべんきょうする",
                    "zh": "從星期一開始讀書",
                    "left": "月曜日",
                    "leftRuby": "げつようび",
                    "right": "勉強する",
                    "rightRuby": "べんきょうする"
                },
                {
                    "j": "今日から休む",
                    "r": "きょうからやすむ",
                    "zh": "從今天起休息",
                    "left": "今日",
                    "leftRuby": "きょう",
                    "right": "休む",
                    "rightRuby": "やすむ"
                },
                {
                    "j": "家から学校へ行く",
                    "r": "いえからがっこうへいく",
                    "zh": "從家去學校",
                    "left": "家",
                    "leftRuby": "いえ",
                    "right": "学校へ行く",
                    "rightRuby": "がっこうへいく"
                },
                {
                    "j": "台湾から来る",
                    "r": "たいわんからくる",
                    "zh": "從台灣來",
                    "left": "台湾",
                    "leftRuby": "たいわん",
                    "right": "来る",
                    "rightRuby": "くる"
                },
                {
                    "j": "駅から歩く",
                    "r": "えきからあるく",
                    "zh": "從車站走",
                    "left": "駅",
                    "leftRuby": "えき",
                    "right": "歩く",
                    "rightRuby": "あるく"
                },
                {
                    "j": "教室から出る",
                    "r": "きょうしつからでる",
                    "zh": "從教室出來",
                    "left": "教室",
                    "leftRuby": "きょうしつ",
                    "right": "出る",
                    "rightRuby": "でる"
                },
                {
                    "j": "来週から始まる",
                    "r": "らいしゅうからはじまる",
                    "zh": "從下週開始",
                    "left": "来週",
                    "leftRuby": "らいしゅう",
                    "right": "始まる",
                    "rightRuby": "はじまる"
                },
                {
                    "j": "明日から旅行する",
                    "r": "あしたからりょこうする",
                    "zh": "從明天開始旅行",
                    "left": "明日",
                    "leftRuby": "あした",
                    "right": "旅行する",
                    "rightRuby": "りょこうする"
                },
                {
                    "j": "先生から借りる",
                    "r": "せんせいからかりる",
                    "zh": "向老師借",
                    "left": "先生",
                    "leftRuby": "せんせい",
                    "right": "借りる",
                    "rightRuby": "かりる"
                },
                {
                    "j": "友達から手紙をもらう",
                    "r": "ともだちからてがみをもらう",
                    "zh": "收到朋友的信",
                    "left": "友達",
                    "leftRuby": "ともだち",
                    "right": "手紙をもらう",
                    "rightRuby": "てがみをもらう"
                },
                {
                    "j": "会社から帰る",
                    "r": "かいしゃからかえる",
                    "zh": "從公司下班回家",
                    "left": "会社",
                    "leftRuby": "かいしゃ",
                    "right": "帰る",
                    "rightRuby": "かえる"
                },
                {
                    "j": "1時から授業がある",
                    "r": "いちじからじゅぎょうがある",
                    "zh": "1點開始有課",
                    "left": "1時",
                    "leftRuby": "いちじ",
                    "right": "授業がある",
                    "rightRuby": "じゅぎょうがある"
                },
                {
                    "j": "ここから近い",
                    "r": "ここからちかい",
                    "zh": "離這裡近",
                    "left": "ここ",
                    "leftRuby": "ここ",
                    "right": "近い",
                    "rightRuby": "ちかい"
                },
                {
                    "j": "あそこから遠い",
                    "r": "あそこからとおい",
                    "zh": "離那裡遠",
                    "left": "あそこ",
                    "leftRuby": "あそこ",
                    "right": "遠い",
                    "rightRuby": "とおい"
                },
                {
                    "j": "空港からバスに乗る",
                    "r": "くうこうからばすにのる",
                    "zh": "從機場搭公車",
                    "left": "空港",
                    "leftRuby": "くうこう",
                    "right": "バスに乗る",
                    "rightRuby": "ばすにのる"
                },
                {
                    "j": "1ページから読む",
                    "r": "いちぺーじからよむ",
                    "zh": "從第一頁開始讀",
                    "left": "1ページ",
                    "leftRuby": "いちぺーじ",
                    "right": "読む",
                    "rightRuby": "よむ"
                },
                {
                    "j": "窓から見る",
                    "r": "まどからみる",
                    "zh": "從窗戶看",
                    "left": "窓",
                    "leftRuby": "まど",
                    "right": "見る",
                    "rightRuby": "みる"
                }
            ]
        },
        "MADE_LIMIT_END": {
            "safeCombos": [
                {
                    "j": "3時まで待つ",
                    "r": "さんじまでまつ",
                    "zh": "等到3點",
                    "left": "3時",
                    "leftRuby": "さんじ",
                    "right": "待つ",
                    "rightRuby": "まつ"
                },
                {
                    "j": "夜まで勉強する",
                    "r": "よるまでべんきょうする",
                    "zh": "讀到晚上",
                    "left": "夜",
                    "leftRuby": "よる",
                    "right": "勉強する",
                    "rightRuby": "べんきょうする"
                },
                {
                    "j": "金曜日まで休む",
                    "r": "きんようびまでやすむ",
                    "zh": "休息到週五",
                    "left": "金曜日",
                    "leftRuby": "きんようび",
                    "right": "休む",
                    "rightRuby": "やすむ"
                },
                {
                    "j": "駅まで歩く",
                    "r": "えきまであるく",
                    "zh": "走到車站",
                    "left": "駅",
                    "leftRuby": "えき",
                    "right": "歩く",
                    "rightRuby": "あるく"
                },
                {
                    "j": "家まで帰る",
                    "r": "いえまでかえる",
                    "zh": "回到家",
                    "left": "家",
                    "leftRuby": "いえ",
                    "right": "帰る",
                    "rightRuby": "かえる"
                },
                {
                    "j": "山の上まで登る",
                    "r": "やまのうえまでのぼる",
                    "zh": "爬到山頂",
                    "left": "山の上",
                    "leftRuby": "やまのうえ",
                    "right": "登る",
                    "rightRuby": "のぼる"
                },
                {
                    "j": "明日まで忙しい",
                    "r": "あしたまでいそがしい",
                    "zh": "忙到明天",
                    "left": "明日",
                    "leftRuby": "あした",
                    "right": "忙しい",
                    "rightRuby": "いそがしい"
                },
                {
                    "j": "来週までかかる",
                    "r": "らいしゅうまでかかる",
                    "zh": "要花到下週",
                    "left": "来週",
                    "leftRuby": "らいしゅう",
                    "right": "かかる",
                    "rightRuby": "かかる"
                },
                {
                    "j": "12時まで働く",
                    "r": "じゅうにじまではたらく",
                    "zh": "工作到12點",
                    "left": "12時",
                    "leftRuby": "じゅうにじ",
                    "right": "働く",
                    "rightRuby": "はたらく"
                },
                {
                    "j": "午後まで寝る",
                    "r": "ごごまでねる",
                    "zh": "睡到下午",
                    "left": "午後",
                    "leftRuby": "ごご",
                    "right": "寝る",
                    "rightRuby": "ねる"
                },
                {
                    "j": "公園まで走る",
                    "r": "こうえくまではしる",
                    "zh": "跑到公園",
                    "left": "公園",
                    "leftRuby": "こうえん",
                    "right": "走る",
                    "rightRuby": "はしる"
                },
                {
                    "j": "海まで行く",
                    "r": "うみまでいく",
                    "zh": "去到海邊",
                    "left": "海",
                    "leftRuby": "うみ",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "今日までです",
                    "r": "きょうまでです",
                    "zh": "到今天為止",
                    "left": "今日",
                    "leftRuby": "きょう",
                    "right": "です",
                    "rightRuby": "です"
                },
                {
                    "j": "東京まで新幹線で行く",
                    "r": "とうきょうまでしんかんせんでいく",
                    "zh": "搭新幹線到東京",
                    "left": "東京",
                    "leftRuby": "とうきょう",
                    "right": "新幹線で行く",
                    "rightRuby": "しんかんせんでいく"
                },
                {
                    "j": "100ページまで読む",
                    "r": "ひゃくぺーじまでよむ",
                    "zh": "讀到第100頁",
                    "left": "100ページ",
                    "leftRuby": "ひゃくぺーじ",
                    "right": "読む",
                    "rightRuby": "よむ"
                },
                {
                    "j": "朝まで起きている",
                    "r": "あさまでおきている",
                    "zh": "醒到早上",
                    "left": "朝",
                    "leftRuby": "あさ",
                    "right": "起きている",
                    "rightRuby": "おきている"
                },
                {
                    "j": "大学まで通う",
                    "r": "だいがくまでかよう",
                    "zh": "通勤到大學",
                    "left": "大学",
                    "leftRuby": "だいがく",
                    "right": "通う",
                    "rightRuby": "かよう"
                },
                {
                    "j": "お店まで案内する",
                    "r": "おみせまであんないする",
                    "zh": "帶路到店裡",
                    "left": "お店",
                    "leftRuby": "おみせ",
                    "right": "案内する",
                    "rightRuby": "あんないする"
                },
                {
                    "j": "駅まで送る",
                    "r": "えきまでおくる",
                    "zh": "送到車站",
                    "left": "駅",
                    "leftRuby": "えき",
                    "right": "送る",
                    "rightRuby": "おくる"
                },
                {
                    "j": "空まで届く",
                    "r": "そらまでとどく",
                    "zh": "夠到天空",
                    "left": "空",
                    "leftRuby": "そら",
                    "right": "届く",
                    "rightRuby": "とどく"
                }
            ]
        },
        "KARA_FROM": {
            "safeCombos": [
                {
                    "j": "家から出発する",
                    "r": "いえからしゅっぱつする",
                    "zh": "從家出發",
                    "left": "家",
                    "leftRuby": "いえ",
                    "right": "出発する",
                    "rightRuby": "しゅっぱつする"
                },
                {
                    "j": "9時から始まる",
                    "r": "くじからはじまる",
                    "zh": "從九點開始",
                    "left": "9時",
                    "leftRuby": "くじ",
                    "right": "始まる",
                    "rightRuby": "はじまる"
                },
                {
                    "j": "朝から働く",
                    "r": "あさからはたらく",
                    "zh": "從早上開始工作",
                    "left": "朝",
                    "leftRuby": "あさ",
                    "right": "働く",
                    "rightRuby": "はたらく"
                },
                {
                    "j": "月曜日から勉強する",
                    "r": "げつようびからべんきょうする",
                    "zh": "從星期一開始讀書",
                    "left": "月曜日",
                    "leftRuby": "げつようび",
                    "right": "勉強する",
                    "rightRuby": "べんきょうする"
                },
                {
                    "j": "今日から休む",
                    "r": "きょうからやすむ",
                    "zh": "從今天起休息",
                    "left": "今日",
                    "leftRuby": "きょう",
                    "right": "休む",
                    "rightRuby": "やすむ"
                },
                {
                    "j": "家から学校へ行く",
                    "r": "いえからがっこうへいく",
                    "zh": "從家去學校",
                    "left": "家",
                    "leftRuby": "いえ",
                    "right": "学校へ行く",
                    "rightRuby": "がっこうへいく"
                },
                {
                    "j": "台湾から来る",
                    "r": "たいわんからくる",
                    "zh": "從台灣來",
                    "left": "台湾",
                    "leftRuby": "たいわん",
                    "right": "来る",
                    "rightRuby": "くる"
                },
                {
                    "j": "駅から歩く",
                    "r": "えきからあるく",
                    "zh": "從車站走",
                    "left": "駅",
                    "leftRuby": "えき",
                    "right": "歩く",
                    "rightRuby": "あるく"
                },
                {
                    "j": "教室から出る",
                    "r": "きょうしつからでる",
                    "zh": "從教室出來",
                    "left": "教室",
                    "leftRuby": "きょうしつ",
                    "right": "出る",
                    "rightRuby": "でる"
                },
                {
                    "j": "来週から始まる",
                    "r": "らいしゅうからはじまる",
                    "zh": "從下週開始",
                    "left": "来週",
                    "leftRuby": "らいしゅう",
                    "right": "始まる",
                    "rightRuby": "はじまる"
                },
                {
                    "j": "明日から旅行する",
                    "r": "あしたからりょこうする",
                    "zh": "從明天開始旅行",
                    "left": "明日",
                    "leftRuby": "あした",
                    "right": "旅行する",
                    "rightRuby": "りょこうする"
                },
                {
                    "j": "先生から借りる",
                    "r": "せんせいからかりる",
                    "zh": "向老師借",
                    "left": "先生",
                    "leftRuby": "せんせい",
                    "right": "借りる",
                    "rightRuby": "かりる"
                },
                {
                    "j": "友達から手紙をもらう",
                    "r": "ともだちからてがみをもらう",
                    "zh": "收到朋友的信",
                    "left": "友達",
                    "leftRuby": "ともだち",
                    "right": "手紙をもらう",
                    "rightRuby": "てがみをもらう"
                },
                {
                    "j": "会社から帰る",
                    "r": "かいしゃからかえる",
                    "zh": "從公司下班回家",
                    "left": "会社",
                    "leftRuby": "かいしゃ",
                    "right": "帰る",
                    "rightRuby": "かえる"
                },
                {
                    "j": "1時から授業がある",
                    "r": "いちじからじゅぎょうがある",
                    "zh": "1點開始有課",
                    "left": "1時",
                    "leftRuby": "いちじ",
                    "right": "授業がある",
                    "rightRuby": "じゅぎょうがある"
                },
                {
                    "j": "ここから近い",
                    "r": "ここからちかい",
                    "zh": "離這裡近",
                    "left": "ここ",
                    "leftRuby": "ここ",
                    "right": "近い",
                    "rightRuby": "ちかい"
                },
                {
                    "j": "あそこから遠い",
                    "r": "あそこからとおい",
                    "zh": "離那裡遠",
                    "left": "あそこ",
                    "leftRuby": "あそこ",
                    "right": "遠い",
                    "rightRuby": "とおい"
                },
                {
                    "j": "空港からバスに乗る",
                    "r": "くうこうからばすにのる",
                    "zh": "從機場搭公車",
                    "left": "空港",
                    "leftRuby": "くうこう",
                    "right": "バスに乗る",
                    "rightRuby": "ばすにのる"
                },
                {
                    "j": "1ページから読む",
                    "r": "いちぺーじからよむ",
                    "zh": "從第一頁開始讀",
                    "left": "1ページ",
                    "leftRuby": "いちぺーじ",
                    "right": "読む",
                    "rightRuby": "よむ"
                },
                {
                    "j": "窓から見る",
                    "r": "まどからみる",
                    "zh": "從窗戶看",
                    "left": "窓",
                    "leftRuby": "まど",
                    "right": "見る",
                    "rightRuby": "みる"
                }
            ]
        },
        "TO_COMPANION": {
            "safeCombos": [
                {
                    "j": "友達と遊ぶ",
                    "r": "ともだちとあそぶ",
                    "zh": "和朋友玩",
                    "left": "友達",
                    "leftRuby": "ともだち",
                    "right": "遊ぶ",
                    "rightRuby": "あそぶ"
                },
                {
                    "j": "家族と食べる",
                    "r": "かぞくとたべる",
                    "zh": "和家人吃飯",
                    "left": "家族",
                    "leftRuby": "かぞく",
                    "right": "食べる",
                    "rightRuby": "たべる"
                },
                {
                    "j": "先生と話す",
                    "r": "せんせいとはなす",
                    "zh": "和老師說話",
                    "left": "先生",
                    "leftRuby": "せんせい",
                    "right": "話す",
                    "rightRuby": "はなす"
                },
                {
                    "j": "母と買い物する",
                    "r": "ははとかいものする",
                    "zh": "和媽媽購物",
                    "left": "母",
                    "leftRuby": "はは",
                    "right": "買い物する",
                    "rightRuby": "かいものする"
                },
                {
                    "j": "兄と映画を見る",
                    "r": "あにとえいがをみる",
                    "zh": "和哥哥看電影",
                    "left": "兄",
                    "leftRuby": "あに",
                    "right": "映画を見る",
                    "rightRuby": "えいがをみる"
                },
                {
                    "j": "友達とゲームをする",
                    "r": "ともだちとげーむをする",
                    "zh": "和朋友玩遊戲",
                    "left": "友達",
                    "leftRuby": "ともだち",
                    "right": "ゲームをする",
                    "rightRuby": "げーむをする"
                },
                {
                    "j": "父と出かける",
                    "r": "ちちとでかける",
                    "zh": "和爸爸出門",
                    "left": "父",
                    "leftRuby": "ちち",
                    "right": "出かける",
                    "rightRuby": "でかける"
                },
                {
                    "j": "姉と散歩する",
                    "r": "あねとさんぽする",
                    "zh": "和姐姐散步",
                    "left": "姉",
                    "leftRuby": "あね",
                    "right": "散歩する",
                    "rightRuby": "さんぽする"
                },
                {
                    "j": "友達と勉強する",
                    "r": "ともだちとべんきょうする",
                    "zh": "和朋友讀書",
                    "left": "友達",
                    "leftRuby": "ともだち",
                    "right": "勉強する",
                    "rightRuby": "べんきょうする"
                },
                {
                    "j": "家族と旅行する",
                    "r": "かぞくとりょこうする",
                    "zh": "和家人旅行",
                    "left": "家族",
                    "leftRuby": "かぞく",
                    "right": "旅行する",
                    "rightRuby": "りょこうする"
                },
                {
                    "j": "田中さんと話す",
                    "r": "たなかさんとはなす",
                    "zh": "和田中先生說話",
                    "left": "田中さん",
                    "leftRuby": "たなかさん",
                    "right": "話す",
                    "rightRuby": "はなす"
                },
                {
                    "j": "妹と歩く",
                    "r": "いもうととあるく",
                    "zh": "和妹妹散步",
                    "left": "妹",
                    "leftRuby": "いもうと",
                    "right": "歩く",
                    "rightRuby": "あるく"
                },
                {
                    "j": "彼と会う",
                    "r": "かれとあう",
                    "zh": "和他見面(需用に，這裡改行く)",
                    "left": "彼",
                    "leftRuby": "かれ",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "彼女と来る",
                    "r": "かのじょとくる",
                    "zh": "和女朋友來",
                    "left": "彼女",
                    "leftRuby": "かのじょ",
                    "right": "来る",
                    "rightRuby": "くる"
                },
                {
                    "j": "みんなと食べる",
                    "r": "みんなとたべる",
                    "zh": "和大家一起吃飯",
                    "left": "みんな",
                    "leftRuby": "みんな",
                    "right": "食べる",
                    "rightRuby": "たべる"
                },
                {
                    "j": "弟と走る",
                    "r": "おとうととはしる",
                    "zh": "和弟弟跑步",
                    "left": "弟",
                    "leftRuby": "おとうと",
                    "right": "走る",
                    "rightRuby": "はしる"
                },
                {
                    "j": "先輩と飲む",
                    "r": "せんぱいとのむ",
                    "zh": "和前輩喝酒",
                    "left": "先輩",
                    "leftRuby": "せんぱい",
                    "right": "飲む",
                    "rightRuby": "のむ"
                },
                {
                    "j": "後輩と帰る",
                    "r": "こうはいとかえる",
                    "zh": "和晚輩回家",
                    "left": "後輩",
                    "leftRuby": "こうはい",
                    "right": "帰る",
                    "rightRuby": "かえる"
                },
                {
                    "j": "犬と散歩する",
                    "r": "いぬとさんぽする",
                    "zh": "和狗散步",
                    "left": "犬",
                    "leftRuby": "いぬ",
                    "right": "散歩する",
                    "rightRuby": "さんぽする"
                },
                {
                    "j": "子供と遊ぶ",
                    "r": "こどもとあそぶ",
                    "zh": "和小孩玩",
                    "left": "子供",
                    "leftRuby": "こども",
                    "right": "遊ぶ",
                    "rightRuby": "あそぶ"
                }
            ]
        },
        "DE_TOOL_MEANS": {
            "safeCombos": [
                {
                    "j": "箸で食べる",
                    "r": "はしでたべる",
                    "zh": "用筷子吃",
                    "left": "箸",
                    "leftRuby": "はし",
                    "right": "食べる",
                    "rightRuby": "たべる"
                },
                {
                    "j": "スプーンで食べる",
                    "r": "すぷーんでたべる",
                    "zh": "用湯匙吃",
                    "left": "スプーン",
                    "leftRuby": "すぷーん",
                    "right": "食べる",
                    "rightRuby": "たべる"
                },
                {
                    "j": "ペンで書く",
                    "r": "ぺんでかく",
                    "zh": "用筆寫",
                    "left": "ペン",
                    "leftRuby": "ぺん",
                    "right": "書く",
                    "rightRuby": "かく"
                },
                {
                    "j": "ナイフで切る",
                    "r": "ないふできる",
                    "zh": "用刀切",
                    "left": "ナイフ",
                    "leftRuby": "ないふ",
                    "right": "切る",
                    "rightRuby": "きる"
                },
                {
                    "j": "パソコンで仕事する",
                    "r": "ぱそこんでしごとする",
                    "zh": "用電腦工作",
                    "left": "パソコン",
                    "leftRuby": "ぱそこん",
                    "right": "仕事する",
                    "rightRuby": "しごとする"
                },
                {
                    "j": "日本語で話す",
                    "r": "にほんごではなす",
                    "zh": "用日語說話",
                    "left": "日本語",
                    "leftRuby": "にほんご",
                    "right": "話す",
                    "rightRuby": "はなす"
                },
                {
                    "j": "英語で説明する",
                    "r": "えいごでせつめいする",
                    "zh": "用英語說明",
                    "left": "英語",
                    "leftRuby": "えいご",
                    "right": "説明する",
                    "rightRuby": "せつめいする"
                },
                {
                    "j": "中国語で書く",
                    "r": "ちゅうごくごでかく",
                    "zh": "用中文寫",
                    "left": "中国語",
                    "leftRuby": "ちゅうごくご",
                    "right": "書く",
                    "rightRuby": "かく"
                },
                {
                    "j": "バスで行く",
                    "r": "ばすでいく",
                    "zh": "搭巴士去",
                    "left": "バス",
                    "leftRuby": "ばす",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "電車で帰る",
                    "r": "でんしゃでかえる",
                    "zh": "搭電車回",
                    "left": "電車",
                    "leftRuby": "でんしゃ",
                    "right": "帰る",
                    "rightRuby": "かえる"
                },
                {
                    "j": "自転車で来る",
                    "r": "じてんしゃでくる",
                    "zh": "騎自行車來",
                    "left": "自転車",
                    "leftRuby": "じてんしゃ",
                    "right": "来る",
                    "rightRuby": "くる"
                },
                {
                    "j": "車で行く",
                    "r": "くるまでいく",
                    "zh": "開車去",
                    "left": "車",
                    "leftRuby": "くるま",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "タクシーで来る",
                    "r": "たくしーでくる",
                    "zh": "搭計程車來",
                    "left": "タクシー",
                    "leftRuby": "たくしー",
                    "right": "来る",
                    "rightRuby": "くる"
                },
                {
                    "j": "飛行機で帰る",
                    "r": "ひこうきでかえる",
                    "zh": "搭飛機回",
                    "left": "飛行機",
                    "leftRuby": "ひこうき",
                    "right": "帰る",
                    "rightRuby": "かえる"
                },
                {
                    "j": "スマホで調べる",
                    "r": "すまほでしらべる",
                    "zh": "用手機查",
                    "left": "スマホ",
                    "leftRuby": "すまほ",
                    "right": "調べる",
                    "rightRuby": "しらべる"
                },
                {
                    "j": "メールで送る",
                    "r": "めーるでおくる",
                    "zh": "用郵件寄給",
                    "left": "メール",
                    "leftRuby": "めーる",
                    "right": "送る",
                    "rightRuby": "おくる"
                },
                {
                    "j": "手で食べる",
                    "r": "てでたべる",
                    "zh": "用手吃",
                    "left": "手",
                    "leftRuby": "て",
                    "right": "食べる",
                    "rightRuby": "たべる"
                },
                {
                    "j": "カメラで撮る",
                    "r": "かめらでとる",
                    "zh": "用相機拍",
                    "left": "カメラ",
                    "leftRuby": "かめら",
                    "right": "撮る",
                    "rightRuby": "とる"
                },
                {
                    "j": "ハサミで切る",
                    "r": "はさみできる",
                    "zh": "用剪刀剪",
                    "left": "ハサミ",
                    "leftRuby": "はさみ",
                    "right": "切る",
                    "rightRuby": "きる"
                },
                {
                    "j": "カードで払う",
                    "r": "かーどではらう",
                    "zh": "用卡付款",
                    "left": "カード",
                    "leftRuby": "かーど",
                    "right": "払う",
                    "rightRuby": "はらう"
                }
            ]
        },
        "TO_AND": {
            "safeCombos": [
                {
                    "j": "りんごとみかんを買う",
                    "r": "りんごとみかんをかう",
                    "zh": "買蘋果和橘子",
                    "left": "りんご",
                    "leftRuby": "りんご",
                    "right": "みかんを買う",
                    "rightRuby": "みかんをかう"
                },
                {
                    "j": "父と母は家にいる",
                    "r": "ちちとはははいえにいる",
                    "zh": "爸爸和媽媽在家",
                    "left": "父",
                    "leftRuby": "ちち",
                    "right": "母は家にいる",
                    "rightRuby": "はははいえにいる"
                },
                {
                    "j": "犬と猫がいる",
                    "r": "いぬとねこがいる",
                    "zh": "有狗和貓",
                    "left": "犬",
                    "leftRuby": "いぬ",
                    "right": "猫がいる",
                    "rightRuby": "ねこがいる"
                },
                {
                    "j": "本とノートを持つ",
                    "r": "ほんとのーとをもつ",
                    "zh": "拿書和筆記本",
                    "left": "本",
                    "leftRuby": "ほん",
                    "right": "ノートを持つ",
                    "rightRuby": "のーとをもつ"
                },
                {
                    "j": "先生と学生が話す",
                    "r": "せんせいとがくせいがはなす",
                    "zh": "老師和學生說話",
                    "left": "先生",
                    "leftRuby": "せんせい",
                    "right": "学生が話す",
                    "rightRuby": "がくせいがはなす"
                },
                {
                    "j": "兄と姉は学校へ行く",
                    "r": "あにとあねはがっこうへいく",
                    "zh": "哥哥和姐姐去學校",
                    "left": "兄",
                    "leftRuby": "あに",
                    "right": "姉は学校へ行く",
                    "rightRuby": "あねはがっこうへいく"
                },
                {
                    "j": "肉と魚を食べる",
                    "r": "にくとさかなをたべる",
                    "zh": "吃肉和魚",
                    "left": "肉",
                    "leftRuby": "にく",
                    "right": "魚を食べる",
                    "rightRuby": "さかなをたべる"
                },
                {
                    "j": "シャツとズボンを洗う",
                    "r": "しゃつとずぼんをあらう",
                    "zh": "洗襯衫和褲子",
                    "left": "シャツ",
                    "leftRuby": "しゃつ",
                    "right": "ズボンを洗う",
                    "rightRuby": "ずぼんをあらう"
                },
                {
                    "j": "日本語と英語を勉強する",
                    "r": "にほんごとえいごをべんきょうする",
                    "zh": "學日文和英文",
                    "left": "日本語",
                    "leftRuby": "にほんご",
                    "right": "英語を勉強する",
                    "rightRuby": "えいごをべんきょうする"
                },
                {
                    "j": "机といすがある",
                    "r": "つくえといすがある",
                    "zh": "有桌子和椅子",
                    "left": "机",
                    "leftRuby": "つくえ",
                    "right": "いすがある",
                    "rightRuby": "いすがある"
                },
                {
                    "j": "水とお茶を飲む",
                    "r": "みずとおちゃをのむ",
                    "zh": "喝水和茶",
                    "left": "水",
                    "leftRuby": "みず",
                    "right": "お茶を飲む",
                    "rightRuby": "おちゃをのむ"
                },
                {
                    "j": "友だちと先生に会う",
                    "r": "ともだちとせんせいにあう",
                    "zh": "見朋友和老師",
                    "left": "友だち",
                    "leftRuby": "ともだち",
                    "right": "先生に会う",
                    "rightRuby": "せんせいにあう"
                },
                {
                    "j": "かばんとさいふを持って行く",
                    "r": "かばんとさいふをもっていく",
                    "zh": "帶包包和錢包去",
                    "left": "かばん",
                    "leftRuby": "かばん",
                    "right": "さいふを持って行く",
                    "rightRuby": "さいふをもっていく"
                },
                {
                    "j": "山と川を見る",
                    "r": "やまとかわをみる",
                    "zh": "看山和河",
                    "left": "山",
                    "leftRuby": "やま",
                    "right": "川を見る",
                    "rightRuby": "かわをみる"
                },
                {
                    "j": "パンと牛乳を買う",
                    "r": "ぱんとぎゅうにゅうをかう",
                    "zh": "買麵包和牛奶",
                    "left": "パン",
                    "leftRuby": "ぱん",
                    "right": "牛乳を買う",
                    "rightRuby": "ぎゅうにゅうをかう"
                },
                {
                    "j": "春と夏が好きだ",
                    "r": "はるとなつがすきだ",
                    "zh": "喜歡春天和夏天",
                    "left": "春",
                    "leftRuby": "はる",
                    "right": "夏が好きだ",
                    "rightRuby": "なつがすきだ"
                },
                {
                    "j": "駅と学校は近い",
                    "r": "えきとがっこうはちかい",
                    "zh": "車站和學校很近",
                    "left": "駅",
                    "leftRuby": "えき",
                    "right": "学校は近い",
                    "rightRuby": "がっこうはちかい"
                },
                {
                    "j": "赤と青の花がある",
                    "r": "あかとあおのはながある",
                    "zh": "有紅色和藍色的花",
                    "left": "赤",
                    "leftRuby": "あか",
                    "right": "青の花がある",
                    "rightRuby": "あおのはながある"
                },
                {
                    "j": "朝ご飯と昼ご飯を作る",
                    "r": "あさごはんとひるごはんをつくる",
                    "zh": "做早餐和午餐",
                    "left": "朝ご飯",
                    "leftRuby": "あさごはん",
                    "right": "昼ご飯を作る",
                    "rightRuby": "ひるごはんをつくる"
                },
                {
                    "j": "雨と風が強い",
                    "r": "あめとかぜがつよい",
                    "zh": "雨和風都很強",
                    "left": "雨",
                    "leftRuby": "あめ",
                    "right": "風が強い",
                    "rightRuby": "かぜがつよい"
                }
            ]
        },
        "YA_AND_OTHERS": {
            "safeCombos": [
                {
                    "j": "パンや牛乳を買う",
                    "r": "ぱんやぎゅうにゅうをかう",
                    "zh": "買麵包和牛奶等",
                    "left": "パン",
                    "leftRuby": "ぱん",
                    "right": "牛乳を買う",
                    "rightRuby": "ぎゅうにゅうをかう"
                },
                {
                    "j": "本やノートを買う",
                    "r": "ほんやのーとをかう",
                    "zh": "買書和筆記本等",
                    "left": "本",
                    "leftRuby": "ほん",
                    "right": "ノートを買う",
                    "rightRuby": "のーとをかう"
                },
                {
                    "j": "犬や猫が好きだ",
                    "r": "いぬやねこがすきだ",
                    "zh": "喜歡貓狗等",
                    "left": "犬",
                    "leftRuby": "いぬ",
                    "right": "猫が好きだ",
                    "rightRuby": "ねこがすきだ"
                },
                {
                    "j": "りんごやバナナを食べる",
                    "r": "りんごやばななをたべる",
                    "zh": "吃蘋果和香蕉等",
                    "left": "りんご",
                    "leftRuby": "りんご",
                    "right": "バナナを食べる",
                    "rightRuby": "ばななをたべる"
                },
                {
                    "j": "机や椅子がある",
                    "r": "つくえやいすがある",
                    "zh": "有桌椅等",
                    "left": "机",
                    "leftRuby": "つくえ",
                    "right": "椅子がある",
                    "rightRuby": "いすがある"
                },
                {
                    "j": "映画やアニメを見る",
                    "r": "えいがやあにめをみる",
                    "zh": "看電影和動畫等",
                    "left": "映画",
                    "leftRuby": "えいが",
                    "right": "アニメを見る",
                    "rightRuby": "あにめをみる"
                },
                {
                    "j": "英語や日本語を話す",
                    "r": "えいごやにほんごをはなす",
                    "zh": "說英日文等",
                    "left": "英語",
                    "leftRuby": "えいご",
                    "right": "日本語を話す",
                    "rightRuby": "にほんごをはなす"
                },
                {
                    "j": "肉や魚を食べる",
                    "r": "にくやさかなをたべる",
                    "zh": "吃肉和魚等",
                    "left": "肉",
                    "leftRuby": "にく",
                    "right": "魚を食べる",
                    "rightRuby": "さかなをたべる"
                },
                {
                    "j": "シャツやズボンを買う",
                    "r": "しゃつやずぼんをかう",
                    "zh": "買衣服褲子等",
                    "left": "シャツ",
                    "leftRuby": "しゃつ",
                    "right": "ズボンを買う",
                    "rightRuby": "ずぼんをかう"
                },
                {
                    "j": "パソコンやスマホを使う",
                    "r": "ぱそこんやすまほをつかう",
                    "zh": "用電腦手機等",
                    "left": "パソコン",
                    "leftRuby": "ぱそこん",
                    "right": "スマホを使う",
                    "rightRuby": "すまほをつかう"
                },
                {
                    "j": "紅茶やコーヒーを飲む",
                    "r": "こうちゃやこーひーをのむ",
                    "zh": "喝紅茶咖啡等",
                    "left": "紅茶",
                    "leftRuby": "こうちゃ",
                    "right": "コーヒーを飲む",
                    "rightRuby": "こーひーをのむ"
                },
                {
                    "j": "ケーキやクッキーを作る",
                    "r": "けーきやくっきーをつくる",
                    "zh": "做蛋糕餅乾等",
                    "left": "ケーキ",
                    "leftRuby": "けーき",
                    "right": "クッキーを作る",
                    "rightRuby": "くっきーをつくる"
                },
                {
                    "j": "雑誌や新聞を読む",
                    "r": "ざっしやしんぶんをよむ",
                    "zh": "看雜誌報紙等",
                    "left": "雑誌",
                    "leftRuby": "ざっし",
                    "right": "新聞を読む",
                    "rightRuby": "しんぶんをよむ"
                },
                {
                    "j": "春や秋が好きだ",
                    "r": "はるやあきがすきだ",
                    "zh": "喜歡春秋等",
                    "left": "春",
                    "leftRuby": "はる",
                    "right": "秋が好きだ",
                    "rightRuby": "あきがすきだ"
                },
                {
                    "j": "ペンや消しゴムがある",
                    "r": "ぺんやけしごむがある",
                    "zh": "有筆和橡皮擦等",
                    "left": "ペン",
                    "leftRuby": "ぺん",
                    "right": "消しゴムがある",
                    "rightRuby": "けしごむがある"
                },
                {
                    "j": "バスや電車で行く",
                    "r": "ばすやでんしゃでいく",
                    "zh": "搭公車電車等",
                    "left": "バス",
                    "leftRuby": "ばす",
                    "right": "電車で行く",
                    "rightRuby": "でんしゃでいく"
                },
                {
                    "j": "兄や姉がいる",
                    "r": "あにやあねがいる",
                    "zh": "有哥哥姐姐等",
                    "left": "兄",
                    "leftRuby": "あに",
                    "right": "姉がいる",
                    "rightRuby": "あねがいる"
                },
                {
                    "j": "ビールやワインを飲む",
                    "r": "びーるやわいんをのむ",
                    "zh": "喝啤酒紅酒等",
                    "left": "ビール",
                    "leftRuby": "びーる",
                    "right": "ワインを飲む",
                    "rightRuby": "わいんをのむ"
                },
                {
                    "j": "野球やサッカーをする",
                    "r": "やきゅうやさっかーをする",
                    "zh": "打棒球足球等",
                    "left": "野球",
                    "leftRuby": "やきゅう",
                    "right": "サッカーをする",
                    "rightRuby": "さっかーをする"
                },
                {
                    "j": "京都や大阪へ行く",
                    "r": "きょうとやおおさかへいく",
                    "zh": "去京都大阪等",
                    "left": "京都",
                    "leftRuby": "きょうと",
                    "right": "大阪へ行く",
                    "rightRuby": "おおさかへいく"
                }
            ]
        },
        "DE_SCOPE": {
            "safeCombos": [
                {
                    "j": "クラスで一番背が高い人",
                    "r": "くらすでいちばんせがたかいひと",
                    "zh": "班上最高的人",
                    "left": "クラス",
                    "leftRuby": "くらす",
                    "right": "一番背が高い人",
                    "rightRuby": "いちばんせがたかいひと"
                },
                {
                    "j": "日本で一番高い山",
                    "r": "にほんでいちばんたかいやま",
                    "zh": "日本最高的山",
                    "left": "日本",
                    "leftRuby": "にほん",
                    "right": "一番高い山",
                    "rightRuby": "いちばんたかいやま"
                },
                {
                    "j": "世界で一番大きい動物",
                    "r": "せかいでいちばんおおきいどうぶつ",
                    "zh": "世界最大的動物",
                    "left": "世界",
                    "leftRuby": "せかい",
                    "right": "一番大きい動物",
                    "rightRuby": "いちばんおおきいどうぶつ"
                },
                {
                    "j": "この店で一番美味しいケーキ",
                    "r": "このみせでいちばんおいしいけーき",
                    "zh": "這家店最好吃的蛋糕",
                    "left": "この店",
                    "leftRuby": "このみせ",
                    "right": "一番美味しいケーキ",
                    "rightRuby": "いちばんおいしいけーき"
                },
                {
                    "j": "学校で一番人気の先生",
                    "r": "がっこうでいちばんにんきのせんせい",
                    "zh": "學校最紅的老師",
                    "left": "学校",
                    "leftRuby": "がっこう",
                    "right": "一番人気の先生",
                    "rightRuby": "いちばんにんきのせんせい"
                },
                {
                    "j": "一年で一番暑い月",
                    "r": "いちねんでいちばんあついつき",
                    "zh": "一年中最熱的月份",
                    "left": "一年",
                    "leftRuby": "いちねん",
                    "right": "一番暑い月",
                    "rightRuby": "いちばんあついつき"
                },
                {
                    "j": "日本で一番速い電車",
                    "r": "にほんでいちばんはやいでんしゃ",
                    "zh": "日本最快的電車",
                    "left": "日本",
                    "leftRuby": "にほん",
                    "right": "一番速い電車",
                    "rightRuby": "いちばんはやいでんしゃ"
                },
                {
                    "j": "アジアで一番長い川",
                    "r": "あじあでいちばんながいかわ",
                    "zh": "亞洲最長的河",
                    "left": "アジア",
                    "leftRuby": "あじあ",
                    "right": "一番長い川",
                    "rightRuby": "いちばんながいかわ"
                },
                {
                    "j": "家族で一番背が低い人",
                    "r": "かぞくでいちばんせがひくいひと",
                    "zh": "家裡最矮的人",
                    "left": "家族",
                    "leftRuby": "かぞく",
                    "right": "一番背が低い人",
                    "rightRuby": "いちばんせがひくいひと"
                },
                {
                    "j": "町で一番古い店",
                    "r": "まちでいちばんふるいみせ",
                    "zh": "鎮上最老的店",
                    "left": "町",
                    "leftRuby": "まち",
                    "right": "一番古い店",
                    "rightRuby": "いちばんふるいみせ"
                },
                {
                    "j": "東京で一番高いビル",
                    "r": "とうきょうでいちばんたかいびる",
                    "zh": "東京最高的大樓",
                    "left": "東京",
                    "leftRuby": "とうきょう",
                    "right": "一番高いビル",
                    "rightRuby": "いちばんたかいびる"
                },
                {
                    "j": "この中で一番安いパソコン",
                    "r": "このなかでいちばんやすいぱそこん",
                    "zh": "這之中最便宜的電腦",
                    "left": "この中",
                    "leftRuby": "このなか",
                    "right": "一番安いパソコン",
                    "rightRuby": "いちばんやすいぱそこん"
                },
                {
                    "j": "クラスで一番足が速い",
                    "r": "くらすでいちばんあしがはやい",
                    "zh": "班上跑最快",
                    "left": "クラス",
                    "leftRuby": "くらす",
                    "right": "一番足が速い",
                    "rightRuby": "いちばんあしがはやい"
                },
                {
                    "j": "会社で一番若い社員",
                    "r": "かいしゃでいちばんわかいしゃいん",
                    "zh": "公司最年輕的員工",
                    "left": "会社",
                    "leftRuby": "かいしゃ",
                    "right": "一番若い社員",
                    "rightRuby": "いちばんわかいしゃいん"
                },
                {
                    "j": "果物で一番好きだ",
                    "r": "くだものでいちばんすきだ",
                    "zh": "水果中最喜歡的",
                    "left": "果物",
                    "leftRuby": "くだもの",
                    "right": "一番好きだ",
                    "rightRuby": "いちばんすきだ"
                },
                {
                    "j": "スポーツで一番得意だ",
                    "r": "すぽーつでいちばんとくいだ",
                    "zh": "運動中最拿手的",
                    "left": "スポーツ",
                    "leftRuby": "すぽーつ",
                    "right": "一番得意だ",
                    "rightRuby": "いちばんとくいだ"
                },
                {
                    "j": "世界で一番有名な人",
                    "r": "せかいでいちばんゆうめいなひと",
                    "zh": "世界上最有名的人",
                    "left": "世界",
                    "leftRuby": "せかい",
                    "right": "一番有名な人",
                    "rightRuby": "いちばんゆうめいなひと"
                },
                {
                    "j": "三人で一番頭がいい",
                    "r": "さんにんでいちばんあたまがいい",
                    "zh": "三人中最聰明的",
                    "left": "三人",
                    "leftRuby": "さんにん",
                    "right": "一番頭がいい",
                    "rightRuby": "いちばんあたまがいい"
                },
                {
                    "j": "車の中で一番高い",
                    "r": "くるまのなかでいちばんたかい",
                    "zh": "車子中最貴的",
                    "left": "車の中",
                    "leftRuby": "くるまのなか",
                    "right": "一番高い",
                    "rightRuby": "いちばんたかい"
                },
                {
                    "j": "これ全部で千円だ",
                    "r": "これぜんぶでせんえんだ",
                    "zh": "這全部共一千日圓(範圍)",
                    "left": "これ全部",
                    "leftRuby": "これぜんぶ",
                    "right": "千円だ",
                    "rightRuby": "せんえんだ"
                }
            ]
        },
        "NI_PURPOSE": {
            "safeCombos": [
                {
                    "j": "本を買いに行く",
                    "r": "ほんをかいにいく",
                    "zh": "去買書",
                    "left": "本を買い",
                    "leftRuby": "ほんをかい",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "映画を見に行く",
                    "r": "えいがをみにいく",
                    "zh": "去看電影",
                    "left": "映画を見",
                    "leftRuby": "えいがをみ",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "パンを買いに行く",
                    "r": "ぱんをかいにいく",
                    "zh": "去買麵包",
                    "left": "パンを買い",
                    "leftRuby": "ぱんをかい",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "散歩しに出る",
                    "r": "さんぽしにでる",
                    "zh": "出去散步",
                    "left": "散歩し",
                    "leftRuby": "さんぽし",
                    "right": "出る",
                    "rightRuby": "でる"
                },
                {
                    "j": "遊びに行く",
                    "r": "あそびにいく",
                    "zh": "去玩",
                    "left": "遊び",
                    "leftRuby": "あそび",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "泳ぎに行く",
                    "r": "およぎにいく",
                    "zh": "去游泳",
                    "left": "泳ぎ",
                    "leftRuby": "およぎ",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "昼ご飯を食べに行く",
                    "r": "ひるごはんをたべにいく",
                    "zh": "去吃午餐",
                    "left": "昼ご飯を食べ",
                    "leftRuby": "ひるごはんをたべ",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "お茶を飲みに行く",
                    "r": "おちゃをのみにいく",
                    "zh": "去喝茶",
                    "left": "お茶を飲み",
                    "leftRuby": "おちゃをのみ",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "晩ご飯を食べに帰る",
                    "r": "ばんごはんをたべにかえる",
                    "zh": "回去吃晚餐",
                    "left": "晩ご飯を食べ",
                    "leftRuby": "ばんごはんをたべ",
                    "right": "帰る",
                    "rightRuby": "かえる"
                },
                {
                    "j": "服を買いに出かける",
                    "r": "ふくをかいにでかける",
                    "zh": "出門買衣服",
                    "left": "服を買い",
                    "leftRuby": "ふくをかい",
                    "right": "出かける",
                    "rightRuby": "でかける"
                },
                {
                    "j": "写真を撮りに行く",
                    "r": "しゃしんをとりにいく",
                    "zh": "去拍照",
                    "left": "写真を撮り",
                    "leftRuby": "しゃしんをとり",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "勉強しに行く",
                    "r": "べんきょうしにいく",
                    "zh": "去讀書",
                    "left": "勉強し",
                    "leftRuby": "べんきょうし",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "借りに行く",
                    "r": "かりにいく",
                    "zh": "去借",
                    "left": "借り",
                    "leftRuby": "かり",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "友達に会いに行く",
                    "r": "ともだちにあいにいく",
                    "zh": "去見朋友",
                    "left": "友達に会い",
                    "leftRuby": "ともだちにあい",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "話しに来る",
                    "r": "はなしにくる",
                    "zh": "來談事情",
                    "left": "話し",
                    "leftRuby": "はなし",
                    "right": "来る",
                    "rightRuby": "くる"
                },
                {
                    "j": "仕事をしに行く",
                    "r": "しごとをしにいく",
                    "zh": "去工作",
                    "left": "仕事をし",
                    "leftRuby": "しごとをし",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "迎えに行く",
                    "r": "むかえにいく",
                    "zh": "去迎接",
                    "left": "迎え",
                    "leftRuby": "むかえ",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "温泉に入りに行く",
                    "r": "おんせんにはいりにいく",
                    "zh": "去泡溫泉",
                    "left": "温泉に入り",
                    "leftRuby": "おんせんにはいり",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "ケーキを買いに行く",
                    "r": "けーきをかいにいく",
                    "zh": "去買蛋糕",
                    "left": "ケーキを買い",
                    "leftRuby": "けーきをかい",
                    "right": "行く",
                    "rightRuby": "いく"
                },
                {
                    "j": "荷物を取りに行く",
                    "r": "にもつをとりにいく",
                    "zh": "去拿行李",
                    "left": "荷物を取り",
                    "leftRuby": "にもつをとり",
                    "right": "行く",
                    "rightRuby": "いく"
                }
            ]
        },
        "TO_QUOTE": {
            "safeCombos": [
                {
                    "j": "「ありがとう」と言う",
                    "r": "「ありがとう」という",
                    "zh": "說「謝謝」",
                    "left": "「ありがとう」",
                    "leftRuby": "「ありがとう」",
                    "right": "言う",
                    "rightRuby": "いう"
                },
                {
                    "j": "「行きたい」と思う",
                    "r": "「いきたい」とおもう",
                    "zh": "覺得「想去」",
                    "left": "「行きたい」",
                    "leftRuby": "「いきたい」",
                    "right": "思う",
                    "rightRuby": "おもう"
                },
                {
                    "j": "「大丈夫」と言う",
                    "r": "「だいじょうぶ」という",
                    "zh": "說「沒問題」",
                    "left": "「大丈夫」",
                    "leftRuby": "「だいじょうぶ」",
                    "right": "言う",
                    "rightRuby": "いう"
                },
                {
                    "j": "「おはよう」と言う",
                    "r": "「おはよう」という",
                    "zh": "說「早安」",
                    "left": "「おはよう」",
                    "leftRuby": "「おはよう」",
                    "right": "言う",
                    "rightRuby": "いう"
                },
                {
                    "j": "「行こう」と言う",
                    "r": "「いこう」という",
                    "zh": "說「走吧」",
                    "left": "「行こう」",
                    "leftRuby": "「いこう」",
                    "right": "言う",
                    "rightRuby": "いう"
                },
                {
                    "j": "「美味しい」と思う",
                    "r": "「おいしい」とおもう",
                    "zh": "覺得「很好吃」",
                    "left": "「美味しい」",
                    "leftRuby": "「おいしい」",
                    "right": "思う",
                    "rightRuby": "おもう"
                },
                {
                    "j": "「好きだ」と言う",
                    "r": "「すきだ」という",
                    "zh": "說「喜歡」",
                    "left": "「好きだ」",
                    "leftRuby": "「すきだ」",
                    "right": "言う",
                    "rightRuby": "いう"
                },
                {
                    "j": "「高い」と思う",
                    "r": "「たかい」とおもう",
                    "zh": "覺得「很貴」",
                    "left": "「高い」",
                    "leftRuby": "「たかい」",
                    "right": "思う",
                    "rightRuby": "おもう"
                },
                {
                    "j": "「安い」と思う",
                    "r": "「やすい」とおもう",
                    "zh": "覺得「便宜」",
                    "left": "「安い」",
                    "leftRuby": "「やすい」",
                    "right": "思う",
                    "rightRuby": "おもう"
                },
                {
                    "j": "「すごい」と言う",
                    "r": "「すごい」という",
                    "zh": "說「好厲害」",
                    "left": "「すごい」",
                    "leftRuby": "「すごい」",
                    "right": "言う",
                    "rightRuby": "いう"
                },
                {
                    "j": "「はい」と言う",
                    "r": "「はい」という",
                    "zh": "說「是」",
                    "left": "「はい」",
                    "leftRuby": "「はい」",
                    "right": "言う",
                    "rightRuby": "いう"
                },
                {
                    "j": "「無理だ」と思う",
                    "r": "「むりだ」とおもう",
                    "zh": "覺得「不可能」",
                    "left": "「無理だ」",
                    "leftRuby": "「むりだ」",
                    "right": "思う",
                    "rightRuby": "おもう"
                },
                {
                    "j": "「さようなら」と言う",
                    "r": "「さようなら」という",
                    "zh": "說「再見」",
                    "left": "「さようなら」",
                    "leftRuby": "「さようなら」",
                    "right": "言う",
                    "rightRuby": "いう"
                },
                {
                    "j": "「難しい」と思う",
                    "r": "「むずかしい」とおもう",
                    "zh": "覺得「很難」",
                    "left": "「難しい」",
                    "leftRuby": "「むずかしい」",
                    "right": "思う",
                    "rightRuby": "おもう"
                },
                {
                    "j": "「ごめん」と言う",
                    "r": "「ごめん」という",
                    "zh": "說「對不起」",
                    "left": "「ごめん」",
                    "leftRuby": "「ごめん」",
                    "right": "言う",
                    "rightRuby": "いう"
                },
                {
                    "j": "「楽しい」と思う",
                    "r": "「たのしい」とおもう",
                    "zh": "覺得「好玩」",
                    "left": "「楽しい」",
                    "leftRuby": "「たのしい」",
                    "right": "思う",
                    "rightRuby": "おもう"
                },
                {
                    "j": "「本当だ」と言う",
                    "r": "「ほんとうだ」という",
                    "zh": "說「是真的」",
                    "left": "「本当だ」",
                    "leftRuby": "「ほんとうだ」",
                    "right": "言う",
                    "rightRuby": "いう"
                },
                {
                    "j": "「疲れた」と思う",
                    "r": "「つかれた」とおもう",
                    "zh": "心想「累了」",
                    "left": "「疲れた」",
                    "leftRuby": "「つかれた」",
                    "right": "思う",
                    "rightRuby": "おもう"
                },
                {
                    "j": "「きれいだ」と思う",
                    "r": "「きれいだ」とおもう",
                    "zh": "覺得「很漂亮」",
                    "left": "「きれいだ」",
                    "leftRuby": "「きれいだ」",
                    "right": "思う",
                    "rightRuby": "おもう"
                },
                {
                    "j": "「待って」と言う",
                    "r": "「まって」という",
                    "zh": "說「等一下」",
                    "left": "「待って」",
                    "leftRuby": "「まって」",
                    "right": "言う",
                    "rightRuby": "いう"
                }
            ]
        },
        "KARA_REASON": {
            "safeCombos": [
                {
                    "j": "雨だから行かない",
                    "r": "あめだからいかない",
                    "zh": "因為下雨所以不去",
                    "left": "雨だ",
                    "leftRuby": "あめだ",
                    "right": "行かない",
                    "rightRuby": "いかない"
                },
                {
                    "j": "時間がないから急ぐ",
                    "r": "じかんがないからいそぐ",
                    "zh": "因為沒時間趕快",
                    "left": "時間がない",
                    "leftRuby": "じかんがない",
                    "right": "急ぐ",
                    "rightRuby": "いそぐ"
                },
                {
                    "j": "お腹がすいたから食べる",
                    "r": "おなかがすいたからたべる",
                    "zh": "因為肚子餓所以吃",
                    "left": "お腹がすいた",
                    "leftRuby": "おなかがすいた",
                    "right": "食べる",
                    "rightRuby": "たべる"
                },
                {
                    "j": "疲れたから休む",
                    "r": "つかれたからやすむ",
                    "zh": "因為累了所以休息",
                    "left": "疲れた",
                    "leftRuby": "つかれた",
                    "right": "休む",
                    "rightRuby": "やすむ"
                },
                {
                    "j": "寒いから窓を閉める",
                    "r": "さむいからまどをしめる",
                    "zh": "因為冷所以關窗",
                    "left": "寒い",
                    "leftRuby": "さむい",
                    "right": "窓を閉める",
                    "rightRuby": "まどをしめる"
                },
                {
                    "j": "暑いから水を飲む",
                    "r": "あついからみずをのむ",
                    "zh": "因為熱所以喝水",
                    "left": "暑い",
                    "leftRuby": "あつい",
                    "right": "水を飲む",
                    "rightRuby": "みずをのむ"
                },
                {
                    "j": "高いから買わない",
                    "r": "たかいからかわない",
                    "zh": "因為貴所以不買",
                    "left": "高い",
                    "leftRuby": "たかい",
                    "right": "買わない",
                    "rightRuby": "かわない"
                },
                {
                    "j": "風邪だから薬を飲む",
                    "r": "かぜだからくすりをのむ",
                    "zh": "因為感冒所以吃藥",
                    "left": "風邪だ",
                    "leftRuby": "かぜだ",
                    "right": "薬を飲む",
                    "rightRuby": "くすりをのむ"
                },
                {
                    "j": "安いからたくさん買う",
                    "r": "やすいからたくさんかう",
                    "zh": "因為便宜所以買很多",
                    "left": "安い",
                    "leftRuby": "やすい",
                    "right": "たくさん買う",
                    "rightRuby": "たくさんかう"
                },
                {
                    "j": "危ないから触らない",
                    "r": "あぶないからさわらない",
                    "zh": "因為危險所以不碰",
                    "left": "危ない",
                    "leftRuby": "あぶない",
                    "right": "触らない",
                    "rightRuby": "さわらない"
                },
                {
                    "j": "暗いから電気をつける",
                    "r": "くらいからでんきをつける",
                    "zh": "因為暗所以開燈",
                    "left": "暗い",
                    "leftRuby": "くらい",
                    "right": "電気をつける",
                    "rightRuby": "でんきをつける"
                },
                {
                    "j": "眠いから寝る",
                    "r": "ねむいからねる",
                    "zh": "因為睏所以睡覺",
                    "left": "眠い",
                    "leftRuby": "ねむい",
                    "right": "寝る",
                    "rightRuby": "ねる"
                },
                {
                    "j": "好きだから食べる",
                    "r": "すきだからたべる",
                    "zh": "因為喜歡所以吃",
                    "left": "好きだ",
                    "leftRuby": "すきだ",
                    "right": "食べる",
                    "rightRuby": "たべる"
                },
                {
                    "j": "痛いから休む",
                    "r": "いたいからやすむ",
                    "zh": "因為痛所以休息",
                    "left": "痛い",
                    "leftRuby": "いたい",
                    "right": "休む",
                    "rightRuby": "やすむ"
                },
                {
                    "j": "暇だから遊ぶ",
                    "r": "ひまだからあそぶ",
                    "zh": "因為有空所以玩",
                    "left": "暇だ",
                    "leftRuby": "ひまだ",
                    "right": "遊ぶ",
                    "rightRuby": "あそぶ"
                },
                {
                    "j": "美味しいから食べる",
                    "r": "おいしいからたべる",
                    "zh": "因為好吃所以吃",
                    "left": "美味しい",
                    "leftRuby": "おいしい",
                    "right": "食べる",
                    "rightRuby": "たべる"
                },
                {
                    "j": "遠いからバスで行く",
                    "r": "とおいからばすでいく",
                    "zh": "因為遠所以搭公車去",
                    "left": "遠い",
                    "leftRuby": "とおい",
                    "right": "バスで行く",
                    "rightRuby": "ばすでいく"
                },
                {
                    "j": "お金がないから買わない",
                    "r": "おかねがないからかわない",
                    "zh": "因為沒錢所以不買",
                    "left": "お金がない",
                    "leftRuby": "おかねがない",
                    "right": "買わない",
                    "rightRuby": "かわない"
                },
                {
                    "j": "重いから持てない",
                    "r": "おもいからもてない",
                    "zh": "因為重所以拿不動",
                    "left": "重い",
                    "leftRuby": "おもい",
                    "right": "持てない",
                    "rightRuby": "もてない"
                },
                {
                    "j": "きれいだから好きだ",
                    "r": "きれいだからすきだ",
                    "zh": "因為漂亮所以喜歡",
                    "left": "きれいだ",
                    "leftRuby": "きれいだ",
                    "right": "好きだ",
                    "rightRuby": "すきだ"
                }
            ]
        },
        "YORI_COMPARE": {
            "safeCombos": [
                {
                    "j": "肉より魚が好き",
                    "r": "にくよりさかながすき",
                    "zh": "比肉更喜歡魚",
                    "left": "肉",
                    "leftRuby": "にく",
                    "right": "魚が好き",
                    "rightRuby": "さかながすき"
                },
                {
                    "j": "犬より猫が好き",
                    "r": "いぬよりねこがすき",
                    "zh": "比狗更喜歡貓",
                    "left": "犬",
                    "leftRuby": "いぬ",
                    "right": "猫が好き",
                    "rightRuby": "ねこがすき"
                },
                {
                    "j": "バスより電車が速い",
                    "r": "ばすよりでんしゃがはやい",
                    "zh": "電車比公車快",
                    "left": "バス",
                    "leftRuby": "ばす",
                    "right": "電車が速い",
                    "rightRuby": "でんしゃがはやい"
                },
                {
                    "j": "夏より冬が好き",
                    "r": "なつよりふゆがすき",
                    "zh": "比夏天更喜歡冬天",
                    "left": "夏",
                    "leftRuby": "なつ",
                    "right": "冬が好き",
                    "rightRuby": "ふゆがすき"
                },
                {
                    "j": "昨日より今日が暑い",
                    "r": "きのうよりきょうがあつい",
                    "zh": "今天比昨天熱",
                    "left": "昨日",
                    "leftRuby": "きのう",
                    "right": "今日が暑い",
                    "rightRuby": "きょうがあつい"
                },
                {
                    "j": "私より妹が背が高い",
                    "r": "わたしよりいもうとがせがたかい",
                    "zh": "妹妹比我高",
                    "left": "私",
                    "leftRuby": "わたし",
                    "right": "妹が背が高い",
                    "rightRuby": "いもうとがせがたかい"
                },
                {
                    "j": "海より山が好き",
                    "r": "うみよりやまがすき",
                    "zh": "比海更喜歡山",
                    "left": "海",
                    "leftRuby": "うみ",
                    "right": "山が好き",
                    "rightRuby": "やまがすき"
                },
                {
                    "j": "自転車より車が速い",
                    "r": "じてんしゃよりくるまがはやい",
                    "zh": "車子比腳踏車快",
                    "left": "自転車",
                    "leftRuby": "じてんしゃ",
                    "right": "車が速い",
                    "rightRuby": "くるまがはやい"
                },
                {
                    "j": "パンよりご飯が好き",
                    "r": "ぱんよりごはんがすき",
                    "zh": "比麵包更喜歡飯",
                    "left": "パン",
                    "leftRuby": "ぱん",
                    "right": "ご飯が好き",
                    "rightRuby": "ごはんがすき"
                },
                {
                    "j": "去年より今年が暑い",
                    "r": "きょねんよりことしがあつい",
                    "zh": "今年比去年熱",
                    "left": "去年",
                    "leftRuby": "きょねん",
                    "right": "今年が暑い",
                    "rightRuby": "ことしがあつい"
                },
                {
                    "j": "数学より英語が難しい",
                    "r": "すうがくよりえいごがむずかしい",
                    "zh": "英語比數學難",
                    "left": "数学",
                    "leftRuby": "すうがく",
                    "right": "英語が難しい",
                    "rightRuby": "えいごがむずかしい"
                },
                {
                    "j": "漢字よりひらがなが簡単だ",
                    "r": "かんじよりひらがながかんたんだ",
                    "zh": "平假名比漢字簡單",
                    "left": "漢字",
                    "leftRuby": "かんじ",
                    "right": "ひらがなが簡単だ",
                    "rightRuby": "ひらがながかんたんだ"
                },
                {
                    "j": "兄より弟が大きい",
                    "r": "あによりおとうとがおおきい",
                    "zh": "弟弟比哥哥大",
                    "left": "兄",
                    "leftRuby": "あに",
                    "right": "弟が大きい",
                    "rightRuby": "おとうとがおおきい"
                },
                {
                    "j": "昨日より今日が寒い",
                    "r": "きのうよりきょうがさむい",
                    "zh": "今天比昨天冷",
                    "left": "昨日",
                    "leftRuby": "きのう",
                    "right": "今日が寒い",
                    "rightRuby": "きょうがさむい"
                },
                {
                    "j": "テレビよりネットがいい",
                    "r": "てれびよりねっとがいい",
                    "zh": "網路比電視好",
                    "left": "テレビ",
                    "leftRuby": "てれび",
                    "right": "ネットがいい",
                    "rightRuby": "ねっとがいい"
                },
                {
                    "j": "東京より大阪が好き",
                    "r": "とうきょうよりおおさかがすき",
                    "zh": "比東京更喜歡大阪",
                    "left": "東京",
                    "leftRuby": "とうきょう",
                    "right": "大阪が好き",
                    "rightRuby": "おおさかがすき"
                },
                {
                    "j": "これよりあれが欲しい",
                    "r": "これよりあれがほしい",
                    "zh": "比起這個更想要那個",
                    "left": "これ",
                    "leftRuby": "これ",
                    "right": "あれが欲しい",
                    "rightRuby": "あれがほしい"
                },
                {
                    "j": "歩くより走るが速い",
                    "r": "あるくよりはしるがはやい",
                    "zh": "跑比走快",
                    "left": "歩く",
                    "leftRuby": "あるく",
                    "right": "走るが速い",
                    "rightRuby": "はしるがはやい"
                },
                {
                    "j": "コーヒーより紅茶を飲む",
                    "r": "こーひーよりこうちゃをのむ",
                    "zh": "比起咖啡更常喝紅茶",
                    "left": "コーヒー",
                    "leftRuby": "こーひー",
                    "right": "紅茶を飲む",
                    "rightRuby": "こうちゃをのむ"
                },
                {
                    "j": "りんごよりみかんが安い",
                    "r": "りんごよりみかんがやすい",
                    "zh": "橘子比蘋果便宜",
                    "left": "りんご",
                    "leftRuby": "りんご",
                    "right": "みかんが安い",
                    "rightRuby": "みかんがやすい"
                }
            ]
        },
        "NI_FREQUENCY": {
            "safeCombos": [
                {
                    "j": "一日に三回",
                    "r": "いちにちにさんかい",
                    "zh": "一天三次",
                    "left": "一日",
                    "leftRuby": "いちにち",
                    "right": "三回",
                    "rightRuby": "さんかい"
                },
                {
                    "j": "一週間に一回",
                    "r": "いっしゅうかんにいっかい",
                    "zh": "一星期一次",
                    "left": "一週間",
                    "leftRuby": "いっしゅうかん",
                    "right": "一回",
                    "rightRuby": "いっかい"
                },
                {
                    "j": "一か月に二回",
                    "r": "いっかげつににかい",
                    "zh": "一個月兩次",
                    "left": "一か月",
                    "leftRuby": "いっかげつ",
                    "right": "二回",
                    "rightRuby": "にかい"
                },
                {
                    "j": "一年に一回",
                    "r": "いちねんにいっかい",
                    "zh": "一年一次",
                    "left": "一年",
                    "leftRuby": "いちねん",
                    "right": "一回",
                    "rightRuby": "いっかい"
                },
                {
                    "j": "一日に二回食べる",
                    "r": "いちにちににかいたべる",
                    "zh": "一天吃兩次",
                    "left": "一日",
                    "leftRuby": "いちにち",
                    "right": "二回食べる",
                    "rightRuby": "にかいたべる"
                },
                {
                    "j": "一週間に二日休む",
                    "r": "いっしゅうかんにふつかやすむ",
                    "zh": "一星期休息兩天",
                    "left": "一週間",
                    "leftRuby": "いっしゅうかん",
                    "right": "二日休む",
                    "rightRuby": "ふつかやすむ"
                },
                {
                    "j": "一時間に二回見る",
                    "r": "いちじかんににかいみる",
                    "zh": "一小時看兩次",
                    "left": "一時間",
                    "leftRuby": "いちじかん",
                    "right": "二回見る",
                    "rightRuby": "にかいみる"
                },
                {
                    "j": "一か月に一冊",
                    "r": "いっかげつにいっさつ",
                    "zh": "一個月一本",
                    "left": "一か月",
                    "leftRuby": "いっかげつ",
                    "right": "一冊",
                    "rightRuby": "いっさつ"
                },
                {
                    "j": "一年に二回行く",
                    "r": "いちねんににかいいく",
                    "zh": "一年去兩次",
                    "left": "一年",
                    "leftRuby": "いちねん",
                    "right": "二回行く",
                    "rightRuby": "にかいいく"
                },
                {
                    "j": "一週間に三回",
                    "r": "いっしゅうかんにさんかい",
                    "zh": "一星期三次",
                    "left": "一週間",
                    "leftRuby": "いっしゅうかん",
                    "right": "三回",
                    "rightRuby": "さんかい"
                },
                {
                    "j": "一日に五回",
                    "r": "いちにちにごかい",
                    "zh": "一天五次",
                    "left": "一日",
                    "leftRuby": "いちにち",
                    "right": "五回",
                    "rightRuby": "ごかい"
                },
                {
                    "j": "一週間に一回掃除する",
                    "r": "いっしゅうかんにいっかいそうじする",
                    "zh": "一星期打掃一次",
                    "left": "一週間",
                    "leftRuby": "いっしゅうかん",
                    "right": "一回掃除する",
                    "rightRuby": "いっかいそうじする"
                },
                {
                    "j": "三日に一回",
                    "r": "みっかにいっかい",
                    "zh": "三天一次",
                    "left": "三日",
                    "leftRuby": "みっか",
                    "right": "一回",
                    "rightRuby": "いっかい"
                },
                {
                    "j": "半年に一回",
                    "r": "はんとしにいっかい",
                    "zh": "半年一次",
                    "left": "半年",
                    "leftRuby": "はんとし",
                    "right": "一回",
                    "rightRuby": "いっかい"
                },
                {
                    "j": "十日に一回",
                    "r": "とおかにいっかい",
                    "zh": "十天一次",
                    "left": "十日",
                    "leftRuby": "とおか",
                    "right": "一回",
                    "rightRuby": "いっかい"
                },
                {
                    "j": "二日に一回",
                    "r": "ふつかにいっかい",
                    "zh": "兩天一次",
                    "left": "二日",
                    "leftRuby": "ふつか",
                    "right": "一回",
                    "rightRuby": "いっかい"
                },
                {
                    "j": "三十分に三回",
                    "r": "さんじゅっぷんにさんかい",
                    "zh": "三十分鐘三次",
                    "left": "三十分",
                    "leftRuby": "さんじゅっぷん",
                    "right": "三回",
                    "rightRuby": "さんかい"
                },
                {
                    "j": "人生に一回",
                    "r": "じんせいにいっかい",
                    "zh": "人生一次",
                    "left": "人生",
                    "leftRuby": "じんせい",
                    "right": "一回",
                    "rightRuby": "いっかい"
                },
                {
                    "j": "一日に一回薬を飲む",
                    "r": "いちにちにいっかいくすりをのむ",
                    "zh": "一天吃一次藥",
                    "left": "一日",
                    "leftRuby": "いちにち",
                    "right": "一回薬を飲む",
                    "rightRuby": "いっかいくすりをのむ"
                },
                {
                    "j": "五年に一回",
                    "r": "ごねんにいっかい",
                    "zh": "五年一次",
                    "left": "五年",
                    "leftRuby": "ごねん",
                    "right": "一回",
                    "rightRuby": "いっかい"
                }
            ]
        },
        "DE_MATERIAL": {
            "safeCombos": [
                {
                    "j": "木で机を作る",
                    "r": "きでつくえをつくる",
                    "zh": "用木頭做書桌",
                    "left": "木",
                    "leftRuby": "き",
                    "right": "机を作る",
                    "rightRuby": "つくえをつくる"
                },
                {
                    "j": "紙で箱を作る",
                    "r": "かみではこをつくる",
                    "zh": "用紙做箱子",
                    "left": "紙",
                    "leftRuby": "かみ",
                    "right": "箱を作る",
                    "rightRuby": "はこをつくる"
                },
                {
                    "j": "布で服を作る",
                    "r": "ぬのでふくをつくる",
                    "zh": "用布做衣服",
                    "left": "布",
                    "leftRuby": "ぬの",
                    "right": "服を作る",
                    "rightRuby": "ふくをつくる"
                },
                {
                    "j": "石で家を造る",
                    "r": "いしでいえをつくる",
                    "zh": "用石頭蓋房子",
                    "left": "石",
                    "leftRuby": "いし",
                    "right": "家を造る",
                    "rightRuby": "いえをつくる"
                },
                {
                    "j": "牛乳でチーズを作る",
                    "r": "ぎゅうにゅうでちーずをつくる",
                    "zh": "用牛奶做起司",
                    "left": "牛乳",
                    "leftRuby": "ぎゅうにゅう",
                    "right": "チーズを作る",
                    "rightRuby": "ちーずをつくる"
                },
                {
                    "j": "野菜でジュースを作る",
                    "r": "やさいでじゅーすをつくる",
                    "zh": "用蔬菜做果汁",
                    "left": "野菜",
                    "leftRuby": "やさい",
                    "right": "ジュースを作る",
                    "rightRuby": "じゅーすをつくる"
                },
                {
                    "j": "米でお酒を造る",
                    "r": "こめでおさけをつくる",
                    "zh": "用米釀酒",
                    "left": "米",
                    "leftRuby": "こめ",
                    "right": "お酒を造る",
                    "rightRuby": "おさけをつくる"
                },
                {
                    "j": "果物でジャムを作る",
                    "r": "くだものでじゃむをつくる",
                    "zh": "用水果做果醬",
                    "left": "果物",
                    "leftRuby": "くだもの",
                    "right": "ジャムを作る",
                    "rightRuby": "じゃむをつくる"
                },
                {
                    "j": "小麦粉でパンを作る",
                    "r": "こむぎこでぱんをつくる",
                    "zh": "用麵粉做麵包",
                    "left": "小麦粉",
                    "leftRuby": "こむぎこ",
                    "right": "パンを作る",
                    "rightRuby": "ぱんをつくる"
                },
                {
                    "j": "肉でスープを作る",
                    "r": "にくですーぷをつくる",
                    "zh": "用肉煮湯",
                    "left": "肉",
                    "leftRuby": "にく",
                    "right": "スープを作る",
                    "rightRuby": "すーぷをつくる"
                },
                {
                    "j": "豆で豆腐を作る",
                    "r": "まめでとうふをつくる",
                    "zh": "用豆子做豆腐",
                    "left": "豆",
                    "leftRuby": "まめ",
                    "right": "豆腐を作る",
                    "rightRuby": "とうふをつくる"
                },
                {
                    "j": "チョコでケーキを作る",
                    "r": "ちょこでけーきをつくる",
                    "zh": "用巧克力做蛋糕",
                    "left": "チョコ",
                    "leftRuby": "ちょこ",
                    "right": "ケーキを作る",
                    "rightRuby": "けーきをつくる"
                },
                {
                    "j": "土で皿を作る",
                    "r": "つちでさらをつくる",
                    "zh": "用泥土做盤子",
                    "left": "土",
                    "leftRuby": "つち",
                    "right": "皿を作る",
                    "rightRuby": "さらをつくる"
                },
                {
                    "j": "糸で服を編む",
                    "r": "いとでふくをあむ",
                    "zh": "用線編織衣服",
                    "left": "糸",
                    "leftRuby": "いと",
                    "right": "服を編む",
                    "rightRuby": "ふくをあむ"
                },
                {
                    "j": "竹でかごを作る",
                    "r": "たけでかごをつくる",
                    "zh": "用竹子做籃子",
                    "left": "竹",
                    "leftRuby": "たけ",
                    "right": "かごを作る",
                    "rightRuby": "かごをつくる"
                },
                {
                    "j": "ガラスでコップを作る",
                    "r": "がらすでこっぷをつくる",
                    "zh": "用玻璃做杯子",
                    "left": "ガラス",
                    "leftRuby": "がらす",
                    "right": "コップを作る",
                    "rightRuby": "こっぷをつくる"
                },
                {
                    "j": "鉄で車を作る",
                    "r": "てつでくるまをつくる",
                    "zh": "用鐵製造車子",
                    "left": "鉄",
                    "leftRuby": "てつ",
                    "right": "車を作る",
                    "rightRuby": "くるまをつくる"
                },
                {
                    "j": "ペットボトルで船を作る",
                    "r": "ぺっとぼとるでふねをつくる",
                    "zh": "用保特瓶做船",
                    "left": "ペットボトル",
                    "leftRuby": "ぺっとぼとる",
                    "right": "船を作る",
                    "rightRuby": "ふねをつくる"
                },
                {
                    "j": "雪で雪だるまを作る",
                    "r": "ゆきでゆきだるまをつくる",
                    "zh": "用雪做雪人",
                    "left": "雪",
                    "leftRuby": "ゆき",
                    "right": "雪だるまを作る",
                    "rightRuby": "ゆきだるまをつくる"
                },
                {
                    "j": "氷で家を作る",
                    "r": "こおりでいえをつくる",
                    "zh": "用冰蓋房子",
                    "left": "氷",
                    "leftRuby": "こおり",
                    "right": "家を作る",
                    "rightRuby": "いえをつくる"
                }
            ]
        },
        "NI_DESTINATION": {
            "safeCombos": [
                {
                    "j": "いすに座る",
                    "r": "いすにすわる",
                    "zh": "坐在椅子上",
                    "left": "いす",
                    "leftRuby": "いす",
                    "right": "座る",
                    "rightRuby": "すわる"
                },
                {
                    "j": "電車に乗る",
                    "r": "でんしゃにのる",
                    "zh": "搭電車(上車點)",
                    "left": "電車",
                    "leftRuby": "でんしゃ",
                    "right": "乗る",
                    "rightRuby": "のる"
                },
                {
                    "j": "バスに乗る",
                    "r": "ばすにのる",
                    "zh": "搭公車",
                    "left": "バス",
                    "leftRuby": "ばす",
                    "right": "乗る",
                    "rightRuby": "のる"
                },
                {
                    "j": "壁に写真を貼る",
                    "r": "かべにしゃしんをはる",
                    "zh": "在牆上貼照片",
                    "left": "壁",
                    "leftRuby": "かべ",
                    "right": "写真を貼る",
                    "rightRuby": "しゃしんをはる"
                },
                {
                    "j": "ノートに名前を書く",
                    "r": "のーとに名前をかく",
                    "zh": "在筆記本寫名字",
                    "left": "ノート",
                    "leftRuby": "のーと",
                    "right": "名前を書く",
                    "rightRuby": "なまえをかく"
                },
                {
                    "j": "駅に着く",
                    "r": "えきにつく",
                    "zh": "到達車站",
                    "left": "駅",
                    "leftRuby": "えき",
                    "right": "着く",
                    "rightRuby": "つく"
                },
                {
                    "j": "箱に入れる",
                    "r": "はこのいれる",
                    "zh": "放進箱子裡",
                    "left": "箱",
                    "leftRuby": "はこ",
                    "right": "入れる",
                    "rightRuby": "いれる"
                },
                {
                    "j": "ゴミ箱に捨てる",
                    "r": "ごみばこにすてる",
                    "zh": "丟進垃圾桶",
                    "left": "ゴミ箱",
                    "leftRuby": "ごみばこ",
                    "right": "捨てる",
                    "rightRuby": "すてる"
                },
                {
                    "j": "黒板に字を書く",
                    "r": "こくばんにじをかく",
                    "zh": "在黑板上寫字",
                    "left": "黒板",
                    "leftRuby": "こくばん",
                    "right": "字を書く",
                    "rightRuby": "じをかく"
                },
                {
                    "j": "ベッドに寝る",
                    "r": "べっどにねる",
                    "zh": "睡在床上",
                    "left": "ベッド",
                    "leftRuby": "べっど",
                    "right": "寝る",
                    "rightRuby": "ねる"
                },
                {
                    "j": "机に置く",
                    "r": "つくえにおく",
                    "zh": "放在桌上",
                    "left": "机",
                    "leftRuby": "つくえ",
                    "right": "置く",
                    "rightRuby": "おく"
                },
                {
                    "j": "風呂に入る",
                    "r": "ふろにはいる",
                    "zh": "泡澡(進入浴缸)",
                    "left": "風呂",
                    "leftRuby": "ふろ",
                    "right": "入る",
                    "rightRuby": "はいる"
                },
                {
                    "j": "部屋に入る",
                    "r": "へやにはいる",
                    "zh": "進入房間",
                    "left": "部屋",
                    "leftRuby": "へや",
                    "right": "入る",
                    "rightRuby": "はいる"
                },
                {
                    "j": "地面に落ちる",
                    "r": "じめんにおちる",
                    "zh": "掉在地上",
                    "left": "地面",
                    "leftRuby": "じめん",
                    "right": "落ちる",
                    "rightRuby": "おちる"
                },
                {
                    "j": "カレンダーに予定を書く",
                    "r": "かれんだーによていをかく",
                    "zh": "把行程寫在日曆上",
                    "left": "カレンダー",
                    "leftRuby": "かれんだー",
                    "right": "予定を書く",
                    "rightRuby": "よていをかく"
                },
                {
                    "j": "木に登る",
                    "r": "きにのぼる",
                    "zh": "爬到樹上",
                    "left": "木",
                    "leftRuby": "き",
                    "right": "登る",
                    "rightRuby": "のぼる"
                },
                {
                    "j": "日本に着く",
                    "r": "にほんにつく",
                    "zh": "抵達日本",
                    "left": "日本",
                    "leftRuby": "にほん",
                    "right": "着く",
                    "rightRuby": "つく"
                },
                {
                    "j": "自転車に乗る",
                    "r": "じてんしゃにのる",
                    "zh": "騎(上)自行車",
                    "left": "自転車",
                    "leftRuby": "じてんしゃ",
                    "right": "乗る",
                    "rightRuby": "のる"
                },
                {
                    "j": "ソファに座る",
                    "r": "そふぁにすわる",
                    "zh": "坐在沙發",
                    "left": "ソファ",
                    "leftRuby": "そふぁ",
                    "right": "座る",
                    "rightRuby": "すわる"
                },
                {
                    "j": "棚に本を置く",
                    "r": "たなにほんをおく",
                    "zh": "把書放書架上",
                    "left": "棚",
                    "leftRuby": "たな",
                    "right": "本を置く",
                    "rightRuby": "ほんをおく"
                }
            ]
        },
        "GA_BUT": {
            "safeCombos": [
                {
                    "j": "安いが、美味しくない",
                    "r": "やすいが、おいしくない",
                    "zh": "便宜但是不好吃",
                    "left": "安い",
                    "leftRuby": "やすい",
                    "right": "美味しくない",
                    "rightRuby": "おいしくない"
                },
                {
                    "j": "高いが、いい物だ",
                    "r": "たかいが、いいものだ",
                    "zh": "貴但是好東西",
                    "left": "高い",
                    "leftRuby": "たかい",
                    "right": "いい物だ",
                    "rightRuby": "いいものだ"
                },
                {
                    "j": "小さいが、便利だ",
                    "r": "ちいさいが、べんりだ",
                    "zh": "小但是方便",
                    "left": "小さい",
                    "leftRuby": "ちいさい",
                    "right": "便利だ",
                    "rightRuby": "べんりだ"
                },
                {
                    "j": "難しいが、面白い",
                    "r": "むずかしいが、おもしろい",
                    "zh": "難但是有趣",
                    "left": "難しい",
                    "leftRuby": "むずかしい",
                    "right": "面白い",
                    "rightRuby": "おもしろい"
                },
                {
                    "j": "古いが、まだ使える",
                    "r": "ふるいが、まだつかえる",
                    "zh": "舊但是還能用",
                    "left": "古い",
                    "leftRuby": "ふるい",
                    "right": "まだ使える",
                    "rightRuby": "まだつかえる"
                },
                {
                    "j": "眠いが、勉強する",
                    "r": "ねむいが、べんきょうする",
                    "zh": "睏但還是要讀書",
                    "left": "眠い",
                    "leftRuby": "ねむい",
                    "right": "勉強する",
                    "rightRuby": "べんきょうする"
                },
                {
                    "j": "痛いが、我慢する",
                    "r": "いたいが、がまんする",
                    "zh": "痛但忍耐",
                    "left": "痛い",
                    "leftRuby": "いたい",
                    "right": "我慢する",
                    "rightRuby": "がまんする"
                },
                {
                    "j": "狭いが、きれいだ",
                    "r": "せまいが、きれいだ",
                    "zh": "窄但是乾淨",
                    "left": "狭い",
                    "leftRuby": "せまい",
                    "right": "きれいだ",
                    "rightRuby": "きれいだ"
                },
                {
                    "j": "遠いが、よく行く",
                    "r": "とおいが、よくいく",
                    "zh": "遠但常去",
                    "left": "遠い",
                    "leftRuby": "とおい",
                    "right": "よく行く",
                    "rightRuby": "よくいく"
                },
                {
                    "j": "疲れたが、終わっていない",
                    "r": "つかれたが、おわっていない",
                    "zh": "累但還沒結束",
                    "left": "疲れた",
                    "leftRuby": "つかれた",
                    "right": "終わっていない",
                    "rightRuby": "おわっていない"
                },
                {
                    "j": "遅いが、丁寧だ",
                    "r": "おそいが、ていねいだ",
                    "zh": "慢但是細心",
                    "left": "遅い",
                    "leftRuby": "おそい",
                    "right": "丁寧だ",
                    "rightRuby": "ていねいだ"
                },
                {
                    "j": "静かだが、寂しい",
                    "r": "しずかだが、さびしい",
                    "zh": "安靜但寂寞",
                    "left": "静かだ",
                    "leftRuby": "しずかだ",
                    "right": "寂しい",
                    "rightRuby": "さびしい"
                },
                {
                    "j": "近いが、行かない",
                    "r": "ちかいが、いかない",
                    "zh": "近但是不去",
                    "left": "近い",
                    "leftRuby": "ちかい",
                    "right": "行かない",
                    "rightRuby": "いかない"
                },
                {
                    "j": "好きだが、買えない",
                    "r": "すきだが、かえない",
                    "zh": "喜歡但買不起",
                    "left": "好きだ",
                    "leftRuby": "すきだ",
                    "right": "買えない",
                    "rightRuby": "かえない"
                },
                {
                    "j": "暑いが、エアコンがない",
                    "r": "あついが、えあこんがない",
                    "zh": "熱但是沒有冷氣",
                    "left": "暑い",
                    "leftRuby": "あつい",
                    "right": "エアコンがない",
                    "rightRuby": "えあこんがない"
                },
                {
                    "j": "暗いが、怖くない",
                    "r": "くらいが、こわくない",
                    "zh": "暗但是不怕",
                    "left": "暗い",
                    "leftRuby": "くらい",
                    "right": "怖くない",
                    "rightRuby": "こわくない"
                },
                {
                    "j": "重いが、大丈夫だ",
                    "r": "おもいが、だいじょうぶだ",
                    "zh": "重但是沒關係",
                    "left": "重い",
                    "leftRuby": "おもい",
                    "right": "大丈夫だ",
                    "rightRuby": "だいじょうぶだ"
                },
                {
                    "j": "少ないが、ある",
                    "r": "すくないが、ある",
                    "zh": "少但是有",
                    "left": "少ない",
                    "leftRuby": "すくない",
                    "right": "ある",
                    "rightRuby": "ある"
                },
                {
                    "j": "悪いが、仕方ない",
                    "r": "わるいが、しかたない",
                    "zh": "不好但也沒辦法",
                    "left": "悪い",
                    "leftRuby": "わるい",
                    "right": "仕方ない",
                    "rightRuby": "しかたない"
                },
                {
                    "j": "強いが、負けた",
                    "r": "つよいが、まけた",
                    "zh": "強但是輸了",
                    "left": "強い",
                    "leftRuby": "つよい",
                    "right": "負けた",
                    "rightRuby": "まけた"
                }
            ]
        },
        "MO_COMPLETE_NEGATION": {
            "safeCombos": [
                {
                    "j": "何もない",
                    "r": "なにもない",
                    "zh": "什麼都沒有",
                    "left": "何",
                    "leftRuby": "なに",
                    "right": "ない",
                    "rightRuby": "ない"
                },
                {
                    "j": "誰もいない",
                    "r": "だれもいない",
                    "zh": "誰都不在",
                    "left": "誰",
                    "leftRuby": "だれ",
                    "right": "いない",
                    "rightRuby": "いない"
                },
                {
                    "j": "どこも行かない",
                    "r": "どこもいかない",
                    "zh": "哪裡都不去",
                    "left": "どこ",
                    "leftRuby": "どこ",
                    "right": "行かない",
                    "rightRuby": "いかない"
                },
                {
                    "j": "一つもない",
                    "r": "ひとつもない",
                    "zh": "一個也沒有",
                    "left": "一つ",
                    "leftRuby": "ひとつ",
                    "right": "ない",
                    "rightRuby": "ない"
                },
                {
                    "j": "何も食べない",
                    "r": "なにもたべない",
                    "zh": "什麼都不吃",
                    "left": "何",
                    "leftRuby": "なに",
                    "right": "食べない",
                    "rightRuby": "たべない"
                },
                {
                    "j": "誰も知らない",
                    "r": "だれもしらない",
                    "zh": "誰都不知道",
                    "left": "誰",
                    "leftRuby": "だれ",
                    "right": "知らない",
                    "rightRuby": "しらない"
                },
                {
                    "j": "何も見えない",
                    "r": "なにもみえない",
                    "zh": "什麼都看不見",
                    "left": "何",
                    "leftRuby": "なに",
                    "right": "見えない",
                    "rightRuby": "みえない"
                },
                {
                    "j": "誰もこない",
                    "r": "だれもこない",
                    "zh": "誰都不會來",
                    "left": "誰",
                    "leftRuby": "だれ",
                    "right": "こない",
                    "rightRuby": "こない"
                },
                {
                    "j": "何も欲しくない",
                    "r": "なにもほしくない",
                    "zh": "什麼也不想要",
                    "left": "何",
                    "leftRuby": "なに",
                    "right": "欲しくない",
                    "rightRuby": "ほしくない"
                },
                {
                    "j": "どこもない",
                    "r": "どこもない",
                    "zh": "哪裡都沒有",
                    "left": "どこ",
                    "leftRuby": "どこ",
                    "right": "ない",
                    "rightRuby": "ない"
                },
                {
                    "j": "何もできない",
                    "r": "なにもできない",
                    "zh": "什麼都不會做",
                    "left": "何",
                    "leftRuby": "なに",
                    "right": "できない",
                    "rightRuby": "できない"
                },
                {
                    "j": "一回も行かない",
                    "r": "いっかいもいかない",
                    "zh": "一次也不去",
                    "left": "一回",
                    "leftRuby": "いっかい",
                    "right": "行かない",
                    "rightRuby": "いかない"
                },
                {
                    "j": "一冊もない",
                    "r": "いっさつもない",
                    "zh": "一本也沒有",
                    "left": "一冊",
                    "leftRuby": "いっさつ",
                    "right": "ない",
                    "rightRuby": "ない"
                },
                {
                    "j": "一人もいない",
                    "r": "ひとりもいない",
                    "zh": "一個人都沒有",
                    "left": "一人",
                    "leftRuby": "ひとり",
                    "right": "いない",
                    "rightRuby": "いない"
                },
                {
                    "j": "一日も休まない",
                    "r": "いちにちもやすまない",
                    "zh": "一天也不休息",
                    "left": "一日",
                    "leftRuby": "いちにち",
                    "right": "休まない",
                    "rightRuby": "やすまない"
                },
                {
                    "j": "これもいらない",
                    "r": "これもいらない",
                    "zh": "這個也不需要",
                    "left": "これ",
                    "leftRuby": "これ",
                    "right": "いらない",
                    "rightRuby": "いらない"
                },
                {
                    "j": "誰も話さない",
                    "r": "だれもはなさない",
                    "zh": "誰都不說話",
                    "left": "誰",
                    "leftRuby": "だれ",
                    "right": "話さない",
                    "rightRuby": "はなさない"
                },
                {
                    "j": "何も言わない",
                    "r": "なにもいわない",
                    "zh": "什麼都不說",
                    "left": "何",
                    "leftRuby": "なに",
                    "right": "言わない",
                    "rightRuby": "いわない"
                },
                {
                    "j": "少しも暑くない",
                    "r": "すこしもあつくない",
                    "zh": "一點也不熱",
                    "left": "少し",
                    "leftRuby": "すこし",
                    "right": "暑くない",
                    "rightRuby": "あつくない"
                },
                {
                    "j": "全然も面白くない",
                    "r": "ぜんぜんもおもしろくない",
                    "zh": "完全不有趣",
                    "left": "全然",
                    "leftRuby": "ぜんぜん",
                    "right": "面白くない",
                    "rightRuby": "おもしろくない"
                }
            ]
        },
        "TO_CONDITIONAL": {
            "safeCombos": [
                {
                    "j": "春になると、暖かくなる",
                    "r": "はるになると、あたたかくなる",
                    "zh": "春天一到就會變暖",
                    "left": "春になる",
                    "leftRuby": "はるになる",
                    "right": "暖かくなる",
                    "rightRuby": "あたたかくなる"
                },
                {
                    "j": "夏になると、暑くなる",
                    "r": "なつになると、あつくなる",
                    "zh": "夏天一到就會變熱",
                    "left": "夏になる",
                    "leftRuby": "なつになる",
                    "right": "暑くなる",
                    "rightRuby": "あつくなる"
                },
                {
                    "j": "秋になると、涼しくなる",
                    "r": "あきになると、すずしくなる",
                    "zh": "秋天一到就會變涼",
                    "left": "秋になる",
                    "leftRuby": "あきになる",
                    "right": "涼しくなる",
                    "rightRuby": "すずしくなる"
                },
                {
                    "j": "冬になると、寒くなる",
                    "r": "ふゆになると、さむくなる",
                    "zh": "冬天一到就會變冷",
                    "left": "冬になる",
                    "leftRuby": "ふゆになる",
                    "right": "寒くなる",
                    "rightRuby": "さむくなる"
                },
                {
                    "j": "右へ曲がると、駅がある",
                    "r": "みぎへまがると、えきがある",
                    "zh": "右轉就會有車站",
                    "left": "右へ曲がる",
                    "leftRuby": "みぎへまがる",
                    "right": "駅がある",
                    "rightRuby": "えきがある"
                },
                {
                    "j": "左へ曲がると、公園がある",
                    "r": "ひだりへまがると、こうえんがある",
                    "zh": "左轉就會有公園",
                    "left": "左へ曲がる",
                    "leftRuby": "ひだりへまがる",
                    "right": "公園がある",
                    "rightRuby": "こうえんがある"
                },
                {
                    "j": "まっすぐ行くと、デパートがある",
                    "r": "まっすぐいくと、でぱーとがある",
                    "zh": "直走就會有百貨公司",
                    "left": "まっすぐ行く",
                    "leftRuby": "まっすぐいく",
                    "right": "デパートがある",
                    "rightRuby": "でぱーとがある"
                },
                {
                    "j": "これを押すと、水が出る",
                    "r": "これをおすと、みずがでる",
                    "zh": "按這個就會出水",
                    "left": "これを押す",
                    "leftRuby": "これをおす",
                    "right": "水が出る",
                    "rightRuby": "みずがでる"
                },
                {
                    "j": "お金を入れると、切符が出る",
                    "r": "おかねをいれると、きっぷがでる",
                    "zh": "投錢就會掉車票",
                    "left": "お金を入れる",
                    "leftRuby": "おかねをいれる",
                    "right": "切符が出る",
                    "rightRuby": "きっぷがでる"
                },
                {
                    "j": "雨が降ると、道が滑る",
                    "r": "あめがふると、みちがすべる",
                    "zh": "下雨路就會滑",
                    "left": "雨が降る",
                    "leftRuby": "あめがふる",
                    "right": "道が滑る",
                    "rightRuby": "みちがすべる"
                },
                {
                    "j": "寒いと、風邪を引く",
                    "r": "さむいと、かぜをひく",
                    "zh": "冷的話會感冒",
                    "left": "寒い",
                    "leftRuby": "さむい",
                    "right": "風邪を引く",
                    "rightRuby": "かぜをひく"
                },
                {
                    "j": "食べないと、お腹がすく",
                    "r": "たべないと、おなかがすく",
                    "zh": "不吃的話肚子會餓",
                    "left": "食べない",
                    "leftRuby": "たべない",
                    "right": "お腹がすく",
                    "rightRuby": "おなかがすく"
                },
                {
                    "j": "たくさん食べると、太る",
                    "r": "たくさんたべると、ふとる",
                    "zh": "吃很多就會胖",
                    "left": "たくさん食べる",
                    "leftRuby": "たくさんたべる",
                    "right": "太る",
                    "rightRuby": "ふとる"
                },
                {
                    "j": "酒を飲むと、顔が赤くなる",
                    "r": "さけをのむと、かおがあかくなる",
                    "zh": "喝酒臉就會變紅",
                    "left": "酒を飲む",
                    "leftRuby": "さけをのむ",
                    "right": "顔が赤くなる",
                    "rightRuby": "かおがあかくなる"
                },
                {
                    "j": "年をとると、目が悪くなる",
                    "r": "としをとると、めがわるくなる",
                    "zh": "年紀大視力就會變差",
                    "left": "年をとる",
                    "leftRuby": "としをとる",
                    "right": "目が悪くなる",
                    "rightRuby": "めがわるくなる"
                },
                {
                    "j": "スイッチを入れると、電気がつく",
                    "r": "すいっちをいれると、でんきがつく",
                    "zh": "打開開關燈就會亮",
                    "left": "スイッチを入れる",
                    "leftRuby": "すいっちをいれる",
                    "right": "電気がつく",
                    "rightRuby": "でんきがつく"
                },
                {
                    "j": "朝になると、明るくなる",
                    "r": "あさになると、あかるくなる",
                    "zh": "一到早上就會變亮",
                    "left": "朝になる",
                    "leftRuby": "あさになる",
                    "right": "明るくなる",
                    "rightRuby": "あかるくなる"
                },
                {
                    "j": "夜になると、暗くなる",
                    "r": "よるになると、くらくなる",
                    "zh": "一到晚上就會變暗",
                    "left": "夜になる",
                    "leftRuby": "よるになる",
                    "right": "暗くなる",
                    "rightRuby": "くらくなる"
                },
                {
                    "j": "窓を開けると、風が入る",
                    "r": "まどをあけると、かぜがはいる",
                    "zh": "開窗風就會進來",
                    "left": "窓を開ける",
                    "leftRuby": "まどをあける",
                    "right": "風が入る",
                    "rightRuby": "かぜがはいる"
                },
                {
                    "j": "休むと、よくなる",
                    "r": "やすむと、よくなる",
                    "zh": "休息一下就會好轉",
                    "left": "休む",
                    "leftRuby": "やすむ",
                    "right": "よくなる",
                    "rightRuby": "よくなる"
                }
            ]
        },
        "NI_TARGET": {
            "safeCombos": [
                {
                    "j": "先生に聞く",
                    "r": "せんせいにきく",
                    "zh": "問老師",
                    "left": "先生",
                    "leftRuby": "せんせい",
                    "right": "聞く",
                    "rightRuby": "きく"
                },
                {
                    "j": "母に電話する",
                    "r": "ははにでんわする",
                    "zh": "打電話給媽媽",
                    "left": "母",
                    "leftRuby": "はは",
                    "right": "電話する",
                    "rightRuby": "でんわする"
                },
                {
                    "j": "友達に手紙を書く",
                    "r": "ともだちにてがみをかく",
                    "zh": "寫信給朋友",
                    "left": "友達",
                    "leftRuby": "ともだち",
                    "right": "手紙を書く",
                    "rightRuby": "てがみをかく"
                },
                {
                    "j": "兄に言う",
                    "r": "あににいう",
                    "zh": "跟哥哥說",
                    "left": "兄",
                    "leftRuby": "あに",
                    "right": "言う",
                    "rightRuby": "いう"
                },
                {
                    "j": "姉に話す",
                    "r": "あねにはなす",
                    "zh": "跟姐姐說",
                    "left": "姉",
                    "leftRuby": "あね",
                    "right": "話す",
                    "rightRuby": "はなす"
                },
                {
                    "j": "父に説明する",
                    "r": "ちちにせつめいする",
                    "zh": "向爸爸說明",
                    "left": "父",
                    "leftRuby": "ちち",
                    "right": "説明する",
                    "rightRuby": "せつめいする"
                },
                {
                    "j": "家族にメールする",
                    "r": "かぞくにめーるする",
                    "zh": "發郵件給家人",
                    "left": "家族",
                    "leftRuby": "かぞく",
                    "right": "メールする",
                    "rightRuby": "めーるする"
                },
                {
                    "j": "彼女にプレゼントする",
                    "r": "かのじょにぷれぜんとする",
                    "zh": "送禮物給女朋友",
                    "left": "彼女",
                    "leftRuby": "かのじょ",
                    "right": "プレゼントする",
                    "rightRuby": "ぷれぜんとする"
                },
                {
                    "j": "彼氏に電話する",
                    "r": "かれしにでんわする",
                    "zh": "打電話給男朋友",
                    "left": "彼氏",
                    "leftRuby": "かれし",
                    "right": "電話する",
                    "rightRuby": "でんわする"
                },
                {
                    "j": "田中さんに聞く",
                    "r": "たなかさんにきく",
                    "zh": "問田中先生",
                    "left": "田中さん",
                    "leftRuby": "たなかさん",
                    "right": "聞く",
                    "rightRuby": "きく"
                },
                {
                    "j": "弟に教える",
                    "r": "おとうとにおしえる",
                    "zh": "教弟弟",
                    "left": "弟",
                    "leftRuby": "おとうと",
                    "right": "教える",
                    "rightRuby": "おしえる"
                },
                {
                    "j": "猫に餌をやる",
                    "r": "ねこにえさをやる",
                    "zh": "餵貓",
                    "left": "猫",
                    "leftRuby": "ねこ",
                    "right": "餌をやる",
                    "rightRuby": "えさをやる"
                },
                {
                    "j": "店員に頼む",
                    "r": "てんいんにたのむ",
                    "zh": "拜託店員",
                    "left": "店員",
                    "leftRuby": "てんいん",
                    "right": "頼む",
                    "rightRuby": "たのむ"
                },
                {
                    "j": "友達に相談する",
                    "r": "ともだちにそうだんする",
                    "zh": "找朋友商量",
                    "left": "友達",
                    "leftRuby": "ともだち",
                    "right": "相談する",
                    "rightRuby": "そうだんする"
                },
                {
                    "j": "警察に言う",
                    "r": "けいさつにいう",
                    "zh": "告訴警察",
                    "left": "警察",
                    "leftRuby": "けいさつ",
                    "right": "言う",
                    "rightRuby": "いう"
                },
                {
                    "j": "子供に見せる",
                    "r": "こどもにみせる",
                    "zh": "給小孩子看",
                    "left": "子供",
                    "leftRuby": "こども",
                    "right": "見せる",
                    "rightRuby": "みせる"
                },
                {
                    "j": "お客様に挨拶する",
                    "r": "おきゃくさまにあいさつする",
                    "zh": "向客人打招呼",
                    "left": "お客様",
                    "leftRuby": "おきゃくさま",
                    "right": "挨拶する",
                    "rightRuby": "あいさつする"
                },
                {
                    "j": "先生に質問する",
                    "r": "せんせいにしつもんする",
                    "zh": "向老師提問",
                    "left": "先生",
                    "leftRuby": "せんせい",
                    "right": "質問する",
                    "rightRuby": "しつもんする"
                },
                {
                    "j": "後輩に教える",
                    "r": "こうはいにおしえる",
                    "zh": "教導晚輩",
                    "left": "後輩",
                    "leftRuby": "こうはい",
                    "right": "教える",
                    "rightRuby": "おしえる"
                },
                {
                    "j": "先輩に貰う",
                    "r": "せんぱいにもらう",
                    "zh": "從前輩那收到",
                    "left": "先輩",
                    "leftRuby": "せんぱい",
                    "right": "貰う",
                    "rightRuby": "もらう"
                }
            ]
        }
    }
};
