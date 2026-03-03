# 데모 실행 가이드 (원고 캡처용)

목표: 퍼블리 원고에 넣을 “증거 캡처”를 빠르게 만든다.

## 폴더 구조

- 제품별 폴더에 `ssot.yaml`이 준비되어 있다.
  - `demo/apple/ssot.yaml`
  - `demo/headphones/ssot.yaml`
  - `demo/foamboard/ssot.yaml`

실행하면 각 폴더 안에 `runs/YYYYMMDD_HHMMSS_<product_slug>/`가 생성된다.

## Track A: 복붙(노코드)

1. 제품 폴더로 이동(예: `demo/apple/`)
2. Claude Code에서 “현재 폴더”가 그 폴더인지 확인
3. `publy_april_pitch/automation_kit/prompts/00_orchestrator.md`를 그대로 붙여넣고 실행

## Track B: 스크립트/자동화(번들)

1. 번들 갱신:
   - `cd publy_april_pitch/automation_kit/rag`
   - `node scripts/build_index.mjs`
   - `node scripts/make_prompt_bundle.mjs`
2. 제품 폴더로 이동(예: `demo/apple/`)
3. Claude Code에 `publy_april_pitch/automation_kit/prompt_bundle.md` 내용을 그대로 붙여넣고 실행

## 원고에 넣기 좋은 캡처(최소 4개)

- `02_questions_to_answer.md` (다음 루프 질문)
- `05_wireframe.md` (페이지가 “보이는” 순간)
- `08_shot_list.md` (사진이 없을 때의 해결 루프)
- `09_qa_report.md` (과장/근거/필수고지 자동 점검)

추가로 있으면 좋은 것:
- 1차 실행 vs 2차 실행 비교(금칙어 삭제, 정책 TODO 삽입 등)
- 걸린 시간 메모(대략이라도)

