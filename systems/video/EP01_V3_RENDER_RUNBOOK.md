# EP01 v3 Render Runbook

> **목적**: EP01의 비주얼 품질을 C+ → B+ 이상으로 올린다.
> **변화**: Ken Burns 100% → 혼합 렌더 (6 I2V Vee + 1 Motion Canvas 다이어그램 + ~25 Ken Burns)
> **예상 GPU 시간**: ~2시간 (RTX 5070 Ti 16GB)

---

## 전제 조건

- [ ] EP01 v6 스크립트 검증 완료 (`validate_screenplay.py → 0 FAIL`)
- [ ] ComfyUI 서버 실행 (`http://127.0.0.1:8188`)
- [ ] 모델 로드:
  - Flux.1-dev GGUF Q5 (~12GB)
  - PuLID v0.9.1 (`pulid_flux_v0.9.1.safetensors`)
  - SimpleVectorFlux LoRA (`Simple_Vector_Flux_v2_renderartist.safetensors`)
  - Wan 2.2 MoE I2V 14B GGUF Q5 (HighNoise + LowNoise)
- [ ] Motion Canvas 빌드 환경 (`vibecode-diagrams/` → `npm install`)
- [ ] 골든 레퍼런스: `assets/characters/vee/golden/vee_2d_golden_front.png`
- [ ] Chatterbox TTS 환경 (또는 기존 TTS 재사용)

---

## STAGE 0: 대본 확정 + 매니페스트 재생성

```bash
cd /mnt/e/vibecode-blog/systems/video/pipeline/scripts

# 대본 검증
python validate_screenplay.py \
  /mnt/e/vibecode-blog/systems/video/preproduction/ep01/ep01_script_v6.fountain \
  --report /mnt/e/vibecode-blog/systems/video/output/ep01/ep01_v6_validation.md
# → 0 FAIL 확인

# Prepro manifest 재생성
python parse_fountain_to_prepro.py \
  --input /mnt/e/vibecode-blog/systems/video/preproduction/ep01/ep01_script_v6.fountain \
  --output /mnt/e/vibecode-blog/systems/video/preproduction/ep01/ep01_prepro_manifest_v9.json \
  --project-id ep01 --language en

# Shot manifest 재생성
python build_shot_manifest_from_prepro.py \
  --prepro /mnt/e/vibecode-blog/systems/video/preproduction/ep01/ep01_prepro_manifest_v9.json \
  --output /mnt/e/vibecode-blog/systems/video/preproduction/ep01/ep01_shot_manifest_v9.json
```

---

## STAGE 1: TTS 생성 (또는 기존 재사용)

v6 스크립트가 v5와 나레이션 텍스트가 다르므로 TTS 재생성 필요.

```bash
python generate_tts_from_prepro.py \
  --prepro-manifest /mnt/e/vibecode-blog/systems/video/preproduction/ep01/ep01_prepro_manifest_v9.json \
  --tts-backend chatterbox --tts-fallback edge \
  --out-audio /mnt/e/vibecode-blog/systems/video/preproduction/ep01/tts_full_v9/voiceover_master.wav \
  --sample-rate 48000 --gap-sec 0.15 --device cuda

python qa_checkpoint.py --stage "TTS Audio v9" \
  --artifacts-dir /mnt/e/vibecode-blog/systems/video/preproduction/ep01/tts_full_v9 \
  --artifact-type audio
```

---

## STAGE 2: Motion Canvas 다이어그램 렌더

```bash
cd /mnt/e/vibecode-blog/vibecode-diagrams

# 의존성 설치 (최초 1회)
npm install

# ep01-explainer 씬 렌더
npx motion-canvas render --scene ep01-explainer \
  --output /mnt/e/vibecode-blog/systems/video/output/ep01/clips_diagram/

# 결과 확인
ls -la /mnt/e/vibecode-blog/systems/video/output/ep01/clips_diagram/*.mp4
```

**예상 결과**: `ep01-explainer.mp4` — 건물 메타포 다이어그램, ~15-20초
**품질 체크**: 다크 배경 (#0D1B2A), 주황(chaos)/시안(spec) 색조, v3ct0r 스타일

**트러블슈팅**:
- `npx motion-canvas render` 미작동 시: `npx @motion-canvas/core render` 시도
- Scene import 에러 시: `src/project.ts`에서 `ep01-explainer` import 확인
- Chromium 미설치 시: `npx playwright install chromium`

---

## STAGE 3: PuLID 캐릭터 키프레임 (Vee 반응 6샷)

```bash
cd /mnt/e/vibecode-blog/systems/video/pipeline/scripts

python generate_t2i_storyboards.py \
  --manifest /mnt/e/vibecode-blog/systems/video/preproduction/ep01/ep01_shot_manifest_v9.json \
  --output-dir /mnt/e/vibecode-blog/systems/video/output/ep01/keyframes_v3/ \
  --comfy-input /home/hugh/ComfyUI/app/input \
  --pulid-ref vee_2d_golden_front.png \
  --pulid-weight 0.9 \
  --guidance 3.5 \
  --update-manifest

python qa_checkpoint.py --stage "PuLID Keyframes v3" \
  --artifacts-dir /mnt/e/vibecode-blog/systems/video/output/ep01/keyframes_v3 \
  --artifact-type image
```

**대상**: `vee_reaction` 태그가 있는 6-7 샷
**품질 체크**: Vee 안경/후디/머리 일관성, v3ct0r flat vector 스타일, 16:9 비율

---

## STAGE 4: Wan 2.2 I2V 애니메이션 (6샷)

```bash
python animate_shots.py \
  --manifest /mnt/e/vibecode-blog/systems/video/preproduction/ep01/ep01_shot_manifest_v9.json \
  --keyframes /mnt/e/vibecode-blog/systems/video/output/ep01/keyframes_v3/ \
  --output /mnt/e/vibecode-blog/systems/video/output/ep01/clips_i2v_v3/ \
  --comfyui-url http://127.0.0.1:8188

python qa_checkpoint.py --stage "I2V Animation v3" \
  --artifacts-dir /mnt/e/vibecode-blog/systems/video/output/ep01/clips_i2v_v3 \
  --artifact-type video
```

**예상**: 6 MP4 클립, 각 5초, 832x480, Wan 2.2 MoE
**품질 체크**: 모션이 자연스러운지 (static zoom/pan 아닌 실제 움직임), 캐릭터 보존

---

## STAGE 5: 하이브리드 어셈블리

```bash
python assemble_episode.py --episode 01 --from-stage 6

# 또는 수동 FFmpeg 어셈블리:
python ffmpeg_assemble.py \
  --manifest /mnt/e/vibecode-blog/systems/video/preproduction/ep01/ep01_shot_manifest_v9.json \
  --clips-dir /mnt/e/vibecode-blog/systems/video/output/ep01/ \
  --voiceover /mnt/e/vibecode-blog/systems/video/preproduction/ep01/tts_full_v9/voiceover_master.wav \
  --output /mnt/e/vibecode-blog/systems/video/output/ep01/final/EP01_v6_FINAL.mp4
```

**클립 우선순위** (ffmpeg_assemble.py):
1. `clips_i2v_v3/` — Wan 2.2 I2V 애니메이션 (Vee 반응 6샷)
2. `clips_diagram/` — Motion Canvas 다이어그램 (CORE 1+클립)
3. `keyframes_v3/` → Ken Burns fallback (나머지 ~25샷)

---

## STAGE 6: 최종 QA

```bash
python qa_checkpoint.py --stage "EP01 v6 Final Assembly" \
  --artifacts-dir /mnt/e/vibecode-blog/systems/video/output/ep01/final \
  --artifact-type video
```

**체크리스트**:
- [ ] 전체 재생: 끊김 없이 6:30 재생
- [ ] Motion Canvas 클립: CORE 세그먼트에 건물 메타포 다이어그램 등장
- [ ] PuLID Vee: 6개 반응 샷에서 캐릭터 일관성 (안경, 후디, 비율)
- [ ] I2V 모션: 반응 샷에 실제 움직임 (static 아님)
- [ ] 오디오 싱크: 나레이션과 비주얼 타이밍 일치
- [ ] Ken Burns 잔여: 나머지 샷은 부드러운 zoom/pan

---

## 예상 결과 비교

| 항목 | v4 (현재) | v6 (목표) |
|------|----------|----------|
| Vee 반응 | Ken Burns (정적) | I2V 애니메이션 (모션) |
| 다이어그램 | Ken Burns (정적) | Motion Canvas (동적) |
| 캐릭터 일관성 | 불일치 | PuLID 골든 레퍼런스 |
| 총 길이 | 6:03 | ~6:30 |
| 실제 애니메이션 비율 | 0% | ~20% (7/32 클립) |
