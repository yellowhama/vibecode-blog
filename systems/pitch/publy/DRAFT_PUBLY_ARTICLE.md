# (초안) 클로드 코드로 상세페이지 100% 자동화하기: 나만의 AI 에이전트 팀 구축법

- 대상: AI로 결과물을 빠르게 뽑고 싶은 마케터/기획자
- 전제: 디자인/개발을 몰라도 따라갈 수 있게, 짧고 쉬운 문장으로 씁니다.

---

## 0) 먼저 한 줄로 결론

"상세페이지를 잘 쓰는 법"이 아니라,
**상세페이지 초안 세트(10개 파일)**를 반복 생산하는 시스템을 만듭니다.

여기서 말하는 "100% 자동화"는
**사람은 최종 승인만 남기고**, 초안은 AI가 한 번에 뽑아주는 상태를 뜻합니다.

---

## 1) 왜 이걸 하냐: 상세페이지는 매번 처음부터라서

상세페이지 작업이 오래 걸리는 이유는 단순합니다.
- 제품 정보가 여기저기 흩어져 있습니다.
- 사진이 부족합니다.
- 정책(배송/교환/환불)이 비어 있습니다.
- 그래서 매번 "처음부터" 다시 만들게 됩니다.

그래서 목표를 바꿉니다.
- 최종 시안을 한 번에 만들려고 하지 않습니다.
- 대신 **초안 패키지**를 빠르게 만들고, 다음 루프로 개선합니다.

---

## 2) 상세페이지는 뭔가: 목표는 3개뿐

상세페이지의 목표는 딱 3개라고 생각하면 편합니다.

1. 맞는 사람이 빨리 결심하게 만들기(전환)
2. 아닌 사람은 사지 않게 만들기(기대치 정리)
3. 오해를 줄이기(반품/클레임/CS 감소)

---

## 3) 오늘 만들 결과물: "상세페이지 초안 세트" 10개 파일

AI에게 "알아서 만들어줘"라고 하면, 그럴듯한 글은 나와도 운영이 안 됩니다.
그래서 결과물 형식을 **파일 10개로 고정**합니다.

1. `01_intake_report.md`: 입력 점검(지금 있는 Fact / 없는 Fact)
2. `02_questions_to_answer.md`: 품질을 올리는 질문 10개
3. `03_section_plan.json`: 섹션 기획표(Hero/USP/Proof/FAQ/CTA)
4. `04_copy_deck.md`: 카피 초안(버전 A/B)
5. `05_wireframe.md`: 와이어프레임(블록 배치)
6. `06_colors.json`: 컬러 팔레트(기본/트렌드)
7. `07_image_prompts.md`: 사진 보정/보조 이미지 프롬프트
8. `08_shot_list.md`: 다음에 찍어야 할 사진 리스트
9. `09_qa_report.md`: 과장/근거/필수고지 자동 점검
10. `run_summary.md`: 이번 실행 요약

이게 있으면 무엇이 좋은가?
- 다음에 누가 맡아도 같은 방식으로 계속 만들 수 있습니다.
- "사진이 없어서" 멈추지 않고, 다음 루프(샷리스트)가 생깁니다.
- "근거 없는 말"을 QA가 잡아줍니다.

---

## 4) Track A: 복붙(노코드)로 1차 초안 뽑기

### 4-1) 입력은 한 장으로: SSOT(단일 진실 문서)

제품 정보는 딱 한 파일에 모읍니다.
이 파일만 믿고, 나머지는 AI가 복사해서 씁니다.

- 템플릿: `publy_april_pitch/automation_kit/ssot_template.yaml`

핵심 규칙은 하나입니다.
- **Fact(사실)**, **Guess(추정)**, **Question(질문)**을 섞지 않습니다.

### 4-2) 실행(복붙)

Claude Code에서 제품 폴더로 이동한 다음,
아래 프롬프트를 그대로 붙여넣고 실행합니다.

- 마스터 프롬프트(복붙용): `publy_april_pitch/automation_kit/prompts/00_orchestrator.md`

그러면 `runs/` 아래에 10개 파일이 생성됩니다.

### 4-3) 데모(사과) 1차 실행 캡처

[캡처 자리 1] 다음 루프 질문
- 파일: `demo/apple/runs/20260301_160000_apple_example_trackA_1/02_questions_to_answer.md`
- 이미지: `demo/apple/captures/CAP-01_questions_trackA1.png`
- 포인트: 질문 10개가 전부 보이게

[캡처 자리 2] 와이어프레임
- 파일: `demo/apple/runs/20260301_160000_apple_example_trackA_1/05_wireframe.md`
- 이미지: `demo/apple/captures/CAP-02_wireframe_trackA1_hero_proof.png`
- 포인트: Hero + Proof 섹션(IMG-... + 메시지/샷/캡션/alt)

[캡처 자리 3] 샷리스트
- 파일: `demo/apple/runs/20260301_160000_apple_example_trackA_1/08_shot_list.md`
- 이미지: `demo/apple/captures/CAP-03_shot_list_trackA1.png`
- 포인트: 필수 3장 + 라벨/중량 증명 샷

---

## 5) 2차 초안은 더 빨라집니다(질문 5개만 답하면 됨)

1차 실행 결과에서 `02_questions_to_answer.md`를 보면,
"답하면 품질이 가장 크게 올라가는 질문"이 정리되어 있습니다.

그중 5개만 답해서 SSOT를 업데이트하고 다시 실행하면,
초안이 급격히 좋아집니다.

- 2차 입력 예시: `demo/apple/ssot_round2.yaml`
- 2차 실행 결과: `demo/apple/runs/20260301_162000_apple_example_trackA_2/`

[캡처 자리 4] QA가 PASS로 바뀌는 장면(전/후)
- 1차 QA: `demo/apple/runs/20260301_160000_apple_example_trackA_1/09_qa_report.md`
- 2차 QA: `demo/apple/runs/20260301_162000_apple_example_trackA_2/09_qa_report.md`

---

## 6) Track A의 한계: 두 번째부터 흔들리는 이유 3가지

1) 사람마다 문체가 달라짐
2) 팀에 누가 들어오면 규칙이 깨짐
3) 정책/클레임 같은 운영 규정이 자꾸 빠짐

그래서 Track B가 필요합니다.

---

## 7) Track B: 작은 RAG로 "흔들림"을 고정하기

RAG를 어렵게 생각할 필요 없습니다.
여기서 RAG는 그냥 "규칙 모음 파일"입니다.

- 톤/금칙어
- 섹션 규칙(Hero/Proof 등)
- 가격/정책 템플릿
- CS/클레임 대응

이 규칙을 실행 전에 자동으로 붙여 넣으면,
AI 결과가 매번 비슷한 품질로 나옵니다.

### 7-1) 번들 생성(스크립트)

```bash
cd publy_april_pitch/automation_kit/rag
node scripts/build_index.mjs
node scripts/make_prompt_bundle.mjs
```

그러면 `publy_april_pitch/automation_kit/prompt_bundle.md`가 만들어집니다.
이 파일을 Claude Code에 붙여넣고 실행하면 Track B입니다.

### 7-2) Track B 데모 캡처(QA)

[캡처 자리 5] 안전한 실패(발명 금지)
- 파일: `demo/apple/runs/20260301_164000_apple_example_trackB_1/09_qa_report.md`
- 이미지: `demo/apple/captures/CAP-04_qa_trackB1_safe_fail.png`
- 포인트: 가격/정책/수치를 "만들지 않고" TODO 템플릿으로 남기는 부분

---

## 8) 실패/복구: 일부러 망가뜨려 보면 더 확신이 생깁니다

"QA가 진짜로 잡나?"는 한 번만 실패시켜 보면 바로 확인됩니다.

- 실패 데모(금칙어/과장 일부러 넣음):
  - `demo/apple/runs/20260301_166000_apple_example_failure_demo/04_copy_deck.md`
  - `demo/apple/runs/20260301_166000_apple_example_failure_demo/09_qa_report.md`
  - 이미지: `demo/apple/captures/CAP-05_qa_failure_demo_forbidden.png`

여기서 QA는 이런 걸 잡습니다.
- 금칙어: 100% / 무조건 / 최고
- 근거 없는 수치/인증/비교
- 정책을 "무조건"이라고 단정하는 문장

---

## 9) (선택) 눈에 보이는 결과가 필요하면: pencil.dev

상세페이지는 결국 "보이는 화면"이 필요할 때가 있습니다.

- 지금 단계(초안)에서는 `05_wireframe.md`로도 충분합니다.
- 그래도 화면이 필요하면, pencil.dev(MCP)로 블록을 자동 생성할 수 있습니다.

가이드:
- `publy_april_pitch/automation_kit/prompts/20_pencil_mcp_layout.md`

---

## 10) 1주 적용 플랜(현실 버전)

- Day 1: Track A로 1차 실행(초안 세트 만들기)
- Day 2: 질문 5개만 답해서 2차 실행
- Day 3: 자주 빠지는 규칙 3개를 RAG에 추가
- Day 4: Track B로 동일 제품 실행
- Day 5: 실패 1개 일부러 만들고 QA가 잡는지 확인
- Day 6: 템플릿/문장 정리해서 팀 공유
- Day 7: 다음 제품으로 반복(SSOT만 바꿔서)

---

## 부록: 바로 가져가서 쓰는 파일들

- SSOT 템플릿: `publy_april_pitch/automation_kit/ssot_template.yaml`
- Track A 마스터 프롬프트: `publy_april_pitch/automation_kit/prompts/00_orchestrator.md`
- Track B 번들: `publy_april_pitch/automation_kit/prompt_bundle.md`
- 트러블슈팅: `publy_april_pitch/automation_kit/troubleshooting.md`
- 데모 캡처 메모: `publy_april_pitch/demo/apple/EVIDENCE_NOTES.md`
