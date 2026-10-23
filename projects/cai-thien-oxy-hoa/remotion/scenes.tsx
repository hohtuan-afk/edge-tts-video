import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ap, sp, useT, lerp, C, FONT, STN_COL, Glass, Chip, Memo, Header, Roadmap, Defs, Badge, Label, geo, Circuit, XMark, pathD, Flow, Tube, Fan} from './lib';

// ================= Bài: Nguyên tắc cải thiện oxy hoá =================
type P = {S: number[]};
const ST = ['MỤC TIÊU', 'FiO₂', 'MAP', 'PEEP', 'NẰM SẤP', 'MỞ PHỔI', 'CỨU MẠNG'];
const RM: React.FC<{cur: number | 'all'; t: number}> = ({cur, t}) => <Roadmap cur={cur} t={t} labels={ST} />;
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
    <Defs />
    {children}
  </svg>
);
const st = (S: number[], j: number) => S[j] ?? S[S.length - 1] ?? 0;
const ex = Math.exp;

// ---------- dạng sóng ----------
const ph = (s: number, T: number) => ((s % T) + T) % T;
type BO = {T?: number; ti?: number; peep?: number; pk?: number; pl?: number; pause?: number; R?: number; tau?: number};
// áp lực, VC lưu lượng vuông (có/không pause)
const pVC = (s: number, o: BO = {}) => {
  const {T = 3, ti = 1, peep = 5, pk = 25, pl = 18, pause = 0, R = 6, tau = 0.22} = o;
  const q = ph(s, T);
  if (q < ti) return peep + Math.min(1, q / 0.05) * R + (pk - R - peep) * (q / ti);
  if (q < ti + pause) return pl + (pk - pl) * ex(-(q - ti) / 0.035);
  const top = pause > 0 ? pl : pk;
  return peep + (top - peep) * ex(-(q - ti - pause) / tau);
};
const fVC = (s: number, o: BO & {dec?: boolean} = {}) => {
  const {T = 3, ti = 1, pause = 0, tau = 0.22, dec} = o;
  const q = ph(s, T);
  if (q < ti) return (dec ? 1 - 0.8 * (q / ti) : 0.75) * Math.min(1, q / 0.04);
  if (q < ti + pause) return 0;
  return -0.85 * ex(-(q - ti - pause) / tau);
};
// áp lực, PC (rise time)
const pPC = (s: number, o: BO & {pi?: number; rise?: number} = {}) => {
  const {T = 3, ti = 1, peep = 5, pi = 15, rise = 0.08, tau = 0.22} = o;
  const q = ph(s, T);
  if (q < ti) return peep + pi * (1 - ex(-q / rise));
  return peep + pi * ex(-(q - ti) / tau);
};
const fPC = (s: number, o: BO = {}) => {
  const {T = 3, ti = 1, tau = 0.25} = o;
  const q = ph(s, T);
  if (q < ti) return Math.min(1, q / 0.05) * ex(-q / tau) * 0.95;
  return -0.85 * ex(-(q - ti) / tau);
};

// Vẽ dạng sóng kiểu màn hình monitor: quét trái → phải, lặp lại
const Wave: React.FC<{
  x: number; y: number; w: number; h: number; f: (s: number) => number; lo: number; hi: number; span: number;
  color: string; t: number; t0: number; speed?: number; base?: number; fill?: boolean; sw?: number; a?: number; once?: boolean;
}> = ({x, y, w, h, f, lo, hi, span, color, t, t0, speed = 1, base, fill, sw = 4, a = 1, once}) => {
  if (t < t0) return null;
  const el = (t - t0) * speed;
  const first = el < span || once;
  const cur = once ? Math.min(el, span) : el % span;
  const N = 420;
  const X = (s: number) => x + (s / span) * w;
  const Y = (v: number) => y + h - ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * h;
  const segs: string[] = [];
  const fills: string[] = [];
  const by = Y(base ?? lo);
  const build = (s0: number, s1: number) => {
    let d = '', fd = '', open = false, sx0 = 0, last = 0;
    for (let i = 0; i <= N; i++) {
      const s = s0 + ((s1 - s0) * i) / N;
      const v = f(s);
      if (Number.isNaN(v)) {
        if (open && fill) fd += `L${last},${by} L${sx0},${by} Z `;
        open = false;
        continue;
      }
      const px = X(s), py = Y(v);
      if (!open) { d += `M${px},${py} `; if (fill) fd += `M${px},${by} L${px},${py} `; sx0 = px; open = true; }
      else { d += `L${px},${py} `; if (fill) fd += `L${px},${py} `; }
      last = px;
    }
    if (open && fill) fd += `L${last},${by} Z`;
    segs.push(d); fills.push(fd);
  };
  if (first) build(0, Math.max(0.001, cur));
  else { build(0, cur); if (cur + span * 0.04 < span) build(cur + span * 0.04, span); }
  const hv = f(cur);
  return (
    <g opacity={a}>
      {base !== undefined && <line x1={x} x2={x + w} y1={by} y2={by} stroke="rgba(148,170,205,0.3)" strokeWidth={2} />}
      {fill && fills.map((d, i) => <path key={'f' + i} d={d} fill={color} opacity={0.13} />)}
      {segs.map((d, i) => <path key={i} d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round" filter="url(#glow)" />)}
      {!Number.isNaN(hv) && (!once || el < span) && <circle cx={X(cur)} cy={Y(hv)} r={7} fill="#fff" filter="url(#glow)" />}
    </g>
  );
};
const yv = (y: number, h: number, lo: number, hi: number, v: number) => y + h - ((v - lo) / (hi - lo)) * h;

// thẻ có tiêu đề
const Card: React.FC<{x: number; y: number; w: number; h: number; a: number; c?: string; title?: React.ReactNode; size?: number; children?: React.ReactNode; pad?: number}> = ({
  x, y, w, h, a, c, title, size = 27, children, pad = 26,
}) => (
  <Glass x={x} y={y} w={w} h={h} a={a} border={c} pad={pad}>
    {title && <div style={{fontWeight: 800, fontSize: 28, color: c ?? C.amber, marginBottom: 10, letterSpacing: 0.3}}>{title}</div>}
    <div style={{fontSize: size, lineHeight: 1.4, fontWeight: 500}}>{children}</div>
  </Glass>
);
const B: React.FC<{c?: string; children: React.ReactNode}> = ({c = C.amber, children}) => <span style={{color: c, fontWeight: 800}}>{children}</span>;
const Big: React.FC<{x: number; y: number; a: number; s?: number; c?: string; children: React.ReactNode; w?: number}> = ({x, y, a, s = 60, c = C.txt, children, w = 1760}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: s, color: c, opacity: a, transform: `scale(${0.9 + 0.1 * a})`}}>{children}</div>
);


const psBreath = (s: number, starts: number[], ps = 12, peep = 5) => {
  let last = -1;
  for (const k of starts) if (s >= k) last = k;
  const nxt = starts.find((k) => k > s) ?? 99;
  const tau = 0.35, rise = 0.12;
  const tcyc = -tau * Math.log(0.25) + 0.15; // thời điểm lưu lượng còn 25% đỉnh
  if (last < 0 || s - last > 4) return {p: nxt - s < 0.25 ? peep - 1.5 * (1 - (nxt - s) / 0.25) : peep, f: 0};
  const q = s - last;
  if (q < tcyc) {
    const f = q < 0.15 ? q / 0.15 : ex(-(q - 0.15) / tau);
    return {p: peep + ps * (1 - ex(-q / rise)), f};
  }
  const e = q - tcyc;
  return {p: peep + ps * ex(-e / 0.2), f: -0.8 * ex(-e / 0.25)};
};

// ---------- tiện ích riêng bài này ----------
const Arrow: React.FC<{x: number; y: number; a: number; c?: string; s?: number}> = ({x, y, a, c = C.muted, s = 44}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: FONT, fontWeight: 800, fontSize: s, color: c, opacity: a}}>→</div>
);
// thanh khoảng giá trị có dải mục tiêu
const Range: React.FC<{x: number; y: number; w: number; lo: number; hi: number; a0: number; a1: number; c: string; a: number; ticks: number[]; label: string; fmt?: (v: number) => string}> = ({
  x, y, w, lo, hi, a0, a1, c, a, ticks, label, fmt = (v) => String(v).replace('.', ','),
}) => {
  const X = (v: number) => ((v - lo) / (hi - lo)) * w;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: 100, opacity: a, fontFamily: FONT}}>
      <div style={{fontSize: 26, fontWeight: 800, color: c}}>{label}</div>
      <div style={{position: 'absolute', left: 0, top: 50, width: w, height: 12, borderRadius: 6, background: 'rgba(148,170,205,0.22)'}} />
      <div style={{position: 'absolute', left: X(a0), top: 42, width: (X(a1) - X(a0)) * Math.min(1, a * 1.2), height: 28, borderRadius: 14, background: c, boxShadow: `0 0 16px ${c}`}} />
      {ticks.map((v) => <div key={v} style={{position: 'absolute', left: X(v) - 24, width: 48, textAlign: 'center', top: 76, fontSize: 20, color: C.muted}}>{fmt(v)}</div>)}
    </div>
  );
};
const Balloon: React.FC<{cx: number; cy: number; r: number; neck?: number; stroke?: number; c?: string}> = ({cx, cy, r, neck = 16, stroke = 2, c = '#FFD1DC'}) => (
  <g>
    <rect x={cx - neck / 2} y={cy - r - 40} width={neck} height={42} rx={neck / 2} fill="#C9D6EA" />
    <circle cx={cx} cy={cy} r={r} fill="url(#lung)" stroke={c} strokeWidth={stroke} />
  </g>
);
const osc = (t: number, T = 3) => 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / T);

// ---------- tiện ích riêng bài oxy hoá ----------
const Big2: React.FC<{c?: string; children: React.ReactNode; s?: number}> = ({c = C.txt, children, s = 44}) => <div style={{fontSize: s, fontWeight: 800, color: c, lineHeight: 1.25}}>{children}</div>;
const TRI = [
  {k: 'PEEP', ang: -90, c: STN_COL[3]},
  {k: 'MAP', ang: 30, c: STN_COL[2]},
  {k: 'FiO₂', ang: 150, c: STN_COL[1]},
];
const Tri: React.FC<{cx: number; cy: number; R: number; t: number; a: number}> = ({cx, cy, R, t, a}) => {
  const pulse = 1 + 0.03 * Math.sin(t * 2.4);
  return (
    <g opacity={a}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.oxy} strokeWidth={6} opacity={0.5} strokeDasharray="14 10" strokeDashoffset={-t * 30} />
      <circle cx={cx} cy={cy} r={R * 0.5 * pulse} fill="#0F3A3A" stroke={C.insp} strokeWidth={5} filter="url(#glow)" />
      <text x={cx} y={cy + R * 0.11} textAnchor="middle" fill={C.txt} fontFamily={FONT} fontWeight={800} fontSize={R * 0.26}>PaO₂</text>
      {TRI.map((s, i) => {
        const x = cx + Math.cos((s.ang * Math.PI) / 180) * R, y = cy + Math.sin((s.ang * Math.PI) / 180) * R;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={R * 0.3} fill="#0E1A2E" stroke={s.c} strokeWidth={5} />
            <text x={x} y={y + R * 0.08} textAnchor="middle" fill={s.c} fontFamily={FONT} fontWeight={800} fontSize={R * 0.2}>{s.k}</text>
          </g>
        );
      })}
    </g>
  );
};
// hai mức áp lực có tự thở (BiLevel / APRV)
const twoLevel = (s: number, hi: number, lo: number, Th: number, Tl: number, rip = 1.2) => {
  const q = ph(s, Th + Tl);
  const base = q < Th ? lo + (hi - lo) * (1 - ex(-q / 0.12)) : lo + (hi - lo) * ex(-(q - Th) / 0.1);
  const r = q < Th ? Math.max(0, Math.sin(2 * Math.PI * 0.9 * q)) ** 3 : 0;
  return base - rip * r;
};

// ===================== 0. Tiêu đề =====================
const S0: React.FC<P> = () => {
  const t = useT();
  const k = sp(t, 0.6, 12);
  return (
    <AbsoluteFill>
      <Svg>
        <Tri cx={960} cy={300} R={150} t={t} a={ap(t, 0.1, 1)} />
      </Svg>
      <div style={{position: 'absolute', top: 540, width: '100%', textAlign: 'center', opacity: Math.min(1, k * 1.3), transform: `scale(${0.9 + 0.1 * k})`}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 104, letterSpacing: -2, lineHeight: 1.05, background: 'linear-gradient(180deg, #FFFFFF, #B9CBE6)', WebkitBackgroundClip: 'text', color: 'transparent'}}>
          CẢI THIỆN OXY HOÁ
        </div>
      </div>
      <div style={{position: 'absolute', top: 690, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 40, color: C.amber, opacity: ap(t, 1.2)}}>
        ở bệnh nhân thở máy · OXY = FiO₂ + MAP
      </div>
      <div style={{position: 'absolute', top: 770, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 400, fontSize: 24, color: C.muted, opacity: ap(t, 1.8)}}>
        Nguồn: Tài liệu tập huấn thở máy – Bộ Y tế · ARDSNet · ATS/ESICM/SCCM 2017
      </div>
    </AbsoluteFill>
  );
};

// ===================== 1. Mục tiêu =====================
const S1: React.FC<P> = ({S}) => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Header num="01" title="Trạm 1 · Mục tiêu oxy hoá" t={t} />
      <RM cur={0} t={t} />
      <Card x={80} y={150} w={560} h={160} a={ap(t, st(S, 0)) * 0.55} c={C.oxy} title="THÔNG KHÍ" size={30}>PaCO₂</Card>
      <Card x={80} y={330} w={560} h={170} a={ap(t, st(S, 0) + 1.2)} c={C.pink} title="OXY HOÁ ← bài này" size={30}><Big2 c={C.pink}>PaO₂</Big2></Card>
      <Chip x={80} y={530} w={560} h={80} c={C.red} a={ap(t, st(S, 1))} s={26}>PaO₂ — khí máu (đo trực tiếp)</Chip>
      <Chip x={80} y={630} w={560} h={80} c={C.blue} a={ap(t, st(S, 1) + 2)} s={26}>SpO₂ — theo dõi liên tục</Chip>
      <Glass x={680} y={150} w={1160} h={560} a={ap(t, st(S, 2))} border={C.oxy}>
        <div style={{fontSize: 28, fontWeight: 800, color: C.oxy}}>PaO₂ mục tiêu (mmHg)</div>
      </Glass>
      <Range x={720} y={230} w={1080} lo={40} hi={120} a0={80} a1={100} c={C.oxy} a={ap(t, st(S, 2) + 0.5)} ticks={[40, 50, 55, 80, 100, 120]} label="Phổi lành (TKTW, ngộ độc, hậu phẫu): 80–100" />
      <Range x={720} y={390} w={1080} lo={40} hi={120} a0={55} a1={80} c={C.amber} a={ap(t, st(S, 3))} ticks={[40, 50, 55, 80, 100, 120]} label="ARDS: 55–80 (SpO₂ 88–95%)" />
      <Range x={720} y={550} w={1080} lo={40} hi={120} a0={50} a1={80} c={C.blue} a={ap(t, st(S, 3) + 3.5)} ticks={[40, 50, 55, 80, 100, 120]} label="Sơ sinh: 50–80" />
      <Memo x={210} y={755} w={1500} h={130} t={t} s0={st(S, 4)} size={40}>Phổi lành 80–100 · ARDS 55–80 · sơ sinh 50–80</Memo>
    </AbsoluteFill>
  );
};

// ===================== 2. Hai nút =====================
const S2: React.FC<P> = ({S}) => {
  const t = useT();
  const leaves = ['Rise time', 'Pinsp (áp lực hít vào)', 'Ti (thời gian hít vào)', 'PEEP', 'Tần số'];
  const open = ap(t, st(S, 2) + 0.8, 2.5);
  const dots = [0, 1, 2, 3, 4].map((i) => ph(t * 0.6 + i / 5, 1));
  return (
    <AbsoluteFill>
      <Header num="02" title="Hai nút của oxy hoá" t={t} />
      <RM cur={0} t={t} />
      <Svg>
        <g opacity={ap(t, st(S, 1))}>
          <path d="M380,480 C430,480 430,285 480,285" stroke={STN_COL[1]} strokeWidth={4} fill="none" />
        </g>
        <g opacity={ap(t, st(S, 2))}>
          <path d="M380,480 C430,480 430,655 480,655" stroke={STN_COL[2]} strokeWidth={4} fill="none" />
        </g>
        <g opacity={ap(t, st(S, 3))}>
          {leaves.map((_, i) => <path key={i} d={`M800,655 C850,655 850,${505 + i * 82} 900,${505 + i * 82}`} stroke={STN_COL[2]} strokeWidth={3} fill="none" opacity={0.7} />)}
        </g>
        <g opacity={ap(t, st(S, 1))}>
          <circle cx={1080} cy={235} r={90} fill="#3B82F6" opacity={0.85} stroke="#93C5FD" strokeWidth={3} />
          <text x={1080} y={247} textAnchor="middle" fill="#fff" fontFamily={FONT} fontWeight={800} fontSize={32}>PAO₂</text>
          <path d="M930,360 Q1080,420 1230,360" stroke={C.red} strokeWidth={22} fill="none" strokeLinecap="round" />
          <Label x={1250} y={400} c={C.red} s={24} anchor="start">PaO₂</Label>
          {dots.map((p, i) => <circle key={i} cx={1040 + i * 20} cy={325 + p * 50} r={7} fill={C.insp} opacity={1 - p} filter="url(#glow)" />)}
        </g>
        <g opacity={ap(t, st(S, 2))}>
          <ellipse cx={1560} cy={290} rx={95} ry={20 + 75 * open} fill="url(#lung)" stroke="#FFD1DC" strokeWidth={3} />
          <Label x={1560} y={420} c={STN_COL[2]} s={24}>MAP ↑ → phế nang xẹp MỞ ra</Label>
        </g>
      </Svg>
      <Glass x={80} y={420} w={300} h={120} a={ap(t, st(S, 0))} border={C.insp} pad={16}>
        <div style={{fontSize: 34, fontWeight: 800, textAlign: 'center', lineHeight: '88px'}}>OXY HOÁ</div>
      </Glass>
      <Chip x={480} y={230} w={320} h={110} c={STN_COL[1]} a={ap(t, st(S, 0) + 1.5)} s={40} bold>FiO₂</Chip>
      <Chip x={480} y={600} w={320} h={110} c={STN_COL[2]} a={ap(t, st(S, 0) + 3)} s={40} bold>MAP</Chip>
      {leaves.map((x, i) => (
        <Chip key={i} x={900} y={470 + i * 82} w={420} h={70} c={STN_COL[2]} a={ap(t, st(S, 3) + 1 + i * 1.1)} s={25}>{x}</Chip>
      ))}
      <Memo x={1360} y={600} w={480} h={200} t={t} s0={st(S, 4)} size={34}>OXY = FiO₂ + MAP</Memo>
    </AbsoluteFill>
  );
};

// ===================== 3. FiO2 =====================
const S3: React.FC<P> = ({S}) => {
  const t = useT();
  const W = 900, X = (v: number) => ((v - 21) / 79) * W;
  const col = ap(t, st(S, 3) + 1, 3);
  return (
    <AbsoluteFill>
      <Header num="03" title="Trạm 2 · Chỉnh bằng FiO₂" t={t} />
      <RM cur={1} t={t} />
      <Glass x={80} y={150} w={1000} h={260} a={ap(t, st(S, 0))} border={STN_COL[1]}>
        <div style={{fontSize: 27, fontWeight: 800, color: STN_COL[1]}}>TKTW · ngộ độc · hậu phẫu — KHÔNG tổn thương phổi</div>
        <div style={{position: 'relative', height: 160, marginTop: 10}}>
          <div style={{position: 'absolute', left: 0, top: 60, width: X(60), height: 34, borderRadius: '17px 0 0 17px', background: `${C.oxy}88`}} />
          <div style={{position: 'absolute', left: X(60), top: 60, width: W - X(60), height: 34, borderRadius: '0 17px 17px 0', background: `${C.red}55`}} />
          <div style={{position: 'absolute', left: X(60) - 3, top: 40, width: 6, height: 74, background: C.amber}} />
          <div style={{position: 'absolute', left: X(60) - 40, top: 0, width: 80, textAlign: 'center', fontSize: 32, fontWeight: 800, color: C.amber}}>60%</div>
          <div style={{position: 'absolute', left: 10, top: 112, fontSize: 26, fontWeight: 800, color: C.oxy}}>vùng chỉnh FiO₂</div>
          <div style={{position: 'absolute', right: 10, top: 112, fontSize: 26, fontWeight: 800, color: C.red}}>ngộ độc oxy</div>
        </div>
      </Glass>
      <Card x={1120} y={150} w={720} h={125} a={ap(t, st(S, 1))} c={C.blue} size={27}>Sau cài máy: <B c={C.blue}>SpO₂ 95%</B> · khí máu sau <B>15–30 phút</B></Card>
      <Card x={1120} y={290} w={720} h={120} a={ap(t, st(S, 2))} c={C.oxy} size={27}>Tránh ngộ độc: <B c={C.oxy}>FiO₂ &lt; 60%</B> · PaO₂ 60–90</Card>
      <Card x={80} y={435} w={1000} h={290} a={ap(t, st(S, 3))} c={C.red} title="FiO₂ 100% → XẸP PHỔI do hấp thu" />
      <Svg>
        <g opacity={ap(t, st(S, 3))}>
          <circle cx={330} cy={600} r={80} fill="url(#lung)" stroke="#FFD1DC" strokeWidth={3} />
          {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={295 + (i % 3) * 35} cy={580 + Math.floor(i / 3) * 40} r={11} fill="#94A3B8" />)}
          <Label x={330} y={712} c={C.muted} s={22}>còn N₂ giữ phế nang mở</Label>
          <ellipse cx={780} cy={600} rx={80} ry={80 - 62 * col} fill="url(#lung)" stroke={C.red} strokeWidth={4} />
          <Label x={780} y={712} c={C.red} s={22}>O₂ bị hấp thu hết → xẹp</Label>
        </g>
      </Svg>
      <Card x={1120} y={435} w={720} h={290} a={ap(t, st(S, 4))} c={STN_COL[2]} title="PaO₂ vẫn thấp dù FiO₂ cao" size={28}>
        <div>= shunt · bất xứng V/Q</div>
        <div style={{fontSize: 44, fontWeight: 800, color: STN_COL[2], marginTop: 16}}>→ dùng MAP</div>
      </Card>
      <Memo x={260} y={760} w={1400} h={130} t={t} s0={st(S, 5)} size={42}>Dưới 60 → FiO₂ · cần trên 60 → MAP</Memo>
    </AbsoluteFill>
  );
};

// ===================== 4. P/F =====================
const S4: React.FC<P> = ({S}) => {
  const t = useT();
  const W = 1640, X = (v: number) => (v / 500) * W;
  const zones = [[0, 200, C.red, '≤ 200 · ARDS TB – nặng'], [200, 300, '#FACC15', '200–300 · ARDS nhẹ'], [300, 400, '#CBD5E1', '300–400 · bất thường'], [400, 500, C.oxy, '≥ 400 · bình thường']] as const;
  return (
    <AbsoluteFill>
      <Header num="04" title="Trạm 2 · Khi nào sang MAP" t={t} />
      <RM cur={1} t={t} />
      <Chip x={80} y={150} w={1760} h={90} c={STN_COL[2]} a={ap(t, st(S, 0))} s={32} bold>Chỉnh MAP khi: cần FiO₂ &gt; 60% · hoặc P/F &lt; 300</Chip>
      <Card x={80} y={270} w={860} h={210} a={ap(t, st(S, 1))} c={C.oxy} title="Thở khí trời" size={30}><Big2 s={52}>80 / 0,21 = <span style={{color: C.oxy}}>381</span></Big2></Card>
      <Card x={980} y={270} w={860} h={210} a={ap(t, st(S, 1) + 3.5)} c={C.red} title="Thở FiO₂ 50%" size={30}><Big2 s={52}>80 / 0,5 = <span style={{color: C.red}}>160</span></Big2></Card>
      <Glass x={80} y={510} w={1760} h={220} a={ap(t, st(S, 2))} border={C.blue}>
        <div style={{fontSize: 28, fontWeight: 800, color: C.blue}}>Tỉ số P/F = PaO₂ / FiO₂</div>
      </Glass>
      {zones.map(([a, b, c, l], i) => (
        <div key={i} style={{position: 'absolute', left: 140 + X(a), top: 580, width: X(b) - X(a) - 6, height: 70, borderRadius: 14, background: c, opacity: ap(t, st(S, 2) + 1 + i * 1.3), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 24, color: C.bg0}}>{l}</div>
      ))}
      <Memo x={160} y={760} w={1600} h={130} t={t} s0={st(S, 3)} size={36}>Cùng PaO₂ 80: FiO₂ càng cao → P/F càng thấp → phổi càng nặng</Memo>
    </AbsoluteFill>
  );
};

// ===================== 5. MAP = diện tích =====================
const S5: React.FC<P> = ({S}) => {
  const t = useT();
  const s3 = st(S, 3);
  const peep = 5 + 3 * ap(t, s3 + 0.5, 1.2);
  const pi = 12 + 3 * ap(t, s3 + 3, 1.2);
  const ti = 1 + 0.5 * ap(t, s3 + 5.5, 1.2);
  const T = 3;
  const map = peep + (pi * ti) / T;
  const Y = (v: number) => yv(230, 420, 0, 28, v);
  const f = (s: number) => {
    const q = ph(s, T);
    if (q < ti) return peep + pi * (1 - ex(-q / 0.05));
    return peep + pi * ex(-(q - ti) / 0.08);
  };
  return (
    <AbsoluteFill>
      <Header num="05" title="Trạm 3 · MAP là diện tích" t={t} />
      <RM cur={2} t={t} />
      <Card x={80} y={150} w={1100} h={560} a={ap(t, st(S, 0))} c={STN_COL[2]} title={<>PEEP <span style={{color: C.violet}}>{peep.toFixed(0)}</span> · Pinsp <span style={{color: C.amber}}>{pi.toFixed(0)}</span> · Ti <span style={{color: C.blue}}>{ti.toFixed(1).replace('.', ',')} s</span></>} />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <Wave x={120} y={230} w={1020} h={420} f={f} lo={0} hi={28} span={6} color={C.amber} t={t} t0={st(S, 0)} base={0} fill />
          <line x1={120} x2={1140} y1={Y(map)} y2={Y(map)} stroke={C.oxy} strokeWidth={4} strokeDasharray="12 8" filter="url(#glow)" />
          <Label x={1130} y={Y(map) - 12} c={C.oxy} s={28} anchor="end">MAP ≈ {map.toFixed(1).replace('.', ',')}</Label>
        </g>
      </Svg>
      <Glass x={1220} y={150} w={620} h={170} a={ap(t, st(S, 0))} border={C.oxy}>
        <div style={{fontSize: 26, fontWeight: 800, color: C.oxy}}>MAP (cmH₂O) — ước tính</div>
        <div style={{fontSize: 72, fontWeight: 800, color: C.oxy, lineHeight: 1.1}}>{map.toFixed(1).replace('.', ',')}</div>
      </Glass>
      <Card x={1220} y={340} w={620} h={175} a={ap(t, st(S, 1))} c={C.amber} title="Sóng vuông (PC)" size={27}>(PIP − PEEP) × Ti/Ttot + PEEP</Card>
      <Card x={1220} y={535} w={620} h={175} a={ap(t, st(S, 2))} c={C.blue} title="Sóng tam giác (VC)" size={27}>½ (PIP − PEEP) × Ti/Ttot + PEEP</Card>
      <Memo x={360} y={750} w={1200} h={130} t={t} s0={st(S, 4)} size={44}>MAP = DIỆN TÍCH dưới đường áp lực</Memo>
    </AbsoluteFill>
  );
};

// ===================== 6. Quy tắc + ví dụ =====================
const S6: React.FC<P> = ({S}) => {
  const t = useT();
  const rules: [string, number, number][] = [
    ['PEEP +1 → MAP +1', 0, 0], ['Pi +3 → MAP +1 (I:E 1:2)', 1, 0], ['I:E 1:2 → 1:1 → MAP + 1/6 Pi', 1, 3], ['↑ f, giữ I:E → MAP không đổi', 2, 0], ['↑ rise time → tăng rất ít', 2, 2.5],
  ];
  const bars: [string, number, string][] = [['Ban đầu', 9, C.muted], ['Pinsp 15', 10, C.amber], ['Ti 1,5 s', 11, C.blue], ['PEEP 8', 12, C.violet], ['f 30 (giữ I:E)', 9, C.muted]];
  return (
    <AbsoluteFill>
      <Header num="06" title="Trạm 3 · Quy tắc MAP" t={t} />
      <RM cur={2} t={t} />
      {rules.map(([x, j, d], i) => (
        <Chip key={i} x={80} y={150 + i * 105} w={760} h={90} c={i === 0 ? C.violet : STN_COL[2]} a={ap(t, st(S, j) + d)} s={29} bold={i < 2}>{x}</Chip>
      ))}
      <Glass x={880} y={150} w={960} h={510} a={ap(t, st(S, 3))} border={C.amber}>
        <div style={{fontSize: 25, fontWeight: 800, color: C.amber}}>PCV f 20 · Ti 1 · PEEP 5 · Pinsp 12 (ước tính)</div>
      </Glass>
      <Svg>
        {bars.map(([n, v, c], i) => {
          const k = sp(t, st(S, 3) + 1 + i * 1.6);
          const h = (v / 12) * 300 * k;
          return (
            <g key={i} opacity={Math.min(1, k * 1.5)}>
              <rect x={930 + i * 180} y={590 - h} width={120} height={h} rx={10} fill={c} />
              <Label x={990 + i * 180} y={578 - h} s={34}>{v}</Label>
              <Label x={990 + i * 180} y={630} c={C.muted} s={22}>{n}</Label>
            </g>
          );
        })}
      </Svg>
      <Memo x={260} y={705} w={1400} h={130} t={t} s0={st(S, 4)} size={46}>PEEP 1 → MAP 1 · Pi 3 → MAP 1</Memo>
    </AbsoluteFill>
  );
};

// ===================== 7. Hiệu quả từng nút =====================
const S7: React.FC<P> = ({S}) => {
  const t = useT();
  const rows: [string, string, number, number, number, string][] = [
    ['Rise time', 'Đồng bộ BN – máy · ít tăng MAP', 1, 0, 0, C.blue],
    ['Pinsp', 'Dễ chấn thương áp lực · tăng VT → kiềm hô hấp', 3, 1, 0, C.amber],
    ['Ti', 'Có hiệu quả · giảm máu tĩnh mạch về tim', 3, 2, 0, C.violet],
    ['PEEP', 'Hiệu quả NHẤT · an toàn NHẤT', 5, 3, 0, C.oxy],
    ['Tần số', 'Ít hiệu quả · dễ bẫy khí', 1, 3, 3, C.red],
  ];
  return (
    <AbsoluteFill>
      <Header num="07" title="Trạm 3 · Nút nào hiệu quả?" t={t} />
      <RM cur={2} t={t} />
      {rows.map(([n, d, sc, j, dd, c], i) => {
        const a = ap(t, st(S, j) + dd);
        return (
          <Glass key={i} x={80} y={150 + i * 112} w={1760} h={100} a={a} border={c} pad={18} style={i === 3 ? {boxShadow: `0 0 40px ${C.oxy}66`} : undefined}>
            <div style={{display: 'flex', alignItems: 'center', height: '100%'}}>
              <div style={{width: 230, fontSize: 34, fontWeight: 800, color: c}}>{n}</div>
              <div style={{flex: 1, fontSize: 28, fontWeight: i === 3 ? 800 : 500}}>{d}</div>
              <div style={{display: 'flex', gap: 10}}>
                {[0, 1, 2, 3, 4].map((k) => <div key={k} style={{width: 34, height: 34, borderRadius: 17, background: k < sc ? c : 'rgba(148,170,205,0.18)'}} />)}
              </div>
            </div>
          </Glass>
        );
      })}
      <Memo x={360} y={735} w={1200} h={130} t={t} s0={st(S, 4)} size={42}>Muốn tăng MAP → nghĩ đến PEEP TRƯỚC</Memo>
    </AbsoluteFill>
  );
};

// ===================== 8. VCV, dạng lưu lượng, IRV =====================
const S8: React.FC<P> = ({S}) => {
  const t = useT();
  const tri = (s: number) => pVC(s, {T: 3, ti: 1, pk: 28, R: 6});
  const sq = (s: number) => pPC(s, {T: 3, ti: 1, pi: 17});
  const Y = (v: number) => yv(510, 170, 0, 30, v);
  return (
    <AbsoluteFill>
      <Header num="08" title="Trạm 3 · MAP trong VCV" t={t} />
      <RM cur={2} t={t} />
      <Card x={80} y={150} w={1100} h={240} a={ap(t, st(S, 0))} c={C.blue} title="Tăng MAP trong VCV" size={27}>
        <div>↑ PEEP · ↑ Ti (giảm flow) hoặc cài pause · ↑ tần số</div>
        <div>↑ VT (≤ 6 mL/kg trong ARDS)</div>
      </Card>
      <Card x={80} y={410} w={1100} h={310} a={ap(t, st(S, 1))} c={C.insp} title="Lưu lượng vuông → giảm dần: đỉnh THẤP hơn, MAP CAO hơn" />
      <Svg>
        <g opacity={ap(t, st(S, 1))}>
          <Wave x={120} y={510} w={480} h={170} f={tri} lo={0} hi={30} span={3} color={C.muted} t={t} t0={st(S, 1)} base={0} fill />
          <line x1={120} x2={600} y1={Y(8.8)} y2={Y(8.8)} stroke={C.oxy} strokeWidth={3} strokeDasharray="10 6" />
          <Label x={360} y={705} c={C.muted} s={22}>vuông: đỉnh 28 · MAP ≈ 9</Label>
          <Wave x={660} y={510} w={480} h={170} f={sq} lo={0} hi={30} span={3} color={C.insp} t={t} t0={st(S, 1) + 1.5} base={0} fill />
          <line x1={660} x2={1140} y1={Y(10.7)} y2={Y(10.7)} stroke={C.oxy} strokeWidth={3} strokeDasharray="10 6" />
          <Label x={900} y={705} c={C.insp} s={22}>giảm dần: đỉnh 22 · MAP ≈ 11</Label>
        </g>
      </Svg>
      <Card x={1220} y={150} w={620} h={240} a={ap(t, st(S, 2))} c={C.violet} title="Đảo ngược I:E" size={26}>
        <div>↑ PEEP nội sinh · ↑ MAP</div>
        <div>→ cải thiện oxy hoá</div>
      </Card>
      <Card x={1220} y={410} w={620} h={310} a={ap(t, st(S, 3))} c={C.red} title="Bất lợi" size={26}>
        <div>Ảnh hưởng tim mạch</div>
        <div>Tăng áp lực nội sọ</div>
        <div>Cần an thần sâu ± giãn cơ</div>
      </Card>
      <Memo x={360} y={750} w={1200} h={130} t={t} s0={st(S, 4)} size={48}>I:E tối đa 1:1</Memo>
    </AbsoluteFill>
  );
};

// ===================== 9. PEEP trong ARDS =====================
const S9: React.FC<P> = ({S}) => {
  const t = useT();
  const mild = [['0,3', '5'], ['0,4', '5–8'], ['0,5', '8–10'], ['0,6', '10'], ['0,7', '10–14'], ['0,8', '14'], ['0,9', '14–18'], ['1,0', '18–24']];
  const sev = [['0,3', '5–14'], ['0,4', '14–16'], ['0,5', '16–18'], ['0,5–0,8', '20'], ['0,8', '22'], ['0,9', '22'], ['1,0', '22–24']];
  const step = Math.floor(ph(Math.max(0, t - st(S, 3)), 6) / 1.5);
  const hl = t > st(S, 3) ? [2, 3, 4, 3][step] : -1;
  return (
    <AbsoluteFill>
      <Header num="09" title="Trạm 4 · PEEP trong ARDS" t={t} />
      <RM cur={3} t={t} />
      <Chip x={80} y={150} w={1760} h={80} c={C.red} a={ap(t, st(S, 0))} s={30} bold>PEEP trong ARDS: vẫn còn điều trị DƯỚI mức</Chip>
      <Chip x={80} y={255} w={860} h={80} c={C.oxy} a={ap(t, st(S, 1))} s={28}>Phổi bình thường: PEEP 5</Chip>
      <Chip x={980} y={255} w={860} h={80} c={C.amber} a={ap(t, st(S, 1) + 2)} s={28}>Phổi ↓ compliance: PEEP 10–15</Chip>
      <Glass x={80} y={360} w={1760} h={330} a={ap(t, st(S, 2))} border={C.blue}>
        <div style={{fontSize: 26, fontWeight: 800, color: C.blue}}>Bảng FiO₂ / PEEP (ARDSNet)</div>
      </Glass>
      {[['PEEP thấp / FiO₂ cao · ARDS nhẹ', mild, '#FACC15'], ['PEEP cao / FiO₂ thấp · ARDS TB – nặng', sev, C.red]].map(([n, arr, c], r) => (
        <div key={r} style={{position: 'absolute', left: 120, top: 415 + r * 135, display: 'flex', gap: 10, fontFamily: FONT, opacity: ap(t, st(S, 2) + 1 + r * 2.5)}}>
          <div style={{width: 300, fontSize: 24, fontWeight: 800, color: c as string, paddingTop: 20, lineHeight: 1.3}}>{n as string}</div>
          {(arr as string[][]).map(([f, p], i) => (
            <div key={i} style={{width: 150, height: 110, borderRadius: 12, background: r === 0 && i === hl ? `${C.oxy}44` : 'rgba(14,26,46,0.9)', border: `2px solid ${r === 0 && i === hl ? C.oxy : (c as string) + '66'}`, textAlign: 'center', paddingTop: 10, boxSizing: 'border-box'}}>
              <div style={{fontSize: 22, color: C.muted}}>FiO₂ {f}</div>
              <div style={{fontSize: 34, fontWeight: 800, color: C.txt}}>{p}</div>
            </div>
          ))}
        </div>
      ))}
      <Chip x={80} y={715} w={860} h={80} c={C.oxy} a={ap(t, st(S, 3))} s={26}>SpO₂ 88–95% · dưới mục tiêu → tiến 1 bước</Chip>
      <Chip x={980} y={715} w={860} h={80} c={C.amber} a={ap(t, st(S, 3) + 2)} s={26}>Quá mục tiêu → lùi 1 bước</Chip>
      <Chip x={80} y={815} w={1760} h={80} c={C.violet} a={ap(t, st(S, 4))} s={28}>Tiện lợi, giảm bất đồng — nhưng KHÔNG cá nhân hoá</Chip>
    </AbsoluteFill>
  );
};

// ===================== 10. PEEP tối ưu =====================
const S10: React.FC<P> = ({S}) => {
  const t = useT();
  const P = [8, 10, 12, 14, 16, 18, 20], Cd = [25, 30, 35, 40, 35, 30, 25], Pp = [25, 26, 27, 28, 30, 33, 37], Sp = [86, 90, 92, 95, 97, 98, 93];
  const cx = (i: number) => 1060 + i * 115;
  const yC = (v: number) => yv(300, 280, 20, 45, v);
  const n = Math.floor(ap(t, st(S, 2) + 1, 5) * 7 + 0.001);
  return (
    <AbsoluteFill>
      <Header num="10" title="Trạm 4 · Tìm PEEP tối ưu" t={t} />
      <RM cur={3} t={t} />
      <Card x={80} y={150} w={860} h={250} a={ap(t, st(S, 0))} c={C.amber} title="Hai cách dò PEEP" size={27}>
        <div>• Tăng dần PEEP</div>
        <div>• Giảm dần sau huy động phế nang</div>
        <div><B c={C.amber}>Cơ học phổi (Cstat) &gt; oxy hoá</B></div>
      </Card>
      <Card x={80} y={420} w={860} h={300} a={ap(t, st(S, 1))} c={C.blue} title="Độ giãn nở" size={30}>
        <div>Cstat = VT / (Pplat − PEEP tổng)</div>
        <div style={{marginTop: 10}}>Cdyn = VT / (Ppeak − PEEP)</div>
        <div style={{fontSize: 24, color: C.muted, marginTop: 14}}>Tăng dần: VT 6 mL/kg · +2–3 cmH₂O mỗi 3–5 phút</div>
      </Card>
      <Card x={980} y={150} w={860} h={570} a={ap(t, st(S, 2))} c={C.oxy} title="Thử nghiệm PEEP tăng dần" />
      <Svg>
        <g opacity={ap(t, st(S, 2))}>
          {P.slice(0, n).map((p, i) => (
            <g key={i}>
              {i > 0 && <line x1={cx(i - 1)} y1={yC(Cd[i - 1])} x2={cx(i)} y2={yC(Cd[i])} stroke={C.oxy} strokeWidth={4} />}
              <circle cx={cx(i)} cy={yC(Cd[i])} r={10} fill={C.oxy} />
              <Label x={cx(i)} y={yC(Cd[i]) - 18} c={C.oxy} s={22}>{Cd[i]}</Label>
              <Label x={cx(i)} y={620} s={24}>{p}</Label>
              <Label x={cx(i)} y={655} c={Pp[i] > 30 ? C.red : C.muted} s={20}>Pplat {Pp[i]}</Label>
              <Label x={cx(i)} y={685} c={C.blue} s={20}>SpO₂ {Sp[i]}</Label>
            </g>
          ))}
          <Label x={1010} y={620} c={C.muted} s={20} anchor="start">PEEP</Label>
          {t > st(S, 3) && (
            <g opacity={ap(t, st(S, 3))}>
              <rect x={cx(3) - 52} y={250} width={104} height={450} rx={14} fill="none" stroke={C.amber} strokeWidth={4} filter="url(#glow)" />
              <Label x={cx(3)} y={238} c={C.amber} s={26}>Best PEEP 14</Label>
            </g>
          )}
        </g>
      </Svg>
      <Memo x={260} y={755} w={1400} h={130} t={t} s0={st(S, 4)} size={40}>Best PEEP = compliance TỐT NHẤT + Pplat ≤ 30</Memo>
    </AbsoluteFill>
  );
};

// ===================== 11. PEEP cao có hại =====================
const S11: React.FC<P> = ({S}) => {
  const t = useT();
  const cards: [number, number, number, string, string, number, number][] = [
    [160, 160, 560, 'TIM', 'Cản máu tĩnh mạch về → ↓ cung lượng tim', 0, 0],
    [1200, 160, 560, 'NÃO', '↑ áp lực nội sọ', 0, 2],
    [80, 400, 560, 'PHỔI', 'Chấn thương áp lực · căng phế nang quá mức', 1, 0],
    [1280, 400, 560, 'THẬN', '↓ tưới máu → ↓ nước tiểu', 3, 0],
    [680, 630, 560, 'DẠ DÀY', 'Loét do stress', 3, 2],
  ];
  const lines: [number, number][] = [[440, 300], [1480, 300], [640, 480], [1280, 480], [960, 630]];
  return (
    <AbsoluteFill>
      <Header num="11" title="Trạm 4 · PEEP cao có hại" t={t} />
      <RM cur={3} t={t} />
      <Svg>
        {lines.map(([x, y], i) => (
          <line key={i} x1={960} y1={470} x2={x} y2={y} stroke={C.red} strokeWidth={3} opacity={0.5 * ap(t, st(S, cards[i][5]) + cards[i][6])} />
        ))}
        <circle cx={960} cy={470} r={110} fill="#4A1420" stroke={C.red} strokeWidth={5} filter="url(#glow)" opacity={ap(t, st(S, 0))} />
        <text x={960} y={462} textAnchor="middle" fill={C.txt} fontFamily={FONT} fontWeight={800} fontSize={40} opacity={ap(t, st(S, 0))}>PEEP</text>
        <text x={960} y={505} textAnchor="middle" fill={C.red} fontFamily={FONT} fontWeight={800} fontSize={36} opacity={ap(t, st(S, 0))}>CAO</text>
      </Svg>
      {cards.map(([x, y, w, h, d, j, dd], i) => (
        <Card key={i} x={x} y={y} w={w} h={i === 2 ? 170 : 140} a={ap(t, st(S, j) + dd + (i === 2 ? 0 : 0))} c={C.red} title={h} size={26} pad={20}>{d}</Card>
      ))}
      <Memo x={260} y={790} w={1400} h={105} t={t} s0={st(S, 4)} size={40}>PEEP cao: TIM · NÃO · PHỔI · THẬN · DẠ DÀY</Memo>
    </AbsoluteFill>
  );
};

// ===================== 12. Leo thang =====================
const S12: React.FC<P> = ({S}) => {
  const t = useT();
  const tiers: [string, string[], string, number][] = [
    ['Thở máy cổ điển', ['FiO₂', 'PEEP', 'Ti', 'Pi', 'f'], C.oxy, 1],
    ['Thở máy nâng cao', ['Mở phổi', 'Nằm sấp', 'APRV', 'HFOV', 'NO hít'], C.amber, 2],
    ['Biện pháp khác', ['ECMO', 'Surfactant', '…'], C.red, 2],
  ];
  const W = 860, X = (pf: number) => 940 + ((300 - pf) / 250) * W;
  const bars: [string, number][] = [['Thở máy bảo vệ phổi', 300], ['PEEP cao', 200], ['Nằm sấp', 150], ['Mở phổi · NO · HFOV', 100], ['ECMO', 60]];
  return (
    <AbsoluteFill>
      <Header num="12" title="Trạm 5 · Leo thang" t={t} />
      <RM cur={4} t={t} />
      {tiers.map(([n, items, c, j], i) => (
        <Glass key={i} x={80 + i * 30} y={150 + i * 175} w={760 - i * 30} h={155} a={ap(t, i === 0 ? st(S, 0) : st(S, j) + (i - 1) * 2.5)} border={c} pad={20}>
          <div style={{fontSize: 30, fontWeight: 800, color: c}}>{i + 1}. {n}</div>
          <div style={{display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap'}}>
            {items.map((x, k) => <div key={k} style={{padding: '6px 16px', borderRadius: 20, border: `2px solid ${c}`, fontSize: 24, fontWeight: 700}}>{x}</div>)}
          </div>
        </Glass>
      ))}
      <Glass x={880} y={150} w={960} h={560} a={ap(t, st(S, 3))} border={C.violet}>
        <div style={{fontSize: 26, fontWeight: 800, color: C.violet}}>P/F càng thấp → biện pháp càng mạnh (minh hoạ)</div>
      </Glass>
      <Svg>
        <g opacity={ap(t, st(S, 3))}>
          <rect x={X(300)} y={230} width={X(200) - X(300)} height={400} fill={C.oxy} opacity={0.18} />
          <rect x={X(200)} y={230} width={X(100) - X(200)} height={400} fill="#FACC15" opacity={0.18} />
          <rect x={X(100)} y={230} width={X(50) - X(100)} height={400} fill={C.red} opacity={0.2} />
          {bars.map(([n, pf], i) => {
            const a = ap(t, st(S, 3) + 1 + i * 1.2);
            const y = 580 - i * 75;
            return (
              <g key={i} opacity={a}>
                <rect x={X(pf)} y={y} width={(X(50) - X(pf)) * a} height={50} rx={10} fill="#0E1A2E" stroke={[C.oxy, '#FACC15', C.amber, C.red, C.pink][i]} strokeWidth={3} />
                <Label x={i >= 3 ? X(pf) - 12 : X(pf) + 14} y={y + 34} s={23} anchor={i >= 3 ? 'end' : 'start'}>{n}</Label>
              </g>
            );
          })}
          {[300, 200, 150, 100, 50].map((v) => <Label key={v} x={X(v)} y={668} c={C.muted} s={22}>{v}</Label>)}
        </g>
      </Svg>
      <Memo x={210} y={750} w={1500} h={130} t={t} s0={st(S, 4)} size={40}>Nền tảng luôn là THỞ MÁY BẢO VỆ PHỔI</Memo>
    </AbsoluteFill>
  );
};

// ===================== 13. Nằm sấp =====================
const S13: React.FC<P> = ({S}) => {
  const t = useT();
  const k = ap(t, st(S, 0) + 2, 3);
  const surv = (base: number) => (s: number) => base + (1 - base) * ex(-s / 1.8);
  return (
    <AbsoluteFill>
      <Header num="13" title="Trạm 5 · Nằm sấp" t={t} />
      <RM cur={4} t={t} />
      <Card x={80} y={150} w={860} h={300} a={ap(t, st(S, 0))} c={C.amber} title="Vùng phổi phía lưng được MỞ ra" />
      <Svg>
        <defs>
          <linearGradient id="supine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F07A98" />
            <stop offset="0.5" stopColor="#F07A98" />
            <stop offset="0.56" stopColor="#5B2333" />
            <stop offset="1" stopColor="#5B2333" />
          </linearGradient>
          <linearGradient id="dorsal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F07A98" />
            <stop offset={0.5 + 0.44 * k} stopColor="#F07A98" />
            <stop offset={0.56 + 0.44 * k} stopColor="#5B2333" />
            <stop offset="1" stopColor="#5B2333" />
          </linearGradient>
        </defs>
        <g opacity={ap(t, st(S, 0))}>
          <ellipse cx={300} cy={310} rx={150} ry={80} fill="url(#supine)" stroke="#FFD1DC" strokeWidth={3} />
          <ellipse cx={720} cy={310} rx={150} ry={80} fill="url(#dorsal)" stroke="#FFD1DC" strokeWidth={3} />
          <Label x={300} y={425} c={C.muted} s={22}>nằm ngửa: vùng lưng xẹp</Label>
          <Label x={720} y={425} c={C.oxy} s={22}>nằm sấp: vùng lưng mở dần</Label>
        </g>
      </Svg>
      <Card x={980} y={150} w={860} h={300} a={ap(t, st(S, 0))} c={C.oxy} title="Tác dụng" size={25}>
        {['Mở phổi · cải thiện V/Q', 'Giảm căng phế nang · giảm viêm', 'Dẫn lưu đàm vùng sau dưới', 'Giảm tổn thương phổi do thở máy'].map((x, i) => (
          <div key={i} style={{opacity: ap(t, st(S, 0) + 1.5 + i * 1.5)}}>• {x}</div>
        ))}
      </Card>
      <Card x={80} y={475} w={560} h={260} a={ap(t, st(S, 1))} c={C.blue} title="PROSEVA 2013 (minh hoạ)" />
      <Svg>
        <g opacity={ap(t, st(S, 1))}>
          <Wave x={110} y={560} w={500} h={150} f={surv(0.77)} lo={0.4} hi={1} span={9} color={C.oxy} t={t} t0={st(S, 1)} speed={3} sw={3} once />
          <Wave x={110} y={560} w={500} h={150} f={surv(0.59)} lo={0.4} hi={1} span={9} color={C.red} t={t} t0={st(S, 1)} speed={3} sw={3} once />
          <Label x={600} y={600} c={C.oxy} s={22} anchor="end">nằm sấp</Label>
          <Label x={600} y={690} c={C.red} s={22} anchor="end">nằm ngửa</Label>
        </g>
      </Svg>
      <Card x={660} y={475} w={560} h={260} a={ap(t, st(S, 2))} c={C.violet} title="Cochrane 2015 · tử vong" size={25}>
        <div>Trong 48 giờ: <B c={C.oxy}>RR 0,75</B></div>
        <div>&gt; 16 giờ/ngày: <B c={C.oxy}>RR 0,77</B></div>
        <div>Thiếu oxy nặng: <B c={C.oxy}>RR 0,77</B></div>
      </Card>
      <Glass x={1240} y={475} w={600} h={260} a={ap(t, st(S, 3))} border={C.amber}>
        <div style={{display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginTop: 18}}>
          {[['≤ 150', 'P/F'], ['≤ 48', 'giờ'], ['≥ 16', 'giờ/ngày']].map(([a, b], i) => (
            <div key={i} style={{opacity: ap(t, st(S, 3) + i * 1.2)}}>
              <div style={{fontSize: 50, fontWeight: 800, color: C.amber}}>{a}</div>
              <div style={{fontSize: 26, color: C.muted}}>{b}</div>
            </div>
          ))}
        </div>
      </Glass>
      <Memo x={360} y={765} w={1200} h={125} t={t} s0={st(S, 4)} size={52}>NẰM SẤP 150 – 48 – 16</Memo>
    </AbsoluteFill>
  );
};

// ===================== 14. Mở phổi: khái niệm =====================
const S14: React.FC<P> = ({S}) => {
  const t = useT();
  const pts: [number, number][] = [[130, 470], [260, 470], [440, 250], [640, 470], [700, 520], [740, 520], [740, 250], [830, 250], [830, 420], [1120, 420]];
  const prog = ap(t, st(S, 0) + 0.5, 6);
  const L = pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
  const cmp: [string, string, number, number][] = [['SỚM (viêm)', 'muộn (xơ hoá)', 2, 0], ['NGOÀI phổi (xẹp)', 'tại phổi (đông đặc)', 2, 3], ['LAN TOẢ', 'khu trú', 3, 0], ['Thành ngực ĐÀN HỒI', 'cứng', 3, 3]];
  return (
    <AbsoluteFill>
      <Header num="14" title="Trạm 6 · Mở phổi" t={t} />
      <RM cur={5} t={t} />
      <Card x={80} y={150} w={1100} h={420} a={ap(t, st(S, 0))} c={C.amber} title="Mở phế nang xẹp → GIỮ cho chúng mở" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <path d={pathD(pts)} fill="none" stroke={C.amber} strokeWidth={6} strokeDasharray={`${L * prog} ${L}`} filter="url(#glow)" strokeLinejoin="round" />
          <Label x={200} y={505} c={C.muted} s={22}>xẹp?</Label>
          <Label x={440} y={235} c={C.oxy} s={24}>MỞ</Label>
          <Label x={720} y={555} c={C.red} s={22}>xẹp lại</Label>
          <Label x={785} y={235} c={C.oxy} s={24}>mở lại</Label>
          <Label x={980} y={400} c={C.oxy} s={24}>GIỮ MỞ</Label>
        </g>
      </Svg>
      {['Vượt áp lực mở tới hạn (thì hít vào)', 'Giữ áp lực mở đủ lâu', 'PEEP đủ cao (thì thở ra)'].map((x, i) => (
        <Card key={i} x={1220} y={150 + i * 145} w={620} h={130} a={ap(t, st(S, 1) + i * 1.6)} c={[C.blue, C.oxy, '#A3E635'][i]} title={`Bước ${i + 1}`} size={25} pad={18}>{x}</Card>
      ))}
      {cmp.map(([a, b, j, d], i) => (
        <Chip key={i} x={80 + i * 445} y={595} w={425} h={84} c={C.blue} a={ap(t, st(S, j) + d)} s={23}><b>{a}</b>&nbsp;&gt;&nbsp;{b}</Chip>
      ))}
      <Chip x={80} y={700} w={860} h={84} c={C.oxy} a={ap(t, st(S, 4))} s={25}>Có đáp ứng: PaO₂ ↑ · compliance ↑</Chip>
      <Chip x={980} y={700} w={860} h={84} c={C.red} a={ap(t, st(S, 4) + 2.5)} s={25}>Không đáp ứng: quá căng, ↓ cung lượng tim</Chip>
      <Memo x={360} y={805} w={1200} h={95} t={t} s0={st(S, 5)} size={44}>MỞ PHỔI = VƯỢT · GIỮ · GIỮ MỞ</Memo>
    </AbsoluteFill>
  );
};

// ===================== 15. Mở phổi: thực hiện =====================
const S15: React.FC<P> = ({S}) => {
  const t = useT();
  const up = [10, 15, 20, 25];
  const down = [25, 23, 21, 19, 17, 15];
  const X0 = 140, Y = (v: number) => yv(230, 380, 0, 30, v);
  const xu = (i: number) => X0 + i * 70;
  const xd = (i: number) => X0 + 4 * 70 + i * 120;
  const nu = Math.floor(ap(t, st(S, 1) + 0.5, 4) * 4 + 0.001);
  const nd = Math.floor(ap(t, st(S, 2) + 0.5, 5) * 6 + 0.001);
  const fx = [12, 8, 1];
  return (
    <AbsoluteFill>
      <Header num="15" title="Trạm 6 · Cách mở phổi" t={t} />
      <RM cur={5} t={t} />
      <Card x={80} y={150} w={1200} h={520} a={ap(t, st(S, 0))} c={C.amber} title="PEEP theo thời gian (minh hoạ)" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          {up.slice(0, nu).map((v, i) => (
            <g key={i}>
              <rect x={xu(i)} y={Y(v)} width={64} height={Y(0) - Y(v)} rx={6} fill={C.oxy} opacity={0.8} />
              <Label x={xu(i) + 32} y={Y(v) - 10} s={24}>{v}</Label>
            </g>
          ))}
          {down.slice(0, nd).map((v, i) => (
            <g key={i}>
              <rect x={xd(i)} y={Y(v)} width={112} height={Y(0) - Y(v)} rx={6} fill={C.blue} opacity={0.8} />
              <Label x={xd(i) + 56} y={Y(v) - 10} s={24}>{v}</Label>
            </g>
          ))}
          <line x1={X0} x2={1250} y1={Y(0)} y2={Y(0)} stroke="rgba(148,170,205,0.4)" strokeWidth={2} />
          {nu > 0 && <Label x={X0 + 140} y={Y(0) + 34} c={C.oxy} s={23}>LÊN +5 / 2 phút</Label>}
          {nd > 0 && <Label x={xd(3)} y={Y(0) + 34} c={C.blue} s={23}>XUỐNG −2 / 5 phút → tìm áp lực đóng</Label>}
        </g>
      </Svg>
      <Glass x={1320} y={150} w={520} h={150} a={ap(t, st(S, 0))} border={C.amber}>
        <div style={{fontSize: 64, fontWeight: 800, textAlign: 'center', color: C.amber, lineHeight: '96px'}}>5/2 · 2/5</div>
      </Glass>
      <Card x={1320} y={320} w={520} h={150} a={ap(t, st(S, 1))} c={C.oxy} size={24}>Bắt đầu 10 · tối đa 25 (lần 2: 30, lần 3: 35)</Card>
      <Card x={1320} y={490} w={520} h={180} a={ap(t, st(S, 3))} c={C.blue} title="Đáp ứng (+)" size={24}>PaO₂/SpO₂, P/F, PaCO₂ cải thiện · compliance ↑</Card>
      <Glass x={80} y={690} w={1760} h={100} a={ap(t, st(S, 4))} border={C.red}>
        <div style={{display: 'flex', alignItems: 'center', gap: 30, height: '100%', fontSize: 26}}>
          <B c={C.red}>Tác dụng phụ</B>
          {['Tụt HA thoáng qua', 'Giảm SpO₂ thoáng qua', 'Loạn nhịp, chấn thương áp lực'].map((x, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10, opacity: ap(t, st(S, 4) + 1 + i * 1.5)}}>
              <div style={{width: fx[i] * 14, height: 24, borderRadius: 6, background: C.red}} />
              <span>{x} <b>{fx[i]}%</b></span>
            </div>
          ))}
        </div>
      </Glass>
      <Memo x={360} y={805} w={1200} h={95} t={t} s0={st(S, 5)} size={40}>LÊN 5 mỗi 2 phút · XUỐNG 2 mỗi 5 phút</Memo>
    </AbsoluteFill>
  );
};

// ===================== 16. iNO & HFOV =====================
const S16: React.FC<P> = ({S}) => {
  const t = useT();
  const dil = ap(t, st(S, 0) + 2, 2.5);
  const no = [0, 1, 2, 3, 4].map((i) => ph(t * 0.5 + i / 5, 1));
  const cmv = (s: number) => 15 + 10 * Math.sign(Math.sin(2 * Math.PI * s / 3));
  const hf = (s: number) => 18 + 2.5 * Math.sin(2 * Math.PI * 6 * s);
  return (
    <AbsoluteFill>
      <Header num="16" title="Trạm 7 · NO hít và HFOV" t={t} />
      <RM cur={6} t={t} />
      <Card x={80} y={150} w={860} h={400} a={ap(t, st(S, 0))} c={C.insp} title="NO hít: giãn mạch phổi CHỌN LỌC" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <circle cx={330} cy={340} r={85} fill="#3B82F6" opacity={0.8} stroke="#93C5FD" strokeWidth={3} />
          <Label x={330} y={350} s={26}>phế nang</Label>
          {no.map((p, i) => <circle key={i} cx={300 + i * 15} cy={420 + p * 70} r={7} fill={C.insp} opacity={1 - p} filter="url(#glow)" />)}
          <path d="M150,520 L850,520" stroke={C.red} strokeWidth={24 + 26 * dil} strokeLinecap="round" opacity={0.85} />
          <Label x={680} y={460} c={C.red} s={24}>mạch phổi giãn → ↓ shunt, ↑ V/Q</Label>
        </g>
      </Svg>
      <Chip x={80} y={570} w={420} h={84} c={C.oxy} a={ap(t, st(S, 1))} s={26} bold>✓ P/F ↑ ở 24 giờ</Chip>
      <Chip x={520} y={570} w={420} h={84} c={C.red} a={ap(t, st(S, 1) + 2)} s={26} bold>✗ không giảm tử vong</Chip>
      <Card x={980} y={150} w={860} h={400} a={ap(t, st(S, 2))} c={C.violet} title="HFOV: dao động nhỏ quanh MAP cao" />
      <Svg>
        <g opacity={ap(t, st(S, 2))}>
          <Wave x={1020} y={250} w={780} h={260} f={cmv} lo={0} hi={30} span={6} color={C.muted} t={t} t0={st(S, 2)} sw={3} />
          <Wave x={1020} y={250} w={780} h={260} f={hf} lo={0} hi={30} span={6} color={C.violet} t={t} t0={st(S, 2)} sw={3} />
          <Label x={1790} y={290} c={C.muted} s={22} anchor="end">thở máy thường</Label>
          <Label x={1790} y={545} c={C.violet} s={22} anchor="end">rung tần số cao</Label>
        </g>
      </Svg>
      <Chip x={980} y={570} w={420} h={84} c={C.muted} a={ap(t, st(S, 2) + 2)} s={25}>OSCAR: sống còn không khác</Chip>
      <Chip x={1420} y={570} w={420} h={84} c={C.red} a={ap(t, st(S, 2) + 4)} s={25}>OSCILLATE: tử vong CAO hơn</Chip>
      <Chip x={80} y={675} w={1760} h={84} c={C.violet} a={ap(t, st(S, 3))} s={27}>HFOV còn dùng: dập phổi · tràn khí màng phổi · chấn thương áp lực · khi biện pháp khác thất bại</Chip>
      <Memo x={260} y={780} w={1400} h={110} t={t} s0={st(S, 4)} size={40}>NO cải thiện OXY, không cải thiện SỐNG CÒN</Memo>
    </AbsoluteFill>
  );
};

// ===================== 17. Tự thở, BiLevel, APRV =====================
const S17: React.FC<P> = ({S}) => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Header num="17" title="Trạm 7 · BiLevel và APRV" t={t} />
      <RM cur={6} t={t} />
      <Card x={80} y={150} w={1100} h={280} a={ap(t, st(S, 1))} c={C.amber} title="BiLevel: tự thở trên 2 mức áp lực" />
      <Card x={80} y={450} w={1100} h={270} a={ap(t, st(S, 2))} c={C.red} title="APRV: xả áp RẤT NGẮN · I:E đảo ngược" />
      <Svg>
        <g opacity={ap(t, st(S, 1))}>
          <Wave x={120} y={220} w={1020} h={180} f={(s) => twoLevel(s, 22, 10, 2.4, 1.6)} lo={0} hi={26} span={8} color={C.amber} t={t} t0={st(S, 1)} base={0} fill />
        </g>
        <g opacity={ap(t, st(S, 2))}>
          <Wave x={120} y={520} w={1020} h={170} f={(s) => twoLevel(s, 24, 4, 3.4, 0.5)} lo={0} hi={28} span={8} color={C.red} t={t} t0={st(S, 2)} base={0} fill />
        </g>
      </Svg>
      <Card x={1220} y={150} w={620} h={280} a={ap(t, st(S, 0))} c={C.oxy} title="Giữ nhịp TỰ THỞ" size={26}>
        <div>Cơ hoành vùng lưng hoạt động</div>
        <div>→ trao đổi khí tốt hơn</div>
        <div>Áp lực lồng ngực thấp → ít ảnh hưởng huyết động</div>
      </Card>
      <Card x={1220} y={450} w={620} h={270} a={ap(t, st(S, 3))} c={C.red} title="Chỉ định APRV" size={24}>
        <div>Compliance thấp: ARDS, dập phổi, phù phổi</div>
        <div>FiO₂ ≥ 60% chưa đủ oxy</div>
        <div>PIP ≥ 35 và/hoặc PEEP ≥ 10</div>
      </Card>
      <Chip x={80} y={750} w={1760} h={100} c={C.violet} a={ap(t, st(S, 4))} s={30} bold>Xem xét APRV TRƯỚC khi giãn cơ · phối hợp được với nằm sấp, NO</Chip>
    </AbsoluteFill>
  );
};

// ===================== 18. ECMO =====================
const S18: React.FC<P> = ({S}) => {
  const t = useT();
  const loop: [number, number][] = [[200, 560], [200, 300], [480, 300], [760, 300], [760, 560], [480, 560], [200, 560]];
  const k = sp(t, st(S, 2) + 1);
  return (
    <AbsoluteFill>
      <Header num="18" title="Trạm 7 · ECMO" t={t} />
      <RM cur={6} t={t} />
      <Card x={80} y={150} w={1000} h={570} a={ap(t, st(S, 0))} c={C.red} title="ECMO tĩnh mạch – tĩnh mạch (VV)" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <Tube pts={loop.slice(0, 4)} w={20} color="#3B4F7A" />
          <Tube pts={loop.slice(3)} w={20} color="#7A2A3B" />
          <Flow pts={loop.slice(0, 4)} color="#60A5FA" t={t} />
          <Flow pts={loop.slice(3)} color={C.red} t={t} />
          <rect x={150} y={500} width={100} height={110} rx={18} fill="#152138" stroke={C.muted} strokeWidth={3} />
          <Label x={200} y={640} c={C.muted} s={22}>bệnh nhân</Label>
          <Fan x={480} y={300} r={44} t={t} c={C.insp} />
          <Label x={480} y={380} c={C.insp} s={22}>bơm</Label>
          <rect x={700} y={250} width={120} height={100} rx={14} fill="#4A1420" stroke={C.red} strokeWidth={4} />
          <text x={760} y={310} textAnchor="middle" fill={C.txt} fontFamily={FONT} fontWeight={800} fontSize={24}>màng O₂</text>
          <Label x={930} y={290} c={C.oxy} s={24}>+ O₂</Label>
          <Label x={930} y={330} c={C.muted} s={24}>− CO₂</Label>
          <Label x={480} y={530} c={C.red} s={22}>máu giàu O₂ trả về</Label>
          <Label x={340} y={280} c={C.blue} s={22}>máu tĩnh mạch</Label>
        </g>
      </Svg>
      <Card x={1120} y={150} w={720} h={150} a={ap(t, st(S, 1))} c={C.amber} size={25}>&gt; 44 năm cho ARDS · Úc – NZ: thành công cao trong ARDS do cúm A H1N1</Card>
      <Glass x={1120} y={320} w={720} h={270} a={ap(t, st(S, 2))} border={C.blue}>
        <div style={{fontSize: 26, fontWeight: 800, color: C.blue}}>CESAR 2009 · tử vong / tàn tật nặng</div>
      </Glass>
      <Svg>
        <g opacity={ap(t, st(S, 2))}>
          {[[37, 'ECMO', C.oxy], [53, 'Thường quy', C.red]].map(([v, n, c], i) => (
            <g key={i}>
              <rect x={1200 + i * 300} y={570 - (v as number) * 3.1 * k} width={170} height={(v as number) * 3.1 * k} rx={10} fill={c as string} />
              <Label x={1285 + i * 300} y={560 - (v as number) * 3.1 * k} s={30}>{v}%</Label>
              <Label x={1285 + i * 300} y={606} c={C.muted} s={20}>{n}</Label>
            </g>
          ))}
        </g>
      </Svg>
      <Chip x={1120} y={620} w={720} h={100} c={C.muted} a={ap(t, st(S, 3))} s={25}>Tử vong đơn thuần: có giảm, chưa ý nghĩa thống kê</Chip>
      <Memo x={360} y={760} w={1200} h={125} t={t} s0={st(S, 4)} size={46}>ECMO = PHỔI THAY THẾ tạm thời</Memo>
    </AbsoluteFill>
  );
};

// ===================== 19. Guideline 2017 =====================
const S19: React.FC<P> = ({S}) => {
  const t = useT();
  const rows: [string, string, string, number, number][] = [
    ['MẠNH · NÊN', 'VT 4–8 mL/kg PBW · Pplat < 30 cmH₂O', C.oxy, 0, 1],
    ['MẠNH · NÊN', 'Nằm sấp > 12 giờ/ngày trong ARDS nặng', C.oxy, 1, 0],
    ['MẠNH · KHÔNG NÊN', 'HFOV thường quy trong ARDS trung bình – nặng', C.red, 2, 0],
    ['CÓ ĐIỀU KIỆN', 'PEEP cao · thủ thuật mở phổi (ARDS TB – nặng)', C.amber, 3, 0],
    ['CHƯA ĐỦ BẰNG CHỨNG', 'ECMO trong ARDS nặng', C.muted, 3, 4],
  ];
  return (
    <AbsoluteFill>
      <Header num="19" title="Trạm 7 · Khuyến cáo 2017" t={t} />
      <RM cur={6} t={t} />
      <div style={{position: 'absolute', left: 80, top: 140, fontFamily: FONT, fontSize: 26, color: C.muted, opacity: ap(t, st(S, 0))}}>ATS / ESICM / SCCM 2017 — thở máy trong ARDS người lớn</div>
      {rows.map(([h, d, c, j, dd], i) => (
        <Glass key={i} x={80} y={190 + i * 140} w={1760} h={120} a={ap(t, st(S, j) + dd)} border={c} pad={20}>
          <div style={{display: 'flex', alignItems: 'center', height: '100%'}}>
            <div style={{width: 420, fontSize: 30, fontWeight: 800, color: c}}>{h}</div>
            <div style={{fontSize: 32, fontWeight: 600}}>{d}</div>
          </div>
        </Glass>
      ))}
    </AbsoluteFill>
  );
};

// ===================== 20. Ôn tập =====================
const S20: React.FC<P> = ({S}) => {
  const t = useT();
  const items: [string, string, number][] = [
    ['MỤC TIÊU', 'Phổi lành 80–100 · ARDS 55–80 · sơ sinh 50–80', 0],
    ['FiO₂', 'Dưới 60 chỉnh FiO₂ · cần > 60 hoặc P/F < 300 → MAP', 0],
    ['MAP', 'Diện tích · PEEP 1 → 1, Pi 3 → 1 · I:E tối đa 1:1', 1],
    ['PEEP', 'Hiệu quả & an toàn nhất · best PEEP theo compliance', 1],
    ['NẰM SẤP', '150 – 48 – 16', 2],
    ['MỞ PHỔI', 'Vượt · giữ · giữ mở · lên 5/2, xuống 2/5', 2],
    ['CỨU MẠNG', 'NO tạm thời · HFOV không thường quy · APRV · ECMO', 3],
  ];
  return (
    <AbsoluteFill>
      <Header num="20" title="Ôn tập" t={t} />
      <RM cur="all" t={t} />
      {items.map(([h, d, j], i) => {
        const row = i < 4 ? 0 : 1;
        const x = row === 0 ? 80 + i * 445 : 80 + (i - 4) * 595;
        const w = row === 0 ? 425 : 570;
        return (
          <Glass key={i} x={x} y={150 + row * 270} w={w} h={250} a={ap(t, st(S, j) + (i % 2) * 1.2)} border={STN_COL[i]} pad={24}>
            <div style={{fontSize: 34, fontWeight: 800, color: STN_COL[i]}}>{i + 1}. {h}</div>
            <div style={{fontSize: 26, fontWeight: 500, lineHeight: 1.4, marginTop: 10}}>{d}</div>
          </Glass>
        );
      })}
      <Memo x={360} y={720} w={1200} h={160} t={t} s0={st(S, 3) + 2.5} size={60}>OXY = FiO₂ + MAP</Memo>
    </AbsoluteFill>
  );
};

export const SCENES = [S0, S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20];
void lerp; void fPC; void psBreath; void Badge; void Big; void Balloon; void Arrow; void fVC; void XMark; void geo; void Circuit;
