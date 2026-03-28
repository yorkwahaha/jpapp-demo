const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('e:\\Desktop\\JPAPP\\assets\\data\\earlyGamePools.v1.js');

// 準備新的 skills 物件
const newSkills = {
    WA_TOPIC_BASIC: {
        safeCombos: [
            { j: "私は学生です", r: "わたしはがくせいです", zh: "我是學生", left: "私", leftRuby: "わたし", right: "学生です", rightRuby: "がくせいです" },
            { j: "あなたは医者ですか", r: "あなたはいしゃですか", zh: "你是醫生嗎", left: "あなた", leftRuby: "あなた", right: "医者ですか", rightRuby: "いしゃですか" },
            { j: "母は先生です", r: "はははせんせいです", zh: "媽媽是老師", left: "母", leftRuby: "はは", right: "先生です", rightRuby: "せんせいです" },
            { j: "父は会社員です", r: "ちちはかいしゃいんです", zh: "爸爸是上班族", left: "父", leftRuby: "ちち", right: "会社員です", rightRuby: "かいしゃいんです" },
            { j: "兄は一年生です", r: "あにはいちねんせいです", zh: "哥哥是一年級", left: "兄", leftRuby: "あに", right: "一年生です", rightRuby: "いちねんせいです" },
            { j: "妹は子供です", r: "いもうとはこどもです", zh: "妹妹是小孩", left: "妹", leftRuby: "いもうと", right: "子供です", rightRuby: "こどもです" },
            { j: "田中さんは日本人です", r: "たなかさんはにほんじんです", zh: "田中先生是日本人", left: "田中さん", leftRuby: "たなかさん", right: "日本人です", rightRuby: "にほんじんです" },
            { j: "木村さんは学生です", r: "きむらさんはがくせいです", zh: "木村先生是學生", left: "木村さん", leftRuby: "きむらさん", right: "学生です", rightRuby: "がくせいです" },
            { j: "今日は休みです", r: "きょうはやすみです", zh: "今天是休息日", left: "今日", leftRuby: "きょう", right: "休みです", rightRuby: "やすみです" },
            { j: "明日は雨です", r: "あしたはあめです", zh: "明天是雨天", left: "明日", leftRuby: "あした", right: "雨です", rightRuby: "あめです" },
            { j: "昨日は晴れでした", r: "きのうははれでした", zh: "昨天是晴天", left: "昨日", leftRuby: "きのう", right: "晴れでした", rightRuby: "はれでした" },
            { j: "日曜日はいい天気です", r: "にちようびはいいてんきです", zh: "星期天是好天氣", left: "日曜日", leftRuby: "にちようび", right: "いい天気です", rightRuby: "いいてんきです" },
            { j: "週末は休みです", r: "しゅうまつはやすみです", zh: "週末是休息日", left: "週末", leftRuby: "しゅうまつ", right: "休みです", rightRuby: "やすみです" },
            { j: "月曜日は忙しいです", r: "げつようびはいそがしいです", zh: "星期一很忙", left: "月曜日", leftRuby: "げつようび", right: "忙しいです", rightRuby: "いそがしいです" },
            { j: "冬は寒いです", r: "ふゆはさむいです", zh: "冬天很冷", left: "冬", leftRuby: "ふゆ", right: "寒いです", rightRuby: "さむいです" },
            { j: "夏は暑いです", r: "なつはあついです", zh: "夏天很熱", left: "夏", leftRuby: "なつ", right: "暑いです", rightRuby: "あついです" },
            { j: "これはペンです", r: "これはぺんです", zh: "這是筆", left: "これ", leftRuby: "これ", right: "ペンです", rightRuby: "ぺんです" },
            { j: "それは本です", r: "それはほんです", zh: "那是書", left: "それ", leftRuby: "それ", right: "本です", rightRuby: "ほんです" },
            { j: "あれは学校です", r: "あれはがっこうです", zh: "那是學校", left: "あれ", leftRuby: "あれ", right: "学校です", rightRuby: "がっこうです" },
            { j: "ここは教室です", r: "ここはきょうしつです", zh: "這裡是教室", left: "ここ", leftRuby: "ここ", right: "教室です", rightRuby: "きょうしつです" },
            { j: "あそこは駅です", r: "あそこはえきです", zh: "那裡是車站", left: "あそこ", leftRuby: "あそこ", right: "駅です", rightRuby: "えきです" }
        ]
    },
    NO_POSSESSIVE: {
        safeCombos: [
            { j: "私の本", r: "わたしのほん", zh: "我的書", left: "私", leftRuby: "わたし", right: "本", rightRuby: "ほん" },
            { j: "あなたのかばん", r: "あなたのかばん", zh: "你的包包", left: "あなた", leftRuby: "あなた", right: "かばん", rightRuby: "かばん" },
            { j: "先生の机", r: "せんせいのつくえ", zh: "老師的桌子", left: "先生", leftRuby: "せんせい", right: "机", rightRuby: "つくえ" },
            { j: "母の靴", r: "ははのくつ", zh: "媽媽的鞋子", left: "母", leftRuby: "はは", right: "靴", rightRuby: "くつ" },
            { j: "父の車", r: "ちちのくるま", zh: "爸爸的車", left: "父", leftRuby: "ちち", right: "車", rightRuby: "くるま" },
            { j: "友達の部屋", r: "ともだちのへや", zh: "朋友的房間", left: "友達", leftRuby: "ともだち", right: "部屋", rightRuby: "へや" },
            { j: "田中さんの傘", r: "たなかさんのかさ", zh: "田中先生的傘", left: "田中さん", leftRuby: "たなかさん", right: "傘", rightRuby: "かさ" },
            { j: "日本の料理", r: "にほんのりょうり", zh: "日本的料理", left: "日本", leftRuby: "にほん", right: "料理", rightRuby: "りょうり" },
            { j: "大学の図書館", r: "だいがくのとしょかん", zh: "大學的圖書館", left: "大学", leftRuby: "だいがく", right: "図書館", rightRuby: "としょかん" },
            { j: "学校の先生", r: "がっこうのせんせい", zh: "學校的老師", left: "学校", leftRuby: "がっこう", right: "先生", rightRuby: "せんせい" },
            { j: "会社の電話", r: "かいしゃのでんわ", zh: "公司的電話", left: "会社", leftRuby: "かいしゃ", right: "電話", rightRuby: "でんわ" },
            { j: "今日の天気", r: "きょうのてんき", zh: "今天的天氣", left: "今日", leftRuby: "きょう", right: "天気", rightRuby: "てんき" },
            { j: "明日のテスト", r: "あしたのてすと", zh: "明天的考試", left: "明日", leftRuby: "あした", right: "テスト", rightRuby: "てすと" },
            { j: "机の上", r: "つくえのうえ", zh: "桌子上", left: "机", leftRuby: "つくえ", right: "上", rightRuby: "うえ" },
            { j: "いすの下", r: "いすのした", zh: "椅子下", left: "いす", leftRuby: "いす", right: "下", rightRuby: "した" },
            { j: "かばんの中", r: "かばんのなか", zh: "包包裡", left: "かばん", leftRuby: "かばん", right: "中", rightRuby: "なか" },
            { j: "部屋の外", r: "へやのそと", zh: "房間外", left: "部屋", leftRuby: "へや", right: "外", rightRuby: "そと" },
            { j: "駅の前", r: "えきのまえ", zh: "車站前", left: "駅", leftRuby: "えき", right: "前", rightRuby: "まえ" },
            { j: "家の後ろ", r: "いえのうしろ", zh: "家後面", left: "家", leftRuby: "いえ", right: "後ろ", rightRuby: "うしろ" },
            { j: "日本の映画", r: "にほんのえいが", zh: "日本的電影", left: "日本", leftRuby: "にほん", right: "映画", rightRuby: "えいが" },
            { j: "英語の本", r: "えいごのほん", zh: "英文書", left: "英語", leftRuby: "えいご", right: "本", rightRuby: "ほん" }
        ]
    },
    GA_INTRANSITIVE: {
        safeCombos: [
            { j: "雨が降る", r: "あめがふる", zh: "下雨", left: "雨", leftRuby: "あめ", right: "降る", rightRuby: "ふる" },
            { j: "雪が降る", r: "ゆきがふる", zh: "下雪", left: "雪", leftRuby: "ゆき", right: "降る", rightRuby: "ふる" },
            { j: "風が吹く", r: "かぜがふく", zh: "起風", left: "風", leftRuby: "かぜ", right: "吹く", rightRuby: "ふく" },
            { j: "空が曇る", r: "そらがくもる", zh: "天空變陰", left: "空", leftRuby: "そら", right: "曇る", rightRuby: "くもる" },
            { j: "花が咲く", r: "はながさく", zh: "開花", left: "花", leftRuby: "はな", right: "咲く", rightRuby: "さく" },
            { j: "ドアが開く", r: "どあがあく", zh: "門開了", left: "ドア", leftRuby: "どあ", right: "開く", rightRuby: "あく" },
            { j: "窓が閉まる", r: "まどがしまる", zh: "窗戶關了", left: "窓", leftRuby: "まど", right: "閉まる", rightRuby: "しまる" },
            { j: "電気がつく", r: "でんきがつく", zh: "燈亮了", left: "電気", leftRuby: "でんき", right: "つく", rightRuby: "つく" },
            { j: "電気が消える", r: "でんきがきえる", zh: "燈滅了", left: "電気", leftRuby: "でんき", right: "消える", rightRuby: "きえる" },
            { j: "水が流れる", r: "みずがながれる", zh: "水在流", left: "水", leftRuby: "みず", right: "流れる", rightRuby: "ながれる" },
            { j: "バスが止まる", r: "ばすがとまる", zh: "公車停下", left: "バス", leftRuby: "ばす", right: "止まる", rightRuby: "とまる" },
            { j: "人が集まる", r: "ひとがあつまる", zh: "人群聚集", left: "人", leftRuby: "ひと", right: "集まる", rightRuby: "あつまる" },
            { j: "問題が起きる", r: "もんだいがおきる", zh: "發生問題", left: "問題", leftRuby: "もんだい", right: "起きる", rightRuby: "おきる" },
            { j: "鐘が鳴る", r: "かねがなる", zh: "鐘聲響起", left: "鐘", leftRuby: "かね", right: "鳴る", rightRuby: "なる" },
            { j: "星が見える", r: "ほしがみえる", zh: "看得見星星", left: "星", leftRuby: "ほし", right: "見える", rightRuby: "みえる" },
            { j: "山が見える", r: "やまがみえる", zh: "看得見山", left: "山", leftRuby: "やま", right: "見える", rightRuby: "みえる" },
            { j: "音が聞こえる", r: "おとがきこえる", zh: "聽得到聲音", left: "音", leftRuby: "おと", right: "聞こえる", rightRuby: "きこえる" },
            { j: "鳥が飛ぶ", r: "とりがとぶ", zh: "鳥在飛", left: "鳥", leftRuby: "とり", right: "飛ぶ", rightRuby: "とぶ" },
            { j: "桜が散る", r: "さくらがちる", zh: "櫻花飄落", left: "桜", leftRuby: "さくら", right: "散る", rightRuby: "ちる" },
            { j: "子供が泣く", r: "こどもがなく", zh: "小孩在哭", left: "子供", leftRuby: "こども", right: "泣く", rightRuby: "なく" }
        ]
    },
    WO_OBJECT_BASIC: {
        safeCombos: [
            { j: "本を読む", r: "ほんをよむ", zh: "看書", left: "本", leftRuby: "ほん", right: "読む", rightRuby: "よむ" },
            { j: "手紙を書く", r: "てがみを書く", zh: "寫信", left: "手紙", leftRuby: "てがみ", right: "書く", rightRuby: "かく" },
            { j: "ご飯を食べる", r: "ごはんをたべる", zh: "吃飯", left: "ご飯", leftRuby: "ごはん", right: "食べる", rightRuby: "たべる" },
            { j: "パンを食べる", r: "ぱんをたべる", zh: "吃麵包", left: "パン", leftRuby: "ぱん", right: "食べる", rightRuby: "たべる" },
            { j: "水を飲む", r: "みずをのむ", zh: "喝水", left: "水", leftRuby: "みず", right: "飲む", rightRuby: "のむ" },
            { j: "お茶を飲む", r: "おちゃをのむ", zh: "喝茶", left: "お茶", leftRuby: "おちゃ", right: "飲む", rightRuby: "のむ" },
            { j: "音楽を聞く", r: "おんがくをきく", zh: "聽音樂", left: "音楽", leftRuby: "おんがく", right: "聞く", rightRuby: "きく" },
            { j: "ラジオを聞く", r: "らじおをきく", zh: "聽廣播", left: "ラジオ", leftRuby: "らじお", right: "聞く", rightRuby: "きく" },
            { j: "映画を見る", r: "えいがをみる", zh: "看電影", left: "映画", leftRuby: "えいが", right: "見る", rightRuby: "みる" },
            { j: "テレビを見る", r: "てれびをみる", zh: "看電視", left: "テレビ", leftRuby: "てれび", right: "見る", rightRuby: "みる" },
            { j: "写真を撮る", r: "しゃしんをとる", zh: "拍照", left: "写真", leftRuby: "しゃしん", right: "撮る", rightRuby: "とる" },
            { j: "宿題をする", r: "しゅくだいをする", zh: "做作業", left: "宿題", leftRuby: "しゅくだい", right: "する", rightRuby: "する" },
            { j: "買い物をする", r: "かいものをする", zh: "購物", left: "買い物", leftRuby: "かいもの", right: "する", rightRuby: "する" },
            { j: "服を洗う", r: "ふくをあらう", zh: "洗衣服", left: "服", leftRuby: "ふく", right: "洗う", rightRuby: "あらう" },
            { j: "友達を待つ", r: "ともだちをまつ", zh: "等朋友", left: "友達", leftRuby: "ともだち", right: "待つ", rightRuby: "まつ" },
            { j: "ドアを開ける", r: "どあをあける", zh: "開門", left: "ドア", leftRuby: "どあ", right: "開ける", rightRuby: "あける" },
            { j: "窓を閉める", r: "まどをしめる", zh: "關窗", left: "窓", leftRuby: "まど", right: "閉める", rightRuby: "しめる" },
            { j: "電気をつける", r: "でんきをつける", zh: "開燈", left: "電気", leftRuby: "でんき", right: "つける", rightRuby: "つける" },
            { j: "電気を消す", r: "でんきをけす", zh: "關燈", left: "電気", leftRuby: "でんき", right: "消す", rightRuby: "けす" },
            { j: "パソコンを使う", r: "ぱそこんをつかう", zh: "用電腦", left: "パソコン", leftRuby: "ぱそこん", right: "使う", rightRuby: "つかう" },
            { j: "言葉を覚える", r: "ことばをおぼえる", zh: "記單字", left: "言葉", leftRuby: "ことば", right: "覚える", rightRuby: "おぼえる" }
        ]
    },
    HE_DIRECTION: {
        safeCombos: [
            { j: "学校へ行く", r: "がっこうへいく", zh: "去學校", left: "学校", leftRuby: "がっこう", right: "行く", rightRuby: "いく" },
            { j: "駅へ行く", r: "えきへいく", zh: "去車站", left: "駅", leftRuby: "えき", right: "行く", rightRuby: "いく" },
            { j: "会社へ行く", r: "かいしゃへいく", zh: "去公司", left: "会社", leftRuby: "かいしゃ", right: "行く", rightRuby: "いく" },
            { j: "病院へ行く", r: "びょういんへいく", zh: "去醫院", left: "病院", leftRuby: "びょういん", right: "行く", rightRuby: "いく" },
            { j: "家へ帰る", r: "いえへかえる", zh: "回家", left: "家", leftRuby: "いえ", right: "帰る", rightRuby: "かえる" },
            { j: "うちへ帰る", r: "うちへかえる", zh: "回家", left: "うち", leftRuby: "うち", right: "帰る", rightRuby: "かえる" },
            { j: "国へ帰る", r: "くにへかえる", zh: "回國", left: "国", leftRuby: "くに", right: "帰る", rightRuby: "かえる" },
            { j: "家へ来る", r: "いえへくる", zh: "來家裡", left: "家", leftRuby: "いえ", right: "来る", rightRuby: "くる" },
            { j: "学校へ来る", r: "がっこうへくる", zh: "來學校", left: "学校", leftRuby: "がっこう", right: "来る", rightRuby: "くる" },
            { j: "右へ曲がる", r: "みぎへまがる", zh: "向右轉", left: "右", leftRuby: "みぎ", right: "曲がる", rightRuby: "まがる" },
            { j: "左へ曲がる", r: "ひだりへまがる", zh: "向左轉", left: "左", leftRuby: "ひだり", right: "曲がる", rightRuby: "まがる" },
            { j: "前へ進む", r: "まえへすすむ", zh: "向前進", left: "前", leftRuby: "まえ", right: "進む", rightRuby: "すすむ" },
            { j: "後ろへ下がる", r: "うしろへさがる", zh: "向後退", left: "後ろ", leftRuby: "うしろ", right: "下がる", rightRuby: "さがる" },
            { j: "北へ向かう", r: "きたへむかう", zh: "朝北方去", left: "北", leftRuby: "きた", right: "向かう", rightRuby: "むかう" },
            { j: "南へ走る", r: "みなみへはしる", zh: "往南跑", left: "南", leftRuby: "みなみ", right: "走る", rightRuby: "はしる" },
            { j: "東へ行く", r: "ひがしへいく", zh: "往東走", left: "東", leftRuby: "ひがし", right: "行く", rightRuby: "いく" },
            { j: "西へ進む", r: "にしへすすむ", zh: "向西行", left: "西", leftRuby: "にし", right: "進む", rightRuby: "すすむ" },
            { j: "上へ登る", r: "うえへのぼる", zh: "往上爬", left: "上", leftRuby: "うえ", right: "登る", rightRuby: "のぼる" },
            { j: "下へ降りる", r: "したへおりる", zh: "往下走", left: "下", leftRuby: "した", right: "降りる", rightRuby: "おりる" },
            { j: "外へ出る", r: "そとへでる", zh: "往外走", left: "外", leftRuby: "そと", right: "出る", rightRuby: "でる" },
            { j: "中へ入る", r: "なかへはいる", zh: "往裡面走", left: "中", leftRuby: "なか", right: "入る", rightRuby: "はいる" }
        ]
    }
};

const fileContent = fs.readFileSync(targetFile, 'utf8');

// 把 newSkills JSON 字串化
const newSkillsJson = JSON.stringify(newSkills, null, 4);

// 尋找 EARLY_GAME_POOLS.skills 的定義區塊
// 由於原本裡面定義了 `skills: { ... }`，我們可以用正則替換它
const startMatch = fileContent.match(/skills:\s*\{/);

if (!startMatch) {
    console.error("找不到 skills 區塊");
    process.exit(1);
}

const startIndex = startMatch.index;
// 計算匹配的大括號結束位置
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

if (endIndex === -1) {
    console.error("找不到結尾大括號");
    process.exit(1);
}

const before = fileContent.substring(0, startIndex);
const after = fileContent.substring(endIndex);

const newContent = before + "skills: " + newSkillsJson + after;
fs.writeFileSync(targetFile, newContent, 'utf8');
console.log("Successfully rebuilt earlyGamePools.v1.js!");
