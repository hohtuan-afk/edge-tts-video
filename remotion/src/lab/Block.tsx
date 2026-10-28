// BÀI 3: KHOẢNG PR & BLOCK NHĨ THẤT TRÊN ĐIỆN TÂM ĐỒ — Tìm P · Đo PR · Xem RƠI
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, Easing, staticFile, useCurrentFrame} from 'remotion';
import data from '../data.json';
import keys from './block_keys.json';
import stations from './block_stations.json';
import {TimeMap, CapCtx, FONT, useT} from '../lib';
import {Caption, Progress} from '../Main';
import {MONO} from './Lab';
import {Fade, SeriesTag} from './Demo';
import {Heart6, SC as HSC, OX as HOX, OY as HOY} from '../wb/heart6';
import {HAND, RPath} from '../wb/wb';

const ap = (t: number, s: number, d = 0.6) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1)});
const dp = (t: number, s: number, d = 0.8) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
const useBeat = () => Math.max(0, Math.sin((useCurrentFrame() / 30) * 2 * Math.PI * 1.1)) ** 4;
const INK = '#1E1E24', PEN = '#C81E3A';
const CP = '#8B5CF6', CQ = '#DC2626', CPR = '#F59E0B';
const DeskBg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 40% 35%, #3a4a52, #1d272c 75%)'}}>
    <AbsoluteFill style={{background: 'repeating-linear-gradient(95deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 9px)'}} />
    {children}
  </AbsoluteFill>
);
const Pink: React.FC<{w: number; h: number; mm: number}> = ({w, h, mm}) => {
  const g: React.ReactNode[] = [];
  for (let i = 0; i <= w / mm; i++) g.push(<line key={'v' + i} x1={i * mm} x2={i * mm} y1={0} y2={h} stroke={i % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={i % 5 ? 0.8 : 1.8} />);
  for (let j = 0; j <= h / mm; j++) g.push(<line key={'h' + j} x1={0} x2={w} y1={j * mm} y2={j * mm} stroke={j % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={j % 5 ? 0.8 : 1.8} />);
  return <g><rect width={w} height={h} fill="#FFF6F2" />{g}</g>;
};
const Memo: React.FC<{x: number; y: number; w: number; a: number; children: React.ReactNode}> = ({x, y, w, a, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, padding: '16px 22px', borderRadius: 16, background: '#FFF4C2', border: '2px solid #E8C547', opacity: a, transform: `translateY(${(1 - a) * 20}px)`, boxSizing: 'border-box', boxShadow: '0 12px 28px rgba(0,0,0,0.3)'}}>
    <div style={{fontFamily: FONT, fontSize: 20, fontWeight: 800, letterSpacing: 2, color: '#8A6D00'}}>GHI NHỚ</div>
    <div style={{fontFamily: FONT, fontSize: 32, fontWeight: 800, color: '#26221C', marginTop: 4, lineHeight: 1.3}}>{children}</div>
  </div>
);
const Card: React.FC<{x: number; y: number; w: number; a: number; c: string; title: React.ReactNode; children?: React.ReactNode}> = ({x, y, w, a, c, title, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, padding: '16px 22px', borderRadius: 16, background: '#FCFAF4', borderLeft: `10px solid ${c}`, boxShadow: '0 14px 30px rgba(0,0,0,0.35)', opacity: a, transform: `translateX(${(1 - a) * 40}px)`, boxSizing: 'border-box', fontFamily: FONT}}>
    <div style={{fontSize: 30, fontWeight: 800, color: c, lineHeight: 1.2}}>{title}</div>
    {children && <div style={{fontSize: 27, fontWeight: 600, color: '#26221C', marginTop: 6, lineHeight: 1.3}}>{children}</div>}
  </div>
);
const Head: React.FC<{t: number; children: React.ReactNode}> = ({t, children}) => (
  <div style={{position: 'absolute', left: 60, top: 64, fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#F8FAFC', opacity: ap(t, -1)}}>{children}</div>
);

// ================= mô hình dải nhịp: danh sách sóng P, mỗi P có PR (hoặc null = không dẫn) =================
type Ev = {p: number; pr: number | null; wide?: boolean; pAmp?: number};
const g = (x: number, mu: number, w: number, a: number) => a * Math.exp(-((x - mu) ** 2) / (2 * w * w));
const qrsN = (x: number) => g(x, -0.03, 0.009, -0.08) + g(x, 0, 0.011, 1.15) + g(x, 0.026, 0.01, -0.25) + g(x, 0.24, 0.045, 0.3);
const qrsW = (x: number) => g(x, -0.02, 0.02, 0.15) + g(x, 0.03, 0.025, 1.0) + g(x, 0.09, 0.03, -0.35) + g(x, 0.3, 0.06, -0.35);
const sig = (evs: Ev[], extraQ: {t: number; wide?: boolean}[] = []) => (T: number) => {
  let v = 0;
  for (const e of evs) {
    v += g(T, e.p + 0.05, 0.022, e.pAmp ?? 0.14);
    if (e.pr !== null) v += (e.wide ? qrsW : qrsN)(T - (e.p + e.pr));
  }
  for (const q of extraQ) v += (q.wide ? qrsW : qrsN)(T - q.t);
  return v;
};
const evSeq = (start: number, pp: number, prs: (number | null)[], wide = false): Ev[] => prs.map((pr, i) => ({p: start + i * pp, pr, wide}));
type BR = {a: number; b: number; y: number; c: string; label?: string; t0: number; up?: boolean};
const Strip: React.FC<{f: (T: number) => number; w: number; h: number; mm: number; base: number; label: string; prog?: number; dur?: number; children?: (X: (T: number) => number, Y: (v: number) => number) => React.ReactNode}> = ({f, w, h, mm, base, label, prog = 1, dur, children}) => {
  const pxs = 25 * mm, pxmv = 10 * mm, x0 = 20;
  const X = (T: number) => x0 + T * pxs, Y = (v: number) => base - v * pxmv;
  const D = dur ?? (w - 40) / pxs;
  const pts: string[] = [];
  for (let T = 0; T <= D; T += 0.003) pts.push(`${X(T).toFixed(1)},${Y(f(T)).toFixed(1)}`);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{display: 'block'}}>
      <Pink w={w} h={h} mm={mm} />
      <text x={16} y={38} fontFamily={MONO} fontSize={30} fontWeight={700} fill={INK}>{label}</text>
      <polyline points={pts.join(' ')} fill="none" stroke={INK} strokeWidth={3} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
      {children?.(X, Y)}
    </svg>
  );
};
const Bracket: React.FC<{x0: number; x1: number; y: number; c: string; label?: string; a: number; up?: boolean; size?: number}> = ({x0, x1, y, c, label, a, up, size = 24}) => {
  const k = up ? -1 : 1;
  return (
    <g opacity={a}>
      <path d={`M${x0},${y - 10 * k} v${10 * k} H${x0 + (x1 - x0) * Math.min(1, a * 1.2)} v${-10 * k}`} fill="none" stroke={c} strokeWidth={4} />
      {label && <text x={(x0 + x1) / 2} y={y + (up ? -16 : 34)} textAnchor="middle" fontFamily={MONO} fontSize={size} fontWeight={700} fill={c}>{label}</text>}
    </g>
  );
};
const Drop: React.FC<{x: number; y: number; a: number}> = ({x, y, a}) => (
  <g opacity={a} transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * a})`}>
    <circle r={24} fill={PEN} />
    <path d="M-10,-10 L10,10 M10,-10 L-10,10" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
  </g>
);

// ================= hệ dẫn truyền trên ảnh tim (toạ độ ảnh 1264×1264) =================
const COND = {sa: [395, 440], av: [600, 650], his: [645, 715], rb: [[630, 760], [575, 880], [560, 990]], lb: [[680, 760], [760, 880], [800, 1010]]};
const h2s = (x: number, y: number, s: number, p: number[]): [number, number] => [x + s * (HOX + p[0] * HSC), y + s * (HOY + p[1] * HSC)];
const Conduction: React.FC<{x: number; y: number; s: number; t: number; t0: number; period?: number; block?: 'none' | 'av'}> = ({x, y, s, t, t0, period = 2.4, block = 'none'}) => {
  const P = (p: number[]) => h2s(x, y, s, p);
  const sa = P(COND.sa), av = P(COND.av), his = P(COND.his);
  const rb = COND.rb.map(P), lb = COND.lb.map(P);
  const a = ap(t, t0, 0.5);
  const ph = ((t - t0) % period + period) % period / period; // 0..1
  // pha: 0–0.25 nhĩ (SA→AV), 0.25–0.55 dừng ở nút AV, 0.55–0.8 His→nhánh
  let dot: [number, number] | null = null, glowAV = 0;
  if (ph < 0.25) {const k = ph / 0.25; dot = [sa[0] + (av[0] - sa[0]) * k, sa[1] + (av[1] - sa[1]) * k];}
  else if (ph < 0.55) {dot = av; glowAV = 1;}
  else if (ph < 0.8 && block === 'none') {const k = (ph - 0.55) / 0.25; dot = [his[0] + (lb[2][0] - his[0]) * k, his[1] + (lb[2][1] - his[1]) * k];}
  const path = (pts: [number, number][]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  return (
    <g opacity={a}>
      <path d={path([sa, av])} stroke="#FDE047" strokeWidth={5} strokeDasharray="10 8" fill="none" opacity={0.85} />
      <path d={path([av, his])} stroke="#FDE047" strokeWidth={8} fill="none" />
      <path d={path([his, ...rb])} stroke="#FDE047" strokeWidth={6} fill="none" />
      <path d={path([his, ...lb])} stroke="#FDE047" strokeWidth={6} fill="none" />
      <circle cx={sa[0]} cy={sa[1]} r={13} fill="#FDE047" stroke="#1F2937" strokeWidth={3} />
      <circle cx={av[0]} cy={av[1]} r={15 + 6 * glowAV} fill={glowAV ? '#F59E0B' : '#FDE047'} stroke="#1F2937" strokeWidth={3} />
      {dot && <circle cx={dot[0]} cy={dot[1]} r={11} fill="#fff" stroke="#F59E0B" strokeWidth={5} />}
    </g>
  );
};
const CondLabels: React.FC<{x: number; y: number; s: number; a: number}> = ({x, y, s, a}) => {
  const P = (p: number[]) => h2s(x, y, s, p);
  const L: [number[], string, number, number][] = [[COND.sa, 'nút xoang', -190, -20], [COND.av, 'nút nhĩ thất', -230, 10], [COND.lb[1], 'His – Purkinje', 30, 10]];
  return (
    <g opacity={a}>
      {L.map(([p, n, dx, dy]) => {
        const [px, py] = P(p);
        return (
          <g key={n}>
            <line x1={px} y1={py} x2={px + dx + (dx < 0 ? 170 : 0)} y2={py + dy} stroke="#fff" strokeWidth={2} />
            <rect x={px + dx - 8} y={py + dy - 26} width={n.length * 15 + 16} height={38} rx={19} fill="#111827" opacity={0.85} />
            <text x={px + dx} y={py + dy + 2} fontFamily={FONT} fontSize={24} fontWeight={800} fill="#FDE047">{n}</text>
          </g>
        );
      })}
    </g>
  );
};

// ================= THANH TRẠM =================
const ST7 = ['PR BÌNH THƯỜNG', 'PR NGẮN', 'BLOCK ĐỘ I', 'MOBITZ I', 'MOBITZ II · 2:1', 'BLOCK ĐỘ III', 'ÔN TẬP'];
const STC = ['#14B8A6', '#0EA5E9', '#F59E0B', '#F97316', '#DC2626', '#7C3AED', '#22C55E'];
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
const MANTRA: [string, string, string][] = [['Tìm', 'P', CP], ['Đo', 'PR', CPR], ['Xem', 'RƠI', PEN]];
const Cover: React.FC = () => {
  const t = useT();
  const beat = useBeat();
  const HX = 1180, HY = 130, HS = 1.25;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 40%, #1B2E3A, #0B1218 75%)'}}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="cvb" x={HX} y={HY} s={HS} prog={dp(t, 0.2, 1.2)} art={1} labels={false} beat={beat} />
        <Conduction x={HX} y={HY} s={HS} t={useCurrentFrame() / 30} t0={1.0} />
      </svg>
      <div style={{position: 'absolute', left: 110, top: 140, fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: 4, color: '#5EEAD4', opacity: ap(t, 0.2)}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 3</div>
      <div style={{position: 'absolute', left: 106, top: 186, width: 1050, fontFamily: FONT, fontSize: 84, fontWeight: 800, lineHeight: 1.06, color: '#F8FAFC', opacity: ap(t, 0.4), transform: `translateY(${(1 - ap(t, 0.4)) * 20}px)`}}>
        Khoảng PR &amp;<br /><span style={{color: '#FBBF24'}}>Block nhĩ thất</span>
      </div>
      <div style={{position: 'absolute', left: 112, top: 372, fontFamily: FONT, fontSize: 30, fontWeight: 600, color: '#CBD5E1', opacity: ap(t, 0.8)}}>trên điện tâm đồ</div>
      <div style={{position: 'absolute', left: 110, top: 460, display: 'flex', gap: 18, alignItems: 'center'}}>
        {MANTRA.map(([a, b, c], i) => {
          const k = ap(t, 2.0 + i * 0.4, 0.4);
          return (
            <React.Fragment key={b}>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 10, padding: '12px 26px', borderRadius: 18, background: 'rgba(255,255,255,0.06)', border: `3px solid ${c}`, opacity: k, transform: `scale(${0.85 + 0.15 * k})`, fontFamily: FONT}}>
                <span style={{fontSize: 32, fontWeight: 600, color: '#CBD5E1'}}>{a}</span>
                <span style={{fontSize: 50, fontWeight: 900, color: c}}>{b}</span>
              </div>
              {i < 2 && <span style={{fontSize: 40, color: '#64748B', opacity: k}}>→</span>}
            </React.Fragment>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 110, top: 620, width: 960, padding: '20px 28px', borderRadius: 18, background: '#FFF4C2', border: '2px solid #E8C547', opacity: ap(t, 4.0), transform: `translateY(${(1 - ap(t, 4.0)) * 20}px)`, fontFamily: FONT, boxSizing: 'border-box'}}>
        <div style={{fontSize: 20, fontWeight: 800, letterSpacing: 2, color: '#8A6D00'}}>MỤC TIÊU</div>
        <div style={{fontSize: 32, fontWeight: 800, color: '#26221C', marginTop: 4, lineHeight: 1.3}}>Nhận diện đúng từng mức độ <span style={{color: PEN}}>block nhĩ thất</span> chỉ bằng dải nhịp.</div>
      </div>
      <div style={{position: 'absolute', left: 112, top: 820, fontFamily: FONT, fontSize: 20, color: '#94A3B8', opacity: ap(t, 1.0)}}>Nguồn: 2018 ACC/AHA/HRS Bradycardia & Conduction Delay · 2021 ESC Cardiac Pacing · AHA/ACCF/HRS ECG Recommendations · LITFL</div>
    </AbsoluteFill>
  );
};

// ================= 1 · KHOẢNG PR LÀ GÌ =================
const PRScene: React.FC = () => {
  const t = useT();
  const rt = useCurrentFrame() / 30;
  const HX = 20, HY = 110, HS = 1.15;
  const mm = 40, W = 1000, Hh = 560, B = 400;
  const X = (x: number) => 40 + (x + 0.22) * 1550, Yv = (v: number) => B - v * 10 * mm * 0.5;
  const f = (x: number) => g(x, -0.15, 0.022, 0.14) + qrsN(x);
  const pts: string[] = [];
  for (let x = -0.22; x <= 0.4; x += 0.002) pts.push(`${X(x).toFixed(1)},${Yv(f(x)).toFixed(1)}`);
  const seg: [number, number, string, string, number][] = [[-0.175, -0.115, '#38BDF8', 'nhĩ', 1.0], [-0.115, -0.065, '#F59E0B', 'nút nhĩ thất', 2.0], [-0.065, -0.04, '#22C55E', 'His–Purkinje', 1.4]];
  return (
    <DeskBg>
      <Head t={t}>Khoảng PR: từ đầu P đến đầu QRS</Head>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="prh" x={HX} y={HY} s={HS} prog={1} art={1} labels={false} />
        <Conduction x={HX} y={HY} s={HS} t={rt} t0={0} />
        <CondLabels x={HX} y={HY} s={HS} a={ap(t, 2.0)} />
      </svg>
      <div style={{position: 'absolute', left: 860, top: 140, width: W, height: Hh, borderRadius: 14, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.45)', opacity: ap(t, -1)}}>
        <svg viewBox={`0 0 ${W} ${Hh}`} width={W} height={Hh}>
          <Pink w={W} h={Hh} mm={mm / 2} />
          <text x={20} y={44} fontFamily={MONO} fontSize={34} fontWeight={700} fill={INK}>DII · phóng to</text>
          {seg.map(([a, b, c, n, s0], i) => (
            <g key={n} opacity={ap(t, s0 + (i === 0 ? 0 : 0), 0.5)}>
              <rect x={X(a)} y={B - 120} width={X(b) - X(a)} height={160} fill={c} opacity={0.22} />
              <text x={(X(a) + X(b)) / 2} y={B - 140 - i * 34} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={800} fill={c}>{n}</text>
            </g>
          ))}
          <polyline points={pts.join(' ')} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <Bracket x0={X(-0.175)} x1={X(-0.04)} y={B + 70} c={CPR} label="PR 0,12 – 0,20 s" a={ap(t, 6.0)} size={34} />
          <circle cx={X(-0.175)} cy={B} r={9} fill={CP} opacity={ap(t, 0)} />
          <circle cx={X(-0.04)} cy={B} r={9} fill={CQ} opacity={ap(t, 0)} />
          <text x={X(-0.175) - 10} y={B + 40} textAnchor="end" fontFamily={FONT} fontSize={26} fontWeight={800} fill={CP} opacity={ap(t, 0)}>đầu P</text>
          <text x={X(-0.04) + 40} y={B + 40} fontFamily={FONT} fontSize={26} fontWeight={800} fill={CQ} opacity={ap(t, 0)}>đầu QRS</text>
        </svg>
      </div>
      <Card x={860} y={730} w={480} a={ap(t, 4.0)} c="#F59E0B" title="Chậm nhất: nút nhĩ thất">“cổng” giữa nhĩ và thất</Card>
      <Memo x={1370} y={730} w={490} a={ap(t, 6.0)}>PR = <span style={{color: PEN}}>3 – 5 ô nhỏ</span></Memo>
    </DeskBg>
  );
};

// ================= 2 · CÁCH TIẾP CẬN =================
const SINUS = evSeq(0.15, 0.8, [0.16, 0.16, 0.16, 0.16, 0.16, 0.16, 0.16]);
const Approach3: React.FC = () => {
  const t = useT();
  const W = 1180, H = 420, mm = 8;
  const f = sig(SINUS);
  const steps: [string, string, number, string][] = [['Tìm P', 'mỗi P có QRS theo sau?', 0, CP], ['Đo PR', 'cố định hay thay đổi?', 2, CPR], ['Xem RƠI', 'có P không dẫn?', 4, PEN]];
  return (
    <DeskBg>
      <Head t={t}>Tiếp cận 3 bước</Head>
      <div style={{position: 'absolute', left: 60, top: 140, width: W, height: H, borderRadius: 14, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
        <Strip f={f} w={W} h={H} mm={mm} base={280} label="DII" prog={dp(t, -1, 1)}>
          {(X, Y) => (
            <g>
              {SINUS.map((e, i) => (
                <g key={i}>
                  <circle cx={X(e.p + 0.05)} cy={Y(0.14)} r={16} fill="none" stroke={CP} strokeWidth={4} opacity={ap(t, 0.2 + i * 0.1, 0.3)} />
                  <path d={`M${X(e.p + 0.05)},${Y(0.14) - 22} Q${X(e.p + 0.12)},${Y(0.9)} ${X(e.p + 0.16)},${Y(1.15) - 8}`} fill="none" stroke={CP} strokeWidth={2.5} strokeDasharray="6 5" opacity={ap(t, 0.6 + i * 0.1, 0.3)} />
                  <Bracket x0={X(e.p + 0.028)} x1={X(e.p + 0.16 - 0.03)} y={Y(0) + 40} c={CPR} label="0,16" a={ap(t, 2.2 + i * 0.12, 0.3)} size={20} />
                </g>
              ))}
              {SINUS.slice(0, -1).map((e, i) => (
                <g key={'pp' + i} opacity={ap(t, 6.0 + i * 0.12, 0.3)}>
                  <path d={`M${X(e.p + 0.05)},${Y(0.14) - 60} v-10 H${X(SINUS[i + 1].p + 0.05)} v10`} fill="none" stroke="#0EA5E9" strokeWidth={4} />
                </g>
              ))}
            </g>
          )}
        </Strip>
      </div>
      {steps.map(([a, b, s, c], i) => (
        <div key={a} style={{position: 'absolute', left: 60 + i * 400, top: 600, width: 380, padding: '20px 24px', borderRadius: 18, background: '#FCFAF4', borderTop: `10px solid ${c}`, boxShadow: '0 14px 30px rgba(0,0,0,0.35)', opacity: ap(t, s), transform: `translateY(${(1 - ap(t, s)) * 30}px)`, fontFamily: FONT, boxSizing: 'border-box'}}>
          <div style={{fontSize: 40, fontWeight: 900, color: c}}>{i + 1}. {a}</div>
          <div style={{fontSize: 28, fontWeight: 700, color: '#26221C', marginTop: 6}}>{b}</div>
        </div>
      ))}
      <Card x={1290} y={140} w={570} a={ap(t, 6.0)} c="#0EA5E9" title="Mẹo: compa đo PP">P “đi đều như nhịp trống” — kể cả khi ẩn trong sóng T</Card>
      <Memo x={1290} y={400} w={570} a={ap(t, 0.5)}>Tìm P → Đo PR → Xem RƠI</Memo>
    </DeskBg>
  );
};

// ================= 3 · PR NGẮN =================
const ShortPR: React.FC = () => {
  const t = useT();
  const mm = 40, W = 1000, Hh = 520, B = 360;
  const X = (x: number) => 60 + (x + 0.2) * 25 * mm, Yv = (v: number) => B - v * 10 * mm * 0.5;
  const norm = (x: number) => g(x, -0.15, 0.022, 0.14) + qrsN(x);
  // WPW: P sớm sát QRS, delta (dốc chậm) + QRS rộng
  const wpw = (x: number) => g(x, -0.1, 0.022, 0.14) + (x > -0.06 && x < 0 ? 0.25 * (x + 0.06) / 0.06 : 0) + g(x, 0.015, 0.02, 0.85) + g(x, 0.07, 0.02, -0.2) + g(x, 0.27, 0.05, -0.15) - (x >= 0 ? 0 : 0);
  const line = (fn: (x: number) => number) => {
    const o: string[] = [];
    for (let x = -0.2; x <= 0.5; x += 0.002) o.push(`${X(x).toFixed(1)},${Yv(fn(x)).toFixed(1)}`);
    return o.join(' ');
  };
  return (
    <DeskBg>
      <Head t={t}>PR ngắn &lt; 0,12 s</Head>
      <div style={{position: 'absolute', left: 60, top: 140, width: W, height: Hh, borderRadius: 14, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
        <svg viewBox={`0 0 ${W} ${Hh}`} width={W} height={Hh}>
          <Pink w={W} h={Hh} mm={mm / 2} />
          <text x={20} y={44} fontFamily={MONO} fontSize={32} fontWeight={700} fill={INK}>Tiền kích thích (WPW)</text>
          <polyline points={line(norm)} fill="none" stroke="#94A3B8" strokeWidth={4} strokeDasharray="10 8" opacity={ap(t, 0.2)} />
          <polygon points={`${X(-0.06)},${Yv(0)} ${X(0)},${Yv(0.25)} ${X(0)},${Yv(0)}`} fill="#FACC15" opacity={0.55 * ap(t, 2.0)} />
          <polyline points={line(wpw)} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dp(t, -0.5, 1)} />
          <Bracket x0={X(-0.125)} x1={X(-0.06)} y={B + 70} c={CPR} label="PR ngắn" a={ap(t, 2.0)} size={28} />
          <text x={X(-0.03) - 10} y={Yv(0.3) - 20} textAnchor="end" fontFamily={HAND} fontSize={38} fill="#B45309" opacity={ap(t, 2.4)}>sóng delta</text>
          <Bracket x0={X(-0.06)} x1={X(0.11)} y={B + 115} c={CQ} label="QRS rộng" a={ap(t, 2.8)} size={28} />
          <text x={W - 20} y={Hh - 16} textAnchor="end" fontFamily={FONT} fontSize={22} fontWeight={700} fill="#64748B" opacity={ap(t, 0.2)}>– – – nhát bình thường</text>
        </svg>
      </div>
      <Card x={1100} y={140} w={760} a={ap(t, 2.0)} c="#0EA5E9" title="Tiền kích thích (WPW)">PR ngắn + sóng delta + QRS rộng</Card>
      <Card x={1100} y={320} w={760} a={ap(t, 4.0)} c="#0EA5E9" title="Đường phụ “né” nút nhĩ thất">→ thất được kích hoạt sớm</Card>
      <Card x={1100} y={500} w={760} a={ap(t, 6.0)} c="#7C3AED" title="Nhịp bộ nối">P âm ở DII, DIII, aVF (hoặc ẩn trong QRS)</Card>
      <div style={{position: 'absolute', left: 60, top: 690, width: 1000, height: 220, borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', opacity: ap(t, 6.0)}}>
        <Strip f={sig(evSeq(0.1, 0.9, [0.08, 0.08, 0.08, 0.08, 0.08]).map((e) => ({...e, pAmp: -0.12})))} w={1000} h={220} mm={8} base={150} label="DII · nhịp bộ nối (P âm)" />
      </div>
    </DeskBg>
  );
};

// ================= 4 · BLOCK ĐỘ I =================
const AV1 = evSeq(0.1, 0.92, [0.28, 0.28, 0.28, 0.28, 0.28, 0.28]);
const AV1L = evSeq(0.1, 0.8, [0.44, 0.44, 0.44, 0.44, 0.44, 0.44, 0.44]);
const Block1: React.FC = () => {
  const t = useT();
  const W = 1180;
  return (
    <DeskBg>
      <Head t={t}>Block nhĩ thất độ I</Head>
      <div style={{position: 'absolute', left: 60, top: 140, width: W, height: 380, borderRadius: 14, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
        <Strip f={sig(AV1)} w={W} h={380} mm={8} base={250} label="DII" prog={dp(t, -1, 1)}>
          {(X, Y) => AV1.map((e, i) => <Bracket key={i} x0={X(e.p + 0.028)} x1={X(e.p + 0.28 - 0.03)} y={Y(0) + 46} c={CPR} label="0,28" a={ap(t, 0.4 + i * 0.15, 0.3)} size={22} />)}
        </Strip>
      </div>
      <div style={{position: 'absolute', left: 60, top: 560, width: W, height: 330, borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', opacity: ap(t, 6.0)}}>
        <Strip f={sig(AV1L)} w={W} h={330} mm={8} base={220} label="DII · PR rất dài">
          {(X, Y) => AV1L.slice(1, 5).map((e, i) => <ellipse key={i} cx={X(e.p + 0.05)} cy={Y(0.25)} rx={30} ry={40} fill="none" stroke={PEN} strokeWidth={4} opacity={ap(t, 6.4 + i * 0.15, 0.3)} />)}
        </Strip>
      </div>
      <Card x={1290} y={140} w={570} a={ap(t, 0)} c="#F59E0B" title="PR > 0,20 s" />
      <Card x={1290} y={260} w={570} a={ap(t, 2.0)} c="#F59E0B" title="PR CỐ ĐỊNH">mọi P đều có QRS theo sau</Card>
      <Card x={1290} y={420} w={570} a={ap(t, 4.0)} c="#475569" title="Dẫn truyền CHẬM">chưa phải mất dẫn truyền</Card>
      <Card x={1290} y={580} w={570} a={ap(t, 6.0)} c={PEN} title="P lẫn vào sóng T">dễ bỏ sót khi PR rất dài</Card>
      <Memo x={1290} y={760} w={570} a={ap(t, 8.0)}>Độ I: “dài mà <span style={{color: PEN}}>KHÔNG RƠI</span>”</Memo>
    </DeskBg>
  );
};

// ================= 5 · MOBITZ I =================
const WPR = [0.16, 0.24, 0.3, null, 0.16, 0.24, 0.3, null];
const WEN = evSeq(0.1, 0.72, WPR);
const PRC = ['#FACC15', '#F97316', '#DC2626'];
const Mobitz1: React.FC = () => {
  const t = useT();
  const W = 1180, mm = 8;
  return (
    <DeskBg>
      <Head t={t}>Block nhĩ thất độ II · Mobitz I (Wenckebach)</Head>
      <div style={{position: 'absolute', left: 60, top: 140, width: W, height: 440, borderRadius: 14, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
        <Strip f={sig(WEN)} w={W} h={440} mm={mm} base={290} label="DII" prog={dp(t, -1, 1)}>
          {(X, Y) => {
            let k = 0;
            return (
              <g>
                {WEN.map((e, i) => {
                  if (e.pr === null) return <Drop key={i} x={X(e.p + 0.05)} y={Y(0) - 90} a={ap(t, 2.0 + (i > 4 ? 0.6 : 0), 0.4)} />;
                  const c = PRC[k++ % 3];
                  return <Bracket key={i} x0={X(e.p + 0.028)} x1={X(e.p + e.pr - 0.03)} y={Y(0) + 46} c={c} label={e.pr.toFixed(2).replace('.', ',')} a={ap(t, 0.4 + i * 0.25, 0.3)} size={22} />;
                })}
                {[0, 4].map((s, j) => {
                  const a0 = X(WEN[s].p + WEN[s].pr! - 0.04), a1 = X(WEN[s + 2].p + WEN[s + 2].pr! + 0.04);
                  return <path key={j} d={`M${a0},${Y(1.15) - 30} v-14 H${a1} v14`} fill="none" stroke="#0EA5E9" strokeWidth={4} opacity={ap(t, 6.0 + j * 0.3, 0.4)} />;
                })}
                <text x={X(1.4)} y={Y(1.15) - 56} textAnchor="middle" fontFamily={HAND} fontSize={32} fill="#0EA5E9" opacity={ap(t, 6.0)}>nhóm</text>
              </g>
            );
          }}
        </Strip>
      </div>
      <Card x={1290} y={140} w={570} a={ap(t, 2.0)} c="#F97316" title="PR dài dần → 1 P không dẫn" />
      <Card x={1290} y={260} w={570} a={ap(t, 4.0)} c="#F97316" title="PR dài nhất: ngay TRƯỚC nhát rơi">ngắn nhất: ngay SAU nhát rơi</Card>
      <Card x={1290} y={420} w={570} a={ap(t, 6.0)} c="#0EA5E9" title="Chu kỳ lặp lại → nhịp theo NHÓM" />
      <div style={{position: 'absolute', left: 60, top: 640, width: 1180, display: 'flex', gap: 20, justifyContent: 'center', opacity: ap(t, 8.0), transform: `scale(${0.9 + 0.1 * ap(t, 8.0)})`}}>
        {['dài…', 'dài…', 'dài…', 'RƠI!'].map((w, i) => (
          <div key={i} style={{padding: '18px 34px', borderRadius: 20, background: i < 3 ? PRC[i] : PEN, color: i < 3 ? '#26221C' : '#fff', fontFamily: FONT, fontSize: 52, fontWeight: 900, opacity: ap(t, 8.0 + i * 0.25, 0.3)}}>{w}</div>
        ))}
      </div>
      <Memo x={1290} y={580} w={570} a={ap(t, 8.0)}>Mobitz I: “dài… dài… dài… <span style={{color: PEN}}>RƠI</span>”</Memo>
    </DeskBg>
  );
};

// ================= 6 · MOBITZ I: MẸO ĐỌC =================
const Mobitz1Tip: React.FC = () => {
  const t = useT();
  const BX = 160, BB = 760, kk = 1400; // px trên giây PR
  const bars: (number | null)[] = [0.16, 0.24, 0.3, null, 0.16, 0.24];
  return (
    <DeskBg>
      <Head t={t}>Mobitz I · mẹo đọc nhanh</Head>
      <div style={{position: 'absolute', left: 60, top: 140, width: 1180, height: 700, borderRadius: 20, background: '#FCFAF4', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
        <svg viewBox="0 0 1180 700" width={1180} height={700}>
          <text x={40} y={60} fontFamily={FONT} fontSize={34} fontWeight={800} fill={INK}>“Bậc thang” PR</text>
          <line x1={80} x2={1120} y1={BB - 140} y2={BB - 140} stroke="#CBD5E1" strokeWidth={2} />
          <line x1={80} x2={1120} y1={BB - 140 - 0.2 * kk} y2={BB - 140 - 0.2 * kk} stroke="#94A3B8" strokeWidth={2} strokeDasharray="10 8" />
          <text x={76} y={BB - 132 - 0.2 * kk} textAnchor="end" fontFamily={MONO} fontSize={22} fill="#64748B">0,20</text>
          {bars.map((v, i) => {
            const x = BX + i * 160, a = ap(t, 0.2 + i * 0.3, 0.4);
            if (v === null) return <g key={i}><Drop x={x + 45} y={BB - 200} a={a} /><text x={x + 45} y={BB - 110} textAnchor="middle" fontFamily={FONT} fontSize={24} fontWeight={800} fill={PEN} opacity={a}>rơi</text></g>;
            const hgt = v * kk * a, c = PRC[[0, 1, 2, 0, 0, 1][i]];
            const hl = (i === 2 && ap(t, 0.2)) || (i === 4 && ap(t, 0.2));
            return (
              <g key={i}>
                <rect x={x} y={BB - 140 - hgt} width={90} height={hgt} rx={10} fill={c} stroke={hl ? INK : 'none'} strokeWidth={hl ? 0 : 0} />
                <text x={x + 45} y={BB - 150 - hgt} textAnchor="middle" fontFamily={MONO} fontSize={26} fontWeight={700} fill={INK} opacity={a}>{v.toFixed(2).replace('.', ',')}</text>
              </g>
            );
          })}
          <g opacity={ap(t, 0.4)}>
            <text x={BX + 2 * 160 + 45} y={BB - 80} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={800} fill="#DC2626">TRƯỚC: dài</text>
            <text x={BX + 4 * 160 + 45} y={BB - 80} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={800} fill="#16A34A">SAU: ngắn</text>
          </g>
          <RPath d={`M${BX + 2 * 160 + 90},${BB - 140 - 0.3 * kk + 10} C${BX + 3 * 160 + 40},${BB - 140 - 0.36 * kk} ${BX + 3 * 160 + 100},${BB - 140 - 0.3 * kk} ${BX + 4 * 160 + 30},${BB - 140 - 0.16 * kk - 14}`} stroke={PEN} sw={4} rough={1.2} seed={7} prog={dp(t, 2.0, 0.6)} />
        </svg>
      </div>
      <Card x={1290} y={140} w={570} a={ap(t, 0)} c="#F97316" title="So PR SAU với PR TRƯỚC nhát rơi" />
      <Card x={1290} y={270} w={570} a={ap(t, 2.0)} c="#16A34A" title="Sau ngắn hơn rõ → Mobitz I" />
      <Card x={1290} y={400} w={570} a={ap(t, 4.0)} c="#475569" title="Thường block tại nút nhĩ thất">QRS thường hẹp</Card>
      <Card x={1290} y={560} w={570} a={ap(t, 6.0)} c={PEN} title="Lưu ý">kiểu Mobitz trên ECG không luôn khẳng định vị trí block</Card>
    </DeskBg>
  );
};


// ================= 7 · MOBITZ II =================
const MZ2 = evSeq(0.1, 0.8, [0.16, 0.16, 0.16, null, 0.16, 0.16, 0.16], true);
const Mobitz2: React.FC = () => {
  const t = useT();
  const W = 1180;
  return (
    <DeskBg>
      <Head t={t}>Block nhĩ thất độ II · Mobitz II</Head>
      <div style={{position: 'absolute', left: 60, top: 140, width: W, height: 460, borderRadius: 14, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
        <Strip f={sig(MZ2)} w={W} h={460} mm={8} base={290} label="DII" prog={dp(t, -1, 1)}>
          {(X, Y) => (
            <g>
              {MZ2.map((e, i) => e.pr === null
                ? <Drop key={i} x={X(e.p + 0.05)} y={Y(0) - 100} a={ap(t, 2.0, 0.4)} />
                : <Bracket key={i} x0={X(e.p + 0.028)} x1={X(e.p + 0.16 - 0.025)} y={Y(0) + 70} c={CPR} label="0,16" a={ap(t, 0.4 + i * 0.15, 0.3)} size={22} />)}
              <g opacity={ap(t, 4.0)}>
                <rect x={X(MZ2[2].p + 0.05) - 20} y={Y(0) + 100} width={X(MZ2[4].p + 0.05) - X(MZ2[2].p + 0.05) + 40} height={50} rx={10} fill="rgba(34,197,94,0.15)" />
                <text x={(X(MZ2[2].p) + X(MZ2[4].p)) / 2 + 30} y={Y(0) + 134} textAnchor="middle" fontFamily={FONT} fontSize={24} fontWeight={800} fill="#15803D">PR trước = PR sau</text>
              </g>
              <path d={`M${X(MZ2[2].p + 0.16)},${Y(1.0) - 36} v-12 H${X(MZ2[4].p + 0.16)} v12`} fill="none" stroke="#0EA5E9" strokeWidth={4} opacity={ap(t, 6.0)} />
              <text x={(X(MZ2[2].p) + X(MZ2[4].p)) / 2 + 60} y={Y(1.0) - 58} textAnchor="middle" fontFamily={MONO} fontSize={26} fontWeight={700} fill="#0EA5E9" opacity={ap(t, 6.0)}>RR = 2 × RR</text>
              <path d={`M${X(MZ2[0].p + 0.16)},${Y(1.0) - 36} v-12 H${X(MZ2[1].p + 0.16)} v12`} fill="none" stroke="#0EA5E9" strokeWidth={4} opacity={ap(t, 6.0)} />
            </g>
          )}
        </Strip>
      </div>
      <Card x={1290} y={140} w={570} a={ap(t, 2.0)} c={CQ} title="PR CỐ ĐỊNH → rơi đột ngột" />
      <Card x={1290} y={260} w={570} a={ap(t, 4.0)} c="#16A34A" title="PR trước & sau nhát rơi BẰNG nhau" />
      <Card x={1290} y={380} w={570} a={ap(t, 6.0)} c="#0EA5E9" title="RR chứa nhát rơi = 2 × RR" />
      <Card x={1290} y={500} w={570} a={ap(t, 8.0)} c="#475569" title="Thường dưới nút (His – Purkinje)">hay kèm QRS rộng</Card>
      <Memo x={60} y={660} w={1180} a={ap(t, 10.0)}>Mobitz II: “đang yên bỗng <span style={{color: PEN}}>RƠI</span>” — nguy cơ tiến triển thành <span style={{color: PEN}}>block độ III</span></Memo>
    </DeskBg>
  );
};

// ================= 8 · 2:1 & CAO ĐỘ =================
const B21 = evSeq(0.1, 0.7, [0.22, null, 0.22, null, 0.22, null, 0.22, null]);
const B31 = evSeq(0.1, 0.62, [0.18, null, null, 0.18, null, null, 0.18, null, null], true);
const Block21: React.FC = () => {
  const t = useT();
  const W = 1180;
  return (
    <DeskBg>
      <Head t={t}>Block 2:1 · Block nhĩ thất cao độ</Head>
      <div style={{position: 'absolute', left: 60, top: 140, width: W, height: 330, borderRadius: 14, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
        <Strip f={sig(B21)} w={W} h={330} mm={8} base={220} label="DII · 2:1" prog={dp(t, -1, 1)}>
          {(X, Y) => B21.map((e, i) => e.pr === null ? <circle key={i} cx={X(e.p + 0.05)} cy={Y(0.14)} r={20} fill="rgba(139,92,246,0.25)" stroke={CP} strokeWidth={4} opacity={ap(t, 0.4 + i * 0.1, 0.3)} /> : null)}
        </Strip>
      </div>
      <div style={{position: 'absolute', left: 60, top: 520, width: W, height: 330, borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', opacity: ap(t, 6.0)}}>
        <Strip f={sig(B31)} w={W} h={330} mm={8} base={220} label="DII · cao độ 3:1">
          {(X, Y) => B31.map((e, i) => e.pr === null ? <circle key={i} cx={X(e.p + 0.05)} cy={Y(0.14)} r={20} fill="rgba(139,92,246,0.25)" stroke={CP} strokeWidth={4} opacity={ap(t, 6.3 + i * 0.08, 0.3)} /> : null)}
        </Strip>
      </div>
      <Card x={1290} y={140} w={570} a={ap(t, 0)} c={CP} title="2:1: cứ 2 P thì 1 P không dẫn" />
      <Card x={1290} y={260} w={570} a={ap(t, 2.0)} c={PEN} title="KHÔNG xếp được Mobitz I hay II">không có 2 PR liên tiếp để so</Card>
      <div style={{position: 'absolute', left: 1290, top: 420, width: 570, borderRadius: 16, overflow: 'hidden', boxShadow: '0 14px 30px rgba(0,0,0,0.35)', opacity: ap(t, 4.0), fontFamily: FONT}}>
        {[['PR dài + QRS hẹp', '→ nghiêng Mobitz I', '#F97316'], ['PR bình thường + QRS rộng', '→ nghiêng Mobitz II', CQ]].map(([a, b, c]) => (
          <div key={a} style={{padding: '14px 20px', background: '#FCFAF4', borderLeft: `10px solid ${c}`, borderBottom: '1px solid #E5E7EB'}}>
            <div style={{fontSize: 28, fontWeight: 800, color: '#26221C'}}>{a}</div>
            <div style={{fontSize: 28, fontWeight: 900, color: c}}>{b}</div>
          </div>
        ))}
      </div>
      <Card x={1290} y={660} w={570} a={ap(t, 6.0)} c="#7C3AED" title="Cao độ: ≥ 2 P liên tiếp không dẫn">3:1, 4:1…</Card>
    </DeskBg>
  );
};

// ================= 9 · BLOCK ĐỘ III =================
const CHB_P = Array.from({length: 9}, (_, i) => ({p: 0.12 + i * 0.667, pr: null as number | null}));
const CHB_Q = [{t: 0.55, wide: true}, {t: 2.27, wide: true}, {t: 3.99, wide: true}];
const Block3: React.FC = () => {
  const t = useT();
  const W = 1180, mm = 8;
  const f = sig(CHB_P, CHB_Q);
  return (
    <DeskBg>
      <Head t={t}>Block nhĩ thất độ III (hoàn toàn)</Head>
      <div style={{position: 'absolute', left: 60, top: 140, width: W, height: 520, borderRadius: 14, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
        <Strip f={f} w={W} h={520} mm={mm} base={300} label="DII" prog={dp(t, -1, 1)}>
          {(X, Y) => (
            <g>
              <g opacity={ap(t, 4.0)}>
                <text x={20} y={90} fontFamily={FONT} fontSize={24} fontWeight={800} fill={CP}>P</text>
                {CHB_P.map((e, i) => <g key={i}><line x1={X(e.p + 0.05)} x2={X(e.p + 0.05)} y1={70} y2={Y(0.14) - 18} stroke={CP} strokeWidth={3} strokeDasharray="5 5" /><circle cx={X(e.p + 0.05)} cy={84} r={9} fill={CP} /></g>)}
                <text x={20} y={490} fontFamily={FONT} fontSize={24} fontWeight={800} fill={CQ}>QRS</text>
                {CHB_Q.map((q, i) => <g key={i}><line x1={X(q.t + 0.03)} x2={X(q.t + 0.03)} y1={Y(-0.4)} y2={476} stroke={CQ} strokeWidth={3} strokeDasharray="5 5" /><circle cx={X(q.t + 0.03)} cy={484} r={9} fill={CQ} /></g>)}
                <path d={`M${X(CHB_P[0].p + 0.05)},64 v-10 H${X(CHB_P[1].p + 0.05)} v10`} fill="none" stroke={CP} strokeWidth={3} />
                <path d={`M${X(CHB_Q[0].t + 0.03)},${504} v10 H${X(CHB_Q[1].t + 0.03)} v-10`} fill="none" stroke={CQ} strokeWidth={3} />
              </g>
              {[[0, 0], [3, 1], [6, 2]].map(([pi, qi], k) => {
                const p = CHB_P[pi + 0].p + 0.03; const q = CHB_Q[qi].t;
                const pp = CHB_P.filter((e) => e.p < q).slice(-1)[0].p + 0.03;
                return <Bracket key={k} x0={X(pp)} x1={X(q)} y={Y(0) + 70 + k * 0} c={CPR} label={`PR? ${(q - pp).toFixed(2).replace('.', ',')}`} a={ap(t, 6.0 + k * 0.3, 0.3)} size={22} />;
              })}
            </g>
          )}
        </Strip>
      </div>
      <Card x={1290} y={140} w={570} a={ap(t, 2.0)} c="#7C3AED" title="KHÔNG P nào dẫn xuống thất" />
      <Card x={1290} y={260} w={570} a={ap(t, 4.0)} c="#7C3AED" title="PP đều · RR đều">nhưng KHÔNG liên quan nhau</Card>
      <Card x={1290} y={420} w={570} a={ap(t, 6.0)} c={CPR} title="PR thay đổi ngẫu nhiên">tần số nhĩ (90) &gt; tần số thất (35)</Card>
      <Memo x={60} y={700} w={1180} a={ap(t, 8.0)}>Độ III: “<span style={{color: CP}}>P đi đường P</span>, <span style={{color: CQ}}>QRS đi đường QRS</span>”</Memo>
    </DeskBg>
  );
};

// ================= 10 · NHỊP THOÁT =================
const ESC_J = {p: Array.from({length: 7}, (_, i) => ({p: 0.3 + i * 0.75, pr: null as number | null})), q: [0.2, 1.53, 2.86, 4.19].map((t) => ({t}))};
const ESC_V = {p: Array.from({length: 8}, (_, i) => ({p: 0.1 + i * 0.66, pr: null as number | null})), q: [0.5, 2.2, 3.9].map((t) => ({t, wide: true}))};
const Escape: React.FC = () => {
  const t = useT();
  const W = 1180;
  return (
    <DeskBg>
      <Head t={t}>Nhịp thoát trong block độ III</Head>
      <div style={{position: 'absolute', left: 60, top: 140, width: W, height: 330, borderRadius: 14, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.45)', opacity: ap(t, 2.0)}}>
        <Strip f={sig(ESC_J.p, ESC_J.q)} w={W} h={330} mm={8} base={220} label="Thoát bộ nối · QRS hẹp · ~45 l/ph" />
      </div>
      <div style={{position: 'absolute', left: 60, top: 520, width: W, height: 330, borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', opacity: ap(t, 4.0)}}>
        <Strip f={sig(ESC_V.p, ESC_V.q)} w={W} h={330} mm={8} base={200} label="Thoát thất · QRS rộng · ~35 l/ph" />
      </div>
      <Card x={1290} y={140} w={570} a={ap(t, 0)} c="#7C3AED" title="Thất do NHỊP THOÁT chỉ huy" />
      <Card x={1290} y={270} w={570} a={ap(t, 2.0)} c="#16A34A" title="QRS hẹp → thoát bộ nối">thường khoảng 40 – 60 l/ph</Card>
      <Card x={1290} y={430} w={570} a={ap(t, 4.0)} c={CQ} title="QRS rộng → thoát thất">thường dưới 40 l/ph</Card>
      <Memo x={1290} y={600} w={570} a={ap(t, 6.0)}>QRS càng rộng, nhịp càng chậm → block càng <span style={{color: PEN}}>THẤP</span></Memo>
    </DeskBg>
  );
};

// ================= 11 · PHÂN LY NHĨ THẤT ≠ BLOCK ĐỘ III =================
const DIS = {p: Array.from({length: 5}, (_, i) => ({p: 0.2 + i * 0.8, pr: null as number | null})), q: Array.from({length: 8}, (_, i) => ({t: 0.15 + i * 0.52, wide: true}))};
const CHB2 = {p: Array.from({length: 7}, (_, i) => ({p: 0.12 + i * 0.66, pr: null as number | null})), q: [0.5, 2.2, 3.9].map((t) => ({t, wide: true}))};
const Dissoc: React.FC = () => {
  const t = useT();
  const W = 860;
  const Col: React.FC<{x: number; title: string; c: string; sub: string; f: (T: number) => number; a: number; rate: [string, string]; faster: 'atria' | 'ventricle'}> = ({x, title, c, sub, f, a, rate, faster}) => (
    <div style={{position: 'absolute', left: x, top: 140, width: W, opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>
      <div style={{fontFamily: FONT, fontSize: 38, fontWeight: 900, color: c}}>{title}</div>
      <div style={{fontFamily: FONT, fontSize: 26, fontWeight: 700, color: '#CBD5E1', marginTop: 4}}>{sub}</div>
      <div style={{marginTop: 16, borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'}}><Strip f={f} w={W} h={300} mm={8} base={200} label="DII" /></div>
      <div style={{display: 'flex', gap: 16, marginTop: 20}}>
        {[['Nhĩ (P)', rate[0], CP, faster === 'atria'], ['Thất (QRS)', rate[1], CQ, faster === 'ventricle']].map(([n, v, cc, win]) => (
          <div key={n as string} style={{flex: 1, padding: '16px 20px', borderRadius: 16, background: '#FCFAF4', borderTop: `8px solid ${cc}`, fontFamily: FONT}}>
            <div style={{fontSize: 26, fontWeight: 800, color: '#475569'}}>{n as string}</div>
            <div style={{fontSize: 52, fontWeight: 900, color: cc as string}}>{v as string} <span style={{fontSize: 26}}>l/ph</span> {win ? '⬆' : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <DeskBg>
      <Head t={t}>Phân ly nhĩ thất ≠ Block độ III</Head>
      <Col x={60} title="Phân ly nhĩ thất" c="#0EA5E9" sub="vd. nhịp nhanh thất, nhịp tự thất gia tốc" f={sig(DIS.p, DIS.q)} a={ap(t, 2.0)} rate={['75', '115']} faster="ventricle" />
      <Col x={1000} title="Block nhĩ thất độ III" c="#7C3AED" sub="P đến đúng lúc vẫn không dẫn" f={sig(CHB2.p, CHB2.q)} a={ap(t, 4.0)} rate={['90', '35']} faster="atria" />
      <Memo x={60} y={800} w={1800} a={ap(t, 6.0)}>Nhĩ nhanh hơn thất → nghĩ <span style={{color: '#7C3AED'}}>BLOCK</span> · Thất nhanh hơn nhĩ → nghĩ <span style={{color: '#0EA5E9'}}>PHÂN LY</span></Memo>
    </DeskBg>
  );
};

// ================= 12 · BẢNG ÔN TẬP =================
const TROWS: [string, string, string, string][] = [
  ['Độ I', 'PR > 0,20 s, cố định', 'không rơi', '#F59E0B'],
  ['Mobitz I', 'PR dài dần → rơi', 'nhịp theo nhóm', '#F97316'],
  ['Mobitz II', 'PR cố định → rơi đột ngột', 'hay kèm QRS rộng', '#DC2626'],
  ['2:1 · cao độ', 'không xếp được Mobitz', '≥ 2 P liên tiếp không dẫn', '#BE185D'],
  ['Độ III', 'P và QRS độc lập', 'nhĩ nhanh hơn thất', '#7C3AED'],
];
const TableB: React.FC = () => {
  const t = useT();
  const W0 = 1760, H0 = 820, TY = 160, RH = 125;
  const cols = [40, 420, 1050];
  return (
    <DeskBg>
      <div style={{position: 'absolute', left: 80, top: 100, width: W0, height: H0, boxShadow: '0 30px 60px rgba(0,0,0,0.45)', transform: `rotate(-0.4deg) translateY(${(1 - ap(t, -1, 0.7)) * 900}px)`}}>
        <svg viewBox={`0 0 ${W0} ${H0}`} width={W0} height={H0} style={{position: 'absolute', inset: 0}}>
          <Pink w={W0} h={H0} mm={10} />
          <RPath d={`M40,${TY - 8} L${W0 - 40},${TY - 10}`} stroke={INK} sw={3} rough={1.2} seed={5} prog={dp(t, 0, 0.7)} />
          {TROWS.map((r, i) => {
            const k = dp(t, 2 * (i + 1) - 0.2, 0.6);
            const y = TY + i * RH;
            return (
              <g key={i}>
                <rect x={30} y={y + 8} width={(W0 - 60) * k} height={RH - 16} rx={14} fill={r[3]} opacity={0.14} />
                <RPath d={`M40,${y + RH} L${W0 - 40},${y + RH + (i % 2 ? 2 : -2)}`} stroke="#3B3B48" sw={1.6} rough={1.6} seed={11 + i} prog={k} />
                <RPath d={`M${W0 - 110},${y + RH / 2 + 4} L${W0 - 96},${y + RH / 2 + 22} L${W0 - 68},${y + RH / 2 - 16}`} stroke={PEN} sw={5} rough={0.9} seed={40 + i} prog={dp(t, 2 * (i + 1) + 0.8, 0.3)} />
              </g>
            );
          })}
        </svg>
        <div style={{position: 'absolute', left: 40, top: 40, fontFamily: FONT, fontSize: 46, fontWeight: 900, color: INK}}>BẢNG BLOCK NHĨ THẤT</div>
        <div style={{position: 'absolute', left: 700, top: 50, fontFamily: HAND, fontSize: 38, color: PEN, transform: 'rotate(-3deg)', opacity: ap(t, 0.6)}}>Tìm P · Đo PR · Xem RƠI</div>
        {['LOẠI', 'PR / DẪN TRUYỀN', 'DẤU KÈM'].map((h, j) => <div key={h} style={{position: 'absolute', left: cols[j], top: TY - 44, fontFamily: FONT, fontSize: 22, fontWeight: 800, letterSpacing: 1.5, color: '#5B4A47'}}>{h}</div>)}
        {TROWS.map((r, i) => {
          const y = TY + i * RH + 38;
          return [r[0], r[1], r[2]].map((txt, j) => (
            <div key={i + '-' + j} style={{position: 'absolute', left: cols[j], top: y, fontFamily: FONT, fontSize: j === 0 ? 38 : 32, fontWeight: j === 0 ? 900 : 700, color: j === 0 ? r[3] : INK, opacity: ap(t, 2 * (i + 1) + j * 0.2, 0.4), whiteSpace: 'nowrap'}}>{txt}</div>
          ));
        })}
      </div>
    </DeskBg>
  );
};

// ================= 13 · THỰC HÀNH =================
const PRAC: {f: (T: number) => number; label: string; ans: string; c: string; t0: number}[] = [
  {f: sig(evSeq(0.1, 0.72, [0.16, 0.24, 0.3, null, 0.16, 0.24, 0.3, null])), label: 'Dải 1', ans: 'Mobitz I', c: '#F97316', t0: 2},
  {f: sig(evSeq(0.1, 0.8, [0.16, 0.16, 0.16, null, 0.16, 0.16, 0.16], true)), label: 'Dải 2', ans: 'Mobitz II', c: '#DC2626', t0: 4},
  {f: sig(Array.from({length: 9}, (_, i) => ({p: 0.12 + i * 0.667, pr: null})), [0.55, 2.27, 3.99].map((t) => ({t, wide: true}))), label: 'Dải 3', ans: 'Độ III · thoát thất', c: '#7C3AED', t0: 6},
];
const PracticeB: React.FC = () => {
  const t = useT();
  return (
    <DeskBg>
      <Head t={t}>Thực hành · đọc 3 dải nhịp DII</Head>
      {PRAC.map((p, i) => (
        <div key={i} style={{position: 'absolute', left: 60, top: 130 + i * 260, width: 1180, height: 240, borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', opacity: ap(t, -0.5 + i * 0.3)}}>
          <Strip f={p.f} w={1180} h={240} mm={6} base={160} label={p.label} />
        </div>
      ))}
      <div style={{position: 'absolute', left: 1290, top: 130, width: 570, height: 760, background: '#FDFDF8', backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 129px, #BFD7EA 129px 131px)', boxShadow: '0 20px 40px rgba(0,0,0,0.45)', transform: 'rotate(1deg)'}}>
        <div style={{position: 'absolute', left: 24, top: 24, fontFamily: FONT, fontSize: 30, fontWeight: 800, color: PEN}}>PHIẾU ĐỌC</div>
        {PRAC.map((p, i) => {
          const a = ap(t, p.t0, 0.5);
          return (
            <div key={i} style={{position: 'absolute', left: 24, top: 100 + i * 230, width: 520, opacity: a, transform: `translateX(${(1 - a) * 20}px)`, fontFamily: FONT}}>
              <div style={{fontSize: 26, fontWeight: 800, color: '#64748B'}}>{p.label} <span style={{color: '#16A34A'}}>✓</span></div>
              <div style={{fontSize: 40, fontWeight: 900, color: p.c}}>{p.ans}</div>
              <div style={{fontSize: 24, fontWeight: 700, color: '#1F2937'}}>{['PR 0,16 → 0,24 → 0,30 → rơi', 'PR 0,16 cố định → rơi · QRS rộng', 'P 90 · QRS rộng 35 · không liên quan'][i]}</div>
            </div>
          );
        })}
      </div>
    </DeskBg>
  );
};

// ================= 14 · TÓM TẮT =================
const TAKE5: [string, string, string, string][] = [
  ['', 'Tìm P – Đo PR – Xem RƠI', '', '#14B8A6'],
  ['PR bình thường ', '0,12 – 0,20 s', ' · ngắn: tiền kích thích, nhịp bộ nối', '#0EA5E9'],
  ['Độ I: ', 'dài mà không rơi', '', '#F59E0B'],
  ['Độ II: Mobitz I ', 'dài dần rồi rơi', ' · Mobitz II đang yên bỗng rơi', '#DC2626'],
  ['Độ III: ', 'P và QRS mỗi bên một đường', ' · nhĩ nhanh hơn thất', '#7C3AED'],
];
const SummaryB: React.FC = () => {
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
            <div key={i} style={{position: 'absolute', left: 130, top: 140 + i * 110, width: 1100, fontFamily: FONT, fontSize: 33, fontWeight: 600, color: '#1F2937', opacity: a, transform: `translateX(${(1 - a) * 20}px)`, whiteSpace: 'nowrap'}}>
              <span style={{color: x[3], fontWeight: 900}}>{i + 1}. </span>{x[0]}<b style={{color: x[3]}}>{x[1]}</b>{x[2]}
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 130, top: 715, fontFamily: HAND, fontSize: 52, color: '#1F2937', opacity: ap(t, 12.0), transform: `rotate(-2deg) scale(${0.9 + 0.1 * ap(t, 12.0)})`}}>Cảm ơn bạn đã theo dõi! ♥</div>
      </div>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="sumb" x={1330} y={200} s={1.1} prog={dp(t, 0.6, 1.2)} art={1} labels={false} beat={beat} />
      </svg>
    </DeskBg>
  );
};

const SC: React.FC[] = [Cover, PRScene, Approach3, ShortPR, Block1, Mobitz1, Mobitz1Tip, Mobitz2, Block21, Block3, Escape, Dissoc, TableB, PracticeB, SummaryB];
export const BLOCK_N = 7;
export const Block: React.FC = () => (
  <AbsoluteFill style={{background: '#0E1116', fontFamily: FONT}}>
    <Audio src={staticFile('narration.m4a')} />
    <CapCtx.Provider value={false}>
      {data.scenes.slice(0, Math.min(SC.length, data.scenes.length)).map((s, i) => {
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
    <SeriesTag sub="Khoảng PR & Block nhĩ thất" />
    <StationBar />
    <Caption />
    <Progress />
  </AbsoluteFill>
);
