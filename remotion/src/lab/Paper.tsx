// Bản thử "Bàn đọc ECG" trên giấy hồng: thành trước (LAD), de Winter, thành sau (lật gương)
import React from 'react';
import {AbsoluteFill, Sequence, interpolate, Easing, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {FONT, useT, CapCtx} from '../lib';
import {beatV, tracePts, LAYOUT, Lead} from './ecg';
import {MONO} from './Lab';
import {Heart6} from '../wb/heart6';

const P = {paper: '#FFF6F2', minor: '#F6C9C1', major: '#EC9A8E', ink: '#1E1E24', hl: 'rgba(255,230,0,0.55)', pen: '#D7263D', blue: '#2563EB'};
const ap = (t: number, s: number, d = 0.6) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1)});
const sm = Easing.inOut(Easing.cubic);

// ---------- bộ 12 chuyển đạo ----------
const ANTERIOR: Record<string, Lead> = {
  I: {r: 0.6, s: -0.1, st: 0.08, t: 0.4}, II: {r: 0.9, s: -0.2, st: -0.05, t: 0.2}, III: {r: 0.5, s: -0.3, st: -0.12, t: -0.12},
  aVR: {p: -0.1, q: 0.05, r: -0.7, s: 0.1, t: -0.2}, aVL: {r: 0.45, s: -0.2, st: 0.1, t: 0.35}, aVF: {r: 0.7, s: -0.25, st: -0.1, t: -0.05},
  V1: {q: -0.3, r: 0.1, s: -0.9, st: 0.2, t: 0.55, tw: 0.08}, V2: {q: -0.4, r: 0.15, s: -1.0, st: 0.38, t: 0.95, tw: 0.085, tPos: 0.25},
  V3: {q: -0.3, r: 0.3, s: -0.8, st: 0.36, t: 0.95, tw: 0.085, tPos: 0.25}, V4: {r: 0.75, s: -0.4, st: 0.26, t: 0.75, tw: 0.08},
  V5: {r: 1.05, s: -0.25, st: 0.1, t: 0.45}, V6: {r: 0.9, s: -0.15, st: 0.04, t: 0.3},
};
const DEWINTER: Record<string, Lead> = {
  I: {r: 0.6, s: -0.1, t: 0.3}, II: {r: 0.9, s: -0.2, t: 0.3}, III: {r: 0.5, s: -0.25, t: 0.15},
  aVR: {p: -0.1, q: 0.05, r: -0.7, s: 0.1, st: 0.1, t: -0.15}, aVL: {r: 0.4, s: -0.2, t: 0.2}, aVF: {r: 0.7, s: -0.2, t: 0.25},
  V1: {r: 0.25, s: -0.9, st: -0.05, t: 0.45}, V2: {r: 0.3, s: -1.1, st: -0.2, t: 1.15, tw: 0.072, tPos: 0.24},
  V3: {r: 0.5, s: -0.8, st: -0.22, t: 1.25, tw: 0.072, tPos: 0.24}, V4: {r: 0.9, s: -0.4, st: -0.16, t: 1.05, tw: 0.072, tPos: 0.24},
  V5: {r: 1.05, s: -0.25, st: -0.1, t: 0.7, tw: 0.07}, V6: {r: 0.9, s: -0.15, st: -0.05, t: 0.5},
};
const POSTERIOR: Record<string, Lead> = {
  V1: {r: 0.75, s: -0.35, st: -0.22, t: 0.45, tw: 0.075}, V2: {r: 1.05, s: -0.3, st: -0.28, t: 0.55, tw: 0.075}, V3: {r: 1.1, s: -0.3, st: -0.22, t: 0.5, tw: 0.075},
};

const MM = 6, PXS = 25 * MM, PXMV = 10 * MM, CELL = 2.5 * PXS, PW = 1500, PH = 760;
const cellPos = (ld: string): [number, number] => {
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) if (LAYOUT[r][c] === ld) return [c * CELL, 20 + r * 180 + 110];
  return [0, 0];
};
const Grid: React.FC<{w: number; h: number; mm: number}> = ({w, h, mm}) => {
  const g: React.ReactNode[] = [];
  for (let i = 0; i <= w / mm; i++) g.push(<line key={'v' + i} x1={i * mm} x2={i * mm} y1={0} y2={h} stroke={i % 5 ? P.minor : P.major} strokeWidth={i % 5 ? 0.6 : 1.2} />);
  for (let j = 0; j <= h / mm; j++) g.push(<line key={'h' + j} x1={0} x2={w} y1={j * mm} y2={j * mm} stroke={j % 5 ? P.minor : P.major} strokeWidth={j % 5 ? 0.6 : 1.2} />);
  return <g><rect x={0} y={0} width={w} height={h} fill={P.paper} />{g}</g>;
};
type Ring = {lead: string[]; prog: number; color: string};
const Sheet: React.FC<{leads: Record<string, Lead>; hl?: Record<string, number>; rings?: Ring[]}> = ({leads, hl = {}, rings = []}) => (
  <svg viewBox={`0 0 ${PW} ${PH}`} width={PW} height={PH}>
    <Grid w={PW} h={PH} mm={MM} />
    {LAYOUT.map((row, r) => row.map((ld, c) => {
      const [x, y0] = cellPos(ld);
      const h = hl[ld] ?? 0;
      return (
        <g key={ld}>
          {h > 0 && <rect x={x + 8} y={y0 - 100} width={(CELL - 16) * h} height={150} fill={P.hl} style={{mixBlendMode: 'multiply'}} rx={8} />}
          <polyline points={tracePts(x, y0, c * 2.5, 2.5, PXS, PXMV, leads[ld] ?? {}, 0.8, 0.003, 0.15)} fill="none" stroke={P.ink} strokeWidth={1.8} strokeLinejoin="round" />
          <text x={x + 10} y={y0 - 74} fill={P.ink} fontFamily={MONO} fontSize={22} fontWeight={700}>{ld}</text>
          {c > 0 && <line x1={x} x2={x} y1={y0 - 15} y2={y0 + 15} stroke={P.ink} strokeWidth={1.5} />}
        </g>
      );
    }))}
    <polyline points={tracePts(0, 20 + 3 * 180 + 110, 0, 10, PXS, PXMV, leads.II ?? {}, 0.8, 0.003, 0.15)} fill="none" stroke={P.ink} strokeWidth={1.8} />
    <text x={10} y={20 + 3 * 180 + 36} fill={P.ink} fontFamily={MONO} fontSize={22} fontWeight={700}>II</text>
    <text x={PW - 10} y={PH - 8} fill="#9b6b64" fontFamily={MONO} fontSize={18} textAnchor="end">25 mm/s · 10 mm/mV</text>
    {rings.map((rg, i) => {
      const ps = rg.lead.map(cellPos);
      const xs = ps.map((p) => p[0]), ys = ps.map((p) => p[1]);
      const cx = (Math.min(...xs) + Math.max(...xs) + CELL) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2 - 20;
      const rx = (Math.max(...xs) - Math.min(...xs) + CELL) / 2 + 10, ry = (Math.max(...ys) - Math.min(...ys)) / 2 + 85;
      const pts: string[] = [];
      for (let a = 0; a <= rg.prog * Math.PI * 2.08; a += 0.04) pts.push(`${cx + Math.cos(a - 1.3) * (rx + 7 * noise2D('a' + i, a, 0))},${cy + Math.sin(a - 1.3) * (ry + 6 * noise2D('b' + i, 0, a))}`);
      return <polyline key={i} points={pts.join(' ')} fill="none" stroke={rg.color} strokeWidth={5} strokeLinecap="round" opacity={0.9} />;
    })}
  </svg>
);

const Desk: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 40% 35%, #3a4a52, #1d272c 75%)'}}>
    <AbsoluteFill style={{background: 'repeating-linear-gradient(95deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 9px)'}} />
    {children}
  </AbsoluteFill>
);
const Cap: React.FC<{text: string}> = ({text}) => !React.useContext(CapCtx) ? null : (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 30, display: 'flex', justifyContent: 'center'}}>
    <div style={{maxWidth: 1500, padding: '12px 32px', borderRadius: 16, background: 'rgba(20,24,30,0.88)', border: '1px solid rgba(255,255,255,0.15)', fontFamily: FONT, fontSize: 32, fontWeight: 500, color: '#F1F5F9', textAlign: 'center'}}>{text}</div>
  </div>
);
const Sticky: React.FC<{x: number; y: number; a: number; c: string; rot?: number; children: React.ReactNode; w?: number; size?: number}> = ({x, y, a, c, rot = -2, children, w = 420, size = 32}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, padding: '20px 24px', background: c, boxShadow: '0 12px 28px rgba(0,0,0,0.35)', transform: `rotate(${rot}deg) translateY(${(1 - a) * 30}px)`, opacity: a, fontFamily: FONT, fontSize: size, fontWeight: 700, color: '#26221C', lineHeight: 1.3}}>{children}</div>
);
// thẻ tim nhỏ: động mạch vành, chỗ tắc, vùng tổn thương
const HeartCard: React.FC<{x: number; y: number; a: number; occl: number; zone: number; label: string}> = ({x, y, a, occl, zone, label}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 360, height: 330, borderRadius: 18, background: '#0E1116', boxShadow: '0 16px 36px rgba(0,0,0,0.5)', opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>
    <svg viewBox="0 0 360 330" width={360} height={330}>
      <defs><radialGradient id="zA" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FC6255" stopOpacity="0.9" /><stop offset="1" stopColor="#FC6255" stopOpacity="0" /></radialGradient></defs>
      <path d="M180,290 C70,230 40,140 80,90 C110,55 160,60 180,95 C200,60 250,55 280,90 C320,140 290,230 180,290 Z" fill="rgba(252,98,85,0.08)" stroke="rgba(236,239,244,0.6)" strokeWidth={3} />
      <ellipse cx={205} cy={185} rx={70} ry={85} fill="url(#zA)" opacity={zone} />
      <path d="M180,95 C195,140 205,200 195,280" fill="none" stroke="#FC6255" strokeWidth={6} strokeLinecap="round" />
      <path d="M180,95 C240,100 280,140 285,170" fill="none" stroke="#FC6255" strokeWidth={4} opacity={0.6} strokeLinecap="round" />
      <path d="M170,95 C120,110 85,160 100,220" fill="none" stroke="#FC6255" strokeWidth={4} opacity={0.6} strokeLinecap="round" />
      <g opacity={occl} stroke="#FFE066" strokeWidth={6} strokeLinecap="round"><line x1={176} y1={115} x2={204} y2={143} /><line x1={204} y1={115} x2={176} y2={143} /></g>
      <text x={20} y={36} fill="#FFE066" fontFamily={FONT} fontSize={26} fontWeight={800}>{label}</text>
    </svg>
  </div>
);

// thẻ tim (ảnh minh hoạ) cho cảnh thành trước
const HeartCard6: React.FC<{x: number; y: number; a: number; occl: number; zone: number}> = ({x, y, a, occl, zone}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 380, height: 400, borderRadius: 8, background: '#FCFAF4', boxShadow: '0 16px 36px rgba(0,0,0,0.5)', opacity: a, transform: `rotate(2deg) translateY(${(1 - a) * 30}px)`}}>
    <svg viewBox="0 0 380 400" width={380} height={400}>
      <Heart6 id="ant6" x={22} y={34} s={0.62} prog={1} art={1} labels={false} hot="lad" occl={occl} zone="ant" zoneC="#2563EB" zoneA={zone} />
    </svg>
    <div style={{position: 'absolute', left: 18, top: 10, fontFamily: FONT, fontSize: 26, fontWeight: 800, color: '#C81E3A'}}>LAD tắc</div>
  </div>
);
// Cảnh 1: thành trước (LAD)
const A1: React.FC = () => {
  const t = useT();
  const z = ap(t, 1.4, 1.4);
  const s = interpolate(z, [0, 1], [0.95, 1.4]);
  const tx = interpolate(z, [0, 1], [130, 60 - 750 * 1.4]);
  const ty = interpolate(z, [0, 1], [150, 92]);
  const slide = 1 - ap(t, 0, 0.9);
  const hl: Record<string, number> = {};
  ['V1', 'V2', 'V3', 'V4'].forEach((l, i) => (hl[l] = ap(t, 3 + i * 0.45, 0.5)));
  return (
    <Desk>
      <div style={{position: 'absolute', left: 0, top: 0, width: PW, height: PH, transform: `translate(${tx}px, ${ty + slide * 900}px) scale(${s}) rotate(-0.8deg)`, transformOrigin: '0 0', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
        <Sheet leads={ANTERIOR} hl={hl} />
      </div>
      <Sticky x={1180} y={130} a={ap(t, 5)} c="#FFE873" w={330}>V1 – V4<br />ST chênh lên<br />→ THÀNH TRƯỚC</Sticky>
      <HeartCard6 x={1520} y={110} a={ap(t, 5.6)} occl={ap(t, 6.0, 0.6)} zone={ap(t, 6.3, 0.8)} />
      <Sticky x={1200} y={520} a={ap(t, 7.2)} c="#BFDBFE" rot={1.5} w={560} size={30}>Soi gương ở thành dưới: <b>III, aVF chênh xuống</b></Sticky>
      <Cap text="ST chênh lên từ V1 đến V4 — nhồi máu thành trước, thủ phạm là động mạch liên thất trước." />
    </Desk>
  );
};

// Cảnh 2: de Winter — kính lúp trên V3
const A2: React.FC = () => {
  const t = useT();
  const z = ap(t, 0.8, 1.2);
  const s = interpolate(z, [0, 1], [0.95, 1.4]);
  const tx = interpolate(z, [0, 1], [130, 60 - 750 * 1.4]);
  const ty = interpolate(z, [0, 1], [150, 92]);
  const lens = ap(t, 2.4, 0.8);
  const [lx, ly] = [1420, 470];
  const LR = 300, mm = 30;
  const L = DEWINTER.V3;
  const pts: string[] = [];
  for (let tt = -0.2; tt <= 0.48; tt += 0.002) pts.push(`${(lx - 300 + (tt + 0.2) * 25 * mm).toFixed(1)},${(ly + 120 - beatV(tt, L) * 10 * mm).toFixed(1)}`);
  const lg: React.ReactNode[] = [];
  for (let i = -12; i <= 12; i++) {
    lg.push(<line key={'v' + i} x1={lx + i * mm} x2={lx + i * mm} y1={ly - LR} y2={ly + LR} stroke={i % 5 ? P.minor : P.major} strokeWidth={i % 5 ? 1.2 : 2.4} />);
    lg.push(<line key={'h' + i} x1={lx - LR} x2={lx + LR} y1={ly + 120 + i * mm} y2={ly + 120 + i * mm} stroke={i % 5 ? P.minor : P.major} strokeWidth={i % 5 ? 1.2 : 2.4} />);
  }
  const xJ = lx - 300 + (0.2 + 0.06) * 25 * mm, yJ = ly + 120 - beatV(0.06, L) * 10 * mm;
  const xT = lx - 300 + (0.2 + 0.24) * 25 * mm, yT = ly + 120 - beatV(0.24, L) * 10 * mm;
  return (
    <Desk>
      <div style={{position: 'absolute', left: 0, top: 0, width: PW, height: PH, transform: `translate(${tx}px, ${ty}px) scale(${s}) rotate(-0.8deg)`, transformOrigin: '0 0', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
        <Sheet leads={DEWINTER} rings={[{lead: ['V2', 'V3'], prog: ap(t, 1.8, 0.9), color: P.pen}]} />
      </div>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: lens}}>
        <defs><clipPath id="lensc"><circle cx={lx} cy={ly} r={LR * (0.6 + 0.4 * lens)} /></clipPath></defs>
        <circle cx={lx + 10} cy={ly + 16} r={LR + 14} fill="rgba(0,0,0,0.35)" />
        <g clipPath="url(#lensc)">
          <rect x={lx - LR} y={ly - LR} width={2 * LR} height={2 * LR} fill={P.paper} />
          {lg}
          <line x1={lx - LR} x2={lx + LR} y1={ly + 120} y2={ly + 120} stroke={P.blue} strokeWidth={2.5} strokeDasharray="10 7" opacity={ap(t, 3.4)} />
          <polyline points={pts.join(' ')} fill="none" stroke={P.ink} strokeWidth={5} strokeLinejoin="round" />
          <circle cx={xJ} cy={yJ} r={10} fill={P.pen} opacity={ap(t, 3.6)} />
          <path d={`M${xJ + 10},${yJ - 4} Q${(xJ + xT) / 2},${yJ - 20} ${xT - 30},${yT + 60}`} fill="none" stroke={P.pen} strokeWidth={4} strokeDasharray="8 6" opacity={ap(t, 4.2)} />
        </g>
        <circle cx={lx} cy={ly} r={LR * (0.6 + 0.4 * lens)} fill="none" stroke="#2B3138" strokeWidth={18} />
        <circle cx={lx} cy={ly} r={LR * (0.6 + 0.4 * lens) - 9} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
        <line x1={lx - 220} y1={ly + 220} x2={lx - 330} y2={ly + 330} stroke="#2B3138" strokeWidth={34} strokeLinecap="round" />
        <text x={lx - LR + 40} y={ly - LR + 70} fill={P.ink} fontFamily={MONO} fontSize={34} fontWeight={700}>V3</text>
      </svg>
      <Sticky x={60} y={720} a={ap(t, 3.8)} c="#FECACA" w={470} size={28}>① J chênh XUỐNG, ST đi lên dốc</Sticky>
      <Sticky x={560} y={735} a={ap(t, 4.8)} c="#FFE873" w={470} rot={1.5} size={28}>② T cao, nhọn, ĐỐI XỨNG</Sticky>
      <Sticky x={1060} y={720} a={ap(t, 6)} c="#BBF7D0" w={300} rot={-1} size={28}>③ aVR chênh lên nhẹ</Sticky>
      <div style={{position: 'absolute', left: 60, top: 120, padding: '14px 26px', borderRadius: 14, background: P.pen, color: '#fff', fontFamily: FONT, fontSize: 38, fontWeight: 800, opacity: ap(t, 6.8), transform: `scale(${0.9 + 0.1 * ap(t, 6.8)})`, boxShadow: '0 12px 28px rgba(0,0,0,0.4)'}}>
        de Winter = TƯƠNG ĐƯƠNG STEMI → tắc LAD đoạn gần
      </div>
      <Cap text="Không có ST chênh lên — nhưng sóng de Winter vẫn là tắc động mạch liên thất trước đoạn gần." />
    </Desk>
  );
};

// Cảnh 3: thành sau — lật dải V1–V3
const A3: React.FC = () => {
  const t = useT();
  const flip = interpolate(t, [3.4, 4.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: sm});
  const sy = Math.cos(flip * Math.PI);
  const W0 = 1500, H0 = 440, mm = 10, pxs = 25 * mm, pxmv = 16 * mm, y0 = 270;
  const g: React.ReactNode[] = [];
  for (let i = 0; i <= W0 / mm; i++) g.push(<line key={'v' + i} x1={i * mm} x2={i * mm} y1={0} y2={H0} stroke={i % 5 ? P.minor : P.major} strokeWidth={i % 5 ? 0.8 : 1.6} />);
  for (let j = 0; j <= H0 / mm; j++) g.push(<line key={'h' + j} x1={0} x2={W0} y1={j * mm} y2={j * mm} stroke={j % 5 ? P.minor : P.major} strokeWidth={j % 5 ? 0.8 : 1.6} />);
  const names = flip > 0.5 ? ['V7', 'V8', 'V9'] : ['V1', 'V2', 'V3'];
  return (
    <Desk>
      <div style={{position: 'absolute', left: 210, top: 150, width: W0, height: H0, boxShadow: '0 30px 60px rgba(0,0,0,0.45)', transform: `scaleY(${sy})`, transformOrigin: '50% 50%', opacity: ap(t, 0, 0.6)}}>
        <svg viewBox={`0 0 ${W0} ${H0}`} width={W0} height={H0}>
          <rect x={0} y={0} width={W0} height={H0} fill={P.paper} />
          {g}
          {['V1', 'V2', 'V3'].map((ld, i) => {
            const x = i * 500;
            const pts: string[] = [];
            for (let tt = -0.25; tt <= 1.5; tt += 0.003) pts.push(`${(x + (tt + 0.25) * pxs * 1.1).toFixed(1)},${(y0 - beatV(((tt + 0.4) % 0.85) - 0.4, POSTERIOR[ld]) * pxmv).toFixed(1)}`);
            return (
              <g key={ld}>
                <polyline points={pts.join(' ')} fill="none" stroke={flip > 0.5 ? P.pen : P.ink} strokeWidth={3} strokeLinejoin="round" />
                <text x={x + 14} y={flip > 0.5 ? H0 - 18 : 44} fill={P.ink} fontFamily={MONO} fontSize={32} fontWeight={700} transform={flip > 0.5 ? `translate(0,${2 * (H0 - 30)}) scale(1,-1)` : undefined}>{names[i]}</text>
                {i > 0 && <line x1={x} x2={x} y1={y0 - 30} y2={y0 + 30} stroke={P.ink} strokeWidth={2} />}
              </g>
            );
          })}
        </svg>
      </div>
      <Sticky x={210} y={620} a={ap(t, 1) * (1 - ap(t, 3.2, 0.3))} c="#BFDBFE" w={760} size={30}>V1 – V3: ST chênh XUỐNG nằm ngang · R cao · T dương</Sticky>
      <Sticky x={1010} y={620} a={ap(t, 2) * (1 - ap(t, 3.2, 0.3))} c="#FFE873" w={640} rot={1.5} size={30}>Đừng vội nghĩ "thiếu máu dưới nội mạc"!</Sticky>
      <Sticky x={210} y={620} a={ap(t, 5.2)} c="#FECACA" w={820} size={30}>Lật ngược = nhìn từ PHÍA SAU: ST chênh LÊN + sóng Q</Sticky>
      <div style={{position: 'absolute', left: 1080, top: 610, width: 640, padding: '18px 26px', borderRadius: 14, background: P.pen, color: '#fff', fontFamily: FONT, fontSize: 34, fontWeight: 800, opacity: ap(t, 6.4), transform: `scale(${0.9 + 0.1 * ap(t, 6.4)})`, boxShadow: '0 12px 28px rgba(0,0,0,0.4)'}}>
        NMCT THÀNH SAU → gắn V7–V9: ST ≥ 0,5 mm
      </div>
      <Cap text="Lật dải V1–V3 lên: hình soi gương lộ ra ST chênh lên — đó là nhồi máu thành sau." />
    </Desk>
  );
};

const FadeIn: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: interpolate(f, [0, 12], [0, 1], {extrapolateRight: 'clamp'})}}>{children}</AbsoluteFill>;
};
export const PaperSample: React.FC = () => (
  <AbsoluteFill style={{background: '#1d272c'}}>
    <Sequence from={0} durationInFrames={285}><A1 /></Sequence>
    <Sequence from={285} durationInFrames={270}><FadeIn><A2 /></FadeIn></Sequence>
    <Sequence from={555} durationInFrames={255}><FadeIn><A3 /></FadeIn></Sequence>
  </AbsoluteFill>
);
export const PAPER_DUR = 810;

export {Sheet, Desk, Sticky, P as PP, cellPos};
export {A1 as PaperAnterior, A2 as PaperDeWinter, A3 as PaperPosterior};
