// スキルのミニデモ（その技術の特色を、その場で動かして見せる）
//
// 各デモは mount(view, setCode) を持ち、後片付け用の関数を返す。
//   view    : デモを描画する要素
//   setCode : 右側のコード表示を更新する関数
//
// このファイルは、Skills の画面に入ったときに初めて読み込まれる（初期表示を軽くするため）。
// Three.js は、さらに「Three.js のバッジを開いたとき」に初めて読み込まれる。
import gsap from 'gsap';
import { h, miniBtn } from './dom.js';

// --- Three.js：ドラッグで回せる3D立方体 ---
function mountThree(view, setCode) {
  setCode(
    "const cube = new THREE.Mesh(\n  new THREE.BoxGeometry(1, 1, 1),\n  new THREE.MeshStandardMaterial({ color: '#7cf5c4' })\n);\nscene.add(cube);\nrenderer.render(scene, camera);"
  );
  view.append(h('div', 'demo-hint', 'ドラッグで回せます'));

  let dead = false;
  let raf = 0;
  let dispose = null;

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
    const light = new THREE.DirectionalLight('#ffffff', 2.6);
    light.position.set(3, 4, 5);
    scene.add(light);

    const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const mat = new THREE.MeshStandardMaterial({ color: '#7cf5c4', roughness: 0.28, metalness: 0.35 });
    const cube = new THREE.Mesh(geo, mat);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: '#0b0c10' }));
    cube.add(edges);
    cube.rotation.set(0.5, 0.7, 0);
    scene.add(cube);

    let dragging = false, lastX = 0, lastY = 0;
    const down = (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; el.setPointerCapture(e.pointerId); };
    const move = (e) => {
      if (!dragging) return;
      cube.rotation.y += (e.clientX - lastX) * 0.01;
      cube.rotation.x += (e.clientY - lastY) * 0.01;
      lastX = e.clientX; lastY = e.clientY;
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

  return () => {
    dead = true;
    cancelAnimationFrame(raf);
    if (dispose) dispose();
  };
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

  const make = (tag, attrs) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    svg.append(el);
    return el;
  };

  const P = { A: [30, 36], B: [95, 36], C: [160, 36], M: [300, 36], F1: [160, 96], F2: [230, 96] };
  const mainColor = '#7cf5c4', featureColor = '#ffb86b';
  const edge = (a, b, color) => make('line', {
    x1: P[a][0], y1: P[a][1], x2: P[b][0], y2: P[b][1],
    stroke: color, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0
  });
  const node = (k, color) => make('circle', { cx: P[k][0], cy: P[k][1], r: 9, fill: color, opacity: 0 });

  const edges = [
    edge('A', 'B', mainColor), edge('B', 'C', mainColor), edge('C', 'M', mainColor),
    edge('B', 'F1', featureColor), edge('F1', 'F2', featureColor), edge('F2', 'M', featureColor)
  ];
  const nodes = {
    A: node('A', mainColor), B: node('B', mainColor), C: node('C', mainColor), M: node('M', mainColor),
    F1: node('F1', featureColor), F2: node('F2', featureColor)
  };
  make('text', { x: 10, y: 14, fill: mainColor, 'font-size': 11, 'font-family': 'monospace' }).textContent = 'main';
  make('text', { x: 10, y: 124, fill: featureColor, 'font-size': 11, 'font-family': 'monospace' }).textContent = 'feature';

  const row = h('div', 'mini-row');
  view.append(row);

  let tl = null;
  function play() {
    if (tl) tl.kill();
    gsap.set([...edges, ...Object.values(nodes)], { opacity: 0 });
    gsap.set(Object.values(nodes), { transformOrigin: '50% 50%', scale: 0 });
    tl = gsap.timeline({ defaults: { duration: 0.35, ease: 'power2.out' } });
    const pop = (k) => tl.to(nodes[k], { opacity: 1, scale: 1 });
    pop('A'); tl.to(edges[0], { opacity: 1 }, '<0.1'); pop('B');
    tl.to(edges[3], { opacity: 1 }); pop('F1'); tl.to(edges[4], { opacity: 1 }, '<0.1'); pop('F2');
    tl.to(edges[1], { opacity: 1 }, '-=0.3'); pop('C');
    tl.to([edges[2], edges[5]], { opacity: 1 }); pop('M');
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
    lines.forEach((line, i) => timers.push(setTimeout(() => { out.textContent += (i ? '\n' : '') + line; }, 250 + i * 220)));
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
  const btn = miniBtn('直す', () => { broken = !broken; render(); });
  row.append(btn);

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
    input.type = 'range';
    input.min = min;
    input.max = max;
    input.value = state[key];
    input.addEventListener('input', () => { state[key] = +input.value; apply(); });
    wrap.append(input);
    controls.append(wrap);
  });
  apply();

  return () => {};
}

// --- Vite：このサイトのビルドを実際に走らせた結果（ある時点の実測値）を見せる ---
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

/** スキル名 → デモ。ここに無いスキルは、説明文だけを表示する */
export const DEMOS = {
  'Three.js': mountThree,
  'GSAP': mountGsap,
  'Git / GitHub': mountGit,
  'Node.js': mountNode,
  'TypeScript': mountTs,
  'HTML / CSS': mountCss,
  'Vite': mountVite
};
