import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import React from 'react';

const COLORS = {
  bg: '#0E1117',
  primary: '#3B82F6',
  cyan: '#06B6D4',
  text: '#F8FAFC',
};

interface SegmentTitleProps {
  title: string;
  subtitle?: string;
}

export const SegmentTitle: React.FC<SegmentTitleProps> = ({title, subtitle}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15, 75, 90], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.bg,
      }}
    >
      <div
        style={{
          fontSize: 64,
          fontFamily: 'Space Grotesk, sans-serif',
          color: COLORS.text,
          fontWeight: 700,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: 32,
            fontFamily: 'Inter, sans-serif',
            color: COLORS.cyan,
            marginTop: 16,
          }}
        >
          {subtitle}
        </div>
      )}
    </AbsoluteFill>
  );
};
