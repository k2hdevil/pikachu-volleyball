---
title: MCP (Model Context Protocol) 모범 사례
inclusion: always
---

# MCP (Model Context Protocol) 모범 사례

## 서버 설정
- 프로젝트별 서버는 워크스페이스 수준 설정(`.kiro/settings/mcp.json`) 사용
- 전역/크로스 워크스페이스 서버는 사용자 수준 설정(`~/.kiro/settings/mcp.json`) 사용
- 서버 이름 충돌 시 워크스페이스 설정이 사용자 설정보다 우선
- 안정성을 위해 정확한 버전을 지정하거나 `@latest` 사용

## 설치 및 설정
- Python 기반 MCP 서버에는 `uvx` 명령어 사용 (`uv` 패키지 매니저 필요)
- `uv`는 pip, homebrew 또는 다음 링크를 통해 설치: https://docs.astral.sh/uv/getting-started/installation/
- uvx 서버는 별도 설치 불필요 - 자동으로 다운로드됨
- 설정 후 즉시 서버 테스트, 문제가 발생할 때까지 기다리지 않기

## 보안 및 자동 승인
- `autoApprove`는 신뢰할 수 있는 저위험 도구에만 제한적으로 사용
- 자동 승인 목록에 추가하기 전에 도구 기능 검토
- 자동 승인된 도구의 보안 영향을 정기적으로 감사
- 환경별 자동 승인 설정 고려

## 오류 처리 및 디버깅
- 로그 노이즈를 줄이기 위해 `FASTMCP_LOG_LEVEL: "ERROR"` 설정
- 문제가 있는 서버를 일시적으로 비활성화하려면 `disabled: false` 사용
- 설정 변경 시 서버가 자동으로 재연결됨
- 수동 재연결은 Kiro 기능 패널의 MCP Server 뷰 사용

## 일반적인 MCP 서버 예시
```json
{
  "mcpServers": {
    "aws-docs": {
      "command": "uvx",
      "args": ["awslabs.aws-documentation-mcp-server@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": []
    },
    "filesystem": {
      "command": "uvx",
      "args": ["mcp-server-filesystem@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": ["read_file", "list_directory"]
    }
  }
}
```

## MCP 도구 테스트
- 설정 후 즉시 MCP 도구 테스트
- 특정 문제가 없는 한 설정 파일 검사 불필요
- 샘플 호출로 도구 동작 확인
- 다양한 매개변수 조합으로 테스트
- 팀 참고용으로 작동하는 예시 문서화

## 성능 최적화
- 사용하지 않는 서버는 비활성화하여 시작 시간 개선
- 와일드카드 대신 구체적인 도구 이름을 자동 승인에 사용
- 서버 리소스 사용량을 모니터링하고 필요에 따라 조정
- 최적화를 위한 서버별 환경 변수 고려

## 개발 워크플로우
- MCP 서버를 점진적으로 추가하고 각 추가 시 테스트
- 프로덕션 환경에서는 버전 고정 사용
- 팀 문서에 서버 목적과 사용법 기록
- 다양한 사용 사례에 맞는 프로젝트별 서버 컬렉션 생성

## 문제 해결
- Kiro의 MCP Server 뷰에서 서버 로그 확인
- Python 서버 실패 시 `uv` 및 `uvx` 설치 상태 확인
- 필요 시 Kiro 외부에서 서버 연결 테스트
- 서버 관리를 위해 명령 팔레트의 "MCP" 명령어 사용
- Kiro를 재시작하는 대신 MCP Server 뷰에서 서버 재시작

## 도구 사용 모범 사례
- 처음 사용하기 전에 도구 기능 파악
- MCP 도구 호출 시 설명적인 프롬프트 사용
- 워크플로우에서 도구 오류를 적절히 처리
- 복잡한 작업에는 여러 MCP 도구를 조합하여 사용
- 반복 호출을 피하기 위해 적절히 결과 캐싱

## 개발 통합
- 라이브러리 추가 전 Context7 MCP 서버로 의존성 호환성 확인
- 최신 AWS 문서 및 모범 사례를 위해 AWS-Knowledge MCP 서버 활용
- AWS API 상호작용 및 검증을 위해 aws-api-mcp-server 사용
- 문서 작성 시 가능한 경우 MCP 서버를 통해 공식 소스 참조
