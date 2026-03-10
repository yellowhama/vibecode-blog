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
| **Step 6** | `comfy_batch_render.py` | RTX 5070 Ti 가동 (ComfyUI API) | `N001.mp4` ~ `N008.mp4` |
| **Step 7** | `finalize_video_v2.py` | 영상+오디오+자막+BGM 최종 믹싱 | `FINAL_CONTENT_BOSS.mp4` |

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

## 4. 운영 가이드 (Operation)

### **전체 실행 (자동 중단 포함)**
```bash
python3 systems/video/pipeline/scripts/run_blog_to_video_pipeline.py \
    --blog content/blog/phase1/en/act1-en.md \
    --language en
```
*   실행 후 `[PAUSE]` 메시지가 뜨면 생성된 `.prompt` 파일을 에이전트에 넣고 결과물을 작업 폴더에 저장.

### **렌더링 후 최종 조립**
```bash
python3 systems/video/pipeline/scripts/finalize_video_v2.py \
    --run-dir systems/video/preproduction/act1-en_20260310_092949
```

## 5. 인프라 설정
*   **ComfyUI**: 8188 포트 사용. 서버 실행: `bash systems/video/scripts/run_comfy_server.sh`
*   **기본 모델**: Wan 2.2 GGUF MoE (HighNoise + LowNoise Q3_K_M, 각 6.7GB)
*   **레거시 모델**: `hunyuan_v15_fp8` (심볼릭 링크 완료)
*   **커스텀 노드**: `ComfyUI-GGUF` (UnetLoaderGGUF 노드)
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
| 워크플로우 | 용도 | 해상도 | 프레임 |
|:---|:---|:---|:---|
| `wan22_moe_t2i.json` | 이미지 생성 (캐릭터시트, 컨셉아트) | 1024x1024 | 1 |
| `wan22_moe_i2v_short.json` | 짧은 영상 (앵글전환, 모션테스트) | 768x768 | 33 (2초) |
| `wan22_moe_i2v_full.json` | 프로덕션 영상 (본편 샷) | 768x768 | 81 (5초) |

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

## 8. 캐릭터 시스템 — Vee (비)

### 캐릭터 디자인 v2.0
*   **SSOT**: `systems/video/assets/characters/vee/character_design.json`
*   **스타일**: Aardman claymation (핑거프린트 텍스처, 매트 마감)
*   **외형 레퍼런스**: 장나라(얼굴형, 표정) 60% + Amy Adams(머리색, 분위기) 40%
*   **핵심 특징**:
    *   피부: 따뜻한 레몬크림 매트 클레이 (#FFF3D4)
    *   머리: 오번-코퍼 웨이브 (#B7472A)
    *   의상: 코코아 브라운 후디 (#5D4037) + 블루 데님 쇼츠 (#5C6BC0)
    *   악세: 두꺼운 검정 동그란 안경, 살짝 비뚤어진 채
    *   체형: 치비 비율 (4등신), 뭉툭한 팔다리

### 캐릭터 일관성 (Identity Persistence)
*   **I2V 방식**: 정면 시트(`Vee_sheet_front.png`)를 `start_image`로 사용하여 앵글 전환 렌더링.
*   **프롬프트 잠금**: 모든 샷에 identity 키워드 강제 삽입 (`auburn clay hair, cocoa brown hoodie, round glasses`).
*   **character_extractor.py**: `KNOWN_CHARACTERS`에 Vee 등록 완료.
