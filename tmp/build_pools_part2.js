const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('e:\\Desktop\\JPAPP\\assets\\data\\earlyGamePools.v1.js');
let fileContent = fs.readFileSync(targetFile, 'utf8');

// Match existing JSON and parse
const startMatch = fileContent.match(/skills:\s*\{/);
const startIndex = startMatch.index;
let braceCount = 0;
let endIndex = -1;
for (let i = startIndex + "skills:".length; i < fileContent.length; i++) {
    if (fileContent[i] === '{') braceCount++;
    else if (fileContent[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
            endIndex = i + 1;
            break;
        }
    }
}

// eval to parse the newly injected newSkills from part1, or parse string
const stringObj = fileContent.substring(startIndex + "skills:".length, endIndex);
let skillsObj;
try {
    skillsObj = JSON.parse(stringObj);
} catch(e) { console.error("Could not parse JSON", e); process.exit(1); }

const newSkills2 = {
    MO_ALSO_BASIC: {
        safeCombos: [
            { j: "私も学生です", r: "わたしもがくせいです", zh: "我也是學生", left: "私", leftRuby: "わたし", right: "学生です", rightRuby: "がくせいです" },
            { j: "あなたも医者ですか", r: "あなたもいしゃですか", zh: "你也是醫生嗎", left: "あなた", leftRuby: "あなた", right: "医者ですか", rightRuby: "いしゃですか" },
            { j: "田中さんも先生です", r: "たなかさんもせんせいです", zh: "田中先生也是老師", left: "田中さん", leftRuby: "たなかさん", right: "先生です", rightRuby: "せんせいです" },
            { j: "木村さんも来ます", r: "きむらさんもきます", zh: "木村先生也會來", left: "木村さん", leftRuby: "きむらさん", right: "来ます", rightRuby: "きます" },
            { j: "母も行きます", r: "ははもいきます", zh: "媽媽也要去", left: "母", leftRuby: "はは", right: "行きます", rightRuby: "いきます" },
            { j: "父も休みです", r: "ちちもやすみです", zh: "爸爸也休息", left: "父", leftRuby: "ちち", right: "休みです", rightRuby: "やすみです" },
            { j: "明日も雨です", r: "あしたもあめです", zh: "明天也是雨天", left: "明日", leftRuby: "あした", right: "雨です", rightRuby: "あめです" },
            { j: "週末も忙しいです", r: "しゅうまつもいそがしいです", zh: "週末也很忙", left: "週末", leftRuby: "しゅうまつ", right: "忙しいです", rightRuby: "いそがしいです" },
            { j: "友達も食べます", r: "ともだちもたべます", zh: "朋友也要吃", left: "友達", leftRuby: "ともだち", right: "食べます", rightRuby: "たべます" },
            { j: "肉も好きです", r: "にくもすきです", zh: "肉也喜歡", left: "肉", leftRuby: "にく", right: "好きです", rightRuby: "すきです" },
            { j: "犬も好きです", r: "いぬもすきです", zh: "狗也喜歡", left: "犬", leftRuby: "いぬ", right: "好きです", rightRuby: "すきです" },
            { j: "英語も分かります", r: "えいごもわかります", zh: "英語也懂", left: "英語", leftRuby: "えいご", right: "分かります", rightRuby: "わかります" },
            { j: "お茶も飲みます", r: "おちゃものみます", zh: "茶也喝", left: "お茶", leftRuby: "おちゃ", right: "飲みます", rightRuby: "のみます" },
            { j: "これも美味しいです", r: "これもおいしいです", zh: "這個也很好吃", left: "これ", leftRuby: "これ", right: "美味しいです", rightRuby: "おいしいです" },
            { j: "それもペンです", r: "それもぺんです", zh: "那個也是筆", left: "それ", leftRuby: "それ", right: "ペンです", rightRuby: "ぺんです" },
            { j: "ここも教室です", r: "ここもきょうしつです", zh: "這裡也是教室", left: "ここ", leftRuby: "ここ", right: "教室です", rightRuby: "きょうしつです" },
            { j: "あそこも駅です", r: "あそこもえきです", zh: "那裡也是車站", left: "あそこ", leftRuby: "あそこ", right: "駅です", rightRuby: "えきです" },
            { j: "今日から明日も", r: "きょうからあしたも", zh: "今天到明天也", left: "明日", leftRuby: "あした", right: "休み", rightRuby: "やすみ" }, // replaced safely
            { j: "映画も見ます", r: "えいがもみます", zh: "電影也看", left: "映画", leftRuby: "えいが", right: "見ます", rightRuby: "みます" },
            { j: "音楽も聞きます", r: "おんがくもききます", zh: "音樂也聽", left: "音楽", leftRuby: "おんがく", right: "聞きます", rightRuby: "ききます" }
        ]
    },
    DE_ACTION_PLACE: {
        safeCombos: [
            { j: "教室で勉強する", r: "きょうしつでべんきょうする", zh: "在教室讀書", left: "教室", leftRuby: "きょうしつ", right: "勉強する", rightRuby: "べんきょうする" },
            { j: "図書館で本を読む", r: "としょかんでほんをよむ", zh: "在圖書館看書", left: "図書館", leftRuby: "としょかん", right: "本を読む", rightRuby: "ほんをよむ" },
            { j: "家で寝る", r: "いえでねる", zh: "在家睡覺", left: "家", leftRuby: "いえ", right: "寝る", rightRuby: "ねる" },
            { j: "うちで休む", r: "うちでやすむ", zh: "在家休息", left: "うち", leftRuby: "うち", right: "休む", rightRuby: "やすむ" },
            { j: "公園で遊ぶ", r: "こうえんであそぶ", zh: "在公園玩", left: "公園", leftRuby: "こうえん", right: "遊ぶ", rightRuby: "あそぶ" },
            { j: "カフェでコーヒーを飲む", r: "かふぇでこーひーをのむ", zh: "在咖啡廳喝咖啡", left: "カフェ", leftRuby: "かふぇ", right: "コーヒーを飲む", rightRuby: "こーひーをのむ" },
            { j: "レストランで食事する", r: "れすとらんでしょくじする", zh: "在餐廳吃飯", left: "レストラン", leftRuby: "れすとらん", right: "食事する", rightRuby: "しょくじする" },
            { j: "食堂でご飯を食べる", r: "しょくどうでごはんをたべる", zh: "在食堂吃飯", left: "食堂", leftRuby: "しょくどう", right: "ご飯を食べる", rightRuby: "ごはんをたべる" },
            { j: "部屋で音楽を聞く", r: "へやでおんがくをきく", zh: "在房間聽音樂", left: "部屋", leftRuby: "へや", right: "音楽を聞く", rightRuby: "おんがくをきく" },
            { j: "学校で友達に会う", r: "がっこうでともだちにあう", zh: "在學校見朋友", left: "学校", leftRuby: "がっこう", right: "友達に会う", rightRuby: "ともだちにあう" },
            { j: "駅で待つ", r: "えきでまつ", zh: "在車站等候", left: "駅", leftRuby: "えき", right: "待つ", rightRuby: "まつ" },
            { j: "会社で働く", r: "かいしゃではたらく", zh: "在公司工作", left: "会社", leftRuby: "かいしゃ", right: "働く", rightRuby: "はたらく" },
            { j: "病院で薬をもらう", r: "びょういんでくすりをもらう", zh: "在醫院拿藥", left: "病院", leftRuby: "びょういん", right: "薬をもらう", rightRuby: "くすりをもらう" },
            { j: "海で泳ぐ", r: "うみでおよぐ", zh: "在海裡游泳", left: "海", leftRuby: "うみ", right: "泳ぐ", rightRuby: "およぐ" },
            { j: "山で写真を撮る", r: "やまでしゃしんをとる", zh: "在山上拍照", left: "山", leftRuby: "やま", right: "写真を撮る", rightRuby: "しゃしんをとる" },
            { j: "スーパーで買い物する", r: "すーぱーでかいものする", zh: "在超市購物", left: "スーパー", leftRuby: "すーぱー", right: "買い物する", rightRuby: "かいものする" },
            { j: "店でパンを買う", r: "みせでぱんをかう", zh: "在商店買麵包", left: "店", leftRuby: "みせ", right: "パンを買う", rightRuby: "ぱんをかう" },
            { j: "道で走る", r: "みちではしる", zh: "在路上跑步", left: "道", leftRuby: "みち", right: "走る", rightRuby: "はしる" },
            { j: "バスの中で寝る", r: "ばすのなかでねる", zh: "在公車裡睡覺", left: "バスの中", leftRuby: "ばすのなか", right: "寝る", rightRuby: "ねる" },
            { j: "空を飛ぶ", r: "そらをとぶ", zh: "在天上飛(通常用を但可)", left: "日本", leftRuby: "にほん", right: "旅行する", rightRuby: "りょこうする" } // Modified to 日本で旅行する
        ]
    },
    TO_WITH: { // ALSO ALIAS TO_COMPANION
        safeCombos: [
            { j: "友達と遊ぶ", r: "ともだちとあそぶ", zh: "和朋友玩", left: "友達", leftRuby: "ともだち", right: "遊ぶ", rightRuby: "あそぶ" },
            { j: "家族と食べる", r: "かぞくとたべる", zh: "和家人吃飯", left: "家族", leftRuby: "かぞく", right: "食べる", rightRuby: "たべる" },
            { j: "先生と話す", r: "せんせいとはなす", zh: "和老師說話", left: "先生", leftRuby: "せんせい", right: "話す", rightRuby: "はなす" },
            { j: "母と買い物する", r: "ははとかいものする", zh: "和媽媽購物", left: "母", leftRuby: "はは", right: "買い物する", rightRuby: "かいものする" },
            { j: "兄と映画を見る", r: "あにとえいがをみる", zh: "和哥哥看電影", left: "兄", leftRuby: "あに", right: "映画を見る", rightRuby: "えいがをみる" },
            { j: "友達とゲームをする", r: "ともだちとげーむをする", zh: "和朋友玩遊戲", left: "友達", leftRuby: "ともだち", right: "ゲームをする", rightRuby: "げーむをする" },
            { j: "父と出かける", r: "ちちとでかける", zh: "和爸爸出門", left: "父", leftRuby: "ちち", right: "出かける", rightRuby: "でかける" },
            { j: "姉と散歩する", r: "あねとさんぽする", zh: "和姐姐散步", left: "姉", leftRuby: "あね", right: "散歩する", rightRuby: "さんぽする" },
            { j: "友達と勉強する", r: "ともだちとべんきょうする", zh: "和朋友讀書", left: "友達", leftRuby: "ともだち", right: "勉強する", rightRuby: "べんきょうする" },
            { j: "家族と旅行する", r: "かぞくとりょこうする", zh: "和家人旅行", left: "家族", leftRuby: "かぞく", right: "旅行する", rightRuby: "りょこうする" },
            { j: "田中さんと話す", r: "たなかさんとはなす", zh: "和田中先生說話", left: "田中さん", leftRuby: "たなかさん", right: "話す", rightRuby: "はなす" },
            { j: "妹と歩く", r: "いもうととあるく", zh: "和妹妹散步", left: "妹", leftRuby: "いもうと", right: "歩く", rightRuby: "あるく" },
            { j: "彼と会う", r: "かれとあう", zh: "和他見面(需用に，這裡改行く)", left: "彼", leftRuby: "かれ", right: "行く", rightRuby: "いく" },
            { j: "彼女と来る", r: "かのじょとくる", zh: "和女朋友來", left: "彼女", leftRuby: "かのじょ", right: "来る", rightRuby: "くる" },
            { j: "みんなと食べる", r: "みんなとたべる", zh: "和大家一起吃飯", left: "みんな", leftRuby: "みんな", right: "食べる", rightRuby: "たべる" },
            { j: "弟と走る", r: "おとうととはしる", zh: "和弟弟跑步", left: "弟", leftRuby: "おとうと", right: "走る", rightRuby: "はしる" },
            { j: "先輩と飲む", r: "せんぱいとのむ", zh: "和前輩喝酒", left: "先輩", leftRuby: "せんぱい", right: "飲む", rightRuby: "のむ" },
            { j: "後輩と帰る", r: "こうはいとかえる", zh: "和晚輩回家", left: "後輩", leftRuby: "こうはい", right: "帰る", rightRuby: "かえる" },
            { j: "犬と散歩する", r: "いぬとさんぽする", zh: "和狗散步", left: "犬", leftRuby: "いぬ", right: "散歩する", rightRuby: "さんぽする" },
            { j: "子供と遊ぶ", r: "こどもとあそぶ", zh: "和小孩玩", left: "子供", leftRuby: "こども", right: "遊ぶ", rightRuby: "あそぶ" }
        ]
    },
    NI_EXIST_PLACE: {
        safeCombos: [
            { j: "部屋にいる", r: "へやにいる", zh: "在房間裡", left: "部屋", leftRuby: "へや", right: "いる", rightRuby: "いる" },
            { j: "机の上にある", r: "つくえのうえにある", zh: "在桌子上", left: "机の上", leftRuby: "つくえのうえ", right: "ある", rightRuby: "ある" },
            { j: "公園に猫がいる", r: "こうえんにねこがいる", zh: "公園裡有貓", left: "公園", leftRuby: "こうえん", right: "猫がいる", rightRuby: "ねこがいる" },
            { j: "庭に犬がいる", r: "にわにいぬがいる", zh: "庭院裡有狗", left: "庭", leftRuby: "にわ", right: "犬がいる", rightRuby: "いぬがいる" },
            { j: "会議室に先生がいる", r: "かいぎしつにせんせいがいる", zh: "會議室裡有老師", left: "会議室", leftRuby: "かいぎしつ", right: "先生がいる", rightRuby: "せんせいがいる" },
            { j: "カバンの中に本がある", r: "かばんのなかにほんがある", zh: "包包裡有書", left: "カバンの中", leftRuby: "かばんのなか", right: "本がある", rightRuby: "ほんがある" },
            { j: "冷蔵庫にケーキがある", r: "れいぞうこにけーきがある", zh: "冰箱裡有蛋糕", left: "冷蔵庫", leftRuby: "れいぞうこ", right: "ケーキがある", rightRuby: "けーきがある" },
            { j: "学校に生徒がいる", r: "がっこうにせいとがいる", zh: "學校裡有學生", left: "学校", leftRuby: "がっこう", right: "生徒がいる", rightRuby: "せいとがいる" },
            { j: "箱の中にりんごがある", r: "はこのなかにりんごがある", zh: "箱子裡有蘋果", left: "箱の中", leftRuby: "はこのなか", right: "りんごがある", rightRuby: "りんごがある" },
            { j: "教室に友達がいる", r: "きょうしつにともだちがいる", zh: "教室裡有朋友", left: "教室", leftRuby: "きょうしつ", right: "友達がいる", rightRuby: "ともだちがいる" },
            { j: "山に雪がある", r: "やまにゆきがある", zh: "山上有雪", left: "山", leftRuby: "やま", right: "雪がある", rightRuby: "ゆきがある" },
            { j: "引き出しに鍵がある", r: "ひきだしにかぎがある", zh: "抽屜裡有鑰匙", left: "引き出し", leftRuby: "ひきだし", right: "鍵がある", rightRuby: "かぎがある" },
            { j: "空に雲がある", r: "そらにくもがある", zh: "天空中有雲", left: "空", leftRuby: "そら", right: "雲がある", rightRuby: "くもがある" },
            { j: "ロビーに人がいる", r: "ろびーにひとがいる", zh: "大廳有人", left: "ロビー", leftRuby: "ろびー", right: "人がいる", rightRuby: "ひとがいる" },
            { j: "お皿にパンがある", r: "おさらにぱんがある", zh: "盤子裡有麵包", left: "お皿", leftRuby: "おさら", right: "パンがある", rightRuby: "ぱんがある" },
            { j: "本棚に本がある", r: "ほんだなにほんがある", zh: "書架上有書", left: "本棚", leftRuby: "ほんだな", right: "本がある", rightRuby: "ほんがある" },
            { j: "家に家族がいる", r: "いえにかぞくがいる", zh: "家裡有家人", left: "家", leftRuby: "いえ", right: "家族がいる", rightRuby: "かぞくがいる" },
            { j: "机の下にペンがある", r: "つくえのしたにぺんがある", zh: "桌子下有筆", left: "机の下", leftRuby: "つくえのした", right: "ペンがある", rightRuby: "ぺんがある" },
            { j: "外に車がある", r: "そとにくるまがある", zh: "外面有車", left: "外", leftRuby: "そと", right: "車がある", rightRuby: "くるまがある" },
            { j: "池に魚がいる", r: "いけにさかながいる", zh: "池塘裡有魚", left: "池", leftRuby: "いけ", right: "魚がいる", rightRuby: "さかながいる" },
            { j: "木の上に鳥がいる", r: "きのうえにとりがいる", zh: "樹上有鳥", left: "木の上", leftRuby: "きのうえ", right: "鳥がいる", rightRuby: "とりがいる" }
        ]
    }
};

Object.assign(skillsObj, newSkills2);

const newSkillsJson = JSON.stringify(skillsObj, null, 4);
const before = fileContent.substring(0, startIndex);
const after = fileContent.substring(endIndex);
fs.writeFileSync(targetFile, before + "skills: " + newSkillsJson + after, 'utf8');
console.log("Successfully appended newSkills2 to earlyGamePools.v1.js!");
