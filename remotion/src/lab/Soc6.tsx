// Giải mã sốc · Bài 6: Sốc tim (11 cảnh)
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import data from '../data.json';
import {Caption, Progress} from '../Main';
import {FONT} from '../lib';
import {Fade} from './Demo';
import {ap} from '../wb/wb';
import {Echo2} from './Soc2';
import {Patient} from './Soc4';
import {Pump} from './Soc5';
import * as A from './abgArt.mjs';

const K = {
  txt: '#F2F7F9', dim: '#A7BAC4', ink: '#22303A', muted: '#60707A', amber: '#F5B83D',
  ph: '#F2B632', co2: '#38A7DD', hco3: '#F2813D', o2: '#E5484D', green: '#3FB27F', line: 'rgba(190,220,235,.2)',
};
const NAMES = ['MỞ ĐẦU', 'VÒNG XOẮN', 'NGUYÊN NHÂN', 'SCAI', 'ĐÁNH GIÁ', 'THUỐC', 'TÁI THÔNG', 'IABP · ECMO', 'IMPELLA', 'GIẢI CA', 'ÔN TẬP'];

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
      <Tx x={44} y={22} size={24} c={K.dim} b={600}>GIẢI MÃ SỐC · BÀI 6</Tx>
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

const GREEN = K.green;
const PURP = KC;
const AMB = K.amber;
const ORG = '#F07A3A';
const VB: React.FC<{x: number; base: number; w: number; v: number; scale: number; k: number; c: string; lab: string}> = ({x, base, w, v, scale, k, c, lab}) => (
  <>
    <div style={{position: 'absolute', left: x, top: base - v * scale * k, width: w, height: v * scale * k, borderRadius: 14, background: c}} />
    <div style={{position: 'absolute', left: x - 40, top: base - v * scale * k - 64, width: w + 80, textAlign: 'center', fontFamily: FONT, fontSize: 48, fontWeight: 900, color: K.txt, opacity: k}}>{v.toFixed(1).replace('.', ',')}%</div>
    <div style={{position: 'absolute', left: x - 80, top: base + 14, width: w + 160, textAlign: 'center', fontFamily: FONT, fontSize: 34, fontWeight: 900, color: c}}>{lab}</div>
  </>
);
const Pl6: React.FC<{x: number; y: number; w: number; c: string; tc?: string; a: number; children: string; size?: number}> = ({x, y, w, c, tc = '#22303A', a, children, size = 38}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, padding: '18px 0', borderRadius: 999, background: c, color: tc, textAlign: 'center', fontFamily: FONT, fontSize: size, fontWeight: 900, opacity: a, transform: `scale(${0.85 + 0.15 * a})`}}>{children}</div>
);
const WeakHeart: React.FC<{x: number; y: number; w: number; a: number; weak?: number}> = ({x, y, w, a, weak = 1}) => {
  const f = useCurrentFrame();
  const beat = 1 + (0.05 - 0.035 * weak) * Math.max(0, Math.sin(f / 5));
  return <img src={staticFile('dg_tim.png')} style={{position: 'absolute', left: x, top: y, width: w, opacity: a, transform: `scale(${beat})`, filter: `saturate(${1 - 0.4 * weak}) brightness(${1 - 0.18 * weak})`}} />;
};
// Impella
const Impella: React.FC<{x: number; y: number; s: number; a: number; on: number}> = ({x, y, s, a, on}) => {
  const f = useCurrentFrame();
  return (
    <svg width={1100 * s} height={900 * s} viewBox="400 130 1100 900" style={{position: 'absolute', left: x, top: y, opacity: a}}>
      <defs><linearGradient id="my6" x1="0" x2="1"><stop offset="0" stopColor="#B8434E" /><stop offset="1" stopColor="#D9646E" /></linearGradient></defs>
      <path d="M700,420 C700,250 820,170 960,170 C1100,170 1180,240 1180,340 L1180,1000" stroke="#C96A72" strokeWidth={110} fill="none" strokeLinecap="round" />
      <path d="M700,420 C700,250 820,170 960,170 C1100,170 1180,240 1180,340 L1180,1000" stroke="#7A1E2B" strokeWidth={70} fill="none" />
      <path d="M560,440 C470,520 430,700 500,840 C560,950 700,980 760,900 C850,780 860,560 820,450 C780,400 640,390 560,440 Z" fill="url(#my6)" />
      <path d="M600,470 C540,540 520,700 570,800 C610,880 690,890 720,840 C780,740 780,560 760,480 C730,440 640,440 600,470 Z" fill="#5A1520" />
      <path d="M650,445 L700,410 M760,445 L705,410" stroke="#F2D1D5" strokeWidth={8} />
      <g opacity={on}>
        <path d="M690,800 C700,700 700,560 705,430 C710,330 760,250 860,210 C980,170 1140,220 1170,330 L1180,1000" stroke="#DDE6EA" strokeWidth={18} fill="none" />
        <path d="M690,800 C700,700 700,560 705,430" stroke="#9fb1ba" strokeWidth={30} fill="none" />
        <path d="M690,800 c-40,10 -50,60 -10,70 c30,6 40,-30 20,-40" stroke="#DDE6EA" strokeWidth={8} fill="none" />
        <rect x={688} y={330} width={40} height={110} rx={10} fill="#3B4D57" transform="rotate(10 708 385)" />
        <path d="M705,430 C710,330 760,250 860,210 C980,170 1100,190 1160,300" stroke={RED} strokeWidth={12} fill="none" strokeDasharray="24 30" strokeDashoffset={-f * 4} strokeLinecap="round" />
        <path d="M694,800 L700,460" stroke="#FF9AA0" strokeWidth={8} strokeDasharray="14 20" strokeDashoffset={f * 4} />
      </g>
    </svg>
  );
};
// IABP
const Iabp: React.FC<{x: number; y: number; a: number}> = ({x, y, a}) => {
  const f = useCurrentFrame();
  const inf = Math.max(0, Math.sin(f / 7));
  return (
    <svg width={300} height={760} viewBox="150 220 300 760" style={{position: 'absolute', left: x, top: y, opacity: a}}>
      <path d="M300,250 L300,950" stroke="#C96A72" strokeWidth={120} strokeLinecap="round" />
      <path d="M300,250 L300,950" stroke="#7A1E2B" strokeWidth={80} />
      <rect x={300 - (14 + 12 * inf)} y={330} width={2 * (14 + 12 * inf)} height={360} rx={26} fill="#BFE6F5" opacity={0.9} />
      <path d="M300,690 L300,980" stroke="#DDE6EA" strokeWidth={10} />
    </svg>
  );
};
// ECMO box
const Ecmo: React.FC<{x: number; y: number; a: number}> = ({x, y, a}) => {
  const f = useCurrentFrame();
  return (
    <svg width={1000} height={760} viewBox="0 0 1000 760" style={{position: 'absolute', left: x, top: y, opacity: a}}>
      <path d="M120,700 C120,560 160,470 250,420" stroke="#3E5F96" strokeWidth={22} fill="none" />
      <path d="M120,700 C120,560 160,470 250,420" stroke="#8FB0E0" strokeWidth={6} fill="none" strokeDasharray="10 26" strokeDashoffset={f * 3} />
      <rect x={250} y={330} width={200} height={180} rx={24} fill="#E8EEF1" />
      <text x={350} y={432} fill="#22303A" fontSize={34} fontWeight={900} textAnchor="middle" fontFamily={FONT}>BƠM</text>
      <path d="M450,420 L560,420" stroke="#3E5F96" strokeWidth={22} />
      <rect x={560} y={320} width={300} height={200} rx={24} fill="#E8EEF1" />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${590 + i * 55},340 L${590 + i * 55},500`} stroke="#C7D3D9" strokeWidth={6} />)}
      <text x={710} y={410} fill="#22303A" fontSize={30} fontWeight={900} textAnchor="middle" fontFamily={FONT}>MÀNG O₂</text>
      <text x={710} y={450} fill="#22303A" fontSize={26} fontWeight={800} textAnchor="middle" fontFamily={FONT}>O₂ vào · CO₂ ra</text>
      <path d="M860,420 C950,420 960,560 220,700" stroke="#C73A48" strokeWidth={22} fill="none" />
      <path d="M860,420 C950,420 960,560 220,700" stroke="#FF9AA0" strokeWidth={6} fill="none" strokeDasharray="10 26" strokeDashoffset={-f * 3} />
      <text x={30} y={300} fill={K.txt} fontSize={40} fontWeight={900} fontFamily={FONT}>ECMO (V-A)</text>
    </svg>
  );
};

// ---------- 1 Mở đầu ----------
const D1: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={0} title="Sốc tim: khi cái bơm hỏng" />
      <Slip s0={S[0]} x={120} y={210} sw={720} nw={300} title="ÔNG 62 TUỔI · STEMI TRƯỚC RỘNG" rows={[['ha', 'Huyết áp', '82/60', 'mmHg'], ['da', 'Da', 'lạnh', ''], ['p', 'Phổi', 'ran', ''], ['lac', 'Lactate', '5', 'mmol/L']]} hl={t > S[1] ? ['ha', 'lac'] : []} />
      <WeakHeart x={1080} y={180} w={520} a={ap(t, S[0])} weak={ap(t, S[2], 1.5)} />
      <GoldC y={820} a={ap(t, S[2])} size={50}>Cái BƠM đã hỏng</GoldC>
    </>
  );
};

// ---------- 2 Vòng xoắn ----------
const D2: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const arr = (d: string, a: number) => <path d={d} stroke={RED} strokeWidth={10} fill="none" markerEnd="url(#ar6)" opacity={a} />;
  return (
    <>
      <Top idx={1} title="Vòng xoắn sốc tim" />
      <WeakHeart x={780} y={340} w={360} a={ap(t, S[0])} />
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <defs><marker id="ar6" viewBox="0 0 10 10" refX={6} refY={5} markerWidth={5} markerHeight={5} orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={RED} /></marker></defs>
        <circle cx={960} cy={560} r={330} fill="none" stroke={RED} strokeWidth={8} strokeDasharray="40 26" strokeDashoffset={-f * 2} opacity={0.4 * ap(t, S[1])} />
        {arr('M1180,230 C1330,280 1410,350 1450,420', ap(t, S[0] + 0.6))}
        {arr('M1500,530 C1480,700 1440,790 1390,860', ap(t, S[0] + 1.2))}
        {arr('M1100,925 L870,925', ap(t, S[1]))}
        {arr('M520,870 C470,600 560,330 750,230', ap(t, S[1] + 0.8))}
      </svg>
      <Pl6 x={760} y={150} w={400} c={RED} tc="#fff" a={ap(t, S[0])}>Bơm YẾU</Pl6>
      <Pl6 x={1310} y={440} w={460} c={AMB} a={ap(t, S[0] + 0.6)}>↓ cung lượng tim</Pl6>
      <Pl6 x={1120} y={880} w={420} c={AMB} a={ap(t, S[0] + 1.2)}>Tụt huyết áp</Pl6>
      <Pl6 x={300} y={880} w={560} c={PURP} tc="#fff" a={ap(t, S[1])}>Mạch vành thiếu máu</Pl6>
      <div style={{position: 'absolute', left: 120, top: 330, width: 380, height: 200, borderRadius: 24, border: `5px solid ${WATER}`, background: `${WATER}22`, textAlign: 'center', fontFamily: FONT, opacity: ap(t, S[2])}}>
        <div style={{fontSize: 34, fontWeight: 900, color: WATER, marginTop: 40}}>máu ứ phía sau</div>
        <div style={{fontSize: 48, fontWeight: 900, color: K.txt, marginTop: 10}}>→ PHÙ PHỔI</div>
      </div>
    </>
  );
};

// ---------- 3 Nguyên nhân ----------
const D3: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const others: [string, string][] = [['Suy tim mạn mất bù', AMB], ['Viêm cơ tim', PURP], ['Bệnh van tim', WATER], ['Suy thất phải', GREEN]];
  return (
    <>
      <Top idx={2} title="Nguyên nhân" />
      <div style={{position: 'absolute', left: 260, top: 200, width: 1400, height: 220, borderRadius: 40, background: RED, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 80, fontWeight: 900, opacity: ap(t, S[0]), transform: `scale(${0.9 + 0.1 * ap(t, S[0])})`}}>NHỒI MÁU CƠ TIM CẤP</div>
      <Tx x={0} y={440} w={1920} al="center" size={36} c={K.dim} b={800} a={ap(t, S[0] + 0.8)}>nguyên nhân hàng đầu</Tx>
      {others.map(([w, c], i) => <div key={w} style={{position: 'absolute', left: 140 + i * 420, top: 580, width: 390, height: 180, borderRadius: 30, border: `5px solid ${c}`, background: `${c}1c`, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 900, color: K.txt, opacity: ap(t, S[1] + i * 0.5), padding: '0 20px'}}>{w}</div>)}
    </>
  );
};

// ---------- 4 SCAI ----------
const SCAI: [string, string, string][] = [['A', 'có nguy cơ', GREEN], ['B', 'bắt đầu', '#A3C93A'], ['C', 'điển hình', AMB], ['D', 'xấu đi', ORG], ['E', 'nguy kịch', RED]];
export const Scai: React.FC<{x: number; y: number; s: number; t: number; s0: number; step: number; hl?: number}> = ({x, y, s, t, s0, step, hl = -1}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 1700 * s, height: 680 * s}}>
    {SCAI.map(([l, d, c], i) => {
      const a = ap(t, s0 + i * step, 0.5);
      const H = (260 + i * 100) * s;
      return (
        <div key={l} style={{position: 'absolute', left: i * 340 * s, top: 680 * s - H * a, width: 320 * s, height: H * a, borderRadius: 24 * s, background: c, color: i < 3 ? '#22303A' : '#fff', textAlign: 'center', fontFamily: FONT, overflow: 'hidden', outline: hl === i ? `${8 * s}px solid #fff` : 'none', boxShadow: hl === i ? `0 0 ${50 * s}px ${c}` : 'none'}}>
          <div style={{fontSize: 120 * s, fontWeight: 900, lineHeight: 1.1, marginTop: 14 * s}}>{l}</div>
          <div style={{fontSize: 36 * s, fontWeight: 900}}>{d}</div>
        </div>
      );
    })}
  </div>
);
const D4: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={3} title="Giai đoạn SCAI" />
      <Scai x={110} y={140} s={1} t={t} s0={S[0] + 0.5} step={0.9} />
      <div style={{position: 'absolute', left: 110, top: 850, width: 1700, display: 'flex', gap: 24, fontFamily: FONT}}>
        {[['SCAI 2026', K.txt, S[1]], ['giảm TƯỚI MÁU > tụt huyết áp', WATER, S[1] + 0.3], ['đánh giá LẠI liên tục', AMB, S[2]], ['KIỂU HÌNH', PURP, S[2] + 0.8]].map(([w, c, s0]) => (
          <div key={w as string} style={{flex: w === 'SCAI 2026' ? '0 0 220px' : 1, padding: '18px 0', borderRadius: 22, border: `4px solid ${c}`, textAlign: 'center', fontSize: 32, fontWeight: 900, color: K.txt, opacity: ap(t, s0 as number)}}>{w}</div>
        ))}
      </div>
    </>
  );
};

// ---------- 5 Đánh giá ----------
const D5: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={4} title="Đánh giá" />
      <Echo2 x={80} y={170} s={1.1} a={ap(t, S[0])} kind="weak" id="e6" />
      <Tx x={80} y={800} w={660} al="center" size={36} c={RED} b={900} a={ap(t, S[0] + 0.6)}>tim giãn · co bóp YẾU · EF 20%</Tx>
      <Check x={820} y={190} w={1000} items={['EF · thất phải', 'Biến chứng cơ học', 'Lactate · nước tiểu · tri giác']} s0={[S[0] + 0.3, S[0] + 1.2, S[1]]} />
      <Card x={820} y={640} w={1000} h={200} c={PURP} s0={S[2]} head="CA NẶNG" body="catheter động mạch phổi: cung lượng tim, áp lực đổ đầy" size={36} />
    </>
  );
};

// ---------- 6 Thuốc ----------
const D6: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={5} title="Thuốc trong sốc tim" />
      <Pump x={120} y={200} drug="NOREPINEPHRINE · đầu tay" val="0,1 µg/kg/ph" c={AMB} a={ap(t, S[0])} />
      <Pump x={120} y={470} drug="DOBUTAMINE · tăng co bóp" val="2,5 µg/kg/ph" c={GREEN} a={ap(t, S[1])} />
      <Tx x={720} y={250} w={500} size={34} c={AMB} b={900} a={ap(t, S[0] + 0.5)}>ACC 2025</Tx>
      <Tx x={720} y={520} w={600} size={34} c={GREEN} b={900} a={ap(t, S[1] + 0.5)}>khi tưới máu vẫn kém</Tx>
      <Card x={1160} y={200} w={660} h={240} c={WATER} s0={S[2]} head="MILRINONE" body="tương đương dobutamine (CAPITAL DOREMI 2021)" size={36} />
      <div style={{position: 'absolute', left: 120, top: 760, width: 1700, padding: '24px 0', borderRadius: 26, border: `5px solid ${RED}`, background: `${RED}1c`, textAlign: 'center', fontFamily: FONT, fontSize: 44, fontWeight: 900, color: K.txt, opacity: ap(t, S[3])}}>⚠ Thận trọng với DỊCH: thường đã ứ dịch</div>
    </>
  );
};

// ---------- 7 Tái thông ----------
const D7: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const k = ap(t, S[0] + 1, 1.2);
  return (
    <>
      <Top idx={6} title="Sửa nguyên nhân: tái thông mạch vành" />
      <Tx x={100} y={170} w={900} al="center" size={36} c={K.dim} b={800} a={ap(t, S[0])}>SHOCK 1999 · tử vong 6 tháng</Tx>
      <VB x={240} base={850} w={240} v={50.3} scale={9} k={k} c={GREEN} lab="tái thông sớm" />
      <VB x={620} base={850} w={240} v={63.1} scale={9} k={k} c={K.dim} lab="điều trị nội" />
      <Card x={1080} y={300} w={740} h={260} c={AMB} s0={S[1]} head="CULPRIT-SHOCK 2017" body="chỉ can thiệp tổn thương THỦ PHẠM trước" size={38} />
    </>
  );
};

// ---------- 8 IABP · ECMO ----------
const D8: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={7} title="Không dùng thường quy" />
      <Iabp x={120} y={150} a={ap(t, S[0])} />
      <Tx x={60} y={130} w={420} al="center" size={40} b={900} a={ap(t, S[0])}>Bóng đối xung</Tx>
      <Pl6 x={60} y={900} w={420} c={RED} tc="#fff" a={ap(t, S[0] + 0.8)} size={32}>IABP-SHOCK II: không lợi ích</Pl6>
      <Patient x={560} y={430} s={0.75} a={0} b={0} blood={0} op={ap(t, S[1])} id="e8" />
      <Ecmo x={820} y={150} a={ap(t, S[1])} />
      <Pl6 x={760} y={900} w={1040} c={RED} tc="#fff" a={ap(t, S[1] + 0.8)} size={32}>ECLS-SHOCK 2023: tử vong 47,8% so với 49,0%</Pl6>
    </>
  );
};

// ---------- 9 DanGer Shock ----------
const D9: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const k = ap(t, S[1], 1.2);
  return (
    <>
      <Top idx={8} title="DanGer Shock 2024: Impella CP" />
      <Impella x={40} y={150} s={0.78} a={ap(t, S[0])} on={ap(t, S[0] + 0.5)} />
      <Tx x={900} y={170} w={940} al="center" size={34} c={K.dim} b={800} a={ap(t, S[0])}>STEMI chọn lọc · tử vong 180 ngày</Tx>
      <VB x={1030} base={730} w={230} v={45.8} scale={7} k={k} c={GREEN} lab="Impella" />
      <VB x={1430} base={730} w={230} v={58.5} scale={7} k={k} c={K.dim} lab="chuẩn" />
      <div style={{position: 'absolute', left: 900, top: 860, width: 940, display: 'flex', gap: 16, fontFamily: FONT}}>
        {['chảy máu', 'thiếu máu chi', 'lọc máu'].map((w, i) => <div key={w} style={{flex: 1, padding: '16px 0', borderRadius: 999, background: `${RED}33`, border: `3px solid ${RED}`, textAlign: 'center', fontSize: 32, fontWeight: 900, color: K.txt, opacity: ap(t, S[2] + i * 0.4)}}>{w}</div>)}
      </div>
    </>
  );
};

// ---------- 10 Giải ca ----------
const D10: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={9} title="Giải ca" />
      <Scai x={110} y={120} s={0.5} t={t} s0={-10} step={0} hl={2} />
      <Check x={980} y={170} w={860} items={['Norepinephrine + dobutamine', 'Can thiệp thủ phạm LAD', 'Cân nhắc Impella', 'Gọi ĐỘI SỐC · chuyển trung tâm']} s0={[S[0] + 0.5, S[1], S[1] + 0.8, S[2]]} />
      <Res x={110} y={560} s0={S[0]} c={AMB}>SCAI C · sốc tim điển hình</Res>
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
      <div style={{position: 'absolute', left: 160, top: 230, width: 1600, display: 'flex', gap: 40, justifyContent: 'center', fontFamily: FONT}}>
        {[['Sửa NGUYÊN NHÂN', RED], ['Hỗ trợ BƠM', AMB]].map(([w, c], i) => {
          const a = ap(t, S[0] + i * 0.6);
          return <div key={w} style={{width: 640, height: 190, borderRadius: 30, border: `5px solid ${c}`, background: `${c}1c`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, fontWeight: 900, color: K.txt, opacity: a, transform: `scale(${0.85 + 0.15 * a})`}}>{w}</div>;
        })}
      </div>
      <GoldC y={520} a={ap(t, S[1])} size={48}>Hỗ trợ cơ học: chọn ĐÚNG bệnh nhân</GoldC>
      {nx > 0.01 && (
        <div style={{position: 'absolute', left: 460, top: 700, width: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '16px 0', borderRadius: 999, border: `2px solid ${AMB}`, background: 'rgba(245,184,61,.08)', fontFamily: FONT, opacity: Math.min(1, nx * 1.5)}}>
          <span style={{fontSize: 28, fontWeight: 800, color: AMB, letterSpacing: 1}}>BÀI 7</span>
          <span style={{fontSize: 34, fontWeight: 700, color: K.txt}}>Sốc nhiễm khuẩn theo SSC 2026</span>
        </div>
      )}
    </>
  );
};

const SC: React.FC<{S: number[]; D: number[]}>[] = [D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11];

export const Soc6: React.FC = () => (
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
