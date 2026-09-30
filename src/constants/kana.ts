export type KanaMode = "hiragana" | "katakana";
export type KanaCategory = "main" | "dakuon" | "combo";

export interface KanaItem {
  id: string;
  romaji: string;
  hiragana: string;
  katakana: string;
  row: string;
  category: KanaCategory;
}

export interface KanaRow {
  key: string;
  label: string;
  category: KanaCategory;
  items: (KanaItem | null)[];
}

export const KANA_ROWS: KanaRow[] = [
  // ================= MAIN (GOJŪON - 46 CHARS) =================
  {
    key: "a",
    label: "A-row (Vowels)",
    category: "main",
    items: [
      { id: "a", romaji: "a", hiragana: "あ", katakana: "ア", row: "a", category: "main" },
      { id: "i", romaji: "i", hiragana: "い", katakana: "イ", row: "a", category: "main" },
      { id: "u", romaji: "u", hiragana: "う", katakana: "ウ", row: "a", category: "main" },
      { id: "e", romaji: "e", hiragana: "え", katakana: "エ", row: "a", category: "main" },
      { id: "o", romaji: "o", hiragana: "お", katakana: "オ", row: "a", category: "main" },
    ],
  },
  {
    key: "ka",
    label: "K-row (Ka)",
    category: "main",
    items: [
      { id: "ka", romaji: "ka", hiragana: "か", katakana: "カ", row: "ka", category: "main" },
      { id: "ki", romaji: "ki", hiragana: "き", katakana: "キ", row: "ka", category: "main" },
      { id: "ku", romaji: "ku", hiragana: "く", katakana: "ク", row: "ka", category: "main" },
      { id: "ke", romaji: "ke", hiragana: "け", katakana: "ケ", row: "ka", category: "main" },
      { id: "ko", romaji: "ko", hiragana: "こ", katakana: "コ", row: "ka", category: "main" },
    ],
  },
  {
    key: "sa",
    label: "S-row (Sa)",
    category: "main",
    items: [
      { id: "sa", romaji: "sa", hiragana: "さ", katakana: "サ", row: "sa", category: "main" },
      { id: "shi", romaji: "shi", hiragana: "し", katakana: "シ", row: "sa", category: "main" },
      { id: "su", romaji: "su", hiragana: "す", katakana: "ス", row: "sa", category: "main" },
      { id: "se", romaji: "se", hiragana: "せ", katakana: "セ", row: "sa", category: "main" },
      { id: "so", romaji: "so", hiragana: "そ", katakana: "ソ", row: "sa", category: "main" },
    ],
  },
  {
    key: "ta",
    label: "T-row (Ta)",
    category: "main",
    items: [
      { id: "ta", romaji: "ta", hiragana: "た", katakana: "タ", row: "ta", category: "main" },
      { id: "chi", romaji: "chi", hiragana: "ち", katakana: "チ", row: "ta", category: "main" },
      { id: "tsu", romaji: "tsu", hiragana: "つ", katakana: "ツ", row: "ta", category: "main" },
      { id: "te", romaji: "te", hiragana: "て", katakana: "テ", row: "ta", category: "main" },
      { id: "to", romaji: "to", hiragana: "と", katakana: "ト", row: "ta", category: "main" },
    ],
  },
  {
    key: "na",
    label: "N-row (Na)",
    category: "main",
    items: [
      { id: "na", romaji: "na", hiragana: "な", katakana: "ナ", row: "na", category: "main" },
      { id: "ni", romaji: "ni", hiragana: "に", katakana: "ニ", row: "na", category: "main" },
      { id: "nu", romaji: "nu", hiragana: "ぬ", katakana: "ヌ", row: "na", category: "main" },
      { id: "ne", romaji: "ne", hiragana: "ね", katakana: "ネ", row: "na", category: "main" },
      { id: "no", romaji: "no", hiragana: "の", katakana: "ノ", row: "na", category: "main" },
    ],
  },
  {
    key: "ha",
    label: "H-row (Ha)",
    category: "main",
    items: [
      { id: "ha", romaji: "ha", hiragana: "は", katakana: "ハ", row: "ha", category: "main" },
      { id: "hi", romaji: "hi", hiragana: "ひ", katakana: "ヒ", row: "ha", category: "main" },
      { id: "fu", romaji: "fu", hiragana: "ふ", katakana: "フ", row: "ha", category: "main" },
      { id: "he", romaji: "he", hiragana: "へ", katakana: "ヘ", row: "ha", category: "main" },
      { id: "ho", romaji: "ho", hiragana: "ほ", katakana: "ホ", row: "ha", category: "main" },
    ],
  },
  {
    key: "ma",
    label: "M-row (Ma)",
    category: "main",
    items: [
      { id: "ma", romaji: "ma", hiragana: "ま", katakana: "マ", row: "ma", category: "main" },
      { id: "mi", romaji: "mi", hiragana: "み", katakana: "ミ", row: "ma", category: "main" },
      { id: "mu", romaji: "mu", hiragana: "む", katakana: "ム", row: "ma", category: "main" },
      { id: "me", romaji: "me", hiragana: "め", katakana: "メ", row: "ma", category: "main" },
      { id: "mo", romaji: "mo", hiragana: "も", katakana: "モ", row: "ma", category: "main" },
    ],
  },
  {
    key: "ya",
    label: "Y-row (Ya)",
    category: "main",
    items: [
      { id: "ya", romaji: "ya", hiragana: "や", katakana: "ヤ", row: "ya", category: "main" },
      null,
      { id: "yu", romaji: "yu", hiragana: "ゆ", katakana: "ユ", row: "ya", category: "main" },
      null,
      { id: "yo", romaji: "yo", hiragana: "よ", katakana: "ヨ", row: "ya", category: "main" },
    ],
  },
  {
    key: "ra",
    label: "R-row (Ra)",
    category: "main",
    items: [
      { id: "ra", romaji: "ra", hiragana: "ら", katakana: "ラ", row: "ra", category: "main" },
      { id: "ri", romaji: "ri", hiragana: "り", katakana: "リ", row: "ra", category: "main" },
      { id: "ru", romaji: "ru", hiragana: "る", katakana: "ル", row: "ra", category: "main" },
      { id: "re", romaji: "re", hiragana: "れ", katakana: "レ", row: "ra", category: "main" },
      { id: "ro", romaji: "ro", hiragana: "ろ", katakana: "ロ", row: "ra", category: "main" },
    ],
  },
  {
    key: "wa",
    label: "W-row (Wa)",
    category: "main",
    items: [
      { id: "wa", romaji: "wa", hiragana: "わ", katakana: "ワ", row: "wa", category: "main" },
      null,
      null,
      null,
      { id: "wo", romaji: "wo", hiragana: "を", katakana: "ヲ", row: "wa", category: "main" },
    ],
  },
  {
    key: "n",
    label: "N-row",
    category: "main",
    items: [
      { id: "n", romaji: "n", hiragana: "ん", katakana: "ン", row: "n", category: "main" },
      null,
      null,
      null,
      null,
    ],
  },
  {
    key: "sokuon",
    label: "Small っ (Sokuon)",
    category: "main",
    items: [
      { id: "small_tsu", romaji: "small tsu", hiragana: "っ", katakana: "ッ", row: "sokuon", category: "main" },
      null,
      null,
      null,
      null,
    ],
  },

  // ================= DAKUON (VOICED - 20 CHARS) =================
  {
    key: "ga",
    label: "G-row (Ga)",
    category: "dakuon",
    items: [
      { id: "ga", romaji: "ga", hiragana: "が", katakana: "ガ", row: "ga", category: "dakuon" },
      { id: "gi", romaji: "gi", hiragana: "ぎ", katakana: "ギ", row: "ga", category: "dakuon" },
      { id: "gu", romaji: "gu", hiragana: "ぐ", katakana: "グ", row: "ga", category: "dakuon" },
      { id: "ge", romaji: "ge", hiragana: "げ", katakana: "ゲ", row: "ga", category: "dakuon" },
      { id: "go", romaji: "go", hiragana: "ご", katakana: "ゴ", row: "ga", category: "dakuon" },
    ],
  },
  {
    key: "za",
    label: "Z-row (Za)",
    category: "dakuon",
    items: [
      { id: "za", romaji: "za", hiragana: "ざ", katakana: "ザ", row: "za", category: "dakuon" },
      { id: "ji", romaji: "ji", hiragana: "じ", katakana: "ジ", row: "za", category: "dakuon" },
      { id: "zu", romaji: "zu", hiragana: "ず", katakana: "ズ", row: "za", category: "dakuon" },
      { id: "ze", romaji: "ze", hiragana: "ぜ", katakana: "ゼ", row: "za", category: "dakuon" },
      { id: "zo", romaji: "zo", hiragana: "ぞ", katakana: "ゾ", row: "za", category: "dakuon" },
    ],
  },
  {
    key: "da",
    label: "D-row (Da)",
    category: "dakuon",
    items: [
      { id: "da", romaji: "da", hiragana: "だ", katakana: "ダ", row: "da", category: "dakuon" },
      { id: "dji", romaji: "dji", hiragana: "ぢ", katakana: "ヂ", row: "da", category: "dakuon" },
      { id: "dzu", romaji: "dzu", hiragana: "づ", katakana: "ヅ", row: "da", category: "dakuon" },
      { id: "de", romaji: "de", hiragana: "で", katakana: "デ", row: "da", category: "dakuon" },
      { id: "do", romaji: "do", hiragana: "ど", katakana: "ド", row: "da", category: "dakuon" },
    ],
  },
  {
    key: "ba",
    label: "B-row (Ba)",
    category: "dakuon",
    items: [
      { id: "ba", romaji: "ba", hiragana: "ば", katakana: "バ", row: "ba", category: "dakuon" },
      { id: "bi", romaji: "bi", hiragana: "び", katakana: "ビ", row: "ba", category: "dakuon" },
      { id: "bu", romaji: "bu", hiragana: "ぶ", katakana: "ブ", row: "ba", category: "dakuon" },
      { id: "be", romaji: "be", hiragana: "べ", katakana: "ベ", row: "ba", category: "dakuon" },
      { id: "bo", romaji: "bo", hiragana: "ぼ", katakana: "ボ", row: "ba", category: "dakuon" },
    ],
  },
  // ================= HANDAKUON (SEMI-VOICED - 5 CHARS) =================
  {
    key: "pa",
    label: "P-row (Pa)",
    category: "dakuon",
    items: [
      { id: "pa", romaji: "pa", hiragana: "ぱ", katakana: "パ", row: "pa", category: "dakuon" },
      { id: "pi", romaji: "pi", hiragana: "ぴ", katakana: "ピ", row: "pa", category: "dakuon" },
      { id: "pu", romaji: "pu", hiragana: "ぷ", katakana: "プ", row: "pa", category: "dakuon" },
      { id: "pe", romaji: "pe", hiragana: "ぺ", katakana: "ペ", row: "pa", category: "dakuon" },
      { id: "po", romaji: "po", hiragana: "ぽ", katakana: "ポ", row: "pa", category: "dakuon" },
    ],
  },

  // ================= YŌON (COMBOS / DIGRAPHS - 33 CHARS) =================
  {
    key: "kya",
    label: "K-combo (Kya)",
    category: "combo",
    items: [
      { id: "kya", romaji: "kya", hiragana: "きゃ", katakana: "キャ", row: "kya", category: "combo" },
      { id: "kyu", romaji: "kyu", hiragana: "きゅ", katakana: "キュ", row: "kya", category: "combo" },
      { id: "kyo", romaji: "kyo", hiragana: "きょ", katakana: "キョ", row: "kya", category: "combo" },
    ],
  },
  {
    key: "sha",
    label: "S-combo (Sha)",
    category: "combo",
    items: [
      { id: "sha", romaji: "sha", hiragana: "しゃ", katakana: "シャ", row: "sha", category: "combo" },
      { id: "shu", romaji: "shu", hiragana: "しゅ", katakana: "シュ", row: "sha", category: "combo" },
      { id: "sho", romaji: "sho", hiragana: "しょ", katakana: "ショ", row: "sha", category: "combo" },
    ],
  },
  {
    key: "cha",
    label: "T-combo (Cha)",
    category: "combo",
    items: [
      { id: "cha", romaji: "cha", hiragana: "ちゃ", katakana: "チャ", row: "cha", category: "combo" },
      { id: "chu", romaji: "chu", hiragana: "ちゅ", katakana: "チュ", row: "cha", category: "combo" },
      { id: "cho", romaji: "cho", hiragana: "ちょ", katakana: "チョ", row: "cha", category: "combo" },
    ],
  },
  {
    key: "nya",
    label: "N-combo (Nya)",
    category: "combo",
    items: [
      { id: "nya", romaji: "nya", hiragana: "にゃ", katakana: "ニャ", row: "nya", category: "combo" },
      { id: "nyu", romaji: "nyu", hiragana: "にゅ", katakana: "ニュ", row: "nya", category: "combo" },
      { id: "nyo", romaji: "nyo", hiragana: "にょ", katakana: "ニョ", row: "nya", category: "combo" },
    ],
  },
  {
    key: "hya",
    label: "H-combo (Hya)",
    category: "combo",
    items: [
      { id: "hya", romaji: "hya", hiragana: "ひゃ", katakana: "ヒャ", row: "hya", category: "combo" },
      { id: "hyu", romaji: "hyu", hiragana: "ひゅ", katakana: "ヒュ", row: "hya", category: "combo" },
      { id: "hyo", romaji: "hyo", hiragana: "ひょ", katakana: "ヒョ", row: "hya", category: "combo" },
    ],
  },
  {
    key: "mya",
    label: "M-combo (Mya)",
    category: "combo",
    items: [
      { id: "mya", romaji: "mya", hiragana: "みゃ", katakana: "ミャ", row: "mya", category: "combo" },
      { id: "myu", romaji: "myu", hiragana: "みゅ", katakana: "ミュ", row: "mya", category: "combo" },
      { id: "myo", romaji: "myo", hiragana: "みょ", katakana: "ミョ", row: "mya", category: "combo" },
    ],
  },
  {
    key: "rya",
    label: "R-combo (Rya)",
    category: "combo",
    items: [
      { id: "rya", romaji: "rya", hiragana: "りゃ", katakana: "リャ", row: "rya", category: "combo" },
      { id: "ryu", romaji: "ryu", hiragana: "りゅ", katakana: "リュ", row: "rya", category: "combo" },
      { id: "ryo", romaji: "ryo", hiragana: "りょ", katakana: "リョ", row: "rya", category: "combo" },
    ],
  },
  {
    key: "gya",
    label: "G-combo (Gya)",
    category: "combo",
    items: [
      { id: "gya", romaji: "gya", hiragana: "ぎゃ", katakana: "ギャ", row: "gya", category: "combo" },
      { id: "gyu", romaji: "gyu", hiragana: "ぎゅ", katakana: "ギュ", row: "gya", category: "combo" },
      { id: "gyo", romaji: "gyo", hiragana: "ぎょ", katakana: "ギョ", row: "gya", category: "combo" },
    ],
  },
  {
    key: "ja",
    label: "J-combo (Ja)",
    category: "combo",
    items: [
      { id: "ja", romaji: "ja", hiragana: "じゃ", katakana: "ジャ", row: "ja", category: "combo" },
      { id: "ju", romaji: "ju", hiragana: "じゅ", katakana: "ジュ", row: "ja", category: "combo" },
      { id: "jo", romaji: "jo", hiragana: "じょ", katakana: "ジョ", row: "ja", category: "combo" },
    ],
  },
  {
    key: "bya",
    label: "B-combo (Bya)",
    category: "combo",
    items: [
      { id: "bya", romaji: "bya", hiragana: "びゃ", katakana: "ビャ", row: "bya", category: "combo" },
      { id: "byu", romaji: "byu", hiragana: "びゅ", katakana: "ビュ", row: "bya", category: "combo" },
      { id: "byo", romaji: "byo", hiragana: "びょ", katakana: "ビョ", row: "bya", category: "combo" },
    ],
  },
  {
    key: "pya",
    label: "P-combo (Pya)",
    category: "combo",
    items: [
      { id: "pya", romaji: "pya", hiragana: "ぴゃ", katakana: "ピャ", row: "pya", category: "combo" },
      { id: "pyu", romaji: "pyu", hiragana: "ぴゅ", katakana: "ピュ", row: "pya", category: "combo" },
      { id: "pyo", romaji: "pyo", hiragana: "ぴょ", katakana: "ピョ", row: "pya", category: "combo" },
    ],
  },
];

export const ALL_KANA_ITEMS: KanaItem[] = KANA_ROWS.flatMap((r) =>
  r.items.filter((item): item is KanaItem => item !== null),
);

export const KANA_BY_ID = new Map<string, KanaItem>(
  ALL_KANA_ITEMS.map((item) => [item.id, item]),
);
