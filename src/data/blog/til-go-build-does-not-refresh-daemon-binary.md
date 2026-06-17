---
slug: til-go-build-does-not-refresh-daemon-binary
title: "TIL: go build ./... does not refresh your daemon binary — embed changes silently no-op"
description: We edited a //go:embed asset, ran `go build ./...`, restarted the daemon, and it served the old asset with exit 0. Here is why the build is a compile check, not a deploy artifact.
pubDatetime: 2026-06-17T00:00:00Z
tags: [til, golang, go-embed, build-pipeline, deterministic-boundary]
series: Field Log
draft: false
references:
  - name: "pkg.go.dev — cmd/go"
    url: https://pkg.go.dev/cmd/go
  - name: "pkg.go.dev — embed"
    url: https://pkg.go.dev/embed
---

## What broke

`go build ./...` recompiled cleanly, exit 0, and the daemon still served the old prompt — because that command writes no binary at all.

We had edited a prompt template baked into our publishing daemon via `//go:embed`, run `go build ./...`, and restarted the process. It served the *previous* prompt. No error, no warning. This is the costliest failure mode: the build reports success while the running behavior never moves.

## Why it silently no-ops

Two facts from the Go documentation collide here.

First, `//go:embed` reads at **compile time**, not at runtime. The directive initializes the variable "with the contents of files read from the package directory or subdirectories at compile time" ([pkg.go.dev/embed](https://pkg.go.dev/embed)). The asset is frozen into the binary; the running process never re-reads disk. Editing the source file changes nothing until something recompiles *and* replaces the binary.

Second, `go build ./...` across multiple or non-main packages produces no installable output. It "compiles the packages but discards the resulting object, serving only as a check that the packages can be built" ([pkg.go.dev/cmd/go](https://pkg.go.dev/cmd/go)). Nothing is written to `$GOBIN`; that is `go install`'s job.

So the two combined exactly: the edited template compiled, the build went green, and the on-disk binary the daemon execs was never rewritten. Embed is what hid the gap — had the daemon read the template from disk at runtime, the mismatch (file new, binary old) would have surfaced on the next request instead of staying invisible.

```bash
# what we ran — a compile check, not an artifact
go build ./...        # exit 0, writes nothing deployable

# what deploy actually requires
go build -o /opt/app/daemon ./cmd/daemon   # or: go install ./cmd/daemon
systemctl restart daemon
```

## The lesson

`go build ./...` answers one question — "does it compile?" — and nothing about deployment.

Keep `./...` in CI, where a pass/fail compile check is exactly the contract you want. In the deploy path, do not reuse it: pin an explicit output with `-o $ARTIFACT` (or `go install` a single `main` package), and gate the restart on the artifact being newer than the commit you intend to ship. The boundary between "compiles" and "is deployed" should be enforced by the pipeline, not assumed.