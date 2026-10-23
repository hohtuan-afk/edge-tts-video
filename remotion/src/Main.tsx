import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import data from './data.json';
import {C, FONT} from './lib';
import {SCENES} from './scenes';

const Background: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const b1x = 30 + 10 * Math.sin(t / 9), b1y = 25 + 8 * Math.cos(t / 11);
  const b2x = 75 + 8 * Math.cos(t / 10), b2y = 70 + 10 * Math.sin(t / 13);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${b1x}% ${b1y}%, rgba(56,120,200,0.20), transparent 42%),
          radial-gradient(circle at ${b2x}% ${b2y}%, rgba(247,185,64,0.10), transparent 40%),
          linear-gradient(160deg, ${C.bg1}, ${C.bg0} 65%)`,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,170,205,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,170,205,0.05) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(circle at 50% 45%, black 30%, transparent 85%)',
        }}
      />
    </AbsoluteFill>
  );
};

const SceneWrap: React.FC<{dur: number; children: React.ReactNode; last: boolean}> = ({dur, children, last}) => {
  const f = useCurrentFrame();
  const fin = interpolate(f, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fout = interpolate(f, [dur - (last ? 30 : 12), dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: Math.min(fin, fout), transform: `scale(${1.015 - 0.015 * fin})`}}>{children}</AbsoluteFill>;
};

export const Caption: React.FC = () => {
  const f = useCurrentFrame();
  const sc = data.scenes.find((s) => f >= s.from && f < s.from + s.dur);
  if (!sc) return null;
  const t = (f - sc.from) / data.fps;
  const ss = sc.sents;
  let cur = -1;
  for (let i = 0; i < ss.length; i++) if (t >= ss[i].start - 0.15) cur = i;
  if (cur < 0) return null;
  const s = ss[cur];
  const end = cur + 1 < ss.length ? ss[cur + 1].start - 0.15 : s.start + s.dur + 0.6;
  if (!s.text || t > end) return null;
  const a = Math.min(1, (t - (s.start - 0.15)) / 0.3, (end - t) / 0.3);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', justifyContent: 'center', opacity: a}}>
      <div
        style={{
          maxWidth: 1560, padding: '14px 34px', borderRadius: 20, textAlign: 'center',
          background: 'rgba(6,11,22,0.86)', border: '1.5px solid rgba(160,185,225,0.18)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)', fontFamily: FONT, fontWeight: 500, fontSize: 32,
          color: C.txt, lineHeight: 1.35, transform: `translateY(${(1 - a) * 10}px)`,
        }}
      >
        {s.text}
      </div>
    </div>
  );
};

export const Progress: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute', left: 0, bottom: 0, height: 6, width: `${(100 * f) / data.total}%`,
        background: `linear-gradient(90deg, ${C.amber}, #FFD27A)`, boxShadow: `0 0 12px ${C.amber}`,
      }}
    />
  );
};

export const Main: React.FC = () => (
  <AbsoluteFill style={{fontFamily: FONT}}>
    <Background />
    <Audio src={staticFile('narration.m4a')} />
    {data.scenes.map((s, i) => {
      const Comp = SCENES[i];
      return (
        <Sequence key={i} from={s.from} durationInFrames={s.dur}>
          <SceneWrap dur={s.dur} last={i === data.scenes.length - 1}>
            <Comp S={s.sents.map((x) => x.start)} />
          </SceneWrap>
        </Sequence>
      );
    })}
    <Caption />
    <Progress />
  </AbsoluteFill>
);
