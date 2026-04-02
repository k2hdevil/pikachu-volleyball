// 초기화 및 게임 시작
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import { initInput } from './input.js';
import { Game } from './game.js';

function init() {
  const canvas = document.getElementById('gameCanvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // 반응형 크기 조정
  function resize() {
    const scale = Math.min(window.innerWidth / CANVAS_WIDTH, window.innerHeight / CANVAS_HEIGHT, 2);
    canvas.style.width = (CANVAS_WIDTH * scale) + 'px';
    canvas.style.height = (CANVAS_HEIGHT * scale) + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false; // 픽셀 아트 선명도 유지

  initInput();

  const game = new Game(ctx);
  game.start();
}

window.addEventListener('DOMContentLoaded', init);
