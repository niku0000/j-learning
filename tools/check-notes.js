// 檢查資料檔裡的排版標記，是否都在對應頁面的 rich() 白名單內
// 用法：node tools/check-notes.js   （有問題時 exit code = 1）
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

// 每個資料檔 → 由哪一頁渲染、那一頁允許哪些標記
const SPECS = [
  { file: "questions.json", page: "questions.html", allow: ["b", "br", "u", "span class='zh'"] },
  { file: "grammar.json",   page: "grammar.html",   allow: ["b", "br", "span class='zh'"] },
  { file: "data.json",      page: "index.html",     allow: [] },   // index.html 全部跳脫
  { file: "progress.json",  page: "grammar.html",   allow: [] }
];

// 把白名單轉成「可接受的完整標記」集合
function allowedTags(allow) {
  const set = new Set();
  allow.forEach(a => {
    if (a === "br") { set.add("<br>"); set.add("<br/>"); set.add("<br />"); return; }
    if (a.startsWith("span")) { set.add("<" + a + ">"); set.add("</span>"); return; }
    set.add("<" + a + ">"); set.add("</" + a + ">");
  });
  return set;
}

let problems = 0;
function report(msg) { console.error("✗ " + msg); problems++; }

for (const spec of SPECS) {
  const fp = path.join(ROOT, spec.file);
  if (!fs.existsSync(fp)) { report(`${spec.file} 不存在`); continue; }

  let data;
  try { data = JSON.parse(fs.readFileSync(fp, "utf8")); }
  catch (e) { report(`${spec.file} 不是合法 JSON：${e.message}`); continue; }

  const ok = allowedTags(spec.allow);
  let strings = 0, tags = 0;

  (function walk(node, trail) {
    if (typeof node === "string") {
      strings++;
      // 只抓「長得像 HTML 標記」的（ASCII 開頭）；<尾巴> 這類中文佔位符
      // 跳脫後會正常顯示成文字，不算問題
      const found = node.match(/<\/?[a-zA-Z][^>]*>/g) || [];
      found.forEach(t => {
        tags++;
        if (!ok.has(t)) report(`${spec.file}${trail}：${spec.page} 不支援的標記 ${t}（會顯示成文字）`);
      });
    } else if (Array.isArray(node)) {
      node.forEach((x, i) => walk(x, `${trail}[${i}]`));
    } else if (node && typeof node === "object") {
      Object.keys(node).forEach(k => walk(node[k], `${trail}.${k}`));
    }
  })(data, "");

  console.log(`  ${spec.file}：掃描 ${strings} 個字串、${tags} 個標記`);
}

// questions.json 的結構檢查
const qp = path.join(ROOT, "questions.json");
if (fs.existsSync(qp)) {
  const qs = (JSON.parse(fs.readFileSync(qp, "utf8")).questions) || [];
  const seen = new Set();
  qs.forEach(q => {
    const at = `questions.json[${q.id}]`;
    ["id", "topic", "date", "question", "answer"].forEach(k => {
      if (!q[k]) report(`${at}：缺少必填欄位 ${k}`);
    });
    if (seen.has(q.id)) report(`${at}：id 重複`);
    seen.add(q.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(q.date || "")) report(`${at}：date 格式應為 YYYY-MM-DD`);
    (q.tables || []).forEach((t, ti) => {
      const n = (t.head || []).length;
      if (!n) report(`${at}.tables[${ti}]：沒有 head`);
      (t.rows || []).forEach((r, ri) => {
        if (r.length !== n) report(`${at}.tables[${ti}].rows[${ri}]：${r.length} 欄，head 是 ${n} 欄`);
      });
    });
  });
  console.log(`  questions.json：${qs.length} 則、結構檢查完成`);
}

if (problems) { console.error(`\n✗ 共 ${problems} 個問題`); process.exit(1); }
console.log("\n✓ 全部通過");
