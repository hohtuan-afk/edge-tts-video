// Giải mã khí máu · Bài 9: Tiếp cận Stewart (10 cảnh)
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
const NAMES = ['MỞ ĐẦU', 'NGUYÊN LÝ', 'SID', 'DỊCH TRUYỀN', 'ALBUMIN', 'STORY', 'CA SỐ 1', 'GIẢI CA', 'SO SÁNH', 'KẾT CHUỖI'];

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
      <Tx x={44} y={22} size={24} c={K.dim} b={600}>GIẢI MÃ KHÍ MÁU · BÀI 9</Tx>
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

// ---------- 1 Mở đầu ----------
const K1: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={0} title="Tiếp cận Stewart" />
      <Tx x={160} y={170} w={1600} al="center" size={44} b={800} a={ap(t, S[0])}>Hai cách nhìn toan kiềm</Tx>
      <Card x={160} y={270} w={760} h={250} c={K.co2} s0={S[1]} head="TRUYỀN THỐNG" body="HCO₃⁻ · khoảng trống anion" size={48} />
      <Card x={1000} y={270} w={760} h={250} c={K.amber} s0={S[1] + 1.2} head="STEWART" body="Hoá lý · ion mạnh" size={48} />
      <div style={{position: 'absolute', left: 160, top: 600, width: 1600, display: 'flex', justifyContent: 'center', gap: 30, fontFamily: FONT}}>
        {(['Toan do dịch truyền', 'Vai trò albumin'] as string[]).map((w, i) => {
          const p = ap(t, S[2] + 0.6 + i * 0.7);
          return <div key={w} style={{padding: '18px 40px', borderRadius: 999, background: K.amber, color: K.ink, fontSize: 42, fontWeight: 900, opacity: p, transform: `scale(${0.8 + 0.2 * p})`}}>{w}</div>;
        })}
      </div>
    </>
  );
};

// ---------- 2 Nguyên lý ----------
const K2: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={1} title="Nguyên lý Stewart" />
      <Big x={0} y={160} w={1920} a={ap(t, S[0])} size={70} c={K.txt}>Σ cation = Σ anion</Big>
      <Tx x={160} y={260} w={1600} al="center" size={32} c={K.dim} b={700} a={ap(t, S[0] + 0.5)}>mọi dung dịch luôn trung hoà điện tích</Tx>
      <Card x={460} y={340} w={1000} h={170} c={K.line} s0={S[1]} head="BIẾN PHỤ THUỘC" body="H⁺ · HCO₃⁻" size={50} />
      <Tx x={160} y={560} w={1600} al="center" size={34} c={K.amber} b={800} a={ap(t, S[2])}>3 BIẾN ĐỘC LẬP</Tx>
      <BigPill x={180} y={630} a={ap(t, S[2] + 0.5)} c={K.co2}>PaCO₂</BigPill>
      <BigPill x={730} y={630} a={ap(t, S[2] + 1.1)} c={K.amber}>SID</BigPill>
      <BigPill x={1280} y={630} a={ap(t, S[2] + 1.7)} c={PURPLE}>A_TOT</BigPill>
    </>
  );
};

// ---------- 3 SID ----------
const K3: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const k = 3.4, base = 860, a = ap(t, S[0]);
  return (
    <>
      <Top idx={2} title="SID · hiệu số ion mạnh" />
      <div style={{position: 'absolute', left: 200, top: base - 140 * k, width: 220, height: 140 * k - 4, borderRadius: 12, background: '#C9822E', opacity: a, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 900, color: '#fff'}}>Na⁺ 140</div>
      <div style={{position: 'absolute', left: 460, top: base - 105 * k, width: 220, height: 105 * k - 4, borderRadius: 12, background: '#3A7BE0', opacity: a, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 900, color: '#fff'}}>Cl⁻ 105</div>
      <div style={{position: 'absolute', left: 460, top: base - 140 * k, width: 220, height: 35 * k - 4, borderRadius: 12, border: `5px dashed ${K.amber}`, background: 'rgba(245,184,61,.2)', opacity: ap(t, S[0] + 0.8), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 900, color: K.amber}}>SID 35</div>
      <Gold x={800} y={250} a={ap(t, S[1])} size={46}>Tại giường: SID ≈ Na⁺ − Cl⁻ ≈ 35</Gold>
      <Card x={800} y={420} w={460} h={200} c={K.o2} s0={S[2]} head="SID GIẢM ↓" body="TOAN" size={60} />
      <Card x={1300} y={420} w={460} h={200} c={K.hco3} s0={S[2] + 1} head="SID TĂNG ↑" body="KIỀM" size={60} />
    </>
  );
};

// ---------- 4 Dịch truyền ----------
const K4: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={3} title="Dịch truyền nhìn theo Stewart" />
      <Panel x={160} y={200} w={760} h={420} c={K.o2} s0={S[0]}>
        <Tx x={0} y={28} w={760} al="center" size={34} c={K.o2} b={800}>NaCl 0,9%</Tx>
        <Tx x={0} y={90} w={760} al="center" size={36} b={700}>Na⁺ 154 · Cl⁻ 154</Tx>
        <Big x={0} y={150} w={760} a={1} size={110} c={K.o2}>SID 0</Big>
        <Tx x={30} y={320} w={700} al="center" size={34} b={800} a={ap(t, S[1])}>Truyền nhiều → toan tăng Clo</Tx>
      </Panel>
      <Panel x={1000} y={200} w={760} h={420} c={K.green} s0={S[2]}>
        <Tx x={0} y={28} w={760} al="center" size={34} c={K.green} b={800}>RINGER LACTAT</Tx>
        <Tx x={0} y={90} w={760} al="center" size={36} b={700}>SID hiệu dụng</Tx>
        <Big x={0} y={150} w={760} a={1} size={110} c={K.green}>≈ 28</Big>
        <Tx x={30} y={320} w={700} al="center" size={34} b={800}>Ít gây toan hơn</Tx>
      </Panel>
    </>
  );
};

// ---------- 5 Albumin ----------
const K5: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={4} title="A_TOT · albumin" />
      <Card x={160} y={190} w={1600} h={170} c={PURPLE} s0={S[0]} head="A_TOT · TỔNG ACID YẾU" body="Chủ yếu albumin, phosphate" size={46} />
      <Chain items={['Albumin ↓', 'Ít acid yếu', 'KIỀM']} s0={S[1]} step={0.7} y={440} c={K.hco3} />
      <Res x={460} y={620} s0={S[2]} c={K.o2}>Albumin thấp CHE GIẤU toan chuyển hoá</Res>
    </>
  );
};

// ---------- 6 Story ----------
const ST: [string, string, string][] = [['Na–Cl', '(Na⁺ − Cl⁻) − 35', K.co2], ['Albumin', '0,25 × (42 − albumin g/L)', K.green], ['Lactate', '1 − lactate', K.hco3], ['Còn lại', 'anion không đo được', PURPLE]];
const K6: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={5} title="Phương pháp Story tại giường" />
      <Tx x={160} y={160} w={1600} al="center" size={40} b={800} a={ap(t, S[0])}>Tách kiềm dư (BE) thành từng phần</Tx>
      <div style={{position: 'absolute', left: 260, top: 250, width: 1400, display: 'flex', flexDirection: 'column', gap: 20, fontFamily: FONT}}>
        {ST.map(([n, f, c], i) => {
          const p = ap(t, S[i + 1]);
          return (
            <div key={n} style={{display: 'flex', alignItems: 'center', gap: 36, padding: '22px 36px', borderRadius: 22, background: `${c}18`, border: `4px solid ${c}`, opacity: 0.2 + 0.8 * p, transform: `translateX(${(1 - p) * 30}px)`}}>
              <div style={{width: 260, fontSize: 46, fontWeight: 900, color: c}}>{n}</div>
              <div style={{fontSize: 46, fontWeight: 800, color: K.txt}}>{chem(f)}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ---------- 7 Ca số 1 ----------
const K7: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={6} title="Ca số 1 · truyền nhiều NaCl 0,9%" />
      <Slip s0={S[0]} rows={t > S[2] ? ROWS_S : ROWS_S.slice(0, 4)} hl={t > S[2] ? ['na', 'cl', 'alb', 'lac'] : t > S[1] ? ['ph', 'co2', 'hco3', 'be'] : []} title="CA SỐ 1" x={720} y={150} />
    </>
  );
};

// ---------- 8 Giải ca: thác BE ----------
const K8: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const parts: [string, number, string][] = [['Na–Cl', -10, K.o2], ['Albumin', 5, K.green], ['Lactate', -2, K.hco3], ['Còn lại', -3, PURPLE]];
  const X0 = 1000, k = 34, rowH = 120, y0 = 200;
  let acc = 0;
  return (
    <>
      <Top idx={7} title="Giải ca số 1" />
      <div style={{position: 'absolute', left: X0, top: y0 - 20, width: 4, height: rowH * 5 + 20, background: K.dim, opacity: 0.6}} />
      <Tx x={X0 - 40} y={y0 - 60} w={80} al="center" size={26} c={K.dim} b={800}>0</Tx>
      {parts.map(([n, v, c], i) => {
        const a = ap(t, S[i]);
        const from = acc, to = acc + v;
        acc = to;
        const l = X0 + Math.min(from, to) * k, w = Math.abs(v) * k * a;
        const left = v < 0 ? X0 + from * k - w : l;
        return (
          <React.Fragment key={n}>
            <Tx x={160} y={y0 + i * rowH + 14} w={420} size={44} c={c} b={900} a={a}>{n}</Tx>
            <div style={{position: 'absolute', left, top: y0 + i * rowH, width: w, height: 80, borderRadius: 12, background: c}} />
            <Tx x={v < 0 ? left - 170 : left + w + 20} y={y0 + i * rowH + 14} w={150} al={v < 0 ? 'right' : 'left'} size={44} b={900} a={a}>{v > 0 ? `+${v}` : `−${-v}`}</Tx>
          </React.Fragment>
        );
      })}
      <div style={{position: 'absolute', left: X0 - 10 * k, top: y0 + 4 * rowH, width: 10 * k * ap(t, S[3] + 1), height: 80, borderRadius: 12, background: K.txt, opacity: 0.9}} />
      <Tx x={160} y={y0 + 4 * rowH + 14} w={420} size={44} b={900} a={ap(t, S[3] + 1)}>BE tổng</Tx>
      <Tx x={X0 - 10 * k - 170} y={y0 + 4 * rowH + 14} w={150} al="right" size={44} b={900} a={ap(t, S[3] + 1)}>−10</Tx>
      <Res x={1150} y={y0 + 1 * rowH} s0={S[4]} c={K.o2}>Toan tăng Clo là chính</Res>
      <Tx x={1150} y={y0 + 2 * rowH + 10} w={700} size={36} c={K.green} b={800} a={ap(t, S[4] + 1)}>albumin thấp che bớt +5</Tx>
    </>
  );
};

// ---------- 9 So sánh ----------
const K9: React.FC<{S: number[]; D: number[]}> = ({S}) => (
  <>
    <Top idx={8} title="Truyền thống hay Stewart?" />
    <Card x={160} y={200} w={760} h={260} c={K.co2} s0={S[0]} head="TRUYỀN THỐNG" body="Đơn giản, đủ dùng hằng ngày" size={46} />
    <Card x={1000} y={200} w={760} h={260} c={K.amber} s0={S[2]} head="STEWART" body="Hiểu rõ dịch truyền, albumin ở hồi sức" size={44} />
    <Memo x={210} y={560} w={1500} s0={S[1] + 0.3} size={38}>AG hiệu chỉnh albumin ≈ bổ sung phần lớn điểm mạnh của Stewart</Memo>
  </>
);

// ---------- 10 Kết chuỗi ----------
const K10: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const f = useCurrentFrame();
  return (
    <>
      <Top idx={9} title="Kết thúc chuỗi" />
      <BigPill x={180} y={180} a={ap(t, S[0])} c={K.co2}>PaCO₂</BigPill>
      <BigPill x={730} y={180} a={ap(t, S[0] + 0.6)} c={K.amber}>SID</BigPill>
      <BigPill x={1280} y={180} a={ap(t, S[0] + 1.2)} c={PURPLE}>A_TOT</BigPill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', fontFamily: FONT, opacity: ap(t, S[1])}}>
        <div style={{fontSize: 34, fontWeight: 800, letterSpacing: 4, color: K.dim}}>HẾT CHUỖI · 9 BÀI</div>
        <div style={{fontSize: 110, fontWeight: 900, color: K.amber, textShadow: '0 0 40px rgba(245,184,61,.5)', transform: `scale(${1 + 0.02 * Math.sin(f / 10)})`}}>GIẢI MÃ KHÍ MÁU</div>
      </div>
      <Tx x={160} y={650} w={1600} al="center" size={50} b={800} a={ap(t, S[2])}>Cảm ơn bạn đã theo dõi! Lưu lại cả chuỗi để ôn tập</Tx>
    </>
  );
};

const SC: React.FC<{S: number[]; D: number[]}>[] = [K1, K2, K3, K4, K5, K6, K7, K8, K9, K10];

export const Abg9: React.FC = () => (
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
