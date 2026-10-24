// Tim minh hoạ phẳng, viền đậm, mặt cắt 4 buồng (tự thiết kế) + động mạch vành trên bề mặt + vùng tổn thương
import React from 'react';
import {HAND} from './wb';

export type Zone3 = 'inf' | 'ant' | 'lat' | 'rv' | 'post' | null;
export type Hot3 = 'rca' | 'lad' | 'lcx' | 'rcaP' | null;

const INK = '#2E2A33';
const C = {wall: '#F08C78', wall2: '#E7735F', cav: '#F9B9A9', lv: '#EB8F7E', aorta: '#E8604F', vein: '#4A86D0', pa: '#4A86D0', valve: '#FFF8F4', cor: '#B3122E'};
const G = {
  body: 'M120,152 C72,165 54,228 60,290 C68,362 122,412 200,433 C258,426 322,396 347,330 C367,274 364,202 332,165 C311,143 281,138 255,147 C228,131 160,131 120,152 Z',
  ra: 'M92,176 C80,212 90,252 130,257 C166,258 181,226 176,191 C171,165 121,160 92,176 Z',
  la: 'M221,181 C215,216 241,242 281,242 C321,240 337,206 321,180 C301,161 241,160 221,181 Z',
  rv: 'M90,277 C86,333 121,382 176,402 C191,362 191,311 186,272 C151,264 111,264 90,277 Z',
  lv: 'M216,272 C206,332 211,382 226,412 C281,397 321,352 326,302 C327,277 301,264 271,264 C246,264 226,267 216,272 Z',
  aorta: 'M196,154 C191,104 204,72 238,64 C272,57 301,77 301,114',
  b1: 'M216,74 C214,60 213,48 212,36', b2: 'M240,64 C241,50 242,40 243,28', b3: 'M266,66 C271,52 275,42 279,32',
  svc: 'M117,40 C118,80 119,120 121,160',
  pa: 'M238,158 C252,136 284,122 334,114',
  rca: 'M176,156 C122,151 72,186 66,250 C63,302 86,352 132,392',
  lcx: 'M240,153 C292,146 340,172 353,232',
  lad: 'M201,266 C196,322 199,382 212,428',
};
const ZONE: Record<string, string> = {
  inf: 'M70,322 C92,382 142,422 200,433 C252,428 302,406 332,370 C300,386 252,404 211,407 C161,403 112,376 86,336 Z',
  ant: 'M186,266 C191,322 191,382 200,431 C216,429 236,423 251,413 C229,386 216,332 216,270 Z',
  lat: 'M326,282 C331,322 321,362 291,394 C321,386 346,352 353,302 C357,262 346,222 331,202 C334,232 331,257 326,282 Z',
  rv: 'M62,272 C61,332 95,386 160,416 C131,396 92,350 88,286 Z',
};
const OCC: Record<string, [number, number]> = {rca: [70, 232], lad: [199, 300], lcx: [305, 152], rcaP: [140, 152]};

const Draw: React.FC<{d: string; prog: number; stroke?: string; sw?: number; fill?: string; fillA?: number}> = ({d, prog, stroke = INK, sw = 5, fill = 'none', fillA = 1}) => (
  <g>
    {fill !== 'none' && <path d={d} fill={fill} opacity={fillA} />}
    {prog > 0 && <path d={d} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />}
  </g>
);
const Tube: React.FC<{d: string; w: number; c: string; prog: number}> = ({d, w, c, prog}) =>
  prog <= 0 ? null : (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth={w + 9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
      <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
      <path d={d} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth={w * 0.25} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} transform={`translate(${-w * 0.2},0)`} />
    </g>
  );
// lá van trắng (tam giác cong)
const Leaf: React.FC<{x: number; y: number; w: number; h: number; a: number; flip?: boolean}> = ({x, y, w, h, a, flip}) => (
  <path d={`M${x},${y} Q${x + w * (flip ? 0.7 : 0.3)},${y + h * 0.55} ${x + w * 0.5},${y + h} Q${x + w * (flip ? 0.3 : 0.7)},${y + h * 0.55} ${x + w},${y} Z`} fill={C.valve} stroke={INK} strokeWidth={3} strokeLinejoin="round" opacity={a} />
);

export const Heart3: React.FC<{x: number; y: number; s: number; prog: number; art?: number; zone?: Zone3; zoneA?: number; zoneC?: string; hot?: Hot3; occl?: number; labels?: boolean; labelA?: number}> = ({
  x, y, s, prog, art = 1, zone = null, zoneA = 0, zoneC = '#D7263D', hot = null, occl = 0, labels = true, labelA = 1,
}) => {
  const k = (a: number, b: number) => Math.max(0, Math.min(1, (prog - a) / (b - a)));
  const ka = (a: number, b: number) => Math.max(0, Math.min(1, (art - a) / (b - a)));
  const fa = k(0.3, 0.75);
  const isHot = (n: string) => hot === n || (hot === 'rcaP' && n === 'rca');
  const cor = (n: string, d: string, a0: number, a1: number, dash = false) => {
    const p = ka(a0, a1);
    if (p <= 0) return null;
    const hotN = isHot(n), dim = !!hot && !hotN;
    return (
      <g opacity={dim ? 0.35 : 1}>
        <path d={d} fill="none" stroke="#FFF6F2" strokeWidth={hotN ? 13 : 11} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
        <path d={d} fill="none" stroke={C.cor} strokeWidth={hotN ? 8 : 6} strokeLinecap="round" strokeDasharray={dash ? '14 9' : undefined} pathLength={dash ? undefined : 1} strokeDashoffset={dash ? 0 : 1 - p} opacity={dash ? p : 1} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx={205} cy={448} rx={125} ry={12} fill="rgba(0,0,0,0.10)" opacity={fa} />
      {/* mạch lớn phía sau */}
      <Tube d={G.b1} w={16} c={C.aorta} prog={k(0.5, 0.7)} />
      <Tube d={G.b2} w={16} c={C.aorta} prog={k(0.52, 0.72)} />
      <Tube d={G.b3} w={16} c={C.aorta} prog={k(0.54, 0.74)} />
      <Tube d={G.aorta} w={42} c={C.aorta} prog={k(0.3, 0.6)} />
      <Tube d={G.svc} w={34} c={C.vein} prog={k(0.2, 0.5)} />
      <ellipse cx={117} cy={40} rx={21} ry={8} fill="#7FA9E0" stroke={INK} strokeWidth={4} opacity={k(0.45, 0.55)} />
      {/* thân tim */}
      <Draw d={G.body} prog={k(0, 0.45)} fill={C.wall} fillA={fa} />
      <path d="M85,200 C80,232 82,262 90,284" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={6} strokeLinecap="round" opacity={fa} />
      {/* buồng tim */}
      <Draw d={G.ra} prog={k(0.25, 0.55)} sw={4} fill={C.cav} fillA={fa} />
      <Draw d={G.la} prog={k(0.28, 0.58)} sw={4} fill={C.cav} fillA={fa} />
      <Draw d={G.rv} prog={k(0.3, 0.62)} sw={4} fill={C.cav} fillA={fa} />
      <Draw d={G.lv} prog={k(0.33, 0.65)} sw={4} fill={C.lv} fillA={fa} />
      {/* van ba lá, van hai lá */}
      <Leaf x={100} y={262} w={34} h={30} a={k(0.6, 0.75)} />
      <Leaf x={138} y={262} w={34} h={30} a={k(0.62, 0.77)} flip />
      <Leaf x={232} y={262} w={34} h={30} a={k(0.64, 0.79)} />
      <Leaf x={270} y={262} w={34} h={30} a={k(0.66, 0.81)} flip />
      {/* động mạch phổi phía trước */}
      <Tube d={G.pa} w={32} c={C.pa} prog={k(0.55, 0.85)} />
      <ellipse cx={334} cy={114} rx={10} ry={17} fill="#7FA9E0" stroke={INK} strokeWidth={4} opacity={k(0.85, 0.95)} />
      {/* vùng tổn thương */}
      {zone && zone !== 'post' && zoneA > 0 && (
        <g opacity={zoneA}>
          <path d={ZONE[zone]} fill={zoneC} opacity={0.55} />
          <path d={ZONE[zone]} fill="none" stroke={zoneC} strokeWidth={3} strokeDasharray="7 6" />
          {zone === 'rv' && <path d={G.rv} fill={zoneC} opacity={0.3} />}
        </g>
      )}
      {zone === 'post' && zoneA > 0 && (
        <g opacity={zoneA}>
          <path d="M226,176 C250,150 312,150 330,176" fill="none" stroke={zoneC} strokeWidth={10} strokeLinecap="round" strokeDasharray="6 9" />
          <path d={G.la} fill={zoneC} opacity={0.22} />
          <text x={271} y={214} textAnchor="middle" fill={zoneC} fontFamily={HAND} fontSize={24}>mặt sau</text>
        </g>
      )}
      {/* động mạch vành trên bề mặt */}
      {cor('rca', G.rca, 0, 0.55)}
      {cor('lcx', G.lcx, 0.15, 0.6)}
      {cor('lad', G.lad, 0.3, 0.8, true)}
      {hot && occl > 0 && (() => {
        const [ox, oy] = OCC[hot];
        return (
          <g opacity={Math.min(1, occl * 1.5)}>
            <circle cx={ox} cy={oy} r={17 * occl} fill="#FFE066" opacity={0.7} />
            <path d={`M${ox - 12},${oy - 12} L${ox + 12},${oy + 12} M${ox + 12},${oy - 12} L${ox - 12},${oy + 12}`} stroke={INK} strokeWidth={5} strokeLinecap="round" />
          </g>
        );
      })()}
      {labels && (
        <g opacity={labelA} fontFamily={HAND}>
          <text x={133} y={218} textAnchor="middle" fill="#7A3B33" fontSize={22}>nhĩ P</text>
          <text x={271} y={214} textAnchor="middle" fill="#7A3B33" fontSize={22} opacity={zone === 'post' ? 1 - zoneA : 1}>nhĩ T</text>
          <text x={140} y={340} textAnchor="middle" fill="#7A3B33" fontSize={22}>thất P</text>
          <text x={268} y={340} textAnchor="middle" fill="#7A3B33" fontSize={22}>thất T</text>
          <text x={8} y={300} fill={C.cor} fontSize={24}>RCA</text>
          <text x={176} y={458} fill={C.cor} fontSize={24}>LAD</text>
          <text x={352} y={256} fill={C.cor} fontSize={24}>LCx</text>
        </g>
      )}
    </g>
  );
};
