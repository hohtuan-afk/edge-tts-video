// BÀI 9: NHỊP NHANH QRS RỘNG — NHỊP NHANH THẤT HAY TRÊN THẤT? · RỘNG + NHANH → nghĩ THẤT trước
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import data from '../data.json';
import keys from './wide_keys.json';
import stations from './wide_stations.json';
import {TimeMap, CapCtx, FONT, useT} from '../lib';
import {Caption, Progress} from '../Main';
import {MONO} from './Lab';
import {Fade, SeriesTag} from './Demo';
import {HAND} from '../wb/wb';
import {Heart4C, H4, Dot} from '../wb/heart4c';
import {Memo, Card, Head, DeskBg, ap, PEN, beat, M} from './Bundle';
import {Strip, Frame} from './Infarct';
import {antiB, paf} from './Wpw';

const RD = '#DC2626', BL = '#2563EB', OR = '#F97316', PU = '#8B5CF6', GR = '#22C55E', TE = '#06B6D4';
const gs = (x: number, mu: number, w: number, a: number) => a * Math.exp(-((x - mu) ** 2) / (2 * w * w));
// 1 nhát nhịp nhanh thất: khởi đầu chậm, rất rộng
const vtB = (x: number, k = 1) => k * (gs(x, 0.09, 0.042, 1.1) + gs(x, 0.18, 0.03, -0.35) + gs(x, 0.34, 0.06, -0.5));
const narrowB = (x: number) => gs(x, 0.0, 0.011, 1.0) + gs(x, 0.028, 0.01, -0.25) + gs(x, 0.24, 0.045, 0.3);
const VT_RR = 0.35;
const VT_R = Array.from({length: 26}, (_, i) => 0.05 + i * VT_RR);
const P_T = Array.from({length: 12}, (_, i) => 0.22 + i * 0.78);
const vtTrain = (opt: {p?: boolean; cap?: number; fus?: number; k?: number} = {}) => (T: number) => {
  let v = 0;
  VT_R.forEach((r, i) => {
    const x = T - r;
    if (x < -0.1 || x > 0.5) return;
    if (i === opt.cap) v += narrowB(x - 0.04);
    else if (i === opt.fus) v += 0.5 * vtB(x, opt.k ?? 1) + 0.5 * narrowB(x - 0.02);
    else v += vtB(x, opt.k ?? 1);
  });
  if (opt.p) P_T.forEach((p) => {v += gs(T, p, 0.022, 0.17);});
  return v;
};
// tâm ổ nhịp nhanh thất ở thành thất trái
const FOCUS = [930, 880];
const spread = (ph: number): Dot[] => [0, 1, 2, 3, 4, 5].map((i) => {
  const a = (i / 6) * Math.PI * 2;
  return {pts: [FOCUS, [FOCUS[0] + 170 * Math.cos(a), FOCUS[1] + 150 * Math.sin(a)]], k: ph, c: RD, r: 12};
});

// ===== thanh trạm =====
const ST7 = ['NGUYÊN TẮC', 'DẤU HIỆU CHẮC CHẮN', 'ĐỒNG HƯỚNG', 'HÌNH DẠNG QRS', 'BRUGADA 4 BƯỚC', 'BẪY', 'ÔN TẬP'];
const STC = ['#64748B', '#DC2626', '#8B5CF6', '#2563EB', '#F59E0B', '#06B6D4', '#22C55E'];
const StationBar9: React.FC = () => {
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
const Tag9: React.FC<{x: number; y: number; a: number; c: string; children: React.ReactNode}> = ({x, y, a, c, children}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: FONT, fontSize: 30, fontWeight: 900, color: c, opacity: a}}>{children}</div>
);
const Lbl9: React.FC<{x: number; y: number; a: number; c: string; size?: number; children: React.ReactNode}> = ({x, y, a, c, size = 34, children}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: HAND, fontSize: size, color: c, opacity: a}}>{children}</div>
);
// monitor ICU
const Monitor: React.FC<{x: number; y: number; w: number; h: number; f: (T: number) => number; a: number; hr: string}> = ({x, y, w, h, f, a, hr}) => {
  const rt = useCurrentFrame() / 30;
  const q = 8, pxs = 25 * q, win = (w - 220) / pxs, B = h * 0.55;
  const head = rt % win;
  const pts: string[] = [];
  for (let T = 0; T <= win; T += 0.003) {
    if (Math.abs(T - head) < 0.06) continue;
    const tt = T <= head ? rt - (head - T) : rt - (head - T) - win;
    pts.push(`${(20 + T * pxs).toFixed(1)},${(B - f(((tt % 8) + 8) % 8) * 10 * q).toFixed(1)}`);
  }
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 20, background: '#050B0A', border: '3px solid #1F2937', overflow: 'hidden', opacity: a}}>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
        <text x={20} y={34} fontFamily={MONO} fontSize={22} fill="#4ADE80">II</text>
        <polyline points={pts.join(' ')} fill="none" stroke="#4ADE80" strokeWidth={3.5} strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 6px #22C55E)'}} />
        <text x={w - 30} y={h / 2 + 10} textAnchor="end" fontFamily={MONO} fontSize={72} fontWeight={700} fill="#F87171">{hr}</text>
        <text x={w - 30} y={h / 2 - 50} textAnchor="end" fontFamily={MONO} fontSize={22} fill="#F87171">HR</text>
      </svg>
    </div>
  );
};

// ================= 0 · BÌA =================
const Cover: React.FC = () => {
  const t = useT();
  const rt = useCurrentFrame() / 30;
  const ph = (rt % VT_RR) / VT_RR;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 72% 45%, #3A1418, #0B1218 72%)'}}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart4C id="cv9" x={1200} y={80} s={0.6} a={ap(t, 0)} ring={0.6} cond={0.7} glowL={0.5 + 0.5 * Math.sin(ph * Math.PI)} glowC={RD} dots={spread(ph)} />
      </svg>
      <div style={{position: 'absolute', left: 110, top: 110, fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: 4, color: '#5EEAD4', opacity: ap(t, 0.2)}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 9</div>
      <div style={{position: 'absolute', left: 106, top: 156, width: 1080, fontFamily: FONT, fontSize: 80, fontWeight: 800, lineHeight: 1.06, color: '#F8FAFC', opacity: ap(t, 0.4)}}>
        Nhịp nhanh <span style={{color: '#F87171'}}>QRS rộng</span>
      </div>
      <div style={{position: 'absolute', left: 112, top: 258, fontFamily: FONT, fontSize: 36, fontWeight: 700, color: '#CBD5E1', opacity: ap(t, 0.8)}}>trên điện tâm đồ · <span style={{color: '#FDE047'}}>Nhịp nhanh thất hay trên thất?</span></div>
      <div style={{position: 'absolute', left: 110, top: 340, padding: '14px 30px', borderRadius: 20, border: '4px solid #F87171', background: 'rgba(220,38,38,0.12)', fontFamily: FONT, fontSize: 46, fontWeight: 900, color: '#FECACA', opacity: ap(t, 2), transform: `scale(${0.85 + 0.15 * ap(t, 2)})`, transformOrigin: 'left center'}}>RỘNG + NHANH → nghĩ THẤT trước</div>
      <Monitor x={110} y={480} w={1060} h={300} f={vtTrain()} a={ap(t, 0)} hr="171" />
      <div style={{position: 'absolute', left: 112, top: 820, width: 1060, fontFamily: FONT, fontSize: 20, color: '#94A3B8', opacity: ap(t, 1)}}>Nguồn: 2022 ESC Ventricular Arrhythmias · 2017 AHA/ACC/HRS VA · 2019 ESC SVT · Brugada 1991 · Vereckei 2008 · LITFL</div>
    </AbsoluteFill>
  );
};

// ================= 1 · 3 NGUỒN =================
const Sources: React.FC = () => {
  const t = useT();
  const rt = useCurrentFrame() / 30;
  const ph = (rt % 1.2) / 1.2;
  const items: [string, string, number, React.ReactNode][] = [
    ['① Nhịp nhanh THẤT', 'ổ phát nhịp trong thất', 2, <Heart4C key="a" id="s91" x={10} y={0} s={0.42} ring={0.6} cond={0.7} glowL={0.5 + 0.5 * Math.sin(ph * Math.PI * 2)} glowC={RD} dots={spread(ph)} />],
    ['② Trên thất + block nhánh', 'xung qua nút, một nhánh bị block', 4, <Heart4C key="b" id="s92" x={10} y={0} s={0.42} ring={0.6} cond={1} dots={[{pts: [H4.SA, H4.AV, H4.HIS, ...H4.LB.slice(1)], k: ph}]} />],
    ['③ Trên thất qua đường phụ', 'xung đi tắt (bài 8)', 6, <Heart4C key="c" id="s93" x={10} y={0} s={0.42} ring={0.6} cond={0.7} apL={1} glowL={ph > 0.35 ? 0.8 : 0} dots={[{pts: [H4.SA, [520, 470], [800, 500], H4.APL[1], [1000, 760]], k: ph, c: OR}]} />],
  ];
  return (
    <DeskBg>
      <Head t={t}>Nhịp nhanh QRS rộng: 3 nguồn</Head>
      {items.map(([ti, sub, s, heart], i) => (
        <div key={i} style={{position: 'absolute', left: 60 + i * 610, top: 140, width: 580, height: 760, borderRadius: 20, background: 'rgba(15,23,42,0.75)', border: `3px solid ${[RD, BL, OR][i]}`, opacity: ap(t, s), transform: `translateY(${(1 - ap(t, s)) * 30}px)`, overflow: 'hidden'}}>
          <div style={{padding: '16px 22px', fontFamily: FONT}}><div style={{fontSize: 34, fontWeight: 900, color: ['#FCA5A5', '#93C5FD', '#FDBA74'][i]}}>{ti}</div><div style={{fontSize: 24, fontWeight: 700, color: '#CBD5E1'}}>{sub}</div></div>
          <svg viewBox="0 0 580 560" width={580} height={560} style={{position: 'absolute', left: 0, top: 110}}>
            {heart}
            {i === 1 && <g transform={`translate(${10 + 0.42 * 575} ${0.42 * 900})`}><circle r={18} fill={PEN} stroke="#fff" strokeWidth={3} /><path d="M-7,-7 L7,7 M7,-7 L-7,7" stroke="#fff" strokeWidth={4} strokeLinecap="round" /></g>}
          </svg>
          <div style={{position: 'absolute', left: 20, bottom: 16, width: 540, borderRadius: 12, overflow: 'hidden'}}>
            <Strip L={i === 0 ? vtTrain() : i === 1 ? (T) => beat(M.V1r)(((T % 0.4) + 0.4) % 0.4 - 0.12) : (T) => antiB(((T % 0.36) + 0.36) % 0.36 - 0.05)} w={540} h={120} q={6} base={0.6} t0={0} />
          </div>
        </div>
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: FONT, fontSize: 26, fontWeight: 800, color: '#94A3B8', opacity: ap(t, 0)}}>QRS ≥ 0,12 s + tần số &gt; 100 lần/phút</div>
    </DeskBg>
  );
};

// ================= 2 · AN TOÀN =================
const Safety: React.FC = () => {
  const t = useT();
  const k = ap(t, 0, 1.2) * 0.8;
  const R = 200, cx = 360, cy = 500;
  const a1 = -Math.PI / 2, a2 = a1 + k * 2 * Math.PI;
  const big = k > 0.5 ? 1 : 0;
  return (
    <DeskBg>
      <Head t={t}>Mặc định: nhịp nhanh THẤT</Head>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <circle cx={cx} cy={cy} r={R} fill="#334155" />
        {k > 0.01 && <path d={`M${cx},${cy} L${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)} A${R},${R} 0 ${big} 1 ${cx + R * Math.cos(a2)},${cy + R * Math.sin(a2)} Z`} fill={RD} />}
        <circle cx={cx} cy={cy} r={R * 0.55} fill="#1d272c" />
        <text x={cx} y={cy + 10} textAnchor="middle" fontFamily={FONT} fontSize={86} fontWeight={900} fill="#F87171">{Math.round(k * 100)}%</text>
        <text x={cx} y={cy + 60} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={800} fill="#CBD5E1">nhịp nhanh thất</text>
      </svg>
      <Card x={680} y={180} w={1180} a={ap(t, 0)} c={RD} title="~ 80% nhịp nhanh QRS rộng là nhịp nhanh THẤT" />
      <Card x={680} y={300} w={1180} a={ap(t, 2)} c="#475569" title="Càng chắc hơn khi có bệnh tim cấu trúc · nhồi máu cũ" />
      <div style={{position: 'absolute', left: 680, top: 440, width: 1180, padding: '22px 30px', borderRadius: 18, background: RD, color: '#fff', fontFamily: FONT, fontSize: 44, fontWeight: 900, boxSizing: 'border-box', opacity: ap(t, 4), transform: `scale(${0.92 + 0.08 * ap(t, 4)})`, transformOrigin: 'left center', boxShadow: '0 12px 28px rgba(0,0,0,0.4)'}}>CHƯA CHẮC → coi là nhịp nhanh THẤT</div>
      <div style={{position: 'absolute', left: 680, top: 600, width: 1180, padding: '18px 26px', borderRadius: 16, background: '#FCFAF4', borderLeft: `12px solid ${PEN}`, boxSizing: 'border-box', fontFamily: FONT, fontSize: 32, fontWeight: 800, color: '#7F1D1D', opacity: ap(t, 6)}}>⚠ Không dùng thuốc chẹn kênh canxi khi chưa loại trừ nhịp nhanh thất</div>
    </DeskBg>
  );
};

// ================= 3 · PHÂN LY NHĨ THẤT =================
const AVDiss: React.FC = () => {
  const t = useT();
  const rt = useCurrentFrame() / 30;
  const pa = (rt % 0.78) / 0.78, pv = (rt % VT_RR) / VT_RR;
  return (
    <DeskBg>
      <Head t={t}>Phân ly nhĩ thất</Head>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart4C id="av9" x={10} y={110} s={0.5} ring={0.7} cond={0.6} glowL={0.4 + 0.6 * Math.sin(pv * Math.PI)} glowC={RD} dots={[{pts: [H4.SA, H4.RA, H4.LA], k: pa, c: PU, r: 18}, ...spread(pv)]} />
      </svg>
      <div style={{position: 'absolute', left: 80, top: 760, fontFamily: FONT, fontSize: 26, fontWeight: 900, opacity: ap(t, 0.4)}}><span style={{color: '#C4B5FD'}}>NHĨ ~ 77/phút</span> <span style={{color: '#94A3B8'}}> · </span><span style={{color: '#FCA5A5'}}>THẤT ~ 171/phút</span></div>
      <Frame x={680} y={140} a={ap(t, 0)} c={PU}>
        <Strip L={vtTrain({p: true})} w={1180} h={360} q={11} base={0.55} t0={0} label="II" stroke={3.5}>
          {(X, Y) => <g opacity={ap(t, 2)}>{P_T.slice(0, 6).map((p) => <g key={p}><circle cx={X(p)} cy={Y(0.17) - 26} r={14} fill={PU} /><line x1={X(p)} x2={X(p)} y1={Y(0.17) - 12} y2={330} stroke={PU} strokeWidth={2} strokeDasharray="6 6" /></g>)}</g>}
        </Strip>
      </Frame>
      <Card x={680} y={540} w={1180} a={ap(t, 2)} c={PU} title="Nhĩ và thất đập ĐỘC LẬP · P đi đường P, QRS đi đường QRS (bài 3)" />
      <Card x={680} y={650} w={1180} a={ap(t, 4)} c={RD} title="Thất NHANH hơn nhĩ → nhịp nhanh thất" />
      <Lbl9 x={690} y={770} a={ap(t, 6)} c="#C4B5FD">Khó thấy P → tìm “bướu” lạ trên QRS, ST, T</Lbl9>
      <Memo x={680} y={830} w={1180} a={ap(t, 8)}>Chỉ thấy ở ~ 3/4 ca → KHÔNG thấy cũng <span style={{color: PEN}}>CHƯA loại trừ</span></Memo>
    </DeskBg>
  );
};

// ================= 4 · BẮT ĐƯỢC · HỖN HỢP =================
const CapFus: React.FC = () => {
  const t = useT();
  const f = vtTrain({cap: 4, fus: 9});
  return (
    <DeskBg>
      <Head t={t}>Nhát bắt được · nhát hỗn hợp</Head>
      <Frame x={60} y={140} a={ap(t, -1)}>
        <Strip L={f} w={1800} h={420} q={12} base={0.55} t0={0} label="II" stroke={4}>
          {(X, Y) => (
            <g>
              <g opacity={ap(t, 0.3)}><circle cx={X(VT_R[4] + 0.04)} cy={Y(0.4)} r={56} fill="none" stroke={GR} strokeWidth={6} /><text x={X(VT_R[4] + 0.04)} y={Y(1.0) - 30} textAnchor="middle" fontFamily={HAND} fontSize={40} fill={GR}>bắt được</text></g>
              <g opacity={ap(t, 2)}><circle cx={X(VT_R[9] + 0.06)} cy={Y(0.4)} r={56} fill="none" stroke={OR} strokeWidth={6} /><text x={X(VT_R[9] + 0.06)} y={Y(1.0) - 30} textAnchor="middle" fontFamily={HAND} fontSize={40} fill={OR}>hỗn hợp</text></g>
            </g>
          )}
        </Strip>
      </Frame>
      <Card x={60} y={600} w={880} a={ap(t, 0)} c={GR} title="BẮT ĐƯỢC: xung xoang “lọt” xuống thất">→ 1 nhát QRS HẸP chen giữa</Card>
      <Card x={980} y={600} w={880} a={ap(t, 2)} c={OR} title="HỖN HỢP: xung xoang + xung thất gặp nhau">→ QRS lai, hình dạng trung gian</Card>
      <div style={{position: 'absolute', left: 60, top: 790, width: 1800, padding: '20px 28px', borderRadius: 18, background: RD, color: '#fff', fontFamily: FONT, fontSize: 38, fontWeight: 900, boxSizing: 'border-box', textAlign: 'center', opacity: ap(t, 4)}}>Phân ly · bắt được · hỗn hợp → KHẲNG ĐỊNH nhịp nhanh thất</div>
    </DeskBg>
  );
};

// ================= 5 · ĐỒNG HƯỚNG =================
const Concord: React.FC = () => {
  const t = useT();
  const neg = (x: number) => -1.3 * gs(x, 0.09, 0.045, 1) + gs(x, 0.33, 0.06, 0.45);
  const pos = (x: number) => vtB(x) * 1.35;
  const sw = ap(t, 4, 0.5);
  const leads = ['V1', 'V2', 'V3', 'V4', 'V5', 'V6'];
  return (
    <DeskBg>
      <Head t={t}>Đồng hướng ở các chuyển đạo trước tim</Head>
      <Tag9 x={60} y={130} a={1 - sw} c="#93C5FD">ĐỒNG HƯỚNG ÂM ↓</Tag9>
      <Tag9 x={60} y={130} a={sw} c="#FCA5A5">ĐỒNG HƯỚNG DƯƠNG ↑</Tag9>
      {leads.map((ld, i) => (
        <div key={ld} style={{position: 'absolute', left: 60 + i * 300, top: 180, opacity: ap(t, 2 + i * 0.1)}}>
          <div style={{borderRadius: 12, overflow: 'hidden', outline: `4px solid ${sw > 0.5 ? RD : BL}`}}>
            <Strip L={(T) => {const x = ((T % VT_RR) + VT_RR) % VT_RR - 0.05; return sw > 0.5 ? pos(x) * (0.7 + i * 0.06) : neg(x) * (0.7 + i * 0.06);}} w={280} h={330} q={9} base={sw > 0.5 ? 0.68 : 0.3} t0={0} label={ld} stroke={3.5} />
          </div>
        </div>
      ))}
      <Card x={60} y={560} w={1800} a={ap(t, 0)} c={PU} title="V1 → V6 CÙNG dương hoặc CÙNG âm" />
      <Card x={60} y={670} w={880} a={ap(t, 4)} c={BL} title="Âm → gần như chắc chắn nhịp nhanh thất" />
      <Card x={980} y={670} w={880} a={ap(t, 6)} c={RD} title="Dương → nhịp nhanh thất">hoặc (hiếm) qua đường phụ bên trái</Card>
    </DeskBg>
  );
};

// ================= 6 · HÌNH DẠNG QRS =================
const Morph: React.FC = () => {
  const t = useT();
  const k = ap(t, 6, 1);
  const cx = 1650, cy = 700, R = 150;
  const pt = (d: number, rr = R) => [cx + rr * Math.cos((d * Math.PI) / 180), cy + rr * Math.sin((d * Math.PI) / 180)];
  const [x0, y0] = pt(-90), [x1, y1] = pt(-180);
  return (
    <DeskBg>
      <Head t={t}>Hình dạng QRS — giống block nhánh điển hình?</Head>
      <Tag9 x={60} y={130} a={ap(t, 2)} c="#93C5FD">Block nhánh phải điển hình</Tag9>
      <Frame x={60} y={180} a={ap(t, 2)} c={BL}>
        <Strip L={(x) => beat(M.V1r)(x)} w={680} h={360} q={20} base={0.6} t0={-0.15} label="V1" stroke={5}>
          {(X, Y) => <g opacity={ap(t, 2.4)}><line x1={X(0)} y1={Y(0)} x2={X(0.015)} y2={Y(0.25)} stroke={GR} strokeWidth={10} strokeLinecap="round" /><text x={X(0.12)} y={Y(0.7)} fontFamily={HAND} fontSize={34} fill={GR}>← khởi đầu NHANH</text></g>}
        </Strip>
      </Frame>
      <Tag9 x={780} y={130} a={ap(t, 4)} c="#FCA5A5">Nhịp nhanh thất</Tag9>
      <Frame x={780} y={180} a={ap(t, 4)} c={RD}>
        <Strip L={(x) => vtB(x)} w={600} h={360} q={20} base={0.66} t0={-0.15} label="V1" stroke={5}>
          {(X, Y) => <g opacity={ap(t, 4.4)}><path d={`M${X(0.0)},${Y(0) + 40} v14 H${X(0.2)} v-14`} fill="none" stroke={RD} strokeWidth={5} /><text x={X(0.1)} y={Y(0) + 92} textAnchor="middle" fontFamily={MONO} fontSize={28} fontWeight={700} fill={RD}>&gt; 0,14–0,16 s</text><text x={X(0.2)} y={Y(0.9)} fontFamily={HAND} fontSize={34} fill={RD}>khởi đầu CHẬM</text></g>}
        </Strip>
      </Frame>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: ap(t, 6)}}>
        <circle cx={cx} cy={cy} r={R + 40} fill="#FCFAF4" />
        <path d={`M${cx},${cy} L${x0},${y0} A${R},${R} 0 0 0 ${x1},${y1} Z`} fill={RD} opacity={0.4 * k} />
        {[[0, '0°'], [90, '+90°'], [-90, '−90°'], [180, '±180°']].map(([d, s]) => {const [tx, ty] = pt(d as number, R + 22); return <text key={s as string} x={tx} y={ty + 8} textAnchor="middle" fontFamily={FONT} fontSize={20} fontWeight={800} fill="#334155">{s as string}</text>;})}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#94A3B8" strokeWidth={3} />
        <text x={cx - 70} y={cy - 60} textAnchor="middle" fontFamily={FONT} fontSize={22} fontWeight={900} fill={RD} opacity={k}>vô định</text>
      </svg>
      <Card x={60} y={580} w={1280} a={ap(t, 2)} c={BL} title="Block nhánh: khởi đầu QRS dốc, gọn (vẫn qua bó His)" />
      <Card x={60} y={690} w={1280} a={ap(t, 4)} c={RD} title="Nhịp nhanh thất: khởi đầu CHẬM · QRS rất rộng · hình dạng “lạ”" />
      <Card x={60} y={800} w={1280} a={ap(t, 6)} c={RD} title="Trục vô định (−90° → ±180°) → nghĩ nhịp nhanh thất" />
    </DeskBg>
  );
};

// ================= phần 2 =================
const rsB = (x: number) => gs(x, 0.04, 0.025, 0.55) + gs(x, 0.15, 0.035, -1.05) + gs(x, 0.36, 0.06, 0.35);
const Brugada: React.FC = () => {
  const t = useT();
  const steps: [string, number][] = [['KHÔNG có dạng RS ở mọi chuyển đạo trước tim?', 2], ['Đầu R → đáy S > 100 ms ở bất kỳ V nào?', 4], ['Phân ly · bắt được · hỗn hợp?', 6], ['V1, V6 KHÔNG giống block nhánh điển hình?', 8]];
  const cur = Math.max(0, Math.min(3, Math.floor((t - 2) / 2)));
  return (
    <DeskBg>
      <Head t={t}>Brugada — 4 bước, 1 “CÓ” → nhịp nhanh thất</Head>
      {steps.map(([s, st], i) => {
        const a = ap(t, st);
        const on = i === cur && t >= 2;
        return (
          <div key={i} style={{position: 'absolute', left: 60 + i * 40, top: 140 + i * 130, width: 940, height: 110, display: 'flex', alignItems: 'center', gap: 20, padding: '0 22px', borderRadius: 18, background: on ? '#FFF7ED' : '#FCFAF4', border: `4px solid ${on ? '#F59E0B' : 'transparent'}`, boxSizing: 'border-box', opacity: a, transform: `translateX(${(1 - a) * 40}px)`, fontFamily: FONT, boxShadow: '0 12px 26px rgba(0,0,0,0.35)'}}>
            <span style={{flex: 'none', width: 60, height: 60, borderRadius: 30, background: '#F59E0B', color: '#fff', fontSize: 34, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</span>
            <span style={{fontSize: 31, fontWeight: 800, color: '#1F2937', flex: 1}}>{s}</span>
            <span style={{flex: 'none', padding: '6px 14px', borderRadius: 12, background: RD, color: '#fff', fontSize: 24, fontWeight: 900}}>CÓ → VT</span>
          </div>
        );
      })}
      <Frame x={1140} y={140} a={ap(t, 4)} c="#F59E0B">
        <Strip L={(x) => rsB(x)} w={720} h={500} q={24} base={0.5} t0={-0.12} label="V4" stroke={6}>
          {(X, Y) => <g opacity={ap(t, 4.4)}>
            <line x1={X(0)} x2={X(0)} y1={Y(0) - 160} y2={Y(-1.05) + 10} stroke={BL} strokeWidth={3} strokeDasharray="8 6" />
            <line x1={X(0.15)} x2={X(0.15)} y1={Y(0) - 160} y2={Y(-1.05)} stroke={BL} strokeWidth={3} strokeDasharray="8 6" />
            <path d={`M${X(0)},${Y(0) - 150} H${X(0.15)}`} stroke={RD} strokeWidth={6} markerEnd="" />
            <text x={X(0.075)} y={Y(0) - 170} textAnchor="middle" fontFamily={MONO} fontSize={32} fontWeight={700} fill={RD}>150 ms &gt; 100</text>
            <text x={X(0) - 8} y={Y(0) + 40} textAnchor="end" fontFamily={HAND} fontSize={30} fill={BL}>đầu R</text>
            <text x={X(0.15) + 14} y={Y(-1.05) + 10} fontFamily={HAND} fontSize={30} fill={BL}>đáy S</text>
          </g>}
        </Strip>
      </Frame>
      <Lbl9 x={1150} y={655} a={ap(t, 4.4)} c="#FCD34D">100 ms ≈ 2,5 ô nhỏ</Lbl9>
      <div style={{position: 'absolute', left: 60, top: 700, width: 1800, padding: '18px 26px', borderRadius: 16, background: '#FCFAF4', borderLeft: `12px solid ${BL}`, boxSizing: 'border-box', fontFamily: FONT, opacity: ap(t, 10)}}>
        <span style={{fontSize: 30, fontWeight: 900, color: BL}}>Cả 4 “KHÔNG”</span><span style={{fontSize: 30, fontWeight: 700, color: '#1F2937'}}> → nghĩ trên thất dẫn truyền lệch hướng</span>
        <span style={{fontSize: 26, fontWeight: 700, color: '#64748B'}}> · Cách khác: thuật toán chỉ dùng aVR (Vereckei)</span>
      </div>
    </DeskBg>
  );
};
const Traps: React.FC = () => {
  const t = useT();
  const hk = (x: number) => gs(x, 0.06, 0.04, 0.75) + gs(x, 0.15, 0.03, -0.3) + gs(x, 0.32, 0.03, 1.0) + gs(x, -0.12, 0.02, 0.04);
  const pace = (x: number) => gs(x, -0.008, 0.0016, 2.2) + vtB(x + 0.01);
  const bb = (x: number) => beat(M.V1r)(x);
  const cyc = (f: (x: number) => number, rr: number, o = 0.08) => (T: number) => f(((T % rr) + rr) % rr - o);
  const cell = (i: number, title: string, c: string, s: number, node: React.ReactNode, sub: string) => (
    <div key={i} style={{position: 'absolute', left: 60 + (i % 2) * 910, top: 130 + Math.floor(i / 2) * 400, width: 890, opacity: ap(t, s), transform: `translateY(${(1 - ap(t, s)) * 20}px)`}}>
      <div style={{fontFamily: FONT, fontSize: 30, fontWeight: 900, color: c, marginBottom: 8}}>{title}</div>
      <div style={{borderRadius: 12, overflow: 'hidden', outline: `4px solid ${c}`}}>{node}</div>
      <div style={{fontFamily: FONT, fontSize: 24, fontWeight: 700, color: '#CBD5E1', marginTop: 8}}>{sub}</div>
    </div>
  );
  return (
    <DeskBg>
      <Head t={t}>Những cái bẫy</Head>
      {cell(0, '① Block nhánh SẴN CÓ', BL, 2, <div style={{display: 'flex'}}><Strip L={cyc(bb, 0.8, 0.15)} w={440} h={240} q={9} base={0.6} t0={0} label="ECG cũ" /><Strip L={cyc(bb, 0.375, 0.1)} w={450} h={240} q={9} base={0.6} t0={0} label="cơn nhanh" /></div>, 'cùng hình dạng → nghĩ trên thất')}
      {cell(1, '② Qua đường phụ', OR, 4, <Strip L={paf} w={890} h={240} q={9} base={0.55} t0={0} label="II" />, 'ngược chiều · rung nhĩ có tiền kích thích')}
      {cell(2, '③ Tăng kali · thuốc chẹn kênh natri', PU, 6, <Strip L={cyc(hk, 0.5)} w={890} h={240} q={9} base={0.62} t0={0} label="II" />, 'QRS rộng + T nhọn · thuốc chống trầm cảm ba vòng')}
      {cell(3, '④ Nhịp máy tạo nhịp', TE, 8, <Strip L={cyc(pace, 0.6, 0.1)} w={890} h={240} q={9} base={0.6} t0={0} label="II" />, 'tìm GAI tạo nhịp ngay trước QRS')}
    </DeskBg>
  );
};
const Review9: React.FC = () => {
  const t = useT();
  const box = (x: number, y: number, w: number, c: string, a: number, title: string, rows: string[]) => (
    <div style={{position: 'absolute', left: x, top: y, width: w, padding: '16px 22px', borderRadius: 18, background: '#FCFAF4', borderTop: `10px solid ${c}`, boxSizing: 'border-box', fontFamily: FONT, opacity: a, transform: `translateY(${(1 - a) * 20}px)`, boxShadow: '0 14px 30px rgba(0,0,0,0.35)'}}>
      <div style={{fontSize: 32, fontWeight: 900, color: c}}>{title}</div>
      {rows.map((r) => <div key={r} style={{fontSize: 27, fontWeight: 700, color: '#1F2937', marginTop: 8}}>• {r}</div>)}
    </div>
  );
  return (
    <DeskBg>
      <Head t={t}>Sơ đồ tiếp cận</Head>
      <div style={{position: 'absolute', left: 560, top: 120, padding: '14px 40px', borderRadius: 20, background: RD, color: '#fff', fontFamily: FONT, fontSize: 40, fontWeight: 900, opacity: ap(t, 2)}}>RỘNG + NHANH → mặc định nhịp nhanh THẤT</div>
      {box(60, 260, 880, RD, ap(t, 4), 'Tìm dấu hiệu khẳng định', ['phân ly nhĩ thất', 'nhát bắt được · nhát hỗn hợp', 'đồng hướng V1 – V6', '→ NHỊP NHANH THẤT'])}
      {box(980, 260, 880, '#F59E0B', ap(t, 6), 'Không có → Brugada 4 bước', ['1 “CÓ” → nhịp nhanh thất', '4 “KHÔNG” → trên thất lệch hướng'])}
      {box(980, 560, 880, TE, ap(t, 6.4), 'Loại trừ bẫy', ['block nhánh cũ · đường phụ', 'tăng kali · thuốc · máy tạo nhịp'])}
    </DeskBg>
  );
};
const Chk9: React.FC<{y: number; a: number; c: string; k: string; children: React.ReactNode}> = ({y, a, c, k, children}) => (
  <div style={{position: 'absolute', left: 1300, top: y, width: 560, display: 'flex', gap: 14, alignItems: 'flex-start', fontFamily: FONT, opacity: a, transform: `translateX(${(1 - a) * 30}px)`}}>
    <span style={{flex: 'none', padding: '4px 12px', borderRadius: 10, background: c, color: '#fff', fontSize: 22, fontWeight: 900, marginTop: 4}}>{k}</span>
    <span style={{fontSize: 28, fontWeight: 700, color: '#F1F5F9', lineHeight: 1.3}}>{children}</span>
  </div>
);
const Practice9: React.FC = () => {
  const t = useT();
  const sw = ap(t, 6, 0.35);
  const o1 = Math.max(0, 1 - sw * 2), o2 = Math.max(0, sw * 2 - 1);
  const rb = (T: number) => beat(M.V1r)(((T % 0.375) + 0.375) % 0.375 - 0.1);
  const rbOld = (T: number) => beat(M.V1r)(((T % 0.8) + 0.8) % 0.8 - 0.15);
  return (
    <DeskBg>
      <Head t={t}>Thực hành: đọc 2 ECG</Head>
      <div style={{opacity: o1}}>
        <Tag9 x={60} y={128} a={1} c="#FDE047">ECG 1</Tag9>
        <Frame x={60} y={175} a={ap(t, 2)} c={RD}><Strip L={vtTrain({p: true, cap: 7})} w={1200} h={420} q={12} base={0.55} t0={0} label="II" stroke={4}>
          {(X, Y) => <g>{<g opacity={ap(t, 2.6)}>{P_T.slice(0, 4).map((p) => <circle key={p} cx={X(p)} cy={Y(0.17) - 26} r={13} fill={PU} />)}</g>}<g opacity={ap(t, 3)}><circle cx={X(VT_R[7] + 0.04)} cy={Y(0.4)} r={54} fill="none" stroke={GR} strokeWidth={6} /></g></g>}
        </Strip></Frame>
        <Chk9 y={180} a={ap(t, 2.4)} c={RD} k="QRS">0,18 s · đều · 170/phút</Chk9>
        <Chk9 y={270} a={ap(t, 2.6)} c={PU} k="P">P độc lập (phân ly)</Chk9>
        <Chk9 y={350} a={ap(t, 3)} c={GR} k="+">1 nhát QRS hẹp (bắt được)</Chk9>
        <Chk9 y={440} a={ap(t, 4)} c={RD} k="KẾT LUẬN">Nhịp nhanh thất ✓</Chk9>
      </div>
      <div style={{opacity: o2}}>
        <Tag9 x={60} y={128} a={1} c="#FDE047">ECG 2</Tag9>
        <Frame x={60} y={175} a={sw} c={BL}><Strip L={rb} w={1200} h={330} q={12} base={0.6} t0={0} label="V1 · cơn nhanh" stroke={4} /></Frame>
        <Frame x={60} y={540} a={sw}><Strip L={rbOld} w={1200} h={280} q={12} base={0.6} t0={0} label="V1 · ECG cũ" stroke={4} /></Frame>
        <Chk9 y={180} a={ap(t, 6.4)} c={BL} k="QRS">0,13 s · đều · 160/phút</Chk9>
        <Chk9 y={270} a={ap(t, 6.8)} c={BL} k="V1">rsR′ điển hình</Chk9>
        <Chk9 y={350} a={ap(t, 7.2)} c={TE} k="CŨ">Block nhánh phải giống hệt</Chk9>
        <Chk9 y={440} a={ap(t, 8)} c={GR} k="KẾT LUẬN">Trên thất + block nhánh phải sẵn có ✓</Chk9>
      </div>
    </DeskBg>
  );
};
const Takeaways9: React.FC = () => {
  const t = useT();
  const items: [React.ReactNode, string][] = [
    [<><b>RỘNG + NHANH → nghĩ THẤT trước</b> (~80%) · chưa chắc → coi là nhịp nhanh thất</>, RD],
    [<>Phân ly · bắt được · hỗn hợp → <b>KHẲNG ĐỊNH</b> nhịp nhanh thất</>, PU],
    [<><b>Đồng hướng</b> V1 – V6 → nghĩ nhịp nhanh thất</>, BL],
    [<>Brugada: 1 <b>“CÓ”</b> trong 4 bước → nhịp nhanh thất</>, '#F59E0B'],
    [<>Bẫy: <b>block nhánh cũ · đường phụ · kali · thuốc · máy tạo nhịp</b></>, TE],
  ];
  return (
    <DeskBg>
      <Head t={t}>5 điều cần nhớ</Head>
      {items.map(([s, c], i) => {
        const a = ap(t, 2 + i * 2);
        return (
          <div key={i} style={{position: 'absolute', left: 100, top: 140 + i * 128, width: 1720, height: 108, display: 'flex', alignItems: 'center', gap: 24, padding: '0 26px', borderRadius: 18, background: '#FCFAF4', borderLeft: `14px solid ${c}`, boxSizing: 'border-box', opacity: a, transform: `translateX(${(1 - a) * 50}px)`, boxShadow: '0 12px 26px rgba(0,0,0,0.35)', fontFamily: FONT}}>
            <span style={{flex: 'none', width: 60, height: 60, borderRadius: 30, background: c, color: '#fff', fontSize: 34, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</span>
            <span style={{fontSize: 32, fontWeight: 700, color: '#1F2937'}}>{s}</span>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#5EEAD4', opacity: ap(t, 12)}}>Cảm ơn bạn đã theo dõi!</div>
    </DeskBg>
  );
};

const SCN: React.FC[] = [Cover, Sources, Safety, AVDiss, CapFus, Concord, Morph, Brugada, Traps, Review9, Practice9, Takeaways9];
export const WIDE_N = 7;
export const Wide: React.FC = () => (
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
    <SeriesTag sub="Nhịp nhanh QRS rộng · Nhịp nhanh thất hay trên thất?" />
    <StationBar9 />
    <Caption />
    <Progress />
  </AbsoluteFill>
);
export {vtB, narrowB, vtTrain, VT_R, VT_RR, spread, Monitor, Tag9, Lbl9, gs};
void TE;
