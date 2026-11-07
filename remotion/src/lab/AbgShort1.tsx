// SHORT 9:16 — Giải mã khí máu · 4 điều để mẫu khí máu không sai
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, Easing, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import data from '../data.json';
import {FONT} from '../lib';
import * as A from './abgArt.mjs';

const K = {txt: '#F2F7F9', dim: '#A7BAC4', ink: '#22303A', amber: '#F5B83D', co2: '#38A7DD', hco3: '#F2813D', o2: '#E5484D', green: '#3FB27F', line: 'rgba(190,220,235,.22)'};
const ap = (t: number, s: number, d = 0.45) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1)});
const useSec = () => useCurrentFrame() / 30;
const usePop = (s: number, damping = 12) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - s * fps, fps, config: {damping, stiffness: 150, mass: 0.7}});
};
const chem = (s: string) => {
  const out: React.ReactNode[] = [];
  s.split(/(₂|₃⁻)/).forEach((p, i) => {
    if (p === '₂') out.push(<sub key={i} style={{fontSize: '.6em', lineHeight: 0}}>2</sub>);
    else if (p === '₃⁻') out.push(<span key={i}><sub style={{fontSize: '.6em', lineHeight: 0}}>3</sub><sup style={{fontSize: '.6em', lineHeight: 0}}>−</sup></span>);
    else out.push(p);
  });
  return out;
};
const Art: React.FC<{html: string; vb: string; x: number; y: number; w: number; h: number; style?: React.CSSProperties}> = ({html, vb, x, y, w, h, style}) => (
  <svg viewBox={vb} style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'visible', ...style}} dangerouslySetInnerHTML={{__html: html}} />
);

const Bg: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: 'linear-gradient(170deg,#10262F 0%,#0D1B24 55%,#0A161E 100%)'}}>
      <div style={{position: 'absolute', left: -200 + Math.sin(f / 80) * 60, top: 200, width: 1100, height: 1100, background: 'radial-gradient(closest-side,rgba(60,145,170,.28),transparent)'}} />
      <div style={{position: 'absolute', right: -300, bottom: 200 + Math.cos(f / 90) * 60, width: 1000, height: 1000, background: 'radial-gradient(closest-side,rgba(190,60,80,.16),transparent)'}} />
    </AbsoluteFill>
  );
};

const TopBar: React.FC = () => {
  const f = useCurrentFrame();
  const n = data.scenes.length;
  return (
    <>
      <div style={{position: 'absolute', left: 60, right: 60, top: 70, display: 'flex', gap: 10}}>
        {data.scenes.map((s, i) => {
          const p = Math.min(1, Math.max(0, (f - s.from) / s.dur));
          return <div key={i} style={{flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,.18)', overflow: 'hidden'}}><div style={{width: `${p * 100}%`, height: '100%', background: K.amber}} /></div>;
        })}
      </div>
      <div style={{position: 'absolute', left: 60, top: 98, fontFamily: FONT, fontSize: 32, fontWeight: 800, letterSpacing: 2, color: K.dim}}>GIẢI MÃ KHÍ MÁU · {n >= 0 ? 'BÀI 1' : ''}</div>
    </>
  );
};

const BigCap: React.FC = () => {
  const f = useCurrentFrame();
  const sc = data.scenes.find((s) => f >= s.from && f < s.from + s.dur);
  if (!sc) return null;
  const t = (f - sc.from) / data.fps;
  const s = sc.sents[0];
  const a = Math.min(1, Math.max(0, (t - s.start + 0.1) / 0.25));
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1330, display: 'flex', justifyContent: 'center', opacity: a}}>
      <div style={{padding: '22px 36px', borderRadius: 28, background: 'rgba(6,11,22,.88)', border: '2px solid rgba(160,185,225,.2)', fontFamily: FONT, fontSize: 50, fontWeight: 700, lineHeight: 1.3, color: K.txt, textAlign: 'center', textWrap: 'balance' as any}}>
        {chem(s.text)}
      </div>
    </div>
  );
};

const StepHead: React.FC<{n: string; word: string; sub: string; c: string}> = ({n, word, sub, c}) => {
  const p = usePop(0.05);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 190, display: 'flex', alignItems: 'center', gap: 34, fontFamily: FONT, opacity: Math.min(1, p * 1.4), transform: `translateX(${(1 - p) * -60}px)`}}>
      <div style={{width: 160, height: 160, borderRadius: '50%', background: c, color: '#0D1B24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 100, fontWeight: 800, flex: 'none', boxShadow: `0 0 40px ${c}66`}}>{n}</div>
      <div>
        <div style={{fontSize: 92, fontWeight: 800, color: K.txt, lineHeight: 1}}>{word}</div>
        <div style={{fontSize: 42, fontWeight: 600, color: c, marginTop: 12}}>{chem(sub)}</div>
      </div>
    </div>
  );
};

const Badge: React.FC<{s0: number; c?: string; children: string}> = ({s0, c = K.amber, children}) => {
  const p = usePop(s0, 10);
  if (p <= 0.01) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1130, display: 'flex', justifyContent: 'center'}}>
      <div style={{padding: '14px 44px', borderRadius: 24, background: `linear-gradient(135deg,#FFD46B,${c})`, color: K.ink, fontFamily: FONT, fontSize: 64, fontWeight: 800, boxShadow: '0 16px 40px rgba(0,0,0,.5)', transform: `scale(${p}) rotate(-2deg)`}}>{chem(children)}</div>
    </div>
  );
};

// 0 Hook
const S0: React.FC = () => {
  const t = useSec();
  const f = useCurrentFrame();
  const syr = useMemo(() => A.syringe('h0', {bubbles: 5}), []);
  const p = usePop(0.1);
  const z = 1 + 0.03 * Math.sin(f / 6);
  return (
    <>
      <div style={{position: 'absolute', left: 60, right: 60, top: 200, fontFamily: FONT, textAlign: 'center', opacity: Math.min(1, p * 1.4), transform: `scale(${0.9 + 0.1 * p})`}}>
        <div style={{fontSize: 120, fontWeight: 900, color: K.amber, lineHeight: 1}}>1 BỌT KHÍ</div>
        <div style={{fontSize: 70, fontWeight: 800, color: K.txt, marginTop: 20, lineHeight: 1.15}}>làm sai cả phiếu khí máu?</div>
      </div>
      <Art html={syr} vb="0 0 720 170" x={40} y={620} w={1000} h={236} style={{transform: `scale(${z})`, opacity: ap(t, 0.3)}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 960, display: 'flex', justifyContent: 'center', gap: 30, fontFamily: FONT, opacity: ap(t, 1.2)}}>
        <div style={{padding: '16px 34px', borderRadius: 22, background: 'rgba(229,72,77,.16)', border: `3px solid ${K.o2}`, fontSize: 56, fontWeight: 800, color: K.txt}}>PaO<sub style={{fontSize: '.6em'}}>2</sub> <span style={{color: K.o2}}>95?</span></div>
        <div style={{padding: '16px 34px', borderRadius: 22, background: 'rgba(56,167,221,.16)', border: `3px solid ${K.co2}`, fontSize: 56, fontWeight: 800, color: K.txt}}>PaCO<sub style={{fontSize: '.6em'}}>2</sub> <span style={{color: K.co2}}>34?</span></div>
      </div>
    </>
  );
};

// 1 Lấy đúng
const S1: React.FC = () => {
  const t = useSec();
  const f = useCurrentFrame();
  const skin = useMemo(() => A.handSkin('k1'), []);
  const anat = useMemo(() => A.anatomy('n1'), []);
  const beat = Math.pow(Math.max(0, Math.sin(f / 7.2)), 6);
  const s = 0.92, ox = -20, oy = 470;
  const sx = ox + A.SITE.x * s, sy = oy + A.SITE.y * s;
  return (
    <>
      <StepHead n="1" word="LẤY ĐÚNG" sub="Động mạch quay" c={K.o2} />
      <Art html={skin} vb="0 0 1110 700" x={ox} y={oy} w={1110 * s} h={700 * s} />
      <Art html={anat} vb="0 0 1110 700" x={ox} y={oy} w={1110 * s} h={700 * s} style={{opacity: ap(t, 0.5, 0.8)}} />
      <svg style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920}}>
        <circle cx={sx} cy={sy} r={20 + beat * 14} fill="none" stroke="#FFE27A" strokeWidth={5} opacity={ap(t, 1) * (1 - beat * 0.4)} />
        <circle cx={sx} cy={sy} r={8} fill="#FFE27A" opacity={ap(t, 1)} />
      </svg>
      <div style={{position: 'absolute', left: 120, top: 440, padding: '8px 22px', borderRadius: 14, background: 'rgba(8,18,25,.88)', border: '3px solid #FF8E92', fontFamily: FONT, fontSize: 40, fontWeight: 700, color: K.txt, opacity: ap(t, 0.9)}}>Động mạch quay</div>
      <Badge s0={1.8}>Đè ≥ 2 phút</Badge>
    </>
  );
};

// 2 Bọt khí
const S2: React.FC = () => {
  const t = useSec();
  const syr = useMemo(() => A.syringe('k2', {bubbles: 5}), []);
  return (
    <>
      <StepHead n="2" word="BỌT KHÍ" sub="Đuổi hết trước khi gửi" c={K.co2} />
      <Art html={syr} vb="0 0 720 170" x={40} y={520} w={1000} h={236} style={{opacity: ap(t, 0.2)}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 840, display: 'flex', gap: 30, fontFamily: FONT}}>
        {[{c: K.co2, d: '↓', l: 'CO₂ giảm', s: 1.0}, {c: K.o2, d: '↑', l: 'O₂ tăng giả', s: 1.8}].map((r) => (
          <div key={r.l} style={{flex: 1, height: 170, borderRadius: 26, background: `${r.c}26`, border: `3px solid ${r.c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, opacity: ap(t, r.s), transform: `translateY(${(1 - ap(t, r.s)) * 30}px)`}}>
            <span style={{fontSize: 90, fontWeight: 800, color: r.c}}>{r.d}</span>
            <span style={{fontSize: 52, fontWeight: 800, color: K.txt}}>{chem(r.l)}</span>
          </div>
        ))}
      </div>
    </>
  );
};

// 3 Heparin
const S3: React.FC = () => {
  const t = useSec();
  const syr = useMemo(() => A.syringe('k3', {liquid: 'hep', fill: 0.3}), []);
  const dropT = Math.max(0, t - 0.8);
  return (
    <>
      <StepHead n="3" word="HEPARIN" sub="Đẩy bớt phần thừa" c={K.green} />
      <Art html={syr} vb="0 0 720 170" x={20} y={560} w={960} h={227} style={{opacity: ap(t, 0.2)}} />
      <svg style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920}}>
        {[0, 0.33, 0.66].map((o, i) => {
          const u = (dropT * 0.9 + o) % 1;
          return dropT > 0 ? <ellipse key={i} cx={1000} cy={690 + u * 300} rx={16 - u * 5} ry={20 - u * 6} fill="#FBEFB5" opacity={1 - u} /> : null;
        })}
      </svg>
      <Badge s0={1.4} c="#7FD6A8">Đẩy bớt khỏi ống</Badge>
    </>
  );
};

// 4 Thời gian
const S4: React.FC = () => {
  const t = useSec();
  const sand = interpolate(t, [0.4, 3.2], [0.05, 0.95], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fill = interpolate(t, [0.4, 3.2], [0, 50], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <>
      <StepHead n="4" word="THỜI GIAN" sub="Phân tích càng sớm càng tốt" c={K.hco3} />
      <Art html={A.hourglass('k4', sand)} vb="-80 -120 160 245" x={110} y={520} w={300} h={460} />
      <div style={{position: 'absolute', left: 520, top: 560, width: 380, height: 380, borderRadius: '50%', border: '8px solid #C8D5DC', background: `conic-gradient(${K.amber} 0 ${fill}%, #0C1A22 ${fill}% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: ap(t, 0.3)}}>
        <div style={{width: 200, height: 200, borderRadius: '50%', background: '#0C1A22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontSize: 80, fontWeight: 800, color: K.txt}}>30'</div>
      </div>
      <Badge s0={1.6}>≤ 30 phút</Badge>
    </>
  );
};

// 5 Nhắc lại
const S5: React.FC = () => {
  const items: [string, string][] = [['BỌT KHÍ', K.co2], ['HEPARIN', K.green], ['THỜI GIAN', K.hco3]];
  const p0 = usePop(0.05);
  return (
    <>
      <div style={{position: 'absolute', left: 60, right: 60, top: 220, textAlign: 'center', fontFamily: FONT, fontSize: 80, fontWeight: 800, color: K.txt, opacity: Math.min(1, p0 * 1.4)}}>3 kẻ phá mẫu</div>
      <div style={{position: 'absolute', left: 140, right: 140, top: 420, display: 'flex', flexDirection: 'column', gap: 40}}>
        {items.map(([w, c], i) => <Chip key={w} w={w} c={c} s0={0.4 + i * 0.6} n={i + 1} />)}
      </div>
    </>
  );
};
const Chip: React.FC<{w: string; c: string; s0: number; n: number}> = ({w, c, s0, n}) => {
  const p = usePop(s0, 11);
  return (
    <div style={{height: 180, borderRadius: 30, background: `${c}22`, border: `4px solid ${c}`, display: 'flex', alignItems: 'center', gap: 34, padding: '0 40px', fontFamily: FONT, transform: `scale(${p})`, opacity: Math.min(1, p * 1.5)}}>
      <div style={{width: 110, height: 110, borderRadius: '50%', background: c, color: '#0D1B24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 66, fontWeight: 800}}>{n}</div>
      <div style={{fontSize: 84, fontWeight: 800, color: K.txt}}>{w}</div>
    </div>
  );
};

// 6 CTA
const S6: React.FC = () => {
  const t = useSec();
  const p = usePop(0.1);
  const f = useCurrentFrame();
  return (
    <>
      <div style={{position: 'absolute', left: 60, right: 60, top: 300, textAlign: 'center', fontFamily: FONT, opacity: Math.min(1, p * 1.4), transform: `scale(${0.9 + 0.1 * p})`}}>
        <svg width={200} height={240} viewBox="0 0 200 240" style={{transform: `translateY(${Math.sin(f / 8) * 8}px)`}}><path d="M30,10 L170,10 L170,230 L100,175 L30,230 Z" fill={K.amber} stroke="#7A5608" strokeWidth={6} strokeLinejoin="round" /></svg>
        <div style={{fontSize: 96, fontWeight: 900, color: K.amber, marginTop: 30}}>LƯU LẠI ĐỂ ÔN</div>
        <div style={{fontSize: 56, fontWeight: 700, color: K.txt, marginTop: 30, lineHeight: 1.25, opacity: ap(t, 0.8)}}>Xem bài đầy đủ<br />“Giải mã khí máu · Bài 1”</div>
        <div style={{fontSize: 44, fontWeight: 600, color: K.dim, marginTop: 40, opacity: ap(t, 1.4)}}>Bài 2: Cơ thể giữ pH 7,40 bằng cách nào?</div>
      </div>
    </>
  );
};

const SC = [S0, S1, S2, S3, S4, S5, S6];

export const AbgShort1: React.FC = () => (
  <AbsoluteFill style={{background: '#0D1B24'}}>
    <Audio src={staticFile('narration.m4a')} />
    <Bg />
    {data.scenes.map((s, i) => {
      const C = SC[i];
      if (!C) return null;
      return (
        <Sequence key={i} from={s.from} durationInFrames={s.dur} layout="none">
          <AbsoluteFill><C /></AbsoluteFill>
        </Sequence>
      );
    })}
    <TopBar />
    <BigCap />
  </AbsoluteFill>
);
