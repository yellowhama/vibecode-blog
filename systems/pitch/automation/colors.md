# 컬러: 어디서 찾고, 어떻게 자동화하나

## 1) “트렌드 컬러”는 어디서 찾나

- Pantone: 매년 “Color of the Year” 발표(배경/뉴트럴 톤 잡기 좋음)
- WGSN x Coloro: “Color of the Year” 발표(포인트 컬러 아이디어 얻기 좋음)
- Adobe Color: 트렌드 팔레트/조합 참고용

## 2) 자동화에서는 이렇게 쓰는 게 안전하다

- 트렌드 컬러는 “영감용 옵션”으로만 둔다.
- 실제 페이지 컬러는 `bg/surface/text/accent` 4개만 먼저 고정한다.
- 포인트 컬러는 1개(+보조 1개)만 쓴다.

## 3) 바로 쓰는 hex(기본 세트)

- 파일: `colors_default.json`
- `default_ui`는 브랜드 컬러가 없을 때 바로 쓰는 안전 세트
- `trend_neutral`은 “부드러운 배경 + 차분한 포인트” 영감 세트

## 4) “늘 쓰는 색” 템플릿(추천)

브랜드 컬러가 있다면 `accent`만 그 색으로 바꾸고 나머지는 그대로 쓰면 됩니다.

- bg: `#F9FAFB`
- surface: `#FFFFFF`
- text: `#111827`
- muted_text: `#4B5563`
- border: `#E5E7EB`
- accent(브랜드): `#2563EB`
