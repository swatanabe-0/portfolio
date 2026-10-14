// スクロール連動の演出（About の文字の浮き上がり、カードの傾き、Works の登場）
import gsap from 'gsap';
import { $$, finePointer, reduceMotion } from './dom.js';

export function initScrollFx() {
  // スクロール前でも読める濃さ（コントラスト基準）から、完全な濃さへ
  $$('.reveal').forEach((el) => {
    gsap.fromTo(el, { opacity: 0.55 }, {
      opacity: 1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 82%', end: 'top 50%', scrub: true }
    });
  });

  // 大きな文章カードは、読みづらくなるので傾けない
  if (finePointer && !reduceMotion) {
    $$('.card:not(.card-wide)').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, { rotationY: x * 10, rotationX: -y * 10, transformPerspective: 800, duration: 0.4 });
      });
      card.addEventListener('pointerleave', () => gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.6 }));
    });
  }

  gsap.from('.works .card', {
    y: 60, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '.cards', start: 'top 80%' }
  });
}
