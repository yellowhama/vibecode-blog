# 대본 파이프라인 재정비 + 소스 인덱스 구축

> 작성일: 2026-03-11
> 최종 수정: 2026-03-15
> 상태: **Phase 1 완료** — 채널 리브랜딩 + 커리큘럼 재설계 완료. EP01 재작성 대기 중.

## Context

~~대본 작성 프로세스가 확립됐다 (주제→설계→집필→검증). 이제 이걸 실제로 돌릴 수 있도록 파이프라인을 정비한다.~~

**2026-03-15 업데이트**: 채널 아이덴티티 전면 리브랜딩 완료.
- 3D 시트콤 → 2D 질문 기반 Explainer
- 시트콤 5세그먼트 → 질문→상황→설명→적용→다음 질문
- 블로그 우겨넣기 → 주제 먼저 커리큘럼 (EP01-08 질문 기반)
- 캐릭터 재설계: Vee(호기심), Bee(이해관계자)

---

## 완료된 작업 ✅

### 채널 리브랜딩 (2026-03-15, `bf6c96e`)

| 파일 | 작업 | 상태 |
|------|------|------|
| `systems/planning/16-channel-identity.md` | **신규** — 채널 아이덴티티 SSOT | ✅ |
| `systems/planning/10-youtube-format-bible.md` | **전면 리라이트** — 질문 기반 5세그먼트 | ✅ |
| `systems/planning/12-episode-series-bible.md` | **전면 리라이트** — 주제 먼저 커리큘럼 | ✅ |
| `systems/video/preproduction/source_index.json` | **전면 리라이트** — v2.0 질문/학습결과 매핑 | ✅ |
| `.agents/skills/screenplay_writer/SKILL.md` | **전면 리라이트** — Discovery Arc, 새 검증 기준 | ✅ |
| `systems/planning/08-branding-strategy.md` | **업데이트** — 톤/비주얼/포지셔닝 정렬 | ✅ |

### 기존 완료 항목

| 파일 | 작업 | 상태 |
|------|------|------|
| `systems/video/preproduction/source_index.json` | 소스 블로그 인덱스 | ✅ (v2.0으로 교체) |
| `systems/video/preproduction/rag/` | 블로그 소재 RAG 인덱스 | ✅ |
| `.agents/skills/screenplay_writer/SKILL.md` | Phase 0.5 추가 | ✅ (리브랜딩에 통합) |
| `systems/planning/15-screenplay-research-plan.md` | Phase 0.5 프로세스 | ✅ (유지) |

---

## 대본 파이프라인 (현행)

```
질문 정의 (/screenplay-topic)
  ↓ 유저 승인
주제 리서치 (/screenplay-research)
  ↓ 유저 승인
스토리 설계 (/screenplay-plan) — Discovery Arc
  ↓ 유저 승인
Fountain 집필 (/screenplay-write)
  ↓ 유저 승인
구조 검증 (/screenplay-review)
  ↓ 자동검증 PASS + 유저 승인
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TTS 생성 (대본 확정 후에만)
  ↓
타이밍 싱크 (TTS actual_duration → shot manifest)
  ↓
키프레임 렌더 (2D flat vector)
  ↓
최종 조립 (영상+VO+자막+BGM)
```

---

## 다음 단계 (미완료)

### Phase 2: EP01 재작성

EP01 기존 대본/산출물은 리브랜딩 전 시트콤 구조 기반. 새 질문 기반 구조로 재작성 필요.

**EP01 새 설정:**
- **질문**: "바이브코딩이 뭐야?"
- **학습 결과**: AI가 대신 코딩 ≠ 바이브코딩. AI와 '같이' 만드는 것.
- **구조**: 질문→상황→설명→적용→다음 질문

**작업 순서:**
1. `/screenplay-topic` — EP01 새 주제 카드 작성 (질문 기반)
2. `/screenplay-research` — EP01 토픽 브리프 재작성
3. `/screenplay-plan` — Discovery Arc + Story Spine + 감정 트래커
4. `/screenplay-write` — Fountain 대본 집필
5. `/screenplay-review` — 구조 검증
6. TTS 재생성 → 타이밍 싱크 → 렌더

### Phase 3: 비주얼 파이프라인 전환

3D Pixar → 2D flat vector 전환에 따른 렌더 파이프라인 변경.

| 기존 | 신규 |
|------|------|
| Flux Kontext (3D 캐릭터) | 2D flat vector 캐릭터 (SVG 또는 Flux T2I with 2D prompt) |
| Wan I2V (3D 모션) | 모션 그래픽 or Wan I2V (2D 키프레임) |
| 시트콤 모드 + 해설 모드 | 캐릭터 장면 + 설명 다이어그램 + 코드 데모 |

**결정 필요:**
- [ ] 2D 캐릭터 생성 파이프라인 (SVG? AI T2I? 직접 제작?)
- [ ] 다이어그램 생성 방식 (ByteByteGo 스타일 — 모션 그래픽 도구?)
- [ ] 코드 데모 화면 캡처/애니메이션 방식

### Phase 4: validate_screenplay.py 업데이트

자동 검증 스크립트를 새 구조에 맞게 업데이트.

```
[PASS/FAIL] 세그먼트 5개 존재
[PASS/FAIL] 순서: 질문 → 상황 → 설명 → 적용 → 다음 질문
[PASS/FAIL] 타이밍 범위 (질문 10-15s, 상황 60-90s, 설명 90-120s, 적용 30-60s, 다음 질문 10-15s)
[PASS/FAIL] 총 길이 210-300초 (3.5-5분)
[PASS/FAIL] 전 세그먼트 NARRATOR (V.O.) 존재
[PASS/FAIL] 캐릭터 음성 대사 없음
[PASS/FAIL] 설명 characters = []
[PASS/FAIL] 금지 표현 0개 (storyform.json)
[PASS/FAIL] 설명에 데이터 포인트 2개+
[PASS/WARN] 전환 지시 존재
```

---

## 검증 방법

1. `16-channel-identity.md` 읽으면 채널이 뭔지 30초 안에 파악 가능 ✅
2. EP01-08 각각 "5분 후 시청자가 뭘 알게 되나?" 한 줄로 답 가능 ✅
3. 캐릭터 설명으로 그릴 수 있을 정도로 구체적 ✅
4. 기존 문서와 모순 없음 ✅
