"""Video: Cơ chế sinh lý bệnh suy hô hấp — dựng bằng PIL + ffmpeg."""
import math, os, sys, subprocess
from functools import lru_cache
from PIL import Image, ImageDraw, ImageFont

W, H = 1920, 1080
S = 4 / 3
CW, CH = int(W * S), int(H * S)
FPS = 25

BG = (12, 20, 34)
PANEL = (22, 33, 52)
LINE = (52, 70, 98)
TXT = (234, 240, 247)
MUTED = (140, 158, 182)
O2 = (255, 107, 107)
CO2 = (84, 166, 247)
AMBER = (245, 184, 65)
GREEN = (76, 195, 138)
VIOLET = (167, 139, 250)
VEN = (120, 92, 170)
ART = (214, 70, 86)

FD = "/usr/share/fonts/opentype/inter/"
FW = {"R": "Inter-Regular.otf", "M": "Inter-Medium.otf", "S": "Inter-SemiBold.otf",
      "B": "Inter-Bold.otf", "X": "InterDisplay-ExtraBold.otf", "I": "Inter-Italic.otf"}


@lru_cache(None)
def font(w, size):
    return ImageFont.truetype(FD + FW[w], int(size * S))


def mix(c, a, bg=BG):
    a = max(0.0, min(1.0, a))
    return tuple(int(bg[i] + (c[i] - bg[i]) * a) for i in range(3))


def lerpc(c1, c2, k):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * k) for i in range(3))


def ease(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


def fi(t, start, dur=0.6):
    return ease((t - start) / dur)


def fio(t, start, end, dur=0.5):
    return min(fi(t, start, dur), 1 - fi(t, end - dur, dur))


def p(*v):
    return [x * S for x in v]


# ---------- primitives ----------
def text(d, x, y, s, size=36, col=TXT, a=1, w="R", anchor="la", bg=BG):
    if a <= 0.01:
        return
    d.text((x * S, y * S), s, font=font(w, size), fill=mix(col, a, bg), anchor=anchor)


def tlen(s, size, w="R"):
    return font(w, size).getlength(s) / S


def wrap(s, size, maxw, w="R"):
    words, lines, cur = s.split(" "), [], ""
    for wd in words:
        t = (cur + " " + wd).strip()
        if tlen(t, size, w) > maxw and cur:
            lines.append(cur)
            cur = wd
        else:
            cur = t
    if cur:
        lines.append(cur)
    return lines


def para(d, x, y, s, size, maxw, col=TXT, a=1, w="R", lh=1.35, anchor="la", bg=BG):
    ls = wrap(s, size, maxw, w)
    for i, l in enumerate(ls):
        text(d, x, y + i * size * lh, l, size, col, a, w, anchor, bg)
    return len(ls) * size * lh


def rect(d, x0, y0, x1, y1, fill=None, outline=None, width=2, r=14, a=1, bg=BG):
    if a <= 0.01:
        return
    d.rounded_rectangle(p(x0, y0, x1, y1), radius=r * S,
                        fill=mix(fill, a, bg) if fill else None,
                        outline=mix(outline, a, bg) if outline else None,
                        width=int(width * S) if outline else 0)


def circle(d, cx, cy, r, fill=None, outline=None, width=3, a=1, bg=BG):
    if a <= 0.01 or r <= 0:
        return
    d.ellipse(p(cx - r, cy - r, cx + r, cy + r),
              fill=mix(fill, a, bg) if fill else None,
              outline=mix(outline, a, bg) if outline else None,
              width=int(width * S) if outline else 0)


def line(d, pts, col, width=3, a=1, bg=BG):
    if a <= 0.01:
        return
    d.line([v * S for pt in pts for v in pt], fill=mix(col, a, bg), width=int(width * S), joint="curve")


def arrow(d, x0, y0, x1, y1, col, width=4, a=1, head=16, prog=1.0, bg=BG):
    if a <= 0.01 or prog <= 0.01:
        return
    x1 = x0 + (x1 - x0) * prog
    y1 = y0 + (y1 - y0) * prog
    ang = math.atan2(y1 - y0, x1 - x0)
    bx, by = x1 - head * 0.8 * math.cos(ang), y1 - head * 0.8 * math.sin(ang)
    line(d, [(x0, y0), (bx, by)], col, width, a, bg)
    pts = [(x1, y1),
           (x1 - head * math.cos(ang - 0.45), y1 - head * math.sin(ang - 0.45)),
           (x1 - head * math.cos(ang + 0.45), y1 - head * math.sin(ang + 0.45))]
    d.polygon([v * S for pt in pts for v in pt], fill=mix(col, a, bg))


def along(pts, f):
    segs = [math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1)]
    L = sum(segs)
    tgt = f * L
    for i, sl in enumerate(segs):
        if tgt <= sl or i == len(segs) - 1:
            k = 0 if sl == 0 else min(1, tgt / sl)
            return (pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k,
                    pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k)
        tgt -= sl


def particles(d, pathf, n, t, period, col, r=7, a=1, fade_ends=True):
    t = REAL_T
    for i in range(n):
        ph = (t / period + i / n) % 1.0
        x, y = along(pathf(i), ph)
        aa = a
        if fade_ends:
            aa *= min(1, ph / 0.08, (1 - ph) / 0.08)
        circle(d, x, y, r, fill=col, a=aa)


# ---------- alveolus unit ----------
def alveolus(d, cx, cy, r, t, a=1, mode="normal", o2n=10, co2n=6, label=None):
    """mode: normal | low | shunt | dead | hypo | thick"""
    cap_y0, cap_y1 = cy + r - 6, cy + r + 46
    cx0, cx1 = cx - r - 70, cx + r + 70
    # airway
    aw_w = 34 if mode != "low" else 14
    rect(d, cx - aw_w / 2, cy - r - 130, cx + aw_w / 2, cy - r + 20, fill=(30, 46, 70), a=a, r=6)
    # capillary
    flow = mode != "dead"
    steps = 24
    for k in range(steps):
        x0 = cx0 + (cx1 - cx0) * k / steps
        x1 = cx0 + (cx1 - cx0) * (k + 1) / steps
        if mode in ("shunt", "dead"):
            c = VEN
        elif mode == "low":
            c = lerpc(VEN, ART, min(1, k / steps * 1.4) * 0.55)
        elif mode == "hypo":
            c = lerpc(VEN, ART, min(1, k / steps * 1.6) * 0.6)
        elif mode == "thick":
            c = lerpc(VEN, ART, min(1, k / steps * 1.1) * 0.75)
        else:
            c = lerpc(VEN, ART, min(1, k / steps * 2.2))
        rect(d, x0, cap_y0, x1 + 1, cap_y1, fill=c, a=a, r=0)
    d.rounded_rectangle(p(cx0, cap_y0, cx1, cap_y1), radius=22 * S, outline=mix((90, 60, 90), a), width=int(2 * S))
    # alveolus
    fill = (24, 44, 70)
    if mode == "shunt":
        fill = (52, 84, 120)
    circle(d, cx, cy, r, fill=fill, outline=(150, 190, 225) if mode != "thick" else AMBER,
           width=4 if mode != "thick" else 12, a=a)
    if mode == "shunt":
        # fluid waves
        for k in range(4):
            yy = cy - r * 0.55 + k * r * 0.35
            hw = math.sqrt(max(0, r * r - (yy - cy) ** 2)) * 0.8
            pts = [(cx - hw + j * hw / 8, yy + 6 * math.sin(j * 1.3 + t * 3)) for j in range(17)]
            line(d, pts, (120, 170, 215), 3, a * 0.8)
    if mode == "dead":
        # clot / no flow
        circle(d, cx - r * 0.2, (cap_y0 + cap_y1) / 2, 26, fill=(70, 30, 40), outline=(220, 90, 90), width=3, a=a)
        line(d, [(cx - r * 0.2 - 14, cap_y0 + 12), (cx - r * 0.2 + 14, cap_y1 - 12)], TXT, 4, a)
        line(d, [(cx - r * 0.2 + 14, cap_y0 + 12), (cx - r * 0.2 - 14, cap_y1 - 12)], TXT, 4, a)

    jit = lambda i: ((i * 37) % 11 - 5) / 5.0 * r * 0.55
    if mode != "shunt":
        if mode == "dead":
            def o2path(i):
                j = jit(i)
                return [(cx + j * 0.1, cy - r - 130), (cx + j, cy - r * 0.2), (cx + j * 0.8, cy + r * 0.3),
                        (cx + j * 0.1, cy - r * 0.6), (cx, cy - r - 130)]
            particles(d, o2path, o2n, t, 3.2, O2, 7, a)
        else:
            cross = mode not in ()
            def o2path(i):
                j = jit(i)
                return [(cx + j * 0.1, cy - r - 130), (cx + j, cy), (cx + j, (cap_y0 + cap_y1) / 2),
                        (cx1 + 10, (cap_y0 + cap_y1) / 2 + ((i * 13) % 7 - 3) * 4)]
            nn = o2n
            if mode == "low":
                nn = max(2, o2n // 3)
            if mode == "hypo":
                nn = max(2, o2n // 3)
            per = 3.4 if mode != "thick" else 5.0
            particles(d, o2path, nn, t, per, O2, 7, a)
    if flow:
        def co2path(i):
            j = jit(i + 3)
            return [(cx0 - 10, (cap_y0 + cap_y1) / 2 + ((i * 7) % 5 - 2) * 5), (cx + j, (cap_y0 + cap_y1) / 2),
                    (cx + j, cy), (cx - j * 0.1, cy - r - 130)]
        nn = co2n if mode != "hypo" else max(1, co2n // 3)
        if mode == "shunt":
            def co2path(i):
                return [(cx0 - 10, (cap_y0 + cap_y1) / 2 + ((i * 7) % 5 - 2) * 5),
                        (cx1 + 10, (cap_y0 + cap_y1) / 2 + ((i * 7) % 5 - 2) * 5)]
        particles(d, co2path, nn, t, 3.8, CO2, 7, a)
    if mode == "hypo":
        # trapped CO2 accumulating inside alveolus
        for k in range(9):
            ang = k * 2.4 + 0.3
            rr = r * (0.25 + 0.5 * ((k * 0.37) % 1))
            circle(d, cx + rr * math.cos(ang + t * 0.4), cy + rr * math.sin(ang + t * 0.4), 7, fill=CO2, a=a * 0.85)
    if label:
        text(d, cx, cap_y1 + 30, label, 26, TXT, a, "S", "ma")
    return cap_y1


# ---------- frame chrome ----------
def header(d, num, title, a=1):
    rect(d, 80, 60, 80 + 64, 60 + 44, fill=AMBER, r=10, a=a)
    text(d, 112, 82, num, 24, BG, a, "B", "mm", bg=AMBER)
    text(d, 166, 82, title, 40, TXT, a, "B", "lm")


def caption(d, caps, t, T):
    return


def draw_caption(d, caps, t, T):
    cur = None
    for i, (st, s) in enumerate(caps):
        en = caps[i + 1][0] if i + 1 < len(caps) else T
        if st <= t < en:
            cur = (st, en, s)
    if not cur:
        return
    st, en, s = cur
    if not s:
        return
    a = fio(t, st, en, 0.35)
    ls = wrap(s, 31, 1500, "M")
    hgt = len(ls) * 42 + 30
    y0 = 1040 - hgt
    rect(d, 960 - 800, y0, 960 + 800, 1040, fill=(8, 13, 24), outline=(40, 56, 80), width=2, r=16, a=a * 0.95)
    for i, l in enumerate(ls):
        text(d, 960, y0 + 18 + i * 42, l, 31, TXT, a, "M", "ma", bg=(8, 13, 24))


def legend(d, x, y, a=1):
    circle(d, x, y, 8, fill=O2, a=a)
    text(d, x + 18, y, "O₂", 24, TXT, a, "S", "lm")
    circle(d, x + 90, y, 8, fill=CO2, a=a)
    text(d, x + 108, y, "CO₂", 24, TXT, a, "S", "lm")



# ======================= SCENES: Cấu tạo máy thở tổng quát =======================
from narr import STEP

AIRC = (240, 205, 90)      # khí nén
OXC = (90, 200, 120)       # oxy
MIXC = (120, 175, 235)     # hỗn hợp
TUBE = (70, 92, 122)
HOT = (240, 95, 70)
WARM = (245, 160, 70)
COLD = (120, 160, 210)
PINK = (214, 110, 130)
BACT = (140, 225, 90)
REDX = (235, 80, 80)
STN = ["ĐIỆN", "KHÍ", "DÂY", "ẨM", "LỌC", "ĐO", "PHUN"]
STN_COL = [AMBER, OXC, CO2, (90, 205, 230), O2, VIOLET, (240, 140, 90)]


def G(k):
    return STEP * k


def A(t, k, off=0.2, dur=0.6):
    return fi(t, G(k) + off, dur)


def rt():
    return REAL_T


# ---------- small widgets ----------
def roadmap(d, cur, a=1):
    if a <= 0.01:
        return
    ws = [tlen(s, 22, "B") + 30 for s in STN]
    x = 1840 - (sum(ws) + 8 * (len(ws) - 1))
    for i, (s, w) in enumerate(zip(STN, ws)):
        on = cur == "all" or i == cur
        past = cur != "all" and i < cur
        fill = AMBER if on else PANEL
        rect(d, x, 64, x + w, 100, fill=fill, outline=AMBER if (on or past) else LINE, width=2, r=18, a=a)
        text(d, x + w / 2, 82, s, 22, BG if on else (TXT if past else MUTED), a, "B", "mm", bg=fill)
        x += w + 8


def memo(d, x0, y0, x1, y1, s, a, size=34, col=AMBER):
    if a <= 0.01:
        return
    bgc = mix(col, 0.12)
    rect(d, x0, y0, x1, y1, fill=bgc, outline=col, width=3, r=18, a=a)
    tw = tlen("GHI NHỚ", 20, "B") + 28
    rect(d, x0 + 24, y0 - 16, x0 + 24 + tw, y0 + 16, fill=col, r=14, a=a)
    text(d, x0 + 24 + tw / 2, y0, "GHI NHỚ", 20, BG, a, "B", "mm", bg=col)
    ls = wrap(s, size, x1 - x0 - 80, "B")
    h = len(ls) * size * 1.3
    for i, l in enumerate(ls):
        text(d, (x0 + x1) / 2, (y0 + y1) / 2 - h / 2 + i * size * 1.3 + 4, l, size, TXT, a, "B", "ma", bg=bgc)


def badge(d, x, y, n, a, col=AMBER, r=20):
    circle(d, x, y, r, fill=col, a=a)
    text(d, x, y, str(n), int(r * 1.15), BG, a, "B", "mm", bg=col)


def chip(d, x0, y0, x1, y1, s, col, a, size=26, fill_k=0.16, w="S", tcol=TXT):
    if a <= 0.01:
        return
    bgc = mix(col, fill_k, PANEL) if fill_k else PANEL
    rect(d, x0, y0, x1, y1, fill=bgc, outline=col, width=2, r=(y1 - y0) / 2 if y1 - y0 < 70 else 16, a=a)
    ls = wrap(s, size, x1 - x0 - 40, w)
    h = len(ls) * size * 1.3
    for i, l in enumerate(ls):
        text(d, (x0 + x1) / 2, (y0 + y1) / 2 - h / 2 + i * size * 1.3 + size * 0.65, l, size, tcol, a, w, "mm", bg=bgc)


def card(d, x0, y0, x1, y1, title, col, a, tsize=30):
    if a <= 0.01:
        return
    rect(d, x0, y0, x1, y1, fill=PANEL, outline=col, width=2, r=18, a=a)
    rect(d, x0, y0, x1, y0 + 8, fill=col, r=4, a=a, bg=PANEL)
    text(d, x0 + 28, y0 + 48, title, tsize, col, a, "B", "lm", bg=PANEL)


def rows(d, x, y, items, a_list, size=27, gap=46, bg=PANEL, col=TXT):
    for i, s in enumerate(items):
        aa = a_list[i] if isinstance(a_list, (list, tuple)) else a_list
        text(d, x, y + i * gap, s, size, col, aa, "M", "lm", bg=bg)


def xmark(d, x, y, r, a, col=REDX, w=7):
    line(d, [(x - r, y - r), (x + r, y + r)], col, w, a)
    line(d, [(x + r, y - r), (x - r, y + r)], col, w, a)


def tag(d, x, y, s, col, a, size=24, bg=BG):
    if a <= 0.01:
        return
    w = tlen(s, size, "B") + 24
    rect(d, x - w / 2, y - size * 0.8, x + w / 2, y + size * 0.8, fill=mix(col, 0.18, bg), outline=col, width=2, r=10, a=a, bg=bg)
    text(d, x, y, s, size, col, a, "B", "mm", bg=mix(col, 0.18, bg))


def fan(d, cx, cy, r, a, speed=1.0, col=TXT, bg=PANEL):
    circle(d, cx, cy, r, outline=col, width=3, a=a, bg=bg)
    ang = rt() * 6 * speed
    for k in range(3):
        th = ang + k * 2 * math.pi / 3
        line(d, [(cx, cy), (cx + r * 0.85 * math.cos(th), cy + r * 0.85 * math.sin(th))], col, 8, a, bg)
    circle(d, cx, cy, 6, fill=col, a=a, bg=bg)


def lungs(d, cx, cy, s, a, bg=BG):
    if a <= 0.01:
        return
    k = 1 + 0.06 * math.sin(2 * math.pi * rt() / 4)
    for sx in (-1, 1):
        ex = cx + sx * s * 0.48
        d.ellipse(p(ex - s * 0.42 * k, cy - s * 0.55 * k, ex + s * 0.42 * k, cy + s * 0.7 * k),
                  fill=mix(PINK, a, bg), outline=mix((240, 165, 180), a, bg), width=int(3 * S))
    tc = (175, 190, 215)
    line(d, [(cx, cy - s * 1.25), (cx, cy - s * 0.3)], tc, max(4, s * 0.14), a, bg)
    line(d, [(cx, cy - s * 0.32), (cx - s * 0.36, cy + s * 0.05)], tc, max(3, s * 0.09), a, bg)
    line(d, [(cx, cy - s * 0.32), (cx + s * 0.36, cy + s * 0.05)], tc, max(3, s * 0.09), a, bg)


def draw_tube(d, path, colf, w, a, bg=BG, n=36):
    if a <= 0.01:
        return
    for k in range(n):
        p0 = along(path, k / n)
        p1 = along(path, (k + 1) / n)
        c = colf((k + 0.5) / n) if callable(colf) else colf
        line(d, [p0, p1], c, w, a, bg)


def dotted(d, path, col, a, w=4, n=40, bg=BG, off=(0, 0)):
    for k in range(0, n, 2):
        p0 = along(path, k / n)
        p1 = along(path, (k + 1) / n)
        line(d, [(p0[0] + off[0], p0[1] + off[1]), (p1[0] + off[0], p1[1] + off[1])], col, w, a, bg)


def flowdots(d, path, n, period, colf, a, r=7, bg=BG, rev=False):
    if a <= 0.01:
        return
    for i in range(n):
        ph = (rt() / period + i / n) % 1.0
        f = 1 - ph if rev else ph
        x, y = along(path, f)
        aa = a * min(1, ph / 0.08, (1 - ph) / 0.08)
        c = colf(ph) if callable(colf) else colf
        circle(d, x, y, r, fill=c, a=aa, bg=bg)


# ---------- ventilator circuit ----------
def geo(bx, by, bw, bh):
    g = {"m": (bx, by + 0.1 * bh, bx + 0.2 * bw, by + 0.9 * bh)}
    g["pe"] = (bx + 0.2 * bw, by + 0.3 * bh)
    g["pi"] = (bx + 0.2 * bw, by + 0.7 * bh)
    g["Y"] = (bx + 0.72 * bw, by + 0.5 * bh)
    g["exp"] = [g["Y"], (bx + 0.62 * bw, by + 0.3 * bh), g["pe"]]
    g["insp"] = [g["pi"], (bx + 0.62 * bw, by + 0.7 * bh), g["Y"]]
    s = min(0.11 * bw, 0.26 * bh)
    lc = (bx + 0.9 * bw, by + 0.64 * bh)
    g["ls"], g["lc"] = s, lc
    g["pat"] = [g["Y"], (lc[0], by + 0.5 * bh), (lc[0], lc[1] - s * 1.25)]
    return g


def circuit(d, bx, by, bw, bh, a=1, flow=1.0, igrad=None, egrad=None, label="MÁY THỞ", tw=14, show_lungs=True):
    g = geo(bx, by, bw, bh)
    if a <= 0.01:
        return g
    mx0, my0, mx1, my1 = g["m"]
    rect(d, mx0, my0, mx1, my1, fill=PANEL, outline=LINE, width=3, r=16, a=a)
    if label:
        text(d, (mx0 + mx1) / 2, (my0 + my1) / 2, label, max(18, min(28, bw * 0.02)), MUTED, a, "B", "mm", bg=PANEL)
    draw_tube(d, g["exp"], egrad or TUBE, tw, a)
    draw_tube(d, g["insp"], igrad or TUBE, tw, a)
    line(d, g["pat"], TUBE, tw - 4, a)
    for pt in (g["pe"], g["pi"]):
        rect(d, pt[0] - 11, pt[1] - 13, pt[0] + 11, pt[1] + 13, fill=BG, outline=TXT, width=2, r=2, a=a)
        line(d, [(pt[0] - 11, pt[1] - 13), (pt[0] + 11, pt[1] + 13)], TXT, 2, a)
        line(d, [(pt[0] + 11, pt[1] - 13), (pt[0] - 11, pt[1] + 13)], TXT, 2, a)
    if show_lungs:
        lungs(d, g["lc"][0], g["lc"][1], g["ls"], a)
    circle(d, g["Y"][0], g["Y"][1], tw * 0.95, fill=(225, 190, 80), a=a)
    if flow > 0.01:
        flowdots(d, g["insp"] + g["pat"][1:], 9, 3.6, O2, a * flow)
        flowdots(d, list(reversed(g["pat"])) + g["exp"][1:], 7, 4.2, CO2, a * flow)
    return g


def humid(d, x, y, a, w=96, h=84, temp=None, bg=BG):
    if a <= 0.01:
        return
    rect(d, x - w / 2, y + 14, x + w / 2, y + 14 + h, fill=(40, 60, 88), outline=(150, 190, 225), width=2, r=10, a=a, bg=bg)
    lvl = y + 14 + h * 0.45 + 3 * math.sin(rt() * 2)
    rect(d, x - w / 2 + 5, lvl, x + w / 2 - 5, y + 10 + h, fill=(60, 120, 190), r=6, a=a, bg=bg)
    rect(d, x - w / 2 - 8, y + 16 + h, x + w / 2 + 8, y + 34 + h, fill=(90, 60, 50), r=4, a=a, bg=bg)
    line(d, [(x - 14, y), (x - 14, y + 16)], TUBE, 8, a, bg)
    line(d, [(x + 14, y), (x + 14, y + 16)], TUBE, 8, a, bg)


def trap(d, x, y, a, bg=BG):
    rect(d, x - 11, y + 6, x + 11, y + 46, fill=(40, 60, 88), outline=(150, 190, 225), width=2, r=8, a=a, bg=bg)
    rect(d, x - 8, y + 28, x + 8, y + 43, fill=(60, 120, 190), r=5, a=a, bg=bg)


def thermo_dot(d, x, y, a, bg=BG):
    circle(d, x, y, 9, fill=REDX, outline=TXT, width=2, a=a, bg=bg)


def bact(d, x, y, r, a, bg=BG):
    circle(d, x, y, r, fill=BACT, a=a, bg=bg)
    for k in range(6):
        th = k * math.pi / 3 + rt()
        line(d, [(x + r * math.cos(th), y + r * math.sin(th)), (x + r * 1.6 * math.cos(th), y + r * 1.6 * math.sin(th))], BACT, 2, a, bg)


# ======================= 0. Tiêu đề =======================
def sc0(d, t, T):
    a = fi(t, 0.1, 0.8)
    circuit(d, 420, 140, 1080, 440, a * 0.95)
    text(d, 960, 690, "CẤU TẠO MÁY THỞ", 96, TXT, fi(t, 0.5, 0.8), "X", "mm")
    text(d, 960, 785, "Tổng quát · hành trình 7 trạm của luồng khí", 40, AMBER, fi(t, 1.0, 0.8), "S", "mm")
    text(d, 960, 860, "Theo bài giảng BS. Đặng Thanh Tuấn – BV Nhi Đồng 1 · Tập huấn thở máy, Bộ Y tế",
         24, MUTED, fi(t, 1.5, 0.8), "R", "mm")


# ======================= 1. Toàn cảnh =======================
def sc1(d, t, T):
    header(d, "01", "Toàn cảnh hệ thống máy thở", fi(t, 0))
    a0 = A(t, 0)
    bx, by, bw, bh = 400, 140, 1380, 480
    g = circuit(d, bx, by, bw, bh, a0, flow=fi(t, G(2) + 0.5))
    mx0, my0, mx1, my1 = g["m"]
    a1 = A(t, 1)
    gy, ey = by + 0.36 * bh, by + 0.66 * bh
    line(d, [(150, gy), (mx0, gy)], OXC, 12, a1)
    flowdots(d, [(150, gy), (mx0, gy)], 4, 2.0, OXC, a1 * 0.9, r=5)
    zz = [(150 + k * 25, ey + (10 if k % 2 else -10)) for k in range(int((mx0 - 150) / 25) + 1)]
    line(d, zz, AMBER, 5, a1)
    badge(d, 170, gy - 50, 1, a1)
    text(d, 200, gy - 50, "Khí nén / Oxy", 26, OXC, a1, "S", "lm")
    badge(d, 170, ey + 50, 2, a1)
    text(d, 200, ey + 50, "Nguồn điện", 26, AMBER, a1, "S", "lm")
    badge(d, (mx0 + mx1) / 2, my0 - 28, 3, a1)
    a2 = A(t, 2)
    ex = along(g["exp"], 0.5)
    badge(d, ex[0] - 60, ex[1] - 48, 4, a2)
    text(d, ex[0] - 30, ex[1] - 48, "Bộ dây máy thở", 26, TXT, a2, "S", "lm")
    pt = g["pat"][1]
    badge(d, g["Y"][0] + 20, pt[1] - 48, 5, a2)
    text(d, g["Y"][0] + 50, pt[1] - 48, "Đường thở", 26, TXT, a2, "S", "lm")
    lc, s = g["lc"], g["ls"]
    badge(d, lc[0] - 40, lc[1] + s * 0.95, 6, a2)
    text(d, lc[0] - 10, lc[1] + s * 0.95, "Phổi", 26, TXT, a2, "S", "lm")
    # 7 trạm
    a3 = A(t, 3)
    if a3 > 0.01:
        text(d, 960, 680, "Hành trình 7 trạm", 30, AMBER, a3, "B", "mm")
        cw, gap = 190, 32
        x0 = 960 - (7 * cw + 6 * gap) / 2
        for i, s_ in enumerate(STN):
            ai = fi(t, G(3) + 0.4 + i * 0.35)
            x = x0 + i * (cw + gap)
            rect(d, x, 720, x + cw, 800, fill=mix(STN_COL[i], 0.2), outline=STN_COL[i], width=3, r=18, a=ai)
            text(d, x + cw / 2, 760, s_, 34, STN_COL[i], ai, "X", "mm", bg=mix(STN_COL[i], 0.2))
            if i < 6:
                arrow(d, x + cw + 4, 760, x + cw + gap - 4, 760, MUTED, 3, ai, 12)


# ======================= 2. Điện =======================
def sc2(d, t, T):
    header(d, "02", "Trạm 1 · Điện", fi(t, 0))
    roadmap(d, 0, fi(t, 0))
    a0 = A(t, 0)
    off = fi(t, G(2) + 0.8, 0.8)
    pc = lerpc(AMBER, (95, 100, 110), off)
    px, py = 210, 420
    rect(d, px - 60, py - 52, px + 24, py + 52, fill=PANEL, outline=pc, width=3, r=12, a=a0)
    line(d, [(px - 92, py - 22), (px - 60, py - 22)], pc, 9, a0)
    line(d, [(px - 92, py + 22), (px - 60, py + 22)], pc, 9, a0)
    text(d, px - 18, py + 92, "AC 220 V", 30, pc, a0, "B", "mm")
    line(d, [(px + 24, py), (560, py)], pc, 8, a0)
    if off > 0.01:
        xmark(d, 400, py, 26, off)
        tag(d, 400, py - 70, "MẤT ĐIỆN", REDX, off, 26)
    # máy thở
    rect(d, 560, 190, 950, 650, fill=PANEL, outline=LINE, width=3, r=20, a=a0)
    text(d, 755, 222, "MÁY THỞ", 24, MUTED, a0, "B", "mm", bg=PANEL)
    a1 = A(t, 1)
    brain = lerpc(LINE, GREEN, a1)
    rect(d, 600, 255, 910, 395, fill=(18, 34, 52), outline=brain, width=3, r=10, a=a0, bg=PANEL)
    wave = [(615 + k * 7, 340 - 40 * max(0, math.sin((k * 7 + rt() * 160) / 40)) ** 3) for k in range(40)]
    line(d, wave, GREEN, 3, a0, (18, 34, 52))
    text(d, 755, 420, "Màn hình", 24, TXT, a0, "S", "mm", bg=PANEL)
    rect(d, 600, 450, 910, 520, fill=(18, 34, 52), outline=brain, width=3, r=10, a=a0, bg=PANEL)
    text(d, 755, 485, "Điều khiển nhịp thở", 24, TXT, a0, "S", "mm", bg=(18, 34, 52))
    # pin
    if a1 > 0.01:
        lvl = 1 - 0.75 * ease((t - G(2) - 0.8) / (G(4) - G(2)))
        rect(d, 650, 555, 840, 615, outline=GREEN, width=3, r=8, a=a1, bg=PANEL)
        rect(d, 840, 572, 852, 598, fill=GREEN, r=3, a=a1, bg=PANEL)
        col = GREEN if lvl > 0.4 else AMBER
        rect(d, 656, 561, 656 + 178 * lvl, 609, fill=col, r=5, a=a1, bg=PANEL)
        tag(d, 755, 690, "Pin nuôi: màn hình + điều khiển", GREEN, a1, 24)
    # cơ bắp
    for k, (nm, y0) in enumerate([("Máy nén khí", 230), ("Máy làm ẩm", 460)]):
        dim = 1 - 0.55 * off
        line(d, [(950, y0 + 70), (1070, y0 + 70)], pc, 6, a0)
        rect(d, 1070, y0, 1390, y0 + 140, fill=PANEL, outline=LINE, width=3, r=16, a=a0 * dim)
        text(d, 1280, y0 + 70, nm, 28, TXT, a0 * dim, "B", "mm", bg=PANEL)
        if k == 0:
            fan(d, 1130, y0 + 70, 34, a0 * dim, speed=1 - off)
        else:
            rect(d, 1100, y0 + 50, 1160, y0 + 110, fill=(40, 60, 88), outline=COLD, width=2, r=6, a=a0 * dim, bg=PANEL)
            rect(d, 1104, y0 + 80, 1156, y0 + 106, fill=(60, 120, 190), r=4, a=a0 * dim, bg=PANEL)
        if off > 0.01:
            xmark(d, 1360, y0 + 26, 16, off, w=6)
    tag(d, 1230, 640, "Pin KHÔNG cấp điện", REDX, fi(t, G(2) + 0.3), 24)
    # thời gian pin
    a3 = A(t, 3)
    rect(d, 1460, 210, 1840, 620, fill=PANEL, outline=LINE, width=2, r=20, a=a3)
    text(d, 1650, 265, "Pin dự phòng", 30, AMBER, a3, "B", "mm", bg=PANEL)
    text(d, 1650, 360, "30–60", 72, TXT, a3, "X", "mm", bg=PANEL)
    text(d, 1650, 425, "phút", 30, TXT, a3, "S", "mm", bg=PANEL)
    text(d, 1650, 500, "Máy để không:", 26, MUTED, a3, "M", "mm", bg=PANEL)
    text(d, 1650, 550, "sạc 8 giờ / tuần", 32, TXT, a3, "B", "mm", bg=PANEL)
    memo(d, 260, 750, 1660, 880, "Pin nuôi BỘ NÃO — không nuôi CƠ BẮP", A(t, 4), 40)


# ======================= 3. Khí =======================
def gauge(d, cx, cy, r, val, a, col, bg=BG):
    circle(d, cx, cy, r, fill=PANEL, outline=col, width=4, a=a, bg=bg)
    for k in range(9):
        th = math.pi * (0.8 + 1.4 * k / 8)
        line(d, [(cx + r * 0.78 * math.cos(th), cy + r * 0.78 * math.sin(th)),
                 (cx + r * 0.92 * math.cos(th), cy + r * 0.92 * math.sin(th))], MUTED, 2, a, PANEL)
    th = math.pi * (0.8 + 1.4 * val)
    line(d, [(cx, cy), (cx + r * 0.72 * math.cos(th), cy + r * 0.72 * math.sin(th))], AMBER, 5, a, PANEL)
    circle(d, cx, cy, 7, fill=AMBER, a=a, bg=PANEL)


def sc3(d, t, T):
    header(d, "03", "Trạm 2 · Nguồn khí", fi(t, 0))
    roadmap(d, 1, fi(t, 0))
    a0, a1, a2, a3 = A(t, 0), A(t, 1), A(t, 2), A(t, 3)
    groups = [("KHÍ NÉN · 21% O₂", AIRC, ["Máy nén khí theo máy", "Khí nén trung tâm"], 180, 300),
              ("OXY · 100%", OXC, ["Oxy bình", "Oxy lỏng trung tâm"], 470, 570)]
    regs = []
    for gi, (nm, col, items, y0, ry) in enumerate(groups):
        text(d, 120, y0 - 30, nm, 30, col, a0, "B", "lm")
        for k, it in enumerate(items):
            yy = y0 + 10 + k * 80
            rect(d, 120, yy, 500, yy + 62, fill=PANEL, outline=col, width=2, r=14, a=a1)
            text(d, 140, yy + 31, it, 26, TXT, a1, "S", "lm", bg=PANEL)
            line(d, [(500, yy + 31), (620, yy + 31), (620, ry), (760, ry)], col, 8, a1)
        regs.append((820, ry, col))
    for cx, cy, col in regs:
        gauge(d, cx, cy, 58, 0.15 + 0.5 * a2, a1, col)
        text(d, cx, cy + 82, "Điều áp", 24, TXT, a1, "S", "mm")
    tag(d, 820, 440, "50 psi ≈ 3,5 bar", AMBER, a2, 28)
    # ống tới ổ cắm
    air_path = [(878, 300), (1080, 300), (1080, 400), (1200, 400)]
    oxy_path = [(878, 570), (1080, 570), (1080, 470), (1200, 470)]
    line(d, air_path, AIRC, 8, a2)
    line(d, oxy_path, OXC, 8, a2)
    flowdots(d, [(620, 210), (620, 300)] + air_path, 5, 2.4, AIRC, a2, r=6)
    flowdots(d, [(620, 520), (620, 570)] + oxy_path, 5, 2.4, OXC, a2, r=6)
    rect(d, 1200, 320, 1810, 560, fill=PANEL, outline=LINE, width=3, r=20, a=a3)
    text(d, 1505, 355, "Ổ CẮM ĐẦU GIƯỜNG", 26, MUTED, a3, "B", "mm", bg=PANEL)
    socks = [("Oxy", OXC), ("Oxy", OXC), ("Air", AIRC), ("Hút", (150, 155, 170))]
    for k, (nm, col) in enumerate(socks):
        x = 1300 + k * 135
        ak = fi(t, G(3) + 0.3 + k * 0.4)
        circle(d, x, 445, 40, fill=mix(col, 0.25, PANEL), outline=col, width=5, a=ak, bg=PANEL)
        circle(d, x, 445, 13, fill=BG, a=ak, bg=mix(col, 0.25, PANEL))
        text(d, x, 520, nm, 26, col, ak, "B", "mm", bg=PANEL)
    text(d, 1505, 605, "Hồi sức ngoại: thêm 1 ổ hút (5 ổ)", 26, MUTED, fi(t, G(3) + 2.2), "M", "mm")


# ======================= 4. Trộn khí =======================
def sc4(d, t, T):
    header(d, "04", "Máy trộn khí như thế nào?", fi(t, 0))
    roadmap(d, 1, fi(t, 0))
    a0, a1, a2, a3, a4 = (A(t, k) for k in range(5))
    card(d, 140, 140, 920, 420, "Máy có tua-bin bên trong", OXC, a0)
    fan(d, 240, 300, 56, a0, 1.4, OXC)
    text(d, 330, 250, "Chỉ cần nguồn OXY", 32, TXT, a0, "B", "lm", bg=PANEL)
    text(d, 330, 300, "PB 760 · Savina · Servo air · Hamilton", 22, MUTED, a0, "M", "lm", bg=PANEL)
    para(d, 330, 340, "→ hợp BV huyện, khoa thiếu khí nén trung tâm", 24, 560, TXT, a0, "M", bg=PANEL)
    card(d, 1000, 140, 1780, 420, "Máy thở ICU", CO2, a1)
    line(d, [(1050, 255), (1140, 255)], OXC, 12, a1, PANEL)
    line(d, [(1050, 305), (1140, 305)], AIRC, 12, a1, PANEL)
    text(d, 1170, 255, "Cần cả OXY + KHÍ NÉN", 32, TXT, a1, "B", "lm", bg=PANEL)
    para(d, 1170, 300, "GE R860 · Servo i/u/n · Dräger V300 / VN500 · PB 840 / 980", 22, 580, MUTED, a1, "M", bg=PANEL)
    # bộ trộn
    op = [(150, 560), (560, 560), (700, 600)]
    ap = [(150, 720), (560, 720), (700, 660)]
    line(d, op, OXC, 14, a2)
    line(d, ap, AIRC, 14, a2)
    text(d, 150, 520, "Oxy 100%", 26, OXC, a2, "B", "lm")
    text(d, 150, 765, "Khí nén 21%", 26, AIRC, a2, "B", "lm")
    flowdots(d, op, 5, 2.2, OXC, a2, r=6)
    flowdots(d, ap, 5, 2.2, AIRC, a2, r=6)
    rect(d, 700, 540, 890, 720, fill=mix(AMBER, 0.85), r=16, a=a2)
    text(d, 795, 600, "Bộ trộn", 28, BG, a2, "B", "mm", bg=mix(AMBER, 0.85))
    text(d, 795, 650, "FiO₂ 40%", 30, BG, a2, "X", "mm", bg=mix(AMBER, 0.85))
    outp = [(890, 630), (1800, 630)]
    line(d, outp, MIXC, 22, a2)
    flowdots(d, outp, 9, 3.0, (230, 240, 250), a2, r=6)
    text(d, 1600, 590, "Hỗn hợp 40% →", 26, MIXC, a2, "B", "mm")
    # cảm biến
    rect(d, 1110, 560, 1250, 612, fill=(225, 190, 80), r=10, a=a3)
    text(d, 1180, 586, "O₂ cell", 22, BG, a3, "B", "mm", bg=(225, 190, 80))
    rect(d, 1100, 470, 1260, 530, fill=PANEL, outline=GREEN, width=3, r=12, a=a3)
    text(d, 1180, 500, f"{int(21 + 19 * ease((t - G(3)) / 1.5))}%", 32, GREEN, a3, "X", "mm", bg=PANEL)
    text(d, 1290, 500, "đo SAU khi trộn → báo động nếu lệch", 24, TXT, a3, "M", "lm")
    chip(d, 940, 690, 1340, 760, "Loại thường: thay 3–6 tháng", AMBER, a4, 25)
    chip(d, 1380, 690, 1800, 760, "Loại siêu âm: không cần thay", GREEN, a4, 25)


# ======================= 5. Bộ dây =======================
def sc5(d, t, T):
    header(d, "05", "Trạm 3 · Bộ dây máy thở", fi(t, 0))
    roadmap(d, 2, fi(t, 0))
    a0, a1, a2, a3 = (A(t, k) for k in range(4))
    bx, by, bw, bh = 140, 130, 1140, 440
    g = circuit(d, bx, by, bw, bh, a0)
    ip = along(g["insp"], 0.47)
    ep = along(g["exp"], 0.25)
    text(d, ip[0], ip[1] - 36, "Nhánh hít vào", 26, O2, a0, "B", "mm")
    text(d, ep[0] + 40, ep[1] - 40, "Nhánh thở ra", 26, CO2, a0, "B", "mm")
    text(d, g["Y"][0], g["Y"][1] - 42, "chữ Y", 24, (225, 190, 80), a0, "B", "mm")
    hp = along(g["insp"], 0.28)
    humid(d, hp[0], hp[1], a1)
    text(d, hp[0], hp[1] + 140, "Làm ẩm & ấm", 24, TXT, a1, "S", "mm")
    tp1 = along(g["insp"], 0.62)
    tp2 = along(g["exp"], 0.72)
    trap(d, tp1[0], tp1[1], a1)
    trap(d, tp2[0], tp2[1], a1)
    text(d, tp2[0], tp2[1] + 70, "Bẫy nước", 22, MUTED, a1, "S", "mm")
    yp = along(g["insp"], 0.93)
    thermo_dot(d, yp[0], yp[1], a1)
    text(d, yp[0] + 20, yp[1] + 34, "Nhiệt kế", 22, MUTED, a1, "S", "lm")
    # cỡ dây
    for k, (mm, who, kg, col) in enumerate([(8, "Sơ sinh", "< 7 kg", VIOLET), (15, "Trẻ em", "7–25 kg", CO2),
                                            (22, "Người lớn", "> 25 kg", O2)]):
        ak = fi(t, G(2) + 0.3 + k * 0.8)
        cx = 240 + k * 370
        circle(d, cx, 720, mm * 3, fill=BG, outline=col, width=8, a=ak)
        text(d, cx + 100, 700, f"{mm} mm", 40, col, ak, "X", "lm")
        text(d, cx + 100, 750, f"{who} · {kg}", 24, TXT, ak, "M", "lm")
    memo(d, 1360, 600, 1820, 860, "8 – 15 – 22", a3, 64)


# ======================= 6. Chất liệu =======================
def corrugated(d, x0, x1, y, amp, a, col, bg=PANEL):
    b = amp * (0.5 + 0.5 * math.sin(2 * math.pi * rt() / 2.4))
    h = 22 + b
    rect(d, x0, y - h, x1, y + h, fill=mix(col, 0.35, bg), outline=col, width=3, r=h, a=a, bg=bg)
    for x in range(int(x0 + 18), int(x1 - 10), 16):
        line(d, [(x, y - h + 4), (x, y + h - 4)], col, 2, a * 0.7, mix(col, 0.35, bg))


def sc6(d, t, T):
    header(d, "06", "Chất liệu dây: PVC · Hytrel · Silicone", fi(t, 0))
    roadmap(d, 2, fi(t, 0))
    mats = [("PVC", (110, 170, 240), 16, [("Giá", "rẻ"), ("Đàn hồi", "nhiều"), ("Hấp", "không"), ("Dùng", "1 lần")]),
            ("Hytrel", (220, 200, 150), 6, [("Giá", "đắt"), ("Đàn hồi", "ít · cứng, giòn"), ("Hấp", "được"), ("Độ bền", "mau hư")]),
            ("Silicone", (150, 200, 230), 3, [("Giá", "đắt"), ("Đàn hồi", "ít"), ("Hấp", "được"), ("Độ bền", "dùng nhiều lần")])]
    for k, (nm, col, amp, props) in enumerate(mats):
        ak = A(t, k)
        x0 = 140 + k * 560
        card(d, x0, 140, x0 + 520, 640, nm, col, ak, 36)
        corrugated(d, x0 + 40, x0 + 480, 270, amp, ak, col)
        for j, (lb, v) in enumerate(props):
            y = 370 + j * 64
            text(d, x0 + 40, y, lb, 26, MUTED, ak, "M", "lm", bg=PANEL)
            text(d, x0 + 200, y, v, 28, TXT, ak, "B", "lm", bg=PANEL)
    a3 = A(t, 3)
    text(d, 140, 700, "Độ đàn hồi", 28, AMBER, a3, "B", "lm")
    for k, (nm, val, col) in enumerate([("PVC", 1.0, (110, 170, 240)), ("Hytrel", 0.5, (220, 200, 150)),
                                         ("Silicone", 0.25, (150, 200, 230))]):
        x = 360 + k * 480
        rect(d, x, 680, x + 380 * val * a3 + 1, 720, fill=col, r=10, a=a3)
        text(d, x, 760, nm, 26, TXT, a3, "S", "lm")
        if k < 2:
            text(d, x + 430, 700, ">", 40, AMBER, a3, "X", "mm")
    text(d, 960, 840, "→ dây càng đàn hồi, thể tích nén càng lớn", 30, TXT, fi(t, G(3) + 1.5), "B", "mm")


# ======================= 7. Thể tích nén =======================
def vbar(d, x, y, w, val, vmax, col, lab, a, vtxt=None):
    h = 300 * val / vmax
    rect(d, x, y - 300, x + w, y, fill=(28, 40, 60), r=10, a=a)
    rect(d, x, y - h, x + w, y, fill=col, r=10, a=a)
    text(d, x + w / 2, y - h - 28, vtxt or f"{val:.0f} mL", 30, col, a, "X", "mm")
    para(d, x + w / 2, y + 16, lab, 22, w + 40, TXT, a, "S", anchor="ma")


def sc7(d, t, T):
    header(d, "07", "Thể tích nén", fi(t, 0))
    roadmap(d, 2, fi(t, 0))
    a0, a1, a2, a3, a4 = (A(t, k) for k in range(5))
    # ống phồng
    ph = 0.5 + 0.5 * math.sin(2 * math.pi * rt() / 3)
    b = 26 * ph * a0
    rect(d, 140, 230, 230, 330, fill=PANEL, outline=LINE, width=3, r=12, a=a0)
    text(d, 185, 280, "Máy", 22, MUTED, a0, "B", "mm", bg=PANEL)
    rect(d, 230, 280 - 26 - b, 900, 280 + 26 + b, fill=mix(CO2, 0.25), outline=CO2, width=3, r=26 + b, a=a0)
    for k in range(10):
        x = 270 + ((k * 64 + rt() * 120) % 600)
        circle(d, x, 280 + 10 * math.sin(k), 7, fill=O2, a=a0, bg=mix(CO2, 0.25))
    lungs(d, 980, 300, 70, a0)
    text(d, 560, 380, "dây giãn ra + khí bị nén", 26, TXT, a0, "S", "mm")
    chip(d, 140, 430, 1000, 490, "Dây + bình làm ẩm càng to: NL > TE > SS", AMBER, a1, 25)
    chip(d, 140, 505, 1000, 565, "Dây càng đàn hồi: PVC > Hytrel > Silicone", AMBER, a1, 25)
    # cột thể tích
    k4 = fi(t, G(4) + 0.5, 1.2)
    sent = 500 + 50 * k4
    got = 450 + 50 * k4
    vbar(d, 1130, 560, 150, sent, 600, O2, "Máy đẩy ra", a2)
    vbar(d, 1370, 560, 150, 50, 600, CO2, "Ở lại trong dây", a2)
    vbar(d, 1610, 560, 150, got, 600, GREEN if k4 > 0.9 else AMBER, "Bệnh nhân nhận", a2)
    # công thức
    rect(d, 140, 630, 1800, 880, fill=PANEL, outline=LINE, width=2, r=18, a=a3)
    text(d, 180, 680, "Tự kiểm tra máy:", 26, AMBER, a3, "B", "lm", bg=PANEL)
    text(d, 480, 680, "C dây = ΔV / ΔP   (mL/cmH₂O)", 32, TXT, a3, "B", "lm", bg=PANEL)
    text(d, 180, 750, "Mỗi nhịp:", 26, AMBER, a4, "B", "lm", bg=PANEL)
    text(d, 480, 750, "VT nén = C dây × (P đỉnh − PEEP)", 32, TXT, a4, "B", "lm", bg=PANEL)
    text(d, 480, 820, "VD: 2 × (30 − 5) = 50 mL  →  máy đẩy 500 + 50 = 550 mL", 28, GREEN, fi(t, G(4) + 1.2), "S", "lm", bg=PANEL)


# ======================= 8. Làm ẩm & ấm =======================
def sc8(d, t, T):
    header(d, "08", "Trạm 4 · Làm ẩm & ấm", fi(t, 0))
    roadmap(d, 3, fi(t, 0))
    a0, a1, a2, a3 = (A(t, k) for k in range(4))
    chip(d, 1270, 150, 1820, 210, "Chủ động: máy làm ẩm gia nhiệt", HOT, a0, 24)
    chip(d, 1270, 225, 1820, 285, "Thụ động: HME (mũi nhân tạo)", GREEN, a0, 24)
    # A: không dây nhiệt
    bx, bw, bh = 130, 1100, 330
    by = 220
    gA = geo(bx, by, bw, bh)
    hA = 0.28

    def igA(f):
        return TUBE if f < hA else lerpc(HOT, WARM, (f - hA) / (1 - hA))
    circuit(d, bx, by, bw, bh, a1, igrad=igA, egrad=lambda f: lerpc(WARM, COLD, f), label="Máy thở", tw=12)
    hp = along(gA["insp"], hA)
    humid(d, hp[0], hp[1], a1, 80, 64)
    tag(d, hp[0], hp[1] + 130, "≈ 45 °C", HOT, a1)
    tag(d, gA["Y"][0] + 10, gA["Y"][1] - 50, "37 °C", WARM, a1)
    tag(d, gA["pe"][0] + 70, gA["pe"][1] - 44, "≈ 30 °C", COLD, a1)
    for k in range(12):
        f = 0.15 + 0.07 * k
        x, y = along(gA["exp"], f)
        circle(d, x + 4 * math.sin(k * 3), y + 12, 4 + 2 * ((k * 7) % 3), fill=(110, 170, 240), a=a1 * fi(t, G(1) + 0.8 + k * 0.2))
    tp = along(gA["exp"], 0.72)
    trap(d, tp[0], tp[1], a1)
    text(d, 1270, 340, "Không dây nhiệt", 30, TXT, a1, "B", "lm")
    para(d, 1270, 380, "Bình đẩy ~45 °C vì khí nguội dần → đọng nước nhiều, cần bẫy nước", 24, 550, MUTED, a1, "M")
    # B: có dây nhiệt
    by2 = 560
    gB = geo(bx, by2, bw, bh)

    def igB(f):
        return TUBE if f < hA else WARM
    egB = (lambda f: lerpc(TUBE, WARM, a3))
    circuit(d, bx, by2, bw, bh, a2, igrad=igB, egrad=egB, label="Máy thở", tw=12)
    hp2 = along(gB["insp"], hA)
    humid(d, hp2[0], hp2[1], a2, 80, 64)
    seg = [along(gB["insp"], hA + 0.04 + k * (0.92 - hA) / 30) for k in range(31)]
    dotted(d, seg, AMBER, a2, 4, 30, off=(0, -14))
    tag(d, hp2[0], hp2[1] + 128, "37 °C", WARM, a2)
    mid = along(gB["insp"], 0.7)
    tag(d, mid[0] + 40, mid[1] + 44, "dây 39 °C", AMBER, a2)
    tag(d, gB["Y"][0] + 10, gB["Y"][1] - 50, "37 °C", WARM, a2)
    thermo_dot(d, hp2[0] + 30, hp2[1], a2)
    yp = along(gB["insp"], 0.95)
    thermo_dot(d, yp[0], yp[1], a2)
    if a3 > 0.01:
        segE = [along(gB["exp"], 0.06 + k * 0.88 / 30) for k in range(31)]
        dotted(d, segE, AMBER, a3, 4, 30, off=(0, -14))
    text(d, 1270, 640, "Có dây nhiệt (hít vào)", 30, TXT, a2, "B", "lm")
    para(d, 1270, 680, "Cảm biến nhiệt kép ở bình và chữ Y", 24, 550, MUTED, a2, "M")
    para(d, 1270, 760, "2 nhánh: nung cả nhánh thở ra → hạn chế đọng nước", 24, 550, AMBER, a3, "S")


# ======================= 9. So sánh =======================
def thermometer(d, x, y, val, a, bg=PANEL):
    rect(d, x - 14, y - 150, x + 14, y + 20, fill=(28, 40, 60), outline=TXT, width=2, r=14, a=a, bg=bg)
    circle(d, x, y + 34, 26, fill=HOT, outline=TXT, width=2, a=a, bg=bg)
    h = 20 + 150 * val
    rect(d, x - 7, y + 20 - h, x + 7, y + 22, fill=HOT, r=7, a=a, bg=bg)
    for k, (v, lab, col) in enumerate([(0.85, "cao", HOT), (0.5, "37 °C", GREEN), (0.15, "thấp", COLD)]):
        yy = y + 20 - (20 + 150 * v)
        line(d, [(x + 18, yy), (x + 34, yy)], col, 3, a, bg)
        text(d, x + 42, yy, lab, 20, col, a, "S", "lm", bg=bg)


def sc9(d, t, T):
    header(d, "09", "So sánh 2 loại máy làm ẩm", fi(t, 0))
    roadmap(d, 3, fi(t, 0))
    a0, a1, a2, a3 = (A(t, k) for k in range(4))
    card(d, 140, 140, 930, 680, "KHÔNG dây nhiệt", COLD, a0, 34)
    thermometer(d, 800, 360, 0.5 + 0.38 * math.sin(2 * math.pi * rt() / 3.2), a0)
    rows(d, 180, 250, ["Nhiệt độ dao động:", "• thấp → đàm đặc, mất nhiệt", "• cao → quá tải nước, bỏng"], a0)
    rows(d, 180, 460, ["• Cần điều dưỡng theo dõi", "• Dễ nhiễm trùng bệnh viện", "• Rẻ hơn · lâu hư"], a1)
    card(d, 990, 140, 1780, 680, "CÓ dây nhiệt", HOT, a2, 34)
    thermometer(d, 1650, 360, 0.5 + 0.02 * math.sin(2 * math.pi * rt() / 3.2), a2)
    rows(d, 1030, 250, ["Nhiệt độ ổn định", "• Ít cần theo dõi", "• Ít nhiễm trùng bệnh viện",
                        "• Đắt hơn", "• Dễ đứt dây điện trở"], a2)
    for k, (w, h, lab) in enumerate([(70, 70, "Trẻ em"), (100, 95, "Người lớn")]):
        cx = 760 + k * 400
        rect(d, cx - w / 2, 860 - h, cx + w / 2, 860, fill=(40, 60, 88), outline=COLD, width=3, r=12, a=a3)
        rect(d, cx - w / 2 + 6, 860 - h * 0.45, cx + w / 2 - 6, 854, fill=(60, 120, 190), r=8, a=a3)
        text(d, cx + w / 2 + 20, 830, lab, 28, TXT, a3, "B", "lm")
    text(d, 400, 810, "Bình chứa nước:", 28, AMBER, a3, "B", "lm")


# ======================= 10. HME =======================
def sc10(d, t, T):
    header(d, "10", "HME — chiếc “mũi nhân tạo”", fi(t, 0))
    roadmap(d, 3, fi(t, 0))
    a0, a1, a2, a3, a4 = (A(t, k) for k in range(5))
    y = 410
    rect(d, 160, y - 24, 830, y + 24, fill=(40, 56, 80), r=24, a=a0)
    rect(d, 1090, y - 24, 1500, y + 24, fill=(40, 56, 80), r=24, a=a0)
    line(d, [(1490, y), (1640, y), (1640, 340)], (40, 56, 80), 40, a0)
    lungs(d, 1640, 470, 105, a0)
    text(d, 160, y + 64, "← phía máy thở", 24, MUTED, a0, "S", "lm")
    text(d, 1760, 600, "bệnh nhân", 24, MUTED, a0, "S", "mm")
    # HME
    rect(d, 830, y - 110, 1090, y + 110, fill=mix(GREEN, 0.2), outline=GREEN, width=4, r=40, a=a0)
    zz = [(860 + k * 20, y - 80 if k % 2 else y + 80) for k in range(11)]
    line(d, zz, GREEN, 3, a0, mix(GREEN, 0.2))
    ph = (rt() % 6) / 6
    exh = ph < 0.5
    moist = (math.sin(2 * math.pi * rt() / 6) * 0.5 + 0.5)
    act = max(a1, 0.001) if a1 > 0.01 else 0
    if act:
        for k in range(14):
            if (k * 0.37) % 1 < moist:
                circle(d, 860 + (k * 37) % 200, y - 70 + (k * 53) % 140, 6, fill=(110, 170, 240), a=a1, bg=mix(GREEN, 0.2))
        f = (ph % 0.5) / 0.5
        for i in range(10):
            q = (f + i / 10) % 1
            x = 1640 - q * 1480 if exh else 160 + q * 1480
            yy = y + 10 * math.sin(i * 2.1)
            if exh:
                c = HOT if x > 1000 else COLD
            else:
                c = COLD if x < 900 else HOT
            if 830 < x < 1090:
                continue
            circle(d, x, yy, 9, fill=c, a=a1)
            if c == HOT:
                circle(d, x + 7, yy - 7, 4, fill=(110, 170, 240), a=a1)
        lab_a = a1 if exh else a2
        lab = "THỞ RA → giữ lại nhiệt + ẩm" if exh else "HÍT VÀO → trả lại nhiệt + ẩm"
        tag(d, 960, 250, lab, HOT if exh else GREEN, lab_a, 28)
    tag(d, 960, 560, "“Mũi nhân tạo” gắn ở chữ Y", GREEN, a0, 24)
    chip(d, 140, 660, 1000, 730, "Thở máy ngắn hạn < 24 giờ: hậu phẫu, ngộ độc", AMBER, a3, 25)
    chip(d, 1040, 660, 1780, 730, "Khoảng chết HME < 2 mL/kg", AMBER, a3, 25)
    for k, (lab, c1, c2) in enumerate([("HME", GREEN, GREEN), ("Phin lọc VK–VR", (230, 235, 240), (230, 235, 240)),
                                       ("HME-filter 2 trong 1", GREEN, (230, 235, 240))]):
        cx = 260 + k * 560
        circle(d, cx, 820, 34, fill=c1, a=a4)
        d.pieslice(p(cx - 34, 786, cx + 34, 854), 270, 90, fill=mix(c2, a4))
        text(d, cx + 52, 820, lab, 26, TXT, a4, "B", "lm")


# ======================= 11. Chống chỉ định HME =======================
def sc11(d, t, T):
    header(d, "11", "Khi nào KHÔNG dùng HME?", fi(t, 0))
    roadmap(d, 3, fi(t, 0))
    items = [("ĐÀM", "đàm đặc hoặc lẫn máu", 1),
             ("RÒ", "VTE < 70% VTI: rò phế quản – màng phổi, NKQ không bóng chèn", 1),
             ("LẠNH", "thân nhiệt < 32 °C", 2),
             ("THỞ MẠNH", "thông khí phút tự thở > 10 L/phút", 2),
             ("KHÍ DUNG", "đang phun khí dung trên dây máy thở", 3)]
    cols = [(150, 200, 120), O2, COLD, AMBER, VIOLET]
    for k, (kw, det, kk) in enumerate(items):
        x0 = 120 + k * 340
        ak = fi(t, G(0) + 0.5 + k * 0.45)
        rect(d, x0, 170, x0 + 320, 640, fill=PANEL, outline=cols[k], width=3, r=20, a=ak)
        text(d, x0 + 160, 250, kw, 44 if len(kw) < 6 else 36, cols[k], ak, "X", "mm", bg=PANEL)
        line(d, [(x0 + 40, 300), (x0 + 280, 300)], cols[k], 2, ak, PANEL)
        para(d, x0 + 160, 330, det, 26, 270, TXT, A(t, kk), "M", anchor="ma", bg=PANEL)
        xmark(d, x0 + 160, 560, 26, A(t, kk), REDX, 6)
    memo(d, 260, 700, 1660, 870, "ĐÀM · RÒ · LẠNH · THỞ MẠNH · KHÍ DUNG → KHÔNG dùng HME", fi(t, G(3) + 1.5), 36)


# ======================= 12. Bộ lọc =======================
def sc12(d, t, T):
    header(d, "12", "Trạm 5 · Bộ lọc khí (filter)", fi(t, 0))
    roadmap(d, 4, fi(t, 0))
    a0, a1, a2, a3, a4 = (A(t, k) for k in range(5))
    bx, by, bw, bh = 130, 140, 1120, 460
    g = circuit(d, bx, by, bw, bh, a0)
    fi_ = (g["pi"][0] + 40, g["pi"][1])
    fe_ = (g["pe"][0] + 40, g["pe"][1])
    for (x, y), c in [(fi_, O2), (fe_, CO2)]:
        circle(d, x, y, 26, fill=REDX, outline=TXT, width=3, a=a0)
    circle(d, g["Y"][0] + 40, g["Y"][1], 20, fill=(240, 220, 90), outline=TXT, width=2, a=a0)
    text(d, g["Y"][0] - 10, g["Y"][1] + 50, "HME / filter", 22, (240, 220, 90), a0, "S", "mm")
    text(d, fi_[0] + 10, fi_[1] + 56, "Filter hít vào", 22, TXT, a1, "S", "mm")
    text(d, fe_[0] + 10, fe_[1] - 52, "Filter thở ra", 22, TXT, a2, "S", "mm")
    mx1 = g["m"][2]
    for i in range(5):
        ph = (rt() / 3 + i / 5) % 1
        if a1 > 0.01:
            f = min(1, ph * 1.6)
            x = mx1 - 120 + f * (fi_[0] - 28 - (mx1 - 120))
            y = g["pi"][1] + (i - 2) * 9 + (3 * math.sin(rt() * 9 + i) if f >= 1 else 0)
            bact(d, x, y, 6, a1 * min(1, (1 - ph) / 0.1))
        if a2 > 0.01:
            path = list(reversed(g["pat"])) + g["exp"][1:]
            f = min(0.97, ph * 1.4)
            x, y = along(path, f)
            if f >= 0.97:
                x, y = fe_[0] + 30 + 3 * math.sin(rt() * 9 + i), fe_[1] + (i - 2) * 9
            bact(d, x, y, 6, a2 * min(1, (1 - ph) / 0.1))
    chip(d, 1300, 150, 1820, 260, "Lọc hít vào: chặn vi khuẩn từ máy → dây & bệnh nhân", O2, a1, 24)
    chip(d, 1300, 280, 1820, 390, "Lọc thở ra: chặn vi khuẩn từ bệnh nhân → máy & môi trường", CO2, a2, 24)
    chip(d, 1300, 410, 1820, 520, "Giữ hơi ẩm + thuốc khí dung → bảo vệ cảm biến thở ra", AMBER, a3, 24)
    text(d, 1560, 565, "Xử lý filter sau mỗi bệnh nhân", 24, MUTED, a4, "S", "mm")
    memo(d, 200, 690, 1720, 860, "Lọc VÀO bảo vệ bệnh nhân · Lọc RA bảo vệ máy & mọi người", a4, 36)


# ======================= 13. Khoảng chết cơ học =======================
def sc13(d, t, T):
    header(d, "13", "Khoảng chết cơ học", fi(t, 0))
    roadmap(d, 4, fi(t, 0))
    a0, a1, a2, a3 = (A(t, k) for k in range(4))
    y = 380
    # nhánh dây vào chữ Y
    line(d, [(120, 300), (260, y)], TUBE, 14, a0)
    line(d, [(120, 460), (260, y)], TUBE, 14, a0)
    circle(d, 270, y, 22, fill=(225, 190, 80), a=a0)
    text(d, 270, y - 50, "chữ Y", 24, (225, 190, 80), a0, "B", "mm")
    parts = [("HME", GREEN, 4), ("Filter", (230, 235, 240), 4), ("Cuvette CO₂", AMBER, 2),
             ("Cảm biến gần", VIOLET, 1.5), ("Ống nối mềm", CO2, 3)]
    line(d, [(290, y), (1300, y)], (230, 230, 230), 14, a0)
    x = 300
    vol = 0
    for k, (nm, col, v) in enumerate(parts):
        ak = fi(t, G(1) + 0.3 + k * 0.5)
        w = 200
        if ak > 0.01:
            rect(d, x, y - 50, x + w - 10, y + 50, fill=mix(col, 0.25), outline=col, width=3, r=14, a=ak)
            text(d, x + (w - 10) / 2, y, nm, 22, TXT, ak, "B", "mm", bg=mix(col, 0.25))
            vol += v * ak
        x += w
    xe = x
    line(d, [(1300, y), (1660, y)], (230, 230, 230), 14, a0)
    text(d, 1600, y - 40, "ống NKQ", 22, MUTED, a0, "S", "mm")
    lungs(d, 1760, 470, 90, a0)
    line(d, [(1660, y), (1760, y), (1760, 470 - 112)], (230, 230, 230), 14, a0)
    if a1 > 0.01:
        line(d, [(300, y - 80), (300, y - 70), (xe - 10, y - 70), (xe - 10, y - 80)], AMBER, 3, a0)
        text(d, (300 + xe) / 2, y - 100, "khoảng chết cơ học = mọi thứ SAU chữ Y", 26, AMBER, a0, "B", "mm")
    elif a0 > 0.01:
        text(d, 960, y - 100, "khoảng chết cơ học = mọi thứ gắn SAU chữ Y", 26, AMBER, a0, "B", "mm")
    # CO2 hít lại
    if a2 > 0.01:
        for i in range(6):
            q = 0.5 + 0.5 * math.sin(2 * math.pi * rt() / 3 + i * 0.9)
            circle(d, 320 + q * (xe - 340), y + 30 - (i % 3) * 22, 7, fill=CO2, a=a2)
    # thước
    lim = 6.0
    rect(d, 300, 560, 1500, 610, fill=(28, 40, 60), r=12, a=a2)
    fillw = 1200 * min(1.0, vol / 15)
    over = vol > lim
    rect(d, 300, 560, 300 + fillw, 610, fill=REDX if (over and a2 > 0.5) else GREEN, r=12, a=a2)
    xl = 300 + 1200 * lim / 15
    line(d, [(xl, 540), (xl, 630)], AMBER, 4, a2)
    text(d, xl, 660, "ngưỡng 2 mL/kg", 24, AMBER, a2, "B", "ma")
    text(d, 1530, 585, "→ ứ CO₂", 30, REDX, a2 * (1 if over else 0.3), "B", "lm")
    memo(d, 360, 740, 1560, 880, "Trẻ 3 kg → ngưỡng chỉ 6 mL!", a3, 44)


# ======================= 14. Cảm biến lưu lượng =======================
def sc14(d, t, T):
    header(d, "14", "Trạm 6 · Cảm biến lưu lượng", fi(t, 0))
    roadmap(d, 5, fi(t, 0))
    a0, a1, a2, a3, a4 = (A(t, k) for k in range(5))
    bx, by, bw, bh = 130, 130, 1120, 440
    g = circuit(d, bx, by, bw, bh, a0)
    mx0, my0, mx1, my1 = g["m"]
    for (px_, py_), lab, dy in [(g["pi"], "hít vào (trong máy)", 50), (g["pe"], "thở ra (trong máy)", -50)]:
        rect(d, px_ - 70, py_ - 16, px_ - 30, py_ + 16, fill=(110, 230, 110), r=4, a=a0)
        text(d, (mx0 + mx1) / 2, py_ + dy, lab, 20, (110, 230, 110), a0, "S", "mm", bg=PANEL)
    pt = along(g["pat"], 0.18)
    rect(d, pt[0] - 22, pt[1] - 18, pt[0] + 22, pt[1] + 18, fill=(110, 230, 110), r=4, a=a0)
    text(d, pt[0], pt[1] - 44, "gần bệnh nhân (chữ Y)", 22, (110, 230, 110), a0, "B", "mm")
    chip(d, 1300, 150, 1820, 230, "Kích hoạt theo lưu lượng", GREEN, a1, 25)
    chip(d, 1300, 245, 1820, 325, "Lưu lượng → thể tích", GREEN, a1, 25)
    chip(d, 1300, 340, 1820, 460, "Bù trừ thể tích, điều chỉnh áp lực (PRVC, VS)", GREEN, a2, 25)
    card(d, 140, 620, 940, 890, "Trong máy", CO2, a3, 30)
    rows(d, 180, 720, ["✓ Thường dùng · bền", "✗ Bị ảnh hưởng thể tích nén"], a3, 26, 50)
    card(d, 990, 620, 1790, 890, "Gần bệnh nhân (proximal)", (110, 230, 110), a4, 30)
    rows(d, 1030, 710, ["✓ Sơ sinh · chính xác, nhạy", "✓ Không cần tính thể tích nén", "✗ Dễ tắc đàm, dơ (không hấp)"], a4, 26, 50)


# ======================= 15. Khí dung =======================
def sc15(d, t, T):
    header(d, "15", "Trạm 7 · Khí dung trên máy thở", fi(t, 0))
    roadmap(d, 6, fi(t, 0))
    a0, a1, a2, a3 = (A(t, k) for k in range(4))
    bx, by, bw, bh = 130, 130, 1120, 460
    g = circuit(d, bx, by, bw, bh, a0, flow=0.5)
    np_ = along(g["insp"], 0.82)
    rect(d, np_[0] - 26, np_[1] + 10, np_[0] + 26, np_[1] + 80, fill=(200, 215, 230), outline=TXT, width=2, r=10, a=a0)
    line(d, [(np_[0], np_[1] + 80), (np_[0] - 40, np_[1] + 150), (np_[0] - 120, np_[1] + 150)], AIRC, 5, a0)
    text(d, np_[0] - 130, np_[1] + 150, "khí đẩy", 22, AIRC, a0, "S", "rm")
    text(d, np_[0] + 40, np_[1] + 60, "Bình phun", 22, TXT, a0, "S", "lm")
    if a2 > 0.01:
        path = [np_, g["Y"]] + g["exp"][1:]
        flowdots(d, path, 22, 3.0, (225, 230, 240), a2, r=5)
        flowdots(d, [np_, g["Y"]] + g["pat"][1:], 8, 2.2, (225, 230, 240), a2, r=5)
        tag(d, g["pe"][0] + 260, g["pe"][1] - 60, "hạt thuốc tới van thở ra", AMBER, a2, 22)
    if a3 > 0.01:
        fe = (g["pe"][0] + 40, g["pe"][1])
        circle(d, fe[0], fe[1], 26, fill=REDX, outline=TXT, width=3, a=a3)
        hy = (g["Y"][0] + 40, g["Y"][1])
        circle(d, hy[0], hy[1], 20, fill=GREEN, a=a3 * 0.5)
        xmark(d, hy[0], hy[1], 22, a3, REDX, 6)
    chip(d, 1300, 150, 1820, 240, "Phun phản lực (jet) — cần khí đẩy", AIRC, a1, 24)
    chip(d, 1300, 255, 1820, 345, "Siêu âm / lưới rung", CO2, a1, 24)
    chip(d, 1300, 360, 1820, 450, "Bình xịt định liều (MDI) + buồng đệm", VIOLET, a1, 24)
    chip(d, 140, 660, 940, 860, "① THÁO HME khi phun khí dung", REDX, a3, 34, w="B")
    chip(d, 980, 660, 1780, 860, "② GẮN filter thở ra suốt thời gian phun", GREEN, a3, 34, w="B")


# ======================= 16. Tóm tắt =======================
def sc16(d, t, T):
    header(d, "16", "Ôn tập 7 trạm", fi(t, 0))
    roadmap(d, "all", fi(t, 0))
    rows_ = [("ĐIỆN", "Pin nuôi bộ não · 30–60 phút · sạc 8 giờ/tuần", 0),
             ("KHÍ", "Điều áp 50 psi (≈ 3,5 bar) · cảm biến O₂ thay 3–6 tháng", 0),
             ("DÂY", "8 – 15 – 22 mm · càng đàn hồi, thể tích nén càng lớn", 1),
             ("ẨM", "Chữ Y ≈ 37 °C · HME < 24 giờ, tránh ĐÀM · RÒ · LẠNH · THỞ MẠNH · KHÍ DUNG", 2),
             ("LỌC", "Lọc vào bảo vệ BN, lọc ra bảo vệ máy · khoảng chết < 2 mL/kg", 3),
             ("ĐO", "Cảm biến gần BN: sơ sinh, chính xác · trong máy: bền", 3),
             ("PHUN", "Tháo HME · gắn filter thở ra", 3)]
    for i, (st, s, k) in enumerate(rows_):
        ak = fi(t, G(k) + 0.3 + (i % 3) * 0.4)
        y = 136 + i * 104
        col = STN_COL[i]
        rect(d, 140, y, 1780, y + 88, fill=PANEL, outline=LINE, width=2, r=16, a=ak)
        rect(d, 160, y + 14, 340, y + 74, fill=mix(col, 0.2, PANEL), outline=col, width=3, r=14, a=ak, bg=PANEL)
        text(d, 250, y + 44, st, 30, col, ak, "X", "mm", bg=mix(col, 0.2, PANEL))
        text(d, 370, y + 44, s, 28, TXT, ak, "M", "lm", bg=PANEL)


import json
from narr import NARR
FNS = [sc0, sc1, sc2, sc3, sc4, sc5, sc6, sc7, sc8, sc9, sc10, sc11, sc12, sc13, sc14, sc15, sc16]
TIMING = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "timing.json")))
# thời điểm (theo thời gian hoạt hình gốc) mà nội dung của từng câu bắt đầu xuất hiện
KEYS = [[0.2 if j == 0 else STEP * j for j in range(len(sc))] for sc in NARR]
SCENES = []
for i, fn in enumerate(FNS):
    tm = TIMING[i]
    pts = [(0.0, 0.0)]
    for st, k in zip([x["start"] for x in tm["sents"]], KEYS[i]):
        if st > pts[-1][0] and k >= pts[-1][1]:
            pts.append((st, k))
    pts.append((tm["dur"], max(tm["orig"], pts[-1][1] + 0.5)))
    caps = [(x["start"] - 0.15, x["text"]) for x in tm["sents"] if x["text"]]
    if caps:
        last = tm["sents"][-1]
        caps.append((last["start"] + last["dur"] + 0.6, ""))
    SCENES.append((fn, tm["dur"], pts, caps))
TOTAL = sum(s[1] for s in SCENES)
NF = int(round(TOTAL * FPS))
REAL_T = 0.0


def tmap(pts, t):
    for (a0, b0), (a1, b1) in zip(pts, pts[1:]):
        if t <= a1:
            return b0 + (b1 - b0) * (t - a0) / max(1e-6, a1 - a0)
    return pts[-1][1]


def render_frame(fidx):
    global REAL_T
    tt = fidx / FPS
    acc = 0
    for i, (fn, dur, pts, caps) in enumerate(SCENES):
        if tt < acc + dur or i == len(SCENES) - 1:
            break
        acc += dur
    t = tt - acc
    REAL_T = t
    img = Image.new("RGB", (CW, CH), BG)
    d = ImageDraw.Draw(img)
    ta = tmap(pts, t)
    fn(d, ta, pts[-1][1])
    if caps:
        draw_caption(d, [c for c in caps], t, dur)
    d.rectangle(p(0, 1074, W * tt / TOTAL, 1080), fill=AMBER)
    out = img.resize((W, H), Image.BOX)
    fade = min(1, t / 0.4, (dur - t) / 0.4) if i > 0 else min(1, t / 0.6, (dur - t) / 0.4)
    if i == len(SCENES) - 1:
        fade = min(1, t / 0.4, (dur - t) / 1.0)
    if fade < 1:
        out = Image.blend(Image.new("RGB", (W, H), BG), out, max(0, fade))
    return out.tobytes()


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "still":
        for s in sys.argv[2:]:
            fidx = int(float(s) * FPS)
            Image.frombytes("RGB", (W, H), render_frame(fidx)).save(f"still_{s}.png")
        sys.exit()
    from multiprocessing import Pool
    out = sys.argv[1] if len(sys.argv) > 1 else "out.mp4"
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium",
                           "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
    with Pool(2) as pool:
        for k, b in enumerate(pool.imap(render_frame, range(NF), chunksize=8)):
            ff.stdin.write(b)
            if k % 250 == 0:
                print(f"{k}/{NF}", flush=True)
    ff.stdin.close()
    ff.wait()
    print("done", TOTAL, "s")
