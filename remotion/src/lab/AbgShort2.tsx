// SHORT 9:16 — Giải mã khí máu · Vì sao thở nhanh lại làm kiềm máu?
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, Easing, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import data from '../data.json';
import {FONT} from '../lib';

const K = {txt: '#F2F7F9', dim: '#A7BAC4', ink: '#22303A', amber: '#F5B83D', co2: '#38A7DD', hco3: '#F2813D', o2: '#E5484D', green: '#3FB27F', line: 'rgba(190,220,235,.22)'};
const ap = (t: number, s: number, d = 0.45) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1)});
const useSec = () => useCurrentFrame() / 30;
const usePop = (s: number, damping = 12) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - s * fps, fps, config: {damping, stiffness: 150, mass: 0.7}});
};
const chem = (s: string) => {
  const out: React.ReactNode[] = [];
  s.split(/(₂|₃⁻)/).forEach((p, i) => {
    if (p === '₂') out.push(<sub key={i} style={{fontSize: '.6em', lineHeight: 0}}>2</sub>);
    else if (p === '₃⁻') out.push(<span key={i}><sub style={{fontSize: '.6em', lineHeight: 0}}>3</sub><sup style={{fontSize: '.6em', lineHeight: 0}}>−</sup></span>);
    else out.push(p);
  });
  return out;
};

const Bg: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: 'linear-gradient(170deg,#10262F 0%,#0D1B24 55%,#0A161E 100%)'}}>
      <div style={{position: 'absolute', left: -200 + Math.sin(f / 80) * 60, top: 200, width: 1100, height: 1100, background: 'radial-gradient(closest-side,rgba(60,145,170,.28),transparent)'}} />
      <div style={{position: 'absolute', right: -300, bottom: 200 + Math.cos(f / 90) * 60, width: 1000, height: 1000, background: 'radial-gradient(closest-side,rgba(190,60,80,.16),transparent)'}} />
    </AbsoluteFill>
  );
};

const TopBar: React.FC = () => {
  const f = useCurrentFrame();
  const n = data.scenes.length;
  return (
    <>
      <div style={{position: 'absolute', left: 60, right: 60, top: 70, display: 'flex', gap: 10}}>
        {data.scenes.map((s, i) => {
          const p = Math.min(1, Math.max(0, (f - s.from) / s.dur));
          return <div key={i} style={{flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,.18)', overflow: 'hidden'}}><div style={{width: `${p * 100}%`, height: '100%', background: K.amber}} /></div>;
        })}
      </div>
      <div style={{position: 'absolute', left: 60, top: 98, fontFamily: FONT, fontSize: 32, fontWeight: 800, letterSpacing: 2, color: K.dim}}>GIẢI MÃ KHÍ MÁU · {n >= 0 ? 'BÀI 2' : ''}</div>
    </>
  );
};

const BigCap: React.FC = () => {
  const f = useCurrentFrame();
  const sc = data.scenes.find((s) => f >= s.from && f < s.from + s.dur);
  if (!sc) return null;
  const t = (f - sc.from) / data.fps;
  const s = sc.sents[0];
  const a = Math.min(1, Math.max(0, (t - s.start + 0.1) / 0.25));
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1330, display: 'flex', justifyContent: 'center', opacity: a}}>
      <div style={{padding: '22px 36px', borderRadius: 28, background: 'rgba(6,11,22,.88)', border: '2px solid rgba(160,185,225,.2)', fontFamily: FONT, fontSize: 50, fontWeight: 700, lineHeight: 1.3, color: K.txt, textAlign: 'center', textWrap: 'balance' as any}}>
        {chem(s.text)}
      </div>
    </div>
  );
};

const StepHead: React.FC<{n: string; word: string; sub: string; c: string}> = ({n, word, sub, c}) => {
  const p = usePop(0.05);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 190, display: 'flex', alignItems: 'center', gap: 34, fontFamily: FONT, opacity: Math.min(1, p * 1.4), transform: `translateX(${(1 - p) * -60}px)`}}>
      <div style={{width: 160, height: 160, borderRadius: '50%', background: c, color: '#0D1B24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100, fontWeight: 800, flex: 'none', boxShadow: `0 0 40px ${c}66`}}>{n}</div>
      <div>
        <div style={{fontSize: 92, fontWeight: 800, color: K.txt, lineHeight: 1}}>{word}</div>
        <div style={{fontSize: 42, fontWeight: 600, color: c, marginTop: 12}}>{chem(sub)}</div>
      </div>
    </div>
  );
};

const Badge: React.FC<{s0: number; c?: string; children: string}> = ({s0, c = K.amber, children}) => {
  const p = usePop(s0, 10);
  if (p <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1130, display: 'flex', justifyContent: 'center'}}>
      <div style={{padding: '14px 44px', borderRadius: 24, background: `linear-gradient(135deg,#FFD46B,${c})`, color: K.ink, fontFamily: FONT, fontSize: 64, fontWeight: 800, boxShadow: '0 16px 40px rgba(0,0,0,.5)', transform: `scale(${p}) rotate(-2deg)`}}>{chem(children)}</div>
    </div>
  );
};

const LungImg: React.FC<{x: number; y: number; w: number; s?: number; o?: number}> = ({x, y, w, s = 1, o = 1}) => (
  <img src={staticFile('abg_phoi.png')} style={{position: 'absolute', left: x, top: y, width: w, transform: `scale(${s})`, transformOrigin: '50% 40%', opacity: o, filter: 'drop-shadow(0 20px 36px rgba(0,0,0,.5))'}} />
);
// bọt CO₂ bay lên từ khí quản (tâm x, đỉnh y)
const Co2Up: React.FC<{x: number; y: number; n: number; speed: number; a: number; spread?: number}> = ({x, y, n, speed, a, spread = 60}) => {
  const f = useCurrentFrame();
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, overflow: 'visible'}}>
      {Array.from({length: n}, (_, i) => {
        const u = (f / speed + i / n) % 1;
        return (
          <g key={i} transform={`translate(${x + Math.sin(i * 2.3 + u * 3) * spread * u},${y - u * 260})`} opacity={a * (1 - u)}>
            <circle r={30} fill={K.co2} /><text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill="#fff">CO₂</text>
          </g>
        );
      })}
    </svg>
  );
};
const Title: React.FC<{children: React.ReactNode; sub?: string; c?: string}> = ({children, sub, c = K.amber}) => {
  const p = usePop(0.05);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 190, textAlign: 'center', fontFamily: FONT, opacity: Math.min(1, p * 1.4), transform: `scale(${0.92 + 0.08 * p})`}}>
      <div style={{fontSize: 96, fontWeight: 900, color: c, lineHeight: 1.05}}>{children}</div>
      {sub ? <div style={{fontSize: 50, fontWeight: 700, color: K.txt, marginTop: 16}}>{chem(sub)}</div> : null}
    </div>
  );
};

// 0 Hook
const S0: React.FC = () => {
  const t = useSec();
  const f = useCurrentFrame();
  const br = 1 + 0.06 * Math.sin(f / 4);
  return (
    <>
      <Title sub="có thể làm máu bị KIỀM?">THỞ QUÁ NHANH</Title>
      <LungImg x={260} y={450} w={560} s={br} o={ap(t, 0.2)} />
      <Co2Up x={540} y={480} n={8} speed={22} a={ap(t, 0.5)} />
      <Badge s0={1.4} c="#7DA8F0">pH ↑ ?</Badge>
    </>
  );
};

// 1 CO₂ là acid
const S1: React.FC = () => {
  const t = useSec();
  const f = useCurrentFrame();
  const br = 1 + 0.025 * Math.sin(f / 14);
  return (
    <>
      <Title sub="acid bay hơi">CO₂ LÀ MỘT ACID</Title>
      <LungImg x={270} y={450} w={540} s={br} o={ap(t, 0.2)} />
      <Co2Up x={540} y={480} n={4} speed={45} a={ap(t, 0.6)} />
      <Badge s0={1.6} c={K.co2}>Thải ra qua phổi</Badge>
    </>
  );
};

// 2 Thở nhanh → PaCO₂ giảm
const S2: React.FC = () => {
  const t = useSec();
  const f = useCurrentFrame();
  const br = 1 + 0.06 * Math.sin(f / 4);
  const v = Math.round(interpolate(t, [1.0, 3.6], [40, 25], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return (
    <>
      <Title sub="phổi thải nhiều CO₂">THỞ NHANH, SÂU</Title>
      <LungImg x={60} y={520} w={520} s={br} o={ap(t, 0.2)} />
      <Co2Up x={315} y={545} n={10} speed={20} a={ap(t, 0.4)} spread={80} />
      <div style={{position: 'absolute', left: 620, top: 620, width: 400, height: 380, borderRadius: 34, background: 'rgba(56,167,221,.14)', border: `4px solid ${K.co2}`, fontFamily: FONT, textAlign: 'center', opacity: ap(t, 0.8)}}>
        <div style={{fontSize: 52, fontWeight: 800, color: K.co2, marginTop: 40}}>PaCO<sub style={{fontSize: '.6em'}}>2</sub></div>
        <div style={{fontSize: 150, fontWeight: 900, color: K.txt, lineHeight: 1.1}}>{v}</div>
        <div style={{fontSize: 40, fontWeight: 700, color: K.dim}}>mmHg ↓</div>
      </div>
    </>
  );
};

// phân số HCO₃⁻ / CO₂
const Frac: React.FC<{den: string; denC?: string; scale?: number; ratio: string; rc: string; a: number}> = ({den, denC = K.co2, scale = 1, ratio, rc, a}) => (
  <div style={{position: 'absolute', left: 60, right: 60, top: 470, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 50, fontFamily: FONT, opacity: a}}>
    <div style={{textAlign: 'center', width: 420}}>
      <div style={{fontSize: 48, fontWeight: 800, color: K.hco3}}>HCO<sub style={{fontSize: '.6em'}}>3</sub><sup style={{fontSize: '.6em'}}>−</sup></div>
      <div style={{fontSize: 140, fontWeight: 900, color: K.txt, lineHeight: 1.05}}>24</div>
      <div style={{height: 10, borderRadius: 5, background: K.txt, margin: '18px 0'}} />
      <div style={{fontSize: 140 * scale, fontWeight: 900, color: denC, lineHeight: 1.05}}>{den}</div>
      <div style={{fontSize: 40, fontWeight: 700, color: K.co2}}>0,03 × PaCO<sub style={{fontSize: '.6em'}}>2</sub></div>
    </div>
    <div style={{fontSize: 90, fontWeight: 900, color: K.dim}}>=</div>
    <div style={{fontSize: 120, fontWeight: 900, color: rc, whiteSpace: 'nowrap'}}>{ratio}</div>
  </div>
);

// 3 Tỉ số 20:1
const S3: React.FC = () => {
  const t = useSec();
  return (
    <>
      <Title sub="quyết định pH">TỈ SỐ</Title>
      <Frac den="1,2" ratio="20 : 1" rc={K.amber} a={ap(t, 0.3)} />
      <Badge s0={1.8} c={K.green}>20 : 1 → pH 7,40</Badge>
    </>
  );
};

// 4 CO₂ giảm → kiềm hô hấp
const S4: React.FC = () => {
  const t = useSec();
  const k = interpolate(t, [0.6, 2.0], [1, 0.62], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const big = t > 1.6;
  return (
    <>
      <Title sub="tỉ số tăng · pH tăng" c="#7DA8F0">CO₂ GIẢM</Title>
      <Frac den={k < 0.8 ? '0,75' : '1,2'} scale={k} ratio={big ? '> 20 : 1' : '20 : 1'} rc={big ? '#7DA8F0' : K.amber} a={1} />
      <Badge s0={2.4} c="#7DA8F0">KIỀM HÔ HẤP</Badge>
    </>
  );
};

// 5 Hay gặp khi
const S5: React.FC = () => {
  const items: [string, string][] = [['Lo âu', K.amber], ['Đau', K.o2], ['Sốt', K.hco3], ['Thở máy quá nhanh', K.co2]];
  return (
    <>
      <Title>HAY GẶP KHI</Title>
      <div style={{position: 'absolute', left: 90, right: 90, top: 400, display: 'flex', flexDirection: 'column', gap: 34}}>
        {items.map(([w, c], i) => <Chip key={w} w={w} c={c} s0={0.3 + i * 0.5} n={i + 1} />)}
      </div>
    </>
  );
};
const Chip: React.FC<{w: string; c: string; s0: number; n: number}> = ({w, c, s0, n}) => {
  const p = usePop(s0, 11);
  return (
    <div style={{height: 170, borderRadius: 30, background: `${c}22`, border: `4px solid ${c}`, display: 'flex', alignItems: 'center', gap: 34, padding: '0 40px', fontFamily: FONT, transform: `scale(${p})`, opacity: Math.min(1, p * 1.5)}}>
      <div style={{width: 104, height: 104, borderRadius: '50%', background: c, color: '#0D1B24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 62, fontWeight: 800, flex: 'none'}}>{n}</div>
      <div style={{fontSize: 74, fontWeight: 800, color: K.txt}}>{w}</div>
    </div>
  );
};

// 6 CTA
const S6: React.FC = () => {
  const t = useSec();
  const p = usePop(0.1);
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 300, textAlign: 'center', fontFamily: FONT, opacity: Math.min(1, p * 1.4), transform: `scale(${0.9 + 0.1 * p})`}}>
      <svg width={200} height={240} viewBox="0 0 200 240" style={{transform: `translateY(${Math.sin(f / 8) * 8}px)`}}><path d="M30,10 L170,10 L170,230 L100,175 L30,230 Z" fill={K.amber} stroke="#7A5608" strokeWidth={6} strokeLinejoin="round" /></svg>
      <div style={{fontSize: 96, fontWeight: 900, color: K.amber, marginTop: 30}}>LƯU LẠI ĐỂ ÔN</div>
      <div style={{fontSize: 56, fontWeight: 700, color: K.txt, marginTop: 30, lineHeight: 1.25, opacity: ap(t, 0.8)}}>Xem bài đầy đủ<br />“Giải mã khí máu · Bài 2”</div>
      <div style={{fontSize: 44, fontWeight: 600, color: K.dim, marginTop: 40, opacity: ap(t, 1.4)}}>Bài 3: Đánh giá oxy hoá</div>
    </div>
  );
};

const SC = [S0, S1, S2, S3, S4, S5, S6];

export const AbgShort2: React.FC = () => (
  <AbsoluteFill style={{background: '#0D1B24'}}>
    <Audio src={staticFile('narration.m4a')} />
    <Bg />
    {data.scenes.map((s, i) => {
      const C = SC[i];
      if (!C) return null;
      return (
        <Sequence key={i} from={s.from} durationInFrames={s.dur} layout="none">
          <AbsoluteFill><C /></AbsoluteFill>
        </Sequence>
      );
    })}
    <TopBar />
    <BigCap />
  </AbsoluteFill>
);
