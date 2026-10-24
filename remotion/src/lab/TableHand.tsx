// Bảng định khu trên giấy ECG hồng + lớp vẽ tay (rough.js): kẻ bảng, gạch chân, ✓, mũi tên, tim có động mạch vành, ghi chú bên lề
import React from 'react';
import {AbsoluteFill, interpolate, Easing} from 'remotion';
import {FONT, useT, CapCtx} from '../lib';
import {MONO} from './Lab';
import {LAYOUT} from './ecg';
import {HAND, RLine, RPath, RArrow} from '../wb/wb';
import {Heart6 as Heart2, Zone6 as Zone2, Hot6 as Hot2} from '../wb/heart6';

const P = {paper: '#FFF6F2', minor: '#F6C9C1', major: '#EC9A8E', ink: '#1E1E24', ink2: '#5B4A47', pen: '#C81E3A', pencil: '#3B3B48'};
const ap = (t: number, s: number, d = 0.6) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.33, 1, 0.68, 1)});
const dp = (t: number, s: number, d = 0.8) => interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});

type Row = {zone: string; leads: string; art: string; mirror: string; c: string; hl: string; map: string[]; hz: Zone2; hot: Hot2; note: string};
const ROWS: Row[] = [
  {zone: 'Thành dưới', leads: 'II · III · aVF', art: 'RCA (~80%) · LCx', mirror: 'I · aVL', c: '#E11D48', hl: 'rgba(251,113,133,0.34)', map: ['II', 'III', 'aVF'], hz: 'inf', hot: 'rca', note: 'III > II → nghĩ RCA'},
  {zone: 'Thành trước', leads: 'V1 – V4', art: 'LAD', mirror: 'II · III · aVF', c: '#2563EB', hl: 'rgba(96,165,250,0.34)', map: ['V1', 'V2', 'V3', 'V4'], hz: 'ant', hot: 'lad', note: 'LAD = “widow maker”'},
  {zone: 'Thành bên', leads: 'I · aVL · V5–V6', art: 'LCx · nhánh chéo', mirror: 'II · III · aVF', c: '#16A34A', hl: 'rgba(74,222,128,0.34)', map: ['I', 'aVL', 'V5', 'V6'], hz: 'lat', hot: 'lcx', note: 'aVL nhỏ — đừng bỏ sót!'},
  {zone: 'Thành sau', leads: 'V7 – V9', art: 'RCA · LCx', mirror: 'V1 – V3 (ST↓)', c: '#9333EA', hl: 'rgba(192,132,252,0.34)', map: ['V1', 'V2', 'V3'], hz: 'post', hot: 'lcx', note: 'lật gương V1–V3 ↕'},
  {zone: 'Thất phải', leads: 'V4R · (V1)', art: 'RCA đoạn gần', mirror: '—', c: '#D97706', hl: 'rgba(251,191,36,0.40)', map: ['V1'], hz: 'rv', hot: 'rcaP', note: 'nhớ gắn V4R! tránh nitrate'},
];
const COLS = [{h: 'VÙNG', w: 250}, {h: 'ST CHÊNH LÊN', w: 330}, {h: 'ĐỘNG MẠCH', w: 300}, {h: 'SOI GƯƠNG', w: 300}];
const X0 = 70, Y0 = 110, W0 = 1260, H0 = 820, MM = 8;
const TX = 40, TY = 160, RH = 112;
const colX = COLS.reduce<number[]>((a, _c, i) => (a.push(i ? a[i - 1] + COLS[i - 1].w : TX), a), []);
const rowStart = (i: number) => 2.2 + i * 2.6;

export const TableHand: React.FC = () => {
  const t = useT();
  const grid: React.ReactNode[] = [];
  for (let i = 0; i <= W0 / MM; i++) grid.push(<line key={'v' + i} x1={i * MM} x2={i * MM} y1={0} y2={H0} stroke={i % 5 ? P.minor : P.major} strokeWidth={i % 5 ? 0.7 : 1.4} />);
  for (let j = 0; j <= H0 / MM; j++) grid.push(<line key={'h' + j} x1={0} x2={W0} y1={j * MM} y2={j * MM} stroke={j % 5 ? P.minor : P.major} strokeWidth={j % 5 ? 0.7 : 1.4} />);
  const slide = 1 - ap(t, 0, 0.9);
  const cur = Math.max(-1, Math.min(4, Math.floor((t - rowStart(0)) / 2.6)));
  const row = cur >= 0 ? ROWS[cur] : null;
  const rowY = (i: number) => TY + 30 + i * RH;
  const local = t - (cur >= 0 ? rowStart(cur) : 0);
  // vị trí khung tim
  const HX = 1395, HY = 110, HW = 480, HH = 820;
  const showCap = React.useContext(CapCtx);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 40% 35%, #3a4a52, #1d272c 75%)'}}>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(95deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 9px)'}} />

      {/* ===== tờ giấy hồng có bảng ===== */}
      <div style={{position: 'absolute', left: X0, top: Y0, width: W0, height: H0, transform: `translateY(${slide * 1000}px) rotate(-0.6deg)`, boxShadow: '0 30px 60px rgba(0,0,0,0.45)'}}>
        <svg viewBox={`0 0 ${W0} ${H0}`} width={W0} height={H0} style={{position: 'absolute', inset: 0}}>
          <rect width={W0} height={H0} fill={P.paper} />
          {grid}
          {/* dạ quang hàng đang giảng (và giữ nhạt các hàng đã qua) */}
          {ROWS.map((r, i) => {
            const k = dp(t, rowStart(i) + 0.1, 0.55);
            if (k <= 0) return null;
            const dim = i < cur ? 0.55 : 1;
            return <RPath key={'hl' + i} d={`M${TX + 6},${rowY(i) + RH / 2} L${TX + (W0 - 2 * TX - 12) * k},${rowY(i) + RH / 2 - 3}`} stroke={r.hl} sw={RH - 30} rough={1.4} bow={2} seed={70 + i} prog={1} />;
          }).map((el, i) => el && <g key={i} opacity={i < cur ? 0.55 : 1} style={{mixBlendMode: 'multiply'}}>{el}</g>)}
          {/* gạch chân tiêu đề */}
          <RPath d={`M${TX},92 C${TX + 200},84 ${TX + 520},98 ${TX + 790},88`} stroke={P.pen} sw={4} rough={1.6} seed={3} prog={dp(t, 0.9, 0.9)} />
          {/* kẻ bảng vẽ tay */}
          <RLine x1={TX} y1={TY + 30} x2={W0 - TX} y2={TY + 28} stroke={P.ink} sw={3} rough={1.2} seed={5} prog={dp(t, 1.4, 0.7)} />
          {ROWS.map((_, i) => (
            <RLine key={'r' + i} x1={TX} y1={rowY(i + 1)} x2={W0 - TX} y2={rowY(i + 1) + (i % 2 ? 2 : -2)} stroke={P.pencil} sw={1.6} rough={1.6} seed={11 + i} prog={dp(t, rowStart(i) + 1.2, 0.6)} />
          ))}
          {[1, 2, 3].map((j) => (
            <RLine key={'c' + j} x1={colX[j] - 14} y1={TY - 8} x2={colX[j] - 12} y2={rowY(5) - 6} stroke={P.pencil} sw={1.4} rough={1.5} seed={20 + j} prog={dp(t, 1.6 + j * 0.15, 0.8)} />
          ))}
          {/* dấu ✓ bút đỏ cho hàng đã xong */}
          {ROWS.map((_, i) => {
            const k = dp(t, rowStart(i) + 2.2, 0.35);
            if (k <= 0) return null;
            const x = 8, y = rowY(i) + RH / 2 + 4;
            return <RPath key={'ck' + i} d={`M${x},${y} L${x + 9},${y + 12} L${x + 26},${y - 16}`} stroke={P.pen} sw={4} rough={0.9} seed={40 + i} prog={k} />;
          })}
          {/* khoanh soi gương thành sau */}
          {(() => {
            const k = dp(t, rowStart(3) + 1.2, 0.8);
            const cx = colX[3] + 130, cy = rowY(3) + RH / 2;
            return k > 0 ? <RPath d={`M${cx + 140},${cy - 8} C${cx + 150},${cy - 52} ${cx - 140},${cy - 56} ${cx - 150},${cy - 6} C${cx - 156},${cy + 44} ${cx + 150},${cy + 50} ${cx + 148},${cy + 2} L${cx + 120},${cy - 30}`} stroke={P.pen} sw={3.5} rough={1.3} seed={55} prog={k} /> : null;
          })()}
          {/* gạch chéo ô "—" thất phải */}
          <RLine x1={colX[3] + 30} y1={rowY(4) + 30} x2={colX[3] + 120} y2={rowY(4) + RH - 30} stroke={P.pencil} sw={2} rough={1.4} seed={60} prog={dp(t, rowStart(4) + 1, 0.4)} />
        </svg>
        <div style={{position: 'absolute', left: TX, top: 32, fontFamily: FONT, fontSize: 46, fontWeight: 800, color: P.ink, opacity: ap(t, 0.6), letterSpacing: 0.5}}>ĐỊNH KHU NHỒI MÁU CƠ TIM CẤP</div>
        <div style={{position: 'absolute', left: TX + 820, top: 30, fontFamily: HAND, fontSize: 34, color: P.pen, opacity: ap(t, 1.6), transform: 'rotate(-4deg)'}}>học thuộc!</div>
        <div style={{position: 'absolute', left: TX + 2, top: 108, fontFamily: HAND, fontSize: 30, color: P.ink2, opacity: ap(t, 1.2)}}>ST chênh lên ≥ 1 mm ở ≥ 2 chuyển đạo liên tiếp</div>
        {COLS.map((c, j) => (
          <div key={j} style={{position: 'absolute', left: colX[j], top: TY - 4, width: c.w, fontFamily: FONT, fontSize: 22, fontWeight: 800, color: P.ink2, letterSpacing: 1.5, opacity: ap(t, 1.4)}}>{c.h}</div>
        ))}
        {ROWS.map((r, i) => {
          const s0 = rowStart(i);
          const cells = [r.zone, r.leads, r.art, r.mirror];
          return cells.map((txt, j) => {
            const a = ap(t, s0 + 0.2 + j * 0.25, 0.45);
            return (
              <div key={i + '-' + j} style={{position: 'absolute', left: colX[j] + (j === 0 ? 16 : 0), top: rowY(i) + 32, width: COLS[j].w - 18, fontFamily: j === 1 ? MONO : FONT, fontSize: j === 0 ? 34 : j === 1 ? 27 : 26, fontWeight: j === 0 || j === 1 ? 800 : 600, color: j === 0 ? r.c : P.ink, opacity: a, transform: `translateY(${(1 - a) * 8}px)`, whiteSpace: 'nowrap'}}>{txt}</div>
            );
          });
        })}
        <div style={{position: 'absolute', right: 40, bottom: 18, fontFamily: MONO, fontSize: 18, color: '#9b6b64'}}>25 mm/s · 10 mm/mV</div>
      </div>

      {/* ===== khung tim vẽ tay + sơ đồ 12 ô ===== */}
      <div style={{position: 'absolute', left: HX, top: HY, width: HW, height: HH, background: '#FCFAF4', boxShadow: '0 20px 40px rgba(0,0,0,0.45)', transform: `rotate(1.4deg) translateX(${(1 - ap(t, 1.2, 0.8)) * 500}px)`, borderRadius: 3}}>
        <div style={{position: 'absolute', left: 24, top: 14, fontFamily: HAND, fontSize: 38, color: P.ink}}>{row ? row.zone : 'Tim & động mạch vành'}</div>
        <svg viewBox={`0 0 ${HW} ${HH}`} width={HW} height={HH} style={{position: 'absolute', inset: 0}}>
          <Heart2 x={22} y={52} s={0.84} prog={dp(t, 1.4, 1.6)} art={dp(t, 3.0, 1.2)} labelA={ap(t, 3.6)}
            hot={row ? row.hot : null} occl={row ? dp(t, rowStart(cur) + 0.6, 0.5) : 0}
            zone={row ? row.hz : null} zoneC={row ? row.c : '#D7263D'} zoneA={row && row.hz ? ap(t, rowStart(cur) + 0.9, 0.6) : 0} />
          {/* sơ đồ 12 ô vẽ tay */}
          {LAYOUT.map((r, ri) => r.map((ld, ci) => {
            const on = row?.map.includes(ld);
            const x = 34 + ci * 104, y = 562 + ri * 62;
            return (
              <g key={ld}>
                <path d={`M${x},${y} h94 v52 h-94 Z`} fill={on ? row!.hl : 'rgba(255,255,255,0.6)'} stroke="none" />
                <RPath d={`M${x},${y} L${x + 94},${y + 1} L${x + 93},${y + 52} L${x + 1},${y + 51} Z`} stroke={on ? row!.c : '#B9A6A0'} sw={on ? 3 : 1.8} rough={1.1} seed={90 + ri * 4 + ci} prog={dp(t, 1.8 + (ri * 4 + ci) * 0.05, 0.5)} />
                <text x={x + 47} y={y + 36} textAnchor="middle" fontFamily={HAND} fontSize={30} fill={on ? row!.c : P.ink2}>{ld}</text>
              </g>
            );
          }))}
        </svg>
        {row && (
          <div key={cur} style={{position: 'absolute', left: 26, top: 758, width: HW - 50, fontFamily: HAND, fontSize: 34, color: P.pen, opacity: ap(local, 1.1, 0.4), transform: `rotate(-2deg) translateY(${(1 - ap(local, 1.1, 0.4)) * 10}px)`}}>
            ✎ {row.note}
          </div>
        )}
      </div>

      {/* ===== mũi tên vẽ tay từ hàng đang giảng sang tim ===== */}
      {row && (
        <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
          <RArrow key={cur} x1={X0 + W0 - 30} y1={Y0 + rowY(cur) + RH / 2} x2={HX + 60} y2={HY + 320} prog={dp(local, 0.4, 0.6)} stroke={row.c} sw={4} rough={1.2} curve={-0.18} seed={100 + cur} head={22} />
        </svg>
      )}

      {showCap && <div style={{position: 'absolute', left: 0, right: 0, bottom: 22, display: 'flex', justifyContent: 'center'}}>
        <div style={{maxWidth: 1500, padding: '10px 30px', borderRadius: 14, background: 'rgba(20,24,30,0.88)', border: '1px solid rgba(255,255,255,0.15)', fontFamily: FONT, fontSize: 30, fontWeight: 500, color: '#F1F5F9'}}>
          {row ? `${row.zone}: ST chênh lên ở ${row.leads} — thủ phạm ${row.art}.` : 'Bảng định khu nhồi máu cơ tim cấp.'}
        </div>
      </div>}
    </AbsoluteFill>
  );
};
export const TABLEHAND_DUR = Math.round((rowStart(4) + 4) * 30);
