// 慣性スクロール（Lenis）と ScrollTrigger の連携、ページ内リンク
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { $$, reduceMotion } from './dom.js';

gsap.registerPlugin(ScrollTrigger);

/** 慣性スクロールが無効（動きを減らす設定）のときは null */
export let lenis = null;

export function scrollToTarget(target) {
  if (lenis) lenis.scrollTo(target, { offset: -20 });
  else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
}

export function initScroll() {
  if (!reduceMotion) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop(); // ロール選択が終わるまで、スクロールを止めておく
  }

  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToTarget(a.getAttribute('href'));
    })
  );
}
