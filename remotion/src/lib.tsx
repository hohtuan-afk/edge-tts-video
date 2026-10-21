import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/BeVietnamPro';

export const {fontFamily: FONT} = loadFont('normal', {
  weights: ['400', '500', '600', '700', '800'],
  subsets: ['vietnamese', 'latin'],
});

export const C = {
  bg0: '#070D19',
  bg1: '#0E1A2E',
  txt: '#EEF3FA',
  muted: '#93A4BC',
  line: 'rgba(148,170,205,0.22)',
  amber: '#F7B940',
  insp: '#5EEAD4',
  exp: '#A78BFA',
  air: '#FACC15',
  oxy: '#4ADE80',
  hot: '#FB7185',
  warm: '#FDBA74',
  cold: '#7DD3FC',
  red: '#F87171',
  blue: '#60A5FA',
  violet: '#A78BFA',
  pink: '#F49AB0',
  bact: '#A3E635',
};
export const STN = ['ĐIỆN', 'KHÍ', 'DÂY', 'ẨM', 'LỌC', 'ĐO', 'PHUN'];
export const STN_COL = [C.amber, C.oxy, C.blue, '#38BDF8', C.red, C.violet, '#FB923C'];

// ---------- thời gian ----------
export const useT = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return f / fps;
};
export const ap = (t: number, s: number, d = 0.7) =>
  interpolate(t, [s, s + d], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
export const sp = (t: number, s: number, damping = 13) =>
  t < s ? 0 : spring({frame: (t - s) * 30, fps: 30, config: {damping, mass: 0.7, stiffness: 120}});
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---------- HTML ----------
type Box = {x: number; y: number; w: number; h?: number};
export const Glass: React.FC<Box & {a: number; children?: React.ReactNode; border?: string; style?: React.CSSProperties; pad?: number}> = ({
  x, y, w, h, a, children, border, style, pad = 28,
}) => (
  <div
    style={{
      position: 'absolute', left: x, top: y, width: w, height: h, padding: pad, boxSizing: 'border-box',
      background: 'linear-gradient(160deg, rgba(34,50,78,0.80), rgba(15,24,42,0.82))',
      border: `1.5px solid ${border ?? 'rgba(160,185,225,0.16)'}`,
      borderRadius: 26,
      boxShadow: `0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)${border ? `, 0 0 32px ${border}33` : ''}`,
      opacity: a,
      transform: `translateY(${(1 - a) * 28}px) scale(${0.97 + 0.03 * a})`,
      color: C.txt, fontFamily: FONT,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Txt: React.FC<{x: number; y: number; s?: number; c?: string; w?: number; a?: number; align?: 'left' | 'center' | 'right'; width?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  x, y, s = 30, c = C.txt, w = 600, a = 1, align = 'left', width, children, style,
}) => (
  <div
    style={{
      position: 'absolute', left: align === 'center' ? x - (width ?? 1200) / 2 : align === 'right' ? x - (width ?? 1200) : x,
      top: y, width: width ?? (align === 'left' ? undefined : 1200), textAlign: align,
      fontFamily: FONT, fontSize: s, fontWeight: w, color: c, opacity: a, lineHeight: 1.3,
      transform: `translateY(${(1 - a) * 14}px)`, whiteSpace: width ? 'normal' : 'nowrap', ...style,
    }}
  >
    {children}
  </div>
);

export const Chip: React.FC<{x: number; y: number; w: number; h?: number; c: string; a: number; s?: number; children: React.ReactNode; bold?: boolean}> = ({
  x, y, w, h = 64, c, a, s = 26, children, bold,
}) => (
  <div
    style={{
      position: 'absolute', left: x, top: y, width: w, minHeight: h, boxSizing: 'border-box', padding: '12px 26px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      background: `linear-gradient(135deg, ${c}2E, ${c}12)`, border: `2px solid ${c}`, borderRadius: h < 80 ? h : 22,
      color: C.txt, fontFamily: FONT, fontSize: s, fontWeight: bold ? 800 : 600, lineHeight: 1.25,
      boxShadow: `0 0 26px ${c}33`, opacity: a, transform: `translateX(${(1 - a) * 30}px) scale(${0.96 + 0.04 * a})`,
    }}
  >
    {children}
  </div>
);

export const Memo: React.FC<{x: number; y: number; w: number; h: number; t: number; s0: number; size?: number; children: React.ReactNode}> = ({
  x, y, w, h, t, s0, size = 40, children,
}) => {
  const k = sp(t, s0, 11);
  if (k <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 26, boxSizing: 'border-box',
        background: 'linear-gradient(135deg, rgba(247,185,64,0.22), rgba(247,185,64,0.06))',
        border: `2.5px solid ${C.amber}`, boxShadow: `0 0 50px ${C.amber}40, 0 20px 50px rgba(0,0,0,0.4)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '10px 40px',
        fontFamily: FONT, fontWeight: 800, fontSize: size, color: C.txt, lineHeight: 1.2,
        opacity: Math.min(1, k * 1.4), transform: `scale(${0.85 + 0.15 * k})`,
      }}
    >
      <div
        style={{
          position: 'absolute', left: 28, top: -18, padding: '4px 16px', borderRadius: 20, background: C.amber,
          color: C.bg0, fontSize: 20, fontWeight: 800, letterSpacing: 1,
        }}
      >
        ★ GHI NHỚ
      </div>
      {children}
    </div>
  );
};

export const Header: React.FC<{num: string; title: string; t: number}> = ({num, title, t}) => {
  const a = ap(t, 0, 0.8);
  return (
    <div style={{position: 'absolute', left: 80, top: 50, display: 'flex', alignItems: 'center', gap: 22, opacity: a, transform: `translateX(${(1 - a) * -40}px)`}}>
      <div
        style={{
          fontFamily: FONT, fontWeight: 800, fontSize: 26, color: C.bg0, background: `linear-gradient(135deg, #FFD27A, ${C.amber})`,
          borderRadius: 14, padding: '6px 16px', boxShadow: `0 0 24px ${C.amber}55`,
        }}
      >
        {num}
      </div>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 44, color: C.txt, letterSpacing: -0.5}}>{title}</div>
    </div>
  );
};

export const Roadmap: React.FC<{cur: number | 'all'; t: number; labels?: string[]}> = ({cur, t, labels = STN}) => {
  const a = ap(t, 0.1, 0.8);
  return (
    <div style={{position: 'absolute', right: 80, top: 58, display: 'flex', gap: 8, opacity: a}}>
      {labels.map((s, i) => {
        const on = cur === 'all' || i === cur;
        const past = cur !== 'all' && i < cur;
        return (
          <div
            key={s}
            style={{
              fontFamily: FONT, fontWeight: 800, fontSize: 19, padding: '7px 15px', borderRadius: 20,
              color: on ? C.bg0 : past ? C.txt : C.muted,
              background: on ? STN_COL[i] : 'rgba(20,32,52,0.85)',
              border: `2px solid ${on || past ? STN_COL[i] : 'rgba(148,170,205,0.25)'}`,
              boxShadow: on ? `0 0 22px ${STN_COL[i]}88` : 'none',
              transform: `scale(${on ? 1.08 : 1})`,
            }}
          >
            {s}
          </div>
        );
      })}
    </div>
  );
};

// ---------- SVG ----------
export const Defs: React.FC = () => (
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="b" />
      <feMerge>
        <feMergeNode in="b" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="softglow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="14" />
    </filter>
    <linearGradient id="machine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2A3B58" />
      <stop offset="1" stopColor="#152138" />
    </linearGradient>
    <radialGradient id="lung" cx="0.4" cy="0.35" r="0.8">
      <stop offset="0" stopColor="#FFC2D0" />
      <stop offset="0.55" stopColor="#F07A98" />
      <stop offset="1" stopColor="#B4466A" />
    </radialGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#7DD3FC" />
      <stop offset="1" stopColor="#1D6FB8" />
    </linearGradient>
  </defs>
);

export const pathD = (pts: [number, number][]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');

export const Tube: React.FC<{pts: [number, number][]; w?: number; color?: string; a?: number; gradId?: string}> = ({pts, w = 18, color = '#4B6488', a = 1, gradId}) => {
  const d = pathD(pts);
  return (
    <g opacity={a}>
      <path d={d} fill="none" stroke="#0B1322" strokeWidth={w + 8} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={gradId ? `url(#${gradId})` : color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={w - 4} strokeDasharray="2.5 9" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" transform={`translate(0,${-w / 4})`} />
    </g>
  );
};

export const Flow: React.FC<{pts: [number, number][]; color: string; t: number; a?: number; speed?: number; gap?: number; r?: number}> = ({
  pts, color, t, a = 1, speed = 140, gap = 46, r = 9,
}) => (
  <path
    d={pathD(pts)} fill="none" stroke={color} strokeWidth={r} strokeLinecap="round" strokeLinejoin="round"
    strokeDasharray={`0.1 ${gap}`} strokeDashoffset={-t * speed} opacity={a} filter="url(#glow)"
  />
);

export const Lungs: React.FC<{cx: number; cy: number; s: number; t: number; a?: number}> = ({cx, cy, s, t, a = 1}) => {
  const k = 1 + 0.05 * Math.sin((2 * Math.PI * t) / 4);
  const lobe = `M ${-0.14 * s},${-0.55 * s} C ${-0.6 * s},${-0.8 * s} ${-1.0 * s},${-0.2 * s} ${-0.95 * s},${0.45 * s} C ${-0.92 * s},${0.88 * s} ${-0.55 * s},${0.98 * s} ${-0.25 * s},${0.82 * s} C ${-0.1 * s},${0.72 * s} ${-0.1 * s},${0.3 * s} ${-0.14 * s},${-0.55 * s} Z`;
  return (
    <g transform={`translate(${cx},${cy})`} opacity={a}>
      <ellipse cx={0} cy={0.2 * s} rx={1.1 * s} ry={0.9 * s} fill="#F07A98" opacity={0.18} filter="url(#softglow)" />
      <g transform={`scale(${k})`}>
        <path d={lobe} fill="url(#lung)" stroke="#FFD1DC" strokeWidth={2} />
        <path d={lobe} fill="url(#lung)" stroke="#FFD1DC" strokeWidth={2} transform="scale(-1,1)" />
      </g>
      <rect x={-0.08 * s} y={-1.35 * s} width={0.16 * s} height={0.95 * s} rx={0.08 * s} fill="#C9D6EA" />
      <path d={`M 0,${-0.45 * s} L ${-0.32 * s},${-0.1 * s} M 0,${-0.45 * s} L ${0.32 * s},${-0.1 * s}`} stroke="#C9D6EA" strokeWidth={0.1 * s} strokeLinecap="round" />
    </g>
  );
};

export const Machine: React.FC<{x: number; y: number; w: number; h: number; t: number; a?: number; label?: string; screen?: boolean}> = ({
  x, y, w, h, t, a = 1, label = 'MÁY THỞ', screen = true,
}) => {
  const sx = x + w * 0.12, sw = w * 0.76, sy = y + h * 0.12, sh = h * 0.32;
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const u = i / 60;
    const ph = (u * 2 + t / 2) % 1;
    const v = ph < 0.35 ? Math.min(1, ph / 0.06) : Math.max(0, 1 - (ph - 0.35) / 0.08);
    pts.push(`${sx + 10 + u * (sw - 20)},${sy + sh * 0.82 - v * sh * 0.55}`);
  }
  return (
    <g opacity={a}>
      <rect x={x} y={y} width={w} height={h} rx={22} fill="url(#machine)" stroke="rgba(160,185,225,0.35)" strokeWidth={2} />
      {screen && (
        <>
          <rect x={sx} y={sy} width={sw} height={sh} rx={10} fill="#06111F" stroke="#2DD4BF55" strokeWidth={2} />
          <polyline points={pts.join(' ')} fill="none" stroke={C.insp} strokeWidth={3} filter="url(#glow)" />
        </>
      )}
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={x + w * (0.28 + i * 0.22)} cy={y + h * 0.56} r={Math.min(w, h) * 0.045} fill="#0B1322" stroke="#5B7398" strokeWidth={2} />
      ))}
      <text x={x + w / 2} y={y + h * 0.8} textAnchor="middle" fill={C.muted} fontFamily={FONT} fontWeight={800} fontSize={Math.max(16, Math.min(26, w * 0.11))} letterSpacing={1.5}>
        {label}
      </text>
    </g>
  );
};

export type Geo = ReturnType<typeof geo>;
export const geo = (bx: number, by: number, bw: number, bh: number) => {
  const m = {x: bx, y: by + 0.06 * bh, w: 0.2 * bw, h: 0.88 * bh};
  const pe: [number, number] = [bx + 0.2 * bw, by + 0.3 * bh];
  const pi: [number, number] = [bx + 0.2 * bw, by + 0.7 * bh];
  const Y: [number, number] = [bx + 0.72 * bw, by + 0.5 * bh];
  const ce: [number, number] = [bx + 0.6 * bw, by + 0.3 * bh];
  const ci: [number, number] = [bx + 0.6 * bw, by + 0.7 * bh];
  const s = Math.min(0.1 * bw, 0.24 * bh);
  const lc: [number, number] = [bx + 0.9 * bw, by + 0.66 * bh];
  const top: [number, number] = [lc[0], lc[1] - 1.35 * s];
  const pat: [number, number][] = [Y, [lc[0], Y[1]], top];
  return {m, pe, pi, Y, ce, ci, s, lc, exp: [Y, ce, pe] as [number, number][], insp: [pi, ci, Y] as [number, number][], pat};
};

export const along = (pts: [number, number][], f: number): [number, number] => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let L = seg.reduce((a, b) => a + b, 0) * f;
  for (let i = 0; i < seg.length; i++) {
    if (L <= seg[i] || i === seg.length - 1) {
      const k = seg[i] ? Math.min(1, L / seg[i]) : 0;
      return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)];
    }
    L -= seg[i];
  }
  return pts[pts.length - 1];
};

export const Circuit: React.FC<{g: Geo; t: number; a?: number; flow?: number; iGrad?: string; eGrad?: string; label?: string; tw?: number; screen?: boolean}> = ({
  g, t, a = 1, flow = 1, iGrad, eGrad, label, tw = 18, screen = true,
}) => (
  <g opacity={a}>
    <Tube pts={g.exp} gradId={eGrad} w={tw} />
    <Tube pts={g.insp} gradId={iGrad} w={tw} />
    <Tube pts={g.pat} w={tw - 4} />
    <Machine x={g.m.x} y={g.m.y} w={g.m.w} h={g.m.h} t={t} label={label} screen={screen} />
    {[g.pe, g.pi].map((p, i) => (
      <g key={i}>
        <rect x={p[0] - 12} y={p[1] - 15} width={24} height={30} rx={5} fill="#0B1322" stroke="#C9D6EA" strokeWidth={2} />
        <path d={`M${p[0] - 7},${p[1] - 9} L${p[0] + 7},${p[1] + 9} M${p[0] + 7},${p[1] - 9} L${p[0] - 7},${p[1] + 9}`} stroke="#C9D6EA" strokeWidth={2} />
      </g>
    ))}
    <Lungs cx={g.lc[0]} cy={g.lc[1]} s={g.s} t={t} />
    <circle cx={g.Y[0]} cy={g.Y[1]} r={tw * 0.85} fill="#F5C451" stroke="#0B1322" strokeWidth={3} />
    {flow > 0.01 && (
      <>
        <Flow pts={[...g.insp, ...g.pat.slice(1)]} color={C.insp} t={t} a={flow} />
        <Flow pts={[...[...g.pat].reverse(), ...g.exp.slice(1)]} color={C.exp} t={t} a={flow} speed={120} />
      </>
    )}
  </g>
);

export const Humid: React.FC<{x: number; y: number; t: number; a?: number; w?: number; h?: number}> = ({x, y, t, a = 1, w = 100, h = 86}) => {
  const lv = y + 18 + h * 0.42 + 3 * Math.sin(t * 2.2);
  return (
    <g opacity={a}>
      <path d={`M${x - 16},${y} L${x - 16},${y + 20} M${x + 16},${y} L${x + 16},${y + 20}`} stroke="#4B6488" strokeWidth={9} />
      <rect x={x - w / 2} y={y + 16} width={w} height={h} rx={14} fill="rgba(125,211,252,0.12)" stroke="#9AD8FF" strokeWidth={2.5} />
      <path d={`M${x - w / 2 + 5},${lv} Q${x},${lv - 6} ${x + w / 2 - 5},${lv} L${x + w / 2 - 5},${y + 12 + h} L${x - w / 2 + 5},${y + 12 + h} Z`} fill="url(#water)" />
      {[0, 1, 2].map((i) => {
        const u = ((t * 0.6 + i / 3) % 1);
        return <circle key={i} cx={x - 20 + i * 20} cy={lv - u * 30} r={3} fill="#E0F4FF" opacity={1 - u} />;
      })}
      <rect x={x - w / 2 - 10} y={y + 18 + h} width={w + 20} height={20} rx={6} fill="#5B3A32" stroke="#FB7185" strokeWidth={1.5} />
    </g>
  );
};

export const Trap: React.FC<{x: number; y: number; a?: number}> = ({x, y, a = 1}) => (
  <g opacity={a}>
    <rect x={x - 13} y={y + 8} width={26} height={46} rx={10} fill="rgba(125,211,252,0.12)" stroke="#9AD8FF" strokeWidth={2} />
    <rect x={x - 9} y={y + 30} width={18} height={20} rx={6} fill="url(#water)" />
  </g>
);

export const TempTag: React.FC<{x: number; y: number; v: string; c: string; a?: number}> = ({x, y, v, c, a = 1}) => (
  <g opacity={a} transform={`translate(${x},${y})`}>
    <rect x={-58} y={-22} width={116} height={44} rx={12} fill={`${c}26`} stroke={c} strokeWidth={2} />
    <text x={0} y={9} textAnchor="middle" fill={c} fontFamily={FONT} fontWeight={800} fontSize={24}>{v}</text>
  </g>
);

export const Label: React.FC<{x: number; y: number; c?: string; s?: number; a?: number; anchor?: 'start' | 'middle' | 'end'; w?: number; children: React.ReactNode}> = ({
  x, y, c = C.txt, s = 24, a = 1, anchor = 'middle', w = 700, children,
}) => (
  <text x={x} y={y} textAnchor={anchor} fill={c} fontFamily={FONT} fontWeight={w} fontSize={s} opacity={a} paintOrder="stroke" stroke="#070D19" strokeWidth={6} strokeLinejoin="round">
    {children}
  </text>
);

export const Badge: React.FC<{x: number; y: number; n: number | string; a?: number; c?: string}> = ({x, y, n, a = 1, c = C.amber}) => (
  <g opacity={a} transform={`translate(${x},${y}) scale(${0.6 + 0.4 * a})`}>
    <circle r={20} fill={c} filter="url(#glow)" />
    <text y={8} textAnchor="middle" fill="#070D19" fontFamily={FONT} fontWeight={800} fontSize={22}>{n}</text>
  </g>
);

export const XMark: React.FC<{x: number; y: number; r?: number; a?: number}> = ({x, y, r = 22, a = 1}) => (
  <g opacity={a} transform={`translate(${x},${y}) scale(${0.5 + 0.5 * a})`}>
    <circle r={r * 1.35} fill="#F8717133" stroke={C.red} strokeWidth={3} />
    <path d={`M${-r * 0.6},${-r * 0.6} L${r * 0.6},${r * 0.6} M${r * 0.6},${-r * 0.6} L${-r * 0.6},${r * 0.6}`} stroke={C.red} strokeWidth={6} strokeLinecap="round" />
  </g>
);

export const Fan: React.FC<{x: number; y: number; r: number; t: number; speed?: number; c?: string; a?: number}> = ({x, y, r, t, speed = 1, c = C.txt, a = 1}) => (
  <g opacity={a} transform={`translate(${x},${y})`}>
    <circle r={r} fill="rgba(255,255,255,0.04)" stroke={c} strokeWidth={3} />
    <g transform={`rotate(${t * 360 * speed})`}>
      {[0, 120, 240].map((d) => (
        <path key={d} d={`M0,0 C ${r * 0.2},${-r * 0.3} ${r * 0.75},${-r * 0.35} ${r * 0.8},0 C ${r * 0.6},${r * 0.15} ${r * 0.2},${r * 0.12} 0,0 Z`} fill={c} transform={`rotate(${d})`} />
      ))}
    </g>
    <circle r={r * 0.14} fill="#0B1322" stroke={c} strokeWidth={2} />
  </g>
);

export const Bact: React.FC<{x: number; y: number; r?: number; t: number; a?: number}> = ({x, y, r = 8, t, a = 1}) => (
  <g opacity={a} transform={`translate(${x},${y}) rotate(${t * 90})`}>
    {[0, 60, 120, 180, 240, 300].map((d) => (
      <line key={d} x1={0} y1={0} x2={r * 1.7} y2={0} stroke={C.bact} strokeWidth={2} transform={`rotate(${d})`} />
    ))}
    <circle r={r} fill={C.bact} filter="url(#glow)" />
  </g>
);
