import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import React from 'react';

const COLORS = {
  bg: '#0E1117',
  primary: '#3B82F6',
  cyan: '#06B6D4',
  yellow: '#FFD166',
  text: '#F8FAFC',
  muted: '#64748B',
};

export interface EpisodeProps {
  episode: string;
  audioSrc: string;
  subtitlesSrc: string;
  clipsDir: string;
  explainerDir: string;
}

export const Episode: React.FC<EpisodeProps> = ({
  episode,
  audioSrc,
  subtitlesSrc,
  clipsDir,
  explainerDir,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.bg}}>
      {/* Intro title card */}
      <Sequence from={0} durationInFrames={fps * 3}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              color: COLORS.text,
              opacity: interpolate(
                frame,
                [0, 15, fps * 2.5, fps * 3],
                [0, 1, 1, 0],
                {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
              ),
            }}
          >
            EP{episode}
          </div>
          <div
            style={{
              fontSize: 32,
              fontFamily: 'Inter, sans-serif',
              color: COLORS.cyan,
              marginTop: 16,
              opacity: interpolate(frame, [10, 25], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            Vibe Coder Survival Guide
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Main content area — clips sequenced here by shot manifest */}
      <Sequence from={fps * 3} durationInFrames={fps * 290}>
        <AbsoluteFill>
          {/* Video clips and explainer diagrams will be dynamically inserted
              based on ep_assembly.json props in production */}
        </AbsoluteFill>
      </Sequence>

      {/* Audio layer */}
      {audioSrc && <Audio src={audioSrc} />}

      {/* Subtitle overlay */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 80,
          pointerEvents: 'none',
        }}
      >
        <SubtitleOverlay frame={frame} fps={fps} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SubtitleOverlay: React.FC<{frame: number; fps: number}> = () => {
  // In production, this reads from the SRT file passed via props
  // and renders the current subtitle based on frame timing.
  // For now, returns null as a placeholder.
  return null;
};
