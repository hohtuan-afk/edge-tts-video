import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ap, sp, useT, lerp, C, FONT, STN_COL, Glass, Chip, Memo, Header, Roadmap, Defs, Badge, Label, geo, Circuit} from './lib';

// ================= Bài: Cài đặt máy thở theo bệnh lý =================
type P = {S: number[]};
const ST = ['NHÓM', 'MỔ', 'TIM', 'NÃO', 'COPD·HEN', 'ARDS'];
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
    <rect x={cx - neck / 2} y={cy - r - 90} width={neck} height={92} rx={neck / 2} fill="#C9D6EA" />
    <circle cx={cx} cy={cy} r={r} fill="url(#lung)" stroke={c} strokeWidth={stroke} />
  </g>
);
const osc = (t: number, T = 3) => 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / T);

// ===================== 0. Tiêu đề =====================
const S0: React.FC<P> = () => {
  const t = useT();
  const k = sp(t, 0.5, 12);
  return (
    <AbsoluteFill>
      <Svg>
        <Wave x={160} y={170} w={1600} h={280} f={(s) => pVC(s, {T: 3, ti: 1, pause: 0.3, pk: 24, pl: 18})} lo={0} hi={27} span={9} color={C.insp} t={t} t0={0} speed={1.6} fill base={0} />
      </Svg>
      <div style={{position: 'absolute', top: 540, width: '100%', textAlign: 'center', opacity: Math.min(1, k * 1.3), transform: `scale(${0.9 + 0.1 * k})`}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 100, letterSpacing: -2, lineHeight: 1.05, background: 'linear-gradient(180deg, #FFFFFF, #B9CBE6)', WebkitBackgroundClip: 'text', color: 'transparent'}}>
          CÀI ĐẶT MÁY THỞ THEO BỆNH LÝ
        </div>
      </div>
      <div style={{position: 'absolute', top: 690, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 40, color: C.amber, opacity: ap(t, 1.2)}}>
        Cài đặt ban đầu & xử trí · hành trình 6 trạm
      </div>
      <div style={{position: 'absolute', top: 770, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 400, fontSize: 24, color: C.muted, opacity: ap(t, 1.8)}}>
        Nguồn: Tài liệu tập huấn thở máy – Bộ Y tế · ARDS Network 2000 · Berlin 2012
      </div>
    </AbsoluteFill>
  );
};

// ===================== 1. Ba nhóm phổi =====================
const S1: React.FC<P> = ({S}) => {
  const t = useT();
  const k = osc(t, 3);
  const cards = [
    {h: 'BÌNH THƯỜNG', c: C.oxy, l: 'Chấn thương đầu · CT cột sống cổ · viêm não – màng não · XHNMN · ngộ độc · Guillain-Barré'},
    {h: 'CỨNG · C↓', c: C.blue, l: 'Viêm phổi · phù phổi cấp · ARDS · ngạt nước · chấn thương ngực'},
    {h: 'TẮC · R↑', c: C.red, l: 'COPD · hen'},
  ];
  return (
    <AbsoluteFill>
      <Header num="01" title="Ba nhóm phổi" t={t} />
      <div style={{opacity: ap(t, st(S, 4))}}><RM cur="all" t={t} /></div>
      {cards.map((x, i) => (
        <Glass key={i} x={80 + i * 600} y={150} w={560} h={520} a={ap(t, st(S, 0) + 0.5 * i)} border={x.c}>
          <div style={{fontSize: 40, fontWeight: 800, color: x.c, textAlign: 'center'}}>{x.h}</div>
          <div style={{height: 200}} />
          <div style={{fontSize: 27, lineHeight: 1.45, fontWeight: 500, opacity: ap(t, st(S, i + 1))}}>{x.l}</div>
        </Glass>
      ))}
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <Balloon cx={360} cy={330} r={52 + 22 * k} />
          <Balloon cx={960} cy={330} r={46 + 6 * k} stroke={8} c={C.blue} />
          <Balloon cx={1560} cy={330} r={66 + 12 * (1 - Math.exp(-3 * k))} neck={6} />
          <Label x={360} y={448} c={C.muted} s={22}>nở bình thường</Label>
          <Label x={960} y={448} c={C.muted} s={22}>khó nở</Label>
          <Label x={1560} y={448} c={C.muted} s={22}>khí khó ra</Label>
        </g>
      </Svg>
      {ST.map((s, i) => (
        <Chip key={i} x={80 + i * 297} y={720} w={280} h={70} c={STN_COL[i]} a={ap(t, st(S, 4) + 0.4 * i)} s={27} bold>{i + 1}. {s}</Chip>
      ))}
    </AbsoluteFill>
  );
};

// ===================== 2. PBW & VT ban đầu =====================
const S2: React.FC<P> = ({S}) => {
  const t = useT();
  const rows = [
    {n: 'Phổi bình thường', vt: '6–8', f: '15–20', T: 3.4, c: C.oxy},
    {n: 'Tổn thương cấp', vt: '4–8', f: '20–30', T: 2.2, c: C.blue},
    {n: 'Tắc nghẽn', vt: '4–8', f: '8–15', T: 5.5, c: C.red},
  ];
  return (
    <AbsoluteFill>
      <Header num="02" title="Trạm 1 · VT ban đầu" t={t} />
      <RM cur={0} t={t} />
      <Card x={80} y={150} w={820} h={300} a={ap(t, st(S, 0))} c={C.amber} title="Cân nặng dự đoán (PBW, kg)" size={30}>
        <div><B c={C.blue}>Nam</B> = 50 + 0,91 × (cao − 152,4)</div>
        <div><B c={C.pink}>Nữ</B> = 45,5 + 0,91 × (cao − 152,4)</div>
        <div style={{fontSize: 22, color: C.muted, marginTop: 8}}>chiều cao tính bằng cm</div>
      </Card>
      <Chip x={80} y={475} w={820} h={84} c={C.insp} a={ap(t, st(S, 1))} s={27}>Trẻ em: cân nặng theo tuổi / theo chiều cao</Chip>
      <Chip x={80} y={585} w={820} h={84} c={C.red} a={ap(t, st(S, 3))} s={30} bold>Pplat &lt; 28 cmH₂O</Chip>
      <Glass x={940} y={150} w={900} h={530} a={ap(t, st(S, 2))} border={C.blue}>
        <div style={{display: 'flex', fontSize: 24, color: C.muted, fontWeight: 700}}>
          <div style={{width: 280}}>Nhóm</div><div style={{width: 150}}>VT mL/kg</div><div>Tần số</div>
        </div>
      </Glass>
      {rows.map((r, i) => (
        <div key={i} style={{position: 'absolute', left: 970, top: 230 + i * 150, opacity: ap(t, st(S, 2) + 1.3 * i), fontFamily: FONT, color: C.txt}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 280, fontSize: 28, fontWeight: 800, color: r.c}}>{r.n}</div>
          <div style={{position: 'absolute', left: 280, top: -6, fontSize: 40, fontWeight: 800}}>{r.vt}</div>
          <div style={{position: 'absolute', left: 430, top: -6, fontSize: 40, fontWeight: 800, color: r.c}}>{r.f}</div>
        </div>
      ))}
      <Svg>
        {rows.map((r, i) => (
          <g key={i} opacity={ap(t, st(S, 2) + 1.3 * i)}>
            <Wave x={970} y={282 + i * 150} w={840} h={70} f={(s) => pPC(s, {T: r.T, ti: Math.min(1, r.T / 3), pi: 14})} lo={0} hi={21} span={11} color={r.c} t={t} t0={st(S, 2)} sw={3} base={0} />
          </g>
        ))}
      </Svg>
      <Memo x={260} y={750} w={1400} h={140} t={t} s0={st(S, 4)} size={46}>Phổi CỨNG → thở NHANH · phổi TẮC → thở CHẬM</Memo>
    </AbsoluteFill>
  );
};

// ===================== 3. Hậu phẫu =====================
const S3: React.FC<P> = ({S}) => {
  const t = useT();
  const cols = [
    {h: 'Không bệnh phổi', c: C.oxy, l: ['A/C (CMV)', 'f 12–18', 'VT 6–8 mL/kg', 'Ti 1 s', 'PEEP ≤ 5', 'PaO₂ > 80']},
    {h: 'Bệnh phổi TẮC NGHẼN', c: C.red, l: ['A/C (CMV)', 'f 12–18', 'VT 6–8 mL/kg', 'Ti 0,8–1 s', 'PEEP 5 (đối trọng auto-PEEP)', 'SpO₂ 88–95%']},
    {h: 'Bệnh phổi HẠN CHẾ', c: C.blue, l: ['A/C (CMV)', 'f 20–30', 'VT 4–6 mL/kg', 'Ti 0,5–0,8 s', 'PEEP 5', 'SpO₂ 88–95%']},
  ];
  return (
    <AbsoluteFill>
      <Header num="03" title="Trạm 2 · Thở máy sau mổ" t={t} />
      <RM cur={1} t={t} />
      {['Ngưng thở do thuốc mê', 'Giảm stress tim phổi', 'Bệnh phổi có sẵn'].map((x, i) => (
        <Chip key={i} x={80 + i * 595} y={150} w={570} h={76} c={C.amber} a={ap(t, st(S, 0) + 1.2 + i * 0.9)} s={27}>{x}</Chip>
      ))}
      {cols.map((x, i) => (
        <Glass key={i} x={80 + i * 595} y={255} w={570} h={470} a={ap(t, st(S, i + 1))} border={x.c} pad={26}>
          <div style={{fontSize: 30, fontWeight: 800, color: x.c, marginBottom: 12}}>{x.h}</div>
          {x.l.map((y, j) => (
            <div key={j} style={{fontSize: 29, fontWeight: j === 1 || j === 2 ? 800 : 500, lineHeight: 1.5, opacity: ap(t, st(S, i + 1) + 0.6 + j * 0.45), color: (i === 1 && j === 3) || (i === 2 && (j === 1 || j === 2 || j === 3)) ? x.c : C.txt}}>• {y}</div>
          ))}
        </Glass>
      ))}
      <Chip x={80} y={755} w={1760} h={90} c={C.red} a={ap(t, st(S, 4))} s={32} bold>Mọi nhóm: Pplat ≤ 28 cmH₂O · áp lực đẩy &lt; 15 cmH₂O</Chip>
    </AbsoluteFill>
  );
};

// ===================== 4. Hậu phẫu: điều chỉnh & cai =====================
const S4: React.FC<P> = ({S}) => {
  const t = useT();
  const W = 900;
  const X = (v: number) => ((v - 21) / 79) * W;
  const ptr = 21 + 79 * osc(t - st(S, 0), 6);
  const hi = ptr >= 60;
  return (
    <AbsoluteFill>
      <Header num="04" title="Trạm 2 · Chỉnh máy & cai" t={t} />
      <RM cur={1} t={t} />
      <Glass x={80} y={150} w={1000} h={300} a={ap(t, st(S, 0))} border={C.oxy}>
        <div style={{fontSize: 28, fontWeight: 800, color: C.oxy}}>Oxy hoá: nhìn FiO₂</div>
        <div style={{position: 'relative', height: 200, marginTop: 10}}>
          <div style={{position: 'absolute', left: 0, top: 70, width: X(60), height: 34, borderRadius: '17px 0 0 17px', background: `${C.oxy}55`}} />
          <div style={{position: 'absolute', left: X(60), top: 70, width: W - X(60), height: 34, borderRadius: '0 17px 17px 0', background: `${C.violet}66`}} />
          <div style={{position: 'absolute', left: X(60) - 3, top: 50, width: 6, height: 74, background: C.amber, boxShadow: `0 0 14px ${C.amber}`}} />
          <div style={{position: 'absolute', left: X(60) - 40, top: 8, width: 80, textAlign: 'center', fontSize: 32, fontWeight: 800, color: C.amber}}>60%</div>
          <div style={{position: 'absolute', left: X(ptr) - 10, top: 62, width: 20, height: 50, borderRadius: 10, background: '#fff', boxShadow: '0 0 16px #fff'}} />
          <div style={{position: 'absolute', left: 20, top: 128, fontSize: 28, fontWeight: 800, color: hi ? C.muted : C.oxy}}>&lt; 60% → chỉnh FiO₂</div>
          <div style={{position: 'absolute', right: 20, top: 128, fontSize: 28, fontWeight: 800, color: hi ? C.violet : C.muted}}>≥ 60% → tăng PEEP</div>
        </div>
      </Glass>
      <Card x={1120} y={150} w={720} h={300} a={ap(t, st(S, 1))} c={C.blue} title="Thông khí" size={30}>
        <div style={{fontSize: 44, fontWeight: 800}}>VE = VT × f</div>
        <div>Chỉnh tần số và VT</div>
        <div><B c={C.red}>VT ≤ 8 mL/kg PBW</B></div>
      </Card>
      <Glass x={80} y={480} w={1760} h={250} a={ap(t, st(S, 2))} border={C.insp}>
        <div style={{fontSize: 28, fontWeight: 800, color: C.insp}}>Cai máy khi đủ 3 điều kiện</div>
      </Glass>
      {['FiO₂ ≤ 40%', 'PEEP ≤ 5 cmH₂O', 'Trigger hiệu quả'].map((x, i) => (
        <Chip key={i} x={120 + i * 380} y={545} w={350} h={76} c={C.insp} a={ap(t, st(S, 2) + 1 + i * 1.2)} s={28} bold>✓ {x}</Chip>
      ))}
      {['Nghiệm pháp tự thở 30 phút', 'hoặc PS ↓ còn 5–10', 'Rút NKQ'].map((x, i) => (
        <React.Fragment key={i}>
          <Chip x={120 + i * 560} y={640} w={i === 2 ? 340 : 480} h={70} c={i === 2 ? C.oxy : C.blue} a={ap(t, st(S, 3) + i * 1.3)} s={27}>{x}</Chip>
          {i < 2 && <Arrow x={612 + i * 560} y={644} a={ap(t, st(S, 3) + i * 1.3 + 0.6)} />}
        </React.Fragment>
      ))}
      <Memo x={260} y={765} w={1400} h={125} t={t} s0={st(S, 4)} size={42}>Mốc 60: dưới → chỉnh FiO₂ · từ 60 → tăng PEEP</Memo>
    </AbsoluteFill>
  );
};

// ===================== 5. Suy tim: tương tác tim – phổi =====================
const Heart: React.FC<{cx: number; cy: number; s: number; t: number}> = ({cx, cy, s, t}) => {
  const k = 1 + 0.06 * Math.max(0, Math.sin(2 * Math.PI * t * 1.2)) ** 3;
  return (
    <g transform={`translate(${cx},${cy}) scale(${s * k})`}>
      <path d="M0,-20 C-10,-55 -70,-50 -70,-5 C-70,35 -20,60 0,85 C20,60 70,35 70,-5 C70,-50 10,-55 0,-20 Z" fill="#E2546F" stroke="#FFC2D0" strokeWidth={3} filter="url(#glow)" />
      <path d="M-30,-5 C-30,20 -10,40 0,55" fill="none" stroke="#FFC2D0" strokeWidth={3} opacity={0.6} />
    </g>
  );
};
const S5: React.FC<P> = ({S}) => {
  const t = useT();
  const push = 12 * osc(t, 3);
  const a0 = ap(t, st(S, 0));
  return (
    <AbsoluteFill>
      <Header num="05" title="Trạm 3 · Suy tim" t={t} />
      <RM cur={2} t={t} />
      <Card x={80} y={150} w={860} h={520} a={a0} c={C.red} title="Áp lực dương ↑ áp lực lồng ngực" />
      <Svg>
        <g opacity={a0}>
          <path d="M210,640 C210,330 330,250 510,250 C690,250 810,330 810,640" fill="none" stroke="#5B7398" strokeWidth={6} />
          <Heart cx={510} cy={430} s={1.5} t={t} />
          {[-1, 1].map((d) => (
            <g key={d}>
              <path d={`M${510 + d * (300 - push)},430 l${-d * 60},0`} stroke={C.amber} strokeWidth={10} strokeLinecap="round" />
              <path d={`M${510 + d * (240 - push)},430 l${d * 22},-18 l0,36 z`} fill={C.amber} />
            </g>
          ))}
          <Label x={510} y={600} c={C.amber} s={28}>↓ tiền tải · ↓ hậu tải thất trái</Label>
        </g>
      </Svg>
      <Card x={980} y={150} w={860} h={160} a={ap(t, st(S, 1))} c={C.oxy} title="Tim trái đang suy" size={28}>→ co bóp tốt hơn ↑</Card>
      <Card x={980} y={330} w={860} h={160} a={ap(t, st(S, 2))} c={C.red} title="BN thiếu dịch" size={28}>→ cung lượng tim ↓ thêm</Card>
      <Card x={980} y={510} w={860} h={160} a={ap(t, st(S, 3))} c={C.blue} title="Chỉ định thở máy" size={26}>↓ O₂ máu · ↑ công cơ tim · ↑ công thở</Card>
      <Chip x={80} y={710} w={700} h={110} c={C.oxy} a={ap(t, st(S, 4))} s={28} bold>CPAP mặt nạ 10 cmH₂O · FiO₂ 100%</Chip>
      <Chip x={810} y={710} w={1030} h={110} c={C.red} a={ap(t, st(S, 4) + 3)} s={27}>TRÁNH NIV: NMCT · RL huyết động · loạn nhịp · giảm ý thức</Chip>
    </AbsoluteFill>
  );
};

// ===================== 6. Suy tim: cài đặt =====================
const S6: React.FC<P> = ({S}) => {
  const t = useT();
  const rows: [string, number][] = [
    ['Mode A/C · thể tích hoặc áp lực', 0], ['VT 6–8 mL/kg PBW', 1], ['Tần số > 15 lần/phút', 1], ['Ti ≤ 1 giây', 1], ['Pplat < 28 · áp lực đẩy < 15', 1],
    ['PEEP 5–10 cmH₂O', 2], ['FiO₂ 100% → giảm để SpO₂ 88–95%', 2],
  ];
  const ph7 = 7.4 + 0.12 * Math.sin((2 * Math.PI * (t - st(S, 3))) / 6);
  return (
    <AbsoluteFill>
      <Header num="06" title="Trạm 3 · Cài máy suy tim" t={t} />
      <RM cur={2} t={t} />
      <Glass x={80} y={150} w={900} h={590} a={ap(t, st(S, 0))} border={C.red}>
        {rows.map(([x, j], i) => (
          <div key={i} style={{fontSize: 31, fontWeight: 700, lineHeight: 1.85, opacity: ap(t, st(S, j) + (i % 4) * 0.7), color: j === 2 ? C.violet : C.txt}}>• {x}</div>
        ))}
      </Glass>
      <Card x={1020} y={150} w={820} h={150} a={ap(t, st(S, 3))} c={C.violet} size={28}>
        <div><B c={C.violet}>SpO₂ &lt; 88% + phù phổi</B></div>
        <div>→ tăng PEEP</div>
      </Card>
      <Glass x={1020} y={325} w={820} h={250} a={ap(t, st(S, 3) + 2)} border={C.blue}>
        <div style={{fontSize: 28, fontWeight: 800, color: C.blue}}>pH → chỉnh tần số</div>
      </Glass>
      {(() => {
        const W = 740, X = (v: number) => ((v - 7.25) / 0.3) * W, a = ap(t, st(S, 3) + 2);
        return (
          <div style={{position: 'absolute', left: 1060, top: 400, width: W, height: 150, opacity: a, fontFamily: FONT}}>
            <div style={{position: 'absolute', left: 0, top: 40, width: W, height: 16, borderRadius: 8, background: 'linear-gradient(90deg,#F87171,#4ADE80 40%,#4ADE80 60%,#60A5FA)'}} />
            <div style={{position: 'absolute', left: X(ph7) - 9, top: 26, width: 18, height: 44, borderRadius: 9, background: '#fff', boxShadow: '0 0 14px #fff'}} />
            {[7.25, 7.35, 7.45, 7.55].map((v) => <div key={v} style={{position: 'absolute', left: X(v) - 30, width: 60, textAlign: 'center', top: 74, fontSize: 22, color: C.muted}}>{String(v).replace('.', ',')}</div>)}
            <div style={{position: 'absolute', left: 0, top: -4, fontSize: 26, fontWeight: 800, color: C.red}}>&lt; 7,35 → ↑ f</div>
            <div style={{position: 'absolute', right: 0, top: -4, fontSize: 26, fontWeight: 800, color: C.blue}}>&gt; 7,45 → ↓ f</div>
          </div>
        );
      })()}
      <Memo x={1020} y={605} w={820} h={135} t={t} s0={st(S, 4)} size={38}>PEEP là BẠN của tim trái suy</Memo>
    </AbsoluteFill>
  );
};

// ===================== 7. Não: sinh lý =====================
const S7: React.FC<P> = ({S}) => {
  const t = useT();
  const chain = (y: number, items: string[], c: string[], s0: number, w: number[]) => {
    let x = 80;
    return items.map((it, i) => {
      const el = (
        <React.Fragment key={i}>
          <Chip x={x} y={y} w={w[i]} h={84} c={c[i]} a={ap(t, s0 + i * 1.1)} s={28} bold>{it}</Chip>
          {i < items.length - 1 && <Arrow x={x + w[i] + 10} y={y + 8} a={ap(t, s0 + i * 1.1 + 0.6)} />}
        </React.Fragment>
      );
      x += w[i] + 66;
      return el;
    });
  };
  const r1 = 34 + 12 * ap(t, st(S, 1) + 2.5, 1.5), r2 = 34 - 16 * ap(t, st(S, 2) + 2.5, 1.5);
  return (
    <AbsoluteFill>
      <Header num="07" title="Trạm 4 · Tăng áp nội sọ" t={t} />
      <RM cur={3} t={t} />
      <Chip x={80} y={150} w={1760} h={84} c={C.violet} a={ap(t, st(S, 0))} s={29}>ICP ↑ → ↓ tưới máu não → thiếu O₂ não → có thể thoát vị não</Chip>
      {chain(285, ['PaCO₂ ↑ / PaO₂ ↓', 'Giãn mạch não', 'ICP ↑'], [C.red, C.red, C.red], st(S, 1), [420, 360, 220])}
      {chain(415, ['Tăng thông khí', 'PaCO₂ ↓', 'Co mạch não', '↓ Tưới máu não'], [C.blue, C.blue, C.blue, C.blue], st(S, 2), [330, 230, 300, 360])}
      <Svg>
        <g opacity={ap(t, st(S, 1) + 2.2)}>
          <circle cx={1580} cy={327} r={r1} fill="none" stroke={C.red} strokeWidth={10} filter="url(#glow)" />
          <Label x={1690} y={336} c={C.red} s={24} anchor="start">mạch giãn</Label>
        </g>
        <g opacity={ap(t, st(S, 2) + 3.3)}>
          <circle cx={1740} cy={457} r={Math.max(12, r2)} fill="none" stroke={C.blue} strokeWidth={10} filter="url(#glow)" />
        </g>
      </Svg>
      <Card x={80} y={545} w={1760} h={130} a={ap(t, st(S, 3))} c={C.amber} size={28}>
        <div><B c={C.red}>KHÔNG khuyến cáo</B> tăng thông khí kéo dài (không giảm tử vong, ↑ di chứng)</div>
        <div>Chỉ <B>TẠM THỜI</B> khi ICP tăng cấp, chờ phẫu thuật → rồi đưa PaCO₂ về bình thường</div>
      </Card>
      <Card x={80} y={700} w={1760} h={180} a={ap(t, st(S, 4))} c={C.violet} title="PEEP và ICP" size={28}>
        PEEP ↑ áp lực lồng ngực → ↓ máu TM não về → ↑ ICP — chỉ có ý nghĩa khi <B c={C.red}>PEEP &gt; 15</B> hoặc <B c={C.red}>giảm thể tích</B>
      </Card>
    </AbsoluteFill>
  );
};

// ===================== 8. Não: cài đặt =====================
const S8: React.FC<P> = ({S}) => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Header num="08" title="Trạm 4 · Cài máy cho não" t={t} />
      <RM cur={3} t={t} />
      <Card x={80} y={150} w={860} h={230} a={ap(t, st(S, 0))} c={C.violet} title="Chỉ định" size={25}>
        <div>• Ức chế hô hấp do tổn thương thần kinh</div>
        <div>• Chấn thương cột sống, ngực, bụng kèm theo</div>
        <div>• Phù phổi do thần kinh · thuốc ức chế hô hấp</div>
      </Card>
      <Card x={80} y={400} w={860} h={165} a={ap(t, st(S, 1))} c={C.blue} title="Cài đặt" size={28}>
        A/C thể tích · VT 6–8 mL/kg · Pplat &lt; 28 · <B c={C.blue}>f 15–25</B> · Ti 1 s
      </Card>
      <Glass x={980} y={150} w={860} h={415} a={ap(t, st(S, 2))} border={C.oxy}>
        <div style={{fontSize: 28, fontWeight: 800, color: C.oxy}}>Mục tiêu khí máu</div>
      </Glass>
      <Range x={1020} y={210} w={780} lo={20} hi={60} a0={35} a1={45} c={C.amber} a={ap(t, st(S, 2) + 0.6)} ticks={[20, 35, 45, 60]} label="PaCO₂ 35–45 mmHg" />
      <Range x={1020} y={325} w={780} lo={7.2} hi={7.6} a0={7.35} a1={7.45} c={C.blue} a={ap(t, st(S, 2) + 2)} ticks={[7.2, 7.35, 7.45, 7.6]} label="pH 7,35–7,45" />
      <Range x={1020} y={440} w={780} lo={40} hi={140} a0={70} a1={100} c={C.oxy} a={ap(t, st(S, 2) + 3.4)} ticks={[40, 70, 80, 100, 140]} label="PaO₂ 70–100 (≈ 80) mmHg" />
      {['PEEP 5 (≤ 10 thường an toàn)', 'Nằm đầu cao', 'Chỉnh thông khí bằng TẦN SỐ'].map((x, i) => (
        <Chip key={i} x={[80, 700, 1080][i]} y={590} w={[590, 350, 760][i]} h={80} c={C.violet} a={ap(t, st(S, 3) + i * 1.5)} s={27} bold>{x}</Chip>
      ))}
      <Chip x={80} y={695} w={500} h={80} c={C.amber} a={ap(t, st(S, 4))} s={26}>PaO₂ thấp + FiO₂ 60%</Chip>
      <Arrow x={592} y={700} a={ap(t, st(S, 4) + 0.5)} />
      <Chip x={650} y={695} w={580} h={80} c={C.oxy} a={ap(t, st(S, 4) + 1.5)} s={26}>ICP không ↑ → ↑ PEEP (≤ 10)</Chip>
      <Chip x={1260} y={695} w={580} h={80} c={C.red} a={ap(t, st(S, 4) + 3.5)} s={26}>ICP ↑ → tiếp tục ↑ FiO₂</Chip>
      <Memo x={260} y={800} w={1400} h={100} t={t} s0={st(S, 5)} size={40}>NÃO: CO₂ 35–45 · O₂ ≥ 70 · ĐẦU CAO</Memo>
    </AbsoluteFill>
  );
};

// ===================== 9. COPD: NIV =====================
const bilevel = (s: number, ip = 12, ep = 4, T = 4, ti = 1.4) => {
  const q = ph(s, T);
  if (q < ti) return ep + (ip - ep) * (1 - ex(-q / 0.18));
  return ep + (ip - ep) * ex(-(q - ti) / 0.15);
};
const S9: React.FC<P> = ({S}) => {
  const t = useT();
  const Y = (v: number) => yv(320, 330, 0, 16, v);
  const a1 = ap(t, st(S, 1)), a2 = ap(t, st(S, 2));
  return (
    <AbsoluteFill>
      <Header num="09" title="Trạm 5 · COPD: thở không xâm lấn" t={t} />
      <RM cur={4} t={t} />
      <Chip x={80} y={150} w={1760} h={84} c={C.oxy} a={ap(t, st(S, 0))} s={29}>Tránh thở máy xâm lấn nếu có thể · NIV là chuẩn cho đợt cấp COPD · cứu sống</Chip>
      <Card x={80} y={260} w={1100} h={440} a={a1} c={C.insp} title="NIV hai mức áp lực (BiPAP)" />
      <Svg>
        <g opacity={a1}>
          <Wave x={120} y={320} w={940} h={330} f={(s) => bilevel(s)} lo={0} hi={16} span={8} color={C.insp} t={t} t0={st(S, 1)} base={0} fill />
          <line x1={120} x2={1060} y1={Y(12)} y2={Y(12)} stroke={C.amber} strokeWidth={2} strokeDasharray="8 8" />
          <line x1={120} x2={1060} y1={Y(4)} y2={Y(4)} stroke={C.violet} strokeWidth={2} strokeDasharray="8 8" />
          <Label x={1068} y={Y(12) + 8} c={C.amber} s={24} anchor="start">IPAP</Label>
          <Label x={1068} y={Y(4) + 8} c={C.violet} s={24} anchor="start">EPAP</Label>
        </g>
        <g opacity={a2}>
          <path d={`M1110,${Y(12)} l14,0 l0,${Y(4) - Y(12)} l-14,0`} fill="none" stroke={C.oxy} strokeWidth={4} />
          <Label x={1150} y={(Y(12) + Y(4)) / 2 + 30} c={C.oxy} s={26} anchor="end">PS 8</Label>
        </g>
      </Svg>
      <Card x={1220} y={260} w={620} h={440} a={a1} c={C.amber} title="Cài ban đầu" size={29}>
        <div><B>IPAP 8–12</B> cmH₂O</div>
        <div style={{fontSize: 24, color: C.muted}}>chỉnh để thay đổi VT</div>
        <div style={{marginTop: 14}}><B c={C.violet}>EPAP 4</B> cmH₂O</div>
        <div style={{fontSize: 24, color: C.muted}}>tăng để cải thiện PaO₂</div>
        <div style={{marginTop: 18, fontSize: 36, fontWeight: 800, opacity: a2}}>12 − 4 = <span style={{color: C.oxy}}>PS 8</span></div>
      </Card>
      <Glass x={80} y={725} w={1760} h={165} a={ap(t, st(S, 3))} border={C.red}>
        <div style={{display: 'flex', alignItems: 'center', gap: 34, height: '100%'}}>
          <div style={{fontSize: 46, fontWeight: 800, color: C.red, whiteSpace: 'nowrap'}}>Sau 2 GIỜ</div>
          <div style={{fontSize: 27, lineHeight: 1.4, fontWeight: 500}}>pH, PaCO₂ không cải thiện / xấu đi · tri giác ↓ · RL huyết động · oxy hoá xấu → <B c={C.red}>đặt NKQ</B></div>
        </div>
      </Glass>
    </AbsoluteFill>
  );
};

// ===================== 10. COPD: thở máy xâm lấn =====================
const S10: React.FC<P> = ({S}) => {
  const t = useT();
  const o = {T: 5, ti: 0.8, tau: 0.45};
  const fl = (s: number) => fVC(s, {...o, dec: true}) * 1.15;
  return (
    <AbsoluteFill>
      <Header num="10" title="Trạm 5 · COPD: thở xâm lấn" t={t} />
      <RM cur={4} t={t} />
      <Card x={80} y={150} w={860} h={210} a={ap(t, st(S, 0))} c={C.red} title="Mục đích" size={27}>
        <div>• Cho cơ hô hấp nghỉ</div>
        <div>• Đưa PaCO₂ về mức NỀN · điều trị ↓ O₂</div>
      </Card>
      <Card x={80} y={380} w={860} h={290} a={ap(t, st(S, 1))} c={C.blue} title="Cài đặt" size={30}>
        <div>A/C · <B c={C.red}>f 8–15</B> · VT 6–8 mL/kg</div>
        <div>Ti 0,6–1 s · Pplat ≤ 28</div>
        <div style={{opacity: ap(t, st(S, 2))}}>Lưu lượng <B c={C.insp}>&gt; 60 L/ph</B>, dạng giảm dần</div>
      </Card>
      <Card x={980} y={150} w={860} h={360} a={ap(t, st(S, 1))} c={C.insp} title="Hít vào nhanh · thở ra DÀI" />
      <Svg>
        <g opacity={ap(t, st(S, 1))}>
          <Wave x={1020} y={220} w={780} h={260} f={fl} lo={-1} hi={1.2} span={10} color={C.insp} t={t} t0={st(S, 1)} base={0} fill />
        </g>
      </Svg>
      <Card x={980} y={530} w={860} h={140} a={ap(t, st(S, 3))} c={C.violet} size={27}>
        <div>PEEP 5 đối trọng auto-PEEP</div>
        <div>FiO₂ thường ≤ 50% · SpO₂ 88–95% · PaO₂ 55–80</div>
      </Card>
      <Chip x={80} y={695} w={1760} h={80} c={C.amber} a={ap(t, st(S, 4))} s={28}>PaCO₂ chỉ về mức NỀN (50–60 mmHg) hoặc pH &gt; 7,30 · Ppeak cao thường không là vấn đề</Chip>
      <Memo x={260} y={795} w={1400} h={105} t={t} s0={st(S, 5)} size={38}>COPD: CHẬM · THỞ RA DÀI · CO₂ về mức NỀN</Memo>
    </AbsoluteFill>
  );
};

// ===================== 11. Auto-PEEP =====================
const S11: React.FC<P> = ({S}) => {
  const t = useT();
  const T = 2.2, ti = 0.8;
  const fl = (s: number) => {
    const q = ph(s, T);
    if (q < ti) return 0.75 * Math.min(1, q / 0.04);
    return -0.85 * ex(-(q - ti) / 0.7);
  };
  const X = (s: number) => 120 + (s / 8.8) * 1020;
  const Y = (v: number) => yv(230, 300, -1, 1, v);
  return (
    <AbsoluteFill>
      <Header num="11" title="Trạm 5 · Auto-PEEP" t={t} />
      <RM cur={4} t={t} />
      <Card x={80} y={150} w={1100} h={420} a={ap(t, st(S, 0))} c={C.red} title="Lưu lượng thở ra KHÔNG về 0 → khí bị bẫy" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <Wave x={120} y={230} w={1020} h={300} f={fl} lo={-1} hi={1} span={8.8} color={C.insp} t={t} t0={st(S, 0)} base={0} fill />
          {[1, 2, 3].map((k) => (
            <g key={k} opacity={ap(t, st(S, 0) + 2 + k * 0.6)}>
              <circle cx={X(k * T - 0.02)} cy={Y(fl(k * T - 0.02))} r={18} fill="none" stroke={C.red} strokeWidth={4} filter="url(#glow)" />
            </g>
          ))}
          <Label x={X(2.2)} y={Y(-0.55)} c={C.red} s={24}>chưa về 0 đã hít vào</Label>
        </g>
      </Svg>
      <Card x={1220} y={150} w={620} h={205} a={ap(t, st(S, 1))} c={C.amber} title="Hậu quả" size={26}>
        <div>↑ công thở · chống máy · khó cai</div>
        <div><B c={C.red}>MẤT NHẠY trigger</B></div>
      </Card>
      <Card x={1220} y={370} w={620} h={200} a={ap(t, st(S, 2))} c={C.violet} title="Dấu hiệu" size={24}>
        <div>BN gắng sức mà máy không nhận</div>
        <div>f BN &gt; f máy · thở ra kéo tới nhịp sau</div>
      </Card>
      <Chip x={80} y={595} w={1760} h={80} c={C.blue} a={ap(t, st(S, 3))} s={28}>Đo: giữ cuối thì thở ra (expiratory hold) → đọc auto-PEEP</Chip>
      {['↑ Te · ↓ f · ↓ VT', 'Giảm nhu cầu: sốt, đau, lo âu', '↓ sức cản: ống to, hút đàm, giãn PQ', 'PEEP ngoài'].map((x, i) => (
        <Chip key={i} x={[80, 500, 960, 1500][i]} y={705} w={[400, 440, 520, 340][i]} h={100} c={C.oxy} a={ap(t, st(S, 4) + i * 1.4)} s={26} bold={i === 3}>{x}</Chip>
      ))}
    </AbsoluteFill>
  );
};

// ===================== 12. PEEP ngoài =====================
const S12: React.FC<P> = ({S}) => {
  const t = useT();
  const panel = (cx: number, peep: number, effort: number, c: string, a: number, w: number) => (
    <g opacity={a}>
      <rect x={cx - 26 - w} y={230} width={52 + 2 * w} height={170} rx={20} fill="#C9D6EA" opacity={0.85} />
      <circle cx={cx} cy={500} r={110} fill="url(#lung)" stroke="#FFD1DC" strokeWidth={3} />
      <Label x={cx} y={490} c="#3B0A1A" s={28}>auto-PEEP</Label>
      <Label x={cx} y={528} c="#3B0A1A" s={32}>10</Label>
      <Label x={cx} y={222} c={C.violet} s={26}>PEEP ngoài {peep}</Label>
      <rect x={cx + 200} y={640 - effort * 30} width={70} height={effort * 30} rx={10} fill={c} filter="url(#glow)" />
      <Label x={cx + 235} y={630 - effort * 30} c={c} s={36}>{effort}</Label>
      <Label x={cx + 235} y={668} c={C.muted} s={22}>lực trigger</Label>
    </g>
  );
  return (
    <AbsoluteFill>
      <Header num="12" title="Trạm 5 · Cài PEEP ngoài" t={t} />
      <RM cur={4} t={t} />
      <Card x={80} y={150} w={860} h={540} a={ap(t, st(S, 0))} c={C.red} title="Không PEEP ngoài · độ nhạy −1" />
      <Card x={980} y={150} w={860} h={540} a={ap(t, st(S, 1))} c={C.oxy} title="PEEP ngoài 7 · độ nhạy −1" />
      <Svg>
        {panel(400, 0, 11, C.red, ap(t, st(S, 0)), 0)}
        {panel(1300, 7, 4, C.oxy, ap(t, st(S, 1)), 10 * ap(t, st(S, 1) + 2))}
        <g opacity={ap(t, st(S, 1) + 2)}>
          <Label x={1300} y={420} c={C.oxy} s={22}>nong đường thở</Label>
        </g>
      </Svg>
      <Chip x={80} y={715} w={1760} h={80} c={C.violet} a={ap(t, st(S, 2))} s={30} bold>PEEP ngoài cài THẤP HƠN auto-PEEP (VD 7 so với 10)</Chip>
      <Memo x={260} y={815} w={1400} h={85} t={t} s0={st(S, 3)} size={34}>PEEP ngoài gánh bớt auto-PEEP → BN trigger nhẹ nhàng</Memo>
    </AbsoluteFill>
  );
};

// ===================== 13. Hen =====================
const S13: React.FC<P> = ({S}) => {
  const t = useT();
  const o = {T: 5, ti: 1.1, tau: 0.5};
  return (
    <AbsoluteFill>
      <Header num="13" title="Trạm 5 · Hen nặng" t={t} />
      <RM cur={4} t={t} />
      <Glass x={80} y={150} w={900} h={590} a={ap(t, st(S, 0))} border={C.red}>
        <div style={{fontSize: 30, fontWeight: 800, color: C.red, marginBottom: 10}}>Cài đặt</div>
        {([['A/C (CMV)', 0], ['f 8–20 lần/phút', 0], ['VT 4–6 mL/kg PBW', 0], ['Pplat ≤ 28 · áp lực đẩy < 15', 0], ['Ti 1–1,5 s · tránh auto-PEEP', 1], ['PEEP: còn tranh cãi', 2], ['FiO₂: PaO₂ 55–80, SpO₂ 88–95%', 2]] as [string, number][]).map(([x, j], i) => (
          <div key={i} style={{fontSize: 30, fontWeight: i === 2 ? 800 : 600, lineHeight: 1.75, color: i === 2 ? C.red : C.txt, opacity: ap(t, st(S, j) + (j === 0 ? i * 0.9 : 0))}}>• {x}</div>
        ))}
      </Glass>
      <Card x={1020} y={150} w={820} h={330} a={ap(t, st(S, 0))} c={C.insp} title="VT nhỏ · thở ra dài" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <Wave x={1060} y={230} w={740} h={220} f={(s) => pVC(s, {...o, pk: 22, pl: 18, R: 9})} lo={0} hi={28} span={10} color={C.amber} t={t} t0={st(S, 0)} base={0} fill />
        </g>
      </Svg>
      <Glass x={1020} y={505} w={820} h={235} a={ap(t, st(S, 1))} border={C.amber}>
        <div style={{fontSize: 28, fontWeight: 800, color: C.amber}}>Tăng CO₂ cho phép</div>
        <div style={{fontSize: 44, fontWeight: 800, marginTop: 14}}>PaCO₂ ↑ · pH ≥ 7,20</div>
        <div style={{fontSize: 24, color: C.muted, marginTop: 6}}>đổi lại: phổi không quá căng</div>
      </Glass>
      <Memo x={260} y={770} w={1400} h={125} t={t} s0={st(S, 3)} size={38}>HEN: thể tích NHỎ · tần số CHẬM · chấp nhận CO₂ CAO</Memo>
    </AbsoluteFill>
  );
};

// ===================== 14. ARDS: Berlin & tổn thương do thở máy =====================
const S14: React.FC<P> = ({S}) => {
  const t = useT();
  const W = 1640, X = (v: number) => (v / 400) * W;
  const seg = [[0, 100, C.red, 'NẶNG ≤ 100'], [100, 200, C.amber, 'TRUNG BÌNH 100–200'], [200, 300, '#FACC15', 'NHẸ 200–300']] as const;
  const k = osc(t, 2.6);
  return (
    <AbsoluteFill>
      <Header num="14" title="Trạm 6 · ARDS" t={t} />
      <RM cur={5} t={t} />
      <Glass x={80} y={150} w={1760} h={200} a={ap(t, st(S, 0))} border={C.red}>
        <div style={{fontSize: 28, fontWeight: 800, color: C.red}}>Berlin 2012 · PaO₂/FiO₂ với PEEP ≥ 5</div>
      </Glass>
      {seg.map(([a, b, c, l], i) => (
        <div key={i} style={{position: 'absolute', left: 140 + X(a), top: 225, width: X(b) - X(a) - 6, height: 60, borderRadius: 14, background: `${c}`, opacity: ap(t, st(S, 0) + 1.5 + i * 1.6), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 24, color: C.bg0}}>{l}</div>
      ))}
      <div style={{position: 'absolute', left: 140 + X(300) + 20, top: 236, fontFamily: FONT, fontSize: 24, color: C.muted, opacity: ap(t, st(S, 0) + 6)}}>&gt; 300: không phải ARDS</div>
      <Card x={80} y={380} w={560} h={330} a={ap(t, st(S, 1))} c={C.amber} title="3 vùng phổi" />
      <Card x={680} y={380} w={560} h={330} a={ap(t, st(S, 2))} c={C.red} title="VT lớn → QUÁ CĂNG" />
      <Card x={1280} y={380} w={560} h={330} a={ap(t, st(S, 3))} c={C.violet} title="PEEP thấp → ĐÓNG – MỞ" />
      <Svg>
        <g opacity={ap(t, st(S, 1))}>
          {[0, 1, 2].map((r) => (
            <g key={r}>
              {[0, 1, 2, 3].map((j) => {
                const cx = 140 + j * 70, cy = 480 + r * 75;
                const ry = r === 0 ? 26 : r === 1 ? 6 + 20 * k : 6;
                return <ellipse key={j} cx={cx} cy={cy} rx={26} ry={ry} fill="url(#lung)" stroke={['#4ADE80', C.amber, C.red][r]} strokeWidth={3} />;
              })}
              <Label x={420} y={488 + r * 75} c={['#4ADE80', C.amber, C.red][r]} s={23} anchor="start">{['thông khí tốt', 'đóng / mở', 'không thông khí'][r]}</Label>
            </g>
          ))}
        </g>
        <g opacity={ap(t, st(S, 2))}>
          <circle cx={960} cy={580} r={60 + 45 * k} fill="url(#lung)" stroke={C.red} strokeWidth={4} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const an = (i * Math.PI) / 3, r0 = 70 + 45 * k;
            return <path key={i} d={`M${960 + Math.cos(an) * r0},${580 + Math.sin(an) * r0} l${Math.cos(an) * 22},${Math.sin(an) * 22}`} stroke={C.red} strokeWidth={7} strokeLinecap="round" opacity={k} />;
          })}
          <Label x={960} y={700} c={C.muted} s={22}>VT 10–12 mL/kg</Label>
        </g>
        <g opacity={ap(t, st(S, 3))}>
          <ellipse cx={1560} cy={580} rx={70 - 25 * (1 - k)} ry={8 + 60 * k} fill="url(#lung)" stroke={C.violet} strokeWidth={4} />
          {k < 0.25 && <Label x={1560} y={500} c={C.red} s={26}>lực xé!</Label>}
          <Label x={1560} y={700} c={C.muted} s={22}>xẹp – mở mỗi nhịp</Label>
        </g>
      </Svg>
      {['VT thấp', 'Pplat < 30', 'PEEP đủ giữ phổi mở', 'Tránh FiO₂ > 60% kéo dài'].map((x, i) => (
        <Chip key={i} x={[80, 420, 820, 1330][i]} y={740} w={[310, 370, 480, 510][i]} h={84} c={C.oxy} a={ap(t, st(S, 4) + i * 1.2)} s={28} bold>{x}</Chip>
      ))}
    </AbsoluteFill>
  );
};

// ===================== 15. ARDS: VT thấp, tần số =====================
const S15: React.FC<P> = ({S}) => {
  const t = useT();
  const k = sp(t, st(S, 0) + 1);
  const Y = (v: number) => yv(230, 230, 0, 36, v);
  return (
    <AbsoluteFill>
      <Header num="15" title="Trạm 6 · VT thấp" t={t} />
      <RM cur={5} t={t} />
      <Card x={80} y={150} w={700} h={360} a={ap(t, st(S, 0))} c={C.oxy} title="ARDSNet 2000 · tử vong" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          {[[31, '6 mL/kg', C.oxy], [39.8, '12 mL/kg', C.red]].map(([v, l, c], i) => (
            <g key={i}>
              <rect x={200 + i * 260} y={470 - (v as number) * 5.5 * k} width={150} height={(v as number) * 5.5 * k} rx={12} fill={c as string} />
              <Label x={275 + i * 260} y={460 - (v as number) * 5.5 * k} s={36}>{String(v).replace('.', ',')}%</Label>
              <Label x={275 + i * 260} y={500} c={C.muted} s={24}>{l}</Label>
            </g>
          ))}
        </g>
      </Svg>
      <Card x={820} y={150} w={1020} h={360} a={ap(t, st(S, 1))} c={C.amber} title="Giữ cuối thì hít vào → đọc Pplat" />
      <Svg>
        <g opacity={ap(t, st(S, 1))}>
          <line x1={860} x2={1800} y1={Y(30)} y2={Y(30)} stroke={C.red} strokeWidth={3} strokeDasharray="10 8" />
          <Label x={1800} y={Y(30) - 10} c={C.red} s={24} anchor="end">Pplat &lt; 28–30</Label>
          <Wave x={860} y={230} w={940} h={230} f={(s) => pVC(s, {T: 3, ti: 1, pause: 0.4, pk: 30, pl: 25})} lo={0} hi={36} span={6} color={C.amber} t={t} t0={st(S, 1)} base={0} fill />
        </g>
      </Svg>
      <Glass x={80} y={535} w={1760} h={190} a={ap(t, st(S, 2))} border={C.blue}>
        <div style={{fontSize: 28, fontWeight: 800, color: C.blue}}>Giữ VE = 6 L/phút (50 kg) → f = VE ÷ VT</div>
      </Glass>
      {[['VT 6 → 0,3 L', '20'], ['VT 5 → 0,25 L', '24'], ['VT 4 → 0,2 L', '30']].map(([a, b], i) => (
        <Chip key={i} x={120 + i * 575} y={605} w={540} h={90} c={C.blue} a={ap(t, st(S, 2) + 1.5 + i * 1.6)} s={30} bold>{a} → f {b}</Chip>
      ))}
      <Chip x={80} y={745} w={1760} h={68} c={C.amber} a={ap(t, st(S, 3))} s={26}>Tăng f: giữ Ti 1 s · không đảo I:E quá 1:1 · nhìn Te: còn dư / hết dư / bẫy khí</Chip>
      <Chip x={80} y={828} w={1760} h={68} c={C.violet} a={ap(t, st(S, 4))} s={26}>Bỏ khoảng chết cơ học: ống nối NKQ · HME · filter thừa</Chip>
    </AbsoluteFill>
  );
};

// ===================== 16. ARDS: PEEP =====================
const S16: React.FC<P> = ({S}) => {
  const t = useT();
  const tilt = 6 * Math.sin((2 * Math.PI * t) / 5) * (1 - ap(t, st(S, 0) + 4, 2));
  const mild = [['0,3', '5'], ['0,4', '5–8'], ['0,5', '8–10'], ['0,6', '10'], ['0,7', '10–14'], ['0,8', '14'], ['0,9', '14–18'], ['1,0', '18–24']];
  const sev = [['0,3', '12–14'], ['0,4', '14–16'], ['0,5', '16–18'], ['0,5–0,8', '20'], ['0,8', '22'], ['0,9', '22'], ['1,0', '22–24']];
  const P = [8, 10, 12, 14, 16, 18, 20], Cd = [20, 23, 26, 30, 27, 25, 21], Pp = [25, 26, 27, 28, 30, 33, 37];
  const cx = (i: number) => 260 + i * 240;
  const yC = (v: number) => yv(650, 200, 15, 40, v);
  const nshow = Math.floor(ap(t, st(S, 3) + 1, 4) * 7 + 0.001);
  return (
    <AbsoluteFill>
      <Header num="16" title="Trạm 6 · Chọn PEEP" t={t} />
      <RM cur={5} t={t} />
      <Card x={80} y={150} w={700} h={420} a={ap(t, st(S, 0))} c={C.amber} title="PEEP tối ưu = cân bằng" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <path d="M430,520 L430,300 M370,530 L490,530" stroke="#C9D6EA" strokeWidth={10} strokeLinecap="round" />
          <g transform={`rotate(${tilt} 430 300)`}>
            <line x1={210} x2={650} y1={300} y2={300} stroke="#C9D6EA" strokeWidth={8} strokeLinecap="round" />
            {[210, 650].map((x, i) => (
              <g key={i}>
                <path d={`M${x},300 L${x - 60},390 M${x},300 L${x + 60},390`} stroke="#93A4BC" strokeWidth={3} />
                <path d={`M${x - 80},390 Q${x},440 ${x + 80},390 Z`} fill={i ? C.red : C.violet} opacity={0.85} />
                <Label x={x} y={470} c={i ? C.red : C.violet} s={28}>{i ? 'QUÁ CĂNG' : 'XẸP PHỔI'}</Label>
              </g>
            ))}
          </g>
          <circle cx={430} cy={300} r={14} fill={C.amber} filter="url(#glow)" />
        </g>
      </Svg>
      <Glass x={820} y={150} w={1020} h={330} a={ap(t, st(S, 1))} border={C.blue}>
        <div style={{fontSize: 26, fontWeight: 800, color: C.blue}}>Bảng FiO₂ / PEEP</div>
      </Glass>
      {[['Nhẹ', mild, '#FACC15'], ['TB/nặng', sev, C.red]].map(([n, arr, c], r) => (
        <div key={r} style={{position: 'absolute', left: 850, top: 205 + r * 135, display: 'flex', gap: 6, fontFamily: FONT, opacity: ap(t, st(S, 1) + 1 + r * 2)}}>
          <div style={{width: 110, fontSize: 24, fontWeight: 800, color: c as string, paddingTop: 22}}>{n as string}</div>
          {(arr as string[][]).map(([f, p], i) => (
            <div key={i} style={{width: 102, height: 110, borderRadius: 12, background: 'rgba(14,26,46,0.9)', border: `1.5px solid ${c}66`, textAlign: 'center', paddingTop: 10, boxSizing: 'border-box'}}>
              <div style={{fontSize: 21, color: C.muted}}>{f}</div>
              <div style={{fontSize: 29, fontWeight: 800, color: C.txt}}>{p}</div>
            </div>
          ))}
        </div>
      ))}
      <Chip x={820} y={500} w={1020} h={70} c={C.blue} a={ap(t, st(S, 2))} s={26}>Dưới mục tiêu: lên 1 bước · vượt mục tiêu: lùi 1 bước</Chip>
      <Card x={80} y={595} w={1760} h={300} a={ap(t, st(S, 3))} c={C.oxy} title="PEEP tăng dần: VT 6 · +2–3 cmH₂O mỗi 3–5 phút" />
      <Svg>
        <g opacity={ap(t, st(S, 3))}>
          {P.slice(0, nshow).map((p, i) => (
            <g key={i}>
              {i > 0 && <line x1={cx(i - 1)} y1={yC(Cd[i - 1])} x2={cx(i)} y2={yC(Cd[i])} stroke={C.oxy} strokeWidth={4} />}
              <circle cx={cx(i)} cy={yC(Cd[i])} r={9} fill={C.oxy} />
              <Label x={cx(i)} y={yC(Cd[i]) - 16} c={C.oxy} s={22}>C {Cd[i]}</Label>
              <Label x={cx(i)} y={885} c={Pp[i] > 30 ? C.red : C.muted} s={22}>PEEP {p} · Pplat {Pp[i]}</Label>
            </g>
          ))}
          {t > st(S, 4) && (
            <g opacity={ap(t, st(S, 4))}>
              <rect x={cx(3) - 115} y={660} width={230} height={240} rx={16} fill="none" stroke={C.amber} strokeWidth={4} filter="url(#glow)" />
              <Label x={cx(3) + 130} y={700} c={C.amber} s={26} anchor="start">Best PEEP 14</Label>
            </g>
          )}
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

// ===================== 17. ARDS: oxy & CO2 =====================
const S17: React.FC<P> = ({S}) => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Header num="17" title="Trạm 6 · Oxy và CO₂" t={t} />
      <RM cur={5} t={t} />
      <Glass x={80} y={150} w={860} h={230} a={ap(t, st(S, 0))} border={C.oxy} />
      <Range x={120} y={175} w={780} lo={80} hi={100} a0={88} a1={95} c={C.oxy} a={ap(t, st(S, 0) + 0.5)} ticks={[80, 88, 95, 100]} label="SpO₂ 88–95%" />
      <div style={{position: 'absolute', left: 120, top: 300, fontFamily: FONT, fontSize: 28, fontWeight: 600, color: C.txt, opacity: ap(t, st(S, 0) + 2)}}>hoặc PaO₂ 55–80 mmHg</div>
      <Glass x={980} y={150} w={860} h={230} a={ap(t, st(S, 1))} border={C.red}>
        <div style={{fontSize: 28, fontWeight: 800, color: C.red}}>Ngộ độc oxy</div>
        <div style={{fontSize: 46, fontWeight: 800, marginTop: 18}}>FiO₂ ≥ 60% × &gt; 24 giờ</div>
      </Glass>
      <Glass x={80} y={405} w={1760} h={200} a={ap(t, st(S, 2))} border={C.amber}>
        <div style={{fontSize: 28, fontWeight: 800, color: C.amber}}>Tăng CO₂ cho phép · bảo vệ phổi</div>
      </Glass>
      <Range x={120} y={460} w={1680} lo={7.1} hi={7.45} a0={7.2} a1={7.45} c={C.amber} a={ap(t, st(S, 2) + 1)} ticks={[7.1, 7.2, 7.25, 7.35, 7.45]} label="chấp nhận pH ≥ 7,20–7,25" />
      <Chip x={80} y={630} w={860} h={100} c={C.violet} a={ap(t, st(S, 3))} s={26}>CO₂ ↑ → BN trigger nhiều → an thần / giãn cơ</Chip>
      <Chip x={980} y={630} w={860} h={100} c={C.red} a={ap(t, st(S, 3) + 3)} s={26}>pH &lt; 7,2: ↑ tần số (tránh bẫy khí) · bù bicarbonate</Chip>
      <Memo x={360} y={760} w={1200} h={135} t={t} s0={st(S, 4)} size={60}>ARDS: 6 · 30 · 88</Memo>
    </AbsoluteFill>
  );
};

// ===================== 18. Ôn tập =====================
const S18: React.FC<P> = ({S}) => {
  const t = useT();
  const items: [string, string, number][] = [
    ['NHÓM', 'Bình thường · CỨNG → nhanh · TẮC → chậm', 0],
    ['MỔ', 'Mốc 60: dưới chỉnh FiO₂, trên tăng PEEP · cai khi FiO₂ ≤ 40%, PEEP ≤ 5', 0],
    ['TIM', 'A/C · f > 15 · PEEP 5–10 là bạn của tim trái', 1],
    ['NÃO', 'CO₂ 35–45 · O₂ ≥ 70 · đầu cao · chỉnh bằng tần số', 1],
    ['COPD·HEN', 'NIV trước · chậm, thở ra dài · PEEP ngoài < auto-PEEP', 2],
    ['ARDS', '6 · 30 · 88 · PEEP theo bảng / compliance tốt nhất', 3],
  ];
  return (
    <AbsoluteFill>
      <Header num="18" title="Ôn tập 6 trạm" t={t} />
      <RM cur="all" t={t} />
      {items.map(([h, d, j], i) => (
        <Glass key={i} x={80 + (i % 3) * 595} y={150 + Math.floor(i / 3) * 280} w={570} h={260} a={ap(t, st(S, j) + (i % 2) * 1.5)} border={STN_COL[i]} pad={24}>
          <div style={{fontSize: 36, fontWeight: 800, color: STN_COL[i]}}>{i + 1}. {h}</div>
          <div style={{fontSize: 27, fontWeight: 500, lineHeight: 1.4, marginTop: 10}}>{d}</div>
        </Glass>
      ))}
      <Memo x={260} y={735} w={1400} h={150} t={t} s0={st(S, 3) + 3} size={46}>CỨNG → NHANH · TẮC → CHẬM · ARDS 6–30–88</Memo>
    </AbsoluteFill>
  );
};

export const SCENES = [S0, S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18];
void lerp; void fPC; void psBreath; void Badge; void geo; void Circuit; void Big;
