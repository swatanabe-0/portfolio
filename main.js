// エントリーポイント：各機能の初期化を、決まった順序で呼ぶだけ。
// 機能の中身は src/ に分かれている（README の「ファイル構成」を参照）。
import { initScroll } from './src/scroll.js';
import { initPointerFx } from './src/pointer-fx.js';
import { initBackground } from './src/background.js';
import { initSkills } from './src/skills.js';
import { initResume } from './src/resume.js';
import { initTerminal } from './src/terminal.js';
import { initHero } from './src/hero.js';
import { initRoles } from './src/roles.js';

initScroll();      // 慣性スクロール、ページ内リンク
initPointerFx();   // スクランブル文字、カーソル、磁石ボタン
initBackground();  // 背景の粒子
initSkills();      // Skills（物理バッジ、一覧、ミニデモ）
initResume();      // Quick Resume
initTerminal();    // ターミナル
initHero();        // 名前の文字の物理演算
initRoles();       // ロール選択とブート（最後に呼ぶ：ここで画面が始まる）
