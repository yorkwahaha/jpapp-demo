const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('e:\\Desktop\\JPAPP\\assets\\data\\earlyGamePools.v1.js');
let fileContent = fs.readFileSync(targetFile, 'utf8');

const startMatch = fileContent.match(/skills:\s*\{/);
const startIndex = startMatch.index;
let braceCount = 0; let endIndex = -1;
for (let i = startIndex + "skills:".length; i < fileContent.length; i++) {
    if (fileContent[i] === '{') braceCount++;
    else if (fileContent[i] === '}') { braceCount--; if (braceCount === 0) { endIndex = i + 1; break; } }
}
let skillsObj; try { skillsObj = JSON.parse(fileContent.substring(startIndex + "skills:".length, endIndex)); } catch(e) { process.exit(1); }

const newSkills5 = {
    KARA_REASON: {
        safeCombos: [
            { j: "雨だから行かない", r: "あめだからいかない", zh: "因為下雨所以不去", left: "雨だ", leftRuby: "あめだ", right: "行かない", rightRuby: "いかない" },
            { j: "時間がないから急ぐ", r: "じかんがないからいそぐ", zh: "因為沒時間趕快", left: "時間がない", leftRuby: "じかんがない", right: "急ぐ", rightRuby: "いそぐ" },
            { j: "お腹がすいたから食べる", r: "おなかがすいたからたべる", zh: "因為肚子餓所以吃", left: "お腹がすいた", leftRuby: "おなかがすいた", right: "食べる", rightRuby: "たべる" },
            { j: "疲れたから休む", r: "つかれたからやすむ", zh: "因為累了所以休息", left: "疲れた", leftRuby: "つかれた", right: "休む", rightRuby: "やすむ" },
            { j: "寒いから窓を閉める", r: "さむいからまどをしめる", zh: "因為冷所以關窗", left: "寒い", leftRuby: "さむい", right: "窓を閉める", rightRuby: "まどをしめる" },
            { j: "暑いから水を飲む", r: "あついからみずをのむ", zh: "因為熱所以喝水", left: "暑い", leftRuby: "あつい", right: "水を飲む", rightRuby: "みずをのむ" },
            { j: "高いから買わない", r: "たかいからかわない", zh: "因為貴所以不買", left: "高い", leftRuby: "たかい", right: "買わない", rightRuby: "かわない" },
            { j: "風邪だから薬を飲む", r: "かぜだからくすりをのむ", zh: "因為感冒所以吃藥", left: "風邪だ", leftRuby: "かぜだ", right: "薬を飲む", rightRuby: "くすりをのむ" },
            { j: "安いからたくさん買う", r: "やすいからたくさんかう", zh: "因為便宜所以買很多", left: "安い", leftRuby: "やすい", right: "たくさん買う", rightRuby: "たくさんかう" },
            { j: "危ないから触らない", r: "あぶないからさわらない", zh: "因為危險所以不碰", left: "危ない", leftRuby: "あぶない", right: "触らない", rightRuby: "さわらない" },
            { j: "暗いから電気をつける", r: "くらいからでんきをつける", zh: "因為暗所以開燈", left: "暗い", leftRuby: "くらい", right: "電気をつける", rightRuby: "でんきをつける" },
            { j: "眠いから寝る", r: "ねむいからねる", zh: "因為睏所以睡覺", left: "眠い", leftRuby: "ねむい", right: "寝る", rightRuby: "ねる" },
            { j: "好きだから食べる", r: "すきだからたべる", zh: "因為喜歡所以吃", left: "好きだ", leftRuby: "すきだ", right: "食べる", rightRuby: "たべる" },
            { j: "痛いから休む", r: "いたいからやすむ", zh: "因為痛所以休息", left: "痛い", leftRuby: "いたい", right: "休む", rightRuby: "やすむ" },
            { j: "暇だから遊ぶ", r: "ひまだからあそぶ", zh: "因為有空所以玩", left: "暇だ", leftRuby: "ひまだ", right: "遊ぶ", rightRuby: "あそぶ" },
            { j: "美味しいから食べる", r: "おいしいからたべる", zh: "因為好吃所以吃", left: "美味しい", leftRuby: "おいしい", right: "食べる", rightRuby: "たべる" },
            { j: "遠いからバスで行く", r: "とおいからばすでいく", zh: "因為遠所以搭公車去", left: "遠い", leftRuby: "とおい", right: "バスで行く", rightRuby: "ばすでいく" },
            { j: "お金がないから買わない", r: "おかねがないからかわない", zh: "因為沒錢所以不買", left: "お金がない", leftRuby: "おかねがない", right: "買わない", rightRuby: "かわない" },
            { j: "重いから持てない", r: "おもいからもてない", zh: "因為重所以拿不動", left: "重い", leftRuby: "おもい", right: "持てない", rightRuby: "もてない" },
            { j: "きれいだから好きだ", r: "きれいだからすきだ", zh: "因為漂亮所以喜歡", left: "きれいだ", leftRuby: "きれいだ", right: "好きだ", rightRuby: "すきだ" }
        ]
    },
    YORI_COMPARE: {
        safeCombos: [
            { j: "肉より魚が好き", r: "にくよりさかながすき", zh: "比肉更喜歡魚", left: "肉", leftRuby: "にく", right: "魚が好き", rightRuby: "さかながすき" },
            { j: "犬より猫が好き", r: "いぬよりねこがすき", zh: "比狗更喜歡貓", left: "犬", leftRuby: "いぬ", right: "猫が好き", rightRuby: "ねこがすき" },
            { j: "バスより電車が速い", r: "ばすよりでんしゃがはやい", zh: "電車比公車快", left: "バス", leftRuby: "ばす", right: "電車が速い", rightRuby: "でんしゃがはやい" },
            { j: "夏より冬が好き", r: "なつよりふゆがすき", zh: "比夏天更喜歡冬天", left: "夏", leftRuby: "なつ", right: "冬が好き", rightRuby: "ふゆがすき" },
            { j: "昨日より今日が暑い", r: "きのうよりきょうがあつい", zh: "今天比昨天熱", left: "昨日", leftRuby: "きのう", right: "今日が暑い", rightRuby: "きょうがあつい" },
            { j: "私より妹が背が高い", r: "わたしよりいもうとがせがたかい", zh: "妹妹比我高", left: "私", leftRuby: "わたし", right: "妹が背が高い", rightRuby: "いもうとがせがたかい" },
            { j: "海より山が好き", r: "うみよりやまがすき", zh: "比海更喜歡山", left: "海", leftRuby: "うみ", right: "山が好き", rightRuby: "やまがすき" },
            { j: "自転車より車が速い", r: "じてんしゃよりくるまがはやい", zh: "車子比腳踏車快", left: "自転車", leftRuby: "じてんしゃ", right: "車が速い", rightRuby: "くるまがはやい" },
            { j: "パンよりご飯が好き", r: "ぱんよりごはんがすき", zh: "比麵包更喜歡飯", left: "パン", leftRuby: "ぱん", right: "ご飯が好き", rightRuby: "ごはんがすき" },
            { j: "去年より今年が暑い", r: "きょねんよりことしがあつい", zh: "今年比去年熱", left: "去年", leftRuby: "きょねん", right: "今年が暑い", rightRuby: "ことしがあつい" },
            { j: "数学より英語が難しい", r: "すうがくよりえいごがむずかしい", zh: "英語比數學難", left: "数学", leftRuby: "すうがく", right: "英語が難しい", rightRuby: "えいごがむずかしい" },
            { j: "漢字よりひらがなが簡単だ", r: "かんじよりひらがながかんたんだ", zh: "平假名比漢字簡單", left: "漢字", leftRuby: "かんじ", right: "ひらがなが簡単だ", rightRuby: "ひらがながかんたんだ" },
            { j: "兄より弟が大きい", r: "あによりおとうとがおおきい", zh: "弟弟比哥哥大", left: "兄", leftRuby: "あに", right: "弟が大きい", rightRuby: "おとうとがおおきい" },
            { j: "昨日より今日が寒い", r: "きのうよりきょうがさむい", zh: "今天比昨天冷", left: "昨日", leftRuby: "きのう", right: "今日が寒い", rightRuby: "きょうがさむい" },
            { j: "テレビよりネットがいい", r: "てれびよりねっとがいい", zh: "網路比電視好", left: "テレビ", leftRuby: "てれび", right: "ネットがいい", rightRuby: "ねっとがいい" },
            { j: "東京より大阪が好き", r: "とうきょうよりおおさかがすき", zh: "比東京更喜歡大阪", left: "東京", leftRuby: "とうきょう", right: "大阪が好き", rightRuby: "おおさかがすき" },
            { j: "これよりあれが欲しい", r: "これよりあれがほしい", zh: "比起這個更想要那個", left: "これ", leftRuby: "これ", right: "あれが欲しい", rightRuby: "あれがほしい" },
            { j: "歩くより走るが速い", r: "あるくよりはしるがはやい", zh: "跑比走快", left: "歩く", leftRuby: "あるく", right: "走るが速い", rightRuby: "はしるがはやい" },
            { j: "コーヒーより紅茶を飲む", r: "こーひーよりこうちゃをのむ", zh: "比起咖啡更常喝紅茶", left: "コーヒー", leftRuby: "こーひー", right: "紅茶を飲む", rightRuby: "こうちゃをのむ" },
            { j: "りんごよりみかんが安い", r: "りんごよりみかんがやすい", zh: "橘子比蘋果便宜", left: "りんご", leftRuby: "りんご", right: "みかんが安い", rightRuby: "みかんがやすい" }
        ]
    },
    NI_FREQUENCY: {
        safeCombos: [
            { j: "一日に三回", r: "いちにちにさんかい", zh: "一天三次", left: "一日", leftRuby: "いちにち", right: "三回", rightRuby: "さんかい" },
            { j: "一週間に一回", r: "いっしゅうかんにいっかい", zh: "一星期一次", left: "一週間", leftRuby: "いっしゅうかん", right: "一回", rightRuby: "いっかい" },
            { j: "一か月に二回", r: "いっかげつににかい", zh: "一個月兩次", left: "一か月", leftRuby: "いっかげつ", right: "二回", rightRuby: "にかい" },
            { j: "一年に一回", r: "いちねんにいっかい", zh: "一年一次", left: "一年", leftRuby: "いちねん", right: "一回", rightRuby: "いっかい" },
            { j: "一日に二回食べる", r: "いちにちににかいたべる", zh: "一天吃兩次", left: "一日", leftRuby: "いちにち", right: "二回食べる", rightRuby: "にかいたべる" },
            { j: "一週間に二日休む", r: "いっしゅうかんにふつかやすむ", zh: "一星期休息兩天", left: "一週間", leftRuby: "いっしゅうかん", right: "二日休む", rightRuby: "ふつかやすむ" },
            { j: "一時間に二回見る", r: "いちじかんににかいみる", zh: "一小時看兩次", left: "一時間", leftRuby: "いちじかん", right: "二回見る", rightRuby: "にかいみる" },
            { j: "一か月に一冊", r: "いっかげつにいっさつ", zh: "一個月一本", left: "一か月", leftRuby: "いっかげつ", right: "一冊", rightRuby: "いっさつ" },
            { j: "一年に二回行く", r: "いちねんににかいいく", zh: "一年去兩次", left: "一年", leftRuby: "いちねん", right: "二回行く", rightRuby: "にかいいく" },
            { j: "一週間に三回", r: "いっしゅうかんにさんかい", zh: "一星期三次", left: "一週間", leftRuby: "いっしゅうかん", right: "三回", rightRuby: "さんかい" },
            { j: "一日に五回", r: "いちにちにごかい", zh: "一天五次", left: "一日", leftRuby: "いちにち", right: "五回", rightRuby: "ごかい" },
            { j: "一週間に一回掃除する", r: "いっしゅうかんにいっかいそうじする", zh: "一星期打掃一次", left: "一週間", leftRuby: "いっしゅうかん", right: "一回掃除する", rightRuby: "いっかいそうじする" },
            { j: "三日に一回", r: "みっかにいっかい", zh: "三天一次", left: "三日", leftRuby: "みっか", right: "一回", rightRuby: "いっかい" },
            { j: "半年に一回", r: "はんとしにいっかい", zh: "半年一次", left: "半年", leftRuby: "はんとし", right: "一回", rightRuby: "いっかい" },
            { j: "十日に一回", r: "とおかにいっかい", zh: "十天一次", left: "十日", leftRuby: "とおか", right: "一回", rightRuby: "いっかい" },
            { j: "二日に一回", r: "ふつかにいっかい", zh: "兩天一次", left: "二日", leftRuby: "ふつか", right: "一回", rightRuby: "いっかい" },
            { j: "三十分に三回", r: "さんじゅっぷんにさんかい", zh: "三十分鐘三次", left: "三十分", leftRuby: "さんじゅっぷん", right: "三回", rightRuby: "さんかい" },
            { j: "人生に一回", r: "じんせいにいっかい", zh: "人生一次", left: "人生", leftRuby: "じんせい", right: "一回", rightRuby: "いっかい" },
            { j: "一日に一回薬を飲む", r: "いちにちにいっかいくすりをのむ", zh: "一天吃一次藥", left: "一日", leftRuby: "いちにち", right: "一回薬を飲む", rightRuby: "いっかいくすりをのむ" },
            { j: "五年に一回", r: "ごねんにいっかい", zh: "五年一次", left: "五年", leftRuby: "ごねん", right: "一回", rightRuby: "いっかい" }
        ]
    },
    DE_MATERIAL: {
        safeCombos: [
            { j: "木で机を作る", r: "きでつくえをつくる", zh: "用木頭做書桌", left: "木", leftRuby: "き", right: "机を作る", rightRuby: "つくえをつくる" },
            { j: "紙で箱を作る", r: "かみではこをつくる", zh: "用紙做箱子", left: "紙", leftRuby: "かみ", right: "箱を作る", rightRuby: "はこをつくる" },
            { j: "布で服を作る", r: "ぬのでふくをつくる", zh: "用布做衣服", left: "布", leftRuby: "ぬの", right: "服を作る", rightRuby: "ふくをつくる" },
            { j: "石で家を造る", r: "いしでいえをつくる", zh: "用石頭蓋房子", left: "石", leftRuby: "いし", right: "家を造る", rightRuby: "いえをつくる" },
            { j: "牛乳でチーズを作る", r: "ぎゅうにゅうでちーずをつくる", zh: "用牛奶做起司", left: "牛乳", leftRuby: "ぎゅうにゅう", right: "チーズを作る", rightRuby: "ちーずをつくる" },
            { j: "野菜でジュースを作る", r: "やさいでじゅーすをつくる", zh: "用蔬菜做果汁", left: "野菜", leftRuby: "やさい", right: "ジュースを作る", rightRuby: "じゅーすをつくる" },
            { j: "米でお酒を造る", r: "こめでおさけをつくる", zh: "用米釀酒", left: "米", leftRuby: "こめ", right: "お酒を造る", rightRuby: "おさけをつくる" },
            { j: "果物でジャムを作る", r: "くだものでじゃむをつくる", zh: "用水果做果醬", left: "果物", leftRuby: "くだもの", right: "ジャムを作る", rightRuby: "じゃむをつくる" },
            { j: "小麦粉でパンを作る", r: "こむぎこでぱんをつくる", zh: "用麵粉做麵包", left: "小麦粉", leftRuby: "こむぎこ", right: "パンを作る", rightRuby: "ぱんをつくる" },
            { j: "肉でスープを作る", r: "にくですーぷをつくる", zh: "用肉煮湯", left: "肉", leftRuby: "にく", right: "スープを作る", rightRuby: "すーぷをつくる" },
            { j: "豆で豆腐を作る", r: "まめでとうふをつくる", zh: "用豆子做豆腐", left: "豆", leftRuby: "まめ", right: "豆腐を作る", rightRuby: "とうふをつくる" },
            { j: "チョコでケーキを作る", r: "ちょこでけーきをつくる", zh: "用巧克力做蛋糕", left: "チョコ", leftRuby: "ちょこ", right: "ケーキを作る", rightRuby: "けーきをつくる" },
            { j: "土で皿を作る", r: "つちでさらをつくる", zh: "用泥土做盤子", left: "土", leftRuby: "つち", right: "皿を作る", rightRuby: "さらをつくる" },
            { j: "糸で服を編む", r: "いとでふくをあむ", zh: "用線編織衣服", left: "糸", leftRuby: "いと", right: "服を編む", rightRuby: "ふくをあむ" },
            { j: "竹でかごを作る", r: "たけでかごをつくる", zh: "用竹子做籃子", left: "竹", leftRuby: "たけ", right: "かごを作る", rightRuby: "かごをつくる" },
            { j: "ガラスでコップを作る", r: "がらすでこっぷをつくる", zh: "用玻璃做杯子", left: "ガラス", leftRuby: "がらす", right: "コップを作る", rightRuby: "こっぷをつくる" },
            { j: "鉄で車を作る", r: "てつでくるまをつくる", zh: "用鐵製造車子", left: "鉄", leftRuby: "てつ", right: "車を作る", rightRuby: "くるまをつくる" },
            { j: "ペットボトルで船を作る", r: "ぺっとぼとるでふねをつくる", zh: "用保特瓶做船", left: "ペットボトル", leftRuby: "ぺっとぼとる", right: "船を作る", rightRuby: "ふねをつくる" },
            { j: "雪で雪だるまを作る", r: "ゆきでゆきだるまをつくる", zh: "用雪做雪人", left: "雪", leftRuby: "ゆき", right: "雪だるまを作る", rightRuby: "ゆきだるまをつくる" },
            { j: "氷で家を作る", r: "こおりでいえをつくる", zh: "用冰蓋房子", left: "氷", leftRuby: "こおり", right: "家を作る", rightRuby: "いえをつくる" }
        ]
    },
    NI_DESTINATION: {
        safeCombos: [
            { j: "いすに座る", r: "いすにすわる", zh: "坐在椅子上", left: "いす", leftRuby: "いす", right: "座る", rightRuby: "すわる" },
            { j: "電車に乗る", r: "でんしゃにのる", zh: "搭電車(上車點)", left: "電車", leftRuby: "でんしゃ", right: "乗る", rightRuby: "のる" },
            { j: "バスに乗る", r: "ばすにのる", zh: "搭公車", left: "バス", leftRuby: "ばす", right: "乗る", rightRuby: "のる" },
            { j: "壁に写真を貼る", r: "かべにしゃしんをはる", zh: "在牆上貼照片", left: "壁", leftRuby: "かべ", right: "写真を貼る", rightRuby: "しゃしんをはる" },
            { j: "ノートに名前を書く", r: "のーとに名前をかく", zh: "在筆記本寫名字", left: "ノート", leftRuby: "のーと", right: "名前を書く", rightRuby: "なまえをかく" },
            { j: "駅に着く", r: "えきにつく", zh: "到達車站", left: "駅", leftRuby: "えき", right: "着く", rightRuby: "つく" },
            { j: "箱に入れる", r: "はこのいれる", zh: "放進箱子裡", left: "箱", leftRuby: "はこ", right: "入れる", rightRuby: "いれる" },
            { j: "ゴミ箱に捨てる", r: "ごみばこにすてる", zh: "丟進垃圾桶", left: "ゴミ箱", leftRuby: "ごみばこ", right: "捨てる", rightRuby: "すてる" },
            { j: "黒板に字を書く", r: "こくばんにじをかく", zh: "在黑板上寫字", left: "黒板", leftRuby: "こくばん", right: "字を書く", rightRuby: "じをかく" },
            { j: "ベッドに寝る", r: "べっどにねる", zh: "睡在床上", left: "ベッド", leftRuby: "べっど", right: "寝る", rightRuby: "ねる" },
            { j: "机に置く", r: "つくえにおく", zh: "放在桌上", left: "机", leftRuby: "つくえ", right: "置く", rightRuby: "おく" },
            { j: "風呂に入る", r: "ふろにはいる", zh: "泡澡(進入浴缸)", left: "風呂", leftRuby: "ふろ", right: "入る", rightRuby: "はいる" },
            { j: "部屋に入る", r: "へやにはいる", zh: "進入房間", left: "部屋", leftRuby: "へや", right: "入る", rightRuby: "はいる" },
            { j: "地面に落ちる", r: "じめんにおちる", zh: "掉在地上", left: "地面", leftRuby: "じめん", right: "落ちる", rightRuby: "おちる" },
            { j: "カレンダーに予定を書く", r: "かれんだーによていをかく", zh: "把行程寫在日曆上", left: "カレンダー", leftRuby: "かれんだー", right: "予定を書く", rightRuby: "よていをかく" },
            { j: "木に登る", r: "きにのぼる", zh: "爬到樹上", left: "木", leftRuby: "き", right: "登る", rightRuby: "のぼる" },
            { j: "日本に着く", r: "にほんにつく", zh: "抵達日本", left: "日本", leftRuby: "にほん", right: "着く", rightRuby: "つく" },
            { j: "自転車に乗る", r: "じてんしゃにのる", zh: "騎(上)自行車", left: "自転車", leftRuby: "じてんしゃ", right: "乗る", rightRuby: "のる" },
            { j: "ソファに座る", r: "そふぁにすわる", zh: "坐在沙發", left: "ソファ", leftRuby: "そふぁ", right: "座る", rightRuby: "すわる" },
            { j: "棚に本を置く", r: "たなにほんをおく", zh: "把書放書架上", left: "棚", leftRuby: "たな", right: "本を置く", rightRuby: "ほんをおく" }
        ]
    },
    GA_BUT: {
        safeCombos: [
            { j: "安いが、美味しくない", r: "やすいが、おいしくない", zh: "便宜但是不好吃", left: "安い", leftRuby: "やすい", right: "美味しくない", rightRuby: "おいしくない" },
            { j: "高いが、いい物だ", r: "たかいが、いいものだ", zh: "貴但是好東西", left: "高い", leftRuby: "たかい", right: "いい物だ", rightRuby: "いいものだ" },
            { j: "小さいが、便利だ", r: "ちいさいが、べんりだ", zh: "小但是方便", left: "小さい", leftRuby: "ちいさい", right: "便利だ", rightRuby: "べんりだ" },
            { j: "難しいが、面白い", r: "むずかしいが、おもしろい", zh: "難但是有趣", left: "難しい", leftRuby: "むずかしい", right: "面白い", rightRuby: "おもしろい" },
            { j: "古いが、まだ使える", r: "ふるいが、まだつかえる", zh: "舊但是還能用", left: "古い", leftRuby: "ふるい", right: "まだ使える", rightRuby: "まだつかえる" },
            { j: "眠いが、勉強する", r: "ねむいが、べんきょうする", zh: "睏但還是要讀書", left: "眠い", leftRuby: "ねむい", right: "勉強する", rightRuby: "べんきょうする" },
            { j: "痛いが、我慢する", r: "いたいが、がまんする", zh: "痛但忍耐", left: "痛い", leftRuby: "いたい", right: "我慢する", rightRuby: "がまんする" },
            { j: "狭いが、きれいだ", r: "せまいが、きれいだ", zh: "窄但是乾淨", left: "狭い", leftRuby: "せまい", right: "きれいだ", rightRuby: "きれいだ" },
            { j: "遠いが、よく行く", r: "とおいが、よくいく", zh: "遠但常去", left: "遠い", leftRuby: "とおい", right: "よく行く", rightRuby: "よくいく" },
            { j: "疲れたが、終わっていない", r: "つかれたが、おわっていない", zh: "累但還沒結束", left: "疲れた", leftRuby: "つかれた", right: "終わっていない", rightRuby: "おわっていない" },
            { j: "遅いが、丁寧だ", r: "おそいが、ていねいだ", zh: "慢但是細心", left: "遅い", leftRuby: "おそい", right: "丁寧だ", rightRuby: "ていねいだ" },
            { j: "静かだが、寂しい", r: "しずかだが、さびしい", zh: "安靜但寂寞", left: "静かだ", leftRuby: "しずかだ", right: "寂しい", rightRuby: "さびしい" },
            { j: "近いが、行かない", r: "ちかいが、いかない", zh: "近但是不去", left: "近い", leftRuby: "ちかい", right: "行かない", rightRuby: "いかない" },
            { j: "好きだが、買えない", r: "すきだが、かえない", zh: "喜歡但買不起", left: "好きだ", leftRuby: "すきだ", right: "買えない", rightRuby: "かえない" },
            { j: "暑いが、エアコンがない", r: "あついが、えあこんがない", zh: "熱但是沒有冷氣", left: "暑い", leftRuby: "あつい", right: "エアコンがない", rightRuby: "えあこんがない" },
            { j: "暗いが、怖くない", r: "くらいが、こわくない", zh: "暗但是不怕", left: "暗い", leftRuby: "くらい", right: "怖くない", rightRuby: "こわくない" },
            { j: "重いが、大丈夫だ", r: "おもいが、だいじょうぶだ", zh: "重但是沒關係", left: "重い", leftRuby: "おもい", right: "大丈夫だ", rightRuby: "だいじょうぶだ" },
            { j: "少ないが、ある", r: "すくないが、ある", zh: "少但是有", left: "少ない", leftRuby: "すくない", right: "ある", rightRuby: "ある" },
            { j: "悪いが、仕方ない", r: "わるいが、しかたない", zh: "不好但也沒辦法", left: "悪い", leftRuby: "わるい", right: "仕方ない", rightRuby: "しかたない" },
            { j: "強いが、負けた", r: "つよいが、まけた", zh: "強但是輸了", left: "強い", leftRuby: "つよい", right: "負けた", rightRuby: "まけた" }
        ]
    },
    MO_COMPLETE_NEGATION: {
        safeCombos: [
            { j: "何もない", r: "なにもない", zh: "什麼都沒有", left: "何", leftRuby: "なに", right: "ない", rightRuby: "ない" },
            { j: "誰もいない", r: "だれもいない", zh: "誰都不在", left: "誰", leftRuby: "だれ", right: "いない", rightRuby: "いない" },
            { j: "どこも行かない", r: "どこもいかない", zh: "哪裡都不去", left: "どこ", leftRuby: "どこ", right: "行かない", rightRuby: "いかない" },
            { j: "一つもない", r: "ひとつもない", zh: "一個也沒有", left: "一つ", leftRuby: "ひとつ", right: "ない", rightRuby: "ない" },
            { j: "何も食べない", r: "なにもたべない", zh: "什麼都不吃", left: "何", leftRuby: "なに", right: "食べない", rightRuby: "たべない" },
            { j: "誰も知らない", r: "だれもしらない", zh: "誰都不知道", left: "誰", leftRuby: "だれ", right: "知らない", rightRuby: "しらない" },
            { j: "何も見えない", r: "なにもみえない", zh: "什麼都看不見", left: "何", leftRuby: "なに", right: "見えない", rightRuby: "みえない" },
            { j: "誰もこない", r: "だれもこない", zh: "誰都不會來", left: "誰", leftRuby: "だれ", right: "こない", rightRuby: "こない" },
            { j: "何も欲しくない", r: "なにもほしくない", zh: "什麼也不想要", left: "何", leftRuby: "なに", right: "欲しくない", rightRuby: "ほしくない" },
            { j: "どこもない", r: "どこもない", zh: "哪裡都沒有", left: "どこ", leftRuby: "どこ", right: "ない", rightRuby: "ない" },
            { j: "何もできない", r: "なにもできない", zh: "什麼都不會做", left: "何", leftRuby: "なに", right: "できない", rightRuby: "できない" },
            { j: "一回も行かない", r: "いっかいもいかない", zh: "一次也不去", left: "一回", leftRuby: "いっかい", right: "行かない", rightRuby: "いかない" },
            { j: "一冊もない", r: "いっさつもない", zh: "一本也沒有", left: "一冊", leftRuby: "いっさつ", right: "ない", rightRuby: "ない" },
            { j: "一人もいない", r: "ひとりもいない", zh: "一個人都沒有", left: "一人", leftRuby: "ひとり", right: "いない", rightRuby: "いない" },
            { j: "一日も休まない", r: "いちにちもやすまない", zh: "一天也不休息", left: "一日", leftRuby: "いちにち", right: "休まない", rightRuby: "やすまない" },
            { j: "これもいらない", r: "これもいらない", zh: "這個也不需要", left: "これ", leftRuby: "これ", right: "いらない", rightRuby: "いらない" },
            { j: "誰も話さない", r: "だれもはなさない", zh: "誰都不說話", left: "誰", leftRuby: "だれ", right: "話さない", rightRuby: "はなさない" },
            { j: "何も言わない", r: "なにもいわない", zh: "什麼都不說", left: "何", leftRuby: "なに", right: "言わない", rightRuby: "いわない" },
            { j: "少しも暑くない", r: "すこしもあつくない", zh: "一點也不熱", left: "少し", leftRuby: "すこし", right: "暑くない", rightRuby: "あつくない" },
            { j: "全然も面白くない", r: "ぜんぜんもおもしろくない", zh: "完全不有趣", left: "全然", leftRuby: "ぜんぜん", right: "面白くない", rightRuby: "おもしろくない" }
        ]
    },
    TO_CONDITIONAL: {
        safeCombos: [
            { j: "春になると、暖かくなる", r: "はるになると、あたたかくなる", zh: "春天一到就會變暖", left: "春になる", leftRuby: "はるになる", right: "暖かくなる", rightRuby: "あたたかくなる" },
            { j: "夏になると、暑くなる", r: "なつになると、あつくなる", zh: "夏天一到就會變熱", left: "夏になる", leftRuby: "なつになる", right: "暑くなる", rightRuby: "あつくなる" },
            { j: "秋になると、涼しくなる", r: "あきになると、すずしくなる", zh: "秋天一到就會變涼", left: "秋になる", leftRuby: "あきになる", right: "涼しくなる", rightRuby: "すずしくなる" },
            { j: "冬になると、寒くなる", r: "ふゆになると、さむくなる", zh: "冬天一到就會變冷", left: "冬になる", leftRuby: "ふゆになる", right: "寒くなる", rightRuby: "さむくなる" },
            { j: "右へ曲がると、駅がある", r: "みぎへまがると、えきがある", zh: "右轉就會有車站", left: "右へ曲がる", leftRuby: "みぎへまがる", right: "駅がある", rightRuby: "えきがある" },
            { j: "左へ曲がると、公園がある", r: "ひだりへまがると、こうえんがある", zh: "左轉就會有公園", left: "左へ曲がる", leftRuby: "ひだりへまがる", right: "公園がある", rightRuby: "こうえんがある" },
            { j: "まっすぐ行くと、デパートがある", r: "まっすぐいくと、でぱーとがある", zh: "直走就會有百貨公司", left: "まっすぐ行く", leftRuby: "まっすぐいく", right: "デパートがある", rightRuby: "でぱーとがある" },
            { j: "これを押すと、水が出る", r: "これをおすと、みずがでる", zh: "按這個就會出水", left: "これを押す", leftRuby: "これをおす", right: "水が出る", rightRuby: "みずがでる" },
            { j: "お金を入れると、切符が出る", r: "おかねをいれると、きっぷがでる", zh: "投錢就會掉車票", left: "お金を入れる", leftRuby: "おかねをいれる", right: "切符が出る", rightRuby: "きっぷがでる" },
            { j: "雨が降ると、道が滑る", r: "あめがふると、みちがすべる", zh: "下雨路就會滑", left: "雨が降る", leftRuby: "あめがふる", right: "道が滑る", rightRuby: "みちがすべる" },
            { j: "寒いと、風邪を引く", r: "さむいと、かぜをひく", zh: "冷的話會感冒", left: "寒い", leftRuby: "さむい", right: "風邪を引く", rightRuby: "かぜをひく" },
            { j: "食べないと、お腹がすく", r: "たべないと、おなかがすく", zh: "不吃的話肚子會餓", left: "食べない", leftRuby: "たべない", right: "お腹がすく", rightRuby: "おなかがすく" },
            { j: "たくさん食べると、太る", r: "たくさんたべると、ふとる", zh: "吃很多就會胖", left: "たくさん食べる", leftRuby: "たくさんたべる", right: "太る", rightRuby: "ふとる" },
            { j: "酒を飲むと、顔が赤くなる", r: "さけをのむと、かおがあかくなる", zh: "喝酒臉就會變紅", left: "酒を飲む", leftRuby: "さけをのむ", right: "顔が赤くなる", rightRuby: "かおがあかくなる" },
            { j: "年をとると、目が悪くなる", r: "としをとると、めがわるくなる", zh: "年紀大視力就會變差", left: "年をとる", leftRuby: "としをとる", right: "目が悪くなる", rightRuby: "めがわるくなる" },
            { j: "スイッチを入れると、電気がつく", r: "すいっちをいれると、でんきがつく", zh: "打開開關燈就會亮", left: "スイッチを入れる", leftRuby: "すいっちをいれる", right: "電気がつく", rightRuby: "でんきがつく" },
            { j: "朝になると、明るくなる", r: "あさになると、あかるくなる", zh: "一到早上就會變亮", left: "朝になる", leftRuby: "あさになる", right: "明るくなる", rightRuby: "あかるくなる" },
            { j: "夜になると、暗くなる", r: "よるになると、くらくなる", zh: "一到晚上就會變暗", left: "夜になる", leftRuby: "よるになる", right: "暗くなる", rightRuby: "くらくなる" },
            { j: "窓を開けると、風が入る", r: "まどをあけると、かぜがはいる", zh: "開窗風就會進來", left: "窓を開ける", leftRuby: "まどをあける", right: "風が入る", rightRuby: "かぜがはいる" },
            { j: "休むと、よくなる", r: "やすむと、よくなる", zh: "休息一下就會好轉", left: "休む", leftRuby: "やすむ", right: "よくなる", rightRuby: "よくなる" }
        ]
    },
    NI_TARGET: {
        safeCombos: [
            { j: "先生に聞く", r: "せんせいにきく", zh: "問老師", left: "先生", leftRuby: "せんせい", right: "聞く", rightRuby: "きく" },
            { j: "母に電話する", r: "ははにでんわする", zh: "打電話給媽媽", left: "母", leftRuby: "はは", right: "電話する", rightRuby: "でんわする" },
            { j: "友達に手紙を書く", r: "ともだちにてがみをかく", zh: "寫信給朋友", left: "友達", leftRuby: "ともだち", right: "手紙を書く", rightRuby: "てがみをかく" },
            { j: "兄に言う", r: "あににいう", zh: "跟哥哥說", left: "兄", leftRuby: "あに", right: "言う", rightRuby: "いう" },
            { j: "姉に話す", r: "あねにはなす", zh: "跟姐姐說", left: "姉", leftRuby: "あね", right: "話す", rightRuby: "はなす" },
            { j: "父に説明する", r: "ちちにせつめいする", zh: "向爸爸說明", left: "父", leftRuby: "ちち", right: "説明する", rightRuby: "せつめいする" },
            { j: "家族にメールする", r: "かぞくにめーるする", zh: "發郵件給家人", left: "家族", leftRuby: "かぞく", right: "メールする", rightRuby: "めーるする" },
            { j: "彼女にプレゼントする", r: "かのじょにぷれぜんとする", zh: "送禮物給女朋友", left: "彼女", leftRuby: "かのじょ", right: "プレゼントする", rightRuby: "ぷれぜんとする" },
            { j: "彼氏に電話する", r: "かれしにでんわする", zh: "打電話給男朋友", left: "彼氏", leftRuby: "かれし", right: "電話する", rightRuby: "でんわする" },
            { j: "田中さんに聞く", r: "たなかさんにきく", zh: "問田中先生", left: "田中さん", leftRuby: "たなかさん", right: "聞く", rightRuby: "きく" },
            { j: "弟に教える", r: "おとうとにおしえる", zh: "教弟弟", left: "弟", leftRuby: "おとうと", right: "教える", rightRuby: "おしえる" },
            { j: "猫に餌をやる", r: "ねこにえさをやる", zh: "餵貓", left: "猫", leftRuby: "ねこ", right: "餌をやる", rightRuby: "えさをやる" },
            { j: "店員に頼む", r: "てんいんにたのむ", zh: "拜託店員", left: "店員", leftRuby: "てんいん", right: "頼む", rightRuby: "たのむ" },
            { j: "友達に相談する", r: "ともだちにそうだんする", zh: "找朋友商量", left: "友達", leftRuby: "ともだち", right: "相談する", rightRuby: "そうだんする" },
            { j: "警察に言う", r: "けいさつにいう", zh: "告訴警察", left: "警察", leftRuby: "けいさつ", right: "言う", rightRuby: "いう" },
            { j: "子供に見せる", r: "こどもにみせる", zh: "給小孩子看", left: "子供", leftRuby: "こども", right: "見せる", rightRuby: "みせる" },
            { j: "お客様に挨拶する", r: "おきゃくさまにあいさつする", zh: "向客人打招呼", left: "お客様", leftRuby: "おきゃくさま", right: "挨拶する", rightRuby: "あいさつする" },
            { j: "先生に質問する", r: "せんせいにしつもんする", zh: "向老師提問", left: "先生", leftRuby: "せんせい", right: "質問する", rightRuby: "しつもんする" },
            { j: "後輩に教える", r: "こうはいにおしえる", zh: "教導晚輩", left: "後輩", leftRuby: "こうはい", right: "教える", rightRuby: "おしえる" },
            { j: "先輩に貰う", r: "せんぱいにもらう", zh: "從前輩那收到", left: "先輩", leftRuby: "せんぱい", right: "貰う", rightRuby: "もらう" }
        ]
    }
};

Object.assign(skillsObj, newSkills5);

const newSkillsJson = JSON.stringify(skillsObj, null, 4);
fs.writeFileSync(targetFile, fileContent.substring(0, startIndex) + "skills: " + newSkillsJson + fileContent.substring(endIndex), 'utf8');
console.log("Successfully appended newSkills5 to earlyGamePools.v1.js!");
