import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ap, sp, useT, lerp, C, FONT, STN_COL, Glass, Chip, Memo, Header, Roadmap, Defs, Badge, Label, geo, Circuit, XMark, pathD, Flow} from './lib';

// ================= Bài: Nguyên tắc điều chỉnh thông khí =================
type P = {S: number[]};
const ST = ['MỤC TIÊU', 'f', 'VT', 'VD', 'k', 'CÔNG THỨC', 'KIỀM'];
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

// ---------- bánh xe CO₂ ----------
const SAT = [
  {k: 'VT', ang: -90, c: STN_COL[2]},
  {k: 'VD', ang: 0, c: STN_COL[3]},
  {k: 'k', ang: 90, c: STN_COL[4]},
  {k: 'f', ang: 180, c: STN_COL[1]},
];
const Wheel: React.FC<{cx: number; cy: number; R: number; t: number; a: number; arrows?: string[]; as?: number[]}> = ({cx, cy, R, t, a, arrows, as}) => {
  const pulse = 1 + 0.03 * Math.sin(t * 2.4);
  return (
    <g opacity={a}>
      {SAT.map((s, i) => {
        const x = cx + Math.cos((s.ang * Math.PI) / 180) * R, y = cy + Math.sin((s.ang * Math.PI) / 180) * R;
        return <line key={'l' + i} x1={cx} y1={cy} x2={x} y2={y} stroke={s.c} strokeWidth={4} opacity={0.6} />;
      })}
      <circle cx={cx} cy={cy} r={R * 0.52 * pulse} fill="#2A1F55" stroke={C.violet} strokeWidth={5} filter="url(#glow)" />
      <text x={cx} y={cy + R * 0.12} textAnchor="middle" fill={C.txt} fontFamily={FONT} fontWeight={800} fontSize={R * 0.3}>PaCO₂</text>
      {SAT.map((s, i) => {
        const x = cx + Math.cos((s.ang * Math.PI) / 180) * R, y = cy + Math.sin((s.ang * Math.PI) / 180) * R;
        const aa = as ? as[i] : 1;
        return (
          <g key={i} opacity={aa}>
            <circle cx={x} cy={y} r={R * 0.3} fill="#0E1A2E" stroke={s.c} strokeWidth={5} />
            <text x={x} y={y + R * 0.11} textAnchor="middle" fill={s.c} fontFamily={FONT} fontWeight={800} fontSize={R * 0.3}>{s.k}</text>
            {arrows && <text x={x + R * 0.38} y={y - R * 0.18} fill={C.red} fontFamily={FONT} fontWeight={800} fontSize={R * 0.34}>{arrows[i]}</text>}
          </g>
        );
      })}
    </g>
  );
};
const Big2: React.FC<{c?: string; children: React.ReactNode; s?: number}> = ({c = C.txt, children, s = 44}) => <div style={{fontSize: s, fontWeight: 800, color: c, lineHeight: 1.25}}>{children}</div>;

// ===================== 0. Tiêu đề =====================
const S0: React.FC<P> = () => {
  const t = useT();
  const k = sp(t, 0.6, 12);
  return (
    <AbsoluteFill>
      <Svg>
        <Wheel cx={960} cy={300} R={150} t={t} a={ap(t, 0.1, 1)} />
      </Svg>
      <div style={{position: 'absolute', top: 540, width: '100%', textAlign: 'center', opacity: Math.min(1, k * 1.3), transform: `scale(${0.9 + 0.1 * k})`}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 104, letterSpacing: -2, lineHeight: 1.05, background: 'linear-gradient(180deg, #FFFFFF, #B9CBE6)', WebkitBackgroundClip: 'text', color: 'transparent'}}>
          ĐIỀU CHỈNH THÔNG KHÍ
        </div>
      </div>
      <div style={{position: 'absolute', top: 690, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 40, color: C.amber, opacity: ap(t, 1.2)}}>
        trên bệnh nhân thở máy · 4 bánh xe của CO₂
      </div>
      <div style={{position: 'absolute', top: 770, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 400, fontSize: 24, color: C.muted, opacity: ap(t, 1.8)}}>
        Nguồn: Tài liệu tập huấn thở máy – Bộ Y tế
      </div>
    </AbsoluteFill>
  );
};

// ===================== 1. Mục tiêu =====================
const S1: React.FC<P> = ({S}) => {
  const t = useT();
  const zones = [
    {y: 160, h: 200, c: C.red, j: 2, title: 'CHO PHÉP CAO (> 45)', l: 'COPD · hen phế quản · ARDS'},
    {y: 365, h: 190, c: C.oxy, j: 1, title: 'VÙNG XANH 35–45', l: 'Thần kinh cơ · ngộ độc · hậu phẫu'},
    {y: 560, h: 200, c: C.blue, j: 3, title: 'GIỮ THẤP (< 35 – 40)', l: 'Tăng áp nội sọ (“nhẹ và ngắn”) · cao áp phổi · thoát vị hoành'},
  ];
  return (
    <AbsoluteFill>
      <Header num="01" title="Trạm 1 · Mục tiêu" t={t} />
      <RM cur={0} t={t} />
      <Card x={80} y={160} w={700} h={200} a={ap(t, st(S, 0))} c={C.oxy} title="THÔNG KHÍ" size={34}><Big2 c={C.oxy}>PaCO₂</Big2></Card>
      <Card x={80} y={380} w={700} h={200} a={ap(t, st(S, 0) + 1.5) * 0.55} c={C.pink} title="OXY HOÁ" size={34}><Big2 c={C.pink}>PaO₂</Big2></Card>
      <div style={{position: 'absolute', left: 100, top: 610, width: 660, fontFamily: FONT, fontSize: 26, color: C.muted, opacity: ap(t, st(S, 0) + 3)}}>Bài này: điều chỉnh THÔNG KHÍ</div>
      <Svg>
        {zones.map((z, i) => (
          <g key={i} opacity={ap(t, st(S, z.j))}>
            <rect x={850} y={z.y} width={110} height={z.h - 6} rx={14} fill={z.c} opacity={0.85} />
          </g>
        ))}
        <g opacity={ap(t, st(S, 1))}>
          <Label x={835} y={372} c={C.txt} s={30} anchor="end">45</Label>
          <Label x={835} y={570} c={C.txt} s={30} anchor="end">35</Label>
        </g>
      </Svg>
      {zones.map((z, i) => (
        <Card key={i} x={1000} y={z.y} w={840} h={z.h - 10} a={ap(t, st(S, z.j) + 0.4)} c={z.c} title={z.title} size={28}>{z.l}</Card>
      ))}
      <Memo x={160} y={790} w={1600} h={110} t={t} s0={st(S, 4)} size={34}>35–45 là vùng XANH · COPD, hen, ARDS cho phép cao · não, cao áp phổi giữ thấp</Memo>
    </AbsoluteFill>
  );
};

// ===================== 2. Phương trình =====================
const S2: React.FC<P> = ({S}) => {
  const t = useT();
  const c = STN_COL;
  return (
    <AbsoluteFill>
      <Header num="02" title="Phương trình thông khí" t={t} />
      <RM cur={0} t={t} />
      <Glass x={80} y={150} w={1760} h={160} a={ap(t, st(S, 0))} border={C.violet}>
        <div style={{textAlign: 'center', fontSize: 64, fontWeight: 800, lineHeight: '100px'}}>
          PaCO₂ = <span style={{color: c[4]}}>k</span> / V<sub>A</sub> = <span style={{color: c[4]}}>k</span> / [ <span style={{color: c[1]}}>f</span> × ( <span style={{color: c[2]}}>VT</span> − <span style={{color: c[3]}}>VD</span> ) ]
        </div>
      </Glass>
      <Chip x={80} y={335} w={860} h={84} c={c[3]} a={ap(t, st(S, 1))} s={28}>VD ≈ 1 mL/lb · người lớn ≈ 150 mL</Chip>
      <Chip x={980} y={335} w={860} h={84} c={c[4]} a={ap(t, st(S, 1) + 3)} s={28}>k = hệ số hô hấp = 0,863</Chip>
      <Glass x={80} y={450} w={760} h={300} a={ap(t, st(S, 2))} border={C.red}>
        <div style={{fontSize: 30, fontWeight: 800, color: C.red}}>TOAN HÔ HẤP</div>
        <div style={{fontSize: 56, fontWeight: 800, marginTop: 20}}>PaCO₂ &gt; 45</div>
        <div style={{fontSize: 56, fontWeight: 800}}>pH &lt; 7,35</div>
      </Glass>
      <Glass x={880} y={450} w={960} h={300} a={ap(t, st(S, 3))} border={C.violet}>
        <div style={{fontSize: 28, fontWeight: 800, color: C.violet}}>4 nguyên nhân</div>
      </Glass>
      <Svg>
        <Wheel cx={1360} cy={615} R={105} t={t} a={ap(t, st(S, 3))} arrows={['↓', '↑', '↑', '↓']} as={[0, 1, 2, 3].map((i) => ap(t, st(S, 3) + 0.8 + i * 0.9))} />
      </Svg>
      <Memo x={260} y={780} w={1400} h={115} t={t} s0={st(S, 4)} size={42}>4 bánh xe của CO₂: f · VT · VD · k</Memo>
    </AbsoluteFill>
  );
};

// ===================== 3. Tần số =====================
const S3: React.FC<P> = ({S}) => {
  const t = useT();
  const Y = (v: number) => yv(330, 300, 0, 14, v);
  const dips = [{s: 1.2, d: 1.2}, {s: 3.2, d: 1.0}, {s: 5.6, d: 3.4}];
  const wave = (s: number) => {
    for (const d of dips) {
      if (s >= d.s && s < d.s + 0.5) return 6 - d.d * Math.sin((Math.PI * (s - d.s)) / 0.5);
      if (d.d > 2 && s >= d.s + 0.25 && s < d.s + 2.2) return pPC(s - d.s - 0.25, {T: 99, ti: 1, pi: 7, peep: 6});
    }
    return 6;
  };
  return (
    <AbsoluteFill>
      <Header num="03" title="Trạm 2 · Tần số" t={t} />
      <RM cur={1} t={t} />
      {[['A/C: f cài là TỐI THIỂU', C.blue], ['SIMV: thấp hơn A/C', C.violet], ['PS / CPAP: KHÔNG cài f', C.red]].map(([x, c], i) => (
        <Chip key={i} x={80 + i * 595} y={150} w={570} h={84} c={c} a={ap(t, st(S, 0) + 1.2 + i * 1.6)} s={28} bold>{x}</Chip>
      ))}
      <Card x={80} y={265} w={1000} h={440} a={ap(t, st(S, 1))} c={C.amber} title="Mode hỗ trợ: tần số phụ thuộc BN TRIGGER" />
      <Svg>
        <g opacity={ap(t, st(S, 1))}>
          <line x1={120} x2={1040} y1={Y(4)} y2={Y(4)} stroke={C.amber} strokeWidth={3} strokeDasharray="10 8" />
          <Label x={1040} y={Y(4) + 34} c={C.amber} s={22} anchor="end">ngưỡng trigger</Label>
          <Wave x={120} y={330} w={920} h={300} f={wave} lo={0} hi={14} span={8} color={C.insp} t={t} t0={st(S, 1)} base={0} fill />
          {dips.slice(0, 2).map((d, i) => (
            <g key={i} opacity={ap(t, st(S, 1) + d.s + 0.4)}>
              <XMark x={120 + ((d.s + 0.25) / 8) * 920} y={Y(2.4)} r={16} />
            </g>
          ))}
          <Label x={120 + (1.45 / 8) * 920} y={680} c={C.red} s={22} a={ap(t, st(S, 1) + 2)}>gắng sức yếu → không nhịp</Label>
        </g>
      </Svg>
      <Card x={1120} y={265} w={720} h={140} a={ap(t, st(S, 2))} c={C.red} title="Do BN" size={26}>Trigger quá yếu · cài độ nhạy quá khó</Card>
      <Card x={1120} y={420} w={720} h={160} a={ap(t, st(S, 3))} c={C.blue} title="Do máy" size={24}>Dây & bình làm ẩm quá lớn · loại trigger (lưu lượng / áp lực) · vị trí cảm biến</Card>
      <Card x={1120} y={595} w={720} h={110} a={ap(t, st(S, 4))} c={C.violet} size={28}><B c={C.violet}>Mất trigger do auto-PEEP</B></Card>
    </AbsoluteFill>
  );
};

// ===================== 4. VT: VTI vs VTE =====================
const S4: React.FC<P> = ({S}) => {
  const t = useT();
  const g = geo(260, 150, 1400, 330);
  const causes = ['Thể tích nén', 'Thất thoát', 'Báo động áp lực cao', 'Thay đổi R/C trong PC', 'Ti không đủ', 'Te không đủ (auto-PEEP)', 'VE đủ nhưng VA thiếu'];
  return (
    <AbsoluteFill>
      <Header num="04" title="Trạm 3 · Thể tích VT" t={t} />
      <RM cur={2} t={t} />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <Circuit g={g} t={t} tw={16} />
          <Label x={g.ci[0] - 120} y={g.ci[1] + 52} c={C.insp} s={30}>VTI · máy CUNG CẤP</Label>
          <Label x={g.ce[0] - 120} y={g.ce[1] - 30} c={C.exp} s={30}>VTE · BN THỰC NHẬN</Label>
        </g>
      </Svg>
      {causes.map((x, i) => {
        const row = i < 4 ? 0 : 1;
        const w = row === 0 ? 425 : 573;
        const xx = row === 0 ? 80 + i * 445 : 80 + (i - 4) * 593;
        const s0 = i < 4 ? st(S, 1) + 1.6 + i * 1.3 : st(S, 2) + (i - 4) * 1.5;
        return <Chip key={i} x={xx} y={520 + row * 115} w={w} h={90} c={STN_COL[(i % 6) + 1] ?? C.amber} a={ap(t, s0)} s={27} bold>{i + 1}. {x}</Chip>;
      })}
      <Memo x={360} y={775} w={1200} h={120} t={t} s0={st(S, 3)} size={44}>Máy ĐƯA (VTI) ≠ BN NHẬN (VTE)</Memo>
    </AbsoluteFill>
  );
};

// ===================== 5. Thể tích nén =====================
const S5: React.FC<P> = ({S}) => {
  const t = useT();
  const k = osc(t, 2.5);
  const pts: [number, number][] = [[140, 320], [880, 320]];
  return (
    <AbsoluteFill>
      <Header num="05" title="Trạm 3 · Thể tích nén" t={t} />
      <RM cur={2} t={t} />
      <Card x={80} y={150} w={860} h={300} a={ap(t, st(S, 0))} c={C.amber} title="Khí làm PHỒNG DÂY, không vào phổi" />
      <Card x={980} y={150} w={860} h={300} a={ap(t, st(S, 1))} c={C.blue} title="Tiết diện · chiều dài · bình làm ẩm" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <path d={pathD(pts)} stroke="#4B6488" strokeWidth={34 + 22 * k} strokeLinecap="round" opacity={0.9} />
          <path d={pathD(pts)} stroke="rgba(255,255,255,0.18)" strokeWidth={26 + 22 * k} strokeDasharray="3 10" />
          <Flow pts={pts} color={C.insp} t={t} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M${220 + i * 150},${320 - 20 - 11 * k} l0,${-18 * k} M${220 + i * 150},${320 + 20 + 11 * k} l0,${18 * k}`} stroke={C.amber} strokeWidth={4} strokeLinecap="round" opacity={k} />
          ))}
          <Label x={510} y={420} c={C.muted} s={24}>một phần khí bị nén lại trong dây</Label>
        </g>
        <g opacity={ap(t, st(S, 1))}>
          {[['Sơ sinh', 26], ['Trẻ em', 40], ['Người lớn', 56]].map(([n, r], i) => (
            <g key={i} opacity={ap(t, st(S, 1) + 1 + i * 0.8)}>
              <circle cx={1150 + i * 250} cy={320} r={r as number} fill="#152138" stroke={C.blue} strokeWidth={6} />
              <Label x={1150 + i * 250} y={420} s={26}>{n as string}</Label>
            </g>
          ))}
          <Label x={1275} y={330} c={C.muted} s={30}>&lt;</Label>
          <Label x={1525} y={330} c={C.muted} s={30}>&lt;</Label>
        </g>
      </Svg>
      <Glass x={80} y={475} w={860} h={265} a={ap(t, st(S, 2))} border={C.pink}>
        <div style={{fontSize: 28, fontWeight: 800, color: C.pink}}>Độ giãn nở của dây</div>
        {[['PVC', 1], ['Hytrel', 0.65], ['Silicone', 0.35]].map(([n, v], i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', marginTop: 14, opacity: ap(t, st(S, 2) + 1 + i * 0.9)}}>
            <div style={{width: 160, fontSize: 28, fontWeight: 700}}>{n}</div>
            <div style={{width: 560 * (v as number) * ap(t, st(S, 2) + 1.2 + i * 0.9, 1), height: 26, borderRadius: 13, background: C.pink}} />
          </div>
        ))}
      </Glass>
      <Glass x={980} y={475} w={860} h={265} a={ap(t, st(S, 3))} border={C.oxy}>
        <div style={{fontSize: 28, fontWeight: 800, color: C.oxy}}>Test máy đo compliance dây (minh hoạ)</div>
        <div style={{fontSize: 40, fontWeight: 800, marginTop: 16}}>1,65 mL/cmH₂O × 20 ≈ <span style={{color: C.amber}}>33 mL</span></div>
        <div style={{fontSize: 27, marginTop: 14}}>Đa số máy hiện đại tự <B c={C.oxy}>BÙ thể tích nén</B></div>
      </Glass>
      <Memo x={210} y={770} w={1500} h={125} t={t} s0={st(S, 4)} size={42}>Dây càng TO, DÀI, MỀM → nén càng NHIỀU</Memo>
    </AbsoluteFill>
  );
};

// ===================== 6. Thất thoát =====================
const S6: React.FC<P> = ({S}) => {
  const t = useT();
  const g = geo(120, 220, 820, 400);
  const leak = (s: number) => {
    const q = ph(s, 4);
    if (q < 1.3) return q / 1.3;
    return 0.28 + 0.72 * ex(-(q - 1.3) / 0.45);
  };
  const puffs = [0, 1, 2, 3, 4, 5].map((i) => {
    const p = ph(t * 0.8 + i / 6, 1);
    return {x: g.Y[0] + 20 + p * 90 * Math.cos(i), y: g.Y[1] - 20 - p * 90 * Math.abs(Math.sin(i + 1)), o: 1 - p};
  });
  return (
    <AbsoluteFill>
      <Header num="06" title="Trạm 3 · Thất thoát" t={t} />
      <RM cur={2} t={t} />
      <Card x={80} y={150} w={900} h={570} a={ap(t, st(S, 0))} c={C.red} title="Rò bộ dây · rò quanh NKQ" size={25}>
        <div style={{color: C.muted}}>NKQ sai cỡ · không bóng chèn · chưa bơm bóng chèn</div>
      </Card>
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <Circuit g={g} t={t} tw={14} screen={false} />
          {puffs.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={7} fill={C.red} opacity={p.o} filter="url(#glow)" />)}
          <Label x={g.Y[0] + 40} y={g.Y[1] + 80} c={C.red} s={26}>RÒ</Label>
        </g>
      </Svg>
      <Card x={1020} y={150} w={820} h={110} a={ap(t, st(S, 1))} c={C.amber} size={28}><B>①</B> Ống nghe ở hõm trên xương ức</Card>
      <Glass x={1020} y={275} w={820} h={185} a={ap(t, st(S, 2))} border={C.blue}>
        <div style={{fontSize: 26, fontWeight: 800, color: C.blue}}>② So sánh VTI và VTE</div>
        <div style={{display: 'flex', gap: 40, marginTop: 10, fontSize: 52, fontWeight: 800}}>
          <span style={{color: C.insp}}>VTI 504</span><span style={{color: C.red}}>VTE 383</span>
        </div>
      </Glass>
      <Card x={1020} y={475} w={820} h={245} a={ap(t, st(S, 3))} c={C.violet} title="③ Đồ thị thể tích không về 0" size={24} />
      <Svg>
        <g opacity={ap(t, st(S, 3))}>
          <line x1={1060} x2={1800} y1={700} y2={700} stroke="rgba(148,170,205,0.4)" strokeWidth={2} />
          <Wave x={1060} y={545} w={740} h={155} f={leak} lo={0} hi={1} span={8} color={C.violet} t={t} t0={st(S, 3)} sw={3} fill />
        </g>
      </Svg>
      <Memo x={360} y={755} w={1200} h={130} t={t} s0={st(S, 4)} size={44}>VTE &lt; VTI → nghĩ ngay đến RÒ</Memo>
    </AbsoluteFill>
  );
};

// ===================== 7. Báo động áp lực cao =====================
const S7: React.FC<P> = ({S}) => {
  const t = useT();
  const lim = t > st(S, 3) + 1 ? 60 : 50;
  const cut = lim === 50 ? 0.3 : 1;
  const peak = lim === 50 ? 51 : 48;
  const pr = (s: number) => {
    const q = ph(s, 3);
    if (q < cut) return 10 + Math.min(1, q / 0.05) * 3 + (peak - 13) * (q / cut);
    return 10 + (peak - 10) * ex(-(q - cut) / 0.15);
  };
  const vol = (s: number) => {
    const q = ph(s, 3);
    const top = lim === 50 ? 130 : 408;
    if (q < cut) return (q / cut) * top;
    return top * ex(-(q - cut) / 0.35);
  };
  const Yp = (v: number) => yv(220, 200, 0, 66, v);
  const Yv = (v: number) => yv(480, 200, 0, 450, v);
  return (
    <AbsoluteFill>
      <Header num="07" title="Trạm 3 · Báo động áp lực" t={t} />
      <RM cur={2} t={t} />
      <Card x={80} y={150} w={1100} h={570} a={ap(t, st(S, 0))} c={C.red} title="Ppeak chạm giới hạn → NGƯNG hít vào" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <line x1={120} x2={1140} y1={Yp(lim)} y2={Yp(lim)} stroke={C.red} strokeWidth={3} strokeDasharray="10 8" />
          <Label x={1140} y={Yp(lim) - 10} c={C.red} s={24} anchor="end">giới hạn {lim}</Label>
          <Wave x={120} y={220} w={1020} h={200} f={pr} lo={0} hi={66} span={9} color={C.amber} t={t} t0={st(S, 0)} base={0} fill />
          <line x1={120} x2={1140} y1={Yv(400)} y2={Yv(400)} stroke={C.oxy} strokeWidth={3} strokeDasharray="10 8" />
          <Label x={1140} y={Yv(400) - 10} c={C.oxy} s={24} anchor="end">VT cài 400</Label>
          <Wave x={120} y={480} w={1020} h={200} f={vol} lo={0} hi={450} span={9} color={C.oxy} t={t} t0={st(S, 0)} base={0} fill />
          <Label x={130} y={470} c={C.amber} s={22} anchor="start">Áp lực</Label>
          <Label x={130} y={710} c={C.oxy} s={22} anchor="start">Thể tích</Label>
        </g>
      </Svg>
      <Card x={1220} y={150} w={620} h={170} a={ap(t, st(S, 1))} c={C.oxy} size={30}>Cài VTI <B c={C.oxy}>400</B> → VTE chỉ <B c={C.red}>130</B> mL</Card>
      <Card x={1220} y={340} w={620} h={150} a={ap(t, st(S, 2))} c={C.red} size={30}>Ppeak <B c={C.red}>51</B> ≥ giới hạn <B>50</B></Card>
      <Card x={1220} y={510} w={620} h={210} a={ap(t, st(S, 3))} c={C.blue} size={28}>
        <div>Nâng giới hạn <B c={C.blue}>60</B> → VTE <B c={C.oxy}>408</B> mL</div>
        <div style={{color: C.amber, fontWeight: 700, marginTop: 6}}>+ tìm nguyên nhân Ppeak cao</div>
      </Card>
      <Memo x={210} y={755} w={1500} h={130} t={t} s0={st(S, 4)} size={40}>Báo động áp lực cao CẮT NGẮN nhịp → VT tụt</Memo>
    </AbsoluteFill>
  );
};

// ===================== 8. R/C trong PC =====================
const S8: React.FC<P> = ({S}) => {
  const t = useT();
  const vtA = [1, 0.8, 0.62, 0.48];
  const pcV = (s: number) => {
    const q = ph(s, 3), A = vtA[Math.floor(s / 3) % 4];
    return q < 1 ? A * (1 - ex(-q / 0.3)) : A * (1 - ex(-1 / 0.3)) * ex(-(q - 1) / 0.25);
  };
  const cards = [
    {h: 'R↑ bệnh lý', c: C.red, l: 'COPD · hen · viêm tiểu phế quản · hít phân su'},
    {h: 'R↑ cơ học', c: C.amber, l: 'Nghẹt đàm · nước đọng trong dây · cắn ống · gập NKQ'},
    {h: 'C↓ thành ngực', c: C.blue, l: 'Tràn dịch, tràn khí MP · phù nề · gù vẹo · chướng bụng · lọc màng bụng · béo phì'},
    {h: 'C↓ phổi', c: C.violet, l: 'Viêm phổi · phù phổi cấp · ARDS · ngạt nước · màng trong · xẹp phổi · xơ hoá'},
  ];
  return (
    <AbsoluteFill>
      <Header num="08" title="Trạm 3 · R và C trong PC" t={t} />
      <RM cur={2} t={t} />
      <Card x={80} y={150} w={860} h={560} a={ap(t, st(S, 0))} c={C.insp} title="PC: áp lực giữ nguyên, VT giảm dần" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <Label x={120} y={250} c={C.amber} s={22} anchor="start">Áp lực</Label>
          <Wave x={120} y={260} w={780} h={160} f={(s) => pPC(s, {T: 3, ti: 1, pi: 15})} lo={0} hi={22} span={12} color={C.amber} t={t} t0={st(S, 0)} speed={1.5} base={0} fill />
          <Label x={120} y={470} c={C.oxy} s={22} anchor="start">Thể tích</Label>
          <Wave x={120} y={480} w={780} h={190} f={pcV} lo={0} hi={1.05} span={12} color={C.oxy} t={t} t0={st(S, 0)} speed={1.5} base={0} fill />
        </g>
      </Svg>
      {cards.map((x, i) => (
        <Card key={i} x={980} y={150 + i * 140} w={860} h={128} a={ap(t, st(S, i + 1))} c={x.c} title={x.h} size={24} pad={20}>{x.l}</Card>
      ))}
      <Chip x={80} y={740} w={1760} h={100} c={C.red} a={ap(t, st(S, 0) + 3)} s={40} bold>R↑ hoặc C↓ → VT↓ → ứ CO₂</Chip>
    </AbsoluteFill>
  );
};

// ===================== 9. Ti / Te =====================
const S9: React.FC<P> = ({S}) => {
  const t = useT();
  const ti = lerp(0.45, 1.1, ap(t, st(S, 1) + 0.8, 2.5));
  const tau = 0.28;
  const T = 3;
  const fl = (s: number) => {
    const q = ph(s, T);
    if (q < ti) return ex(-q / tau);
    return -ex(-ti / tau) * 0 - (1 - ex(-ti / tau)) * ex(-(q - ti) / 0.25);
  };
  const vo = (s: number) => {
    const q = ph(s, T);
    const top = 1 - ex(-ti / tau);
    if (q < ti) return 1 - ex(-q / tau);
    return top * ex(-(q - ti) / 0.3);
  };
  const vt = Math.round(300 * (1 - ex(-ti / tau)) / (1 - ex(-0.45 / tau)));
  const X = (s: number) => 120 + (s / 6) * 1020;
  const Yf = (v: number) => yv(420, 200, -1, 1.05, v);
  const trap = (s: number) => {
    const q = ph(s, 2);
    if (q < 0.6) return 0.8;
    return -0.85 * ex(-(q - 0.6) / 0.6);
  };
  return (
    <AbsoluteFill>
      <Header num="09" title="Trạm 3 · Ti và Te" t={t} />
      <RM cur={2} t={t} />
      <Card x={80} y={150} w={1100} h={500} a={ap(t, st(S, 0))} c={C.insp} title={<>Ti = <span style={{color: C.amber}}>{ti.toFixed(2).replace('.', ',')} s</span> · VT ≈ <span style={{color: C.oxy}}>{vt} mL</span> (minh hoạ)</>} />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <Label x={120} y={225} c={C.oxy} s={22} anchor="start">Thể tích</Label>
          <Wave x={120} y={230} w={1020} h={160} f={vo} lo={0} hi={1.05} span={6} color={C.oxy} t={t} t0={st(S, 0)} base={0} fill />
          <Label x={120} y={445} c={C.insp} s={22} anchor="start">Lưu lượng</Label>
          <Wave x={120} y={420} w={1020} h={200} f={fl} lo={-1} hi={1.05} span={6} color={C.insp} t={t} t0={st(S, 0)} base={0} fill />
          {[0, 1].map((k) => (
            <circle key={k} cx={X(k * 3 + ti)} cy={Yf(ex(-ti / tau))} r={16} fill="none" stroke={ti < 0.8 ? C.red : C.oxy} strokeWidth={4} filter="url(#glow)" />
          ))}
        </g>
      </Svg>
      <Card x={1220} y={150} w={620} h={280} a={ap(t, st(S, 2))} c={C.red} title="Te không đủ → bẫy khí" size={24}>VTE &lt; VTI · auto-PEEP</Card>
      <Svg>
        <g opacity={ap(t, st(S, 2))}>
          <Wave x={1250} y={270} w={560} h={140} f={trap} lo={-1} hi={1} span={6} color={C.red} t={t} t0={st(S, 2)} sw={3} base={0} />
        </g>
      </Svg>
      {['↑ Te', '↓ tần số', '↓ VT'].map((x, i) => (
        <Chip key={i} x={1220 + i * 212} y={450} w={196} h={80} c={C.oxy} a={ap(t, st(S, 3) + i * 0.9)} s={30} bold>{x}</Chip>
      ))}
      <Card x={1220} y={550} w={620} h={100} a={ap(t, st(S, 1))} c={C.oxy} size={25}>Tăng Ti → VT tăng, KHÔNG tăng Pi</Card>
      <Memo x={160} y={690} w={1600} h={150} t={t} s0={st(S, 4)} size={38}>Flow chưa về 0 cuối HÍT VÀO → kéo dài Ti · cuối THỞ RA → kéo dài Te</Memo>
    </AbsoluteFill>
  );
};

// ===================== 10. VE đủ, VA thấp =====================
const S10: React.FC<P> = ({S}) => {
  const t = useT();
  const rows = [[20, 200, '2,8'], [30, 133, '2,1'], [40, 100, '1,6']] as const;
  const PX = 3.2;
  return (
    <AbsoluteFill>
      <Header num="10" title="Trạm 3 · VE đủ, VA thấp" t={t} />
      <RM cur={2} t={t} />
      <Chip x={80} y={150} w={1760} h={84} c={C.amber} a={ap(t, st(S, 0))} s={30} bold>VD = 60 mL · cả 3 cách đều cho VE = 4 L/phút</Chip>
      {rows.map(([f, vt, va], i) => {
        const a = ap(t, st(S, i + 1));
        const k = ap(t, st(S, i + 1) + 0.5, 1.2);
        return (
          <Glass key={i} x={80} y={265 + i * 160} w={1760} h={140} a={a} border={[C.oxy, C.amber, C.red][i]} pad={22}>
            <div style={{display: 'flex', alignItems: 'center', height: '100%'}}>
              <div style={{width: 360, fontSize: 34, fontWeight: 800}}>f {f} × VT {vt}</div>
              <div style={{display: 'flex', height: 46, borderRadius: 12, overflow: 'hidden', width: vt * PX * k}}>
                <div style={{width: 60 * PX, background: '#5B6B86', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: C.txt, whiteSpace: 'nowrap'}}>VD 60</div>
                <div style={{flex: 1, background: C.oxy, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: C.bg0, whiteSpace: 'nowrap'}}>{vt - 60}</div>
              </div>
              <div style={{position: 'absolute', right: 40, fontSize: 46, fontWeight: 800, color: [C.oxy, C.amber, C.red][i]}}>VA {va} L/ph</div>
            </div>
          </Glass>
        );
      })}
      <Memo x={210} y={765} w={1500} h={125} t={t} s0={st(S, 4)} size={42}>Cùng VE: tần số càng NHANH → VA càng THẤP</Memo>
    </AbsoluteFill>
  );
};

// ===================== 11. Khoảng chết =====================
const S11: React.FC<P> = ({S}) => {
  const t = useT();
  const k = osc(t, 3);
  return (
    <AbsoluteFill>
      <Header num="11" title="Trạm 4 · Khoảng chết" t={t} />
      <RM cur={3} t={t} />
      <Card x={80} y={150} w={860} h={470} a={ap(t, st(S, 0))} c={STN_COL[3]} title="Giải phẫu + sinh lý" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <path d="M510,230 L510,360 M510,360 L360,470 M510,360 L660,470" stroke="#F4A27A" strokeWidth={44} strokeLinecap="round" fill="none" />
          <Label x={600} y={300} c="#F4A27A" s={24} anchor="start">VD giải phẫu</Label>
          <circle cx={340} cy={500} r={62 + 6 * k} fill="#7DB8F0" stroke="#fff" strokeWidth={2} />
          <circle cx={680} cy={500} r={62 + 6 * k} fill="#7DB8F0" stroke="#fff" strokeWidth={2} />
          <path d="M260,470 A85,85 0 0,0 420,560" stroke={C.red} strokeWidth={12} fill="none" strokeLinecap="round" />
          <path d="M760,470 A85,85 0 0,1 600,560" stroke="#5B6B86" strokeWidth={12} fill="none" strokeLinecap="round" />
          <text x={340} y={510} textAnchor="middle" fill="#0B1322" fontFamily={FONT} fontWeight={800} fontSize={30}>VA</text>
          <text x={680} y={510} textAnchor="middle" fill="#0B1322" fontFamily={FONT} fontWeight={800} fontSize={30}>VD</text>
          <Label x={340} y={600} c={C.red} s={22}>có tưới máu</Label>
          <Label x={680} y={600} c={C.muted} s={22}>không tưới máu = VD sinh lý</Label>
        </g>
      </Svg>
      <Card x={980} y={150} w={860} h={200} a={ap(t, st(S, 1))} c={C.red} title="VD tăng do" size={26}>
        <div>Giãn phế quản · thuyên tắc phổi</div>
        <div>PEEP cao · auto-PEEP</div>
      </Card>
      <Card x={980} y={370} w={860} h={250} a={ap(t, st(S, 2))} c={C.violet} title="Khoảng chết CƠ HỌC" />
      <Svg>
        <g opacity={ap(t, st(S, 2))}>
          <path d="M1020,500 l60,0 l30,-30 l60,0 l0,-30 l-80,0 l-30,30 l-40,0 z M1020,500 l60,0 l30,30 l60,0 l0,30 l-80,0 l-30,-30 l-40,0 z" fill="#FACC15" />
          <rect x={1190} y={460} width={150} height={80} rx={10} fill="#6D28D9" stroke={C.violet} strokeWidth={3} />
          <text x={1265} y={512} textAnchor="middle" fill="#fff" fontFamily={FONT} fontWeight={800} fontSize={30}>VD</text>
          <path d="M1340,500 L1500,500 Q1580,500 1600,580" stroke="#C9D6EA" strokeWidth={14} fill="none" strokeLinecap="round" />
          <Label x={1100} y={590} c="#FACC15" s={22}>chữ Y</Label>
          <Label x={1640} y={600} c={C.muted} s={22}>NKQ</Label>
        </g>
      </Svg>
      {['HME', 'Phin lọc', 'Đo CO₂ dòng chính', 'Ống nhún', 'Hút đàm kín'].map((x, i) => (
        <Chip key={i} x={[80, 300, 560, 1000, 1310][i]} y={650} w={[200, 240, 420, 290, 330][i]} h={80} c={C.violet} a={ap(t, st(S, 2) + 2 + i * 0.7)} s={27} bold>{x}</Chip>
      ))}
      <Memo x={160} y={765} w={1600} h={125} t={t} s0={st(S, 3)} size={38}>Trẻ nhỏ VT nhỏ → THÁO BỎ khoảng chết cơ học không cần thiết</Memo>
    </AbsoluteFill>
  );
};

// ===================== 12. Hệ số hô hấp =====================
const S12: React.FC<P> = ({S}) => {
  const t = useT();
  const panel = (x0: number, k: number, a: number, c: string) => {
    const g = ap(t, 0, 0) * 0 + a;
    return (
      <g opacity={g}>
        {[['O₂ vào', 1, C.blue], ['CO₂ ra', k, c]].map(([n, v, cc], i) => (
          <g key={i}>
            <rect x={x0 + 120 + i * 300} y={560 - 280 * (v as number) * a} width={150} height={280 * (v as number) * a} rx={12} fill={cc as string} />
            <Label x={x0 + 195 + i * 300} y={545 - 280 * (v as number) * a} s={34}>{i ? String(k).replace('.', ',') : '1'}</Label>
            <Label x={x0 + 195 + i * 300} y={600} c={C.muted} s={24}>{n as string}</Label>
          </g>
        ))}
      </g>
    );
  };
  return (
    <AbsoluteFill>
      <Header num="12" title="Trạm 5 · Hệ số hô hấp k" t={t} />
      <RM cur={4} t={t} />
      <Card x={80} y={150} w={860} h={480} a={ap(t, st(S, 0))} c={C.oxy} title="Nuôi ăn cân đối (đạm · đường · béo)"><Big2 c={C.oxy}>k = 0,863</Big2></Card>
      <Card x={980} y={150} w={860} h={480} a={ap(t, st(S, 1))} c={C.red} title="Chỉ glucose 5%, 10%"><Big2 c={C.red}>k = 1</Big2></Card>
      <Svg>
        {panel(80, 0.863, ap(t, st(S, 0) + 1), C.oxy)}
        {panel(980, 1, ap(t, st(S, 1) + 1), C.red)}
      </Svg>
      <Chip x={80} y={655} w={1760} h={90} c={C.red} a={ap(t, st(S, 2))} s={34} bold>Cùng lượng O₂ → CO₂ sinh ra nhiều hơn ≈ 16%</Chip>
      <Memo x={360} y={770} w={1200} h={120} t={t} s0={st(S, 3)} size={42}>Chỉ truyền ĐƯỜNG → k = 1 → CO₂ ↑</Memo>
    </AbsoluteFill>
  );
};

// ===================== 13. Công thức =====================
const S13: React.FC<P> = ({S}) => {
  const t = useT();
  const W = 1560, X = (v: number) => ((v - 4) / 6) * W;
  const mk = 4 + 6 * osc(t - st(S, 2), 6) * 0.95;
  return (
    <AbsoluteFill>
      <Header num="13" title="Trạm 6 · Công thức" t={t} />
      <RM cur={5} t={t} />
      <Card x={80} y={150} w={860} h={270} a={ap(t, st(S, 0))} c={STN_COL[1]} title="Giữ VT → chỉnh TẦN SỐ">
        <Big2 s={46}>CO₂<sub>cũ</sub> × f<sub>cũ</sub> = CO₂<sub>mới</sub> × f<sub>mới</sub></Big2>
      </Card>
      <Card x={980} y={150} w={860} h={270} a={ap(t, st(S, 1))} c={STN_COL[2]} title="Giữ f → chỉnh VT">
        <Big2 s={46}>CO₂<sub>cũ</sub> × VT<sub>cũ</sub> ≈ CO₂<sub>mới</sub> × VT<sub>mới</sub></Big2>
      </Card>
      <Glass x={80} y={450} w={1760} h={290} a={ap(t, st(S, 2))} border={C.amber}>
        <div style={{fontSize: 28, fontWeight: 800, color: C.amber}}>Chọn nút nào? Nhìn VT hiện tại (mL/kg)</div>
        <div style={{position: 'relative', height: 200, marginTop: 10}}>
          <div style={{position: 'absolute', left: 0, top: 70, width: X(8), height: 34, borderRadius: '17px 0 0 17px', background: `${STN_COL[2]}66`}} />
          <div style={{position: 'absolute', left: X(8), top: 70, width: W - X(8), height: 34, borderRadius: '0 17px 17px 0', background: `${STN_COL[1]}66`}} />
          <div style={{position: 'absolute', left: X(8) - 3, top: 50, width: 6, height: 74, background: C.amber}} />
          <div style={{position: 'absolute', left: X(8) - 40, top: 6, width: 80, textAlign: 'center', fontSize: 32, fontWeight: 800, color: C.amber}}>8</div>
          <div style={{position: 'absolute', left: X(mk) - 10, top: 62, width: 20, height: 50, borderRadius: 10, background: '#fff', boxShadow: '0 0 16px #fff'}} />
          <div style={{position: 'absolute', left: 20, top: 128, fontSize: 30, fontWeight: 800, color: mk < 8 ? STN_COL[2] : C.muted}}>&lt; 8 + phổi bình thường → tăng VT</div>
          <div style={{position: 'absolute', right: 20, top: 128, fontSize: 30, fontWeight: 800, color: mk >= 8 ? STN_COL[1] : C.muted}}>≈ 8 → tăng TẦN SỐ</div>
        </div>
      </Glass>
      <Memo x={260} y={770} w={1400} h={120} t={t} s0={st(S, 3)} size={42}>VT còn THẤP → tăng VT · VT đã 8 → tăng TẦN SỐ</Memo>
    </AbsoluteFill>
  );
};

// ===================== 14. Ca 1 & 2 =====================
const S14: React.FC<P> = ({S}) => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Header num="14" title="Trạm 6 · Ca 1 và ca 2" t={t} />
      <RM cur={5} t={t} />
      <Card x={80} y={150} w={860} h={330} a={ap(t, st(S, 0))} c={STN_COL[2]} title="CA 1 · VC · phổi bình thường" size={30}>
        <div>Nam, IBW 81 kg</div>
        <div>VTE 400 mL (<B c={C.red}>5 mL/kg</B>) · f 16</div>
        <div>PaCO₂ <B c={C.red}>55</B> → muốn <B c={C.oxy}>40</B></div>
      </Card>
      <Card x={80} y={505} w={860} h={240} a={ap(t, st(S, 1))} c={STN_COL[2]} title="VT còn thấp → chỉnh VT" size={30}>
        <Big2 s={48}>55 × 400 / 40 = <span style={{color: C.oxy}}>550 mL</span></Big2>
        <div style={{color: C.muted}}>≈ 7 mL/kg</div>
      </Card>
      <Card x={980} y={150} w={860} h={330} a={ap(t, st(S, 2))} c={STN_COL[1]} title="CA 2 · VC · không tự thở" size={30}>
        <div>Nữ, IBW 52 kg</div>
        <div>VT 425 mL (<B c={C.amber}>≈ 8 mL/kg</B>) · f 15</div>
        <div>PaCO₂ <B c={C.red}>58</B> → muốn <B c={C.oxy}>40</B></div>
      </Card>
      <Card x={980} y={505} w={860} h={240} a={ap(t, st(S, 3))} c={STN_COL[1]} title="VT đã đủ → chỉnh TẦN SỐ" size={30}>
        <Big2 s={48}>15 × 58 / 40 ≈ <span style={{color: C.oxy}}>22 /phút</span></Big2>
        <div style={{color: C.red, fontWeight: 700}}>coi chừng bẫy khí</div>
      </Card>
    </AbsoluteFill>
  );
};

// ===================== 15. Ca 3 & 4 =====================
const S15: React.FC<P> = ({S}) => {
  const t = useT();
  const curve = (ti: number) => (s: number) => {
    const q = ph(s, 3);
    if (q < ti) return ex(-q / 0.35);
    return -(1 - ex(-ti / 0.35)) * ex(-(q - ti) / 0.3);
  };
  return (
    <AbsoluteFill>
      <Header num="15" title="Trạm 6 · Ca 3 và ca 4" t={t} />
      <RM cur={5} t={t} />
      <Card x={80} y={150} w={860} h={270} a={ap(t, st(S, 0))} c={C.insp} title="CA 3 · PC · không tự thở" size={29}>
        <div>Pi 10 → VTE 400 mL (5,3 mL/kg) · f 16</div>
        <div>PaCO₂ <B c={C.red}>59</B> → muốn <B c={C.oxy}>40</B></div>
      </Card>
      <Card x={80} y={440} w={860} h={145} a={ap(t, st(S, 1))} c={C.insp} size={30}>
        <div>VT mới = 59 × 400 / 40 ≈ <B c={C.oxy}>600 mL</B></div>
      </Card>
      <Card x={80} y={605} w={860} h={180} a={ap(t, st(S, 2))} c={C.amber} title="C không đổi → áp lực tỉ lệ VT" size={30}>
        <div>Pi = 10 × 600 / 400 = <B c={C.amber}>15 cmH₂O</B></div>
      </Card>
      <Card x={980} y={150} w={860} h={270} a={ap(t, st(S, 3))} c={C.violet} title="CA 4 · PC · Ti 0,7 s" size={27}>
        <div>f 10 · P 25 · VT 425 mL</div>
        <div>PaCO₂ 50 · pH 7,30</div>
      </Card>
      <Card x={980} y={440} w={860} h={345} a={ap(t, st(S, 3) + 2)} c={C.violet} title="Lưu lượng: Ti ngắn → Ti đủ" />
      <Svg>
        <g opacity={ap(t, st(S, 3) + 2)}>
          <Wave x={1020} y={520} w={380} h={220} f={curve(0.45)} lo={-1} hi={1.05} span={3} color={C.red} t={t} t0={st(S, 3) + 2} sw={3} base={0} />
          <Label x={1210} y={770} c={C.red} s={22}>chưa về 0</Label>
        </g>
        <g opacity={ap(t, st(S, 4))}>
          <Wave x={1430} y={520} w={380} h={220} f={curve(1.4)} lo={-1} hi={1.05} span={3} color={C.oxy} t={t} t0={st(S, 4)} sw={3} base={0} />
          <Label x={1620} y={770} c={C.oxy} s={22}>↑ Ti → về 0</Label>
        </g>
      </Svg>
      <Chip x={80} y={810} w={1760} h={80} c={C.oxy} a={ap(t, st(S, 4) + 1.5)} s={30} bold>Kéo dài Ti cho flow về 0 → VT tăng, không cần tăng áp lực</Chip>
    </AbsoluteFill>
  );
};

// ===================== 16. Kiềm hô hấp =====================
const S16: React.FC<P> = ({S}) => {
  const t = useT();
  const causes = ['R/C cải thiện ở PC', 'BN tự thở tốt', 'Stress', 'Bệnh lý não', 'Auto-trigger'];
  return (
    <AbsoluteFill>
      <Header num="16" title="Trạm 7 · Kiềm hô hấp" t={t} />
      <RM cur={6} t={t} />
      <Chip x={80} y={150} w={1760} h={80} c={C.blue} a={ap(t, st(S, 0))} s={34} bold>PaCO₂ &lt; 35 mmHg · pH &gt; 7,45</Chip>
      {causes.map((x, i) => (
        <Chip key={i} x={80 + i * 356} y={255} w={336} h={76} c={C.amber} a={ap(t, st(S, 1) + 1 + i * 1.3)} s={26}>{x}</Chip>
      ))}
      <Glass x={80} y={360} w={330} h={250} a={ap(t, st(S, 2))} border={C.violet}>
        <div style={{fontSize: 50, fontWeight: 800, textAlign: 'center', marginTop: 40}}>f ↑</div>
        <div style={{fontSize: 50, fontWeight: 800, textAlign: 'center'}}>VE ↑</div>
      </Glass>
      <Card x={440} y={360} w={700} h={118} a={ap(t, st(S, 2))} c={C.oxy} title="TỰ THỞ TỐT" size={25} pad={18}>Tỉnh · hồng hào · sinh hiệu ổn · không co lõm</Card>
      <Card x={440} y={492} w={700} h={118} a={ap(t, st(S, 3))} c={C.red} title="STRESS / BỆNH LÝ NÃO" size={25} pad={18}>Bứt rứt · tím tái · RL sinh hiệu · co lõm ngực</Card>
      <Card x={1170} y={360} w={670} h={250} a={ap(t, st(S, 4))} c={C.amber} title="Xử trí theo nguyên nhân" size={23} pad={20}>
        <div>Đau, sợ, sốt → an thần, giảm đau</div>
        <div>Toan chuyển hoá → bicarbonate</div>
        <div>Não → chống co giật, phù não</div>
        <div>Nghẹt đàm → hút đàm, thay NKQ</div>
      </Card>
      <Memo x={160} y={650} w={1600} h={130} t={t} s0={st(S, 5)} size={38}>Thở nhiều mà HỒNG → tốt · thở nhiều mà TÍM, BỨT RỨT → stress</Memo>
    </AbsoluteFill>
  );
};

// ===================== 17. Auto-trigger =====================
const S17: React.FC<P> = ({S}) => {
  const t = useT();
  const peep = 10, trg = 8;
  const starts = [0.6, 4.5, 7.6];
  const wave = (s: number) => {
    if (s < 0.6) return s > 0.35 ? peep - (peep - trg + 0.3) * ((s - 0.35) / 0.25) : peep;
    for (let i = 0; i < starts.length; i++) {
      const s0 = starts[i], nx = starts[i + 1] ?? 99;
      if (s >= s0 && s < nx) {
        const q = s - s0;
        if (q < 1) return trg + (25 - trg) * (1 - ex(-q / 0.06));
        if (q < 1.3) return peep + 15 * ex(-(q - 1) / 0.08);
        const L = nx - s0 - 1.3;
        return peep - (peep - trg) * Math.min(1, (q - 1.3) / L);
      }
    }
    return peep;
  };
  const Y = (v: number) => yv(240, 300, 0, 28, v);
  const X = (s: number) => 120 + (s / 10) * 1020;
  return (
    <AbsoluteFill>
      <Header num="17" title="Trạm 7 · Auto-trigger" t={t} />
      <RM cur={6} t={t} />
      <Card x={80} y={150} w={1100} h={430} a={ap(t, st(S, 0))} c={C.red} title="Máy tự kích hoạt dù BN không hít vào" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <line x1={120} x2={1140} y1={Y(peep)} y2={Y(peep)} stroke={C.violet} strokeWidth={2} strokeDasharray="8 8" />
          <line x1={120} x2={1140} y1={Y(trg)} y2={Y(trg)} stroke={C.red} strokeWidth={3} strokeDasharray="10 8" />
          <Label x={1140} y={Y(peep) - 10} c={C.violet} s={22} anchor="end">PEEP</Label>
          <Label x={1140} y={Y(trg) + 30} c={C.red} s={22} anchor="end">ngưỡng trigger</Label>
          <Wave x={120} y={240} w={1020} h={300} f={wave} lo={0} hi={28} span={10} color={C.amber} t={t} t0={st(S, 0)} base={0} fill />
        </g>
        <g opacity={ap(t, st(S, 2))}>
          <Label x={X(0.5)} y={Y(trg) + 64} c={C.oxy} s={22}>BN kích hoạt</Label>
          {[4.5, 7.6].map((s, i) => (
            <g key={i}>
              <circle cx={X(s)} cy={Y(trg)} r={18} fill="none" stroke={C.red} strokeWidth={4} filter="url(#glow)" />
              <Label x={X(s)} y={Y(trg) + 64} c={C.red} s={22}>trigger GIẢ</Label>
            </g>
          ))}
        </g>
      </Svg>
      <Card x={1220} y={150} w={620} h={430} a={ap(t, st(S, 1))} c={C.amber} title="Nguyên nhân" size={25}>
        {['Rò bộ dây', 'Rò quanh NKQ', 'Ống dẫn lưu ngực', 'Nước đọng trong dây', 'Dao động tim', 'PEEP cao', 'Trigger quá nhạy'].map((x, i) => (
          <div key={i} style={{opacity: ap(t, st(S, 1) + 1 + i * 0.8), lineHeight: 1.45}}>• {x}</div>
        ))}
      </Card>
      {['Giảm rò: NKQ lớn hơn 0,5–1 số · bơm bóng chèn', 'Đổ nước đọng', 'Tăng ngưỡng: −2 → −3, −4 · 1 → 1,5–2 L/ph'].map((x, i) => (
        <Chip key={i} x={[80, 790, 1130][i]} y={605} w={[680, 310, 710][i]} h={100} c={C.oxy} a={ap(t, st(S, 3) + i * 2.5)} s={25}>{x}</Chip>
      ))}
      <Memo x={210} y={740} w={1500} h={140} t={t} s0={st(S, 4)} size={42}>Đường nền TỤT DẦN chạm ngưỡng → trigger GIẢ</Memo>
    </AbsoluteFill>
  );
};

// ===================== 18. Ôn tập =====================
const S18: React.FC<P> = ({S}) => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Header num="18" title="Ôn tập" t={t} />
      <RM cur="all" t={t} />
      <Glass x={80} y={150} w={760} h={590} a={ap(t, st(S, 0))} border={C.violet}>
        <div style={{fontSize: 28, fontWeight: 800, color: C.violet}}>CO₂ tỉ lệ NGHỊCH với VA</div>
      </Glass>
      <Svg>
        <Wheel cx={460} cy={470} R={175} t={t} a={ap(t, st(S, 0))} />
      </Svg>
      <Card x={880} y={150} w={960} h={180} a={ap(t, st(S, 1))} c={C.red} title="① Trước khi chỉnh: loại trừ sai sót kỹ thuật" size={28}>NÉN · RÒ · KHOẢNG CHẾT cơ học · báo động áp lực · Ti, Te</Card>
      <Card x={880} y={350} w={960} h={180} a={ap(t, st(S, 2))} c={C.oxy} title="② Chỉnh bằng 2 nút" size={28}>VT (khi còn &lt; 8 mL/kg) · tần số (khi VT đã đủ)</Card>
      <Card x={880} y={550} w={960} h={190} a={ap(t, st(S, 3))} c={C.amber} title="③ Công thức & kiềm hô hấp" size={27}>CO₂ cũ × f cũ = CO₂ mới × f mới · kiềm: tự thở tốt / stress / auto-trigger</Card>
      <Memo x={260} y={770} w={1400} h={120} t={t} s0={st(S, 3) + 4} size={44}>NÉN · RÒ · CHẾT → rồi mới chỉnh VT, f</Memo>
    </AbsoluteFill>
  );
};

export const SCENES = [S0, S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18];
void lerp; void fPC; void psBreath; void Badge; void Big; void Range; void Balloon; void Arrow; void fVC; void pVC;
