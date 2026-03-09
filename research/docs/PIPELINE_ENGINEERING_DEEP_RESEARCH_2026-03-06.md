# 파이프라인 엔지니어링 고도화 딥리서치 (2026-03-06)

> SaaS/유료 도구 없음. 전부 코드로 만드는 패턴.

---

## 1. DAG 파이프라인 오케스트레이션

현재: 스크립트 체인 (`run_blog_to_video_pipeline.py` → 하위 스크립트 호출)
문제: 의존성 해결 수동, 병렬 실행 없음, 재시도 없음, 캐시 없음

### 1.1 경량 DAG 실행기 (SQLite 상태 추적)

핵심 원리: 위상 정렬 + 병렬 실행기 + SQLite 상태 저장 + 출력 해시 캐시.

```python
@dataclass
class Task:
    name: str
    fn: Callable
    deps: List[str]          # 의존 태스크 이름
    outputs: List[Path]       # 출력 파일 (캐시 판별용)
    retry_max: int = 3

class DAGPipeline:
    def __init__(self, db_path=".pipeline_state.db"):
        # SQLite에 task_name, status, output_hash, error 저장
        # WAL 모드로 동시 읽기/쓰기 안전

    def _topological_sort(self) -> List[List[str]]:
        # 같은 레벨의 태스크는 병렬 실행 가능

    def _is_cached(self, task) -> bool:
        # 출력 파일 MD5 해시가 이전 실행과 같으면 스킵

    async def run(self, force=False):
        levels = self._topological_sort()
        for level in levels:
            await asyncio.gather(*[self._run_task(t) for t in level])
```

**적용 예시** — 현재 영상 파이프라인:

```
Level 0: [build_prepro]              — 병렬 불가 (단일 입력)
Level 1: [build_shot_manifest, generate_tts]  — 병렬 실행 가능!
Level 2: [audio_postprocess]         — TTS 완료 후
Level 3: [sync_keyframes, comfy_batch_render] — 매니페스트 완료 후
Level 4: [evaluate_renders]
Level 5: [package_for_youtube]
```

Level 1에서 TTS와 매니페스트 생성이 **동시에** 돌아감. 현재는 순차 실행.

### 1.2 추천 라이브러리

| 라이브러리 | 특징 | 적합도 |
|-----------|------|--------|
| **doit/pydoit** | 파일 기반 의존성 추적, MD5/타임스탬프 자동 증분 빌드, `doit -n 4` 병렬 | ★★★★★ |
| pipefunc | 함수 어노테이션으로 의존성 자동 추출 | ★★★★ |
| burr | 루프/조건 분기 지원 (DAG 아닌 그래프), AI 워크플로에 최적 | ★★★★ |

**doit 패턴** (가장 실용적):

```python
# dodo.py
def task_build_prepro():
    return {
        "file_dep": ["content/blog/phase1/act1-ko.md"],
        "targets": ["output/prepro.json"],
        "actions": [(build_prepro, ["content/blog/phase1/act1-ko.md"])],
    }

def task_generate_tts():
    return {
        "file_dep": ["output/prepro.json"],
        "targets": ["output/tts_final.wav"],
        "actions": [(generate_tts,)],
    }

def task_build_manifest():
    return {
        "file_dep": ["output/prepro.json"],
        "targets": ["output/shot_manifest.json"],
        "actions": [(build_manifest,)],
    }
# 실행: doit          — 변경된 것만 실행
# 실행: doit -n 4     — 4 워커 병렬
# 실행: doit forget    — 캐시 클리어, 전체 재실행
```

---

## 2. 이벤트 기반 자동 트리거

### 2.1 파일 감시 → 파이프라인 자동 실행

```python
# watchdog + asyncio 브릿지
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class ContentChangeHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if Path(event.src_path).suffix in {".md", ".json"}:
            # asyncio 이벤트 루프에 안전하게 전달
            loop.call_soon_threadsafe(queue.put_nowait, {"path": event.src_path})
```

**적용**: `content/blog/phase1/` 감시 → 마크다운 변경 시 → 자동으로 영상 프리프로 재생성.

### 2.2 Git Hook 트리거

```bash
# .git/hooks/post-commit
CHANGED=$(git diff --name-only HEAD~1 HEAD -- 'content/**/*.md')
if [ -n "$CHANGED" ]; then
    echo "$CHANGED" | python scripts/queue_content_jobs.py --stdin
fi
```

커밋할 때마다 변경된 콘텐츠 파일 → SQLite 작업 큐에 자동 등록.

### 2.3 GitHub Actions 고급 패턴

**동적 매트릭스 빌드** — 변경된 파일만 처리:

```yaml
jobs:
  detect-changes:
    outputs:
      matrix: ${{ steps.set-matrix.outputs.matrix }}
    steps:
      - id: set-matrix
        run: |
          FILES=$(git diff --name-only HEAD~1 HEAD -- 'content/**/*.md' \
                  | jq -R . | jq -sc .)
          echo "matrix={\"file\":$FILES}" >> $GITHUB_OUTPUT

  process-content:
    needs: detect-changes
    strategy:
      matrix: ${{ fromJson(needs.detect-changes.outputs.matrix) }}
      max-parallel: 4
    steps:
      - run: python scripts/process_content.py "${{ matrix.file }}"
```

**워크플로 체이닝** — `workflow_run`:

```yaml
# 콘텐츠 파이프라인 완료 → 분석 수집 트리거
on:
  workflow_run:
    workflows: ["Content Pipeline"]
    types: [completed]
```

주의: 최대 체인 깊이 3레벨. 기본 브랜치에 워크플로 파일 있어야 트리거됨.

---

## 3. 콘텐츠 상태 머신

현재: 큐 JSON의 `status` 필드 (draft/approved/posted)
개선: 정형화된 상태 머신 + 전이 이력 + 롤백

```python
from statemachine import State, StateMachine

class ContentLifecycle(StateMachine):
    draft     = State(initial=True)
    review    = State()
    approved  = State()
    published = State()
    archived  = State(final=True)

    submit   = draft.to(review)
    approve  = review.to(approved)
    reject   = review.to(draft)           # 리젝 → 초안으로 복귀
    publish  = approved.to(published)
    withdraw = published.to(draft)        # 게시 취소 → 초안으로 롤백
    archive  = published.to(archived)

    def on_enter_published(self):
        # Vercel 빌드 트리거, URL 로그 기록 등 부수효과
        self._persist()

    def _persist(self):
        # tmp 파일 쓰기 → rename (POSIX 원자적 쓰기)
        tmp = self._state_file.with_suffix(".tmp")
        tmp.write_text(json.dumps(state_data))
        tmp.replace(self._state_file)
```

**핵심**: `Path.replace()`는 POSIX에서 원자적. 파일 상태가 중간에 깨지지 않음. DB 없이 트랜잭션 보장.

---

## 4. 증분 렌더링 + 캐시

현재: 매번 전체 재렌더
개선: 입력이 안 바뀐 샷은 스킵

### 4.1 콘텐츠 주소 기반 캐시

```python
def compute_job_hash(prompt, model, seed, workflow_version) -> str:
    payload = json.dumps({"prompt": prompt, "model": model,
                          "seed": seed, "wf": workflow_version}, sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()

def get_or_render(job, cache_dir="./cache"):
    job_hash = compute_job_hash(**job)
    cache_path = f"{cache_dir}/{job_hash}.mp4"
    if os.path.exists(cache_path):
        return cache_path       # 캐시 히트 → 렌더 스킵
    result = render(job)
    os.rename(result, cache_path)
    return cache_path
```

### 4.2 매니페스트 디핑

```python
def get_dirty_shots(old_manifest, new_manifest) -> list[str]:
    """입력이 바뀐 샷 ID만 반환"""
    dirty = []
    for shot_id, new_entry in new_manifest.items():
        old_entry = old_manifest.get(shot_id)
        if old_entry is None or old_entry["hash"] != new_entry["hash"]:
            dirty.append(shot_id)
    return dirty
```

Act1 Scene1-2가 이미 렌더 완료된 상태에서 Scene3 프롬프트만 수정하면 → Scene3만 렌더. **기존 Scene1-2는 캐시에서 재사용**.

---

## 5. GPU 인식 렌더 큐

현재: 렌더 작업을 순차 실행
개선: GPU 가용성 확인 후 자동 디스패치

```python
def get_available_gpu(min_free_mb=4096, max_utilization=20):
    """nvidia-smi 폴링 → 가장 여유로운 GPU 선택"""
    result = subprocess.run([
        "nvidia-smi", "--query-gpu=index,memory.free,utilization.gpu",
        "--format=csv,noheader,nounits"
    ], capture_output=True, text=True)
    # 메모리 여유 + 활용률 낮은 GPU 반환

class RenderQueue:
    """SQLite 기반 우선순위 큐 + GPU 스케줄링"""
    def claim_next(self):
        gpu = get_available_gpu()
        if not gpu: return None
        # UPDATE ... WHERE id = (SELECT ... LIMIT 1) RETURNING
        # → 원자적 작업 클레임 (락 불필요)

    async def worker_loop(self, poll_interval=5.0):
        while True:
            job = self.claim_next()
            if job:
                await self._render(job_id, payload, gpu_idx)
            else:
                await asyncio.sleep(poll_interval)
```

멀티 GPU 시: 각 GPU에 `CUDA_VISIBLE_DEVICES` 설정 후 병렬 렌더.

---

## 6. ComfyUI 배치 최적화

### 6.1 현재 vs 개선

| 현재 | 개선 |
|------|------|
| 순차 프롬프트 제출 | 큐 깊이 모니터링 + 멀티 인스턴스 로드밸런싱 |
| 매번 모델 로드 | 워크플로 캐시 (바뀐 노드만 재실행) |
| 수동 시드 관리 | `seed + job_index` 자동 변형 |

### 6.2 멀티 인스턴스 패턴

```python
INSTANCES = ["localhost:8188", "localhost:8189"]  # GPU 0, GPU 1

async def dispatch(workflow):
    # 각 인스턴스의 GET /queue로 큐 깊이 확인
    # 가장 짧은 큐에 POST /prompt 제출
```

### 6.3 성능 개선 팁

- xFormers attention: 15-25% 속도 향상
- PyTorch 2.0 compile: 10-20% 향상
- `--gpu-only` 플래그: CPU 오프로딩 비활성화 → 비디오 생성 시 지연 감소
- `control_after_generate: "fixed"`: 시드 고정으로 재현성 보장

---

## 7. T2I → I2V 일관성 기법

### 7.1 Temporal Bridge 패턴

```
Shot N 렌더 → 마지막 프레임 추출 → Shot N+1의 조건 이미지로 사용
```

시각적 "체인 오브 커스터디" — 모델 파인튜닝 없이 샷 간 일관성 확보.

### 7.2 IP-Adapter 캐릭터 고정

```json
{
  "IPAdapterApply": {
    "inputs": {
      "image": ["character_master_sheet", 0],
      "weight": 0.6    // 0.5-0.7이 경험적 스윗스팟
    }
  }
}
```

모든 샷에서 동일 캐릭터 참조 이미지 → IP-Adapter가 cross-attention 레이어에 외형 주입.

### 7.3 프롬프트 일관성 규칙

- **불변 문자열 고정**: 캐릭터 설명을 모든 샷에서 동일하게 반복 (패러프레이즈 금지)
- **정체성 vs 액션 분리**: `[IDENTITY_STRING], [ACTION], [SCENE], [LIGHTING]`
- **카메라/조명 고정**: 같은 씬 내에서 카메라 설명 통일

---

## 8. FFmpeg 자동화 패턴

### 8.1 xfade 트랜지션 (클립 연결)

```bash
ffmpeg -i clip1.mp4 -i clip2.mp4 -i clip3.mp4 \
  -filter_complex "
    [0:v][1:v]xfade=transition=fade:duration=0.5:offset=7.5[v01];
    [v01][2:v]xfade=transition=fade:duration=0.5:offset=15.0[vout]
  " -map "[vout]" -c:v libx264 -crf 18 output.mp4
```

50+ 클립일 때: `-filter_complex_script` 파일로 셸 인자 길이 제한 회피.

### 8.2 NVENC 하드웨어 인코딩

```bash
ffmpeg -hwaccel cuda -hwaccel_output_format cuda -i input.mp4 \
  -c:v h264_nvenc -preset p6 -tune hq -cq 20 output.mp4
```

CPU 인코딩 대비 40-60% 처리량 증가.

### 8.3 영상 QA 자동화

```python
def quality_gate(video_path):
    results = {"pass": True, "issues": []}

    # 블랙 프레임 감지
    blacks = detect_black_frames(video_path)  # ffmpeg blackdetect 파싱
    if blacks:
        results["issues"].append(f"Black frames: {blacks}")
        results["pass"] = False

    # 무음 감지
    silences = detect_silence(video_path)     # ffmpeg silencedetect 파싱
    if any(s["duration"] > 3.0 for s in silences):
        results["pass"] = False

    # VMAF 품질 점수 (참조 영상 있을 때)
    vmaf = get_vmaf_score(video_path, reference_path)
    if vmaf < 85:
        results["pass"] = False

    return results
```

---

## 9. TTS 최적화

### 9.1 문장 분할 전략

TTS 모델은 긴 문장에서 운율이 깨짐. 의미 경계에서 분할:

```python
def smart_split(text, max_chars=200):
    boundaries = [
        r'(?<=[.!?])\s+',    # 문장 끝
        r'(?<=[;:])\s+',     # 절 경계
        r'(?<=[,])\s+',      # 구 경계
    ]
    for pattern in boundaries:
        parts = re.split(pattern, text)
        if all(len(p) <= max_chars for p in parts):
            return parts
    return split_at_space(text, max_chars)
```

### 9.2 EBU R128 2-pass 정규화

```bash
# Pass 1: 측정
ffmpeg -i input.wav -af loudnorm=I=-16:TP=-1:print_format=json -f null -

# Pass 2: 측정값으로 정규화
ffmpeg -i input.wav \
  -af "loudnorm=I=-16:TP=-1:measured_I=-18.3:measured_TP=-2.1:linear=true" \
  normalized.wav
```

### 9.3 세그먼트 크로스페이드

TTS 세그먼트 연결 시 20-50ms 크로스페이드로 스플라이스 아티팩트 제거:

```bash
ffmpeg -i seg1.wav -i seg2.wav \
  -filter_complex "[0:a][1:a]acrossfade=d=0.03:c1=exp:c2=exp[aout]" \
  -map "[aout]" output.wav
```

문장 간 300ms 무음 삽입 (오디오북 프로덕션 표준).

---

## 10. 피드백 루프 시스템

### 10.1 성과 스코어링

```python
def engagement_score(impressions, likes, replies, retweets, bookmarks, posted_at):
    weights = {"likes": 1.0, "replies": 2.5, "retweets": 2.0, "bookmarks": 3.0}
    raw = sum(weights[k] * v for k, v in metrics.items())
    rate = raw / max(impressions, 1)
    age_hours = (now - posted_at).total_seconds() / 3600
    return (rate * 1000) / (age_hours + 2) ** 1.5    # HN 스타일 시간 감쇠
```

### 10.2 Thompson Sampling (포스팅 시간 최적화)

SaaS 없는 A/B 테스트. 각 시간대를 Beta 분포로 모델링:

```python
class ThompsonBandit:
    def select(self):
        # 각 시간대의 Beta(alpha, beta) 분포에서 샘플링
        # 가장 높은 샘플 값의 시간대 선택
        samples = {name: np.random.beta(arm.alpha, arm.beta)
                   for name, arm in self.arms.items()}
        return max(samples, key=samples.get)

    def update(self, arm_name, reward: bool):
        # 성공(engagement 있음) → alpha += 1
        # 실패(engagement 없음) → beta += 1

# 포스팅 시간 최적화
scheduler = ThompsonBandit(arms=["09:00", "12:00", "17:00", "20:00"])
best_time = scheduler.select()        # 베이지안 최적 시간
scheduler.update("17:00", reward=True)  # 성과 피드백
```

### 10.3 에버그린 콘텐츠 감지

```python
def classify_content(daily_views):
    peak = max(daily_views)
    mean = np.mean(daily_views)
    slope = linregress(range(len(daily_views)), daily_views).slope

    if (peak / mean) > 3.0 and slope < -0.05:
        return "viral"          # 스파이크 후 급락
    elif (peak / mean) <= 3.0 and slope > -0.05:
        return "evergreen"      # 완만하게 유지
    else:
        return "declining"      # 꾸준히 하락
```

에버그린 → 60일 간격으로 재활용 큐에 자동 등록.
바이럴 → 365일 후 1회만 재활용.
하락 → 재활용 안 함.

### 10.4 폐쇄 루프 아키텍처

```
[포스트 발행]
      ↓
[성과 수집] ← Plausible API / Twitter 아카이브 / Vercel Analytics
      ↓
[스코어링 + 분류] ← engagement_score(), classify_content()
      ↓
[SQLite 저장] → content_pieces + performance + llm_evaluations
      ↓
[그래프 업데이트] → 토픽 노드 + 공동출현 엣지 + PageRank
      ↓
[캘린더 최적화] → 다양성 점수, 피로도, 히트맵 최적 시간
      ↓
[생성 요청] → build_context_prompt() → Claude → evaluate_content()
      ↓
[Thompson Bandit] → 시간대/포맷 선택 → 스케줄
      ↓
[포스트 발행] → (루프)
```

**모든 상태는 SQLite**. 외부 의존성 = Claude API + 자체 분석 데이터.

---

## 11. LLM-as-Judge 콘텐츠 품질 게이트

### 11.1 G-Eval 패턴

```python
RUBRIC = """
1-5점 채점:
- HOOK_STRENGTH: 첫 줄이 계속 읽게 만드나?
- CLARITY: 핵심 아이디어가 즉시 이해되나?
- VALUE_DENSITY: 단어당 정보 밀도?
- AUDIENCE_FIT: 타겟 독자(기술 빌더)에 맞나?
- BRAND_VOICE: voice.md 톤 규칙 준수?
"""

def evaluate_content(post_text):
    response = client.messages.create(
        model="claude-opus-4-6",
        messages=[{"role": "user", "content": f"{post_text}\n\n{RUBRIC}"}]
    )
    return json.loads(response.content[0].text)
```

### 11.2 앵커 캘리브레이션

평가 드리프트 방지: 알려진 점수의 참조 포스트 3-5개를 프롬프트에 포함.

```python
ANCHORS = [
    {"post": "짜증이 스펙이 된다...", "scores": {"hook": 5, "overall": 5}},
    {"post": "AI에 대한 제 생각은...", "scores": {"hook": 1, "overall": 2}},
]
# 프롬프트에 앵커 포함 → 일관된 채점 기준 유지
```

---

## 12. 콘텐츠 지식 그래프

### 12.1 토픽 갭 분석

```python
def topic_gap_analysis(G, candidate_topics):
    for topic in candidate_topics:
        pr = nx.pagerank(G).get(topic, 0)          # 그래프 중요도
        post_count = G.nodes[topic].get("count", 0)  # 기존 포스트 수
        opportunity = pr / max(post_count, 1)        # 높은 중요도 + 낮은 커버리지 = 갭
    return sorted(results, key=lambda x: x["opportunity"], reverse=True)
```

### 12.2 의미적 엣지 자동 감지

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")  # 로컬, API 없음

def add_semantic_edges(G, threshold=0.7):
    topics = list(G.nodes())
    embeddings = model.encode(topics, normalize_embeddings=True)
    sim_matrix = np.dot(embeddings, embeddings.T)
    # 유사도 > threshold인 토픽 쌍에 엣지 추가
```

명시적 공동출현 없이도 의미적으로 관련된 토픽을 자동 연결.

---

## 13. 분석 수집 (무료)

| 소스 | 방법 | 비용 |
|------|------|------|
| **Vercel Analytics** | 이미 설치됨. CSV 내보내기 or Drains (자체 HTTP 엔드포인트로 스트리밍) | $0 |
| **Plausible** (자체호스팅) | Docker, REST API로 페이지별 방문자/체류시간/이탈률 조회 | $0 |
| **Twitter 아카이브** | Settings > Download archive → `tweets.js` 파싱 (engagement 포함) | $0 |
| **YouTube Studio** | CSV 내보내기 → 파이썬으로 인제스트 | $0 |

---

## 14. 적용 우선순위

### Phase 1: 증분 렌더링 (즉시 효과)

| 작업 | 효과 |
|------|------|
| 매니페스트 디핑 + SHA256 캐시 | Scene1-2 재렌더 방지. 시간 50%+ 절감 |
| doit 도입 (또는 자체 DAG) | 의존성 자동 해결 + 병렬 실행 |

### Phase 2: 자동 트리거

| 작업 | 효과 |
|------|------|
| watchdog 파일 감시 | 마크다운 수정 → 자동 프리프로 재생성 |
| GitHub Actions 동적 매트릭스 | 변경된 파일만 처리 |

### Phase 3: 피드백 루프

| 작업 | 효과 |
|------|------|
| SQLite 성과 저장소 | 모든 콘텐츠 성과 중앙 추적 |
| Thompson Sampling 시간 최적화 | 데이터 기반 포스팅 시간 수렴 |
| 에버그린 감지 + 재활용 큐 | 콘텐츠 수명 연장 |

### Phase 4: 품질 루프

| 작업 | 효과 |
|------|------|
| LLM-as-Judge 자동 평가 | 발행 전 품질 게이트 |
| 폐쇄 루프 프롬프트 | 성과 데이터 → 다음 생성에 반영 |
| 토픽 갭 분석 | "다음에 뭘 쓸지" 데이터 기반 결정 |

---

## 15. 필요 라이브러리 (전부 pip, 전부 무료)

| 용도 | 라이브러리 |
|------|-----------|
| DAG 실행 | `doit` 또는 자체 asyncio |
| 파일 감시 | `watchdog` |
| 상태 머신 | `python-statemachine` |
| GPU 상태 | `GPUtil` 또는 `nvidia-smi` subprocess |
| 태스크 큐 | `huey[sqlite]` 또는 자체 SQLite 큐 |
| 시계열/통계 | `pandas`, `numpy`, `scipy` |
| 임베딩 | `sentence-transformers` (all-MiniLM-L6-v2) |
| 그래프 | `networkx` |
| TTS 후처리 | `pydub`, `ffmpeg` |
| LLM 평가 | `anthropic` SDK |

---

## 부록: 참고 소스

### 파이프라인 아키텍처
- doit: pydoit.org
- pipefunc: github.com/pipefunc/pipefunc
- burr: burr.dagworks.io
- watchdog: github.com/gorakhargosh/watchdog
- python-statemachine: python-statemachine.readthedocs.io
- Huey: github.com/coleifer/huey
- simple_gpu_scheduler: github.com/ExpectationMax/simple_gpu_scheduler

### 영상 파이프라인
- ComfyUI API: github.com/comfyanonymous/ComfyUI/blob/master/script_examples/
- ComfyUI-Distributed: github.com/robertvoy/ComfyUI-Distributed
- ComfyUI-ParallelAnything: github.com/FearL0rd/ComfyUI-ParallelAnything
- Temporal Bridge: arxiv.org/html/2512.16954v1
- FasterCache: github.com/Vchitect/FasterCache
- ffmpeg-quality-metrics: github.com/slhck/ffmpeg-quality-metrics
- ffmpeg-normalize: github.com/slhck/ffmpeg-normalize

### 피드백 루프
- Thompson Sampling: peterroelants.github.io/posts/multi-armed-bandit-implementation/
- HN 랭킹 알고리즘: sangaline.com/post/reverse-engineering-the-hacker-news-ranking-algorithm/
- G-Eval: confident-ai.com/blog/g-eval-the-definitive-guide
- Plausible API: plausible.io/docs/stats-api
- Vercel Drains: infoq.com/news/2025/10/vercel-drains-observability/
