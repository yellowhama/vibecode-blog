import os
import json
import subprocess
import datetime
import sys

# Configuration
PROJECT_ROOT = r'F:\Aisaak\Projects\vibecode-town'

def log(msg):
    print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {msg}")

def router(topic):
    """
    Simulates the IBM 'Agentic RAG' Router.
    """
    log(f"--- AGENTIC ROUTER: Perceiving topic '{topic}' ---")
    if "Software 3.0" in topic or "Karpathy" in topic:
        return "DATABASE_A: GURU_INSIGHTS"
    elif "MCP" in topic or "Next.js" in topic:
        return "DATABASE_B: TECH_SPECS"
    else:
        return "FAILSAFE: SCOPE_DENIED"

def research_with_context_engineering(slot, topic, raw_content):
    """
    Stage 0 & 0.5: Beacon Capture + Context Engineering
    """
    log(f"Stage 0: Beacon Capture for {slot}...")
    
    # Import the newly created tool
    sys.path.append(os.path.join(PROJECT_ROOT, 'factory'))
    from context_engineer import ContextEngineer
    
    engineer = ContextEngineer(PROJECT_ROOT)
    engineered_context = engineer.chunk_and_rerank(slot, raw_content, topic)
    
    return engineered_context

def main():
    log("=== VIBECODE-TOWN CONTENT ENGINE v6 (AGENTIC RAG EDITION) ===")
    
    # Example Slot run
    topic = "Next.js 15 Async Params Breaking Changes"
    route = router(topic)
    log(f"Route Selected: {route}")
    
    if "FAILSAFE" in route:
        log("Failsafe triggered. Terminating loop.")
        return

    # Simulation of raw capture
    raw_content = "Some long text about Next.js 15...\\n\\nBreaking: params is now a Promise.\\n\\nOther irrelevant marketing stuff."
    engineered = research_with_context_engineering("morning", topic, raw_content)
    
    log(f"Cycle Phase Complete. {len(engineered)} high-signal chunks ready for Tech Brief.")

if __name__ == '__main__':
    main()
