import {makeScene2D, Rect, Txt, Line, Layout, Circle} from '@motion-canvas/2d';
import {createRef, all, sequence, waitFor} from '@motion-canvas/core';
import {COLORS} from '../components/Box';

export default makeScene2D(function* (view) {
  // Background
  view.fill(COLORS.bg);

  // Title
  const title = createRef<Txt>();
  view.add(
    <Txt
      ref={title}
      text="The Vibe Coding Pipeline"
      fontSize={64}
      fontFamily="Space Grotesk"
      fill={COLORS.text}
      y={-350}
      opacity={0}
    />,
  );

  yield* title().opacity(1, 0.5);
  yield* waitFor(0.5);

  // Pipeline steps
  const steps = [
    {label: 'Prompt', color: COLORS.primary},
    {label: 'Generate', color: COLORS.cyan},
    {label: 'Validate', color: COLORS.yellow},
    {label: 'Deploy', color: COLORS.green},
  ];

  const stepRefs: Rect[] = [];
  const arrowRefs: Line[] = [];

  const spacing = 280;
  const startX = -((steps.length - 1) * spacing) / 2;

  // Create step boxes
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const ref = createRef<Rect>();
    view.add(
      <Rect
        ref={ref}
        x={startX + i * spacing}
        y={0}
        width={200}
        height={80}
        radius={12}
        fill={step.color}
        opacity={0}
        scale={0.8}
      >
        <Txt
          text={step.label}
          fontSize={28}
          fontFamily="Inter"
          fill={COLORS.bg}
          fontWeight={600}
        />
      </Rect>,
    );
    stepRefs.push(ref());

    // Arrow between steps
    if (i > 0) {
      const arrow = createRef<Line>();
      view.add(
        <Line
          ref={arrow}
          points={[
            [startX + (i - 1) * spacing + 110, 0],
            [startX + i * spacing - 110, 0],
          ]}
          stroke={COLORS.muted}
          lineWidth={3}
          endArrow
          arrowSize={12}
          end={0}
        />,
      );
      arrowRefs.push(arrow());
    }
  }

  // Animate steps appearing one by one
  for (let i = 0; i < steps.length; i++) {
    yield* all(
      stepRefs[i].opacity(1, 0.3),
      stepRefs[i].scale(1, 0.3),
    );
    if (i < arrowRefs.length) {
      yield* arrowRefs[i].end(1, 0.3);
    }
    yield* waitFor(0.2);
  }

  yield* waitFor(2);
});
