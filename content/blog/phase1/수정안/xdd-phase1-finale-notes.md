# Phase 1 마무리 구상 — XDD (UX-Driven Development)

## 날짜: 2026-03-02

---

## 1. XDD란 무엇인가

**XDD = UX-Driven Development (사용자 경험 주도 개발)**

비개발자가 AI 코딩 시대에 코드를 읽을 수 없는 상황에서 품질을 통제하는 **유일한 무기**.
코드 리뷰가 아니라 **경험 리뷰(UX)**로 AI 산출물을 검증한다.

**네이밍 의도**: XDD = XD (웃음 이모티콘) + DD (Driven Development) → 밈 폭발력
- TDD, DDD, FDD를 비튼 것처럼 XDD도 개발자 밈 계보에 진입
- "빡쳐서(FDD) 만들었고, 경험으로(XDD) 검증한다"

---

## 2. Phase 1 전체 서사 구조

```
Act 1: 스펙 (What) — 뭘 만드는지 정하기. 4가지 기둥. [FDD #1-6]
Act 2: 프로세스 (How) — SDD로 스펙을 시스템으로. [FDD #7-12]
Act 3: 구조 (Where) — DDD로 코드에 지도를. [FDD #13-18]
Act 4: 검증 (Proof) — TDD로 "맞다"를 증명. [FDD #19-24]
Act 5: 경험 (UX) — XDD로 "이게 내가 원한 거다"를 확인. [FDD #25-30]
```

**Phase 1의 3단 빌드업:**

1. **Vibe Coding의 환상**: "나는 천재다" → 함정
2. **FDD (Fury-Driven Development)**: "다 부서졌고, 내 빡침이 스펙이다" → 목적과 수단의 정의 (Act 1-4)
3. **XDD (UX-Driven Development)**: "코드는 AI가 짜라, 나는 경험을 설계한다" → 비개발자의 최종 통제 수단 (Act 5)

**DD 계보 정리:**
| 약어 | 풀네임 | Act | 핵심 질문 |
|------|--------|-----|----------|
| FDD | Fury-Driven Development | 1 | 뭘 만들 건가? (스펙) |
| SDD | Spec-Driven Development | 2 | 어떤 순서로? (프로세스) |
| DDD | Domain-Driven Design | 3 | 코드를 어떻게 나눌 건가? (구조) |
| TDD | Test-Driven Development | 4 | 맞는지 어떻게 알 건가? (검증) |
| XDD | UX-Driven Development | 5 | 이게 내가 원한 건가? (경험) |

---

## 3. 원재료: 058-짜증이-스펙.md

**위치**: `easy_peasy/blog-only/058-짜증이-스펙.md`

### 이미 Act 1-4에서 써먹은 내용 (겹침 — 덜어내야 함)

- KVM, Remote Desktop, 클라우드, Git 도구 비판 → act1-4-ko에서 사용
- 4칸 나누기 (목적/이유/방법/수단) → act1-4-ko 핵심
- AI와 P2P 스무고개 → act1-4-ko 에피소드 A/B
- "짜증을 정리하면 스펙이 된다" → act1-4-ko 결론

### 아직 안 쓴 독창적 내용 (핵심 — 살려야 함)

1. **UX의 현실적 정의**
   - "아 자료 없네 젠장" — 카페에서 빡치는 그 순간을 없애는 것 = UX
   - 아이폰(좋은 UX) vs 아이맥(나쁜 UX) 비유
   - UX ≠ 디자인. UX = "절실히 원하는 경험"

2. **AI는 정답이 아니라 경계선을 준다**
   - "그건 안 되는데요" = 경계선
   - 경계선 하나하나가 = 요구사항
   - 최고의 명문장: "AI가 준 건 해결책이 아니었다. 경계선이었다."

3. **대화 기록 = 리서치**
   - 새 대화 열지 마라
   - AI와 싸운 기록이 날것의 리서치 데이터
   - 버리면 안 된다 → 다시 뭉쳐서 컨텍스트로 던져야 한다

4. **편지에서 카톡으로 (MVP 비유)**
   - 편지 → 전보 → 교환원 → 다이얼 → 카톡
   - 전부 "메시지를 보낸다"는 같은 UX
   - 기술은 다르지만 사용자 경험은 같다
   - MVP = 그 UX가 "한 번이라도 느껴지는" 최소 기능

5. **파이프라인 정리**
   - 짜증 → UX → 질문 → 대화 → 리서치 → 스펙 → MVP
   - Phase 1 전체를 한 줄로 요약하는 파이프라인

---

## 4. Act 5 작성 방향 (밑그림)

### 핵심 메시지
- "코드는 AI가 짠다. 나는 경험을 설계한다."
- 비개발자의 최종 무기는 코드 리뷰가 아니라 **경험 리뷰**
- 스펙(FDD)이 "뭘 만들 건가"를 정했다면, XDD는 "사용자가 이걸 어떻게 겪게 할 건가"를 정한다

### 구조 제안 (아직 확정 아님)

| 씬 | 가제 | 핵심 |
|----|------|------|
| 1 | 스펙 이후의 함정 | 스펙이 있어도 한 번에 다 만들면 죽는다 → MVP 개념 필요 |
| 2 | UX는 디자인이 아니다 | "카페에서 빡치는 순간을 없애는 것" — UX의 현실적 정의 |
| 3 | AI는 경계선을 준다 | 대화 기록 = 리서치. 핑퐁의 가치. 새 대화 열지 마라. |
| 4 | 편지에서 카톡으로 | MVP = UX가 느껴지는 최소 기능. Phase 1 파이프라인 정리. |
| 압축 | Phase 1 에필로그 | FDD→SDD→DDD→TDD→XDD 전체 아크 요약 |

### 주의사항

- **도구 비판(KVM 등)은 반복하지 않는다** — Act 1-4에서 이미 사용
- **4칸 나누기는 반복하지 않는다** — "Act 1에서 스펙을 세웠다. 그다음은?" 식으로 이어간다
- **톤**: voice.md Mode A (싸지르기) — 058 원문의 톤이 이미 완벽함
- **058의 강점**: 삽질 에피소드가 살아있다 (KVM 꽂았다 뺐다, 자동화를 관리하는 자동화 등)
- **겹침 해결**: 058에서 Act 1-4와 겹치는 앞부분(도구 비판, 스펙 도출)은 과감히 자르고, UX/MVP/리서치에 집중

---

## 5. 밑그림 초안 (외부 AI 제안 — 참고용, 톤 불일치)

아래는 외부 AI가 제안한 초안. **톤이 작가 voice와 다르므로 구조만 참고.**

핵심 뽑을 것:
- "스펙은 지도가 아니라 나침반" — 쓸 만한 비유
- "코드는 AI가 짜라, 나는 경험을 설계한다" — XDD 선언문 후보
- 파이프라인 6단계 정리 — Phase 1 에필로그로 적합

버릴 것:
- "테크 커뮤니티에서 전설로 남을 만한" 같은 과장
- "가슴이 웅장해지네요" 같은 감탄
- 교과서적 정리체 — voice.md §7 금지 표현에 해당

---

## 6. Phase 1 완료 현황 (2026-03-02)

- [x] 058 원문에서 Act 1-4와 겹치지 않는 부분만 추출
- [x] Act 5 구조 확정 (4씬 + 압축본)
- [x] Act 5-1 ~ 5-4 KO 초안 작성 (voice.md Mode A)
- [x] Act 5 EN 번역 (Bukowski 60% + Indie Hacker 30% + Product 10%)
- [x] X 스레드 큐 생성 (FDD #7-30, Acts 2-5, w12-w19)
- [x] CATALOG.md 업데이트 (50파일 + 10큐)
- [x] Phase 1 마무리 — commit `6ad4dbd`

### Phase 1 최종 산출물

| 카테고리 | 수량 | 상세 |
|---------|------|------|
| 씬 파일 | 40 | 5 Acts × 4씬 × 2언어 (KO+EN) |
| 압축본 | 10 | 5 Acts × 2언어 |
| X 스레드 큐 | 10 JSON | FDD #1-30, w10-w19 |
| 스케줄 | 20주 | 2026-03-03 ~ 2026-05-09 |

### 블로그 배포 현황

- [x] Act 1 블로그 글 4개 → easy_peasy 최신 EN 버전으로 교체 — commit `d0f8191`
- [ ] Act 2-5 블로그 글 → 추후 교체 예정

### X 자동 포스팅 시스템 (완성)

**파이프라인**: 큐 JSON (approved) → GitHub Actions (30분 cron) → Twitter API → posted 마킹 → git commit

**코드 수정** — commit `10340af`:
- `queue-manager.mjs`: `getActiveQueueFiles()` 전체 큐 스캔으로 수정
- `post-queue.mjs`: 파라미터 정리
- GitHub Secrets 4개 설정 완료
- GitHub Actions dry-run 검증 통과

**Act 1 스레드 현황 (FDD #001-006)**:

| 날짜 | FDD # | 제목 | 상태 |
|------|-------|------|------|
| 3/2 (일) | #001 | I Thought It Worked | ✅ posted (수동) |
| 3/4 (화) 9AM PST | #002 | Monday Morning | approved → 자동 |
| 3/5 (수) | #003 | Nothing Works | approved → 자동 |
| 3/6 (목) | #004 | The Real Problem | approved → 자동 |
| 3/7 (금) | #005 | Frustration Is the Spec | approved → 자동 |
| 3/8 (토) | #006 | Everything Changed | approved → 자동 |

- 스케줄: 매일 UTC 17:00 (PST 9 AM / KST 02:00+1)
- 280자 트윗 × 4-5개/스레드, 마지막 트윗에 블로그 링크
- 큐: w10/w11 재포맷 완료, status "approved"

### 후속 작업 — Acts 2-5 큐 재포맷

- [ ] Acts 2-5 (FDD #7-30) 큐 280자 재포맷 (현재 validation 실패)
- [ ] Acts 2-5 블로그 글 vibecode.town에 교체
- [ ] Act 1 자동 포스팅 검증 후 Acts 2-5 스케줄 확정 + approved

### Phase 1 → Phase 2 브릿지

Phase 1 결론: "짜증 → UX → 질문 → 대화 → 리서치 → 스펙 → MVP"
Phase 2 질문: **실제로 만들었을 때 뭐가 터졌는가?**

후보 방향:
1. **Build Log** — Phase 1의 스펙으로 실제 MUSU 빌드하면서 겪는 삽질기
2. **Vibe Coding Playbook** — Phase 1에서 발견한 DD 프레임워크를 레시피로 정리
3. **Community Launch** — FDD #1-30 트윗 반응 보고 Phase 2 방향 결정
