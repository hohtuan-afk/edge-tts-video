// BÀI 6: NHỒI MÁU CƠ TIM KHI ĐIỆN TÂM ĐỒ KHÔNG ĐIỂN HÌNH — CÁC DẠNG GỢI Ý TẮC MẠCH CẤP VÀ TIÊU CHUẨN SGARBOSSA
// Thần chú: KHÔNG CHÊNH ≠ KHÔNG TẮC
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import data from '../data.json';
import keys from './occl_keys.json';
import stations from './occl_stations.json';
import {TimeMap, CapCtx, FONT, useT} from '../lib';
import {Caption, Progress} from '../Main';
import {MONO} from './Lab';
import {Fade, SeriesTag} from './Demo';
import {Heart6} from '../wb/heart6';
import {HAND} from '../wb/wb';
import {beatV, ecgAt, Lead} from './ecg';
import {Memo, Card, Head, DeskBg, ap, dp, useBeat, PEN, beat, M} from './Bundle';
import {Strip, Frame, NORM12, SheetBox2, HeartCard} from './Infarct';

const UP = '#DC2626', DN = '#2563EB', CLAD = '#DC2626', AMB = '#F59E0B', VIO = '#7C3AED', TEAL = '#06B6D4';
const gs = (x: number, mu: number, w: number, a: number) => a * Math.exp(-((x - mu) ** 2) / (2 * w * w));
const per = (T: number, off = 0.15, rr = 0.8) => ((((T + off) % rr) + rr) % rr) - rr * 0.35;

// ===== THANH TRẠM =====
const ST7 = ['KHÁI NIỆM', 'T TỐI CẤP & DE WINTER', 'WELLENS', 'THÀNH SAU & ASLANGER', 'aVR LAN TOẢ', 'SGARBOSSA', 'ÔN TẬP'];
const STC = ['#64748B', '#DC2626', '#7C3AED', '#16A34A', '#2563EB', '#F59E0B', '#22C55E'];
const StationBar6: React.FC = () => {
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
const Tag: React.FC<{x: number; y: number; a: number; c: string; children: React.ReactNode}> = ({x, y, a, c, children}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: FONT, fontSize: 30, fontWeight: 900, color: c, opacity: a}}>{children}</div>
);

// mẫu sóng
const HYPER: Lead = {r: 0.6, s: -0.35, t: 0.95, tw: 0.085, tPos: 0.26};
const KALI: Lead = {r: 0.9, s: -0.3, t: 1.0, tw: 0.032, tPos: 0.22};
const DW: Record<string, Lead> = {
  V1: {r: 0.25, s: -0.9, st: -0.08, t: 0.55, tw: 0.075, tPos: 0.24}, V2: {r: 0.3, s: -1.1, st: -0.2, t: 1.15, tw: 0.072, tPos: 0.24},
  V3: {r: 0.5, s: -0.8, st: -0.22, t: 1.25, tw: 0.072, tPos: 0.24}, V4: {r: 0.9, s: -0.4, st: -0.18, t: 1.05, tw: 0.072, tPos: 0.24},
  V5: {r: 1.05, s: -0.25, st: -0.12, t: 0.75, tw: 0.07}, V6: {r: 0.9, s: -0.15, st: -0.08, t: 0.5},
  aVR: {p: -0.1, q: 0.05, r: -0.7, s: 0.1, st: 0.1, t: -0.15},
};
const WELL_A = (T: number) => {const x = per(T); return beatV(x, {r: 0.8, s: -0.6, st: 0.03, t: 0.3, tw: 0.04, tPos: 0.2}) + gs(x, 0.33, 0.04, -0.32);};
const WELL_B: Lead = {r: 0.8, s: -0.6, st: 0.03, t: -0.75, tw: 0.065, tPos: 0.27};
const POSTX: Record<string, Lead> = {
  V1: {r: 0.75, s: -0.35, st: -0.4, t: 0.35, tw: 0.075}, V2: {r: 1.05, s: -0.3, st: -0.48, t: 0.4, tw: 0.075},
  V3: {r: 1.1, s: -0.3, st: -0.42, t: 0.38, tw: 0.075}, V4: {r: 1.2, s: -0.3, st: -0.3, t: 0.35},
};
const SUBENDO: Record<string, Lead> = {V2: {r: 0.4, s: -1.0, st: -0.05, t: 0.3}, V5: {r: 1.1, s: -0.2, st: -0.22, t: 0.1}, V6: {r: 0.9, s: -0.15, st: -0.25, t: 0.05}};
const ASL: Record<string, Lead> = {
  ...NORM12,
  II: {r: 0.9, s: -0.2, st: 0.02, t: 0.3}, III: {r: 0.5, s: -0.2, st: 0.24, t: 0.5, tw: 0.075}, aVF: {r: 0.7, s: -0.2, st: 0.05, t: 0.35},
  I: {r: 0.5, s: -0.1, st: -0.06, t: 0.15}, aVL: {r: 0.3, s: -0.25, st: -0.12, t: -0.1},
  V1: {r: 0.2, s: -0.9, st: 0.1, t: 0.25}, V2: {r: 0.4, s: -1.2, st: 0, t: 0.35},
  V4: {r: 1.2, s: -0.45, st: -0.18, t: 0.3}, V5: {r: 1.15, s: -0.25, st: -0.2, t: 0.25}, V6: {r: 0.9, s: -0.15, st: -0.18, t: 0.2},
};

// ================= 0 · BÌA =================
const Cover: React.FC = () => {
  const t = useT();
  const beat = useBeat();
  const rt = useCurrentFrame() / 30;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 72% 42%, #2A1636, #0B1218 72%)'}}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="cv6" x={1200} y={150} s={1.2} prog={dp(t, 0.1, 1.2)} art={dp(t, 0.6, 1.5)} labels={false} beat={beat} zone="ant" zoneC="#A855F7" zoneA={ap(t, 1.2) * 0.85} hot="lad" occl={ap(t, 1.0)} />
      </svg>
      <div style={{position: 'absolute', left: 110, top: 120, fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: 4, color: '#5EEAD4', opacity: ap(t, 0.2)}}>TIẾP CẬN ĐIỆN TÂM ĐỒ CƠ BẢN · BÀI 6</div>
      <div style={{position: 'absolute', left: 106, top: 166, width: 1100, fontFamily: FONT, fontSize: 72, fontWeight: 800, lineHeight: 1.08, color: '#F8FAFC', opacity: ap(t, 0.4)}}>
        Nhồi máu cơ tim khi ECG<br /><span style={{color: '#C084FC'}}>không điển hình</span>
      </div>
      <div style={{position: 'absolute', left: 112, top: 340, fontFamily: FONT, fontSize: 32, fontWeight: 700, color: '#CBD5E1', opacity: ap(t, 0.8)}}>Các dạng gợi ý tắc mạch cấp · <span style={{color: '#FDE047'}}>tiêu chuẩn Sgarbossa</span></div>
      <div style={{position: 'absolute', left: 110, top: 420, padding: '14px 30px', borderRadius: 20, border: '4px solid #C084FC', background: 'rgba(168,85,247,0.12)', fontFamily: FONT, fontSize: 46, fontWeight: 900, color: '#F5D0FE', opacity: ap(t, 2), transform: `scale(${0.85 + 0.15 * ap(t, 2)})`, transformOrigin: 'left center'}}>KHÔNG CHÊNH ≠ KHÔNG TẮC</div>
      <Frame x={110} y={560} a={ap(t, 4)}>
        <Strip L={HYPER} w={640} h={180} q={9} base={0.66} t0={(rt * 0.9) % 0.8} label="V3" />
      </Frame>
      <div style={{position: 'absolute', left: 112, top: 790, width: 1000, fontFamily: FONT, fontSize: 20, color: '#94A3B8', opacity: ap(t, 1)}}>Nguồn: Fifth Universal Definition of MI (2026) · 2025 ACC/AHA ACS · Sgarbossa NEJM 1996 · Smith Ann Emerg Med 2012 · Meyers Am Heart J 2015 · Dodd Ann Emerg Med 2021 · LITFL</div>
    </AbsoluteFill>
  );
};

// ================= 1 · KHÁI NIỆM =================
const Concept: React.FC = () => {
  const t = useT();
  const beat = useBeat();
  return (
    <DeskBg>
      <Head t={t}>Có tắc — nhưng không đủ ST chênh lên</Head>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart6 id="cc6" x={10} y={140} s={0.95} prog={1} art={1} labels={false} beat={beat} hot="lad" occl={ap(t, 0)} zone="ant" zoneC="#A855F7" zoneA={ap(t, 0.2) * 0.8} />
      </svg>
      <Frame x={520} y={170} a={ap(t, 0.4)}><Strip L={{r: 0.5, s: -0.8, st: 0.05, t: 0.6, tw: 0.075}} w={420} h={230} q={10} base={0.6} t0={-0.2} label="V3" /></Frame>
      <div style={{position: 'absolute', left: 520, top: 410, width: 420, textAlign: 'center', fontFamily: FONT, fontSize: 80, fontWeight: 900, color: '#FDE047', opacity: ap(t, 0.8)}}>?</div>
      <Lbl x={530} y={510} a={ap(t, 0.8)} c="#CBD5E1">ST chưa đủ ngưỡng…</Lbl>
      {[['Vùng 12 chuyển đạo nhìn kém', 'vd. thành sau'], ['Tắc sớm, chưa hoàn toàn', 'T tối cấp, chưa kịp chênh'], ['QRS rộng che lấp', 'block nhánh trái · máy tạo nhịp']].map(([a, b], i) => (
        <Card key={a} x={1000} y={140 + i * 140} w={860} a={ap(t, 2 + i * 0.4)} c={['#16A34A', '#DC2626', '#F59E0B'][i]} title={a}>{b}</Card>
      ))}
      <Card x={1000} y={570} w={860} a={ap(t, 4)} c={VIO} title="Định nghĩa nhồi máu lần thứ 5 (2026)">giữ STEMI/NSTEMI · liệt kê các dạng gợi ý tắc mạch cấp</Card>
      <Memo x={1000} y={740} w={860} a={ap(t, 6)}>KHÔNG CHÊNH ≠ KHÔNG TẮC → đọc <span style={{color: PEN}}>sóng T</span>, soi gương, QRS rộng</Memo>
    </DeskBg>
  );
};

// ================= 2 · T TỐI CẤP =================
const Hyperacute: React.FC = () => {
  const t = useT();
  const q = 22, W = 860, H = 460;
  return (
    <DeskBg>
      <Head t={t}>Sóng T tối cấp</Head>
      <Tag x={60} y={130} a={ap(t, 0)} c="#FCA5A5">T tối cấp (thiếu máu)</Tag>
      <Frame x={60} y={180} a={ap(t, 0)} c={UP}>
        <Strip L={(T) => beatV(T, HYPER)} w={W} h={H} q={q} base={0.72} t0={-0.3} stroke={6} prog={dp(t, 0, 1)}>
          {(X, Y) => <g opacity={ap(t, 2)}><path d={`M${X(0.15)},${Y(0) + 30} h${X(0.37) - X(0.15)}`} stroke={UP} strokeWidth={6} /><text x={X(0.3)} y={Y(0) + 75} textAnchor="middle" fontFamily={HAND} fontSize={40} fill={UP}>RỘNG đáy · cân đối</text><text x={X(0.26)} y={Y(0.95) - 20} textAnchor="middle" fontFamily={HAND} fontSize={36} fill={UP}>to so với QRS</text></g>}
        </Strip>
      </Frame>
      <Tag x={1000} y={130} a={ap(t, 4)} c="#93C5FD">Tăng kali máu</Tag>
      <Frame x={1000} y={180} a={ap(t, 4)} c={DN}>
        <Strip L={(T) => beatV(T, KALI)} w={W} h={H} q={q} base={0.72} t0={-0.3} stroke={6}>
          {(X, Y) => <g opacity={ap(t, 4.4)}><path d={`M${X(0.17)},${Y(0) + 30} h${X(0.27) - X(0.17)}`} stroke={DN} strokeWidth={6} /><text x={X(0.3)} y={Y(0) + 75} textAnchor="middle" fontFamily={HAND} fontSize={40} fill={DN}>HẸP đáy · nhọn</text></g>}
        </Strip>
      </Frame>
      <Memo x={60} y={700} w={1800} a={ap(t, 2.4)}>T tối cấp = dấu hiệu <span style={{color: PEN}}>sớm nhất</span> của tắc mạch — chú ý T “to bất thường” so với QRS</Memo>
    </DeskBg>
  );
};

// ================= 3 · DE WINTER =================
const DeWinter: React.FC = () => {
  const t = useT();
  const leads = ['V1', 'V2', 'V3', 'V4', 'V5', 'V6'];
  return (
    <DeskBg>
      <Head t={t}>Dạng de Winter</Head>
      {leads.map((ld, i) => (
        <Frame key={ld} x={60 + (i % 3) * 400} y={130 + Math.floor(i / 3) * 250} a={ap(t, i * 0.12)} c={ap(t, 2) > 0.5 ? UP : undefined}>
          <Strip L={DW[ld]} w={380} h={230} q={9} base={0.62} t0={-0.2} label={ld}>
            {(X, Y) => <circle cx={X(0.2)} cy={Y(DW[ld].st ?? 0)} r={13} fill="none" stroke={DN} strokeWidth={4} opacity={ap(t, 0.6)} />}
          </Strip>
        </Frame>
      ))}
      <Frame x={60} y={640} a={ap(t, 4)} c={AMB}><Strip L={DW.aVR} w={380} h={200} q={9} base={0.5} t0={-0.2} label="aVR" /></Frame>
      <Lbl x={460} y={660} a={ap(t, 0.6)} c="#93C5FD">ST↓ đi lên 1–3 mm tại điểm J</Lbl>
      <Lbl x={460} y={720} a={ap(t, 2)} c="#FCA5A5">T cao, cân đối</Lbl>
      <Lbl x={460} y={780} a={ap(t, 4)} c="#FCD34D">aVR: ST↑ 0,5 – 2 mm</Lbl>
      <HeartCard id="dw6" x={1300} y={120} w={560} a={ap(t, 6)} zone="ant" hot="lad" c={CLAD} title="Liên thất trước đoạn gần" sub="≈ 2% nhồi máu thành trước" s={0.7} />
      <Memo x={1300} y={640} w={560} a={ap(t, 8)}>Không ST chênh lên điển hình — <span style={{color: PEN}}>nhưng là tắc mạch cấp</span></Memo>
    </DeskBg>
  );
};

// ================= 4 · WELLENS =================
const Wellens: React.FC = () => {
  const t = useT();
  const q = 15;
  return (
    <DeskBg>
      <Head t={t}>Hội chứng Wellens</Head>
      <div style={{position: 'absolute', left: 520, top: 66, padding: '6px 20px', borderRadius: 14, background: '#16A34A', color: '#fff', fontFamily: FONT, fontSize: 28, fontWeight: 900, opacity: ap(t, 0.3)}}>ghi khi HẾT đau</div>
      <Tag x={60} y={130} a={ap(t, 2)} c="#C4B5FD">Dạng A · T hai pha</Tag>
      <Frame x={60} y={180} a={ap(t, 2)} c={VIO}><Strip L={WELL_A} w={620} h={300} q={q} base={0.55} t0={-0.2} label="V2" stroke={4} /></Frame>
      <Tag x={720} y={130} a={ap(t, 2.4)} c="#C4B5FD">Dạng B · T đảo sâu (hay gặp hơn)</Tag>
      <Frame x={720} y={180} a={ap(t, 2.4)} c={VIO}><Strip L={WELL_B} w={620} h={300} q={q} base={0.45} t0={-0.2} label="V3" stroke={4} /></Frame>
      {['ST đẳng điện / chênh < 1 mm', 'Sóng R còn', 'Không có sóng Q'].map((s, i) => (
        <div key={s} style={{position: 'absolute', left: 60 + i * 470, top: 510, padding: '10px 18px', borderRadius: 14, background: 'rgba(22,163,74,0.18)', border: '2px solid #22C55E', fontFamily: FONT, fontSize: 26, fontWeight: 800, color: '#BBF7D0', opacity: ap(t, 4 + i * 0.3)}}>✓ {s}</div>
      ))}
      <HeartCard id="wl6" x={1380} y={120} w={480} a={ap(t, 6)} zone="ant" hot="lad" c={VIO} title="Liên thất trước đoạn gần" sub="hẹp nặng · đã tự tái thông" s={0.6} />
      <Card x={60} y={610} w={1280} a={ap(t, 6)} c={VIO} title="Ý nghĩa: hẹp nặng, mạch đã tái thông — nguy cơ TẮC LẠI rất cao" />
      <div style={{position: 'absolute', left: 60, top: 730, width: 1280, padding: '18px 24px', borderRadius: 16, background: PEN, color: '#fff', fontFamily: FONT, fontSize: 32, fontWeight: 800, boxSizing: 'border-box', opacity: ap(t, 8), transform: `scale(${0.94 + 0.06 * ap(t, 8)})`, transformOrigin: 'left center', boxShadow: '0 12px 28px rgba(0,0,0,0.4)'}}>⚠ Tránh nghiệm pháp gắng sức — có thể gây nhồi máu, rối loạn nhịp</div>
    </DeskBg>
  );
};

// ================= 5 · THÀNH SAU ẨN =================
const PostHidden: React.FC = () => {
  const t = useT();
  return (
    <DeskBg>
      <Head t={t}>Thành sau “ẩn”</Head>
      {['V1', 'V2', 'V3', 'V4'].map((ld, i) => (
        <Frame key={ld} x={60 + i * 300} y={140} a={ap(t, i * 0.12)} c={DN}><Strip L={POSTX[ld]} w={280} h={240} q={9} base={0.58} t0={-0.2} label={ld} /></Frame>
      ))}
      <div style={{position: 'absolute', left: 60, top: 400, width: 1180, height: 14, borderRadius: 7, background: 'linear-gradient(90deg, #2563EB, #93C5FD 70%, transparent)', opacity: ap(t, 0.6)}} />
      <Lbl x={60} y={425} a={ap(t, 0.6)} c="#93C5FD">ST↓ TỐI ĐA ở V1 – V4</Lbl>
      <Lbl x={60} y={480} a={ap(t, 2)} c="#FCA5A5">R cao · T dương (V1 – V3)</Lbl>
      <Tag x={60} y={560} a={ap(t, 4)} c="#CBD5E1">So sánh — thiếu máu dưới nội mạc:</Tag>
      {['V2', 'V5', 'V6'].map((ld, i) => (
        <Frame key={ld} x={60 + i * 300} y={610} a={ap(t, 4 + i * 0.12)}><Strip L={SUBENDO[ld]} w={280} h={200} q={8} base={0.6} t0={-0.2} label={ld} /></Frame>
      ))}
      <Lbl x={960} y={680} a={ap(t, 4.4)} c="#CBD5E1">ST↓ tối đa ở V5 – V6</Lbl>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        <Heart6 id="ph6" x={1360} y={110} s={0.8} prog={1} art={1} labels={false} zone="post" zoneC="#16A34A" zoneA={ap(t, 0.3) * 0.9} hot="lcx" occl={ap(t, 0.3)} />
      </svg>
      <Card x={1300} y={640} w={560} a={ap(t, 6)} c="#16A34A" title="Khẳng định: gắn V7 – V9">như bài 5</Card>
    </DeskBg>
  );
};

// ================= 6 · ASLANGER =================
const Aslanger: React.FC = () => {
  const t = useT();
  return (
    <DeskBg>
      <Head t={t}>Dạng Aslanger</Head>
      <SheetBox2 x={60} y={140} a={ap(t, -1)} leads={ASL} sc={0.8} groups={[[['III'], UP, ap(t, 2)], [['II', 'aVF'], '#94A3B8', ap(t, 2.4)], [['V4', 'V5', 'V6'], DN, ap(t, 4)], [['V1'], AMB, ap(t, 4.6)]]} />
      <Card x={1300} y={140} w={560} a={ap(t, 0)} c="#16A34A" title="Nhồi máu vùng DƯỚI">kèm bệnh nhiều nhánh</Card>
      <Card x={1300} y={290} w={560} a={ap(t, 2)} c={UP} title="① ST↑ CHỈ ở III">không ở II, aVF</Card>
      <Card x={1300} y={440} w={560} a={ap(t, 4)} c={DN} title="② ST↓ V4 – V6, T dương">≥ 1 chuyển đạo</Card>
      <Card x={1300} y={590} w={560} a={ap(t, 4.6)} c={AMB} title="③ ST ở V1 > V2" />
      <Memo x={60} y={790} w={1800} a={ap(t, 6)}>Không đủ “2 chuyển đạo liên tiếp” → <span style={{color: PEN}}>rất dễ bỏ sót</span></Memo>
    </DeskBg>
  );
};

// ================= phần 2 =================
type Morph = Parameters<typeof beat>[0];
const bf = (m: Morph) => (T: number) => beat(m)(T);
const DIFF: Record<string, Lead> = {
  ...NORM12,
  I: {r: 0.6, s: -0.1, st: -0.15, t: 0.1}, II: {r: 1.0, s: -0.2, st: -0.22, t: 0.1}, III: {r: 0.5, s: -0.2, st: -0.1, t: 0.05}, aVF: {r: 0.75, s: -0.2, st: -0.16, t: 0.08},
  aVR: {p: -0.1, q: 0.05, r: -0.75, s: 0.1, st: 0.18, t: -0.1}, aVL: {r: 0.35, s: -0.2, st: -0.05, t: 0.1},
  V3: {r: 0.75, s: -0.8, st: -0.15, t: 0.2}, V4: {r: 1.2, s: -0.45, st: -0.24, t: 0.1}, V5: {r: 1.15, s: -0.25, st: -0.26, t: 0.05}, V6: {r: 0.9, s: -0.15, st: -0.24, t: 0.05},
};
const AvrDiffuse: React.FC = () => {
  const t = useT();
  return (
    <DeskBg>
      <Head t={t}>ST chênh xuống lan toả + aVR chênh lên</Head>
      <SheetBox2 x={60} y={140} a={ap(t, -1)} leads={DIFF} sc={0.8} groups={[[['I', 'II', 'aVF', 'V4', 'V5', 'V6'], DN, ap(t, 0.2)], [['aVR'], UP, ap(t, 0.8)]]} />
      <Card x={1300} y={140} w={560} a={ap(t, 2)} c={DN} title="Thiếu máu dưới nội mạc lan toả">hẹp thân chung · bệnh 3 nhánh · tăng nhu cầu ô xy</Card>
      <div style={{position: 'absolute', left: 1300, top: 330, width: 560, padding: '18px 24px', borderRadius: 16, background: PEN, color: '#fff', fontFamily: FONT, fontSize: 30, fontWeight: 800, boxSizing: 'border-box', opacity: ap(t, 4), boxShadow: '0 12px 28px rgba(0,0,0,0.4)'}}>KHÔNG đặc hiệu cho tắc mạch cấp (định nghĩa nhồi máu 2026)</div>
      <Tag x={1300} y={500} a={ap(t, 6)} c="#FCA5A5">≠ de Winter: T cao cân đối V1–V6</Tag>
      <Frame x={1300} y={550} a={ap(t, 6)} c={UP}><Strip L={DW.V3} w={560} h={230} q={10} base={0.62} t0={-0.2} label="V3 · de Winter" /></Frame>
      <Memo x={60} y={790} w={1180} a={ap(t, 2.4)}>aVR ↑ + ST↓ nhiều chuyển đạo → nghĩ <span style={{color: DN}}>thân chung / 3 nhánh</span></Memo>
    </DeskBg>
  );
};

// ===== block nhánh trái: hình dạng =====
const LB_V1 = M.V1l, LB_V6 = M.V6l;
const ArrowV: React.FC<{x: number; y0: number; y1: number; c: string; a: number}> = ({x, y0, y1, c, a}) => {
  const d = y1 > y0 ? -18 : 18;
  return <g opacity={a}><line x1={x} y1={y0} x2={x} y2={y1} stroke={c} strokeWidth={7} /><path d={`M${x - 14},${y1 + d} L${x},${y1} L${x + 14},${y1 + d}`} fill="none" stroke={c} strokeWidth={7} /></g>;
};
const SgPrinciple: React.FC = () => {
  const t = useT();
  return (
    <DeskBg>
      <Head t={t}>Sgarbossa — nguyên tắc</Head>
      <Tag x={60} y={130} a={ap(t, 0)} c="#FCD34D">Block nhánh trái · nhịp máy tạo nhịp thất</Tag>
      <Frame x={60} y={180} a={ap(t, 0.2)}>
        <Strip L={bf(LB_V1)} w={560} h={420} q={11} base={0.4} t0={-0.2} label="V1" stroke={5}>
          {(X, Y) => <g>{<ArrowV x={X(0.075)} y0={Y(0) + 10} y1={Y(-1.3)} c={DN} a={ap(t, 2)} />}{<ArrowV x={X(0.22)} y0={Y(0) - 6} y1={Y(0.32)} c={UP} a={ap(t, 2.3)} />}</g>}
        </Strip>
      </Frame>
      <Frame x={660} y={180} a={ap(t, 0.4)}>
        <Strip L={bf(LB_V6)} w={560} h={420} q={11} base={0.7} t0={-0.2} label="V6" stroke={5}>
          {(X, Y) => <g>{<ArrowV x={X(0.075)} y0={Y(0) - 10} y1={Y(1.05)} c={DN} a={ap(t, 2)} />}{<ArrowV x={X(0.3)} y0={Y(0) + 6} y1={Y(-0.32)} c={UP} a={ap(t, 2.3)} />}</g>}
        </Strip>
      </Frame>
      <Lbl x={60} y={620} a={ap(t, 2)} c="#93C5FD">QRS ↕ · ST–T ngược chiều = BÌNH THƯỜNG (bài 4)</Lbl>
      <div style={{position: 'absolute', left: 1260, top: 180, width: 600, padding: '24px 28px', borderRadius: 20, background: 'rgba(245,158,11,0.15)', border: '4px solid #F59E0B', boxSizing: 'border-box', fontFamily: FONT, opacity: ap(t, 4), transform: `scale(${0.9 + 0.1 * ap(t, 4)})`}}>
        <div style={{fontSize: 24, fontWeight: 800, color: '#FCD34D', letterSpacing: 2}}>THẦN CHÚ SGARBOSSA</div>
        <div style={{fontSize: 44, fontWeight: 900, color: '#fff', marginTop: 10, lineHeight: 1.2}}>CÙNG chiều là bệnh<br /><span style={{color: '#FCA5A5'}}>NGƯỢC quá mức là bệnh</span></div>
      </div>
      <Card x={1260} y={480} w={600} a={ap(t, 6)} c="#16A34A" title="Tương hợp">ST cùng chiều phần chính của QRS</Card>
      <Card x={1260} y={610} w={600} a={ap(t, 6.3)} c={DN} title="Bất tương hợp">ST ngược chiều QRS</Card>
    </DeskBg>
  );
};

// ===== Sgarbossa 1996 =====
const SG1: Morph = {c: [[0.045, 0.02, 1.0], [0.105, 0.022, 1.1]], st: 0.15, t: [0.34, 0.06, 0.4], end: 0.145};
const SG2: Morph = {c: [[0.012, 0.007, 0.08], [0.075, 0.033, -1.3]], st: -0.15, t: [0.34, 0.06, -0.3], end: 0.145};
const SG3: Morph = {c: [[0.012, 0.007, 0.08], [0.075, 0.03, -2.4]], st: 0.6, t: [0.32, 0.06, 0.7], end: 0.145};
const Sg1996: React.FC = () => {
  const t = useT();
  const crit: [Morph, string, string, string, number, number, number][] = [
    [SG1, 'V6', '① ST↑ TƯƠNG HỢP ≥ 1 mm', 'bất kỳ chuyển đạo', 5, 2, 0.75],
    [SG2, 'V2', '② ST↓ ≥ 1 mm ở V1–V3', 'tương hợp', 3, 4, 0.38],
    [SG3, 'V3', '③ ST↑ BẤT tương hợp > 5 mm', 'ngược chiều quá mức', 2, 4.5, 0.25],
  ];
  return (
    <DeskBg>
      <Head t={t}>Tiêu chuẩn Sgarbossa (1996)</Head>
      {crit.map(([m, ld, ti, sub, pts, s, base], i) => (
        <div key={i}>
          <Frame x={60 + i * 610} y={140} a={ap(t, s)} c={['#DC2626', '#2563EB', '#F59E0B'][i]}>
            <Strip L={bf(m)} w={580} h={400} q={11} base={base} t0={-0.2} label={ld} stroke={4} />
          </Frame>
          <div style={{position: 'absolute', left: 60 + i * 610, top: 555, width: 580, fontFamily: FONT, opacity: ap(t, s + 0.2)}}>
            <div style={{fontSize: 30, fontWeight: 900, color: '#F8FAFC'}}>{ti}</div>
            <div style={{fontSize: 24, fontWeight: 700, color: '#94A3B8'}}>{sub}</div>
            <div style={{display: 'inline-block', marginTop: 10, padding: '6px 22px', borderRadius: 14, background: ['#DC2626', '#2563EB', '#F59E0B'][i], color: '#fff', fontSize: 34, fontWeight: 900}}>{pts} điểm</div>
          </div>
        </div>
      ))}
      <div style={{position: 'absolute', left: 60, top: 760, width: 1800, display: 'flex', gap: 20, alignItems: 'center', opacity: ap(t, 6)}}>
        <div style={{padding: '16px 30px', borderRadius: 16, background: '#F8FAFC', fontFamily: FONT, fontSize: 38, fontWeight: 900, color: '#1E293B'}}>≥ 3 điểm → nhồi máu</div>
        <div style={{fontFamily: FONT, fontSize: 30, fontWeight: 800, color: '#CBD5E1'}}>đặc hiệu rất cao · <span style={{color: '#FCA5A5'}}>nhạy thấp — bỏ sót khoảng một nửa</span></div>
      </div>
    </DeskBg>
  );
};

// ===== Smith cải tiến =====
const SM: Morph = {c: [[0.012, 0.007, 0.08], [0.07, 0.025, -1.2]], st: 0.3, t: [0.34, 0.06, 0.55], end: 0.14};
const Smith: React.FC = () => {
  const t = useT();
  const f = beat(SM);
  return (
    <DeskBg>
      <Head t={t}>Sgarbossa cải tiến (Smith, 2012)</Head>
      <Frame x={60} y={140} a={ap(t, 0)}>
        <Strip L={bf(SM)} w={900} h={560} q={22} base={0.35} t0={-0.2} label="V3" stroke={6}>
          {(X, Y) => (
            <g>
              <g opacity={ap(t, 2)}>
                <line x1={X(0.07) - 70} x2={X(0.07) - 70} y1={Y(0)} y2={Y(f(0.07))} stroke={DN} strokeWidth={6} />
                <path d={`M${X(0.07) - 84},${Y(0)} h28 M${X(0.07) - 84},${Y(f(0.07))} h28`} stroke={DN} strokeWidth={6} />
                <text x={X(0.07) + 30} y={Y(f(0.07)) + 12} fontFamily={MONO} fontSize={34} fontWeight={700} fill={DN}>S 12 mm</text>
              </g>
              <g opacity={ap(t, 2.4)}>
                <line x1={X(0.17)} x2={X(0.17)} y1={Y(0)} y2={Y(0.3)} stroke={UP} strokeWidth={6} />
                <path d={`M${X(0.17) - 14},${Y(0)} h28 M${X(0.17) - 14},${Y(0.3)} h28`} stroke={UP} strokeWidth={6} />
                <text x={X(0.17) + 10} y={Y(0) + 50} fontFamily={MONO} fontSize={34} fontWeight={700} fill={UP}>ST 3 mm</text>
              </g>
            </g>
          )}
        </Strip>
      </Frame>
      <Card x={1000} y={140} w={860} a={ap(t, 0)} c="#16A34A" title="Giữ ① và ② · chỉ thay ③" />
      <Card x={1000} y={250} w={860} a={ap(t, 2)} c={UP} title="③ mới: ST↑ bất tương hợp ≥ 1 mm VÀ ST/S ≥ 25%">tỉ lệ ST/S ≤ −0,25</Card>
      <div style={{position: 'absolute', left: 1000, top: 410, width: 860, padding: '18px 26px', borderRadius: 18, background: '#FFF4C2', border: '3px solid #E8C547', boxSizing: 'border-box', fontFamily: FONT, opacity: ap(t, 4), transform: `scale(${0.92 + 0.08 * ap(t, 4)})`, transformOrigin: 'left center'}}>
        <span style={{fontSize: 44, fontWeight: 900, color: '#26221C'}}>3 / 12 = </span><span style={{fontSize: 52, fontWeight: 900, color: PEN}}>25% → dương tính ✓</span>
      </div>
      <Card x={1000} y={540} w={860} a={ap(t, 6)} c="#475569" title="Vì sao tỉ lệ?">QRS càng lớn → ST ngược chiều càng lớn → đo TƯƠNG ĐỐI công bằng hơn</Card>
      <div style={{position: 'absolute', left: 60, top: 730, width: 1800, display: 'flex', gap: 18, opacity: ap(t, 8)}}>
        {[['Bản gốc (≥ 3 điểm)', '49%', '100%', '#64748B'], ['Cải tiến (ST/S)', '80%', '99%', '#16A34A']].map(([n, se, sp, c]) => (
          <div key={n} style={{flex: 1, padding: '14px 24px', borderRadius: 16, background: '#FCFAF4', borderLeft: `12px solid ${c}`, fontFamily: FONT, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{fontSize: 30, fontWeight: 900, color: c}}>{n}</span>
            <span style={{fontSize: 30, fontWeight: 800, color: '#1F2937'}}>nhạy <b>{se}</b> · đặc hiệu <b>{sp}</b></span>
          </div>
        ))}
      </div>
    </DeskBg>
  );
};

// ===== máy tạo nhịp =====
const PACE = (T: number) => {const x = per(T, 0.15, 0.85); return beat(M.V1l)(x + 0.0) + gs(x, -0.005, 0.0015, 2.2);};
const Paced: React.FC = () => {
  const t = useT();
  return (
    <DeskBg>
      <Head t={t}>Nhịp máy tạo nhịp thất</Head>
      <Frame x={60} y={140} a={ap(t, 0)}><Strip L={PACE} w={1180} h={400} q={11} base={0.45} t0={0} label="V2 · nhịp máy tạo nhịp" stroke={4} /></Frame>
      <Lbl x={60} y={555} a={ap(t, 0.4)} c="#FCD34D">gai tạo nhịp → QRS rộng, giống block nhánh trái</Lbl>
      <Card x={1300} y={140} w={560} a={ap(t, 0)} c={AMB} title="Dùng được Sgarbossa cải tiến" />
      <div style={{position: 'absolute', left: 1300, top: 260, width: 560, padding: '20px 26px', borderRadius: 18, background: '#FCFAF4', borderLeft: '12px solid #16A34A', boxSizing: 'border-box', fontFamily: FONT, opacity: ap(t, 2)}}>
        <div style={{fontSize: 24, fontWeight: 800, color: '#64748B'}}>Nghiên cứu 2021</div>
        <div style={{fontSize: 36, fontWeight: 900, color: '#1F2937'}}>nhạy <span style={{color: '#16A34A'}}>81%</span> · đặc hiệu <span style={{color: '#16A34A'}}>96%</span></div>
      </div>
      <div style={{position: 'absolute', left: 60, top: 660, width: 1800, padding: '16px 24px', borderRadius: 16, background: 'rgba(148,163,184,0.12)', border: '2px dashed #94A3B8', boxSizing: 'border-box', fontFamily: FONT, fontSize: 28, fontWeight: 700, color: '#CBD5E1', opacity: ap(t, 4)}}>Thêm: thuật toán Barcelona (2020) cho block nhánh trái — nhạy hơn, cần thêm kiểm chứng</div>
    </DeskBg>
  );
};

// ===== ôn tập =====
const Review6: React.FC = () => {
  const t = useT();
  const rows: [string, string, string, string, number][] = [
    ['T tối cấp · de Winter', 'T cao rộng đáy · ST↓ đi lên V1–V6 + T cao', 'Tắc liên thất trước đoạn gần', CLAD, 2],
    ['Wellens', 'T hai pha / đảo sâu V2–V3 khi hết đau', 'Hẹp nặng, đã tái thông · tránh gắng sức', VIO, 4],
    ['Thành sau', 'ST↓ tối đa V1–V4, R cao, T dương', 'Gắn V7–V9', '#16A34A', 4.3],
    ['Aslanger', 'ST↑ chỉ III · ST↓ V4–V6 · V1 > V2', 'Nhồi máu dưới + nhiều nhánh', '#0EA5E9', 4.6],
    ['Block nhánh trái / máy tạo nhịp', 'Cùng chiều · ngược quá mức (ST/S ≥ 25%)', 'Sgarbossa cải tiến', AMB, 6],
    ['aVR↑ + ST↓ lan toả', 'ST↓ nhiều chuyển đạo', 'KHÔNG đặc hiệu', '#64748B', 6.3],
  ];
  const cols = [440, 760, 600];
  return (
    <DeskBg>
      <Head t={t}>Ôn tập: các dạng gợi ý tắc mạch cấp</Head>
      <div style={{position: 'absolute', left: 60, top: 130, width: 1800, borderRadius: 18, overflow: 'hidden', background: '#FCFAF4', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', fontFamily: FONT, opacity: ap(t, 0)}}>
        <div style={{display: 'flex', background: '#1E293B', color: '#F8FAFC', fontSize: 26, fontWeight: 800}}>
          {['Dạng', 'Dấu hiệu chính', 'Ý nghĩa'].map((h, i) => <div key={h} style={{width: cols[i], padding: '14px 22px', boxSizing: 'border-box'}}>{h}</div>)}
        </div>
        {rows.map(([a, b, c, col, s]) => (
          <div key={a} style={{display: 'flex', borderTop: '2px solid #E5E7EB', opacity: ap(t, s), transform: `translateX(${(1 - ap(t, s)) * 30}px)`, fontSize: 27, fontWeight: 700, color: '#1F2937', alignItems: 'center'}}>
            <div style={{width: cols[0], padding: '16px 22px', boxSizing: 'border-box', color: col, fontWeight: 900, borderLeft: `10px solid ${col}`}}>{a}</div>
            <div style={{width: cols[1], padding: '16px 22px', boxSizing: 'border-box'}}>{b}</div>
            <div style={{width: cols[2], padding: '16px 22px', boxSizing: 'border-box', fontWeight: 800}}>{c}</div>
          </div>
        ))}
      </div>
    </DeskBg>
  );
};

// ===== thực hành =====
const Chk6: React.FC<{y: number; a: number; c: string; k: string; children: React.ReactNode}> = ({y, a, c, k, children}) => (
  <div style={{position: 'absolute', left: 1300, top: y, width: 560, display: 'flex', gap: 14, alignItems: 'flex-start', fontFamily: FONT, opacity: a, transform: `translateX(${(1 - a) * 30}px)`}}>
    <span style={{flex: 'none', padding: '4px 12px', borderRadius: 10, background: c, color: '#fff', fontSize: 22, fontWeight: 900, marginTop: 4}}>{k}</span>
    <span style={{fontSize: 28, fontWeight: 700, color: '#F1F5F9', lineHeight: 1.3}}>{children}</span>
  </div>
);
const SM2: Morph = {c: [[0.012, 0.007, 0.08], [0.07, 0.025, -1.5]], st: 0.5, t: [0.34, 0.06, 0.7], end: 0.14};
const CON: Morph = {c: [[0.045, 0.02, 1.0], [0.105, 0.022, 1.1]], st: 0.1, t: [0.34, 0.06, 0.4], end: 0.145};
const Practice6: React.FC = () => {
  const t = useT();
  const sw = ap(t, 6, 0.35);
  const leads = ['V1', 'V2', 'V3', 'V4', 'V5', 'V6'];
  return (
    <DeskBg>
      <Head t={t}>Thực hành: đọc 2 ECG</Head>
      <div style={{opacity: Math.max(0, 1 - sw * 2)}}>
        <Tag x={60} y={128} a={ap(t, 1)} c="#FDE047">ECG 1 · đau ngực</Tag>
        {leads.map((ld, i) => (
          <Frame key={ld} x={60 + (i % 3) * 400} y={175 + Math.floor(i / 3) * 240} a={ap(t, 2 + i * 0.08)} c={ap(t, 2.4) > 0.5 ? UP : undefined}><Strip L={DW[ld]} w={380} h={220} q={9} base={0.62} t0={-0.2} label={ld} /></Frame>
        ))}
        <Frame x={60} y={665} a={ap(t, 2.6)} c={AMB}><Strip L={DW.aVR} w={380} h={190} q={9} base={0.5} t0={-0.2} label="aVR" /></Frame>
        <Chk6 y={180} a={ap(t, 2.4)} c={DN} k="ST">ST↓ đi lên 2 mm V1–V6, T cao cân đối</Chk6>
        <Chk6 y={290} a={ap(t, 2.8)} c={AMB} k="aVR">ST↑ 1 mm</Chk6>
        <Chk6 y={370} a={ap(t, 4)} c={CLAD} k="KẾT LUẬN">Dạng de Winter → tắc liên thất trước đoạn gần ✓</Chk6>
      </div>
      <div style={{opacity: Math.max(0, sw * 2 - 1)}}>
        <Tag x={60} y={128} a={sw} c="#FDE047">ECG 2 · block nhánh trái</Tag>
        <Frame x={60} y={175} a={sw} c={UP}><Strip L={bf(SM2)} w={600} h={520} q={13} base={0.4} t0={-0.2} label="V3" stroke={5}>
          {(X, Y) => <g opacity={ap(t, 6.6)}><text x={X(0.07) + 30} y={Y(-1.5) + 10} fontFamily={MONO} fontSize={30} fontWeight={700} fill={DN}>S 15 mm</text><line x1={X(0.17)} x2={X(0.17)} y1={Y(0)} y2={Y(0.5)} stroke={UP} strokeWidth={6} /><text x={X(0.17) + 10} y={Y(0) + 46} fontFamily={MONO} fontSize={30} fontWeight={700} fill={UP}>ST 5 mm</text></g>}
        </Strip></Frame>
        <Frame x={690} y={175} a={sw} c={UP}><Strip L={bf(CON)} w={560} h={520} q={13} base={0.72} t0={-0.2} label="V5" stroke={5}>
          {(X, Y) => <g opacity={ap(t, 7)}><circle cx={X(0.17)} cy={Y(0.1)} r={22} fill="none" stroke={UP} strokeWidth={5} /><text x={X(0.17) + 30} y={Y(0.1) + 70} fontFamily={HAND} fontSize={34} fill={UP}>ST↑ tương hợp 1 mm</text></g>}
        </Strip></Frame>
        <Chk6 y={180} a={ap(t, 6.6)} c={UP} k="V3">5 / 15 = 33% ≥ 25% (ngược quá mức)</Chk6>
        <Chk6 y={290} a={ap(t, 7)} c={UP} k="V5">ST↑ cùng chiều ≥ 1 mm</Chk6>
        <Chk6 y={370} a={ap(t, 8)} c={AMB} k="KẾT LUẬN">Sgarbossa cải tiến dương tính ✓</Chk6>
      </div>
    </DeskBg>
  );
};

// ===== 5 điều cần nhớ =====
const Takeaways6: React.FC = () => {
  const t = useT();
  const items: [React.ReactNode, string][] = [
    [<><b>Không chênh ≠ không tắc</b> — đọc sóng T, soi gương, QRS rộng</>, '#A855F7'],
    [<>T tối cấp, <b>de Winter</b> → nghĩ liên thất trước đoạn gần</>, CLAD],
    [<><b>Wellens</b>: T ở V2–V3 khi hết đau → hẹp nặng, tránh gắng sức</>, VIO],
    [<>ST↓ tối đa V1–V4 → <b>thành sau</b> · chỉ III + ST↓ V4–V6 → <b>Aslanger</b></>, '#16A34A'],
    [<>Block nhánh trái / máy tạo nhịp: <b>cùng chiều</b> là bệnh · <b>ngược quá mức</b> (ST/S ≥ 25%) là bệnh</>, AMB],
  ];
  return (
    <DeskBg>
      <Head t={t}>5 điều cần nhớ</Head>
      {items.map(([s, c], i) => {
        const a = ap(t, 2 + i * 2);
        return (
          <div key={i} style={{position: 'absolute', left: 100, top: 140 + i * 128, width: 1720, height: 108, display: 'flex', alignItems: 'center', gap: 24, padding: '0 26px', borderRadius: 18, background: '#FCFAF4', borderLeft: `14px solid ${c}`, boxSizing: 'border-box', opacity: a, transform: `translateX(${(1 - a) * 50}px)`, boxShadow: '0 12px 26px rgba(0,0,0,0.35)', fontFamily: FONT}}>
            <span style={{flex: 'none', width: 60, height: 60, borderRadius: 30, background: c, color: '#fff', fontSize: 34, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</span>
            <span style={{fontSize: 32, fontWeight: 700, color: '#1F2937'}}>{s}</span>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, textAlign: 'center', fontFamily: FONT, fontSize: 40, fontWeight: 800, color: '#5EEAD4', opacity: ap(t, 12)}}>Cảm ơn bạn đã theo dõi!</div>
    </DeskBg>
  );
};

const SCN: React.FC[] = [Cover, Concept, Hyperacute, DeWinter, Wellens, PostHidden, Aslanger, AvrDiffuse, SgPrinciple, Sg1996, Smith, Paced, Review6, Practice6, Takeaways6];
export const OCCL_N = 7;
export const Occlusion: React.FC = () => (
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
    <SeriesTag sub="Nhồi máu khi ECG không điển hình · Sgarbossa" />
    <StationBar6 />
    <Caption />
    <Progress />
  </AbsoluteFill>
);
export {StationBar6, Lbl, Tag, gs, per};
void ecgAt; void MONO; void TEAL;
