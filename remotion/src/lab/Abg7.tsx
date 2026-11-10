// Giải mã khí máu · Bài 7: Rối loạn toan kiềm hỗn hợp (10 cảnh)
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
const NAMES = ['MỞ ĐẦU', 'MANH MỐI 1', 'MANH MỐI 2', 'MANH MỐI 3–4', 'CA G', 'CA H', 'CA I', 'GIẢI CA I', 'TỔNG KẾT', 'ÔN TẬP'];

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
      <Tx x={44} y={22} size={24} c={K.dim} b={600}>GIẢI MÃ KHÍ MÁU · BÀI 7</Tx>
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

// ---------- 1 Mở đầu ----------
const G1: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const L: [string, string, number, number][] = [['Toan chuyển hoá', K.o2, -520, 0], ['Toan hô hấp', '#E5848D', 0, 0.5], ['Kiềm chuyển hoá', K.hco3, 520, 1]];
  return (
    <>
      <Top idx={0} title="Rối loạn toan kiềm hỗn hợp" />
      {L.map(([w, c, dx, d], i) => {
        const a = ap(t, S[0] + d);
        return <div key={w} style={{position: 'absolute', left: 960 + dx - 230, top: 280 + Math.sin(f / 20 + i * 2) * 10, width: 460, padding: '40px 0', textAlign: 'center', borderRadius: 30, background: `${c}30`, border: `4px solid ${c}`, fontFamily: FONT, fontSize: 44, fontWeight: 900, color: K.txt, opacity: a, transform: `rotate(${(i - 1) * 4}deg)`, boxShadow: '0 20px 40px rgba(0,0,0,.4)'}}>{w}</div>;
      })}
      <Res x={620} y={560} s0={S[1]} c={K.amber}>pH bình thường ≠ không rối loạn</Res>
      <Memo x={660} y={720} w={600} s0={S[2] + 0.3} size={44}>4 manh mối · 3 ca bệnh</Memo>
    </>
  );
};

// ---------- 2 Manh mối 1 ----------
const G2: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const X0 = 260, W = 1400;
  const mv = interpolate(t, [S[1], S[1] + 1.2, S[1] + D[1] * 0.55, S[1] + D[1] * 0.55 + 1.2], [0.5, 0.12, 0.12, 0.88], clamp);
  return (
    <>
      <Top idx={1} title="Manh mối 1 · Bù trừ không đúng dự kiến" />
      <Tx x={X0} y={200} w={W} al="center" size={40} b={800} a={ap(t, S[0])}>So sánh giá trị thật với khoảng dự kiến</Tx>
      <div style={{position: 'absolute', left: X0, top: 380, width: W, height: 16, borderRadius: 8, background: 'rgba(255,255,255,.15)', opacity: ap(t, S[0])}} />
      <div style={{position: 'absolute', left: X0 + W * 0.38, top: 350, width: W * 0.24, height: 76, borderRadius: 18, background: 'rgba(63,178,127,.45)', border: `4px solid ${K.green}`, opacity: ap(t, S[0] + 0.4)}} />
      <Tx x={X0 + W * 0.38} y={440} w={W * 0.24} al="center" size={32} c={K.green} b={800} a={ap(t, S[0] + 0.4)}>dự kiến</Tx>
      <div style={{position: 'absolute', left: X0 + W * mv - 26, top: 362, width: 52, height: 52, borderRadius: '50%', background: K.txt, border: `8px solid ${mv > 0.38 && mv < 0.62 ? K.green : K.o2}`, opacity: ap(t, S[0] + 0.8)}} />
      <Res x={560} y={530} s0={S[1] + 1} c={K.o2}>Lệch dự kiến → có rối loạn thứ hai</Res>
      <Memo x={460} y={720} w={1000} s0={S[2] + 0.3} size={42}>Bù trừ hiếm khi đưa pH về hẳn bình thường</Memo>
    </>
  );
};

// ---------- 3 Manh mối 2 ----------
const Pair: React.FC<{x: number; s0: number; a1: string; a2: string; c: string; label: string}> = ({x, s0, a1, a2, c, label}) => {
  const t = useSec();
  const a = ap(t, s0);
  return (
    <div style={{position: 'absolute', left: x, top: 260, width: 520, height: 520, borderRadius: 30, background: `${c}18`, border: `4px solid ${c}`, fontFamily: FONT, textAlign: 'center', opacity: a, transform: `scale(${0.9 + 0.1 * a})`}}>
      <div style={{display: 'flex', justifyContent: 'center', gap: 70, marginTop: 40}}>
        <div><div style={{fontSize: 40, fontWeight: 800, color: K.co2}}>{chem('PaCO₂')}</div><div style={{fontSize: 150, fontWeight: 900, color: K.txt, lineHeight: 1.1}}>{a1}</div></div>
        <div><div style={{fontSize: 40, fontWeight: 800, color: K.hco3}}>{chem('HCO₃⁻')}</div><div style={{fontSize: 150, fontWeight: 900, color: K.txt, lineHeight: 1.1}}>{a2}</div></div>
      </div>
      <div style={{fontSize: 40, fontWeight: 900, color: c, marginTop: 40, padding: '0 20px'}}>{label}</div>
    </div>
  );
};
const G3: React.FC<{S: number[]; D: number[]}> = ({S}) => (
  <>
    <Top idx={2} title="Manh mối 2 · Đi ngược chiều" />
    <Pair x={120} s0={S[1]} a1="↑" a2="↑" c={K.green} label="Cùng chiều = bù trừ" />
    <Pair x={700} s0={S[2]} a1="↑" a2="↓" c={K.o2} label="Toan HH + toan CH" />
    <Pair x={1280} s0={S[3]} a1="↓" a2="↑" c="#7DA8F0" label="Kiềm HH + kiềm CH" />
  </>
);

// ---------- 4 Manh mối 3–4 ----------
const G4: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const X0 = 360, W = 1200;
  const px = (v: number) => X0 + (v / 3) * W;
  return (
    <>
      <Top idx={3} title="Manh mối 3 và 4" />
      <Card x={160} y={180} w={760} h={220} c={K.amber} s0={S[0]} head="MANH MỐI 3" body="Luôn tính AG, kể cả khi pH bình thường" size={40} />
      <Card x={1000} y={180} w={760} h={220} c={K.co2} s0={S[1]} head="MANH MỐI 4" body="Delta–delta khi AG tăng" size={40} />
      <div style={{position: 'absolute', left: px(0), top: 520, width: px(1) - px(0), height: 70, background: K.co2, borderRadius: '35px 0 0 35px', opacity: ap(t, S[2])}} />
      <div style={{position: 'absolute', left: px(1), top: 520, width: px(2) - px(1), height: 70, background: K.green, opacity: ap(t, S[2])}} />
      <div style={{position: 'absolute', left: px(2), top: 520, width: px(3) - px(2), height: 70, background: K.hco3, borderRadius: '0 35px 35px 0', opacity: ap(t, S[2])}} />
      {[0, 1, 2, 3].map((v) => <Tx key={v} x={px(v) - 30} y={600} w={60} al="center" size={30} c={K.dim} b={700} a={ap(t, S[2])}>{String(v)}</Tx>)}
      <Tx x={px(0)} y={660} w={px(1) - px(0)} al="center" size={30} c={K.co2} b={800} a={ap(t, S[2] + 0.3)}>{'< 1: + toan AG bình thường'}</Tx>
      <Tx x={px(1)} y={660} w={px(2) - px(1)} al="center" size={30} c={K.green} b={800} a={ap(t, S[2] + 0.3)}>đơn thuần</Tx>
      <Tx x={px(2)} y={660} w={px(3) - px(2)} al="center" size={30} c={K.hco3} b={800} a={ap(t, S[2] + 0.6)}>{'> 2: + kiềm chuyển hoá'}</Tx>
    </>
  );
};

// ---------- 5 Ca G ----------
const G5: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={4} title="Ca G · vừa hồi sức ngưng tim" />
      <Slip s0={S[0]} rows={ROWS_G} hl={t > S[3] ? ['co2', 'hco3'] : t > S[2] ? ['co2', 'hco3'] : t > S[1] ? ['ph', 'co2', 'hco3'] : []} title="CA G" y={190} />
      <Step y={200} s0={S[2]} c={K.o2}>PaCO₂ ↑ · HCO₃⁻ ↓ → NGƯỢC CHIỀU!</Step>
      <Gold x={680} y={290} a={ap(t, S[3])} size={40}>Winter: 1,5 × 13 + 8 ≈ 27,5 ± 2</Gold>
      <Step y={400} s0={S[3] + 1.2}>PaCO₂ thật 50 ≫ 27,5</Step>
      <Res x={680} y={500} s0={S[4]} c={K.o2}>Toan chuyển hoá + toan hô hấp</Res>
      <Step y={640} s0={S[4] + 1.5} c={K.amber}>Hai rối loạn cộng dồn → pH rất thấp</Step>
    </>
  );
};

// ---------- 6 Ca H ----------
const G6: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={5} title="Ca H · sốt, lơ mơ, thở nhanh" />
      <Slip s0={S[0]} rows={ROWS_H} hl={t > S[4] ? ['co2'] : t > S[3] ? ['ag'] : t > S[2] ? ['ph', 'co2', 'hco3'] : []} title="CA H" y={190} />
      <Step y={200} s0={S[2]} c={K.green}>pH bình thường… nhưng HCO₃⁻, PaCO₂ rất thấp</Step>
      <Res x={680} y={280} s0={S[3]} c={K.o2}>AG 23 → toan CH tăng AG</Res>
      <Step y={420} s0={S[4]}>Winter ≈ 27,5 ± 2 · PaCO₂ thật 20</Step>
      <Res x={680} y={490} s0={S[4] + 1.5} c="#7DA8F0">+ kiềm hô hấp</Res>
      <Panel x={680} y={650} w={1100} h={140} c={K.amber} s0={S[5]}>
        <Tx x={0} y={42} w={1100} al="center" size={44} b={900}>Nghĩ: nhiễm khuẩn huyết · salicylate</Tx>
      </Panel>
    </>
  );
};

// ---------- 7 Ca I ----------
const G7: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const f = useCurrentFrame();
  return (
    <>
      <Top idx={6} title="Ca I · đái tháo đường, nôn ói" />
      <Slip s0={S[0]} rows={t > S[3] ? ROWS_I : ROWS_I.slice(0, 3)} hl={t > S[3] ? ['na', 'cl', 'hco3'] : t > S[1] ? ['ph', 'co2', 'hco3'] : []} title="CA I" y={170} />
      <div style={{position: 'absolute', left: 720, top: 230, fontFamily: FONT, opacity: ap(t, S[2]) * (1 - ap(t, S[3]) * 0.6)}}>
        <div style={{fontSize: 90, fontWeight: 900, color: K.green, transform: `rotate(${Math.sin(f / 10) * 2}deg)`}}>✓ ✓ ✓ hoàn hảo?</div>
      </div>
      <Gold x={680} y={450} a={ap(t, S[3])} size={44}>AG = 140 − (90 + 24) = 26</Gold>
      <Res x={680} y={580} s0={S[3] + 1.5} c={K.o2}>AG TĂNG!</Res>
    </>
  );
};

// ---------- 8 Giải ca I ----------
const G8: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={7} title="Giải ca I" />
      <GoldC y={180} a={ap(t, S[0])} size={46}>Δ/Δ = (26 − 12) ÷ (24 − 24) → rất lớn</GoldC>
      <Card x={160} y={340} w={760} h={240} c={K.o2} s0={S[1]} head="AG TĂNG" body="Nhiễm toan ceton" size={52} />
      <Big x={880} y={380} w={160} a={ap(t, S[1] + 0.5)} size={110} c={K.amber}>+</Big>
      <Card x={1000} y={340} w={760} h={240} c={K.hco3} s0={S[1] + 0.8} head="Δ/Δ > 2" body="Kiềm chuyển hoá do nôn" size={52} />
      <Res x={620} y={630} s0={S[1] + 2} c={K.green}>Triệt tiêu nhau → pH 7,40</Res>
      <Memo x={460} y={780} w={1000} s0={S[2] + 0.3} size={42}>Không tính AG → bỏ sót cả hai</Memo>
    </>
  );
};

// ---------- 9 Tổng kết ----------
const G9: React.FC<{S: number[]; D: number[]}> = ({S}) => (
  <>
    <Top idx={8} title="Cộng dồn hay triệt tiêu?" />
    <Card x={160} y={240} w={760} h={250} c={K.o2} s0={S[0]} head="CA G · CỘNG DỒN" body="Toan + toan → pH 7,04" size={52} glow={0.3} />
    <Card x={1000} y={240} w={760} h={250} c={K.green} s0={S[1]} head="CA H · CA I · TRIỆT TIÊU" body="Toan + kiềm → pH bình thường" size={48} glow={0.3} />
    <Memo x={460} y={640} w={1000} s0={S[2] + 0.3} size={46}>pH bình thường vẫn đọc đủ 6 bước</Memo>
  </>
);

// ---------- 10 Ôn tập ----------
const CLUES = ['Bù trừ đúng dự kiến?', 'PaCO₂ và HCO₃⁻ ngược chiều?', 'Luôn tính AG', 'Delta–delta'];
const G10: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const nx = usePop(S[2] + 0.3);
  return (
    <>
      <Top idx={9} title="Ôn tập: 4 manh mối" />
      <div style={{position: 'absolute', left: 160, top: 180, width: 1600, display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 26, fontFamily: FONT}}>
        {CLUES.map((q, i) => {
          const p = ap(t, (i < 2 ? S[0] : S[1]) + (i % 2) * 1.0);
          return (
            <div key={q} style={{height: 170, borderRadius: 24, background: 'rgba(245,184,61,.1)', border: `4px solid ${K.amber}`, display: 'flex', alignItems: 'center', gap: 30, padding: '0 40px', opacity: p, transform: `scale(${0.85 + 0.15 * p})`}}>
              <div style={{width: 90, height: 90, borderRadius: '50%', background: K.amber, color: K.ink, fontSize: 54, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>{i + 1}</div>
              <div style={{fontSize: 42, fontWeight: 900, color: K.txt, whiteSpace: 'nowrap'}}>{chem(q)}</div>
            </div>
          );
        })}
      </div>
      {nx > 0.01 && (
        <div style={{position: 'absolute', left: 560, top: 640, width: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '16px 0', borderRadius: 999, border: `2px solid ${K.amber}`, background: 'rgba(245,184,61,.08)', fontFamily: FONT, opacity: Math.min(1, nx * 1.5)}}>
          <span style={{fontSize: 28, fontWeight: 800, color: K.amber, letterSpacing: 1}}>BÀI 8</span>
          <span style={{fontSize: 34, fontWeight: 700, color: K.txt}}>Khí máu trong hồi sức</span>
        </div>
      )}
    </>
  );
};

const SC: React.FC<{S: number[]; D: number[]}>[] = [G1, G2, G3, G4, G5, G6, G7, G8, G9, G10];

export const Abg7: React.FC = () => (
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
