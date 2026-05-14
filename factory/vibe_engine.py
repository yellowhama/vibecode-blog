import os
import json
import subprocess
import datetime
import sys

# Configuration
PROJECT_ROOT = r'F:\Aisaak\Projects\vibecode-town'
VENV_PYTHON = r'F:\BW\writer\ъ⑸援\crawl4ai\.venv\Scripts\python.exe'

def log(msg):
    print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {msg}")

def scout():
    log("Stage -1: Scouting for high-signal technical assets...")
    scout_list = {
        "morning": {"type": "Magnet", "topic": "MCP Server Examples", "urls": ["https://modelcontextprotocol.io/examples"]},
        "lunch": {"type": "Beacon", "topic": "Andrej Karpathy LLM OS", "urls": ["https://karpathy.ai/blog/llm-os"]},
        "evening": {"type": "FieldLog", "topic": "Scaling MUSU with Rust", "urls": []}
    }
    with open(os.path.join(PROJECT_ROOT, 'research', 'scout-list.json'), 'w') as f:
        json.dump(scout_list, f, indent=2)
    log("Scout list updated.")

def research():
    log("Stage 0: Crawl4AI Deep Capture...")
    # Simulation
    log("Research phase complete.")

def draft():
    log("Stage 1 & 2: Vibe-Musu Drafting...")
    # Simulation
    log("Drafting complete.")

def audit():
    log("Stage 3: Technical Critique Gate (SRM Audit)...")
    critic_script = os.path.join(PROJECT_ROOT, 'factory', 'vibe_critic.py')
    drafts = [f for f in os.listdir(os.path.join(PROJECT_ROOT, 'drafts')) if f.endswith('_v1.md')]
    
    for d in drafts:
        draft_path = os.path.join(PROJECT_ROOT, 'drafts', d)
        log(f"Auditing: {d}...")
        subprocess.run([sys.executable, critic_script, draft_path], check=True)
    log("Audit phase complete. Check reviews/ folder for findings.")

def main():
    if len(sys.argv) < 2:
        print("Usage: python vibe_engine.py [scout|research|draft|audit|all]")
        return
    
    mode = sys.argv[1]
    if mode == 'scout' or mode == 'all': scout()
    if mode == 'research' or mode == 'all': research()
    if mode == 'draft' or mode == 'all': draft()
    if mode == 'audit' or mode == 'all': audit()
    
    log("Cycle phase complete.")

if __name__ == '__main__':
    main()
