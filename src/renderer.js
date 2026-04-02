// Canvas 렌더링 - 배경, 엔티티, UI (원작 비주얼 재현)
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, COURT_LINE_Y,
  NET_X, NET_WIDTH, NET_Y, NET_HEIGHT, NET_TOP_RADIUS,
  COLORS, WIN_SCORE
} from './config.js';

export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  clear() {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  drawBackground() {
    const ctx = this.ctx;

    // 하늘 그라데이션
    const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGrad.addColorStop(0, COLORS.sky);
    skyGrad.addColorStop(1, COLORS.skyGradientBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);

    // 구름
    this.drawCloud(60, 40, 40);
    this.drawCloud(200, 25, 30);
    this.drawCloud(340, 50, 35);

    // 산
    ctx.fillStyle = COLORS.mountain;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y - 30);
    ctx.lineTo(80, GROUND_Y - 70);
    ctx.lineTo(160, GROUND_Y - 30);
    ctx.lineTo(240, GROUND_Y - 55);
    ctx.lineTo(320, GROUND_Y - 25);
    ctx.lineTo(400, GROUND_Y - 60);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y - 20);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.lineTo(0, GROUND_Y);
    ctx.fill();

    ctx.fillStyle = COLORS.mountainLight;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y - 10);
    ctx.lineTo(120, GROUND_Y - 40);
    ctx.lineTo(280, GROUND_Y - 15);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y - 30);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.lineTo(0, GROUND_Y);
    ctx.fill();

    // 코트 바닥
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // 코트 라인
    ctx.strokeStyle = COLORS.courtLine;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, COURT_LINE_Y);
    ctx.lineTo(CANVAS_WIDTH, COURT_LINE_Y);
    ctx.stroke();
  }

  drawCloud(x, y, size) {
    const ctx = this.ctx;
    ctx.fillStyle = COLORS.cloud;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.4, y - size * 0.15, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x + size * 0.8, y, size * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  drawNet() {
    const ctx = this.ctx;
    // 기둥
    ctx.fillStyle = COLORS.net;
    ctx.fillRect(NET_X - NET_WIDTH / 2, NET_Y, NET_WIDTH, NET_HEIGHT);
    // 상단 원형
    ctx.fillStyle = COLORS.netTop;
    ctx.beginPath();
    ctx.arc(NET_X, NET_Y, NET_TOP_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = COLORS.net;
    ctx.lineWidth = 2;
    ctx.stroke();
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
}
