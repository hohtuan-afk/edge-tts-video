// BÀI 2: LỚN NHĨ & PHÌ ĐẠI THẤT TRÊN ĐIỆN TÂM ĐỒ — chuỗi "Tiếp cận điện tâm đồ cơ bản"
// Thần chú: Nhĩ xem P · Thất xem QRS — nhĩ Phải CAO · nhĩ Trái RỘNG · thất Trái CỘNG · thất Phải LẬT
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, Easing, staticFile, useCurrentFrame} from 'remotion';
import data from '../data.json';
import keys from './hyper_keys.json';
import stations from './hyper_stations.json';
import {TimeMap, CapCtx, FONT, useT} from '../lib';
import {Caption, Progress} from '../Main';
import {MONO} from './Lab';
import {Fade, SeriesTag} from './Demo';
import {Heart6, Zone6, SC as HSC, OX as HOX, OY as HOY} from '../wb/heart6';
import {HAND, RPath} from '../wb/wb';
import {tracePts, beatV, Lead} from './ecg';

const ap = (t: number, s: number, d = 0.6) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1)});
const dp = (t: number, s: number, d = 0.8) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
const useBeat = () => Math.max(0, Math.sin((useCurrentFrame() / 30) * 2 * Math.PI * 1.1)) ** 4;
const INK = '#1E1E24', PEN = '#C81E3A';
const C = {ra: '#8B5CF6', la: '#F97316', lv: '#DC2626', rv: '#2563EB'};
const DeskBg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 40% 35%, #3a4a52, #1d272c 75%)'}}>
    <AbsoluteFill style={{background: 'repeating-linear-gradient(95deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 9px)'}} />
    {children}
  </AbsoluteFill>
);
const LightBg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 32% 42%, #FFFFFF, #E9EEF3 72%)'}}>{children}</AbsoluteFill>
);
const Pink: React.FC<{w: number; h: number; mm: number; sub?: number}> = ({w, h, mm, sub = 5}) => {
  const g: React.ReactNode[] = [];
  for (let i = 0; i <= w / mm; i++) g.push(<line key={'v' + i} x1={i * mm} x2={i * mm} y1={0} y2={h} stroke={i % sub ? '#F6C9C1' : '#EC9A8E'} strokeWidth={i % sub ? 0.8 : 1.8} />);
  for (let j = 0; j <= h / mm; j++) g.push(<line key={'h' + j} x1={0} x2={w} y1={j * mm} y2={j * mm} stroke={j % sub ? '#F6C9C1' : '#EC9A8E'} strokeWidth={j % sub ? 0.8 : 1.8} />);
  return <g><rect width={w} height={h} fill="#FFF6F2" />{g}</g>;
};
const Memo: React.FC<{x: number; y: number; w: number; a: number; children: React.ReactNode}> = ({x, y, w, a, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, padding: '16px 22px', borderRadius: 16, background: '#FFF4C2', border: '2px solid #E8C547', opacity: a, transform: `translateY(${(1 - a) * 20}px)`, boxSizing: 'border-box', boxShadow: '0 12px 28px rgba(0,0,0,0.3)'}}>
    <div style={{fontFamily: FONT, fontSize: 20, fontWeight: 800, letterSpacing: 2, color: '#8A6D00'}}>GHI NHỚ</div>
    <div style={{fontFamily: FONT, fontSize: 30, fontWeight: 800, color: '#26221C', marginTop: 4, lineHeight: 1.3}}>{children}</div>
  </div>
);
const Card: React.FC<{x: number; y: number; w: number; a: number; c: string; title: React.ReactNode; children?: React.ReactNode; light?: boolean}> = ({x, y, w, a, c, title, children, light}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, padding: '16px 22px', borderRadius: 16, background: light ? '#FFFFFF' : '#FCFAF4', borderLeft: `10px solid ${c}`, boxShadow: light ? '0 12px 28px rgba(15,23,42,0.12)' : '0 14px 30px rgba(0,0,0,0.35)', opacity: a, transform: `translateX(${(1 - a) * 40}px)`, boxSizing: 'border-box', fontFamily: FONT}}>
    <div style={{fontSize: 30, fontWeight: 800, color: c, lineHeight: 1.2}}>{title}</div>
    {children && <div style={{fontSize: 27, fontWeight: 600, color: '#26221C', marginTop: 6, lineHeight: 1.3}}>{children}</div>}
  </div>
);
// to hoạ độ ảnh tim (1264×1264) → màn hình, theo cùng phép biến đổi của Heart6
const h2s = (x: number, y: number, s: number, ix: number, iy: number): [number, number] => [x + s * (HOX + ix * HSC), y + s * (HOY + iy * HSC)];

// ================= THANH TRẠM =================
const ST6 = ['NGUYÊN TẮC', 'LỚN NHĨ PHẢI', 'LỚN NHĨ TRÁI', 'PHÌ ĐẠI THẤT TRÁI', 'PHÌ ĐẠI THẤT PHẢI', 'ÔN TẬP'];
const STC = ['#14B8A6', C.ra, C.la, C.lv, C.rv, '#22C55E'];
const StationBar: React.FC = () => {
  const f = useCurrentFrame();
  const idx = data.scenes.findIndex((s) => f >= s.from && f < s.from + s.dur);
  const cur = idx >= 0 ? (stations as number[])[idx] : 0;
  if (!cur) return null;
  return (
    <div style={{position: 'absolute', right: 22, top: 6, display: 'flex', gap: 6, alignItems: 'center', padding: '5px 8px', borderRadius: 12, background: 'rgba(8,12,18,0.78)', border: '1px solid rgba(255,255,255,0.14)', fontFamily: FONT}}>
      {ST6.map((n, i) => {
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
const MANTRA: [string, string, string, string][] = [['lớn nhĩ Phải', 'CAO', C.ra, 'ra'], ['lớn nhĩ Trái', 'RỘNG', C.la, 'la'], ['phì đại thất Trái', 'CỘNG', C.lv, 'lv'], ['phì đại thất Phải', 'LẬT', C.rv, 'rv']];
const Cover: React.FC = () => {
  const t = useT();
  const beat = useBeat();
  const ci = t >= 4 ? Math.min(3, Math.floor((t - 4) / 0.5)) : -1;
  const m = ci >= 0 ? MANTRA[ci] : null;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 40%, #1B2E3A, #0B1218 75%)'}}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="cvh" x={1180} y={130} s={1.25} prog={dp(t, 0.3, 1.2)} art={dp(t, 1.0, 1.6)} labels={false} beat={beat}
          zone={m ? (m[3] as Zone6) : null} zoneC={m ? m[2] : '#fff'} zoneA={m ? ap(t, 4 + ci * 0.5, 0.3) : 0} />
      </svg>
      <div style={{position: 'absolute', left: 110, top: 140, fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: 4, color: '#5EEAD4', opacity: ap(t, 0.2)}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 2</div>
      <div style={{position: 'absolute', left: 106, top: 186, width: 1050, fontFamily: FONT, fontSize: 84, fontWeight: 800, lineHeight: 1.06, color: '#F8FAFC', opacity: ap(t, 0.4), transform: `translateY(${(1 - ap(t, 0.4)) * 20}px)`}}>
        Lớn nhĩ <span style={{color: '#64748B'}}>&amp;</span><br /><span style={{color: '#FB7185'}}>Phì đại thất</span>
      </div>
      <div style={{position: 'absolute', left: 112, top: 372, fontFamily: FONT, fontSize: 30, fontWeight: 600, color: '#CBD5E1', opacity: ap(t, 0.8)}}>trên điện tâm đồ · <span style={{color: '#FDE047'}}>đọc 4 buồng tim qua sóng P và QRS</span></div>
      <div style={{position: 'absolute', left: 110, top: 450, display: 'flex', gap: 16, opacity: ap(t, 2.0), transform: `translateY(${(1 - ap(t, 2.0)) * 14}px)`, fontFamily: FONT}}>
        {[['Nhĩ', 'xem P'], ['Thất', 'xem QRS']].map(([a, b], i) => (
          <div key={a} style={{padding: '10px 24px', borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.25)', fontSize: 36, fontWeight: 800, color: '#F1F5F9', opacity: ap(t, 2.0 + i * 0.4)}}>{a} <span style={{color: '#FDE047'}}>{b}</span></div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 110, top: 560, width: 1000, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14}}>
        {MANTRA.map(([a, b, c], i) => {
          const k = ap(t, 4.0 + i * 0.5, 0.4);
          return (
            <div key={a} style={{display: 'flex', alignItems: 'baseline', gap: 12, padding: '12px 22px', borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: `3px solid ${c}`, opacity: k, transform: `scale(${0.9 + 0.1 * k})`, fontFamily: FONT}}>
              <span style={{fontSize: 27, fontWeight: 600, color: '#CBD5E1'}}>{a}</span>
              <span style={{fontSize: 40, fontWeight: 900, color: c, letterSpacing: 1}}>{b}</span>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 112, top: 820, fontFamily: FONT, fontSize: 20, color: '#94A3B8', opacity: ap(t, 1.0)}}>Nguồn: AHA/ACCF/HRS ECG Recommendations Part V · LITFL ECG Library · ESC 2024 Hypertension Guidelines</div>
    </AbsoluteFill>
  );
};

// ================= 1 · NGUYÊN TẮC =================
const CH: [Zone6, string, string][] = [['ra', 'nhĩ phải', C.ra], ['la', 'nhĩ trái', C.la], ['lv', 'thất trái', C.lv], ['rv', 'thất phải', C.rv]];
const Principle: React.FC = () => {
  const t = useT();
  const beat = useBeat();
  const HX = 140, HY = 60, HS = 1.6;
  const ci = t < 1.8 ? Math.min(3, Math.max(0, Math.floor((t + 0.2) / 0.5))) : 2; // lướt 4 buồng rồi dừng ở thất trái
  const [z, name, zc] = CH[ci];
  const vec = dp(t, 2.0, 0.8);
  const [cx, cy] = h2s(HX, HY, HS, 640, 760), [vx, vy] = h2s(HX, HY, HS, 640 + 300 * vec, 760 + 190 * vec);
  const [nx, ny] = h2s(HX, HY, HS, 640 + 170, 760 + 300);
  return (
    <LightBg>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <defs><marker id="arrP" markerUnits="userSpaceOnUse" markerWidth="44" markerHeight="44" refX="22" refY="22" orient="auto"><path d="M0,4 L40,22 L0,40 Z" fill="#111827" /></marker></defs>
        <Heart6 id="pr" x={HX} y={HY} s={HS} prog={dp(t, -1.5, 1.0)} art={1} labels={false} beat={beat} zone={z} zoneC={zc} zoneA={0.85} />
        {/* vector bình thường (mờ) và vector khi thất trái dày */}
        {vec > 0 && (
          <g>
            <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#64748B" strokeWidth={8} strokeDasharray="12 10" strokeLinecap="round" opacity={0.7} />
            <line x1={cx} y1={cy} x2={vx} y2={vy} stroke="#111827" strokeWidth={14} strokeLinecap="round" markerEnd="url(#arrP)" />
            <text x={nx - 24} y={ny + 30} textAnchor="end" fontFamily={HAND} fontSize={34} fill="#475569" opacity={vec}>bình thường</text>
            <text x={vx + 34} y={vy + 12} fontFamily={HAND} fontSize={40} fill={C.lv} opacity={vec}>lệch về buồng phì đại</text>
          </g>
        )}
      </svg>
      <div style={{position: 'absolute', left: HX + 40, top: 70, padding: '8px 22px', borderRadius: 30, background: zc, color: '#fff', fontFamily: FONT, fontSize: 32, fontWeight: 800, opacity: t < 2.2 ? 1 : 0}}>{name}</div>
      <Card light x={1100} y={120} w={760} a={ap(t, 0.0)} c="#0F766E" title="Buồng tim lớn / phì đại">→ điện thế <b>LỚN</b> hơn · <b>KÉO DÀI</b> hơn</Card>
      <Card light x={1100} y={300} w={760} a={ap(t, 2.0)} c={C.lv} title="Vector tổng">lệch về phía buồng tim đó</Card>
      <div style={{position: 'absolute', left: 1100, top: 470, width: 760, padding: '18px 24px', borderRadius: 16, background: '#fff', boxShadow: '0 12px 28px rgba(15,23,42,0.12)', opacity: ap(t, 4.0), transform: `translateX(${(1 - ap(t, 4.0)) * 40}px)`, fontFamily: FONT, boxSizing: 'border-box'}}>
        {[['Độ đặc hiệu', 0.9, '#16A34A', 'CAO'], ['Độ nhạy', 0.3, '#DC2626', 'THẤP']].map(([n, v, c, l], i) => (
          <div key={n as string} style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: i ? 14 : 0}}>
            <div style={{width: 190, fontSize: 28, fontWeight: 700, color: '#334155'}}>{n}</div>
            <div style={{flex: 1, height: 30, borderRadius: 15, background: '#E2E8F0', overflow: 'hidden'}}>
              <div style={{width: `${(v as number) * 100 * dp(t, 4.2 + i * 0.3, 0.8)}%`, height: '100%', background: c as string, borderRadius: 15}} />
            </div>
            <div style={{width: 90, fontSize: 28, fontWeight: 900, color: c as string}}>{l}</div>
          </div>
        ))}
        <div style={{fontSize: 26, fontWeight: 700, color: '#475569', marginTop: 12}}>ECG bình thường <b style={{color: PEN}}>chưa loại trừ</b> lớn buồng tim</div>
      </div>
      <Memo x={1100} y={720} w={760} a={ap(t, 6.0)}>ECG gợi ý → <span style={{color: '#0F766E'}}>SIÊU ÂM TIM khẳng định</span></Memo>
    </LightBg>
  );
};

// ================= SÓNG P: phóng to, tách 2 thành phần nhĩ phải + nhĩ trái =================
type PC = {mu: number; w: number; a: number};
type PSet = {ra: PC; la: PC};
const gs = (x: number, c: PC) => c.a * Math.exp(-((x - c.mu) ** 2) / (2 * c.w * c.w));
const lerpC = (a: PC, b: PC, k: number): PC => ({mu: a.mu + (b.mu - a.mu) * k, w: a.w + (b.w - a.w) * k, a: a.a + (b.a - a.a) * k});
const N_DII: PSet = {ra: {mu: 0.04, w: 0.018, a: 0.085}, la: {mu: 0.07, w: 0.02, a: 0.075}};
const N_V1: PSet = {ra: {mu: 0.04, w: 0.018, a: 0.08}, la: {mu: 0.075, w: 0.02, a: -0.05}};
type Mark =
  | {k: 'h'; p: 'dii' | 'v1'; mv: number; label: string; c: string; t0: number}
  | {k: 'w'; p: 'dii' | 'v1'; label: string; c: string; t0: number}
  | {k: 'pk'; p: 'dii' | 'v1'; label: string; c: string; t0: number}
  | {k: 'box'; p: 'dii' | 'v1'; t: number; mv: number; label: string; c: string; t0: number};
type PCfg = {dii: PSet; v1: PSet; morphT?: number; v1T0: number; marks: Mark[]; notes: {t0: number; c: string; title: React.ReactNode; text?: React.ReactNode}[]; memo?: {t0: number; text: React.ReactNode}; heart?: {zone: Zone6; c: string; t0: number}; head: string};
const MMp = 80, PXS = 25 * MMp, PXMV = 10 * MMp; // phóng to ×8: 1 mm = 80 px
const PW = 1200, PH = 760, Y0 = 520, T0 = -0.04;
const makeP = (cfg: PCfg): React.FC => {
  const S: React.FC = () => {
    const t = useT();
    const km = cfg.morphT !== undefined ? dp(t, cfg.morphT, 1.4) : 1;
    const cur = (p: 'dii' | 'v1'): PSet => {
      const n = p === 'dii' ? N_DII : N_V1, g = p === 'dii' ? cfg.dii : cfg.v1;
      return {ra: lerpC(n.ra, g.ra, km), la: lerpC(n.la, g.la, km)};
    };
    const panel = (p: 'dii' | 'v1', ox: number) => {
      const P = cur(p);
      const xOf = (tt: number) => ox + 40 + (tt - T0) * PXS;
      const yOf = (mv: number) => Y0 - mv * PXMV;
      const pts = (f: (x: number) => number) => {
        const o: string[] = [];
        for (let tt = T0; tt <= 0.2 + 1e-9; tt += 0.002) o.push(`${xOf(tt).toFixed(1)},${yOf(f(tt)).toFixed(1)}`);
        return o.join(' ');
      };
      const area = (c: PC) => `${xOf(T0)},${Y0} ${pts((x) => gs(x, c))} ${xOf(0.2)},${Y0}`;
      const sum = (x: number) => gs(x, P.ra) + gs(x, P.la);
      // mốc đầu/cuối & đỉnh
      let on = T0, off = 0.2;
      for (let x = T0; x <= 0.2; x += 0.001) if (Math.abs(sum(x)) > 0.012) {on = x; break;}
      for (let x = 0.2; x >= T0; x -= 0.001) if (Math.abs(sum(x)) > 0.012) {off = x; break;}
      const peaks: number[] = [];
      for (let x = T0 + 0.002; x < 0.2; x += 0.001) if (sum(x) > sum(x - 0.002) && sum(x) >= sum(x + 0.002) && sum(x) > 0.03 && (!peaks.length || x - peaks[peaks.length - 1] > 0.01)) peaks.push(x);
      const a = p === 'dii' ? 1 : ap(t, cfg.v1T0, 0.6);
      const comp = ap(t, p === 'dii' ? 0.2 : cfg.v1T0 + 0.2, 0.6);
      return (
        <g opacity={a}>
          <text x={ox + 24} y={60} fontFamily={MONO} fontSize={40} fontWeight={700} fill={INK}>{p === 'dii' ? 'DII' : 'V1'}</text>
          <line x1={ox + 10} x2={ox + 570} y1={Y0} y2={Y0} stroke="#94A3B8" strokeWidth={2} strokeDasharray="8 8" />
          <polygon points={area(P.ra)} fill={C.ra} opacity={0.22 * comp} />
          <polygon points={area(P.la)} fill={C.la} opacity={0.22 * comp} />
          <polyline points={pts((x) => gs(x, P.ra))} fill="none" stroke={C.ra} strokeWidth={4} opacity={comp} />
          <polyline points={pts((x) => gs(x, P.la))} fill="none" stroke={C.la} strokeWidth={4} opacity={comp} />
          <polyline points={pts(sum)} fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dp(t, p === 'dii' ? 0.6 : cfg.v1T0 + 0.5, 0.8)} />
          {cfg.marks.filter((m) => m.p === p).map((m, i) => {
            const k = ap(t, m.t0, 0.5);
            if (k <= 0) return null;
            if (m.k === 'h') return (
              <g key={i} opacity={k}>
                <line x1={ox + 10} x2={ox + 570} y1={yOf(m.mv)} y2={yOf(m.mv)} stroke={m.c} strokeWidth={4} strokeDasharray="14 10" />
                <text x={ox + 560} y={yOf(m.mv) - 14} textAnchor="end" fontFamily={MONO} fontSize={30} fontWeight={700} fill={m.c}>{m.label}</text>
              </g>
            );
            if (m.k === 'w') return (
              <g key={i} opacity={k}>
                <path d={`M${xOf(on)},${Y0 + 60} v14 H${xOf(on) + (xOf(off) - xOf(on)) * k} v-14`} fill="none" stroke={m.c} strokeWidth={5} />
                <text x={(xOf(on) + xOf(off)) / 2} y={Y0 + 120} textAnchor="middle" fontFamily={MONO} fontSize={32} fontWeight={700} fill={m.c}>{m.label}</text>
              </g>
            );
            if (m.k === 'pk' && peaks.length >= 2) return (
              <g key={i} opacity={k}>
                {peaks.slice(0, 2).map((x, j) => <circle key={j} cx={xOf(x)} cy={yOf(sum(x))} r={11} fill={m.c} />)}
                <path d={`M${xOf(peaks[0])},${yOf(sum(peaks[0])) - 40} v-12 H${xOf(peaks[1])} v12`} fill="none" stroke={m.c} strokeWidth={4} />
                <text x={(xOf(peaks[0]) + xOf(peaks[1])) / 2} y={yOf(Math.max(sum(peaks[0]), sum(peaks[1]))) - 70} textAnchor="middle" fontFamily={MONO} fontSize={28} fontWeight={700} fill={m.c}>{m.label}</text>
              </g>
            );
            if (m.k === 'box') {
              const x0 = xOf(m.t), y0 = yOf(m.mv);
              return (
                <g key={i} opacity={k}>
                  <rect x={x0} y={y0} width={0.04 * PXS} height={0.1 * PXMV} fill="rgba(250,204,21,0.35)" stroke="#B45309" strokeWidth={4} />
                  <text x={x0 + 0.04 * PXS + 14} y={y0 + 0.1 * PXMV + 36} fontFamily={HAND} fontSize={32} fill="#B45309">{m.label}</text>
                </g>
              );
            }
            return null;
          })}
        </g>
      );
    };
    return (
      <DeskBg>
        <div style={{position: 'absolute', left: 40, top: 110, width: PW, height: PH, boxShadow: '0 30px 60px rgba(0,0,0,0.45)', transform: `rotate(-0.4deg) translateY(${(1 - ap(t, -1.5, 0.6)) * 900}px)`}}>
          <svg viewBox={`0 0 ${PW} ${PH}`} width={PW} height={PH} style={{position: 'absolute', inset: 0}}>
            <Pink w={PW} h={PH} mm={80} sub={5} />
            {panel('dii', 0)}
            <line x1={600} x2={600} y1={20} y2={PH - 20} stroke="#D6B3AD" strokeWidth={3} />
            {panel('v1', 610)}
            <text x={PW - 18} y={PH - 14} textAnchor="end" fontFamily={MONO} fontSize={18} fill="#9b6b64">phóng to · 1 ô nhỏ = 0,04 s · 0,1 mV</text>
          </svg>
          {/* chú giải hai thành phần */}
          <div style={{position: 'absolute', left: 20, bottom: 22, display: 'flex', gap: 14, opacity: ap(t, 0.3), fontFamily: FONT, fontSize: 24, fontWeight: 800}}>
            <span style={{padding: '4px 14px', borderRadius: 20, background: C.ra, color: '#fff'}}>nhĩ phải (đi trước)</span>
            <span style={{padding: '4px 14px', borderRadius: 20, background: C.la, color: '#fff'}}>nhĩ trái (đi sau)</span>
            <span style={{padding: '4px 14px', borderRadius: 20, background: INK, color: '#fff'}}>= sóng P</span>
          </div>
        </div>
        <div style={{position: 'absolute', left: 1280, top: 64, fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#F8FAFC', opacity: ap(t, -1)}}>{cfg.head}</div>
        {cfg.heart && (
          <div style={{position: 'absolute', left: 1280, top: 120, width: 240, height: 250, borderRadius: 14, background: '#FCFAF4', boxShadow: '0 12px 28px rgba(0,0,0,0.4)', opacity: ap(t, cfg.heart.t0), overflow: 'hidden'}}>
            <svg viewBox="0 0 240 250" width={240} height={250}>
              <Heart6 id={'ph' + cfg.heart.zone} x={-8} y={4} s={0.46} prog={1} art={1} labels={false} zone={cfg.heart.zone} zoneC={cfg.heart.c} zoneA={ap(t, cfg.heart.t0 + 0.3, 0.6)} />
            </svg>
          </div>
        )}
        {cfg.notes.map((n, i) => (
          <Card key={i} x={1280} y={(cfg.heart ? 390 : 130) + i * (cfg.heart ? 132 : 175)} w={590} a={ap(t, n.t0)} c={n.c} title={n.title}>{n.text}</Card>
        ))}
        {cfg.memo && <Memo x={1280} y={cfg.heart ? 400 + cfg.notes.length * 150 : 130 + cfg.notes.length * 175} w={590} a={ap(t, cfg.memo.t0)}>{cfg.memo.text}</Memo>}
      </DeskBg>
    );
  };
  return S;
};
const NormalP = makeP({
  head: 'Sóng P bình thường',
  dii: N_DII, v1: N_V1, v1T0: 4.0,
  marks: [
    {k: 'w', p: 'dii', label: '< 0,12 s', c: '#0F766E', t0: 2.0},
    {k: 'h', p: 'dii', mv: 0.25, label: '2,5 mm', c: '#0F766E', t0: 2.3},
  ],
  notes: [
    {t0: 0.2, c: INK, title: 'P = nhĩ phải + nhĩ trái', text: <>hai phần <b>chồng lên nhau</b></>},
    {t0: 2.0, c: '#0F766E', title: 'DII: P tròn', text: <>rộng &lt; 0,12 s · cao &lt; 2,5 mm</>},
    {t0: 4.0, c: C.ra, title: 'V1: P hai pha', text: <>dương (nhĩ phải) → âm nhỏ (nhĩ trái)</>},
  ],
  memo: {t0: 6.0, text: <>Lớn nhĩ → nhìn P ở <span style={{color: PEN}}>DII</span> và <span style={{color: PEN}}>V1</span></>},
});
const RAE = makeP({
  head: 'Lớn nhĩ PHẢI → P CAO',
  morphT: 0.3,
  dii: {ra: {mu: 0.04, w: 0.018, a: 0.24}, la: {mu: 0.07, w: 0.02, a: 0.06}},
  v1: {ra: {mu: 0.04, w: 0.018, a: 0.2}, la: {mu: 0.075, w: 0.02, a: -0.04}},
  v1T0: 4.0,
  marks: [
    {k: 'h', p: 'dii', mv: 0.25, label: '> 2,5 mm', c: C.ra, t0: 2.0},
    {k: 'h', p: 'v1', mv: 0.15, label: '> 1,5 mm', c: C.ra, t0: 4.4},
    {k: 'w', p: 'dii', label: 'rộng vẫn < 0,12 s', c: '#0F766E', t0: 6.0},
  ],
  heart: {zone: 'ra', c: C.ra, t0: 0},
  notes: [
    {t0: 2.0, c: C.ra, title: <>DII: P cao nhọn &gt; 2,5 mm</>, text: <>= “P phế”</>},
    {t0: 4.0, c: C.ra, title: <>V1: dương đầu &gt; 1,5 mm</>},
    {t0: 6.0, c: '#0F766E', title: 'Độ rộng không đổi — chỉ CAO'},
    {t0: 8.0, c: '#475569', title: 'Nguyên nhân', text: <>tăng áp phổi · bệnh phổi mạn · tim bẩm sinh · van ba lá</>},
  ],
});
const LAE = makeP({
  head: 'Lớn nhĩ TRÁI → P RỘNG',
  morphT: 0.3,
  dii: {ra: {mu: 0.04, w: 0.018, a: 0.09}, la: {mu: 0.1, w: 0.022, a: 0.1}},
  v1: {ra: {mu: 0.04, w: 0.018, a: 0.07}, la: {mu: 0.105, w: 0.028, a: -0.14}},
  v1T0: 4.0,
  marks: [
    {k: 'w', p: 'dii', label: '> 0,11 s', c: C.la, t0: 2.0},
    {k: 'pk', p: 'dii', label: '> 0,04 s', c: PEN, t0: 2.6},
    {k: 'box', p: 'v1', t: 0.085, mv: 0, label: '1 ô nhỏ', c: '#B45309', t0: 4.6},
  ],
  heart: {zone: 'la', c: C.la, t0: 0},
  notes: [
    {t0: 2.0, c: C.la, title: <>DII: P &gt; 0,11 s, hai đỉnh</>, text: <>đỉnh cách &gt; 0,04 s = “P hai lá”</>},
    {t0: 4.0, c: C.la, title: 'V1: âm cuối sâu & rộng', text: <>&gt; 1 mm và &gt; 0,04 s</>},
    {t0: 6.0, c: '#B45309', title: 'Mẹo: phần âm > 1 ô vuông nhỏ'},
    {t0: 8.0, c: '#475569', title: 'Nguyên nhân', text: <>hẹp hai lá · tăng huyết áp · hẹp chủ · hở hai lá · BCT phì đại</>},
  ],
});

// ================= 5 · SO SÁNH HAI NHĨ =================
const RAE_SET = {dii: {ra: {mu: 0.04, w: 0.018, a: 0.24}, la: {mu: 0.07, w: 0.02, a: 0.06}}, v1: {ra: {mu: 0.04, w: 0.018, a: 0.2}, la: {mu: 0.075, w: 0.02, a: -0.04}}};
const LAE_SET = {dii: {ra: {mu: 0.04, w: 0.018, a: 0.09}, la: {mu: 0.1, w: 0.022, a: 0.1}}, v1: {ra: {mu: 0.04, w: 0.018, a: 0.07}, la: {mu: 0.105, w: 0.028, a: -0.14}}};
const MiniP: React.FC<{set: PSet; norm: PSet; a: number; label: string; c: string}> = ({set, norm, a, label, c}) => {
  const W = 400, H = 280, B = 170, xs = 1300, ys = 520;
  const x = (tt: number) => 30 + (tt + 0.03) * xs;
  const path = (P: PSet) => {
    const o: string[] = [];
    for (let tt = -0.03; tt <= 0.22; tt += 0.002) o.push(`${x(tt).toFixed(1)},${(B - (gs(tt, P.ra) + gs(tt, P.la)) * ys).toFixed(1)}`);
    return o.join(' ');
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{opacity: a, borderRadius: 10, boxShadow: '0 6px 16px rgba(0,0,0,0.15)'}}>
      <Pink w={W} h={H} mm={26} sub={5} />
      <text x={14} y={34} fontFamily={MONO} fontSize={28} fontWeight={700} fill={INK}>{label}</text>
      <polyline points={path(norm)} fill="none" stroke="#94A3B8" strokeWidth={4} strokeDasharray="8 7" />
      <polyline points={path(set)} fill="none" stroke={c} strokeWidth={7} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - a} />
    </svg>
  );
};
const CompareAtria: React.FC = () => {
  const t = useT();
  const cols: [string, string, string, typeof RAE_SET, string, string][] = [
    ['LỚN NHĨ PHẢI', 'P CAO', C.ra, RAE_SET, 'cao nhọn > 2,5 mm', 'dương đầu > 1,5 mm'],
    ['LỚN NHĨ TRÁI', 'P RỘNG', C.la, LAE_SET, 'rộng > 0,11 s, hai đỉnh', 'âm cuối > 1 ô nhỏ'],
  ];
  return (
    <DeskBg>
      {cols.map(([h, k, c, set, d1, d2], i) => {
        const x = 60 + i * 920;
        const a = ap(t, -1 + i * 0.3, 0.6);
        return (
          <div key={h} style={{position: 'absolute', left: x, top: 90, width: 880, height: 610, borderRadius: 20, background: '#FCFAF4', borderTop: `12px solid ${c}`, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', opacity: a, transform: `translateY(${(1 - a) * 30}px)`, fontFamily: FONT}}>
            <div style={{position: 'absolute', left: 30, top: 18, fontSize: 40, fontWeight: 900, color: c}}>{h} <span style={{color: '#26221C'}}>→ {k}</span></div>
            <div style={{position: 'absolute', left: 30, top: 100}}><MiniP set={set.dii} norm={N_DII} a={ap(t, 0.2 + i * 0.4, 0.8)} label="DII" c={c} /></div>
            <div style={{position: 'absolute', left: 450, top: 100}}><MiniP set={set.v1} norm={N_V1} a={ap(t, 2.0 + i * 0.4, 0.8)} label="V1" c={c} /></div>
            <div style={{position: 'absolute', left: 30, top: 400, width: 400, fontSize: 30, fontWeight: 800, color: '#26221C', opacity: ap(t, 0.5 + i * 0.4)}}>DII: <span style={{color: c}}>{d1}</span></div>
            <div style={{position: 'absolute', left: 450, top: 400, width: 400, fontSize: 30, fontWeight: 800, color: '#26221C', opacity: ap(t, 2.3 + i * 0.4)}}>V1: <span style={{color: c}}>{d2}</span></div>
            <div style={{position: 'absolute', left: 30, top: 520, fontSize: 24, fontWeight: 600, color: '#64748B', opacity: ap(t, 0.5)}}>– – – sóng P bình thường để so sánh</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 60, top: 740, width: 1800, padding: '18px 30px', borderRadius: 16, background: 'linear-gradient(90deg, #8B5CF6, #F97316)', color: '#fff', fontFamily: FONT, fontSize: 38, fontWeight: 900, opacity: ap(t, 4.0), transform: `scale(${0.95 + 0.05 * ap(t, 4.0)})`, boxSizing: 'border-box', boxShadow: '0 14px 30px rgba(0,0,0,0.4)'}}>
        Có cả hai dấu hiệu (P cao VÀ rộng) → LỚN HAI NHĨ
      </div>
    </DeskBg>
  );
};

// ================= 6 · PHÌ ĐẠI THẤT TRÁI — SOKOLOW-LYON =================
const LVH_V1: Lead = {p: 0.1, r: 0.25, s: -1.62, t: 0.25, tw: 0.07};
const LVH_V5: Lead = {p: 0.1, q: -0.1, r: 2.2, s: -0.12, t: 0.45, tw: 0.07};
const Sokolow: React.FC = () => {
  const t = useT();
  const mm = 12, pxs = 25 * mm, pxmv = 10 * mm, W0 = 1180, H0 = 760, B = 380;
  const RT = 1.08; // đỉnh R nhát thứ 2
  const sV1 = -beatV(0.03, LVH_V1) * 10, rV5 = beatV(0, LVH_V5) * 10; // mm
  const sMM = 16, rMM = 22;
  const bar = dp(t, 4.0, 1.0), seg2 = dp(t, 4.6, 1.0);
  const BX = 1450, BB = 820, k = 10; // thang cột: 10 px/mm
  return (
    <DeskBg>
      <div style={{position: 'absolute', left: 40, top: 110, width: W0, height: H0, boxShadow: '0 30px 60px rgba(0,0,0,0.45)', transform: `rotate(-0.4deg) translateY(${(1 - ap(t, -1.5, 0.6)) * 900}px)`}}>
        <svg viewBox={`0 0 ${W0} ${H0}`} width={W0} height={H0} style={{position: 'absolute', inset: 0}}>
          <Pink w={W0} h={H0} mm={mm} sub={5} />
          <line x1={590} x2={590} y1={10} y2={H0 - 10} stroke="#D6B3AD" strokeWidth={3} />
          {[['V1', 0, LVH_V1], ['V5', 600, LVH_V5]].map(([n, ox, L]) => (
            <g key={n as string}>
              <text x={(ox as number) + 20} y={50} fontFamily={MONO} fontSize={38} fontWeight={700} fill={INK}>{n as string}</text>
              <polyline points={tracePts((ox as number) + 10, B, 0, 1.85, pxs, pxmv, L as Lead, 0.8, 0.003)} fill="none" stroke={INK} strokeWidth={3.2} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dp(t, -0.5, 1.4)} />
            </g>
          ))}
          {/* đo S V1 */}
          <g opacity={ap(t, 2.0)}>
            <rect x={10 + RT * pxs - 18} y={B} width={36} height={sV1 / 10 * pxmv} fill="rgba(14,165,233,0.25)" />
            <path d={`M${10 + (RT + 0.08) * pxs},${B} h14 V${B + sV1 / 10 * pxmv} h-14`} fill="none" stroke="#0284C7" strokeWidth={4} />
            <text x={10 + (RT + 0.08) * pxs + 26} y={B + sV1 / 20 * pxmv + 10} fontFamily={MONO} fontSize={32} fontWeight={700} fill="#0284C7">S {sMM} mm</text>
          </g>
          {/* đo R V5 */}
          <g opacity={ap(t, 2.4)}>
            <rect x={610 + RT * pxs - 18} y={B - rV5 / 10 * pxmv} width={36} height={rV5 / 10 * pxmv} fill="rgba(220,38,38,0.2)" />
            <path d={`M${610 + (RT + 0.08) * pxs},${B} h14 V${B - rV5 / 10 * pxmv} h-14`} fill="none" stroke={C.lv} strokeWidth={4} />
            <text x={610 + (RT + 0.08) * pxs + 26} y={B - rV5 / 20 * pxmv + 10} fontFamily={MONO} fontSize={32} fontWeight={700} fill={C.lv}>R {rMM} mm</text>
          </g>
          <text x={W0 - 18} y={H0 - 14} textAnchor="end" fontFamily={MONO} fontSize={18} fill="#9b6b64">25 mm/s · 10 mm/mV</text>
        </svg>
        <div style={{position: 'absolute', left: 20, top: 640, display: 'flex', gap: 14, opacity: ap(t, 2.0), fontFamily: FONT, fontSize: 28, fontWeight: 800}}>
          <span style={{padding: '6px 16px', borderRadius: 12, background: '#0284C7', color: '#fff'}}>S rất sâu ở V1–V2</span>
          <span style={{padding: '6px 16px', borderRadius: 12, background: C.lv, color: '#fff'}}>R rất cao ở V5–V6</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 1280, top: 64, fontFamily: FONT, fontSize: 38, fontWeight: 800, color: '#F8FAFC'}}>Phì đại thất TRÁI → CỘNG</div>
      <div style={{position: 'absolute', left: 1280, top: 120, width: 240, height: 250, borderRadius: 14, background: '#FCFAF4', boxShadow: '0 12px 28px rgba(0,0,0,0.4)', overflow: 'hidden', opacity: ap(t, -1)}}>
        <svg viewBox="0 0 240 250" width={240} height={250}><Heart6 id="lvh" x={-8} y={4} s={0.46} prog={1} art={1} labels={false} zone="lv" zoneC={C.lv} zoneA={ap(t, 0.2, 0.6)} /></svg>
      </div>
      <div style={{position: 'absolute', left: 1540, top: 130, width: 330, fontFamily: FONT, fontSize: 28, fontWeight: 700, color: '#E2E8F0', lineHeight: 1.3, opacity: ap(t, 0.4)}}>Sokolow-Lyon:<br /><span style={{color: '#FDE047', fontWeight: 900}}>S V1 + R V5/V6<br />≥ 35 mm</span></div>
      {/* cột cộng */}
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <g opacity={ap(t, 4.0, 0.4)}>
          <line x1={BX - 70} x2={BX + 230} y1={BB - 35 * k} y2={BB - 35 * k} stroke="#FDE047" strokeWidth={4} strokeDasharray="14 10" />
          <text x={BX + 230} y={BB - 35 * k - 12} textAnchor="end" fontFamily={MONO} fontSize={28} fontWeight={700} fill="#FDE047">35 mm</text>
          <rect x={BX} y={BB - sMM * k * bar} width={110} height={sMM * k * bar} fill="#0284C7" />
          <rect x={BX} y={BB - sMM * k - rMM * k * seg2} width={110} height={rMM * k * seg2} fill={C.lv} />
          <text x={BX + 55} y={BB - sMM * k / 2 + 10} textAnchor="middle" fontFamily={MONO} fontSize={28} fontWeight={700} fill="#fff" opacity={bar}>16</text>
          <text x={BX + 55} y={BB - sMM * k - rMM * k / 2 + 10} textAnchor="middle" fontFamily={MONO} fontSize={28} fontWeight={700} fill="#fff" opacity={seg2}>22</text>
          <text x={BX - 16} y={BB - sMM * k / 2 + 10} textAnchor="end" fontFamily={FONT} fontSize={26} fontWeight={800} fill="#7DD3FC" opacity={bar}>S V1</text>
          <text x={BX - 16} y={BB - sMM * k - rMM * k / 2 + 10} textAnchor="end" fontFamily={FONT} fontSize={26} fontWeight={800} fill="#FCA5A5" opacity={seg2}>R V5</text>
          <line x1={BX - 10} x2={BX + 120} y1={BB} y2={BB} stroke="#E2E8F0" strokeWidth={3} />
        </g>
        <g opacity={ap(t, 6.0)}>
          <text x={BX + 140} y={BB - 38 * k + 10} fontFamily={MONO} fontSize={40} fontWeight={700} fill="#4ADE80">= 38 mm ✓</text>
        </g>
      </svg>
      <div style={{position: 'absolute', left: 1280, top: 850, width: 590, padding: '10px 18px', borderRadius: 12, background: '#FFF4C2', border: '2px solid #E8C547', fontFamily: FONT, fontSize: 28, fontWeight: 800, color: '#26221C', opacity: ap(t, 8.0), boxSizing: 'border-box'}}>Mẹo: 35 mm = <span style={{color: PEN}}>7 ô lớn</span></div>
    </DeskBg>
  );
};

const SC: React.FC[] = [Cover, Principle, NormalP, RAE, LAE, CompareAtria, Sokolow];
export const HYPER_DEMO_N = SC.length;
export const Hyper: React.FC = () => (
  <AbsoluteFill style={{background: '#0E1116', fontFamily: FONT}}>
    <Audio src={staticFile('narration.m4a')} />
    <CapCtx.Provider value={false}>
      {data.scenes.slice(0, SC.length).map((s, i) => {
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
    <SeriesTag sub="Lớn nhĩ & Phì đại thất" />
    <StationBar />
    <Caption />
    <Progress />
  </AbsoluteFill>
);
