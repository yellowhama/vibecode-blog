# 비디오 애니메이션 컨셉 및 레퍼런스 기획안

블로그의 브랜드 가이드(`BRAND.md`, `visual.md`)에 명시된 **"세팅이 90%다", "새벽 3시 디버깅의 분노", "가짜 AI 강사에 대한 환멸", "막걸리에 새우깡 같은 날것의 톤"**을 시각적으로 가장 잘 표현할 수 있는 4가지 애니메이션 스타일을 제안합니다.

---

## Concept 1: "Skeptical Claymation" (브랜드 UI 톤앤매너 직결)
현재 블로그 UI인 **Soft Neobrutalism + Claymation 감성**을 영상으로 바로 가져오는 컨셉. 너무 귀엽기보다는 직장인/개발자의 피곤함이 묻어나는 스톱모션 스타일입니다.

- **비주얼 DNA (Visual DNA):** 수작업으로 빚은 듯 삐뚤하면서도 질감이 생생한 찰흙 애니메이션(Aardman Studio 스타일 느낌). 완벽하지 않고(에러가 늘 나는 코드처럼) 엉성한 매력.
- **색상 팔레트:** `Cocoa Brown(#2D1D19)`, `Musu Yellow(#FFD166)`, `Off-White` 등 블로그 메인 컬러톤 적극 활용.
- **캐릭터 무드:** 동그랗고 귀엽지만 눈 밑에 다크서클이 내려온 피곤한 캐릭터. 늘 모니터 앞에서 어이없는 표정을 짓고 있음.
- **프롬프트 키워드 예시:** 
  > *Aardman style claymation animation screencap, a tired programmer looking at a glowing monitor, soft neobrutalism style, handmade clay texture, matte lighting, cocoa brown and muted yellow color palette, skeptical expression.*

---

## Concept 2: "Lo-Fi Night Debugging" (90년대 레트로 아니메 스타일)
코더들이 가장 심리적으로 편안해하는 **Lo-fi / 90s Anime 감성**. '새벽에 끝없는 오류와 싸우는 프로그래머'의 감성을 가장 분위기 있게 전달합니다.

- **비주얼 DNA (Visual DNA):** 90년대 셀 애니메이션 텍스처(빛바랜 색감, 약간의 노이즈). Lofi-girl과 톤이 비슷하지만 훨씬 현실적이고 고뇌(?)가 있는 느낌. 
- **색상 팔레트:** 어두운 밤하늘 색상(Night Owl 테마 기반) + 얼굴을 비추는 모니터의 쨍한 노란 불빛의 대비.
- **캐릭터 무드:** 라면 그릇이 쌓여있는 책상, 한숨을 쉬며 커피를 들이켜는 장면 등 현실적인 소품들. 
- **프롬프트 키워드 예시:** 
  > *90s retro anime style, lo-fi aesthetic, late night coding, a programmer frustrated in front of a computer, glowing monitor light on face, highly detailed messy desk, dark blue and soft neon colors, cel anime shading.*

---

## Concept 3: "Rough Comic Sketch" (블랙코미디 / 밈 최적화)
복잡한 배경과 렌더링을 완전히 빼고, **인물의 황당한 표정과 자막(메시지)에 100% 집중**하는 스케치 2D 애니메이션입니다. '가짜 AI 강사'를 까고 삽질의 분노를 표현하는 1막/2막 구성에 엄청난 타격감을 줍니다.

- **비주얼 DNA (Visual DNA):** xkcd나 Cyanide & Happiness처럼 대충 볼펜/마커로 쓱쓱 그린 듯한 심플한 선화와 평면 구성. 
- **색상 팔레트:** 기본 흰 배경에 검은 선, 그리고 에러가 날 때만 튀어나오는 시뻘건 빨간색(Red) 포인트.
- **캐릭터 무드:** 감정이 극도로 과장됨 (동공 지진, 폭발하는 표정, 허탈하게 웃는 표정 등).
- **프롬프트 키워드 예시:** 
  > *Minimalist webcomic style, rough ink sketch, 2D flat animation, extremely simple background, a programmer making an angry and frustrated face, thick outlines, expressive cartoon style.*

---

## Concept 4: "Terminal Glitch Art" (코드 중심 / 사이버 펑크)
캐릭터의 얼굴보다는 **화면, 키보드, 타건하는 손, 오류 메시지가 터지는 모니터** 등 코딩 자체의 시각적 요소에 집중하는 감각적인 컨셉입니다.

- **비주얼 DNA (Visual DNA):** 에디터 화면(Ray.so 스타일)과 실제 방의 경계가 모호한 연출. 버그가 날 때 화면에 글리치(지직거림) 노이즈가 발생.
- **색상 팔레트:** 어두운 터미널 배경 + 텍스트 하이라이트(형광 초록, 노랑).
- **캐릭터 무드:** 얼굴이 직접 나오기보단 뒷모습, 어깨 너머(Over-the-shoulder), 타이핑하는 손 등의 파편화된 앵글 중심.
- **프롬프트 키워드 예시:** 
  > *Cinematic over-the-shoulder shot of a programmer typing, glowing colorful code on screen, dark terminal aesthetic, subtle cyberpunk vibe, glitch art effects, moody lighting.*

---

### 💬 사용자 피드백 요청
1. 위 4가지 컨셉 중 가장 끌리는 **방향성(1~4번)**이 있으신가요? (혹은 두 개를 섞는 것도 좋습니다)
2. 방향이 정해지면, 제가 이 시각적 룰(Visual DNA)을 `.agents/skills/video_pipeline/SKILL.md` 안에 프롬프트 가이드로 완전히 고정(하드코딩)시켜서, 앞으로 어떤 글을 영상으로 만들든 **늘 똑같은 작화와 분위기가 나오도록 세팅**해두겠습니다.
