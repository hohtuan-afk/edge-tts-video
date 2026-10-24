"""Từ thư mục MP3 (audio/<cảnh>-<câu>.mp3) -> timing.json + narration.wav cho một dự án.

Dùng:  python3 kit/build_timing.py projects/<ten-du-an> [thu-muc-audio]
- Cắt khoảng lặng đầu/cuối từng câu, xếp câu nối tiếp trong mỗi cảnh (LEAD đầu cảnh, GAP giữa câu, TAIL cuối cảnh).
- Thời lượng cảnh = max(lời đọc, 0,6 × SCENE_DUR, 6 s), làm tròn theo khung hình 25 fps.
- Ghi <dự án>/timing.json và <dự án>/narration.wav (mono 22050 Hz).
"""
import importlib.util, json, os, subprocess, sys, wave
import numpy as np

proj = sys.argv[1]
audio = sys.argv[2] if len(sys.argv) > 2 else "audio"
SR, FPS = 22050, 25
LEAD = float(os.environ.get("LEAD", 0.7))
GAP = float(os.environ.get("GAP", 0.55))
TAIL = float(os.environ.get("TAIL", 1.3))
MIN = float(os.environ.get("MIN", 6.0))

spec = importlib.util.spec_from_file_location("narr", os.path.join(proj, "narr.py"))
narr = importlib.util.module_from_spec(spec)
spec.loader.exec_module(narr)


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-af",
                          "silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
                          "silenceremove=start_periods=1:start_threshold=-50dB,areverse",
                          "-ar", str(SR), "-ac", "1", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32)


timing, track = [], []
for i, sc in enumerate(narr.NARR):
    t, sents, clips = LEAD, [], []
    for j, (disp, _) in enumerate(sc):
        a = load(os.path.join(audio, f"{i:02d}-{j}.mp3"))
        d = len(a) / SR
        sents.append({"start": round(t, 3), "dur": round(d, 3), "text": disp})
        clips.append((t, a))
        t += d + GAP
    orig = narr.SCENE_DUR[i]
    dur = round(max(t - GAP + TAIL, orig * 0.6 if MIN >= 6 else 0, MIN) * FPS) / FPS
    buf = np.zeros(int(dur * SR) + 1, np.float32)
    for st, a in clips:
        k = int(st * SR)
        buf[k:k + len(a)] += a[: len(buf) - k]
    track.append(buf)
    timing.append({"orig": orig, "dur": dur, "sents": sents})

full = np.concatenate(track)
full = full / max(1, np.abs(full).max()) * 0.89 * 32767
with wave.open(os.path.join(proj, "narration.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(full.astype(np.int16).tobytes())
json.dump(timing, open(os.path.join(proj, "timing.json"), "w"), ensure_ascii=False, indent=1)
print("tổng", round(sum(x["dur"] for x in timing), 2), "giây")
for i, x in enumerate(timing):
    print(f"cảnh {i:02d}: gốc {x['orig']}s -> {x['dur']}s, câu bắt đầu tại", [s["start"] for s in x["sents"]])
