// Giải mã khí máu · Bài 5: Toan và kiềm chuyển hoá (14 cảnh)
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
const NAMES = ['MỞ ĐẦU', 'NGÃ BA AG', 'THÊM ACID', 'GOLDMARK', 'LACTIC', 'THẨM THẤU', 'MẤT HCO₃⁻', 'NGUYÊN NHÂN', 'AG NIỆU', 'GIẢI CA', 'KIỀM', 'CA C', 'CLO NIỆU', 'ÔN TẬP'];

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
      <Tx x={44} y={22} size={24} c={K.dim} b={600}>GIẢI MÃ KHÍ MÁU · BÀI 5</Tx>
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

// ---------- 1 Mở đầu ----------
const E1: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const show2 = ap(t, S[1]);
  return (
    <>
      <Top idx={0} title="Toan và kiềm chuyển hoá" />
      <div style={{opacity: 1 - show2}}>
        <Big x={0} y={190} w={1920} a={ap(t, S[0])} size={70} c={K.txt}>HCO₃⁻</Big>
        <Card x={300} y={360} w={580} h={260} c={K.o2} s0={S[0] + 0.6} head="HCO₃⁻ GIẢM ↓" body="Toan chuyển hoá" size={52} />
        <Card x={1040} y={360} w={580} h={260} c={K.hco3} s0={S[0] + 1.3} head="HCO₃⁻ TĂNG ↑" body="Kiềm chuyển hoá" size={52} />
      </div>
      <div style={{opacity: show2}}>
        <Pill x={960} y={150} a={show2} c={K.o2} size={32} dark={false}>PHẦN 1 · TOAN CHUYỂN HOÁ</Pill>
        <Slip s0={S[1] + 0.3} rows={ROWS_A.slice(0, 2)} x={300} y={260} title="BỆNH NHÂN A" />
        <Slip s0={S[1] + 0.8} rows={ROWS_B.slice(0, 2)} x={1160} y={260} title="BỆNH NHÂN B" />
        <Tx x={300} y={520} w={460} al="center" size={40} c={K.o2} b={800} a={ap(t, S[2])}>Sốc nhiễm khuẩn</Tx>
        <Tx x={1160} y={520} w={460} al="center" size={40} c={K.co2} b={800} a={ap(t, S[2] + 1)}>Tiêu chảy nhiều ngày</Tx>
        <Big x={760} y={300} w={400} a={ap(t, S[1] + 1)} size={110} c={K.amber}>=</Big>
        <div style={{position: 'absolute', left: 660, top: 650, width: 600, textAlign: 'center', fontFamily: FONT, opacity: ap(t, S[3] - 0.2), transform: `scale(${1 + 0.03 * Math.sin(f / 7)})`}}>
          <div style={{display: 'inline-block', padding: '14px 40px', borderRadius: 999, background: K.amber, color: K.ink, fontSize: 46, fontWeight: 900}}>Chìa khoá: AG</div>
        </div>
      </div>
    </>
  );
};

// ---------- 2 Ngã ba AG ----------
const E2: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={1} title="Ngã ba khoảng trống anion" />
      <GoldC y={150} a={ap(t, S[0])} size={46}>AG = Na⁺ − (Cl⁻ + HCO₃⁻) · bình thường ≈ 12</GoldC>
      <Card x={160} y={280} w={760} h={250} c={K.o2} s0={S[1]} head="BỆNH NHÂN A" body="138 − (100 + 12) = 26" sub="AG TĂNG" glow={ap(t, S[1] + 1.5)} size={48} />
      <Card x={1000} y={280} w={760} h={250} c={K.green} s0={S[2]} head="BỆNH NHÂN B" body="138 − (114 + 12) = 12" sub="AG BÌNH THƯỜNG" size={48} />
      <Svg>
        <g opacity={ap(t, S[3])}>
          <path d="M540,540 L540,620" stroke={K.o2} strokeWidth={8} markerEnd="" />
          <path d="M520,610 L540,640 L560,610" fill="none" stroke={K.o2} strokeWidth={8} strokeLinejoin="round" />
          <path d="M1380,540 L1380,620" stroke={K.green} strokeWidth={8} />
          <path d="M1360,610 L1380,640 L1400,610" fill="none" stroke={K.green} strokeWidth={8} strokeLinejoin="round" />
        </g>
      </Svg>
      <Res x={300} y={670} s0={S[3] + 0.3} c={K.o2}>THÊM ACID</Res>
      <Res x={1060} y={670} s0={S[3] + 1.6} c={K.green}>MẤT BICARBONATE</Res>
    </>
  );
};

// ---------- 3 Cơ chế thêm acid ----------
const E3: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const u = interpolate(t, [S[0] + 0.8, S[1] + 1.5], [0, 1], clamp);
  const hco3 = 24 - 12 * u;
  const f = useCurrentFrame();
  return (
    <>
      <Top idx={2} title="Nhánh 1 · Thêm acid → AG tăng" />
      <Ions x={200} cl={100} hco3={hco3} a={ap(t, S[0])} agHi={u > 0.5} />
      <Panel x={800} y={190} w={960} h={180} c={K.o2} s0={S[0]}>
        <Tx x={30} y={30} w={900} al="center" size={42} b={800}>{'H⁺A⁻ + HCO₃⁻ → CO₂ + H₂O + A⁻'}</Tx>
        <Tx x={30} y={104} w={900} al="center" size={30} c={K.dim}>acid lạ tiêu hao HCO₃⁻</Tx>
      </Panel>
      <Svg>
        {Array.from({length: 6}, (_, i) => {
          const v = (f / 50 + i / 6) % 1;
          return <g key={i} opacity={ap(t, S[0] + 0.6) * Math.sin(v * Math.PI)} transform={`translate(${900 + i * 140},${470 + Math.sin(v * 6 + i) * 20})`}><circle r={34} fill={K.o2} /><text y={11} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">A⁻</text></g>;
        })}
      </Svg>
      <Card x={800} y={580} w={960} h={200} c={K.amber} s0={S[1]} head="GỐC ACID Ở LẠI" body="A⁻ = anion không đo được" />
      <Res x={1060} y={820} s0={S[2]} c={K.o2}>AG TĂNG</Res>
    </>
  );
};

// ---------- 4 GOLDMARK ----------
const GM: [string, string, string][] = [['G', 'Glycol', 'ethylene, propylene'], ['O', 'Oxoproline', 'paracetamol kéo dài'], ['L', 'L-lactate', ''], ['D', 'D-lactate', ''], ['M', 'Methanol', ''], ['A', 'Aspirin', 'salicylate'], ['R', 'Renal', 'suy thận'], ['K', 'Ketoacidosis', 'nhiễm toan ceton']];
const E4: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const grp: [string, string][] = [['Lactic', K.o2], ['Ceton', K.amber], ['Suy thận', K.hco3], ['Ngộ độc', '#B07CF0']];
  return (
    <>
      <Top idx={3} title="Nguyên nhân tăng AG: GOLDMARK" />
      <div style={{position: 'absolute', left: 160, top: 170, width: 1600, display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 14, fontFamily: FONT}}>
        {GM.map(([l, w, n], i) => {
          const s0 = i < 4 ? S[1] + (i * D[1]) / 4 : S[2] + ((i - 4) * D[2]) / 4;
          const p = ap(t, S[0] + i * 0.12), on = ap(t, s0);
          return (
            <div key={l} style={{height: 330, borderRadius: 20, background: on > 0.5 ? 'rgba(245,184,61,.16)' : 'rgba(255,255,255,.05)', border: `3px solid ${on > 0.5 ? K.amber : K.line}`, textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
              <div style={{fontSize: 110, fontWeight: 900, color: K.amber, marginTop: 14}}>{l}</div>
              <div style={{fontSize: 27, fontWeight: 800, color: K.txt, opacity: on, padding: '0 6px'}}>{w}</div>
              <div style={{fontSize: 21, fontWeight: 600, color: K.dim, opacity: on, marginTop: 8, padding: '0 8px'}}>{n}</div>
            </div>
          );
        })}
      </div>
      <Tx x={160} y={560} w={1600} al="center" size={34} c={K.dim} b={700} a={ap(t, S[3])}>Hay gặp nhất trên lâm sàng</Tx>
      <div style={{position: 'absolute', left: 160, top: 620, width: 1600, display: 'flex', justifyContent: 'center', gap: 30, fontFamily: FONT}}>
        {grp.map(([g, c], i) => {
          const p = ap(t, S[3] + 0.4 + i * 0.4);
          return <div key={g} style={{padding: '18px 44px', borderRadius: 999, background: c, color: c === K.amber ? K.ink : '#fff', fontSize: 46, fontWeight: 900, opacity: p, transform: `scale(${0.8 + 0.2 * p})`}}>{g}</div>;
        })}
      </div>
    </>
  );
};

// ---------- 5 Lactic + ceton ----------
const Chain: React.FC<{items: string[]; s0: number; step: number; y: number; c: string}> = ({items, s0, step, y, c}) => {
  const t = useSec();
  return (
    <div style={{position: 'absolute', left: 160, top: y, width: 1600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, fontFamily: FONT}}>
      {items.map((w, i) => (
        <React.Fragment key={w}>
          {i > 0 ? <div style={{fontSize: 50, color: c, opacity: ap(t, s0 + i * step)}}>→</div> : null}
          <div style={{padding: '18px 30px', borderRadius: 20, background: `${c}22`, border: `3px solid ${c}`, fontSize: 38, fontWeight: 800, color: K.txt, opacity: ap(t, s0 + i * step), whiteSpace: 'nowrap'}}>{chem(w)}</div>
        </React.Fragment>
      ))}
    </div>
  );
};
const E5: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  return (
    <>
      <Top idx={4} title="Toan lactic và nhiễm toan ceton" />
      <Pill x={960} y={160} a={ap(t, S[0])} c={K.o2} size={36} dark={false}>TOAN LACTIC · hay gặp nhất ở hồi sức</Pill>
      <Chain items={['Sốc', 'Tưới máu mô kém', 'Chuyển hoá yếm khí', 'Lactate ↑']} s0={S[1]} step={D[1] / 4} y={270} c={K.o2} />
      <GoldC y={400} a={ap(t, S[2])} size={50}>Lactate &gt; 2 mmol/L: tăng</GoldC>
      <Panel x={260} y={560} w={1400} h={260} c={K.amber} s0={S[3]}>
        <Tx x={0} y={24} w={1400} al="center" size={30} c={K.amber} b={800}>NHIỄM TOAN CETON</Tx>
        <Tx x={0} y={78} w={1400} al="center" size={42} b={800}>Đái tháo đường · nhịn đói · rượu</Tx>
        <Tx x={0} y={160} w={1400} al="center" size={34} c={K.dim} b={700}>Nên đo β-hydroxybutyrate trong máu</Tx>
      </Panel>
    </>
  );
};

// ---------- 6 Khoảng trống thẩm thấu ----------
const E6: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={5} title="Khoảng trống áp lực thẩm thấu" />
      <Tx x={160} y={170} w={1600} al="center" size={42} b={700} a={ap(t, S[0])}>Nghi ngộ độc rượu độc?</Tx>
      <GoldC y={270} a={ap(t, S[1])} size={50}>ALTT tính = 2 × Na⁺ + glucose + urê</GoldC>
      <Tx x={160} y={370} w={1600} al="center" size={28} c={K.dim} a={ap(t, S[1] + 0.5)}>đơn vị mmol/L</Tx>
      <Card x={260} y={470} w={620} h={230} c={K.co2} s0={S[2]} head="KHOẢNG TRỐNG THẨM THẤU" body="ALTT đo − ALTT tính" size={44} />
      <Card x={1040} y={470} w={620} h={230} c={K.o2} s0={S[2] + 1.5} head="> 10 mOsm/kg" body="Nghi methanol, ethylene glycol" size={40} glow={ap(t, S[2] + 2.5)} />
    </>
  );
};

// ---------- 7 Mất HCO₃⁻ ----------
const E7: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const u = interpolate(t, [S[1], S[1] + 2.2], [0, 1], clamp);
  return (
    <>
      <Top idx={6} title="Nhánh 2 · Mất HCO₃⁻ → AG bình thường" />
      <Ions x={200} cl={102 + 12 * u} hco3={24 - 12 * u} a={ap(t, S[0])} />
      <Card x={800} y={190} w={960} h={180} c={K.green} s0={S[0]} head="KHÔNG CÓ ACID LẠ" body="Không thêm anion không đo được" />
      <Card x={800} y={410} w={960} h={180} c={K.co2} s0={S[1]} head="CƠ THỂ MẤT HCO₃⁻" body="Cl⁻ tăng lên bù chỗ trống" />
      <Res x={950} y={650} s0={S[2]} c={K.green}>AG giữ nguyên = toan tăng Clo</Res>
    </>
  );
};

// ---------- 8 Nguyên nhân AG bình thường ----------
const E8: React.FC<{S: number[]; D: number[]}> = ({S}) => (
  <>
    <Top idx={7} title="Nguyên nhân toan AG bình thường" />
    <Card x={140} y={220} w={520} h={420} c={K.amber} s0={S[0]} head="MẤT QUA RUỘT" body="Tiêu chảy · dò tiêu hoá" size={46} />
    <Card x={700} y={220} w={520} h={420} c={K.hco3} s0={S[1]} head="MẤT QUA THẬN" body="Toan hoá ống thận" size={46} />
    <Card x={1260} y={220} w={520} h={420} c={K.co2} s0={S[2]} head="DO ĐIỀU TRỊ" body="Truyền nhiều NaCl 0,9%" size={46} />
  </>
);

// ---------- 9 AG niệu ----------
const E9: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={8} title="AG niệu: ruột hay thận?" />
      <Tx x={160} y={170} w={1600} al="center" size={42} b={700} a={ap(t, S[0])}>Mất HCO₃⁻ qua ruột hay qua thận?</Tx>
      <GoldC y={260} a={ap(t, S[1])} size={50}>AG niệu = Na⁺ niệu + K⁺ niệu − Cl⁻ niệu</GoldC>
      <Card x={200} y={420} w={720} h={300} c={K.amber} s0={S[2]} head="ÂM ( − )" body="Mất qua RUỘT" sub="thận vẫn thải acid tốt" size={56} glow={ap(t, S[2] + 1.5)} />
      <Card x={1000} y={420} w={720} h={300} c={K.hco3} s0={S[3]} head="DƯƠNG ( + )" body="Toan hoá ống thận" sub="thận không thải được acid" size={56} />
    </>
  );
};

// ---------- 10 Giải ca toan ----------
const E10: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={9} title="Giải hai ca toan" />
      <Card x={160} y={170} w={760} h={330} c={K.o2} s0={S[0]} head="BỆNH NHÂN A · AG 26" body="Thêm acid → toan lactic do sốc" size={46} glow={0.3} />
      <Card x={1000} y={170} w={760} h={330} c={K.green} s0={S[1]} head="BỆNH NHÂN B · AG 12" body="Mất HCO₃⁻ qua tiêu chảy" size={46} glow={0.3} />
      <Chain items={['Toan chuyển hoá', 'Tính AG', 'Tăng: thêm acid', 'Bình thường: mất HCO₃⁻']} s0={S[2]} step={0.6} y={580} c={K.amber} />
    </>
  );
};

// ---------- 11 Kiềm chuyển hoá ----------
const E11: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  return (
    <>
      <Top idx={10} title="Phần 2 · Kiềm chuyển hoá" />
      <Pill x={960} y={150} a={ap(t, S[0])} c={K.hco3} size={34}>PHẦN 2 · HCO₃⁻ TĂNG</Pill>
      <Card x={120} y={250} w={600} h={330} c={K.hco3} s0={S[1]} head="KHỞI PHÁT" body="Mất H⁺: nôn ói, lợi tiểu · hoặc thêm kiềm" size={40} />
      <Svg><g opacity={ap(t, S[2])}><Kid x={960} y={430} h={330} /></g></Svg>
      <Tx x={760} y={610} w={400} al="center" size={30} c={K.green} b={800} a={ap(t, S[2] + 0.3)}>Thận khoẻ thải HCO₃⁻ dư rất nhanh</Tx>
      <Card x={1200} y={250} w={600} h={330} c={K.o2} s0={S[3]} head="KIỀM KÉO DÀI KHI" body="Thiếu dịch · thiếu Clo · thiếu Kali" size={42} glow={ap(t, S[3] + D[3] * 0.5)} />
      <Tx x={1200} y={600} w={600} al="center" size={28} c={K.dim} a={ap(t, S[3] + 1)}>thận buộc phải giữ HCO₃⁻ lại</Tx>
    </>
  );
};

// ---------- 12 Ca C ----------
const E12: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const X0 = 720, W = 1060;
  const px = (v: number) => X0 + ((v - 36) / (56 - 36)) * W;
  return (
    <>
      <Top idx={11} title="Bệnh nhân C: nôn ói nhiều ngày" />
      <Slip s0={S[0]} rows={ROWS_C} hl={t > S[2] ? ['hco3', 'co2'] : t > S[1] ? ['ph', 'co2', 'hco3'] : []} title="BỆNH NHÂN C" y={190} />
      <Res x={720} y={190} s0={S[1] + 1.5} c={K.hco3}>KIỀM CHUYỂN HOÁ</Res>
      <Gold x={720} y={330} a={ap(t, S[2])} size={42}>HCO₃⁻ ↑ 12 → PaCO₂ ↑ ≈ 0,7 × 12 ≈ 8</Gold>
      <Tx x={720} y={440} w={1060} size={40} b={800} a={ap(t, S[2] + D[2] * 0.6)}>PaCO₂ dự kiến ≈ 40 + 8 = 48</Tx>
      <div style={{position: 'absolute', left: X0, top: 590, width: W, height: 14, borderRadius: 7, background: 'rgba(255,255,255,.15)', opacity: ap(t, S[2] + D[2] * 0.6)}} />
      {[36, 40, 44, 48, 52, 56].map((v) => <Tx key={v} x={px(v) - 40} y={630} w={80} al="center" size={28} c={K.dim} a={ap(t, S[2] + D[2] * 0.6)}>{String(v)}</Tx>)}
      <div style={{position: 'absolute', left: px(48) - 4, top: 560, width: 8, height: 74, background: K.amber, opacity: ap(t, S[2] + D[2] * 0.7)}} />
      <div style={{position: 'absolute', left: px(47) - 22, top: 575, width: 44, height: 44, borderRadius: '50%', background: K.txt, border: `6px solid ${K.green}`, opacity: ap(t, S[3])}} />
      <Pill x={px(47)} y={505} a={ap(t, S[3])} c={K.green} size={30}>PaCO₂ thật 47</Pill>
      <Res x={720} y={700} s0={S[3] + 1} c={K.green}>Phổi bù đủ ✓ (thở chậm lại)</Res>
    </>
  );
};

// ---------- 13 Clo niệu ----------
const E13: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const c = ap(t, S[4]);
  return (
    <>
      <Top idx={12} title="Clo niệu: phân loại kiềm chuyển hoá" />
      <Tx x={160} y={160} w={1600} al="center" size={40} b={700} a={ap(t, S[0])}>Tìm nguyên nhân: đo Clo niệu</Tx>
      <Panel x={140} y={240} w={800} h={560} c={K.green} s0={S[1]} glow={c}>
        <Tx x={0} y={26} w={800} al="center" size={30} c={K.green} b={800}>CLO NIỆU &lt; 20 mmol/L</Tx>
        <Tx x={0} y={76} w={800} al="center" size={52} b={900}>ĐÁP ỨNG MUỐI</Tx>
        <Tx x={40} y={170} w={720} al="center" size={34} b={700}>Nôn ói · hút dịch dạ dày · sau ngưng lợi tiểu</Tx>
        <Tx x={40} y={330} w={720} al="center" size={34} c={K.amber} b={800} a={ap(t, S[2])}>→ Truyền NaCl 0,9% · bù Kali</Tx>
        <Tx x={40} y={450} w={720} al="center" size={36} c={K.green} b={900} a={c}>★ Bệnh nhân C</Tx>
      </Panel>
      <Panel x={980} y={240} w={800} h={560} c={K.o2} s0={S[3]}>
        <Tx x={0} y={26} w={800} al="center" size={30} c={K.o2} b={800}>CLO NIỆU &gt; 20 mmol/L</Tx>
        <Tx x={0} y={76} w={800} al="center" size={52} b={900}>KHÔNG ĐÁP ỨNG MUỐI</Tx>
        <Tx x={40} y={170} w={720} al="center" size={34} b={700}>Cường aldosterone · đang dùng lợi tiểu · hạ Kali nặng</Tx>
      </Panel>
    </>
  );
};

// ---------- 14 Ôn tập ----------
const E14: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const nx = usePop(S[2] + 0.3);
  return (
    <>
      <Top idx={13} title="Ôn tập" />
      <Card x={160} y={190} w={760} h={420} c={K.o2} s0={S[0]} head="HCO₃⁻ GIẢM ↓ · TOAN" body="Tính AG → thêm acid hay mất HCO₃⁻?" size={46} />
      <Card x={1000} y={190} w={760} h={420} c={K.hco3} s0={S[1]} head="HCO₃⁻ TĂNG ↑ · KIỀM" body="Đo Clo niệu → đáp ứng muối hay không?" size={46} />
      {nx > 0.01 && (
        <div style={{position: 'absolute', left: 560, top: 690, width: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '16px 0', borderRadius: 999, border: `2px solid ${K.amber}`, background: 'rgba(245,184,61,.08)', fontFamily: FONT, opacity: Math.min(1, nx * 1.5)}}>
          <span style={{fontSize: 28, fontWeight: 800, color: K.amber, letterSpacing: 1}}>BÀI 6</span>
          <span style={{fontSize: 34, fontWeight: 700, color: K.txt}}>Toan và kiềm hô hấp</span>
        </div>
      )}
    </>
  );
};

const SC: React.FC<{S: number[]; D: number[]}>[] = [E1, E2, E3, E4, E5, E6, E7, E8, E9, E10, E11, E12, E13, E14];

export const Abg5: React.FC = () => (
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
