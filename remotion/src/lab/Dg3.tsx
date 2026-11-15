// Giải mã điện giải · Bài 3: Hạ natri — xử trí an toàn (11 cảnh)
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
const NAMES = ['HAI BỜ VỰC', 'VÌ SAO CHẬM', 'TRIỆU CHỨNG', 'NaCl 3%', 'GIỚI HẠN', 'BẰNG CHỨNG', 'BẪY', 'HẠ LẠI', 'NGUYÊN NHÂN', 'CA BỆNH', 'ÔN TẬP'];

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
      <Tx x={44} y={22} size={24} c={K.dim} b={600}>GIẢI MÃ ĐIỆN GIẢI · BÀI 3</Tx>
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

// ---------- 1 Hai bờ vực ----------
const D1: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const f = useCurrentFrame();
  return (
    <>
      <Top idx={0} title="Hạ natri: xử trí an toàn" />
      <Cell k="dg_tb_phu" cx={330} cy={430} f={0.4} a={ap(t, S[1])} glow="rgba(229,72,77,.45)" />
      <Lbl cx={330} y={700} c={K.o2} a={ap(t, S[1] + 0.3)} size={46}>PHÙ NÃO</Lbl>
      <Lbl cx={330} y={760} c={K.dim} a={ap(t, S[1] + 0.6)} size={30}>natri thấp quá lâu</Lbl>
      <Pic src="dg_neuron.png" x={1180} y={330} w={680} a={ap(t, S[2])} glow="rgba(229,72,77,.45)" />
      <Lbl cx={1520} y={700} c={K.o2} a={ap(t, S[2] + 0.3)} size={46}>HUỶ MYELIN</Lbl>
      <Lbl cx={1520} y={760} c={K.dim} a={ap(t, S[2] + 0.6)} size={30}>nâng natri quá nhanh</Lbl>
      <div style={{position: 'absolute', left: 760, top: 220, width: 360, height: 560, borderRadius: 40, background: 'linear-gradient(180deg,rgba(63,178,127,.05),rgba(63,178,127,.25))', border: `4px solid ${K.green}`, opacity: ap(t, S[0] + 0.4), boxShadow: `0 0 ${30 + 20 * Math.sin(f / 9)}px rgba(63,178,127,.35)`}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: FONT, fontSize: 46, fontWeight: 900, color: K.green, lineHeight: 1.25}}>VÙNG<br />AN TOÀN</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', fontFamily: FONT, fontSize: 90, color: K.green}}>↑</div>
      </div>
    </>
  );
};

// ---------- 2 Vì sao phải chậm ----------
const D2: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const X = [230, 690, 1150, 1640];
  return (
    <>
      <Top idx={1} title="Vì sao phải nâng chậm?" />
      <Cell k="dg_tb_bt" cx={X[0]} cy={380} a={ap(t, S[0])} />
      <Lbl cx={X[0]} y={580} c={K.green} a={ap(t, S[0] + 0.2)}>Bình thường</Lbl>
      <Arr x={X[0] + 180} y={330} a={ap(t, S[0] + 0.8)} />
      <Cell k="dg_tb_phu" cx={X[1]} cy={380} f={0.36} a={ap(t, S[0] + 1)} />
      <Lbl cx={X[1]} y={580} c={WATER} a={ap(t, S[0] + 1.2)}>Máu loãng: SƯNG</Lbl>
      <Arr x={X[1] + 190} y={330} a={ap(t, S[1])} />
      <Cell k="dg_tb_bt" cx={X[2]} cy={380} a={ap(t, S[1] + 0.3)} glow="rgba(63,178,127,.5)" />
      <Lbl cx={X[2]} y={580} c={K.green} a={ap(t, S[1] + 0.5)}>~48 giờ: thích nghi</Lbl>
      <Arr x={X[2] + 200} y={330} a={ap(t, S[2])} c={K.o2} />
      <Cell k="dg_tb_teo" cx={X[3]} cy={380} f={0.36} a={ap(t, S[2] + 0.3)} glow="rgba(229,72,77,.6)" />
      <Lbl cx={X[3]} y={580} c={K.o2} a={ap(t, S[2] + 0.5)}>Nâng quá nhanh: TEO</Lbl>
      <Pic src="dg_neuron.png" x={560} y={660} w={500} a={ap(t, S[3])} />
      <Tx x={1100} y={720} w={700} size={40} c={K.o2} b={900} a={ap(t, S[3] + 0.4)}>Bao myelin tổn thương</Tx>
      <Tx x={1100} y={780} w={700} size={32} c={K.dim} b={700} a={ap(t, S[3] + 0.8)}>hay gặp ở cầu não</Tx>
    </>
  );
};

// ---------- 3 Triệu chứng nặng ----------
const D3: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const items = ['Nôn ói', 'Co giật', 'Lơ mơ', 'Hôn mê'];
  return (
    <>
      <Top idx={2} title="Có triệu chứng NẶNG không?" />
      <Cell k="dg_tb_phu" cx={330} cy={440} f={0.42} a={ap(t, S[0])} glow="rgba(229,72,77,.4)" />
      <div style={{position: 'absolute', left: 680, top: 200, width: 1140, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, fontFamily: FONT}}>
        {items.map((w, i) => {
          const a = ap(t, S[1] + i * 0.5);
          return <div key={w} style={{height: 150, borderRadius: 26, border: `4px solid ${K.o2}`, background: 'rgba(229,72,77,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 54, fontWeight: 900, color: K.txt, opacity: a, transform: `scale(${0.9 + 0.1 * a})`}}>{w}</div>;
        })}
      </div>
      <Res x={680} y={600} s0={S[2]} c={K.o2}>CẤP CỨU: nâng natri ngay</Res>
      <Tx x={690} y={710} w={1140} size={34} c={K.dim} b={700} a={ap(t, S[2] + 1)}>chưa cần biết nguyên nhân</Tx>
    </>
  );
};

// ---------- 4 Bolus NaCl 3% ----------
const D4: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const steps = ['Liều 1', 'Thử Na⁺', 'Liều 2', 'Thử Na⁺', 'Liều 3'];
  return (
    <>
      <Top idx={3} title="Bolus NaCl 3%" />
      <Panel x={160} y={180} w={1600} h={170} c={K.amber} s0={S[0]} glow={ap(t, S[0] + 1)}>
        <Tx x={0} y={22} w={1600} al="center" size={30} c={K.amber} b={800}>NaCl 3%</Tx>
        <Tx x={0} y={70} w={1600} al="center" size={64} b={900}>150 mL trong 20 phút</Tx>
      </Panel>
      <div style={{position: 'absolute', left: 160, top: 400, width: 1600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, fontFamily: FONT}}>
        {steps.map((w, i) => {
          const a = ap(t, S[1] + i * 0.45);
          const test = w.startsWith('Thử');
          return (
            <React.Fragment key={i}>
              {i > 0 ? <div style={{fontSize: 44, color: K.dim, opacity: a}}>→</div> : null}
              <div style={{padding: '16px 30px', borderRadius: 18, border: `3px solid ${test ? WATER : K.amber}`, background: test ? 'rgba(56,167,221,.15)' : 'rgba(245,184,61,.15)', fontSize: 40, fontWeight: 800, color: K.txt, opacity: a}}>{chem(w)}</div>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 160, top: 520, width: 760, height: 220, borderRadius: 30, border: `4px solid ${K.green}`, background: 'rgba(63,178,127,.12)', opacity: ap(t, S[2]), fontFamily: FONT, textAlign: 'center'}}>
        <div style={{fontSize: 30, fontWeight: 800, color: K.green, marginTop: 22}}>MỤC TIÊU</div>
        <div style={{fontSize: 96, fontWeight: 900, color: K.txt, lineHeight: 1.1}}>+5 <span style={{fontSize: 40}}>mmol/L</span></div>
      </div>
      <Panel x={960} y={520} w={800} h={220} c={WATER} s0={S[3]}>
        <Tx x={0} y={24} w={800} al="center" size={30} c={WATER} b={800}>THỬ NGHIỆM SALSA (2021)</Tx>
        <Tx x={30} y={80} w={740} al="center" size={36} b={800}>Bolus ngắt quãng an toàn như truyền liên tục, ít phải hạ lại hơn</Tx>
      </Panel>
    </>
  );
};

// ---------- 5 Giới hạn ----------
const Lim: React.FC<{x: number; s0: number; c: string; top: string; v: string}> = ({x, s0, c, top, v}) => {
  const p = usePop(s0, 11);
  return (
    <div style={{position: 'absolute', left: x, top: 190, width: 620, height: 300, borderRadius: 34, border: `5px solid ${c}`, background: `${c}1f`, textAlign: 'center', fontFamily: FONT, transform: `scale(${p})`, opacity: Math.min(1, p * 1.5)}}>
      <div style={{fontSize: 38, fontWeight: 800, color: c, marginTop: 30}}>{top}</div>
      <div style={{fontSize: 150, fontWeight: 900, color: K.txt, lineHeight: 1.15}}>{v}</div>
      <div style={{fontSize: 30, color: K.dim, fontWeight: 700}}>mmol/L</div>
    </div>
  );
};
const D5: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={4} title="Giới hạn tốc độ nâng natri" />
      <Lim x={270} s0={S[0]} c={K.amber} top="24 GIỜ ĐẦU" v="≤ 10" />
      <Lim x={1030} s0={S[1]} c={WATER} top="MỖI 24 GIỜ SAU" v="≤ 8" />
      <Panel x={270} y={540} w={1380} h={250} c={K.o2} s0={S[2]} glow={ap(t, S[2] + 1)}>
        <Tx x={0} y={22} w={1380} al="center" size={38} c={K.o2} b={900}>NGUY CƠ CAO → ≤ 8 ngay ngày đầu</Tx>
        <Bullets x={40} y={100} w={1300} items={['Na⁺ ≤ 105', 'Hạ kali', 'Nghiện rượu', 'Suy dinh dưỡng', 'Bệnh gan']} s0={[S[3], S[3] + 0.5, S[3] + 1, S[3] + 1.5, S[3] + 2]} c={K.o2} size={36} />
      </Panel>
    </>
  );
};

// ---------- 6 Bằng chứng mới ----------
const D6: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={5} title="Bằng chứng mới (2023)" />
      <Card x={140} y={190} w={520} h={230} c={K.green} s0={S[0]} head="HUỶ MYELIN" body="HIẾM · ~0,05–0,2%" size={44} />
      <Card x={700} y={190} w={520} h={230} c={WATER} s0={S[1]} head="NHIỀU CA" body="xảy ra dù nâng ≤ 8" sub="thường có yếu tố nguy cơ" size={42} />
      <Card x={1260} y={190} w={520} h={230} c={K.o2} s0={S[2]} head="NÂNG QUÁ CHẬM" body="< 6/24 giờ → tử vong ↑" sub="nghiên cứu quan sát" size={40} glow={ap(t, S[2] + 1)} />
      <GoldC y={500} a={ap(t, S[3])} size={52}>Giữ giới hạn · nhưng đừng nâng quá chậm</GoldC>
    </>
  );
};

// ---------- 7 Bẫy tự điều chỉnh ----------
const D7: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const f = useCurrentFrame();
  return (
    <>
      <Top idx={6} title="BẪY: natri tự tăng vọt" />
      <Chain items={['Hết nguyên nhân', 'ADH TẮT', 'Tiểu nhiều nước loãng', 'Na⁺ tăng vọt']} s0={S[1]} step={0.6} y={200} c={K.amber} />
      <Bullets x={200} y={360} w={1520} items={['Bù đủ dịch', 'Ngưng thiazide', 'Cho cortisol', 'Hết nôn']} s0={[S[2], S[2] + 0.5, S[2] + 1, S[2] + 1.5]} c={WATER} size={40} />
      <div style={{position: 'absolute', left: 360, top: 520, width: 1200, height: 230, borderRadius: 34, border: `5px solid ${K.o2}`, background: 'rgba(229,72,77,.14)', opacity: ap(t, S[3]), boxShadow: `0 0 ${30 + 30 * (0.5 + 0.5 * Math.sin(f / 5))}px rgba(229,72,77,.5)`, fontFamily: FONT, textAlign: 'center'}}>
        <div style={{fontSize: 36, fontWeight: 900, color: K.o2, marginTop: 26}}>🚨 BÁO ĐỘNG</div>
        <div style={{fontSize: 70, fontWeight: 900, color: K.txt, marginTop: 10}}>Nước tiểu &gt; 100 mL/giờ</div>
      </div>
    </>
  );
};

// ---------- 8 Hạ lại ----------
const D8: React.FC<{S: number[]; D: number[]}> = ({S}) => (
  <>
    <Top idx={7} title="Vượt giới hạn → hạ natri LẠI" />
    <Check x={260} y={210} w={1400} items={['Ngưng dịch ưu trương', 'Glucose 5% · 10 mL/kg trong 1 giờ', '± Desmopressin 2 µg tĩnh mạch']} s0={[S[1], S[2], S[3]]} />
  </>
);

// ---------- 9 Theo nguyên nhân ----------
const D9: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={8} title="Không triệu chứng nặng: theo nguyên nhân" />
      <Card x={140} y={200} w={520} h={270} c={NA} s0={S[1]} head="GIẢM THỂ TÍCH" body="NaCl 0,9% hoặc dịch cân bằng" size={40} />
      <Card x={700} y={200} w={520} h={270} c={WATER} s0={S[2]} head="THỪA DỊCH" body="Hạn chế nước · điều trị suy tim, xơ gan" size={40} />
      <Card x={1260} y={200} w={520} h={270} c={K.amber} s0={S[3]} head="SIAD" body="Hạn chế nước · ure uống · ngưng thuốc gây" size={40} />
      <Tx x={140} y={530} w={1640} al="center" size={32} c={K.dim} b={700} a={ap(t, S[0] + 0.5)}>Dựa vào 4 câu hỏi chẩn đoán ở Bài 2</Tx>
    </>
  );
};

// ---------- 10 Ca số 1: biểu đồ Na ----------
const D10: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const X0 = 140, X1 = 860, Y0 = 760, Y1 = 220; // trục
  const hx = (h: number) => X0 + (h / 24) * (X1 - X0);
  const ny = (n: number) => Y0 - ((n - 119) / (133 - 119)) * (Y0 - Y1);
  const pts: [number, number, number][] = [[0, 121, S[0]], [1, 125, S[1] + 1], [18, 130, S[3] + 0.6], [24, 131, S[4] + 1]];
  const shown = pts.filter((p) => t >= p[2]);
  const d = shown.map((p, i) => `${i ? 'L' : 'M'}${hx(p[0])},${ny(p[1])}`).join(' ');
  return (
    <>
      <Top idx={9} title="Ca số 1: cụ bà, Na⁺ 121, lơ mơ" />
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: ap(t, S[0])}}>
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={K.dim} strokeWidth={3} />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1 - 20} stroke={K.dim} strokeWidth={3} />
        {[0, 6, 12, 18, 24].map((h) => <text key={h} x={hx(h)} y={Y0 + 44} fill={K.dim} fontSize={28} fontFamily={FONT} textAnchor="middle">{h}h</text>)}
        {[131].map((n) => <text key={n} x={X0 - 16} y={ny(n) + 10} fill={K.dim} fontSize={28} fontFamily={FONT} textAnchor="end">{n}</text>)}
        <line x1={X0} y1={ny(131)} x2={X1} y2={ny(131)} stroke={K.o2} strokeWidth={4} strokeDasharray="14 10" opacity={ap(t, S[2])} />
        <text x={X1} y={ny(131) - 14} fill={K.o2} fontSize={30} fontWeight={800} fontFamily={FONT} textAnchor="end" opacity={ap(t, S[2])}>giới hạn ngày 1: 131</text>
        <path d={d} fill="none" stroke={K.amber} strokeWidth={7} strokeLinejoin="round" />
        {shown.map((p) => <circle key={p[0]} cx={hx(p[0])} cy={ny(p[1])} r={14} fill={p[0] === 18 ? K.o2 : K.amber} stroke="#fff" strokeWidth={4} />)}
        {shown.map((p) => { const lo = p[0] <= 1; return <text key={'t' + p[0]} x={hx(p[0]) + (lo ? 26 : -6)} y={ny(p[1]) + (lo ? 12 : 52)} fill={K.txt} fontSize={34} fontWeight={900} fontFamily={FONT} textAnchor={lo ? 'start' : 'end'}>{p[1]}</text>; })}
      </svg>
      <Step x={940} y={200} s0={S[1]} size={34}>NaCl 3% × 2 liều → 125, tỉnh hơn</Step>
      <Step x={940} y={275} s0={S[1] + 2} size={34} c={K.green}>→ Ngưng bolus</Step>
      <Step x={940} y={360} s0={S[2]} size={34}>Ngưng sertraline · hạn chế nước</Step>
      <Step x={940} y={445} s0={S[3]} size={34} c={K.o2}>Giờ 18: nước tiểu 200 mL/giờ!</Step>
      <Res x={940} y={540} s0={S[4]} c={K.amber}>Glucose 5% + desmopressin</Res>
      <Tx x={940} y={650} w={900} size={32} c={K.dim} b={700} a={ap(t, S[4] + 1.2)}>→ giữ Na⁺ không vượt 131</Tx>
    </>
  );
};

// ---------- 11 Ôn tập ----------
const Num: React.FC<{x: number; s0: number; c: string; n: string; l: string}> = ({x, s0, c, n, l}) => {
  const p = usePop(s0, 11);
  return (
    <div style={{position: 'absolute', left: x, top: 190, width: 480, height: 380, borderRadius: 40, border: `5px solid ${c}`, background: `${c}1f`, textAlign: 'center', fontFamily: FONT, transform: `scale(${p})`, opacity: Math.min(1, p * 1.5)}}>
      <div style={{fontSize: 200, fontWeight: 900, color: c, lineHeight: 1.2}}>{n}</div>
      <div style={{fontSize: 36, fontWeight: 800, color: K.txt, padding: '0 20px', lineHeight: 1.25}}>{l}</div>
    </div>
  );
};
const D11: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const nx = usePop(S[3] + 0.3);
  return (
    <>
      <Top idx={10} title="Ôn tập: 5 · 10 · 8" />
      <Num x={190} s0={S[0] + 0.5} c={K.green} n="5" l="tăng ~5 để cứu não" />
      <Num x={720} s0={S[1] + 0.5} c={K.amber} n="10" l="tối đa 24 giờ đầu" />
      <Num x={1250} s0={S[1] + 2.6} c={WATER} n="8" l="tối đa mỗi 24 giờ sau" />
      <GoldC y={620} a={ap(t, S[2])} size={50}>Luôn theo dõi nước tiểu!</GoldC>
      {nx > 0.01 && (
        <div style={{position: 'absolute', left: 560, top: 760, width: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '16px 0', borderRadius: 999, border: `2px solid ${K.amber}`, background: 'rgba(245,184,61,.08)', fontFamily: FONT, opacity: Math.min(1, nx * 1.5)}}>
          <span style={{fontSize: 28, fontWeight: 800, color: K.amber, letterSpacing: 1}}>BÀI 4</span>
          <span style={{fontSize: 34, fontWeight: 700, color: K.txt}}>Tăng natri máu</span>
        </div>
      )}
    </>
  );
};

const SC: React.FC<{S: number[]; D: number[]}>[] = [D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11];

export const Dg3: React.FC = () => (
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
