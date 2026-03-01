# Twitter Reference — 참고자료

> 전략은 `STRATEGY.md`. 여기는 참고용 데이터만.

---

## 1. X 알고리즘 팩트 (소스코드 검증)

2026-01-20 공개된 X 알고리즘 오픈소스 기준.

### 확인된 시그널

**긍정 (점수 올림):**
- favorite, reply, retweet, quote, click, profile_click
- vqv (video quality view — 최소 길이 필요)
- share, share_via_dm, share_via_copy_link
- dwell + dwell_time (체류 시간)
- follow_author

**부정 (점수 내림):**
- not_interested, block_author, mute_author, report

### 확인된 메커니즘

| 메커니즘 | 설명 |
|----------|------|
| AuthorDiversityScorer | 같은 저자 반복 시 지수 감소 |
| OONScorer | 팔로우 안 한 계정 콘텐츠 별도 가중 |
| AgeFilter | 시간 경과 시 하드 컷오프 (점진 감소 아님) |
| Phoenix Scorer | Grok 기반 트랜스포머 랭킹 |

### 2023 데이터 (현재 코드에선 가중치 모듈 비공개)

- Reply 가중치 = 13.5
- Reply + Reply-back = 75.0 (Like 대비 150배)
- Quote, Repost 가중치 = 미확인

### 틀린 것

- 감정 분석(sentiment) 모듈 → 없음
- 6시간 반감기 시간 감소 → 하드 컷오프임

### 실용 참고

- Premium: 도달 4-8배 부스트 (Buffer 18.8M 포스트 분석: 비프리미엄 대비 10x)
- 리플라이 체인: 알고리즘 고가중 (reply_score 별도)
- 영상: vqv_score 별도 존재 (최소 길이 충족 필요)
- 외부 링크: 30-50% 페널티 (비프리미엄 링크 포스트는 사실상 도달 0)
- 링크 없는 포스트: +270% 뷰 증가 (Buffer 연구)
- 리트윗 1개 = 좋아요 20개 (알고리즘 가중치)
- 2025.10: X가 링크 페널티 공식 제거 발표 → 하지만 실제 효과는 아직 불명확
- 비프리미엄 링크 포스트: 2025.03 이후 중간값 engagement **0** (사실상 필수: X Premium)

### 콘텐츠 형식별 참여 배수 (Buffer/연구 종합)

| 형식 | 텍스트 대비 | 비고 |
|------|-----------|------|
| 텍스트만 | 1x (기준) | |
| 이미지 | 3x | |
| GIF | 6x | |
| 영상 | 9x | 리트윗 150% 증가 |
| 스레드 | 프로필 방문 60%↑ | 단일 트윗 대비 |

### X 플랫폼 현실 (2025~2026)

| 팩트 | 수치 |
|------|------|
| 오가닉 도달률 | ~3% |
| Premium 도달 배수 | 비프리미엄 대비 10x |
| 50+ 리플라이/일 → 임프레션 | 8K+/일, 4주간 550K |
| 퍼널: 임프레션 → 클릭 → 전환 | 10K → 100 (1%) → 1 (1%) |

---

## 1b. 롤모델 아카이브 — 따라하면 안 되는 이유 포함

### Tier 1: 제품으로 먹고 사는 사람들

| 이름 | 핸들 | 팔로워 | 매출 | 핵심 |
|------|------|--------|------|------|
| Pieter Levels | @levelsio | 500K | $3M/yr | 매출 스크린샷, "1.Ship 2.Ship", PHP 14K줄, 실시간 빌딩 로그 |
| Tony Dinh | @tdinh_me | 130K | $45K/mo | BlackMagic.so→$128K exit, TypingMind→$500K. 100→10K 6개월 |
| Marc Lou | @marc_louvion | ~100K | $100K+ | "Ship Fast" 슬로건, 뉴스레터 CTA, 매출 업데이트 |

**공통점:**
- 이미 팔 제품 있음 (런칭 완료, 매출 발생 중)
- 트윗 = 제품 업데이트 + 매출 공유 + 유저 피드백 루프
- "Build in Public" = 실시간 매출 성장 다큐멘터리
- 숫자가 있음 (MRR, 유저 수)

**Pieter Levels 트윗 패턴:**
- 매출 트윗: "📈 $52,843/mo" (구체적 숫자 + 제품별 분류)
- 빌딩 로그: "PhotoAI.com is now 14,000 lines of raw PHP" (기술 스택 공개)
- 런칭: "has now gone from $0 to $1M ARR in 17 days!" (마일스톤)
- 매일 1개 실질 포스트 + 여러 개 가벼운 리플라이/리트윗

### Tier 2: 기술 영향력자

| 이름 | 핸들 | 팔로워 | 핵심 |
|------|------|--------|------|
| Andrej Karpathy | @karpathy | 1.7M | "shower thoughts" 트윗, "vibe coding" 코인, 교육 영상 |
| Simon Willison | @simonw | 132K | 블로그+TIL+오픈소스, GitHub 스폰서, X 수익 공유 |
| McKay Wrigley | @mckaywrigley | 225K | AI 도구 데모 공유, Takeoff AI 운영 |

**공통점:**
- 전문 분야에서 이미 신뢰 있음
- 트윗 = 자기가 발견/실험한 것을 공유
- 팔로워가 트윗을 보러 옴 (역방향)

### @lazy_genius2025과의 차이 — 왜 따라하면 안 되나

| | Pieter/Tony/Marc | Karpathy/Willison | @lazy_genius2025 |
|--|-----------------|-------------------|------------------|
| 제품 | 런칭됨, 매출 있음 | 오픈소스/교육 | 개발 중, 매출 없음 |
| 팔로워 | 100K+ | 130K~1.7M | 소수 |
| 공유할 숫자 | MRR, 유저 수 | 논문 인용, star 수 | 없음 |
| 신뢰 기반 | 매출 = 증거 | 이력 = 증거 | 블로그 = 유일한 증거 |

**이 사람들의 트윗 스타일을 복제하면 안 되는 이유:**
- 매출 스크린샷을 공유하려면 매출이 있어야 함
- "just shipped" 트윗을 하려면 ship한 제품이 있어야 함
- 기술 insight를 공유하려면 그 분야에서 인정받은 이력이 있어야 함
- 지금 할 수 있는 건: 삽질 기록 + 리플라이 대화

---

## 2. 소재 아카이브

이번 주에 뭐 했는지에서 출발하되, 막히면 여기서 참고.
비율 배정 없음. 이야기 흐름(Beat) 순서로 정리.

### Beat 1: 짜증 — "이런 게 있으면 좋겠는데 없다"

핀 트윗이 이미 커버. 추가 트윗은 구체적 에피소드.

| ID | 소재 | 원천 |
|----|------|------|
| A11 | "짜증이 곧 스펙이다" — KVM, RDP, 클라우드 전부 시도 → 다 반쪽 | frustration-is-the-spec.md |

### Beat 2: 시작 — "코딩 못하는데 만들기로 함"

| ID | 소재 | 원천 |
|----|------|------|
| A8 | 스펙 없이 빌드하면 생기는 일 | what-vibe-coding-is.md |
| A9 | "구현은 공짜, 오케스트레이션은 아님" | implementation-is-free.md |
| A10 | 타입 언어가 바이브 코딩에 왜 나은지 | typescript-rust.md |

### Beat 3: 삽질 — "만들고 있는데 매일 터진다" ← Phase 1 메인

매주 여기서 뽑는다.

| ID | 소재 | 원천 |
|----|------|------|
| A1 | 5,405 테스트 통과 → 프로덕션 갭 69개 | MUSU-026 |
| A2 | Shell injection → execFile 전환 | MUSU-026 |
| A3 | 보안 감사 B- → B+ (5일) | MUSU-036 |
| A4 | 10,847줄 → 3,562줄 리팩토링 (6개월간 중복 코드) | refactoring-case-study.md |
| A5 | 45분 → 12분 런타임 (Python 빡쳐서 Rust로) | refactoring-case-study.md |
| A6 | Auth fail-closed 패턴 | MUSU-026 |
| A7 | 멱등성 레이스 → LRU+TTL 캐시 | MUSU-026 |
| A12 | Spec Kit 필드 리포트 | spec-kit-field-report.md |
| A13 | Google OAuth 웹+데스크탑 통합 (3일째) | MUSU-099 |
| B10 | MCP 허브 = 컨텍스트 비용 | MUSU-094 |
| B11 | Schema SSOT + CI drift gate | MUSU-029 |

### Beat 4: 배움 — "만들면서 알게 된 것"

Beat 3의 쓰레드 깊이로 연결되는 소재.

| ID | 소재 | 원천 |
|----|------|------|
| B1 | CLAUDE.md: 500줄 → 87줄 (많다고 좋은 게 아님) | claude-md.md |
| B2 | 프롬프트 시대의 끝 | end-of-prompting.md |
| B3 | 환경 설계 > 프롬프트 | environment-design.md |
| B4 | 8단계 컨텍스트 시퀀싱 | splitting-decisions.md |
| B5 | Claude Code 2.1 멀티에이전트 | claude-code-2-1.md |
| B6 | RAG = 생성 전 검색 | rag-basics.md |
| B7 | RAG는 검색이 아니라 선택 | rag-choices.md |
| B8 | 3계층 검색 아키텍처 | three-tier-search.md |
| B9 | 1,624페이지 PDF → 3초 검색 | rag-in-practice.md |
| B12 | Anthropic GitHub 53-repo 분석 | anthropic-github.md |
| B13 | 벡터 DB 기초 | vector-databases.md |
| C4 | QUIC primary + HTTP fallback | |
| C5 | P2P: 서버 비용 95% 절감 ($40K → $2K) | |

### Beat 5: 진행 — "아직 만드는 중"

영상 소재. Month 2~3부터.

| ID | 소재 | 형식 |
|----|------|------|
| C1 | Rust 849 + TS 5,411 = 6,260 테스트 | 숫자 |
| C2 | 15 pain points 전부 해결 | 숫자 |
| C3 | Worker 26.6K LoC → 73% 표면 축소 | 숫자 |
| C6 | 월간 지표 (구독자, 트래픽, 팔로워) | 숫자 |
| C7 | CONDITIONAL GO → FULL GO 판단 | 숫자 |
| C8 | MCP 44개 도구 / 7-pack 구조 | 숫자 |
| D1 | Rust 빌드 터미널 화면 | 영상 30초 |
| D2 | 리팩토링 before/after | 영상 45초 |
| D3 | MCP 서버 3개 동시 실행 | 영상 30초 |
| D4 | RAG 파이프라인: 37분 → 3초 | 영상 45초 |
| D5 | MUSU Bee 데스크탑 앱 프리뷰 | 영상 60초 |
| D6 | Claude Code 멀티에이전트 병렬 | 영상 45초 |
| D7 | QUIC → HTTP 폴백 라이브 | 영상 30초 |
| D8 | 보안 감사 diff: B- → B+ | 영상 45초 |

---

## 3. 금지 표현

| 금지 | 이유 |
|------|------|
| 도자기 비유 자체를 트윗으로 | 캐릭터 ≠ 콘텐츠 |
| 사기꾼 저격 자체를 트윗으로 | 적 정의는 포지셔닝 도구 |
| 기술 근거 없는 의견 | 숫자/코드/경험 없으면 안 올림 |
| character.md 패턴을 그대로 복붙 | 패턴은 도구, 콘텐츠 아님 |
| "Here's what nobody tells you about..." | 클리셰 |
| "Like if you agree" | 인게이지먼트 베이트 |
| 20+ 메가스레드 | 2026 기준 참여도 하락 |
| 맥락 없는 한 줄 | 근거 없는 선언 |
| game-changer, deep dive, unpack | 테크 블로그 클리셰 |
| Furthermore, In conclusion | 격식체 |
| "누구나 쉽게" | 블로그의 적이 파는 착각 |

---

## 4. 시장 데이터 (2026)

| 지표 | 값 | 출처 |
|------|-----|------|
| Vibe coding 시장 규모 | $4.7B | Second Talent |
| 개발자 AI 도구 채택률 (미국) | 92% | Blockchain News |
| MCP 서버 수 | 5,800+ | MCP Manager |
| MCP SDK 월간 다운로드 | 97M+ | CData |
| AI 생성 코드 보안 결함률 | ~45% | Builder.io |
| 뉴스레터 첫 수익까지 | 중간값 66일 | Beehiiv 2025 |
| 뉴스레터 0→1K | 8-12개월 | 2026 데이터 |
| 전용 MCP 뉴스레터 | 0개 | 리서치 결과 |
