// SHORT 9:16 — Giải mã khí máu · Công thức Winter
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
      <div style={{position: 'absolute', left: 60, top: 98, fontFamily: FONT, fontSize: 32, fontWeight: 800, letterSpacing: 2, color: K.dim}}>GIẢI MÃ KHÍ MÁU · {n >= 0 ? 'BÀI 4' : ''}</div>
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
          <g key={i} transform={`translate(${x + Math.sin(i * 2.3 + u * 3) * spread * u},${y - u * 170})`} opacity={a * (1 - u)}>
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

const Chip: React.FC<{w: string; c: string; s0: number; n: number}> = ({w, c, s0, n}) => {
  const p = usePop(s0, 11);
  return (
    <div style={{height: 170, borderRadius: 30, background: `${c}22`, border: `4px solid ${c}`, display: 'flex', alignItems: 'center', gap: 34, padding: '0 40px', fontFamily: FONT, transform: `scale(${p})`, opacity: Math.min(1, p * 1.5)}}>
      <div style={{width: 104, height: 104, borderRadius: '50%', background: c, color: '#0D1B24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 62, fontWeight: 800, flex: 'none'}}>{n}</div>
      <div style={{fontSize: 66, fontWeight: 800, color: K.txt, whiteSpace: 'nowrap'}}>{w}</div>
    </div>
  );
};



const Range: React.FC<{v: number; a: number; band?: number; c?: string}> = ({v, a, band = 1, c = K.txt}) => {
  const X0 = 110, W = 860;
  const px = (x: number) => X0 + ((x - 16) / (36 - 16)) * W;
  return (
    <div style={{position: 'absolute', left: 0, top: 700, width: 1080, height: 300, opacity: a, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: X0, top: 120, width: W, height: 20, borderRadius: 10, background: 'rgba(255,255,255,.15)'}} />
      <div style={{position: 'absolute', left: px(24), top: 90, width: px(28) - px(24), height: 80, borderRadius: 18, background: 'rgba(63,178,127,.45)', border: `4px solid ${K.green}`, opacity: band}} />
      {[16, 20, 24, 28, 32, 36].map((x) => <div key={x} style={{position: 'absolute', left: px(x) - 50, top: 190, width: 100, textAlign: 'center', fontSize: 40, fontWeight: 700, color: x === 24 || x === 28 ? K.green : K.dim}}>{x}</div>)}
      <div style={{position: 'absolute', left: px(v) - 34, top: 96, width: 68, height: 68, borderRadius: '50%', background: K.txt, border: `9px solid ${c}`, boxShadow: `0 0 30px ${c}`}} />
      <div style={{position: 'absolute', left: px(v) - 160, top: 10, width: 320, textAlign: 'center', fontSize: 44, fontWeight: 900, color: c}}>PaCO<sub style={{fontSize: '.6em'}}>2</sub> {Math.round(v)}</div>
    </div>
  );
};
const Verdict: React.FC<{s0: number; c: string; children: string}> = ({s0, c, children}) => {
  const p = usePop(s0, 10);
  return <div style={{position: 'absolute', left: 60, right: 60, top: 470, textAlign: 'center', fontFamily: FONT, fontSize: 104, fontWeight: 900, color: c, transform: `scale(${p})`, opacity: Math.min(1, p * 1.5), textShadow: `0 0 40px ${c}88`}}>{children}</div>;
};

// 0 Hook
const S0: React.FC = () => {
  const t = useSec();
  const f = useCurrentFrame();
  return (
    <>
      <Title c={K.o2} sub="phổi đã bù đủ chưa?">TOAN CHUYỂN HOÁ</Title>
      <div style={{position: 'absolute', left: 340, top: 560, width: 400, height: 400, borderRadius: '50%', border: `14px solid ${K.amber}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, opacity: ap(t, 0.6), transform: `rotate(${Math.sin(f / 5) * 3}deg)`}}>
        <div style={{textAlign: 'center'}}><div style={{fontSize: 170, fontWeight: 900, color: K.txt, lineHeight: 1}}>10</div><div style={{fontSize: 50, fontWeight: 800, color: K.amber}}>giây</div></div>
      </div>
    </>
  );
};

// 1 Công thức
const S1: React.FC = () => {
  const t = useSec();
  return (
    <>
      <Title>CÔNG THỨC WINTER</Title>
      <div style={{position: 'absolute', left: 60, right: 60, top: 430, textAlign: 'center', fontFamily: FONT}}>
        <div style={{fontSize: 70, fontWeight: 800, color: K.co2, opacity: ap(t, 0.3)}}>PaCO<sub style={{fontSize: '.6em'}}>2</sub> dự kiến =</div>
        <div style={{display: 'inline-block', marginTop: 40, padding: '24px 46px', borderRadius: 30, background: 'linear-gradient(135deg,#FFD46B,#F5B83D)', color: K.ink, fontSize: 104, fontWeight: 900, opacity: ap(t, 1.2), transform: `scale(${0.85 + 0.15 * ap(t, 1.2)})`}}>1,5 × {chem('HCO₃⁻')} + 8</div>
        <div style={{fontSize: 110, fontWeight: 900, color: K.txt, marginTop: 30, opacity: ap(t, 3.2)}}>± 2</div>
      </div>
    </>
  );
};

// 2 Ví dụ
const S2: React.FC = () => {
  const t = useSec();
  return (
    <>
      <Title sub="HCO₃⁻ = 12">VÍ DỤ</Title>
      <div style={{position: 'absolute', left: 60, right: 60, top: 450, textAlign: 'center', fontFamily: FONT, fontSize: 90, fontWeight: 900, color: K.txt, opacity: ap(t, 0.5)}}>1,5 × 12 + 8 = <span style={{color: K.amber}}>26</span></div>
      <Range v={26} a={ap(t, 2.4)} band={ap(t, 3.4)} c={K.amber} />
      <Badge s0={3.8} c={K.green}>Dự kiến 24–28</Badge>
    </>
  );
};
const MoveCase: React.FC<{to: number; c: string; title: string; v: string}> = ({to, c, title, v}) => {
  const t = useSec();
  const x = interpolate(t, [0.3, 1.4], [26, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (<><Title c={c}>{title}</Title><Range v={x} a={1} c={c} /><Verdict s0={1.5} c={c}>{v}</Verdict></>);
};
const S3: React.FC = () => <MoveCase to={26} c={K.green} title="TRONG KHOẢNG" v="BÙ ĐỦ ✓" />;
const S4: React.FC = () => <MoveCase to={33} c={K.o2} title="CAO HƠN" v="+ TOAN HÔ HẤP" />;
const S5: React.FC = () => <MoveCase to={19} c="#7DA8F0" title="THẤP HƠN" v="+ KIỀM HÔ HẤP" />;

// 6 CTA
const S6: React.FC = () => {
  const t = useSec();
  const p = usePop(0.1);
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 300, textAlign: 'center', fontFamily: FONT, opacity: Math.min(1, p * 1.4), transform: `scale(${0.9 + 0.1 * p})`}}>
      <svg width={200} height={240} viewBox="0 0 200 240" style={{transform: `translateY(${Math.sin(f / 8) * 8}px)`}}><path d="M30,10 L170,10 L170,230 L100,175 L30,230 Z" fill={K.amber} stroke="#7A5608" strokeWidth={6} strokeLinejoin="round" /></svg>
      <div style={{fontSize: 96, fontWeight: 900, color: K.amber, marginTop: 30}}>LƯU LẠI ĐỂ ÔN</div>
      <div style={{fontSize: 56, fontWeight: 700, color: K.txt, marginTop: 30, lineHeight: 1.25, opacity: ap(t, 0.8)}}>Xem bài đầy đủ<br />“Giải mã khí máu · Bài 4”</div>
      <div style={{fontSize: 44, fontWeight: 600, color: K.dim, marginTop: 40, opacity: ap(t, 1.4)}}>Bài 5: Toan chuyển hoá tăng AG</div>
    </div>
  );
};

const SC = [S0, S1, S2, S3, S4, S5, S6];

export const AbgShort4: React.FC = () => (
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
