// Giải mã khí máu · Bài 2: Sinh lý toan kiềm — pH, hệ đệm, phổi và thận (10 cảnh)
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
const NAMES = ['MỞ ĐẦU', 'pH', 'ACID', '3 TUYẾN', 'ĐỆM', '20 : 1', 'PHỔI', 'THẬN', 'ĐỆM KHÁC', 'ÔN TẬP'];

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
      <Tx x={44} y={22} size={24} c={K.dim} b={600}>GIẢI MÃ KHÍ MÁU · BÀI 2</Tx>
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

// ---------- Tiện ích bài 2 ----------
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const HDots: React.FC<{x: number; y: number; w: number; h: number; n: number; s0: number; c?: string}> = ({x, y, w, h, n, s0, c = K.o2}) => {
  const t = useSec();
  const f = useCurrentFrame();
  return (
    <svg style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'visible'}}>
      {Array.from({length: n}, (_, i) => {
        const a = ap(t, s0 + (i / n) * 1.2, 0.25);
        const cx = 20 + rnd(i) * (w - 40) + Math.sin(f / 20 + i) * 4;
        const cy = 20 + rnd(i + 99) * (h - 40) + Math.cos(f / 23 + i) * 4;
        return (
          <g key={i} opacity={a} transform={`translate(${cx},${cy}) scale(${a})`}>
            <circle r={15} fill={c} />
            <text y={6} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={17} fill="#fff">H⁺</text>
          </g>
        );
      })}
    </svg>
  );
};
const Big: React.FC<{x: number; y: number; w: number; a: number; c?: string; size?: number; children: string}> = ({x, y, w, a, c = K.txt, size = 120, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: 'center', fontFamily: FONT, fontSize: size, fontWeight: 900, color: c, opacity: a, transform: `scale(${0.9 + 0.1 * a})`}}>{chem(children)}</div>
);

// ---------- 1 Mở đầu ----------
const B1: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  return (
    <>
      <Top idx={0} title="pH lệch 0,3 có sao không?" />
      <Panel x={140} y={170} w={760} h={560} c={K.green} s0={S[0]}>
        <Tx x={0} y={24} w={760} al="center" size={30} c={K.green} b={800}>pH</Tx>
        <Big x={0} y={60} w={760} a={1} size={130}>7,40</Big>
        <HDots x={60} y={250} w={640} h={280} n={14} s0={S[1]} />
      </Panel>
      <Panel x={1020} y={170} w={760} h={560} c={K.o2} s0={S[0] + 0.6}>
        <Tx x={0} y={24} w={760} al="center" size={30} c={K.o2} b={800}>pH</Tx>
        <Big x={0} y={60} w={760} a={1} size={130} c={K.o2}>7,10</Big>
        <HDots x={60} y={250} w={640} h={280} n={28} s0={S[1]} />
      </Panel>
      <div style={{position: 'absolute', left: 860, top: 400, width: 200, height: 110, borderRadius: 55, background: K.amber, color: K.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 52, fontWeight: 900, opacity: ap(t, S[1] + D[1] * 0.6), transform: `scale(${0.6 + 0.4 * ap(t, S[1] + D[1] * 0.6)})`, boxShadow: '0 12px 30px rgba(0,0,0,.5)'}}>H⁺ ×2</div>
      <Memo x={460} y={770} w={1000} s0={S[2] + 0.3} size={44}>Cơ thể giữ pH bằng cách nào?</Memo>
    </>
  );
};

// ---------- 2 pH và H+ ----------
const B2: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const X0 = 160, W = 1600;
  const px = (v: number) => X0 + ((v - 6.9) / (7.9 - 6.9)) * W;
  const mk = interpolate(t, [S[1], S[1] + D[1] * 0.45, S[1] + D[1] * 0.55, S[1] + D[1]], [7.4, 7.4, 7.1, 7.1], clamp);
  const zone = ap(t, S[2], 0.5);
  const lab = ap(t, S[3], 0.4);
  return (
    <>
      <Top idx={1} title="pH và H⁺" />
      <Tx x={160} y={150} w={1600} al="center" size={44} b={800} a={ap(t, S[0])}>H⁺ càng nhiều → pH càng thấp</Tx>
      <div style={{position: 'absolute', left: X0, top: 300, width: W, height: 70, borderRadius: 35, background: 'linear-gradient(90deg,#C8323B 0%,#E5484D 30%,#3FB27F 45%,#3FB27F 55%,#3A7BE0 70%,#2B4FB0 100%)', opacity: ap(t, S[0] + 0.3)}} />
      <div style={{position: 'absolute', left: px(7.35), top: 290, width: px(7.45) - px(7.35), height: 90, borderRadius: 14, border: `5px solid ${K.txt}`, opacity: zone, boxShadow: '0 0 30px rgba(255,255,255,.5)'}} />
      {([[6.9, '6,9'], [7.1, '7,10'], [7.35, '7,35'], [7.4, '7,40'], [7.45, '7,45'], [7.7, '7,7'], [7.9, '7,9']] as [number, string][]).map(([v, l]) => (
        <Tx key={l} x={px(v) - 60} y={390} w={120} al="center" size={v === 7.4 ? 34 : 26} c={v === 7.4 ? K.txt : K.dim} a={ap(t, S[0] + 0.5)}>{l}</Tx>
      ))}
      <div style={{position: 'absolute', left: px(mk) - 4, top: 272, width: 8, height: 158, background: K.amber, borderRadius: 4, opacity: ap(t, S[1])}} />
      <div style={{position: 'absolute', left: px(mk) - 150, top: 222, width: 300, textAlign: 'center', fontFamily: FONT, fontSize: 38, fontWeight: 800, color: K.amber, opacity: ap(t, S[1])}}>H⁺ ≈ {mk > 7.25 ? 40 : 80} nmol/L</div>
      <Tx x={X0} y={460} w={520} size={40} c={K.o2} b={800} a={lab}>◀ TOAN MÁU  dưới 7,35</Tx>
      <Tx x={X0 + W - 520} y={460} w={520} al="right" size={40} c="#6E9BEA" b={800} a={lab}>trên 7,45  KIỀM MÁU ▶</Tx>
      <Tx x={px(7.4) - 200} y={460} w={400} al="center" size={36} c={K.green} b={800} a={zone}>bình thường</Tx>
      <Panel x={560} y={560} w={800} h={160} c={K.line} s0={S[4]}>
        <Tx x={0} y={30} w={800} al="center" size={38} b={700}>Enzyme, protein chỉ hoạt động tốt trong khoảng pH hẹp</Tx>
      </Panel>
      <Memo x={610} y={760} w={700} s0={S[4] + D[4] * 0.6} size={48}>pH GIẢM = H⁺ TĂNG</Memo>
    </>
  );
};

// ---------- 3 Acid đến từ đâu ----------
const B3: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const cellP = usePop(S[0]);
  return (
    <>
      <Top idx={2} title="Acid đến từ đâu?" />
      <div style={{position: 'absolute', left: 810, top: 300, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%,#5BC0A0,#1F7A63 70%,#165A49)', border: '4px solid #8BE0C4', transform: `scale(${cellP * (1 + Math.sin(f / 15) * 0.02)})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 34, fontWeight: 800, color: '#fff', textAlign: 'center'}}>Tế bào<br />chuyển hoá</div>
      <Svg>
        <Curve d="M820,420 C700,380 560,360 470,380" c={K.co2} w={6} p={ap(t, S[1], 0.7)} />
        <Curve d="M1100,420 C1220,380 1360,360 1450,380" c={K.hco3} w={6} p={ap(t, S[2], 0.7)} />
        <g opacity={ap(t, S[1] + 0.4)}><Lung x={330} y={405} w={330} /></g>
        <g opacity={ap(t, S[3])}><Kid x={1580} y={455} h={320} /></g>
        {Array.from({length: 6}, (_, i) => {
          const u = ((f / 50 + i / 6) % 1);
          return <circle key={i} cx={800 - u * 320} cy={415 - Math.sin(u * Math.PI) * 40} r={11} fill={K.co2} opacity={ap(t, S[1] + 0.5) * (1 - u)} />;
        })}
      </Svg>
      <Panel x={110} y={600} w={560} h={150} c={K.co2} s0={S[1] + 0.3}>
        <Tx x={26} y={18} size={28} c={K.co2} b={800}>ACID BAY HƠI · CO₂</Tx>
        <Tx x={26} y={62} size={40} b={800}>~15 mol/ngày → PHỔI</Tx>
      </Panel>
      <Panel x={1250} y={600} w={600} h={150} c={K.hco3} s0={S[2] + 0.3}>
        <Tx x={26} y={18} size={28} c={K.hco3} b={800}>ACID KHÔNG BAY HƠI</Tx>
        <Tx x={26} y={62} size={40} b={800}>~1 mEq/kg/ngày → THẬN</Tx>
      </Panel>
      <Tx x={1250} y={762} w={600} al="center" size={28} c={K.dim} a={ap(t, S[2] + D[2] * 0.6)}>≈ 70 mEq/ngày ở người 70 kg</Tx>
      <Memo x={500} y={800} w={920} s0={S[3] + D[3] * 0.4} size={38}>CO₂ → PHỔI · Acid còn lại → THẬN</Memo>
    </>
  );
};

// ---------- 4 Ba tuyến ----------
const Line3: React.FC<{x: number; s0: number; c: string; n: string; name: string; time: string; art: React.ReactNode}> = ({x, s0, c, n, name, time, art}) => (
  <Panel x={x} y={180} w={520} h={470} c={c} s0={s0}>
    <Tx x={0} y={22} w={520} al="center" size={28} c={c} b={800}>{`TUYẾN ${n}`}</Tx>
    <div style={{position: 'absolute', left: 0, right: 0, top: 80, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{art}</div>
    <Tx x={0} y={310} w={520} al="center" size={60} b={900}>{name}</Tx>
    <Tx x={0} y={392} w={520} al="center" size={36} c={c} b={700}>{time}</Tx>
  </Panel>
);
const Sponge: React.FC<{s?: number}> = ({s = 1}) => {
  const f = useCurrentFrame();
  return (
    <svg width={220 * s} height={180 * s} viewBox="0 0 220 180">
      <rect x={20} y={30} width={180} height={120} rx={26} fill="#F5C84A" stroke="#B88A1A" strokeWidth={4} transform={`scale(${1 + Math.sin(f / 10) * 0.03}) `} style={{transformOrigin: '110px 90px'}} />
      {[[60, 70, 12], [110, 60, 9], [150, 84, 14], [80, 115, 10], [130, 120, 8], [175, 120, 7], [45, 110, 6]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#D9A72C" />)}
    </svg>
  );
};
const B4: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const t = useSec();
  return (
    <>
      <Top idx={3} title="Ba tuyến bảo vệ pH" />
      <Line3 x={110} s0={S[1]} c={K.amber} n="1" name="HỆ ĐỆM" time="tức thì" art={<Sponge />} />
      <Line3 x={700} s0={S[2]} c={K.co2} n="2" name="PHỔI" time="phút → giờ" art={<OrganIco src="abg_phoi.png" w={220} h={210} />} />
      <Line3 x={1290} s0={S[3]} c={K.hco3} n="3" name="THẬN" time="vài ngày" art={<OrganIco src="abg_than.png" w={170} h={210} />} />
      <div style={{position: 'absolute', left: 110, top: 690, width: 1700, height: 10, borderRadius: 5, background: `linear-gradient(90deg,${K.amber},${K.co2},${K.hco3})`, opacity: ap(t, S[0] + 0.2), transformOrigin: 'left', transform: `scaleX(${ap(t, S[0] + 0.2, 1.2)})`}} />
      <Tx x={110} y={712} w={1700} al="right" size={28} c={K.dim} a={ap(t, S[3])}>thời gian tác dụng →</Tx>
      <Memo x={610} y={770} w={700} s0={S[3] + 1.2} size={48}>ĐỆM → PHỔI → THẬN</Memo>
    </>
  );
};

// ---------- 5 Hệ đệm bicarbonate ----------
const Term: React.FC<{c: string; on: number; children: string}> = ({c, on, children}) => (
  <span style={{padding: '4px 14px', borderRadius: 14, background: on > 0.05 ? `${c}${Math.round(40 + on * 60).toString(16)}` : 'transparent', border: `3px solid ${on > 0.05 ? c : 'transparent'}`, transition: 'none'}}>{chem(children)}</span>
);
const B5: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const back = interpolate(t, [S[3] + 0.3, S[3] + D[3]], [0, 1], clamp);
  const hl = (s: number) => Math.min(ap(t, s, 0.3), 1);
  return (
    <>
      <Top idx={4} title="Hệ đệm bicarbonate" />
      <div style={{position: 'absolute', left: 110, top: 170, width: 500, height: 330, opacity: ap(t, S[0])}}>
        <Sponge s={1.6} />
        <Tx x={0} y={290} w={360} al="center" size={30} c={K.dim}>hút H⁺ khi dư · nhả khi thiếu</Tx>
      </div>
      <Panel x={700} y={180} w={1110} h={200} c={K.amber} s0={S[1]}>
        <Tx x={30} y={18} size={28} c={K.amber} b={800}>HỆ ĐỆM QUAN TRỌNG NHẤT</Tx>
        <div style={{position: 'absolute', left: 30, top: 70, display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT, fontSize: 52, fontWeight: 800, color: K.txt, opacity: ap(t, S[2])}}>
          <Term c={K.co2} on={hl(S[3] + D[3] * 0.6) + hl(S[4]) * 0}>CO₂</Term><span>+ H₂O ⇌ H₂CO₃ ⇌</span><Term c={K.o2} on={hl(S[3])}>H⁺</Term><span>+</span><Term c={K.hco3} on={hl(S[3] + 0.4)}>HCO₃⁻</Term>
        </div>
      </Panel>
      <Svg>
        <g opacity={ap(t, S[3])}>
          {Array.from({length: 5}, (_, i) => {
            const u = Math.min(1, Math.max(0, back * 1.4 - i * 0.1));
            return (
              <g key={i} transform={`translate(${1500 - u * (600 - i * 40)},${480 + (i % 3) * 56})`} opacity={1 - u * 0.2}>
                <circle r={28} fill={u > 0.95 ? K.co2 : K.o2} />
                <text y={8} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill="#fff">{u > 0.95 ? 'CO₂' : 'H⁺'}</text>
              </g>
            );
          })}
        </g>
        <Curve d="M820,560 C700,600 600,620 470,640" c={K.co2} w={6} p={ap(t, S[4], 0.7)} />
        <g opacity={ap(t, S[4] + 0.4)}><Lung x={320} y={650} w={230} /></g>
      </Svg>
      <Tx x={940} y={420} w={700} al="center" size={34} c={K.txt} b={700} a={ap(t, S[3] + 0.2)}>H⁺ tăng → HCO₃⁻ bắt lấy → tạo CO₂</Tx>
      <Panel x={720} y={640} w={1090} h={150} c={K.co2} s0={S[4] + 0.3}>
        <Tx x={30} y={42} w={1030} size={42} b={800}>CO₂ được phổi thải đi → hệ đệm rất mạnh</Tx>
      </Panel>
    </>
  );
};

// ---------- 6 Tỉ số 20:1 ----------
const B6: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const tilt = interpolate(t, [S[3], S[3] + 0.6, S[4], S[4] + 0.6], [0, 9, 9, -9], clamp);
  const sc = usePop(S[1]);
  const res = t < S[3] ? 'pH 7,40' : t < S[4] ? 'TOAN MÁU' : 'KIỀM MÁU';
  const rc = t < S[3] ? K.green : t < S[4] ? K.o2 : '#6E9BEA';
  return (
    <>
      <Top idx={5} title="Tỉ số 20 : 1" />
      <Panel x={360} y={160} w={1200} h={110} c={K.line} s0={S[0]}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 48, fontWeight: 800, color: K.txt}}><span>{chem('pH = 6,1 + log (HCO₃⁻ / 0,03 × PaCO₂)')}</span></div>
      </Panel>
      <div style={{position: 'absolute', left: 460, top: 300, width: 1000, height: 420, opacity: Math.min(1, sc * 1.4)}}>
        <svg width={1000} height={420} viewBox="0 0 1000 420" style={{overflow: 'visible'}}>
          <path d="M470,400 L530,400 L510,140 L490,140 Z" fill="#C8D5DC" />
          <circle cx={500} cy={130} r={16} fill="#C8D5DC" />
          <g transform={`rotate(${tilt} 500 130)`}>
            <rect x={110} y={122} width={780} height={16} rx={8} fill="#E8EEF2" />
            <g transform="translate(180,138)"><line x1={0} y1={0} x2={-70} y2={110} stroke="#C8D5DC" strokeWidth={3} /><line x1={0} y1={0} x2={70} y2={110} stroke="#C8D5DC" strokeWidth={3} /><path d="M-110,110 Q0,170 110,110 Z" fill={K.hco3} /></g>
            <g transform="translate(820,138)"><line x1={0} y1={0} x2={-70} y2={110} stroke="#C8D5DC" strokeWidth={3} /><line x1={0} y1={0} x2={70} y2={110} stroke="#C8D5DC" strokeWidth={3} /><path d="M-110,110 Q0,170 110,110 Z" fill={K.co2} /></g>
          </g>
        </svg>
        <div style={{position: 'absolute', left: 30, top: 300, width: 300, textAlign: 'center', fontFamily: FONT, transform: `translateY(${Math.sin((tilt * Math.PI) / 180) * -320}px)`}}>
          <div style={{fontSize: 34, fontWeight: 800, color: K.hco3}}>{chem('HCO₃⁻')}</div><div style={{fontSize: 70, fontWeight: 900, color: K.txt}}>24</div>
        </div>
        <div style={{position: 'absolute', left: 670, top: 300, width: 300, textAlign: 'center', fontFamily: FONT, transform: `translateY(${Math.sin((tilt * Math.PI) / 180) * 320}px)`}}>
          <div style={{fontSize: 34, fontWeight: 800, color: K.co2}}>0,03 × 40</div><div style={{fontSize: 70, fontWeight: 900, color: K.txt}}>1,2</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 760, top: 330, width: 400, textAlign: 'center', fontFamily: FONT, opacity: ap(t, S[1] + D[1] * 0.7)}}>
        <div style={{fontSize: 80, fontWeight: 900, color: K.amber}}>20 : 1</div>
      </div>
      <div style={{position: 'absolute', left: 1480, top: 440, width: 380, height: 90, borderRadius: 45, background: rc, color: '#0D1B24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 50, fontWeight: 900, opacity: ap(t, S[2])}}>{res}</div>
      <Tx x={100} y={740} w={560} size={32} c={K.o2} b={700} a={ap(t, S[3] + 0.4)}>HCO₃⁻ ↓ hoặc CO₂ ↑ → tỉ số ↓</Tx>
      <Tx x={1260} y={740} w={560} al="right" size={32} c="#6E9BEA" b={700} a={ap(t, S[4] + 0.4)}>HCO₃⁻ ↑ hoặc CO₂ ↓ → tỉ số ↑</Tx>
      <Memo x={560} y={830} w={800} s0={S[4] + D[4] * 0.75} size={36}>pH theo TỈ SỐ, không theo một con số</Memo>
    </>
  );
};

// ---------- 7 Phổi ----------
const B7: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const fast = t >= S[1] && t < S[3];
  const slow = t >= S[3];
  const rate = fast ? 5 : slow ? 30 : 16;
  const amp = fast ? 0.08 : slow ? 0.03 : 0.04;
  const br = 1 + Math.sin(f / rate) * amp;
  const out = fast ? 10 : slow ? 2 : 4;
  return (
    <>
      <Top idx={6} title="Phổi: điều chỉnh nhanh" />
      <Svg>
        <g opacity={ap(t, S[0])}><Lung x={600} y={545} w={560 * br} /></g>
        {Array.from({length: out}, (_, i) => {
          const u = ((f / (fast ? 18 : 40) + i / out) % 1);
          return (
            <g key={i} transform={`translate(${600 + Math.sin(i * 2.1) * 40},${245 - u * 120})`} opacity={(1 - u) * ap(t, S[1])}>
              <circle r={20} fill={K.co2} /><text y={7} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={16} fill="#fff">CO₂</text>
            </g>
          );
        })}
      </Svg>
      <Panel x={40} y={150} w={330} h={150} c={K.dim} s0={S[0] + 0.3}>
        <Tx x={0} y={24} w={330} al="center" size={26} c={K.dim} b={700}>Trung tâm hô hấp</Tx>
        <Tx x={0} y={70} w={330} al="center" size={32} b={800}>cảm nhận H⁺, CO₂</Tx>
      </Panel>
      <Panel x={1060} y={180} w={760} h={190} c={K.o2} s0={S[1]} glow={fast ? 1 : 0}>
        <Tx x={30} y={20} size={30} c={K.o2} b={800}>TOAN MÁU</Tx>
        <Tx x={30} y={64} w={700} size={42} b={800}>Thở nhanh, sâu → thải CO₂</Tx>
        <Tx x={30} y={124} w={700} size={30} c={K.dim} a={ap(t, S[2])}>Ví dụ: thở Kussmaul trong nhiễm toan ceton</Tx>
      </Panel>
      <Panel x={1060} y={400} w={760} h={150} c="#6E9BEA" s0={S[3]} glow={slow && t < S[4] ? 1 : 0}>
        <Tx x={30} y={20} size={30} c="#6E9BEA" b={800}>KIỀM MÁU</Tx>
        <Tx x={30} y={64} w={700} size={42} b={800}>Thở chậm lại → giữ CO₂</Tx>
      </Panel>
      <Panel x={1060} y={580} w={760} h={150} c={K.amber} s0={S[4]}>
        <Tx x={30} y={24} w={700} size={36} b={800}>Bắt đầu: vài phút</Tx>
        <Tx x={30} y={76} w={700} size={36} b={800} c={K.amber}>Bù đầy đủ: 12–24 giờ</Tx>
      </Panel>
      <Tx x={390} y={872} w={420} al="center" size={36} b={800} c={fast ? K.o2 : slow ? '#6E9BEA' : K.dim} a={ap(t, S[1])}>{fast ? 'thở nhanh, sâu' : slow ? 'thở chậm' : ''}</Tx>
    </>
  );
};

// ---------- 8 Thận ----------
const B8: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const day = Math.min(5, Math.floor(interpolate(t, [S[4], S[4] + D[4] * 0.9], [0, 5.99], clamp)));
  return (
    <>
      <Top idx={7} title="Thận: điều chỉnh chậm" />
      <Svg><g opacity={ap(t, S[0])}><Kid x={330} y={480} h={540 * (1 + Math.sin(f / 30) * 0.01)} /></g></Svg>
      <Callout x={110} y={170} a={ap(t, S[0] + 0.4)} c={K.hco3} size={32}>Lọc ~4.500 mEq HCO₃⁻ mỗi ngày</Callout>
      <Panel x={720} y={170} w={1100} h={150} c={K.green} s0={S[1]}>
        <div style={{position: 'absolute', left: 30, top: 40}}><Mark c={K.green} ch="1" s0={S[1] + 0.2} size={70} /></div>
        <Tx x={130} y={24} size={40} b={800}>Giữ lại HCO₃⁻ đã lọc</Tx>
        <Tx x={130} y={84} size={30} c={K.dim}>Ống lượn gần tái hấp thu 70–80%</Tx>
      </Panel>
      <Panel x={720} y={345} w={1100} h={210} c={K.hco3} s0={S[2]}>
        <div style={{position: 'absolute', left: 30, top: 70}}><Mark c={K.hco3} ch="2" s0={S[2] + 0.2} size={70} /></div>
        <Tx x={130} y={26} size={40} b={800}>Tạo HCO₃⁻ mới: thải H⁺</Tx>
        <Tx x={130} y={88} w={940} size={32} a={ap(t, S[3])}>Dạng amoni (NH₄⁺): ½ – ⅔</Tx>
        <Tx x={130} y={136} w={940} size={32} a={ap(t, S[3] + D[3] * 0.5)}>Phần còn lại: acid chuẩn độ (phosphate)</Tx>
      </Panel>
      <Panel x={720} y={580} w={520} h={205} c={K.amber} s0={S[4]}>
        <Tx x={0} y={18} w={520} al="center" size={30} c={K.amber} b={800}>BÙ TỐI ĐA</Tx>
        <div style={{position: 'absolute', left: 40, right: 40, top: 76, display: 'flex', gap: 10}}>
          {[1, 2, 3, 4, 5].map((d) => <div key={d} style={{flex: 1, height: 80, borderRadius: 12, background: d <= day ? K.amber : 'rgba(255,255,255,.08)', color: d <= day ? K.ink : K.dim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 34, fontWeight: 800}}>{d}</div>)}
        </div>
        <Tx x={0} y={164} w={520} al="center" size={24} c={K.dim}>ngày</Tx>
      </Panel>
      <Panel x={1270} y={580} w={550} h={190} c={K.line} s0={S[5]}>
        <Tx x={26} y={30} w={500} size={34} b={800} lh={1.25}>Hô hấp cấp ≠ mạn ở mức HCO₃⁻</Tx>
      </Panel>
      <Memo x={360} y={808} w={1200} s0={S[5] + D[5] * 0.5} size={40}>PHỔI lo CO₂, nhanh · THẬN lo HCO₃⁻, chậm</Memo>
    </>
  );
};

// ---------- 9 Hệ đệm khác ----------
const Buf: React.FC<{x: number; s0: number; c: string; name: string; note: string; art: React.ReactNode}> = ({x, s0, c, name, note, art}) => (
  <Panel x={x} y={190} w={400} h={420} c={c} s0={s0}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 30, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{art}</div>
    <Tx x={0} y={250} w={400} al="center" size={44} b={800}>{name}</Tx>
    <Tx x={20} y={318} w={360} al="center" size={28} c={K.dim}>{note}</Tx>
  </Panel>
);
const B9: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const rb = useMemo(() => A.rbc('r9'), []);
  const bo = useMemo(() => A.bone('o9'), []);
  return (
    <>
      <Top idx={8} title="Các hệ đệm khác" />
      <Buf x={110} s0={S[0] + 0.2} c={K.o2} name="Hemoglobin" note="trong hồng cầu" art={<Ico w={150} h={150} vb="-45 -45 90 90" html={rb} />} />
      <Buf x={550} s0={S[0] + D[0] * 0.45} c={K.green} name="Protein" note="huyết tương, tế bào" art={
        <svg width={220} height={120} viewBox="0 0 220 120">{Array.from({length: 7}, (_, i) => <circle key={i} cx={20 + i * 30} cy={60 + Math.sin(i) * 26} r={16} fill={i % 2 ? '#3FB27F' : '#7FD6A8'} stroke="#1F6E4E" strokeWidth={3} />)}</svg>
      } />
      <Buf x={990} s0={S[0] + D[0] * 0.75} c="#E8D9B0" name="Xương" note="đệm khi toan kéo dài" art={<Ico w={240} h={100} vb="-130 -45 260 90" html={bo} />} />
      <Buf x={1430} s0={S[1]} c={K.amber} name="Phosphate" note="hệ đệm chính trong nước tiểu" art={
        <svg width={120} height={170} viewBox="0 0 120 170"><path d="M20,20 L100,20 L92,160 L28,160 Z" fill="rgba(245,200,74,.35)" stroke="#F5C84A" strokeWidth={4} /><rect x={30} y={70} width={60} height={86} fill="#F5C84A" opacity={0.7} /></svg>
      } />
      <Panel x={360} y={650} w={1200} h={140} c={K.o2} s0={S[2]}>
        <Tx x={30} y={40} w={1140} al="center" size={40} b={800}>Toan máu kéo dài → xương đệm liên tục → mất khoáng</Tx>
      </Panel>
    </>
  );
};

// ---------- 10 Ôn tập ----------
const R2: React.FC<{y: number; s0: number; c: string; n: string; txt: string}> = ({y, s0, c, n, txt}) => (
  <Panel x={260} y={y} w={1400} h={140} c={c} s0={s0}>
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 28, padding: '0 34px'}}>
      <Mark c={c} ch={n} s0={s0 + 0.15} size={76} />
      <span style={{fontFamily: FONT, fontSize: 46, fontWeight: 800, color: K.txt}}>{chem(txt)}</span>
    </div>
  </Panel>
);
const B10: React.FC<{S: number[]; D: number[]}> = ({S}) => {
  const nx = usePop(S[3] + 0.3);
  return (
    <>
      <Top idx={9} title="Ôn tập" />
      <R2 y={170} s0={S[0] + 0.3} c={K.amber} n="1" txt="Ba tuyến: ĐỆM → PHỔI → THẬN" />
      <R2 y={340} s0={S[1] + 0.3} c={K.green} n="2" txt="pH theo tỉ số HCO₃⁻ / CO₂ = 20 : 1" />
      <R2 y={510} s0={S[2] + 0.3} c={K.co2} n="3" txt="PHỔI lo CO₂, nhanh · THẬN lo HCO₃⁻, chậm" />
      {nx > 0.01 && (
        <div style={{position: 'absolute', left: 360, top: 740, width: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '18px 0', borderRadius: 999, border: `2px solid ${K.amber}`, background: 'rgba(245,184,61,.08)', fontFamily: FONT, opacity: Math.min(1, nx * 1.5), transform: `translateY(${(1 - nx) * 30}px)`}}>
          <span style={{fontSize: 28, fontWeight: 800, color: K.amber, letterSpacing: 1}}>BÀI 3</span>
          <span style={{fontSize: 34, fontWeight: 700, color: K.txt}}>{chem('Đánh giá oxy hoá: PaO₂, P/F và chênh lệch A–a')}</span>
        </div>
      )}
    </>
  );
};

const SC: React.FC<{S: number[]; D: number[]}>[] = [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10];

export const Abg2: React.FC = () => (
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
