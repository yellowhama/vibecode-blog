import {Rect, Txt, Layout, Node} from '@motion-canvas/2d';
import {createRef, all, sequence, waitFor} from '@motion-canvas/core';
import {COLORS} from './Box';

// Fireship-style code block with syntax highlighting simulation
// Dark background, monospace font, line-by-line reveal animation

export interface CodeLine {
  text: string;
  color?: string;
  indent?: number;
}

export function* animateCodeBlock(
  view: Node,
  lines: CodeLine[],
  options: {
    x?: number;
    y?: number;
    width?: number;
    fontSize?: number;
    lineDelay?: number;
  } = {},
) {
  const {
    x = 0,
    y = 0,
    width = 700,
    fontSize = 22,
    lineDelay = 0.15,
  } = options;

  const lineHeight = fontSize * 1.6;
  const totalHeight = lines.length * lineHeight + 40;

  const container = createRef<Rect>();
  view.add(
    <Rect
      ref={container}
      x={x}
      y={y}
      width={width}
      height={totalHeight}
      radius={12}
      fill={COLORS.surface}
      opacity={0}
      layout
      direction="column"
      padding={20}
      gap={4}
    />,
  );

  yield* container().opacity(1, 0.3);

  const lineRefs: Txt[] = [];
  for (const line of lines) {
    const ref = createRef<Txt>();
    container().add(
      <Txt
        ref={ref}
        text={' '.repeat(line.indent ?? 0) + line.text}
        fontSize={fontSize}
        fontFamily="JetBrains Mono"
        fill={line.color ?? COLORS.text}
        opacity={0}
      />,
    );
    lineRefs.push(ref());
  }

  for (const ref of lineRefs) {
    yield* ref.opacity(1, lineDelay);
  }
}
