// ロール選択：閲覧者の立場に合わせて、見せ方（並び順・文言）を変える。最初の短いブートもここ。
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, reduceMotion } from './dom.js';
import { ROLES, SECTION_LABELS } from './data.js';
import { lenis } from './scroll.js';
import { initScrollFx } from './scroll-fx.js';
import { dropHero } from './hero.js';

const BOOT_LINES = [
  '> booting portfolio.sys ...',
  '> 実績数 ........ 少ない',
  '> 熱意 .......... 過剰',
  '> ready.'
];

const roleEl = $('#role');
const roleChoose = $('#roleChoose');
const bootLog = $('#bootLog');
const bootFill = $('#bootFill');

let currentRole = 'all';
let started = false;
let bootTimeline = null;
let bootDone = false;

export const getCurrentRole = () => currentRole;

/** 選ばれた立場に合わせて、セクションの順序・番号・文言を切り替える */
function applyRole(key) {
  currentRole = ROLES[key] ? key : 'all';
  const role = ROLES[currentRole];
  document.body.dataset.role = currentRole;
  $('.hero-sub').textContent = role.sub;
  $$('.about-text .reveal').forEach((p, i) => {
    if (role.about[i]) p.textContent = role.about[i];
  });

  role.order.forEach((id, i) => {
    $('#' + id).style.order = i + 1;
    const link = $(`.site-header nav a[href="#${id}"]`);
    if (link) link.style.order = i + 1;
    $(`#${id} .eyebrow`).textContent = `0${i + 1} — ${SECTION_LABELS[id]}`;
  });
  $('#contact .eyebrow').textContent = `0${role.order.length + 1} — CONTACT`;
  $('.site-header nav a[href="#contact"]').style.order = 10;
  $('#roleChip').textContent = `VIEW: ${role.label}`;
}

/**
 * 選択画面にフォーカスを移す（キーボード・スクリーンリーダー向け）。
 * カードではなく、画面の枠（ダイアログ）にフォーカスを当てる。
 * 最初のカードに当てると、「そのカードだけ、常に選択されているように」見えてしまうため。
 * Tab キーを押したときは、これまで通り、カードにフォーカスの枠が出る。
 */
function focusDialog() {
  roleEl.focus({ preventScroll: true });
}

function showChoices() {
  roleEl.classList.remove('is-loading');
  roleChoose.inert = false;
  focusDialog();
}

/** VIEW チップから開き直すとき（ブートなし） */
function openRole() {
  roleEl.classList.add('open', 'no-boot');
  roleEl.classList.remove('is-loading');
  roleEl.setAttribute('aria-hidden', 'false');
  roleChoose.inert = false;
  if (lenis) lenis.stop();
  focusDialog();
}

/** 初回表示：短いブート（約1.4秒）の後、同じ画面にロール選択を出す */
function runBoot(fast) {
  roleEl.classList.add('open', 'is-loading');
  roleEl.setAttribute('aria-hidden', 'false');
  roleChoose.inert = true;
  if (lenis) lenis.stop();

  const finish = () => {
    if (bootDone) return;
    bootDone = true;
    window.removeEventListener('keydown', finish);
    roleEl.removeEventListener('click', finish);
    if (bootTimeline) {
      bootTimeline.kill();
      bootTimeline = null;
    }
    bootLog.textContent = BOOT_LINES.join('\n');
    bootFill.style.width = '100%';
    try {
      sessionStorage.setItem('portfolio-booted', '1');
    } catch (e) {
      /* 保存できなくても動作に影響なし */
    }
    showChoices();
  };

  if (fast) {
    finish();
    return;
  }

  // クリックかキー入力で、ブートを飛ばせる
  window.addEventListener('keydown', finish);
  roleEl.addEventListener('click', finish);
  bootTimeline = gsap.timeline({ onComplete: finish });
  bootTimeline.fromTo(bootFill, { width: '0%' }, { width: '100%', duration: 1.4, ease: 'power1.inOut' }, 0);
  BOOT_LINES.forEach((line, i) => {
    bootTimeline.call(
      () => {
        bootLog.textContent += (i ? '\n' : '') + line;
      },
      null,
      i * 0.4
    );
  });
  bootTimeline.to({}, { duration: 0.1 });
}

function chooseRole(key) {
  roleEl.classList.remove('open');
  roleEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-booting');
  applyRole(key);
  if (lenis) {
    lenis.start();
    lenis.scrollTo(0, { immediate: true });
  }
  window.scrollTo(0, 0);

  if (!started) {
    started = true;
    gsap.from('.hero .eyebrow, .hero-sub, .hero-actions', {
      opacity: 0,
      y: 20,
      duration: 0.8,
      stagger: 0.1,
      delay: 0.6
    });
    initScrollFx();
  } else {
    gsap.from('.hero-sub', { opacity: 0, y: 12, duration: 0.6 });
  }
  // 並び順が変わったので、全スクロール位置を計算し直す
  ScrollTrigger.refresh();
  dropHero();
}

export function initRoles() {
  $$('[data-role]', roleEl).forEach((btn) =>
    btn.addEventListener('click', () => chooseRole(btn.dataset.role))
  );
  $('#roleChip').addEventListener('click', openRole);

  // 起動：?role=xxx で選択を飛ばせる（開発・共有用）。同一セッションの2回目以降は、ブートを省略する
  const params = new URLSearchParams(location.search);
  const requested = params.get('role');
  if (requested && ROLES[requested]) {
    chooseRole(requested);
    return;
  }

  let seen = false;
  try {
    seen = sessionStorage.getItem('portfolio-booted') === '1';
  } catch (e) {
    /* 無視 */
  }
  runBoot(reduceMotion || params.has('noboot') || seen);
}
