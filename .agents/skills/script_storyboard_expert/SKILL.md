# Scriptwriting & Storyboarding Expert Skill

> **역할 한정**: 이 스킬은 **Fountain 포맷 규칙 + 샷 분해** 전문.
> 이야기 구조(주제 정의, Story Circle, 감정 아크)는 `screenplay_writer` 스킬이 담당.
> 이 스킬은 완성된 Fountain 스크립트의 포맷 검증과 샷리스트 생성에만 사용.

Expert in AI-assisted screenwriting using the **Fountain** format and automated storyboarding workflows.

## Core Mandates

### 1. Fountain Format First
All scriptwriting must be done in **Fountain (.fountain)** plain-text markup. This ensures Git compatibility and perfect AI parsing.
- Use `INT./EXT. SCENE HEADING - DAY/NIGHT` for all shots.
- Character names in `ALL CAPS`.
- Dialogue centered (AI will simulate this with standard Fountain padding).
- Parentheticals for performance cues.

### 2. The "Nike Rule" Balance
- **Action > Dialogue**: Prioritize visual storytelling. If a character says it, see if they can *do* it instead.
- **Punchy Pacing**: 3-7 words per line for action beats.
- **No Fluff**: Remove greetings, goodbyes, and unnecessary filler.

### 3. Storyboarding Pipeline
Every script must be accompanied by a **Shot List** (or `shots.json`).
- **Shot Type**: WS (Wide), MS (Medium), CU (Close Up), POV.
- **Visual Description**: Detailed prompt for ComfyUI (Subject, Action, Lighting, Style).
- **Duration**: Estimated time based on reading speed (approx. 2 words/sec).

## Workflows

### Script-to-Video DAG
1.  **Draft**: `.fountain` script based on `branding/BRAND.md`.
2.  **Board**: Generate a `shots.json` from the script.
3.  **Review**: Validate against `branding/voice.md`.
4.  **Produce**: Send to `systems/video/pipeline/`.

## Prompt Engineering for Fountain
"Act as a professional screenwriter. Generate the following scene in Fountain format. Focus on high-contrast visuals and Bukowski-style grit. Use INT./EXT. headers and standard character/dialogue blocks."

## Shot List Schema (JSON)
```json
{
  "shot_id": 1,
  "type": "CU",
  "visual": "A weathered hand trembling as it grips a fountain pen.",
  "audio": "VO: 'It started with a single line.'",
  "duration": 4.5
}
```
