// ヒーローの名前：1文字ずつ物理演算で落ちる → しばらくして元の位置へ自動で整列する
import gsap from 'gsap';
import Matter from 'matter-js';
import { $, $$, reduceMotion } from './dom.js';

const { Engine, Bodies, Body, Composite } = Matter;

let api = null;

/** 名前の文字を落とす（ロール選択のあとに呼ぶ） */
export function dropHero() {
  if (api) api.drop();
}

export function initHero() {
  const hero = $('#hero');
  const title = $('#heroTitle');
  const letters = [];

  // 文字を1つずつ <span> に分割する（見た目と配置は元のまま）
  $$('.hero-title .line').forEach((line, lineIndex) => {
    const text = line.dataset.text;
    line.textContent = '';
    [...text].forEach((ch, charIndex) => {
      const el = document.createElement('span');
      el.className = 'ch';
      el.textContent = ch;
      line.append(el);
      letters.push({ el, lineIndex, charIndex, body: null, home: null });
    });
  });

  let engine = null;
  let mode = 'rest'; // rest: 定位置で静止 / falling: 物理中 / returning: 戻り中
  let ready = false;
  let pendingDrop = false;
  let visible = true;
  let idleTimer = null;
  let tween = null;
  let width = 0;
  let floorY = 0;

  // 各文字の「元の位置」を測る
  function measure() {
    letters.forEach((l) => {
      l.el.style.transform = '';
    });
    const heroRect = hero.getBoundingClientRect();
    width = heroRect.width;
    floorY = 0;
    letters.forEach((l) => {
      const r = l.el.getBoundingClientRect();
      const w = r.width * 0.92,
        h = r.height * 0.76;
      l.home = { x: r.left - heroRect.left + r.width / 2, y: r.top - heroRect.top + r.height / 2, w, h };
      floorY = Math.max(floorY, l.home.y + h / 2);
    });
  }

  function build() {
    measure();
    engine = Engine.create();
    engine.gravity.y = 1.2;
    const t = 400;
    Composite.add(engine.world, [
      Bodies.rectangle(width / 2, floorY + t / 2, width + t * 2, t, { isStatic: true }),
      Bodies.rectangle(-t / 2, floorY - 1500, t, 3600, { isStatic: true }),
      Bodies.rectangle(width + t / 2, floorY - 1500, t, 3600, { isStatic: true })
    ]);
    letters.forEach((l) => {
      l.body = Bodies.rectangle(l.home.x, l.home.y, l.home.w, l.home.h, {
        chamfer: { radius: 6 },
        restitution: 0.45,
        friction: 0.4,
        frictionAir: 0.01
      });
      Composite.add(engine.world, l.body);
      // 定位置で静止させる（解除時に質量を復元できるよう、一度動的に作ってから静的にする）
      Body.setStatic(l.body, true);
    });
    mode = 'rest';
  }

  function applyTransforms() {
    letters.forEach((l) => {
      const dx = l.body.position.x - l.home.x;
      const dy = l.body.position.y - l.home.y;
      l.el.style.transform = `translate(${dx}px, ${dy}px) rotate(${l.body.angle}rad)`;
    });
  }

  function resetIdle(ms = 4200) {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(returnHome, ms);
  }

  // 上から落とす
  function drop() {
    title.classList.add('on');
    if (reduceMotion) return;
    if (!ready) {
      pendingDrop = true;
      return;
    }
    if (tween) {
      tween.kill();
      tween = null;
    }
    letters.forEach((l) => {
      const b = l.body;
      Body.setStatic(b, false);
      const startY = -220 - (1 - l.lineIndex) * 380 - l.charIndex * 95 - Math.random() * 60;
      const x = Math.min(
        Math.max(l.home.x + (Math.random() - 0.5) * 160, l.home.w / 2),
        width - l.home.w / 2
      );
      Body.setPosition(b, { x, y: startY });
      Body.setAngle(b, (Math.random() - 0.5) * 1.4);
      Body.setVelocity(b, { x: 0, y: 0 });
      Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.15);
    });
    mode = 'falling';
    resetIdle(6500);
  }

  // 蹴散らす
  function kick(px, py) {
    if (tween) {
      tween.kill();
      tween = null;
    }
    letters.forEach((l) => {
      Body.setStatic(l.body, false);
      const dx = l.body.position.x - px,
        dy = l.body.position.y - py;
      const d = Math.max(Math.hypot(dx, dy), 1);
      const k = 14 * Math.max(0.3, 1 - d / 700);
      Body.setVelocity(l.body, {
        x: (dx / d) * k + (Math.random() - 0.5) * 4,
        y: (dy / d) * k - 8 - Math.random() * 6
      });
      Body.setAngularVelocity(l.body, (Math.random() - 0.5) * 0.3);
    });
    mode = 'falling';
    resetIdle();
  }

  // 元の位置へ戻す（読みやすさを保つため、一定時間触られなければ自動で整列する）
  function returnHome() {
    if (mode !== 'falling') return;
    mode = 'returning';
    const TAU = Math.PI * 2;
    const from = letters.map((l) => ({
      x: l.body.position.x,
      y: l.body.position.y,
      a: l.body.angle - Math.round(l.body.angle / TAU) * TAU
    }));
    letters.forEach((l) => Body.setStatic(l.body, true));
    const progress = { t: 0 };
    tween = gsap.to(progress, {
      t: 1,
      duration: 1.1,
      ease: 'power3.inOut',
      onUpdate() {
        letters.forEach((l, i) => {
          const f = from[i];
          Body.setPosition(l.body, {
            x: f.x + (l.home.x - f.x) * progress.t,
            y: f.y + (l.home.y - f.y) * progress.t
          });
          Body.setAngle(l.body, f.a * (1 - progress.t));
        });
        applyTransforms();
      },
      onComplete() {
        mode = 'rest';
        tween = null;
        letters.forEach((l) => {
          l.el.style.transform = '';
        });
      }
    });
  }

  // マウスで蹴散らす / タップで吹き飛ばす
  let last = null;
  hero.addEventListener('pointermove', (e) => {
    if (!ready || reduceMotion || e.pointerType === 'touch') return;
    const heroRect = hero.getBoundingClientRect();
    const px = e.clientX - heroRect.left,
      py = e.clientY - heroRect.top;
    const speed = last ? Math.hypot(px - last.x, py - last.y) : 0;
    last = { x: px, y: py };

    if (mode === 'falling') {
      // 動いている最中は、カーソルで押しのける
      letters.forEach((l) => {
        const dx = l.body.position.x - px,
          dy = l.body.position.y - py;
        const d = Math.hypot(dx, dy);
        if (d < 170 && d > 0) {
          const s = 0.8 + Math.min(speed, 30) * 0.08;
          Body.setVelocity(l.body, {
            x: l.body.velocity.x + (dx / d) * s,
            y: l.body.velocity.y + (dy / d) * s - 0.3
          });
        }
      });
      resetIdle();
    } else if (speed > 2) {
      // 静止しているときは、文字に触れたら散らす
      const near = letters.some(
        (l) => Math.abs(px - l.home.x) < l.home.w / 2 + 8 && Math.abs(py - l.home.y) < l.home.h / 2 + 8
      );
      if (near) kick(px, py);
    }
  });
  title.addEventListener('pointerdown', (e) => {
    if (!ready || reduceMotion) return;
    const heroRect = hero.getBoundingClientRect();
    kick(e.clientX - heroRect.left, e.clientY - heroRect.top);
  });

  gsap.ticker.add(() => {
    if (!ready || !visible || mode !== 'falling') return;
    Engine.update(engine, 1000 / 60);
    applyTransforms();
  });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  }).observe(hero);

  let resizeTimer = null;
  addEventListener('resize', () => {
    if (!ready) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (tween) {
        tween.kill();
        tween = null;
      }
      clearTimeout(idleTimer);
      build();
    }, 150);
  });

  if (!reduceMotion) {
    // フォントの読み込み後に、文字の位置を測る
    document.fonts.ready.then(() => {
      build();
      ready = true;
      if (pendingDrop) {
        pendingDrop = false;
        drop();
      }
    });
  }

  api = { drop };
}
