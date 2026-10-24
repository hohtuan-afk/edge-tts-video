// Tim minh hoạ (ảnh người dùng tạo bằng Canva AI, đã tách nền) + lớp phủ SVG khớp toạ độ ảnh 1264×1264:
// vùng nhồi máu (gạch chéo, viền trắng, cắt theo mặt nạ tim), nhánh vành thủ phạm sáng màu, huy hiệu chỗ tắc, nhãn "pill".
// Giao diện props giống Heart4/Heart5 và cùng hệ toạ độ (≈500×560) để thay thế trực tiếp.
import React from 'react';
import {staticFile} from 'remotion';
import {FONT} from '../lib';

export type Zone6 = 'inf' | 'ant' | 'lat' | 'rv' | 'post' | null;
export type Hot6 = 'rca' | 'lad' | 'lcx' | 'rcaP' | null;

const SC = 0.48, OX = -27, OY = -12; // ảnh → hệ toạ độ tim cũ
const M = (x: number, y: number): [number, number] => [OX + x * SC, OY + y * SC];

const V: Record<string, string> = {
  rca: 'M500,485 C450,530 395,590 360,660 C330,730 322,800 335,880',
  lad: 'M722,500 C745,560 752,640 742,710 C724,800 694,900 672,1000 C660,1060 656,1110 655,1150',
  d1: 'M745,650 C712,690 668,725 620,760',
  lcx: 'M742,560 C790,578 850,572 905,598 C940,618 962,660 972,720',
  om: 'M905,600 C918,680 920,760 912,840',
};
const Z: Record<string, string> = {
  ant: 'M700,540 C760,560 820,600 850,700 C870,800 850,920 800,1040 C770,1100 730,1140 700,1150 C660,1110 640,1040 650,950 C665,850 700,760 712,660 C716,610 712,570 700,540 Z',
  lat: 'M880,600 C930,620 975,680 988,760 C998,860 970,960 920,1050 C890,1100 850,1130 820,1140 C860,1050 885,950 890,850 C895,760 895,680 880,600 Z',
  inf: 'M330,860 C370,960 460,1040 560,1090 C640,1130 720,1175 800,1180 C870,1170 920,1110 955,1030 C890,1075 830,1095 770,1092 C680,1082 580,1036 500,985 C440,945 380,905 330,860 Z',
  rv: 'M470,520 C540,500 640,500 715,520 C730,600 720,700 700,800 C680,900 660,1000 655,1080 C580,1050 490,990 420,920 C370,860 350,780 370,680 C390,610 430,550 470,520 Z',
};
const POST = 'M905,560 C975,620 1000,740 990,860 C980,960 940,1060 880,1130';
const OCC: Record<string, [number, number]> = {rca: [420, 570], rcaP: [490, 495], lad: [743, 600], lcx: [820, 577]};
const HOTV: Record<string, string[]> = {rca: ['rca'], rcaP: ['rca'], lad: ['lad', 'd1'], lcx: ['lcx', 'om']};
const backOut = (x: number) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);

const Pill: React.FC<{t: string; x: number; y: number; ax: number; ay: number; c: string; left?: boolean}> = ({t, x, y, ax, ay, c, left}) => {
  const [px, py] = M(ax, ay);
  const w = t.length * 12.5 + 26;
  const bx = left ? x - w : x;
  return (
    <g>
      <line x1={x} y1={y} x2={px} y2={py} stroke={c} strokeWidth={2} />
      <circle cx={px} cy={py} r={5} fill="#fff" stroke={c} strokeWidth={2.5} />
      <rect x={bx} y={y - 17} width={w} height={34} rx={17} fill={c} />
      <text x={bx + w / 2} y={y + 7} fill="#fff" fontSize={20} fontWeight={800} textAnchor="middle" fontFamily={FONT}>{t}</text>
    </g>
  );
};

export const Heart6: React.FC<{x: number; y: number; s: number; prog: number; art?: number; zone?: Zone6; zoneA?: number; zoneC?: string; hot?: Hot6; occl?: number; labels?: boolean; labelA?: number; beat?: number; id?: string; hide?: string[]}> = ({
  x, y, s, prog, art = 1, zone = null, zoneA = 0, zoneC = '#FF3B3B', hot = null, occl = 0, labels = true, labelA = 1, beat = 0, id = 'h6', hide = [],
}) => {
  const k = (a: number, b: number) => Math.max(0, Math.min(1, (prog - a) / (b - a)));
  const u = (n: string) => `${id}-${n}`;
  const pop = 0.82 + 0.18 * backOut(k(0, 0.7));
  const pulse = 1 + 0.016 * beat;
  const sweep = Math.sin(Math.PI * Math.max(0, Math.min(1, art))); // vệt sáng chạy dọc mạch vành lúc giới thiệu
  const veil = Math.max(zone ? zoneA : 0, hot ? Math.min(1, occl * 1.5) : 0);
  const C = (cx: number, cy: number, sc: number) => `translate(${cx},${cy}) scale(${sc}) translate(${-cx},${-cy})`;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <defs>
        <mask id={u('m')} maskUnits="userSpaceOnUse" x={0} y={0} width={1264} height={1264}>
          <image href={staticFile('heart6_mask.png')} x={0} y={0} width={1264} height={1264} />
        </mask>
        <pattern id={u('hatch')} width={26} height={26} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={26} height={26} fill={zoneC} />
          <rect width={9} height={26} fill="#FFFFFF" opacity={0.3} />
        </pattern>
        <filter id={u('glow')} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9" /></filter>
        <radialGradient id={u('sh')} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#1F2937" stopOpacity="0.28" /><stop offset="1" stopColor="#1F2937" stopOpacity="0" /></radialGradient>
      </defs>
      {/* bóng mềm dưới tim */}
      <ellipse cx={300} cy={556} rx={170 * k(0, 0.5)} ry={20} fill={`url(#${u('sh')})`} />
      <g opacity={k(0, 0.25)} transform={C(290, 330, pop * pulse)}>
        <g transform={`translate(${OX},${OY}) scale(${SC})`}>
          <image href={staticFile('heart6.png')} x={0} y={0} width={1264} height={1264} />
          {/* lớp phủ bên trong silhouette tim */}
          <g mask={`url(#${u('m')})`}>
            {veil > 0 && <rect x={0} y={0} width={1264} height={1264} fill="#FFFFFF" opacity={0.34 * veil} />}
            {zone && zone !== 'post' && zoneA > 0 && (
              <g opacity={zoneA}>
                <path d={Z[zone]} fill={`url(#${u('hatch')})`} opacity={0.82} />
                <path d={Z[zone]} fill="none" stroke="#fff" strokeWidth={7} strokeDasharray="20 14" strokeLinecap="round" />
              </g>
            )}
            {zone === 'post' && zoneA > 0 && (
              <g opacity={zoneA}>
                <path d={POST} fill="none" stroke={zoneC} strokeWidth={40} strokeLinecap="round" opacity={0.85} />
                <path d={POST} fill="none" stroke="#fff" strokeWidth={6} strokeDasharray="16 12" />
              </g>
            )}
            {/* vệt sáng giới thiệu mạch vành */}
            {sweep > 0.01 && Object.values(V).map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#FFF7D6" strokeWidth={12} strokeLinecap="round" opacity={0.75 * sweep} pathLength={1} strokeDasharray="0.18 1" strokeDashoffset={1.1 - art * 1.3} />
            ))}
          </g>
          {/* nhánh thủ phạm */}
          {hot && HOTV[hot].map((n) => {
            const p = Math.min(1, occl * 1.2);
            const dash = {pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - p} as const;
            return (
              <g key={n}>
                <path d={V[n]} {...dash} fill="none" stroke={zoneC} strokeWidth={34} strokeLinecap="round" opacity={0.5} filter={`url(#${u('glow')})`} />
                <path d={V[n]} {...dash} fill="none" stroke="#FFFFFF" strokeWidth={22} strokeLinecap="round" />
                <path d={V[n]} {...dash} fill="none" stroke={zoneC} strokeWidth={13} strokeLinecap="round" />
              </g>
            );
          })}
          {/* huy hiệu chỗ tắc */}
          {hot && occl > 0 && (() => {
            const [ox, oy] = OCC[hot];
            return (
              <g transform={C(ox, oy, backOut(Math.min(1, occl)))} opacity={Math.min(1, occl * 2)}>
                <circle cx={ox} cy={oy} r={62} fill="#FFD166" opacity={0.3} />
                <circle cx={ox} cy={oy} r={34} fill="#FFD166" stroke="#1F2937" strokeWidth={6} />
                <path d={`M${ox - 12},${oy - 12} L${ox + 12},${oy + 12} M${ox + 12},${oy - 12} L${ox - 12},${oy + 12}`} stroke="#1F2937" strokeWidth={8} strokeLinecap="round" />
              </g>
            );
          })()}
          {zone === 'post' && zoneA > 0 && (
            <text x={1030} y={860} fill={zoneC} fontFamily={FONT} fontWeight={800} fontSize={46} transform="rotate(80 1030 860)" opacity={zoneA}>mặt sau</text>
          )}
        </g>
      </g>
      {labels && (
        <g opacity={labelA}>
          <Pill t="RCA" x={88} y={330} ax={345} ay={720} c="#B3122E" left />
          {!hide.includes('LAD') && <Pill t="LAD" x={380} y={540} ax={668} ay={1010} c="#B3122E" />}
          <Pill t="LCx" x={470} y={262} ax={955} ay={650} c="#B3122E" />
          <Pill t="ĐMC" x={410} y={70} ax={760} ay={190} c="#9F1D2F" />
          <Pill t="ĐMP" x={470} y={150} ax={900} ay={330} c="#2F4FA8" />
          <Pill t="TMC trên" x={150} y={52} ax={360} ay={150} c="#2F4FA8" left />
        </g>
      )}
    </g>
  );
};
