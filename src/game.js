// 게임 상태 머신 + requestAnimationFrame 기반 메인 루프
// 물리 업데이트는 physics.js의 고정 timestep으로 분리
//
// 상태 흐름:
//   READY → ROUND_READY → PLAYING → SCORED → ROUND_READY → ...
//   PLAYING → GAME_OVER (15점 도달 시)
//
// - READY: 초기 시작 화면 (Space로 시작)
// - ROUND_READY: 라운드 시작 전 준비 화면 (~1.5초 카운트다운)
// - PLAYING: 게임 진행 중
// - SCORED: 득점 후 잠시 대기 (~1초)
// - GAME_OVER: 승리 화면 (Space로 재시작)
import { WIN_SCORE } from './config.js';
import { isKeyDown } from './input.js';
import { Ball } from './ball.js';
import { Pikachu } from './pikachu.js';
import { updatePhysics, resetPhysicsAccumulator } from './physics.js';
import { Renderer } from './renderer.js';

const State = {
  READY: 'READY',
  ROUND_READY: 'ROUND_READY',
  PLAYING: 'PLAYING',
  SCORED: 'SCORED',
  GAME_OVER: 'GAME_OVER',
};

export class Game {
  constructor(ctx) {
    this.renderer = new Renderer(ctx);
    this.p1 = new Pikachu(1);
    this.p2 = new Pikachu(2);
    this.ball = new Ball();
    this.p1Score = 0;
    this.p2Score = 0;
    this.state = State.READY;
    this.lastScorer = 0;
    this.scoredTimer = 0;
    this.readyTimer = 0;
    this.lastTime = 0;
    this.serveSide = 1;
  }

  start() {
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  loop(timestamp) {
    const rawDt = (timestamp - this.lastTime) / 16.67; // 60fps 기준 정규화
    const dt = Math.min(rawDt, 3); // 프레임 스파이크 방지
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    switch (this.state) {
      case State.READY:
        if (isKeyDown('Space')) {
          this.enterRoundReady();
        }
        break;

      case State.ROUND_READY:
        this.readyTimer -= 1;
        if (this.readyTimer <= 0) {
          this.state = State.PLAYING;
          resetPhysicsAccumulator();
        }
        break;

      case State.PLAYING:
        // 고정 timestep 물리 업데이트 (프레임 독립적)
        updatePhysics(dt, this.ball, this.p1, this.p2);

        // 바닥 착지 → 점수
        if (this.ball.isOnGround()) {
          const side = this.ball.getLandingSide();
          if (side === 1) {
            this.p2Score++;
            this.lastScorer = 2;
            this.serveSide = 2;
          } else {
            this.p1Score++;
            this.lastScorer = 1;
            this.serveSide = 1;
          }

          if (this.p1Score >= WIN_SCORE || this.p2Score >= WIN_SCORE) {
            this.state = State.GAME_OVER;
          } else {
            this.state = State.SCORED;
            this.scoredTimer = 60; // 60프레임 (dt 정규화 기준 ~1초)
          }
        }
        break;

      case State.SCORED:
        this.scoredTimer -= dt;
        if (this.scoredTimer <= 0) {
          this.enterRoundReady();
        }
        break;

      case State.GAME_OVER:
        if (isKeyDown('Space')) {
          this.resetGame();
        }
        break;
    }
  }

  render() {
    this.renderer.clear();
    this.renderer.drawBackground();
    this.renderer.drawNet();
    this.renderer.drawPikachu(this.p1);
    this.renderer.drawPikachu(this.p2);
    this.renderer.drawBall(this.ball);
    this.renderer.drawScore(this.p1Score, this.p2Score);

    if (this.state === State.READY) {
      this.renderer.drawReadyScreen();
    } else if (this.state === State.ROUND_READY) {
      this.renderer.drawRoundReady(this.readyTimer);
    } else if (this.state === State.SCORED) {
      this.renderer.drawScoredScreen(this.lastScorer);
    } else if (this.state === State.GAME_OVER) {
      const winner = this.p1Score >= WIN_SCORE ? 1 : 2;
      this.renderer.drawGameOver(winner);
    }
  }

  resetRound(serveSide) {
    this.p1.reset();
    this.p2.reset();
    this.ball.reset(serveSide);
  }

  // "Ready" 표시 후 플레이 시작으로 전환
  enterRoundReady() {
    this.resetRound(this.serveSide);
    this.state = State.ROUND_READY;
    this.readyTimer = 90; // ~1.5초 (60fps 기준)
  }

  resetGame() {
    this.p1Score = 0;
    this.p2Score = 0;
    this.serveSide = 1;
    this.enterRoundReady();
  }
}
