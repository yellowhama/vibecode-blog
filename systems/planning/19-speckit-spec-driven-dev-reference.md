# SpecKit & Spec-Driven Development Reference

Source: "Spec Kit: Github's NEW tool That FINALLY Fixes AI Coding" (YouTube, Better Stack)

## What is SpecKit?

GitHub's **open-source toolkit** for spec-driven development with AI coding agents.
- CLI tool + templates + steering prompts
- Works with: GitHub Copilot, Claude Code, Gemini CLI
- Goal: Transform ad-hoc prompting → structured, verifiable development workflow

## Core Concept: Spec-Driven Development

Traditional: write code → document what it does
Spec-driven: write spec → code implements the spec

**Key insight**: LLMs are great at patterns but not at reading minds. Broad prompts like "Add photo sharing to my app" leave AI guessing thousands of details. Specs eliminate that guesswork.

The **spec becomes the authoritative artifact** (SSOT). Models constantly circle back to the spec document for guidance.

## 4 Gated Phases

### 1. Specify
- Describe WHAT you want and WHY
- Focus on user journeys and outcomes
- AI generates detailed spec with:
  - Primary user stories
  - Acceptance scenarios
  - Edge cases
  - "Needs clarification" blocks for ambiguity
  - Functional requirements + key entities

### 2. Plan
- Define tech stack + architectural constraints
- AI creates:
  - **Data model** (with Zod schemas)
  - **Research document** (framework rationale, alternatives, trade-offs)
  - **Development phases** with concrete steps

### 3. Tasks
- Spec + Plan → small actionable tasks
- Each task gets a unique number
- Manageable, testable units for incremental AI implementation

### 4. Implement
- AI tackles tasks incrementally (by number)
- Review each change before proceeding
- TDD approach (tests first, then implementation)
- Total granular control over execution

## Comparison

| Tool | Focus | Approach |
|------|-------|----------|
| **SpecKit** (GitHub) | Spec-driven dev | 4-phase gated, CLI + templates |
| **Kira** (Amazon) | Spec-driven dev | First framework, spec-first |
| **CLAUDE.md** (ours) | Intent-driven dev | Living spec file = project SSOT |
| **Vibe PM** (MUSU) | Agent-aware dev | Briefing → intent → staged execution |

## Relevance to Vibecode Content

### EP01 Connection (CLAUDE.md)
- CLAUDE.md IS a form of spec-driven development
- The file serves as the "living executable artifact" that SpecKit describes
- Our episode narrative: developers discover that specs (CLAUDE.md) fix vibe coding

### Content Opportunity
- SpecKit could be an EP05+ topic
- Compare SpecKit's 4-phase approach with our Vibecode workflow
- Demo: SpecKit + Claude Code working together
- Hook: "GitHub just gave your AI a brain"

### Pipeline Similarity
Our video pipeline already follows spec-driven principles:
1. **Specify**: Prepro manifest (beats, segments, emotion curves)
2. **Plan**: Shot manifest (visual types, render methods, durations)
3. **Tasks**: Pipeline stages (TTS → keyframes → I2V → assembly)
4. **Implement**: Each stage executes against the manifest SSOT

## Key Quotes

> "Language models are great at patterns, but not so great at reading your mind."

> "The spec becomes the authoritative artifact and the models constantly circle back to the spec document for guidance."

> "Choosing the right coding model is still necessary to achieve the best results." (GPT-4.1 vs Grok — model choice still matters even with specs)
