// Giải mã khí máu · Bài 1: Khí máu động mạch — chỉ định và lấy mẫu đúng (9 cảnh)
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
const NAMES = ['VÌ SAO', 'ĐỌC GÌ', 'KHI NÀO', 'LẤY MÁU', 'PHÁ MẪU', 'GỬI MẪU', 'TĨNH MẠCH', 'LẪN MẪU', 'ÔN TẬP'];

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
      <Tx x={44} y={22} size={24} c={K.dim} b={600}>GIẢI MÃ KHÍ MÁU · BÀI 1</Tx>
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

// ---------- Cảnh 1 ----------
const Slip: React.FC<{x: number; y: number; id: string; name: string; s0: number; o2: number; co2: number; alert?: number; c: string; rot: number}> = ({x, y, id, name, s0, o2, co2, alert = 0, c, rot}) => {
  const p = usePop(s0);
  const art = useMemo(() => A.slip(id, 480, 520), [id]);
  const f = useCurrentFrame();
  const shake = alert > 0 && alert < 1 ? Math.sin(f * 1.5) * 3 : 0;
  const hot = alert > 0.1;
  const Row = ({y: ry, label, v}: {y: number; label: string; v: number}) => (
    <>
      {hot && <div style={{position: 'absolute', left: 190, top: ry - 6, width: 262, height: 104, borderRadius: 14, background: `rgba(229,72,77,${0.14 * alert})`, border: `3px solid rgba(229,72,77,${alert})`}} />}
      <Tx x={30} y={ry + 30} size={38} c={K.muted} b={700}>{label}</Tx>
      <div style={{position: 'absolute', left: 190, top: ry - 6, width: 262, height: 104, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: hot ? K.o2 : K.ink}}>
        <span style={{fontSize: 78, fontWeight: 800, fontVariantNumeric: 'tabular-nums'}}>{Math.round(v)}</span>
      </div>
    </>
  );
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 480, height: 540, opacity: Math.min(1, p * 1.5), transform: `translate(${shake}px,${(1 - p) * 60}px) rotate(${rot}deg)`}}>
      <svg viewBox="0 0 480 540" style={{position: 'absolute', inset: 0, overflow: 'visible'}} dangerouslySetInnerHTML={{__html: art}} />
      <Tx x={30} y={22} size={46} c={c} b={800}>{name}</Tx>
      <div style={{position: 'absolute', left: 30, right: 30, top: 92, height: 2, background: 'rgba(0,0,0,.2)'}} />
      <Row y={132} label="PaO₂" v={o2} />
      <Row y={278} label="PaCO₂" v={co2} />
      <Tx x={30} y={438} size={26} c={K.muted} b={500}>mmHg · số minh hoạ</Tx>
    </div>
  );
};
const Sc1: React.FC<{S: number[]}> = ({S}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const ch = ap(t, S[1] + 0.9, 0.9);
  const sp = usePop(S[1]);
  const bub = ap(t, S[1] + 0.6, 0.6);
  const clean = useMemo(() => A.syringe('s1a', {bubbles: 0}), []);
  const dirty = useMemo(() => A.syringe('s1b', {bubbles: 5}), []);
  const ecg = Array.from({length: 96}, (_, i) => {
    const u = ((i + f * 0.9) % 48) / 48;
    const y = u > 0.44 && u < 0.47 ? -30 : u > 0.47 && u < 0.5 ? 12 : u > 0.6 && u < 0.7 ? -7 : 0;
    return `${660 + i * 6.2},${300 + y}`;
  }).join(' ');
  return (
    <>
      <Top idx={0} title="Một bệnh nhân, hai kết quả" />
      <Slip x={100} y={185} id="pa" name="MẪU A" s0={0.4} o2={72} co2={40} c="#1477AB" rot={-1.4} />
      <Slip x={1340} y={185} id="pb" name="MẪU B" s0={0.8} o2={interpolate(ch, [0, 1], [72, 95])} co2={interpolate(ch, [0, 1], [40, 34])} alert={ap(t, S[1] + 1.5, 0.7)} c="#D3601F" rot={1.4} />
      <Tx x={640} y={206} w={640} al="center" size={36} b={700} a={ap(t, S[0] + 1)}>Cùng bệnh nhân · cùng thời điểm</Tx>
      <Svg>
        <polyline points={ecg} fill="none" stroke={K.green} strokeWidth={3.5} opacity={ap(t, S[0] + 1) * 0.9} style={{filter: `drop-shadow(0 0 6px ${K.green})`}} />
        <g opacity={sp} transform={`translate(${(1 - sp) * -50},0)`}>
          <Art html={clean} x={645} y={410} s={0.9} a={1 - bub} />
          <Art html={dirty} x={645} y={410} s={0.9} a={bub} />
        </g>
        <Curve d="M1120,632 C1200,640 1270,620 1324,560" p={ap(t, S[1] + 1.1, 0.7)} />
      </Svg>
      <Tx x={645} y={606} w={480} al="center" size={36} c={K.amber} b={700} a={ap(t, S[1] + 0.9)}>Chỉ vài bọt khí trong ống tiêm</Tx>
      <Memo x={560} y={740} w={800} s0={S[2] + 0.4} size={44}>Mẫu sai thì đọc giỏi cũng sai</Memo>
    </>
  );
};

// ---------- Cảnh 2 ----------
const Row: React.FC<{y: number; label: string; meaning: string; c: string; s0: number}> = ({y, label, meaning, c, s0}) => {
  const t = useSec();
  const on = ap(t, s0, 0.35);
  return (
    <div style={{position: 'absolute', left: 124, top: y, width: 532, height: 102, borderRadius: 12, opacity: 0.3 + 0.7 * on, background: on > 0 ? `${c}${Math.round(on * 38).toString(16).padStart(2, '0')}` : 'transparent', borderLeft: `12px solid ${c}`, fontFamily: FONT, transform: `scale(${1 + 0.02 * on})`}}>
      <Tx x={24} y={22} size={50} c={K.ink} b={800}>{label}</Tx>
      <Tx x={210} y={32} w={296} al="right" size={30} c={K.muted} b={600}>{meaning}</Tx>
    </div>
  );
};
const Q: React.FC<{y: number; s0: number; n: string; text: string; c: string; hot: number; art: React.ReactNode}> = ({y, s0, n, text, c, hot, art}) => {
  const p = usePop(s0);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * 70}px)`}}>
      <div style={{position: 'absolute', left: 1000, top: y, width: 830, height: 204, borderRadius: 22, background: 'linear-gradient(120deg,rgba(255,255,255,.1),rgba(255,255,255,.03))', border: `3px solid ${c}`, boxShadow: `0 0 ${10 + 34 * hot}px ${c}${hot > 0.05 ? 'CC' : '00'}`}} />
      <Svg>{art}</Svg>
      <Tx x={1250} y={y + 28} size={26} c={c} b={800}>{n}</Tx>
      <Tx x={1250} y={y + 66} w={560} size={42} b={700}>{text}</Tx>
    </div>
  );
};
const Sc2: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const r = S[4];
  const gap = D[4] / 4;
  const win = (s: number) => Math.min(ap(t, s, 0.25), 1 - ap(t, s + gap, 0.3));
  const slipArt = useMemo(() => A.slip('p2', 600, 590), []);
  const dropA = useMemo(() => A.drop('d2'), []);
  const lungA = useMemo(() => A.lungs('l2'), []);
  const gaugeA = useMemo(() => A.gaugeBase('x2'), []);
  const br = 0.66 + Math.sin(f / 20) * 0.014;
  const nd = Math.sin(f / 24) * 42;
  return (
    <>
      <Top idx={1} title="Khí máu cho biết gì?" />
      <Svg><Art html={slipArt} x={90} y={160} a={ap(t, 0.2, 0.4)} /></Svg>
      <Tx x={124} y={182} size={40} c={K.ink} b={800} a={ap(t, 0.4)}>PHIẾU KHÍ MÁU</Tx>
      <Row y={254} label="pH" meaning="toan hay kiềm" c={K.ph} s0={r} />
      <Row y={366} label="PaCO₂" meaning="thông khí" c={K.co2} s0={r + gap} />
      <Row y={478} label="HCO₃⁻" meaning="chuyển hoá" c={K.hco3} s0={r + 2 * gap} />
      <Row y={590} label="PaO₂" meaning="oxy hoá" c={K.o2} s0={r + 3 * gap} />
      <Q y={146} s0={S[1]} n="CÂU 1 · Ô XY" text="Máu có đủ O₂ không?" c={K.o2} hot={win(r + 3 * gap)} art={<Art html={dropA} x={1122} y={244} s={0.8 + Math.sin(f / 14) * 0.012} />} />
      <Q y={368} s0={S[2]} n="CÂU 2 · THÔNG KHÍ" text="Phổi có thải CO₂ phù hợp không?" c={K.co2} hot={win(r + gap)} art={<Art html={lungA} x={1122} y={478} s={br} />} />
      <Q y={590} s0={S[3]} n="CÂU 3 · TOAN KIỀM" text="Cơ thể đang toan hay kiềm?" c={K.hco3} hot={Math.max(win(r), win(r + 2 * gap))} art={
        <g>
          <Art html={gaugeA} x={1122} y={732} s={0.72} />
          <line x1={1122} y1={732} x2={1122 + 62 * Math.sin((nd * Math.PI) / 180)} y2={732 - 62 * Math.cos((nd * Math.PI) / 180)} stroke="#F2F7F9" strokeWidth={6} strokeLinecap="round" />
          <circle cx={1122} cy={732} r={10} fill="#F2F7F9" />
        </g>
      } />
      <Memo x={110} y={780} w={560} s0={S[4] + D[4] * 0.85} size={32}>Ô XY · THÔNG KHÍ · TOAN KIỀM</Memo>
    </>
  );
};

// ---------- Cảnh 3 ----------
const MS = 0.285;
const WS = 0.98, WX = -4, WY = 112; // hệ toạ độ bàn tay trên màn hình
const wx = (x: number) => WX + x * WS;
const wy = (y: number) => WY + y * WS;
const ScLay: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const skin = useMemo(() => A.handSkin('w3'), []);
  const anat = useMemo(() => A.anatomy('a3'), []);
  const mini = useMemo(() => A.handSkin('w4'), []);
  const miniPale = useMemo(() => A.handSkin('w5', 0.62), []);
  const syr = useMemo(() => A.syringe('s3', {fill: 0.6}), []);
  const glove = useMemo(() => A.gloveFinger('g3'), []);
  const handP = usePop(0.1, 18);
  const reveal = ap(t, S[0] + 0.4, 0.9);
  const lbl = ap(t, S[0] + 1.1);
  const lbl2 = ap(t, S[0] + 2.2);
  const beat = Math.pow(Math.max(0, Math.sin(f / 7.2)), 6);
  // Rút kim dọc trục 0–1, ngón tay đè sau đó
  const needleOn = Math.min(ap(t, S[2] - 0.7, 0.4), 1 - ap(t, S[2] + 0.9, 0.3));
  const withdraw = interpolate(t, [S[2] + 0.1, S[2] + 1.1], [0, 1], clamp);
  const press = usePop(S[2] + 1.0, 16);
  const clock = interpolate(t, [S[2] + 1.2, S[2] + D[2]], [0, 1], clamp);
  const allenA = usePop(S[1]);
  const pink = ap(t, S[1] + 2, 0.5);
  const sx = wx(A.SITE.x), sy = wy(A.SITE.y);
  // Mũi kim: toạ độ (706, 85) trong khung ống tiêm
  const dist = withdraw * 190;
  const RAD = -24;
  const dx = Math.cos((RAD * Math.PI) / 180) * dist, dy = Math.sin((RAD * Math.PI) / 180) * dist;
  const SYR = 0.62;
  return (
    <>
      <Top idx={3} title="Lấy máu động mạch quay" />
      <Svg>
        <g opacity={Math.min(1, handP * 1.4)} transform={`translate(${(1 - handP) * -60},0)`}>
          <Art html={skin} x={WX} y={WY} s={WS} />
          <Art html={anat} x={WX} y={WY} s={WS} a={reveal} />
          <g transform={`translate(${WX},${WY}) scale(${WS})`} opacity={reveal}>
            <path d={A.ARTERY} fill="none" stroke="#FF5A63" strokeWidth={16 + beat * 8} strokeOpacity={0.18 + beat * 0.55} strokeLinecap="round" style={{filter: 'blur(3px)'}} />
          </g>
          {press < 0.5 && needleOn <= 0 && reveal > 0.5 && (
            <g>
              <circle cx={sx} cy={sy} r={16 + beat * 12} fill="none" stroke="#FFE27A" strokeWidth={4} opacity={0.95 - beat * 0.5} />
              <circle cx={sx} cy={sy} r={6} fill="#FFE27A" />
            </g>
          )}
        </g>
        <Curve d={`M300,250 C340,280 350,330 362,${wy(298) - 14}`} c="#FF8E92" p={ap(t, S[0] + 1.1, 0.5)} />
        <Curve d={`M240,730 C250,690 262,640 280,${wy(352) + 14}`} c="#F4E9C7" p={ap(t, S[0] + 2.2, 0.5)} />
        {/* Kim rút ra */}
        {needleOn > 0 && (
          <g opacity={needleOn} transform={`translate(${sx + dx},${sy + dy}) rotate(${RAD}) scale(${-SYR},${SYR}) translate(-706,-85)`} dangerouslySetInnerHTML={{__html: syr}} />
        )}
        {press > 0.01 && (
          <g opacity={Math.min(1, press * 1.6)} transform={`translate(${sx},${sy - (1 - press) * 80}) rotate(14) scale(0.78)`} dangerouslySetInnerHTML={{__html: glove}} />
        )}
      </Svg>
      <Callout x={130} y={186} a={lbl} c="#FF8E92">Động mạch quay</Callout>
      <Callout x={90} y={726} a={lbl2} c="#F4E9C7" size={26}>Gân gấp cổ tay quay</Callout>

      {/* Allen */}
      <div style={{position: 'absolute', left: 1130, top: 140, width: 750, height: 350, borderRadius: 22, background: 'linear-gradient(120deg,rgba(255,255,255,.11),rgba(255,255,255,.03))', border: `3px solid ${K.green}`, opacity: Math.min(1, allenA * 1.5), transform: `translateX(${(1 - allenA) * 70}px)`}} />
      <Tx x={1158} y={156} size={36} b={800} a={Math.min(1, allenA)}>Nghiệm pháp Allen</Tx>
      <Svg>
        <g opacity={Math.min(1, allenA * 1.5)}>
          <Art html={miniPale} x={1172} y={200} s={MS} />
          <circle cx={1172 + MS * 500} cy={200 + MS * 300} r={13} fill="#3D6DE0" stroke="#fff" strokeWidth={3} />
          <circle cx={1172 + MS * 500} cy={200 + MS * 470} r={13} fill="#3D6DE0" stroke="#fff" strokeWidth={3} />
        </g>
        <Curve d="M1486,306 L1526,306" c={K.txt} w={4} p={ap(t, S[1] + 1.6, 0.3)} />
        <g opacity={pink}>
          <Art html={mini} x={1550} y={200} s={MS} />
          <circle cx={1550 + MS * 500} cy={200 + MS * 300} r={13} fill="#3D6DE0" stroke="#fff" strokeWidth={3} />
        </g>
      </Svg>
      <Tx x={1158} y={398} w={340} al="center" size={25} c={K.dim} lh={1.2} a={Math.min(1, allenA)}>Đè hai động mạch: bàn tay nhợt</Tx>
      <Tx x={1534} y={398} w={330} al="center" size={25} c={K.dim} lh={1.2} a={pink}>Thả động mạch trụ: hồng lại</Tx>

      {/* Đồng hồ */}
      <div style={{position: 'absolute', left: 1130, top: 510, width: 750, height: 310, borderRadius: 22, background: 'linear-gradient(120deg,rgba(255,255,255,.11),rgba(255,255,255,.03))', border: `3px solid ${K.amber}`, opacity: ap(t, S[2], 0.4)}} />
      <Svg>
        <g opacity={ap(t, S[2], 0.4)}>
          <circle cx={1272} cy={665} r={104} fill="#0C1A22" stroke="#C8D5DC" strokeWidth={6} />
          {clock > 0 && <path d={`M1272,665 L1272,571 A94,94 0 ${clock > 0.5 ? 1 : 0} 1 ${1272 + 94 * Math.sin(clock * Math.PI * 2 * 0.9999)},${665 - 94 * Math.cos(clock * Math.PI * 2 * 0.9999)} Z`} fill={K.amber} />}
          {Array.from({length: 12}, (_, i) => <line key={i} x1={1272 + 92 * Math.sin((i * Math.PI) / 6)} y1={665 - 92 * Math.cos((i * Math.PI) / 6)} x2={1272 + 100 * Math.sin((i * Math.PI) / 6)} y2={665 - 100 * Math.cos((i * Math.PI) / 6)} stroke="#C8D5DC" strokeWidth={3} />)}
          <circle cx={1272} cy={665} r={9} fill="#F2F7F9" />
        </g>
      </Svg>
      <Tx x={1410} y={550} w={450} size={62} b={800} c={K.amber} a={ap(t, S[2] + 0.5)}>≥ 2 phút</Tx>
      <Tx x={1410} y={640} w={450} size={32} c={K.txt} lh={1.2} a={ap(t, S[2] + D[2] * 0.5)}>Lâu hơn nếu dùng thuốc chống đông, kháng tiểu cầu</Tx>
      <Memo x={450} y={770} w={560} s0={S[2] + D[2] * 0.72} size={40}>Rút kim xong, đè đủ lâu</Memo>
    </>
  );
};

// ---------- Cảnh 4 ----------
const Flip: React.FC<{x: number; s0: number; c: string; n: string; title: string; children: React.ReactNode}> = ({x, s0, c, n, title, children}) => {
  const p = usePop(s0, 15);
  if (p <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: x, top: 150, width: 570, height: 570, perspective: 1500}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 24, background: 'linear-gradient(160deg,#20363F,#111F27)', border: `3px solid ${c}`, boxShadow: `0 18px 44px rgba(0,0,0,.5), 0 0 30px ${c}33`, transform: `rotateY(${(1 - p) * 88}deg)`, transformOrigin: 'left center', opacity: Math.min(1, p * 1.6)}}>
        <Tx x={28} y={18} size={24} c={c} b={800}>{n}</Tx>
        <Tx x={28} y={50} size={50} b={800}>{title}</Tx>
        <div style={{position: 'absolute', left: 0, top: 0}}>{children}</div>
      </div>
    </div>
  );
};
const Stat: React.FC<{x: number; w: number; dir: string; label: string; c: string; a: number}> = ({x, w, dir, label, c, a}) => (
  <div style={{position: 'absolute', left: x, top: 360, width: w, height: 112, borderRadius: 16, background: `${c}26`, border: `2px solid ${c}`, opacity: a, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, color: K.txt, transform: `translateY(${(1 - a) * 12}px)`}}>
    <span style={{fontSize: 50, fontWeight: 800, color: c}}>{dir}</span>
    <span style={{fontSize: 32, fontWeight: 700}}>{chem(label)}</span>
  </div>
);
const ScPha: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const s1 = useMemo(() => A.syringe('s4a', {bubbles: 5}), []);
  const s2 = useMemo(() => A.syringe('s4b', {liquid: 'hep', fill: 0.3}), []);
  const rb = useMemo(() => A.rbc('r4'), []);
  const wb = useMemo(() => A.wbc('b4'), []);
  const sand = interpolate(t, [S[2] + 0.5, S[2] + D[2]], [0.04, 0.96], clamp);
  const inner = (w: React.ReactNode) => <svg viewBox="0 0 570 570" style={{position: 'absolute', left: 0, top: 0, width: 570, height: 570, overflow: 'visible'}}>{w}</svg>;
  const dropT = interpolate(t, [S[1] + D[1] * 0.45, S[1] + D[1] * 0.95], [0, 1], clamp);
  return (
    <>
      <Top idx={4} title="Ba kẻ phá mẫu" />
      <Flip x={60} s0={S[0]} c={K.co2} n="KẺ THỨ NHẤT" title="Bọt khí">
        {inner(<Art html={s1} x={24} y={160} s={0.74} />)}
        <Stat x={28} w={252} dir="↓" label="CO₂ giảm" c={K.co2} a={ap(t, S[0] + D[0] * 0.55)} />
        <Stat x={292} w={252} dir="↑" label="O₂ tăng giả" c={K.o2} a={ap(t, S[0] + D[0] * 0.72)} />
        <Tx x={28} y={490} w={516} al="center" size={28} c={K.dim} a={ap(t, S[0] + D[0] * 0.35)}>Trao đổi khí với máu</Tx>
      </Flip>
      <Flip x={675} s0={S[1]} c={K.green} n="KẺ THỨ HAI" title="Heparin thừa">
        {inner(
          <>
            <Art html={s2} x={24} y={160} s={0.74} />
            {[0, 0.33, 0.66].map((o, i) => {
              const u = (dropT * 1.6 + o) % 1;
              if (dropT <= 0) return null;
              return <circle key={i} cx={540} cy={228 + u * 110} r={8 - u * 3} fill="#FBEFB5" opacity={1 - u} />;
            })}
          </>
        )}
        <Tx x={28} y={370} w={514} al="center" size={40} b={700} a={ap(t, S[1] + D[1] * 0.45)}>Đẩy bớt khỏi ống tiêm</Tx>
        <Tx x={28} y={436} w={514} al="center" size={28} c={K.dim} a={ap(t, S[1] + D[1] * 0.6)}>heparin lỏng và bọt khí</Tx>
      </Flip>
      <Flip x={1290} s0={S[2]} c={K.hco3} n="KẺ THỨ BA" title="Thời gian">
        {inner(
          <>
            <Art html={A.hourglass('h4', sand)} x={285} y={260} s={0.72} />
            <g opacity={ap(t, S[2] + D[2] * 0.3)}>
              <Art html={rb} x={120 + Math.sin(f / 26) * 8} y={240 + Math.cos(f / 22) * 8} s={1} />
              <Art html={wb} x={450 + Math.cos(f / 28) * 8} y={270 + Math.sin(f / 20) * 8} s={1} />
            </g>
          </>
        )}
        <Tx x={28} y={378} w={514} al="center" size={38} b={700} a={ap(t, S[2] + D[2] * 0.3)}>Tế bào vẫn chuyển hoá</Tx>
        <Tx x={28} y={456} w={514} al="center" size={28} c={K.dim} a={ap(t, S[2] + D[2] * 0.55)}>Để lâu: không còn phản ánh đúng bệnh nhân</Tx>
      </Flip>
      <Memo x={530} y={745} w={860} s0={S[2] + D[2] * 0.72} size={50}>BỌT · HEPARIN · THỜI GIAN</Memo>
    </>
  );
};

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

// ---------- Cảnh 3: Khi nào ----------
const Need: React.FC<{x: number; y: number; s0: number; c: string; n: string; title: string; sub: string; art: React.ReactNode; glow?: number}> = ({x, y, s0, c, n, title, sub, art, glow}) => (
  <Panel x={x} y={y} w={830} h={250} c={c} s0={s0} glow={glow}>
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 30, padding: '0 34px', fontFamily: FONT, color: K.txt}}>
      <div style={{width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>{art}</div>
      <div>
        <div style={{fontSize: 26, fontWeight: 800, color: c, letterSpacing: 1}}>{n}</div>
        <div style={{fontSize: 44, fontWeight: 800, lineHeight: 1.15}}>{title}</div>
        <div style={{fontSize: 30, fontWeight: 500, color: K.dim, marginTop: 6}}>{chem(sub)}</div>
      </div>
    </div>
  </Panel>
);
const ScKhi: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const lungA = useMemo(() => A.lungs('l3'), []);
  const gaugeA = useMemo(() => A.gaugeBase('x3'), []);
  const dropA = useMemo(() => A.drop('d3'), []);
  const nd = Math.sin(f / 18) * 55;
  const dash = (f * 4) % 240;
  const on = (k: number) => Math.min(ap(t, S[k], 0.3), 1 - ap(t, S[k] + D[k], 0.4));
  return (
    <>
      <Top idx={2} title="Khi nào cần làm khí máu?" />
      <Tx x={100} y={168} w={1720} al="center" size={34} c={K.dim} a={Math.min(ap(t, S[0] + 0.2), 1 - ap(t, S[1], 0.3))}>Bốn tình huống thường gặp</Tx>
      <Need x={100} y={170} s0={S[1]} c={K.co2} n="MỘT" title="Suy hô hấp" sub="Cần biết oxy hoá và thông khí" glow={on(1)}
        art={<Ico w={180} h={174} vb="-140 -150 280 270" html={lungA} style={{transform: `scale(${1 + Math.sin(f / 18) * 0.025})`}} />} />
      <Need x={990} y={170} s0={S[2]} c={K.hco3} n="HAI" title="Toan kiềm nặng" sub="Sốc · nhiễm toan ceton · ngộ độc" glow={on(2)}
        art={
          <svg width={180} height={100} viewBox="-125 -115 250 135" style={{overflow: 'visible'}}>
            <g dangerouslySetInnerHTML={{__html: gaugeA}} />
            <line x1={0} y1={0} x2={86 * Math.sin((nd * Math.PI) / 180)} y2={-86 * Math.cos((nd * Math.PI) / 180)} stroke="#F2F7F9" strokeWidth={8} strokeLinecap="round" />
            <circle r={12} fill="#F2F7F9" />
          </svg>
        } />
      <Need x={100} y={448} s0={S[3]} c={K.green} n="BA" title="Theo dõi, chỉnh máy thở" sub="Đánh giá sau mỗi thay đổi lớn" glow={on(3)}
        art={
          <svg width={180} height={140} viewBox="0 0 180 140">
            <rect x={4} y={4} width={172} height={132} rx={18} fill="#0D1B24" stroke={K.green} strokeWidth={4} />
            <path d="M14,100 L34,100 L44,44 L74,44 L82,100 L96,100 L106,44 L136,44 L144,100 L166,100" fill="none" stroke={K.green} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="240 400" strokeDashoffset={240 - dash} />
          </svg>
        } />
      <Need x={990} y={448} s0={S[4]} c={K.o2} n="VÀ KHI" title="Nghi ngộ độc khí CO" sub="SpO₂ kẹp ngón có thể báo cao giả" glow={on(4)}
        art={
          <div style={{position: 'relative', width: 180, height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Ico w={110} h={150} vb="-70 -90 140 190" html={dropA} />
            <div style={{position: 'absolute', right: 0, top: 8, padding: '4px 10px', borderRadius: 10, background: '#0D1B24', border: `2px solid ${K.o2}`, fontFamily: FONT, fontSize: 26, fontWeight: 800, color: K.txt}}>CO</div>
          </div>
        } />
      <Memo x={360} y={762} w={1200} s0={S[4] + D[4] * 0.75} size={40}>SUY HÔ HẤP · TOAN KIỀM · THỞ MÁY · NGỘ ĐỘC CO</Memo>
    </>
  );
};

// ---------- Cảnh 6: Gửi mẫu ----------
const Step: React.FC<{y: number; s0: number; children: string}> = ({y, s0, children}) => {
  const t = useSec();
  const a = ap(t, s0, 0.35);
  return (
    <div style={{position: 'absolute', left: 100, top: y, width: 960, height: 96, boxSizing: 'border-box', padding: '0 26px', borderRadius: 18, background: `rgba(26,46,55,${0.4 + 0.6 * a})`, border: `2px solid ${a > 0.5 ? K.green : K.line}`, display: 'flex', alignItems: 'center', gap: 24, fontFamily: FONT, opacity: 0.25 + 0.75 * a}}>
      <Mark c={K.green} ch="✓" s0={s0 + 0.15} />
      <span style={{fontSize: 38, fontWeight: 700, color: K.txt}}>{chem(children)}</span>
    </div>
  );
};
const ScGui: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const syr = useMemo(() => A.syringe('s6', {fill: 0.7}), []);
  const roll = interpolate(t, [S[0] + D[0] * 0.66, S[1]], [0, 1], clamp);
  const rot = roll > 0 && roll < 1 ? Math.sin(roll * Math.PI * 4) * 6 : 0;
  const clockP = interpolate(t, [S[2] + 0.4, S[2] + D[2]], [0, 0.5], clamp);
  const cardA = usePop(S[2]);
  const sp = usePop(0.2);
  return (
    <>
      <Top idx={5} title="Gửi mẫu đúng cách" />
      <Svg><g opacity={Math.min(1, sp * 1.4)}><Art html={syr} x={96} y={160} s={0.86} rot={rot} /></g></Svg>
      <Step y={330} s0={S[0] + 0.2}>Đuổi hết bọt khí</Step>
      <Step y={444} s0={S[0] + D[0] * 0.38}>Đậy nắp kín</Step>
      <Step y={558} s0={S[0] + D[0] * 0.66}>Lăn nhẹ ống để trộn đều</Step>
      <Step y={672} s0={S[1] + 0.2}>Ghi FiO₂, chế độ thở, nhiệt độ</Step>
      <Panel x={1140} y={180} w={680} h={500} c={K.amber} s0={S[2]}>
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, paddingTop: 34, fontFamily: FONT, color: K.txt}}>
          <div style={{width: 230, height: 230, borderRadius: '50%', border: '6px solid #C8D5DC', background: `conic-gradient(${K.amber} 0 ${clockP * 100}%, #0C1A22 ${clockP * 100}% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{width: 120, height: 120, borderRadius: '50%', background: '#0C1A22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 800}}>30'</div>
          </div>
          <div style={{fontSize: 56, fontWeight: 800, color: K.amber, opacity: Math.min(1, cardA)}}>≤ 30 phút</div>
          <div style={{fontSize: 32, textAlign: 'center', lineHeight: 1.25, padding: '0 30px'}}>Ống nhựa · nhiệt độ phòng · phân tích càng sớm càng tốt</div>
        </div>
      </Panel>
      <Memo x={1140} y={742} w={680} s0={S[2] + D[2] * 0.7} size={38}>HẾT BỌT · ĐẬY · TRỘN · ĐO NGAY</Memo>
    </>
  );
};

// ---------- Cảnh 7: Khí máu tĩnh mạch ----------
const VRow: React.FC<{y: number; s0: number; c: string; ch: string; label: string; note: string; glow?: number}> = ({y, s0, c, ch, label, note, glow = 0}) => (
  <Panel x={820} y={y} w={1000} h={108} c={c} s0={s0} glow={glow}>
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 24, padding: '0 26px', fontFamily: FONT, color: K.txt}}>
      <Mark c={c} ch={ch} s0={s0 + 0.2} />
      <span style={{width: 200, fontSize: 46, fontWeight: 800}}>{chem(label)}</span>
      <span style={{fontSize: 31, fontWeight: 500}}>{chem(note)}</span>
    </div>
  </Panel>
);
const ScTinh: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const art = useMemo(() => A.syringe('s7a', {fill: 0.7}), []);
  const ven = useMemo(() => A.syringe('s7v', {fill: 0.7, liquid: 'venous'}), []);
  const gl = Math.min(ap(t, S[2], 0.3), 1 - ap(t, S[2] + D[2], 0.4));
  return (
    <>
      <Top idx={6} title="Khi nào dùng máu tĩnh mạch?" />
      <Panel x={100} y={170} w={640} h={240} c={K.o2} s0={S[0] + 0.2}>
        <Tx x={26} y={18} size={26} c={K.o2} b={800}>ĐỘNG MẠCH</Tx>
        <svg width={600} height={170} viewBox="0 0 720 170" style={{position: 'absolute', left: 20, top: 60}} dangerouslySetInnerHTML={{__html: art}} />
      </Panel>
      <Panel x={100} y={440} w={640} h={240} c="#8E9EE0" s0={S[0] + 0.8}>
        <Tx x={26} y={18} size={26} c="#AAB7EE" b={800}>TĨNH MẠCH</Tx>
        <svg width={600} height={170} viewBox="0 0 720 170" style={{position: 'absolute', left: 20, top: 60}} dangerouslySetInnerHTML={{__html: ven}} />
      </Panel>
      <Tx x={820} y={150} size={32} c={K.dim} b={700} a={ap(t, S[1])}>Khí máu tĩnh mạch dùng được không?</Tx>
      <VRow y={206} s0={S[1] + 0.5} c={K.green} ch="✓" label="pH" note="Thấp hơn động mạch khoảng 0,03–0,04" glow={gl} />
      <VRow y={330} s0={S[1] + 1.3} c={K.green} ch="✓" label="HCO₃⁻" note="Gần tương đương, dùng theo dõi DKA" />
      <VRow y={454} s0={S[3] + 0.2} c={K.amber} ch="!" label="PCO₂" note="Dao động rộng, không thay được PaCO₂" />
      <VRow y={578} s0={S[3] + D[3] * 0.5} c={K.o2} ch="✕" label="PO₂" note="Không dùng để đánh giá oxy hoá" />
      <Memo x={440} y={766} w={1040} s0={S[3] + D[3] * 0.82} size={40}>Tĩnh mạch: xem pH · Động mạch: xem O₂ và CO₂</Memo>
    </>
  );
};

// ---------- Cảnh 8: Mẫu lẫn tĩnh mạch ----------
const ScLan: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const fillA = interpolate(t, [S[1], S[1] + D[1]], [0, 1], clamp);
  const beats = Math.floor(fillA * 6);
  const fill = 0.12 + beats * 0.1 + (fillA * 6 - beats > 0.7 ? 0.1 * ((fillA * 6 - beats - 0.7) / 0.3) : 0);
  const syr = A.syringe('s8', {fill: Math.min(0.72, fill)});
  const showSyr = Math.min(ap(t, S[1] - 0.2, 0.4), 1 - ap(t, S[2] - 0.2, 0.4));
  const pulse = Math.pow(Math.max(0, Math.sin(f / 4.8)), 8);
  const mon = usePop(S[2]);
  const slipP = usePop(S[2] + 0.5);
  const neq = usePop(S[2] + D[2] * 0.55, 10);
  const wave = Array.from({length: 120}, (_, i) => `${i * 4.5},${80 - 40 * Math.max(0, Math.sin((i + f * 1.2) / 7)) ** 2}`).join(' ');
  return (
    <>
      <Top idx={7} title="Mẫu có thật là động mạch?" />
      {showSyr > 0 && (
        <div style={{position: 'absolute', left: 520, top: 300, width: 880, height: 300, opacity: showSyr}}>
          <svg width={880} height={210} viewBox="0 0 720 170" dangerouslySetInnerHTML={{__html: syr}} />
          <div style={{position: 'absolute', left: 300, top: 220, width: 300, textAlign: 'center', fontFamily: FONT, fontSize: 34, fontWeight: 700, color: K.o2, opacity: 0.4 + 0.6 * pulse}}>♥ theo nhịp mạch</div>
        </div>
      )}
      {mon > 0.01 && (
        <div style={{position: 'absolute', left: 100, top: 180, width: 600, height: 440, boxSizing: 'border-box', padding: '26px 30px', borderRadius: 22, background: '#050C10', border: '4px solid #2C3D45', boxShadow: '0 16px 40px rgba(0,0,0,.5)', opacity: Math.min(1, mon * 1.5), transform: `translateY(${(1 - mon) * 40}px)`, fontFamily: FONT}}>
          <div style={{fontSize: 26, fontWeight: 700, color: K.dim}}>MONITOR · cùng lúc lấy mẫu</div>
          <svg width={540} height={120} viewBox="0 0 540 120" style={{marginTop: 20}}><polyline points={wave} fill="none" stroke={K.co2} strokeWidth={5} /></svg>
          <div style={{display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 20, color: K.co2}}><span style={{fontSize: 40, fontWeight: 700}}>{chem('SpO₂')}</span><span style={{fontSize: 120, fontWeight: 800, lineHeight: 1}}>97%</span></div>
        </div>
      )}
      {neq > 0.01 && <div style={{position: 'absolute', left: 790, top: 330, width: 120, height: 120, borderRadius: '50%', background: K.o2, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 80, fontWeight: 800, transform: `scale(${neq})`}}>≠</div>}
      {slipP > 0.01 && (
        <div style={{position: 'absolute', left: 1000, top: 180, width: 480, height: 440, boxSizing: 'border-box', padding: '24px 30px', background: '#fff', color: K.ink, boxShadow: '0 16px 40px rgba(0,0,0,.5)', fontFamily: FONT, display: 'flex', flexDirection: 'column', gap: 22, opacity: Math.min(1, slipP * 1.5), transform: `translateY(${(1 - slipP) * 40}px) rotate(1deg)`}}>
          <div style={{fontSize: 40, fontWeight: 800, borderBottom: '2px solid #D5DBDE', paddingBottom: 14}}>PHIẾU KHÍ MÁU</div>
          {[['PaO₂', '38'], ['SaO₂', '70%']].map(([l, v]) => (
            <div key={l} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontSize: 38, fontWeight: 700, color: K.muted}}>{chem(l)}</span>
              <span style={{width: 220, textAlign: 'center', fontSize: 72, fontWeight: 800, color: neq > 0.3 ? '#D23A40' : K.ink, border: `3px solid ${neq > 0.3 ? K.o2 : 'transparent'}`, borderRadius: 12, background: neq > 0.3 ? 'rgba(229,72,77,.12)' : 'transparent'}}>{v}</span>
            </div>
          ))}
          <div style={{marginTop: 'auto', fontSize: 24, color: K.muted}}>số minh hoạ</div>
        </div>
      )}
      <div style={{position: 'absolute', left: 1540, top: 180, width: 300, display: 'flex', flexDirection: 'column', gap: 16}}>
        {[
          {s0: S[2] + 0.3, c: K.green, ch: '✓', txt: 'Máu tự dâng theo nhịp mạch'},
          {s0: S[2] + D[2] * 0.6, c: K.green, ch: '✓', txt: 'SaO₂ gần bằng SpO₂'},
          {s0: S[3] + 0.3, c: K.o2, ch: '✕', txt: 'Nhìn màu máu để đoán'},
        ].map((r) => {
          const a = ap(t, r.s0, 0.35);
          return (
            <div key={r.txt} style={{padding: '18px 20px', borderRadius: 18, background: '#1A2E37', border: `2px solid ${r.c}`, fontFamily: FONT, fontSize: 28, fontWeight: 600, lineHeight: 1.25, color: K.txt, opacity: a, transform: `translateX(${(1 - a) * 30}px)`}}>
              <b style={{color: r.c}}>{r.ch}</b> {chem(r.txt)}
            </div>
          );
        })}
      </div>
      <Memo x={400} y={700} w={1120} s0={S[2] + D[2] * 0.85} size={42}>SaO₂ lệch xa SpO₂ → nghi mẫu tĩnh mạch</Memo>
    </>
  );
};

// ---------- Cảnh 9: Ôn tập ----------
const Recap: React.FC<{x: number; y: number; s0: number; c: string; n: string; head: string; txt: string}> = ({x, y, s0, c, n, head, txt}) => (
  <Panel x={x} y={y} w={845} h={190} c={c} s0={s0}>
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 26, padding: '0 30px', fontFamily: FONT, color: K.txt}}>
      <Mark c={c} ch={n} s0={s0 + 0.15} size={76} />
      <div><div style={{fontSize: 26, fontWeight: 800, color: c}}>{head}</div><div style={{fontSize: 38, fontWeight: 700, lineHeight: 1.2}}>{chem(txt)}</div></div>
    </div>
  </Panel>
);
const ScOn: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const nx = usePop(S[2] + 0.3);
  return (
    <>
      <Top idx={8} title="Ôn tập" />
      <Recap x={100} y={170} s0={S[0] + 0.4} c={K.co2} n="1" head="KHI NÀO" txt="Suy hô hấp · toan kiềm · thở máy · CO" />
      <Recap x={975} y={170} s0={S[0] + D[0] * 0.45} c={K.o2} n="2" head="LẤY MÁU" txt="Động mạch quay · Allen · đè ≥ 2 phút" />
      <Recap x={100} y={390} s0={S[1] + 0.3} c={K.hco3} n="3" head="GIỮ MẪU" txt="Không bọt · bớt heparin · đo ≤ 30 phút" />
      <Recap x={975} y={390} s0={S[1] + D[1] * 0.6} c={K.green} n="4" head="KIỂM MẪU" txt="SaO₂ so với SpO₂" />
      <Memo x={460} y={630} w={1000} s0={S[1] + D[1] * 0.9} size={50}>Mẫu sai thì đọc giỏi cũng sai</Memo>
      {nx > 0.01 && (
        <div style={{position: 'absolute', left: 520, top: 800, width: 880, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '18px 0', borderRadius: 999, border: `2px solid ${K.amber}`, background: 'rgba(245,184,61,.08)', fontFamily: FONT, opacity: Math.min(1, nx * 1.5), transform: `translateY(${(1 - nx) * 30}px)`}}>
          <span style={{fontSize: 28, fontWeight: 800, color: K.amber, letterSpacing: 1}}>BÀI 2</span>
          <span style={{fontSize: 34, fontWeight: 700, color: K.txt}}>Cơ thể giữ pH 7,40 bằng cách nào?</span>
        </div>
      )}
    </>
  );
};

const SC: React.FC<{S: number[]; D: number[]}>[] = [Sc1, Sc2, ScKhi, ScLay, ScPha, ScGui, ScTinh, ScLan, ScOn];

export const Abg1: React.FC = () => (
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
