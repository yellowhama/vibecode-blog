# 소프트웨어 개념 메타포 라이브러리

해설 파트(Explainer)에서 사용하는 소프트웨어 개념 → 물리적 메타포 매핑.
각 메타포는 Kurzgesagt 스타일 추상 시각화로 렌더된다.

---

## 해설 프롬프트 기본 템플릿

```
"Kurzgesagt-style infographic animation. Clean geometric shapes on dark navy (#0D1B2A) background.
{metaphor_visual}. Smooth motion graphics, bold saturated colors ({color_palette}), soft glow.
NO characters, NO text, NO labels. Abstract concept visualization."
```

### 색상 팔레트

| 용도 | 색상 | HEX |
|------|------|-----|
| 주요 요소 | 오렌지 | #FF6B35 |
| 보조 요소 | 시안 | #00D4FF |
| 성공/긍정 | 그린 | #7AE582 |
| 위험/에러 | 레드 | #FF4444 |
| 중립/배경 | 네이비 | #0D1B2A |
| 강조 | 옐로 | #FFD166 |
| 구조/프레임 | 라이트블루 | #A8DADC |

---

## Act 1: 스펙이 뭔지도 몰랐다

| # | 개념 | 메타포 | 도형/액션 | 시간 | 프롬프트 |
|---|------|--------|----------|------|---------|
| 1 | **Spec (스펙)** | 건물 설계도 | 파란 설계도 용지가 펼쳐짐 → 건물 윤곽이 라인으로 그려짐 → 완성된 3D 건물이 올라옴 | 15s | `A glowing blue blueprint unfolding, geometric building wireframe rising from it, transforming into a solid 3D structure` |
| 2 | **No-spec coding** | 설계도 없이 쌓기 | 블록들이 아무렇게나 쌓임 → 흔들림 → 와르르 무너짐 | 10s | `Colorful geometric blocks stacking haphazardly without foundation, wobbling, then collapsing into scattered pieces` |
| 3 | **Codebase** | 도시 전경 | 위에서 본 도시. 도로=함수, 건물=모듈, 공원=데이터 | 15s | `Isometric city view from above, glowing roads connecting geometric buildings, data flowing as light particles along streets` |
| 4 | **Prompt** | 식당 주문 | 말풍선 → 주방으로 들어감 → 엉뚱한 음식 나옴 | 10s | `A glowing speech bubble floating into a kitchen doorway, emerging as a completely different dish on a plate` |
| 5 | **Prompt vs Spec** | 구두 주문 vs 서면 주문 | 왼쪽: 말풍선이 흐릿해짐. 오쪽: 종이가 선명하게 남음 | 15s | `Split screen: left side speech bubble dissolving into fog, right side a crisp paper document staying sharp and clear` |
| 6 | **Requirement** | 재료 목록 | 체크리스트 아이템들이 하나씩 체크됨 → 모이면 케이크 형태 | 10s | `Floating checklist items being checked one by one, converging into a layered cake shape` |
| 7 | **Scope** | 울타리 | 넓은 평면에 울타리가 그려짐 → 안쪽만 밝아짐 | 10s | `A luminous fence line drawing itself on a dark plane, interior area glowing bright while outside stays dim` |
| 8 | **Scope creep** | 울타리가 계속 확장 | 울타리가 자꾸 바깥으로 밀려남 → 결국 화면 밖까지 | 10s | `Glowing fence expanding outward uncontrollably, pushing beyond screen boundaries` |
| 9 | **MVP** | 스케이트보드→자전거→자동차 | 작은 탈것에서 점점 큰 탈것으로 진화 | 15s | `Geometric skateboard morphing into bicycle then into car, each stage fully functional, growing in complexity` |
| 10 | **Bug** | 벽돌 틈의 균열 | 깔끔한 벽에 작은 균열 → 번져서 벽 전체로 확산 | 10s | `Clean geometric wall with tiny crack appearing, spreading like lightning across the entire surface` |
| 11 | **Debug** | 돋보기로 균열 찾기 | 돋보기가 벽 위를 스캔 → 균열 발견 → 빛으로 메꿈 | 15s | `Magnifying glass scanning a cracked wall, finding fracture, sealing it with golden light` |
| 12 | **Version** | 타임라인 스냅샷 | 좌→우 타임라인. 각 지점에 건물의 다른 버전 | 10s | `Horizontal timeline with glowing dots, each dot showing a different stage of a building, evolving left to right` |
| 13 | **Iteration** | 도자기 빚기 | 같은 형태를 반복해서 다듬음 → 점점 정교해짐 | 15s | `Clay pot shape being refined in cycles, each pass making it smoother and more detailed` |
| 14 | **Documentation** | 지도 + 범례 | 도시 위에 투명한 지도 레이어 → 범례가 각 건물 설명 | 10s | `Transparent map overlay on geometric city, legend labels appearing next to each building` |
| 15 | **Technical debt** | 건물에 임시 기둥 | 건물 곳곳에 빨간 임시 기둥 → 기둥 빼면 흔들림 | 15s | `Building supported by red temporary scaffolding poles, removing one causes the structure to wobble` |

---

## Act 2: 스펙이 있으니까 끝인 줄 알았다 (SDD)

| # | 개념 | 메타포 | 도형/액션 | 시간 | 프롬프트 |
|---|------|--------|----------|------|---------|
| 1 | **System Design** | 집 구조 (방 나누기) | 빈 사각형 → 내부에 벽이 그려짐 → 방들이 색상으로 구분 | 15s | `Empty square being divided by internal walls, each room filling with different colors, forming a floor plan` |
| 2 | **Architecture** | 건물 골조 | 기둥→보→바닥→벽 순서로 조립되는 구조물 | 15s | `Structural frame assembling: pillars rising, beams connecting, floors layering, walls filling in sequence` |
| 3 | **Dependency** | 도미노 | 도미노 줄 → 하나 넘어지면 연쇄 반응 | 10s | `Row of glowing dominoes, first one tipping and triggering a chain reaction across the line` |
| 4 | **Circular dependency** | 꼬인 도미노 원 | 도미노가 원형으로 배치 → 시작점이 없음 → 전부 멈춤 | 10s | `Dominoes arranged in a circle, all frozen because none can fall first` |
| 5 | **Module** | 레고 브릭 | 개별 레고 블록들 → 조립하면 큰 구조물 | 15s | `Individual colorful LEGO-like blocks floating, snapping together to form a complex structure` |
| 6 | **Interface** | USB 포트 | 다른 모양 블록들이 표준 포트를 통해 연결 | 10s | `Different shaped blocks connecting through identical standardized ports, data light flowing through` |
| 7 | **Coupling (tight)** | 엉킨 전선 | 두 박스 사이에 수십 개 전선 → 하나 건드리면 전부 흔들림 | 10s | `Two boxes connected by tangled mass of wires, pulling one wire shakes everything` |
| 8 | **Coupling (loose)** | 깔끔한 케이블 | 두 박스 사이에 단 하나의 깨끗한 케이블 | 10s | `Two boxes connected by single clean cable with a neat connector, stable and organized` |
| 9 | **Abstraction** | 리모컨 | 복잡한 내부 회로 → 바깥에서는 버튼 3개만 보임 | 15s | `Complex circuit board shrinking behind a panel, only three simple buttons visible on the surface` |
| 10 | **API** | 식당 메뉴판 | 주방(내부) ↔ 메뉴판(인터페이스) ↔ 손님(외부) | 15s | `Kitchen behind wall, menu board in the middle, customer on the other side, orders flowing as light through menu` |
| 11 | **Config** | 대시보드 다이얼 | 기계 옆 패널에 다이얼 3개 → 돌리면 기계 동작이 바뀜 | 10s | `Control panel with three dials next to a machine, turning dials changes machine behavior visually` |
| 12 | **Separation of concerns** | 층별 역할 | 건물 단면 → 1층=가게, 2층=사무실, 3층=집. 각자 독립 | 15s | `Building cross-section showing distinct floors: shop ground floor, office middle, home top, each operating independently` |
| 13 | **Single responsibility** | 전문 도구 | 맥가이버 칼(나쁜 예) vs 전용 도구 세트(좋은 예) | 10s | `Swiss army knife wobbling under pressure vs dedicated tools each performing perfectly` |
| 14 | **Refactoring** | 방 재배치 | 같은 집, 가구 위치만 바꿈 → 동선이 깔끔해짐 | 15s | `Room interior rearranging, furniture sliding to new positions, movement paths becoming clean straight lines` |
| 15 | **Monolith vs Microservice** | 1동 빌딩 vs 마을 | 왼쪽: 거대한 단일 건물. 오른쪽: 작은 집들이 길로 연결 | 15s | `Split: left side one massive building, right side village of small houses connected by glowing roads` |

---

## Act 3: 코드가 왜 꼬이는가 (DDD)

| # | 개념 | 메타포 | 도형/액션 | 시간 | 프롬프트 |
|---|------|--------|----------|------|---------|
| 1 | **Domain** | 동네 | 도시 안의 한 구역. 빵집, 학교, 병원 각자의 규칙 | 15s | `City district with bakery, school, hospital zones, each glowing in distinct color with own internal activity` |
| 2 | **Bounded Context** | 울타리 친 동네 | 각 동네에 투명 울타리 → 내부 규칙은 내부에서만 유효 | 15s | `Neighborhoods with translucent fences, internal rules displayed as symbols only visible inside each boundary` |
| 3 | **Entity** | 주민등록증 | 사람 도형 + ID 카드 → ID가 바뀌지 않음 (속성은 변해도) | 10s | `Person silhouette with glowing ID card, appearance changing but ID number staying constant` |
| 4 | **Value Object** | 지폐 | 만원짜리 두 장 → 번호 달라도 같은 가치. 교체 가능. | 10s | `Two banknotes with different serial numbers but identical glow, freely swappable` |
| 5 | **Aggregate** | 가족 | 가족 구성원 도형들 → 대표(가장)를 통해서만 외부와 소통 | 15s | `Group of shapes clustered together, only the leader shape interfacing with outside elements` |
| 6 | **Repository** | 서류 캐비넷 | 캐비넷에서 서류를 꺼내고/넣고 → 내부 정리는 자동 | 10s | `Filing cabinet with drawers opening, documents flying in and out, interior self-organizing` |
| 7 | **Service** | 우체부 | 동네 사이를 오가며 패키지 전달. 본인 소유물 없음. | 10s | `Postal worker figure moving between neighborhoods, carrying packages, owning nothing` |
| 8 | **Domain Event** | 종소리 | 교회 종 → 동네 전체에 울림 → 각자 반응 | 15s | `Bell ringing from center, sound waves spreading across neighborhoods, each responding differently` |
| 9 | **Ubiquitous Language** | 동네 사전 | 모든 주민이 같은 단어에 같은 의미 부여 → 소통 원활 | 10s | `Shared dictionary floating above neighborhood, all figures pointing to same word getting same meaning` |
| 10 | **Context Map** | 동네 간 도로 지도 | 위에서 본 전체 도시 → 동네 간 연결 도로/다리 표시 | 15s | `Aerial view of city districts connected by bridges and roads, relationship types shown as line styles` |
| 11 | **Anti-corruption Layer** | 국경 검문소 | 두 동네 사이 게이트 → 데이터가 변환되어 통과 | 15s | `Checkpoint gate between two zones, packages entering one shape and exiting transformed into another` |
| 12 | **Subdomain** | 동네 안의 블록 | 동네 안에서도 작은 구역 → 세분화 | 10s | `Neighborhood zooming in to reveal smaller blocks within, each with subtle variation` |
| 13 | **Domain model** | 동네 미니어처 | 실제 동네의 축소 모형 → 시뮬레이션 가능 | 15s | `Miniature model of a neighborhood on a table, tiny elements moving and interacting as simulation` |
| 14 | **Strategic design** | 도시 마스터플랜 | 전체 도시 조감도 → 어디에 뭘 배치할지 큰 그림 | 10s | `City master plan on dark background, zones being designated with different colors and purposes` |
| 15 | **Tactical design** | 건물 내부 설계 | 하나의 건물 안으로 줌인 → 방/복도/계단 설계 | 10s | `Zooming into single building, interior layout being designed with rooms corridors and stairs` |

---

## Act 4: 맞는지 모르겠다 (TDD)

| # | 개념 | 메타포 | 도형/액션 | 시간 | 프롬프트 |
|---|------|--------|----------|------|---------|
| 1 | **Test** | 안전망 | 서커스 그네 아래 네트 → 떨어져도 안전 | 15s | `Trapeze artist above a glowing safety net, falling and bouncing back safely` |
| 2 | **Red (실패)** | 빨간 신호등 | 신호등이 빨강 → 모든 것 멈춤 → "여기 문제" 표시 | 10s | `Traffic light turning red, all geometric vehicles stopping, warning indicator pulsing` |
| 3 | **Green (성공)** | 초록 신호등 | 신호등이 초록 → 모든 것 움직임 → "통과" | 10s | `Traffic light turning green, all elements flowing smoothly forward` |
| 4 | **Red-Green-Refactor** | 신호등 사이클 | 빨강 → 초록 → 노랑(리팩터) → 다시 빨강... 반복 | 15s | `Traffic light cycling red-green-yellow repeatedly, each cycle improving the road below it` |
| 5 | **Unit test** | 부품 검수 | 컨베이어 벨트에서 부품 하나씩 검사 → OK/NG 분류 | 15s | `Conveyor belt with individual parts, each scanned by light beam, sorted into OK and NG bins` |
| 6 | **Integration test** | 조립 후 시운전 | 부품 조립 → 완성품을 테스트 코스에서 굴림 | 15s | `Assembled machine placed on test track, running through obstacle course, checking each function` |
| 7 | **E2E test** | 완주 코스 | 출발 → 장애물 → 커브 → 도착. 전체 코스 완주 확인 | 15s | `Full race track with start and finish, vehicle navigating through all checkpoints` |
| 8 | **Coverage** | CCTV 네트워크 | 건물 곳곳 CCTV → 사각지대가 빨갛게 표시 | 15s | `Building with CCTV cameras, coverage areas in green, blind spots pulsing red` |
| 9 | **Mock** | 대역 배우 | 실제 배우 자리에 마네킹 → 연습용 | 10s | `Mannequin stand-in replacing a figure, performing the same actions for practice` |
| 10 | **Assertion** | 저울 | 기대값 vs 실제값을 저울에 올림 → 균형=통과, 불균형=실패 | 10s | `Balance scale with expected value on one side, actual on other, tipping triggers red or green glow` |
| 11 | **Test suite** | 체크리스트 보드 | 큰 보드에 항목들 → 하나씩 체크 → 전체 통과 시 보드가 초록 | 10s | `Large board with checklist items being marked one by one, entire board turning green when all pass` |
| 12 | **Regression** | 고친 벽에 새 균열 | 수리한 벽 → 다른 곳에서 균열 발생 → "여기도?" | 15s | `Repaired wall section looking perfect, new crack appearing on opposite side` |
| 13 | **TDD workflow** | 레시피 따르기 | 1) 재료 확인(빨강) → 2) 조리(초록) → 3) 플레이팅(리팩터) | 15s | `Recipe steps: checking ingredients (red), cooking (green), plating beautifully (yellow refactor)` |
| 14 | **Continuous Integration** | 자동 검문소 | 도로에 자동 게이트 → 차가 지나갈 때마다 자동 검사 | 10s | `Automated gate on road scanning each passing vehicle automatically, green flash for pass` |
| 15 | **Flaky test** | 깜빡이는 신호등 | 같은 차가 올 때마다 신호등이 랜덤으로 빨강/초록 | 10s | `Traffic light flickering randomly between red and green for identical vehicles, causing confusion` |

---

## 사용 가이드

### 에피소드 스크립트 작성 시

1. 해당 Act의 메타포 테이블에서 에피소드에 맞는 개념 2-3개 선택
2. `시간` 합산이 90-120초 (EXPLAINER 세그먼트 길이) 이내인지 확인
3. 프롬프트 컬럼을 기본 템플릿의 `{metaphor_visual}`에 삽입
4. 필요 시 메타포 간 전환 모션 추가 (줌인/줌아웃, 모핑)

### 매니페스트 생성 시

- `visual_type: "explainer"` 샷에서 이 라이브러리의 프롬프트 사용
- `_compose_explainer_prompt()` 함수가 자동으로 기본 템플릿 + 개별 프롬프트 결합

### 신규 개념 추가 시

- Act 테이블에 행 추가
- 프롬프트는 반드시 `NO characters, NO text, NO labels` 포함
- 시간은 10s/15s 단위 (I2V 렌더 최적화)
