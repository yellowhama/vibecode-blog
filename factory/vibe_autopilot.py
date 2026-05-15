import os
import json
import subprocess
import datetime
import sys

PROJECT_ROOT = r'F:\Aisaak\Projects\vibecode-town'

class VibecodeAutopilot:
    def __init__(self):
        sys.path.append(os.path.join(PROJECT_ROOT, 'factory'))
        from context_engineer import WikiContextEngineer
        self.engineer = WikiContextEngineer(PROJECT_ROOT)

    def log(self, message):
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] [COO] {message}")

    def run_shell(self, command):
        result = subprocess.run(command, capture_output=True, text=True, shell=True, cwd=PROJECT_ROOT)
        return result

    def execute_cycle(self, topic):
        self.log(f"Starting cycle for: {topic}")
        self.engineer.search_wiki("autopilot", topic)
        
        self.log("Syncing to Git...")
        # Use single quotes for the commit message in shell
        self.run_shell("git add .")
        self.run_shell('git commit -m "feat: autopilot autonomous sync"')
        res = self.run_shell("git push origin main")
        
        if res.returncode == 0:
            self.log("SUCCESS: Company is now synced.")
        else:
            self.log(f"FAILURE: {res.stderr}")

if __name__ == "__main__":
    coo = VibecodeAutopilot()
    coo.execute_cycle("Company Autonomy Test")
