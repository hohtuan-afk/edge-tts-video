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
import {Sheet} from './Paper';

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
            <text x={vx + 30} y={vy - 14} fontFamily={HAND} fontSize={40} fill={C.lv} opacity={vec}>lệch về</text><text x={vx + 30} y={vy + 30} fontFamily={HAND} fontSize={40} fill={C.lv} opacity={vec}>buồng phì đại</text>
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
          <line x1={BX - 74} x2={BX + 130} y1={BB - 35 * k} y2={BB - 35 * k} stroke="#FDE047" strokeWidth={4} strokeDasharray="14 10" />
          <text x={BX - 84} y={BB - 35 * k + 10} textAnchor="end" fontFamily={MONO} fontSize={28} fontWeight={700} fill="#FDE047">35 mm</text>
          <rect x={BX} y={BB - sMM * k * bar} width={110} height={sMM * k * bar} fill="#0284C7" />
          <rect x={BX} y={BB - sMM * k - rMM * k * seg2} width={110} height={rMM * k * seg2} fill={C.lv} opacity={seg2 > 0.01 ? 1 : 0} />
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


// ================= tiện ích: dải ECG ngắn trên giấy hồng =================
const Strip: React.FC<{L: Lead; label: string; w?: number; h?: number; mm?: number; base?: number; prog?: number; dur?: number; children?: React.ReactNode}> = ({L, label, w = 560, h = 300, mm = 10, base, prog = 1, dur, children}) => {
  const pxs = 25 * mm, pxmv = 10 * mm, B = base ?? h * 0.58;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{display: 'block'}}>
      <Pink w={w} h={h} mm={mm} />
      <text x={14} y={36} fontFamily={MONO} fontSize={30} fontWeight={700} fill={INK}>{label}</text>
      <polyline points={tracePts(10, B, 0, dur ?? (w - 20) / pxs, pxs, pxmv, L, 0.8, 0.003)} fill="none" stroke={INK} strokeWidth={3} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
      {children}
    </svg>
  );
};
const Box: React.FC<{x: number; y: number; w: number; a: number; children: React.ReactNode; rot?: number}> = ({x, y, w, a, children, rot = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.45)', opacity: a, transform: `rotate(${rot}deg) translateY(${(1 - a) * 40}px)`}}>{children}</div>
);

// ================= 7 · CORNELL & PEGUERO-LO PRESTI =================
const C_AVL: Lead = {p: 0.08, r: 1.5, s: -0.1, t: 0.25};
const C_V3: Lead = {p: 0.1, r: 0.4, s: -1.6, t: 0.35};
const C_V4: Lead = {p: 0.1, r: 0.9, s: -1.4, t: 0.35};
const MeasBar: React.FC<{x: number; B: number; v: number; c: string; label: string; a: number; mm?: number}> = ({x, B, v, c, label, a, mm = 10}) => {
  const hh = v * 10 * mm;
  return (
    <g opacity={a}>
      <path d={`M${x},${B} h12 V${B - hh} h-12`} fill="none" stroke={c} strokeWidth={4} />
      <text x={x + 20} y={B - hh / 2 + 10} fontFamily={MONO} fontSize={28} fontWeight={700} fill={c}>{label}</text>
    </g>
  );
};
const Cornell: React.FC = () => {
  const t = useT();
  const mm = 10, B = 170, xR = 10 + 1.08 * 250;
  return (
    <DeskBg>
      <div style={{position: 'absolute', left: 60, top: 70, fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#F8FAFC'}}>Phì đại thất trái · thêm 2 tiêu chuẩn</div>
      <Box x={60} y={150} w={560} a={ap(t, 0.0)} rot={-0.6}><Strip L={C_AVL} label="aVL" h={300} base={B + 60} mm={mm} prog={dp(t, 0, 0.8)}><MeasBar x={xR + 26} B={B + 60} v={beatV(0, C_AVL)} c={C.lv} label="R" a={ap(t, 0.6)} /></Strip></Box>
      <Box x={650} y={150} w={560} a={ap(t, 0.3)} rot={0.6}><Strip L={C_V3} label="V3" h={300} base={110} mm={mm} prog={dp(t, 0.3, 0.8)}><MeasBar x={xR + 30} B={110} v={beatV(0.03, C_V3)} c="#0284C7" label="S" a={ap(t, 0.9)} /></Strip></Box>
      <Box x={60} y={500} w={1150} a={ap(t, 2.0)} rot={-0.4}><Strip L={C_V4} label="V4 + S sâu nhất ở bất kỳ chuyển đạo" w={1150} h={330} base={120} mm={mm} prog={dp(t, 2.0, 1.0)}><MeasBar x={xR + 30} B={120} v={beatV(0.03, C_V4)} c="#7C3AED" label="S V4" a={ap(t, 2.6)} /></Strip></Box>
      <Card x={1250} y={150} w={620} a={ap(t, 0.0)} c="#0284C7" title="Cornell">R aVL + S V3<br /><b>&gt; 28 mm</b> (nam) · <b>&gt; 20 mm</b> (nữ)</Card>
      <Card x={1250} y={370} w={620} a={ap(t, 2.0)} c="#7C3AED" title="Peguero-Lo Presti (2017)">S sâu nhất + S V4<br /><b>≥ 28 mm</b> (nam) · <b>≥ 23 mm</b> (nữ)</Card>
      <div style={{position: 'absolute', left: 1250, top: 600, width: 620, padding: '16px 22px', borderRadius: 16, background: '#7C3AED', color: '#fff', fontFamily: FONT, fontSize: 32, fontWeight: 800, opacity: ap(t, 4.0), transform: `scale(${0.92 + 0.08 * ap(t, 4.0)})`, boxSizing: 'border-box', boxShadow: '0 12px 28px rgba(0,0,0,0.4)'}}>↑ Độ nhạy cao hơn tiêu chuẩn cũ</div>
      <Memo x={1250} y={730} w={620} a={ap(t, 6.0)}>Người trẻ · gầy · vận động viên:<br /><span style={{color: PEN}}>điện thế cao có thể BÌNH THƯỜNG</span></Memo>
    </DeskBg>
  );
};

// ================= 8 · DẠNG TĂNG GÁNH =================
const g1 = (x: number, mu: number, w: number, a: number) => a * Math.exp(-((x - mu) ** 2) / (2 * w * w));
const strainF = (tr: number) => g1(tr, -0.15, 0.02, 0.1) + g1(tr, 0, 0.012, 2.0) + g1(tr, 0.028, 0.01, -0.15) +
  (tr > 0.045 && tr < 0.34 ? (() => {const u = (tr - 0.045) / 0.29; return -0.32 * Math.pow(Math.sin(Math.PI * Math.pow(u, 0.62)), 1.25) * 1;})() : 0);
const ischF = (tr: number) => g1(tr, -0.15, 0.02, 0.1) + g1(tr, 0, 0.012, 1.2) + g1(tr, 0.028, 0.01, -0.15) + g1(tr, 0.22, 0.045, -0.45);
const Zoom: React.FC<{f: (tr: number) => number; label: string; prog: number; c: string; w?: number; h?: number; mm?: number; B?: number}> = ({f, label, prog, c, w = 600, h = 520, mm = 20, B = 330}) => {
  const pxs = 25 * mm * 0.5, pxmv = 10 * mm * 0.5;
  const pts: string[] = [];
  for (let tr = -0.28; tr <= 0.5; tr += 0.002) pts.push(`${(60 + (tr + 0.28) * pxs * 1.8).toFixed(1)},${(B - f(tr) * pxmv).toFixed(1)}`);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{display: 'block'}}>
      <Pink w={w} h={h} mm={mm} />
      <line x1={10} x2={w - 10} y1={B} y2={B} stroke="#2563EB" strokeWidth={2.5} strokeDasharray="10 8" />
      <text x={16} y={40} fontFamily={MONO} fontSize={30} fontWeight={700} fill={INK}>{label}</text>
      <polyline points={pts.join(' ')} fill="none" stroke={c} strokeWidth={6} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
    </svg>
  );
};
const Strain: React.FC = () => {
  const t = useT();
  return (
    <DeskBg>
      <div style={{position: 'absolute', left: 60, top: 70, fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#F8FAFC'}}>Dạng tăng gánh (strain) thất trái</div>
      <Box x={60} y={150} w={600} a={ap(t, 0)}><Zoom f={strainF} label="V5 · tăng gánh" prog={dp(t, 0, 1.0)} c={INK} /></Box>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        <g opacity={ap(t, 2.0)}>
          <text x={330} y={610} fontFamily={HAND} fontSize={36} fill={PEN}>ST dốc xuống ↘</text>
          <text x={430} y={650} fontFamily={HAND} fontSize={36} fill={PEN}>T lên nhanh ↗</text>
          <text x={110} y={600} fontFamily={HAND} fontSize={34} fill="#0284C7">R rất cao</text>
        </g>
      </svg>
      <Box x={700} y={150} w={600} a={ap(t, 8.0)}><Zoom f={ischF} label="thiếu máu · T đối xứng" prog={dp(t, 8.0, 1.0)} c="#7C3AED" /></Box>
      <div style={{position: 'absolute', left: 700, top: 690, width: 600, textAlign: 'center', fontFamily: FONT, fontSize: 28, fontWeight: 800, color: '#C4B5FD', opacity: ap(t, 8.4)}}>T đảo nhọn, ĐỐI XỨNG → nghĩ thiếu máu</div>
      <div style={{position: 'absolute', left: 60, top: 690, width: 600, textAlign: 'center', fontFamily: FONT, fontSize: 28, fontWeight: 800, color: '#FCA5A5', opacity: ap(t, 2.0)}}>T đảo KHÔNG đối xứng → tăng gánh</div>
      <Card x={1340} y={150} w={530} a={ap(t, 0)} c={C.lv} title="ST↓ + T đảo không đối xứng">V5–V6 · DI · aVL</Card>
      <Card x={1340} y={330} w={530} a={ap(t, 4.0)} c={C.la} title="Dấu hỗ trợ">lớn nhĩ trái · trục lệch trái</Card>
      <Card x={1340} y={510} w={530} a={ap(t, 6.0)} c="#475569" title="Nguyên nhân">tăng huyết áp · hẹp van chủ · bệnh cơ tim phì đại</Card>
      <Memo x={60} y={780} w={1240} a={ap(t, 8.0)}>Đừng nhầm với thiếu máu cơ tim → <span style={{color: PEN}}>so ECG cũ · hỏi triệu chứng</span></Memo>
    </DeskBg>
  );
};

// ================= 9 · PHÌ ĐẠI THẤT PHẢI =================
const V1N: Lead = {p: 0.1, r: 0.25, s: -1.0, t: 0.15};
const V1R: Lead = {p: 0.18, q: 0, r: 1.0, s: -0.25, st: -0.06, t: -0.2};
const V6N: Lead = {p: 0.1, r: 1.3, s: -0.15, t: 0.3};
const V6R: Lead = {p: 0.1, r: 0.4, s: -0.9, t: 0.2};
const mix = (a: Lead, b: Lead, k: number): Lead => {
  const o: Lead = {};
  (['p', 'q', 'r', 's', 't', 'tw', 'tPos', 'st'] as const).forEach((n) => {
    const va = a[n], vb = b[n];
    if (va !== undefined || vb !== undefined) o[n] = (va ?? (n === 'tw' ? 0.055 : n === 'tPos' ? 0.27 : 0)) * (1 - k) + (vb ?? (n === 'tw' ? 0.055 : n === 'tPos' ? 0.27 : 0)) * k;
  });
  return o;
};
const RVH: React.FC = () => {
  const t = useT();
  const k1 = dp(t, 2.2, 1.2), k6 = dp(t, 4.2, 1.0);
  const ang = interpolate(t, [6.0, 7.2], [60, 125], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const cx = 1100, cy = 820, R = 120;
  const P = (d: number, r = R): [number, number] => [cx + r * Math.cos((d * Math.PI) / 180), cy + r * Math.sin((d * Math.PI) / 180)];
  const [vx, vy] = P(ang, R - 10);
  return (
    <DeskBg>
      <div style={{position: 'absolute', left: 60, top: 70, fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#F8FAFC'}}>Phì đại thất PHẢI → <span style={{color: '#60A5FA'}}>LẬT</span></div>
      <Box x={60} y={150} w={560} a={ap(t, 0)} rot={-0.5}><Strip L={mix(V1N, V1R, k1)} label="V1" h={330} base={200} /></Box>
      <Box x={650} y={150} w={560} a={ap(t, 0.2)} rot={0.5}><Strip L={mix(V6N, V6R, k6)} label="V6" h={330} base={200} /></Box>
      <div style={{position: 'absolute', left: 60, top: 500, width: 560, textAlign: 'center', fontFamily: FONT, fontSize: 34, fontWeight: 900, color: k1 > 0.5 ? '#60A5FA' : '#CBD5E1'}}>{k1 > 0.5 ? 'R > S  (R/S > 1) ✓' : 'bình thường: S > R'}</div>
      <div style={{position: 'absolute', left: 650, top: 500, width: 560, textAlign: 'center', fontFamily: FONT, fontSize: 34, fontWeight: 900, color: k6 > 0.5 ? '#60A5FA' : '#CBD5E1', opacity: ap(t, 4.0)}}>{k6 > 0.5 ? 'S sâu > 7 mm ✓' : 'bình thường: R > S'}</div>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <g opacity={ap(t, 6.0)}>
          <circle cx={cx} cy={cy} r={R} fill="rgba(255,255,255,0.04)" stroke="#334155" strokeWidth={3} />
          <path d={`M${cx},${cy} L${P(110)[0]},${P(110)[1]} A${R},${R} 0 0 1 ${P(180)[0]},${P(180)[1]} Z`} fill="rgba(59,130,246,0.35)" />
          <line x1={cx - R - 10} x2={cx + R + 10} y1={cy} y2={cy} stroke="#38BDF8" strokeWidth={2} />
          <line x1={cx} x2={cx} y1={cy - R - 10} y2={cy + R + 10} stroke="#38BDF8" strokeWidth={2} />
          <line x1={cx} y1={cy} x2={vx} y2={vy} stroke="#FC6255" strokeWidth={8} strokeLinecap="round" />
          <text x={cx - R - 20} y={cy + R + 20} textAnchor="end" fontFamily={MONO} fontSize={26} fill="#93C5FD">≥ +110°</text>
        </g>
      </svg>
      <div style={{position: 'absolute', left: 60, top: 640, width: 830, fontFamily: FONT, opacity: ap(t, 6.0)}}>
        <div style={{fontSize: 34, fontWeight: 900, color: '#F8FAFC'}}>Trục lệch phải ≥ +110°</div>
        <div style={{fontSize: 30, fontWeight: 700, color: '#FCA5A5', marginTop: 10}}>QRS &lt; 0,12 s — không phải block nhánh phải</div>
      </div>
      <div style={{position: 'absolute', left: 1280, top: 150, width: 240, height: 250, borderRadius: 14, background: '#FCFAF4', boxShadow: '0 12px 28px rgba(0,0,0,0.4)', overflow: 'hidden', opacity: ap(t, 0)}}>
        <svg viewBox="0 0 240 250" width={240} height={250}><Heart6 id="rvh" x={-8} y={4} s={0.46} prog={1} art={1} labels={false} zone="rv" zoneC={C.rv} zoneA={ap(t, 0.3, 0.6)} /></svg>
      </div>
      <Card x={1540} y={150} w={330} a={ap(t, 0.2)} c={C.rv} title="Vector">→ phải, ra trước</Card>
      <Card x={1280} y={430} w={590} a={ap(t, 2.0)} c={C.rv} title="V1: R > S hoặc R > 7 mm" />
      <Card x={1280} y={560} w={590} a={ap(t, 4.0)} c={C.rv} title="V5–V6: S sâu > 7 mm" />
      <Card x={1280} y={690} w={590} a={ap(t, 8.0)} c={C.ra} title="Dấu hỗ trợ">P phế · tăng gánh thất phải (V1–V4, DII, DIII, aVF)</Card>
    </DeskBg>
  );
};

// ================= 10 · NGUYÊN NHÂN & BẪY =================
const RVCause: React.FC = () => {
  const t = useT();
  const causes = ['Tăng áp phổi', 'Hẹp van hai lá', 'Thuyên tắc phổi', 'Bệnh phổi mạn', 'Tim bẩm sinh (Fallot, hẹp van ĐMP)'];
  const traps: [string, string][] = [['Phì đại thất phải', C.rv], ['NMCT thành sau', PEN], ['Block nhánh phải', '#D97706'], ['Hội chứng tiền kích thích (WPW)', '#7C3AED']];
  return (
    <DeskBg>
      <div style={{position: 'absolute', left: 60, top: 70, fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#F8FAFC'}}>Phì đại thất phải: nguyên nhân & bẫy</div>
      <div style={{position: 'absolute', left: 60, top: 150, width: 820, padding: '24px 30px', borderRadius: 20, background: '#FCFAF4', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', fontFamily: FONT, boxSizing: 'border-box', borderTop: `10px solid ${C.rv}`}}>
        <div style={{fontSize: 34, fontWeight: 900, color: C.rv}}>Nguyên nhân</div>
        {causes.map((c, i) => <div key={c} style={{fontSize: 32, fontWeight: 700, color: '#26221C', marginTop: 14, opacity: ap(t, 0.2 + i * 0.3, 0.4)}}>• {c}</div>)}
      </div>
      <div style={{position: 'absolute', left: 940, top: 150, width: 920, padding: '24px 30px', borderRadius: 20, background: '#FCFAF4', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', fontFamily: FONT, boxSizing: 'border-box', borderTop: `10px solid ${PEN}`, opacity: ap(t, 2.0)}}>
        <div style={{fontSize: 34, fontWeight: 900, color: PEN}}>⚠ R cao ở V1 — nghĩ đến:</div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 18}}>
          {traps.map(([n, c], i) => <div key={n} style={{padding: '12px 22px', borderRadius: 30, background: c, color: '#fff', fontSize: 30, fontWeight: 800, opacity: ap(t, 2.2 + i * 0.3, 0.4), transform: `scale(${0.8 + 0.2 * ap(t, 2.2 + i * 0.3, 0.4)})`}}>{n}</div>)}
        </div>
      </div>
      <Memo x={940} y={560} w={920} a={ap(t, 4.0)}>Luôn đọc kèm: <span style={{color: PEN}}>trục · độ rộng QRS · lâm sàng</span></Memo>
    </DeskBg>
  );
};

// ================= 11 · BẢNG 4 BUỒNG =================
const ROWS4: [string, string, string, string, string][] = [
  ['Lớn nhĩ PHẢI', 'P DII > 2,5 mm (P phế)', 'V1: dương đầu > 1,5 mm', 'CAO', C.ra],
  ['Lớn nhĩ TRÁI', 'P DII > 0,11 s, hai đỉnh', 'V1: âm cuối > 1 ô nhỏ', 'RỘNG', C.la],
  ['Phì đại thất TRÁI', 'S V1 + R V5/V6 ≥ 35 mm', 'tăng gánh V5–V6', 'CỘNG', C.lv],
  ['Phì đại thất PHẢI', 'V1: R/S > 1 (R > 7 mm)', 'trục ≥ +110°', 'LẬT', C.rv],
];
const Table4: React.FC = () => {
  const t = useT();
  const W0 = 1760, H0 = 820, TY = 150, RH = 150;
  const cols = [40, 470, 1020, 1480];
  return (
    <DeskBg>
      <div style={{position: 'absolute', left: 80, top: 100, width: W0, height: H0, boxShadow: '0 30px 60px rgba(0,0,0,0.45)', transform: `rotate(-0.4deg) translateY(${(1 - ap(t, -1, 0.7)) * 900}px)`}}>
        <svg viewBox={`0 0 ${W0} ${H0}`} width={W0} height={H0} style={{position: 'absolute', inset: 0}}>
          <Pink w={W0} h={H0} mm={10} />
          <RPath d={`M40,${TY - 8} L${W0 - 40},${TY - 10}`} stroke={INK} sw={3} rough={1.2} seed={5} prog={dp(t, 0, 0.7)} />
          {ROWS4.map((r, i) => {
            const k = dp(t, 2 * (i + 1) - 0.2, 0.6);
            const y = TY + i * RH;
            return (
              <g key={i}>
                <rect x={30} y={y + 10} width={(W0 - 60) * k} height={RH - 20} rx={14} fill={r[4]} opacity={0.14} />
                <RPath d={`M40,${y + RH} L${W0 - 40},${y + RH + (i % 2 ? 2 : -2)}`} stroke="#3B3B48" sw={1.6} rough={1.6} seed={11 + i} prog={k} />
                <RPath d={`M${cols[3] + 40},${y + RH / 2 + 4} L${cols[3] + 54},${y + RH / 2 + 22} L${cols[3] + 82},${y + RH / 2 - 16}`} stroke={PEN} sw={5} rough={0.9} seed={40 + i} prog={dp(t, 2 * (i + 1) + 0.8, 0.3)} />
              </g>
            );
          })}
        </svg>
        <div style={{position: 'absolute', left: 40, top: 40, fontFamily: FONT, fontSize: 46, fontWeight: 900, color: INK}}>BẢNG 4 BUỒNG TIM</div>
        <div style={{position: 'absolute', left: 620, top: 50, fontFamily: HAND, fontSize: 38, color: PEN, transform: 'rotate(-3deg)', opacity: ap(t, 0.6)}}>Nhĩ xem P · Thất xem QRS</div>
        {['BUỒNG', 'TIÊU CHUẨN CHÍNH', 'DẤU KÈM', 'NHỚ'].map((h, j) => <div key={h} style={{position: 'absolute', left: cols[j], top: TY - 44, fontFamily: FONT, fontSize: 22, fontWeight: 800, letterSpacing: 1.5, color: '#5B4A47'}}>{h}</div>)}
        {ROWS4.map((r, i) => {
          const y = TY + i * RH + 46;
          return [r[0], r[1], r[2], r[3]].map((txt, j) => {
            const a = ap(t, 2 * (i + 1) + j * 0.2, 0.4);
            return <div key={i + '-' + j} style={{position: 'absolute', left: cols[j] + (j === 3 ? 100 : 0), top: y - (j === 3 ? 10 : 0), fontFamily: j === 3 ? FONT : FONT, fontSize: j === 0 ? 36 : j === 3 ? 50 : 30, fontWeight: j === 0 || j === 3 ? 900 : 700, color: j === 0 || j === 3 ? r[4] : INK, opacity: a, whiteSpace: 'nowrap'}}>{txt}</div>;
          });
        })}
      </div>
    </DeskBg>
  );
};

// ================= 12 · THỰC HÀNH =================
const LVH12: Record<string, Lead> = {
  I: {r: 1.2, s: -0.1, st: -0.06, t: -0.15}, II: {r: 1.0, s: -0.2, t: 0.15}, III: {r: 0.3, s: -0.6, t: 0.15},
  aVR: {p: -0.1, q: 0.05, r: -1.0, s: 0.1, t: 0.1}, aVL: {r: 1.1, s: -0.1, st: -0.06, t: -0.15}, aVF: {r: 0.5, s: -0.4, t: 0.12},
  V1: {r: 0.2, s: -1.6, st: 0.1, t: 0.3}, V2: {r: 0.3, s: -2.1, st: 0.15, t: 0.4}, V3: {r: 0.6, s: -1.5, st: 0.08, t: 0.3},
  V4: {r: 1.6, s: -0.6, t: 0.1}, V5: {r: 2.4, s: -0.15, st: -0.12, t: -0.3, tw: 0.07}, V6: {r: 1.9, s: -0.1, st: -0.1, t: -0.25, tw: 0.07},
};
const Practice: React.FC = () => {
  const t = useT();
  const S = 0.78;
  const hl: Record<string, number> = {};
  if (t > 1.8 && t < 4.2) {hl.V1 = ap(t, 2, 0.4); hl.V5 = ap(t, 2.2, 0.4);}
  if (t > 3.8 && t < 6.2) {hl.V5 = ap(t, 4, 0.4); hl.V6 = ap(t, 4.2, 0.4);}
  const REP: [string, string, number, string][] = [
    ['CỘNG', 'S V1 16 + R V5 24 = 40 mm ≥ 35', 2, C.lv], ['TĂNG GÁNH', 'V5–V6: ST↓, T đảo không đối xứng', 4, C.lv], ['NHĨ TRÁI', 'V1: âm cuối P > 1 ô nhỏ', 6, C.la],
  ];
  return (
    <DeskBg>
      <div style={{position: 'absolute', left: 50, top: 58, fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#F8FAFC'}}>Thực hành · BN tăng huyết áp lâu năm</div>
      <div style={{position: 'absolute', left: 40, top: 130, width: 1500, height: 760, transform: `scale(${S}) rotate(-0.5deg)`, transformOrigin: '0 0', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
        <Sheet leads={LVH12} hl={hl} />
      </div>
      <div style={{position: 'absolute', left: 60, top: 760, opacity: ap(t, 6.0), transform: `translateY(${(1 - ap(t, 6)) * 30}px)`, display: 'flex', alignItems: 'center', gap: 16}}>
        <MiniP set={LAE_SET.v1} norm={N_V1} a={ap(t, 6.0, 0.8)} label="V1 · P" c={C.la} />
      </div>
      <div style={{position: 'absolute', left: 1260, top: 120, width: 610, height: 640, background: '#FDFDF8', backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 119px, #BFD7EA 119px 121px)', boxShadow: '0 20px 40px rgba(0,0,0,0.45)', transform: 'rotate(1deg)'}}>
        <div style={{position: 'absolute', left: 24, top: 20, fontFamily: FONT, fontSize: 30, fontWeight: 800, color: PEN}}>PHIẾU ĐỌC ECG</div>
        {REP.map(([k, v, s, c], i) => {
          const a = ap(t, s, 0.5);
          return (
            <div key={k} style={{position: 'absolute', left: 24, top: 90 + i * 120, width: 570, opacity: a, transform: `translateX(${(1 - a) * 20}px)`, fontFamily: FONT}}>
              <div style={{fontSize: 24, fontWeight: 800, color: c, letterSpacing: 1}}>{k} <span style={{color: '#16A34A'}}>✓</span></div>
              <div style={{fontSize: 27, fontWeight: 600, color: '#1F2937', lineHeight: 1.25}}>{v}</div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 500, top: 800, width: 1370, padding: '16px 26px', borderRadius: 14, background: '#16A34A', color: '#fff', fontFamily: FONT, fontSize: 32, fontWeight: 800, opacity: ap(t, 8.0), transform: `scale(${0.92 + 0.08 * ap(t, 8)})`, transformOrigin: 'left center', boxSizing: 'border-box', boxShadow: '0 12px 28px rgba(0,0,0,0.4)'}}>KẾT LUẬN: phì đại thất trái dạng tăng gánh + lớn nhĩ trái → siêu âm tim</div>
    </DeskBg>
  );
};

// ================= 13 · TÓM TẮT =================
const TAKE5: [string, string, string, string][] = [
  ['Nhĩ xem ', 'P', ' (DII, V1) · Thất xem QRS', '#14B8A6'],
  ['Lớn nhĩ phải ', 'CAO', ' > 2,5 mm · lớn nhĩ trái RỘNG, hai đỉnh', C.ra],
  ['Phì đại thất trái ', 'CỘNG', ': S V1 + R V5 ≥ 35 mm (7 ô lớn)', C.lv],
  ['Phì đại thất phải ', 'LẬT', ': V1 R > S · trục lệch phải', C.rv],
  ['ECG gợi ý — ', 'siêu âm tim', ' khẳng định', '#22C55E'],
];
const Summary: React.FC = () => {
  const t = useT();
  const beat = useBeat();
  return (
    <DeskBg>
      <div style={{position: 'absolute', left: 70, top: 90, width: 1250, height: 830, background: '#FDFDF8', backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 109px, #BFD7EA 109px 111px)', boxShadow: '0 30px 60px rgba(0,0,0,0.45)', transform: `rotate(-0.8deg) translateY(${(1 - ap(t, 0, 0.8)) * 900}px)`}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, marginLeft: 100, background: '#F4A3A3'}} />
        <div style={{position: 'absolute', left: 130, top: 26, fontFamily: FONT, fontSize: 50, fontWeight: 800, color: PEN, letterSpacing: 1}}>5 ĐIỀU CẦN NHỚ</div>
        <svg viewBox="0 0 1250 830" width={1250} height={830} style={{position: 'absolute', inset: 0}}>
          <RPath d="M130,96 C330,88 520,102 640,92" stroke={PEN} sw={4} rough={1.5} seed={4} prog={dp(t, 0.5, 0.8)} />
          {TAKE5.map((_, i) => {
            const y = 168 + i * 110;
            return <RPath key={i} d={`M34,${y + 8} L48,${y + 26} L78,${y - 14}`} stroke={PEN} sw={5} rough={0.9} seed={70 + i} prog={dp(t, 2 * (i + 1) + 0.6, 0.4)} />;
          })}
        </svg>
        {TAKE5.map((x, i) => {
          const a = ap(t, 2 * (i + 1), 0.5);
          return (
            <div key={i} style={{position: 'absolute', left: 130, top: 140 + i * 110, width: 1100, fontFamily: FONT, fontSize: 34, fontWeight: 600, color: '#1F2937', opacity: a, transform: `translateX(${(1 - a) * 20}px)`, whiteSpace: 'nowrap'}}>
              <span style={{color: x[3], fontWeight: 900}}>{i + 1}. </span>{x[0]}<b style={{color: x[3]}}>{x[1]}</b>{x[2]}
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 130, top: 715, fontFamily: HAND, fontSize: 52, color: '#1F2937', opacity: ap(t, 12.0), transform: `rotate(-2deg) scale(${0.9 + 0.1 * ap(t, 12.0)})`}}>Cảm ơn bạn đã theo dõi! ♥</div>
      </div>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="sum3" x={1330} y={200} s={1.1} prog={dp(t, 0.6, 1.2)} art={1} labels={false} beat={beat} />
      </svg>
    </DeskBg>
  );
};

const SC: React.FC[] = [Cover, Principle, NormalP, RAE, LAE, CompareAtria, Sokolow, Cornell, Strain, RVH, RVCause, Table4, Practice, Summary];
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
