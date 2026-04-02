---
title: TypeScript 모범 사례
inclusion: always
---

# TypeScript 모범 사례

## 코드 스타일
- 엄격한 TypeScript 설정 사용 (`strict: true`)
- `let`보다 `const` 선호, `var` 사용 금지
- 의미 있는 변수 및 함수 이름 사용
- 클래스와 인터페이스에는 PascalCase 사용
- 변수와 함수에는 camelCase 사용
- 상수에는 UPPER_SNAKE_CASE 사용

## 타입 안전성
- 함수의 반환 타입을 항상 정의
- `any` 대신 유니온 타입 사용
- 객체 형태에는 타입 별칭보다 인터페이스 선호
- 재사용 가능한 컴포넌트에 제네릭 타입 사용
- `noImplicitAny` 및 `strictNullChecks` 활성화

## 오류 처리
- 오류 처리에 Result/Either 패턴 사용
- 일반 Error보다 타입이 지정된 에러 throw 선호
- 옵셔널 체이닝(`?.`)과 널 병합 연산자(`??`) 사용

## 임포트/익스포트
- 기본 내보내기(default export)보다 명명된 내보내기(named export) 사용
- 임포트 그룹화: 외부 라이브러리 먼저, 그 다음 내부 모듈
- 가능한 경우 경로 매핑을 사용한 절대 임포트 사용

## 테스트
- 모든 공개 함수에 대한 단위 테스트 작성
- 설명적인 테스트 이름 사용
- 외부 의존성 모킹
- 높은 테스트 커버리지 목표 (80% 이상)
- 세션 타임아웃을 방지하기 위해 최소 출력으로 테스트 실행
- 디버깅 시 grep/필터 옵션으로 특정 테스트 실행
- 자동화 실행에는 `npm test -- --silent` 또는 `yarn test --silent` 선호
