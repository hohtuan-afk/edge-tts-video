// BÀI 1: TIẾP CẬN BAN ĐẦU MỘT ĐIỆN TÂM ĐỒ — 14 cảnh, 8 trạm
// Câu thần chú: KIỂM giấy – xem NHỊP – đếm SỐ – tìm TRỤC – đo KHOẢNG – soi ST
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, Easing, staticFile, useCurrentFrame} from 'remotion';
import data from '../data.json';
import keys from './appr_keys.json';
import stations from './appr_stations.json';
import {TimeMap, CapCtx, FONT, useT} from '../lib';
import {Caption, Progress} from '../Main';
import {MONO} from './Lab';
import {Sheet, Sticky} from './Paper';
import {Fade, SeriesTag} from './Demo';
import {Heart6} from '../wb/heart6';
import {HAND, RPath, RArrow} from '../wb/wb';
import {Lead} from './ecg';

const ap = (t: number, s: number, d = 0.6) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1)});
const dp = (t: number, s: number, d = 0.8) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
const useBeat = () => Math.max(0, Math.sin((useCurrentFrame() / 30) * 2 * Math.PI * 1.1)) ** 4;
const INK = '#1E1E24', PEN = '#C81E3A';
const DeskBg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 40% 35%, #3a4a52, #1d272c 75%)'}}>
    <AbsoluteFill style={{background: 'repeating-linear-gradient(95deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 9px)'}} />
    {children}
  </AbsoluteFill>
);
const Pink: React.FC<{w: number; h: number; mm: number}> = ({w, h, mm}) => {
  const g: React.ReactNode[] = [];
  for (let i = 0; i <= w / mm; i++) g.push(<line key={'v' + i} x1={i * mm} x2={i * mm} y1={0} y2={h} stroke={i % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={i % 5 ? 0.7 : 1.5} />);
  for (let j = 0; j <= h / mm; j++) g.push(<line key={'h' + j} x1={0} x2={w} y1={j * mm} y2={j * mm} stroke={j % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={j % 5 ? 0.7 : 1.5} />);
  return <g><rect width={w} height={h} fill="#FFF6F2" />{g}</g>;
};
const Banner: React.FC<{x: number; y: number; a: number; w?: number; c?: string; size?: number; children: React.ReactNode}> = ({x, y, a, w, c = '#D7263D', size = 32, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, padding: '14px 26px', borderRadius: 14, background: c, color: '#fff', fontFamily: FONT, fontSize: size, fontWeight: 800, lineHeight: 1.25, opacity: a, transform: `scale(${0.92 + 0.08 * a})`, transformOrigin: 'left center', boxShadow: '0 12px 28px rgba(0,0,0,0.4)'}}>{children}</div>
);
const Memo: React.FC<{x: number; y: number; w: number; a: number; children: React.ReactNode}> = ({x, y, w, a, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, padding: '16px 22px', borderRadius: 16, background: '#FFF4C2', border: '2px solid #E8C547', opacity: a, transform: `translateY(${(1 - a) * 20}px)`, boxSizing: 'border-box', boxShadow: '0 12px 28px rgba(0,0,0,0.3)'}}>
    <div style={{fontFamily: FONT, fontSize: 20, fontWeight: 800, letterSpacing: 2, color: '#8A6D00'}}>GHI NHỚ</div>
    <div style={{fontFamily: FONT, fontSize: 30, fontWeight: 800, color: '#26221C', marginTop: 4, lineHeight: 1.3}}>{children}</div>
  </div>
);
const Card: React.FC<{x: number; y: number; w: number; a: number; c: string; title: string; children?: React.ReactNode}> = ({x, y, w, a, c, title, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, padding: '16px 22px', borderRadius: 16, background: '#FCFAF4', borderLeft: `10px solid ${c}`, boxShadow: '0 14px 30px rgba(0,0,0,0.35)', opacity: a, transform: `translateX(${(1 - a) * 40}px)`, boxSizing: 'border-box', fontFamily: FONT}}>
    <div style={{fontSize: 30, fontWeight: 800, color: c, lineHeight: 1.2}}>{title}</div>
    {children && <div style={{fontSize: 27, fontWeight: 600, color: '#26221C', marginTop: 6, lineHeight: 1.3}}>{children}</div>}
  </div>
);

// nhát bóp chuẩn dùng cho phóng to (mốc so với đỉnh R, giây):
// P −0,20 → −0,10 · QRS −0,045 → +0,045 · T kết thúc ≈ +0,335 → PR 0,16 s, QRS 0,09 s, QT 0,38 s
const gs = (x: number, mu: number, w: number, a: number) => a * Math.exp(-((x - mu) ** 2) / (2 * w * w));
const beatN = (tr: number, p = 0.14) => gs(tr, -0.15, 0.02, p) + gs(tr, -0.03, 0.009, -0.08) + gs(tr, 0, 0.011, 1.1) + gs(tr, 0.026, 0.01, -0.25) + gs(tr, 0.22, 0.045, 0.32);
const M = {P0: -0.2, P1: -0.1, Q: -0.045, J: 0.045, T1: 0.335};

// ================= THANH TRẠM =================
const ST8 = ['KIỂM TRA', 'NHỊP', 'TẦN SỐ', 'TRỤC', 'P · PR', 'QRS · QT', 'ST–T', 'ÔN TẬP'];
const STC = ['#F43F5E', '#A855F7', '#3B82F6', '#14B8A6', '#F59E0B', '#EF4444', '#EC4899', '#22C55E'];
const StationBar: React.FC = () => {
  const f = useCurrentFrame();
  const idx = data.scenes.findIndex((s) => f >= s.from && f < s.from + s.dur);
  const cur = idx >= 0 ? (stations as number[])[idx] : 0;
  if (!cur) return null;
  return (
    <div style={{position: 'absolute', right: 22, top: 6, display: 'flex', gap: 6, alignItems: 'center', padding: '5px 8px', borderRadius: 12, background: 'rgba(8,12,18,0.78)', border: '1px solid rgba(255,255,255,0.14)', fontFamily: FONT}}>
      {ST8.map((n, i) => {
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
const MANTRA: [string, string, number][] = [['KIỂM', 'giấy', 0], ['xem', 'NHỊP', 1], ['đếm', 'SỐ', 2], ['tìm', 'TRỤC', 3], ['đo', 'KHOẢNG', 4], ['soi', 'ST', 6]];
const Cover: React.FC = () => {
  const t = useT();
  const beat = useBeat();
  const rt = useCurrentFrame() / 30;
  const pts: string[] = [];
  for (let x = 0; x <= 1920; x += 3) {
    const tr = (((x / 300) % 0.8) + 0.8) % 0.8 - 0.28;
    pts.push(`${x},${(905 - beatN(tr) * 60).toFixed(1)}`);
  }
  const head = (rt * 520) % 2400;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 40%, #1B2E3A, #0B1218 75%)'}}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="cvF2" x1="0" x2="1"><stop offset="0" stopColor="#39FF8A" stopOpacity="0" /><stop offset="1" stopColor="#39FF8A" stopOpacity="0.9" /></linearGradient>
          <clipPath id="cvC2"><rect x={head - 900} y={780} width={900} height={200} /></clipPath>
        </defs>
        <polyline points={pts.join(' ')} fill="none" stroke="#39FF8A" strokeWidth={3} opacity={0.1} />
        <g clipPath="url(#cvC2)"><polyline points={pts.join(' ')} fill="none" stroke="url(#cvF2)" strokeWidth={4} /></g>
        <Heart6 id="cv2" x={1180} y={130} s={1.25} prog={dp(t, 0.3, 1.2)} art={dp(t, 1.0, 1.6)} labels={false} beat={beat} />
      </svg>
      <div style={{position: 'absolute', left: 110, top: 140, fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: 4, color: '#5EEAD4', opacity: ap(t, 0.2)}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 1</div>
      <div style={{position: 'absolute', left: 106, top: 186, width: 1050, fontFamily: FONT, fontSize: 78, fontWeight: 800, lineHeight: 1.08, color: '#F8FAFC', opacity: ap(t, 0.4), transform: `translateY(${(1 - ap(t, 0.4)) * 20}px)`}}>
        Tiếp cận ban đầu<br /><span style={{color: '#39FF8A'}}>một điện tâm đồ</span>
      </div>
      <div style={{position: 'absolute', left: 110, top: 420, width: 1040, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center'}}>
        {MANTRA.map(([a, b, ci], i) => {
          const k = ap(t, 2.0 + i * 0.3, 0.4);
          const upFirst = a === a.toUpperCase();
          return (
            <React.Fragment key={i}>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 8, padding: '8px 20px', borderRadius: 30, background: 'rgba(255,255,255,0.06)', border: `2px solid ${STC[ci]}`, opacity: k, transform: `translateY(${(1 - k) * 14}px)`, fontFamily: FONT}}>
                <span style={{fontSize: upFirst ? 30 : 24, fontWeight: upFirst ? 800 : 500, color: upFirst ? STC[ci] : '#CBD5E1'}}>{a}</span>
                <span style={{fontSize: upFirst ? 24 : 30, fontWeight: upFirst ? 500 : 800, color: upFirst ? '#CBD5E1' : STC[ci]}}>{b}</span>
              </div>
              {i < MANTRA.length - 1 && <span style={{color: '#64748B', fontSize: 28, opacity: k}}>–</span>}
            </React.Fragment>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 110, top: 610, width: 960, padding: '20px 28px', borderRadius: 18, background: '#FFF4C2', border: '2px solid #E8C547', opacity: ap(t, 4.0), transform: `translateY(${(1 - ap(t, 4.0)) * 20}px)`, fontFamily: FONT}}>
        <div style={{fontSize: 20, fontWeight: 800, letterSpacing: 2, color: '#8A6D00'}}>MỤC TIÊU</div>
        <div style={{fontSize: 32, fontWeight: 800, color: '#26221C', marginTop: 4, lineHeight: 1.3}}>Đọc mọi ECG theo <span style={{color: PEN}}>một trình tự cố định</span> → không bỏ sót.</div>
      </div>
      <div style={{position: 'absolute', left: 112, top: 790, fontFamily: FONT, fontSize: 20, color: '#94A3B8', opacity: ap(t, 1.0)}}>Nguồn: AHA/ACCF/HRS 2009 ECG Standardization · LITFL ECG Library · Hampton, The ECG Made Easy</div>
    </AbsoluteFill>
  );
};

// ================= 1 · GIẤY ECG =================
const GridScene: React.FC = () => {
  const t = useT();
  const mm = 24, W0 = 1176, H0 = 768;
  const bx = 240, by = 240; // ô lớn được tô
  const sx = 528, sy = 264; // ô nhỏ
  const base = 600, cx0 = 600; // xung chuẩn
  const cal = dp(t, 8.0, 0.8);
  const after: string[] = [];
  for (let x = cx0 + 200; x <= W0 - 20; x += 2) {
    const tt = (x - cx0 - 200) / (25 * mm);
    const tr = ((tt % 0.8) + 0.8) % 0.8 - 0.32;
    after.push(`${x},${(base - beatN(tr) * 10 * mm).toFixed(1)}`);
  }
  return (
    <DeskBg>
      <div style={{position: 'absolute', left: 50, top: 110, width: W0, height: H0, boxShadow: '0 30px 60px rgba(0,0,0,0.45)', transform: `rotate(-0.5deg) translateY(${(1 - ap(t, 0, 0.8)) * 900}px)`}}>
        <svg viewBox={`0 0 ${W0} ${H0}`} width={W0} height={H0} style={{position: 'absolute', inset: 0}}>
          <Pink w={W0} h={H0} mm={mm} />
          {/* ô lớn + ô nhỏ */}
          <rect x={bx} y={by} width={5 * mm} height={5 * mm} fill="rgba(59,130,246,0.18)" stroke="#2563EB" strokeWidth={4} opacity={ap(t, 2.0)} />
          <rect x={sx} y={sy} width={mm} height={mm} fill="rgba(250,204,21,0.75)" stroke="#B45309" strokeWidth={3} opacity={ap(t, 2.3)} />
          <text x={bx + 60} y={by - 14} textAnchor="middle" fontFamily={HAND} fontSize={34} fill="#2563EB" opacity={ap(t, 2.0)}>ô lớn 5 mm</text>
          <text x={sx + 12} y={sy - 14} textAnchor="middle" fontFamily={HAND} fontSize={34} fill="#B45309" opacity={ap(t, 2.3)}>ô nhỏ 1 mm</text>
          {/* ngang = thời gian */}
          <g opacity={ap(t, 4.0)}>
            <path d={`M${bx},${by + 5 * mm + 18} v10 h${5 * mm} v-10`} fill="none" stroke={PEN} strokeWidth={3} />
            <text x={bx + 60} y={by + 5 * mm + 58} textAnchor="middle" fontFamily={MONO} fontSize={28} fontWeight={700} fill={PEN}>0,2 s</text>
            <path d={`M${sx},${sy + mm + 14} v8 h${mm} v-8`} fill="none" stroke={PEN} strokeWidth={3} />
            <text x={sx + 12} y={sy + mm + 50} textAnchor="middle" fontFamily={MONO} fontSize={24} fontWeight={700} fill={PEN}>0,04 s</text>
            <RArrow x1={80} y1={470} x2={420} y2={470} prog={dp(t, 4.2, 0.6)} stroke={PEN} sw={4} seed={3} head={18} />
            <text x={80} y={455} fontFamily={HAND} fontSize={32} fill={PEN}>thời gian →</text>
          </g>
          {/* dọc = điện thế */}
          <g opacity={ap(t, 6.0)}>
            <path d={`M${bx - 18},${by} h-10 v${5 * mm} h10`} fill="none" stroke="#2563EB" strokeWidth={3} />
            <text x={bx - 36} y={by + 70} textAnchor="end" fontFamily={MONO} fontSize={28} fontWeight={700} fill="#2563EB">0,5 mV</text>
            <path d={`M${sx + mm + 12},${sy} h8 v${mm} h-8`} fill="none" stroke="#2563EB" strokeWidth={3} />
            <text x={sx + mm + 30} y={sy + 20} fontFamily={MONO} fontSize={24} fontWeight={700} fill="#2563EB">0,1 mV</text>
            <RArrow x1={60} y1={420} x2={60} y2={120} prog={dp(t, 6.2, 0.6)} stroke="#2563EB" sw={4} seed={4} head={18} />
            <text x={74} y={140} fontFamily={HAND} fontSize={32} fill="#2563EB">điện thế ↑</text>
          </g>
          {/* xung chuẩn */}
          {cal > 0 && (
            <g>
              <polyline points={`${cx0 - 120},${base} ${cx0},${base} ${cx0},${base - 10 * mm} ${cx0 + 5 * mm},${base - 10 * mm} ${cx0 + 5 * mm},${base} ${cx0 + 200},${base}`} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cal} />
              <polyline points={after.join(' ')} fill="none" stroke={INK} strokeWidth={3} strokeLinejoin="round" opacity={ap(t, 8.6)} />
              <g opacity={ap(t, 8.6)}>
                <path d={`M${cx0 - 16},${base} h-10 v${-10 * mm} h10`} fill="none" stroke={PEN} strokeWidth={3} />
                <text x={cx0 - 34} y={base - 110} textAnchor="end" fontFamily={MONO} fontSize={28} fontWeight={700} fill={PEN}>10 mm</text>
                <text x={cx0 - 34} y={base - 74} textAnchor="end" fontFamily={MONO} fontSize={28} fontWeight={700} fill={PEN}>= 1 mV</text>
              </g>
            </g>
          )}
        </svg>
      </div>
      {/* phiếu hành chính */}
      <div style={{position: 'absolute', left: 1270, top: 120, width: 590, padding: '16px 22px', background: '#FDFDF8', boxShadow: '0 16px 32px rgba(0,0,0,0.4)', transform: `rotate(1.2deg) translateX(${(1 - ap(t, 0.4)) * 80}px)`, opacity: ap(t, 0.4), fontFamily: MONO, fontSize: 24, color: '#1F2937', lineHeight: 1.6}}>
        <div>BN: <b>Nguyễn Văn A</b> · 58 tuổi</div>
        <div>Ngày: 24/10 · 21:14</div>
        <div>Lúc đo: <span style={{color: PEN, fontWeight: 700}}>đang đau ngực</span></div>
        <div style={{color: '#64748B'}}>25 mm/s · 10 mm/mV · 0,05–150 Hz</div>
      </div>
      <Card x={1270} y={400} w={590} a={ap(t, 4.0)} c={PEN} title="NGANG = THỜI GIAN">25 mm/s → ô nhỏ 0,04 s · ô lớn 0,2 s</Card>
      <Card x={1270} y={560} w={590} a={ap(t, 6.0)} c="#2563EB" title="DỌC = ĐIỆN THẾ">10 mm/mV → ô nhỏ 0,1 mV</Card>
      <Memo x={1270} y={720} w={590} a={ap(t, 10.0)}>1 ô nhỏ = 0,04 s<br />1 ô lớn = 0,2 s · 5 ô lớn = 1 s</Memo>
    </DeskBg>
  );
};

// ================= 2 · BỐ CỤC TỜ ECG =================
const NORMAL12: Record<string, Lead> = {
  I: {r: 0.7, s: -0.1, t: 0.3}, II: {r: 1.1, s: -0.2, t: 0.35}, III: {r: 0.5, s: -0.25, t: 0.1},
  aVR: {p: -0.1, q: 0.05, r: -0.75, s: 0.1, t: -0.25}, aVL: {r: 0.35, s: -0.25, t: 0.12}, aVF: {r: 0.8, s: -0.2, t: 0.25},
  V1: {r: 0.2, s: -0.9, t: -0.1}, V2: {r: 0.35, s: -1.2, t: 0.4}, V3: {r: 0.7, s: -0.75, t: 0.4},
  V4: {r: 1.15, s: -0.45, t: 0.4}, V5: {r: 1.3, s: -0.25, t: 0.35}, V6: {r: 1.0, s: -0.15, t: 0.3},
};
const SS = 0.93; // tỉ lệ tờ 12 chuyển đạo (1500×760)
const LayoutScene: React.FC = () => {
  const t = useT();
  const col = (c: number) => 40 + c * 375 * SS;
  return (
    <DeskBg>
      <div style={{position: 'absolute', left: 40, top: 110, width: 1500, height: 760, transform: `translateY(${(1 - ap(t, 0, 0.9)) * 900}px) scale(${SS}) rotate(-0.4deg)`, transformOrigin: '0 0', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
        <Sheet leads={NORMAL12} rings={[{lead: ['aVR'], prog: ap(t, 4.0, 0.9), color: PEN}]} />
      </div>
      {/* lớp tô cột */}
      <div style={{position: 'absolute', left: col(0), top: 110, width: 2 * 375 * SS, height: 540 * SS + 20, background: 'rgba(59,130,246,0.14)', border: '3px dashed #2563EB', borderRadius: 10, opacity: ap(t, 2.0) * (1 - ap(t, 3.9, 0.3)), boxSizing: 'border-box'}} />
      <div style={{position: 'absolute', left: col(2), top: 110, width: 2 * 375 * SS, height: 540 * SS + 20, background: 'rgba(34,197,94,0.14)', border: '3px dashed #16A34A', borderRadius: 10, opacity: ap(t, 2.5) * (1 - ap(t, 3.9, 0.3)), boxSizing: 'border-box'}} />
      <div style={{position: 'absolute', left: col(0) + 20, top: 66, fontFamily: FONT, fontSize: 30, fontWeight: 800, color: '#93C5FD', opacity: ap(t, 2.0)}}>6 chuyển đạo CHI · mặt phẳng trán</div>
      <div style={{position: 'absolute', left: col(2) + 20, top: 66, fontFamily: FONT, fontSize: 30, fontWeight: 800, color: '#86EFAC', opacity: ap(t, 2.5)}}>6 chuyển đạo TRƯỚC TIM · mặt phẳng ngang</div>
      <div style={{position: 'absolute', left: 60, top: 110 + 560 * SS + 20, width: 1395, height: 150 * SS, border: `3px dashed ${PEN}`, borderRadius: 10, opacity: ap(t, 0.8) * (1 - ap(t, 1.9, 0.3)), boxSizing: 'border-box'}} />
      <div style={{position: 'absolute', left: 1080, top: 110 + 560 * SS - 22, fontFamily: HAND, fontSize: 36, color: '#FCA5A5', opacity: ap(t, 0.8) * (1 - ap(t, 1.9, 0.3))}}>dải nhịp DII dài ↓</div>
      <Sticky x={1480} y={200} a={ap(t, 4.2)} c="#FECACA" w={400} rot={-2} size={28}>aVR bình thường <b>ÂM</b>: P, QRS, T đều hướng xuống</Sticky>
      <Sticky x={1480} y={480} a={ap(t, 6.0)} c="#FFE873" w={400} rot={2} size={28}>aVR <b>dương</b> + DI <b>âm</b><br />→ mắc đảo điện cực tay?</Sticky>
    </DeskBg>
  );
};

// ================= 3 · NHỊP =================
const RhythmScene: React.FC = () => {
  const t = useT();
  const mm = 8, pxs = 25 * mm, pxmv = 10 * mm, W0 = 1260, H0 = 780, LX = 40, DUR = 5.8;
  const y1 = 230, y2 = 590;
  const sinus = (T: number) => {const tr = ((T % 0.8) + 0.8) % 0.8 - 0.32; return beatN(tr);};
  const RS = [0.32, 1.12, 1.92, 2.72, 3.52, 4.32, 5.12];
  const AF_R = [0.28, 0.9, 1.38, 2.2, 2.72, 3.5, 3.98, 4.86, 5.42];
  const af = (T: number) => {
    let v = 0.035 * Math.sin(2 * Math.PI * 6.3 * T) + 0.025 * Math.sin(2 * Math.PI * 8.9 * T + 1);
    for (const r of AF_R) v += beatN(T - r, 0);
    return v;
  };
  const pts = (f: (T: number) => number, y0: number) => {
    const o: string[] = [];
    for (let T = 0; T <= DUR; T += 0.004) o.push(`${(LX + T * pxs).toFixed(1)},${(y0 - f(T) * pxmv).toFixed(1)}`);
    return o.join(' ');
  };
  const p1 = dp(t, 0.2, 1.4), p2 = dp(t, 8.0, 1.2);
  return (
    <DeskBg>
      <div style={{position: 'absolute', left: 40, top: 110, width: W0, height: H0, boxShadow: '0 30px 60px rgba(0,0,0,0.45)', transform: `rotate(-0.4deg) translateY(${(1 - ap(t, 0, 0.8)) * 900}px)`}}>
        <svg viewBox={`0 0 ${W0} ${H0}`} width={W0} height={H0} style={{position: 'absolute', inset: 0}}>
          <Pink w={W0} h={H0} mm={mm} />
          <text x={LX} y={y1 - 120} fontFamily={MONO} fontSize={30} fontWeight={700} fill={INK}>DII</text>
          <polyline points={pts(sinus, y1)} fill="none" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p1} />
          {/* RR đều */}
          {RS.slice(0, -1).map((r, i) => {
            const a = ap(t, 2.0 + i * 0.25, 0.3);
            const x0 = LX + r * pxs, x1 = LX + RS[i + 1] * pxs, y = y1 - 120;
            return (
              <g key={i} opacity={a}>
                <path d={`M${x0},${y + 10} v-10 H${x1} v10`} fill="none" stroke="#2563EB" strokeWidth={3} />
                <text x={(x0 + x1) / 2} y={y - 10} textAnchor="middle" fontFamily={MONO} fontSize={20} fontWeight={700} fill="#2563EB">0,80</text>
              </g>
            );
          })}
          {/* vòng sóng P */}
          {RS.map((r, i) => (
            <ellipse key={i} cx={LX + (r - 0.15) * pxs} cy={y1 - 8} rx={16} ry={22} fill="none" stroke={PEN} strokeWidth={3} opacity={ap(t, 4.0 + i * 0.12, 0.3)} />
          ))}
          {/* rung nhĩ */}
          <g opacity={ap(t, 8.0, 0.3)}>
            <text x={LX} y={y2 - 120} fontFamily={MONO} fontSize={30} fontWeight={700} fill={INK}>DII</text>
            <polyline points={pts(af, y2)} fill="none" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p2} />
            {AF_R.slice(0, -1).map((r, i) => {
              const x0 = LX + r * pxs, x1 = LX + AF_R[i + 1] * pxs, y = y2 - 110;
              return (
                <g key={i} opacity={ap(t, 8.6 + i * 0.12, 0.3)}>
                  <path d={`M${x0},${y + 10} v-10 H${x1} v10`} fill="none" stroke="#D97706" strokeWidth={3} />
                  <text x={(x0 + x1) / 2} y={y - 10} textAnchor="middle" fontFamily={MONO} fontSize={18} fontWeight={700} fill="#D97706">{(AF_R[i + 1] - r).toFixed(2).replace('.', ',')}</text>
                </g>
              );
            })}
          </g>
        </svg>
        <div style={{position: 'absolute', left: 900, top: 300, padding: '8px 20px', borderRadius: 12, background: '#16A34A', color: '#fff', fontFamily: FONT, fontSize: 32, fontWeight: 800, opacity: ap(t, 6.2), transform: `rotate(-3deg) scale(${0.9 + 0.1 * ap(t, 6.2)})`}}>NHỊP XOANG ✓</div>
        <div style={{position: 'absolute', left: 900, top: 660, padding: '8px 20px', borderRadius: 12, background: '#D97706', color: '#fff', fontFamily: FONT, fontSize: 32, fontWeight: 800, opacity: ap(t, 9.0), transform: 'rotate(-3deg)'}}>RUNG NHĨ</div>
      </div>
      {[['① Đều không?', 'RR bằng nhau', 2.0], ['② Có sóng P?', 'P trước mỗi QRS', 4.0], ['③ P dương DII?', 'âm ở aVR', 6.0]].map(([q, a, s], i) => (
        <Card key={i} x={1340} y={130 + i * 170} w={520} a={ap(t, s as number)} c={STC[1]} title={q as string}>{a as string}</Card>
      ))}
      <Memo x={1340} y={660} w={520} a={ap(t, 10.0)}>Đều? – Có P? – P dương DII?<br /><span style={{color: '#16A34A'}}>Đủ 3 → nhịp xoang</span></Memo>
    </DeskBg>
  );
};

// ================= 4 · TẦN SỐ =================
const RateScene: React.FC = () => {
  const t = useT();
  const mm = 10, pxs = 25 * mm, pxmv = 10 * mm, W0 = 1260, H0 = 520, y0 = 330;
  const X0 = 150; // đỉnh R đầu tiên trên vạch đậm (x = 150 = 15 mm)
  const f = (x: number) => {const T = (x - X0) / pxs; const tr = ((T + 0.32) % 0.8 + 0.8) % 0.8 - 0.32; return beatN(tr);};
  const pts: string[] = [];
  for (let x = 20; x <= W0 - 20; x += 2) pts.push(`${x},${(y0 - f(x) * pxmv).toFixed(1)}`);
  const LBL = ['300', '150', '100', '75', '60', '50'];
  const hit = ap(t, 4.6, 0.5);
  const bar = ap(t, 10.0);
  const mx = (v: number) => 100 + ((v - 30) / 150) * 1080;
  return (
    <DeskBg>
      <div style={{position: 'absolute', left: 40, top: 110, width: W0, height: H0, boxShadow: '0 30px 60px rgba(0,0,0,0.45)', transform: `rotate(-0.4deg) translateY(${(1 - ap(t, 0, 0.8)) * 900}px)`}}>
        <svg viewBox={`0 0 ${W0} ${H0}`} width={W0} height={H0} style={{position: 'absolute', inset: 0}}>
          <Pink w={W0} h={H0} mm={mm} />
          <polyline points={pts.join(' ')} fill="none" stroke={INK} strokeWidth={2.8} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dp(t, 0.2, 1.2)} />
          <line x1={X0} x2={X0} y1={20} y2={H0 - 20} stroke="#2563EB" strokeWidth={4} opacity={ap(t, 1.0)} />
          <text x={X0} y={H0 - 26} textAnchor="middle" fontFamily={HAND} fontSize={30} fill="#2563EB" opacity={ap(t, 1.0)}>R trên vạch đậm</text>
          {LBL.map((l, i) => {
            const x = X0 + (i + 1) * 5 * mm;
            const on = i === 3;
            return (
              <g key={l} opacity={ap(t, 2.0 + i * 0.35, 0.3)}>
                <line x1={x} x2={x} y1={70} y2={H0 - 60} stroke={on ? PEN : '#64748B'} strokeWidth={on ? 4 : 2} strokeDasharray={on ? undefined : '6 6'} />
                <text x={x} y={58} textAnchor="middle" fontFamily={MONO} fontSize={on ? 40 * (1 + 0.3 * hit) : 32} fontWeight={700} fill={on ? PEN : '#334155'}>{l}</text>
              </g>
            );
          })}
          {hit > 0 && <circle cx={X0 + 20 * mm} cy={y0 - 1.1 * pxmv} r={34} fill="none" stroke={PEN} strokeWidth={5} opacity={hit} />}
        </svg>
      </div>
      <div style={{position: 'absolute', left: 1340, top: 120, padding: '14px 26px', borderRadius: 16, background: PEN, color: '#fff', fontFamily: MONO, fontSize: 54, fontWeight: 700, opacity: hit, transform: `scale(${0.85 + 0.15 * hit})`, boxShadow: '0 12px 28px rgba(0,0,0,0.4)'}}>75 l/ph</div>
      <Card x={1340} y={260} w={520} a={ap(t, 6.0)} c={STC[2]} title="Chính xác hơn">300 ÷ số ô lớn = 300 ÷ 4 = 75<br />1500 ÷ số ô nhỏ = 1500 ÷ 20 = 75</Card>
      <Card x={1340} y={480} w={520} a={ap(t, 8.0)} c="#D97706" title="Nhịp KHÔNG đều">Số QRS trong 10 giây × 6</Card>
      {/* thang tần số */}
      <div style={{position: 'absolute', left: 40, top: 680, width: 1260, height: 180, opacity: bar, transform: `translateY(${(1 - bar) * 20}px)`}}>
        <svg viewBox="0 0 1260 180" width={1260} height={180}>
          <rect x={mx(30)} y={60} width={mx(60) - mx(30)} height={44} rx={10} fill="#3B82F6" />
          <rect x={mx(60)} y={60} width={mx(100) - mx(60)} height={44} fill="#22C55E" />
          <rect x={mx(100)} y={60} width={mx(180) - mx(100)} height={44} rx={10} fill="#EF4444" />
          {[['nhịp chậm', 45], ['bình thường', 80], ['nhịp nhanh', 140]].map(([n, v]) => (
            <text key={n as string} x={mx(v as number)} y={90} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={800} fill="#fff">{n}</text>
          ))}
          {[60, 100].map((v) => <text key={v} x={mx(v)} y={140} textAnchor="middle" fontFamily={MONO} fontSize={28} fontWeight={700} fill="#E2E8F0">{v}</text>)}
          <path d={`M${mx(75)},52 l-12,-22 h24 Z`} fill="#FDE047" />
          <text x={mx(75)} y={22} textAnchor="middle" fontFamily={MONO} fontSize={24} fontWeight={700} fill="#FDE047">75</text>
        </svg>
      </div>
    </DeskBg>
  );
};

// ================= 5 · TRỤC (cách nhìn nhanh) =================
const AX: [string, number][] = [['I', 0], ['II', 60], ['III', 120], ['aVF', 90], ['aVL', -30], ['aVR', -150]];
const MiniQRS: React.FC<{x: number; y: number; pos: boolean; s?: number; c?: string}> = ({x, y, pos, s = 1, c = INK}) => {
  const k = pos ? 1 : -1;
  return <polyline points={`${x - 40 * s},${y} ${x - 14 * s},${y} ${x - 8 * s},${y + 8 * s * k} ${x},${y - 56 * s * k} ${x + 8 * s},${y + 14 * s * k} ${x + 14 * s},${y} ${x + 40 * s},${y}`} fill="none" stroke={c} strokeWidth={4 * Math.min(1, s + 0.2)} strokeLinejoin="round" />;
};
const AxisScene: React.FC = () => {
  const t = useT();
  const cx = 560, cy = 540, R = 330;
  const P = (deg: number, r = R): [number, number] => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
  const arc = (a0: number, a1: number, r: number) => {
    const [x0, y0] = P(a0, r), [x1, y1] = P(a1, r);
    return `M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1},${y1} Z`;
  };
  const q = ap(t, 6.0, 0.6);
  const vec = dp(t, 6.2, 0.8);
  const [vx, vy] = P(60, (R - 40) * vec);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 30% 50%, #12202B, #070B10 75%)'}}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <defs><filter id="axg"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#1E3A4C" strokeWidth={2} opacity={ap(t, 0.2)} />
        <path d={arc(-30, 90, R)} fill="rgba(34,197,94,0.18)" stroke="#22C55E" strokeWidth={2} opacity={ap(t, 2.0)} />
        <path d={arc(0, 90, R)} fill="rgba(253,224,71,0.25)" opacity={q} />
        {AX.map(([n, d], i) => {
          const a = ap(t, 0.3 + i * 0.15, 0.4);
          const [x1, y1] = P(d, R * a), [x0, y0] = P(d + 180, R * a);
          const hl = n === 'I' || n === 'aVF';
          const on = hl && ap(t, 4.0) > 0;
          const [lx, ly] = P(d, R + 42);
          return (
            <g key={n} opacity={on ? 1 : t > 4 ? 0.45 : 1}>
              <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={on ? '#FDE047' : '#38BDF8'} strokeWidth={on ? 5 : 2.5} />
              <circle cx={x1} cy={y1} r={6} fill={on ? '#FDE047' : '#38BDF8'} />
              <text x={lx} y={ly + 10} textAnchor="middle" fontFamily={MONO} fontSize={30} fontWeight={700} fill={on ? '#FDE047' : '#7DD3FC'} opacity={a}>{n}</text>
            </g>
          );
        })}
        {[[-30, '−30°'], [90, '+90°'], [0, '0°'], [180, '±180°'], [-90, '−90°']].map(([d, l]) => {
          const [x, y] = P(d as number, R - 34);
          return <text key={l as string} x={x} y={y + 8} textAnchor="middle" fontFamily={MONO} fontSize={22} fill="#94A3B8" opacity={ap(t, 2.2)}>{l}</text>;
        })}
        <text x={P(30, R * 0.62)[0]} y={P(30, R * 0.62)[1]} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill="#4ADE80" opacity={ap(t, 2.2)}>bình thường</text>
        {vec > 0 && <g filter="url(#axg)"><line x1={cx} y1={cy} x2={vx} y2={vy} stroke="#FC6255" strokeWidth={8} strokeLinecap="round" /><circle cx={vx} cy={vy} r={10} fill="#FC6255" /></g>}
      </svg>
      <div style={{position: 'absolute', left: 90, top: 70, fontFamily: FONT, fontSize: 44, fontWeight: 800, color: '#F8FAFC', opacity: ap(t, 0.1)}}>Trục điện tim · mặt phẳng trán</div>
      {/* hai ô DI, aVF */}
      {[['DI', 1240], ['aVF', 1560]].map(([n, x], i) => (
        <div key={n} style={{position: 'absolute', left: x as number, top: 200, width: 280, height: 300, borderRadius: 18, background: '#FFF6F2', boxShadow: '0 16px 32px rgba(0,0,0,0.5)', opacity: ap(t, 4.0 + i * 0.3), transform: `translateY(${(1 - ap(t, 4.0 + i * 0.3)) * 30}px)`}}>
          <div style={{position: 'absolute', left: 18, top: 10, fontFamily: MONO, fontSize: 34, fontWeight: 700, color: INK}}>{n}</div>
          <svg viewBox="0 0 280 300" width={280} height={300}><MiniQRS x={140} y={180} pos s={1.6} /><text x={140} y={270} textAnchor="middle" fontFamily={FONT} fontSize={30} fontWeight={800} fill="#16A34A">DƯƠNG (+)</text></svg>
          <div style={{position: 'absolute', right: -18, top: -30, fontSize: 70, opacity: ap(t, 8.0 + i * 0.2), transform: `scale(${0.6 + 0.4 * ap(t, 8.0 + i * 0.2)})`}}>👍</div>
        </div>
      ))}
      <Banner x={1240} y={560} a={q} w={600} c="#16A34A" size={34}>DI (+) và aVF (+)<br />→ trục BÌNH THƯỜNG</Banner>
      <Memo x={1240} y={760} w={600} a={ap(t, 8.0)}>QRS dương = ngón cái chỉ lên 👍<br />2 ngón cái cùng lên = bình thường</Memo>
    </AbsoluteFill>
  );
};

// ================= 6 · TRỤC (bảng 4 ô) =================
const AXROWS: {i: boolean; f: boolean; res: string; c: string; q: [number, number]; note?: string; t0: number}[] = [
  {i: true, f: true, res: 'Bình thường', c: '#16A34A', q: [0, 90], t0: -1},
  {i: true, f: false, res: 'xem DII: (+) bình thường · (−) lệch TRÁI', c: '#2563EB', q: [-90, 0], t0: 0.2},
  {i: false, f: true, res: 'Lệch PHẢI', c: '#D97706', q: [90, 180], t0: 2.0},
  {i: false, f: false, res: 'Vô định (cực phải)', c: '#DC2626', q: [180, 270], t0: 4.0},
];
const AxisTable: React.FC = () => {
  const t = useT();
  const W0 = 1200, H0 = 760, rh = 150, ty = 140;
  return (
    <DeskBg>
      <div style={{position: 'absolute', left: 50, top: 110, width: W0, height: H0, boxShadow: '0 30px 60px rgba(0,0,0,0.45)', transform: `rotate(-0.5deg) translateY(${(1 - ap(t, -2, 0.6)) * 900}px)`}}>
        <svg viewBox={`0 0 ${W0} ${H0}`} width={W0} height={H0} style={{position: 'absolute', inset: 0}}>
          <Pink w={W0} h={H0} mm={8} />
          <text x={40} y={70} fontFamily={FONT} fontSize={40} fontWeight={800} fill={INK}>Bảng 4 ô — chỉ cần DI & aVF</text>
          {['DI', 'aVF', 'TRỤC'].map((h, j) => <text key={h} x={[100, 260, 420][j]} y={ty - 20} textAnchor={j < 2 ? 'middle' : 'start'} fontFamily={FONT} fontSize={24} fontWeight={800} fill="#5B4A47">{h}</text>)}
          {AXROWS.map((r, k) => {
            const a = ap(t, r.t0, 0.5);
            const y = ty + k * rh;
            const cx = 1080, cy = y + rh / 2, R = 52;
            const [a0, a1] = r.q;
            const p = (d: number): [number, number] => [cx + R * Math.cos((d * Math.PI) / 180), cy + R * Math.sin((d * Math.PI) / 180)];
            return (
              <g key={k} opacity={a}>
                <rect x={20} y={y + 8} width={W0 - 40} height={rh - 16} rx={14} fill={r.c} opacity={0.1} />
                <MiniQRS x={100} y={y + rh / 2 + (r.i ? 20 : -20)} pos={r.i} s={0.9} c={r.i ? '#16A34A' : '#DC2626'} />
                <MiniQRS x={260} y={y + rh / 2 + (r.f ? 20 : -20)} pos={r.f} s={0.9} c={r.f ? '#16A34A' : '#DC2626'} />
                <circle cx={cx} cy={cy} r={R} fill="#fff" stroke="#94A3B8" strokeWidth={2} />
                <path d={`M${cx},${cy} L${p(a0)[0]},${p(a0)[1]} A${R},${R} 0 0 1 ${p(a1)[0]},${p(a1)[1]} Z`} fill={r.c} opacity={0.85} />
                <line x1={cx - R} x2={cx + R} y1={cy} y2={cy} stroke="#475569" strokeWidth={1.5} />
                <line x1={cx} x2={cx} y1={cy - R} y2={cy + R} stroke="#475569" strokeWidth={1.5} />
              </g>
            );
          })}
        </svg>
        {AXROWS.map((r, k) => (
          <div key={k} style={{position: 'absolute', left: 420, top: ty + k * rh + rh / 2 - 24, width: 560, fontFamily: FONT, fontSize: k === 1 ? 30 : 38, fontWeight: 800, color: r.c, opacity: ap(t, r.t0 + 0.2, 0.5), lineHeight: 1.15}}>{r.res}</div>
        ))}
      </div>
      <Card x={1300} y={150} w={560} a={ap(t, 6.0)} c="#2563EB" title="Lệch TRÁI (< −30°)">block phân nhánh trái trước · NMCT thành dưới · dày thất trái</Card>
      <Card x={1300} y={400} w={560} a={ap(t, 6.4)} c="#D97706" title="Lệch PHẢI (> +90°)">dày thất phải · thuyên tắc phổi · block phân nhánh trái sau</Card>
      <Sticky x={1320} y={660} a={ap(t, 8.0)} c="#BBF7D0" w={520} rot={-2} size={30}>👶 Trẻ nhỏ: trục bình thường <b>lệch phải hơn</b> người lớn</Sticky>
    </DeskBg>
  );
};

// ================= KHOẢNG (P–PR, QRS, QT, ST–T): phóng to 2 nhát bóp =================
type Br = {a: number; b: number; y: number; label: string; c: string; t0: number; up?: boolean};
type ICfg = {head: string; seg: {a: number; b: number; c: string; t0: number}[]; br: Br[]; dots?: {x: number; label: string; t0: number}[]; notes: {t0: number; c: string; title: string; text: React.ReactNode}[]; memo?: {t0: number; text: React.ReactNode}; iso?: number};
const makeInterval = (cfg: ICfg): React.FC => {
  const C: React.FC = () => {
    const t = useT();
    const mm = 20, pxs = 25 * mm, pxmv = 10 * mm, W0 = 1180, H0 = 780, Y0 = 520, X0 = 150;
    const xOf = (tr: number) => X0 + (tr + 0.26) * pxs; // nhát 1: R tại x = X0 + 0,26 s
    const f = (tr: number) => beatN(tr) + beatN(tr - 0.8);
    const pts = (a: number, b: number) => {
      const o: string[] = [];
      for (let tr = a; tr <= b + 1e-9; tr += 0.002) o.push(`${xOf(tr).toFixed(1)},${(Y0 - f(tr) * pxmv).toFixed(1)}`);
      return o.join(' ');
    };
    const pr = dp(t, 0, 1.2);
    return (
      <DeskBg>
        <div style={{position: 'absolute', left: 40, top: 110, width: W0, height: H0, boxShadow: '0 30px 60px rgba(0,0,0,0.45)', transform: `rotate(-0.4deg) translateY(${(1 - ap(t, -1.5, 0.6)) * 900}px)`}}>
          <svg viewBox={`0 0 ${W0} ${H0}`} width={W0} height={H0} style={{position: 'absolute', inset: 0}}>
            <Pink w={W0} h={H0} mm={mm} />
            <text x={30} y={56} fontFamily={MONO} fontSize={34} fontWeight={700} fill={INK}>DII · phóng to</text>
            <line x1={20} x2={W0 - 20} y1={Y0} y2={Y0} stroke="#2563EB" strokeWidth={2.5} strokeDasharray="10 8" opacity={ap(t, cfg.iso ?? 99)} />
            {cfg.seg.map((s, i) => {
              const a = dp(t, s.t0, 0.6);
              return a > 0 ? <polyline key={'s' + i} points={pts(s.a, s.b)} fill="none" stroke={s.c} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" opacity={0.45 * a} /> : null;
            })}
            <polyline points={pts(-0.26, 1.15)} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pr} />
            {cfg.br.map((b, i) => {
              const a = ap(t, b.t0, 0.5);
              const x0 = xOf(b.a), x1 = xOf(b.b), k = b.up ? -1 : 1;
              return (
                <g key={'b' + i} opacity={a}>
                  <line x1={x0} x2={x0} y1={Y0} y2={b.y} stroke={b.c} strokeWidth={2} strokeDasharray="5 5" />
                  <line x1={x1} x2={x1} y1={Y0} y2={b.y} stroke={b.c} strokeWidth={2} strokeDasharray="5 5" />
                  <path d={`M${x0},${b.y - 10 * k} v${10 * k} H${x0 + (x1 - x0) * a} v${-10 * k}`} fill="none" stroke={b.c} strokeWidth={4} />
                  <text x={(x0 + x1) / 2} y={b.y + 40 * k + (k < 0 ? 10 : 0)} textAnchor="middle" fontFamily={MONO} fontSize={30} fontWeight={700} fill={b.c}>{b.label}</text>
                </g>
              );
            })}
            {(cfg.dots ?? []).map((d, i) => (
              <g key={'d' + i} opacity={ap(t, d.t0)}>
                <circle cx={xOf(d.x)} cy={Y0 - f(d.x) * pxmv} r={11} fill={PEN} />
                <text x={xOf(d.x) + 18} y={Y0 - f(d.x) * pxmv - 18} fontFamily={FONT} fontSize={30} fontWeight={800} fill={PEN}>{d.label}</text>
              </g>
            ))}
            <text x={W0 - 20} y={H0 - 14} textAnchor="end" fontFamily={MONO} fontSize={18} fill="#9b6b64">1 ô nhỏ = 0,04 s · 25 mm/s</text>
          </svg>
        </div>
        <div style={{position: 'absolute', left: 1270, top: 70, width: 600, fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#F8FAFC', opacity: ap(t, -1)}}>{cfg.head}</div>
        {cfg.notes.map((n, i) => (
          <Card key={i} x={1270} y={140 + i * 190} w={600} a={ap(t, n.t0)} c={n.c} title={n.title}>{n.text}</Card>
        ))}
        {cfg.memo && <Memo x={1270} y={140 + cfg.notes.length * 190} w={600} a={ap(t, cfg.memo.t0)}>{cfg.memo.text}</Memo>}
      </DeskBg>
    );
  };
  return C;
};
const PScene = makeInterval({
  head: 'Sóng P & khoảng PR',
  seg: [{a: M.P0, b: M.P1, c: '#A855F7', t0: 2.0}, {a: M.P0, b: M.Q, c: '#F59E0B', t0: 4.0}],
  br: [
    {a: M.P0, b: M.P1, y: 360, label: '< 0,12 s', c: '#7C3AED', t0: 2.2, up: true},
    {a: M.P0, b: M.Q, y: 640, label: 'PR 0,16 s', c: '#B45309', t0: 4.2},
  ],
  notes: [
    {t0: 2.0, c: '#7C3AED', title: 'Sóng P = khử cực nhĩ', text: <>rộng &lt; 3 ô nhỏ · cao &lt; 2,5 mm</>},
    {t0: 4.0, c: '#B45309', title: 'PR: đầu P → đầu QRS', text: <>0,12 – 0,20 s = <b>3 – 5 ô nhỏ</b></>},
    {t0: 6.0, c: '#DC2626', title: 'PR > 0,20 s', text: <>block nhĩ thất độ 1</>},
    {t0: 8.0, c: '#0EA5E9', title: 'PR < 0,12 s', text: <>tiền kích thích (WPW) · nhịp bộ nối</>},
  ],
});
const QRSScene = makeInterval({
  head: 'Phức bộ QRS',
  seg: [{a: M.Q, b: M.J, c: '#EF4444', t0: 2.0}],
  br: [{a: M.Q, b: M.J, y: 650, label: '0,09 s', c: '#DC2626', t0: 2.2}],
  notes: [
    {t0: 0.3, c: '#EF4444', title: 'QRS = khử cực thất', text: <>đo từ đầu Q/R → cuối S</>},
    {t0: 2.0, c: '#16A34A', title: 'Bình thường < 0,12 s', text: <>chưa tới <b>3 ô nhỏ</b></>},
    {t0: 4.0, c: '#DC2626', title: 'QRS ≥ 0,12 s', text: <>block nhánh · nhịp thất · tăng kali máu</>},
    {t0: 6.0, c: '#2563EB', title: 'Để ý thêm', text: <>sóng Q bệnh lý · biên độ (dày thất)</>},
  ],
});
const QTScene = makeInterval({
  head: 'Khoảng QT & QTc',
  seg: [{a: M.Q, b: M.T1, c: '#EC4899', t0: 0.2}],
  br: [
    {a: M.Q, b: M.T1, y: 650, label: 'QT 0,38 s', c: '#BE185D', t0: 0.4},
    {a: 0, b: 0.8, y: 230, label: 'RR 0,80 s', c: '#2563EB', t0: 2.2, up: true},
  ],
  notes: [
    {t0: 2.0, c: '#2563EB', title: 'QTc = QT ÷ √RR', text: <>(Bazett) · RR tính bằng giây</>},
    {t0: 4.0, c: '#BE185D', title: 'Ví dụ', text: <>0,38 ÷ √0,8 ≈ <b>0,42 s</b> (≈ 420 ms)</>},
    {t0: 6.0, c: '#DC2626', title: 'QTc bình thường', text: <>nam &lt; 450 · nữ &lt; 460 ms<br />&gt; 500 ms: nguy cơ xoắn đỉnh</>},
  ],
  memo: {t0: 8.0, text: <>Nhịp 60–100: QT &lt; ½ RR → thường ổn</>},
});
const STScene = makeInterval({
  head: 'Đoạn ST & sóng T',
  iso: 0.2,
  seg: [{a: M.J, b: 0.14, c: '#2563EB', t0: 0.3}, {a: 0.14, b: M.T1, c: '#EC4899', t0: 4.0}],
  br: [],
  dots: [{x: M.J, label: 'điểm J', t0: 2.0}],
  notes: [
    {t0: 0.3, c: '#2563EB', title: 'ST nằm ngang', text: <>trên đường đẳng điện (PR)</>},
    {t0: 2.0, c: '#DC2626', title: 'Đo tại điểm J', text: <>chênh ≥ 1 mm · ≥ 2 chuyển đạo liên tiếp → bất thường</>},
    {t0: 4.0, c: '#EC4899', title: 'Sóng T cùng chiều QRS', text: <>T đảo bình thường: aVR, V1 (± DIII)</>},
  ],
  memo: {t0: 6.0, text: <>ST chênh lên? → xem bài<br /><span style={{color: PEN}}>“ECG trong nhồi máu cơ tim cấp”</span></>},
});

// ================= 9 · TIẾN TRIỂN SÓNG R =================
const RProg: React.FC = () => {
  const t = useT();
  const hl: Record<string, number> = {};
  ['V1', 'V2', 'V3', 'V4', 'V5', 'V6'].forEach((l, i) => (hl[l] = ap(t, 0.3 + i * 0.3, 0.4)));
  return (
    <DeskBg>
      <div style={{position: 'absolute', left: 50, top: 58, fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#F8FAFC'}}>Tiến triển sóng R ở chuyển đạo trước tim</div>
      <div style={{position: 'absolute', left: 40, top: 128, width: 1500, height: 760, transform: `scale(${SS}) rotate(-0.4deg)`, transformOrigin: '0 0', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
        <Sheet leads={NORMAL12} hl={hl} rings={[{lead: ['V3', 'V4'], prog: ap(t, 2.0, 0.9), color: PEN}]} />
      </div>
      <Sticky x={1480} y={150} a={ap(t, 0.6)} c="#BBF7D0" w={400} rot={-2} size={28}>V1 → V6:<br />R <b>tăng dần</b> · S <b>nhỏ dần</b></Sticky>
      <Sticky x={1480} y={400} a={ap(t, 2.2)} c="#FECACA" w={400} rot={2} size={28}>Vùng chuyển tiếp<br />R = S ở <b>V3–V4</b></Sticky>
      <Sticky x={1480} y={640} a={ap(t, 4.0)} c="#FFE873" w={400} rot={-1} size={28}>R tăng kém → NMCT trước cũ? đặt sai điện cực?</Sticky>
    </DeskBg>
  );
};

// ================= 12 · THỰC HÀNH =================
const REPORT: [string, string, number, string][] = [
  ['KIỂM', '25 mm/s · 10 mm/mV · aVR âm', 2, STC[0]],
  ['NHỊP', 'đều · P trước QRS · P (+) DII → xoang', 4, STC[1]],
  ['SỐ', '4 ô lớn → 75 lần/phút', 6, STC[2]],
  ['TRỤC', 'DI (+) aVF (+) → bình thường', 8, STC[3]],
  ['KHOẢNG', 'PR 0,16 · QRS 0,09 · QTc 0,42 s', 10, STC[4]],
  ['ST–T', 'bình thường', 12, STC[6]],
];
const Practice: React.FC = () => {
  const t = useT();
  const hl: Record<string, number> = {};
  if (t > 4 && t < 6.2) hl.II = ap(t, 4.0, 0.4);
  if (t > 8 && t < 10.2) {hl.I = ap(t, 8.0, 0.4); hl.aVF = ap(t, 8.2, 0.4);}
  const S = 0.8;
  return (
    <DeskBg>
      <div style={{position: 'absolute', left: 50, top: 58, fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#F8FAFC'}}>Thực hành — đọc theo trình tự</div>
      <div style={{position: 'absolute', left: 40, top: 140, width: 1500, height: 760, transform: `scale(${S}) rotate(-0.6deg)`, transformOrigin: '0 0', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
        <Sheet leads={NORMAL12} hl={hl} rings={t > 6 && t < 8.2 ? [{lead: ['II'], prog: ap(t, 6.0, 0.8), color: PEN}] : []} />
      </div>
      <div style={{position: 'absolute', left: 1270, top: 120, width: 610, height: 760, background: '#FDFDF8', backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 95px, #BFD7EA 95px 97px)', boxShadow: '0 20px 40px rgba(0,0,0,0.45)', transform: 'rotate(1deg)'}}>
        <div style={{position: 'absolute', left: 24, top: 20, fontFamily: FONT, fontSize: 30, fontWeight: 800, color: PEN}}>PHIẾU ĐỌC ECG</div>
        {REPORT.map(([k, v, s, c], i) => {
          const a = ap(t, s, 0.5);
          return (
            <div key={k} style={{position: 'absolute', left: 24, top: 80 + i * 96, width: 570, opacity: a, transform: `translateX(${(1 - a) * 20}px)`, fontFamily: FONT}}>
              <div style={{fontSize: 22, fontWeight: 800, color: c, letterSpacing: 1}}>{k} <span style={{color: '#16A34A'}}>✓</span></div>
              <div style={{fontSize: 26, fontWeight: 600, color: '#1F2937', lineHeight: 1.2}}>{v}</div>
            </div>
          );
        })}
      </div>
      <Banner x={60} y={800} a={ap(t, 12.6)} w={1100} c="#16A34A" size={40}>KẾT LUẬN: điện tâm đồ BÌNH THƯỜNG</Banner>
    </DeskBg>
  );
};

// ================= 13 · TÓM TẮT =================
const TAKE: [string, string, string][] = [
  ['KIỂM', ' giấy', ': 25 mm/s · 10 mm/mV · aVR âm'],
  ['xem ', 'NHỊP', ': Đều? – Có P? – P (+) DII?'],
  ['đếm ', 'SỐ', ': 300 ÷ ô lớn · không đều: 10 s × 6'],
  ['tìm ', 'TRỤC', ': DI & aVF — hai ngón cái 👍👍'],
  ['đo ', 'KHOẢNG', ': P < 3 · PR 3–5 · QRS < 3 ô nhỏ · QTc < 450'],
  ['soi ', 'ST', ': đẳng điện · T cùng chiều QRS'],
];
const Summary: React.FC = () => {
  const t = useT();
  const beat = useBeat();
  const TC = [STC[0], STC[1], STC[2], STC[3], STC[4], STC[6]];
  return (
    <DeskBg>
      <div style={{position: 'absolute', left: 70, top: 90, width: 1250, height: 830, background: '#FDFDF8', backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 99px, #BFD7EA 99px 101px)', boxShadow: '0 30px 60px rgba(0,0,0,0.45)', transform: `rotate(-0.8deg) translateY(${(1 - ap(t, 0, 0.8)) * 900}px)`}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, marginLeft: 100, background: '#F4A3A3'}} />
        <div style={{position: 'absolute', left: 130, top: 22, fontFamily: FONT, fontSize: 48, fontWeight: 800, color: PEN, letterSpacing: 1}}>6 BƯỚC · 1 CÂU THẦN CHÚ</div>
        <svg viewBox="0 0 1250 830" width={1250} height={830} style={{position: 'absolute', inset: 0}}>
          <RPath d="M130,90 C330,82 560,96 800,86" stroke={PEN} sw={4} rough={1.5} seed={4} prog={dp(t, 0.5, 0.8)} />
          {TAKE.map((_, i) => {
            const y = 150 + i * 100;
            return <RPath key={i} d={`M34,${y + 8} L48,${y + 26} L78,${y - 14}`} stroke={PEN} sw={5} rough={0.9} seed={60 + i} prog={dp(t, 2 * (i + 1) + 0.6, 0.4)} />;
          })}
        </svg>
        {TAKE.map((x, i) => {
          const a = ap(t, 2 * (i + 1), 0.5);
          return (
            <div key={i} style={{position: 'absolute', left: 130, top: 120 + i * 100, width: 1100, fontFamily: FONT, fontSize: 32, fontWeight: 600, color: '#1F2937', opacity: a, transform: `translateX(${(1 - a) * 20}px)`, whiteSpace: 'nowrap'}}>
              <b style={{color: TC[i], fontSize: 36}}>{x[0]}{x[1]}</b>{x[2]}
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 130, top: 735, fontFamily: HAND, fontSize: 50, color: '#1F2937', opacity: ap(t, 14.0), transform: `rotate(-2deg) scale(${0.9 + 0.1 * ap(t, 14.0)})`}}>Cảm ơn bạn đã theo dõi! ♥</div>
      </div>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="sum2" x={1330} y={200} s={1.1} prog={dp(t, 0.6, 1.2)} art={1} labels={false} beat={beat} />
      </svg>
    </DeskBg>
  );
};

const SC: React.FC[] = [Cover, GridScene, LayoutScene, RhythmScene, RateScene, AxisScene, AxisTable, PScene, QRSScene, RProg, QTScene, STScene, Practice, Summary];
export const Approach: React.FC = () => (
  <AbsoluteFill style={{background: '#0E1116', fontFamily: FONT}}>
    <Audio src={staticFile('narration.m4a')} />
    <CapCtx.Provider value={false}>
      {data.scenes.map((s, i) => {
        const Comp = SC[i];
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
    <SeriesTag sub="Tiếp cận ban đầu" />
    <StationBar />
    <Caption />
    <Progress />
  </AbsoluteFill>
);
