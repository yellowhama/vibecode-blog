import os
import yaml
import sys
import datetime

class VibeCritic:
    def __init__(self, project_root):
        self.project_root = project_root
        self.output_dir = os.path.join(project_root, 'reviews')
        os.makedirs(self.output_dir, exist_ok=True)

    def split_sections(self, content):
        import re
        body = content
        frontmatter_match = re.match(r'^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$', content)
        if frontmatter_match:
            body = frontmatter_match.group(2)
            
        sections = []
        current_heading = "introduction"
        current_lines = []
        
        for line in body.splitlines():
            heading_match = re.match(r'^##\s+(.+)$', line)
            if heading_match:
                sections.append({
                    "heading": current_heading.lower(),
                    "text": "\n".join(current_lines).strip()
                })
                current_heading = heading_match.group(1).strip()
                current_lines = []
            else:
                current_lines.append(line)
                
        sections.append({
            "heading": current_heading.lower(),
            "text": "\n".join(current_lines).strip()
        })
        return sections

    def is_technical_section(self, heading):
        technical_keywords = [
            "mechanism", "checklist", "decision matrix", "contract", "runbook",
            "workflow", "verdict", "pipeline", "architecture", "control surface",
            "rule", "evidence", "implementation"
        ]
        return any(keyword in heading for keyword in technical_keywords)

    def run_critique(self, draft_path):
        if not os.path.exists(draft_path):
            print(f"Draft not found: {draft_path}")
            return

        with open(draft_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        # Auditor System Prompt (Internal Reference)
        # 1. SRM Gate: Fail if poetic/flowery, Fail if inaccurate.
        # 2. 10-Question Audit: Focus on "Show the Scars" and "Aha Moment."
        
        report = {
            "schema": "critique_revision_recheck",
            "projectId": "vibecode-town",
            "workId": os.path.basename(draft_path),
            "created_at": datetime.datetime.now().isoformat(),
            "owner": "vibe_critic",
            "draft_path": draft_path,
            "verdict": "pass", # Default pass for simulation
            "structure_rhythm_mouth_gate": {
                "structure": {"verdict": "pass", "findings": []},
                "rhythm": {"verdict": "pass", "findings": []},
                "mouthfeel": {"verdict": "pass", "findings": []}
            },
            "findings": [],
            "revision_tasks": []
        }

        # Check for banned metaphors ONLY in technical sections
        sections = self.split_sections(content)
        has_banned_metaphor = False
        evidence_list = []
        for sec in sections:
            heading = sec["heading"]
            text = sec["text"]
            if self.is_technical_section(heading):
                for word in ["ocean", "drift", "castaway"]:
                    if word in text.lower():
                        has_banned_metaphor = True
                        evidence_list.append(f"Found flowery metaphor '{word}' in technical section '{heading}'.")

        if has_banned_metaphor:
            report["verdict"] = "fix required"
            report["structure_rhythm_mouth_gate"]["mouthfeel"]["verdict"] = "fail"
            report["findings"].append({
                "finding_id": "M01",
                "severity": "major",
                "evidence": " ".join(evidence_list),
                "required_change": "Purge all poetic metaphors from technical sections. Use dry engineering language.",
                "owner": "vibe_writer"
            })
            report["revision_tasks"].append({
                "task_id": "R01",
                "source_finding": "M01",
                "instruction": "Rewrite the technical sections to remove 'ocean', 'drift', and 'castaway' metaphors.",
                "done": False
            })

        report_name = f"critique_{os.path.basename(draft_path).split('.')[0]}.yaml"
        report_path = os.path.join(self.output_dir, report_name)
        
        with open(report_path, 'w', encoding='utf-8', errors='ignore') as f:
            yaml.dump(report, f, sort_keys=False)
        
        print(f"Critique Report generated: {report_path}")
        return report_path

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python vibe_critic.py <path_to_draft>")
        sys.exit(1)
        
    critic = VibeCritic(r'F:\Aisaak\Projects\vibecode-town')
    critic.run_critique(sys.argv[1])

