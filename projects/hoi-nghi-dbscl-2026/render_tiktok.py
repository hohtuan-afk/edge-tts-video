"""Dựng video TikTok 9:16 từ clip thật + giọng NamMinh + phụ đề.
Dùng: python3 render_tiktok.py <out.mp4> [cảnh_đầu cảnh_cuối]
"""
import json, os, subprocess, sys, textwrap
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.environ.get("SRC", "/mnt/user-data/attachments/2c73bd95-2496-5267-8fa4-e3213c5ccc85")
WORK = os.environ.get("WORK", "/tmp/claude-0/-home-claude/2c73bd95-2496-5267-8fa4-e3213c5ccc85/scratchpad/tk")
os.makedirs(WORK, exist_ok=True)
W, H, FPS = 1080, 1920, 30
F_BLACK = "/usr/share/fonts/opentype/inter/Inter-Black.otf"
F_XB = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
F_B = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"
RED, NAVY, GOLD = (215, 30, 45), (12, 40, 110), (255, 205, 60)

LANDSCAPE = {"4810"}

def clip(n):
    return next(os.path.join(SRC, f) for f in os.listdir(SRC) if f.endswith(f"IMG_{n}.mov"))

# Cảnh -> [(clip, giây vào, tỉ lệ thời lượng)], tiếng gốc, chip tiêu đề
SCENES = [
    dict(segs=[("4815", 1.0, 1.0)], amb=0.10, chip=None),
    dict(segs=[("4810", 1.5, 0.48), ("4811", 1.0, 0.52)], amb=0.45, chip=None),
    dict(segs=[("4812", 2.0, 1.0)], amb=0.40, chip=None),
    dict(segs=[("4814", 2.0, 0.42), ("4817", 0.0, 0.58)], amb=0.10, chip=None),
    dict(segs=[("4818", 0.0, 0.45), ("4819", 0.0, 0.55)], amb=0.06, chip=None),
    dict(segs=[("4822", 0.0, 0.5), ("4823", 1.0, 0.5)], amb=0.06, chip=None),
    dict(segs=[("4826", 0.0, 0.5), ("4827", 0.5, 0.5)], amb=0.06, chip=None),
    dict(segs=[("4828", 0.0, 0.45), ("4829", 2.0, 0.55)], amb=0.06, chip=None),
    dict(segs=[("4821", 1.0, 0.5), ("4815", 3.0, 0.5)], amb=0.06, chip=None),
]

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        print(r.stderr[-2000:]); sys.exit(1)

def seg_video(n, t0, dur, out, idx):
    src = clip(n)
    w, h = (1920, 1080) if n in LANDSCAPE else (1080, 1920)  # chỉ IMG_4810 quay ngang
    zoom = "scale=w='iw*(1.0+0.06*t/%.2f)':h=-2:eval=frame" % dur  # Ken Burns nhẹ
    grade = "eq=contrast=1.06:saturation=1.15:brightness=0.01"
    if w > h:  # clip ngang: khung 4:5 trên nền mờ
        vf = (f"[0:v]split[a][b];[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
              f"boxblur=30:2,eq=brightness=-0.12[bg];[b]crop=ih*0.8:ih,scale={W}:{int(W*1.25)},{grade}[fg];"
              f"[bg][fg]overlay=0:(H-h)/2-60,setsar=1,fps={FPS}[v]")
    else:
        vf = (f"[0:v]scale={int(W*1.08)}:-2,{zoom},crop={W}:{H},{grade},setsar=1,fps={FPS}[v]")
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(t0), "-t", f"{dur:.3f}", "-i", src,
         "-filter_complex", vf, "-map", "[v]", "-map", "0:a?", "-c:v", "libx264", "-preset", "veryfast",
         "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-ar", "48000", "-ac", "2", out])

# ---------- lớp chữ ----------
def font(p, s): return ImageFont.truetype(p, s)

def text_block(d, xy, lines, f, fill=(255, 255, 255), stroke=8, anchor="mm", gap=1.18):
    x, y = xy
    lh = f.size * gap
    y0 = y - lh * (len(lines) - 1) / 2
    for i, ln in enumerate(lines):
        d.text((x, y0 + i * lh), ln, font=f, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=(0, 0, 0))

def sub_png(text, path):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    f = font(F_XB, 48)
    import math
    nl = math.ceil(len(text) / 32)
    lines = textwrap.wrap(text, max(14, math.ceil(len(text) / nl) + 3))
    lh = 60; bh = lh * len(lines) + 40; cy = 1330
    # dải nền tối mờ cho dễ đọc
    box = Image.new("RGBA", (W, H), (0, 0, 0, 0)); bd = ImageDraw.Draw(box)
    bd.rounded_rectangle((60, cy - bh / 2, W - 60, cy + bh / 2), 28, fill=(0, 0, 0, 120))
    im = Image.alpha_composite(box, im); d = ImageDraw.Draw(im)
    for i, ln in enumerate(lines):
        d.text((W / 2, cy - lh * (len(lines) - 1) / 2 + i * lh), ln, font=f, fill=(255, 255, 255),
               anchor="mm", stroke_width=5, stroke_fill=(0, 0, 0))
    im.save(path)

def chunks(text, maxc=52):
    """Tách phụ đề dài thành các đoạn ngắn hiện lần lượt."""
    words, out, cur = text.split(), [], ""
    for w_ in words:
        if len(cur) + len(w_) + 1 > maxc and cur:
            out.append(cur); cur = w_
        else:
            cur = (cur + " " + w_).strip()
        if cur.endswith((",", ".", ":", "?", "!", "–")) and len(cur) > maxc * 0.55:
            out.append(cur); cur = ""
    if cur: out.append(cur)
    return out

def chip_png(text, path):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    text = text.replace("📍 ", "")
    f = font(F_XB, 40)
    tw = d.textlength(text, font=f)
    x0, y0 = (W - tw) / 2 - 34, 250
    d.rounded_rectangle((x0, y0, x0 + tw + 68, y0 + 78), 39, fill=RED + (235,))
    d.text((W / 2, y0 + 39), text, font=f, fill=(255, 255, 255), anchor="mm")
    # dòng tên hội nghị nhỏ phía trên
    f2 = font(F_B, 30)
    d.text((W / 2, 205), "HỘI NGHỊ KH HSCC & CHỐNG ĐỘC ĐBSCL · LẦN II", font=f2, fill=(255, 255, 255),
           anchor="mm", stroke_width=4, stroke_fill=(0, 0, 0))
    im.save(path)

def big_png(text, path, color=GOLD):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    lines = text.split("\n")
    f = font(F_BLACK, 118)
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
    text_block(sd, (W / 2, 800), lines, f, fill=(0, 0, 0, 255), stroke=14)
    sh = sh.filter(ImageFilter.GaussianBlur(14))
    im = Image.alpha_composite(im, sh); d = ImageDraw.Draw(im)
    for i, ln in enumerate(lines):
        col = (255, 255, 255) if i == 0 else color
        text_block(d, (W / 2, 800 - 70 + i * 140), [ln], f, fill=col, stroke=10)
    im.save(path)

# ---------- dựng ----------
def main():
    out = sys.argv[1]
    a, b = (int(sys.argv[2]), int(sys.argv[3])) if len(sys.argv) > 3 else (0, len(SCENES) - 1)
    timing = json.load(open(os.path.join(HERE, "timing.json"), encoding="utf-8"))
    parts, overlays, amb_parts, t = [], [], [], 0.0
    for i in range(a, b + 1):
        sc, tm = SCENES[i], timing[i]
        D = tm["dur"]
        for k, (n, t0, frac) in enumerate(sc["segs"]):
            p = f"{WORK}/s{i:02d}_{k}.mp4"
            seg_video(n, t0, D * frac, p, k); parts.append((p, sc["amb"]))
        if sc.get("chip"):
            cp = f"{WORK}/chip{i}.png"; chip_png(sc["chip"], cp); overlays.append((cp, t + 0.15, t + D))
        if sc.get("hook"):
            hp = f"{WORK}/hook{i}.png"; big_png(sc["hook"], hp); overlays.append((hp, t + 0.1, t + D - 0.1))
        if sc.get("end"):
            ep = f"{WORK}/end{i}.png"; big_png(sc["end"], ep); overlays.append((ep, t + tm["sents"][0]["start"], t + D))
        for j, s in enumerate(tm["sents"]):
            if sc.get("hook") or (sc.get("end") and j == 0):
                continue  # chữ lớn đã thay phụ đề
            cs = chunks(s["text"]); tot = sum(len(c) for c in cs); st = t + s["start"]
            end_s = t + (tm["sents"][j + 1]["start"] if j + 1 < len(tm["sents"]) else D) - 0.05
            for q, c in enumerate(cs):
                L = (end_s - st) * len(c) / tot if q == len(cs) - 1 else s["dur"] * len(c) / tot
                sp = f"{WORK}/sub{i}_{j}_{q}.png"; sub_png(c, sp); overlays.append((sp, st, st + L)); st += L
        t += D
    total = t
    # nối video (giữ tiếng gốc từng đoạn với mức riêng)
    inputs, fc = [], []
    for k, (p, amb) in enumerate(parts):
        inputs += ["-i", p]
        fc.append(f"[{k}:a]volume={amb}[a{k}]")
    fc.append("".join(f"[{k}:v][a{k}]" for k in range(len(parts))) + f"concat=n={len(parts)}:v=1:a=1[v0][amb]")
    last = "v0"; base = len(parts)
    for q, (png, s0, s1) in enumerate(overlays):
        inputs += ["-loop", "1", "-t", f"{total:.3f}", "-i", png]
        fc.append(f"[{base+q}:v]format=rgba,fade=in:st={s0:.3f}:d=0.18:alpha=1,fade=out:st={max(s0,s1-0.15):.3f}:d=0.15:alpha=1[o{q}]")
        fc.append(f"[{last}][o{q}]overlay=0:0:enable='between(t,{s0:.3f},{s1:.3f})'[v{q+1}]"); last = f"v{q+1}"
    # giọng đọc: lấy đoạn tương ứng trong narration.wav
    off = sum(timing[i]["dur"] for i in range(a))
    nidx = base + len(overlays)
    inputs += ["-ss", f"{off:.3f}", "-t", f"{total:.3f}", "-i", os.path.join(HERE, "narration.wav")]
    fc.append(f"[{nidx}:a]aresample=48000,aformat=channel_layouts=stereo,volume=1.6,asplit[nar][key]")
    fc.append("[amb][key]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[ambd]")
    fc.append("[nar][ambd]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[aout]")
    run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(fc), "-map", f"[{last}]", "-map", "[aout]",
         "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", str(FPS),
         "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-t", f"{total:.3f}", out])
    print("xong", out, round(total, 2), "s")

if __name__ == "__main__":
    main()
