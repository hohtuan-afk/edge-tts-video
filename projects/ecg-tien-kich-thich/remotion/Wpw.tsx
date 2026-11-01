// BÀI 8: TIỀN KÍCH THÍCH THẤT (WOLFF-PARKINSON-WHITE) TRÊN ĐIỆN TÂM ĐỒ · PR NGẮN – DELTA – QRS RỘNG
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import data from '../data.json';
import keys from './wpw_keys.json';
import stations from './wpw_stations.json';
import {TimeMap, CapCtx, FONT, useT} from '../lib';
import {Caption, Progress} from '../Main';
import {MONO} from './Lab';
import {Fade, SeriesTag} from './Demo';
import {HAND} from '../wb/wb';
import {Heart4C, H4, Dot} from '../wb/heart4c';
import {beatV} from './ecg';
import {Memo, Card, Head, DeskBg, ap, PEN} from './Bundle';
import {Strip, Frame} from './Infarct';

const OR = '#F97316', YL = '#FDE047', CB = '#2563EB', CR = '#DC2626', CP = '#8B5CF6', GR = '#22C55E';
const gs = (x: number, mu: number, w: number, a: number) => a * Math.exp(-((x - mu) ** 2) / (2 * w * w));
const sm = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
type W = {d?: number; r?: number; s?: number; tw?: number; p?: number};
// 1 nhát tiền kích thích, t = 0 tại khởi đầu QRS (PR 0,09 s)
const wpwB = (t: number, o: W = {}) => {
  const {d = 0.35, r = 1.1, s = -0.25, tw = -0.28, p = 0.13} = o;
  return gs(t, -0.055, 0.02, p) + d * sm(t / 0.05) * (1 - sm((t - 0.085) / 0.03)) + gs(t, 0.075, 0.014, r - d * 0.4) + gs(t, 0.105, 0.012, s) + gs(t, 0.32, 0.05, tw);
};
// 1 nhát bình thường, t = 0 tại khởi đầu QRS (PR 0,16 s)
const normB = (t: number) => beatV(t - 0.03, {p: 0, q: -0.06, r: 1.1, s: -0.25, t: 0.3, tw: 0.05, tPos: 0.27}) + gs(t, -0.13, 0.022, 0.13);
const train = (f: (t: number) => number, rr = 0.85, off = 0.2) => (T: number) => {const x = ((((T - off) % rr) + rr) % rr); return f(x > rr - 0.25 ? x - rr : x);};

// ===== cuộc đua xung: đường bình thường qua nút vs đường phụ =====
const ATR_L: number[][] = [H4.SA, [520, 470], [800, 500], H4.APL[1], [1000, 760]];
const ATR_R: number[][] = [H4.SA, [280, 470], H4.APR[1], [262, 760]];
const race = (ph: number, side: 'L' | 'R' = 'L'): {dots: Dot[]; glow: number} => {
  const ap2 = side === 'L' ? ATR_L : ATR_R;
  return {
    dots: [
      {pts: [H4.SA, H4.AV], k: ph / 0.25},
      {pts: ap2, k: ph / 0.38, c: OR},
      {pts: [H4.AV, ...H4.RB], k: (ph - 0.5) / 0.32},
      {pts: [H4.AV, ...H4.LB], k: (ph - 0.5) / 0.32},
    ],
    glow: sm((ph - 0.3) / 0.1) * (1 - sm((ph - 0.85) / 0.1)),
  };
};

// ===== thanh trạm =====
const ST7 = ['ĐƯỜNG PHỤ', 'DẤU HIỆU', 'DẠNG HAY HỘI CHỨNG', 'ĐỊNH VỊ SƠ BỘ', 'NHỊP NHANH QUA ĐƯỜNG PHỤ', 'RUNG NHĨ TIỀN KÍCH THÍCH', 'ÔN TẬP'];
const STC = ['#F97316', '#DC2626', '#8B5CF6', '#2563EB', '#06B6D4', '#B91C1C', '#22C55E'];
const StationBar8: React.FC = () => {
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
const Tag8: React.FC<{x: number; y: number; a: number; c: string; children: React.ReactNode}> = ({x, y, a, c, children}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: FONT, fontSize: 30, fontWeight: 900, color: c, opacity: a}}>{children}</div>
);
const Lbl8: React.FC<{x: number; y: number; a: number; c: string; size?: number; children: React.ReactNode}> = ({x, y, a, c, size = 34, children}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: HAND, fontSize: size, color: c, opacity: a}}>{children}</div>
);
const Chips: React.FC<{x: number; y: number; a: number; size?: number}> = ({x, y, a, size = 40}) => (
  <div style={{position: 'absolute', left: x, top: y, display: 'flex', gap: 16, opacity: a}}>
    {[['PR NGẮN', CB], ['DELTA', OR], ['QRS RỘNG', CR]].map(([s, c]) => <div key={s} style={{padding: '10px 24px', borderRadius: 18, border: `3px solid ${c}`, background: 'rgba(255,255,255,0.06)', fontFamily: FONT, fontSize: size, fontWeight: 900, color: c}}>{s}</div>)}
  </div>
);
// tô màu cam phần delta trên 1 nhát
const DeltaHi: React.FC<{X: (t: number) => number; Y: (v: number) => number; f: (t: number) => number; t0: number; a: number; w?: number}> = ({X, Y, f, t0, a, w = 9}) => {
  const pts: string[] = [];
  for (let t = t0; t <= t0 + 0.05; t += 0.002) pts.push(`${X(t).toFixed(1)},${Y(f(t)).toFixed(1)}`);
  return <polyline points={pts.join(' ')} fill="none" stroke={OR} strokeWidth={w} strokeLinecap="round" opacity={a} />;
};

// ================= 0 · BÌA =================
const Cover: React.FC = () => {
  const t = useT();
  const rt = useCurrentFrame() / 30;
  const {dots, glow} = race((rt % 1.8) / 1.8);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 72% 45%, #3A2410, #0B1218 72%)'}}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart4C id="cv8" x={1120} y={70} s={0.74} a={ap(t, 0)} ring={ap(t, 0.6)} cond={ap(t, 0.8)} apL={ap(t, 1.2)} dots={t > 1 ? dots : []} glowL={glow} />
      </svg>
      <div style={{position: 'absolute', left: 110, top: 120, fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: 4, color: '#5EEAD4', opacity: ap(t, 0.2)}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 8</div>
      <div style={{position: 'absolute', left: 106, top: 166, width: 1000, fontFamily: FONT, fontSize: 80, fontWeight: 800, lineHeight: 1.06, color: '#F8FAFC', opacity: ap(t, 0.4)}}>
        Tiền kích thích thất<br /><span style={{color: '#FB923C', fontSize: 58}}>(Wolff-Parkinson-White)</span>
      </div>
      <div style={{position: 'absolute', left: 112, top: 340, fontFamily: FONT, fontSize: 34, fontWeight: 700, color: '#CBD5E1', opacity: ap(t, 0.8)}}>trên điện tâm đồ</div>
      <Chips x={110} y={420} a={ap(t, 2)} />
      <Frame x={110} y={540} a={ap(t, 4)}>
        <Strip L={train((x) => wpwB(x))} w={900} h={230} q={10} base={0.62} t0={(rt * 0.9) % 0.85} label="II" />
      </Frame>
      <div style={{position: 'absolute', left: 112, top: 820, width: 980, fontFamily: FONT, fontSize: 20, color: '#94A3B8', opacity: ap(t, 1)}}>Nguồn: 2019 ESC SVT Guidelines · 2015 ACC/AHA/HRS SVT · 2012 PACES/HRS (WPW không triệu chứng) · ACC 2022 · LITFL</div>
    </AbsoluteFill>
  );
};

// ================= 1 · ĐƯỜNG PHỤ =================
const Pathway: React.FC = () => {
  const t = useT();
  const rt = useCurrentFrame() / 30;
  const {dots, glow} = race((rt % 2.0) / 2.0);
  return (
    <DeskBg>
      <Head t={t}>Đường phụ — “cửa thứ 2” qua vòng xơ</Head>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart4C id="pw8" x={20} y={110} s={0.72} ring={ap(t, 0)} cond={ap(t, 0.3)} apL={ap(t, 0.6)} labels={ap(t, 0.8)} dots={t > 2 ? dots : []} glowL={t > 4 ? glow : 0} />
      </svg>
      <Card x={1000} y={140} w={860} a={ap(t, 0)} c={OR} title="Đường phụ: bó cơ nối thẳng NHĨ → THẤT">đi vòng qua nút nhĩ thất</Card>
      <div style={{position: 'absolute', left: 1000, top: 310, width: 860, display: 'flex', gap: 16, opacity: ap(t, 2)}}>
        <div style={{flex: 1, padding: '16px 20px', borderRadius: 16, background: '#FCFAF4', borderLeft: `10px solid ${YL}`, fontFamily: FONT}}><div style={{fontSize: 26, fontWeight: 800, color: '#A16207'}}>Nút nhĩ thất</div><div style={{fontSize: 38, fontWeight: 900, color: '#1F2937'}}>CHẬM 🐢</div></div>
        <div style={{flex: 1, padding: '16px 20px', borderRadius: 16, background: '#FCFAF4', borderLeft: `10px solid ${OR}`, fontFamily: FONT}}><div style={{fontSize: 26, fontWeight: 800, color: '#C2410C'}}>Đường phụ</div><div style={{fontSize: 38, fontWeight: 900, color: '#1F2937'}}>NHANH ⚡</div></div>
      </div>
      <Card x={1000} y={470} w={860} a={ap(t, 4)} c={OR} title="Một phần thất bị kích thích TRƯỚC = tiền kích thích" />
      <Frame x={1000} y={590} a={ap(t, 6)}>
        <Strip L={(x) => wpwB(x)} w={860} h={300} q={11} base={0.72} t0={-0.75} label="QRS hợp nhất" stroke={5}>
          {(X, Y) => <g><DeltaHi X={X} Y={Y} f={(x) => wpwB(x)} t0={0} a={ap(t, 6.3)} /><text x={X(-0.02)} y={Y(0) + 50} textAnchor="end" fontFamily={HAND} fontSize={30} fill={OR} opacity={ap(t, 6.5)}>qua đường phụ ↗</text><text x={X(0.12)} y={Y(0.6)} fontFamily={HAND} fontSize={30} fill={CB} opacity={ap(t, 6.8)}>← qua đường bình thường</text></g>}
        </Strip>
      </Frame>
    </DeskBg>
  );
};

// ================= 2 · DẤU HIỆU =================
const Signs: React.FC = () => {
  const t = useT();
  const f = (x: number) => wpwB(x);
  return (
    <DeskBg>
      <Head t={t}>Dấu hiệu khi nhịp xoang</Head>
      <Chips x={560} y={58} a={ap(t, -1)} size={26} />
      <Frame x={60} y={140} a={ap(t, 0)}>
        <Strip L={f} w={1180} h={640} q={24} base={0.62} t0={-0.55} label="II" stroke={6}>
          {(X, Y) => (
            <g>
              <polyline points={Array.from({length: 360}, (_, i) => -0.55 + i * 0.0025).map((x) => `${X(x)},${Y(normB(x + 0.07))}`).join(' ')} fill="none" stroke="#94A3B8" strokeWidth={4} strokeDasharray="8 8" opacity={ap(t, 2) * 0.8} />
              <g opacity={ap(t, 2)}>
                <path d={`M${X(-0.09)},${Y(0) + 150} v18 H${X(0)} v-18`} fill="none" stroke={CB} strokeWidth={6} />
                <text x={X(-0.1)} y={Y(0) + 210} textAnchor="middle" fontFamily={MONO} fontSize={32} fontWeight={700} fill={CB}>PR 0,09 s</text>
              </g>
              <DeltaHi X={X} Y={Y} f={f} t0={0} a={ap(t, 4)} w={12} />
              <text x={X(0.0) - 20} y={Y(0.3) - 50} textAnchor="end" fontFamily={HAND} fontSize={44} fill={OR} opacity={ap(t, 4.3)}>sóng delta</text>
              <g opacity={ap(t, 6)}>
                <path d={`M${X(0)},${Y(0) + 150} v18 H${X(0.13)} v-18`} fill="none" stroke={CR} strokeWidth={6} />
                <text x={X(0.18)} y={Y(0) + 210} textAnchor="start" fontFamily={MONO} fontSize={32} fontWeight={700} fill={CR}>QRS 0,13 s</text>
                <text x={X(0.33)} y={Y(-0.28) + 70} textAnchor="middle" fontFamily={HAND} fontSize={36} fill={CP}>T ngược chiều (thứ phát)</text>
              </g>
            </g>
          )}
        </Strip>
      </Frame>
      <Lbl8 x={70} y={790} a={ap(t, 2.2)} c="#94A3B8">- - - nét đứt: nhát bình thường (PR 0,16 s, QRS hẹp)</Lbl8>
      <Card x={1280} y={140} w={580} a={ap(t, 2)} c={CB} title="① PR NGẮN < 0,12 s">xung không phải chờ ở nút</Card>
      <Card x={1280} y={300} w={580} a={ap(t, 4)} c={OR} title="② SÓNG DELTA">đầu QRS dốc lên từ từ, “trượt”</Card>
      <Card x={1280} y={460} w={580} a={ap(t, 6)} c={CR} title="③ QRS RỘNG > 0,11–0,12 s">ST–T thường ngược chiều QRS</Card>
    </DeskBg>
  );
};

// ================= 3 · MỨC TIỀN KÍCH THÍCH =================
const Variable: React.FC = () => {
  const t = useT();
  const inter = (T: number) => {const n = Math.floor((T - 0.2 + 10) / 0.85); return train(n % 2 ? (x) => wpwB(x) : (x) => normB(x))(T);};
  return (
    <DeskBg>
      <Head t={t}>Mức tiền kích thích có thể thay đổi</Head>
      {[[(x: number) => wpwB(x, {d: 0.6, r: 1.0}), 'Delta RÕ', OR, 0], [(x: number) => wpwB(x, {d: 0.1, r: 1.1}), 'Delta NHỎ — dễ bỏ sót', '#FBBF24', 2]].map(([f, s, c, st], i) => (
        <div key={i}>
          <Tag8 x={60 + i * 920} y={130} a={ap(t, st as number)} c={c as string}>{s as string}</Tag8>
          <Frame x={60 + i * 920} y={180} a={ap(t, st as number)} c={c as string}><Strip L={train(f as (x: number) => number)} w={880} h={300} q={16} base={0.66} t0={0} label="II" stroke={5} /></Frame>
        </div>
      ))}
      <Tag8 x={60} y={520} a={ap(t, 4)} c="#86EFAC">Tiền kích thích TỪNG LÚC — lúc có lúc mất</Tag8>
      <Frame x={60} y={570} a={ap(t, 4)} c={GR}><Strip L={inter} w={1800} h={260} q={10} base={0.62} t0={0} label="II" stroke={4} /></Frame>
      <Memo x={60} y={850} w={1800} a={ap(t, 4.6)}>Từng lúc → đường phụ dẫn kém → <span style={{color: '#15803D'}}>nguy cơ thấp hơn</span></Memo>
    </DeskBg>
  );
};

// ================= 4 · DẠNG HAY HỘI CHỨNG =================
const Syndrome: React.FC = () => {
  const t = useT();
  const avrt = (T: number) => {const x = ((((T - 0.1) % 0.3) + 0.3) % 0.3); return normB(x > 0.2 ? x - 0.3 : x) - gs(x, 0.13, 0.02, 0.14) * 1;};
  return (
    <DeskBg>
      <Head t={t}>Dạng hay hội chứng?</Head>
      <div style={{position: 'absolute', left: 60, top: 140, width: 880, padding: '24px 30px', borderRadius: 20, background: '#FCFAF4', borderTop: `12px solid ${OR}`, boxSizing: 'border-box', fontFamily: FONT, opacity: ap(t, 2)}}>
        <div style={{fontSize: 40, fontWeight: 900, color: '#C2410C'}}>DẠNG Wolff-Parkinson-White</div>
        <div style={{fontSize: 30, fontWeight: 700, color: '#1F2937', marginTop: 8}}>có dấu hiệu ECG · KHÔNG có cơn nhịp nhanh</div>
      </div>
      <Frame x={60} y={330} a={ap(t, 2.3)}><Strip L={train((x) => wpwB(x))} w={880} h={260} q={11} base={0.62} t0={0} label="II" stroke={4} /></Frame>
      <div style={{position: 'absolute', left: 980, top: 140, width: 880, padding: '24px 30px', borderRadius: 20, background: '#FCFAF4', borderTop: `12px solid ${CR}`, boxSizing: 'border-box', fontFamily: FONT, opacity: ap(t, 4)}}>
        <div style={{fontSize: 40, fontWeight: 900, color: CR}}>HỘI CHỨNG Wolff-Parkinson-White</div>
        <div style={{fontSize: 30, fontWeight: 700, color: '#1F2937', marginTop: 8}}>dấu hiệu ECG + cơn nhịp nhanh / triệu chứng</div>
      </div>
      <Frame x={980} y={330} a={ap(t, 4.3)} c={CR}><Strip L={avrt} w={880} h={260} q={11} base={0.62} t0={0} label="II · cơn nhịp nhanh" stroke={4} /></Frame>
      <div style={{position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', fontFamily: FONT, opacity: ap(t, 6)}}>
        <span style={{fontSize: 30, fontWeight: 800, color: '#CBD5E1'}}>Gặp ở khoảng </span><span style={{fontSize: 64, fontWeight: 900, color: '#FDE047'}}>0,1 – 0,3%</span><span style={{fontSize: 30, fontWeight: 800, color: '#CBD5E1'}}> dân số</span>
      </div>
    </DeskBg>
  );
};

// ================= 5 · DỄ NHẦM =================
const Mimics: React.FC = () => {
  const t = useT();
  const items: [(x: number) => number, string, string, string, number, number][] = [
    [(x) => wpwB(x, {d: -0.3, r: 0.7, s: -0.05, tw: 0.25}), 'III', 'delta âm → giả Q nhồi máu dưới', CR, 2, 0.5],
    [(x) => wpwB(x, {d: 0.3, r: 1.2, s: -0.1, tw: -0.25}), 'V1', 'R cao → giả phì đại thất phải', CB, 4, 0.7],
    [(x) => wpwB(x, {d: 0.4, r: 1.0}), 'V5', 'QRS rộng → giả block nhánh', CP, 4.4, 0.66],
  ];
  return (
    <DeskBg>
      <Head t={t}>Dễ NHẦM với bệnh khác</Head>
      {items.map(([f, ld, s, c, st, base], i) => (
        <div key={ld}>
          <Frame x={60 + i * 610} y={140} a={ap(t, st)} c={c}>
            <Strip L={f} w={580} h={420} q={22} base={base} t0={-0.14} label={ld} stroke={5}>
              {(X, Y) => ld === 'III' ? <g opacity={ap(t, st + 0.4)}><circle cx={X(0.03)} cy={Y(-0.3)} r={30} fill="none" stroke={CR} strokeWidth={5} /><DeltaHi X={X} Y={Y} f={f} t0={0} a={1} /></g> : <DeltaHi X={X} Y={Y} f={f} t0={0} a={ap(t, st + 0.4)} />}
            </Strip>
          </Frame>
          <div style={{position: 'absolute', left: 60 + i * 610, top: 580, width: 580, fontFamily: FONT, fontSize: 30, fontWeight: 900, color: c === CR ? '#FCA5A5' : c === CB ? '#93C5FD' : '#C4B5FD', opacity: ap(t, st + 0.3)}}>{s}</div>
        </div>
      ))}
      <Memo x={60} y={700} w={1800} a={ap(t, 6)}>Thấy QRS rộng, sóng Q lạ → luôn <span style={{color: CB}}>nhìn PR</span> và <span style={{color: OR}}>tìm delta</span></Memo>
    </DeskBg>
  );
};

// ================= 6 · ĐỊNH VỊ SƠ BỘ =================
const Localize: React.FC = () => {
  const t = useT();
  const rt = useCurrentFrame() / 30;
  const rL = race((rt % 2.0) / 2.0, 'L'), rR = race((rt % 2.0) / 2.0, 'R');
  const fA = (x: number) => wpwB(x, {d: 0.3, r: 1.1, s: -0.1, tw: -0.2});
  const fB = (x: number) => wpwB(x, {d: -0.2, r: 0.25, s: -1.1, tw: 0.25});
  return (
    <DeskBg>
      <Head t={t}>Định vị sơ bộ — nhìn V1</Head>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart4C id="lcL" x={20} y={100} s={0.5} cond={1} ring={0.8} apL={ap(t, 2)} dots={t > 2 ? rL.dots : []} glowL={t > 2 ? rL.glow : 0} />
        <Heart4C id="lcR" x={980} y={100} s={0.5} cond={1} ring={0.8} apR={ap(t, 4)} dots={t > 4 ? rR.dots : []} glowR={t > 4 ? rR.glow : 0} />
      </svg>
      <Frame x={600} y={180} a={ap(t, 2)} c={CR}><Strip L={fA} w={340} h={400} q={14} base={0.68} t0={-0.14} label="V1" stroke={5}>{(X, Y) => <DeltaHi X={X} Y={Y} f={fA} t0={0} a={1} />}</Strip></Frame>
      <Frame x={1560} y={180} a={ap(t, 4)} c={CB}><Strip L={fB} w={320} h={400} q={14} base={0.3} t0={-0.14} label="V1" stroke={5}>{(X, Y) => <DeltaHi X={X} Y={Y} f={fB} t0={0} a={1} />}</Strip></Frame>
      <Card x={60} y={720} w={880} a={ap(t, 2)} c={CR} title="V1 DƯƠNG → đường phụ bên TRÁI (dạng A)" />
      <Card x={1000} y={720} w={860} a={ap(t, 4)} c={CB} title="V1 ÂM → đường phụ bên PHẢI (dạng B)" />
      <Memo x={60} y={820} w={1800} a={ap(t, 6)}>Định vị chính xác: thuật toán chuyên sâu &amp; thăm dò điện sinh lý</Memo>
    </DeskBg>
  );
};

// ================= phần 2 =================
const LOOP: number[][] = [H4.AV, H4.HIS, [680, 760], [900, 760], [985, 680], H4.APL[2], H4.APL[1], H4.APL[0], [820, 520], [660, 560], H4.AV];
const ortho = train((x) => normB(x + 0.0) - gs(x, 0.13, 0.02, 0.16) - gs(x, -0.13, 0.022, 0.13), 0.33, 0.1);
const antiB = (x: number) => 0.3 * sm(x / 0.045) * (1 - sm((x - 0.05) / 0.03)) + gs(x, 0.075, 0.03, 0.95) + gs(x, 0.14, 0.018, -0.3) + gs(x, 0.3, 0.05, -0.38);
const anti = train(antiB, 0.32, 0.1);
// rung nhĩ có tiền kích thích: RR không đều, ngắn; mỗi nhát độ tiền kích thích khác nhau
const PAF_R = [0.12, 0.4, 0.62, 0.95, 1.17, 1.52, 1.76, 2.03, 2.4, 2.62, 2.9, 3.25, 3.47, 3.8, 4.06, 4.3, 4.68, 4.92, 5.2, 5.5, 5.74, 6.1];
const PAF_K = [1, 0.6, 1, 0.2, 0.9, 1, 0.5, 1, 0.3, 1, 0.8, 1, 0.4, 1, 0.7, 1, 0.2, 1, 0.9, 0.6, 1, 0.5];
const fw = (T: number) => 0.04 * Math.sin(2 * Math.PI * 6.3 * T) + 0.03 * Math.sin(2 * Math.PI * 9.1 * T + 1.1);
const paf = (T: number) => {
  let v = fw(T);
  PAF_R.forEach((r, i) => {
    const x = T - r;
    if (x > -0.05 && x < 0.4) {const k = PAF_K[i]; v += k * antiB(x) + (1 - k) * (gs(x, 0.03, 0.012, 1.0) + gs(x, 0.06, 0.012, -0.2) + gs(x, 0.25, 0.04, 0.15));}
  });
  return v;
};
const Ortho: React.FC = () => {
  const t = useT();
  const rt = useCurrentFrame() / 30;
  const k = (rt % 1.1) / 1.1;
  return (
    <DeskBg>
      <Head t={t}>Nhịp nhanh XUÔI CHIỀU</Head>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart4C id="or8" x={20} y={110} s={0.68} cond={1} ring={0.7} apL={1} dots={t > 2 ? [{pts: LOOP, k, c: '#22D3EE', r: 20}] : []} />
      </svg>
      <div style={{position: 'absolute', left: 120, top: 860, padding: '8px 18px', borderRadius: 14, background: '#0E7490', color: '#fff', fontFamily: FONT, fontSize: 26, fontWeight: 900, opacity: ap(t, 2)}}>xuống qua NÚT ↓ · lên qua ĐƯỜNG PHỤ ↑</div>
      <Card x={920} y={140} w={940} a={ap(t, 0)} c="#06B6D4" title="Vòng vào lại nhĩ thất qua đường phụ">thường gặp nhất là dạng XUÔI CHIỀU</Card>
      <Frame x={920} y={300} a={ap(t, 4)} c="#06B6D4">
        <Strip L={ortho} w={940} h={330} q={14} base={0.62} t0={0} label="II" stroke={4}>
          {(X, Y) => <g opacity={ap(t, 4.4)}>{[0.1, 0.43, 0.76].map((r) => <circle key={r} cx={X(r + 0.13)} cy={Y(-0.16)} r={18} fill="none" stroke={CP} strokeWidth={5} />)}</g>}
        </Strip>
      </Frame>
      <Card x={920} y={670} w={940} a={ap(t, 4)} c="#06B6D4" title="QRS HẸP, MẤT delta">P sau QRS, RP ≥ 90 ms (như bài 7)</Card>
    </DeskBg>
  );
};
const Anti: React.FC = () => {
  const t = useT();
  const rt = useCurrentFrame() / 30;
  const k = 1 - (rt % 1.1) / 1.1;
  return (
    <DeskBg>
      <Head t={t}>Nhịp nhanh NGƯỢC CHIỀU (~5%)</Head>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart4C id="an8" x={20} y={110} s={0.68} cond={1} ring={0.7} apL={1} dots={[{pts: LOOP, k, c: OR, r: 20}]} glowL={0.6 + 0.4 * Math.sin(rt * 6)} />
      </svg>
      <div style={{position: 'absolute', left: 120, top: 860, padding: '8px 18px', borderRadius: 14, background: '#C2410C', color: '#fff', fontFamily: FONT, fontSize: 26, fontWeight: 900, opacity: ap(t, 0)}}>xuống qua ĐƯỜNG PHỤ ↓ · lên qua NÚT ↑</div>
      <Card x={920} y={140} w={940} a={ap(t, 0)} c={OR} title="Xuống thất qua đường phụ → tiền kích thích TỐI ĐA" />
      <Frame x={920} y={260} a={ap(t, 2)} c={OR}><Strip L={anti} w={940} h={360} q={14} base={0.55} t0={0} label="II" stroke={4} /></Frame>
      <Card x={920} y={660} w={940} a={ap(t, 2)} c={OR} title="QRS RỘNG, đều" />
      <div style={{position: 'absolute', left: 920, top: 780, width: 940, padding: '18px 24px', borderRadius: 16, background: PEN, color: '#fff', fontFamily: FONT, fontSize: 32, fontWeight: 800, boxSizing: 'border-box', opacity: ap(t, 4)}}>Rất giống nhịp nhanh THẤT → học phân biệt ở bài 9</div>
    </DeskBg>
  );
};
const PreAF: React.FC = () => {
  const t = useT();
  const rt = useCurrentFrame() / 30;
  const ds: Dot[] = [0, 0.33, 0.66].map((o) => ({pts: [[800, 480], H4.APL[0], H4.APL[1], H4.APL[2], [990, 760]], k: ((rt * 1.6 + o) % 1), c: OR, r: 16}));
  return (
    <DeskBg>
      <Head t={t}>Rung nhĩ có tiền kích thích — NGUY HIỂM</Head>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart4C id="pa8" x={0} y={110} s={0.56} cond={1} ring={0.7} apL={1} atrialChaos={ap(t, 0)} t={rt} dots={t > 2 ? ds : []} glowL={t > 2 ? 0.6 + 0.4 * Math.sin(rt * 9) : 0} glowC={CR} />
      </svg>
      <Frame x={720} y={130} a={ap(t, 4)} c={CR}>
        <Strip L={paf} w={1140} h={340} q={12} base={0.55} t0={0} label="II" stroke={3.5}>
          {(X) => <g opacity={ap(t, 6)}><path d={`M${X(0.4)},${312} v-14 H${X(0.62)} v14`} fill="none" stroke={PEN} strokeWidth={5} /><text x={X(0.51)} y={300 - 20} textAnchor="middle" fontFamily={MONO} fontSize={24} fontWeight={700} fill={PEN}>220 ms</text></g>}
        </Strip>
      </Frame>
      <div style={{position: 'absolute', left: 720, top: 490, width: 1140, display: 'flex', gap: 14, opacity: ap(t, 4.2)}}>
        {['KHÔNG ĐỀU', 'QRS RỘNG, đổi hình từng nhát', 'RẤT NHANH (~300/phút)'].map((s) => <div key={s} style={{padding: '10px 18px', borderRadius: 14, background: 'rgba(220,38,38,0.18)', border: '2px solid #F87171', fontFamily: FONT, fontSize: 26, fontWeight: 900, color: '#FECACA'}}>{s}</div>)}
      </div>
      <Card x={720} y={580} w={1140} a={ap(t, 2)} c={OR} title="Xung rung nhĩ đi TẮT qua đường phụ — nút không còn “lọc”" />
      <Card x={720} y={690} w={1140} a={ap(t, 6)} c={PEN} title="RR ngắn nhất < 250 ms (< ~6 ô nhỏ) → nguy cơ rung thất" />
      <div style={{position: 'absolute', left: 720, top: 810, width: 1140, padding: '16px 24px', borderRadius: 16, background: PEN, color: '#fff', fontFamily: FONT, fontSize: 29, fontWeight: 800, boxSizing: 'border-box', opacity: ap(t, 8)}}>⚠ Tránh thuốc ức chế nút nhĩ thất: adenosine · chẹn kênh canxi · digoxin…</div>
    </DeskBg>
  );
};
const Review8: React.FC = () => {
  const t = useT();
  const col = (x: number, a: number, c: string, title: string, f: (T: number) => number, base: number, rows: string[]) => (
    <div style={{position: 'absolute', left: x, top: 140, width: 580, opacity: a, transform: `translateY(${(1 - a) * 20}px)`}}>
      <div style={{padding: '14px 20px', borderRadius: '16px 16px 0 0', background: c, color: '#fff', fontFamily: FONT, fontSize: 30, fontWeight: 900}}>{title}</div>
      <div style={{overflow: 'hidden'}}><Strip L={f} w={580} h={230} q={9} base={base} t0={0} label="II" stroke={3.5} /></div>
      <div style={{padding: '14px 20px', borderRadius: '0 0 16px 16px', background: '#FCFAF4', fontFamily: FONT}}>{rows.map((r) => <div key={r} style={{fontSize: 26, fontWeight: 700, color: '#1F2937', marginBottom: 6}}>• {r}</div>)}</div>
    </div>
  );
  return (
    <DeskBg>
      <Head t={t}>Ôn tập: 3 tình huống</Head>
      {col(60, ap(t, 2), CB, 'NHỊP XOANG', train((x) => wpwB(x)), 0.62, ['PR ngắn · delta · QRS rộng', '→ tiền kích thích'])}
      {col(670, ap(t, 4), '#0891B2', 'NHỊP NHANH ĐỀU', ortho, 0.62, ['QRS hẹp, P sau QRS → xuôi chiều', 'QRS rộng → ngược chiều (≈ nhịp nhanh thất)'])}
      {col(1280, ap(t, 6), CR, 'NHANH, KHÔNG ĐỀU', paf, 0.55, ['QRS rộng, đổi hình, rất nhanh', '→ rung nhĩ có tiền kích thích'])}
    </DeskBg>
  );
};
const Chk8: React.FC<{y: number; a: number; c: string; k: string; children: React.ReactNode}> = ({y, a, c, k, children}) => (
  <div style={{position: 'absolute', left: 1300, top: y, width: 560, display: 'flex', gap: 14, alignItems: 'flex-start', fontFamily: FONT, opacity: a, transform: `translateX(${(1 - a) * 30}px)`}}>
    <span style={{flex: 'none', padding: '4px 12px', borderRadius: 10, background: c, color: '#fff', fontSize: 22, fontWeight: 900, marginTop: 4}}>{k}</span>
    <span style={{fontSize: 28, fontWeight: 700, color: '#F1F5F9', lineHeight: 1.3}}>{children}</span>
  </div>
);
const Practice8: React.FC = () => {
  const t = useT();
  const sw = ap(t, 6, 0.35);
  const o1 = Math.max(0, 1 - sw * 2), o2 = Math.max(0, sw * 2 - 1);
  const fA = (x: number) => wpwB(x, {d: 0.3, r: 1.1, s: -0.1, tw: -0.2});
  return (
    <DeskBg>
      <Head t={t}>Thực hành: đọc 2 ECG</Head>
      <div style={{opacity: o1}}>
        <Tag8 x={60} y={128} a={1} c="#FDE047">ECG 1</Tag8>
        <Frame x={60} y={175} a={ap(t, 2)}><Strip L={train((x) => wpwB(x))} w={1200} h={320} q={14} base={0.62} t0={0} label="II" stroke={4} /></Frame>
        <Frame x={60} y={520} a={ap(t, 2.2)}><Strip L={train(fA)} w={1200} h={300} q={14} base={0.66} t0={0} label="V1" stroke={4} /></Frame>
        <Chk8 y={180} a={ap(t, 2.4)} c={CB} k="PR">0,09 s — ngắn</Chk8>
        <Chk8 y={260} a={ap(t, 2.8)} c={OR} k="QRS">0,13 s, đầu QRS dốc từ từ (delta)</Chk8>
        <Chk8 y={360} a={ap(t, 3.2)} c={CR} k="V1">R dương</Chk8>
        <Chk8 y={440} a={ap(t, 4)} c={GR} k="KẾT LUẬN">Tiền kích thích, đường phụ bên trái ✓</Chk8>
      </div>
      <div style={{opacity: o2}}>
        <Tag8 x={60} y={128} a={1} c="#FDE047">ECG 2</Tag8>
        <Frame x={60} y={175} a={sw} c={CR}><Strip L={paf} w={1200} h={400} q={12} base={0.55} t0={0} label="II" stroke={4} /></Frame>
        <Chk8 y={180} a={ap(t, 6.4)} c={CR} k="NHỊP">Không đều, ~250/phút</Chk8>
        <Chk8 y={260} a={ap(t, 6.8)} c={OR} k="QRS">Rộng, mỗi nhát mỗi khác</Chk8>
        <Chk8 y={360} a={ap(t, 8)} c={PEN} k="KẾT LUẬN">Rung nhĩ có tiền kích thích — NGUY HIỂM ✓</Chk8>
      </div>
    </DeskBg>
  );
};
const Takeaways8: React.FC = () => {
  const t = useT();
  const items: [React.ReactNode, string][] = [
    [<><b>PR NGẮN – DELTA – QRS RỘNG</b></>, OR],
    [<><b>Dạng</b> = chỉ có ECG · <b>Hội chứng</b> = ECG + cơn nhịp nhanh</>, CP],
    [<>Delta âm giả Q · R cao V1 giả phì đại thất phải → <b>nhìn PR</b></>, CB],
    [<>V1 dương → <b>bên trái</b> · V1 âm → <b>bên phải</b></>, '#0891B2'],
    [<>Không đều + QRS rộng thay đổi + rất nhanh → <b>rung nhĩ có tiền kích thích: NGUY HIỂM</b></>, CR],
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
      <div style={{position: 'absolute', left: 100, top: 800, width: 1720, padding: '16px 26px', borderRadius: 16, background: 'rgba(94,234,212,0.12)', border: '2px solid #5EEAD4', boxSizing: 'border-box', fontFamily: FONT, fontSize: 32, fontWeight: 800, color: '#5EEAD4', opacity: ap(t, 12)}}>Bài 9: Nhịp nhanh QRS rộng — nhịp nhanh thất hay trên thất?</div>
    </DeskBg>
  );
};

const SCN: React.FC[] = [Cover, Pathway, Signs, Variable, Syndrome, Mimics, Localize, Ortho, Anti, PreAF, Review8, Practice8, Takeaways8];
export const WPW_N = 7;
export const Wpw: React.FC = () => (
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
    <SeriesTag sub="Tiền kích thích thất (Wolff-Parkinson-White)" />
    <StationBar8 />
    <Caption />
    <Progress />
  </AbsoluteFill>
);
export {wpwB, normB, train, race, DeltaHi, Chips, Tag8, Lbl8, gs, sm};
void PEN;
