// "Phòng vector" kiểu hình hoá khái niệm (3Blue1Brown): dòng tổn thương chiếu lên trục chuyển đạo
import React from 'react';
import {AbsoluteFill, Sequence, interpolate, Easing, useCurrentFrame} from 'remotion';
import {FONT, useT, CapCtx} from '../lib';
import {ecgAt, Lead} from './ecg';
import {MonitorScene, MONO} from './Lab';

const V = {bg: '#0E1116', blue: '#58C4DD', yel: '#FFE066', red: '#FC6255', grn: '#83C167', txt: '#ECEFF4', dim: '#6B7684', teal: '#5CD0B3'};
const ap = (t: number, s: number, d = 0.6, e = Easing.bezier(0.33, 1, 0.68, 1)) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const sm = Easing.inOut(Easing.cubic);

const CX = 700, CY = 520, R = 330;
const LEADS: {n: string; a: number}[] = [
  {n: 'I', a: 0}, {n: 'II', a: 60}, {n: 'III', a: 120}, {n: 'aVF', a: 90}, {n: 'aVL', a: -30}, {n: 'aVR', a: -150},
];
const rad = (d: number) => (d * Math.PI) / 180;
const pt = (a: number, r: number): [number, number] => [CX + Math.cos(rad(a)) * r, CY + Math.sin(rad(a)) * r];

const Room: React.FC<{children: React.ReactNode; html?: React.ReactNode}> = ({children, html}) => (
  <AbsoluteFill style={{background: V.bg}}>
    <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(88,196,221,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(88,196,221,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <defs>
        <filter id="gl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <radialGradient id="inj" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor={V.red} stopOpacity="0.85" /><stop offset="1" stopColor={V.red} stopOpacity="0" /></radialGradient>
      </defs>
      {children}
    </svg>
    {html}
  </AbsoluteFill>
);
const Cap: React.FC<{text: string; a?: number}> = ({text, a = 1}) => !React.useContext(CapCtx) ? null : (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 30, display: 'flex', justifyContent: 'center', opacity: a}}>
    <div style={{maxWidth: 1500, padding: '12px 32px', borderRadius: 14, background: 'rgba(0,0,0,0.72)', border: '1px solid rgba(255,255,255,0.12)', fontFamily: FONT, fontSize: 32, fontWeight: 500, color: V.txt, textAlign: 'center'}}>{text}</div>
  </div>
);
const Heart: React.FC<{a: number; inj?: number}> = ({a, inj = 0}) => (
  <g opacity={a}>
    <path d={`M${CX},${CY + 120} C${CX - 150},${CY + 40} ${CX - 170},${CY - 90} ${CX - 80},${CY - 120} C${CX - 40},${CY - 135} ${CX - 10},${CY - 110} ${CX},${CY - 85} C${CX + 10},${CY - 110} ${CX + 40},${CY - 135} ${CX + 80},${CY - 120} C${CX + 170},${CY - 90} ${CX + 150},${CY + 40} ${CX},${CY + 120} Z`}
      fill="rgba(252,98,85,0.07)" stroke="rgba(236,239,244,0.55)" strokeWidth={3} />
    {inj > 0 && <ellipse cx={CX + 10} cy={CY + 70} rx={120} ry={60} fill="url(#inj)" opacity={inj} />}
  </g>
);
const Axes: React.FC<{t: number; s0: number; hl?: string[]; dimOthers?: number}> = ({t, s0, hl = [], dimOthers = 0}) => (
  <g>
    {LEADS.map((l, i) => {
      const k = ap(t, s0 + i * 0.35, 0.7, sm);
      const [x1, y1] = pt(l.a + 180, R * k), [x2, y2] = pt(l.a, R * k);
      const on = hl.includes(l.n);
      const op = hl.length && !on ? 1 - 0.65 * dimOthers : 1;
      const [lx, ly] = pt(l.a, R + 48);
      return (
        <g key={l.n} opacity={op}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={V.blue} strokeWidth={on ? 4 : 2.5} strokeDasharray="0" opacity={0.35} />
          <line x1={CX} y1={CY} x2={x2} y2={y2} stroke={V.blue} strokeWidth={on ? 5 : 3} filter="url(#gl)" />
          <circle cx={x2} cy={y2} r={6} fill={V.blue} opacity={k} />
          <text x={lx} y={ly + 12} textAnchor="middle" fill={on ? V.yel : V.blue} fontFamily={MONO} fontSize={34} fontWeight={700} opacity={ap(t, s0 + i * 0.35 + 0.5)}>{l.n}</text>
        </g>
      );
    })}
  </g>
);
const Arrow: React.FC<{a: number; len: number; c?: string; w?: number}> = ({a, len, c = V.yel, w = 8}) => {
  const [x, y] = pt(a, len);
  const h1 = pt(a + 160, 0), hx = x + Math.cos(rad(a + 155)) * 34, hy = y + Math.sin(rad(a + 155)) * 34, gx = x + Math.cos(rad(a - 155)) * 34, gy = y + Math.sin(rad(a - 155)) * 34;
  void h1;
  return (
    <g filter="url(#gl)">
      <line x1={CX} y1={CY} x2={x} y2={y} stroke={c} strokeWidth={w} strokeLinecap="round" />
      <path d={`M${x},${y} L${hx},${hy} L${gx},${gy} Z`} fill={c} />
    </g>
  );
};

// Bảng 6 chuyển đạo nhỏ: ST = k·cos(góc vector − góc chuyển đạo)
const BASE: Record<string, Lead> = {I: {r: 0.6, s: -0.12}, II: {r: 1.0, s: -0.2}, III: {r: 0.75, s: -0.15}, aVF: {r: 0.9, s: -0.18}, aVL: {r: 0.4, s: -0.25}, aVR: {p: -0.1, q: 0.05, r: -0.7, s: 0.1, t: -0.2}};
const Panel: React.FC<{t: number; ang: number; mag: number; a: number}> = ({t, ang, mag, a}) => (
  <g opacity={a}>
    {['I', 'II', 'III', 'aVR', 'aVL', 'aVF'].map((n, i) => {
      const L = LEADS.find((l) => l.n === n)!;
      const st = 0.3 * mag * Math.cos(rad(ang - L.a));
      const mm = st * 10;
      const col = mm > 1 ? V.red : mm < -0.8 ? V.blue : V.grn;
      const lead: Lead = {...BASE[n], st, t: (BASE[n].t ?? 0.3) + Math.max(0, st) * 1.1 + Math.min(0, st) * 0.6};
      const x0 = 1300, y0 = 190 + i * 118, w = 420;
      const pts: string[] = [];
      for (let u = 0; u <= 1.6; u += 0.004) pts.push(`${(x0 + (u / 1.6) * w).toFixed(1)},${(y0 + 50 - ecgAt(u, lead, 0.8, 0.12) * 70).toFixed(1)}`);
      return (
        <g key={n}>
          <rect x={x0 - 90} y={y0 - 12} width={w + 220} height={104} rx={12} fill="rgba(255,255,255,0.03)" stroke="rgba(88,196,221,0.18)" />
          <text x={x0 - 72} y={y0 + 60} fill={V.blue} fontFamily={MONO} fontSize={30} fontWeight={700}>{n}</text>
          <line x1={x0} x2={x0 + w} y1={y0 + 50} y2={y0 + 50} stroke="rgba(255,255,255,0.12)" strokeDasharray="6 6" />
          <polyline points={pts.join(' ')} fill="none" stroke={col} strokeWidth={3} strokeLinejoin="round" filter="url(#gl)" />
          <text x={x0 + w + 112} y={y0 + 62} textAnchor="end" fill={col} fontFamily={MONO} fontSize={30} fontWeight={700}>{(mm >= 0 ? '+' : '') + mm.toFixed(1).replace('.', ',')}</text>
        </g>
      );
    })}
    <text x={1300 + 420 + 112} y={170} textAnchor="end" fill={V.dim} fontFamily={MONO} fontSize={22}>ST (mm)</text>
    <text x={1210} y={170} fill={V.dim} fontFamily={FONT} fontSize={24} fontWeight={600}>ST tại từng chuyển đạo</text>
  </g>
);

// Cảnh 1: đường sóng → trục I → các trục xoè ra
const V1: React.FC = () => {
  const t = useT();
  const flat = ap(t, 0.5, 1.2, sm);
  const pts: string[] = [];
  for (let x = 0; x <= 1920; x += 4) {
    const v = ecgAt(x / 520, {}, 0.8);
    pts.push(`${x},${CY - v * 160 * (1 - flat)}`);
  }
  const shrink = ap(t, 1.6, 0.9, sm);
  const x0 = interpolate(shrink, [0, 1], [0, CX - R]), x1 = interpolate(shrink, [0, 1], [1920, CX + R]);
  return (
    <Room html={<Cap text="Đường sóng duỗi thẳng thành trục chuyển đạo I — rồi các góc nhìn khác lần lượt xuất hiện." a={ap(t, 0.3)} />}>
      {shrink < 1 && <polyline points={pts.filter((p) => {const x = +p.split(',')[0]; return x >= x0 && x <= x1;}).join(' ')} fill="none" stroke="#39FF8A" strokeWidth={4} filter="url(#gl)" opacity={1 - ap(t, 2.3, 0.3)} />}
      <Heart a={ap(t, 2.4, 0.8)} />
      <Axes t={t} s0={2.2} />
      <text x={90} y={110} fill={V.txt} fontFamily={FONT} fontSize={46} fontWeight={800} opacity={ap(t, 3.6)}>6 chuyển đạo chi = 6 "góc nhìn" quanh tim</text>
      <text x={90} y={160} fill={V.dim} fontFamily={FONT} fontSize={30} opacity={ap(t, 4.2)}>mỗi trục là hướng mà chuyển đạo đó "đứng nhìn"</text>
    </Room>
  );
};

// Cảnh 2: vector tổn thương xoay về thành dưới, bảng ST cập nhật thời gian thực
const V2: React.FC = () => {
  const t = useT();
  const ang = interpolate(t, [1.2, 5.5], [-20, 110], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: sm});
  const mag = ap(t, 0.4, 0.8);
  const inj = ap(t, 4.6, 1);
  return (
    <Room html={<Cap text="Vector xoay về thành dưới: II, III, aVF chênh lên — aVL và I chênh xuống. III cao nhất → nghĩ RCA." a={ap(t, 5.4)} />}>
      <Heart a={1} inj={inj} />
      <Axes t={t + 10} s0={0} />
      <Arrow a={ang} len={250 * mag} />
      <text x={90} y={110} fill={V.yel} fontFamily={FONT} fontSize={46} fontWeight={800} opacity={ap(t, 0.3)}>Vector tổn thương: chỉ VỀ PHÍA vùng thiếu máu</text>
      <text x={90} y={CY + 300} fill={V.red} fontFamily={FONT} fontSize={30} fontWeight={700} opacity={inj}>● vùng thành dưới thiếu máu</text>
      <text x={90} y={1000 - 120} fill={V.dim} fontFamily={MONO} fontSize={28} opacity={ap(t, 0.8)}>góc vector = {Math.round(ang)}°</text>
      <Panel t={t} ang={ang} mag={mag} a={ap(t, 0.6)} />
    </Room>
  );
};

// Cảnh 3: hình chiếu lên III (cùng hướng) và aVL (ngược hướng)
const V3: React.FC = () => {
  const t = useT();
  const ang = 110, L = 250;
  const [tx, ty] = pt(ang, L);
  const proj = (la: number) => L * Math.cos(rad(ang - la));
  const p3 = proj(120), pL = proj(-30);
  const k3 = ap(t, 0.8, 0.9, sm), kL = ap(t, 3.6, 0.9, sm);
  const [a3x, a3y] = pt(120, p3), [aLx, aLy] = pt(-30, pL);
  return (
    <Room html={<>
      <div style={{position: 'absolute', left: 1180, top: 210, width: 650, opacity: ap(t, 1.6), transform: `translateY(${(1 - ap(t, 1.6)) * 20}px)`}}>
        <div style={{fontFamily: FONT, fontSize: 30, fontWeight: 700, color: V.red}}>III — cùng hướng vector</div>
        <div style={{fontFamily: FONT, fontSize: 56, fontWeight: 800, color: V.txt, lineHeight: 1.15}}>hình chiếu DƯƠNG<br />→ ST chênh LÊN</div>
      </div>
      <div style={{position: 'absolute', left: 1180, top: 470, width: 650, opacity: ap(t, 4.4), transform: `translateY(${(1 - ap(t, 4.4)) * 20}px)`}}>
        <div style={{fontFamily: FONT, fontSize: 30, fontWeight: 700, color: V.blue}}>aVL — ngược hướng vector</div>
        <div style={{fontFamily: FONT, fontSize: 56, fontWeight: 800, color: V.txt, lineHeight: 1.15}}>hình chiếu ÂM<br />→ ST chênh XUỐNG</div>
      </div>
      <div style={{position: 'absolute', left: 1180, top: 740, width: 650, padding: '18px 26px', borderRadius: 16, border: `2px solid ${V.yel}`, background: 'rgba(255,224,102,0.08)', fontFamily: FONT, fontSize: 34, fontWeight: 800, color: V.yel, opacity: ap(t, 6), transform: `scale(${0.92 + 0.08 * ap(t, 6)})`}}>
        SOI GƯƠNG = cùng một vector,<br />nhìn từ phía đối diện
      </div>
      <Cap text="Chiếu vector lên từng trục: cùng hướng thì chênh lên, ngược hướng thì chênh xuống — đó là soi gương." a={ap(t, 0.4)} />
    </>}>
      <Heart a={1} inj={1} />
      <Axes t={t + 10} s0={0} hl={['III', 'aVL']} dimOthers={ap(t, 0.3)} />
      <Arrow a={ang} len={L} />
      {/* chiếu lên III */}
      <g opacity={k3}>
        <line x1={tx} y1={ty} x2={tx + (a3x - tx) * k3} y2={ty + (a3y - ty) * k3} stroke={V.txt} strokeWidth={2.5} strokeDasharray="8 7" />
        <line x1={CX} y1={CY} x2={CX + (a3x - CX) * k3} y2={CY + (a3y - CY) * k3} stroke={V.red} strokeWidth={14} strokeLinecap="round" filter="url(#gl)" opacity={0.9} />
      </g>
      {/* chiếu lên aVL (ra phía âm) */}
      <g opacity={kL}>
        <line x1={tx} y1={ty} x2={tx + (aLx - tx) * kL} y2={ty + (aLy - ty) * kL} stroke={V.txt} strokeWidth={2.5} strokeDasharray="8 7" />
        <line x1={CX} y1={CY} x2={CX + (aLx - CX) * kL} y2={CY + (aLy - CY) * kL} stroke={V.blue} strokeWidth={14} strokeLinecap="round" filter="url(#gl)" opacity={0.95} />
      </g>
    </Room>
  );
};

const FadeIn: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: interpolate(f, [0, 15], [0, 1], {extrapolateRight: 'clamp'})}}>{children}</AbsoluteFill>;
};
// Ghép: monitor → lao vào đường sóng → phòng vector
const Zoomer: React.FC<{children: React.ReactNode; start: number; dur: number}> = ({children, start, dur}) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [start, start + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  return (
    <AbsoluteFill style={{transform: `scale(${1 + 5 * k})`, transformOrigin: '600px 400px', opacity: 1 - interpolate(k, [0.6, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), filter: `blur(${k * 6}px)`}}>
      {children}
    </AbsoluteFill>
  );
};
export const VectorSample: React.FC = () => (
  <AbsoluteFill style={{background: V.bg}}>
    <Sequence from={0} durationInFrames={165}>
      <Zoomer start={125} dur={40}><MonitorScene /></Zoomer>
    </Sequence>
    <Sequence from={150} durationInFrames={225}><FadeIn><V1 /></FadeIn></Sequence>
    <Sequence from={375} durationInFrames={240}><V2 /></Sequence>
    <Sequence from={615} durationInFrames={270}><V3 /></Sequence>
  </AbsoluteFill>
);
export const VEC_DUR = 885;

export {V2 as VecRotate, V3 as VecProject};
