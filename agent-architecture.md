# 피카츄 배구 - AI Agent 하네스 아키텍처

## 에이전트 역할 구조

```mermaid
graph TB
    subgraph Orchestrator["🎮 pikachu-game (오케스트레이터)"]
        O_DESC["역할: 태스크 조율 전용<br/>도구: fs_read, fs_write, fs_list, subagent<br/>⛔ shell 없음, API 없음, 코드 작성 금지"]
    end

    subgraph Planner["📋 game-planner (설계자)"]
        P_DESC["역할: 기능 설계 + 구현 계획 수립<br/>도구: fs_read, fs_write, fs_list, Context7 MCP<br/>📖 기존 src/ 코드 읽기 필수<br/>📝 출력: plan.md"]
    end

    subgraph Worker["⚡ game-worker (구현자)"]
        W_DESC["역할: 코드 작성 + 게임 로직 구현<br/>도구: fs_read, fs_write, fs_list, shell<br/>🔧 shell: node, npx, npm만 허용<br/>📝 출력: work/ 디렉토리"]
    end

    subgraph Evaluator["🔍 game-evaluator (평가자)"]
        E_DESC["역할: 루브릭 기반 채점 + PASS/FAIL 판정<br/>도구: fs_read, fs_write, fs_list, shell (읽기전용)<br/>🧪 node --check, eslint로 객관적 검증<br/>📝 출력: eval.md"]
    end

    Orchestrator -->|"1. goal.md 작성"| Planner
    Planner -->|"2. plan.md 반환"| Orchestrator
    Orchestrator -->|"3. plan.md 전달"| Worker
    Worker -->|"4. work/ 산출물 반환"| Orchestrator
    Orchestrator -->|"5. goal.md + work/ 전달"| Evaluator
    Evaluator -->|"6. eval.md 반환"| Orchestrator
```

## 태스크 실행 루프

```mermaid
flowchart TD
    START([사용자 요청]) --> INIT["오케스트레이터<br/>태스크 디렉토리 생성<br/>goal.md 작성"]
    INIT --> CONTEXT["cross-agent context 복사<br/>evolution/lessons.md 읽기"]
    CONTEXT --> PLAN["🔵 game-planner 호출<br/>goal.md + context/ + src/ 읽기<br/>→ plan.md 작성"]
    PLAN --> VERIFY_PLAN{plan.md<br/>존재?}
    VERIFY_PLAN -->|No| PLAN
    VERIFY_PLAN -->|Yes| EXECUTE["🟢 game-worker 호출<br/>plan.md + context/ + src/ 읽기<br/>→ work/ 에 코드 작성"]
    EXECUTE --> VERIFY_WORK{work/ 산출물<br/>존재?}
    VERIFY_WORK -->|No| EXECUTE
    VERIFY_WORK -->|Yes| EVALUATE["🔴 game-evaluator 호출<br/>goal.md 루브릭 추출<br/>node --check 정적 검증<br/>차원별 1-10점 채점<br/>→ eval.md 작성"]
    EVALUATE --> ARCHIVE["📦 아카이브<br/>history/round-N/ 에 복사<br/>changelog.md 작성<br/>iterations.json 업데이트"]
    ARCHIVE --> CHECK{eval.md<br/>판정?}
    CHECK -->|"PASS ✅"| EVOLVE["🧬 진화<br/>experience-log.json 추가<br/>lessons.md 갱신"]
    CHECK -->|"FAIL ❌<br/>반복 < max"| FEEDBACK["eval 피드백을<br/>context/prev-eval.md 복사"]
    FEEDBACK --> PLAN
    CHECK -->|"FAIL ❌<br/>반복 = max"| EVOLVE
    EVOLVE --> DONE([사용자에게 결과 전달])
```

## 권한 분리 매트릭스

```mermaid
graph LR
    subgraph 도구접근["도구 접근 권한"]
        direction TB
        T1["fs_read"] --- T2["fs_write"] --- T3["fs_list"] --- T4["shell"] --- T5["subagent"] --- T6["Context7 MCP"]
    end

    subgraph 에이전트별["에이전트별 권한"]
        direction TB
        A1["pikachu-game<br/>✅ read ✅ write ✅ list<br/>⛔ shell ✅ subagent ⛔ MCP"]
        A2["game-planner<br/>✅ read ✅ write ✅ list<br/>⛔ shell ⛔ subagent ✅ MCP"]
        A3["game-worker<br/>✅ read ✅ write ✅ list<br/>✅ shell ⛔ subagent ⛔ MCP"]
        A4["game-evaluator<br/>✅ read ✅ write ✅ list<br/>✅ shell(읽기전용) ⛔ subagent ⛔ MCP"]
    end
```

## 데이터 흐름

```mermaid
graph LR
    subgraph TaskDir["태스크 디렉토리"]
        GOAL["goal.md<br/>(오케스트레이터 작성)"]
        PLAN_F["plan.md<br/>(planner 작성)"]
        WORK["work/<br/>(worker 작성)"]
        EVAL_F["eval.md<br/>(evaluator 작성)"]
        CTX["context/<br/>(오케스트레이터 관리)"]
        HIST["history/<br/>(오케스트레이터 아카이브)"]
        ITER["iterations.json<br/>(오케스트레이터 업데이트)"]
    end

    subgraph Evolution["진화 데이터"]
        EXP["experience-log.json<br/>(실행 이력)"]
        LESS["lessons.md<br/>(누적 교훈)"]
    end

    subgraph Project["프로젝트 소스"]
        SRC["src/*.js<br/>(읽기 전용 참조)"]
        HTML["index.html<br/>(읽기 전용 참조)"]
    end

    GOAL --> PLAN_F
    PLAN_F --> WORK
    WORK --> EVAL_F
    EVAL_F -->|FAIL| CTX
    CTX --> PLAN_F
    EVAL_F --> HIST
    LESS --> PLAN_F
    SRC --> PLAN_F
    SRC --> WORK
    SRC --> EVAL_F
```

## 배포 아키텍처 (AWS Amplify Hosting)

```mermaid
flowchart LR
    subgraph Dev["🛠️ 개발 환경"]
        KIRO["Kiro IDE<br/>AI Agent 하네스"]
        LOCAL["로컬 소스<br/>src/*.js + index.html"]
    end

    subgraph GitHub["🐙 GitHub"]
        REPO["k2hdevil/pikachu-volleyball<br/>main 브랜치"]
    end

    subgraph AWS["☁️ AWS"]
        subgraph Amplify["AWS Amplify Hosting"]
            BUILD["자동 빌드<br/>main push 트리거"]
            CDN["Amazon CloudFront<br/>글로벌 CDN"]
        end
    end

    subgraph Users["👥 사용자"]
        DESKTOP["🖥️ 데스크톱<br/>키보드 조작"]
        MOBILE["📱 모바일<br/>터치 조작"]
    end

    KIRO -->|"코드 작성"| LOCAL
    LOCAL -->|"git push"| REPO
    REPO -->|"webhook 트리거"| BUILD
    BUILD -->|"정적 파일 배포"| CDN
    CDN -->|"HTTPS"| DESKTOP
    CDN -->|"HTTPS"| MOBILE
```

**배포 정보:**
- 배포 URL: https://main.d3tu61r30359g3.amplifyapp.com/
- 소스: GitHub `k2hdevil/pikachu-volleyball` → `main` 브랜치
- 빌드 설정: Amplify 콘솔에서 구성
- 배포 방식: 정적 호스팅 (HTML + JS, 서버리스 백엔드 없음)
- CDN: CloudFront 자동 제공 (HTTPS, 글로벌 엣지 캐싱)
- 배포 트리거: `main` 브랜치에 push 시 자동 빌드 및 배포

## 전체 워크플로우 (개발 → 배포)

```mermaid
flowchart TD
    REQ([사용자 기능 요청]) --> HARNESS["AI Agent 하네스<br/>plan → execute → evaluate 루프"]
    HARNESS --> CODE["코드 변경<br/>src/*.js, index.html"]
    CODE --> COMMIT["git commit<br/>컨벤셔널 커밋"]
    COMMIT --> PUSH["git push origin main"]
    PUSH --> AMPLIFY["Amplify 자동 빌드/배포"]
    AMPLIFY --> LIVE["🌐 라이브 배포<br/>main.d3tu61r30359g3.amplifyapp.com"]
    LIVE --> FEEDBACK([사용자 피드백])
    FEEDBACK --> REQ
```

## 핵심 설계 원칙

| 원칙 | 설명 |
|------|------|
| 최소 권한 | 각 에이전트는 역할에 필요한 도구만 보유. 오케스트레이터는 shell/MCP 없음 |
| 관심사 분리 | 설계(planner) → 구현(worker) → 평가(evaluator) 완전 분리 |
| 객관적 검증 | evaluator가 node --check, eslint로 주관적 채점 전 객관적 검증 수행 |
| 반복 개선 | FAIL 시 eval 피드백을 context에 복사하여 다음 라운드에서 개선 |
| 진화 학습 | 매 태스크 완료 후 experience-log와 lessons.md에 교훈 누적 |
| 아카이브 의무화 | PASS/FAIL 무관하게 모든 라운드를 history/에 보존 |
| 회귀 방지 | evaluator가 전체 history/를 스캔하여 이전 수정사항의 회귀를 감지 |
