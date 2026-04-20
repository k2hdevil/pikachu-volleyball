// Canvas 렌더링 - 배경(오프스크린 캐시), 엔티티, UI (원작 비주얼 재현)
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, COURT_LINE_Y,
  NET_X, NET_WIDTH, NET_Y, NET_HEIGHT, NET_TOP_RADIUS,
  COLORS, WIN_SCORE
} from './config.js';

export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
    // 오프스크린 캔버스: 정적 배경을 한 번만 그리고 캐시
    this.bgCanvas = null;
    this.bgReady = false;
    this.initBackgroundCache();
  }

  // 정적 배경을 오프스크린 캔버스에 미리 렌더링
  initBackgroundCache() {
    this.bgCanvas = document.createElement('canvas');
    this.bgCanvas.width = CANVAS_WIDTH;
    this.bgCanvas.height = CANVAS_HEIGHT;
    const bgCtx = this.bgCanvas.getContext('2d');

    // 하늘 그라데이션
    const skyGrad = bgCtx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGrad.addColorStop(0, COLORS.sky);
    skyGrad.addColorStop(1, COLORS.skyGradientBottom);
    bgCtx.fillStyle = skyGrad;
    bgCtx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);

    // 구름
    this.drawCloudTo(bgCtx, 60, 40, 40);
    this.drawCloudTo(bgCtx, 200, 25, 30);
    this.drawCloudTo(bgCtx, 340, 50, 35);

    // 산
    bgCtx.fillStyle = COLORS.mountain;
    bgCtx.beginPath();
    bgCtx.moveTo(0, GROUND_Y - 30);
    bgCtx.lineTo(80, GROUND_Y - 70);
    bgCtx.lineTo(160, GROUND_Y - 30);
    bgCtx.lineTo(240, GROUND_Y - 55);
    bgCtx.lineTo(320, GROUND_Y - 25);
    bgCtx.lineTo(400, GROUND_Y - 60);
    bgCtx.lineTo(CANVAS_WIDTH, GROUND_Y - 20);
    bgCtx.lineTo(CANVAS_WIDTH, GROUND_Y);
    bgCtx.lineTo(0, GROUND_Y);
    bgCtx.fill();

    bgCtx.fillStyle = COLORS.mountainLight;
    bgCtx.beginPath();
    bgCtx.moveTo(0, GROUND_Y - 10);
    bgCtx.lineTo(120, GROUND_Y - 40);
    bgCtx.lineTo(280, GROUND_Y - 15);
    bgCtx.lineTo(CANVAS_WIDTH, GROUND_Y - 30);
    bgCtx.lineTo(CANVAS_WIDTH, GROUND_Y);
    bgCtx.lineTo(0, GROUND_Y);
    bgCtx.fill();

    // 코트 바닥
    bgCtx.fillStyle = COLORS.ground;
    bgCtx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // 코트 라인
    bgCtx.strokeStyle = COLORS.courtLine;
    bgCtx.lineWidth = 3;
    bgCtx.beginPath();
    bgCtx.moveTo(0, COURT_LINE_Y);
    bgCtx.lineTo(CANVAS_WIDTH, COURT_LINE_Y);
    bgCtx.stroke();

    // 네트 (정적이므로 배경에 포함)
    bgCtx.fillStyle = COLORS.net;
    bgCtx.fillRect(NET_X - NET_WIDTH / 2, NET_Y, NET_WIDTH, NET_HEIGHT);
    bgCtx.fillStyle = COLORS.netTop;
    bgCtx.beginPath();
    bgCtx.arc(NET_X, NET_Y, NET_TOP_RADIUS, 0, Math.PI * 2);
    bgCtx.fill();
    bgCtx.strokeStyle = COLORS.net;
    bgCtx.lineWidth = 2;
    bgCtx.stroke();

    this.bgReady = true;
  }

  drawCloudTo(ctx, x, y, size) {
    ctx.fillStyle = COLORS.cloud;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.4, y - size * 0.15, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x + size * 0.8, y, size * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  clear() {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // 캐시된 배경을 한 번에 복사 (매 프레임 재계산 불필요)
  drawBackground() {
    if (this.bgReady) {
      this.ctx.drawImage(this.bgCanvas, 0, 0);
    }
  }

  // 네트는 배경 캐시에 포함되므로 별도 호출 불필요
  // 하위 호환성을 위해 빈 메서드 유지
  drawNet() {
    // 네트는 initBackgroundCache()에서 배경과 함께 캐시됨
  }

  drawPikachu(pikachu) {
    const ctx = this.ctx;
    const cx = pikachu.getCenterX();
    const cy = pikachu.getCenterY();
    const w = pikachu.width;
    const h = pikachu.height;
    const facingRight = pikachu.side === 1;

    // 몸통
    ctx.fillStyle = COLORS.pikachu;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.pikachuDark;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 귀
    const earDir = facingRight ? 1 : -1;
    ctx.fillStyle = COLORS.pikachu;
    ctx.beginPath();
    ctx.moveTo(cx - 6 * earDir, cy - h / 2 + 4);
    ctx.lineTo(cx - 14 * earDir, cy - h / 2 - 14);
    ctx.lineTo(cx + 2 * earDir, cy - h / 2 + 2);
    ctx.fill();
    ctx.fillStyle = COLORS.pikachuEar;
    ctx.beginPath();
    ctx.moveTo(cx - 10 * earDir, cy - h / 2 - 10);
    ctx.lineTo(cx - 14 * earDir, cy - h / 2 - 14);
    ctx.lineTo(cx - 6 * earDir, cy - h / 2 - 4);
    ctx.fill();

    ctx.fillStyle = COLORS.pikachu;
    ctx.beginPath();
    ctx.moveTo(cx + 6 * earDir, cy - h / 2 + 4);
    ctx.lineTo(cx + 16 * earDir, cy - h / 2 - 12);
    ctx.lineTo(cx + 12 * earDir, cy - h / 2 + 4);
    ctx.fill();
    ctx.fillStyle = COLORS.pikachuEar;
    ctx.beginPath();
    ctx.moveTo(cx + 12 * earDir, cy - h / 2 - 8);
    ctx.lineTo(cx + 16 * earDir, cy - h / 2 - 12);
    ctx.lineTo(cx + 10 * earDir, cy - h / 2 - 2);
    ctx.fill();

    // 눈
    const eyeOffsetX = facingRight ? 6 : -6;
    ctx.fillStyle = COLORS.pikachuEye;
    ctx.beginPath();
    ctx.arc(cx + eyeOffsetX, cy - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    // 눈 하이라이트
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx + eyeOffsetX + 1, cy - 3, 1, 0, Math.PI * 2);
    ctx.fill();

    // 볼
    ctx.fillStyle = COLORS.pikachuCheek;
    ctx.beginPath();
    ctx.arc(cx + (facingRight ? 12 : -12), cy + 4, 5, 0, Math.PI * 2);
    ctx.fill();

    // 꼬리 (번개 모양)
    const tailDir = facingRight ? -1 : 1;
    ctx.fillStyle = COLORS.pikachu;
    ctx.strokeStyle = COLORS.pikachuDark;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + tailDir * 18, cy);
    ctx.lineTo(cx + tailDir * 24, cy - 10);
    ctx.lineTo(cx + tailDir * 20, cy - 4);
    ctx.lineTo(cx + tailDir * 28, cy - 16);
    ctx.lineTo(cx + tailDir * 22, cy - 6);
    ctx.lineTo(cx + tailDir * 26, cy - 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawBall(ball) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(ball.rotation);

    // 공 본체 (빨간색 반 + 흰색 반)
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, 0, Math.PI);
    ctx.fillStyle = COLORS.ball;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, Math.PI, Math.PI * 2);
    ctx.fillStyle = COLORS.ballStripe;
    ctx.fill();

    // 중앙 라인
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-ball.radius, 0);
    ctx.lineTo(ball.radius, 0);
    ctx.stroke();

    // 중앙 원
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.ballStripe;
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 외곽선
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  drawScore(p1Score, p2Score) {
    const ctx = this.ctx;
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';

    // 그림자
    ctx.fillStyle = COLORS.uiShadow;
    ctx.fillText(p1Score, 82, 34);
    ctx.fillText(p2Score, CANVAS_WIDTH - 78, 34);

    // 점수
    ctx.fillStyle = COLORS.scoreText;
    ctx.fillText(p1Score, 80, 32);
    ctx.fillText(p2Score, CANVAS_WIDTH - 80, 32);
  }

  drawReadyScreen() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.pikachu;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeText('PIKACHU VOLLEYBALL', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
    ctx.fillText('PIKACHU VOLLEYBALL', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

    ctx.font = '16px monospace';
    ctx.fillStyle = COLORS.uiText;
    ctx.fillText('Press SPACE to Start', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    ctx.fillText('← → Move  |  ↑ Jump  |  SPACE Spike', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 45);
  }

  drawGameOver(winner) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.pikachu;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    const text = winner === 1 ? 'YOU WIN!' : 'YOU LOSE...';
    ctx.strokeText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
    ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);

    ctx.font = '16px monospace';
    ctx.fillStyle = COLORS.uiText;
    ctx.fillText('Press SPACE to Restart', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25);
  }

  drawScoredScreen(scorer) {
    const ctx = this.ctx;
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.pikachu;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    const text = scorer === 1 ? 'Player 1 Scores!' : 'Player 2 Scores!';
    ctx.strokeText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  }

  // 라운드 시작 전 "Ready" 표시 (페이드 효과)
  drawRoundReady(timer) {
    const ctx = this.ctx;
    // 타이머 기반 투명도 (등장 시 선명 → 사라질 때 페이드)
    const alpha = Math.min(timer / 30, 1.0);

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.pikachu;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.strokeText('Ready', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.fillText('Ready', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

    ctx.restore();
  }
}
