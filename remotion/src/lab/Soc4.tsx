// Giải mã sốc · Bài 4: Truyền dịch đúng (11 cảnh)
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
const NAMES = ['MỞ ĐẦU', 'ROSE', 'LIỀU ĐẦU', 'DỊCH GÌ', 'BẰNG CHỨNG', 'FRANK–STARLING', 'NÂNG CHÂN', 'CLASSIC · CLOVERS', 'QUÁ TẢI', 'GIẢI CA', 'ÔN TẬP'];

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
      <Tx x={44} y={22} size={24} c={K.dim} b={600}>GIẢI MÃ SỐC · BÀI 4</Tx>
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
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// ---- bệnh nhân trên giường: a = góc lưng, b = góc chân, blood 0..1 ----
export const Patient: React.FC<{x: number; y: number; s: number; a: number; b: number; blood: number; op?: number; id: string}> = ({x, y, s, a, b, blood, op = 1, id}) => {
  const f = useCurrentFrame();
  const g = (n: string) => `${n}${id}`;
  return (
    <svg width={1100 * s} height={830 * s} viewBox="-560 -560 1100 830" style={{position: 'absolute', left: x, top: y, opacity: op}}>
      <defs>
        <linearGradient id={g('gw')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9CCFE6" /><stop offset="1" stopColor="#5E9DBB" /></linearGradient>
        <linearGradient id={g('gw2')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6FA9C4" /><stop offset="1" stopColor="#4A84A0" /></linearGradient>
        <linearGradient id={g('sk')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F4CDAE" /><stop offset="1" stopColor="#D49B76" /></linearGradient>
        <linearGradient id={g('mt')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#EEF3F5" /><stop offset="1" stopColor="#B9C7CE" /></linearGradient>
        <linearGradient id={g('sh')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F1F5F7" /><stop offset="1" stopColor="#C9D5DB" /></linearGradient>
        <radialGradient id={g('gl')}><stop offset="0" stopColor="#FF6B70" stopOpacity={0.9} /><stop offset="1" stopColor="#FF6B70" stopOpacity={0} /></radialGradient>
      </defs>
      <rect x={-470} y={70} width={980} height={26} rx={13} fill="#4F6B78" />
      <rect x={-440} y={96} width={22} height={120} fill="#4F6B78" /><rect x={470} y={96} width={22} height={120} fill="#4F6B78" />
      <circle cx={-429} cy={226} r={20} fill="#2B3B43" stroke="#7F97A1" strokeWidth={5} /><circle cx={481} cy={226} r={20} fill="#2B3B43" stroke="#7F97A1" strokeWidth={5} />
      <rect x={-80} y={20} width={160} height={50} rx={12} fill={`url(#${g('mt')})`} />
      <g transform={`rotate(${-b} 60 20)`}>
        <rect x={60} y={20} width={420} height={50} rx={14} fill={`url(#${g('mt')})`} />
        <path d="M-10,20 L-10,-100 C60,-104 120,-96 180,-92 C230,-104 260,-100 300,-84 C350,-76 400,-70 430,-66 L440,20 Z" fill={`url(#${g('sh')})`} />
        <path d="M40,-60 C120,-58 260,-48 420,-40" stroke="#B7C4CB" strokeWidth={5} fill="none" />
        {blood > 0.01 ? (
          <g opacity={blood}>
            <path d="M410,-30 L70,-30" stroke={RED} strokeWidth={16} strokeDasharray="26 18" strokeDashoffset={f * 3} strokeLinecap="round" />
            <path d="M90,-52 L50,-30 L90,-8" fill="none" stroke={RED} strokeWidth={14} strokeLinecap="round" />
          </g>
        ) : null}
        <path d="M428,-66 C448,-74 456,-112 450,-140 C446,-160 476,-162 482,-136 C492,-96 488,-40 468,20 L432,20 Z" fill={`url(#${g('sk')})`} />
      </g>
      <path d="M-150,20 L-150,-124 L-20,-124 C20,-124 50,-90 50,-50 L50,20 Z" fill={`url(#${g('gw')})`} />
      <g transform={`rotate(${a} -80 20)`}>
        <rect x={-470} y={20} width={390} height={50} rx={14} fill={`url(#${g('mt')})`} />
        <rect x={-450} y={-4} width={110} height={34} rx={16} fill="#F7FAFB" />
        <path d="M-300,-60 C-240,-44 -170,-30 -120,-24" stroke={`url(#${g('gw2')})`} strokeWidth={46} strokeLinecap="round" fill="none" />
        <path d="M-80,20 L-330,20 C-360,20 -372,-6 -366,-34 L-352,-92 C-345,-114 -326,-124 -300,-124 L-80,-124 Z" fill={`url(#${g('gw')})`} />
        {blood > 0.01 ? <circle cx={-215} cy={-70} r={80 + 10 * Math.sin(f / 5)} fill={`url(#${g('gl')})`} opacity={blood} /> : null}
        <path transform={`translate(-215,-90) scale(${1.1 * (1 + 0.06 * Math.max(0, Math.sin(f / 4)))})`} d="M0,8 C-12,-14 -44,-10 -44,14 C-44,34 -20,48 0,62 C20,48 44,34 44,14 C44,-10 12,-14 0,8Z" fill={RED} stroke="#fff" strokeWidth={4} />
        <rect x={-398} y={-70} width={48} height={56} rx={16} fill={`url(#${g('sk')})`} />
        <ellipse cx={-445} cy={-44} rx={64} ry={56} fill={`url(#${g('sk')})`} />
        <path d="M-505,-30 C-515,-80 -480,-108 -440,-104 C-470,-90 -490,-60 -488,-20 C-492,0 -500,0 -505,-30Z" fill="#3B2A22" />
        <path d="M-430,-100 C-432,-118 -416,-122 -410,-104" fill={`url(#${g('sk')})`} />
        <ellipse cx={-425} cy={-80} rx={7} ry={4} fill="#3B2A22" />
        <path d="M-452,-70 C-446,-64 -438,-64 -432,-70" stroke="#B5785A" strokeWidth={4} fill="none" />
        <path d="M-290,-50 C-240,-36 -180,-24 -140,-20" stroke={`url(#${g('gw')})`} strokeWidth={50} strokeLinecap="round" fill="none" />
        <path d="M-140,-20 L-95,-18" stroke={`url(#${g('sk')})`} strokeWidth={40} strokeLinecap="round" />
      </g>
    </svg>
  );
};
const VtiBox: React.FC<{x: number; y: number; h: number; lab: string; c: string; a: number; fs?: number}> = ({x, y, h, lab, c, a, fs = 30}) => {
  const f = useCurrentFrame();
  const sweep = (f * 6) % 440;
  return (
    <svg width={460} height={190} style={{position: 'absolute', left: x, top: y, opacity: a}}>
      <rect width={460} height={190} rx={18} fill="#050505" stroke="#2d3c44" strokeWidth={3} />
      <path d="M15,45 L445,45" stroke="#666" strokeWidth={2} />
      <g fill="#d6d6d6">{[0, 1, 2, 3].map((i) => <path key={i} d={`M${30 + i * 105},45 C${45 + i * 105},${45 + h} ${85 + i * 105},${49 + h} ${105 + i * 105},45Z`} opacity={30 + i * 105 < sweep + 15 ? 1 : 0.25} />)}</g>
      <path d={`M${15 + sweep},20 L${15 + sweep},150`} stroke={GREEN} strokeWidth={3} opacity={0.7} />
      <text x={230} y={175} fill={c} fontSize={fs} fontWeight={900} textAnchor="middle" fontFamily={FONT}>{lab}</text>
    </svg>
  );
};
const IVBag: React.FC<{x: number; y: number; label: string; c: string; a: number; ions?: boolean; lsize?: number}> = ({x, y, label, c, a, ions, lsize = 40}) => {
  const f = useCurrentFrame();
  return (
    <svg width={320} height={660} viewBox="-10 -10 320 660" style={{position: 'absolute', left: x, top: y, opacity: a}}>
      <rect x={0} y={40} width={300} height={430} rx={40} fill="rgba(220,240,250,.18)" stroke="#dff2fa" strokeWidth={6} />
      <rect x={130} y={0} width={40} height={50} rx={8} fill="#dff2fa" />
      <rect x={20} y={200} width={260} height={260} rx={30} fill={c} opacity={0.55} />
      <rect x={20} y={110} width={260} height={90} rx={12} fill="#fff" />
      <text x={150} y={168} fill="#22303A" fontSize={lsize} fontWeight={900} textAnchor="middle" fontFamily={FONT}>{label}</text>
      <rect x={135} y={470} width={30} height={60} fill="#dff2fa" />
      <path d="M150,530 L150,640" stroke="#dff2fa" strokeWidth={8} />
      <circle cx={150} cy={545 + ((f * 3) % 90)} r={8} fill={c} />
      {ions ? [[60, 290], [170, 330], [90, 400], [200, 420]].map(([ix, iy], i) => <text key={i} x={ix + 10 * Math.sin(f / 12 + i)} y={iy + 8 * Math.cos(f / 15 + i)} fill={K.amber} fontSize={34} fontWeight={900} fontFamily={FONT}>Cl⁻</text>) : null}
    </svg>
  );
};
const VBar: React.FC<{x: number; base: number; w: number; v: number; scale: number; k: number; c: string; lab: string}> = ({x, base, w, v, scale, k, c, lab}) => (
  <>
    <div style={{position: 'absolute', left: x, top: base - v * scale * k, width: w, height: v * scale * k, borderRadius: 14, background: c}} />
    <div style={{position: 'absolute', left: x - 40, top: base - v * scale * k - 64, width: w + 80, textAlign: 'center', fontFamily: FONT, fontSize: 46, fontWeight: 900, color: K.txt, opacity: k}}>{v.toFixed(1).replace('.', ',')}%</div>
    <div style={{position: 'absolute', left: x - 60, top: base + 14, width: w + 120, textAlign: 'center', fontFamily: FONT, fontSize: 32, fontWeight: 900, color: c}}>{lab}</div>
  </>
);

// ---------- 1 Mở đầu ----------
const D1: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const f = useCurrentFrame();
  return (
    <>
      <Top idx={0} title="Thêm dịch hay không?" />
      <Slip s0={S[0]} x={120} y={210} sw={700} nw={300} title="ÔNG 70 TUỔI · 70 KG" rows={[['d', 'Đã truyền', '1,5', 'lít'], ['map', 'MAP', '60', 'mmHg'], ['m', 'Mạch', '112', 'l/ph']]} hl={['map']} />
      <IVBag x={1080} y={180} label="+ 500 mL ?" c={WATER} a={ap(t, S[1])} lsize={34} />
      <div style={{position: 'absolute', left: 1440, top: 300, fontFamily: FONT, fontSize: 240, fontWeight: 900, color: K.amber, opacity: ap(t, S[1]), transform: `scale(${1 + 0.03 * Math.sin(f / 7)})`}}>?</div>
      <GoldC y={800} a={ap(t, S[2])} size={48}>Dịch là THUỐC: có liều, có tác dụng phụ</GoldC>
    </>
  );
};

// ---------- 2 ROSE ----------
const ROSE_P = 'M160,800 C400,800 420,310 700,280 C980,260 1100,280 1200,400 C1350,580 1500,760 1760,780';
const D2: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const k = ap(t, S[0], 3);
  const ph: [string, string, string][] = [['HỒI SỨC', RED, '#fff'], ['TỐI ƯU', K.amber, '#22303A'], ['ỔN ĐỊNH', GREEN, '#0b1a22'], ['RÚT DỊCH', PURP, '#fff']];
  return (
    <>
      <Top idx={1} title="4 giai đoạn truyền dịch (ROSE)" />
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <path d="M160,800 L1760,800" stroke="#2d4652" strokeWidth={4} />
        <path d={ROSE_P} stroke={WATER} strokeWidth={12} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} />
        <text x={110} y={540} fill={K.dim} fontSize={30} fontWeight={800} textAnchor="middle" transform="rotate(-90 110 540)" fontFamily={FONT}>cân bằng dịch tích lũy</text>
        <text x={760} y={230} fill={RED} fontSize={38} fontWeight={900} fontFamily={FONT} opacity={ap(t, S[1])}>cứu sống ↑</text>
        <text x={1450} y={560} fill={PURP} fontSize={38} fontWeight={900} fontFamily={FONT} opacity={ap(t, S[1] + 0.8)}>↓ rút dịch thừa</text>
      </svg>
      {ph.map(([l, c, tc], i) => <div key={l} style={{position: 'absolute', left: 180 + i * 400, top: 840, width: 360, height: 90, borderRadius: 20, background: c, color: tc, fontFamily: FONT, fontSize: 40, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ap(t, S[0] + i * 0.7)}}>{l}</div>)}
    </>
  );
};

// ---------- 3 Liều đầu ----------
const D3: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={2} title="Liều đầu (SSC 2026)" />
      <div style={{position: 'absolute', left: 160, top: 200, width: 1600, height: 200, borderRadius: 36, border: `6px solid ${WATER}`, background: `${WATER}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, fontFamily: FONT, opacity: ap(t, S[0])}}>
        <span style={{fontSize: 110, fontWeight: 900, color: K.txt}}>≥ 30 mL/kg</span>
        <span style={{fontSize: 48, fontWeight: 800, color: WATER}}>trong 3 giờ</span>
      </div>
      <Tx x={0} y={420} w={1920} al="center" size={38} c={K.amber} b={900} a={ap(t, S[0] + 1.5)}>khuyến cáo CÓ ĐIỀU KIỆN · cá thể hóa</Tx>
      <Card x={160} y={540} w={760} h={200} c={K.amber} s0={S[1]} head="BMI > 30" body="cân nặng lý tưởng / điều chỉnh" size={38} />
      <Card x={1000} y={540} w={760} h={200} c={GREEN} s0={S[2]} head="BOLUS 250–500 mL" body="đánh giá lại sau MỖI liều" size={38} />
    </>
  );
};

// ---------- 4 Dịch gì ----------
const D4: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const x = ap(t, S[2]);
  return (
    <>
      <Top idx={3} title="Dịch gì?" />
      <Tx x={0} y={150} w={1920} al="center" size={42} c={K.txt} b={900} a={ap(t, S[0])}>Đầu tay: dịch TINH THỂ</Tx>
      <IVBag x={330} y={240} label="NaCl 0,9%" c={WATER} a={ap(t, S[1])} ions />
      <IVBag x={1270} y={240} label="Ringer lactate" c={GREEN} a={ap(t, S[1] + 0.6)} lsize={34} />
      <Tx x={0} y={460} w={1920} al="center" size={90} c={K.dim} b={900} a={ap(t, S[1])}>vs</Tx>
      <Tx x={180} y={900} w={620} al="center" size={36} c={K.amber} b={900} a={ap(t, S[1] + 1)}>nhiều clo → toan, hại thận?</Tx>
      <Tx x={1120} y={900} w={620} al="center" size={36} c={GREEN} b={900} a={ap(t, S[1] + 1.4)}>✓ ƯU TIÊN dịch cân bằng</Tx>
      <div style={{position: 'absolute', left: 700, top: 640, width: 520, padding: '18px 0', borderRadius: 24, border: `5px solid ${RED}`, background: `${RED}22`, textAlign: 'center', fontFamily: FONT, fontSize: 36, fontWeight: 900, color: K.txt, opacity: x, lineHeight: 1.35}}>✗ starch<br />✗ albumin thường quy</div>
    </>
  );
};

// ---------- 5 Bằng chứng ----------
const D5: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const k = ap(t, S[0] + 0.5, 1.2);
  return (
    <>
      <Top idx={4} title="Dịch cân bằng: bằng chứng" />
      <Tx x={100} y={170} w={900} al="center" size={44} b={900} a={ap(t, S[0])}>SMART 2018 · 15.802 bệnh nhân</Tx>
      <Tx x={100} y={230} w={900} al="center" size={30} c={K.dim} b={800} a={ap(t, S[0])}>biến cố thận nặng trong 30 ngày</Tx>
      <VBar x={300} base={820} w={200} v={14.3} scale={28} k={k} c={GREEN} lab="cân bằng" />
      <VBar x={600} base={820} w={200} v={15.4} scale={28} k={k} c={WATER} lab="NaCl 0,9%" />
      <Card x={1100} y={240} w={720} h={200} c={K.dim} s0={S[1]} head="BaSICS · PLUS" body="chưa khác biệt có ý nghĩa" size={40} />
      <Card x={1100} y={520} w={720} h={200} c={GREEN} s0={S[2]} head="KẾT LUẬN" body="lợi ích NHỎ · gần như không hại" size={40} />
    </>
  );
};

// ---------- 6 Frank–Starling ----------
const FS = (x: number) => 860 - 620 / (1 + Math.exp(-(x - 700) / 130));
const D6: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const pts = Array.from({length: 60}, (_, i) => 250 + i * (1450 / 59));
  const path = pts.map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${FS(x).toFixed(1)}`).join(' ');
  const k1 = ap(t, S[0] + 0.5, 1.2), k2 = ap(t, S[1] + 0.5, 1.2);
  const x1 = lerp(520, 760, k1), x2 = lerp(1250, 1500, k2);
  return (
    <>
      <Top idx={5} title="Đường cong Frank–Starling" />
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <path d="M250,880 L1720,880 M250,880 L250,180" stroke={K.dim} strokeWidth={5} />
        <text x={1720} y={940} fill={K.dim} fontSize={32} fontWeight={800} textAnchor="end" fontFamily={FONT}>tiền gánh (dịch) →</text>
        <text x={200} y={530} fill={K.dim} fontSize={32} fontWeight={800} textAnchor="middle" transform="rotate(-90 200 530)" fontFamily={FONT}>cung lượng tim →</text>
        <path d={path} stroke="#F2F7F9" strokeWidth={10} fill="none" />
        <g opacity={ap(t, S[0])}>
          <circle cx={520} cy={FS(520)} r={18} fill={GREEN} opacity={0.5} />
          <path d={`M520,${FS(520)} L${x1},${FS(x1)}`} stroke={GREEN} strokeWidth={8} strokeDasharray="14 10" />
          <circle cx={x1} cy={FS(x1)} r={26} fill={GREEN} />
          <path d={`M${x1 + 30},${FS(520)} L${x1 + 30},${FS(x1)}`} stroke={GREEN} strokeWidth={8} opacity={k1} />
          <text x={x1 + 50} y={(FS(520) + FS(x1)) / 2 + 12} fill={GREEN} fontSize={40} fontWeight={900} fontFamily={FONT} opacity={k1}>↑ cung lượng tim</text>
        </g>
        <g opacity={ap(t, S[1])}>
          <circle cx={1250} cy={FS(1250)} r={18} fill={RED} opacity={0.5} />
          <path d={`M1250,${FS(1250)} L${x2},${FS(x2)}`} stroke={RED} strokeWidth={8} strokeDasharray="14 10" />
          <circle cx={x2} cy={FS(x2)} r={26} fill={RED} />
          {[0, 1, 2].map((i) => {
            const dy = ((t * 60 + i * 40) % 120);
            return <path key={i} d={`M${1330 + i * 80},${300 + dy} q-14,26 0,36 q14,-10 0,-36z`} fill={WATER} opacity={k2 * (1 - dy / 120)} />;
          })}
          <text x={1180} y={190} fill={RED} fontSize={40} fontWeight={900} fontFamily={FONT}>ĐOẠN PHẲNG: chỉ gây PHÙ</text>
        </g>
        <text x={290} y={300} fill={GREEN} fontSize={40} fontWeight={900} fontFamily={FONT} opacity={ap(t, S[0])}>ĐOẠN DỐC: còn đáp ứng</text>
      </svg>
      <Panel x={1100} y={700} w={640} h={150} c={K.amber} s0={S[2]}>
        <Tx x={0} y={22} w={640} al="center" size={40} b={900}>Chỉ ~50% bệnh nhân sốc</Tx>
        <Tx x={0} y={80} w={640} al="center" size={36} c={K.amber} b={800}>còn đáp ứng dịch</Tx>
      </Panel>
    </>
  );
};

// ---------- 7 Nâng chân ----------
const D7: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const m = ap(t, S[0] + 1.2, 2);
  const bl = ap(t, S[1]);
  return (
    <>
      <Top idx={6} title="Nâng chân thụ động" />
      <Patient x={180} y={280} s={0.85} a={lerp(45, 0, m)} b={lerp(0, 45, m)} blood={bl} id="d7" />
      <div style={{position: 'absolute', left: 200, top: 990, fontFamily: FONT, fontSize: 36, fontWeight: 900, color: K.dim, opacity: ap(t, S[0])}}>{m < 0.5 ? '1 · nửa ngồi 45°' : '2 · nằm ngửa, nâng chân 45°'}</div>
      <Tx x={180} y={180} w={900} size={40} c={RED} b={900} a={bl}>~300 mL máu dồn về tim</Tx>
      <VtiBox x={1300} y={200} h={70} lab="trước: VTI 16 cm" c={K.dim} a={ap(t, S[2])} />
      <VtiBox x={1300} y={430} h={95} lab="sau: VTI 18,4 cm · +15% ✓" c={GREEN} a={ap(t, S[2] + 1)} />
      <Tx x={1260} y={660} w={560} al="center" size={36} c={GREEN} b={900} a={ap(t, S[2] + 1.5)}>tăng ≥ 10% → CÒN ĐÁP ỨNG</Tx>
      <div style={{position: 'absolute', left: 1260, top: 740, width: 560, padding: '16px 0', borderRadius: 22, background: K.amber, color: '#22303A', textAlign: 'center', fontFamily: FONT, fontSize: 30, fontWeight: 900, opacity: ap(t, S[3])}}>đo LƯU LƯỢNG, không đo huyết áp</div>
    </>
  );
};

// ---------- 8 CLASSIC · CLOVERS ----------
const D8: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const k1 = ap(t, S[0] + 0.5, 1.2), k2 = ap(t, S[1] + 0.5, 1.2);
  return (
    <>
      <Top idx={7} title="Hạn chế dịch hay tự do?" />
      <Tx x={200} y={160} w={700} al="center" size={44} b={900} a={ap(t, S[0])}>CLASSIC 2022</Tx>
      <Tx x={200} y={220} w={700} al="center" size={28} c={K.dim} b={800} a={ap(t, S[0])}>1554 bệnh nhân · tử vong 90 ngày</Tx>
      <VBar x={330} base={820} w={170} v={42.3} scale={10} k={k1} c={WATER} lab="hạn chế" />
      <VBar x={600} base={820} w={170} v={42.1} scale={10} k={k1} c={K.amber} lab="thông thường" />
      <Tx x={1020} y={160} w={700} al="center" size={44} b={900} a={ap(t, S[1])}>CLOVERS 2023</Tx>
      <Tx x={1020} y={220} w={700} al="center" size={28} c={K.dim} b={800} a={ap(t, S[1])}>1563 bệnh nhân · tử vong 90 ngày</Tx>
      <VBar x={1150} base={820} w={170} v={14.0} scale={10} k={k2} c={WATER} lab="vận mạch sớm" />
      <VBar x={1420} base={820} w={170} v={14.9} scale={10} k={k2} c={K.amber} lab="dịch tự do" />
      <GoldC y={920} a={ap(t, S[2])} size={42}>Tương đương · không có MỘT con số cho tất cả</GoldC>
    </>
  );
};

// ---------- 9 Quá tải ----------
const LUNG = 'M560,220 C420,260 360,520 380,760 C400,860 560,880 640,820 C700,760 700,400 660,260 Z M1000,220 C1140,260 1200,520 1180,760 C1160,860 1000,880 920,820 C860,760 860,400 900,260 Z';
const D9: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const lv = 860 - 380 * ap(t, S[0], 3);
  const wave = Array.from({length: 11}, (_, i) => `q50,${(i % 2 ? 1 : -1) * 14 * Math.sin(f / 8)} 100,0`).join(' ');
  return (
    <>
      <Top idx={8} title="Quá tải dịch" />
      <svg width={1920} height={1080} style={{position: 'absolute', left: -180, top: 0}}>
        <defs><clipPath id="lg9"><path d={LUNG} /></clipPath></defs>
        <path d={LUNG} fill="#E8A0A8" opacity={ap(t, S[0])} />
        <g clipPath="url(#lg9)"><path d={`M300,${lv} ${wave} L1400,1000 L300,1000 Z`} fill={WATER} opacity={0.75} /></g>
        <path d="M780,120 L780,300 M780,300 L640,380 M780,300 L920,380" stroke="#dfe9ee" strokeWidth={22} fill="none" strokeLinecap="round" opacity={ap(t, S[0])} />
      </svg>
      <Bullets x={1180} y={220} w={700} items={['Phù phổi', 'Phù thận', 'Phù ruột']} s0={[S[0] + 0.3, S[0] + 0.9, S[0] + 1.5]} c={WATER} size={44} />
      <Tx x={1180} y={530} w={700} size={36} c={RED} b={900} a={ap(t, S[1])}>Cân bằng dịch dương kéo dài → tử vong cao hơn</Tx>
      <div style={{position: 'absolute', left: 1180, top: 690, width: 660, height: 190, borderRadius: 28, background: PURP, color: '#fff', textAlign: 'center', fontFamily: FONT, opacity: ap(t, S[2])}}>
        <div style={{fontSize: 34, fontWeight: 900, marginTop: 30}}>SSC 2026 (MỚI)</div>
        <div style={{fontSize: 46, fontWeight: 900, marginTop: 8}}>chủ động RÚT DỊCH</div>
        <div style={{fontSize: 28, fontWeight: 700, marginTop: 4}}>lợi tiểu · lọc máu khi đã ổn định</div>
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
      <VtiBox x={140} y={200} h={95} lab="Lần 1: VTI +15% → thêm 500 mL" c={GREEN} a={ap(t, S[0])} fs={24} />
      <VtiBox x={720} y={200} h={60} lab="Lần 2: VTI +4% → NGỪNG dịch" c={RED} a={ap(t, S[1])} fs={24} />
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        {(() => {
          const pts = Array.from({length: 50}, (_, i) => 200 + i * (1000 / 49));
          const fs = (x: number) => 900 - 360 / (1 + Math.exp(-(x - 600) / 120));
          const p = pts.map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${fs(x).toFixed(1)}`).join(' ');
          const x = t < S[1] ? lerp(480, 760, ap(t, S[0] + 0.5, 1.2)) : lerp(760, 1000, ap(t, S[1] + 0.5, 1.2));
          return (
            <g opacity={ap(t, S[0])}>
              <path d={p} stroke="#F2F7F9" strokeWidth={8} fill="none" />
              <circle cx={x} cy={fs(x)} r={24} fill={t < S[1] ? GREEN : RED} />
            </g>
          );
        })()}
      </svg>
      <Card x={1300} y={460} w={540} h={260} c={RED} s0={S[2]} head="MAP VẪN THẤP" body="→ norepinephrine (Bài 5)" size={40} />
    </>
  );
};

// ---------- 11 Ôn tập ----------
const D11: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const nx = usePop(S[2] + 0.3);
  const items: [string, string, number][] = [['Liều nhỏ', WATER, S[0]], ['Đánh giá lại', K.amber, S[0] + 0.5], ['Dịch cân bằng', GREEN, S[0] + 1], ['Nâng chân', RED, S[1]], ['Rút dịch', PURP, S[1] + 0.6]];
  return (
    <>
      <Top idx={10} title="Ôn tập" />
      <div style={{position: 'absolute', left: 100, top: 230, width: 1720, display: 'flex', flexWrap: 'wrap', gap: 30, justifyContent: 'center', fontFamily: FONT}}>
        {items.map(([w, c, s0]) => {
          const a = ap(t, s0);
          return <div key={w} style={{width: 520, height: 170, borderRadius: 30, border: `5px solid ${c}`, background: `${c}1c`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 54, fontWeight: 900, color: K.txt, opacity: a, transform: `scale(${0.85 + 0.15 * a})`}}>{w}</div>;
        })}
      </div>
      {nx > 0.01 && (
        <div style={{position: 'absolute', left: 510, top: 720, width: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '16px 0', borderRadius: 999, border: `2px solid ${K.amber}`, background: 'rgba(245,184,61,.08)', fontFamily: FONT, opacity: Math.min(1, nx * 1.5)}}>
          <span style={{fontSize: 28, fontWeight: 800, color: K.amber, letterSpacing: 1}}>BÀI 5</span>
          <span style={{fontSize: 34, fontWeight: 700, color: K.txt}}>Vận mạch · chọn thuốc nào, thứ tự nào?</span>
        </div>
      )}
    </>
  );
};

const SC: React.FC<{S: number[]; D: number[]}>[] = [D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11];

export const Soc4: React.FC = () => (
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
