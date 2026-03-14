/**
 * JPAPP Early Game Data & Safe Pools (v1)
 * This file contains static data extracted from game.js to improve maintainability.
 * It is loaded globally as EARLY_GAME_POOLS.
 */

window.EARLY_GAME_POOLS = {
    // Gameplay constants formerly hardcoded in game.setup()
    config: {
        MONSTER_NAMES: { 1: '助詞怪', 2: '助詞妖', 3: '助詞魔王' },
        MONSTER_HP: 100,
        GOLD_PER_HIT: 10,
        EXP_PER_HIT: 15,
        POTION_HP: 30,
        INITIAL_POTIONS: 3,
        COMBO_PERFECT: 3,
        PASS_SCORE: 0,
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
            20: { blanks: 1, types: [0, 1, 2, 3, 4, 5], title: '【魔王關】魔王複習關 4', isBoss: true }
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
        NO_POSSESSIVE: {
            safePeople: [
                { j: "私", r: "わたし", zh: "我", tags: ["person"] },
                { j: "あなた", r: "あなた", zh: "你", tags: ["person"] },
                { j: "母", r: "はは", zh: "媽媽", tags: ["person"] },
                { j: "友達", r: "ともだち", zh: "朋友", tags: ["person"] },
                { j: "先生", r: "せんせい", zh: "老師", tags: ["person"] },
                { j: "田中さん", r: "たなかさん", zh: "田中先生", tags: ["person"] }
            ],
            safePlaces: [
                { j: "家", r: "いえ", zh: "家" },
                { j: "学校", r: "がっこう", zh: "學校" },
                { j: "教室", r: "きょうしつ", zh: "教室" },
                { j: "図書館", r: "としょかん", zh: "圖書館" },
                { j: "部屋", r: "へや", zh: "房間" },
                { j: "庭", r: "にわ", zh: "庭院" },
                { j: "公園", r: "こうえん", zh: "公園" },
                { j: "駅", r: "えき", zh: "車站" }
            ],
            safeOwnedObjects: [
                { j: "本", r: "ほん", zh: "書", ownable: true },
                { j: "名刺", r: "めいし", zh: "名片", ownable: true },
                { j: "かばん", r: "かばん", zh: "包包", ownable: true },
                { j: "ノート", r: "ノート", zh: "筆記本", ownable: true },
                { j: "ペン", r: "ペン", zh: "筆", ownable: true },
                { j: "傘", r: "かさ", zh: "傘", ownable: true },
                { j: "車", r: "くるま", zh: "車", ownable: true },
                { j: "靴", r: "くつ", zh: "鞋子", ownable: true }
            ],
            safePlacedObjects: [
                { j: "本", r: "ほん", zh: "書", placeable: true },
                { j: "いす", r: "いす", zh: "椅子", placeable: true },
                { j: "机", r: "つくえ", zh: "桌子", placeable: true },
                { j: "かばん", r: "かばん", zh: "包包", placeable: true },
                { j: "ドア", r: "ドア", zh: "門", placeable: true },
                { j: "窓", r: "まど", zh: "窗戶", placeable: true },
                { j: "花瓶", r: "かびん", zh: "花瓶", placeable: true }
            ]
        },
        WA_TOPIC_BASIC: {
            safePeople: [
                { j: "私", r: "わたし", zh: "我", tags: ["person"] },
                { j: "あなた", r: "あなた", zh: "你", tags: ["person"] },
                { j: "母", r: "はは", zh: "媽媽", tags: ["person"] },
                { j: "友達", r: "ともだち", zh: "朋友", tags: ["person"] },
                { j: "先生", r: "せんせい", zh: "老師", tags: ["person"] },
                { j: "田中さん", r: "たなかさん", zh: "田中先生", tags: ["person"] }
            ],
            timePool: [
                { j: "今日", r: "きょう", zh: "今天", tags: ["time"] },
                { j: "明日", r: "あした", zh: "明天", tags: ["time"] },
                { j: "週末", r: "しゅうまつ", zh: "週末", tags: ["time"] },
                { j: "日曜日", r: "にちようび", zh: "星期日", tags: ["time"] }
            ],
            identityPool: [
                { j: "学生", r: "がくせい", zh: "學生", tags: ["role"] },
                { j: "医者", r: "いしゃ", zh: "醫生", tags: ["role"] },
                { j: "先生", r: "せんせい", zh: "老師", tags: ["role"] },
                { j: "日本人", r: "にほんじん", zh: "日本人", tags: ["role"] },
                { j: "一年生", r: "いちねんせい", zh: "一年級生", tags: ["role"] }
            ],
            statePool: [
                { j: "休み", r: "やすみ", zh: "休息日", tags: ["state"] },
                { j: "晴れ", r: "はれ", zh: "晴天", tags: ["state"] },
                { j: "いい天気", r: "いいてんき", zh: "好天氣", tags: ["state"] },
                { j: "曇り", r: "くもり", zh: "陰天", tags: ["state"] },
                { j: "雨", r: "あめ", zh: "雨天", tags: ["state"] }
            ]
        },
        GA_INTRANSITIVE: {
            safeCombos: [
                { n: { j: "雨", r: "あめ", zh: "雨", kind: "precip" }, v: { j: "降る", r: "ふる", zh: "下", kinds: ["precip"] } },
                { n: { j: "雪", r: "ゆき", zh: "雪", kind: "precip" }, v: { j: "降る", r: "ふる", zh: "下", kinds: ["precip"] } },
                { n: { j: "問題", r: "もんだい", zh: "出問題了", kind: "event" }, v: { j: "起きる", r: "おきる", zh: " ", kinds: ["event"] } },
                { n: { j: "ドア", r: "ドア", zh: "門", kind: "door" }, v: { j: "開く", r: "あく", zh: "開了", kinds: ["door"] } },
                { n: { j: "電気", r: "でんき", zh: "燈", kind: "light" }, v: { j: "消える", r: "きえる", zh: "熄了", kinds: ["light"] } },
                { n: { j: "電気", r: "でんき", zh: "燈", kind: "light" }, v: { j: "つく", r: "つく", zh: "點亮", kinds: ["light"] } },
                { n: { j: "空", r: "そら", zh: "天空", kind: "sky" }, v: { j: "曇る", r: "くもる", zh: "轉陰", kinds: ["sky"] } },
                { n: { j: "風", r: "かぜ", zh: "起風了", kind: "wind" }, v: { j: "吹く", r: "ふく", zh: " ", kinds: ["wind"] } },
                { n: { j: "花", r: "はな", zh: "花", kind: "flower" }, v: { j: "咲く", r: "さく", zh: "開了", kinds: ["flower"] } },
                { n: { j: "巴士", r: "バス", zh: "巴士", kind: "vehicle" }, v: { j: "止まる", r: "とまる", zh: "停下", kinds: ["vehicle"] } },
                { n: { j: "鐘", r: "かね", zh: "鐘聲", kind: "sound" }, v: { j: "鳴る", r: "なる", zh: "響了", kinds: ["sound"] } },
                { n: { j: "水", r: "みず", zh: "水", kind: "liquid" }, v: { j: "流れる", r: "ながれる", zh: "在流", kinds: ["liquid"] } },
                { n: { j: "星", r: "ほし", zh: "看得見", kind: "percep" }, v: { j: "見える", r: "みえる", zh: "星星", kinds: ["percep"] } },
                { n: { j: "音", r: "おと", zh: "聽得到", kind: "percep" }, v: { j: "聞こえる", r: "きこえる", zh: "聲音", kinds: ["percep"] } }
            ]
        },
        WO_OBJECT_BASIC: {
            basicCombos: [
                { o: { j: "本", r: "ほん", zh: "書" }, v: { j: "読む", r: "よむ", zh: "讀", kind: "read", vt: true } },
                { o: { j: "手紙", r: "てがみ", zh: "信" }, v: { j: "読む", r: "よむ", zh: "讀", kind: "read", vt: true } },
                { o: { j: "ご飯", r: "ごはん", zh: "飯" }, v: { j: "食べる", r: "たべる", zh: "吃", kind: "eat", vt: true } },
                { o: { j: "パン", r: "パン", zh: "麵包" }, v: { j: "食べる", r: "たべる", zh: "吃", kind: "eat", vt: true } },
                { o: { j: "昼ご飯", r: "ひるごはん", zh: "午飯" }, v: { j: "食べる", r: "たべる", zh: "吃", kind: "eat", vt: true } },
                { o: { j: "水", r: "みず", zh: "水" }, v: { j: "飲む", r: "のむ", zh: "喝", kind: "drink", vt: true } },
                { o: { j: "お茶", r: "おちゃ", zh: "茶" }, v: { j: "飲む", r: "のむ", zh: "喝", kind: "drink", vt: true } },
                { o: { j: "音楽", r: "おんがく", zh: "音樂" }, v: { j: "聞く", r: "きく", zh: "聽", kind: "listen", vt: true } },
                { o: { j: "ラジオ", r: "ラジオ", zh: "廣播" }, v: { j: "聞く", r: "きく", zh: "聽", kind: "listen", vt: true } },
                { o: { j: "映画", r: "えいが", zh: "電影" }, v: { j: "見る", r: "みる", zh: "看", kind: "watch", vt: true } },
                { o: { j: "アニメ", r: "あにめ", zh: "動畫" }, v: { j: "見る", r: "みる", zh: "看", kind: "watch", vt: true } },
                { o: { j: "テレビ", r: "てれび", zh: "電視" }, v: { j: "見る", r: "みる", zh: "看", kind: "watch", vt: true } },
                { o: { j: "写真", r: "しゃしん", zh: "照片" }, v: { j: "撮る", r: "とる", zh: "拍", kind: "photo", vt: true } },
                { o: { j: "宿題", r: "しゅくだい", zh: "作業" }, v: { j: "する", r: "する", zh: "做", kind: "do", vt: true } },
                { o: { j: "買い物", r: "かいもの", zh: "購物" }, v: { j: "する", r: "する", zh: "做", kind: "do", vt: true } },
                { o: { j: "服", r: "ふく", zh: "衣服" }, v: { j: "洗う", r: "あらう", zh: "洗", kind: "wash", vt: true } }
            ]
        },
        NI_TIME: {
            timePool: [
                { j: "6時", r: "ろくじ", zh: "六點" },
                { j: "7時", r: "しちじ", zh: "七點" },
                { j: "8時", r: "はちじ", zh: "八點" },
                { j: "9時", r: "くじ", zh: "九點" },
                { j: "6時半", r: "ろくじはん", zh: "六點半" },
                { j: "7時半", r: "しちじはん", zh: "七點半" }
            ],
            movePool: [
                { j: "行く", r: "いく", zh: "去" },
                { j: "来る", r: "くる", zh: "來" },
                { j: "寝る", r: "ねる", zh: "睡覺" },
                { j: "起きる", r: "おきる", zh: "起床" },
                { j: "勉強する", r: "べんきょうする", zh: "讀書" }
            ]
        },
        HE_DIRECTION: {
            // 採用「完整句白名單」模式，確保語感絕對自然並消除爭議
            // 不再使用隨機組合，改為固定配對
            safeCombos: [
                { j: "学校", r: "がっこう", v: "行く", vr: "いく", zh: "去學校" },
                { j: "図書室", r: "としょしつ", v: "行く", vr: "いく", zh: "去圖書室" },
                { j: "駅", r: "えき", v: "行く", vr: "いく", zh: "去車站" },
                { j: "家", r: "いえ", v: "帰る", vr: "かえる", zh: "回家" },
                { j: "うち", r: "うち", v: "帰る", vr: "かえる", zh: "回家" },
                { j: "家", r: "いえ", v: "来る", vr: "くる", zh: "來家裡" },
                { j: "うち", r: "うち", v: "来る", vr: "くる", zh: "來家裡" },
                { j: "右", r: "みぎ", v: "曲がる", vr: "まがる", zh: "向右轉" },
                { j: "左", r: "ひだり", v: "曲がる", vr: "まがる", zh: "向左轉" },
                { j: "前", r: "まえ", v: "進む", vr: "すすむ", zh: "向前前進" },
                { j: "前", r: "まえ", v: "向かう", vr: "むかう", zh: "朝前方前進" },
                { j: "前", r: "まえ", v: "来る", vr: "くる", zh: "到前面來" }
            ]
        },
        MO_ALSO_BASIC: {
            personPool: [
                { j: "私", r: "わたし", zh: "我", tags: ["person"] },
                { j: "あなた", r: "あなた", zh: "你", tags: ["person"] },
                { j: "田中さん", r: "たなかさん", zh: "田中先生", tags: ["person"] },
                { j: "母", r: "はは", zh: "媽媽", tags: ["person"] }
            ],
            identityPool: [
                { j: "学生", r: "がくせい", zh: "學生", tags: ["role"] },
                { j: "一年生", r: "いちねんせい", zh: "一年級生", tags: ["role"] },
                { j: "先生", r: "せんせい", zh: "老師", tags: ["role"] }
            ],
            verbPool: [
                { j: "行く", r: "いく", polite: "行きます", politer: "いきます", zh: "去" },
                { j: "来る", r: "くる", polite: "来ます", politer: "きます", zh: "來" },
                { j: "遊ぶ", r: "あそぶ", polite: "遊びます", politer: "あそびます", zh: "玩" },
                { j: "食べる", r: "たべる", polite: "食べます", politer: "たべます", zh: "吃" },
                { j: "見る", r: "みる", polite: "見ます", politer: "みます", zh: "看" }
            ]
        },
        DE_ACTION_PLACE: {
            safeCombos: [
                { p: { j: "図書館", r: "としょかん", zh: "圖書館" }, v: { j: "勉強します", r: "べんきょうします", zh: "讀書" } },
                { p: { j: "家", r: "いえ", zh: "家" }, v: { j: "休みます", r: "やすみます", zh: "休息" } },
                { p: { j: "公園", r: "こうえん", zh: "公園" }, v: { j: "遊びます", r: "あそびます", zh: "玩耍" } },
                { p: { j: "カフェ", r: "かふぇ", zh: "咖啡廳" }, v: { j: "飲みます", r: "のみます", zh: "喝東西" } },
                { p: { j: "教室", r: "きょうしつ", zh: "教室" }, v: { j: "勉強します", r: "べんきょうします", zh: "讀書" } },
                { p: { j: "部屋", r: "へや", zh: "房間" }, v: { j: "音楽を聴きます", r: "おんがくをききます", zh: "聽音樂" } }
            ]
        },
        TO_WITH: {
            people: [
                { j: "友達", r: "ともだち", zh: "朋友" },
                { j: "先生", r: "せんせい", zh: "老師" },
                { j: "家族", r: "かぞく", zh: "家人" },
                { j: "母", r: "はは", zh: "媽媽" },
                { j: "父", r: "ちち", zh: "爸爸" }
            ],
            actions: [
                { j: "話します", r: "はなします", zh: "說話" },
                { j: "遊びます", r: "あそびます", zh: "玩耍" },
                { j: "食べます", r: "たべます", zh: "吃飯" },
                { j: "行きます", r: "いきます", zh: "去" }
            ]
        },
        NI_EXIST_PLACE: {
            safeCombos: [
                { p: { j: "部屋", r: "へや", zh: "房間" }, n: { j: "猫", r: "ねこ", zh: "貓", existType: 'person' } },
                { p: { j: "教室", r: "きょうしつ", zh: "教室" }, n: { j: "学生", r: "がくせい", zh: "學生", existType: 'person' } },
                { p: { j: "机の上", r: "つくえのうえ", zh: "桌上" }, n: { j: "本", r: "ほん", zh: "書", existType: 'thing' } },
                { p: { j: "かばんの中", r: "かばんのなか", zh: "包包裡" }, n: { j: "鍵", r: "かぎ", zh: "鑰匙", existType: 'thing' } },
                { p: { j: "庭", r: "にわ", zh: "院子" }, n: { j: "犬", r: "いぬ", zh: "狗", existType: 'person' } },
                { p: { j: "箱の中", r: "はこのなか", zh: "箱子裡" }, n: { j: "写真", r: "しゃしん", zh: "照片", existType: 'thing' } }
            ]
        },
        GA_EXIST_SUBJECT: {
            nouns: [
                { j: "猫", r: "ねこ", zh: "貓", existType: 'person' },
                { j: "犬", r: "いぬ", zh: "狗", existType: 'person' },
                { j: "本", r: "ほん", zh: "書", existType: 'thing' },
                { j: "鍵", r: "かぎ", zh: "鑰匙", existType: 'thing' },
                { j: "パン", r: "ぱん", zh: "麵包", existType: 'thing' },
                { j: "水", r: "みず", zh: "水", existType: 'thing' },
                { j: "先生", r: "せんせい", zh: "老師", existType: 'person' },
                { j: "友達", r: "ともだち", zh: "朋友", existType: 'person' }
            ]
        },
        KARA_FROM: {
            timePool: [
                { j: "9時", r: "くじ", zh: "九點" },
                { j: "明日", r: "あした", zh: "明天" },
                { j: "今日", r: "きょう", zh: "今天" },
                { j: "昨日", r: "きのう", zh: "昨天" },
                { j: "月曜日", r: "げつようび", zh: "星期一" }
            ],
            placePool: [
                { j: "家", r: "いえ", zh: "家" },
                { j: "会社", r: "かいしゃ", zh: "公司" },
                { j: "台湾", r: "たいわん", zh: "台灣" },
                { j: "学校", r: "がっこう", zh: "學校" },
                { j: "駅", r: "えき", zh: "車站" }
            ]
        },
        KARA_SOURCE_START: {
            timePool: [
                { j: "九時", r: "くじ", zh: "九點" },
                { j: "朝", r: "あさ", zh: "早上" },
                { j: "月曜日", r: "げつようび", zh: "星期一" },
                { j: "今日", r: "きょう", zh: "今天" }
            ],
            placePool: [
                { j: "家", r: "いえ", zh: "家" },
                { j: "学校", r: "がっこう", zh: "學校" },
                { j: "駅", r: "えき", zh: "車站" },
                { j: "台北", r: "たいぺい", zh: "台北" },
                { j: "教室", r: "きょうしつ", zh: "教室" }
            ],
            verbs: [
                { j: "行く", r: "いく", zh: "去" },
                { j: "来る", r: "くる", zh: "來" },
                { j: "始まる", r: "はじまる", zh: "開始" },
                { j: "勉強する", r: "べんきょうする", zh: "讀書" },
                { j: "出る", r: "でる", zh: "出去" }
            ],
            safeCombos: [
                { j: "家から学校へ行く", r: "いえからがっこうへいく", zh: "從家去學校" },
                { j: "九時から始まる", r: "くじからはじまる", zh: "從九點開始" },
                { j: "台北から来る", r: "たいぺいからくる", zh: "從台北來" },
                { j: "月曜日から勉強する", r: "げつようびからべんきょうする", zh: "從星期一开始讀書" },
                { j: "教室から出る", r: "きょうしつからでる", zh: "從教室出去" }
            ]
        },
        MADE_LIMIT_END: {
            timePool: [
                { j: "三時", r: "さんじ", zh: "三點" },
                { j: "夜", r: "よる", zh: "晚上" },
                { j: "金曜日", r: "きんようび", zh: "星期五" }
            ],
            placePool: [
                { j: "駅", r: "えき", zh: "車站" },
                { j: "学校", r: "がっこう", zh: "學校" },
                { j: "家", r: "いえ", zh: "家" },
                { j: "山の上", r: "やまのうえ", zh: "山上" }
            ],
            verbs: [
                { j: "歩く", r: "あるく", zh: "走路" },
                { j: "行く", r: "いく", zh: "去" },
                { j: "帰る", r: "かえる", zh: "回家" },
                { j: "勉強する", r: "べんきょうする", zh: "讀書" },
                { j: "待つ", r: "まつ", zh: "等待" },
                { j: "登る", r: "のぼる", zh: "攀登" }
            ],
            safeCombos: [
                { j: "駅まで歩く", r: "えきまであるく", zh: "走到車站" },
                { j: "三時まで勉強する", r: "さんじまでべんきょうする", zh: "讀書到三點" },
                { j: "家まで帰る", r: "いえまでかえる", zh: "回到家" },
                { j: "金曜日まで待つ", r: "きんようびまでまつ", zh: "等到星期五" },
                { j: "山の上まで登る", r: "やまのうえまでのぼる", zh: "攀登到山上" }
            ]
        },
        TO_COMPANION: {
            people: [
                { j: "友達", r: "ともだち", zh: "朋友" },
                { j: "家族", r: "かぞく", zh: "家人" },
                { j: "先生", r: "せんせい", zh: "老師" },
                { j: "母", r: "はは", zh: "媽媽" },
                { j: "兄", r: "あに", zh: "哥哥" }
            ],
            actions: [
                { j: "遊ぶ", r: "あそぶ", zh: "玩耍" },
                { j: "食べる", r: "たべる", zh: "吃飯" },
                { j: "話す", r: "はなす", zh: "說話" },
                { j: "買い物する", r: "かいものする", zh: "購物" },
                { j: "映画を見る", r: "えいがをみる", zh: "看電影" },
                { j: "ゲームをする", r: "ゲームをする", zh: "玩遊戲" }
            ]
        },
        DE_TOOL_MEANS: {
            tools: [
                { j: "箸", r: "はし", zh: "筷子" },
                { j: "スプーン", r: "スプーン", zh: "湯匙" },
                { j: "ペン", r: "ペン", zh: "筆" },
                { j: "ナイフ", r: "ナイフ", zh: "刀子" },
                { j: "パソコン", r: "パソコン", zh: "電腦" }
            ],
            languages: [
                { j: "日本語", r: "にほんご", zh: "日語" },
                { j: "英語", r: "えいご", zh: "英語" }
            ],
            transport: [
                { j: "バス", r: "バス", zh: "巴士" },
                { j: "電車", r: "でんしゃ", zh: "電車" },
                { j: "自転車", r: "じてんしゃ", zh: "自行車" },
                { j: "車", r: "くるま", zh: "車" }
            ],
            safeCombos: [
                { j: "箸で食べる", r: "はしでたべる", zh: "用筷子吃" },
                { j: "日本語で話す", r: "にほんごではなす", zh: "用日語說話" },
                { j: "バスで行く", r: "バスでいく", zh: "搭巴士去" },
                { j: "ペンで書く", r: "ペンでかく", zh: "用筆寫" },
                { j: "英語で説明する", r: "えいごでせつめいする", zh: "用英語說明" }
            ]
        }
    }
};
