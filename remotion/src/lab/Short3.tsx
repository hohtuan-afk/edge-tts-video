// SHORT 9:16 — Bài 3 · Block nhĩ thất: Tìm P – Đo PR – Xem RƠI
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, Easing, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import data from '../data.json';
import {FONT} from '../lib';
import {MONO} from './Lab';
import {Heart6} from '../wb/heart6';

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
const ST: [string, string, string][] = [['Độ I', 'dài mà KHÔNG RƠI', '#F59E0B'], ['Mobitz I', 'dài… dài… RƠI', '#F97316'], ['Mobitz II', 'đang yên bỗng RƠI', '#DC2626'], ['Độ III', 'mỗi bên một đường', '#7C3AED']];

const Pink: React.FC<{w: number; h: number; mm: number}> = ({w, h, mm}) => {
  const g: React.ReactNode[] = [];
  for (let i = 0; i <= w / mm; i++) g.push(<line key={'v' + i} x1={i * mm} x2={i * mm} y1={0} y2={h} stroke={i % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={i % 5 ? 1 : 2.2} />);
  for (let j = 0; j <= h / mm; j++) g.push(<line key={'h' + j} x1={0} x2={w} y1={j * mm} y2={j * mm} stroke={j % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={j % 5 ? 1 : 2.2} />);
  return <g><rect width={w} height={h} fill="#FFF6F2" />{g}</g>;
};
type Ev = {p: number; pr: number | null; wide?: boolean};
const g = (x: number, mu: number, w: number, a: number) => a * Math.exp(-((x - mu) ** 2) / (2 * w * w));
const qrsN = (x: number) => g(x, -0.03, 0.009, -0.08) + g(x, 0, 0.011, 1.15) + g(x, 0.026, 0.01, -0.25) + g(x, 0.24, 0.045, 0.3);
const qrsW = (x: number) => g(x, -0.02, 0.02, 0.15) + g(x, 0.03, 0.025, 1.0) + g(x, 0.09, 0.03, -0.35) + g(x, 0.3, 0.06, -0.35);
const sig = (evs: Ev[], extra: {t: number; wide?: boolean}[] = []) => (T: number) => {
  let v = 0;
  for (const e of evs) {v += g(T, e.p + 0.05, 0.022, 0.16); if (e.pr !== null) v += (e.wide ? qrsW : qrsN)(T - (e.p + e.pr));}
  for (const q of extra) v += (q.wide ? qrsW : qrsN)(T - q.t);
  return v;
};
const seq = (s: number, pp: number, prs: (number | null)[], wide = false): Ev[] => prs.map((pr, i) => ({p: s + i * pp, pr, wide}));
// dải nhịp 960 px, 2,4 s hiển thị
const Panel: React.FC<{t: number; evs: Ev[]; extra?: {t: number; wide?: boolean}[]; marks?: boolean; prColor?: (i: number) => string; laneMode?: boolean}> = ({t, evs, extra = [], marks = true, prColor, laneMode}) => {
  const w = 960, h = 560, mm = 12, pxs = 25 * mm, pxmv = 10 * mm, B = 330;
  const X = (T: number) => 20 + T * pxs, Y = (v: number) => B - v * pxmv;
  const f = sig(evs, extra);
  const pts: string[] = [];
  for (let T = 0; T <= 3.1; T += 0.003) pts.push(`${X(T).toFixed(1)},${Y(f(T)).toFixed(1)}`);
  const k = ap(t, 0.05, 0.4);
  let ci = 0;
  return (
    <div style={{position: 'absolute', left: 60, top: 460, width: w, height: h, borderRadius: 28, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.55)', opacity: k, transform: `translateY(${(1 - k) * 80}px)`}}>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
        <Pink w={w} h={h} mm={mm} />
        <text x={20} y={50} fontFamily={MONO} fontSize={40} fontWeight={700} fill={INK}>DII</text>
        <polyline points={pts.join(' ')} fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dp(t, 0.1, 1.2)} />
        {marks && evs.map((e, i) => {
          if (X(e.p) > w - 40) return null;
          const a = ap(t, 0.6 + i * 0.35, 0.3);
          if (e.pr === null) return (
            <g key={i} opacity={a} transform={`translate(${X(e.p + 0.05)} ${Y(0) - 150}) scale(${0.6 + 0.4 * a})`}>
              <circle r={34} fill={PEN} /><path d="M-14,-14 L14,14 M14,-14 L-14,14" stroke="#fff" strokeWidth={7} strokeLinecap="round" />
            </g>
          );
          const c = prColor ? prColor(ci++) : '#F59E0B';
          return (
            <g key={i} opacity={a}>
              <path d={`M${X(e.p + 0.028)},${Y(0) + 70} v14 H${X(e.p + e.pr - 0.025)} v-14`} fill="none" stroke={c} strokeWidth={7} />
              <text x={(X(e.p) + X(e.p + e.pr)) / 2} y={Y(0) + 130} textAnchor="middle" fontFamily={MONO} fontSize={34} fontWeight={700} fill={c}>{e.pr.toFixed(2).replace('.', ',')}</text>
            </g>
          );
        })}
        {laneMode && (
          <g opacity={ap(t, 1.0)}>
            {evs.map((e, i) => X(e.p) < w - 20 && <g key={i}><line x1={X(e.p + 0.05)} x2={X(e.p + 0.05)} y1={90} y2={Y(0.16) - 22} stroke={CP} strokeWidth={4} strokeDasharray="8 7" /><circle cx={X(e.p + 0.05)} cy={90} r={13} fill={CP} /></g>)}
            {extra.map((q, i) => <g key={i}><line x1={X(q.t + 0.03)} x2={X(q.t + 0.03)} y1={Y(-0.4)} y2={530} stroke={CQ} strokeWidth={4} strokeDasharray="8 7" /><circle cx={X(q.t + 0.03)} cy={530} r={13} fill={CQ} /></g>)}
          </g>
        )}
      </svg>
    </div>
  );
};
const StepHead: React.FC<{i: number}> = ({i}) => {
  const p = usePop(0);
  const [k, v, c] = ST[i];
  return (
    <div style={{position: 'absolute', left: 60, top: 190, display: 'flex', alignItems: 'center', gap: 28, transform: `scale(${0.7 + 0.3 * p})`, transformOrigin: 'left center', opacity: Math.min(1, p * 1.4)}}>
      <div style={{width: 170, height: 170, borderRadius: 85, background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 110, fontWeight: 900, color: '#fff', boxShadow: `0 0 40px ${c}99`}}>{i + 1}</div>
      <div style={{fontFamily: FONT, lineHeight: 1}}>
        <div style={{fontSize: 130, fontWeight: 900, color: c, letterSpacing: -2, textShadow: `0 0 30px ${c}66`}}>{k}</div>
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

const Hook: React.FC = () => {
  const t = useSec();
  const beat = beatOf();
  const p1 = usePop(0), p2 = usePop(0.7);
  const M: [string, string, string][] = [['Tìm', 'P', CP], ['Đo', 'PR', '#F59E0B'], ['Xem', 'RƠI', PEN]];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: FONT, fontSize: 104, fontWeight: 900, color: '#fff', lineHeight: 1.05, transform: `scale(${0.6 + 0.4 * p1})`, opacity: Math.min(1, p1 * 1.5)}}>BLOCK<br /><span style={{color: '#FBBF24'}}>NHĨ THẤT</span></div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', fontFamily: FONT, fontSize: 52, fontWeight: 800, color: '#CBD5E1', opacity: ap(t, 0.4)}}>nhìn 1 dải nhịp là biết độ mấy!</div>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="h3k" x={250} y={520} s={1.05} prog={dp(t, 0, 0.6)} art={1} labels={false} beat={beat} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, display: 'flex', justifyContent: 'center', gap: 16, transform: `scale(${p2})`}}>
        {M.map(([a, b, c]) => <div key={b} style={{padding: '12px 26px', borderRadius: 20, border: `4px solid ${c}`, background: 'rgba(10,16,22,0.85)', fontFamily: FONT, fontSize: 38, color: '#CBD5E1', fontWeight: 600}}>{a} <b style={{color: c, fontSize: 52}}>{b}</b></div>)}
      </div>
    </AbsoluteFill>
  );
};
const S1: React.FC = () => {const t = useSec(); return <AbsoluteFill><StepHead i={0} /><Panel t={t} evs={seq(0.08, 0.9, [0.3, 0.3, 0.3, 0.3])} /><Badge s={usePop(2.4)} c="#F59E0B">PR &gt; 0,20 s · cố định</Badge></AbsoluteFill>;};
const PRC = ['#FACC15', '#F97316', '#DC2626'];
const S2: React.FC = () => {const t = useSec(); return <AbsoluteFill><StepHead i={1} /><Panel t={t} evs={seq(0.06, 0.66, [0.16, 0.24, 0.32, null, 0.16])} prColor={(i) => PRC[i % 3]} /><Badge s={usePop(2.4)} c="#F97316">dài… dài… dài… RƠI!</Badge></AbsoluteFill>;};
const S3: React.FC = () => {const t = useSec(); return <AbsoluteFill><StepHead i={2} /><Panel t={t} evs={seq(0.06, 0.7, [0.16, 0.16, null, 0.16, 0.16], true)} prColor={() => '#16A34A'} /><Badge s={usePop(2.4)} c="#DC2626">PR cố định → bỗng RƠI</Badge></AbsoluteFill>;};
const S4: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill><StepHead i={3} />
      <Panel t={t} evs={Array.from({length: 6}, (_, i) => ({p: 0.06 + i * 0.55, pr: null}))} extra={[{t: 0.42, wide: true}, {t: 2.05, wide: true}]} marks={false} laneMode />
      <Badge s={usePop(2.4)} c="#7C3AED">nhĩ NHANH hơn thất</Badge>
    </AbsoluteFill>
  );
};
const Recap: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', fontFamily: FONT, fontSize: 72, fontWeight: 900, color: '#fff'}}>NHỚ NHANH</div>
      {ST.map(([k, v, c], i) => {
        const s = ap(t, 0.2 + i * 0.35, 0.3);
        return (
          <div key={k} style={{position: 'absolute', left: 70, top: 320 + i * 180, width: 940, height: 150, borderRadius: 30, background: 'rgba(255,255,255,0.06)', border: `5px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 36px', boxSizing: 'border-box', opacity: s, transform: `translateX(${(1 - s) * -120}px)`, fontFamily: FONT}}>
            <span style={{fontSize: 64, fontWeight: 900, color: c}}>{k}</span>
            <span style={{fontSize: 44, fontWeight: 800, color: '#E2E8F0'}}>{v}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
const CTA: React.FC = () => {
  const t = useSec();
  const beat = beatOf();
  const p = usePop(0.2), q = usePop(0.9);
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="cta3" x={260} y={200} s={1.0} prog={1} art={1} labels={false} beat={beat} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: FONT, fontSize: 92, fontWeight: 900, color: '#FDE047', transform: `scale(${p})`}}>🔖 LƯU LẠI ĐỂ ÔN</div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 980, padding: '26px 30px', borderRadius: 26, background: '#FBBF24', color: '#0B1218', textAlign: 'center', fontFamily: FONT, fontSize: 52, fontWeight: 900, transform: `scale(${q})`}}>Xem bài đầy đủ trên kênh ▶</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 700, color: '#CBD5E1', opacity: ap(t, 1.2)}}>Tiếp cận điện tâm đồ cơ bản · Bài 3</div>
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
      <div style={{position: 'absolute', left: 60, top: 104, fontFamily: FONT, fontSize: 28, fontWeight: 800, letterSpacing: 3, color: '#5EEAD4', opacity: idx === 0 ? 0 : 1}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 3</div>
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
export const Short3: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 35%, #2B2410, #070B10 75%)', fontFamily: FONT}}>
    <Audio src={staticFile('narration.m4a')} />
    {data.scenes.map((s, i) => {
      const Comp = SC[i];
      return Comp ? <Sequence key={i} from={s.from} durationInFrames={s.dur}><Comp /></Sequence> : null;
    })}
    <TopBar />
    <BigCap />
  </AbsoluteFill>
);
