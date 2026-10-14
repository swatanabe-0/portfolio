// 共通の小さな道具（DOM 取得、環境判定、要素の生成）

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(pointer: fine)').matches;

/** 要素を作る（text は textContent として入れるので、HTML として解釈されない） */
export function h(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text != null) el.textContent = text;
  return el;
}

/** ミニデモ用の小さなボタン */
export function miniBtn(label, onClick) {
  const b = h('button', 'mini-btn', label);
  b.type = 'button';
  b.addEventListener('click', onClick);
  return b;
}
