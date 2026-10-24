// Tim vẽ tay hoàn chỉnh (mặt trước) — tự thiết kế: ĐMC + 3 nhánh, ĐM phổi, TMC trên/dưới, nhĩ, thất, mỏm,
// động mạch vành có nhánh (RCA + nhánh bờ, LAD + nhánh chéo, LCx + nhánh bờ tù), vùng tổn thương theo định khu.
import React from 'react';
import {HAND, RPath} from './wb';

export type Zone2 = 'inf' | 'ant' | 'lat' | 'rv' | 'post' | null;
export type Hot2 = 'rca' | 'lad' | 'lcx' | 'rcaP' | null;

const INK = '#3A2F33';
const S = {
  body: 'M100,160 C70,190 62,250 80,300 C100,350 170,400 285,432 C315,410 350,360 358,300 C366,240 350,195 322,172 C300,158 270,150 245,150 L185,150 C150,148 120,150 100,160 Z',
  ra: 'M100,160 C68,195 64,255 84,298 C112,300 136,280 141,240 C146,200 131,170 100,160 Z',
  raAur: 'M128,166 C146,146 172,154 170,176 C166,192 150,190 141,202',
  laAur: 'M318,170 C346,158 366,180 354,202 C344,214 330,206 322,214',
  groove: 'M255,195 C262,250 268,330 285,428', // rãnh liên thất trước
  avR: 'M141,202 C150,190 175,178 205,172',
  aorta: 'M200,154 C195,110 205,70 245,58 C285,48 316,70 316,112',
  br1: 'M222,64 C220,45 216,28 214,12', br2: 'M250,56 C251,38 252,24 253,8', br3: 'M278,58 C283,40 289,26 294,12',
  pa: 'M232,158 C238,128 254,108 286,102', paL: 'M286,102 C306,100 322,98 340,96', paR: 'M262,110 C248,111 236,112 224,114',
  svc: 'M122,162 C121,120 119,80 117,40', ivc: 'M92,300 C88,318 84,334 80,352',
  rca: 'M190,162 C150,176 112,216 108,270 C110,316 150,360 205,395',
  rcaM: 'M116,300 C138,320 160,330 188,332',
  lm: 'M214,160 C230,170 245,182 255,195',
  lad: 'M255,195 C262,250 268,330 285,428',
  d1: 'M261,238 C290,248 314,264 330,290', d2: 'M266,300 C290,314 305,330 316,352',
  lcx: 'M255,195 C285,188 316,194 340,214 C356,232 362,256 362,282',
  om: 'M350,228 C341,268 333,300 330,332',
};
const Z: Record<string, string> = {
  ant: 'M255,195 C300,205 340,240 350,290 C340,350 310,400 285,430 C270,330 262,250 255,195 Z',
  inf: 'M92,315 C150,380 230,420 285,432 C302,424 318,410 330,394 C250,402 160,372 112,300 Z',
  lat: 'M330,180 C362,202 370,260 362,310 C354,350 337,380 320,400 C336,330 346,252 330,180 Z',
  rv: 'M141,240 C150,195 200,180 255,195 C262,260 268,340 282,425 C220,410 150,372 112,302 C128,292 139,272 141,240 Z',
};
const OCC: Record<string, [number, number]> = {rca: [120, 236], lad: [259, 222], lcx: [302, 191], rcaP: [168, 168]};

// Ống mạch: viền mực + màu + vệt sáng, vẽ dần theo prog
const Vessel: React.FC<{d: string; w: number; c: string; prog: number; hi?: boolean}> = ({d, w, c, prog, hi = true}) => {
  if (prog <= 0) return null;
  const dash = {pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - prog} as const;
  return (
    <g>
      <path d={d} {...dash} fill="none" stroke={INK} strokeWidth={w + 5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} {...dash} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      {hi && w > 10 && <path d={d} {...dash} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={w * 0.22} strokeLinecap="round" transform={`translate(${-w * 0.18},${-w * 0.12})`} />}
    </g>
  );
};
const Coronary: React.FC<{d: string; w: number; prog: number; hot: boolean; dim: boolean}> = ({d, w, prog, hot, dim}) => {
  if (prog <= 0) return null;
  const dash = {pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - prog} as const;
  return (
    <g opacity={dim ? 0.5 : 1}>
      <path d={d} {...dash} fill="none" stroke="#FFF3EE" strokeWidth={w + 5} strokeLinecap="round" opacity={0.9} />
      <path d={d} {...dash} fill="none" stroke={hot ? '#B3122E' : '#C8374A'} strokeWidth={hot ? w + 2.5 : w} strokeLinecap="round" />
    </g>
  );
};

export const Heart2: React.FC<{x: number; y: number; s: number; prog: number; art?: number; zone?: Zone2; zoneA?: number; zoneC?: string; hot?: Hot2; occl?: number; labels?: boolean; labelA?: number}> = ({
  x, y, s, prog, art = 1, zone = null, zoneA = 0, zoneC = '#D7263D', hot = null, occl = 0, labels = true, labelA = 1,
}) => {
  const k = (a: number, b: number) => Math.max(0, Math.min(1, (prog - a) / (b - a)));
  const ka = (a: number, b: number) => Math.max(0, Math.min(1, (art - a) / (b - a)));
  const fillA = k(0.35, 0.9);
  const hotIs = (n: string) => hot === n || (hot === 'rcaP' && n === 'rca');
  const sw = 2.6 / s;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {/* bóng đổ mềm */}
      <ellipse cx={230} cy={445} rx={130} ry={14} fill="rgba(0,0,0,0.10)" opacity={fillA} />
      {/* mạch lớn phía sau */}
      <Vessel d={S.svc} w={26} c="#5B86D6" prog={k(0.15, 0.45)} />
      <Vessel d={S.ivc} w={22} c="#5B86D6" prog={k(0.2, 0.45)} />
      <Vessel d={S.br1} w={12} c="#E2574C" prog={k(0.55, 0.75)} />
      <Vessel d={S.br2} w={12} c="#E2574C" prog={k(0.58, 0.78)} />
      <Vessel d={S.br3} w={12} c="#E2574C" prog={k(0.61, 0.81)} />
      <Vessel d={S.aorta} w={34} c="#E2574C" prog={k(0.35, 0.65)} />
      {/* thân tim */}
      <RPath d={S.body} stroke={INK} sw={sw} rough={0.9} seed={201} prog={k(0, 0.45)} fill="#F4AE9F" fillStyle="solid" fillA={fillA} />
      <RPath d={S.body} stroke="none" sw={0} seed={202} fill="#DC7A68" fillStyle="hachure" hachureGap={11} fillWeight={1.4} hachureAngle={-52} fillA={0.55 * fillA} />
      <ellipse cx={205} cy={250} rx={60} ry={85} fill="rgba(255,255,255,0.22)" opacity={fillA} transform="rotate(-18 205 250)" />
      {/* nhĩ phải, tiểu nhĩ */}
      <RPath d={S.ra} stroke={INK} sw={sw * 0.85} rough={1} seed={203} prog={k(0.1, 0.5)} fill="#E9907F" fillStyle="solid" fillA={0.75 * fillA} />
      <RPath d={S.ra} stroke="none" sw={0} seed={204} fill="#C9604F" fillStyle="hachure" hachureGap={8} hachureAngle={30} fillA={0.45 * fillA} />
      <RPath d={S.raAur} stroke={INK} sw={sw * 0.85} rough={1.1} seed={205} prog={k(0.3, 0.6)} />
      <RPath d={S.laAur} stroke={INK} sw={sw * 0.85} rough={1.1} seed={206} prog={k(0.32, 0.62)} fill="#E9907F" fillStyle="solid" fillA={0.8 * fillA} />
      <RPath d={S.groove} stroke="rgba(58,47,51,0.45)" sw={sw * 0.8} rough={1.4} seed={207} prog={k(0.4, 0.7)} />
      {/* động mạch phổi trước ĐMC */}
      <Vessel d={S.paR} w={18} c="#6A79D9" prog={k(0.5, 0.7)} />
      <Vessel d={S.pa} w={30} c="#6A79D9" prog={k(0.45, 0.72)} />
      <Vessel d={S.paL} w={20} c="#6A79D9" prog={k(0.6, 0.8)} />
      {/* vùng tổn thương */}
      {zone && zone !== 'post' && zoneA > 0 && (
        <g opacity={zoneA}>
          <RPath d={Z[zone]} stroke="none" sw={0} seed={210} fill={zoneC} fillStyle="solid" fillA={0.28} />
          <RPath d={Z[zone]} stroke={zoneC} sw={1.6 / s} rough={1.3} seed={211} fill={zoneC} fillStyle="cross-hatch" hachureGap={9} fillWeight={1.5} fillA={0.75} />
        </g>
      )}
      {zone === 'post' && zoneA > 0 && (
        <g opacity={zoneA}>
          <path d="M300,190 C350,215 372,270 365,320 C358,360 335,395 300,420" fill="none" stroke={zoneC} strokeWidth={14 / s} strokeLinecap="round" strokeDasharray={`${10 / s} ${12 / s}`} opacity={0.75} />
          <text x={372} y={360} fill={zoneC} fontFamily={HAND} fontSize={24} transform="rotate(70 372 360)">mặt sau</text>
        </g>
      )}
      {/* động mạch vành */}
      <Coronary d={S.rca} w={6} prog={ka(0, 0.5)} hot={hotIs('rca')} dim={!!hot && !hotIs('rca')} />
      <Coronary d={S.rcaM} w={4} prog={ka(0.4, 0.7)} hot={hotIs('rca')} dim={!!hot && !hotIs('rca')} />
      <Coronary d={S.lm} w={7} prog={ka(0, 0.2)} hot={hot === 'lad' || hot === 'lcx'} dim={!!hot && hot !== 'lad' && hot !== 'lcx'} />
      <Coronary d={S.lad} w={6} prog={ka(0.15, 0.65)} hot={hot === 'lad'} dim={!!hot && hot !== 'lad'} />
      <Coronary d={S.d1} w={4} prog={ka(0.4, 0.75)} hot={hot === 'lad'} dim={!!hot && hot !== 'lad'} />
      <Coronary d={S.d2} w={3.5} prog={ka(0.55, 0.85)} hot={hot === 'lad'} dim={!!hot && hot !== 'lad'} />
      <Coronary d={S.lcx} w={5.5} prog={ka(0.15, 0.6)} hot={hot === 'lcx'} dim={!!hot && hot !== 'lcx'} />
      <Coronary d={S.om} w={4} prog={ka(0.5, 0.85)} hot={hot === 'lcx'} dim={!!hot && hot !== 'lcx'} />
      {/* chỗ tắc */}
      {hot && occl > 0 && (() => {
        const [ox, oy] = OCC[hot];
        return (
          <g opacity={Math.min(1, occl * 1.5)}>
            <circle cx={ox} cy={oy} r={16 * occl} fill="#FFE066" opacity={0.55} />
            <RPath d={`M${ox - 13},${oy - 13} L${ox + 13},${oy + 13}`} stroke={INK} sw={5 / s} rough={0.8} seed={220} prog={occl} />
            <RPath d={`M${ox + 13},${oy - 13} L${ox - 13},${oy + 13}`} stroke={INK} sw={5 / s} rough={0.8} seed={221} prog={Math.max(0, occl * 2 - 1)} />
          </g>
        );
      })()}
      {/* nhãn viết tay */}
      {labels && (
        <g opacity={labelA} fontFamily={HAND}>
          <text x={22} y={232} fill="#B3122E" fontSize={26}>RCA</text>
          <path d="M60,238 C80,240 95,240 106,240" stroke="#B3122E" strokeWidth={1.6} fill="none" />
          <text x={226} y={366} fill="#B3122E" fontSize={26}>LAD</text>
          <text x={366} y={238} fill="#B3122E" fontSize={26}>LCx</text>
          <text x={150} y={34} fill="#3A4F8A" fontSize={20}>TMC trên</text>
          <text x={300} y={40} fill="#A3322B" fontSize={20}>ĐMC</text>
          <text x={330} y={120} fill="#3A4F8A" fontSize={20}>ĐM phổi</text>
          <text x={300} y={455} fill={INK} fontSize={20}>mỏm</text>
        </g>
      )}
    </g>
  );
};
