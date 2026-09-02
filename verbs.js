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
  // 基礎（N5）
  { key: "masu",       label: "ます形（丁寧）",       level: "N5", result: "sp" },
  { key: "te",         label: "て形",                level: "N5", result: "x"  },
  { key: "ta",         label: "た形（過去）",         level: "N5", result: "x"  },
  { key: "nai",        label: "ない形（否定）",       level: "N5", result: "i"  },
  { key: "nakatta",    label: "なかった形（過去否定）", level: "N5", result: "i" },
  { key: "tai",        label: "たい形（想做）",       level: "N5", result: "i"  },
  // N4
  { key: "potential",  label: "可能形（能夠）",       level: "N4", result: "v2" },
  { key: "volitional", label: "意向形（～よう）",     level: "N4", result: "x"  },
  { key: "imperative", label: "命令形",              level: "N4", result: "x"  },
  { key: "kinshi",     label: "禁止形（～な）",       level: "N4", result: "x"  },
  { key: "conditional",label: "假定形（～ば）",       level: "N4", result: "x"  },
  { key: "tara",       label: "たら形（如果～就）",    level: "N4", result: "x"  },
  { key: "tari",       label: "たり形（列舉）",       level: "N4", result: "x"  },
  { key: "passive",    label: "受身形（被動）",       level: "N4", result: "v2" },
  { key: "causative",  label: "使役形（讓/使）",      level: "N4", result: "v2" },
  { key: "causPass",   label: "使役受身形（被迫）",    level: "N4", result: "v2" }
];

// 結果詞性的說明（用於文法理解題）
const RESULT_TYPES = {
  i:  { label: "い形容詞", desc: "之後照い形容詞變化：〜くない／〜かった／〜くて" },
  v2: { label: "2類動詞",  desc: "之後照2類動詞變化：去る＋ます／ない／て／た" },
  x:  { label: "到此為止", desc: "不再繼續變化（接續或終止用）" },
  sp: { label: "自成一套", desc: "ます／ません／ました／ませんでした" }
};

function teToTa(te) { return te.slice(0, -1) + (te.endsWith("で") ? "だ" : "た"); }

function conjGodan(dict, form) {
  const stem = dict.slice(0, -1);
  const last = dict.slice(-1);
  // 防呆：語尾不是「う段假名」就無法變化（例如把名詞誤當動詞）
  if (!(last in ROW_A)) return null;
  // 行く 的て/た例外
  const teForm = (dict === "行く" || dict === "いく") ? stem + "って" : stem + TE[last];
  switch (form) {
    case "masu":        return stem + ROW_I[last] + "ます";
    case "tai":         return stem + ROW_I[last] + "たい";
    case "te":          return teForm;
    case "ta":          return teToTa(teForm);
    case "tara":        return teToTa(teForm) + "ら";
    case "tari":        return teToTa(teForm) + "り";
    case "nai":         return stem + ROW_A[last] + "ない";
    case "potential":   return stem + ROW_E[last] + "る";
    case "volitional":  return stem + ROW_O[last] + "う";
    case "passive":     return stem + ROW_A[last] + "れる";
    case "causative":   return stem + ROW_A[last] + "せる";
    // 使役受身：語尾「す」只能用〜せられる（話さされる 不自然），其餘用縮約的〜される
    case "causPass":    return last === "す" ? stem + ROW_A[last] + "せられる"
                                             : stem + ROW_A[last] + "される";
    case "imperative":  return stem + ROW_E[last];
    case "kinshi":      return dict + "な";
    case "conditional": return stem + ROW_E[last] + "ば";
  }
}

function conjIchidan(dict, form) {
  const base = dict.slice(0, -1); // 去掉る
  switch (form) {
    case "masu":        return base + "ます";
    case "tai":         return base + "たい";
    case "te":          return base + "て";
    case "ta":          return base + "た";
    case "tara":        return base + "たら";
    case "tari":        return base + "たり";
    case "nai":         return base + "ない";
    case "potential":   return base + "られる";
    case "volitional":  return base + "よう";
    case "passive":     return base + "られる";
    case "causative":   return base + "させる";
    case "causPass":    return base + "させられる";
    case "imperative":  return base + "ろ";
    case "kinshi":      return dict + "な";
    case "conditional": return base + "れば";
  }
}

// する（含 〜する 複合，如 勉強する）
function conjSuru(dict, form) {
  const pre = dict.slice(0, -2); // 去掉「する」
  const map = {
    masu: "します", tai: "したい", te: "して", ta: "した",
    tara: "したら", tari: "したり", nai: "しない",
    potential: "できる", volitional: "しよう", passive: "される",
    causative: "させる", causPass: "させられる",
    imperative: "しろ", kinshi: "するな", conditional: "すれば"
  };
  return pre + map[form];
}

// 来る（不規則，讀音也變）— surface 用漢字，reading 用假名
function conjKuru(form, useReading) {
  const s = { // 漢字表記
    masu: "来ます", tai: "来たい", te: "来て", ta: "来た",
    tara: "来たら", tari: "来たり", nai: "来ない",
    potential: "来られる", volitional: "来よう", passive: "来られる",
    causative: "来させる", causPass: "来させられる",
    imperative: "来い", kinshi: "来るな", conditional: "来れば"
  };
  const r = { // 假名讀音
    masu: "きます", tai: "きたい", te: "きて", ta: "きた",
    tara: "きたら", tari: "きたり", nai: "こない",
    potential: "こられる", volitional: "こよう", passive: "こられる",
    causative: "こさせる", causPass: "こさせられる",
    imperative: "こい", kinshi: "くるな", conditional: "くれば"
  };
  return useReading ? r[form] : s[form];
}

// 主函式
function conjugate(verb, form) {
  if (verb.overrides && verb.overrides[form]) return verb.overrides[form];
  // なかった形 ＝ ない形把「ない」換成「なかった」
  if (form === "nakatta") return conjugate(verb, "nai").replace(/ない$/, "なかった");
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
  if (form === "nakatta") return conjugateReading(verb, "nai").replace(/ない$/, "なかった");
  if (verb.type === "kuru") return conjKuru(form, true);
  if (verb.type === "godan")   return conjGodan(verb.reading, form);
  if (verb.type === "ichidan") return conjIchidan(verb.reading, form);
  if (verb.type === "suru") {
    const pre = verb.reading.slice(0, -2);
    const map = { masu:"します",tai:"したい",te:"して",ta:"した",tara:"したら",tari:"したり",
      nai:"しない",potential:"できる",volitional:"しよう",passive:"される",
      causative:"させる",causPass:"させられる",imperative:"しろ",kinshi:"するな",conditional:"すれば" };
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

// 動詞原形的語尾一定是「う段音」
const U_ROW = "うくぐすつぬぶむる";

// 特殊五段敬語動詞：ます形/命令形不規則（なさる→なさいます，非なさります）
const HONORIFIC_IRREGULAR = {
  "なさる":     { masu:"なさいます",     imperative:"なさい" },
  "いらっしゃる":{ masu:"いらっしゃいます", imperative:"いらっしゃい" },
  "おっしゃる": { masu:"おっしゃいます",   imperative:"おっしゃい" },
  "くださる":   { masu:"くださいます",     imperative:"ください" },
  "ござる":     { masu:"ございます",       imperative:"ござい" }
};

// 把使用者記錄裡的詞正規化成可變化的動詞；無法變化就回傳 null
// pos 例："動詞（1類）"、"名詞／する動詞"、"する動詞" 等
function normalizeVerb(dict, reading, pos, meaning) {
  if (!dict) return null;
  // 去掉括號註記：忘れる（下一段） → 忘れる
  dict = String(dict).replace(/[（(].*$/, "").trim();
  reading = String(reading || dict).replace(/[（(].*$/, "").trim();
  if (!dict) return null;

  const posStr = String(pos || "");
  // する動詞（名詞＋する）：満足 → 満足する
  const isSuruNoun = /する動詞|サ変/.test(posStr);
  if (isSuruNoun && !dict.endsWith("する")) {
    dict += "する";
    reading += "する";
  }

  // 語尾必須是う段假名，否則不是可變化的動詞原形（例如純名詞「満足」）
  const lastKana = reading.slice(-1);
  if (!U_ROW.includes(lastKana)) return null;

  const type = guessType(dict, reading);
  const v = { dict, reading, type, meaning: meaning || "", fromMine: true };
  // 敬語動詞的不規則形（なさる→なさいます 等）
  if (HONORIFIC_IRREGULAR[dict]) v.overrides = { ...HONORIFIC_IRREGULAR[dict] };
  // 最終驗證：實際變化一次，算不出來就丟棄
  if (!conjugate(v, "te") || !conjugate(v, "nai")) return null;
  return v;
}

// ===== 自他動詞配對（N4常見） =====
// 每組：intr = 自動詞（配が）、tran = 他動詞（配を）、group = 變化模式、meaning = 中文
const VERB_PAIRS = [
  // ① 〜aru（自）⇄ 〜eru（他）
  { group:"aru-eru", meaning:"關（門/窗）",  intr:{dict:"閉まる",reading:"しまる",type:"godan"},   tran:{dict:"閉める",reading:"しめる",type:"ichidan"} },
  { group:"aru-eru", meaning:"開始",        intr:{dict:"始まる",reading:"はじまる",type:"godan"}, tran:{dict:"始める",reading:"はじめる",type:"ichidan"} },
  { group:"aru-eru", meaning:"聚集／收集",   intr:{dict:"集まる",reading:"あつまる",type:"godan"}, tran:{dict:"集める",reading:"あつめる",type:"ichidan"} },
  { group:"aru-eru", meaning:"決定",        intr:{dict:"決まる",reading:"きまる",type:"godan"},   tran:{dict:"決める",reading:"きめる",type:"ichidan"} },
  { group:"aru-eru", meaning:"改變",        intr:{dict:"変わる",reading:"かわる",type:"godan"},   tran:{dict:"変える",reading:"かえる",type:"ichidan"} },
  { group:"aru-eru", meaning:"上升／舉起",   intr:{dict:"上がる",reading:"あがる",type:"godan"},   tran:{dict:"上げる",reading:"あげる",type:"ichidan"} },
  { group:"aru-eru", meaning:"下降／放下",   intr:{dict:"下がる",reading:"さがる",type:"godan"},   tran:{dict:"下げる",reading:"さげる",type:"ichidan"} },
  { group:"aru-eru", meaning:"停止",        intr:{dict:"止まる",reading:"とまる",type:"godan"},   tran:{dict:"止める",reading:"とめる",type:"ichidan"} },
  { group:"aru-eru", meaning:"掛／花費",     intr:{dict:"掛かる",reading:"かかる",type:"godan"},   tran:{dict:"掛ける",reading:"かける",type:"ichidan"} },
  { group:"aru-eru", meaning:"找到",        intr:{dict:"見つかる",reading:"みつかる",type:"godan"},tran:{dict:"見つける",reading:"みつける",type:"ichidan"} },
  { group:"aru-eru", meaning:"得救／救",     intr:{dict:"助かる",reading:"たすかる",type:"godan"}, tran:{dict:"助ける",reading:"たすける",type:"ichidan"} },
  // ② 〜u（自）⇄ 〜eru（他）
  { group:"u-eru",   meaning:"開（門/窗）",  intr:{dict:"開く",reading:"あく",type:"godan"},       tran:{dict:"開ける",reading:"あける",type:"ichidan"} },
  { group:"u-eru",   meaning:"繼續",        intr:{dict:"続く",reading:"つづく",type:"godan"},     tran:{dict:"続ける",reading:"つづける",type:"ichidan"} },
  { group:"u-eru",   meaning:"附著／開電器", intr:{dict:"付く",reading:"つく",type:"godan"},       tran:{dict:"付ける",reading:"つける",type:"ichidan"} },
  { group:"u-eru",   meaning:"整理",        intr:{dict:"片付く",reading:"かたづく",type:"godan"}, tran:{dict:"片付ける",reading:"かたづける",type:"ichidan"} },
  { group:"u-eru",   meaning:"成長／養育",   intr:{dict:"育つ",reading:"そだつ",type:"godan"},     tran:{dict:"育てる",reading:"そだてる",type:"ichidan"} },
  { group:"u-eru",   meaning:"排列",        intr:{dict:"並ぶ",reading:"ならぶ",type:"godan"},     tran:{dict:"並べる",reading:"ならべる",type:"ichidan"} },
  { group:"u-eru",   meaning:"前進／推進",   intr:{dict:"進む",reading:"すすむ",type:"godan"},     tran:{dict:"進める",reading:"すすめる",type:"ichidan"} },
  { group:"u-eru",   meaning:"送達／遞送",   intr:{dict:"届く",reading:"とどく",type:"godan"},     tran:{dict:"届ける",reading:"とどける",type:"ichidan"} },
  { group:"u-eru",   meaning:"站立／豎立",   intr:{dict:"立つ",reading:"たつ",type:"godan"},       tran:{dict:"立てる",reading:"たてる",type:"ichidan"} },
  // ③ 〜reru（自）⇄ 〜su（他）
  { group:"reru-su", meaning:"壞掉／弄壞",   intr:{dict:"壊れる",reading:"こわれる",type:"ichidan"},tran:{dict:"壊す",reading:"こわす",type:"godan"} },
  { group:"reru-su", meaning:"倒下／弄倒",   intr:{dict:"倒れる",reading:"たおれる",type:"ichidan"},tran:{dict:"倒す",reading:"たおす",type:"godan"} },
  { group:"reru-su", meaning:"髒了／弄髒",   intr:{dict:"汚れる",reading:"よごれる",type:"ichidan"},tran:{dict:"汚す",reading:"よごす",type:"godan"} },
  { group:"reru-su", meaning:"脫落／取下",   intr:{dict:"外れる",reading:"はずれる",type:"ichidan"},tran:{dict:"外す",reading:"はずす",type:"godan"} },
  { group:"reru-su", meaning:"分離／放開",   intr:{dict:"離れる",reading:"はなれる",type:"ichidan"},tran:{dict:"離す",reading:"はなす",type:"godan"} },
  { group:"reru-su", meaning:"躲藏／藏起",   intr:{dict:"隠れる",reading:"かくれる",type:"ichidan"},tran:{dict:"隠す",reading:"かくす",type:"godan"} },
  // ④ 〜eru（自）⇄ 〜u（他）※自動詞比較長
  { group:"eru-u",   meaning:"斷了／切",     intr:{dict:"切れる",reading:"きれる",type:"ichidan"}, tran:{dict:"切る",reading:"きる",type:"godan"} },
  { group:"eru-u",   meaning:"破了／打破",   intr:{dict:"割れる",reading:"われる",type:"ichidan"}, tran:{dict:"割る",reading:"わる",type:"godan"} },
  { group:"eru-u",   meaning:"折斷",        intr:{dict:"折れる",reading:"おれる",type:"ichidan"}, tran:{dict:"折る",reading:"おる",type:"godan"} },
  { group:"eru-u",   meaning:"破了／撕破",   intr:{dict:"破れる",reading:"やぶれる",type:"ichidan"},tran:{dict:"破る",reading:"やぶる",type:"godan"} },
  { group:"eru-u",   meaning:"賣得出去／賣", intr:{dict:"売れる",reading:"うれる",type:"ichidan"}, tran:{dict:"売る",reading:"うる",type:"godan"} },
  { group:"eru-u",   meaning:"掉了／拿下",   intr:{dict:"取れる",reading:"とれる",type:"ichidan"}, tran:{dict:"取る",reading:"とる",type:"godan"} },
  // ⑤ 〜u（自）⇄ 〜asu（他）
  { group:"u-asu",   meaning:"動／移動",     intr:{dict:"動く",reading:"うごく",type:"godan"},     tran:{dict:"動かす",reading:"うごかす",type:"godan"} },
  { group:"u-asu",   meaning:"沸騰／燒開",   intr:{dict:"沸く",reading:"わく",type:"godan"},       tran:{dict:"沸かす",reading:"わかす",type:"godan"} },
  { group:"u-asu",   meaning:"乾／弄乾",     intr:{dict:"乾く",reading:"かわく",type:"godan"},     tran:{dict:"乾かす",reading:"かわかす",type:"godan"} },
  { group:"u-asu",   meaning:"飛／放飛",     intr:{dict:"飛ぶ",reading:"とぶ",type:"godan"},       tran:{dict:"飛ばす",reading:"とばす",type:"godan"} },
  { group:"u-asu",   meaning:"減少",        intr:{dict:"減る",reading:"へる",type:"godan"},       tran:{dict:"減らす",reading:"へらす",type:"godan"} },
  { group:"u-asu",   meaning:"增加",        intr:{dict:"増える",reading:"ふえる",type:"ichidan"}, tran:{dict:"増やす",reading:"ふやす",type:"godan"} },
  { group:"u-asu",   meaning:"變冷／冰鎮",   intr:{dict:"冷える",reading:"ひえる",type:"ichidan"}, tran:{dict:"冷やす",reading:"ひやす",type:"godan"} },
  // ⑥ 不規則（讀音也變）
  { group:"irr", meaning:"熄滅／關掉", note:"き⇄け", intr:{dict:"消える",reading:"きえる",type:"ichidan"}, tran:{dict:"消す",reading:"けす",type:"godan"} },
  { group:"irr", meaning:"進入／放入", note:"はい⇄い", intr:{dict:"入る",reading:"はいる",type:"godan"},  tran:{dict:"入れる",reading:"いれる",type:"ichidan"} },
  { group:"irr", meaning:"出去／拿出", note:"で⇄だ",  intr:{dict:"出る",reading:"でる",type:"ichidan"},   tran:{dict:"出す",reading:"だす",type:"godan"} },
  { group:"irr", meaning:"起床／叫醒", intr:{dict:"起きる",reading:"おきる",type:"ichidan"}, tran:{dict:"起こす",reading:"おこす",type:"godan"} },
  { group:"irr", meaning:"掉落／弄掉", intr:{dict:"落ちる",reading:"おちる",type:"ichidan"}, tran:{dict:"落とす",reading:"おとす",type:"godan"} },
  { group:"irr", meaning:"修好／修理", intr:{dict:"直る",reading:"なおる",type:"godan"},     tran:{dict:"直す",reading:"なおす",type:"godan"} },
  { group:"irr", meaning:"搭乘／載",   intr:{dict:"乗る",reading:"のる",type:"godan"},       tran:{dict:"乗せる",reading:"のせる",type:"ichidan"} },
  { group:"irr", meaning:"剩下／留下", intr:{dict:"残る",reading:"のこる",type:"godan"},     tran:{dict:"残す",reading:"のこす",type:"godan"} },
  { group:"irr", meaning:"返回／歸還", intr:{dict:"戻る",reading:"もどる",type:"godan"},     tran:{dict:"戻す",reading:"もどす",type:"godan"} }
];

const PAIR_GROUPS = {
  "aru-eru": "〜aru（自）⇄ 〜eru（他）",
  "u-eru":   "〜u（自）⇄ 〜eru（他）",
  "reru-su": "〜reru（自）⇄ 〜su（他）",
  "eru-u":   "〜eru（自）⇄ 〜u（他）",
  "u-asu":   "〜u（自）⇄ 〜asu（他）",
  "irr":     "不規則（讀音也變）"
};

// 把配對展開成可用於測驗/變化的動詞清單（帶 kind: "intr"|"tran"）
function pairVerbs() {
  const out = [];
  VERB_PAIRS.forEach(p => {
    ["intr","tran"].forEach(k => {
      out.push({
        dict: p[k].dict, reading: p[k].reading, type: p[k].type,
        meaning: p.meaning + "（" + (k === "intr" ? "自動詞・が" : "他動詞・を") + "）",
        kind: k, pairWith: p[k === "intr" ? "tran" : "intr"].dict,
        pairMeaning: p.meaning, pairGroup: p.group, pairNote: p.note || "",
        fromPair: true
      });
    });
  });
  return out;
}
