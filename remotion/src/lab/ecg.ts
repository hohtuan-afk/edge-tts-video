// Tổng hợp sóng ECG theo mô hình tổng các Gaussian (cảm hứng từ ECGSYN – McSharry 2003). Đơn vị: mV, giây.
export type Lead = {p?: number; q?: number; r?: number; s?: number; t?: number; tw?: number; tPos?: number; st?: number};
export const NORMAL: Lead = {p: 0.12, q: -0.08, r: 1.1, s: -0.25, t: 0.3, tw: 0.055, tPos: 0.27, st: 0};

const g = (x: number, mu: number, w: number, a: number) => a * Math.exp(-((x - mu) ** 2) / (2 * w * w));
const sig = (x: number) => 1 / (1 + Math.exp(-x));

// tr: thời gian so với đỉnh R (giây)
export const beatV = (tr: number, L: Lead) => {
  const p = {...NORMAL, ...L};
  const stw = sig((tr - 0.045) / 0.006) * (1 - sig((tr - (p.tPos! + 0.02)) / 0.035));
  return (
    g(tr, -0.17, 0.032, p.p!) + g(tr, -0.034, 0.011, p.q!) + g(tr, 0, 0.011, p.r!) + g(tr, 0.03, 0.012, p.s!) +
    g(tr, p.tPos!, p.tw!, p.t!) + p.st! * stw
  );
};
// tín hiệu liên tục, nhịp đều RR giây; đỉnh R ở 35% chu kỳ
export const ecgAt = (T: number, L: Lead, rr = 0.8, off = 0) => {
  const x = ((((T + off) % rr) + rr) % rr) - rr * 0.35;
  return beatV(x, L);
};

// Các kiểu mẫu theo giai đoạn
export const STAGE: Record<string, Lead> = {
  normal: {},
  hyper: {t: 0.85, tw: 0.07, tPos: 0.25},
  stemi: {st: 0.28, t: 0.55, tw: 0.08, tPos: 0.25},
  qwave: {q: -0.45, r: 0.35, s: -0.1, st: 0.12, t: 0.3},
  tinv: {q: -0.45, r: 0.35, s: -0.1, st: 0, t: -0.32, tw: 0.07},
};

// 12 chuyển đạo — mẫu nhồi máu thành dưới (RCA): ST↑ II, III, aVF (III > II), soi gương aVL, I
export const INFERIOR: Record<string, Lead> = {
  I: {r: 0.55, s: -0.1, st: -0.06, t: 0.12},
  II: {r: 1.0, s: -0.2, st: 0.24, t: 0.5, tw: 0.08},
  III: {r: 0.8, s: -0.15, st: 0.3, t: 0.6, tw: 0.08},
  aVR: {p: -0.1, q: 0.05, r: -0.7, s: 0.1, st: -0.05, t: -0.2},
  aVL: {r: 0.35, s: -0.25, st: -0.15, t: -0.18},
  aVF: {r: 0.9, s: -0.18, st: 0.27, t: 0.55, tw: 0.08},
  V1: {r: 0.2, s: -0.9, t: 0.1},
  V2: {r: 0.4, s: -1.2, t: 0.4},
  V3: {r: 0.75, s: -0.8, t: 0.4},
  V4: {r: 1.2, s: -0.45, t: 0.4},
  V5: {r: 1.15, s: -0.25, t: 0.35},
  V6: {r: 0.9, s: -0.15, t: 0.3},
};
export const LAYOUT = [['I', 'aVR', 'V1', 'V4'], ['II', 'aVL', 'V2', 'V5'], ['III', 'aVF', 'V3', 'V6']];

// Chuỗi điểm polyline cho đoạn tín hiệu [t0, t0+dur] vẽ trong khung (x, y0 đường đẳng điện), px/giây, px/mV
export const tracePts = (x: number, y0: number, t0: number, dur: number, pxs: number, pxmv: number, L: Lead, rr = 0.8, step = 0.004, off = 0) => {
  const pts: string[] = [];
  for (let tt = 0; tt <= dur + 1e-9; tt += step) pts.push(`${(x + tt * pxs).toFixed(1)},${(y0 - ecgAt(t0 + tt, L, rr, off) * pxmv).toFixed(1)}`);
  return pts.join(' ');
};
