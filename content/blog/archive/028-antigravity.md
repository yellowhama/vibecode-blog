# 028 Google Antigravity

---

# Google Antigravity의 '모델 선택권' - 진짜 열려있나, 가짜 개방인가?

## 구글 IDE 켰는데 Claude가 있었다

"어... 이거 진짜야?"

어제 Antigravity를 처음 켜고 모델 드롭다운을 열었을 때 든 생각이다. Gemini 3 Pro만 있을 줄 알았는데 Claude Sonnet 4.5, GPT-OSS까지 떡하니 자리 잡고 있었다.

구글이 갑자기 마음이 넓어진 걸까? 이 질문이 Antigravity의 본질을 정확히 찌른다.

2025년 11월 18일, 구글은 Windsurf 팀을 24억 달러에 인수한 후 만든 Antigravity를 공개했다. VS Code 기반의 이 IDE는 Gemini 3 Pro뿐만 아니라 타사 모델들도 선택할 수 있게 설계되어 있다.

## "모델이 뇌라면, IDE는 신경계다"

한 개발자가 Gemini에게 직접 물었다: "Antigravity의 멀티모달 능력이 모델에 달린 거야? IDE에 달린 거야?"

Gemini의 답변:

**"모델(Gemini)이 뇌이고, IDE(Antigravity)가 눈과 신경망 역할을 하는 합작품입니다."**

IDE는 화면 스크린샷, DOM 트리, 에러 로그를 하나의 패키지로 묶어서 모델에게 전달한다. 모델은 이를 해석해서 "버튼이 왼쪽으로 쏠렸네" + "CSS margin 수정 필요"를 연결한다.

그런데 여기서 핵심:

**"이 던져주는 방식이 Gemini에게 최적화되어 있습니다. 다른 모델은 그걸 받아먹을 수 없는 상태가 됩니다."**

구글은 'Gemini 2.5 Computer Use 모델'과 'Nano Banana' 같은 자사 전용 모델들을 긴밀하게 통합시켰다. 타사 모델? 문은 열어뒀지만 열쇠는 안 준 격이다.

## 구글의 진짜 의도

Gemini가 직접 밝힌 구글의 전략:

**"구글이 Antigravity를 만든 이유는 'Gemini가 코딩에 짱이다'라는 것을 보여주기 위해서입니다."**

왜냐고? Karpathy가 'vibe coding'을 처음 소개할 때 쓴 도구가 "Cursor Composer with Sonnet"이었다. Cursor + Claude 조합이 개발자들 사이에서 압도적 지지를 받고 있었다.

구글의 대응:

- 겉으로는 "우리도 개방적이야"
- 실제로는 "Gemini만 100% 성능 발휘"
- **"안티그래비티는 제미나이라는 엔진을 위해 특수 제작된 차체"** (Gemini의 표현)

## 초기 사용자들이 겪은 현실

DEVCLASS 테스트: "Agent taking unexpectedly long to load", "model provider overload" 에러 연발.

VentureBeat: "초기 사용자들이 에러와 느린 생성 속도를 지적".

멀티모달-IDE 통합 구조가 Gemini 전용으로 최적화되어 있다 보니, 타사 모델은 구조적으로 같은 레벨의 입력을 받지 못한다.

**"같은 화면을 봐도 Gemini는 '버튼이 3px 왼쪽으로 치우쳤다'고 정확히 짚고, Claude는 '뭔가 이상한 것 같다' 수준으로 뭉뚱그린다."** (Gemini의 설명)

## Punta: 바이브 코딩 시대, IDE가 모델보다 중요해졌다

2025년 3월, Y Combinator W25 배치의 25%가 95% 이상 AI 생성 코드를 사용한다. 이제 문제는 "어떤 IDE와 어떤 모델 조합"이냐다.

Gemini가 ChatGPT와 Antigravity의 차이를 설명한다:

"ChatGPT에 화면 캡처해서 업로드하면 고쳐주긴 합니다. 하지만 수동적이고 느립니다. Antigravity는 코드 수정 → 프리뷰 렌더링 → 상태 캡처 → 모델 주입을 실시간 자동화했습니다."

**타사 모델도 '들어오게는 해주지만', 핵심 데이터를 100% 받아먹는 건 Gemini뿐이다.**

## 결론

Antigravity는 보안 제한사항과 데이터 유출 위험을 명시하고 있고, 무료지만 5시간마다 리셋되는 rate limits가 있다.

하지만 진짜 중요한 건 이거다:

**Antigravity에서 타사 모델을 선택할 수 있다면, 그건 선택권이 있는 것이다. 다만 성능이 Gemini만큼 나오지 않는다는 건 다른 문제다. 타사 모델도 쓸 수 있지만, IDE의 고급 기능들은 Gemini에 최적화되어 있다.**

**구글은 문을 열어두면서, 그 문 뒤의 방은 Gemini 전용으로 꾸며뒀다.**

Chrome이 모든 웹 표준을 지원한다고 하지만, 구글 서비스는 Chrome에서 가장 잘 돌아가는 것처럼

이게 Gemini가 직접 인정한 내용이다.

---

### 참고자료

- The New Stack: "Antigravity Is Google's New Agentic Development Platform" (2025.11.19)
- VentureBeat: "Google Antigravity introduces agent-first architecture" (2025.11.18)
- Google Blog: "Gemini 3: Introducing the latest Gemini AI model" (2025.11.18)
- Wikipedia: "Vibe coding" - Andrej Karpathy (2025.2.6)
- DEVCLASS: "We take a look at Google's Antigravity" (2025.11.19)
- Gemini와의 대화: "Antigravity의 멀티모달 능력 분석" (2025.11.20)