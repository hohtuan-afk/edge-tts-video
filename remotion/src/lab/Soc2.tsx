// Giải mã sốc · Bài 2: 4 kiểu sốc (11 cảnh)
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
const NAMES = ['MỞ ĐẦU', '4 KIỂU', 'GIẢM THỂ TÍCH', 'SỐC TIM', 'TẮC NGHẼN', 'PHÂN BỐ', 'PHÂN BIỆT', 'SIÊU ÂM', 'HỖN HỢP', 'GIẢI CA', 'ÔN TẬP'];

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
      <Tx x={44} y={22} size={24} c={K.dim} b={600}>GIẢI MÃ SỐC · BÀI 2</Tx>
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
const Slip: React.FC<{s0: number; rows: Row[]; hl?: string[]; x?: number; y?: number; title?: string; sw?: number; nw?: number}> = ({s0, rows, hl = [], x = 80, y = 170, title = 'PHIẾU KHÍ MÁU', sw = 460, nw = 170}) => {
  const p = usePop(s0);
  const f = useCurrentFrame();
  if (p <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: sw, padding: '20px 24px', borderRadius: 18, background: '#F4F1EA', boxShadow: '0 20px 50px rgba(0,0,0,.5)', fontFamily: FONT, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 40}px) rotate(-1deg)`}}>
      <div style={{fontSize: 22, fontWeight: 800, letterSpacing: 3, color: '#6B5A3A'}}>{title}</div>
      <div style={{height: 3, background: '#CDBFA5', margin: '8px 0 6px'}} />
      {rows.map(([k, n, v, u]) => {
        const on = hl.includes(k);
        return (
          <div key={k} style={{display: 'flex', alignItems: 'baseline', padding: '6px 12px', borderRadius: 12, background: on ? `rgba(245,184,61,${0.35 + 0.1 * Math.sin(f / 6)})` : 'transparent', border: on ? '3px solid #E09A10' : '3px solid transparent'}}>
            <span style={{width: nw, whiteSpace: 'nowrap', fontSize: 34, fontWeight: 700, color: K.ink}}>{chem(n)}</span>
            <span style={{fontSize: 46, fontWeight: 900, color: K.ink, width: 165}}>{v}</span>
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

const ROWS_G: Row[] = [['ph', 'pH', '7,04', ''], ['co2', 'PaCO₂', '50', 'mmHg'], ['hco3', 'HCO₃⁻', '13', 'mmol/L']];
const ROWS_H: Row[] = [['ph', 'pH', '7,44', ''], ['co2', 'PaCO₂', '20', 'mmHg'], ['hco3', 'HCO₃⁻', '13', 'mmol/L'], ['ag', 'AG', '23', '']];
const ROWS_I: Row[] = [['ph', 'pH', '7,40', ''], ['co2', 'PaCO₂', '40', 'mmHg'], ['hco3', 'HCO₃⁻', '24', 'mmol/L'], ['na', 'Na⁺', '140', ''], ['cl', 'Cl⁻', '90', '']];
const Step: React.FC<{x?: number; y: number; s0: number; c?: string; size?: number; children: string}> = ({x = 680, y, s0, c = K.txt, size = 38, children}) => {
  const t = useSec();
  const a = ap(t, s0);
  return <div style={{position: 'absolute', left: x, top: y, width: 1140, fontFamily: FONT, fontSize: size, fontWeight: 800, color: c, opacity: a, transform: `translateX(${(1 - a) * 30}px)`}}>{chem(children)}</div>;
};

const ROWS_1: Row[] = [['ph', 'pH', '7,19', ''], ['co2', 'PaCO₂', '38', 'mmHg'], ['hco3', 'HCO₃⁻', '14', 'mmol/L'], ['lac', 'Lactate', '6', 'mmol/L']];

// biểu đồ xu hướng lactate
const Trend: React.FC<{x: number; y: number; w: number; h: number; a: number; draw: number}> = ({x, y, w, h, a, draw}) => {
  const pts: [string, number][] = [['0 giờ', 6], ['2 giờ', 4.2], ['4 giờ', 2.6], ['6 giờ', 1.8]];
  const px = (i: number) => x + 60 + (i / 3) * (w - 120);
  const py = (v: number) => y + h - 50 - (v / 7) * (h - 90);
  const n = Math.min(3, draw * 3);
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, overflow: 'visible', opacity: a}}>
      <line x1={x + 40} y1={py(2)} x2={x + w - 20} y2={py(2)} stroke={K.amber} strokeWidth={3} strokeDasharray="10 8" />
      <text x={x + 50} y={py(2) + 36} textAnchor="start" fontFamily={FONT} fontSize={26} fontWeight={800} fill={K.amber}>ngưỡng 2 mmol/L</text>
      {pts.slice(0, Math.floor(n) + 1).map(([l, v], i) => (
        <g key={l}>
          {i > 0 ? <line x1={px(i - 1)} y1={py(pts[i - 1][1])} x2={px(i)} y2={py(v)} stroke={K.green} strokeWidth={7} /> : null}
          <circle cx={px(i)} cy={py(v)} r={16} fill={v > 2 ? K.o2 : K.green} />
          <text x={px(i)} y={py(v) - 28} textAnchor="middle" fontFamily={FONT} fontSize={32} fontWeight={900} fill={K.txt}>{String(v).replace('.', ',')}</text>
          <text x={px(i)} y={y + h - 10} textAnchor="middle" fontFamily={FONT} fontSize={26} fill={K.dim}>{l}</text>
        </g>
      ))}
    </svg>
  );
};
const Check: React.FC<{items: string[]; s0: number[]; x?: number; y?: number; w?: number}> = ({items, s0, x = 260, y = 200, w = 1400}) => {
  const t = useSec();
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, display: 'flex', flexDirection: 'column', gap: 22, fontFamily: FONT}}>
      {items.map((q, i) => {
        const p = ap(t, s0[i]);
        return (
          <div key={q} style={{display: 'flex', alignItems: 'center', gap: 28, padding: '22px 34px', borderRadius: 22, background: 'rgba(245,184,61,.08)', border: `3px solid ${p > 0.5 ? K.amber : K.line}`, opacity: 0.25 + 0.75 * p, transform: `translateX(${(1 - p) * 30}px)`}}>
            <div style={{width: 70, height: 70, borderRadius: '50%', background: K.amber, color: K.ink, fontSize: 42, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>{i + 1}</div>
            <div style={{fontSize: 42, fontWeight: 800, color: K.txt}}>{chem(q)}</div>
          </div>
        );
      })}
    </div>
  );
};

const ROWS_S: Row[] = [['ph', 'pH', '7,32', ''], ['co2', 'PaCO₂', '30', 'mmHg'], ['hco3', 'HCO₃⁻', '15', 'mmol/L'], ['be', 'BE', '−10', ''], ['na', 'Na⁺', '140', ''], ['cl', 'Cl⁻', '115', ''], ['alb', 'Albumin', '22', 'g/L'], ['lac', 'Lactate', '3', 'mmol/L']];
const PURPLE = '#B07CF0';
const BigPill: React.FC<{x: number; y: number; a: number; c: string; children: string}> = ({x, y, a, c, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 460, padding: '30px 0', textAlign: 'center', borderRadius: 30, background: `${c}26`, border: `5px solid ${c}`, fontFamily: FONT, fontSize: 64, fontWeight: 900, color: K.txt, opacity: a, transform: `scale(${0.85 + 0.15 * a})`, boxShadow: `0 0 40px ${c}55`}}>{chem(children)}</div>
);

const NA = '#E8A13A', KK = '#9B7CF0', WATER = '#38A7DD';
const Pic: React.FC<{src: string; x: number; y: number; w: number; a?: number; s?: number; glow?: string}> = ({src, x, y, w, a = 1, s = 1, glow}) => (
  <img src={staticFile(src)} style={{position: 'absolute', left: x, top: y, width: w, opacity: a, transform: `scale(${s})`, transformOrigin: '50% 50%', filter: `drop-shadow(0 24px 40px rgba(0,0,0,.55))${glow ? ` drop-shadow(0 0 30px ${glow})` : ''}`}} />
);
const Ion: React.FC<{x: number; y: number; t: string; c: string; r?: number; o?: number}> = ({x, y, t, c, r = 30, o = 1}) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <circle r={r} fill={c} stroke="rgba(255,255,255,.6)" strokeWidth={2} />
    <text y={r * 0.33} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 0.85} fill="#fff">{t}</text>
  </g>
);

const Bullets: React.FC<{x: number; y: number; w: number; items: string[]; s0: number[]; c: string; size?: number}> = ({x, y, w, items, s0, c, size = 34}) => {
  const t = useSec();
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, fontFamily: FONT, display: 'flex', flexWrap: 'wrap', gap: 14}}>
      {items.map((it, i) => (
        <div key={it} style={{padding: '10px 22px', borderRadius: 999, background: `${c}22`, border: `2px solid ${c}`, fontSize: size, fontWeight: 700, color: K.txt, opacity: ap(t, s0[i]), transform: `translateY(${(1 - ap(t, s0[i])) * 12}px)`, whiteSpace: 'nowrap'}}>{chem(it)}</div>
      ))}
    </div>
  );
};


// ---- siêu âm kiểu thật ----
const FAN2 = 'M300,10 L2,436 A520,520 0 0,0 598,436 Z';
export const Echo2: React.FC<{x: number; y: number; s?: number; a: number; kind: string; id: string}> = ({x, y, s = 1, a, kind, id}) => {
  const f = useCurrentFrame();
  const ph = (f % 22) / 22;
  const sys = Math.exp(-Math.pow((ph - 0.3) / 0.15, 2));
  const resp = 0.5 + 0.5 * Math.sin(f / 24);
  const press = Math.max(0, Math.sin(f / 18));
  const hk = kind === 'hyper' ? 1 - 0.16 * sys : kind === 'weak' ? 1.06 - 0.015 * sys : 1 - 0.06 * sys;
  const b = `b${id}`, bb = `bb${id}`;
  return (
    <svg width={600 * s} height={560 * s} viewBox="0 0 600 560" style={{position: 'absolute', left: x, top: y, opacity: a}}>
      <defs>
        <clipPath id={`c${id}`}><path d={FAN2} /></clipPath>
        <filter id={b} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id={bb} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9" /></filter>
      </defs>
      <path d={FAN2} fill="#060606" />
      <g clipPath={`url(#c${id})`}>
        <image href={staticFile('soc_speckle.png')} width={600} height={560} opacity={0.55} />
        {kind === 'heartEff' || kind === 'hyper' || kind === 'weak' ? (
          <g transform={`translate(300,290) scale(${hk}) translate(-300,-290)`}>
            {kind === 'heartEff' ? (
              <>
                <g filter={`url(#${bb})`}><path d="M300,40 C150,60 60,200 70,320 C80,430 170,500 300,505 C430,500 520,430 530,320 C540,200 450,60 300,40Z" fill="#000" /></g>
                <path d="M300,30 C140,50 50,200 60,320 C70,440 165,512 300,517 C435,512 530,440 540,320 C550,200 460,50 300,30Z" fill="none" stroke="#f5f5f5" strokeWidth={14} filter={`url(#${b})`} />
              </>
            ) : <g filter={`url(#${bb})`}><path d="M300,78 C200,92 120,200 118,300 C116,380 150,470 300,478 C450,470 484,380 482,300 C480,200 400,92 300,78Z" fill="#000" /></g>}
            <g filter={`url(#${b})`}>
              <path d="M300,78 C200,92 120,200 118,300 C116,380 150,470 300,478 C450,470 484,380 482,300 C480,200 400,92 300,78Z" fill="none" stroke={kind === 'heartEff' ? '#a8a8a8' : '#dcdcdc'} strokeWidth={kind === 'hyper' ? 30 + 18 * sys : 30} />
              <path d="M318,92 C330,170 325,250 312,318" stroke="#b5b5b5" strokeWidth={26} fill="none" />
              <path d="M140,318 C220,312 380,312 462,318" stroke="#9a9a9a" strokeWidth={16} fill="none" />
              <path d="M300,330 L300,470" stroke="#a0a0a0" strokeWidth={18} />
              <path d={`M180,318 L215,${300 + 14 * sys} M250,318 L275,${302 + 14 * sys} M350,318 L372,${300 + 14 * sys} M420,318 L445,${302 + 14 * sys}`} stroke="#e8e8e8" strokeWidth={7} />
            </g>
          </g>
        ) : null}
        {kind === 'ivc' ? (() => {
          const h = 6 + 16 * resp;
          return (
            <g filter={`url(#${b})`}>
              <path d="M0,0 L600,0 L600,200 C500,230 300,236 0,240 Z" fill="#8a8a8a" opacity={0.45} />
              <path d={`M-10,${260 - h / 2 - 9} C150,${256 - h / 2 - 9} 330,${254 - h / 2 - 9} 470,${254 - h / 2 - 9} C520,${250 - h / 2 - 9} 560,200 610,170 L610,340 C560,310 520,${258 + h / 2 + 9} 470,${258 + h / 2 + 9} C330,${258 + h / 2 + 9} 150,${262 + h / 2 + 9} -10,${264 + h / 2 + 9} Z`} fill="#ededed" opacity={0.85} />
              <path d={`M-10,${260 - h / 2} C150,${256 - h / 2} 330,${254 - h / 2} 470,${254 - h / 2} C520,${252 - h / 2} 560,215 610,190 L610,320 C560,300 520,${258 + h / 2} 470,${258 + h / 2} C330,${258 + h / 2} 150,${262 + h / 2} -10,${264 + h / 2} Z`} fill="#030303" />
            </g>
          );
        })() : null}
        {kind === 'lung' ? (
          <g filter={`url(#${b})`}>
            <rect x={0} y={0} width={600} height={120} fill="#777" opacity={0.35} />
            <path d="M0,140 L600,140" stroke="#f2f2f2" strokeWidth={14} strokeDasharray="34 10" strokeDashoffset={f * 2.5} />
            {[250, 360, 470].map((yy, i) => <path key={i} d={`M0,${yy} L600,${yy}`} stroke="#d0d0d0" strokeWidth={10} opacity={0.75 - i * 0.18} />)}
            <rect x={150} y={60} width={46} height={110} fill="#050505" /><rect x={400} y={60} width={46} height={110} fill="#050505" />
          </g>
        ) : null}
        {kind === 'vessel' ? (
          <g filter={`url(#${b})`}>
            <rect x={0} y={0} width={600} height={560} fill="#555" opacity={0.3} />
            <circle cx={200} cy={260 - 10 * press} r={62 + 4 * sys} fill="#030303" stroke="#eee" strokeWidth={12} />
            <ellipse cx={390} cy={270 - 10 * press} rx={78} ry={60} fill="#3a3a3a" stroke="#ddd" strokeWidth={10} />
            <ellipse cx={380} cy={265 - 10 * press} rx={45} ry={32} fill="#6a6a6a" />
          </g>
        ) : null}
      </g>
      {kind === 'vessel' ? <rect x={230} y={-60 + 40 * press} width={140} height={60} rx={14} fill={K.amber} opacity={0.9} /> : null}
      <path d={FAN2} fill="none" stroke="#2d3c44" strokeWidth={3} />
      <g fill="#7f8f96" fontSize={16} fontFamily="Arial">{[0, 1, 2, 3, 4].map((i) => <g key={i}><rect x={586} y={40 + i * 95} width={10} height={3} /><text x={566} y={48 + i * 95} textAnchor="end">{i * 3}</text></g>)}</g>
      <circle cx={250} cy={22} r={7} fill={K.amber} />
    </svg>
  );
};
const SPOTS: [number, number, string][] = [[270, 340, '1'], [255, 430, '2'], [170, 270, '3'], [355, 270, '3'], [215, 470, '4'], [300, 480, '5'], [200, 690, '6']];
const Body: React.FC<{x: number; y: number; s: number; a: number; act: string[]; c: string}> = ({x, y, s, a, act, c}) => {
  const f = useCurrentFrame();
  const pul = 1 + 0.08 * Math.sin(f / 6);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 520 * s, height: 900 * s, opacity: a}}>
      <svg width={520 * s} height={900 * s} viewBox="0 0 520 900">
        <defs><linearGradient id="tgB" x1="0" x2="1"><stop offset="0" stopColor="#2a4a5a" /><stop offset=".5" stopColor="#3b6476" /><stop offset="1" stopColor="#2a4a5a" /></linearGradient></defs>
        <circle cx={260} cy={80} r={62} fill="url(#tgB)" />
        <path d="M120,170 C160,150 360,150 400,170 L430,250 L410,470 L400,560 L120,560 L110,470 L90,250 Z" fill="url(#tgB)" />
        <path d="M130,560 L250,560 L240,880 L170,880 Z M270,560 L390,560 L350,880 L280,880 Z" fill="url(#tgB)" />
        <path d="M90,250 L40,520 L70,530 L120,330 M430,250 L480,520 L450,530 L400,330" fill="url(#tgB)" />
        <path d="M160,210 C140,260 140,330 170,380 L240,380 L240,220 Z" fill="#7fb7d1" opacity={0.25} />
        <path d="M360,210 C380,260 380,330 350,380 L280,380 L280,220 Z" fill="#7fb7d1" opacity={0.25} />
        <path d="M245,300 C220,300 210,340 240,370 L270,395 L300,360 C320,330 300,300 280,305 Z" fill={RED} opacity={0.85} />
        <path d="M200,400 C230,390 300,390 330,400 L330,470 L200,470 Z" fill="#8a5a3a" opacity={0.45} />
      </svg>
      {SPOTS.map(([sx, sy, n], i) => {
        const on = act.includes(n);
        return <div key={i} style={{position: 'absolute', left: sx * s - 30, top: sy * s - 30, width: 60, height: 60, borderRadius: '50%', background: on ? c : '#2b3a42', border: `4px solid ${on ? '#fff' : '#55707c'}`, color: '#0b1a22', fontFamily: FONT, fontSize: 30, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: on ? `0 0 30px ${c}` : 'none', opacity: on ? 1 : 0.6, transform: `scale(${on ? pul : 1})`}}>{n}</div>;
      })}
    </div>
  );
};
const Ann: React.FC<{x: number; y: number; c?: string; a: number; children: string}> = ({x, y, c = K.txt, a, children}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: FONT, fontSize: 30, fontWeight: 900, color: c, textShadow: '0 2px 6px #000', whiteSpace: 'nowrap', opacity: a}}>{children}</div>
);

// ---------- 1 Mở đầu ----------

// ảnh tế bào: tỉ lệ gốc
const CELL: Record<string, [number, number]> = {dg_tb_bt: [917, 1112], dg_tb_phu: [907, 1131], dg_tb_teo: [728, 847]};
const Cell: React.FC<{k: string; cx: number; cy: number; f?: number; a?: number; s?: number; glow?: string}> = ({k, cx, cy, f = 0.32, a = 1, s = 1, glow}) => {
  const [w, h] = CELL[k];
  return <Pic src={`${k}.png`} x={cx - (w * f) / 2} y={cy - (h * f) / 2} w={w * f} a={a} s={s} glow={glow} />;
};
const Lbl: React.FC<{cx: number; y: number; w?: number; c: string; a: number; size?: number; children: string}> = ({cx, y, w = 420, c, a, size = 34, children}) => (
  <div style={{position: 'absolute', left: cx - w / 2, top: y, width: w, textAlign: 'center', fontFamily: FONT, fontSize: size, fontWeight: 900, color: c, opacity: a, lineHeight: 1.2}}>{chem(children)}</div>
);
const Arr: React.FC<{x: number; y: number; a: number; c?: string}> = ({x, y, a, c = K.dim}) => <div style={{position: 'absolute', left: x, top: y, fontFamily: FONT, fontSize: 70, fontWeight: 900, color: c, opacity: a}}>→</div>;

const Lim: React.FC<{x: number; y?: number; w?: number; h?: number; s0: number; c: string; top: string; v: string; unit?: string}> = ({x, y = 190, w = 700, h = 270, s0, c, top, v, unit}) => {
  const p = usePop(s0, 11);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 34, border: `5px solid ${c}`, background: `${c}1f`, textAlign: 'center', fontFamily: FONT, transform: `scale(${p})`, opacity: Math.min(1, p * 1.5)}}>
      <div style={{fontSize: 36, fontWeight: 800, color: c, marginTop: 26}}>{top}</div>
      <div style={{fontSize: 110, fontWeight: 900, color: K.txt, lineHeight: 1.2}}>{v}</div>
      {unit ? <div style={{fontSize: 30, color: K.dim, fontWeight: 700}}>{unit}</div> : null}
    </div>
  );
};

const KC = '#9B7CF0';
const KDot: React.FC<{x: number; y: number; a?: number; r?: number; c?: string; t?: string}> = ({x, y, a = 1, r = 26, c = KC, t = 'K⁺'}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: c, color: '#fff', fontFamily: FONT, fontSize: r * 0.78, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: a, boxShadow: '0 4px 10px rgba(0,0,0,.4)'}}>{t}</div>
);
// tảng băng kali
const Iceberg: React.FC<{x: number; y: number; s?: number; a: number; full?: boolean; t0?: number}> = ({x, y, s = 1, a, full = true, t0 = 0}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const bob = Math.sin(f / 18) * 6;
  return (
    <svg width={1100} height={860} viewBox="0 0 1100 860" style={{position: 'absolute', left: x, top: y, transform: `scale(${s})`, transformOrigin: '0 0', opacity: a, overflow: 'visible'}}>
      <defs>
        <linearGradient id="sea5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1F6E95" stopOpacity={0.85} /><stop offset="1" stopColor="#08202C" stopOpacity={0.2} /></linearGradient>
        <linearGradient id="ice5" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#9FD8F0" /></linearGradient>
        <linearGradient id="iceU5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9B7CF0" stopOpacity={0.95} /><stop offset="1" stopColor="#5B3FB0" stopOpacity={0.9} /></linearGradient>
      </defs>
      <rect x={0} y={200} width={1100} height={660} rx={30} fill="url(#sea5)" />
      <g transform={`translate(0,${bob})`}>
        <polygon points="450,200 500,80 540,45 590,90 640,200" fill="url(#ice5)" />
        {full ? <polygon points="450,200 640,200 850,330 920,520 820,720 545,800 300,730 180,540 240,330" fill="url(#iceU5)" opacity={ap(t, t0 + 0.6)} /> : null}
      </g>
      <path d="M0,200 Q90,190 180,200 T360,200 T540,200 T720,200 T900,200 T1100,200" stroke="#8FD3F2" strokeWidth={5} fill="none" />
      <text x={680} y={95} fontSize={46} fontWeight={900} fill="#fff" fontFamily={FONT}>K⁺ máu ~2%</text>
      <text x={680} y={145} fontSize={30} fontWeight={700} fill="#BFE6F7" fontFamily={FONT}>con số ta đo được</text>
      {full ? (
        <g opacity={ap(t, t0 + 1.2)}>
          <text x={545} y={500} fontSize={84} fontWeight={900} fill="#fff" textAnchor="middle" fontFamily={FONT}>~98%</text>
          <text x={545} y={570} fontSize={44} fontWeight={800} fill="#E9E1FF" textAnchor="middle" fontFamily={FONT}>trong tế bào</text>
        </g>
      ) : null}
    </svg>
  );
};
// sóng ECG
const ecgPath = (kind: 'n' | 'h', x0: number, y0: number, W: number, H: number, beats = 2) => {
  const g = (ph: number, a: number, m: number, s: number) => a * Math.exp(-Math.pow((ph - m) / s, 2) / 2);
  let d = '';
  for (let i = 0; i <= 600; i++) {
    const tt = (i / 600) * beats, ph = tt % 1;
    let v = g(ph, 0.15, 0.12, 0.025) + g(ph, -0.12, 0.235, 0.008) + g(ph, 1, 0.255, 0.011) + g(ph, -0.28, 0.275, 0.01);
    v += kind === 'n' ? g(ph, 0.32, 0.47, 0.045) : g(ph, -0.09, 0.36, 0.04) + g(ph, 0.06, 0.47, 0.04) + g(ph, 0.22, 0.62, 0.04);
    d += `${i ? 'L' : 'M'}${(x0 + (i / 600) * W).toFixed(1)},${(y0 - v * H).toFixed(1)} `;
  }
  return d;
};
const Paper: React.FC<{x: number; y: number; w: number; h: number; a: number}> = ({x, y, w, h, a}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 24, opacity: a, backgroundColor: '#FCE8EC', backgroundImage: 'linear-gradient(#F3A9B8 1.5px,transparent 1.5px),linear-gradient(90deg,#F3A9B8 1.5px,transparent 1.5px),linear-gradient(#F9D3DB 1px,transparent 1px),linear-gradient(90deg,#F9D3DB 1px,transparent 1px)', backgroundSize: '50px 50px,50px 50px,10px 10px,10px 10px'}} />
);
const Heart: React.FC<{x: number; y: number; w: number; a: number; danger?: boolean}> = ({x, y, w, a, danger}) => {
  const f = useCurrentFrame();
  const ph = (f % 24) / 24;
  const beat = 1 + 0.045 * Math.exp(-Math.pow((ph - 0.1) / 0.06, 2)) + 0.025 * Math.exp(-Math.pow((ph - 0.3) / 0.06, 2));
  return <Pic src="dg_tim.png" x={x} y={y} w={w} a={a} s={beat} glow={danger ? 'rgba(229,72,77,.6)' : 'rgba(229,72,77,.3)'} />;
};
const Muscle: React.FC<{x: number; y: number; a: number; weak: number}> = ({x, y, a, weak}) => (
  <svg width={760} height={420} viewBox="0 0 760 420" style={{position: 'absolute', left: x, top: y, opacity: a}}>
    <defs>
      <linearGradient id="mu5" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F08A8A" /><stop offset="1" stopColor="#A83445" /></linearGradient>
      <clipPath id="mc5"><path d="M80,170 C200,20 560,20 680,170 C560,320 200,320 80,170 Z" /></clipPath>
    </defs>
    <rect x={0} y={152} width={100} height={36} rx={18} fill="#EDE6D6" />
    <rect x={660} y={152} width={100} height={36} rx={18} fill="#EDE6D6" />
    <path d="M80,170 C200,20 560,20 680,170 C560,320 200,320 80,170 Z" fill="url(#mu5)" />
    <g clipPath="url(#mc5)" stroke="#7E2032" strokeWidth={3} opacity={0.5} fill="none">
      {Array.from({length: 14}, (_, i) => {
        const yy = 40 + i * 20;
        return <path key={i} d={`M80,${170 + (yy - 170) / 3} C240,${yy} 520,${yy} 680,${170 + (yy - 170) / 3}`} />;
      })}
    </g>
    <g clipPath="url(#mc5)" stroke="#FFD0D0" strokeWidth={2} opacity={0.35}>
      {Array.from({length: 34}, (_, i) => <line key={i} x1={110 + i * 17} y1={20} x2={110 + i * 17} y2={320} />)}
    </g>
    <g transform="translate(250,330)" opacity={weak}>
      <rect width={240} height={80} rx={16} fill="none" stroke="#E5484D" strokeWidth={7} />
      <rect x={240} y={24} width={18} height={32} rx={5} fill="#E5484D" />
      <rect x={12} y={12} width={46} height={56} rx={8} fill="#E5484D" opacity={0.5 + 0.5 * Math.abs(Math.sin(weak * 20))} />
    </g>
  </svg>
);
const Bag: React.FC<{x: number; y: number; a: number}> = ({x, y, a}) => {
  const f = useCurrentFrame();
  const drop = (f % 30) / 30;
  return (
    <svg width={340} height={760} viewBox="0 0 340 760" style={{position: 'absolute', left: x, top: y, opacity: a}}>
      <rect x={20} y={0} width={300} height={440} rx={60} fill="rgba(230,245,252,.92)" stroke="#BFE6F7" strokeWidth={5} />
      <rect x={20} y={180} width={300} height={260} rx={60} fill="rgba(155,124,240,.35)" />
      <rect x={60} y={60} width={220} height={120} rx={14} fill="#fff" stroke="#E5484D" strokeWidth={5} />
      <text x={170} y={112} fontSize={44} fontWeight={900} fill="#C0263A" textAnchor="middle" fontFamily={FONT}>KCl</text>
      <text x={170} y={158} fontSize={26} fontWeight={800} fill="#1D2B33" textAnchor="middle" fontFamily={FONT}>pha NaCl 0,9%</text>
      <rect x={140} y={440} width={60} height={60} fill="#DDE7EC" />
      <circle cx={170} cy={505 + drop * 60} r={8} fill="#9B7CF0" opacity={1 - drop} />
      <path d="M170,500 L170,620" stroke="#BFE6F7" strokeWidth={8} />
      <rect x={80} y={620} width={180} height={120} rx={18} fill="#DDE7EC" />
      <text x={170} y={695} fontSize={34} fontWeight={900} fill="#1D2B33" textAnchor="middle" fontFamily={FONT}>≤10/giờ</text>
    </svg>
  );
};
const NoSyringe: React.FC<{x: number; y: number; a: number}> = ({x, y, a}) => (
  <svg width={360} height={200} viewBox="-70 -30 380 200" style={{position: 'absolute', left: x, top: y, opacity: a}}>
    <rect x={0} y={40} width={200} height={50} rx={10} fill="#DDE7EC" />
    <rect x={200} y={55} width={70} height={20} fill="#DDE7EC" />
    <rect x={-60} y={50} width={60} height={30} rx={6} fill="#9FB3BD" />
    <line x1={-60} y1={-20} x2={290} y2={160} stroke="#E5484D" strokeWidth={16} strokeLinecap="round" />
    <line x1={290} y1={-20} x2={-60} y2={160} stroke="#E5484D" strokeWidth={16} strokeLinecap="round" />
  </svg>
);

// ECG tăng kali theo giai đoạn
const hyperPath = (st: number, x0: number, y0: number, W: number, H: number, beats = 2) => {
  const g = (ph: number, a: number, m: number, s: number) => a * Math.exp(-Math.pow((ph - m) / s, 2) / 2);
  let d = '';
  for (let i = 0; i <= 600; i++) {
    const ph = ((i / 600) * beats) % 1;
    let v = 0;
    if (st === 4) v = 0.55 * Math.sin(ph * Math.PI * 2 * 1.5) * (1 - 0.2 * Math.cos(ph * 6.28));
    else {
      const pA = st >= 2 ? 0.04 : 0.15, pM = st >= 2 ? 0.07 : 0.12;
      const rw = st >= 3 ? 0.03 : 0.011, sw = st >= 3 ? 0.035 : 0.01;
      v = g(ph, pA, pM, 0.025) + g(ph, 1, 0.255, rw) + g(ph, st >= 3 ? -0.45 : -0.28, st >= 3 ? 0.31 : 0.275, sw) + g(ph, 0.85, st >= 3 ? 0.5 : 0.46, st >= 3 ? 0.045 : 0.03);
      if (st < 3) v += g(ph, -0.12, 0.235, 0.008);
    }
    d += `${i ? 'L' : 'M'}${(x0 + (i / 600) * W).toFixed(1)},${(y0 - v * H).toFixed(1)} `;
  }
  return d;
};
const Strip: React.FC<{x: number; y: number; st: number; s0: number; label: string; c: string}> = ({x, y, st, s0, label, c}) => {
  const t = useSec();
  const a = ap(t, s0);
  const dr = ap(t, s0, 1.6);
  return (
    <>
      <Paper x={x} y={y} w={860} h={250} a={a} />
      <svg width={860} height={250} style={{position: 'absolute', left: x, top: y}}>
        <path d={hyperPath(st, 30, 160, 800, 110)} stroke="#C0263A" strokeWidth={5} fill="none" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - dr} />
      </svg>
      <div style={{position: 'absolute', left: x + 16, top: y + 12, padding: '6px 18px', borderRadius: 12, background: c, color: K.ink, fontFamily: FONT, fontSize: 30, fontWeight: 900, opacity: a}}>{label}</div>
    </>
  );
};
const Syringe: React.FC<{x: number; y: number; a: number; label?: string}> = ({x, y, a, label = 'Ca²⁺'}) => {
  const f = useCurrentFrame();
  const push = 40 * (0.5 + 0.5 * Math.sin(f / 20));
  return (
    <svg width={620} height={220} viewBox="0 0 620 220" style={{position: 'absolute', left: x, top: y, opacity: a}}>
      <rect x={120} y={60} width={360} height={100} rx={16} fill="rgba(230,245,252,.9)" stroke="#BFE6F7" strokeWidth={5} />
      <rect x={130 + push} y={70} width={340 - push} height={80} rx={10} fill="rgba(63,178,127,.55)" />
      <rect x={20 + push} y={95} width={110} height={30} rx={6} fill="#9FB3BD" />
      <rect x={0 + push} y={70} width={24} height={80} rx={6} fill="#9FB3BD" />
      <rect x={480} y={95} width={70} height={30} fill="#DDE7EC" />
      <rect x={550} y={104} width={70} height={12} fill="#B8C7CE" />
      <text x={300} y={128} fontSize={40} fontWeight={900} fill="#0D1B24" textAnchor="middle" fontFamily={FONT}>{label}</text>
    </svg>
  );
};
const Tile: React.FC<{x: number; y: number; w: number; h: number; n: string; c: string; head: string; body?: string; a: number}> = ({x, y, w, h, n, c, head, body, a}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 30, border: `5px solid ${c}`, background: `${c}1c`, fontFamily: FONT, textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>
    <div style={{width: 96, height: 96, borderRadius: '50%', background: c, color: K.ink, fontSize: 58, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '26px auto 0'}}>{n}</div>
    <div style={{fontSize: 44, fontWeight: 900, color: K.txt, marginTop: 18, lineHeight: 1.15, padding: '0 14px'}}>{head}</div>
    {body ? <div style={{fontSize: 30, fontWeight: 700, color: K.dim, marginTop: 10, padding: '0 14px', lineHeight: 1.2}}>{chem(body)}</div> : null}
  </div>
);
const CA = '#3FB27F', MG = '#9B7CF0', PH = '#F5B83D';
const Ion2: React.FC<{x: number; y: number; t: string; c: string; a?: number; r?: number; dark?: boolean}> = ({x, y, t, c, a = 1, r = 26, dark = true}) => (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: c, color: dark ? K.ink : '#fff', fontFamily: FONT, fontSize: r * 0.72, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: a, boxShadow: '0 4px 10px rgba(0,0,0,.35)'}}>{chem(t)}</div>
);
// albumin và Ca
const ALB: [number, number][] = [[200, 230], [520, 150], [860, 300], [380, 470]];
const FREE: [number, number][] = [[700, 90], [110, 420], [640, 470], [960, 120], [1000, 470], [260, 70], [760, 260], [560, 330]];
const AlbScene: React.FC<{x: number; y: number; a: number; drop: number}> = ({x, y, a, drop}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 1100, height: 560, borderRadius: 50, background: 'rgba(229,72,77,.06)', border: '3px solid rgba(229,72,77,.3)', opacity: a}}>
      {ALB.map(([ax, ay], i) => {
        const ao = i >= 2 ? 1 - drop : 1;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: ax - 110, top: ay - 80, width: 220, height: 160, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%,#F6C46B,#B9771A)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 28, fontWeight: 900, color: '#fff', opacity: ao}}>albumin</div>
            {[0, 1, 2, 3].map((k) => {
              const ang = k * Math.PI / 2 + 0.4;
              return <Ion2 key={k} x={ax + 120 * Math.cos(ang)} y={ay + 88 * Math.sin(ang)} t="Ca" c="#E8EDF2" r={22} a={ao} />;
            })}
          </React.Fragment>
        );
      })}
      {FREE.map(([fx, fy], i) => <Ion2 key={i} x={fx + Math.sin(f / 14 + i) * 8} y={fy + Math.cos(f / 12 + i) * 8} t="Ca²⁺" c={CA} r={26} />)}
    </div>
  );
};
const Bone: React.FC<{x: number; y: number; s: number; a: number; release?: number}> = ({x, y, s, a, release = 0}) => {
  const f = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 1600, height: 700, transform: `scale(${s})`, transformOrigin: '0 0', opacity: a}}>
      <svg width={1600} height={700} viewBox="-800 -350 1600 700">
        <defs>
          <linearGradient id="cb7" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF6E2" /><stop offset="1" stopColor="#D9C7A0" /></linearGradient>
          <pattern id="sp7" width={40} height={40} patternUnits="userSpaceOnUse"><rect width={40} height={40} fill="#E9B98A" /><circle cx={20} cy={20} r={11} fill="#B5543F" /><circle cx={0} cy={0} r={8} fill="#B5543F" /><circle cx={40} cy={40} r={8} fill="#B5543F" /></pattern>
        </defs>
        <path d="M-700,-120 C-760,-260 -560,-300 -520,-170 L520,-170 C560,-300 760,-260 700,-120 C780,-60 780,60 700,120 C760,260 560,300 520,170 L-520,170 C-560,300 -760,260 -700,120 C-780,60 -780,-60 -700,-120 Z" fill="url(#cb7)" stroke="#BFA77A" strokeWidth={5} />
        <rect x={-400} y={-110} width={800} height={220} rx={40} fill="url(#sp7)" opacity={0.9} />
        <rect x={-300} y={-55} width={600} height={110} rx={40} fill="#9E2F3B" />
      </svg>
      {release > 0 ? Array.from({length: 7}, (_, i) => {
        const ph = ((f / 50 + i / 7) % 1);
        return <Ion2 key={i} x={500 + i * 100} y={170 - ph * 160} t="Ca²⁺" c={CA} r={30} a={release * (1 - ph)} />;
      }) : null}
    </div>
  );
};
const Thyroid: React.FC<{x: number; y: number; s: number; a: number; glow?: number}> = ({x, y, s, a, glow = 0}) => (
  <svg width={700} height={900} viewBox="600 140 720 900" style={{position: 'absolute', left: x, top: y, width: 700 * s, height: 900 * s, opacity: a}}>
    <defs>
      <linearGradient id="tr7" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#C9D6DC" /><stop offset=".5" stopColor="#F2F7F9" /><stop offset="1" stopColor="#C9D6DC" /></linearGradient>
      <radialGradient id="th7" cx="40%" cy="35%" r="70%"><stop offset="0" stopColor="#F28A9A" /><stop offset="1" stopColor="#A8354C" /></radialGradient>
      <radialGradient id="pt7" cx="35%" cy="30%" r="70%"><stop offset="0" stopColor="#FFE08A" /><stop offset="1" stopColor="#D98A1A" /></radialGradient>
      <filter id="g7"><feGaussianBlur stdDeviation={14} /></filter>
    </defs>
    <rect x={880} y={150} width={160} height={880} rx={70} fill="url(#tr7)" />
    {Array.from({length: 16}, (_, i) => <rect key={i} x={880} y={175 + i * 54} width={160} height={26} rx={12} fill="#AFC0C8" opacity={0.55} />)}
    <path d="M960,560 C900,600 820,640 760,600 C640,520 600,360 680,300 C760,250 860,330 900,450 C920,510 940,540 960,560 Z" fill="url(#th7)" />
    <path d="M960,560 C1020,600 1100,640 1160,600 C1280,520 1320,360 1240,300 C1160,250 1060,330 1020,450 C1000,510 980,540 960,560 Z" fill="url(#th7)" />
    <path d="M880,520 Q960,600 1040,520 L1040,580 Q960,650 880,580 Z" fill="url(#th7)" />
    {[[730, 370], [1190, 370], [760, 540], [1160, 540]].map(([cx, cy], i) => (
      <g key={i}><circle cx={cx} cy={cy} r={60} fill="#F5B83D" opacity={0.3 + 0.4 * glow} filter="url(#g7)" /><ellipse cx={cx} cy={cy} rx={40} ry={32} fill="url(#pt7)" /></g>
    ))}
  </svg>
);
const tdpPath = (x0: number, y0: number, W: number, H: number) => {
  let d = '';
  for (let i = 0; i <= 900; i++) {
    const tt = i / 900;
    const env = Math.sin(Math.PI * tt * 2.2);
    const amp = 0.25 + 0.75 * Math.abs(env);
    const v = amp * Math.sin(2 * Math.PI * tt * 18) * (env >= 0 ? 1 : -1) + 0.15 * amp * Math.sin(2 * Math.PI * tt * 36 + 1);
    d += `${i ? 'L' : 'M'}${(x0 + tt * W).toFixed(1)},${(y0 - v * H).toFixed(1)} `;
  }
  return d;
};
const TdP: React.FC<{x: number; y: number; w: number; h: number; s0: number}> = ({x, y, w, h, s0}) => {
  const t = useSec();
  const dr = ap(t, s0, 2);
  return (
    <>
      <Paper x={x} y={y} w={w} h={h} a={ap(t, s0)} />
      <svg width={w} height={h} style={{position: 'absolute', left: x, top: y}}>
        <path d={tdpPath(20, h / 2, w - 40, h * 0.36)} stroke="#C0263A" strokeWidth={4} fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - dr} />
      </svg>
    </>
  );
};
const Vial: React.FC<{x: number; y: number; a: number; label: string; c: string}> = ({x, y, a, label, c}) => (
  <svg width={200} height={360} viewBox="0 -10 180 360" style={{position: 'absolute', left: x, top: y, opacity: a}}>
    <rect x={0} y={40} width={180} height={300} rx={30} fill="rgba(230,245,252,.92)" stroke="#BFE6F7" strokeWidth={5} />
    <rect x={40} y={0} width={100} height={50} rx={10} fill="#9FB3BD" />
    <rect x={0} y={180} width={180} height={160} rx={30} fill={c} opacity={0.35} />
    <rect x={14} y={100} width={152} height={80} rx={10} fill="#fff" stroke={c} strokeWidth={4} />
    <text x={90} y={152} fontSize={label.length > 6 ? 28 : 34} fontWeight={900} fill="#1D2B33" textAnchor="middle" fontFamily={FONT}>{label}</text>
  </svg>
);

const Breath: React.FC<{x: number; y: number; w: number; h: number; a: number}> = ({x, y, w, h, a}) => {
  const f = useCurrentFrame();
  let d = '';
  for (let i = 0; i <= 300; i++) {
    const tt = i / 300;
    d += `${i ? 'L' : 'M'}${(tt * w).toFixed(1)},${(h / 2 - Math.sin(tt * Math.PI * 2 * 4 - f / 6) * h * 0.42).toFixed(1)} `;
  }
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: a}}>
      <svg width={w} height={h}><path d={d} stroke={WATER} strokeWidth={8} fill="none" strokeLinecap="round" /></svg>
    </div>
  );
};
const Row3: React.FC<{y: number; c: string; k: string; body: string; a: number}> = ({y, c, k, body, a}) => (
  <div style={{position: 'absolute', left: 160, top: y, width: 1600, height: 140, display: 'flex', alignItems: 'center', gap: 30, fontFamily: FONT, opacity: a, transform: `translateX(${(1 - a) * -40}px)`}}>
    <div style={{width: 340, height: 140, borderRadius: 26, background: c, color: K.ink, fontSize: 52, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>{chem(k)}</div>
    <div style={{flex: 1, height: 140, borderRadius: 26, border: `4px solid ${c}`, background: `${c}1c`, display: 'flex', alignItems: 'center', padding: '0 34px', fontSize: 44, fontWeight: 900, color: K.txt}}>{chem(body)}</div>
  </div>
);
// biểu đồ nhỏ theo giờ
const Mini: React.FC<{x: number; y: number; w: number; h: number; c: string; label: string; pts: [number, number][]; lo: number; hi: number; s0: number; unit?: string}> = ({x, y, w, h, c, label, pts, lo, hi, s0, unit = ''}) => {
  const t = useSec();
  const dr = ap(t, s0, 2.5);
  const px = (hh: number) => 40 + (hh / 16) * (w - 80);
  const py = (v: number) => h - 60 - ((v - lo) / (hi - lo)) * (h - 140);
  const d = pts.map(([hh, v], i) => `${i ? 'L' : 'M'}${px(hh)},${py(v)}`).join(' ');
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 28, border: `3px solid ${c}`, background: `${c}12`, opacity: ap(t, s0)}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 14, textAlign: 'center', fontFamily: FONT, fontSize: 38, fontWeight: 900, color: c}}>{chem(label)}</div>
      <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
        <line x1={40} y1={h - 60} x2={w - 40} y2={h - 60} stroke={K.dim} strokeWidth={2} />
        {[0, 8, 16].map((hh) => <text key={hh} x={px(hh)} y={h - 22} fill={K.dim} fontSize={24} fontFamily={FONT} textAnchor="middle">{hh}h</text>)}
        <path d={d} stroke={c} strokeWidth={6} fill="none" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - dr} />
        {pts.map(([hh, v], i) => (i === 0 || i === pts.length - 1) ? (
          <g key={i} opacity={i === 0 ? 1 : ap(t, s0 + 2.2)}>
            <circle cx={px(hh)} cy={py(v)} r={10} fill={c} />
            <text x={px(hh)} y={py(v) - 20} fill={K.txt} fontSize={32} fontWeight={900} fontFamily={FONT} textAnchor="middle">{String(v).replace('.', ',')}{unit}</text>
          </g>
        ) : null)}
      </svg>
    </div>
  );
};

const RED = '#E5484D';
// mạch máu với hồng cầu chở O₂
const Flow: React.FC<{x: number; y: number; w: number; a: number; speed?: number; o2?: number; thick?: number}> = ({x, y, w, a, speed = 1, o2 = 1, thick = 110}) => {
  const f = useCurrentFrame();
  const n = Math.round(w / 130);
  return (
    <div style={{position: 'absolute', left: x, top: y - thick / 2, width: w, height: thick, opacity: a}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: thick / 2, background: 'linear-gradient(180deg,#7A1E2B,#B8343F 50%,#7A1E2B)'}} />
      {Array.from({length: n + 1}, (_, i) => {
        const px = ((i * 130 + f * 4 * speed) % (w + 130)) - 65;
        return (
          <div key={i} style={{position: 'absolute', left: px - 40, top: thick / 2 - 26, width: 80, height: 52}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: '#D23B4A', boxShadow: 'inset 0 0 0 12px #E8606C'}} />
            {i % Math.max(1, Math.round(1 / Math.max(o2, 0.01))) === 0 && o2 > 0.05 ? <div style={{position: 'absolute', left: 50, top: -28, width: 38, height: 38, borderRadius: '50%', background: WATER, color: '#fff', fontFamily: FONT, fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>O₂</div> : null}
          </div>
        );
      })}
    </div>
  );
};
// ngón tay CRT: press 0..1 (1 = đang ấn), pink 0..1
const Finger: React.FC<{x: number; y: number; a: number; press: number; pink: number}> = ({x, y, a, press, pink}) => {
  const c = `rgb(${Math.round(240 - 8 * pink)},${Math.round(236 - 90 * pink)},${Math.round(234 - 84 * pink)})`;
  return (
    <svg width={1100} height={600} viewBox="0 150 1100 600" style={{position: 'absolute', left: x, top: y, opacity: a}}>
      <defs><linearGradient id="skF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F0C3A2" /><stop offset="1" stopColor="#C98E6A" /></linearGradient></defs>
      <path d="M0,470 L860,440 C980,436 1060,500 1060,580 C1060,660 990,720 870,722 L0,730 Z" fill="url(#skF)" />
      <path d="M640,452 L900,446 C980,446 1020,480 1030,520 L640,532 Z" fill={c} stroke="#D9C7B6" strokeWidth={4} />
      <g opacity={press} transform={`translate(0,${(1 - press) * -60})`}>
        <path d="M830,230 L830,410" stroke={K.amber} strokeWidth={12} strokeLinecap="round" />
        <path d="M800,380 L830,410 L860,380" stroke={K.amber} strokeWidth={12} fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
};
const Timer: React.FC<{x: number; y: number; a: number; v: number; max?: number}> = ({x, y, a, v, max = 6}) => {
  const fr = Math.min(1, v / max);
  const ang = fr * Math.PI * 2 - Math.PI / 2;
  const big = fr > 0.5 ? 1 : 0;
  const ex = 190 * Math.cos(ang), ey = 190 * Math.sin(ang);
  const col = v > 3 ? RED : K.green;
  return (
    <svg width={460} height={460} viewBox="-230 -230 460 460" style={{position: 'absolute', left: x, top: y, opacity: a}}>
      <circle r={190} fill="none" stroke="#1F3A47" strokeWidth={30} />
      {fr > 0.001 ? <path d={`M0,-190 A190,190 0 ${big},1 ${ex.toFixed(1)},${ey.toFixed(1)}`} fill="none" stroke={col} strokeWidth={30} strokeLinecap="round" /> : null}
      <text y={30} fontSize={110} fontWeight={900} fill="#fff" textAnchor="middle" fontFamily={FONT}>{v.toFixed(1).replace('.', ',')}s</text>
    </svg>
  );
};
const MOT: [number, number, number, number][] = Array.from({length: 46}, (_, i) => [((i * 137) % 380) + 30, ((i * 89) % 420) + 40, 14 + ((i * 7) % 30), (i * 53) % 180]);
const Leg: React.FC<{x: number; y: number; s: number; a: number; m: number}> = ({x, y, s, a, m}) => (
  <svg width={440 * s} height={500 * s} viewBox="0 0 440 500" style={{position: 'absolute', left: x, top: y, opacity: a}}>
    <defs>
      <linearGradient id="lgS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#C98E6A" /><stop offset=".5" stopColor="#EFC2A0" /><stop offset="1" stopColor="#C98E6A" /></linearGradient>
      <clipPath id="lcS"><path d="M10,0 L430,0 C420,150 400,220 390,280 C380,350 370,420 360,500 L80,500 C70,420 60,350 50,280 C40,220 20,150 10,0 Z" /></clipPath>
    </defs>
    <path d="M10,0 L430,0 C420,150 400,220 390,280 C380,350 370,420 360,500 L80,500 C70,420 60,350 50,280 C40,220 20,150 10,0 Z" fill="url(#lgS)" />
    <g clipPath="url(#lcS)" opacity={m}>
      {MOT.map(([cx, cy, r, rot], i) => <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * 0.7} transform={`rotate(${rot} ${cx} ${cy})`} fill="#7E4A86" opacity={0.3 + ((i * 13) % 30) / 100} />)}
    </g>
  </svg>
);
const Win: React.FC<{x: number; c: string; head: string; body: string; a: number; children: React.ReactNode}> = ({x, c, head, body, a, children}) => (
  <div style={{position: 'absolute', left: x, top: 190, width: 520, height: 560, borderRadius: 36, border: `5px solid ${c}`, background: `${c}14`, textAlign: 'center', fontFamily: FONT, opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>
    <div style={{height: 320, position: 'relative'}}>{children}</div>
    <div style={{fontSize: 54, fontWeight: 900, color: K.txt}}>{head}</div>
    <div style={{fontSize: 32, fontWeight: 800, color: c, padding: '6px 20px', lineHeight: 1.25}}>{chem(body)}</div>
  </div>
);

// hệ bơm – ống – nước. kind: 0 bình thường, 1 thiếu nước, 2 bơm hỏng, 3 bị chặn, 4 ống giãn, 5 hỗn hợp
export const Loop: React.FC<{x: number; y: number; s?: number; a: number; kind: number; lab?: number}> = ({x, y, s = 1, a, kind, lab = 0}) => {
  const f = useCurrentFrame();
  const ph = (f % 18) / 18;
  const weak = kind === 2;
  const beat = 1 + (weak ? 0.015 : 0.05) * Math.exp(-Math.pow((ph - 0.1) / 0.08, 2));
  const wide = kind === 4 || kind === 5;
  const sw = wide ? 72 : 34;
  const water = kind === 1 || kind === 5 ? 60 : 196;
  const speed = kind === 3 ? 0 : weak ? 0.8 : kind === 1 ? 1.2 : wide ? 1.4 : 3;
  const off = -f * speed;
  const loop = 'M520,200 L800,200 L800,380 L95,380 L95,320';
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 940 * s, height: 470 * s, opacity: a}}>
      <svg width={940 * s} height={470 * s} viewBox="0 0 940 470" style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <linearGradient id={`lw${kind}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4FC3F7" /><stop offset="1" stopColor="#1E6FA8" /></linearGradient>
        </defs>
        <rect x={20} y={90} width={150} height={240} rx={18} fill="#10242E" stroke="#A7BAC4" strokeWidth={5} />
        <rect x={25} y={325 - water} width={140} height={water} rx={10} fill={`url(#lw${kind})`} />
        <path d="M170,280 L340,280" stroke="#B8343F" strokeWidth={34} fill="none" />
        <path d={loop} stroke="#B8343F" strokeWidth={sw} fill="none" strokeLinejoin="round" />
        <path d={loop} stroke="#FFB4BC" strokeWidth={8} fill="none" strokeDasharray="14 46" strokeDashoffset={off} opacity={0.75} strokeLinecap="round" />
        <path d="M170,280 L340,280" stroke="#FFB4BC" strokeWidth={8} fill="none" strokeDasharray="14 46" strokeDashoffset={off} opacity={0.75} strokeLinecap="round" />
        {kind === 3 ? (
          <g>
            <rect x={640} y={160} width={50} height={84} rx={8} fill={K.amber} stroke="#7A5608" strokeWidth={5} />
            <text x={665} y={140} fill={K.amber} fontSize={32} fontWeight={900} textAnchor="middle" fontFamily={FONT}>bị chặn</text>
          </g>
        ) : null}
        {wide ? [0, 1, 2, 3, 4].map((i) => {
          const dy = ((f * 2 + i * 23) % 70);
          const [cx, cy] = [[600, 240], [700, 240], [850, 300], [400, 420], [600, 420]][i];
          return <path key={i} d={`M${cx},${cy + dy} q-12,22 0,30 q12,-8 0,-30z`} fill="#4FC3F7" opacity={1 - dy / 70} />;
        }) : null}
        {lab > 0 ? (
          <g fontFamily={FONT} fontWeight={900} fontSize={38} textAnchor="middle" opacity={lab}>
            <text x={95} y={70} fill={WATER}>NƯỚC</text>
            <text x={560} y={80} fill={RED}>BƠM</text>
            <text x={880} y={300} fill={K.amber}>ỐNG</text>
          </g>
        ) : null}
      </svg>
      <img src={staticFile('dg_tim.png')} style={{position: 'absolute', left: 315 * s, top: 95 * s, width: 210 * s, transform: `scale(${beat})`, filter: weak ? 'grayscale(.85) brightness(.6)' : kind === 5 ? 'saturate(.6) brightness(.85)' : 'none'}} />
    </div>
  );
};
const NeckPath = 'M140,140 C140,40 260,0 340,30 C410,55 440,120 430,170 L460,215 L430,230 C440,260 430,290 410,300 C420,320 400,340 370,335 L360,380 L380,560 L120,560 L150,380 C110,330 110,220 140,140 Z';
const Neck: React.FC<{x: number; y: number; s?: number; a: number; full: boolean}> = ({x, y, s = 1, a, full}) => {
  const f = useCurrentFrame();
  const pul = 1 + 0.12 * Math.sin(f / 4);
  return (
    <svg width={500 * s} height={580 * s} viewBox="80 0 420 580" style={{position: 'absolute', left: x, top: y, opacity: a}}>
      <defs><linearGradient id={`nk${full ? 1 : 0}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#C98E6A" /><stop offset=".5" stopColor="#EFC2A0" /><stop offset="1" stopColor="#C98E6A" /></linearGradient></defs>
      <path d={NeckPath} fill={`url(#nk${full ? 1 : 0})`} />
      <ellipse cx={370} cy={150} rx={10} ry={6} fill="#3B2A22" />
      <path d="M220,180 C210,200 215,220 235,225" stroke="#B5785A" strokeWidth={6} fill="none" />
      <path d="M250,300 L330,540" stroke="#B5785A" strokeWidth={8} opacity={0.5} fill="none" />
      {full ? (
        <>
          <path d="M220,300 C230,390 250,470 270,550" stroke="#3E5F96" strokeWidth={26 * pul} fill="none" strokeLinecap="round" />
          <path d="M228,330 C236,390 250,450 262,500" stroke="#6F8FC4" strokeWidth={7} fill="none" />
        </>
      ) : <path d="M220,320 C230,400 250,470 270,550" stroke="#5B79A8" strokeWidth={5} fill="none" opacity={0.45} />}
    </svg>
  );
};
const FAN = 'M260,0 L520,420 A520,520 0 0,1 0,420 Z';
// kind: heart, heartEff, hyper, ivc, ivcFull, lung, aorta
const Echo: React.FC<{x: number; y: number; s?: number; a: number; kind: string; id: string}> = ({x, y, s = 1, a, kind, id}) => {
  const f = useCurrentFrame();
  const ph = (f % 20) / 20;
  const sys = Math.exp(-Math.pow((ph - 0.25) / 0.14, 2));
  const k = kind === 'hyper' ? 1 - 0.55 * sys : 1 - 0.2 * sys;
  const ch = (d: string, cx: number, cy: number) => <path d={d} fill="#070707" transform={`translate(${cx},${cy}) scale(${k}) translate(${-cx},${-cy})`} />;
  const resp = 0.5 + 0.5 * Math.sin(f / 22);
  return (
    <svg width={520 * s} height={540 * s} viewBox="0 0 520 540" style={{position: 'absolute', left: x, top: y, opacity: a}}>
      <defs>
        <clipPath id={`fc${id}`}><path d={FAN} /></clipPath>
        <radialGradient id={`fg${id}`} cx="0.5" cy="0" r="1"><stop offset="0" stopColor="#2a2a2a" /><stop offset="1" stopColor="#111" /></radialGradient>
      </defs>
      <path d={FAN} fill={`url(#fg${id})`} stroke="#3a4a52" strokeWidth={3} />
      <g clipPath={`url(#fc${id})`}>
        {kind.startsWith('heart') || kind === 'hyper' ? (
          <>
            {kind === 'heartEff' ? <><ellipse cx={260} cy={300} rx={250} ry={250} fill="none" stroke="#efefef" strokeWidth={16} /><ellipse cx={260} cy={300} rx={225} ry={225} fill="#020202" /></> : <ellipse cx={260} cy={300} rx={215} ry={220} fill="none" stroke="#e0e0e0" strokeWidth={16} />}
            <ellipse cx={260} cy={300} rx={190} ry={200} fill="#8c8c8c" />
            {ch('M150,130 C110,170 110,270 160,290 C200,300 235,280 240,220 C245,150 200,110 150,130Z', 180, 210)}
            {ch('M370,130 C410,170 410,270 360,290 C320,300 285,280 280,220 C275,150 320,110 370,130Z', 340, 210)}
            <path d="M120,330 C110,400 150,470 200,465 C240,460 245,380 235,330 Z" fill="#070707" />
            <path d="M400,330 C410,400 370,470 320,465 C280,460 275,380 285,330 Z" fill="#070707" />
          </>
        ) : null}
        {kind === 'ivc' || kind === 'ivcFull' ? (() => {
          const h = kind === 'ivc' ? 4 + 10 * resp : 70;
          return (
            <>
              <path d={`M0,${250 - h / 2} L520,${238 - h / 2}`} stroke="#d0d0d0" strokeWidth={10} />
              <path d={`M0,250 L520,238`} stroke="#050505" strokeWidth={h} />
              <path d={`M0,${250 + h / 2} L520,${238 + h / 2}`} stroke="#d0d0d0" strokeWidth={10} />
            </>
          );
        })() : null}
        {kind === 'lung' ? (
          <>
            <path d="M0,130 L520,130" stroke="#f0f0f0" strokeWidth={12} strokeDasharray="30 8" strokeDashoffset={f * 2} />
            <path d="M0,240 L520,240 M0,350 L520,350 M0,460 L520,460" stroke="#cfcfcf" strokeWidth={8} opacity={0.7} />
            <rect x={140} y={70} width={40} height={80} fill="#050505" /><rect x={340} y={70} width={40} height={80} fill="#050505" />
          </>
        ) : null}
        {kind === 'aorta' ? (
          <>
            <circle cx={260} cy={300} r={90} fill="#050505" stroke="#d8d8d8" strokeWidth={12} />
            <circle cx={260} cy={300} r={45} fill="none" stroke="#777" strokeWidth={5} opacity={0.5} />
          </>
        ) : null}
      </g>
    </svg>
  );
};
const Arw: React.FC<{up: boolean; c: string}> = ({up, c}) => <span style={{color: c, fontSize: 84, fontWeight: 900}}>{up ? '↑' : '↓'}</span>;

// ---------- 1 Mở đầu ----------
const D1: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={0} title="Sốc kiểu gì?" />
      <Loop x={160} y={200} s={1.15} a={ap(t, S[0])} kind={0} lab={ap(t, S[1])} />
      <GoldC y={800} a={ap(t, S[2])} size={50}>Hỏng chỗ nào → kiểu sốc đó</GoldC>
    </>
  );
};

// ---------- 2 Bốn kiểu ----------
const TYPES: [string, string, string][] = [['GIẢM THỂ TÍCH', 'thiếu nước', WATER], ['SỐC TIM', 'bơm hỏng', RED], ['TẮC NGHẼN', 'bị chặn', K.amber], ['PHÂN BỐ', 'ống giãn', KC]];
const D2: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const segs: [number, string, string][] = [[66, KC, 'Phân bố 66%'], [16, RED, 'Tim 16%'], [16, WATER, 'Giảm TT 16%'], [2, K.amber, 'Tắc nghẽn 2%']];
  let acc = 0;
  return (
    <>
      <Top idx={1} title="4 kiểu sốc" />
      <Tx x={0} y={160} w={1920} al="center" size={40} c={K.dim} b={800} a={ap(t, S[0])}>Weil &amp; Shubin, 1971</Tx>
      {TYPES.map(([h, b, c], i) => <Tile key={h} x={110 + i * 435} y={240} w={400} h={200} n={String(i + 1)} c={c} head={h} body={b} a={ap(t, S[1] + i * 0.5)} />)}
      <Tx x={0} y={520} w={1920} al="center" size={36} c={K.dim} b={800} a={ap(t, S[2])}>Nghiên cứu SOAP II (1679 bệnh nhân sốc)</Tx>
      <div style={{position: 'absolute', left: 160, top: 590, width: 1600, height: 110, display: 'flex', borderRadius: 24, overflow: 'hidden', opacity: ap(t, S[2])}}>
        {segs.map(([v, c], i) => <div key={i} style={{width: `${v * ap(t, S[2] + 0.3, 1.2)}%`, background: c}} />)}
      </div>
      {segs.map(([v, c, l], i) => {
        const x = 160 + (acc / 100) * 1600;
        acc += v;
        return <div key={l} style={{position: 'absolute', left: i === 3 ? 1560 : x + 20, top: i === 3 ? 790 : 720, fontFamily: FONT, fontSize: 38, fontWeight: 900, color: c, opacity: ap(t, S[2] + 1.2 + i * 0.3)}}>{l}</div>;
      })}
      <Tx x={160} y={790} w={1000} size={34} c={KC} b={800} a={ap(t, S[2] + 2.2)}>(trong đó nhiễm khuẩn 62%)</Tx>
    </>
  );
};

// ---------- 3–6 từng kiểu ----------
const TypeScene: React.FC<{S: number[]; idx: number; title: string; kind: number; causes: string[]; neck?: boolean; extra: string; ec: string}> = ({S, idx, title, kind, causes, neck, extra, ec}) => {
  const t = useSec();
  return (
    <>
      <Top idx={idx} title={title} />
      <Loop x={40} y={200} s={0.95} a={ap(t, S[0])} kind={kind} />
      <Panel x={1000} y={190} w={860} h={250} c={K.dim} s0={S[1]}>
        <Bullets x={40} y={36} w={790} items={causes} s0={causes.map((_, i) => S[1] + 0.3 + i * 0.6)} c={ec} size={40} />
      </Panel>
      {neck !== undefined ? <Neck x={1020} y={560} s={0.55} a={ap(t, S[2])} full={neck} /> : null}
      <Tx x={neck !== undefined ? 1320 : 1000} y={680} w={neck !== undefined ? 560 : 860} al="center" size={44} c={ec} b={900} a={ap(t, S[2] + 0.4)}>{extra}</Tx>
    </>
  );
};
const D3: React.FC<{S: number[]; D: number[]}> = ({S}) => <TypeScene S={S} idx={2} title="① Giảm thể tích: thiếu nước" kind={1} causes={['Mất máu', 'Nôn, tiêu chảy', 'Bỏng rộng']} neck={false} extra="Da lạnh · TM cổ XẸP" ec={WATER} />;
const D4: React.FC<{S: number[]; D: number[]}> = ({S}) => <TypeScene S={S} idx={3} title="② Sốc tim: bơm hỏng" kind={2} causes={['Nhồi máu cơ tim', 'Suy tim cấp', 'Rối loạn nhịp']} neck={true} extra="TM cổ NỔI · ran phổi · da lạnh" ec={RED} />;
const D5: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <TypeScene S={S} idx={4} title="③ Tắc nghẽn: bị chặn" kind={3} causes={['Thuyên tắc phổi', 'Chèn ép tim', 'Tràn khí màng phổi áp lực']} extra="" ec={K.amber} />
      <GoldC y={720} a={ap(t, S[2])} size={50}>Dịch, vận mạch chỉ câu giờ → phải GỠ chỗ tắc</GoldC>
    </>
  );
};
const D6: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <TypeScene S={S} idx={5} title="④ Phân bố: ống giãn" kind={4} causes={['Nhiễm khuẩn', 'Phản vệ', 'Tổn thương tủy sống']} extra="" ec={KC} />
      <Card x={1000} y={600} w={860} h={180} c={K.amber} s0={S[2]} head="GIAI ĐOẠN ĐẦU" body="da có thể còn ẤM, dễ đánh lừa" size={40} />
    </>
  );
};

// ---------- 7 Phân biệt ----------
const D7: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const cols = ['', 'Da', 'TM cổ (đổ đầy)', 'Cung lượng tim', 'Sức cản mạch'];
  const W = [420, 260, 380, 360, 360];
  const rows: [string, string, string, boolean, boolean, string][] = [
    ['Giảm thể tích', 'lạnh', 'xẹp', false, true, WATER],
    ['Sốc tim', 'lạnh', 'nổi', false, true, RED],
    ['Tắc nghẽn', 'lạnh', 'nổi', false, true, K.amber],
    ['Phân bố', 'ẤM*', 'xẹp', true, false, KC],
  ];
  const ca = [1, ap(t, S[0]), ap(t, S[0] + 0.6), ap(t, S[1]), ap(t, S[1] + 0.6)];
  const hl = ap(t, S[2]);
  const cell = (j: number, w: number, ch: React.ReactNode, c = K.txt) => <div key={j} style={{width: w, textAlign: j ? 'center' : 'left', fontSize: 44, fontWeight: 900, color: c, opacity: ca[j], paddingLeft: j ? 0 : 30}}>{ch}</div>;
  return (
    <>
      <Top idx={6} title="Phân biệt 4 kiểu sốc" />
      <div style={{position: 'absolute', left: 80, top: 190, fontFamily: FONT}}>
        <div style={{display: 'flex', height: 90, alignItems: 'center', borderBottom: `3px solid ${K.dim}`}}>{cols.map((c, j) => <div key={j} style={{width: W[j], textAlign: 'center', fontSize: 34, fontWeight: 800, color: K.dim, opacity: ca[j]}}>{c}</div>)}</div>
        {rows.map(([n, da, tm, co, svr, c], i) => (
          <div key={n} style={{display: 'flex', height: 120, alignItems: 'center', borderBottom: '2px solid rgba(255,255,255,.12)', background: i === 3 ? `rgba(155,124,240,${0.22 * hl})` : 'none', borderRadius: 16, outline: i === 3 && hl > 0.05 ? `4px solid ${KC}` : 'none'}}>
            {cell(0, W[0], n, c)}
            {cell(1, W[1], da, da.startsWith('ẤM') ? K.amber : WATER)}
            {cell(2, W[2], tm, tm === 'nổi' ? RED : WATER)}
            {cell(3, W[3], <Arw up={co} c={co ? K.green : RED} />)}
            {cell(4, W[4], <Arw up={svr} c={svr ? K.amber : KC} />)}
          </div>
        ))}
      </div>
      <Tx x={80} y={900} w={1000} size={30} c={K.dim} b={700} a={ap(t, S[2])}>* giai đoạn đầu, sau khi đã bù dịch</Tx>
    </>
  );
};

// ---------- 8 Siêu âm ----------
const RUSH: {head: string; c: string; act: string[]; kind: string; lines: [string, string, string][]; ann: [number, number, string, string][]}[] = [
  {head: 'BƠM', c: RED, act: ['1'], kind: 'heartEff', lines: [['1', 'Tim co bóp ra sao?', 'mạnh · yếu'], ['1', 'Dịch màng ngoài tim?', 'viền đen quanh tim → chèn ép'], ['1', 'Thất phải giãn?', 'gợi ý thuyên tắc phổi']], ann: [[0.24, 0.27, 'Thất phải', K.txt], [0.66, 0.27, 'Thất trái', K.txt], [0.25, 0.68, 'Nhĩ phải', K.dim], [0.62, 0.68, 'Nhĩ trái', K.dim], [0.86, 0.47, '← DỊCH', K.amber]]},
  {head: 'BÌNH', c: WATER, act: ['2', '3', '4'], kind: 'ivc', lines: [['2', 'TM chủ dưới', 'nhỏ, xẹp khi hít vào → thiếu nước'], ['3', 'Phổi', 'đường B → phù phổi · không trượt → tràn khí'], ['4', 'Bụng (FAST)', 'dịch ổ bụng → chảy máu']], ann: [[0.2, 0.33, 'Gan', K.dim], [0.18, 0.55, 'TM chủ dưới', K.txt], [0.74, 0.3, 'Nhĩ phải →', K.dim]]},
  {head: 'ỐNG', c: K.amber, act: ['5', '6'], kind: 'vessel', lines: [['5', 'Động mạch chủ', '> 3 cm → phình, nguy cơ vỡ'], ['6', 'TM đùi, TM khoeo', 'ấn không xẹp → huyết khối']], ann: [[0.2, 0.68, 'Động mạch', K.txt], [0.5, 0.68, 'Tĩnh mạch: ấn không xẹp', K.amber]]},
];
const D8: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const k = t < S[2] ? 0 : t < S[3] ? 1 : 2;
  const st = k === 0 ? S[0] : S[k + 1];
  const R = RUSH[k];
  const ea = ap(t, st, 0.5);
  const EX = 600, EY = 170, ES = 1.2;
  return (
    <>
      <Top idx={7} title="Siêu âm tại giường (RUSH)" />
      <div style={{position: 'absolute', left: 820, top: 105, display: 'flex', gap: 18, fontFamily: FONT}}>
        {RUSH.map((r, i) => <div key={r.head} style={{padding: '8px 34px', borderRadius: 999, fontSize: 36, fontWeight: 900, background: i === k ? r.c : 'transparent', color: i === k ? '#0b1a22' : '#7f97a1', border: i === k ? `3px solid ${r.c}` : '3px solid #4a6470'}}>{r.head}</div>)}
      </div>
      <Body x={70} y={150} s={0.86} a={ap(t, S[0])} act={t < S[1] ? [] : R.act} c={R.c} />
      <Echo2 x={EX} y={EY} s={ES} a={ap(t, S[0]) * (k === 0 ? 1 : ea)} kind={R.kind} id={`r${k}`} />
      {R.ann.map(([ax, ay, l, c], i) => <Ann key={`${k}${i}`} x={EX + ax * 600 * ES} y={EY + ay * 560 * ES} c={c} a={ap(t, Math.max(st, S[1]) + 0.3 + i * 0.25)}>{l}</Ann>)}
      <div style={{position: 'absolute', left: 1350, top: 210, width: 540, fontFamily: FONT}}>
        {R.lines.map(([n, h, d], i) => {
          const a = ap(t, Math.max(st, S[1]) + 0.4 + i * 0.7);
          return (
            <div key={`${k}${i}`} style={{display: 'flex', gap: 16, marginBottom: 30, opacity: a, transform: `translateX(${(1 - a) * 30}px)`}}>
              <div style={{minWidth: 50, height: 50, borderRadius: '50%', background: R.c, color: '#0b1a22', fontSize: 28, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{n}</div>
              <div><div style={{fontSize: 38, fontWeight: 900, color: K.txt}}>{h}</div><div style={{fontSize: 30, fontWeight: 700, color: K.dim, marginTop: 4}}>{chem(d)}</div></div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ---------- 9 Hỗn hợp ----------
const D9: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={8} title="Sốc hỗn hợp" />
      <Loop x={40} y={200} s={0.95} a={ap(t, S[0])} kind={5} />
      <Check x={1000} y={210} w={860} items={['Ống giãn', 'Thiếu nước', 'Bơm yếu (bệnh cơ tim)']} s0={[S[1], S[1] + 0.8, S[1] + 1.6]} />
      <GoldC y={740} a={ap(t, S[1] + 0.3)} size={46}>Sốc nhiễm khuẩn thường là HỖN HỢP</GoldC>
    </>
  );
};

// ---------- 10 Giải ca ----------
const D10: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const e = (i: number, kind: string, l: string, c: string, s0: number) => (
    <>
      <Echo2 x={130 + i * 580} y={160} s={0.72} a={ap(t, s0)} kind={kind} id={`e10${i}`} />
      <Tx x={110 + i * 580} y={570} w={470} al="center" size={34} c={c} b={900} a={ap(t, s0)}>{l}</Tx>
    </>
  );
  return (
    <>
      <Top idx={9} title="Giải ca" />
      {e(0, 'hyper', 'tim co bóp MẠNH', RED, S[0])}
      {e(1, 'ivc', 'TM chủ dưới nhỏ, xẹp', WATER, S[0] + 0.8)}
      {e(2, 'lung', 'phổi sạch (đường A)', K.green, S[0] + 1.6)}
      <Res x={260} y={650} s0={S[1]} c={KC}>Sốc PHÂN BỐ (nhiễm khuẩn) + thiếu thể tích</Res>
      <GoldC y={810} a={ap(t, S[2])} size={46}>Cần dịch + vận mạch → Bài 4 · Bài 5</GoldC>
    </>
  );
};

// ---------- 11 Ôn tập ----------
const D11: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const nx = usePop(S[2] + 0.3);
  return (
    <>
      <Top idx={10} title="Ôn tập" />
      <div style={{position: 'absolute', left: 110, top: 220, width: 1700, display: 'flex', gap: 34, fontFamily: FONT}}>
        {[['Bơm hỏng', RED], ['Ống giãn', KC], ['Thiếu nước', WATER], ['Bị chặn', K.amber]].map(([w, c], i) => {
          const a = ap(t, S[0] + i * 0.5);
          return <div key={w} style={{width: 400, height: 200, borderRadius: 30, border: `5px solid ${c}`, background: `${c}1c`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, fontWeight: 900, color: K.txt, opacity: a, transform: `scale(${0.85 + 0.15 * a})`}}>{w}</div>;
        })}
      </div>
      <GoldC y={520} a={ap(t, S[1])} size={48}>Khám + siêu âm tại giường → phân loại nhanh</GoldC>
      {nx > 0.01 && (
        <div style={{position: 'absolute', left: 460, top: 680, width: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '16px 0', borderRadius: 999, border: `2px solid ${K.amber}`, background: 'rgba(245,184,61,.08)', fontFamily: FONT, opacity: Math.min(1, nx * 1.5)}}>
          <span style={{fontSize: 28, fontWeight: 800, color: K.amber, letterSpacing: 1}}>BÀI 3</span>
          <span style={{fontSize: 34, fontWeight: 700, color: K.txt}}>Đánh giá tưới máu · lactate · CRT</span>
        </div>
      )}
    </>
  );
};

const SC: React.FC<{S: number[]; D: number[]}>[] = [D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11];

export const Soc2: React.FC = () => (
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
