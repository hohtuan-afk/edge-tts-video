// SHORT 9:16 — Bài 10 · Ngoại tâm thu & nhịp thoát // · Block nhánh & Block phân nhánh: QRS rộng → nhìn V1 và V6
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, Easing, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import data from '../data.json';
import {FONT} from '../lib';
import {MONO} from './Lab';
import {Heart6} from '../wb/heart6';
import {beatV, ecgAt, Lead as LeadT} from './ecg';
import {rhythm, Focus, FA, FV} from './Ectopy';
import {H4} from '../wb/heart4c';
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
const COR = '#F97316', CPU = '#8B5CF6', CTE = '#06B6D4', CBL = '#3B82F6', CRD = '#DC2626';
const ST: [string, string, string][] = [['SỚM/MUỘN', 'ngoại tâm thu · thoát', COR], ['HẸP/RỘNG', 'nhĩ · thất', CPU], ['NGHỈ BÙ', 'đủ hay thiếu', CTE], ['NHỊP THOÁT', 'là CỨU', CBL]];

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
  const p1 = usePop(0), p2 = usePop(1.0);
  const rt = useCurrentFrame() / 30;
  const pl = (rt % 1.2) / 1.2;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: FONT, fontSize: 96, fontWeight: 900, color: '#fff', lineHeight: 1.05, transform: `scale(${0.6 + 0.4 * p1})`, opacity: Math.min(1, p1 * 1.5)}}>Nhát đến <span style={{color: '#FDBA74'}}>SỚM</span><br />hay nhát đến <span style={{color: '#93C5FD'}}>CỨU</span>?</div>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <Heart4C id="h10k" x={250} y={420} s={0.46} ring={0.5} cond={0.8} />
        <g transform="translate(250,420) scale(0.46)">
          <Focus p={FA} c={CPU} pulse={pl} /><Focus p={H4.AV} c={CTE} pulse={(pl + 0.33) % 1} /><Focus p={FV} c={CRD} pulse={(pl + 0.66) % 1} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1030, display: 'flex', justifyContent: 'center', gap: 14, fontFamily: FONT, transform: `scale(${p2})`}}>
        {ST.slice(0, 3).map(([k, , c]) => <span key={k} style={{padding: '10px 22px', borderRadius: 18, border: `4px solid ${c}`, color: c, fontSize: 44, fontWeight: 900, background: 'rgba(0,0,0,0.35)'}}>{k}</span>)}
      </div>
    </AbsoluteFill>
  );
};
const S1: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill><StepHead i={0} />
      <Lead t={t} f={rhythm([[0.2, 's'], [1.0, 's'], [1.48, 'v'], [2.6, 's'], [3.75, 'ej']])} label="II" x={60} w={960} q={8} base={330} t0={0}>
        {(X, Y) => <g>
          <g opacity={ap(t, 0.8)}>{[1.8, 3.4].map((e) => <line key={e} x1={X(e)} x2={X(e)} y1={80} y2={520} stroke="#64748B" strokeWidth={3} strokeDasharray="10 10" />)}</g>
          <g opacity={ap(t, 1.2)}><text x={X(1.55)} y={Y(1.7)} textAnchor="middle" fontFamily={FONT} fontSize={50} fontWeight={900} fill={COR}>SỚM</text><circle cx={X(1.55)} cy={Y(0.4)} r={70} fill="none" stroke={COR} strokeWidth={7} /></g>
          <g opacity={ap(t, 2.2)}><text x={X(3.78)} y={Y(1.6)} textAnchor="middle" fontFamily={FONT} fontSize={50} fontWeight={900} fill={CBL}>MUỘN</text><circle cx={X(3.78)} cy={Y(0.4)} r={60} fill="none" stroke={CBL} strokeWidth={7} /></g>
        </g>}
      </Lead>
      <Badge s={usePop(3.0)} c={COR}>chen ngang · ra cứu</Badge>
    </AbsoluteFill>
  );
};
const S2: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill><StepHead i={1} />
      <Lead t={t} f={rhythm([[0.25, 's'], [0.78, 'a']])} label="nhĩ" x={60} w={470} q={11} base={340} t0={0}>
        {(X, Y) => <g opacity={ap(t, 0.9)}><circle cx={X(0.63)} cy={Y(0.12)} r={30} fill="none" stroke={CPU} strokeWidth={6} /><text x={X(0.63)} y={Y(0.12) + 80} textAnchor="middle" fontFamily={HAND} fontSize={44} fill={CPU}>P′ sớm</text></g>}
      </Lead>
      <Lead t={t} f={rhythm([[0.25, 's'], [0.75, 'v']])} label="thất" x={550} w={470} q={11} base={300} t0={0} delay={0.6}>
        {(X, Y) => <g opacity={ap(t, 2.0)}><rect x={X(0.75)} y={Y(1.5)} width={X(0.92) - X(0.75)} height={Y(-0.6) - Y(1.5)} rx={8} fill="none" stroke={CRD} strokeWidth={6} /></g>}
      </Lead>
      <Badge s={usePop(3.0)} c={CPU}>HẸP → NHĨ · RỘNG → THẤT</Badge>
    </AbsoluteFill>
  );
};
const S3: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill><StepHead i={2} />
      <Lead t={t} f={rhythm([[0.2, 's'], [1.0, 's'], [1.48, 'v'], [2.6, 's'], [3.4, 's']])} label="II" x={60} w={960} q={10} base={330} t0={0}>
        {(X, Y) => <g opacity={ap(t, 1.0)}>
          <path d={`M${X(1.0)},${Y(-0.9) - 20} L${X(1.0)},${Y(-0.9)} L${X(2.6)},${Y(-0.9)} L${X(2.6)},${Y(-0.9) - 20}`} fill="none" stroke={CTE} strokeWidth={7} />
          <text x={X(1.8)} y={Y(-0.9) + 60} textAnchor="middle" fontFamily={FONT} fontSize={48} fontWeight={900} fill="#0E7490">= 2 × RR · ĐỦ ✓</text>
        </g>}
      </Lead>
      <Badge s={usePop(2.4)} c={CTE}>ĐỦ → THẤT · THIẾU → NHĨ</Badge>
    </AbsoluteFill>
  );
};
const S4: React.FC = () => {
  const t = useSec();
  const p = usePop(1.2);
  return (
    <AbsoluteFill><StepHead i={3} />
      <Lead t={t} f={rhythm([[0.3, 'ej'], [1.63, 'ej'], [2.96, 'ej']])} label="II · thoát ~45" x={60} w={960} q={10} base={330} t0={0} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 1110, padding: '18px 24px', borderRadius: 22, background: CRD, color: '#fff', textAlign: 'center', fontFamily: FONT, fontSize: 50, fontWeight: 900, transform: `scale(${p})`}}>⚠ ĐỪNG XOÁ bằng thuốc chống loạn nhịp</div>
    </AbsoluteFill>
  );
};
const Recap: React.FC = () => {
  const t = useSec();
  const rows: [string, string, string][] = [['SỚM hay MUỘN', 'ngoại tâm thu · thoát', COR], ['HẸP hay RỘNG', 'nhĩ · thất', CPU], ['NGHỈ BÙ', 'đủ → thất · thiếu → nhĩ', CTE], ['NHỊP THOÁT', 'CỨU · đừng xoá', CBL]];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', fontFamily: FONT, fontSize: 72, fontWeight: 900, color: '#fff'}}>NHỚ NHANH</div>
      {rows.map(([k, v, c], i) => {
        const s = ap(t, 0.3 + i * 0.35, 0.3);
        return (
          <div key={k} style={{position: 'absolute', left: 50, top: 340 + i * 180, width: 980, height: 150, borderRadius: 30, background: 'rgba(255,255,255,0.06)', border: `5px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', boxSizing: 'border-box', opacity: s, transform: `translateX(${(1 - s) * -120}px)`, fontFamily: FONT}}>
            <span style={{fontSize: 46, fontWeight: 900, color: c}}>{k}</span>
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
        <Heart6 id="cta10" x={260} y={200} s={1.0} prog={1} art={1} labels={false} beat={beat} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: FONT, fontSize: 92, fontWeight: 900, color: '#FDE047', transform: `scale(${p})`}}>🔖 LƯU LẠI ĐỂ ÔN</div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 980, padding: '26px 30px', borderRadius: 26, background: '#FDBA74', color: '#0B1218', textAlign: 'center', fontFamily: FONT, fontSize: 52, fontWeight: 900, transform: `scale(${q})`}}>Xem bài đầy đủ trên kênh ▶</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 700, color: '#CBD5E1', opacity: ap(t, 1.2)}}>Tiếp cận điện tâm đồ cơ bản · Bài 10</div>
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
      <div style={{position: 'absolute', left: 60, top: 104, fontFamily: FONT, fontSize: 28, fontWeight: 800, letterSpacing: 3, color: '#5EEAD4', opacity: idx === 0 ? 0 : 1}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 10</div>
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
export const Short10: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 35%, #3A2410, #070B10 75%)', fontFamily: FONT}}>
    <Audio src={staticFile('narration.m4a')} />
    {data.scenes.map((s, i) => {
      const Comp = SC[i];
      return Comp ? <Sequence key={i} from={s.from} durationInFrames={s.dur}><Comp /></Sequence> : null;
    })}
    <TopBar />
    <BigCap />
  </AbsoluteFill>
);
