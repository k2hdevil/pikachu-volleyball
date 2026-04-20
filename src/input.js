/**
 * 키보드 + 모바일 터치 입력 상태 관리 (멀티터치 지원)
 *
 * 키보드: keydown/keyup 이벤트로 키 상태 추적
 * 터치: Touch ID별 바인딩을 Map으로 관리하여 동시 입력(이동+점프 등) 지원
 *
 * @module input
 * @see {@link https://developer.mozilla.org/ko/docs/Web/API/Touch_events 터치 이벤트 MDN 문서}
 */
const keys = {};
/** @type {Map<number, string>} 터치 ID → 키코드 매핑 (멀티터치 동시 입력 지원) */
const activeTouches = new Map();

/**
 * 현재 기기가 모바일/터치 기기인지 판별
 * @returns {boolean} 터치 지원 여부
 */
export function isMobile() {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}

/**
 * 입력 시스템 초기화 — 키보드 리스너 등록 및 모바일 터치 컨트롤 활성화
 * 게임 시작 시 한 번 호출
 */
export function initInput() {
  // 키보드 입력
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    e.preventDefault();
  });
  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  // 터치 기기 감지 시 터치 컨트롤 활성화
  if (isMobile()) {
    initTouchControls();
  }
}

/**
 * 터치 컨트롤 UI 초기화 (내부 함수)
 * - touchControls 컨테이너를 표시하고 각 버튼에 멀티터치 이벤트 바인딩
 * - 캔버스 터치로 게임 시작/재시작 (Space 키 대체)
 */
function initTouchControls() {
  const container = document.getElementById('touchControls');
  if (!container) return;
  container.style.display = 'flex';

  // 캔버스 터치로 게임 시작/재시작 (Space 키 대체)
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      keys['Space'] = true;
    });
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      keys['Space'] = false;
    });
  }

  // 멀티터치 지원: 각 버튼에 터치 ID를 추적하여 동시 입력 가능
  bindTouchButton('btnLeft', 'ArrowLeft');
  bindTouchButton('btnRight', 'ArrowRight');
  bindTouchButton('btnJump', 'ArrowUp');
  bindTouchButton('btnSpike', 'Space');
}

/**
 * 터치 버튼에 멀티터치 이벤트를 바인딩
 * Touch ID를 activeTouches Map에 추적하여, 한 손가락을 떼도
 * 같은 키코드의 다른 터치가 활성 상태이면 키를 유지
 * @param {string} elementId - 터치 버튼 DOM 요소 ID (예: 'btnLeft')
 * @param {string} keyCode - 매핑할 키코드 (예: 'ArrowLeft')
 */
function bindTouchButton(elementId, keyCode) {
  const btn = document.getElementById(elementId);
  if (!btn) return;

  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    // 각 터치 포인트를 개별 추적
    for (const touch of e.changedTouches) {
      activeTouches.set(touch.identifier, keyCode);
    }
    keys[keyCode] = true;
  });

  btn.addEventListener('touchend', (e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      activeTouches.delete(touch.identifier);
    }
    // 같은 키코드를 가진 다른 터치가 아직 활성 상태인지 확인
    let stillActive = false;
    for (const code of activeTouches.values()) {
      if (code === keyCode) { stillActive = true; break; }
    }
    if (!stillActive) {
      keys[keyCode] = false;
    }
  });

  btn.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      activeTouches.delete(touch.identifier);
    }
    let stillActive = false;
    for (const code of activeTouches.values()) {
      if (code === keyCode) { stillActive = true; break; }
    }
    if (!stillActive) {
      keys[keyCode] = false;
    }
  });
}

/**
 * 특정 키가 현재 눌려있는지 확인
 * @param {string} code - 확인할 키코드 (예: 'ArrowLeft', 'Space')
 * @returns {boolean} 키 눌림 여부
 */
export function isKeyDown(code) {
  return keys[code] === true;
}

/**
 * 모든 키 상태 및 활성 터치를 초기화
 * 라운드 전환, 게임 오버 등 상태 리셋 시 호출
 */
export function resetKeys() {
  Object.keys(keys).forEach((k) => { keys[k] = false; });
  activeTouches.clear();
}
