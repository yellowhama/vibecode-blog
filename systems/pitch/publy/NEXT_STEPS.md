# Next Steps — 퍼블리 투고 + 상세페이지 자동화 시스템

## Done (현재까지)

- 퍼블리 투고 폴더 구성 + 메일/전략 문서 정리
- `automation_kit/` 생성(SSOT 템플릿, 프롬프트, 기능 리스트, 통합 가이드, 트러블슈팅)
- 작은 RAG 구축/확장(`rag/sources` + 인덱스/검색 스크립트)
- 운영 규정 RAG 추가(가격/정책/CS/클레임)
- `prompt_bundle.md` 생성으로 RAG 자동 주입(옵션 B)
- `blog-research/`에 운영 설계 리포트 추가(11번)
- 데모 runs(사과) 3종 생성(Track A 1차/2차 + Track B 1차)

## Next (다음 단계)

1. 데모 런 2개 더 만들기(헤드폰/폼보드)
- `demo/headphones/ssot.yaml`, `demo/foamboard/ssot.yaml`로 동일하게 1차/2차/TrackB를 만들기
- 목표: 카테고리(전자/자재)에서도 워크플로우가 깨지지 않는다는 증거 확보

2. (선택) 플랫폼-중립 렌더러 추가
- `runs/.../04_copy_deck.md` + `runs/.../03_section_plan.json`을 HTML로 뽑는 템플릿/프롬프트 추가
- 목표: “초안이 그냥 문서”가 아니라 “페이지 형태”로 바로 보이게

3. (선택) pencil MCP 자동 생성 데모 추가
- `prompts/20_pencil_mcp_layout.md` 실행 예시(스크린샷/결과) 준비

4. 퍼블리 원고 구조 확정
- “기능 소개 -> 조합/자동화 -> 실패/복구” 3단 구성
- 부록으로 `automation_kit/`의 복붙용 프롬프트 제공
