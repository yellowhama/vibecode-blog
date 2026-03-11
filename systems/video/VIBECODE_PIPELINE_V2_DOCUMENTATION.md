# Content Boss v2.1: 비디오 파이프라인 시스템 명세서

## 1. 개요 (System Overview)
*   **목표**: 블로그 글 한 편으로 브랜딩이 박힌 고퀄리티 유튜브 영상(3막+훅 구조)을 자율 생산.
*   **핵심 철학**:
    *   **Result-First Hook**: 영상 시작 10초 내에 결과를 보여줌.
    *   **Nike Rule**: 대사를 최소화하고 클레이모션 액션으로 증명.
    *   **Agent-Mediated**: 에이전트(Gemini/Claude)의 창의성과 파이썬의 엄격한 규격을 결합.

## 2. 파이프라인 워크플로우 (The DAG)

| 단계 | 스크립트 | 역할 | 결과물 |
| :--- | :--- | :--- | :--- |
| **Step 1** | `build_blog_to_video_prepro.py` | MD 분석 및 비트(Beats) 쪼개기 | `prepro_manifest.json` |
| **Step 2** | `adapt_blog_to_script.py` | 에이전트용 고밀도 프롬프트 생성 | `script_generation.prompt` |
| **Step 3** | **Agent (Gemini/Claude)** | 4막 스크립트 및 매니페스트 작성 | `narration_script.fountain` |
| **Step 4** | `generate_tts_simple.py` | Edge-TTS 목소리 및 자막 생성 | `voiceover_master.wav`, `.srt` |
| **Step 5** | `sync_shots_to_audio.py` | 실제 목소리 길이에 맞춰 영상 싱크 조정 | `shots_synchronized.json` |
| **Step 5.5** | `generate_kontext_keyframes.py` | **골든 레퍼런스 → 씬별 키프레임 (캐릭터 일관성)** | `{shot_id}_keyframe.png` |
| **Step 6** | `comfy_batch_render.py` | RTX 5070 Ti 가동 (ComfyUI API) | `N001.mp4` ~ `N008.mp4` |
| **Step 7** | `finalize_video_v2.py` | 영상+오디오+자막+BGM 최종 믹싱 | `FINAL_CONTENT_BOSS.mp4` |

### 2-pass 렌더 아키텍처

```
Golden Ref (1장)
    ↓ Flux Kontext (Pass 1)
씬별 키프레임 PNG (캐릭터 동일인물)
    ↓ Wan I2V (Pass 2)
5초 영상 클립
```

*   **Pass 1 (Kontext)**: `generate_kontext_keyframes.py` → 골든 레퍼런스 이미지를 Flux Kontext로 편집하여 씬별 키프레임 생성. 얼굴/스타일/색감 유지.
*   **Pass 2 (I2V)**: `comfy_batch_render.py` → Kontext 키프레임을 Wan I2V `start_image`로 사용하여 5초 영상 생성.
*   ComfyUI가 모델 자동 스왑 (Kontext ~12GB → Wan ~13.4GB). 동시 로드 없음.

## 3. 핵심 컴포넌트 상세

### **A. 내러티브 엔진 (`branding/storyform.json`)**
*   프로젝트의 **SSOT(Single Source of Truth)**.
*   3막 구조(Fury, Mess, Insight)와 금지어, 필수 비유 등을 정의하여 모든 에이전트가 동일한 톤을 유지하게 함.

### **B. 지능형 샷 플래너 (`shot_planner.py`)**
*   에이전트가 쓴 스크립트를 읽어 렌더링용 샷 리스트 생성.
*   **나이키 룰 검증**: 초당 단어 수를 계산해 말이 너무 많으면 경고(`NIKE RULE VIOLATION`)를 띄움.

### **C. 오디오 엔진 (`audio_catalog.py` & `video_assembler.py`)**
*   **Act-based BGM**: 막(Act)이 바뀔 때마다 배경음악을 자동으로 교체.
*   **SFX Injection**: "crash", "type", "clay" 등 키워드 감지 시 효과음을 해당 위치에 자동 삽입.
*   **Sidechain Ducking**: 목소리가 나올 때 배경음 볼륨을 자동으로 낮춤.

### **D. 품질 검수 게이트 (`evaluate_renders.py`)**
*   `PySceneDetect` 통합: 한 샷 내에 의도치 않은 컷(`BadCut`)이 발생하면 패키징 단계에서 차단.
*   유튜브 썸네일 자동 생성: Hook 단계에서 가장 화려한 프레임 추출.

### **E. Kontext 캐릭터 일관성 엔진 (`generate_kontext_keyframes.py`)**
*   **골든 레퍼런스** 1장으로 모든 씬의 키프레임을 자동 생성.
*   Flux Kontext 모델이 레퍼런스 이미지를 편집하여 씬만 변경, 얼굴/스타일 유지.
*   shot manifest의 `kontext_prompt` 필드 사용 (I2V `prompt_positive`와 분리).
*   프롬프트 템플릿: `{씬 지시문}. 3D Pixar-like render style. Keep her exact face, hair, glasses, and yellow hoodie unchanged.`

## 4. 운영 가이드 (Operation)

### **전체 실행 (자동 중단 포함)**
```bash
python3 systems/video/pipeline/scripts/run_blog_to_video_pipeline.py \
    --blog content/blog/phase1/en/act1-en.md \
    --language en \
    --golden-ref ivy_burr_golden_ref.png
```
*   `--golden-ref` 지정 시 Kontext 키프레임 자동 생성 (Step 5.5).
*   `--skip-kontext` 로 이미 생성된 키프레임 재사용.
*   `--golden-ref` 없으면 Kontext 스킵 (하위 호환).

### **E2E 파이프라인 (TTS + Kontext + Render + Package)**
```bash
python3 systems/video/pipeline/scripts/run_end_to_end_video_pipeline.py \
    --manifest shots.json \
    --workflow wan22_moe_i2v_full.json \
    --bindings wan22_moe_i2v_bindings.json \
    --golden-ref ivy_burr_golden_ref.png \
    --kontext-guidance 2.5
```

### **렌더링 후 최종 조립**
```bash
python3 systems/video/pipeline/scripts/finalize_video_v2.py \
    --run-dir systems/video/preproduction/act1-en_20260310_092949
```

## 5. 인프라 설정
*   **ComfyUI**: 8188 포트 사용. 서버 실행: `bash systems/video/scripts/run_comfy_server.sh`
*   **이미지 모델**: Flux.1-dev GGUF (T2I) + Flux Kontext GGUF (씬 편집)
*   **영상 모델**: Wan 2.2 GGUF MoE (HighNoise + LowNoise Q3_K_M, 각 6.7GB)
*   **레거시 모델**: `hunyuan_v15_fp8` (심볼릭 링크 완료)
*   **커스텀 노드**: `ComfyUI-GGUF`, `ComfyUI-PuLID-Flux`
*   **의존성**: `edge-tts`, `ffmpeg`, `scenedetect` 기반.

## 6. ByteDance API 통합 특이사항
*   **지원 노드**: `ByteDanceImageToVideoNode`, `ByteDanceTextToVideoNode` 등.
*   **해상도(Resolution)**: `"480p"`, `"720p"`, `"1080p"` 중 하나를 명확히 지정해야 함 (문자열).
    *   *주의*: `ByteDanceImageReferenceNode`는 `"1080p"`를 지원하지 않음.
*   **길이(Duration)**: 3~12초 범위의 **초(seconds)** 단위를 사용.
    *   *주의*: 로컬 훈위안 모델과 달리 프레임(frames) 단위가 아니므로 `comfy_batch_render.py`에서 별도 처리가 필요함 (패치 완료).

## 7. Wan 2.2 GGUF MoE 렌더링 엔진

### 모델 구성
*   **MoE 구조**: `HighNoise`(구조) + `LowNoise`(디테일) 2단계 디노이징.
*   **양자화**: Q3_K_M (각 6.7GB) — RTX 5070 Ti 16GB VRAM에 최적.
*   **모델 경로**:
    *   `models/unet/HighNoise/Wan2.2-I2V-A14B-HighNoise-Q3_K_M.gguf`
    *   `models/unet/LowNoise/Wan2.2-I2V-A14B-LowNoise-Q3_K_M.gguf`
    *   `models/unet/Wan2.2-Animate-14B-Q3_K_M.gguf` (T2V용, 미사용)

### API 워크플로우 템플릿 (`workflows/api/`)

#### Flux (이미지 생성)
| 워크플로우 | 용도 | VRAM |
|:---|:---|:---|
| `flux_dev_t2i.json` | 기본 T2I (캐릭터시트, 컨셉아트) | ~9GB |
| `flux_kontext_edit.json` | **Kontext 씬 편집 (캐릭터 일관성 최강)** | ~12GB |
| `flux_controlnet_t2i.json` | T2I + ControlNet 포즈 제어 | ~13GB |
| `flux_lora_t2i.json` | T2I + LoRA 캐릭터 고정 | ~9.2GB |
| `flux_lora_controlnet_t2i.json` | T2I + LoRA + ControlNet 결합 | ~13.2GB |
| `flux_pulid_t2i.json` | T2I + PuLID 얼굴 일관성 (실사 전용) | ~11.6GB |
| `flux_pulid_controlnet_t2i.json` | T2I + PuLID + ControlNet | ~15.6GB |
| `flux_face_inpaint.json` | 얼굴 인페인팅 (Flux Fill) | ~9GB |

#### Wan (영상 생성)
| 워크플로우 | 용도 | 해상도 | 프레임 |
|:---|:---|:---|:---|
| `wan22_moe_i2v_short.json` | 짧은 영상 (모션테스트) | 768x768 | 33 (2초) |
| `wan22_moe_i2v_full.json` | 프로덕션 영상 (본편 샷) | 768x768 | 81 (5초) |
| `wan22_moe_t2i.json` | ~~이미지~~ **(사용 금지 — Flux 사용)** | 1024x1024 | 1 |

### MoE 세팅 차이
| | T2I (이미지) | I2V (영상) |
|:---|:---|:---|
| sampler | `uni_pc` | `euler` |
| scheduler | `beta` | `simple` |
| steps | 35 (0→8 / 8→35) | 20 (0→10 / 10→20) |
| cfg | 2.5 / 3.5 | 3.5 / 3.5 |

### 주의사항
*   `ModelSamplingSD3`에 `shift`만 설정 (width/height 넣으면 에러).
*   `VHS_VideoCombine` 미설치 시 `SaveImage`로 PNG 시퀀스 출력.
*   I2V 입력 이미지는 `ComfyUI/app/input/` 폴더에 위치해야 함.

## 8. 캐릭터 시스템 — Ivy Burr (아이비 버)

### 캐릭터 디자인 v4.0
*   **SSOT**: `systems/video/assets/characters/vee/character_design.json`
*   **스타일**: 3D Pixar-like render with subtle clay texture (NOT heavy claymation, NOT photorealistic)
*   **외형 레퍼런스**: 장나라(얼굴형, 표정) 60% + Amy Adams(머리색, 분위기) 40%
*   **핵심 특징**:
    *   피부: 따뜻한 레몬크림 매트 클레이 (#FFF3D4)
    *   머리: 코코아 브라운 웨이브 (#5D4037)
    *   의상: MUSU Yellow 후디 (#FFD166) + 블루 데님 쇼츠 (#5C6BC0)
    *   악세: 두꺼운 검정 동그란 안경, 살짝 비뚤어진 채
    *   체형: 4.5등신, 날씬한 성인 여성 (치비 아님)

### 캐릭터 일관성 (Identity Persistence)
*   **Primary: Flux Kontext** — 골든 레퍼런스 이미지를 편집해 씬별 키프레임 생성. 5/5 테스트 통과.
*   **Secondary: PuLID-Flux** — 실사 전용. 스타일 캐릭터에서 InsightFace 임베딩 실패.
*   **골든 레퍼런스**: `ivy_burr_golden_ref.png` (Flux T2I, seed=2025, guidance=3.5)
*   **프롬프트 잠금**: 모든 Kontext 샷에 `"Keep her exact face, hair, glasses, and yellow hoodie unchanged"` 강제.
*   **character_extractor.py**: `KNOWN_CHARACTERS`에 Vee 등록 완료.

### Bee 캐릭터 v1.0 (사이드킥)
*   **SSOT**: `systems/video/assets/characters/bee/character_design.json`
*   **역할**: Vee의 사이드킥 — 귀여운 공사장 인부 꿀벌, 내면은 지친 아저씨
*   **사이즈**: Vee 발목 높이 (Adventure Time식 Finn:BMO 비율)
*   **외형**: 노랑검정 줄무늬 통통한 둥근 몸, 노란 안전모, 반투명 날개, 더듬이 2개
*   **골든 레퍼런스**: `bee_golden_ref.png` (Flux T2I, seed=3103, 짜증 기본 표정)
*   **표정 시트 6종**: happy, tired, shocked, crying, sleeping, love (`expressions/` 폴더)
*   **일관성 참고**: Kontext 편집 불가 확인 (guidance 2.5~7.0 모두 실패 — 원본 표정 고착). T2I 표정별 개별 생성으로 대체.
*   **성격 갭**: 기본은 짜증+피로 (지친 아저씨) ↔ 가끔 해맑은 순간 (갭 매력)
