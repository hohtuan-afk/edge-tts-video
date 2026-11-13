// Giải mã điện giải · Bài 1: Nước và natri (10 cảnh)
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
const NAMES = ['MỞ ĐẦU', 'KHOANG DỊCH', 'BƠM Na/K', 'NỒNG ĐỘ', 'ALTT', 'ADH', 'THẬN', 'KHÁT', 'NƯỚC & MUỐI', 'ÔN TẬP'];

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
      <Tx x={44} y={22} size={24} c={K.dim} b={600}>GIẢI MÃ ĐIỆN GIẢI · BÀI 1</Tx>
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

// ---------- 1 Mở đầu ----------
const D1: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const f = useCurrentFrame();
  return (
    <>
      <Top idx={0} title="Nước và natri: hiểu đúng từ gốc" />
      <div style={{position: 'absolute', left: 0, right: 0, top: 170, textAlign: 'center', fontFamily: FONT, opacity: ap(t, S[0])}}>
        <div style={{fontSize: 46, fontWeight: 800, color: K.dim}}>Natri máu</div>
        <div style={{fontSize: 220, fontWeight: 900, color: NA, lineHeight: 1, transform: `scale(${1 + 0.02 * Math.sin(f / 8)})`}}>125</div>
      </div>
      <BigPill x={440} y={500} a={ap(t, S[0] + 1.2)} c={NA}>Thiếu muối?</BigPill>
      <BigPill x={1020} y={500} a={ap(t, S[0] + 1.8)} c={WATER}>Thừa nước?</BigPill>
      <Res x={620} y={700} s0={S[1]} c={K.o2}>Hiểu sai → điều trị sai</Res>
    </>
  );
};

// ---------- 2 Khoang dịch ----------
const D2: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const X = 260, Y = 260, W = 1400, H = 440;
  const dots = (x0: number, w: number, n: number, txt: string, c: string, seed: number, o: number) =>
    Array.from({length: n}, (_, i) => {
      const px = x0 + 50 + ((i * 137 + seed) % (w - 100)), py = Y + 70 + ((i * 89 + seed * 3) % (H - 140));
      return <Ion key={txt + i} x={px + Math.sin(f / 30 + i) * 10} y={py + Math.cos(f / 25 + i) * 10} t={txt} c={c} r={28} o={o} />;
    });
  return (
    <>
      <Top idx={1} title="Nước trong cơ thể" />
      <Tx x={X} y={170} w={W} al="center" size={44} b={800} a={ap(t, S[0])}>Nước ≈ 60% cân nặng</Tx>
      <div style={{position: 'absolute', left: X, top: Y, width: W * 2 / 3 - 8, height: H, borderRadius: 30, background: 'rgba(155,124,240,.18)', border: `4px solid ${KK}`, opacity: ap(t, S[1])}} />
      <div style={{position: 'absolute', left: X + W * 2 / 3 + 8, top: Y, width: W / 3 - 8, height: H, borderRadius: 30, background: 'rgba(56,167,221,.18)', border: `4px solid ${WATER}`, opacity: ap(t, S[1] + 0.6)}} />
      <Tx x={X} y={Y + H + 16} w={W * 2 / 3} al="center" size={36} c={KK} b={900} a={ap(t, S[1])}>2/3 TRONG tế bào</Tx>
      <Tx x={X + W * 2 / 3} y={Y + H + 16} w={W / 3} al="center" size={36} c={WATER} b={900} a={ap(t, S[1] + 0.6)}>1/3 NGOÀI tế bào</Tx>
      <Svg>
        {dots(X, W * 2 / 3, 9, 'K⁺', KK, 11, ap(t, S[2] + 0.8))}
        {dots(X + W * 2 / 3, W / 3, 5, 'Na⁺', NA, 7, ap(t, S[2]))}
      </Svg>
    </>
  );
};

// ---------- 3 Bơm Na/K ----------
const D3: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const cx = 640, cy = 560, R = 330;
  const pumps = [-60, 30, 150, 230];
  return (
    <>
      <Top idx={2} title="Bơm Na⁺/K⁺-ATPase" />
      <Pic src="dg_tebao.png" x={cx - 380} y={cy - 380} w={760} a={ap(t, S[0] - 0.5)} />
      <Svg>
        {pumps.map((deg, j) => {
          const a0 = (deg * Math.PI) / 180;
          return [0, 1, 2].map((k) => {
            const u = (f / 70 + k / 3 + j * 0.13) % 1;
            const rr = R - 40 + u * 200;
            return <Ion key={`n${j}${k}`} x={cx + Math.cos(a0 + k * 0.08) * rr} y={cy + Math.sin(a0 + k * 0.08) * rr} t="Na⁺" c={NA} r={24} o={ap(t, S[0] + 0.6) * Math.sin(u * Math.PI)} />;
          }).concat([0, 1].map((k) => {
            const u = (f / 70 + k / 2 + j * 0.21) % 1;
            const rr = R + 160 - u * 220;
            return <Ion key={`k${j}${k}`} x={cx + Math.cos(a0 + 0.25 + k * 0.08) * rr} y={cy + Math.sin(a0 + 0.25 + k * 0.08) * rr} t="K⁺" c={KK} r={24} o={ap(t, S[0] + 1) * Math.sin(u * Math.PI)} />;
          }));
        })}
      </Svg>
      <Panel x={1160} y={200} w={640} h={260} c={NA} s0={S[0]}>
        <Tx x={0} y={28} w={640} al="center" size={30} c={NA} b={800}>MỖI VÒNG BƠM</Tx>
        <Tx x={0} y={90} w={640} al="center" size={50} b={900}>3 Na⁺ ra ngoài</Tx>
        <Tx x={0} y={160} w={640} al="center" size={50} c={KK} b={900}>2 K⁺ vào trong</Tx>
      </Panel>
      <Card x={1160} y={520} w={640} h={220} c={WATER} s0={S[1]} head="VÌ VẬY" body="Na⁺ quyết định nước ngoài tế bào" size={40} />
    </>
  );
};

// ---------- 4 Natri là nồng độ ----------
const Glass: React.FC<{x: number; level: number; salt: number; a: number; c: string; label: string}> = ({x, level, salt, a, c, label}) => {
  const f = useCurrentFrame();
  const H = 420, W = 300, y = 280;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: W, height: H + 80, opacity: a, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, borderRadius: '0 0 40px 40px', border: '6px solid rgba(255,255,255,.55)', borderTop: 'none', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: H * level, background: 'linear-gradient(rgba(56,167,221,.45),rgba(56,167,221,.75))'}} />
        <svg style={{position: 'absolute', left: 0, top: 0, width: W, height: H}}>
          {Array.from({length: salt}, (_, i) => <circle key={i} cx={30 + ((i * 53) % (W - 60))} cy={H - 20 - ((i * 37) % Math.max(20, H * level - 40)) + Math.sin(f / 20 + i) * 4} r={11} fill={NA} />)}
        </svg>
      </div>
      <div style={{position: 'absolute', left: 0, top: H + 14, width: W, textAlign: 'center', fontSize: 34, fontWeight: 900, color: c}}>{label}</div>
    </div>
  );
};
const D4: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={3} title="Natri máu là một NỒNG ĐỘ" />
      <GoldC y={160} a={ap(t, S[0])} size={50}>Natri máu = muối ÷ nước</GoldC>
      <Glass x={330} level={0.55} salt={10} a={ap(t, S[0] + 0.8)} c={K.green} label="Bình thường" />
      <Glass x={810} level={0.92} salt={10} a={ap(t, S[1])} c={WATER} label="Thừa nước → Na⁺ ↓" />
      <Glass x={1290} level={0.32} salt={10} a={ap(t, S[2])} c={NA} label="Thiếu nước → Na⁺ ↑" />
    </>
  );
};

// ---------- 5 ALTT ----------
const D5: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const sw = interpolate(t, [S[3] + 0.5, S[3] + D[3] * 0.8], [1, 1.22], clamp);
  return (
    <>
      <Top idx={4} title="Áp lực thẩm thấu" />
      <GoldC y={160} a={ap(t, S[0])} size={44}>ALTT = 2 × Na⁺ + glucose + urê</GoldC>
      <Tx x={160} y={260} w={1600} al="center" size={34} c={K.dim} b={700} a={ap(t, S[1])}>bình thường ≈ 275–295 mOsm/kg</Tx>
      <Chain items={['Nơi loãng', 'Nước đi sang', 'Nơi đặc']} s0={S[2]} step={0.6} y={330} c={WATER} />
      <Pic src="dg_tebao.png" x={360} y={470} w={360} s={sw} a={ap(t, S[3])} />
      <Svg>
        {Array.from({length: 8}, (_, i) => {
          const u = (f / 45 + i / 8) % 1, ang = (i / 8) * Math.PI * 2;
          const rr = 330 - u * 150;
          return <g key={i} opacity={ap(t, S[3] + 0.3) * Math.sin(u * Math.PI)} transform={`translate(${540 + Math.cos(ang) * rr},${650 + Math.sin(ang) * rr})`}><path d="M0,-20 C12,-4 14,6 0,14 C-14,6 -12,-4 0,-20Z" fill={WATER} /></g>;
        })}
      </Svg>
      <Panel x={960} y={500} w={800} h={240} c={K.o2} s0={S[3]} glow={ap(t, S[3] + 2)}>
        <Tx x={0} y={28} w={800} al="center" size={32} c={K.o2} b={800}>Na⁺ MÁU GIẢM</Tx>
        <Tx x={30} y={84} w={740} al="center" size={42} b={800}>Nước tràn vào tế bào → tế bào sưng</Tx>
        <Tx x={0} y={180} w={800} al="center" size={34} c={K.amber} b={900}>Ở não: PHÙ NÃO</Tx>
      </Panel>
    </>
  );
};

// ---------- 6 ADH ----------
const D6: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const g = 0.5 + 0.5 * Math.sin(f / 10);
  return (
    <>
      <Top idx={5} title="ADH · hormone giữ nước" />
      <Pic src="dg_nao.png" x={140} y={190} w={760} a={ap(t, S[0])} glow={`rgba(255,214,90,${0.25 + 0.35 * g})`} />
      <Card x={1000} y={190} w={780} h={190} c={K.amber} s0={S[0] + 0.4} head="ADH · HORMONE CHỐNG BÀI NIỆU" body="Giữ nước lại cho cơ thể" size={42} />
      <Card x={1000} y={410} w={780} h={190} c={K.co2} s0={S[1]} head="NƠI SINH RA" body="Vùng dưới đồi → thuỳ sau tuyến yên" size={38} />
      <Panel x={1000} y={630} w={780} h={200} c={K.o2} s0={S[2]}>
        <Tx x={0} y={24} w={780} al="center" size={28} c={K.o2} b={800}>KÍCH THÍCH TIẾT ADH</Tx>
        <Tx x={30} y={74} w={720} al="center" size={36} b={800}>ALTT tăng · thể tích tuần hoàn giảm</Tx>
      </Panel>
    </>
  );
};

// ---------- 7 Thận ----------
const D7: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const x0 = 200, y0 = 170, w = 560, h = w * 1000 / 734;
  const ductX = x0 + w * 0.89, g = 0.5 + 0.5 * Math.sin(f / 9);
  return (
    <>
      <Top idx={6} title="ADH tác động ở thận" />
      <Pic src="dg_nephron.png" x={x0} y={y0} w={w} a={ap(t, S[0] - 0.3)} />
      <div style={{position: 'absolute', left: ductX - 40, top: y0 + 40, width: 80, height: h - 60, borderRadius: 40, boxShadow: `0 0 ${30 + 30 * g}px rgba(56,167,221,.9)`, border: `4px solid rgba(56,167,221,${0.5 + 0.4 * g})`, opacity: ap(t, S[0] + 0.4)}} />
      <Svg>
        {Array.from({length: 6}, (_, i) => {
          const u = (f / 50 + i / 6) % 1;
          return <g key={i} opacity={ap(t, S[0] + 0.8) * Math.sin(u * Math.PI)} transform={`translate(${ductX + 50 + u * 160},${y0 + 200 + i * 110})`}><path d="M0,-20 C12,-4 14,6 0,14 C-14,6 -12,-4 0,-20Z" fill={WATER} /></g>;
        })}
      </Svg>
      <Tx x={ductX - 120} y={y0 + h + 4} w={240} al="center" size={28} c={WATER} b={800} a={ap(t, S[0] + 0.4)}>ống góp</Tx>
      <Card x={1000} y={190} w={780} h={200} c={WATER} s0={S[0]} head="ADH + ỐNG GÓP" body="Mở kênh aquaporin → hấp thu nước" size={40} />
      <Card x={1000} y={420} w={380} h={300} c={K.amber} s0={S[1]} head="CÓ ADH" body="Nước tiểu ĐẶC · tới ~1200" size={40} />
      <Card x={1400} y={420} w={380} h={300} c={WATER} s0={S[2]} head="KHÔNG ADH" body="Nước tiểu LOÃNG · ~50–100" size={40} />
    </>
  );
};

// ---------- 8 Khát ----------
const D8: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={7} title="Van thứ hai: cơn khát" />
      <Big x={0} y={190} w={1920} a={ap(t, S[0])} size={150} c={WATER}>KHÁT</Big>
      <Chain items={['ALTT tăng', 'Khát', 'Uống nước', 'ALTT về bình thường']} s0={S[1]} step={0.6} y={420} c={WATER} />
      <Card x={360} y={560} w={1200} h={200} c={K.o2} s0={S[2]} head="NGƯỜI KHÔNG TỰ UỐNG ĐƯỢC" body="Người già, hôn mê → dễ tăng natri" size={44} glow={ap(t, S[2] + 1.5)} />
    </>
  );
};

// ---------- 9 Nước & muối ----------
const D9: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={8} title="Nồng độ và thể tích: hai hệ thống" />
      <Panel x={160} y={190} w={760} h={330} c={WATER} s0={S[0]}>
        <Tx x={0} y={28} w={760} al="center" size={32} c={WATER} b={800}>NỒNG ĐỘ Na⁺</Tx>
        <Tx x={0} y={90} w={760} al="center" size={64} b={900}>do NƯỚC</Tx>
        <Tx x={0} y={210} w={760} al="center" size={36} c={K.dim} b={700}>ADH · cơn khát</Tx>
      </Panel>
      <Panel x={1000} y={190} w={760} h={330} c={NA} s0={S[1]}>
        <Tx x={0} y={28} w={760} al="center" size={32} c={NA} b={800}>THỂ TÍCH DỊCH</Tx>
        <Tx x={0} y={90} w={760} al="center" size={64} b={900}>do MUỐI</Tx>
        <Tx x={0} y={210} w={760} al="center" size={36} c={K.dim} b={700}>renin – aldosterone</Tx>
      </Panel>
      <Tx x={160} y={570} w={1600} al="center" size={40} b={800} a={ap(t, S[2])}>Cùng Na⁺ 125:</Tx>
      <Res x={430} y={640} s0={S[2] + 0.8} c={WATER}>Phù (thừa dịch)</Res>
      <Res x={1030} y={640} s0={S[2] + 1.6} c={NA}>Mất nước (thiếu dịch)</Res>
    </>
  );
};

// ---------- 10 Ôn tập ----------
const D10: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const nx = usePop(S[2] + 0.3);
  return (
    <>
      <Top idx={9} title="Ôn tập" />
      <Card x={160} y={230} w={760} h={240} c={NA} s0={S[0]} head="NATRI MÁU" body="= muối ÷ nước · phản ánh NƯỚC" size={44} />
      <Card x={1000} y={230} w={760} h={240} c={K.amber} s0={S[1]} head="ADH + KHÁT" body="Giữ ALTT ổn định" size={46} />
      {nx > 0.01 && (
        <div style={{position: 'absolute', left: 560, top: 600, width: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '16px 0', borderRadius: 999, border: `2px solid ${K.amber}`, background: 'rgba(245,184,61,.08)', fontFamily: FONT, opacity: Math.min(1, nx * 1.5)}}>
          <span style={{fontSize: 28, fontWeight: 800, color: K.amber, letterSpacing: 1}}>BÀI 2</span>
          <span style={{fontSize: 34, fontWeight: 700, color: K.txt}}>Hạ natri máu: chẩn đoán</span>
        </div>
      )}
    </>
  );
};

const SC: React.FC<{S: number[]; D: number[]}>[] = [D1, D2, D3, D4, D5, D6, D7, D8, D9, D10];

export const Dg1: React.FC = () => (
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
