// SHORT 9:16 — Giải mã khí máu · Tiêu chảy gây toan mà AG bình thường?
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
      <div style={{position: 'absolute', left: 60, top: 98, fontFamily: FONT, fontSize: 32, fontWeight: 800, letterSpacing: 2, color: K.dim}}>GIẢI MÃ KHÍ MÁU · {n >= 0 ? 'BÀI 5' : ''}</div>
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




const Col: React.FC<{cl: number; hco3: number; a: number; hi?: boolean}> = ({cl, hco3, a, hi}) => {
  const na = 138, ag = na - cl - hco3, k = 3.6, base = 1080;
  const blk = (y: number, h: number, bg: string, l: string, dash?: boolean) => (
    <div style={{position: 'absolute', left: 0, top: y, width: 300, height: Math.max(0, h - 5), borderRadius: 14, background: bg, border: dash ? `5px dashed ${K.txt}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: h > 70 ? 44 : 30, fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden'}}>{chem(l)}</div>
  );
  return (
    <div style={{position: 'absolute', left: 200, top: 0, opacity: a, fontFamily: FONT}}>
      {blk(base - na * k, na * k, '#C9822E', 'Na⁺ 138')}
      <div style={{position: 'absolute', left: 380, top: 0}}>
        {blk(base - cl * k, cl * k, '#3A7BE0', `Cl⁻ ${Math.round(cl)}`)}
        {blk(base - (cl + hco3) * k, hco3 * k, K.hco3, `HCO₃⁻ ${Math.round(hco3)}`)}
        {blk(base - na * k, ag * k, hi ? 'rgba(229,72,77,.9)' : 'rgba(63,178,127,.8)', `AG ${Math.round(ag)}`, true)}
      </div>
    </div>
  );
};
const S0: React.FC = () => {
  const t = useSec();
  return (
    <>
      <Title c={K.amber} sub="toan chuyển hoá, nhưng…">TIÊU CHẢY</Title>
      <div style={{position: 'absolute', left: 90, right: 90, top: 560, textAlign: 'center', fontFamily: FONT, opacity: ap(t, 1)}}>
        <div style={{fontSize: 200, fontWeight: 900, color: K.green, lineHeight: 1}}>AG</div>
        <div style={{fontSize: 80, fontWeight: 900, color: K.txt}}>bình thường?</div>
      </div>
    </>
  );
};
const S1: React.FC = () => {
  const t = useSec();
  const f = useCurrentFrame();
  return (
    <>
      <Title sub="dịch ruột giàu bicarbonate">DỊCH RUỘT</Title>
      <svg style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920}}>
        {Array.from({length: 9}, (_, i) => {
          const u = (f / 70 + i / 9) % 1;
          return <g key={i} opacity={ap(t, 0.4) * Math.sin(u * Math.PI)} transform={`translate(${200 + (i % 3) * 340},${480 + u * 650})`}><circle r={70} fill={K.hco3} /><text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#fff">HCO₃⁻</text></g>;
        })}
      </svg>
    </>
  );
};
const S2: React.FC = () => {
  const t = useSec();
  const items = ['Tiêu chảy', 'Mất HCO₃⁻', 'Toan máu'];
  return (
    <>
      <Title c={K.o2}>MẤT HCO₃⁻</Title>
      <div style={{position: 'absolute', left: 140, right: 140, top: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, fontFamily: FONT}}>
        {items.map((w, i) => (
          <React.Fragment key={w}>
            {i > 0 ? <div style={{fontSize: 80, color: K.o2, opacity: ap(t, 0.4 + i * 0.9)}}>↓</div> : null}
            <div style={{width: '100%', padding: '30px 0', textAlign: 'center', borderRadius: 30, background: `${K.o2}22`, border: `5px solid ${K.o2}`, fontSize: 72, fontWeight: 900, color: K.txt, opacity: ap(t, 0.4 + i * 0.9)}}>{chem(w)}</div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
};
const S3: React.FC = () => {
  const t = useSec();
  const u = interpolate(t, [0.6, 2.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (<><Title c={K.co2} sub="không có acid lạ">Cl⁻ TĂNG BÙ CHỖ</Title><Col cl={102 + 12 * u} hco3={24 - 12 * u} a={1} /></>);
};
const S4: React.FC = () => (<><Title c={K.green} sub="toan tăng Clo">AG GIỮ NGUYÊN</Title><Col cl={114} hco3={12} a={1} /><Badge s0={0.8} c={K.green}>AG 12 · bình thường</Badge></>);
const S5: React.FC = () => {
  const t = useSec();
  const u = interpolate(t, [0.8, 2.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (<><Title c={K.o2} sub="ngược lại: sốc · toan ceton">THÊM ACID</Title><Col cl={102} hco3={24 - 12 * u} a={1} hi={u > 0.5} /><Badge s0={2.8} c={K.o2}>AG TĂNG</Badge></>);
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
      <div style={{fontSize: 56, fontWeight: 700, color: K.txt, marginTop: 30, lineHeight: 1.25, opacity: ap(t, 0.8)}}>Xem bài đầy đủ<br />“Giải mã khí máu · Bài 5”</div>
      <div style={{fontSize: 44, fontWeight: 600, color: K.dim, marginTop: 40, opacity: ap(t, 1.4)}}>Bài 6: Toan và kiềm hô hấp</div>
    </div>
  );
};

const SC = [S0, S1, S2, S3, S4, S5, S6];

export const AbgShort5: React.FC = () => (
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
