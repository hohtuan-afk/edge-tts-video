// Giải mã điện giải · Bài 7: Canxi, magie, phosphate (11 cảnh)
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
const NAMES = ['MỞ ĐẦU', 'CANXI', 'HẠ Ca', 'XỬ TRÍ HẠ Ca', 'TĂNG Ca', 'XỬ TRÍ TĂNG Ca', 'MAGIE', 'XỬ TRÍ Mg', 'HẠ PHOSPHATE', 'TĂNG PHOSPHATE', 'CA & ÔN TẬP'];

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
      <Tx x={44} y={22} size={24} c={K.dim} b={600}>GIẢI MÃ ĐIỆN GIẢI · BÀI 7</Tx>
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

// ---------- 1 Mở đầu ----------
const D1: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const a1 = 1 - ap(t, S[2] - 0.4, 0.4), a2 = ap(t, S[2]);
  const trio: [string, string, string][] = [['Ca²⁺', CA, 'Canxi'], ['Mg²⁺', MG, 'Magie'], ['PO₄', PH, 'Phosphate']];
  return (
    <>
      <Top idx={0} title="Canxi · magie · phosphate" />
      <div style={{position: 'absolute', inset: 0, opacity: a1}}>
        {trio.map(([s, c, n], i) => {
          const p = ap(t, S[0] + i * 0.5);
          return (
            <div key={s} style={{position: 'absolute', left: 260 + i * 500, top: 230, width: 400, textAlign: 'center', fontFamily: FONT, opacity: p, transform: `scale(${0.8 + 0.2 * p})`}}>
              <div style={{width: 280, height: 280, margin: '0 auto', borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, fontWeight: 900, color: K.ink, boxShadow: `0 0 60px ${c}66`}}>{chem(s)}</div>
              <div style={{fontSize: 46, fontWeight: 900, color: K.txt, marginTop: 20}}>{n}</div>
            </div>
          );
        })}
        <Bullets x={300} y={700} w={1320} items={['Co giật', 'Xoắn đỉnh', 'Suy hô hấp']} s0={[S[1], S[1] + 0.5, S[1] + 1]} c={K.o2} size={44} />
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: a2}}>
        <Thyroid x={120} y={170} s={0.82} a={1} glow={0.5} />
        {a2 > 0.01 ? <Slip s0={S[2]} x={820} y={230} sw={900} nw={420} title="CHỊ 45 TUỔI · SAU MỔ TUYẾN GIÁP 2 NGÀY" rows={[['te', 'Tê quanh môi', '✓', ''], ['co', 'Co quắp bàn tay', '✓', '']]} hl={['co']} /> : null}
      </div>
    </>
  );
};

// ---------- 2 Canxi trong máu ----------
const D2: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={1} title="Canxi trong máu" />
      <Bone x={40} y={190} s={0.38} a={ap(t, S[0])} release={ap(t, S[0] + 0.5)} />
      <Tx x={40} y={470} w={600} al="center" size={34} c={K.amber} b={900} a={ap(t, S[0] + 0.5)}>99% canxi trong xương</Tx>
      <AlbScene x={700} y={170} a={ap(t, S[1])} drop={ap(t, S[2], 1.2)} />
      <div style={{position: 'absolute', left: 80, top: 560, width: 560, fontFamily: FONT, opacity: ap(t, S[1] + 0.5)}}>
        <div style={{fontSize: 36, fontWeight: 900, color: CA}}>● Ca²⁺ ion ~50%: có tác dụng</div>
        <div style={{fontSize: 36, fontWeight: 900, color: K.amber, marginTop: 12}}>● gắn albumin ~40%</div>
        <div style={{fontSize: 34, fontWeight: 800, color: K.o2, marginTop: 22, opacity: ap(t, S[2])}}>Albumin ↓ → Ca toàn phần “giả thấp”</div>
      </div>
      <Panel x={160} y={770} w={1600} h={130} c={K.amber} s0={S[3]}>
        <Tx x={0} y={22} w={1600} al="center" size={40} b={900}>Ca hiệu chỉnh = Ca + 0,02 × (40 − albumin g/L)</Tx>
        <Tx x={0} y={78} w={1600} al="center" size={30} c={CA} b={800}>Tốt nhất: đo canxi ion</Tx>
      </Panel>
    </>
  );
};

// ---------- 3 Hạ canxi ----------
const D3: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={2} title="Hạ canxi" />
      <Thyroid x={60} y={170} s={0.7} a={ap(t, S[0])} glow={0.3} />
      <Tx x={620} y={180} w={1200} size={40} c={K.dim} b={800} a={ap(t, S[0])}>Thần kinh cơ bị kích thích quá mức</Tx>
      <Bullets x={620} y={260} w={1220} items={['Tê quanh môi', 'Co cứng', 'Dấu Chvostek', 'Dấu Trousseau']} s0={[S[1], S[1] + 0.6, S[1] + 1.4, S[1] + 2.2]} c={CA} size={40} />
      <Bullets x={620} y={420} w={1220} items={['QT kéo dài', 'Co giật', 'Co thắt thanh quản']} s0={[S[2], S[2] + 0.8, S[2] + 1.4]} c={K.o2} size={40} />
      <Panel x={620} y={560} w={1220} h={290} c={K.amber} s0={S[3]}>
        <Tx x={0} y={20} w={1220} al="center" size={34} c={K.amber} b={900}>NGUYÊN NHÂN</Tx>
        <Bullets x={30} y={80} w={1160} items={['Mổ tuyến giáp/cận giáp', 'Thiếu vitamin D', 'Bệnh thận', 'Viêm tụy', 'Truyền máu nhiều', 'Hạ magie']} s0={[S[3] + 0.5, S[3] + 1.5, S[3] + 2.2, S[3] + 2.8, S[3] + 3.4, S[3] + 4.4]} c={K.amber} size={32} />
      </Panel>
    </>
  );
};

// ---------- 4 Xử trí hạ canxi ----------
const D4: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={3} title="Xử trí hạ canxi có triệu chứng" />
      <Syringe x={40} y={300} a={ap(t, S[0])} label="Ca²⁺" />
      <Check x={700} y={180} w={1140} items={['Canxi gluconat 10% · 10–20 mL', 'Pha loãng · truyền trong 10 phút', 'Truyền duy trì · theo dõi Ca', 'Luôn kiểm tra & bù MAGIE']} s0={[S[0], S[1], S[2], S[3]]} />
    </>
  );
};

// ---------- 5 Tăng canxi ----------
const D5: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={4} title="Tăng canxi" />
      <Bone x={40} y={230} s={0.5} a={ap(t, S[0])} release={1} />
      <Card x={880} y={190} w={460} h={200} c={K.amber} s0={S[0] + 0.5} head="CƯỜNG CẬN GIÁP" body="" size={38} />
      <Card x={1380} y={190} w={460} h={200} c={K.o2} s0={S[0] + 1.2} head="UNG THƯ" body="" size={38} />
      <Tx x={880} y={400} w={960} al="center" size={32} c={K.dim} b={800} a={ap(t, S[0] + 1.5)}>~90% các trường hợp</Tx>
      <Bullets x={120} y={600} w={1700} items={['Sỏi thận', 'Đau xương', 'Đau bụng · táo bón', 'Lú lẫn']} s0={[S[1], S[1] + 0.6, S[1] + 1.2, S[1] + 2]} c={K.amber} size={44} />
      <Bullets x={120} y={720} w={1700} items={['Tiểu nhiều → mất nước', 'QT ngắn']} s0={[S[2], S[2] + 1.6]} c={K.o2} size={44} />
    </>
  );
};

// ---------- 6 Xử trí tăng canxi ----------
const D6: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={5} title="Xử trí tăng canxi" />
      <Check x={160} y={180} w={1000} items={['① NaCl 0,9% · bù nước', '② Bisphosphonat (zoledronic) hoặc denosumab', 'Calcitonin: nhanh nhưng ngắn']} s0={[S[0], S[1], S[2]]} />
      <div style={{position: 'absolute', left: 1220, top: 190, width: 560, height: 200, borderRadius: 30, border: `4px dashed ${K.dim}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, opacity: ap(t, S[3])}}>
        <div style={{fontSize: 46, fontWeight: 900, color: K.dim, textDecoration: 'line-through', textDecorationColor: K.o2, textDecorationThickness: 6}}>Furosemide</div>
        <div style={{fontSize: 30, fontWeight: 700, color: K.o2, marginTop: 10}}>không dùng thường quy</div>
      </div>
      <Card x={1220} y={430} w={560} h={210} c={K.o2} s0={S[3] + 1.5} head="LỌC MÁU" body="nặng + suy thận" size={44} />
    </>
  );
};

// ---------- 7 Magie ----------
const D7: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={6} title="Magie" />
      <div style={{position: 'absolute', left: 120, top: 190, width: 420, height: 420, borderRadius: '50%', background: MG, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: '#fff', opacity: ap(t, S[0]), boxShadow: `0 0 60px ${MG}66`}}>
        <div style={{fontSize: 110, fontWeight: 900}}>{chem('Mg²⁺')}</div>
        <div style={{fontSize: 36, fontWeight: 800}}>0,7–1,0 mmol/L</div>
      </div>
      <Bullets x={640} y={200} w={1200} items={['Ức chế bơm proton', 'Lợi tiểu', 'Rượu', 'Tiêu chảy']} s0={[S[1], S[1] + 0.8, S[1] + 1.4, S[1] + 1.9]} c={MG} size={44} />
      <div style={{position: 'absolute', left: 640, top: 340, display: 'flex', gap: 30, alignItems: 'center', fontFamily: FONT, opacity: ap(t, S[2])}}>
        <Ion2 x={50} y={50} t="K⁺" c={KC} r={50} dark={false} />
        <Ion2 x={170} y={50} t="Ca²⁺" c={CA} r={50} />
      </div>
      <Tx x={880} y={350} w={960} size={44} c={K.o2} b={900} a={ap(t, S[2])}>bù mãi không lên</Tx>
      <TdP x={120} y={680} w={1680} h={220} s0={S[3]} />
    </>
  );
};

// ---------- 8 Xử trí magie ----------
const D8: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={7} title="Xử trí rối loạn magie" />
      <TdP x={60} y={170} w={1240} h={240} s0={S[0] - 0.3} />
      <Vial x={1380} y={140} a={ap(t, S[0])} label="MgSO₄" c={MG} />
      <Tx x={1600} y={240} w={300} size={44} c={MG} b={900} a={ap(t, S[0] + 0.6)}>2 g TM</Tx>
      <Tx x={60} y={470} w={1800} al="center" size={42} c={K.amber} b={900} a={ap(t, S[1])}>TĂNG MAGIE: suy thận · điều trị tiền sản giật</Tx>
      <Chain items={['Mất phản xạ gân xương', 'Hạ huyết áp', 'Ức chế hô hấp']} s0={S[2]} step={0.8} y={560} c={K.o2} />
      <Res x={460} y={720} s0={S[3]} c={K.green}>Canxi gluconat · ngưng Mg · lọc máu</Res>
    </>
  );
};

// ---------- 9 Hạ phosphate ----------
const D9: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={8} title="Hạ phosphate" />
      <div style={{position: 'absolute', left: 120, top: 190, width: 420, height: 420, borderRadius: '50%', background: PH, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: K.ink, opacity: ap(t, S[0]), boxShadow: `0 0 60px ${PH}66`}}>
        <div style={{fontSize: 110, fontWeight: 900}}>{chem('PO₄')}</div>
        <div style={{fontSize: 36, fontWeight: 800}}>0,8–1,5 mmol/L</div>
      </div>
      <Bullets x={640} y={200} w={1200} items={['Nuôi ăn lại', 'Điều trị DKA', 'Nghiện rượu']} s0={[S[1], S[1] + 1, S[1] + 2.4]} c={PH} size={46} />
      <Bullets x={640} y={360} w={1200} items={['Yếu cơ', 'Khó cai máy thở', 'Tan máu']} s0={[S[2], S[2] + 0.6, S[2] + 1.3]} c={K.o2} size={46} />
      <Res x={640} y={560} s0={S[3]} c={K.green}>Bù phosphate · ăn tăng dần</Res>
    </>
  );
};

// ---------- 10 Tăng phosphate ----------
const D10: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const u = ap(t, S[1] + 0.5, 1.5);
  return (
    <>
      <Top idx={9} title="Tăng phosphate" />
      <Bullets x={160} y={190} w={1600} items={['Suy thận', 'Ly giải u']} s0={[S[0], S[0] + 1]} c={PH} size={50} />
      <div style={{position: 'absolute', left: 0, top: 360, width: 1920, height: 260, opacity: ap(t, S[1])}}>
        <Ion2 x={760 + u * 110} y={130} t="PO₄" c={PH} r={70} />
        <Ion2 x={1160 - u * 110} y={130} t="Ca²⁺" c={CA} r={70} />
        <Tx x={1300} y={100} w={560} size={48} c={K.o2} b={900} a={ap(t, S[1] + 2)}>→ Ca²⁺ ↓</Tx>
      </div>
      <Res x={560} y={700} s0={S[2]} c={K.green}>Thuốc gắn phosphate · lọc máu</Res>
    </>
  );
};

// ---------- 11 Giải ca + ôn tập ----------
const D11: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const nx = usePop(S[3] + 0.3);
  return (
    <>
      <Top idx={10} title="Giải ca · ôn tập" />
      <Slip s0={S[0]} x={80} y={190} sw={600} nw={300} title="CHỊ 45 TUỔI · SAU MỔ" rows={[['ca', 'Ca ion', 'thấp', ''], ['mg', 'Mg²⁺', 'thấp', '']]} hl={['ca', 'mg']} />
      <Step x={760} y={200} s0={S[0] + 0.8} c={K.amber}>Suy cận giáp sau mổ</Step>
      <Step x={760} y={290} s0={S[1]} c={K.green}>Canxi gluconat + bù magie → hết co quắp</Step>
      <div style={{position: 'absolute', left: 300, top: 470, width: 1320, display: 'flex', justifyContent: 'center', gap: 50, opacity: ap(t, S[2])}}>
        {[['Ca²⁺', CA], ['Mg²⁺', MG], ['K⁺', KC]].map(([s, c]) => <div key={s} style={{width: 200, height: 200, borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 70, fontWeight: 900, color: s === 'K⁺' ? '#fff' : K.ink}}>{chem(s)}</div>)}
      </div>
      <Tx x={0} y={690} w={1920} al="center" size={42} c={K.amber} b={900} a={ap(t, S[2] + 0.6)}>luôn kiểm tra cùng nhau</Tx>
      {nx > 0.01 && (
        <div style={{position: 'absolute', left: 560, top: 790, width: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '16px 0', borderRadius: 999, border: `2px solid ${K.amber}`, background: 'rgba(245,184,61,.08)', fontFamily: FONT, opacity: Math.min(1, nx * 1.5)}}>
          <span style={{fontSize: 28, fontWeight: 800, color: K.amber, letterSpacing: 1}}>BÀI 8</span>
          <span style={{fontSize: 34, fontWeight: 700, color: K.txt}}>Điện giải trong hồi sức · ca DKA</span>
        </div>
      )}
    </>
  );
};

const SC: React.FC<{S: number[]; D: number[]}>[] = [D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11];

export const Dg7: React.FC = () => (
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
