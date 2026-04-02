---
title: React 모범 사례
inclusion: fileMatch
fileMatchPattern: '*.tsx,*.jsx,*react*'
---

# React 모범 사례

## 컴포넌트 구조
- 훅(Hooks)을 사용한 함수형 컴포넌트 사용
- 컴포넌트를 작고 집중적으로 유지 (단일 책임 원칙)
- 모든 React 컴포넌트에 TypeScript 사용
- 기본 내보내기(default export)보다 명명된 내보내기(named export) 선호

## 훅(Hooks)
- 로컬 컴포넌트 상태에는 `useState` 사용
- 부수 효과에는 `useEffect` 사용
- 성능 최적화에는 `useMemo`와 `useCallback` 사용
- 재사용 가능한 로직에는 커스텀 훅 생성
- 훅 규칙 준수 (최상위 레벨에서만 호출)

## Props와 State
- TypeScript 인터페이스로 prop 타입 정의
- props에 구조 분해 할당 사용
- 깊게 중첩된 state 객체 지양
- 복잡한 state 업데이트에는 state 업데이터 함수 사용

## 성능
- 비용이 큰 컴포넌트에 React.memo 사용
- 리스트에 적절한 key props 구현
- 렌더링 시 객체/함수 생성 지양
- 대규모 컴포넌트에 지연 로딩(lazy loading) 사용

## 스타일링
- CSS 모듈 또는 styled-components 사용
- 복잡한 스타일링에 인라인 스타일 지양
- 일관된 네이밍 컨벤션 사용
- 반응형 디자인 패턴 구현

## 테스트
- 구현이 아닌 컴포넌트 동작을 테스트
- React Testing Library 사용
- 사용자 상호작용 및 접근성 테스트
- 외부 의존성 모킹
