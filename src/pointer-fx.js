// ポインタ操作の演出：スクランブル文字、カスタムカーソル、磁石ボタン
import gsap from 'gsap';
import { $, $$, finePointer, reduceMotion } from './dom.js';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/_#';

function scramble(el, duration = 0.6) {
  if (reduceMotion) return;
  const final = el.dataset.final || (el.dataset.final = el.textContent);
  const state = { p: 0 };
  gsap.killTweensOf(state);
  gsap.to(state, {
    p: 1,
    duration,
    ease: 'none',
    onUpdate() {
      const fixed = Math.floor(state.p * final.length);
      let out = final.slice(0, fixed);
      for (let i = fixed; i < final.length; i++) {
        out += SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];
      }
      el.textContent = out;
    },
    onComplete() {
      el.textContent = final;
    }
  });
}

function initCursor() {
  document.documentElement.classList.add('has-cursor');
  const cursor = $('#cursor');
  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const target = { x: pos.x, y: pos.y };

  window.addEventListener('pointermove', (e) => {
    target.x = e.clientX;
    target.y = e.clientY;
  });
  gsap.ticker.add(() => {
    pos.x += (target.x - pos.x) * 0.2;
    pos.y += (target.y - pos.y) * 0.2;
    cursor.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
  });
  document.addEventListener('pointerover', (e) => {
    cursor.classList.toggle('big', !!e.target.closest('[data-cursor], a, button'));
  });
}

function initMagnetic() {
  const magnets = $$('.magnetic');
  window.addEventListener('pointermove', (e) => {
    magnets.forEach((el) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const near = Math.hypot(dx, dy) < Math.max(r.width, r.height) * 0.9;
      gsap.to(el, { x: near ? dx * 0.35 : 0, y: near ? dy * 0.35 : 0, duration: 0.4, ease: 'power3.out' });
    });
  });
}

export function initPointerFx() {
  $$('[data-scramble]').forEach((el) => el.addEventListener('pointerenter', () => scramble(el)));
  if (finePointer && !reduceMotion) {
    initCursor();
    initMagnetic();
  }
}
