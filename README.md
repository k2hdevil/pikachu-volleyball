# 🏐 피카츄 배구 (Pikachu Volleyball)

HTML5 Canvas 기반 2D 피카츄 배구 게임입니다.

![screenshot](asset/screenshot.png)

## 🎮 플레이 방법

### ⌨️ 키보드 (데스크톱)

| 키 | 동작 |
|----|------|
| ← → | 이동 |
| ↑ | 점프 |
| Space | 게임 시작 / 스파이크 / 재시작 |

### 📱 터치 (모바일)

터치 기기에서 자동으로 화면 하단에 가상 버튼이 표시됩니다.

| 버튼 | 동작 |
|------|------|
| ◀ ▶ | 이동 |
| ▲ | 점프 |
| ⚡ | 스파이크 |
| 캔버스 터치 | 게임 시작 / 재시작 |

멀티터치를 지원하여 이동과 점프를 동시에 입력할 수 있습니다.

## 🚀 실행

```bash
# 로컬 서버로 실행 (ES Module 사용)
npx serve .
# 또는
python3 -m http.server 8000
```

브라우저에서 `http://localhost:8000` 접속

## 📁 프로젝트 구조

```
├── index.html          # 진입점
├── src/
│   ├── config.js       # 게임 상수 (물리, 크기, 색상)
│   ├── input.js        # 키보드 + 모바일 터치 입력 (멀티터치 지원)
│   ├── ball.js         # 공 엔티티
│   ├── pikachu.js      # 피카츄 엔티티 (P1 + AI)
│   ├── physics.js      # 충돌 감지 및 반사
│   ├── renderer.js     # Canvas 렌더링
│   ├── game.js         # 게임 상태 머신 + 루프
│   └── main.js         # 초기화
├── asset/
│   └── screenshot.png  # 레퍼런스 이미지
└── .kiro/              # AI-DLC 설정 (steering, hooks, agents, skills)
```

## ⚙️ 게임 설정 (`src/config.js`)

모든 게임 상수를 한 파일에서 관리합니다. 밸런스 조정 시 이 파일만 수정하면 됩니다.

| 카테고리 | 주요 상수 | 설명 |
|----------|-----------|------|
| 캔버스 | `CANVAS_WIDTH/HEIGHT` | 432×304 (원작 비율) |
| 물리 | `GRAVITY`, `BALL_BOUNCE`, `BALL_MAX_SPEED` | 중력, 반발 계수, 최대 속도 |
| 피카츄 | `PIKACHU_SPEED`, `PIKACHU_JUMP_POWER` | 이동 속도, 점프력 |
| AI | `AI_DIFFICULTY`, `CURRENT_AI_DIFFICULTY` | easy/normal/hard 프리셋 |
| 점수 | `WIN_SCORE` | 승리 점수 (기본 15점) |
| 색상 | `COLORS` | 원작 기반 색상 팔레트 |

AI 난이도를 변경하려면 `CURRENT_AI_DIFFICULTY` 값을 `'easy'`, `'normal'`, `'hard'` 중 하나로 설정하세요.

## 🔄 게임 상태 흐름

```
READY → ROUND_READY → PLAYING → SCORED → ROUND_READY → ... → GAME_OVER
```

| 상태 | 설명 |
|------|------|
| READY | 초기 시작 화면 (Space로 시작) |
| ROUND_READY | 라운드 시작 전 준비 화면 (~1.5초) |
| PLAYING | 게임 진행 중 |
| SCORED | 득점 후 대기 (~1초) |
| GAME_OVER | 15점 도달 시 승리 화면 (Space로 재시작) |

## 🏗️ 기술 스택

- HTML5 Canvas (순수 JavaScript, 외부 의존성 없음)
- ES Modules
- requestAnimationFrame 기반 게임 루프
- 델타 타임 프레임 독립적 물리

## 🤖 AI-DLC 개발 방식

이 프로젝트는 Kiro의 AI-DLC(AI Development Life Cycle) 방식으로 개발되었습니다:

- **Steering**: 게임 개발, TypeScript, Git, 보안 등 10개 모범 사례 규칙
- **Hooks**: 게임 에셋 검증, 로직 리뷰, 빌드 검증 등 15개 자동화 훅
- **Skill**: agent-harness (Plan→Execute→Evaluate→Evolve 프레임워크)
- **Agents**: pikachu-game 오케스트레이터 + game-planner/worker/evaluator 서브에이전트
