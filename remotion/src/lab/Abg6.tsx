// Giải mã khí máu · Bài 6: Toan và kiềm hô hấp (11 cảnh)
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import data from '../data.json';
import {Caption, Progress} from '../Main';
import {FONT} from '../lib';
import {Fade} from './Demo';
import {ap} from '../wb/wb';
import * as A from './abgArt.mjs';

const K = {
  txt: '#F2F7F9', dim: '#A7BAC4', ink: '#22303A', muted: '#60707A', amber: '#F5B83D',
  ph: '#F2B632', co2: '#38A7DD', hco3: '#F2813D', o2: '#E5484D', green: '#3FB27F', line: 'rgba(190,220,235,.2)',
};
const NAMES = ['MỞ ĐẦU', 'THÔNG KHÍ', 'NGUYÊN NHÂN', 'CẤP / MẠN', 'CA D · E', 'COPD & O₂', 'KIỀM HH', 'BÙ', 'CA F', 'CẢNH BÁO', 'ÔN TẬP'];

const useSec = () => useCurrentFrame() / 30;
const usePop = (s0: number, damping = 14) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - s0 * fps, fps, config: {damping, stiffness: 130, mass: 0.8}});
};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const chem = (s: string) => {
  const out: React.ReactNode[] = [];
  s.split(/(₂|₃⁻)/).forEach((p, i) => {
    if (p === '₂') out.push(<sub key={i} style={{fontSize: '.62em', lineHeight: 0}}>2</sub>);
    else if (p === '₃⁻') out.push(<span key={i}><sub style={{fontSize: '.62em', lineHeight: 0}}>3</sub><sup style={{fontSize: '.62em', lineHeight: 0, marginLeft: -2}}>−</sup></span>);
    else out.push(p);
  });
  return out;
};
const Tx: React.FC<{x: number; y: number; w?: number; size?: number; c?: string; a?: number; al?: 'left' | 'center' | 'right'; b?: number; lh?: number; children: string}> = ({x, y, w, size = 34, c = K.txt, a = 1, al = 'left', b = 600, lh = 1.2, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: al, fontFamily: FONT, fontSize: size, color: c, opacity: a, lineHeight: lh, fontWeight: b, textWrap: 'balance' as any, transform: `translateY(${(1 - a) * 10}px)`}}>
    {chem(children)}
  </div>
);
const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, width: 1920, height: 1080, overflow: 'visible', ...style}}>{children}</svg>
);
const Art: React.FC<{html: string; x?: number; y?: number; s?: number; sx?: number; rot?: number; a?: number}> = ({html, x = 0, y = 0, s = 1, sx, rot = 0, a = 1}) => (
  <g opacity={a} transform={`translate(${x},${y}) rotate(${rot}) scale(${sx ?? s},${s})`} dangerouslySetInnerHTML={{__html: html}} />
);
const Curve: React.FC<{d: string; c?: string; w?: number; p: number; head?: boolean}> = ({d, c = K.amber, w = 4, p, head = true}) => {
  const id = `h${c.replace('#', '')}`;
  return (
    <g opacity={p > 0 ? 1 : 0}>
      <defs><marker id={id} markerWidth="9" markerHeight="9" refX="6.5" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,4 L0,8 Z" fill={c} /></marker></defs>
      <path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" markerEnd={head && p > 0.96 ? `url(#${id})` : undefined} />
    </g>
  );
};

const Studio: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: 'linear-gradient(135deg,#0D1B24 0%,#10262F 55%,#0A161E 100%)'}}>
      <div style={{position: 'absolute', left: 150 + Math.sin(f / 90) * 50, top: -180, width: 1100, height: 900, background: 'radial-gradient(closest-side,rgba(60,145,170,.28),transparent)'}} />
      <div style={{position: 'absolute', right: 40 + Math.cos(f / 110) * 50, bottom: -240, width: 900, height: 800, background: 'radial-gradient(closest-side,rgba(190,60,80,.15),transparent)'}} />
    </AbsoluteFill>
  );
};

const Top: React.FC<{idx: number; title: string}> = ({idx, title}) => {
  const t = useSec();
  const a = ap(t, 0.1);
  return (
    <>
      <Tx x={44} y={22} size={24} c={K.dim} b={600}>GIẢI MÃ KHÍ MÁU · BÀI 6</Tx>
      <Tx x={44} y={56} size={54} b={800} a={a}>{title}</Tx>
      <div style={{position: 'absolute', right: 36, top: 24, display: 'flex', gap: 8, fontFamily: FONT}}>
        {NAMES.map((n, i) => (
          <div key={n} style={{padding: i === idx ? '5px 20px' : '5px 14px', borderRadius: 20, fontSize: i === idx ? 26 : 22, fontWeight: 700, background: i === idx ? K.amber : 'rgba(255,255,255,.07)', color: i === idx ? K.ink : i < idx ? K.txt : K.dim, border: `1.5px solid ${K.line}`}}>
            {i === idx ? n : i + 1}
          </div>
        ))}
      </div>
    </>
  );
};

const Memo: React.FC<{x: number; y: number; w: number; s0: number; size?: number; children: string}> = ({x, y, w, s0, size = 42, children}) => {
  const p = usePop(s0);
  if (p <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, padding: '10px 26px 14px', borderRadius: 16, background: 'linear-gradient(135deg,#FFD46B,#F5B83D)', color: K.ink, fontFamily: FONT, textAlign: 'center', boxShadow: '0 16px 40px rgba(0,0,0,.5)', transform: `scale(${p})`, opacity: Math.min(1, p * 1.5)}}>
      <div style={{fontSize: 20, fontWeight: 800, letterSpacing: 3, color: '#7A5608'}}>GHI NHỚ</div>
      <div style={{fontSize: size, fontWeight: 800, lineHeight: 1.15}}>{chem(children)}</div>
    </div>
  );
};

const Callout: React.FC<{x: number; y: number; a: number; c?: string; size?: number; children: string}> = ({x, y, a, c = K.txt, size = 28, children}) => (
  <div style={{position: 'absolute', left: x, top: y, opacity: a, padding: '6px 16px', borderRadius: 12, background: 'rgba(8,18,25,.86)', border: `2px solid ${c}`, color: K.txt, fontFamily: FONT, fontSize: size, fontWeight: 700, whiteSpace: 'nowrap', transform: `translateY(${(1 - a) * 8}px)`}}>
    {chem(children)}
  </div>
);

// ---------- Thành phần dùng chung cho cảnh mới ----------
const Panel: React.FC<{x: number; y: number; w: number; h: number; c: string; s0: number; glow?: number; children?: React.ReactNode}> = ({x, y, w, h, c, s0, glow = 0, children}) => {
  const p = usePop(s0);
  if (p <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 22, background: 'linear-gradient(140deg,#1F3640,#13242C)', border: `3px solid ${c}`, boxShadow: `0 16px 40px rgba(0,0,0,.4), 0 0 ${8 + 30 * glow}px ${c}${glow > 0.05 ? 'BB' : '22'}`, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 40}px) scale(${0.96 + 0.04 * p})`}}>
      {children}
    </div>
  );
};
const Mark: React.FC<{c: string; ch: string; s0: number; size?: number}> = ({c, ch, s0, size = 56}) => {
  const p = usePop(s0, 11);
  return (
    <div style={{width: size, height: size, borderRadius: '50%', background: c, color: '#0D1B24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: size * 0.6, fontWeight: 800, flex: 'none', transform: `scale(${p})`}}>{ch}</div>
  );
};
const Ico: React.FC<{w: number; h: number; vb: string; html: string; style?: React.CSSProperties}> = ({w, h, vb, html, style}) => (
  <svg width={w} height={h} viewBox={vb} style={{flex: 'none', overflow: 'visible', ...style}} dangerouslySetInnerHTML={{__html: html}} />
);


// Ảnh tạng (Canva, đã tách nền). Đặt tâm tại (x,y).
const LUNG_AR = 738 / 673, KID_AR = 1170 / 786;
const Organ: React.FC<{src: string; x: number; y: number; w: number; ar: number}> = ({src, x, y, w, ar}) => (
  <image href={staticFile(src)} x={x - w / 2} y={y - (w * ar) / 2} width={w} height={w * ar} style={{filter: 'drop-shadow(0 18px 30px rgba(0,0,0,.35))'}} />
);
const Lung: React.FC<{x: number; y: number; w: number}> = (p) => <Organ src="abg_phoi.png" ar={LUNG_AR} {...p} />;
const Kid: React.FC<{x: number; y: number; h: number}> = ({x, y, h}) => <Organ src="abg_than.png" ar={KID_AR} x={x} y={y} w={h / KID_AR} />;
const OrganIco: React.FC<{src: string; w: number; h: number}> = ({src, w, h}) => (
  <img src={staticFile(src)} style={{width: w, height: h, objectFit: 'contain', flex: 'none', filter: 'drop-shadow(0 10px 18px rgba(0,0,0,.3))'}} />
);

// ---------- Tiện ích bài 4 ----------
const Big: React.FC<{x: number; y: number; w: number; a: number; c?: string; size?: number; children: string}> = ({x, y, w, a, c = K.txt, size = 120, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: 'center', fontFamily: FONT, fontSize: size, fontWeight: 900, color: c, opacity: a, transform: `scale(${0.9 + 0.1 * a})`}}>{chem(children)}</div>
);
const Pill: React.FC<{x: number; y: number; a: number; c: string; size?: number; dark?: boolean; children: string}> = ({x, y, a, c, size = 34, dark = true, children}) => (
  <div style={{position: 'absolute', left: x, top: y, opacity: a, transform: `translate(-50%,0) scale(${0.85 + 0.15 * a})`, padding: '8px 26px', borderRadius: 999, background: c, color: dark ? K.ink : K.txt, fontFamily: FONT, fontSize: size, fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 10px 26px rgba(0,0,0,.4)'}}>{chem(children)}</div>
);
const Gold: React.FC<{x: number; y: number; a: number; size?: number; children: string}> = ({x, y, a, size = 48, children}) => (
  <div style={{position: 'absolute', left: x, top: y, padding: '12px 32px', borderRadius: 18, background: 'linear-gradient(135deg,#FFD46B,#F5B83D)', color: K.ink, fontFamily: FONT, fontSize: size, fontWeight: 900, opacity: a, transform: `scale(${0.88 + 0.12 * a})`, transformOrigin: 'left center', boxShadow: '0 12px 30px rgba(0,0,0,.45)', whiteSpace: 'nowrap'}}>{chem(children)}</div>
);

const Res: React.FC<{x: number; y: number; s0: number; c: string; children: string}> = ({x, y, s0, c, children}) => {
  const p = usePop(s0, 10);
  if (p <= 0.01) return null;
  return <div style={{position: 'absolute', left: x, top: y, padding: '14px 40px', borderRadius: 999, background: c, color: c === K.o2 ? '#fff' : K.ink, fontFamily: FONT, fontSize: 56, fontWeight: 900, transform: `scale(${p})`, transformOrigin: 'left center', boxShadow: `0 0 40px ${c}88`, whiteSpace: 'nowrap'}}>{chem(children)}</div>;
};

const GoldC: React.FC<{y: number; a: number; size?: number; children: string}> = ({y, a, size = 48, children}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: a}}>
    <div style={{padding: '12px 32px', borderRadius: 18, background: 'linear-gradient(135deg,#FFD46B,#F5B83D)', color: K.ink, fontFamily: FONT, fontSize: size, fontWeight: 900, transform: `scale(${0.88 + 0.12 * a})`, boxShadow: '0 12px 30px rgba(0,0,0,.45)', whiteSpace: 'nowrap'}}>{chem(children)}</div>
  </div>
);
type Row = [string, string, string, string];
const Slip: React.FC<{s0: number; rows: Row[]; hl?: string[]; x?: number; y?: number; title?: string}> = ({s0, rows, hl = [], x = 80, y = 170, title = 'PHIẾU KHÍ MÁU'}) => {
  const p = usePop(s0);
  const f = useCurrentFrame();
  if (p <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 460, padding: '20px 24px', borderRadius: 18, background: '#F4F1EA', boxShadow: '0 20px 50px rgba(0,0,0,.5)', fontFamily: FONT, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 40}px) rotate(-1deg)`}}>
      <div style={{fontSize: 22, fontWeight: 800, letterSpacing: 3, color: '#6B5A3A'}}>{title}</div>
      <div style={{height: 3, background: '#CDBFA5', margin: '8px 0 6px'}} />
      {rows.map(([k, n, v, u]) => {
        const on = hl.includes(k);
        return (
          <div key={k} style={{display: 'flex', alignItems: 'baseline', padding: '6px 12px', borderRadius: 12, background: on ? `rgba(245,184,61,${0.35 + 0.1 * Math.sin(f / 6)})` : 'transparent', border: on ? '3px solid #E09A10' : '3px solid transparent'}}>
            <span style={{width: 170, fontSize: 34, fontWeight: 700, color: K.ink}}>{chem(n)}</span>
            <span style={{fontSize: 46, fontWeight: 900, color: K.ink, width: 130}}>{v}</span>
            <span style={{fontSize: 22, color: '#6B5A3A'}}>{u}</span>
          </div>
        );
      })}
    </div>
  );
};
const ROWS_A: Row[] = [['ph', 'pH', '7,24', ''], ['hco3', 'HCO₃⁻', '12', 'mmol/L'], ['na', 'Na⁺', '138', ''], ['cl', 'Cl⁻', '100', '']];
const ROWS_B: Row[] = [['ph', 'pH', '7,24', ''], ['hco3', 'HCO₃⁻', '12', 'mmol/L'], ['na', 'Na⁺', '138', ''], ['cl', 'Cl⁻', '114', '']];
const ROWS_C: Row[] = [['ph', 'pH', '7,50', ''], ['co2', 'PaCO₂', '47', 'mmHg'], ['hco3', 'HCO₃⁻', '36', 'mmol/L']];

// cột ion: Na⁺ | Cl⁻ + HCO₃⁻ + AG
const Ions: React.FC<{x: number; cl: number; hco3: number; a: number; k?: number; base?: number; agHi?: boolean}> = ({x, cl, hco3, a, k = 3.3, base = 860, agHi}) => {
  const na = 138, ag = na - cl - hco3;
  const blk = (y: number, h: number, bg: string, l: string, dash?: boolean) => (
    <div style={{position: 'absolute', left: 0, top: y, width: 200, height: Math.max(0, h - 4), borderRadius: 10, background: bg, border: dash ? `4px dashed ${K.txt}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: h > 60 ? 32 : 24, fontWeight: 900, overflow: 'hidden', whiteSpace: 'nowrap'}}>{chem(l)}</div>
  );
  return (
    <div style={{position: 'absolute', left: x, top: 0, width: 460, height: 1080, fontFamily: FONT, opacity: a}}>
      {blk(base - na * k, na * k, '#C9822E', `Na⁺ ${na}`)}
      <div style={{position: 'absolute', left: 240, top: 0}}>
        {blk(base - cl * k, cl * k, '#3A7BE0', `Cl⁻ ${Math.round(cl)}`)}
        {blk(base - (cl + hco3) * k, hco3 * k, K.hco3, `HCO₃⁻ ${Math.round(hco3)}`)}
        {blk(base - na * k, ag * k, agHi ? 'rgba(229,72,77,.9)' : 'rgba(63,178,127,.75)', `AG ${Math.round(ag)}`, true)}
      </div>
      <div style={{position: 'absolute', left: 0, top: base + 8, width: 200, textAlign: 'center', fontSize: 24, color: K.dim}}>cation</div>
      <div style={{position: 'absolute', left: 240, top: base + 8, width: 200, textAlign: 'center', fontSize: 24, color: K.dim}}>anion</div>
    </div>
  );
};
const Card: React.FC<{x: number; y: number; w: number; h: number; c: string; s0: number; head: string; body: string; sub?: string; glow?: number; size?: number}> = ({x, y, w, h, c, s0, head, body, sub, glow = 0, size = 40}) => (
  <Panel x={x} y={y} w={w} h={h} c={c} s0={s0} glow={glow}>
    <Tx x={0} y={22} w={w} al="center" size={28} c={c} b={800}>{head}</Tx>
    <Tx x={24} y={66} w={w - 48} al="center" size={size} b={800}>{body}</Tx>
    {sub ? <Tx x={24} y={h - 64} w={w - 48} al="center" size={26} c={K.dim}>{sub}</Tx> : null}
  </Panel>
);

const ROWS_D: Row[] = [['ph', 'pH', '7,26', ''], ['co2', 'PaCO₂', '60', 'mmHg'], ['hco3', 'HCO₃⁻', '26', 'mmol/L']];
const ROWS_E: Row[] = [['ph', 'pH', '7,34', ''], ['co2', 'PaCO₂', '60', 'mmHg'], ['hco3', 'HCO₃⁻', '31', 'mmol/L']];
const ROWS_F: Row[] = [['ph', 'pH', '7,49', ''], ['co2', 'PaCO₂', '30', 'mmHg'], ['hco3', 'HCO₃⁻', '22', 'mmol/L'], ['o2', 'PaO₂', '62', 'mmHg']];
const BLUE = '#7DA8F0';

// thước PaCO₂ ngang
const Co2Scale: React.FC<{y: number; a: number; v?: number; va?: number}> = ({y, a, v, va = 0}) => {
  const X0 = 260, W = 1400;
  const px = (x: number) => X0 + ((x - 20) / (70 - 20)) * W;
  return (
    <div style={{position: 'absolute', left: 0, top: y, width: 1920, height: 220, opacity: a, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: px(20), top: 40, width: px(35) - px(20), height: 80, background: BLUE, borderRadius: '40px 0 0 40px'}} />
      <div style={{position: 'absolute', left: px(35), top: 40, width: px(45) - px(35), height: 80, background: K.green}} />
      <div style={{position: 'absolute', left: px(45), top: 40, width: px(70) - px(45), height: 80, background: K.o2, borderRadius: '0 40px 40px 0'}} />
      {[20, 35, 45, 70].map((x) => <div key={x} style={{position: 'absolute', left: px(x) - 50, top: 130, width: 100, textAlign: 'center', fontSize: 32, fontWeight: 800, color: K.txt}}>{x}</div>)}
      <div style={{position: 'absolute', left: px(20), top: 176, width: px(35) - px(20), textAlign: 'center', fontSize: 34, fontWeight: 900, color: BLUE}}>KIỀM HÔ HẤP</div>
      <div style={{position: 'absolute', left: px(35), top: 176, width: px(45) - px(35), textAlign: 'center', fontSize: 30, fontWeight: 800, color: K.green}}>bình thường</div>
      <div style={{position: 'absolute', left: px(45), top: 176, width: px(70) - px(45), textAlign: 'center', fontSize: 34, fontWeight: 900, color: K.o2}}>TOAN HÔ HẤP</div>
      {v !== undefined ? <div style={{position: 'absolute', left: px(v) - 6, top: 16, width: 12, height: 128, borderRadius: 6, background: K.txt, boxShadow: '0 0 20px #fff', opacity: va}} /> : null}
    </div>
  );
};
const Chain: React.FC<{items: string[]; s0: number; step: number; y: number; c: string}> = ({items, s0, step, y, c}) => {
  const t = useSec();
  return (
    <div style={{position: 'absolute', left: 120, top: y, width: 1680, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, fontFamily: FONT}}>
      {items.map((w, i) => (
        <React.Fragment key={w}>
          {i > 0 ? <div style={{fontSize: 50, color: c, opacity: ap(t, s0 + i * step)}}>→</div> : null}
          <div style={{padding: '18px 30px', borderRadius: 20, background: `${c}22`, border: `3px solid ${c}`, fontSize: 40, fontWeight: 800, color: K.txt, opacity: ap(t, s0 + i * step), whiteSpace: 'nowrap'}}>{chem(w)}</div>
        </React.Fragment>
      ))}
    </div>
  );
};

// ---------- 1 Mở đầu ----------
const F1: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={0} title="Toan và kiềm hô hấp" />
      <Big x={0} y={170} w={1920} a={ap(t, S[0])} size={130} c={K.co2}>PaCO₂</Big>
      <Co2Scale y={380} a={ap(t, S[1])} />
      <Memo x={560} y={700} w={800} s0={S[2] + 0.3} size={46}>PaCO₂ = nhiệt kế của thông khí</Memo>
    </>
  );
};

// ---------- 2 Thông khí ----------
const F2: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const X0 = 820, X1 = 1760, Y0 = 820, Y1 = 220;
  const vx = (v: number) => X0 + ((v - 2) / (12 - 2)) * (X1 - X0);
  const py = (p: number) => Y0 - ((p - 10) / (110 - 10)) * (Y0 - Y1);
  const curve = (v: number) => 200 / v; // PaCO₂ ∝ 1/VA (VA=5 → 40)
  const pts = Array.from({length: 101}, (_, i) => {
    const v = 2 + i * 0.1;
    return `${vx(v).toFixed(1)},${py(curve(v)).toFixed(1)}`;
  }).join(' L');
  const v = interpolate(t, [S[0], S[1], S[1] + 1.5, S[2], S[2] + 1.5], [5, 5, 2.7, 2.7, 9], clamp);
  const fast = t > S[2] ? 4 : t > S[1] ? 22 : 10;
  const amp = t > S[2] ? 0.06 : t > S[1] ? 0.015 : 0.03;
  return (
    <>
      <Top idx={1} title="PaCO₂ và thông khí phế nang" />
      <Svg>
        <g opacity={ap(t, S[0])}><Lung x={420} y={500} w={480 * (1 + amp * Math.sin(f / fast))} /></g>
        <g opacity={ap(t, S[0] + 0.4)}>
          <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={K.dim} strokeWidth={3} />
          <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke={K.dim} strokeWidth={3} />
          <path d={`M${pts}`} fill="none" stroke={K.amber} strokeWidth={7} />
          <circle cx={vx(v)} cy={py(curve(v))} r={18} fill={K.txt} stroke={curve(v) > 45 ? K.o2 : curve(v) < 35 ? BLUE : K.green} strokeWidth={7} />
        </g>
      </Svg>
      <Tx x={X0} y={Y0 + 20} w={X1 - X0} al="center" size={30} c={K.dim} b={700} a={ap(t, S[0] + 0.4)}>Thông khí phế nang →</Tx>
      <Tx x={X0 - 10} y={Y1 - 50} w={300} size={30} c={K.co2} b={800} a={ap(t, S[0] + 0.4)}>PaCO₂</Tx>
      <Pill x={vx(v)} y={py(curve(v)) - 90} a={ap(t, S[0] + 0.6)} c={curve(v) > 45 ? K.o2 : curve(v) < 35 ? BLUE : K.green} size={32} dark={false}>{`PaCO₂ ${Math.round(curve(v))}`}</Pill>
      <Tx x={1100} y={300} w={640} al="right" size={36} c={K.o2} b={800} a={ap(t, S[1] + 0.8) * (1 - ap(t, S[2]))}>Thở ít → CO₂ ứ lại</Tx>
      <Tx x={1100} y={300} w={640} al="right" size={36} c={BLUE} b={800} a={ap(t, S[2] + 0.8)}>Thở nhiều → thải CO₂</Tx>
      <Panel x={90} y={790} w={700} h={140} c={K.amber} s0={S[3]}>
        <Tx x={20} y={22} w={660} al="center" size={30} b={800}>Thở nhanh nông: khí qua khoảng chết</Tx>
        <Tx x={20} y={80} w={660} al="center" size={26} c={K.dim}>thông khí phế nang vẫn có thể giảm</Tx>
      </Panel>
    </>
  );
};

// ---------- 3 Nguyên nhân toan hô hấp ----------
const STA: [string, string, string][] = [['1', 'Trung tâm hô hấp', 'Thuốc an thần · opioid · tổn thương thân não'], ['2', 'Thần kinh – cơ', 'Guillain-Barré · nhược cơ · tổn thương tuỷ cổ'], ['3', 'Thành ngực', 'Béo phì nặng · gù vẹo cột sống'], ['4', 'Đường thở – phổi', 'COPD · hen nặng']];
const F3: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={2} title="Toan hô hấp: tìm chỗ hỏng" />
      <Tx x={120} y={160} w={1680} al="center" size={38} c={K.dim} b={700} a={ap(t, S[0])}>Đường đi của một nhịp thở</Tx>
      <div style={{position: 'absolute', left: 120, top: 250, width: 1680, height: 6, borderRadius: 3, background: K.o2, opacity: ap(t, S[0]) * 0.6}} />
      <div style={{position: 'absolute', left: 120, top: 290, width: 1680, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, fontFamily: FONT}}>
        {STA.map(([n, h, b], i) => {
          const on = ap(t, S[i + 1]);
          return (
            <div key={n} style={{height: 470, borderRadius: 24, background: on > 0.5 ? 'rgba(229,72,77,.14)' : 'rgba(255,255,255,.04)', border: `4px solid ${on > 0.5 ? K.o2 : K.line}`, textAlign: 'center', padding: '30px 24px', opacity: 0.35 + 0.65 * Math.max(ap(t, S[0] + i * 0.3) * 0.5, on), boxShadow: on > 0.5 ? '0 0 40px rgba(229,72,77,.35)' : 'none'}}>
              <div style={{width: 90, height: 90, margin: '0 auto', borderRadius: '50%', background: K.o2, color: '#fff', fontSize: 52, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{n}</div>
              <div style={{fontSize: 40, fontWeight: 900, color: K.txt, marginTop: 24}}>{h}</div>
              <div style={{fontSize: 32, fontWeight: 700, color: K.dim, marginTop: 30, lineHeight: 1.4, opacity: on}}>{b}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ---------- 4 Cấp và mạn ----------
const F4: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={3} title="Toan hô hấp cấp hay mạn?" />
      <Svg><g opacity={ap(t, S[0])}><Kid x={360} y={480} h={480} /></g></Svg>
      <Panel x={680} y={190} w={1100} h={170} c={K.hco3} s0={S[0] + 0.3}>
        <Tx x={0} y={28} w={1100} al="center" size={42} b={800}>Thận bù bằng cách giữ HCO₃⁻</Tx>
        <Tx x={0} y={96} w={1100} al="center" size={34} c={K.amber} b={800}>cần 3–5 ngày</Tx>
      </Panel>
      <Gold x={680} y={420} a={ap(t, S[1])} size={44}>PaCO₂ ↑ 10 → HCO₃⁻ ↑ 1 (cấp) · ↑ 3,5–4 (mạn)</Gold>
      <Memo x={780} y={600} w={900} s0={S[2] + 0.3} size={46}>Nhìn HCO₃⁻ → biết cấp hay mạn</Memo>
    </>
  );
};

// ---------- 5 Ca D, E ----------
const F5: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={4} title="Cùng PaCO₂ 60: cấp hay mạn?" />
      <Slip s0={S[0]} rows={ROWS_D} hl={t > S[2] ? ['hco3'] : t > S[1] ? ['co2', 'hco3', 'ph'] : ['co2']} x={160} y={170} title="D · QUÁ LIỀU OPIOID" />
      <Slip s0={S[0] + 0.4} rows={ROWS_E} hl={t > S[4] ? ['hco3'] : t > S[3] ? ['co2', 'hco3', 'ph'] : ['co2']} x={1000} y={170} title="E · COPD ỔN ĐỊNH" />
      <Tx x={160} y={560} w={760} al="center" size={36} b={800} a={ap(t, S[2])}>PaCO₂ ↑ 20 · HCO₃⁻ chỉ ↑ 2</Tx>
      <Res x={360} y={630} s0={S[2] + 1} c={K.o2}>TOAN HH CẤP</Res>
      <Tx x={1000} y={560} w={760} al="center" size={36} b={800} a={ap(t, S[4])}>PaCO₂ ↑ 20 · HCO₃⁻ ↑ 7</Tx>
      <Res x={1200} y={630} s0={S[4] + 1} c={K.amber}>TOAN HH MẠN</Res>
      <Tx x={1000} y={740} w={760} al="center" size={34} c={K.amber} b={800} a={ap(t, S[4] + 1.4)}>thận đã bù</Tx>
    </>
  );
};

// ---------- 6 COPD và oxy ----------
const F6: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const X0 = 300, W = 1320;
  const px = (v: number) => X0 + ((v - 80) / 20) * W;
  return (
    <>
      <Top idx={5} title="COPD giữ CO₂: cẩn thận khi cho oxy" />
      <Card x={300} y={180} w={1320} h={170} c={K.amber} s0={S[0]} head="COPD CÓ GIỮ CO₂" body="Oxy quá mức → PaCO₂ tăng thêm" size={44} glow={ap(t, S[1])} />
      <div style={{position: 'absolute', left: X0, top: 500, width: W, height: 70, borderRadius: 35, background: 'rgba(255,255,255,.12)', opacity: ap(t, S[2])}} />
      <div style={{position: 'absolute', left: px(88), top: 480, width: px(92) - px(88), height: 110, borderRadius: 20, background: 'rgba(63,178,127,.5)', border: `4px solid ${K.green}`, opacity: ap(t, S[2] + 0.4)}} />
      {[80, 85, 88, 92, 95, 100].map((v) => <Tx key={v} x={px(v) - 50} y={600} w={100} al="center" size={32} c={v === 88 || v === 92 ? K.green : K.dim} b={800} a={ap(t, S[2])}>{String(v)}</Tx>)}
      <Tx x={X0} y={420} w={W} al="center" size={34} c={K.dim} b={700} a={ap(t, S[2])}>SpO₂ (%)</Tx>
      <Res x={720} y={680} s0={S[2] + 1} c={K.green}>Mục tiêu SpO₂ 88–92%</Res>
    </>
  );
};

// ---------- 7 Kiềm hô hấp: nguyên nhân ----------
const F7: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={6} title="Kiềm hô hấp: tăng thông khí" />
      <Pill x={960} y={160} a={ap(t, S[0])} c={BLUE} size={34}>PHẦN 2 · PaCO₂ &lt; 35</Pill>
      <Card x={120} y={300} w={540} h={280} c={K.o2} s0={S[1]} head="THIẾU OXY" body="Thuyên tắc phổi · viêm phổi · lên vùng cao" size={40} />
      <Card x={690} y={300} w={540} h={280} c={K.amber} s0={S[2]} head="KÍCH THÍCH TRUNG TÂM" body="Sốt · nhiễm khuẩn huyết · xơ gan · thai kỳ · salicylate" size={40} />
      <Card x={1260} y={300} w={540} h={280} c={BLUE} s0={S[3]} head="KHÁC" body="Đau · lo âu · thở máy quá mức" size={40} />
    </>
  );
};

// ---------- 8 Bù kiềm hô hấp ----------
const F8: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={7} title="Bù trừ kiềm hô hấp" />
      <Svg><g opacity={ap(t, S[0])}><Kid x={360} y={480} h={480} /></g></Svg>
      <Panel x={680} y={220} w={1100} h={150} c={K.hco3} s0={S[0] + 0.3}>
        <Tx x={0} y={46} w={1100} al="center" size={44} b={800}>Thận bù bằng cách thải HCO₃⁻</Tx>
      </Panel>
      <Gold x={680} y={440} a={ap(t, S[1])} size={44}>PaCO₂ ↓ 10 → HCO₃⁻ ↓ 2 (cấp) · ↓ 4–5 (mạn)</Gold>
    </>
  );
};

// ---------- 9 Ca F ----------
const F9: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={8} title="Bệnh nhân F · khó thở sau mổ" />
      <Slip s0={S[0]} rows={ROWS_F} hl={t > S[3] ? ['co2', 'o2'] : t > S[2] ? ['co2', 'hco3'] : t > S[1] ? ['ph', 'co2', 'hco3', 'o2'] : []} title="BỆNH NHÂN F" y={180} />
      <Tx x={680} y={190} w={1100} size={38} b={800} a={ap(t, S[2])}>PaCO₂ ↓ 10 · HCO₃⁻ ↓ 2</Tx>
      <Res x={680} y={250} s0={S[2] + 1} c={BLUE}>KIỀM HÔ HẤP CẤP</Res>
      <Gold x={680} y={400} a={ap(t, S[3])} size={40}>A–a ≈ (150 − 1,25 × 30) − 62 ≈ 50</Gold>
      <Res x={680} y={520} s0={S[3] + 1.2} c={K.o2}>A–a TĂNG · phổi có vấn đề</Res>
      <Panel x={680} y={670} w={1100} h={150} c={K.o2} s0={S[4]} glow={ap(t, S[4] + 0.8)}>
        <Tx x={0} y={44} w={1100} al="center" size={54} b={900}>Nghĩ: THUYÊN TẮC PHỔI</Tx>
      </Panel>
    </>
  );
};

// ---------- 10 Cảnh báo ----------
const F10: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const items: [string, string][] = [['Thuyên tắc phổi', K.o2], ['Nhiễm khuẩn huyết', K.amber], ['Ngộ độc salicylate', '#B07CF0']];
  return (
    <>
      <Top idx={9} title="Đừng vội kết luận" />
      <Panel x={360} y={180} w={1200} h={200} c={K.o2} s0={S[0]} glow={0.4}>
        <Tx x={0} y={36} w={1200} al="center" size={30} c={K.o2} b={800}>⚠ KIỀM HÔ HẤP</Tx>
        <Tx x={0} y={90} w={1200} al="center" size={54} b={900}>Đừng vội nói "do lo âu"</Tx>
      </Panel>
      <Tx x={360} y={430} w={1200} al="center" size={36} c={K.dim} b={700} a={ap(t, S[1])}>Loại trừ trước:</Tx>
      <div style={{position: 'absolute', left: 160, top: 510, width: 1600, display: 'flex', justifyContent: 'center', gap: 30, fontFamily: FONT}}>
        {items.map(([w, c], i) => {
          const p = ap(t, S[1] + 0.6 + i * 0.6);
          return <div key={w} style={{padding: '22px 40px', borderRadius: 999, background: c, color: c === K.amber ? K.ink : '#fff', fontSize: 46, fontWeight: 900, opacity: p, transform: `scale(${0.8 + 0.2 * p})`}}>{w}</div>;
        })}
      </div>
    </>
  );
};

// ---------- 11 Ôn tập ----------
const F11: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const nx = usePop(S[2] + 0.3);
  return (
    <>
      <Top idx={10} title="Ôn tập" />
      <Card x={160} y={260} w={760} h={270} c={K.o2} s0={S[0]} head="PaCO₂ ↑ · TOAN HÔ HẤP" body="Tìm chỗ giảm thông khí · HCO₃⁻ cho biết cấp hay mạn" size={42} />
      <Card x={1000} y={260} w={760} h={270} c={BLUE} s0={S[1]} head="PaCO₂ ↓ · KIỀM HÔ HẤP" body="Tìm nguyên nhân tăng thông khí · loại trừ bệnh nguy hiểm" size={42} />
      {nx > 0.01 && (
        <div style={{position: 'absolute', left: 560, top: 680, width: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '16px 0', borderRadius: 999, border: `2px solid ${K.amber}`, background: 'rgba(245,184,61,.08)', fontFamily: FONT, opacity: Math.min(1, nx * 1.5)}}>
          <span style={{fontSize: 28, fontWeight: 800, color: K.amber, letterSpacing: 1}}>BÀI 7</span>
          <span style={{fontSize: 34, fontWeight: 700, color: K.txt}}>Rối loạn toan kiềm hỗn hợp</span>
        </div>
      )}
    </>
  );
};

const SC: React.FC<{S: number[]; D: number[]}>[] = [F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11];

export const Abg6: React.FC = () => (
  <AbsoluteFill style={{background: '#0D1B24'}}>
    <Audio src={staticFile('narration.m4a')} />
    <Studio />
    {data.scenes.map((s, i) => {
      const C = SC[i];
      if (!C) return null;
      return (
        <Sequence key={i} from={s.from} durationInFrames={s.dur} layout="none">
          <Fade dur={s.dur}>
            <C S={s.sents.map((x) => x.start)} D={s.sents.map((x) => x.dur)} />
          </Fade>
        </Sequence>
      );
    })}
    <Caption />
    <Progress />
  </AbsoluteFill>
);
