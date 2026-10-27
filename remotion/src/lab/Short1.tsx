// SHORT 9:16 — Bài 1 · 6 bước đọc ECG không bỏ sót (YouTube Shorts / TikTok)
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, Easing, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import data from '../data.json';
import {FONT} from '../lib';
import {MONO} from './Lab';
import {Heart6} from '../wb/heart6';
import {HAND} from '../wb/wb';

const W = 1080, H = 1920;
const ap = (t: number, s: number, d = 0.45) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1)});
const dp = (t: number, s: number, d = 0.8) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
const useSec = () => useCurrentFrame() / 30;
const usePop = (s: number) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - s * fps, fps, config: {damping: 11, stiffness: 160, mass: 0.6}});
};
const beatOf = () => Math.max(0, Math.sin((useCurrentFrame() / 30) * 2 * Math.PI * 1.1)) ** 4;
const INK = '#1E1E24', PEN = '#E11D48';
const STC = ['#F43F5E', '#A855F7', '#3B82F6', '#14B8A6', '#F59E0B', '#EC4899'];
const STEPS: [string, string][] = [['KIỂM', 'giấy'], ['NHỊP', 'xem'], ['SỐ', 'đếm'], ['TRỤC', 'tìm'], ['KHOẢNG', 'đo'], ['ST', 'soi']];
const gs = (x: number, mu: number, w: number, a: number) => a * Math.exp(-((x - mu) ** 2) / (2 * w * w));
const beatN = (tr: number, p = 0.14) => gs(tr, -0.15, 0.02, p) + gs(tr, -0.03, 0.009, -0.08) + gs(tr, 0, 0.011, 1.1) + gs(tr, 0.026, 0.01, -0.25) + gs(tr, 0.22, 0.045, 0.32);
const avr = (tr: number) => -beatN(tr) * 0.75;

const Pink: React.FC<{w: number; h: number; mm: number}> = ({w, h, mm}) => {
  const g: React.ReactNode[] = [];
  for (let i = 0; i <= w / mm; i++) g.push(<line key={'v' + i} x1={i * mm} x2={i * mm} y1={0} y2={h} stroke={i % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={i % 5 ? 1 : 2.2} />);
  for (let j = 0; j <= h / mm; j++) g.push(<line key={'h' + j} x1={0} x2={w} y1={j * mm} y2={j * mm} stroke={j % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={j % 5 ? 1 : 2.2} />);
  return <g><rect width={w} height={h} fill="#FFF6F2" />{g}</g>;
};
const Panel: React.FC<{t: number; children: React.ReactNode; h?: number; y?: number}> = ({t, children, h = 760, y = 470}) => {
  const k = ap(t, 0.05, 0.4);
  return (
    <div style={{position: 'absolute', left: 60, top: y, width: 960, height: h, borderRadius: 28, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.55)', transform: `translateY(${(1 - k) * 80}px) scale(${0.96 + 0.04 * k})`, opacity: k}}>{children}</div>
  );
};
const Chip: React.FC<{x: number; y: number; s: number; c: string; children: React.ReactNode; size?: number}> = ({x, y, s, c, children, size = 40}) => (
  <div style={{position: 'absolute', left: x, top: y, padding: '10px 24px', borderRadius: 18, background: c, color: '#fff', fontFamily: FONT, fontSize: size, fontWeight: 900, transform: `scale(${s})`, transformOrigin: 'left center', opacity: Math.min(1, s * 1.5), boxShadow: '0 10px 24px rgba(0,0,0,0.4)', whiteSpace: 'nowrap'}}>{children}</div>
);

// ---------- tiêu đề bước ----------
const StepHead: React.FC<{i: number}> = ({i}) => {
  const p = usePop(0);
  const [k, v] = STEPS[i];
  return (
    <div style={{position: 'absolute', left: 60, top: 190, display: 'flex', alignItems: 'center', gap: 28, transform: `scale(${0.7 + 0.3 * p})`, transformOrigin: 'left center', opacity: Math.min(1, p * 1.4)}}>
      <div style={{width: 170, height: 170, borderRadius: 85, background: STC[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 110, fontWeight: 900, color: '#fff', boxShadow: `0 0 40px ${STC[i]}99`}}>{i + 1}</div>
      <div style={{fontFamily: FONT, lineHeight: 1}}>
        <div style={{fontSize: 52, fontWeight: 700, color: '#CBD5E1'}}>{v}</div>
        <div style={{fontSize: i === 4 ? 128 : 150, fontWeight: 900, color: STC[i], letterSpacing: -2, textShadow: `0 0 30px ${STC[i]}66`}}>{k}</div>
      </div>
    </div>
  );
};

// ---------- 0 · HOOK ----------
const Hook: React.FC = () => {
  const t = useSec();
  const beat = beatOf();
  const p1 = usePop(0.0), p2 = usePop(0.6), p3 = usePop(1.4);
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 3) {
    const tr = (((x / 260) % 0.8) + 0.8) % 0.8 - 0.3;
    pts.push(`${x},${(1290 - beatN(tr) * 90).toFixed(1)}`);
  }
  const head = (t * 700) % 1600;
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="shF" x1="0" x2="1"><stop offset="0" stopColor="#39FF8A" stopOpacity="0" /><stop offset="1" stopColor="#39FF8A" /></linearGradient>
          <clipPath id="shC"><rect x={head - 600} y={1100} width={600} height={300} /></clipPath>
        </defs>
        <Heart6 id="hk" x={175} y={690} s={1.38} prog={dp(t, 0, 0.8)} art={1} labels={false} beat={beat} />
        <polyline points={pts.join(' ')} fill="none" stroke="#39FF8A" strokeWidth={4} opacity={0.15} />
        <g clipPath="url(#shC)"><polyline points={pts.join(' ')} fill="none" stroke="url(#shF)" strokeWidth={7} /></g>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: FONT, fontSize: 120, fontWeight: 900, color: '#fff', transform: `scale(${0.6 + 0.4 * p1})`, opacity: Math.min(1, p1 * 1.5), textShadow: '0 8px 30px rgba(0,0,0,0.6)'}}>ĐỌC ECG</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: FONT, fontSize: 230, fontWeight: 900, color: '#39FF8A', lineHeight: 1, transform: `scale(${0.5 + 0.5 * p2})`, opacity: Math.min(1, p2 * 1.5), textShadow: '0 0 40px rgba(57,255,138,0.6)'}}>6 BƯỚC</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 540, display: 'flex', justifyContent: 'center'}}>
        <div style={{padding: '12px 34px', borderRadius: 18, background: '#FDE047', color: '#111', fontFamily: FONT, fontSize: 56, fontWeight: 900, transform: `rotate(-3deg) scale(${p3})`, boxShadow: '0 12px 30px rgba(0,0,0,0.5)'}}>không bỏ sót!</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 1 · KIỂM ----------
const SKiem: React.FC = () => {
  const t = useSec();
  const mm = 30;
  const cal = dp(t, 1.4, 0.7);
  const ar: string[] = [];
  for (let x = 0; x <= 360; x += 2) ar.push(`${x},${(170 - avr((x - 180) / 320) * 110).toFixed(1)}`);
  return (
    <AbsoluteFill>
      <StepHead i={0} />
      <Panel t={t}>
        <svg viewBox="0 0 960 760" width={960} height={760}>
          <Pink w={960} h={760} mm={mm} />
          <rect x={90} y={90} width={150} height={150} fill="rgba(59,130,246,0.2)" stroke="#2563EB" strokeWidth={5} opacity={ap(t, 0.4)} />
          <rect x={330} y={150} width={30} height={30} fill="#FACC15" stroke="#B45309" strokeWidth={4} opacity={ap(t, 0.6)} />
          <text x={165} y={290} textAnchor="middle" fontFamily={MONO} fontSize={40} fontWeight={700} fill="#2563EB" opacity={ap(t, 0.4)}>0,2 s</text>
          <text x={345} y={230} textAnchor="middle" fontFamily={MONO} fontSize={36} fontWeight={700} fill="#B45309" opacity={ap(t, 0.6)}>0,04 s</text>
          {/* xung chuẩn */}
          <polyline points={`40,690 120,690 120,390 270,390 270,690 330,690`} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cal} />
          <g opacity={ap(t, 1.9)}>
            <path d="M100,690 h-12 V390 h12" fill="none" stroke={PEN} strokeWidth={5} />
            <text x={150} y={560} fontFamily={MONO} fontSize={38} fontWeight={700} fill={PEN}>10 mm</text>
            <text x={150} y={606} fontFamily={MONO} fontSize={38} fontWeight={700} fill={PEN}>= 1 mV</text>
          </g>
          {/* aVR âm */}
          <g opacity={ap(t, 2.6)} transform="translate(520,360)">
            <rect x={0} y={0} width={400} height={360} rx={20} fill="#fff" stroke="#E2E8F0" strokeWidth={3} />
            <text x={24} y={56} fontFamily={MONO} fontSize={44} fontWeight={700} fill={INK}>aVR</text>
            <polyline points={ar.map((p) => p.split(',').map((v, i) => (i ? +v + 20 : +v + 20)).join(',')).join(' ')} fill="none" stroke={INK} strokeWidth={5} />
            <text x={200} y={330} textAnchor="middle" fontFamily={FONT} fontSize={46} fontWeight={900} fill="#16A34A">ÂM ✓</text>
          </g>
        </svg>
      </Panel>
    </AbsoluteFill>
  );
};

// ---------- 2 · NHỊP ----------
const SNhip: React.FC = () => {
  const t = useSec();
  const mm = 10, pxs = 250, pxmv = 100, y0 = 230, X = 40;
  const RS = [0.32, 1.12, 1.92, 2.72, 3.52];
  const pts: string[] = [];
  for (let T = 0; T <= 3.55; T += 0.004) {
    const tr = ((T % 0.8) + 0.8) % 0.8 - 0.32;
    pts.push(`${(X + T * pxs).toFixed(1)},${(y0 - beatN(tr) * pxmv).toFixed(1)}`);
  }
  const checks: [string, number][] = [['Đều', 0.8], ['Có P', 1.8], ['P (+) DII', 2.8]];
  const sx = usePop(3.4);
  return (
    <AbsoluteFill>
      <StepHead i={1} />
      <Panel t={t} h={400}>
        <svg viewBox="0 0 960 400" width={960} height={400}>
          <Pink w={960} h={400} mm={mm} />
          <text x={24} y={50} fontFamily={MONO} fontSize={40} fontWeight={700} fill={INK}>DII</text>
          <polyline points={pts.join(' ')} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dp(t, 0.1, 0.9)} />
          {RS.slice(0, -1).map((r, i) => (
            <g key={i} opacity={ap(t, 0.8 + i * 0.12, 0.25)}>
              <path d={`M${X + r * pxs},${y0 - 130} v-12 H${X + RS[i + 1] * pxs} v12`} fill="none" stroke="#2563EB" strokeWidth={5} />
              <text x={X + (r + 0.4) * pxs} y={y0 - 156} textAnchor="middle" fontFamily={MONO} fontSize={30} fontWeight={700} fill="#2563EB">0,80</text>
            </g>
          ))}
          {RS.map((r, i) => <ellipse key={i} cx={X + (r - 0.15) * pxs} cy={y0 - 10} rx={20} ry={26} fill="none" stroke={PEN} strokeWidth={5} opacity={ap(t, 1.8 + i * 0.1, 0.25)} />)}
        </svg>
      </Panel>
      {checks.map(([c, s], i) => {
        const k = ap(t, s, 0.35);
        return (
          <div key={c} style={{position: 'absolute', left: 60 + i * 325, top: 910, width: 305, padding: '22px 0', borderRadius: 22, background: k > 0.5 ? '#16A34A' : 'rgba(255,255,255,0.08)', border: '3px solid #16A34A', textAlign: 'center', fontFamily: FONT, fontSize: 44, fontWeight: 900, color: '#fff', opacity: 0.3 + 0.7 * k, transform: `scale(${0.9 + 0.1 * k})`}}>{c} {k > 0.5 ? '✓' : '?'}</div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1080, display: 'flex', justifyContent: 'center'}}>
        <div style={{padding: '14px 44px', borderRadius: 20, background: STC[1], color: '#fff', fontFamily: FONT, fontSize: 64, fontWeight: 900, transform: `scale(${sx})`, boxShadow: `0 0 40px ${STC[1]}aa`}}>= NHỊP XOANG</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 3 · SỐ ----------
const SSo: React.FC = () => {
  const t = useSec();
  const mm = 16, pxs = 400, pxmv = 150, y0 = 470, X0 = 80;
  const pts: string[] = [];
  for (let x = 0; x <= 960; x += 2) {
    const T = (x - X0) / pxs;
    const tr = (((T + 0.32) % 0.8) + 0.8) % 0.8 - 0.32;
    pts.push(`${x},${(y0 - beatN(tr) * pxmv).toFixed(1)}`);
  }
  const L = ['300', '150', '100', '75', '60', '50'];
  const hit = usePop(2.6);
  return (
    <AbsoluteFill>
      <StepHead i={2} />
      <Panel t={t} h={620}>
        <svg viewBox="0 0 960 620" width={960} height={620}>
          <Pink w={960} h={620} mm={mm} />
          <polyline points={pts.join(' ')} fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <line x1={X0} x2={X0} y1={120} y2={590} stroke="#2563EB" strokeWidth={6} opacity={ap(t, 0.3)} />
          {L.map((l, i) => {
            const x = X0 + (i + 1) * 80, on = i === 3;
            return (
              <g key={l} opacity={ap(t, 0.6 + i * 0.3, 0.2)}>
                <line x1={x} x2={x} y1={110} y2={590} stroke={on ? PEN : '#64748B'} strokeWidth={on ? 6 : 3} strokeDasharray={on ? undefined : '8 8'} />
                <text x={x} y={92} textAnchor="middle" fontFamily={MONO} fontSize={on ? 46 + 14 * Math.min(1, hit) : 36} fontWeight={700} fill={on ? PEN : '#334155'}>{l}</text>
              </g>
            );
          })}
          <circle cx={X0 + 320} cy={y0 - 1.1 * pxmv} r={44 * Math.min(1.2, hit)} fill="none" stroke={PEN} strokeWidth={7} opacity={Math.min(1, hit)} />
        </svg>
      </Panel>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1130, display: 'flex', justifyContent: 'center'}}>
        <div style={{padding: '10px 44px', borderRadius: 22, background: PEN, color: '#fff', fontFamily: MONO, fontSize: 96, fontWeight: 700, transform: `scale(${hit})`, boxShadow: '0 0 40px rgba(225,29,72,0.6)'}}>75 l/ph</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 4 · TRỤC ----------
const SAxis: React.FC = () => {
  const t = useSec();
  const th1 = usePop(0.8), th2 = usePop(1.3), ok = usePop(2.6);
  const cx = 540, cy = 1000, R = 170;
  const P = (d: number, r = R): [number, number] => [cx + r * Math.cos((d * Math.PI) / 180), cy + r * Math.sin((d * Math.PI) / 180)];
  const [a0x, a0y] = P(-30), [a1x, a1y] = P(90);
  const vec = dp(t, 2.0, 0.6);
  const [vx, vy] = P(60, (R - 10) * vec);
  return (
    <AbsoluteFill>
      <StepHead i={3} />
      {[['DI', 60, th1], ['aVF', 560, th2]].map(([n, x, s]) => (
        <div key={n as string} style={{position: 'absolute', left: x as number, top: 450, width: 460, height: 330, borderRadius: 26, background: '#FFF6F2', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', opacity: ap(t, 0.1)}}>
          <div style={{position: 'absolute', left: 24, top: 14, fontFamily: MONO, fontSize: 52, fontWeight: 700, color: INK}}>{n as string}</div>
          <svg viewBox="0 0 460 330" width={460} height={330}>
            <polyline points="90,220 180,220 195,236 230,70 248,250 262,220 370,220" fill="none" stroke="#16A34A" strokeWidth={9} strokeLinejoin="round" />
          </svg>
          <div style={{position: 'absolute', right: 20, top: 10, fontSize: 110, transform: `scale(${s as number}) rotate(${(1 - (s as number)) * -40}deg)`}}>👍</div>
        </div>
      ))}
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <g opacity={ap(t, 1.8)}>
          <circle cx={cx} cy={cy} r={R} fill="rgba(255,255,255,0.04)" stroke="#334155" strokeWidth={3} />
          <path d={`M${cx},${cy} L${a0x},${a0y} A${R},${R} 0 0 1 ${a1x},${a1y} Z`} fill="rgba(34,197,94,0.35)" stroke="#22C55E" strokeWidth={3} />
          <line x1={cx - R - 20} x2={cx + R + 20} y1={cy} y2={cy} stroke="#38BDF8" strokeWidth={3} />
          <line x1={cx} x2={cx} y1={cy - R - 20} y2={cy + R + 20} stroke="#38BDF8" strokeWidth={3} />
          <text x={cx + R + 30} y={cy + 12} fontFamily={MONO} fontSize={34} fontWeight={700} fill="#7DD3FC">I</text>
          <text x={cx - 30} y={cy + R + 56} fontFamily={MONO} fontSize={34} fontWeight={700} fill="#7DD3FC">aVF</text>
          <text x={a0x + 10} y={a0y - 10} fontFamily={MONO} fontSize={28} fill="#94A3B8">−30°</text>
          <line x1={cx} y1={cy} x2={vx} y2={vy} stroke="#FC6255" strokeWidth={10} strokeLinecap="round" />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1215, display: 'flex', justifyContent: 'center'}}>
        <div style={{padding: '10px 40px', borderRadius: 20, background: '#16A34A', color: '#fff', fontFamily: FONT, fontSize: 58, fontWeight: 900, transform: `scale(${ok})`}}>TRỤC BÌNH THƯỜNG</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 5 · KHOẢNG / 6 · ST: phóng to 1 nhát bóp ----------
const BeatPanel: React.FC<{t: number; mode: 'k' | 'st'}> = ({t, mode}) => {
  const mm = 32, pxs = 25 * mm, pxmv = 10 * mm, Y0 = 520, X0 = 330;
  const x = (tr: number) => X0 + tr * pxs;
  const pts = (a: number, b: number) => {
    const o: string[] = [];
    for (let tr = a; tr <= b + 1e-9; tr += 0.002) o.push(`${x(tr).toFixed(1)},${(Y0 - beatN(tr) * pxmv).toFixed(1)}`);
    return o.join(' ');
  };
  const BR: [number, number, number, string, string, number][] = [
    [-0.2, -0.045, 590, 'PR 3–5 ô', '#B45309', 0.4],
    [-0.045, 0.045, 150, 'QRS < 3 ô', PEN, 1.5],
    [-0.045, 0.335, 668, 'QTc < 450 ms', '#BE185D', 2.6],
  ];
  return (
    <svg viewBox="0 0 960 760" width={960} height={760}>
      <Pink w={960} h={760} mm={mm / 2} />
      <line x1={20} x2={940} y1={Y0} y2={Y0} stroke="#2563EB" strokeWidth={3} strokeDasharray="12 10" opacity={mode === 'st' ? ap(t, 0.2) : 0.35} />
      {mode === 'st' && <polyline points={pts(0.045, 0.14)} fill="none" stroke="#2563EB" strokeWidth={22} strokeLinecap="round" opacity={0.45 * ap(t, 0.4)} />}
      {mode === 'st' && <polyline points={pts(0.14, 0.335)} fill="none" stroke="#EC4899" strokeWidth={22} strokeLinecap="round" opacity={0.45 * ap(t, 2.0)} />}
      <polyline points={pts(-0.3, 0.42)} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dp(t, 0.05, 0.6)} />
      {mode === 'k' && BR.map(([a, b, y, l, c, s], i) => {
        const k = ap(t, s, 0.35);
        const up = y < Y0;
        return (
          <g key={i} opacity={k}>
            <line x1={x(a)} x2={x(a)} y1={Y0} y2={y} stroke={c} strokeWidth={3} strokeDasharray="6 6" />
            <line x1={x(b)} x2={x(b)} y1={Y0} y2={y} stroke={c} strokeWidth={3} strokeDasharray="6 6" />
            <path d={`M${x(a)},${y + (up ? 14 : -14)} v${up ? -14 : 14} H${x(a) + (x(b) - x(a)) * k} v${up ? 14 : -14}`} fill="none" stroke={c} strokeWidth={6} />
            <text x={(x(a) + x(b)) / 2} y={up ? y - 18 : y + 50} textAnchor="middle" fontFamily={FONT} fontSize={40} fontWeight={900} fill={c}>{l}</text>
          </g>
        );
      })}
      {mode === 'st' && (
        <g opacity={ap(t, 1.2)}>
          <circle cx={x(0.045)} cy={Y0 - beatN(0.045) * pxmv} r={16} fill={PEN} />
          <text x={x(0.045) - 26} y={Y0 + 70} textAnchor="end" fontFamily={FONT} fontSize={42} fontWeight={900} fill={PEN}>điểm J</text>
          <text x={x(0.1)} y={Y0 + 70} fontFamily={FONT} fontSize={40} fontWeight={900} fill="#2563EB">ST đẳng điện</text>
        </g>
      )}
      {mode === 'st' && <text x={x(0.22) + 40} y={Y0 - 0.32 * pxmv - 30} fontFamily={HAND} fontSize={48} fill="#BE185D" opacity={ap(t, 2.2)}>T cùng chiều QRS ↑</text>}
    </svg>
  );
};
const SKhoang: React.FC = () => {
  const t = useSec();
  return (<AbsoluteFill><StepHead i={4} /><Panel t={t}><BeatPanel t={t} mode="k" /></Panel></AbsoluteFill>);
};
const SST: React.FC = () => {
  const t = useSec();
  const ok = usePop(2.8);
  return (
    <AbsoluteFill>
      <StepHead i={5} />
      <Panel t={t}><BeatPanel t={t} mode="st" /></Panel>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', justifyContent: 'center'}}>
        <div style={{padding: '10px 40px', borderRadius: 20, background: '#16A34A', color: '#fff', fontFamily: FONT, fontSize: 56, fontWeight: 900, transform: `scale(${ok})`}}>ST–T BÌNH THƯỜNG ✓</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 7 · NHẮC LẠI ----------
const Recap: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', fontFamily: FONT, fontSize: 72, fontWeight: 900, color: '#fff'}}>NHỚ 1 CÂU</div>
      {STEPS.map(([k, v], i) => {
        const s = ap(t, 0.2 + i * 0.32, 0.3);
        return (
          <div key={k} style={{position: 'absolute', left: 140, top: 320 + i * 150, width: 800, height: 126, borderRadius: 26, background: 'rgba(255,255,255,0.06)', border: `4px solid ${STC[i]}`, display: 'flex', alignItems: 'center', gap: 26, padding: '0 30px', boxSizing: 'border-box', opacity: s, transform: `translateX(${(1 - s) * -120}px)`, fontFamily: FONT}}>
            <span style={{width: 84, height: 84, borderRadius: 42, background: STC[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 900, color: '#fff'}}>{i + 1}</span>
            <span style={{fontSize: 44, fontWeight: 600, color: '#CBD5E1'}}>{v}</span>
            <span style={{fontSize: 72, fontWeight: 900, color: STC[i]}}>{k}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- 8 · CTA ----------
const CTA: React.FC = () => {
  const t = useSec();
  const beat = beatOf();
  const p = usePop(0.2), q = usePop(0.9);
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="cta" x={260} y={200} s={1.0} prog={1} art={1} labels={false} beat={beat} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: FONT, fontSize: 92, fontWeight: 900, color: '#FDE047', transform: `scale(${p})`}}>🔖 LƯU LẠI ĐỂ ÔN</div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 980, padding: '26px 30px', borderRadius: 26, background: '#39FF8A', color: '#0B1218', textAlign: 'center', fontFamily: FONT, fontSize: 52, fontWeight: 900, transform: `scale(${q})`, lineHeight: 1.2}}>Xem bài đầy đủ trên kênh ▶</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 700, color: '#CBD5E1', opacity: ap(t, 1.4)}}>Bài 2: Lớn nhĩ & Phì đại thất</div>
    </AbsoluteFill>
  );
};

// ---------- khung chung ----------
const TopBar: React.FC = () => {
  const f = useCurrentFrame();
  const idx = data.scenes.findIndex((s) => f >= s.from && f < s.from + s.dur);
  return (
    <>
      <div style={{position: 'absolute', left: 60, right: 60, top: 70, display: 'flex', gap: 10}}>
        {STEPS.map((_, i) => {
          const sc = data.scenes[i + 1];
          const k = !sc ? 0 : Math.max(0, Math.min(1, (f - sc.from) / sc.dur));
          return (
            <div key={i} style={{flex: 1, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.18)', overflow: 'hidden'}}>
              <div style={{width: `${k * 100}%`, height: '100%', background: STC[i]}} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 60, top: 104, fontFamily: FONT, fontSize: 28, fontWeight: 800, letterSpacing: 3, color: '#5EEAD4', opacity: idx === 0 ? 0 : 1}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 1</div>
    </>
  );
};
const BigCap: React.FC = () => {
  const f = useCurrentFrame();
  const sc = data.scenes.find((s) => f >= s.from && f < s.from + s.dur);
  if (!sc || !sc.sents[0]) return null;
  const t = (f - sc.from) / 30, s = sc.sents[0];
  const a = Math.min(1, Math.max(0, (t - s.start + 0.2) / 0.25));
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 1330, display: 'flex', justifyContent: 'center', opacity: a}}>
      <div style={{padding: '18px 30px', borderRadius: 24, background: 'rgba(5,8,12,0.82)', border: '2px solid rgba(255,255,255,0.15)', fontFamily: FONT, fontSize: 50, fontWeight: 800, color: '#fff', textAlign: 'center', lineHeight: 1.28, transform: `translateY(${(1 - a) * 20}px)`}}>{s.text}</div>
    </div>
  );
};
const SC: React.FC[] = [Hook, SKiem, SNhip, SSo, SAxis, SKhoang, SST, Recap, CTA];
export const Short1: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 35%, #1B2E3A, #070B10 75%)', fontFamily: FONT}}>
    <Audio src={staticFile('narration.m4a')} />
    {data.scenes.map((s, i) => {
      const Comp = SC[i];
      return Comp ? (
        <Sequence key={i} from={s.from} durationInFrames={s.dur}><Comp /></Sequence>
      ) : null;
    })}
    <TopBar />
    <BigCap />
  </AbsoluteFill>
);
