import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const output = resolve("public/images/posts/writing-harness-not-more-prompts.png");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f8f1e7"/>
  <g stroke="#ddcdbd" stroke-width="1">
    ${Array.from({ length: 31 }, (_, index) => `<line x1="${index * 40}" y1="0" x2="${index * 40}" y2="630"/>`).join("")}
    ${Array.from({ length: 16 }, (_, index) => `<line x1="0" y1="${index * 40}" x2="1200" y2="${index * 40}"/>`).join("")}
  </g>
  <rect x="58" y="58" width="1084" height="514" rx="26" fill="#fffaf2" stroke="#ddcdbd" stroke-width="2"/>
  <text x="92" y="118" font-family="Consolas, monospace" font-size="24" font-weight="700" fill="#7a4f9a">VIBECODE / DRAFT VISUAL</text>
  <text x="92" y="186" font-family="Georgia, serif" font-size="48" font-weight="700" fill="#21170f">Writing Harness</text>
  <text x="94" y="234" font-family="Georgia, serif" font-size="28" fill="#6f6257">Better prose comes from loops, not vibes</text>

  <g transform="translate(92 310)">
    <rect x="0" y="0" width="210" height="64" rx="12" fill="#f8f1e7" stroke="#21170f" stroke-width="3"/>
    <text x="24" y="39" font-family="Consolas, monospace" font-size="22" fill="#21170f">source packet</text>
    <path d="M220 32 L286 32" stroke="#7a4f9a" stroke-width="6" stroke-linecap="round"/>
    <path d="M274 18 L292 32 L274 46" fill="none" stroke="#7a4f9a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="310" y="0" width="210" height="64" rx="12" fill="#f8f1e7" stroke="#21170f" stroke-width="3"/>
    <text x="337" y="39" font-family="Consolas, monospace" font-size="22" fill="#21170f">draft:true</text>
    <path d="M530 32 L596 32" stroke="#7a4f9a" stroke-width="6" stroke-linecap="round"/>
    <path d="M584 18 L602 32 L584 46" fill="none" stroke="#7a4f9a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="620" y="0" width="210" height="64" rx="12" fill="#f8f1e7" stroke="#21170f" stroke-width="3"/>
    <text x="653" y="39" font-family="Consolas, monospace" font-size="22" fill="#21170f">critique</text>
    <path d="M840 32 L906 32" stroke="#7a4f9a" stroke-width="6" stroke-linecap="round"/>
    <path d="M894 18 L912 32 L894 46" fill="none" stroke="#7a4f9a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="930" y="0" width="116" height="64" rx="12" fill="#7a4f9a" stroke="#21170f" stroke-width="3"/>
    <text x="955" y="39" font-family="Consolas, monospace" font-size="22" fill="#fffaf2">ship?</text>
  </g>

  <g transform="translate(708 152)">
    <rect x="0" y="0" width="390" height="314" rx="22" fill="#f8f1e7" stroke="#ddcdbd" stroke-width="3"/>
    <text x="38" y="54" font-family="Consolas, monospace" font-size="22" font-weight="700" fill="#21170f">keep / revert loop</text>
    <path d="M74 138 C74 78 168 78 168 138 C168 198 74 198 74 138" fill="none" stroke="#7a4f9a" stroke-width="7"/>
    <path d="M217 138 C217 78 311 78 311 138 C311 198 217 198 217 138" fill="none" stroke="#7a4f9a" stroke-width="7"/>
    <path d="M166 138 L223 138" stroke="#21170f" stroke-width="6" stroke-linecap="round"/>
    <path d="M209 124 L226 138 L209 152" fill="none" stroke="#21170f" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="76" y="242" font-family="Consolas, monospace" font-size="20" fill="#6f6257">trace -> score -> edit</text>
    <text x="76" y="274" font-family="Consolas, monospace" font-size="20" fill="#6f6257">human taste stays final</text>
  </g>

  <rect x="96" y="480" width="520" height="60" rx="10" fill="none" stroke="#7a4f9a" stroke-width="5"/>
  <text x="122" y="518" font-family="Consolas, monospace" font-size="22" fill="#21170f">prompt tweaks are not a system</text>
</svg>`;

await mkdir(dirname(output), { recursive: true });
await sharp(Buffer.from(svg)).png().toFile(output);
process.stdout.write(`writing_harness_draft_visual=${output}\n`);
