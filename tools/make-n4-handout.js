// N4 基礎講義（4頁 A4，可直接列印）
// 用法：node tools/make-n4-handout.js → build/n4-handout.html
// 所有動詞變化都由 verbs.js 引擎產生，不手寫。
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const ROOT = path.join(__dirname, "..");
vm.runInThisContext(fs.readFileSync(path.join(ROOT, "verbs.js"), "utf8"));

const VB = {};
[...N4_VERBS, ...pairVerbs()].forEach(x => { if (!VB[x.dict]) VB[x.dict] = x; });
const EXTRA = { "書く":"かく","飲む":"のむ","話す":"はなす","待つ":"まつ","買う":"かう",
  "泳ぐ":"およぐ","遊ぶ":"あそぶ","死ぬ":"しぬ","作る":"つくる","食べる":"たべる",
  "見る":"みる","起きる":"おきる","寝る":"ねる","する":"する","来る":"くる",
  "行く":"いく","帰る":"かえる","読む":"よむ","休む":"やすむ","急ぐ":"いそぐ" };
function V(dict) {
  if (VB[dict]) return VB[dict];
  const v = normalizeVerb(dict, EXTRA[dict] || dict, "", "");
  if (!v) throw new Error("找不到動詞：" + dict);
  return v;
}
function C(dict, form) {
  const r = conjugate(V(dict), form);
  if (!r) throw new Error(`變化失敗：${dict} ${form}`);
  return r;
}
// ── 引擎自我檢查（答案若與預期不符就中止產生）──────────────────
[["書く","te","書いて"],["行く","te","行って"],["泳ぐ","te","泳いで"],["話す","te","話して"],
 ["待つ","te","待って"],["死ぬ","ta","死んだ"],["遊ぶ","te","遊んで"],["飲む","ta","飲んだ"],
 ["作る","te","作って"],["買う","te","買って"],["食べる","te","食べて"],["する","te","して"],
 ["来る","te","来て"],["帰る","nai","帰らない"],["書く","potential","書ける"],
 ["食べる","potential","食べられる"],["する","potential","できる"],["来る","potential","来られる"],
 ["書く","passive","書かれる"],["食べる","passive","食べられる"],["する","passive","される"],
 ["書く","causative","書かせる"],["食べる","causative","食べさせる"],["する","causative","させる"],
 ["書く","volitional","書こう"],["食べる","volitional","食べよう"],["する","volitional","しよう"],
 ["書く","imperative","書け"],["食べる","imperative","食べろ"],["する","imperative","しろ"],
 ["書く","conditional","書けば"],["食べる","conditional","食べれば"],["する","conditional","すれば"],
 ["書く","kinshi","書くな"],["書く","tara","書いたら"],["書く","tari","書いたり"]
].forEach(([d,f,e]) => { const g = C(d,f); if (g !== e) throw new Error(`引擎不符 ${d} ${f}：得到 ${g}，預期 ${e}`); });
console.log("✓ 引擎自我檢查通過（36 項）");

const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const B = s => `<b>${s}</b>`;

// 三類代表動詞
const G1 = "書く", G2 = "食べる", G3S = "する", G3K = "来る";
// 各形三類對照（引擎產生）
function row3(label, form, note) {
  return [label, C(G1,form), C(G2,form), C(G3S,form), C(G3K,form), note];
}

// ── 頁面內容 ─────────────────────────────────────────────
const CSS = `
@page { size: A4; margin: 8mm; }
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:"Hiragino Sans","Noto Sans TC","Yu Gothic",sans-serif; color:#000; background:#fff; font-size:8.4pt; line-height:1.28; }
.page { width:194mm; min-height:281mm; page-break-after:always; position:relative; padding-bottom:5mm; }
.page:last-child { page-break-after:auto; }
.head { border-bottom:2px solid #000; padding-bottom:1.6mm; margin-bottom:2mm; display:flex; align-items:baseline; justify-content:space-between; }
.head h1 { font-size:12pt; }
.head .sub { font-size:7.4pt; color:#444; margin-left:3mm; }
.head .meta { font-size:7.2pt; color:#555; white-space:nowrap; }
.blk { margin-bottom:2mm; break-inside:avoid; }
.blk h2 { font-size:8.8pt; background:#000; color:#fff; padding:.5mm 2mm; display:inline-block; margin-bottom:.8mm; }
.blk h3 { font-size:7.4pt; margin:.9mm 0 .3mm; border-left:2.4mm solid #000; padding-left:1.6mm; }
.tip { font-size:7pt; color:#222; background:#f0f0f0; border-left:2px solid #666; padding:.7mm 1.6mm; margin:.6mm 0; line-height:1.3; }
table { border-collapse:collapse; width:100%; font-size:7.6pt; margin:.5mm 0; }
th,td { border:.4pt solid #666; padding:.5mm 1.1mm; vertical-align:top; }
th { background:#e2e2e2; font-size:7.2pt; text-align:left; white-space:nowrap; }
td.k { background:#f4f4f4; font-weight:700; white-space:nowrap; }
td.n { font-size:6.8pt; color:#333; line-height:1.24; }
b { font-weight:700; }
.u { text-decoration:underline; text-underline-offset:1px; }
.two { display:flex; gap:2.5mm; }
.two > * { flex:1; min-width:0; }
.foot { position:absolute; bottom:0; width:100%; border-top:1px solid #000; padding-top:1mm; font-size:6.9pt; color:#444; display:flex; justify-content:space-between; }
.warn { font-size:7pt; border:.6pt solid #000; padding:.8mm 1.6mm; margin:.6mm 0; line-height:1.3; }
.warn .lb { background:#000; color:#fff; padding:0 1.2mm; font-weight:700; margin-right:.8mm; }
ul { margin:.3mm 0 .3mm 4mm; font-size:7.4pt; line-height:1.34; }
@media screen { body{padding:8mm;background:#eee;} .page{background:#fff;margin:0 auto 8mm;padding:8mm 8mm 11mm;box-shadow:0 1px 4px rgba(0,0,0,.3);} }
`;

function table(head, rows, cls) {
  const th = head ? `<tr>${head.map(h=>`<th>${h}</th>`).join("")}</tr>` : "";
  const tr = rows.map(r => `<tr>${r.map(c => {
    if (typeof c === "object") return `<td class="${c.c||""}">${c.v}</td>`;
    return `<td>${c}</td>`;
  }).join("")}</tr>`).join("");
  return `<table class="${cls||""}">${th}${tr}</table>`;
}
function page(no, title, sub, body) {
  return `<div class="page"><div class="head"><div style="display:flex;align-items:baseline">`
    + `<h1>${title}</h1><span class="sub">${sub}</span></div>`
    + `<div class="meta">N4 基礎講義　${no} / 4</div></div>`
    + body
    + `<div class="foot"><span>日本語ノート　N4 基礎講義</span><span>${no} / 4</span></div></div>`;
}

// 常用動詞分類速查（類別由引擎判定）
const CLASS_PICK = [
 "書く","飲む","話す","買う","待つ","作る","泳ぐ","遊ぶ","読む","聞く","急ぐ","休む",
 "食べる","見る","起きる","寝る","出る","借りる","閉める","集める",
 "する","来る","勉強する",
 "帰る","入る","切る","知る","走る","要る"
];
const TYPE_ZH = { godan:"第1類（五段）", ichidan:"第2類（一段）", suru:"第3類", kuru:"第3類" };
const EXC = new Set(["帰る","入る","切る","知る","走る","要る"]);
const cbuckets = { godan:[], ichidan:[], irr:[] };
CLASS_PICK.forEach(d => {
  const v = V(d);
  const t = (v.type === "suru" || v.type === "kuru") ? "irr" : v.type;
  if (!cbuckets[t]) throw new Error("未知類別 " + v.type + " for " + d);
  cbuckets[t].push((EXC.has(d) ? "★" : "") + d + `<span style="font-size:6.2pt;color:#555">&#8202;${v.reading}</span>`);
});
const CLASSLIST = table(["類別","判斷","常用動詞"], [
 [{v:"<b>第1類</b><br>五段",c:"k"}, {v:"尾巴是う段<br>（＝其餘全部）",c:"n"}, {v:cbuckets.godan.join("　"),c:"n"}],
 [{v:"<b>第2類</b><br>一段",c:"k"}, {v:"る前面是<br>i段或e段",c:"n"}, {v:cbuckets.ichidan.join("　"),c:"n"}],
 [{v:"<b>第3類</b>",c:"k"}, {v:"只有兩個<br>＋〜する",c:"n"}, {v:cbuckets.irr.join("　"),c:"n"}]
]);

// ══════════ 第 1 頁：動詞分類 ＋ 基本形 ＋ 音便 ══════════
const P1 = `
<div class="blk"><h2>① 先分類：這個動詞是第幾類？</h2>
<div class="tip"><b>所有動詞變化都從「分類」開始。</b>分類錯，後面全部錯。判斷順序：先看是不是第3類（只有兩個）→ 再看是不是第2類 → 其餘都是第1類。</div>
${table(["類別","別名","判斷方法","例","數量"],[
 [{v:"<b>第3類</b>",c:"k"},"カ變・サ變","<b>只有 する 和 来る</b>（以及〜する複合動詞：勉強する・散歩する）","する・来る・勉強する","2 個＋複合"],
 [{v:"<b>第2類</b>",c:"k"},"一段動詞","<b>尾巴是「る」，而且る前面是 i 段或 e 段音</b>","食<u>べ</u>る(e)・見る(i)・起<u>き</u>る(i)・寝る(e)","少"],
 [{v:"<b>第1類</b>",c:"k"},"五段動詞","<b>其餘全部</b>。尾巴是 う段（く・ぐ・す・つ・ぬ・ぶ・む・る・う）","書く・飲む・話す・買う・作る","最多"]
])}
<div class="warn"><span class="lb">陷阱</span>　長得像第2類、其實是第1類的例外（る前面雖是 i／e 段，但是五段動詞）：
<b>帰る</b>(かえる)・<b>入る</b>(はいる)・<b>走る</b>(はしる)・<b>切る</b>(きる)・<b>知る</b>(しる)・<b>要る</b>(いる)・<b>減る</b>(へる)・<b>喋る</b>(しゃべる)・<b>滑る</b>(すべる)。
→ 例：帰る 的否定是 <b>${C("帰る","nai")}</b>（第1類），不是 ✗帰ない。這幾個必須硬記。</div>
</div>

<div class="blk"><h2>② 第1類的核心：尾巴在「あいうえお」五段上移動</h2>
<div class="tip">第1類＝<b>五段</b>動詞，因為它的尾巴會在 <b>あ・い・う・え・お</b> 五個段之間移動。<b>先決定要哪一段，再換字，最後接尾巴。</b></div>
${table(["段","書<b>く</b>","飲<b>む</b>","話<b>す</b>","買<b>う</b>★","接什麼"],[
 [{v:"あ段",c:"k"},"書<b>か</b>","飲<b>ま</b>","話<b>さ</b>","買<b>わ</b>★","ない・れる(受身)・せる(使役)"],
 [{v:"い段",c:"k"},"書<b>き</b>","飲<b>み</b>","話<b>し</b>","買<b>い</b>","ます・たい・ながら・方"],
 [{v:"う段",c:"k"},"書<b>く</b>","飲<b>む</b>","話<b>す</b>","買<b>う</b>","辭書形（＝原形）"],
 [{v:"え段",c:"k"},"書<b>け</b>","飲<b>め</b>","話<b>せ</b>","買<b>え</b>","る(可能)・ば(條件)・命令形"],
 [{v:"お段",c:"k"},"書<b>こ</b>","飲<b>も</b>","話<b>そ</b>","買<b>お</b>","う（意向形）"]
])}
<div class="warn"><span class="lb">★</span>　尾巴是「う」的動詞（買う・会う・言う・洗う），あ段不是「あ」而是 <b>わ</b>：買う→買<b>わ</b>ない（✗買あない）。這是唯一的段例外。</div>
</div>

<div class="blk"><h2>③ 三個基本形：ます形・ない形・辭書形</h2>
${table(["","第1類（五段）","第2類（一段）","第3類 する","第3類 来る"],[
 [{v:"辭書形",c:"k"},"書く／飲む／話す","食べる／見る","する","来る（くる）"],
 [{v:"<b>ます形</b>",c:"k"},`<b>い段</b>＋ます　${C("書く","masu")}／${C("飲む","masu")}`,`<b>去る</b>＋ます　${C("食べる","masu")}`,C("する","masu"),`${C("来る","masu")}（き<b>ます</b>）`],
 [{v:"<b>ない形</b>",c:"k"},`<b>あ段</b>＋ない　${C("書く","nai")}／${C("飲む","nai")}`,`<b>去る</b>＋ない　${C("食べる","nai")}`,C("する","nai"),`${C("来る","nai")}（こ<b>ない</b>）`],
 [{v:"過去否定",c:"k"},C("書く","nakatta"),C("食べる","nakatta"),C("する","nakatta"),C("来る","nakatta")],
 [{v:"たい形",c:"k"},C("書く","tai"),C("食べる","tai"),C("する","tai"),C("来る","tai")]
])}
<div class="warn"><span class="lb">注意</span>　来る 的讀音會變：来る(<b>く</b>る)→来ます(<b>き</b>ます)→来ない(<b>こ</b>ない)。漢字不變，讀音變三種。</div>
</div>

<div class="blk"><h2>④ て形・た形：只有第1類要「音便」</h2>
<div class="tip">て形是 N4 最重要的形，幾乎所有句型都掛在它後面。<b>第2類、第3類直接去る加て，完全不變音；只有第1類要看尾巴決定音便。</b>た形＝把て換成た（濁音也跟著：で→だ）。</div>
${table(["動詞尾巴","音便","例（て形）","例（た形）"],[
 [{v:"<b>く</b>",c:"k"},"い音便 → <b>いて</b>",`${C("書く","te")}・${C("聞く","te")}`,C("書く","ta")],
 [{v:"<b>ぐ</b>",c:"k"},"い音便 → <b>いで</b>（濁）",`${C("泳ぐ","te")}・${C("急ぐ","te")}`,C("泳ぐ","ta")],
 [{v:"<b>う・つ・る</b>",c:"k"},"促音便 → <b>って</b>",`${C("買う","te")}・${C("待つ","te")}・${C("作る","te")}`,`${C("買う","ta")}・${C("待つ","ta")}`],
 [{v:"<b>ぬ・ぶ・む</b>",c:"k"},"撥音便 → <b>んで</b>（濁）",`${C("死ぬ","te")}・${C("遊ぶ","te")}・${C("飲む","te")}`,`${C("飲む","ta")}・${C("遊ぶ","ta")}`],
 [{v:"<b>す</b>",c:"k"},"不音便 → <b>して</b>",C("話す","te"),C("話す","ta")],
 [{v:"第2類",c:"k"},"去る＋て",C("食べる","te"),C("食べる","ta")],
 [{v:"第3類",c:"k"},"—",`${C("する","te")}・${C("来る","te")}`,`${C("する","ta")}・${C("来る","ta")}`]
])}
<div class="warn"><span class="lb">唯一例外</span>　<b>行く</b> 尾巴是「く」，卻不是 ✗行いて，而是促音便 <b>${C("行く","te")}・${C("行く","ta")}</b>。只有這一個字。
　<b>為什麼會濁音？</b>「ぬ・ぶ・む」和「ぐ」發音時鼻腔／喉嚨帶音，濁氣傳染給後面的て → 變成で。<b>濁音只發生在て/た這一步，後面再掛的尾巴不會跟著濁。</b></div>
</div>

<div class="blk"><h2>⑤ 常用動詞分類速查（全部由變化引擎核對）</h2>
<div class="tip">下表的類別是程式核對過的。<b>先把這些常用字的類別記熟，變化就不會卡。</b>★記號＝形狀像第2類、實際是第1類的例外字。</div>
${CLASSLIST}
</div>
`;

// ══════════ 第 2 頁：N4 全活用形 × 三類 ══════════
const F = (d,f) => C(d,f);
const P2 = `
<div class="blk"><h2>⑥ N4 全部活用形　×　三類一次對照</h2>
<div class="tip"><b>看法：先確認動詞類別（左邊三欄），再找你要的形（最左直欄）。</b>粗體是變化的部分。「結果詞性」欄最重要——變完之後它是什麼詞，決定了後面還能怎麼接。</div>
${table(["形","接續規則","第1類 書く","第2類 食べる","第3類 する／来る","<b>結果詞性</b>"],[
 [{v:"<b>可能形</b><br>能夠",c:"k"},{v:"1類 <b>え段＋る</b><br>2類 去る＋<b>られる</b>",c:"n"},F(G1,"potential"),F(G2,"potential"),`${F(G3S,"potential")}／${F(G3K,"potential")}`,{v:"<b>第2類動詞</b><br>→ 可再變ます・て・ない",c:"n"}],
 [{v:"<b>受身形</b><br>被〜",c:"k"},{v:"1類 <b>あ段＋れる</b><br>2類 去る＋<b>られる</b>",c:"n"},F(G1,"passive"),F(G2,"passive"),`${F(G3S,"passive")}／${F(G3K,"passive")}`,{v:"<b>第2類動詞</b>",c:"n"}],
 [{v:"<b>使役形</b><br>讓／叫〜做",c:"k"},{v:"1類 <b>あ段＋せる</b><br>2類 去る＋<b>させる</b>",c:"n"},F(G1,"causative"),F(G2,"causative"),`${F(G3S,"causative")}／${F(G3K,"causative")}`,{v:"<b>第2類動詞</b>",c:"n"}],
 [{v:"<b>使役受身</b><br>被迫〜",c:"k"},{v:"使役形去る＋<b>られる</b>",c:"n"},`${F(G1,"causPass")}<br><span style="font-size:6.6pt">（口語：書かされる）</span>`,F(G2,"causPass"),`${F(G3S,"causPass")}／${F(G3K,"causPass")}`,{v:"<b>第2類動詞</b>",c:"n"}],
 [{v:"<b>意向形</b><br>〜吧／打算",c:"k"},{v:"1類 <b>お段＋う</b><br>2類 去る＋<b>よう</b>",c:"n"},F(G1,"volitional"),F(G2,"volitional"),`${F(G3S,"volitional")}／${F(G3K,"volitional")}`,{v:"句尾／＋と思う",c:"n"}],
 [{v:"<b>命令形</b><br>給我做！",c:"k"},{v:"1類 <b>え段</b>（只去尾巴）<br>2類 去る＋<b>ろ</b>",c:"n"},F(G1,"imperative"),F(G2,"imperative"),`${F(G3S,"imperative")}／${F(G3K,"imperative")}`,{v:"句尾（語氣強烈）",c:"n"}],
 [{v:"<b>禁止形</b><br>不准做！",c:"k"},{v:"<b>辭書形＋な</b>（全類同）",c:"n"},F(G1,"kinshi"),F(G2,"kinshi"),`${F(G3S,"kinshi")}／${F(G3K,"kinshi")}`,{v:"句尾",c:"n"}],
 [{v:"<b>條件形 ば</b><br>如果〜",c:"k"},{v:"1類 <b>え段＋ば</b><br>2類 去る＋<b>れば</b>",c:"n"},F(G1,"conditional"),F(G2,"conditional"),`${F(G3S,"conditional")}／${F(G3K,"conditional")}`,{v:"接後句",c:"n"}],
 [{v:"<b>たら形</b><br>〜的話就",c:"k"},{v:"<b>た形＋ら</b>（全類同）",c:"n"},F(G1,"tara"),F(G2,"tara"),`${F(G3S,"tara")}／${F(G3K,"tara")}`,{v:"接後句",c:"n"}],
 [{v:"<b>たり形</b><br>又〜又〜",c:"k"},{v:"<b>た形＋り</b>（全類同）",c:"n"},F(G1,"tari"),F(G2,"tari"),`${F(G3S,"tari")}／${F(G3K,"tari")}`,{v:"＋します 結尾",c:"n"}]
])}
<div class="warn"><span class="lb">最容易混的一組</span>　第2類的 <b>可能・受身</b> 長得一模一樣（食べ<b>られる</b>）——分辨靠句子：有「〜に」被動作者＝受身，講能力＝可能。口語會把可能形說成「食べ<b>れる</b>」（ら抜き言葉），<b>考試不可以用</b>。</div>
<div class="warn"><span class="lb">連鎖變化</span>　可能・受身・使役變完都是<b>第2類動詞</b>，所以可以繼續往下變：書ける → 書け<b>ます</b>／書け<b>ない</b>／書け<b>て</b>／書け<b>れば</b>。看到「〜られる／〜せる」結尾就當一般第2類處理。</div>
</div>

<div class="blk"><h2>⑦ 反過來查：這個句型該用哪個形？</h2>
<div class="tip"><b>造句順序＝先看你要用的尾巴 → 尾巴決定要哪個形 → 再把動詞變成那個形接上去。</b>這張表是造句時真正會用到的查法。</div>
<div class="two">
${table(["要接的尾巴","前面用","例"],[
 [{v:"〜ています／〜てから<br>〜てもいい／〜てはいけない<br>〜てあげる／〜ておく／〜てみる",c:"n"},{v:"<b>て形</b>",c:"k"},{v:`${F(G1,"te")}います`,c:"n"}],
 [{v:"〜たことがある／〜たり<br>〜たあとで／〜たら",c:"n"},{v:"<b>た形</b>",c:"k"},{v:`${F(G1,"ta")}ことがある`,c:"n"}],
 [{v:"〜ないでください／〜なくてもいい<br>〜なければならない／〜ないと",c:"n"},{v:"<b>ない形</b>",c:"k"},{v:`${F(G1,"nai")}でください`,c:"n"}],
 [{v:"〜ながら／〜たい／〜方<br>〜やすい／〜にくい／〜すぎる",c:"n"},{v:"<b>ます形去ます</b>",c:"k"},{v:`${F(G1,"masu").replace("ます","")}ながら`,c:"n"}],
 [{v:"〜前に／〜ことができる<br>〜つもり／〜な(禁止)／〜と",c:"n"},{v:"<b>辭書形</b>",c:"k"},{v:"書く前に",c:"n"}],
 [{v:"〜と思う／〜そうだ(傳聞)<br>〜かもしれない／〜でしょう",c:"n"},{v:"<b>普通形</b>",c:"k"},{v:"書くと思う",c:"n"}]
])}
${table(["特殊接法","規則","例"],[
 [{v:"〜そうだ<br><span style='font-size:6.6pt'>樣態（看起來）</span>",c:"n"},{v:"動詞<b>ます形去ます</b><br>い形<b>去い</b>／な形<b>直接</b>",c:"n"},{v:`降り<b>そう</b>／高<b>そう</b><br>★ない→な<b>さ</b>そう、いい→<b>よさ</b>そう`,c:"n"}],
 [{v:"〜ようだ／〜みたい",c:"n"},{v:"普通形（名詞：の／な形：な）",c:"n"},{v:"雨の<b>よう</b>だ",c:"n"}],
 [{v:"〜ので／〜のに",c:"n"},{v:"普通形（名詞・な形要<b>な</b>）",c:"n"},{v:"静か<b>な</b>ので",c:"n"}],
 [{v:"〜から／〜が／〜けど",c:"n"},{v:"普通形或丁寧形皆可（名詞・な形<b>だ</b>）",c:"n"},{v:"学生<b>だ</b>から",c:"n"}],
 [{v:"〜とき",c:"n"},{v:"<b>辭書形</b>＝之前／<b>た形</b>＝之後",c:"n"},{v:"行く時＝出發前<br>行った時＝抵達後",c:"n"}],
 [{v:"〜ば〜ほど",c:"n"},{v:"條件形＋辭書形＋ほど",c:"n"},{v:`${F(G1,"conditional")}書く<b>ほど</b>`,c:"n"}]
])}
</div>
</div>

<div class="blk"><h2>⑧ 四種「如果」怎麼選</h2>
${table(["","接法","用在","例"],[
 [{v:"<b>と</b>",c:"k"},"辭書形＋と","<b>必然</b>：一定會這樣（自然法則・機器・路線）","春になる<b>と</b>、桜が咲く"],
 [{v:"<b>ば</b>",c:"k"},"え段＋ば","<b>一般條件</b>、假設；後句不可接命令/請求","安けれ<b>ば</b>買う"],
 [{v:"<b>たら</b>",c:"k"},"た形＋ら","<b>最萬用</b>：一次性的事、也可當「〜之後」；後句可接任何句型","駅に着い<b>たら</b>電話して"],
 [{v:"<b>なら</b>",c:"k"},"普通形＋なら","<b>承接對方的話</b>題：「如果是那樣的話」","日本へ行く<b>なら</b>、京都がいい"]
])}
<div class="warn"><span class="lb">不確定時選「たら」</span>——它限制最少，後面接請求、命令、意志都可以。「と」「ば」的後句<b>不能</b>接「〜てください／〜ましょう／〜たい」。</div>
</div>
`;

// ══════════ 第 3 頁：四詞類 × 普通形／丁寧形 ══════════
const P3 = `
<div class="blk"><h2>⑨ 四種詞性，四個格子——先認詞性，再填格子</h2>
<div class="tip">日文的句尾變化<b>一律先看述語是哪一種詞</b>：<b>N</b>名詞・<b>いA</b>い形容詞・<b>なA</b>な形容詞・<b>V</b>動詞。
同一個「否定」，四種詞的變法完全不同——<b>否定變在哪個字上</b>，是最常錯的地方。</div>
${table(["詞性","記號","例","現在肯定","現在否定","過去肯定","過去否定"],[
 [{v:"動詞",c:"k"},"Ｖ","行く",{v:"<b>行く</b><br><span style='font-size:6.6pt'>＝辭書形</span>",c:"n"},{v:"<b>行かない</b><br><span style='font-size:6.6pt'>＝ない形</span>",c:"n"},{v:"<b>行った</b><br><span style='font-size:6.6pt'>＝た形</span>",c:"n"},{v:"<b>行かなかった</b><br><span style='font-size:6.6pt'>＝なかった形</span>",c:"n"}],
 [{v:"い形容詞",c:"k"},"いＡ","大きい","<b>大きい</b>","大き<b>くない</b>","大き<b>かった</b>","大き<b>くなかった</b>"],
 [{v:"な形容詞",c:"k"},"なＡ","元気","元気<b>だ</b>","元気<b>じゃない</b><br>元気<b>ではない</b>","元気<b>だった</b>","元気<b>じゃなかった</b><br>元気<b>ではなかった</b>"],
 [{v:"名詞",c:"k"},"Ｎ","病気","病気<b>だ</b>","病気<b>じゃない</b><br>病気<b>ではない</b>","病気<b>だった</b>","病気<b>じゃなかった</b><br>病気<b>ではなかった</b>"]
],"")}
<div style="font-size:7pt;margin:.6mm 0 1mm">▲ <b>普通形（常體・PI）</b>　用於：朋友家人之間、心裡想的、以及所有「接在句型前面」的位置（〜と思う／〜から／〜ので／〜時／〜かもしれない）。</div>
${table(["詞性","例","現在肯定","現在否定","過去肯定","過去否定"],[
 [{v:"動詞",c:"k"},"行く","行き<b>ます</b>","行き<b>ません</b>","行き<b>ました</b>","行き<b>ませんでした</b>"],
 [{v:"い形容詞",c:"k"},"大きい","大きい<b>です</b>",{v:"大きくない<b>です</b><br>大きく<b>ありません</b>",c:"n"},"大きかった<b>です</b>",{v:"大きくなかった<b>です</b><br>大きく<b>ありませんでした</b>",c:"n"}],
 [{v:"な形容詞",c:"k"},"元気","元気<b>です</b>",{v:"元気じゃない<b>です</b><br>元気じゃ<b>ありません</b>",c:"n"},"元気<b>でした</b>",{v:"元気じゃなかった<b>です</b><br>元気じゃ<b>ありませんでした</b>",c:"n"}],
 [{v:"名詞",c:"k"},"病気","病気<b>です</b>",{v:"病気じゃない<b>です</b><br>病気じゃ<b>ありません</b>",c:"n"},"病気<b>でした</b>",{v:"病気じゃなかった<b>です</b><br>病気じゃ<b>ありませんでした</b>",c:"n"}]
])}
<div style="font-size:7pt;margin:.6mm 0 0">▲ <b>丁寧形（敬體・Po）</b>　用於：對不熟的人、公開場合、考試作文。<b>じゃ</b>＝口語／<b>では</b>＝正式書面，兩者可互換。</div>
</div>

<div class="blk"><h2>⑩ 形容詞的其他兩個變化：副詞化・連接</h2>
<div class="tip">形容詞除了上表的四格，還有兩個天天用到的變化。<b>一樣是先看它是い形還是な形，再決定怎麼變。</b></div>
${table(["用途","い形容詞（早い・おいしい）","な形容詞・名詞（静か・元気）","例"],[
 [{v:"<b>修飾名詞</b>",c:"k"},"<b>直接接</b>　早い電車",`<b>な</b>／名詞用<b>の</b>　静か<b>な</b>町`,"早い電車／静かな町"],
 [{v:"<b>副詞化</b><br><span style='font-size:6.6pt'>修飾動詞</span>",c:"k"},"去い＋<b>く</b>　早<b>く</b>","＋<b>に</b>　静か<b>に</b>","早<b>く</b>起きる／静か<b>に</b>してください"],
 [{v:"<b>連接（並列）</b>",c:"k"},"去い＋<b>くて</b>　安<b>くて</b>","＋<b>で</b>　静か<b>で</b>","安<b>くて</b>おいしい／静か<b>で</b>きれいな部屋"],
 [{v:"<b>變化（〜なる）</b>",c:"k"},"去い＋<b>く</b>＋なる","＋<b>に</b>＋なる","寒<b>く</b>なる／上手<b>に</b>なる"]
])}
<div class="warn"><span class="lb">兩個必背例外</span>　<b>いい</b>（好）變化時要換成<b>よ</b>：いい→<b>よ</b>くない／<b>よ</b>かった／<b>よ</b>くて／<b>よ</b>く。（✗いくない ✗いかった）
　<b>きれい・嫌い・有名・親切</b> 結尾是「い」但都是<b>な形容詞</b>：きれい<b>な</b>／きれい<b>ではありません</b>（✗きれくない）。</div>
</div>

<div class="blk"><h2>⑪ 三條關鍵規則（這裡錯最多）</h2>
<div class="warn"><span class="lb">1</span>　<b>否定變在哪個字上，三種詞不一樣。</b>
　動詞→變<b>ます</b>（飲み<b>ません</b>）／い形→變<b>形容詞本身</b>（高<b>くない</b>です）／な形・名詞→變<b>です</b>（静か<b>ではありません</b>）。
　✗ 高い<b>ではありません</b>　✗ 寒<b>くでした</b>　○ 高くないです　○ 寒<b>かった</b>です　　<b>い形容詞永遠不會用到「ではありません」。</b></div>
<div class="warn"><span class="lb">2</span>　<b>い形容詞的「です」不會變化，它只是禮貌標記。</b>
　大きい<b>です</b>→過去是「大き<b>かった</b>です」（形容詞自己變），<b>不是</b> ✗大きいでした。
　名詞・な形的「です」才是<b>判定詞だ</b>的丁寧版，所以它自己會變：病気<b>でした</b>。—— 三種身分、兩個形式，這是混淆的根源。</div>
<div class="warn"><span class="lb">3</span>　<b>な形・名詞的「だ」接到句型前面時會換臉。</b>
　接名詞→<b>な</b>／<b>の</b>（静か<b>な</b>町・学生<b>の</b>友達）　接ので・のに→<b>な</b>（静か<b>な</b>ので）
　接から・と思う→<b>だ</b>（学生<b>だ</b>から・元気<b>だ</b>と思う）　接でしょう・かもしれない→<b>什麼都不加</b>（元気でしょう）</div>
</div>

<div class="blk"><h2>⑫ 常體 ⇄ 敬體 互換練習法</h2>
<div class="tip">把課文的敬體句改成常體（或反過來），是最快把這張表練熟的方法。<b>轉換時只動句尾，前面完全不動。</b></div>
${table(["敬體","→ 常體","敬體","→ 常體"],[
 ["行きます","行く","大きいです","大きい"],
 ["行きません","行かない","大きくないです","大きくない"],
 ["行きました","行った","大きかったです","大きかった"],
 ["行きませんでした","行かなかった","大きくなかったです","大きくなかった"],
 ["元気です","元気<b>だ</b>","病気でした","病気<b>だった</b>"],
 ["元気じゃありません","元気じゃない","病気じゃありませんでした","病気じゃなかった"]
])}
<div class="warn"><span class="lb">問句</span>　常體的問句<b>不加か</b>，也<b>不加だ</b>，靠語尾上揚：　行きますか → <b>行く？</b>　／　元気ですか → <b>元気？</b>（✗元気だ？）</div>
<div class="warn"><span class="lb">敬語別走太遠</span>　「お＋ます形去ます」可以變成<b>名詞</b>，名詞當然接です：出かけます → <b>お出かけですか</b>。這時過去要用 <b>お出かけでした</b>（不是✗お出かけました）——名詞化之後，整條句尾路線跟著換成名詞那一套。</div>
</div>
`;

// ══════════ 第 4 頁：自他動詞 ══════════
const GROUP_NOTE = {
 "aru-eru":"〜<b>ある</b>（自）⇄ 〜<b>える</b>（他）　最大宗，看到「〜まる/〜がる/〜かる」幾乎都是自動詞",
 "u-eru":"〜<b>u段</b>（自）⇄ 〜<b>える</b>（他）　自動詞是第1類，他動詞是第2類",
 "reru-su":"〜<b>れる</b>（自）⇄ 〜<b>す</b>（他）　他動詞帶「す」＝人去做",
 "eru-u":"〜<b>える</b>（自）⇄ 〜<b>u段</b>（他）　★跟上面相反，自動詞才是第2類",
 "u-asu":"〜<b>u段</b>（自）⇄ 〜<b>あす/やす</b>（他）",
 "irr":"不規則　讀音整個變，只能個別記"
};
const byGroup = {};
VERB_PAIRS.forEach(p => { (byGroup[p.group] = byGroup[p.group] || []).push(p); });
const pairTables = Object.keys(GROUP_NOTE).map(g => {
  const rd = r => `<span style="font-size:6.2pt;color:#555">${r}</span>`;
  const rows = (byGroup[g] || []).map(p => [
    {v:`${p.intr.dict} &#8202;${rd(p.intr.reading)}`, c:"n"},
    {v:`<b>${p.tran.dict}</b> ${rd(p.tran.reading)}`, c:"n"},
    {v:p.meaning, c:"n"}
  ]);
  const half = Math.ceil(rows.length / 2);
  const t = (rs) => table(["自動詞（が）","他動詞（を）","意思"], rs);
  return `<h3>${GROUP_NOTE[g]}</h3><div class="two">${t(rows.slice(0,half))}${t(rows.slice(half))}</div>`;
}).join("");

const P4 = `
<div class="blk"><h2>⑬ 自動詞 ⇄ 他動詞：先看助詞，再選動詞</h2>
<div class="tip"><b>自動詞</b>＝主語自己發生的事，用 <b>が</b>，句中沒有動作者。<b>他動詞</b>＝有人去做，用 <b>を</b>。
<b>造句順序：先決定「要不要講是誰做的」→ 決定用が還是を → 再從下表挑對應的動詞。</b></div>
${table(["","助詞","句子","語感"],[
 [{v:"<b>自動詞</b>",c:"k"},"〜<b>が</b>","ドア<b>が</b>開く／電気<b>が</b>つく","<b>就是那樣了</b>——不提誰做的，或根本沒人做"],
 [{v:"<b>他動詞</b>",c:"k"},"〜<b>を</b>","ドア<b>を</b>開ける／電気<b>を</b>つける","<b>有人做的</b>——強調動作與責任"]
])}
${table(["ている 的兩種意思","自動詞＋ている","他動詞＋ている","他動詞的て形＋ある"],[
 [{v:"例",c:"k"},"ドアが開い<b>ている</b>","ドアを開け<b>ている</b>","ドアが開け<b>てある</b>"],
 [{v:"意思",c:"k"},"門<b>開著</b>（狀態）","<b>正在開</b>門（動作進行中）","門<b>被（某人有意）打開放著</b>"],
 [{v:"重點",c:"k"},{v:"自動詞＋ている＝<b>結果狀態</b>，最常用",c:"n"},{v:"他動詞＋ている＝<b>動作進行</b>",c:"n"},{v:"てある＝<b>有人做好了、留著</b>，含「為了某目的」",c:"n"}]
])}
<div class="warn"><span class="lb">台灣學生最常錯</span>　把中文的「開著」直譯成他動詞。中文不分自他，日文分。<b>看到「〜著」「〜了」的狀態描述，先想自動詞＋ている。</b>
　✗ 窓を開いています　○ 窓<b>が</b>開いています（窗開著）　○ 窓<b>を</b>開けています（我正在開窗）</div>
</div>

<div class="blk"><h2>⑭ N4 常用自他動詞對照表（48 組，依變化規律分組）</h2>
<div class="tip">不要一個一個背——<b>按規律成組記</b>。記住規律後遇到新字也能推。下表粗體是他動詞。</div>
${pairTables}
</div>
`;

// ── 輸出 ───────────────────────────────────────────────
const html = `<!doctype html><html lang="zh-TW"><head><meta charset="utf-8">`
 + `<title>N4 基礎講義</title><style>${CSS}</style></head><body>`
 + page(1, "動詞變化 ①　分類・基本形・音便", "第1/2/3類的判斷與 ます・ない・て・た 形", P1)
 + page(2, "動詞變化 ②　N4 全活用形", "可能・受身・使役・意向・命令・條件　＋　句型反查表", P2)
 + page(3, "普通形・丁寧形", "名詞／い形容詞／な形容詞／動詞　四詞類 × 時態 × 肯否", P3)
 + page(4, "自動詞・他動詞", "が／を 的選擇　＋　48 組常用對照表", P4)
 + `</body></html>`;

fs.mkdirSync(path.join(ROOT, "build"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "build", "n4-handout.html"), html);
console.log("產生 build/n4-handout.html（" + html.length + " 字元）");
