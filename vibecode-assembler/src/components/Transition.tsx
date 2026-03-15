import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import React from 'react';

interface FadeProps {
  children: React.ReactNode;
  durationInFrames: number;
  type?: 'fade' | 'slideLeft' | 'slideUp';
}

export const FadeIn: React.FC<FadeProps> = ({
  children,
  durationInFrames,
  type = 'fade',
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const transform =
    type === 'slideLeft'
      ? `translateX(${interpolate(frame, [0, durationInFrames], [100, 0], {extrapolateRight: 'clamp'})}px)`
      : type === 'slideUp'
        ? `translateY(${interpolate(frame, [0, durationInFrames], [50, 0], {extrapolateRight: 'clamp'})}px)`
        : undefined;

  return (
    <AbsoluteFill style={{opacity, transform}}>
      {children}
    </AbsoluteFill>
  );
};

export const FadeOut: React.FC<FadeProps> = ({
  children,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{opacity}}>
      {children}
    </AbsoluteFill>
  );
};
