# MUSU Security Posture Summary

> 원본: `MUSU-036-security-posture-audit_2026-02-20` (Musu-new 리포)
> 감사일: 2026-02-20
> 조치 완료일: 2026-02-20
> 상태: **P0/P1/P2 전량 완료, Remaining: 없음**

---

## Executive Summary

### 감사 전 (Before)

| 리포 | 등급 |
|------|------|
| Musu_repo | B- |
| hive_link | C+ |

핵심 문제: 보안 기능은 많지만, 일부 핵심 경계(gateway/mesh 인증)에서 **구성 실수 시 fail-open** 발생 가능.

### 감사 후 (After)

| 항목 | 상태 |
|------|------|
| Critical 2건 | **완료** |
| High 3건 | **완료** |
| Medium 3건 | **완료** |
| P2 Quality 4건 | **완료** |
| 추정 등급 | **B+ 이상** |

---

## 핵심 조치 3가지

### 1. AI 원격 코드 실행(RCE) 차단

**문제**: Gateway pulled job에서 `sh -c` 실행 가능 → 악의적 프롬프트에 의한 시스템 파괴 가능

**조치**:
- `sh -c` 실행 경로 제거
- 구조화된 명령어 실행(structured command spec) 도입
- 허용 리스트(allowlist) 기반 실행으로 전환
- 파일 전송을 `FileAccessEngine` sandbox + DLP 경유로 고정

**결과**: AI가 허락된 샌드박스 밖으로 단 한 발짝도 나갈 수 없음

### 2. HiveLink 군사급 인증 (HMAC + Nonce)

**문제**: Mesh 인증이 `mesh-peer-` prefix 검사만으로 통과 → 위조 토큰으로 우회 가능

**조치**:
- prefix 기반 인증 완전 제거
- **HMAC-SHA256 서명** 기반 암호학적 검증 도입
- **Nonce + TTL + Timestamp skew** 검증으로 재전송 공격(Replay Attack) 방어
- 인증 실패/재전송 시도 감사 이벤트 기록

**결과**: 패킷 가로채기/재전송 공격 완전 차단. P2P 보안망 완성.

### 3. Fail-Closed 강제화 (단두대 정책)

**문제**: 시크릿 키 누락/에이전트 권한 미정의 시 `fail-open`(일단 허용) 경로 존재

**조치**:
- `MUSU_SHARED_SECRET`으로 키 통일
- 프로덕션 환경에서 시크릿 없으면 시작 자체 불가(startup hard-fail)
- 에이전트 권한 미정의 시 무조건 거부(deny-by-default)
- K8s optional secret 제거, placeholder 기본값 제거

**결과**: "모르면 일단 막는다." — Google/Apple OS 설계 철학과 동일

---

## 전체 보안 컨트롤 맵

### Musu_repo (핵심 런타임)

| 영역 | 컨트롤 | 위치 |
|------|--------|------|
| Gateway 인증 | Bearer + HMAC, fail-closed | `musu-prime/src/domain/auth.rs` |
| 토큰 저장 | SHA-256 해시, TTL 24h, 최대 256개, 0600 퍼미션 | `musu-engine/src/security/token_store.rs` |
| Ephemeral Secret | 메모리 전용, 상수시간 비교 | `musu-engine/src/security/ephemeral.rs` |
| Path Sandbox | 절대경로/`..`/널바이트 차단, canonical 경계검사 | `musu-engine/src/work/path_security.rs` |
| Interceptor | mTLS, allowlist, denylist, CPU/메모리/네트워크 제한 | `musu-interceptor/src/executor.rs` |
| Agent 정책 | tool prefix allow, recovery action 권한, deny audit log | `mvp_core_clinic/src/mcp/tools/templates.ts` |
| K8s | non-root Pod, 6-layer CI 보안 스캔 | k8s manifests + CI workflows |

### hive_link (P2P 네트워크)

| 영역 | 컨트롤 | 위치 |
|------|--------|------|
| QUIC/TLS | TOFU verifier + fingerprint 상수시간 비교 | `hive_link/src/infrastructure/tls.rs` |
| Mesh Auth | HMAC-SHA256 서명 + Nonce + Timestamp | `hive_link/src/interfaces/quic/stream/auth.rs` |
| Rate Limiting | 실패 5회/300초 lockout | `hive_link/src/infrastructure/security.rs` |
| Audit | JSONL 감사로그 + 10MB 로테이션 + syslog | `hive_link/src/infrastructure/audit.rs` |
| File Sandbox | root canonicalize + 경계체크 + traversal 차단 | `hive_link/src/infrastructure/file_server.rs` |
| DLP | off/warn/block 모드 + secret scanner | `hive_link/src/infrastructure/secret_scanner.rs` |

### CI 보안 파이프라인 (6-layer)

1. **detect-secrets** — 코드 내 시크릿 탐지
2. **npm audit** — JS 의존성 취약점
3. **zizmor** — GitHub Actions 워크플로우 보안
4. **cargo audit** — Rust 의존성 취약점
5. **TruffleHog** — 커밋 히스토리 시크릿 스캔
6. **CodeQL** — 코드 정적 분석

Release 브랜치에서는 **strict 모드** 강제 (non-blocking → blocking).

---

## Zero Data Leak 근거 (마케팅 활용)

랜딩 페이지 카피의 기술적 뒷받침:

| 마케팅 주장 | 기술적 근거 |
|------------|-----------|
| "소스코드가 서버로 올라가지 않습니다" | 전체 런타임이 로컬 실행. 클라우드 AI는 추론 요청만 전송. |
| "결제용 계정정보 이외에는 올라가지 않습니다" | Gateway는 인증 토큰만 검증. 코드/파일은 로컬 Path Sandbox 안에서만 처리. |
| "HiveLink는 P2P 직결" | QUIC + TOFU TLS. 중간 릴레이 서버 없음. 데이터는 기기 간 직결. |
| "DLP 내장" | `secret_scanner.rs`가 파일 전송 시 시크릿 패턴 자동 탐지 → block 모드에서 전송 차단. |
| "Fail-Closed" | 미인증/미인가 요청은 무조건 거부. 허용 목록에 없으면 실행 불가. |

---

## B2B 엔터프라이즈 관점

보안팀 기안 통과에 필요한 핵심 논리:

1. **데이터 주권(Data Sovereignty)**: 모든 데이터가 사내 네트워크/개인 기기를 떠나지 않음
2. **Zero Trust 아키텍처**: deny-by-default + 암호학적 인증 + 감사 로그
3. **서버 의존성 없음**: 우리 서버가 해킹당해도 고객 데이터 유출 경로 자체가 없음
4. **CI 자동 검증**: docs/code 보안 정합성 자동 검사, 6-layer 스캔 파이프라인

---

## 원본 문서 위치

```
/mnt/f/Aisaak/Projects/Musu-new/work/active/MUSU-036-security-posture-audit_2026-02-20/
├── 01_SECURITY_POSTURE_REPORT_2026-02-20.md    # 감사 보고서 (전체)
├── 02_SECURITY_REMEDIATION_TODO.md              # 조치 체크리스트 (전량 완료)
└── 03_IMPLEMENTATION_PLAN.md                    # 구현 계획 (전량 완료)
```

---

## 관련 문서

- [os-pivot-strategy.md](os-pivot-strategy.md) — OS 피벗 전략
- [landing-os-wireframe.md](landing-os-wireframe.md) — Landing 2 와이어프레임 (Zero Data Leak 블록 포함)
- [landing-v2-direction.md](landing-v2-direction.md) — Landing 1 카피
