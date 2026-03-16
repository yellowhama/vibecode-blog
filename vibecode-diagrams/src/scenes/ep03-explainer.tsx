import {makeScene2D, Rect, Txt, Line, Layout} from '@motion-canvas/2d';
import {createRef, all, waitFor} from '@motion-canvas/core';

/**
 * EP03: "The Apartment Without Walls" — Core Explainer Scene
 * Extended metaphor: No walls = no code boundaries. Everything bleeds.
 */

const EP03 = {
  bg: '#0D1B2A',
  text: '#F8FAFC',
  muted: '#64748B',
  surface: '#1B2838',
  kitchen: '#FF6B35',   // Orange — cooking/danger
  bedroom: '#3B82F6',   // Blue — sleep
  bathroom: '#06B6D4',  // Cyan — water
  wall: '#94A3B8',      // Wall color
  success: '#7AE582',
};

export default makeScene2D(function* (view) {
  view.fill(EP03.bg);

  // ========== PART 1: "The apartment without walls" ==========
  const title = createRef<Txt>();
  view.add(
    <Txt ref={title} text="Imagine an apartment with no walls." fontSize={44}
      fontFamily="Space Grotesk" fill={EP03.muted} y={-350} opacity={0} />,
  );
  yield* title().opacity(1, 0.5);

  // Open floor plan — 3 zones, NO walls between them
  const zones = [
    {x: -280, label: 'KITCHEN', color: EP03.kitchen, icon: '🍳'},
    {x: 0, label: 'BEDROOM', color: EP03.bedroom, icon: '🛏'},
    {x: 280, label: 'BATHROOM', color: EP03.bathroom, icon: '🚿'},
  ];

  const zoneRefs: Rect[] = [];
  for (const z of zones) {
    const ref = createRef<Rect>();
    view.add(
      <Rect ref={ref} x={z.x} y={0} width={220} height={200} radius={8}
        fill={EP03.surface} opacity={0}>
        <Layout direction="column" gap={8} alignItems="center">
          <Txt text={z.icon} fontSize={48} />
          <Txt text={z.label} fontSize={18} fontFamily="Inter" fill={z.color} fontWeight={600} />
        </Layout>
      </Rect>,
    );
    zoneRefs.push(ref());
  }

  for (const z of zoneRefs) {
    yield* z.opacity(1, 0.3);
    yield* waitFor(0.1);
  }

  yield* waitFor(0.5);

  // Chaos arrows — things bleeding between zones
  const chaosArrows: {ref: Line; label: string}[] = [];
  const arrowData = [
    {from: [-170, -20], to: [-110, -20], label: 'oil splatter →', color: EP03.kitchen},
    {from: [110, 20], to: [170, 20], label: '← water leak', color: EP03.bathroom},
    {from: [-110, 40], to: [110, 40], label: 'smoke everywhere →', color: EP03.kitchen},
  ];

  for (const a of arrowData) {
    const ref = createRef<Line>();
    view.add(
      <Line ref={ref} points={[a.from, a.to]}
        stroke={a.color} lineWidth={3} endArrow arrowSize={10}
        end={0} lineDash={[6, 3]} />,
    );
    chaosArrows.push({ref: ref(), label: a.label});
  }

  // Labels for chaos
  const chaosLabels: Txt[] = [];
  const labelData = [
    {x: -140, y: -50, text: 'oil on bed', color: EP03.kitchen},
    {x: 140, y: -10, text: 'water on computer', color: EP03.bathroom},
    {x: 0, y: 70, text: 'everything affects everything', color: EP03.muted},
  ];

  for (const l of labelData) {
    const ref = createRef<Txt>();
    view.add(
      <Txt ref={ref} text={l.text} fontSize={14} fontFamily="Inter"
        fill={l.color} x={l.x} y={l.y} opacity={0} />,
    );
    chaosLabels.push(ref());
  }

  // Animate chaos
  for (let i = 0; i < chaosArrows.length; i++) {
    yield* all(
      chaosArrows[i].ref.end(1, 0.4),
      chaosLabels[i].opacity(1, 0.3),
    );
    yield* waitFor(0.2);
  }

  yield* waitFor(1);

  // ========== PART 2: "Walls go up" ==========
  yield* all(
    title().opacity(0, 0.3),
    ...chaosArrows.map(a => a.ref.opacity(0, 0.2)),
    ...chaosLabels.map(l => l.opacity(0, 0.2)),
    ...zoneRefs.map(z => z.opacity(0, 0.3)),
  );

  const wallTitle = createRef<Txt>();
  view.add(
    <Txt ref={wallTitle} text="Now: walls go up." fontSize={48}
      fontFamily="Space Grotesk" fill={EP03.success} y={-350} opacity={0} />,
  );
  yield* wallTitle().opacity(1, 0.4);

  // Same zones, now with walls (borders)
  const walledZones: Rect[] = [];
  for (const z of zones) {
    const ref = createRef<Rect>();
    view.add(
      <Rect ref={ref} x={z.x} y={0} width={220} height={200} radius={8}
        fill={EP03.surface} opacity={0} stroke={EP03.wall} lineWidth={4}>
        <Layout direction="column" gap={8} alignItems="center">
          <Txt text={z.icon} fontSize={48} />
          <Txt text={z.label} fontSize={18} fontFamily="Inter" fill={z.color} fontWeight={600} />
        </Layout>
      </Rect>,
    );
    walledZones.push(ref());
  }

  // Walls appear (animated borders)
  for (const z of walledZones) {
    yield* z.opacity(1, 0.3);
    yield* waitFor(0.15);
  }

  // Check marks on each room
  for (let i = 0; i < walledZones.length; i++) {
    const check = createRef<Txt>();
    view.add(
      <Txt ref={check} text="✓" fontSize={36} fontFamily="Inter"
        fill={EP03.success} x={zones[i].x} y={-120} opacity={0} />,
    );
    yield* check().opacity(1, 0.2);
  }

  yield* waitFor(0.5);

  // ========== PART 3: Aha ==========
  yield* all(
    wallTitle().opacity(0, 0.3),
    ...walledZones.map(z => z.opacity(0, 0.3)),
  );

  const aha1 = createRef<Txt>();
  const aha2 = createRef<Txt>();
  view.add(
    <Txt ref={aha1} text='"Domains are walls."' fontSize={44}
      fontFamily="Space Grotesk" fill={EP03.text} y={-30} opacity={0} />,
  );
  view.add(
    <Txt ref={aha2} text="Each feature gets its own room." fontSize={36}
      fontFamily="Space Grotesk" fill={EP03.success} y={30} opacity={0} />,
  );

  yield* aha1().opacity(1, 0.4);
  yield* waitFor(0.3);
  yield* aha2().opacity(1, 0.4);

  yield* waitFor(2);
});
