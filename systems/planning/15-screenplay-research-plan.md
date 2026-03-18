# 15. Screenplay Research Pipeline — Phase 0.5

> 대본 작성 전 주제 리서치 + 블로그 근거 추출 프로세스.
> 2026-03-14 신설. EP01 파일럿 실행 완료.

---

## 문제 진단

기존 파이프라인 (Phase 0 → 1 → 2 → 3):
- Phase 0에서 주제 한 단어 + 블로그 시드 선택
- Phase 1에서 바로 스토리 설계
- **EXPLAINER 세그먼트가 추상 메타포만으로 구성** (blueprint vs stacking 등)
- 블로그의 구체 데이터(10,847줄, 쉘 인젝션 등)가 대본에 반영되지 않음
- Claudius Papirus 등 레퍼런스 채널 대비 설명 품질 부족

## 해결: Phase 0.5 (`/screenplay-research`)

Phase 0 (소재 정의) → **Phase 0.5 (주제 리서치)** → Phase 1 (스토리 설계)

### 3단계 프로세스
1. **웹 리서치**: 정의/기원, 중요성, 모범사례, 바이브코더 안티패턴, 케이스 스터디
2. **블로그 근거 추출**: 숫자/메트릭, 아하 모먼트, 감정 여정 비트
3. **토픽 브리프 작성**: 연구 + 근거 + Explainer Script Seeds → 유저 승인

### 산출물
- `preproduction/ep{NN}/ep{NN}_topic_brief.md` (토픽 브리프 템플릿 기반)
- `source_index.json`의 `topic_brief_status` 필드 업데이트

### Phase 1/2/3 변경
- Phase 1: 토픽 브리프가 필수 입력. Story Circle Step 5(EXPLAINER)에 Script Seeds 참조
- Phase 2: EXPLAINER에 **구체 데이터 2개+**, **연구 기반 설명 1개+** 필수 (규칙 13, 14)
- Phase 3: 위 2개 규칙의 자동 검증 항목 추가

---

## EP01 파일럿 결과

### 리서치 발견
- Barry Boehm 비용 곡선 (1981): 프로덕션 버그 수정 = 요구사항 대비 100x
- Standish CHAOS (2020): IT 프로젝트 66% 실패, #1 원인 불완전 요구사항
- AI 코드 보안: 생성 코드 ~40% 취약점 (Copilot 연구), 인간 대비 1.5-2x (CodeRabbit)
- 케이스: Healthcare.gov ($1.7B), Ariane 5 ($370M), Knight Capital ($440M)

### 대본 개선 전/후

| 항목 | 기존 | 리라이트 |
|------|------|---------|
| EXPLAINER 데이터 포인트 | 0개 | 6개 (10,847줄, 4,200중복, 5에이전트, 66%실패, 1x→100x, 4분면) |
| 연구 기반 설명 | 0개 | 3개 (Boehm, CHAOS, IEEE 830) |
| 메타포 | blueprint vs stacking (유일) | 5개 독립 빌더 + 데이터 시각화 |
| 블로그 구체 인용 | 0개 | 쉘 인젝션, 스크롤 장면, 3시간→5분 |
| 4분면 프레임워크 | 없음 | "Purpose/Reason/Method/Means" 시각화 |

---

## EP02-08 리서치 가이드

| EP | 토픽 | 핵심 리서치 방향 | 예상 소스 |
|---|---|---|---|
| EP02 | 디버깅 | systematic debugging, scientific method, printf vs debugger | Zeller "Why Programs Fail", rubber duck debugging 기원 |
| EP03 | SDD | design doc 작성법, 설계 없는 코딩의 기술 부채 | Google Design Docs, RFC 문화 |
| EP04 | 의존성 | dependency hell, semver, left-pad 사건 | npm left-pad (2016), node_modules 밈 |
| EP05 | 도메인/DDD | Eric Evans DDD (2003), ubiquitous language | "Domain-Driven Design" 원서, Bounded Context 패턴 |
| EP06 | Bounded Context | Conway's law, microservices 경계 | Melvin Conway (1967), Sam Newman "Building Microservices" |
| EP07 | 테스트 | test pyramid, testing trophy, coverage ≠ quality | Martin Fowler test pyramid, Kent C. Dodds testing trophy |
| EP08 | TDD | Kent Beck TDD (2002), red-green-refactor | "Test-Driven Development By Example" |

---

## 파일 위치

| 파일 | 경로 |
|------|------|
| 스킬 정의 | `.agents/skills/screenplay_writer/SKILL.md` |
| 브리프 템플릿 | `.agents/skills/screenplay_writer/topic_brief_template.md` |
| EP 소스 매핑 | `systems/video/preproduction/source_index.json` |
| EP01 토픽 브리프 | `systems/video/preproduction/ep01/ep01_topic_brief.md` |
| 이 문서 | `systems/planning/15-screenplay-research-plan.md` |
