// 피카츄 엔티티 - 이동, 점프, AI 로직
import {
  PIKACHU_SPEED, PIKACHU_JUMP_POWER, PIKACHU_GRAVITY,
  PIKACHU_WIDTH, PIKACHU_HEIGHT, GROUND_Y, CANVAS_WIDTH,
  NET_X, NET_WIDTH, AI_REACTION_SPEED, AI_JUMP_THRESHOLD
} from './config.js';
import { isKeyDown } from './input.js';

export class Pikachu {
  constructor(side) {
    this.side = side; // 1=P1(좌), 2=P2/AI(우)
    this.width = PIKACHU_WIDTH;
    this.height = PIKACHU_HEIGHT;
    this.isJumping = false;
    this.reset();
  }

  reset() {
    this.x = this.side === 1 ? 80 : CANVAS_WIDTH - 80;
    this.y = GROUND_Y - this.height;
    this.vx = 0;
    this.vy = 0;
    this.isJumping = false;
  }

  update(dt, ball) {
    if (this.side === 1) {
      this.handlePlayerInput();
    } else {
      this.handleAI(ball);
    }

    // 물리 업데이트
    this.vy += PIKACHU_GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // 바닥 충돌
    if (this.y + this.height >= GROUND_Y) {
      this.y = GROUND_Y - this.height;
      this.vy = 0;
      this.isJumping = false;
    }

    // 이동 영역 제한 (자기 코트 내)
    const halfNet = NET_WIDTH / 2;
    if (this.side === 1) {
      this.x = Math.max(0, Math.min(this.x, NET_X - halfNet - this.width));
    } else {
      this.x = Math.max(NET_X + halfNet, Math.min(this.x, CANVAS_WIDTH - this.width));
    }
  }

  handlePlayerInput() {
    this.vx = 0;
    if (isKeyDown('ArrowLeft')) this.vx = -PIKACHU_SPEED;
    if (isKeyDown('ArrowRight')) this.vx = PIKACHU_SPEED;
    if ((isKeyDown('ArrowUp') || isKeyDown('Space')) && !this.isJumping) {
      this.vy = PIKACHU_JUMP_POWER;
      this.isJumping = true;
    }
  }

  handleAI(ball) {
    this.vx = 0;
    if (!ball) return;

    // 공이 자기 코트에 있거나 넘어올 때 반응
    const targetX = ball.x + ball.vx * 15; // 예측 위치
    const centerX = this.x + this.width / 2;
    const diff = targetX - centerX;

    if (Math.abs(diff) > 10) {
      this.vx = diff > 0 ? AI_REACTION_SPEED : -AI_REACTION_SPEED;
    }

    // 공이 가까이 오면 점프
    const distToBall = Math.hypot(ball.x - centerX, ball.y - (this.y + this.height / 2));
    if (distToBall < AI_JUMP_THRESHOLD && ball.y < this.y && !this.isJumping) {
      this.vy = PIKACHU_JUMP_POWER;
      this.isJumping = true;
    }
  }

  // 충돌 감지용 중심점
  getCenterX() { return this.x + this.width / 2; }
  getCenterY() { return this.y + this.height / 2; }
  getCollisionRadius() { return Math.max(this.width, this.height) / 2; }
}
