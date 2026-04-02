// 초기화 및 게임 시작 - 에셋 프리로딩 후 게임 시작
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import { initInput } from './input.js';
import { Game } from './game.js';

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function init() {
  const canvas = document.getElementById('gameCanvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  function resize() {
    const scale = Math.min(window.innerWidth / CANVAS_WIDTH, window.innerHeight / CANVAS_HEIGHT, 2);
    canvas.style.width = (CANVAS_WIDTH * scale) + 'px';
    canvas.style.height = (CANVAS_HEIGHT * scale) + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // 에셋 프리로딩
  const pikachuImg = await loadImage('asset/pikachu.png');

  initInput();

  const game = new Game(ctx, pikachuImg);
  game.start();
}

window.addEventListener('DOMContentLoaded', init);
