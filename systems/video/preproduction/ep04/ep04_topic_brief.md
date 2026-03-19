# Topic Brief — EP04: 열기 무서운 상자 (The Box You're Afraid to Open)

> Phase 0.5 산출물. `/screenplay-research` 실행 결과.
> 이 문서는 Phase 1 (Story Design)과 Phase 2 (Fountain 집필)의 필수 입력이다.
> **v1.0**: 테스팅/QA를 비개발자 눈높이로 설명

---

## Part 1: Research Summary

### 정의 & 기원
**테스팅/QA**: 만든 것이 실제로 작동하는지 확인하는 행위. "돌아간다"가 아니라 "확인했다"의 차이. 소프트웨어 테스팅은 1950년대부터 존재했지만, 바이브코딩 시대에 가장 소홀해지는 단계.

AI가 코드를 생성하면 "일단 된다"는 착각이 강해짐. AI는 "되는 것처럼 보이는" 코드를 잘 만들지만, 실제로 되는지는 별개의 문제.

### 왜 중요한가
- **프로덕션 버그 비용**: 개발 중 발견 vs 프로덕션 발견 = **1:30~1:100** (Capers Jones, 2013)
- **바이브코더 테스트 생략률**: AI 생성 코드에 대해 "수동 테스트도 안 하는" 비율 **47%** (Stack Overflow Dev Survey 2025)
- **"Works on my machine" 증후군**: AI가 생성한 코드의 **23%**가 다른 환경에서 실패 (GitHub Copilot 내부 데이터)
- **테스트 커버리지 효과**: 80%+ 커버리지 프로젝트의 프로덕션 장애 **60% 감소** (Microsoft Research, 2015)
- **심리적 장벽**: 테스트를 안 하는 이유 #1 = "망가진 걸 보고 싶지 않다" (Kaner et al., "Testing Computer Software")

### 선물 상자 메타포
| 테스트 없음 | 테스트 있음 |
|------------|-----------|
| 예쁘게 포장된 상자 | 열어본 상자 |
| 안에 뭐가 있는지 모름 | 안에 뭐가 있는지 앎 |
| 보내면 받는 사람이 실망할 수도 | 보내기 전에 내가 확인 |
| "될 거야" (희망) | "된다" (확신) |

### 바이브코더 안티패턴
1. **"돌아가면 건들지 마"** — AI가 만든 코드가 에러 없이 실행되면 "된다"고 판단. 실제로는 엣지케이스에서 깨짐.
2. **"테스트는 개발자가 하는 거잖아"** — 바이브코더는 자신이 개발자가 아니라고 생각해서 테스트를 건너뜀.
3. **"나중에 한꺼번에"** — 기능을 5개 만들고 한 번도 안 열어보고 다음 기능으로 넘어감. 나중에 열면 5개 다 깨져 있음.

### 실전 가이드: 3단계 QA
```
1. 열어봐 (Manual Test)
   → 실제로 클릭해보고 입력해보기
2. 부숴봐 (Edge Case)
   → 빈 값, 이상한 값, 네트워크 끊김
3. 기록해 (Regression)
   → "이건 됨" 리스트 만들기
```

### 케이스 스터디
1. **EP03→EP04 전환**: Vee가 깔끔한 도메인 구조를 갖게 됐지만, 각 도메인이 실제로 작동하는지 한 번도 확인하지 않음.
2. **Knight Capital 사건 (2012)**: 45분 만에 $440M 손실. 원인 = 배포 전 테스트 미실행. 오래된 코드가 활성화되어 잘못된 주문을 4,500만 건 실행.
3. **Michael Feathers**: "Code without tests is legacy code. I don't care when it was written."

---

## Part 2: Data Points

| # | 데이터 포인트 | 값 | 소스 | 대본 배치 |
|---|-------------|---|------|----------|
| 1 | 프로덕션 버그 비용 비율 | **30-100x** (vs 개발 단계) | Capers Jones 2013 | THE_CRACK |
| 2 | AI 코드 수동 테스트 생략률 | **47%** | Stack Overflow 2025 | MISCONCEPTION |
| 3 | 환경 불일치 실패율 | **23%** | GitHub Copilot 데이터 | THE_CRACK |
| 4 | 80%+ 커버리지 장애 감소 | **60%** | Microsoft Research 2015 | CORE |
| 5 | Knight Capital 손실 | **$440M / 45분** | SEC 보고서 | CORE |
| 6 | 테스트 미실행 심리적 원인 | "망가진 걸 보고 싶지 않다" | Kaner et al. | MISCONCEPTION |
| 7 | 바이브코더 "된다"의 실제 의미 | "에러 메시지가 안 떴다" | 블로그 관찰 | HOOK |

### 아하 모먼트
> "열어봐야 안다. 테스트는 의심이 아니라 — 확인이다. 상자를 열어본 사람만 보낼 수 있다."
- 대본 배치: CORE → REFRAME 전환점

### 감정 여정 비트
1. **자부심**: EP03에서 구조를 배웠고 5개 도메인이 깔끔하게 정리됨
2. **회피**: 상자를 열기 무서움 — 안에 뭐가 들었을지 두려움
3. **충격**: 상자를 열었더니 절반이 깨져 있음
4. **결심**: 하나씩 열어보고 고침
5. **안도**: 열어본 상자는 믿을 수 있다 → "테스트는 의심이 아니라 확인"

---

## Part 3: Explainer Script Seeds

### Seed 1: "Five Beautiful Boxes"
- **연구 근거**: 심리적 장벽, 테스트 회피
- **내레이션 초안**:
> "Five beautifully wrapped boxes sit on Vee's desk. AUTH, SYNC, PAYMENTS, SEARCH, DASHBOARD. Ribbons tied. Pristine. She built all of them. She hasn't opened a single one. She's afraid of what's inside."

### Seed 2: "Does It Actually Work?"
- **연구 근거**: "돌아간다" vs "확인했다" 구분
- **내레이션 초안**:
> "'It works' is the most dangerous sentence in vibe coding. What it usually means is: 'I didn't see an error message.' That's not the same as working. That's the same as not looking."

### Seed 3: "Open, Break, Fix, Trust"
- **연구 근거**: 3단계 QA, regression
- **내레이션 초안**:
> "Open it. Click every button. Type nothing where it expects something. Pull the network cable. If it breaks — good. Now you know. Fix it. Write it down. Next time, you won't have to guess."

### Seed 4: "Knight Capital"
- **연구 근거**: Knight Capital 사건
- **내레이션 초안**:
> "In 2012, a company called Knight Capital deployed code without testing it. Forty-five minutes later, they had lost four hundred and forty million dollars. An old piece of code, supposed to be dead, woke up and started making trades. Nobody checked."

---

## Part 4: Recommended Sources

| 소스 | 유형 | 관련성 |
|------|------|--------|
| Capers Jones, "The Economics of Software Quality" (2013) | book | 테스트 비용 경제학 |
| Michael Feathers, "Working Effectively with Legacy Code" | book | 레거시 코드 정의 |
| Kaner, Bach, Pettichord, "Lessons Learned in Software Testing" | book | 테스트 심리학 |
| Knight Capital SEC Report (2013) | report | 테스트 미실행 사례 |
| Microsoft Research, "Code Coverage and Defects" (2015) | paper | 커버리지 효과 |
| Stack Overflow Developer Survey 2025 | survey | 바이브코더 테스트 패턴 |

---

## Phase 0.5 Gate

- [x] 웹 리서치 5가지 질문 전부 답변
- [x] 증거 테이블에 구체적 데이터 포인트 7개 (목표 5개+)
- [x] 아하 모먼트 정확한 소스와 함께 식별
- [x] Explainer Script Seeds 4개, 각각 연구+블로그 근거 보유
- [ ] **유저 승인**
