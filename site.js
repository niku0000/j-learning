/* ── 共用外殼行為：置頂導覽、章節目錄、回到頂端 ───────────────── */
(function () {
  var PAGES = [
    { href: "index.html",     label: "學習記錄" },
    { href: "drill.html",     label: "動詞道場" },
    { href: "grammar.html",   label: "文法清單" },
    { href: "questions.html", label: "問題筆記" }
  ];

  function currentFile() {
    var f = location.pathname.split("/").pop();
    return f === "" ? "index.html" : f;
  }

  /* 置頂列 */
  function buildTopbar() {
    var here = currentFile();
    var bar = document.createElement("div");
    bar.className = "topbar";
    bar.innerHTML =
      '<div class="topbar-in">' +
        '<a class="brand" href="index.html">日本語ノート<span class="n">N4</span></a>' +
        '<nav class="topnav">' +
          PAGES.map(function (p) {
            return '<a href="' + p.href + '"' +
              (p.href === here ? ' class="here"' : "") + '>' + p.label + '</a>';
          }).join("") +
        '</nav>' +
      '</div>';
    document.body.insertBefore(bar, document.body.firstChild);

    // 置頂列高度會隨螢幕寬度換行而變，量出來給底下的黏著元素當偏移
    var sync = function () {
      document.documentElement.style.setProperty(
        "--topbar-h", Math.round(bar.getBoundingClientRect().height) + "px");
    };
    sync();
    window.addEventListener("resize", sync);
    if (window.ResizeObserver) new ResizeObserver(sync).observe(bar);
  }

  /* 回到頂端 */
  function buildToTop() {
    var b = document.createElement("button");
    b.className = "to-top";
    b.type = "button";
    b.title = "回到頂端";
    b.textContent = "↑";
    b.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.body.appendChild(b);
    window.addEventListener("scroll", function () {
      b.classList.toggle("show", window.scrollY > 500);
    }, { passive: true });
  }

  /* 章節目錄：掃描面板裡的 .sec-h 與 details.sec，做成可跳轉的標籤列 */
  var tocSeq = 0;
  function sectionTitle(el) {
    var t = (el.tagName === "DETAILS" ? el.querySelector("summary") : el);
    var txt = (t ? t.textContent : "").replace(/\s+/g, " ").trim();
    // 去掉尾端的計數與括號補充，讓目錄短而好掃
    txt = txt.replace(/[（(][^（()]*[)）]\s*$/, "").replace(/\s*\d+\s*$/, "").trim();
    return txt.length > 16 ? txt.slice(0, 16) + "…" : txt;
  }

  function buildTOC(panel) {
    var secs = Array.prototype.slice.call(
      panel.querySelectorAll(":scope > .sec-h, :scope > details.sec, :scope > .ref-note.intro + .sec-h")
    );
    // 也接受包在一層 div 裡的章節
    if (secs.length < 3) {
      secs = Array.prototype.slice.call(panel.querySelectorAll(".sec-h, details.sec"))
        .filter(function (el) { return !el.closest("details.sec") || el.tagName === "DETAILS"; })
        .filter(function (el) { return !(el.tagName === "DETAILS" && el.parentElement.closest("details.sec")); });
    }
    if (secs.length < 3) return;

    secs.forEach(function (el) {
      if (!el.id) el.id = "sec-" + (++tocSeq);
    });

    var toc = document.createElement("div");
    toc.className = "toc";
    toc.innerHTML =
      '<div class="toc-head">目錄' +
        '<span class="spacer"></span>' +
        '<button type="button" class="toc-act" data-all="open">全部展開</button>' +
        '<button type="button" class="toc-act" data-all="close">全部收合</button>' +
      '</div>' +
      '<div class="toc-links">' +
        secs.map(function (el) {
          return '<a href="#' + el.id + '">' + sectionTitle(el) + '</a>';
        }).join("") +
      '</div>';

    // 點目錄時，若目標是收合的區塊就先展開
    toc.addEventListener("click", function (e) {
      var act = e.target.closest(".toc-act");
      if (act) {
        var open = act.dataset.all === "open";
        panel.querySelectorAll("details.sec").forEach(function (d) { d.open = open; });
        return;
      }
      var a = e.target.closest(".toc-links a");
      if (!a) return;
      var tgt = panel.querySelector(a.getAttribute("href"));
      if (tgt && tgt.tagName === "DETAILS") tgt.open = true;
    });

    var first = panel.firstElementChild;
    // 放在開頭的導言方塊之後，讓導言仍是第一眼看到的東西
    if (first && first.classList.contains("ref-note") && first.classList.contains("intro")) {
      first.after(toc);
    } else {
      panel.insertBefore(toc, first);
    }
  }

  function init() {
    buildTopbar();
    buildToTop();
    document.querySelectorAll(".panel").forEach(buildTOC);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
