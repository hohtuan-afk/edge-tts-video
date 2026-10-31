// BÀI 7: NHỊP NHANH QRS HẸP TRÊN ĐIỆN TÂM ĐỒ — ĐỀU HAY KHÔNG, P Ở ĐÂU · ĐỀU? – P Ở ĐÂU? – RP DÀI HAY NGẮN?
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import data from '../data.json';
import keys from './tachy_keys.json';
import stations from './tachy_stations.json';
import {TimeMap, CapCtx, FONT, useT} from '../lib';
import {Caption, Progress} from '../Main';
import {MONO} from './Lab';
import {Fade, SeriesTag} from './Demo';
import {Heart6} from '../wb/heart6';
import {HAND} from '../wb/wb';
import {beatV, Lead} from './ecg';
import {Memo, Card, Head, DeskBg, ap, dp, useBeat, PEN, Branches} from './Bundle';
import {Strip, Frame} from './Infarct';

const C1 = '#22C55E', C2 = '#F59E0B', C3 = '#06B6D4', CF = '#DC2626', CP = '#8B5CF6', CB = '#2563EB';
const gs = (x: number, mu: number, w: number, a: number) => a * Math.exp(-((x - mu) ** 2) / (2 * w * w));

// ===== bộ tạo tín hiệu: danh sách R + sóng P tự đặt + đường nền =====
type PW = {t: number; a: number; w?: number};
const mk = (Rs: number[], L: Lead, Ps: PW[] = [], base?: (T: number) => number) => (T: number) => {
  let v = base ? base(T) : 0;
  for (const r of Rs) if (Math.abs(T - r) < 0.6) v += beatV(T - r, {...L, p: 0});
  for (const p of Ps) if (Math.abs(T - p.t) < 0.2) v += gs(T, p.t, p.w ?? 0.022, p.a);
  return v;
};
const reg = (t0: number, rr: number, n: number) => Array.from({length: n}, (_, i) => t0 + i * rr);
const QRS: Lead = {q: -0.06, r: 1.1, s: -0.25, t: 0.28, tw: 0.045, tPos: 0.2};
// rung nhĩ
const AF_R = [0.18, 0.55, 0.78, 1.25, 1.52, 1.95, 2.13, 2.62, 2.95, 3.22, 3.71, 3.96, 4.42, 4.7, 5.12, 5.33, 5.8, 6.2, 6.43, 6.9, 7.2, 7.62, 7.85];
const fwav = (T: number) => 0.05 * Math.sin(2 * Math.PI * 6.3 * T) + 0.035 * Math.sin(2 * Math.PI * 8.9 * T + 1.3) + 0.02 * Math.sin(2 * Math.PI * 11.7 * T + 0.4);
const AF = mk(AF_R, {...QRS, t: 0.18}, [], fwav);
// nhịp nhanh nhĩ đa ổ: 3 dạng P
const MAT_R = [0.3, 0.78, 1.18, 1.7, 2.12, 2.55, 3.05, 3.45, 3.95, 4.38, 4.9, 5.32, 5.78, 6.25, 6.7, 7.15];
const MAT_P: PW[] = MAT_R.map((r, i) => {
  const k = i % 3;
  return k === 0 ? {t: r - 0.16, a: 0.18, w: 0.02} : k === 1 ? {t: r - 0.12, a: -0.14, w: 0.018} : {t: r - 0.2, a: 0.26, w: 0.03};
});
const MAT = mk(MAT_R, {...QRS, t: 0.22}, MAT_P);
// cuồng nhĩ 2:1 (F 300/phút → chu kỳ 0,2 s; thất 150/phút)
const saw = (T: number, ph = 0) => {const x = (((T + ph) / 0.2) % 1 + 1) % 1; return x < 0.75 ? -x / 0.75 : -1 + (x - 0.75) / 0.25 * 1;};
const FL_R = reg(0.12, 0.4, 20);
const FL_II = mk(FL_R, {...QRS, r: 0.8, t: 0.0, tw: 0.04}, [], (T) => 0.26 * (saw(T, 0.05) + 0.5));
const FL_V1 = mk(FL_R, {q: 0, r: 0.25, s: -0.9, t: 0.0}, [], (T) => {const x = (((T + 0.05) / 0.2) % 1 + 1) % 1; return gs(x, 0.5, 0.09, 0.18);});
// RP / PR: nhịp đều 150, P ngược sau QRS
const RP_R = reg(0.15, 0.4, 20);
const RPS = mk(RP_R, QRS, RP_R.map((r) => ({t: r + 0.14, a: -0.14, w: 0.02})));
const RPL = mk(RP_R, QRS, RP_R.map((r) => ({t: r + 0.29, a: -0.14, w: 0.02})));
// vòng vào lại nút: 180/phút, P lẩn cuối QRS
const AV_R = reg(0.15, 0.333, 24);
const AVN_V1 = mk(AV_R, {q: 0, r: 0.25, s: -0.9, t: 0.25, tPos: 0.2}, AV_R.map((r) => ({t: r + 0.06, a: 0.16, w: 0.011})));
const AVN_II = mk(AV_R, QRS, AV_R.map((r) => ({t: r + 0.06, a: -0.18, w: 0.012})));
const SINUS = mk(reg(0.2, 0.5, 20), QRS, reg(0.2, 0.5, 20).map((r) => ({t: r - 0.15, a: 0.15, w: 0.022})));

// ===== thanh trạm =====
const ST7 = ['NGUYÊN TẮC', 'ĐỀU HAY KHÔNG', 'CUỒNG NHĨ', 'P Ở ĐÂU · RP', 'NHỊP NHANH XOANG', 'KHI KHÓ', 'ÔN TẬP'];
const STC = ['#64748B', '#22C55E', '#DC2626', '#8B5CF6', '#2563EB', '#F59E0B', '#06B6D4'];
const StationBar7: React.FC = () => {
  const f = useCurrentFrame();
  const idx = data.scenes.findIndex((s) => f >= s.from && f < s.from + s.dur);
  const cur = idx >= 0 ? (stations as number[])[idx] : 0;
  if (!cur) return null;
  return (
    <div style={{position: 'absolute', right: 22, top: 6, display: 'flex', gap: 6, alignItems: 'center', padding: '5px 8px', borderRadius: 12, background: 'rgba(8,12,18,0.78)', border: '1px solid rgba(255,255,255,0.14)', fontFamily: FONT}}>
      {ST7.map((n, i) => {
        const on = i + 1 === cur, past = i + 1 < cur;
        return on ? (
          <div key={n} style={{display: 'flex', alignItems: 'center', gap: 8, padding: '3px 14px 3px 4px', borderRadius: 16, background: STC[i]}}>
            <span style={{width: 24, height: 24, borderRadius: 12, background: 'rgba(0,0,0,0.25)', color: '#fff', fontSize: 16, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</span>
            <span style={{fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: 1}}>{n}</span>
          </div>
        ) : (
          <span key={n} style={{width: 24, height: 24, borderRadius: 12, border: `2px solid ${past ? STC[i] : 'rgba(255,255,255,0.25)'}`, background: past ? STC[i] + '55' : 'transparent', color: past ? '#fff' : 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</span>
        );
      })}
    </div>
  );
};
const Lbl: React.FC<{x: number; y: number; a: number; c: string; size?: number; children: React.ReactNode}> = ({x, y, a, c, size = 34, children}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: HAND, fontSize: size, color: c, opacity: a}}>{children}</div>
);
const Q3: React.FC<{x: number; y: number; a: number; hi?: number; size?: number}> = ({x, y, a, hi = -1, size = 38}) => (
  <div style={{position: 'absolute', left: x, top: y, display: 'flex', gap: 14, opacity: a}}>
    {[['1', 'ĐỀU?', C1], ['2', 'P Ở ĐÂU?', C2], ['3', 'RP DÀI HAY NGẮN?', C3]].map(([n, s, c], i) => (
      <div key={n} style={{padding: '10px 22px', borderRadius: 18, border: `3px solid ${c}`, background: i === hi ? c : 'rgba(255,255,255,0.06)', fontFamily: FONT, fontSize: size, fontWeight: 900, color: i === hi ? '#0B1218' : c}}>{n}. {s}</div>
    ))}
  </div>
);
// monitor ICU
const Monitor: React.FC<{x: number; y: number; w: number; h: number; f: (T: number) => number; a: number; hr: string; label?: string; speed?: number}> = ({x, y, w, h, f, a, hr, label = 'II', speed = 1}) => {
  const rt = useCurrentFrame() / 30;
  const q = 9, pxs = 25 * q, win = (w - 200) / pxs, B = h * 0.6;
  const head = (rt * speed) % win;
  const pts: string[] = [];
  for (let T = 0; T <= win; T += 0.003) {
    if (Math.abs(T - head) < 0.06) continue;
    const tt = T <= head ? rt * speed - (head - T) : rt * speed - (head - T) - win;
    pts.push(`${(20 + T * pxs).toFixed(1)},${(B - f(((tt % 6) + 6) % 6) * 10 * q).toFixed(1)}`);
  }
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 20, background: '#050B0A', border: '3px solid #1F2937', overflow: 'hidden', opacity: a, boxShadow: '0 20px 40px rgba(0,0,0,0.5)'}}>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
        <text x={20} y={36} fontFamily={MONO} fontSize={24} fill="#4ADE80">{label}</text>
        <polyline points={pts.join(' ')} fill="none" stroke="#4ADE80" strokeWidth={3.5} strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 6px #22C55E)'}} />
        <text x={w - 30} y={h / 2 + 10} textAnchor="end" fontFamily={MONO} fontSize={72} fontWeight={700} fill="#4ADE80">{hr}</text>
        <text x={w - 30} y={h / 2 - 50} textAnchor="end" fontFamily={MONO} fontSize={22} fill="#4ADE80">HR</text>
      </svg>
    </div>
  );
};

// ================= 0 · BÌA =================
const Cover: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 40%, #0F2A22, #0B1218 72%)'}}>
      <div style={{position: 'absolute', left: 110, top: 120, fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: 4, color: '#5EEAD4', opacity: ap(t, 0.2)}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 7</div>
      <div style={{position: 'absolute', left: 106, top: 166, fontFamily: FONT, fontSize: 84, fontWeight: 800, lineHeight: 1.06, color: '#F8FAFC', opacity: ap(t, 0.4)}}>
        Nhịp nhanh <span style={{color: '#4ADE80'}}>QRS hẹp</span>
      </div>
      <div style={{position: 'absolute', left: 112, top: 270, fontFamily: FONT, fontSize: 36, fontWeight: 700, color: '#CBD5E1', opacity: ap(t, 0.8)}}>trên điện tâm đồ · <span style={{color: '#FDE047'}}>Đều hay không, P ở đâu</span></div>
      <Q3 x={110} y={350} a={ap(t, 2)} size={36} />
      <Monitor x={110} y={480} w={1700} h={330} f={AVN_II} a={ap(t, 0)} hr="180" />
      <div style={{position: 'absolute', left: 112, top: 840, fontFamily: FONT, fontSize: 20, color: '#94A3B8', opacity: ap(t, 1)}}>Nguồn: 2019 ESC SVT Guidelines · 2015 ACC/AHA/HRS SVT · 2024 ESC AF · 2023 ACC/AHA/ACCP/HRS AF · EHRA atrial tachycardia 2025 · LITFL</div>
    </AbsoluteFill>
  );
};

// ================= 1 · NGUYÊN TẮC =================
const Principle: React.FC = () => {
  const t = useT();
  const beat = useBeat();
  const rt = useCurrentFrame() / 30;
  const f1 = (T: number) => beatV(T, {...QRS, p: 0.15});
  return (
    <DeskBg>
      <Head t={t}>QRS hẹp → nhịp TRÊN thất</Head>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="pr7" x={20} y={130} s={1.05} prog={1} art={1} labels={false} beat={beat} />
        <Branches x={20} y={130} s={1.05} a={ap(t, 2)} flow={((rt % 1.2) / 1.2) * 1.2} />
      </svg>
      <div style={{position: 'absolute', left: 120, top: 200, padding: '8px 18px', borderRadius: 14, background: C1, color: '#0B1218', fontFamily: FONT, fontSize: 26, fontWeight: 900, opacity: ap(t, 4)}}>nguồn nhịp ở TRÊN: xoang · nhĩ · nút</div>
      <Card x={640} y={140} w={600} a={ap(t, 0)} c={CF} title="Nhịp nhanh: > 100 lần/phút" />
      <Frame x={640} y={260} a={ap(t, 2)}>
        <Strip L={f1} w={600} h={320} q={18} base={0.62} t0={-0.25} stroke={5}>
          {(X, Y) => <g opacity={ap(t, 2.4)}><path d={`M${X(-0.04)},${Y(0) + 36} v14 H${X(0.045)} v-14`} fill="none" stroke={CF} strokeWidth={5} /><text x={X(0) + 120} y={Y(0) + 56} textAnchor="middle" fontFamily={MONO} fontSize={30} fontWeight={700} fill={CF}>QRS &lt; 0,12 s</text></g>}
        </Strip>
      </Frame>
      <Card x={1290} y={140} w={570} a={ap(t, 2)} c={C1} title="QRS hẹp">thất khử cực qua đường dẫn truyền bình thường</Card>
      <div style={{position: 'absolute', left: 1290, top: 320, width: 570, opacity: ap(t, 6)}}>
        {[['1', 'ĐỀU?', C1], ['2', 'P Ở ĐÂU?', C2], ['3', 'RP DÀI HAY NGẮN?', C3]].map(([n, s, c], i) => (
          <div key={n} style={{marginBottom: 14, padding: '14px 22px', borderRadius: 16, border: `3px solid ${c}`, background: 'rgba(255,255,255,0.06)', fontFamily: FONT, fontSize: 40, fontWeight: 900, color: c, opacity: ap(t, 6 + i * 0.3)}}>{n}. {s}</div>
        ))}
      </div>
      <Memo x={640} y={640} w={600} a={ap(t, 4.4)}>QRS hẹp + nhanh → <span style={{color: '#15803D'}}>TRÊN thất</span></Memo>
    </DeskBg>
  );
};

// ================= 2 · RUNG NHĨ =================
const AFScene: React.FC = () => {
  const t = useT();
  const q = 9, t0 = 0;
  return (
    <DeskBg>
      <Head t={t}>Đều hay không? — đo RR</Head>
      <Q3 x={620} y={62} a={ap(t, -1)} hi={0} size={26} />
      <Frame x={60} y={140} a={ap(t, 0)}>
        <Strip L={AF} w={1800} h={330} q={q} base={0.62} t0={t0} label="II" stroke={3.5}>
          {(X, Y) => (
            <g opacity={ap(t, 0.4)}>
              {AF_R.slice(0, 8).map((r, i) => {
                const r2 = AF_R[i + 1];
                const y = 40 + (i % 2) * 34;
                return <g key={i}><path d={`M${X(r)},${y + 14} v-14 H${X(r2)} v14`} fill="none" stroke={i % 2 ? CB : CF} strokeWidth={4} /><text x={(X(r) + X(r2)) / 2} y={y - 6} textAnchor="middle" fontFamily={MONO} fontSize={20} fontWeight={700} fill={i % 2 ? CB : CF}>{Math.round((r2 - r) * 1000)}</text></g>;
              })}
            </g>
          )}
        </Strip>
      </Frame>
      <Lbl x={60} y={480} a={ap(t, 1)} c="#FCA5A5">RR mỗi nhát mỗi khác → không đều HOÀN TOÀN</Lbl>
      <Frame x={60} y={560} a={ap(t, 4)} c={C1}>
        <Strip L={(T) => fwav(T) * 2.2} w={900} h={260} q={14} base={0.5} t0={0} label="phóng to đường nền ×2" stroke={4} />
      </Frame>
      <Lbl x={980} y={600} a={ap(t, 4.4)} c="#86EFAC">sóng f lăn tăn, không đều, không có hình dạng cố định</Lbl>
      <Card x={980} y={560 + 100} w={880} a={ap(t, 2)} c={CF} title="Không đều hoàn toàn + không P → RUNG NHĨ" />
      <Card x={980} y={780} w={880} a={ap(t, 6)} c="#475569" title="Tần số thất thay đổi liên tục · QRS vẫn hẹp" />
    </DeskBg>
  );
};

// ================= 3 · NHỊP NHANH NHĨ ĐA Ổ =================
const MATScene: React.FC = () => {
  const t = useT();
  return (
    <DeskBg>
      <Head t={t}>Không đều nhưng CÓ sóng P</Head>
      <Frame x={60} y={140} a={ap(t, 0)}>
        <Strip L={MAT} w={1800} h={320} q={10} base={0.62} t0={0} label="II" stroke={3.5}>
          {(X, Y) => <g opacity={ap(t, 2)}>{MAT_P.slice(0, 9).map((p, i) => <g key={i}><circle cx={X(p.t)} cy={Y(p.a) - (p.a > 0 ? 22 : -22)} r={18} fill={[CF, CB, C2][i % 3]} /><text x={X(p.t)} y={Y(p.a) - (p.a > 0 ? 22 : -22) + 7} textAnchor="middle" fontFamily={FONT} fontSize={20} fontWeight={900} fill="#fff">{(i % 3) + 1}</text></g>)}</g>}
        </Strip>
      </Frame>
      <Card x={60} y={500} w={880} a={ap(t, 2)} c={CP} title="Nhịp nhanh nhĩ đa ổ">≥ 3 hình dạng P khác nhau · PR, RR thay đổi · hay gặp ở bệnh phổi</Card>
      <Tag7 x={980} y={500} a={ap(t, 4)} c="#FCA5A5">Cuồng nhĩ dẫn truyền thay đổi:</Tag7>
      <Frame x={980} y={550} a={ap(t, 4)} c={CF}><Strip L={mk([0.12, 0.52, 1.12, 1.52, 1.92, 2.52, 2.92], {...QRS, t: 0}, [], (T) => 0.16 * (saw(T, 0.05) + 0.5))} w={880} h={230} q={9} base={0.6} t0={0} label="II" /></Frame>
      <Memo x={60} y={680} w={880} a={ap(t, 4.4)}>Không đều + thấy sóng F → <span style={{color: PEN}}>cuồng nhĩ</span></Memo>
    </DeskBg>
  );
};
const Tag7: React.FC<{x: number; y: number; a: number; c: string; children: React.ReactNode}> = ({x, y, a, c, children}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: FONT, fontSize: 30, fontWeight: 900, color: c, opacity: a}}>{children}</div>
);

// ================= 4 · CUỒNG NHĨ =================
const Flutter: React.FC = () => {
  const t = useT();
  return (
    <DeskBg>
      <Head t={t}>Cuồng nhĩ — sóng F răng cưa</Head>
      <Frame x={60} y={140} a={ap(t, 0)} c={CF}>
        <Strip L={FL_II} w={1200} h={300} q={12} base={0.55} t0={0} label="II" stroke={4}>
          {(X, Y) => <g opacity={ap(t, 4)}>{[0, 1, 2, 3, 4, 5, 6, 7].map((k) => {const tt = 0.105 + k * 0.2; return <text key={k} x={X(tt)} y={Y(-0.2) + 46} textAnchor="middle" fontFamily={FONT} fontSize={26} fontWeight={900} fill={CF}>F</text>;})}</g>}
        </Strip>
      </Frame>
      <Frame x={60} y={470} a={ap(t, 4)} c={CB}>
        <Strip L={FL_V1} w={1200} h={260} q={12} base={0.5} t0={0} label="V1" stroke={4} />
      </Frame>
      <Lbl x={70} y={740} a={ap(t, 4.4)} c="#FCA5A5">F ÂM ở II, III, aVF · F DƯƠNG ở V1 (điển hình)</Lbl>
      <div style={{position: 'absolute', left: 1300, top: 140, width: 560, fontFamily: FONT, opacity: ap(t, 2)}}>
        <div style={{padding: '18px 24px', borderRadius: 16, background: '#FCFAF4', borderLeft: `12px solid ${CF}`}}>
          <div style={{fontSize: 24, fontWeight: 800, color: '#64748B'}}>tần số nhĩ</div>
          <div style={{fontSize: 46, fontWeight: 900, color: CF}}>~ 300 /phút</div>
          <div style={{fontSize: 22, fontWeight: 700, color: '#475569'}}>(250 – 350)</div>
        </div>
        <div style={{marginTop: 16, padding: '18px 24px', borderRadius: 16, background: '#FCFAF4', borderLeft: `12px solid ${CB}`, opacity: ap(t, 6)}}>
          <div style={{fontSize: 24, fontWeight: 800, color: '#64748B'}}>dẫn 2:1 → tần số thất</div>
          <div style={{fontSize: 46, fontWeight: 900, color: CB}}>~ 150 /phút, đều</div>
        </div>
      </div>
      <Memo x={1300} y={560} w={560} a={ap(t, 8)}>Đều ~ 150 → luôn <span style={{color: PEN}}>TÌM sóng F</span> (lẩn trong QRS, T)</Memo>
    </DeskBg>
  );
};

// ================= 5 · P Ở ĐÂU · RP =================
const RPScene: React.FC = () => {
  const t = useT();
  const q = 20;
  return (
    <DeskBg>
      <Head t={t}>P ở đâu? — khoảng RP và PR</Head>
      <Q3 x={700} y={62} a={ap(t, -1)} hi={1} size={26} />
      <Tag7 x={60} y={130} a={ap(t, 0)} c="#C4B5FD">RP NGẮN (RP &lt; PR)</Tag7>
      <Frame x={60} y={180} a={ap(t, 0)}>
        <Strip L={RPS} w={880} h={420} q={q} base={0.6} t0={0} label="II" stroke={5}>
          {(X, Y) => (
            <g>
              <g opacity={ap(t, 2)}>
                <path d={`M${X(0.15)},${Y(0) + 80} v14 H${X(0.29)} v-14`} fill="none" stroke={CF} strokeWidth={5} /><text x={X(0.22)} y={Y(0) + 128} textAnchor="middle" fontFamily={MONO} fontSize={28} fontWeight={700} fill={CF}>RP</text>
                <path d={`M${X(0.29)},${Y(0) + 80} v14 H${X(0.55)} v-14`} fill="none" stroke={CB} strokeWidth={5} /><text x={X(0.42)} y={Y(0) + 128} textAnchor="middle" fontFamily={MONO} fontSize={28} fontWeight={700} fill={CB}>PR</text>
              </g>
              <g opacity={ap(t, 6)}><circle cx={X(0.29)} cy={Y(-0.14)} r={20} fill="none" stroke={CP} strokeWidth={5} /><text x={X(0.29)} y={Y(-0.14) + 56} textAnchor="middle" fontFamily={HAND} fontSize={32} fill={CP}>P âm</text></g>
            </g>
          )}
        </Strip>
      </Frame>
      <Tag7 x={980} y={130} a={ap(t, 4)} c="#C4B5FD">RP DÀI (RP &gt; PR)</Tag7>
      <Frame x={980} y={180} a={ap(t, 4)}>
        <Strip L={RPL} w={880} h={420} q={q} base={0.6} t0={0} label="II" stroke={5}>
          {(X, Y) => <g opacity={ap(t, 4.4)}><path d={`M${X(0.15)},${Y(0) + 80} v14 H${X(0.44)} v-14`} fill="none" stroke={CF} strokeWidth={5} /><text x={X(0.3)} y={Y(0) + 128} textAnchor="middle" fontFamily={MONO} fontSize={28} fontWeight={700} fill={CF}>RP</text><path d={`M${X(0.44)},${Y(0) + 80} v14 H${X(0.55)} v-14`} fill="none" stroke={CB} strokeWidth={5} /><text x={X(0.5)} y={Y(0) + 128} textAnchor="middle" fontFamily={MONO} fontSize={28} fontWeight={700} fill={CB}>PR</text></g>}
        </Strip>
      </Frame>
      <Card x={60} y={640} w={880} a={ap(t, 2)} c={CF} title="RP: R → P ngay sau · PR: P → R kế tiếp" />
      <Card x={980} y={640} w={880} a={ap(t, 6)} c={CP} title="P ÂM ở II, III, aVF → nhĩ khử cực NGƯỢC" />
    </DeskBg>
  );
};

// ================= 6 · VÒNG VÀO LẠI NÚT =================
const AVNRT: React.FC = () => {
  const t = useT();
  const q = 16;
  return (
    <DeskBg>
      <Head t={t}>RP rất ngắn → vòng vào lại nút nhĩ thất</Head>
      <Frame x={60} y={140} a={ap(t, 0)} c={C3}>
        <Strip L={AVN_V1} w={880} h={380} q={q} base={0.55} t0={0} label="V1" stroke={5}>
          {(X, Y) => <g opacity={ap(t, 4)}>{[0.15, 0.483].map((r) => <circle key={r} cx={X(r + 0.06)} cy={Y(0.12)} r={20} fill="none" stroke={CF} strokeWidth={5} />)}<text x={X(0.21) + 30} y={Y(0.12) - 30} fontFamily={HAND} fontSize={36} fill={CF}>r′ giả</text></g>}
        </Strip>
      </Frame>
      <Frame x={980} y={140} a={ap(t, 0.3)} c={C3}>
        <Strip L={AVN_II} w={880} h={380} q={q} base={0.6} t0={0} label="II" stroke={5}>
          {(X, Y) => <g opacity={ap(t, 4.3)}>{[0.15, 0.483].map((r) => <circle key={r} cx={X(r + 0.06)} cy={Y(-0.2)} r={20} fill="none" stroke={CF} strokeWidth={5} />)}<text x={X(0.21) + 30} y={Y(-0.2) + 60} fontFamily={HAND} fontSize={36} fill={CF}>S giả</text></g>}
        </Strip>
      </Frame>
      <Card x={60} y={560} w={880} a={ap(t, 0)} c={C3} title="RP < 90 ms, hoặc không thấy P" />
      <Card x={60} y={680} w={880} a={ap(t, 2)} c="#475569" title="P lẩn trong QRS / ngay cuối QRS" />
      <Card x={980} y={560} w={880} a={ap(t, 4)} c={CF} title="r′ giả ở V1 · S giả ở II, III, aVF" />
      <Memo x={980} y={690} w={880} a={ap(t, 6)}>Dạng THƯỜNG GẶP NHẤT của nhịp nhanh trên thất kịch phát</Memo>
    </DeskBg>
  );
};

const SCN: React.FC[] = [Cover, Principle, AFScene, MATScene, Flutter, RPScene, AVNRT];
export const TACHY_N = 7;
export const Tachy: React.FC = () => (
  <AbsoluteFill style={{background: '#0E1116', fontFamily: FONT}}>
    <Audio src={staticFile('narration.m4a')} />
    <CapCtx.Provider value={false}>
      {data.scenes.slice(0, Math.min(SCN.length, data.scenes.length)).map((s, i) => {
        const Comp = SCN[i];
        const map: [number, number][] = s.sents.map((x, j) => [x.start, (keys as number[][])[i][j]]);
        return (
          <Sequence key={i} from={s.from} durationInFrames={s.dur}>
            <Fade dur={s.dur}>
              <TimeMap.Provider value={map}><Comp /></TimeMap.Provider>
            </Fade>
          </Sequence>
        );
      })}
    </CapCtx.Provider>
    <SeriesTag sub="Nhịp nhanh QRS hẹp · Đều hay không, P ở đâu" />
    <StationBar7 />
    <Caption />
    <Progress />
  </AbsoluteFill>
);
export {mk, reg, QRS, AF, MAT, FL_II, FL_V1, RPS, RPL, AVN_V1, AVN_II, SINUS, Monitor, Q3, Lbl, Tag7, saw, gs};
void dp;
