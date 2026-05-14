import os
import json
import random

class ContextEngineer:
    def __init__(self, project_root):
        self.project_root = project_root

    def chunk_and_rerank(self, slot, raw_text, intent_query):
        """
        Simulates the IBM 'Context Engineering' layer.
        1. Breaks raw text into chunks.
        2. Scores chunks based on relevance to the Aha Moment intent.
        3. Returns the Top-3 chunks.
        """
        print(f"[ContextEngineer] Processing context for {slot}...")
        
        # Simulate chunking
        chunks = raw_text.split("\n\n")
        
        # Simulate Re-ranking (scoring based on presence of intent keywords)
        scored_chunks = []
        keywords = intent_query.lower().split()
        
        for chunk in chunks:
            score = sum(1 for word in keywords if word in chunk.lower())
            # Add a bit of 'reasoning' noise reduction
            if score > 0:
                scored_chunks.append({"score": score, "text": chunk})
        
        # Sort by score descending
        scored_chunks.sort(key=lambda x: x['score'], reverse=True)
        
        # Select Top-3
        top_k = scored_chunks[:3]
        
        output_dir = os.path.join(self.project_root, 'research', 'engineered', slot)
        os.makedirs(output_dir, exist_ok=True)
        
        summary_file = os.path.join(output_dir, "context_summary.json")
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(top_k, f, indent=2)
            
        print(f"[ContextEngineer] Engineered context saved to {summary_file}. Chunks selected: {len(top_k)}")
        return top_k

if __name__ == "__main__":
    # Test Run
    engineer = ContextEngineer(r'F:\Aisaak\Projects\vibecode-town')
    dummy_text = "Next.js 15 uses promises for params. This is a breaking change.\\n\\nAlways await params before accessing properties.\\n\\nMarketing slop about AI magic wand.\\n\\nMore technical details about async route handlers."
    engineer.chunk_and_rerank("test_slot", dummy_text, "Next.js 15 async params breaking change")
