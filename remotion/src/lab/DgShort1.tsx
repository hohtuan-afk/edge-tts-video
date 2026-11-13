// SHORT 9:16 — Giải mã điện giải · Natri 125 có phải thiếu muối?
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
      <div style={{position: 'absolute', left: 60, top: 98, fontFamily: FONT, fontSize: 32, fontWeight: 800, letterSpacing: 2, color: K.dim}}>GIẢI MÃ ĐIỆN GIẢI · {n >= 0 ? 'BÀI 1' : ''}</div>
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
        const cx = 50 + ((i * 97) % 200), cy = 40 + ((i * 61) % Math.max(60, level - 80));
        return <div key={i} style={{position: 'absolute', left: cx - 26, bottom: cy + Math.sin(f / 12 + i) * 6, width: 52, height: 52, borderRadius: '50%', background: NA, color: '#2A1A05', fontSize: 22, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,.4)'}}>Na⁺</div>;
      })}
      <div style={{position: 'absolute', inset: 0, border: '6px solid rgba(220,240,250,.75)', borderTop: 'none', borderRadius: '0 0 40px 40px'}} />
      <div style={{position: 'absolute', left: -60, right: -60, top: H + 18, textAlign: 'center', fontSize: 40, fontWeight: 800, color: K.dim, whiteSpace: 'nowrap'}}>{label}</div>
      <div style={{position: 'absolute', left: -60, right: -60, top: -90, textAlign: 'center', fontSize: 66, fontWeight: 900, color: c, whiteSpace: 'nowrap'}}>{chem(val)}</div>
    </div>
  );
};

const S0: React.FC = () => {
  const t = useSec();
  return (
    <>
      <Title c={NA} sub="có phải là thiếu muối?">Natri máu 125</Title>
      <div style={{position: 'absolute', left: 60, right: 60, top: 520, textAlign: 'center', fontFamily: FONT, fontSize: 340, fontWeight: 900, color: K.amber, opacity: ap(t, 0.8)}}>?</div>
    </>
  );
};
const S1: React.FC = () => {
  const t = useSec();
  return (
    <>
      <Title c={WATER} sub="nồng độ = muối ÷ nước">NATRI MÁU</Title>
      <Cup x={390} bottom={1040} level={340} n={6} label="muối trong nước" val="Na⁺ 140" c={NA} a={ap(t, 0.3)} />
      <Badge s0={1.4} c={K.amber}>Na⁺ = muối ÷ nước</Badge>
    </>
  );
};
const S2: React.FC = () => {
  const t = useSec();
  const lv = 300 + 140 * ap(t, 0.9, 1.4);
  const v = Math.round(140 - 15 * ap(t, 0.9, 1.4));
  return (
    <>
      <Title c={K.o2}>THỪA NƯỚC</Title>
      <Cup x={150} bottom={1060} level={300} n={6} label="bình thường" val="Na⁺ 140" c={K.green} a={ap(t, 0.2)} />
      <Cup x={630} bottom={1060} level={lv} n={6} label="thêm nước" val={`Na⁺ ${v}`} c={K.o2} a={ap(t, 0.4)} />
      <Badge s0={2.4} c={K.o2}>Muối như cũ · nước tăng</Badge>
    </>
  );
};
const S3: React.FC = () => {
  const t = useSec();
  const g = 0.5 + 0.5 * Math.sin(t * 5);
  return (
    <>
      <Title c={K.amber} sub="hóc môn giữ nước">ADH</Title>
      <img src={staticFile('dg_nao.png')} style={{position: 'absolute', left: 230, top: 430, width: 620, opacity: ap(t, 0.2), filter: `drop-shadow(0 0 ${20 + 30 * g}px rgba(245,184,61,.55))`}} />
      <Badge s0={1.6} c={K.amber}>ADH ↑ → thận giữ nước</Badge>
    </>
  );
};
const Box: React.FC<{x: number; c: string; head: string; sub: string; s0: number}> = ({x, c, head, sub, s0}) => {
  const p = usePop(s0, 11);
  return (
    <div style={{position: 'absolute', left: x, top: 470, width: 440, height: 560, borderRadius: 36, background: `${c}22`, border: `6px solid ${c}`, fontFamily: FONT, textAlign: 'center', transform: `scale(${p})`, opacity: Math.min(1, p * 1.5), boxShadow: `0 0 50px ${c}44`}}>
      <div style={{fontSize: 70, fontWeight: 900, color: c, marginTop: 50}}>{head}</div>
      <div style={{fontSize: 92, fontWeight: 900, color: K.txt, marginTop: 40}}>{chem('Na⁺ 125')}</div>
      <div style={{fontSize: 40, fontWeight: 700, color: K.dim, marginTop: 50, lineHeight: 1.3, padding: '0 24px'}}>{sub}</div>
    </div>
  );
};
const S4: React.FC = () => (
  <>
    <Title c={K.txt}>CÙNG MỘT CON SỐ</Title>
    <Box x={70} c={WATER} head="PHÙ" sub="suy tim, xơ gan" s0={0.3} />
    <Box x={570} c={NA} head="MẤT NƯỚC" sub="nôn, tiêu chảy, lợi tiểu" s0={1.0} />
  </>
);
const S5: React.FC = () => {
  const t = useSec();
  return (
    <>
      <Title c={K.green}>GHI NHỚ</Title>
      <div style={{position: 'absolute', left: 90, right: 90, top: 480, display: 'flex', flexDirection: 'column', gap: 40, fontFamily: FONT}}>
        {[['THỂ TÍCH', 'MUỐI', NA, 0.3], ['NỒNG ĐỘ Na⁺', 'NƯỚC', WATER, 1.3]].map(([a, b, c, s], i) => (
          <div key={i} style={{height: 210, borderRadius: 34, border: `5px solid ${c}`, background: `${c}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: ap(t, s as number), transform: `translateX(${(1 - ap(t, s as number)) * -60}px)`}}>
            <span style={{fontSize: 64, fontWeight: 900, color: K.txt}}>{chem(a as string)}</span>
            <span style={{fontSize: 64, fontWeight: 900, color: K.dim}}>←</span>
            <span style={{fontSize: 76, fontWeight: 900, color: c as string}}>{b}</span>
          </div>
        ))}
      </div>
    </>
  );
};
const S6: React.FC = () => {
  const t = useSec();
  const p = usePop(0.1);
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 300, textAlign: 'center', fontFamily: FONT, opacity: Math.min(1, p * 1.4), transform: `scale(${0.9 + 0.1 * p})`}}>
      <svg width={200} height={240} viewBox="0 0 200 240" style={{transform: `translateY(${Math.sin(f / 8) * 8}px)`}}><path d="M30,10 L170,10 L170,230 L100,175 L30,230 Z" fill={K.amber} stroke="#7A5608" strokeWidth={6} strokeLinejoin="round" /></svg>
      <div style={{fontSize: 96, fontWeight: 900, color: K.amber, marginTop: 30}}>LƯU LẠI ĐỂ ÔN</div>
      <div style={{fontSize: 56, fontWeight: 700, color: K.txt, marginTop: 30, lineHeight: 1.25, opacity: ap(t, 0.8)}}>Xem Bài 1 đầy đủ<br />“Giải mã điện giải”</div>
      <div style={{fontSize: 44, fontWeight: 600, color: K.dim, marginTop: 40, opacity: ap(t, 1.4)}}>Chuỗi 8 bài · trên kênh</div>
    </div>
  );
};

const SC = [S0, S1, S2, S3, S4, S5, S6];

export const DgShort1: React.FC = () => (
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
