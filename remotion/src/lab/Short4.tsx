// SHORT 9:16 — Bài 4 · Block nhánh & Block phân nhánh: QRS rộng → nhìn V1 và V6
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, Easing, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import data from '../data.json';
import {FONT} from '../lib';
import {MONO} from './Lab';
import {Heart6} from '../wb/heart6';
import {beat, M, Branches} from './Bundle';
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
const CR = '#2563EB', CL = '#DC2626', CA = '#F59E0B', CPo = '#16A34A';
const ST: [string, string, string][] = [['Nhánh PHẢI', 'V1 hướng LÊN', CR], ['Nhánh TRÁI', 'V1 hướng XUỐNG', CL], ['Trái TRƯỚC', 'trục lệch TRÁI', CA], ['Trái SAU', 'trục lệch PHẢI', CPo]];

const Pink: React.FC<{w: number; h: number; mm: number}> = ({w, h, mm}) => {
  const g: React.ReactNode[] = [];
  for (let i = 0; i <= w / mm; i++) g.push(<line key={'v' + i} x1={i * mm} x2={i * mm} y1={0} y2={h} stroke={i % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={i % 5 ? 1 : 2.2} />);
  for (let j = 0; j <= h / mm; j++) g.push(<line key={'h' + j} x1={0} x2={w} y1={j * mm} y2={j * mm} stroke={j % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={j % 5 ? 1 : 2.2} />);
  return <g><rect width={w} height={h} fill="#FFF6F2" />{g}</g>;
};

type Morph = Parameters<typeof beat>[0];
const qR: Morph = {c: [[0.01, 0.007, -0.18], [0.04, 0.013, 1.0]], t: [0.27, 0.045, 0.25], end: 0.08};
const rS: Morph = {c: [[0.015, 0.008, 0.25], [0.048, 0.013, -0.95]], t: [0.27, 0.045, 0.15], end: 0.085};
// ô chuyển đạo phóng to
const Lead: React.FC<{t: number; m: Morph; label: string; x: number; w?: number; base?: number; delay?: number; children?: (X: (x: number) => number, Y: (v: number) => number) => React.ReactNode}> = ({t, m, label, x, w = 470, base = 300, delay = 0, children}) => {
  const h = 560, mm = 24, pxs = 25 * mm, pxmv = 10 * mm * 0.75;
  const X = (T: number) => 30 + (T + 0.17) * pxs, Y = (v: number) => base - v * pxmv;
  const f = beat(m);
  const pts: string[] = [];
  for (let T = -0.17; X(T) < w - 10; T += 0.002) pts.push(`${X(T).toFixed(1)},${Y(f(T)).toFixed(1)}`);
  const k = ap(t, 0.05 + delay, 0.4);
  return (
    <div style={{position: 'absolute', left: x, top: 460, width: w, height: h, borderRadius: 28, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.55)', opacity: k, transform: `translateY(${(1 - k) * 80}px)`}}>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
        <Pink w={w} h={h} mm={mm / 2} />
        <text x={22} y={56} fontFamily={MONO} fontSize={46} fontWeight={700} fill={INK}>{label}</text>
        <polyline points={pts.join(' ')} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dp(t, 0.1 + delay, 1.0)} />
        {children?.(X, Y)}
      </svg>
    </div>
  );
};
const Wheel: React.FC<{t: number; a0: number; a1: number; ang: number; c: string}> = ({t, a0, a1, ang, c}) => {
  const cx = 540, cy = 740, r = 220;
  const pt = (d: number, rr = r) => [cx + rr * Math.cos((d * Math.PI) / 180), cy + rr * Math.sin((d * Math.PI) / 180)];
  const [x0, y0] = pt(a0), [x1, y1] = pt(a1);
  const k = dp(t, 0.4, 1.0);
  const [ax, ay] = pt(ang * k, r * 0.88);
  const ticks: [number, string][] = [[0, '0° DI'], [90, '+90°'], [-90, '−90°'], [180, '±180°']];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0, opacity: ap(t, 0.05)}}>
      <rect x={60} y={460} width={960} height={560} rx={28} fill="#FCFAF4" />
      <path d={`M${cx},${cy} L${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1} Z`} fill={c} opacity={0.35 * k} />
      {ticks.map(([d, s]) => {
        const [tx, ty] = pt(d), [lx, ly] = pt(d, r + (d === 0 || d === 180 ? 95 : 32));
        return <g key={d}><line x1={cx} y1={cy} x2={tx} y2={ty} stroke="#CBD5E1" strokeWidth={3} /><text x={lx} y={ly + 12} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={800} fill="#334155">{s}</text></g>;
      })}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#94A3B8" strokeWidth={4} />
      <line x1={cx} y1={cy} x2={ax} y2={ay} stroke={c} strokeWidth={16} strokeLinecap="round" opacity={k > 0.02 ? 1 : 0} />
      <circle cx={ax} cy={ay} r={20} fill={c} opacity={k > 0.02 ? 1 : 0} />
      <circle cx={cx} cy={cy} r={12} fill={INK} />
    </svg>
  );
};
const Lever: React.FC<{x: number; y: number; s: number; ang: number}> = ({x, y, s, ang}) => (
  <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={0} r={110} fill="none" stroke="#475569" strokeWidth={20} />
      <g transform={`rotate(${ang} -140 0)`}><rect x={-140} y={-16} width={260} height={32} rx={16} fill="#CBD5E1" /><circle cx={-140} cy={0} r={30} fill="#64748B" /></g>
    </g>
  </svg>
);

const Hook: React.FC = () => {
  const t = useSec();
  const p1 = usePop(0), p2 = usePop(0.8);
  const rt = useCurrentFrame() / 30;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: FONT, fontSize: 104, fontWeight: 900, color: '#fff', lineHeight: 1.05, transform: `scale(${0.6 + 0.4 * p1})`, opacity: Math.min(1, p1 * 1.5)}}>QRS RỘNG?<br /><span style={{color: '#60A5FA'}}>NHÌN V1!</span></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', fontFamily: FONT, fontSize: 52, fontWeight: 800, color: '#CBD5E1', opacity: ap(t, 0.4)}}>biết ngay block nhánh nào</div>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="h4k" x={230} y={500} s={1.0} prog={dp(t, 0, 0.6)} art={1} labels={false} beat={beatOf()} />
        <Branches x={230} y={500} s={1.0} a={ap(t, 0.5)} flow={((rt % 1.4) / 1.4) * 1.2} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', justifyContent: 'center', gap: 16, transform: `scale(${p2})`}}>
        <div style={{padding: '12px 26px', borderRadius: 20, border: `4px solid ${CR}`, background: 'rgba(10,16,22,0.85)', fontFamily: FONT, fontSize: 40, color: '#CBD5E1', fontWeight: 700}}>gạt <b style={{color: '#93C5FD', fontSize: 50}}>LÊN</b> → <b style={{color: '#93C5FD', fontSize: 50}}>PHẢI</b></div>
        <div style={{padding: '12px 26px', borderRadius: 20, border: `4px solid ${CL}`, background: 'rgba(10,16,22,0.85)', fontFamily: FONT, fontSize: 40, color: '#CBD5E1', fontWeight: 700}}>gạt <b style={{color: '#FCA5A5', fontSize: 50}}>XUỐNG</b> → <b style={{color: '#FCA5A5', fontSize: 50}}>TRÁI</b></div>
      </div>
    </AbsoluteFill>
  );
};
const S1: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill><StepHead i={0} />
      <Lead t={t} m={M.V1r} label="V1" x={60} base={330}>
        {(X, Y) => <g opacity={ap(t, 1.4)}><text x={X(0.095)} y={Y(0.95) - 22} textAnchor="middle" fontFamily={MONO} fontSize={40} fontWeight={700} fill={CR}>R′</text><text x={X(0.015)} y={Y(0.25) - 18} textAnchor="middle" fontFamily={MONO} fontSize={36} fontWeight={700} fill={CR}>r</text></g>}
      </Lead>
      <Lead t={t} m={M.V6r} label="V6" x={550} base={300} delay={0.6}>
        {(X, Y) => <g opacity={ap(t, 1.8)}><rect x={X(0.07)} y={Y(0.05)} width={X(0.125) - X(0.07)} height={Y(-0.45) - Y(0.05) + 10} fill="rgba(37,99,235,0.25)" /><text x={X(0.1)} y={Y(-0.45) + 70} textAnchor="middle" fontFamily={HAND} fontSize={40} fill={CR}>S rộng</text></g>}
      </Lead>
      <Badge s={usePop(2.2)} c={CR}>🐰 “tai thỏ” ↑</Badge>
    </AbsoluteFill>
  );
};
const S2: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill><StepHead i={1} />
      <Lead t={t} m={M.V1l} label="V1" x={60} base={210} />
      <Lead t={t} m={M.V6l} label="V6" x={550} base={360} delay={0.6}>
        {(X, Y) => <g><g opacity={ap(t, 1.8)}><text x={X(0.075)} y={Y(1.2) - 20} textAnchor="middle" fontFamily={HAND} fontSize={42} fill={CL}>“M”</text></g><g opacity={ap(t, 2.2)}><circle cx={X(0)} cy={Y(0)} r={24} fill="none" stroke={PEN} strokeWidth={5} /><text x={X(0) - 10} y={Y(0) + 70} textAnchor="middle" fontFamily={HAND} fontSize={38} fill={PEN}>mất q</text></g></g>}
      </Lead>
      <Badge s={usePop(2.4)} c={CL}>V1 ↓ · V6 R khấc</Badge>
    </AbsoluteFill>
  );
};
const S3: React.FC = () => {const t = useSec(); return <AbsoluteFill><StepHead i={2} /><Wheel t={t} a0={-90} a1={-45} ang={-60} c={CA} /><Badge s={usePop(2.4)} c={CA}>−45° → −90° · QRS hẹp</Badge></AbsoluteFill>;};
const S4: React.FC = () => {const t = useSec(); return <AbsoluteFill><StepHead i={3} /><Wheel t={t} a0={90} a1={180} ang={120} c={CPo} /><Badge s={usePop(2.4)} c={CPo}>+90° → +180° · loại trừ</Badge></AbsoluteFill>;};
const Recap: React.FC = () => {
  const t = useSec();
  const rows: [string, string, string][] = [['V1 LÊN', '→ nhánh PHẢI', CR], ['V1 XUỐNG', '→ nhánh TRÁI', CL], ['Phân nhánh', '→ nhìn TRỤC', CA]];
  const lev = interpolate(t, [0.2, 0.6, 1.0, 1.4], [0, -28, -28, 28], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', fontFamily: FONT, fontSize: 72, fontWeight: 900, color: '#fff'}}>NHỚ NHANH</div>
      <Lever x={560} y={430} s={0.9} ang={lev} />
      {rows.map(([k, v, c], i) => {
        const s = ap(t, 0.3 + i * 0.4, 0.3);
        return (
          <div key={k} style={{position: 'absolute', left: 70, top: 620 + i * 180, width: 940, height: 150, borderRadius: 30, background: 'rgba(255,255,255,0.06)', border: `5px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 36px', boxSizing: 'border-box', opacity: s, transform: `translateX(${(1 - s) * -120}px)`, fontFamily: FONT}}>
            <span style={{fontSize: 62, fontWeight: 900, color: c}}>{k}</span>
            <span style={{fontSize: 50, fontWeight: 800, color: '#E2E8F0'}}>{v}</span>
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
        <Heart6 id="cta4" x={260} y={200} s={1.0} prog={1} art={1} labels={false} beat={beat} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: FONT, fontSize: 92, fontWeight: 900, color: '#FDE047', transform: `scale(${p})`}}>🔖 LƯU LẠI ĐỂ ÔN</div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 980, padding: '26px 30px', borderRadius: 26, background: '#60A5FA', color: '#0B1218', textAlign: 'center', fontFamily: FONT, fontSize: 52, fontWeight: 900, transform: `scale(${q})`}}>Xem bài đầy đủ trên kênh ▶</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 700, color: '#CBD5E1', opacity: ap(t, 1.2)}}>Tiếp cận điện tâm đồ cơ bản · Bài 4</div>
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
      <div style={{position: 'absolute', left: 60, top: 104, fontFamily: FONT, fontSize: 28, fontWeight: 800, letterSpacing: 3, color: '#5EEAD4', opacity: idx === 0 ? 0 : 1}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 4</div>
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
export const Short4: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 35%, #13243A, #070B10 75%)', fontFamily: FONT}}>
    <Audio src={staticFile('narration.m4a')} />
    {data.scenes.map((s, i) => {
      const Comp = SC[i];
      return Comp ? <Sequence key={i} from={s.from} durationInFrames={s.dur}><Comp /></Sequence> : null;
    })}
    <TopBar />
    <BigCap />
  </AbsoluteFill>
);
