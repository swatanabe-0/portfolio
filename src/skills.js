// Skills：物理演算で動くバッジ、クリックで詳細とミニデモ、一覧表示
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Matter from 'matter-js';
import { $, h, reduceMotion } from './dom.js';
import { SKILLS } from './data.js';
import { lenis } from './scroll.js';

const skillsSection = $('#skills');
const stage = $('#stage');
const info = $('#skillInfo');

// デモは Skills の画面に入ったときに初めて読み込む（初期表示を軽くするため）
let DEMOS = {};
let demoCleanup = null;

function showInfo(skill) {
  if (demoCleanup) { demoCleanup(); demoCleanup = null; }
  info.innerHTML = '';
  const head = h('div', 'info-head');
  head.append(h('b', null, skill.name), document.createTextNode(skill.desc));
  info.append(head);

  const demo = DEMOS[skill.name];
  if (!demo) return;
  const wrap = h('div', 'demo');
  const view = h('div', 'demo-view');
  const codeBox = h('pre', 'demo-code');
  wrap.append(view, codeBox);
  info.append(wrap);
  demoCleanup = demo(view, (text) => { codeBox.textContent = text; });

  // 画面外にあるときは、デモが見える位置までスクロール
  requestAnimationFrame(() => {
    const r = info.getBoundingClientRect();
    if (r.bottom > innerHeight - 16) {
      if (lenis) lenis.scrollTo(info, { offset: -(innerHeight - r.height - 24) });
      else info.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  });
}

// 一覧ビュー（可読性用のフォールバック）
function buildListView() {
  const list = $('#skillList');
  SKILLS.forEach((s) => {
    const li = document.createElement('li');
    const b = document.createElement('b');
    b.textContent = s.name;
    li.append(b, document.createTextNode(s.desc));
    list.append(li);
  });

  const toggle = $('#viewToggle');
  toggle.addEventListener('click', () => {
    const on = skillsSection.classList.toggle('list-mode');
    toggle.textContent = on ? '落として遊ぶ' : '一覧で見る';
    ScrollTrigger.refresh();
  });
  if (reduceMotion) {
    skillsSection.classList.add('list-mode');
    toggle.textContent = '落として遊ぶ';
  }
}

let physicsStarted = false;

async function startPhysics() {
  if (physicsStarted) return;
  physicsStarted = true;

  ({ DEMOS } = await import('./demos.js'));

  const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Query, Body } = Matter;

  const engine = Engine.create();
  engine.gravity.y = 1;
  const world = engine.world;
  let W = stage.clientWidth, H = stage.clientHeight;

  let walls = [];
  function buildWalls() {
    Composite.remove(world, walls);
    const t = 200;
    walls = [
      Bodies.rectangle(W / 2, H + t / 2, W + t * 2, t, { isStatic: true }),
      Bodies.rectangle(-t / 2, H / 2 - 400, t, H + 1200, { isStatic: true }),
      Bodies.rectangle(W + t / 2, H / 2 - 400, t, H + 1200, { isStatic: true })
    ];
    Composite.add(world, walls);
  }
  buildWalls();

  const items = SKILLS.map((s, i) => {
    const el = document.createElement('div');
    el.className = 'badge' + (s.hl === 1 ? ' hl' : s.hl === 2 ? ' hl2' : '');
    el.textContent = s.name + (DEMOS[s.name] ? ' ▶' : '');
    stage.append(el);
    const bw = el.offsetWidth, bh = el.offsetHeight;
    const body = Bodies.rectangle(
      60 + Math.random() * Math.max(W - 120, 10),
      -60 - i * 80, bw, bh,
      { chamfer: { radius: bh / 2 }, restitution: 0.35, friction: 0.3, frictionAir: 0.01 }
    );
    Body.setAngle(body, (Math.random() - 0.5) * 1.2);
    Composite.add(world, body);
    return { el, body, bw, bh, skill: s };
  });

  // 掴んで投げる
  //  - マウス：Matter のマウス拘束で掴む
  //  - タッチ：バッジの上から始めたときだけ、自前のドラッグで掴む（空いている場所はページのスクロールを妨げない）
  const mouse = Mouse.create(stage);
  ['mousewheel', 'DOMMouseScroll', 'wheel'].forEach((ev) => stage.removeEventListener(ev, mouse.mousewheel));
  stage.removeEventListener('touchmove', mouse.mousemove);
  stage.removeEventListener('touchstart', mouse.mousedown);
  stage.removeEventListener('touchend', mouse.mouseup);
  const mouseConstraint = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
  Composite.add(world, mouseConstraint);

  let drag = null; // { item, id, tx, ty, ox, oy }
  const toStage = (e) => {
    const r = stage.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    const el = e.target.closest('.badge');
    const item = el && items.find((i) => i.el === el);
    if (!item) return;
    const p = toStage(e);
    drag = {
      item, id: e.pointerId, tx: p.x, ty: p.y,
      ox: item.body.position.x - p.x, oy: item.body.position.y - p.y
    };
    try { stage.setPointerCapture(e.pointerId); } catch (err) { /* 非対応環境では無視 */ }
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const p = toStage(e);
    drag.tx = p.x;
    drag.ty = p.y;
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    // 離した勢いでそのまま投げる（速すぎる場合は上限をかける）
    const b = drag.item.body;
    const speed = Math.hypot(b.velocity.x, b.velocity.y);
    if (speed > 30) Body.setVelocity(b, { x: (b.velocity.x * 30) / speed, y: (b.velocity.y * 30) / speed });
    drag = null;
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  // クリック（タップ）判定：ドラッグと区別する
  let down = null;
  stage.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  stage.addEventListener('pointerup', (e) => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    const elapsed = performance.now() - down.t;
    down = null;
    if (moved > 10 || elapsed > 600) return;
    const r = stage.getBoundingClientRect();
    const hit = Query.point(items.map((i) => i.body), { x: e.clientX - r.left, y: e.clientY - r.top })[0];
    const item = items.find((i) => i.body === hit);
    if (item) showInfo(item.skill);
  });

  Runner.run(Runner.create(), engine);

  gsap.ticker.add(() => {
    // タッチで掴んでいるバッジは、指の位置へ引き寄せる
    if (drag) {
      const b = drag.item.body;
      Body.setVelocity(b, {
        x: (drag.tx + drag.ox - b.position.x) * 0.35,
        y: (drag.ty + drag.oy - b.position.y) * 0.35
      });
      Body.setAngularVelocity(b, b.angularVelocity * 0.7);
    }
    for (const it of items) {
      // 逆さまで止まると読めないので、ごく弱く正位置へ戻す
      const a = ((it.body.angle + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      Body.setAngularVelocity(it.body, it.body.angularVelocity - a * 0.004);
      const { x, y } = it.body.position;
      it.el.style.transform = `translate(${x - it.bw / 2}px, ${y - it.bh / 2}px) rotate(${it.body.angle}rad)`;
    }
  });

  addEventListener('resize', () => {
    W = stage.clientWidth;
    H = stage.clientHeight;
    buildWalls();
  });
}

export function initSkills() {
  buildListView();

  // 画面に入ったら物理を開始する。
  // リロード時のスクロール復元でも確実に発火させるため、ScrollTrigger ではなく IntersectionObserver を使う
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((en) => en.isIntersecting)) return;
    observer.disconnect();
    if (!reduceMotion && !skillsSection.classList.contains('list-mode')) startPhysics();
  }, { rootMargin: '0px 0px -25% 0px' });
  observer.observe(skillsSection);

  $('#viewToggle').addEventListener('click', () => {
    if (!skillsSection.classList.contains('list-mode')) startPhysics();
  });
}
