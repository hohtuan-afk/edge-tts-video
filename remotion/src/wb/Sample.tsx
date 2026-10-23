// Bản thử phong cách bảng trắng — 4 cảnh mẫu, mỗi cảnh 5 giây
import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {W, HAND, useT, ap, dp, Title, HText, RArrow, RPath, RRect, EcgPaper, beatPath} from './wb';
import {Heart} from './heart';

const Paper: React.FC = () => (
  <AbsoluteFill style={{background: W.paper}}>
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.9), rgba(240,236,226,0.5))'}} />
  </AbsoluteFill>
);
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>{children}</svg>
);
const Cap: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 36, display: 'flex', justifyContent: 'center'}}>
    <div style={{maxWidth: 1500, padding: '12px 34px', borderRadius: 18, background: 'rgba(255,255,255,0.92)', border: `2px solid ${W.grid}`, fontFamily: HAND, fontSize: 36, color: W.ink, textAlign: 'center', boxShadow: '0 6px 24px rgba(51,73,92,0.12)'}}>{text}</div>
  </div>
);

// 1. Mở đầu
const A: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Title t={t} main="ĐIỆN TÂM ĐỒ NHỒI MÁU CƠ TIM CẤP" sub="Nhận diện STEMI" />
      <Svg>
        <Heart x={250} y={260} s={1.45} prog={dp(t, 0.3, 2)} art={dp(t, 2.1, 1.2)} labels labelA={ap(t, 3)} />
        <RArrow x1={1080} y1={520} x2={830} y2={560} prog={dp(t, 2.6, 0.7)} stroke={W.teal} sw={3} curve={0.08} />
      </Svg>
      <HText x={1100} y={330} t={t} s0={1.2} size={70} c={W.teal} upper ls={2}>Thời gian</HText>
      <HText x={1100} y={410} t={t} s0={1.6} size={70} c={W.teal} upper ls={2}>là cơ tim</HText>
      <Svg><RArrow x1={1300} y1={510} x2={1300} y2={620} prog={dp(t, 2.4, 0.5)} stroke={W.teal} sw={3} /></Svg>
      <HText x={1110} y={650} t={t} s0={2.9} size={46}>ECG trong 10 phút đầu</HText>
      <Cap text="Đọc điện tâm đồ trong mười phút đầu tiên khi bệnh nhân đau ngực." />
    </AbsoluteFill>
  );
};

// 2. ST chênh lên
const B: React.FC = () => {
  const t = useT();
  const nrm = beatPath(170, 520, 14, {});
  const stemi = beatPath(170, 520, 14, {st: 3, t: 4.5});
  const morph = ap(t, 2.4, 0.6);
  return (
    <AbsoluteFill>
      <Title t={t} main="ĐIỆN TÂM ĐỒ NHỒI MÁU CƠ TIM CẤP" sub="ST chênh lên" />
      <Svg>
        <EcgPaper x={120} y={240} w={600} h={400} mm={14 / 1.75} />
        <g opacity={1 - morph * 0.75}><RPath d={nrm} prog={dp(t, 0.4, 1.6)} stroke={W.ink} sw={4} rough={0.5} seed={2} /></g>
        <g opacity={morph}><RPath d={stemi} prog={dp(t, 2.4, 1.4)} stroke={W.red} sw={5} rough={0.5} seed={3} /></g>
        <RArrow x1={1060} y1={360} x2={560} y2={420} prog={dp(t, 3.2, 0.7)} stroke={W.teal} sw={3} curve={-0.1} />
        <RArrow x1={1300} y1={430} x2={1300} y2={520} prog={dp(t, 3.4, 0.5)} stroke={W.teal} sw={3} />
      </Svg>
      {[['P', 245, 455, W.teal], ['Q', 330, 560, W.coral], ['R', 352, 330, W.coral], ['S', 380, 590, W.coral], ['T', 450, 420, W.violet]].map(([l, x, y, c], i) => (
        <div key={i} style={{position: 'absolute', left: x as number, top: y as number, fontFamily: HAND, fontSize: 40, color: c as string, opacity: ap(t, 1.2 + i * 0.2) * (1 - morph)}}>{l}</div>
      ))}
      <HText x={1080} y={300} t={t} s0={2.6} size={68} c={W.teal} upper ls={2}>ST chênh lên</HText>
      <HText x={1080} y={550} t={t} s0={3.6} size={44}>≥ 1 mm ở 2 chuyển đạo liên tiếp</HText>
      <HText x={1080} y={615} t={t} s0={4.1} size={34} c={W.muted}>V2–V3: ≥ 2 mm (nam ≥ 40) · ≥ 1,5 mm (nữ)</HText>
      <Cap text="Điểm J chênh lên ít nhất một mi li mét, ở hai chuyển đạo liền kề." />
    </AbsoluteFill>
  );
};

// 3. Tiến triển
const Cc: React.FC = () => {
  const t = useT();
  const steps: [string, string, Parameters<typeof beatPath>[3], string][] = [
    ['T tối cấp', 'vài phút', {hyper: true, t: 4}, W.violet],
    ['ST chênh lên', 'vài giờ', {st: 3, t: 4.5}, W.red],
    ['Sóng Q', 'giờ – ngày', {st: 1.5, t: 3, q: 4, r: 6}, W.coral],
    ['T đảo', 'ngày – tuần', {tInv: true, t: 3, q: 4, r: 6}, W.blue],
  ];
  return (
    <AbsoluteFill>
      <Title t={t} main="ĐIỆN TÂM ĐỒ NHỒI MÁU CƠ TIM CẤP" sub="Tiến triển theo thời gian" />
      <Svg>
        {steps.map(([, , b, c], i) => {
          const x0 = 110 + i * 450;
          return (
            <g key={i}>
              <EcgPaper x={x0} y={330} w={340} h={260} mm={8} a={ap(t, 0.2 + i * 0.8)} />
              <RPath d={beatPath(x0 + 25, 480, 10, b)} prog={dp(t, 0.4 + i * 0.8, 0.9)} stroke={c} sw={4} rough={0.5} seed={40 + i} />
              {i < 3 && <RArrow x1={x0 + 350} y1={460} x2={x0 + 440} y2={460} prog={dp(t, 1 + i * 0.8, 0.4)} stroke={W.ink} sw={3} />}
            </g>
          );
        })}
      </Svg>
      {steps.map(([n, d, , c], i) => (
        <React.Fragment key={i}>
          <HText x={110 + i * 450 + 170} y={620} t={t} s0={0.6 + i * 0.8} size={44} c={c} align="center" w={400}>{n}</HText>
          <HText x={110 + i * 450 + 170} y={680} t={t} s0={0.8 + i * 0.8} size={32} c={W.muted} align="center" w={400}>{d}</HText>
        </React.Fragment>
      ))}
      <Svg><RRect x={520} y={770} w={880} h={90} prog={dp(t, 3.6, 0.8)} stroke={W.amber} sw={3} seed={50} /></Svg>
      <HText x={960} y={782} t={t} s0={3.9} size={50} c={W.ink} align="center" w={900}>NHỚ: T → ST → Q → T đảo</HText>
      <Cap text="T tối cấp xuất hiện sớm nhất, rồi ST chênh, sóng Q, và cuối cùng T đảo." />
    </AbsoluteFill>
  );
};

// 4. Định khu
const D: React.FC = () => {
  const t = useT();
  const grid = [['I', 'aVR', 'V1', 'V4'], ['II', 'aVL', 'V2', 'V5'], ['III', 'aVF', 'V3', 'V6']];
  const hot = ['II', 'III', 'aVF'], mirror = ['aVL'];
  return (
    <AbsoluteFill>
      <Title t={t} main="ĐIỆN TÂM ĐỒ NHỒI MÁU CƠ TIM CẤP" sub="Định khu: thành dưới" />
      <Svg>
        {grid.map((row, r) => row.map((l, c) => {
          const x = 110 + c * 190, y = 260 + r * 150;
          const isHot = hot.includes(l), isMir = mirror.includes(l);
          const a = ap(t, 0.2 + (r * 4 + c) * 0.08);
          return (
            <g key={l} opacity={a}>
              <RRect x={x} y={y} w={170} h={125} stroke={W.ink} sw={2.4} seed={60 + r * 4 + c}
                fill={isHot ? W.coral : isMir ? W.blue : undefined} fillStyle="hachure" hachureGap={10} fillA={isHot ? ap(t, 1.6) : isMir ? ap(t, 3) : 0} />
            </g>
          );
        }))}
        <Heart x={1050} y={250} s={1.25} prog={1} art={1} hot="rca" occl={ap(t, 1.2, 0.6)} zone="inf" zoneA={ap(t, 1.8, 0.8) * 0.6} />
      </Svg>
      {grid.map((row, r) => row.map((l, c) => (
        <div key={l} style={{position: 'absolute', left: 110 + c * 190, top: 260 + r * 150 + 36, width: 170, textAlign: 'center', fontFamily: HAND, fontSize: 46, color: hot.includes(l) ? W.red : mirror.includes(l) ? W.blue : W.ink, opacity: ap(t, 0.2 + (r * 4 + c) * 0.08)}}>{l}</div>
      )))}
      <HText x={110} y={735} t={t} s0={2.2} size={48} c={W.red}>RCA tắc → THÀNH DƯỚI: II · III · aVF</HText>
      <HText x={110} y={800} t={t} s0={3.2} size={38} c={W.blue}>Soi gương: ST chênh xuống ở aVL</HText>
      <Cap text="Tắc động mạch vành phải gây ST chênh lên ở hai, ba, a-vê-ép." />
    </AbsoluteFill>
  );
};

export const WBSample: React.FC = () => (
  <AbsoluteFill style={{fontFamily: HAND}}>
    <Paper />
    {[A, B, Cc, D].map((Comp, i) => (
      <Sequence key={i} from={i * 150} durationInFrames={150}>
        <Comp />
      </Sequence>
    ))}
  </AbsoluteFill>
);
