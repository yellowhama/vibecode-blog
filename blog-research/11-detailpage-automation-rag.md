# Detail Page Automation — Prep + Small RAG 설계

> **Date:** 2026-03-01  
> **Purpose:** 상세페이지를 “한 번 만들고 끝”이 아니라, **계속 만들어낼 수 있는 시스템**으로 운영하기 위한 준비/리서치/RAG 구조

## 왜 RAG가 필요한가

상세페이지 자동화는 결국 “말/디자인”을 뽑는 게 아니라,
- **사실 기반(Fact)**으로
- **항상 같은 섹션 구조**로
- **리스크 없는 표현**으로
계속 생산하는 시스템입니다.

RAG는 이걸 위해 “AI가 항상 참고해야 하는 규칙/패턴/예시”를 따로 모아두는 장치입니다.

## 목표(초안 공장 기준)

한 번 실행하면 아래 파일이 자동으로 나오는 상태:
- `section_plan.json` (기획)
- `copy_deck.md` (카피 A/B)
- `wireframe.md` (블록 설계)
- `colors.json` (hex 팔레트)
- `image_prompts.md` (이미지 프롬프트)
- `qa_report.md` (안전 체크)

## 준비 단계(맨땅 방지)

### 1) 입력을 표준화(SSOT)

- 제품 정보는 한 장으로: `ssot.yaml`
- 모르는 건 “비워두기/TODO”
- 추정은 `[ASSUMPTION]`으로 분리

### 2) 출력도 표준화(산출물 계약)

- AI가 “잘 말하는 것”이 아니라 “파일을 생성”하게 만들기
- 섹션을 5개로 고정: Hero/USP/Proof/FAQ/CTA

### 3) 작은 RAG(규칙/패턴/템플릿) 만들기

처음부터 벡터DB 크게 만들지 말고, 아래 최소 6개 문서부터 시작한다.
- Brand Voice(톤/금지어)
- Section Playbook(섹션별 규칙)
- Positioning Patterns(말의 방향 3개 뽑는 패턴)
- Design Blocks(블록 와이어프레임)
- Image Prompt Snippets(보정/보조 이미지 프롬프트)
- QA Rules(근거/금칙/필수 고지)

## 작은 RAG를 실제로 구성한 위치

- 키트 루트: `publy_april_pitch/automation_kit/`
- RAG 폴더: `publy_april_pitch/automation_kit/rag/`
  - `sources/`: 사람이 유지보수하는 규칙 문서
  - `scripts/build_index.mjs`: sources -> index.json 생성
  - `scripts/query.mjs`: 질의 -> 관련 chunk 출력

## 운영 루틴(계속 만드는 시스템)

### A) 새 제품 들어올 때(10~30분)

1. `ssot.yaml` 채우기(아는 것만)
2. 오케스트레이터 실행(초안 생성)
3. QA 보고서 보고 “질문 5개”만 답해서 2차 실행

### B) 시스템이 점점 좋아지게 만들기(주 1회)

1. 이번에 잘 먹힌 문장/섹션을 RAG에 한 단락 추가
2. 자주 터지는 리스크(과장/근거 부족)를 QA 룰에 추가
3. `build_index` 다시 돌려서 RAG 업데이트

이 루틴이 “한 번 만들고 끝”을 “계속 만드는 시스템”으로 바꾸는 핵심이다.

## 다음 확장(필요할 때만)

- 벡터 검색(임베딩)으로 고도화
- 경쟁사 스와이프 파일(좋은 상세페이지 캡처/요약) 추가
- 플랫폼별 렌더러(HTML/CMS 블록) 추가
