// Bản nghe thử 2: động mạch vành (tim bán thực tế) → tiến triển ECG (monitor) → thành dưới (tim + giấy hồng) → bảng định khu vẽ tay
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, Easing, staticFile, useCurrentFrame} from 'remotion';
import data from '../data.json';
import keys from './demo2_keys.json';
import {TimeMap, CapCtx, FONT, useT} from '../lib';
import {Caption, Progress} from '../Main';
import {StagesScene, MONO} from './Lab';
import {TableHand} from './TableHand';
import {Fade, SeriesTag} from './Demo';
import {Heart4, Zone4, Hot4} from '../wb/heart4';
import {HAND, RPath, RArrow} from '../wb/wb';
import {INFERIOR, tracePts, ecgAt, Lead} from './ecg';

const ap = (t: number, s: number, d = 0.6) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1)});
const dp = (t: number, s: number, d = 0.8) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
const useBeat = () => {
  const rt = useCurrentFrame() / 30;
  return Math.max(0, Math.sin(rt * 2 * Math.PI * 1.1)) ** 4;
};
const LightBg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 32% 42%, #FFFFFF, #E9EEF3 72%)'}}>{children}</AbsoluteFill>
);

// ---------- Cảnh 1: ba động mạch vành ----------
const ART: {k: Hot4; z: Zone4; c: string; ab: string; name: string; feed: string; t0: number}[] = [
  {k: 'rca', z: 'inf', c: '#E11D48', ab: 'RCA', name: 'Động mạch vành phải', feed: 'Thành dưới · Thất phải', t0: 3.0},
  {k: 'lad', z: 'ant', c: '#2563EB', ab: 'LAD', name: 'Động mạch liên thất trước', feed: 'Thành trước · Vách liên thất', t0: 5.4},
  {k: 'lcx', z: 'lat', c: '#16A34A', ab: 'LCx', name: 'Động mạch mũ', feed: 'Thành bên', t0: 7.8},
];
const CoronaryScene: React.FC = () => {
  const t = useT();
  const beat = useBeat();
  const cur = t >= 10 ? -1 : ART.reduce((a, x, i) => (t >= x.t0 ? i : a), -1);
  const A = cur >= 0 ? ART[cur] : null;
  const lt = A ? t - A.t0 : 0;
  return (
    <LightBg>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart4 id="cor" x={150} y={70} s={1.55} prog={dp(t, 0, 1.6)} art={dp(t, 0.9, 1.6)} labelA={ap(t, 2.2)} beat={beat}
          hot={A ? A.k : null} zone={A ? A.z : null} zoneC={A ? A.c : '#FF3B3B'} zoneA={A ? ap(lt, 0.4, 0.6) : 0} occl={0} />
      </svg>
      <div style={{position: 'absolute', left: 1010, top: 110, fontFamily: FONT, fontSize: 50, fontWeight: 800, color: '#1F2937', opacity: ap(t, 0.4)}}>3 động mạch vành</div>
      <div style={{position: 'absolute', left: 1012, top: 178, fontFamily: HAND, fontSize: 34, color: '#C81E3A', opacity: ap(t, 1.0), transform: 'rotate(-1.5deg)'}}>ai nuôi vùng nào?</div>
      {ART.map((x, i) => {
        const a = ap(t, x.t0, 0.5);
        const on = cur === i;
        return (
          <div key={x.ab} style={{position: 'absolute', left: 1010, top: 250 + i * 170, width: 820, height: 146, borderRadius: 20, background: on ? '#FFFFFF' : 'rgba(255,255,255,0.72)', border: `3px solid ${on ? x.c : 'rgba(31,41,55,0.10)'}`, boxShadow: on ? `0 18px 40px ${x.c}33` : '0 8px 20px rgba(0,0,0,0.06)', opacity: a, transform: `translateX(${(1 - a) * 60}px) scale(${on ? 1.02 : 1})`, display: 'flex', alignItems: 'center', gap: 26, padding: '0 30px', boxSizing: 'border-box'}}>
            <div style={{width: 120, height: 92, borderRadius: 16, background: x.c, color: '#fff', fontFamily: MONO, fontSize: 38, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{x.ab}</div>
            <div>
              <div style={{fontFamily: FONT, fontSize: 30, fontWeight: 700, color: '#374151'}}>{x.name}</div>
              <div style={{fontFamily: FONT, fontSize: 36, fontWeight: 800, color: x.c, marginTop: 4}}>→ {x.feed}</div>
            </div>
          </div>
        );
      })}
      {/* ghi nhớ: chuỗi nhân quả */}
      {(() => {
        const a = ap(t, 10.0, 0.6);
        const steps = ['Tắc nhánh', 'Vùng thiếu máu', 'Chuyển đạo nhìn vùng đó', 'ST chênh lên'];
        return (
          <div style={{position: 'absolute', left: 1010, top: 770, width: 820, padding: '18px 24px', borderRadius: 18, background: '#FFF4C2', border: '2px solid #E8C547', opacity: a, transform: `translateY(${(1 - a) * 20}px)`, boxSizing: 'border-box'}}>
            <div style={{fontFamily: FONT, fontSize: 22, fontWeight: 800, letterSpacing: 2, color: '#8A6D00'}}>GHI NHỚ</div>
            <div style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 6, fontFamily: FONT, fontSize: 29, fontWeight: 800, color: '#26221C'}}>
              {steps.map((s, i) => (
                <React.Fragment key={s}>
                  <span style={{opacity: ap(t, 10.2 + i * 0.35, 0.4), color: i === 3 ? '#C81E3A' : undefined}}>{s}</span>
                  {i < 3 && <span style={{opacity: ap(t, 10.35 + i * 0.35, 0.3), color: '#9CA3AF'}}>→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      })()}
    </LightBg>
  );
};

// ---------- Cảnh 3: tắc RCA → thành dưới → II, III, aVF chênh lên; I, aVL soi gương ----------
const MM = 7, PXS = 25 * MM, PXMV = 10 * MM;
const PX = 830, PY = 110, PW = 1010, PH = 780;
const STRIPS: [string, number][] = [['II', 0], ['III', 1], ['aVF', 2], ['I', 3.35], ['aVL', 4.35]];
const ROWH = 128, Y0 = 92;
const rowY = (k: number) => Y0 + k * ROWH; // đường đẳng điện
const LX = 90, SDUR = 3.0;
const stY = (ld: string, beatIdx = 1) => {
  const L: Lead = INFERIOR[ld];
  const T = 0.28 + beatIdx * 0.8 + 0.08; // 80 ms sau đỉnh R
  return {x: LX + T * PXS, v: ecgAt(T, L, 0.8)};
};
const InferiorScene: React.FC = () => {
  const t = useT();
  const beat = useBeat();
  const grid: React.ReactNode[] = [];
  for (let i = 0; i <= PW / MM; i++) grid.push(<line key={'v' + i} x1={i * MM} x2={i * MM} y1={0} y2={PH} stroke={i % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={i % 5 ? 0.6 : 1.2} />);
  for (let j = 0; j <= PH / MM; j++) grid.push(<line key={'h' + j} x1={0} x2={PW} y1={j * MM} y2={j * MM} stroke={j % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={j % 5 ? 0.6 : 1.2} />);
  const slide = 1 - ap(t, 0.2, 0.9);
  const upA = dp(t, 3.4, 0.8), dnA = dp(t, 5.6, 0.8), cmp = dp(t, 7.6, 0.6);
  const s2 = stY('II'), s3 = stY('III');
  // khung tim
  const HXo = 40, HYo = 120, HS = 1.32;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 40% 35%, #3a4a52, #1d272c 75%)'}}>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(95deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 9px)'}} />
      {/* tấm thẻ tim */}
      <div style={{position: 'absolute', left: HXo, top: HYo - 20, width: 740, height: 800, borderRadius: 6, background: '#FCFAF4', boxShadow: '0 24px 50px rgba(0,0,0,0.45)', transform: `rotate(-1deg) translateX(${(1 - ap(t, 0, 0.8)) * -600}px)`}}>
        <div style={{position: 'absolute', left: 30, top: 18, fontFamily: HAND, fontSize: 40, color: '#1E1E24'}}>Tắc động mạch vành phải</div>
        <svg viewBox="0 0 740 800" width={740} height={800} style={{position: 'absolute', inset: 0}}>
          <Heart4 id="inf" x={40} y={70} s={HS} prog={dp(t, 0.2, 1.4)} art={dp(t, 0.6, 1.2)} labelA={ap(t, 1.6)} beat={beat}
            hot="rca" occl={dp(t, 1.0, 0.6)} zone="inf" zoneC="#E11D48" zoneA={ap(t, 2.0, 0.8)} />
          {/* nhãn vẽ tay vùng thành dưới */}
          <g opacity={ap(t, 2.4, 0.5)}>
            <RArrow x1={210} y1={735} x2={40 + 262 * HS} y2={70 + 462 * HS} prog={dp(t, 2.4, 0.5)} stroke="#C81E3A" sw={3.5} curve={-0.25} seed={7} head={16} />
            <text x={40} y={760} fontFamily={HAND} fontSize={38} fill="#C81E3A">thành dưới</text>
          </g>
        </svg>
      </div>
      {/* tờ giấy ECG */}
      <div style={{position: 'absolute', left: PX, top: PY, width: PW, height: PH, transform: `translateY(${slide * 1000}px) rotate(0.6deg)`, boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
        <svg viewBox={`0 0 ${PW} ${PH}`} width={PW} height={PH} style={{position: 'absolute', inset: 0}}>
          <rect width={PW} height={PH} fill="#FFF6F2" />
          {grid}
          {/* dạ quang nhóm */}
          <rect x={14} y={rowY(0) - 70} width={(PW - 28) * upA} height={3 * ROWH - 4} rx={14} fill="rgba(251,113,133,0.22)" style={{mixBlendMode: 'multiply'}} />
          <rect x={14} y={rowY(3.35) - 70} width={(PW - 28) * dnA} height={2 * ROWH - 10} rx={14} fill="rgba(96,165,250,0.22)" style={{mixBlendMode: 'multiply'}} />
          {STRIPS.map(([ld, k], i) => {
            const y0 = rowY(k);
            const pr = dp(t, 0.8 + i * 0.25, 1.0);
            return (
              <g key={ld}>
                <text x={18} y={y0 - 34} fontFamily={MONO} fontSize={28} fontWeight={700} fill="#1E1E24" opacity={ap(t, 0.6 + i * 0.25)}>{ld}</text>
                <polyline points={tracePts(LX, y0, 0, SDUR, PXS, PXMV, INFERIOR[ld], 0.8, 0.004)} fill="none" stroke="#1E1E24" strokeWidth={2.2} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pr} />
              </g>
            );
          })}
          {/* nhãn ↑ / ↓ vẽ tay */}
          <text x={650} y={rowY(0) + 10} fontFamily={HAND} fontSize={46} fill="#C81E3A" opacity={ap(t, 4.0)} transform={`rotate(-3 650 ${rowY(0)})`}>ST ↑ II · III · aVF</text>
          <text x={650} y={rowY(3.85) + 10} fontFamily={HAND} fontSize={46} fill="#2563EB" opacity={ap(t, 6.2)} transform={`rotate(-3 650 ${rowY(3.85)})`}>ST ↓ soi gương</text>
          <RPath d={`M10,${rowY(0) - 80} C-6,${rowY(1)} -6,${rowY(2)} 10,${rowY(2) + 50}`} stroke="#C81E3A" sw={5} rough={1.2} seed={31} prog={dp(t, 3.8, 0.6)} />
          <RPath d={`M10,${rowY(3.35) - 74} C-4,${rowY(3.85)} -4,${rowY(4.35)} 10,${rowY(4.35) + 44}`} stroke="#2563EB" sw={5} rough={1.2} seed={33} prog={dp(t, 6.0, 0.6)} />
          {/* so sánh độ chênh ST: III > II */}
          {cmp > 0 && (
            <g opacity={cmp}>
              {[[s2, rowY(0)], [s3, rowY(1)]].map(([s, y0], i) => {
                const S = s as {x: number; v: number};
                const yy = (y0 as number) - S.v * PXMV;
                return (
                  <g key={i}>
                    <line x1={S.x - 34} x2={S.x + 34} y1={y0 as number} y2={y0 as number} stroke="#C81E3A" strokeWidth={2} strokeDasharray="5 4" />
                    <line x1={S.x} x2={S.x} y1={y0 as number} y2={yy} stroke="#C81E3A" strokeWidth={4} />
                    <circle cx={S.x} cy={yy} r={6} fill="#C81E3A" />
                  </g>
                );
              })}
            </g>
          )}
        </svg>
        <div style={{position: 'absolute', right: 30, bottom: 14, fontFamily: MONO, fontSize: 18, color: '#9b6b64'}}>25 mm/s · 10 mm/mV</div>
      </div>
      {/* giấy note */}
      <div style={{position: 'absolute', left: 1490, top: 300, width: 320, padding: '18px 22px', background: '#FFE873', boxShadow: '0 12px 28px rgba(0,0,0,0.35)', transform: `rotate(-3deg) translateY(${(1 - ap(t, 7.9)) * 30}px)`, opacity: ap(t, 7.9), fontFamily: FONT, fontSize: 34, fontWeight: 800, color: '#26221C', lineHeight: 1.3}}>
        ST ở III &gt; II<br /><span style={{color: '#C81E3A'}}>→ nghĩ RCA</span>
      </div>
    </AbsoluteFill>
  );
};

const SC = [CoronaryScene, StagesScene, InferiorScene, TableHand];
export const Demo2: React.FC = () => (
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
