import {Layout, Rect, Txt, Line, Node} from '@motion-canvas/2d';
import {createRef, all, sequence, waitFor} from '@motion-canvas/core';
import {COLORS} from './Box';

export interface FlowStep {
  label: string;
  icon?: string;
  color?: string;
}

// Helper to create a horizontal flow: [Step 1] -> [Step 2] -> [Step 3]
// Animate step by step with arrows
export function* animateFlow(
  view: Node,
  steps: FlowStep[],
  options: {
    y?: number;
    spacing?: number;
    boxWidth?: number;
    boxHeight?: number;
  } = {},
) {
  const {y = 0, spacing = 280, boxWidth = 200, boxHeight = 80} = options;
  const startX = -((steps.length - 1) * spacing) / 2;
  const stepRefs: Rect[] = [];
  const arrowRefs: Line[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const ref = createRef<Rect>();
    view.add(
      <Rect
        ref={ref}
        x={startX + i * spacing}
        y={y}
        width={boxWidth}
        height={boxHeight}
        radius={12}
        fill={step.color ?? COLORS.primary}
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

    if (i > 0) {
      const arrow = createRef<Line>();
      view.add(
        <Line
          ref={arrow}
          points={[
            [startX + (i - 1) * spacing + boxWidth / 2 + 10, y],
            [startX + i * spacing - boxWidth / 2 - 10, y],
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

  for (let i = 0; i < steps.length; i++) {
    yield* all(stepRefs[i].opacity(1, 0.3), stepRefs[i].scale(1, 0.3));
    if (i < arrowRefs.length) {
      yield* arrowRefs[i].end(1, 0.3);
    }
    yield* waitFor(0.2);
  }
}
