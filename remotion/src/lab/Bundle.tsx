// BÀI 4: BLOCK NHÁNH & BLOCK PHÂN NHÁNH TRÊN ĐIỆN TÂM ĐỒ — QRS rộng: nhìn V1 và V6
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, Easing, staticFile, useCurrentFrame} from 'remotion';
import data from '../data.json';
import keys from './bundle_keys.json';
import stations from './bundle_stations.json';
import {TimeMap, CapCtx, FONT, useT} from '../lib';
import {Caption, Progress} from '../Main';
import {MONO} from './Lab';
import {Fade, SeriesTag} from './Demo';
import {Heart6, SC as HSC, OX as HOX, OY as HOY} from '../wb/heart6';
import {HAND, RPath} from '../wb/wb';

const ap = (t: number, s: number, d = 0.6) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1)});
const dp = (t: number, s: number, d = 0.8) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
const useBeat = () => Math.max(0, Math.sin((useCurrentFrame() / 30) * 2 * Math.PI * 1.1)) ** 4;
const INK = '#1E1E24', PEN = '#C81E3A';
const CR = '#2563EB', CL = '#DC2626', CA = '#F59E0B', CPo = '#16A34A', CHIS = '#FDE047';
const DeskBg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 40% 35%, #3a4a52, #1d272c 75%)'}}>
    <AbsoluteFill style={{background: 'repeating-linear-gradient(95deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 9px)'}} />
    {children}
  </AbsoluteFill>
);
const Pink: React.FC<{w: number; h: number; mm: number}> = ({w, h, mm}) => {
  const g: React.ReactNode[] = [];
  for (let i = 0; i <= w / mm; i++) g.push(<line key={'v' + i} x1={i * mm} x2={i * mm} y1={0} y2={h} stroke={i % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={i % 5 ? 0.8 : 1.8} />);
  for (let j = 0; j <= h / mm; j++) g.push(<line key={'h' + j} x1={0} x2={w} y1={j * mm} y2={j * mm} stroke={j % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={j % 5 ? 0.8 : 1.8} />);
  return <g><rect width={w} height={h} fill="#FFF6F2" />{g}</g>;
};
const Memo: React.FC<{x: number; y: number; w: number; a: number; children: React.ReactNode}> = ({x, y, w, a, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, padding: '16px 22px', borderRadius: 16, background: '#FFF4C2', border: '2px solid #E8C547', opacity: a, transform: `translateY(${(1 - a) * 20}px)`, boxSizing: 'border-box', boxShadow: '0 12px 28px rgba(0,0,0,0.3)'}}>
    <div style={{fontFamily: FONT, fontSize: 20, fontWeight: 800, letterSpacing: 2, color: '#8A6D00'}}>GHI NHỚ</div>
    <div style={{fontFamily: FONT, fontSize: 31, fontWeight: 800, color: '#26221C', marginTop: 4, lineHeight: 1.3}}>{children}</div>
  </div>
);
const Card: React.FC<{x: number; y: number; w: number; a: number; c: string; title: React.ReactNode; children?: React.ReactNode}> = ({x, y, w, a, c, title, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, padding: '16px 22px', borderRadius: 16, background: '#FCFAF4', borderLeft: `10px solid ${c}`, boxShadow: '0 14px 30px rgba(0,0,0,0.35)', opacity: a, transform: `translateX(${(1 - a) * 40}px)`, boxSizing: 'border-box', fontFamily: FONT}}>
    <div style={{fontSize: 30, fontWeight: 800, color: c, lineHeight: 1.2}}>{title}</div>
    {children && <div style={{fontSize: 27, fontWeight: 600, color: '#26221C', marginTop: 6, lineHeight: 1.3}}>{children}</div>}
  </div>
);
const Head: React.FC<{t: number; children: React.ReactNode}> = ({t, children}) => (
  <div style={{position: 'absolute', left: 60, top: 64, fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#F8FAFC', opacity: ap(t, -1)}}>{children}</div>
);

// ================= mô hình hình dạng QRS (t tính từ đầu QRS, giây; biên độ mV) =================
type Morph = {c: [number, number, number][]; st?: number; t: [number, number, number]; end: number};
const g = (x: number, mu: number, w: number, a: number) => a * Math.exp(-((x - mu) ** 2) / (2 * w * w));
const sm = (x: number) => 1 / (1 + Math.exp(-x));
const beat = (m: Morph) => (x: number) => {
  let v = g(x, -0.12, 0.022, 0.12);
  for (const [mu, w, a] of m.c) v += g(x, mu, w, a);
  if (m.st) v += m.st * sm((x - m.end) / 0.006) * (1 - sm((x - (m.t[0] + 0.02)) / 0.03));
  v += g(x, m.t[0], m.t[1], m.t[2]);
  return v;
};
const M = {
  V1n: {c: [[0.015, 0.008, 0.22], [0.045, 0.012, -1.0]], t: [0.27, 0.045, 0.12], end: 0.08} as Morph,
  V6n: {c: [[0.008, 0.006, -0.12], [0.035, 0.011, 1.35], [0.065, 0.009, -0.2]], t: [0.27, 0.045, 0.32], end: 0.08} as Morph,
  V1r: {c: [[0.015, 0.008, 0.25], [0.045, 0.011, -0.55], [0.095, 0.016, 0.95]], t: [0.32, 0.05, -0.28], end: 0.125} as Morph,
  V6r: {c: [[0.008, 0.006, -0.12], [0.035, 0.011, 1.2], [0.095, 0.022, -0.45]], t: [0.32, 0.05, 0.3], end: 0.125} as Morph,
  V1l: {c: [[0.012, 0.007, 0.08], [0.075, 0.033, -1.5]], st: 0.2, t: [0.34, 0.06, 0.45], end: 0.145} as Morph,
  V6l: {c: [[0.045, 0.02, 1.0], [0.105, 0.022, 1.1]], st: -0.15, t: [0.34, 0.06, -0.38], end: 0.145} as Morph,
  DIl: {c: [[0.045, 0.02, 0.8], [0.105, 0.022, 0.9]], st: -0.12, t: [0.34, 0.06, -0.3], end: 0.145} as Morph,
  DIr: {c: [[0.008, 0.006, -0.08], [0.035, 0.011, 0.8], [0.095, 0.022, -0.35]], t: [0.32, 0.05, 0.22], end: 0.125} as Morph,
};
const mixM = (a: Morph, b: Morph, k: number) => (x: number) => beat(a)(x) * (1 - k) + beat(b)(x) * k;
// ô phóng to 1 nhát bóp
const Zoom: React.FC<{f: (x: number) => number; label: string; w?: number; h?: number; prog?: number; scale?: number; base?: number; children?: (X: (x: number) => number, Y: (v: number) => number) => React.ReactNode}> = ({f, label, w = 560, h = 420, prog = 1, scale = 1, base, children}) => {
  const mm = 20 * scale, pxs = 25 * mm, pxmv = 10 * mm * 0.75;
  const B = base ?? h * 0.55;
  const X = (x: number) => 70 + (x + 0.18) * pxs, Y = (v: number) => B - v * pxmv;
  const pts: string[] = [];
  for (let x = -0.18; X(x) < w - 10; x += 0.002) pts.push(`${X(x).toFixed(1)},${Y(f(x)).toFixed(1)}`);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{display: 'block'}}>
      <Pink w={w} h={h} mm={mm / 2} />
      <text x={16} y={42} fontFamily={MONO} fontSize={34} fontWeight={700} fill={INK}>{label}</text>
      <polyline points={pts.join(' ')} fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
      {children?.(X, Y)}
    </svg>
  );
};
const Br: React.FC<{x0: number; x1: number; y: number; c: string; label: string; a: number; up?: boolean; size?: number}> = ({x0, x1, y, c, label, a, up, size = 26}) => {
  const k = up ? -1 : 1;
  return (
    <g opacity={a}>
      <path d={`M${x0},${y - 10 * k} v${10 * k} H${x0 + (x1 - x0) * Math.min(1, a * 1.2)} v${-10 * k}`} fill="none" stroke={c} strokeWidth={4} />
      <text x={(x0 + x1) / 2} y={y + (up ? -16 : 36)} textAnchor="middle" fontFamily={MONO} fontSize={size} fontWeight={700} fill={c}>{label}</text>
    </g>
  );
};
const Box: React.FC<{x: number; y: number; a: number; children: React.ReactNode}> = ({x, y, a, children}) => (
  <div style={{position: 'absolute', left: x, top: y, borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.45)', opacity: a, transform: `translateY(${(1 - a) * 40}px)`}}>{children}</div>
);

// ================= hệ dẫn truyền trong thất trên ảnh tim (toạ độ ảnh 1264×1264) =================
const P0 = {his0: [600, 650], his1: [650, 720], rb: [[640, 760], [585, 880], [565, 1000]], lbm: [[660, 735], [700, 775]], laf: [[700, 775], [790, 815], [880, 860]], lpf: [[700, 775], [745, 900], [770, 1040]]};
const h2s = (x: number, y: number, s: number, p: number[]): [number, number] => [x + s * (HOX + p[0] * HSC), y + s * (HOY + p[1] * HSC)];
type Blk = {rb?: boolean; laf?: boolean; lpf?: boolean; lb?: boolean};
const Branches: React.FC<{x: number; y: number; s: number; a: number; blk?: Blk; glow?: number; labels?: number; flow?: number}> = ({x, y, s, a, blk = {}, glow = 0, labels = 0, flow}) => {
  const P = (p: number[]) => h2s(x, y, s, p);
  const path = (pts: number[][]) => pts.map((p, i) => { const [px, py] = P(p); return `${i ? 'L' : 'M'}${px},${py}`; }).join(' ');
  const line = (pts: number[][], c: string, off: boolean, w = 9) => (
    <g>
      <path d={path(pts)} stroke="#111827" strokeWidth={w + 5} fill="none" strokeLinecap="round" opacity={0.6} />
      <path d={path(pts)} stroke={off ? '#64748B' : c} strokeWidth={w} fill="none" strokeLinecap="round" strokeDasharray={off ? '10 8' : undefined} />
    </g>
  );
  const X = (pts: number[][], k: number) => {
    const [px, py] = P(pts[Math.floor(pts.length / 2)]);
    return <g opacity={k} transform={`translate(${px} ${py}) scale(${0.5 + 0.5 * k})`}><circle r={22} fill={PEN} stroke="#fff" strokeWidth={3} /><path d="M-9,-9 L9,9 M9,-9 L-9,9" stroke="#fff" strokeWidth={5} strokeLinecap="round" /></g>;
  };
  const lbOff = blk.lb;
  const lab = (p: number[], t: string, c: string, dx: number, dy: number) => {
    const [px, py] = P(p);
    const w = t.length * 12.5 + 24;
    const bx = dx < 0 ? px + dx - w : px + dx;
    return (
      <g opacity={labels}>
        <line x1={px} y1={py} x2={dx < 0 ? bx + w : bx} y2={py + dy} stroke="#fff" strokeWidth={2} />
        <rect x={bx} y={py + dy - 20} width={w} height={38} rx={19} fill={c} />
        <text x={bx + w / 2} y={py + dy + 8} textAnchor="middle" fontFamily={FONT} fontSize={22} fontWeight={800} fill="#fff">{t}</text>
      </g>
    );
  };
  return (
    <g opacity={a}>
      {line([P0.his0, P0.his1], CHIS, false, 11)}
      {line([P0.his1, ...P0.rb], CR, !!blk.rb)}
      {line([P0.his1, ...P0.lbm], CL, !!lbOff, 11)}
      {line(P0.laf, CA, !!(blk.laf || lbOff))}
      {line(P0.lpf, CPo, !!(blk.lpf || lbOff))}
      {glow > 0 && <circle cx={P(P0.his1)[0]} cy={P(P0.his1)[1]} r={18 + 10 * glow} fill={CHIS} opacity={0.5 * glow} />}
      {blk.rb && X(P0.rb, 1)}
      {blk.lb && X(P0.lbm, 1)}
      {blk.laf && X(P0.laf, 1)}
      {blk.lpf && X(P0.lpf, 1)}
      {flow !== undefined && flow > 0 && (() => {
        const dots: [number, number, string][] = [];
        const along = (pts: number[][], k: number) => {
          const seg = pts.length - 1, f = Math.min(0.999, k) * seg, i = Math.floor(f), r = f - i;
          const a0 = P(pts[i]), a1 = P(pts[i + 1]);
          return [a0[0] + (a1[0] - a0[0]) * r, a0[1] + (a1[1] - a0[1]) * r] as [number, number];
        };
        if (!blk.rb) dots.push([...along([P0.his1, ...P0.rb], flow), CR]);
        if (!lbOff) {
          if (!blk.laf) dots.push([...along([P0.his1, ...P0.lbm.slice(1), ...P0.laf.slice(1)], flow), CA]);
          if (!blk.lpf) dots.push([...along([P0.his1, ...P0.lbm.slice(1), ...P0.lpf.slice(1)], flow), CPo]);
        }
        return dots.map(([dx, dy, c], i) => <circle key={i} cx={dx} cy={dy} r={10} fill="#fff" stroke={c} strokeWidth={5} />);
      })()}
      {lab(P0.his0, 'bó His', '#A16207', -60, -40)}
      {lab(P0.rb[1], 'nhánh phải', CR, -70, 30)}
      {lab(P0.laf[2], 'phân nhánh trái trước', CA, -10, -80)}
      {lab(P0.lpf[1], 'phân nhánh trái sau', CPo, 60, 60)}
    </g>
  );
};

// ================= THANH TRẠM =================
const ST7 = ['NGUYÊN TẮC', 'BLOCK NHÁNH PHẢI', 'BLOCK NHÁNH TRÁI', 'KHÔNG HOÀN TOÀN', 'BLOCK PHÂN NHÁNH', 'ST–T THỨ PHÁT', 'ÔN TẬP'];
const STC = ['#14B8A6', CR, CL, '#64748B', CA, '#EC4899', '#22C55E'];
const StationBar: React.FC = () => {
  const f = useCurrentFrame();
  const idx = data.scenes.findIndex((s) => f >= s.from && f < s.from + s.dur);
  const cur = idx >= 0 ? (stations as number[])[idx] : 0;
  if (!cur) return null;
  return (
    <div style={{position: 'absolute', right: 22, top: 6, display: 'flex', gap: 6, alignItems: 'center', padding: '5px 8px', borderRadius: 12, background: 'rgba(8,12,18,0.78)', border: '1px solid rgba(255,255,255,0.14)', fontFamily: FONT}}>
      {ST7.map((n, i) => {
        const on = i + 1 === cur, past = i + 1 < cur;
        return on ? (
          <div key={n} style={{display: 'flex', alignItems: 'center', gap: 8, padding: '3px 14px 3px 4px', borderRadius: 16, background: STC[i]}}>
            <span style={{width: 24, height: 24, borderRadius: 12, background: 'rgba(0,0,0,0.25)', color: '#fff', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</span>
            <span style={{fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: 1}}>{n}</span>
          </div>
        ) : (
          <span key={n} style={{width: 24, height: 24, borderRadius: 12, border: `2px solid ${past ? STC[i] : 'rgba(255,255,255,0.25)'}`, background: past ? STC[i] + '55' : 'transparent', color: past ? '#fff' : 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</span>
        );
      })}
    </div>
  );
};

// ================= 0 · BÌA =================
const Cover: React.FC = () => {
  const t = useT();
  const beatv = useBeat();
  const rt = useCurrentFrame() / 30;
  const HX = 1180, HY = 130, HS = 1.25;
  const flow = ((rt % 1.4) / 1.4) * 1.2;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 40%, #1B2E3A, #0B1218 75%)'}}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="cvn" x={HX} y={HY} s={HS} prog={dp(t, 0.2, 1.2)} art={1} labels={false} beat={beatv} />
        <Branches x={HX} y={HY} s={HS} a={ap(t, 1.0)} flow={flow} />
      </svg>
      <div style={{position: 'absolute', left: 110, top: 140, fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: 4, color: '#5EEAD4', opacity: ap(t, 0.2)}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 4</div>
      <div style={{position: 'absolute', left: 106, top: 186, width: 1050, fontFamily: FONT, fontSize: 84, fontWeight: 800, lineHeight: 1.06, color: '#F8FAFC', opacity: ap(t, 0.4)}}>
        Block nhánh &amp;<br /><span style={{color: '#60A5FA'}}>Block phân nhánh</span>
      </div>
      <div style={{position: 'absolute', left: 112, top: 372, fontFamily: FONT, fontSize: 30, fontWeight: 600, color: '#CBD5E1', opacity: ap(t, 0.8)}}>trên điện tâm đồ · <span style={{color: '#FDE047'}}>QRS rộng: nhìn V1 và V6</span></div>
      <div style={{position: 'absolute', left: 110, top: 460, display: 'flex', gap: 16, flexWrap: 'wrap', width: 1000}}>
        {[['V1 hướng LÊN', '→ nhánh PHẢI', CR, 4.0], ['V1 hướng XUỐNG', '→ nhánh TRÁI', CL, 4.4], ['Phân nhánh', '→ nhìn TRỤC', CA, 4.8]].map(([a, b, c, s]) => {
          const k = ap(t, s as number, 0.4);
          return (
            <div key={a as string} style={{padding: '12px 22px', borderRadius: 18, background: 'rgba(255,255,255,0.06)', border: `3px solid ${c}`, opacity: k, transform: `scale(${0.85 + 0.15 * k})`, fontFamily: FONT}}>
              <span style={{fontSize: 30, fontWeight: 700, color: '#E2E8F0'}}>{a as string} </span>
              <span style={{fontSize: 34, fontWeight: 900, color: c as string}}>{b as string}</span>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 112, top: 820, fontFamily: FONT, fontSize: 20, color: '#94A3B8', opacity: ap(t, 1.0)}}>Nguồn: AHA/ACCF/HRS ECG Recommendations Part III (Intraventricular Conduction) · 2018 ACC/AHA/HRS · 2021 ESC · LITFL</div>
    </AbsoluteFill>
  );
};

// ================= 1 · HỆ DẪN TRUYỀN TRONG THẤT =================
const Conduction: React.FC = () => {
  const t = useT();
  const rt = useCurrentFrame() / 30;
  const HX = 40, HY = 100, HS = 1.3;
  const flow = ((rt % 1.6) / 1.6) * 1.2;
  return (
    <DeskBg>
      <Head t={t}>Hệ dẫn truyền trong thất</Head>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="cond" x={HX} y={HY} s={HS} prog={1} art={1} labels={false} />
        <Branches x={HX} y={HY} s={HS} a={1} labels={ap(t, 0.4)} flow={t > 4 ? flow : 0} />
      </svg>
      <Box x={900} y={140} a={ap(t, 6.0)}><Zoom f={beat(M.V1n)} label="V1" w={460} h={340} base={170}>
        {(X, Y) => <g opacity={ap(t, 6.4)}><circle cx={X(0.015)} cy={Y(0.22)} r={20} fill="none" stroke={PEN} strokeWidth={4} /><text x={X(0.015) + 26} y={Y(0.22) - 18} fontFamily={HAND} fontSize={30} fill={PEN}>r nhỏ</text></g>}
      </Zoom></Box>
      <Box x={1400} y={140} a={ap(t, 6.2)}><Zoom f={beat(M.V6n)} label="V6" w={460} h={340} base={240}>
        {(X, Y) => <g opacity={ap(t, 6.6)}><circle cx={X(0.008)} cy={Y(-0.12)} r={20} fill="none" stroke={PEN} strokeWidth={4} /><text x={X(0.008) - 26} y={Y(-0.12) + 50} textAnchor="end" fontFamily={HAND} fontSize={30} fill={PEN}>q nhỏ</text></g>}
      </Zoom></Box>
      <Card x={900} y={520} w={960} a={ap(t, 0)} c="#A16207" title="Bó His → nhánh PHẢI + nhánh TRÁI">nhánh trái → phân nhánh trái trước + phân nhánh trái sau</Card>
      <Card x={900} y={680} w={960} a={ap(t, 4.0)} c="#16A34A" title="Bình thường: 2 thất khử cực gần như cùng lúc">→ QRS hẹp &lt; 0,12 s</Card>
      <Memo x={900} y={830} w={960} a={ap(t, 6.0)}>Vách khử cực đầu tiên, từ TRÁI → PHẢI</Memo>
    </DeskBg>
  );
};

// ================= 2 · KHI MỘT NHÁNH BỊ BLOCK =================
const Mechanism: React.FC = () => {
  const t = useT();
  const rt = useCurrentFrame() / 30;
  const HX = 40, HY = 100, HS = 1.3;
  const P = (p: number[]) => h2s(HX, HY, HS, p);
  // xung đi vòng qua cơ tim từ thất trái sang thất phải
  const ph = ((rt % 2.2) / 2.2);
  const k = interpolate(ph, [0.3, 0.9], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const a0 = P([760, 960]), a1 = P([600, 1060]), a2 = P([470, 900]);
  const cx = k < 0.5 ? a0[0] + (a1[0] - a0[0]) * k * 2 : a1[0] + (a2[0] - a1[0]) * (k - 0.5) * 2;
  const cy = k < 0.5 ? a0[1] + (a1[1] - a0[1]) * k * 2 : a1[1] + (a2[1] - a1[1]) * (k - 0.5) * 2;
  const wide = dp(t, 2.0, 1.4);
  return (
    <DeskBg>
      <Head t={t}>Khi một nhánh bị block</Head>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="mech" x={HX} y={HY} s={HS} prog={1} art={1} labels={false} zone={t > 1 ? 'rv' : null} zoneC={CR} zoneA={ap(t, 1.0) * 0.8} />
        <Branches x={HX} y={HY} s={HS} a={1} blk={{rb: true}} flow={((rt % 2.2) / 2.2) * 1.5} />
        {t > 0.6 && ph > 0.3 && ph < 0.95 && (
          <g>
            <path d={`M${a0[0]},${a0[1]} Q${a1[0]},${a1[1] + 40} ${a2[0]},${a2[1]}`} fill="none" stroke="#FDE047" strokeWidth={5} strokeDasharray="12 10" opacity={0.8} />
            <circle cx={cx} cy={cy} r={14} fill="#FDE047" stroke="#111" strokeWidth={3} />
          </g>
        )}
        <text x={P([560, 1080])[0] - 60} y={P([560, 1080])[1] + 60} fontFamily={HAND} fontSize={38} fill="#FDE047" opacity={ap(t, 0.6)}>đi vòng, chậm…</text>
      </svg>
      <Box x={900} y={140} a={ap(t, 1.6)}><Zoom f={mixM(M.V1n, M.V1r, wide)} label="V1" w={960} h={420} base={260} scale={1.1}>
        {(X) => <Br x0={X(0)} x1={X(0.08 + 0.045 * wide)} y={340} c={PEN} label={wide > 0.6 ? 'QRS ≥ 0,12 s' : 'QRS hẹp'} a={ap(t, 2.4)} size={30} />}
      </Zoom></Box>
      <Card x={900} y={585} w={960} a={ap(t, 0)} c={PEN} title="Xung đi VÒNG qua cơ tim — chậm" />
      <Card x={900} y={685} w={960} a={ap(t, 2.0)} c={PEN} title="Thất bị block khử cực SAU → QRS RỘNG ≥ 0,12 s" />
      <Memo x={900} y={790} w={960} a={ap(t, 6.0)}>Khử cực muộn hướng về thất bị block → nhìn <span style={{color: CR}}>V1</span> (phải) &amp; <span style={{color: CL}}>V6</span> (trái)</Memo>
    </DeskBg>
  );
};

// ================= 3 · BLOCK NHÁNH PHẢI =================
const RBBB: React.FC = () => {
  const t = useT();
  return (
    <DeskBg>
      <Head t={t}>Block nhánh PHẢI</Head>
      <Box x={60} y={130} a={ap(t, -1)}><Zoom f={beat(M.V1r)} label="V1" w={640} h={470} base={300} prog={dp(t, 1.8, 1.2)}>
        {(X, Y) => (
          <g>
            <g opacity={ap(t, 2.8)}>
              <text x={X(0.015)} y={Y(0.25) - 18} textAnchor="middle" fontFamily={MONO} fontSize={30} fontWeight={700} fill={CR}>r</text>
              <text x={X(0.045) + 22} y={Y(-0.55) + 14} fontFamily={MONO} fontSize={30} fontWeight={700} fill={CR}>S</text>
              <text x={X(0.095)} y={Y(0.95) - 18} textAnchor="middle" fontFamily={MONO} fontSize={34} fontWeight={700} fill={CR}>R′</text>
              <text x={X(0.18)} y={Y(0.95) - 30} fontFamily={HAND} fontSize={42} fill={PEN}>“tai thỏ” 🐰</text>
            </g>
            <Br x0={X(0)} x1={X(0.125)} y={395} c={PEN} label="QRS ≥ 0,12 s" a={ap(t, 6.0)} />
            <text x={X(0.36)} y={Y(-0.28) + 56} textAnchor="start" fontFamily={HAND} fontSize={30} fill="#7C3AED" opacity={ap(t, 6.4)}>T đảo (thứ phát)</text>
          </g>
        )}
      </Zoom></Box>
      <Box x={730} y={130} a={ap(t, 4.0)}><Zoom f={beat(M.V6r)} label="V6" w={500} h={470} base={300}>
        {(X, Y) => <g opacity={ap(t, 4.4)}><rect x={X(0.07)} y={Y(0.05)} width={X(0.125) - X(0.07)} height={Y(-0.45) - Y(0.05) + 10} fill="rgba(37,99,235,0.25)" /><text x={X(0.125) + 10} y={Y(-0.45) + 30} fontFamily={HAND} fontSize={34} fill={CR}>S rộng</text></g>}
      </Zoom></Box>
      <Card x={1260} y={130} w={600} a={ap(t, 0)} c={CR} title="Thất PHẢI khử cực muộn" />
      <Card x={1260} y={250} w={600} a={ap(t, 2.0)} c={CR} title="V1 – V2: rsR′ / rSR′">R′ muộn hướng LÊN</Card>
      <Card x={1260} y={410} w={600} a={ap(t, 4.0)} c={CR} title="DI, V6: S rộng">&gt; 40 ms hoặc dài hơn R</Card>
      <Card x={1260} y={570} w={600} a={ap(t, 6.0)} c={PEN} title="QRS ≥ 0,12 s">thời gian đỉnh R V5–V6 bình thường</Card>
      <Memo x={60} y={660} w={1170} a={ap(t, 8.0)}>V1 hướng <span style={{color: CR}}>LÊN</span> → nhánh <span style={{color: CR}}>PHẢI</span></Memo>
    </DeskBg>
  );
};

// ================= 4 · Ý NGHĨA BLOCK NHÁNH PHẢI =================
const RBBBmean: React.FC = () => {
  const t = useT();
  const rows: [string, string, number][] = [['Có thể gặp ở người khỏe mạnh', '#16A34A', 0], ['Thông liên nhĩ · tăng áp phổi · thuyên tắc phổi · bệnh tim thiếu máu', CR, 2], ['Mới xuất hiện → đối chiếu lâm sàng', CA, 4], ['Ít che lấp chẩn đoán nhồi máu cơ tim', '#7C3AED', 6]];
  return (
    <DeskBg>
      <Head t={t}>Block nhánh phải · ý nghĩa</Head>
      <Box x={60} y={150} a={ap(t, -1)}><Zoom f={beat(M.V1r)} label="V1" w={560} h={400} base={260} /></Box>
      {rows.map(([s, c, t0], i) => <Card key={i} x={680} y={150 + i * 170} w={1180} a={ap(t, t0)} c={c} title={s} />)}
    </DeskBg>
  );
};

// ================= 5 · BLOCK NHÁNH TRÁI =================
const LBBB: React.FC = () => {
  const t = useT();
  const HX = 1240, HY = 520, HS = 0.5;
  return (
    <DeskBg>
      <Head t={t}>Block nhánh TRÁI</Head>
      <Box x={60} y={130} a={ap(t, 3.6)}><Zoom f={beat(M.V1l)} label="V1" w={560} h={470} base={200}>
        {(X, Y) => <g opacity={ap(t, 4.2)}><text x={X(0.075) + 40} y={Y(-1.5) + 10} fontFamily={HAND} fontSize={36} fill={CL}>QS sâu, rộng ↓</text></g>}
      </Zoom></Box>
      <Box x={650} y={130} a={ap(t, 5.6)}><Zoom f={beat(M.V6l)} label="V6" w={560} h={470} base={330}>
        {(X, Y) => (
          <g>
            <g opacity={ap(t, 6.2)}><text x={X(0.075)} y={Y(1.2) - 24} textAnchor="middle" fontFamily={HAND} fontSize={36} fill={CL}>R khấc “M”</text></g>
            <g opacity={ap(t, 2.4)}><circle cx={X(0)} cy={Y(0)} r={22} fill="none" stroke={PEN} strokeWidth={4} /><text x={X(0) - 30} y={Y(0) - 34} textAnchor="end" fontFamily={HAND} fontSize={32} fill={PEN}>mất q</text></g>
            <Br x0={X(0)} x1={X(0.105)} y={Y(0) + 60} c={CL} label="đỉnh R > 60 ms" a={ap(t, 8.0)} size={24} />
          </g>
        )}
      </Zoom></Box>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <g opacity={ap(t, 0)}>
          <rect x={60} y={640} width={1150} height={260} rx={16} fill="#FCFAF4" />
          <text x={90} y={690} fontFamily={FONT} fontSize={28} fontWeight={800} fill={INK}>Khử cực vách</text>
          <g opacity={1 - ap(t, 2.0)}><line x1={760} y1={780} x2={520} y2={780} stroke="#16A34A" strokeWidth={10} markerEnd="url(#arL)" /><text x={540} y={840} fontFamily={FONT} fontSize={26} fontWeight={800} fill="#16A34A">bình thường: TRÁI → PHẢI</text></g>
          <g opacity={ap(t, 2.0)}><line x1={520} y1={780} x2={760} y2={780} stroke={CL} strokeWidth={10} markerEnd="url(#arR)" /><text x={460} y={840} fontFamily={FONT} fontSize={26} fontWeight={800} fill={CL}>block nhánh trái: PHẢI → TRÁI</text></g>
          <text x={340} y={790} textAnchor="end" fontFamily={FONT} fontSize={30} fontWeight={900} fill={CR}>thất P</text>
          <text x={940} y={790} fontFamily={FONT} fontSize={30} fontWeight={900} fill={CL}>thất T</text>
        </g>
        <defs>
          <marker id="arL" markerUnits="userSpaceOnUse" markerWidth="34" markerHeight="34" refX="4" refY="17" orient="auto"><path d="M0,0 L30,17 L0,34 Z" fill="#16A34A" /></marker>
          <marker id="arR" markerUnits="userSpaceOnUse" markerWidth="34" markerHeight="34" refX="4" refY="17" orient="auto"><path d="M0,0 L30,17 L0,34 Z" fill={CL} /></marker>
        </defs>
      </svg>
      <Card x={1260} y={130} w={600} a={ap(t, 0)} c={CL} title="Thất TRÁI khử cực muộn" />
      <Card x={1260} y={250} w={600} a={ap(t, 2.0)} c={CL} title="Vách khử cực ngược">→ MẤT q ở DI, V5, V6</Card>
      <Card x={1260} y={410} w={600} a={ap(t, 4.0)} c={CL} title="V1: QS / rS sâu, rộng ↓" />
      <Card x={1260} y={530} w={600} a={ap(t, 6.0)} c={CL} title="DI, aVL, V5, V6: R rộng, khấc" />
      <Card x={1260} y={650} w={600} a={ap(t, 8.0)} c={PEN} title="QRS ≥ 0,12 s · đỉnh R V5–V6 > 60 ms" />
      <Memo x={1260} y={790} w={600} a={ap(t, 10.0)}>V1 hướng <span style={{color: CL}}>XUỐNG</span> → nhánh <span style={{color: CL}}>TRÁI</span></Memo>
    </DeskBg>
  );
};

// ================= 6 · Ý NGHĨA BLOCK NHÁNH TRÁI =================
const LBBBmean: React.FC = () => {
  const t = useT();
  const beatv = useBeat();
  return (
    <DeskBg>
      <Head t={t}>Block nhánh trái · ý nghĩa</Head>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="lbm" x={20} y={110} s={1.2} prog={1} art={1} labels={false} beat={beatv} zone="lv" zoneC={CL} zoneA={ap(t, 0.3) * 0.85} />
      </svg>
      <Card x={760} y={140} w={1100} a={ap(t, 0)} c={CL} title="Thường gợi ý BỆNH TIM THỰC THỂ" />
      <Card x={760} y={270} w={1100} a={ap(t, 2.0)} c="#475569" title="Nguyên nhân">tăng huyết áp · bệnh mạch vành · bệnh cơ tim · hẹp van động mạch chủ</Card>
      <Card x={760} y={440} w={1100} a={ap(t, 4.0)} c="#7C3AED" title="Che lấp chẩn đoán">nhồi máu cơ tim · phì đại thất trái</Card>
      <div style={{position: 'absolute', left: 760, top: 620, width: 1100, padding: '18px 26px', borderRadius: 16, background: PEN, color: '#fff', fontFamily: FONT, fontSize: 34, fontWeight: 800, opacity: ap(t, 6.0), transform: `scale(${0.92 + 0.08 * ap(t, 6.0)})`, transformOrigin: 'left center', boxSizing: 'border-box', boxShadow: '0 12px 28px rgba(0,0,0,0.4)'}}>Nghi nhồi máu trên nền block nhánh trái → tiêu chuẩn Sgarbossa (bài sau)</div>
    </DeskBg>
  );
};

// ================= mẫu thêm cho phần 2 =================
const M2 = {
  V1inc: {c: [[0.015, 0.008, 0.25], [0.042, 0.011, -0.6], [0.078, 0.012, 0.45]], t: [0.29, 0.045, -0.1], end: 0.105} as Morph,
  ivcd: {c: [[0.01, 0.007, -0.08], [0.055, 0.03, 1.0], [0.11, 0.015, -0.15]], t: [0.32, 0.05, 0.25], end: 0.12} as Morph,
  qR: {c: [[0.01, 0.007, -0.18], [0.04, 0.013, 1.0]], t: [0.27, 0.045, 0.25], end: 0.08} as Morph,
  rS: {c: [[0.015, 0.008, 0.25], [0.048, 0.013, -0.95]], t: [0.27, 0.045, 0.15], end: 0.085} as Morph,
  aVLrl: {c: [[0.01, 0.007, -0.18], [0.04, 0.013, 1.0], [0.1, 0.022, -0.32]], t: [0.32, 0.05, 0.2], end: 0.135} as Morph,
  DIrl: {c: [[0.01, 0.007, -0.1], [0.04, 0.013, 0.7], [0.1, 0.022, -0.35]], t: [0.32, 0.05, 0.2], end: 0.135} as Morph,
};
const Mini: React.FC<{f: (x: number) => number; label: string; x: number; y: number; a: number; w?: number; h?: number; base?: number; children?: (X: (x: number) => number, Y: (v: number) => number) => React.ReactNode}> = ({f, label, x, y, a, w = 300, h = 230, base, children}) => (
  <Box x={x} y={y} a={a}><Zoom f={f} label={label} w={w} h={h} base={base ?? h * 0.55} scale={0.62}>{children}</Zoom></Box>
);
// vòng trục điện tim (0° bên phải, +90° xuống dưới)
const AxisWheel: React.FC<{cx: number; cy: number; r: number; a0: number; a1: number; c: string; ang: number; k: number; label: string}> = ({cx, cy, r, a0, a1, c, ang, k, label}) => {
  const pt = (d: number, rr = r) => [cx + rr * Math.cos((d * Math.PI) / 180), cy + rr * Math.sin((d * Math.PI) / 180)];
  const [x0, y0] = pt(a0), [x1, y1] = pt(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  const cur = interpolate(k, [0, 1], [0, ang]);
  const [ax, ay] = pt(cur, r * 0.86);
  const ticks: [number, string][] = [[0, '0° DI'], [90, '+90° aVF'], [-90, '−90°'], [180, '±180°'], [-30, '−30° aVL'], [120, '+120° DIII']];
  return (
    <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <circle cx={cx} cy={cy} r={r + 20} fill="#FCFAF4" />
      <path d={`M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${large} ${sweep} ${x1},${y1} Z`} fill={c} opacity={0.3 * Math.min(1, k * 2)} />
      {ticks.map(([d, s]) => {
        const [tx, ty] = pt(d), [lx, ly] = pt(d, r + 60);
        return <g key={d}><line x1={cx} y1={cy} x2={tx} y2={ty} stroke="#CBD5E1" strokeWidth={2} /><text x={lx} y={ly + 9} textAnchor="middle" fontFamily={FONT} fontSize={24} fontWeight={700} fill="#E2E8F0">{s}</text></g>;
      })}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#94A3B8" strokeWidth={3} />
      <line x1={cx} y1={cy} x2={ax} y2={ay} stroke={c} strokeWidth={12} strokeLinecap="round" opacity={k > 0.02 ? 1 : 0} />
      <circle cx={ax} cy={ay} r={14} fill={c} opacity={k > 0.02 ? 1 : 0} />
      <circle cx={cx} cy={cy} r={10} fill={INK} />
      <text x={cx} y={cy + r + 120} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill={c} opacity={Math.min(1, k * 1.5)}>{label}</text>
    </svg>
  );
};

// ================= 7 · SO SÁNH V1 – V6 · MẸO XI-NHAN =================
const Compare: React.FC = () => {
  const t = useT();
  const lever = interpolate(t, [6, 6.6, 7.6, 8.2], [0, -30, -30, 30], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const up = lever < 0;
  return (
    <DeskBg>
      <Head t={t}>So sánh nhanh: V1 và V6</Head>
      <div style={{position: 'absolute', left: 60, top: 130, fontFamily: FONT, fontSize: 32, fontWeight: 900, color: '#93C5FD', opacity: ap(t, 2)}}>NHÁNH PHẢI</div>
      <div style={{position: 'absolute', left: 60, top: 480, fontFamily: FONT, fontSize: 32, fontWeight: 900, color: '#FCA5A5', opacity: ap(t, 4)}}>NHÁNH TRÁI</div>
      <Mini f={beat(M.V1r)} label="V1" x={60} y={180} a={ap(t, 2)} w={380} h={270} base={170} />
      <Mini f={beat(M.V6r)} label="V6" x={460} y={180} a={ap(t, 2.3)} w={380} h={270} base={170} />
      <Mini f={beat(M.V1l)} label="V1" x={60} y={530} a={ap(t, 4)} w={380} h={270} base={110} />
      <Mini f={beat(M.V6l)} label="V6" x={460} y={530} a={ap(t, 4.3)} w={380} h={270} base={200} />
      <div style={{position: 'absolute', left: 860, top: 190, width: 140, height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 110, color: CR, opacity: ap(t, 2.6), fontFamily: FONT, fontWeight: 900}}>↑</div>
      <div style={{position: 'absolute', left: 860, top: 540, width: 140, height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 110, color: CL, opacity: ap(t, 4.6), fontFamily: FONT, fontWeight: 900}}>↓</div>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <g opacity={ap(t, 6)}>
          <rect x={1060} y={150} width={800} height={600} rx={24} fill="#111827" stroke="#334155" strokeWidth={3} />
          <text x={1460} y={210} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={800} fill="#E2E8F0">Cần xi-nhan</text>
          <circle cx={1460} cy={450} r={130} fill="none" stroke="#475569" strokeWidth={22} />
          <g transform={`rotate(${lever} 1300 450)`}>
            <rect x={1300} y={432} width={300} height={36} rx={18} fill="#CBD5E1" />
            <circle cx={1300} cy={450} r={34} fill="#64748B" />
          </g>
          <g opacity={up ? 1 : 0.2}>
            <path d="M1640,300 l60,0 l0,-30 l50,50 l-50,50 l0,-30 l-60,0 z" fill={CR} />
            <text x={1700} y={410} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={900} fill={CR}>LÊN = PHẢI</text>
          </g>
          <g opacity={!up && lever > 0 ? 1 : 0.2}>
            <path d="M1700,560 l-60,0 l0,-30 l-50,50 l50,50 l0,-30 l60,0 z" fill={CL} />
            <text x={1660} y={680} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={900} fill={CL}>XUỐNG = TRÁI</text>
          </g>
        </g>
      </svg>
      <Memo x={1060} y={780} w={800} a={ap(t, 6.4)}>V1 <span style={{color: CR}}>LÊN</span> → <span style={{color: CR}}>PHẢI</span> · V1 <span style={{color: CL}}>XUỐNG</span> → <span style={{color: CL}}>TRÁI</span></Memo>
    </DeskBg>
  );
};

// ================= 8 · KHÔNG HOÀN TOÀN · KHÔNG ĐẶC HIỆU =================
const Incomplete: React.FC = () => {
  const t = useT();
  return (
    <DeskBg>
      <Head t={t}>Không hoàn toàn · không đặc hiệu</Head>
      <Box x={60} y={140} a={ap(t, 0)}><Zoom f={beat(M2.V1inc)} label="V1 · không hoàn toàn" w={560} h={380} base={230}>
        {(X) => <Br x0={X(0)} x1={X(0.105)} y={320} c={PEN} label="0,11 – 0,12 s" a={ap(t, 0.8)} />}
      </Zoom></Box>
      <Box x={660} y={140} a={ap(t, 4)}><Zoom f={beat(M2.ivcd)} label="QRS rộng · không điển hình" w={560} h={380} base={250}>
        {(X) => <Br x0={X(0)} x1={X(0.125)} y={320} c="#64748B" label="> 0,11 s" a={ap(t, 4.6)} />}
      </Zoom></Box>
      <Card x={1260} y={140} w={600} a={ap(t, 0)} c="#64748B" title="Hình dạng GIỐNG block nhánh">nhưng QRS chỉ 0,11 – 0,12 s</Card>
      <Card x={1260} y={300} w={600} a={ap(t, 2)} c={CR} title="Block nhánh phải không hoàn toàn">thường gặp, thường lành tính</Card>
      <Card x={60} y={560} w={1160} a={ap(t, 4)} c="#475569" title="Rối loạn dẫn truyền trong thất KHÔNG ĐẶC HIỆU">QRS &gt; 0,11 s nhưng không đủ tiêu chuẩn nhánh phải hay nhánh trái</Card>
      <Card x={60} y={720} w={1160} a={ap(t, 6)} c={CA} title="Gặp trong">bệnh cơ tim · thuốc chống loạn nhịp · tăng kali máu</Card>
      <Memo x={1260} y={470} w={600} a={ap(t, 4.4)}>Đủ rộng nhưng không giống nhánh nào → "không đặc hiệu"</Memo>
    </DeskBg>
  );
};

// ================= 9 · BLOCK PHÂN NHÁNH TRÁI TRƯỚC =================
const LAFB: React.FC = () => {
  const t = useT();
  return (
    <DeskBg>
      <Head t={t}>Block phân nhánh trái TRƯỚC</Head>
      <AxisWheel cx={420} cy={480} r={220} a0={-90} a1={-45} c={CA} ang={-60} k={dp(t, 2, 1.2)} label="Trục −45° đến −90°" />
      <Mini f={beat(M2.qR)} label="aVL" x={820} y={140} a={ap(t, 4)} base={150}>
        {(X, Y) => <g opacity={ap(t, 4.4)}><circle cx={X(0.01)} cy={Y(-0.18)} r={16} fill="none" stroke={PEN} strokeWidth={4} /><text x={X(0.04) + 24} y={Y(1.0) + 20} fontFamily={HAND} fontSize={34} fill={PEN}>qR</text></g>}
      </Mini>
      <Mini f={beat(M2.rS)} label="DII" x={820} y={400} a={ap(t, 4.3)} base={90} />
      <Mini f={beat(M2.rS)} label="aVF" x={1140} y={400} a={ap(t, 4.5)} base={90}>
        {(X, Y) => <text x={X(0.048) + 24} y={Y(-0.95)} fontFamily={HAND} fontSize={34} fill={PEN} opacity={ap(t, 4.8)}>rS</text>}
      </Mini>
      <Card x={1140} y={140} w={720} a={ap(t, 0)} c={CA} title="QRS KHÔNG rộng → nhìn TRỤC" />
      <Card x={1140} y={250} w={720} a={ap(t, 2)} c={CA} title="Trục lệch TRÁI −45° → −90°" />
      <Card x={820} y={670} w={1040} a={ap(t, 4)} c={CA} title="aVL: qR · DII, DIII, aVF: rS" />
      <Card x={820} y={790} w={1040} a={ap(t, 6)} c="#16A34A" title="QRS < 0,12 s · thường gặp nhất trong các block phân nhánh" />
    </DeskBg>
  );
};

// ================= 10 · BLOCK PHÂN NHÁNH TRÁI SAU =================
const LPFB: React.FC = () => {
  const t = useT();
  return (
    <DeskBg>
      <Head t={t}>Block phân nhánh trái SAU</Head>
      <AxisWheel cx={420} cy={480} r={220} a0={90} a1={180} c={CPo} ang={120} k={dp(t, 0.3, 1.2)} label="Trục +90° đến +180°" />
      <Mini f={beat(M2.rS)} label="DI" x={820} y={140} a={ap(t, 2)} base={90}>
        {(X, Y) => <text x={X(0.048) + 24} y={Y(-0.95)} fontFamily={HAND} fontSize={34} fill={PEN} opacity={ap(t, 2.4)}>rS</text>}
      </Mini>
      <Mini f={beat(M2.rS)} label="aVL" x={1140} y={140} a={ap(t, 2.2)} base={90} />
      <Mini f={beat(M2.qR)} label="DIII" x={820} y={400} a={ap(t, 2.4)} base={150}>
        {(X, Y) => <text x={X(0.04) + 24} y={Y(1.0) + 20} fontFamily={HAND} fontSize={34} fill={PEN} opacity={ap(t, 2.8)}>qR</text>}
      </Mini>
      <Mini f={beat(M2.qR)} label="aVF" x={1140} y={400} a={ap(t, 2.6)} base={150} />
      <Card x={1470} y={140} w={390} a={ap(t, 0)} c={CPo} title="Trục lệch PHẢI">+90° → +180°</Card>
      <Card x={1470} y={300} w={390} a={ap(t, 2)} c={CPo} title="DI, aVL: rS">DIII, aVF: qR</Card>
      <Card x={820} y={670} w={1040} a={ap(t, 4)} c={PEN} title="Hiếm gặp · phải LOẠI TRỪ nguyên nhân trục lệch phải khác" />
      <Memo x={820} y={790} w={1040} a={ap(t, 6)}>Loại trừ: phì đại thất phải · thuyên tắc phổi · bệnh phổi mạn · người gầy cao</Memo>
    </DeskBg>
  );
};

// ================= 11 · BLOCK PHỐI HỢP =================
const Combined: React.FC = () => {
  const t = useT();
  const HX = 0, HY = 120, HS = 1.2;
  const rt = useCurrentFrame() / 30;
  return (
    <DeskBg>
      <Head t={t}>Block phối hợp</Head>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="comb" x={HX} y={HY} s={HS} prog={1} art={1} labels={false} />
        <Branches x={HX} y={HY} s={HS} a={1} blk={t > 2 ? {rb: true, laf: true} : {}} flow={((rt % 1.6) / 1.6) * 1.2} />
      </svg>
      <Card x={760} y={140} w={1100} a={ap(t, 0)} c="#475569" title="Mô tả TỪNG thành phần" />
      <Card x={760} y={250} w={1100} a={ap(t, 2)} c={CR} title={<span>Thường gặp: <span style={{color: CR}}>block nhánh phải</span> + <span style={{color: CA}}>block phân nhánh trái trước</span></span>} />
      <Card x={760} y={360} w={1100} a={ap(t, 4)} c="#7C3AED" title="Kèm PR dài → ghi đủ:">“block nhánh phải + block phân nhánh trái trước + block nhĩ thất độ I”</Card>
      <div style={{position: 'absolute', left: 760, top: 560, width: 1100, padding: '18px 26px', borderRadius: 16, background: '#FCFAF4', borderLeft: `10px solid ${PEN}`, boxSizing: 'border-box', fontFamily: FONT, opacity: ap(t, 6), boxShadow: '0 14px 30px rgba(0,0,0,0.35)'}}>
        <div style={{fontSize: 26, fontWeight: 700, color: '#475569'}}>AHA/ACCF/HRS không khuyến cáo:</div>
        <div style={{display: 'flex', gap: 30, marginTop: 8}}>
          {['“block hai nhánh”', '“block ba nhánh”'].map((s, i) => (
            <span key={s} style={{position: 'relative', fontSize: 36, fontWeight: 800, color: '#94A3B8'}}>{s}
              <span style={{position: 'absolute', left: -4, right: -4, top: '52%', height: 5, background: PEN, transform: `scaleX(${ap(t, 6.4 + i * 0.3)})`, transformOrigin: 'left'}} />
            </span>
          ))}
        </div>
      </div>
      <Memo x={760} y={760} w={1100} a={ap(t, 6.8)}>Gọi đúng tên từng block, không gộp</Memo>
    </DeskBg>
  );
};

// ================= 12 · ST–T THỨ PHÁT =================
const Secondary: React.FC = () => {
  const t = useT();
  const arr = (x: number, y0: number, y1: number, c: string, a: number) => (
    <g opacity={a}><line x1={x} y1={y0} x2={x} y2={y1} stroke={c} strokeWidth={6} /><path d={`M${x - 12},${y1 + (y1 > y0 ? -16 : 16)} L${x},${y1} L${x + 12},${y1 + (y1 > y0 ? -16 : 16)}`} fill="none" stroke={c} strokeWidth={6} /></g>
  );
  return (
    <DeskBg>
      <Head t={t}>Biến đổi ST–T thứ phát</Head>
      <Mini f={beat(M.V1r)} label="V1 · nhánh phải" x={60} y={140} a={ap(t, 2)} w={560} h={380} base={220}>
        {(X, Y) => <g>{arr(X(0.095), Y(0) - 10, Y(0.9), CR, ap(t, 2.4))}{arr(X(0.32), Y(0) + 6, Y(-0.3) + 4, '#7C3AED', ap(t, 4))}</g>}
      </Mini>
      <Mini f={beat(M.V1l)} label="V1 · nhánh trái" x={660} y={140} a={ap(t, 4)} w={560} h={380} base={140}>
        {(X, Y) => <g>{arr(X(0.075), Y(0) + 10, Y(-1.4), CL, ap(t, 4.2))}{arr(X(0.2), Y(0) - 4, Y(0.25), '#7C3AED', ap(t, 4.6))}</g>}
      </Mini>
      <Mini f={beat(M.V6l)} label="V6 · nhánh trái" x={1260} y={140} a={ap(t, 4.4)} w={560} h={380} base={250}>
        {(X, Y) => <g>{arr(X(0.08), Y(0) - 10, Y(1.1), CL, ap(t, 4.6))}{arr(X(0.2), Y(0) + 4, Y(-0.22), '#7C3AED', ap(t, 5))}</g>}
      </Mini>
      <Card x={60} y={560} w={1760} a={ap(t, 2)} c="#EC4899" title={<span>ST–T <span style={{color: '#7C3AED'}}>NGƯỢC chiều</span> phần cuối QRS → thứ phát, là <u>bình thường</u> trong block nhánh</span>} />
      <Card x={60} y={680} w={1760} a={ap(t, 4)} c="#475569" title="Nhánh phải: T đảo V1–V3 · Nhánh trái: ST chênh lên V1–V3, ST chênh xuống V5–V6" />
      <Memo x={60} y={800} w={1760} a={ap(t, 6)}>ST–T <span style={{color: PEN}}>CÙNG chiều</span> QRS → mới đáng ngờ thiếu máu cơ tim</Memo>
    </DeskBg>
  );
};

// ================= 13 · BẢNG ÔN TẬP =================
const Review: React.FC = () => {
  const t = useT();
  const rows: [string, string, string, string, string, number][] = [
    ['Block nhánh PHẢI', '≥ 0,12 s', 'bình thường', 'V1 rSR′ (tai thỏ) · S rộng DI, V6', CR, 2],
    ['Block nhánh TRÁI', '≥ 0,12 s', 'bình thường / lệch trái', 'V1 hướng xuống · V6 R rộng khấc, mất q', CL, 4],
    ['Phân nhánh trái TRƯỚC', '< 0,12 s', '−45° → −90°', 'qR aVL · rS DII, DIII, aVF', CA, 6],
    ['Phân nhánh trái SAU', '< 0,12 s', '+90° → +180°', 'rS DI, aVL · qR DIII, aVF · loại trừ', CPo, 8],
  ];
  const cols = [380, 180, 300, 860];
  return (
    <DeskBg>
      <Head t={t}>Ôn tập</Head>
      <div style={{position: 'absolute', left: 60, top: 150, width: 1800, borderRadius: 18, overflow: 'hidden', background: '#FCFAF4', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', fontFamily: FONT, opacity: ap(t, 0)}}>
        <div style={{display: 'flex', background: '#1E293B', color: '#F8FAFC', fontSize: 28, fontWeight: 800}}>
          {['Block', 'QRS', 'Trục', 'Dấu hiệu chính'].map((h, i) => <div key={h} style={{width: cols[i], padding: '18px 24px', boxSizing: 'border-box'}}>{h}</div>)}
        </div>
        {rows.map(([a, b, c, d, col, s]) => (
          <div key={a} style={{display: 'flex', borderTop: '2px solid #E5E7EB', opacity: ap(t, s), transform: `translateX(${(1 - ap(t, s)) * 30}px)`, fontSize: 30, fontWeight: 700, color: '#1F2937', alignItems: 'center'}}>
            <div style={{width: cols[0], padding: '30px 24px', boxSizing: 'border-box', color: col, fontWeight: 900, borderLeft: `10px solid ${col}`}}>{a}</div>
            <div style={{width: cols[1], padding: '30px 24px', boxSizing: 'border-box'}}>{b}</div>
            <div style={{width: cols[2], padding: '30px 24px', boxSizing: 'border-box'}}>{c}</div>
            <div style={{width: cols[3], padding: '30px 24px', boxSizing: 'border-box'}}>{d}</div>
          </div>
        ))}
      </div>
    </DeskBg>
  );
};

// ================= 14 · THỰC HÀNH 2 ECG =================
const Check: React.FC<{x: number; y: number; w: number; a: number; c: string; children: React.ReactNode}> = ({x, y, w, a, c, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, display: 'flex', gap: 12, alignItems: 'flex-start', fontFamily: FONT, fontSize: 27, fontWeight: 700, color: '#F1F5F9', opacity: a, transform: `translateX(${(1 - a) * 30}px)`, lineHeight: 1.3}}>
    <span style={{flex: 'none', width: 36, height: 36, borderRadius: 18, background: c, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900}}>✓</span>
    <span>{children}</span>
  </div>
);
const Practice: React.FC = () => {
  const t = useT();
  const W = 290, H = 210;
  return (
    <DeskBg>
      <Head t={t}>Thực hành: đọc 2 ECG</Head>
      <div style={{position: 'absolute', left: 60, top: 128, fontFamily: FONT, fontSize: 28, fontWeight: 900, color: '#FDE047', opacity: ap(t, 2)}}>ECG 1</div>
      <Mini f={beat(M.V1r)} label="V1" x={60} y={170} a={ap(t, 2)} w={W} h={H} base={130} />
      <Mini f={beat(M.V6r)} label="V6" x={360} y={170} a={ap(t, 2.2)} w={W} h={H} base={120} />
      <Mini f={beat(M2.DIrl)} label="DI" x={660} y={170} a={ap(t, 4)} w={W} h={H} base={130} />
      <Mini f={beat(M2.aVLrl)} label="aVL" x={960} y={170} a={ap(t, 4.2)} w={W} h={H} base={130} />
      <div style={{position: 'absolute', left: 60, top: 518, fontFamily: FONT, fontSize: 28, fontWeight: 900, color: '#FDE047', opacity: ap(t, 6)}}>ECG 2</div>
      <Mini f={beat(M.V1l)} label="V1" x={60} y={560} a={ap(t, 6)} w={W} h={H} base={70} />
      <Mini f={beat(M.V6l)} label="V6" x={360} y={560} a={ap(t, 6.2)} w={W} h={H} base={140} />
      <Mini f={beat(M.DIl)} label="DI" x={660} y={560} a={ap(t, 6.4)} w={W} h={H} base={140} />
      <div style={{position: 'absolute', left: 1290, top: 170, width: 570, padding: 24, borderRadius: 18, background: 'rgba(15,23,42,0.85)', border: '2px solid #334155', boxSizing: 'border-box', height: 330}} />
      <Check x={1315} y={195} w={520} a={ap(t, 2.6)} c={CR}>QRS 0,14 s · V1 rSR′ · S rộng DI, V6 → <b style={{color: '#93C5FD'}}>block nhánh phải</b></Check>
      <Check x={1315} y={330} w={520} a={ap(t, 4.6)} c={CA}>Trục −60°, qR aVL → kèm <b style={{color: '#FCD34D'}}>block phân nhánh trái trước</b></Check>
      <div style={{position: 'absolute', left: 1290, top: 560, width: 570, padding: 24, borderRadius: 18, background: 'rgba(15,23,42,0.85)', border: '2px solid #334155', boxSizing: 'border-box', height: 330}} />
      <Check x={1315} y={585} w={520} a={ap(t, 6.6)} c={CL}>QRS 0,16 s · V1 QS · V6 R rộng khấc, mất q → <b style={{color: '#FCA5A5'}}>block nhánh trái</b></Check>
      <Check x={1315} y={735} w={520} a={ap(t, 8.2)} c="#EC4899">ST–T ngược chiều QRS → <b style={{color: '#F9A8D4'}}>thứ phát</b>, phù hợp block nhánh</Check>
    </DeskBg>
  );
};

// ================= 15 · 5 ĐIỀU CẦN NHỚ =================
const Takeaways: React.FC = () => {
  const t = useT();
  const items: [React.ReactNode, string][] = [
    [<>QRS ≥ 0,12 s → nghĩ block nhánh · nhìn <b>V1</b> và <b>V6</b></>, PEN],
    [<>V1 hướng <b>LÊN</b> (tai thỏ) → nhánh <b>PHẢI</b></>, CR],
    [<>V1 hướng <b>XUỐNG</b>, V6 R rộng khấc, mất q → nhánh <b>TRÁI</b></>, CL],
    [<>Phân nhánh: QRS hẹp, nhìn <b>TRỤC</b> (trước: lệch trái · sau: lệch phải)</>, CA],
    [<>ST–T <b>ngược</b> chiều QRS là thứ phát — <b>cùng</b> chiều mới đáng ngờ</>, '#EC4899'],
  ];
  return (
    <DeskBg>
      <Head t={t}>5 điều cần nhớ</Head>
      {items.map(([s, c], i) => {
        const a = ap(t, 2 + i * 2);
        return (
          <div key={i} style={{position: 'absolute', left: 120, top: 150 + i * 135, width: 1680, height: 112, display: 'flex', alignItems: 'center', gap: 26, padding: '0 28px', borderRadius: 18, background: '#FCFAF4', borderLeft: `14px solid ${c}`, boxSizing: 'border-box', opacity: a, transform: `translateX(${(1 - a) * 50}px)`, boxShadow: '0 12px 26px rgba(0,0,0,0.35)', fontFamily: FONT}}>
            <span style={{flex: 'none', width: 64, height: 64, borderRadius: 32, background: c, color: '#fff', fontSize: 36, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</span>
            <span style={{fontSize: 36, fontWeight: 700, color: '#1F2937'}}>{s}</span>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 850, textAlign: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#5EEAD4', opacity: ap(t, 12)}}>Cảm ơn bạn đã theo dõi! · Bài sau: tiêu chuẩn Sgarbossa</div>
    </DeskBg>
  );
};

const SC: React.FC[] = [Cover, Conduction, Mechanism, RBBB, RBBBmean, LBBB, LBBBmean, Compare, Incomplete, LAFB, LPFB, Combined, Secondary, Review, Practice, Takeaways];
export const BUNDLE_N = 7;
export const Bundle: React.FC = () => (
  <AbsoluteFill style={{background: '#0E1116', fontFamily: FONT}}>
    <Audio src={staticFile('narration.m4a')} />
    <CapCtx.Provider value={false}>
      {data.scenes.slice(0, Math.min(SC.length, data.scenes.length)).map((s, i) => {
        const Comp = SC[i];
        const map: [number, number][] = s.sents.map((x, j) => [x.start, (keys as number[][])[i][j]]);
        return (
          <Sequence key={i} from={s.from} durationInFrames={s.dur}>
            <Fade dur={s.dur}>
              <TimeMap.Provider value={map}><Comp /></TimeMap.Provider>
            </Fade>
          </Sequence>
        );
      })}
    </CapCtx.Provider>
    <SeriesTag sub="Block nhánh & Block phân nhánh" />
    <StationBar />
    <Caption />
    <Progress />
  </AbsoluteFill>
);
export {Pink, Memo, Card, Head, Zoom, Br, Box, Branches, DeskBg, beat, mixM, M, ap, dp, useBeat, INK, PEN, CR, CL, CA, CPo};
