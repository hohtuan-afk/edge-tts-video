// SHORT 9:16 — Giải mã sốc · Huyết áp bình thường vẫn có thể đang sốc?
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
      <div style={{position: 'absolute', left: 60, top: 98, fontFamily: FONT, fontSize: 32, fontWeight: 800, letterSpacing: 2, color: K.dim}}>GIẢI MÃ SỐC · {n >= 0 ? 'BÀI 1' : ''}</div>
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






const Big2: React.FC<{c: string; head: string; body: string; s0?: number}> = ({c, head, body, s0 = 0.2}) => {
  const p = usePop(s0);
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 520, padding: '60px 30px', borderRadius: 40, background: `${c}22`, border: `6px solid ${c}`, textAlign: 'center', fontFamily: FONT, opacity: Math.min(1, p * 1.4), transform: `scale(${0.9 + 0.1 * p})`, boxShadow: `0 0 60px ${c}44`}}>
      <div style={{fontSize: 56, fontWeight: 900, color: c}}>{chem(head)}</div>
      <div style={{fontSize: 92, fontWeight: 900, color: K.txt, marginTop: 24, lineHeight: 1.15}}>{chem(body)}</div>
    </div>
  );
};

const NA = '#E8A13A', WATER = '#38A7DD';
// cốc nước: đáy tại y=bottom, cao tối đa 520, mực nước level (px), n hạt Na⁺
const Cup: React.FC<{x: number; bottom: number; level: number; n: number; label: string; val: string; c: string; a?: number}> = ({x, bottom, level, n, label, val, c, a = 1}) => {
  const f = useCurrentFrame();
  const W = 300, H = 520;
  return (
    <div style={{position: 'absolute', left: x, top: bottom - H, width: W, height: H, opacity: a, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 0, bottom: 0, width: W, height: level, borderRadius: '0 0 34px 34px', background: `linear-gradient(180deg,${WATER}99,${WATER}55)`}} />
      {Array.from({length: n}, (_, i) => {
        const cx = 60 + (i % 3) * 90, cy = 30 + Math.floor(i / 3) * Math.max(90, (level - 110) * 0.7) + (i % 3) * 22;
        return <div key={i} style={{position: 'absolute', left: cx - 26, bottom: cy + Math.sin(f / 12 + i) * 6, width: 52, height: 52, borderRadius: '50%', background: NA, color: '#2A1A05', fontSize: 22, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,.4)'}}>Na⁺</div>;
      })}
      <div style={{position: 'absolute', inset: 0, border: '6px solid rgba(220,240,250,.75)', borderTop: 'none', borderRadius: '0 0 40px 40px'}} />
      <div style={{position: 'absolute', left: -60, right: -60, top: H + 18, textAlign: 'center', fontSize: 40, fontWeight: 800, color: K.dim, whiteSpace: 'nowrap'}}>{label}</div>
      <div style={{position: 'absolute', left: -60, right: -60, top: -90, textAlign: 'center', fontSize: 66, fontWeight: 900, color: c, whiteSpace: 'nowrap'}}>{chem(val)}</div>
    </div>
  );
};

const KC = '#9B7CF0';
const Rule: React.FC<{n: string; c: string; head: string; body: string; children?: React.ReactNode}> = ({n, c, head, body, children}) => {
  const t = useSec();
  const p = usePop(0.15, 10);
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center'}}>
        <div style={{width: 220, height: 220, borderRadius: '50%', background: c, color: K.ink, fontFamily: FONT, fontSize: 150, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`, boxShadow: `0 0 60px ${c}88`}}>{n}</div>
      </div>
      <div style={{position: 'absolute', left: 70, right: 70, top: 500, textAlign: 'center', fontFamily: FONT, opacity: ap(t, 0.5)}}>
        <div style={{fontSize: 84, fontWeight: 900, color: c, lineHeight: 1.1}}>{chem(head)}</div>
        <div style={{fontSize: 58, fontWeight: 800, color: K.txt, marginTop: 20, lineHeight: 1.2}}>{chem(body)}</div>
      </div>
      {children}
    </>
  );
};
const KD: React.FC<{x: number; y: number; a?: number; r?: number}> = ({x, y, a = 1, r = 30}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: KC, color: '#fff', fontFamily: FONT, fontSize: r * 0.75, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: a}}>K⁺</div>
);
const CellK: React.FC<{dir: 1 | -1; s0: number}> = ({dir, s0}) => {
  const t = useSec();
  const u = ap(t, s0, 2);
  return (
    <>
      <img src={staticFile('dg_tebao.png')} style={{position: 'absolute', left: 290, top: 520, width: 500, opacity: ap(t, 0.1)}} />
      {Array.from({length: 10}, (_, i) => {
        const ang = (i / 10) * Math.PI * 2;
        const r0 = dir === 1 ? 90 : 360, r1 = dir === 1 ? 380 : 110;
        const r = r0 + (r1 - r0) * u * (0.6 + 0.4 * ((i % 3) / 2));
        return <KD key={i} x={540 + r * Math.cos(ang)} y={770 + r * 0.9 * Math.sin(ang)} a={ap(t, 0.2)} />;
      })}
    </>
  );
};

const RED = K.o2;
const S0: React.FC = () => {
  const t = useSec();
  const f = useCurrentFrame();
  const q = ap(t, 1.4);
  return (
    <>
      <Title c={K.green} sub="mà vẫn ĐANG SỐC?">HA BÌNH THƯỜNG</Title>
      <div style={{position: 'absolute', left: 190, right: 190, top: 520, height: 420, borderRadius: 40, border: `6px solid ${K.green}`, background: '#06140F', textAlign: 'center', fontFamily: FONT, opacity: ap(t, 0.3)}}>
        <div style={{fontSize: 46, fontWeight: 800, color: K.green, marginTop: 40, letterSpacing: 3}}>HUYẾT ÁP</div>
        <div style={{fontSize: 190, fontWeight: 900, color: K.txt, lineHeight: 1.1}}>110/70</div>
        <div style={{fontSize: 70, fontWeight: 900, color: K.green}}>✓</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 960, textAlign: 'center', fontFamily: FONT, fontSize: 260, fontWeight: 900, color: RED, lineHeight: 1, opacity: q, transform: `scale(${(0.6 + 0.4 * q) * (1 + 0.04 * Math.sin(f / 6))})`, textShadow: `0 0 60px ${RED}88`}}>?</div>
    </>
  );
};
const S1: React.FC = () => {
  const t = useSec();
  const f = useCurrentFrame();
  const fade = ap(t, 1.2, 1.5);
  return (
    <>
      <Title c={RED} sub="tế bào THIẾU OXY">SỐC</Title>
      <img src={staticFile('dg_tebao.png')} style={{position: 'absolute', left: 260, top: 520, width: 560, opacity: ap(t, 0.2), filter: `saturate(${1 - 0.6 * fade}) brightness(${1 - 0.3 * fade})`}} />
      {Array.from({length: 8}, (_, i) => {
        const ang = (i / 8) * Math.PI * 2 + f / 50;
        const r = 330 + 40 * fade;
        return <div key={i} style={{position: 'absolute', left: 540 + r * Math.cos(ang) - 40, top: 800 + r * 0.85 * Math.sin(ang) - 40, width: 80, height: 80, borderRadius: '50%', background: WATER, color: '#fff', fontFamily: FONT, fontSize: 32, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ap(t, 0.3) * (i < 2 ? 1 : 1 - fade)}}>O<sub style={{fontSize: 18}}>2</sub></div>;
      })}
    </>
  );
};
const S2: React.FC = () => {
  const t = useSec();
  const f = useCurrentFrame();
  const ph = (f % 14) / 14;
  const beat = 1 + 0.06 * Math.exp(-Math.pow((ph - 0.1) / 0.07, 2));
  const sq = ap(t, 1.2, 1.5);
  const th = 150 - 80 * sq;
  return (
    <>
      <Title c={K.amber} sub="huyết áp vẫn còn giữ">BÙ TRỪ</Title>
      <img src={staticFile('dg_tim.png')} style={{position: 'absolute', left: 350, top: 460, width: 380, opacity: ap(t, 0.2), transform: `scale(${beat})`, filter: 'drop-shadow(0 0 30px rgba(229,72,77,.5))'}} />
      <div style={{position: 'absolute', left: 100, top: 1050, width: 400, textAlign: 'center', fontFamily: FONT, fontSize: 48, fontWeight: 900, color: RED, opacity: ap(t, 0.5)}}>tim đập nhanh</div>
      <div style={{position: 'absolute', left: 580, top: 1050, width: 400, textAlign: 'center', fontFamily: FONT, fontSize: 48, fontWeight: 900, color: K.amber, opacity: ap(t, 1.2)}}>mạch co lại</div>
      <div style={{position: 'absolute', left: 140, right: 140, top: 1215 - th / 2, height: th, borderRadius: th / 2, background: 'linear-gradient(180deg,#7A1E2B,#B8343F 50%,#7A1E2B)', opacity: ap(t, 0.8)}} />
    </>
  );
};
const S3: React.FC = () => (
  <>
    <Title c={K.amber} sub="nhìn tưới máu">3 CỬA SỔ</Title>
    <div style={{position: 'absolute', left: 90, right: 90, top: 520, display: 'flex', flexDirection: 'column', gap: 50}}>
      <Chip w="Da lạnh · nổi bông" c="#E8B48F" s0={0.3} n={1} />
      <Chip w="Nước tiểu ít" c={K.amber} s0={1.2} n={2} />
      <Chip w="Lơ mơ" c={KC} s0={2.0} n={3} />
    </div>
  </>
);
const S4: React.FC = () => {
  const t = useSec();
  const v = Math.min(4.5, Math.max(0, (t - 1.2) * 2));
  const fr = v / 6, ang = fr * Math.PI * 2 - Math.PI / 2;
  return (
    <>
      <Title c={RED} sub="hai con số kèm theo">ĐO THÊM</Title>
      <div style={{position: 'absolute', left: 90, width: 420, top: 560, height: 520, borderRadius: 40, border: `6px solid ${RED}`, background: `${RED}1c`, textAlign: 'center', fontFamily: FONT, opacity: ap(t, 0.3)}}>
        <div style={{fontSize: 56, fontWeight: 900, color: RED, marginTop: 60}}>LACTATE</div>
        <div style={{fontSize: 150, fontWeight: 900, color: K.txt, marginTop: 40}}>&gt; 2</div>
        <div style={{fontSize: 42, fontWeight: 700, color: K.dim}}>mmol/L</div>
      </div>
      <div style={{position: 'absolute', left: 570, width: 420, top: 560, height: 520, borderRadius: 40, border: `6px solid ${WATER}`, background: `${WATER}1c`, textAlign: 'center', fontFamily: FONT, opacity: ap(t, 1.0)}}>
        <div style={{fontSize: 56, fontWeight: 900, color: WATER, marginTop: 60}}>CRT</div>
        <svg width={300} height={300} viewBox="-150 -150 300 300" style={{marginTop: 20}}>
          <circle r={120} fill="none" stroke="#1F3A47" strokeWidth={22} />
          {fr > 0.001 ? <path d={`M0,-120 A120,120 0 ${fr > 0.5 ? 1 : 0},1 ${(120 * Math.cos(ang)).toFixed(1)},${(120 * Math.sin(ang)).toFixed(1)}`} fill="none" stroke={v > 3 ? RED : K.green} strokeWidth={22} strokeLinecap="round" /> : null}
          <text y={22} fontSize={64} fontWeight={900} fill="#fff" textAnchor="middle" fontFamily={FONT}>{v.toFixed(1).replace('.', ',')}s</text>
        </svg>
        <div style={{fontSize: 42, fontWeight: 800, color: K.txt}}>&gt; 3 giây</div>
      </div>
    </>
  );
};
const S5: React.FC = () => {
  const t = useSec();
  const p = usePop(0.1);
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 300, textAlign: 'center', fontFamily: FONT, opacity: Math.min(1, p * 1.4), transform: `scale(${0.9 + 0.1 * p})`}}>
      <svg width={200} height={240} viewBox="0 0 200 240" style={{transform: `translateY(${Math.sin(f / 8) * 8}px)`}}><path d="M30,10 L170,10 L170,230 L100,175 L30,230 Z" fill={K.amber} stroke="#7A5608" strokeWidth={6} strokeLinejoin="round" /></svg>
      <div style={{fontSize: 96, fontWeight: 900, color: K.amber, marginTop: 30}}>LƯU LẠI ĐỂ ÔN</div>
      <div style={{fontSize: 56, fontWeight: 700, color: K.txt, marginTop: 30, lineHeight: 1.25, opacity: ap(t, 0.8)}}>Xem Bài 1 đầy đủ<br />“Giải mã sốc”</div>
      <div style={{fontSize: 44, fontWeight: 600, color: K.dim, marginTop: 40, opacity: ap(t, 1.4)}}>Chuỗi 8 bài trên kênh</div>
    </div>
  );
};

const SC = [S0, S1, S2, S3, S4, S5];

export const SocShort1: React.FC = () => (
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
