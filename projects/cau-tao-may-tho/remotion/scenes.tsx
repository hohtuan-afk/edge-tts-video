import React from 'react';
import {AbsoluteFill} from 'remotion';
import {
  ap, sp, useT, lerp, C, FONT, STN, STN_COL, Glass, Chip, Memo, Header, Roadmap, Defs, Tube, Flow, Lungs, Machine,
  geo, along, Circuit, Humid, Trap, TempTag, Label, Badge, XMark, Fan, Bact, pathD,
} from './lib';

type P = {S: number[]};
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
    <Defs />
    {children}
  </svg>
);
const st = (S: number[], j: number) => (S[j] ?? S[S.length - 1] ?? 0);

// ===================== 0. Tiêu đề =====================
const S0: React.FC<P> = () => {
  const t = useT();
  const g = geo(470, 120, 980, 400);
  const k = sp(t, 0.5, 12);
  return (
    <AbsoluteFill>
      <Svg>
        <Circuit g={g} t={t} a={ap(t, 0.1, 1)} />
      </Svg>
      <div style={{position: 'absolute', top: 590, width: '100%', textAlign: 'center', opacity: Math.min(1, k * 1.3), transform: `scale(${0.9 + 0.1 * k})`}}>
        <div
          style={{
            fontFamily: FONT, fontWeight: 800, fontSize: 118, letterSpacing: -2, lineHeight: 1.05,
            background: 'linear-gradient(180deg, #FFFFFF, #B9CBE6)', WebkitBackgroundClip: 'text', color: 'transparent',
          }}
        >
          CẤU TẠO MÁY THỞ
        </div>
      </div>
      <div style={{position: 'absolute', top: 740, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 42, color: C.amber, opacity: ap(t, 1.2)}}>
        Tổng quát · hành trình 7 trạm của luồng khí
      </div>
      <div style={{position: 'absolute', top: 818, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 400, fontSize: 24, color: C.muted, opacity: ap(t, 1.8)}}>
        Theo bài giảng BS. Đặng Thanh Tuấn – BV Nhi Đồng 1 · Tập huấn thở máy, Bộ Y tế
      </div>
    </AbsoluteFill>
  );
};

// ===================== 1. Toàn cảnh =====================
const S1: React.FC<P> = ({S}) => {
  const t = useT();
  const g = geo(420, 150, 1380, 470);
  const a0 = ap(t, st(S, 0)), a1 = ap(t, st(S, 1)), a2 = ap(t, st(S, 2)), a3 = ap(t, st(S, 3));
  const gy = g.pe[1] + 30, ey = g.pi[1] - 30;
  const zz: [number, number][] = [];
  for (let k = 0; 150 + k * 22 <= g.m.x; k++) zz.push([150 + k * 22, ey + (k % 2 ? 10 : -10)]);
  const ex = along(g.exp, 0.5);
  return (
    <AbsoluteFill>
      <Header num="01" title="Toàn cảnh hệ thống máy thở" t={t} />
      <Svg>
        <g opacity={a1}>
          <Tube pts={[[150, gy], [g.m.x, gy]]} color={C.oxy} w={14} />
          <Flow pts={[[150, gy], [g.m.x, gy]]} color="#D9FBE5" t={t} r={7} gap={34} />
          <path d={pathD(zz)} fill="none" stroke={C.amber} strokeWidth={5} filter="url(#glow)" strokeDasharray="14 10" strokeDashoffset={-t * 80} />
          <Badge x={175} y={gy - 50} n={1} a={a1} />
          <Label x={205} y={gy - 42} anchor="start" c={C.oxy} s={26}>Khí nén / Oxy</Label>
          <Badge x={175} y={ey + 52} n={2} a={a1} />
          <Label x={205} y={ey + 60} anchor="start" c={C.amber} s={26}>Nguồn điện</Label>
        </g>
        <Circuit g={g} t={t} a={a0} flow={ap(t, st(S, 2) + 0.5)} />
        <Badge x={g.m.x + g.m.w / 2} y={g.m.y - 30} n={3} a={a1} />
        <Badge x={ex[0] - 120} y={ex[1] - 50} n={4} a={a2} />
        <Label x={ex[0] - 92} y={ex[1] - 42} anchor="start" s={26} a={a2}>Bộ dây máy thở</Label>
        <Badge x={g.Y[0] + 30} y={g.Y[1] - 52} n={5} a={a2} />
        <Label x={g.Y[0] + 60} y={g.Y[1] - 44} anchor="start" s={26} a={a2}>Đường thở</Label>
        <Badge x={g.lc[0] - 40} y={g.lc[1] + g.s * 1.1} n={6} a={a2} />
        <Label x={g.lc[0] - 10} y={g.lc[1] + g.s * 1.1 + 8} anchor="start" s={26} a={a2}>Phổi</Label>
      </Svg>
      <div style={{position: 'absolute', top: 680, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.amber, opacity: a3}}>
        HÀNH TRÌNH 7 TRẠM
      </div>
      <div style={{position: 'absolute', top: 730, width: '100%', display: 'flex', justifyContent: 'center', gap: 18}}>
        {STN.map((s, i) => {
          const k = sp(t, st(S, 3) + 0.4 + i * 0.32, 10);
          return (
            <React.Fragment key={s}>
              <div
                style={{
                  width: 180, height: 84, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FONT, fontWeight: 800, fontSize: 36, color: STN_COL[i],
                  background: `linear-gradient(135deg, ${STN_COL[i]}33, ${STN_COL[i]}10)`, border: `3px solid ${STN_COL[i]}`,
                  boxShadow: `0 0 28px ${STN_COL[i]}55`, opacity: Math.min(1, k * 1.5), transform: `scale(${0.6 + 0.4 * k}) translateY(${(1 - k) * 30}px)`,
                }}
              >
                {s}
              </div>
              {i < 6 && <div style={{color: C.muted, fontSize: 30, alignSelf: 'center', opacity: k}}>›</div>}
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ===================== 2. Điện =====================
const S2: React.FC<P> = ({S}) => {
  const t = useT();
  const a0 = ap(t, st(S, 0)), a1 = ap(t, st(S, 1)), a3 = ap(t, st(S, 3));
  const off = ap(t, st(S, 2) + 0.8, 0.8);
  const on = 1 - off;
  const lvl = 1 - 0.7 * Math.max(0, Math.min(1, (t - st(S, 2) - 0.8) / Math.max(1, st(S, 4) - st(S, 2))));
  const pc = off > 0.5 ? '#5B6474' : C.amber;
  return (
    <AbsoluteFill>
      <Header num="02" title="Trạm 1 · Điện" t={t} />
      <Roadmap cur={0} t={t} />
      <Svg>
        <g opacity={a0}>
          <rect x={130} y={370} width={90} height={110} rx={18} fill="#1B2840" stroke={pc} strokeWidth={3} />
          <rect x={95} y={395} width={40} height={14} rx={4} fill={pc} />
          <rect x={95} y={441} width={40} height={14} rx={4} fill={pc} />
          <Label x={175} y={530} c={pc} s={30} w={800}>AC 220 V</Label>
          <path d="M220,425 L560,425" stroke="#0B1322" strokeWidth={14} strokeLinecap="round" />
          <path d="M220,425 L560,425" stroke={pc} strokeWidth={8} strokeLinecap="round" />
          <path d="M220,425 L560,425" stroke="#FFF3C4" strokeWidth={4} strokeDasharray="10 26" strokeDashoffset={-t * 160} opacity={on} filter="url(#glow)" />
        </g>
        <XMark x={390} y={425} a={off} />
        <g opacity={a0}>
          <rect x={560} y={180} width={400} height={480} rx={26} fill="url(#machine)" stroke="rgba(160,185,225,0.35)" strokeWidth={2} />
          <Label x={760} y={218} c={C.muted} s={22} w={800}>MÁY THỞ</Label>
          <rect x={600} y={240} width={320} height={150} rx={14} fill="#06111F" stroke={a1 > 0.5 ? C.oxy : '#2DD4BF55'} strokeWidth={3} filter={a1 > 0.5 ? 'url(#glow)' : undefined} />
          <polyline
            fill="none" stroke={C.insp} strokeWidth={3}
            points={Array.from({length: 50}, (_, i) => {
              const u = i / 49, ph = (u * 2 + t / 2) % 1;
              const v = ph < 0.35 ? Math.min(1, ph / 0.06) : Math.max(0, 1 - (ph - 0.35) / 0.08);
              return `${615 + u * 290},${370 - v * 90}`;
            }).join(' ')}
          />
          <Label x={760} y={420} s={22}>Màn hình</Label>
          <rect x={600} y={440} width={320} height={70} rx={14} fill="#0B1729" stroke={a1 > 0.5 ? C.oxy : '#3B4F70'} strokeWidth={3} />
          <Label x={760} y={483} s={22}>Điều khiển nhịp thở</Label>
          <g opacity={a1}>
            <rect x={650} y={545} width={210} height={66} rx={12} fill="#0B1322" stroke={C.oxy} strokeWidth={3} />
            <rect x={860} y={564} width={12} height={28} rx={3} fill={C.oxy} />
            <rect x={657} y={552} width={196 * lvl} height={52} rx={8} fill={lvl > 0.4 ? C.oxy : C.amber} filter="url(#glow)" />
          </g>
        </g>
        {[['Máy nén khí', 220], ['Máy làm ẩm', 450]].map(([nm, y0], k) => {
          const y = Number(y0);
          return (
            <g key={k} opacity={a0 * (1 - 0.55 * off)}>
              <path d={`M960,${y + 70} L1080,${y + 70}`} stroke={pc} strokeWidth={6} />
              <rect x={1080} y={y} width={330} height={140} rx={22} fill="#18253C" stroke="rgba(160,185,225,0.3)" strokeWidth={2} />
              {k === 0 ? <Fan x={1150} y={y + 70} r={40} t={t} speed={on} c={C.cold} /> : <Humid x={1150} y={y + 12} t={t} w={70} h={60} />}
              <Label x={1300} y={y + 80} s={28} w={800}>{nm}</Label>
            </g>
          );
        })}
        <XMark x={1405} y={235} r={16} a={off} />
        <XMark x={1405} y={465} r={16} a={off} />
      </Svg>
      <Chip x={560} y={690} w={400} h={52} c={C.oxy} a={a1} s={22}>Pin nuôi: màn hình + điều khiển</Chip>
      <Chip x={1080} y={620} w={330} h={52} c={C.red} a={ap(t, st(S, 2) + 0.3)} s={22}>Pin KHÔNG cấp điện</Chip>
      <div style={{position: 'absolute', left: 300, top: 300, fontFamily: FONT, fontWeight: 800, fontSize: 28, color: C.red, opacity: off, transform: `scale(${0.8 + 0.2 * off})`}}>MẤT ĐIỆN!</div>
      <Glass x={1480} y={190} w={360} h={440} a={a3} border={C.amber}>
        <div style={{textAlign: 'center', fontWeight: 700, fontSize: 28, color: C.amber}}>Pin dự phòng</div>
        <div style={{textAlign: 'center', fontWeight: 800, fontSize: 86, marginTop: 18, letterSpacing: -2}}>30–60</div>
        <div style={{textAlign: 'center', fontWeight: 600, fontSize: 30, marginTop: -6}}>phút</div>
        <div style={{textAlign: 'center', fontWeight: 500, fontSize: 24, color: C.muted, marginTop: 34}}>Máy để không:</div>
        <div style={{textAlign: 'center', fontWeight: 800, fontSize: 32}}>sạc 8 giờ / tuần</div>
      </Glass>
      <Memo x={300} y={780} w={1320} h={110} t={t} s0={st(S, 4)} size={44}>Pin nuôi BỘ NÃO — không nuôi CƠ BẮP</Memo>
    </AbsoluteFill>
  );
};

// ===================== 3. Nguồn khí =====================
const Gauge: React.FC<{x: number; y: number; r: number; v: number; c: string; a: number}> = ({x, y, r, v, c, a}) => (
  <g opacity={a} transform={`translate(${x},${y})`}>
    <circle r={r} fill="#0E1A2E" stroke={c} strokeWidth={5} filter="url(#glow)" />
    {Array.from({length: 9}, (_, k) => {
      const th = Math.PI * (0.8 + (1.4 * k) / 8);
      return <line key={k} x1={r * 0.74 * Math.cos(th)} y1={r * 0.74 * Math.sin(th)} x2={r * 0.9 * Math.cos(th)} y2={r * 0.9 * Math.sin(th)} stroke={C.muted} strokeWidth={2} />;
    })}
    <line x1={0} y1={0} x2={r * 0.7 * Math.cos(Math.PI * (0.8 + 1.4 * v))} y2={r * 0.7 * Math.sin(Math.PI * (0.8 + 1.4 * v))} stroke={C.amber} strokeWidth={5} strokeLinecap="round" />
    <circle r={7} fill={C.amber} />
  </g>
);

const S3: React.FC<P> = ({S}) => {
  const t = useT();
  const [a0, a1, a2, a3] = [0, 1, 2, 3].map((j) => ap(t, st(S, j)));
  const groups: [string, string, string[], number, number][] = [
    ['KHÍ NÉN · 21% O₂', C.air, ['Máy nén khí theo máy', 'Khí nén trung tâm'], 190, 300],
    ['OXY · 100%', C.oxy, ['Oxy bình', 'Oxy lỏng trung tâm'], 480, 590],
  ];
  const airP: [number, number][] = [[878, 300], [1060, 300], [1060, 410], [1210, 410]];
  const oxyP: [number, number][] = [[878, 590], [1060, 590], [1060, 480], [1210, 480]];
  return (
    <AbsoluteFill>
      <Header num="03" title="Trạm 2 · Nguồn khí" t={t} />
      <Roadmap cur={1} t={t} />
      <Svg>
        {groups.map(([, c, items, y0, ry], gi) =>
          items.map((_, k) => {
            const yy = y0 + 22 + k * 82 + 31;
            const pts: [number, number][] = [[520, yy], [640, yy], [640, ry], [762, ry]];
            return (
              <g key={`${gi}${k}`} opacity={a1}>
                <Tube pts={pts} color={c} w={12} />
                <Flow pts={pts} color="#FFFFFF" t={t} r={6} gap={30} a={a1 * 0.9} />
              </g>
            );
          }),
        )}
        <Gauge x={820} y={300} r={58} v={0.12 + 0.55 * a2} c={C.air} a={a1} />
        <Gauge x={820} y={590} r={58} v={0.12 + 0.55 * a2} c={C.oxy} a={a1} />
        <Label x={820} y={392} s={22} a={a1}>Điều áp</Label>
        <Label x={820} y={682} s={22} a={a1}>Điều áp</Label>
        <g opacity={a2}>
          <Tube pts={airP} color={C.air} w={12} />
          <Tube pts={oxyP} color={C.oxy} w={12} />
          <Flow pts={airP} color="#FFFFFF" t={t} r={6} gap={30} />
          <Flow pts={oxyP} color="#FFFFFF" t={t} r={6} gap={30} />
        </g>
        <g opacity={a3}>
          <rect x={1210} y={330} width={600} height={240} rx={26} fill="#E9EEF5" stroke="#B9C6D8" strokeWidth={3} />
          <text x={1510} y={372} textAnchor="middle" fill="#55657E" fontFamily={FONT} fontWeight={800} fontSize={22} letterSpacing={2}>Ổ CẮM ĐẦU GIƯỜNG</text>
          {[['Oxy', C.oxy], ['Oxy', C.oxy], ['Air', '#E5B800'], ['Hút', '#8A94A6']].map(([n, c], k) => {
            const kk = sp(t, st(S, 3) + 0.3 + k * 0.35, 10);
            const x = 1310 + k * 135;
            return (
              <g key={k} transform={`translate(${x},455) scale(${0.5 + 0.5 * kk})`} opacity={Math.min(1, kk * 1.5)}>
                <circle r={44} fill="#F8FAFC" stroke={c} strokeWidth={8} />
                <circle r={22} fill="#C7D0DC" stroke="#9AA6B8" strokeWidth={3} />
                <circle r={9} fill="#2B3445" />
                <text y={84} textAnchor="middle" fill="#2B3445" fontFamily={FONT} fontWeight={800} fontSize={24}>{n}</text>
              </g>
            );
          })}
        </g>
      </Svg>
      {groups.map(([nm, c, items, y0], gi) => (
        <React.Fragment key={gi}>
          <div style={{position: 'absolute', left: 120, top: y0 - 46, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: c, opacity: a0}}>{nm}</div>
          {items.map((it, k) => (
            <Glass key={k} x={120} y={y0 + 22 + k * 82} w={400} h={64} a={a1} border={c} pad={0} style={{display: 'flex', alignItems: 'center', paddingLeft: 24, fontSize: 25, fontWeight: 600, borderRadius: 16}}>
              {it}
            </Glass>
          ))}
        </React.Fragment>
      ))}
      <Chip x={680} y={420} w={280} h={56} c={C.amber} a={a2} s={26} bold>50 psi ≈ 3,5 bar</Chip>
      <div style={{position: 'absolute', left: 1210, top: 600, width: 600, textAlign: 'center', fontFamily: FONT, fontWeight: 500, fontSize: 26, color: C.muted, opacity: ap(t, st(S, 3) + 2)}}>
        Hồi sức ngoại: thêm 1 ổ hút (5 ổ)
      </div>
    </AbsoluteFill>
  );
};

// ===================== 4. Trộn khí =====================
const S4: React.FC<P> = ({S}) => {
  const t = useT();
  const [a0, a1, a2, a3, a4] = [0, 1, 2, 3, 4].map((j) => ap(t, st(S, j)));
  const op: [number, number][] = [[140, 590], [560, 590], [700, 630]];
  const aP: [number, number][] = [[140, 760], [560, 760], [700, 700]];
  const out: [number, number][] = [[900, 665], [1800, 665]];
  const pct = Math.round(21 + 19 * Math.min(1, Math.max(0, (t - st(S, 3)) / 1.5)));
  return (
    <AbsoluteFill>
      <Header num="04" title="Máy trộn khí như thế nào?" t={t} />
      <Roadmap cur={1} t={t} />
      <Glass x={120} y={140} w={800} h={290} a={a0} border={C.oxy}>
        <div style={{fontWeight: 800, fontSize: 30, color: C.oxy}}>Máy có tua-bin bên trong</div>
        <div style={{marginLeft: 170, marginTop: 22, fontWeight: 800, fontSize: 34}}>Chỉ cần nguồn OXY</div>
        <div style={{marginLeft: 170, marginTop: 8, fontWeight: 500, fontSize: 22, color: C.muted}}>PB 760 · Savina · Servo air · Hamilton</div>
        <div style={{marginLeft: 170, marginTop: 10, fontWeight: 600, fontSize: 24}}>→ hợp BV huyện, khoa thiếu khí nén trung tâm</div>
      </Glass>
      <Glass x={1000} y={140} w={800} h={290} a={a1} border={C.blue}>
        <div style={{fontWeight: 800, fontSize: 30, color: C.blue}}>Máy thở ICU</div>
        <div style={{marginLeft: 120, marginTop: 22, fontWeight: 800, fontSize: 34}}>Cần cả OXY + KHÍ NÉN</div>
        <div style={{marginLeft: 120, marginTop: 8, fontWeight: 500, fontSize: 22, color: C.muted, width: 600}}>GE R860 · Servo i/u/n · Dräger V300 / VN500 · PB 840 / 980</div>
      </Glass>
      <Svg>
        <Fan x={215} y={320} r={56} t={t} speed={1.6} c={C.oxy} a={a0} />
        <g opacity={a1}>
          <Tube pts={[[1040, 300], [1100, 300]]} color={C.oxy} w={14} />
          <Tube pts={[[1040, 345], [1100, 345]]} color={C.air} w={14} />
        </g>
        <g opacity={a2}>
          <Tube pts={op} color={C.oxy} w={20} />
          <Tube pts={aP} color={C.air} w={20} />
          <Flow pts={op} color="#E9FFF0" t={t} gap={36} r={7} />
          <Flow pts={aP} color="#FFF8DA" t={t} gap={36} r={7} />
          <Tube pts={out} color="#6AA9F5" w={30} />
          <Flow pts={out} color="#FFFFFF" t={t} gap={40} r={9} speed={180} />
          <rect x={700} y={570} width={200} height={190} rx={24} fill={C.amber} filter="url(#glow)" />
          <text x={800} y={650} textAnchor="middle" fill="#1B1405" fontFamily={FONT} fontWeight={800} fontSize={30}>Bộ trộn</text>
          <text x={800} y={700} textAnchor="middle" fill="#1B1405" fontFamily={FONT} fontWeight={800} fontSize={32}>FiO₂ 40%</text>
          <Label x={140} y={560} anchor="start" c={C.oxy} s={26} w={800}>Oxy 100%</Label>
          <Label x={140} y={810} anchor="start" c={C.air} s={26} w={800}>Khí nén 21%</Label>
          <Label x={1640} y={630} c="#9CC6FA" s={26} w={800}>Hỗn hợp 40% →</Label>
        </g>
        <g opacity={a3}>
          <rect x={1110} y={622} width={140} height={86} rx={14} fill="#F5C451" stroke="#0B1322" strokeWidth={3} />
          <text x={1180} y={674} textAnchor="middle" fill="#1B1405" fontFamily={FONT} fontWeight={800} fontSize={22}>O₂ cell</text>
          <path d="M1180,622 L1180,576" stroke="#F5C451" strokeWidth={3} />
        </g>
      </Svg>
      <Glass x={1100} y={480} w={160} h={90} a={a3} border={C.oxy} pad={0} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 800, color: C.oxy}}>
        {pct}%
      </Glass>
      <div style={{position: 'absolute', left: 1290, top: 500, width: 520, fontFamily: FONT, fontWeight: 600, fontSize: 25, color: C.txt, opacity: a3, lineHeight: 1.3}}>
        đo SAU khi trộn → báo động nếu lệch
      </div>
      <Chip x={900} y={780} w={440} h={64} c={C.amber} a={a4} s={23}>Loại thường: thay 3–6 tháng</Chip>
      <Chip x={1360} y={780} w={460} h={64} c={C.oxy} a={ap(t, st(S, 4) + 0.4)} s={23}>Loại siêu âm: không cần thay</Chip>
    </AbsoluteFill>
  );
};

// ===================== 5. Bộ dây =====================
const S5: React.FC<P> = ({S}) => {
  const t = useT();
  const [a0, a1, a2] = [0, 1, 2].map((j) => ap(t, st(S, j)));
  const g = geo(130, 130, 1160, 440);
  const hp = along(g.insp, 0.28), tp1 = along(g.insp, 0.62), tp2 = along(g.exp, 0.72), th = along(g.insp, 0.93);
  const lbI = along(g.insp, 0.47), lbE = along(g.exp, 0.3);
  return (
    <AbsoluteFill>
      <Header num="05" title="Trạm 3 · Bộ dây máy thở" t={t} />
      <Roadmap cur={2} t={t} />
      <Svg>
        <Circuit g={g} t={t} a={a0} />
        <Label x={lbI[0]} y={lbI[1] - 30} c={C.insp} s={26} w={800} a={a0}>Nhánh hít vào</Label>
        <Label x={lbE[0] + 30} y={lbE[1] - 30} c={C.exp} s={26} w={800} a={a0}>Nhánh thở ra</Label>
        <Label x={g.Y[0]} y={g.Y[1] - 36} c="#F5C451" s={24} a={a0}>chữ Y</Label>
        <Humid x={hp[0]} y={hp[1]} t={t} a={a1} />
        <Label x={hp[0]} y={hp[1] + 150} s={24} a={a1}>Làm ẩm & ấm</Label>
        <Trap x={tp1[0]} y={tp1[1]} a={a1} />
        <Trap x={tp2[0]} y={tp2[1]} a={a1} />
        <Label x={tp2[0]} y={tp2[1] + 84} s={22} c={C.muted} a={a1}>Bẫy nước</Label>
        <circle cx={th[0]} cy={th[1]} r={11} fill={C.red} stroke="#fff" strokeWidth={2} opacity={a1} filter="url(#glow)" />
        <Label x={th[0] + 18} y={th[1] + 40} anchor="start" s={22} c={C.muted} a={a1}>Nhiệt kế</Label>
        {[[8, 'Sơ sinh · < 7 kg', C.violet], [15, 'Trẻ em · 7–25 kg', C.blue], [22, 'Người lớn · > 25 kg', C.red]].map(([mm, lb, c], k) => {
          const kk = sp(t, st(S, 2) + 0.3 + k * 0.7, 10);
          const cx = 230 + k * 380, r = Number(mm) * 3;
          return (
            <g key={k} opacity={Math.min(1, kk * 1.4)}>
              <g transform={`translate(${cx},740) scale(${0.4 + 0.6 * kk})`}>
                <circle r={r + 10} fill="none" stroke={String(c)} strokeWidth={4} opacity={0.35} filter="url(#softglow)" />
                <circle r={r} fill="#0B1322" stroke={String(c)} strokeWidth={9} />
              </g>
              <text x={cx + 90} y={730} fill={String(c)} fontFamily={FONT} fontWeight={800} fontSize={44}>{mm} mm</text>
              <text x={cx + 90} y={772} fill={C.txt} fontFamily={FONT} fontWeight={500} fontSize={22}>{lb}</text>
            </g>
          );
        })}
      </Svg>
      {a2 > 0 && null}
      <Memo x={1330} y={640} w={500} h={190} t={t} s0={st(S, 3)} size={60}>8 – 15 – 22</Memo>
    </AbsoluteFill>
  );
};

// ===================== 6. Chất liệu =====================
const Corr: React.FC<{w: number; amp: number; c: string; t: number}> = ({w, amp, c, t}) => {
  const b = amp * (0.5 + 0.5 * Math.sin((2 * Math.PI * t) / 2.4));
  const h = 24 + b;
  return (
    <svg width={w} height={110} style={{display: 'block', margin: '18px auto 8px'}}>
      <rect x={6} y={55 - h} width={w - 12} height={2 * h} rx={h} fill={`${c}55`} stroke={c} strokeWidth={3} />
      {Array.from({length: Math.floor((w - 40) / 16)}, (_, i) => (
        <line key={i} x1={24 + i * 16} y1={55 - h + 5} x2={24 + i * 16} y2={55 + h - 5} stroke={c} strokeWidth={2} opacity={0.7} />
      ))}
    </svg>
  );
};
const S6: React.FC<P> = ({S}) => {
  const t = useT();
  const mats: [string, string, number, [string, string][]][] = [
    ['PVC', '#6EA8FE', 16, [['Giá', 'rẻ'], ['Đàn hồi', 'nhiều'], ['Hấp', 'không'], ['Dùng', '1 lần']]],
    ['Hytrel', '#E8CF95', 6, [['Giá', 'đắt'], ['Đàn hồi', 'ít · cứng, giòn'], ['Hấp', 'được'], ['Độ bền', 'mau hư']]],
    ['Silicone', '#9ED8F5', 3, [['Giá', 'đắt'], ['Đàn hồi', 'ít'], ['Hấp', 'được'], ['Độ bền', 'dùng nhiều lần']]],
  ];
  const a3 = ap(t, st(S, 3));
  return (
    <AbsoluteFill>
      <Header num="06" title="Chất liệu dây" t={t} />
      <Roadmap cur={2} t={t} />
      {mats.map(([nm, c, amp, props], k) => (
        <Glass key={nm} x={120 + k * 570} y={140} w={540} h={510} a={ap(t, st(S, k))} border={c}>
          <div style={{fontWeight: 800, fontSize: 40, color: c}}>{nm}</div>
          <Corr w={480} amp={amp} c={c} t={t} />
          {props.map(([l, v]) => (
            <div key={l} style={{display: 'flex', fontSize: 27, marginTop: 14}}>
              <div style={{width: 150, color: C.muted, fontWeight: 500}}>{l}</div>
              <div style={{fontWeight: 800}}>{v}</div>
            </div>
          ))}
        </Glass>
      ))}
      <div style={{position: 'absolute', left: 120, top: 690, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.amber, opacity: a3}}>Độ đàn hồi</div>
      {mats.map(([nm, c], k) => {
        const val = [1, 0.5, 0.25][k] * ap(t, st(S, 3) + 0.2 + k * 0.3, 1);
        return (
          <React.Fragment key={nm}>
            <div style={{position: 'absolute', left: 340 + k * 500, top: 690, width: 400 * val, height: 40, borderRadius: 12, background: `linear-gradient(90deg, ${c}, ${c}AA)`, boxShadow: `0 0 20px ${c}66`, opacity: a3}} />
            <div style={{position: 'absolute', left: 340 + k * 500, top: 740, fontFamily: FONT, fontWeight: 700, fontSize: 26, color: C.txt, opacity: a3}}>{nm}</div>
            {k < 2 && <div style={{position: 'absolute', left: 780 + k * 500, top: 678, fontFamily: FONT, fontWeight: 800, fontSize: 48, color: C.amber, opacity: a3}}>›</div>}
          </React.Fragment>
        );
      })}
      <div style={{position: 'absolute', top: 810, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 32, color: C.txt, opacity: ap(t, st(S, 3) + 1.5)}}>
        → dây càng đàn hồi, thể tích nén càng lớn
      </div>
    </AbsoluteFill>
  );
};

// ===================== 7. Thể tích nén =====================
const S7: React.FC<P> = ({S}) => {
  const t = useT();
  const [a0, a1, a2, a3, a4] = [0, 1, 2, 3, 4].map((j) => ap(t, st(S, j)));
  const ph = 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / 3);
  const b = 26 * ph * a0;
  const k4 = ap(t, st(S, 4) + 0.6, 1.4);
  const bars: [string, number, string][] = [
    ['Máy đẩy ra', 500 + 50 * k4, C.insp],
    ['Ở lại trong dây', 50, C.exp],
    ['Bệnh nhân nhận', 450 + 50 * k4, k4 > 0.95 ? C.oxy : C.amber],
  ];
  return (
    <AbsoluteFill>
      <Header num="07" title="Thể tích nén" t={t} />
      <Roadmap cur={2} t={t} />
      <Svg>
        <g opacity={a0}>
          <rect x={120} y={225} width={110} height={110} rx={18} fill="url(#machine)" stroke="rgba(160,185,225,0.35)" strokeWidth={2} />
          <Label x={175} y={288} s={22} c={C.muted}>Máy</Label>
          <rect x={230} y={280 - 28 - b} width={680} height={56 + 2 * b} rx={28 + b} fill="rgba(96,165,250,0.22)" stroke={C.blue} strokeWidth={3} filter="url(#glow)" />
          {Array.from({length: 40}, (_, i) => (
            <line key={i} x1={250 + i * 16} y1={280 - 22 - b} x2={250 + i * 16} y2={280 + 22 + b} stroke="rgba(160,200,255,0.35)" strokeWidth={2} />
          ))}
          {Array.from({length: 12}, (_, i) => (
            <circle key={i} cx={260 + ((i * 55 + t * 110) % 620)} cy={280 + 12 * Math.sin(i * 1.7)} r={7} fill={C.insp} filter="url(#glow)" />
          ))}
          <Lungs cx={1000} cy={310} s={72} t={t} />
          <Label x={570} y={385} s={26}>dây giãn ra + khí bị nén</Label>
        </g>
      </Svg>
      <Chip x={120} y={430} w={880} h={60} c={C.amber} a={a1} s={24}>Dây + bình làm ẩm càng to: NL &gt; TE &gt; SS</Chip>
      <Chip x={120} y={505} w={880} h={60} c={C.amber} a={ap(t, st(S, 1) + 0.4)} s={24}>Dây càng đàn hồi: PVC &gt; Hytrel &gt; Silicone</Chip>
      {bars.map(([lb, v, c], k) => (
        <div key={lb} style={{position: 'absolute', left: 1110 + k * 240, top: 150, width: 170, height: 420, opacity: a2}}>
          <div style={{position: 'absolute', bottom: 60, width: 170, height: 300, borderRadius: 16, background: 'rgba(28,40,62,0.9)'}} />
          <div style={{position: 'absolute', bottom: 60, width: 170, height: (300 * v) / 600 * a2, borderRadius: 16, background: `linear-gradient(180deg, ${c}, ${c}99)`, boxShadow: `0 0 26px ${c}66`}} />
          <div style={{position: 'absolute', bottom: 60 + (300 * v) / 600 + 10, width: 170, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 34, color: c}}>{Math.round(v)} mL</div>
          <div style={{position: 'absolute', bottom: 0, width: 200, left: -15, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 22, color: C.txt}}>{lb}</div>
        </div>
      ))}
      <Glass x={120} y={620} w={1700} h={270} a={a3}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 30}}>
          <div style={{width: 260, fontWeight: 800, fontSize: 26, color: C.amber}}>Tự kiểm tra máy</div>
          <div style={{fontWeight: 800, fontSize: 36}}>C dây = ΔV / ΔP <span style={{fontSize: 24, color: C.muted, fontWeight: 500}}>(mL/cmH₂O)</span></div>
        </div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 30, marginTop: 22, opacity: a4}}>
          <div style={{width: 260, fontWeight: 800, fontSize: 26, color: C.amber}}>Mỗi nhịp thở</div>
          <div style={{fontWeight: 800, fontSize: 36}}>VT nén = C dây × (P đỉnh − PEEP)</div>
        </div>
        <div style={{marginLeft: 290, marginTop: 18, fontWeight: 700, fontSize: 30, color: C.oxy, opacity: ap(t, st(S, 4) + 1.2)}}>
          VD: 2 × (30 − 5) = 50 mL → máy đẩy 500 + 50 = 550 mL
        </div>
      </Glass>
    </AbsoluteFill>
  );
};

// ===================== 8. Làm ẩm & ấm =====================
const S8: React.FC<P> = ({S}) => {
  const t = useT();
  const [a0, a1, a2, a3] = [0, 1, 2, 3].map((j) => ap(t, st(S, j)));
  const gA = geo(120, 205, 1080, 320), gB = geo(120, 560, 1080, 320);
  const hA = along(gA.insp, 0.28), hB = along(gB.insp, 0.28);
  const fr = (g: typeof gA, x: number) => (x - g.pi[0]) / (g.Y[0] - g.pi[0]);
  const wire = (g: typeof gA, f0: number, f1: number) => Array.from({length: 31}, (_, k) => along(g.insp, f0 + ((f1 - f0) * k) / 30)).map((p) => [p[0], p[1] - 16] as [number, number]);
  const wireE = Array.from({length: 31}, (_, k) => along(gB.exp, 0.06 + (0.88 * k) / 30)).map((p) => [p[0], p[1] - 16] as [number, number]);
  return (
    <AbsoluteFill>
      <Header num="08" title="Trạm 4 · Làm ẩm & ấm" t={t} />
      <Roadmap cur={3} t={t} />
      <Svg>
        <defs>
          <linearGradient id="iA" gradientUnits="userSpaceOnUse" x1={gA.pi[0]} y1={0} x2={gA.Y[0]} y2={0}>
            <stop offset={0} stopColor="#4B6488" />
            <stop offset={fr(gA, hA[0])} stopColor="#4B6488" />
            <stop offset={fr(gA, hA[0]) + 0.02} stopColor={C.hot} />
            <stop offset={1} stopColor={C.warm} />
          </linearGradient>
          <linearGradient id="eA" gradientUnits="userSpaceOnUse" x1={gA.Y[0]} y1={0} x2={gA.pe[0]} y2={0}>
            <stop offset={0} stopColor={C.warm} />
            <stop offset={1} stopColor={C.cold} />
          </linearGradient>
          <linearGradient id="iB" gradientUnits="userSpaceOnUse" x1={gB.pi[0]} y1={0} x2={gB.Y[0]} y2={0}>
            <stop offset={0} stopColor="#4B6488" />
            <stop offset={fr(gB, hB[0])} stopColor="#4B6488" />
            <stop offset={fr(gB, hB[0]) + 0.02} stopColor={C.warm} />
            <stop offset={1} stopColor={C.warm} />
          </linearGradient>
          <linearGradient id="eB" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={1920} y2={0}>
            <stop offset={0} stopColor={a3 > 0.5 ? C.warm : '#4B6488'} />
            <stop offset={1} stopColor={a3 > 0.5 ? C.warm : '#4B6488'} />
          </linearGradient>
        </defs>
        <Circuit g={gA} t={t} a={a1} iGrad="iA" eGrad="eA" tw={14} label="Máy thở" screen={false} />
        <Humid x={hA[0]} y={hA[1]} t={t} a={a1} w={80} h={64} />
        <TempTag x={hA[0]} y={hA[1] + 132} v="≈ 45 °C" c={C.hot} a={a1} />
        <TempTag x={gA.Y[0] + 10} y={gA.Y[1] - 52} v="37 °C" c={C.warm} a={a1} />
        <TempTag x={gA.pe[0] + 80} y={gA.pe[1] - 44} v="≈ 30 °C" c={C.cold} a={a1} />
        {Array.from({length: 12}, (_, k) => {
          const p = along(gA.exp, 0.15 + 0.07 * k);
          return <circle key={k} cx={p[0] + 4 * Math.sin(k * 3)} cy={p[1] + 12} r={4 + ((k * 7) % 3) * 1.5} fill="#8CCBFF" opacity={a1 * ap(t, st(S, 1) + 1 + k * 0.25)} />;
        })}
        <Trap x={along(gA.exp, 0.72)[0]} y={along(gA.exp, 0.72)[1]} a={a1} />
        <Circuit g={gB} t={t} a={a2} iGrad="iB" eGrad="eB" tw={14} label="Máy thở" screen={false} />
        <Humid x={hB[0]} y={hB[1]} t={t} a={a2} w={80} h={64} />
        <path d={pathD(wire(gB, 0.32, 0.93))} fill="none" stroke={C.amber} strokeWidth={4} strokeDasharray="10 8" strokeDashoffset={-t * 30} opacity={a2} filter="url(#glow)" />
        <path d={pathD(wireE)} fill="none" stroke={C.amber} strokeWidth={4} strokeDasharray="10 8" strokeDashoffset={-t * 30} opacity={a3} filter="url(#glow)" />
        <TempTag x={hB[0]} y={hB[1] + 130} v="37 °C" c={C.warm} a={a2} />
        <TempTag x={along(gB.insp, 0.7)[0] + 50} y={along(gB.insp, 0.7)[1] + 46} v="dây 39 °C" c={C.amber} a={a2} />
        <TempTag x={gB.Y[0] + 10} y={gB.Y[1] - 52} v="37 °C" c={C.warm} a={a2} />
        <circle cx={hB[0] + 34} cy={hB[1]} r={9} fill={C.red} stroke="#fff" strokeWidth={2} opacity={a2} />
        <circle cx={along(gB.insp, 0.95)[0]} cy={along(gB.insp, 0.95)[1]} r={9} fill={C.red} stroke="#fff" strokeWidth={2} opacity={a2} />
      </Svg>
      <Chip x={1250} y={140} w={580} h={58} c={C.hot} a={a0} s={23}>Chủ động: máy làm ẩm gia nhiệt</Chip>
      <Chip x={1250} y={212} w={580} h={58} c={C.oxy} a={ap(t, st(S, 0) + 0.4)} s={23}>Thụ động: HME (mũi nhân tạo)</Chip>
      <Glass x={1250} y={300} w={580} h={200} a={a1} border={C.cold}>
        <div style={{fontWeight: 800, fontSize: 30}}>Không dây nhiệt</div>
        <div style={{fontWeight: 500, fontSize: 23, color: C.muted, marginTop: 10, lineHeight: 1.35}}>Bình đẩy ~45 °C vì khí nguội dần → đọng nước nhiều, cần bẫy nước</div>
      </Glass>
      <Glass x={1250} y={600} w={580} h={260} a={a2} border={C.warm}>
        <div style={{fontWeight: 800, fontSize: 30}}>Có dây nhiệt (hít vào)</div>
        <div style={{fontWeight: 500, fontSize: 23, color: C.muted, marginTop: 10}}>Cảm biến nhiệt kép ở bình và chữ Y</div>
        <div style={{fontWeight: 700, fontSize: 23, color: C.amber, marginTop: 16, opacity: a3}}>2 nhánh: nung cả nhánh thở ra → hạn chế đọng nước</div>
      </Glass>
    </AbsoluteFill>
  );
};

// ===================== 9. So sánh =====================
const Thermo: React.FC<{v: number}> = ({v}) => (
  <svg width={110} height={240}>
    <rect x={30} y={10} width={30} height={180} rx={15} fill="#0B1322" stroke="#C9D6EA" strokeWidth={2} />
    <circle cx={45} cy={205} r={26} fill={C.hot} stroke="#C9D6EA" strokeWidth={2} />
    <rect x={38} y={190 - 170 * v} width={14} height={170 * v + 10} rx={7} fill={C.hot} />
    {[[0.85, 'cao', C.hot], [0.5, '37°', C.oxy], [0.15, 'thấp', C.cold]].map(([u, l, c], k) => (
      <g key={k}>
        <line x1={64} x2={78} y1={190 - 170 * Number(u)} y2={190 - 170 * Number(u)} stroke={String(c)} strokeWidth={3} />
        <text x={80} y={196 - 170 * Number(u)} fill={String(c)} fontFamily={FONT} fontWeight={700} fontSize={16}>{l}</text>
      </g>
    ))}
  </svg>
);
const S9: React.FC<P> = ({S}) => {
  const t = useT();
  const [a0, a1, a2, a3] = [0, 1, 2, 3].map((j) => ap(t, st(S, j)));
  const row = (s: string, a: number, c = C.txt, w = 500) => <div style={{fontSize: 27, fontWeight: w, color: c, marginTop: 12, opacity: a}}>{s}</div>;
  return (
    <AbsoluteFill>
      <Header num="09" title="So sánh 2 loại máy làm ẩm" t={t} />
      <Roadmap cur={3} t={t} />
      <Glass x={120} y={140} w={820} h={560} a={a0} border={C.cold}>
        <div style={{fontWeight: 800, fontSize: 36, color: C.cold}}>KHÔNG dây nhiệt</div>
        <div style={{position: 'absolute', right: 30, top: 70}}><Thermo v={0.5 + 0.38 * Math.sin((2 * Math.PI * t) / 3.2)} /></div>
        {row('Nhiệt độ dao động:', a0, C.txt, 800)}
        {row('• thấp → đàm đặc, mất nhiệt', a0)}
        {row('• cao → quá tải nước, bỏng hô hấp', a0)}
        <div style={{height: 24}} />
        {row('• Cần điều dưỡng theo dõi', a1)}
        {row('• Dễ nhiễm trùng bệnh viện', a1)}
        {row('• Rẻ hơn · lâu hư', a1, C.oxy, 700)}
      </Glass>
      <Glass x={980} y={140} w={820} h={560} a={a2} border={C.hot}>
        <div style={{fontWeight: 800, fontSize: 36, color: C.hot}}>CÓ dây nhiệt</div>
        <div style={{position: 'absolute', right: 30, top: 70}}><Thermo v={0.5 + 0.02 * Math.sin((2 * Math.PI * t) / 3.2)} /></div>
        {row('Nhiệt độ ổn định', a2, C.txt, 800)}
        {row('• Ít cần theo dõi', a2)}
        {row('• Ít nhiễm trùng bệnh viện', a2)}
        <div style={{height: 24}} />
        {row('• Đắt hơn', a2, C.red, 700)}
        {row('• Dễ đứt dây điện trở', a2, C.red, 700)}
      </Glass>
      <div style={{position: 'absolute', left: 420, top: 790, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.amber, opacity: a3}}>Bình chứa nước:</div>
      <Svg>
        {[[70, 70, 'Trẻ em'], [104, 100, 'Người lớn']].map(([w, h, lb], k) => {
          const kk = sp(t, st(S, 3) + 0.3 + k * 0.4, 10);
          const cx = 780 + k * 420, W = Number(w), H = Number(h);
          return (
            <g key={k} opacity={Math.min(1, kk * 1.4)} transform={`translate(${cx},880) scale(${0.5 + 0.5 * kk}) translate(${-cx},-880)`}>
              <rect x={cx - W / 2} y={880 - H} width={W} height={H} rx={14} fill="rgba(125,211,252,0.12)" stroke="#9AD8FF" strokeWidth={3} />
              <rect x={cx - W / 2 + 6} y={880 - H * 0.48} width={W - 12} height={H * 0.48 - 6} rx={8} fill="url(#water)" />
              <text x={cx + W / 2 + 22} y={850} fill={C.txt} fontFamily={FONT} fontWeight={800} fontSize={30}>{lb}</text>
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

// ===================== 10. HME =====================
const S10: React.FC<P> = ({S}) => {
  const t = useT();
  const [a0, a1, a2, a3, a4] = [0, 1, 2, 3, 4].map((j) => ap(t, st(S, j)));
  const y = 400;
  const ph = (t % 6) / 6;
  const exh = ph < 0.5;
  const moist = 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / 6);
  const f = (ph % 0.5) / 0.5;
  return (
    <AbsoluteFill>
      <Header num="10" title="HME — chiếc “mũi nhân tạo”" t={t} />
      <Roadmap cur={3} t={t} />
      <Svg>
        <g opacity={a0}>
          <Tube pts={[[150, y], [800, y]]} w={44} />
          <Tube pts={[[1120, y], [1650, y], [1650, 330]]} w={44} />
          <Lungs cx={1650} cy={470} s={104} t={t} />
          <Label x={150} y={y + 72} anchor="start" s={24} c={C.muted}>← phía máy thở</Label>
          <Label x={1760} y={610} s={24} c={C.muted}>bệnh nhân</Label>
          <rect x={800} y={y - 130} width={320} height={260} rx={60} fill="rgba(74,222,128,0.16)" stroke={C.oxy} strokeWidth={5} filter="url(#glow)" />
          <polyline points={Array.from({length: 13}, (_, k) => `${830 + k * 22},${k % 2 ? y - 96 : y + 96}`).join(' ')} fill="none" stroke={C.oxy} strokeWidth={4} />
          {Array.from({length: 16}, (_, k) => ((k * 0.37) % 1 < moist ? (
            <circle key={k} cx={835 + ((k * 41) % 250)} cy={y - 80 + ((k * 53) % 160)} r={7} fill="#8CCBFF" opacity={a1} filter="url(#glow)" />
          ) : null))}
        </g>
        {a1 > 0.01 &&
          Array.from({length: 12}, (_, i) => {
            const q = (f + i / 12) % 1;
            const x = exh ? 1650 - q * 1500 : 150 + q * 1500;
            if (x > 800 && x < 1120) return null;
            const yy = y + 12 * Math.sin(i * 2.1);
            const hot = exh ? x > 960 : x > 960;
            return (
              <g key={i} opacity={a1}>
                <circle cx={x} cy={yy} r={11} fill={hot ? C.hot : C.cold} filter="url(#glow)" />
                {hot && <circle cx={x + 9} cy={yy - 9} r={5} fill="#8CCBFF" />}
              </g>
            );
          })}
      </Svg>
      <div style={{position: 'absolute', top: 200, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            fontFamily: FONT, fontWeight: 800, fontSize: 30, padding: '10px 28px', borderRadius: 30,
            color: exh ? C.hot : C.oxy, border: `2.5px solid ${exh ? C.hot : C.oxy}`, background: `${exh ? C.hot : C.oxy}22`,
            opacity: exh ? a1 : a2, boxShadow: `0 0 26px ${exh ? C.hot : C.oxy}55`,
          }}
        >
          {exh ? 'THỞ RA → giữ lại nhiệt + ẩm' : 'HÍT VÀO → trả lại nhiệt + ẩm'}
        </div>
      </div>
      <div style={{position: 'absolute', top: 555, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 26, color: C.oxy, opacity: a0}}>“Mũi nhân tạo” gắn ở chữ Y</div>
      <Chip x={120} y={640} w={880} h={70} c={C.amber} a={a3} s={25}>Thở máy ngắn hạn &lt; 24 giờ: hậu phẫu, ngộ độc</Chip>
      <Chip x={1040} y={640} w={760} h={70} c={C.amber} a={ap(t, st(S, 3) + 0.4)} s={25}>Khoảng chết HME &lt; 2 mL/kg</Chip>
      <Svg>
        {[['HME', C.oxy, C.oxy], ['Phin lọc VK–VR', '#E6ECF4', '#E6ECF4'], ['HME-filter 2 trong 1', C.oxy, '#E6ECF4']].map(([lb, c1, c2], k) => {
          const kk = sp(t, st(S, 4) + 0.2 + k * 0.4, 10);
          const cx = 250 + k * 560;
          return (
            <g key={k} opacity={Math.min(1, kk * 1.4)}>
              <circle cx={cx} cy={810} r={38} fill={c1} />
              <path d={`M${cx},${772} A38,38 0 0,1 ${cx},${848} Z`} fill={c2} />
              <circle cx={cx} cy={810} r={38} fill="none" stroke="#0B1322" strokeWidth={3} />
              <text x={cx + 58} y={820} fill={C.txt} fontFamily={FONT} fontWeight={800} fontSize={28}>{lb}</text>
            </g>
          );
        })}
      </Svg>
    </AbsoluteFill>
  );
};

// ===================== 11. Chống chỉ định HME =====================
const S11: React.FC<P> = ({S}) => {
  const t = useT();
  const items: [string, string, number, string][] = [
    ['ĐÀM', 'đàm đặc hoặc lẫn máu', 1, '#A3E635'],
    ['RÒ', 'VTE < 70% VTI: rò phế quản – màng phổi, NKQ không bóng chèn', 1, C.red],
    ['LẠNH', 'thân nhiệt < 32 °C', 2, C.cold],
    ['THỞ MẠNH', 'thông khí phút tự thở > 10 L/phút', 2, C.amber],
    ['KHÍ DUNG', 'đang phun khí dung trên dây máy thở', 3, C.violet],
  ];
  return (
    <AbsoluteFill>
      <Header num="11" title="Khi nào KHÔNG dùng HME?" t={t} />
      <Roadmap cur={3} t={t} />
      {items.map(([kw, det, j, c], k) => {
        const kk = sp(t, st(S, 0) + 0.6 + k * 0.4, 10);
        const ad = ap(t, st(S, j));
        return (
          <div
            key={kw}
            style={{
              position: 'absolute', left: 110 + k * 342, top: 160, width: 320, height: 500, borderRadius: 28, boxSizing: 'border-box', padding: 26,
              background: `linear-gradient(170deg, ${c}26, rgba(15,24,42,0.9) 45%)`, border: `2.5px solid ${c}`,
              boxShadow: `0 0 34px ${c}40, 0 20px 50px rgba(0,0,0,0.4)`, fontFamily: FONT, color: C.txt,
              opacity: Math.min(1, kk * 1.4), transform: `translateY(${(1 - kk) * 60}px) rotate(${(1 - kk) * (k % 2 ? 4 : -4)}deg)`,
            }}
          >
            <div style={{textAlign: 'center', fontWeight: 800, fontSize: kw.length < 6 ? 52 : 40, color: c, marginTop: 20}}>{kw}</div>
            <div style={{height: 2, background: c, opacity: 0.6, margin: '24px 20px'}} />
            <div style={{textAlign: 'center', fontWeight: 600, fontSize: 25, lineHeight: 1.35, opacity: ad}}>{det}</div>
            <div style={{position: 'absolute', bottom: 30, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: ad}}>
              <svg width={80} height={80}><XMark x={40} y={40} r={22} a={ad} /></svg>
            </div>
          </div>
        );
      })}
      <Memo x={240} y={730} w={1440} h={120} t={t} s0={st(S, 3) + 1.5} size={40}>ĐÀM · RÒ · LẠNH · THỞ MẠNH · KHÍ DUNG → KHÔNG dùng HME</Memo>
    </AbsoluteFill>
  );
};

// ===================== 12. Bộ lọc =====================
const S12: React.FC<P> = ({S}) => {
  const t = useT();
  const [a0, a1, a2, a3, a4] = [0, 1, 2, 3, 4].map((j) => ap(t, st(S, j)));
  const g = geo(120, 140, 1130, 460);
  const fI: [number, number] = [g.pi[0] + 46, g.pi[1]];
  const fE: [number, number] = [g.pe[0] + 46, g.pe[1]];
  const expPath = [...[...g.pat].reverse(), ...g.exp.slice(1)];
  return (
    <AbsoluteFill>
      <Header num="12" title="Trạm 5 · Bộ lọc khí" t={t} />
      <Roadmap cur={4} t={t} />
      <Svg>
        <Circuit g={g} t={t} a={a0} />
        {[fI, fE].map((p, i) => (
          <g key={i} opacity={a0}>
            <circle cx={p[0]} cy={p[1]} r={30} fill={C.red} stroke="#fff" strokeWidth={3} filter="url(#glow)" />
            <path d={`M${p[0] - 14},${p[1] - 12} L${p[0] + 14},${p[1] - 12} M${p[0] - 14},${p[1]} L${p[0] + 14},${p[1]} M${p[0] - 14},${p[1] + 12} L${p[0] + 14},${p[1] + 12}`} stroke="#fff" strokeWidth={2.5} />
          </g>
        ))}
        <circle cx={g.Y[0] + 44} cy={g.Y[1]} r={22} fill="#F5E05A" stroke="#fff" strokeWidth={3} opacity={a0} />
        <Label x={g.Y[0]} y={g.Y[1] + 60} s={22} c="#F5E05A" a={a0}>HME / filter</Label>
        <Label x={fI[0] + 10} y={fI[1] + 66} s={22} a={a1}>Filter hít vào</Label>
        <Label x={fE[0] + 10} y={fE[1] - 48} s={22} a={a2}>Filter thở ra</Label>
        {Array.from({length: 5}, (_, i) => {
          const ph = (t / 3 + i / 5) % 1;
          const fade = Math.min(1, (1 - ph) / 0.1);
          const f1 = Math.min(1, ph * 1.6);
          const x1 = lerp(g.m.x + g.m.w - 70, fI[0] - 38, f1);
          const y1 = g.pi[1] + (i - 2) * 9 + (f1 >= 1 ? 3 * Math.sin(t * 9 + i) : 0);
          const f2 = Math.min(0.97, ph * 1.4);
          const p2 = f2 >= 0.97 ? ([fE[0] + 40 + 3 * Math.sin(t * 9 + i), fE[1] + (i - 2) * 9] as [number, number]) : along(expPath, f2);
          return (
            <g key={i}>
              <Bact x={x1} y={y1} t={t} a={a1 * fade} />
              <Bact x={p2[0]} y={p2[1]} t={t} a={a2 * fade} />
            </g>
          );
        })}
      </Svg>
      <Chip x={1290} y={150} w={540} h={110} c={C.insp} a={a1} s={24}>Lọc hít vào: chặn vi khuẩn từ máy → dây & bệnh nhân</Chip>
      <Chip x={1290} y={280} w={540} h={110} c={C.exp} a={a2} s={24}>Lọc thở ra: chặn vi khuẩn từ bệnh nhân → máy & môi trường</Chip>
      <Chip x={1290} y={410} w={540} h={110} c={C.amber} a={a3} s={24}>Giữ hơi ẩm + thuốc khí dung → bảo vệ cảm biến thở ra</Chip>
      <div style={{position: 'absolute', left: 1290, top: 545, width: 540, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 24, color: C.muted, opacity: a4}}>
        Xử lý filter sau mỗi bệnh nhân
      </div>
      <Memo x={200} y={700} w={1520} h={140} t={t} s0={st(S, 4) + 0.6} size={40}>Lọc VÀO bảo vệ bệnh nhân · Lọc RA bảo vệ máy & mọi người</Memo>
    </AbsoluteFill>
  );
};

// ===================== 13. Khoảng chết cơ học =====================
const S13: React.FC<P> = ({S}) => {
  const t = useT();
  const [a0, a1, a2] = [0, 1, 2].map((j) => ap(t, st(S, j)));
  const y = 380;
  const parts: [string, string, number][] = [['HME', C.oxy, 4], ['Filter', '#E6ECF4', 4], ['Cuvette CO₂', C.amber, 2], ['Cảm biến gần', C.violet, 1.5], ['Ống nối mềm', C.blue, 3]];
  let vol = 0;
  const ks = parts.map((_, k) => sp(t, st(S, 1) + 0.3 + k * 0.5, 11));
  parts.forEach((p, k) => (vol += p[2] * Math.min(1, ks[k])));
  const lim = 6;
  const over = vol > lim;
  const meter = Math.min(1, vol / 15);
  return (
    <AbsoluteFill>
      <Header num="13" title="Khoảng chết cơ học" t={t} />
      <Roadmap cur={4} t={t} />
      <Svg>
        <g opacity={a0}>
          <Tube pts={[[110, 290], [250, y]]} w={16} />
          <Tube pts={[[110, 470], [250, y]]} w={16} />
          <Tube pts={[[280, y], [1690, y], [1690, 360]]} w={16} color="#D8E0EC" />
          <circle cx={262} cy={y} r={24} fill="#F5C451" stroke="#0B1322" strokeWidth={3} />
          <Label x={262} y={y - 44} c="#F5C451" s={24}>chữ Y</Label>
          <Label x={1560} y={y - 30} c={C.muted} s={22}>ống NKQ</Label>
          <Lungs cx={1690} cy={490} s={92} t={t} />
        </g>
        {parts.map(([nm, c], k) => {
          const kk = ks[k];
          const x = 300 + k * 205;
          return (
            <g key={nm} opacity={Math.min(1, kk * 1.4)} transform={`translate(${x + 95},${y}) scale(${0.5 + 0.5 * Math.min(1, kk)}) translate(${-x - 95},${-y})`}>
              <rect x={x} y={y - 54} width={190} height={108} rx={20} fill="#101B30" />
              <rect x={x} y={y - 54} width={190} height={108} rx={20} fill={`${c}30`} stroke={c} strokeWidth={3} />
              <text x={x + 95} y={y + 8} textAnchor="middle" fill={C.txt} fontFamily={FONT} fontWeight={800} fontSize={22}>{nm}</text>
            </g>
          );
        })}
        <g opacity={a1}>
          <path d={`M300,${y - 92} L300,${y - 80} L1320,${y - 80} L1320,${y - 92}`} fill="none" stroke={C.amber} strokeWidth={3} />
        </g>
        <Label x={a1 > 0.01 ? 810 : 960} y={y - 104} c={C.amber} s={26} a={a0}>khoảng chết cơ học = mọi thứ gắn SAU chữ Y</Label>
        {a2 > 0.01 &&
          Array.from({length: 7}, (_, i) => {
            const q = 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / 3 + i * 0.9);
            return <circle key={i} cx={320 + q * 980} cy={y + 30 - (i % 3) * 24} r={8} fill={C.exp} opacity={a2} filter="url(#glow)" />;
          })}
        <g opacity={a2}>
          <rect x={300} y={570} width={1200} height={50} rx={25} fill="#16223A" stroke="rgba(160,185,225,0.25)" strokeWidth={2} />
          <rect x={300} y={570} width={Math.max(50, 1200 * meter)} height={50} rx={25} fill={over ? C.red : C.oxy} filter="url(#glow)" />
          <line x1={300 + (1200 * lim) / 15} y1={548} x2={300 + (1200 * lim) / 15} y2={642} stroke={C.amber} strokeWidth={4} />
          <Label x={300 + (1200 * lim) / 15} y={680} c={C.amber} s={24} w={800}>ngưỡng 2 mL/kg</Label>
          <Label x={1530} y={605} anchor="start" c={over ? C.red : C.muted} s={32} w={800}>→ ứ CO₂</Label>
        </g>
      </Svg>
      <Memo x={420} y={730} w={1080} h={130} t={t} s0={st(S, 3)} size={48}>Trẻ 3 kg → ngưỡng chỉ 6 mL!</Memo>
    </AbsoluteFill>
  );
};

// ===================== 14. Cảm biến lưu lượng =====================
const S14: React.FC<P> = ({S}) => {
  const t = useT();
  const [a0, a1, a2, a3, a4] = [0, 1, 2, 3, 4].map((j) => ap(t, st(S, j)));
  const g = geo(120, 130, 1130, 440);
  const pS = along(g.pat, 0.2);
  const G = '#6EE7A0';
  const pulse = 0.6 + 0.4 * Math.sin(t * 5);
  return (
    <AbsoluteFill>
      <Header num="14" title="Trạm 6 · Cảm biến lưu lượng" t={t} />
      <Roadmap cur={5} t={t} />
      <Svg>
        <Circuit g={g} t={t} a={a0} screen={false} label=" " />
        {[[g.pi, 'hít vào', 48], [g.pe, 'thở ra', -36]].map(([p, lb, dy], k) => {
          const P = p as [number, number];
          return (
            <g key={k} opacity={a0}>
              <rect x={P[0] - 76} y={P[1] - 18} width={46} height={36} rx={8} fill={G} opacity={pulse} filter="url(#glow)" />
              <Label x={g.m.x + g.m.w / 2} y={P[1] + Number(dy)} s={20} c={G}>{`${lb} (trong máy)`}</Label>
            </g>
          );
        })}
        <rect x={pS[0] - 26} y={pS[1] - 20} width={52} height={40} rx={8} fill={G} opacity={a0 * pulse} filter="url(#glow)" />
        <Label x={pS[0]} y={pS[1] - 40} s={22} c={G} a={a0}>gần bệnh nhân (chữ Y)</Label>
      </Svg>
      <Chip x={1290} y={150} w={540} h={74} c={C.oxy} a={a1} s={25}>Kích hoạt theo lưu lượng</Chip>
      <Chip x={1290} y={240} w={540} h={74} c={C.oxy} a={ap(t, st(S, 1) + 0.5)} s={25}>Lưu lượng → thể tích</Chip>
      <Chip x={1290} y={330} w={540} h={110} c={C.oxy} a={a2} s={25}>Bù trừ thể tích, điều chỉnh áp lực (PRVC, VS)</Chip>
      <Glass x={120} y={610} w={820} h={270} a={a3} border={C.blue}>
        <div style={{fontWeight: 800, fontSize: 30, color: C.blue}}>Trong máy</div>
        <div style={{fontSize: 27, fontWeight: 600, marginTop: 18}}>✓ Thường dùng · bền</div>
        <div style={{fontSize: 27, fontWeight: 600, marginTop: 12, color: C.red}}>✗ Bị ảnh hưởng thể tích nén</div>
      </Glass>
      <Glass x={980} y={610} w={820} h={270} a={a4} border={G}>
        <div style={{fontWeight: 800, fontSize: 30, color: G}}>Gần bệnh nhân (proximal)</div>
        <div style={{fontSize: 27, fontWeight: 600, marginTop: 14}}>✓ Sơ sinh · chính xác, nhạy</div>
        <div style={{fontSize: 27, fontWeight: 600, marginTop: 8}}>✓ Không cần tính thể tích nén</div>
        <div style={{fontSize: 27, fontWeight: 600, marginTop: 8, color: C.red}}>✗ Dễ tắc đàm, dơ (không hấp)</div>
      </Glass>
    </AbsoluteFill>
  );
};

// ===================== 15. Khí dung =====================
const S15: React.FC<P> = ({S}) => {
  const t = useT();
  const [a0, a1, a2, a3] = [0, 1, 2, 3].map((j) => ap(t, st(S, j)));
  const g = geo(120, 130, 1130, 460);
  const np = along(g.insp, 0.82);
  const mistA: [number, number][] = [np, g.Y, ...g.exp.slice(1)];
  const mistB: [number, number][] = [np, g.Y, ...g.pat.slice(1)];
  return (
    <AbsoluteFill>
      <Header num="15" title="Trạm 7 · Khí dung trên máy thở" t={t} />
      <Roadmap cur={6} t={t} />
      <Svg>
        <Circuit g={g} t={t} a={a0} flow={0.4} />
        <g opacity={a0}>
          <path d={`M${np[0]},${np[1] + 80} L${np[0] - 40},${np[1] + 150} L${np[0] - 150},${np[1] + 150}`} fill="none" stroke={C.air} strokeWidth={5} />
          <rect x={np[0] - 30} y={np[1] + 6} width={60} height={80} rx={14} fill="rgba(230,236,244,0.85)" stroke="#fff" strokeWidth={2} />
          <rect x={np[0] - 24} y={np[1] + 50} width={48} height={30} rx={8} fill="url(#water)" />
          <Label x={np[0] - 160} y={np[1] + 158} anchor="end" s={22} c={C.air}>khí đẩy</Label>
          <Label x={np[0] + 44} y={np[1] + 70} anchor="start" s={22}>Bình phun</Label>
        </g>
        {a2 > 0.01 && (
          <>
            <Flow pts={mistA} color="#F1F5F9" t={t} a={a2} r={6} gap={18} speed={110} />
            <Flow pts={mistB} color="#F1F5F9" t={t} a={a2} r={6} gap={18} speed={110} />
          </>
        )}
        {a3 > 0.01 && (
          <>
            <circle cx={g.pe[0] + 46} cy={g.pe[1]} r={30} fill={C.red} stroke="#fff" strokeWidth={3} opacity={a3} filter="url(#glow)" />
            <circle cx={g.Y[0] + 44} cy={g.Y[1]} r={22} fill={C.oxy} opacity={0.5 * a3} />
            <XMark x={g.Y[0] + 44} y={g.Y[1]} r={18} a={a3} />
          </>
        )}
      </Svg>
      <div style={{position: 'absolute', left: g.pe[0] + 110, top: g.pe[1] - 92, fontFamily: FONT, fontWeight: 800, fontSize: 23, color: C.amber, opacity: a2, padding: '6px 16px', border: `2px solid ${C.amber}`, borderRadius: 14, background: `${C.amber}22`}}>
        hạt thuốc tới tận van thở ra
      </div>
      <Chip x={1290} y={150} w={540} h={80} c={C.air} a={a1} s={24}>Phun phản lực (jet) — cần khí đẩy</Chip>
      <Chip x={1290} y={245} w={540} h={80} c={C.blue} a={ap(t, st(S, 1) + 0.4)} s={24}>Siêu âm / lưới rung</Chip>
      <Chip x={1290} y={340} w={540} h={80} c={C.violet} a={ap(t, st(S, 1) + 0.8)} s={24}>Bình xịt định liều (MDI) + buồng đệm</Chip>
      <Chip x={120} y={660} w={820} h={190} c={C.red} a={a3} s={36} bold>① THÁO HME khi phun khí dung</Chip>
      <Chip x={980} y={660} w={820} h={190} c={C.oxy} a={ap(t, st(S, 3) + 0.5)} s={36} bold>② GẮN filter thở ra suốt thời gian phun</Chip>
    </AbsoluteFill>
  );
};

// ===================== 16. Tóm tắt =====================
const S16: React.FC<P> = ({S}) => {
  const t = useT();
  const rows: [string, string, number][] = [
    ['ĐIỆN', 'Pin nuôi bộ não · 30–60 phút · sạc 8 giờ/tuần', 0],
    ['KHÍ', 'Điều áp 50 psi (≈ 3,5 bar) · cảm biến O₂ thay 3–6 tháng', 0],
    ['DÂY', '8 – 15 – 22 mm · càng đàn hồi, thể tích nén càng lớn', 1],
    ['ẨM', 'Chữ Y ≈ 37 °C · HME < 24 giờ · tránh ĐÀM · RÒ · LẠNH · THỞ MẠNH · KHÍ DUNG', 2],
    ['LỌC', 'Lọc vào bảo vệ BN, lọc ra bảo vệ máy · khoảng chết < 2 mL/kg', 3],
    ['ĐO', 'Cảm biến gần BN: sơ sinh, chính xác · trong máy: bền', 3],
    ['PHUN', 'Tháo HME · gắn filter thở ra', 3],
  ];
  return (
    <AbsoluteFill>
      <Header num="16" title="Ôn tập 7 trạm" t={t} />
      <Roadmap cur="all" t={t} />
      {rows.map(([s, txt, j], i) => {
        const k = sp(t, st(S, j) + 0.3 + (i % 3) * 0.35, 12);
        return (
          <div
            key={s}
            style={{
              position: 'absolute', left: 120, top: 140 + i * 104, width: 1680, height: 88, borderRadius: 22, display: 'flex', alignItems: 'center',
              background: 'linear-gradient(90deg, rgba(34,50,78,0.85), rgba(15,24,42,0.6))', border: `1.5px solid ${STN_COL[i]}55`,
              boxShadow: '0 12px 30px rgba(0,0,0,0.35)', opacity: Math.min(1, k * 1.4), transform: `translateX(${(1 - k) * -80}px)`,
            }}
          >
            <div
              style={{
                width: 170, height: 60, marginLeft: 16, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: FONT, fontWeight: 800, fontSize: 30, color: STN_COL[i], border: `3px solid ${STN_COL[i]}`,
                background: `${STN_COL[i]}22`, boxShadow: `0 0 20px ${STN_COL[i]}44`,
              }}
            >
              {s}
            </div>
            <div style={{marginLeft: 30, fontFamily: FONT, fontWeight: 600, fontSize: 28, color: C.txt}}>{txt}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const SCENES: React.FC<P>[] = [S0, S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16];
