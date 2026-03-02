---
description: "블로그 포스트 voice/narrative 규칙 검증 리포트"
argument-hint: "[file-path | all]"
allowed-tools: ["Read", "Glob", "Grep", "Task"]
---

# Blog Check — 검증

블로그 포스트를 모든 규칙에 대해 검증하고 리포트를 생성한다.

## 대상

- 파일 경로: $ARGUMENTS
- 인자가 없으면 `easy_peasy/phase1/` 의 모든 활성 파일 (KO + EN)

## 프로세스

1. 대상 파일을 읽는다
2. 아래 레퍼런스 파일을 읽는다:
   - `branding/voice.md` §7 — 금지 표현 목록
   - `branding/examples.md` §4 — 광고 카피 체크리스트
   - `branding/narrative.md` — 3막 구조, 6비트
3. 각 파일에 대해 아래 10가지 검증을 수행한다
4. 결과를 테이블 형태로 보고한다

## 검증 항목

### 1. 금지 표현 (자동)
파일에서 아래 표현을 grep한다:
- game-changer, deep dive, unpack
- Furthermore, In conclusion, It should be noted
- utilize, facilitate, leverage
- "I think maybe", "I write about", "In this article"

### 2. 시간 참조 (자동)
- "six months", "6개월", "months ago", "weeks ago" (case-insensitive)
- 숫자+시간 패턴: "\d+ months", "\d+ weeks", "\d+개월", "\d+주"

### 3. "4줄" 표현 (자동)
- "four lines", "4줄", "네 줄", "four-line"

### 4. 톤 체크 (판단)
- 격식체가 침투하지 않았는가? ("However", "Furthermore", "Nevertheless")
- 모드 A (싸지르기) / 모드 B (각잡기)가 적절한가?
- 톤 천장 (감튀에 맥주)을 넘지 않는가?
- 구어체 → 격식체 전환이 없는가?

### 5. 이야기 vs 설명 (판단)
- 각 섹션이 "겪은 일"인가 "개념 설명"인가?
- 설명이 전체의 30% 넘으면 WARN
- 설명이 50% 넘으면 FAIL

### 6. 3막 구조 (판단)
- 짜증(Frustration) → 난리(Complication) → 파헤침(Insight) 중 최소 2개가 있는가?
- 순서가 자연스러운가?

### 7. 6비트 체크 (참고)
Scene, Wall, Discovery, Experiment, Before/After, Declaration 중 몇 개 충족?
- 4개 이상: PASS
- 2-3개: WARN
- 1개 이하: FAIL

### 8. 서사 순서 (판단)
- 독자가 모르는 제품/개념이 갑자기 등장하지 않는가?
- 동기(왜 만드는가) → 재앙(망함) → 분석(왜 망했나) 순서가 지켜지는가?

### 9. 광고 카피 테스트 (판단)
- Setup→twist→teach→CTA 공식 구조인가?
- "이거 광고 같냐?" — 같으면 FAIL
- 깔끔하게 정리된 교훈이 있으면 WARN
- 자기소개 프레이밍이 있으면 FAIL

### 10. KO↔EN 일치 (자동)
한국어/영어 버전이 모두 존재하면:
- 씬 수가 일치하는가?
- 섹션 구분자(`---`) 수가 일치하는가?
- 금지 표현을 양쪽 모두 체크했는가?
- 영어 버전의 톤이 한국어보다 올라가지 않았는가? (판단)

## 출력

테이블 형태 리포트:

```
| 파일 | 검증 항목 | 결과 | 상세 |
|------|----------|------|------|
| act2-1-ko.md | 금지 표현 | PASS | |
| act2-1-ko.md | 시간 참조 | FAIL | L45: "6개월 동안" |
| ... | ... | ... | ... |
```

결과 기호:
- **PASS**: 통과
- **FAIL**: 실패 (구체적 위치와 문제 내용 명시)
- **WARN**: 주의 (판단 필요, 개선 제안 포함)

마지막에 전체 요약: 총 검증 N건, PASS N건, FAIL N건, WARN N건.
