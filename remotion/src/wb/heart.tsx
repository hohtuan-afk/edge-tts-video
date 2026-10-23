// Tim vẽ tay (mặt trước) — tự thiết kế, có 3 động mạch vành: RCA, LAD, LCx
import React from 'react';
import {W, HAND, RPath, RLine} from './wb';

export const HEART = {
  body: 'M120,112 C58,132 38,224 70,302 C100,382 190,430 250,442 C302,402 362,332 372,252 C382,182 352,122 302,106 C262,96 232,110 210,120 C182,100 150,100 120,112 Z',
  ra: 'M120,112 C80,140 70,210 95,250 C130,250 165,215 175,160 C170,130 150,112 120,112 Z',
  aorta: 'M205,122 C200,80 205,45 235,35 C265,25 300,35 312,62',
  svc: 'M122,112 L118,22',
  pa: 'M262,108 C268,80 285,62 318,58',
  rca: 'M196,136 C150,150 104,230 120,318 C130,370 175,405 222,420',
  lad: 'M240,142 C262,190 272,250 268,320 C265,380 258,415 250,440',
  lcx: 'M240,142 C285,140 330,160 352,200 C362,220 368,240 370,256',
  zoneAnt: 'M250,180 C300,190 350,230 360,280 C350,340 300,400 252,440 C262,360 268,260 250,180 Z',
  zoneInf: 'M95,330 C140,400 200,430 250,442 C300,420 330,395 345,370 C290,400 200,410 95,330 Z',
  zoneLat: 'M300,110 C350,125 375,190 372,252 C362,300 345,330 330,350 C345,280 340,190 300,110 Z',
};
export type Artery = 'rca' | 'lad' | 'lcx';
const ACOL: Record<Artery, string> = {rca: '#B83A2E', lad: '#B83A2E', lcx: '#B83A2E'};

export const Heart: React.FC<{x: number; y: number; s: number; prog: number; art?: number; zone?: 'ant' | 'inf' | 'lat' | null; zoneA?: number; hot?: Artery | null; occl?: number; labels?: boolean; labelA?: number}> = ({
  x, y, s, prog, art = 1, zone = null, zoneA = 0, hot = null, occl = 0, labels = false, labelA = 1,
}) => {
  const zd = zone === 'ant' ? HEART.zoneAnt : zone === 'inf' ? HEART.zoneInf : zone === 'lat' ? HEART.zoneLat : null;
  const occlPt: Record<Artery, [number, number]> = {rca: [128, 236], lad: [266, 230], lcx: [318, 168]};
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <RPath d={HEART.body} prog={prog} stroke={W.ink} sw={3.2 / s} fill={W.heart} fillStyle="solid" fillA={Math.min(1, prog * 1.2) * 0.55} seed={3} />
      <RPath d={HEART.body} prog={prog} stroke={W.ink} sw={2 / s} fill={W.heartD} fillStyle="hachure" hachureGap={14 / s} fillA={Math.min(1, prog * 1.2) * 0.45} seed={4} />
      <RPath d={HEART.ra} prog={prog} stroke={W.ink} sw={2.2 / s} seed={5} fill={W.heartD} fillStyle="hachure" hachureGap={10 / s} fillA={0.5 * prog} />
      <RPath d={HEART.aorta} prog={prog} stroke={W.coral} sw={26 / s} rough={0.6} seed={6} />
      <RPath d={HEART.aorta} prog={prog} stroke={W.ink} sw={2 / s} rough={0.8} seed={9} />
      <RPath d={HEART.svc} prog={prog} stroke={W.blue} sw={22 / s} rough={0.5} seed={10} />
      <RPath d={HEART.pa} prog={prog} stroke={W.blue} sw={20 / s} rough={0.5} seed={11} />
      {zd && <RPath d={zd} prog={1} stroke="none" sw={0} fill={W.red} fillStyle="cross-hatch" hachureGap={9 / s} fillA={zoneA} seed={12} />}
      {(['rca', 'lad', 'lcx'] as Artery[]).map((k, i) => (
        <g key={k} opacity={hot && hot !== k ? 0.45 : 1}>
          <RPath d={HEART[k]} prog={art} stroke={ACOL[k]} sw={(hot === k ? 9 : 6) / s} rough={0.9} seed={20 + i} />
        </g>
      ))}
      {hot && occl > 0 && (
        <g opacity={occl}>
          <RLine x1={occlPt[hot][0] - 16} y1={occlPt[hot][1] - 16} x2={occlPt[hot][0] + 16} y2={occlPt[hot][1] + 16} stroke={W.ink} sw={6 / s} seed={30} prog={occl} />
          <RLine x1={occlPt[hot][0] + 16} y1={occlPt[hot][1] - 16} x2={occlPt[hot][0] - 16} y2={occlPt[hot][1] + 16} stroke={W.ink} sw={6 / s} seed={31} prog={occl} />
        </g>
      )}
      {labels && (
        <g opacity={labelA} fontFamily="inherit">
          <text x={40} y={300} fill={W.red} fontSize={26} fontFamily={HAND} textAnchor="end">RCA</text>
          <text x={286} y={300} fill={W.red} fontSize={26} fontFamily={HAND}>LAD</text>
          <text x={380} y={200} fill={W.red} fontSize={26} fontFamily={HAND}>LCx</text>
        </g>
      )}
    </g>
  );
};
