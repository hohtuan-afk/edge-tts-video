import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ap, sp, useT, lerp, C, FONT, STN_COL, Glass, Chip, Memo, Header, Roadmap, Defs, Badge, Label, geo, Circuit} from './lib';

// ================= Bài: Cài đặt các mode thở cơ bản =================
type P = {S: number[]};
const ST = ['CƠ BẢN', 'VC', 'PC', 'PRVC', 'PS', 'SIMV', 'BIVENT'];
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

// ===================== 0. Tiêu đề =====================
const S0: React.FC<P> = () => {
  const t = useT();
  const k = sp(t, 0.5, 12);
  return (
    <AbsoluteFill>
      <Svg>
        <Wave x={160} y={170} w={1600} h={280} f={(s) => pPC(s, {T: 3, ti: 1, pi: 18})} lo={0} hi={26} span={9} color={C.insp} t={t} t0={0} speed={1.6} fill base={0} />
      </Svg>
      <div style={{position: 'absolute', top: 540, width: '100%', textAlign: 'center', opacity: Math.min(1, k * 1.3), transform: `scale(${0.9 + 0.1 * k})`}}>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 104, letterSpacing: -2, lineHeight: 1.05, background: 'linear-gradient(180deg, #FFFFFF, #B9CBE6)', WebkitBackgroundClip: 'text', color: 'transparent'}}>
          CÀI ĐẶT MODE THỞ CƠ BẢN
        </div>
      </div>
      <div style={{position: 'absolute', top: 690, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 40, color: C.amber, opacity: ap(t, 1.2)}}>
        Máy thở Servo-c · bệnh nhân nhi · hành trình 7 trạm
      </div>
      <div style={{position: 'absolute', top: 770, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 400, fontSize: 24, color: C.muted, opacity: ap(t, 1.8)}}>
        Theo bài giảng BS. Đặng Thanh Tuấn – BV Nhi Đồng 1 (03/2026)
      </div>
    </AbsoluteFill>
  );
};

// ===================== 1. Bế – Dắt – Tự đi =====================
const S1: React.FC<P> = ({S}) => {
  const t = useT();
  const cards = [
    {w: 'BẾ', c: C.amber, d: 'A/C · máy làm gần như tất cả'},
    {w: 'DẮT', c: C.blue, d: 'SIMV · PS · máy dắt từng bước'},
    {w: 'TỰ ĐI', c: C.oxy, d: 'CPAP · bệnh nhân tự thở'},
  ];
  const steps = [
    {m: 'A/C', p: '0%', c: C.amber},
    {m: 'SIMV', p: '20%', c: C.blue},
    {m: 'PSV', p: '80%', c: C.insp},
    {m: 'Rút NKQ', p: '100%', c: C.oxy},
  ];
  const a2 = ap(t, st(S, 2));
  return (
    <AbsoluteFill>
      <Header num="01" title="Bức tranh tổng" t={t} />
      <div style={{opacity: ap(t, st(S, 3))}}><RM cur="all" t={t} /></div>
      {cards.map((k, i) => {
        const a = ap(t, st(S, 0) + 0.7 * i);
        const ad = ap(t, st(S, 1) + 1.6 * i);
        return (
          <Glass key={i} x={80 + i * 610} y={150} w={540} h={260} a={a} border={k.c}>
            <div style={{fontSize: 76, fontWeight: 800, color: k.c, textAlign: 'center', lineHeight: 1.1, textShadow: `0 0 30px ${k.c}66`}}>{k.w}</div>
            <div style={{fontSize: 28, fontWeight: 600, textAlign: 'center', marginTop: 22, opacity: ad}}>{k.d}</div>
          </Glass>
        );
      })}
      <Svg>
        <g opacity={a2}>
          <text x={160} y={480} fill={C.muted} fontFamily={FONT} fontWeight={700} fontSize={26}>Thang tự thở — lực tự thở của bệnh nhân tăng dần</text>
          {steps.map((s, i) => {
            const k = sp(t, st(S, 2) + 0.9 * i);
            const hh = (80 + i * 70) * k;
            const x = 160 + i * 410;
            return (
              <g key={i} opacity={Math.min(1, k * 1.5)}>
                <rect x={x} y={780 - hh} width={370} height={hh} rx={14} fill={s.c} opacity={0.25} />
                <rect x={x} y={780 - hh} width={370} height={hh} rx={14} fill="none" stroke={s.c} strokeWidth={3} />
                <text x={x + 185} y={780 - hh - 16} textAnchor="middle" fill={s.c} fontFamily={FONT} fontWeight={800} fontSize={46}>{s.p}</text>
                <text x={x + 185} y={768} textAnchor="middle" fill={C.txt} fontFamily={FONT} fontWeight={800} fontSize={30}>{s.m}</text>
              </g>
            );
          })}
        </g>
      </Svg>
      {ST.map((s, i) => (
        <Chip key={i} x={113 + i * 244} y={812} w={230} h={64} c={STN_COL[i]} a={ap(t, st(S, 3) + 0.35 * i)} s={26} bold>
          {i + 1}. {s}
        </Chip>
      ))}
    </AbsoluteFill>
  );
};

// ===================== 2. FiO2 + PEEP =====================
const S2: React.FC<P> = ({S}) => {
  const t = useT();
  const items = [['FiO₂', C.oxy], ['PEEP', C.violet], ['Trigger', C.amber], ['Tần số', C.blue], ['I:E', C.insp]] as const;
  const a1 = ap(t, st(S, 1)), a2 = ap(t, st(S, 2)), a3 = ap(t, st(S, 3));
  const W = 620;
  const pct = (v: number) => ((v - 21) / 79) * W;
  const pa = (v: number) => ((v - 40) / 80) * W;
  const br = (base: number, amp: number) => base + amp * (0.5 + 0.5 * Math.cos((2 * Math.PI * t) / 3));
  return (
    <AbsoluteFill>
      <Header num="02" title="Trạm 1 · FiO₂ và PEEP" t={t} />
      <RM cur={0} t={t} />
      {items.map(([n, c], i) => (
        <Chip key={i} x={80} y={170 + i * 92} w={300} h={70} c={c} a={ap(t, st(S, 0) + 0.45 * i) * (i < 2 || t < st(S, 1) ? 1 : 0.45)} s={30} bold>{n}</Chip>
      ))}
      <Card x={430} y={160} w={690} h={340} a={a1} c={C.oxy} title="FiO₂ ban đầu">
        <div style={{position: 'relative', height: 120, marginTop: 6}}>
          <div style={{position: 'absolute', left: 0, top: 46, width: W, height: 26, borderRadius: 13, background: 'linear-gradient(90deg,#1E3A5F,#4ADE80)'}} />
          <div style={{position: 'absolute', left: pct(30), top: 36, width: pct(40) - pct(30), height: 46, borderRadius: 10, border: `3px solid ${C.amber}`, boxShadow: `0 0 18px ${C.amber}88`}} />
          <div style={{position: 'absolute', left: pct(30) - 60, top: 0, fontSize: 24, fontWeight: 800, color: C.amber}}>Bệnh ổn 30–40%</div>
          <div style={{position: 'absolute', left: W - 26, top: 34, width: 26, height: 50, borderRadius: 8, background: C.red, boxShadow: `0 0 18px ${C.red}`}} />
          <div style={{position: 'absolute', right: 0, top: 0, fontSize: 24, fontWeight: 800, color: C.red}}>Nặng 100%</div>
          <div style={{position: 'absolute', left: 0, top: 86, fontSize: 22, color: C.muted}}>21%</div>
        </div>
        <div>Chỉnh để <B c={C.oxy}>SpO₂ ≈ 95%</B></div>
        <div>Khí máu lại sau <B>15–30 phút</B></div>
      </Card>
      <Card x={1150} y={160} w={690} h={340} a={a2} c={C.blue} title="Mục tiêu PaO₂ (mmHg)">
        {[['Phổi bình thường', 80, 100, C.oxy], ['ARDS', 60, 90, C.amber]].map(([n, lo, hi, c], i) => (
          <div key={i} style={{position: 'relative', height: 92}}>
            <div style={{fontSize: 24, fontWeight: 700, color: c as string}}>{n} · {lo}–{hi}</div>
            <div style={{position: 'absolute', left: 0, top: 44, width: W, height: 10, borderRadius: 5, background: 'rgba(148,170,205,0.2)'}} />
            <div style={{position: 'absolute', left: pa(lo as number), top: 36, width: (pa(hi as number) - pa(lo as number)) * ap(t, st(S, 2) + 0.5 + i * 1.2), height: 26, borderRadius: 13, background: c as string, boxShadow: `0 0 16px ${c}`}} />
          </div>
        ))}
        <div style={{position: 'relative', height: 30, fontSize: 20, color: C.muted}}>
          {[40, 60, 80, 100, 120].map((v) => <span key={v} style={{position: 'absolute', left: pa(v) - 14}}>{v}</span>)}
        </div>
      </Card>
      <Glass x={430} y={530} w={1410} h={360} a={a3} border={C.violet}>
        <div style={{fontWeight: 800, fontSize: 28, color: C.violet}}>PEEP giữ phế nang không xẹp cuối thì thở ra</div>
      </Glass>
      <Svg>
        <g opacity={a3}>
          {[{cx: 600, r: br(18, 52), l: 'Không PEEP', c: C.red}, {cx: 880, r: br(48, 24), l: 'Có PEEP', c: C.oxy}].map((o, i) => (
            <g key={i}>
              <line x1={o.cx} y1={600} x2={o.cx} y2={720 - o.r} stroke="#C9D6EA" strokeWidth={10} strokeLinecap="round" />
              <circle cx={o.cx} cy={720} r={o.r} fill="url(#lung)" stroke="#FFD1DC" strokeWidth={2} />
              <Label x={o.cx} y={850} c={o.c} s={26}>{o.l}</Label>
            </g>
          ))}
        </g>
      </Svg>
      <Chip x={1060} y={630} w={740} h={80} c={C.oxy} a={ap(t, st(S, 3) + 0.8)} s={28}>Phổi bình thường: <b>&nbsp;5 cmH₂O</b></Chip>
      <Chip x={1060} y={740} w={740} h={110} c={C.violet} a={ap(t, st(S, 3) + 2.5)} s={28}>Viêm phổi · phù phổi · ARDS: <b>&nbsp;8–10 cmH₂O</b></Chip>
    </AbsoluteFill>
  );
};

// ===================== 3. Trigger =====================
const S3: React.FC<P> = ({S}) => {
  const t = useT();
  const t0 = st(S, 0) + 0.3;
  const trig = (s: number) => {
    const q = ph(s, 5);
    if (q < 1.4) return 5;
    if (q < 2.0) return 5 - 2.4 * ((q - 1.4) / 0.6);
    if (q < 3.1) return 2.6 + (9.5 - 2.6) * (1 - ex(-(q - 2.0) / 0.08));
    return 5 + 4.5 * ex(-(q - 3.1) / 0.2);
  };
  const cur = ph(t - t0, 5);
  const fl = t > t0 + 1.9 && cur > 1.9 && cur < 2.8;
  const g = geo(1010, 230, 800, 320);
  const breath = ph(t - st(S, 2), 4);
  const insp = breath > 1.5 && breath < 2.6;
  const bVal = insp ? 8 : 10;
  const Y = (v: number) => yv(250, 290, 0, 11, v);
  return (
    <AbsoluteFill>
      <Header num="03" title="Trạm 1 · Trigger" t={t} />
      <RM cur={0} t={t} />
      <Card x={80} y={150} w={860} h={430} a={ap(t, st(S, 0))} c={C.amber} title="Trigger ÁP LỰC" />
      <Card x={980} y={150} w={860} h={430} a={ap(t, st(S, 2))} c={C.insp} title="Trigger LƯU LƯỢNG" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <line x1={120} x2={900} y1={Y(5)} y2={Y(5)} stroke={C.violet} strokeWidth={2} strokeDasharray="10 8" />
          <Label x={130} y={Y(5) - 12} c={C.violet} s={24} anchor="start">PEEP +5</Label>
          <g opacity={ap(t, st(S, 1))}>
            <line x1={120} x2={900} y1={Y(3)} y2={Y(3)} stroke={C.amber} strokeWidth={3} strokeDasharray="10 8" />
            <Label x={130} y={Y(3) + 34} c={C.amber} s={24} anchor="start">ngưỡng +3 (độ nhạy −2)</Label>
          </g>
          <Wave x={120} y={250} w={780} h={290} f={trig} lo={0} hi={11} span={5} color={C.insp} t={t} t0={t0} />
          {fl && <Label x={120 + (2.0 / 5) * 780} y={Y(1.2)} c={C.red} s={30}>KÍCH HOẠT!</Label>}
        </g>
        <g opacity={ap(t, st(S, 2))}>
          <Circuit g={g} t={t} tw={14} flow={0.9} screen={false} label="MÁY" />
          <Label x={g.ci[0] - 70} y={g.ci[1] + 50} c={C.insp} s={26}>A (hít vào) = 10</Label>
          <Label x={g.ce[0] - 70} y={g.ce[1] - 30} c={insp ? C.red : C.exp} s={26}>B (thở ra) = {bVal}</Label>
          {insp && <Label x={1430} y={540} c={C.red} s={28}>A − B = 2 → KÍCH HOẠT</Label>}
        </g>
      </Svg>
      <Chip x={80} y={610} w={860} h={84} c={C.amber} a={ap(t, st(S, 3))} s={27}>Áp lực: −2 cmH₂O (trẻ em, người lớn)</Chip>
      <Chip x={980} y={610} w={860} h={84} c={C.insp} a={ap(t, st(S, 3) + 1.5)} s={27}>Lưu lượng: SS 0,5–1 · TE 1–2 · NL 2–3 L/ph</Chip>
      <Memo x={410} y={740} w={1100} h={140} t={t} s0={st(S, 4)} size={44}>Trẻ nhỏ → trigger LƯU LƯỢNG</Memo>
    </AbsoluteFill>
  );
};

// ===================== 4. Control vs Assist, TCT =====================
const S4: React.FC<P> = ({S}) => {
  const t = useT();
  const ctrl = (s: number) => pPC(s, {T: 3, ti: 1, pi: 15});
  const trigs = [2.2, 4.7, 7.1, 9.6];
  const assist = (s: number) => {
    let last = -99;
    for (const k of trigs) if (s >= k) last = k;
    const nxt = trigs.find((k) => k > s) ?? 99;
    if (nxt - s < 0.35) return 5 - 2.5 * (1 - (nxt - s) / 0.35);
    const q = s - last;
    if (q < 0 || last < 0) return 5;
    if (q < 1) return 5 + 15 * (1 - ex(-q / 0.08));
    return 5 + 15 * ex(-(q - 1) / 0.22);
  };
  const tc = [['15', '4 s'], ['20', '3 s'], ['30', '2 s'], ['60', '1 s']];
  return (
    <AbsoluteFill>
      <Header num="04" title="Trạm 1 · Nhịp máy, nhịp BN" t={t} />
      <RM cur={0} t={t} />
      <Card x={80} y={150} w={1760} h={230} a={ap(t, st(S, 0))} c={C.amber} title={<>CONTROL · máy kích hoạt theo THỜI GIAN → tần số <B c={C.txt}>CỐ ĐỊNH</B></>} />
      <Card x={80} y={400} w={1760} h={230} a={ap(t, st(S, 1))} c={C.oxy} title={<>ASSIST · BN kích hoạt sớm hơn → tần số cài là <B c={C.txt}>TỐI THIỂU</B></>} />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          {[0, 3, 6, 9].map((k) => (
            <g key={k}>
              <line x1={120 + (k / 12) * 1680} x2={120 + (k / 12) * 1680} y1={215} y2={365} stroke={C.amber} strokeWidth={2} strokeDasharray="6 6" opacity={0.7} />
              <path d={`M${120 + (k / 12) * 1680 - 9},${212} l9,12 l9,-12 z`} fill={C.amber} />
            </g>
          ))}
          <Wave x={120} y={225} w={1680} h={140} f={ctrl} lo={0} hi={22} span={12} color={C.amber} t={t} t0={st(S, 0)} speed={1.4} base={0} fill />
        </g>
        <g opacity={ap(t, st(S, 1))}>
          {[3, 6, 9].map((k) => (
            <line key={k} x1={120 + (k / 12) * 1680} x2={120 + (k / 12) * 1680} y1={465} y2={615} stroke={C.amber} strokeWidth={2} strokeDasharray="6 6" opacity={0.5} />
          ))}
          {trigs.map((k, i) => (
            <Label key={i} x={120 + (k / 12) * 1680} y={612} c={C.oxy} s={22} a={ap(t, st(S, 1) + k / 1.4)}>BN</Label>
          ))}
          <Wave x={120} y={470} w={1680} h={120} f={assist} lo={0} hi={22} span={12} color={C.oxy} t={t} t0={st(S, 1)} speed={1.4} base={0} fill />
        </g>
      </Svg>
      <Glass x={80} y={660} w={1760} h={230} a={ap(t, st(S, 2))} border={C.blue}>
        <div style={{display: 'flex', alignItems: 'center', height: '100%'}}>
          <div style={{fontSize: 58, fontWeight: 800, width: 640}}>
            TCT = <span style={{color: C.blue}}>60 / tần số</span>
            <div style={{fontSize: 24, color: C.muted, fontWeight: 500}}>thời gian 1 chu kỳ thở</div>
          </div>
        </div>
      </Glass>
      {tc.map(([f, s], i) => (
        <Chip key={i} x={760 + i * 270} y={735} w={250} h={80} c={C.blue} a={ap(t, st(S, 2) + 2 + 0.9 * i)} s={32} bold>{f} → {s}</Chip>
      ))}
    </AbsoluteFill>
  );
};

// ===================== 5. Bảng theo tuổi =====================
const S5: React.FC<P> = ({S}) => {
  const t = useT();
  const rows = [
    ['Sơ sinh đủ tháng', 40, '1,5 s', '0,5 s', 1.5],
    ['Nhũ nhi', 30, '2 s', '0,67 s', 2],
    ['Trẻ nhỏ', 25, '2,4 s', '0,8 s', 2.4],
    ['Trẻ em', 20, '3 s', '1 s', 3],
    ['Trẻ lớn, người lớn', 15, '4 s', '1,33 s', 4],
  ] as const;
  const when = [st(S, 0) + 1.2, st(S, 1), st(S, 1) + 2.4, st(S, 2), st(S, 2) + 2];
  const cols = [120, 520, 720, 900];
  return (
    <AbsoluteFill>
      <Header num="05" title="Trạm 1 · Tần số theo tuổi" t={t} />
      <RM cur={0} t={t} />
      <Glass x={80} y={150} w={1760} h={620} a={ap(t, st(S, 0))} border={C.blue} />
      <div style={{opacity: ap(t, st(S, 0)), fontFamily: FONT, fontWeight: 800, fontSize: 26, color: C.muted}}>
        {['Tuổi', 'Tần số', 'TCT', 'Ti'].map((h, i) => <div key={i} style={{position: 'absolute', left: cols[i], top: 180}}>{h}</div>)}
        <div style={{position: 'absolute', left: 1100, top: 180}}><span style={{color: C.insp}}>■ hít vào</span>&nbsp;&nbsp;<span style={{color: C.exp}}>■ thở ra</span>&nbsp;&nbsp;(I:E 1:2)</div>
      </div>
      {rows.map((r, i) => {
        const a = ap(t, when[i]);
        const k = ap(t, when[i] + 0.3, 1.2);
        const W = 160 * (r[4] as number) * k;
        const cur = ph(t * 1.0, r[4] as number) / (r[4] as number);
        return (
          <div key={i} style={{position: 'absolute', left: 0, top: 235 + i * 105, opacity: a, transform: `translateX(${(1 - a) * 30}px)`, fontFamily: FONT, color: C.txt}}>
            <div style={{position: 'absolute', left: 100, top: -14, width: 1720, height: 88, borderRadius: 16, background: i % 2 ? 'rgba(255,255,255,0.03)' : 'rgba(96,165,250,0.07)'}} />
            <div style={{position: 'absolute', left: cols[0], top: 8, fontSize: 30, fontWeight: 700, whiteSpace: 'nowrap'}}>{r[0]}</div>
            <div style={{position: 'absolute', left: cols[1], top: 0, fontSize: 42, fontWeight: 800, color: C.blue}}>{r[1]}</div>
            <div style={{position: 'absolute', left: cols[2], top: 8, fontSize: 30, fontWeight: 600, whiteSpace: 'nowrap'}}>{r[2]}</div>
            <div style={{position: 'absolute', left: cols[3], top: 0, fontSize: 40, fontWeight: 800, color: C.insp, whiteSpace: 'nowrap'}}>{r[3]}</div>
            <div style={{position: 'absolute', left: 1100, top: 14, width: W, height: 34, borderRadius: 10, overflow: 'hidden', display: 'flex'}}>
              <div style={{width: '33.3%', background: C.insp}} />
              <div style={{flex: 1, background: C.exp, opacity: 0.8}} />
            </div>
            {k > 0.99 && <div style={{position: 'absolute', left: 1100 + W * cur - 3, top: 6, width: 6, height: 50, borderRadius: 3, background: '#fff', boxShadow: '0 0 12px #fff'}} />}
          </div>
        );
      })}
      <Memo x={460} y={795} w={1000} h={110} t={t} s0={st(S, 3)} size={44}>Ti = TCT ÷ 3 (I:E 1:2)</Memo>
    </AbsoluteFill>
  );
};

// ===================== 6. Hằng số thời gian =====================
const IE: React.FC<{r: number; t: number; w?: number}> = ({r, t, w = 480}) => {
  const T = 2.4 + r * 0.6;
  const cur = ph(t, T) / T;
  return (
    <div style={{position: 'relative', width: w, height: 40, marginTop: 14}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 10, overflow: 'hidden', display: 'flex'}}>
        <div style={{width: `${100 / (1 + r)}%`, background: C.insp}} />
        <div style={{flex: 1, background: C.exp, opacity: 0.8}} />
      </div>
      <div style={{position: 'absolute', left: w * cur - 3, top: -6, width: 6, height: 52, borderRadius: 3, background: '#fff', boxShadow: '0 0 12px #fff'}} />
    </div>
  );
};
const S6: React.FC<P> = ({S}) => {
  const t = useT();
  const cards = [
    {c: C.red, h: 'TẮC NGHẼN', s: 'hen, COPD', r: 3.5, l: [<><B c={C.red}>R↑</B> → τ DÀI</>, <>Tần số <B c={C.red}>↓</B></>, <>I:E <B>1:3 – 1:4</B></>, 'Thở ra đủ lâu, tránh bẫy khí']},
    {c: C.blue, h: 'TỔN THƯƠNG PHẾ NANG', s: 'viêm phổi, ARDS', r: 1.25, l: [<><B c={C.blue}>C↓</B> → τ NGẮN</>, <>Tần số <B c={C.blue}>↑</B></>, <>I:E <B>1:1,5 – 1:1</B></>, 'Kèm PEEP chống xẹp']},
    {c: C.oxy, h: 'PHỔI BÌNH THƯỜNG', s: 'TKTW, TK cơ, ngộ độc, hậu phẫu', r: 2, l: [<>I:E <B>1:2</B></>]},
  ];
  return (
    <AbsoluteFill>
      <Header num="06" title="Trạm 1 · Hằng số thời gian" t={t} />
      <RM cur={0} t={t} />
      <Big x={80} y={145} a={ap(t, st(S, 0))} s={78}>τ = <span style={{color: C.amber}}>R</span> × <span style={{color: C.insp}}>C</span></Big>
      <Big x={80} y={240} a={ap(t, st(S, 0) + 0.8)} s={26} c={C.muted}>sức cản × độ giãn nở</Big>
      {cards.map((k, i) => (
        <Glass key={i} x={80 + i * 600} y={300} w={560} h={430} a={ap(t, st(S, i + 1))} border={k.c}>
          <div style={{fontSize: 30, fontWeight: 800, color: k.c}}>{k.h}</div>
          <div style={{fontSize: 23, color: C.muted, marginBottom: 6}}>{k.s}</div>
          <IE r={k.r} t={t} />
          <div style={{fontSize: 28, lineHeight: 1.5, marginTop: 18, fontWeight: 500}}>
            {k.l.map((x, j) => <div key={j} style={{opacity: ap(t, st(S, i + 1) + 0.6 + j * 0.8)}}>{x}</div>)}
          </div>
        </Glass>
      ))}
      <Memo x={310} y={765} w={1300} h={125} t={t} s0={st(S, 4)} size={44}>HEN thở ra dài · ARDS hít vào dài</Memo>
    </AbsoluteFill>
  );
};

// ===================== 7. VC =====================
const S7: React.FC<P> = ({S}) => {
  const t = useT();
  const o = {T: 3, ti: 1, pause: 0.3, pk: 26, pl: 19};
  return (
    <AbsoluteFill>
      <Header num="07" title="Trạm 2 · VC thể tích" t={t} />
      <RM cur={1} t={t} />
      <Card x={80} y={150} w={960} h={740} a={ap(t, st(S, 0))} c={C.blue} title="A/C – VC: máy giữ VT cố định" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <Label x={120} y={265} c={C.amber} s={24} anchor="start">Áp lực</Label>
          <Wave x={120} y={280} w={880} h={220} f={(s) => pVC(s, o)} lo={0} hi={30} span={6} color={C.amber} t={t} t0={st(S, 0)} base={0} fill />
          <Label x={120} y={565} c={C.insp} s={24} anchor="start">Lưu lượng (vuông)</Label>
          <Wave x={120} y={580} w={880} h={260} f={(s) => fVC(s, o)} lo={-1} hi={1} span={6} color={C.insp} t={t} t0={st(S, 0)} base={0} fill />
        </g>
      </Svg>
      <Card x={1080} y={150} w={760} h={270} a={ap(t, st(S, 1))} c={C.oxy} title="VT theo cân nặng dự đoán (PBW)" size={30}>
        <div><B c={C.oxy}>8 mL/kg</B> · phổi bình thường</div>
        <div style={{opacity: ap(t, st(S, 1) + 2)}}><B c={C.amber}>6 mL/kg</B> · R↑ hoặc C↓</div>
      </Card>
      <Card x={1080} y={445} w={760} h={240} a={ap(t, st(S, 2))} c={C.blue} title="MV = tần số × VT" size={30}>
        <div style={{fontSize: 44, fontWeight: 800}}>15 × 0,4 L = <span style={{color: C.blue}}>6 L/ph</span></div>
        <div style={{color: C.muted, fontSize: 26}}>Trẻ &gt; 30 kg ≈ 0,1 L/kg/phút</div>
      </Card>
      <Card x={1080} y={710} w={760} h={180} a={ap(t, st(S, 3))} c={C.insp} title="Tuỳ chọn thêm" size={28}>
        <div>Dạng lưu lượng: <B c={C.insp}>vuông / giảm dần</B> · <B c={C.insp}>pause</B></div>
      </Card>
    </AbsoluteFill>
  );
};

// ===================== 8. Pause & Pplat =====================
const S8: React.FC<P> = ({S}) => {
  const t = useT();
  const o = {T: 3, ti: 1, pause: 0.3, pk: 25, pl: 17};
  const Y = (v: number) => yv(230, 300, 0, 30, v);
  const groups = [
    {n: 'Bình thường', pk: 20, pl: 15, s: st(S, 0) + 1},
    {n: 'R↑ sức cản', pk: 32, pl: 15, s: st(S, 1)},
    {n: 'C↓ độ giãn nở', pk: 32, pl: 27, s: st(S, 2)},
  ];
  const H = (v: number) => (v / 35) * 290;
  return (
    <AbsoluteFill>
      <Header num="08" title="Trạm 2 · Pause và Pplat" t={t} />
      <RM cur={1} t={t} />
      <Card x={80} y={150} w={960} h={430} a={ap(t, st(S, 0))} c={C.amber} title="Pause 10% chu kỳ → đo Pplat" />
      <Card x={1080} y={150} w={760} h={430} a={ap(t, st(S, 0) + 0.8)} c={C.blue} title={<><span style={{color: C.amber}}>■ Ppeak</span>&nbsp;&nbsp;<span style={{color: C.insp}}>■ Pplat</span></>} />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <line x1={120} x2={1000} y1={Y(25)} y2={Y(25)} stroke={C.amber} strokeWidth={2} strokeDasharray="8 8" />
          <line x1={120} x2={1000} y1={Y(17)} y2={Y(17)} stroke={C.insp} strokeWidth={2} strokeDasharray="8 8" />
          <Wave x={120} y={230} w={880} h={300} f={(s) => pVC(s, o)} lo={0} hi={30} span={6} color={C.txt} t={t} t0={st(S, 0)} base={0} fill />
          <Label x={990} y={Y(25) - 10} c={C.amber} s={26} anchor="end">Ppeak</Label>
          <Label x={990} y={Y(17) - 10} c={C.insp} s={26} anchor="end">Pplat</Label>
        </g>
        {groups.map((g, i) => {
          const k = sp(t, g.s);
          const x = 1140 + i * 240;
          return (
            <g key={i} opacity={Math.min(1, k * 1.5)}>
              <rect x={x} y={520 - H(g.pk) * k} width={80} height={H(g.pk) * k} rx={8} fill={C.amber} />
              <rect x={x + 92} y={520 - H(g.pl) * k} width={80} height={H(g.pl) * k} rx={8} fill={C.insp} />
              <Label x={x + 86} y={558} s={23}>{g.n}</Label>
            </g>
          );
        })}
      </Svg>
      <Chip x={80} y={610} w={380} h={84} c={C.red} a={ap(t, st(S, 3))} s={26} bold>Không cài pause khi</Chip>
      {['Tụt huyết áp', 'Tăng áp lực nội sọ', 'Tràn khí màng phổi'].map((x, i) => (
        <Chip key={i} x={490 + i * 455} y={610} w={430} h={84} c={C.red} a={ap(t, st(S, 3) + 0.8 + i * 0.8)} s={27}>{x}</Chip>
      ))}
      <Memo x={210} y={745} w={1500} h={145} t={t} s0={st(S, 4)} size={40}>Đỉnh đi MỘT MÌNH → sức cản · CÙNG ĐI → độ giãn nở</Memo>
    </AbsoluteFill>
  );
};

// ===================== 9. Dạng lưu lượng, ưu khuyết VC =====================
const S9: React.FC<P> = ({S}) => {
  const t = useT();
  const k = ap(t, st(S, 0) + 0.5, 1.5);
  const box = (x0: number, dec: boolean) => {
    const x1 = x0 + 700 * k, base = 440, top = 250;
    const xm = x0 + 350;
    const fy = (x: number) => (dec ? base - (base - top) * (1 - 0.95 * ((x - x0) / 700)) : top);
    const pts: string[] = [];
    for (let x = x0; x <= x1; x += 10) pts.push(`${x},${fy(x)}`);
    const half: string[] = [];
    for (let x = x0; x <= Math.min(xm, x1); x += 10) half.push(`${x},${fy(x)}`);
    return (
      <g>
        <polygon points={`${x0},${base} ${pts.join(' ')} ${x1},${base}`} fill={C.insp} opacity={0.14} />
        {k > 0.5 && <polygon points={`${x0},${base} ${half.join(' ')} ${Math.min(xm, x1)},${base}`} fill={C.insp} opacity={0.35} />}
        <polyline points={pts.join(' ')} fill="none" stroke={C.insp} strokeWidth={5} filter="url(#glow)" />
        <line x1={x0} x2={x0 + 700} y1={base} y2={base} stroke="rgba(148,170,205,0.4)" strokeWidth={2} />
        <line x1={xm} x2={xm} y1={top - 20} y2={base} stroke={C.muted} strokeWidth={2} strokeDasharray="6 6" />
        <Label x={x0 + 175} y={base - 30} c={C.txt} s={36} a={ap(t, st(S, 0) + 2)}>{dec ? '> 75% VT' : '50% VT'}</Label>
        <Label x={xm} y={base + 32} c={C.muted} s={22}>½ Ti</Label>
      </g>
    );
  };
  return (
    <AbsoluteFill>
      <Header num="09" title="Trạm 2 · Dạng lưu lượng" t={t} />
      <RM cur={1} t={t} />
      <Card x={80} y={150} w={860} h={340} a={ap(t, st(S, 0))} c={C.muted} title="Lưu lượng VUÔNG" />
      <Card x={980} y={150} w={860} h={340} a={ap(t, st(S, 0))} c={C.insp} title="Lưu lượng GIẢM DẦN" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          {box(160, false)}
          {box(1060, true)}
        </g>
      </Svg>
      <Chip x={80} y={510} w={1760} h={70} c={C.insp} a={ap(t, st(S, 1))} s={27}>→ Áp lực TB cao hơn · khí phân bố đều → hợp COPD (cần lưu lượng đỉnh cao) và ARDS</Chip>
      <Card x={80} y={600} w={860} h={170} a={ap(t, st(S, 2))} c={C.oxy} title="VC · ƯU" size={26}>Quen, dễ dùng · đảm bảo VT và MV · kiểm soát PaCO₂</Card>
      <Card x={980} y={600} w={860} h={170} a={ap(t, st(S, 2) + 2.5)} c={C.red} title="VC · KHUYẾT" size={26}>Dễ mất đồng bộ · tăng công thở · chấn thương áp lực</Card>
      <Chip x={80} y={795} w={1760} h={90} c={C.blue} a={ap(t, st(S, 3))} s={28}>Trẻ em dùng VC: trẻ lớn bệnh TKTW, TK cơ · tăng áp lực nội sọ · hen</Chip>
    </AbsoluteFill>
  );
};

// ===================== 10. PC =====================
const S10: React.FC<P> = ({S}) => {
  const t = useT();
  const o = {T: 3, ti: 1, pi: 15, rise: 0.1};
  const sh = (s: number) => s - 0.3;
  const X = (s: number) => 120 + (s / 6) * 980;
  const Y = (v: number) => yv(230, 190, 0, 24, v);
  const a1 = (j: number) => ap(t, st(S, 1) + j * 1.3);
  const knobs = ['PEEP', 'Pi – mức áp lực hít vào', 'Ti – thời gian hít vào', 'Rise time – thời gian tăng áp'];
  return (
    <AbsoluteFill>
      <Header num="10" title="Trạm 3 · PC áp lực" t={t} />
      <RM cur={2} t={t} />
      <Card x={80} y={150} w={1060} h={520} a={ap(t, st(S, 0))} c={C.insp} title="Áp lực hằng định · lưu lượng giảm dần" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <Wave x={120} y={230} w={980} h={190} f={(s) => pPC(sh(s), o)} lo={0} hi={24} span={6} color={C.amber} t={t} t0={st(S, 0)} base={0} fill />
          <Wave x={120} y={450} w={980} h={200} f={(s) => fPC(sh(s), o)} lo={-1} hi={1} span={6} color={C.insp} t={t} t0={st(S, 0)} base={0} fill />
        </g>
        <g>
          <g opacity={a1(0)}><Badge x={X(2.6)} y={Y(5) - 26} n={1} c={C.violet} /></g>
          <g opacity={a1(1)}>
            <line x1={X(0.75)} x2={X(0.75)} y1={Y(5)} y2={Y(20)} stroke={C.oxy} strokeWidth={3} />
            <Badge x={X(0.75) + 30} y={Y(13)} n={2} c={C.oxy} />
          </g>
          <g opacity={a1(2)}>
            <line x1={X(0.3)} x2={X(1.3)} y1={Y(22.5)} y2={Y(22.5)} stroke={C.blue} strokeWidth={3} />
            <Badge x={X(0.8)} y={Y(22.5) - 4} n={3} c={C.blue} />
          </g>
          <g opacity={a1(3)}><Badge x={X(0.3) - 26} y={Y(14)} n={4} c={C.pink} /></g>
        </g>
      </Svg>
      {knobs.map((k, i) => (
        <Chip key={i} x={1180} y={160 + i * 76} w={660} h={64} c={[C.violet, C.oxy, C.blue, C.pink][i]} a={a1(i)} s={25}>{i + 1}. {k}</Chip>
      ))}
      <Card x={1180} y={480} w={660} h={190} a={ap(t, st(S, 2))} c={C.amber} title="VT thay đổi theo" size={26}>
        <div>ΔP · Ti · R · C · lực tự thở</div>
        <div style={{color: C.red, fontWeight: 800}}>R↑ hoặc C↓ → VT↓</div>
      </Card>
      <div style={{position: 'absolute', left: 80, top: 696, fontFamily: FONT, fontWeight: 800, fontSize: 28, color: C.amber, opacity: ap(t, st(S, 3))}}>Tìm mức PC ban đầu:</div>
      {['Mò dần theo VTE', 'Từ VC: PC = Pplat − PEEP', 'Từ PRVC: PC = Ppeak − PEEP'].map((x, i) => (
        <Chip key={i} x={80 + i * 595} y={745} w={570} h={90} c={C.insp} a={ap(t, st(S, 3) + 0.8 + i * 2)} s={28}>{x}</Chip>
      ))}
    </AbsoluteFill>
  );
};

// ===================== 11. VC vs PC =====================
const S11: React.FC<P> = ({S}) => {
  const t = useT();
  const pkA = [20, 24, 29, 33];
  const vcP = (s: number) => pVC(s, {T: 3, ti: 1, pk: pkA[Math.floor(s / 3) % 4], R: 5});
  const vtA = [1, 0.8, 0.6, 0.45];
  const pcV = (s: number) => {
    const q = ph(s, 3), A = vtA[Math.floor(s / 3) % 4];
    return q < 1 ? A * (1 - ex(-q / 0.3)) : A * (1 - ex(-1 / 0.3)) * ex(-(q - 1) / 0.25);
  };
  return (
    <AbsoluteFill>
      <Header num="11" title="Trạm 3 · So sánh VC – PC" t={t} />
      <RM cur={2} t={t} />
      <Card x={80} y={150} w={860} h={410} a={ap(t, st(S, 0))} c={C.blue} title={<>VC giữ THỂ TÍCH → nhìn <span style={{color: C.amber}}>ÁP LỰC</span></>} />
      <Card x={980} y={150} w={860} h={410} a={ap(t, st(S, 1))} c={C.insp} title={<>PC giữ ÁP LỰC → nhìn <span style={{color: C.oxy}}>THỂ TÍCH</span></>} />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <Wave x={120} y={250} w={780} h={260} f={vcP} lo={0} hi={36} span={12} color={C.amber} t={t} t0={st(S, 0)} speed={1.5} base={0} fill />
          <Label x={890} y={540} c={C.muted} s={22} anchor="end">C giảm dần → áp lực đỉnh tăng</Label>
        </g>
        <g opacity={ap(t, st(S, 1))}>
          <Wave x={1020} y={250} w={780} h={230} f={pcV} lo={0} hi={1.1} span={12} color={C.oxy} t={t} t0={st(S, 1)} speed={1.5} base={0} fill />
          <Label x={1790} y={540} c={C.muted} s={22} anchor="end">C giảm dần → VT giảm · cài báo động MV</Label>
        </g>
      </Svg>
      <Card x={80} y={585} w={860} h={170} a={ap(t, st(S, 2))} c={C.oxy} title="PC · ƯU" size={25}>Áp lực TB ↑ → oxy hoá ↑ · phân phối khí tốt · giảm công thở</Card>
      <Card x={980} y={585} w={860} h={170} a={ap(t, st(S, 2) + 3)} c={C.red} title="PC · KHUYẾT" size={25}>VT dao động → quá căng phế nang hoặc ứ CO₂</Card>
      <Memo x={210} y={780} w={1500} h={115} t={t} s0={st(S, 3)} size={38}>VC giữ thể tích, nhìn áp lực · PC giữ áp lực, nhìn thể tích</Memo>
    </AbsoluteFill>
  );
};

// ===================== 12. PRVC =====================
const S12: React.FC<P> = ({S}) => {
  const t = useT();
  const P = [10, 13, 16, 19, 21, 21, 19, 17];
  const V = [180, 240, 300, 360, 400, 400, 400, 400];
  const yP = (v: number) => yv(230, 210, 0, 34, v);
  const yV = (v: number) => yv(500, 210, 0, 460, v);
  return (
    <AbsoluteFill>
      <Header num="12" title="Trạm 4 · PRVC" t={t} />
      <RM cur={3} t={t} />
      <Card x={80} y={150} w={1200} h={590} a={ap(t, st(S, 0))} c={C.pink} title="Thở kiểu ÁP LỰC · đảm bảo THỂ TÍCH mục tiêu" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <Label x={120} y={250} c={C.amber} s={22} anchor="start">Áp lực</Label>
          <Label x={120} y={520} c={C.oxy} s={22} anchor="start">VT</Label>
          <line x1={200} x2={1240} y1={yV(400)} y2={yV(400)} stroke={C.oxy} strokeWidth={3} strokeDasharray="10 8" />
          <Label x={1240} y={yV(400) - 10} c={C.oxy} s={22} anchor="end">VT mục tiêu 400</Label>
          <g opacity={ap(t, st(S, 2))}>
            <line x1={200} x2={1240} y1={yP(30)} y2={yP(30)} stroke={C.red} strokeWidth={3} strokeDasharray="10 8" />
            <Label x={1240} y={yP(30) - 10} c={C.red} s={22} anchor="end">P giới hạn − 5</Label>
          </g>
        </g>
        {P.map((p, i) => {
          const k = sp(t, st(S, 1) + 0.9 + i * 0.75);
          const x = 230 + i * 128;
          return (
            <g key={i} opacity={Math.min(1, k * 1.5)}>
              <rect x={x} y={yP(p * k)} width={70} height={yP(0) - yP(p * k)} rx={8} fill={i === 0 ? C.muted : C.amber} />
              <Label x={x + 35} y={yP(p * k) - 8} s={22}>{p}</Label>
              <rect x={x} y={yV(V[i] * k)} width={70} height={yV(0) - yV(V[i] * k)} rx={8} fill={C.oxy} opacity={0.85} />
              {i > 0 && i < 5 && <Label x={x - 22} y={yP(P[i]) - 34} c={C.amber} s={20}>{P[i] - P[i - 1] > 0 ? '+' : ''}{P[i] - P[i - 1]}</Label>}
              {i === 0 && <Label x={x + 35} y={735} c={C.muted} s={20}>nhịp thử</Label>}
            </g>
          );
        })}
      </Svg>
      <Card x={1320} y={150} w={520} h={590} a={ap(t, st(S, 2))} c={C.pink} title="Giới hạn & tên gọi" size={27}>
        <div>PIP ≤ <B c={C.red}>P giới hạn − 5</B> cmH₂O</div>
        <div style={{marginTop: 10}}>Mỗi bước tối đa <B>±3 cmH₂O</B></div>
        <div style={{marginTop: 18, color: C.muted, fontSize: 24}}>Tên khác theo hãng:</div>
        {['VC+ (PB)', 'Autoflow (Dräger)', 'APV (Hamilton)', 'PRVC (Servo)'].map((x, i) => (
          <div key={i} style={{fontWeight: 700, opacity: ap(t, st(S, 2) + 1.5 + i * 0.6)}}>• {x}</div>
        ))}
      </Card>
      <Memo x={160} y={770} w={1600} h={125} t={t} s0={st(S, 3)} size={36}>Áp lực THÔNG MINH: thấp nhất đủ đạt VT · tự giảm khi phổi cải thiện</Memo>
    </AbsoluteFill>
  );
};

// ===================== 13. PS =====================
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
const S13: React.FC<P> = ({S}) => {
  const t = useT();
  const starts = [0.6, 3.4, 6.1];
  const Yf = (v: number) => yv(440, 220, -1, 1.1, v);
  return (
    <AbsoluteFill>
      <Header num="13" title="Trạm 5 · PS hỗ trợ áp lực" t={t} />
      <RM cur={4} t={t} />
      <Card x={80} y={150} w={1080} h={540} a={ap(t, st(S, 0))} c={C.insp} title="Mỗi nhịp đều do bệnh nhân khởi động" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <Label x={120} y={250} c={C.amber} s={22} anchor="start">Áp lực</Label>
          <Wave x={120} y={250} w={1000} h={160} f={(s) => psBreath(s, starts).p} lo={0} hi={19} span={8} color={C.amber} t={t} t0={st(S, 0)} base={0} fill />
          <Label x={120} y={450} c={C.insp} s={22} anchor="start">Lưu lượng</Label>
          <Wave x={120} y={440} w={1000} h={220} f={(s) => psBreath(s, starts).f} lo={-1} hi={1.1} span={8} color={C.insp} t={t} t0={st(S, 0)} base={0} fill />
        </g>
        <g opacity={ap(t, st(S, 1))}>
          <line x1={120} x2={1120} y1={Yf(0.25)} y2={Yf(0.25)} stroke={C.red} strokeWidth={3} strokeDasharray="10 8" />
          <Label x={1120} y={684} c={C.red} s={23} anchor="end">25% lưu lượng đỉnh → chuyển thở ra</Label>
        </g>
      </Svg>
      <Chip x={1200} y={160} w={640} h={120} c={C.insp} a={ap(t, st(S, 0))} s={27} bold>CHỈ BN kích hoạt · KHÔNG cài tần số</Chip>
      <Card x={1200} y={305} w={640} h={150} a={ap(t, st(S, 2))} c={C.amber} title="VT tự thở phụ thuộc" size={26}>mức PS · lực thở BN · R · C</Card>
      <Card x={1200} y={480} w={640} h={210} a={ap(t, st(S, 3))} c={C.red} title="Rò khí → Ti kéo dài" size={26}>
        <div>Tăng ngưỡng chuyển thở ra</div>
        <div style={{fontSize: 40, fontWeight: 800}}>30% → <span style={{color: C.red}}>50%</span></div>
      </Card>
      {['Lâm sàng: nhịp thở, co kéo, tim, HA, tri giác, SpO₂', 'Máy: tần số · VT · MV', 'Khí máu'].map((x, i) => (
        <Chip key={i} x={[80, 870, 1380][i]} y={725} w={[760, 480, 460][i]} h={110} c={C.blue} a={ap(t, st(S, 4) + i * 0.8)} s={26}>{x}</Chip>
      ))}
    </AbsoluteFill>
  );
};

// ===================== 14. Backup =====================
const S14: React.FC<P> = ({S}) => {
  const t = useT();
  const starts = [0.5, 3.0];
  const bk = [10, 12.5, 15];
  const sw = (s: number) => (s < 9.8 ? psBreath(s, starts).p : NaN);
  const bw = (s: number) => {
    if (s < 9.8) return NaN;
    let last = -1;
    for (const k of bk) if (s >= k) last = k;
    if (last < 0) return 5;
    return pPC(s - last, {T: 99, ti: 1, pi: 14});
  };
  const X = (s: number) => 120 + (s / 16) * 1680;
  return (
    <AbsoluteFill>
      <Header num="14" title="Trạm 5 · Thông khí dự phòng" t={t} />
      <RM cur={4} t={t} />
      <Card x={80} y={150} w={1760} h={340} a={ap(t, st(S, 0))} c={C.red} title="PS phụ thuộc bệnh nhân → ngưng thở thì sao?" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <Wave x={120} y={240} w={1680} h={200} f={sw} lo={0} hi={22} span={16} color={C.insp} t={t} t0={st(S, 0)} speed={1.2} base={0} fill once />
          <Wave x={120} y={240} w={1680} h={200} f={bw} lo={0} hi={22} span={16} color={C.red} t={t} t0={st(S, 0)} speed={1.2} base={0} fill once />
          {t > st(S, 0) + 4.7 / 1.2 && (
            <g opacity={ap(t, st(S, 0) + 4.7 / 1.2)}>
              <path d={`M${X(4.9)},420 L${X(4.9)},432 L${X(9.7)},432 L${X(9.7)},420`} fill="none" stroke={C.amber} strokeWidth={3} />
              <Label x={X(7.3)} y={392} c={C.amber} s={26}>NGƯNG THỞ 10–30 giây</Label>
            </g>
          )}
          {t > st(S, 0) + 10 / 1.2 && <Label x={X(13)} y={260} c={C.red} s={26}>DỰ PHÒNG (PC)</Label>}
        </g>
      </Svg>
      {['Chế độ: PC', 'FiO₂ thường 100%', 'Tần số như A/C', 'I:E 1:2'].map((x, i) => (
        <Chip key={i} x={80 + i * 445} y={520} w={425} h={80} c={C.red} a={ap(t, st(S, 1) + i * 1.1)} s={28} bold>{x}</Chip>
      ))}
      <Glass x={80} y={630} w={1760} h={110} a={ap(t, st(S, 2))} border={C.amber}>
        <div style={{fontSize: 40, fontWeight: 800, textAlign: 'center', lineHeight: '54px'}}>
          Mức PC dự phòng ≈ <span style={{color: C.amber}}>PS + 2</span> cmH₂O
        </div>
      </Glass>
      <Memo x={310} y={770} w={1300} h={120} t={t} s0={st(S, 3)} size={40}>PS không có tần số → LUÔN cài dự phòng</Memo>
    </AbsoluteFill>
  );
};

// ===================== 15. SIMV =====================
const S15: React.FC<P> = ({S}) => {
  const t = useT();
  const simv = (s: number) => {
    const q = ph(s, 6);
    if (q > 0.55 && q < 0.8) return 5 - 2 * ((q - 0.55) / 0.25);
    if (q >= 0.8 && q < 3) return pVC(q - 0.8, {T: 99, ti: 1, pk: 25, R: 5});
    const sp1 = [3.4, 4.9];
    for (const k of sp1) {
      if (q >= k && q < k + 1.3) return psBreath(q - k, [0], 10).p;
    }
    return 5;
  };
  const X = (s: number) => 120 + (s / 12) * 1680;
  const a1 = ap(t, st(S, 1)), a2 = ap(t, st(S, 2));
  return (
    <AbsoluteFill>
      <Header num="15" title="Trạm 6 · SIMV" t={t} />
      <RM cur={5} t={t} />
      <Card x={80} y={150} w={1760} h={390} a={ap(t, st(S, 0))} c={C.blue} title="Mỗi chu kỳ = giai đoạn BẮT BUỘC + giai đoạn TỰ THỞ" />
      <Svg>
        {[0, 6].map((o) => (
          <g key={o}>
            <rect x={X(o)} y={225} width={X(2.6) - X(0)} height={290} rx={10} fill={C.amber} opacity={0.12 * a1} />
            <rect x={X(o + 2.6)} y={225} width={X(3.4) - X(0)} height={290} rx={10} fill={C.insp} opacity={0.1 * a2} />
            <Label x={X(o + 1.3)} y={255} c={C.amber} s={22} a={a1}>BẮT BUỘC</Label>
            <Label x={X(o + 4.3)} y={255} c={C.insp} s={22} a={a2}>TỰ THỞ (± PS)</Label>
          </g>
        ))}
        <g opacity={ap(t, st(S, 0))}>
          <Wave x={120} y={280} w={1680} h={220} f={simv} lo={0} hi={28} span={12} color={C.txt} t={t} t0={st(S, 0)} speed={1.2} base={0} fill />
        </g>
        <Label x={140} y={530} c={C.amber} s={22} a={a1} anchor="start">BN kích hoạt → nhịp máy đồng bộ</Label>
      </Svg>
      <Card x={80} y={570} w={1760} h={320} a={ap(t, st(S, 3))} c={C.blue} title="Chuyển A/C → SIMV" />
      {['Tần số: 15 → 12', 'Trigger: 3 → 2 L/phút', 'Thêm PS 12 · Esens 25%', 'Giữ nguyên thông số khác'].map((x, i) => (
        <Chip key={i} x={130 + (i % 2) * 850} y={650 + Math.floor(i / 2) * 110} w={810} h={88} c={i === 3 ? C.muted : C.blue} a={ap(t, st(S, 3) + 1 + i * 1.6)} s={30} bold>{x}</Chip>
      ))}
    </AbsoluteFill>
  );
};

// ===================== 16. SIMV – tính toán =====================
const S16: React.FC<P> = ({S}) => {
  const t = useT();
  const k = ap(t, st(S, 1) + 1, 1.2);
  return (
    <AbsoluteFill>
      <Header num="16" title="Trạm 6 · Tính thử một ca" t={t} />
      <RM cur={5} t={t} />
      <Card x={80} y={150} w={620} h={420} a={ap(t, st(S, 0))} c={C.blue} title="Ca lâm sàng" size={30}>
        <div style={{color: C.muted, fontSize: 24}}>Cài đặt</div>
        <div><B c={C.blue}>SIMV</B> VT 400 mL · f 10 · PS 8</div>
        <div style={{color: C.muted, fontSize: 24, marginTop: 18}}>Máy đo được</div>
        <div style={{opacity: ap(t, st(S, 0) + 3)}}>f tổng <B>16</B> · MV tổng <B>5,8 L/ph</B></div>
      </Card>
      <Card x={740} y={150} w={1100} h={130} a={ap(t, st(S, 1))} c={C.amber} size={32}>
        <div>MV bắt buộc = 10 × 0,4 = <B>4 L</B> → MV tự thở = 5,8 − 4 = <B c={C.insp}>1,8 L/ph</B></div>
      </Card>
      <Card x={740} y={300} w={1100} h={130} a={ap(t, st(S, 2))} c={C.insp} size={32}>
        <div>f tự thở = 16 − 10 = <B c={C.insp}>6</B> → VT tự thở = 1800 ÷ 6 = <B c={C.insp}>300 mL</B></div>
      </Card>
      <div style={{position: 'absolute', left: 740, top: 455, width: 1100, height: 100, display: 'flex', borderRadius: 18, overflow: 'hidden', opacity: k, fontFamily: FONT, fontWeight: 800, fontSize: 28, color: C.bg0}}>
        <div style={{width: `${(4 / 5.8) * 100 * k}%`, background: C.amber, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Bắt buộc 4 L</div>
        <div style={{width: `${(1.8 / 5.8) * 100 * k}%`, background: C.insp, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Tự thở 1,8</div>
      </div>
      {[['PaCO₂ → chỉnh tần số SIMV và PS', C.red], ['PaO₂ → chỉnh FiO₂, PEEP', C.blue], ['Giảm dần → PS/CPAP → rút NKQ', C.oxy]].map(([x, c], i) => (
        <Chip key={i} x={80 + i * 595} y={610} w={570} h={100} c={c} a={ap(t, st(S, 3) + i * 2.2)} s={27}>{x}</Chip>
      ))}
      {['SIMV', 'PS / CPAP', 'Rút NKQ'].map((x, i) => (
        <React.Fragment key={i}>
          <Chip x={460 + i * 380} y={760} w={300} h={80} c={[C.blue, C.insp, C.oxy][i]} a={ap(t, st(S, 3) + 5 + i * 0.6)} s={30} bold>{x}</Chip>
          {i < 2 && <div style={{position: 'absolute', left: 772 + i * 380, top: 768, fontFamily: FONT, fontSize: 48, fontWeight: 800, color: C.muted, opacity: ap(t, st(S, 3) + 5.3 + i * 0.6)}}>→</div>}
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

// ===================== 17. Bivent =====================
const bivent = (s: number, hi: number, lo: number, Th = 2.5, Tl = 1.5) => {
  const q = ph(s, Th + Tl);
  const base = q < Th ? lo + (hi - lo) * (1 - ex(-q / 0.12)) : lo + (hi - lo) * ex(-(q - Th) / 0.15);
  return base + 1.4 * Math.sin(2 * Math.PI * 1.1 * s) * (0.6 + 0.4 * Math.sin(s * 0.7));
};
const S17: React.FC<P> = ({S}) => {
  const t = useT();
  const Y = (v: number) => yv(230, 250, 0, 28, v);
  return (
    <AbsoluteFill>
      <Header num="17" title="Trạm 7 · BIVENT" t={t} />
      <RM cur={6} t={t} />
      <Card x={80} y={150} w={1080} h={360} a={ap(t, st(S, 0))} c={STN_COL[6]} title="2 mức áp lực · tự thở BẤT KỲ lúc nào" />
      <Svg>
        <g opacity={ap(t, st(S, 0))}>
          <Wave x={120} y={230} w={1000} h={250} f={(s) => bivent(s, 20, 8)} lo={0} hi={28} span={8} color={STN_COL[6]} t={t} t0={st(S, 0)} base={0} fill />
          <Label x={1110} y={Y(20) - 18} c={C.amber} s={24} anchor="end">P cao</Label>
          <Label x={1110} y={Y(8) + 40} c={C.violet} s={24} anchor="end">PEEP</Label>
        </g>
      </Svg>
      <div style={{position: 'absolute', left: 1200, top: 150, fontFamily: FONT, fontWeight: 800, fontSize: 26, color: C.muted, opacity: ap(t, st(S, 1))}}>Tên khác theo hãng</div>
      {['BIPAP · Dräger', 'Bilevel · PB 840', 'DuoPAP · Hamilton', 'Bivent · Servo'].map((x, i) => (
        <Chip key={i} x={1200} y={200 + i * 78} w={640} h={64} c={STN_COL[6]} a={ap(t, st(S, 1) + i * 0.4)} s={26}>{x}</Chip>
      ))}
      {[['PCV', 'không cho tự thở', C.red], ['SIMV-PC', 'tự thở chỉ ở mức thấp', C.amber], ['BIVENT', 'tự thở ở CẢ HAI mức', C.oxy]].map(([h, d, c], i) => (
        <Card key={i} x={80 + i * 595} y={540} w={570} h={140} a={ap(t, st(S, 2) + i * 1.5)} c={c} title={h} size={27} pad={22}>{d}</Card>
      ))}
      {['Đồng bộ', 'Dễ chịu', 'Ít an thần', '↓ bất xứng V/Q', 'Ít ảnh hưởng huyết động'].map((x, i) => (
        <Chip key={i} x={[80, 360, 640, 940, 1320][i]} y={705} w={[260, 260, 280, 360, 520][i]} h={64} c={C.oxy} a={ap(t, st(S, 3) + i * 0.7)} s={26}>{x}</Chip>
      ))}
      <Chip x={80} y={795} w={1760} h={90} c={STN_COL[6]} a={ap(t, st(S, 4))} s={28}>Chọn khi: mất đồng bộ với SIMV-PC / PCV · tự thở nhiều · cần tránh an thần kéo dài</Chip>
    </AbsoluteFill>
  );
};

// ===================== 18. Bivent – cài & chỉnh =====================
const S18: React.FC<P> = ({S}) => {
  const t = useT();
  const s0 = st(S, 0), s2 = st(S, 2), s3 = st(S, 3);
  const g1 = ap(t, s0 + 1.5, 4), g2 = ap(t, s2 + 0.8, 2.5), g3 = ap(t, s3 + 0.8, 2.5);
  const hi = 10 + 8 * g1 + 4 * g2 + 2 * g3;
  const lo = 8 - 2 * g2 + 4 * g3;
  const Tl = 1.5 - 0.4 * g2;
  const Th = 2.5 + 0.8 * g3;
  const vt = Math.round(4 + 3 * g1);
  const Y = (v: number) => yv(230, 400, 0, 30, v);
  return (
    <AbsoluteFill>
      <Header num="18" title="Trạm 7 · Cài và chỉnh BIVENT" t={t} />
      <RM cur={6} t={t} />
      <Card x={80} y={150} w={1080} h={570} a={ap(t, s0)} c={STN_COL[6]} title={<>P cao <span style={{color: C.amber}}>{Math.round(hi)}</span> · PEEP <span style={{color: C.violet}}>{Math.round(lo)}</span> · VT ≈ <span style={{color: C.oxy}}>{vt} mL/kg</span></>} />
      <Svg>
        <g opacity={ap(t, s0)}>
          <Wave x={120} y={230} w={1000} h={400} f={(s) => bivent(s, hi, lo, Th, Tl)} lo={0} hi={30} span={8} color={STN_COL[6]} t={t} t0={s0} base={0} fill />
          <line x1={120} x2={1120} y1={Y(hi)} y2={Y(hi)} stroke={C.amber} strokeWidth={2} strokeDasharray="8 8" />
          <line x1={120} x2={1120} y1={Y(lo)} y2={Y(lo)} stroke={C.violet} strokeWidth={2} strokeDasharray="8 8" />
          <g opacity={ap(t, s2 + 0.5) * (1 - ap(t, s3))}>
            <line x1={1080} x2={1080} y1={Y(hi) + 6} y2={Y(lo) - 6} stroke={C.red} strokeWidth={4} />
            <Label x={1070} y={(Y(hi) + Y(lo)) / 2} c={C.red} s={24} anchor="end">nới khoảng cách</Label>
          </g>
          <g opacity={ap(t, s3 + 0.5)}>
            <Label x={1100} y={Y(lo) + 36} c={C.blue} s={24} anchor="end">nâng mức nền ↑</Label>
          </g>
        </g>
      </Svg>
      <Card x={1200} y={150} w={640} h={180} a={ap(t, s0)} c={STN_COL[6]} title="Cài P cao (Pinsp)" size={25}>
        <div>Từ <B>10</B> → tăng tới VT <B c={C.oxy}>6–8 mL/kg</B></div>
        <div>hoặc = Pplat − PEEP (từ VCV)</div>
      </Card>
      <Card x={1200} y={350} w={640} h={130} a={ap(t, st(S, 1))} c={C.amber} size={25}>Theo dõi VT bắt buộc + tự thở · cài báo động MV, VT</Card>
      <Card x={1200} y={500} w={640} h={100} a={ap(t, s2)} c={C.red} size={26}><B c={C.red}>PaCO₂ ↑:</B> ↑ Pinsp · ↓ PEEP · ↑ tần số</Card>
      <Card x={1200} y={620} w={640} h={100} a={ap(t, s3)} c={C.blue} size={26}><B c={C.blue}>PaO₂ ↓:</B> ↑ PEEP (kèm Pinsp) · ↑ Ti</Card>
      <Memo x={160} y={755} w={1600} h={135} t={t} s0={st(S, 4)} size={36}>CO₂ cao → nới khoảng cách 2 mức · O₂ thấp → nâng mức nền</Memo>
    </AbsoluteFill>
  );
};

// ===================== 19. Ôn tập =====================
const S19: React.FC<P> = ({S}) => {
  const t = useT();
  const items: [string, string, number][] = [
    ['CƠ BẢN', 'FiO₂ → SpO₂ ~95% · PEEP 5 (8–10 ARDS) · trẻ nhỏ trigger lưu lượng', 0],
    ['VC', 'VT 6–8 mL/kg · nhìn áp lực · đỉnh đi một mình → sức cản', 1],
    ['PC', 'Giữ áp lực · nhìn thể tích · báo động MV', 1],
    ['PRVC', 'Áp lực thông minh · ±3 cmH₂O mỗi nhịp', 2],
    ['PS', 'Chỉ BN kích hoạt · luôn cài dự phòng', 2],
    ['SIMV', 'MV tự thở = MV tổng − MV bắt buộc', 3],
    ['BIVENT', '2 mức áp lực · tự thở mọi lúc', 3],
  ];
  return (
    <AbsoluteFill>
      <Header num="19" title="Ôn tập 7 trạm" t={t} />
      <RM cur="all" t={t} />
      {items.map(([h, d, j], i) => {
        const row = i < 4 ? 0 : 1;
        const x = row === 0 ? 80 + i * 445 : 80 + (i - 4) * 595;
        const w = row === 0 ? 425 : 570;
        return (
          <Glass key={i} x={x} y={150 + row * 270} w={w} h={250} a={ap(t, st(S, j) + (i % 2) * 1.2)} border={STN_COL[i]} pad={24}>
            <div style={{fontSize: 36, fontWeight: 800, color: STN_COL[i]}}>{i + 1}. {h}</div>
            <div style={{fontSize: 26, fontWeight: 500, lineHeight: 1.4, marginTop: 10}}>{d}</div>
          </Glass>
        );
      })}
      <Memo x={360} y={720} w={1200} h={160} t={t} s0={st(S, 3) + 4} size={64}>BẾ → DẮT → TỰ ĐI</Memo>
    </AbsoluteFill>
  );
};

export const SCENES = [S0, S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19];
void lerp;
