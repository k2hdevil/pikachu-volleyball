// 공 엔티티 - 물리(중력, 속도), 경계 충돌, 고속 관통 방지
import {
  BALL_RADIUS, GRAVITY, GROUND_Y, CANVAS_WIDTH,
  BALL_BOUNCE, BALL_MAX_SPEED
} from './config.js';

export class Ball {
  constructor() {
    this.radius = BALL_RADIUS;
    this.reset(1);
  }

  reset(side) {
    // side: 1=왼쪽(P1), 2=오른쪽(P2)에서 서브
    this.x = side === 1 ? 108 : CANVAS_WIDTH - 108;
    this.y = 80;
    this.vx = side === 1 ? 2 : -2;
    this.vy = -2;
    this.rotation = 0;
  }

  update(dt) {
    this.vy += GRAVITY * dt;

    // 고속 관통 방지: 속도 제한
    this.clampSpeed();

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.vx * 0.05 * dt;

    // 벽 충돌
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx = Math.abs(this.vx) * BALL_BOUNCE;
    }
    if (this.x + this.radius > CANVAS_WIDTH) {
      this.x = CANVAS_WIDTH - this.radius;
      this.vx = -Math.abs(this.vx) * BALL_BOUNCE;
    }

    // 천장 충돌
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy = Math.abs(this.vy) * BALL_BOUNCE;
    }
  }

  // 속도 벡터 크기를 최대값으로 제한
  clampSpeed() {
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > BALL_MAX_SPEED) {
      const scale = BALL_MAX_SPEED / speed;
      this.vx *= scale;
      this.vy *= scale;
    }
  }

  // 바닥에 닿았는지 확인 (점수 판정용)
  isOnGround() {
    return this.y + this.radius >= GROUND_Y;
  }

  // 어느 쪽 코트에 떨어졌는지 (1=왼쪽, 2=오른쪽)
  getLandingSide() {
    return this.x < CANVAS_WIDTH / 2 ? 1 : 2;
  }
}
