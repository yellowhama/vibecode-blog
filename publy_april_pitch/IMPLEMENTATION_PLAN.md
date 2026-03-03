# Implementation Plan — Detail Page Draft Factory

> Date: 2026-03-01  
> Goal: 상세페이지를 “한 번 만들고 끝”이 아니라 **계속 찍어낼 수 있는 자동화 시스템**으로 운영한다.

## 0) 범위 정의(중요)

### 이 계획이 목표로 하는 것

- 제품 정보가 거의 없어도(현물 + 라벨 + 대충 찍은 사진) **30분 안에 초안 산출물**을 뽑는다.
- 결과물이 “그럴듯한 글”이 아니라 **파일로 저장된 산출물 세트**가 되게 만든다.
- 다음 번 실행에서 더 좋아지도록, **작은 RAG**를 계속 쌓을 수 있게 만든다.

### 이 계획이 목표로 하지 않는 것(일단)

- 특정 플랫폼(스마트스토어/카페24/자사몰) “완벽한 최종 퍼블리시” 자동화
- 스튜디오급 제품 사진 생성(제품이 없는데 제품을 창조하는 건 리스크 큼)

## 1) 시스템 아키텍처(최소)

입력(SSOT)
  -> Orchestrator(마스터 프롬프트)
    -> 작은 RAG(규칙/패턴/금지어/블록)
  -> 산출물(초안 패키지)
  -> QA(리스크 제거)
  -> 다음 루프(질문 답변 + 사진 추가)

## 2) 표준 산출물(=계약서)

초안 실행 1번에 “반드시” 아래 파일들이 생성되어야 한다.

- `01_intake_report.md` (입력 점검)
- `02_questions_to_answer.md` (품질 올리는 질문)
- `03_section_plan.json` (기획/섹션 설계)
- `04_copy_deck.md` (카피 A/B)
- `05_wireframe.md` (블록 와이어프레임)
- `06_colors.json` (hex 팔레트)
- `07_image_prompts.md` (사진 보정/보조 이미지 프롬프트)
- `08_shot_list.md` (다음 루프용 샷리스트)
- `09_qa_report.md` (금칙/근거/필수고지 검사)
- `run_summary.md` (요약)

현재 구현 위치:
- 키트: `publy_april_pitch/automation_kit/`
- 오케스트레이터: `publy_april_pitch/automation_kit/prompts/00_orchestrator.md`

## 3) 작은 RAG 설계(계속 만드는 시스템의 핵심)

### 3-1) RAG는 “최소 7문서”로 시작하고, 운영 규정까지 확장한다

시작(7):
- `Detail Page Fundamentals`: 상세페이지 목적/성공 기준/먼저 할 일(흔들림 방지)
- `Brand Voice`: 톤/금지어/문장 패턴
- `Section Playbook`: Hero/USP/Proof/FAQ/CTA 규칙
- `Positioning Patterns`: 말의 방향 3개 뽑는 패턴
- `Design Blocks`: 블록 와이어프레임 규칙
- `Image Prompt Snippets`: 보정/보조 이미지 프롬프트
- `QA Rules`: 근거/금칙/필수고지/중복 제거

운영(추가 4) -> 총 11:
- `Pricing Rules`: 가격/옵션/할인 안전 규칙
- `Policy Rules`: 배송/교환/환불/AS 템플릿
- `Support Playbook`: FAQ/컴플레인 대응 템플릿
- `Claims Allow/Deny`: 허용/금지 주장 리스트(대체 문장)

현재 구현 위치:
- `publy_april_pitch/automation_kit/rag/sources/`
- 인덱스 생성: `cd publy_april_pitch/automation_kit/rag && node scripts/build_index.mjs`
- 검색: `node scripts/query.mjs "Hero 톤" --top=3`

### 3-2) 쌓는 방식(운영 루틴)

- 매 실행마다 `09_qa_report.md`에서 “자주 터지는 문제”를 1개 뽑아 RAG에 룰로 추가
- 매 실행마다 “잘 먹힌 문장/구성”을 1단락 RAG에 추가
- 주 1회 `build_index` 재실행

완료 조건:
- 같은 제품을 3번 돌렸을 때, 3번째 결과가 확실히 더 좋아짐(특히 과장/중복 감소)

## 4) RAG 주입(Injection) 파이프라인 설계

문제:
- RAG가 있어도 “프롬프트가 참고 안 하면” 의미가 없다.

해결:
- 오케스트레이터가 실행 전에 RAG에서 관련 chunk를 “뽑아 붙이게” 한다.

구현 옵션:
- 옵션 A(가장 단순): 오케스트레이터에 “실행 전 query 명령을 돌리고, 결과를 컨텍스트로 붙여라” 지시
- 옵션 B(더 자동): `prompt_bundle.md` 생성 스크립트(=RAG 컨텍스트 포함된 1회용 프롬프트)를 만들고, 그걸 Claude Code에 붙여넣기

완료 조건:
- RAG에 룰을 추가하면, 다음 실행 결과에서 바로 반영됨(톤/섹션 규칙/QA 우선순위)

### 현재 선택(권장): 옵션 B

이 프로젝트는 “CLI 스크립트로 프롬프트 번들을 만들고, Claude Code에 한 번만 붙여넣는 방식”이 가장 단순합니다.

- 번들 생성 스크립트: `publy_april_pitch/automation_kit/rag/scripts/make_prompt_bundle.mjs`
- 사용 흐름:
  1. `cd publy_april_pitch/automation_kit/rag && node scripts/build_index.mjs`
  2. `node scripts/make_prompt_bundle.mjs`
  3. 생성된 `publy_april_pitch/automation_kit/prompt_bundle.md`를 Claude Code에 그대로 붙여넣기

## 5) 데모/베이스라인(퍼블리 글에 쓸 “증거”)

목표:
- 사과/헤드폰/폼보드 3개 SSOT로 1차/2차 실행 결과를 만들어 “전/후”를 보여준다.

준비물:
- SSOT 예시(이미 있음): `publy_april_pitch/automation_kit/examples/`
- 실행 결과 저장 폴더: `runs/` (타임스탬프 폴더)

완료 조건:
- 퍼블리 원고에 “초안 30분 결과물” 스크린샷/텍스트 캡처를 넣을 수 있음

현재 확보된 샘플(사과):
- `publy_april_pitch/demo/apple/runs/20260301_160000_apple_example_trackA_1/`
- `publy_april_pitch/demo/apple/runs/20260301_162000_apple_example_trackA_2/`
- `publy_april_pitch/demo/apple/runs/20260301_164000_apple_example_trackB_1/`

## 6) 통합(조합) 자동화: 기능 소개 -> 조합 -> 자동화

퍼블리 원고 구조에 맞춰 시스템을 3단으로 정리한다.

1. 기능 소개: Planner/Copy/Design/Image/Color/QA가 뭘 하는지
2. 조합: 산출물 계약(파일 체인)로 엮는 법
3. 자동화: 오케스트레이터 1개로 `runs/`에 찍히게 만들기

참고 문서:
- 기능 리스트: `publy_april_pitch/automation_kit/full_capabilities.md`
- 통합 가이드: `publy_april_pitch/automation_kit/integrations.md`
- 트러블슈팅: `publy_april_pitch/automation_kit/troubleshooting.md`

## 7) (선택) MCP/API 확장 계획

### 7-1) pencil MCP(디자인 뼈대)

- 목표: `05_wireframe.md` 수준의 블록을 pencil 문서로 자동 생성
- 참고: `publy_april_pitch/automation_kit/prompts/20_pencil_mcp_layout.md`

완료 조건:
- “눈으로 볼 수 있는 초안”이 1분 안에 생성됨(수정 용이)

### 7-2) Gemini 이미지(Nano Banana)

- 목표: 핸드폰 사진 보정/보조 이미지 생성 자동화
- 주의: 제품이 없을 때 “제품 창조”는 금지(리스크)

완료 조건:
- `07_image_prompts.md` + API 템플릿으로 반복이 가능

## 8) 리스크/가드레일

- 과장/근거 없는 주장: QA에서 강제 삭제 또는 TODO 치환
- 카테고리별 필수 고지 누락: QA 체크리스트로 강제
- 랜덤 디자인: 블록 설계/길이 제한으로 제어

## 9) 바로 다음 액션(오늘 기준)

현재 상태:
- RAG 주입(옵션 B: `prompt_bundle.md`)까지 구현되어 있음.

다음 액션:
1. 데모 런(헤드폰/폼보드) 추가 생성 + 1차/2차 비교 결과 저장 (사과 데모는 완료)
2. QA에서 걸린 항목을 RAG 룰로 승격(“자주 터지는 문제” 위주)
3. 퍼블리 원고 목차 확정 + 캡처(산출물 일부) 수집
4. (선택) 출력 어댑터 결정(HTML 또는 Pencil MCP로 “눈에 보이는 초안” 만들기)
