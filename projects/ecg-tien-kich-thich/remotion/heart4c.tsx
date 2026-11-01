// Tim mặt cắt 4 buồng (ảnh Canva AI, đã tách nền: public/heart4c.png + heart4c_mask.png, toạ độ ảnh 1264×1264)
// Lớp phủ: vòng xơ nhĩ thất, hệ dẫn truyền, đường phụ trái/phải, chấm xung, vùng thất được tiền kích thích.
import React from 'react';
import {staticFile} from 'remotion';
import {FONT} from '../lib';

export const H4 = {
  SA: [300, 330], AV: [600, 585], HIS: [625, 660],
  RB: [[625, 660], [590, 730], [575, 900], [562, 1060]],
  LB: [[625, 660], [660, 730], [685, 860], [700, 985]],
  RING_R: [[262, 600], [420, 602], [585, 596]],
  RING_L: [[668, 590], [830, 590], [990, 587]],
  APL: [[985, 545], [995, 590], [990, 640]],
  APR: [[268, 555], [258, 600], [266, 648]],
  LVLAT: [1000, 790], RVLAT: [262, 790],
  RA: [430, 450], LA: [840, 460], RV: [430, 850], LV: [820, 840],
};
type Pt = number[];
const path = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
export const along = (pts: Pt[], k: number): [number, number] => {
  const kk = Math.max(0, Math.min(0.9999, k));
  const seg: number[] = [];
  let tot = 0;
  for (let i = 0; i < pts.length - 1; i++) {const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); seg.push(l); tot += l;}
  let d = kk * tot, i = 0;
  while (i < seg.length - 1 && d > seg[i]) {d -= seg[i]; i++;}
  const r = d / seg[i];
  return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * r, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * r];
};

export type Dot = {pts: Pt[]; k: number; c?: string; r?: number};
export const Heart4C: React.FC<{
  x: number; y: number; s: number; id: string; a?: number;
  ring?: number; cond?: number; apL?: number; apR?: number;
  glowL?: number; glowR?: number; glowC?: string; dots?: Dot[]; labels?: number; atrialChaos?: number; t?: number;
}> = ({x, y, s, id, a = 1, ring = 0, cond = 0, apL = 0, apR = 0, glowL = 0, glowR = 0, glowC = '#F97316', dots = [], labels = 0, atrialChaos = 0, t = 0}) => {
  const u = (n: string) => `${id}-${n}`;
  const lab = (p: Pt, txt: string, c: string, dx: number, dy: number, op: number) => {
    const w = txt.length * 15 + 30, bx = dx < 0 ? p[0] + dx - w : p[0] + dx;
    return (
      <g opacity={op}>
        <line x1={p[0]} y1={p[1]} x2={dx < 0 ? bx + w : bx} y2={p[1] + dy} stroke="#fff" strokeWidth={3} />
        <rect x={bx} y={p[1] + dy - 24} width={w} height={48} rx={24} fill={c} />
        <text x={bx + w / 2} y={p[1] + dy + 10} textAnchor="middle" fontFamily={FONT} fontSize={28} fontWeight={800} fill="#fff">{txt}</text>
      </g>
    );
  };
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={a}>
      <defs>
        <mask id={u('m')} maskUnits="userSpaceOnUse" x={0} y={0} width={1264} height={1264}>
          <image href={staticFile('heart4c_mask.png')} x={0} y={0} width={1264} height={1264} />
        </mask>
        <filter id={u('gl')} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
        <radialGradient id={u('rg')} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor={glowC} stopOpacity="0.95" /><stop offset="1" stopColor={glowC} stopOpacity="0" /></radialGradient>
      </defs>
      <image href={staticFile('heart4c.png')} x={0} y={0} width={1264} height={1264} />
      <g mask={`url(#${u('m')})`}>
        {glowL > 0 && <ellipse cx={H4.LVLAT[0] - 40} cy={H4.LVLAT[1]} rx={150} ry={230} fill={`url(#${u('rg')})`} opacity={glowL} />}
        {glowR > 0 && <ellipse cx={H4.RVLAT[0] + 40} cy={H4.RVLAT[1]} rx={150} ry={230} fill={`url(#${u('rg')})`} opacity={glowR} />}
        {atrialChaos > 0 && [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
          const cx = (i % 2 ? H4.LA[0] : H4.RA[0]) + 90 * Math.sin(t * (3.1 + i) + i * 1.7);
          const cy = (i % 2 ? H4.LA[1] : H4.RA[1]) + 70 * Math.cos(t * (2.7 + i * 0.6) + i);
          return <circle key={i} cx={cx} cy={cy} r={14} fill="#FDE047" opacity={0.85 * atrialChaos} />;
        })}
      </g>
      {ring > 0 && (
        <g opacity={ring}>
          <path d={path(H4.RING_R)} stroke="#FEF08A" strokeWidth={22} fill="none" strokeLinecap="round" opacity={0.5} filter={`url(#${u('gl')})`} />
          <path d={path(H4.RING_L)} stroke="#FEF08A" strokeWidth={22} fill="none" strokeLinecap="round" opacity={0.5} filter={`url(#${u('gl')})`} />
          <path d={path(H4.RING_R)} stroke="#FDE68A" strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray="2 14" />
          <path d={path(H4.RING_L)} stroke="#FDE68A" strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray="2 14" />
        </g>
      )}
      {cond > 0 && (
        <g opacity={cond}>
          <circle cx={H4.SA[0]} cy={H4.SA[1]} r={20} fill="#FDE047" stroke="#7C2D12" strokeWidth={4} />
          <path d={path([H4.AV, H4.HIS])} stroke="#111827" strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.5} />
          <path d={path([H4.AV, H4.HIS])} stroke="#FDE047" strokeWidth={12} fill="none" strokeLinecap="round" />
          <path d={path(H4.RB)} stroke="#111827" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.45} />
          <path d={path(H4.RB)} stroke="#2563EB" strokeWidth={9} fill="none" strokeLinecap="round" />
          <path d={path(H4.LB)} stroke="#111827" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.45} />
          <path d={path(H4.LB)} stroke="#DC2626" strokeWidth={9} fill="none" strokeLinecap="round" />
          <circle cx={H4.AV[0]} cy={H4.AV[1]} r={24} fill="#FDE047" stroke="#7C2D12" strokeWidth={5} />
        </g>
      )}
      {[[apL, H4.APL], [apR, H4.APR]].map(([op, pts], i) => (op as number) > 0 && (
        <g key={i} opacity={op as number}>
          <path d={path(pts as Pt[])} stroke="#F97316" strokeWidth={34} fill="none" strokeLinecap="round" opacity={0.45} filter={`url(#${u('gl')})`} />
          <path d={path(pts as Pt[])} stroke="#111827" strokeWidth={22} fill="none" strokeLinecap="round" opacity={0.5} />
          <path d={path(pts as Pt[])} stroke="#F97316" strokeWidth={15} fill="none" strokeLinecap="round" />
        </g>
      ))}
      {dots.map((d, i) => {
        const [dx, dy] = along(d.pts, d.k);
        return d.k > 0 && d.k < 1 ? <circle key={i} cx={dx} cy={dy} r={d.r ?? 17} fill="#fff" stroke={d.c ?? '#FDE047'} strokeWidth={7} /> : null;
      })}
      {labels > 0 && (
        <g>
          {lab(H4.SA, 'nút xoang', '#A16207', -40, -90, labels * cond)}
          {lab(H4.AV, 'nút nhĩ thất', '#A16207', 80, -150, labels * cond)}
          {lab(H4.RING_R[1], 'vòng xơ nhĩ thất', '#B45309', -60, 120, labels * ring)}
          {lab(H4.APL[1], 'đường phụ TRÁI', '#C2410C', 40, -110, labels * apL)}
          {lab(H4.APR[1], 'đường phụ PHẢI', '#C2410C', -40, -110, labels * apR)}
        </g>
      )}
    </g>
  );
};
