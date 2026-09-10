// N5 弱點加強卷（2頁題目 + 解答解析），依第2卷的錯誤群出題
// 用法：node tools/make-n5-review.js  → build/n5-review*.html
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const ROOT = path.join(__dirname, "..");
vm.runInThisContext(fs.readFileSync(path.join(ROOT, "verbs.js"), "utf8"));

// ---- 動詞變化：一律向引擎取答案，不手寫 ----
const VB = {};
[...N4_VERBS, ...pairVerbs()].forEach(x => { if (!VB[x.dict]) VB[x.dict] = x; });
const READ = {
  "急ぐ":"いそぐ","貸す":"かす","泳ぐ":"およぐ","飲む":"のむ","遊ぶ":"あそぶ","書く":"かく",
  "死ぬ":"しぬ","呼ぶ":"よぶ","話す":"はなす","待つ":"まつ","帰る":"かえる","行く":"いく",
  "脱ぐ":"ぬぐ","洗う":"あらう","読む":"よむ","立つ":"たつ","作る":"つくる","消す":"けす",
  "運ぶ":"はこぶ","聞く":"きく","来る":"くる","する":"する","食べる":"たべる","見る":"みる",
  "起きる":"おきる","寝る":"ねる","乗る":"のる","買う":"かう","座る":"すわる","開ける":"あける",
  "止める":"とめる","吸う":"すう","払う":"はらう","入る":"はいる","降る":"ふる","会う":"あう"
};
function conj(dict, form) {
  const v = VB[dict] || normalizeVerb(dict, READ[dict] || dict, "", "");
  if (!v) throw new Error("找不到動詞：" + dict);
  const r = conjugate(v, form);
  if (!r) throw new Error(`變化失敗：${dict} ${form}`);
  return r;
}

// ---- 形容詞變化：規則函式（答案由函式算，不手寫）----
const iA = {
  neg:  s => s.slice(0,-1) + "くない",
  past: s => s.slice(0,-1) + "かった",
  pneg: s => s.slice(0,-1) + "くなかった",
  te:   s => s.slice(0,-1) + "くて",
  adv:  s => s.slice(0,-1) + "く",
  tara: s => s.slice(0,-1) + "かったら"
};
// いい 的變化以「よい」為底
function I(w, k) { return w === "いい" ? iA[k]("よい") : iA[k](w); }
const naA = {
  neg:  s => s + "ではありません",
  past: s => s + "でした",
  te:   s => s + "で",
  mod:  s => s + "な",
  adv:  s => s + "に",
  tara: s => s + "だったら"
};
const nounA = { ...naA, mod: s => s + "の", adv: null };

// ---- 自我檢查（防手滑）----
[["急ぐ","te","急いで"],["貸す","te","貸して"],["泳ぐ","ta","泳いだ"],["読む","ta","読んだ"],
 ["行く","te","行って"],["来る","te","来て"],["乗る","nai","乗らない"],["買う","nai","買わない"]]
 .forEach(([d,f,exp]) => { const g = conj(d,f); if (g !== exp) throw new Error(`引擎不符 ${d} ${f}：${g} ≠ ${exp}`); });
if (I("いい","te") !== "よくて") throw new Error("いい的て形應為よくて");
if (I("高い","pneg") !== "高くなかった") throw new Error("高い的過去否定錯");
console.log("✓ 自我檢查通過");

// ============ 題目 ============
// 區塊型別：list（一般題）／grid（表格填空）
const PAGES = [
{
 title:"N5 弱點加強卷　第1回",
 sub:"濁音判斷／形容詞變化／指示語／邀約／助詞",
 blocks:[
  { kind:"list", h:"① 濁音專項：動詞 → て形", cols:4,
    tip:"口訣：<b>ぬ・ぶ・む → んで（濁）／ぐ → いで（濁）</b>，其餘（う・つ・る／く／す）全是清音。※行く是例外→行って。",
    items:["急ぐ","貸す","泳ぐ","飲む","遊ぶ","書く","死ぬ","呼ぶ","話す","待つ",
           "帰る","行く","脱ぐ","洗う","読む","運ぶ"]
      .map(d => [`${d} →`, conj(d,"te"), `${d.slice(-1)}結尾 → ${conj(d,"te").slice(-2)}`]) },

  { kind:"list", h:"② 濁音專項：動詞 → た形（把て形的 て→た、で→だ）", cols:4,
    tip:"た形不用另外背：<b>て形的て換成た、で換成だ</b>。急いで→急いだ、書いて→書いた。",
    items:["急ぐ","貸す","遊ぶ","書く","泳ぐ","読む","行く","来る"]
      .map(d => [`${d} →`, conj(d,"ta"), `て形 ${conj(d,"te")} → ${conj(d,"ta")}`]) },

  { kind:"grid", h:"③ い形容詞：全部先「去い」再接", 
    tip:"六種變化都是<b>先去掉い</b>再加東西。第一列已示範，其餘請填。★いい 要用「よい」變化。",
    head:["原形","否定<br>〜くない","過去<br>〜かった","過去否定<br>〜くなかった","連接<br>〜くて","副詞化<br>〜く","假設<br>〜かったら"],
    rows:[["高い","高くない","高かった","高くなかった","高くて","高く","高かったら"]]
      .concat(["安い","寒い","おいしい","いい"].map(w =>
        [w, {a:I(w,"neg")}, {a:I(w,"past")}, {a:I(w,"pneg")}, {a:I(w,"te")}, {a:I(w,"adv")}, {a:I(w,"tara")}])),
    note:"※ いい 是唯一不規則：變化時要換成「よい」→ よくない・よかった・よくて・よく。" },

  { kind:"grid", h:"④ な形容詞・名詞：變化跟名詞一樣，只有「接名詞」和「副詞化」不同",
    tip:"な形容詞的變化<b>跟名詞完全相同</b>，差別只有兩處：接名詞加<b>な</b>（名詞加<b>の</b>）、副詞化加<b>に</b>（名詞沒有）。",
    head:["原形","否定","過去","連接<br>〜で","接名詞","副詞化<br>〜に","假設<br>〜だったら"],
    rows:[["静か（な形）","静かではありません","静かでした","静かで","静かな＋名詞","静かに","静かだったら"]]
      .concat([["有名","na"],["きれい","na"],["元気","na"],["学生","n"],["雨","n"]].map(([w,t]) => {
        const A = t === "na" ? naA : nounA;
        return [w + (t==="na" ? "（な形）" : "（名詞）"),
                {a:A.neg(w)}, {a:A.past(w)}, {a:A.te(w)},
                {a:A.mod(w) + "＋名詞"},
                t === "na" ? {a:A.adv(w)} : "—",
                {a:A.tara(w)}];
      })),
    note:"※ きれい・有名・元気 雖然以「い」結尾，卻是<b>な形容詞</b>：きれいな人（○）／きれくない（✗）。" },
  { kind:"list", h:"⑦ 指示語：こ＝近我／そ＝近你／あ＝都遠", cols:3,
    tip:"後面<b>接名詞</b>用この系；<b>不接名詞</b>用これ系；<b>場所</b>用ここ系。",
    items:[
      ["＿＿＿は何ですか。（那個〈較遠〉是什麼？）","あれ","不接名詞＋距離遠 → あれ。"],
      ["＿＿＿本は誰のですか。（這本書是誰的？）","この","後面接名詞 → この。"],
      ["＿＿＿＿はトイレです。（那邊〈較遠〉是廁所。）","あそこ","場所＋遠 → あそこ。"],
      ["＿＿＿は図書館です。（這裡是圖書館。）","ここ","場所＋近我 → ここ。"],
      ["＿＿＿かばんは私のです。（那個〈近你〉包包是我的。）","その","接名詞＋近聽話者 → その。"],
      ["＿＿＿は先生の車です。（那個〈較遠〉是老師的車。）","あれ","不接名詞＋遠 → あれ。"]
    ] },
  { kind:"list", h:"⑩ 助詞・存在動詞", cols:2,
    tip:"存在：<b>有生命→います／無生命→あります</b>。存在的主體用<b>が</b>。★会う・乗る的對象用<b>に</b>。",
    items:[
      ["公園に犬＿＿＿＿＿＿。（公園裡有狗）","がいます","狗有生命 → います；主體用が。"],
      ["本棚に本＿＿＿＿＿＿＿。（書架上有書）","があります","書無生命 → あります。"],
      ["友達＿会います。（跟朋友見面）","に","★会う的對象用に，不是を。"],
      ["電車＿乗ります。（搭電車）","に","★乗る的對象也用に。"],
      ["図書館＿勉強します。（在圖書館唸書）","で","有動作的場所用で。"],
      ["彼女は部屋＿います。（她在房間）","に","存在的地點用に。"],
      ["バス＿会社へ行きます。（搭公車去公司）","で","交通工具用で。"],
      ["7時＿起きます。（七點起床）","に","具體時間點用に。"],
      ["何＿食べませんでした。（什麼都沒吃）","も","疑問詞＋も＋否定。"],
      ["彼＿学生です。（他也是學生）","も","も取代は。"]
    ] }
 ]
},
{
 title:"N5 弱點加強卷　第2回",
 sub:"て形句型／ない形句型／時間前後／綜合",
 blocks:[
  { kind:"list", h:"⑤ て形句型：先寫對て形，再掛尾巴", cols:1,
    tip:"流程：<b>選尾巴 → 尾巴要て形 → 動詞變て形 → 接上去</b>。尾巴（ください・います・から・も・はいけません）永遠不變，不會跟著濁音。",
    items:[
      ["急ぐ｜請快一點　→　＿＿＿＿＿＿＿＿ください。", conj("急ぐ","te"), "ぐ→いで（濁）。急いでください。"],
      ["読む｜正在讀書　→　本を＿＿＿＿＿＿＿＿います。", conj("読む","te"), "む→んで（濁）。読んでいます。"],
      ["泳ぐ｜不可以游泳　→　ここで＿＿＿＿＿＿＿＿はいけません。", conj("泳ぐ","te"), "ぐ→いで（濁）。泳いではいけません。"],
      ["洗う｜洗完手再吃飯　→　手を＿＿＿＿＿＿＿＿から、ご飯を食べます。", conj("洗う","te"), "う→って（清）。洗ってから。"],
      ["貸す｜請借我　→　＿＿＿＿＿＿＿＿ください。", conj("貸す","te"), "す→して（不音便）。貸してください。"],
      ["降る｜就算下雨也去　→　雨が＿＿＿＿＿＿＿＿も、行きます。", conj("降る","te"), "る→って（清）。降っても。"],
      ["寝る｜弟弟正在睡　→　弟は＿＿＿＿＿＿＿＿います。", conj("寝る","te"), "2類去る＋て。寝ています。"],
      ["遊ぶ｜在公園玩了之後　→　公園で＿＿＿＿＿＿＿＿から、帰りました。", conj("遊ぶ","te"), "ぶ→んで（濁）。遊んでから。"],
      ["消す｜請關燈　→　電気を＿＿＿＿＿＿＿＿ください。", conj("消す","te"), "す→して。消してください。"]
    ] },

  { kind:"list", h:"⑥ ない形句型：哪些要「去い」？", cols:1,
    tip:"<b>ないでください</b> 直接接ない（唯一不去い）；<b>なくてもいい・なければならない</b> 都要<b>先去掉い</b>再接。",
    items:[
      ["撮る｜請不要拍照　→　写真を＿＿＿＿＿＿＿＿＿＿＿＿。", conj("撮る","nai")+"でください", "ない形直接接でください（不去い）。"],
      ["行く｜可以不用去學校　→　学校に＿＿＿＿＿＿＿＿＿＿＿＿＿＿。", conj("行く","nai").slice(0,-1)+"くてもいいです", "ない<b>去い</b>＋くてもいい。"],
      ["帰る｜必須回家　→　家に＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿。", conj("帰る","nai").slice(0,-1)+"ければなりません", "ない<b>去い</b>＋ければならない。"],
      ["吸う｜請不要抽菸　→　たばこを＿＿＿＿＿＿＿＿＿＿＿＿。", conj("吸う","nai")+"でください", "う→わ。吸わないでください。"],
      ["飲む｜必須每天吃藥　→　毎日薬を＿＿＿＿＿＿＿＿＿＿＿＿＿＿。", conj("飲む","nai").slice(0,-1)+"ければなりません", "飲まない→飲まなければなりません。"],
      ["する｜今天可以不用做　→　今日は＿＿＿＿＿＿＿＿＿＿＿＿＿＿。", "しなくてもいいです", "3類：しない→しなくてもいいです。"]
    ] },

  { kind:"list", h:"⑧ ませんか／ましょう／ましょうか", cols:1,
    tip:"<b>ませんか</b>＝要不要一起（邀約）／<b>ましょう</b>＝一起做吧（已有共識）／<b>ましょうか</b>＝我來幫你做吧？",
    items:[
      ["一緒にご飯を食べ＿＿＿＿＿。（要不要一起吃飯？）","ませんか","邀對方一起 → ませんか。"],
      ["荷物を持ち＿＿＿＿＿。（我來幫你拿吧？）","ましょうか","我為對方做 → ましょうか。"],
      ["さあ、行き＿＿＿＿。（走吧！）","ましょう","已講好，動身 → ましょう。"],
      ["お茶を飲み＿＿＿＿＿。（要不要喝茶？）","ませんか","邀約 → ませんか。"],
      ["写真を撮り＿＿＿＿＿。（我來幫你拍吧？）","ましょうか","我為對方做 → ましょうか。"],
      ["映画を見に行き＿＿＿＿＿。（要不要去看電影？）","ませんか","邀約 → ませんか。"]
    ] },
  { kind:"list", h:"⑨ 時間前後：前に永遠辭書形，後で永遠た形", cols:2,
    tip:"<b>前に</b>接辭書形、<b>後で</b>接た形，<b>不管整句是過去還是未來</b>。名詞要加の。時 則看動作先後：行く時＝去之前／行った時＝到了之後。",
    items:[
      ["寝る＿＿、日本語を勉強します。（睡前）","前に","辭書形＋前に。"],
      ["食事＿前に、手を洗います。（用餐前）","の","名詞＋の＋前に。"],
      ["宿題をし＿後で、帰ります。（做完作業後）","た","た形＋後で。"],
      ["運動＿後で、お風呂に入ります。（運動後）","の","名詞＋の＋後で。"],
      ["友達の家に行く＿、お土産を買います。（去之前買）","時","辭書形＋時＝動作在「去」之前。"],
      ["友達の家に行っ＿時、宿題をします。（到了之後）","た","た形＋時＝動作在「到達」之後。"],
      ["子供＿時、よく遊びました。（小時候）","の","名詞＋の＋時。"],
      ["歌を歌い＿＿＿、シャワーを浴びます。（一邊唱歌一邊）","ながら","ます形去ます＋ながら。"]
    ] },

  { kind:"write", h:"⑪ 綜合：中文 → 日文",
    tip:"綜合前面所有重點。答案為參考解答，意思對即可。",
    items:[
      ["請不要在這裡拍照。","ここで写真を撮らないでください。","ない形＋でください（不去い）。"],
      ["因為明天放假，可以不用早起。","明日は休みですから、早く起きなくてもいいです。","い形副詞化早く＋ない形去い＋くてもいい。"],
      ["這家店又便宜又好吃。","この店は安くておいしいです。","い形連接：去い＋くて。"],
      ["我覺得這個地方很方便。","ここは便利だと思います。","★な形容詞＋だ＋と思います。"],
      ["洗完手之後再吃飯吧。","手を洗ってから、ご飯を食べましょう。","て形＋から；ましょう＝一起做吧。"]
    ] }
 ]
}
];

// ============ 排版 ============
const CSS = `
@page { size: A4; margin: 9mm 9mm; }
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:"Hiragino Sans","Noto Sans TC","Yu Gothic",sans-serif; color:#000; background:#fff; font-size:9.1pt; line-height:1.34; }
.page { width:192mm; min-height:278mm; page-break-after:always; position:relative; padding-bottom:6mm; }
.page:last-child { page-break-after:auto; }
.head { border-bottom:2px solid #000; padding-bottom:2.5mm; margin-bottom:2.5mm; display:flex; align-items:baseline; justify-content:space-between; }
.head h1 { font-size:13.5pt; } .head .sub { font-size:8.2pt; color:#444; margin-top:.8mm; }
.head .meta { font-size:8pt; color:#444; white-space:nowrap; }
.blk { margin-bottom:1.8mm; break-inside:avoid; }
.blk h2 { font-size:9.6pt; background:#000; color:#fff; padding:.7mm 2mm; display:inline-block; }
.blk .tip { font-size:7.4pt; color:#333; border-left:2px solid #999; padding-left:2mm; margin:.6mm 0 .9mm; line-height:1.28; }
.blk .note { font-size:7.2pt; color:#333; margin-top:.8mm; }
.qgrid { display:grid; gap:.4mm 5mm; }
.qgrid.c1{grid-template-columns:1fr;} .qgrid.c2{grid-template-columns:1fr 1fr;}
.qgrid.c3{grid-template-columns:1fr 1fr 1fr;} .qgrid.c4{grid-template-columns:repeat(4,1fr);}
.q { display:flex; align-items:baseline; gap:1.2mm; font-size:8.9pt; padding:.25mm 0; }
.q .n { width:5.5mm; flex:0 0 5.5mm; font-size:7.6pt; color:#555; }
.q .t { flex:1; }
.q .bl { display:inline-block; border-bottom:1px solid #000; min-width:18mm; width:55%; height:4.2mm; vertical-align:bottom; }
.wline { border-bottom:1px solid #000; height:4.8mm; margin:.2mm 0 1mm 5.5mm; }
table.g { width:100%; border-collapse:collapse; font-size:8pt; margin-top:.5mm; }
table.g th, table.g td { border:1px solid #000; padding:.9mm 1.2mm; text-align:left; }
table.g th { background:#eee; font-size:7.4pt; font-weight:700; line-height:1.15; }
table.g td.blank { height:5.8mm; }
table.g td.demo { color:#333; }
table.g td.ans { font-weight:700; }
.foot { position:absolute; bottom:0; width:100%; border-top:1px solid #000; padding-top:1.2mm; font-size:7.4pt; color:#444; display:flex; justify-content:space-between; }
.ans-sheet { font-size:8.4pt; line-height:1.34; }
.ans-sheet .qgrid { gap:0 5mm; }
.ans-sheet .q { display:block; padding:.6mm 0; border-bottom:1px dotted #bbb; break-inside:avoid; }
.ans-sheet .a { font-weight:700; }
.ans-sheet .ex { font-size:7.2pt; color:#333; line-height:1.28; }
.ans-sheet .blk { margin-bottom:1.9mm; }
.ans-sheet .blk h2 { font-size:8.8pt; padding:.6mm 1.5mm; }
.ans-sheet .foot { position:static; margin-top:2mm; }
@media screen { body{padding:10mm;background:#eee;} .page{background:#fff;margin:0 auto 8mm;padding:9mm 9mm 12mm;box-shadow:0 1px 4px rgba(0,0,0,.3);} }
`;

const CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫";
let blkNo = 0;
function renderBlock(b, n, showAns) {
  // 標題的編號自動重編，搬動區塊時不會亂掉
  const title = b.h.replace(/^[①-⑫]\s*/, CIRCLED[blkNo++] + " ");
  let html = `<div class="blk"><h2>${title}</h2><div class="tip">${b.tip}</div>`;
  if (b.kind === "grid") {
    html += `<table class="g"><tr>${b.head.map(h => `<th>${h}</th>`).join("")}</tr>`;
    b.rows.forEach(row => {
      html += "<tr>" + row.map(c => {
        if (typeof c === "string") return `<td class="demo">${c}</td>`;
        return showAns ? `<td class="ans">${c.a}</td>` : `<td class="blank"></td>`;
      }).join("") + "</tr>";
    });
    html += `</table>`;
    if (b.note) html += `<div class="note">${b.note}</div>`;
    return { html: html + `</div>`, n };
  }
  const cols = b.kind === "write" ? 1 : (b.cols || 1);
  html += `<div class="qgrid c${showAns ? Math.min(cols, 2) : cols}">`;
  b.items.forEach(([q, a, e]) => {
    n++;
    if (showAns) {
      html += `<div class="q"><span class="n">${n}.</span> ${q}<br>→ <span class="a">${a}</span><div class="ex">${e}</div></div>`;
    } else {
      const bl = /→\s*$/.test(q) ? `<span class="bl"></span>` : "";
      html += `<div class="q"><span class="n">${n}.</span><span class="t">${q}${bl}</span></div>`
            + (b.kind === "write" ? `<div class="wline"></div>` : "");
    }
  });
  return { html: html + `</div></div>`, n };
}

function build(showAns) {
  let html = "";
  blkNo = 0;
  PAGES.forEach((pg, pi) => {
    let n = 0;
    html += `<div class="page${showAns ? " ans-sheet" : ""}">` +
      `<div class="head"><div><h1>${pg.title}${showAns ? "　解答・解説" : ""}</h1>` +
      `<div class="sub">${pg.sub}</div></div>` +
      `<div class="meta">${showAns ? "" : "名前 ____________　日付 ____ / ____"}</div></div>`;
    pg.blocks.forEach(b => { const r = renderBlock(b, n, showAns); html += r.html; n = r.n; });
    html += `<div class="foot"><span>N5 弱點加強卷　${showAns ? "解答・解説" : "問題"}</span>` +
      `<span>${showAns ? `第${pi + 1}回` : `${pi + 1} / ${PAGES.length}`}</span></div></div>`;
  });
  return html;
}

const page = (t, b) => `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${t}</title>
<style>${CSS}</style></head><body>${b}</body></html>`;

const BUILD = path.join(ROOT, "build");
fs.mkdirSync(BUILD, { recursive: true });
fs.writeFileSync(path.join(BUILD, "n5-review.html"), page("N5 弱點加強卷（問題）", build(false)), "utf8");
fs.writeFileSync(path.join(BUILD, "n5-review-answers.html"), page("N5 弱點加強卷（解答・解説）", build(true)), "utf8");

let q = 0, cells = 0;
PAGES.forEach(p => p.blocks.forEach(b => {
  if (b.kind === "grid") b.rows.forEach(r => r.forEach(c => { if (typeof c === "object") cells++; }));
  else q += b.items.length;
}));
console.log(`build/n5-review.html / n5-review-answers.html 產生完成　填空題 ${q} 題 ＋ 表格 ${cells} 格`);
