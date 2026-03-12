# 스토리보드 & 키프레임 파이프라인 가이드

> EP01 1차 렌더 포스트모템 + Kontext/스토리보드 리서치 결과 종합 (2026-03-13)

---

## EP01 1차 렌더 문제점

| 문제 | 원인 | 영향 |
|------|------|------|
| 모든 씬이 얼굴에서 시작 | golden ref(초상화 1024x1024)를 Kontext 입력으로 사용 | I2V가 매 샷을 클로즈업 얼굴에서 시작 |
| 1:1 비율 찌그러짐 | Kontext 출력 1024x1024 + I2V defaults 768x768 | 글씨/그림 뭉개짐, 레터박스 없이 스퀘어 |
| 장면 구도 없음 | 스토리보드 단계 건너뜀 | 모든 샷이 동일한 구도 (얼굴 정면) |

**근본 원인**: Kontext에 "씬 구도 스토리보드"가 아닌 "캐릭터 초상화"를 넣음.

---

## Kontext 정리

### Kontext란?
- Black Forest Labs의 **in-context 이미지 편집** 모델
- 입력 이미지를 기반으로 프롬프트 지시에 따라 편집
- **핵심**: 입력 이미지의 구도/구성을 유지하면서 요소를 변경
- 8x faster than competitors, 여러 참조 이미지 동시 처리 가능

### Kontext 올바른 사용법
- **입력 = 편집할 대상 이미지** (초상화가 아니라 씬 구도)
- 씬 스토리보드를 넣으면 → 캐릭터 일관성 유지하면서 씬 편집
- 초상화를 넣으면 → 초상화 변형만 생성 (우리가 한 실수)
- **iterative workflow**: 각 프레임이 다음 프레임의 컨텍스트로 사용 가능

### Kontext 한계
- 입력 이미지에 없는 구도를 만들어내지 않음 (편집이지 생성이 아님)
- 따라서 **T2I로 먼저 씬 구도를 만든 후** Kontext로 캐릭터 보정하는 2단계가 필요

---

## 올바른 파이프라인 (수정)

```
Script → Shot List → T2I 스토리보드 (16:9) → Kontext 캐릭터 보정 → I2V → 편집
         ↑                ↑                         ↑
     shot manifest    Flux T2I              golden ref + scene
                    씬 구도 + 카메라         캐릭터 일관성 보정
```

### Phase 1: T2I 씬 스토리보드 생성
- **모델**: Flux Dev T2I (또는 SDXL)
- **해상도**: 832x480 (16:9, WAN I2V 호환) 또는 1024x576
- **프롬프트 전략**:
  - 카메라 프레이밍 명시: "wide shot", "medium shot", "close-up"
  - 캐릭터 디스크립션 포함: "Ivy Burr (cocoa-brown hair, round glasses, yellow hoodie)"
  - 환경/조명 명시: "dark room with five glowing monitors", "warm lighting"
  - 스타일 앵커 일관 유지: "3D Pixar-like render, subtle clay texture"
- **배치 처리**: shot manifest의 `prompt_positive`를 그대로 활용

### Phase 2: Kontext 캐릭터 보정 (선택)
- **입력**: Phase 1에서 생성한 씬 스토리보드 (16:9)
- **프롬프트**: "Keep the same scene composition. Ensure the character matches: [캐릭터 디스크립션]"
- **용도**: Vee 얼굴/의상 일관성이 부족한 프레임만 선별 보정
- **주의**: 모든 프레임에 적용할 필요 없음, 문제 프레임만

### Phase 3: I2V 렌더
- **입력**: 스토리보드 키프레임 (832x480)
- **해상도**: width=832, height=480 (shot manifest + bindings에 명시)
- **모델**: WAN 2.2 MoE I2V

---

## 캐릭터 일관성 기법 비교

| 기법 | 용도 | 장점 | 단점 |
|------|------|------|------|
| **Kontext** | 이미지 편집 기반 일관성 | 빠름, 반복 보정 가능 | 구도 변경 불가, 입력 의존적 |
| **IP-Adapter FaceID** | 얼굴 구조 주입 | 다양한 포즈/씬에서 작동 | 의상/체형 드리프트 |
| **PuLID Flux II** | 얼굴 ID 보존 | 스타일 오염 없음, 2캐릭터 지원 | 얼굴만 (체형 별도) |
| **ControlNet OpenPose** | 포즈 제어 | 정확한 포즈 지정 | ID 보존 안 됨 (다른 툴과 조합) |
| **ControlNet Depth** | 씬 구도 제어 | 공간 배치 정확 | 캐릭터 ID 없음 |
| **StoryDiffusion** | 멀티프레임 일관성 | 시퀀스 전체 일관성 | 3+ 프롬프트 필요, 셋업 복잡 |

### 추천 조합 (우리 파이프라인)

**Tier 1 (품질 우선)**:
1. Flux T2I로 16:9 씬 스토리보드 생성
2. PuLID Flux II로 얼굴 일관성 보정
3. ControlNet OpenPose로 포즈 보정 (필요시)
4. WAN 2.2 I2V

**Tier 2 (속도 우선, 현재 추천)**:
1. Flux T2I로 16:9 씬 스토리보드 생성 (prompt_positive에 캐릭터 디스크립션 충분)
2. 문제 프레임만 Kontext로 캐릭터 보정
3. WAN 2.2 I2V

---

## 프롬프트 가이드

### 씬 스토리보드용 T2I 프롬프트 구조

```
[카메라] [모션] [스타일]
[캐릭터 디스크립션]
[장면/환경]
[액션/감정]
[금지사항]
```

**예시 (Sitcom)**:
```
Medium wide shot, static composition. 3D Pixar-like render with subtle clay texture.
Warm lighting, shallow depth of field.
Ivy Burr (cocoa-brown hair, round glasses, yellow hoodie, denim shorts)
sitting in a dark room with five glowing monitors showing code and dashboards.
She leans back in her chair with a huge grin, arms raised in celebration.
NO TEXT, NO LETTERS, NO SUBTITLES, NO WATERMARK.
```

**예시 (Explainer)**:
```
Kurzgesagt-style infographic animation frame.
Clean geometric shapes on dark navy (#0D1B2A) background.
A blueprint unfolds on the left side, blue lines trace a building outline.
Bold saturated colors (orange #FF6B35, cyan #00D4FF, green #7AE582), soft glow.
NO characters, NO text, NO labels. Abstract concept visualization.
```

### 핵심 규칙
- **프레이밍 명시**: "wide shot", "medium shot" 등 반드시 포함
- **캐릭터 디스크립션 매번 포함**: 모델은 이전 프레임을 기억 못함
- **스타일 앵커 일관**: 모든 프롬프트에 동일 스타일 문구 사용
- **한 번에 하나만 변경**: 포즈+의상+배경+카메라 동시 변경 금지

---

## 해상도 가이드

| 용도 | 해상도 | 비율 | 비고 |
|------|--------|------|------|
| 스토리보드 (리뷰용) | 1280x720 | 16:9 | 빠른 생성, 시각 확인 |
| I2V 키프레임 (WAN 480p) | **832x480** | 16:9 | 64로 나눠떨어짐, WAN 최적 |
| I2V 키프레임 (WAN 720p) | 1280x720 | 16:9 | VRAM 24GB+ 필요 |
| 상용 I2V (Kling/Runway) | 1920x1080 | 16:9 | HD 네이티브 |

---

## 관련 ComfyUI 커스텀 노드

| 노드 | 용도 | GitHub |
|------|------|--------|
| ComfyUI_IPAdapter_plus | 캐릭터 ID 참조 | cubiq/ComfyUI_IPAdapter_plus |
| ComfyUI_StoryDiffusion | 멀티프레임 일관성 | smthemex/ComfyUI_StoryDiffusion |
| ComfyUI-PuLID-Flux-Chroma | 얼굴 ID 보존 | PaoloC68/ComfyUI-PuLID-Flux-Chroma |
| ComfyUI-batching-nodes | 배치 프롬프트 처리 | Hahihula/ComfyUI-batching-nodes |
| ComfyUI_Fill-Nodes | 샷 메타데이터 추출 | filliptm/ComfyUI_Fill-Nodes |
| ComfyUI-Inspire-Pack | foreach 루프, 배치 로딩 | ltdrdata/ComfyUI-Inspire-Pack |

---

## 다음 액션 (EP01 리렌더)

1. `flux_dev_t2i` 워크플로우로 24샷 16:9 스토리보드 키프레임 생성
2. 키프레임 품질 리뷰 → 문제 프레임만 Kontext 보정
3. WAN 2.2 I2V (832x480) 렌더
4. 최종 조립
