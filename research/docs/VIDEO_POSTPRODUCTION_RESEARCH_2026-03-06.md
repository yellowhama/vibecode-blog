# 영상 후반작업 자동화 딥리서치 (2026-03-06)

## 문제 정의
현재 파이프라인은 **개별 샷(3~8초 클립)을 하드컷으로 이어붙이기만** 함.
풀 영상이 아니라 조각 모음. 빠진 것:
1. 샷 간 트랜지션 (xfade)
2. 시각적 일관성 (색감/스타일)
3. 인트로/아웃트로
4. 자막 (한/영)
5. 오디오 덕킹 (BGM vs VO)
6. 품질 자동 검증

---

## 1. 트랜지션 — FFmpeg xfade

### 핵심
- FFmpeg `xfade` 필터: **44종 내장 트랜지션** (fade, wipeleft, dissolve, circleopen, smoothleft, diagtl 등)
- duration 파라미터로 전환 시간 조절 (0.5~1.5초 권장)
- **N개 클립 체인**: complex filter graph로 단일 ffmpeg 호출

### 체인 패턴 (N 클립)
```
[0:v][1:v]xfade=transition=fade:duration=1:offset=4[v01];
[v01][2:v]xfade=transition=smoothleft:duration=1:offset=8[v02];
...
```
- `offset` = 이전 클립 누적 시간 - transition duration

### 커스텀 이징
- **xfade-easing** 프로젝트: cubic, elastic, bounce 등 커스텀 easing 표현식
- FFmpeg expr 문법으로 직접 삽입 가능

### 구현 방향
```python
def build_xfade_chain(clips: list[dict], transition="fade", duration=1.0) -> str:
    """클립 리스트 → FFmpeg xfade complex filter graph 생성"""
    parts = []
    offset = clips[0]["duration"] - duration
    prev = "[0:v]"
    for i in range(1, len(clips)):
        out = f"[v{i:03d}]" if i < len(clips) - 1 else "[vout]"
        parts.append(f"{prev}[{i}:v]xfade=transition={transition}:duration={duration}:offset={offset}{out}")
        offset += clips[i]["duration"] - duration
        prev = out
    return ";".join(parts)
```

---

## 2. 시각적 일관성

### A. 색감 매칭 — color-matcher
- **라이브러리**: `pip install color-matcher` (MIT, $0)
- Reinhard, MKL, PDF 알고리즘 지원
- 기준 프레임(첫 샷 또는 스타일 레퍼런스) → 모든 샷에 적용
- **적용 시점**: 렌더 후, 합본 전

```python
from color_matcher import ColorMatcher
cm = ColorMatcher()
result = cm.transfer(src=target_frame, ref=reference_frame, method='mkl')
```

### B. AI 스타일 잠금 — IP-Adapter (ComfyUI)
- IP-Adapter: 레퍼런스 이미지에서 스타일 추출 → 생성 시 주입
- **weight 0.7~0.9** 권장 (너무 높으면 구도 고정)
- **Temporal Bridge 패턴**: 샷 N 마지막 프레임 추출 → 샷 N+1 레퍼런스로 사용
  - 연속성 극대화, 하드컷 느낌 제거

### C. 실용적 조합
1. ComfyUI 렌더 시 IP-Adapter로 스타일 잠금 (생성 단계)
2. 렌더 후 color-matcher로 색감 정규화 (후처리 단계)
3. FFmpeg xfade로 트랜지션 (합본 단계)

---

## 3. 인트로/아웃트로

### A. FFmpeg drawtext (간단)
```bash
ffmpeg -i video.mp4 -vf "
  drawtext=text='vibecode.town':fontfile=font.ttf:fontsize=72:
  fontcolor=white:x=(w-tw)/2:y=(h-th)/2:
  enable='between(t,0,3)':alpha='if(lt(t,1),t,if(gt(t,2),3-t,1))'
" output.mp4
```
- 페이드인/아웃 알파 애니메이션
- 추가 의존성 없음

### B. Remotion (복잡한 모션그래픽)
- React 기반 프레임 단위 영상 렌더링 (`npx remotion render`)
- 복잡한 애니메이션, 데이터 기반 영상 가능
- **권장**: 인트로 템플릿 하나 만들어두고 파라미터만 변경

### C. 권장 전략
- **v1**: FFmpeg drawtext로 텍스트 오버레이 (즉시 구현 가능)
- **v2**: Remotion 템플릿 (Act별 제목 + 에피소드 번호 동적 생성)

---

## 4. 자막 자동화

### A. 강제 정렬 (Forced Alignment)
- **문제**: TTS 텍스트는 이미 존재 → 음성인식(STT) 불필요, **정렬만** 필요
- **stable-ts**: `pip install stable-ts` (MIT)
  - `model.align(audio, text)` → 단어별 타임스탬프
  - faster-whisper 백엔드 지원 (GPU 가속)
  - 한국어/영어 모두 지원

```python
import stable_whisper
model = stable_whisper.load_faster_whisper('base')
result = model.align(audio_path, text, language='ko')
result.to_ass('subtitles.ass')  # 직접 ASS 출력 지원
```

### B. ASS 자막 생성 — pysubs2
- `pip install pysubs2` (MIT)
- 스타일 정의: 폰트, 크기, 색상, 테두리, 그림자
- **카라오케 효과**: `\kf` 태그로 글자별 하이라이트
- **애니메이션**: `\move`, `\fad`, `\t` 태그

```python
import pysubs2
subs = pysubs2.SSAFile()
style = pysubs2.SSAStyle(fontname="Pretendard", fontsize=28,
                          primarycolor=pysubs2.Color(255,255,255),
                          outlinecolor=pysubs2.Color(0,0,0),
                          outline=2, shadow=1)
subs.styles["Default"] = style
# 이벤트 추가 (ms 단위)
subs.events.append(pysubs2.SSAEvent(start=0, end=3000, text="첫 번째 자막"))
subs.save("subtitles.ass")
```

### C. 자막 번인 — FFmpeg ass 필터
```bash
ffmpeg -i video.mp4 -vf "ass=subtitles.ass" -c:v libx264 output.mp4
```

### D. 대안
- **aeneas**: Python, DTW 기반 강제 정렬 (오디오북 특화)
- **Montreal Forced Aligner (MFA)**: 음소 단위 정밀 정렬 (학술용)

---

## 5. 오디오 덕킹 (BGM vs VO)

### FFmpeg sidechaincompress
```bash
ffmpeg -i vo.wav -i bgm.wav -filter_complex \
  "[1:a]asplit=2[bgm1][bgm2]; \
   [bgm1][0:a]sidechaincompress=threshold=0.02:ratio=6:attack=200:release=1000[ducked]; \
   [0:a][ducked]amix=inputs=2:weights=1 0.3[aout]" \
  -map "[aout]" output.wav
```
- VO 있을 때 BGM 자동 볼륨 다운
- threshold/ratio로 덕킹 강도 조절

---

## 6. 품질 자동 검증

### FFmpeg 내장 감지 필터
```bash
# 검은 화면 감지
ffmpeg -i video.mp4 -vf blackdetect=d=0.5:pix_th=0.10 -f null -

# 정지 프레임 감지
ffmpeg -i video.mp4 -vf freezedetect=n=0.003:d=2 -f null -

# 무음 감지
ffmpeg -i video.mp4 -af silencedetect=n=-50dB:d=2 -f null -
```

### 자동화 통합
- 최종 영상에 3가지 검사 실행
- 결과 파싱 → JSON 리포트
- 임계값 초과 시 경고/실패 처리

---

## 7. 풀 어셈블리 참조 아키텍처

### Editly (Node.js, MIT)
- 선언적 JSON으로 영상 조립
- gl-transitions 지원 (WebGL 기반 트랜지션)
- 장점: 구조가 우리 manifest와 유사
- 단점: Node.js 의존, 커스터마이징 제한

### MoneyPrinterTurbo 아키텍처 참조
- faceless YouTube 자동화 오픈소스
- 파이프라인: 스크립트 → TTS → 영상소스 → 자막 → 합본 → 업로드
- 우리 파이프라인과 구조 동일, 참조할 패턴:
  - config 기반 스타일 관리
  - 자막 위치/스타일 프리셋
  - 썸네일 자동 생성 (Pillow)

### YouTube 챕터 마커
- description에 `00:00 Title` 형식으로 자동 삽입
- prepro_manifest.json의 scene/beat 구조에서 자동 생성 가능

---

## 8. 권장 구현 로드맵

### Phase A: 트랜지션 + 합본 (1~2일)
- `video_assembler.py` 신규 — xfade chain builder + concat
- 인트로/아웃트로 drawtext 오버레이
- 기존 `package_for_youtube.py`에서 호출

### Phase B: 자막 파이프라인 (2~3일)
- stable-ts 강제 정렬 → 타임스탬프 JSON
- pysubs2로 ASS 생성 (KO/EN 듀얼)
- FFmpeg ass 필터로 번인

### Phase C: 오디오 마스터링 (1일)
- BGM 선택 + sidechaincompress 덕킹
- 기존 audio_postprocess.py 확장

### Phase D: 시각적 일관성 (2~3일)
- color-matcher 후처리 (렌더 후, 합본 전)
- IP-Adapter Temporal Bridge (ComfyUI 워크플로우 수정)

### Phase E: 품질 게이트 강화 (1일)
- blackdetect/freezedetect/silencedetect 통합
- 썸네일 자동 생성 (Pillow, 대표 프레임 추출)
- YouTube 챕터 마커 자동 생성

### 의존성
```
A (트랜지션) → C (오디오) → E (품질)
B (자막) — 독립 실행 가능
D (시각일관성) — 독립 실행 가능, A 이전 권장
```

### 비용: $0
- 모든 도구 MIT/오픈소스
- stable-ts: GPU 권장 (CPU도 가능)
- color-matcher: CPU only
- FFmpeg: 이미 설치됨

---

## 핵심 도구 요약

| 기능 | 도구 | 라이선스 | 설치 |
|------|------|---------|------|
| 트랜지션 | FFmpeg xfade | LGPL | 설치됨 |
| 이징 | xfade-easing expr | MIT | 코드 삽입 |
| 색감 매칭 | color-matcher | MIT | pip |
| 스타일 잠금 | IP-Adapter (ComfyUI) | Apache 2.0 | ComfyUI 노드 |
| 인트로 | FFmpeg drawtext | LGPL | 설치됨 |
| 인트로 v2 | Remotion | MIT | npx |
| 강제 정렬 | stable-ts | MIT | pip |
| 자막 생성 | pysubs2 | MIT | pip |
| 자막 번인 | FFmpeg ass | LGPL | 설치됨 |
| 오디오 덕킹 | FFmpeg sidechaincompress | LGPL | 설치됨 |
| 품질 검사 | FFmpeg blackdetect 등 | LGPL | 설치됨 |
| 썸네일 | Pillow | MIT | pip |
