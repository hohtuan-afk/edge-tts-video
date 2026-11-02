// BÀI 10 · NGOẠI TÂM THU & NHỊP THOÁT — Nhát đến sớm, nhát đến cứu
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import data from '../data.json';
import keys from './ecto_keys.json';
import stations from './ecto_stations.json';
import {TimeMap, CapCtx, FONT, useT} from '../lib';
import {Caption, Progress} from '../Main';
import {MONO} from './Lab';
import {Fade, SeriesTag} from './Demo';
import {HAND} from '../wb/wb';
import {Heart4C, H4, Dot} from '../wb/heart4c';
import {Memo, Card, Head, DeskBg, ap, PEN} from './Bundle';
import {Strip, Frame} from './Infarct';
import {Monitor, spread} from './Wide';

const RD = '#DC2626', BL = '#2563EB', OR = '#F97316', PU = '#8B5CF6', GR = '#22C55E', TE = '#06B6D4', AM = '#F59E0B';
const gs = (x: number, mu: number, w: number, a: number) => a * Math.exp(-((x - mu) ** 2) / (2 * w * w));

// ===== các loại nhát (x = 0 tại đầu QRS) =====
const qrsN = (x: number) => gs(x, 0.0, 0.011, 1.0) + gs(x, 0.026, 0.01, -0.25) + gs(x, -0.022, 0.008, -0.08);
const tN = (x: number) => gs(x, 0.25, 0.045, 0.3);
const pS = (x: number) => gs(x, -0.16, 0.024, 0.13);                         // P xoang
const pA = (x: number) => gs(x, -0.15, 0.014, 0.17) + gs(x, -0.12, 0.014, -0.07); // P′ nhọn, 2 pha
const pJ = (x: number, d: number) => gs(x, d, 0.018, -0.12);                // P âm (bộ nối)
const pvc = (x: number) => gs(x, 0.05, 0.035, 1.35) + gs(x, 0.13, 0.035, -0.45) + gs(x, 0.34, 0.065, -0.5);
const abr = (x: number) => gs(x, 0.0, 0.012, 0.9) + gs(x, 0.06, 0.03, -0.38) + gs(x, 0.27, 0.05, -0.12); // lệch hướng (dạng block nhánh phải ở II)
const escV = (x: number) => gs(x, 0.06, 0.045, 1.0) + gs(x, 0.16, 0.04, -0.3) + gs(x, 0.38, 0.07, -0.4);
type BT = 's' | 'a' | 'ab' | 'bl' | 'jb' | 'jh' | 'ja' | 'v' | 'ej' | 'ev';
const one = (k: BT, x: number) => {
  switch (k) {
    case 's': return pS(x) + qrsN(x) + tN(x);
    case 'a': return pA(x) + qrsN(x) + tN(x);
    case 'ab': return pA(x) + abr(x);
    case 'bl': return pA(x);
    case 'jb': return pJ(x, -0.08) + qrsN(x) + tN(x);
    case 'jh': return qrsN(x) + tN(x);
    case 'ja': return qrsN(x) + pJ(x, 0.12) + tN(x);
    case 'v': return pvc(x);
    case 'ej': return qrsN(x) + tN(x);
    case 'ev': return escV(x);
  }
};
const rhythm = (beats: [number, BT][]) => (T: number) => beats.reduce((v, [b, k]) => {
  const x = T - b;
  return x < -0.3 || x > 0.6 ? v : v + one(k, x);
}, 0);
const sinus = (n: number, rr = 0.8, off = 0.25): [number, BT][] => Array.from({length: n}, (_, i) => [off + i * rr, 's']);

// dải mẫu dùng nhiều lần
const R_PAC: [number, BT][] = [[0.25, 's'], [1.05, 's'], [1.85, 's'], [2.37, 'a'], [3.17, 's'], [3.57, 'a'], [4.37, 's'], [5.17, 's'], [5.97, 's']];
const R_PVC: [number, BT][] = [[0.25, 's'], [1.05, 's'], [1.85, 's'], [2.33, 'v'], [3.45, 's'], [4.25, 's'], [5.05, 's'], [5.85, 's']];
const R_ESC: [number, BT][] = [[0.25, 's'], [1.05, 's'], [1.85, 's'], [3.45, 'ej'], [4.85, 'ej'], [6.25, 'ej']];

// ===== thanh trạm =====
const ST7 = ['SỚM / MUỘN', 'NHĨ · BỘ NỐI', 'THẤT', 'NGHỈ BÙ', 'KIỂU GHÉP', 'NHỊP THOÁT', 'ÔN TẬP'];
const STC = ['#F97316', '#8B5CF6', '#DC2626', '#06B6D4', '#F59E0B', '#2563EB', '#22C55E'];
const StationBar10: React.FC = () => {
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
const Lbl: React.FC<{x: number; y: number; a: number; c: string; size?: number; children: React.ReactNode}> = ({x, y, a, c, size = 34, children}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: HAND, fontSize: size, color: c, opacity: a}}>{children}</div>
);
const Pill: React.FC<{x: number; y: number; a: number; c: string; size?: number; children: React.ReactNode}> = ({x, y, a, c, size = 30, children}) => (
  <div style={{position: 'absolute', left: x, top: y, padding: '8px 20px', borderRadius: 14, background: c, color: '#fff', fontFamily: FONT, fontSize: size, fontWeight: 900, opacity: a, transform: `scale(${0.9 + 0.1 * a})`, transformOrigin: 'left center', boxShadow: '0 10px 22px rgba(0,0,0,0.35)'}}>{children}</div>
);

// ổ phát nhịp trên tim mặt cắt
const FA = [790, 400];           // ổ lạc chỗ ở nhĩ trái
const FV = [930, 880];           // ổ thất trái
const dn = (from: number[]): number[][] => [from, H4.AV, H4.HIS];
const pacDots = (ph: number): Dot[] => {
  const k1 = Math.min(1, ph / 0.45), k2 = Math.max(0, (ph - 0.45) / 0.55);
  const atr: Dot[] = [0, 1, 2, 3].map((i) => ({pts: [FA, [FA[0] + [-300, -120, 120, -420][i], FA[1] + [60, 180, 120, 40][i]]], k: k1 * 0.999, c: PU, r: 13}));
  return [...atr, {pts: dn(FA), k: k1 * 0.999, c: PU}, {pts: H4.RB, k: k2 * 0.999, c: PU}, {pts: H4.LB, k: k2 * 0.999, c: PU}];
};
const pjcDots = (ph: number): Dot[] => [
  {pts: [H4.AV, H4.RA], k: ph * 0.999, c: TE}, {pts: [H4.AV, H4.LA], k: ph * 0.999, c: TE},
  {pts: [H4.AV, ...H4.RB], k: ph * 0.999, c: TE}, {pts: [H4.AV, ...H4.LB], k: ph * 0.999, c: TE},
];
const Focus: React.FC<{p: number[]; c: string; pulse: number}> = ({p, c, pulse}) => (
  <g><circle cx={p[0]} cy={p[1]} r={40 + 20 * pulse} fill={c} opacity={0.25 * (1 - pulse) + 0.1} /><circle cx={p[0]} cy={p[1]} r={24} fill={c} stroke="#fff" strokeWidth={6} /></g>
);

// ================= 0 · BÌA =================
const Cover: React.FC = () => {
  const t = useT();
  const rt = useCurrentFrame() / 30;
  const pl = (rt % 1.2) / 1.2;
  const mon = rhythm([...R_PAC.slice(0, 3), [2.33, 'v'], [3.45, 's'], [4.25, 's'], [4.85, 'a'], [5.65, 's'], [6.45, 's'], [7.25, 's']]);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 72% 45%, #3A2A12, #0B1218 72%)'}}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart4C id="cv10" x={1230} y={90} s={0.56} a={ap(t, 0)} ring={0.5} cond={0.8} />
        <g transform="translate(1230,90) scale(0.56)" opacity={ap(t, 0.6)}>
          <Focus p={FA} c={PU} pulse={pl} />
          <Focus p={H4.AV} c={TE} pulse={(pl + 0.33) % 1} />
          <Focus p={FV} c={RD} pulse={(pl + 0.66) % 1} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 110, top: 110, fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: 4, color: '#5EEAD4', opacity: ap(t, 0.2)}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 10</div>
      <div style={{position: 'absolute', left: 106, top: 156, width: 1100, fontFamily: FONT, fontSize: 80, fontWeight: 800, lineHeight: 1.06, color: '#F8FAFC', opacity: ap(t, 0.4)}}>
        Ngoại tâm thu <span style={{color: '#FDBA74'}}>&amp;</span> nhịp thoát
      </div>
      <div style={{position: 'absolute', left: 112, top: 258, fontFamily: FONT, fontSize: 38, fontWeight: 700, color: '#CBD5E1', opacity: ap(t, 0.8)}}>Nhát đến <span style={{color: '#FDBA74'}}>SỚM</span> · nhát đến <span style={{color: '#93C5FD'}}>CỨU</span></div>
      <div style={{position: 'absolute', left: 112, top: 330, display: 'flex', gap: 14, fontFamily: FONT, fontSize: 26, fontWeight: 800, opacity: ap(t, 2)}}>
        <span style={{padding: '6px 16px', borderRadius: 12, background: 'rgba(148,163,184,0.2)', color: '#CBD5E1'}}>Bài 3: nhát bị RƠI</span>
        <span style={{color: '#64748B'}}>→</span>
        <span style={{padding: '6px 16px', borderRadius: 12, background: 'rgba(249,115,22,0.2)', color: '#FDBA74'}}>hôm nay: đến SỚM · đến CỨU</span>
      </div>
      <div style={{position: 'absolute', left: 110, top: 410, padding: '14px 26px', borderRadius: 20, border: '4px solid #FDBA74', background: 'rgba(249,115,22,0.12)', fontFamily: FONT, fontSize: 36, fontWeight: 900, color: '#FED7AA', opacity: ap(t, 4), transform: `scale(${0.85 + 0.15 * ap(t, 4)})`, transformOrigin: 'left center'}}>SỚM hay MUỘN – HẸP hay RỘNG – NGHỈ BÙ ĐỦ hay THIẾU</div>
      <Monitor x={110} y={530} w={1060} h={270} f={mon} a={ap(t, 0)} hr="75" />
      <div style={{position: 'absolute', left: 1290, top: 820, display: 'flex', gap: 22, fontFamily: FONT, fontSize: 22, fontWeight: 800, opacity: ap(t, 1)}}>
        <span style={{color: '#C4B5FD'}}>● ổ nhĩ</span><span style={{color: '#67E8F9'}}>● bộ nối</span><span style={{color: '#FCA5A5'}}>● ổ thất</span>
      </div>
      <div style={{position: 'absolute', left: 112, top: 830, width: 1060, fontFamily: FONT, fontSize: 20, color: '#94A3B8', opacity: ap(t, 1)}}>Nguồn: 2018 ACC/AHA/HRS Bradycardia · 2021 ESC Pacing · 2022 ESC Ventricular Arrhythmias · LITFL</div>
    </AbsoluteFill>
  );
};

// ================= 1 · SỚM hay MUỘN =================
const EarlyLate: React.FC = () => {
  const t = useT();
  const q = 11, pxs = 25 * q;
  const exp1 = [0.25, 1.05, 1.85, 2.65, 3.45];
  const cmp = ap(t, 6, 1.6);       // compa dời
  const cx = 10 + (0.25 + cmp * 1.6) * pxs;
  return (
    <DeskBg>
      <Head t={t}>Sớm hay muộn? So với RR cơ bản</Head>
      <Frame x={60} y={130} a={ap(t, -1)} c={OR}>
        <Strip L={rhythm(R_PVC)} w={1180} h={300} q={q} base={0.62} t0={0} label="II" stroke={3.5}>
          {(X, Y) => (
            <g>
              <g opacity={ap(t, 0.4)}>{exp1.map((e) => <line key={e} x1={X(e)} x2={X(e)} y1={40} y2={290} stroke="#64748B" strokeWidth={2.5} strokeDasharray="8 8" />)}</g>
              <g opacity={ap(t, 2)}>
                <path d={`M${X(2.65)},${Y(0.75)} L${X(2.47)},${Y(0.75)}`} stroke={OR} strokeWidth={6} markerEnd="url(#arO)" />
                <text x={X(2.7)} y={Y(0.75) + 10} fontFamily={FONT} fontSize={30} fontWeight={900} fill={OR}>SỚM</text>
              </g>
              <g opacity={cmp > 0 ? 1 : 0}>
                <path d={`M${cx},272 L${cx + 0.8 * pxs},272`} stroke={TE} strokeWidth={5} />
                <circle cx={cx} cy={272} r={8} fill={TE} /><circle cx={cx + 0.8 * pxs} cy={272} r={8} fill={TE} />
              </g>
              <defs><marker id="arO" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={OR} /></marker>
                <marker id="arB" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={BL} /></marker></defs>
            </g>
          )}
        </Strip>
      </Frame>
      <Frame x={60} y={470} a={ap(t, 3.4)} c={BL}>
        <Strip L={rhythm(R_ESC)} w={1180} h={300} q={q} base={0.62} t0={0} label="II" stroke={3.5}>
          {(X, Y) => (
            <g>
              <g opacity={ap(t, 3.6)}>{exp1.map((e) => <line key={e} x1={X(e)} x2={X(e)} y1={40} y2={290} stroke="#64748B" strokeWidth={2.5} strokeDasharray="8 8" />)}</g>
              <g opacity={ap(t, 4.2)}>
                <rect x={X(2.2)} y={212} width={X(3.3) - X(2.2)} height={50} rx={10} fill="rgba(37,99,235,0.12)" />
                <text x={(X(2.2) + X(3.3)) / 2} y={248} textAnchor="middle" fontFamily={HAND} fontSize={32} fill={BL}>khoảng nghỉ dài</text>
                <path d={`M${X(2.65)},${Y(0.75)} L${X(3.36)},${Y(0.75)}`} stroke={BL} strokeWidth={6} markerEnd="url(#arB)" />
                <text x={X(2.95)} y={Y(0.75) - 14} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={900} fill={BL}>MUỘN</text>
              </g>
            </g>
          )}
        </Strip>
      </Frame>
      <Card x={1280} y={150} w={580} a={ap(t, 2)} c={OR} title="Đến SỚM → NGOẠI TÂM THU">một ổ khác “chen ngang”</Card>
      <Card x={1280} y={490} w={580} a={ap(t, 4)} c={BL} title="Đến MUỘN → NHỊP THOÁT">ổ bên dưới “ra cứu”</Card>
      <Memo x={1280} y={690} w={580} a={ap(t, 6)}>Compa / mép giấy: lấy 1 RR → dời sang nhát kế</Memo>
      <Lbl x={70} y={790} a={ap(t, 0.6)} c="#CBD5E1" size={28}>- - - vạch = vị trí nhát xoang DỰ KIẾN</Lbl>
    </DeskBg>
  );
};

// ================= 2 · NGOẠI TÂM THU NHĨ =================
const PAC: React.FC = () => {
  const t = useT();
  const rt = useCurrentFrame() / 30;
  const ph = (rt % 1.4) / 1.4;
  return (
    <DeskBg>
      <Head t={t}>Ngoại tâm thu NHĨ</Head>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart4C id="pac10" x={20} y={110} s={0.5} a={ap(t, -1)} ring={0.5} cond={0.9} dots={pacDots(ph)} />
        <g transform="translate(20,110) scale(0.5)"><Focus p={FA} c={PU} pulse={ph} /></g>
      </svg>
      <Lbl x={70} y={760} a={ap(t, 0.4)} c="#C4B5FD" size={30}>ổ lạc chỗ ở nhĩ → vẫn qua nút nhĩ thất → bó His</Lbl>
      <Frame x={690} y={130} a={ap(t, -1)} c={PU}>
        <Strip L={rhythm(R_PAC)} w={1170} h={330} q={11} base={0.6} t0={0} label="II" stroke={3.5}>
          {(X, Y) => (
            <g>
              <g opacity={ap(t, 2)}><circle cx={X(2.22)} cy={Y(0.1)} r={30} fill="none" stroke={PU} strokeWidth={5} /><text x={X(2.18)} y={Y(0.1) - 40} textAnchor="end" fontFamily={HAND} fontSize={34} fill={PU}>P′ sớm</text>
                <circle cx={X(1.69)} cy={Y(0.08)} r={26} fill="none" stroke="#64748B" strokeWidth={4} strokeDasharray="6 5" /><text x={X(1.69)} y={Y(0.08) + 58} textAnchor="middle" fontFamily={HAND} fontSize={28} fill="#475569">P xoang</text></g>
              <g opacity={ap(t, 4)}><rect x={X(2.33)} y={Y(1.1)} width={X(2.42) - X(2.33)} height={Y(-0.35) - Y(1.1)} rx={6} fill="rgba(34,197,94,0.18)" stroke={GR} strokeWidth={3} /></g>
              <g opacity={ap(t, 6)}><circle cx={X(3.42)} cy={Y(0.32)} r={36} fill="none" stroke={OR} strokeWidth={5} /><text x={X(3.36)} y={Y(0.32) - 48} textAnchor="end" fontFamily={HAND} fontSize={32} fill={OR}>T “có bướu”</text></g>
            </g>
          )}
        </Strip>
      </Frame>
      <Card x={690} y={500} w={1170} a={ap(t, 2)} c={PU} title="P′ đến SỚM · hình dạng KHÁC sóng P xoang" />
      <Card x={690} y={600} w={1170} a={ap(t, 4)} c={GR} title="QRS thường HẸP, giống QRS nền">vẫn đi đường dẫn truyền bình thường</Card>
      <Memo x={690} y={745} w={1170} a={ap(t, 6)}>P′ càng sớm → lẫn vào sóng T trước → <span style={{color: PEN}}>T “có bướu”</span></Memo>
    </DeskBg>
  );
};

// ================= 3 · NGOẠI TÂM THU BỘ NỐI =================
const PJC: React.FC = () => {
  const t = useT();
  const rt = useCurrentFrame() / 30;
  const ph = (rt % 1.2) / 1.2;
  const mini: [string, BT][] = [['P âm TRƯỚC QRS', 'jb'], ['P LẪN trong QRS', 'jh'], ['P âm SAU QRS', 'ja']];
  return (
    <DeskBg>
      <Head t={t}>Ngoại tâm thu BỘ NỐI</Head>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart4C id="pjc10" x={20} y={110} s={0.5} a={ap(t, -1)} ring={0.5} cond={0.9} dots={pjcDots(ph)} />
        <g transform="translate(20,110) scale(0.5)"><Focus p={H4.AV} c={TE} pulse={ph} /></g>
      </svg>
      <Pill x={70} y={760} a={ap(t, 4)} c={TE} size={28}>↑ NGƯỢC lên nhĩ · ↓ XUÔI xuống thất</Pill>
      <Card x={690} y={130} w={1170} a={ap(t, 0)} c={TE} title="QRS HẸP · đến SỚM" />
      {mini.map(([lab, k], i) => (
        <div key={k} style={{position: 'absolute', left: 690 + i * 395, top: 250, opacity: ap(t, 2 + i * 0.5)}}>
          <Frame x={0} y={0} a={1} c={TE}>
            <Strip L={rhythm([[0.35, k]])} w={375} h={300} q={14} base={0.62} t0={0} label="II" stroke={4}>
              {(X, Y) => k !== 'jh' ? <circle cx={X(0.35 + (k === 'jb' ? -0.08 : 0.12))} cy={Y(-0.12)} r={22} fill="none" stroke={TE} strokeWidth={4} /> : <circle cx={X(0.35)} cy={Y(0.4)} r={34} fill="none" stroke={TE} strokeWidth={4} strokeDasharray="6 5" />}
            </Strip>
          </Frame>
          <div style={{position: 'absolute', left: 0, top: 312, width: 375, textAlign: 'center', fontFamily: FONT, fontSize: 26, fontWeight: 900, color: '#A5F3FC'}}>{lab}</div>
        </div>
      ))}
      <Memo x={690} y={680} w={1170} a={ap(t, 2)}>P ÂM ở II, III, aVF · nếu đứng trước: PR &lt; 0,12 s</Memo>
    </DeskBg>
  );
};

// ================= 4 · HAI CÁI BẪY =================
const Traps: React.FC = () => {
  const t = useT();
  const RB: [number, BT][] = [...sinus(3), [2.12, 'bl'], [3.45, 's'], [4.25, 's'], [5.05, 's']];
  const RA: [number, BT][] = [...sinus(3), [2.37, 'ab'], [3.17, 's'], [3.97, 's'], [4.77, 's']];
  const lens = ap(t, 2);
  return (
    <DeskBg>
      <Head t={t}>Hai cái bẫy của ngoại tâm thu nhĩ</Head>
      <Pill x={60} y={128} a={ap(t, 0)} c={PU} size={26}>BẪY 1 · BỊ BLOCK</Pill>
      <Frame x={60} y={190} a={ap(t, 0)} c={PU}>
        <Strip L={rhythm(RB)} w={1150} h={270} q={11} base={0.62} t0={0} label="II" stroke={3.5}>
          {(X, Y) => (
            <g>
              <g opacity={ap(t, 0.5)}><rect x={X(2.25)} y={44} width={X(3.3) - X(2.25)} height={46} rx={8} fill="rgba(139,92,246,0.14)" /><text x={(X(2.25) + X(3.3)) / 2} y={78} textAnchor="middle" fontFamily={HAND} fontSize={28} fill={PU}>không có QRS</text></g>
              <g opacity={lens}><circle cx={X(1.98)} cy={Y(0.25)} r={46} fill="rgba(255,255,255,0.25)" stroke="#334155" strokeWidth={6} /><line x1={X(1.98) + 32} y1={Y(0.25) + 32} x2={X(1.98) + 70} y2={Y(0.25) + 70} stroke="#334155" strokeWidth={10} strokeLinecap="round" /><text x={X(1.98) + 80} y={Y(0.25) + 105} fontFamily={HAND} fontSize={30} fill={PU}>P′ nằm trong T</text></g>
            </g>
          )}
        </Strip>
      </Frame>
      <Card x={1250} y={190} w={610} a={ap(t, 0)} c={PU} title="P′ rất sớm, nút nhĩ thất còn trơ">→ KHÔNG có QRS theo sau</Card>
      <Card x={1250} y={330} w={610} a={ap(t, 2)} c="#64748B" title="Giống ngưng xoang / block độ II">→ soi sóng T trước khoảng nghỉ</Card>
      <Memo x={1250} y={470} w={610} a={ap(t, 4)}>Nguyên nhân hay gặp NHẤT của một khoảng nghỉ bất ngờ</Memo>
      <Pill x={60} y={500} a={ap(t, 6)} c={OR} size={26}>BẪY 2 · DẪN TRUYỀN LỆCH HƯỚNG</Pill>
      <Frame x={60} y={562} a={ap(t, 6)} c={OR}>
        <Strip L={rhythm(RA)} w={1150} h={250} q={11} base={0.62} t0={0} label="II" stroke={3.5}>
          {(X, Y) => <g opacity={ap(t, 8)}><circle cx={X(2.22)} cy={Y(0.1)} r={26} fill="none" stroke={PU} strokeWidth={5} /><text x={X(2.22) - 20} y={Y(0.1) - 36} textAnchor="end" fontFamily={HAND} fontSize={30} fill={PU}>P′ sớm</text><rect x={X(2.33)} y={Y(1.0)} width={X(2.47) - X(2.33)} height={Y(-0.5) - Y(1.0)} rx={6} fill="none" stroke={OR} strokeWidth={4} /><text x={X(2.5)} y={Y(1.0) + 10} fontFamily={HAND} fontSize={30} fill={OR}>QRS rộng</text></g>}
        </Strip>
      </Frame>
      <Card x={1250} y={612} w={610} a={ap(t, 6)} c={OR} title="QRS RỘNG">hay dạng block nhánh phải · một nhánh còn trơ</Card>
      <Card x={1250} y={768} w={610} a={ap(t, 8)} c={PU} title="Có P′ sớm đi trước → vẫn là NHĨ" />
    </DeskBg>
  );
};

// ================= 5 · NGOẠI TÂM THU THẤT =================
const PVC: React.FC = () => {
  const t = useT();
  const rt = useCurrentFrame() / 30;
  const ph = (rt % 1.3) / 1.3;
  return (
    <DeskBg>
      <Head t={t}>Ngoại tâm thu THẤT</Head>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart4C id="pvc10" x={20} y={110} s={0.5} a={ap(t, -1)} ring={0.5} cond={0.5} glowL={0.3 + 0.5 * Math.sin(ph * Math.PI)} glowC={RD} dots={spread(ph)} />
        <g transform="translate(20,110) scale(0.5)"><Focus p={FV} c={RD} pulse={ph} /></g>
      </svg>
      <Lbl x={70} y={760} a={ap(t, 6)} c="#FCA5A5" size={30}>lan chậm: tế bào → tế bào</Lbl>
      <Frame x={690} y={130} a={ap(t, -1)} c={RD}>
        <Strip L={rhythm(R_PVC)} w={1170} h={360} q={11} base={0.55} t0={0} label="II" stroke={3.5}>
          {(X, Y) => (
            <g>
              <g opacity={ap(t, 0.4)}><line x1={X(2.33)} x2={X(2.33)} y1={Y(1.5)} y2={Y(-0.8)} stroke={RD} strokeWidth={3} strokeDasharray="6 5" /><line x1={X(2.49)} x2={X(2.49)} y1={Y(1.5)} y2={Y(-0.8)} stroke={RD} strokeWidth={3} strokeDasharray="6 5" /><path d={`M${X(2.33)},${Y(1.3)} L${X(2.49)},${Y(1.3)}`} stroke={RD} strokeWidth={4} /><text x={X(2.53)} y={Y(1.3) + 10} fontFamily={FONT} fontSize={28} fontWeight={900} fill={RD}>≥ 0,12 s</text></g>
              <g opacity={ap(t, 2)}><circle cx={X(2.17)} cy={Y(0.05)} r={28} fill="none" stroke="#64748B" strokeWidth={4} strokeDasharray="6 5" /><text x={X(2.17) - 34} y={Y(0.05) + 60} textAnchor="middle" fontFamily={HAND} fontSize={30} fill="#475569">không P′</text></g>
              <g opacity={ap(t, 4)}>
                                <path d={`M${X(2.67)},${Y(0.05)} L${X(2.67)},${Y(-0.75)}`} stroke={BL} strokeWidth={6} markerEnd="url(#arBl)" />
                <text x={X(2.72) + 14} y={Y(-0.6)} fontFamily={HAND} fontSize={30} fill={BL}>T ngược chiều</text>
              </g>
              <defs><marker id="arR" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={RD} /></marker>
                <marker id="arBl" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={BL} /></marker></defs>
            </g>
          )}
        </Strip>
      </Frame>
      <Card x={690} y={530} w={570} a={ap(t, 0)} c={RD} title="QRS RỘNG ≥ 0,12 s">hình dạng “kỳ dị”</Card>
      <Card x={1290} y={530} w={570} a={ap(t, 2)} c="#64748B" title="KHÔNG có P′ đi trước" />
      <Card x={1290} y={650} w={570} a={ap(t, 4)} c={BL} title="ST – T NGƯỢC chiều QRS" />
      <Memo x={690} y={680} w={570} a={ap(t, 6)}>Xung sinh trong thất → QRS RỘNG</Memo>
    </DeskBg>
  );
};

// ================= 6 · NGHỈ BÙ =================
const Pause: React.FC = () => {
  const t = useT();
  const q = 9, pxs = 25 * q;
  const R_INT: [number, BT][] = [[0.25, 's'], [1.05, 's'], [1.85, 's'], [2.27, 'v'], [2.73, 's'], [3.53, 's'], [4.33, 's']];
  const brk = (X: (T: number) => number, a: number, b: number, y: number, c: string, txt: string, op: number) => (
    <g opacity={op}>
      <path d={`M${X(a)},${y + 14} L${X(a)},${y} L${X(b)},${y} L${X(b)},${y + 14}`} fill="none" stroke={c} strokeWidth={5} />
      <text x={X(b) + 14} y={y + 12} fontFamily={FONT} fontSize={26} fontWeight={900} fill={c}>{txt}</text>
    </g>
  );
  const ruler = (X: (T: number) => number, a: number, y: number, op: number) => (
    <g opacity={op}><rect x={X(a)} y={y} width={1.6 * pxs} height={14} rx={4} fill={TE} opacity={0.55} /><line x1={X(a + 0.8)} x2={X(a + 0.8)} y1={y - 4} y2={y + 18} stroke="#0E7490" strokeWidth={3} /></g>
  );
  void MONO;
  return (
    <DeskBg>
      <Head t={t}>Nghỉ bù: đủ hay thiếu?</Head>
      <div style={{position: 'absolute', left: 60, top: 118, fontFamily: FONT, fontSize: 26, fontWeight: 800, color: '#A5F3FC', opacity: ap(t, 0)}}>Đo từ R TRƯỚC → R SAU nhát sớm · so với 2 × RR</div>
      <Frame x={60} y={170} a={ap(t, 1.4)} c={RD}>
        <Strip L={rhythm(R_PVC)} w={1180} h={240} q={q} base={0.68} t0={0} label="II · thất" stroke={3}>
          {(X) => <g>{brk(X, 1.85, 3.45, 22, RD, '= 2 × RR → ĐỦ ✓', ap(t, 2))}{ruler(X, 1.85, 218, ap(t, 2.4))}</g>}
        </Strip>
      </Frame>
      <Frame x={60} y={430} a={ap(t, 3.4)} c={PU}>
        <Strip L={rhythm(R_PAC)} w={1180} h={240} q={q} base={0.68} t0={0} label="II · nhĩ" stroke={3}>
          {(X) => <g>{brk(X, 1.85, 3.17, 22, PU, '< 2 × RR → THIẾU', ap(t, 4))}{ruler(X, 1.85, 218, ap(t, 4.4))}</g>}
        </Strip>
      </Frame>
      <Frame x={60} y={690} a={ap(t, 6)} c={OR}>
        <Strip L={rhythm(R_INT)} w={1180} h={240} q={q} base={0.68} t0={0} label="II · xen kẽ" stroke={3}>
          {(X) => brk(X, 1.85, 2.73, 22, OR, 'chen giữa · KHÔNG nghỉ bù', ap(t, 6.4))}
        </Strip>
      </Frame>
      <Card x={1280} y={170} w={580} a={ap(t, 2)} c={RD} title="ĐỦ (hoàn toàn) → THẤT">nút xoang KHÔNG bị chạm, vẫn phát đúng hẹn</Card>
      <Card x={1280} y={430} w={580} a={ap(t, 4)} c={PU} title="THIẾU (không hoàn toàn) → NHĨ">nút xoang bị “cài lại”</Card>
      <Card x={1280} y={600} w={580} a={ap(t, 6)} c={OR} title="Thất XEN KẼ: không nghỉ bù" />
      <Memo x={1280} y={730} w={580} a={ap(t, 8)}>Chỉ là GỢI Ý — hình dạng QRS &amp; P′ vẫn là chính</Memo>
    </DeskBg>
  );
};

const SCN: React.FC[] = [Cover, EarlyLate, PAC, PJC, Traps, PVC, Pause];
export const ECTO_N = 7;
export const Ectopy: React.FC = () => (
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
    <SeriesTag sub="Ngoại tâm thu & nhịp thoát" />
    <StationBar10 />
    <Caption />
    <Progress />
  </AbsoluteFill>
);
export {rhythm, sinus, R_PAC, R_PVC, R_ESC, pacDots, pjcDots, Focus, FA, FV, Pill, Lbl, StationBar10, ST7, STC};
export type {BT};
void AM;
