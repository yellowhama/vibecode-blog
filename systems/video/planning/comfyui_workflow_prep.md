# ComfyUI 비디오 생성 워크플로우 가이드 (Phase 1 Act 1)

이 문서는 텍스트 프롬프트를 기반으로 **ComfyUI** 환경에서 고품질 이미지 및 비디오를 생성하기 위한 준비 및 워크플로우 가이드입니다. 

---

## 🚀 1. 핵심 파이프라인 (The Workflow)

Nano Banana나 단순 txt2vid API를 넘어 ComfyUI를 사용하면 **'일관성(Consistency)'**과 **'디테일 제어(Control)'**가 가능해집니다. 이를 위해 다음과 같은 **Text-to-Image (T2I) -> Image-to-Video (I2V)** 파이프라인을 구축합니다.

### 단계 요약:
1. **[T2I] 기준 프레임(Keyframe) 생성:** 각 Scene의 첫 장면 이미지를 ComfyUI (SDXL / Flux 등)로 고해상도로 뽑아냅니다.
2. **[I2V] 모션 생성:** 뽑아낸 고해상도 이미지를 첫 프레임으로 삼아 SVD (Stable Video Diffusion) 나 HunyuanVideo, Kling 등의 모델에 밀어 넣어 비디오(모션)를 만듭니다.
3. **[V2V] 연속성 유지 (선택):** 이전 씬의 마지막 프레임을 다음 씬의 첫 프레임으로 넣어 전환을 부드럽게 합니다.

---

## 🛠️ 2. ComfyUI 필수 노드 & 환경 준비

### 1) 기준 이미지 생성 (Text-to-Image) 모델 엄선
아드만 스튜디오 특유의 "찰흙 질감, 지문, 스튜디오 조명"을 입체적이고 일관되게 뽑아내려면 다음 모델들이 현재 최적입니다.
- **FLUX.1 [dev] (1순위 적극 추천):** 현재 프롬프트 이해도와 디테일 묘사(지문, 찰흙 텍스처)에서 가장 압도적인 성능을 보입니다.
  - *추천 세팅:* `FLUX.1 [dev]` + `IP-Adapter` (캐릭터 일관성 유지)
- **SDXL 기반 특화 모델 (2순위 / VRAM 최적화):** 
  - `Juggernaut XL` 또는 `DreamShaper XL`: 실사 수준의 라이팅과 질감 표현이 우수합니다.
  - *추천 세팅:* `SDXL` + `Claymation/Stop-motion LoRA` + `ControlNet (Depth)`
- **ControlNet (Depth/Canny 필수):** 칠판 씬이나 책상 구도가 여러 컷에 걸쳐 고정되어야 할 때 구도를 잠그는 용도로 씁니다.

### 2) 모션 비디오 생성 (Image-to-Video) 모델 엄선
생성된 찰흙 정지 컷을 아주 부드러운 물리 모션(커피 쏟아짐, 에러 블록의 자유 낙하 등)으로 연장할 때 퀄리티를 타협하지 않는 베스트 모델입니다.
- **HunyuanVideo (1순위 / 오픈소스 끝판왕):** 현재 ComfyUI 로컬 환경에서 가장 역동적이고 부드러운 고해상도를 뽑아줍니다. 찰흙 로봇이 분열하거나 괴물로 융합되는 복잡한 '체형 변화' 씬에 가장 강력합니다.
- **Mochi 1 (물리 엔진 특화):** 중력이나 유체(커피가 뿜어져 나오는 씬, 무거운 블록이 떨어져 튕기는 씬) 표현의 물리 법칙이 매우 사실적입니다. 
- **Kling AI (API 연동 추천):** 로컬 VRAM이 감당하기 힘들거나, 상업용 CF 수준의 "쿵" 떨어지는 물리 역학이 필요하다면 ComfyUI 내 API 노드를 붙여 쓰는 것이 가장 확실합니다.
- **SVD (Stable Video Diffusion):** VRAM이 12GB 이하로 제한적인 로컬 피시에서 타자를 치거나 눈을 껌벅이는 '미세하고 잔잔한 움직임' 위주로 쓸 수 있는 범용 대안입니다.

---

## 🎬 3. ComfyUI 실전 프롬프트 적용 팁 (Act 1 기준)

Act 1의 시나리오는 다음과 같이 쪼개서 작업하는 것이 ComfyUI에서 유리합니다. 단순 글 한 줄로 에러박스가 떨어지는 것까지 제어하기 어렵기 때문입니다.

### [Shot 1-A: 평온한 코딩과 커피 마시기]
- **T2I 프롬프트 (Initial Frame):** `Medium shot. Stop-motion claymation, Aardman studio style. The character starts out completely calm, sitting at a simple white clay desk. There is no error block yet. The character picks up a white clay coffee mug...`
- **I2V 모션:** 모션 강도(Motion Bucket Id)를 **낮게(Low)** 주어 미세하게 타자기 치는 모습과 커피 잔이 움직이는 정도의 잔잔한 모션을 생성합니다.

### [Shot 1-B: 엔터 누르기 & 에러 폭탄 투하]
- **T2I 프롬프트 (Initial Frame):** Shot 1-A의 마지막 프레임 이미지를 가져옵니다.
- **I2V 모션 (ControlNet 추가 권장):** 위에서 떨어지는 'Error' 블록의 궤적을 제어하기 위해 `ControlNet` (예: Error 글자가 박힌 사각형의 위치 이동) 또는 `Motion Brush` 기능을 써서 윗부분의 에러 블록이 아래로 강하게 떨어지도록 모션 벡터를 (아래로) 지정합니다. 모션 강도(Motion Bucket Id)를 **높게(High)** 주어 역동적으로 만듭니다.

---

## 🗂️ 4. 워크플로우 다운로드 및 로드 방법

1. ComfyUI Manager를 통해 위 언급된 커스텀 노드(`ComfyUI-VideoHelperSuite`, `IPAdapter`, `ControlNet`)를 모두 설치합니다.
2. `SDXL/FLUX` 모델과 `SVD` 모델 체크포인트를 `models/checkpoints` 폴더에 넣습니다.
3. T2I -> I2V 로 이어지는 통합 JSON 워크플로우를 ComfyUI 캔버스에 드래그 앤 드롭합니다.
4. `Load Image` 노드 부분에 **"캐릭터 디자인 컨셉 원화"** 이미지를 넣습니다. (IPAdapter 용)
5. 프롬프트 창에 `phase1_act1_video_prompts.md` 에 있는 텍스트를 복사/붙여넣기 합니다.
6. `Queue Prompt` 클릭하여 1차 기준 이미지를 뽑고, 마음에 들면 그대로 I2V 노드로 넘겨 비디오를 렌더링합니다.

---

이 문서는 실무에서 ComfyUI 노드 트리를 짤 때 참고할 수 있도록 구성된 베이스라인 가이드입니다. 세부적인 JSON 파일은 향후 파라미터 테스트를 하면서 Export 할 수 있습니다.
