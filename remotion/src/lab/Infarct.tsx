// BÀI 5: NHỒI MÁU CƠ TIM ST CHÊNH LÊN TRÊN ĐIỆN TÂM ĐỒ — NHẬN DIỆN VÀ ĐỊNH KHU · CHÊNH – SOI GƯƠNG – ĐỊNH KHU
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import data from '../data.json';
import keys from './infarct_keys.json';
import stations from './infarct_stations.json';
import {TimeMap, CapCtx, FONT, useT} from '../lib';
import {Caption, Progress} from '../Main';
import {MONO} from './Lab';
import {Fade, SeriesTag} from './Demo';
import {Heart6, SC as HSC, OX as HOX, OY as HOY} from '../wb/heart6';
import {HAND} from '../wb/wb';
import {beatV, ecgAt, Lead, LAYOUT, NORMAL, INFERIOR} from './ecg';
import {Sheet, cellPos} from './Paper';
import {Memo, Card, Head, DeskBg, Pink, ap, dp, useBeat, INK, PEN} from './Bundle';

const CI = '#FACC15', CJ = '#DC2626', CN = '#475569'; // thiếu máu · tổn thương · hoại tử
const CG = '#16A34A', CB = '#F97316', CF = '#2563EB'; // nhóm dưới · bên · trước
const CRCA = '#2563EB', CLAD = '#DC2626', CLCX = '#F59E0B';
const h2s = (x: number, y: number, s: number, p: number[]): [number, number] => [x + s * (HOX + p[0] * HSC), y + s * (HOY + p[1] * HSC)];

// ===== ô ECG đúng tỉ lệ: q px/ô nhỏ → 25 mm/s, 10 mm/mV =====
const Strip: React.FC<{L: Lead | ((T: number) => number); w: number; h: number; q?: number; base?: number; label?: string; t0?: number; prog?: number; stroke?: number; dark?: boolean; children?: (X: (T: number) => number, Y: (v: number) => number) => React.ReactNode}> = ({L, w, h, q = 10, base = 0.6, label, t0 = 0, prog = 1, stroke = 3, dark, children}) => {
  const pxs = 25 * q, pxmv = 10 * q, B = h * base;
  const X = (T: number) => 10 + (T - t0) * pxs, Y = (v: number) => B - v * pxmv;
  const f = typeof L === 'function' ? L : (T: number) => ecgAt(T, L, 0.8, 0.15);
  const pts: string[] = [];
  for (let T = t0; X(T) < w - 6; T += 0.003) pts.push(`${X(T).toFixed(1)},${Y(f(T)).toFixed(1)}`);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{display: 'block'}}>
      {dark ? <rect width={w} height={h} fill="#0B1220" /> : <Pink w={w} h={h} mm={q} />}
      {label && <text x={12} y={34} fontFamily={MONO} fontSize={28} fontWeight={700} fill={dark ? '#E2E8F0' : INK}>{label}</text>}
      <polyline points={pts.join(' ')} fill="none" stroke={dark ? '#F8FAFC' : INK} strokeWidth={stroke} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
      {children?.(X, Y)}
    </svg>
  );
};
const Frame: React.FC<{x: number; y: number; a: number; c?: string; children: React.ReactNode}> = ({x, y, a, c, children}) => (
  <div style={{position: 'absolute', left: x, top: y, borderRadius: 14, overflow: 'hidden', boxShadow: '0 18px 36px rgba(0,0,0,0.45)', outline: c ? `5px solid ${c}` : undefined, opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>{children}</div>
);
// mẫu sóng
const S: Record<string, Lead> = {
  norm: {},
  hyper: {t: 1.05, tw: 0.06, tPos: 0.25},
  stemi: {st: 0.38, t: 0.42, tw: 0.075, tPos: 0.23},
  tomb: {r: 0.7, s: 0, st: 0.55, t: 0.75, tw: 0.09, tPos: 0.22},
  qwave: {q: -0.45, r: 0.35, s: -0.1, st: 0.12, t: 0.3},
  tinv: {q: -0.45, r: 0.35, s: -0.1, st: 0, t: -0.32, tw: 0.07},
  dep: {r: 0.6, s: -0.2, st: -0.22, t: -0.12},
  peri: {r: 0.9, s: -0.15, st: 0.18, t: 0.35, tw: 0.07},
};
const NORM12: Record<string, Lead> = {
  I: {r: 0.6, s: -0.1, t: 0.25}, II: {r: 1.0, s: -0.2, t: 0.3}, III: {r: 0.5, s: -0.2, t: 0.12},
  aVR: {p: -0.1, q: 0.05, r: -0.75, s: 0.1, t: -0.22}, aVL: {r: 0.35, s: -0.2, t: 0.12}, aVF: {r: 0.75, s: -0.2, t: 0.2},
  V1: {q: 0, r: 0.2, s: -0.9, t: 0.1}, V2: {q: 0, r: 0.4, s: -1.2, t: 0.4}, V3: {r: 0.75, s: -0.8, t: 0.4},
  V4: {r: 1.2, s: -0.45, t: 0.4}, V5: {r: 1.15, s: -0.25, t: 0.35}, V6: {r: 0.9, s: -0.15, t: 0.3},
};

// ===== THANH TRẠM =====
const ST7 = ['THIẾU MÁU · TỔN THƯƠNG · HOẠI TỬ', 'TIÊU CHUẨN', 'SOI GƯƠNG', 'TIẾN TRIỂN', 'ĐỊNH KHU', 'THÀNH SAU & THẤT PHẢI', 'ÔN TẬP'];
const STC = ['#F59E0B', '#DC2626', '#06B6D4', '#8B5CF6', '#2563EB', '#16A34A', '#22C55E'];
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
  const beat = useBeat();
  const rt = useCurrentFrame() / 30;
  const W = 640, H = 170;
  const scroll = (rt * 0.9) % 0.8;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 72% 42%, #3A1418, #0B1218 72%)'}}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="cv5" x={1180} y={130} s={1.25} prog={dp(t, 0.1, 1.2)} art={dp(t, 0.6, 1.5)} labels={false} beat={beat} zone="ant" zoneC="#FF3B3B" zoneA={ap(t, 1.2) * 0.9} hot="lad" occl={ap(t, 1.0)} />
      </svg>
      <div style={{position: 'absolute', left: 110, top: 130, fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: 4, color: '#5EEAD4', opacity: ap(t, 0.2)}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 5</div>
      <div style={{position: 'absolute', left: 106, top: 176, width: 1080, fontFamily: FONT, fontSize: 80, fontWeight: 800, lineHeight: 1.06, color: '#F8FAFC', opacity: ap(t, 0.4)}}>
        Nhồi máu cơ tim<br /><span style={{color: '#FB7185'}}>ST chênh lên</span>
      </div>
      <div style={{position: 'absolute', left: 112, top: 360, fontFamily: FONT, fontSize: 34, fontWeight: 700, color: '#CBD5E1', opacity: ap(t, 0.8)}}>trên điện tâm đồ · <span style={{color: '#FDE047'}}>Nhận diện và định khu</span></div>
      <div style={{position: 'absolute', left: 110, top: 440, display: 'flex', gap: 18}}>
        {[['CHÊNH', CJ], ['SOI GƯƠNG', '#06B6D4'], ['ĐỊNH KHU', CF]].map(([s, c], i) => {
          const k = ap(t, 2.0 + i * 0.35, 0.4);
          return <div key={s} style={{padding: '12px 26px', borderRadius: 18, border: `3px solid ${c}`, background: 'rgba(255,255,255,0.06)', fontFamily: FONT, fontSize: 40, fontWeight: 900, color: c, opacity: k, transform: `scale(${0.85 + 0.15 * k})`}}>{i + 1}. {s}</div>;
        })}
      </div>
      <Frame x={110} y={560} a={ap(t, 4.0)}>
        <Strip L={S.stemi} w={W} h={H} q={9} base={0.62} t0={scroll} label="V3" stroke={3} />
      </Frame>
      <div style={{position: 'absolute', left: 112, top: 800, width: 1000, fontFamily: FONT, fontSize: 20, color: '#94A3B8', opacity: ap(t, 1.0)}}>Nguồn: Fifth Universal Definition of Myocardial Infarction (ESC/ACC/AHA/WHF 2026) · 2025 ACC/AHA ACS Guideline · 2023 ESC ACS · AHA/ACCF/HRS ECG Part VI · LITFL</div>
    </AbsoluteFill>
  );
};

// ================= 1 · BA VÙNG =================
const Zones: React.FC = () => {
  const t = useT();
  const HX = 30, HY = 110, HS = 1.3;
  const [cx, cy] = h2s(HX, HY, HS, [730, 850]);
  const ring = (r: number, c: string, s: number, lab: string, dx: number, dy: number) => {
    const k = ap(t, s, 0.7);
    return (
      <g opacity={k}>
        <circle cx={cx} cy={cy} r={r * (0.6 + 0.4 * k)} fill={c} fillOpacity={0.55} stroke="#fff" strokeWidth={3} />
        <g opacity={ap(t, s + 0.3)}>
          <line x1={cx + r * 0.7} y1={cy - r * 0.7} x2={cx + dx} y2={cy + dy} stroke="#fff" strokeWidth={2} />
          <rect x={cx + dx} y={cy + dy - 22} width={lab.length * 15 + 30} height={44} rx={22} fill={c === CI ? '#A16207' : c} />
          <text x={cx + dx + (lab.length * 15 + 30) / 2} y={cy + dy + 9} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={800} fill="#fff">{lab}</text>
        </g>
      </g>
    );
  };
  return (
    <DeskBg>
      <Head t={t}>Ba vùng quanh ổ tắc mạch</Head>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="z5" x={HX} y={HY} s={HS} prog={1} art={1} labels={false} hot="lad" occl={ap(t, 0)} />
        {ring(140, CI, 2, 'thiếu máu', 120, -230)}
        {ring(92, CJ, 4, 'tổn thương', 160, -150)}
        {ring(48, CN, 6, 'hoại tử', 200, -70)}
      </svg>
      {[
        [S.hyper, 'T tối cấp → T đảo', CI, 2],
        [S.stemi, 'ST chênh lên', CJ, 4],
        [S.qwave, 'sóng Q hoại tử', CN, 6],
      ].map(([L, lab, c, s], i) => (
        <div key={i}>
          <Frame x={1060} y={140 + i * 250} a={ap(t, s as number)} c={c as string}>
            <Strip L={L as Lead} w={420} h={210} q={10} base={0.62} t0={-0.2} />
          </Frame>
          <div style={{position: 'absolute', left: 1500, top: 205 + i * 250, width: 360, fontFamily: FONT, fontSize: 34, fontWeight: 900, color: c === CI ? '#FDE047' : c === CN ? '#CBD5E1' : '#FCA5A5', opacity: ap(t, (s as number) + 0.3)}}>{lab as string}</div>
        </div>
      ))}
    </DeskBg>
  );
};

// ================= 2 · ĐO ST TẠI ĐIỂM J =================
const MeasureJ: React.FC = () => {
  const t = useT();
  const L = S.stemi;
  const f = (T: number) => beatV(T, L);
  const q = 32, W = 1180, H = 620;
  return (
    <DeskBg>
      <Head t={t}>Đo ST tại điểm J</Head>
      <Frame x={60} y={140} a={ap(t, -1)}>
        <Strip L={f} w={W} h={H} q={q} base={0.66} t0={-0.3} stroke={6} prog={dp(t, 0, 1.0)}>
          {(X, Y) => (
            <g>
              <g opacity={ap(t, 4)}>
                <line x1={X(-0.3)} x2={X(0.6)} y1={Y(0)} y2={Y(0)} stroke="#2563EB" strokeWidth={4} strokeDasharray="14 10" />
                <rect x={X(-0.12)} y={Y(0) - 26} width={X(-0.04) - X(-0.12)} height={52} rx={10} fill="rgba(37,99,235,0.18)" stroke="#2563EB" strokeWidth={3} />
                <text x={X(-0.08)} y={Y(0) + 62} textAnchor="middle" fontFamily={HAND} fontSize={36} fill="#2563EB">đoạn PR</text>
                <text x={X(0.42)} y={Y(0) + 50} fontFamily={HAND} fontSize={34} fill="#2563EB">đường đẳng điện</text>
              </g>
              <g opacity={ap(t, 2)}>
                <circle cx={X(0.06)} cy={Y(f(0.06))} r={14} fill={PEN} stroke="#fff" strokeWidth={3} />
                <text x={X(0.06) - 70} y={Y(f(0.06)) - 120} textAnchor="end" fontFamily={HAND} fontSize={44} fill={PEN}>điểm J</text>
                <line x1={X(0.06) - 74} y1={Y(f(0.06)) - 112} x2={X(0.06) - 8} y2={Y(f(0.06)) - 18} stroke={PEN} strokeWidth={3} />
              </g>
              <g opacity={ap(t, 4.6)}>
                <line x1={X(0.075)} x2={X(0.075)} y1={Y(0)} y2={Y(f(0.06))} stroke={PEN} strokeWidth={5} />
                <path d={`M${X(0.075) - 12},${Y(0)} h24 M${X(0.075) - 12},${Y(f(0.06))} h24`} stroke={PEN} strokeWidth={5} />
                <text x={X(0.075) + 18} y={(Y(0) + Y(f(0.06))) / 2 + 12} fontFamily={MONO} fontSize={32} fontWeight={700} fill={PEN}>ST ↑ {Math.round(f(0.06) * 10)} mm</text>
              </g>
            </g>
          )}
        </Strip>
      </Frame>
      <Card x={1280} y={140} w={580} a={ap(t, 0)} c={PEN} title="Đo ST tại ĐIỂM J" >so với đường đẳng điện</Card>
      <Card x={1280} y={300} w={580} a={ap(t, 2)} c={PEN} title="Điểm J">QRS kết thúc · ST bắt đầu</Card>
      <Card x={1280} y={460} w={580} a={ap(t, 4)} c="#2563EB" title="Đường đẳng điện">đoạn PR (hoặc TP) ngay trước</Card>
      <Memo x={1280} y={630} w={580} a={ap(t, 4.6)}>1 ô nhỏ = 1 mm = 0,1 mV</Memo>
    </DeskBg>
  );
};

// ================= 3 · NGƯỠNG =================
const Thresholds: React.FC = () => {
  const t = useT();
  const q = 40, W = 1060, H = 560, B = 470;
  const cols: [string, number, string, number][] = [['Nam ≥ 40', 2, '#2563EB', 2], ['Nam < 40', 2.5, '#7C3AED', 2.3], ['Nữ', 1.5, '#DB2777', 2.6], ['Chỗ khác', 1, CG, 4]];
  return (
    <DeskBg>
      <Head t={t}>Ngưỡng ST chênh lên</Head>
      <Frame x={60} y={140} a={ap(t, -1)}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
          <Pink w={W} h={H} mm={q} />
          <line x1={0} x2={W} y1={B} y2={B} stroke={INK} strokeWidth={4} />
          <text x={20} y={B + 50} fontFamily={MONO} fontSize={24} fontWeight={700} fill={INK}>đẳng điện</text>
          <g opacity={ap(t, 2)}><rect x={40} y={20} width={700} height={56} rx={12} fill="#1E293B" /><text x={390} y={58} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={900} fill="#fff">V2 – V3</text></g>
          {cols.map(([lab, mm, c, s], i) => {
            const k = ap(t, s, 0.6);
            const x = 80 + i * 240, h = mm * q * k;
            return (
              <g key={lab} opacity={Math.min(1, k * 2)}>
                <rect x={x} y={B - h} width={140} height={h} fill={c} opacity={0.85} rx={6} />
                <text x={x + 70} y={B - h - 18} textAnchor="middle" fontFamily={MONO} fontSize={40} fontWeight={800} fill={c}>{String(mm).replace('.', ',')} mm</text>
                <text x={x + 70} y={B - mm * q - 70} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill={INK}>{lab}</text>
              </g>
            );
          })}
          <line x1={780} x2={780} y1={90} y2={H - 20} stroke="#94A3B8" strokeWidth={3} strokeDasharray="10 8" opacity={ap(t, 4)} />
        </svg>
      </Frame>
      <Card x={1160} y={140} w={700} a={ap(t, 0)} c={PEN} title="ST chênh lên MỚI">ở ≥ 2 chuyển đạo liên tiếp</Card>
      <Card x={1160} y={300} w={700} a={ap(t, 6)} c="#475569" title="Vì sao V2 – V3 ngưỡng cao hơn?">người bình thường có thể hơi chênh sẵn</Card>
      <div style={{position: 'absolute', left: 1160, top: 470, width: 700, padding: '18px 24px', borderRadius: 16, background: PEN, color: '#fff', fontFamily: FONT, fontSize: 30, fontWeight: 800, boxSizing: 'border-box', opacity: ap(t, 8), transform: `scale(${0.92 + 0.08 * ap(t, 8)})`, transformOrigin: 'left center', boxShadow: '0 12px 28px rgba(0,0,0,0.4)'}}>⚠ Không áp dụng khi có phì đại thất trái hoặc block nhánh trái</div>
      <Memo x={60} y={740} w={1060} a={ap(t, 4.4)}>V2 – V3: <span style={{color: '#2563EB'}}>2</span> · <span style={{color: '#7C3AED'}}>2,5</span> · <span style={{color: '#DB2777'}}>1,5</span> mm — chỗ khác <span style={{color: CG}}>1 mm</span></Memo>
    </DeskBg>
  );
};

// ================= 4 · CHUYỂN ĐẠO LIÊN TIẾP =================
const SHEET_S = 0.8;
const GroupRects: React.FC<{groups: [string[], string, number][]; marks?: [string, number][]}> = ({groups, marks = []}) => (
  <svg viewBox="0 0 1500 760" width={1500 * SHEET_S} height={760 * SHEET_S} style={{position: 'absolute', left: 0, top: 0}}>
    {groups.map(([lds, c, a], gi) => lds.map((ld) => {
      const [x, y0] = cellPos(ld);
      return <rect key={gi + ld} x={x + 6} y={y0 - 100} width={375 - 12} height={160} rx={12} fill={c} fillOpacity={0.16 * a} stroke={c} strokeWidth={5} opacity={a} />;
    }))}
    {marks.map(([ld, a]) => {
      const [x, y0] = cellPos(ld);
      return <g key={ld} opacity={a} transform={`translate(${x + 330} ${y0 - 70})`}><circle r={26} fill={PEN} stroke="#fff" strokeWidth={3} /><path d="M-10,-10 L10,10 M10,-10 L-10,10" stroke="#fff" strokeWidth={6} strokeLinecap="round" /></g>;
    })}
  </svg>
);
const SheetBox: React.FC<{x: number; y: number; a: number; leads: Record<string, Lead>; children?: React.ReactNode; rings?: {lead: string[]; prog: number; color: string}[]}> = ({x, y, a, leads, children, rings}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 1500 * SHEET_S, height: 760 * SHEET_S, borderRadius: 10, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.45)', opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>
    <div style={{transform: `scale(${SHEET_S})`, transformOrigin: 'top left'}}><Sheet leads={leads} rings={rings} /></div>
    {children}
  </div>
);
const Contiguous: React.FC = () => {
  const t = useT();
  return (
    <DeskBg>
      <Head t={t}>Chuyển đạo “liên tiếp”</Head>
      <SheetBox x={60} y={140} a={ap(t, -1)} leads={NORM12}>
        <GroupRects groups={[[['II', 'III', 'aVF'], CG, ap(t, 2)], [['I', 'aVL', 'V5', 'V6'], CB, ap(t, 2.5)], [['V1', 'V2', 'V3', 'V4'], CF, ap(t, 3)]]} marks={[['III', ap(t, 4.2)], ['V2', ap(t, 4.4)]]} />
      </SheetBox>
      <Card x={1300} y={140} w={560} a={ap(t, 0)} c="#475569" title="Liên tiếp = cùng nhìn một vùng tim" />
      <Card x={1300} y={270} w={560} a={ap(t, 2)} c={CG} title="Dưới: II, III, aVF" />
      <Card x={1300} y={370} w={560} a={ap(t, 2.5)} c={CB} title="Bên: I, aVL, V5, V6" />
      <Card x={1300} y={470} w={560} a={ap(t, 3)} c={CF} title="Trước: V1 → V6 kề nhau" />
      <Memo x={1300} y={600} w={560} a={ap(t, 4)}>III + V2 → <span style={{color: PEN}}>KHÔNG</span> liên tiếp</Memo>
    </DeskBg>
  );
};

// ================= 5 · SOI GƯƠNG (phòng vector) =================
const Eye: React.FC<{x: number; y: number; ang: number; c: string; label: string; a: number}> = ({x, y, ang, c, label, a}) => (
  <g opacity={a} transform={`translate(${x} ${y})`}>
    <g transform={`rotate(${ang})`}>
      <path d="M-46,0 Q0,-34 46,0 Q0,34 -46,0 Z" fill="#F8FAFC" stroke={c} strokeWidth={5} />
      <circle r={15} fill={c} /><circle r={6} fill="#0B1220" />
    </g>
    <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={900} fill={c}>{label}</text>
  </g>
);
const Mirror: React.FC = () => {
  const t = useT();
  const beat = useBeat();
  const HX = 160, HY = 120, HS = 1.0;
  const [cx, cy] = h2s(HX, HY, HS, [640, 820]);
  const vk = dp(t, 0.6, 1.0);
  const post = ap(t, 6, 0.6);
  return (
    <AbsoluteFill style={{background: '#0B1220'}}>
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)', backgroundSize: '60px 60px'}} />
      <Head t={t}>Soi gương</Head>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <defs><marker id="arV" markerUnits="userSpaceOnUse" markerWidth="40" markerHeight="40" refX="6" refY="20" orient="auto"><path d="M0,0 L36,20 L0,40 Z" fill="#FDE047" /></marker></defs>
        <g opacity={1 - post}>
          <Heart6 id="mr5" x={HX} y={HY} s={HS} prog={1} art={1} labels={false} beat={beat} zone="inf" zoneC="#FF3B3B" zoneA={ap(t, 0.2) * 0.9} />
          <line x1={cx} y1={cy - 140} x2={cx} y2={cy - 140 + 230 * vk} stroke="#FDE047" strokeWidth={12} markerEnd="url(#arV)" opacity={vk > 0.02 ? 1 : 0} />
          <text x={cx + 200} y={cy + 60} fontFamily={FONT} fontSize={28} fontWeight={800} fill="#FDE047" opacity={vk}>vector tổn thương ↓</text>
          <Eye x={cx} y={cy + 230} ang={-90} c={CG} label="II · III · aVF" a={ap(t, 0.2)} />
          <Eye x={cx + 330} y={cy - 300} ang={110} c={CB} label="aVL" a={ap(t, 0.6)} />
        </g>
        <g opacity={post}>
          <text x={500} y={250} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={900} fill="#E2E8F0">Thành sau ↔ V1 – V3</text>
          <line x1={500} y1={300} x2={500} y2={820} stroke="#94A3B8" strokeWidth={4} strokeDasharray="12 10" />
          <text x={500} y={860} textAnchor="middle" fontFamily={HAND} fontSize={34} fill="#94A3B8">gương</text>
        </g>
      </svg>
      {/* cặp ô: nhìn từ hai phía */}
      <div style={{opacity: 1 - post}}>
        <Frame x={1120} y={170} a={ap(t, 0.6)} c={CB}><Strip L={S.dep} w={360} h={200} q={12} base={0.5} t0={-0.2} label="aVL" dark /></Frame>
        <div style={{position: 'absolute', left: 1500, top: 230, fontFamily: FONT, fontSize: 34, fontWeight: 900, color: '#FDBA74', opacity: ap(t, 0.8)}}>ST ↓ (nhìn từ<br />phía đối diện)</div>
        <Frame x={1120} y={420} a={ap(t, 0.2)} c={CG}><Strip L={S.stemi} w={360} h={200} q={12} base={0.62} t0={-0.2} label="III" dark /></Frame>
        <div style={{position: 'absolute', left: 1500, top: 480, fontFamily: FONT, fontSize: 34, fontWeight: 900, color: '#86EFAC', opacity: ap(t, 0.4)}}>ST ↑ (nhìn vào<br />vùng tổn thương)</div>
      </div>
      <div style={{opacity: post}}>
        <Frame x={160} y={360} a={post} c="#06B6D4"><Strip L={{r: 1.0, s: -0.3, st: -0.32, t: 0.5, tw: 0.075}} w={300} h={220} q={9} base={0.55} t0={-0.2} label="V2" dark /></Frame>
        <Frame x={540} y={360} a={post} c="#06B6D4"><Strip L={(T) => -ecgAt(T, {r: 1.0, s: -0.3, st: -0.32, t: 0.5, tw: 0.075}, 0.8, 0.15)} w={300} h={220} q={9} base={0.55} t0={-0.2} label="lật ngược" dark /></Frame>
      </div>
      <Card x={1120} y={680} w={740} a={ap(t, 4) * (1 - post)} c="#06B6D4" title="Dưới (II, III, aVF) ↔ Bên cao (I, aVL)" />
      <Card x={1120} y={680} w={740} a={post} c="#06B6D4" title="Thành sau ↔ V1 – V3" />
      <Memo x={1120} y={790} w={740} a={ap(t, 2)}>Cùng một biến đổi — nhìn từ hai phía → ngược chiều</Memo>
    </AbsoluteFill>
  );
};

// ================= 6 · GIÁ TRỊ CỦA SOI GƯƠNG =================
const MirrorValue: React.FC = () => {
  const t = useT();
  const peri: Lead = {r: 0.9, s: -0.15, st: 0.24, t: 0.35, tw: 0.07, p: 0.12};
  return (
    <DeskBg>
      <Head t={t}>Soi gương giúp gì?</Head>
      <div style={{position: 'absolute', left: 60, top: 140, fontFamily: FONT, fontSize: 34, fontWeight: 900, color: '#FCA5A5', opacity: ap(t, -1)}}>Nhồi máu vùng dưới</div>
      <Frame x={60} y={195} a={ap(t, -1)}><Strip L={S.stemi} w={400} h={210} q={10} base={0.62} t0={-0.2} label="III" /></Frame>
      <Frame x={480} y={195} a={ap(t, 0.3)} c="#06B6D4"><Strip L={S.dep} w={400} h={210} q={10} base={0.5} t0={-0.2} label="aVL" /></Frame>
      <div style={{position: 'absolute', left: 480, top: 420, fontFamily: HAND, fontSize: 38, color: '#67E8F9', opacity: ap(t, 0.6)}}>✓ có soi gương</div>
      <div style={{position: 'absolute', left: 60, top: 500, fontFamily: FONT, fontSize: 34, fontWeight: 900, color: '#C4B5FD', opacity: ap(t, 2)}}>Viêm màng ngoài tim · tái cực sớm</div>
      {['II', 'V5', 'aVL'].map((ld, i) => (
        <Frame key={ld} x={60 + i * 280} y={555} a={ap(t, 2 + i * 0.2)}><Strip L={peri} w={260} h={190} q={8} base={0.62} t0={-0.2} label={ld} /></Frame>
      ))}
      <div style={{position: 'absolute', left: 60, top: 760, fontFamily: HAND, fontSize: 36, color: '#C4B5FD', opacity: ap(t, 2.6)}}>ST chênh lên lan toả · thường KHÔNG soi gương (trừ aVR, V1)</div>
      <Card x={960} y={195} w={900} a={ap(t, 0)} c="#06B6D4" title="Có soi gương → khả năng nhồi máu cao hơn" />
      <Card x={960} y={350} w={900} a={ap(t, 2)} c="#7C3AED" title="Viêm màng ngoài tim, tái cực sớm">ST chênh lên lan toả, thường không có soi gương</Card>
      <Memo x={960} y={560} w={900} a={ap(t, 4)}>Soi gương có thể xuất hiện <span style={{color: PEN}}>TRƯỚC</span> và rõ hơn cả ST chênh lên</Memo>
    </DeskBg>
  );
};

// ================= phần 2 =================
const KEYS_L = ['p', 'q', 'r', 's', 't', 'tw', 'tPos', 'st'] as const;
const lerpLead = (a: Lead, b: Lead, k: number): Lead => {
  const A = {...NORMAL, ...a}, B = {...NORMAL, ...b};
  const o: Lead = {};
  for (const key of KEYS_L) (o as Record<string, number>)[key] = (A[key] as number) * (1 - k) + (B[key] as number) * k;
  return o;
};
const EVO: Lead[] = [
  {},
  {t: 1.05, tw: 0.06, tPos: 0.25},
  {r: 0.75, s: 0, st: 0.5, t: 0.6, tw: 0.085, tPos: 0.22},
  {q: -0.45, r: 0.35, s: -0.05, st: 0.28, t: 0.45, tw: 0.08, tPos: 0.23},
  {q: -0.45, r: 0.35, s: -0.1, st: 0, t: -0.38, tw: 0.07},
  {q: -0.45, r: 0.45, s: -0.1, st: 0, t: -0.12, tw: 0.06},
];
const EVO_L: [string, string, string][] = [['Vài phút đầu', 'T tối cấp', CI], ['Tiếp theo', 'ST chênh lên · “bia mộ”', CJ], ['Sau vài giờ', 'Q hoại tử · R giảm', '#7C3AED'], ['Sau đó', 'ST về · T đảo', CF], ['Lâu dài', 'Q tồn tại', CN]];
const Evolution: React.FC = () => {
  const t = useT();
  const i = Math.max(0, Math.min(4, Math.floor(t / 2)));
  const k = Math.max(0, Math.min(1, (t - 2 * i) / 0.9));
  const stage = t < 2 ? lerpLead(EVO[0], EVO[1], Math.max(0, Math.min(1, t / 2))) : i >= 5 ? EVO[5] : lerpLead(EVO[i], EVO[i + 1], k);
  const cur = Math.max(0, Math.min(4, Math.floor((t + 0.3) / 2) - 1));
  return (
    <DeskBg>
      <Head t={t}>Tiến triển theo thời gian</Head>
      <Frame x={60} y={130} a={ap(t, -1)}>
        <Strip L={(T) => ecgAt(T, stage, 0.8, 0.15)} w={1180} h={420} q={16} base={0.6} t0={-0.15} stroke={5} label="V3" />
      </Frame>
      <div style={{position: 'absolute', left: 1280, top: 150, width: 580, padding: '26px 30px', borderRadius: 18, background: '#FCFAF4', borderLeft: `14px solid ${EVO_L[cur][2]}`, boxSizing: 'border-box', fontFamily: FONT, boxShadow: '0 14px 30px rgba(0,0,0,0.35)', opacity: ap(t, 1.6)}}>
        <div style={{fontSize: 28, fontWeight: 800, color: '#64748B'}}>{EVO_L[cur][0]}</div>
        <div style={{fontSize: 44, fontWeight: 900, color: EVO_L[cur][2] === CI ? '#A16207' : EVO_L[cur][2], marginTop: 6, lineHeight: 1.15}}>{EVO_L[cur][1]}</div>
      </div>
      <div style={{position: 'absolute', left: 1280, top: 380, width: 580, padding: '16px 22px', borderRadius: 16, background: PEN, color: '#fff', fontFamily: FONT, fontSize: 28, fontWeight: 800, boxSizing: 'border-box', opacity: ap(t, 10.4)}}>⚑ ST chênh lên kéo dài nhiều tuần → nghĩ phình thất</div>
      <div style={{position: 'absolute', left: 60, top: 590, width: 1800, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.2)'}}><div style={{width: `${Math.min(1, t / 10.5) * 100}%`, height: '100%', background: '#FDE047', borderRadius: 3}} /></div>
      {EVO_L.map(([when, what, c], j) => {
        const a = ap(t, 2 + j * 2, 0.5);
        const on = j === cur;
        return (
          <div key={j} style={{position: 'absolute', left: 60 + j * 362, top: 620, opacity: a, transform: `translateY(${(1 - a) * 30}px) scale(${on ? 1.03 : 1})`, transformOrigin: 'top center'}}>
            <div style={{borderRadius: 12, overflow: 'hidden', outline: `${on ? 6 : 3}px solid ${c}`, boxShadow: '0 12px 24px rgba(0,0,0,0.4)'}}>
              <Strip L={EVO[j + 1]} w={340} h={170} q={8} base={0.6} t0={-0.2} />
            </div>
            <div style={{fontFamily: FONT, fontSize: 24, fontWeight: 800, color: '#94A3B8', marginTop: 10}}>{when}</div>
            <div style={{fontFamily: FONT, fontSize: 28, fontWeight: 900, color: c === CN ? '#CBD5E1' : c === CI ? '#FDE047' : c === '#7C3AED' ? '#C4B5FD' : c === CF ? '#93C5FD' : '#FCA5A5', width: 340}}>{what}</div>
          </div>
        );
      })}
    </DeskBg>
  );
};

// ===== thẻ tim =====
const HeartCard: React.FC<{x: number; y: number; w?: number; a: number; zone: 'inf' | 'ant' | 'lat' | 'rv' | 'post'; hot: 'rca' | 'lad' | 'lcx' | 'rcaP' | null; c: string; title: string; sub?: string; id: string; s?: number}> = ({x, y, w = 540, a, zone, hot, c, title, sub, id, s = 0.82}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: 560 * s + 90, borderRadius: 18, background: 'rgba(15,23,42,0.75)', border: `3px solid ${c}`, opacity: a, transform: `translateY(${(1 - a) * 30}px)`, overflow: 'hidden'}}>
    <div style={{padding: '12px 20px', fontFamily: FONT}}>
      <div style={{fontSize: 30, fontWeight: 900, color: c === CRCA ? '#93C5FD' : c === CLCX ? '#FCD34D' : '#FCA5A5'}}>{title}</div>
      {sub && <div style={{fontSize: 22, fontWeight: 700, color: '#CBD5E1'}}>{sub}</div>}
    </div>
    <svg viewBox={`0 0 ${w} ${560 * s}`} width={w} height={560 * s} style={{position: 'absolute', left: 0, top: 80}}>
      <Heart6 id={id} x={(w - 500 * s) / 2} y={0} s={s} prog={1} art={1} labels={false} zone={zone} zoneC={c} zoneA={0.9 * a} hot={hot} occl={a} />
    </svg>
  </div>
);
const Arteries: React.FC = () => {
  const t = useT();
  return (
    <DeskBg>
      <Head t={t}>Định khu: chênh ở đâu → vùng đó</Head>
      <HeartCard id="a1" x={60} y={150} a={ap(t, 2)} zone="inf" hot="rca" c={CRCA} title="Động mạch vành phải" sub="RCA · vùng dưới, thất phải" />
      <HeartCard id="a2" x={690} y={150} a={ap(t, 2.6)} zone="ant" hot="lad" c={CLAD} title="Động mạch liên thất trước" sub="LAD · vùng trước, vách" />
      <HeartCard id="a3" x={1320} y={150} a={ap(t, 3.2)} zone="lat" hot="lcx" c={CLCX} title="Động mạch mũ" sub="LCx · vùng bên" />
      <Memo x={60} y={790} w={1800} a={ap(t, 0)}>Chuyển đạo nào chênh → vùng đó nhồi máu → suy ra <span style={{color: PEN}}>động mạch thủ phạm</span></Memo>
    </DeskBg>
  );
};

// ===== cảnh định khu chung: tờ ECG + thẻ tim + thẻ chữ =====
type Grp = [string[], string, number];
const SheetBox2: React.FC<{x: number; y: number; a: number; leads: Record<string, Lead>; sc: number; groups: Grp[]}> = ({x, y, a, leads, sc, groups}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 1500 * sc, height: 760 * sc, borderRadius: 10, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.45)', opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>
    <div style={{transform: `scale(${sc})`, transformOrigin: 'top left'}}><Sheet leads={leads} /></div>
    <svg viewBox="0 0 1500 760" width={1500 * sc} height={760 * sc} style={{position: 'absolute', left: 0, top: 0}}>
      {groups.map(([lds, c, ga], gi) => lds.map((ld) => {
        const [lx, y0] = cellPos(ld);
        return <rect key={gi + ld} x={lx + 6} y={y0 - 100} width={363} height={160} rx={12} fill={c} fillOpacity={0.14 * ga} stroke={c} strokeWidth={6} opacity={ga} />;
      }))}
    </svg>
  </div>
);
const INF12: Record<string, Lead> = {...NORM12, ...INFERIOR, V1: NORM12.V1, V2: NORM12.V2};
const ANTW: Record<string, Lead> = {
  ...NORM12,
  I: {r: 0.6, s: -0.1, st: 0.2, t: 0.45}, aVL: {r: 0.45, s: -0.2, st: 0.2, t: 0.4}, II: {r: 0.9, s: -0.2, st: -0.02, t: 0.2},
  III: {r: 0.5, s: -0.3, st: -0.2, t: -0.15}, aVF: {r: 0.7, s: -0.25, st: -0.15, t: -0.05},
  V1: {r: 0.15, s: -0.9, st: 0.25, t: 0.5, tw: 0.08}, V2: {r: 0.25, s: -1.0, st: 0.42, t: 0.7, tw: 0.08, tPos: 0.24},
  V3: {r: 0.4, s: -0.8, st: 0.42, t: 0.7, tw: 0.08, tPos: 0.24}, V4: {r: 0.7, s: -0.4, st: 0.35, t: 0.6, tw: 0.08},
  V5: {r: 0.9, s: -0.25, st: 0.28, t: 0.5}, V6: {r: 0.8, s: -0.15, st: 0.22, t: 0.45},
};
const LAT12: Record<string, Lead> = {
  ...NORM12,
  I: {r: 0.7, s: -0.1, st: 0.22, t: 0.45}, aVL: {r: 0.5, s: -0.15, st: 0.24, t: 0.4}, V5: {r: 1.0, s: -0.2, st: 0.2, t: 0.45}, V6: {r: 0.9, s: -0.15, st: 0.2, t: 0.4},
  III: {r: 0.5, s: -0.3, st: -0.2, t: -0.15}, aVF: {r: 0.7, s: -0.2, st: -0.14, t: -0.05},
};
const UP = '#DC2626', DN = '#2563EB';
const Localize: React.FC<{title: string; leads: Record<string, Lead>; groups: Grp[]; zone: 'inf' | 'ant' | 'lat'; hot: 'rca' | 'lad' | 'lcx'; hc: string; htitle: string; id: string; cards: [string, string | null, string, number][]; memo?: [React.ReactNode, number]}> = ({title, leads, groups, zone, hot, hc, htitle, id, cards, memo}) => {
  const t = useT();
  return (
    <DeskBg>
      <Head t={t}>{title}</Head>
      <SheetBox2 x={60} y={140} a={ap(t, -1)} leads={leads} sc={0.8} groups={groups} />
      <HeartCard id={id} x={1300} y={120} w={560} a={ap(t, 0.3)} zone={zone} hot={hot} c={hc} title={htitle} s={0.72} />
      {cards.map(([ti, sub, c, s], i) => <Card key={i} x={60 + (i % 2) * 610} y={770 + Math.floor(i / 2) * 0} w={590} a={ap(t, s)} c={c} title={ti}>{sub}</Card>)}
      {memo && <Memo x={1300} y={660} w={560} a={ap(t, memo[1])}>{memo[0]}</Memo>}
    </DeskBg>
  );
};
const Inferior: React.FC = () => {
  const t = useT();
  return <Localize id="inf5" title="Vùng DƯỚI" leads={INF12} groups={[[['II', 'III', 'aVF'], UP, ap(t, 0)], [['aVL', 'I'], DN, ap(t, 2)]]} zone="inf" hot="rca" hc={CRCA} htitle="Vành phải (± mũ)"
    cards={[['ST↑ II, III, aVF', 'soi gương: ST↓ aVL (± I)', UP, 0], ['Thủ phạm: vành phải', 'ít hơn: động mạch mũ', CRCA, 4]]} memo={[<>ST ở <span style={{color: PEN}}>III &gt; II</span> → nghĩ vành phải</>, 6]} />;
};
const Anterior: React.FC = () => {
  const t = useT();
  return <Localize id="ant5" title="Vùng TRƯỚC" leads={ANTW} groups={[[['V1', 'V2'], UP, ap(t, 2)], [['V3', 'V4'], UP, ap(t, 4)], [['V5', 'V6', 'I', 'aVL'], '#F97316', ap(t, 6)], [['III', 'aVF'], DN, ap(t, 6.4)]]} zone="ant" hot="lad" hc={CLAD} htitle="Liên thất trước"
    cards={[['Vách: V1–V2 · Trước vách: V1–V4', null, UP, 2], ['Trước rộng: V1–V6 + I, aVL', '→ liên thất trước đoạn gần', '#F97316', 6]]} memo={[<>Vùng càng rộng → cơ tim <span style={{color: PEN}}>nguy cơ càng nhiều</span></>, 8]} />;
};
const Lateral: React.FC = () => {
  const t = useT();
  return <Localize id="lat5" title="Vùng BÊN CAO & BÊN" leads={LAT12} groups={[[['I', 'aVL'], UP, ap(t, 0)], [['V5', 'V6'], '#F97316', ap(t, 0.6)], [['III', 'aVF'], DN, ap(t, 4)]]} zone="lat" hot="lcx" hc={CLCX} htitle="Mũ / nhánh chéo"
    cards={[['Bên cao: I, aVL · Bên: V5, V6', null, UP, 0], ['Soi gương: ST↓ III, aVF', null, DN, 4]]} memo={[<>Thủ phạm: <span style={{color: '#B45309'}}>động mạch mũ</span> hoặc nhánh chéo</>, 2]} />;
};

// ===== thân người: mặt trước (chuyển đạo phải) / mặt sau (V7–V9) =====
const Torso: React.FC<{back?: boolean; a: number; hi: string; dots: [string, number, number][]}> = ({back, a, hi, dots}) => (
  <svg viewBox="0 0 420 470" width={420} height={470} style={{opacity: a}}>
    <path d="M110,20 C150,40 270,40 310,20 C360,40 400,70 405,120 L395,440 C300,465 120,465 25,440 L15,120 C20,70 60,40 110,20 Z" fill="#E7D3C4" stroke="#8B6F5E" strokeWidth={4} />
    {back ? <path d="M210,60 L210,430" stroke="#B89A86" strokeWidth={6} strokeDasharray="4 10" /> : <path d="M210,60 L210,250 M120,250 Q210,300 300,250" stroke="#B89A86" strokeWidth={4} fill="none" />}
    {back ? <g fill="none" stroke="#B89A86" strokeWidth={3}><path d="M70,110 Q120,90 160,160 Q120,230 80,220" /><path d="M350,110 Q300,90 260,160 Q300,230 340,220" /></g> : null}
    <text x={210} y={460} textAnchor="middle" fontFamily={FONT} fontSize={22} fontWeight={800} fill="#5B4636">{back ? 'mặt SAU (lưng)' : 'mặt TRƯỚC'}</text>
    {dots.map(([n, x, y]) => (
      <g key={n}>
        <circle cx={x} cy={y} r={n === hi ? 18 : 13} fill={n === hi ? PEN : '#1E293B'} stroke="#fff" strokeWidth={3} />
        <text x={x} y={y - 24} textAnchor="middle" fontFamily={MONO} fontSize={22} fontWeight={700} fill={n === hi ? PEN : '#1E293B'}>{n}</text>
      </g>
    ))}
  </svg>
);
const POST3: Record<string, Lead> = {
  V1: {r: 0.75, s: -0.35, st: -0.3, t: 0.45, tw: 0.075}, V2: {r: 1.05, s: -0.3, st: -0.36, t: 0.55, tw: 0.075}, V3: {r: 1.1, s: -0.3, st: -0.3, t: 0.5, tw: 0.075},
};
const Posterior: React.FC = () => {
  const t = useT();
  const flip = dp(t, 4, 1.0);
  return (
    <DeskBg>
      <Head t={t}>Thành SAU</Head>
      {['V1', 'V2', 'V3'].map((ld, i) => (
        <div key={ld} style={{position: 'absolute', left: 60 + i * 300, top: 150, opacity: ap(t, 2 + i * 0.2), transform: `scaleY(${1 - 2 * flip})`, transition: 'none'}}>
          <div style={{borderRadius: 12, overflow: 'hidden', outline: `4px solid ${flip > 0.5 ? UP : DN}`}}>
            <Strip L={POST3[ld]} w={280} h={260} q={9} base={0.6} t0={-0.2} label={flip > 0.5 ? undefined : ld} />
          </div>
        </div>
      ))}
      <div style={{position: 'absolute', left: 60, top: 430, width: 880, fontFamily: HAND, fontSize: 38, color: flip > 0.5 ? '#FCA5A5' : '#93C5FD', opacity: ap(t, 2.4)}}>{flip > 0.5 ? '↻ lật ngược = ST chênh lên nhìn từ phía sau' : 'ST↓ · R cao · T dương ở V1–V3'}</div>
      <div style={{position: 'absolute', left: 60, top: 500, opacity: ap(t, 6)}}><Torso back a={1} hi="V8" dots={[['V7', 120, 230], ['V8', 165, 205], ['V9', 200, 190]]} /></div>
      <Frame x={520} y={560} a={ap(t, 6.4)} c={UP}><Strip L={{r: 0.35, s: -0.1, st: 0.1, t: 0.25}} w={420} h={220} q={12} base={0.62} t0={-0.2} label="V8" /></Frame>
      <div style={{position: 'absolute', left: 520, top: 800, fontFamily: HAND, fontSize: 34, color: '#FCA5A5', opacity: ap(t, 6.8)}}>ST chênh lên ≥ 0,5 mm</div>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        <Heart6 id="post5" x={1380} y={110} s={0.75} prog={1} art={1} labels={false} zone="post" zoneC="#16A34A" zoneA={ap(t, 0.3) * 0.9} hot="lcx" occl={ap(t, 0.3)} />
      </svg>
      <Card x={1060} y={560} w={800} a={ap(t, 0)} c={CG} title="12 chuyển đạo không nhìn trực tiếp thành sau" />
      <Card x={1060} y={680} w={800} a={ap(t, 6)} c={UP} title="Khẳng định: gắn V7 – V9">ST chênh lên ≥ 0,5 mm (nam &lt; 40 tuổi: ≥ 1 mm)</Card>
    </DeskBg>
  );
};
const RightV: React.FC = () => {
  const t = useT();
  return (
    <DeskBg>
      <Head t={t}>Thất PHẢI</Head>
      <div style={{position: 'absolute', left: 60, top: 140, opacity: ap(t, 2)}}><Torso a={1} hi="V4R" dots={[['V3R', 165, 225], ['V4R', 125, 250], ['V5R', 85, 252], ['V6R', 45, 255], ['V1', 230, 190], ['V2', 190, 190]]} /></div>
      <div style={{position: 'absolute', left: 60, top: 620, width: 420, fontFamily: HAND, fontSize: 30, color: '#CBD5E1', opacity: ap(t, 2.4)}}>V3R – V6R: đặt đối xứng V3 – V6 sang bên phải ngực</div>
      <Frame x={520} y={160} a={ap(t, 2.4)} c={UP}><Strip L={{r: 0.3, s: -0.6, st: 0.12, t: 0.25}} w={560} h={300} q={14} base={0.55} t0={-0.2} label="V4R" stroke={4}>
        {(X, Y) => <g opacity={ap(t, 3)}><line x1={X(0.11)} x2={X(0.11)} y1={Y(0)} y2={Y(0.12)} stroke={PEN} strokeWidth={4} /><text x={X(0.11) + 14} y={Y(0.06) + 10} fontFamily={MONO} fontSize={26} fontWeight={700} fill={PEN}>≥ 0,5 mm</text></g>}
      </Strip></Frame>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        <Heart6 id="rv5" x={1360} y={110} s={0.8} prog={1} art={1} labels={false} zone="rv" zoneC="#7C3AED" zoneA={ap(t, 4) * 0.9} hot="rcaP" occl={ap(t, 4)} />
      </svg>
      <Card x={520} y={500} w={760} a={ap(t, 0)} c="#7C3AED" title="Nghĩ đến khi có nhồi máu vùng DƯỚI" />
      <Card x={520} y={610} w={760} a={ap(t, 2)} c={UP} title="V4R: ST chênh lên ≥ 0,5 mm" />
      <Card x={520} y={720} w={760} a={ap(t, 4)} c={CRCA} title="Thủ phạm: vành phải đoạn gần" />
      <div style={{position: 'absolute', left: 1320, top: 620, width: 540, padding: '18px 24px', borderRadius: 16, background: PEN, color: '#fff', fontFamily: FONT, fontSize: 30, fontWeight: 800, boxSizing: 'border-box', opacity: ap(t, 6), boxShadow: '0 12px 28px rgba(0,0,0,0.4)'}}>Ghi nhận sớm: ảnh hưởng xử trí — thận trọng thuốc giãn mạch</div>
    </DeskBg>
  );
};

// ================= 14 · BẢNG ÔN TẬP =================
const Review5: React.FC = () => {
  const t = useT();
  const rows: [string, string, string, string, string, number][] = [
    ['Dưới', 'II, III, aVF', 'aVL (± I)', 'Vành phải (± mũ)', CRCA, 2],
    ['Trước vách', 'V1 – V4', '—', 'Liên thất trước', CLAD, 2.4],
    ['Bên', 'I, aVL, V5, V6', 'III, aVF', 'Mũ / nhánh chéo', CLCX, 4],
    ['Trước rộng', 'V1 – V6, I, aVL', 'III, aVF', 'Liên thất trước đoạn gần', CLAD, 4.4],
    ['Thành sau', 'V7 – V9', 'ST↓ V1 – V3', 'Mũ hoặc vành phải', CG, 6],
    ['Thất phải', 'V4R', '—', 'Vành phải đoạn gần', '#7C3AED', 6.4],
  ];
  const cols = [300, 400, 400, 700];
  return (
    <DeskBg>
      <Head t={t}>Bảng định khu</Head>
      <div style={{position: 'absolute', left: 60, top: 140, width: 1800, borderRadius: 18, overflow: 'hidden', background: '#FCFAF4', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', fontFamily: FONT, opacity: ap(t, 0)}}>
        <div style={{display: 'flex', background: '#1E293B', color: '#F8FAFC', fontSize: 28, fontWeight: 800}}>
          {['Vùng', 'ST chênh lên', 'Soi gương', 'Động mạch thủ phạm'].map((h, i) => <div key={h} style={{width: cols[i], padding: '16px 24px', boxSizing: 'border-box'}}>{h}</div>)}
        </div>
        {rows.map(([a, b, c, d, col, s]) => (
          <div key={a} style={{display: 'flex', borderTop: '2px solid #E5E7EB', opacity: ap(t, s), transform: `translateX(${(1 - ap(t, s)) * 30}px)`, fontSize: 30, fontWeight: 700, color: '#1F2937', alignItems: 'center'}}>
            <div style={{width: cols[0], padding: '20px 24px', boxSizing: 'border-box', color: col, fontWeight: 900, borderLeft: `10px solid ${col}`}}>{a}</div>
            <div style={{width: cols[1], padding: '20px 24px', boxSizing: 'border-box'}}>{b}</div>
            <div style={{width: cols[2], padding: '20px 24px', boxSizing: 'border-box', color: '#2563EB'}}>{c}</div>
            <div style={{width: cols[3], padding: '20px 24px', boxSizing: 'border-box', fontWeight: 800}}>{d}</div>
          </div>
        ))}
      </div>
    </DeskBg>
  );
};

// ================= 15 · THỰC HÀNH =================
const Chk: React.FC<{y: number; a: number; c: string; k: string; children: React.ReactNode}> = ({y, a, c, k, children}) => (
  <div style={{position: 'absolute', left: 1300, top: y, width: 560, display: 'flex', gap: 14, alignItems: 'flex-start', fontFamily: FONT, opacity: a, transform: `translateX(${(1 - a) * 30}px)`}}>
    <span style={{flex: 'none', padding: '4px 12px', borderRadius: 10, background: c, color: '#fff', fontSize: 22, fontWeight: 900, marginTop: 4}}>{k}</span>
    <span style={{fontSize: 28, fontWeight: 700, color: '#F1F5F9', lineHeight: 1.3}}>{children}</span>
  </div>
);
const Practice5: React.FC = () => {
  const t = useT();
  const sw = ap(t, 6, 0.6);
  return (
    <DeskBg>
      <Head t={t}>Thực hành: CHÊNH – SOI GƯƠNG – ĐỊNH KHU</Head>
      <div style={{opacity: 1 - sw}}>
        <div style={{position: 'absolute', left: 60, top: 128, fontFamily: FONT, fontSize: 30, fontWeight: 900, color: '#FDE047'}}>ECG 1</div>
        <SheetBox2 x={60} y={175} a={ap(t, 2)} leads={INF12} sc={0.8} groups={[[['II', 'III', 'aVF'], UP, ap(t, 2.4)], [['aVL'], DN, ap(t, 2.8)]]} />
        <Chk y={180} a={ap(t, 2.4)} c={UP} k="CHÊNH">ST↑ II, III, aVF · III &gt; II</Chk>
        <Chk y={290} a={ap(t, 2.8)} c={DN} k="SOI GƯƠNG">ST↓ aVL</Chk>
        <Chk y={370} a={ap(t, 4)} c={CRCA} k="ĐỊNH KHU">Vùng dưới → vành phải ✓</Chk>
        <div style={{position: 'absolute', left: 1300, top: 470, width: 560, padding: '14px 20px', borderRadius: 14, background: '#7C3AED', color: '#fff', fontFamily: FONT, fontSize: 28, fontWeight: 800, boxSizing: 'border-box', opacity: ap(t, 4.4)}}>→ gắn thêm V4R</div>
      </div>
      <div style={{opacity: sw}}>
        <div style={{position: 'absolute', left: 60, top: 128, fontFamily: FONT, fontSize: 30, fontWeight: 900, color: '#FDE047'}}>ECG 2</div>
        <SheetBox2 x={60} y={175} a={sw} leads={ANTW} sc={0.8} groups={[[['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'I', 'aVL'], UP, ap(t, 6.4)], [['III', 'aVF'], DN, ap(t, 6.8)]]} />
        <Chk y={180} a={ap(t, 6.4)} c={UP} k="CHÊNH">ST↑ V1 – V6, I, aVL</Chk>
        <Chk y={290} a={ap(t, 6.8)} c={DN} k="SOI GƯƠNG">ST↓ III, aVF</Chk>
        <Chk y={370} a={ap(t, 8)} c={CLAD} k="ĐỊNH KHU">Trước rộng → liên thất trước đoạn gần ✓</Chk>
      </div>
    </DeskBg>
  );
};

// ================= 16 · 5 ĐIỀU CẦN NHỚ =================
const Takeaways5: React.FC = () => {
  const t = useT();
  const items: [React.ReactNode, string][] = [
    [<>Đo ST tại <b>điểm J</b> · ≥ 2 chuyển đạo liên tiếp · V2–V3 theo tuổi, giới · chỗ khác ≥ 1 mm</>, PEN],
    [<>Tìm <b>SOI GƯƠNG</b> — có soi gương, nhồi máu càng chắc</>, '#06B6D4'],
    [<>Tiến triển: <b>T tối cấp → ST chênh lên → Q → T đảo</b></>, '#8B5CF6'],
    [<><b>Chênh ở đâu</b> → vùng đó → động mạch đó</>, CF],
    [<>ST↓ V1–V3 → nghĩ <b>thành sau</b> · nhồi máu dưới → gắn <b>V4R</b></>, CG],
  ];
  return (
    <DeskBg>
      <Head t={t}>5 điều cần nhớ</Head>
      {items.map(([s, c], i) => {
        const a = ap(t, 2 + i * 2);
        return (
          <div key={i} style={{position: 'absolute', left: 100, top: 140 + i * 128, width: 1720, height: 108, display: 'flex', alignItems: 'center', gap: 24, padding: '0 26px', borderRadius: 18, background: '#FCFAF4', borderLeft: `14px solid ${c}`, boxSizing: 'border-box', opacity: a, transform: `translateX(${(1 - a) * 50}px)`, boxShadow: '0 12px 26px rgba(0,0,0,0.35)', fontFamily: FONT}}>
            <span style={{flex: 'none', width: 60, height: 60, borderRadius: 30, background: c, color: '#fff', fontSize: 34, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</span>
            <span style={{fontSize: 33, fontWeight: 700, color: '#1F2937'}}>{s}</span>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 100, top: 800, width: 1720, padding: '16px 26px', borderRadius: 16, background: 'rgba(94,234,212,0.12)', border: '2px solid #5EEAD4', boxSizing: 'border-box', fontFamily: FONT, fontSize: 32, fontWeight: 800, color: '#5EEAD4', opacity: ap(t, 12)}}>Bài 6: Nhồi máu khi ECG không điển hình — các dạng tắc mạch cấp &amp; Sgarbossa</div>
    </DeskBg>
  );
};

const SCN: React.FC[] = [Cover, Zones, MeasureJ, Thresholds, Contiguous, Mirror, MirrorValue, Evolution, Arteries, Inferior, Anterior, Lateral, Posterior, RightV, Review5, Practice5, Takeaways5];
export const INFARCT_N = 7;
export const Infarct: React.FC = () => (
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
    <SeriesTag sub="Nhồi máu cơ tim ST chênh lên · Nhận diện và định khu" />
    <StationBar />
    <Caption />
    <Progress />
  </AbsoluteFill>
);
export {Strip, Frame, S, NORM12, SheetBox, GroupRects, h2s, StationBar};
void interpolate; void LAYOUT;
