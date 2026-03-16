import {makeScene2D, Rect, Txt, Line, Layout, Circle} from '@motion-canvas/2d';
import {createRef, all, sequence, waitFor} from '@motion-canvas/core';

/**
 * EP02: "Twenty-Eight Left Arms" — Core Explainer Scene
 * Extended metaphor: AI loses context → duplicates (28 left arms on a character model)
 */

const EP02 = {
  bg: '#0D1B2A',
  surface: '#1B2838',
  text: '#F8FAFC',
  muted: '#64748B',
  accent1: '#8B5CF6',   // Purple — confusion/duplication
  accent2: '#F59E0B',   // Amber — SSOT/solution
  accent3: '#EF4444',   // Red — error/duplicate
  success: '#7AE582',
};

export default makeScene2D(function* (view) {
  view.fill(EP02.bg);

  // ========== PART 1: "Context Loss" ==========
  const title = createRef<Txt>();
  view.add(
    <Txt ref={title} text="What AI forgets between messages" fontSize={44}
      fontFamily="Space Grotesk" fill={EP02.muted} y={-350} opacity={0} />,
  );
  yield* title().opacity(1, 0.5);

  // Chat bubbles disappearing — context loss visualization
  const bubbles: Rect[] = [];
  const bubbleData = [
    {y: -200, text: '"Make a character model"', delay: 0},
    {y: -120, text: '"Add a left arm"', delay: 0.3},
    {y: -40, text: '"Now add the right arm"', delay: 0.6},
    {y: 40, text: '"Add a left arm"', delay: 0.9},
    {y: 120, text: '"Add a left arm"', delay: 1.2},
  ];

  for (const b of bubbleData) {
    const ref = createRef<Rect>();
    view.add(
      <Rect ref={ref} x={-100} y={b.y} width={400} height={50} radius={25}
        fill={EP02.surface} opacity={0} stroke={EP02.accent1} lineWidth={1}>
        <Txt text={b.text} fontSize={18} fontFamily="JetBrains Mono" fill={EP02.text} />
      </Rect>,
    );
    bubbles.push(ref());
  }

  // Animate bubbles appearing, earlier ones fading (context loss)
  for (let i = 0; i < bubbles.length; i++) {
    yield* bubbles[i].opacity(1, 0.3);
    if (i >= 2) {
      yield* bubbles[i - 2].opacity(0.2, 0.3); // Old messages fade
    }
    yield* waitFor(0.2);
  }

  // Red duplicate markers on repeated arms
  const dupMarker1 = createRef<Txt>();
  const dupMarker2 = createRef<Txt>();
  view.add(
    <Txt ref={dupMarker1} text="⚠ DUPLICATE" fontSize={16} fontFamily="Inter"
      fill={EP02.accent3} fontWeight={700} x={200} y={40} opacity={0} />,
  );
  view.add(
    <Txt ref={dupMarker2} text="⚠ DUPLICATE" fontSize={16} fontFamily="Inter"
      fill={EP02.accent3} fontWeight={700} x={200} y={120} opacity={0} />,
  );
  yield* all(dupMarker1().opacity(1, 0.3), dupMarker2().opacity(1, 0.3));

  yield* waitFor(1);

  // ========== PART 2: "28 Left Arms" — the monster ==========
  yield* all(
    title().opacity(0, 0.3),
    ...bubbles.map(b => b.opacity(0, 0.3)),
    dupMarker1().opacity(0, 0.2),
    dupMarker2().opacity(0, 0.2),
  );

  const monsterTitle = createRef<Txt>();
  view.add(
    <Txt ref={monsterTitle} text="The result: 28 left arms." fontSize={48}
      fontFamily="Space Grotesk" fill={EP02.accent3} y={-300} opacity={0} />,
  );
  yield* monsterTitle().opacity(1, 0.4);

  // Simple stick figure with arms sprouting everywhere
  const body = createRef<Rect>();
  view.add(
    <Rect ref={body} x={0} y={0} width={60} height={120} radius={8}
      fill={EP02.surface} opacity={0} stroke={EP02.text} lineWidth={2} />,
  );
  yield* body().opacity(1, 0.3);

  // Head
  const head = createRef<Circle>();
  view.add(
    <Circle ref={head} x={0} y={-80} width={50} height={50}
      fill={EP02.surface} opacity={0} stroke={EP02.text} lineWidth={2} />,
  );
  yield* head().opacity(1, 0.2);

  // Arms sprouting — each one is a Line
  const armAngles = [-170, -150, -130, -110, -90, -70, -50, -30, -10, 10, 30, 50];
  const arms: Line[] = [];

  for (let i = 0; i < armAngles.length; i++) {
    const angle = (armAngles[i] * Math.PI) / 180;
    const len = 60 + Math.random() * 30;
    const ref = createRef<Line>();
    view.add(
      <Line ref={ref}
        points={[[-30, -20], [-30 + Math.cos(angle) * len, -20 + Math.sin(angle) * len]]}
        stroke={EP02.accent3} lineWidth={3} end={0} />,
    );
    arms.push(ref());
  }

  // Arms sprout one by one, faster and faster
  for (let i = 0; i < arms.length; i++) {
    const speed = Math.max(0.05, 0.2 - i * 0.015);
    yield* arms[i].end(1, speed);
  }

  // Counter
  const counter = createRef<Txt>();
  view.add(
    <Txt ref={counter} text="×28" fontSize={72} fontFamily="Space Grotesk"
      fill={EP02.accent3} fontWeight={700} x={200} y={0} opacity={0} scale={0.5} />,
  );
  yield* all(counter().opacity(1, 0.3), counter().scale(1, 0.3));

  yield* waitFor(1);

  // ========== PART 3: "SSOT — The Fix" ==========
  yield* all(
    monsterTitle().opacity(0, 0.3),
    body().opacity(0, 0.3),
    head().opacity(0, 0.3),
    ...arms.map(a => a.opacity(0, 0.2)),
    counter().opacity(0, 0.3),
  );

  const ssotTitle = createRef<Txt>();
  view.add(
    <Txt ref={ssotTitle} text="The fix: Single Source of Truth" fontSize={44}
      fontFamily="Space Grotesk" fill={EP02.accent2} y={-300} opacity={0} />,
  );
  yield* ssotTitle().opacity(1, 0.4);

  // SSOT document panel
  const ssotDoc = createRef<Rect>();
  view.add(
    <Rect ref={ssotDoc} x={0} y={0} width={400} height={300} radius={12}
      fill={EP02.surface} opacity={0} stroke={EP02.accent2} lineWidth={2}>
      <Layout direction="column" gap={16} padding={24}>
        <Txt text="SPEC.md" fontSize={28} fontFamily="JetBrains Mono"
          fill={EP02.accent2} fontWeight={700} />
        <Txt text="Character: humanoid" fontSize={18} fontFamily="JetBrains Mono" fill={EP02.text} />
        <Txt text="Arms: 2 (left, right)" fontSize={18} fontFamily="JetBrains Mono" fill={EP02.text} />
        <Txt text="Legs: 2 (left, right)" fontSize={18} fontFamily="JetBrains Mono" fill={EP02.text} />
        <Txt text="Head: 1" fontSize={18} fontFamily="JetBrains Mono" fill={EP02.text} />
        <Txt text="Style: cartoon flat" fontSize={18} fontFamily="JetBrains Mono" fill={EP02.text} />
      </Layout>
    </Rect>,
  );
  yield* ssotDoc().opacity(1, 0.5);

  // Arrow → clean result
  const arrow = createRef<Line>();
  view.add(
    <Line ref={arrow} points={[[220, 0], [350, 0]]} stroke={EP02.accent2}
      lineWidth={3} endArrow arrowSize={14} end={0} />,
  );
  yield* arrow().end(1, 0.3);

  // Clean character (simple stick figure, correct proportions)
  const cleanChar = createRef<Rect>();
  view.add(
    <Rect ref={cleanChar} x={450} y={-20} width={100} height={200} radius={12}
      fill={EP02.success} opacity={0} scale={0.8}>
      <Txt text="✓" fontSize={48} fontFamily="Inter" fill={EP02.bg} />
    </Rect>,
  );
  yield* all(cleanChar().opacity(1, 0.3), cleanChar().scale(1, 0.3));

  yield* waitFor(0.5);

  // Aha text
  const aha = createRef<Txt>();
  view.add(
    <Txt ref={aha} text='"One document that knows everything."'
      fontSize={36} fontFamily="Space Grotesk" fill={EP02.text} y={250} opacity={0} />,
  );
  yield* aha().opacity(1, 0.4);

  yield* waitFor(2);
});
