# RAG Protocol: Grounding & Dependency Check

## RAG Protocol: Grounding & Dependency Check

Before generating any code or modifications, you MUST execute the following **Pre-flight Check**:

1. **Verification (Eye-Check):**
    - NEVER assume a file exists based on memory.
    - ALWAYS verify the file path using `ls` or `find` before referencing it.
    - If the file is missing, stop and ask the user for the correct path.
2. **Context Expansion (Dependency-Check):**
    - When modifying a file, analyze its `import` / `require` statements at the top.
    - Identify local dependencies (e.g., `./types`, `../utils`).
    - READ those imported files *before* planning the edit to understand types and logic.

**Constraint:** Do not ask "Where is X defined?" unless you have checked the imports first.