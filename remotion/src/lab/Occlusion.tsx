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
import {Memo, Card, Head, DeskBg, ap, dp, useBeat, PEN} from './Bundle';
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

const SCN: React.FC[] = [Cover, Concept, Hyperacute, DeWinter, Wellens, PostHidden, Aslanger];
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
