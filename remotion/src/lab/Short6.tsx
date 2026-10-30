// SHORT 9:16 — Bài 6 · Không chênh ≠ không tắc // · Block nhánh & Block phân nhánh: QRS rộng → nhìn V1 và V6
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, Easing, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import data from '../data.json';
import {FONT} from '../lib';
import {MONO} from './Lab';
import {Heart6} from '../wb/heart6';
import {beatV, ecgAt, Lead as LeadT} from './ecg';
import {beat, M} from './Bundle';
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
const INK = '#1E1E24', PEN = '#E11D48', CP = '#8B5CF6', CQ = '#DC2626';
const CDW = '#F43F5E', CWL = '#A855F7', CPS = '#22C55E', CSG = '#F59E0B';
const ST: [string, string, string][] = [['de Winter', 'ST↓ đi lên + T cao', CDW], ['Wellens', 'T ở V2–V3 khi hết đau', CWL], ['Thành sau', 'ST↓ tối đa V1–V4', CPS], ['Sgarbossa', 'block nhánh trái', CSG]];

const Pink: React.FC<{w: number; h: number; mm: number}> = ({w, h, mm}) => {
  const g: React.ReactNode[] = [];
  for (let i = 0; i <= w / mm; i++) g.push(<line key={'v' + i} x1={i * mm} x2={i * mm} y1={0} y2={h} stroke={i % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={i % 5 ? 1 : 2.2} />);
  for (let j = 0; j <= h / mm; j++) g.push(<line key={'h' + j} x1={0} x2={w} y1={j * mm} y2={j * mm} stroke={j % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={j % 5 ? 1 : 2.2} />);
  return <g><rect width={w} height={h} fill="#FFF6F2" />{g}</g>;
};



type Morph = Parameters<typeof beat>[0];
// ô chuyển đạo đúng tỉ lệ, nhận hàm tín hiệu
const Lead: React.FC<{t: number; f: (T: number) => number; label: string; x: number; w?: number; q?: number; base?: number; delay?: number; t0?: number; children?: (X: (x: number) => number, Y: (v: number) => number) => React.ReactNode}> = ({t, f, label, x, w = 470, q = 14, base = 330, delay = 0, t0 = -0.2, children}) => {
  const h = 560, pxs = 25 * q, pxmv = 10 * q;
  const X = (T: number) => 10 + (T - t0) * pxs, Y = (v: number) => base - v * pxmv;
  const pts: string[] = [];
  for (let T = t0; X(T) < w - 10; T += 0.002) pts.push(`${X(T).toFixed(1)},${Y(f(T)).toFixed(1)}`);
  const k = ap(t, 0.05 + delay, 0.4);
  return (
    <div style={{position: 'absolute', left: x, top: 460, width: w, height: h, borderRadius: 28, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.55)', opacity: k, transform: `translateY(${(1 - k) * 80}px)`}}>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
        <Pink w={w} h={h} mm={q} />
        <text x={22} y={56} fontFamily={MONO} fontSize={46} fontWeight={700} fill={INK}>{label}</text>
        <polyline points={pts.join(' ')} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dp(t, 0.1 + delay, 1.0)} />
        {children?.(X, Y)}
      </svg>
    </div>
  );
};
const cont = (L: LeadT) => (T: number) => ecgAt(T, L, 0.8, 0.15);
const DW3: LeadT = {r: 0.5, s: -0.8, st: -0.22, t: 1.25, tw: 0.072, tPos: 0.24};
const DW5: LeadT = {r: 1.05, s: -0.25, st: -0.14, t: 0.8, tw: 0.07};
const WB: LeadT = {r: 0.8, s: -0.6, st: 0.03, t: -0.75, tw: 0.065, tPos: 0.27};
const P1: LeadT = {r: 0.75, s: -0.35, st: -0.4, t: 0.35, tw: 0.075};
const P2: LeadT = {r: 1.05, s: -0.3, st: -0.48, t: 0.4, tw: 0.075};
const SG: Morph = {c: [[0.012, 0.007, 0.08], [0.07, 0.025, -1.2]], st: 0.3, t: [0.34, 0.06, 0.55], end: 0.14};
const CONC: Morph = {c: [[0.045, 0.02, 1.0], [0.105, 0.022, 1.1]], st: 0.3, t: [0.34, 0.06, 0.45], end: 0.145};

const Hook: React.FC = () => {
  const t = useSec();
  const p1 = usePop(0), p2 = usePop(0.8);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: FONT, fontSize: 100, fontWeight: 900, color: '#fff', lineHeight: 1.05, transform: `scale(${0.6 + 0.4 * p1})`, opacity: Math.min(1, p1 * 1.5)}}>KHÔNG CHÊNH<br /><span style={{color: '#C084FC'}}>≠ KHÔNG TẮC!</span></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', fontFamily: FONT, fontSize: 52, fontWeight: 800, color: '#CBD5E1', opacity: ap(t, 0.4)}}>4 dạng ECG dễ bỏ sót</div>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="h6k" x={230} y={500} s={1.0} prog={dp(t, 0, 0.6)} art={dp(t, 0.3, 1.2)} labels={false} beat={beatOf()} zone="ant" zoneC="#A855F7" zoneA={ap(t, 0.8) * 0.9} hot="lad" occl={ap(t, 0.6)} />
      </svg>
      <div style={{position: 'absolute', left: 40, right: 40, top: 1130, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, transform: `scale(${p2})`}}>
        {ST.map(([a, , c]) => <div key={a} style={{padding: '10px 20px', borderRadius: 18, border: `4px solid ${c}`, background: 'rgba(10,16,22,0.85)', fontFamily: FONT, fontSize: 40, color: c, fontWeight: 900}}>{a}</div>)}
      </div>
    </AbsoluteFill>
  );
};
const S1: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill><StepHead i={0} />
      <Lead t={t} f={cont(DW3)} label="V3" x={60} base={340}>
        {(X, Y) => <g opacity={ap(t, 1.2)}><circle cx={X(0.2)} cy={Y(-0.22)} r={18} fill="none" stroke="#2563EB" strokeWidth={5} /><text x={X(0.2) + 26} y={Y(-0.22) + 56} fontFamily={HAND} fontSize={38} fill="#2563EB">ST↓ đi lên</text></g>}
      </Lead>
      <Lead t={t} f={cont(DW5)} label="V5" x={550} base={340} delay={0.5}>
        {(X, Y) => <text x={X(0.37)} y={Y(0.95) - 10} textAnchor="middle" fontFamily={HAND} fontSize={38} fill={CDW} opacity={ap(t, 1.6)}>T cao, cân đối</text>}
      </Lead>
      <Badge s={usePop(2.4)} c={CDW}>→ tắc liên thất trước</Badge>
    </AbsoluteFill>
  );
};
const S2: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill><StepHead i={1} />
      <Lead t={t} f={cont(WB)} label="V2" x={60} w={960} base={260}>
        {(X, Y) => <g opacity={ap(t, 1.2)}><text x={X(0.37)} y={Y(-0.75) + 70} textAnchor="middle" fontFamily={HAND} fontSize={42} fill={CWL}>T đảo sâu, cân đối</text></g>}
      </Lead>
      <div style={{position: 'absolute', left: 60, top: 470, padding: '8px 22px', borderRadius: 16, background: '#16A34A', color: '#fff', fontFamily: FONT, fontSize: 34, fontWeight: 900, opacity: ap(t, 1.0), transform: 'translate(780px, 0)'}}>khi HẾT đau</div>
      <Badge s={usePop(2.4)} c={PEN}>⚠ tránh nghiệm pháp gắng sức</Badge>
    </AbsoluteFill>
  );
};
const S3: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill><StepHead i={2} />
      <Lead t={t} f={cont(P1)} label="V1" x={60} base={330} />
      <Lead t={t} f={cont(P2)} label="V2" x={550} base={330} delay={0.4}>
        {(X, Y) => <text x={X(0.4)} y={Y(-0.48) + 80} textAnchor="middle" fontFamily={HAND} fontSize={38} fill="#2563EB" opacity={ap(t, 1.4)}>ST↓ · R cao · T dương</text>}
      </Lead>
      <Badge s={usePop(2.4)} c={CPS}>→ gắn V7 – V9</Badge>
    </AbsoluteFill>
  );
};
const S4: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill><StepHead i={3} />
      <Lead t={t} f={(T) => beat(CONC)(T)} label="V5" x={60} base={430} q={13}>
        {(X, Y) => <g opacity={ap(t, 1.2)}><circle cx={X(0.17)} cy={Y(0.3)} r={20} fill="none" stroke={PEN} strokeWidth={5} /><text x={X(0.17)} y={Y(1.4) - 20} textAnchor="middle" fontFamily={HAND} fontSize={38} fill={PEN}>CÙNG chiều</text></g>}
      </Lead>
      <Lead t={t} f={(T) => beat(SG)(T)} label="V3" x={550} base={190} q={13} delay={0.5}>
        {(X, Y) => <g opacity={ap(t, 1.6)}><text x={X(0.07) + 26} y={Y(-1.2) + 10} fontFamily={MONO} fontSize={30} fontWeight={700} fill="#2563EB">S 12</text><text x={X(0.2)} y={Y(0) + 48} fontFamily={MONO} fontSize={30} fontWeight={700} fill={PEN}>ST 3</text><text x={X(0.3)} y={Y(-1.0)} textAnchor="middle" fontFamily={HAND} fontSize={38} fill={PEN}>3/12 = 25%</text></g>}
      </Lead>
      <Badge s={usePop(2.4)} c={CSG}>Sgarbossa cải tiến (+)</Badge>
    </AbsoluteFill>
  );
};
const Recap: React.FC = () => {
  const t = useSec();
  const rows: [string, string, string][] = [['de Winter', 'liên thất trước', CDW], ['Wellens', 'tránh gắng sức', CWL], ['Thành sau', 'gắn V7–V9', CPS], ['Sgarbossa', 'cùng chiều · ≥ 25%', CSG]];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', fontFamily: FONT, fontSize: 72, fontWeight: 900, color: '#fff'}}>NHỚ NHANH</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: FONT, fontSize: 44, fontWeight: 900, color: '#C084FC', opacity: ap(t, 0.1)}}>KHÔNG CHÊNH ≠ KHÔNG TẮC</div>
      {rows.map(([k, v, c], i) => {
        const s = ap(t, 0.3 + i * 0.35, 0.3);
        return (
          <div key={k} style={{position: 'absolute', left: 70, top: 400 + i * 175, width: 940, height: 145, borderRadius: 30, background: 'rgba(255,255,255,0.06)', border: `5px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 36px', boxSizing: 'border-box', opacity: s, transform: `translateX(${(1 - s) * -120}px)`, fontFamily: FONT}}>
            <span style={{fontSize: 58, fontWeight: 900, color: c}}>{k}</span>
            <span style={{fontSize: 44, fontWeight: 800, color: '#E2E8F0'}}>→ {v}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
const StepHead: React.FC<{i: number}> = ({i}) => {
  const p = usePop(0);
  const [k, v, c] = ST[i];
  return (
    <div style={{position: 'absolute', left: 60, top: 190, display: 'flex', alignItems: 'center', gap: 28, transform: `scale(${0.7 + 0.3 * p})`, transformOrigin: 'left center', opacity: Math.min(1, p * 1.4)}}>
      <div style={{width: 170, height: 170, borderRadius: 85, background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 110, fontWeight: 900, color: '#fff', boxShadow: `0 0 40px ${c}99`}}>{i + 1}</div>
      <div style={{fontFamily: FONT, lineHeight: 1}}>
        <div style={{fontSize: 112, fontWeight: 900, color: c, letterSpacing: -2, textShadow: `0 0 30px ${c}66`}}>{k}</div>
        <div style={{fontSize: 50, fontWeight: 800, color: '#E2E8F0', marginTop: 8}}>{v}</div>
      </div>
    </div>
  );
};
const Badge: React.FC<{s: number; c: string; children: React.ReactNode}> = ({s, c, children}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 1110, display: 'flex', justifyContent: 'center'}}>
    <div style={{padding: '12px 40px', borderRadius: 20, background: c, color: '#fff', fontFamily: FONT, fontSize: 60, fontWeight: 900, transform: `scale(${s})`, boxShadow: `0 0 40px ${c}aa`}}>{children}</div>
  </div>
);

const CTA: React.FC = () => {
  const t = useSec();
  const beat = beatOf();
  const p = usePop(0.2), q = usePop(0.9);
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="cta6" x={260} y={200} s={1.0} prog={1} art={1} labels={false} beat={beat} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: FONT, fontSize: 92, fontWeight: 900, color: '#FDE047', transform: `scale(${p})`}}>🔖 LƯU LẠI ĐỂ ÔN</div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 980, padding: '26px 30px', borderRadius: 26, background: '#C084FC', color: '#0B1218', textAlign: 'center', fontFamily: FONT, fontSize: 52, fontWeight: 900, transform: `scale(${q})`}}>Xem bài đầy đủ trên kênh ▶</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 700, color: '#CBD5E1', opacity: ap(t, 1.2)}}>Tiếp cận điện tâm đồ cơ bản · Bài 6</div>
    </AbsoluteFill>
  );
};
const TopBar: React.FC = () => {
  const f = useCurrentFrame();
  const idx = data.scenes.findIndex((s) => f >= s.from && f < s.from + s.dur);
  return (
    <>
      <div style={{position: 'absolute', left: 60, right: 60, top: 70, display: 'flex', gap: 10}}>
        {ST.map(([, , c], i) => {
          const sc = data.scenes[i + 1];
          const k = !sc ? 0 : Math.max(0, Math.min(1, (f - sc.from) / sc.dur));
          return <div key={i} style={{flex: 1, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.18)', overflow: 'hidden'}}><div style={{width: `${k * 100}%`, height: '100%', background: c}} /></div>;
        })}
      </div>
      <div style={{position: 'absolute', left: 60, top: 104, fontFamily: FONT, fontSize: 28, fontWeight: 800, letterSpacing: 3, color: '#5EEAD4', opacity: idx === 0 ? 0 : 1}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 6</div>
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
      <div style={{padding: '18px 30px', borderRadius: 24, background: 'rgba(5,8,12,0.82)', border: '2px solid rgba(255,255,255,0.15)', fontFamily: FONT, fontSize: 50, fontWeight: 800, color: '#fff', textAlign: 'center', lineHeight: 1.28}}>{s.text}</div>
    </div>
  );
};
const SC: React.FC[] = [Hook, S1, S2, S3, S4, Recap, CTA];
export const Short6: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 35%, #2A1636, #070B10 75%)', fontFamily: FONT}}>
    <Audio src={staticFile('narration.m4a')} />
    {data.scenes.map((s, i) => {
      const Comp = SC[i];
      return Comp ? <Sequence key={i} from={s.from} durationInFrames={s.dur}><Comp /></Sequence> : null;
    })}
    <TopBar />
    <BigCap />
  </AbsoluteFill>
);
