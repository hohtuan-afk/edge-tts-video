// Tim kiểu INFOGRAPHIC phẳng (flat) — tự thiết kế: khối màu phẳng 2 tông, không viền đen, mạch lớn dạng ống phẳng,
// động mạch vành trắng nổi bật, vùng tổn thương tô phẳng + gạch chéo, nhãn dạng "pill" có đường dẫn, huy hiệu chỗ tắc.
import React from 'react';
import {FONT} from '../lib';

export type Zone5 = 'inf' | 'ant' | 'lat' | 'rv' | 'post' | null;
export type Hot5 = 'rca' | 'lad' | 'lcx' | 'rcaP' | null;

const C = {
  rv: '#F26D6D', rvSh: '#E25A5E', lv: '#D9475A', lvSh: '#C23A4F', ra: '#E8575F', aur: '#C93E50',
  ao: '#D63447', aoHi: '#F07A84', pa: '#4F74D9', paHi: '#8FA9F0', vein: '#3A5DBA', veinHi: '#7E9BE6',
  cor: '#FFFFFF', corCase: '#9E2236', ink: '#1F2937',
};
const H = {
  vent: 'M156,238 C144,312 176,402 238,462 C278,500 324,524 352,528 C388,500 420,440 428,368 C434,300 420,238 386,206 C356,180 314,174 280,178 C236,184 186,204 156,238 Z',
  lvPart: 'M338,226 C350,300 350,400 352,528 C388,500 420,440 428,368 C434,300 420,238 386,206 C368,194 350,204 338,226 Z',
  rvShade: 'M156,238 C144,312 176,402 238,462 C278,500 324,524 352,528 C330,500 300,470 270,440 C214,384 186,320 190,250 Z',
  lvShade: 'M428,368 C420,440 388,500 352,528 C372,470 398,410 404,340 C408,290 400,250 386,206 C420,238 434,300 428,368 Z',
  ra: 'M166,178 C116,184 96,244 104,302 C110,350 142,380 178,386 C168,332 164,282 176,232 C183,206 182,188 166,178 Z',
  raAur: 'M162,178 C186,150 228,152 244,176 C236,198 208,204 192,214 C180,202 170,190 162,178 Z',
  laAur: 'M384,198 C412,172 448,184 444,216 C436,238 414,236 398,244 C394,228 390,212 384,198 Z',
  aorta: 'M262,214 C254,142 268,96 310,82 C350,70 386,90 388,138',
  br1: 'M292,90 L288,22', br2: 'M320,80 L322,16', br3: 'M346,84 L360,24',
  svc: 'M206,34 L204,196',
  ivc: 'M142,362 L136,414',
  pa: 'M298,232 C304,190 330,162 372,152', paL: 'M370,152 C398,146 424,142 452,140', paR: 'M318,170 C296,170 280,172 266,176',
  rca: 'M250,214 C214,220 180,236 172,272 C165,322 176,372 206,416 C226,440 250,455 276,463',
  am: 'M190,382 C214,388 240,382 262,372',
  lad: 'M336,236 C344,300 345,380 350,520',
  d1: 'M342,292 C365,302 386,314 404,334', d2: 'M346,364 C368,374 386,388 398,408',
  lcx: 'M336,236 C362,224 388,232 406,250 C420,266 428,286 430,306',
  om: 'M420,272 C416,302 413,332 410,362',
};
const Z: Record<string, string> = {
  ant: 'M336,250 C300,302 302,420 342,518 C374,496 398,430 398,360 C398,300 374,262 336,250 Z',
  inf: 'M180,384 C212,440 280,496 350,524 C380,504 396,482 404,458 C330,470 262,442 208,394 Z',
  lat: 'M404,212 C432,252 434,332 418,402 C408,442 392,472 376,498 C394,420 400,322 382,232 Z',
  rv: 'M182,242 C202,214 252,204 300,214 C322,224 336,240 336,252 C342,330 340,420 346,506 C300,490 240,450 204,400 C178,360 174,300 182,242 Z',
};
const OCC: Record<string, [number, number]> = {rca: [172, 292], rcaP: [234, 218], lad: [338, 262], lcx: [386, 236]};
const backOut = (x: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

// Ống phẳng 2 tông: thân + vệt sáng lệch trái
const FTube: React.FC<{d: string; w: number; c: string; hi: string; a?: number}> = ({d, w, c, hi, a = 1}) =>
  a <= 0 ? null : (
    <g opacity={a}>
      <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" />
      <path d={d} fill="none" stroke={hi} strokeWidth={w * 0.22} strokeLinecap="round" transform={`translate(${-w * 0.22},${-w * 0.06})`} opacity={0.9} />
    </g>
  );
const Cor: React.FC<{d: string; w: number; prog: number; hot?: boolean; dim?: boolean; hc: string}> = ({d, w, prog, hot, dim, hc}) => {
  if (prog <= 0) return null;
  const dash = {pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - prog} as const;
  return (
    <g opacity={dim ? 0.4 : 1}>
      {hot && <path d={d} {...dash} fill="none" stroke={hc} strokeWidth={w + 12} strokeLinecap="round" opacity={0.35} />}
      <path d={d} {...dash} fill="none" stroke={hot ? '#FFFFFF' : C.corCase} strokeWidth={w + 4} strokeLinecap="round" />
      <path d={d} {...dash} fill="none" stroke={hot ? hc : C.cor} strokeWidth={w} strokeLinecap="round" />
    </g>
  );
};
const Pill: React.FC<{t: string; x: number; y: number; px: number; py: number; c: string; left?: boolean}> = ({t, x, y, px, py, c, left}) => {
  const w = t.length * 12.5 + 26;
  const bx = left ? x - w : x;
  return (
    <g>
      <line x1={left ? x : x} y1={y} x2={px} y2={py} stroke={c} strokeWidth={2} />
      <circle cx={px} cy={py} r={5} fill="#fff" stroke={c} strokeWidth={2.5} />
      <rect x={bx} y={y - 17} width={w} height={34} rx={17} fill={c} />
      <text x={bx + w / 2} y={y + 7} fill="#fff" fontSize={20} fontWeight={800} textAnchor="middle" fontFamily={FONT}>{t}</text>
    </g>
  );
};

export const Heart5: React.FC<{x: number; y: number; s: number; prog: number; art?: number; zone?: Zone5; zoneA?: number; zoneC?: string; hot?: Hot5; occl?: number; labels?: boolean; labelA?: number; beat?: number; id?: string}> = ({
  x, y, s, prog, art = 1, zone = null, zoneA = 0, zoneC = '#FF3B3B', hot = null, occl = 0, labels = true, labelA = 1, beat = 0, id = 'h5',
}) => {
  const k = (a: number, b: number) => Math.max(0, Math.min(1, (prog - a) / (b - a)));
  const ka = (a: number, b: number) => Math.max(0, Math.min(1, (art - a) / (b - a)));
  const isHot = (n: string) => hot === n || (hot === 'rcaP' && n === 'rca');
  const dim = (n: string) => !!hot && !isHot(n);
  const pop = (a: number, b: number) => 0.6 + 0.4 * backOut(k(a, b));
  const P = (cx: number, cy: number, sc: number) => `translate(${cx},${cy}) scale(${sc}) translate(${-cx},${-cy})`;
  const pulse = 1 + 0.018 * beat;
  const u = (n: string) => `${id}-${n}`;
  const hc = zoneC;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <defs>
        <pattern id={u('hatch')} width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={14} height={14} fill={zoneC} />
          <rect width={5} height={14} fill="#FFFFFF" opacity={0.28} />
        </pattern>
        <clipPath id={u('clipV')}><path d={H.vent} /></clipPath>
      </defs>
      {/* bóng phẳng */}
      <ellipse cx={292} cy={548} rx={150 * k(0, 0.4)} ry={13} fill="#1F2937" opacity={0.1} />
      <g transform={P(290, 330, pulse)}>
        {/* mạch lớn phía sau */}
        <g opacity={k(0.3, 0.5)} transform={P(320, 60, pop(0.3, 0.6))}>
          <FTube d={H.br1} w={22} c={C.ao} hi={C.aoHi} />
          <FTube d={H.br2} w={22} c={C.ao} hi={C.aoHi} />
          <FTube d={H.br3} w={22} c={C.ao} hi={C.aoHi} />
        </g>
        <FTube d={H.svc} w={44} c={C.vein} hi={C.veinHi} a={k(0.2, 0.4)} />
        <FTube d={H.ivc} w={38} c={C.vein} hi={C.veinHi} a={k(0.2, 0.4)} />
        <FTube d={H.aorta} w={56} c={C.ao} hi={C.aoHi} a={k(0.25, 0.45)} />
        <FTube d={H.paR} w={26} c={C.pa} hi={C.paHi} a={k(0.3, 0.5)} />
        {/* khối tim: bật ra kiểu infographic */}
        <g opacity={k(0, 0.15)} transform={P(290, 360, pop(0, 0.45))}>
          <path d={H.ra} fill={C.ra} />
          <path d="M150,210 C126,240 120,290 132,330" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={0.28} />
          <path d={H.vent} fill={C.rv} />
          <g clipPath={`url(#${u('clipV')})`}>
            <path d={H.rvShade} fill={C.rvSh} />
            <path d={H.lvPart} fill={C.lv} />
            <path d={H.lvShade} fill={C.lvSh} />
          </g>
          {/* vệt bóng sáng phẳng */}
          <path d="M196,252 C186,292 190,336 208,372" fill="none" stroke="#fff" strokeWidth={12} strokeLinecap="round" opacity={0.3} />
          <circle cx={206} cy={398} r={6} fill="#fff" opacity={0.3} />
          <path d={H.laAur} fill={C.aur} />
          <path d={H.raAur} fill={C.aur} />
        </g>
        {/* vùng tổn thương: tô phẳng + gạch chéo + viền trắng đứt */}
        {zone && zone !== 'post' && zoneA > 0 && (
          <g opacity={zoneA}>
            <path d={Z[zone]} fill={`url(#${u('hatch')})`} opacity={0.92} />
            <path d={Z[zone]} fill="none" stroke="#fff" strokeWidth={3.5} strokeDasharray="10 7" strokeLinecap="round" />
          </g>
        )}
        {zone === 'post' && zoneA > 0 && (
          <g opacity={zoneA}>
            <path d="M398,206 C440,250 446,340 424,420 C410,468 390,500 366,520" fill="none" stroke={zoneC} strokeWidth={16} strokeLinecap="round" />
            <path d="M398,206 C440,250 446,340 424,420 C410,468 390,500 366,520" fill="none" stroke="#fff" strokeWidth={3} strokeDasharray="8 7" />
            <text x={452} y={360} fill={zoneC} fontFamily={FONT} fontWeight={800} fontSize={22} transform="rotate(72 452 360)">mặt sau</text>
          </g>
        )}
        {/* động mạch phổi phía trước */}
        <FTube d={H.pa} w={52} c={C.pa} hi={C.paHi} a={k(0.4, 0.6)} />
        <FTube d={H.paL} w={32} c={C.pa} hi={C.paHi} a={k(0.45, 0.65)} />
        {/* động mạch vành trắng */}
        <Cor d={H.rca} w={8} prog={ka(0, 0.55)} hot={isHot('rca')} dim={dim('rca')} hc={hc} />
        <Cor d={H.am} w={5} prog={ka(0.45, 0.7)} hot={isHot('rca')} dim={dim('rca')} hc={hc} />
        <Cor d={H.lad} w={8} prog={ka(0.1, 0.6)} hot={isHot('lad')} dim={dim('lad')} hc={hc} />
        <Cor d={H.d1} w={5} prog={ka(0.4, 0.7)} hot={isHot('lad')} dim={dim('lad')} hc={hc} />
        <Cor d={H.d2} w={5} prog={ka(0.5, 0.8)} hot={isHot('lad')} dim={dim('lad')} hc={hc} />
        <Cor d={H.lcx} w={7.5} prog={ka(0.1, 0.55)} hot={isHot('lcx')} dim={dim('lcx')} hc={hc} />
        <Cor d={H.om} w={5} prog={ka(0.45, 0.75)} hot={isHot('lcx')} dim={dim('lcx')} hc={hc} />
        {/* huy hiệu chỗ tắc */}
        {hot && occl > 0 && (() => {
          const [ox, oy] = OCC[hot];
          const sc = backOut(Math.min(1, occl));
          return (
            <g transform={P(ox, oy, sc)} opacity={Math.min(1, occl * 2)}>
              <circle cx={ox} cy={oy} r={30} fill="#FFD166" opacity={0.3} />
              <circle cx={ox} cy={oy} r={17} fill="#FFD166" stroke="#1F2937" strokeWidth={3} />
              <path d={`M${ox - 6},${oy - 6} L${ox + 6},${oy + 6} M${ox + 6},${oy - 6} L${ox - 6},${oy + 6}`} stroke="#1F2937" strokeWidth={4} strokeLinecap="round" />
            </g>
          );
        })()}
      </g>
      {labels && (
        <g opacity={labelA}>
          <Pill t="RCA" x={96} y={300} px={170} py={296} c="#B3122E" left />
          <Pill t="LAD" x={384} y={548} px={350} py={500} c="#B3122E" />
          <Pill t="LCx" x={452} y={292} px={428} py={286} c="#B3122E" />
          <Pill t="ĐMC" x={404} y={92} px={382} py={112} c="#9F1D2F" />
          <Pill t="ĐMP" x={460} y={140} px={440} py={142} c="#2F4FA8" />
          <Pill t="TMC trên" x={176} y={118} px={204} py={110} c="#2F4FA8" left />
        </g>
      )}
    </g>
  );
};
