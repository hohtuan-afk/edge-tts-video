// Giải mã điện giải · Bài 2: Hạ natri máu — chẩn đoán (11 cảnh)
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
const NAMES = ['MỞ ĐẦU', 'ĐỊNH NGHĨA', 'CÂU 1', 'CÂU 2', 'CÂU 3', 'CÂU 4', 'Na NIỆU > 30', 'SIAD', 'NGUYÊN NHÂN', 'CA BỆNH', 'ÔN TẬP'];

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
      <Tx x={44} y={22} size={24} c={K.dim} b={600}>GIẢI MÃ ĐIỆN GIẢI · BÀI 2</Tx>
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

// ---------- Tiện ích bài 2 ----------
const QN = ['ALTT máu', 'ALTT niệu', 'Na⁺ niệu', 'Thể tích'];
const Steps4: React.FC<{cur: number}> = ({cur}) => {
  const t = useSec();
  return (
    <div style={{position: 'absolute', left: 50, top: 180, width: 380, display: 'flex', flexDirection: 'column', gap: 22, fontFamily: FONT, opacity: ap(t, 0.05)}}>
      {QN.map((q, i) => {
        const on = i === cur, done = i < cur;
        return (
          <div key={q} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '18px 22px', borderRadius: 20, background: on ? 'rgba(245,184,61,.18)' : 'rgba(255,255,255,.04)', border: `3px solid ${on ? K.amber : done ? K.green : K.line}`, boxShadow: on ? '0 0 30px rgba(245,184,61,.35)' : 'none', transform: `scale(${on ? 1.04 : 1})`}}>
            <div style={{width: 58, height: 58, borderRadius: '50%', background: on ? K.amber : done ? K.green : 'rgba(255,255,255,.12)', color: on || done ? K.ink : K.dim, fontSize: 34, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>{done ? '✓' : i + 1}</div>
            <div style={{fontSize: 36, fontWeight: 800, color: on ? K.txt : done ? K.txt : K.dim, whiteSpace: 'nowrap'}}>{chem(q)}</div>
          </div>
        );
      })}
    </div>
  );
};
// thước ngưỡng ngang
const Gauge: React.FC<{x: number; y: number; w: number; min: number; max: number; cut: number; a: number; cL: string; cR: string; lL: string; lR: string; v?: number; va?: number; unit?: string}> = ({x, y, w, min, max, cut, a, cL, cR, lL, lR, v, va = 0, unit = ''}) => {
  const px = (q: number) => ((q - min) / (max - min)) * w;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: 170, opacity: a, fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 0, top: 40, width: px(cut), height: 64, background: cL, borderRadius: '32px 0 0 32px'}} />
      <div style={{position: 'absolute', left: px(cut), top: 40, width: w - px(cut), height: 64, background: cR, borderRadius: '0 32px 32px 0'}} />
      <div style={{position: 'absolute', left: px(cut) - 3, top: 26, width: 6, height: 92, background: K.txt, borderRadius: 3}} />
      <div style={{position: 'absolute', left: px(cut) - 100, top: -16, width: 200, textAlign: 'center', fontSize: 36, fontWeight: 900, color: K.txt}}>{cut}</div>
      <div style={{position: 'absolute', left: 0, top: 116, width: px(cut), textAlign: 'center', fontSize: 34, fontWeight: 900, color: cL}}>{chem(lL)}</div>
      <div style={{position: 'absolute', left: px(cut), top: 116, width: w - px(cut), textAlign: 'center', fontSize: 34, fontWeight: 900, color: cR}}>{chem(lR)}</div>
      {v !== undefined ? <div style={{position: 'absolute', left: px(v) - 16, top: 24, width: 32, height: 96, borderRadius: 16, background: '#fff', boxShadow: '0 0 24px #fff', opacity: va}} /> : null}
      <div style={{position: 'absolute', right: -10, top: 54, transform: 'translateX(100%)', fontSize: 26, color: K.dim}}>{unit}</div>
    </div>
  );
};
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
const D1: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const f = useCurrentFrame();
  return (
    <>
      <Top idx={0} title="Hạ natri máu: chẩn đoán" />
      <Slip s0={S[0]} x={140} y={210} title="CỤ BÀ 78 TUỔI · LƠ MƠ" rows={[['na', 'Na⁺', '121', 'mmol/L'], ['k', 'K⁺', '3,9', 'mmol/L'], ['glu', 'Glucose', '6,0', 'mmol/L']]} hl={['na']} />
      <div style={{position: 'absolute', left: 680, top: 170, width: 1100, textAlign: 'center', fontFamily: FONT, fontSize: 200, fontWeight: 900, color: K.amber, opacity: ap(t, S[1]), transform: `scale(${1 + 0.03 * Math.sin(f / 7)})`}}>?</div>
      <div style={{position: 'absolute', left: 620, top: 470, width: 1220, display: 'flex', gap: 18, justifyContent: 'center', fontFamily: FONT}}>
        {QN.map((q, i) => {
          const a = ap(t, S[2] + 0.5 + i * 0.4);
          return (
            <div key={q} style={{width: 280, padding: '24px 0', borderRadius: 24, background: 'rgba(245,184,61,.1)', border: `3px solid ${K.amber}`, textAlign: 'center', opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>
              <div style={{fontSize: 30, fontWeight: 800, color: K.amber}}>CÂU {i + 1}</div>
              <div style={{fontSize: 38, fontWeight: 900, color: K.txt, marginTop: 8}}>{chem(q)}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ---------- 2 Định nghĩa ----------
const D2: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const X = 260, W = 1400, min = 115, max = 140;
  const px = (q: number) => X + ((q - min) / (max - min)) * W;
  const zones: [number, number, string, string][] = [[115, 125, K.o2, 'NẶNG'], [125, 130, K.hco3, 'VỪA'], [130, 135, K.amber, 'NHẸ'], [135, 140, K.green, 'BÌNH THƯỜNG']];
  return (
    <>
      <Top idx={1} title="Định nghĩa và mức độ" />
      <GoldC y={160} a={ap(t, S[0])} size={48}>Hạ natri: Na⁺ &lt; 135 mmol/L</GoldC>
      {zones.map(([a0, b0, c, l], i) => {
        const a = ap(t, S[1] + i * 0.5);
        return (
          <React.Fragment key={l}>
            <div style={{position: 'absolute', left: px(a0) + 3, top: 320, width: px(b0) - px(a0) - 6, height: 80, borderRadius: 14, background: c, opacity: a}} />
            <div style={{position: 'absolute', left: px(a0), top: 410, width: px(b0) - px(a0), textAlign: 'center', fontFamily: FONT, fontSize: 32, fontWeight: 900, color: c, opacity: a}}>{l}</div>
          </React.Fragment>
        );
      })}
      {[125, 130, 135].map((q) => <div key={q} style={{position: 'absolute', left: px(q) - 60, top: 272, width: 120, textAlign: 'center', fontFamily: FONT, fontSize: 32, fontWeight: 800, color: K.txt, opacity: ap(t, S[1])}}>{q}</div>)}
      <Card x={260} y={500} w={560} h={170} c={K.co2} s0={S[2]} head="CẤP" body="< 48 giờ" size={48} />
      <Card x={860} y={500} w={560} h={170} c={PURPLE} s0={S[2] + 0.6} head="MẠN" body="≥ 48 giờ" size={48} />
      <Panel x={260} y={700} w={1400} h={120} c={K.o2} s0={S[3]} glow={ap(t, S[3] + 1)}>
        <Tx x={0} y={32} w={1400} al="center" size={40} b={800}>Nôn · co giật · hôn mê → XỬ TRÍ TRƯỚC, chẩn đoán sau</Tx>
      </Panel>
    </>
  );
};

// ---------- 3 Câu 1: ALTT máu ----------
const D3: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={2} title="Câu 1: ALTT máu có thấp không?" />
      <Steps4 cur={0} />
      <Card x={500} y={190} w={420} h={260} c={K.green} s0={S[0] + 0.8} head="THẤP < 275" body="Hạ natri THẬT → hỏi tiếp" size={38} />
      <Card x={950} y={190} w={420} h={260} c={K.co2} s0={S[1]} head="BÌNH THƯỜNG" body="Giả hạ natri" sub="mỡ máu, protein rất cao" size={42} />
      <Card x={1400} y={190} w={420} h={260} c={K.o2} s0={S[2]} head="TĂNG" body="Đường máu cao · mannitol" size={38} />
      <Panel x={500} y={500} w={1320} h={220} c={K.amber} s0={S[3]}>
        <Tx x={0} y={26} w={1320} al="center" size={30} c={K.amber} b={800}>HIỆU CHỈNH THEO ĐƯỜNG MÁU</Tx>
        <Tx x={0} y={86} w={1320} al="center" size={50} b={900}>Glucose ↑ 5,5 mmol/L → Na⁺ ↓ ≈ 1,6–2,4</Tx>
      </Panel>
    </>
  );
};

// ---------- 4 Câu 2: ALTT niệu ----------
const D4: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={3} title="Câu 2: ALTT niệu" />
      <Steps4 cur={1} />
      <Tx x={500} y={180} w={1320} al="center" size={38} c={K.dim} b={700} a={ap(t, S[0])}>ADH đang BẬT hay TẮT?</Tx>
      <Gauge x={540} y={270} w={1200} min={0} max={600} cut={100} a={ap(t, S[0] + 0.5)} cL={WATER} cR={K.amber} lL="ADH TẮT" lR="ADH BẬT" unit="mOsm/kg" />
      <Panel x={500} y={490} w={640} h={330} c={WATER} s0={S[1]}>
        <Tx x={0} y={24} w={640} al="center" size={30} c={WATER} b={800}>&lt; 100 · THẢI NƯỚC TỐI ĐA</Tx>
        <Bullets x={30} y={90} w={580} items={['Uống quá nhiều nước', 'Uống nhiều bia', 'Ăn quá ít đạm']} s0={[S[2], S[2] + 0.6, S[2] + 1.2]} c={WATER} />
      </Panel>
      <Panel x={1180} y={490} w={640} h={330} c={K.amber} s0={S[3]} glow={ap(t, S[3] + 1)}>
        <Tx x={0} y={24} w={640} al="center" size={30} c={K.amber} b={800}>&gt; 100 · ADH ĐANG HOẠT ĐỘNG</Tx>
        <Tx x={0} y={130} w={640} al="center" size={50} b={900}>→ Hỏi tiếp câu 3</Tx>
      </Panel>
    </>
  );
};

// ---------- 5 Câu 3: Na niệu ----------
const D5: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={4} title="Câu 3: Na⁺ niệu" />
      <Steps4 cur={2} />
      <Gauge x={540} y={210} w={1200} min={0} max={120} cut={30} a={ap(t, S[0])} cL={K.co2} cR={K.hco3} lL="≤ 30" lR="> 30" unit="mmol/L" />
      <Panel x={500} y={430} w={640} h={390} c={K.co2} s0={S[1]}>
        <Tx x={0} y={24} w={640} al="center" size={30} c={K.co2} b={800}>THẬN ĐANG GIỮ MUỐI</Tx>
        <Tx x={20} y={74} w={600} al="center" size={36} b={800}>Thể tích tuần hoàn hiệu dụng THẤP</Tx>
        <Bullets x={30} y={190} w={580} items={['Mất qua tiêu hoá', 'Suy tim', 'Xơ gan', 'Hội chứng thận hư']} s0={[S[2], S[2] + 0.5, S[2] + 1, S[2] + 1.5]} c={K.co2} size={30} />
      </Panel>
      <Panel x={1180} y={430} w={640} h={390} c={K.hco3} s0={S[3]} glow={ap(t, S[3] + 1)}>
        <Tx x={0} y={24} w={640} al="center" size={30} c={K.hco3} b={800}>THẬN ĐANG MẤT MUỐI</Tx>
        <Tx x={20} y={120} w={600} al="center" size={44} b={900}>Mất muối qua thận</Tx>
        <Tx x={20} y={210} w={600} al="center" size={44} b={900} c={K.amber}>hoặc SIAD</Tx>
      </Panel>
    </>
  );
};

// ---------- 6 Câu 4: Thể tích ----------
const D6: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={5} title="Câu 4: thể tích dịch ngoại bào" />
      <Steps4 cur={3} />
      <Card x={500} y={190} w={420} h={200} c={NA} s0={S[1]} head="GIẢM" body="Khô, mạch nhanh" size={38} />
      <Card x={950} y={190} w={420} h={200} c={K.green} s0={S[1] + 0.6} head="BÌNH THƯỜNG" body="Không phù, không khô" size={36} />
      <Card x={1400} y={190} w={420} h={200} c={WATER} s0={S[1] + 1.2} head="TĂNG" body="Phù · báng bụng" size={38} />
      <Panel x={500} y={430} w={1320} h={150} c={K.o2} s0={S[2]} glow={ap(t, S[2] + 1)}>
        <Tx x={0} y={44} w={1320} al="center" size={44} b={800}>⚠ Khám lâm sàng đánh giá thể tích KÉM chính xác</Tx>
      </Panel>
      <div style={{position: 'absolute', left: 500, top: 640, width: 1320, display: 'flex', justifyContent: 'center', opacity: ap(t, S[3])}}>
        <div style={{padding: '14px 36px', borderRadius: 18, background: 'linear-gradient(135deg,#FFD46B,#F5B83D)', color: K.ink, fontFamily: FONT, fontSize: 46, fontWeight: 900, boxShadow: '0 12px 30px rgba(0,0,0,.45)', transform: `scale(${0.88 + 0.12 * ap(t, S[3])})`}}>Châu Âu: xét Na⁺ niệu TRƯỚC, thể tích SAU</div>
      </div>
    </>
  );
};

// ---------- 7 Na niệu > 30 ----------
const D7: React.FC<{S: number[]; D: number[]}> = ({S}) => (
  <>
    <Top idx={6} title="Na⁺ niệu > 30: nghĩ gì?" />
    <Check x={260} y={180} w={1400} items={['Thuốc lợi tiểu · thiazide (người già)', 'Suy thượng thận', 'Nôn ói', 'Bệnh thận mất muối']} s0={[S[1], S[2], S[2] + 0.8, S[2] + 1.6]} />
    <Res x={560} y={760} s0={S[3]} c={K.amber}>Không có các nguyên nhân trên → SIAD</Res>
  </>
);

// ---------- 8 SIAD tiêu chuẩn ----------
const D8: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const g = 0.5 + 0.5 * Math.sin(f / 10);
  return (
    <>
      <Top idx={7} title="SIAD: tiết ADH không thích hợp" />
      <Pic src="dg_nao.png" x={40} y={200} w={620} a={ap(t, S[0])} glow={`rgba(255,214,90,${0.25 + 0.35 * g})`} />
      <Tx x={60} y={800} w={600} al="center" size={30} c={K.amber} b={800} a={ap(t, S[0] + 0.6)}>ADH vẫn tiết dù máu đang loãng</Tx>
      <Check x={720} y={180} w={1120} items={['ALTT máu < 275', 'ALTT niệu > 100', 'Na⁺ niệu > 30', 'Thể tích BÌNH THƯỜNG']} s0={[S[1], S[1] + 0.9, S[1] + 1.8, S[2]]} />
      <Panel x={720} y={740} w={1120} h={110} c={K.o2} s0={S[3]}>
        <Tx x={0} y={30} w={1120} al="center" size={38} b={800}>Loại trừ: suy giáp · suy thượng thận · lợi tiểu</Tx>
      </Panel>
    </>
  );
};

// ---------- 9 Nguyên nhân SIAD ----------
const D9: React.FC<{S: number[]; D: number[]}> = ({S}) => (
  <>
    <Top idx={8} title="Nguyên nhân SIAD" />
    <Card x={160} y={200} w={500} h={230} c={K.co2} s0={S[1]} head="PHỔI" body="Viêm phổi" size={46} />
    <Card x={710} y={200} w={500} h={230} c={PURPLE} s0={S[1] + 1.2} head="NÃO" body="Đột quỵ · chấn thương" size={42} />
    <Card x={1260} y={200} w={500} h={230} c={K.amber} s0={S[2]} head="THUỐC" body="SSRI · carbamazepine" size={40} />
    <Card x={160} y={470} w={760} h={230} c={K.o2} s0={S[2] + 1.6} head="UNG THƯ" body="Phổi tế bào nhỏ" size={46} />
    <Card x={1000} y={470} w={760} h={230} c={K.green} s0={S[3]} head="KÍCH THÍCH ADH" body="Đau · nôn · sau phẫu thuật" size={42} />
  </>
);

// ---------- 10 Ca số 1 & 2 ----------
const D10: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const a1 = 1 - ap(t, S[3] - 0.4, 0.35);
  const a2 = ap(t, S[3]);
  return (
    <>
      <Top idx={9} title={a2 > 0.5 ? 'Ca số 2: xơ gan' : 'Ca số 1: cụ bà 78 tuổi'} />
      <div style={{position: 'absolute', inset: 0, opacity: a1}}>
        <Slip s0={S[0]} x={60} y={170} sw={540} nw={240} title="CA SỐ 1" rows={[['na', 'Na⁺', '121', ''], ['sosm', 'ALTT máu', '255', ''], ['glu', 'Glucose', '6,0', ''], ['uosm', 'ALTT niệu', '420', ''], ['una', 'Na⁺ niệu', '48', '']]} hl={t > S[1] ? ['uosm', 'una'] : ['na', 'sosm']} />
        <Step x={660} y={190} s0={S[0] + 1.2} c={K.green}>① ALTT máu 255 → hạ natri thật</Step>
        <Step x={660} y={270} s0={S[1] + 0.4}>② ALTT niệu 420 → ADH đang bật</Step>
        <Step x={660} y={350} s0={S[1] + 1.4}>③ Na⁺ niệu 48 → &gt; 30</Step>
        <Step x={660} y={430} s0={S[1] + 2.4}>④ Không phù · không lợi tiểu</Step>
        <Step x={660} y={530} s0={S[2]} c={K.amber}>💊 Đang dùng sertraline (SSRI)</Step>
        <Res x={660} y={620} s0={S[2] + 1.8} c={K.amber}>SIAD do thuốc</Res>
        <Tx x={660} y={730} w={1140} size={30} c={K.dim} b={700} a={ap(t, S[2] + 2.6)}>sau khi kiểm tra chức năng giáp, cortisol</Tx>
      </div>
      <div style={{position: 'absolute', inset: 0, opacity: a2}}>
        {a2 > 0.01 ? <Slip s0={S[3]} x={60} y={170} sw={540} nw={240} title="CA SỐ 2 · XƠ GAN, BÁNG BỤNG" rows={[['na', 'Na⁺', '126', ''], ['una', 'Na⁺ niệu', '10', '']]} hl={['una']} /> : null}
        <Step x={660} y={200} s0={S[3] + 0.8}>③ Na⁺ niệu 10 → ≤ 30: thận giữ muối</Step>
        <Step x={660} y={280} s0={S[3] + 1.8}>④ Phù, báng bụng → thể tích TĂNG</Step>
        <Res x={660} y={400} s0={S[4]} c={WATER}>Hạ natri thừa dịch</Res>
        <Tx x={660} y={510} w={1140} size={38} c={K.txt} b={800} a={ap(t, S[4] + 1)}>…nhưng thể tích tuần hoàn hiệu dụng THẤP</Tx>
      </div>
    </>
  );
};

// ---------- 11 Ôn tập ----------
const D11: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const nx = usePop(S[2] + 0.3);
  return (
    <>
      <Top idx={10} title="Ôn tập: 4 câu hỏi" />
      <Check x={260} y={170} w={1400} items={['ALTT máu: hạ natri thật hay giả?', 'ALTT niệu: ADH bật hay tắt?', 'Na⁺ niệu: thận giữ hay mất muối?', 'Thể tích: giảm · bình thường · tăng']} s0={[S[0] + 0.4, S[0] + 2.4, S[1] + 0.3, S[1] + 1.5]} />
      {nx > 0.01 && (
        <div style={{position: 'absolute', left: 560, top: 770, width: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '16px 0', borderRadius: 999, border: `2px solid ${K.amber}`, background: 'rgba(245,184,61,.08)', fontFamily: FONT, opacity: Math.min(1, nx * 1.5)}}>
          <span style={{fontSize: 28, fontWeight: 800, color: K.amber, letterSpacing: 1}}>BÀI 3</span>
          <span style={{fontSize: 34, fontWeight: 700, color: K.txt}}>Hạ natri: xử trí an toàn</span>
        </div>
      )}
    </>
  );
};

const SC: React.FC<{S: number[]; D: number[]}>[] = [D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11];

export const Dg2: React.FC = () => (
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
