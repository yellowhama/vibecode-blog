# (선택) pencil MCP로 와이어프레임을 “진짜 화면”으로 만들기

목표: `runs/.../05_wireframe.md` 수준의 블록 배치를, pencil.dev 문서로 자동 생성합니다.

## 입력

- `runs/.../03_section_plan.json`
- `runs/.../04_copy_deck.md`
- `runs/.../06_colors.json`

## 요구사항

- 완성 디자인이 아니라, “수정하기 쉬운 뼈대”가 목적입니다.
- 컴포넌트는 단순하게:
  - 섹션 프레임 5개(Hero/USP/Proof/FAQ/CTA)
  - 각 섹션에 텍스트 블록 + 이미지 플레이스홀더(사각형)
- 컬러는 `06_colors.json`의 `default_ui`를 기본으로 적용합니다.

## 실행(도구 사용)

1. pencil 문서를 새로 열고, 캔버스에 `Detail Page Draft` 프레임을 만드세요.
2. 세로 레이아웃으로 섹션 5개를 만들고, 각 섹션에 텍스트/이미지 슬롯을 추가하세요.
3. `runs/.../04_copy_deck.md`에서 선택한 버전(A 또는 B)의 헤드라인/불릿/CTA를 텍스트에 채우세요.
4. 이미지 슬롯은 실제 이미지가 없어도 됩니다. 플레이스홀더(연한 회색)로 두세요.
5. 결과를 `.pen` 파일로 저장할 필요가 있으면 저장 경로를 `runs/.../draft_detail_page.pen`로 두세요.

## 출력

- pencil 문서에 생성된 와이어프레임(섹션 5개 + 텍스트/이미지 슬롯)
- 그리고 `runs/.../pencil_notes.md`에 “어떤 구조로 만들었는지”를 10줄 내로 기록하세요.
