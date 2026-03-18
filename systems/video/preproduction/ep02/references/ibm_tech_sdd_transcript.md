# Reference: IBM Technology — Spec-Driven Development: AI Assisted Coding Explained

- **Source**: https://www.youtube.com/watch?v=mViFYTwWvcM
- **Channel**: @IBMTechnology
- **Duration**: ~9 min
- **Date captured**: 2026-03-18
- **Relevance**: EP02 primary external reference

## Key Takeaways

### 1. Core Definition
> "Spec-driven development has become one of the most important skills to learn if you're looking to be an AI engineer or to use AI to help build your applications."

### 2. Vibe Coding vs SDD — Clear Contrast
- **Vibe coding**: Start from prompt → model generates code → edit prompt → iterate until desired result
- **SDD**: Start from prompt → define behavior/constraints → create requirements → design document → then implement
- Key quote: "We're not prompting a specific implementation. We're prompting what we want our system to do — the behavior, the constraints."

### 3. The Inconsistency Problem (Validates EP01 → EP02 bridge)
> "We could do a hundred different tries of this implementation... we might get a different result every time. And that frustrates a lot of people."

### 4. Spec = Contract
> "That specific specification is then used like a contract to create requirements."
- Requirements become "the main hierarchy of how this project is going to work"
- Covers: code writing, tests, documentation, verification

### 5. Approval Gate Before Implementation
- If happy with requirements → approve → design document with to-dos
- If not happy → edit before any code is written
- "At this point nothing has been implemented and AI models are all about proper instructions"

### 6. Less Ambiguity = Better AI Output
> "Having a spec like this is much better than having the LLM guess what solution is going to hopefully best fit the user's request."
> "We now have less ambiguity for our coding agents."

### 7. Development Paradigm Comparison
| Approach | Order |
|----------|-------|
| Traditional | Code → Documentation |
| TDD | Test → Code |
| SDD | Spec → Design → Code |

> "Spec-driven development is test-driven development and behavior-driven development on steroids."

### 8. Concrete Example (Login Feature)
**Vibe coding**: "We need a /login page for our users to authenticate" → model has 30 ways to implement → back-and-forth

**SDD**:
```
Feature: User Authentication
- Endpoint: POST /login
- Variables: user, pass
- Failure: code if missing username
- Test: valid credentials → 200
```

## Alignment with EP02 Script v6

| IBM Tech Point | EP02 Coverage | Status |
|---|---|---|
| Spec = contract | CORE segment: "3-line spec" concept | Covered |
| Vibe coding inconsistency | HOOK/MISCONCEPTION: 28 left arms | Covered differently (metaphor) |
| Approval before implementation | Not explicit | Could strengthen in REFRAME |
| TDD/BDD comparison | Not in EP02 (EP04 territory) | Intentionally deferred |
| Spec as primary artifact | REFRAME: "spec drives everything" | Covered |
| Less ambiguity for agents | CORE: AI needs clear instructions | Covered |

## Usable Quotes/Data for EP02
1. "100 different tries... different result every time" — validates the frustration hook
2. "Spec is used like a contract" — potential narrator line
3. "Nothing has been implemented yet" — approval gate concept
4. TDD → SDD evolution framing — could use in CORE or REFRAME

## Production Notes
- IBM Tech's visual style: talking head + animated diagrams + code snippets
- Their pacing: ~150 WPM, casual conversational, lots of "right?" and "the thing is"
- Audience: developer-adjacent, similar to Vibecode Town target
- Their approach: definition → comparison → example → summary
- Our approach: story → metaphor → revelation → reframe (different structure, same audience)
