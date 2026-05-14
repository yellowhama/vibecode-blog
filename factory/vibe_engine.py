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
    log(f"--- v6 AGENTIC ROUTER: Perceiving topic '{topic}' ---")
    # Routing now maps to LLM-Wiki categories
    if "Software 3.0" in topic or "Karpathy" in topic:
        return "LLM_WIKI: GLOBAL/GURUS"
    elif "MCP" in topic or "Next.js" in topic:
        return "LLM_WIKI: GLOBAL/SPECS"
    else:
        return "FAILSAFE: SCOPE_DENIED"

def research_with_wiki_context(slot, topic):
    """
    Stage 0.5: Context Engineering using the existing LLM-Wiki.
    """
    log(f"Stage 0.5: Engineering Context from LLM-Wiki for {slot}...")
    
    sys.path.append(os.path.join(PROJECT_ROOT, 'factory'))
    from context_engineer import WikiContextEngineer
    
    engineer = WikiContextEngineer(PROJECT_ROOT)
    # Using the real LLM-Wiki search method
    engineered_context = engineer.search_wiki_and_rerank(slot, topic)
    
    return engineered_context

def main():
    log("=== VIBECODE-TOWN CONTENT ENGINE v6 (LLM-WIKI EDITION) ===")
    
    topic = "Vibe Coding Technical Contracts in LLM-Wiki"
    route = router(topic)
    
    if "FAILSAFE" in route:
        return

    # Now we search the actual LLM-Wiki
    engineered = research_with_wiki_context("internal_automation", topic)
    log(f"Phase Complete. Agentic RAG is now powered by the LLM-Wiki.")

if __name__ == '__main__':
    main()
