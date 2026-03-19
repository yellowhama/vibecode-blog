# Wan 2.6 Migration Evaluation

> 평가일: 2026-03-19
> 현재 모델: Wan 2.2 I2V-14B MoE GGUF (Q5_K_M) + Lightning LoRA
> 목적: Wan 2.6 전환 가능 여부 판단 및 마이그레이션 계획 수립

---

## Wan 2.6 핵심 이점 (vs 2.2)

| 기능 | Wan 2.2 | Wan 2.6 |
|------|---------|---------|
| 영상 길이 | 5초 (81프레임@16fps) | **최대 15초** (240프레임) |
| 멀티샷 | 불가 (단일 샷) | **자동 씬 전환** |
| 캐릭터 레퍼런스 | 외부 (PuLID/Kontext) | **내장 (Character ID)** |
| 립싱크 | 외부 (Rhubarb) | **내장** |
| 오디오 반응 | 없음 | **오디오 드리븐 모션** |
| 해상도 | 832x480 | 최대 1280x720 |
| FPS | 16 (RIFE로 32) | **네이티브 24-30** |

## 전환 필수 조건 (모두 충족 시 전환)

### 1. GGUF 양자화 모델 존재 여부

- [ ] `bullerwins/Wan2.6-*-GGUF` 또는 유사 레포 확인
- [ ] Q5_K_M 이상 양자화 필요 (Q3은 품질 저하)
- 확인 방법: `huggingface-cli search "Wan2.6 GGUF"`

**판정**: ⬜ 미확인

### 2. 16GB VRAM 실행 가능 여부

- RTX 5070 Ti 16GB 기준
- Wan 2.2 14B Q5_K_M = ~10.8GB/모델 (offload로 동작)
- Wan 2.6 모델 크기 확인 필요

**판정**: ⬜ 미확인

### 3. ComfyUI 워크플로 호환성

- [ ] Kijai WanVideoWrapper 2.6 지원 여부
- [ ] `WanImageToVideo` 노드가 2.6과 호환되는지
- [ ] 새로운 노드(CharacterID, LipSync) 필요 여부

**판정**: ⬜ 미확인

### 4. 2D Flat Vector 스타일 보존

- v3ct0r LoRA가 2.6에서도 동작하는지
- Lightning LoRA 2.6 버전 존재 여부
- 2D 스타일 프롬프트 유효성

**판정**: ⬜ 미확인

### 5. 파이프라인 스크립트 수정 범위

- `animate_shots.py`: 워크플로 교체만으로 충분한지
- 매니페스트 포맷 변경 필요 여부
- 바인딩 JSON 호환성

**예상**: 워크플로 + 바인딩 교체만으로 가능할 것 (animate_shots.py는 워크플로 agnostic)

---

## 판단 매트릭스

| 조건 | 미충족 시 | 충족 시 |
|------|----------|---------|
| GGUF 미존재 | ❌ Wan 2.2 유지 | ✅ 다음 조건 확인 |
| 16GB VRAM 불가 | ❌ Wan 2.2 유지 | ✅ 다음 조건 확인 |
| ComfyUI 미지원 | ❌ Wan 2.2 유지 | ✅ 다음 조건 확인 |
| 2D 스타일 미보존 | ❌ Wan 2.2 유지 (스타일이 생명선) | ✅ 전환 시작 |
| **모두 충족** | | **→ PoC 워크플로 1개 제작** |

---

## 전환 계획 (조건 충족 시)

### Phase A: PoC (1일)

1. Q5_K_M GGUF 다운로드
2. 기존 wan22 워크플로 복사 → wan26 워크플로 생성
3. H01 샷 동일 키프레임으로 A/B 비교
4. 품질/속도/스타일 평가

### Phase B: 파이프라인 통합 (2일)

1. `wan26_moe_i2v_optimized.json` + 바인딩 생성
2. `animate_shots.py --workflow wan26_...` 테스트
3. EP02 전체 렌더 with Wan 2.6

### Phase C: 고급 기능 (1주)

1. Character ID 활용 (PuLID 대체)
2. 내장 립싱크 → Rhubarb 대체
3. 15초 롱샷 → 멀티샷 편집 도구

---

## Wan 2.2 최적화 현황 (전환 전까지 사용)

| 최적화 | 상태 | 효과 |
|--------|------|------|
| Q3→Q5 모델 업그레이드 | ❌ Q5 미존재 | HF에 Q5_K_M GGUF 없음, Q3 유지 |
| Lightning LoRA (8 steps) | ✅ 설치 | 20→8 steps (60% 감소) |
| FBCache (WaveSpeed) | ✅ 설치 | ~30-40% 추가 속도↑ |
| RIFE 프레임 보간 | ✅ 설치 | 16→32fps |
| Timeout 3600초 | ✅ 적용 | 렌더 중단 방지 |

**목표**: 50분/샷 → 10-15분/샷

---

## 리서치 명령어

```bash
# Wan 2.6 GGUF 검색
huggingface-cli search "Wan2.6 GGUF"

# Kijai 지원 확인
# https://github.com/kijai/ComfyUI-WanVideoWrapper 릴리즈 노트

# 커뮤니티 벤치마크 확인
# Reddit r/StableDiffusion, r/comfyui 검색: "Wan 2.6 GGUF 16GB"
```

---

## 결론

현 시점(2026-03-19) Wan 2.6은 아직 GGUF 양자화 및 ComfyUI 호환성 확인이 필요.
**당분간 Wan 2.2 + Lightning + FBCache + RIFE 최적화 스택을 사용하고**,
Wan 2.6 GGUF가 나오면 즉시 PoC를 진행한다.
