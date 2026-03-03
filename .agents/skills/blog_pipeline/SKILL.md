---
name: blog_pipeline
description: Executes the end-to-end blog writing pipeline by designing the narrative, drafting it, translating it, and checking rules.
---

# Blog Pipeline Skill

This skill allows the agent to execute the Vibecode Blog writing pipeline on raw blog drafts.
It combines four previously separate commands into a unified workflow.

## Process

1. **Plan (`blog-plan.md`)**: Analyze the raw sources mapping them to the narrative structure defined in `branding/narrative.md`. Design Acts/Scenes.
2. **Draft (`blog-draft.md`)**: Write the Korean draft matching the voice in `branding/voice.md`.
3. **Translate (`blog-translate.md`)**: Translate the Korean draft into English while maintaining the stylistic punchiness.
4. **Check (`blog-check.md`)**: Run validation against all forbidden phrases and structural limitations.

## Resources
You must read and follow the instructions in these files when executing this pipeline:
- `blog-plan.md`
- `blog-draft.md`
- `blog-translate.md`
- `blog-check.md`
