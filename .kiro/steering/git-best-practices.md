---
title: Git 모범 사례
inclusion: always
---

# Git 모범 사례

## 커밋 메시지
- 컨벤셔널 커밋 형식 사용: `type(scope): description`
- 타입: feat, fix, docs, style, refactor, test, chore
- 첫 줄은 50자 이내로 유지
- 명령형 어조 사용 ("기능 추가" - "기능을 추가했음" 아님)
- 복잡한 변경 사항에는 본문 포함

## 브랜칭
- 새로운 개발에는 기능 브랜치 사용
- main/master 브랜치를 안정적이고 배포 가능한 상태로 유지
- 설명적인 브랜치 이름 사용 (feature/user-auth, fix/login-bug)
- 병합된 브랜치는 삭제하여 저장소를 깔끔하게 유지

## 워크플로우
- 작업 시작 전 최신 변경 사항 풀(pull)
- 논리적 단위로 자주 커밋
- 병합 전 인터랙티브 리베이스로 히스토리 정리
- 병합 전 코드 리뷰 (풀 리퀘스트)

## 저장소 관리
- 빌드 산출물과 시크릿을 제외하기 위해 .gitignore 사용
- 저장소 크기를 관리 가능한 수준으로 유지 (대용량 파일에는 Git LFS 사용)
- 시맨틱 버저닝으로 릴리스에 태그 지정
- README에 브랜칭 전략 문서화

## Pull Request 규칙
- PR 제목은 컨벤셔널 커밋 형식 준수: `type(scope): description`
- PR 설명에 변경 사항 요약, 테스트 방법, 관련 이슈 번호 포함
- 최소 1명 이상의 리뷰어 승인 후 병합
- main 브랜치로의 직접 push 금지 (브랜치 보호 규칙 설정)
- CI 파이프라인 통과를 병합 조건으로 설정
- Squash Merge를 기본으로 사용하여 히스토리를 깔끔하게 유지
- PR 템플릿(`.github/pull_request_template.md`)을 생성하여 일관된 형식 유지

## AWS Amplify 배포
- GitHub 리포지토리를 Amplify Hosting에 직접 연결하여 자동 빌드/배포
- main 브랜치 push 시 자동으로 빌드 → CDN 배포 트리거
- 빌드 설정은 프로젝트 루트의 `amplify.yml`에 정의
- HTTPS 및 CDN은 Amplify가 자동 제공 (별도 설정 불필요)
- 커스텀 도메인은 Amplify 콘솔에서 연결
- 환경 변수는 Amplify 콘솔의 환경 변수 설정 사용 (코드에 포함 금지)
- PR 브랜치별 프리뷰 배포를 활성화하여 병합 전 확인 가능

## 보안
- 시크릿, API 키, 비밀번호를 절대 커밋하지 않기
- 설정에는 환경 변수 사용
- 민감한 정보가 포함된 커밋 검토
- 가능한 경우 서명된 커밋 사용
