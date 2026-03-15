import {Img, Node} from '@motion-canvas/2d';
import {createRef, all} from '@motion-canvas/core';

// Import Vee/Bee SVG or PNG and position them in scenes
// Simple entrance/exit animations (fade, slide)

export function* fadeIn(
  view: Node,
  src: string,
  options: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    duration?: number;
  } = {},
) {
  const {x = 0, y = 0, width = 200, height = 200, duration = 0.5} = options;
  const ref = createRef<Img>();
  view.add(
    <Img
      ref={ref}
      src={src}
      x={x}
      y={y}
      width={width}
      height={height}
      opacity={0}
    />,
  );
  yield* ref().opacity(1, duration);
  return ref;
}

export function* slideIn(
  view: Node,
  src: string,
  options: {
    x?: number;
    y?: number;
    fromX?: number;
    fromY?: number;
    width?: number;
    height?: number;
    duration?: number;
  } = {},
) {
  const {
    x = 0,
    y = 0,
    fromX = -400,
    fromY = y,
    width = 200,
    height = 200,
    duration = 0.6,
  } = options;
  const ref = createRef<Img>();
  view.add(
    <Img
      ref={ref}
      src={src}
      x={fromX}
      y={fromY}
      width={width}
      height={height}
      opacity={0}
    />,
  );
  yield* all(ref().opacity(1, duration * 0.5), ref().position([x, y], duration));
  return ref;
}
