---
slug: note-windows-port-reservation-health-endpoint
title: "Note: Your Health Endpoint Silently Failing? Docker/WSL Reserve Port Ranges on Windows"
description: A Windows health endpoint that can't bind a port reads as a phantom failure — the OS excluded the range, not a process. Here's the single-incident diagnosis and the one fix that holds.
pubDatetime: 2026-06-18T00:00:00Z
tags: [til, windows, docker, networking, fail-fast]
series: Field Log
draft: false
references:
  - name: "Microsoft Learn — Default dynamic port range for TCP/IP"
    url: https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/default-dynamic-port-range-tcpip-chang
  - name: "docker/for-win #3171 — Hyper-V excluding but not using port ranges"
    url: https://github.com/docker/for-win/issues/3171
  - name: "microsoft/WSL #5306 — Huge amount of ports are being reserved"
    url: https://github.com/microsoft/WSL/issues/5306
  - name: "microsoft/WSL #5514 — Too many reserved port for Hyper-V"
    url: https://github.com/microsoft/WSL/issues/5514
  - name: "pomeroy.me — Solved: Windows 10 forbidden port bind"
    url: https://pomeroy.me/2020/09/solved-windows-10-forbidden-port-bind/
---

## What was actually holding the port

The port was held by the OS, not a process. Our `/healthz` listener on `0.0.0.0:8088` stopped binding on a Windows host running Docker Desktop with WSL2:

```
bind: An attempt was made to access a socket
in a way forbidden by its access permissions.
```

The signal that misleads you: `netstat -ano` showed 8088 with nothing listening. The port was not *listened on* — it was *excluded*. Hyper-V's Host Networking Service (HNS) reserves ports in 100-port blocks for the container NAT layer, and one block had swallowed 8088:

```powershell
netsh interface ipv4 show excludedportrange protocol=tcp
# Start  End
# 8050   8149   *   <- HNS block; asterisk = admin reservation
```

That gap between the two tools is the whole diagnosis. The port is free to every connection-table tool and forbidden to `bind()`. These HNS reservations are non-deterministic across reboots (docker/for-win #3171), which matches the symptom exactly: 8088 bound fine the day before, and nothing in our stack changed.

## The fix

Picking a "safe" port number is no defense. 8088 already sits *below* the dynamic client range (49152–65535, per MS Learn), and HNS reserved it anyway. The only durable protection is to claim the port yourself, persistently, before HNS can:

```powershell
netsh int ipv4 add excludedportrange protocol=tcp `
  startport=8088 numberofports=1 store=persistent
```

An administrative exclusion (the `*` block above) is protected from HNS reuse (pomeroy.me), and `store=persistent` carries it across reboots. Run it once in host bootstrap — not at app startup, where it races the very reservation it's meant to win.

**Lesson:** a listener that can't bind fails worse than one returning 503 — there is no error to catch downstream, only absence. On bind error, log the target port and the current `excludedportrange` state, then exit non-zero. Retrying into the same wall only delays the diagnosis.