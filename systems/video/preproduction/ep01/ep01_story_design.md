# EP01 스토리 설계 — "Just Build It"

Phase 0 승인: 완료. 주제 카드 `ep01_topic_card.md` 기반.

---

## 정보 경로 (Information Path)

> 대본의 뼈대. 모든 세그먼트는 이 경로를 따른다.

```
시청자가 아는 것: AI한테 시키면 만들어준다
       ↓
정보 1: 뭘 만들 건지 안 정하고 시키면 → 일단 되긴 된다 (위험한 착각)
       ↓
정보 2: 근데 터진다. 왜? → 뭘 만드는 건지 모르니까 고칠 수가 없다
       ↓
정보 3: "뭘 만들 건지" 정하는 게 스펙이다 (설계도 메타포)
       ↓
정보 4: 스펙이 있으면 → 터져도 뭘 고쳐야 하는지 안다
```

### 세그먼트-정보 매핑

| 세그먼트 | 정보 | 비주얼 |
|---------|------|--------|
| HOOK | 정보 1 결과 미리보기: "It works!" → 3초 후 폭발 | Vee 자축 → 에러 |
| SITCOM1 | 정보 1: 바이브코딩 = "시키면 된다" 착각 + 정보 2: 터지면 뭘 해야 할지 모름 | Vee 몽타주 + Bee 리액션 |
| EXPLAINER | 정보 3: 스펙 = 설계도 (없으면 무너진다) | 추상 메타포 — 설계도 vs 무작위 쌓기 |
| SITCOM2 | 정보 2→4: 왜 터졌는지 깨달음 | Vee가 "뭘 만들 건지" 적는다 |
| ENDING | 정보 4: 터져도 방향은 안다 | HOOK 거울 — 같은 에러, 다른 반응 |

### 비주얼 코미디 비트 리스트

| 세그먼트 | 비주얼 개그 |
|---------|-----------|
| HOOK | Vee 눈=달러 자축 → 3초 후 모니터 전부 빨간색 → 멘붕 표정 |
| SITCOM1 | 몽타주: build → "It works!" 반복 x3 (점점 빨라짐) / Bee 무표정으로 팻말 들기 "What are you building?" |
| SITCOM2 | Vee 키보드 이단옆차기(상상) → 실제로는 한숨 쉬며 종이 꺼냄 / 에러 메시지가 한 줄만 하이라이트되며 읽힘 |
| ENDING | HOOK 구도 정확 재현 → 종이 한 장 핀 꽂기 / Bee 고개 끄덕 0.5초 → 즉시 무표정 |

---

## Story Circle — EP01

### 1. YOU (일상) → HOOK 시작

> Vee는 "AI한테 시키면 뭐든 만들 수 있다"고 믿는다. 빠르게 뭔가를 만들었다. 자축 중.

### 2. NEED (위기) → HOOK 끝

> 전부 터진다. 에러가 쏟아진다. 읽을 수 없다. 뭐가 틀렸는지 모른다.

### 3. GO (진입) → SITCOM ACT 1 시작

> 3일 전. Vee의 바이브코딩 몽타주 — "Make me a ___" → "It works!" 반복. 뭘 시키든 된다. 위험한 착각.

### 4. SEARCH (몸부림) → SITCOM ACT 1 끝

> Bee가 등장. 팻말로 "What are you building?" Vee: 대답 못함. Bee: 팻말 뒤집기 "Exactly." 떠남.

### 5. FIND (발견) → EXPLAINER

> 설계도 메타포. 설계도 없이 쌓으면 무너진다. 스펙 = 설계도 = "뭘 만들 건지" 적어둔 것.

### 6. TAKE (대가) → SITCOM ACT 2 시작

> Vee가 코딩을 멈춘다. 키보드에서 손을 뗀다. "일단 만들자" 태도를 포기. 대신 종이에 뭘 하고 싶은지 적기 시작.

### 7. RETURN (복귀) → SITCOM ACT 2 끝

> 적다 보니 "뭘 만들 건지"가 나온다. 종이를 들고 모니터를 보니 — 아까 읽을 수 없던 에러가 한 줄 읽힌다.

### 8. CHANGE (변화) → ENDING

> **Step 2와 같은 장면.** 모니터. 에러. 하지만 당황하지 않는다. 종이 한 장을 핀으로 꽂는다. Bee 고개 끄덕 0.5초.

### Opening Image ↔ Final Image

- **오프닝**: Vee가 모니터 앞에서 두 팔 벌려 자축. 초록 불. 세상 다 가진 표정.
- **파이널**: 같은 모니터. 빨간 에러. 하지만 당황 대신 **종이 한 장을 들고 있다**. 차분.

---

## Story Spine — EP01

```
Once upon a time, Vee believed AI could build anything if you just asked.
Every day, she typed "build me a ___" and it worked.
One day, everything broke at once.
Because of that, she couldn't fix it — she didn't even know what she'd built.
Because of that, she stopped coding and started writing down what she actually wanted.
Until finally, the same error messages started to make sense.
Ever since, the errors are still there, but now she knows what to fix.
```

---

## 감정 트래커 — EP01

| 경계 | Vee 감정 | Bee 감정 | 관계 상태 |
|------|---------|---------|----------|
| HOOK 진입 | 자신만만 100% | (미등장) | 남남 |
| HOOK 퇴장 | 충격 + 당황 | (미등장) | 남남 |
| SITCOM1 진입 | 자신감 회복 (몽타주) | 무관심 | Bee 존재 인지 전 |
| SITCOM1 퇴장 | 혼란 — 대답 못함 | "Exactly." 떠남 | 일방적 |
| EXPLAINER | (없음) | (없음) | n/a |
| SITCOM2 진입 | 빡침 극대화, 코딩 멈춤 | (미등장) | — |
| SITCOM2 퇴장 | 짜증 → 작은 깨달음 | 멀리서 관찰 | 인정 0.5초 |
| ENDING | 결연 + 차분 | 고개 끄덕 → 무표정 | 첫 접점 |

### 시리즈 바이블 교차 검증

**바이블 EP01 아크**: "자신만만 → 충격", Vee 첫 바이브코딩 성공 → 전부 폭발
**대본 아크**: 자신만만(HOOK) → 충격(HOOK) → 혼란(SITCOM1) → 빡침(SITCOM2) → 차분(ENDING)
→ 일치.

**바이블 Bee EP01**: 적대적, Vee 무시, 귀찮음 폭발
**대본 Bee**: 팻말 "What are you building?" → "Exactly." 퇴장 → ENDING 고개 끄덕
→ 일치. 대사 없이 비주얼로만 전달.

---

## 소재 창고 매핑

| 세그먼트 | 소재 출처 | 뽑은 장면 (보편화) |
|---------|----------|------------------|
| HOOK | act1-1 후반 | 빌드 성공 → 에러 폭발 (구체 도구명 제거) |
| SITCOM1 | act1-1 전반 + act1-2 | 바이브코딩 몽타주 — "뭐든 된다" 착각 |
| EXPLAINER | 메타포 라이브러리 Act1-#1, #2, #9 | 설계도 vs 무작위 쌓기 + MVP 스케이트보드 |
| SITCOM2 | act1-1 "나는 대체 뭘 만들고 있는 거지?" | 짜증 적기 → "뭘 만들 건지" 발견 |
| ENDING | act1-2 반전 | 같은 에러, 이제 읽힌다 |
