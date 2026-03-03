# 상세페이지 자동화 키트(복붙용)

이 폴더는 “제품만 있고(기획/디자인/사진 거의 없음) 상세페이지 초안을 빨리 뽑는” 자동화를 위해 만든 **프롬프트 + 템플릿 묶음**입니다.

## 들어있는 것

- `ssot_template.yaml`: 제품 정보를 한 장으로 모으는 템플릿(아는 것만 채우면 됨)
- `examples/`: 사과/헤드폰/폼보드 예시 SSOT
- `prompts/`: Claude Code에 그대로 붙여넣어 쓰는 프롬프트
- `schemas/`: 결과물 포맷(JSON) 참고용
- `capabilities.md`: AI가 해줄 수 있는 기능 정리
- `full_capabilities.md`: 최종까지 AI가 할 수 있는 기능 전체 리스트
- `integrations.md`: MCP/API 연결 지점(디자인/이미지/컬러)
- `troubleshooting.md`: 결과물이 맘에 안 들 때 고치는 순서
- `rag/`: 톤/섹션/QA + 가격/정책/CS/클레임 규칙을 계속 쌓는 작은 RAG + 인덱스/검색 스크립트

## 결과물(초안 실행 1번에 생기는 핵심 파일)

- `03_section_plan.json`: 섹션 기획표(어떤 섹션에 무슨 말을 쓸지)
- `04_copy_deck.md`: 카피 초안(헤드라인/본문/버튼 문구, A/B)
- `05_wireframe.md`: 와이어프레임(대충 배치, 블록 설계)
- `08_shot_list.md`: 핸드폰 샷리스트(다음에 찍어야 할 사진)
- `09_qa_report.md`: 안전장치(근거/금칙어/필수 고지 검사)

이 파일들은 `runs/YYYYMMDD_HHMMSS_<product_slug>/` 아래에 생성됩니다.

## 가장 간단한 사용 흐름(3줄)

1. `ssot_template.yaml`을 복사해서 `ssot.yaml`을 만들고, 아는 것만 채운다.
2. (권장) RAG 컨텍스트를 포함한 번들을 만든다.
   - `cd rag && node scripts/build_index.mjs && node scripts/make_prompt_bundle.mjs`
3. Claude Code에 `prompt_bundle.md` 내용을 그대로 붙여넣는다. (`runs/`에 초안 산출물 생성)

RAG 없이 빠르게만 돌릴 때:
- `prompts/00_orchestrator.md`만 붙여넣어도 동작합니다. (단, 톤/규칙이 흔들릴 수 있음)
