// Quick Resume（1分で読める要約）のモーダル
import { $ } from './dom.js';

const resume = $('#resume');

export const closeResume = () => resume.classList.remove('open');

export function initResume() {
  $('#resumeBtn').addEventListener('click', () => resume.classList.add('open'));
  $('#resumeClose').addEventListener('click', closeResume);
  $('#resumeOverlay').addEventListener('click', closeResume);
}
