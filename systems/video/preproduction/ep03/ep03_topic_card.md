# 주제 카드 — EP03

## 주제
> 도메인 분리 / 아키텍처 (관심사 분리)

## 세 가지

| | 내용 |
|--|------|
| **뭔지** | 코드를 역할별로 나누는 것. 벽이 있는 아파트. |
| **없으면** | 한 줄 고치면 세 군데 터짐. 주방 건드렸는데 침실이 불탐. |
| **있으면** | 고치는 범위가 한 방에서 끝남. 옆 방은 안전. |

## 3막 구조

| 막 | 전달 | 형식 | 소재 |
|----|------|------|------|
| 1막 (없으면) | 모놀리스 app.js에 전부 넣으면 이렇게 된다 | 시트콤 | Vee가 한 줄 수정 → 세 군데 에러 |
| 2막 (뭔지) | 도메인 = 벽 → 벽이 있어야 화재가 안 번진다 | 해설 | 아파트 메타포 + 5도메인 분리 다이어그램 |
| 3막 (있으면) | 벽 세우면 고칠 때 안 무너진다 | 시트콤 | Vee가 도메인 분리 후 → 한 폴더만 수정 → 나머지 안전 |

## Vee의 변화
- **착각** (시작): "파일 하나에 다 넣으면 되지"
- **깨달음** (끝): "벽이 있어야 고칠 때 안 무너진다"

## 쇼츠 후보
1. HOOK — "She fixed one line. Three things broke." (20s)
2. CORE — Apartment without walls → fire spreads everywhere (15s)
3. REFRAME — "Walls don't slow you down. They let you move fast." (15s)

## 내러티브 구조
- [x] Problem-Solution

## 상태
- [x] Phase 0: 주제 정의
- [x] Phase 2: Fountain 집필 — `ep03_script_v6.fountain`
- [ ] Phase 0.5: 주제 리서치 — `ep03_topic_brief.md`

## 데이터 포인트
- 커플링 메트릭: 모놀리스 시스템 장애 전파율 vs 모듈 시스템
- Martin Fowler: "Modularity is the key to managing complexity"
- 모놀리스 app.js 안티패턴 — vibe coder가 가장 흔히 빠지는 함정
- EP02 콜백: SSOT 파일이 있지만 프로젝트가 커지면서 구조가 붕괴
