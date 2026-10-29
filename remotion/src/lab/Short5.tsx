// SHORT 9:16 — Bài 5 · NMCT ST chênh lên: CHÊNH – SOI GƯƠNG – ĐỊNH KHU // · Block nhánh & Block phân nhánh: QRS rộng → nhìn V1 và V6
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, Easing, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import data from '../data.json';
import {FONT} from '../lib';
import {MONO} from './Lab';
import {Heart6} from '../wb/heart6';
import {beatV, ecgAt, Lead as LeadT} from './ecg';
import {HAND} from '../wb/wb';

const W = 1080, H = 1920;
const ap = (t: number, s: number, d = 0.45) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1)});
const dp = (t: number, s: number, d = 0.8) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
const useSec = () => useCurrentFrame() / 30;
const usePop = (s: number) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - s * fps, fps, config: {damping: 11, stiffness: 160, mass: 0.6}});
};
const beatOf = () => Math.max(0, Math.sin((useCurrentFrame() / 30) * 2 * Math.PI * 1.1)) ** 4;
const INK = '#1E1E24', PEN = '#E11D48', CP = '#8B5CF6', CQ = '#DC2626';
const CJ = '#DC2626', CM = '#06B6D4', CRCA = '#2563EB', CLAD = '#F43F5E', CLCX = '#F59E0B';
const ST: [string, string, string][] = [['CHÊNH', 'đo tại điểm J', CJ], ['SOI GƯƠNG', 'đối diện chênh XUỐNG', CM], ['DƯỚI', 'II · III · aVF', CRCA], ['TRƯỚC', 'V1 → V4', CLAD]];

const Pink: React.FC<{w: number; h: number; mm: number}> = ({w, h, mm}) => {
  const g: React.ReactNode[] = [];
  for (let i = 0; i <= w / mm; i++) g.push(<line key={'v' + i} x1={i * mm} x2={i * mm} y1={0} y2={h} stroke={i % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={i % 5 ? 1 : 2.2} />);
  for (let j = 0; j <= h / mm; j++) g.push(<line key={'h' + j} x1={0} x2={w} y1={j * mm} y2={j * mm} stroke={j % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={j % 5 ? 1 : 2.2} />);
  return <g><rect width={w} height={h} fill="#FFF6F2" />{g}</g>;
};


const STEMI: LeadT = {st: 0.38, t: 0.42, tw: 0.075, tPos: 0.23};
const DEP: LeadT = {r: 0.6, s: -0.2, st: -0.24, t: -0.14};
// ô chuyển đạo phóng to, đúng tỉ lệ (q px / ô nhỏ)
const Lead: React.FC<{t: number; L: LeadT; label: string; x: number; w?: number; q?: number; base?: number; delay?: number; single?: boolean; children?: (X: (x: number) => number, Y: (v: number) => number) => React.ReactNode}> = ({t, L, label, x, w = 470, q = 22, base = 330, delay = 0, single, children}) => {
  const h = 560, pxs = 25 * q, pxmv = 10 * q;
  const t0 = single ? -0.3 : -0.2;
  const X = (T: number) => 10 + (T - t0) * pxs, Y = (v: number) => base - v * pxmv;
  const f = single ? (T: number) => beatV(T, L) : (T: number) => ecgAt(T, L, 0.8, 0.15);
  const pts: string[] = [];
  for (let T = t0; X(T) < w - 10; T += 0.002) pts.push(`${X(T).toFixed(1)},${Y(f(T)).toFixed(1)}`);
  const k = ap(t, 0.05 + delay, 0.4);
  return (
    <div style={{position: 'absolute', left: x, top: 460, width: w, height: h, borderRadius: 28, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.55)', opacity: k, transform: `translateY(${(1 - k) * 80}px)`}}>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
        <Pink w={w} h={h} mm={q} />
        <text x={22} y={56} fontFamily={MONO} fontSize={46} fontWeight={700} fill={INK}>{label}</text>
        <polyline points={pts.join(' ')} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dp(t, 0.1 + delay, 1.0)} />
        {children?.(X, Y)}
      </svg>
    </div>
  );
};
const HeartPanel: React.FC<{t: number; zone: 'inf' | 'ant' | 'lat'; hot: 'rca' | 'lad' | 'lcx'; c: string; leads: string; art: string}> = ({t, zone, hot, c, leads, art}) => (
  <div style={{position: 'absolute', left: 60, top: 460, width: 960, height: 560, borderRadius: 28, background: 'rgba(15,23,42,0.8)', border: `4px solid ${c}`, overflow: 'hidden', opacity: ap(t, 0.05)}}>
    <svg viewBox="0 0 960 560" width={960} height={560}>
      <Heart6 id={'s5' + zone} x={20} y={10} s={0.95} prog={dp(t, 0, 0.6)} art={1} labels={false} zone={zone} zoneC={c} zoneA={ap(t, 0.6) * 0.9} hot={hot} occl={ap(t, 0.8)} beat={beatOf()} />
    </svg>
    <div style={{position: 'absolute', left: 540, top: 120, width: 400, fontFamily: FONT, opacity: ap(t, 1.0)}}>
      <div style={{fontSize: 34, fontWeight: 800, color: '#94A3B8'}}>ST chênh lên</div>
      <div style={{fontSize: 58, fontWeight: 900, color: '#F8FAFC', lineHeight: 1.1}}>{leads}</div>
      <div style={{fontSize: 60, color: '#94A3B8', margin: '10px 0'}}>↓</div>
      <div style={{fontSize: 46, fontWeight: 900, color: c, lineHeight: 1.1}}>{art}</div>
    </div>
  </div>
);

const Hook: React.FC = () => {
  const t = useSec();
  const p1 = usePop(0), p2 = usePop(0.8);
  const M3: [string, string][] = [['CHÊNH', CJ], ['SOI GƯƠNG', CM], ['ĐỊNH KHU', CRCA]];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: FONT, fontSize: 100, fontWeight: 900, color: '#fff', lineHeight: 1.05, transform: `scale(${0.6 + 0.4 * p1})`, opacity: Math.min(1, p1 * 1.5)}}>ST CHÊNH Ở ĐÂU?<br /><span style={{color: '#FB7185'}}>TẮC Ở ĐÓ!</span></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', fontFamily: FONT, fontSize: 52, fontWeight: 800, color: '#CBD5E1', opacity: ap(t, 0.4)}}>đọc nhồi máu trong 3 bước</div>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="h5k" x={230} y={500} s={1.0} prog={dp(t, 0, 0.6)} art={dp(t, 0.3, 1.2)} labels={false} beat={beatOf()} zone="ant" zoneC="#FF3B3B" zoneA={ap(t, 0.8) * 0.9} hot="lad" occl={ap(t, 0.6)} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', justifyContent: 'center', gap: 14, transform: `scale(${p2})`}}>
        {M3.map(([a, c], i) => <div key={a} style={{padding: '12px 22px', borderRadius: 20, border: `4px solid ${c}`, background: 'rgba(10,16,22,0.85)', fontFamily: FONT, fontSize: 44, color: c, fontWeight: 900}}>{i + 1}. {a}</div>)}
      </div>
    </AbsoluteFill>
  );
};
const S1: React.FC = () => {
  const t = useSec();
  const f = (T: number) => beatV(T, STEMI);
  return (
    <AbsoluteFill><StepHead i={0} />
      <Lead t={t} L={STEMI} label="V3" x={60} w={960} q={30} base={380} single>
        {(X, Y) => (
          <g>
            <line x1={X(-0.3)} x2={X(0.6)} y1={Y(0)} y2={Y(0)} stroke="#2563EB" strokeWidth={5} strokeDasharray="16 12" opacity={ap(t, 1.0)} />
            <g opacity={ap(t, 1.3)}><circle cx={X(0.06)} cy={Y(f(0.06))} r={16} fill={PEN} stroke="#fff" strokeWidth={4} /><text x={X(0.06) - 70} y={Y(f(0.06)) - 120} textAnchor="end" fontFamily={HAND} fontSize={52} fill={PEN}>điểm J</text><line x1={X(0.06) - 74} y1={Y(f(0.06)) - 112} x2={X(0.06) - 10} y2={Y(f(0.06)) - 20} stroke={PEN} strokeWidth={4} /></g>
            <g opacity={ap(t, 1.8)}><line x1={X(0.075)} x2={X(0.075)} y1={Y(0)} y2={Y(f(0.06))} stroke={PEN} strokeWidth={6} /><text x={X(0.075) + 20} y={(Y(0) + Y(f(0.06))) / 2 + 14} fontFamily={MONO} fontSize={40} fontWeight={700} fill={PEN}>{Math.round(f(0.06) * 10)} mm</text></g>
          </g>
        )}
      </Lead>
      <Badge s={usePop(2.4)} c={CJ}>≥ 1 mm · ≥ 2 chuyển đạo liên tiếp</Badge>
    </AbsoluteFill>
  );
};
const S2: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill><StepHead i={1} />
      <Lead t={t} L={STEMI} label="III" x={60} q={14} base={330}>
        {(X, Y) => <text x={X(0.5)} y={Y(0.9)} textAnchor="middle" fontFamily={MONO} fontSize={60} fontWeight={800} fill={CJ} opacity={ap(t, 1.2)}>ST ↑</text>}
      </Lead>
      <Lead t={t} L={DEP} label="aVL" x={550} q={14} base={280} delay={0.6}>
        {(X, Y) => <text x={X(0.5)} y={Y(-0.9)} textAnchor="middle" fontFamily={MONO} fontSize={60} fontWeight={800} fill="#2563EB" opacity={ap(t, 1.8)}>ST ↓</text>}
      </Lead>
      <Badge s={usePop(2.4)} c={CM}>có soi gương → càng chắc</Badge>
    </AbsoluteFill>
  );
};
const S3: React.FC = () => {const t = useSec(); return <AbsoluteFill><StepHead i={2} /><HeartPanel t={t} zone="inf" hot="rca" c={CRCA} leads="II · III · aVF" art="Vành phải" /><Badge s={usePop(2.4)} c={CRCA}>vùng DƯỚI → vành phải</Badge></AbsoluteFill>;};
const S4: React.FC = () => {const t = useSec(); return <AbsoluteFill><StepHead i={3} /><HeartPanel t={t} zone="ant" hot="lad" c={CLAD} leads="V1 → V4" art="Liên thất trước" /><Badge s={usePop(2.4)} c={CLAD}>vùng TRƯỚC → liên thất trước</Badge></AbsoluteFill>;};
const Recap: React.FC = () => {
  const t = useSec();
  const rows: [string, string, string][] = [['DƯỚI', 'vành phải', CRCA], ['TRƯỚC', 'liên thất trước', CLAD], ['BÊN', 'động mạch mũ', CLCX]];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', fontFamily: FONT, fontSize: 72, fontWeight: 900, color: '#fff'}}>NHỚ NHANH</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#CBD5E1', opacity: ap(t, 0.1)}}>CHÊNH ở đâu → TẮC ở đó</div>
      {rows.map(([k, v, c], i) => {
        const s = ap(t, 0.3 + i * 0.4, 0.3);
        return (
          <div key={k} style={{position: 'absolute', left: 70, top: 420 + i * 200, width: 940, height: 160, borderRadius: 30, background: 'rgba(255,255,255,0.06)', border: `5px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 36px', boxSizing: 'border-box', opacity: s, transform: `translateX(${(1 - s) * -120}px)`, fontFamily: FONT}}>
            <span style={{fontSize: 66, fontWeight: 900, color: c}}>{k}</span>
            <span style={{fontSize: 52, fontWeight: 800, color: '#E2E8F0'}}>→ {v}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
const StepHead: React.FC<{i: number}> = ({i}) => {
  const p = usePop(0);
  const [k, v, c] = ST[i];
  return (
    <div style={{position: 'absolute', left: 60, top: 190, display: 'flex', alignItems: 'center', gap: 28, transform: `scale(${0.7 + 0.3 * p})`, transformOrigin: 'left center', opacity: Math.min(1, p * 1.4)}}>
      <div style={{width: 170, height: 170, borderRadius: 85, background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 110, fontWeight: 900, color: '#fff', boxShadow: `0 0 40px ${c}99`}}>{i + 1}</div>
      <div style={{fontFamily: FONT, lineHeight: 1}}>
        <div style={{fontSize: 112, fontWeight: 900, color: c, letterSpacing: -2, textShadow: `0 0 30px ${c}66`}}>{k}</div>
        <div style={{fontSize: 50, fontWeight: 800, color: '#E2E8F0', marginTop: 8}}>{v}</div>
      </div>
    </div>
  );
};
const Badge: React.FC<{s: number; c: string; children: React.ReactNode}> = ({s, c, children}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 1110, display: 'flex', justifyContent: 'center'}}>
    <div style={{padding: '12px 40px', borderRadius: 20, background: c, color: '#fff', fontFamily: FONT, fontSize: 60, fontWeight: 900, transform: `scale(${s})`, boxShadow: `0 0 40px ${c}aa`}}>{children}</div>
  </div>
);

const CTA: React.FC = () => {
  const t = useSec();
  const beat = beatOf();
  const p = usePop(0.2), q = usePop(0.9);
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="cta5" x={260} y={200} s={1.0} prog={1} art={1} labels={false} beat={beat} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: FONT, fontSize: 92, fontWeight: 900, color: '#FDE047', transform: `scale(${p})`}}>🔖 LƯU LẠI ĐỂ ÔN</div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 980, padding: '26px 30px', borderRadius: 26, background: '#FB7185', color: '#0B1218', textAlign: 'center', fontFamily: FONT, fontSize: 52, fontWeight: 900, transform: `scale(${q})`}}>Xem bài đầy đủ trên kênh ▶</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 700, color: '#CBD5E1', opacity: ap(t, 1.2)}}>Tiếp cận điện tâm đồ cơ bản · Bài 5</div>
    </AbsoluteFill>
  );
};
const TopBar: React.FC = () => {
  const f = useCurrentFrame();
  const idx = data.scenes.findIndex((s) => f >= s.from && f < s.from + s.dur);
  return (
    <>
      <div style={{position: 'absolute', left: 60, right: 60, top: 70, display: 'flex', gap: 10}}>
        {ST.map(([, , c], i) => {
          const sc = data.scenes[i + 1];
          const k = !sc ? 0 : Math.max(0, Math.min(1, (f - sc.from) / sc.dur));
          return <div key={i} style={{flex: 1, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.18)', overflow: 'hidden'}}><div style={{width: `${k * 100}%`, height: '100%', background: c}} /></div>;
        })}
      </div>
      <div style={{position: 'absolute', left: 60, top: 104, fontFamily: FONT, fontSize: 28, fontWeight: 800, letterSpacing: 3, color: '#5EEAD4', opacity: idx === 0 ? 0 : 1}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 5</div>
    </>
  );
};
const BigCap: React.FC = () => {
  const f = useCurrentFrame();
  const sc = data.scenes.find((s) => f >= s.from && f < s.from + s.dur);
  if (!sc || !sc.sents[0]) return null;
  const t = (f - sc.from) / 30, s = sc.sents[0];
  const a = Math.min(1, Math.max(0, (t - s.start + 0.2) / 0.25));
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 1330, display: 'flex', justifyContent: 'center', opacity: a}}>
      <div style={{padding: '18px 30px', borderRadius: 24, background: 'rgba(5,8,12,0.82)', border: '2px solid rgba(255,255,255,0.15)', fontFamily: FONT, fontSize: 50, fontWeight: 800, color: '#fff', textAlign: 'center', lineHeight: 1.28}}>{s.text}</div>
    </div>
  );
};
const SC: React.FC[] = [Hook, S1, S2, S3, S4, Recap, CTA];
export const Short5: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 35%, #3A1418, #070B10 75%)', fontFamily: FONT}}>
    <Audio src={staticFile('narration.m4a')} />
    {data.scenes.map((s, i) => {
      const Comp = SC[i];
      return Comp ? <Sequence key={i} from={s.from} durationInFrames={s.dur}><Comp /></Sequence> : null;
    })}
    <TopBar />
    <BigCap />
  </AbsoluteFill>
);
