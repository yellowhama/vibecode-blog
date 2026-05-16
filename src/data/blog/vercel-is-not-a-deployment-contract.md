---
title: "Vercel Is Not a Deployment Contract"
pubDatetime: 2026-05-16T03:20:00Z
description: "A Coolify migration audit exposed two hidden Vercel assumptions: rewrites that only existed in vercel.json and a build script that depended on a Unix shell."
draft: false
featured: true
series: "MUSU Build Log"
tags: ["engineering", "deployment", "coolify", "technical-contracts"]
ogImage: "/images/posts/pencil-technical-contract.png"
references:
  - name: "Coolify GitHub CI/CD Documentation"
    url: "https://coolify.io/docs/applications/ci-cd/github/overview"
    guru: "Coolify"
  - name: "Astro Static Site Build Documentation"
    url: "https://docs.astro.build/en/basics/astro-pages/"
    guru: "Astro"
---

# Vercel Is Not a Deployment Contract

The Coolify migration audit failed before Coolify ever touched the site.

The repo looked portable. It was an Astro static site. It had a `dist` folder. It had a normal build command. But the moment I treated `vibecode.town` as something that should build on any host, two hidden contracts fell out of the wall:

```txt
vercel.json owned two production routes
package.json depended on cp -r
```

That is not a deployment contract. That is a hosting habit.

![Deployment contract sketch](../../../public/images/posts/pencil-technical-contract.png)

## Broken System

The first failure was local and obvious:

```txt
npm run build

> astro build && pagefind --site dist && cp -r dist/pagefind public/

'cp' is not recognized as an internal or external command,
operable program or batch file.
```

The site could build on Linux because `cp -r` exists there. It failed on Windows because the build script was shell-specific. Coolify would probably survive this because its builder is Linux, but that is the wrong standard. A build contract should be explicit, not accidentally compatible with one host.

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
      "destination": "https://raw.githubusercontent.com/yellowhama/musu-bee/main/install.sh"
    }
  ]
}
```

Those routes existed only because Vercel interpreted `vercel.json`. A static host serving `dist` would not know that `/sitemap.xml` should point at `/sitemap-index.xml`, or that `/install.sh` should route to the MUSU installer.

## Bad Default

The bad default is assuming a platform feature is part of the app.

If a deployment agent reads only `package.json`, it sees this:

```txt
Install: npm ci
Build: npm run build
Publish: dist
```

That is not enough. The actual production behavior also depended on:

```txt
vercel.json rewrites
Unix cp command
Vercel Analytics injection
```

This is exactly how agentic operations produce slop. The agent says "Astro static site, deployable anywhere." The repo says "not quite."

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

## Result

The deployment contract is now testable without guessing what Vercel will do:

```txt
npm ci
npm run build
npm run lint
npm audit --audit-level=high
```

Current state:

```txt
Build: pass
High audit gate: pass
Full lint: pass after excluding non-site pipeline folders
Portable routes: /sitemap.xml and /install.sh generated into dist
```

That is the standard Vibecode Town should use before moving a site to Coolify.

## Boundary

This does not prove Coolify production is ready.

Hetzner identity verification is still blocked, so the actual `staging.vibecode.town` deployment has not happened. It also does not solve every dependency advisory. The high-severity audit gate is clean, but npm still reports moderate Astro and YAML advisories that require breaking changes to remove completely.

That is an accepted boundary, not a hidden failure.

## Technical Verdict

If a route exists only in the host dashboard, it is not part of the app.

If a build works only because the host shell happens to support a command, it is not portable.

The contract has to live in the repo. Coolify did not create this rule. It just made the missing contract visible.

[Read the MUSU technical contract direction](https://musu.pro)
