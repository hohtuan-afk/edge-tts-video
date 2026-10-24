// BÀI ĐẦY ĐỦ: Điện tâm đồ trong nhồi máu cơ tim cấp — 19 cảnh, 7 trạm
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, Easing, staticFile, useCurrentFrame} from 'remotion';
import data from '../data.json';
import keys from './full_keys.json';
import stations from './full_stations.json';
import {TimeMap, CapCtx, FONT, useT} from '../lib';
import {Caption, Progress} from '../Main';
import {MonitorScene, StagesScene, PaperZoomScene, CaliperScene, MONO} from './Lab';
import {VecRotate, VecProject} from './Vector';
import {PaperAnterior, PaperDeWinter, PaperPosterior, Sheet, Sticky} from './Paper';
import {TableHand} from './TableHand';
import {Fade, SeriesTag} from './Demo';
import {CoronaryScene, InferiorScene} from './Demo2';
import {Heart6, Zone6, Hot6} from '../wb/heart6';
import {HAND, RPath, RArrow} from '../wb/wb';
import {INFERIOR, tracePts, beatV, Lead} from './ecg';

const ap = (t: number, s: number, d = 0.6) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1)});
const dp = (t: number, s: number, d = 0.8) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
const useBeat = () => {
  const rt = useCurrentFrame() / 30;
  return Math.max(0, Math.sin(rt * 2 * Math.PI * 1.1)) ** 4;
};
const DeskBg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 40% 35%, #3a4a52, #1d272c 75%)'}}>
    <AbsoluteFill style={{background: 'repeating-linear-gradient(95deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 9px)'}} />
    {children}
  </AbsoluteFill>
);
const Pink: React.FC<{w: number; h: number; mm: number}> = ({w, h, mm}) => {
  const g: React.ReactNode[] = [];
  for (let i = 0; i <= w / mm; i++) g.push(<line key={'v' + i} x1={i * mm} x2={i * mm} y1={0} y2={h} stroke={i % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={i % 5 ? 0.6 : 1.2} />);
  for (let j = 0; j <= h / mm; j++) g.push(<line key={'h' + j} x1={0} x2={w} y1={j * mm} y2={j * mm} stroke={j % 5 ? '#F6C9C1' : '#EC9A8E'} strokeWidth={j % 5 ? 0.6 : 1.2} />);
  return <g><rect width={w} height={h} fill="#FFF6F2" />{g}</g>;
};
const Banner: React.FC<{x: number; y: number; a: number; w?: number; c?: string; size?: number; children: React.ReactNode}> = ({x, y, a, w, c = '#D7263D', size = 34, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, padding: '16px 26px', borderRadius: 14, background: c, color: '#fff', fontFamily: FONT, fontSize: size, fontWeight: 800, lineHeight: 1.25, opacity: a, transform: `scale(${0.9 + 0.1 * a})`, transformOrigin: 'left center', boxShadow: '0 12px 28px rgba(0,0,0,0.4)'}}>{children}</div>
);

// ================= THANH TRẠM (góc phải trên) =================
const ST7 = ['NHẬN DIỆN', 'TIẾN TRIỂN', 'ĐỊNH KHU', 'SOI GƯƠNG', 'THẤT PHẢI · THÀNH SAU', 'TƯƠNG ĐƯƠNG', 'ÔN TẬP'];
const STC = ['#F43F5E', '#A855F7', '#3B82F6', '#14B8A6', '#F59E0B', '#EF4444', '#22C55E'];
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
const Cover: React.FC = () => {
  const t = useT();
  const beat = useBeat();
  const rt = useCurrentFrame() / 30;
  const pts: string[] = [];
  for (let x = 0; x <= 1920; x += 3) {
    const T = x / 300 + rt * 0.0;
    const tr = ((T % 0.9) + 0.9) % 0.9 - 0.3;
    pts.push(`${x},${(905 - beatV(tr, {st: 0.22, t: 0.5, tw: 0.08}) * 60).toFixed(1)}`);
  }
  const head = (rt * 520) % 2400;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 40%, #1B2E3A, #0B1218 75%)'}}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <defs>
          <linearGradient id="cvFade" x1="0" x2="1"><stop offset="0" stopColor="#FC6255" stopOpacity="0" /><stop offset="1" stopColor="#FC6255" stopOpacity="0.9" /></linearGradient>
          <clipPath id="cvClip"><rect x={head - 900} y={780} width={900} height={200} /></clipPath>
        </defs>
        <polyline points={pts.join(' ')} fill="none" stroke="#FC6255" strokeWidth={3} opacity={0.12} />
        <g clipPath="url(#cvClip)"><polyline points={pts.join(' ')} fill="none" stroke="url(#cvFade)" strokeWidth={4} /></g>
        <Heart6 id="cover" x={1150} y={110} s={1.3} prog={dp(t, 0.3, 1.2)} art={dp(t, 1.0, 1.6)} labels={false} beat={beat} />
      </svg>
      <div style={{position: 'absolute', left: 110, top: 140, fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: 4, color: '#5EEAD4', opacity: ap(t, 0.2)}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN</div>
      <div style={{position: 'absolute', left: 106, top: 186, width: 1050, fontFamily: FONT, fontSize: 78, fontWeight: 800, lineHeight: 1.08, color: '#F8FAFC', opacity: ap(t, 0.4), transform: `translateY(${(1 - ap(t, 0.4)) * 20}px)`}}>
        Điện tâm đồ trong<br /><span style={{color: '#FC6255'}}>nhồi máu cơ tim cấp</span>
      </div>
      <div style={{position: 'absolute', left: 110, top: 420, width: 1000, display: 'flex', flexWrap: 'wrap', gap: 12}}>
        {ST7.map((n, i) => {
          const a = ap(t, 2.0 + i * 0.25, 0.4);
          return (
            <div key={n} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px 8px 8px', borderRadius: 30, background: 'rgba(255,255,255,0.06)', border: `2px solid ${STC[i]}`, opacity: a, transform: `translateY(${(1 - a) * 14}px)`}}>
              <span style={{width: 34, height: 34, borderRadius: 17, background: STC[i], color: '#fff', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</span>
              <span style={{fontSize: 24, fontWeight: 800, color: '#F1F5F9', letterSpacing: 1}}>{n}</span>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 110, top: 610, width: 960, padding: '20px 28px', borderRadius: 18, background: '#FFF4C2', border: '2px solid #E8C547', opacity: ap(t, 4.0), transform: `translateY(${(1 - ap(t, 4.0)) * 20}px)`, fontFamily: FONT}}>
        <div style={{fontSize: 20, fontWeight: 800, letterSpacing: 2, color: '#8A6D00'}}>MỤC TIÊU</div>
        <div style={{fontSize: 32, fontWeight: 800, color: '#26221C', marginTop: 4, lineHeight: 1.3}}>Nhìn ECG 12 chuyển đạo → nói được <span style={{color: '#C81E3A'}}>vùng nào</span> thiếu máu, <span style={{color: '#C81E3A'}}>động mạch nào</span> tắc.</div>
      </div>
      <div style={{position: 'absolute', left: 112, top: 790, fontFamily: FONT, fontSize: 20, color: '#94A3B8', opacity: ap(t, 1.0)}}>Nguồn: Fourth Universal Definition of MI (2018) · ESC 2023 ACS Guidelines · LITFL ECG Library</div>
    </AbsoluteFill>
  );
};

// ================= TIM + DẢI ECG (thành bên, thất phải) =================
type Strip = {ld: string; k: number; L: Lead};
type Grp = {k0: number; k1: number; t0: number; fill: string; ink: string; label: string};
type TCfg = {title: string; hot: Hot6; zone: Zone6; zoneC: string; occlT: number; zoneT: number; zoneLabel: string; lbl: [number, number]; to: [number, number]; strips: Strip[]; groups: Grp[]; rowH: number; y0: number; notes: {t0: number; c: string; x: number; y: number; w: number; text: React.ReactNode}[]};
const makeTerritory = (cfg: TCfg): React.FC => {
  const C: React.FC = () => {
    const t = useT();
    const beat = useBeat();
    const MM = 7, PXS = 25 * MM, PXMV = 10 * MM, PX = 830, PY = 110, PW = 1010, PH = 780, LX = 90;
    const rowY = (k: number) => cfg.y0 + k * cfg.rowH;
    const slide = 1 - ap(t, 0.2, 0.9);
    const HS = 1.32;
    return (
      <DeskBg>
        <div style={{position: 'absolute', left: 40, top: 100, width: 740, height: 800, borderRadius: 6, background: '#FCFAF4', boxShadow: '0 24px 50px rgba(0,0,0,0.45)', transform: `rotate(-1deg) translateX(${(1 - ap(t, 0, 0.8)) * -600}px)`}}>
          <div style={{position: 'absolute', left: 30, top: 18, fontFamily: HAND, fontSize: 40, color: '#1E1E24'}}>{cfg.title}</div>
          <svg viewBox="0 0 740 800" width={740} height={800} style={{position: 'absolute', inset: 0}}>
            <Heart6 id={'tr' + cfg.zone} x={40} y={70} s={HS} prog={dp(t, 0.2, 1.4)} art={dp(t, 0.5, 1.2)} labelA={ap(t, 1.4)} beat={beat}
              hot={cfg.hot} occl={dp(t, cfg.occlT, 0.6)} zone={cfg.zone} zoneC={cfg.zoneC} zoneA={ap(t, cfg.zoneT, 0.8)} />
            <g opacity={ap(t, cfg.zoneT + 0.4, 0.5)}>
              <RArrow x1={cfg.lbl[0] + 60} y1={cfg.lbl[1] - 34} x2={40 + cfg.to[0] * HS} y2={70 + cfg.to[1] * HS} prog={dp(t, cfg.zoneT + 0.4, 0.5)} stroke="#C81E3A" sw={3.5} curve={-0.25} seed={9} head={16} />
              <text x={cfg.lbl[0]} y={cfg.lbl[1]} fontFamily={HAND} fontSize={38} fill="#C81E3A">{cfg.zoneLabel}</text>
            </g>
          </svg>
        </div>
        <div style={{position: 'absolute', left: PX, top: PY, width: PW, height: PH, transform: `translateY(${slide * 1000}px) rotate(0.6deg)`, boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
          <svg viewBox={`0 0 ${PW} ${PH}`} width={PW} height={PH} style={{position: 'absolute', inset: 0}}>
            <Pink w={PW} h={PH} mm={MM} />
            {cfg.groups.map((g, i) => {
              const a = dp(t, g.t0, 0.8);
              return (
                <g key={'g' + i}>
                  <rect x={14} y={rowY(g.k0) - cfg.rowH * 0.55} width={(PW - 28) * a} height={(g.k1 - g.k0 + 1) * cfg.rowH - 6} rx={14} fill={g.fill} style={{mixBlendMode: 'multiply'}} />
                  <RPath d={`M10,${rowY(g.k0) - cfg.rowH * 0.6} C-6,${rowY(g.k0)} -6,${rowY(g.k1)} 10,${rowY(g.k1) + cfg.rowH * 0.35}`} stroke={g.ink} sw={5} rough={1.2} seed={31 + i} prog={dp(t, g.t0 + 0.3, 0.6)} />
                  <text x={640} y={rowY(g.k0) + 6} fontFamily={HAND} fontSize={42} fill={g.ink} opacity={ap(t, g.t0 + 0.5)} transform={`rotate(-3 640 ${rowY(g.k0)})`}>{g.label}</text>
                </g>
              );
            })}
            {cfg.strips.map((s, i) => {
              const y0 = rowY(s.k);
              const pr = dp(t, 0.7 + i * 0.2, 1.0);
              return (
                <g key={s.ld}>
                  <text x={18} y={y0 - 30} fontFamily={MONO} fontSize={26} fontWeight={700} fill="#1E1E24" opacity={ap(t, 0.5 + i * 0.2)}>{s.ld}</text>
                  <polyline points={tracePts(LX, y0, 0, 3.0, PXS, PXMV, s.L, 0.8, 0.004)} fill="none" stroke="#1E1E24" strokeWidth={2.2} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - pr} />
                </g>
              );
            })}
          </svg>
          <div style={{position: 'absolute', right: 30, bottom: 14, fontFamily: MONO, fontSize: 18, color: '#9b6b64'}}>25 mm/s · 10 mm/mV</div>
        </div>
        {cfg.notes.map((n, i) => (
          <div key={i} style={{position: 'absolute', left: n.x, top: n.y, width: n.w, padding: '16px 22px', background: n.c, boxShadow: '0 12px 28px rgba(0,0,0,0.35)', transform: `rotate(${i % 2 ? 2 : -3}deg) translateY(${(1 - ap(t, n.t0)) * 30}px)`, opacity: ap(t, n.t0), fontFamily: FONT, fontSize: 30, fontWeight: 800, color: '#26221C', lineHeight: 1.3}}>{n.text}</div>
        ))}
      </DeskBg>
    );
  };
  return C;
};
const LAT: Record<string, Lead> = {
  I: {r: 0.6, s: -0.1, st: 0.2, t: 0.5, tw: 0.075}, aVL: {r: 0.5, s: -0.15, st: 0.22, t: 0.45, tw: 0.075},
  V5: {r: 1.0, s: -0.25, st: 0.2, t: 0.55, tw: 0.08}, V6: {r: 0.85, s: -0.15, st: 0.18, t: 0.5, tw: 0.08},
  III: {r: 0.5, s: -0.25, st: -0.16, t: -0.12}, aVF: {r: 0.7, s: -0.2, st: -0.12, t: -0.05},
};
const LateralScene = makeTerritory({
  title: 'Tắc động mạch mũ', hot: 'lcx', zone: 'lat', zoneC: '#16A34A', occlT: 0.9, zoneT: 2.1, zoneLabel: 'thành bên', lbl: [520, 770], to: [419, 420],
  rowH: 112, y0: 86,
  strips: [{ld: 'I', k: 0, L: LAT.I}, {ld: 'aVL', k: 1, L: LAT.aVL}, {ld: 'V5', k: 2, L: LAT.V5}, {ld: 'V6', k: 3, L: LAT.V6}, {ld: 'III', k: 4.35, L: LAT.III}, {ld: 'aVF', k: 5.35, L: LAT.aVF}],
  groups: [
    {k0: 0, k1: 3, t0: 4.1, fill: 'rgba(74,222,128,0.24)', ink: '#15803D', label: 'ST ↑ thành bên'},
    {k0: 4.35, k1: 5.35, t0: 6.1, fill: 'rgba(96,165,250,0.22)', ink: '#2563EB', label: 'ST ↓ soi gương'},
  ],
  notes: [{t0: 8.1, c: '#FFE873', x: 1480, y: 150, w: 340, text: <>aVL nhỏ —<br /><span style={{color: '#C81E3A'}}>đừng bỏ sót!</span></>}],
});
const RVL: Record<string, Lead> = {V1: {r: 0.2, s: -0.8, st: 0.16, t: 0.4, tw: 0.075}, V4R: {r: 0.25, s: -0.5, st: 0.14, t: 0.35, tw: 0.07}};
const RVScene = makeTerritory({
  title: 'RCA tắc đoạn gần', hot: 'rcaP', zone: 'rv', zoneC: '#D97706', occlT: 0.9, zoneT: 1.4, zoneLabel: 'thất phải', lbl: [40, 770], to: [240, 380],
  rowH: 128, y0: 92,
  strips: [{ld: 'II', k: 0, L: INFERIOR.II}, {ld: 'III', k: 1, L: INFERIOR.III}, {ld: 'aVF', k: 2, L: INFERIOR.aVF}, {ld: 'V1', k: 3.35, L: RVL.V1}, {ld: 'V4R', k: 4.35, L: RVL.V4R}],
  groups: [
    {k0: 0, k1: 2, t0: 2.1, fill: 'rgba(251,113,133,0.22)', ink: '#C81E3A', label: 'ST ↑ thành dưới'},
    {k0: 3.35, k1: 4.35, t0: 4.1, fill: 'rgba(251,191,36,0.30)', ink: '#B45309', label: 'ST ↑ V1 · V4R'},
  ],
  notes: [
    {t0: 6.1, c: '#BFDBFE', x: 1490, y: 300, w: 320, text: <>V1 ↑ · III &gt; II<br />→ nghĩ thất phải</>},
    {t0: 8.1, c: '#FECACA', x: 1440, y: 700, w: 400, text: <>Tránh nitrate, lợi tiểu<br /><span style={{color: '#C81E3A'}}>→ dễ tụt huyết áp</span></>},
  ],
});

// ================= TỜ 12 CHUYỂN ĐẠO + GHI CHÚ (Wellens, aVR) =================
type SCfg = {head: string; leads: Record<string, Lead>; hl: {ld: string; t0: number}[]; rings: {lead: string[]; t0: number; color: string}[]; notes: {t0: number; c: string; y: number; text: React.ReactNode}[]; banner: {t0: number; text: React.ReactNode}};
const makeSheet = (cfg: SCfg): React.FC => {
  const C: React.FC = () => {
    const t = useT();
    const hl: Record<string, number> = {};
    cfg.hl.forEach((h) => (hl[h.ld] = ap(t, h.t0, 0.5)));
    return (
      <DeskBg>
        <div style={{position: 'absolute', left: 50, top: 58, fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#F8FAFC', opacity: ap(t, 0.1)}}>{cfg.head}</div>
        <div style={{position: 'absolute', left: 40, top: 128, width: 1500, height: 760, transform: `translateY(${(1 - ap(t, 0, 0.9)) * 900}px) scale(0.93) rotate(-0.6deg)`, transformOrigin: '0 0', boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
          <Sheet leads={cfg.leads} hl={hl} rings={cfg.rings.map((r) => ({lead: r.lead, prog: ap(t, r.t0, 0.9), color: r.color}))} />
        </div>
        {cfg.notes.map((n, i) => (
          <Sticky key={i} x={1480} y={n.y} a={ap(t, n.t0)} c={n.c} w={400} rot={i % 2 ? 2 : -2} size={28}>{n.text}</Sticky>
        ))}
        <Banner x={60} y={800} a={ap(t, cfg.banner.t0)} w={1340} size={32}>{cfg.banner.text}</Banner>
      </DeskBg>
    );
  };
  return C;
};
const N = (o: Lead): Lead => o;
const WELLENS: Record<string, Lead> = {
  I: N({r: 0.6, s: -0.1, t: 0.3}), II: N({r: 0.9, s: -0.2, t: 0.3}), III: N({r: 0.5, s: -0.25, t: 0.15}),
  aVR: N({p: -0.1, q: 0.05, r: -0.7, s: 0.1, t: -0.2}), aVL: N({r: 0.4, s: -0.2, t: 0.2}), aVF: N({r: 0.7, s: -0.2, t: 0.25}),
  V1: N({r: 0.25, s: -0.9, t: -0.12}), V2: N({r: 0.35, s: -1.0, st: 0.03, t: -0.62, tw: 0.075, tPos: 0.3}),
  V3: N({r: 0.55, s: -0.8, st: 0.03, t: -0.66, tw: 0.075, tPos: 0.3}), V4: N({r: 0.9, s: -0.5, t: -0.3, tw: 0.07, tPos: 0.3}),
  V5: N({r: 1.0, s: -0.25, t: 0.15}), V6: N({r: 0.9, s: -0.15, t: 0.25}),
};
const WellensScene = makeSheet({
  head: 'Hội chứng Wellens',
  leads: WELLENS, hl: [{ld: 'V2', t0: 2.0}, {ld: 'V3', t0: 2.3}],
  rings: [{lead: ['V2', 'V3'], t0: 2.4, color: '#D7263D'}],
  notes: [
    {t0: 0.4, c: '#BBF7D0', y: 140, text: <>Bệnh nhân đã<br /><b>HẾT đau ngực</b></>},
    {t0: 2.6, c: '#FECACA', y: 330, text: <>V2–V3: T đảo <b>sâu, đối xứng</b> (hoặc 2 pha)</>},
    {t0: 4.2, c: '#FFE873', y: 520, text: <>ST ≈ đẳng điện<br />chưa có sóng Q</>},
    {t0: 8.1, c: '#FED7AA', y: 700, text: <>✗ Nghiệm pháp gắng sức<br />→ <b>chụp mạch vành sớm</b></>},
  ],
  banner: {t0: 6.1, text: <>Hẹp rất nặng LAD đoạn gần → nguy cơ nhồi máu thành trước rộng</>},
});
const AVR: Record<string, Lead> = {
  I: N({r: 0.6, s: -0.1, st: -0.15, t: 0.15}), II: N({r: 1.0, s: -0.2, st: -0.2, t: 0.15}), III: N({r: 0.5, s: -0.2, st: -0.1, t: 0.1}),
  aVR: N({p: -0.1, q: 0.05, r: -0.7, s: 0.1, st: 0.18, t: -0.1}), aVL: N({r: 0.35, s: -0.2, st: -0.08, t: 0.1}), aVF: N({r: 0.8, s: -0.2, st: -0.15, t: 0.12}),
  V1: N({r: 0.2, s: -0.9, st: 0.07, t: 0.2}), V2: N({r: 0.4, s: -1.2, st: -0.05, t: 0.3}), V3: N({r: 0.75, s: -0.8, st: -0.15, t: 0.2}),
  V4: N({r: 1.2, s: -0.45, st: -0.22, t: 0.15}), V5: N({r: 1.15, s: -0.25, st: -0.22, t: 0.15}), V6: N({r: 0.9, s: -0.15, st: -0.18, t: 0.12}),
};
const AvrScene = makeSheet({
  head: 'ST chênh lên ở aVR',
  leads: AVR, hl: ['I', 'II', 'aVF', 'V3', 'V4', 'V5', 'V6'].map((ld, i) => ({ld, t0: 0.3 + i * 0.18})),
  rings: [{lead: ['aVR'], t0: 2.1, color: '#D7263D'}],
  notes: [
    {t0: 0.8, c: '#BFDBFE', y: 140, text: <>ST chênh <b>XUỐNG</b><br />≥ 6 chuyển đạo</>},
    {t0: 2.5, c: '#FECACA', y: 340, text: <>aVR (± V1):<br />ST chênh <b>LÊN</b></>},
    {t0: 6.1, c: '#FFE873', y: 540, text: <>Bệnh nặng →<br /><b>báo can thiệp NGAY</b></>},
  ],
  banner: {t0: 4.1, text: <>Thiếu máu lan tỏa: hẹp nặng thân chung ĐMV trái hoặc bệnh 3 nhánh</>},
});

// ================= ĐỪNG NHẦM =================
const g = (x: number, mu: number, w: number, a: number) => a * Math.exp(-((x - mu) ** 2) / (2 * w * w));
const MIMIC: {name: string; c: string; t0: number; pts: string[]; f: (tr: number) => number}[] = [
  {name: 'Viêm màng ngoài tim', c: '#7C3AED', t0: 2, pts: ['ST chênh lan tỏa, hình lõm', 'PR chênh xuống', 'không soi gương (trừ aVR)'], f: (tr) => beatV(tr, {st: 0.15, t: 0.32, tw: 0.07}) + g(tr, -0.09, 0.025, -0.06)},
  {name: 'Tái cực sớm', c: '#0EA5E9', t0: 4, pts: ['người trẻ, khoẻ', 'điểm J có móc', 'T cao, ST ổn định'], f: (tr) => beatV(tr, {r: 1.3, s: -0.05, st: 0.1, t: 0.65, tw: 0.075}) + g(tr, 0.045, 0.007, 0.2)},
  {name: 'Phì đại thất trái', c: '#D97706', t0: 6, pts: ['S rất sâu ở V1–V3', 'kèm ST chênh lên', 'R cao ở V5–V6'], f: (tr) => beatV(tr, {r: 0.3, s: -2.0, st: 0.2, t: 0.5, tw: 0.08})},
  {name: 'Block nhánh trái / tạo nhịp', c: '#DC2626', t0: 8, pts: ['QRS rộng', 'ST–T ngược hướng QRS', '→ tiêu chuẩn Sgarbossa'], f: (tr) => beatV(tr, {q: 0, r: 0, s: 0, st: 0.22, t: 0.45, tw: 0.07, tPos: 0.3}) + g(tr, 0.01, 0.032, -1.3)},
];
const MimicScene: React.FC = () => {
  const t = useT();
  return (
    <DeskBg>
      <div style={{position: 'absolute', left: 70, top: 64, fontFamily: FONT, fontSize: 44, fontWeight: 800, color: '#F8FAFC', opacity: ap(t, 0.2)}}>
        Đừng nhầm! <span style={{fontFamily: HAND, fontWeight: 400, color: '#FCA5A5', fontSize: 40}}>ST chênh lên ≠ luôn là nhồi máu</span>
      </div>
      {MIMIC.map((m, i) => {
        const a = ap(t, m.t0, 0.6);
        const x = 70 + (i % 2) * 900, y = 150 + Math.floor(i / 2) * 340;
        const W0 = 360, H0 = 230, mm = 6;
        const pts: string[] = [];
        for (let tt = 0; tt <= 2.3; tt += 0.004) {
          const tr = ((tt % 1.0) + 1.0) % 1.0 - 0.35;
          pts.push(`${(20 + tt * 25 * mm * 0.95).toFixed(1)},${(150 - m.f(tr) * 10 * mm * (i === 2 ? 0.55 : 0.8)).toFixed(1)}`);
        }
        return (
          <div key={m.name} style={{position: 'absolute', left: x, top: y, width: 860, height: 310, borderRadius: 18, background: '#FCFAF4', boxShadow: '0 18px 40px rgba(0,0,0,0.4)', opacity: a, transform: `translateY(${(1 - a) * 30}px)`, overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 10, height: 310, background: m.c}} />
            <svg viewBox={`0 0 ${W0} ${H0}`} width={W0} height={H0} style={{position: 'absolute', left: 30, top: 50}}>
              <Pink w={W0} h={H0} mm={mm} />
              <polyline points={pts.join(' ')} fill="none" stroke="#1E1E24" strokeWidth={2.4} strokeLinejoin="round" />
            </svg>
            <div style={{position: 'absolute', left: 420, top: 34, width: 420, fontFamily: FONT}}>
              <div style={{fontSize: 34, fontWeight: 800, color: m.c, lineHeight: 1.15}}>{m.name}</div>
              {m.pts.map((p, j) => (
                <div key={j} style={{fontSize: 27, fontWeight: 600, color: '#26221C', marginTop: 12, opacity: ap(t, m.t0 + 0.3 + j * 0.25, 0.4)}}>• {p}</div>
              ))}
            </div>
          </div>
        );
      })}
      <Banner x={70} y={835} a={ap(t, 10.0)} w={1730} c="#0F766E" size={30}>Còn nghi ngờ? So ECG cũ · làm lại ECG sau 15–30 phút · men tim · siêu âm tim</Banner>
    </DeskBg>
  );
};

// ================= 5 ĐIỀU CẦN NHỚ =================
const TAKE = [
  ['Đo ST tại ', 'điểm J', ': ≥ 1 mm ở 2 chuyển đạo liên tiếp'],
  ['Tiến triển: ', 'T tối cấp → ST↑ → Q → T đảo', ''],
  ['', 'Định khu', ' theo nhóm chuyển đạo → đoán động mạch thủ phạm'],
  ['Luôn tìm ', 'soi gương', ' · gắn V4R, V7–V9 khi cần'],
  ['Dạng ', 'tương đương', ': thành sau · de Winter · Wellens · aVR'],
];
const SummaryScene: React.FC = () => {
  const t = useT();
  const beat = useBeat();
  return (
    <DeskBg>
      <div style={{position: 'absolute', left: 80, top: 100, width: 1180, height: 800, background: '#FDFDF8', backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 99px, #BFD7EA 99px 101px)', boxShadow: '0 30px 60px rgba(0,0,0,0.45)', transform: `rotate(-0.8deg) translateY(${(1 - ap(t, 0, 0.8)) * 900}px)`}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, marginLeft: 110, background: '#F4A3A3'}} />
        <div style={{position: 'absolute', left: 150, top: 22, fontFamily: FONT, fontSize: 50, fontWeight: 800, color: '#C81E3A', letterSpacing: 1}}>5 ĐIỀU CẦN NHỚ</div>
        <svg viewBox="0 0 1180 800" width={1180} height={800} style={{position: 'absolute', inset: 0}}>
          <RPath d="M150,92 C330,84 520,98 640,88" stroke="#C81E3A" sw={4} rough={1.5} seed={4} prog={dp(t, 0.5, 0.8)} />
          {TAKE.map((_, i) => {
            const y = 150 + i * 100;
            return <RPath key={i} d={`M40,${y + 8} L54,${y + 26} L84,${y - 14}`} stroke="#C81E3A" sw={5} rough={0.9} seed={50 + i} prog={dp(t, 2 * (i + 1) + 0.6, 0.4)} />;
          })}
        </svg>
        {TAKE.map((x, i) => {
          const a = ap(t, 2 * (i + 1), 0.5);
          return (
            <div key={i} style={{position: 'absolute', left: 150, top: 118 + i * 100, width: 1000, fontFamily: FONT, fontSize: 36, fontWeight: 600, color: '#1F2937', opacity: a, transform: `translateX(${(1 - a) * 20}px)`, whiteSpace: 'nowrap'}}>
              <span style={{color: STC[i], fontWeight: 800}}>{i + 1}. </span>{x[0]}<b style={{color: '#C81E3A'}}>{x[1]}</b>{x[2]}
            </div>
          );
        })}
        <div style={{position: 'absolute', left: 150, top: 650, fontFamily: HAND, fontSize: 52, color: '#1F2937', opacity: ap(t, 12.0), transform: `rotate(-2deg) scale(${0.9 + 0.1 * ap(t, 12.0)})`}}>Cảm ơn bạn đã theo dõi! ♥</div>
      </div>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="sum" x={1290} y={180} s={1.15} prog={dp(t, 0.6, 1.2)} art={1} labels={false} beat={beat} />
      </svg>
    </DeskBg>
  );
};

const SC: React.FC[] = [
  Cover, MonitorScene, CoronaryScene, PaperZoomScene, CaliperScene, StagesScene,
  InferiorScene, PaperAnterior, LateralScene, VecRotate, VecProject, RVScene, PaperPosterior,
  PaperDeWinter, WellensScene, AvrScene, MimicScene, TableHand, SummaryScene,
];
export const Full: React.FC = () => (
  <AbsoluteFill style={{background: '#0E1116', fontFamily: FONT}}>
    <Audio src={staticFile('narration.m4a')} />
    <CapCtx.Provider value={false}>
      {data.scenes.map((s, i) => {
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
    <SeriesTag />
    <StationBar />
    <Caption />
    <Progress />
  </AbsoluteFill>
);
