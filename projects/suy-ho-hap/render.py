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


# ======================= SCENES =======================
def sc_title(d, t, T):
    a = fio(t, 0.2, T, 0.8)
    # breathing ring
    for k in range(3):
        rr = 210 + k * 60 + 18 * math.sin(t * 1.6 - k * 0.7)
        circle(d, 960, 430, rr, outline=lerpc(BG, CO2, 0.5 - k * 0.13), width=3, a=a)
    circle(d, 960, 430, 150 + 10 * math.sin(t * 1.6), fill=(24, 44, 70), outline=O2, width=5, a=a)
    text(d, 960, 430, "O₂ / CO₂", 46, TXT, a, "B", "mm", bg=(24, 44, 70))
    text(d, 960, 780, "SUY HÔ HẤP", 96, TXT, fi(t, 0.6, 0.8) * a, "X", "mm")
    text(d, 960, 870, "Cơ chế sinh lý bệnh", 46, AMBER, fi(t, 1.1, 0.8) * a, "S", "mm")
    text(d, 960, 940, "Từ bộ trao đổi khí đến bơm thông khí", 30, MUTED, fi(t, 1.6, 0.8) * a, "R", "mm")


def sc_def(d, t, T):
    header(d, "01", "Định nghĩa", fi(t, 0))
    a0 = fi(t, 0.4)
    para(d, 960, 150, "Hệ hô hấp không duy trì được trao đổi khí đủ cho nhu cầu chuyển hoá của cơ thể",
         38, 1760, TXT, a0, "M", anchor="ma")
    cards = [
        (300, "TYPE I", "Suy hô hấp giảm oxy máu", O2,
         ["PaO₂ < 60 mmHg", "(thở khí trời, FiO₂ 21%)", "PaCO₂ bình thường hoặc thấp", "→ hỏng bộ trao đổi khí"]),
        (1000, "TYPE II", "Suy hô hấp tăng CO₂ máu", CO2,
         ["PaCO₂ > 45–50 mmHg", "kèm pH < 7,35 (cấp)", "Thường kèm giảm PaO₂", "→ hỏng bơm thông khí"]),
    ]
    for i, (x, tag, name, col, rows) in enumerate(cards):
        a = fi(t, 1.6 + i * 1.6)
        oy = (1 - a) * 40
        rect(d, x, 300 + oy, x + 620, 760 + oy, fill=PANEL, outline=col, width=3, r=22, a=a)
        rect(d, x + 36, 336 + oy, x + 196, 384 + oy, fill=col, r=10, a=a, bg=PANEL)
        text(d, x + 116, 360 + oy, tag, 26, BG, a, "B", "mm", bg=col)
        text(d, x + 36, 420 + oy, name, 36, TXT, a, "B", bg=PANEL)
        for k, rw in enumerate(rows):
            ak = a * fi(t, 2.2 + i * 1.6 + k * 0.35)
            c = col if k == 0 else (MUTED if k == 3 else TXT)
            text(d, x + 36, 500 + oy + k * 58, rw, 38 if k == 0 else 30, c, ak, "B" if k == 0 else "M", bg=PANEL)
    a = fi(t, 8.2)
    text(d, 960, 820, "Cấp: pH giảm rõ  ·  Mạn: thận giữ HCO₃⁻ bù trừ, pH gần bình thường", 30, AMBER, a, "M", "ma")


def sc_two(d, t, T):
    header(d, "02", "Hai bộ phận của hệ hô hấp", fi(t, 0))
    # pump chain
    a = fi(t, 0.5)
    rect(d, 120, 160, 900, 830, fill=PANEL, outline=LINE, r=22, a=a)
    text(d, 510, 205, "BƠM THÔNG KHÍ", 34, CO2, a, "B", "mm", bg=PANEL)
    chain = [("Trung tâm hô hấp (hành não)", "drive"), ("Tuỷ sống · dây thần kinh hoành", "dẫn truyền"),
             ("Cơ hô hấp (cơ hoành, liên sườn)", "lực co"), ("Thành ngực · màng phổi · đường thở", "cơ học")]
    for k, (nm, sub) in enumerate(chain):
        ak = fi(t, 1.0 + k * 0.6)
        y = 270 + k * 135
        rect(d, 180, y, 840, y + 92, fill=(30, 46, 72), outline=CO2, width=2, r=14, a=ak, bg=PANEL)
        text(d, 210, y + 30, nm, 30, TXT, ak, "S", "lm", bg=(30, 46, 72))
        text(d, 210, y + 66, sub, 24, MUTED, ak, "R", "lm", bg=(30, 46, 72))
        if k < 3:
            arrow(d, 510, y + 96, 510, y + 132, CO2, 4, ak, 14, bg=PANEL)
    # exchanger
    a2 = fi(t, 3.6)
    rect(d, 1020, 160, 1800, 830, fill=PANEL, outline=LINE, r=22, a=a2)
    text(d, 1410, 205, "BỘ TRAO ĐỔI KHÍ", 34, O2, a2, "B", "mm", bg=PANEL)
    if a2 > 0.01:
        # mini alveolus on panel bg
        alveolus_panel(d, 1410, 470, 110, t, a2)
        text(d, 1410, 700, "Màng phế nang – mao mạch", 30, TXT, a2, "S", "mm", bg=PANEL)
        text(d, 1410, 745, "~300 triệu phế nang · ~70 m²", 26, MUTED, a2, "R", "mm", bg=PANEL)
    caps = [(0, "Hệ hô hấp gồm hai bộ phận nối tiếp: một cái bơm đưa khí ra vào, và một bộ trao đổi khí."),
            (4.5, "Bơm hỏng → không thải được CO₂ → TYPE II.   Bộ trao đổi khí hỏng → oxy không vào máu → TYPE I."),
            (10.5, "Trên lâm sàng hai cơ chế thường chồng lấp: suy type I kéo dài làm mỏi cơ → chuyển thành type II.")]
    caption(d, caps, t, T)


def alveolus_panel(d, cx, cy, r, t, a):
    # simplified normal alveolus drawn on PANEL bg
    cap_y0, cap_y1 = cy + r - 6, cy + r + 40
    cx0, cx1 = cx - r - 90, cx + r + 90
    for k in range(20):
        x0 = cx0 + (cx1 - cx0) * k / 20
        x1 = cx0 + (cx1 - cx0) * (k + 1) / 20
        rect(d, x0, cap_y0, x1 + 1, cap_y1, fill=lerpc(VEN, ART, min(1, k / 20 * 2.2)), a=a, r=0, bg=PANEL)
    rect(d, cx - 16, cy - r - 90, cx + 16, cy - r + 20, fill=(36, 56, 84), a=a, r=6, bg=PANEL)
    circle(d, cx, cy, r, fill=(28, 50, 78), outline=(150, 190, 225), width=4, a=a, bg=PANEL)
    jit = lambda i: ((i * 37) % 11 - 5) / 5.0 * r * 0.55
    my = (cap_y0 + cap_y1) / 2
    for i in range(8):
        ph = (REAL_T / 3.2 + i / 8) % 1
        x, y = along([(cx, cy - r - 90), (cx + jit(i), cy), (cx + jit(i), my), (cx1, my)], ph)
        circle(d, x, y, 6, fill=O2, a=a * min(1, ph / .08, (1 - ph) / .08), bg=PANEL)
    for i in range(5):
        ph = (REAL_T / 3.6 + i / 5) % 1
        x, y = along([(cx0, my), (cx - jit(i + 2), my), (cx - jit(i + 2), cy), (cx, cy - r - 90)], ph)
        circle(d, x, y, 6, fill=CO2, a=a * min(1, ph / .08, (1 - ph) / .08), bg=PANEL)


def sc_normal(d, t, T):
    header(d, "03", "Trao đổi khí bình thường", fi(t, 0))
    a = fi(t, 0.3, 0.8)
    alveolus(d, 960, 400, 170, t, a, "normal", o2n=12, co2n=7)
    legend(d, 1560, 140, a)
    al = fi(t, 1.5)
    text(d, 960, 400, "PAO₂ ≈ 100", 34, TXT, al, "B", "mm", bg=(24, 44, 70))
    text(d, 960, 445, "PACO₂ ≈ 40", 28, MUTED, al, "S", "mm", bg=(24, 44, 70))
    # venous / arterial labels
    a2 = fi(t, 2.6)
    text(d, 560, 690, "Máu tĩnh mạch", 28, VIOLET, a2, "B", "ma")
    text(d, 560, 728, "PvO₂ 40 · PvCO₂ 46", 26, MUTED, a2, "M", "ma")
    a3 = fi(t, 3.4)
    text(d, 1360, 690, "Máu động mạch", 28, O2, a3, "B", "ma")
    text(d, 1360, 728, "PaO₂ ~95 · PaCO₂ 40", 26, MUTED, a3, "M", "ma")
    a4 = fi(t, 4.4)
    arrow(d, 1220, 360, 1150, 520, AMBER, 3, a4, 14)
    text(d, 1230, 330, "màng < 0,5 µm", 26, AMBER, a4, "S")
    caps = [(0, "O₂ đi từ phế nang vào mao mạch, CO₂ đi theo chiều ngược lại — hoàn toàn nhờ khuếch tán thụ động theo chênh áp."),
            (5.5, "Đơn vị: mmHg. Máu chỉ cần ~0,25 giây trong tổng ~0,75 giây đi qua mao mạch để cân bằng — dự trữ rất lớn.")]
    caption(d, caps, t, T)


def sc_five(d, t, T):
    header(d, "04", "5 cơ chế gây giảm oxy máu", fi(t, 0))
    rows = [("1", "Giảm áp lực O₂ khí hít vào", "độ cao, FiO₂ thấp", "bình thường", GREEN),
            ("2", "Giảm thông khí phế nang", "PaCO₂ tăng kèm theo", "bình thường", GREEN),
            ("3", "Bất xứng thông khí / tưới máu (V/Q)", "cơ chế thường gặp nhất", "tăng · đáp ứng O₂ tốt", AMBER),
            ("4", "Shunt phải → trái", "V/Q = 0", "tăng · đáp ứng O₂ kém", O2),
            ("5", "Rối loạn khuếch tán", "nặng lên khi gắng sức", "tăng", AMBER)]
    a = fi(t, 0.4)
    text(d, 1330, 170, "Chênh áp A–a", 28, MUTED, a, "S", "la")
    for k, (n, nm, sub, aa, col) in enumerate(rows):
        ak = fi(t, 0.8 + k * 0.9)
        y = 215 + k * 128
        ox = (1 - ak) * -40
        rect(d, 140 + ox, y, 1780 + ox, y + 108, fill=PANEL, outline=LINE, r=16, a=ak)
        circle(d, 200 + ox, y + 54, 30, fill=AMBER if k >= 2 else MUTED, a=ak, bg=PANEL)
        text(d, 200 + ox, y + 54, n, 30, BG, ak, "B", "mm", bg=AMBER if k >= 2 else MUTED)
        text(d, 260 + ox, y + 38, nm, 34, TXT, ak, "B", "lm", bg=PANEL)
        text(d, 260 + ox, y + 78, sub, 26, MUTED, ak, "R", "lm", bg=PANEL)
        rect(d, 1310 + ox, y + 28, 1750 + ox, y + 80, fill=mix(col, 0.18, PANEL), outline=col, width=2, r=26, a=ak, bg=PANEL)
        text(d, 1530 + ox, y + 54, aa, 26, col, ak, "S", "mm", bg=mix(col, 0.18, PANEL))
    caps = [(0, "Mọi trường hợp giảm oxy máu đều quy về một (hoặc vài) trong 5 cơ chế này."),
            (6.0, "Hai câu hỏi phân định: Chênh áp A–a có tăng không? Và PaO₂ có cải thiện khi cho thở O₂ 100% không?")]
    caption(d, caps, t, T)


def sc_hypo(d, t, T):
    header(d, "05", "Giảm thông khí phế nang", fi(t, 0))
    a = fi(t, 0.3, 0.8)
    alveolus(d, 620, 410, 160, t, a, "hypo", o2n=12, co2n=7)
    legend(d, 1560, 140, a)
    # gauges
    k = ease((t - 2.0) / 4.0)
    paco2 = 40 + 40 * k
    pao2 = 150 - paco2 / 0.8
    ag = fi(t, 1.2)
    rect(d, 1040, 200, 1800, 760, fill=PANEL, outline=LINE, r=22, a=ag)
    text(d, 1080, 250, "Phương trình khí phế nang", 30, AMBER, ag, "B", bg=PANEL)
    text(d, 1080, 310, "PAO₂ = PIO₂ − PaCO₂ / R", 40, TXT, ag, "B", bg=PANEL)
    text(d, 1080, 360, "PIO₂ ≈ 150 mmHg (khí trời) · R ≈ 0,8", 26, MUTED, ag, "R", bg=PANEL)
    for j, (lab, val, mx, col) in enumerate([("PaCO₂", paco2, 100, CO2), ("PAO₂", pao2, 120, O2)]):
        y = 450 + j * 140
        text(d, 1080, y, lab, 32, col, ag, "B", bg=PANEL)
        rect(d, 1240, y - 18, 1700, y + 18, fill=(36, 50, 74), r=18, a=ag, bg=PANEL)
        rect(d, 1240, y - 18, 1240 + 460 * val / mx, y + 18, fill=col, r=18, a=ag, bg=PANEL)
        text(d, 1720, y, f"{val:.0f}", 32, TXT, ag, "B", "lm", bg=PANEL)
    text(d, 1080, 700, "PaCO₂ tăng gấp đôi → PAO₂ giảm còn một nửa", 28, TXT, fi(t, 6.2) * ag, "S", bg=PANEL)
    caps = [(0, "Thông khí phế nang giảm: CO₂ ứ lại trong phế nang và chiếm chỗ của O₂."),
            (5.0, "Giảm oxy máu do giảm thông khí luôn đi kèm tăng PaCO₂, chênh áp A–a bình thường, và đáp ứng tốt với O₂."),
            (10.5, "Ví dụ: quá liều opioid, an thần, bệnh thần kinh – cơ.")]
    caption(d, caps, t, T)


def sc_vq(d, t, T):
    header(d, "06", "Bất xứng thông khí / tưới máu (V/Q)", fi(t, 0))
    legend(d, 100, 150, fi(t, 0.2))
    units = [(270, "dead", "V/Q = ∞", "Khoảng chết", "thuyên tắc phổi", CO2),
             (730, "normal", "V/Q ≈ 0,8–1", "Bình thường", "", GREEN),
             (1190, "low", "V/Q thấp", "Thông khí kém", "hen, COPD, viêm phổi", AMBER),
             (1650, "shunt", "V/Q = 0", "Shunt", "ARDS, xẹp phổi, phù phổi", O2)]
    for k, (x, mode, vq, nm, ex, col) in enumerate(units):
        ak = fi(t, 0.5 + k * 1.3, 0.8)
        alveolus(d, x, 370, 100, t, ak, mode, o2n=8, co2n=5)
        text(d, x, 600, vq, 34, col, ak, "B", "ma")
        text(d, x, 645, nm, 28, TXT, ak, "S", "ma")
        if ex:
            text(d, x, 685, ex, 24, MUTED, ak, "R", "ma")
    # spectrum bar
    ab = fi(t, 6.0)
    for j in range(60):
        c = lerpc(CO2, GREEN, j / 30) if j < 30 else lerpc(GREEN, O2, (j - 30) / 30)
        rect(d, 270 + j * (1380 / 60), 745, 270 + (j + 1) * (1380 / 60) + 1, 757, fill=c, r=0, a=ab)
    text(d, 270, 780, "thông khí lãng phí", 24, MUTED, ab, "R", "la")
    text(d, 1650, 780, "máu không được oxy hoá", 24, MUTED, ab, "R", "ra")
    caps = [(0, "Mỗi phế nang cần thông khí (V) và tưới máu (Q) tương xứng. Lệch về một phía thì trao đổi khí kém hiệu quả."),
            (6.5, "V/Q thấp là nguyên nhân giảm oxy máu thường gặp nhất. Máu từ vùng V/Q cao không thể ‘bù’ vì Hb đã gần bão hoà."),
            (12.5, "V/Q cao (khoảng chết) chủ yếu làm tăng công thở và có thể gây tăng CO₂ — đặc biệt trong COPD và thuyên tắc phổi.")]
    caption(d, caps, t, T)


def chart_axes(d, x0, y0, x1, y1, a, xt, yt, xlab, ylab, bg=PANEL):
    line(d, [(x0, y0), (x0, y1), (x1, y1)], MUTED, 2, a, bg)
    for v, s in xt:
        X = x0 + (x1 - x0) * v
        line(d, [(X, y1), (X, y1 + 8)], MUTED, 2, a, bg)
        text(d, X, y1 + 16, s, 22, MUTED, a, "R", "ma", bg)
    for v, s in yt:
        Y = y1 - (y1 - y0) * v
        line(d, [(x0 - 8, Y), (x0, Y)], MUTED, 2, a, bg)
        line(d, [(x0, Y), (x1, Y)], (34, 48, 70), 1, a, bg)
        text(d, x0 - 14, Y, s, 22, MUTED, a, "R", "rm", bg)
    text(d, (x0 + x1) / 2, y1 + 50, xlab, 24, TXT, a, "S", "ma", bg)
    text(d, x0, y0 - 30, ylab, 24, TXT, a, "S", "lm", bg)


def sc_shunt(d, t, T):
    header(d, "07", "Shunt — vì sao thở oxy ít hiệu quả?", fi(t, 0))
    a = fi(t, 0.3)
    # left: mixing diagram on bg
    rect(d, 100, 170, 880, 800, fill=PANEL, outline=LINE, r=22, a=a)
    text(d, 490, 210, "Pha trộn máu", 30, AMBER, a, "B", "mm", bg=PANEL)
    my = 480
    # paths
    line(d, [(160, my), (300, my), (380, 350), (620, 350), (700, my), (840, my)], VEN, 22, a, PANEL)
    line(d, [(160, my), (300, my), (380, 610), (620, 610), (700, my), (840, my)], VEN, 22, a, PANEL)
    line(d, [(380, 350), (620, 350)], ART, 22, a, PANEL)
    line(d, [(700, my), (840, my)], lerpc(VEN, ART, 0.45), 22, a, PANEL)
    circle(d, 500, 285, 54, fill=(28, 50, 78), outline=(150, 190, 225), width=3, a=a, bg=PANEL)
    text(d, 500, 285, "O₂ ↑", 24, TXT, a, "S", "mm", bg=(28, 50, 78))
    circle(d, 500, 675, 54, fill=(52, 84, 120), outline=(150, 190, 225), width=3, a=a, bg=PANEL)
    text(d, 500, 675, "dịch", 24, TXT, a, "S", "mm", bg=(52, 84, 120))
    text(d, 500, 395, "SaO₂ 100% (đã tối đa)", 24, TXT, a, "S", "ma", bg=PANEL)
    text(d, 500, 745, "SvO₂ ~75% (không đổi)", 24, MUTED, a, "S", "ma", bg=PANEL)
    text(d, 780, 520, "→ SaO₂ thấp", 24, O2, fi(t, 2.5) * a, "B", "ma", bg=PANEL)
    for i in range(10):
        ph = (REAL_T / 3.0 + i / 10) % 1
        pts = [(160, my), (300, my), (380, 350 if i % 2 == 0 else 610), (620, 350 if i % 2 == 0 else 610), (700, my), (840, my)]
        x, y = along(pts, ph)
        col = ART if (i % 2 == 0 and ph > 0.33) else VEN
        if ph > 0.82:
            col = lerpc(VEN, ART, 0.45)
        circle(d, x, y, 9, fill=lerpc(col, (255, 255, 255), 0.25), a=a, bg=PANEL)
    # right: chart PaO2 vs FiO2
    ac = fi(t, 3.0)
    rect(d, 960, 170, 1820, 800, fill=PANEL, outline=LINE, r=22, a=ac)
    x0, y0, x1, y1 = 1080, 260, 1760, 690
    chart_axes(d, x0, y0, x1, y1, ac, [(0, "21%"), (0.5, "60%"), (1, "100%")],
               [(0, "0"), (0.25, "150"), (0.5, "300"), (0.75, "450"), (1, "600")], "FiO₂", "PaO₂ (mmHg)")
    prog = ease((t - 4.0) / 5.0)
    curves = [("V/Q thấp", GREEN, lambda f: 60 + 470 * f ** 1.1),
              ("Shunt 30%", AMBER, lambda f: 55 + 120 * f ** 1.5),
              ("Shunt 50%", O2, lambda f: 50 + 30 * f ** 2)]
    for j, (nm, col, fn) in enumerate(curves):
        n = max(2, int(60 * prog))
        pts = [(x0 + (x1 - x0) * (s / 59), y1 - (y1 - y0) * fn(s / 59) / 600) for s in range(n)]
        if prog > 0.02:
            line(d, pts, col, 5, ac, PANEL)
            lx, ly = pts[-1]
            text(d, lx - 6, ly - 10, nm, 24, col, ac * fi(t, 8.5), "B", "rb", bg=PANEL)
    text(d, 1790, 200, "minh hoạ định tính", 20, MUTED, ac, "I", "ra", bg=PANEL)
    caps = [(0, "Shunt: máu đi qua vùng phổi hoàn toàn không được thông khí, rồi trộn vào máu động mạch."),
            (4.5, "Tăng FiO₂ chỉ làm giàu O₂ ở phế nang đã thông khí — mà máu ở đó vốn đã bão hoà. Máu shunt không hề tiếp xúc với O₂."),
            (11.0, "Shunt lớn (> 30%) gần như kháng trị với O₂ → cần mở phế nang: PEEP, tư thế nằm sấp, điều trị nguyên nhân.")]
    caption(d, caps, t, T)


def sc_diff(d, t, T):
    header(d, "08", "Rối loạn khuếch tán", fi(t, 0))
    a = fi(t, 0.3, 0.8)
    alveolus(d, 520, 400, 150, t, a, "thick", o2n=10, co2n=6)
    text(d, 520, 700, "màng dày lên (xơ phổi, bệnh mô kẽ)", 26, AMBER, fi(t, 1.5), "S", "ma")
    ac = fi(t, 2.0)
    rect(d, 960, 170, 1820, 800, fill=PANEL, outline=LINE, r=22, a=ac)
    text(d, 1000, 215, "PO₂ mao mạch theo thời gian máu đi qua", 28, TXT, ac, "B", bg=PANEL)
    x0, y0, x1, y1 = 1080, 300, 1760, 680
    chart_axes(d, x0, y0, x1, y1, ac, [(0, "0"), (1 / 3, "0,25"), (2 / 3, "0,5"), (1, "0,75 s")],
               [(0, "40"), (0.5, "70"), (1, "100")], "thời gian (giây)", "PO₂")
    prog = ease((t - 3.0) / 4.0)

    def yv(v):
        return y1 - (y1 - y0) * (v - 40) / 60

    n = max(2, int(80 * prog))
    norm = [(x0 + (x1 - x0) * s / 79, yv(100 - 60 * math.exp(-(s / 79) * 12))) for s in range(n)]
    abn = [(x0 + (x1 - x0) * s / 79, yv(100 - 60 * math.exp(-(s / 79) * 2.6))) for s in range(n)]
    if prog > 0.02:
        line(d, norm, GREEN, 5, ac, PANEL)
        line(d, abn, AMBER, 5, ac, PANEL)
        text(d, norm[-1][0] - 4, norm[-1][1] - 14, "bình thường", 24, GREEN, ac * fi(t, 6.5), "B", "rb", bg=PANEL)
        text(d, abn[-1][0] - 4, abn[-1][1] + 14, "màng dày", 24, AMBER, ac * fi(t, 6.5), "B", "rt", bg=PANEL)
    ae = fi(t, 8.0)
    X = x0 + (x1 - x0) / 3
    for yy in range(int(y0), int(y1), 22):
        line(d, [(X, yy), (X, yy + 11)], O2, 3, ae * ac, PANEL)
    text(d, X + 10, y1 - 12, "gắng sức: máu chỉ còn ~0,25 s", 22, O2, ae * ac, "S", "lb", bg=PANEL)
    caps = [(0, "Định luật Fick: lượng khí khuếch tán tỉ lệ với diện tích màng và chênh áp, tỉ lệ nghịch với độ dày màng."),
            (6.0, "Lúc nghỉ, dự trữ thời gian vẫn đủ để cân bằng. Khi gắng sức, máu đi nhanh hơn → không kịp cân bằng → giảm oxy máu."),
            (11.5, "Vì vậy rối loạn khuếch tán hiếm khi đơn độc gây giảm oxy máu nặng lúc nghỉ.")]
    caption(d, caps, t, T)


def sc_aa(d, t, T):
    header(d, "09", "Chênh áp A–a: phân định cơ chế", fi(t, 0))
    a = fi(t, 0.3)
    rect(d, 100, 160, 880, 800, fill=PANEL, outline=LINE, r=22, a=a)
    text(d, 140, 210, "Ví dụ (khí trời, mực nước biển)", 28, AMBER, a, "B", bg=PANEL)
    lines_ = [("PAO₂ = FiO₂ × (760 − 47) − PaCO₂/0,8", TXT, 30, "S", 0.6),
              ("= 0,21 × 713 − 40/0,8", MUTED, 30, "M", 1.6),
              ("= 150 − 50 ≈ 100 mmHg", TXT, 30, "S", 2.5),
              ("Khí máu: PaO₂ = 55 mmHg", O2, 30, "S", 3.6),
              ("A–a = 100 − 55 = 45 mmHg ↑", AMBER, 36, "B", 4.6),
              ("Bình thường ≈ tuổi/4 + 4 (thường < 15–20)", MUTED, 26, "R", 5.6)]
    for k, (s, c, sz, w, st) in enumerate(lines_):
        text(d, 140, 290 + k * 82, s, sz, c, fi(t, st) * a, w, bg=PANEL)
    # flowchart
    af = fi(t, 7.0)
    bx = lambda x0, y0, x1, y1, s, col, al: (
        rect(d, x0, y0, x1, y1, fill=mix(col, 0.16), outline=col, width=2, r=14, a=al),
        [text(d, (x0 + x1) / 2, (y0 + y1) / 2 - (len(s) - 1) * 17 + i * 34, l, 25, TXT, al, "S", "mm", bg=mix(col, 0.16))
         for i, l in enumerate(s)])
    bx(1120, 170, 1600, 240, ["PaO₂ giảm"], TXT, af)
    a1 = fi(t, 8.0)
    arrow(d, 1250, 245, 1100, 330, MUTED, 3, a1, 14)
    arrow(d, 1470, 245, 1620, 330, MUTED, 3, a1, 14)
    bx(930, 335, 1290, 425, ["A–a bình thường"], GREEN, a1)
    bx(1440, 335, 1800, 425, ["A–a tăng"], AMBER, a1)
    a2 = fi(t, 9.2)
    arrow(d, 1110, 430, 1110, 500, MUTED, 3, a2, 14)
    bx(930, 505, 1290, 615, ["Giảm thông khí (PaCO₂↑)", "hoặc giảm PIO₂"], GREEN, a2)
    a3 = fi(t, 10.4)
    arrow(d, 1620, 430, 1620, 500, MUTED, 3, a3, 14)
    bx(1440, 505, 1800, 575, ["Thử O₂ 100%"], AMBER, a3)
    a4 = fi(t, 11.4)
    arrow(d, 1540, 580, 1450, 650, MUTED, 3, a4, 14)
    arrow(d, 1700, 580, 1760, 650, MUTED, 3, a4, 14)
    bx(1310, 655, 1610, 765, ["cải thiện tốt:", "V/Q, khuếch tán"], AMBER, a4)
    bx(1630, 655, 1860, 765, ["kém:", "shunt"], O2, a4)
    caps = [(0, "So sánh O₂ ‘đáng lẽ có’ trong phế nang với O₂ thực có trong máu động mạch — khoảng chênh lớn nghĩa là bộ trao đổi khí có vấn đề."),
            (7.5, "Lưu ý: chênh áp A–a tăng theo tuổi và theo FiO₂ — chỉ đáng tin nhất khi bệnh nhân thở khí trời.")]
    caption(d, caps, t, T)


def sc_co2(d, t, T):
    header(d, "10", "Suy hô hấp tăng CO₂ (Type II)", fi(t, 0))
    a = fi(t, 0.3)
    text(d, 960, 190, "PaCO₂ = 0,863 × VCO₂ / VA", 60, TXT, a, "X", "mm")
    text(d, 960, 260, "VA = f × (VT − VD)", 40, AMBER, fi(t, 1.3), "B", "mm")
    cards = [("↑ Sinh CO₂ (VCO₂)", ["sốt, nhiễm khuẩn", "co giật, run", "dinh dưỡng nhiều glucid"], O2),
             ("↓ Thông khí phút", ["giảm drive: opioid, an thần", "TK–cơ: GBS, nhược cơ, ALS", "thành ngực: gù vẹo, béo phì"], CO2),
             ("↑ Khoảng chết VD/VT", ["COPD, thuyên tắc phổi", "thở nhanh – nông", "ARDS giai đoạn muộn"], VIOLET)]
    for k, (nm, rows, col) in enumerate(cards):
        ak = fi(t, 2.4 + k * 0.9)
        x = 140 + k * 560
        rect(d, x, 330, x + 520, 600, fill=PANEL, outline=col, width=3, r=20, a=ak)
        text(d, x + 30, 378, nm, 32, col, ak, "B", "lm", bg=PANEL)
        for j, r_ in enumerate(rows):
            text(d, x + 30, 440 + j * 50, "• " + r_, 27, TXT, ak, "M", "lm", bg=PANEL)
    # shallow breathing example
    ae = fi(t, 7.5)
    rect(d, 140, 640, 1780, 830, fill=PANEL, outline=LINE, r=20, a=ae)
    text(d, 180, 680, "Cùng thông khí phút 6 L/phút, VD = 150 mL:", 28, TXT, ae, "S", "lm", bg=PANEL)
    text(d, 180, 740, "12 × 500 mL  →  VA = 12 × 350 = 4,2 L", 32, GREEN, fi(t, 8.5) * ae, "B", "lm", bg=PANEL)
    text(d, 180, 795, "30 × 200 mL  →  VA = 30 × 50  = 1,5 L", 32, O2, fi(t, 9.5) * ae, "B", "lm", bg=PANEL)
    text(d, 1740, 768, "Thở nhanh nông ≠ thông khí tốt", 28, AMBER, fi(t, 10.5) * ae, "B", "rm", bg=PANEL)
    caps = [(0, "PaCO₂ phản ánh cân bằng giữa lượng CO₂ cơ thể sinh ra và thông khí phế nang thải đi."),
            (7.0, "Thông khí phút có thể bình thường mà thông khí phế nang vẫn thấp — vì khoảng chết ‘ăn’ mất phần lớn mỗi nhịp thở.")]
    caption(d, caps, t, T)


def sc_cycle(d, t, T):
    header(d, "11", "Vòng xoắn bệnh lý: mỏi cơ hô hấp", fi(t, 0))
    cx, cy, R = 960, 470, 300
    nodes = ["Tăng tải hô hấp\n(co thắt, ↓ độ giãn nở, auto-PEEP)",
             "↑ Công thở\n↑ tiêu thụ O₂ cơ hô hấp",
             "Mỏi cơ hô hấp",
             "Thở nhanh – nông\n↑ VD/VT",
             "↑ PaCO₂, ↓ PaO₂",
             "Toan máu, ↓ cung cấp O₂\n→ cơ co kém hơn"]
    n = len(nodes)
    pos = [(cx + R * 1.55 * math.cos(-math.pi / 2 + 2 * math.pi * k / n), cy + R * math.sin(-math.pi / 2 + 2 * math.pi * k / n)) for k in range(n)]
    for k in range(n):
        ak = fi(t, 0.6 + k * 0.9)
        x0, y0 = pos[k]
        x1, y1 = pos[(k + 1) % n]
        an = fi(t, 1.1 + k * 0.9)
        dx, dy = x1 - x0, y1 - y0
        L = math.hypot(dx, dy)
        sx, sy = x0 + dx / L * 150, y0 + dy / L * 70
        ex, ey = x1 - dx / L * 150, y1 - dy / L * 70
        if k < n - 1 or t > 6.5:
            arrow(d, sx, sy, ex, ey, O2 if k >= 2 else MUTED, 4, an if k < n - 1 else fi(t, 6.5), 16, prog=an if k < n - 1 else fi(t, 6.5, 1.0))
    for k in range(n):
        ak = fi(t, 0.6 + k * 0.9)
        x, y = pos[k]
        ls = nodes[k].split("\n")
        wd = max(tlen(l, 26, "S") for l in ls) + 50
        hh = 40 + 36 * len(ls)
        col = AMBER if k == 2 else LINE
        rect(d, x - wd / 2, y - hh / 2, x + wd / 2, y + hh / 2, fill=PANEL, outline=col, width=3 if k == 2 else 2, r=16, a=ak)
        for i, l in enumerate(ls):
            text(d, x, y - (len(ls) - 1) * 18 + i * 36, l, 26 if i == 0 else 22, TXT if i == 0 else MUTED, ak, "S" if i == 0 else "R", "mm", bg=PANEL)
    # travelling pulse
    if t > 7:
        ph = ((t - 7) / 4.0) % 1
        seg = int(ph * n)
        f = ph * n - seg
        x0, y0 = pos[seg]
        x1, y1 = pos[(seg + 1) % n]
        circle(d, x0 + (x1 - x0) * f, y0 + (y1 - y0) * f, 10, fill=AMBER, a=0.9)
    ac = fi(t, 9.5)
    text(d, cx, cy - 18, "Cắt vòng xoắn", 30, GREEN, ac, "B", "mm")
    text(d, cx, cy + 22, "NIV / thở máy · giảm tải · điều trị nguyên nhân", 22, TXT, ac, "M", "mm")
    caps = [(0, "Suy hô hấp không đứng yên — nó tự nuôi dưỡng chính nó."),
            (5.0, "Khi tải vượt quá sức chịu của cơ hô hấp, bệnh nhân chuyển từ thở nhanh, co kéo, sang thở chậm, nông — dấu hiệu sắp ngừng thở."),
            (11.0, "Hỗ trợ thông khí giúp cơ hô hấp nghỉ ngơi và phá vỡ vòng xoắn trong lúc chờ điều trị nguyên nhân.")]
    caption(d, caps, t, T)


def sc_conseq(d, t, T):
    header(d, "12", "Hậu quả toàn thân", fi(t, 0))
    ac = fi(t, 0.3)
    rect(d, 100, 160, 860, 800, fill=PANEL, outline=LINE, r=22, a=ac)
    text(d, 140, 205, "Đường cong phân ly HbO₂", 28, AMBER, ac, "B", bg=PANEL)
    x0, y0, x1, y1 = 220, 310, 800, 690
    chart_axes(d, x0, y0, x1, y1, ac, [(0, "0"), (0.25, "25"), (0.5, "50"), (0.6, "60"), (0.75, "75"), (1, "100")],
               [(0, "0"), (0.5, "50"), (0.9, "90"), (1, "100")], "PaO₂ (mmHg)", "SaO₂ (%)")
    prog = ease((t - 1.0) / 3.0)
    hill = lambda P: P ** 2.7 / (P ** 2.7 + 26.8 ** 2.7)
    n = max(2, int(100 * prog))
    pts = [(x0 + (x1 - x0) * (s / 99), y1 - (y1 - y0) * hill(max(0.1, s / 99 * 100))) for s in range(n)]
    if prog > 0.02:
        line(d, pts, O2, 5, ac, PANEL)
    am = fi(t, 4.5)
    X = x0 + (x1 - x0) * 0.6
    Y = y1 - (y1 - y0) * hill(60)
    circle(d, X, Y, 12, fill=AMBER, a=am * ac, bg=PANEL)
    text(d, X + 20, Y + 30, "60 mmHg ≈ 90%", 26, AMBER, am * ac, "B", "lt", bg=PANEL)
    text(d, 470, 560, "dưới ngưỡng này,", 22, TXT, am * ac, "M", "la", bg=PANEL)
    text(d, 470, 592, "SaO₂ rơi rất nhanh", 22, TXT, am * ac, "M", "la", bg=PANEL)
    items = [("Thiếu oxy mô", "chuyển hoá yếm khí → lactate ↑ → toan chuyển hoá", O2),
             ("Co mạch phổi do thiếu oxy", "↑ áp lực động mạch phổi → quá tải thất phải", VIOLET),
             ("Tăng CO₂ → toan hô hấp", "giãn mạch não → ↑ áp lực nội sọ, lơ mơ, hôn mê", CO2),
             ("Hoạt hoá giao cảm", "nhịp nhanh, tăng huyết áp, vã mồ hôi; muộn: loạn nhịp", AMBER)]
    for k, (nm, sub, col) in enumerate(items):
        ak = fi(t, 6.0 + k * 1.3)
        y = 170 + k * 158
        rect(d, 920, y, 1820, y + 138, fill=PANEL, outline=col, width=2, r=18, a=ak)
        rect(d, 920, y, 932, y + 138, fill=col, r=6, a=ak, bg=PANEL)
        text(d, 960, y + 46, nm, 32, TXT, ak, "B", "lm", bg=PANEL)
        para(d, 960, y + 76, sub, 25, 820, MUTED, ak, "R", bg=PANEL)
    caps = [(0, "Đường cong phân ly giải thích vì sao PaO₂ 60 mmHg là ngưỡng định nghĩa: dưới đó lượng O₂ chở theo máu tụt dốc."),
            (7.0, "Não, tim và thận chịu thiếu oxy kém nhất. Rối loạn ý thức là dấu hiệu nặng ở cả suy type I lẫn type II.")]
    caption(d, caps, t, T)


def sc_sum(d, t, T):
    header(d, "13", "Tóm tắt", fi(t, 0))
    pts = [("Hai bộ phận, hai kiểu suy", "Bộ trao đổi khí hỏng → Type I (↓PaO₂). Bơm thông khí hỏng → Type II (↑PaCO₂).", AMBER),
           ("5 cơ chế giảm oxy máu", "↓PIO₂, giảm thông khí, bất xứng V/Q, shunt, rối loạn khuếch tán.", O2),
           ("Hai câu hỏi phân định", "Chênh áp A–a có tăng? PaO₂ có cải thiện khi thở O₂ 100%?", GREEN),
           ("PaCO₂ = k × VCO₂ / VA", "Tăng CO₂ khi sinh nhiều, thông khí giảm, hoặc khoảng chết tăng.", CO2),
           ("Vòng xoắn mỏi cơ", "Nhận diện sớm, hỗ trợ thông khí, điều trị nguyên nhân.", VIOLET)]
    for k, (h, s, col) in enumerate(pts):
        ak = fi(t, 0.5 + k * 1.2)
        y = 140 + k * 148
        rect(d, 160, y, 1760, y + 128, fill=PANEL, outline=LINE, r=18, a=ak)
        circle(d, 230, y + 64, 30, fill=col, a=ak, bg=PANEL)
        text(d, 230, y + 64, str(k + 1), 30, BG, ak, "B", "mm", bg=col)
        text(d, 290, y + 42, h, 34, TXT, ak, "B", "lm", bg=PANEL)
        text(d, 290, y + 90, s, 27, MUTED, ak, "M", "lm", bg=PANEL)
    text(d, 1840, 82, "Tham khảo: West's Respiratory Physiology · Harrison's Principles of Internal Medicine",
         20, MUTED, fi(t, 7.0), "R", "rm")


import json
from narr import NARR
FNS = [sc_title, sc_def, sc_two, sc_normal, sc_five, sc_hypo, sc_vq, sc_shunt, sc_diff, sc_aa, sc_co2,
       sc_cycle, sc_conseq, sc_sum]
TIMING = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "timing.json")))
# thời điểm (theo thời gian hoạt hình gốc) mà nội dung của từng câu bắt đầu xuất hiện
KEYS = [[0], [0.0, 1.6, 3.2, 8.0], [0.3, 3.5, 5.5, 8.0], [0.0, 2.5, 4.3], [0.3, 0.8, 2.6, 5.4],
        [0.0, 1.2, 6.2, 9.0], [0.0, 0.4, 2.9, 5.8], [0.2, 2.4, 3.8, 9.2], [0.0, 1.4, 7.8, 12.0],
        [0.0, 0.5, 3.5, 6.8, 12.0], [0.2, 2.3, 3.2, 4.1, 7.3, 10.3], [0.0, 0.5, 7.0, 9.3],
        [0.3, 6.0, 8.5, 11.0], [0.4, 1.6, 4.0, 5.2]]
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
