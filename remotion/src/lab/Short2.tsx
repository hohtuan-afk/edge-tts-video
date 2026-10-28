// SHORT 9:16 — Bài 2 · Lớn nhĩ & Phì đại thất: CAO – RỘNG – CỘNG – LẬT
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, Easing, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import data from '../data.json';
import {FONT} from '../lib';
import {MONO} from './Lab';
import {Heart6, Zone6} from '../wb/heart6';
import {tracePts, beatV, Lead} from './ecg';

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
const C = {ra: '#A78BFA', la: '#FB923C', lv: '#F87171', rv: '#60A5FA'};
const CD = {ra: '#8B5CF6', la: '#F97316', lv: '#DC2626', rv: '#2563EB'};
const KW: [string, string, keyof typeof C][] = [['lớn nhĩ phải', 'CAO', 'ra'], ['lớn nhĩ trái', 'RỘNG', 'la'], ['phì đại thất trái', 'CỘNG', 'lv'], ['phì đại thất phải', 'LẬT', 'rv']];

const Pink: React.FC<{w: number; h: number; mm: number}> = ({w, h, mm}) => {
  const g: React.ReactNode[] = [];
  for (let i = 0; i <= w / mm; i++) g.push(<line key={'v' + i} x1={i * mm} x2={i * mm} y1={0} y2={h} stroke={i % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={i % 5 ? 1 : 2.2} />);
  for (let j = 0; j <= h / mm; j++) g.push(<line key={'h' + j} x1={0} x2={w} y1={j * mm} y2={j * mm} stroke={j % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={j % 5 ? 1 : 2.2} />);
  return <g><rect width={w} height={h} fill="#FFF6F2" />{g}</g>;
};
const Panel: React.FC<{t: number; children: React.ReactNode; h?: number; y?: number}> = ({t, children, h = 640, y = 470}) => {
  const k = ap(t, 0.05, 0.4);
  return <div style={{position: 'absolute', left: 60, top: y, width: 960, height: h, borderRadius: 28, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.55)', transform: `translateY(${(1 - k) * 80}px) scale(${0.96 + 0.04 * k})`, opacity: k}}>{children}</div>;
};
const Badge: React.FC<{s: number; c: string; top: number; children: React.ReactNode; size?: number}> = ({s, c, top, children, size = 60}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top, display: 'flex', justifyContent: 'center'}}>
    <div style={{padding: '10px 40px', borderRadius: 20, background: c, color: '#fff', fontFamily: FONT, fontSize: size, fontWeight: 900, transform: `scale(${s})`, boxShadow: `0 0 40px ${c}aa`}}>{children}</div>
  </div>
);
const StepHead: React.FC<{i: number}> = ({i}) => {
  const p = usePop(0);
  const [v, k, z] = KW[i];
  return (
    <div style={{position: 'absolute', left: 60, top: 190, display: 'flex', alignItems: 'center', gap: 28, transform: `scale(${0.7 + 0.3 * p})`, transformOrigin: 'left center', opacity: Math.min(1, p * 1.4)}}>
      <div style={{width: 170, height: 170, borderRadius: 85, background: CD[z], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 110, fontWeight: 900, color: '#fff', boxShadow: `0 0 40px ${CD[z]}99`}}>{i + 1}</div>
      <div style={{fontFamily: FONT, lineHeight: 1}}>
        <div style={{fontSize: 52, fontWeight: 700, color: '#CBD5E1'}}>{v}</div>
        <div style={{fontSize: 150, fontWeight: 900, color: C[z], letterSpacing: -2, textShadow: `0 0 30px ${C[z]}66`}}>{k}</div>
      </div>
    </div>
  );
};
const MiniHeart: React.FC<{z: Zone6; c: string; t: number}> = ({z, c, t}) => (
  <div style={{position: 'absolute', right: 60, top: 170, width: 220, height: 230, borderRadius: 20, background: '#FCFAF4', overflow: 'hidden', boxShadow: '0 14px 30px rgba(0,0,0,0.5)', opacity: ap(t, 0.2)}}>
    <svg viewBox="0 0 240 250" width={220} height={230}><Heart6 id={'s2' + z} x={-8} y={4} s={0.46} prog={1} art={1} labels={false} zone={z} zoneC={c} zoneA={ap(t, 0.4, 0.5)} /></svg>
  </div>
);

// sóng P: 2 thành phần
const gs = (x: number, mu: number, w: number, a: number) => a * Math.exp(-((x - mu) ** 2) / (2 * w * w));
type P2 = [number, number, number, number, number, number]; // muR,wR,aR,muL,wL,aL
const PN: P2 = [0.04, 0.018, 0.085, 0.07, 0.02, 0.075];
const PWave: React.FC<{t: number; target: P2; mark: 'h' | 'w'}> = ({t, target, mark}) => {
  const k = dp(t, 0.8, 1.2);
  const p = PN.map((v, i) => v + (target[i] - v) * k) as P2;
  const f = (x: number) => gs(x, p[0], p[1], p[2]) + gs(x, p[3], p[4], p[5]);
  const X = (x: number) => 80 + (x + 0.04) * 3200, Y0 = 470, PX = 1300;
  const pts = (fn: (x: number) => number) => {
    const o: string[] = [];
    for (let x = -0.04; x <= 0.2; x += 0.002) o.push(`${X(x).toFixed(1)},${(Y0 - fn(x) * PX).toFixed(1)}`);
    return o.join(' ');
  };
  const ref = (x: number) => gs(x, PN[0], PN[1], PN[2]) + gs(x, PN[3], PN[4], PN[5]);
  return (
    <svg viewBox="0 0 960 640" width={960} height={640}>
      <Pink w={960} h={640} mm={32} />
      <text x={24} y={56} fontFamily={MONO} fontSize={44} fontWeight={700} fill={INK}>DII · P phóng to</text>
      <line x1={20} x2={940} y1={Y0} y2={Y0} stroke="#94A3B8" strokeWidth={3} strokeDasharray="10 8" />
      <polyline points={pts(ref)} fill="none" stroke="#94A3B8" strokeWidth={5} strokeDasharray="12 9" />
      <polyline points={pts((x) => gs(x, p[0], p[1], p[2]))} fill="none" stroke={CD.ra} strokeWidth={5} opacity={0.8} />
      <polyline points={pts((x) => gs(x, p[3], p[4], p[5]))} fill="none" stroke={CD.la} strokeWidth={5} opacity={0.8} />
      <polyline points={pts(f)} fill="none" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
      {mark === 'h' && (
        <g opacity={ap(t, 1.6)}>
          <line x1={20} x2={940} y1={Y0 - 0.25 * PX} y2={Y0 - 0.25 * PX} stroke={CD.ra} strokeWidth={5} strokeDasharray="16 10" />
          <text x={930} y={Y0 - 0.25 * PX - 16} textAnchor="end" fontFamily={MONO} fontSize={44} fontWeight={700} fill={CD.ra}>2,5 mm</text>
        </g>
      )}
      {mark === 'w' && (
        <g opacity={ap(t, 1.6)}>
          <path d={`M${X(-0.012)},${Y0 + 50} v18 H${X(0.13)} v-18`} fill="none" stroke={CD.la} strokeWidth={7} />
          <text x={(X(-0.012) + X(0.13)) / 2} y={Y0 + 125} textAnchor="middle" fontFamily={MONO} fontSize={48} fontWeight={700} fill={CD.la}>&gt; 0,11 s</text>
        </g>
      )}
      <text x={24} y={620} fontFamily={FONT} fontSize={30} fontWeight={800} fill="#64748B">– – – P bình thường</text>
    </svg>
  );
};

// ---------- cảnh ----------
const Hook: React.FC = () => {
  const t = useSec();
  const beat = beatOf();
  const p1 = usePop(0), p2 = usePop(0.6);
  const ci = Math.min(3, Math.floor(t / 0.55));
  const [, , z] = KW[ci];
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: FONT, fontSize: 96, fontWeight: 900, color: '#fff', lineHeight: 1.08, transform: `scale(${0.6 + 0.4 * p1})`, opacity: Math.min(1, p1 * 1.5), textShadow: '0 8px 30px rgba(0,0,0,0.6)'}}>Nhìn ECG,<br />đoán buồng tim<br /><span style={{color: '#FB7185'}}>nào đang TO?</span></div>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="h2k" x={210} y={590} s={1.2} prog={dp(t, 0, 0.6)} art={1} labels={false} beat={beat} zone={z as Zone6} zoneC={CD[z]} zoneA={0.9} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1200, display: 'flex', justifyContent: 'center', gap: 14, transform: `scale(${p2})`}}>
        {KW.map(([, k, zz], i) => <div key={k} style={{padding: '10px 22px', borderRadius: 20, border: `4px solid ${CD[zz]}`, background: i === ci ? CD[zz] : 'rgba(10,16,22,0.8)', color: '#fff', fontFamily: FONT, fontSize: 46, fontWeight: 900}}>{k}</div>)}
      </div>
    </AbsoluteFill>
  );
};
const Rule: React.FC = () => {
  const t = useSec();
  const p1 = usePop(0.1), p2 = usePop(1.0);
  return (
    <AbsoluteFill>
      {[['NHĨ', 'xem P', '#A78BFA', p1, 330], ['THẤT', 'xem QRS', '#F87171', p2, 820]].map(([a, b, c, s, y]) => (
        <div key={a as string} style={{position: 'absolute', left: 80, right: 80, top: y as number, height: 400, borderRadius: 36, border: `5px solid ${c}`, background: 'rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${s as number})`, fontFamily: FONT}}>
          <div style={{fontSize: 150, fontWeight: 900, color: c as string, lineHeight: 1}}>{a as string}</div>
          <div style={{fontSize: 90, fontWeight: 900, color: '#FDE047'}}>{b as string}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
const RAE: React.FC = () => {
  const t = useSec();
  return (<AbsoluteFill><StepHead i={0} /><MiniHeart z="ra" c={CD.ra} t={t} /><Panel t={t}><PWave t={t} target={[0.04, 0.018, 0.25, 0.07, 0.02, 0.06]} mark="h" /></Panel><Badge s={usePop(2.4)} c={CD.ra} top={1150}>P CAO, nhọn ↑</Badge></AbsoluteFill>);
};
const LAE: React.FC = () => {
  const t = useSec();
  return (<AbsoluteFill><StepHead i={1} /><MiniHeart z="la" c={CD.la} t={t} /><Panel t={t}><PWave t={t} target={[0.04, 0.018, 0.09, 0.1, 0.022, 0.1]} mark="w" /></Panel><Badge s={usePop(2.4)} c={CD.la} top={1150}>P RỘNG, 2 đỉnh ↔</Badge></AbsoluteFill>);
};
const V1L: Lead = {p: 0.1, r: 0.25, s: -1.6, t: 0.25, tw: 0.07};
const V5L: Lead = {p: 0.1, q: -0.1, r: 2.2, s: -0.12, t: 0.45, tw: 0.07};
const LVH: React.FC = () => {
  const t = useSec();
  const mm = 9, pxs = 25 * mm, pxmv = 10 * mm, B = 290, RT = 1.08;
  const sV = -beatV(0.03, V1L), rV = beatV(0, V5L);
  const k1 = dp(t, 1.0, 0.6), k2 = dp(t, 1.6, 0.6);
  const ok = usePop(2.6);
  const BX = 450, BB = 1300, kk = 7;
  return (
    <AbsoluteFill>
      <StepHead i={2} /><MiniHeart z="lv" c={CD.lv} t={t} />
      <Panel t={t} h={480}>
        <svg viewBox="0 0 960 480" width={960} height={480}>
          <Pink w={960} h={480} mm={mm * 2} />
          <line x1={480} x2={480} y1={0} y2={480} stroke="#D6B3AD" strokeWidth={4} />
          {[['V1', 0, V1L], ['V5', 480, V5L]].map(([n, ox, L]) => (
            <g key={n as string}>
              <text x={(ox as number) + 18} y={52} fontFamily={MONO} fontSize={44} fontWeight={700} fill={INK}>{n as string}</text>
              <polyline points={tracePts((ox as number) + 10, B, 0, 1.95, pxs, pxmv, L as Lead, 0.8, 0.003)} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
            </g>
          ))}
          <rect x={10 + RT * pxs - 16} y={B} width={32} height={sV * pxmv} fill="rgba(14,165,233,0.35)" opacity={k1} />
          <rect x={490 + RT * pxs - 16} y={B - rV * pxmv} width={32} height={rV * pxmv} fill="rgba(220,38,38,0.3)" opacity={k2} />
          <text x={10 + RT * pxs + 50} y={B + sV * pxmv - 10} fontFamily={MONO} fontSize={40} fontWeight={700} fill="#0284C7" opacity={k1}>S 16</text>
          <text x={490 + RT * pxs + 50} y={B - rV * pxmv + 40} fontFamily={MONO} fontSize={40} fontWeight={700} fill={CD.lv} opacity={k2}>R 22</text>
        </svg>
      </Panel>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <line x1={BX - 120} x2={BX + 300} y1={BB - 35 * kk} y2={BB - 35 * kk} stroke="#FDE047" strokeWidth={5} strokeDasharray="16 10" opacity={ap(t, 1.0)} />
        <text x={BX - 130} y={BB - 35 * kk + 14} textAnchor="end" fontFamily={MONO} fontSize={40} fontWeight={700} fill="#FDE047" opacity={ap(t, 1.0)}>35</text>
        <rect x={BX} y={BB - 16 * kk * k1} width={180} height={16 * kk * k1} fill="#0284C7" />
        <rect x={BX} y={BB - 16 * kk - 22 * kk * k2} width={180} height={22 * kk * k2} fill={CD.lv} opacity={k2 > 0.01 ? 1 : 0} />
        <text x={BX + 90} y={BB - 8 * kk + 14} textAnchor="middle" fontFamily={MONO} fontSize={40} fontWeight={700} fill="#fff" opacity={k1}>16</text>
        <text x={BX + 90} y={BB - 27 * kk + 14} textAnchor="middle" fontFamily={MONO} fontSize={40} fontWeight={700} fill="#fff" opacity={k2}>22</text>
        <text x={BX + 220} y={BB - 38 * kk + 14} fontFamily={MONO} fontSize={64} fontWeight={700} fill="#4ADE80" opacity={ok > 0.1 ? 1 : 0} transform={`translate(${BX + 220} ${BB - 38 * kk}) scale(${ok}) translate(${-(BX + 220)} ${-(BB - 38 * kk)})`}>= 38 ✓</text>
      </svg>
    </AbsoluteFill>
  );
};
const V1N: Lead = {p: 0.1, r: 0.25, s: -1.0, t: 0.15};
const V1R: Lead = {p: 0.18, r: 1.0, s: -0.25, st: -0.06, t: -0.2};
const mix = (a: Lead, b: Lead, k: number): Lead => {
  const o: Lead = {};
  (['p', 'r', 's', 't', 'st'] as const).forEach((n) => (o[n] = (a[n] ?? 0) * (1 - k) + (b[n] ?? 0) * k));
  return o;
};
const RVH: React.FC = () => {
  const t = useSec();
  const k = dp(t, 1.0, 1.0);
  const ok = usePop(2.4);
  const mm = 12;
  return (
    <AbsoluteFill>
      <StepHead i={3} /><MiniHeart z="rv" c={CD.rv} t={t} />
      <Panel t={t} h={560}>
        <svg viewBox="0 0 960 560" width={960} height={560}>
          <Pink w={960} h={560} mm={mm * 2} />
          <text x={24} y={56} fontFamily={MONO} fontSize={48} fontWeight={700} fill={INK}>V1</text>
          <polyline points={tracePts(10, 330, 0, 3.15, 25 * mm, 10 * mm, mix(V1N, V1R, k), 0.8, 0.003)} fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        </svg>
      </Panel>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1060, textAlign: 'center', fontFamily: FONT, fontSize: 56, fontWeight: 900, color: k > 0.5 ? C.rv : '#CBD5E1'}}>{k > 0.5 ? 'R > S' : 'bình thường: S > R'}</div>
      <Badge s={ok} c={CD.rv} top={1150}>V1 LẬT ngược ↕</Badge>
    </AbsoluteFill>
  );
};
const Recap: React.FC = () => {
  const t = useSec();
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', fontFamily: FONT, fontSize: 72, fontWeight: 900, color: '#fff'}}>NHỚ 4 CHỮ</div>
      {KW.map(([v, k, z], i) => {
        const s = ap(t, 0.2 + i * 0.4, 0.3);
        return (
          <div key={k} style={{position: 'absolute', left: 90, top: 320 + i * 190, width: 900, height: 160, borderRadius: 30, background: 'rgba(255,255,255,0.06)', border: `5px solid ${CD[z]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', boxSizing: 'border-box', opacity: s, transform: `translateX(${(1 - s) * -120}px)`, fontFamily: FONT}}>
            <span style={{fontSize: 48, fontWeight: 700, color: '#CBD5E1'}}>{v}</span>
            <span style={{fontSize: 96, fontWeight: 900, color: C[z]}}>{k}</span>
          </div>
        );
      })}
      <Badge s={usePop(2.6)} c="#0F766E" top={1110} size={46}>Siêu âm tim mới khẳng định</Badge>
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
        <Heart6 id="cta2" x={260} y={200} s={1.0} prog={1} art={1} labels={false} beat={beat} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: FONT, fontSize: 92, fontWeight: 900, color: '#FDE047', transform: `scale(${p})`}}>🔖 LƯU LẠI ĐỂ ÔN</div>
      <div style={{position: 'absolute', left: 80, right: 80, top: 980, padding: '26px 30px', borderRadius: 26, background: '#FB7185', color: '#0B1218', textAlign: 'center', fontFamily: FONT, fontSize: 52, fontWeight: 900, transform: `scale(${q})`}}>Xem bài đầy đủ trên kênh ▶</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 700, color: '#CBD5E1', opacity: ap(t, 1.2)}}>Tiếp cận điện tâm đồ cơ bản · Bài 2</div>
    </AbsoluteFill>
  );
};

const TopBar: React.FC = () => {
  const f = useCurrentFrame();
  const idx = data.scenes.findIndex((s) => f >= s.from && f < s.from + s.dur);
  return (
    <>
      <div style={{position: 'absolute', left: 60, right: 60, top: 70, display: 'flex', gap: 10}}>
        {KW.map(([, , z], i) => {
          const sc = data.scenes[i + 2];
          const k = !sc ? 0 : Math.max(0, Math.min(1, (f - sc.from) / sc.dur));
          return <div key={i} style={{flex: 1, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.18)', overflow: 'hidden'}}><div style={{width: `${k * 100}%`, height: '100%', background: CD[z]}} /></div>;
        })}
      </div>
      <div style={{position: 'absolute', left: 60, top: 104, fontFamily: FONT, fontSize: 28, fontWeight: 800, letterSpacing: 3, color: '#5EEAD4', opacity: idx === 0 ? 0 : 1}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 2</div>
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
const SC: React.FC[] = [Hook, Rule, RAE, LAE, LVH, RVH, Recap, CTA];
export const Short2: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 35%, #2A1B2E, #070B10 75%)', fontFamily: FONT}}>
    <Audio src={staticFile('narration.m4a')} />
    {data.scenes.map((s, i) => {
      const Comp = SC[i];
      return Comp ? <Sequence key={i} from={s.from} durationInFrames={s.dur}><Comp /></Sequence> : null;
    })}
    <TopBar />
    <BigCap />
  </AbsoluteFill>
);
