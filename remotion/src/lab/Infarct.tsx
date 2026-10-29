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
import {beatV, ecgAt, Lead, LAYOUT} from './ecg';
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
  hyper: {t: 0.85, tw: 0.075, tPos: 0.25},
  stemi: {st: 0.28, t: 0.55, tw: 0.08, tPos: 0.25},
  tomb: {r: 0.7, s: 0, st: 0.55, t: 0.75, tw: 0.09, tPos: 0.22},
  qwave: {q: -0.45, r: 0.35, s: -0.1, st: 0.12, t: 0.3},
  tinv: {q: -0.45, r: 0.35, s: -0.1, st: 0, t: -0.32, tw: 0.07},
  dep: {r: 0.6, s: -0.2, st: -0.15, t: -0.12},
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
  const [cx, cy] = h2s(HX, HY, HS, [770, 880]);
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
        {ring(150, CI, 2, 'thiếu máu', 120, -230)}
        {ring(100, CJ, 4, 'tổn thương', 160, -150)}
        {ring(52, CN, 6, 'hoại tử', 200, -70)}
      </svg>
      {[
        [S.hyper, 'T tối cấp → T đảo', CI, 2],
        [S.stemi, 'ST chênh lên', CJ, 4],
        [S.qwave, 'sóng Q hoại tử', CN, 6],
      ].map(([L, lab, c, s], i) => (
        <div key={i}>
          <Frame x={1060} y={140 + i * 250} a={ap(t, s as number)} c={c as string}>
            <Strip L={L as Lead} w={420} h={210} q={10} base={0.62} t0={0.05} />
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
                <text x={X(0.42)} y={Y(0) + 44} fontFamily={HAND} fontSize={34} fill="#2563EB">đường đẳng điện</text>
              </g>
              <g opacity={ap(t, 2)}>
                <circle cx={X(0.045)} cy={Y(f(0.045))} r={14} fill={PEN} stroke="#fff" strokeWidth={3} />
                <text x={X(0.045) + 24} y={Y(f(0.045)) - 22} fontFamily={HAND} fontSize={44} fill={PEN}>điểm J</text>
              </g>
              <g opacity={ap(t, 4.6)}>
                <line x1={X(0.045) - 40} x2={X(0.045) - 40} y1={Y(0)} y2={Y(f(0.045))} stroke={PEN} strokeWidth={5} />
                <path d={`M${X(0.045) - 52},${Y(0)} h24 M${X(0.045) - 52},${Y(f(0.045))} h24`} stroke={PEN} strokeWidth={5} />
                <text x={X(0.045) - 60} y={(Y(0) + Y(f(0.045))) / 2 + 12} textAnchor="end" fontFamily={MONO} fontSize={32} fontWeight={700} fill={PEN}>ST ↑ {(f(0.045) * 10).toFixed(1).replace('.', ',')} mm</text>
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
        <g opacity={1 - post * 0.75}>
          <Heart6 id="mr5" x={HX} y={HY} s={HS} prog={1} art={1} labels={false} beat={beat} zone="inf" zoneC="#FF3B3B" zoneA={ap(t, 0.2) * 0.9} />
          <line x1={cx} y1={cy - 140} x2={cx} y2={cy - 140 + 230 * vk} stroke="#FDE047" strokeWidth={12} markerEnd="url(#arV)" opacity={vk > 0.02 ? 1 : 0} />
          <text x={cx + 30} y={cy - 40} fontFamily={FONT} fontSize={26} fontWeight={800} fill="#FDE047" opacity={vk}>vector tổn thương</text>
          <Eye x={cx} y={cy + 230} ang={-90} c={CG} label="II · III · aVF" a={ap(t, 1.2)} />
          <Eye x={cx + 330} y={cy - 300} ang={110} c={CB} label="aVL" a={ap(t, 1.6)} />
        </g>
        <g opacity={post}>
          <text x={500} y={250} textAnchor="middle" fontFamily={FONT} fontSize={36} fontWeight={900} fill="#E2E8F0">Thành sau ↔ V1 – V3</text>
          <line x1={500} y1={300} x2={500} y2={820} stroke="#94A3B8" strokeWidth={4} strokeDasharray="12 10" />
          <text x={500} y={860} textAnchor="middle" fontFamily={HAND} fontSize={34} fill="#94A3B8">gương</text>
        </g>
      </svg>
      {/* cặp ô: nhìn từ hai phía */}
      <div style={{opacity: 1 - post}}>
        <Frame x={1120} y={170} a={ap(t, 1.6)} c={CB}><Strip L={S.dep} w={360} h={200} q={10} base={0.5} t0={0.05} label="aVL" dark /></Frame>
        <div style={{position: 'absolute', left: 1500, top: 230, fontFamily: FONT, fontSize: 34, fontWeight: 900, color: '#FDBA74', opacity: ap(t, 2)}}>ST ↓ (nhìn từ<br />phía đối diện)</div>
        <Frame x={1120} y={420} a={ap(t, 1.2)} c={CG}><Strip L={S.stemi} w={360} h={200} q={10} base={0.62} t0={0.05} label="III" dark /></Frame>
        <div style={{position: 'absolute', left: 1500, top: 480, fontFamily: FONT, fontSize: 34, fontWeight: 900, color: '#86EFAC', opacity: ap(t, 1.4)}}>ST ↑ (nhìn vào<br />vùng tổn thương)</div>
      </div>
      <div style={{opacity: post}}>
        <Frame x={160} y={360} a={post} c="#06B6D4"><Strip L={{r: 1.0, s: -0.3, st: -0.25, t: 0.5, tw: 0.075}} w={300} h={220} q={9} base={0.55} t0={0.05} label="V2" dark /></Frame>
        <Frame x={540} y={360} a={post} c="#06B6D4"><Strip L={(T) => -ecgAt(T, {r: 1.0, s: -0.3, st: -0.25, t: 0.5, tw: 0.075}, 0.8, 0.15)} w={300} h={220} q={9} base={0.55} t0={0.05} label="lật ngược" dark /></Frame>
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
  const peri: Lead = {r: 0.9, s: -0.15, st: 0.16, t: 0.35, tw: 0.07, p: 0.12};
  return (
    <DeskBg>
      <Head t={t}>Soi gương giúp gì?</Head>
      <div style={{position: 'absolute', left: 60, top: 140, fontFamily: FONT, fontSize: 34, fontWeight: 900, color: '#FCA5A5', opacity: ap(t, -1)}}>Nhồi máu vùng dưới</div>
      <Frame x={60} y={195} a={ap(t, -1)}><Strip L={S.stemi} w={400} h={210} q={10} base={0.62} t0={0.05} label="III" /></Frame>
      <Frame x={480} y={195} a={ap(t, 0.3)} c="#06B6D4"><Strip L={S.dep} w={400} h={210} q={10} base={0.5} t0={0.05} label="aVL" /></Frame>
      <div style={{position: 'absolute', left: 480, top: 420, fontFamily: HAND, fontSize: 38, color: '#67E8F9', opacity: ap(t, 0.6)}}>✓ có soi gương</div>
      <div style={{position: 'absolute', left: 60, top: 500, fontFamily: FONT, fontSize: 34, fontWeight: 900, color: '#C4B5FD', opacity: ap(t, 2)}}>Viêm màng ngoài tim · tái cực sớm</div>
      {['II', 'V5', 'aVL'].map((ld, i) => (
        <Frame key={ld} x={60 + i * 280} y={555} a={ap(t, 2 + i * 0.2)}><Strip L={peri} w={260} h={190} q={8} base={0.62} t0={0.05} label={ld} /></Frame>
      ))}
      <div style={{position: 'absolute', left: 60, top: 760, fontFamily: HAND, fontSize: 36, color: '#C4B5FD', opacity: ap(t, 2.6)}}>ST chênh lên lan toả · thường KHÔNG soi gương (trừ aVR, V1)</div>
      <Card x={960} y={195} w={900} a={ap(t, 0)} c="#06B6D4" title="Có soi gương → khả năng nhồi máu cao hơn" />
      <Card x={960} y={350} w={900} a={ap(t, 2)} c="#7C3AED" title="Viêm màng ngoài tim, tái cực sớm">ST chênh lên lan toả, thường không có soi gương</Card>
      <Memo x={960} y={560} w={900} a={ap(t, 4)}>Soi gương có thể xuất hiện <span style={{color: PEN}}>TRƯỚC</span> và rõ hơn cả ST chênh lên</Memo>
    </DeskBg>
  );
};

const SCN: React.FC[] = [Cover, Zones, MeasureJ, Thresholds, Contiguous, Mirror, MirrorValue];
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
