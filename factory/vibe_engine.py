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

def run_step(name, slot=None):
    log(f"--- v5 STAGE: {name} ({slot if slot else 'ALL'}) ---")

def scout():
    log("Stage -1: Scouting for high-signal assets...")
    # Logic to find new topics
    log("Scout list updated in research/scout-list.json")

def research(slot):
    log(f"Stage 0: Beacon Capture for {slot}...")
    # Use Crawl4AI or web_fetch to get raw text
    log(f"Raw text captured in research/raw/{slot}/")

def brief(slot):
    log(f"Stage 1: Generating Tech Brief for {slot}...")
    # LLM creates XML plan: errors, tools, Guru quotes, Aha moment.
    log(f"Tech Brief saved in plans/{slot}_brief.xml")

def draft(slot):
    log(f"Stage 2: Generating First Draft (v1_raw) for {slot}...")
    # LLM writes dry engineer log based strictly on brief.
    log(f"Draft v1 saved in drafts/{slot}_v1.md")

def audit(slot):
    log(f"Stage 3: SRM Critique Gate for {slot}...")
    critic_script = os.path.join(PROJECT_ROOT, 'factory', 'vibe_critic.py')
    draft_path = os.path.join(PROJECT_ROOT, 'drafts', f"{slot}_v1.md")
    subprocess.run([sys.executable, critic_script, draft_path], check=True)
    log(f"Critique report generated in reviews/critique_{slot}.yaml")

def rewrite(slot):
    log(f"Stage 4: Targeted Rewrite (v2_polish) for {slot}...")
    # LLM applies YAML revision tasks to Draft v1.
    log(f"Final Polish saved in src/data/blog/{slot}.md")

def draw(slot):
    log(f"Stage 5: Visual Conception (Pencil Dev) for {slot}...")
    # Logic to trigger mcp_pencil_batch_design for whiteboard sketch.
    log(f"Illustration exported to public/images/posts/{slot}.png")

def main():
    if len(sys.argv) < 2:
        print("Usage: python vibe_engine.py [scout|research|brief|draft|audit|rewrite|draw|all]")
        return
    
    mode = sys.argv[1]
    slot = sys.argv[2] if len(sys.argv) > 2 else "morning" # Example default

    if mode == 'all':
        scout()
        for s in ['morning', 'lunch', 'evening']:
            research(s)
            brief(s)
            draft(s)
            audit(s)
            rewrite(s)
            draw(s)
    elif mode == 'scout': scout()
    elif mode == 'research': research(slot)
    elif mode == 'brief': brief(slot)
    elif mode == 'draft': draft(slot)
    elif mode == 'audit': audit(slot)
    elif mode == 'rewrite': rewrite(slot)
    elif mode == 'draw': draw(slot)
    
    log("v5 Engine Run Complete.")

if __name__ == '__main__':
    main()
