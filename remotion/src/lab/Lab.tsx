// Bản thử phong cách "Monitor ICU + Bàn đọc ECG"
import React from 'react';
import {AbsoluteFill, interpolate, Easing} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {noise2D} from '@remotion/noise';
import {loadFont} from '@remotion/google-fonts/JetBrainsMono';
import {FONT, useT, CapCtx} from '../lib';
import {ecgAt, beatV, tracePts, STAGE, INFERIOR, LAYOUT, Lead} from './ecg';

const {fontFamily: MONO} = loadFont('normal', {weights: ['400', '700'], subsets: ['latin']});

const M = {g: '#39FF8A', c: '#3FD8FF', y: '#FFD43B', r: '#FF4D4D', w: '#E9F1EA', dim: '#5E7466', bez: '#1B2128', scr: '#020805'};
const P = {paper: '#FFF6F2', minor: '#F6C9C1', major: '#EC9A8E', ink: '#1E1E24', hl: 'rgba(255,230,0,0.55)', pen: '#D7263D'};
const ap = (t: number, s: number, d = 0.6) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1)});
const Svg: React.FC<{children: React.ReactNode; vb?: string; style?: React.CSSProperties}> = ({children, vb = '0 0 1920 1080', style}) => (
  <svg viewBox={vb} width="100%" height="100%" style={{position: 'absolute', inset: 0, ...style}}>
    <defs>
      <filter id="phos" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    </defs>
    {children}
  </svg>
);
const Cap: React.FC<{text: string; light?: boolean}> = ({text, light}) => !React.useContext(CapCtx) ? null : (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 30, display: 'flex', justifyContent: 'center'}}>
    <div style={{maxWidth: 1500, padding: '12px 32px', borderRadius: 16, background: light ? 'rgba(20,24,30,0.86)' : 'rgba(0,0,0,0.75)', border: '1px solid rgba(255,255,255,0.15)', fontFamily: FONT, fontSize: 32, fontWeight: 500, color: '#F1F5F9', textAlign: 'center'}}>{text}</div>
  </div>
);

// ---------- MONITOR ----------
const Bezel: React.FC<{t: number; alarm?: number; cap?: string; children: React.ReactNode}> = ({t, alarm = 0, cap, children}) => {
  const flick = 0.035 + 0.02 * noise2D('f', t * 3, 0);
  const pulse = alarm * (0.5 + 0.5 * Math.sin(t * 9));
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, #121a22, #05080c 70%)'}}>
      <div style={{position: 'absolute', left: 90, top: 40, width: 1740, height: 840, borderRadius: 34, background: `linear-gradient(160deg, #2a323c, ${M.bez})`, boxShadow: '0 30px 80px rgba(0,0,0,0.7), inset 0 2px 0 rgba(255,255,255,0.08)'}} />
      <div style={{position: 'absolute', left: 120, top: 66, width: 1680, height: 780, borderRadius: 14, background: M.scr, overflow: 'hidden', boxShadow: `inset 0 0 0 3px ${pulse > 0.01 ? `rgba(255,77,77,${0.4 + 0.6 * pulse})` : '#0c1410'}, inset 0 0 80px rgba(0,0,0,0.9)`}}>
        {children}
        <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 4px)', pointerEvents: 'none'}} />
        <div style={{position: 'absolute', inset: 0, background: `rgba(120,255,170,${flick})`, mixBlendMode: 'screen', pointerEvents: 'none'}} />
      </div>
      {cap && <Cap text={cap} />}
    </AbsoluteFill>
  );
};
// Sóng quét kiểu monitor; stFn cho phép mỗi nhịp mang thông số riêng (theo thời điểm nhịp)
const Sweep: React.FC<{t: number; x: number; y0: number; w: number; win: number; pxmv: number; color: string; leadAt: (beatT: number) => Lead; rr?: number; sw?: number}> = ({t, x, y0, w, win, pxmv, color, leadAt, rr = 0.75, sw = 3}) => {
  const cur = (t % win) / win;
  const cyc = Math.floor(t / win);
  const pts = (from: number, to: number, c: number) => {
    const out: string[] = [];
    for (let u = from; u <= to; u += 0.0016) {
      const T = (c + u) * win;
      const k = Math.floor((T + rr * 0.35) / rr);
      const L = leadAt(k * rr);
      out.push(`${(x + u * w).toFixed(1)},${(y0 - ecgAt(T, L, rr) * pxmv).toFixed(1)}`);
    }
    return out.join(' ');
  };
  const gap = 0.03;
  return (
    <g filter="url(#phos)">
      <polyline points={pts(0, cur, cyc)} fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round" />
      {cyc > 0 && cur + gap < 1 && <polyline points={pts(cur + gap, 1, cyc - 1)} fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round" opacity={0.9} />}
    </g>
  );
};
const Num: React.FC<{x: number; y: number; label: string; v: string; c: string; size?: number; unit?: string}> = ({x, y, label, v, c, size = 120, unit}) => (
  <div style={{position: 'absolute', left: x, top: y, color: c, fontFamily: MONO}}>
    <div style={{fontSize: 24, fontWeight: 700, letterSpacing: 2}}>{label}</div>
    <div style={{fontSize: size, fontWeight: 700, lineHeight: 1, textShadow: `0 0 18px ${c}88`}}>{v}<span style={{fontSize: 26, marginLeft: 8}}>{unit}</span></div>
  </div>
);

// Cảnh 1: monitor, ST tăng dần, báo động
const S1: React.FC = () => {
  const t = useT();
  const stAt = (bt: number) => 0.3 * interpolate(bt, [1.2, 4.2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const leadAt = (bt: number): Lead => {
    const s = stAt(bt);
    return {st: s, t: 0.3 + s * 1.2, tw: 0.055 + s * 0.08, tPos: 0.27 - s * 0.06};
  };
  const stNow = stAt(t) * 10;
  const alarm = stNow >= 1 ? 1 : 0;
  return (
    <Bezel t={t} alarm={alarm} cap="Trên monitor, đoạn ST ở chuyển đạo hai chênh lên dần — máy báo động. Đã đến lúc làm ECG 12 chuyển đạo.">
      <div style={{position: 'absolute', left: 30, top: 18, right: 30, display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 24, color: M.dim}}>
        <span>GIƯỜNG 4 · HỒI SỨC · ADULT</span><span>21:14</span>
      </div>
      <div style={{position: 'absolute', left: 30, top: 62, fontFamily: FONT, fontSize: 30, fontWeight: 600, color: M.w, opacity: ap(t, 0.3)}}>Nam 58 tuổi · đau ngực trái 30 phút · vã mồ hôi</div>
      <Svg vb="0 0 1680 760">
        <text x={30} y={160} fill={M.g} fontFamily={MONO} fontSize={26} fontWeight={700}>II</text>
        <Sweep t={t} x={30} y0={330} w={1180} win={4} pxmv={150} color={M.g} leadAt={leadAt} />
        <text x={30} y={520} fill={M.c} fontFamily={MONO} fontSize={26} fontWeight={700}>Pleth</text>
        <Sweep t={t} x={30} y0={640} w={1180} win={4} pxmv={70} color={M.c} sw={2.5} leadAt={() => ({p: 0, q: 0, r: 0.0, s: 0, t: 1.2, tw: 0.12, tPos: 0.18})} />
        <line x1={1250} x2={1250} y1={130} y2={740} stroke="#13261b" strokeWidth={2} />
      </Svg>
      <Num x={1290} y={130} label="HR" v="92" c={M.g} />
      <Num x={1290} y={300} label="SpO₂" v="96" c={M.c} size={96} unit="%" />
      <div style={{position: 'absolute', left: 1290, top: 450, fontFamily: MONO, color: alarm ? M.r : M.y}}>
        <div style={{fontSize: 24, fontWeight: 700, letterSpacing: 2}}>ST-II</div>
        <div style={{fontSize: 92, fontWeight: 700, lineHeight: 1, textShadow: `0 0 18px ${alarm ? M.r : M.y}88`}}>{(stNow >= 0 ? '+' : '') + stNow.toFixed(1)}<span style={{fontSize: 26, marginLeft: 8}}>mm</span></div>
      </div>
      <div style={{position: 'absolute', left: 1290, top: 600, fontFamily: MONO, color: M.w}}>
        <div style={{fontSize: 24, fontWeight: 700, letterSpacing: 2, color: M.dim}}>NIBP</div>
        <div style={{fontSize: 56, fontWeight: 700}}>128/76</div>
      </div>
      {alarm > 0 && (
        <div style={{position: 'absolute', left: 760, top: 12, padding: '6px 24px', borderRadius: 8, background: Math.sin(t * 9) > 0 ? M.r : '#7a1d1d', color: '#fff', fontFamily: MONO, fontSize: 30, fontWeight: 700, letterSpacing: 1}}>
          ⚠ ST ↑ II  {(stNow >= 0 ? '+' : '') + stNow.toFixed(1)} mm
        </div>
      )}
    </Bezel>
  );
};

// Cảnh 2: monitor nhiều kênh — 4 giai đoạn
const S2: React.FC = () => {
  const t = useT();
  const rows: [string, string, string, Lead][] = [
    ['T TỐI CẤP', 'vài phút', '#B98CFF', STAGE.hyper],
    ['ST CHÊNH LÊN', 'vài giờ', M.r, STAGE.stemi],
    ['SÓNG Q', 'giờ – ngày', '#FF9F43', STAGE.qwave],
    ['T ĐẢO', 'ngày – tuần', M.c, STAGE.tinv],
  ];
  const press = ap(t, 4.6, 0.25) * (1 - ap(t, 4.9, 0.3));
  return (
    <Bezel t={t} cap="Nhớ thứ tự: T tối cấp → ST chênh lên → sóng Q → T đảo.">
      <div style={{position: 'absolute', left: 30, top: 18, fontFamily: MONO, fontSize: 24, color: M.dim}}>TIẾN TRIỂN ECG TRONG NHỒI MÁU CƠ TIM CẤP</div>
      <Svg vb="0 0 1680 760">
        {rows.map(([, , c, L], i) => (
          <g key={i} opacity={ap(t, 0.3 + i * 0.9)}>
            <line x1={0} x2={1680} y1={85 + i * 160 + 150} y2={85 + i * 160 + 150} stroke="#0f1d15" strokeWidth={2} />
            <Sweep t={Math.max(0, t - (0.3 + i * 0.9)) + 0.6} x={420} y0={85 + i * 160 + 100} w={980} win={3} pxmv={95} color={c} leadAt={() => L} rr={0.85} />
          </g>
        ))}
      </Svg>
      {rows.map(([n, d, c], i) => (
        <div key={i} style={{position: 'absolute', left: 30, top: 105 + i * 160, opacity: ap(t, 0.3 + i * 0.9), fontFamily: MONO}}>
          <div style={{fontSize: 34, fontWeight: 700, color: c}}>{i + 1}. {n}</div>
          <div style={{fontSize: 24, color: M.dim, marginTop: 6}}>{d}</div>
        </div>
      ))}
      <div style={{position: 'absolute', right: 40, bottom: 26, padding: '12px 26px', borderRadius: 10, border: `2px solid ${M.g}`, color: M.g, fontFamily: MONO, fontSize: 26, fontWeight: 700, opacity: ap(t, 3.8), transform: `scale(${1 - 0.08 * press})`, background: press > 0.1 ? 'rgba(57,255,138,0.25)' : 'transparent'}}>▶ IN ECG 12 CHUYỂN ĐẠO</div>
    </Bezel>
  );
};

// ---------- BÀN ĐỌC ----------
const Desk: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 40% 35%, #3a4a52, #1d272c 75%)'}}>
    <AbsoluteFill style={{background: 'repeating-linear-gradient(95deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 9px)'}} />
    {children}
  </AbsoluteFill>
);
const MM = 6; // px mỗi mm trên tờ giấy
const Paper12: React.FC<{hl?: number; ring?: number; t: number}> = ({hl = 0, ring = 0, t}) => {
  const W0 = 1500, H0 = 4 * 180 + 40;
  const grid: React.ReactNode[] = [];
  for (let i = 0; i <= W0 / MM; i++) grid.push(<line key={'v' + i} x1={i * MM} x2={i * MM} y1={0} y2={H0} stroke={i % 5 ? P.minor : P.major} strokeWidth={i % 5 ? 0.6 : 1.2} />);
  for (let j = 0; j <= H0 / MM; j++) grid.push(<line key={'h' + j} x1={0} x2={W0} y1={j * MM} y2={j * MM} stroke={j % 5 ? P.minor : P.major} strokeWidth={j % 5 ? 0.6 : 1.2} />);
  const pxs = 25 * MM, pxmv = 10 * MM; // 25 mm/s, 10 mm/mV
  const cellW = 2.5 * pxs; // 375 px
  const hot = ['II', 'III', 'aVF'];
  return (
    <g>
      <rect x={0} y={0} width={W0} height={H0} fill={P.paper} />
      {grid}
      {LAYOUT.map((row, r) => row.map((ld, c) => {
        const x = c * cellW, y0 = 20 + r * 180 + 110;
        const isHot = hot.includes(ld);
        return (
          <g key={ld}>
            {isHot && hl > 0 && (
              <rect x={x + 8} y={y0 - 95} width={(cellW - 16) * Math.min(1, hl * 3 - hot.indexOf(ld))} height={70} fill={P.hl} style={{mixBlendMode: 'multiply'}} rx={6} />
            )}
            <polyline points={tracePts(x, y0, c * 2.5, 2.5, pxs, pxmv, INFERIOR[ld], 0.8, 0.003, 0.15)} fill="none" stroke={P.ink} strokeWidth={1.8} strokeLinejoin="round" />
            <text x={x + 10} y={y0 - 70} fill={P.ink} fontFamily={MONO} fontSize={22} fontWeight={700}>{ld}</text>
            {c > 0 && <line x1={x} x2={x} y1={y0 - 15} y2={y0 + 15} stroke={P.ink} strokeWidth={1.5} />}
          </g>
        );
      }))}
      <polyline points={tracePts(0, 20 + 3 * 180 + 110, 0, 10, pxs, pxmv, INFERIOR.II, 0.8, 0.003, 0.15)} fill="none" stroke={P.ink} strokeWidth={1.8} />
      <text x={10} y={20 + 3 * 180 + 40} fill={P.ink} fontFamily={MONO} fontSize={22} fontWeight={700}>II</text>
      <text x={W0 - 10} y={H0 - 8} fill="#9b6b64" fontFamily={MONO} fontSize={18} textAnchor="end">25 mm/s · 10 mm/mV</text>
      {ring > 0 && (() => {
        const cx = cellW * 1 + cellW / 2, cy = 20 + 1 * 180 + 95;
        const pts: string[] = [];
        for (let a = 0; a <= ring * Math.PI * 2.1; a += 0.05) pts.push(`${cx + Math.cos(a - 1.2) * (190 + 8 * noise2D('r', a, 0))},${cy + Math.sin(a - 1.2) * (78 + 5 * noise2D('r', 0, a))}`);
        return <polyline points={pts.join(' ')} fill="none" stroke={P.pen} strokeWidth={5} strokeLinecap="round" opacity={0.9} />;
      })()}
    </g>
  );
};
const Sticky: React.FC<{x: number; y: number; a: number; c: string; rot?: number; children: React.ReactNode; w?: number}> = ({x, y, a, c, rot = -2, children, w = 420}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, padding: '20px 24px', background: c, boxShadow: '0 12px 28px rgba(0,0,0,0.35)', transform: `rotate(${rot}deg) translateY(${(1 - a) * 30}px)`, opacity: a, fontFamily: FONT, fontSize: 32, fontWeight: 700, color: '#26221C', lineHeight: 1.3}}>{children}</div>
);

// Cảnh 3: tờ ECG 12 chuyển đạo, zoom vào thành dưới
const S3: React.FC = () => {
  const t = useT();
  const z = ap(t, 1.6, 1.4);
  const scale = interpolate(z, [0, 1], [1.05, 1.6]);
  const tx = interpolate(z, [0, 1], [0, -90]);
  const ty = interpolate(z, [0, 1], [0, -300]);
  return (
    <Desk>
      <div style={{position: 'absolute', left: 210, top: 150, width: 1500, height: 760, transform: `translate(${tx}px, ${ty}px) scale(${scale}) rotate(-1.2deg)`, transformOrigin: '0 0', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
        <svg viewBox="0 0 1500 760" width={1500} height={760}><Paper12 t={t} hl={ap(t, 3.2, 1.6)} ring={ap(t, 5.2, 1.0)} /></svg>
      </div>
      <Sticky x={1380} y={140} a={ap(t, 3.8)} c="#FFE873">II · III · aVF<br />ST chênh lên<br />→ THÀNH DƯỚI</Sticky>
      <Sticky x={1420} y={460} a={ap(t, 5.6)} c="#FFB3C1" rot={2} w={380}>aVL chênh xuống<br />= SOI GƯƠNG</Sticky>
      <Cap text="In ra 12 chuyển đạo: ST chênh lên ở hai, ba, a-vê-ép — soi gương ở a-vê-lờ." light />
    </Desk>
  );
};

// Cảnh 4: compa đo điểm J ở DIII
const S4: React.FC = () => {
  const t = useT();
  const mm = 22; // phóng to
  const X0 = 140, Y0 = 640, pxs = 25 * mm, pxmv = 10 * mm;
  const grid: React.ReactNode[] = [];
  for (let i = 0; i <= 1080 / mm; i++) grid.push(<line key={'v' + i} x1={60 + i * mm} x2={60 + i * mm} y1={170} y2={830} stroke={i % 5 ? P.minor : P.major} strokeWidth={i % 5 ? 1 : 2} />);
  for (let j = 0; j <= 660 / mm; j++) grid.push(<line key={'h' + j} x1={60} x2={1140} y1={170 + j * mm} y2={170 + j * mm} stroke={j % 5 ? P.minor : P.major} strokeWidth={j % 5 ? 1 : 2} />);
  const L = INFERIOR.III;
  const pts: string[] = [];
  for (let tt = -0.33; tt <= 0.5; tt += 0.002) pts.push(`${(X0 + (tt + 0.33) * pxs).toFixed(1)},${(Y0 - beatV(tt, L) * pxmv).toFixed(1)}`);
  const xPR = X0 + (0.33 - 0.08) * pxs, xJ = X0 + (0.33 + 0.06) * pxs;
  const yJ = Y0 - beatV(0.06, L) * pxmv;
  const open = ap(t, 1.0, 1.4);
  const lx = interpolate(open, [0, 1], [xPR + 40, xPR]), rx = interpolate(open, [0, 1], [xPR + 60, xJ]);
  const ly = Y0, ry = interpolate(open, [0, 1], [Y0, yJ]);
  const px = (lx + rx) / 2, py = Math.min(ly, ry) - 260;
  const mmv = ((Y0 - yJ) / mm) * open;
  return (
    <Desk>
      <div style={{position: 'absolute', left: 40, top: 130, width: 1140, height: 740, background: P.paper, boxShadow: '0 30px 60px rgba(0,0,0,0.45)', transform: 'rotate(-0.6deg)'}} />
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <g transform="rotate(-0.6 600 500)">
          {grid}
          <text x={80} y={210} fill={P.ink} fontFamily={MONO} fontSize={34} fontWeight={700}>III</text>
          <polyline points={pts.join(' ')} fill="none" stroke={P.ink} strokeWidth={4} strokeLinejoin="round" />
          <g opacity={ap(t, 2.4)}>
            <line x1={xPR - 120} x2={xJ + 160} y1={Y0} y2={Y0} stroke="#2563EB" strokeWidth={3} strokeDasharray="12 8" />
            <line x1={xJ - 60} x2={xJ + 160} y1={yJ} y2={yJ} stroke={P.pen} strokeWidth={3} strokeDasharray="12 8" />
            <text x={xPR - 120} y={Y0 + 40} fill="#2563EB" fontFamily={FONT} fontSize={28} fontWeight={700}>đường đẳng điện (PR)</text>
            <circle cx={xJ} cy={yJ} r={10} fill={P.pen} />
            <text x={xJ + 20} y={yJ - 18} fill={P.pen} fontFamily={FONT} fontSize={30} fontWeight={800}>điểm J</text>
          </g>
          <g opacity={ap(t, 0.4)}>
            <line x1={px} y1={py} x2={lx} y2={ly} stroke="#5B6470" strokeWidth={9} strokeLinecap="round" />
            <line x1={px} y1={py} x2={rx} y2={ry} stroke="#8892A0" strokeWidth={9} strokeLinecap="round" />
            <circle cx={px} cy={py} r={16} fill="#3B4250" stroke="#C9D1DC" strokeWidth={3} />
            <circle cx={lx} cy={ly} r={5} fill="#111" /><circle cx={rx} cy={ry} r={5} fill="#111" />
          </g>
        </g>
      </svg>
      <div style={{position: 'absolute', left: xJ + 190, top: (Y0 + yJ) / 2 - 50, padding: '10px 22px', borderRadius: 12, background: P.pen, color: '#fff', fontFamily: MONO, fontSize: 56, fontWeight: 700, opacity: ap(t, 2.6), boxShadow: '0 10px 24px rgba(0,0,0,0.35)'}}>{mmv.toFixed(1).replace('.', ',')} mm</div>
      <div style={{position: 'absolute', left: 1240, top: 170, width: 600, padding: '28px 32px', background: '#FDFDF8', backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 51px, #BFD7EA 51px 53px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', transform: `rotate(1.5deg) translateX(${(1 - ap(t, 3.4)) * 80}px)`, opacity: ap(t, 3.4), fontFamily: FONT, color: '#1F2937'}}>
        <div style={{fontSize: 30, fontWeight: 800, color: P.pen, lineHeight: '53px'}}>TIÊU CHUẨN ST CHÊNH LÊN</div>
        <div style={{fontSize: 30, fontWeight: 600, lineHeight: '53px'}}>≥ 1 mm · 2 chuyển đạo liên tiếp</div>
        <div style={{fontSize: 28, fontWeight: 500, lineHeight: '53px', color: '#475569'}}>V2–V3:</div>
        <div style={{fontSize: 28, fontWeight: 600, lineHeight: '53px'}}>nam ≥ 40 tuổi: ≥ 2 mm</div>
        <div style={{fontSize: 28, fontWeight: 600, lineHeight: '53px'}}>nam &lt; 40 tuổi: ≥ 2,5 mm</div>
        <div style={{fontSize: 28, fontWeight: 600, lineHeight: '53px'}}>nữ: ≥ 1,5 mm</div>
      </div>
      <Cap text="Đo từ đường đẳng điện đến điểm J: chuyển đạo ba chênh khoảng ba mi li mét." light />
    </Desk>
  );
};

export const LabSample: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={210}><S1 /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 18})} />
      <TransitionSeries.Sequence durationInFrames={180}><S2 /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={linearTiming({durationInFrames: 24})} />
      <TransitionSeries.Sequence durationInFrames={240}><S3 /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={linearTiming({durationInFrames: 20})} />
      <TransitionSeries.Sequence durationInFrames={200}><S4 /></TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);
export const LAB_DUR = 210 + 180 + 240 + 200 - 18 - 24 - 20;
export {S1 as MonitorScene, M as MCOL, MONO};
