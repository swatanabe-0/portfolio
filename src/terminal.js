// ターミナル（"/" キーで開く。隠しコマンドあり）
import { $ } from './dom.js';
import { PROFILE, ROLES, SKILLS } from './data.js';
import { scrollToTarget } from './scroll.js';
import { closeResume } from './resume.js';
import { getCurrentRole } from './roles.js';
import { confetti } from './confetti.js';

const termOut = $('#termOut');
const termBody = $('#termBody');
const termInput = $('#termInput');

function print(text, className = 'out') {
  const line = document.createElement('div');
  line.className = className;
  line.textContent = text;
  termOut.append(line);
  termBody.scrollTop = termBody.scrollHeight;
}

function printLink(label, href) {
  const line = document.createElement('div');
  line.className = 'out';
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  if (href.startsWith('http')) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  line.append(a);
  termOut.append(line);
  termBody.scrollTop = termBody.scrollHeight;
}

/** 隠しコマンド：採用の演出（紙吹雪）。入力中は操作を止め、終わったら戻す */
function hireMe() {
  termInput.disabled = true;
  const steps = [
    ['[sudo] password for guest: ********', 'out', 500],
    ['permission granted.', 'ok', 500],
    ['hiring... [##########] 100%', 'out', 700],
    ['内定承諾ありがとうございます。（気が早い）', 'ok', 300]
  ];
  let t = 0;
  steps.forEach(([text, className, wait], i) => {
    t += wait;
    setTimeout(() => {
      print(text, className);
      if (i === steps.length - 1) {
        confetti();
        printLink(`→ 本当に連絡する: ${PROFILE.email}`, `mailto:${PROFILE.email}`);
        termInput.disabled = false;
        termInput.focus({ preventScroll: true });
      }
    }, t);
  });
}

const COMMANDS = {
  help: () =>
    print(
      'commands:\n  about      自己紹介\n  intern     インターン経験の概要\n  skills     スキル一覧\n  works      作品一覧\n  contact    連絡先\n  clear      画面をクリア\n  ???        ひとつだけ隠しコマンドがあります'
    ),
  about: () => print(`${PROFILE.name}\n${PROFILE.role}\n\n${ROLES.all.about.join('\n')}`),
  intern: () =>
    print(
      '長期インターン（客先常駐）／業務効率化システムの開発\n期間: 2026年5月〜（継続中）  頻度: 週2〜3日\n体制: 開発メンバー2名 + アドバイザー2名\n技術: Python + Gemini API（OCR）/ GAS（スプレッドシート連携）\n詳細は Experience に載せています。'
    ),
  whoami: () => print(`guest（${ROLES[getCurrentRole()].label}の視点で閲覧中。右上の VIEW で切替できます）`),
  skills: () => print(SKILLS.map((s) => `- ${s.name}`).join('\n')),
  works: () => print('01 このポートフォリオサイト\n   （制作過程は Works に載せています）'),
  contact: () => {
    print(`email : ${PROFILE.email}`);
    printLink(`github: ${PROFILE.github}`, PROFILE.github);
  },
  clear: () => {
    termOut.innerHTML = '';
  },
  ls: () => print('about.txt  skills.json  works/  secret.sh'),
  'cat secret.sh': () => print('#!/bin/sh\n# ヒント: sudo のあとに、あなたがやりたいことを。'),
  sudo: () => print('usage: sudo <command>\n（このサイトの管理者権限で、やりたいことは何でしょう？）'),
  'sudo hire-me': hireMe,
  'sudo rm -rf /': () => print('nice try.（このサイトは壊れません）')
};

export function initTerminal() {
  termBody.setAttribute('data-lenis-prevent', '');

  const history = [];
  let historyIndex = 0;

  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const raw = termInput.value.trim();
      termInput.value = '';
      if (!raw) return;
      history.push(raw);
      historyIndex = history.length;
      print(`guest@portfolio:~$ ${raw}`, 'out cmd');
      const command = COMMANDS[raw.toLowerCase().replace(/\s+/g, ' ')];
      if (command) command();
      else print(`command not found: ${raw}（help で一覧）`);
    } else if (e.key === 'ArrowUp') {
      if (historyIndex > 0) {
        historyIndex--;
        termInput.value = history[historyIndex];
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (historyIndex < history.length) {
        historyIndex++;
        termInput.value = history[historyIndex] || '';
      }
      e.preventDefault();
    } else if (e.key === 'Escape') {
      termInput.blur();
    }
    e.stopPropagation();
  });

  print('welcome. type "help" to start.', 'out ok');

  // ショートカット："/" でターミナルへ、Esc でモーダルを閉じる
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeResume();
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      scrollToTarget('#terminal');
      setTimeout(() => termInput.focus({ preventScroll: true }), 700);
    }
  });
}
