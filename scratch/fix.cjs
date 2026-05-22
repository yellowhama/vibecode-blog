const fs = require('fs');

let code = fs.readFileSync('src/layouts/PostDetails.astro', 'utf8');

// 1. Add aeoSummary
code = code.replace(
  '  references,\n} = post.data;',
  '  references,\n  aeoSummary,\n} = post.data;'
);
code = code.replace(
  '  references,\r\n} = post.data;',
  '  references,\r\n  aeoSummary,\r\n} = post.data;'
);

// 2. Inject AEO Box
const target = `    <article\n      id="article"\n      class="app-prose app-prose-uses-layout-image mt-8 w-full max-w-app prose-pre:bg-(--shiki-light-bg) dark:prose-pre:bg-(--shiki-dark-bg)"\n    >\n      <Content />`;
const targetCRLF = target.replace(/\n/g, '\r\n');

const replacement = `    <article
      id="article"
      class="app-prose app-prose-uses-layout-image mt-8 w-full max-w-app prose-pre:bg-(--shiki-light-bg) dark:prose-pre:bg-(--shiki-dark-bg)"
    >
      {aeoSummary && (
        <aside aria-label="AI Summary" class="bg-bg-secondary/50 border border-accent/20 rounded-xl p-6 mb-8 shadow-sm not-prose">
          <div class="flex items-center gap-2 mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-accent"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 8l0 4l2 2" /><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" /></svg>
            <h2 class="text-xs font-mono uppercase tracking-widest text-accent font-bold m-0">AEO Summary (TL;DR)</h2>
          </div>
          <p class="text-foreground leading-relaxed font-medium text-sm m-0">
            {aeoSummary}
          </p>
        </aside>
      )}
      <Content />`;
      
code = code.replace(target, replacement);
code = code.replace(targetCRLF, replacement.replace(/\n/g, '\r\n'));

fs.writeFileSync('src/layouts/PostDetails.astro', code);
console.log('Patched PostDetails.astro');
