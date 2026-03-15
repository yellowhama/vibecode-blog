import {Line, LineProps} from '@motion-canvas/2d';
import {SignalValue} from '@motion-canvas/core';

export interface ArrowProps extends LineProps {
  arrowSize?: SignalValue<number>;
}

export function* animateArrow(line: Line, duration: number = 0.6) {
  yield* line.end(0).end(1, duration);
}
