const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('e:\\Desktop\\JPAPP\\assets\\data\\earlyGamePools.v1.js');
let fileContent = fs.readFileSync(targetFile, 'utf8');

const startMatch = fileContent.match(/skills:\s*\{/);
const startIndex = startMatch.index;
let braceCount = 0;
let endIndex = -1;
for (let i = startIndex + "skills:".length; i < fileContent.length; i++) {
    if (fileContent[i] === '{') braceCount++;
    else if (fileContent[i] === '}') {
        braceCount--;
        if (braceCount === 0) { endIndex = i + 1; break; }
    }
}
const stringObj = fileContent.substring(startIndex + "skills:".length, endIndex);
let skillsObj; try { skillsObj = JSON.parse(stringObj); } catch(e) { process.exit(1); }

const newSkills3 = {
    NI_TIME: {
        safeCombos: [
            { j: "8時に起きる", r: "はちじにおきる", zh: "8點起床", left: "8時", leftRuby: "はちじ", right: "起きる", rightRuby: "おきる" },
            { j: "9時に寝る", r: "くじにねる", zh: "9點睡覺", left: "9時", leftRuby: "くじ", right: "寝る", rightRuby: "ねる" },
            { j: "10時に終わる", r: "じゅうじにおわる", zh: "10點結束", left: "10時", leftRuby: "じゅうじ", right: "終わる", rightRuby: "おわる" },
            { j: "月曜日に勉強する", r: "げつようびにべんきょうする", zh: "星期一讀書", left: "月曜日", leftRuby: "げつようび", right: "勉強する", rightRuby: "べんきょうする" },
            { j: "火曜日に休む", r: "かようびにやすむ", zh: "星期二休息", left: "火曜日", leftRuby: "かようび", right: "休む", rightRuby: "やすむ" },
            { j: "日曜日に遊びに行く", r: "にちようびにあそびにいく", zh: "星期天去玩", left: "日曜日", leftRuby: "にちようび", right: "遊びに行く", rightRuby: "あそびにいく" },
            { j: "水曜日に来る", r: "すいようびにくる", zh: "星期三來", left: "水曜日", leftRuby: "すいようび", right: "来る", rightRuby: "くる" },
            { j: "金曜日に会う", r: "きんようびにあう", zh: "星期五見面", left: "金曜日", leftRuby: "きんようび", right: "会う", rightRuby: "あう" },
            { j: "12時に食べる", r: "じゅうにじにたべる", zh: "12點吃飯", left: "12時", leftRuby: "じゅうにじ", right: "食べる", rightRuby: "たべる" },
            { j: "朝の7時に起きる", r: "あさのしちじにおきる", zh: "早上7點起床", left: "朝の7時", leftRuby: "あさのしちじ", right: "起きる", rightRuby: "おきる" },
            { j: "午後3時に会う", r: "ごごさんじにあう", zh: "下午3點見", left: "午後3時", leftRuby: "ごごさんじ", right: "会う", rightRuby: "あう" },
            { j: "11時に待ち合わせる", r: "じゅういちじにまちあわせる", zh: "11點碰頭", left: "11時", leftRuby: "じゅういちじ", right: "待ち合わせる", rightRuby: "まちあわせる" },
            { j: "夏休みに旅行する", r: "なつやすみにりょこうする", zh: "暑假旅行", left: "夏休み", leftRuby: "なつやすみ", right: "旅行する", rightRuby: "りょこうする" },
            { j: "夜の11時に寝る", r: "よるのじゅういちじにねる", zh: "晚上11點睡", left: "夜の11時", leftRuby: "よるのじゅういちじ", right: "寝る", rightRuby: "ねる" },
            { j: "誕生日にケーキを食べる", r: "たんじょうびにけーきをたべる", zh: "生日吃蛋糕", left: "誕生日", leftRuby: "たんじょうび", right: "ケーキを食べる", rightRuby: "けーきをたべる" },
            { j: "週末に出かける", r: "しゅうまつにでかける", zh: "週末出門", left: "週末", leftRuby: "しゅうまつ", right: "出かける", rightRuby: "でかける" },
            { j: "休みの日に本を読む", r: "やすみのひにほんをよむ", zh: "假日看書", left: "休みの日", leftRuby: "やすみのひ", right: "本を読む", rightRuby: "ほんをよむ" },
            { j: "1時に昼ご飯を食べる", r: "いちじにひるごはんをたべる", zh: "1點吃午餐", left: "1時", leftRuby: "いちじ", right: "昼ご飯を食べる", rightRuby: "ひるごはんをたべる" },
            { j: "夕方に帰る", r: "ゆうがたにかえる", zh: "傍晚回家", left: "夕方", leftRuby: "ゆうがた", right: "帰る", rightRuby: "かえる" },
            { j: "午前中に掃除する", r: "ごぜんちゅうにそうじする", zh: "上午打掃", left: "午前中", leftRuby: "ごぜんちゅう", right: "掃除する", rightRuby: "そうじする" }
        ]
    },
    GA_EXIST_SUBJECT: {
        safeCombos: [
            { j: "猫がいる", r: "ねこがいる", zh: "有貓", left: "猫", leftRuby: "ねこ", right: "いる", rightRuby: "いる" },
            { j: "犬がいる", r: "いぬがいる", zh: "有狗", left: "犬", leftRuby: "いぬ", right: "いる", rightRuby: "いる" },
            { j: "本がある", r: "ほんがある", zh: "有書", left: "本", leftRuby: "ほん", right: "ある", rightRuby: "ある" },
            { j: "鍵がある", r: "かぎがある", zh: "有鑰匙", left: "鍵", leftRuby: "かぎ", right: "ある", rightRuby: "ある" },
            { j: "パンがある", r: "ぱんがある", zh: "有麵包", left: "パン", leftRuby: "ぱん", right: "ある", rightRuby: "ある" },
            { j: "水がある", r: "みずがある", zh: "有水", left: "水", leftRuby: "みず", right: "ある", rightRuby: "ある" },
            { j: "先生がいる", r: "せんせいがいる", zh: "有老師", left: "先生", leftRuby: "せんせい", right: "いる", rightRuby: "いる" },
            { j: "友達がいる", r: "ともだちがいる", zh: "有朋友", left: "友達", leftRuby: "ともだち", right: "いる", rightRuby: "いる" },
            { j: "車がある", r: "くるまがある", zh: "有車", left: "車", leftRuby: "くるま", right: "ある", rightRuby: "ある" },
            { j: "時間がある", r: "じかんがある", zh: "有時間", left: "時間", leftRuby: "じかん", right: "ある", rightRuby: "ある" },
            { j: "お金がある", r: "おかねがある", zh: "有錢", left: "お金", leftRuby: "おかね", right: "ある", rightRuby: "ある" },
            { j: "テストがある", r: "てすとがある", zh: "有考試", left: "テスト", leftRuby: "てすと", right: "ある", rightRuby: "ある" },
            { j: "約束がある", r: "やくそくがある", zh: "有約會", left: "約束", leftRuby: "やくそく", right: "ある", rightRuby: "ある" },
            { j: "問題がある", r: "もんだいがある", zh: "有問題", left: "問題", leftRuby: "もんだい", right: "ある", rightRuby: "ある" },
            { j: "椅子がある", r: "いすがある", zh: "有椅子", left: "椅子", leftRuby: "いす", right: "ある", rightRuby: "ある" },
            { j: "机がある", r: "つくえがある", zh: "有書桌", left: "机", leftRuby: "つくえ", right: "ある", rightRuby: "ある" },
            { j: "鳥がいる", r: "とりがいる", zh: "有鳥", left: "鳥", leftRuby: "とり", right: "いる", rightRuby: "いる" },
            { j: "家族がいる", r: "かぞくがいる", zh: "有家人", left: "家族", leftRuby: "かぞく", right: "いる", rightRuby: "いる" },
            { j: "人がいる", r: "ひとがいる", zh: "有人", left: "人", leftRuby: "ひと", right: "いる", rightRuby: "いる" },
            { j: "店がある", r: "みせがある", zh: "有商店", left: "店", leftRuby: "みせ", right: "ある", rightRuby: "ある" }
        ]
    },
    KARA_SOURCE_START: {
        safeCombos: [
            { j: "家から出発する", r: "いえからしゅっぱつする", zh: "從家出發", left: "家", leftRuby: "いえ", right: "出発する", rightRuby: "しゅっぱつする" },
            { j: "9時から始まる", r: "くじからはじまる", zh: "從九點開始", left: "9時", leftRuby: "くじ", right: "始まる", rightRuby: "はじまる" },
            { j: "朝から働く", r: "あさからはたらく", zh: "從早上開始工作", left: "朝", leftRuby: "あさ", right: "働く", rightRuby: "はたらく" },
            { j: "月曜日から勉強する", r: "げつようびからべんきょうする", zh: "從星期一開始讀書", left: "月曜日", leftRuby: "げつようび", right: "勉強する", rightRuby: "べんきょうする" },
            { j: "今日から休む", r: "きょうからやすむ", zh: "從今天起休息", left: "今日", leftRuby: "きょう", right: "休む", rightRuby: "やすむ" },
            { j: "家から学校へ行く", r: "いえからがっこうへいく", zh: "從家去學校", left: "家", leftRuby: "いえ", right: "学校へ行く", rightRuby: "がっこうへいく" },
            { j: "台湾から来る", r: "たいわんからくる", zh: "從台灣來", left: "台湾", leftRuby: "たいわん", right: "来る", rightRuby: "くる" },
            { j: "駅から歩く", r: "えきからあるく", zh: "從車站走", left: "駅", leftRuby: "えき", right: "歩く", rightRuby: "あるく" },
            { j: "教室から出る", r: "きょうしつからでる", zh: "從教室出來", left: "教室", leftRuby: "きょうしつ", right: "出る", rightRuby: "でる" },
            { j: "来週から始まる", r: "らいしゅうからはじまる", zh: "從下週開始", left: "来週", leftRuby: "らいしゅう", right: "始まる", rightRuby: "はじまる" },
            { j: "明日から旅行する", r: "あしたからりょこうする", zh: "從明天開始旅行", left: "明日", leftRuby: "あした", right: "旅行する", rightRuby: "りょこうする" },
            { j: "先生から借りる", r: "せんせいからかりる", zh: "向老師借", left: "先生", leftRuby: "せんせい", right: "借りる", rightRuby: "かりる" },
            { j: "友達から手紙をもらう", r: "ともだちからてがみをもらう", zh: "收到朋友的信", left: "友達", leftRuby: "ともだち", right: "手紙をもらう", rightRuby: "てがみをもらう" },
            { j: "会社から帰る", r: "かいしゃからかえる", zh: "從公司下班回家", left: "会社", leftRuby: "かいしゃ", right: "帰る", rightRuby: "かえる" },
            { j: "1時から授業がある", r: "いちじからじゅぎょうがある", zh: "1點開始有課", left: "1時", leftRuby: "いちじ", right: "授業がある", rightRuby: "じゅぎょうがある" },
            { j: "ここから近い", r: "ここからちかい", zh: "離這裡近", left: "ここ", leftRuby: "ここ", right: "近い", rightRuby: "ちかい" },
            { j: "あそこから遠い", r: "あそこからとおい", zh: "離那裡遠", left: "あそこ", leftRuby: "あそこ", right: "遠い", rightRuby: "とおい" },
            { j: "空港からバスに乗る", r: "くうこうからばすにのる", zh: "從機場搭公車", left: "空港", leftRuby: "くうこう", right: "バスに乗る", rightRuby: "ばすにのる" },
            { j: "1ページから読む", r: "いちぺーじからよむ", zh: "從第一頁開始讀", left: "1ページ", leftRuby: "いちぺーじ", right: "読む", rightRuby: "よむ" },
            { j: "窓から見る", r: "まどからみる", zh: "從窗戶看", left: "窓", leftRuby: "まど", right: "見る", rightRuby: "みる" }
        ]
    },
    MADE_LIMIT_END: {
        safeCombos: [
            { j: "3時まで待つ", r: "さんじまでまつ", zh: "等到3點", left: "3時", leftRuby: "さんじ", right: "待つ", rightRuby: "まつ" },
            { j: "夜まで勉強する", r: "よるまでべんきょうする", zh: "讀到晚上", left: "夜", leftRuby: "よる", right: "勉強する", rightRuby: "べんきょうする" },
            { j: "金曜日まで休む", r: "きんようびまでやすむ", zh: "休息到週五", left: "金曜日", leftRuby: "きんようび", right: "休む", rightRuby: "やすむ" },
            { j: "駅まで歩く", r: "えきまであるく", zh: "走到車站", left: "駅", leftRuby: "えき", right: "歩く", rightRuby: "あるく" },
            { j: "家まで帰る", r: "いえまでかえる", zh: "回到家", left: "家", leftRuby: "いえ", right: "帰る", rightRuby: "かえる" },
            { j: "山の上まで登る", r: "やまのうえまでのぼる", zh: "爬到山頂", left: "山の上", leftRuby: "やまのうえ", right: "登る", rightRuby: "のぼる" },
            { j: "明日まで忙しい", r: "あしたまでいそがしい", zh: "忙到明天", left: "明日", leftRuby: "あした", right: "忙しい", rightRuby: "いそがしい" },
            { j: "来週までかかる", r: "らいしゅうまでかかる", zh: "要花到下週", left: "来週", leftRuby: "らいしゅう", right: "かかる", rightRuby: "かかる" },
            { j: "12時まで働く", r: "じゅうにじまではたらく", zh: "工作到12點", left: "12時", leftRuby: "じゅうにじ", right: "働く", rightRuby: "はたらく" },
            { j: "午後まで寝る", r: "ごごまでねる", zh: "睡到下午", left: "午後", leftRuby: "ごご", right: "寝る", rightRuby: "ねる" },
            { j: "公園まで走る", r: "こうえくまではしる", zh: "跑到公園", left: "公園", leftRuby: "こうえん", right: "走る", rightRuby: "はしる" },
            { j: "海まで行く", r: "うみまでいく", zh: "去到海邊", left: "海", leftRuby: "うみ", right: "行く", rightRuby: "いく" },
            { j: "今日までです", r: "きょうまでです", zh: "到今天為止", left: "今日", leftRuby: "きょう", right: "です", rightRuby: "です" },
            { j: "東京まで新幹線で行く", r: "とうきょうまでしんかんせんでいく", zh: "搭新幹線到東京", left: "東京", leftRuby: "とうきょう", right: "新幹線で行く", rightRuby: "しんかんせんでいく" },
            { j: "100ページまで読む", r: "ひゃくぺーじまでよむ", zh: "讀到第100頁", left: "100ページ", leftRuby: "ひゃくぺーじ", right: "読む", rightRuby: "よむ" },
            { j: "朝まで起きている", r: "あさまでおきている", zh: "醒到早上", left: "朝", leftRuby: "あさ", right: "起きている", rightRuby: "おきている" },
            { j: "大学まで通う", r: "だいがくまでかよう", zh: "通勤到大學", left: "大学", leftRuby: "だいがく", right: "通う", rightRuby: "かよう" },
            { j: "お店まで案内する", r: "おみせまであんないする", zh: "帶路到店裡", left: "お店", leftRuby: "おみせ", right: "案内する", rightRuby: "あんないする" },
            { j: "駅まで送る", r: "えきまでおくる", zh: "送到車站", left: "駅", leftRuby: "えき", right: "送る", rightRuby: "おくる" },
            { j: "空まで届く", r: "そらまでとどく", zh: "夠到天空", left: "空", leftRuby: "そら", right: "届く", rightRuby: "とどく" }
        ]
    }
};

Object.assign(skillsObj, newSkills3);

// 把 KARA_FROM 也指向 KARA_SOURCE_START
skillsObj.KARA_FROM = JSON.parse(JSON.stringify(skillsObj.KARA_SOURCE_START));
// TO_COMPANION was already updated in TO_WITH but let's alias it explicitly just in case
if(!skillsObj.TO_COMPANION) skillsObj.TO_COMPANION = JSON.parse(JSON.stringify(skillsObj.TO_WITH));

const newSkillsJson = JSON.stringify(skillsObj, null, 4);
const before = fileContent.substring(0, startIndex);
const after = fileContent.substring(endIndex);
fs.writeFileSync(targetFile, before + "skills: " + newSkillsJson + after, 'utf8');
console.log("Successfully appended newSkills3 to earlyGamePools.v1.js!");
