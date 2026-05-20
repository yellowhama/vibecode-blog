---
title: "Vercel Is Not a Deployment Contract"
pubDatetime: 2026-05-16T09:00:00Z
description: "A Coolify migration audit exposed two hidden Vercel assumptions: rewrites that only existed in vercel.json and a build script that depended on a Unix shell."
draft: false
featured: true
series: "Field Log"
workflow: "packet"
tags: ["engineering", "deployment", "coolify", "technical-contracts"]
ogImage: "/images/posts/vercel-is-not-a-deployment-contract.png"
references:
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

The repo looked portable. It was an Astro static site. It had a normal build command. But two hidden contracts fell out of the wall:

```txt
vercel.json owned two production routes
package.json depended on cp -r
```

That is not a deployment contract. That is a hosting habit.

The practical rule is simple: if production behavior only exists because one host knows a special file, the repo does not own that behavior yet.

I also rechecked the official docs while revising this: Coolify's GitHub integration is a deploy-from-repository system, and Astro's own pages docs say files in `src/pages/` become site endpoints. That is the exact ownership line this post is about. If the behavior is a route, page, or file, make the repo produce it. Do not ask the host dashboard to remember it for you.

![Deployment contract build route smoke test diagram](/images/posts/vercel-is-not-a-deployment-contract.png)

## The Dashboard Lie

The dangerous part was not that the site was broken. The dangerous part was that the site could look fine in the hosting dashboard.

That is how deployment bugs survive. Vercel can make `/sitemap.xml` work with a rewrite. A Linux builder can make `cp -r` work. A preview URL can return 200. Each individual check looks reassuring, but none of them proves the static artifact can survive a host change.

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

That command does more than build the Astro site. It runs the public content gates, builds `dist`, indexes Pagefind, captures rendered post screenshots, checks publication approvals, verifies deploy artifacts, and runs the field-log gate.

The latest completed run produced the shape this article argues for:

```txt
static pages built: 41
Pagefind indexed words: 1950
public posts rendered: 10
rendered viewports checked: 24
publication approvals checked: 10
deploy surface gate: pass
static artifact verification: pass
```

That is the deployment-contract mindset applied back to the blog itself: the dashboard is not the proof. The artifact and the verifier are the proof.

## Boundary

This does not prove Coolify production is ready.

Hetzner identity verification is still blocked, so the actual `staging.vibecode.town` deployment has not happened. It also does not solve every dependency advisory. The high-severity audit gate is clean, but npm still reports moderate Astro and YAML advisories that require breaking changes to remove completely.

That is an accepted boundary, not a hidden failure.

## Technical Verdict

If a route exists only in the host dashboard, it is not part of the app.

If a build works only because the host shell happens to support a command, it is not portable.

The contract has to live in the repo. Coolify did not create this rule. It just made the missing contract visible.
