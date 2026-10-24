// Tim minh hoạ y khoa bán thực tế (mặt trước) — tự thiết kế bằng SVG: gradient đổ bóng, thớ cơ, mỡ thượng tâm mạc,
// mạch lớn dạng ống có ánh sáng, động mạch vành + nhánh, tĩnh mạch tim; vùng tổn thương phát sáng mềm.
import React from 'react';
import {FONT} from '../lib';

export type Zone4 = 'inf' | 'ant' | 'lat' | 'rv' | 'post' | null;
export type Hot4 = 'rca' | 'lad' | 'lcx' | 'rcaP' | null;

const H = {
  vent: 'M160,232 C148,300 168,382 228,452 C268,497 318,520 352,526 C382,500 410,442 420,372 C428,302 418,242 390,206 C360,176 320,168 290,172 C250,176 200,196 160,232 Z',
  lvPart: 'M338,236 C346,300 346,390 352,526 C382,500 410,442 420,372 C428,302 418,242 390,206 C372,190 352,200 338,236 Z',
  ra: 'M163,176 C112,182 92,242 100,302 C108,352 140,382 176,386 C168,332 164,282 176,232 C183,206 180,186 163,176 Z',
  raAur: 'M162,176 C186,150 228,152 242,176 C234,198 207,203 192,214 C181,202 171,190 162,176 Z',
  laAur: 'M384,196 C412,170 448,184 444,216 C436,238 414,236 398,244 C394,228 390,212 384,196 Z',
  aorta: 'M262,214 C254,142 268,96 310,82 C350,70 386,90 388,138',
  br1: 'M292,90 C290,64 288,40 287,16', br2: 'M320,80 C321,56 322,34 323,12', br3: 'M346,82 C352,60 358,40 364,20',
  svc: 'M206,30 C206,86 206,140 202,196',
  ivc: 'M132,368 C128,398 124,420 120,448',
  pa: 'M298,232 C304,190 330,162 372,152', paL: 'M370,152 C398,146 424,142 452,140', paR: 'M318,170 C296,170 280,172 266,176',
  fatR: 'M248,214 C214,222 180,238 172,272 C165,322 176,372 206,416 C226,440 250,455 276,463',
  fatL: 'M336,236 C344,300 345,380 350,520',
  rca: 'M250,214 C214,220 180,236 172,272 C165,322 176,372 206,416 C226,440 250,455 276,463',
  am: 'M190,382 C214,388 240,382 262,372',
  lad: 'M336,236 C344,300 345,380 350,520',
  d1: 'M342,292 C365,302 386,314 404,334', d2: 'M346,364 C368,374 386,388 398,408',
  lcx: 'M336,236 C362,224 388,232 406,250 C420,266 428,286 430,306',
  om: 'M420,272 C416,302 413,332 410,362',
  gcv: 'M326,246 C333,310 335,392 340,512', // tĩnh mạch tim lớn đi cạnh LAD
};
const Z: Record<string, string> = {
  ant: 'M336,250 C298,302 300,420 340,520 C372,500 396,430 396,360 C396,300 372,262 336,250 Z',
  inf: 'M176,380 C210,440 280,498 352,526 C382,506 396,482 402,460 C330,472 260,442 206,392 Z',
  lat: 'M404,212 C432,252 434,332 416,402 C406,442 390,472 374,498 C392,420 398,322 380,232 Z',
  rv: 'M180,240 C200,214 252,204 300,214 C322,224 336,240 336,252 C342,330 340,420 346,506 C300,490 240,450 204,400 C178,360 172,300 180,240 Z',
};
const OCC: Record<string, [number, number]> = {rca: [172, 292], rcaP: [234, 218], lad: [338, 262], lcx: [386, 236]};

// Ống mạch tròn: bóng – thân – sáng
const Tube: React.FC<{d: string; w: number; dark: string; mid: string; light: string; a?: number}> = ({d, w, dark, mid, light, a = 1}) => (
  <g opacity={a}>
    <path d={d} fill="none" stroke={dark} strokeWidth={w} strokeLinecap="round" />
    <path d={d} fill="none" stroke={mid} strokeWidth={w * 0.72} strokeLinecap="round" transform={`translate(${-w * 0.08},${-w * 0.04})`} />
    <path d={d} fill="none" stroke={light} strokeWidth={w * 0.2} strokeLinecap="round" opacity={0.75} transform={`translate(${-w * 0.2},${-w * 0.1})`} />
  </g>
);
const Vessel: React.FC<{d: string; w: number; prog: number; hot?: boolean; dim?: boolean; vein?: boolean}> = ({d, w, prog, hot, dim, vein}) => {
  if (prog <= 0) return null;
  const dash = {pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - prog} as const;
  const c = vein ? ['#21407A', '#3E6CC0', '#A9C4F2'] : hot ? ['#6B0A18', '#D0142F', '#FF8A96'] : ['#7A1424', '#BF2B3D', '#F59AA3'];
  return (
    <g opacity={dim ? 0.35 : 1}>
      <path d={d} {...dash} fill="none" stroke={c[0]} strokeWidth={w + 2} strokeLinecap="round" />
      <path d={d} {...dash} fill="none" stroke={c[1]} strokeWidth={w} strokeLinecap="round" />
      <path d={d} {...dash} fill="none" stroke={c[2]} strokeWidth={Math.max(1, w * 0.3)} strokeLinecap="round" opacity={0.8} transform="translate(-1,-1)" />
    </g>
  );
};

export const Heart4: React.FC<{x: number; y: number; s: number; prog: number; art?: number; zone?: Zone4; zoneA?: number; zoneC?: string; hot?: Hot4; occl?: number; labels?: boolean; labelA?: number; beat?: number; id?: string}> = ({
  x, y, s, prog, art = 1, zone = null, zoneA = 0, zoneC = '#FF3B3B', hot = null, occl = 0, labels = true, labelA = 1, beat = 0, id = 'h4',
}) => {
  const k = (a: number, b: number) => Math.max(0, Math.min(1, (prog - a) / (b - a)));
  const ka = (a: number, b: number) => Math.max(0, Math.min(1, (art - a) / (b - a)));
  const isHot = (n: string) => hot === n || (hot === 'rcaP' && n === 'rca');
  const dim = (n: string) => !!hot && !isHot(n);
  const grow = 0.92 + 0.08 * k(0, 0.6);
  const pulse = 1 + 0.012 * beat;
  const u = (n: string) => `${id}-${n}`;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <defs>
        <radialGradient id={u('myo')} cx="0.42" cy="0.38" r="0.75">
          <stop offset="0" stopColor="#EF8572" />
          <stop offset="0.45" stopColor="#D2533F" />
          <stop offset="0.8" stopColor="#A9362B" />
          <stop offset="1" stopColor="#7C2420" />
        </radialGradient>
        <linearGradient id={u('lv')} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#3A0E0B" stopOpacity="0.45" />
        </linearGradient>
        <radialGradient id={u('ra')} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#D9715F" />
          <stop offset="1" stopColor="#8E2E27" />
        </radialGradient>
        <radialGradient id={u('spec')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={u('zone')} cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor={zoneC} stopOpacity="0.85" />
          <stop offset="1" stopColor={zoneC} stopOpacity="0.15" />
        </radialGradient>
        <filter id={u('soft')} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id={u('blur2')} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2" /></filter>
        <filter id={u('shadow')} x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="6" dy="10" stdDeviation="10" floodColor="#000" floodOpacity="0.28" /></filter>
        <clipPath id={u('clipV')}><path d={H.vent} /></clipPath>
      </defs>
      <g opacity={k(0, 0.35)} transform={`translate(270,300) scale(${grow * pulse}) translate(-270,-300)`}>
        <ellipse cx={290} cy={540} rx={150} ry={16} fill="#000" opacity={0.12} filter={`url(#${u('soft')})`} />
        {/* mạch lớn phía sau */}
        <Tube d={H.br1} w={22} dark="#7E1F1A" mid="#C9443A" light="#F3A08F" a={k(0.35, 0.6)} />
        <Tube d={H.br2} w={20} dark="#7E1F1A" mid="#C9443A" light="#F3A08F" a={k(0.38, 0.62)} />
        <Tube d={H.br3} w={20} dark="#7E1F1A" mid="#C9443A" light="#F3A08F" a={k(0.41, 0.65)} />
        <Tube d={H.svc} w={44} dark="#1E3D78" mid="#3D6CC2" light="#A8C3F0" a={k(0.2, 0.5)} />
        <Tube d={H.ivc} w={38} dark="#1E3D78" mid="#3D6CC2" light="#A8C3F0" a={k(0.2, 0.5)} />
        <Tube d={H.aorta} w={56} dark="#7E1F1A" mid="#D04B3E" light="#F6A493" a={k(0.25, 0.55)} />
        <Tube d={H.paR} w={26} dark="#2B3C86" mid="#4E66C4" light="#AEBBF0" a={k(0.3, 0.55)} />
        {/* khối tim */}
        <g filter={`url(#${u('shadow')})`}>
          <path d={H.ra} fill={`url(#${u('ra')})`} stroke="#5E1A16" strokeWidth={2} />
          <path d={H.vent} fill={`url(#${u('myo')})`} stroke="#5E1A16" strokeWidth={2.2} />
        </g>
        <path d={H.lvPart} fill={`url(#${u('lv')})`} />
        {/* thớ cơ xoắn */}
        <g clipPath={`url(#${u('clipV')})`} opacity={0.16} fill="none" stroke="#FFE1D8" strokeWidth={1.4}>
          {Array.from({length: 14}).map((_, i) => (
            <path key={i} d={`M${120 + i * 26},190 C${170 + i * 22},${290 + i * 4} ${230 + i * 14},${400 + i * 3} ${300 + i * 6},${540}`} />
          ))}
        </g>
        <ellipse cx={240} cy={290} rx={62} ry={98} fill={`url(#${u('spec')})`} transform="rotate(-22 240 290)" />
        {/* tiểu nhĩ */}
        <path d={H.laAur} fill={`url(#${u('ra')})`} stroke="#5E1A16" strokeWidth={2} />
        <path d={H.raAur} fill={`url(#${u('ra')})`} stroke="#5E1A16" strokeWidth={2} />
        <path d="M172,186 C190,176 210,176 228,182" fill="none" stroke="#FFD0C5" strokeWidth={2} opacity={0.45} />
        {/* mỡ thượng tâm mạc dọc rãnh */}
        <g opacity={0.7 * k(0.45, 0.75)} filter={`url(#${u('blur2')})`}>
          <path d={H.fatR} fill="none" stroke="#F2CF7E" strokeWidth={22} strokeLinecap="round" />
          <path d={H.fatL} fill="none" stroke="#F2CF7E" strokeWidth={20} strokeLinecap="round" />
          <path d={H.lcx} fill="none" stroke="#F2CF7E" strokeWidth={18} strokeLinecap="round" />
        </g>
        {/* động mạch phổi phía trước */}
        <Tube d={H.pa} w={52} dark="#2B3C86" mid="#4E66C4" light="#AEBBF0" a={k(0.45, 0.7)} />
        <Tube d={H.paL} w={32} dark="#2B3C86" mid="#4E66C4" light="#AEBBF0" a={k(0.5, 0.75)} />
        {/* vùng tổn thương */}
        {zone && zone !== 'post' && zoneA > 0 && (
          <g opacity={zoneA}>
            <path d={Z[zone]} fill={`url(#${u('zone')})`} filter={`url(#${u('soft')})`} style={{mixBlendMode: 'screen'}} />
            <path d={Z[zone]} fill={zoneC} opacity={0.32} style={{mixBlendMode: 'multiply'}} />
            <path d={Z[zone]} fill="none" stroke="#fff" strokeWidth={2.5} strokeDasharray="8 7" opacity={0.85} />
          </g>
        )}
        {zone === 'post' && zoneA > 0 && (
          <g opacity={zoneA}>
            <path d="M398,206 C440,250 446,340 424,420 C410,468 390,500 366,520" fill="none" stroke={zoneC} strokeWidth={18} strokeLinecap="round" filter={`url(#${u('soft')})`} opacity={0.9} />
            <path d="M398,206 C440,250 446,340 424,420 C410,468 390,500 366,520" fill="none" stroke="#fff" strokeWidth={2.5} strokeDasharray="8 7" />
            <text x={448} y={360} fill={zoneC} fontFamily={FONT} fontWeight={700} fontSize={22} transform="rotate(72 448 360)">mặt sau</text>
          </g>
        )}
        {/* tĩnh mạch tim + động mạch vành */}
        <Vessel d={H.gcv} w={4} prog={ka(0.3, 0.8)} vein dim={!!hot} />
        <Vessel d={H.rca} w={7} prog={ka(0, 0.55)} hot={isHot('rca')} dim={dim('rca')} />
        <Vessel d={H.am} w={4} prog={ka(0.45, 0.7)} hot={isHot('rca')} dim={dim('rca')} />
        <Vessel d={H.lad} w={7} prog={ka(0.1, 0.6)} hot={isHot('lad')} dim={dim('lad')} />
        <Vessel d={H.d1} w={4.5} prog={ka(0.4, 0.7)} hot={isHot('lad')} dim={dim('lad')} />
        <Vessel d={H.d2} w={4} prog={ka(0.5, 0.8)} hot={isHot('lad')} dim={dim('lad')} />
        <Vessel d={H.lcx} w={6.5} prog={ka(0.1, 0.55)} hot={isHot('lcx')} dim={dim('lcx')} />
        <Vessel d={H.om} w={4.5} prog={ka(0.45, 0.75)} hot={isHot('lcx')} dim={dim('lcx')} />
        {/* chỗ tắc: huyết khối */}
        {hot && occl > 0 && (() => {
          const [ox, oy] = OCC[hot];
          return (
            <g opacity={Math.min(1, occl * 1.4)}>
              <circle cx={ox} cy={oy} r={26 * occl} fill="#FFE066" opacity={0.35} filter={`url(#${u('soft')})`} />
              <circle cx={ox} cy={oy} r={9} fill="#3B0A0F" stroke="#FFE066" strokeWidth={3} />
              <circle cx={ox - 2} cy={oy - 3} r={2.5} fill="#fff" opacity={0.6} />
            </g>
          );
        })()}
        {labels && (
          <g opacity={labelA} fontFamily={FONT} fontWeight={700}>
            {[
              ['RCA', 78, 300, 168, 296, '#B3122E'], ['LAD', 382, 476, 350, 470, '#B3122E'], ['LCx', 452, 270, 428, 278, '#B3122E'],
              ['ĐMC', 410, 86, 384, 110, '#8E2B24'], ['ĐMP', 456, 120, 440, 140, '#2B3C86'], ['TMC trên', 112, 60, 186, 70, '#1E3D78'],
            ].map(([t, lx, ly, px, py, c], i) => (
              <g key={i}>
                <line x1={lx as number} y1={(ly as number) - 7} x2={px as number} y2={py as number} stroke={c as string} strokeWidth={1.5} opacity={0.7} />
                <circle cx={px as number} cy={py as number} r={3} fill={c as string} />
                <text x={lx as number} y={ly as number} fill={c as string} fontSize={22} textAnchor={(lx as number) < (px as number) ? 'end' : 'start'}>{t}</text>
              </g>
            ))}
          </g>
        )}
      </g>
    </g>
  );
};
