# Wan Animate Preprocessor 가이드

> **Date**: 2026-03-20
> **소스**: YouTube (cPN7lS1l2g0), Wan 2.2 + Vace 2.2 공식 가이드

---

## 1. 개요

Wan Animate Preprocessor = Wan 2.2 전용 모션 추출 프레임워크.
레퍼런스 비디오의 모션을 캐릭터에 자연스럽게 전이.

**vs DW OpenPose**: 범용 스켈레톤 → Wan 네이티브 스켈레톤 (조명/깊이 이해)
**vs Mimic Motion**: 안정적이지만 환경 블렌딩 약함 → Wan Animate는 리라이팅 포함

---

## 2. 핵심 차별점

### Skeletal Adaptive Binding (핵심 기능)
- DW OpenPose: 키 큰 사람 모션 → 작은 캐릭터에 적용하면 **스파게티 팔다리**
- Wan Animate: 체형 차이를 지능적으로 리타겟팅 → **자연스러운 모션**

### 표정 + 립싱크
- 미세 표정 (눈, 입 마이크로 무브먼트) 캡처
- 캐릭터가 단순히 움직이는 게 아니라 **연기**하는 느낌

### 보조 리라이팅
- 전처리 단계에서 리라이팅 LoRA 적용
- 캐릭터가 배경 조명에 맞춰 자연스럽게 변함
- "비디오에 붙은 캐릭터" vs "**비디오 안에 사는 캐릭터**"

---

## 3. 설치

### 커스텀 노드
```bash
cd ComfyUI/custom_nodes
git clone [wan-animate-preprocessor repo URL]

# 의존성 설치 (portable 버전)
python_embeded/python.exe -m pip install -r requirements.txt
```

### 필요 모델 (ComfyUI/models/detection/)
| 모델 | 용도 |
|------|------|
| `vitpose-l-wholebody.onnx` | 스켈레톤 트래킹 (정확도 최고) |
| `yolov10m.pt` | 인물/객체 디텍션 |

---

## 4. 5개 노드 구조

### 1. ONNX Detection Model Loader
- vitpose + yolo 모델 로드
- CUDA 설정 (NVIDIA GPU)

### 2. Pose and Face Detection (핵심)
- **input_images**: 소스 드라이빙 비디오
- **retarget_images**: 애니메이션할 캐릭터 이미지
- **face_padding**: 큰 머리/헤어 캐릭터는 값 높이기
- 출력: pose_data, face_data, keyframes_body_points

### 3. Draw VIT Poses (시각화)
- 스켈레톤 시각화
- retarget_padding: 마진 조절
- 출력: pose_image (스틱 피겨)

### 4. Pose Detection 1-to-All Animation
- **Animation 모드** 전용 — 1장 레퍼런스 → 전체 시퀀스
- align_to: reference image 또는 source video 크기 기준
- Vace 2.2와 함께 사용

### 5. Pose Retarget Prompt Helper
- 스켈레톤 → 텍스트 변환 ("arms raised", "person running")
- 프롬프트에 연결하면 모션 안정성 ↑
- 스켈레톤 데이터 + 언어 이해 = 더 안정적 생성

---

## 5. 노드 비교

| 노드 | 용도 | 특성 |
|------|------|------|
| DW OpenPose | 범용 스켈레톤 | 모든 ControlNet 호환, 조명/깊이 이해 ❌ |
| Pose & Face Detection | 캐릭터 교체 | 리타겟팅 + 표정 데이터 |
| 1-to-All Animation | 유체 캐릭터 애니메이션 | 올인원 패키지, Vace 2.2 연동 |

---

## 6. 우리 파이프라인 적용 계획

### 현재 I2V 파이프라인
```
키프레임 (Flux T2I) → Wan 2.2 I2V (animate_shots.py) → RIFE 32fps
```

### Wan Animate 적용 시
```
키프레임 (Flux T2I)
  + 레퍼런스 모션 비디오
    → Wan Animate Preprocess (스켈레톤 + 표정 추출)
      → Wan 2.2 I2V (캐릭터 교체 모드)
        → RIFE 32fps
```

### 적합한 용도
- Vee 캐릭터 리액션 샷 (표정 + 몸동작)
- 코딩 장면 (타이핑 모션 레퍼런스 비디오 + Vee 이미지)
- 설명 장면 (제스처 레퍼런스 + Vee)

### 필요 작업
1. `vitpose-l-wholebody.onnx` + `yolov10m.pt` 다운로드
2. Wan Animate Preprocessor 커스텀 노드 설치
3. 레퍼런스 모션 비디오 라이브러리 구축
4. `animate_shots.py`에 Wan Animate 모드 추가

---

## 7. 소스

- [YouTube: How to use wanAnimatePreprocess in ComfyUI](https://www.youtube.com/watch?v=cPN7lS1l2g0)
- Wan 2.2 & Vace 2.2 공식 가이드
