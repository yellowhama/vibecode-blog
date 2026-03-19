# 주제 카드 — EP02

## 주제
> 스펙 기반 개발 (Spec-Driven Dev)

## 세 가지

| | 내용 |
|--|------|
| **뭔지** | 코드 전에 "뭘 만들 건지" 3줄로 적는 것. Goal / Constraints / Done-when. |
| **없으면** | 5개 세션이 5가지 다른 결과. 프롬프트 길게 쓸수록 더 꼬임. |
| **있으면** | 첫 시도가 방향에 가깝고, 두 번째에 맞아떨어짐. |

## 3막 구조

| 막 | 전달 | 형식 | 소재 |
|----|------|------|------|
| 1막 (없으면) | 스펙 없이 AI에게 시키면 이렇게 된다 | 시트콤 | Vee가 캔들숍 5번 만들어서 5가지 다른 결과 |
| 2막 (뭔지) | 스펙은 3줄이면 된다 | 해설 | 5 buildings 메타포 + 3줄 템플릿 + spec-kit |
| 3막 (있으면) | 스펙 있으면 첫 시도부터 수렴한다 | 시트콤 | Vee가 3줄 적고 → 결과가 수렴 |

## Vee의 변화
- **착각** (시작): "자세히 말하면 되겠지"
- **깨달음** (끝): "3줄이면 방향이 잡힌다"

## 쇼츠 후보
1. HOOK — "Five prompts. Five completely different things." (20s)
2. CORE — "Three lines is enough: Goal / Constraints / Done-when" (15s)
3. REFRAME — "Frustration IS the spec" (15s)

## 내러티브 구조
- [x] Problem-Solution

## 상태
- [x] Phase 0: 주제 정의
- [x] Phase 0.5: 주제 리서치 — `ep02_topic_brief.md`
- [x] Phase 2: Fountain 집필 — `ep02_script_v7.fountain`

## 데이터 포인트
- 10,847줄 코드, 4,200줄(39%) 중복 — 스펙 없이 5에이전트 독립 빌드
- Boehm 비용 곡선: 프로덕션 수정 비용 = 요구사항 단계의 100x
- Standish CHAOS 2020: IT 프로젝트 66% 실패, #1 원인 = 불완전 요구사항
- "Intent is source of truth, not code" — GitHub spec-kit
