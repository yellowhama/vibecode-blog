# 주제 카드 — EP01

## 주제
> 스펙

## 세 가지

| | 내용 |
|--|------|
| **뭔지** | "뭘 만들 건지" 적어둔 것. 목적/이유/방법/수단. |
| **없으면** | AI한테 하나씩 물어보면 핑퐁 무한루프. 고치면 옆에서 터짐. |
| **있으면** | 뭘 만드는지 알고 시작. 에러가 있어도 뭘 고칠지 앎. |

## 3막 구조

| 막 | 전달 | 형식 | 소재 창고에서 뽑은 장면 |
|----|------|------|----------------------|
| 1막 (없으면) | 스펙 없이 만들면 이렇게 된다 | 시트콤 | act1-1 + 058: 바이브코딩 몽타주→에러→핑퐁 |
| 2막 (뭔지) | 스펙은 이런 거다 | 해설 | 설계도 메타포 + 네 칸(목적/이유/방법/수단) |
| 3막 (있으면) | 스펙 있으면 달라진다 | 시트콤 | 058: 짜증→질문→스펙 |

## Vee의 변화
- **착각** (시작): "돌아가니까 됐다"
- **깨달음** (끝): "짜증을 정리하면 그게 스펙이다"

## 쇼츠 후보
1. HOOK 전체 (20s) — Vee celebrates → error explosion
2. EXPLAINER "stacking without blueprint → collapse" (15s)
3. ENDING mirror shot — same errors, paper pinned (15s)

## 상태
- [x] Phase 0: 주제 정의 — **유저 승인 완료**
- [x] Phase 1: 스토리 설계 — `ep01_story_design.md` (Story Circle + Spine + 감정 트래커 + 소재 매핑)
- [x] Phase 2: Fountain 집필 — SITCOM1 소수정 + SITCOM2 전면 재작성 + ENDING 전면 재작성
- [x] Phase 3: 구조 검증 — 자동 16/16 PASS + 수동 리뷰 완료
- [x] **Phase 4: 포맷 전환 (2026-03-12)** — 내레이터 온리 + 영어 대본 전면 재작성
  - 포맷 바이블: 내레이터 전 세그먼트 주도, 캐릭터 대사 제거, 비주얼 코미디 가이드 추가
  - 검증 스크립트: NARRATOR 필수 체크로 반전, 수동 체크리스트 확장
  - 대본 스킬: 내레이션 온리 + 영어 + 정보 경로 + Curse of Knowledge 원칙
  - EP01 Story Design: 정보 경로 최상단, 비주얼 코미디 비트 리스트
  - EP01 Fountain: 영어 전면 재작성, 21/21 PASS
  - 커밋: `ff4e1c9`

- [x] **Phase 5: 프로덕션 파이프라인 Phase 1-3 (2026-03-12)** — `d79a0a1`
  - `parse_fountain_to_prepro.py`: `--language` 플래그, 자동 감지, 영어 WPM 기반 duration
  - Prepro manifest 재생성: 5 segments, 31 beats, `language=en`, 전원 narrator
  - TTS 생성: `en-US-AriaNeural`, 148.9s master audio + SRT 자막
  - Shot manifest 재생성: 24 shots (15 sitcom + 9 explainer), 180s, 영어 프롬프트

- [x] **Phase 6: 키프레임 생성 1차 (2026-03-12)** — Flux Kontext 15샷 + T2I 3샷, 18개 키프레임
- [x] **Phase 7: I2V/T2V 렌더 1차 (2026-03-12~13)** — WAN 2.2 MoE I2V 18샷 + T2V 6샷 = 24 MP4
- [x] **Phase 8: 최종 조립 1차 (2026-03-13)** — `EP01_FINAL.mp4` (179.5s, 31MB, 자막 포함)

- [x] **Phase 9: QA 포스트모템 + 파이프라인 수정 (2026-03-13)** — `33a68d3`
  - **1차 렌더 문제**: 모든 씬이 얼굴 클로즈업에서 시작, 1:1 비율 찌그러짐
  - **근본 원인**: Kontext에 초상화(1024x1024) 입력 → 씬 구도 없이 얼굴만 생성
  - **수정**: 바인딩 768x768→832x480, shot manifest에 width/height 명시
  - **올바른 파이프라인 문서화**: `05-storyboard-keyframe-pipeline.md`
    - T2I 씬 스토리보드(16:9) → Kontext 캐릭터 보정(선택) → I2V
  - **Kontext 딥 리서치**: latent concatenation 아키텍처, RefControl LoRA, 프롬프트 가이드

## EP01 2차 렌더 — 진행 상황

- [x] **Phase 10: T2I 스토리보드 파이프라인 구현 (2026-03-13)** — `00bfa17`
  - 신규: `generate_t2i_storyboards.py` — shot manifest → Flux Dev T2I 832x480 16:9 배치 생성
  - 수정: `generate_kontext_keyframes.py` — `--storyboard-dir` 추가, golden-ref 선택적
  - T2I/explainer 샷은 Kontext 바이패스 (스토리보드 → 키프레임 직접 복사)
  - dry-run 검증 완료, 하위 호환성 유지

- [x] **Phase 10.5: 애니매틱 + 오디오 + 와이어링 (2026-03-13)** — `0ac10f2`
  - 신규: `generate_animatic.py` — 스토리보드 PNG + VO + SRT → 타이밍 프리뷰 MP4
  - 신규: `annotate_manifest_stages.py` — 24샷 narrative_stage 어노테이션 (HOOK/FURY/MESS/INSIGHT)
  - 신규: `generate_placeholder_audio.py` — BGM 4개 + SFX 4개 플레이스홀더 WAV
  - 수정: `audio_catalog.py` + `validate_catalog()` 누락 파일 감지
  - 수정: `package_for_youtube.py` + `--simple-audio` 폴백 (에셋 부재 시 자동 전환)
  - 수정: `video_assembler.py` 버그 3건 (인풋 인덱스, asplit, aformat) — assemble_narrative_audio 처음으로 E2E 통과
  - 애니매틱 프리뷰: `EP01_ANIMATIC.mp4` (150s, h264+AAC) 생성 확인

## 1차 렌더 핵심 문제 — 확정

### 문제 A: I2V가 얼굴만 나옴
- **원인**: `generate_t2i_storyboards.py` 미실행 → Kontext가 골든 레퍼런스(1024x1024 얼굴 포트레이트)로 폴백 → I2V가 얼굴 클로즈업에서 영상 시작
- **실행된 것**: [T2I 스킵] → Kontext(얼굴 1024x1024) → I2V = 전부 얼굴
- **정상 흐름**: T2I(832x480 장면) → Kontext(캐릭터 보정) → I2V(장면 영상)

### 문제 B: TTS 성우 퀄리티
- **현재**: edge-tts (`en-US-AriaNeural`) — 합성 느낌, 감정 표현 없음
- **추천 1순위**: **Chatterbox** — ElevenLabs 블라인드 테스트 승리, 감정 제어(0-2), 한/영, 5초 음성 클론, 무료 MIT, `/home/hugh/chatterbox/` 이미 존재
- **추천 2순위**: **Kokoro-82M** — CPU 0.3초, 드래프트용, 무료 Apache
- **추천 3순위**: **Fish Speech v1.5** — TTS Arena ELO 1위, 한영일, `/home/hugh/fishspeech_env/` 존재

---

## 다음 단계 — 2차 렌더 파이프라인

### Phase 10A: TTS 업그레이드 (Chatterbox)
```bash
# 1. Chatterbox 백엔드 추가
# tts_backends/chatterbox_backend.py 작성
# 2. Vee/Bee/Narrator 레퍼런스 음성 5-10초 선정
# 3. TTS 재생성
python generate_tts_from_prepro.py \
  --prepro ep01/prepro_manifest.json \
  --tts-backend chatterbox --tts-fallback edge \
  --output-dir ep01/tts_full_v2
```

### Phase 10B: T2I 스토리보드 렌더 (~48분)
```bash
# ComfyUI 서버 실행 확인 후
python generate_t2i_storyboards.py \
  --manifest ep01_shot_manifest.json \
  --output-dir output/renders/ep01_storyboards \
  --comfy-input /home/hugh/ComfyUI/app/input \
  --guidance 3.5 --update-manifest
```

### Phase 10C: 애니매틱 리뷰 (I2V 전 검증)
```bash
python generate_animatic.py \
  --manifest ep01_shot_manifest.json \
  --storyboard-dir output/renders/ep01_storyboards \
  --voiceover ep01/tts_full_v2/voiceover_master.wav \
  --subtitles ep01/tts_full_v2/subtitles.srt \
  --output EP01_ANIMATIC_v2.mp4
# → 리뷰 → 문제 샷 리시드 → OK면 Phase 11
```

### Phase 11: Kontext 캐릭터 보정 (시트콤 15샷만)
```bash
python generate_kontext_keyframes.py \
  --manifest ep01_shot_manifest.json \
  --storyboard-dir output/renders/ep01_storyboards \
  --output-dir output/renders/ep01_keyframes_v2 \
  --comfy-input /home/hugh/ComfyUI/app/input \
  --guidance 2.5
```

### Phase 12: I2V 렌더 2차 (24샷, 832x480 16:9)
```bash
python comfy_batch_render.py \
  --manifest ep01_shot_manifest.json \
  --workflow wan22_moe_i2v_full.json \
  --bindings wan22_moe_i2v_bindings.json \
  --output-dir output/renders/ep01_i2v_v2
```

### Phase 13: 최종 조립 2차 (narrative audio 풀 파이프라인)
```bash
python package_for_youtube.py \
  --manifest ep01_shot_manifest.json \
  --render-dir output/renders/ep01_i2v_v2 \
  --voiceover ep01/tts_full_v2/voiceover_master.wav \
  --subtitles \
  --transition fade --transition-duration 1.0 \
  --output EP01_FINAL_v2.mp4
# narrative_stage + 오디오 에셋 → 풀 BGM act-switching + SFX + 덕킹
```

## 전제 조건 (2차 렌더)
- ComfyUI 서버 실행 (localhost:8188)
- GPU 사용 가능 (RTX 5070 Ti)
- Chatterbox 환경 활성화 (`/home/hugh/chatterbox/`)
- Flux Dev T2I 워크플로우 + 바인딩 JSON (존재 확인 완료)
- Vee golden reference: `systems/video/assets/characters/vee/ivy_burr_golden_ref.png`
- WAN 2.2 MoE I2V 워크플로우 + 바인딩 JSON (832x480 수정 완료)
- 참고: `systems/video/planning/05-storyboard-keyframe-pipeline.md`
