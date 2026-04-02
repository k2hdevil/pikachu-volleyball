// 게임 상수 설정 - 물리, 크기, 색상을 한 곳에서 관리
export const CANVAS_WIDTH = 432;
export const CANVAS_HEIGHT = 304;

// 물리 상수
export const GRAVITY = 0.5;
export const BALL_RADIUS = 12;
export const BALL_BOUNCE = 0.75;
export const BALL_INITIAL_VY = -6;
export const PIKACHU_SPEED = 4;
export const PIKACHU_JUMP_POWER = -10;
export const PIKACHU_GRAVITY = 0.5;
export const PIKACHU_WIDTH = 40;
export const PIKACHU_HEIGHT = 36;

// 네트
export const NET_X = CANVAS_WIDTH / 2;
export const NET_WIDTH = 6;
export const NET_HEIGHT = 60;
export const NET_Y = CANVAS_HEIGHT - 32 - NET_HEIGHT;
export const NET_TOP_RADIUS = 8;

// 코트
export const GROUND_Y = CANVAS_HEIGHT - 32;
export const COURT_LINE_Y = GROUND_Y;

// 점수
export const WIN_SCORE = 15;

// AI
export const AI_REACTION_SPEED = 3.2;
export const AI_JUMP_THRESHOLD = 80;

// 색상 팔레트 (원작 레퍼런스 기반)
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
