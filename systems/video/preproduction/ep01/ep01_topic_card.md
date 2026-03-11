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

## 다음 단계
- [ ] **Phase 6: 키프레임 생성** — ComfyUI + Flux Kontext (sitcom 15샷) + T2I (explainer 9샷)
  ```bash
  python systems/video/pipeline/scripts/generate_kontext_keyframes.py \
    --manifest systems/video/preproduction/ep01/ep01_shot_manifest.json \
    --golden-ref systems/video/assets/characters/vee/ivy_burr_golden_ref.png \
    --output-dir systems/video/output/renders/ep01_keyframes
  ```
- [ ] **Phase 7: I2V 렌더** — WAN 2.2 MoE i2v, ~24샷 × 2분 ≈ 48분
  ```bash
  python systems/video/pipeline/scripts/comfy_batch_render.py \
    --manifest systems/video/preproduction/ep01/ep01_shot_manifest.json \
    --workflow systems/video/workflows/api/wan22_moe_i2v_full.json \
    --bindings systems/video/workflows/api/wan22_moe_i2v_bindings.json \
    --output-dir systems/video/output/renders/ep01_$(date +%Y%m%d_%H%M%S)
  ```
- [ ] **Phase 8: QA + 최종 조립** — Vision QA → finalize_video_v2.py → EP01_FINAL.mp4

## 전제 조건 (Phase 6-8)
- ComfyUI 서버 실행 (localhost:8188)
- GPU 사용 가능 (RTX 5070 Ti)
- Vee golden reference: `systems/video/assets/characters/vee/ivy_burr_golden_ref.png`
- WAN 2.2 MoE 워크플로우 + 바인딩 JSON 확인
