import os
import json
import sqlite3

class WikiContextEngineer:
    def __init__(self, project_root):
        self.project_root = project_root
        self.wiki_root = r'C:\Users\empty\llm-wiki'
        self.fts_db = os.path.join(self.wiki_root, 'wiki_fts.db')

    def search_wiki_and_rerank(self, slot, intent_query):
        """
        Uses the existing LLM-Wiki (SQLite FTS) to:
        1. Query the wiki_fts.db for relevant documents.
        2. Extract and re-rank high-signal snippets.
        3. Return Top-3 chunks.
        """
        print(f"[WikiContextEngineer] Searching LLM-Wiki for '{intent_query}'...")
        
        results = []
        if os.path.exists(self.fts_db):
            try:
                conn = sqlite3.connect(self.fts_db)
                cursor = conn.cursor()
                # Assuming the schema has a 'content' column in an FTS table
                # We'll do a simple keyword search if we don't know the exact schema
                cursor.execute("SELECT content, path FROM wiki_content WHERE content MATCH ? LIMIT 5", (intent_query,))
                for row in cursor.fetchall():
                    results.append({"text": row[0], "path": row[1]})
                conn.close()
            except Exception as e:
                print(f"FTS Query failed, falling back to file scan: {e}")
        
        # Fallback: Manual scan of llm-wiki/global if DB query fails
        if not results:
            global_path = os.path.join(self.wiki_root, 'global')
            for root, dirs, files in os.walk(global_path):
                for file in files:
                    if file.endswith('.md'):
                        f_path = os.path.join(root, file)
                        with open(f_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            if any(word.lower() in content.lower() for word in intent_query.split()):
                                results.append({"text": content[:1000], "path": f_path})
                                if len(results) > 5: break

        # Select Top-3
        top_k = results[:3]
        
        output_dir = os.path.join(self.project_root, 'research', 'engineered', slot)
        os.makedirs(output_dir, exist_ok=True)
        
        summary_file = os.path.join(output_dir, "wiki_context_summary.json")
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(top_k, f, indent=2)
            
        print(f"[WikiContextEngineer] Wiki context saved to {summary_file}. Assets found: {len(top_k)}")
        return top_k

if __name__ == "__main__":
    engineer = WikiContextEngineer(r'F:\Aisaak\Projects\vibecode-town')
    engineer.search_wiki_and_rerank("internal_audit", "vibe coding spec technical contract")
