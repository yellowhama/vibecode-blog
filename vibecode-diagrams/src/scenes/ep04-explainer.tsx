import {makeScene2D, Rect, Txt, Line, Layout, Circle} from '@motion-canvas/2d';
import {createRef, all, waitFor} from '@motion-canvas/core';

/**
 * EP04: "The Box You're Afraid to Open" — Core Explainer Scene
 * Extended metaphor: Sealed boxes = untested code. Opening reveals truth.
 */

const EP04 = {
  bg: '#0D1B2A',
  text: '#F8FAFC',
  muted: '#64748B',
  surface: '#1B2838',
  boxSealed: '#475569',   // Sealed box grey
  boxOpen: '#F59E0B',     // Amber when opened
  bug: '#EF4444',         // Red — bug inside
  good: '#7AE582',        // Green — working
  beautiful: '#8B5CF6',   // Purple — something great
  testGreen: '#22C55E',   // Test pass green
  testRed: '#EF4444',     // Test fail red
};

export default makeScene2D(function* (view) {
  view.fill(EP04.bg);

  // ========== PART 1: "Room full of sealed boxes" ==========
  const title = createRef<Txt>();
  view.add(
    <Txt ref={title} text="She's never opened a single one." fontSize={44}
      fontFamily="Space Grotesk" fill={EP04.muted} y={-350} opacity={0} />,
  );
  yield* title().opacity(1, 0.5);

  // Grid of sealed boxes
  const boxes: Rect[] = [];
  const boxLabels = ['auth.js', 'db.py', 'api.ts', 'sync.rs', 'ui.tsx', 'config', 'utils', 'routes', 'models'];
  const cols = 3;
  const boxW = 160;
  const boxH = 80;
  const gap = 20;
  const startX = -((cols - 1) * (boxW + gap)) / 2;
  const startY = -100;

  for (let i = 0; i < boxLabels.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const ref = createRef<Rect>();
    view.add(
      <Rect ref={ref} x={startX + col * (boxW + gap)} y={startY + row * (boxH + gap)}
        width={boxW} height={boxH} radius={8}
        fill={EP04.boxSealed} opacity={0} stroke={EP04.muted} lineWidth={1}>
        <Layout direction="column" gap={4} alignItems="center">
          <Txt text="📦" fontSize={24} />
          <Txt text={boxLabels[i]} fontSize={14} fontFamily="JetBrains Mono" fill={EP04.muted} />
        </Layout>
      </Rect>,
    );
    boxes.push(ref());
  }

  // Boxes appear
  for (const box of boxes) {
    yield* box.opacity(1, 0.15);
  }

  yield* waitFor(0.5);

  // ========== PART 2: "Opening the first box" ==========
  yield* all(title().opacity(0, 0.3));

  const openTitle = createRef<Txt>();
  view.add(
    <Txt ref={openTitle} text="Opening..." fontSize={36}
      fontFamily="Space Grotesk" fill={EP04.boxOpen} y={-350} opacity={0} />,
  );
  yield* openTitle().opacity(1, 0.3);

  // Box 1 opens — bug inside
  yield* all(
    boxes[0].fill(EP04.bug, 0.3),
    boxes[0].stroke(EP04.bug, 0.3),
  );
  const bug1 = createRef<Txt>();
  view.add(
    <Txt ref={bug1} text="🐛" fontSize={28} x={startX} y={startY - 50} opacity={0} />,
  );
  yield* bug1().opacity(1, 0.2);

  yield* waitFor(0.3);

  // Box 2 opens — it's fine
  yield* all(
    boxes[1].fill(EP04.good, 0.3),
    boxes[1].stroke(EP04.good, 0.3),
  );
  const check1 = createRef<Txt>();
  view.add(
    <Txt ref={check1} text="✓" fontSize={28} fontFamily="Inter" fill={EP04.good}
      x={startX + (boxW + gap)} y={startY - 50} opacity={0} />,
  );
  yield* check1().opacity(1, 0.2);

  yield* waitFor(0.3);

  // Box 3 opens — something beautiful
  yield* all(
    boxes[2].fill(EP04.beautiful, 0.3),
    boxes[2].stroke(EP04.beautiful, 0.3),
  );
  const star = createRef<Txt>();
  view.add(
    <Txt ref={star} text="✨" fontSize={28}
      x={startX + 2 * (boxW + gap)} y={startY - 50} opacity={0} />,
  );
  yield* star().opacity(1, 0.2);

  yield* waitFor(0.5);

  // Insight text
  const insight = createRef<Txt>();
  view.add(
    <Txt ref={insight} text="The fear was worse than the reality." fontSize={32}
      fontFamily="Space Grotesk" fill={EP04.text} y={250} opacity={0} />,
  );
  yield* insight().opacity(1, 0.4);

  yield* waitFor(1);

  // ========== PART 3: "The rhythm of testing" ==========
  yield* all(
    openTitle().opacity(0, 0.2),
    ...boxes.map(b => b.opacity(0, 0.2)),
    bug1().opacity(0, 0.2),
    check1().opacity(0, 0.2),
    star().opacity(0, 0.2),
    insight().opacity(0, 0.2),
  );

  const rhythmTitle = createRef<Txt>();
  view.add(
    <Txt ref={rhythmTitle} text="Open boxes daily. Small. Manageable." fontSize={40}
      fontFamily="Space Grotesk" fill={EP04.boxOpen} y={-300} opacity={0} />,
  );
  yield* rhythmTitle().opacity(1, 0.4);

  // Test rhythm: RED → GREEN → RED → GREEN
  const testSteps = [
    {label: 'test()', result: '✓ PASS', color: EP04.testGreen},
    {label: 'test()', result: '✗ FAIL', color: EP04.testRed},
    {label: 'fix()', result: '...', color: EP04.boxOpen},
    {label: 'test()', result: '✓ PASS', color: EP04.testGreen},
  ];

  const stepRefs: Rect[] = [];
  const spacing = 200;
  const stepsStartX = -((testSteps.length - 1) * spacing) / 2;

  for (let i = 0; i < testSteps.length; i++) {
    const s = testSteps[i];
    const ref = createRef<Rect>();
    view.add(
      <Rect ref={ref} x={stepsStartX + i * spacing} y={0}
        width={160} height={100} radius={12}
        fill={EP04.surface} opacity={0} stroke={s.color} lineWidth={2}>
        <Layout direction="column" gap={8} alignItems="center">
          <Txt text={s.label} fontSize={20} fontFamily="JetBrains Mono" fill={EP04.text} />
          <Txt text={s.result} fontSize={18} fontFamily="Inter" fill={s.color} fontWeight={700} />
        </Layout>
      </Rect>,
    );
    stepRefs.push(ref());
  }

  // Arrows between steps
  const stepArrows: Line[] = [];
  for (let i = 0; i < testSteps.length - 1; i++) {
    const ref = createRef<Line>();
    view.add(
      <Line ref={ref}
        points={[[stepsStartX + i * spacing + 90, 0], [stepsStartX + (i + 1) * spacing - 90, 0]]}
        stroke={EP04.muted} lineWidth={2} endArrow arrowSize={10} end={0} />,
    );
    stepArrows.push(ref());
  }

  // Animate the rhythm
  for (let i = 0; i < testSteps.length; i++) {
    yield* stepRefs[i].opacity(1, 0.3);
    if (i < stepArrows.length) {
      yield* stepArrows[i].end(1, 0.2);
    }
    yield* waitFor(0.2);
  }

  yield* waitFor(0.5);

  // Aha
  const aha = createRef<Txt>();
  view.add(
    <Txt ref={aha} text='"Testing isn\'t courage. It\'s habit."'
      fontSize={36} fontFamily="Space Grotesk" fill={EP04.testGreen}
      y={200} opacity={0} />,
  );
  yield* aha().opacity(1, 0.4);

  yield* waitFor(2);
});
