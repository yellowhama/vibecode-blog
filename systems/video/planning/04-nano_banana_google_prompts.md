# 비디오 프롬프트 세트: Nano Banana & Google Video용

사용자님이 미드저니 대신 **Nano Banana(보통 이미지 생성 및 모션/디테일 컨트롤에 강점)**와 **Google Video (Veo/V3/Opal 등)**를 사용하여 바로 영상을 뽑아보실 수 있도록, 앞서 기획한 `Skeptical Claymation x Whiteboard Flow` (로봇 메타포) 스토리보드의 첫 두 씬에 대한 실전 프롬프트를 작성했습니다.

## 🌟 공통 팁 (Nano Banana & Google Video)
- 이 툴들은 미드저니보다 문맥(Context)과 움직임(Motion)을 더 잘 이해합니다.
- 특히 찰흙 애니메이션(스톱모션) 텍스처를 명확히 주도록 **"stop-motion claymation, highly textured clay"** 키워드를 영상 프롬프트에도 꼭 넣어야 합니다.
- **가장 큰 문제(텍스트 및 대화 환각):** 영상 모델들은 빈 공간에 뜬금없이 글자를 띄우거나 캐릭터 입을 뻐끔거리게 만듭니다. 이를 막기 위해 **"CRITICAL: NO TEXT, NO LETTERS, NO SPEECH BUBBLES. The character is completely silent, mouth closed, nonverbal, nonlingual, no speaking"** 이라는 문장을 프롬프트 끝에 무조건 박아두어야 합니다.
- 나노바나나나 구글 툴에 이미지를 먼저 생성한 뒤(txt2img), 그 이미지를 기반으로 영상(img2vid)을 뽑는 것이 찰흙의 질감을 일관되게 유지하는 최고의 방법입니다.

---

### 🎬 Scene 1. "함정 (The Trap)" 

> **나레이션 (Timing Reference ONLY):** "The first time I opened Claude Code... Instead of showing me code, it made the files directly. Wait. I don't have to copy-paste? I tried it. It worked. 'I can build anything with this.' That thought was the trap."
> **예상 소요 시간:** 약 8~10초

**1. 초기 이미지 생성 프롬프트 (Shot 1.1 Real World - Desk Setup)**
> **Prompt:** `Close up shot. Minimalist stop-motion claymation, Aardman studio style. A highly textured clay figure representing a sleep-deprived programmer. The figure has chubby and stubby proportions, wearing a large oversized thick muted cocoa brown hoodie (#2D1D19) and bright Musu Yellow (#FFD166) skin. The figure is sitting at a simple white clay desk, typing on a white clay computer keyboard and drinking from a white clay coffee mug. Soft matte studio lighting. CRITICAL: NO TEXT, NO LETTERS, NO SPEECH BUBBLES. The character is completely silent, mouth closed, no speaking, nonverbal, nonlingual, no lip-sync.`

**2. 비디오 생성 모션 프롬프트 (Shot 1.2 & 1.3 Inside Screen)**
*화면 안으로 들어간 프레임을 모션으로 만듭니다.*
> **Prompt:** `Stop-motion claymation. Inside a vast, empty Off-White solid background. The brown clay avatar figure stands still. Suddenly, a bright Musu Yellow (#FFD166) piece of clay drops from the top of the screen to the floor right next to the figure. The yellow clay piece instantly morphs and molds itself into a small, cute caterpillar tread. The brown clay figure looks down at it in mild surprise. CRITICAL: NO TEXT, NO LETTERS, NO SPEECH BUBBLES. The character is completely silent, mouth closed, no speaking, nonverbal, nonlingual, no lip-sync.`

---

### 🎬 Scene 3. "분노 (Fury-Driven Development)"

> **나레이션 (Timing Reference ONLY):** "So what did I do? I got pissed. KVM switch. Half-assed. Remote Desktop. Slow and choppy. Five apps running at once just to get 'barely okay.' Nothing worked the way I wanted."
> **예상 소요 시간:** 약 10~12초

**1. 연속 씬 비디오 생성 모션 프롬프트 (Shot 3.1 & 3.2 Real World Slapstick)**
*책상 앞 현실의 캐릭터가 분노하는 슬랩스틱 모션을 생성합니다.*
> **Prompt:** `Medium shot. Slapstick comedy stop-motion claymation style. The chubby clay character with the oversized hoodie is sitting at the white clay desk. The character is extremely frustrated. The character's face turns bright red, and the top of its head pops open like a tea kettle, blowing out thick white clay steam. The panicked character grabs the white clay coffee mug from the desk and chugs it, but the brown coffee comically sprays out of the steam holes in its head and ears. Soft matte studio lighting. CRITICAL: NO TEXT, NO LETTERS, NO SPEECH BUBBLES. The character is completely silent, mouth closed, no speaking, nonverbal, nonlingual, no lip-sync.`

---

### 🎨 Scene 4: "짜증이 스펙이 되다 (The Spec)"

> **나레이션 (Timing Reference ONLY):** "I got pissed. Asked questions. Fought. Organized. And the spec was already there."
> **예상 소요 시간:** 약 5~7초

**1. 연속 씬 비디오 생성 모션 프롬프트 (Google Video / Nano Banana img2vid)**
*이전 커피를 뿜는 슬랩스틱 프레임을 레퍼런스로 사용합니다.*
> **Prompt:** `[CONTINUITY PROMPT: Use the last frame of the previous shot as the First Frame Image Reference] Stop-motion claymation style. The frantic motion freezes. The white clay steam and the sprayed coffee droplets floating in the air suddenly mold and assemble themselves together, magically transforming into a perfectly flat, faintly glowing white clay tablet representing a spec document. The character's skin color returns to normal Musu Yellow, looking calm, and it firmly grabs the glowing clay tablet. Soft matte studio lighting. CRITICAL: NO TEXT, NO LETTERS, NO SPEECH BUBBLES. The character is completely silent, mouth closed, no speaking, nonverbal, nonlingual, no lip-sync.`

---

### 🎥 다음 스텝 가이드
1. 위 프롬프트 중 **Scene 1의 "초기 이미지 생성 프롬프트"**를 나노 바나나나 구글(Imagen3 등)에 복사해 넣고 주인공의 고정 기준 샷을 뽑아보세요.
2. 잘 뽑힌 이미지를 **"비디오 생성 모션 프롬프트"**와 함께 비디오 모델(Google Veo/Opal 등)에 넣어보세요! 노란 찰흙 덩어리가 떨어지는 **약 8~10초 길이**의 찰흙 애니메이션을 생성해야 합니다 (필요시 여러 번 끊어서 잇기).

이 결과물이 잘 나오면 남은 Scene 3~7도 이 규칙대로 프롬프트를 쫙 뽑아내겠습니다!
