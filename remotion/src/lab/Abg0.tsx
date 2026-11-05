// Giải mã khí máu · Tập 0 (bản thử 4 cảnh): bảng tối + giấy kem + nét vẽ tay kiểu minh hoạ
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import data from '../data.json';
import {Caption, Progress} from '../Main';
import {Fade} from './Demo';
import {HAND, RArrow, REllipse, RLine, RPath, RRect, ap, dp} from '../wb/wb';

const K = {
  board: '#14252B', board2: '#1E353C', chalk: '#F4F1E6', dim: '#A9BDBE',
  paper: '#FBF5E6', paper2: '#F3E8CF', ink: '#25343D', muted: '#6B7A80',
  ph: '#F2B632', co2: '#2F9FD0', hco3: '#F07F3C', o2: '#D94F5C', green: '#3FA374', blood: '#B92F3C', skin: '#F2C6A5', skinD: '#B47A5C',
  sticky: '#FFD95A',
};
const NAMES = ['VÌ SAO', 'ĐỌC GÌ', 'LẤY MÁU', 'PHÁ MẪU'];

const useSec = () => useCurrentFrame() / 30;
const usePop = (s0: number, damping = 13) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - s0 * fps, fps, config: {damping, stiffness: 140, mass: 0.8}});
};

// Chỉ số dưới/trên viết đúng trong HTML để font tay không bị vỡ
const chem = (s: string) => {
  const out: React.ReactNode[] = [];
  s.split(/(₂|₃⁻)/).forEach((p, i) => {
    if (p === '₂') out.push(<sub key={i} style={{fontSize: '.62em'}}>2</sub>);
    else if (p === '₃⁻') out.push(<span key={i}><sub style={{fontSize: '.62em'}}>3</sub><sup style={{fontSize: '.62em', marginLeft: -2}}>−</sup></span>);
    else out.push(p);
  });
  return out;
};
const Tx: React.FC<{x: number; y: number; w?: number; size?: number; c?: string; a?: number; al?: 'left' | 'center' | 'right'; b?: number; lh?: number; children: string}> = ({x, y, w, size = 34, c = K.ink, a = 1, al = 'left', b = 0, lh = 1.15, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, textAlign: al, fontFamily: HAND, fontSize: size, color: c, opacity: a, lineHeight: lh, fontWeight: b ? 700 : 400, letterSpacing: 0.3, transform: `translateY(${(1 - a) * 12}px)`}}>
    {chem(children)}
  </div>
);
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, width: 1920, height: 1080}}>{children}</svg>
);

const Board: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 28% 22%, ${K.board2}, transparent 52%), radial-gradient(circle at 80% 76%, #1A3036, transparent 46%), ${K.board}`}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 58%, rgba(0,0,0,.42))'}} />
  </AbsoluteFill>
);

const Top: React.FC<{idx: number; title: string}> = ({idx, title}) => {
  const t = useSec();
  return (
    <>
      <Tx x={40} y={16} size={28} c={K.dim}>GIẢI MÃ KHÍ MÁU · TẬP 0</Tx>
      <Tx x={40} y={54} size={62} c={K.chalk} a={ap(t, 0.1)}>{title}</Tx>
      <Svg><RLine x1={42} y1={130} x2={interpolate(ap(t, 0.2, 0.9), [0, 1], [42, 42 + Math.min(760, title.length * 27)])} y2={130} stroke={K.ph} sw={4} seed={idx + 3} /></Svg>
      <div style={{position: 'absolute', right: 34, top: 20, display: 'flex', gap: 10, fontFamily: HAND}}>
        {NAMES.map((n, i) => (
          <div key={n} style={{padding: i === idx ? '4px 18px' : '4px 12px', borderRadius: 18, fontSize: i === idx ? 30 : 24, background: i === idx ? K.ph : 'rgba(255,255,255,.07)', color: i === idx ? K.ink : i < idx ? K.chalk : K.dim, border: '1.5px solid rgba(255,255,255,.16)'}}>
            {i === idx ? n : i + 1}
          </div>
        ))}
      </div>
    </>
  );
};

const Memo: React.FC<{x: number; y: number; w: number; s0: number; rot?: number; size?: number; children: string}> = ({x, y, w, s0, rot = -1.6, size = 42, children}) => {
  const p = usePop(s0);
  if (p <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, padding: '10px 24px 14px', background: K.sticky, color: K.ink, fontFamily: HAND, textAlign: 'center', boxShadow: '0 12px 28px rgba(0,0,0,.42)', transform: `rotate(${rot}deg) scale(${p})`, opacity: Math.min(1, p * 1.5), borderRadius: 4}}>
      <div style={{fontSize: 24, color: '#8A6410', letterSpacing: 3}}>GHI NHỚ</div>
      <div style={{fontSize: size, lineHeight: 1.12}}>{chem(children)}</div>
    </div>
  );
};

// Phiếu giấy vẽ tay
const Paper: React.FC<{x: number; y: number; w: number; h: number; s0: number; seed?: number}> = ({x, y, w, h, s0, seed = 4}) => {
  const t = useSec();
  return <RRect x={x} y={y} w={w} h={h} seed={seed} stroke={K.ink} sw={3.5} fill={K.paper} fillStyle="solid" prog={dp(t, s0, 0.8)} fillA={ap(t, s0, 0.45)} />;
};

// ---------- Hình vẽ dùng chung ----------
const Syringe: React.FC<{x: number; y: number; s?: number; prog: number; bubble?: number; seed?: number}> = ({x, y, s = 1, prog, bubble = 0, seed = 2}) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <RRect x={70} y={-42} w={300 * Math.max(0.02, prog)} h={84} stroke="none" fill={K.blood} fillStyle="solid" seed={seed} sw={0} />
      <RRect x={40} y={-48} w={350} h={96} stroke={K.chalk} sw={4} seed={seed + 1} prog={prog} fill="none" />
      <RLine x1={390} y1={0} x2={520} y2={0} stroke={K.chalk} sw={5} seed={seed + 2} prog={prog} />
      <RLine x1={-70} y1={0} x2={40} y2={0} stroke={K.chalk} sw={7} seed={seed + 3} prog={prog} />
      <RLine x1={-70} y1={-34} x2={-70} y2={34} stroke={K.chalk} sw={7} seed={seed + 4} prog={prog} />
      <RLine x1={40} y1={-66} x2={40} y2={66} stroke={K.chalk} sw={5} seed={seed + 5} prog={prog} />
      {bubble > 0 && [[220, -10, 44], [292, 12, 30], [160, 14, 24]].map(([bx, by, r], i) => (
        <g key={i} opacity={bubble}>
          <circle cx={bx} cy={by + Math.sin(f / 9 + i) * 3} r={(r / 2) * bubble} fill="rgba(255,255,255,.9)" stroke={K.chalk} strokeWidth={2.5} />
          <circle cx={bx - r / 8} cy={by - r / 8 + Math.sin(f / 9 + i) * 3} r={r / 9} fill={K.co2} />
        </g>
      ))}
    </g>
  );
};

const handOpen = (o: number) => {
  // Lòng bàn tay ngửa, ngón hướng sang phải, ngón cái ở trên. Toạ độ gốc: cổ tay tại (0, 0)
  void o;
  return {
    palm: 'M0,-72 C40,-90 110,-96 190,-92 C225,-88 238,-40 238,10 C238,60 222,92 186,96 C110,102 40,92 0,72 Z',
    thumb: 'M56,-82 C86,-122 112,-160 158,-186 C182,-198 202,-176 188,-154 C170,-122 152,-104 138,-86 Z',
    fingers: [
      'M226,-88 C270,-100 340,-104 368,-96 C392,-88 390,-58 366,-54 C320,-48 270,-48 232,-50 Z',
      'M238,-44 C290,-52 372,-54 402,-46 C426,-38 424,-8 400,-4 C350,0 290,0 240,-4 Z',
      'M238,2 C290,-2 362,0 392,8 C416,16 414,46 390,48 C344,52 286,50 238,46 Z',
      'M232,50 C276,50 326,54 350,62 C372,70 370,96 348,98 C310,102 262,100 222,92 Z',
    ],
  };
};
const OpenHand: React.FC<{x: number; y: number; s?: number; fill?: string; prog?: number}> = ({x, y, s = 1, fill = K.skin, prog = 1}) => {
  const H = handOpen(1);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {[H.thumb, ...H.fingers].map((d, i) => <RPath key={i} d={d} stroke={K.skinD} sw={3 / s} fill={fill} fillStyle="solid" seed={11 + i} prog={prog} fillA={prog} rough={0.7} />)}
      <RPath d={H.palm} stroke={K.skinD} sw={3 / s} fill={fill} fillStyle="solid" seed={9} prog={prog} fillA={prog} rough={0.7} />
    </g>
  );
};
const Fist: React.FC<{x: number; y: number; s?: number; fill?: string; prog?: number}> = ({x, y, s = 1, fill = '#E8D9CC', prog = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <RPath d="M0,-70 C60,-96 150,-98 210,-76 C248,-58 252,58 214,78 C150,102 60,96 0,70 Z" stroke={K.skinD} sw={3 / s} fill={fill} fillStyle="solid" seed={21} prog={prog} fillA={prog} rough={0.7} />
    {[-44, -6, 32].map((yy, i) => <RPath key={i} d={`M116,${yy} C160,${yy - 8} 208,${yy - 4} 226,${yy + 6}`} stroke={K.skinD} sw={3 / s} seed={23 + i} prog={prog} rough={0.5} />)}
    <RPath d="M30,-34 C70,-52 120,-48 150,-30 C160,-20 148,-8 134,-12 C100,-22 64,-20 36,-10 Z" stroke={K.skinD} sw={3 / s} fill={fill} fillStyle="solid" seed={27} prog={prog} fillA={prog} rough={0.5} />
  </g>
);

const Lungs: React.FC<{x: number; y: number; s?: number; prog: number}> = ({x, y, s = 1, prog}) => {
  const f = useCurrentFrame();
  const br = 1 + Math.sin(f / 18) * 0.03 * prog;
  return (
    <g transform={`translate(${x},${y}) scale(${s * br})`}>
      <RPath d="M-12,-40 C-40,-40 -74,-10 -80,40 C-84,70 -46,74 -22,58 C-12,50 -10,10 -12,-40 Z" stroke={K.ink} sw={3} fill="#EE9F9A" fillStyle="hachure" hachureGap={7} seed={31} prog={prog} fillA={prog} />
      <RPath d="M12,-40 C40,-40 74,-10 80,40 C84,70 46,74 22,58 C12,50 10,10 12,-40 Z" stroke={K.ink} sw={3} fill="#EE9F9A" fillStyle="hachure" hachureGap={7} seed={32} prog={prog} fillA={prog} />
      <RPath d="M0,-78 L0,-34 M0,-34 L-22,-14 M0,-34 L22,-14" stroke={K.ink} sw={4} seed={33} prog={prog} />
    </g>
  );
};
const Drop: React.FC<{x: number; y: number; s?: number; prog: number; fill?: string}> = ({x, y, s = 1, prog, fill = K.o2}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <RPath d="M0,-68 C22,-34 52,-6 52,24 C52,54 28,72 0,72 C-28,72 -52,54 -52,24 C-52,-6 -22,-34 0,-68 Z" stroke={K.ink} sw={3} fill={fill} fillStyle="solid" seed={35} prog={prog} fillA={prog} />
  </g>
);
const Scale: React.FC<{x: number; y: number; prog: number}> = ({x, y, prog}) => {
  const f = useCurrentFrame();
  const a = Math.sin(f / 22) * 8 * prog;
  return (
    <g transform={`translate(${x},${y})`}>
      <RLine x1={0} y1={-56} x2={0} y2={62} stroke={K.ink} sw={5} seed={41} prog={prog} />
      <RLine x1={-42} y1={64} x2={42} y2={64} stroke={K.ink} sw={5} seed={42} prog={prog} />
      <g transform={`rotate(${a} 0 -50)`}>
        <RLine x1={-72} y1={-50} x2={72} y2={-50} stroke={K.ink} sw={5} seed={43} prog={prog} />
        <RPath d="M-100,0 Q-72,28 -44,0 Z M-72,-50 L-100,0 M-72,-50 L-44,0" stroke={K.o2} sw={3.5} seed={44} prog={prog} />
        <RPath d="M44,0 Q72,28 100,0 Z M72,-50 L44,0 M72,-50 L100,0" stroke={K.co2} sw={3.5} seed={45} prog={prog} />
      </g>
    </g>
  );
};
const Hourglass: React.FC<{x: number; y: number; prog: number; sand: number}> = ({x, y, prog, sand}) => (
  <g transform={`translate(${x},${y})`}>
    <RPath d={`M-34,${-54 + 46 * sand} L34,${-54 + 46 * sand} L4,-4 L-4,-4 Z`} stroke="none" fill={K.ph} fillStyle="solid" seed={51} />
    <RPath d={`M${-40 * sand},70 L${40 * sand},70 L${6},${70 - 44 * sand} L${-6},${70 - 44 * sand} Z`} stroke="none" fill={K.ph} fillStyle="solid" seed={52} />
    <RPath d="M-50,-78 L50,-78 M-50,78 L50,78 M-42,-78 C-42,-30 -8,-16 -8,0 C-8,16 -42,30 -42,78 M42,-78 C42,-30 8,-16 8,0 C8,16 42,30 42,78" stroke={K.ink} sw={4} seed={53} prog={prog} />
  </g>
);

// ---------- Cảnh 1 ----------
const Slip: React.FC<{x: number; y: number; name: string; s0: number; o2: number; co2: number; alert?: number; c: string}> = ({x, y, name, s0, o2, co2, alert = 0, c}) => {
  const t = useSec();
  const a = ap(t, s0 + 0.25);
  const f = useCurrentFrame();
  const shake = alert > 0 && alert < 1 ? Math.sin(f * 1.4) * 3 : 0;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translateX(${shake}px)`}}>
      <Svg>
        <Paper x={x} y={y} w={500} h={510} s0={s0} seed={c === K.co2 ? 6 : 8} />
        <RLine x1={x + 28} y1={y + 94} x2={x + 472} y2={y + 94} stroke={K.ink} sw={2.5} seed={5} prog={a} />
        {alert > 0 && <REllipse cx={x + 300} cy={y + 180} w={260} h={112} stroke={K.o2} sw={5} seed={7} prog={alert} />}
        {alert > 0 && <REllipse cx={x + 300} cy={y + 320} w={260} h={112} stroke={K.o2} sw={5} seed={9} prog={alert} />}
      </Svg>
      <Tx x={x + 30} y={y + 22} size={50} c={c} a={a}>{name}</Tx>
      <Tx x={x + 30} y={y + 142} size={44} c={K.muted} a={a}>PaO₂</Tx>
      <Tx x={x + 200} y={y + 122} w={200} al="center" size={84} c={alert > 0 ? K.o2 : K.ink} a={a}>{String(Math.round(o2))}</Tx>
      <Tx x={x + 30} y={y + 282} size={44} c={K.muted} a={a}>PaCO₂</Tx>
      <Tx x={x + 200} y={y + 262} w={200} al="center" size={84} c={alert > 0 ? K.o2 : K.ink} a={a}>{String(Math.round(co2))}</Tx>
      <Tx x={x + 30} y={y + 432} size={30} c={K.muted} a={a}>mmHg · số minh hoạ</Tx>
    </div>
  );
};
const Person: React.FC<{x: number; y: number; prog: number}> = ({x, y, prog}) => (
  <g transform={`translate(${x},${y})`}>
    <REllipse cx={0} cy={-34} w={72} h={72} stroke={K.chalk} sw={4} fill="#3A5A63" fillStyle="solid" seed={61} prog={prog} fillA={prog} />
    <RPath d="M-66,66 C-62,16 -34,8 0,8 C34,8 62,16 66,66 Z" stroke={K.chalk} sw={4} fill="#3A5A63" fillStyle="solid" seed={62} prog={prog} fillA={prog} />
  </g>
);
const Sc1: React.FC<{S: number[]}> = ({S}) => {
  const t = useSec();
  const ch = ap(t, S[1] + 0.8, 0.9);
  return (
    <>
      <Top idx={0} title="Một bệnh nhân, hai kết quả" />
      <Slip x={90} y={200} name="MẪU A" s0={0.5} o2={72} co2={40} c={K.co2} />
      <Slip x={1330} y={200} name="MẪU B" s0={0.9} o2={interpolate(ch, [0, 1], [72, 95])} co2={interpolate(ch, [0, 1], [40, 34])} alert={ap(t, S[1] + 1.5, 0.7)} c={K.hco3} />
      <Svg>
        <Person x={960} y={270} prog={dp(t, 0.2, 0.8)} />
        <RArrow x1={868} y1={270} x2={610} y2={315} stroke={K.chalk} sw={4} curve={-0.1} seed={3} prog={dp(t, S[0] + 1, 0.8)} />
        <RArrow x1={1052} y1={270} x2={1310} y2={315} stroke={K.chalk} sw={4} curve={0.1} seed={4} prog={dp(t, S[0] + 1.3, 0.8)} />
        <Syringe x={740} y={560} s={0.86} prog={dp(t, S[1], 0.9)} bubble={ap(t, S[1] + 0.7, 0.6)} />
        <RArrow x1={1040} y1={600} x2={1312} y2={560} stroke={K.ph} sw={5} curve={0.08} seed={8} prog={dp(t, S[1] + 1, 0.7)} />
      </Svg>
      <Tx x={700} y={650} w={520} al="center" size={36} c={K.ph} a={ap(t, S[1] + 0.9)}>Chỉ vài bọt khí trong ống tiêm</Tx>
      <Memo x={660} y={750} w={600} s0={S[2] + 0.4} size={46}>Mẫu sai thì đọc giỏi cũng sai</Memo>
    </>
  );
};

// ---------- Cảnh 2 ----------
const Q: React.FC<{y: number; s0: number; n: string; text: string; c: string; children: (p: number) => React.ReactNode}> = ({y, s0, n, text, c, children}) => {
  const t = useSec();
  const a = ap(t, s0);
  return (
    <>
      <Svg>
        <RRect x={1000} y={y} w={830} h={200} seed={70 + y % 7} stroke={c} sw={4} fill={K.paper} fillStyle="solid" prog={dp(t, s0, 0.6)} fillA={ap(t, s0, 0.35)} />
        {children(dp(t, s0 + 0.15, 0.8))}
      </Svg>
      <Tx x={1240} y={y + 28} size={32} c={c} a={a}>{n}</Tx>
      <Tx x={1240} y={y + 70} w={570} size={46} a={a}>{text}</Tx>
    </>
  );
};
const Row: React.FC<{y: number; label: string; meaning: string; c: string; s0: number}> = ({y, label, meaning, c, s0}) => {
  const t = useSec();
  const a = ap(t, s0);
  return (
    <>
      <Svg><RRect x={130} y={y} w={540} h={94} seed={80 + y % 9} stroke={c} sw={3.5} fill={c} fillStyle="hachure" hachureGap={10} prog={a} fillA={a * 0.32} /></Svg>
      <Tx x={156} y={y + 16} size={58} c={K.ink} a={a}>{label}</Tx>
      <Tx x={380} y={y + 28} w={275} al="right" size={34} c={K.muted} a={a}>{meaning}</Tx>
    </>
  );
};
const Sc2: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const r = S[4];
  const gap = D[4] / 4;
  return (
    <>
      <Top idx={1} title="Khí máu cho biết gì?" />
      <Svg><Paper x={90} y={170} w={620} h={560} s0={0.3} seed={3} /></Svg>
      <Tx x={130} y={188} size={44} a={ap(t, 0.6)}>PHIẾU KHÍ MÁU</Tx>
      <Row y={262} label="pH" meaning="toan hay kiềm" c={K.ph} s0={r} />
      <Row y={372} label="PaCO₂" meaning="thông khí" c={K.co2} s0={r + gap} />
      <Row y={482} label="HCO₃⁻" meaning="chuyển hoá" c={K.hco3} s0={r + 2 * gap} />
      <Row y={592} label="PaO₂" meaning="oxy hoá" c={K.o2} s0={r + 3 * gap} />
      <Q y={160} s0={S[1]} n="CÂU 1 · Ô XY" text="Máu có đủ O₂ không?" c={K.o2}>{(p) => <Drop x={1120} y={258} prog={p} />}</Q>
      <Q y={380} s0={S[2]} n="CÂU 2 · THÔNG KHÍ" text="Phổi có thải CO₂ phù hợp không?" c={K.co2}>{(p) => <Lungs x={1120} y={480} prog={p} />}</Q>
      <Q y={600} s0={S[3]} n="CÂU 3 · TOAN KIỀM" text="Cơ thể đang toan hay kiềm?" c={K.hco3}>{(p) => <Scale x={1120} y={700} prog={p} />}</Q>
      <Svg>
        <RArrow x1={690} y1={639} x2={990} y2={270} stroke={K.o2} sw={4} curve={0.1} seed={91} prog={dp(t, r + 3 * gap + 0.2, 0.7)} />
        <RArrow x1={690} y1={419} x2={990} y2={480} stroke={K.co2} sw={4} curve={-0.06} seed={92} prog={dp(t, r + gap + 0.2, 0.7)} />
        <RArrow x1={690} y1={309} x2={990} y2={680} stroke={K.ph} sw={4} curve={-0.12} seed={93} prog={dp(t, r + 0.2, 0.7)} />
      </Svg>
      <Memo x={150} y={762} w={500} s0={S[4] + D[4] * 0.8} size={38}>Ô XY · THÔNG KHÍ · TOAN KIỀM</Memo>
    </>
  );
};

// ---------- Cảnh 3 ----------
const Sc3: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const f = useCurrentFrame();
  const pulse = 1 + 0.5 * Math.max(0, Math.sin(f / 5));
  const armP = dp(t, 0.2, 1);
  const artery = dp(t, S[0] + 0.5, 0.9);
  const press = ap(t, S[2], 0.5);
  const clock = interpolate(t, [S[2] + 0.4, S[2] + D[2] * 0.75], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const px = 590, py = 396;
  return (
    <>
      <Top idx={2} title="Lấy máu động mạch" />
      <Svg>
        {/* cẳng tay + bàn tay */}
        <RPath d="M60,340 C200,352 400,362 575,380 L575,520 C400,540 200,552 60,566 Z" stroke={K.skinD} sw={4} fill={K.skin} fillStyle="solid" seed={101} prog={armP} fillA={armP} rough={0.7} />
        <OpenHand x={575} y={450} s={1} prog={armP} />
        <RPath d="M575,380 C580,420 580,480 575,520" stroke={K.skin} sw={8} seed={102} prog={armP} rough={0.2} />
        <RPath d="M575,388 C568,430 568,470 575,512" stroke={K.skinD} sw={2.5} seed={103} prog={armP} />
        {/* động mạch quay */}
        <RPath d={`M90,372 C240,380 420,386 ${px + 40},${py + 4}`} stroke={K.o2} sw={9} seed={104} prog={artery} rough={0.5} />
        {artery >= 1 && press < 1 && (
          <g opacity={1 - press}>
            <circle cx={px} cy={py} r={13 * pulse} fill="none" stroke={K.o2} strokeWidth={3} opacity={1.5 - pulse} />
            <circle cx={px} cy={py} r={8} fill={K.o2} />
          </g>
        )}
        <RArrow x1={360} y1={240} x2={px - 14} y2={py - 18} stroke={K.ph} sw={4} curve={0.14} seed={105} prog={dp(t, S[0] + 0.9, 0.7)} />
        {/* ngón tay đè */}
        {press > 0 && (
          <g opacity={press} transform={`translate(${px},${py - 140 + 60 * press})`}>
            <RPath d="M-30,-90 C-34,-40 -34,20 -24,48 C-14,70 14,70 24,48 C34,20 34,-40 30,-90 Z" stroke="#7E5137" sw={3.5} fill="#E3AE89" fillStyle="solid" seed={106} rough={0.6} />
            <RPath d="M-15,40 C-10,56 10,56 15,40 C10,30 -10,30 -15,40 Z" stroke="#7E5137" sw={2.5} fill="#F8E4D6" fillStyle="solid" seed={107} rough={0.4} />
          </g>
        )}
        {/* khung Allen */}
        <RRect x={1110} y={160} w={730} h={330} seed={108} stroke={K.green} sw={4} fill={K.paper} fillStyle="solid" prog={dp(t, S[1], 0.6)} fillA={ap(t, S[1], 0.35)} />
        <Fist x={1160} y={325} s={0.62} prog={dp(t, S[1] + 0.3, 0.7)} />
        <RArrow x1={1346} y1={325} x2={1450} y2={325} stroke={K.ink} sw={4} seed={109} prog={dp(t, S[1] + 1.1, 0.5)} />
        <OpenHand x={1480} y={325} s={0.62} fill="#F4AE9B" prog={dp(t, S[1] + 1.3, 0.7)} />
        {/* đồng hồ */}
        <RRect x={1110} y={520} w={730} h={300} seed={110} stroke={K.ph} sw={4} fill={K.paper} fillStyle="solid" prog={dp(t, S[2], 0.6)} fillA={ap(t, S[2], 0.35)} />
        <REllipse cx={1250} cy={668} w={208} h={208} stroke={K.ink} sw={4} seed={111} prog={dp(t, S[2] + 0.2, 0.6)} fill="#FFF" fillStyle="solid" fillA={ap(t, S[2], 0.4)} />
        {clock > 0 && (
          <path d={`M1250,668 L1250,576 A92,92 0 ${clock > 0.5 ? 1 : 0} 1 ${1250 + 92 * Math.sin(clock * Math.PI * 2 * 0.999)},${668 - 92 * Math.cos(clock * Math.PI * 2 * 0.999)} Z`} fill={K.ph} opacity={0.75} />
        )}
        <line x1={1250} y1={668} x2={1250 + 76 * Math.sin(clock * 6.28)} y2={668 - 76 * Math.cos(clock * 6.28)} stroke={K.ink} strokeWidth={5} strokeLinecap="round" opacity={ap(t, S[2] + 0.2)} />
      </Svg>
      <Tx x={150} y={190} size={44} c={K.ph} a={ap(t, S[0] + 0.9)}>Động mạch quay</Tx>
      <Tx x={1135} y={176} size={42} a={ap(t, S[1] + 0.2)}>Nghiệm pháp Allen</Tx>
      <Tx x={1150} y={420} w={230} al="center" size={32} c={K.muted} a={ap(t, S[1] + 0.8)}>nắm chặt</Tx>
      <Tx x={1470} y={420} w={330} al="center" size={32} c={K.muted} a={ap(t, S[1] + 1.8)}>xoè ra, xem hồng lại</Tx>
      <Tx x={1385} y={560} w={430} size={60} a={ap(t, S[2] + 0.4)}>≥ 2 phút</Tx>
      <Tx x={1385} y={640} w={430} size={36} c={K.muted} lh={1.1} a={ap(t, S[2] + D[2] * 0.5)}>Lâu hơn nếu dùng thuốc chống đông, kháng tiểu cầu</Tx>
      <Memo x={250} y={700} w={560} s0={S[2] + D[2] * 0.7} size={46}>Rút kim xong, đè đủ lâu</Memo>
    </>
  );
};

// ---------- Cảnh 4 ----------
const Flip: React.FC<{x: number; s0: number; c: string; n: string; title: string; children: React.ReactNode}> = ({x, s0, c, n, title, children}) => {
  const p = usePop(s0, 15);
  if (p <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: x, top: 165, width: 560, height: 540, perspective: 1400}}>
      <div style={{position: 'absolute', inset: 0, background: K.paper, borderRadius: 14, border: `5px solid ${c}`, boxShadow: '0 14px 30px rgba(0,0,0,.4)', transform: `rotateY(${(1 - p) * 90}deg)`, transformOrigin: 'left center', opacity: Math.min(1, p * 1.6)}}>
        <div style={{position: 'absolute', left: 22, top: 12, fontFamily: HAND, fontSize: 34, color: c}}>{n}</div>
        <div style={{position: 'absolute', left: 22, top: 48, fontFamily: HAND, fontSize: 58, color: K.ink}}>{title}</div>
        {children}
      </div>
    </div>
  );
};
const Vert: React.FC<{dir: 'up' | 'down'; x: number; y: number; c: string; prog: number}> = ({dir, x, y, c, prog}) => (
  <RArrow x1={x} y1={dir === 'up' ? y + 52 : y} x2={x} y2={dir === 'up' ? y : y + 52} stroke={c} sw={6} seed={dir === 'up' ? 121 : 122} head={22} prog={prog} />
);
const Sc4: React.FC<{S: number[]; D: number[]}> = ({S, D}) => {
  const t = useSec();
  const inner = (w: React.ReactNode) => <svg viewBox="0 0 560 540" style={{position: 'absolute', inset: 0, width: 560, height: 540}}>{w}</svg>;
  return (
    <>
      <Top idx={3} title="Ba kẻ phá mẫu" />
      <Flip x={80} s0={S[0]} c={K.co2} n="KẺ THỨ NHẤT" title="Bọt khí">
        {inner(
          <>
            <rect x={70} y={150} width={420} height={136} rx={10} fill="#2A3A40" />
            <g><Syringe x={90} y={218} s={0.82} prog={dp(t, S[0] + 0.3, 0.7)} bubble={ap(t, S[0] + 0.7)} seed={124} /></g>
            <Vert dir="down" x={190} y={348} c={K.co2} prog={dp(t, S[0] + D[0] * 0.6, 0.5)} />
            <Vert dir="up" x={400} y={348} c={K.o2} prog={dp(t, S[0] + D[0] * 0.75, 0.5)} />
          </>
        )}
        <Tx x={100} y={408} w={190} al="center" size={44} a={ap(t, S[0] + D[0] * 0.6)}>CO₂ giảm</Tx>
        <Tx x={310} y={408} w={190} al="center" size={44} a={ap(t, S[0] + D[0] * 0.75)}>O₂ tăng giả</Tx>
        <Tx x={40} y={470} w={480} al="center" size={30} c={K.muted} a={ap(t, S[0] + D[0] * 0.8)}>Trao đổi khí với máu</Tx>
      </Flip>
      <Flip x={680} s0={S[1]} c={K.green} n="KẺ THỨ HAI" title="Heparin thừa">
        {inner(
          <>
            <rect x={70} y={150} width={420} height={136} rx={10} fill="#2A3A40" />
            <Syringe x={90} y={218} s={0.82} prog={dp(t, S[1] + 0.3, 0.7)} seed={130} />
            <Drop x={500} y={330} s={0.42 + 0.1 * Math.sin(t * 3)} prog={dp(t, S[1] + D[1] * 0.45, 0.4)} fill={K.green} />
            <RArrow x1={200} y1={330} x2={420} y2={330} stroke={K.green} sw={6} seed={131} prog={dp(t, S[1] + D[1] * 0.45, 0.6)} />
          </>
        )}
        <Tx x={40} y={390} w={480} al="center" size={44} a={ap(t, S[1] + D[1] * 0.5)}>Đẩy bớt khỏi ống tiêm</Tx>
        <Tx x={40} y={450} w={480} al="center" size={30} c={K.muted} a={ap(t, S[1] + D[1] * 0.6)}>heparin lỏng và bọt khí</Tx>
      </Flip>
      <Flip x={1280} s0={S[2]} c={K.hco3} n="KẺ THỨ BA" title="Thời gian">
        {inner(
          <>
            <Hourglass x={280} y={245} prog={dp(t, S[2] + 0.3, 0.7)} sand={interpolate(t, [S[2] + 0.6, S[2] + D[2]], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
          </>
        )}
        <Tx x={40} y={350} w={480} al="center" size={44} a={ap(t, S[2] + D[2] * 0.3)}>Tế bào vẫn chuyển hoá</Tx>
        <Tx x={40} y={415} w={480} al="center" size={34} c={K.muted} lh={1.1} a={ap(t, S[2] + D[2] * 0.55)}>Để lâu: không còn phản ánh đúng bệnh nhân</Tx>
      </Flip>
      <Memo x={530} y={745} w={860} s0={S[2] + D[2] * 0.7} rot={-1} size={56}>BỌT · HEPARIN · THỜI GIAN</Memo>
    </>
  );
};

const SC: React.FC<{S: number[]; D: number[]}>[] = [Sc1, Sc2, Sc3, Sc4];

export const Abg0: React.FC = () => (
  <AbsoluteFill style={{background: K.board}}>
    <Audio src={staticFile('narration.m4a')} />
    <Board />
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
