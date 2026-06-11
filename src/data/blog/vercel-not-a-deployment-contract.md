---
slug: vercel-not-a-deployment-contract
title: "Vercel Is Not a Deployment Contract: What Auto-Deploy Silently Breaks, and How to Fix It"
description: "Push-to-deploy on Vercel feels like a contract, but it's a default. A field note on three silent breakage classes — runtime mutation, version skew, asymmetric rollback — and the explicit contracts that close them."
pubDatetime: 2026-06-11T00:00:00Z
tags: [vercel, deployment-contracts, version-skew, ci-cd, platform-engineering, field-log]
series: Field Log
draft: false
references:
  - name: Vercel Docs — Deployments with Git
    url: https://vercel.com/docs/git
  - name: Vercel Docs — Node.js Versions
    url: https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
  - name: Vercel GitHub Discussion #8238 — Pinning exact Node versions
    url: https://github.com/vercel/vercel/discussions/8238
  - name: Vercel Changelog — Node.js 16 Deprecation
    url: https://vercel.com/changelog/node-js-16-deprecation
  - name: Vercel Changelog — Legacy Build Image Deprecation
    url: https://vercel.com/changelog/legacy-build-image-is-being-deprecated
  - name: Vercel Docs — Skew Protection
    url: https://vercel.com/docs/skew-protection
  - name: Vercel Blog — Version Skew Protection (2023-06-21)
    url: https://vercel.com/blog/version-skew-protection
  - name: Vercel Docs — Instant Rollback
    url: https://vercel.com/docs/instant-rollback
  - name: Vercel Docs — vercel.json (ignoreCommand)
    url: https://vercel.com/docs/project-configuration/vercel-json
  - name: Vercel Docs — Git Configuration
    url: https://vercel.com/docs/project-configuration/git-configuration
  - name: Vercel Docs — Configuring a Build
    url: https://vercel.com/docs/builds/configure-a-build
---

You searched "Vercel deployment failed silently" because production just broke and no commit explains it. The uncomfortable answer: nothing failed silently. A *default* changed, exactly as documented — and you had mistaken that default for a contract.

"Push to `main` and Vercel handles it" is the pitch, and the docs back it up: every push to any branch deploys, every merge to the production branch goes live. That behavior is real. But a contract binds *both* parties. A default belongs to the platform, which can reschedule it. The gap between the two is where deployments break with no diff to blame.

This post catalogs three breakage classes, each backed by Vercel's own documentation, and the explicit contract that closes each one:

| Breakage class | What changes without a commit | The closing contract |
|---|---|---|
| Platform mutation | Runtime versions roll; build images expire on calendar dates | `engines.node` major pin + deprecation dates on the team calendar |
| Version skew | Open tabs run stale client code against new servers | Skew max age sized to real session length + N-version API compatibility |
| Asymmetric rollback | Rollback restores the build but not the config, and disables promotion | A runbook: diff env vars, explicitly re-enable promotion |

It ends with how this maps onto our own autopublish stack, because we learned the same lesson at a different layer.

## Breakage class 1: the platform mutates under you

Your build environment changes without a commit. Vercel's documentation describes three mechanisms.

**Runtime versions auto-roll.** Vercel lets you select only *major* Node versions (24.x, 22.x, 20.x) and states plainly that it "automatically rolls out minor and patch updates when needed." There is no opt-out. Exact pins like `16.16.0` are not enforced — they produce a build warning and get coerced, a behavior users discovered the hard way in [discussion #8238](https://github.com/vercel/vercel/discussions/8238), where even the maintainer's initial answer had to be corrected.

**Loose ranges jump majors.** Per the version-mapping table in the Node.js docs, `"engines": { "node": ">=20.0.0" }` resolves to the **latest 24.x**. That is a semver-major runtime jump, triggered by Vercel adding a version to its availability list — not by anything in your repository. If your code was only ever tested on 20, the diff that broke it does not exist in git.

**Deprecations break builds on a calendar date.** Node 16 was disabled in project settings on **January 31, 2025**: new deployments error, existing ones keep serving. The legacy build image followed on **September 1, 2025**: after that date, new builds display an error. Note the shape of this failure — it is *deferred*. Running production is untouched, so the breakage detonates at your **next** deploy, which by Murphy's law is the urgent hotfix at 2 a.m. The fix for the actual bug is one line; the build fails for a reason that has nothing to do with it.

One more mutation is easy to forget: builds run on a shallow clone (`git clone --depth=10`), and install/build commands are framework-auto-detected unless you override them. An `ignoreCommand` or build script that assumes deep history works — until commit number eleven.

**The contract:** pin the major explicitly in code, where it gets reviewed:

```json
// package.json
{
  "engines": { "node": "24.x" }
}
```

This overrides dashboard settings, and a major pin is the only granularity Vercel offers. Accept that minors and patches float, and write that down as a known property of the system. Then put each platform deprecation date into your team calendar as an *expiry contract* — `vercel project ls --update-required` lists affected projects. A deprecation announced in a changelog you don't read is still a production incident you will have.

## Breakage class 2: every deploy forks your user base

The moment a deploy goes live, every browser tab opened before it is running old client code against your new server. Vercel knows this: its Skew Protection feature (announced **June 21, 2023**, when the platform was doing "over 6 million deployments per month") pins framework-managed requests to the originating deployment via a `?dpl=` query parameter, an `x-deployment-id` header, or a `__vdpl` cookie.

The protection has four contract-shaped holes:

- **Custom `fetch()` calls are not pinned.** Skew Protection covers framework-managed traffic — assets, client navigations, Server Actions, prefetches. The API call you wrote by hand in a `useEffect` goes to whatever deployment is current. If you renamed a field on the server, that old tab is now sending requests your new handler doesn't understand, and no platform feature is catching it.
- **Pinned clients age out into 404s.** Default max age is **1 day**. A tab older than that — or pinned to a deployment your retention policy already deleted — gets a **404**, not a graceful fallback. Googlebot and Bingbot get an automatic 60-day max age; your users don't.
- **Cross-origin traffic ignores the deployment ID by default.** If another site embeds your assets with baked-in URLs, those URLs 404 after you redeploy — unless the serving project explicitly allowlists the consumer domain (up to 12 entries).
- **It is only on by default for projects created after November 19, 2024**, on supported framework versions (Next.js ≥14.1.4, SvelteKit adapter ≥5.2.0, Qwik ≥1.5.3, Astro adapter ≥9.0.0, Nuxt). Older projects have it off until someone enables it and redeploys. If your project predates that date, you have no skew protection and probably believe you do.

**The contract:** treat skew max age as a *compatibility window budget*, sized to your real session length. A dashboard whose sessions run 8 hours needs a window that covers them; long-lived sessions — checkout flows, voice agents, exams — need the `__vdpl` cookie set in middleware so the pin survives. And the part no platform can do for you: every API change must stay compatible with clients up to max-age old. That is an N-version compatibility contract, enforced in code review, not a toggle.

## Breakage class 3: the undo isn't an undo

Instant Rollback restores your build but not your configuration, and it silently turns off production promotion afterward. Both asymmetries are in the docs:

1. **Rollback restores the build, not the configuration.** Environment variables changed since the original deployment are not re-applied — Vercel's own wording is that the configuration "may become stale." Cron jobs revert to the rolled-back deployment's state. If your incident involved both a code change and an env var change — and they usually travel together — rollback gives you a chimera: old code, new config.
2. **After a rollback, auto-assignment of production domains is turned off.** Read that again, because it is the silent one: your *next* push to the production branch builds successfully, shows green, and **does not go live**. Nothing is broken, so nothing alerts. The team ships three more "deploys" before someone notices production hasn't moved. You must explicitly undo the rollback to restore promotion. On Hobby, you can also only roll back a single step.

**The contract:** a rollback runbook with two mandatory lines — *diff the env vars between the current and rolled-back deployments*, and *explicitly re-enable promotion before the next merge*. Rollback is a state transition with side effects, not an inverse function. Write it down as one.

## The levers Vercel actually gives you

Every breakage above converts into explicit configuration. The full kit:

```json
// vercel.json
{
  "git": {
    "deploymentEnabled": {
      "main": false
    }
  },
  "ignoreCommand": "git diff --quiet HEAD^ HEAD ./apps/web"
}
```

- **`git.deploymentEnabled`** takes per-branch booleans with minimatch globs; if at least one matching rule is `true`, a deployment occurs. Set the production branch to `false` and deploy from CI/CLI instead — push-to-deploy becomes a pipeline step you own, with your gates in front of it.
- **`ignoreCommand`** is a programmable deploy gate with a footgun built into its exit codes: **exit 0 skips the build, exit 1 lets it continue.** This is inverted relative to every CI system you've used, where exit 0 means "proceed." The documented example works because `git diff --quiet` exits 0 when *nothing changed* — nothing changed, skip the build. Write your own gate script without internalizing this, and you've built a gate that does the opposite of what its author believes. It is the perfect miniature of this whole post: a contract you thought you understood, with semantics owned by the other party. And remember the `--depth=10` clone — `HEAD^` exists, but deep history doesn't.
- **`engines.node` major pin** — the version contract from class 1.
- **Skew Protection max age + `__vdpl` middleware** — the compatibility window from class 2. The Custom Skew Protection Threshold additionally lets you fence off a known-bad deployment so no client stays pinned to it.
- **A calendar entry per deprecation date** — the expiry contract against class 1's deferred build failures.

None of these are exotic; all of them are in the docs. The work is a decision: each default you currently rely on either gets promoted to an explicit, reviewed contract — or gets documented as an accepted risk with a name attached.

## Why this is an agentic-software problem

This blog runs on an autonomous publishing stack, and this post exists because we hit the same failure shape one layer up. Our autopublish daemon never moves content straight from "generated" to "live." Every piece passes a WAL queue and a gate pipeline — validate → checklist → publish — because we once trusted an implicit default (a tenant prompt fallback) and watched an agent confidently produce content for the wrong domain. The logs were green. The default was wrong.

The lesson generalizes: **an autonomous system is exactly as trustworthy as its most implicit default.** A human pushing to `main` will eventually notice that production didn't update after a rollback, or that the build runs Node 24 instead of 20. An agent fleet won't — it will keep reporting success against a contract that quietly stopped meaning what the system prompt says it means. Deterministic boundaries aren't pedantry; they are the only reason you can let the machine run unattended.

So do the audit. Open your `vercel.json` (you may not have one — that itself is a finding), your `package.json` engines field, your project's Skew Protection setting, and your rollback runbook. For each, ask one question: *is this a contract I wrote, or a default I inherited?* Every default you promote to a contract is one fewer 2 a.m. search for "Vercel deployment failed silently."