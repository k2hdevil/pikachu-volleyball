// 키보드 입력 상태 관리 - keydown/keyup으로 상태 객체 관리
const keys = {};

export function initInput() {
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    e.preventDefault();
  });
  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });
}

export function isKeyDown(code) {
  return keys[code] === true;
}

export function resetKeys() {
  Object.keys(keys).forEach((k) => { keys[k] = false; });
}
