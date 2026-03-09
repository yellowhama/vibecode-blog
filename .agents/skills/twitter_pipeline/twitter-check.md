---
description: "트위터 큐 파일 규칙 검증 리포트"
argument-hint: "[queue-file-path | all]"
allowed-tools: ["Read", "Glob", "Grep", "Task"]
---

# Twitter Check — 검증

트위터 큐 파일의 트윗 내용을 모든 규칙에 대해 검증하고 리포트를 생성한다.

## 대상

- 큐 파일 경로: $ARGUMENTS
- 인자가 없으면 `systems/twitter/queue/` 의 모든 활성 JSON 파일 (archive 제외)

## 프로세스

1. 대상 큐 파일을 읽는다
2. 아래 레퍼런스 파일을 읽는다:
   - `branding/voice.md` §7 — 금지 표현 목록
   - `branding/examples.md` — 광고 카피 체크리스트 (§4)
   - `systems/twitter/strategy/STRATEGY.md` — 나이키 룰, 페르마 구조, 행동이 전면, 기술적 가치 필터
3. 각 트윗에 대해 아래 9가지 검증을 수행한다
4. 결과를 테이블 형태로 보고한다

## 검증 항목

### 1. 금지 표현 (자동)
큐 파일 내 `content` 배열에서 아래 표현을 grep한다:
- game-changer, deep dive, unpack
- Furthermore, In conclusion, It should be noted
- utilize, facilitate, leverage
- "I think maybe", "I write about", "In this article"

### 2. 링크/CTA (자동)
- http, https, .com, .town, .pro
- "check out", "read more", "more at", "link in bio"

### 3. 시간 참조 (자동)
- "six months", "months", "weeks", "months ago", "weeks ago" (case-insensitive)
- 숫자+시간 패턴: "\d+ months", "\d+ weeks"

### 4. "4줄" 표현 (자동)
- "four lines", "4줄", "four-line"

### 5. 광고 카피 신호 (판단)
각 쓰레드에 대해:
- Setup→twist→teach→CTA 공식 구조인가?
- 숫자를 나열해서 인상적으로 보이려는 의도가 있나?
- "I write about..." / "I'm building..." 자기소개 프레이밍인가?
- 깔끔하게 정리된 교훈이 있나?
- **테스트**: "이거 광고 같냐?" — 같으면 FAIL

### 6. 페르마 구조 (판단)
각 쓰레드의 첫 트윗:
- 타임라인에서 쓰레드 없이 보여도 독립적으로 성립하는가?
- 하나의 아이디어를 1/2/3으로 쪼갠 게 아닌가?

### 7. 서사 연결 (판단)
쓰레드 간 브릿지:
- 이전 쓰레드 끝 → 다음 쓰레드 시작이 자연스럽게 연결되는가?
- 독자가 모르는 제품/개념이 갑자기 등장하지 않는가?

### 8. 글자 수 (참고)
각 트윗의 글자 수를 리포트한다. 경고 임계값 없음, 참고용.

### 9. 톤 체크 (판단)
- Bukowski grit가 유지되는가?
- 격식체("Furthermore", "However", "It should be noted")가 침투하지 않았는가?
- Mode A (싸지르기) 톤이 유지되는가?

## 출력

테이블 형태 리포트:

```
| 파일 | 쓰레드 | 검증 항목 | 결과 | 상세 |
|------|--------|----------|------|------|
| w10-act1.json | Thread 1 | 금지 표현 | PASS | |
| w10-act1.json | Thread 1 | 링크/CTA | PASS | |
| ... | ... | ... | ... | ... |
```

- **PASS**: 통과
- **FAIL**: 실패 (구체적 위치와 문제 내용 명시)
- **WARN**: 주의 (판단 필요)

마지막에 전체 요약: 총 검증 N건, PASS N건, FAIL N건, WARN N건.
