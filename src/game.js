// 게임 상태 머신 + requestAnimationFrame 기반 메인 루프
import { WIN_SCORE } from './config.js';
import { isKeyDown } from './input.js';
import { Ball } from './ball.js';
import { Pikachu } from './pikachu.js';
import { checkPikachuBallCollision, checkNetBallCollision } from './physics.js';
import { Renderer } from './renderer.js';

const State = { READY: 'READY', PLAYING: 'PLAYING', SCORED: 'SCORED', GAME_OVER: 'GAME_OVER' };

export class Game {
  constructor(ctx, pikachuImg) {
    this.renderer = new Renderer(ctx, pikachuImg);
    this.p1 = new Pikachu(1);
    this.p2 = new Pikachu(2);
    this.ball = new Ball();
    this.p1Score = 0;
    this.p2Score = 0;
    this.state = State.READY;
    this.lastScorer = 0;
    this.scoredTimer = 0;
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
          this.state = State.PLAYING;
          this.resetRound(this.serveSide);
        }
        break;

      case State.PLAYING:
        this.p1.update(dt, this.ball);
        this.p2.update(dt, this.ball);
        this.ball.update(dt);

        // 충돌 처리
        checkPikachuBallCollision(this.p1, this.ball);
        checkPikachuBallCollision(this.p2, this.ball);
        checkNetBallCollision(this.ball);

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
            this.scoredTimer = 60; // ~1초
          }
        }
        break;

      case State.SCORED:
        this.scoredTimer -= 1;
        if (this.scoredTimer <= 0) {
          this.state = State.PLAYING;
          this.resetRound(this.serveSide);
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

  resetGame() {
    this.p1Score = 0;
    this.p2Score = 0;
    this.serveSide = 1;
    this.state = State.PLAYING;
    this.resetRound(1);
  }
}
