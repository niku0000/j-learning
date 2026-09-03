// 產生可列印的 A4 練習卷（題目卷 + 解答解析卷）
// 用法：node tools/make-worksheet.js
// 所有答案由 verbs.js 的變化引擎計算，保證正確。
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const ROOT = path.join(__dirname, "..");
vm.runInThisContext(fs.readFileSync(path.join(ROOT, "verbs.js"), "utf8"));

// ---------- 工具 ----------
// 內建庫沒有、但練習卷會用到的動詞
const EXTRA = [
  { dict:"言う",   reading:"いう",     type:"godan",   meaning:"說" },
  { dict:"考える", reading:"かんがえる", type:"ichidan", meaning:"思考" },
  { dict:"分かる", reading:"わかる",   type:"godan",   meaning:"明白" }
];
const V = {};
[...N4_VERBS, ...pairVerbs(), ...EXTRA].forEach(v => { if (!V[v.dict]) V[v.dict] = v; });
function verb(d) { if (!V[d]) throw new Error("找不到動詞：" + d); return V[d]; }
const clsName = { godan: "1類", ichidan: "2類", suru: "3類", kuru: "3類" };
const formLabel = k => { const f = FORMS.find(x => x.key === k); if (!f) throw new Error("形?" + k); return f.label; };

// 把已變化的字串當成新的2類動詞（可能/受身/使役/すぎる 之後都是2類）
const asV2 = (dict, reading) => ({ dict, reading, type: "ichidan" });
// い形容詞變化（たい・ない・やすい 之後都照い形變）
const iAdj = {
  neg:     s => s.slice(0, -1) + "くない",
  past:    s => s.slice(0, -1) + "かった",
  pastNeg: s => s.slice(0, -1) + "くなかった",
  te:      s => s.slice(0, -1) + "くて",
  polite:  s => s + "です"
};

// ---------- 題目定義 ----------
// step: {v:"動詞", form:"key"} 之後可接 {v2:"form"}（把結果當2類再變）或 {ia:"neg|past|..."}
function solve(chain) {
  let cur = null, curR = null, notes = [];
  chain.forEach((st, i) => {
    if (i === 0) {
      const v = verb(st.v);
      cur = conjugate(v, st.form); curR = conjugateReading(v, st.form);
      notes.push(`${v.dict}（${clsName[v.type]}）→ ${formLabel(st.form)}：<b>${cur}</b>`);
    } else if (st.v2) {
      const pv = asV2(cur, curR);
      const before = cur;
      cur = conjugate(pv, st.v2); curR = conjugateReading(pv, st.v2);
      notes.push(`${before} 是<b>2類動詞</b>（〜る結尾）→ ${formLabel(st.v2)}：<b>${cur}</b>`);
    } else if (st.ia) {
      const before = cur;
      const map = { neg: "否定", past: "過去", pastNeg: "過去否定", te: "て形", polite: "丁寧" };
      cur = iAdj[st.ia](cur); curR = iAdj[st.ia](curR);
      notes.push(`${before} 是<b>い形容詞</b>（〜い結尾）→ ${map[st.ia]}：<b>${cur}</b>`);
    }
  });
  return { answer: cur, reading: curR, notes };
}

// 單變化題
const S = (v, form) => ({ kind: "single", v, form });
// 疊加題：chain 為步驟陣列，label 為題目上顯示的指示
const C = (label, chain) => ({ kind: "chain", label, chain });

const PAGES = [
{
  title: "第1回　【A】動詞の基本変化",
  sub: "一段階の変化だけ。まず基本の五形を確実に。",
  blocks: [
    { h: "1. ます形（丁寧）", tip: "1類：語尾→い段＋ます／2類：去る＋ます／3類：不規則",
      qs: ["飲む","買う","待つ","話す","食べる","来る"].map(d => S(d,"masu")) },
    { h: "2. て形（音便に注意）", tip: "う・つ・る→って／ぬ・む・ぶ→んで／く→いて／ぐ→いで／す→して",
      qs: ["飲む","書く","泳ぐ","話す","待つ","遊ぶ","行く","食べる","する","帰る"].map(d => S(d,"te")) },
    { h: "3. た形（過去）", tip: "て形の「て→た・で→だ」",
      qs: ["買う","読む","聞く","見る","来る"].map(d => S(d,"ta")) },
    { h: "4. ない形（否定）", tip: "1類：語尾→あ段＋ない　★「う」は「わ」になる",
      qs: ["飲む","買う","行く","話す","食べる","する","帰る"].map(d => S(d,"nai")) },
    { h: "5. なかった形（過去否定）", tip: "ない形の「ない」→「なかった」",
      qs: ["飲む","会う","見る","来る"].map(d => S(d,"nakatta")) }
  ]
},
{
  title: "第2回　【A】N4の各変化形",
  sub: "一段階の変化。N4で出るかたちを一通り。",
  blocks: [
    { h: "1. たい形（想做）", tip: "ます形去ます＋たい",
      qs: ["行く","飲む","食べる","する","来る"].map(d => S(d,"tai")) },
    { h: "2. 可能形（能夠）", tip: "1類：語尾→え段＋る／2類：去る＋られる／する→できる",
      qs: ["飲む","書く","話す","食べる","する","来る"].map(d => S(d,"potential")) },
    { h: "3. 意向形（〜吧）", tip: "1類：語尾→お段＋う／2類：去る＋よう",
      qs: ["行く","飲む","食べる","する"].map(d => S(d,"volitional")) },
    { h: "4. 命令形・禁止形", tip: "命令：1類→え段／2類→ろ　　禁止：辭書形＋な",
      qs: [S("行く","imperative"), S("待つ","imperative"), S("見る","imperative"),
           S("入る","kinshi"), S("忘れる","kinshi"), S("する","kinshi")] },
    { h: "5. 条件形（ば・たら）", tip: "ば：1類→え段＋ば／2類→去る＋れば　　たら：た形＋ら",
      qs: [S("飲む","conditional"), S("行く","conditional"), S("食べる","conditional"), S("する","conditional"),
           S("会う","tara"), S("読む","tara"), S("起きる","tara"), S("来る","tara")] },
    { h: "6. 受身形・使役形", tip: "受身：あ段＋れる／られる　　使役：あ段＋せる／させる",
      qs: [S("言う","passive"), S("見る","passive"), S("する","passive"),
           S("待つ","causative"), S("食べる","causative"), S("来る","causative")] }
  ]
},
{
  title: "第3回　【A→B】二段階の変化",
  sub: "一つ目の変化のあと、その結果にもう一度変化をかける。",
  blocks: [
    { h: "1. 可能形 → 否定／過去", tip: "可能形は〜る結尾＝2類動詞。だから去る＋ない／た",
      qs: [
        C("可能形 → 否定", [{v:"飲む",form:"potential"},{v2:"nai"}]),
        C("可能形 → 否定", [{v:"食べる",form:"potential"},{v2:"nai"}]),
        C("可能形 → 過去", [{v:"行く",form:"potential"},{v2:"ta"}]),
        C("可能形 → 丁寧", [{v:"もらう",form:"potential"},{v2:"masu"}])
      ]},
    { h: "2. 受身形 → 過去／丁寧", tip: "受身形も〜る結尾＝2類動詞",
      qs: [
        C("受身形 → 過去", [{v:"言う",form:"passive"},{v2:"ta"}]),
        C("受身形 → 過去", [{v:"見る",form:"passive"},{v2:"ta"}]),
        C("受身形 → 丁寧", [{v:"呼ぶ",form:"passive"},{v2:"masu"}]),
        C("受身形 → 否定", [{v:"使う",form:"passive"},{v2:"nai"}])
      ]},
    { h: "3. 使役形 → て形／過去", tip: "使役形も2類。て形は去る＋て",
      qs: [
        C("使役形 → て形", [{v:"待つ",form:"causative"},{v2:"te"}]),
        C("使役形 → 過去", [{v:"書く",form:"causative"},{v2:"ta"}]),
        C("使役形 → て形", [{v:"考える",form:"causative"},{v2:"te"}]),
        C("使役形 → 丁寧", [{v:"休む",form:"causative"},{v2:"masu"}])
      ]},
    { h: "4. たい形 → 否定／過去", tip: "たい形は〜い結尾＝い形容詞。だから くない／かった",
      qs: [
        C("たい形 → 否定", [{v:"行く",form:"tai"},{ia:"neg"}]),
        C("たい形 → 否定", [{v:"食べる",form:"tai"},{ia:"neg"}]),
        C("たい形 → 過去", [{v:"会う",form:"tai"},{ia:"past"}]),
        C("たい形 → 丁寧", [{v:"する",form:"tai"},{ia:"polite"}])
      ]},
    { h: "5. ない形 → 過去／て形", tip: "ない形も〜い結尾＝い形容詞",
      qs: [
        C("ない形 → 過去", [{v:"飲む",form:"nai"},{ia:"past"}]),
        C("ない形 → て形", [{v:"分かる",form:"nai"},{ia:"te"}]),
        C("ない形 → 過去", [{v:"来る",form:"nai"},{ia:"past"}]),
        C("ない形 → 丁寧", [{v:"食べる",form:"nai"},{ia:"polite"}])
      ]}
  ]
},
{
  title: "第4回　【A→B→C】三段階の変化",
  sub: "三つ重ねる。毎回「今どの品詞か」を確認しながら進めること。",
  blocks: [
    { h: "1. 可能形 → 否定 → 過去", tip: "可能(2類)→ない(い形)→かった",
      qs: [
        C("可能→否定→過去", [{v:"飲む",form:"potential"},{v2:"nai"},{ia:"past"}]),
        C("可能→否定→過去", [{v:"食べる",form:"potential"},{v2:"nai"},{ia:"past"}]),
        C("可能→否定→過去", [{v:"来る",form:"potential"},{v2:"nai"},{ia:"past"}]),
        C("可能→否定→丁寧", [{v:"話す",form:"potential"},{v2:"nai"},{ia:"polite"}])
      ]},
    { h: "2. たい形 → 否定 → 過去", tip: "たい(い形)→くない(い形)→くなかった",
      qs: [
        C("たい→否定→過去", [{v:"行く",form:"tai"},{ia:"pastNeg"}]),
        C("たい→否定→過去", [{v:"見る",form:"tai"},{ia:"pastNeg"}]),
        C("たい→否定→過去", [{v:"する",form:"tai"},{ia:"pastNeg"}]),
        C("たい→過去→丁寧", [{v:"買う",form:"tai"},{ia:"past"},{ia:"polite"}])
      ]},
    { h: "3. 使役形 → て形 →（＋ください）", tip: "使役(2類)→て形。「〜させてください」＝請讓我～",
      qs: [
        C("使役→て形（＋ください）", [{v:"行く",form:"causative"},{v2:"te"}]),
        C("使役→て形（＋ください）", [{v:"考える",form:"causative"},{v2:"te"}]),
        C("使役→て形（＋ください）", [{v:"する",form:"causative"},{v2:"te"}]),
        C("使役→過去→丁寧", [{v:"待つ",form:"causative"},{v2:"masu"}])
      ]},
    { h: "4. 受身形 → 否定 → 過去", tip: "受身(2類)→ない(い形)→かった",
      qs: [
        C("受身→否定→過去", [{v:"言う",form:"passive"},{v2:"nai"},{ia:"past"}]),
        C("受身→否定→過去", [{v:"呼ぶ",form:"passive"},{v2:"nai"},{ia:"past"}]),
        C("受身→過去→丁寧", [{v:"見る",form:"passive"},{v2:"masu"}]),
        C("受身→て形", [{v:"使う",form:"passive"},{v2:"te"}])
      ]},
    { h: "5. 使役受身形（被迫）", tip: "1類：あ段＋される（語尾「す」は〜せられる）／2類：去る＋させられる",
      qs: [S("飲む","causPass"), S("行く","causPass"), S("話す","causPass"),
           S("食べる","causPass"), S("する","causPass"), S("来る","causPass")] }
  ]
}
];

// ---------- 第5回：綜合（手寫題） ----------
const PAGE5 = {
  title: "第5回　【総合】自他動詞・形容詞・文の書き換え",
  sub: "これまでの内容をまぜて。文ごと書きかえる練習。",
  jita: [
    { q: "ドアが（　　　　）。／私がドアを（　　　　）。", hint: "開く・開ける",
      a: "開いた ／ 開けた", ex: "自動詞は「が」＝ドア自身がどうなったか。他動詞は「を」＝誰かが開けた。" },
    { q: "電気が（　　　　）。／電気を（　　　　）。", hint: "消える・消す",
      a: "消えた ／ 消した", ex: "消える(きえる)は自動詞、消す(けす)は他動詞。読みも変わるので注意。" },
    { q: "部屋が（　　　　）。／部屋を（　　　　）。", hint: "片付く・片付ける",
      a: "片付いた ／ 片付けた", ex: "〜u（自）⇄〜eru（他）のパターン。" },
    { q: "コップが（　　　　）。／コップを（　　　　）。", hint: "割れる・割る",
      a: "割れた ／ 割った", ex: "〜eru（自）⇄〜u（他）。自動詞のほうが長いパターン。" },
    { q: "車が（　　　　）。／車を（　　　　）。", hint: "動く・動かす",
      a: "動いた ／ 動かした", ex: "〜u（自）⇄〜asu（他）。語尾「す」＝他動詞の目印。" },
    { q: "会議が（　　　　）。／会議を（　　　　）。", hint: "始まる・始める",
      a: "始まった ／ 始めた", ex: "〜aru（自）⇄〜eru（他）。「〜ある」で終わる＝自動詞の目印。" }
  ],
  adj: [
    { q: "高い → 否定", a: "高くない", ex: "い形容詞：い→くない" },
    { q: "高い → 過去", a: "高かった", ex: "い形容詞：い→かった" },
    { q: "高い → 過去否定", a: "高くなかった", ex: "い形容詞：い→くなかった" },
    { q: "静か → 否定", a: "静かじゃない", ex: "な形容詞：＋じゃない（ではない）" },
    { q: "静か → 過去", a: "静かだった", ex: "な形容詞：＋だった" },
    { q: "静か → 丁寧の過去", a: "静かでした", ex: "な形容詞：＋でした。★い形容詞は「高いでした」と言えない" },
    { q: "いい → 否定", a: "よくない", ex: "★不規則：いい→よ に変えてから変化（いくない は✗）" },
    { q: "いい → 過去", a: "よかった", ex: "★不規則：いかった は✗" },
    { q: "きれい → 否定", a: "きれいじゃない", ex: "★「い」で終わるが な形容詞。きれくない は✗" },
    { q: "安い＋おいしい（連接）", a: "安くておいしい", ex: "い形容詞のて形：い→くて" },
    { q: "静か＋きれい（連接）", a: "静かできれい", ex: "な形容詞のて形：＋で" },
    { q: "高い → 副詞（〜なる）", a: "高くなる", ex: "い形容詞の副詞化：い→く。な形は「静かになる」" }
  ],
  rewrite: [
    { q: "毎日 コーヒーを 飲みます。 → 常體（辭書形）に", a: "毎日コーヒーを飲む。",
      ex: "ます形→辭書形。丁寧體を常體に戻す基本。" },
    { q: "お酒を 飲みます。 → 「飲めない」を使って否定に", a: "お酒が飲めない。",
      ex: "可能形の否定。★可能形の対象は「を」ではなく「が」。" },
    { q: "友達が 来ました。 → 受身（迷惑）にして「勉強できなかった」を続ける", a: "友達に来られて、勉強できなかった。",
      ex: "自動詞の受身＝迷惑の受身。動作主は「に」。中国語にはない用法。" },
    { q: "私は 休みます。 → 「〜させてください」で許可を求める文に", a: "休ませてください。",
      ex: "使役形＋てください＝「請讓我～」。相手にやらせるのではなく、自分の許可を求める形。" },
    { q: "弟が お菓子を 食べました。 → 「私」を主語にした受身に", a: "（私は）弟にお菓子を食べられました。",
      ex: "所有物の受身。被害を受けた「私」が主語、動作主は「に」、物は「を」。" },
    { q: "この本は 読みやすいです。 → 過去否定に", a: "この本は読みやすくなかったです。",
      ex: "やすい＝い形容詞。だから くなかった。" }
  ]
};

// ---------- HTML 產生 ----------
const CSS = `
@page { size: A4; margin: 12mm 10mm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: "Hiragino Sans","Noto Sans TC","Yu Gothic",sans-serif; color:#000; background:#fff; font-size:10pt; line-height:1.45; }
.page { width:190mm; min-height:273mm; padding:0; page-break-after:always; position:relative; }
.page:last-child { page-break-after:auto; }
.head { border-bottom:2px solid #000; padding-bottom:3mm; margin-bottom:3mm; display:flex; align-items:baseline; justify-content:space-between; }
.head h1 { font-size:14pt; letter-spacing:.5px; }
.head .sub { font-size:8.5pt; color:#444; margin-top:1mm; }
.head .meta { font-size:8pt; color:#444; white-space:nowrap; }
.blk { margin-bottom:3.2mm; break-inside:avoid; }
.blk h2 { font-size:10.5pt; background:#000; color:#fff; padding:1mm 2mm; display:inline-block; }
.blk .tip { font-size:8pt; color:#333; border-left:2px solid #999; padding-left:2mm; margin:1.2mm 0 1.8mm; }
.qgrid { display:grid; grid-template-columns:1fr 1fr; gap:1mm 6mm; }
.qgrid.one { grid-template-columns:1fr; }
.q { display:flex; align-items:baseline; gap:1.5mm; font-size:9.5pt; padding:.6mm 0; }
.q .n { width:6mm; flex:0 0 6mm; font-size:8pt; color:#555; }
.q .p { white-space:nowrap; }
.q .cls { font-size:7.5pt; color:#555; }
.q .bl { flex:1; border-bottom:1px solid #000; min-height:5mm; min-width:22mm; }
.q .arrow { color:#555; }
.q .lbl { font-size:8pt; color:#333; white-space:nowrap; }
.foot { position:absolute; bottom:0; width:100%; border-top:1px solid #000; padding-top:1.5mm; font-size:7.5pt; color:#444; display:flex; justify-content:space-between; }
/* 解答卷：雙欄壓縮 */
.ans { font-size:8.5pt; line-height:1.35; }
.ans .q { display:block; padding:.7mm 0; border-bottom:1px dotted #bbb; break-inside:avoid; }
.ans .a { font-weight:700; }
.ans .ex { font-size:7.2pt; color:#333; margin-top:.3mm; line-height:1.3; }
.ans .ex b { font-weight:700; }
.ans .qgrid { grid-template-columns:1fr 1fr; gap:0 5mm; }
.ans .blk { margin-bottom:2.2mm; }
.ans .blk h2 { font-size:9pt; padding:.7mm 1.5mm; }
.ans .blk .tip { font-size:7.2pt; margin:.8mm 0 1mm; }
.ans .head h1 { font-size:12pt; }
.two { display:grid; grid-template-columns:1fr 1fr; gap:0 6mm; }
@media screen { body { padding:10mm; background:#eee; } .page { background:#fff; margin:0 auto 8mm; padding:12mm 10mm; box-shadow:0 1px 4px rgba(0,0,0,.3); } }
`;

function qLine(n, q, showAns) {
  if (q.kind === "single") {
    const v = verb(q.v);
    const r = solve([{ v: q.v, form: q.form }]);
    const body = showAns
      ? `<span class="a">${r.answer}</span>${r.reading !== r.answer ? `　<span class="ex">（${r.reading}）</span>` : ""}`
      : `<span class="bl"></span>`;
    return `<div class="q"><span class="n">${n}.</span><span class="p">${v.dict}<span class="cls">（${clsName[v.type]}）</span></span><span class="arrow">→</span>${body}</div>`;
  }
  const r = solve(q.chain);
  const first = verb(q.chain[0].v);
  const body = showAns
    ? `<span class="a">${r.answer}</span>`
    : `<span class="bl"></span>`;
  return `<div class="q"><span class="n">${n}.</span><span class="p">${first.dict}<span class="cls">（${clsName[first.type]}）</span></span><span class="lbl">［${q.label}］</span><span class="arrow">→</span>${body}</div>`;
}

function ansLine(n, q) {
  if (q.kind === "single") {
    const r = solve([{ v: q.v, form: q.form }]);
    const v = verb(q.v);
    return `<div class="q"><span class="n">${n}.</span> ${v.dict}（${clsName[v.type]}）→ <span class="a">${r.answer}</span>${r.reading !== r.answer ? `　（${r.reading}）` : ""}<div class="ex">${r.notes.join("　／　")}</div></div>`;
  }
  const r = solve(q.chain);
  const v = verb(q.chain[0].v);
  return `<div class="q"><span class="n">${n}.</span> ${v.dict}（${clsName[v.type]}）［${q.label}］→ <span class="a">${r.answer}</span><div class="ex">${r.notes.join("　→　")}</div></div>`;
}

function buildQuestionPages() {
  let html = "";
  PAGES.forEach((pg, pi) => {
    let n = 0;
    html += `<div class="page"><div class="head"><div><h1>${pg.title}</h1><div class="sub">${pg.sub}</div></div><div class="meta">名前 ____________　日付 ____ / ____</div></div>`;
    pg.blocks.forEach(b => {
      html += `<div class="blk"><h2>${b.h}</h2><div class="tip">${b.tip}</div><div class="qgrid${b.qs[0].kind === "chain" ? " one" : ""}">`;
      b.qs.forEach(q => { n++; html += qLine(n, q, false); });
      html += `</div></div>`;
    });
    html += `<div class="foot"><span>日本語 N4 動詞変化ドリル</span><span>全${n}問　／　${pi + 1} / 5</span></div></div>`;
  });
  // 第5回
  let n = 0;
  const p5 = PAGE5;
  html += `<div class="page"><div class="head"><div><h1>${p5.title}</h1><div class="sub">${p5.sub}</div></div><div class="meta">名前 ____________　日付 ____ / ____</div></div>`;
  html += `<div class="blk"><h2>1. 自動詞・他動詞（適切な形にして書く）</h2><div class="tip">「が」＝自動詞（物がどうなったか）／「を」＝他動詞（誰かがやった）。すべて過去形（〜た）で答えること。</div><div class="qgrid one">`;
  p5.jita.forEach(x => { n++; html += `<div class="q"><span class="n">${n}.</span><span class="p">${x.q}</span><span class="lbl">［${x.hint}］</span></div>`; });
  html += `</div></div>`;
  html += `<div class="blk"><h2>2. 形容詞の変化</h2><div class="tip">い形容詞：い→くない／かった　　な形容詞：＋じゃない／だった</div><div class="qgrid">`;
  p5.adj.forEach(x => { n++; html += `<div class="q"><span class="n">${n}.</span><span class="p">${x.q}</span><span class="arrow">→</span><span class="bl"></span></div>`; });
  html += `</div></div>`;
  html += `<div class="blk"><h2>3. 文の書き換え</h2><div class="tip">指示にしたがって文全体を書きかえる。</div><div class="qgrid one">`;
  p5.rewrite.forEach(x => { n++; html += `<div class="q" style="display:block"><span class="n">${n}.</span>${x.q}<div class="bl" style="margin-top:1mm;height:6mm"></div></div>`; });
  html += `</div></div>`;
  html += `<div class="foot"><span>日本語 N4 動詞変化ドリル</span><span>全${n}問　／　5 / 5</span></div></div>`;
  return html;
}

function buildAnswerPages() {
  let html = "";
  PAGES.forEach((pg, pi) => {
    let n = 0;
    html += `<div class="page ans"><div class="head"><div><h1>【解答・解説】${pg.title}</h1><div class="sub">${pg.sub}</div></div><div class="meta">${pi + 1} / 5</div></div>`;
    pg.blocks.forEach(b => {
      html += `<div class="blk"><h2>${b.h}</h2><div class="tip">${b.tip}</div><div class="qgrid">`;
      b.qs.forEach(q => { n++; html += ansLine(n, q); });
      html += `</div></div>`;
    });
    html += `<div class="foot"><span>解答・解説</span><span>全${n}問</span></div></div>`;
  });
  // 第5回解答
  let n = 0;
  const p5 = PAGE5;
  html += `<div class="page ans"><div class="head"><div><h1>【解答・解説】${p5.title}</h1></div><div class="meta">5 / 5</div></div>`;
  html += `<div class="blk"><h2>1. 自動詞・他動詞</h2><div class="qgrid">`;
  p5.jita.forEach(x => { n++; html += `<div class="q"><span class="n">${n}.</span> ${x.q}<br><span class="a">→ ${x.a}</span><div class="ex">${x.ex}</div></div>`; });
  html += `</div></div>`;
  html += `<div class="blk"><h2>2. 形容詞の変化</h2><div class="qgrid">`;
  p5.adj.forEach(x => { n++; html += `<div class="q"><span class="n">${n}.</span> ${x.q} → <span class="a">${x.a}</span><div class="ex">${x.ex}</div></div>`; });
  html += `</div></div>`;
  html += `<div class="blk"><h2>3. 文の書き換え</h2><div class="qgrid">`;
  p5.rewrite.forEach(x => { n++; html += `<div class="q"><span class="n">${n}.</span> ${x.q}<br><span class="a">→ ${x.a}</span><div class="ex">${x.ex}</div></div>`; });
  html += `</div></div>`;
  html += `<div class="foot"><span>解答・解説</span><span>全${n}問</span></div></div>`;
  return html;
}

const page = (title, body) =>
`<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><style>${CSS}</style></head>
<body>${body}</body></html>`;

// HTML 只是產生 PDF 用的中間檔，不放進網站
const BUILD = path.join(ROOT, "build");
fs.mkdirSync(BUILD, { recursive: true });
fs.writeFileSync(path.join(BUILD, "worksheet.html"),
  page("N4 動詞変化ドリル（問題）", buildQuestionPages()), "utf8");
fs.writeFileSync(path.join(BUILD, "worksheet-answers.html"),
  page("N4 動詞変化ドリル（解答・解説）", buildAnswerPages()), "utf8");

// 統計
let total = 0;
PAGES.forEach(pg => pg.blocks.forEach(b => total += b.qs.length));
const p5n = PAGE5.jita.length + PAGE5.adj.length + PAGE5.rewrite.length;
console.log("build/worksheet.html / build/worksheet-answers.html 產生完成");
console.log("題數：第1-4回 " + total + " 題 ＋ 第5回 " + p5n + " 題 ＝ 合計 " + (total + p5n) + " 題");
