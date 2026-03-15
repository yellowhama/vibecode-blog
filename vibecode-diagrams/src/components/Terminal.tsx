import {Rect, Txt, Layout, Node} from '@motion-canvas/2d';
import {createRef, all, loop, waitFor} from '@motion-canvas/core';
import {COLORS} from './Box';

// Terminal output animation — type text line by line with cursor blink

export interface TerminalLine {
  text: string;
  isCommand?: boolean;
  color?: string;
}

export function* animateTerminal(
  view: Node,
  lines: TerminalLine[],
  options: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    typeSpeed?: number;
    lineDelay?: number;
  } = {},
) {
  const {
    x = 0,
    y = 0,
    width = 700,
    height = 400,
    typeSpeed = 0.03,
    lineDelay = 0.3,
  } = options;

  const container = createRef<Rect>();
  const titleBar = createRef<Rect>();

  view.add(
    <Rect
      ref={container}
      x={x}
      y={y}
      width={width}
      height={height}
      radius={12}
      fill="#000000"
      opacity={0}
      clip
      layout
      direction="column"
    >
      {/* Title bar */}
      <Rect
        ref={titleBar}
        width={width}
        height={36}
        fill="#1a1a2e"
        padding={[0, 12]}
        alignItems="center"
        layout
        direction="row"
        gap={8}
      >
        <Rect width={12} height={12} radius={6} fill="#EF4444" />
        <Rect width={12} height={12} radius={6} fill="#FFD166" />
        <Rect width={12} height={12} radius={6} fill="#22C55E" />
      </Rect>
      <Layout padding={16} direction="column" gap={4} />
    </Rect>,
  );

  yield* container().opacity(1, 0.3);

  const body = container().children()[1] as Layout;

  for (const line of lines) {
    const ref = createRef<Txt>();
    const prefix = line.isCommand ? '$ ' : '';
    body.add(
      <Txt
        ref={ref}
        text=""
        fontSize={18}
        fontFamily="JetBrains Mono"
        fill={line.color ?? (line.isCommand ? COLORS.green : COLORS.text)}
      />,
    );

    const fullText = prefix + line.text;
    for (let i = 0; i <= fullText.length; i++) {
      ref().text(fullText.slice(0, i));
      yield* waitFor(typeSpeed);
    }
    yield* waitFor(lineDelay);
  }
}
