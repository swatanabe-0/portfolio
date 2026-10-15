// 内容データ（ここを書き換えるだけで中身が変わる）
import { $, $$ } from './dom.js';

// hl: 1 = 緑（インターンで使用）。それ以外は、このサイトの制作や、技術サンプルで使用したもの
// 未使用の技術は載せない（面接で聞かれたときに説明できるものだけ）
export const SKILLS = [
  { name: 'GAS', hl: 1, desc: 'インターンで、スプレッドシートとの連携に使用。' },
  {
    name: 'Python',
    hl: 1,
    desc: 'インターンで、Gemini API を呼び出すOCR処理に使用。技術サンプル（receipt-normalizer）も Python で作成。'
  },
  {
    name: 'Gemini API',
    hl: 1,
    desc: 'インターンで、OCR処理（データの読み取り）に使用。技術サンプルでは、実際に API を呼んで動作を確認。'
  },
  {
    name: '生成AI活用',
    hl: 1,
    desc: 'インターンで、開発の効率化のために導入。プロンプトの改善と、出力の検証を担当。'
  },
  { name: 'JavaScript', desc: 'このサイトの動き・物理演算・ターミナルを実装。' },
  { name: 'HTML / CSS', desc: 'このサイトのレイアウトと見た目を実装。' },
  { name: 'Three.js', desc: 'このサイトのミニデモ（3D立方体）で使用。' },
  { name: 'GSAP', desc: 'このサイトのスクロール演出、文字の整列などで使用。' },
  { name: 'Matter.js', desc: 'このサイトの、文字とバッジの物理演算で使用。' },
  { name: 'Vite', desc: 'このサイトの開発・ビルドで使用。' },
  {
    name: 'SQLite',
    desc: '技術サンプル（receipt-normalizer）で、取り込み結果の保存と、重複の排除に使用。'
  },
  {
    name: 'pydantic',
    desc: '技術サンプルで、読み取り結果と、正規化後のデータの型の定義・検証に使用。'
  },
  {
    name: 'pytest',
    desc: '技術サンプルのテストに使用。外部 API はモックに置き換え、API キー無しで実行できる。'
  },
  {
    name: 'GitHub Actions',
    desc: 'このサイトと技術サンプルで、push のたびの自動チェック（lint・整形・ビルド・テスト）に使用。'
  },
  { name: 'ESLint / Prettier', desc: 'このサイトの、コードの静的チェックと整形に使用。' }
];

export const PROFILE = {
  name: '渡辺翔太 / Watanabe Shota',
  role: '2028卒 / エンジニア志望（職種は絞り込み中）',
  email: 's.watanabe991177@gmail.com',
  github: 'https://github.com/swatanabe-0'
};

export const SECTION_LABELS = {
  about: 'ABOUT',
  timeline: 'TIMELINE',
  experience: 'EXPERIENCE',
  skills: 'SKILLS',
  works: 'WORKS'
};

// 閲覧者の立場ごとの見せ方（セクションの順序・キャッチコピー・About文）
export const ROLES = {
  hr: {
    label: '人事・採用',
    sub: '人の話をよく聞いて、現場に寄り添う開発をしています。',
    order: ['about', 'timeline', 'experience', 'works', 'skills'],
    about: [
      '長期インターンで客先に常駐し、2026年5月から続けています。人の話を聞くことが得意だと言われます。',
      '3大学合同の開発チームでは、議論が止まりがちな場に、話しやすい作業部屋と質問できる場を作り、1年で成果物を完成させました。',
      '自分が作ったもので、誰かが「楽になった」と感じてくれることが、ものづくりの一番の動機です。'
    ]
  },
  engineer: {
    label: '現場エンジニア',
    sub: 'OCRによる自動転記の仕組みを、要件定義から運用・保守まで担当しています。',
    order: ['skills', 'experience', 'works', 'timeline', 'about'],
    about: [
      'Python と Gemini API でOCR処理を行い、GAS でスプレッドシートに連携する仕組みを作っています。',
      '開発メンバー2名のうちの1人として、要件定義から開発・運用・保守までを担当しています。',
      '開発の効率化のため生成AIを導入し、プロンプトの改善と出力の検証を繰り返して、実務で使える進め方を作りました。'
    ]
  },
  exec: {
    label: '経営・マネージャー',
    sub: '現場に入り、課題を聞き出して、業務を楽にする仕組みを作ります。',
    order: ['experience', 'works', 'timeline', 'about', 'skills'],
    about: [
      '長期インターンで客先に常駐し、現場の業務効率化システムを開発しています。',
      '途中参加の案件でも、要件を改めて確認し、クライアントの要望に沿う形に方針を整えました。',
      '常に必要とされる人材であるために、現場に入り、課題を引き出して形にできる人でありたいと考えています。'
    ]
  }
};

// 「全部見る」は HTML に書かれている元の文言をそのまま使う
// （ロールを適用する前に読み取る必要があるため、モジュール読み込み時に取得する）
ROLES.all = {
  label: 'すべて',
  sub: $('.hero-sub').textContent,
  order: ['about', 'timeline', 'experience', 'skills', 'works'],
  about: $$('.about-text .reveal').map((p) => p.textContent)
};
