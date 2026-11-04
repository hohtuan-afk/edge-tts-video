// SHORT 9:16 — Bài 11 · Những kẻ giả dạng ST chênh lên // · Block nhánh & Block phân nhánh: QRS rộng → nhìn V1 và V6
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, Easing, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import data from '../data.json';
import {FONT} from '../lib';
import {MONO} from './Lab';
import {Heart6} from '../wb/heart6';
import {beatV, ecgAt, Lead as LeadT} from './ecg';
import {train, PERI, ER_V4, BR1, STEMI_V3, RECIP_II} from './Mimic';
import {Heart4C} from '../wb/heart4c';
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
const COR = '#F97316', CPU = '#8B5CF6', CTE = '#06B6D4', CYE = '#CA8A04', CRD = '#DC2626';
const ST: [string, string, string][] = [['LAN TOẢ?', 'theo vùng hay khắp nơi', CYE], ['SOI GƯƠNG?', 'có → nghĩ TẮC', COR], ['HÌNH DẠNG?', 'lõm · khấc J · vòm', CPU], ['BỐI CẢNH?', 'tuổi · sốt · ECG cũ', CTE]];

const Pink: React.FC<{w: number; h: number; mm: number}> = ({w, h, mm}) => {
  const g: React.ReactNode[] = [];
  for (let i = 0; i <= w / mm; i++) g.push(<line key={'v' + i} x1={i * mm} x2={i * mm} y1={0} y2={h} stroke={i % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={i % 5 ? 1 : 2.2} />);
  for (let j = 0; j <= h / mm; j++) g.push(<line key={'h' + j} x1={0} x2={w} y1={j * mm} y2={j * mm} stroke={j % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={j % 5 ? 1 : 2.2} />);
  return <g><rect width={w} height={h} fill="#FFF6F2" />{g}</g>;
};



const Lead: React.FC<{t: number; f: (T: number) => number; label: string; x: number; w?: number; q?: number; base?: number; delay?: number; t0?: number; children?: (X: (x: number) => number, Y: (v: number) => number) => React.ReactNode}> = ({t, f, label, x, w = 470, q = 14, base = 330, delay = 0, t0 = -0.2, children}) => {
  const h = 560, pxs = 25 * q, pxmv = 10 * q;
  const X = (T: number) => 10 + (T - t0) * pxs, Y = (v: number) => base - v * pxmv;
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



const Hook: React.FC = () => {
  const t = useSec();
  const p1 = usePop(0), p2 = usePop(1.2);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: FONT, fontSize: 92, fontWeight: 900, color: '#fff', lineHeight: 1.08, transform: `scale(${0.6 + 0.4 * p1})`, opacity: Math.min(1, p1 * 1.5)}}>ST chênh lên<br />= <span style={{color: '#F87171'}}>TẮC mạch</span>?</div>
      <Lead t={t} f={train(PERI.V3, 0.9, 0.3)} label="V3" x={60} w={960} q={13} base={330} t0={0} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1060, display: 'flex', justifyContent: 'center'}}>
        <div style={{padding: '14px 44px', borderRadius: 24, border: '6px solid #FDE047', background: 'rgba(202,138,4,0.2)', fontFamily: FONT, fontSize: 84, fontWeight: 900, color: '#FEF08A', transform: `scale(${p2})`}}>CHÊNH ≠ TẮC</div>
      </div>
    </AbsoluteFill>
  );
};
const S1: React.FC = () => {
  const t = useSec();
  const ls: [string, string][] = [['II', 'II'], ['V3', 'V3'], ['V5', 'V5'], ['aVF', 'aVF'], ['I', 'I'], ['V6', 'V6']];
  return (
    <AbsoluteFill><StepHead i={0} />
      {ls.map(([l], i) => (
        <div key={l} style={{position: 'absolute', left: 60 + (i % 3) * 325, top: 460 + Math.floor(i / 3) * 290, width: 305, height: 270, borderRadius: 20, overflow: 'hidden', opacity: ap(t, 0.2 + i * 0.15), outline: `5px solid ${CYE}`}}>
          <svg viewBox="0 0 305 270" width={305} height={270}>
            <Pink w={305} h={270} mm={9} />
            <text x={14} y={36} fontFamily={MONO} fontSize={30} fontWeight={700} fill={INK}>{l}</text>
            <polyline points={Array.from({length: 330}, (_, k) => k * 0.004).map((T) => `${8 + T * 225},${170 - train(PERI[l], 0.9, 0.3)(T) * 90}`).join(' ')} fill="none" stroke={INK} strokeWidth={4} />
          </svg>
        </div>
      ))}
      <Badge s={usePop(2.6)} c={CYE}>khắp nơi → nghĩ GIẢ DẠNG</Badge>
    </AbsoluteFill>
  );
};
const S2: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill><StepHead i={1} />
      <Lead t={t} f={train(STEMI_V3, 0.9, 0.3)} label="V3" x={60} w={470} q={11} base={340} t0={0} />
      <Lead t={t} f={train(RECIP_II, 0.9, 0.3)} label="II" x={550} w={470} q={11} base={300} t0={0} delay={0.8}>
        {(X, Y) => <g opacity={ap(t, 1.6)}><ellipse cx={X(0.3 + 0.2)} cy={Y(-0.12)} rx={70} ry={34} fill="none" stroke={COR} strokeWidth={6} /><text x={X(0.3 + 0.2)} y={Y(-0.12) + 80} textAnchor="middle" fontFamily={HAND} fontSize={44} fill={COR}>soi gương ↓</text></g>}
      </Lead>
      <Badge s={usePop(2.4)} c={CRD}>có soi gương → nghĩ TẮC</Badge>
    </AbsoluteFill>
  );
};
const S3: React.FC = () => {
  const t = useSec();
  const items: [string, (T: number) => number, string, string][] = [
    ['II', train(PERI.II, 0.9, 0.3), 'lõm + PR ↓', CYE],
    ['V4', train(ER_V4, 0.9, 0.3), 'khấc J', CTE],
    ['V1', train(BR1, 1.0, 0.3), 'vòm', CPU],
  ];
  return (
    <AbsoluteFill><StepHead i={2} />
      {items.map(([l, f, cap, c], i) => (
        <div key={l} style={{position: 'absolute', left: 60, top: 450 + i * 200, width: 960, height: 180, borderRadius: 20, overflow: 'hidden', opacity: ap(t, 0.3 + i * 0.8), outline: `5px solid ${c}`}}>
          <svg viewBox="0 0 960 180" width={960} height={180}>
            <Pink w={960} h={180} mm={9} />
            <text x={14} y={36} fontFamily={MONO} fontSize={30} fontWeight={700} fill={INK}>{l}</text>
            <polyline points={Array.from({length: 520}, (_, k) => k * 0.004).map((T) => `${110 + T * 330},${118 - f(T) * 95}`).join(' ')} fill="none" stroke={INK} strokeWidth={4.5} />
          </svg>
          <div style={{position: 'absolute', right: 14, top: 10, padding: '4px 16px', borderRadius: 12, background: c, color: '#fff', fontFamily: FONT, fontSize: 36, fontWeight: 900}}>{cap}</div>
        </div>
      ))}
      <Badge s={usePop(3.2)} c={CPU}>giả dạng có HÌNH riêng</Badge>
    </AbsoluteFill>
  );
};
const S4: React.FC = () => {
  const t = useSec();
  const p = usePop(2.4);
  return (
    <AbsoluteFill><StepHead i={3} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 470, display: 'flex', justifyContent: 'space-around', fontFamily: FONT, opacity: ap(t, 0.3)}}>
        {[['🧒', 'tuổi'], ['🌡️', 'sốt'], ['📄', 'ECG cũ']].map(([e, l], i) => (
          <div key={l} style={{width: 280, height: 300, borderRadius: 28, background: 'rgba(255,255,255,0.07)', border: `5px solid ${CTE}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: ap(t, 0.3 + i * 0.5)}}>
            <div style={{fontSize: 130}}>{e}</div>
            <div style={{fontSize: 52, fontWeight: 900, color: '#A5F3FC', marginTop: 10}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 1100, padding: '20px 24px', borderRadius: 22, background: CRD, color: '#fff', textAlign: 'center', fontFamily: FONT, fontSize: 52, fontWeight: 900, transform: `scale(${p})`}}>⚠ Còn nghi ngờ → coi như TẮC</div>
    </AbsoluteFill>
  );
};
const Recap: React.FC = () => {
  const t = useSec();
  const rows: [string, string, string][] = [['LAN TOẢ?', 'khắp nơi → giả dạng', CYE], ['SOI GƯƠNG?', 'có → nghĩ tắc', COR], ['HÌNH DẠNG?', 'lõm · khấc J · vòm', CPU], ['BỐI CẢNH?', 'tuổi · sốt · ECG cũ', CTE]];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', fontFamily: FONT, fontSize: 80, fontWeight: 900, color: '#FEF08A'}}>CHÊNH ≠ TẮC</div>
      {rows.map(([k, v, c], i) => {
        const s = ap(t, 0.3 + i * 0.35, 0.3);
        return (
          <div key={k} style={{position: 'absolute', left: 50, top: 340 + i * 180, width: 980, height: 150, borderRadius: 30, background: 'rgba(255,255,255,0.06)', border: `5px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', boxSizing: 'border-box', opacity: s, transform: `translateX(${(1 - s) * -120}px)`, fontFamily: FONT}}>
            <span style={{fontSize: 46, fontWeight: 900, color: c === CYE ? '#FDE047' : c}}>{k}</span>
            <span style={{fontSize: 40, fontWeight: 800, color: '#E2E8F0'}}>{v}</span>
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
        <div style={{fontSize: 96, fontWeight: 900, color: c, letterSpacing: -2, textShadow: `0 0 30px ${c}66`}}>{k}</div>
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
        <Heart6 id="cta11" x={260} y={200} s={1.0} prog={1} art={1} labels={false} beat={beat} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: FONT, fontSize: 92, fontWeight: 900, color: '#FDE047', transform: `scale(${p})`}}>🔖 LƯU LẠI ĐỂ ÔN</div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 980, padding: '26px 30px', borderRadius: 26, background: '#FDE047', color: '#0B1218', textAlign: 'center', fontFamily: FONT, fontSize: 52, fontWeight: 900, transform: `scale(${q})`}}>Xem bài đầy đủ trên kênh ▶</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 700, color: '#CBD5E1', opacity: ap(t, 1.2)}}>Tiếp cận điện tâm đồ cơ bản · Bài 11</div>
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
      <div style={{position: 'absolute', left: 60, top: 104, fontFamily: FONT, fontSize: 28, fontWeight: 800, letterSpacing: 3, color: '#5EEAD4', opacity: idx === 0 ? 0 : 1}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 11</div>
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
export const Short11: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 35%, #3A300A, #070B10 75%)', fontFamily: FONT}}>
    <Audio src={staticFile('narration.m4a')} />
    {data.scenes.map((s, i) => {
      const Comp = SC[i];
      return Comp ? <Sequence key={i} from={s.from} durationInFrames={s.dur}><Comp /></Sequence> : null;
    })}
    <TopBar />
    <BigCap />
  </AbsoluteFill>
);
