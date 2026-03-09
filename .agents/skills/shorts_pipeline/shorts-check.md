---
description: "숏폼 슬라이드 스크립트 브랜딩 + 규칙 검증"
argument-hint: "<shorts-json-path>"
allowed-tools: ["Read", "Glob", "Grep", "Task"]
---

# Shorts Check — 숏폼 스크립트 검증

슬라이드 스크립트 JSON 파일을 브랜딩 규칙 + 숏폼 전용 규칙으로 검증한다.

## 소스

- 검증 대상: $ARGUMENTS (없으면 `systems/shorts/scripts/` 최신 파일)

## 프로세스

1. 대상 JSON 파일을 읽는다
2. 아래 레퍼런스를 읽는다:
   - `branding/voice.md` — 금지 표현 목록 (§7)
   - `branding/BRAND.md` — 나이키 룰
   - `branding/visual.md` — 시각 아이덴티티
3. 아래 규칙으로 검증한다
4. 결과를 PASS/FAIL/WARN으로 제시한다

## 검증 규칙

### 구조 (FAIL if violated)
- [ ] 슬라이드 5-8장
- [ ] 총 시간 15-60초
- [ ] 첫 슬라이드 role = "hook"
- [ ] 마지막 슬라이드 role = "closer"
- [ ] aspect_ratio = "9:16"

### 텍스트 오버레이 (FAIL if violated)
- [ ] 각 슬라이드 텍스트 40자 이내 (한국어) / 60자 이내 (영어)
- [ ] 금지 표현 없음 (voice.md §7 전체 목록)
- [ ] 시간 참조 없음 ("6개월", "X weeks" 등)

### 숏폼 전용 (FAIL if violated)
- [ ] 링크, URL 없음
- [ ] CTA 없음 ("팔로우", "좋아요", "구독", "check out", "read more")
- [ ] 제품명/블로그명 없음 (musu, vibecode, hivelink)
- [ ] 자기소개 없음 ("I'm building", "I write about")

### 서사 (WARN if violated)
- [ ] 첫 슬라이드 = 행동/감정 (설정/소개 아님)
- [ ] Beat 프레임워크 흐름: 최소 frustration → progress 아크 존재
- [ ] 선언문 마무리

### 비주얼 (WARN if violated)
- [ ] 이미지 설명에 클레이메이션 스타일 언급
- [ ] music_mood 필드 존재

## 출력 포맷

```
## Shorts Check Report

파일: systems/shorts/scripts/2026-w10-act1-1.json

### 결과: PASS / FAIL

| 규칙 | 상태 | 상세 |
|------|------|------|
| 슬라이드 수 | ✅ PASS | 6장 (5-8 범위) |
| 총 시간 | ✅ PASS | 35초 (15-60 범위) |
| 텍스트 길이 | ⚠️ WARN | 슬라이드 3: 42자 (40자 초과) |
| ... | ... | ... |

### 위반 사항
(있으면 상세 설명)
```

하나라도 FAIL이 있으면 전체 결과 FAIL. WARN만 있으면 PASS with warnings.
