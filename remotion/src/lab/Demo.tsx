// Bản nghe thử: 5 cảnh mẫu + giọng đọc, hoạt hình kéo giãn theo mốc câu (TimeMap)
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import data from '../data.json';
import keys from './demo_keys.json';
import {TimeMap, CapCtx, FONT} from '../lib';
import {Caption, Progress} from '../Main';
import {MonitorScene} from './Lab';
import {VecRotate, VecProject} from './Vector';
import {PaperDeWinter, PaperPosterior} from './Paper';

const SC = [MonitorScene, VecRotate, VecProject, PaperDeWinter, PaperPosterior];
const Fade: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [0, 12], [0, 1], {extrapolateRight: 'clamp'}), interpolate(f, [dur - 10, dur], [1, 0], {extrapolateLeft: 'clamp'}));
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};
export const Demo: React.FC = () => (
  <AbsoluteFill style={{background: '#0E1116', fontFamily: FONT}}>
    <Audio src={staticFile('narration.m4a')} />
    <CapCtx.Provider value={false}>
      {data.scenes.map((s, i) => {
        const Comp = SC[i];
        const map: [number, number][] = s.sents.map((x, j) => [x.start, (keys as number[][])[i][j]]);
        return (
          <Sequence key={i} from={s.from} durationInFrames={s.dur}>
            <Fade dur={s.dur}>
              <TimeMap.Provider value={map}><Comp /></TimeMap.Provider>
            </Fade>
          </Sequence>
        );
      })}
    </CapCtx.Provider>
    <Caption />
    <Progress />
  </AbsoluteFill>
);
