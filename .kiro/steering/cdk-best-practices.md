<!-- CDK 모범 사례 - 출처: https://github.com/mbonig/kiro-steering-docs/blob/main/cdk/cdk-best-practices.md -->
---
title: CDK 모범 사례
inclusion: always
---

# CDK 모범 사례

## 기본 사항
- 프로젝트 초기화 및 파일 관리에 projen 사용
- 최신 버전의 CDK 사용, 여기서 확인: https://github.com/aws/aws-cdk/releases
- IAM 정책 생성에 cdk-iam-floyd 사용
- 추가 CDK 앱은 `cdk:` 접두사가 붙은 projen 태스크를 가져야 함. 예: `cdk:iam-roles`

## 구조
- 모든 파일은 `src/**` 디렉토리에 배치
- 애플리케이션은 `src/` 디렉토리에 배치
- 스택은 `src/stacks/**` 디렉토리에 배치
- 컨스트럭트는 `src/constructs/**` 디렉토리에 배치
- 스테이지는 `src/stages/**` 디렉토리에 배치
- Lambda 함수 핸들러는 정의하는 컨스트럭트의 하위 디렉토리인 `handler`에 배치
- 파일명에 파스칼 케이스 사용 (예: `SomeConstruct.ts`)
- 각 커스텀 컨스트럭트는 컨스트럭트와 동일한 이름의 자체 파일에 위치

## 앱
- 각 환경에 대한 별도의 스택/스테이지 인스턴스를 포함해야 함
- 각 스택/스테이지에 계정/리전별 값을 제공해야 함
- Context는 어떤 용도로든 절대 사용하지 않아야 함

## 스택
- 리소스 임포트를 담당해야 함 (`Vpc.fromLookup()`, `Bucket.fromBucketName()` 등)
- 컨스트럭트 인스턴스화를 담당해야 함

## 컨스트럭트
- 생성자에서 전달받은 props를 private 필드로 저장해야 함
- 모든 리소스는 생성자가 아닌 protected 메서드에서 생성해야 함
- 리소스를 임포트하지 않아야 함 (예: `Vpc.fromLookup()`)
- 리소스를 나타내는 구체적인 객체를 전달받아야 함
- 리소스 식별자를 나타내는 속성은 템플릿 리터럴 타입 사용 (예: `vpc-${string}`)

## 테스트
- 모든 테스트는 `test/` 디렉토리에 배치
- 테스트는 컨스트럭트 이름과 일치해야 함 (예: `SomeConstruct.test.ts`)
- 컨스트럭트에는 세밀한 단언(assertion) 사용
- 스택에는 스냅샷 테스트 사용
- `Code.fromAsset` 및 `ContainerImage.fromAsset` 호출을 모킹

## Lambda 함수
- 가능한 경우 `NodejsFunction` 또는 `PythonFunction` 사용
