// Giải mã khí máu · Bài 3: Đánh giá oxy hoá — PaO₂, P/F và chênh lệch A–a (10 cảnh)
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
const NAMES = ['MỞ ĐẦU', 'PaO₂', 'SaO₂', 'GIẢM O₂', 'P/F', 'ARDS', 'PAO₂', 'A–a', '5 CƠ CHẾ', 'GIẢI ĐỐ'];

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
      <Tx x={44} y={22} size={24} c={K.dim} b={600}>GIẢI MÃ KHÍ MÁU · BÀI 3</Tx>
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

const PN_AR = 358 / 304;
const Alv: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => <Organ src="abg_phenang.png" ar={PN_AR} x={x} y={y} w={w} />;

// ---------- Tiện ích bài 3 ----------
const Big: React.FC<{x: number; y: number; w: number; a: number; c?: string; size?: number; children: string}> = ({x, y, w, a, c = K.txt, size = 120, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: 'center', fontFamily: FONT, fontSize: size, fontWeight: 900, color: c, opacity: a, transform: `scale(${0.9 + 0.1 * a})`}}>{chem(children)}</div>
);
const Pill: React.FC<{x: number; y: number; a: number; c: string; size?: number; dark?: boolean; children: string}> = ({x, y, a, c, size = 34, dark = true, children}) => (
  <div style={{position: 'absolute', left: x, top: y, opacity: a, transform: `translate(-50%,0) scale(${0.85 + 0.15 * a})`, padding: '8px 26px', borderRadius: 999, background: c, color: dark ? K.ink : K.txt, fontFamily: FONT, fontSize: size, fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 10px 26px rgba(0,0,0,.4)'}}>{chem(children)}</div>
);
const O2Dots: React.FC<{x0: number; y0: number; x1: number; y1: number; n: number; a: number; speed?: number}> = ({x0, y0, x1, y1, n, a, speed = 60}) => {
  const f = useCurrentFrame();
  return (
    <g opacity={a}>
      {Array.from({length: n}, (_, i) => {
        const u = (f / speed + i / n) % 1;
        const x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u + Math.sin(u * 6 + i) * 14;
        return (
          <g key={i} transform={`translate(${x},${y})`} opacity={Math.sin(u * Math.PI)}>
            <circle r={24} fill={K.o2} /><text y={8} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={20} fill="#fff">O₂</text>
          </g>
        );
      })}
    </g>
  );
};

// ---------- 1 Mở đầu ----------
const Pt: React.FC<{x: number; s0: number; n: string; q: string; qa: number}> = ({x, s0, n, q, qa}) => (
  <Panel x={x} y={170} w={700} h={540} c={K.o2} s0={s0}>
    <Tx x={0} y={28} w={700} al="center" size={34} c={K.dim} b={800}>{`BỆNH NHÂN ${n}`}</Tx>
    <Tx x={0} y={110} w={700} al="center" size={44} c={K.o2} b={800}>PaO₂</Tx>
    <Big x={0} y={160} w={700} a={1} size={170} c={K.txt}>55</Big>
    <Tx x={0} y={360} w={700} al="center" size={30} c={K.dim}>mmHg</Tx>
    <Tx x={0} y={440} w={700} al="center" size={38} c={K.amber} b={800} a={qa}>{q}</Tx>
  </Panel>
);
const C1: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={0} title="Cùng PaO₂ 55, khác nguyên nhân" />
      <Pt x={190} s0={S[0]} n="1" q="Phổi tổn thương?" qa={ap(t, S[1])} />
      <Pt x={1030} s0={S[0] + 0.5} n="2" q="Chỉ thở yếu?" qa={ap(t, S[1] + 1.2)} />
      <div style={{position: 'absolute', left: 900, top: 380, width: 120, height: 120, borderRadius: '50%', background: K.amber, color: K.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 80, fontWeight: 900, opacity: ap(t, S[0] + 1), boxShadow: '0 12px 30px rgba(0,0,0,.5)'}}>=</div>
      <Memo x={460} y={760} w={1000} s0={S[2] + 0.4} size={44}>Phân biệt bằng một phiếu khí máu?</Memo>
    </>
  );
};

// ---------- 2 PaO₂ ----------
const C2: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const f = useCurrentFrame();
  return (
    <>
      <Top idx={1} title="PaO₂ là gì?" />
      <Svg>
        <g opacity={ap(t, S[0])}><Alv x={420} y={560} w={430} /></g>
        <Callout x={210} y={250} a={ap(t, S[0] + 0.6)} c="#FF9AA0">Phế nang</Callout>
        <rect x={700} y={520} width={420} height={110} rx={55} fill="url(#cap)" opacity={ap(t, S[1])} />
        <defs><linearGradient id="cap" x1="0" x2="1"><stop offset="0" stopColor="#7A1420" /><stop offset="1" stopColor="#C42A38" /></linearGradient></defs>
        {Array.from({length: 5}, (_, i) => {
          const u = (f / 90 + i / 5) % 1;
          return <ellipse key={i} cx={720 + u * 380} cy={575} rx={30} ry={22} fill="#E64A55" stroke="#6E0C18" strokeWidth={2} opacity={ap(t, S[1]) * Math.sin(u * Math.PI)} />;
        })}
        <O2Dots x0={560} y0={500} x1={900} y1={570} n={5} a={ap(t, S[1] + 0.4)} speed={70} />
      </Svg>
      <Tx x={700} y={650} w={420} al="center" size={30} c="#FF9AA0" b={700} a={ap(t, S[1] + 0.3)}>Máu động mạch</Tx>
      <Panel x={1210} y={170} w={600} h={300} c={K.o2} s0={S[0] + 0.3}>
        <Tx x={0} y={26} w={600} al="center" size={34} c={K.o2} b={800}>PaO₂</Tx>
        <Tx x={30} y={80} w={540} al="center" size={34} b={700}>Áp lực oxy hoà tan trong máu động mạch</Tx>
        <Tx x={0} y={190} w={600} al="center" size={30} c={K.dim} a={ap(t, S[1])}>oxy: phế nang → màng mỏng → máu</Tx>
      </Panel>
      <Panel x={1210} y={500} w={600} h={210} c={K.green} s0={S[2]}>
        <Tx x={0} y={22} w={600} al="center" size={28} c={K.green} b={800}>BÌNH THƯỜNG · KHÍ TRỜI</Tx>
        <Big x={0} y={62} w={600} a={1} size={92}>80–100</Big>
        <Tx x={0} y={168} w={600} al="center" size={26} c={K.dim}>mmHg</Tx>
      </Panel>
      <Memo x={1210} y={750} w={600} s0={S[3] + 0.3} size={38}>PaO₂ giảm dần theo tuổi</Memo>
    </>
  );
};

// ---------- 3 Đường cong phân ly ----------
const sat = (p: number) => {
  const r = Math.pow(p / 26.8, 2.7);
  return (100 * r) / (1 + r);
};
const C3: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const X0 = 240, X1 = 1140, Y0 = 860, Y1 = 220;
  const px = (p: number) => X0 + (p / 110) * (X1 - X0);
  const py = (s: number) => Y0 - (s / 100) * (Y0 - Y1);
  const pts = Array.from({length: 111}, (_, i) => `${px(i).toFixed(1)},${py(sat(i)).toFixed(1)}`).join(' L');
  const draw = interpolate(t, [S[1], S[1] + 2.5], [0, 1], clamp);
  const m = ap(t, S[2]);
  const cliff = ap(t, S[3]);
  const slide = interpolate(t, [S[3] + 1, S[3] + D[3] * 0.8], [60, 35], clamp);
  return (
    <>
      <Top idx={2} title="PaO₂ và SaO₂: đường cong chữ S" />
      <Svg>
        <rect x={X0} y={Y1} width={px(60) - X0} height={Y0 - Y1} fill="rgba(229,72,77,.14)" opacity={cliff} />
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={K.dim} strokeWidth={3} opacity={ap(t, S[0])} />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke={K.dim} strokeWidth={3} opacity={ap(t, S[0])} />
        {[0, 20, 40, 60, 80, 100].map((v) => (
          <g key={v} opacity={ap(t, S[0] + 0.3)}>
            <text x={px(v)} y={Y0 + 42} textAnchor="middle" fontFamily={FONT} fontSize={26} fill={K.dim}>{v}</text>
            <text x={X0 - 18} y={py(v) + 9} textAnchor="end" fontFamily={FONT} fontSize={26} fill={K.dim}>{v}</text>
            <line x1={X0} y1={py(v)} x2={X1} y2={py(v)} stroke={K.line} strokeWidth={1} />
          </g>
        ))}
        <path d={`M${pts}`} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} fill="none" stroke={K.amber} strokeWidth={8} strokeLinecap="round" />
        <g opacity={m}>
          <line x1={px(60)} y1={Y0} x2={px(60)} y2={py(sat(60))} stroke={K.txt} strokeWidth={3} strokeDasharray="10 8" />
          <line x1={X0} y1={py(sat(60))} x2={px(60)} y2={py(sat(60))} stroke={K.txt} strokeWidth={3} strokeDasharray="10 8" />
          <circle cx={px(60)} cy={py(sat(60))} r={16} fill={K.txt} stroke={K.amber} strokeWidth={6} />
        </g>
        <g opacity={cliff}><circle cx={px(slide)} cy={py(sat(slide))} r={18} fill={K.o2} /></g>
      </Svg>
      <Tx x={X0} y={Y0 + 70} w={X1 - X0} al="center" size={30} c={K.dim} b={700} a={ap(t, S[0] + 0.3)}>PaO₂ (mmHg)</Tx>
      <Tx x={40} y={150} w={400} size={30} c={K.dim} b={700} a={ap(t, S[0] + 0.3)}>SaO₂ (%)</Tx>
      <Callout x={px(60) + 30} y={py(sat(60)) + 30} a={m} c={K.amber} size={34}>60 → 90%</Callout>
      <Tx x={X0 + 20} y={Y1 + 20} w={px(60) - X0 - 30} al="center" size={36} c={K.o2} b={900} a={cliff}>MÉP VỰC</Tx>
      <Panel x={1250} y={190} w={570} h={250} c={K.o2} s0={S[0]}>
        <div style={{position: 'absolute', left: 30, top: 40}}><Ico w={110} h={110} vb="-45 -45 90 90" html={A.rbc('c3')} /></div>
        <Tx x={170} y={36} w={370} size={34} b={800}>Hemoglobin chở phần lớn oxy</Tx>
        <Tx x={170} y={140} w={370} size={30} c={K.dim}>Tỉ lệ bão hoà: SaO₂</Tx>
      </Panel>
      <Memo x={1250} y={500} w={570} s0={S[2] + 0.4} size={54}>60 – 90</Memo>
      <Panel x={1250} y={690} w={570} h={170} c={K.o2} s0={S[3]}>
        <Tx x={30} y={24} w={510} al="center" size={32} b={800}>Dưới 60: SaO₂ tụt rất nhanh</Tx>
        <Tx x={30} y={90} w={510} al="center" size={28} c={K.dim}>đường cong dốc xuống</Tx>
      </Panel>
    </>
  );
};

// ---------- 4 Giảm oxy máu ----------
const C4: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const X0 = 200, W = 1520;
  const px = (v: number) => X0 + ((v - 40) / (110 - 40)) * W;
  const mk = interpolate(t, [S[0] + 0.5, S[0] + 2, S[1] + 0.5, S[1] + 2], [95, 72, 72, 52], clamp);
  return (
    <>
      <Top idx={3} title="Khi nào gọi là giảm oxy máu?" />
      <Tx x={X0} y={170} w={W} al="center" size={36} c={K.dim} b={700} a={ap(t, S[0])}>PaO₂ khi thở khí trời (mmHg)</Tx>
      <div style={{position: 'absolute', left: px(40), top: 300, width: px(60) - px(40), height: 90, borderRadius: '45px 0 0 45px', background: K.o2, opacity: ap(t, S[1])}} />
      <div style={{position: 'absolute', left: px(60), top: 300, width: px(80) - px(60), height: 90, background: K.amber, opacity: ap(t, S[0])}} />
      <div style={{position: 'absolute', left: px(80), top: 300, width: px(110) - px(80), height: 90, borderRadius: '0 45px 45px 0', background: K.green, opacity: ap(t, S[0])}} />
      <div style={{position: 'absolute', left: px(40), top: 300, width: px(60) - px(40), height: 90, borderRadius: '45px 0 0 45px', background: 'rgba(255,255,255,.08)', opacity: 1 - ap(t, S[1])}} />
      {[40, 60, 80, 100].map((v) => <Tx key={v} x={px(v) - 60} y={400} w={120} al="center" size={34} c={K.txt} b={800} a={ap(t, S[0] + 0.3)}>{String(v)}</Tx>)}
      <div style={{position: 'absolute', left: px(mk) - 5, top: 270, width: 10, height: 150, borderRadius: 5, background: K.txt, boxShadow: '0 0 20px rgba(255,255,255,.7)', opacity: ap(t, S[0] + 0.4)}} />
      <Tx x={px(80)} y={470} w={px(110) - px(80)} al="center" size={36} c={K.green} b={800} a={ap(t, S[0] + 0.3)}>Bình thường</Tx>
      <Tx x={px(60)} y={470} w={px(80) - px(60)} al="center" size={36} c={K.amber} b={800} a={ap(t, S[0] + 0.8)}>Giảm oxy máu</Tx>
      <Tx x={px(40)} y={470} w={px(60) - px(40)} al="center" size={36} c={K.o2} b={800} a={ap(t, S[1])}>Đáng kể · suy hô hấp</Tx>
      <Panel x={260} y={620} w={640} h={170} c={K.amber} s0={S[0] + 1}>
        <Tx x={0} y={30} w={640} al="center" size={30} c={K.amber} b={800}>PaO₂ dưới 80</Tx>
        <Tx x={0} y={84} w={640} al="center" size={42} b={800}>giảm oxy máu</Tx>
      </Panel>
      <Panel x={1020} y={620} w={640} h={170} c={K.o2} s0={S[1] + 0.3} glow={ap(t, S[1] + D[1] * 0.5)}>
        <Tx x={0} y={30} w={640} al="center" size={30} c={K.o2} b={800}>PaO₂ dưới 60</Tx>
        <Tx x={0} y={84} w={640} al="center" size={42} b={800}>nghĩ suy hô hấp</Tx>
      </Panel>
    </>
  );
};

// ---------- 5 P/F ----------
const PF: React.FC<{x: number; s0: number; c: string; head: string; fio2: string; pf: string; verdict: string; glow: number}> = ({x, s0, c, head, fio2, pf, verdict, glow}) => (
  <Panel x={x} y={420} w={700} h={430} c={c} s0={s0} glow={glow}>
    <Tx x={0} y={24} w={700} al="center" size={34} c={c} b={800}>{head}</Tx>
    <Tx x={0} y={90} w={700} al="center" size={40} b={700}>{`PaO₂ 90 ÷ FiO₂ ${fio2}`}</Tx>
    <Tx x={0} y={160} w={700} al="center" size={30} c={K.dim} b={700}>P/F</Tx>
    <Big x={0} y={196} w={700} a={1} size={130} c={c}>{pf}</Big>
    <Tx x={0} y={355} w={700} al="center" size={40} b={800}>{verdict}</Tx>
  </Panel>
);
const C5: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={4} title="Tỉ số P/F" />
      <Tx x={160} y={150} w={1600} al="center" size={40} b={700} a={ap(t, S[0])}>PaO₂ phải đọc cùng FiO₂ · oxy bệnh nhân đang thở</Tx>
      <Pill x={560} y={240} a={ap(t, S[1])} c={K.co2} size={36}>Khí trời: FiO₂ 21% = 0,21</Pill>
      <div style={{position: 'absolute', left: 1000, top: 228, padding: '10px 34px', borderRadius: 18, background: 'linear-gradient(135deg,#FFD46B,#F5B83D)', color: K.ink, fontFamily: FONT, fontSize: 52, fontWeight: 900, opacity: ap(t, S[2]), transform: `scale(${0.85 + 0.15 * ap(t, S[2])})`, boxShadow: '0 12px 30px rgba(0,0,0,.45)'}}>{chem('P/F = PaO₂ ÷ FiO₂')}</div>
      <PF x={190} s0={S[3]} c={K.green} head="THỞ KHÍ TRỜI" fio2="0,21" pf="≈ 430" verdict="Bình thường" glow={0} />
      <PF x={1030} s0={S[4]} c={K.o2} head="THỞ OXY 100%" fio2="1,0" pf="90" verdict="Rất nặng!" glow={ap(t, S[4] + 1.5)} />
    </>
  );
};

// ---------- 6 P/F và ARDS ----------
const C6: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const X0 = 160, W = 1600;
  const px = (v: number) => X0 + (v / 500) * W;
  const zones: [number, number, string, string, number][] = [[0, 100, K.o2, 'Nặng ≤ 100', 0.9], [100, 200, K.hco3, 'Vừa 100–200', 0.6], [200, 300, K.amber, 'Nhẹ 200–300', 0.3], [300, 500, K.green, '', 0]];
  return (
    <>
      <Top idx={5} title="P/F và ARDS" />
      <Tx x={X0} y={160} w={W} al="center" size={36} c={K.dim} b={700} a={ap(t, S[0])}>Tỉ số P/F</Tx>
      {zones.map(([a, b, c, l, d], i) => (
        <React.Fragment key={i}>
          <div style={{position: 'absolute', left: px(a), top: 240, width: px(b) - px(a), height: 90, background: c, borderRadius: i === 0 ? '45px 0 0 45px' : i === 3 ? '0 45px 45px 0' : 0, opacity: i === 3 ? ap(t, S[0]) : ap(t, S[1] + d * D[1])}} />
          {l ? <Tx x={px(a)} y={350} w={px(b) - px(a)} al="center" size={34} c={c} b={800} a={ap(t, S[1] + d * D[1])}>{l}</Tx> : null}
        </React.Fragment>
      ))}
      <div style={{position: 'absolute', left: px(400), top: 226, width: px(500) - px(400), height: 118, borderRadius: 18, border: `5px solid ${K.txt}`, opacity: ap(t, S[0] + 0.6), boxShadow: '0 0 24px rgba(255,255,255,.5)'}} />
      <Tx x={px(300)} y={350} w={px(500) - px(300)} al="center" size={34} c={K.green} b={800} a={ap(t, S[0] + 0.6)}>Bình thường 400–500</Tx>
      {[0, 100, 200, 300, 400, 500].map((v) => <Tx key={v} x={px(v) - 50} y={200} w={100} al="center" size={26} c={K.dim} a={ap(t, S[0] + 0.3)}>{String(v)}</Tx>)}
      <Tx x={X0} y={430} w={px(300) - X0} al="center" size={40} c={K.txt} b={800} a={ap(t, S[1])}>ARDS</Tx>
      <div style={{position: 'absolute', left: X0, top: 420, width: px(300) - X0, height: 6, background: K.txt, opacity: ap(t, S[1]) * 0.6, borderRadius: 3}} />
      <Panel x={260} y={560} w={620} h={200} c={K.co2} s0={S[2]}>
        <Tx x={0} y={26} w={620} al="center" size={30} c={K.co2} b={800}>BỆNH NHÂN THỞ MÁY</Tx>
        <Tx x={0} y={86} w={620} al="center" size={50} b={900}>PEEP ≥ 5 cmH₂O</Tx>
      </Panel>
      <Panel x={980} y={560} w={680} h={200} c={K.amber} s0={S[3]}>
        <Tx x={0} y={22} w={680} al="center" size={30} c={K.amber} b={800}>ĐỊNH NGHĨA TOÀN CẦU 2024</Tx>
        <Tx x={30} y={74} w={620} al="center" size={36} b={700}>Chưa có khí máu? Dùng SpO₂ / FiO₂</Tx>
      </Panel>
    </>
  );
};

// ---------- 7 PAO₂ ----------
const C7: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const co2 = interpolate(t, [S[2] + 0.5, S[2] + 2, S[3], S[3] + 1], [40, 72, 72, 40], clamp);
  const H = 520, top = 230;
  const hc = ((1.25 * co2) / 150) * H;
  const o2v = Math.round(150 - 1.25 * co2);
  return (
    <>
      <Top idx={6} title="Oxy trong phế nang: PAO₂" />
      <Svg>
        <g opacity={ap(t, S[0])}><Alv x={330} y={560} w={380} /></g>
      </Svg>
      <Callout x={150} y={250} a={ap(t, S[0] + 0.4)} c="#FF9AA0">Phế nang (A)</Callout>
      <div style={{position: 'absolute', left: 620, top: top, width: 220, height: H, borderRadius: 24, border: `3px solid ${K.line}`, overflow: 'hidden', opacity: ap(t, S[0] + 0.3), display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
        <div style={{flex: 1, background: 'rgba(229,72,77,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 900, color: '#fff'}}>O₂</div>
        <div style={{height: hc, background: 'rgba(56,167,221,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 900, color: '#fff'}}>{chem('CO₂')}</div>
      </div>
      <Tx x={600} y={top + H + 16} w={260} al="center" size={26} c={K.dim} a={ap(t, S[0] + 0.3)}>khí trong phế nang</Tx>
      <div style={{position: 'absolute', left: 950, top: 200, padding: '14px 34px', borderRadius: 18, background: 'linear-gradient(135deg,#FFD46B,#F5B83D)', color: K.ink, fontFamily: FONT, fontSize: 50, fontWeight: 900, opacity: ap(t, S[1]), transform: `scale(${0.85 + 0.15 * ap(t, S[1])})`, boxShadow: '0 12px 30px rgba(0,0,0,.45)', whiteSpace: 'nowrap'}}>{chem('PAO₂ ≈ 150 − 1,25 × PaCO₂')}</div>
      <Tx x={960} y={300} w={820} size={28} c={K.dim} a={ap(t, S[1] + 0.5)}>thở khí trời, ngang mực nước biển</Tx>
      <Panel x={950} y={380} w={830} h={170} c={K.co2} s0={S[2]}>
        <Tx x={30} y={30} w={770} al="center" size={36} b={800}>CO₂ càng nhiều → chỗ cho O₂ càng ít</Tx>
        <Tx x={30} y={96} w={770} al="center" size={30} c={K.dim}>{`PaCO₂ ${Math.round(co2)} → PAO₂ ≈ ${o2v}`}</Tx>
      </Panel>
      <Panel x={950} y={600} w={830} h={200} c={K.green} s0={S[3]}>
        <Tx x={0} y={26} w={830} al="center" size={30} c={K.green} b={800}>VÍ DỤ</Tx>
        <Tx x={0} y={80} w={830} al="center" size={50} b={900}>PaCO₂ 40 → PAO₂ ≈ 100</Tx>
      </Panel>
    </>
  );
};

// ---------- 8 A–a ----------
const C8: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const pa = interpolate(t, [S[3] + 0.6, S[3] + 2], [95, 55], clamp);
  const base = 830, k = 5.2;
  const bad = ap(t, S[3] + 1);
  const gapC = bad > 0.5 ? K.o2 : K.green;
  return (
    <>
      <Top idx={7} title="Chênh lệch A–a" />
      <div style={{position: 'absolute', left: 820, top: 160, padding: '12px 34px', borderRadius: 18, background: 'linear-gradient(135deg,#FFD46B,#F5B83D)', color: K.ink, fontFamily: FONT, fontSize: 50, fontWeight: 900, opacity: ap(t, S[0]), boxShadow: '0 12px 30px rgba(0,0,0,.45)', whiteSpace: 'nowrap'}}>{chem('A–a = PAO₂ − PaO₂')}</div>
      <div style={{position: 'absolute', left: 240, top: base - 100 * k, width: 200, height: 100 * k, borderRadius: '20px 20px 0 0', background: 'linear-gradient(#FF8E92,#C42A38)', opacity: ap(t, S[0] + 0.3)}} />
      <div style={{position: 'absolute', left: 560, top: base - pa * k, width: 200, height: pa * k, borderRadius: '20px 20px 0 0', background: 'linear-gradient(#E64A55,#7A1420)', opacity: ap(t, S[0] + 0.6)}} />
      <Tx x={220} y={base + 14} w={240} al="center" size={30} b={800} a={ap(t, S[0] + 0.3)}>PAO₂ 100</Tx>
      <Tx x={540} y={base + 14} w={240} al="center" size={30} b={800} a={ap(t, S[0] + 0.6)}>{`PaO₂ ${Math.round(pa)}`}</Tx>
      <Tx x={220} y={base + 56} w={240} al="center" size={24} c={K.dim} a={ap(t, S[0] + 0.3)}>phế nang</Tx>
      <Tx x={540} y={base + 56} w={240} al="center" size={24} c={K.dim} a={ap(t, S[0] + 0.6)}>động mạch</Tx>
      <Svg>
        <g opacity={ap(t, S[0] + 1)}>
          <line x1={450} y1={base - 100 * k} x2={800} y2={base - 100 * k} stroke={gapC} strokeWidth={3} strokeDasharray="10 8" />
          <path d={`M790,${base - 100 * k} L790,${base - pa * k}`} stroke={gapC} strokeWidth={6} />
          <path d={`M778,${base - 100 * k} L802,${base - 100 * k} M778,${base - pa * k} L802,${base - pa * k}`} stroke={gapC} strokeWidth={6} />
        </g>
      </Svg>
      <Tx x={820} y={base - ((100 + pa) / 2) * k - 26} w={240} size={44} c={gapC} b={900} a={ap(t, S[0] + 1)}>{`A–a ${Math.round(100 - pa)}`}</Tx>
      <Panel x={1120} y={260} w={680} h={150} c={K.green} s0={S[1]}>
        <Tx x={0} y={24} w={680} al="center" size={28} c={K.green} b={800}>NGƯỜI TRẺ</Tx>
        <Tx x={0} y={66} w={680} al="center" size={46} b={900}>A–a dưới 10–15</Tx>
      </Panel>
      <Panel x={1120} y={440} w={680} h={170} c={K.amber} s0={S[2]}>
        <Tx x={0} y={22} w={680} al="center" size={28} c={K.amber} b={800}>GIỚI HẠN THEO TUỔI</Tx>
        <Tx x={0} y={62} w={680} al="center" size={46} b={900}>tuổi ÷ 4 + 4</Tx>
        <Tx x={0} y={124} w={680} al="center" size={26} c={K.dim}>ví dụ 60 tuổi → khoảng 19</Tx>
      </Panel>
      <Panel x={1120} y={640} w={680} h={190} c={K.o2} s0={S[3]} glow={bad}>
        <Tx x={0} y={22} w={680} al="center" size={28} c={K.o2} b={800}>A–a TĂNG</Tx>
        <Tx x={30} y={64} w={620} al="center" size={36} b={800}>Oxy có ở phế nang nhưng không vào được máu → bệnh tại phổi</Tx>
      </Panel>
    </>
  );
};

// ---------- 9 Năm cơ chế ----------
const Mech: React.FC<{x: number; y: number; w: number; c: string; n: string; s0: number; txt: string; note?: string; na?: number}> = ({x, y, w, c, n, s0, txt, note, na = 0}) => (
  <Panel x={x} y={y} w={w} h={118} c={c} s0={s0}>
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 22, padding: '0 26px'}}>
      <Mark c={c} ch={n} s0={s0 + 0.1} size={64} />
      <div style={{fontFamily: FONT}}>
        <div style={{fontSize: 38, fontWeight: 800, color: K.txt}}>{chem(txt)}</div>
        {note ? <div style={{fontSize: 26, fontWeight: 700, color: c, opacity: na, marginTop: 2}}>{note}</div> : null}
      </div>
    </div>
  </Panel>
);
const C9: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={8} title="5 cơ chế gây giảm oxy máu" />
      <Pill x={500} y={170} a={ap(t, S[1])} c={K.green} size={36}>A–a BÌNH THƯỜNG</Pill>
      <Pill x={1400} y={170} a={ap(t, S[2])} c={K.o2} size={36} dark={false}>A–a TĂNG</Pill>
      <Mech x={110} y={270} w={780} c={K.green} n="1" s0={S[1] + 0.4} txt="Khí thở thiếu oxy" note="lên vùng cao" na={1} />
      <Mech x={110} y={420} w={780} c={K.green} n="2" s0={S[1] + 1.4} txt="Giảm thông khí" note="PaCO₂ tăng" na={1} />
      <Mech x={1010} y={270} w={800} c={K.o2} n="3" s0={S[2] + 0.4} txt="Bất xứng V/Q" note="thường gặp nhất · đáp ứng tốt với oxy" na={ap(t, S[3])} />
      <Mech x={1010} y={420} w={800} c={K.o2} n="4" s0={S[2] + 1.0} txt="Shunt" note="thở thêm oxy cải thiện rất ít" na={ap(t, S[4])} />
      <Mech x={1010} y={570} w={800} c={K.o2} n="5" s0={S[2] + 1.6} txt="Rối loạn khuếch tán" />
      <Memo x={110} y={600} w={780} s0={S[0] + 0.5} size={40}>Nhìn A–a để tách 2 nhóm</Memo>
    </>
  );
};

// ---------- 10 Giải đố + ôn tập ----------
const Case: React.FC<{x: number; s0: number; v0: number; n: string; co2: string; pao2: string; aa: string; verdict: string; ex: string; c: string}> = ({x, s0, v0, n, co2, pao2, aa, verdict, ex, c}) => {
  const t = useSec();
  const v = ap(t, v0);
  return (
    <Panel x={x} y={160} w={760} h={460} c={v > 0.5 ? c : K.line} s0={s0} glow={v * 0.4}>
      <Tx x={0} y={22} w={760} al="center" size={30} c={K.dim} b={800}>{`BỆNH NHÂN ${n}`}</Tx>
      <Tx x={0} y={70} w={760} al="center" size={42} b={800}>{`PaO₂ 55 · PaCO₂ ${co2}`}</Tx>
      <Tx x={0} y={140} w={760} al="center" size={32} c={K.dim} a={ap(t, s0 + 1.2)}>{`PAO₂ ≈ 150 − 1,25 × ${co2} ≈ ${pao2}`}</Tx>
      <Big x={0} y={196} w={760} a={ap(t, s0 + 2.4)} size={96} c={c}>{`A–a ≈ ${aa}`}</Big>
      <Tx x={0} y={330} w={760} al="center" size={44} c={c} b={900} a={v}>{verdict}</Tx>
      <Tx x={0} y={394} w={760} al="center" size={28} c={K.dim} a={v}>{ex}</Tx>
    </Panel>
  );
};
const C10: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  const nx = usePop(S[5] + 0.3);
  return (
    <>
      <Top idx={9} title="Giải câu đố" />
      <Case x={160} s0={S[0] + 0.3} v0={S[1]} n="1" co2="70" pao2="62" aa="8" verdict="Bình thường → giảm thông khí" ex="ví dụ: quá liều thuốc an thần" c={K.green} />
      <Case x={1000} s0={S[2] + 0.3} v0={S[3]} n="2" co2="30" pao2="112" aa="58" verdict="Tăng → bệnh tại phổi" ex="ví dụ: viêm phổi, thuyên tắc phổi" c={K.o2} />
      <div style={{position: 'absolute', left: 160, top: 660, width: 1600, display: 'flex', justifyContent: 'center', gap: 26, fontFamily: FONT}}>
        {(['PaO₂ bao nhiêu?', 'P/F bao nhiêu?', 'A–a bình thường hay tăng?'] as string[]).map((q, i) => {
          const p = ap(t, S[4] + i * 0.8);
          return <div key={q} style={{padding: '14px 30px', borderRadius: 18, background: 'rgba(245,184,61,.14)', border: `3px solid ${K.amber}`, fontSize: 38, fontWeight: 800, color: K.txt, opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}><span style={{color: K.amber, marginRight: 12}}>{i + 1}</span>{chem(q)}</div>;
        })}
      </div>
      {nx > 0.01 && (
        <div style={{position: 'absolute', left: 460, top: 790, width: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '16px 0', borderRadius: 999, border: `2px solid ${K.amber}`, background: 'rgba(245,184,61,.08)', fontFamily: FONT, opacity: Math.min(1, nx * 1.5)}}>
          <span style={{fontSize: 28, fontWeight: 800, color: K.amber, letterSpacing: 1}}>BÀI 4</span>
          <span style={{fontSize: 34, fontWeight: 700, color: K.txt}}>Quy trình đọc khí máu 6 bước</span>
        </div>
      )}
    </>
  );
};

const SC: React.FC<{S: number[]; D: number[]}>[] = [C1, C2, C3, C4, C5, C6, C7, C8, C9, C10];

export const Abg3: React.FC = () => (
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
