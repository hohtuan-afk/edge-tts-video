// SHORT 9:16 — Bài 7 · Nhịp nhanh QRS hẹp // · Block nhánh & Block phân nhánh: QRS rộng → nhìn V1 và V6
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, Easing, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import data from '../data.json';
import {FONT} from '../lib';
import {MONO} from './Lab';
import {Heart6} from '../wb/heart6';
import {beatV, ecgAt, Lead as LeadT} from './ecg';
import {AF, FL_II, AVN_V1, AVN_II, mk, reg, QRS} from './Tachy';
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
const CAF = '#DC2626', CFL = '#F59E0B', CAV = '#06B6D4', CAP = '#A855F7';
const ST: [string, string, string][] = [['Rung nhĩ', 'không đều · không P', CAF], ['Cuồng nhĩ', 'đều ~150 · sóng F', CFL], ['Vào lại nút', 'không thấy P · r′ giả V1', CAV], ['Đường phụ', 'P sau QRS · RP ≥ 90 ms', CAP]];

const Pink: React.FC<{w: number; h: number; mm: number}> = ({w, h, mm}) => {
  const g: React.ReactNode[] = [];
  for (let i = 0; i <= w / mm; i++) g.push(<line key={'v' + i} x1={i * mm} x2={i * mm} y1={0} y2={h} stroke={i % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={i % 5 ? 1 : 2.2} />);
  for (let j = 0; j <= h / mm; j++) g.push(<line key={'h' + j} x1={0} x2={w} y1={j * mm} y2={j * mm} stroke={j % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={j % 5 ? 1 : 2.2} />);
  return <g><rect width={w} height={h} fill="#FFF6F2" />{g}</g>;
};



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

const AVR_R = reg(0.15, 0.333, 26);
const AVRT = mk(AVR_R, QRS, AVR_R.map((r) => ({t: r + 0.13, a: -0.16, w: 0.02})));
const Hook: React.FC = () => {
  const t = useSec();
  const p1 = usePop(0), p2 = usePop(0.8);
  const Q: [string, string][] = [['1. ĐỀU?', '#22C55E'], ['2. P Ở ĐÂU?', '#F59E0B'], ['3. RP?', '#06B6D4']];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: FONT, fontSize: 100, fontWeight: 900, color: '#fff', lineHeight: 1.05, transform: `scale(${0.6 + 0.4 * p1})`, opacity: Math.min(1, p1 * 1.5)}}>NHỊP NHANH<br /><span style={{color: '#4ADE80'}}>QRS HẸP?</span></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', fontFamily: FONT, fontSize: 52, fontWeight: 800, color: '#CBD5E1', opacity: ap(t, 0.4)}}>hỏi 3 câu là ra tên</div>
      <Lead t={t} f={AVN_II} label="II" x={60} w={960} q={10} base={330} />
      <div style={{position: 'absolute', left: 40, right: 40, top: 1110, display: 'flex', justifyContent: 'center', gap: 12, transform: `scale(${p2})`}}>
        {Q.map(([a, c]) => <div key={a} style={{padding: '10px 20px', borderRadius: 18, border: `4px solid ${c}`, background: 'rgba(10,16,22,0.85)', fontFamily: FONT, fontSize: 44, color: c, fontWeight: 900}}>{a}</div>)}
      </div>
    </AbsoluteFill>
  );
};
const S1: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill><StepHead i={0} />
      <Lead t={t} f={AF} label="II" x={60} w={960} q={11} base={330}>
        {(X) => <g opacity={ap(t, 1.2)}>{[0.18, 0.55, 0.78, 1.25, 1.52, 1.95, 2.13, 2.62, 2.95].map((r, i, arr) => i < arr.length - 1 ? <g key={i}><path d={`M${X(r)},${60 + (i % 2) * 30} h${X(arr[i + 1]) - X(r)}`} stroke={i % 2 ? '#2563EB' : CAF} strokeWidth={6} /></g> : null)}</g>}
      </Lead>
      <Badge s={usePop(2.2)} c={CAF}>RR mỗi nhát mỗi khác</Badge>
    </AbsoluteFill>
  );
};
const S2: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill><StepHead i={1} />
      <Lead t={t} f={FL_II} label="II" x={60} w={960} q={14} base={320}>
        {(X, Y) => <g opacity={ap(t, 1.2)}>{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => <text key={k} x={X(0.105 + k * 0.2)} y={Y(-0.2) + 60} textAnchor="middle" fontFamily={FONT} fontSize={34} fontWeight={900} fill={CFL}>F</text>)}</g>}
      </Lead>
      <Badge s={usePop(2.4)} c={CFL}>nhĩ ~300 · thất ~150</Badge>
    </AbsoluteFill>
  );
};
const S3: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill><StepHead i={2} />
      <Lead t={t} f={AVN_V1} label="V1" x={60} base={300} q={15}>
        {(X, Y) => <g opacity={ap(t, 1.2)}><circle cx={X(0.21)} cy={Y(0.12)} r={22} fill="none" stroke={PEN} strokeWidth={5} /><text x={X(0.21)} y={Y(0.12) - 34} textAnchor="middle" fontFamily={HAND} fontSize={38} fill={PEN}>r′ giả</text></g>}
      </Lead>
      <Lead t={t} f={AVN_II} label="II" x={550} base={330} q={15} delay={0.5}>
        {(X, Y) => <g opacity={ap(t, 1.6)}><circle cx={X(0.21)} cy={Y(-0.2)} r={22} fill="none" stroke={PEN} strokeWidth={5} /><text x={X(0.21)} y={Y(-0.2) + 70} textAnchor="middle" fontFamily={HAND} fontSize={38} fill={PEN}>S giả</text></g>}
      </Lead>
      <Badge s={usePop(2.4)} c={CAV}>RP &lt; 90 ms · hay gặp nhất</Badge>
    </AbsoluteFill>
  );
};
const S4: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill><StepHead i={3} />
      <Lead t={t} f={AVRT} label="II" x={60} w={960} q={22} base={330}>
        {(X, Y) => <g opacity={ap(t, 1.2)}><circle cx={X(0.28)} cy={Y(-0.12)} r={24} fill="none" stroke={CAP} strokeWidth={5} /><path d={`M${X(0.15)},${Y(0) + 90} v16 H${X(0.28)} v-16`} fill="none" stroke={PEN} strokeWidth={6} /><text x={X(0.215)} y={Y(0) + 150} textAnchor="middle" fontFamily={MONO} fontSize={36} fontWeight={700} fill={PEN}>RP ≥ 90 ms</text></g>}
      </Lead>
      <Badge s={usePop(2.4)} c={CAP}>P trên đoạn ST</Badge>
    </AbsoluteFill>
  );
};
const Recap: React.FC = () => {
  const t = useSec();
  const rows: [string, string, string][] = [['Không đều, không P', 'rung nhĩ', CAF], ['Đều ~150, sóng F', 'cuồng nhĩ', CFL], ['Không P, r′ giả V1', 'vào lại nút', CAV], ['RP ≥ 90 ms', 'qua đường phụ', CAP]];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', fontFamily: FONT, fontSize: 72, fontWeight: 900, color: '#fff'}}>NHỚ NHANH</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 900, color: '#4ADE80', opacity: ap(t, 0.1)}}>ĐỀU? – P Ở ĐÂU? – RP?</div>
      {rows.map(([k, v, c], i) => {
        const s = ap(t, 0.3 + i * 0.35, 0.3);
        return (
          <div key={k} style={{position: 'absolute', left: 50, top: 400 + i * 175, width: 980, height: 145, borderRadius: 30, background: 'rgba(255,255,255,0.06)', border: `5px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', boxSizing: 'border-box', opacity: s, transform: `translateX(${(1 - s) * -120}px)`, fontFamily: FONT}}>
            <span style={{fontSize: 42, fontWeight: 900, color: c}}>{k}</span>
            <span style={{fontSize: 42, fontWeight: 800, color: '#E2E8F0'}}>→ {v}</span>
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
        <div style={{fontSize: 96, fontWeight: 900, color: c, letterSpacing: -2, textShadow: `0 0 30px ${c}66`}}>{k}</div>
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
        <Heart6 id="cta7" x={260} y={200} s={1.0} prog={1} art={1} labels={false} beat={beat} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: FONT, fontSize: 92, fontWeight: 900, color: '#FDE047', transform: `scale(${p})`}}>🔖 LƯU LẠI ĐỂ ÔN</div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 980, padding: '26px 30px', borderRadius: 26, background: '#4ADE80', color: '#0B1218', textAlign: 'center', fontFamily: FONT, fontSize: 52, fontWeight: 900, transform: `scale(${q})`}}>Xem bài đầy đủ trên kênh ▶</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 700, color: '#CBD5E1', opacity: ap(t, 1.2)}}>Tiếp cận điện tâm đồ cơ bản · Bài 7</div>
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
      <div style={{position: 'absolute', left: 60, top: 104, fontFamily: FONT, fontSize: 28, fontWeight: 800, letterSpacing: 3, color: '#5EEAD4', opacity: idx === 0 ? 0 : 1}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 7</div>
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
export const Short7: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 35%, #0F2A22, #070B10 75%)', fontFamily: FONT}}>
    <Audio src={staticFile('narration.m4a')} />
    {data.scenes.map((s, i) => {
      const Comp = SC[i];
      return Comp ? <Sequence key={i} from={s.from} durationInFrames={s.dur}><Comp /></Sequence> : null;
    })}
    <TopBar />
    <BigCap />
  </AbsoluteFill>
);
