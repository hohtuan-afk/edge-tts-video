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
export const Fade: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  const o = Math.min(interpolate(f, [0, 12], [0, 1], {extrapolateRight: 'clamp'}), interpolate(f, [dur - 10, dur], [1, 0], {extrapolateLeft: 'clamp'}));
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};
// Nhãn chuỗi bài ở góc trên bên trái
export const SeriesTag: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [6, 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 22, top: 6, display: 'flex', alignItems: 'center', gap: 12, padding: '5px 16px 5px 10px', borderRadius: 10, background: 'rgba(8,12,18,0.78)', border: '1px solid rgba(255,255,255,0.14)', opacity: a, fontFamily: FONT}}>
      <svg width={34} height={20} viewBox="0 0 34 20"><polyline points="0,12 8,12 11,4 14,18 17,9 20,12 34,12" fill="none" stroke="#FC6255" strokeWidth={2.4} strokeLinejoin="round" /></svg>
      <span style={{fontSize: 21, fontWeight: 800, letterSpacing: 1.2, color: '#F1F5F9'}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN</span>
      <span style={{fontSize: 19, fontWeight: 500, color: '#94A3B8'}}>· Nhồi máu cơ tim cấp</span>
    </div>
  );
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
    <SeriesTag />
    <Caption />
    <Progress />
  </AbsoluteFill>
);
