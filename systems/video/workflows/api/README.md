# Wan 2.2 GGUF MoE — API Workflow Templates

2026-03-10 동작 확인 완료. RTX 5070 Ti (16GB VRAM) 기준.

## 워크플로우 3종

| 파일 | 용도 | 해상도 | 프레임 | 소요시간 |
|------|------|--------|--------|----------|
| `wan22_moe_t2i.json` | 이미지 생성 (캐릭터시트, 컨셉아트) | 1024x1024 | 1 | ~3분 |
| `wan22_moe_i2v_short.json` | 짧은 영상 (앵글전환, 모션테스트) | 768x768 | 33 (2초) | ~5분 |
| `wan22_moe_i2v_full.json` | 프로덕션 영상 (본편 샷) | 768x768 | 81 (5초) | ~12분 |

## 바인딩 2종

| 파일 | 대상 |
|------|------|
| `wan22_moe_t2i_bindings.json` | T2I 워크플로우 |
| `wan22_moe_i2v_bindings.json` | I2V 워크플로우 (short/full 공용) |

## MoE 구조 (공통)

```
UnetLoaderGGUF(HighNoise) → ModelSamplingSD3(shift=8)
                                    ↓
                            KSamplerAdvanced (Stage 1: 구조 잡기)
                                    ↓
UnetLoaderGGUF(LowNoise) → ModelSamplingSD3(shift=8)
                                    ↓
                            KSamplerAdvanced (Stage 2: 디테일 다듬기)
                                    ↓
                              VAEDecode → SaveImage
```

### T2I 세팅 (이미지용)
- sampler: `uni_pc`, scheduler: `beta`
- 35 steps (Stage1: 0→8, Stage2: 8→35)
- cfg: Stage1=2.5, Stage2=3.5

### I2V 세팅 (영상용)
- sampler: `euler`, scheduler: `simple`
- 20 steps (Stage1: 0→10, Stage2: 10→20)
- cfg: 3.5 (양 stage 동일)

## 프레임 수 참고 (16fps)

| frames | 초 | 용도 |
|--------|-----|------|
| 17 | 1초 | 스틸 추출 |
| 33 | 2초 | 앵글 전환 |
| 49 | 3초 | 짧은 액션 |
| 65 | 4초 | 중간 샷 |
| 81 | 5초 | 표준 샷 |

## 모델 경로

```
ComfyUI/app/models/unet/
├── HighNoise/Wan2.2-I2V-A14B-HighNoise-Q3_K_M.gguf  (6.7GB)
├── LowNoise/Wan2.2-I2V-A14B-LowNoise-Q3_K_M.gguf   (6.7GB)
└── Wan2.2-Animate-14B-Q3_K_M.gguf                    (8.1GB)
```

## 주의사항

- `ModelSamplingSD3`에 `width`/`height` 넣으면 에러남. `shift`만 넣을 것.
- `VHS_VideoCombine` 노드 없으면 `SaveImage`로 대체 (PNG 시퀀스로 출력).
- I2V 입력 이미지는 `ComfyUI/app/input/` 폴더에 있어야 함.
