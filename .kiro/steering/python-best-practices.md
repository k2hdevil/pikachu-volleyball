---
title: Python 모범 사례
inclusion: fileMatch
fileMatchPattern: '*.py'
---

# Python 모범 사례

## 코드 스타일
- PEP 8 스타일 가이드 준수
- 의미 있는 변수 및 함수 이름 사용
- 변수와 함수에는 snake_case 사용
- 클래스에는 PascalCase 사용
- 상수에는 UPPER_SNAKE_CASE 사용
- 줄 길이를 88자로 제한 (Black 포맷터 기준)

## 타입 힌트
- 함수 매개변수와 반환값에 타입 힌트 사용
- 필요 시 `typing` 모듈에서 타입 임포트
- nullable 값에는 `Optional` 사용
- 여러 가능한 타입에는 `Union` 사용

## 오류 처리
- 구체적인 예외 타입 사용
- 적절한 수준에서 예외 처리
- 리소스 관리에 컨텍스트 매니저(`with` 문) 사용
- 적절한 상세 수준으로 오류 로깅

## 코드 구성
- 의존성 관리에 가상 환경 사용
- requirements.txt 생성 또는 poetry/pipenv 사용
- 코드를 모듈과 패키지로 구성
- `__init__.py` 파일을 적절히 사용

## 테스트
- pytest를 사용하여 단위 테스트 작성
- 설명적인 테스트 함수 이름 사용
- 외부 의존성 모킹
- 높은 테스트 커버리지 목표
- 테스트 설정에 fixture 사용
- 최소 출력으로 테스트 실행: `pytest -q` 또는 `python -m pytest --tb=short -q`
- 전체 스위트 실행을 피하기 위해 특정 테스트 필터링: `pytest -k "test_name"`

## 성능
- 적절한 경우 반복문 대신 리스트 컴프리헨션 사용
- 대규모 데이터셋에는 제너레이터 사용
- 최적화 전에 코드 프로파일링
- 적절한 자료구조 사용 (set, dict 등)
