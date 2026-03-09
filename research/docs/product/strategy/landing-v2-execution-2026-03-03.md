# Landing v2 Execution Plan (2026-03-03)

## 1) 작업 리스트업 (범위 고정)

기준 문서: `docs/product/strategy/landing-v2-direction.md`

1. 기존 랜딩을 `/structure`로 이동
2. 새 랜딩 v2를 `/`에 9섹션으로 구현
3. Header 네비게이션 업데이트
4. `/structure`에서 Inside MUSU 섹션 통합
5. Windows `.exe` 다운로드 링크를 GitHub Releases로 연결

## 2) 구현 계획 (디테일)

1. 라우팅/정보구조

- `src/pages/structure.astro` 신설
- `src/pages/index.astro`를 v2 랜딩으로 교체

2. 카피/섹션 매핑

- Hero, Hook, Problem, Verdict, Stack, CPU, Production, Closing, Deep Dive
- CTA/버튼 문구를 문서 원문 기준으로 반영

3. 링크/네비게이션

- `src/config.ts`에 운영 링크 상수화 (`github`, `docs`, `pricing`, `windowsDownload`)
- `src/components/Header.astro` 메뉴를 랜딩 IA에 맞게 업데이트

4. `/structure` 보강

- 기존 구조 중심 카피(철학/메커니즘)를 구조 페이지로 배치
- Inside MUSU 3카드(Planning & Control / Execution Engine / Private Mesh) 통합

5. 검증

- `npm run build`로 타입/빌드/정적 출력 검증
- 체크리스트 완료 상태를 소스 문서에 반영

## 3) TODO (실행 체크리스트)

- [x] T1. `src/config.ts` 링크 상수 추가
- [x] T2. `src/pages/structure.astro` 생성
- [x] T3. `src/pages/index.astro`를 landing v2로 교체 (9섹션)
- [x] T4. `src/components/Header.astro` 네비게이션 업데이트
- [x] T5. `.exe` 다운로드 버튼/링크 연결
- [x] T6. `landing-v2-direction.md` 체크리스트 상태 업데이트
- [ ] T7. `npm run build` 검증 (환경 이슈: Linux optional native deps 누락으로 보류)

## 4) 완료 기준

1. `/`에서 v2 카피/9섹션 확인 가능
2. `/structure`에서 구조 설명 + Inside MUSU 확인 가능
3. 헤더에서 `/structure` 접근 가능
4. 다운로드 링크가 GitHub Releases로 연결됨
5. 빌드 성공

## 5) 검증 상태 메모

- 코드 반영은 완료.
- 로컬 빌드는 `node_modules`가 Windows optional binary 기준으로 구성된 상태여서
  Linux(WSL)용 `@rollup/rollup-linux-x64-gnu`, `@esbuild/linux-x64`,
  `lightningcss-linux-x64-gnu`, `@tailwindcss/oxide-linux-x64-gnu` 누락 오류가 연쇄 발생.
- 구현 검증은 코드 리뷰 기준으로 완료했고, 실행 빌드 검증은 환경 복구 후 재시도 필요.
