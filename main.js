import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Matter from 'matter-js';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

// ==========================================
// 内容データ（ここを書き換えるだけで中身が変わる）
// ==========================================
// hl: 1 = 緑（インターンで使用）。それ以外は、このサイトの制作で使用したもの
// 未使用の技術は載せない（面接で聞かれたときに説明できるものだけ）
const SKILLS = [
  { name: 'GAS', hl: 1, desc: 'インターンで、スプレッドシートとの連携に使用。' },
  { name: 'Python', hl: 1, desc: 'インターンで、Gemini API を呼び出すOCR処理に使用。' },
  { name: 'Gemini API', hl: 1, desc: 'インターンで、OCR処理（データの読み取り）に使用。' },
  { name: '生成AI活用', hl: 1, desc: 'インターンで、開発の効率化のために導入。プロンプトの改善と、出力の検証を担当。' },
  { name: 'JavaScript', desc: 'このサイトの動き・物理演算・ターミナルを実装。' },
  { name: 'HTML / CSS', desc: 'このサイトのレイアウトと見た目を実装。' },
  { name: 'Three.js', desc: 'このサイトのミニデモ（3D立方体）で使用。' },
  { name: 'GSAP', desc: 'このサイトのスクロール演出、文字の整列などで使用。' },
  { name: 'Matter.js', desc: 'このサイトの、文字とバッジの物理演算で使用。' },
  { name: 'Vite', desc: 'このサイトの開発・ビルドで使用。' }
];

const PROFILE = {
  name: '渡辺翔太 / Watanabe Shota',
  role: '2028卒 / エンジニア志望（職種は絞り込み中）',
  email: 's.watanabe991177@gmail.com',
  github: 'https://github.com/swatanabe-0'
};

// 閲覧者の立場ごとの見せ方（順序・キャッチコピー・About文）
const SECTION_LABELS = { about: 'ABOUT', timeline: 'TIMELINE', experience: 'EXPERIENCE', skills: 'SKILLS', works: 'WORKS' };
const ROLES = {
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
ROLES.all = {
  label: 'すべて',
  sub: $('.hero-sub').textContent,
  order: ['about', 'timeline', 'experience', 'skills', 'works'],
  about: $$('.about-text .reveal').map((p) => p.textContent)
};
let currentRole = 'all';

// ==========================================
// Lenis (慣性スクロール) + ScrollTrigger 連携
// ==========================================
let lenis = null;
if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
function scrollToTarget(target) {
  if (lenis) lenis.scrollTo(target, { offset: -20 });
  else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
}
$$('a[href^="#"]').forEach((a) =>
  a.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToTarget(a.getAttribute('href'));
  })
);

// ==========================================
// スクランブルテキスト
// ==========================================
const SCR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/_#';
function scramble(el, duration = 0.6) {
  if (reduceMotion) return;
  const final = el.dataset.final || (el.dataset.final = el.textContent);
  const state = { p: 0 };
  gsap.killTweensOf(state);
  gsap.to(state, {
    p: 1, duration, ease: 'none',
    onUpdate() {
      const fixed = Math.floor(state.p * final.length);
      let out = final.slice(0, fixed);
      for (let i = fixed; i < final.length; i++) out += SCR[(Math.random() * SCR.length) | 0];
      el.textContent = out;
    },
    onComplete() { el.textContent = final; }
  });
}
$$('[data-scramble]').forEach((el) => el.addEventListener('pointerenter', () => scramble(el)));

// ==========================================
// カスタムカーソル + マグネティックボタン
// ==========================================
if (finePointer && !reduceMotion) {
  document.documentElement.classList.add('has-cursor');
  const cur = $('#cursor');
  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const tgt = { x: pos.x, y: pos.y };
  window.addEventListener('pointermove', (e) => { tgt.x = e.clientX; tgt.y = e.clientY; });
  gsap.ticker.add(() => {
    pos.x += (tgt.x - pos.x) * 0.2;
    pos.y += (tgt.y - pos.y) * 0.2;
    cur.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
  });
  document.addEventListener('pointerover', (e) => {
    cur.classList.toggle('big', !!e.target.closest('[data-cursor], a, button'));
  });

  const mags = $$('.magnetic');
  window.addEventListener('pointermove', (e) => {
    mags.forEach((el) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const near = Math.hypot(dx, dy) < Math.max(r.width, r.height) * 0.9;
      gsap.to(el, { x: near ? dx * 0.35 : 0, y: near ? dy * 0.35 : 0, duration: 0.4, ease: 'power3.out' });
    });
  });
}

// ==========================================
// 背景：カーソルに反応する粒子（Canvas 2D）
// ==========================================
(function particles() {
  const cv = $('#bg');
  const ctx = cv.getContext('2d');
  let w, h, dpr;
  const N = innerWidth < 720 ? 50 : 110;
  const pts = [];
  const mouse = { x: -9999, y: -9999 };
  function resize() {
    dpr = Math.min(devicePixelRatio, 2);
    w = cv.width = innerWidth * dpr;
    h = cv.height = innerHeight * dpr;
  }
  resize();
  addEventListener('resize', resize);
  addEventListener('pointermove', (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
  for (let i = 0; i < N; i++) {
    pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .25 * dpr, vy: (Math.random() - .5) * .25 * dpr });
  }
  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const d = Math.hypot(dx, dy);
      if (d < 160 * dpr) { p.vx += (dx / d) * 0.12; p.vy += (dy / d) * 0.12; }
      p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx + (Math.random() - .5) * .05;
      p.y += p.vy + (Math.random() - .5) * .05;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
    }
    ctx.lineWidth = dpr;
    for (let i = 0; i < N; i++) {
      const a = pts[i];
      ctx.fillStyle = 'rgba(124,245,196,.55)';
      ctx.fillRect(a.x, a.y, 2 * dpr, 2 * dpr);
      for (let j = i + 1; j < N; j++) {
        const b = pts[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120 * dpr) {
          ctx.strokeStyle = `rgba(124,245,196,${0.12 * (1 - d / (120 * dpr))})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }
  if (!reduceMotion) frame();
})();

// ==========================================
// スクロール演出（About の文字・カードの傾き）
// ==========================================
function initScrollFx() {
  $$('.reveal').forEach((el) => {
    gsap.fromTo(el, { opacity: 0.15 }, {
      opacity: 1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 82%', end: 'top 50%', scrub: true }
    });
  });
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

// ==========================================
// Skills：Matter.js 物理バッジ
// ==========================================
const skillsSection = $('#skills');
const stage = $('#stage');
const info = $('#skillInfo');

// ==========================================
// スキルのミニデモ（その技術の特色を、その場で動かして見せる）
// 各デモは mount(view, setCode) を持ち、後片付け用の関数を返す
// ==========================================
function h(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text != null) el.textContent = text;
  return el;
}
function miniBtn(label, onClick) {
  const b = h('button', 'mini-btn', label);
  b.type = 'button';
  b.addEventListener('click', onClick);
  return b;
}

// --- Three.js：ドラッグで回せる3D立方体（three は初回クリック時に遅延読込） ---
function mountThree(view, setCode) {
  setCode(
    "const cube = new THREE.Mesh(\n  new THREE.BoxGeometry(1, 1, 1),\n  new THREE.MeshStandardMaterial({ color: '#7cf5c4' })\n);\nscene.add(cube);\nrenderer.render(scene, camera);"
  );
  view.append(h('div', 'demo-hint', 'ドラッグで回せます'));
  let dead = false, raf = 0, dispose = null;
  import('three').then((THREE) => {
    if (dead) return;
    const w = view.clientWidth, ht = view.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, ht);
    const el = renderer.domElement;
    el.className = 'demo-canvas';
    view.prepend(el);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, w / ht, 0.1, 50);
    camera.position.z = 4.4;
    scene.add(new THREE.AmbientLight('#7fa89c', 1.4));
    const dl = new THREE.DirectionalLight('#ffffff', 2.6);
    dl.position.set(3, 4, 5);
    scene.add(dl);
    const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const mat = new THREE.MeshStandardMaterial({ color: '#7cf5c4', roughness: 0.28, metalness: 0.35 });
    const cube = new THREE.Mesh(geo, mat);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: '#0b0c10' }));
    cube.add(edges);
    cube.rotation.set(0.5, 0.7, 0);
    scene.add(cube);

    let dragging = false, lx = 0, ly = 0;
    const down = (e) => { dragging = true; lx = e.clientX; ly = e.clientY; el.setPointerCapture(e.pointerId); };
    const move = (e) => {
      if (!dragging) return;
      cube.rotation.y += (e.clientX - lx) * 0.01;
      cube.rotation.x += (e.clientY - ly) * 0.01;
      lx = e.clientX; ly = e.clientY;
    };
    const up = () => { dragging = false; };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);

    const loop = () => {
      if (!dragging) { cube.rotation.y += 0.01; cube.rotation.x += 0.003; }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();
    dispose = () => {
      geo.dispose(); mat.dispose();
      edges.geometry.dispose(); edges.material.dispose();
      renderer.dispose(); el.remove();
    };
  });
  return () => { dead = true; cancelAnimationFrame(raf); if (dispose) dispose(); };
}

// --- GSAP：イージングを切り替えて、動きの質感の違いを見る ---
function mountGsap(view, setCode) {
  const track = h('div', 'gs-track');
  const ball = h('div', 'gs-ball');
  track.append(ball);
  const row = h('div', 'mini-row');
  view.append(track, row);
  const eases = [['linear', 'none'], ['power2', 'power2.out'], ['bounce', 'bounce.out'], ['elastic', 'elastic.out(1, 0.4)']];
  const btns = eases.map(([label, ease]) => {
    const b = miniBtn(label, () => play(ease, b));
    row.append(b);
    return b;
  });
  function play(ease, btn) {
    btns.forEach((x) => x.classList.toggle('on', x === btn));
    setCode(`gsap.to(".ball", {\n  y: 120,\n  duration: 1.2,\n  ease: "${ease}"\n});`);
    const max = track.clientHeight - ball.offsetHeight - 22;
    gsap.fromTo(ball, { y: 0 }, { y: max, duration: 1.2, ease });
  }
  play('bounce.out', btns[2]);
  return () => gsap.killTweensOf(ball);
}

// --- Git：ブランチを切って、コミットして、マージする流れ ---
function mountGit(view, setCode) {
  setCode('git switch -c feature\ngit commit -m "add feature"\ngit switch main\ngit merge feature');
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 360 130');
  svg.setAttribute('class', 'git-svg');
  view.append(svg);
  const mk = (tag, attrs) => {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    svg.append(e);
    return e;
  };
  const P = { A: [30, 36], B: [95, 36], C: [160, 36], M: [300, 36], F1: [160, 96], F2: [230, 96] };
  const edge = (a, b, color) => mk('line', { x1: P[a][0], y1: P[a][1], x2: P[b][0], y2: P[b][1], stroke: color, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 });
  const node = (k, color) => mk('circle', { cx: P[k][0], cy: P[k][1], r: 9, fill: color, opacity: 0 });
  const mainC = '#7cf5c4', featC = '#ffb86b';
  const e = [edge('A', 'B', mainC), edge('B', 'C', mainC), edge('C', 'M', mainC), edge('B', 'F1', featC), edge('F1', 'F2', featC), edge('F2', 'M', featC)];
  const n = { A: node('A', mainC), B: node('B', mainC), C: node('C', mainC), M: node('M', mainC), F1: node('F1', featC), F2: node('F2', featC) };
  const t1 = mk('text', { x: 10, y: 14, fill: mainC, 'font-size': 11, 'font-family': 'monospace' }); t1.textContent = 'main';
  const t2 = mk('text', { x: 10, y: 124, fill: featC, 'font-size': 11, 'font-family': 'monospace' }); t2.textContent = 'feature';
  const row = h('div', 'mini-row');
  view.append(row);
  let tl = null;
  function play() {
    if (tl) tl.kill();
    gsap.set([...e, ...Object.values(n)], { opacity: 0 });
    gsap.set(Object.values(n), { transformOrigin: '50% 50%', scale: 0 });
    tl = gsap.timeline({ defaults: { duration: 0.35, ease: 'power2.out' } });
    const pop = (k) => tl.to(n[k], { opacity: 1, scale: 1 });
    pop('A'); tl.to(e[0], { opacity: 1 }, '<0.1'); pop('B');
    tl.to(e[3], { opacity: 1 }); pop('F1'); tl.to(e[4], { opacity: 1 }, '<0.1'); pop('F2');
    tl.to(e[1], { opacity: 1 }, '-=0.3'); pop('C');
    tl.to([e[2], e[5]], { opacity: 1 }); pop('M');
  }
  row.append(miniBtn('もう一度', play));
  play();
  return () => { if (tl) tl.kill(); };
}

// --- Node.js：APIにリクエストを送ると、JSONが返る ---
function mountNode(view, setCode) {
  setCode("app.get('/api/profile', (req, res) => {\n  res.json(profile);\n});");
  const out = h('pre', 'term-mini', '$ ボタンを押してください');
  const row = h('div', 'mini-row');
  view.append(out, row);
  let timers = [];
  const clear = () => { timers.forEach(clearTimeout); timers = []; };
  const send = () => {
    clear();
    const lines = [
      '→ GET /api/profile',
      '← 200 OK  (12ms)',
      '{',
      '  "name": "YOUR NAME",',
      '  "status": "open_to_work",',
      '  "skills": ["JavaScript", "Three.js", "Node.js"]',
      '}'
    ];
    out.textContent = '';
    lines.forEach((l, i) => timers.push(setTimeout(() => { out.textContent += (i ? '\n' : '') + l; }, 250 + i * 220)));
  };
  row.append(miniBtn('GET /api/profile を送る', send));
  return clear;
}

// --- TypeScript：型の間違いを実行前に見つける ---
function mountTs(view, setCode) {
  setCode('// 実行する前に、エディタが間違いを教えてくれる\nconst age: number = "20";');
  const code = h('div', 'ts-line');
  const msg = h('div', 'ts-msg');
  const row = h('div', 'mini-row');
  view.append(code, msg, row);
  let broken = true;
  function render() {
    code.textContent = '';
    code.append(document.createTextNode('const '));
    code.append(h('span', broken ? 'ts-err' : '', 'age'));
    code.append(document.createTextNode(': number = '));
    code.append(document.createTextNode(broken ? '"20"' : '20'));
    code.append(document.createTextNode(';'));
    msg.textContent = broken
      ? "✗ Type 'string' is not assignable to type 'number'. (ts2322)"
      : '✓ 型チェック通過：エラーはありません';
    msg.className = 'ts-msg ' + (broken ? 'bad' : 'good');
    btn.textContent = broken ? '直す' : '壊す';
    setCode(`// 実行する前に、エディタが間違いを教えてくれる\nconst age: number = ${broken ? '"20"' : '20'};`);
  }
  const btn = miniBtn('直す', () => { broken = !broken; render(); });
  row.append(btn);
  render();
  return () => {};
}

// --- HTML / CSS：スライダーで見た目が変わる ---
function mountCss(view, setCode) {
  const preview = h('div', 'css-card', 'Card');
  const controls = h('div', 'css-controls');
  view.append(preview, controls);
  const state = { r: 18, s: 24, hue: 160 };
  function apply() {
    preview.style.borderRadius = state.r + 'px';
    preview.style.boxShadow = `0 ${state.s / 2}px ${state.s}px rgba(0,0,0,.55)`;
    preview.style.background = `hsl(${state.hue} 70% 62%)`;
    setCode(`.card {\n  border-radius: ${state.r}px;\n  box-shadow: 0 ${state.s / 2}px ${state.s}px rgba(0,0,0,.55);\n  background: hsl(${state.hue} 70% 62%);\n}`);
  }
  [['角丸', 'r', 0, 60], ['影', 's', 0, 48], ['色相', 'hue', 0, 360]].forEach(([label, key, min, max]) => {
    const wrap = h('label', 'css-ctl');
    wrap.append(h('span', null, label));
    const input = document.createElement('input');
    input.type = 'range'; input.min = min; input.max = max; input.value = state[key];
    input.addEventListener('input', () => { state[key] = +input.value; apply(); });
    wrap.append(input);
    controls.append(wrap);
  });
  apply();
  return () => {};
}

// --- Vite：このサイトのビルドを実際に走らせた結果（実測値）を見せる ---
function mountVite(view, setCode) {
  setCode('$ npm run build\n# このサイトを自分のPCでビルドしたときの実測値');
  const bar = h('div', 'vite-bar');
  const fill = h('div', 'vite-fill');
  bar.append(fill);
  const out = h('pre', 'term-mini', '');
  const row = h('div', 'mini-row');
  view.append(bar, out, row);
  let timer = null;
  const run = () => {
    clearTimeout(timer);
    out.textContent = 'building for production ...';
    gsap.fromTo(fill, { width: '0%' }, { width: '100%', duration: 0.6, ease: 'power2.inOut' });
    timer = setTimeout(() => {
      out.textContent = 'dist/assets/index.js   244.21 kB │ gzip: 87.51 kB\n✓ built in 397ms';
    }, 650);
  };
  row.append(miniBtn('ビルドを実行', run));
  return () => { clearTimeout(timer); gsap.killTweensOf(fill); };
}

const DEMOS = {
  'Three.js': mountThree,
  'GSAP': mountGsap,
  'Git / GitHub': mountGit,
  'Node.js': mountNode,
  'TypeScript': mountTs,
  'HTML / CSS': mountCss,
  'Vite': mountVite
};

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
  demoCleanup = demo(view, (t) => { codeBox.textContent = t; });

  // 画面外にあるときは、デモが見える位置までスクロール
  requestAnimationFrame(() => {
    const r = info.getBoundingClientRect();
    if (r.bottom > innerHeight - 16) {
      if (lenis) lenis.scrollTo(info, { offset: -(innerHeight - r.height - 24) });
      else info.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  });
}

// 一覧ビュー（可読性用フォールバック）
const listEl = $('#skillList');
SKILLS.forEach((s) => {
  const li = document.createElement('li');
  const b = document.createElement('b'); b.textContent = s.name;
  li.append(b, document.createTextNode(s.desc));
  listEl.append(li);
});
$('#viewToggle').addEventListener('click', () => {
  const on = skillsSection.classList.toggle('list-mode');
  $('#viewToggle').textContent = on ? '落として遊ぶ' : '一覧で見る';
  ScrollTrigger.refresh();
});
if (reduceMotion) {
  skillsSection.classList.add('list-mode');
  $('#viewToggle').textContent = '落として遊ぶ';
}

let physicsStarted = false;
function startPhysics() {
  if (physicsStarted) return;
  physicsStarted = true;
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

  // マウスで掴んで投げる（タッチはスクロール優先のためここでは無効）
  const mouse = Mouse.create(stage);
  ['mousewheel', 'DOMMouseScroll', 'wheel'].forEach((ev) => stage.removeEventListener(ev, mouse.mousewheel));
  if (!finePointer) {
    stage.removeEventListener('touchmove', mouse.mousemove);
    stage.removeEventListener('touchstart', mouse.mousedown);
    stage.removeEventListener('touchend', mouse.mouseup);
  }
  const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
  Composite.add(world, mc);

  // クリック判定（ドラッグと区別）
  let down = null;
  stage.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  stage.addEventListener('pointerup', (e) => {
    if (!down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    const dt = performance.now() - down.t;
    down = null;
    if (moved > 10 || dt > 600) return;
    const r = stage.getBoundingClientRect();
    const hit = Query.point(items.map((i) => i.body), { x: e.clientX - r.left, y: e.clientY - r.top })[0];
    const item = items.find((i) => i.body === hit);
    if (item) showInfo(item.skill);
  });

  const runner = Runner.create();
  Runner.run(runner, engine);

  gsap.ticker.add(() => {
    for (const it of items) {
      // 逆さまで止まると読めないので、ごく弱く正位置へ戻す
      const a = ((it.body.angle + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      Body.setAngularVelocity(it.body, it.body.angularVelocity - a * 0.004);
      const { x, y } = it.body.position;
      it.el.style.transform = `translate(${x - it.bw / 2}px, ${y - it.bh / 2}px) rotate(${it.body.angle}rad)`;
    }
  });

  addEventListener('resize', () => {
    W = stage.clientWidth; H = stage.clientHeight;
    buildWalls();
  });
}

// 画面に入ったら物理を開始（リロード時のスクロール復元でも確実に発火させるため IntersectionObserver を使用）
const skillsObserver = new IntersectionObserver((entries) => {
  if (!entries.some((en) => en.isIntersecting)) return;
  skillsObserver.disconnect();
  if (!reduceMotion && !skillsSection.classList.contains('list-mode')) startPhysics();
}, { rootMargin: '0px 0px -25% 0px' });
skillsObserver.observe(skillsSection);
$('#viewToggle').addEventListener('click', () => {
  if (!skillsSection.classList.contains('list-mode')) startPhysics();
});

// ==========================================
// Quick Resume
// ==========================================
const resume = $('#resume');
const openResume = () => resume.classList.add('open');
const closeResume = () => resume.classList.remove('open');
$('#resumeBtn').addEventListener('click', openResume);
$('#resumeClose').addEventListener('click', closeResume);
$('#resumeOverlay').addEventListener('click', closeResume);

// ==========================================
// 紙吹雪
// ==========================================
function confetti() {
  const cv = $('#confetti');
  const ctx = cv.getContext('2d');
  cv.width = innerWidth; cv.height = innerHeight;
  const colors = ['#7cf5c4', '#ffb86b', '#ecedf0', '#6ea8ff', '#ff7ab6'];
  const ps = Array.from({ length: 160 }, () => ({
    x: innerWidth / 2, y: innerHeight * 0.7,
    vx: (Math.random() - 0.5) * 18, vy: -Math.random() * 20 - 6,
    s: Math.random() * 8 + 4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
    c: colors[(Math.random() * colors.length) | 0]
  }));
  const start = performance.now();
  (function step(now) {
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (const p of ps) {
      p.vy += 0.45; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
    }
    if (now - start < 3500) requestAnimationFrame(step);
    else ctx.clearRect(0, 0, cv.width, cv.height);
  })(start);
}

// ==========================================
// ターミナル
// ==========================================
const termOut = $('#termOut');
const termBody = $('#termBody');
const termInput = $('#termInput');
termBody.setAttribute('data-lenis-prevent', '');

function print(text, cls = 'out') {
  const d = document.createElement('div');
  d.className = cls;
  d.textContent = text;
  termOut.append(d);
  termBody.scrollTop = termBody.scrollHeight;
  return d;
}
function printLink(label, href) {
  const d = document.createElement('div');
  d.className = 'out';
  const a = document.createElement('a');
  a.href = href; a.textContent = label;
  if (href.startsWith('http')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
  d.append(a);
  termOut.append(d);
  termBody.scrollTop = termBody.scrollHeight;
}

const COMMANDS = {
  help: () => print(
    'commands:\n  about      自己紹介\n  intern     インターン経験の概要\n  skills     スキル一覧\n  works      作品一覧\n  contact    連絡先\n  clear      画面をクリア\n  ???        ひとつだけ隠しコマンドがあります'
  ),
  about: () => print(`${PROFILE.name}\n${PROFILE.role}\n\n${ROLES.all.about.join('\n')}`),
  intern: () => print(
    '長期インターン（客先常駐）／業務効率化システムの開発\n期間: 2026年5月〜（継続中）  頻度: 週2〜3日\n体制: 開発メンバー2名 + アドバイザー2名\n技術: Python + Gemini API（OCR）/ GAS（スプレッドシート連携）\n詳細は Experience に載せています。'
  ),
  whoami: () => print(`guest（${ROLES[currentRole].label}の視点で閲覧中。右上の VIEW で切替できます）`),
  skills: () => print(SKILLS.map((s) => `- ${s.name}`).join('\n')),
  works: () => print('01 このポートフォリオサイト\n   （制作過程は Works に載せています）'),
  contact: () => { print(`email : ${PROFILE.email}`); printLink(`github: ${PROFILE.github}`, PROFILE.github); },
  clear: () => { termOut.innerHTML = ''; },
  ls: () => print('about.txt  skills.json  works/  secret.sh'),
  'cat secret.sh': () => print('#!/bin/sh\n# ヒント: sudo のあとに、あなたがやりたいことを。'),
  sudo: () => print('usage: sudo <command>\n（このサイトの管理者権限で、やりたいことは何でしょう？）'),
  'sudo hire-me': () => {
    termInput.disabled = true;
    const steps = [
      ['[sudo] password for guest: ********', 'out', 500],
      ['permission granted.', 'ok', 500],
      ['hiring... [##########] 100%', 'out', 700],
      ['内定承諾ありがとうございます。（気が早い）', 'ok', 300]
    ];
    let t = 0;
    steps.forEach(([txt, cls, wait], i) => {
      t += wait;
      setTimeout(() => {
        print(txt, cls);
        if (i === steps.length - 1) {
          confetti();
          printLink(`→ 本当に連絡する: ${PROFILE.email}`, `mailto:${PROFILE.email}`);
          termInput.disabled = false;
          termInput.focus({ preventScroll: true });
        }
      }, t);
    });
  },
  'sudo rm -rf /': () => print('nice try.（このサイトは壊れません）')
};

const history = [];
let hIdx = 0;
termInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const raw = termInput.value.trim();
    termInput.value = '';
    if (!raw) return;
    history.push(raw); hIdx = history.length;
    print(`guest@portfolio:~$ ${raw}`, 'out cmd');
    const key = raw.toLowerCase().replace(/\s+/g, ' ');
    const fn = COMMANDS[key];
    if (fn) fn();
    else print(`command not found: ${raw}（help で一覧）`);
  } else if (e.key === 'ArrowUp') {
    if (hIdx > 0) { hIdx--; termInput.value = history[hIdx]; }
    e.preventDefault();
  } else if (e.key === 'ArrowDown') {
    if (hIdx < history.length) { hIdx++; termInput.value = history[hIdx] || ''; }
    e.preventDefault();
  } else if (e.key === 'Escape') {
    termInput.blur();
  }
  e.stopPropagation();
});
print('welcome. type "help" to start.', 'out ok');

// ショートカット "/" でターミナルへ / Esc でモーダルを閉じる
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeResume();
  if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
    e.preventDefault();
    scrollToTarget('#terminal');
    setTimeout(() => termInput.focus({ preventScroll: true }), 700);
  }
});

// ==========================================
// ブート演出 → ヒーロー登場
// ==========================================
const bootLog = $('#bootLog');
const bootFill = $('#bootFill');
const BOOT_LINES = [
  '> booting portfolio.sys ...',
  '> 実績数 ........ 少ない',
  '> 熱意 .......... 過剰',
  '> ready.'
];

// ==========================================
// ヒーローの名前：1文字ずつ物理で落ちる → しばらくして元に戻る
// ==========================================
const heroPhysics = (() => {
  const { Engine, Bodies, Body, Composite } = Matter;
  const hero = $('#hero');
  const title = $('#heroTitle');
  const letters = [];

  // 文字を1つずつ <span> に分割（見た目と配置は元のまま）
  $$('.hero-title .line').forEach((line, li) => {
    const text = line.dataset.text;
    line.textContent = '';
    [...text].forEach((ch, ci) => {
      const el = document.createElement('span');
      el.className = 'ch';
      el.textContent = ch;
      line.append(el);
      letters.push({ el, li, ci, body: null, home: null });
    });
  });

  let engine = null;
  let mode = 'rest'; // rest: 定位置で静止 / falling: 物理中 / returning: 戻り中
  let ready = false, pendingDrop = false, visible = true;
  let idleTimer = null, tween = null;
  let W = 0, floorY = 0;

  function measure() {
    letters.forEach((l) => { l.el.style.transform = ''; });
    const hr = hero.getBoundingClientRect();
    W = hr.width;
    floorY = 0;
    letters.forEach((l) => {
      const r = l.el.getBoundingClientRect();
      const w = r.width * 0.92, h = r.height * 0.76;
      l.home = { x: r.left - hr.left + r.width / 2, y: r.top - hr.top + r.height / 2, w, h };
      floorY = Math.max(floorY, l.home.y + h / 2);
    });
  }

  function build() {
    measure();
    engine = Engine.create();
    engine.gravity.y = 1.2;
    const t = 400;
    Composite.add(engine.world, [
      Bodies.rectangle(W / 2, floorY + t / 2, W + t * 2, t, { isStatic: true }),
      Bodies.rectangle(-t / 2, floorY - 1500, t, 3600, { isStatic: true }),
      Bodies.rectangle(W + t / 2, floorY - 1500, t, 3600, { isStatic: true })
    ]);
    letters.forEach((l) => {
      l.body = Bodies.rectangle(l.home.x, l.home.y, l.home.w, l.home.h, {
        chamfer: { radius: 6 }, restitution: 0.45, friction: 0.4, frictionAir: 0.01
      });
      Composite.add(engine.world, l.body);
      Body.setStatic(l.body, true); // 定位置で静止（解除時に質量を復元できるよう一度動的に作る）
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

  // 落下・蹴散らし
  function drop() {
    title.classList.add('on');
    if (reduceMotion) return;
    if (!ready) { pendingDrop = true; return; }
    if (tween) { tween.kill(); tween = null; }
    letters.forEach((l) => {
      const b = l.body;
      Body.setStatic(b, false);
      const startY = -220 - (1 - l.li) * 380 - l.ci * 95 - Math.random() * 60;
      const x = Math.min(Math.max(l.home.x + (Math.random() - 0.5) * 160, l.home.w / 2), W - l.home.w / 2);
      Body.setPosition(b, { x, y: startY });
      Body.setAngle(b, (Math.random() - 0.5) * 1.4);
      Body.setVelocity(b, { x: 0, y: 0 });
      Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.15);
    });
    mode = 'falling';
    resetIdle(6500);
  }

  function kick(px, py) {
    if (tween) { tween.kill(); tween = null; }
    letters.forEach((l) => {
      Body.setStatic(l.body, false);
      const dx = l.body.position.x - px, dy = l.body.position.y - py;
      const d = Math.max(Math.hypot(dx, dy), 1);
      const k = 14 * Math.max(0.3, 1 - d / 700);
      Body.setVelocity(l.body, { x: (dx / d) * k + (Math.random() - 0.5) * 4, y: (dy / d) * k - 8 - Math.random() * 6 });
      Body.setAngularVelocity(l.body, (Math.random() - 0.5) * 0.3);
    });
    mode = 'falling';
    resetIdle();
  }

  // 元の位置へ戻す（読みやすさを保つため、一定時間触られなければ自動で整列）
  function returnHome() {
    if (mode !== 'falling') return;
    mode = 'returning';
    const TAU = Math.PI * 2;
    const from = letters.map((l) => ({
      x: l.body.position.x, y: l.body.position.y,
      a: l.body.angle - Math.round(l.body.angle / TAU) * TAU
    }));
    letters.forEach((l) => Body.setStatic(l.body, true));
    const p = { t: 0 };
    tween = gsap.to(p, {
      t: 1, duration: 1.1, ease: 'power3.inOut',
      onUpdate() {
        letters.forEach((l, i) => {
          const f = from[i];
          Body.setPosition(l.body, { x: f.x + (l.home.x - f.x) * p.t, y: f.y + (l.home.y - f.y) * p.t });
          Body.setAngle(l.body, f.a * (1 - p.t));
        });
        applyTransforms();
      },
      onComplete() {
        mode = 'rest';
        tween = null;
        letters.forEach((l) => { l.el.style.transform = ''; });
      }
    });
  }

  // マウスで蹴散らす / タップで吹き飛ばす
  let last = null;
  hero.addEventListener('pointermove', (e) => {
    if (!ready || reduceMotion || e.pointerType === 'touch') return;
    const hr = hero.getBoundingClientRect();
    const px = e.clientX - hr.left, py = e.clientY - hr.top;
    const speed = last ? Math.hypot(px - last.x, py - last.y) : 0;
    last = { x: px, y: py };
    if (mode === 'falling') {
      letters.forEach((l) => {
        const dx = l.body.position.x - px, dy = l.body.position.y - py;
        const d = Math.hypot(dx, dy);
        if (d < 170 && d > 0) {
          const s = 0.8 + Math.min(speed, 30) * 0.08;
          Body.setVelocity(l.body, { x: l.body.velocity.x + (dx / d) * s, y: l.body.velocity.y + (dy / d) * s - 0.3 });
        }
      });
      resetIdle();
    } else if (speed > 2) {
      const near = letters.some((l) =>
        Math.abs(px - l.home.x) < l.home.w / 2 + 8 && Math.abs(py - l.home.y) < l.home.h / 2 + 8);
      if (near) kick(px, py);
    }
  });
  title.addEventListener('pointerdown', (e) => {
    if (!ready || reduceMotion) return;
    const hr = hero.getBoundingClientRect();
    kick(e.clientX - hr.left, e.clientY - hr.top);
  });

  gsap.ticker.add(() => {
    if (!ready || !visible || mode !== 'falling') return;
    Engine.update(engine, 1000 / 60);
    applyTransforms();
  });
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(hero);

  let resizeTimer = null;
  addEventListener('resize', () => {
    if (!ready) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (tween) { tween.kill(); tween = null; }
      clearTimeout(idleTimer);
      build();
    }, 150);
  });

  if (!reduceMotion) {
    document.fonts.ready.then(() => {
      build();
      ready = true;
      if (pendingDrop) { pendingDrop = false; drop(); }
    });
  }

  return { drop };
})();

// ==========================================
// ロール選択：閲覧者の立場に合わせて見せ方を変える
// ==========================================
const roleEl = $('#role');
let started = false;

function applyRole(key) {
  currentRole = ROLES[key] ? key : 'all';
  const r = ROLES[currentRole];
  document.body.dataset.role = currentRole;
  $('.hero-sub').textContent = r.sub;
  $$('.about-text .reveal').forEach((p, i) => { if (r.about[i]) p.textContent = r.about[i]; });
  r.order.forEach((id, i) => {
    $('#' + id).style.order = i + 1;
    const link = $(`.site-header nav a[href="#${id}"]`);
    if (link) link.style.order = i + 1;
    $(`#${id} .eyebrow`).textContent = `0${i + 1} — ${SECTION_LABELS[id]}`;
  });
  $('#contact .eyebrow').textContent = `0${r.order.length + 1} — CONTACT`;
  $('.site-header nav a[href="#contact"]').style.order = 10;
  $('#roleChip').textContent = `VIEW: ${r.label}`;
}

const roleChoose = $('#roleChoose');
let bootTl = null;
let bootDone = false;

function showChoices() {
  roleEl.classList.remove('is-loading');
  roleChoose.inert = false;
  $('.role-card', roleEl).focus({ preventScroll: true });
}

// VIEW チップから開き直すとき（ブートなし）
function openRole() {
  roleEl.classList.add('open', 'no-boot');
  roleEl.classList.remove('is-loading');
  roleEl.setAttribute('aria-hidden', 'false');
  roleChoose.inert = false;
  if (lenis) lenis.stop();
  $('.role-card', roleEl).focus({ preventScroll: true });
}

// 初回表示：短いブート（約1.4秒）の後、同じ画面にロール選択を出す
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
    if (bootTl) { bootTl.kill(); bootTl = null; }
    bootLog.textContent = BOOT_LINES.join('\n');
    bootFill.style.width = '100%';
    try { sessionStorage.setItem('portfolio-booted', '1'); } catch (e) { /* 保存できなくても動作に影響なし */ }
    showChoices();
  };

  if (fast) { finish(); return; }

  window.addEventListener('keydown', finish);
  roleEl.addEventListener('click', finish);
  bootTl = gsap.timeline({ onComplete: finish });
  bootTl.fromTo(bootFill, { width: '0%' }, { width: '100%', duration: 1.4, ease: 'power1.inOut' }, 0);
  BOOT_LINES.forEach((line, i) => {
    bootTl.call(() => { bootLog.textContent += (i ? '\n' : '') + line; }, null, i * 0.4);
  });
  bootTl.to({}, { duration: 0.1 });
}

function chooseRole(key) {
  roleEl.classList.remove('open');
  roleEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-booting');
  applyRole(key);
  if (lenis) { lenis.start(); lenis.scrollTo(0, { immediate: true }); }
  window.scrollTo(0, 0);
  if (!started) {
    started = true;
    gsap.from('.hero .eyebrow, .hero-sub, .hero-actions', { opacity: 0, y: 20, duration: 0.8, stagger: 0.1, delay: 0.6 });
    initScrollFx();
  } else {
    gsap.from('.hero-sub', { opacity: 0, y: 12, duration: 0.6 });
  }
  // 並び順が変わったので、全スクロール位置を計算し直す
  ScrollTrigger.refresh();
  heroPhysics.drop();
}

$$('[data-role]', roleEl).forEach((btn) => btn.addEventListener('click', () => chooseRole(btn.dataset.role)));
$('#roleChip').addEventListener('click', openRole);

// 起動：?role=xxx で選択を飛ばせる（開発・共有用）。同一セッションの2回目以降はブートを省略
(function start() {
  const params = new URLSearchParams(location.search);
  const q = params.get('role');
  if (q && ROLES[q]) { chooseRole(q); return; }
  let seen = false;
  try { seen = sessionStorage.getItem('portfolio-booted') === '1'; } catch (e) { /* 無視 */ }
  runBoot(reduceMotion || params.has('noboot') || seen);
})();
