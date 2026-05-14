import os
import yaml
import sys
import datetime

class VibeCritic:
    def __init__(self, project_root):
        self.project_root = project_root
        self.output_dir = os.path.join(project_root, 'reviews')
        os.makedirs(self.output_dir, exist_ok=True)

    def run_critique(self, draft_path):
        if not os.path.exists(draft_path):
            print(f"Draft not found: {draft_path}")
            return

        with open(draft_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # In a full implementation, this would call an LLM with specific system instructions
        # derived from wiki/critique-gate.md.
        
        # Placeholder for the structured output
        report = {
            "schema": "critique_revision_recheck",
            "projectId": "vibecode-town",
            "workId": os.path.basename(draft_path),
            "created_at": datetime.datetime.now().isoformat(),
            "owner": "vibe_critic",
            "draft_path": draft_path,
            "verdict": "fix required", # Default to fix required for first pass
            "structure_rhythm_mouth_gate": {
                "structure": {
                    "verdict": "pass",
                    "functional_part_check": "Verified against Guru sources.",
                    "arbitrary_detail_contamination": "",
                    "findings": []
                },
                "rhythm": {
                    "verdict": "fail",
                    "literal_clarity_check": "Section 2 is too dense.",
                    "transition_breath_check": "Needs more H3 breaks.",
                    "findings": ["C01"]
                },
                "mouthfeel": {
                    "verdict": "pass",
                    "character_voice_check": "Engineering voice maintained.",
                    "slop_check": "Clean.",
                    "findings": []
                }
            },
            "findings": [
                {
                    "finding_id": "C01",
                    "severity": "major",
                    "evidence": "Paragraph 4 has 150+ words without a break.",
                    "required_change": "Split into bullet points or use an H3 header.",
                    "owner": "vibe_writer"
                }
            ],
            "revision_tasks": [
                {
                    "task_id": "R01",
                    "source_finding": "C01",
                    "instruction": "Refactor the 'Kernel Architecture' section for mobile scannability.",
                    "done": False
                }
            ]
        }

        report_name = f"critique_{os.path.basename(draft_path).split('.')[0]}.yaml"
        report_path = os.path.join(self.output_dir, report_name)
        
        with open(report_path, 'w', encoding='utf-8') as f:
            yaml.dump(report, f, sort_keys=False)
        
        print(f"Critique Report generated: {report_path}")
        return report_path

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python vibe_critic.py <path_to_draft>")
        sys.exit(1)
        
    critic = VibeCritic(r'F:\Aisaak\Projects\vibecode-town')
    critic.run_critique(sys.argv[1])
