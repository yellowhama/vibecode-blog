# 주제 카드 — EP04

## 주제
> 테스팅/QA — 열기 무서운 상자

## 세 가지

| | 내용 |
|--|------|
| **뭔지** | 만든 것이 진짜 되는지 열어보는 것. 선물 상자를 뜯어보는 것. |
| **없으면** | 다 만들고도 되는지 모름. 선물 상자가 봉인 상태로 쌓임. |
| **있으면** | 열어봤으니 안다. 안 되는 건 바로 고침. |

## 3막 구조

| 막 | 전달 | 형식 | 소재 |
|----|------|------|------|
| 1막 (없으면) | 테스트 안 하면 이렇게 된다 | 시트콤 | Vee가 5개 상자를 예쁘게 포장 → 하나도 안 열어봄 |
| 2막 (뭔지) | 테스트 = 상자를 여는 것 → 안에 뭐가 있는지 확인 | 해설 | 선물 상자 메타포 + "does it work?" 체크리스트 |
| 3막 (있으면) | 열어본 상자는 믿을 수 있다 | 시트콤 | Vee가 상자 하나씩 열어봄 → 일부 깨짐 → 고침 → 안심 |

## Vee의 변화
- **착각** (시작): "돌아가면 건들지 마" (If it works, don't touch it)
- **깨달음** (끝): "열어봐야 안다"

## 쇼츠 후보
1. HOOK — "Five beautiful boxes. She hasn't opened a single one." (20s)
2. CORE — Open the box → it's broken inside → fix it → relief (15s)
3. REFRAME — "Testing isn't doubt. Testing is care." (15s)

## 내러티브 구조
- [x] Problem-Solution

## 상태
- [x] Phase 0: 주제 정의
- [x] Phase 2: Fountain 집필 — `ep04_script_v6.fountain`
- [ ] Phase 0.5: 주제 리서치 — `ep04_topic_brief.md`

## 데이터 포인트
- 테스트 없이 배포 시 프로덕션 버그 발견 비용 = 개발 단계의 30-100x
- vibe coder 안티패턴: "It works" = "I haven't checked"
- EP03 콜백: 깔끔한 도메인 구조가 있지만 검증하지 않은 상태
- "Code without tests is legacy code" — Michael Feathers
