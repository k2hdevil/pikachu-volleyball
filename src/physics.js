// 충돌 감지 - 원형(피카츄-공), AABB(공-네트)
import { NET_X, NET_WIDTH, NET_Y, NET_HEIGHT, GROUND_Y, NET_TOP_RADIUS, BALL_BOUNCE } from './config.js';

// 피카츄-공 원형 충돌
export function checkPikachuBallCollision(pikachu, ball) {
  const px = pikachu.getCenterX();
  const py = pikachu.getCenterY();
  const pr = pikachu.getCollisionRadius();
  const dx = ball.x - px;
  const dy = ball.y - py;
  const dist = Math.hypot(dx, dy);
  const minDist = pr + ball.radius;

  if (dist < minDist && dist > 0) {
    // 반사 벡터 계산
    const nx = dx / dist;
    const ny = dy / dist;
    const power = 6;
    ball.vx = nx * power + pikachu.vx * 0.3;
    ball.vy = ny * power - 2; // 약간 위로 띄움

    // 겹침 해소
    const overlap = minDist - dist;
    ball.x += nx * overlap;
    ball.y += ny * overlap;
  }
}

// 공-네트 충돌 (기둥 + 상단 원형)
export function checkNetBallCollision(ball) {
  const netLeft = NET_X - NET_WIDTH / 2;
  const netRight = NET_X + NET_WIDTH / 2;
  const netTop = NET_Y;

  // 네트 상단 원형 충돌
  const topCenterX = NET_X;
  const topCenterY = NET_Y;
  const dx = ball.x - topCenterX;
  const dy = ball.y - topCenterY;
  const dist = Math.hypot(dx, dy);
  const minDist = NET_TOP_RADIUS + ball.radius;

  if (dist < minDist && dist > 0) {
    const nx = dx / dist;
    const ny = dy / dist;
    ball.vx = nx * Math.abs(ball.vx) * BALL_BOUNCE + nx * 2;
    ball.vy = ny * Math.abs(ball.vy) * BALL_BOUNCE - 1;
    const overlap = minDist - dist;
    ball.x += nx * overlap;
    ball.y += ny * overlap;
    return;
  }

  // 네트 기둥 AABB 충돌
  if (ball.x + ball.radius > netLeft && ball.x - ball.radius < netRight &&
      ball.y + ball.radius > netTop && ball.y - ball.radius < GROUND_Y) {
    // 좌우 반사
    if (ball.x < NET_X) {
      ball.x = netLeft - ball.radius;
      ball.vx = -Math.abs(ball.vx) * BALL_BOUNCE;
    } else {
      ball.x = netRight + ball.radius;
      ball.vx = Math.abs(ball.vx) * BALL_BOUNCE;
    }
  }
}
