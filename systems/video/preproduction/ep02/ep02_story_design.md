# EP02 스토리 설계 — "Spec-Driven Dev가 뭔대"

Phase 0 승인: 완료. 시리즈 리프레임 v2.0 기반.

---

## 정보 경로 (Information Path)

> 대본의 뼈대. 모든 세그먼트는 이 경로를 따른다.

```
시청자가 아는 것: 바이브코딩 = AI와 함께 만들기 (EP01에서 배움)
       ↓
정보 1: "같이 만들자"고 했는데 AI가 5가지 다른 걸 만들었다
       ↓
정보 2: 왜? 방향을 안 줬으니까. AI에게 맥락이 없다.
       ↓
정보 3: 방향 = 스펙. 근데 100페이지가 아니라 3줄이면 된다.
       ↓
정보 4: 이 도구들로 이렇게 쓰면 된다 (CLAUDE.md, 템플릿, spec-kit)
```

### 세그먼트-정보 매핑

| 세그먼트 | 정보 | 비주얼 |
|---------|------|--------|
| HOOK | EP01 리캡 → "시켰더니 5가지 다른 게 나왔다" | EP01 마지막 장면 → 5분할 화면 |
| MISCONCEPTION | "자세히 말하면 되지 않나?" → 더 꼬임 | Vee 긴 프롬프트 타이핑 → 더 이상한 결과 |
| THE_CRACK | 10,847줄 카운터 + 4,200줄 빨간색 분리 | 숫자 카운터 애니메이션 + 빨간 블록 분리 |
| CORE | 건물 메타포(25초) + 3줄 스펙 + Before/After(30초) + CLAUDE.md(15초) + spec-kit(15초) | 메타포 → 템플릿 화면 → 도구 화면 |
| REFRAME | "좌절이 곧 스펙이다" | 짜증 메모 → 스펙으로 변환 비주얼 |
| OUTRO_CTA | 3줄 스펙 템플릿 화면 + 행동 유도 | 템플릿 화면 캡처 + Vee 적기 시작 |

### 비주얼 코미디 비트 리스트

| 세그먼트 | 비주얼 개그 |
|---------|-----------|
| HOOK | EP01 Vee 미소 → 컷 → 5개 모니터에 5개 다른 결과 → Vee 멘붕 |
| MISCONCEPTION | Vee가 프롬프트를 점점 길게 씀 (줌아웃: 화면 밖까지 텍스트) → 결과: 더 이상해짐 |
| THE_CRACK | 숫자 카운터 빠르게 올라감 (10,847) → 절반이 빨갛게 변함 (4,200) → Vee 후드 뒤집어씀 |
| CORE | 건물 메타포: 청사진 없이 쌓기 → 붕괴 vs 메모 한 장 → 건물 완성 |
| OUTRO_CTA | Vee가 종이에 3줄 적음 → AI에게 보여줌 → 이번엔 비슷한 결과 나옴 → 고개 끄덕 |

---

## Story Circle — EP02

### 1. YOU (일상) → HOOK 시작

> EP01에서 바이브코딩을 배운 Vee. "이번엔 제대로 해보자." 자신감.

### 2. NEED (욕구) → HOOK 끝

> AI에게 시켰는데 5가지 다른 게 나왔다. "왜 매번 다르지?"

### 3. GO (진입) → MISCONCEPTION

> "자세히 말하면 되겠지." 프롬프트를 길게, 디테일하게 쓴다. 결과는... 더 꼬인다.

### 4. SEARCH (탐색) → THE_CRACK

> 코드를 들여다보니 10,847줄. 절반이 중복. 5개 AI 세션이 각각 따로 만들었다.

### 5. FIND (발견) → CORE

> 방향이 없었다. 스펙 = 설계도. 근데 100페이지가 아니라 3줄이면 된다. Goal / Constraints / Done-when.

### 6. TAKE (대가) → CORE 후반

> "자세히 말하기"를 포기한다. 대신 3줄을 적는다.

### 7. RETURN (복귀) → REFRAME

> 짜증을 정리하면 그게 스펙이 된다. "좌절이 곧 스펙이다."

### 8. CHANGE (변화) → OUTRO_CTA

> Vee가 3줄 스펙을 적고 AI에게 건넨다. 이번엔 결과가 비슷하게 나온다. 완벽하진 않지만 방향은 맞다.

### Opening Image ↔ Final Image

- **오프닝**: EP01 마지막 장면의 Vee 미소 → 컷 → 5개 다른 결과물에 멘붕.
- **파이널**: Vee가 3줄 적힌 종이를 모니터 옆에 붙임. AI 결과를 보며 고개 끄덕.

---

## Story Spine — EP02

```
Once upon a time, Vee learned that vibe coding means building WITH AI.
Every day, she gave the AI tasks, expecting consistent results.
One day, five sessions produced five completely different outputs.
Because of that, she tried being more detailed — which made it worse.
Because of that, she discovered that direction, not detail, is what AI needs.
Until finally, she learned that a spec is just three lines: goal, constraints, done-when.
Ever since, she writes three lines before writing any prompt.
```

---

## 감정 트래커 — EP02

| 경계 | Vee 감정 | 나레이터 톤 |
|------|---------|-----------|
| HOOK 진입 | 자신감 — EP01에서 배웠으니 | 가볍고 자신감 |
| HOOK 퇴장 | 혼란 — 5가지 다른 결과? | 서스펜스 |
| MISCONCEPTION 진입 | 결의 — "자세히 말하면 되겠지" | 에너지 업 |
| MISCONCEPTION 퇴장 | 좌절 — 더 꼬였다 | 좌절 공감 |
| THE_CRACK 진입 | 충격 — 10,847줄?! | 숫자의 무게 |
| THE_CRACK 퇴장 | "왜?" — 호기심 | 진지, 탐구 |
| CORE 진입 | 집중 — 배우는 자세 | 차분한 설명 |
| CORE 퇴장 | 명확함 — "3줄!" | 확신, 가벼움 |
| REFRAME | 깨달음 — 짜증 = 데이터 | 반전 톤 |
| OUTRO_CTA | 자신감 — 이번엔 해볼 수 있겠다 | "해봐." |

### 6-세그먼트 교차 검증

**SERIES_BIBLE C8**: Hook → Misconception → The_Crack → Core → Reframe → Outro_CTA
**이 설계**: ✅ 6세그먼트 순서 일치

**SERIES_BIBLE C11 (Actionable Takeaway)**: 3줄 스펙 작성
**이 설계**: ✅ Outro_CTA에 3줄 스펙 템플릿 + 행동 유도

---

## 소재 창고 매핑

| 세그먼트 | 소재 출처 | 뽑은 데이터 |
|---------|----------|------------|
| HOOK | EP01 마지막 장면 + act1 | 5개 결과 다른 비주얼 |
| MISCONCEPTION | 리서치 | "자세히 말하면 된다" 착각, 긴 프롬프트 예시 |
| THE_CRACK | act1-en.md | 10,847줄, 4,200줄 중복, 5개 에이전트 |
| CORE (메타포) | 기존 EP01 건물 메타포 | 청사진 O vs X (25초 압축) |
| CORE (스펙) | 058 + 004 | 3줄 스펙, spec-kit, CLAUDE.md |
| CORE (시연) | 리서치 | Before/After 비교 화면 |
| REFRAME | 058 | "좌절이 곧 스펙이다" |
| OUTRO_CTA | — | 3줄 스펙 템플릿 화면 |
