# Reference: IBM Technology — What Is Vibe Coding? Building Software with Agentic AI

- **Source**: https://www.youtube.com/watch?v=Y68FF_nUSWE
- **Channel**: @IBMTechnology
- **Duration**: ~7 min
- **Date captured**: 2026-03-18
- **Relevance**: EP01 + EP02 external reference (vibe coding definition + SDD intro)

## Key Takeaways

### 1. Vibe Coding Definition
> "Vibe coding entails generating code with the assistance of a large language model, but it goes one step further where you might not actually fully read that generated code."

- Flow: prompt engineering → see changes → approve/decline → iterate → run → fix → loop
- Based on React framework pattern: reason → action → observe
- Can exist in IDE or browser

### 2. Good Use Cases for Vibe Coding
- Quickly scaffold an application / demo app
- Asking questions about codebase ("what is my project structure?")
- Building CLI / UI scaffolding
- Scripting tasks

### 3. When NOT to Vibe Code
- Anything with API keys / secrets
- Susceptible to hallucinations
- "Vibe coding sometimes means skipping traditional software development practices like tests, reviews, CI, and documentation"

### 4. How to Be a Better Vibe Coder — 3 Phases

**Phase 1: Architecture & Design**
- Write/generate tests first (TDD) — "deterministic way to get your vibecoded application working"
- Spec-driven development — "clear outline for what your coding agent should follow"
- Cross off desired outcomes as you go

**Phase 2: Implementation**
- Use tools (MCP) to keep agent up-to-date with libraries/docs
- Automated testing
- Git versioning — track features, revert as needed

**Phase 3: Review**
- "Can actually take longer than writing the code itself"
- Lint + type checks
- Security scanning (dependencies, vulnerabilities, hardcoded secrets)
- Use separate agent to review code before pushing

### 5. Vibe Coding → SDD Bridge
> "There's a new trend which is known as spec-driven development that allows us to build APIs and services by having a clear outline for what your coding agent should follow."

This directly bridges EP01 → EP02 in our series.

### 6. Notable Comment (Top-rated)
> "The trap of vibecoding:
> - 'Just vibe code it, you don't need to be a software engineer'
> - something breaks → you vibe it → doesn't work
> - you search for it → you learned some architecture stuff
> - you vibe it again with added knowledge → something deeper breaks → you learn more
> - congrats! You just learned software engineering basics in the most roundabout way!"

This perfectly captures our EP01-EP10 learning arc. The user starts naive, hits walls, and through the pain learns the fundamentals.

## Alignment with EP01-02 Scripts

| IBM Tech Point | Our Coverage | Episode |
|---|---|---|
| Vibe coding = AI + not reading code | EP01 HOOK: "vibes" promise | EP01 |
| Demo/scaffold use case | EP01 CORE: "Level 1-3 spectrum" | EP01 |
| Hallucination risk | EP07 (dedicated episode) | EP07 |
| TDD as vibe code upgrade | EP04 (testing = opening boxes) | EP04 |
| SDD as next level | EP02 (entire episode) | EP02 |
| Review takes longer than writing | EP03 (reading AI code) | EP03 |
| Security scanning | Not in S1 scope | Future |
| Git versioning | Not in S1 scope | Future |
| "Learning software engineering the roundabout way" | Our entire S1 arc (EP01→EP10) | Meta |

## Production Notes
- Talking head + screen recording + diagrams
- More technical than our target audience (assumes IDE familiarity)
- We differentiate: metaphor-first, story-driven, non-developer audience
- Their audience: developers learning AI coding. Our audience: non-developers starting from zero.
- Their structure: definition → use cases → best practices. Ours: story → problem → revelation.
