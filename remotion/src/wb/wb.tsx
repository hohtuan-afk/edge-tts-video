// Bộ dựng phong cách "bảng trắng vẽ tay" (whiteboard): nét rough.js + hiệu ứng nét tự vẽ (@remotion/paths)
import React, {useMemo} from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {evolvePath} from '@remotion/paths';
import rough from 'roughjs';
import {loadFont} from '@remotion/google-fonts/PatrickHand';

export const {fontFamily: HAND} = loadFont('normal', {weights: ['400'], subsets: ['vietnamese', 'latin', 'latin-ext']});

export const W = {
  paper: '#FBFAF6',
  ink: '#33495C',
  teal: '#3C7F8F',
  coral: '#E2725F',
  red: '#C8463A',
  violet: '#8467B5',
  amber: '#E3A23B',
  green: '#4E9A6A',
  blue: '#4D86C6',
  muted: '#8A98A6',
  grid: '#F2C9C2',
  grid2: '#F8E3DF',
  heart: '#F2A493',
  heartD: '#E07E6C',
};

export const useT = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return f / fps;
};
export const ap = (t: number, s: number, d = 0.6) =>
  interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1)});
// tiến độ "vẽ nét": tuyến tính hơn để giống tay đang vẽ
export const dp = (t: number, s: number, d = 1) =>
  interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});

const gen = rough.generator();
type RO = {stroke?: string; sw?: number; rough?: number; bow?: number; seed?: number; fill?: string; fillStyle?: string; hachureGap?: number; fillWeight?: number; hachureAngle?: number};
const opts = (o: RO) => ({
  stroke: o.stroke === 'none' ? 'transparent' : o.stroke ?? W.ink, strokeWidth: o.sw ?? 3, roughness: o.rough ?? 1.1, bowing: o.bow ?? 1, seed: o.seed ?? 7,
  fill: o.fill, fillStyle: o.fillStyle ?? 'hachure', hachureGap: o.hachureGap ?? 9, fillWeight: o.fillWeight ?? 1.6, hachureAngle: o.hachureAngle ?? -41,
  preserveVertices: true, disableMultiStroke: false,
});

// Vẽ một drawable rough: nét viền "tự vẽ" theo prog, phần tô (hachure/solid) hiện dần theo fillA
type Part = {type: string; d: string};
const parts = (dr: any): Part[] => dr.sets.map((set: any) => ({type: set.type, d: gen.opsToPath(set)}));
const Drawn: React.FC<{ps: Part[]; o: RO; prog: number; fillA?: number}> = ({ps, o, prog, fillA = 1}) => {
  const st = o.stroke ?? W.ink, sw = o.sw ?? 3;
  return (
    <g>
      {ps.map((p, i) => {
        if (p.type === 'fillPath') return fillA > 0 ? <path key={i} d={p.d} fill={o.fill} stroke="none" opacity={fillA} /> : null;
        if (p.type === 'fillSketch') return fillA > 0 ? <path key={i} d={p.d} fill="none" stroke={o.fill} strokeWidth={o.fillWeight ?? 1.6} opacity={fillA} strokeLinecap="round" /> : null;
        if (st === 'none' || prog <= 0) return null;
        if (prog >= 1) return <path key={i} d={p.d} fill="none" stroke={st} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />;
        let ev: {strokeDasharray?: string; strokeDashoffset?: number} = {};
        try {
          ev = evolvePath(prog, p.d);
        } catch {
          ev = {};
        }
        return <path key={i} d={p.d} fill="none" stroke={st} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />;
      })}
    </g>
  );
};

export const RPath: React.FC<RO & {d: string; prog?: number; fillA?: number}> = ({d, prog = 1, fillA = 1, ...o}) => {
  const ps = useMemo(() => parts(gen.path(d, opts(o))), [d, o.stroke, o.sw, o.rough, o.seed, o.fill, o.fillStyle, o.hachureGap]);
  return <Drawn ps={ps} o={o} prog={prog} fillA={fillA} />;
};
export const RLine: React.FC<RO & {x1: number; y1: number; x2: number; y2: number; prog?: number}> = ({x1, y1, x2, y2, prog = 1, ...o}) => {
  const ps = useMemo(() => parts(gen.line(x1, y1, x2, y2, opts(o))), [x1, y1, x2, y2, o.stroke, o.sw, o.rough, o.seed]);
  return <Drawn ps={ps} o={o} prog={prog} />;
};
export const REllipse: React.FC<RO & {cx: number; cy: number; w: number; h: number; prog?: number; fillA?: number}> = ({cx, cy, w, h, prog = 1, fillA = 1, ...o}) => {
  const ps = useMemo(() => parts(gen.ellipse(cx, cy, w, h, opts(o))), [cx, cy, w, h, o.stroke, o.sw, o.rough, o.seed, o.fill, o.fillStyle]);
  return <Drawn ps={ps} o={o} prog={prog} fillA={fillA} />;
};
export const RRect: React.FC<RO & {x: number; y: number; w: number; h: number; prog?: number; fillA?: number}> = ({x, y, w, h, prog = 1, fillA = 1, ...o}) => {
  const ps = useMemo(() => parts(gen.rectangle(x, y, w, h, opts(o))), [x, y, w, h, o.stroke, o.sw, o.rough, o.seed, o.fill, o.fillStyle]);
  return <Drawn ps={ps} o={o} prog={prog} fillA={fillA} />;
};

// Mũi tên vẽ tay: thân + đầu, đầu hiện khi thân vẽ xong
export const RArrow: React.FC<RO & {x1: number; y1: number; x2: number; y2: number; prog?: number; head?: number; curve?: number}> = ({x1, y1, x2, y2, prog = 1, head = 18, curve = 0, ...o}) => {
  const mx = (x1 + x2) / 2 - (y2 - y1) * curve, my = (y1 + y2) / 2 + (x2 - x1) * curve;
  const d = `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
  const ang = Math.atan2(y2 - my, x2 - mx);
  const h1 = `M${x2},${y2} L${x2 - head * Math.cos(ang - 0.45)},${y2 - head * Math.sin(ang - 0.45)}`;
  const h2 = `M${x2},${y2} L${x2 - head * Math.cos(ang + 0.45)},${y2 - head * Math.sin(ang + 0.45)}`;
  const hp = interpolate(prog, [0.8, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <g>
      <RPath d={d} prog={Math.min(1, prog / 0.85)} {...o} />
      {hp > 0 && <RPath d={h1} prog={hp} {...o} seed={(o.seed ?? 7) + 1} />}
      {hp > 0 && <RPath d={h2} prog={hp} {...o} seed={(o.seed ?? 7) + 2} />}
    </g>
  );
};

// Chữ viết tay hiện theo kiểu "gõ dần" (chữ xuất hiện trái → phải)
export const HText: React.FC<{x: number; y: number; t: number; s0: number; size?: number; c?: string; dur?: number; w?: number; align?: 'left' | 'center' | 'right'; children: string; weight?: number; ls?: number; upper?: boolean}> = ({
  x, y, t, s0, size = 44, c = W.ink, dur, w, align = 'left', children, ls = 0.5, upper,
}) => {
  const n = children.length;
  const d = dur ?? Math.min(1.6, 0.03 * n + 0.3);
  const k = interpolate(t, [s0, s0 + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (k <= 0) return null;
  const pct = k * 100;
  return (
    <div
      style={{
        position: 'absolute', left: align === 'center' ? x - (w ?? 1400) / 2 : align === 'right' ? x - (w ?? 1400) : x, top: y, width: w ?? (align === 'left' ? undefined : 1400),
        textAlign: align, fontFamily: HAND, fontSize: size, color: c, lineHeight: 1.25, letterSpacing: ls,
        textTransform: upper ? 'uppercase' : undefined, whiteSpace: w ? 'normal' : 'nowrap',
        WebkitMaskImage: `linear-gradient(90deg, #000 ${pct}%, transparent ${Math.min(100, pct + 6)}%)`,
        maskImage: `linear-gradient(90deg, #000 ${pct}%, transparent ${Math.min(100, pct + 6)}%)`,
      }}
    >
      {children}
    </div>
  );
};

// Tiêu đề góc trái giống bảng giảng
export const Title: React.FC<{t: number; main: string; sub: string}> = ({t, main, sub}) => (
  <>
    <HText x={90} y={52} t={t} s0={0} size={52} c={W.ink} ls={2}>{main}</HText>
    <HText x={92} y={118} t={t} s0={0.4} size={34} c={W.teal}>{sub}</HText>
  </>
);

// Giấy ECG: ô nhỏ 1 mm, ô lớn 5 mm
export const EcgPaper: React.FC<{x: number; y: number; w: number; h: number; mm?: number; a?: number}> = ({x, y, w, h, mm = 8, a = 1}) => {
  const lines: React.ReactNode[] = [];
  for (let i = 0; i <= w / mm; i++) lines.push(<line key={'v' + i} x1={x + i * mm} x2={x + i * mm} y1={y} y2={y + h} stroke={i % 5 ? W.grid2 : W.grid} strokeWidth={i % 5 ? 1 : 1.6} />);
  for (let j = 0; j <= h / mm; j++) lines.push(<line key={'h' + j} x1={x} x2={x + w} y1={y + j * mm} y2={y + j * mm} stroke={j % 5 ? W.grid2 : W.grid} strokeWidth={j % 5 ? 1 : 1.6} />);
  return <g opacity={a}>{lines}</g>;
};

// Một nhịp ECG (đơn vị: mm; 1 mm = s px). st: mức chênh ST (mm, + là chênh lên); t: biên độ T; q: độ sâu Q; tInv: T đảo; hyper: T tối cấp
export type Beat = {st?: number; t?: number; q?: number; r?: number; s?: number; hyper?: boolean; tInv?: boolean; dep?: boolean};
export const beatPath = (x0: number, y0: number, s: number, b: Beat = {}) => {
  const {st = 0, t = 3, q = 0.8, r = 12, hyper = false, tInv = false} = b;
  const S = b.s ?? 3;
  const X = (mm: number) => x0 + mm * s, Y = (mm: number) => y0 - mm * s;
  const tAmp = tInv ? -Math.abs(t) : hyper ? t * 2.2 : t;
  const tw = hyper ? 4.5 : 6;
  const p = [
    `M${X(0)},${Y(0)}`, `L${X(4)},${Y(0)}`,
    `Q${X(6)},${Y(3.2)} ${X(8)},${Y(0)}`, // P
    `L${X(11)},${Y(0)}`,
    `L${X(12)},${Y(-q)}`, // Q
    `L${X(13.2)},${Y(r)}`, // R
    `L${X(14.4)},${Y(-S)}`, // S
    `L${X(15.4)},${Y(st)}`, // điểm J
    st > 0.5
      ? `C${X(17)},${Y(st + 0.6)} ${X(18.5)},${Y(st + (tAmp - st) * 0.6)} ${X(19.5)},${Y(Math.max(st, tAmp) + 0.3)} Q${X(21.5)},${Y(Math.max(st, tAmp) + 0.6)} ${X(23)},${Y(st * 0.35)}`
      : `L${X(17)},${Y(st)} C${X(17.5 + (6 - tw) / 2)},${Y(st + tAmp * 0.2)} ${X(19)},${Y(tAmp)} ${X(20)},${Y(tAmp)} C${X(21)},${Y(tAmp)} ${X(22)},${Y(tAmp * 0.25)} ${X(23)},${Y(0)}`,
    `L${X(23)},${Y(0)}`, `L${X(30)},${Y(0)}`,
  ];
  return p.join(' ');
};
