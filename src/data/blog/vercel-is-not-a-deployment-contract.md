---
title: "Vercel Is Not a Deployment Contract"
pubDatetime: 2026-05-16T09:00:00Z
description: "A Coolify migration audit exposed two hidden Vercel assumptions: rewrites that only existed in vercel.json and a build script that depended on a Unix shell. Learn how to verify your deployment contract."
draft: false
featured: true
series: "Field Log"
workflow: "packet"
tags:
  - software-engineering
  - deployment
  - coolify
  - vercel
  - technical-contracts
ogImage: "/images/posts/vercel-is-not-a-deployment-contract.png"
references:
  - name: "Vercel Rewrites Documentation"
    url: "https://vercel.com/docs/rewrites"
    guru: "Vercel"
  - name: "Coolify GitHub CI/CD Documentation"
    url: "https://coolify.io/docs/applications/ci-cd/github/overview"
    guru: "Coolify"
  - name: "Astro Static Site Build Documentation"
    url: "https://docs.astro.build/en/basics/astro-pages/"
    guru: "Astro"
---

# Vercel Is Not a Deployment Contract

At 1:57 a.m. on 2026-05-21, the Coolify migration audit failed before Coolify ever touched the site.

The portability test was local: build the repo, inspect the static artifact, and ask whether the same behavior would exist on a plain host serving `dist`.

The reader decision is direct: before approving a migration, run the artifact check. If the route, installer, search file, or smoke verifier only exists in the host dashboard, the deployment review is not done.

The repo looked portable. It was an Astro static site. It had a normal build command. But two hidden contracts fell out of the wall:

```txt
vercel.json owned two production routes
package.json depended on cp -r
```

That is not a deployment contract. That is a hosting habit.

The practical rule is simple: if production behavior only exists because one host knows a special file, the repo does not own that behavior yet.

I also rechecked the official docs while revising this: Vercel documents rewrites as platform routing rules, Coolify's GitHub integration is a deploy-from-repository system, and Astro's own pages docs say files in `src/pages/` become site endpoints. That comparison is the whole post. The weaker pattern is "the platform can route it." The stronger pattern is "the repository can build it, a static host can serve it, and a verifier can reject it."

![rendered evidence diagram for deploy surface build, route ownership, and smoke verifier](/images/posts/vercel-is-not-a-deployment-contract.png)

Read the image as the review path, not a deployment illustration. Build output is on the left, route ownership is in the middle, and the smoke test verifier is on the right. If any route only exists in the host layer, the diagram breaks before the migration is approved.

## The Dashboard Lie

The dangerous part was not that the site was broken. The dangerous part was that the site could look fine in the hosting dashboard.

That is how deployment bugs survive. Vercel can make `/sitemap.xml` work with a rewrite. A Linux builder can make `cp -r` work. A preview URL can return 200. Each individual check looks reassuring, but none of them proves the static artifact can survive a host change.

The cost shows up on migration day. Search traffic lands on `/sitemap.xml` and gets a missing file. A setup guide links to `/install.sh` and the static host has nothing to serve. The team burns the launch window arguing about DNS, CDN cache, and Coolify settings when the real failure was already visible in `dist/`.

The better question is uglier and more useful:

```txt
If I delete the hosting platform from the story, what behavior is still inside the repo?
```

That one question caught both failures. The build command was not portable because it depended on a Unix shell. The routes were not portable because they depended on Vercel reading `vercel.json`.

This is why I do not like agent-generated deployment summaries that say "ready for Coolify" after seeing a green local preview. A preview proves the app can render somewhere. It does not prove the app owns its build, routes, installer, search index, sitemap, robots file, and smoke checks.

## Broken System

The first failure was local and obvious:

```txt
npm run build

> astro build && pagefind --site dist && cp -r dist/pagefind public/

'cp' is not recognized as an internal or external command,
operable program or batch file.
```

The site could build on Linux because `cp -r` exists there. It failed on Windows because the build script was shell-specific. Coolify would probably survive this because its builder is Linux, but that is the wrong standard. A build contract should be explicit, not accidentally compatible with one host.

The local failure was useful because it proved the build script had an unstated operating system dependency.

The second failure was quieter:

```json
{
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "/sitemap-index.xml"
    },
    {
      "source": "/install.sh",
      "destination": "https://raw.githubusercontent.com/example/install/main/install.sh"
    }
  ]
}
```

Those routes existed only because Vercel interpreted `vercel.json`. A static host serving `dist` would not know that `/sitemap.xml` should point at `/sitemap-index.xml`, or that `/install.sh` should route to a remote installer.

That is exactly the kind of gap an agent can miss. It sees a working URL and calls the site deployed. The artifact says otherwise.

## The Command That Caught It

The useful review was not a screenshot of a green dashboard. It was a boring file check.

The bad state looked like this:

```txt
package.json
  "build": "astro build && pagefind --site dist && cp -r dist/pagefind public/"

vercel.json
  /install.sh -> https://raw.githubusercontent.com/example/install/main/install.sh
  /sitemap.xml -> /sitemap-index.xml

dist/
  install.sh missing
  sitemap.xml missing unless the host rewrites it
```

That is the moment the review should stop. Not because Vercel did anything wrong, but because the repo was letting Vercel hold production behavior in its pocket.

The repaired state has a different shape:

```txt
package.json
  "build": "astro build && pagefind --site dist && node scripts/copy-pagefind.mjs"

src/pages/sitemap.xml.ts
public/install.sh
scripts/copy-pagefind.mjs
scripts/verify-deploy-surface.mjs
scripts/verify-dist.mjs

dist/
  sitemap.xml present
  install.sh present
  pagefind/pagefind.js present
```

That is a much better sentence than "deployed successfully." It names the ownership transfer.

The release-stopping review command is:

```txt
npm run build
node scripts/verify-deploy-surface.mjs
node scripts/verify-dist.mjs
```

If those commands cannot prove the route or file exists outside the host dashboard, the deployment claim is not done yet.

## Proof Chain

Here is the migration chain as proof, not a dashboard mood:

```txt
Bad output:
- Preview URL returns 200.
- Vercel dashboard routes work.
- Agent says "ready for Coolify."
- dist/ still does not own /sitemap.xml, /install.sh, or the search-copy behavior.

Gate added:
- Run npm run build.
- Run node scripts/verify-deploy-surface.mjs.
- Run node scripts/verify-dist.mjs.
- Reject the migration until the deploy surface exists in source control or generated dist files.

After:
- The repo owns src/pages/sitemap.xml.ts, public/install.sh, scripts/copy-pagefind.mjs, scripts/verify-deploy-surface.mjs, and scripts/verify-dist.mjs.
- The current accepted review, zero-item revision plan, approval record, and current content digest point at the revised article.
- The rendered audit checks desktop/mobile first-screen image evidence and the image rule instead of trusting a dashboard screenshot.
```

That is the difference between "the host can serve it" and "the repository can prove it." The first is a platform habit. The second is a deployment contract.

## Hidden Contract Table

| Hidden dependency | Why it mattered | Repo-owned replacement |
| --- | --- | --- |
| Vercel rewrite for `/sitemap.xml` | Static hosts would miss the expected route | `src/pages/sitemap.xml.ts` |
| Vercel rewrite for `/install.sh` | The deploy artifact did not contain the file | `public/install.sh` |
| Unix `cp -r` | Windows build failed | Node copy script |
| Host analytics injection | Platform behavior was not app behavior | Accepted Vercel-only boundary |

This is exactly how agentic operations produce slop. The agent says "Astro static site, deployable anywhere." The repo says "not quite."

The table is the part worth copying into future deployment reviews. Do not ask only whether a feature works. Ask who owns it. If the answer is "the host understands a config file," then you have a platform behavior, not an application behavior.

## Control Surface

The fix was to turn hidden host behavior into repo-owned behavior.

The Pagefind copy step moved from shell syntax to Node:

```js
import { cp, rm } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("dist/pagefind");
const target = resolve("public/pagefind");

await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });
```

The build command is now:

```json
{
  "build": "astro build && pagefind --site dist && node scripts/copy-pagefind.mjs"
}
```

Then the Vercel-only routes became static-host portable:

```txt
src/pages/sitemap.xml.ts
public/install.sh
```

Now `/sitemap.xml` is produced by the app, and `/install.sh` is a real file in the deploy artifact.

The important change is ownership. The behavior moved from host interpretation into source-controlled code and files.

That also changes how an agent should report the work. "I deployed it" is too broad. "The repo now builds `dist/sitemap.xml`, `dist/install.sh`, and `dist/pagefind`, and `scripts/verify-deploy-surface.mjs` blocks hidden external rewrites" is inspectable.

The second sentence is less smooth. It is also the one you can trust.

## Deployment Contract Checklist

Before calling a site portable, verify:

Next time an agent says a site is "ready for Coolify" or "ready to move off Vercel," paste this checklist into the review before opening the hosting dashboard.

```txt
npm ci
npm run build
npm run lint
npm audit --audit-level=high
static artifact contains expected routes
host rewrites are either removed or reproduced in repo-owned files
build scripts avoid host-specific shell assumptions
platform-only behavior is named as a boundary
```

Current state:

```txt
Build: pass
Static artifact gate: pass
Deploy surface gate: pass
Full lint: pass
Portable routes: /sitemap.xml and /install.sh generated into dist
Search asset: dist/pagefind/pagefind.js present
```

That is the standard Vibecode Town should use before moving a site to Coolify.

The reader version is the same: test the artifact, not the platform dashboard.

Forward this to the teammate who says "the preview URL works, so we can migrate." The decision is narrow: can they approve the deployment from the host dashboard, or do they need a clean static artifact with routes, installer, search files, and verifier output before the migration is real?

## The Three-Question Review

For agentic projects, I now use a smaller review before accepting any deployment claim:

| Question | Good answer | Bad answer |
| --- | --- | --- |
| Can the behavior be found in source control? | Route, file, script, or generated artifact exists in the repo/build output. | "The host maps it for us." |
| Can a clean machine reproduce it? | `npm ci` and `npm run build` produce the same deploy surface. | "It worked in my dashboard." |
| Can a verifier reject drift? | A script checks the route, file, or config boundary. | A human remembers to click around. |

That review is deliberately boring. It is supposed to be. Deployment contracts should be boring in the same way seatbelts are boring: you do not want to discover whether they exist after impact.

## Field Receipt

The portability lesson now has a repeatable site-level receipt:

```txt
npm run verify:site-quality
```

That command does more than build the Astro site. It runs the public content gates, builds `dist`, indexes Pagefind, captures rendered post screenshots, checks publication reviews, verifies deploy artifacts, and runs the field-log gate.

The baseline run for this revision produced the shape this article argues for. This receipt is deliberately dated because an undated deployment receipt becomes the same problem as a dashboard memory: it may be true, but the next reviewer cannot tell when it stopped being true.

```txt
receipt date: 2026-05-21
receipt baseline commit: 24785f9
static pages built: 41
Pagefind indexed words: 2128
public posts rendered: 10
rendered viewports checked: 24
rendered_page_post_detail_first_screen_images_desktop: 10/10
rendered_page_post_detail_first_screen_images_mobile: 10/10
rendered_page_surface_expected_images_first_screen: 2/2
rendered summary.json: <rendered-audit-root>\summary.json
image rule: /images/posts/vercel-is-not-a-deployment-contract.png
publication reviews checked: 10
wiki markdown files indexed: 352
archive files copied: 384
deploy surface gate: pass
static artifact verification: pass
```

The plain-language receipt is this: on 2026-05-21, baseline commit `24785f9` produced 41 pages, 10 posts, 24 viewports, 10/10 desktop images, 10/10 mobile images, 2128 words, 352 files indexed, and 384 files archived. The latest rendered summary SHA-256 was `39ace97df604c2fb2abad56b023a7d3c207d73ef44912fbc96d7678646b79207`.

That is the deployment-contract mindset applied back to the blog itself: the dashboard is not the proof. The artifact and the verifier are the proof.

## Boundary

This does not prove Coolify production is ready.

This verifies the static artifact and deployment assumptions, not every future host migration. It also does not solve every dependency advisory. The high-severity audit gate is clean, but npm still reports moderate Astro and YAML advisories that require breaking changes to remove completely.

That is an accepted boundary, not a hidden failure.

## Technical Verdict

If a route exists only in the host dashboard, it is not part of the app.

If a build works only because the host shell happens to support a command, it is not portable.

The contract has to live in the repo. Coolify did not create this rule. It just made the missing contract visible.

Before accepting the next deployment claim, run the artifact verifier and reject the migration if the proof still lives in a host dashboard. The boundary is simple: a live host can be useful evidence, but it is not the contract.
