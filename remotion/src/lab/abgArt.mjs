// Bộ minh hoạ y khoa tự vẽ cho chuỗi "Giải mã khí máu" (SVG thuần, xem thử được ngoài Remotion).

// ---------- Cổ tay & bàn tay trái ngửa: ngón hướng phải, ngón cái ở trên (phía quay) ----------
export const WRIST_W = 1110;
export const WRIST_H = 700;
export const ARM =
  'M-40,196 C120,206 330,226 508,246 C540,250 566,250 590,238 C632,214 690,212 742,218 C772,221 800,226 826,234 ' +
  'C838,300 842,430 826,514 C790,540 716,552 650,540 C612,532 586,512 556,504 C520,496 480,494 440,498 ' +
  'C300,512 120,528 -40,540 Z';
export const THUMB = 'M608,232 C640,186 690,126 748,82 C772,62 806,58 824,76 C842,96 832,124 810,144 C778,172 748,204 732,232 C700,246 640,250 608,232 Z';
export const FINGERS = [
  'M806,232 C860,216 950,210 1016,214 C1050,216 1064,240 1056,262 C1048,282 1026,288 1000,288 C940,290 880,296 824,304 Z',
  'M826,300 C890,292 990,288 1060,292 C1094,294 1106,320 1098,342 C1090,362 1068,368 1040,368 C970,370 900,372 834,376 Z',
  'M834,372 C900,368 980,370 1040,376 C1072,380 1084,404 1076,426 C1068,444 1048,450 1022,448 C960,446 890,446 830,448 Z',
  'M830,444 C880,442 930,446 974,454 C1004,460 1014,482 1006,500 C998,518 978,522 954,520 C910,518 860,518 812,522 Z',
];
export const SITE = {x: 500, y: 300}; // điểm chọc: trên nếp cổ tay, phía ngón cái
export const ARTERY = 'M120,288 C230,296 340,300 420,298 C470,296 520,298 560,296 C592,294 612,276 628,250';

const skinDefs = (p) => `
  <linearGradient id="${p}s" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#D99C76"/><stop offset=".16" stop-color="#F0C4A4"/>
    <stop offset=".52" stop-color="#F7D5BC"/><stop offset=".86" stop-color="#E7B18E"/><stop offset="1" stop-color="#CC8E6A"/>
  </linearGradient>
  <linearGradient id="${p}f" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#E5AE8A"/><stop offset=".45" stop-color="#F8D8C0"/><stop offset="1" stop-color="#D79B77"/>
  </linearGradient>
  <radialGradient id="${p}pad"><stop offset="0" stop-color="#F7B7A0" stop-opacity=".75"/><stop offset="1" stop-color="#F7B7A0" stop-opacity="0"/></radialGradient>
  <radialGradient id="${p}hl"><stop offset="0" stop-color="#FFF1E6" stop-opacity=".85"/><stop offset="1" stop-color="#FFF1E6" stop-opacity="0"/></radialGradient>
  <filter id="${p}sh" x="-20%" y="-20%" width="140%" height="150%"><feGaussianBlur stdDeviation="20"/></filter>
`;

export const handSkin = (p = 'w', tint = 0) => `
  <defs>${skinDefs(p)}</defs>
  <g transform="translate(14,34)" opacity=".45" filter="url(#${p}sh)"><path d="${ARM}" fill="#000"/><path d="${THUMB}" fill="#000"/>${FINGERS.map((d) => `<path d="${d}" fill="#000"/>`).join('')}</g>
  ${FINGERS.map((d) => `<path d="${d}" fill="url(#${p}f)" stroke="#AE7452" stroke-width="2"/>`).join('')}
  <path d="${THUMB}" fill="url(#${p}f)" stroke="#AE7452" stroke-width="2"/>
  <path d="${ARM}" fill="url(#${p}s)"/>
  <g fill="none" stroke="#AE7452" stroke-width="2">
    <path d="M-40,196 C120,206 330,226 508,246 C540,250 566,250 590,238"/>
    <path d="M742,218 C772,221 800,226 826,234"/>
    <path d="M826,514 C790,540 716,552 650,540 C612,532 586,512 556,504 C520,496 480,494 440,498 C300,512 120,528 -40,540"/>
    <path d="M826,238 C832,262 836,288 836,306 M836,306 C840,330 842,352 842,378 M842,378 C842,400 840,424 838,448 M838,448 C836,472 832,494 826,514" stroke="#A9694A" stroke-opacity=".42"/>
  </g>
  <ellipse cx="716" cy="300" rx="104" ry="72" fill="url(#${p}pad)"/>
  <ellipse cx="700" cy="470" rx="96" ry="56" fill="url(#${p}pad)"/>
  <ellipse cx="770" cy="118" rx="44" ry="26" transform="rotate(-38 770 118)" fill="url(#${p}pad)"/>
  <ellipse cx="300" cy="372" rx="280" ry="70" fill="url(#${p}hl)"/>
  <ellipse cx="760" cy="392" rx="62" ry="62" fill="url(#${p}hl)" opacity=".7"/>
  <g fill="none" stroke="#A9694A" stroke-linecap="round">
    <path d="M570,262 C582,330 584,430 568,496" stroke-width="3" opacity=".6"/>
    <path d="M546,258 C556,330 558,430 544,496" stroke-width="2" opacity=".35"/>
    <path d="M628,246 C690,296 712,380 680,512" stroke-width="3" opacity=".5"/>
    <path d="M740,240 C720,300 742,360 816,386" stroke-width="2.5" opacity=".42"/>
    <path d="M820,312 C770,330 730,348 690,400" stroke-width="2.5" opacity=".38"/>
    ${[[904, 216, 908, 292], [974, 212, 976, 290], [920, 292, 922, 370], [1000, 290, 1002, 368], [916, 368, 918, 446], [990, 374, 992, 447], [888, 444, 890, 519], [948, 452, 950, 520]].map(([a, b, c, d]) => `<path d="M${a},${b + 6} Q${a + 6},${(b + d) / 2} ${c},${d - 6}" stroke-width="2" opacity=".38"/>`).join('')}
    <path d="M728,116 C746,126 764,150 772,170" stroke-width="2" opacity=".35"/>
  </g>
  ${tint ? `<g opacity="${tint}"><path d="${ARM}" fill="#F3EDE6"/><path d="${THUMB}" fill="#F3EDE6"/>${FINGERS.map((d) => `<path d="${d}" fill="#F3EDE6"/>`).join('')}</g>` : ''}
`;

// Lớp giải phẫu mở dưới da (chỉ che vùng trước cổ tay)
export const anatomy = (p = 'a') => `
  <defs>
    <radialGradient id="${p}m" cx=".5" cy=".5" r=".5"><stop offset=".72" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>
    <mask id="${p}mask" maskUnits="userSpaceOnUse" x="20" y="170" width="720" height="400"><ellipse cx="370" cy="372" rx="310" ry="178" fill="url(#${p}m)"/></mask>
    <clipPath id="${p}clip"><path d="${ARM}"/></clipPath>
    <linearGradient id="${p}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8E3E3E"/><stop offset=".5" stop-color="#B55A52"/><stop offset="1" stop-color="#7E3336"/></linearGradient>
    <linearGradient id="${p}bone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6DE"/><stop offset="1" stop-color="#D8C198"/></linearGradient>
    <linearGradient id="${p}ten" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFDF4"/><stop offset=".6" stop-color="#EFE6CC"/><stop offset="1" stop-color="#BFAF8A"/></linearGradient>
  </defs>
  <g clip-path="url(#${p}clip)"><g mask="url(#${p}mask)">
    <rect x="40" y="190" width="660" height="370" fill="url(#${p}bg)"/>
    ${Array.from({length: 13}, (_, i) => `<path d="M60,${232 + i * 26} C240,${238 + i * 26} 420,${240 + i * 25} 680,${250 + i * 22}" stroke="#E08C7C" stroke-opacity=".18" stroke-width="5" fill="none"/>`).join('')}
    <path d="M40,212 C220,226 400,244 520,256 C556,258 588,250 608,262 C618,276 600,284 580,282 C520,276 300,262 40,252 Z" fill="url(#${p}bone)" stroke="#A98F63" stroke-width="2"/>
    <path d="M60,356 C220,352 390,346 720,316" stroke="url(#${p}ten)" stroke-width="22" fill="none" stroke-linecap="round"/>
    <path d="M60,396 C260,394 420,386 720,376" stroke="url(#${p}ten)" stroke-width="10" fill="none"/>
    ${[418, 434, 450, 466].map((y, i) => `<path d="M60,${y} C260,${y + 2} 420,${y - 2} 720,${y - 8 + i * 4}" stroke="url(#${p}ten)" stroke-width="13" fill="none"/>`).join('')}
    <path d="M60,494 C240,492 420,484 620,472" stroke="#3F2B7C" stroke-width="7" fill="none"/>
    <path d="M60,486 C240,484 420,476 620,462" stroke="#C7303C" stroke-width="10" fill="none"/>
    <path d="M60,516 C240,514 420,508 590,498" stroke="url(#${p}ten)" stroke-width="15" fill="none"/>
    <path d="M100,308 C230,312 340,316 420,314 C470,312 520,314 566,310" stroke="#3E5AA8" stroke-width="5" fill="none"/>
    <path d="${ARTERY}" stroke="#7D0E1C" stroke-width="22" fill="none" stroke-linecap="round"/>
    <path d="${ARTERY}" stroke="#D5202F" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M120,283 C230,291 340,295 420,293 C470,291 520,293 556,291" stroke="#FF9A98" stroke-opacity=".85" stroke-width="4" fill="none" stroke-linecap="round"/>
  </g></g>
  <g mask="url(#${p}mask)"><ellipse cx="370" cy="372" rx="312" ry="180" fill="none" stroke="#5E2527" stroke-opacity=".45" stroke-width="8"/></g>
`;

export const gloveFinger = (p = 'g') => `
  <defs><linearGradient id="${p}n" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3D5DB8"/><stop offset=".35" stop-color="#8FB0F0"/><stop offset=".62" stop-color="#6287DE"/><stop offset="1" stop-color="#2F4A9E"/></linearGradient>
  <filter id="${p}b"><feGaussianBlur stdDeviation="7"/></filter></defs>
  <ellipse cx="6" cy="10" rx="44" ry="20" fill="#000" opacity=".35" filter="url(#${p}b)"/>
  <path d="M-46,-240 C-48,-140 -46,-50 -38,-14 C-28,20 26,20 36,-14 C46,-50 48,-140 46,-240 Z" fill="url(#${p}n)" stroke="#223A85" stroke-width="2"/>
  <path d="M-42,-84 Q0,-70 42,-84 M-44,-150 Q0,-136 44,-150" stroke="#223A85" stroke-opacity=".4" stroke-width="2.5" fill="none"/>
  <path d="M-20,-220 C-22,-140 -20,-70 -14,-24" stroke="#D8E5FF" stroke-opacity=".55" stroke-width="7" fill="none" stroke-linecap="round"/>
`;

// ---------- Ống tiêm khí máu (khung 700×170, mũi kim về bên phải) ----------
export const syringe = (p = 's', {fill = 0.72, liquid = 'blood', bubbles = 0, needle = true} = {}) => {
  const bx = 150, bw = 370, by = 42, bh = 86;
  const fw = bw * fill;
  const lq = liquid === 'blood'
    ? `<linearGradient id="${p}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E0C18"/><stop offset=".3" stop-color="#C9202F"/><stop offset=".7" stop-color="#A31424"/><stop offset="1" stop-color="#5E0813"/></linearGradient>`
    : `<linearGradient id="${p}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9C678"/><stop offset=".5" stop-color="#FBEFB5"/><stop offset="1" stop-color="#C9B56B"/></linearGradient>`;
  const bb = [[0.86, 0.34, 15], [0.74, 0.62, 10], [0.92, 0.7, 8], [0.66, 0.32, 7], [0.81, 0.78, 6]].slice(0, bubbles);
  return `
  <defs>${lq}
    <linearGradient id="${p}gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".22" stop-color="#fff" stop-opacity=".08"/><stop offset=".78" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity=".35"/></linearGradient>
    <linearGradient id="${p}st" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8C98A4"/><stop offset=".45" stop-color="#F4F7FA"/><stop offset="1" stop-color="#6F7A86"/></linearGradient>
    <linearGradient id="${p}pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9D2DA"/><stop offset=".5" stop-color="#F8FAFC"/><stop offset="1" stop-color="#AAB5BF"/></linearGradient>
    <linearGradient id="${p}hub" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E37A1B"/><stop offset=".5" stop-color="#FFB25A"/><stop offset="1" stop-color="#B9590D"/></linearGradient>
    <radialGradient id="${p}bu" cx=".35" cy=".3"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".55" stop-color="#FFD9D9" stop-opacity=".5"/><stop offset="1" stop-color="#FFECEC" stop-opacity=".9"/></radialGradient>
  </defs>
  <rect x="6" y="20" width="16" height="130" rx="6" fill="url(#${p}pl)" stroke="#8591A0" stroke-width="1.5"/>
  <rect x="22" y="72" width="${bx - 22 + (bw - fw) - 10}" height="26" fill="url(#${p}pl)" stroke="#8591A0" stroke-width="1.5"/>
  <rect x="${bx - 18}" y="24" width="18" height="122" rx="6" fill="url(#${p}pl)" stroke="#8591A0" stroke-width="1.5"/>
  <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="#1E2C36" fill-opacity=".35"/>
  <rect x="${bx + bw - fw}" y="${by + 3}" width="${fw}" height="${bh - 6}" fill="url(#${p}l)"/>
  <rect x="${bx + bw - fw - 18}" y="${by + 2}" width="18" height="${bh - 4}" rx="3" fill="#2A3036"/>
  ${bb.map(([u, v, r]) => `<circle cx="${bx + bw * u}" cy="${by + bh * v}" r="${r}" fill="url(#${p}bu)" stroke="#fff" stroke-opacity=".8" stroke-width="1.2"/>`).join('')}
  ${Array.from({length: 11}, (_, i) => `<line x1="${bx + 18 + i * 33}" y1="${by}" x2="${bx + 18 + i * 33}" y2="${by + (i % 5 === 0 ? 24 : 14)}" stroke="#E8EEF2" stroke-opacity=".85" stroke-width="2"/>`).join('')}
  <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="url(#${p}gl)" stroke="#DCE5EB" stroke-opacity=".9" stroke-width="2.5"/>
  <path d="M${bx + bw},${by + 16} L${bx + bw + 30},${by + 28} L${bx + bw + 30},${by + bh - 28} L${bx + bw},${by + bh - 16} Z" fill="url(#${p}pl)" stroke="#8591A0" stroke-width="1.5"/>
  ${needle ? `<path d="M${bx + bw + 30},${by + 26} L${bx + bw + 66},${by + 32} L${bx + bw + 66},${by + bh - 32} L${bx + bw + 30},${by + bh - 26} Z" fill="url(#${p}hub)" stroke="#8F4709" stroke-width="1.5"/>
  <path d="M${bx + bw + 66},${by + bh / 2 - 3} L${bx + bw + 168},${by + bh / 2 - 3} L${bx + bw + 186},${by + bh / 2 + 3} L${bx + bw + 66},${by + bh / 2 + 3} Z" fill="url(#${p}st)" stroke="#5E6873" stroke-width=".8"/>` : ''}
  `;
};

// ---------- Phổi (gốc giữa, cao ~260) ----------
export const lungs = (p = 'l') => `
  <defs>
    <radialGradient id="${p}L" cx=".42" cy=".36" r=".78"><stop offset="0" stop-color="#FFC6BF"/><stop offset=".6" stop-color="#EC8A8C"/><stop offset="1" stop-color="#B84D5C"/></radialGradient>
    <radialGradient id="${p}R" cx=".58" cy=".36" r=".78"><stop offset="0" stop-color="#FFC6BF"/><stop offset=".6" stop-color="#EC8A8C"/><stop offset="1" stop-color="#B84D5C"/></radialGradient>
    <linearGradient id="${p}t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C7D5DC"/><stop offset=".5" stop-color="#F5FAFC"/><stop offset="1" stop-color="#A7B8C2"/></linearGradient>
  </defs>
  <path d="M-16,-92 C-58,-92 -112,-36 -122,40 C-128,88 -102,112 -66,104 C-40,98 -20,84 -16,60 Z" fill="url(#${p}L)" stroke="#8F3345" stroke-width="2"/>
  <path d="M16,-92 C58,-92 112,-36 122,40 C128,88 102,112 66,104 C40,98 20,84 16,60 Z" fill="url(#${p}R)" stroke="#8F3345" stroke-width="2"/>
  <path d="M-30,-58 C-52,-30 -82,0 -116,14 M30,-58 C52,-30 76,-10 108,-6 M30,6 C52,20 78,30 118,30" stroke="#8F3345" stroke-opacity=".55" stroke-width="2.2" fill="none"/>
  <rect x="-13" y="-132" width="26" height="72" rx="6" fill="url(#${p}t)" stroke="#71858F" stroke-width="1.5"/>
  ${[-124, -112, -100, -88, -76].map((y) => `<line x1="-13" x2="13" y1="${y}" y2="${y}" stroke="#71858F" stroke-opacity=".7" stroke-width="2"/>`).join('')}
  <g fill="none" stroke="url(#${p}t)" stroke-linecap="round"><path d="M0,-62 C-14,-46 -28,-34 -46,-22" stroke-width="12"/><path d="M0,-62 C14,-46 28,-34 46,-22" stroke-width="12"/>
  <path d="M-46,-22 C-60,-8 -72,0 -88,6 M-46,-22 C-50,6 -56,28 -70,56 M46,-22 C60,-8 72,0 88,6 M46,-22 C50,6 56,28 70,56" stroke-width="5"/></g>
`;

export const drop = (p = 'd', c1 = '#FF6B76', c2 = '#C81E32', c3 = '#7C0D1E') => `
  <defs><radialGradient id="${p}r" cx=".38" cy=".52" r=".72"><stop offset="0" stop-color="${c1}"/><stop offset=".55" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></radialGradient></defs>
  <path d="M0,-82 C24,-44 64,-8 64,30 C64,68 34,90 0,90 C-34,90 -64,68 -64,30 C-64,-8 -24,-44 0,-82 Z" fill="url(#${p}r)" stroke="${c3}" stroke-width="2"/>
  <path d="M-34,30 C-36,6 -22,-14 -8,-30" stroke="#fff" stroke-opacity=".7" stroke-width="8" fill="none" stroke-linecap="round"/>
`;

// Đồng hồ toan kiềm: kim do Remotion xoay, gốc tại (0,0)
export const gaugeBase = (p = 'x') => `
  <defs><linearGradient id="${p}a" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E5484D"/><stop offset=".42" stop-color="#3FB27F"/><stop offset=".58" stop-color="#3FB27F"/><stop offset="1" stop-color="#3A7BE0"/></linearGradient></defs>
  <path d="M-100,0 A100,100 0 0 1 100,0" fill="none" stroke="#D5DCE0" stroke-width="30" stroke-linecap="round"/>
  <path d="M-100,0 A100,100 0 0 1 100,0" fill="none" stroke="url(#${p}a)" stroke-width="24" stroke-linecap="round"/>
  <circle r="14" fill="#25343D"/>
`;

export const hourglass = (p = 'h', sand = 0) => {
  const top = -74 + 62 * sand;
  const bot = 92 - 62 * sand;
  const hw = 46 * (1 - sand * 0.86);
  return `
  <defs>
    <linearGradient id="${p}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B07A43"/><stop offset=".5" stop-color="#E8BE85"/><stop offset="1" stop-color="#8A5A2C"/></linearGradient>
    <linearGradient id="${p}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#DDEFF5" stop-opacity=".78"/><stop offset=".3" stop-color="#fff" stop-opacity=".2"/><stop offset=".78" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#BCD9E4" stop-opacity=".6"/></linearGradient>
    <linearGradient id="${p}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D88F2A"/><stop offset=".5" stop-color="#F7C15E"/><stop offset="1" stop-color="#C47C1E"/></linearGradient>
  </defs>
  <path d="M${-hw},${top} L${hw},${top} C${hw * 0.72},${-22} 8,-10 3,-2 L-3,-2 C-8,-10 ${-hw * 0.72},${-22} ${-hw},${top} Z" fill="url(#${p}s)"/>
  <path d="M0,${bot} C${30 * sand + 6},${bot + 18} ${48 * sand + 4},92 ${48 * sand + 4},96 L${-48 * sand - 4},96 C${-48 * sand - 4},92 ${-30 * sand - 6},${bot + 18} 0,${bot} Z" fill="url(#${p}s)"/>
  <rect x="-1.5" y="-2" width="3" height="${bot + 2}" fill="#F0B24F" opacity="${sand > 0.02 && sand < 0.98 ? 1 : 0}"/>
  <path d="M-58,-92 C-58,-40 -14,-22 -11,0 C-14,22 -58,40 -58,96 L58,96 C58,40 14,22 11,0 C14,-22 58,-40 58,-92 Z" fill="url(#${p}g)" stroke="#DCEBF1" stroke-width="2.5"/>
  <rect x="-76" y="-112" width="152" height="22" rx="8" fill="url(#${p}w)" stroke="#6E461F" stroke-width="1.5"/>
  <rect x="-76" y="94" width="152" height="22" rx="8" fill="url(#${p}w)" stroke="#6E461F" stroke-width="1.5"/>
`;
};

// Tế bào máu đang chuyển hoá
export const rbc = (p = 'r') => `
  <defs><radialGradient id="${p}c"><stop offset="0" stop-color="#8C1020"/><stop offset=".42" stop-color="#B51C2E"/><stop offset=".78" stop-color="#E64A55"/><stop offset="1" stop-color="#A81828"/></radialGradient></defs>
  <circle r="38" fill="url(#${p}c)" stroke="#6E0C18" stroke-width="1.5"/>
`;
export const wbc = (p = 'b') => `
  <defs><radialGradient id="${p}c" cx=".4" cy=".35"><stop offset="0" stop-color="#FAF3FF"/><stop offset="1" stop-color="#C9B6E6"/></radialGradient></defs>
  <circle r="42" fill="url(#${p}c)" stroke="#7C60A8" stroke-width="2"/>
  <path d="M-20,-12 C-30,-26 -6,-30 2,-18 C14,-30 30,-14 18,-2 C30,12 12,26 2,14 C-8,28 -30,16 -20,2 C-26,-2 -26,-8 -20,-12 Z" fill="#6E4AA5"/>
`;

// Phiếu in nhiệt, mép dưới răng cưa
export const slip = (p = 'p', w = 480, h = 520) => {
  const teeth = Array.from({length: Math.round(w / 24)}, (_, i) => `L${w - (i + 0.5) * 24},${h + 10} L${w - (i + 1) * 24},${h}`).join(' ');
  return `
  <defs><linearGradient id="${p}pp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E8EBEA"/></linearGradient>
  <filter id="${p}b" x="-15%" y="-15%" width="130%" height="135%"><feGaussianBlur stdDeviation="16"/></filter></defs>
  <path d="M0,0 L${w},0 L${w},${h} ${teeth} Z" transform="translate(8,18)" fill="#000" opacity=".45" filter="url(#${p}b)"/>
  <path d="M0,0 L${w},0 L${w},${h} ${teeth} Z" fill="url(#${p}pp)"/>
  ${Array.from({length: 26}, (_, i) => `<rect x="${w - 140 + i * 4.6}" y="24" width="${[2, 3, 1.5][i % 3]}" height="30" fill="#25343D"/>`).join('')}
`;
};
