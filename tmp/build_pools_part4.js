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

const newSkills4 = {
    DE_TOOL_MEANS: {
        safeCombos: [
            { j: "箸で食べる", r: "はしでたべる", zh: "用筷子吃", left: "箸", leftRuby: "はし", right: "食べる", rightRuby: "たべる" },
            { j: "スプーンで食べる", r: "すぷーんでたべる", zh: "用湯匙吃", left: "スプーン", leftRuby: "すぷーん", right: "食べる", rightRuby: "たべる" },
            { j: "ペンで書く", r: "ぺんでかく", zh: "用筆寫", left: "ペン", leftRuby: "ぺん", right: "書く", rightRuby: "かく" },
            { j: "ナイフで切る", r: "ないふできる", zh: "用刀切", left: "ナイフ", leftRuby: "ないふ", right: "切る", rightRuby: "きる" },
            { j: "パソコンで仕事する", r: "ぱそこんでしごとする", zh: "用電腦工作", left: "パソコン", leftRuby: "ぱそこん", right: "仕事する", rightRuby: "しごとする" },
            { j: "日本語で話す", r: "にほんごではなす", zh: "用日語說話", left: "日本語", leftRuby: "にほんご", right: "話す", rightRuby: "はなす" },
            { j: "英語で説明する", r: "えいごでせつめいする", zh: "用英語說明", left: "英語", leftRuby: "えいご", right: "説明する", rightRuby: "せつめいする" },
            { j: "中国語で書く", r: "ちゅうごくごでかく", zh: "用中文寫", left: "中国語", leftRuby: "ちゅうごくご", right: "書く", rightRuby: "かく" },
            { j: "バスで行く", r: "ばすでいく", zh: "搭巴士去", left: "バス", leftRuby: "ばす", right: "行く", rightRuby: "いく" },
            { j: "電車で帰る", r: "でんしゃでかえる", zh: "搭電車回", left: "電車", leftRuby: "でんしゃ", right: "帰る", rightRuby: "かえる" },
            { j: "自転車で来る", r: "じてんしゃでくる", zh: "騎自行車來", left: "自転車", leftRuby: "じてんしゃ", right: "来る", rightRuby: "くる" },
            { j: "車で行く", r: "くるまでいく", zh: "開車去", left: "車", leftRuby: "くるま", right: "行く", rightRuby: "いく" },
            { j: "タクシーで来る", r: "たくしーでくる", zh: "搭計程車來", left: "タクシー", leftRuby: "たくしー", right: "来る", rightRuby: "くる" },
            { j: "飛行機で帰る", r: "ひこうきでかえる", zh: "搭飛機回", left: "飛行機", leftRuby: "ひこうき", right: "帰る", rightRuby: "かえる" },
            { j: "スマホで調べる", r: "すまほでしらべる", zh: "用手機查", left: "スマホ", leftRuby: "すまほ", right: "調べる", rightRuby: "しらべる" },
            { j: "メールで送る", r: "めーるでおくる", zh: "用郵件寄給", left: "メール", leftRuby: "めーる", right: "送る", rightRuby: "おくる" },
            { j: "手で食べる", r: "てでたべる", zh: "用手吃", left: "手", leftRuby: "て", right: "食べる", rightRuby: "たべる" },
            { j: "カメラで撮る", r: "かめらでとる", zh: "用相機拍", left: "カメラ", leftRuby: "かめら", right: "撮る", rightRuby: "とる" },
            { j: "ハサミで切る", r: "はさみできる", zh: "用剪刀剪", left: "ハサミ", leftRuby: "はさみ", right: "切る", rightRuby: "きる" },
            { j: "カードで払う", r: "かーどではらう", zh: "用卡付款", left: "カード", leftRuby: "かーど", right: "払う", rightRuby: "はらう" }
        ]
    },
    YA_AND_OTHERS: {
        safeCombos: [
            { j: "パンや牛乳を買う", r: "ぱんやぎゅうにゅうをかう", zh: "買麵包和牛奶等", left: "パン", leftRuby: "ぱん", right: "牛乳を買う", rightRuby: "ぎゅうにゅうをかう" },
            { j: "本やノートを買う", r: "ほんやのーとをかう", zh: "買書和筆記本等", left: "本", leftRuby: "ほん", right: "ノートを買う", rightRuby: "のーとをかう" },
            { j: "犬や猫が好きだ", r: "いぬやねこがすきだ", zh: "喜歡貓狗等", left: "犬", leftRuby: "いぬ", right: "猫が好きだ", rightRuby: "ねこがすきだ" },
            { j: "りんごやバナナを食べる", r: "りんごやばななをたべる", zh: "吃蘋果和香蕉等", left: "りんご", leftRuby: "りんご", right: "バナナを食べる", rightRuby: "ばななをたべる" },
            { j: "机や椅子がある", r: "つくえやいすがある", zh: "有桌椅等", left: "机", leftRuby: "つくえ", right: "椅子がある", rightRuby: "いすがある" },
            { j: "映画やアニメを見る", r: "えいがやあにめをみる", zh: "看電影和動畫等", left: "映画", leftRuby: "えいが", right: "アニメを見る", rightRuby: "あにめをみる" },
            { j: "英語や日本語を話す", r: "えいごやにほんごをはなす", zh: "說英日文等", left: "英語", leftRuby: "えいご", right: "日本語を話す", rightRuby: "にほんごをはなす" },
            { j: "肉や魚を食べる", r: "にくやさかなをたべる", zh: "吃肉和魚等", left: "肉", leftRuby: "にく", right: "魚を食べる", rightRuby: "さかなをたべる" },
            { j: "シャツやズボンを買う", r: "しゃつやずぼんをかう", zh: "買衣服褲子等", left: "シャツ", leftRuby: "しゃつ", right: "ズボンを買う", rightRuby: "ずぼんをかう" },
            { j: "パソコンやスマホを使う", r: "ぱそこんやすまほをつかう", zh: "用電腦手機等", left: "パソコン", leftRuby: "ぱそこん", right: "スマホを使う", rightRuby: "すまほをつかう" },
            { j: "紅茶やコーヒーを飲む", r: "こうちゃやこーひーをのむ", zh: "喝紅茶咖啡等", left: "紅茶", leftRuby: "こうちゃ", right: "コーヒーを飲む", rightRuby: "こーひーをのむ" },
            { j: "ケーキやクッキーを作る", r: "けーきやくっきーをつくる", zh: "做蛋糕餅乾等", left: "ケーキ", leftRuby: "けーき", right: "クッキーを作る", rightRuby: "くっきーをつくる" },
            { j: "雑誌や新聞を読む", r: "ざっしやしんぶんをよむ", zh: "看雜誌報紙等", left: "雑誌", leftRuby: "ざっし", right: "新聞を読む", rightRuby: "しんぶんをよむ" },
            { j: "春や秋が好きだ", r: "はるやあきがすきだ", zh: "喜歡春秋等", left: "春", leftRuby: "はる", right: "秋が好きだ", rightRuby: "あきがすきだ" },
            { j: "ペンや消しゴムがある", r: "ぺんやけしごむがある", zh: "有筆和橡皮擦等", left: "ペン", leftRuby: "ぺん", right: "消しゴムがある", rightRuby: "けしごむがある" },
            { j: "バスや電車で行く", r: "ばすやでんしゃでいく", zh: "搭公車電車等", left: "バス", leftRuby: "ばす", right: "電車で行く", rightRuby: "でんしゃでいく" },
            { j: "兄や姉がいる", r: "あにやあねがいる", zh: "有哥哥姐姐等", left: "兄", leftRuby: "あに", right: "姉がいる", rightRuby: "あねがいる" },
            { j: "ビールやワインを飲む", r: "びーるやわいんをのむ", zh: "喝啤酒紅酒等", left: "ビール", leftRuby: "びーる", right: "ワインを飲む", rightRuby: "わいんをのむ" },
            { j: "野球やサッカーをする", r: "やきゅうやさっかーをする", zh: "打棒球足球等", left: "野球", leftRuby: "やきゅう", right: "サッカーをする", rightRuby: "さっかーをする" },
            { j: "京都や大阪へ行く", r: "きょうとやおおさかへいく", zh: "去京都大阪等", left: "京都", leftRuby: "きょうと", right: "大阪へ行く", rightRuby: "おおさかへいく" }
        ]
    },
    DE_SCOPE: {
        safeCombos: [
            { j: "クラスで一番背が高い人", r: "くらすでいちばんせがたかいひと", zh: "班上最高的人", left: "クラス", leftRuby: "くらす", right: "一番背が高い人", rightRuby: "いちばんせがたかいひと" },
            { j: "日本で一番高い山", r: "にほんでいちばんたかいやま", zh: "日本最高的山", left: "日本", leftRuby: "にほん", right: "一番高い山", rightRuby: "いちばんたかいやま" },
            { j: "世界で一番大きい動物", r: "せかいでいちばんおおきいどうぶつ", zh: "世界最大的動物", left: "世界", leftRuby: "せかい", right: "一番大きい動物", rightRuby: "いちばんおおきいどうぶつ" },
            { j: "この店で一番美味しいケーキ", r: "このみせでいちばんおいしいけーき", zh: "這家店最好吃的蛋糕", left: "この店", leftRuby: "このみせ", right: "一番美味しいケーキ", rightRuby: "いちばんおいしいけーき" },
            { j: "学校で一番人気の先生", r: "がっこうでいちばんにんきのせんせい", zh: "學校最紅的老師", left: "学校", leftRuby: "がっこう", right: "一番人気の先生", rightRuby: "いちばんにんきのせんせい" },
            { j: "一年で一番暑い月", r: "いちねんでいちばんあついつき", zh: "一年中最熱的月份", left: "一年", leftRuby: "いちねん", right: "一番暑い月", rightRuby: "いちばんあついつき" },
            { j: "日本で一番速い電車", r: "にほんでいちばんはやいでんしゃ", zh: "日本最快的電車", left: "日本", leftRuby: "にほん", right: "一番速い電車", rightRuby: "いちばんはやいでんしゃ" },
            { j: "アジアで一番長い川", r: "あじあでいちばんながいかわ", zh: "亞洲最長的河", left: "アジア", leftRuby: "あじあ", right: "一番長い川", rightRuby: "いちばんながいかわ" },
            { j: "家族で一番背が低い人", r: "かぞくでいちばんせがひくいひと", zh: "家裡最矮的人", left: "家族", leftRuby: "かぞく", right: "一番背が低い人", rightRuby: "いちばんせがひくいひと" },
            { j: "町で一番古い店", r: "まちでいちばんふるいみせ", zh: "鎮上最老的店", left: "町", leftRuby: "まち", right: "一番古い店", rightRuby: "いちばんふるいみせ" },
            { j: "東京で一番高いビル", r: "とうきょうでいちばんたかいびる", zh: "東京最高的大樓", left: "東京", leftRuby: "とうきょう", right: "一番高いビル", rightRuby: "いちばんたかいびる" },
            { j: "この中で一番安いパソコン", r: "このなかでいちばんやすいぱそこん", zh: "這之中最便宜的電腦", left: "この中", leftRuby: "このなか", right: "一番安いパソコン", rightRuby: "いちばんやすいぱそこん" },
            { j: "クラスで一番足が速い", r: "くらすでいちばんあしがはやい", zh: "班上跑最快", left: "クラス", leftRuby: "くらす", right: "一番足が速い", rightRuby: "いちばんあしがはやい" },
            { j: "会社で一番若い社員", r: "かいしゃでいちばんわかいしゃいん", zh: "公司最年輕的員工", left: "会社", leftRuby: "かいしゃ", right: "一番若い社員", rightRuby: "いちばんわかいしゃいん" },
            { j: "果物で一番好きだ", r: "くだものでいちばんすきだ", zh: "水果中最喜歡的", left: "果物", leftRuby: "くだもの", right: "一番好きだ", rightRuby: "いちばんすきだ" },
            { j: "スポーツで一番得意だ", r: "すぽーつでいちばんとくいだ", zh: "運動中最拿手的", left: "スポーツ", leftRuby: "すぽーつ", right: "一番得意だ", rightRuby: "いちばんとくいだ" },
            { j: "世界で一番有名な人", r: "せかいでいちばんゆうめいなひと", zh: "世界上最有名的人", left: "世界", leftRuby: "せかい", right: "一番有名な人", rightRuby: "いちばんゆうめいなひと" },
            { j: "三人で一番頭がいい", r: "さんにんでいちばんあたまがいい", zh: "三人中最聰明的", left: "三人", leftRuby: "さんにん", right: "一番頭がいい", rightRuby: "いちばんあたまがいい" },
            { j: "車の中で一番高い", r: "くるまのなかでいちばんたかい", zh: "車子中最貴的", left: "車の中", leftRuby: "くるまのなか", right: "一番高い", rightRuby: "いちばんたかい" },
            { j: "これ全部で千円だ", r: "これぜんぶでせんえんだ", zh: "這全部共一千日圓(範圍)", left: "これ全部", leftRuby: "これぜんぶ", right: "千円だ", rightRuby: "せんえんだ" }
        ]
    },
    NI_PURPOSE: {
        safeCombos: [
            { j: "本を買いに行く", r: "ほんをかいにいく", zh: "去買書", left: "本を買い", leftRuby: "ほんをかい", right: "行く", rightRuby: "いく" },
            { j: "映画を見に行く", r: "えいがをみにいく", zh: "去看電影", left: "映画を見", leftRuby: "えいがをみ", right: "行く", rightRuby: "いく" },
            { j: "パンを買いに行く", r: "ぱんをかいにいく", zh: "去買麵包", left: "パンを買い", leftRuby: "ぱんをかい", right: "行く", rightRuby: "いく" },
            { j: "散歩しに出る", r: "さんぽしにでる", zh: "出去散步", left: "散歩し", leftRuby: "さんぽし", right: "出る", rightRuby: "でる" },
            { j: "遊びに行く", r: "あそびにいく", zh: "去玩", left: "遊び", leftRuby: "あそび", right: "行く", rightRuby: "いく" },
            { j: "泳ぎに行く", r: "およぎにいく", zh: "去游泳", left: "泳ぎ", leftRuby: "およぎ", right: "行く", rightRuby: "いく" },
            { j: "昼ご飯を食べに行く", r: "ひるごはんをたべにいく", zh: "去吃午餐", left: "昼ご飯を食べ", leftRuby: "ひるごはんをたべ", right: "行く", rightRuby: "いく" },
            { j: "お茶を飲みに行く", r: "おちゃをのみにいく", zh: "去喝茶", left: "お茶を飲み", leftRuby: "おちゃをのみ", right: "行く", rightRuby: "いく" },
            { j: "晩ご飯を食べに帰る", r: "ばんごはんをたべにかえる", zh: "回去吃晚餐", left: "晩ご飯を食べ", leftRuby: "ばんごはんをたべ", right: "帰る", rightRuby: "かえる" },
            { j: "服を買いに出かける", r: "ふくをかいにでかける", zh: "出門買衣服", left: "服を買い", leftRuby: "ふくをかい", right: "出かける", rightRuby: "でかける" },
            { j: "写真を撮りに行く", r: "しゃしんをとりにいく", zh: "去拍照", left: "写真を撮り", leftRuby: "しゃしんをとり", right: "行く", rightRuby: "いく" },
            { j: "勉強しに行く", r: "べんきょうしにいく", zh: "去讀書", left: "勉強し", leftRuby: "べんきょうし", right: "行く", rightRuby: "いく" },
            { j: "借りに行く", r: "かりにいく", zh: "去借", left: "借り", leftRuby: "かり", right: "行く", rightRuby: "いく" },
            { j: "友達に会いに行く", r: "ともだちにあいにいく", zh: "去見朋友", left: "友達に会い", leftRuby: "ともだちにあい", right: "行く", rightRuby: "いく" },
            { j: "話しに来る", r: "はなしにくる", zh: "來談事情", left: "話し", leftRuby: "はなし", right: "来る", rightRuby: "くる" },
            { j: "仕事をしに行く", r: "しごとをしにいく", zh: "去工作", left: "仕事をし", leftRuby: "しごとをし", right: "行く", rightRuby: "いく" },
            { j: "迎えに行く", r: "むかえにいく", zh: "去迎接", left: "迎え", leftRuby: "むかえ", right: "行く", rightRuby: "いく" },
            { j: "温泉に入りに行く", r: "おんせんにはいりにいく", zh: "去泡溫泉", left: "温泉に入り", leftRuby: "おんせんにはいり", right: "行く", rightRuby: "いく" },
            { j: "ケーキを買いに行く", r: "けーきをかいにいく", zh: "去買蛋糕", left: "ケーキを買い", leftRuby: "けーきをかい", right: "行く", rightRuby: "いく" },
            { j: "荷物を取りに行く", r: "にもつをとりにいく", zh: "去拿行李", left: "荷物を取り", leftRuby: "にもつをとり", right: "行く", rightRuby: "いく" }
        ]
    },
    TO_QUOTE: {
        safeCombos: [
            { j: "「ありがとう」と言う", r: "「ありがとう」という", zh: "說「謝謝」", left: "「ありがとう」", leftRuby: "「ありがとう」", right: "言う", rightRuby: "いう" },
            { j: "「行きたい」と思う", r: "「いきたい」とおもう", zh: "覺得「想去」", left: "「行きたい」", leftRuby: "「いきたい」", right: "思う", rightRuby: "おもう" },
            { j: "「大丈夫」と言う", r: "「だいじょうぶ」という", zh: "說「沒問題」", left: "「大丈夫」", leftRuby: "「だいじょうぶ」", right: "言う", rightRuby: "いう" },
            { j: "「おはよう」と言う", r: "「おはよう」という", zh: "說「早安」", left: "「おはよう」", leftRuby: "「おはよう」", right: "言う", rightRuby: "いう" },
            { j: "「行こう」と言う", r: "「いこう」という", zh: "說「走吧」", left: "「行こう」", leftRuby: "「いこう」", right: "言う", rightRuby: "いう" },
            { j: "「美味しい」と思う", r: "「おいしい」とおもう", zh: "覺得「很好吃」", left: "「美味しい」", leftRuby: "「おいしい」", right: "思う", rightRuby: "おもう" },
            { j: "「好きだ」と言う", r: "「すきだ」という", zh: "說「喜歡」", left: "「好きだ」", leftRuby: "「すきだ」", right: "言う", rightRuby: "いう" },
            { j: "「高い」と思う", r: "「たかい」とおもう", zh: "覺得「很貴」", left: "「高い」", leftRuby: "「たかい」", right: "思う", rightRuby: "おもう" },
            { j: "「安い」と思う", r: "「やすい」とおもう", zh: "覺得「便宜」", left: "「安い」", leftRuby: "「やすい」", right: "思う", rightRuby: "おもう" },
            { j: "「すごい」と言う", r: "「すごい」という", zh: "說「好厲害」", left: "「すごい」", leftRuby: "「すごい」", right: "言う", rightRuby: "いう" },
            { j: "「はい」と言う", r: "「はい」という", zh: "說「是」", left: "「はい」", leftRuby: "「はい」", right: "言う", rightRuby: "いう" },
            { j: "「無理だ」と思う", r: "「むりだ」とおもう", zh: "覺得「不可能」", left: "「無理だ」", leftRuby: "「むりだ」", right: "思う", rightRuby: "おもう" },
            { j: "「さようなら」と言う", r: "「さようなら」という", zh: "說「再見」", left: "「さようなら」", leftRuby: "「さようなら」", right: "言う", rightRuby: "いう" },
            { j: "「難しい」と思う", r: "「むずかしい」とおもう", zh: "覺得「很難」", left: "「難しい」", leftRuby: "「むずかしい」", right: "思う", rightRuby: "おもう" },
            { j: "「ごめん」と言う", r: "「ごめん」という", zh: "說「對不起」", left: "「ごめん」", leftRuby: "「ごめん」", right: "言う", rightRuby: "いう" },
            { j: "「楽しい」と思う", r: "「たのしい」とおもう", zh: "覺得「好玩」", left: "「楽しい」", leftRuby: "「たのしい」", right: "思う", rightRuby: "おもう" },
            { j: "「本当だ」と言う", r: "「ほんとうだ」という", zh: "說「是真的」", left: "「本当だ」", leftRuby: "「ほんとうだ」", right: "言う", rightRuby: "いう" },
            { j: "「疲れた」と思う", r: "「つかれた」とおもう", zh: "心想「累了」", left: "「疲れた」", leftRuby: "「つかれた」", right: "思う", rightRuby: "おもう" },
            { j: "「きれいだ」と思う", r: "「きれいだ」とおもう", zh: "覺得「很漂亮」", left: "「きれいだ」", leftRuby: "「きれいだ」", right: "思う", rightRuby: "おもう" },
            { j: "「待って」と言う", r: "「まって」という", zh: "說「等一下」", left: "「待って」", leftRuby: "「まって」", right: "言う", rightRuby: "いう" }
        ]
    }
};

Object.assign(skillsObj, newSkills4);

const newSkillsJson = JSON.stringify(skillsObj, null, 4);
fs.writeFileSync(targetFile, fileContent.substring(0, startIndex) + "skills: " + newSkillsJson + fileContent.substring(endIndex), 'utf8');
console.log("Successfully appended newSkills4 to earlyGamePools.v1.js!");
