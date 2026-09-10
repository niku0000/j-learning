// 把 build/*.html 轉成 worksheets/ 底下可直接列印的 A4 PDF
// 用法：node tools/render-pdf.js
// 需要 playwright（可用 NODE_PATH 指到已安裝的位置）
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const BUILD = path.join(ROOT, "build");
const OUT = path.join(ROOT, "worksheets");

// 環境變數 CHROME_PATH 可覆蓋瀏覽器路徑
function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  const dir = (fs.existsSync(base) ? fs.readdirSync(base) : [])
    .filter(d => d.startsWith("chromium-")).sort().pop();
  return dir ? path.join(base, dir, "chrome-linux", "chrome") : undefined;
}

const JOBS = [
  { src: "worksheet.html",            out: "n4-verb-drill-01-questions.pdf" },
  { src: "worksheet-answers.html",    out: "n4-verb-drill-01-answers.pdf"   },
  { src: "n5-worksheet.html",         out: "n5-grammar-01-questions.pdf"    },
  { src: "n5-worksheet-answers.html", out: "n5-grammar-01-answers.pdf"      },
  { src: "n5-review.html",            out: "n5-review-02-questions.pdf"     },
  { src: "n5-review-answers.html",    out: "n5-review-02-answers.pdf"       }
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: findChrome() });
  const page = await browser.newPage();
  for (const j of JOBS) {
    const src = path.join(BUILD, j.src);
    if (!fs.existsSync(src)) throw new Error("找不到 " + src + "，請先執行 node tools/make-worksheet.js");
    await page.goto("file://" + src, { waitUntil: "load" });
    const dest = path.join(OUT, j.out);
    await page.pdf({ path: dest, format: "A4", printBackground: true,
                     margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" } });
    console.log("產生 worksheets/" + j.out);
  }
  await browser.close();
})();
