// BÀI 12 · ĐIỆN GIẢI & QT — Kali, Canxi, QT dài, xoắn đỉnh (bài cuối chuỗi)
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import data from '../data.json';
import keys from './lytes_keys.json';
import stations from './lytes_stations.json';
import {TimeMap, CapCtx, FONT, useT} from '../lib';
import {Caption, Progress} from '../Main';
import {MONO} from './Lab';
import {Fade, SeriesTag} from './Demo';
import {HAND} from '../wb/wb';
import {Memo, Card, Head, DeskBg, ap, PEN} from './Bundle';
import {Strip, Frame} from './Infarct';
import {Monitor} from './Wide';

const RD = '#DC2626', BL = '#2563EB', OR = '#F97316', PU = '#8B5CF6', GR = '#22C55E', TE = '#06B6D4', AM = '#F59E0B', YE = '#CA8A04';
const gs = (x: number, mu: number, w: number, a: number) => a * Math.exp(-((x - mu) ** 2) / (2 * w * w));
const sm = (x: number) => 1 / (1 + Math.exp(-x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ===== mô hình nhát bóp (x = 0 tại đầu QRS) =====
type E = {p?: number; pp?: number; q?: number; r?: number; s?: number; wq?: number; j?: number; t?: number; tp?: number; tw?: number; u?: number};
const N0: Required<E> = {p: 0.12, pp: -0.13, q: 0, r: 1, s: -0.2, wq: 1, j: 0, t: 0.3, tp: 0.3, tw: 0.055, u: 0};
const beatE = (b: E) => {
  const e = {...N0, ...b};
  return (x: number) => {
    const w = e.wq;
    let v = gs(x, e.pp, 0.024, e.p);
    v += gs(x, 0.008 * w, 0.007 * w, e.q) + gs(x, 0.03 * w, 0.011 * w, e.r) + gs(x, 0.06 * w, 0.012 * w, e.s);
    const J = 0.085 * w;
    v += e.j * sm((x - J) / 0.006) * (1 - sm((x - e.tp) / 0.03));
    v += gs(x, e.tp, e.tw, e.t) + gs(x, e.tp + 0.17, 0.035, e.u);
    return v;
  };
};
const trainE = (b: E, rr = 0.9, off = 0.3) => {
  const f = beatE(b);
  return (T: number) => {
    const k = Math.round((T - off) / rr);
    let v = 0;
    for (let i = k - 1; i <= k + 1; i++) v += f(T - (off + i * rr));
    return v;
  };
};
const HYPOK: E = {t: 0.08, tw: 0.06, u: 0.2, j: -0.07};
const PEAK: E = {t: 0.95, tw: 0.034, tp: 0.27};
const FLAT: E = {t: 0.07, tw: 0.065, u: 0.12};
const CAHI: E = {tp: 0.2, tw: 0.05};
const CALO: E = {tp: 0.44, tw: 0.055};

// ===== tăng kali: 0 bình thường → 1 T nhọn → 2 P dẹt, PR dài → 3 QRS rộng → 4 hình sin → 5 rung thất =====
const STG: E[] = [
  {}, {t: 0.95, tw: 0.034, tp: 0.27},
  {p: 0.04, pp: -0.2, t: 0.9, tw: 0.036, tp: 0.3},
  {p: 0, pp: -0.2, r: 0.7, s: -0.4, wq: 3.4, t: 0.7, tw: 0.065, tp: 0.46},
];
const mixE = (a: E, b: E, k: number): E => {
  const A = {...N0, ...a}, B = {...N0, ...b};
  const o: E = {};
  (Object.keys(N0) as (keyof E)[]).forEach((key) => {o[key] = lerp(A[key] as number, B[key] as number, k);});
  return o;
};
const sine = (T: number) => 0.85 * Math.sin(2 * Math.PI * T / 0.75);
const vf = (T: number) => 0.38 * Math.sin(2 * Math.PI * 5.2 * T) + 0.2 * Math.sin(2 * Math.PI * 7.3 * T + 1.3) + 0.12 * Math.sin(2 * Math.PI * 3.1 * T + 0.4);
const hk = (st: number) => {
  if (st <= 3) {
    const i = Math.min(2, Math.floor(st)), k = st - i;
    const rr = lerp(0.9, 1.15, Math.max(0, st - 2));
    return trainE(mixE(STG[i], STG[i + 1] ?? STG[i], i >= 3 ? 0 : k), rr, 0.3);
  }
  const w = trainE(STG[3], 1.15, 0.3);
  if (st <= 4) return (T: number) => lerp(w(T), sine(T), st - 3);
  return (T: number) => lerp(sine(T), vf(T), Math.min(1, st - 4));
};

// ===== thanh trạm =====
const ST7 = ['NHÌN T', 'TĂNG KALI', 'TÌM U', 'CANXI', 'ĐO QT', 'XOẮN ĐỈNH', 'ÔN TẬP'];
const STC = ['#CA8A04', '#DC2626', '#8B5CF6', '#06B6D4', '#2563EB', '#F97316', '#22C55E'];
const StationBar12: React.FC = () => {
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
const Pill: React.FC<{x: number; y: number; a: number; c: string; size?: number; children: React.ReactNode}> = ({x, y, a, c, size = 30, children}) => (
  <div style={{position: 'absolute', left: x, top: y, padding: '8px 20px', borderRadius: 14, background: c, color: '#fff', fontFamily: FONT, fontSize: size, fontWeight: 900, opacity: a, transform: `scale(${0.9 + 0.1 * a})`, transformOrigin: 'left center', boxShadow: '0 10px 22px rgba(0,0,0,0.35)'}}>{children}</div>
);
const Banner: React.FC<{y: number; a: number; c: string; children: React.ReactNode}> = ({y, a, c, children}) => (
  <div style={{position: 'absolute', left: 60, top: y, width: 1800, padding: '18px 28px', borderRadius: 18, background: c, color: '#fff', fontFamily: FONT, fontSize: 36, fontWeight: 900, boxSizing: 'border-box', textAlign: 'center', opacity: a, transform: `scale(${0.94 + 0.06 * a})`, boxShadow: '0 14px 30px rgba(0,0,0,0.4)'}}>{children}</div>
);
const Ruler: React.FC<{X: (T: number) => number; a: number; b: number; y: number; c: string; txt: string; op: number; below?: boolean}> = ({X, a, b, y, c, txt, op, below}) => (
  <g opacity={op}>
    <path d={`M${X(a)},${y - 12} L${X(a)},${y + 12} M${X(a)},${y} L${X(b)},${y} M${X(b)},${y - 12} L${X(b)},${y + 12}`} stroke={c} strokeWidth={4} fill="none" />
    <text x={(X(a) + X(b)) / 2} y={below ? y + 36 : y - 12} textAnchor="middle" fontFamily={FONT} fontSize={24} fontWeight={900} fill={c}>{txt}</text>
  </g>
);

// ================= 0 · BÌA =================
const Cover: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 72% 45%, #3A1430, #0B1218 72%)'}}>
      <div style={{position: 'absolute', left: 110, top: 110, fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: 4, color: '#5EEAD4', opacity: ap(t, 0.2)}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 12</div>
      <div style={{position: 'absolute', left: 106, top: 156, width: 1100, fontFamily: FONT, fontSize: 84, fontWeight: 800, lineHeight: 1.06, color: '#F8FAFC', opacity: ap(t, 0.4)}}>Điện giải <span style={{color: '#F0ABFC'}}>&amp;</span> QT</div>
      <div style={{position: 'absolute', left: 112, top: 262, fontFamily: FONT, fontSize: 36, fontWeight: 700, color: '#CBD5E1', opacity: ap(t, 0.8)}}>Kali · Canxi · QT dài · xoắn đỉnh</div>
      <div style={{position: 'absolute', left: 112, top: 330, fontFamily: FONT, fontSize: 26, fontWeight: 800, opacity: ap(t, 2)}}>
        <span style={{padding: '6px 16px', borderRadius: 12, background: 'rgba(148,163,184,0.2)', color: '#CBD5E1'}}>Bài 11: tăng kali có thể giả ST chênh → hôm nay học kỹ</span>
      </div>
      <div style={{position: 'absolute', left: 110, top: 410, display: 'flex', gap: 16, fontFamily: FONT, fontSize: 46, fontWeight: 900, opacity: ap(t, 4), transform: `scale(${0.85 + 0.15 * ap(t, 4)})`, transformOrigin: 'left center'}}>
        {([['NHÌN T', YE], ['TÌM U', PU], ['ĐO QT', BL]] as const).map(([k, c]) => <span key={k} style={{padding: '10px 26px', borderRadius: 18, border: `5px solid ${c}`, color: '#fff', background: c + '33'}}>{k}</span>)}
      </div>
      <Monitor x={110} y={540} w={1060} h={270} f={trainE(PEAK, 0.8, 0.3)} a={ap(t, 0)} hr="75" />
      <div style={{position: 'absolute', left: 1240, top: 160, width: 600, opacity: ap(t, 0.6)}}>
        {([['bình thường', {}, '#E2E8F0'], ['T cao nhọn', PEAK, '#FDE047'], ['T dẹt + U', HYPOK, '#C4B5FD']] as [string, E, string][]).map(([l, b, c], i) => (
          <div key={l} style={{marginBottom: 24, borderRadius: 14, overflow: 'hidden', boxShadow: '0 14px 28px rgba(0,0,0,0.45)', position: 'relative'}}>
            <Strip L={trainE(b, 0.9, 0.3)} w={600} h={170} q={8} base={0.6} t0={0} stroke={3} />
            <div style={{position: 'absolute', right: 10, top: 8, padding: '2px 12px', borderRadius: 10, background: 'rgba(15,23,42,0.85)', color: c, fontFamily: FONT, fontSize: 22, fontWeight: 900}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 112, top: 840, width: 1700, fontFamily: FONT, fontSize: 20, color: '#94A3B8', opacity: ap(t, 1)}}>Nguồn: 2025 AHA Guidelines (Part 9, Part 10) · 2022 ESC Ventricular Arrhythmias · AHA/ACCF Prevention of Torsade de Pointes · AHA/ACCF/HRS 2009 · LITFL</div>
    </AbsoluteFill>
  );
};

// ================= 1 · NHÌN T =================
const LookT: React.FC = () => {
  const t = useT();
  const cells: [string, E, string, number][] = [['bình thường', {}, '#64748B', -1], ['T cao nhọn', PEAK, YE, 2], ['T dẹt', FLAT, PU, 4]];
  return (
    <DeskBg>
      <Head t={t}>Nhìn T: điện giải đổi tái cực trước tiên</Head>
      {cells.map(([l, b, c, st], i) => (
        <div key={l} style={{position: 'absolute', left: 60 + i * 610, top: 140, opacity: ap(t, st)}}>
          <Frame x={0} y={0} a={1} c={c}>
            <Strip L={trainE(b, 1.0, 0.25)} w={580} h={380} q={13} base={0.68} t0={0} label="II" stroke={4.5}>
              {i === 1 ? (X, Y) => <g opacity={ap(t, 2.6)}><circle cx={X(0.25 + 0.27)} cy={Y(0.75)} r={58} fill="rgba(255,255,255,0.25)" stroke="#334155" strokeWidth={6} /><line x1={X(0.52) + 42} y1={Y(0.75) + 42} x2={X(0.52) + 90} y2={Y(0.75) + 90} stroke="#334155" strokeWidth={11} strokeLinecap="round" /></g> : undefined}
            </Strip>
          </Frame>
          <div style={{position: 'absolute', left: 0, top: 392, width: 580, textAlign: 'center', fontFamily: FONT, fontSize: 30, fontWeight: 900, color: c === '#64748B' ? '#CBD5E1' : c === YE ? '#FDE047' : '#C4B5FD'}}>{l}</div>
        </div>
      ))}
      <Card x={60} y={600} w={880} a={ap(t, 2)} c={YE} title="T CAO, NHỌN, hẹp đáy, cân đối">→ nghĩ TĂNG KALI</Card>
      <Card x={980} y={600} w={880} a={ap(t, 4)} c={PU} title="T DẸT, thấp">→ nghĩ HẠ KALI</Card>
      <Memo x={60} y={760} w={1800} a={ap(t, 6)}>So sánh với ECG cũ · theo dõi nối tiếp</Memo>
    </DeskBg>
  );
};

// ================= 2 · TĂNG KALI: TIẾN TRIỂN =================
const HKProg: React.FC = () => {
  const t = useT();
  const st = Math.max(0, Math.min(5, (t - 1.0) / 2));
  const cur = Math.round(st);
  const labs = ['T cao nhọn', 'P dẹt · PR dài', 'QRS rộng', 'HÌNH SIN', 'RUNG THẤT'];
  const col = (k: number) => [YE, AM, OR, RD, '#7F1D1D'][k];
  return (
    <DeskBg>
      <Head t={t}>Tăng kali: tiến triển trên cùng một dải</Head>
      <Frame x={60} y={130} a={ap(t, -1)} c={cur >= 1 ? col(Math.min(4, cur - 1)) : '#64748B'}>
        <Strip L={hk(st)} w={1800} h={400} q={12} base={0.55} t0={0} label="II" stroke={4.5} />
      </Frame>
      <div style={{position: 'absolute', left: 60, top: 560, width: 1800, display: 'flex', gap: 14}}>
        {labs.map((l, i) => {
          const on = st >= i + 0.5;
          return <div key={l} style={{flex: 1, padding: '14px 10px', borderRadius: 16, textAlign: 'center', fontFamily: FONT, fontSize: 30, fontWeight: 900, color: '#fff', background: on ? col(i) : 'rgba(51,65,85,0.6)', opacity: on ? 1 : 0.55, boxShadow: cur === i + 1 ? `0 0 26px ${col(i)}` : 'none', transform: `scale(${cur === i + 1 ? 1.05 : 1})`}}>{['①', '②', '③', '④', '⑤'][i]} {l}</div>;
        })}
      </div>
      <div style={{position: 'absolute', left: 60, top: 680, width: 1800, display: 'flex', gap: 14}}>
        {[1, 2, 3, 4, 5].map((k) => (
          <div key={k} style={{flex: 1, borderRadius: 12, overflow: 'hidden', outline: st >= k - 0.5 ? `4px solid ${col(k - 1)}` : 'none', opacity: st >= k - 0.5 ? 1 : 0.35}}>
            <Strip L={hk(k)} w={348} h={170} q={6} base={0.55} t0={0} stroke={2.6} />
          </div>
        ))}
      </div>
    </DeskBg>
  );
};

// ================= 3 · TĂNG KALI: BẪY =================
const HKTraps: React.FC = () => {
  const t = useT();
  const minis: [string, (T: number) => number, string][] = [
    ['giả ST chênh', trainE({t: 0.9, tw: 0.04, tp: 0.29, j: 0.25, wq: 1.4, r: 0.5, s: -0.7}, 0.9, 0.3), 'V2'],
    ['giả block nhánh', trainE(STG[3], 1.0, 0.3), 'V1'],
    ['QRS rộng như nhịp nhanh thất', trainE({...STG[3], p: 0}, 0.5, 0.2), 'II'],
  ];
  return (
    <DeskBg>
      <Head t={t}>Tăng kali: những cái bẫy</Head>
      <Card x={60} y={130} w={880} a={ap(t, 0)} c={AM} title="Thứ tự 5 bậc chỉ GẦN ĐÚNG">không phải lúc nào cũng đi đủ từng bậc</Card>
      <div style={{position: 'absolute', left: 980, top: 130, width: 880, padding: '18px 24px', borderRadius: 18, background: '#FEF2F2', border: `4px solid ${RD}`, boxSizing: 'border-box', fontFamily: FONT, opacity: ap(t, 2), boxShadow: '0 14px 30px rgba(0,0,0,0.35)'}}>
        <div style={{fontSize: 22, fontWeight: 900, letterSpacing: 2, color: RD}}>AHA 2025</div>
        <div style={{fontSize: 30, fontWeight: 800, color: '#7F1D1D', marginTop: 6}}>Dấu hiệu ECG: độ nhạy, độ đặc hiệu THẤP</div>
        <div style={{fontSize: 34, fontWeight: 900, color: RD, marginTop: 8}}>ECG bình thường KHÔNG loại trừ</div>
      </div>
      <div style={{position: 'absolute', left: 60, top: 350, fontFamily: FONT, fontSize: 32, fontWeight: 900, color: '#FDE047', opacity: ap(t, 4)}}>Tăng kali là KẺ GIẢ DẠNG:</div>
      {minis.map(([l, f, ld], i) => (
        <div key={l} style={{position: 'absolute', left: 60 + i * 610, top: 405, opacity: ap(t, 4 + i * 0.4)}}>
          <Frame x={0} y={0} a={1} c={OR}><Strip L={f} w={580} h={330} q={10} base={0.55} t0={0} label={ld} stroke={3.6} /></Frame>
          <div style={{position: 'absolute', left: 0, top: 342, width: 580, textAlign: 'center', fontFamily: FONT, fontSize: 28, fontWeight: 900, color: '#FDBA74'}}>{l}</div>
        </div>
      ))}
    </DeskBg>
  );
};

// ================= 4 · TÌM U =================
const LookU: React.FC = () => {
  const t = useT();
  return (
    <DeskBg>
      <Head t={t}>Tìm U: hạ kali</Head>
      <Frame x={60} y={130} a={ap(t, -1)} c={PU}>
        <Strip L={trainE(HYPOK, 1.0, 0.3)} w={1180} h={520} q={22} base={0.6} t0={0.1} label="V2" stroke={5}>
          {(X, Y) => <g>
            <g opacity={ap(t, 2)}><circle cx={X(1.3 + 0.3)} cy={Y(0.04)} r={30} fill="none" stroke={PU} strokeWidth={5} /><text x={X(1.3 + 0.27)} y={Y(0.3)} textAnchor="end" fontFamily={HAND} fontSize={36} fill={PU}>T dẹt</text>
              <circle cx={X(1.3 + 0.47)} cy={Y(0.19)} r={36} fill="none" stroke={RD} strokeWidth={6} /><text x={X(1.3 + 0.52)} y={Y(0.48)} fontFamily={HAND} fontSize={40} fill={RD}>sóng U</text></g>
            <g opacity={ap(t, 4)}><path d={`M${X(1.3 + 0.16)},${Y(-0.32)} L${X(1.3 + 0.16)},${Y(-0.1)}`} stroke={BL} strokeWidth={5} markerEnd="url(#arL)" /><text x={X(1.3 + 0.16)} y={Y(-0.32) + 34} textAnchor="middle" fontFamily={HAND} fontSize={32} fill={BL}>ST chênh xuống</text></g>
            <g opacity={ap(t, 6)}>
              <Ruler X={X} a={0.3} b={0.3 + 0.38} y={Y(-0.75)} c="#475569" txt="QT" op={1} />
              <Ruler X={X} a={1.3} b={1.3 + 0.55} y={Y(-0.75)} c={RD} txt="QU — dễ nhầm QT dài" op={1} />
            </g>
            <defs><marker id="arL" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={BL} /></marker></defs>
          </g>}
        </Strip>
      </Frame>
      <Card x={1280} y={130} w={580} a={ap(t, 0)} c={PU} title="HẠ KALI" />
      <Card x={1280} y={230} w={580} a={ap(t, 2)} c={PU} title="T dẹt / đảo · sóng U rõ">rõ nhất ở V2 – V3</Card>
      <Card x={1280} y={370} w={580} a={ap(t, 4)} c={BL} title="ST chênh xuống nhẹ" />
      <Card x={1280} y={470} w={580} a={ap(t, 6)} c={RD} title="T + U nhập nhau">trông như QT dài — thực ra là QU</Card>
      <Memo x={60} y={690} w={1800} a={ap(t, 8)}>HẠ MAGIE: hình ảnh giống hệt, hay đi kèm hạ kali · cả hai dễ gây <span style={{color: PEN}}>XOẮN ĐỈNH</span></Memo>
    </DeskBg>
  );
};

// ================= 5 · CANXI =================
const Calcium: React.FC = () => {
  const t = useT();
  const rows: [string, E, string, number, number][] = [
    ['TĂNG canxi · ST NGẮN', CAHI, TE, 2, 0.27],
    ['bình thường', {}, '#64748B', 0, 0.36],
    ['HẠ canxi · ST KÉO DÀI · T bình thường', CALO, PU, 4, 0.5],
  ];
  return (
    <DeskBg>
      <Head t={t}>Canxi đổi đoạn ST</Head>
      {rows.map(([l, b, c, st, qt], i) => (
        <div key={l} style={{position: 'absolute', left: 60, top: 130 + i * 228, opacity: ap(t, st)}}>
          <Frame x={0} y={0} a={1} c={c}>
            <Strip L={trainE(b, 1.0, 0.3)} w={1180} h={205} q={10} base={0.62} t0={0} label="II" stroke={3.6}>
              {(X, Y) => <g>
                <Ruler X={X} a={1.3} b={1.3 + qt} y={Y(-0.3)} c={c === '#64748B' ? '#334155' : c} txt={`QT ${qt.toFixed(2).replace('.', ',')} s`} op={ap(t, st + 0.5)} below />
                {i !== 1 && <rect x={X(1.3 + 0.09)} y={Y(0.08)} width={X(1.3 + b.tp! - 0.06) - X(1.3 + 0.09)} height={Y(-0.08) - Y(0.08)} rx={6} fill={c + '33'} opacity={ap(t, st + 0.5)} />}
              </g>}
            </Strip>
          </Frame>
          <div style={{position: 'absolute', left: 1210, top: 70, width: 600, fontFamily: FONT, fontSize: 32, fontWeight: 900, color: c === TE ? '#67E8F9' : c === PU ? '#C4B5FD' : '#CBD5E1'}}>{l}</div>
        </div>
      ))}
      <Banner y={830} a={ap(t, 6)} c={GR}>Mẹo: KALI đổi sóng T · CANXI đổi đoạn ST</Banner>
    </DeskBg>
  );
};

// ================= 6 · ĐO QT =================
const MeasureQT: React.FC = () => {
  const t = useT();
  const f = beatE({});
  // tiếp tuyến dốc nhất ở sườn xuống của T
  let xm = 0.3, mm = 0;
  for (let x = 0.3; x < 0.45; x += 0.001) {const m = (f(x + 0.001) - f(x)) / 0.001; if (m < mm) {mm = m; xm = x;}}
  const ym = f(xm), xEnd = xm - ym / mm;
  const off = 0.35, rr = 1.0;
  const tr = trainE({}, rr, off);
  const q = 20;
  return (
    <DeskBg>
      <Head t={t}>Đo QT</Head>
      <Frame x={60} y={125} a={ap(t, -1)} c={BL}>
        <Strip L={tr} w={1180} h={560} q={q} base={0.66} t0={0} label="II" stroke={5}>
          {(X, Y) => <g>
            <g opacity={ap(t, 0.3)}><line x1={X(off)} x2={X(off)} y1={Y(1.3)} y2={Y(-0.45)} stroke={BL} strokeWidth={4} strokeDasharray="10 8" /><text x={X(off) - 8} y={Y(1.2)} textAnchor="end" fontFamily={HAND} fontSize={30} fill={BL}>đầu QRS</text></g>
            <g opacity={ap(t, 2)}>
              <line x1={X(off + xm - 0.06)} y1={Y(ym - mm * 0.06)} x2={X(off + xEnd + 0.03)} y2={Y(mm * 0.03)} stroke={RD} strokeWidth={4} />
              <circle cx={X(off + xEnd)} cy={Y(0)} r={10} fill={RD} />
              <text x={X(off + xEnd) + 14} y={Y(0) + 40} fontFamily={HAND} fontSize={30} fill={RD}>cuối T (tiếp tuyến)</text>
            </g>
            <Ruler X={X} a={off} b={off + xEnd} y={Y(-0.32)} c={BL} txt="QT" op={ap(t, 2.4)} />
            <g opacity={ap(t, 8)}><Ruler X={X} a={off} b={off + rr} y={Y(1.45)} c={GR} txt="RR" op={1} /><Ruler X={X} a={off} b={off + rr / 2} y={Y(-0.6)} c={AM} txt="½ RR" op={1} /></g>
          </g>}
        </Strip>
      </Frame>
      <Card x={1280} y={125} w={580} a={ap(t, 0)} c={BL} title="Từ ĐẦU QRS → CUỐI T">đo ở II hoặc V5 · không tính sóng U</Card>
      <div style={{position: 'absolute', left: 1280, top: 265, width: 580, padding: '16px 22px', borderRadius: 16, background: '#FCFAF4', borderLeft: `10px solid ${BL}`, boxSizing: 'border-box', fontFamily: FONT, opacity: ap(t, 4), boxShadow: '0 14px 30px rgba(0,0,0,0.35)'}}>
        <div style={{fontSize: 24, fontWeight: 800, color: '#475569'}}>Bazett</div>
        <div style={{fontSize: 40, fontWeight: 900, color: BL, fontFamily: MONO}}>QTc = QT ÷ √RR</div>
        <div style={{fontSize: 24, fontWeight: 800, color: '#475569', marginTop: 10, opacity: ap(t, 6)}}>Tim nhanh → Fridericia</div>
        <div style={{fontSize: 36, fontWeight: 900, color: PU, fontFamily: MONO, opacity: ap(t, 6)}}>QTc = QT ÷ ∛RR</div>
      </div>
      <Pill x={1280} y={545} a={ap(t, 8)} c={AM} size={28}>QT &gt; ½ RR → nghi QT dài</Pill>
      <div style={{position: 'absolute', left: 60, top: 720, width: 1800, display: 'flex', gap: 16, fontFamily: FONT, opacity: ap(t, 10)}}>
        {([['QTc dài', '≥ 450 ms (nam) · ≥ 460 ms (nữ)', AM], ['NGUY CƠ CAO', '> 500 ms', RD]] as const).map(([k, v, c]) => (
          <div key={k} style={{flex: 1, padding: '16px 24px', borderRadius: 16, background: c, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 12px 26px rgba(0,0,0,0.35)'}}>
            <span style={{fontSize: 32, fontWeight: 900}}>{k}</span><span style={{fontSize: 34, fontWeight: 900}}>{v}</span>
          </div>
        ))}
      </div>
    </DeskBg>
  );
};

const SCN: React.FC[] = [Cover, LookT, HKProg, HKTraps, LookU, Calcium, MeasureQT];
export const LYTES_N = 7;
export const Lytes: React.FC = () => (
  <AbsoluteFill style={{background: '#0E1116', fontFamily: FONT}}>
    <Audio src={staticFile('narration.m4a')} />
    <CapCtx.Provider value={false}>
      {data.scenes.slice(0, Math.min(SCN.length, data.scenes.length)).map((s, i) => {
        const Comp = SCN[i];
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
    <SeriesTag sub="Điện giải & QT" />
    <StationBar12 />
    <Caption />
    <Progress />
  </AbsoluteFill>
);
export {beatE, trainE, hk, PEAK, HYPOK, FLAT, CAHI, CALO, STG, Pill, Banner, Ruler, StationBar12};
export type {E};
void TE; void lerp;
