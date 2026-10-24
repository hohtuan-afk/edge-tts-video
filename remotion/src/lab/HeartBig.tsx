// Trưng bày tim bán thực tế cỡ lớn: lần lượt từng vùng nhồi máu
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {FONT, useT} from '../lib';
import {Heart4, Zone4, Hot4} from '../wb/heart4';

const SEQ: [string, Zone4, Hot4, string][] = [
  ['Tim bình thường', null, null, '#FFFFFF'],
  ['Thành dưới — RCA', 'inf', 'rca', '#FF3B3B'],
  ['Thành trước — LAD', 'ant', 'lad', '#3B82F6'],
  ['Thành bên — LCx', 'lat', 'lcx', '#22C55E'],
  ['Thất phải — RCA đoạn gần', 'rv', 'rcaP', '#F59E0B'],
];
export const HeartBig: React.FC = () => {
  const t = useT();
  const i = Math.min(SEQ.length - 1, Math.max(0, Math.floor((t - 2.5) / 2.4) + 1));
  const lt = t - (i === 0 ? 0 : 2.5 + (i - 1) * 2.4);
  const [name, zone, hot, c] = SEQ[i];
  const beat = Math.max(0, Math.sin(t * 2 * Math.PI * 1.1)) ** 4;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 45% 40%, #FFFFFF, #EEF2F6 70%)'}}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <Heart4 id="big" x={620} y={20} s={1.85} prog={interpolate(t, [0, 1.6], [0, 1], {extrapolateRight: 'clamp'})} art={interpolate(t, [0.8, 2.4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
          zone={zone} zoneC={c} zoneA={zone ? interpolate(lt, [0.3, 0.9], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0}
          hot={hot} occl={hot ? interpolate(lt, [0.1, 0.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0} beat={beat} />
      </svg>
      <div style={{position: 'absolute', left: 90, top: 70, fontFamily: FONT, fontWeight: 800, fontSize: 52, color: '#1F2937'}}>{name}</div>
    </AbsoluteFill>
  );
};
export const HEARTBIG_DUR = Math.round((2.5 + 4 * 2.4) * 30);
