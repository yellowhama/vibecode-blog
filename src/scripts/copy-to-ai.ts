
function attachCopyButtons() {
  const codeBlocks = Array.from(document.querySelectorAll("pre"));

  for (const codeBlock of codeBlocks) {
    if (codeBlock.querySelector(".copy-to-ai-btn")) continue;

    const container = document.createElement("div");
    container.className = "copy-to-ai-container absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity";
    
    // Set parent pre to relative
    codeBlock.classList.add("group", "relative");

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-to-ai-btn bg-background/20 hover:bg-background/40 text-[10px] text-foreground px-2 py-1 rounded border border-border/50 backdrop-blur-sm transition-colors";
    copyBtn.innerText = "Copy for AI";
    
    copyBtn.addEventListener("click", () => {
      const code = codeBlock.querySelector("code")?.innerText || "";
      const prompt = `I am reading vibecode.town. Here is a code snippet I want you to analyze/explain:\n\n\`\`\`\n${code}\n\`\`\`\n\nWhat are the key patterns here?`;
      
      navigator.clipboard.writeText(prompt).then(() => {
        copyBtn.innerText = "Copied!";
        setTimeout(() => (copyBtn.innerText = "Copy for AI"), 2000);
      });
    });

    container.appendChild(copyBtn);
    codeBlock.appendChild(container);
  }
}

document.addEventListener("astro:page-load", attachCopyButtons);
attachCopyButtons();
