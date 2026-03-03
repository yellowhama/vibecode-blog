---
name: twitter_pipeline
description: Executes the end-to-end Twitter thread writing pipeline by designing the narrative, drafting it, queueing it, and checking rules.
---

# Twitter Pipeline Skill

This skill allows the agent to execute the Vibecode Blog writing pipeline for Twitter threads based on raw blog drafts.
It combines four previously separate commands into a unified workflow.

## Process

1. **Plan (`twitter-plan.md`)**: Analyze the raw sources mapping them to the narrative structure defined in `branding/narrative.md` and `twitter/STRATEGY.md`. Design Thread beats.
2. **Draft (`twitter-draft.md`)**: Write the Korean draft matching the voice in `branding/voice.md`. Must follow Nike Rule and format constraints.
3. **Queue (`twitter-queue.md`)**: Map the approved draft into a JSON payload and place it into `content/twitter_queue/YYYY-wWW.json`.
4. **Check (`twitter-check.md`)**: Run validation against all forbidden phrases and structural limitations.

## Resources
You must read and follow the instructions in these files when executing this pipeline:
- `twitter-plan.md`
- `twitter-draft.md`
- `twitter-queue.md`
- `twitter-check.md`
