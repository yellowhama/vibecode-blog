# AI 영상 생성을 위한 필수 시각 에셋 (Consistency Assets)

스토리보드(기획안) 다음으로, Midjourney 나 Sora 같은 AI 영상 모델이 **매 영상마다 똑같은 캐릭터와 분위기**를 유지(Consistency)하게 만들려면 3가지 핵심 시각 에셋(규칙)이 추가로 필요합니다. 

이 규칙들은 스킬(`video_pipeline`) 안에 고정 프롬프트로 들어가거나, 사용자님이 미리 미드저니에서 뽑아둔 '기준 이미지(Reference Image)' 역할을 하게 됩니다.

---

## 1. 캐릭터 마스터 시트 (Character Master Sheet)
AI는 "피곤한 프로그래머"라고만 쓰면 매번 헐리우드 배우부터 애니메이션 주인공까지 얼굴을 다르게 뽑습니다. 이를 방지하기 위해 형태, 색상, 질감을 완전히 고정하는 묘사가 필요합니다.

- **외형 (Shape & Form):** 매우 뚱뚱하고 뭉툭한 체형(Chubby & Stubby). 팔과 다리가 짧고 굵으며 발이 따로 없음.
- **머리와 얼굴 (Face):** 노란색의 크고 눈사람 같은 둥근 얼굴. 넓게 벌어진 반쯤 감긴 크고 튀어나온 피곤한 눈(tired, heavy eyelids, white sclera with black pupils). 양 눈 사이에 아주 작은 둥근 구슬 모양의 노란 코. 살짝 아래로 굽은 입모양(frown)으로 무심하고 회의적인 표정.
- **복장 (Outfit):** 
  - 무광 코코아 브라운(#5D4037) 색상의 두꺼운 오버사이즈 후드티(Oversized thick hoodie).
  - 후드(모자)를 정수리 위까지 푹 눌러쓰고 있어 노란색 얼굴 테두리를 액자처럼 감싸고 있는 형태.
  - 배 부분에는 넓은 캥거루 주머니(Kangaroo pocket) 디테일. 소매 끝으로 작고 뭉툭한 노란색 손만 튀어나옴.
- **질감 (Texture):** 지문과 주름 등 거칠고 수작업 느낌이 강한 찰흙 표면(highly textured clay, fingerprint). 광택 없는 무광 매트(matte).
- **시그니처 컬러 (Color):** 캐릭터의 피부(얼굴/손/다리)는 밝고 따뜻한 노란색 `Musu Yellow #FFD166`, 외투는 코코아 브라운 `Cocoa Brown #5D4037`로 고정.

> 💡 **사용자님의 역할 (1회성 작업):** 
> 미드저니에서 이 프롬프트로 가장 마음에 드는 캐릭터 이미지 1장을 뽑습니다. 앞으로 모든 영상을 만들 때 이 이미지 URL을 `--cref` (캐릭터 변환) 파라미터나 Sora의 레퍼런스 이미지로 집어넣어 얼굴을 고정합니다.

---

## 2. 오브젝트 / 소품 규칙 (Core Objects / Props)
찰흙 애니메이션(화이트보드 형식)은 배경이 없기 때문에 소품이 곧 배경이자 메시지입니다. 소품들의 색상과 형태도 고정해야 합니다.

- **책상 및 업무 환경 (Workspace):**
  - "하얀색 찰흙으로 만들어진 아주 단순하고 미니멀한 책상. 그 위에 놓인 아주 뭉툭하고 장난감 같은 하얀 찰흙 컴퓨터와 찰흙 머그잔."
- **AI 에이전트 (조력자 - 스펙 적용 후의 로봇):** 
  - "주인공의 밝고 따뜻한 노란색(`Musu Yellow #FFD166`) 피부와 동일한 질감을 공유하는, 아주 작고 뭉툭한(stubby) 찰흙 로봇. 팔다리는 동글동글하며 찰흙 특유의 지문이 남아있음. 작지만 반짝이는 생기있는 까만 점눈을 가짐."
- **버그 / 에러 / 스파게티 코드 (장애물 - 통제 전의 괴물):** 
  - "주인공의 후즈와 대비되는, 시커멓고 거친 찰흙들이 뭉쳐 징그럽고 제멋대로 자라난(Spaghetti) 거대한 거미 괴물 형태. 찰흙이 덕지덕지 붙어있으며, 배 쪽에 경고를 의미하는 핏빛 붉은색 찰흙이 입벌린 문(door)처럼 벌어져 있음."
- **분노의 상징 (Fury-Driven Props):**
  - "캐릭터의 머리에서 주전자처럼 뿜어져 나오는 새하얀 찰흙 증기(Steam) 뭉치들. 그리고 하얀색 찰흙 머그잔과 거기서 흩뿌려진 듯한 코코아 브라운 찰흙 커피 파편들."
- **설계도 / 스펙 (해결책):**
  - "매우 납작하고 반듯하며 스스로 약간 빛나는(glowing) 듯한 매끄러운 하얀색 찰흙 판. 표면에 검은색 마커 펜 자국처럼 음각으로 파인 찰흙 디테일 라인들."
- **브랜드 로고 (Logo):**
  - "주인공의 노란 찰흙과 같은 텍스처를 가진, 작고 둥근 노란색 찰흙 공 4개가 촘촘히 뭉쳐져 납작하게 눌린 육각형 벌집 모양. 그 아래 무광 코코아 브라운색 찰흙 판이나 밑바닥 위에 동글동글한 필기체 형태로 파인(음각) 'MUSU' 모양 글자."

---

## 3. 환경 및 조명 룰 (Environment & Lighting)
영상의 '톤앤매너'를 결정짓는 핵심입니다. 이걸 고정하지 않으면 AI가 멋대로 방구석, 우주선, 밤거리 배경을 만들어버립니다.

- **배경 여백 (Background):** (예: "절대적인 무의 공간. 끝없이 펼쳐진 Off-White `#FDFCF0` 단색의 솔리드 배경. 벽이나 바닥의 경계선이 없음.")
- **조명 (Lighting):** (예: "스튜디오 소프트박스 매트 라이팅. 그림자가 아주 부드럽고 얕게 깔림. 강한 대비나 번쩍이는 빛(Glare) 일절 없음.")

---

### 🚀 파이프라인 적용 방법
제가 만든 `video_pipeline` 스킬은 글을 읽고 위 1, 2, 3번 규칙을 프롬프트 블록으로 먼저 쫙 뽑아내도록 설계되어 있습니다.

**[예시: 스킬이 뽑아주는 프롬프트 덩어리]**
```text
[Character Ref]: Aardman style minimalist clay figure, very chubby and stubby proportions with short legs. Bright Musu Yellow (#FFD166) round face with wide-set half-closed tired protruding eyes, a tiny round yellow nose, and a slight frown. Wearing a large oversized thick muted cocoa brown hoodie (#5D4037) with the hood pulled up framing the face, and a front kangaroo pocket. Heavy fingerprint textures, matte finish.
[Environment]: Solid Off-White empty background, soft studio matte lighting.
[Shot 1 Action]: A bright yellow piece of clay drops from the top and morphs into a small gear.
```

이렇게 고정된 에셋 룰이 있어야, 사용자가 미드저니나 영상 생성 툴에 그대로 복사+붙여넣기를 했을 때 **"어제 만든 1편과 오늘 만든 2편이 똑같은 캐릭터와 질감"**을 가지게 됩니다.
