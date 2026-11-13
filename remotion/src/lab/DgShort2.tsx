// SHORT 9:16 — Giải mã điện giải · Hạ natri: 4 câu hỏi chẩn đoán
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
      <div style={{position: 'absolute', left: 60, top: 98, fontFamily: FONT, fontSize: 32, fontWeight: 800, letterSpacing: 2, color: K.dim}}>GIẢI MÃ ĐIỆN GIẢI · {n >= 0 ? 'BÀI 2' : ''}</div>
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

const S0: React.FC = () => (
  <>
    <Title c={NA} sub="4 câu hỏi chẩn đoán">HẠ NATRI</Title>
    <div style={{position: 'absolute', left: 120, right: 120, top: 470, display: 'flex', flexDirection: 'column', gap: 26}}>
      {['ALTT máu', 'ALTT niệu', 'Na⁺ niệu', 'Thể tích'].map((w, i) => <Chip key={w} w={w} c={K.amber} s0={0.6 + i * 0.35} n={i + 1} />)}
    </div>
  </>
);
const S1: React.FC = () => (<><StepHead n="1" word="ALTT máu" sub="có thấp không?" c={K.amber} /><Big2 c={K.green} head="THẤP < 275" body="Hạ natri THẬT" s0={1.2} /></>);
const S2: React.FC = () => (<><StepHead n="2" word="ALTT niệu" sub="ADH bật hay tắt?" c={K.amber} /><Big2 c={WATER} head="< 100 · ADH TẮT" body="Uống quá nhiều nước" s0={1.4} /></>);
const S3: React.FC = () => (<><StepHead n="3" word="Na⁺ niệu" sub="thận giữ hay mất muối?" c={K.amber} /><Big2 c={K.co2} head="≤ 30" body="Thận đang GIỮ muối" s0={1.4} /></>);
const S4: React.FC = () => {
  const t = useSec();
  return (
    <>
      <StepHead n="4" word="Thể tích" sub="dịch ngoại bào" c={K.amber} />
      <div style={{position: 'absolute', left: 120, right: 120, top: 480, display: 'flex', flexDirection: 'column', gap: 30, fontFamily: FONT}}>
        {[['GIẢM', NA], ['BÌNH THƯỜNG', K.green], ['TĂNG · phù, báng', WATER]].map(([w, c], i) => (
          <div key={w} style={{height: 160, borderRadius: 30, border: `5px solid ${c}`, background: `${c}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 900, color: K.txt, opacity: ap(t, 1 + i * 0.6), transform: `translateX(${(1 - ap(t, 1 + i * 0.6)) * -60}px)`}}>{w}</div>
        ))}
      </div>
    </>
  );
};
const S5: React.FC = () => {
  const t = useSec();
  return (
    <>
      <Title c={K.amber}>KẾT LUẬN</Title>
      <Big2 c={K.amber} head="Na⁺ niệu > 30 + thể tích bình thường" body="→ nghĩ SIAD" s0={0.4} />
      <div style={{position: 'absolute', left: 90, right: 90, top: 960, textAlign: 'center', fontFamily: FONT, fontSize: 44, fontWeight: 700, color: K.dim, opacity: ap(t, 2.4)}}>sau khi loại trừ lợi tiểu, suy giáp, suy thượng thận</div>
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
      <div style={{fontSize: 56, fontWeight: 700, color: K.txt, marginTop: 30, lineHeight: 1.25, opacity: ap(t, 0.8)}}>Xem Bài 2 đầy đủ<br />“Giải mã điện giải”</div>
      <div style={{fontSize: 44, fontWeight: 600, color: K.dim, marginTop: 40, opacity: ap(t, 1.4)}}>SIAD · giả hạ natri · 2 ca bệnh</div>
    </div>
  );
};

const SC = [S0, S1, S2, S3, S4, S5, S6];

export const DgShort2: React.FC = () => (
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
