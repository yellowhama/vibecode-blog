# 퍼블리 원고 재료 점검 + 실행 플랜 (Plan Mode)

- 작성일: 2026-03-01
- Intent SSOT: `00-INTENT.md`
- 원고 계획(복붙 vs 자동화): `PUBLY_ARTICLE_PLAN.md`

---

## 1) 재료 점검(Ready / Missing)

### A. 원고 “의도/방향” 재료

- [Ready] Intent(왜/범위/성공기준): `00-INTENT.md`
- [Ready] 전략/타겟/문체: `strategy.md`, `writing_direction.md`
- [Ready] 원고 구조(Track A/B, 장단점 표, 목차): `PUBLY_ARTICLE_PLAN.md`
- [Ready] 원고 본문 초안(캡처 자리 포함, 폴리싱 필요): `DRAFT_PUBLY_ARTICLE.md`

### B. 독자가 가져갈 “부록(복붙 가능)” 재료

- [Ready] 마스터 프롬프트(산출물 10개 계약): `automation_kit/prompts/00_orchestrator.md`
- [Ready] SSOT 템플릿(+가격/정책 섹션 포함): `automation_kit/ssot_template.yaml`
- [Ready] 예시 SSOT 3종(사과/헤드폰/폼보드): `automation_kit/examples/*.yaml`
- [Ready] 작은 RAG 룰 11종(기본원리+운영규정 포함): `automation_kit/rag/sources/*.md`
- [Ready] 번들(Track B 자동 주입): `automation_kit/prompt_bundle.md`
- [Ready] 실패/복구 가이드: `automation_kit/troubleshooting.md`
- [Ready] 확장(선택): pencil MCP 가이드: `automation_kit/prompts/20_pencil_mcp_layout.md`

### C. 원고의 “증거(데모)” 재료

- [Ready] 데모 실행 폴더/가이드: `demo/README.md`
- [Ready] 데모 SSOT 복사본: `demo/*/ssot.yaml`

- [Ready] **실행 결과(runs) 1차/2차/TrackB** 폴더(사과 데모 3개)
  - `demo/apple/runs/20260301_160000_apple_example_trackA_1/`
  - `demo/apple/runs/20260301_162000_apple_example_trackA_2/`
  - `demo/apple/runs/20260301_164000_apple_example_trackB_1/`
- [Ready] 원고에 넣을 **캡처 4~5장** 생성(질문/와이어프레임/샷리스트/QA/금칙어)
  - 이미지: `demo/apple/captures/CAP-*.png`
  - 캡처 포인트 메모: `demo/apple/EVIDENCE_NOTES.md`
- [Ready] “걸린 시간” 표(예상치) 채움 + 전/후 문장 후보 정리
  - `demo/apple/EVIDENCE_NOTES.md` (실측 전이므로 제출 전 교체 권장)

결론:
- “재료(템플릿/프롬프트/룰/목차)”는 준비 완료.
- 원고 신뢰도를 좌우하는 건 **runs 캡처** 한 세트뿐.

---

## 2) 정합성 체크(깨질만한 지점)

### 파일명/계약(번호 prefix) 정합성

- [Ready] 문서 전반의 산출물 명칭을 `03_..` `04_..` 형식으로 통일함.
- [Ready] 오케스트레이터가 `IMG-...` 플레이스홀더 ID를 wireframe/image/shot에 공유하도록 규칙 추가됨.

### RAG 인덱스/번들 반영

- [Ready] `rag/index.json` source_count=11, chunk_count=51 (최신)
- [Ready] `prompt_bundle.md`에 `Detail Page Fundamentals` 포함(목적/성공 기준/먼저 할 일)

---

## 3) 실행 플랜(최소, 현실)

### Step 1. 데모 1개 제품으로 “증거 세트” 만든다 (30~60분)

목표:
- 원고에 넣을 캡처/전후/시간을 만든다.

대상:
- `demo/apple/` (가장 단순, 전자제품 규정이 적어서 빠름)

실행:
1. Track A 1차 실행(SSOT 거의 비움)
2. `02_questions_to_answer.md`에서 질문 5개만 답하고 Track A 2차 실행
3. Track B 1회 실행(`prompt_bundle.md`로)

확보해야 할 산출물:
- `runs/.../02_questions_to_answer.md` (1차)
- `runs/.../05_wireframe.md` (1차)
- `runs/.../08_shot_list.md` (1차)
- `runs/.../09_qa_report.md` (1차)
- 2차에서 바뀐 점 1개(정책 TODO 자동 삽입/금칙어 제거/문장 짧아짐 등)
- 각 실행에 걸린 시간(대략)

### Step 2. 원고 본문 초안(1만자 내외) 작성 (2~4시간)

구성:
- `PUBLY_ARTICLE_PLAN.md` 목차 그대로
- 캡처는 “메시지 → 이미지 플레이스홀더(IMG-...)” 흐름으로 배치

필수 문장(안전):
- “100% 자동화”는 “최종 퍼블리시”가 아니라 “초안 패키지(10개 파일) 자동 생성” 기준임을 명시

### Step 3. (선택) “눈에 보이는 결과” 1장 추가 (30~90분)

옵션 A: pencil MCP로 와이어프레임 화면 생성
옵션 B: HTML 렌더러(플랫폼 중립)로 `index.html` 뽑기

목표:
- 퍼블리 독자가 “아, 이게 페이지가 되는구나”를 직관적으로 이해하게 만들기.

---

## 4) 확장 플랜(심화, 원고 부록용)

- DDD + Event-Driven 확장 계획: `DDD_EVENT_DRIVEN_PLAN.md`
- 원고 본문에는 5줄만 언급하고, 부록에서 다룬다(독자 부담 줄이기).

---

## 5) Done 정의(원고 제출 가능 상태)

- [x] 데모 runs 1차/2차/TrackB 완료 (demo/apple 기준)
- [x] 캡처 4~5장 확보 + 걸린 시간(예상치) 기록
  - `demo/apple/captures/`
  - `demo/apple/EVIDENCE_NOTES.md`
- [ ] 원고 초안 1개 완성(1만자 내외)
- [ ] 실패/복구 섹션 포함(트러블슈팅 + QA 캡처)
- [ ] 부록(SSOT/프롬프트/체크리스트) 정리
