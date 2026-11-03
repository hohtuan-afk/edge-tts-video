// BÀI 11 · NHỮNG KẺ GIẢ DẠNG ST CHÊNH LÊN — CHÊNH KHÔNG PHẢI LÀ TẮC
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import data from '../data.json';
import keys from './mimic_keys.json';
import stations from './mimic_stations.json';
import {TimeMap, CapCtx, FONT, useT} from '../lib';
import {Caption, Progress} from '../Main';
import {MONO} from './Lab';
import {Fade, SeriesTag} from './Demo';
import {HAND} from '../wb/wb';
import {Memo, Card, Head, DeskBg, ap, PEN} from './Bundle';
import {Strip, Frame} from './Infarct';

const RD = '#DC2626', BL = '#2563EB', OR = '#F97316', PU = '#8B5CF6', GR = '#22C55E', TE = '#06B6D4', AM = '#F59E0B', YE = '#CA8A04';
const gs = (x: number, mu: number, w: number, a: number) => a * Math.exp(-((x - mu) ** 2) / (2 * w * w));
const sm = (x: number) => 1 / (1 + Math.exp(-x));

// ===== mô hình nhát bóp (x = 0 tại đầu QRS) =====
type B = {
  p?: number; pr?: number; q?: number; r?: number; s?: number; sw?: number; j?: number; t?: number; tp?: number; tw?: number;
  notch?: number; conv?: number; wide?: number; spike?: boolean; cov?: number; sad?: number; rp?: number;
};
const beat = (b: B) => (x: number) => {
  const {p = 0.12, pr = 0, q = 0, r = 1, s = -0.2, sw = 0.012, j = 0, t = 0.3, tp = 0.3, tw = 0.055, notch = 0, conv = 0, wide = 0, cov = 0, sad = 0, rp = 0} = b;
  let v = gs(x, -0.13, 0.024, p);
  v += pr * sm((x + 0.1) / 0.006) * (1 - sm((x + 0.012) / 0.005));           // đoạn PR chênh
  if (wide) {
    v += gs(x, 0.06, 0.04, wide);                                           // QRS rộng (block nhánh trái, máy tạo nhịp)
    if (b.spike) v += gs(x, -0.012, 0.0025, 1.6);
  } else {
    v += gs(x, 0.008, 0.007, q) + gs(x, 0.03, 0.011, r) + gs(x, 0.06, sw, s);
  }
  const J = wide ? 0.13 : 0.085;
  const seg = sm((x - J) / 0.006) * (1 - sm((x - (tp + 0.07)) / 0.03));
  v += j * seg;                                                              // ST chênh
  v += conv * sm((x - J) / 0.008) * gs(x, (J + tp) / 2 + 0.02, 0.09, 1) * 1.0; // ST lồi (tắc thật)
  v += gs(x, J + 0.006, 0.009, notch);                                       // khấc J (tái cực sớm)
  if (cov) v += sm((x - 0.07) / 0.005) * cov * Math.exp(-Math.max(0, x - 0.085) / 0.2) * (1 - sm((x - 0.28) / 0.04)) + gs(x, 0.34, 0.06, -0.22);
  if (sad) v += gs(x, 0.085, 0.016, sad) + 0.12 * sm((x - 0.08) / 0.006) * (1 - sm((x - 0.36) / 0.03)) + gs(x, 0.3, 0.055, 0.34);
  v += gs(x, 0.085, 0.012, rp);                                              // r′
  v += gs(x, tp, tw, t);
  return v;
};
const train = (b: B, rr = 0.9, off = 0.3) => {
  const f = beat(b);
  return (T: number) => {
    const k = Math.round((T - off) / rr);
    let v = 0;
    for (let i = k - 1; i <= k + 1; i++) v += f(T - (off + i * rr));
    return v;
  };
};

// 12 chuyển đạo
const LEADS = ['I', 'aVR', 'V1', 'V4', 'II', 'aVL', 'V2', 'V5', 'III', 'aVF', 'V3', 'V6'];
const PERI: Record<string, B> = {
  I: {r: 0.7, j: 0.13, pr: -0.05, t: 0.3}, II: {r: 1.1, j: 0.18, pr: -0.08, t: 0.35}, III: {r: 0.5, j: 0.06, pr: -0.03, t: 0.15},
  aVR: {p: -0.1, r: -0.8, s: 0.1, j: -0.14, pr: 0.08, t: -0.25}, aVL: {r: 0.4, j: 0.06, pr: -0.02, t: 0.15}, aVF: {r: 0.8, j: 0.13, pr: -0.06, t: 0.28},
  V1: {r: 0.25, s: -0.9, j: 0.02, t: 0.1}, V2: {r: 0.4, s: -1.1, j: 0.15, pr: -0.04, t: 0.4}, V3: {r: 0.8, s: -0.7, j: 0.18, pr: -0.05, t: 0.42},
  V4: {r: 1.2, s: -0.4, j: 0.2, pr: -0.06, t: 0.42}, V5: {r: 1.1, s: -0.25, j: 0.17, pr: -0.06, t: 0.36}, V6: {r: 0.9, s: -0.15, j: 0.13, pr: -0.05, t: 0.32},
};
const UP_PERI = ['I', 'II', 'aVF', 'V2', 'V3', 'V4', 'V5', 'V6'];
const Grid12: React.FC<{x: number; y: number; cw: number; ch: number; L: Record<string, B>; a: number; hl?: Record<string, string>; q?: number; children?: React.ReactNode}> = ({x, y, cw, ch, L, a, hl = {}, q = 6, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: cw * 4, height: ch * 3, borderRadius: 14, overflow: 'hidden', boxShadow: '0 18px 36px rgba(0,0,0,0.45)', opacity: a}}>
    {LEADS.map((ld, i) => (
      <div key={ld} style={{position: 'absolute', left: (i % 4) * cw, top: Math.floor(i / 4) * ch, outline: hl[ld] ? `4px solid ${hl[ld]}` : undefined, outlineOffset: -4, zIndex: hl[ld] ? 2 : 1}}>
        <Strip L={train(L[ld], 0.9, 0.35)} w={cw} h={ch} q={q} base={0.58} t0={0} label={ld} stroke={2.6} />
      </div>
    ))}
    {children}
  </div>
);

// ===== thanh trạm =====
const ST7 = ['4 CÂU KIỂM TRA', 'MÀNG NGOÀI TIM', 'TÁI CỰC SỚM', 'THỨ PHÁT', 'BRUGADA', 'PHÌNH THẤT · PHỔI', 'ÔN TẬP'];
const STC = ['#DC2626', '#CA8A04', '#06B6D4', '#2563EB', '#8B5CF6', '#F97316', '#22C55E'];
const StationBar11: React.FC = () => {
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
const Lbl: React.FC<{x: number; y: number; a: number; c: string; size?: number; children: React.ReactNode}> = ({x, y, a, c, size = 32, children}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: HAND, fontSize: size, color: c, opacity: a}}>{children}</div>
);
const Banner: React.FC<{y: number; a: number; c: string; children: React.ReactNode}> = ({y, a, c, children}) => (
  <div style={{position: 'absolute', left: 60, top: y, width: 1800, padding: '18px 28px', borderRadius: 18, background: c, color: '#fff', fontFamily: FONT, fontSize: 36, fontWeight: 900, boxSizing: 'border-box', textAlign: 'center', opacity: a, transform: `scale(${0.94 + 0.06 * a})`, boxShadow: '0 14px 30px rgba(0,0,0,0.4)'}}>{children}</div>
);

// tắc thật (thành trước) vs lan toả
const STEMI_V2: B = {r: 0.5, s: -0.6, j: 0.15, conv: 0.28, t: 0.5, tp: 0.29, tw: 0.07};
const STEMI_V3: B = {r: 0.7, s: -0.4, j: 0.18, conv: 0.3, t: 0.55, tp: 0.29, tw: 0.07};
const RECIP_II: B = {r: 1.0, j: -0.12, t: 0.1};

// ================= 0 · BÌA =================
const Cover: React.FC = () => {
  const t = useT();
  const rt = useCurrentFrame() / 30;
  const mx = 1180 + 300 * 1.5 + 60 * Math.sin(rt * 0.8), my = 400 + 40 * Math.cos(rt * 0.6);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 72% 45%, #3A2A0A, #0B1218 72%)'}}>
      <Grid12 x={1000} y={170} cw={210} ch={150} L={PERI} a={ap(t, 0)} q={5} />
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: ap(t, 0.6)}}>
        <circle cx={mx - 200} cy={my} r={95} fill="rgba(255,255,255,0.12)" stroke="#FDE047" strokeWidth={8} />
        <line x1={mx - 200 + 66} y1={my + 66} x2={mx - 200 + 140} y2={my + 140} stroke="#FDE047" strokeWidth={18} strokeLinecap="round" />
      </svg>
      <div style={{position: 'absolute', left: 110, top: 110, fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: 4, color: '#5EEAD4', opacity: ap(t, 0.2)}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 11</div>
      <div style={{position: 'absolute', left: 106, top: 156, width: 860, fontFamily: FONT, fontSize: 76, fontWeight: 800, lineHeight: 1.06, color: '#F8FAFC', opacity: ap(t, 0.4)}}>
        Những kẻ <span style={{color: '#FDE047'}}>giả dạng</span><br />ST chênh lên
      </div>
      <div style={{position: 'absolute', left: 112, top: 345, fontFamily: FONT, fontSize: 36, fontWeight: 700, color: '#CBD5E1', opacity: ap(t, 0.8)}}>Chênh không phải là tắc</div>
      <div style={{position: 'absolute', left: 112, top: 420, display: 'flex', flexDirection: 'column', gap: 12, fontFamily: FONT, fontSize: 28, fontWeight: 800, opacity: ap(t, 2)}}>
        <span style={{padding: '6px 16px', borderRadius: 12, background: 'rgba(148,163,184,0.2)', color: '#CBD5E1', alignSelf: 'flex-start'}}>Bài 6: KHÔNG CHÊNH vẫn có thể TẮC</span>
        <span style={{padding: '6px 16px', borderRadius: 12, background: 'rgba(202,138,4,0.25)', color: '#FDE047', alignSelf: 'flex-start'}}>Hôm nay: CHÊNH chưa chắc đã TẮC</span>
      </div>
      <div style={{position: 'absolute', left: 110, top: 580, padding: '16px 34px', borderRadius: 22, border: '5px solid #FDE047', background: 'rgba(202,138,4,0.14)', fontFamily: FONT, fontSize: 64, fontWeight: 900, color: '#FEF08A', opacity: ap(t, 4), transform: `scale(${0.85 + 0.15 * ap(t, 4)})`, transformOrigin: 'left center'}}>CHÊNH ≠ TẮC</div>
      <div style={{position: 'absolute', left: 112, top: 830, width: 1700, fontFamily: FONT, fontSize: 20, color: '#94A3B8', opacity: ap(t, 1)}}>Nguồn: 2025 ESC Myocarditis &amp; Pericarditis · 2022 ESC Ventricular Arrhythmias · 2026 AHA/ACC Pulmonary Embolism · 2023 ESC ACS · LITFL</div>
    </AbsoluteFill>
  );
};

// ================= 1 · 4 CÂU KIỂM TRA =================
const Checks: React.FC = () => {
  const t = useT();
  const qs: [string, string, string][] = [
    ['① LAN TOẢ?', 'theo 1 vùng mạch vành hay khắp nơi', RD],
    ['② SOI GƯƠNG?', 'chênh xuống đối diện → nghĩ TẮC thật', OR],
    ['③ HÌNH DẠNG?', 'lõm hay lồi · có Q không · T ra sao', PU],
    ['④ BỐI CẢNH?', 'tuổi · triệu chứng · sốt · ECG CŨ', TE],
  ];
  const trio = (ls: [string, B][], c: string) => (
    <div style={{display: 'flex'}}>{ls.map(([n, b]) => <div key={n} style={{borderRight: '2px solid #EC9A8E'}}><Strip L={train(b, 0.9, 0.3)} w={310} h={210} q={7} base={0.6} t0={0} label={n} stroke={3} /></div>)}<div style={{width: 0, borderLeft: `0 solid ${c}`}} /></div>
  );
  return (
    <DeskBg>
      <Head t={t}>4 câu kiểm tra trước khi gọi là tắc</Head>
      {qs.map(([k, v, c], i) => (
        <div key={k} style={{position: 'absolute', left: 60, top: 140 + i * 132, width: 830, padding: '14px 22px', borderRadius: 16, background: '#FCFAF4', borderLeft: `12px solid ${c}`, boxSizing: 'border-box', fontFamily: FONT, opacity: ap(t, 2 + i * 2), transform: `translateX(${(1 - ap(t, 2 + i * 2)) * 40}px)`, boxShadow: '0 12px 26px rgba(0,0,0,0.35)'}}>
          <div style={{fontSize: 38, fontWeight: 900, color: c}}>{k}</div>
          <div style={{fontSize: 27, fontWeight: 700, color: '#26221C'}}>{v}</div>
        </div>
      ))}
      <div style={{position: 'absolute', left: 930, top: 132, fontFamily: FONT, fontSize: 28, fontWeight: 900, color: '#FCA5A5', opacity: ap(t, 2)}}>TẮC THẬT: theo vùng + soi gương</div>
      <Frame x={930} y={176} a={ap(t, 2)} c={RD}>{trio([['V2', STEMI_V2], ['V3', STEMI_V3], ['II', RECIP_II]], RD)}</Frame>
      <Lbl x={1560} y={385} a={ap(t, 4)} c={OR} size={30}>↑ II: soi gương</Lbl>
      <div style={{position: 'absolute', left: 930, top: 420, fontFamily: FONT, fontSize: 28, fontWeight: 900, color: '#FDE047', opacity: ap(t, 3)}}>GIẢ DẠNG: lan toả, lõm, không soi gương</div>
      <Frame x={930} y={464} a={ap(t, 3)} c={YE}>{trio([['II', PERI.II], ['V3', PERI.V3], ['V5', PERI.V5]], YE)}</Frame>
      <Banner y={720} a={ap(t, 10)} c={RD}>Còn nghi ngờ → coi như TẮC · ECG lại sau 15 – 30 phút · men tim · siêu âm tim</Banner>
    </DeskBg>
  );
};

// ================= 2 · VIÊM MÀNG NGOÀI TIM =================
const Peri: React.FC = () => {
  const t = useT();
  const hl: Record<string, string> = {};
  if (ap(t, 0.3) > 0.5) UP_PERI.forEach((l) => {hl[l] = YE;});
  if (ap(t, 2) > 0.5) hl.aVR = PU;
  const cw = 290, ch = 196;
  return (
    <DeskBg>
      <Head t={t}>Viêm màng ngoài tim</Head>
      <Grid12 x={60} y={125} cw={cw} ch={ch} L={PERI} a={ap(t, -1)} hl={hl} q={7}>
        <svg viewBox={`0 0 ${cw * 4} ${ch * 3}`} width={cw * 4} height={ch * 3} style={{position: 'absolute', inset: 0, zIndex: 3}}>
          <g opacity={ap(t, 2)}><ellipse cx={10 + (0.35 - 0.06) * 175} cy={ch + ch * 0.58 + 6} rx={26} ry={16} fill="none" stroke={PU} strokeWidth={4} />
            <text x={10 + (0.35 - 0.06) * 175} y={ch + ch * 0.58 + 50} textAnchor="middle" fontFamily={HAND} fontSize={26} fill={PU}>PR ↓</text></g>
        </svg>
      </Grid12>
      <Card x={1250} y={125} w={610} a={ap(t, 0)} c={YE} title="ST chênh LÕM, LAN TOẢ">nhiều chuyển đạo · không theo 1 vùng mạch vành</Card>
      <Card x={1250} y={262} w={610} a={ap(t, 2)} c={PU} title="PR chênh XUỐNG (rõ ở II)">aVR ngược lại: ST ↓ · PR ↑</Card>
      <Card x={1250} y={399} w={610} a={ap(t, 4)} c="#64748B" title="KHÔNG soi gương · KHÔNG Q">(trừ aVR, V1)</Card>
      <Memo x={1250} y={530} w={610} a={ap(t, 6)}>ESC 2025: đau ngực + &gt; 1 tiêu chuẩn thêm<br /><span style={{fontSize: 24, fontWeight: 700}}>tiếng cọ · ECG · CRP tăng · tràn dịch mới</span></Memo>
      <Pill x={60} y={735} a={ap(t, 8)} c="#475569" size={28}>ECG đổi theo giờ – ngày · ECG bình thường lúc đầu KHÔNG loại trừ</Pill>
      <Pill x={60} y={810} a={ap(t, 10)} c={RD} size={28}>⚠ VIÊM CƠ TIM cũng ST chênh + troponin tăng, mạch vành bình thường</Pill>
    </DeskBg>
  );
};

// ================= 3 · TÁI CỰC SỚM =================
const ER_V4: B = {r: 1.3, s: -0.15, j: 0.12, notch: 0.32, t: 0.6, tp: 0.3, tw: 0.065};
const ER_V6: B = {r: 1.0, s: -0.1, j: 0.05, notch: 0.15, t: 0.5, tw: 0.06};
const PE_V6: B = {r: 0.9, s: -0.15, j: 0.15, pr: -0.05, t: 0.38};
const Early: React.FC = () => {
  const t = useT();
  const q = 12, pxs = 25 * q, pxmv = 10 * q;
  const ratio = (b: B, c: string, txt: string, op: number) => (X: (T: number) => number, Y: (v: number) => number) => (
    <g opacity={op}>
      <line x1={X(0.3 + 0.9 + 0.12)} x2={X(0.3 + 0.9 + 0.12)} y1={Y(0)} y2={Y(b.j!)} stroke={c} strokeWidth={5} />
      <line x1={X(0.3 + 0.9 + 0.3)} x2={X(0.3 + 0.9 + 0.3)} y1={Y(0)} y2={Y(b.t! + b.j!)} stroke={c} strokeWidth={5} strokeDasharray="8 6" />
      <line x1={X(1.0)} x2={X(1.65)} y1={Y(0)} y2={Y(0)} stroke="#475569" strokeWidth={2} strokeDasharray="6 6" />
      <text x={X(1.55)} y={Y(b.t! + b.j!) - 6} fontFamily={FONT} fontSize={26} fontWeight={900} fill={c}>{txt}</text>
    </g>
  );
  void pxs; void pxmv;
  return (
    <DeskBg>
      <Head t={t}>Tái cực sớm</Head>
      <Frame x={60} y={125} a={ap(t, -1)} c={TE}>
        <Strip L={train(ER_V4, 0.9, 0.3)} w={1150} h={340} q={q} base={0.66} t0={0} label="V4" stroke={4}>
          {(X, Y) => <g>
            <g opacity={ap(t, 0.4)}><circle cx={X(1.295)} cy={Y(0.3)} r={22} fill="none" stroke={TE} strokeWidth={5} /><path d={`M${X(1.0)},${Y(0.9)} L${X(1.27)},${Y(0.42)}`} stroke={TE} strokeWidth={5} markerEnd="url(#arT)" /><text x={X(1.0) - 8} y={Y(0.95)} textAnchor="end" fontFamily={HAND} fontSize={34} fill="#0E7490">khấc J</text></g>
            <g opacity={ap(t, 2)}><text x={X(1.6)} y={Y(0.8)} fontFamily={HAND} fontSize={32} fill="#0E7490">T cao</text><text x={X(1.36)} y={Y(-0.3)} fontFamily={HAND} fontSize={30} fill="#0E7490">ST lõm</text></g>
            <defs><marker id="arT" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={TE} /></marker></defs>
          </g>}
        </Strip>
      </Frame>
      <Card x={1250} y={125} w={610} a={ap(t, 0)} c={TE} title="Điểm J chênh · KHẤC hoặc TRÁT cuối QRS" />
      <Card x={1250} y={240} w={610} a={ap(t, 2)} c={TE} title="ST lõm · T cao · V2 – V5">ổn định theo thời gian</Card>
      <Card x={1250} y={380} w={610} a={ap(t, 4)} c={GR} title="Người trẻ · vận động viên">RẤT hay gặp ở tuổi vị thành niên</Card>
      <div style={{position: 'absolute', left: 60, top: 505, fontFamily: FONT, fontSize: 28, fontWeight: 900, color: '#A5F3FC', opacity: ap(t, 6)}}>Đo ở V6: ST ÷ T</div>
      <Frame x={60} y={548} a={ap(t, 6)} c={TE}>
        <Strip L={train(ER_V6, 0.9, 0.3)} w={560} h={250} q={13} base={0.74} t0={0.95} label="V6" stroke={3.5}>{ratio(ER_V6, '#0E7490', '< 0,25', ap(t, 6.4))}</Strip>
      </Frame>
      <Frame x={650} y={548} a={ap(t, 6)} c={YE}>
        <Strip L={train(PE_V6, 0.9, 0.3)} w={560} h={250} q={13} base={0.74} t0={0.95} label="V6" stroke={3.5}>{ratio(PE_V6, '#A16207', '≥ 0,25', ap(t, 6.4))}</Strip>
      </Frame>
      <div style={{position: 'absolute', left: 60, top: 808, width: 560, textAlign: 'center', fontFamily: FONT, fontSize: 26, fontWeight: 900, color: '#67E8F9', opacity: ap(t, 6.6)}}>→ TÁI CỰC SỚM</div>
      <div style={{position: 'absolute', left: 650, top: 808, width: 560, textAlign: 'center', fontFamily: FONT, fontSize: 26, fontWeight: 900, color: '#FDE047', opacity: ap(t, 6.6)}}>→ VIÊM MÀNG NGOÀI TIM</div>
      <Card x={1250} y={548} w={610} a={ap(t, 8)} c={RD} title="⚠ Tắc động mạch liên thất trước SỚM">cũng T cao, ST lõm → so ECG cũ, làm lại</Card>
    </DeskBg>
  );
};

// ================= 4 · THỨ PHÁT =================
const LVH: B = {r: 0.25, s: -2.2, sw: 0.016, j: 0.22, t: 0.45, tp: 0.31, tw: 0.065};
const LBBB: B = {r: 0, s: 0, wide: -1.3, j: 0.22, t: 0.4, tp: 0.36, tw: 0.07};
const PACE: B = {p: 0, r: 0, s: 0, wide: -1.2, spike: true, j: 0.2, t: 0.38, tp: 0.36, tw: 0.07};
const Secondary: React.FC = () => {
  const t = useT();
  const rows: [string, B, string, number, string, string][] = [
    ['V2 · dày thất trái', LVH, BL, 2, 'DÀY THẤT TRÁI', 'S rất sâu V1 – V3 → ST chênh lên'],
    ['V1 · block nhánh trái', LBBB, PU, 4, 'BLOCK NHÁNH TRÁI', 'QRS rộng âm → ST chênh lên'],
    ['V1 · máy tạo nhịp', PACE, TE, 4.6, 'MÁY TẠO NHỊP THẤT', 'gai + QRS rộng → ST ngược chiều'],
  ];
  return (
    <DeskBg>
      <Head t={t}>ST chênh thứ phát: do QRS kéo theo</Head>
      {rows.map(([lab, b, c, st, ti, sub], i) => (
        <React.Fragment key={lab}>
          <Frame x={60} y={125 + i * 232} a={ap(t, st)} c={c}>
            <Strip L={train(b, 1.0, 0.3)} w={1150} h={210} q={7} base={i === 0 ? 0.3 : 0.45} t0={0} label={lab} stroke={3.2}>
              {(X, Y) => <g opacity={ap(t, st + 0.6)}>
                <path d={`M${X(2.3 + (i === 0 ? 0.06 : 0.07))},${Y(0) - 6} L${X(2.3 + (i === 0 ? 0.06 : 0.07))},${Y(i === 0 ? -1.6 : -0.9)}`} stroke={RD} strokeWidth={5} markerEnd="url(#arDn)" />
                <path d={`M${X(2.3 + 0.24)},${Y(0) + 4} L${X(2.3 + 0.24)},${Y(0.5)}`} stroke={GR} strokeWidth={5} markerEnd="url(#arUp)" />
                <defs><marker id="arDn" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={RD} /></marker>
                  <marker id="arUp" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={GR} /></marker></defs>
              </g>}
            </Strip>
          </Frame>
          <Card x={1250} y={125 + i * 232} w={610} a={ap(t, st)} c={c} title={ti}>{sub}</Card>
        </React.Fragment>
      ))}
      <Banner y={830} a={ap(t, 6)} c={GR}>Nhớ bài 6: ST NGƯỢC chiều QRS = bình thường · CÙNG chiều = bệnh</Banner>
    </DeskBg>
  );
};

// ================= 5 · BRUGADA: 2 TÍP =================
const BR1: B = {r: 0.25, s: -0.55, cov: 0.5, t: 0, tp: 0.33};
const BR2: B = {r: 0.25, s: -0.55, sad: 0.38, t: 0, tp: 0.3};
const BrugadaTypes: React.FC = () => {
  const t = useT();
  return (
    <DeskBg>
      <Head t={t}>Brugada: 2 típ ở V1 – V2</Head>
      <Pill x={60} y={118} a={ap(t, 0)} c={PU} size={26}>ST chênh V1 – V2 · nguy cơ rung thất, đột tử</Pill>
      <div style={{position: 'absolute', left: 60, top: 182, fontFamily: FONT, fontSize: 32, fontWeight: 900, color: '#FCA5A5', opacity: ap(t, 2)}}>TÍP 1 · “VÒM”</div>
      <Frame x={60} y={228} a={ap(t, 2)} c={RD}>
        <Strip L={train(BR1, 1.0, 0.3)} w={880} h={420} q={14} base={0.62} t0={0} label="V1" stroke={4.5}>
          {(X, Y) => <g opacity={ap(t, 2.5)}>
            <line x1={X(1.3 + 0.09)} x2={X(1.3 + 0.09)} y1={Y(0)} y2={Y(0.42)} stroke={RD} strokeWidth={5} />
            <text x={X(1.3 + 0.09) + 14} y={Y(0.5)} fontFamily={HAND} fontSize={34} fill={RD}>≥ 2 mm</text>
            <text x={X(1.3 + 0.2)} y={Y(0.05) + 14} fontFamily={HAND} fontSize={32} fill={RD}>đi xuống</text>
            <text x={X(1.3 + 0.3)} y={Y(-0.3) + 40} fontFamily={HAND} fontSize={32} fill={RD}>T âm</text>
          </g>}
        </Strip>
      </Frame>
      <div style={{position: 'absolute', left: 980, top: 182, fontFamily: FONT, fontSize: 32, fontWeight: 900, color: '#FDBA74', opacity: ap(t, 4)}}>TÍP 2 · “YÊN NGỰA”</div>
      <Frame x={980} y={228} a={ap(t, 4)} c={OR}>
        <Strip L={train(BR2, 1.0, 0.3)} w={880} h={420} q={14} base={0.62} t0={0} label="V2" stroke={4.5}>
          {(X, Y) => <g opacity={ap(t, 4.5)}>
            <text x={X(1.3 + 0.06)} y={Y(0.45)} fontFamily={HAND} fontSize={32} fill={OR}>r′</text>
            <text x={X(1.3 + 0.16)} y={Y(0.0) + 40} fontFamily={HAND} fontSize={32} fill={OR}>võng xuống</text>
            <text x={X(1.3 + 0.27)} y={Y(0.3)} fontFamily={HAND} fontSize={32} fill={OR}>T dương</text>
          </g>}
        </Strip>
      </Frame>
      <Banner y={690} a={ap(t, 6)} c={RD}>Chỉ TÍP 1 mới CHẨN ĐOÁN · típ 2 chỉ GỢI Ý</Banner>
      <Lbl x={60} y={800} a={ap(t, 8)} c="#CBD5E1" size={30}>Cách chia cũ 3 típ → típ 3 đã gộp vào típ 2 (đồng thuận 2012)</Lbl>
    </DeskBg>
  );
};

// ================= 6 · BRUGADA: LÀM LỘ & SỐT =================
const Unmask: React.FC = () => {
  const t = useT();
  const mv = ap(t, 0.5, 1.4);
  const ics = [0, 1, 2, 3, 4];      // khoang liên sườn 1..5
  const yOf = (k: number) => 190 + k * 110;
  const ey = yOf(3) - mv * (yOf(3) - yOf(1.5));
  const fever = ap(t, 4.4, 1.6);
  const mix = (T: number) => (1 - fever) * train(BR2, 1.0, 0.3)(T) + fever * train(BR1, 1.0, 0.3)(T);
  return (
    <DeskBg>
      <Head t={t}>Brugada: làm lộ típ 1</Head>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <g opacity={ap(t, -1)}>
          <path d="M120,150 Q340,110 560,150 L600,760 Q340,800 80,760 Z" fill="#E7D2C0" stroke="#A8876D" strokeWidth={4} />
          <rect x={322} y={150} width={36} height={520} rx={14} fill="#F5E9DC" stroke="#A8876D" strokeWidth={3} />
          {ics.map((k) => <g key={k}><path d={`M140,${yOf(k) + 30} Q340,${yOf(k) - 10} 540,${yOf(k) + 30}`} fill="none" stroke="#C4A68A" strokeWidth={6} />
            <text x={612} y={yOf(k) + 40} fontFamily={FONT} fontSize={22} fontWeight={800} fill="#7C5E45">{k + 1 < 5 ? `KLS ${k + 1}` : ''}</text></g>)}
          <circle cx={300} cy={ey} r={22} fill={PU} stroke="#fff" strokeWidth={5} /><circle cx={380} cy={ey} r={22} fill={PU} stroke="#fff" strokeWidth={5} />
          <text x={300} y={ey + 8} textAnchor="middle" fontFamily={FONT} fontSize={16} fontWeight={900} fill="#fff">V1</text>
          <text x={380} y={ey + 8} textAnchor="middle" fontFamily={FONT} fontSize={16} fontWeight={900} fill="#fff">V2</text>
          <g opacity={ap(t, 0.5)}><path d={`M460,${yOf(3) + 10} L460,${yOf(1.5) + 20}`} stroke={PU} strokeWidth={6} markerEnd="url(#arP)" /></g>
          <defs><marker id="arP" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={PU} /></marker></defs>
        </g>
      </svg>
      <Card x={680} y={125} w={1180} a={ap(t, 0)} c={PU} title="Gặp típ 2 → đặt V1 – V2 CAO lên khoang liên sườn 2 – 3" />
      <Card x={680} y={230} w={1180} a={ap(t, 2)} c="#475569" title="Hoặc test thuốc chẹn kênh natri tại CHUYÊN KHOA → xem có lộ típ 1" />
      <Frame x={680} y={345} a={ap(t, 4)} c={fever > 0.5 ? RD : OR}>
        <Strip L={mix} w={900} h={330} q={12} base={0.62} t0={0} label="V1" stroke={4} />
      </Frame>
      <div style={{position: 'absolute', left: 1610, top: 360, width: 250, textAlign: 'center', fontFamily: FONT, opacity: ap(t, 4)}}>
        <div style={{fontSize: 70}}>🌡️</div>
        <div style={{fontSize: 46, fontWeight: 900, color: fever > 0.5 ? '#F87171' : '#CBD5E1'}}>{(37 + 2.5 * fever).toFixed(1).replace('.', ',')} °C</div>
        <div style={{fontSize: 26, fontWeight: 800, color: fever > 0.5 ? '#FCA5A5' : '#FDBA74', marginTop: 8}}>{fever > 0.5 ? 'lộ TÍP 1' : 'típ 2'}</div>
      </div>
      <Pill x={680} y={700} a={ap(t, 4.6)} c={RD} size={30}>SỐT làm LỘ típ 1 → hạ sốt TÍCH CỰC, nhất là ở trẻ em</Pill>
      <Memo x={680} y={780} w={1180} a={ap(t, 6)}>Tránh thuốc làm nặng Brugada · chuyển chuyên khoa nhịp tim</Memo>
    </DeskBg>
  );
};

const SCN: React.FC[] = [Cover, Checks, Peri, Early, Secondary, BrugadaTypes, Unmask];
export const MIMIC_N = 7;
export const Mimic: React.FC = () => (
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
    <SeriesTag sub="Những kẻ giả dạng ST chênh lên" />
    <StationBar11 />
    <Caption />
    <Progress />
  </AbsoluteFill>
);
export {beat, train, PERI, Grid12, LEADS, BR1, BR2, ER_V4, LVH, STEMI_V2, STEMI_V3, RECIP_II, Pill, Lbl, Banner, StationBar11};
export type {B};
void MONO; void PEN; void AM;
