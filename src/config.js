/**
 * @fileoverview 피카츄 배구 게임 상수 설정
 *
 * 게임의 모든 물리, 크기, 색상 상수를 한 곳에서 관리합니다.
 * 게임 밸런스 조정 시 이 파일만 수정하면 됩니다.
 *
 * @see {@link ../README.md} 프로젝트 개요
 * @see {@link ./physics.js} 물리 상수 사용처
 * @see {@link ./pikachu.js} 피카츄 상수 사용처
 * @see {@link ./ball.js} 공 상수 사용처
 * @see {@link ./renderer.js} 색상 팔레트 사용처
 */

// ─── 캔버스 ────────────────────────────────────────────
/** @type {number} 캔버스 너비 (원작 비율 432:304) */
export const CANVAS_WIDTH = 432;
/** @type {number} 캔버스 높이 */
export const CANVAS_HEIGHT = 304;

// ─── 물리 상수 ─────────────────────────────────────────
/** @type {number} 고정 물리 timestep (60fps 기준 1프레임) */
export const PHYSICS_STEP = 1;
/** @type {number} 공에 적용되는 중력 가속도 (px/frame²) */
export const GRAVITY = 0.5;
/** @type {number} 공 반지름 (px) — 원형 충돌 감지에 사용 */
export const BALL_RADIUS = 12;
/** @type {number} 공 반발 계수 (0~1, 1이면 완전 탄성 충돌) */
export const BALL_BOUNCE = 0.75;
/** @type {number} 공 초기 수직 속도 (음수 = 위로) */
export const BALL_INITIAL_VY = -6;
/** @type {number} 공 최대 속도 — 고속 관통(tunneling) 방지 */
export const BALL_MAX_SPEED = 15;
/** @type {number} 피카츄 수평 이동 속도 (px/frame) */
export const PIKACHU_SPEED = 4;
/** @type {number} 피카츄 점프력 (음수 = 위로) */
export const PIKACHU_JUMP_POWER = -10;
/** @type {number} 피카츄에 적용되는 중력 가속도 */
export const PIKACHU_GRAVITY = 0.5;
/** @type {number} 피카츄 히트박스 너비 (px) */
export const PIKACHU_WIDTH = 40;
/** @type {number} 피카츄 히트박스 높이 (px) */
export const PIKACHU_HEIGHT = 36;

// ─── 네트 ──────────────────────────────────────────────
/** @type {number} 네트 X 좌표 (캔버스 중앙) */
export const NET_X = CANVAS_WIDTH / 2;
/** @type {number} 네트 기둥 너비 (px) */
export const NET_WIDTH = 6;
/** @type {number} 네트 높이 (px) */
export const NET_HEIGHT = 60;
/** @type {number} 네트 상단 Y 좌표 */
export const NET_Y = CANVAS_HEIGHT - 32 - NET_HEIGHT;
/** @type {number} 네트 상단 원형 장식 반지름 (px) */
export const NET_TOP_RADIUS = 8;

// ─── 코트 ──────────────────────────────────────────────
/** @type {number} 바닥(지면) Y 좌표 */
export const GROUND_Y = CANVAS_HEIGHT - 32;
/** @type {number} 코트 라인 Y 좌표 (GROUND_Y와 동일) */
export const COURT_LINE_Y = GROUND_Y;

// ─── 점수 ──────────────────────────────────────────────
/** @type {number} 승리에 필요한 점수 */
export const WIN_SCORE = 15;

// ─── AI 난이도 ─────────────────────────────────────────
/**
 * AI 난이도 프리셋
 * @property {Object} easy   - 쉬움: 느린 반응, 높은 실수 확률
 * @property {Object} normal - 보통: 균형 잡힌 난이도
 * @property {Object} hard   - 어려움: 빠른 반응, 거의 실수 없음
 *
 * 각 프리셋 속성:
 * - reactionSpeed: AI 이동 속도 (px/frame)
 * - jumpThreshold: 공이 이 높이 이내일 때 점프 (px)
 * - predictionFrames: 공 궤적 예측 프레임 수
 * - mistakeChance: 잘못된 방향으로 이동할 확률 (0~1)
 */
export const AI_DIFFICULTY = {
  easy: {
    reactionSpeed: 2.2,
    jumpThreshold: 100,
    predictionFrames: 8,
    mistakeChance: 0.15, // 15% 확률로 잘못된 방향 이동
  },
  normal: {
    reactionSpeed: 3.2,
    jumpThreshold: 80,
    predictionFrames: 15,
    mistakeChance: 0.05,
  },
  hard: {
    reactionSpeed: 4.0,
    jumpThreshold: 120,
    predictionFrames: 25,
    mistakeChance: 0.01,
  },
};

/** @type {'easy'|'normal'|'hard'} 현재 적용 중인 AI 난이도 */
export const CURRENT_AI_DIFFICULTY = 'normal';

// ─── 색상 팔레트 ───────────────────────────────────────
/**
 * 원작 레퍼런스 기반 색상 팔레트
 * renderer.js에서 배경, 엔티티, UI 렌더링에 사용
 */
export const COLORS = {
  sky: '#5B9BD5',
  skyGradientBottom: '#87CEEB',
  cloud: '#FFFFFF',
  mountain: '#4A7C59',
  mountainLight: '#6B9E6B',
  ground: '#D4A843',
  groundDark: '#B8922F',
  courtLine: '#CC3333',
  pikachu: '#FFD700',
  pikachuDark: '#DAA520',
  pikachuCheek: '#FF6B6B',
  pikachuEye: '#000000',
  pikachuEar: '#8B4513',
  ball: '#FF4444',
  ballStripe: '#FFFFFF',
  ballBlue: '#4444FF',
  net: '#8B6914',
  netTop: '#A0A0A0',
  scoreText: '#CC3333',
  uiText: '#FFFFFF',
  uiShadow: '#333333',
};
