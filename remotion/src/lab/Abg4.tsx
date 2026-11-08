// Giải mã khí máu · Bài 4: Quy trình đọc khí máu 6 bước (10 cảnh)
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
const NAMES = ['MỞ ĐẦU', 'B1 TIN?', 'B2 pH', 'B3 NGUỒN', 'B4 BÙ', 'BÙ KHÁC', 'B5 AG', 'B6 Δ/Δ', 'KẾT LUẬN', 'ÔN TẬP'];

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
      <Tx x={44} y={22} size={24} c={K.dim} b={600}>GIẢI MÃ KHÍ MÁU · BÀI 4</Tx>
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

// Phiếu khí máu của ca bệnh (bên trái)
const ROWS: [string, string, string, string][] = [['ph', 'pH', '7,28', ''], ['co2', 'PaCO₂', '26', 'mmHg'], ['hco3', 'HCO₃⁻', '12', 'mmol/L'], ['na', 'Na⁺', '135', 'mmol/L'], ['cl', 'Cl⁻', '98', 'mmol/L']];
const Slip: React.FC<{s0: number; hl?: string[]; x?: number}> = ({s0, hl = [], x = 80}) => {
  const p = usePop(s0);
  const f = useCurrentFrame();
  if (p <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: x, top: 170, width: 500, padding: '22px 26px', borderRadius: 18, background: '#F4F1EA', boxShadow: '0 20px 50px rgba(0,0,0,.5)', fontFamily: FONT, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * -60}px) rotate(-1.2deg)`}}>
      <div style={{fontSize: 22, fontWeight: 800, letterSpacing: 3, color: '#6B5A3A'}}>PHIẾU KHÍ MÁU ĐỘNG MẠCH</div>
      <div style={{height: 3, background: '#CDBFA5', margin: '10px 0 8px'}} />
      {ROWS.map(([k, n, v, u], i) => {
        const on = hl.includes(k);
        return (
          <React.Fragment key={k}>
            {i === 3 ? <div style={{fontSize: 18, fontWeight: 800, letterSpacing: 2, color: '#8A7A5C', margin: '10px 0 2px'}}>ĐIỆN GIẢI</div> : null}
            <div style={{display: 'flex', alignItems: 'baseline', padding: '8px 14px', borderRadius: 12, background: on ? `rgba(245,184,61,${0.35 + 0.1 * Math.sin(f / 6)})` : 'transparent', border: on ? '3px solid #E09A10' : '3px solid transparent'}}>
              <span style={{width: 190, fontSize: 38, fontWeight: 700, color: K.ink}}>{chem(n)}</span>
              <span style={{fontSize: 52, fontWeight: 900, color: K.ink, width: 140}}>{v}</span>
              <span style={{fontSize: 24, color: '#6B5A3A'}}>{u}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
const StepHead: React.FC<{n: string; q: string; s0: number}> = ({n, q, s0}) => {
  const p = usePop(s0);
  return (
    <div style={{position: 'absolute', left: 680, top: 160, display: 'flex', alignItems: 'center', gap: 22, fontFamily: FONT, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 20}px)`}}>
      <div style={{padding: '8px 22px', borderRadius: 14, background: K.amber, color: K.ink, fontSize: 32, fontWeight: 900}}>BƯỚC {n}</div>
      <div style={{fontSize: 48, fontWeight: 800, color: K.txt}}>{chem(q)}</div>
    </div>
  );
};
const Res: React.FC<{x: number; y: number; s0: number; c: string; children: string}> = ({x, y, s0, c, children}) => {
  const p = usePop(s0, 10);
  if (p <= 0.01) return null;
  return <div style={{position: 'absolute', left: x, top: y, padding: '14px 40px', borderRadius: 999, background: c, color: c === K.o2 ? '#fff' : K.ink, fontFamily: FONT, fontSize: 56, fontWeight: 900, transform: `scale(${p})`, transformOrigin: 'left center', boxShadow: `0 0 40px ${c}88`, whiteSpace: 'nowrap'}}>{chem(children)}</div>;
};

// ---------- 1 Mở đầu ----------
const STEPS = ['Tin được?', 'Toan / kiềm?', 'Hô hấp / chuyển hoá?', 'Bù đủ?', 'AG?', 'Delta–delta?'];
const D1: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={0} title="Đọc phiếu khí máu từ đâu?" />
      <Slip s0={S[2]} />
      <Big x={0} y={360} w={1920} a={ap(t, S[0]) * (1 - ap(t, S[1] - 0.3))} size={110}>Đọc từ đâu?</Big>
      <Panel x={680} y={170} w={1140} h={170} c={K.o2} s0={S[1]}>
        <Tx x={36} y={28} w={1070} size={30} c={K.o2} b={800}>CA BỆNH</Tx>
        <Tx x={36} y={74} w={1070} size={42} b={700}>Đái tháo đường · nôn ói · thở nhanh, sâu</Tx>
      </Panel>
      <div style={{position: 'absolute', left: 680, top: 400, width: 1140, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, fontFamily: FONT}}>
        {STEPS.map((q, i) => {
          const p = ap(t, S[3] + i * 0.35);
          return (
            <div key={q} style={{height: 150, borderRadius: 20, background: 'rgba(245,184,61,.1)', border: `3px solid ${K.amber}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: p, transform: `scale(${0.8 + 0.2 * p})`}}>
              <div style={{fontSize: 26, fontWeight: 800, color: K.amber}}>BƯỚC {i + 1}</div>
              <div style={{fontSize: 38, fontWeight: 800, color: K.txt}}>{q}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ---------- 2 Bước 1 ----------
const D2: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  return (
    <>
      <Top idx={1} title="Bước 1 · Phiếu có đáng tin?" />
      <Slip s0={0} hl={t > S[1] ? ['ph', 'co2', 'hco3'] : []} />
      <StepHead n="1" q="Phiếu có đáng tin không?" s0={S[0]} />
      <Gold x={680} y={270} a={ap(t, S[1])} size={52}>H⁺ = 24 × PaCO₂ ÷ HCO₃⁻</Gold>
      <Panel x={680} y={390} w={1140} h={150} c={K.co2} s0={S[2]}>
        <Tx x={36} y={22} w={1070} size={28} c={K.co2} b={800}>MẸO NHANH · pH 7,2–7,5</Tx>
        <Tx x={36} y={66} w={1070} size={44} b={800}>H⁺ ≈ 80 − hai số lẻ của pH</Tx>
      </Panel>
      <Panel x={680} y={580} w={540} h={230} c={K.line} s0={S[3]}>
        <Tx x={0} y={22} w={540} al="center" size={28} c={K.dim} b={800}>THEO CÔNG THỨC</Tx>
        <Tx x={0} y={68} w={540} al="center" size={38} b={700}>24 × 26 ÷ 12</Tx>
        <Big x={0} y={118} w={540} a={ap(t, S[3] + 1)} size={84} c={K.amber}>= 52</Big>
      </Panel>
      <Panel x={1280} y={580} w={540} h={230} c={K.line} s0={S[3] + D[3] * 0.35}>
        <Tx x={0} y={22} w={540} al="center" size={28} c={K.dim} b={800}>THEO pH 7,28</Tx>
        <Tx x={0} y={68} w={540} al="center" size={38} b={700}>80 − 28</Tx>
        <Big x={0} y={118} w={540} a={ap(t, S[3] + D[3] * 0.45)} size={84} c={K.amber}>= 52</Big>
      </Panel>
      <Res x={1060} y={840} s0={S[3] + D[3] * 0.7} c={K.green}>Khớp ✓ đáng tin</Res>
    </>
  );
};

// ---------- 3 Bước 2 ----------
const D3: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const X0 = 700, W = 1100;
  const px = (v: number) => X0 + ((v - 7.1) / (7.7 - 7.1)) * W;
  return (
    <>
      <Top idx={2} title="Bước 2 · Toan hay kiềm?" />
      <Slip s0={0} hl={['ph']} />
      <StepHead n="2" q="Toan máu hay kiềm máu?" s0={S[0]} />
      <div style={{position: 'absolute', left: X0, top: 340, width: W, height: 70, borderRadius: 35, background: 'linear-gradient(90deg,#C8323B 0%,#E5484D 35%,#3FB27F 42%,#3FB27F 58%,#3A7BE0 65%,#2B4FB0 100%)', opacity: ap(t, S[1])}} />
      {([[7.2, '7,20'], [7.35, '7,35'], [7.45, '7,45'], [7.6, '7,60']] as [number, string][]).map(([v, l]) => <Tx key={l} x={px(v) - 60} y={420} w={120} al="center" size={30} c={K.dim} b={700} a={ap(t, S[1] + 0.3)}>{l}</Tx>)}
      <Tx x={X0} y={480} w={420} size={38} c={K.o2} b={800} a={ap(t, S[1] + 0.6)}>◀ TOAN dưới 7,35</Tx>
      <Tx x={X0 + W - 420} y={480} w={420} al="right" size={38} c="#6E9BEA" b={800} a={ap(t, S[1] + 0.6)}>trên 7,45 KIỀM ▶</Tx>
      <div style={{position: 'absolute', left: px(7.28) - 5, top: 310, width: 10, height: 130, borderRadius: 5, background: K.txt, boxShadow: '0 0 20px #fff', opacity: ap(t, S[2])}} />
      <Pill x={px(7.28)} y={250} a={ap(t, S[2])} c={K.txt} size={36}>pH 7,28</Pill>
      <Res x={980} y={620} s0={S[2] + 0.6} c={K.o2}>TOAN MÁU</Res>
    </>
  );
};

// ---------- 4 Bước 3 ----------
const Cell: React.FC<{x: number; y: number; c: string; t1: string; t2: string; a: number; on: number}> = ({x, y, c, t1, t2, a, on}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 540, height: 190, borderRadius: 22, background: on > 0.5 ? `${c}33` : 'rgba(255,255,255,.05)', border: `4px solid ${on > 0.5 ? c : K.line}`, boxShadow: on > 0.5 ? `0 0 40px ${c}88` : 'none', fontFamily: FONT, textAlign: 'center', opacity: a, transform: `scale(${1 + 0.04 * on})`}}>
    <div style={{fontSize: 38, fontWeight: 800, color: K.txt, marginTop: 34}}>{chem(t1)}</div>
    <div style={{fontSize: 54, fontWeight: 900, color: c, marginTop: 8}}>{chem(t2)}</div>
  </div>
);
const D4: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const on = ap(t, S[3] + 0.6);
  return (
    <>
      <Top idx={3} title="Bước 3 · Hô hấp hay chuyển hoá?" />
      <Slip s0={0} hl={t > S[3] ? ['hco3'] : t > S[1] ? ['co2', 'hco3'] : []} />
      <StepHead n="3" q="Hô hấp hay chuyển hoá?" s0={S[0]} />
      <Tx x={680} y={250} w={1140} size={36} c={K.dim} b={700} a={ap(t, S[1])}>Chỉ số nào giải thích được hướng của pH?</Tx>
      <Tx x={700} y={315} w={540} al="center" size={32} c={K.co2} b={800} a={ap(t, S[2])}>HÔ HẤP</Tx>
      <Tx x={1270} y={315} w={540} al="center" size={32} c={K.hco3} b={800} a={ap(t, S[2])}>CHUYỂN HOÁ</Tx>
      <Cell x={700} y={370} c={K.co2} t1="Toan hô hấp" t2="PaCO₂ ↑" a={ap(t, S[2] + 0.3)} on={0} />
      <Cell x={1270} y={370} c={K.o2} t1="Toan chuyển hoá" t2="HCO₃⁻ ↓" a={ap(t, S[2] + 0.8)} on={on} />
      <Cell x={700} y={590} c={K.co2} t1="Kiềm hô hấp" t2="PaCO₂ ↓" a={ap(t, S[2] + 1.6) * 0.75} on={0} />
      <Cell x={1270} y={590} c={K.hco3} t1="Kiềm chuyển hoá" t2="HCO₃⁻ ↑" a={ap(t, S[2] + 1.6) * 0.75} on={0} />
      <Res x={1000} y={820} s0={S[3] + 1} c={K.o2}>TOAN CHUYỂN HOÁ</Res>
    </>
  );
};

// ---------- 5 Bước 4 ----------
const D5: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const X0 = 720, W = 1060;
  const px = (v: number) => X0 + ((v - 18) / (34 - 18)) * W;
  return (
    <>
      <Top idx={4} title="Bước 4 · Bù trừ có đủ?" />
      <Slip s0={0} hl={t > S[3] ? ['co2', 'hco3'] : ['hco3']} />
      <StepHead n="4" q="Bù trừ có đủ không?" s0={S[0]} />
      <Pill x={900} y={258} a={ap(t, S[1])} c={K.o2} size={32} dark={false}>Toan chuyển hoá → Winter</Pill>
      <Gold x={680} y={340} a={ap(t, S[2])} size={50}>PaCO₂ dự kiến = 1,5 × HCO₃⁻ + 8 ± 2</Gold>
      <Tx x={680} y={470} w={1140} size={44} b={800} a={ap(t, S[3])}>1,5 × 12 + 8 = 26 → khoảng 24–28</Tx>
      <div style={{position: 'absolute', left: X0, top: 600, width: W, height: 14, borderRadius: 7, background: 'rgba(255,255,255,.15)', opacity: ap(t, S[3])}} />
      <div style={{position: 'absolute', left: px(24), top: 580, width: px(28) - px(24), height: 54, borderRadius: 14, background: 'rgba(63,178,127,.45)', border: `3px solid ${K.green}`, opacity: ap(t, S[3] + 0.6)}} />
      {[18, 22, 26, 30, 34].map((v) => <Tx key={v} x={px(v) - 40} y={650} w={80} al="center" size={28} c={K.dim} a={ap(t, S[3])}>{String(v)}</Tx>)}
      <div style={{position: 'absolute', left: px(26) - 22, top: 585, width: 44, height: 44, borderRadius: '50%', background: K.txt, border: `6px solid ${K.green}`, opacity: ap(t, S[3] + D[3] * 0.5)}} />
      <Pill x={px(26)} y={500} a={ap(t, S[3] + D[3] * 0.5)} c={K.green} size={30}>PaCO₂ thật 26</Pill>
      <Res x={680} y={720} s0={S[3] + D[3] * 0.75} c={K.green}>Bù đủ ✓</Res>
      <Panel x={1080} y={710} w={740} h={130} c={K.amber} s0={S[4]}>
        <Tx x={30} y={22} w={680} al="center" size={34} b={800}>Ngoài khoảng dự kiến → có thêm rối loạn hô hấp</Tx>
      </Panel>
    </>
  );
};

// ---------- 6 Công thức bù khác ----------
const Rule: React.FC<{y: number; s0: number; c: string; name: string; rule: string}> = ({y, s0, c, name, rule}) => (
  <Panel x={160} y={y} w={1600} h={170} c={c} s0={s0}>
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 40px', gap: 40, fontFamily: FONT}}>
      <div style={{width: 380, fontSize: 44, fontWeight: 900, color: c}}>{name}</div>
      <div style={{fontSize: 44, fontWeight: 800, color: K.txt}}>{chem(rule)}</div>
    </div>
  </Panel>
);
const D6: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={5} title="Công thức bù của các rối loạn khác" />
      <Tx x={160} y={160} w={1600} al="center" size={40} c={K.dim} b={700} a={ap(t, S[0])}>Mỗi rối loạn có một mức bù dự kiến</Tx>
      <Rule y={250} s0={S[1]} c={K.hco3} name="Kiềm chuyển hoá" rule="HCO₃⁻ ↑ 1  →  PaCO₂ ↑ ≈ 0,7" />
      <Rule y={450} s0={S[2]} c={K.co2} name="Toan hô hấp" rule="PaCO₂ ↑ 10  →  HCO₃⁻ ↑ 1 (cấp) · 3,5–4 (mạn)" />
      <Rule y={650} s0={S[3]} c="#7DA8F0" name="Kiềm hô hấp" rule="PaCO₂ ↓ 10  →  HCO₃⁻ ↓ 2 (cấp) · 4–5 (mạn)" />
    </>
  );
};

// ---------- 7 Bước 5 AG ----------
const D7: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const k = 3.6, base = 860;
  const col = (x: number, items: [number, string, string][], a: number) => {
    let y = base;
    return items.map(([v, l, c], i) => {
      y -= v * k;
      return (
        <div key={i} style={{position: 'absolute', left: x, top: y, width: 230, height: v * k - 4, borderRadius: 12, background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 34, fontWeight: 900, color: '#fff', opacity: a, border: l.startsWith('AG') ? `4px dashed ${K.txt}` : 'none'}}>{chem(l)}</div>
      );
    });
  };
  return (
    <>
      <Top idx={6} title="Bước 5 · Khoảng trống anion" />
      <Slip s0={0} hl={['na', 'cl', 'hco3']} />
      <StepHead n="5" q="Khoảng trống anion (AG)" s0={S[0]} />
      <Gold x={680} y={260} a={ap(t, S[1])} size={46}>AG = Na⁺ − (Cl⁻ + HCO₃⁻) · bình thường ≈ 12</Gold>
      {col(720, [[135, 'Na⁺ 135', '#C9822E']], ap(t, S[2]))}
      {col(980, [[98, 'Cl⁻ 98', '#3A7BE0'], [12, 'HCO₃⁻ 12', K.hco3], [25, 'AG 25', 'rgba(229,72,77,.85)']], ap(t, S[2] + 0.6))}
      <Tx x={720} y={base + 10} w={230} al="center" size={26} c={K.dim} a={ap(t, S[2])}>cation</Tx>
      <Tx x={980} y={base + 10} w={230} al="center" size={26} c={K.dim} a={ap(t, S[2] + 0.6)}>anion</Tx>
      <Tx x={1260} y={380} w={560} size={40} b={800} a={ap(t, S[2] + 0.3)}>135 − (98 + 12) = 25</Tx>
      <Res x={1260} y={450} s0={S[2] + D[2] * 0.6} c={K.o2}>AG TĂNG</Res>
      <Panel x={1260} y={600} w={560} h={220} c={K.amber} s0={S[3]}>
        <Tx x={0} y={22} w={560} al="center" size={28} c={K.amber} b={800}>LƯU Ý ALBUMIN</Tx>
        <Tx x={26} y={66} w={508} al="center" size={32} b={700}>Albumin giảm 1 g/dL → cộng thêm ≈ 2,5 vào AG</Tx>
      </Panel>
    </>
  );
};

// ---------- 8 Bước 6 delta-delta ----------
const D8: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const X0 = 720, W = 1080;
  const px = (v: number) => X0 + (v / 3) * W;
  const mk = interpolate(t, [S[3] + 0.5, S[3] + 2], [0, 1.08], clamp);
  return (
    <>
      <Top idx={7} title="Bước 6 · Delta–delta" />
      <Slip s0={0} hl={['hco3']} />
      <StepHead n="6" q="Delta–delta (khi AG tăng)" s0={S[0]} />
      <Gold x={680} y={260} a={ap(t, S[1])} size={48}>Δ/Δ = (AG − 12) ÷ (24 − HCO₃⁻)</Gold>
      <div style={{position: 'absolute', left: px(0), top: 420, width: px(1) - px(0), height: 80, background: K.co2, borderRadius: '40px 0 0 40px', opacity: ap(t, S[2])}} />
      <div style={{position: 'absolute', left: px(1), top: 420, width: px(2) - px(1), height: 80, background: K.green, opacity: ap(t, S[2] + 0.8)}} />
      <div style={{position: 'absolute', left: px(2), top: 420, width: px(3) - px(2), height: 80, background: K.hco3, borderRadius: '0 40px 40px 0', opacity: ap(t, S[2] + 1.6)}} />
      {[0, 1, 2, 3].map((v) => <Tx key={v} x={px(v) - 30} y={510} w={60} al="center" size={30} c={K.dim} b={700} a={ap(t, S[2])}>{String(v)}</Tx>)}
      <Tx x={px(0)} y={570} w={px(1) - px(0)} al="center" size={30} c={K.co2} b={800} a={ap(t, S[2])}>{'< 1: thêm toan AG bình thường'}</Tx>
      <Tx x={px(1)} y={570} w={px(2) - px(1)} al="center" size={30} c={K.green} b={800} a={ap(t, S[2] + 0.8)}>1–2: đơn thuần</Tx>
      <Tx x={px(2)} y={570} w={px(3) - px(2)} al="center" size={30} c={K.hco3} b={800} a={ap(t, S[2] + 1.6)}>{'> 2: thêm kiềm chuyển hoá'}</Tx>
      <div style={{position: 'absolute', left: px(mk) - 5, top: 395, width: 10, height: 130, borderRadius: 5, background: K.txt, boxShadow: '0 0 20px #fff', opacity: ap(t, S[3])}} />
      <Tx x={680} y={680} w={700} size={44} b={800} a={ap(t, S[3])}>(25 − 12) ÷ (24 − 12) = 13 ÷ 12 ≈ 1,1</Tx>
      <Res x={1400} y={670} s0={S[3] + D[3] * 0.6} c={K.green}>Đơn thuần</Res>
    </>
  );
};

// ---------- 9 Kết luận ----------
const D9: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const lines: [string, string][] = [['Tin được', '✓'], ['Toan máu', '7,28'], ['Toan chuyển hoá', 'HCO₃⁻ 12'], ['Bù hô hấp đủ', 'PaCO₂ 26'], ['AG tăng', '25'], ['Đơn thuần', 'Δ/Δ ≈ 1,1']];
  return (
    <>
      <Top idx={8} title="Kết luận ca bệnh" />
      <Panel x={160} y={160} w={820} h={680} c={K.amber} s0={S[0]}>
        {lines.map(([a, b], i) => (
          <div key={a} style={{position: 'absolute', left: 40, top: 40 + i * 104, width: 740, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: FONT, opacity: ap(t, S[0] + 0.3 + i * 0.3)}}>
            <span style={{fontSize: 40, fontWeight: 800, color: K.txt}}><span style={{color: K.amber, marginRight: 16}}>{i + 1}</span>{a}</span>
            <span style={{fontSize: 36, fontWeight: 700, color: K.dim}}>{chem(b)}</span>
          </div>
        ))}
      </Panel>
      <Panel x={1060} y={160} w={700} h={300} c={K.o2} s0={S[0] + 0.5} glow={ap(t, S[1])}>
        <Tx x={30} y={40} w={640} al="center" size={44} b={900}>Toan chuyển hoá tăng AG, bù hô hấp đủ</Tx>
        <Tx x={30} y={190} w={640} al="center" size={36} c={K.amber} b={800} a={ap(t, S[1])}>→ Nhiễm toan ceton đái tháo đường</Tx>
      </Panel>
      <Panel x={1060} y={520} w={700} h={170} c={K.co2} s0={S[2]}>
        <Tx x={30} y={30} w={640} al="center" size={30} c={K.co2} b={800}>ĐỪNG QUÊN</Tx>
        <Tx x={30} y={78} w={640} al="center" size={40} b={800}>Đánh giá oxy hoá (Bài 3)</Tx>
      </Panel>
    </>
  );
};

// ---------- 10 Ôn tập ----------
const D10: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const nx = usePop(S[2] + 0.3);
  return (
    <>
      <Top idx={9} title="Ôn tập: 6 câu hỏi" />
      <div style={{position: 'absolute', left: 160, top: 180, width: 1600, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 26, fontFamily: FONT}}>
        {STEPS.map((q, i) => {
          const p = ap(t, (i < 3 ? S[0] : S[1]) + (i % 3) * 0.8);
          return (
            <div key={q} style={{height: 200, borderRadius: 24, background: 'rgba(245,184,61,.1)', border: `4px solid ${K.amber}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: p, transform: `scale(${0.8 + 0.2 * p})`}}>
              <div style={{fontSize: 30, fontWeight: 800, color: K.amber}}>BƯỚC {i + 1}</div>
              <div style={{fontSize: 46, fontWeight: 900, color: K.txt}}>{q}</div>
            </div>
          );
        })}
      </div>
      {nx > 0.01 && (
        <div style={{position: 'absolute', left: 460, top: 700, width: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '16px 0', borderRadius: 999, border: `2px solid ${K.amber}`, background: 'rgba(245,184,61,.08)', fontFamily: FONT, opacity: Math.min(1, nx * 1.5)}}>
          <span style={{fontSize: 28, fontWeight: 800, color: K.amber, letterSpacing: 1}}>BÀI 5</span>
          <span style={{fontSize: 34, fontWeight: 700, color: K.txt}}>Toan chuyển hoá tăng khoảng trống anion</span>
        </div>
      )}
    </>
  );
};

const SC: React.FC<{S: number[]; D: number[]}>[] = [D1, D2, D3, D4, D5, D6, D7, D8, D9, D10];

export const Abg4: React.FC = () => (
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
