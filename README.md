# 日本語 學習記錄 · N4

透過看較簡單的日文小說／遊戲來練習，累積學過的**句子・單字・文法**，隨時用手機／電腦複習。

## 怎麼用

1. **看網頁複習**：開啟 GitHub Pages 網址（見下方設定），有搜尋框、標籤篩選、深色模式。
2. **新增記錄**：把遇到的日文台詞或單字貼給 Claude，Claude 會做 N4 程度的解析，並把新的一筆追加到 `data.json` 後 push，網頁就會自動更新。

## 檔案說明

- `index.html`：複習網頁（讀取 `data.json`）
- `data.json`：所有學習記錄的資料
- `README.md`：本說明

## 開啟 GitHub Pages（一次性設定）

到 repo 的 **Settings → Pages**，Source 選 `Deploy from a branch`，
Branch 選 `claude/japanese-n4-learning-tracker-a0xcic`（或合併後的 `main`）、資料夾選 `/ (root)`，儲存。
幾分鐘後網址會是：`https://niku0000.github.io/j-learning/`

## 每筆記錄的欄位（data.json）

```json
{
  "id": "20260819-001",        // 唯一編號（日期+流水號）
  "date": "2026-08-19",        // 學習日期
  "type": "sentence",          // "sentence"(句子) 或 "word"(單字)
  "source": "某小說名稱",       // 出處
  "tags": ["文法-てしまう"],    // 標籤，方便篩選
  "original": "日文原文",
  "reading": "全句假名讀音",
  "translation": "中文翻譯",
  "words": [                    // 單字拆解
    { "word": "宿題", "reading": "しゅくだい", "pos": "名詞", "meaning": "作業" }
  ],
  "grammar": [                  // 文法／句型說明
    { "point": "〜てしまった", "explain": "說明…" }
  ],
  "note": "補充備註（可省略）"
}
```
