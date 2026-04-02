// 키보드 + 모바일 터치 입력 상태 관리
const keys = {};

export function isMobile() {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || ('ontouchstart' in window);
}

export function initInput() {
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    e.preventDefault();
  });
  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  if (isMobile()) {
    initTouchControls();
  }
}

function initTouchControls() {
  const container = document.getElementById('touchControls');
  container.style.display = 'flex';

  const bind = (id, code) => {
    const btn = document.getElementById(id);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); keys[code] = true; });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[code] = false; });
    btn.addEventListener('touchcancel', (e) => { e.preventDefault(); keys[code] = false; });
  };

  bind('btnLeft', 'ArrowLeft');
  bind('btnRight', 'ArrowRight');
  bind('btnJump', 'ArrowUp');
  bind('btnSpike', 'Space');
}

export function isKeyDown(code) {
  return keys[code] === true;
}

export function resetKeys() {
  Object.keys(keys).forEach((k) => { keys[k] = false; });
}
