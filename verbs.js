// 動詞變化引擎 + N4 內建動詞庫
// 用法：conjugate(verb, form) → 回傳變化後字串
// verb: { dict, reading, type: "godan"|"ichidan"|"suru"|"kuru", meaning }

// 五段：依語尾假名對應各行
const ROW_A = { "う":"わ","く":"か","ぐ":"が","す":"さ","つ":"た","ぬ":"な","ぶ":"ば","む":"ま","る":"ら" };
const ROW_I = { "う":"い","く":"き","ぐ":"ぎ","す":"し","つ":"ち","ぬ":"に","ぶ":"び","む":"み","る":"り" };
const ROW_E = { "う":"え","く":"け","ぐ":"げ","す":"せ","つ":"て","ぬ":"ね","ぶ":"べ","む":"め","る":"れ" };
const ROW_O = { "う":"お","く":"こ","ぐ":"ご","す":"そ","つ":"と","ぬ":"の","ぶ":"ぼ","む":"も","る":"ろ" };
const TE = { "う":"って","つ":"って","る":"って","ぬ":"んで","ぶ":"んで","む":"んで","く":"いて","ぐ":"いで","す":"して" };

// 我們要測驗/展示的變化形（key 對應下面每個引擎分支）
const FORMS = [
  { key: "masu",       label: "ます形（丁寧）" },
  { key: "te",         label: "て形" },
  { key: "ta",         label: "た形（過去）" },
  { key: "nai",        label: "ない形（否定）" },
  { key: "potential",  label: "可能形（能夠）" },
  { key: "volitional", label: "意向形（～よう）" },
  { key: "passive",    label: "受身形（被動）" },
  { key: "causative",  label: "使役形（讓/使）" },
  { key: "imperative", label: "命令形" },
  { key: "conditional",label: "假定形（～ば）" }
];

function teToTa(te) { return te.slice(0, -1) + (te.endsWith("で") ? "だ" : "た"); }

function conjGodan(dict, form) {
  const stem = dict.slice(0, -1);
  const last = dict.slice(-1);
  // 行く 的て/た例外
  const teForm = (dict === "行く" || dict === "いく") ? stem + "って" : stem + TE[last];
  switch (form) {
    case "masu":        return stem + ROW_I[last] + "ます";
    case "te":          return teForm;
    case "ta":          return teToTa(teForm);
    case "nai":         return stem + ROW_A[last] + "ない";
    case "potential":   return stem + ROW_E[last] + "る";
    case "volitional":  return stem + ROW_O[last] + "う";
    case "passive":     return stem + ROW_A[last] + "れる";
    case "causative":   return stem + ROW_A[last] + "せる";
    case "imperative":  return stem + ROW_E[last];
    case "conditional": return stem + ROW_E[last] + "ば";
  }
}

function conjIchidan(dict, form) {
  const base = dict.slice(0, -1); // 去掉る
  switch (form) {
    case "masu":        return base + "ます";
    case "te":          return base + "て";
    case "ta":          return base + "た";
    case "nai":         return base + "ない";
    case "potential":   return base + "られる";
    case "volitional":  return base + "よう";
    case "passive":     return base + "られる";
    case "causative":   return base + "させる";
    case "imperative":  return base + "ろ";
    case "conditional": return base + "れば";
  }
}

// する（含 〜する 複合，如 勉強する）
function conjSuru(dict, form) {
  const pre = dict.slice(0, -2); // 去掉「する」
  const map = {
    masu: "します", te: "して", ta: "した", nai: "しない",
    potential: "できる", volitional: "しよう", passive: "される",
    causative: "させる", imperative: "しろ", conditional: "すれば"
  };
  return pre + map[form];
}

// 来る（不規則，讀音也變）— surface 用漢字，reading 用假名
function conjKuru(form, useReading) {
  const s = { // 漢字表記
    masu: "来ます", te: "来て", ta: "来た", nai: "来ない",
    potential: "来られる", volitional: "来よう", passive: "来られる",
    causative: "来させる", imperative: "来い", conditional: "来れば"
  };
  const r = { // 假名讀音
    masu: "きます", te: "きて", ta: "きた", nai: "こない",
    potential: "こられる", volitional: "こよう", passive: "こられる",
    causative: "こさせる", imperative: "こい", conditional: "くれば"
  };
  return useReading ? r[form] : s[form];
}

// 主函式
function conjugate(verb, form) {
  if (verb.overrides && verb.overrides[form]) return verb.overrides[form];
  switch (verb.type) {
    case "godan":   return conjGodan(verb.dict, form);
    case "ichidan": return conjIchidan(verb.dict, form);
    case "suru":    return conjSuru(verb.dict, form);
    case "kuru":    return conjKuru(form, false);
  }
}
// 取讀音版（給假名提示用）
function conjugateReading(verb, form) {
  if (verb.overrides && verb.overrides[form]) return verb.overrides[form];
  if (verb.type === "kuru") return conjKuru(form, true);
  if (verb.type === "godan")   return conjGodan(verb.reading, form);
  if (verb.type === "ichidan") return conjIchidan(verb.reading, form);
  if (verb.type === "suru") {
    const pre = verb.reading.slice(0, -2);
    const map = { masu:"します",te:"して",ta:"した",nai:"しない",potential:"できる",volitional:"しよう",passive:"される",causative:"させる",imperative:"しろ",conditional:"すれば" };
    return pre + map[form];
  }
}

// ===== N4 內建動詞庫 =====
const N4_VERBS = [
  { dict:"会う", reading:"あう", type:"godan", meaning:"見面" },
  { dict:"買う", reading:"かう", type:"godan", meaning:"買" },
  { dict:"使う", reading:"つかう", type:"godan", meaning:"使用" },
  { dict:"待つ", reading:"まつ", type:"godan", meaning:"等待" },
  { dict:"持つ", reading:"もつ", type:"godan", meaning:"拿、持有" },
  { dict:"立つ", reading:"たつ", type:"godan", meaning:"站立" },
  { dict:"取る", reading:"とる", type:"godan", meaning:"拿取" },
  { dict:"作る", reading:"つくる", type:"godan", meaning:"製作" },
  { dict:"帰る", reading:"かえる", type:"godan", meaning:"回家（例外，看似一段其實五段）" },
  { dict:"入る", reading:"はいる", type:"godan", meaning:"進入（例外五段）" },
  { dict:"走る", reading:"はしる", type:"godan", meaning:"跑（例外五段）" },
  { dict:"知る", reading:"しる", type:"godan", meaning:"知道（例外五段）" },
  { dict:"死ぬ", reading:"しぬ", type:"godan", meaning:"死" },
  { dict:"遊ぶ", reading:"あそぶ", type:"godan", meaning:"玩" },
  { dict:"呼ぶ", reading:"よぶ", type:"godan", meaning:"呼叫" },
  { dict:"飛ぶ", reading:"とぶ", type:"godan", meaning:"飛" },
  { dict:"飲む", reading:"のむ", type:"godan", meaning:"喝" },
  { dict:"読む", reading:"よむ", type:"godan", meaning:"讀" },
  { dict:"休む", reading:"やすむ", type:"godan", meaning:"休息" },
  { dict:"住む", reading:"すむ", type:"godan", meaning:"居住" },
  { dict:"書く", reading:"かく", type:"godan", meaning:"寫" },
  { dict:"聞く", reading:"きく", type:"godan", meaning:"聽、問" },
  { dict:"歩く", reading:"あるく", type:"godan", meaning:"走路" },
  { dict:"働く", reading:"はたらく", type:"godan", meaning:"工作" },
  { dict:"行く", reading:"いく", type:"godan", meaning:"去（て形例外→行って）" },
  { dict:"泳ぐ", reading:"およぐ", type:"godan", meaning:"游泳" },
  { dict:"急ぐ", reading:"いそぐ", type:"godan", meaning:"趕、急" },
  { dict:"話す", reading:"はなす", type:"godan", meaning:"說" },
  { dict:"貸す", reading:"かす", type:"godan", meaning:"借出" },
  { dict:"返す", reading:"かえす", type:"godan", meaning:"歸還" },
  { dict:"食べる", reading:"たべる", type:"ichidan", meaning:"吃" },
  { dict:"見る", reading:"みる", type:"ichidan", meaning:"看" },
  { dict:"寝る", reading:"ねる", type:"ichidan", meaning:"睡" },
  { dict:"起きる", reading:"おきる", type:"ichidan", meaning:"起床" },
  { dict:"着る", reading:"きる", type:"ichidan", meaning:"穿" },
  { dict:"出る", reading:"でる", type:"ichidan", meaning:"出去" },
  { dict:"教える", reading:"おしえる", type:"ichidan", meaning:"教" },
  { dict:"覚える", reading:"おぼえる", type:"ichidan", meaning:"記住" },
  { dict:"忘れる", reading:"わすれる", type:"ichidan", meaning:"忘記" },
  { dict:"開ける", reading:"あける", type:"ichidan", meaning:"打開" },
  { dict:"閉める", reading:"しめる", type:"ichidan", meaning:"關閉" },
  { dict:"借りる", reading:"かりる", type:"ichidan", meaning:"借入" },
  { dict:"あげる", reading:"あげる", type:"ichidan", meaning:"給（我/別人 給 別人，箭頭朝外）" },
  { dict:"くれる", reading:"くれる", type:"ichidan", meaning:"（別人）給我", overrides:{ imperative:"くれ" } },
  { dict:"もらう", reading:"もらう", type:"godan", meaning:"得到（我從別人那得到）" },
  { dict:"する", reading:"する", type:"suru", meaning:"做" },
  { dict:"勉強する", reading:"べんきょうする", type:"suru", meaning:"學習" },
  { dict:"来る", reading:"くる", type:"kuru", meaning:"來" }
];

// 例外五段（看似一段，實為五段）— 供自動判斷用
const GODAN_EXCEPTIONS = ["帰る","入る","走る","知る","要る","切る","限る","減る","滑る","蹴る","喋る","握る","参る","混じる","焦る"];

// 從讀音/字典形自動判斷動詞類型（給使用者記錄裡的動詞）
function guessType(dict, reading) {
  if (dict === "来る" || reading === "くる") return "kuru";
  if (dict.endsWith("する")) return "suru";
  const r = reading || dict;
  if (r.endsWith("る") && !GODAN_EXCEPTIONS.includes(dict)) {
    const prev = r.slice(-2, -1);
    // る前為 い段或え段 → 一段
    if ("いきしちにひみりぎじびぴえけせてねへめれげぜでべぺ".includes(prev)) return "ichidan";
  }
  return "godan";
}
