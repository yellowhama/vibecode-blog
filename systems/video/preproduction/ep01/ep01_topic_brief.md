# Topic Brief — EP01: 바이브코딩이 뭔가? (What Is Vibe Coding?)

> Phase 0.5 산출물. `/screenplay-research` 실행 결과.
> 이 문서는 Phase 1 (Story Design)과 Phase 2 (Fountain 집필)의 필수 입력이다.
> **v4.0**: 시리즈 리프레임 — "Vibe Coding for Non-Developers"

---

## Part 1: Research Summary

### 정의 & 기원
**바이브 코딩 (Vibe Coding)**: Andrej Karpathy (2025.02)가 정의한 AI 기반 소프트웨어 개발 방식. "You just talk in natural language, run it, copy-paste, and most of the time it just works. The code almost stops existing." 자연어로 의도를 말하고, AI가 코드를 생성하며, 인간은 결과를 판단한다.

핵심 구분: **outsourcing이 아니라 collaboration**. AI가 "대신" 하는 것이 아니라 AI "와 함께" 만드는 것. 판단(무엇을, 왜, 이게 맞는지)은 인간의 몫. 실행(어떻게 코드로)은 AI의 몫.

### 왜 중요한가
- **Y Combinator W25 배치**: 스타트업 **25%**가 **95%+ AI 생성 코드** (Jared Friedman)
- **DEV 커뮤니티**: Rust 모르는 개발자가 Claude Code로 **800-star** Markdown 에디터 제작
- **Fortune 500**: Cursor AI IDE 사용 기업 **50%+**
- **업계 트렌드**: "vibe coding" → "vibe engineering" 전환 중 (계획+스펙 필요성 공감대)

### 도구 생태계 (2025-2026)
| 도구 | 유형 | 특징 | 비개발자 적합성 |
|------|------|------|---------------|
| **Cursor** | AI IDE | 자율성 슬라이더, 코드베이스 인덱싱, Fortune 500 50%+ | ★★★★ |
| **Claude Code** | 터미널 에이전트 | 자율 실행, git 자동화, 전체 코드베이스 이해 | ★★★ (터미널 필요) |
| **Replit** | 브라우저 IDE | 설치 없음, 즉시 실행, 배포 내장 | ★★★★★ |
| **Windsurf** | AI IDE | Cascade 에이전트, Cursor 경쟁 | ★★★★ |
| **Kiro (AWS)** | 스펙 기반 IDE | EARS 요구사항→아키텍처→태스크 | ★★★★★ (EP02 떡밥) |

### 바이브코더 안티패턴
1. **"딸깍 환상"** — AI한테 시키면 완벽한 게 나온다고 믿음. 현실: 질이 낮거나 예상과 다름.
2. **판단 위임** — "AI가 알아서 하겠지." 현실: AI는 다음 토큰을 예측할 뿐, 비즈니스 판단을 하지 않음.
3. **도구 혼동** — ChatGPT 채팅창에서 복붙 vs 전용 AI IDE 사용의 차이를 모름.
4. **결과 검증 불가** — 코드를 못 읽으니 결과가 맞는지 틀린지 판단할 수 없음.

### 레벨 스펙트럼
- **L1**: 채팅창 복붙 (ChatGPT/Claude 웹) — 가장 낮은 자율성
- **L2**: AI IDE (Cursor/Windsurf) — 코드베이스 인식, 인라인 편집
- **L3**: 에이전트 (Claude Code + 스펙) — 자율 실행, 판단은 인간

---

## Part 2: Blog Evidence Table

| # | 데이터 포인트 | 값 | 소스 파일 | 대본 배치 |
|---|-------------|---|----------|----------|
| 1 | Karpathy 정의 | "You just talk in natural language..." | 001-vibe-coding.md | HOOK/CORE |
| 2 | Y Combinator W25 | 25% 스타트업이 95%+ AI 코드 | 001-vibe-coding.md | CORE |
| 3 | "with" 인사이트 | outsourcing이 아니라 collaboration | 054-what-vibe-coding-is.md | CORE |
| 4 | 판단은 인간 | "Decisions are yours. Implementation is the AI's." | 054-what-vibe-coding-is.md | CORE/REFRAME |
| 5 | 4가지 질문 | What, What situation, What problem, Why | 054-what-vibe-coding-is.md | REFRAME |
| 6 | 바이브→엔지니어링 전환 | "vibe coding → vibe engineering" | 리서치 | REFRAME |
| 7 | Cursor Fortune 500 | 50%+ | 리서치 | CORE 도구 시연 |
| 8 | 3개 날짜 포맷터 | 같은 코드를 3가지로 만듦 | 001-vibe-coding.md | MISCONCEPTION |

### 아하 모먼트
> "바이브코딩은 'AI가 코딩해줘'가 아니다. 'AI와 함께 만든다' — 그 '함께'가 어려운 부분이다."
- 소스: 054-what-vibe-coding-is.md의 "with" 인사이트
- 대본 배치: CORE → REFRAME 전환점

### 감정 여정 비트
1. **호기심**: "바이브코딩으로 월 천만원" 광고 몽타주
2. **흥분**: Vee가 "쇼핑몰 만들어줘" → 뭔가 나옴 → "오!"
3. **실망**: 로그인 버튼이 장바구니, 색상 전부 형광 → "...이게 뭐지?"
4. **이해**: AI는 코드를 이해하지 않는다. 다음 토큰을 예측할 뿐.
5. **자신감**: 도구를 잡고, 기대치를 조정하고, 시작한다.

---

## Part 3: Explainer Script Seeds

### Seed 1: "Not a Magic Button"
- **연구 근거**: Karpathy 정의, Y Combinator 25% 데이터
- **블로그 근거**: 054 "with" 인사이트, 001 Karpathy 인용
- **내레이션 초안**:
> "A quarter of Y Combinator's latest batch — twenty-five percent — shipped products with ninety-five percent AI-generated code. That's not a prediction. That's now. But here's what they don't tell you in the ads: vibe coding isn't typing 'make me an app' and getting one. It's making decisions the AI can't make for you."

### Seed 2: "The Cooking Metaphor"
- **연구 근거**: 도구 생태계 비교, AI 자율성 레벨
- **블로그 근거**: 054 collaboration vs outsourcing
- **내레이션 초안**:
> "Think of AI as a chef. A really fast chef. You say 'make me dinner' and something appears on the plate. But if you didn't say what dinner, the chef improvises. Sometimes it's amazing. Usually it's... not what you wanted. The recipe is your job. The cooking is theirs."

### Seed 3: "Three Results, One Prompt"
- **연구 근거**: AI 토큰 예측 메커니즘, 비결정적 출력
- **블로그 근거**: 001 날짜 포맷터 3종, 컨텍스트 단절
- **내레이션 초안**:
> "Same prompt. Run it three times. Three completely different results. Why? Because the AI isn't understanding your code. It's predicting the next word. Every time, it rolls the dice slightly differently. That's not a bug. That's how language models work."

### Seed 4: "Tool Tour"
- **연구 근거**: 도구 생태계 표
- **내레이션 초안**:
> "Cursor — an AI IDE. You write code, it writes alongside you. Claude Code — a terminal agent. It reads your entire project and acts autonomously. Replit — browser-based, zero install. Kiro — spec-first, it writes requirements before touching code. Different tools, same principle: you decide what. AI decides how."

---

## Part 4: Recommended Sources

| 소스 | 유형 | 관련성 |
|------|------|--------|
| Andrej Karpathy Twitter/X (2025.02) | social | 바이브코딩 원문 정의 |
| Y Combinator Blog — Jared Friedman | article | W25 배치 AI 코드 비율 |
| 054-what-vibe-coding-is.md | blog | "with" 인사이트, collaboration 정의 |
| 001-vibe-coding.md | blog | Karpathy 인용, 마이크로서비스 사례 |
| Cursor Blog | article | Fortune 500 채택률 |
| AWS Kiro Launch (2025) | article | Spec-driven dev IDE |
| DEV.to Vibe Coding threads | community | 커뮤니티 공감대, 안티패턴 |
| IBM Technology — "What Is Vibe Coding? Building Software with Agentic AI" | YouTube | 바이브코딩 정의, 3-phase best practice (architect/implement/review), TDD→SDD 브릿지. [references/ibm_tech_vibe_coding_transcript.md](references/ibm_tech_vibe_coding_transcript.md) |
| IBM Technology — "Spec-Driven Development: AI Assisted Coding Explained" | YouTube | EP02 참조. SDD vs vibe coding 대조, "spec = contract", SDLC 통합. [../ep02/references/ibm_tech_sdd_transcript.md](../ep02/references/ibm_tech_sdd_transcript.md) |

---

## Phase 0.5 Gate

- [x] 웹 리서치 5가지 질문 전부 답변 (정의, 중요성, 도구, 안티패턴, 레벨)
- [x] 증거 테이블에 구체적 데이터 포인트 8개 (목표 5개+)
- [x] 아하 모먼트 정확한 소스와 함께 식별
- [x] Explainer Script Seeds 4개, 각각 연구+블로그 근거 보유
- [ ] **유저 승인**
