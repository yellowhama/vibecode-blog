# Apple Demo Evidence Notes (퍼블리 원고 캡처/전후/시간)

이 문서는 "원고에 바로 넣을 증거"를 빠르게 만들기 위한 메모입니다.

## 1) 이 데모에서 쓴 runs 폴더(어떤 게 뭔지)

- Track A 1차(정보 거의 없음):
  - `demo/apple/runs/20260301_160000_apple_example_trackA_1/`
- Track A 2차(질문 답변 반영된 SSOT):
  - `demo/apple/runs/20260301_162000_apple_example_trackA_2/`
- Track B 1차(RAG 룰 적용, 안전한 TODO 템플릿):
  - `demo/apple/runs/20260301_164000_apple_example_trackB_1/`
- (선택) FAILURE DEMO(QA가 금칙어를 잡는 캡처용):
  - `demo/apple/runs/20260301_166000_apple_example_failure_demo/`

## 2) 캡처 4장(최소) 추천 + 캡처 포인트

캡처 이미지 저장 위치:
- `demo/apple/captures/`

1) "다음 루프 질문" 캡처
- 파일: `Track A 1차/02_questions_to_answer.md`
- 이미지: `demo/apple/captures/CAP-01_questions_trackA1.png`
- 포인트: 질문 10개 전체가 보이게
- 전달 메시지(원고용 1문장): "AI가 초안을 만든 다음, 품질이 가장 크게 올라가는 질문만 10개로 뽑아준다."

2) "페이지가 보이는 순간(와이어프레임)" 캡처
- 파일: `Track A 1차/05_wireframe.md`
- 이미지: `demo/apple/captures/CAP-02_wireframe_trackA1_hero_proof.png`
- 포인트: `Hero` + `Proof` 섹션만 캡처(IMG-... + 메시지/샷/캡션/alt가 보이게)
- 전달 메시지(원고용 1문장): "예쁜 디자인이 아니라, 글과 사진이 같이 흐르는 '블록 배치'를 자동으로 고정한다."

3) "사진이 없을 때의 해결 루프(샷리스트)" 캡처
- 파일: `Track A 1차/08_shot_list.md`
- 이미지: `demo/apple/captures/CAP-03_shot_list_trackA1.png`
- 포인트: 필수 3장 + 라벨/중량 증명 샷이 보이게
- 전달 메시지(원고용 1문장): "사진이 부족하면 멈추는 게 아니라, 다음에 찍을 10분 샷리스트가 바로 나온다."

4) "안전장치(QA)" 캡처
- 파일: `Track B 1차/09_qa_report.md` (또는 `Track A 2차/09_qa_report.md`)
- 이미지: `demo/apple/captures/CAP-04_qa_trackB1_safe_fail.png`
- 포인트: "가격/정책/수치 발명 금지" + TODO 템플릿이 보이게
- 전달 메시지(원고용 1문장): "AI가 과장하기 쉬운 부분은 QA가 잡고, 모르면 TODO 템플릿으로 안전하게 실패한다."

5) (선택) "QA가 금칙어를 잡는 장면" 캡처
- 파일: `FAILURE DEMO/04_copy_deck.md` + `FAILURE DEMO/09_qa_report.md`
- 이미지: `demo/apple/captures/CAP-05_qa_failure_demo_forbidden.png`
- 포인트: `최고/100%/무조건`이 QA에서 FAIL로 잡히는 부분 + 교체 문장
- 전달 메시지(원고용 1문장): "금칙어를 일부러 넣으면, QA가 바로 잡고 안전한 문장으로 바꿔준다."

## 3) 전/후 차이(원고에 넣기 좋은 1문장 후보)

- Track A 1차 -> 2차:
  - "가격/구성/정책이 TODO에서 실제 문장으로 바뀌면서, QA 결과가 FAIL에서 PASS로 바뀐다."
- Track A 1차 -> 2차:
  - "Hero의 메시지가 '사과'에서 '2kg(10과) 박스/가격'처럼 구체 정보로 바뀐다."
- Track A 1차 -> Track B:
  - "정보가 비어 있어도, RAG 룰이 있어서 '근거 없는 말'을 발명하지 않고 안전하게 초안이 나온다."

## 4) 시간 기록 템플릿(대략이라도)

주의: 아래 시간은 아직 "실제 측정 전"이라 **예상치**입니다. 원고 제출 전에는 본인 측정값으로 교체하는 걸 권장합니다.

| 실행 | 소요(분) | 메모 |
|---|---:|---|
| Track A 1차 | 8~12 (예상) | `ssot.yaml` 거의 비움 |
| Track A 2차 | 6~10 (예상) | `ssot_round2.yaml` 반영 |
| Track B 1차 | 10~15 (예상) | 번들 생성(build_index/make_prompt_bundle) 포함(2~5분) + 실행 |

추천:
- Track B는 "번들 생성" 시간을 별도로 적어두면 설득력이 좋아집니다.
