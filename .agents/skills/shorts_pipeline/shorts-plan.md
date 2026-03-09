---
description: "소스 분석 → 숏폼 슬라이드 시퀀스 설계"
argument-hint: "<source-path>"
allowed-tools: ["Read", "Glob", "Grep", "Task"]
---

# Shorts Plan — 슬라이드 시퀀스 설계

소스 파일을 분석해서 5-8장 슬라이드 시퀀스를 설계한다. 스크립트 자체는 쓰지 않는다.

## 소스

- 소스 경로: $ARGUMENTS

## 프로세스

1. 소스 파일 전체를 읽는다
2. 아래 레퍼런스 파일을 읽는다:
   - `branding/voice.md` — 톤 SSOT
   - `branding/narrative.md` — 3막 구조
   - `branding/visual.md` — 시각 아이덴티티
3. `systems/analytics/feedback-context.md` 존재 시 읽기 — hook 패턴 참고
4. Beat 프레임워크로 슬라이드 시퀀스를 설계한다:
   - **Beat 1 — Frustration**: 문제/짜증/고통 (hook 슬라이드)
   - **Beat 2 — Starting**: 시도/결심
   - **Beat 3 — Struggling**: 막힘/실패
   - **Beat 4 — Learning**: 발견/깨달음
   - **Beat 5 — Progress**: 변화/선언
5. 각 슬라이드에 대해 설계:
   - `role`: hook / point / bridge / closer
   - 텍스트 오버레이 핵심 (40자 이내)
   - 이미지/비주얼 설명 (클레이메이션 스타일)
   - 예상 초 수 (2-5초)
6. 설계안을 사용자에게 제시한다

## 슬라이드 설계 규칙

- **첫 슬라이드 = hook**: 행동 또는 감정으로 시작. 설정/소개 아님. 1초 스크롤에서 잡아야 함.
- **5-8장**: 너무 적으면 서사 없음, 너무 많으면 이탈
- **텍스트 오버레이 40자 이내**: 모바일에서 읽기 쉽게
- **총 15-60초**: 숏폼 최적 길이
- **마지막 슬라이드 = 선언문**: 짧고 강하게 끝

## 절대 금지

- 링크, URL, CTA, 제품명
- "팔로우", "좋아요", "구독" 유도
- 시간 참조 ("6개월", "X weeks")
- 설명조 시작 ("이 영상에서는...")

## 출력

슬라이드 시퀀스 설계안만 대화로 제시한다. JSON 파일은 생성하지 않는다.
`/shorts-draft`에서 이 설계를 기반으로 스크립트를 작성한다.
