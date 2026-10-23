// Bảng tóm tắt in trên giấy ECG hồng: định khu NMCT cấp
import React from 'react';
import {AbsoluteFill, interpolate, Easing} from 'remotion';
import {noise2D} from '@remotion/noise';
import {FONT, useT} from '../lib';
import {MONO} from './Lab';
import {LAYOUT} from './ecg';

const P = {paper: '#FFF6F2', minor: '#F6C9C1', major: '#EC9A8E', ink: '#1E1E24', ink2: '#5B4A47', pen: '#D7263D'};
const ap = (t: number, s: number, d = 0.6) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1)});

const ROWS: {zone: string; leads: string; art: string; mirror: string; c: string; hl: string; map: string[]}[] = [
  {zone: 'Thành dưới', leads: 'II · III · aVF', art: 'RCA (~80%) · LCx', mirror: 'I · aVL', c: '#E11D48', hl: 'rgba(251,113,133,0.38)', map: ['II', 'III', 'aVF']},
  {zone: 'Thành trước', leads: 'V1 – V4', art: 'LAD', mirror: 'II · III · aVF', c: '#2563EB', hl: 'rgba(96,165,250,0.38)', map: ['V1', 'V2', 'V3', 'V4']},
  {zone: 'Thành bên', leads: 'I · aVL · V5 – V6', art: 'LCx · nhánh chéo LAD', mirror: 'II · III · aVF', c: '#16A34A', hl: 'rgba(74,222,128,0.38)', map: ['I', 'aVL', 'V5', 'V6']},
  {zone: 'Thành sau', leads: 'V7 – V9', art: 'RCA · LCx', mirror: 'V1 – V3 (ST↓)', c: '#9333EA', hl: 'rgba(192,132,252,0.38)', map: ['V1', 'V2', 'V3']},
  {zone: 'Thất phải', leads: 'V4R · (V1)', art: 'RCA đoạn gần', mirror: '—', c: '#D97706', hl: 'rgba(251,191,36,0.42)', map: ['V1']},
];
const COLS = [{h: 'VÙNG', w: 270}, {h: 'ST CHÊNH LÊN', w: 300}, {h: 'ĐỘNG MẠCH', w: 330}, {h: 'SOI GƯƠNG', w: 280}];

export const TableScene: React.FC = () => {
  const t = useT();
  const X0 = 80, Y0 = 120, W0 = 1260, H0 = 800, MM = 8;
  const grid: React.ReactNode[] = [];
  for (let i = 0; i <= W0 / MM; i++) grid.push(<line key={'v' + i} x1={i * MM} x2={i * MM} y1={0} y2={H0} stroke={i % 5 ? P.minor : P.major} strokeWidth={i % 5 ? 0.7 : 1.4} />);
  for (let j = 0; j <= H0 / MM; j++) grid.push(<line key={'h' + j} x1={0} x2={W0} y1={j * MM} y2={j * MM} stroke={j % 5 ? P.minor : P.major} strokeWidth={j % 5 ? 0.7 : 1.4} />);
  const slide = 1 - ap(t, 0, 0.9);
  const rowStart = (i: number) => 1.6 + i * 2.2;
  const cur = Math.max(-1, Math.min(4, Math.floor((t - 1.6) / 2.2)));
  const tx = 40, ty = 150, rh = 112;
  const colX = COLS.reduce<number[]>((a, c, i) => (a.push(i ? a[i - 1] + COLS[i - 1].w : tx), a), []);
  // sơ đồ 12 ô
  const MX = 1420, MY = 210, CW = 108, CH = 78;
  const mapRow = cur >= 0 ? ROWS[cur] : null;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 40% 35%, #3a4a52, #1d272c 75%)'}}>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(95deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 9px)'}} />
      <div style={{position: 'absolute', left: X0, top: Y0, width: W0, height: H0, transform: `translateY(${slide * 1000}px) rotate(-0.7deg)`, boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
        <svg viewBox={`0 0 ${W0} ${H0}`} width={W0} height={H0} style={{position: 'absolute', inset: 0}}>
          <rect width={W0} height={H0} fill={P.paper} />
          {grid}
          {/* dạ quang theo hàng */}
          {ROWS.map((r, i) => {
            const k = ap(t, rowStart(i) + 0.15, 0.55);
            const wob = (x: number) => 4 * noise2D('hl' + i, x / 120, 0);
            const y = ty + 30 + i * rh;
            const w = (W0 - 2 * tx) * k;
            const pts = [`${tx},${y + 14 + wob(0)}`, `${tx + w},${y + 10 + wob(w)}`, `${tx + w},${y + rh - 18 + wob(w + 50)}`, `${tx},${y + rh - 14 + wob(50)}`].join(' ');
            return k > 0 ? <polygon key={i} points={pts} fill={r.hl} style={{mixBlendMode: 'multiply'}} /> : null;
          })}
          {/* kẻ bảng */}
          <line x1={tx} x2={W0 - tx} y1={ty + 30} y2={ty + 30} stroke={P.ink} strokeWidth={3} opacity={ap(t, 0.9)} />
          {ROWS.map((_, i) => <line key={i} x1={tx} x2={tx + (W0 - 2 * tx) * ap(t, rowStart(i) + 0.9, 0.5)} y1={ty + 30 + (i + 1) * rh} y2={ty + 30 + (i + 1) * rh} stroke={P.ink2} strokeWidth={1.2} strokeDasharray="6 5" />)}
          {/* vòng bút đỏ: thành sau — soi gương */}
          {(() => {
            const k = ap(t, 13.4, 0.9);
            if (k <= 0) return null;
            const cx = colX[3] + 135, cy = ty + 30 + 3 * rh + rh / 2;
            const pts: string[] = [];
            for (let a = 0; a <= k * Math.PI * 2.1; a += 0.04) pts.push(`${cx + Math.cos(a - 1.3) * (150 + 6 * noise2D('r', a, 0))},${cy + Math.sin(a - 1.3) * (44 + 4 * noise2D('r', 0, a))}`);
            return <polyline points={pts.join(' ')} fill="none" stroke={P.pen} strokeWidth={4.5} strokeLinecap="round" />;
          })()}
        </svg>
        <div style={{position: 'absolute', left: tx, top: 34, fontFamily: FONT, fontSize: 46, fontWeight: 800, color: P.ink, opacity: ap(t, 0.6), letterSpacing: 0.5}}>ĐỊNH KHU NHỒI MÁU CƠ TIM CẤP</div>
        <div style={{position: 'absolute', left: tx + 2, top: 96, fontFamily: MONO, fontSize: 20, color: P.ink2, opacity: ap(t, 0.8)}}>ST chênh lên ≥ 1 mm ở ≥ 2 chuyển đạo liên tiếp</div>
        {COLS.map((c, j) => (
          <div key={j} style={{position: 'absolute', left: colX[j], top: ty - 6, width: c.w, fontFamily: FONT, fontSize: 24, fontWeight: 800, color: P.ink2, letterSpacing: 1.5, opacity: ap(t, 1)}}>{c.h}</div>
        ))}
        {ROWS.map((r, i) => {
          const s0 = rowStart(i);
          const cells = [r.zone, r.leads, r.art, r.mirror];
          const y = ty + 30 + i * rh;
          return cells.map((txt, j) => {
            const a = ap(t, s0 + j * 0.22, 0.45);
            return (
              <div key={i + '-' + j} style={{position: 'absolute', left: colX[j], top: y + 30, width: COLS[j].w - 14, fontFamily: j === 1 ? MONO : FONT, fontSize: j === 0 ? 36 : j === 1 ? 32 : 27, fontWeight: j === 0 || j === 1 ? 800 : 600, color: j === 0 ? r.c : P.ink, opacity: a, transform: `translateY(${(1 - a) * 8}px)`, whiteSpace: 'nowrap'}}>{txt}</div>
            );
          });
        })}
        <div style={{position: 'absolute', right: 40, bottom: 18, fontFamily: MONO, fontSize: 18, color: '#9b6b64'}}>25 mm/s · 10 mm/mV</div>
      </div>
      {/* sơ đồ 12 chuyển đạo bên phải */}
      <div style={{position: 'absolute', left: MX - 30, top: MY - 80, width: 4 * CW + 60, height: 3 * CH + 330, background: P.paper, boxShadow: '0 20px 40px rgba(0,0,0,0.45)', transform: `rotate(1.6deg) translateX(${(1 - ap(t, 1.2, 0.8)) * 400}px)`, borderRadius: 4}}>
        <div style={{position: 'absolute', left: 26, top: 22, fontFamily: FONT, fontSize: 26, fontWeight: 800, color: P.ink}}>Chuyển đạo nào?</div>
        {LAYOUT.map((row, r) => row.map((ld, c) => {
          const on = mapRow?.map.includes(ld);
          const mir = cur === 0 && ['I', 'aVL'].includes(ld);
          return (
            <div key={ld} style={{position: 'absolute', left: 30 + c * CW, top: 80 + r * CH, width: CW - 10, height: CH - 10, borderRadius: 10, border: `2.5px solid ${on ? mapRow!.c : mir ? '#64748B' : '#D6B3AD'}`, background: on ? mapRow!.hl : mir ? 'rgba(100,116,139,0.18)' : 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 28, fontWeight: 700, color: on ? mapRow!.c : P.ink2}}>{ld}</div>
          );
        }))}
        <div style={{position: 'absolute', left: 30, top: 80 + 3 * CH + 10, width: 4 * CW - 10, fontFamily: FONT, fontSize: 24, fontWeight: 700, color: mapRow?.c ?? P.ink2, lineHeight: 1.35}}>
          {mapRow ? <>{mapRow.zone}{cur === 3 ? ' — nhìn V1–V3 thấy ST chênh XUỐNG' : cur === 4 ? ' — gắn V4R bên phải' : ''}</> : ''}
        </div>
        <div style={{position: 'absolute', left: 30, top: 80 + 3 * CH + 130, width: 4 * CW - 10, padding: '12px 16px', background: '#FFE873', transform: 'rotate(-1.5deg)', fontFamily: FONT, fontSize: 24, fontWeight: 800, color: '#26221C', opacity: ap(t, 14.6), boxShadow: '0 8px 18px rgba(0,0,0,0.25)'}}>
          Thất phải: tránh nitrate — dễ tụt huyết áp
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 26, display: 'flex', justifyContent: 'center'}}>
        <div style={{maxWidth: 1500, padding: '10px 30px', borderRadius: 14, background: 'rgba(20,24,30,0.88)', border: '1px solid rgba(255,255,255,0.15)', fontFamily: FONT, fontSize: 30, fontWeight: 500, color: '#F1F5F9'}}>
          Bảng định khu: mỗi vùng — chuyển đạo chênh lên, động mạch thủ phạm, và nơi soi gương.
        </div>
      </div>
    </AbsoluteFill>
  );
};
export const TABLE_DUR = 17 * 30;
