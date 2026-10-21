"""Chuẩn bị dữ liệu Remotion từ một dự án đã có timing.json + narration.wav.

Dùng:  python3 kit/remotion_prep.py projects/<ten>
Ghi:
  remotion/src/data.json      — khung hình bắt đầu/độ dài từng cảnh + mốc từng câu (giây, tính từ đầu cảnh)
  remotion/public/narration.m4a — giọng đọc + nhạc nền tự nhỏ khi có lời, chuẩn 48 kHz (-16 LUFS)
  remotion/stills.txt         — khung hình gần cuối mỗi cảnh, để render ảnh tĩnh soát bố cục
"""
import json, os, subprocess, sys, tempfile

proj = sys.argv[1]
FPS = 30
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tm = json.load(open(os.path.join(proj, 'timing.json')))

scenes, acc = [], 0.0
for x in tm:
    f0 = round(acc * FPS)
    acc += x['dur']
    f1 = round(acc * FPS)
    scenes.append({'from': f0, 'dur': f1 - f0,
                   'sents': [{'start': s['start'], 'dur': s['dur'], 'text': s['text']} for s in x['sents']]})
total = round(acc * FPS)
json.dump({'fps': FPS, 'total': total, 'scenes': scenes},
          open(os.path.join(root, 'remotion/src/data.json'), 'w'), ensure_ascii=False, indent=1)
open(os.path.join(root, 'remotion/stills.txt'), 'w').write(' '.join(str(s['from'] + s['dur'] - 20) for s in scenes))

narr = os.path.join(proj, 'narration.wav')
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', narr],
                           capture_output=True, text=True, check=True).stdout)
with tempfile.TemporaryDirectory() as td:
    pad = os.path.join(td, 'pad.wav')
    subprocess.run([sys.executable, os.path.join(root, 'kit/pad.py'), str(dur + 1), pad], check=True)
    fc = ('[0]aresample=48000,highpass=f=70,equalizer=f=200:t=q:w=1:g=1.5,'
          'acompressor=threshold=-20dB:ratio=2.5:attack=10:release=150:makeup=1.5,pan=stereo|c0=c0|c1=c0,asplit[v][sc];'
          '[1]lowpass=f=2500,volume=0.13[m];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=30:release=700[md];'
          '[v][md]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000')
    os.makedirs(os.path.join(root, 'remotion/public'), exist_ok=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', narr, '-i', pad, '-filter_complex', fc, '-c:a', 'aac',
                    '-b:a', '160k', '-ar', '48000', '-t', f'{dur:.3f}', os.path.join(root, 'remotion/public/narration.m4a')],
                   check=True)
print(f'{len(scenes)} cảnh, {total} khung hình ({acc:.1f} s) → remotion/src/data.json, public/narration.m4a, stills.txt')
