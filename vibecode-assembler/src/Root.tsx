import React from 'react';
import {Composition} from 'remotion';
import {Episode} from './Episode';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Episode"
        component={Episode as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={30 * 300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          episode: '01',
          audioSrc: '',
          subtitlesSrc: '',
          clipsDir: '',
          explainerDir: '',
        }}
      />
      <Composition
        id="Short"
        component={Episode as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={30 * 58}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          episode: '01',
          audioSrc: '',
          subtitlesSrc: '',
          clipsDir: '',
          explainerDir: '',
        }}
      />
    </>
  );
};
