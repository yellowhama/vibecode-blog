import {makeScene2D, Rect, Txt, Line, Layout, Circle, Img} from '@motion-canvas/2d';
import {createRef, all, sequence, waitFor, chain, Vector2} from '@motion-canvas/core';

/**
 * EP01: "What's a Spec?" — Core Explainer Scene
 * Series Bible v5: 2D flat vector, building metaphor
 * Segment: CORE (0:45-3:00) — ~135s
 *
 * Visual Metaphor: Building = Code
 *   - With blueprint (spec) → solid structure
 *   - Without blueprint (no spec) → collapses
 */

// EP01 Theme palette (Series Bible B5: episode theme colors)
const EP01 = {
  bg: '#0D1B2A',           // Series Bible dark background
  surface: '#1B2838',      // Slightly lighter panels
  text: '#F8FAFC',         // White text
  muted: '#64748B',        // Subdued text
  accent1: '#FF6B35',      // Orange — chaos/failure
  accent2: '#00D4FF',      // Cyan — clarity/spec
  accent3: '#7AE582',      // Green — success
  veeHoodie: '#FFD93D',    // Vee's yellow hoodie
  veeGlasses: '#2D2D2D',   // Vee's glasses
  danger: '#EF4444',       // Error red
  blueprint: '#1E40AF',    // Blueprint blue
};

export default makeScene2D(function* (view) {
  view.fill(EP01.bg);

  // ========== PART 1: "Building without a blueprint" ==========

  const noSpecTitle = createRef<Txt>();
  view.add(
    <Txt
      ref={noSpecTitle}
      text="Building without a blueprint..."
      fontSize={48}
      fontFamily="Space Grotesk"
      fill={EP01.muted}
      y={-350}
      opacity={0}
    />,
  );

  yield* noSpecTitle().opacity(1, 0.5);
  yield* waitFor(0.3);

  // Chaotic "building" — stacked blocks, misaligned
  const chaosBlocks: Rect[] = [];
  const blockData = [
    {x: -80, y: 180, w: 160, h: 50, rot: -3, label: 'login.js'},
    {x: 40, y: 120, w: 140, h: 50, rot: 5, label: 'auth.py'},
    {x: -40, y: 60, w: 180, h: 50, rot: -7, label: 'database??'},
    {x: 60, y: 0, w: 120, h: 50, rot: 4, label: 'utils.ts'},
    {x: -20, y: -60, w: 150, h: 50, rot: -2, label: 'api_v3_final2'},
  ];

  for (const b of blockData) {
    const ref = createRef<Rect>();
    view.add(
      <Rect
        ref={ref}
        x={b.x}
        y={b.y}
        width={b.w}
        height={b.h}
        radius={6}
        fill={EP01.accent1}
        opacity={0}
        rotation={b.rot}
        scale={0.8}
      >
        <Txt
          text={b.label}
          fontSize={18}
          fontFamily="JetBrains Mono"
          fill={EP01.bg}
          fontWeight={600}
        />
      </Rect>,
    );
    chaosBlocks.push(ref());
  }

  // Animate blocks falling in with slight chaos
  for (const block of chaosBlocks) {
    yield* all(
      block.opacity(1, 0.2),
      block.scale(1, 0.25),
    );
    yield* waitFor(0.15);
  }

  yield* waitFor(0.5);

  // Crack lines appear
  const crack1 = createRef<Line>();
  const crack2 = createRef<Line>();
  view.add(
    <Line
      ref={crack1}
      points={[[0, 200], [-30, 100], [20, 0], [-10, -80]]}
      stroke={EP01.danger}
      lineWidth={3}
      end={0}
    />,
  );
  view.add(
    <Line
      ref={crack2}
      points={[[60, 180], [80, 80], [40, -20]]}
      stroke={EP01.danger}
      lineWidth={2}
      end={0}
    />,
  );

  yield* all(
    crack1().end(1, 0.6),
    crack2().end(1, 0.5),
  );

  // Collapse — blocks scatter and fade
  yield* waitFor(0.3);
  yield* all(
    ...chaosBlocks.map((b, i) =>
      all(
        b.opacity(0, 0.4),
        b.y(b.y() + 200, 0.5),
        b.rotation(b.rotation() + (i % 2 === 0 ? 20 : -15), 0.5),
      ),
    ),
    crack1().opacity(0, 0.4),
    crack2().opacity(0, 0.4),
    noSpecTitle().opacity(0, 0.3),
  );

  yield* waitFor(0.5);

  // ========== PART 2: "Now, with a blueprint" ==========

  const specTitle = createRef<Txt>();
  view.add(
    <Txt
      ref={specTitle}
      text="Now, with a blueprint."
      fontSize={48}
      fontFamily="Space Grotesk"
      fill={EP01.accent2}
      y={-350}
      opacity={0}
    />,
  );

  yield* specTitle().opacity(1, 0.5);

  // Blueprint panel
  const blueprint = createRef<Rect>();
  view.add(
    <Rect
      ref={blueprint}
      x={-300}
      y={0}
      width={320}
      height={400}
      radius={12}
      fill={EP01.blueprint}
      opacity={0}
      stroke={EP01.accent2}
      lineWidth={2}
    >
      <Layout direction="column" gap={16} padding={24}>
        <Txt
          text="SPEC"
          fontSize={28}
          fontFamily="Space Grotesk"
          fill={EP01.text}
          fontWeight={700}
        />
        <Txt
          text="1. Auth service"
          fontSize={18}
          fontFamily="JetBrains Mono"
          fill={EP01.accent2}
        />
        <Txt
          text="2. Database layer"
          fontSize={18}
          fontFamily="JetBrains Mono"
          fill={EP01.accent2}
        />
        <Txt
          text="3. API endpoints"
          fontSize={18}
          fontFamily="JetBrains Mono"
          fill={EP01.accent2}
        />
        <Txt
          text="4. Frontend UI"
          fontSize={18}
          fontFamily="JetBrains Mono"
          fill={EP01.accent2}
        />
      </Layout>
    </Rect>,
  );

  yield* blueprint().opacity(1, 0.5);
  yield* waitFor(0.3);

  // Solid building — neat, aligned blocks
  const solidBlocks: Rect[] = [];
  const solidData = [
    {x: 200, y: 180, w: 280, h: 50, label: 'Database', color: EP01.accent3},
    {x: 200, y: 120, w: 280, h: 50, label: 'Auth Service', color: EP01.accent3},
    {x: 200, y: 60, w: 280, h: 50, label: 'API Layer', color: EP01.accent3},
    {x: 200, y: 0, w: 280, h: 50, label: 'Frontend', color: EP01.accent3},
  ];

  // Arrow from blueprint to building
  const blueprintArrow = createRef<Line>();
  view.add(
    <Line
      ref={blueprintArrow}
      points={[[-130, 0], [50, 0]]}
      stroke={EP01.accent2}
      lineWidth={3}
      endArrow
      arrowSize={14}
      end={0}
      lineDash={[8, 4]}
    />,
  );

  yield* blueprintArrow().end(1, 0.4);

  for (const b of solidData) {
    const ref = createRef<Rect>();
    view.add(
      <Rect
        ref={ref}
        x={b.x}
        y={b.y}
        width={b.w}
        height={b.h}
        radius={8}
        fill={b.color}
        opacity={0}
        scale={0.9}
      >
        <Txt
          text={b.label}
          fontSize={22}
          fontFamily="Inter"
          fill={EP01.bg}
          fontWeight={600}
        />
      </Rect>,
    );
    solidBlocks.push(ref());
  }

  // Animate blocks stacking neatly from bottom to top
  for (const block of solidBlocks) {
    yield* all(
      block.opacity(1, 0.25),
      block.scale(1, 0.3),
    );
    yield* waitFor(0.1);
  }

  // Checkmark on top
  const check = createRef<Txt>();
  view.add(
    <Txt
      ref={check}
      text="✓"
      fontSize={64}
      fontFamily="Inter"
      fill={EP01.accent3}
      x={200}
      y={-60}
      opacity={0}
      scale={0.5}
    />,
  );

  yield* all(
    check().opacity(1, 0.3),
    check().scale(1, 0.3),
  );

  yield* waitFor(0.5);

  // ========== PART 3: "A spec is one sentence" ==========

  // Fade everything
  yield* all(
    specTitle().opacity(0, 0.3),
    blueprint().opacity(0, 0.3),
    blueprintArrow().opacity(0, 0.2),
    ...solidBlocks.map(b => b.opacity(0, 0.3)),
    check().opacity(0, 0.2),
  );

  yield* waitFor(0.3);

  const ahaText = createRef<Txt>();
  const ahaSubtext = createRef<Txt>();
  view.add(
    <Txt
      ref={ahaText}
      text={'"A spec is one sentence:"'}
      fontSize={44}
      fontFamily="Space Grotesk"
      fill={EP01.text}
      y={-40}
      opacity={0}
    />,
  );
  view.add(
    <Txt
      ref={ahaSubtext}
      text={"What am I building?"}
      fontSize={56}
      fontFamily="Space Grotesk"
      fill={EP01.accent2}
      fontWeight={700}
      y={40}
      opacity={0}
      scale={0.9}
    />,
  );

  yield* ahaText().opacity(1, 0.4);
  yield* waitFor(0.3);
  yield* all(
    ahaSubtext().opacity(1, 0.5),
    ahaSubtext().scale(1, 0.4),
  );

  yield* waitFor(2);
});
