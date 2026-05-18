import os
import json

class WikiContextEngineer:
    def __init__(self, project_root):
        self.project_root = project_root
        self.wiki_root = r'F:\Aisaak\CompanyArtifacts\llm-wiki-completed'

    def search_wiki(self, slot, intent_query):
        print(f"[WikiContextEngineer] Searching LLM-Wiki for '{intent_query}'...")
        results = []
        for root, dirs, files in os.walk(self.wiki_root):
            for file in files:
                if file.endswith('.md'):
                    f_path = os.path.join(root, file)
                    try:
                        with open(f_path, 'r', encoding='utf-8') as f:
                            data = f.read()
                            if any(word.lower() in data.lower() for word in intent_query.split()):
                                results.append({"title": file, "snippet": data[:300], "path": f_path})
                    except: pass
        top_k = results[:3]
        output_dir = os.path.join(self.project_root, 'research', 'engineered', slot)
        os.makedirs(output_dir, exist_ok=True)
        with open(os.path.join(output_dir, "wiki_context_summary.json"), 'w', encoding='utf-8') as f:
            json.dump(top_k, f, indent=2)
        print(f"[WikiContextEngineer] Found {len(results)} matches. Saved to research/engineered/{slot}/")
        return top_k

if __name__ == "__main__":
    engineer = WikiContextEngineer(r'F:\Aisaak\Projects\vibecode-town')
    engineer.search_wiki("real_verification", "agentic rag spec")
