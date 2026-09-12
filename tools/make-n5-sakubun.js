// N5 造句卷（2頁題目 + 解答卷），涵蓋 N5 全部文法點
// 用法：node tools/make-n5-sakubun.js → build/n5-sakubun*.html
// 答案裡凡是動詞變化，都用 verbs.js 引擎產生，不手寫。
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const ROOT = path.join(__dirname, "..");
vm.runInThisContext(fs.readFileSync(path.join(ROOT, "verbs.js"), "utf8"));

const VB = {};
[...N4_VERBS, ...pairVerbs()].forEach(x => { if (!VB[x.dict]) VB[x.dict] = x; });
const READ = {
  "行く":"いく","来る":"くる","する":"する","食べる":"たべる","飲む":"のむ","見る":"みる",
  "読む":"よむ","書く":"かく","聞く":"きく","話す":"はなす","会う":"あう","買う":"かう",
  "待つ":"まつ","持つ":"もつ","帰る":"かえる","入る":"はいる","出る":"でる","乗る":"のる",
  "降りる":"おりる","起きる":"おきる","寝る":"ねる","働く":"はたらく","休む":"やすむ",
  "泳ぐ":"およぐ","急ぐ":"いそぐ","遊ぶ":"あそぶ","呼ぶ":"よぶ","作る":"つくる","洗う":"あらう",
  "撮る":"とる","吸う":"すう","消す":"けす","開ける":"あける","閉める":"しめる","教える":"おしえる",
  "貸す":"かす","借りる":"かりる","使う":"つかう","住む":"すむ","降る":"ふる","歩く":"あるく",
  "座る":"すわる","立つ":"たつ","運ぶ":"はこぶ","覚える":"おぼえる","勉強する":"べんきょうする",
  "掃除する":"そうじする","散歩する":"さんぽする","結婚する":"けっこんする","浴びる":"あびる",
  "歌う":"うたう","払う":"はらう","止める":"とめる","脱ぐ":"ぬぐ","置く":"おく"
};
function C(dict, form) {
  const v = VB[dict] || normalizeVerb(dict, READ[dict] || dict, "", "");
  if (!v) throw new Error("找不到動詞：" + dict);
  const r = conjugate(v, form);
  if (!r) throw new Error(`變化失敗：${dict} ${form}`);
  return r;
}
// 自我檢查
[["洗う","te","洗って"],["急ぐ","te","急いで"],["読む","ta","読んだ"],["降る","te","降って"],
 ["帰る","nai","帰らない"],["来る","te","来て"],["する","nai","しない"]]
 .forEach(([d,f,e]) => { if (C(d,f) !== e) throw new Error(`引擎不符 ${d} ${f}`); });
console.log("✓ 引擎自我檢查通過");

// ---------- 題目 ----------
// [中文, 提示單字, 參考答案, 涵蓋的知識點]
const PAGES = [
{
 title:"N5 造句練習卷　第1回",
 sub:"名詞句・形容詞句／指示・移動・存在・比較／助詞／邀約・提議",
 blocks:[
  { h:"A　名詞句・形容詞句", tip:"接名詞：い形直接接／な形加な／名詞加の。否定：い形〜くない、な形・名詞〜ではありません。", items:[
   ["我是學生，不是老師。", "学生・先生", "わたしは学生です。先生ではありません。", "名詞＋です／名詞否定"],
   ["這是我的書。", "本", "これはわたしの本です。", "指示語これ／名詞＋の＋名詞"],
   ["台北是熱鬧的城市，富士山是高山。", "賑やか・町・高い・山", "台北は賑やかな町です。富士山は高い山です。", "な形＋な＋名詞／い形直接接名詞"],
   ["這家店不便宜。", "店・安い", "この店は安くないです。", "い形否定／この＋名詞"],
   ["昨天很冷。", "昨日・寒い", "昨日は寒かったです。", "い形過去"],
   ["這個房間不乾淨。", "部屋・きれい", "この部屋はきれいではありません。", "な形否定（きれい是な形）"]
  ]},
  { h:"B　指示語・移動・存在・比較", tip:"こ近我／そ近你／あ都遠。存在：有生命います、無生命あります。比較：AはBより〜／AとBとどちらが〜。", items:[
   ["那個（較遠）是什麼？", "何", "あれは何ですか。", "あれ（不接名詞）"],
   ["弟弟去學校。", "弟・学校・行く", "弟は学校へ行きます。", "場所＋へ＋移動動詞"],
   ["我去看煙火。", "花火・見る・行く", `花火を${C("見る","masu").replace("ます","")}に行きます。`, "V2＋に行く（目的）"],
   ["公園裡有狗，書架上有書。", "公園・犬・本棚・本", "公園に犬がいます。本棚に本があります。", "います（有生命）／あります（無生命）"],
   ["台灣比日本熱。", "台湾・日本・暑い", "台湾は日本より暑いです。", "AはBより〜"],
   ["日文和英文哪個比較難？", "日本語・英語・難しい", "日本語と英語とどちらが難しいですか。", "AとBとどちらが〜"]
  ]},
  { h:"C　助詞", tip:"に＝時間點・到達點・對象／で＝場所・手段／も＝也。★会う・乗る的對象用に。", items:[
   ["我七點起床，九點跟朋友見面。", "7時・起きる・9時・友達・会う", `7時に${C("起きる","masu")}。9時に友達に${C("会う","masu")}。`, "時間點＋に／★会う的對象用に"],
   ["在圖書館唸書。", "図書館・勉強する", `図書館で${C("勉強する","masu")}。`, "場所＋で（動作）"],
   ["搭公車去公司。", "バス・会社・行く", "バスで会社へ行きます。", "交通工具＋で"],
   ["他也是學生。", "学生", "彼も学生です。", "も（取代は）"],
   ["我什麼都沒吃。", "食べる", `何も${C("食べる","masu").replace("ます","ませんでした")}。`, "疑問詞＋も＋否定"]
  ]},
  { h:"D　邀約・提議・進度確認", tip:"ませんか＝邀約／ましょう＝一起做吧／ましょうか＝我來幫你做／もう〜ましたか（否定答まだです）。", items:[
   ["要不要一起吃飯？", "一緒に・ご飯・食べる", `一緒にご飯を${C("食べる","masu").replace("ます","ませんか")}。`, "〜ませんか（邀約）"],
   ["走吧！", "行く", `${C("行く","masu").replace("ます","ましょう")}。`, "〜ましょう（提議）"],
   ["我來幫你拿行李吧？", "荷物・持つ", `荷物を${C("持つ","masu").replace("ます","ましょうか")}。`, "〜ましょうか（替對方做）"],
   ["「已經寫作業了嗎？」「不，還沒。」", "宿題・する", "「もう宿題をしましたか。」「いいえ、まだです。」", "もう〜ましたか／まだです"]
  ]}
 ]
},
{
 title:"N5 造句練習卷　第2回",
 sub:"て形句型／ない形・希望／時間前後／授受動詞／こと・假設・引用・修飾",
 blocks:[
  { h:"E　て形句型", tip:"先變て形，再掛尾巴（います／もいいですか／はいけません／から／も）。尾巴不會跟著濁音。", items:[
   ["我現在正在唸日文。", "今・日本語・勉強する", `今、日本語を${C("勉強する","te")}います。`, "て形＋います"],
   ["這裡可以拍照嗎？不，這裡不可以拍照。", "写真・撮る", `ここで写真を${C("撮る","te")}もいいですか。いいえ、${C("撮る","te")}はいけません。`, "てもいいですか（許可）／てはいけません（禁止）"],
   ["洗完手之後再吃飯。", "手・洗う・ご飯・食べる", `手を${C("洗う","te")}から、ご飯を${C("食べる","masu")}。`, "★てから（不是たから）"],
   ["就算下雨我也要去。", "雨・降る・行く", `雨が${C("降る","te")}も、${C("行く","masu")}。`, "て形＋も（即使）"],
   ["這個包包又大又黑。", "かばん・大きい・黒い", "このかばんは大きくて黒いです。", "い形去い＋くて（並列）"],
   ["假日會看看書、聽聽音樂。", "休みの日・本・読む・音楽・聞く", `休みの日は本を${C("読む","ta")}り、音楽を${C("聞く","ta")}りします。`, "〜たり〜たりします"]
  ]},
  { h:"F　ない形・希望", tip:"ないでください＝直接接ない；なくてもいい・なければならない＝先去い。想做用たい、想要物用が＋ほしい。", items:[
   ["請不要拍照。", "写真・撮る", `写真を${C("撮る","nai")}でください。`, "ない形＋でください"],
   ["明天放假，可以不用早起。", "明日・休み・早い・起きる", `明日は休みなので、早く${C("起きる","nai").slice(0,-1)}くてもいいです。`, "なので／副詞化早く／なくてもいいです"],
   ["已經十二點了，必須回家。", "12時・家・帰る", `もう12時だから、家に${C("帰る","nai").slice(0,-1)}ければなりません。`, "★帰る是1類／なければなりません"],
   ["我想去日本，想要新的行李箱。", "日本・行く・新しい・かばん", `日本へ${C("行く","masu").replace("ます","たいです")}。新しいかばんがほしいです。`, "〜たいです（想做）／★名詞が＋ほしい（想要）"],
   ["我什麼都不想吃。", "食べる", "何も食べたくないです。", "たい的否定（たい是い形容詞）"]
  ]},
  { h:"G　時間前後・ながら", tip:"前に接辭書形、後で接た形（名詞加の）。行く時＝去之前／行った時＝到了之後。ながら接ます形去ます。", items:[
   ["睡前唸一點日文；用餐前請洗手。", "寝る・勉強する・食事・手・洗う", `寝る前に、少し日本語を${C("勉強する","masu")}。食事の前に、手を${C("洗う","te")}ください。`, "辭書形＋前に／名詞の＋前に／てください"],
   ["到朋友家之後寫作業，寫完作業後回家。", "友達・家・行く・宿題・する・帰る", `友達の家に${C("行く","ta")}時、宿題を${C("する","masu")}。宿題を${C("する","ta")}後で、${C("帰る","masu")}。`, "★た形＋時（到了之後）／た形＋後で"],
   ["我一邊聽音樂一邊唸書。", "音楽・聞く・勉強する", `音楽を${C("聞く","masu").replace("ます","")}ながら、${C("勉強する","masu")}。`, "ます形去ます＋ながら"]
  ]},
  { h:"H　授受動詞", tip:"我→別人＝あげる／別人→我＝くれる／我請別人做＝もらう。動作恩惠用て形＋這三個。", items:[
   ["我給他照片，他也給我照片。", "彼・写真", "わたしは彼に写真をあげます。彼もわたしに写真をくれます。", "あげる（我→別人）／★くれる（別人→我）"],
   ["朋友幫我拍了照片，我也請朋友幫我改了作文。", "友達・写真・撮る・作文・直す", `友達が写真を${C("撮る","te")}くれました。作文も友達に直してもらいました。`, "て形＋くれる（別人為我做）／て形＋もらう（我請人做）"]
  ]},
  { h:"I　こと・假設・引用・修飾・確認", tip:"たことがある用た形／ことができる用辭書形／と思います前面な形名詞要加だ／でしょう不加だ。", items:[
   ["我去過日本。", "日本・行く", `わたしは日本へ${C("行く","ta")}ことがあります。`, "た形＋ことがあります（經驗）"],
   ["我會說日文。我的興趣是看電影。", "日本語・話す・趣味・映画・見る", "わたしは日本語を話すことができます。わたしの趣味は映画を見ることです。", "ことができる／こと（名詞化）"],
   ["便宜的話我就買。", "安い・買う", `安かったら${C("買う","masu")}。`, "い形＋かったら"],
   ["我覺得東京很方便。", "東京・便利", "東京は便利だと思います。", "★な形＋だ＋と思います"],
   ["這是媽媽做的菜。很好吃吧？", "母・作る・料理・おいしい", `これは母が${C("作る","ta")}料理です。おいしいでしょう。`, "連體修飾（た形接名詞）／〜でしょう（不加だ）"]
  ]}
 ]
}
];

// ---------- 排版 ----------
const CSS = `
@page { size: A4; margin: 9mm 9mm; }
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:"Hiragino Sans","Noto Sans TC","Yu Gothic",sans-serif; color:#000; background:#fff; font-size:9pt; line-height:1.3; }
.page { width:192mm; min-height:278mm; page-break-after:always; position:relative; padding-bottom:6mm; }
.page:last-child { page-break-after:auto; }
.head { border-bottom:2px solid #000; padding-bottom:2.2mm; margin-bottom:2.2mm; display:flex; align-items:baseline; justify-content:space-between; }
.head h1 { font-size:13pt; } .head .sub { font-size:8pt; color:#444; margin-top:.7mm; }
.head .meta { font-size:8pt; color:#444; white-space:nowrap; }
.blk { margin-bottom:1.3mm; break-inside:avoid; }
.blk h2 { font-size:9.4pt; background:#000; color:#fff; padding:.6mm 2mm; display:inline-block; }
.blk .tip { font-size:7pt; color:#333; border-left:2px solid #999; padding-left:2mm; margin:.4mm 0 .6mm; line-height:1.22; }
.q { display:flex; align-items:baseline; gap:1.2mm; font-size:8.6pt; padding:.1mm 0; }
.q .n { width:5.5mm; flex:0 0 5.5mm; font-size:7.5pt; color:#555; }
.q .zh { flex:1; }
.q .hint { font-size:7.4pt; color:#444; white-space:nowrap; }
.wline { border-bottom:1px solid #000; height:4.4mm; margin:.1mm 0 .6mm 5.5mm; }
.foot { position:absolute; bottom:0; width:100%; border-top:1px solid #000; padding-top:1.1mm; font-size:7.3pt; color:#444; display:flex; justify-content:space-between; }
/* 解答卷 */
.ans-sheet { font-size:8.3pt; line-height:1.3; }
.ans-sheet .aq { padding:.55mm 0; border-bottom:1px dotted #bbb; break-inside:avoid; }
.ans-sheet .aq .zh { font-size:7.6pt; color:#444; }
.ans-sheet .aq .a { font-weight:700; font-size:9pt; }
.ans-sheet .aq .pt { font-size:7.1pt; color:#333; }
.ans-sheet .blk { margin-bottom:1.7mm; }
.ans-sheet .blk h2 { font-size:8.6pt; padding:.5mm 1.5mm; }
.ans-sheet .foot { position:static; margin-top:2mm; }
.cov { border:1px solid #000; padding:1.5mm 2mm; margin-top:2mm; font-size:7.2pt; line-height:1.45; }
.cov b { font-size:7.8pt; }
@media screen { body{padding:10mm;background:#eee;} .page{background:#fff;margin:0 auto 8mm;padding:9mm 9mm 12mm;box-shadow:0 1px 4px rgba(0,0,0,.3);} }
`;

function build(showAns) {
  let html = "";
  PAGES.forEach((pg, pi) => {
    let n = 0;
    const cnt = pg.blocks.reduce((t, b) => t + b.items.length, 0);
    html += `<div class="page${showAns ? " ans-sheet" : ""}">` +
      `<div class="head"><div><h1>${pg.title}${showAns ? "　解答" : ""}</h1>` +
      `<div class="sub">${pg.sub}</div></div>` +
      `<div class="meta">${showAns ? `全${cnt}問` : "名前 ____________　日付 ____ / ____"}</div></div>`;
    pg.blocks.forEach(b => {
      html += `<div class="blk"><h2>${b.h}</h2><div class="tip">${b.tip}</div>`;
      b.items.forEach(([zh, hint, ans, pt]) => {
        n++;
        html += showAns
          ? `<div class="aq"><span class="zh">${n}. ${zh}</span><br>` +
            `<span class="a">${ans}</span>　<span class="pt">［${pt}］</span></div>`
          : `<div class="q"><span class="n">${n}.</span><span class="zh">${zh}</span>` +
            `<span class="hint">［${hint}］</span></div><div class="wline"></div>`;
      });
      html += `</div>`;
    });
    html += `<div class="foot"><span>N5 造句練習卷　${showAns ? "解答" : "問題"}</span>` +
      `<span>${showAns ? `第${pi + 1}回` : `${pi + 1} / ${PAGES.length}`}</span></div></div>`;
  });
  return html;
}

// 涵蓋範圍清單（附在解答卷最後）
function coverage() {
  const pts = [];
  PAGES.forEach(p => p.blocks.forEach(b => b.items.forEach(i => pts.push(i[3]))));
  return `<div class="cov"><b>本卷涵蓋的 N5 知識點（共 ${pts.length} 項）</b><br>` +
    pts.map((p, i) => `${i + 1}. ${p}`).join("　／　") + `</div>`;
}

const page = (t, b) => `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${t}</title>
<style>${CSS}</style></head><body>${b}</body></html>`;

const BUILD = path.join(ROOT, "build");
fs.mkdirSync(BUILD, { recursive: true });
fs.writeFileSync(path.join(BUILD, "n5-sakubun.html"), page("N5 造句練習卷（問題）", build(false)), "utf8");
fs.writeFileSync(path.join(BUILD, "n5-sakubun-answers.html"),
  page("N5 造句練習卷（解答）", build(true).replace("</div></div>$", "</div></div>") + coverage()), "utf8");

const total = PAGES.reduce((s, p) => s + p.blocks.reduce((t, b) => t + b.items.length, 0), 0);
console.log(`build/n5-sakubun.html / n5-sakubun-answers.html 產生完成　共 ${total} 題`);
