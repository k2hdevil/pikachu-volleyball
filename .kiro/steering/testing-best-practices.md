---
title: 테스트 모범 사례
inclusion: always
---

# 테스트 모범 사례

## 테스트 실행
- 세션 타임아웃을 방지하기 위해 항상 최소 출력 모드로 테스트 실행
- 가능한 경우 `--silent` 또는 `--quiet` 플래그 사용
- 집중 테스트를 위해 grep/패턴 매칭으로 테스트 필터링
- 자동화 환경에서는 꼭 필요한 경우가 아니면 전체 테스트 스위트 실행 지양

## 주요 테스트 명령어
```bash
# NPM/Yarn - 무음 모드
npm test -- --silent
yarn test --silent

# Jest - 최소 출력
npm test -- --verbose=false --silent
npx jest --silent --passWithNoTests

# Pytest - 간결 모드
pytest -q
python -m pytest --tb=short -q

# Mocha - 최소 리포터
npx mocha --reporter min

# 특정 테스트 필터링
npm test -- --grep "특정 테스트"
npx jest --testNamePattern="특정 테스트"
pytest -k "test_specific"
```

## 출력 관리
- 상세 출력 대신 요약 리포터 사용
- 테스트 실패 시에만 상세 로그 캡처
- 첫 번째 실패 시 중단하려면 `--bail` 또는 `--maxfail=1` 사용
- 필요 시 상세 출력을 파일로 리다이렉트: `npm test > test-results.log 2>&1`

## 테스트 구성
- 선택적 실행이 가능하도록 관련 테스트를 그룹화
- 필터링을 위해 테스트 태그/카테고리 사용
- 테스트 이름은 설명적이되 간결하게 작성
- 단위, 통합, E2E 테스트를 분리

## 성능
- 가능한 경우 테스트를 병렬로 실행 (`--parallel`, `--maxWorkers`)
- 테스트 캐싱 메커니즘 활용
- 테스트 속도 향상을 위해 외부 의존성 모킹
- 개발 중에는 적절한 플래그로 느린 테스트 건너뛰기

## CI/CD 고려사항
- 로컬과 CI 환경에서 서로 다른 출력 수준 사용
- 테스트 산출물(커버리지, 리포트)은 콘솔 출력과 별도로 캡처
- CI 시스템과 호환되는 테스트 결과 포맷터 사용
- 대규모 테스트 스위트는 여러 작업으로 분할 고려
